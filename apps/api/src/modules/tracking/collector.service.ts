import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { createHash } from 'crypto';
import Redis from 'ioredis';
import { DRIZZLE, type DrizzleDB } from '@database/drizzle.module';
import { REDIS } from '@common/redis/redis.module';
import { clicks, trackingLinks } from '@database/schema';
import { generateUid } from '@wao/shared';

interface ProcessClickParams {
  shortCode: string;
  clickIds: Record<string, string | undefined>;
  utm: Record<string, string | undefined>;
  userAgent: string;
  ip: string;
  referer: string;
}

interface ScriptClickParams {
  workspaceId: string;
  uid: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  msclkid?: string;
  li_fat_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landingPage?: string;
  referer?: string;
  userAgent: string;
  ip: string;
}

@Injectable()
export class CollectorService {
  private readonly logger = new Logger(CollectorService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  async processClick(params: ProcessClickParams): Promise<string> {
    const cached = await this.redis.get(`cache:link:${params.shortCode}`);
    let link: { id: string; workspaceId: string; destinationUrl: string;
      utmSource: string | null; utmMedium: string | null; utmCampaign: string | null;
      utmContent: string | null; utmTerm: string | null };

    if (cached) {
      link = JSON.parse(cached);
    } else {
      const found = await this.db.query.trackingLinks.findFirst({
        where: eq(trackingLinks.shortCode, params.shortCode),
      });
      if (!found || !found.isActive) throw new NotFoundException('Tracking link not found');
      link = found as typeof link;
      await this.redis.set(`cache:link:${params.shortCode}`, JSON.stringify(link), 'EX', 3600);
    }

    const uid = generateUid();
    const ipHash = createHash('sha256').update(params.ip).digest('hex');

    await this.db.insert(clicks).values({
      workspaceId: link.workspaceId,
      trackingLinkId: link.id,
      uid,
      gclid: params.clickIds.gclid,
      fbclid: params.clickIds.fbclid,
      ttclid: params.clickIds.ttclid,
      msclkid: params.clickIds.msclkid,
      liFatId: params.clickIds.li_fat_id,
      utmSource: params.utm.source || link.utmSource,
      utmMedium: params.utm.medium || link.utmMedium,
      utmCampaign: params.utm.campaign || link.utmCampaign,
      utmContent: params.utm.content || link.utmContent,
      utmTerm: params.utm.term || link.utmTerm,
      ipHash,
      userAgent: params.userAgent,
      referer: params.referer,
    });

    // Store UID → click mapping in Redis for fast webhook lookup
    await this.redis.set(`uid:${uid}`, link.workspaceId, 'EX', 86400 * 30);

    // Increment click count
    await this.db.update(trackingLinks)
      .set({ clickCount: sql`${trackingLinks.clickCount} + 1` })
      .where(eq(trackingLinks.id, link.id));

    // Append UID to WhatsApp deeplink pre-filled text
    const separator = link.destinationUrl.includes('?') ? '&' : '?';
    const textParam = `text=${encodeURIComponent(`Ref: ${uid}`)}`;
    return `${link.destinationUrl}${separator}${textParam}`;
  }

  async recordClickFromScript(params: ScriptClickParams) {
    const ipHash = createHash('sha256').update(params.ip).digest('hex');

    await this.db.insert(clicks).values({
      workspaceId: params.workspaceId,
      uid: params.uid,
      gclid: params.gclid,
      fbclid: params.fbclid,
      ttclid: params.ttclid,
      msclkid: params.msclkid,
      liFatId: params.li_fat_id,
      utmSource: params.utm_source,
      utmMedium: params.utm_medium,
      utmCampaign: params.utm_campaign,
      utmContent: params.utm_content,
      utmTerm: params.utm_term,
      ipHash,
      userAgent: params.userAgent,
      landingPage: params.landingPage,
      referer: params.referer,
    });

    await this.redis.set(`uid:${params.uid}`, params.workspaceId, 'EX', 86400 * 30);

    return { success: true, uid: params.uid };
  }
}
