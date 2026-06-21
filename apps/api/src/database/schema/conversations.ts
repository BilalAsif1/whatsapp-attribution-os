import { pgTable, uuid, text, varchar, decimal, integer, smallint, timestamptz, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './workspaces';
import { whatsappAccounts } from './whatsapp-accounts';
import { conversionEvents } from './conversion-events';
import { attributionRecords } from './attribution-records';

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id),
  whatsappAccountId: uuid('whatsapp_account_id').notNull().references(() => whatsappAccounts.id),
  contactPhoneHash: varchar('contact_phone_hash', { length: 64 }).notNull(),
  contactPhoneEnc: text('contact_phone_enc').notNull(),
  contactName: text('contact_name'),
  clickId: uuid('click_id'),
  uid: varchar('uid', { length: 20 }),
  status: varchar('status', { length: 20 }).default('new'),
  revenue: decimal('revenue', { precision: 12, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  messageCount: integer('message_count').default(1),
  firstMessageAt: timestamptz('first_message_at').notNull(),
  lastMessageAt: timestamptz('last_message_at'),
  leadScore: smallint('lead_score'),
  tags: text('tags').array().default([]),
  customFields: jsonb('custom_fields').default({}),
  createdAt: timestamptz('created_at').defaultNow(),
  updatedAt: timestamptz('updated_at').defaultNow(),
}, (table) => ({
  workspaceIdx: index('idx_conv_workspace').on(table.workspaceId, table.createdAt),
  statusIdx: index('idx_conv_status').on(table.workspaceId, table.status),
  uidIdx: index('idx_conv_uid').on(table.uid),
  phoneIdx: index('idx_conv_phone').on(table.workspaceId, table.contactPhoneHash),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [conversations.workspaceId],
    references: [workspaces.id],
  }),
  whatsappAccount: one(whatsappAccounts, {
    fields: [conversations.whatsappAccountId],
    references: [whatsappAccounts.id],
  }),
  events: many(conversionEvents),
  attributionRecords: many(attributionRecords),
}));
