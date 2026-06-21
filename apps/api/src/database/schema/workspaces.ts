import { pgTable, uuid, varchar, text, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { workspaceMembers } from './workspace-members';
import { whatsappAccounts } from './whatsapp-accounts';
import { adConnections } from './ad-connections';
import { trackingLinks } from './tracking-links';

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  ownerId: text('owner_id').notNull(),
  settings: jsonb('settings').default({
    timezone: 'UTC',
    currency: 'USD',
    attributionWindowDays: 30,
  }),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  subscriptionStatus: varchar('subscription_status', { length: 20 }).default('trialing'),
  plan: varchar('plan', { length: 20 }).default('starter'),
  trialEndsAt: timestamp('trial_ends_at').default(sql`NOW() + INTERVAL '14 days'`),
  workspaceCountLimit: integer('workspace_count_limit').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(workspaceMembers),
  whatsappAccounts: many(whatsappAccounts),
  adConnections: many(adConnections),
  trackingLinks: many(trackingLinks),
}));
