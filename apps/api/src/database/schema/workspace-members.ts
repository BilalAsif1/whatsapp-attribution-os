import { pgTable, uuid, text, varchar, timestamp, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './workspaces';

export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  role: varchar('role', { length: 10 }).notNull().default('viewer'),
  invitedBy: text('invited_by'),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => ({
  uniqueMember: unique().on(table.workspaceId, table.userId),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
}));
