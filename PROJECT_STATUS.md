# Project Status

Last updated: 2026-07-28

## Product

TRUSTed Dispatching Command Center is a local-first operations application for owner-operators and small trucking teams to organize loads, expenses, fuel, documents, maintenance, inspections, profitability, next actions, and manual freight relationship intelligence.

## Current Phase

Beta Readiness

## Active Mission

Mills Trucking External-Testing Pilot

## Current Milestone

Pilot isolation, access control, fictional seed, feedback, reset, and runbooks implemented locally; external provisioning and live browser acceptance remain.

## Overall Mission Progress

In progress. Local implementation and automated validation are substantially complete; no protected external URL exists yet.

## Verified Working

- Local manual-entry workflows for loads, expenses, documents, maintenance, and inspections.
- Dashboard, weekly summary, profitability, next-action assistant, audit/recovery, and retention dry-run tooling.
- Manual load acquisition, broker, shipper, market, fuel-stop, and lane-intelligence workflows.
- First-class fuel purchase create, edit, linked-expense, soft-delete, restore, audit, and reporting workflow.
- Isolated test database behavior that does not replace the normal preview database.
- Local launcher start/stop cycle and preview on port `3011`.
- Accessible TRUSTed Dispatching brand lockup with original inline truck-and-shield emblem.
- Responsive sidebar and dashboard hierarchy polish for compliance alerts and next actions.
- Additive loaded/deadhead mileage model with backward-compatible legacy mileage fallback.
- Centralized per-load and weekly profitability calculations with zero/missing-data protection.
- Dedicated per-load profitability view at `/loads/[id]` and weekly summary controls/metrics.
- Additive Freight Intelligence workflow with editable equipment profiles, filtered opportunity evaluation, negotiation history, transparent recommendations, explicit warning-confirmed booked-load conversion, and weight preservation on converted Loads.

## In Progress

- Separate PostgreSQL/Vercel Preview provisioning, pilot migration/seed, and live responsive/access acceptance.

## Remaining

- Next relationship-intelligence mission: Broker Directory, Broker Verification, and Payment Performance Scorecard.
- Production planning remains separate and approval-gated.

## Known Issues

- Medium: the current local SQLite database predates Prisma migration bookkeeping, so migration status reports historical migrations as unapplied even though their tables exist. The app works and isolated tests build the schema from reviewed migrations.
- Low: the worktree contains broad pre-existing uncommitted changes that must remain preserved.

## Blockers

- Founder-provided Mills Trucking vision graphic is not present in the repository or current goal attachment.
- Separate pilot PostgreSQL and Vercel Preview environment values are not yet provisioned.

## Verification Status

- Lint: passed (`npm run lint`).
- Typecheck: passed (`npm run typecheck`).
- Tests: passed, 51 of 51 (`npm run test`), including anonymous/wrong-workspace access and automatic Prisma workspace scoping.
- Local production build: passed on Next.js 16.2.12 (`npm run build`).
- Pilot PostgreSQL production build: passed with placeholder build-only environment values (`npm run pilot:build`); no live database connection was used.
- Runtime private-route smoke: anonymous Freight Intelligence returned 307 to sign-in; signed tester routes returned 200 with the pilot banner; tester could not see reset/feedback administration while owner could.
- Production build: passed (`npm run build`).
- Local smoke checks: passed for `/fuel`, `/fuel/[id]/edit`, `/expenses`, `/profitability`, `/summary`, and `/audit-log`.
- Freight Intelligence smoke checks: passed for `/freight-intelligence`, `/freight-intelligence/opportunities`, `/freight-intelligence/opportunities/new`, `/freight-intelligence/equipment`, and `/freight-intelligence/negotiations`.
- Freight Intelligence focused tests: passed, 6 of 6; full suite passed, 46 of 46.
- Freight Intelligence filter, equipment, and negotiation route smoke checks: passed with HTTP 200; `git diff --check` passed.
- Freight Intelligence command center now reports average offered rate, average effective RPM, average projected profit, negotiation count, and active equipment.
- Additive `Load.weightPounds` migration preserves freight weight when an opportunity becomes a booked load.
- Browser QA: Freight Intelligence dashboard, pipeline, capture form, equipment, and negotiations routes passed at desktop/tablet/mobile widths; mobile visual review passed.
- Dashboard now exposes new, equipment-review, negotiation, accepted/rejected, and expiring-soon decision counts; decision explanations include deadhead, stop-count, and missing schedule warnings.
- Responsive/accessibility: `/summary` passed live 1280, 768, and 390 pixel viewport checks with no horizontal overflow; week navigation exposed one unique keyboard-focusable link and remained reachable.

## Local Development

- Command: `npm run dev -- --port 3011`
- URL: `http://localhost:3011`
- Launcher: `START_APP.bat`
- Desktop shortcut: `C:\Users\caleb\OneDrive\Desktop\TRUSTed Dispatching (Local).lnk`

## Next Internal Milestone

Provision and acceptance-test the protected Mills Trucking pilot Preview.
