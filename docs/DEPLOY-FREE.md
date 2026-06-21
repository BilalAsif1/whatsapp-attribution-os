# Zero-Cost Deployment Guide

Deploy WhatsApp Attribution OS for **$0/month** using free tiers.

| Service | Provider | Free Tier |
|---|---|---|
| Frontend | Vercel | Unlimited deploys, edge CDN, custom domain |
| API | Render | 750h/mo, auto-sleep after 15min idle |
| Database | Neon | PostgreSQL 16, 0.5GB storage, always-on |
| Redis | Upstash | 10,000 commands/day, 256MB, REST API |

---

## Step 1: Create a GitHub Repository

```bash
cd whatsapp-attribution-os
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-attribution-os.git
git push -u origin main
```

---

## Step 2: Provision Neon Database (Free)

1. Go to [neon.tech](https://neon.tech/) → Sign up
2. Create a new project → name: `wao`
3. Copy the connection string — looks like:
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this as your `DATABASE_URL`

---

## Step 3: Provision Upstash Redis (Free)

1. Go to [upstash.com](https://upstash.com/) → Sign up
2. Create a Redis database → region: same as Neon
3. Copy the Redis URL — looks like:
   ```
   rediss://default:xxx@us1-xxx.upstash.io:6379
   ```
4. Save this as your `REDIS_URL`

---

## Step 4: Deploy API on Render (Free)

1. Go to [render.com](https://render.com/) → Sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your `whatsapp-attribution-os` repository
4. Configure:
   - **Name:** `wao-api`
   - **Root Directory:** (leave empty — monorepo root)
   - **Runtime:** Node
   - **Build Command:** `pnpm install && pnpm --filter @wao/shared build && pnpm --filter @wao/api build`
   - **Start Command:** `node apps/api/dist/main.js`
   - **Plan:** Free
5. Add environment variables:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(from Neon)* |
| `REDIS_URL` | *(from Upstash)* |
| `APP_URL` | `https://your-app.vercel.app` *(fill after Vercel deploy)* |
| `API_URL` | `https://wao-api.onrender.com` *(your Render URL)* |
| `BETTER_AUTH_SECRET` | *(generate: `openssl rand -hex 32`)* |
| `PHONE_HASH_SALT` | *(generate: `openssl rand -hex 16`)* |
| `ENCRYPTION_KEY` | *(generate: `openssl rand -hex 32`)* |
| `WHATSAPP_VERIFY_TOKEN` | *(any string you choose)* |
| `WHATSAPP_APP_SECRET` | *(from Meta Developer Console)* |
| `STRIPE_SECRET_KEY` | `sk_test_xxxx` *(from Stripe dashboard)* |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxxx` *(from Stripe webhook setup)* |
| `RESEND_API_KEY` | `re_xxxx` *(from Resend dashboard)* |

6. Click **Create Web Service**
7. Note the URL: `https://wao-api.onrender.com`

### Run Migrations (After First Deploy)

Open the Render **Shell** tab and run:

```bash
node -e "
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const db = drizzle(pool);
migrate(db, { migrationsFolder: './apps/api/drizzle' }).then(() => { console.log('done'); pool.end(); });
"
```

Then seed plans:

```bash
node apps/api/dist/database/seed.js
```

---

## Step 5: Deploy Frontend on Vercel (Free)

1. Go to [vercel.com](https://vercel.com/) → Sign up with GitHub
2. Click **Import Project** → select `whatsapp-attribution-os`
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `cd ../.. && pnpm install && pnpm --filter @wao/shared build && pnpm --filter @wao/web build`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && pnpm install`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://wao-api.onrender.com`
5. Click **Deploy**
6. Note the URL: `https://your-app.vercel.app`

### Update Render API with Vercel URL

Go back to Render → your `wao-api` service → Environment → update:
- `APP_URL` = `https://your-app.vercel.app`

This ensures CORS allows your frontend origin.

---

## Step 6: Configure Webhooks

### Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint: `https://wao-api.onrender.com/api/v1/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy signing secret → update `STRIPE_WEBHOOK_SECRET` in Render

### WhatsApp Cloud API Webhook

1. Go to [Meta Developer Console](https://developers.facebook.com/)
2. Your app → WhatsApp → Configuration
3. Webhook URL: `https://wao-api.onrender.com/api/v1/webhooks/whatsapp`
4. Verify token: same as `WHATSAPP_VERIFY_TOKEN` in Render
5. Subscribe to `messages` field

---

## Free Tier Limitations

| Service | Limitation | Impact | Mitigation |
|---|---|---|---|
| Render | Spins down after 15min idle | First request after idle takes ~30s | Use [UptimeRobot](https://uptimerobot.com/) (free) to ping `/api/v1/health` every 14 min |
| Neon | 0.5GB storage | ~100K click records | Archive old data monthly |
| Upstash | 10K commands/day | ~200 tracked clicks/day | Sufficient for early-stage |
| Vercel | 100GB bandwidth/mo | ~1M page loads | More than enough |

### Keep Render Awake (Free)

1. Go to [uptimerobot.com](https://uptimerobot.com/) → Sign up (free)
2. Add HTTP(s) monitor:
   - URL: `https://wao-api.onrender.com/api/v1/health`
   - Interval: 5 minutes
3. This prevents the free instance from sleeping

---

## Verification Checklist

After deployment, verify:

- [ ] `https://wao-api.onrender.com/api/v1/health` returns `{"status":"ok"}`
- [ ] `https://your-app.vercel.app` loads the landing page
- [ ] `https://your-app.vercel.app/register` creates an account
- [ ] `https://your-app.vercel.app/login` signs in
- [ ] Dashboard loads at `/overview`
- [ ] Swagger docs at `https://wao-api.onrender.com/api/docs`

---

## Upgrading Later

When you're ready to scale beyond free tiers:

| Upgrade Path | Cost | Benefit |
|---|---|---|
| Render Starter | $7/mo | No sleep, faster builds |
| Neon Launch | $19/mo | 10GB storage, autoscaling compute |
| Upstash Pay-as-you-go | ~$2/mo | 200K commands/day |
| Hetzner CX32 (self-hosted) | $8/mo | Full control, no limits |
| **Total scaled** | **~$28/mo** | Production-ready for 1000+ businesses |
