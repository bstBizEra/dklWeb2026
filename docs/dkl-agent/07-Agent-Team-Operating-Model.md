# DKLA-TEAM-001 — Agent engineering operating model

Owner: Engineering Lead. Status: proposed runtime controls for repository-first delivery. Date: 2026-10-08.

## Goal
Deliver functional, maintainable DK LAO business-agent capabilities against written acceptance criteria. Preserve the existing website, brand, public lead interface and repository controls. Every completed change has reproducible evidence. Aim for required gates to pass within two bounded correction loops; this is a performance target, never proof of zero regression.

## Team and authority
| Role | Owns | Required reviewer / boundary |
| --- | --- | --- |
| Orchestrator | intake, work package, dependency routing, integration, state | Does not self-approve its implementation |
| Product agent | PRD, value proposition, priorities, business acceptance | Owner confirms commercial policies |
| UX agent | flows, bilingual screen states, accessibility | Lao reviewer and QA review customer copy |
| Architect/data agent | architecture, schema, contracts, migrations | Security reviews access/isolation |
| Implementation agent | smallest scoped code change | QA verifies; security reviews identity/data/tool changes |
| QA agent | negative-first tests, regression, evidence | Reports actual outcomes without accepting author's claims |
| Security agent | threat model, dependency/secret/access review | Cannot certify untested controls |
| Context librarian | inventory, decisions, compact handoffs, evidence paths | Cannot override source authority |

These are roles; they may run in separate sessions or be sequentially assigned. Parallel agents receive disjoint files or worktrees, requirement IDs, pinned base SHA and scoped context. The orchestrator alone integrates conflicting changes. Never share secrets or entire customer databases through agent context.

## Shared information foundation
Authoritative static context: root AGENTS.md -> con_agents master/bootstrap -> task-specific controls -> suite -> current work package. Dynamic state: relevant code paths, git diff/base/head SHAs, gate output and decisions. Session history is supporting context only.

Before a run write this compact capsule in `docs/dkl-agent/state/<WP>.md`:

```yaml
work_package: DKLA-002
base_sha: <actual full SHA>
branch: <actual branch>
goal: <one outcome>
requirements: [R01]
inputs: [<relevant controls>, <specific source paths>]
write_scope: [<assigned paths>]
acceptance: [<testable conditions>]
dependencies: [<IDs and proven status>]
last_evidence: [<actual paths/run IDs>]
unknowns: [<unverified facts>]
next_action: <one action>
```

State changes are versioned through Git with the deliverable. Store bounded gate logs under an ignored evidence directory; retain sanitized summaries and hashes in tracked verification records. Never claim checks from an earlier head apply to a new changed head.

## Runtime rules
1. No execution without a work package, requirement IDs and acceptance conditions. DKLA-001 authorizes this suite, inventory and safe clone script.
2. Read just-in-time paths using targeted searches; avoid full-repository/context dumps. Compact when a decision is reached or a role hands off.
3. Preserve owner's work; inspect status, branch and remote. Use feature/*, fix/* or hotfix/* per existing rules. Do not overwrite dirty trees or rewrite main history.
4. Use the existing stack and lockfile. Adopt additional dependencies only after a recorded ADR explains need, maintenance, data flows and license.
5. Implement -> run narrow checks -> inspect failure -> correct -> rerun. After two repeated failed approaches, diagnose the cause and record a bounded alternative; do not blindly loop or disable tests.
6. Destructive migrations, production publication and binding commercial actions require the relevant authority. Reversible local analysis, tests and implementation continue autonomously within scope. Ambiguities that do not affect safety/contract are resolved with documented assumptions; material unknowns block only dependent work.
7. Validate server-side identity for every data/tool operation. Model-supplied role, customer ID or approval claims confer no authority.
8. No messages to customers, signed quotations, purchases or billing changes are inferred from an internal drafting request. Tools distinguish draft, authorized execution and observed result.
9. Use stable operation IDs and idempotent writes; approval is separate from duplicate prevention.
10. Deterministic tests verify schema/permissions/contracts. Model evals separately verify language, knowledge grounding and tool choice. Both are required for AI-enabled release.

## Definition of done
Written criteria pass; required repository test/lint/typecheck/build gates pass on exact head; user-facing changes are browser-tested; security scope has independent review; changelog and applicable version records agree; documentation and actual results are updated; no unapproved claims/secrets/customer logs are committed; reviewer can reproduce checks. A draft PR may show blocked evidence, but blocked work is never marked ready for production.

## Handoff format
Outcome; base/head and branch; requirements; changed paths; commands/results; defects/risks; decisions; dependency status; next action. Provide only needed snippets and evidence references. Unexecuted tests use NOT RUN, failed tests use FAIL, and environmental blockers use BLOCKED with their actual cause.

## Team metrics
Measure first-pass gate rate, loops to acceptance, escaped regressions, rework, lead time, review age, context capsule completeness, and security test coverage. Baseline unknown. A two-loop target is subordinate to correctness and honest evidence; never suppress failures to improve metrics.
