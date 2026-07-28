# TRUSTed Dispatching Command Center

TRUSTed Dispatching Command Center is a local-first operations application for truck owner-operators and small teams. It organizes loads, operating expenses, fuel activity, documents, maintenance, inspections, profitability, next actions, and manual freight opportunity intelligence.

## Maturity

The application is in MVP development. Core manual-entry workflows work locally; production deployment, external integrations, binary document storage, and multi-tenant operation are not enabled.

## Technology

- Next.js 16 App Router and React 19
- TypeScript 5
- Tailwind CSS 4
- Prisma 7 with SQLite for local development
- Node.js test runner

## Requirements

- Windows 10 or newer for the supplied launcher scripts
- Node.js 20 or newer; Node.js 24 is the documented target
- npm

## Install

```powershell
npm install
npm run prisma:generate
```

The repository includes migrations and a repeatable local demo seed. For a new empty development database:

```powershell
npm run prisma:migrate -- --name init
npm run seed
```

Do not run migration reset or destructive cleanup against a database containing records you need to preserve.

## Run Locally

```powershell
npm run dev -- --port 3011
```

Open [http://localhost:3011](http://localhost:3011).

## Windows Launcher

- Double-click `START_APP.bat` to start the app on port `3011` and open it in the browser.
- Double-click `STOP_APP.bat` to stop only this app's local server.
- The OneDrive Desktop shortcut is `C:\Users\caleb\OneDrive\Desktop\TRUSTed Dispatching (Local).lnk`.
- PowerShell equivalents are `START_APP.ps1` and `STOP_APP.ps1`.

The launcher checks for Node.js and installed dependencies, refuses to take over a port owned by an unrelated process, waits for an HTTP response, and then opens the local URL.

## Demo Data

```powershell
npm run seed
```

The seed creates local records with `seed-` identifiers for current-week loads, linked expenses, document alerts, maintenance reminders, an inspection, and manual load-acquisition examples. Demo records are not live freight, financial, driver, or compliance data.

## Profitability Rules

Load profitability uses `total miles = loaded miles + deadhead miles`, `revenue per loaded mile = rate / loaded miles`, `revenue per total mile = rate / total miles`, `net load profit = rate - direct linked expenses`, and `net profit per total mile = net load profit / total miles`. Invalid, missing, zero, or negative inputs produce an unavailable metric instead of a misleading division result.

Weekly summaries include a load by delivery date, falling back to pickup date and then creation date. Expenses are included by expense date. Each persisted expense is counted once in weekly totals; load-linked expenses contribute to the load's direct expense total and are not added a second time.

## Freight Intelligence

Freight Intelligence at `/freight-intelligence` is a manual-first pre-booking workspace. It supports local equipment profiles, manually captured opportunities, operational compatibility estimates, total-mile profitability estimates, negotiation history, transparent recommendations, and explicit conversion into one booked Load while preserving the opportunity and freight weight. It does not scrape load boards, contact brokers, or guarantee safety, rates, profit, or regulatory compliance. Confirm dimensions, payload, ratings, securement, and operating requirements before accepting freight.

## Mills Trucking Pilot

The `pilot/mills-trucking-external-test` branch supports a separate invitation-only external test environment. `PILOT_MODE=true` requires a PostgreSQL `DATABASE_URL`, secure invited `OWNER` and `TESTER` credentials, and a configured `PILOT_WORKSPACE_ID`. The pilot never imports `dev.db`, uploads, receipts, documents, or private records.

```powershell
npm run pilot:prisma:generate
npm run pilot:migrate:deploy
npm run pilot:seed
npm run pilot:build
```

Set credentials only in the separate Vercel Pilot project's Preview environment. See `PILOT_TEST_PLAN.md` and `PILOT_SECURITY_CHECKLIST.md`. Receipt/document and feedback screenshot uploads remain disabled until isolated object storage is approved and configured.

## Validation

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npx prisma validate
```

`npm run test` uses an isolated `test.db`, reseeds demo data, and removes the test database afterward. It does not replace the normal `dev.db` preview data.

## Project Documentation

- `AGENTS.md`: permanent Codex operating contract
- `PROJECT_STATUS.md`: current verified project state
- `MISSION.md`: one active product mission and its acceptance criteria
- `DECISIONS.md`: Founder-approved product and operating decisions
- `BACKLOG.md`: ordered product roadmap
- `docs/EXECUTION_PLAN.md`: living implementation sequence for substantial work
- `docs/OWNER_OPERATOR_ASSISTANT_OS_PRODUCT_BIBLE.md`: product vision and requirements
- `docs/PRODUCTION_DEPLOYMENT_REVIEW_POLICY.md`: deployment and production review boundary
- `docs/archive/`: preserved superseded progress and management documents

## Repository Structure

- `src/app/`: routes and Server Actions
- `src/components/`: shared interface components
- `src/lib/`: domain logic, data access, auth, recovery, retention, and tests
- `prisma/`: schema, migrations, and local demo seed
- `docs/`: product specifications, execution plan, policies, and archive

## Safety Boundaries

The app provides business organization and decision support. It does not provide legal, tax, financial, safety, or compliance certification and does not guarantee loads, rates, routes, contracts, or profit. Production credentials, paid services, external integrations, uploads, and deployment require separate approval.
