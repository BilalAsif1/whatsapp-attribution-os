import { pgTable, uuid, date, integer, unique } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';

export const usageRecords = pgTable('usage_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  clicks: integer('clicks').default(0),
  conversations: integer('conversations').default(0),
  conversions: integer('conversions').default(0),
  apiCalls: integer('api_calls').default(0),
}, (table) => ({
  uniquePeriod: unique().on(table.workspaceId, table.periodStart),
}));
