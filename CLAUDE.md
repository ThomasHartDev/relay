# Relay CRM

Modern CRM with sequence automation, visual workflow builder, and cognitive-science-grounded design system.

## Tech Stack
- Next.js 15+ (App Router, React 19)
- TypeScript 5 (strict)
- PostgreSQL 16 via Prisma 6
- Tailwind CSS 3.x + Radix UI
- React Flow (workflow canvas)
- Zod everywhere
- Vitest + Playwright
- pnpm 9

## Monorepo Structure
- `packages/web/` — Next.js frontend
- `packages/shared/` — Zod schemas, types, constants
- `packages/db/` — Prisma schema, client, migrations

## Code Style
- TypeScript strict mode enforced
- Use `pnpm` for all package management
- Zod validation at every boundary
- camelCase for variables/functions, PascalCase for components/interfaces
- Prefer async/await over Promise chains
- Radix UI primitives for accessible components — do not reimplement standard UI patterns

## PR Review Guidelines

When reviewing PRs, focus on:
- CRM data integrity (contact dedup, sequence state machines, workflow transitions)
- Prisma query efficiency (N+1 queries, missing indexes, transaction usage)
- React Flow canvas performance (node count, edge rendering, viewport optimization)
- Sequence automation correctness (timing, retry logic, error states)
- Zod schema completeness (all API inputs validated, proper error messages)
- Accessibility (Radix UI usage, keyboard navigation, ARIA labels)
- Auth and authorization (route protection, data scoping per user/org)
- Email/notification side effects (idempotency, rate limiting)

Do NOT flag:
- Import ordering (handled by prettier)
- Minor style issues caught by ESLint

