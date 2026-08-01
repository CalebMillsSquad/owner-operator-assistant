# Owner Operator Assistant

A practical business operations app for truck owner-operators to track loads, capture expenses, manage documents, and stay on top of profitability.

## Purpose

Centralizes the daily tasks that matter: load tracking, fuel logs, income summaries, maintenance reminders, and missing document alerts — all in one clean dashboard.

## Core Features

- Daily driver dashboard
- Load tracking
- Fuel and expense capture
- Receipt upload
- Profitability calculator
- Maintenance reminders
- Inspection checklist
- Missing document alerts
- Weekly income and expense summary
- Next-action assistant

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Prisma + SQLite-compatible Turso/libSQL

## Local Setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

For local-only development, `TURSO_DATABASE_URL` can use a file URL such as
`file:./prisma/dev.db`; `TURSO_AUTH_TOKEN` can be empty for that file database.
For a hosted Turso database, use its libSQL URL and auth token instead.

Open: http://localhost:3000

## Deployment Access Setup

Before exposing the app on the internet, copy `.env.example` to `.env.local` and set:

- `TURSO_DATABASE_URL` — the Turso libSQL database URL
- `TURSO_AUTH_TOKEN` — the token that authorizes access to that database
- `APP_ACCESS_PASSWORD` — the password required to open the app from your phone
- `SESSION_SECRET` — a long random string used to sign the login session cookie

This app now requires a login before any dashboard route can be viewed.

## Going Live on Your Phone

The repository is configured for Vercel with `vercel.json`. In the existing
Vercel project, add all four variables above to **Preview** and **Production**
(and **Development** if using `vercel dev`), then:

1. Apply committed migrations to the intended Turso database from an authorized environment.
2. Verify the pull request's Preview deployment builds and the login/dashboard flow works.
3. Merge only after the Preview deployment is accepted.
4. Verify the Production deployment and sign-in flow from your phone.

## Production Notes

- Do not use a local SQLite file in Vercel functions; their filesystems are not persistent.
- Do not run remote migrations automatically during the Vercel build. Apply them deliberately with database authorization.
- Keep Turso backups and access controls appropriate for private business data.
- Test mobile access after deployment to verify login, dashboard loading, and form submissions
