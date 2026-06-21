import { pgTable, uuid, text, varchar, timestamp, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './workspaces';

export const whatsappAccounts = pgTable('whatsapp_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  phoneNumberId: text('phone_number_id').notNull(),
  phoneNumber: text('phone_number').notNull(),
  wabaId: text('waba_id').notNull(),
  accessTokenEnc: text('access_token_enc').notNull(),
  webhookVerifyToken: text('webhook_verify_token').notNull(),
  status: varchar('status', { length: 10 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniquePhone: unique().on(table.workspaceId, table.phoneNumberId),
}));

export const whatsappAccountsRelations = relations(whatsappAccounts, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [whatsappAccounts.workspaceId],
    references: [workspaces.id],
  }),
}));
