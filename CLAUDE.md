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


## Design workflow (Claude Design)

For UI / visual work on this project, the workflow is:

1. **Use Claude Design** at [claude.ai/design](https://claude.ai/design), not regular chat or Claude Code, for the design itself. It has the canvas, image-aware tooling, and Figma-equivalent export.
2. **Start with the prompt template** at `docs/design-prompts/00-default.md` so the design comes back on-brand and within constraints.
3. **Save the handoff bundle** as `design-bundles/<feature-slug>.json` and commit it.
4. **Hand to Claude Code** with: `implement design-bundles/<feature-slug>.json`. Claude Code reads the bundle as the design source of truth and implements against the codebase.

Claude Code agents: when a user mentions "claude design" or asks for a UI redesign without a bundle present, point them at `docs/design-prompts/00-default.md` and claude.ai/design before writing any UI code.
