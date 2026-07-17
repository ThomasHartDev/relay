# Relay CRM

Modern CRM with sequence automation, visual workflow builder, and a design system grounded in cognitive science research.

## What this demonstrates

The interesting part of a CRM is the automation engine, and getting it right means treating time and delivery as first-class problems. Relay runs sequences and workflows on a real BullMQ job queue backed by Redis, so a delay actually delays and an email actually fires when it should instead of blocking a request. The worker package leans on a few ideas worth calling out: at-least-once delivery with idempotent consumers (deterministic job IDs so a retried trigger can't double-schedule), delayed jobs for step timing, bounded retries with exponential backoff for transient failures like a flaky SMTP host, and backpressure through a fixed worker concurrency. Everything crossing a boundary is validated with Zod, and job routing goes through a small handler registry rather than a switch chain.

## What's implemented

- **packages/db** — Prisma schema for contacts, companies, deals, sequences, and workflows, with a seeded local database.
- **packages/shared** — Zod schemas, workflow graph validation (cycle detection, topological sort, reachability), and sequence analytics.
- **packages/web** — Next.js app: CRM views, sequence editor, and a React Flow workflow builder.
- **packages/worker** — BullMQ queue on the declared Redis with two job types, `sequence-step` and `workflow-delay`, deterministic job IDs for idempotent scheduling, clamped delays, and a Zod-validated dispatcher.

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
│   ├── worker/     # BullMQ queue + background job processing
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

## Background Jobs

The worker package schedules and runs sequence steps and workflow delays on Redis. Register a handler per job type, then start a worker.

```ts
import {
  createConnection,
  createQueue,
  createWorker,
  enqueueSequenceStep,
  JobDispatcher,
  JOB_NAMES,
} from "@relay/worker";

const connection = createConnection(); // reads REDIS_URL
const queue = createQueue(connection);

// Schedule the next step for an enrollment, 30 minutes out.
await enqueueSequenceStep(queue, { enrollmentId, sequenceId, stepId }, 30 * 60 * 1000);

const dispatcher = new JobDispatcher()
  .on(JOB_NAMES.sequenceStep, async (payload) => {
    /* send the email, advance the enrollment */
  })
  .on(JOB_NAMES.workflowDelay, async (payload) => {
    /* resume the workflow execution from the delay node */
  });

createWorker(dispatcher, { connection });
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. See the file for required variables.
