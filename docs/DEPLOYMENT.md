# Deployment Guide

Production deployment of WhatsApp Attribution OS on Hetzner VPS with Coolify.

## Infrastructure Overview

| Component | Service | Cost |
|---|---|---|
| VPS | Hetzner CX32 (4 vCPU, 8 GB RAM, 80 GB NVMe) | $8/mo |
| DNS/CDN/WAF | Cloudflare Pro | $20/mo |
| Backups | Cloudflare R2 (10 GB free) | $0 |
| Monitoring | Better Stack + Sentry (free tiers) | $0 |
| Email | Resend (100 emails/day free) | $0 |
| SSL | Cloudflare (automatic) | $0 |
| Orchestration | Coolify (self-hosted) | $0 |
| **Total** | | **$28/mo** + domain |

## Step 1: Provision Hetzner VPS

1. Create a Hetzner account at [hetzner.com](https://www.hetzner.com/)
2. Create a CX32 server:
   - Location: Nearest to your primary user base
   - Image: Ubuntu 24.04
   - SSH key: Add your public key
3. Note the server IP address

## Step 2: Install Coolify

SSH into the server and run:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Access Coolify at `http://YOUR_SERVER_IP:8000` and complete the setup wizard.

## Step 3: Configure Cloudflare

1. Add your domain to Cloudflare
2. Point DNS records:
   - `A` record: `app.yourdomain.com` → server IP (proxied)
   - `A` record: `api.yourdomain.com` → server IP (proxied)
3. SSL/TLS: Set to "Full (strict)"
4. Enable WAF rules for API protection

## Step 4: Deploy via Coolify

### Add the Git repository

1. In Coolify, go to **Projects** → **New Resource** → **Docker Compose**
2. Connect your GitHub repo
3. Set compose file path: `infra/docker/docker-compose.prod.yml`

### Set environment variables

Add all required environment variables from [ENVIRONMENT.md](ENVIRONMENT.md) in Coolify's environment panel.

Critical production values:

```env
NODE_ENV=production
DATABASE_URL=postgresql://wao:STRONG_PASSWORD@postgres:5432/wao
REDIS_URL=redis://redis:6379
APP_URL=https://app.yourdomain.com
API_URL=https://api.yourdomain.com
BETTER_AUTH_SECRET=<generate with: openssl rand -hex 32>
PHONE_HASH_SALT=<generate with: openssl rand -hex 16>
ENCRYPTION_KEY=<generate with: openssl rand -hex 32>
DB_PASSWORD=<generate with: openssl rand -base64 24>
```

### Configure domains

In Coolify, map:
- `api` service → `api.yourdomain.com`
- `web` service → `app.yourdomain.com`

Coolify handles Let's Encrypt SSL certificates automatically.

### Deploy

Click **Deploy** in Coolify. It will:
1. Build Docker images using the multi-stage Dockerfiles
2. Start PostgreSQL and Redis
3. Start the API and Web services
4. Run health checks

### Run migrations (first deploy only)

```bash
docker exec -it <api-container> sh -c "node -e \"
  const { drizzle } = require('drizzle-orm/node-postgres');
  const { migrate } = require('drizzle-orm/node-postgres/migrator');
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  migrate(db, { migrationsFolder: './drizzle' }).then(() => {
    console.log('Migrations complete');
    pool.end();
  });
\""
```

Seed the plans table:

```bash
docker exec -it <api-container> node dist/database/seed.js
```

## Step 5: Configure Webhooks

### WhatsApp Cloud API Webhook

1. Go to [Meta Developer Console](https://developers.facebook.com/)
2. Select your app → WhatsApp → Configuration
3. Set webhook URL: `https://api.yourdomain.com/api/v1/webhooks/whatsapp`
4. Set verify token: same as `WHATSAPP_VERIFY_TOKEN` env var
5. Subscribe to `messages` field

### Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://api.yourdomain.com/api/v1/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET` env var

## Step 6: Set Up Monitoring

### Sentry

1. Create a project at [sentry.io](https://sentry.io/)
2. Copy DSN to `SENTRY_DSN` env var

### Better Stack

1. Create a source at [betterstack.com](https://betterstack.com/)
2. Copy token to `BETTERSTACK_SOURCE_TOKEN` env var
3. Create an uptime monitor for `https://api.yourdomain.com/api/v1/health`

## Step 7: Backups

The `backup` service in `docker-compose.prod.yml` automatically:
- Takes daily PostgreSQL backups
- Retains 7 daily, 4 weekly, and 6 monthly backups

For offsite backups to Cloudflare R2, add a cron job:

```bash
# /etc/cron.daily/wao-backup-offsite
#!/bin/bash
aws s3 sync /var/lib/docker/volumes/backup_data/_data/ \
  s3://wao-backups/ \
  --endpoint-url https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

## Scaling Triggers

| Metric | Threshold | Action |
|---|---|---|
| CPU sustained | > 80% for 15 min | Upgrade to CX42 ($16/mo) |
| PostgreSQL connections | > 80 | Add PgBouncer |
| Redis memory | > 100 MB | Review TTLs and eviction policy |
| Disk usage | > 70% | Expand volume or archive old data |
| Response latency p95 | > 500ms | Add materialized views or read replica |

## Rollback

Coolify maintains the previous deployment. To rollback:

1. Go to Coolify → your project → **Deployments**
2. Click **Rollback** on the previous successful deployment

Database migrations should be backwards-compatible. If a migration needs rollback:

```bash
docker exec -it <api-container> npx drizzle-kit drop
```
