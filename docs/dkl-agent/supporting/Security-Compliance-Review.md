# DKL-SEC-001 — Application Security & Compliance Review

Version: 0.1 proposal · Owner: Security Engineer / DevSecOps · Review date: 2026-10-08

## Scope and evidence status

This review defines controls for the DK LAO Lao–English Sales, Operations and CRM assistant. The implementation must extend `bstBizEra/dklWeb2026`, baseline commit `29057c6435f65c3f8448532c094f9604542b43d8`. This document is an implementation overlay, not evidence of completed remediation. No deployment, penetration test, external project creation or production data inspection has occurred.

Baseline information provided for this review: Next.js 16.2.9, React 19.2.7, TypeScript 6.0.3, pnpm and Vitest 4.1.9. The public `POST /api/leads/quote` handler uses Zod and local JSONL storage. Its handler accepts client-supplied status and submissionTimestamp. Authentication and rate limiting are not confirmed in that handler. No existing CRM or Supabase integration is established. Shared middleware, infrastructure controls, dependencies and hosting configuration require direct inspection; absence in a handler does not prove absence everywhere.

## Assets, actors and trust boundaries

Assets: customer contact details; lead, quotation and support history; internal task and SOP content; staff identities; approvals; commercial terms; audit events; service credentials; product knowledge provenance.

Actors: anonymous prospect, authenticated customer, sales staff, operations staff, support staff, commercial approver, administrator, AI runtime, integration service and attacker. Role names are proposed and require business approval.

Boundaries: browser to application; session to server authorization; application to database; retrieval content to model; model output to tools; application to external services. Customer text, uploaded documents, scraped pages and model output are untrusted. The model never decides authorization. Tools execute only after server-side identity, resource scope, input validation and authority checks.

## Findings and proposed control matrix

| ID | Evidence / risk | Proposed control | Verification / residual risk |
|---|---|---|---|
| SEC-01 | Public intake may receive automated spam; handler rate limiting not confirmed | Preserve intentional public inquiry intake; add request limits, size limits, abuse monitoring and challenge escalation; never expose internal lead reads through intake | Test anonymous valid intake and burst rejection; distributed attacks remain an operational risk |
| SEC-02 | Client can submit status and submissionTimestamp | Server assigns initial status and UTC timestamp; reject or discard those client fields consistently; validate supported product codes | Crafted input cannot create approved/won leads or backdate audit chronology; staff workflow errors remain possible |
| SEC-03 | JSONL on local disk has durability, access and backup risks; production suitability unverified | Replace CRM persistence with approved managed PostgreSQL integration; least privilege credentials, row-level policies, backups and tested restoration | Restart/concurrent-write tests; recovery evidence; configuration drift remains a risk |
| SEC-04 | CRM authentication and resource authorization not implemented | Verified sessions; deny by default roles; customer own-account scope; staff departmental scope; privileged approver/admin separation | Negative-first cross-account and cross-role tests; staff misuse remains monitored |
| SEC-05 | Agent may consume malicious instructions from inquiry or retrieval | Treat retrieved text as data; isolate instructions; approved knowledge sources; tool allowlist; bounded tool budgets; adversarial evaluations | Injection cannot exfiltrate, approve prices or change authority; novel attacks require ongoing review |
| SEC-06 | Quotation and outbound tools can create commitments or duplicates | Draft by default; explicit approver action bound to draft version/hash; expiry; idempotency key; transaction and unique constraint | Changed draft invalidates approval; retry produces one action; authorized human mistakes remain possible |
| SEC-07 | Personal data can leak through prompts, logs, exports or report totals | Minimize model payloads; redact logs; access-controlled exports and retrieval; retention/deletion workflow | Unauthorized search/export/count denies; third-party retention must be reviewed before enablement |
| SEC-08 | Secrets or service credentials may reach browsers or Git | Server-only credentials; environment templates without values; secret scanning; key rotation and scoped integration identities | Build and Git scans; compromise of privileged infrastructure remains a risk |
| SEC-09 | Audit records could be incomplete or silently modified | Server-created append-oriented audit events with actor, resource, action, result, time, correlation ID and before/after field references; restrict audit writes/reads | Verify success and denial events; immutable external archive is a later hardening decision |
| SEC-10 | HTML, attachments or spreadsheet exports can contain executable content | Output encoding; upload allowlists/size limits/quarantine; signed access; CSV formula escaping; safe link handling | XSS, MIME mismatch, path traversal and export injection cases; malware scanner selection pending |

