# WhatsApp Attribution OS

Track every WhatsApp conversation back to the exact ad click, keyword, and campaign that started it. Upload offline conversions to Google Ads automatically.

## How It Works

1. **Capture the Click** — A lightweight JavaScript snippet on your landing page captures GCLID/UTM parameters and generates a unique tracking ID (e.g., `WAO-7X3K9`).
2. **Inject the UID** — The script appends `Ref: WAO-7X3K9` to every WhatsApp button's pre-filled message text. MutationObserver handles dynamically rendered buttons.
3. **Match the Message** — When the user sends the WhatsApp message, the Cloud API webhook receives it. Our backend extracts the UID via regex, matches it to the stored click record, and creates an attribution record.
4. **Upload the Conversion** — A BullMQ background job uploads offline conversions to Google Ads using the original GCLID, so your campaigns optimize for real revenue — not just clicks.

## Tech Stack

| Layer | Technology |
|---|---|
| API | NestJS 11, TypeScript, Drizzle ORM |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis 7, BullMQ |
| Auth | Better Auth (email/password, Google OAuth, TOTP 2FA, RBAC) |
| Frontend | Next.js 15, React 19, Tailwind CSS, ShadCN UI, Recharts |
| Billing | Stripe (checkout, portal, webhooks) |
| Email | Resend |
| Infrastructure | Hetzner CX32 VPS, Coolify, Cloudflare |

**Monthly cost: ~$31.50**

## Project Structure

```
whatsapp-attribution-os/
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── src/
│   │   │   ├── common/       # Guards, filters, decorators
│   │   │   ├── config/       # Environment config loaders
│   │   │   ├── database/     # Drizzle schema, module, seed
│   │   │   └── modules/      # Feature modules (10 total)
│   │   │       ├── auth/
│   │   │       ├── workspace/
│   │   │       ├── tracking/
│   │   │       ├── whatsapp/
│   │   │       ├── attribution/
│   │   │       ├── conversation/
│   │   │       ├── dashboard/
│   │   │       ├── integration/
│   │   │       ├── billing/
│   │   │       └── notification/
│   │   └── test/             # Unit + integration tests
│   └── web/                  # Next.js frontend
│       └── src/
│           ├── app/          # Pages (auth, dashboard, marketing)
│           ├── components/   # UI, layout, shared components
│           ├── hooks/        # TanStack Query hooks
│           ├── lib/          # API client, auth client, utils
│           └── stores/       # Zustand state management
├── packages/
│   └── shared/               # Types, constants, utilities
├── infra/
│   ├── docker/               # Dockerfiles, compose files
│   └── coolify/              # Deployment scripts
└── .github/workflows/        # CI/CD pipeline
```

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 9+
- Docker & Docker Compose

### 1. Clone and install

```bash
git clone https://github.com/your-org/whatsapp-attribution-os.git
cd whatsapp-attribution-os
pnpm install
```

### 2. Start infrastructure

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

This starts PostgreSQL 16 and Redis 7 locally.

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials. See [Environment Variables](docs/ENVIRONMENT.md) for the full reference.

### 4. Run database migrations

```bash
cd apps/api
pnpm drizzle-kit push
pnpm seed
```

### 5. Start development servers

```bash
# From root — starts both API and Web
pnpm dev
```

- API: http://localhost:4000 (Swagger: http://localhost:4000/api/docs)
- Web: http://localhost:3000

### 6. Run tests

```bash
pnpm --filter @wao/api test
```

## Deployment

See [Deployment Guide](docs/DEPLOYMENT.md) for production setup on Hetzner + Coolify.

## API Documentation

Interactive Swagger documentation is available at `/api/docs` when the API is running.

See [API Reference](docs/API.md) for endpoint details.

## Plans & Pricing

| Plan | Price | Clicks/mo | Conversations/mo | Workspaces |
|---|---|---|---|---|
| Starter | $29/mo | 500 | 100 | 1 |
| Growth | $79/mo | 5,000 | 1,000 | 5 |
| Agency | $149/mo | 25,000 | 5,000 | 25 |

## License

Proprietary. All rights reserved.
