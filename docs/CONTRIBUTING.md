# Contributing

## Development Setup

### Prerequisites

- Node.js 22+
- pnpm 9+
- Docker & Docker Compose
- Git

### Getting Started

```bash
git clone https://github.com/your-org/whatsapp-attribution-os.git
cd whatsapp-attribution-os
pnpm install
cp .env.example .env
docker compose -f infra/docker/docker-compose.yml up -d
cd apps/api && pnpm drizzle-kit push && pnpm seed
cd ../..
pnpm dev
```

### Project Structure

- `apps/api` — NestJS backend (port 4000)
- `apps/web` — Next.js frontend (port 3000)
- `packages/shared` — Shared types, constants, utilities
- `infra/` — Docker and deployment configuration

### Development Commands

```bash
# Start all dev servers
pnpm dev

# Run API only
pnpm --filter @wao/api dev

# Run Web only
pnpm --filter @wao/web dev

# Type check
pnpm --filter @wao/api typecheck
pnpm --filter @wao/web typecheck

# Run tests
pnpm --filter @wao/api test

# Format code
pnpm format

# Generate Drizzle migration
cd apps/api && pnpm drizzle-kit generate

# Push schema changes (dev only)
cd apps/api && pnpm drizzle-kit push
```

## Code Standards

### TypeScript

- Strict mode enabled across all packages
- No `any` types unless interfacing with untyped external APIs (annotate with `as any` and a comment)
- Use Zod for runtime validation at system boundaries

### API Conventions

- All routes versioned under `/api/v1/`
- Use NestJS decorators for validation, auth, and RBAC
- Return standardized error format from `HttpExceptionFilter`
- Public routes must use `@Public()` decorator

### Database

- Schema changes go through Drizzle migrations — never modify the database directly
- Use `eq()`, `and()`, `sql` from drizzle-orm for queries
- Index any column used in WHERE clauses or JOINs

### Frontend

- Pages in `app/` directory using Next.js App Router
- Client components marked with `'use client'`
- Data fetching via TanStack Query hooks in `hooks/use-api.ts`
- UI components follow ShadCN patterns in `components/ui/`

### Git

- Branch names: `feature/description`, `fix/description`, `chore/description`
- Commit messages: imperative mood, concise (`Add campaign stats endpoint`, not `Added campaign stats endpoint`)
- One feature per PR
- All PRs must pass CI (lint, typecheck, test, build)

## Architecture Decisions

Key design decisions are documented in `docs/ARCHITECTURE.md` under the Technology Decision Log section. If you're making a significant architectural change, add an entry there explaining the decision and rationale.
