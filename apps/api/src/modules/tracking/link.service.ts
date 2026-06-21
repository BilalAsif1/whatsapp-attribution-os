import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'uuid';
import { DRIZZLE, type DrizzleDB } from '@database/drizzle.module';
import { trackingLinks } from '@database/schema';
import { CreateTrackingLinkDto, UpdateTrackingLinkDto } from './dto';

function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

@Injectable()
export class LinkService {
  private readonly logger = new Logger(LinkService.name);

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(workspaceId: string, dto: CreateTrackingLinkDto) {
    const shortCode = generateShortCode();
    const [link] = await this.db.insert(trackingLinks).values({
      workspaceId,
      name: dto.name,
      shortCode,
      destinationUrl: dto.destinationUrl,
      utmSource: dto.utmSource,
      utmMedium: dto.utmMedium,
      utmCampaign: dto.utmCampaign,
      utmContent: dto.utmContent,
      utmTerm: dto.utmTerm,
    }).returning();
    return link;
  }

  async findAll(workspaceId: string) {
    return this.db.query.trackingLinks.findMany({
      where: eq(trackingLinks.workspaceId, workspaceId),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
  }

  async findOne(workspaceId: string, id: string) {
    const link = await this.db.query.trackingLinks.findFirst({
      where: and(eq(trackingLinks.id, id), eq(trackingLinks.workspaceId, workspaceId)),
    });
    if (!link) throw new NotFoundException('Tracking link not found');
    return link;
  }

  async update(workspaceId: string, id: string, dto: UpdateTrackingLinkDto) {
    const [updated] = await this.db.update(trackingLinks)
      .set(dto)
      .where(and(eq(trackingLinks.id, id), eq(trackingLinks.workspaceId, workspaceId)))
      .returning();
    if (!updated) throw new NotFoundException('Tracking link not found');
    return updated;
  }

  async remove(workspaceId: string, id: string) {
    const [deleted] = await this.db.delete(trackingLinks)
      .where(and(eq(trackingLinks.id, id), eq(trackingLinks.workspaceId, workspaceId)))
      .returning();
    if (!deleted) throw new NotFoundException('Tracking link not found');
  }
}