Risk priorities: SEC-02 and SEC-04 through SEC-08 are release blockers for internal CRM/agent actions. SEC-01 is a public-intake launch control. SEC-03 must be resolved before claiming durable CRM storage. Findings describe assessment hypotheses and supplied baseline observations, not certified exploitability scores.

## Authentication, authorization and data protection design

Use the existing repository identity foundation if validated; otherwise select an identity provider through an ADR before implementation. Require MFA for privileged roles; invalidate sessions on deactivation; enforce privileged changes server-side. Use CSRF protection appropriate to the session mechanism and deployment, secure cookie settings where cookies apply, and authenticated action origins. Do not select an OAuth provider merely because one is available.

Supabase is a proposed database/auth option, not an established project. If adopted, browser access uses constrained public credentials and tested RLS; service-role credentials remain server-only and must not substitute for per-user authorization. Policies cover all operation types and joins/storage buckets. Customers see only their own authorized account records. Staff assignment and department rules must be specified before implementing policies. Single-company scope does not remove the need for customer isolation.

Require HTTPS in deployed environments and document provider-managed encryption at rest after configuration verification. Backup access, encryption, retention, restore ownership and recovery objectives require an operational ADR. Do not promise provider guarantees without evidence.

## AI commercial authority and source controls

The assistant must not invent prices, stock, delivery guarantees, contractual terms or approvals. Quotation outputs distinguish known catalogue facts, provisional recommendations and fields requiring authorized confirmation. Record source version and retrieval references. Stale or conflicting catalogue data prompts staff verification. Current six-business-line content is the initial knowledge scope; broader 2024 offerings require current business confirmation.

Model tool requests are proposals. Server tools enforce role, account scope, workflow transition, approval state and allowed parameters. Customer support cannot approve discounts; sales cannot close restricted operations or erase audits. AI cannot elevate privileges, bypass failed controls, or send customer messages autonomously without an explicitly granted workflow authority.

## Compliance assessment register

| Topic | Current status | Required decision / evidence |
|---|---|---|
| Applicable Lao personal-data and business obligations | Not assessed | Accountable legal/business owner establishes jurisdiction, permitted processing and required notices |
| GDPR | Applicability unknown; no compliance claim | Review customer geography, targeting and processing arrangements with qualified counsel |
| HIPAA | Applicability unknown; no health-data workflow established | Do not collect clinical data by default; assess only if a qualifying healthcare use case is introduced |
| Processor contracts and cross-border transfer | Pending provider selection | Review database, hosting and AI-provider contracts, processing locations and retention settings |
| Consent, notice and customer communication preferences | Proposed | Separate inquiry handling from optional marketing; record notice/version and applicable preference evidence |
| Retention, access, correction and deletion | Business/legal decisions pending | Define record-specific schedules, legal holds, request verification and backup handling |

This is a technical review and applicability register, not legal advice or certification.

## Release gates and evidence

Before internal pilot: approved identity/role matrix; confirmed baseline findings; negative authorization tests passing; quotation approval/idempotency tests passing; adversarial AI evaluation; secret scan; durable persistence and restore evidence; staff Lao-language review; no unresolved critical or high risk without accountable written exception. Exception records need owner, justification, compensating control, expiry and follow-up issue.

Before external production: public-intake abuse tests; customer isolation proof; provider/retention decisions; operational alerts; rollback and incident response rehearsal; required repository checks `pnpm test -- --run`, `pnpm lint`, `pnpm typecheck`, `pnpm build`; browser evidence at local port 3000. Every result must identify revision, environment, command, timestamp and actual outcome. No gate is currently marked passed.

## Incident response and residual-risk ownership

Operations can disable agent mutation tools independently of browsing/search. Security can revoke sessions/keys, preserve bounded evidence, quarantine integrations and coordinate notifications through the accountable owner. Restore service only after cause assessment and regression verification. Review audit access, prompt-injection evaluations and policy drift each release; the security owner records residual risk rather than treating model behavior as a security boundary.
