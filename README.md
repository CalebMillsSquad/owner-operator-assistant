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
npm run prisma:migrate -- --name init
npm run prisma:generate
npm run dev
```

Open: http://localhost:3000
