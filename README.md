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
- Prisma + SQLite (local dev)

## Local Setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Open: http://localhost:3000

## Deployment Access Setup

Before exposing the app on the internet, copy `.env.example` to `.env.local` and set:

- `DATABASE_URL` — use a persistent SQLite file path or another production database URL if you migrate away from SQLite
- `APP_ACCESS_PASSWORD` — the password required to open the app from your phone
- `SESSION_SECRET` — a long random string used to sign the login session cookie

This app now requires a login before any dashboard route can be viewed.

## Going Live on Your Phone

For the current stack, the safest lightweight deployment is a single persistent server:

1. Deploy the Next.js app to a server that can run `npm run build` and `npm run start`
2. Mount persistent storage for the SQLite database file if you keep SQLite in production
3. Set the environment variables from `.env.example`
4. Run Prisma migrations on the server before first launch
5. Open the deployed HTTPS URL from your phone browser and sign in

## Production Notes

- SQLite is fine for a single-owner deployment, but it needs persistent disk backups
- If you later move to a managed host without persistent local disk, migrate `DATABASE_URL` to a hosted database first
- Test mobile access after deployment to verify login, dashboard loading, and form submissions
