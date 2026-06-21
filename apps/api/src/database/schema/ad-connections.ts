import { pgTable, uuid, text, varchar, timestamp, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './workspaces';

export const adConnections = pgTable('ad_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  platform: varchar('platform', { length: 20 }).notNull(),
  accountId: text('account_id').notNull(),
  accountName: text('account_name'),
  accessTokenEnc: text('access_token_enc').notNull(),
  refreshTokenEnc: text('refresh_token_enc'),
  tokenExpiresAt: timestamp('token_expires_at'),
  conversionActionId: text('conversion_action_id'),
  status: varchar('status', { length: 10 }).default('active'),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueConnection: unique().on(table.workspaceId, table.platform, table.accountId),
}));

export const adConnectionsRelations = relations(adConnections, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [adConnections.workspaceId],
    references: [workspaces.id],
  }),
}));
