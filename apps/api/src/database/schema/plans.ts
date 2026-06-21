import { pgTable, varchar, text, integer, jsonb } from 'drizzle-orm/pg-core';

export const plans = pgTable('plans', {
  id: varchar('id', { length: 20 }).primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  stripePriceIdMonthly: text('stripe_price_id_monthly').notNull(),
  stripePriceIdYearly: text('stripe_price_id_yearly'),
  workspaceLimit: integer('workspace_limit').notNull(),
  priceCents: integer('price_cents').notNull(),
  features: jsonb('features').default({}),
});
