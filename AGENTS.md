# AGENTS.md - TRUSTed Dispatching Command Center

## Repository

- Work only in this repository: `C:\Users\caleb\OneDrive\Documents\Owner Operator Assistant\owner-operator-assistant-main`.
- The parent folder contains a legacy static prototype and is not the active application.
- Preserve unrelated and pre-existing worktree changes. Never reset or clean the worktree without explicit Founder approval.
- Continue on the current focused branch unless the Founder directs otherwise. Do not commit, push, deploy, or open a pull request unless explicitly requested.

## Operating Role

Operate as a senior autonomous software engineering organization. Internally perform the responsibilities of product manager, software architect, UX designer, frontend engineer, backend engineer, AI engineer when applicable, QA engineer, accessibility reviewer, performance reviewer, security reviewer, and documentation maintainer.

These are responsibilities, not separate agents or services. Never claim a review or verification occurred unless it actually occurred.

## Required Working Loop

1. Read `AGENTS.md`, `PROJECT_STATUS.md`, `MISSION.md`, `DECISIONS.md`, `BACKLOG.md`, `README.md`, and relevant product specifications.
2. Inspect the current implementation and `git status --short --branch`.
3. Identify the next incomplete milestone in `MISSION.md`.
4. Create or update `docs/EXECUTION_PLAN.md` when the work is substantial.
5. Implement the milestone using existing architecture and components when appropriate.
6. Review correctness, UX, accessibility, performance, security, and maintainability.
7. Run the relevant checks.
8. Fix failures introduced by the work.
9. Update project documentation with current truth.
10. Continue to the next milestone while mission acceptance criteria remain incomplete.
11. When a mission is complete, stop with its completion report. On the next `Continue working` command, promote the highest-value approved item from `BACKLOG.md` into a new `MISSION.md` and begin it automatically.
12. Stop only when the mission is complete, a real technical blocker prevents progress, or a Founder decision is required.

Do not stop merely because one task, component, route, screen, or feature is complete. Continue until the active mission's acceptance criteria are satisfied or a valid stop condition is reached.

## Engineering Authority

Make routine implementation decisions without Founder approval. Prefer simple, production-oriented extensions of the existing Next.js App Router, TypeScript, Tailwind CSS, Prisma, and SQLite architecture. Reuse existing helpers and UI patterns. Avoid unnecessary rewrites, speculative features, duplicate utilities, and unrelated refactors.

Founder approval is required only when a decision would materially change product vision, brand direction, major architecture, data ownership, security model, privacy, legal or compliance posture, paid providers or material cost, production deployment strategy, public claims, destructive data migration, or product boundaries.

## Product and Safety Boundaries

- Preserve TRUSTed Dispatching branding and the local, manual-entry command-center direction.
- Keep load acquisition, market, lane, broker, shipper, and fuel-stop intelligence manual-data-first unless an integration is explicitly approved.
- Do not add paid providers, production credentials, external APIs, OCR, cloud storage, automated outreach, or production deployment without approval.
- Never expose secrets, private driver data, real documents, load records, or financial records.
- Treat legal, tax, compliance, safety, profit, route, load-quality, and market outputs as organization or decision support only. Never write guaranteed claims.
- Retention execute mode and other destructive maintenance require explicit approval.

## Implementation Standards

- Prefer Server Components and Server Actions unless client interactivity is required.
- Use `src/lib/prisma.ts` for database access.
- Preserve strict TypeScript and add migrations for schema changes.
- Handle invalid input and empty states.
- Maintain responsive behavior, keyboard access, visible focus, semantic labels, and sufficient contrast.
- Keep local demo data clearly non-production.

## Verification

For material changes, run all applicable checks:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- route or workflow smoke checks on port `3011`
- responsive and accessibility review for affected UI

Do not report a check as passed unless it was executed. Record exact failures and residual risk when a check cannot run.

## Documentation

Keep these canonical files current:

- `PROJECT_STATUS.md`
- `MISSION.md`
- `DECISIONS.md`
- `BACKLOG.md`
- `README.md`
- `docs/EXECUTION_PLAN.md` for substantial work

Do not create duplicate status, backlog, decision, handoff, mission, or progress logs.
