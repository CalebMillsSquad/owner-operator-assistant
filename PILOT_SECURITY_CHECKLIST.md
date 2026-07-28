# Mills Trucking Pilot Security Checklist

## Data Isolation

- [x] Pilot uses a dedicated PostgreSQL schema/client and must receive a pilot-only `DATABASE_URL`.
- [x] Startup fails when `PILOT_MODE=true` without a PostgreSQL URL.
- [x] No SQLite database, uploads directory, receipt, document, or private record is copied.
- [x] Every private model has `workspaceId`; the pilot Prisma extension injects the configured workspace into reads and mutations.
- [x] Fictional seed identifiers use `pilot-`/`PILOT-` conventions and `.invalid` email addresses.
- [x] Receipt and screenshot files are disabled pending approved isolated object storage.

## Access Control

- [x] No registration route exists.
- [x] Only environment-configured invited `TESTER` and `OWNER` identities can sign in.
- [x] Signed, HTTP-only, secure, same-site cookies include the pilot workspace ID.
- [x] The private-route proxy rejects missing, invalid, tampered, expired-by-cookie, or wrong-workspace sessions.
- [x] Next.js is pinned to 16.2.12, which includes the proxy-bypass security fix required by this pilot.
- [x] `TESTER` can use normal pilot workflows but cannot run owner-only reset/recovery actions.
- [x] Credentials and session secrets are environment variables and are never committed.

## Reset and Recovery

- [x] Reset requires an authenticated `OWNER` session in `PILOT_MODE` for the configured workspace.
- [x] Reset runs transactionally, deletes only records in the pilot workspace, and recreates the reviewed fictional seed.
- [x] Submitted feedback is preserved across operational-data resets.
- [ ] Founder performs one reset after deployment and confirms seeded counts and feedback preservation.

## Deployment and Teardown

- [ ] Create a separate Vercel project for the pilot; do not alias the production domain.
- [ ] Configure Preview-only environment variables and a separate PostgreSQL database.
- [ ] Keep Vercel preview deployment protection enabled; app-level invited-user auth remains required.
- [ ] Apply `prisma/pilot/migrations` and run `npm run pilot:seed` only against the pilot database.
- [ ] Verify preview logs contain no credentials or record contents.
- [ ] At pilot end: revoke tester credentials, remove the Preview deployment, delete the pilot database, and remove any isolated object store if later enabled.
- [ ] Record teardown completion before reusing the tester email or deployment name.

## Required Environment Variables

`PILOT_MODE=true`, `PILOT_WORKSPACE_ID=mills-trucking-pilot`, `DATABASE_URL`, `OWNER_OPERATOR_SESSION_SECRET`, `PILOT_TESTER_EMAIL`, `PILOT_TESTER_PASSWORD`, `PILOT_TESTER_NAME`, `PILOT_OWNER_EMAIL`, `PILOT_OWNER_PASSWORD`, and `PILOT_OWNER_NAME`.

Generate passwords and the session secret in a password manager. Set them directly in the separate Vercel Pilot project's Preview environment. Deliver the tester email and password through separate private channels. Never store or paste passwords in Git, screenshots, feedback, issue trackers, or deployment logs.
