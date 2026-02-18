# Relay CRM

Modern CRM with sequence automation, visual workflow builder, and a design system grounded in cognitive science research.

## Tech Stack

- **Framework:** Next.js 15+ (App Router, React 19)
- **Language:** TypeScript 5 (strict)
- **Database:** PostgreSQL 16 via Prisma 6
- **Styling:** Tailwind CSS 3.x + Radix UI
- **Workflow Canvas:** React Flow
- **Validation:** Zod everywhere
- **Testing:** Vitest (unit/integration) + Playwright (E2E)
- **Package Manager:** pnpm 9

## Project Structure

```
relay/
├── packages/
│   ├── web/        # Next.js frontend
│   ├── shared/     # Zod schemas, types, constants
│   └── db/         # Prisma schema, client, migrations
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local Postgres + Redis)

### Setup

```bash
# Install dependencies
pnpm install

# Start local services
docker compose up -d

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed the database
pnpm db:seed

# Start dev server
pnpm dev
```

### Running Tests

```bash
# Unit tests
pnpm test

# Integration tests (requires running Postgres)
pnpm test:integration

# E2E tests (starts dev server automatically)
pnpm test:e2e
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. See the file for required variables.
