import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { eq, and, inArray } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '@database/drizzle.module';
import { attributionRecords, clicks, adConnections } from '@database/schema';
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
      with: { click: true, conversation: true },
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

    const conversions = pendingRecords
      .filter((r) => r.click?.gclid)
      .map((r) => ({
        gclid: r.click!.gclid!,
        conversionValue: Number(r.conversation?.revenue ?? 0),
        conversionTime: r.createdAt,
      }));

    if (conversions.length > 0) {
      await this.googleAdsService.uploadOfflineConversions(workspaceId, conversions);
    }

    this.logger.log(`Uploaded ${conversions.length} conversions for workspace ${workspaceId}`);
  }
}
