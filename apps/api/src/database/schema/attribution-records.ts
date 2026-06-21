import { pgTable, uuid, text, varchar, decimal, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { conversations } from './conversations';

export const attributionRecords = pgTable('attribution_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  clickId: uuid('click_id').notNull(),
  adPlatform: varchar('ad_platform', { length: 20 }).notNull(),
  campaignId: text('campaign_id'),
  campaignName: text('campaign_name'),
  adGroupId: text('ad_group_id'),
  adGroupName: text('ad_group_name'),
  keyword: text('keyword'),
  matchType: varchar('match_type', { length: 10 }),
  attributionModel: varchar('attribution_model', { length: 20 }).default('last_touch'),
  conversionValue: decimal('conversion_value', { precision: 12, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  uploadStatus: varchar('upload_status', { length: 20 }).default('pending'),
  uploadError: text('upload_error'),
  uploadedAt: timestamp('uploaded_at'),
  attributedAt: timestamp('attributed_at').defaultNow(),
}, (table) => ({
  workspaceIdx: index('idx_attr_workspace').on(table.workspaceId, table.attributedAt),
  uploadIdx: index('idx_attr_upload').on(table.uploadStatus),
  platformIdx: index('idx_attr_platform').on(table.workspaceId, table.adPlatform),
}));

export const attributionRecordsRelations = relations(attributionRecords, ({ one }) => ({
  conversation: one(conversations, {
    fields: [attributionRecords.conversationId],
    references: [conversations.id],
  }),
}));
