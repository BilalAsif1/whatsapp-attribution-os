import { pgTable, uuid, text, varchar, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  userId: text('user_id'),
  action: varchar('action', { length: 50 }).notNull(),
  resourceType: varchar('resource_type', { length: 30 }).notNull(),
  resourceId: uuid('resource_id'),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('idx_audit_workspace').on(table.workspaceId, table.createdAt),
}));
