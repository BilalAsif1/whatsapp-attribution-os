import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { plans } from './schema/plans';

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('Seeding plans...');
  await db.insert(plans).values([
    {
      id: 'starter',
      name: 'Starter',
      stripePriceIdMonthly: 'price_starter_monthly',
      stripePriceIdYearly: 'price_starter_yearly',
      workspaceLimit: 1,
      priceCents: 2900,
      features: { googleAds: true, metaAds: false, ai: false, whitelabel: false },
    },
    {
      id: 'growth',
      name: 'Growth',
      stripePriceIdMonthly: 'price_growth_monthly',
      stripePriceIdYearly: 'price_growth_yearly',
      workspaceLimit: 5,
      priceCents: 7900,
      features: { googleAds: true, metaAds: true, ai: false, whitelabel: false },
    },
    {
      id: 'agency',
      name: 'Agency',
      stripePriceIdMonthly: 'price_agency_monthly',
      stripePriceIdYearly: 'price_agency_yearly',
      workspaceLimit: 25,
      priceCents: 14900,
      features: { googleAds: true, metaAds: true, ai: true, whitelabel: true },
    },
  ]).onConflictDoNothing();

  console.log('Seed complete.');
  await pool.end();
}

seed().catch(console.error);
