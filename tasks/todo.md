# dklAgent build checklist

## Foundation

- [x] Verify clone, source revision, public route contract, and baseline checks. Evidence: `10-Verification-Record.md`.
- [ ] Add staff authentication, active membership lookup, and denied-by-default private routes. Verify anonymous and inactive users cannot access records.
- [ ] Add Postgres schema, foreign keys, RLS policies, and a repeatable synthetic database test. Verify cross-organization and cross-role denial.

## Business flows

- [ ] Make public quote intake durable with server-generated status/time, size and spam limits, and idempotent retry. Verify the old response envelope and no duplicate accepted lead.
- [ ] Add scoped lead/customer views and pipeline transitions with version checks and audit. Verify invalid and concurrent transitions leave records unchanged.
- [ ] Add owner/due follow-ups, accepted handoffs, and support tickets. Verify recipient and completion rules.
- [ ] Add verified bilingual knowledge search and a read-only assistant fallback. Verify unknown price/stock and malicious source text cannot create claims or actions.
- [ ] Add immutable quote drafts and separate approval. Verify version binding and no automatic customer dispatch.
- [ ] Add scoped reporting and operational error evidence. Verify denied aggregate access and correct synthetic counts.

## Release

- [ ] Run focused tests, lint, typecheck, build, browser QA at 360/768/1440 widths, and Lao shaping review.
- [ ] Prove database migration, RLS, backup/restore, retry, and load checks in isolated staging.
- [ ] Configure approved staff, commercial authority, knowledge, data policy, and production services; deploy an exact reviewed revision and verify monitoring and rollback.
