import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '@database/drizzle.module';
import { conversations, conversionEvents } from '@database/schema';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(wsId: string, params: { status?: string; from?: string; to?: string; page: number; limit: number }) {
    const conditions = [eq(conversations.workspaceId, wsId)];
    if (params.status) conditions.push(eq(conversations.status, params.status));
    if (params.from) conditions.push(gte(conversations.firstMessageAt, new Date(params.from)));
    if (params.to) conditions.push(lte(conversations.firstMessageAt, new Date(params.to)));

    const data = await this.db.query.conversations.findMany({
      where: and(...conditions),
      with: { attributionRecords: true },
      orderBy: desc(conversations.firstMessageAt),
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
    });

    return { data, page: params.page, limit: params.limit };
  }

  async findOne(wsId: string, id: string) {
    const conv = await this.db.query.conversations.findFirst({
      where: and(eq(conversations.id, id), eq(conversations.workspaceId, wsId)),
      with: { attributionRecords: true, events: true },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async update(wsId: string, id: string, data: { status?: string; revenue?: number; currency?: string; tags?: string[] }) {
    const [updated] = await this.db.update(conversations)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(conversations.id, id), eq(conversations.workspaceId, wsId)))
      .returning();
    if (!updated) throw new NotFoundException('Conversation not found');
    return updated;
  }

  async createEvent(wsId: string, conversationId: string, userId: string, data: {
    eventType: string; eventValue?: number; currency?: string; metadata?: Record<string, unknown>;
  }) {
    const [event] = await this.db.insert(conversionEvents).values({
      workspaceId: wsId,
      conversationId,
      eventType: data.eventType,
      eventValue: data.eventValue?.toString(),
      currency: data.currency,
      metadata: data.metadata,
      createdBy: userId,
    }).returning();

    // If this is a conversion event with value, update conversation revenue
    if (data.eventValue && data.eventType === 'sale_closed') {
      await this.db.update(conversations)
        .set({ status: 'converted', revenue: data.eventValue.toString(), updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));
    }

    return event;
  }
}
