# AGENTS.md — Owner Operator Assistant

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS v4
- Prisma + SQLite

## CRITICAL: Next.js Version
Read `node_modules/next/dist/docs/` before writing any Next.js code.

## Project Structure
- `src/app/` — App Router pages
- `src/components/` — Reusable components
- `src/lib/prisma.ts` — Prisma client singleton
- `prisma/schema.prisma` — Database schema

## Rules

### General
- App Router only. No Pages Router.
- Server components by default. `"use client"` only when interactivity requires it.
- All form submissions use Server Actions.

### Database
- Migrations required after every schema change.
- Use singleton from `src/lib/prisma.ts`.

### Safety
- This app handles financial and business-sensitive data.
- Never expose driver or load data without access control.
- No paid APIs without explicit approval.
- No secrets in code — use `.env.local`.

### Commits
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- One concern per PR.
