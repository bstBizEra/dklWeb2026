# QA_CHECKLIST.md — DK LAO Acceptance Criteria Before Delivery

## 1. Purpose

This file controls final quality checks before any DK LAO page, component, form, API, or release is marked complete.

## 2. Strategic QA

Confirm:

- The work supports DK LAO's business model.
- The work improves lead generation or operational clarity.
- The page does not behave like a static brochure.
- The output supports future CRM, rental, service, inventory, contract, or billing expansion where relevant.

## 3. Design QA

Confirm:

- DK LAO colors are used correctly.
- Official logo/favicon assets are used.
- Slogan graphics come from approved path if used.
- Typography is consistent.
- Cards, buttons, and sections follow tokens.
- Layout is premium, industrial, and professional.
- Motion supports business meaning.
- Reduced-motion preference is respected.

## 4. Frontend QA

Confirm:

- Page is responsive on desktop, tablet, and mobile.
- No horizontal scrolling on mobile.
- Components are reusable and typed.
- Images are optimized.
- Links work.
- CTA buttons are visible.
- Forms have clear validation.

## 5. Backend/API QA

Confirm:

- Input validation exists.
- API response shape is consistent.
- Errors are user-safe.
- Leads capture source page and lead type.
- Uploads are restricted.
- Secrets are not exposed.

## 6. Content/SEO QA

Confirm:

- SEO title and meta description exist.
- No unsupported claims exist.
- No fake prices or stock claims exist.
- CTA copy is clear.
- Lao/English labels are consistent where used.

## 7. Release QA

Before production:

```txt
lint passes
typecheck passes
build passes
links:check passes
forms tested
404 checked
mobile checked
favicon checked
analytics checked if enabled
no placeholder content remains
CHANGELOG updated
```

## 8. Link Check

> Added 2026-10-25 by Claude (Motor Agent) at owner request, after a link audit found one dead link
> (the app's "Company profile" pointed at the old live site). Extend-only addition.

`pnpm links:check` (`scripts/check-links.mjs`) crawls every page reachable from `/` and `/app` on a running
site and checks every link it finds. Run it before each release and after any change to routes,
navigation, cards, footers or contact facts.

```powershell
pnpm build
pnpm start                                  # in its own terminal, serves http://127.0.0.1:3001
pnpm links:check                            # checks http://127.0.0.1:3001
pnpm links:check https://snare-snowsuit-obnoxious.ngrok-free.dev   # another running copy
pnpm links:check --skip-external            # offline: internal links and anchors only
```

It fails (exit code 1) and lists each problem when:

- an internal page answers 4xx or 5xx, or redirects,
- a `#anchor` link has no matching `id` on its target page,
- a `tel:` or `mailto:` link is malformed,
- an external URL answers 400 or above, or cannot be reached.

Known limits:

- External sites are judged by status code only. Facebook and X can answer 200 with a login page, so
  open those by hand when a social link changes.
- `/admin` and `/api` are not crawled.
- Links that only appear after a click or in client-side state are not seen; the crawl reads the HTML each
  page serves.

## 9. Local CI (`pnpm verify`)

> Added 2026-10-31 by Claude at owner request ("build local & work local") while GitHub Actions could not
> start workflows. Extend-only addition.

`pnpm verify` (`scripts/verify-local.mjs`) runs every CI gate on this machine, continues past a failure and
prints a pass/fail summary: version records, tests, lint, typecheck, and a build without a database. With
`TEST_DATABASE_URL` set to an **empty throwaway** PostgreSQL database it also runs CI's database job:
`pnpm cms:migrate`, then `src/lib/leads/rate-store.db.test.ts`. A passing `pnpm verify` is the
acceptance evidence when GitHub Actions is unavailable; record its summary in the pull request.

```powershell
pnpm verify
$env:TEST_DATABASE_URL="postgresql://USER:PASSWORD@127.0.0.1:5433/dklao_ci_empty"; pnpm verify
```

Then check the built site at `http://localhost:3001/` (`pnpm start`) for any visible change.

