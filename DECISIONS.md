# Founder Decisions

## 2026-07-28 - Isolated Mills Trucking external-testing pilot approved

- Decision: Build one invitation-only Vercel Preview pilot for Mills Trucking using a separate PostgreSQL database, fictional data, `OWNER`/`TESTER` roles, and pilot-only branding surface.
- Rationale: Validate the Command Center and Freight Intelligence with one external owner-operator without exposing real operating records or changing the production brand/domain.
- Implementation consequence: Pilot deployment stays on a dedicated branch/project and workspace; uploads remain disabled until isolated storage is approved; no paid service or production promotion is authorized.

## 2026-07-19 - Mission-driven autonomous repository workflow

- Decision: Future work should proceed from one active mission with internal milestones, and routine engineering decisions should not require repeated Founder approval.
- Rationale: Reduce Founder workload while preserving clear product and safety boundaries.
- Implementation consequence: `MISSION.md` governs active work, and Codex continues until mission acceptance criteria are complete or a defined stop condition is reached.

## 2026-07-19 - Local manual-entry command-center boundary reaffirmed

- Decision: TRUSTed Dispatching remains a local-data-first, manual-entry command center rather than an automated market, load-board, or regulated-professional service.
- Rationale: Preserve the approved product direction and avoid unsupported public claims or integrations.
- Implementation consequence: Load, fuel, lane, broker, shipper, document, and profitability features remain decision-support and organization workflows.

## 2026-07-19 - Advanced storage and integrations remain deferred

- Decision: Binary document upload, OCR, cloud storage, paid APIs, external integrations, and production deployment remain unapproved.
- Rationale: These lanes require separate privacy, security, cost, and deployment decisions.
- Implementation consequence: Receipt and document behavior remains reference-only; all current work stays local.

## 2026-07-19 - Destructive maintenance remains approval-gated

- Decision: Retention execute mode and destructive data maintenance require an approved maintenance window.
- Rationale: Preserve recoverability and prevent unintended data loss.
- Implementation consequence: Routine validation may use dry-run behavior only unless the Founder explicitly approves execution.
