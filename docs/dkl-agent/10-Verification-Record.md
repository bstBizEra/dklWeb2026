# DKLA-VERIFY-001 — Evidence ledger

Original evidence: 2026-10-08. Suite reorganization: 2026-10-09. Head/base context: existing GitHub revision `29057c6435f65c3f8448532c094f9604542b43d8`; document overlay is uncommitted local output.

| Check | Actual result | Evidence / interpretation |
| --- | --- | --- |
| GitHub canonical repository discovery | PASS | Plugin returned private bstBizEra/dklWeb2026 |
| Selected governance/source inspection | PASS | Master/bootstrap, API/data/security/QA, lead handler/schema/local store read |
| Recursive source inventory | PASS | 81 blob paths; response not truncated |
| Hosted-shell Git clone | BLOCKED | HTTPS clone failed: could not read Username; no credential available |
| Binary asset materialization | NOT RUN | Connector text APIs cannot provide binary bytes through attempted blob route |
| Windows C:\laragon\www\dklAgent write | NOT RUN | Path not mounted here |
| Vercel matching project | NOT FOUND IN SEARCH | Search dkl returned zero; differently named projects not ruled out |
| Supabase project listing | EMPTY RESPONSE | Connector returned projects []; no live project selected |
| Application test/lint/typecheck/build | NOT RUN | Full authenticated source clone unavailable; no application success claimed |
| Database/RLS tests | NOT RUN | No schema applied or project configured |
| AI Lao/English evaluations | NOT RUN | No live model configured/called |
| Script structural and document checks | PASS (static only) | Six required document files, ownership/provenance, code fences, 28 QA cases and clone-script safety clauses checked; PowerShell unavailable here, so no Windows execution claim |
| PR/merge/deployment | NOT RUN | No external Git writes or production changes |

The earlier new scaffold is excluded from this delivery and its tests cannot serve as evidence for the canonical repository. Expected outcomes in QA remain separate from actual outcomes.

Suite v1.1 static validation: six revised primary documents, FSD behavior-to-test mapping, supporting specifications and preserved bootstrap paths checked. Application/Windows execution status is unchanged.

## Windows local execution — 2026-10-09

The canonical repository was cloned at baseline `29057c6435f65c3f8448532c094f9604542b43d8` and the suite was applied on `feature/DKLA-001-agent-lifecycle`. Initial `pnpm install --frozen-lockfile` stopped because pnpm required build-script decisions; `pnpm-workspace.yaml` now denies builds for `sharp` and `unrs-resolver`, and frozen install passes. `pnpm test -- --run` passed (4 files, 9 tests); `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm version:status` passed. No commit, push, PR, merge, deployment, database, or live AI run occurred.

## Production-build development evidence — 2026-10-09

Branch `feature/DKLA-production-build` remains a local preview at version `0.6.0`. Added staff authentication and membership checks, public intake migration, scoped lead reads and changes, verified knowledge search, and inquiry pages for linked public routes. No live project was connected.

| Check | Actual local result | Limit |
| --- | --- | --- |
| Frozen install | PASS with optional `sharp` and `unrs-resolver` build scripts denied | Does not prove a hosted install |
| Vitest | PASS: 6 files, 13 tests | No live Auth or provider integration |
| Lint, typecheck, build, version status | PASS | Build uses no production credentials |
| Synthetic PostgreSQL | PASS: four migrations applied; identity, organization isolation, lead retry/version, intake rate limit and knowledge visibility assertions passed in a temporary test database | Supabase Auth/RLS in a real project and restore remain untested |
| Browser | PASS: 14 linked public routes returned 200; rental inquiry at 360, 768 and 1440 widths had no horizontal overflow; anonymous staff session/leads/knowledge returned 401 and `/staff` redirected to sign-in | No signed-in staff flow, Lao human review, or customer data |
| Production dependency audit | PASS: zero known advisories after upgrading Next.js and its ESLint config to 16.4.0 and pinning patched transitive browser data packages | Registry advisory data is a point-in-time check, not a hosted security test |

Production blockers: the owner selected the BizEra Supabase organization, but the connected account lists no project and its required cost-check tool is unavailable; Vercel lists no matching project. Staff roster and quotation approver, approved bilingual source files, data-use and retention decisions, staging restore, and live monitoring are pending. Do not activate production intake or staff access from these local results alone.
