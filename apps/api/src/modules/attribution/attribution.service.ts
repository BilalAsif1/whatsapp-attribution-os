import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '@database/drizzle.module';
import { attributionRecords, conversations } from '@database/schema';

@Injectable()
export class AttributionService {
  private readonly logger = new Logger(AttributionService.name);

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(wsId: string, params: { from?: string; to?: string; platform?: string; page: number; limit: number }) {
    const conditions = [eq(attributionRecords.workspaceId, wsId)];
    if (params.from) conditions.push(gte(attributionRecords.attributedAt, new Date(params.from)));
    if (params.to) conditions.push(lte(attributionRecords.attributedAt, new Date(params.to)));
    if (params.platform) conditions.push(eq(attributionRecords.adPlatform, params.platform));

    const records = await this.db.query.attributionRecords.findMany({
      where: and(...conditions),
      with: { conversation: true },
      orderBy: desc(attributionRecords.attributedAt),
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
    });

    return { data: records, page: params.page, limit: params.limit };
  }

  async getCampaignStats(wsId: string, from: string, to: string) {
    const result = await this.db
      .select({
        campaignId: attributionRecords.campaignId,
        campaignName: sql<string>`MAX(${attributionRecords.campaignName})`,
        adPlatform: attributionRecords.adPlatform,
        conversations: sql<number>`COUNT(DISTINCT ${attributionRecords.conversationId})`,
        conversions: sql<number>`COUNT(DISTINCT ${attributionRecords.conversationId}) FILTER (WHERE ${conversations.status} = 'converted')`,
        revenue: sql<number>`COALESCE(SUM(${conversations.revenue}), 0)`,
      })
      .from(attributionRecords)
      .leftJoin(conversations, eq(attributionRecords.conversationId, conversations.id))
      .where(and(
        eq(attributionRecords.workspaceId, wsId),
        gte(attributionRecords.attributedAt, new Date(from)),
        lte(attributionRecords.attributedAt, new Date(to)),
      ))
      .groupBy(attributionRecords.campaignId, attributionRecords.adPlatform);

    return result;
  }

  async getKeywordStats(wsId: string, from: string, to: string) {
    const result = await this.db
      .select({
        keyword: attributionRecords.keyword,
        conversations: sql<number>`COUNT(DISTINCT ${attributionRecords.conversationId})`,
        conversions: sql<number>`COUNT(DISTINCT ${attributionRecords.conversationId}) FILTER (WHERE ${conversations.status} = 'converted')`,
        revenue: sql<number>`COALESCE(SUM(${conversations.revenue}), 0)`,
      })
      .from(attributionRecords)
      .leftJoin(conversations, eq(attributionRecords.conversationId, conversations.id))
      .where(and(
        eq(attributionRecords.workspaceId, wsId),
        gte(attributionRecords.attributedAt, new Date(from)),
        lte(attributionRecords.attributedAt, new Date(to)),
        sql`${attributionRecords.keyword} IS NOT NULL`,
      ))
      .groupBy(attributionRecords.keyword);

    return result;
  }

  async triggerOfflineUpload(wsId: string, platform: string) {
    // Queue BullMQ job for offline upload
    // For now, mark records as queued
    const updated = await this.db.update(attributionRecords)
      .set({ uploadStatus: 'queued' })
      .where(and(
        eq(attributionRecords.workspaceId, wsId),
        eq(attributionRecords.adPlatform, platform),
        eq(attributionRecords.uploadStatus, 'pending'),
      ))
      .returning();

    this.logger.log(`Queued ${updated.length} records for offline upload to ${platform}`);
    return { queued: updated.length };
  }
}
