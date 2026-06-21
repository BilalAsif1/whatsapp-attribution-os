import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, and, gte, lte, sql, count } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '@database/drizzle.module';
import { clicks, conversations, attributionRecords } from '@database/schema';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getOverview(wsId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const [clickStats] = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clicks)
      .where(and(eq(clicks.workspaceId, wsId), gte(clicks.clickedAt, fromDate), lte(clicks.clickedAt, toDate)));

    const convStats = await this.db
      .select({
        total: sql<number>`COUNT(*)`,
        converted: sql<number>`COUNT(*) FILTER (WHERE ${conversations.status} = 'converted')`,
        qualified: sql<number>`COUNT(*) FILTER (WHERE ${conversations.status} = 'qualified')`,
        revenue: sql<number>`COALESCE(SUM(${conversations.revenue}::numeric), 0)`,
      })
      .from(conversations)
      .where(and(eq(conversations.workspaceId, wsId), gte(conversations.firstMessageAt, fromDate), lte(conversations.firstMessageAt, toDate)));

    const totalClicks = clickStats?.count ?? 0;
    const totalConversations = convStats[0]?.total ?? 0;
    const totalConversions = convStats[0]?.converted ?? 0;
    const totalRevenue = convStats[0]?.revenue ?? 0;

    return {
      clicks: totalClicks,
      conversations: totalConversations,
      conversions: totalConversions,
      qualified: convStats[0]?.qualified ?? 0,
      revenue: totalRevenue,
      conversionRate: totalConversations > 0 ? (totalConversions / totalConversations) * 100 : 0,
      clickToChat: totalClicks > 0 ? (totalConversations / totalClicks) * 100 : 0,
    };
  }

  async getFunnel(wsId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const [clickCount] = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clicks)
      .where(and(eq(clicks.workspaceId, wsId), gte(clicks.clickedAt, fromDate), lte(clicks.clickedAt, toDate)));

    const statusCounts = await this.db
      .select({
        status: conversations.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(conversations)
      .where(and(eq(conversations.workspaceId, wsId), gte(conversations.firstMessageAt, fromDate), lte(conversations.firstMessageAt, toDate)))
      .groupBy(conversations.status);

    const statusMap = Object.fromEntries(statusCounts.map((s) => [s.status, s.count]));

    return {
      clicks: clickCount?.count ?? 0,
      chats: Object.values(statusMap).reduce<number>((a, b) => a + (b as number), 0),
      qualified: (statusMap.qualified ?? 0) + (statusMap.proposal_sent ?? 0) + (statusMap.converted ?? 0),
      converted: statusMap.converted ?? 0,
    };
  }

  async getTimeseries(wsId: string, from: string, to: string, granularity: 'hour' | 'day' | 'week') {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const truncFn = granularity === 'hour' ? 'hour' : granularity === 'week' ? 'week' : 'day';

    const clickSeries = await this.db
      .select({
        period: sql<string>`DATE_TRUNC('${sql.raw(truncFn)}', ${clicks.clickedAt})::text`,
        clicks: sql<number>`COUNT(*)`,
      })
      .from(clicks)
      .where(and(eq(clicks.workspaceId, wsId), gte(clicks.clickedAt, fromDate), lte(clicks.clickedAt, toDate)))
      .groupBy(sql`DATE_TRUNC('${sql.raw(truncFn)}', ${clicks.clickedAt})`)
      .orderBy(sql`DATE_TRUNC('${sql.raw(truncFn)}', ${clicks.clickedAt})`);

    const convSeries = await this.db
      .select({
        period: sql<string>`DATE_TRUNC('${sql.raw(truncFn)}', ${conversations.firstMessageAt})::text`,
        conversations: sql<number>`COUNT(*)`,
        conversions: sql<number>`COUNT(*) FILTER (WHERE ${conversations.status} = 'converted')`,
        revenue: sql<number>`COALESCE(SUM(${conversations.revenue}::numeric), 0)`,
      })
      .from(conversations)
      .where(and(eq(conversations.workspaceId, wsId), gte(conversations.firstMessageAt, fromDate), lte(conversations.firstMessageAt, toDate)))
      .groupBy(sql`DATE_TRUNC('${sql.raw(truncFn)}', ${conversations.firstMessageAt})`)
      .orderBy(sql`DATE_TRUNC('${sql.raw(truncFn)}', ${conversations.firstMessageAt})`);

    return { clicks: clickSeries, conversations: convSeries };
  }
}
