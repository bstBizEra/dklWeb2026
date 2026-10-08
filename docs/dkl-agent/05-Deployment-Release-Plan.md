# DKL-REL-001 — Deployment and Release Plan

Version: 0.1 proposed release procedure | Owner: DevOps / Release Engineer | Date: 2026-10-09

## Current state and release authority
No application release, full shell clone, deployment target, database project or live model integration was verified in this session. This plan extends `bstBizEra/dklWeb2026` revision `29057c6435f65c3f8448532c094f9604542b43d8`. Existing repository governance controls merge authority and required checks. This suite v1.1 is a documentation release, not permission to activate untested production features.

Local target: `C:\laragon\www\dklAgent`, through owner-authorized environment overrides. Retain Next.js/React/TypeScript/pnpm and the existing lockfile. The clone/apply script is a local bootstrap, not a deployment command. Read its changes before execution. Its PowerShell runtime behavior remains unverified here.

## Environments and configuration
| Environment | Data and identity | Intended use | Exit condition |
| --- | --- | --- | --- |
| Local | Synthetic fixtures; separate credentials | Reproduce baseline and develop bounded modules | Required checks plus local browser QA at port 3000 |
| Staging/preview | Isolated database/storage/auth; synthetic or explicitly approved minimized data | Integration, RLS, load, rollback and staff UAT | Release evidence approved on exact head/configuration |
| Production | Approved database/auth/model projects; restricted operational identities | Verified business use | Formal gates and accountable release authority |

Configuration inventory before deployment: APP_ENV/APP_URL, identity issuer/audience/session configuration, database connection and credentials, knowledge source revisions, model/provider credentials if enabled, rate limits, allowed origins, storage/upload limits, monitoring and backup settings. Adopt exact names only from the selected integration's verified implementation. No secret values belong in this document, client bundles, Git or logs. Local/staging/production credentials and data must be separate.

## Proposed feature flags
| Flag | Default before pilot | Activation gate |
| --- | --- | --- |
| staff_workspace | Off | Identity and resource isolation verified |
| database_lead_sink | Off | Durable acceptance, import reconciliation and rollback tested |
| workflow_tasks_support | Off | CRM/task/ticket contracts and permissions pass |
| assistant_read_only | Off | Approved knowledge, language evaluation and budget/error behavior pass |
| assistant_mutations | Off | Explicit scoped authority, idempotency/audit and adversarial tests pass |
| customer_portal | Off | Verified customer memberships and own-record isolation pass |
| external_dispatch | Off | Approved channel, recipient and quote-version authorization; retry proof |

Flags are server-enforced. Switching a UI flag cannot grant permissions. Each change records actor, environment, time and reason. Disabling mutations should leave read/manual workflows available when safe.

## Rollout sequence — gate-based schedule
| Stage | Action | Responsible role | Evidence before advancing |
| --- | --- | --- | --- |
| A: Baseline | Clone canonical repo; feature branch; frozen install | Engineering | Actual base/head, origin, clean tree and baseline results |
| B: Foundation | Auth, roles, schema and RLS; migrations in staging | Engineering/Security | Negative-first access tests, migration and restore evidence |
| C: Integration | Durable intake and reconcile historical JSONL | Engineering/QA | Accepted/rejected/duplicate counts; no lost acknowledged lead |
| D: Staff pilot | Enable a small named staff cohort; manual business actions | Product/Release | Lao/English UAT, support owner, monitoring and bounded exposure |
| E: Expand | Review pilot errors, access logs and metrics; extend cohort | Product/QA | No unresolved blockers; exact deployed version documented |
| F: External scope | Customer portal/dispatch only as separate release | Security/Release | Ownership isolation, recipient authority and external failure tests |

Calendar dates are not committed. Release manager assigns a window after prerequisites pass and confirms staff support availability. Do not infer that the current documentation date is a production launch date.

## Pre-release checklist and evidence
Required repository checks: `pnpm test -- --run`, `pnpm lint`, `pnpm typecheck`, `pnpm build`; applicable `pnpm version:status`; changelog/version synchronization; local browser evidence. Record actual command, exit status, environment and head SHA. Preserve existing public pages/intake. Test secret exposure, role/RLS boundaries, retry/concurrency, prompt injection, Lao shaping, backup restoration and error fallback. Resolve critical/high blockers according to security and QA documents; absence of evidence blocks the related activation.

Release record requires change summary, requirement IDs, source/head SHA, dependency lock hash, schema version, knowledge revision, model configuration, target deployment URL/ID, flag states, approver, time, evidence and rollback owner. No empty placeholder is interpreted as completed evidence.

## Rollback and recovery
1. Detect elevated errors, rejected legitimate intake, unauthorized data access, duplicate actions or integrity loss. Release engineer disables affected new flags; Security immediately disables tool mutations when authority is uncertain.
2. Preserve bounded audit and accepted-submission evidence. Confirm which sink is authoritative and avoid replaying partially completed operations without idempotency records.
3. Revert application deployment only to a version compatible with the current schema. Prefer expand-and-contract migrations; do not blindly reverse destructive schema changes.
4. For ingestion rollback, preserve post-cutover delta, pause writes if needed, reconcile accepted records and restore a tested durable sink before reopening. Do not revert production to ephemeral JSONL storage merely because old code uses it.
5. Validate core read/intake, isolation, record counts and audit continuity. Record observed recovery times/data impact. Product/Release confirms operational readiness before re-enabling.

Proposed recovery targets remain TDD hypotheses, not achieved commitments. A code rollback does not restore deleted data. Destructive operations require a separate reviewed recovery plan and verified backup.

## Post-release monitoring and communication
Monitor intake acceptance/failure, duplicate suppression, pending handoffs, task aging, ticket backlog, auth denial anomalies, model latency/cost and tool action outcomes. Alert thresholds are configured and proven in staging. Send internal release communication only through explicitly authorized channels; no message was sent by creating this plan. Update release notes with delivered behavior and known issues; distinguish unavailable features from outages.
