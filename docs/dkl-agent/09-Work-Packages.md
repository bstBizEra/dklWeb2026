# DKLA-WP-001 — Phased autonomous execution backlog

Owner: Orchestrator / Engineering Lead. Dependencies are gates, not calendar promises. Draft work packages are local task authority; map to existing GitHub Issues before creating duplicates. No issue numbers have been created in this session.

| WP | Outcome | Dependency | Acceptance evidence |
| --- | --- | --- | --- |
| DKLA-001 | Repository inventory, six concept-to-launch specs, supporting UX/ERD/security, team controls, clone script | None | Consistent source pin, complete suite and safe script checks; Windows clone remains pending |
| DKLA-002 | Staff identity, role/access matrix, DB schema and isolation | Clone verified; approved identity settings | Unauthenticated denied; sales/support boundaries enforced; forged customer/role cannot bypass; RLS tests and migration rollback pass |
| DKLA-003 | Durable lead intake compatible with website | 002 | Existing envelope/status preserved; server controls NEW/timestamp; validation, spam limits and idempotency verified; no duplicate writes |
| DKLA-004 | Sales pipeline, customer/contact records and follow-ups | 003 | Owner/due/status/audit; filtered views and concurrent update tests; original website regressions pass |
| DKLA-005 | Operation handoffs and support tickets | 004 | Authorized transitions; escalation and evidence; no invented SLA; retry-safe handoffs |
| DKLA-006 | Lao/English knowledge-grounded read-only assistant | 002, approved portfolio/SOP sources | Locale switch, model/knowledge evaluations, prompt-injection tests, no fake prices/stock; server-scoped conversation reads |
| DKLA-007 | Draft quotations and controlled tool actions | 004,006 | Draft separated from approval; approved version locked; authorization/idempotency/audit tested; no automatic external sending |
| DKLA-008 | Reporting, accessibility, deployment readiness | 005,007 | Metric definitions; browser/device QA; cost/load/error monitoring; security review; restore drill; production gates |

## Work package contract
Every implementation package must contain scope/non-goals, requirement IDs, observed inputs/base SHA, files allowed, responsible role/reviewer, test cases/fixtures, expected results, rollback, evidence record and blocking unknowns. The orchestrator may split a package into independent branches only after contracts are stable. QA and Security do not accept tests based solely on implementer narration.

## Sequence and autonomy
Complete useful design and local reversible work while credentials/project selection are pending. Clone existing source first on the authorized Windows path using Start-DklAgent.ps1. Inspect current origin/main against the design baseline before application work. Do not install the abandoned new scaffold over the clone. Route changes, pricing policies, operational SLAs and external customer channels require explicit documented business decisions; leave these unknowns visible.

## Blocking facts for live implementation
Hosted shell lacks GitHub credential for the private clone. Windows path is not mounted. No selected Supabase project or Vercel deployment project is established. Authentication provider settings, staff roles/accounts and live AI credential have not been configured. These block live integration and end-to-end proof, not completion of the suite.
