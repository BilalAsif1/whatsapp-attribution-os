#!/bin/bash
set -euo pipefail

# Coolify deployment script for WhatsApp Attribution OS
# Run on Hetzner CX32 VPS via Coolify's deploy hook

echo "==> Running database migrations..."
cd /app && node -e "
  const { drizzle } = require('drizzle-orm/node-postgres');
  const { migrate } = require('drizzle-orm/node-postgres/migrator');
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  migrate(db, { migrationsFolder: './drizzle' }).then(() => {
    console.log('Migrations complete');
    pool.end();
  });
"

echo "==> Seeding plans..."
node dist/database/seed.js || true

echo "==> Deploy complete"
