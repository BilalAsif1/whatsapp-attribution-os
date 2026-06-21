# Environment Variables

All environment variables used by WhatsApp Attribution OS.

## Core

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |
| `PORT` | No | `4000` | API server port |
| `APP_URL` | Yes | — | Frontend URL (e.g., `https://app.yourdomain.com`) |
| `API_URL` | Yes | — | API URL (e.g., `https://api.yourdomain.com`) |

## Database

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `DB_POOL_MAX` | No | `20` | Maximum database pool connections |

## Redis

| Variable | Required | Default | Description |
|---|---|---|---|
| `REDIS_URL` | Yes | — | Redis connection string |

## Authentication

| Variable | Required | Default | Description |
|---|---|---|---|
| `BETTER_AUTH_SECRET` | Yes | — | Secret key for Better Auth session signing |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth client ID (for social login) |
| `GOOGLE_CLIENT_SECRET` | No | — | Google OAuth client secret |

## WhatsApp Cloud API

| Variable | Required | Default | Description |
|---|---|---|---|
| `WHATSAPP_VERIFY_TOKEN` | Yes | — | Token for webhook verification handshake |
| `WHATSAPP_APP_SECRET` | Yes | — | Meta app secret for HMAC signature verification |

## Google Ads Integration

| Variable | Required | Default | Description |
|---|---|---|---|
| `GOOGLE_ADS_CLIENT_ID` | No | — | Google Ads OAuth client ID |
| `GOOGLE_ADS_CLIENT_SECRET` | No | — | Google Ads OAuth client secret |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | No | — | Google Ads API developer token |

## Stripe Billing

| Variable | Required | Default | Description |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Yes | — | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | — | Stripe webhook endpoint signing secret |

## Email (Resend)

| Variable | Required | Default | Description |
|---|---|---|---|
| `RESEND_API_KEY` | Yes | — | Resend API key for transactional emails |
| `EMAIL_FROM` | No | `WAO <noreply@yourdomain.com>` | Default sender address |

## Security

| Variable | Required | Default | Description |
|---|---|---|---|
| `PHONE_HASH_SALT` | Yes | — | Salt for hashing phone numbers before storage |
| `ENCRYPTION_KEY` | Yes | — | Key for encrypting API tokens at rest |

## Monitoring (Optional)

| Variable | Required | Default | Description |
|---|---|---|---|
| `SENTRY_DSN` | No | — | Sentry error tracking DSN |
| `BETTERSTACK_SOURCE_TOKEN` | No | — | Better Stack log source token |

## Frontend-Specific

These are prefixed with `NEXT_PUBLIC_` and are exposed to the browser.

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:4000` | API base URL for frontend requests |
