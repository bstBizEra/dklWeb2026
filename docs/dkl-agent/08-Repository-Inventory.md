# DKLA-INV-001 — Existing repository and reuse mapping

Evidence: GitHub connector, pinned commit `29057c6435f65c3f8448532c094f9604542b43d8`, inspected 2026-10-08. Recursive tree returned 81 blob paths, not truncated. Selected UTF-8 source and controls were read. Binary media and the full Git history were not materialized. No full local clone is claimed.

| Capability | Observed source | Reuse / change |
| --- | --- | --- |
| Framework | package.json | Next 16.2.9, React 19.2.7, TS 6.0.3; preserve |
| Dependencies | pnpm-lock.yaml | Frozen install; avoid switching to npm |
| Validation | src/lib/validation/leads.ts | Reuse types/enums; stop trusting public status/timestamp |
| Public lead submission | src/app/api/leads/quote/route.ts | Preserve ok/data/message and error envelope; add durable adapter |
| Lead persistence | src/lib/leads/local-store.ts | Writes data/leads-local.jsonl; replace production path with durable DB |
| Pages | src/app/page.tsx; src/app/about/page.tsx | Preserve / and /about; regression-check |
| Components | src/components/dklao/* | Reuse website shell and approved CTA/footer components where appropriate |
| Data | src/lib/data/homepage.ts; about.ts | Reuse approved portfolio and existing knowledge references |
| Brand/style | src/app/globals.css; con_agents/TOKEN.md | Consume central CSS tokens; keep official assets |
| Logos/media | public/images/logo/*; favicon; hero/anatomy paths | Obtain through real clone; no invented replacement |
| Unit tests | homepage.test.ts; about.test.ts; site-metadata.test.ts; leads.test.ts | Preserve, extend rather than delete |
| Governance | root AGENTS.md; con_agents/* | Read first and supplement with team model |
| Versioning | VERSION.json; scripts/version-status.mjs | Keep applicable version checks |
| Staff identity | No implementation established from selected paths | Build and verify before private data surfaces |
| CRM/tickets/tasks/AI runtime | Not established in inspected tree | New bounded extension, not claimed existing |
| Deployment/database | Vercel search dkl: zero; Supabase list: zero | Select an actual project before live integration |

## Material differences versus uploaded summary
The supplied 2026-06-18 summary describes /rental and /forklifts and v0.9.6. The inspected repository package version is 0.5.0; the tree confirms only / and /about as public page files. The website data links to routes such as /forklift-rental that were not found as page files in this baseline. Treat uploaded descriptions as intended content, not implemented routes. Do not silently invent those pages or alter existing route names in the lifecycle documents. Resolve through a scoped routing work package.

The supplied 2024 catalogue describes additional historical offerings such as automation and digital solutions. Do not promote them as current availability without commercial confirmation. Six current product/service lines remain the launch scope.

## Initial engineering gaps
1. Public handler validates input but allows user-supplied pipeline status and submission timestamp; server should assign NEW and current time.
2. No rate-limit enforcement is visible in the inspected public handler; verify deployment-level controls before claiming full protection.
3. Local JSONL storage does not establish durable serverless CRM persistence, scoped access or transactional audit.
4. Root HTML language is English; bilingual internal UI needs locale-aware accessibility.
5. No read-only/approved-write AI boundary, role matrix, staff login or customer portal isolation is established from this inventory.

These are design findings based on selected source, not a complete penetration test or a full repository security audit.
