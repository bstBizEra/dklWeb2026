# DK LAO Business Agent — concept-to-launch suite v1.1

Date: 2026-10-09 (Asia/Vientiane). Status: design drafts; application implementation and launch remain unverified. Foundation: existing `bstBizEra/dklWeb2026`, inspected revision `29057c6435f65c3f8448532c094f9604542b43d8`. Target checkout: `C:\laragon\www\dklAgent`.

## Six primary documents
| Document | Accountable owner | Lifecycle question |
| --- | --- | --- |
| 01-PRD.md | Product Manager | What, why, who, scope and success |
| 02-Technical-Design.md | Engineering Lead / Architect | Architecture, data, APIs and technology |
| 03-Functional-Specification.md | Product Manager / Systems Analyst | Workflows, behaviors, states and errors |
| 04-QA-Test-Plan.md | QA Lead | Test strategy, cases and pass/fail evidence |
| 05-Deployment-Release-Plan.md | DevOps / Release Engineer | Rollout, configuration, flags and rollback |
| 06-User-Guide-Release-Notes.md | Technical Writer / Product Marketing | Usage, FAQs and verified release changes |

## Supporting specifications and execution controls
UX, clickable low-fidelity wireframes, ERD/data dictionary and security review live under `supporting/`. These remain required inputs and release gates; reorganizing the stack does not remove security or data integrity checks. Agent-team rules, repository inventory, work packages and evidence ledger remain documents 07–10.

## Traceability and reading order
PRD R01–R10 → FSD F01–F13 → TDD modules/contracts and supporting schema → QA-001–028 → release evidence → verified user guide/release notes. Read PRD, FSD and UX for behavior; TDD/ERD/security for implementation; QA/release plan for launch. Source governance is root AGENTS.md and con_agents master/bootstrap; load relevant companion controls before work.

## Source authority and status
Explicit owner instructions and canonical governance take precedence. Pinned source establishes implemented behavior. The uploaded 2026 summary describes commercial intent and differs from inspected routes/version; the 2024 catalogue is historical. No price, stock, guarantee or SLA is inferred from these descriptions. Proposed feature flags, role policies and performance budgets are not deployed settings.

The hosted shell could not authenticate the private Git clone; Windows path is not mounted here. The supplied bootstrap performs the real clone and overlay on the user's machine. No software tests, RLS proof, live AI run or deployment is marked passed. Suite v1.1 changes documents only and does not alter the application's version.
