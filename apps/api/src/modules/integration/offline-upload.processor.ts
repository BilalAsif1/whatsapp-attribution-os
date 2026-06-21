import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { eq, and, inArray } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '@database/drizzle.module';
import { attributionRecords, clicks, conversations, adConnections } from '@database/schema';
import { GoogleAdsService } from './google-ads.service';

interface OfflineUploadJobData {
  workspaceId: string;
}

@Processor('offline-upload')
export class OfflineUploadProcessor extends WorkerHost {
  private readonly logger = new Logger(OfflineUploadProcessor.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly googleAdsService: GoogleAdsService,
  ) {
    super();
  }

  async process(job: Job<OfflineUploadJobData>) {
    const { workspaceId } = job.data;
    this.logger.log(`Processing offline upload for workspace ${workspaceId}`);

    const pendingRecords = await this.db.query.attributionRecords.findMany({
      where: and(
        eq(attributionRecords.workspaceId, workspaceId),
        eq(attributionRecords.uploadStatus, 'queued'),
        eq(attributionRecords.adPlatform, 'google_ads'),
      ),
    });

    if (pendingRecords.length === 0) {
      this.logger.log(`No pending records for workspace ${workspaceId}`);
      return;
    }

    const connection = await this.db.query.adConnections.findFirst({
      where: and(
        eq(adConnections.workspaceId, workspaceId),
        eq(adConnections.platform, 'google_ads'),
      ),
    });

    if (!connection) {
      this.logger.warn(`No Google Ads connection for workspace ${workspaceId}`);
      const ids = pendingRecords.map((r) => r.id);
      await this.db.update(attributionRecords)
        .set({ uploadStatus: 'skipped' })
        .where(inArray(attributionRecords.id, ids));
      return;
    }

    const uploadData: Array<{ gclid: string; conversionValue: number; conversionTime: Date }> = [];

    for (const record of pendingRecords) {
      const click = await this.db.query.clicks.findFirst({
        where: eq(clicks.id, record.clickId),
      });
      if (!click?.gclid) continue;

      const conversation = await this.db.query.conversations.findFirst({
        where: eq(conversations.id, record.conversationId),
      });

      uploadData.push({
        gclid: click.gclid,
        conversionValue: Number(conversation?.revenue ?? 0),
        conversionTime: new Date(),
      });
    }

    if (uploadData.length > 0) {
      await this.googleAdsService.uploadOfflineConversions(workspaceId, uploadData);
    }

    this.logger.log(`Uploaded ${uploadData.length} conversions for workspace ${workspaceId}`);
  }
}
