# CMS Email Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require a 10-minute emailed six-digit key before each new Payload email/password sign-in.

**Architecture:** A PostgreSQL challenge row holds a keyed code hash, expiry, bounded attempts and one-time proof hash. Public request/verify endpoints issue an HTTP-only proof cookie. Payload's `beforeLogin` hook atomically consumes that proof after password validation and before session issuance. A branded entrance page precedes the existing login form.

**Tech Stack:** Next.js 16.2.9, Payload 3.80.0, PostgreSQL 16, Node crypto, Nodemailer, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-05-cms-email-entry-design.md`

## Global Constraints

- Only existing CMS account emails receive a key; public response must not reveal account existence.
- A key has six decimal digits and expires 10 minutes after issue.
- The verified email must match the existing Payload email/password login.
- Keep Payload password storage, sessions, roles and permissions; replace adviser allowlist enforcement.
- DK LAO is the only logo; use approved BizEra colours and left/right login composition.
- Fail closed when database, SMTP, or proof verification fails. Keep Apache IP rule until the release is verified.

## Review Focus

- Two concurrent verifications of one code: exactly one succeeds; test in Task 1.
- Five wrong code guesses followed by the correct code: correct code fails and a new code is required; test in Task 1.
- An older code after a resend: old code fails; test in Task 1.
- A verified proof used with another account email: password login fails; test in Task 2.
- Direct POST to `/api/users/login` without a proof: password login fails; test in Task 2.

---

### Task 1: Durable email key and proof store

**Files:** Create `src/lib/auth/email-entry.ts`, `src/lib/auth/email-entry.test.ts`, `src/payload/migrations/20261105_160000_email_entry.ts` and matching snapshot; modify migrations index.

**Interfaces:** Produce `requestEntry(email, now): Promise<string>` (returns code for mailing only after an existing user lookup), `verifyEntry(email, code, now): Promise<string | null>` (returns random proof token), and `consumeEntryProof(email, token, now): Promise<boolean>`; production entry code never appears in logs, URLs or persisted plaintext. Store one row per normalized email. Code hash uses HMAC with `PAYLOAD_SECRET`, and proof hash uses SHA-256. Atomic SQL or transactions own every state transition.

- [ ] Write tests for 10-minute expiry, wrong guesses, resend invalidation, single-use proof and concurrent verification.
- [ ] Run focused tests and see the missing implementation fail.
- [ ] Add PostgreSQL migration and service with atomic transitions; run focused tests until pass.
- [ ] Run empty PostgreSQL migration gate and commit.

### Task 2: Request/verify endpoints and Payload login gate

**Files:** Create `src/app/api/cms-entry/request/route.ts`, `src/app/api/cms-entry/verify/route.ts`, tests; modify `src/payload/collections/users.ts`, `src/payload.config.ts`, `src/lib/auth/throttle.ts` and tests. Remove `src/payload/collections/admin-allowlist.ts` from config (retain its existing migration for audit history; remove the admin collection only after access has switched).

**Interfaces:** Request endpoint takes `{email}`, returns one generic response and sends the code with configured SMTP. Verify endpoint takes `{email,code}`, sets `cms-entry` HTTP-only, Secure, SameSite=Lax, Path=/ cookie with at most 10-minute remaining lifetime. The Payload `beforeLogin` hook reads this cookie and calls `consumeEntryProof(user.email, token, now)` after the password is valid. An absent, expired, reused or email-mismatched proof throws `Forbidden`. Request and verify endpoints have IP, email and overall rate limits.

- [ ] Write tests for enumeration-safe response, SMTP failure, rate limits, direct login bypass and mismatched email.
- [ ] Run tests and see missing routes/gate fail.
- [ ] Implement routes, email dispatch and login gate; pass focused tests, typecheck and lint.
- [ ] Commit.

### Task 3: Branded entrance page

**Files:** Create `src/app/(payload)/cms-entry/page.tsx` or an equivalent non-conflicting route, its client component and styles; modify Payload admin login page wrapper to redirect unauthenticated users without a valid entry proof. Preserve the existing email/password form.

**Interfaces:** Three states: email entry, code entry with expiry/resend, and continue to `/admin/login`. Use existing DK LAO logo and product imagery, BizEra tokens, semantic labels and keyboard focus. A valid Payload session bypasses this step until logout.

- [ ] Load Impeccable before UI edits; init/shape, reuse project components, then build.
- [ ] Test flow in the running app, capture light/dark and mobile screenshots, run critique, fixes, polish and full audit with detector and Lighthouse accessibility in both themes.
- [ ] Commit.

### Task 4: Release and Apache switch

**Files:** Update version records, changelog, deployment checklist and Apache live include (server only).

- [ ] Run `pnpm verify` and CI database migration gate; inspect PR review and merge.
- [ ] Deploy to preview and prove real email and password sequence using an existing test account.
- [ ] Deploy to production while Apache IP rule remains; prove a key reaches the existing owner mailbox and code plus password works through the allowed route.
- [ ] Back up Apache include; remove only `/admin` and `/api/users` IP restriction, rebuild Apache, gracefully restart and clear nginx cache.
- [ ] Verify direct login without proof fails, the owner opens the dashboard from another IP, and public site remains healthy; retain rollback copy and record any test that cannot be run.
