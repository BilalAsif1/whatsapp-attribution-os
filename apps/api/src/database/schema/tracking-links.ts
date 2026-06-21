import { pgTable, uuid, varchar, text, boolean, integer, timestamptz, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './workspaces';

export const trackingLinks = pgTable('tracking_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  shortCode: varchar('short_code', { length: 20 }).notNull().unique(),
  destinationUrl: text('destination_url').notNull(),
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 200 }),
  utmContent: varchar('utm_content', { length: 200 }),
  utmTerm: varchar('utm_term', { length: 200 }),
  isActive: boolean('is_active').default(true),
  clickCount: integer('click_count').default(0),
  createdAt: timestamptz('created_at').defaultNow(),
}, (table) => ({
  workspaceIdx: index('idx_links_workspace').on(table.workspaceId),
  shortCodeIdx: index('idx_links_shortcode').on(table.shortCode),
}));

export const trackingLinksRelations = relations(trackingLinks, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [trackingLinks.workspaceId],
    references: [workspaces.id],
  }),
}));
