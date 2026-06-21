import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { eq, and, sql } from 'drizzle-orm';
import Redis from 'ioredis';
import { DRIZZLE, type DrizzleDB } from '@database/drizzle.module';
import { REDIS } from '@common/redis/redis.module';
import { clicks, conversations, whatsappAccounts, attributionRecords } from '@database/schema';
import { extractUidFromMessage, hashPhone, detectAdPlatform } from '@wao/shared';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    @Inject(REDIS) private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  async processWebhook(body: unknown, signature: string): Promise<void> {
    const payload = body as Record<string, unknown>;

    // Verify signature
    const appSecret = this.configService.getOrThrow('whatsapp.appSecret');
    const expectedSig = createHmac('sha256', appSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (signature && signature !== `sha256=${expectedSig}`) {
      this.logger.warn('Invalid webhook signature');
      return;
    }

    // Parse WhatsApp Cloud API webhook payload
    const entry = (payload.entry as Array<Record<string, unknown>>)?.[0];
    if (!entry) return;

    const changes = (entry.changes as Array<Record<string, unknown>>)?.[0];
    if (!changes || changes.field !== 'messages') return;

    const value = changes.value as Record<string, unknown>;
    const messages = value.messages as Array<Record<string, unknown>> | undefined;
    if (!messages?.length) return;

    const metadata = value.metadata as { phone_number_id: string };
    const phoneNumberId = metadata.phone_number_id;

    for (const message of messages) {
      await this.processMessage(phoneNumberId, message);
    }
  }

  private async processMessage(phoneNumberId: string, message: Record<string, unknown>) {
    const messageId = message.id as string;
    const from = message.from as string; // sender phone
    const timestamp = message.timestamp as string;
    const type = message.type as string;

    // Dedup check
    const deduped = await this.redis.set(`dedup:wa:${messageId}`, '1', 'EX', 86400, 'NX');
    if (!deduped) return;

    // Find WhatsApp account
    const account = await this.db.query.whatsappAccounts.findFirst({
      where: eq(whatsappAccounts.phoneNumberId, phoneNumberId),
    });
    if (!account) {
      this.logger.warn(`No WhatsApp account found for phone_number_id: ${phoneNumberId}`);
      return;
    }

    // Extract UID from message text
    let messageText = '';
    if (type === 'text') {
      messageText = (message.text as Record<string, string>)?.body || '';
    }

    const uid = extractUidFromMessage(messageText);
    const encryptionKey = this.configService.getOrThrow('app.encryptionKey');
    const phoneHash = hashPhone(from, encryptionKey);

    // Check if conversation already exists for this phone
    const existingConv = await this.db.query.conversations.findFirst({
      where: and(
        eq(conversations.workspaceId, account.workspaceId),
        eq(conversations.contactPhoneHash, phoneHash),
      ),
    });

    if (existingConv) {
      // Update existing conversation
      await this.db.update(conversations)
        .set({
          messageCount: sql`${conversations.messageCount} + 1`,
          lastMessageAt: new Date(parseInt(timestamp) * 1000),
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, existingConv.id));
      return;
    }

    // New conversation — try to match to a click via UID
    let matchedClickId: string | undefined;
    let matchedClick: typeof clicks.$inferSelect | undefined;

    if (uid) {
      // Look up click by UID
      matchedClick = await this.db.query.clicks.findFirst({
        where: eq(clicks.uid, uid),
      }) as typeof clicks.$inferSelect | undefined;

      if (matchedClick) {
        matchedClickId = matchedClick.id;
        // Mark click as matched
        await this.db.update(clicks)
          .set({ matched: true, matchedAt: new Date() })
          .where(eq(clicks.id, matchedClick.id));
      }
    }

    // Create conversation
    // Simple encryption — in production use a proper crypto module
    const contactPhoneEnc = Buffer.from(from).toString('base64');

    const [conversation] = await this.db.insert(conversations).values({
      workspaceId: account.workspaceId,
      whatsappAccountId: account.id,
      contactPhoneHash: phoneHash,
      contactPhoneEnc,
      contactName: (message.contacts as Array<{ profile: { name: string } }>)?.[0]?.profile?.name,
      clickId: matchedClickId,
      uid,
      status: 'new',
      firstMessageAt: new Date(parseInt(timestamp) * 1000),
      lastMessageAt: new Date(parseInt(timestamp) * 1000),
    }).returning();

    this.logger.log(`New conversation ${conversation!.id} for workspace ${account.workspaceId}${uid ? ` (matched UID: ${uid})` : ' (unattributed)'}`);

    // If we matched a click, create an attribution record
    if (matchedClick && conversation) {
      const platform = detectAdPlatform({
        gclid: matchedClick.gclid ?? undefined,
        fbclid: matchedClick.fbclid ?? undefined,
        ttclid: matchedClick.ttclid ?? undefined,
        msclkid: matchedClick.msclkid ?? undefined,
        li_fat_id: matchedClick.liFatId ?? undefined,
      });

      if (platform) {
        await this.db.insert(attributionRecords).values({
          workspaceId: account.workspaceId,
          conversationId: conversation.id,
          clickId: matchedClick.id,
          adPlatform: platform,
          campaignName: matchedClick.utmCampaign,
          attributionModel: 'last_touch',
          uploadStatus: matchedClick.gclid ? 'pending' : 'skipped',
        });

        this.logger.log(`Attribution record created: ${platform} → conversation ${conversation.id}`);
      }
    }
  }
}
