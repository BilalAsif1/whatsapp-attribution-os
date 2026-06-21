import { pgTable, uuid, varchar, decimal, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { conversations } from './conversations';

export const conversionEvents = pgTable('conversion_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  eventValue: decimal('event_value', { precision: 12, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  metadata: jsonb('metadata').default({}),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  conversationIdx: index('idx_events_conversation').on(table.conversationId),
  workspaceIdx: index('idx_events_workspace').on(table.workspaceId, table.createdAt),
}));

export const conversionEventsRelations = relations(conversionEvents, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversionEvents.conversationId],
    references: [conversations.id],
  }),
}));
