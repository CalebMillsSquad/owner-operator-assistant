# Production Deployment and Owner Review Policy

Last updated: 2026-06-27

## Purpose

This document defines the minimum production-readiness and owner-review gates for the active Next.js app in `owner-operator-assistant-main/`.

The parent `Owner Operator Assistant/` folder contains a legacy static prototype and is not part of this deployment policy.

## Production Status

- Production deployment is not approved by default.
- No hosting provider, domain, DNS change, production database, or public launch is authorized from repository state alone.
- Owner approval is required before any production deployment, DNS change, production credential setup, public demo, or destructive maintenance action.

## Required Owner Review Before Production

Before production-facing use, the owner must review and approve:

- Deployment target and hosting account.
- Public domain or internal-only access plan.
- Production environment variables and where they are stored.
- Production database file/storage location and backup approach.
- Operator access list and role assignments.
- Soft-delete retention maintenance schedule.
- Browser review of the production build before public or client-facing use.
- Any content that could be interpreted as legal, tax, compliance, profit, or load-guarantee advice.

## Required Production Environment Variables

Operator authentication requires these secrets before production use:

- `OWNER_OPERATOR_AUTH_PASSWORD` or `OPERATOR_AUTH_PASSWORD`
- `OWNER_OPERATOR_SESSION_SECRET` or `OPERATOR_SESSION_SECRET`

Recommended identity variables:

- `OWNER_OPERATOR_ID`
- `OWNER_OPERATOR_NAME`
- `OWNER_OPERATOR_ROLE`

`OWNER_OPERATOR_ROLE` currently supports:

- `OWNER`
- `OPERATOR`

Delete and restore workflows require the `OWNER` role.

## Validation Before Deployment

Run these checks before any production release candidate:

```text
npm run test
npm run lint
npm run build
npm run retention:cleanup
```

Expected behavior:

- `npm run test` passes.
- `npm run lint` has no new errors. The known existing warning in `src/lib/soft-delete-recovery-smoke.test.mts` may remain until separately cleaned up.
- `npm run build` passes.
- `npm run retention:cleanup` runs in dry-run mode and deletes nothing.

## Retention Cleanup Maintenance Process

Soft-deleted operational records are recoverable for 24 months by default.

Run the dry-run command first:

```text
npm run retention:cleanup
```

Review the output before any deletion:

- Confirm the cutoff date.
- Confirm counts by entity type.
- Confirm the maintenance window is approved.
- Confirm a backup exists if running against production data.
- Confirm the owner has approved cleanup for this window.

Only then run execute mode:

```text
npm run retention:cleanup -- --execute
```

Optional overrides:

```text
npm run retention:cleanup -- --months=<positive whole number>
npm run retention:cleanup -- --as-of=<date>
```

Execute mode:

- Deletes only expired soft-deleted operational records.
- Does not purge `AuditLog` history.
- Writes one retained `AuditLog` summary row for the cleanup event.

## Destructive Action Rules

Do not run execute-mode retention cleanup unless all of these are true:

- Owner approval is explicit for the specific maintenance window.
- Dry-run output has been reviewed.
- Production data has a backup or rollback plan.
- No legal, tax, compliance, audit, or business hold requires preserving the affected records.
- The operator running the command understands it is destructive.

## External Integrations

No external brokerage, load-board, scraping, paid API, email, payment, DNS, or hosting integration is authorized by this policy.

Any external integration requires a separate owner-approved plan.

## Current Known Production Gaps

- Production hosting target is not selected.
- Production database backup and restore process is not documented.
- Production browser QA has not been completed.
- Operator credential storage location is not selected.
- Dashboard placeholder widgets are not connected to live external services and should not be represented as live integrations.

