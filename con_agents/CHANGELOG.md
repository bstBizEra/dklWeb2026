# CHANGELOG.md — DK LAO Agent Control and Platform Decision History

All notable changes to DK LAO agent-control rules, architecture, design system, data model, and deployment decisions must be documented here.

## [0.23.0] - 2026-10-31

### Minor Changed

- **Leads are no longer lost when the database stops answering** (found while testing this release; it predates it).
  - Reason: when PostgreSQL went away while the server was connected (a restart, a crash, maintenance), a quote request waited with no answer: no fallback file, no email, nothing in the log except an uncaught exception. Reproduced on the production build with the new code switched off: database up 200 in 0.2 s; database stopped, no answer after 40 s, twice. The fallback added in 0.19 only worked when the database refused connections from the start.
  - Fix: the database save has an 8-second limit, then the lead goes to the fallback file (`databaseSaveTimeoutMs` in `src/lib/leads/store.ts`). The reference is chosen before saving and used on both paths, so a save that completes late carries the same reference as the file copy and the import skips it instead of duplicating it. The pool gets `connectionTimeoutMillis` (`DATABASE_CONNECT_TIMEOUT_MS`, default 5000) and an `error` listener (`watchPool` in `src/lib/cms/client.ts`), so a dropped connection is one log line, `[cms] database connection lost (57P01)`, instead of an uncaught exception.
  - Checked end to end on the production build against PostgreSQL 16: database up 200 in 0.16 s; stopped, 200 in 8.0 s twice with both leads in the fallback file; restarted, 200 in 0.03 s; `pnpm cms:import-fallback-leads` imported both, and a second run skipped them. Root cause inside Payload's adapter (`connectWithReconnect` holds one client and reconnects only on `ECONNRESET`) is not patched here; the time limit bounds the wait whatever the cause.
- **Shared quote-form rate limit in PostgreSQL** (review item 7).
  - Reason: the in-memory limit counts per process, so a second instance or a restart mid-window gave each process the full allowance.
  - New table `lead_rate_limits` (migration `20261031_120000_lead_rate_limits`, with the Supabase lockdown re-run as the migration test requires) and `src/lib/leads/rate-store.ts`: a sliding window estimated from two fixed windows, counted with one atomic upsert through Payload's own connection pool. Used whenever `DATABASE_URL` is set (`LEAD_RATE_STORE=memory` forces memory). Refused requests are counted too, so a client that keeps sending stays refused. Old windows are deleted as the form is used; no cron job.
  - Failure: a database error or a reply over 1.5 s limits that request from memory instead, logs once a minute and raises `ratelimit.store_failed`. The form never fails because of the limiter (`checkLeadLimit` in `guard.ts`).
  - QA: against real PostgreSQL 16, two limiter instances standing in for two processes share one count, and 20 simultaneous requests through four instances let exactly 5 through. The migration applies, rolls back and re-applies. End to end on the production build: three requests, server restarted, three more from the same address, the sixth refused (429); the in-memory limit would have reset. These database tests now run in CI's migrations job.
- **Production deploys with approval** (review item 8).
  - Found: the preview instance is also what the go-live step would put live, so after go-live every push to `main` and every `deploy:preview` pull request would deploy to the live site and run migrations on its database.
  - `scripts/server/dklao-deploy` replaces `dklao-deploy-preview` and serves two targets, fixed by each key's forced command. `preview` keeps the current settings (and is the default, so the old forced command keeps working). `production` has no defaults and refuses to run until `~/.config/dklao-deploy-production.conf` sets its folder, port, settings file and restart file; it dumps the database before every release. If production is configured on the preview instance, that must be confirmed (`SHARED_WITH_PREVIEW=yes`) and preview deploys are then refused. Settings files accept only known keys.
  - `.github/workflows/deploy-production.yml`: started by hand from `main` with the version to release; checks that `main` is at that version, runs every gate including the build, waits for the `production` environment's approval, deploys with its own key and queue, and confirms the live site serves the version.
  - QA: the script is now tested by running it (`src/lib/data/deploy-script.test.ts`): real git repositories and bundles in a temporary home, stand-ins for pnpm, curl and pg_dump. 9 cases: preview deploy, the old forced command, a dump before a migration change, rollback after a failed build, wrong tags and commands refused, production refused when unconfigured, a separate production instance deployed with a dump while the preview is untouched, the shared-instance confirmation closing preview deploys, unknown settings refused.
  - Owner decision needed before go-live: a separate production instance (recommended; one more Node process, 210 MB measured, and its own database) or production on the preview instance (no preview any more). Steps for both: `docs/deploy-checklist.md` §3b.
- **Operations alerts** (review item 9). `src/lib/ops/alert.ts` raises `lead.all_failed` (critical), `lead.not_in_cms`, `lead.email_failed`, `lead.webhook_failed`, `ratelimit.store_failed` and `ratelimit.no_address`. Each is logged as `[alert] ...` and, when set, sent to `OPS_ALERT_WEBHOOK_URL` (Slack and Discord work as they are; signed with `OPS_ALERT_WEBHOOK_SECRET`) and `OPS_ALERT_EMAIL`, at most once per kind per 15 minutes with a count of those held back. Alerts carry the lead reference and a short reason only. They never delay the visitor's answer and never throw. The webhook address check is shared with the lead webhook (`safeWebhookUrl`). An external uptime monitor is still needed for "site down" (checklist §10).
  - QA: 47 new tests (345 total: 341 pass here and the 4 PostgreSQL tests pass against a local PostgreSQL 16, and run in CI); lint and typecheck clean; build passes. The outage run above logged `[alert] warning lead.not_in_cms` and `[alert] warning ratelimit.store_failed` once each.
  - New dev dependencies `pg` and `@types/pg`, at the versions already in the lockfile, for the database tests only.
  - Rollback: revert this release. The `lead_rate_limits` table can stay (unused) or be dropped with the migration's `down`. Server-side: nothing changes until the owner installs the new script.

## [0.22.0] - 2026-10-31

### Minor Changed

- **Content-Security-Policy, step 1: report-only** (owner request: "implement items 4-6", codebase review item 4).
  - Reason: the site had no CSP, which left the admin and the lead forms without a second line of defence against injected scripts.
  - Policy (`src/lib/security-headers.ts`): own origin only for scripts, styles, images, fonts, connections, workers and frames; `object-src 'none'`; `frame-ancestors`, `base-uri` and `form-action` `'self'`; no `unsafe-eval` in production (added only for `next dev`). `'unsafe-inline'` stays for scripts (Next.js page data, the JSON-LD and `/app` platform scripts) and styles (GSAP), because nonces would make every page render per request. Sent as `Content-Security-Policy-Report-Only` (`cspMode`), so nothing can break yet. It covers `/admin` too, so its reports show what Payload's admin would need.
  - New `POST /api/csp-report` (`src/lib/csp-report.ts`): reads both report formats, logs `[csp] <directive> blocked <origin> on <path>` once per distinct violation per process, never query strings or script samples; 16 KB cap, 20 reports per address per minute, always 204.
  - Found and fixed while testing: Zod 4 probes `new Function("")` in the browser, so every page with a form (`/`, `/contact`, `/request-quote`, `/app/request`) filed an eval violation. The forms would have kept working under enforcement (Zod catches it), but every view would have filed a false report. `z.config({ jitless: true })` in `src/lib/validation/leads.ts` removes the probe; test in `leads.test.ts`.
  - Found while testing: with both `report-uri` and `report-to`, Chromium ignores `report-uri` and uses the batched Reporting API, which delivered nothing within 65 seconds (headless Chromium, minimal reproduction); `report-uri` alone arrived at once. The policy therefore uses `report-uri` only and sends no `Reporting-Endpoints` header.
  - QA: production build in headless Chromium, 13 paths (home, about, contact, quote, rental, used sales, an industry page, knowledge center, a 404, `/app`, `/app/request`, `/app/services`, `/app/offline`) at 1440x900 and 390x844, scrolled: no CSP messages and no page errors, and the hero's GSAP scene still moves. A deliberate cross-origin image on `/about` reached the endpoint and logged exactly `[csp] img-src blocked https://example.com on /about` (the `?visitor=` query was dropped). Not checked: `/admin`, which needs a database; its reports will come from the preview.
  - Next step (a release of its own): review the `[csp]` lines from the preview, including `/admin`, then set `cspMode` to `"enforce"`.
- **Request bodies are capped in bytes while they are read** (review item 5). `request.text()` read the whole body before the 20,000 check, and the check counted characters, not bytes. `src/lib/http/read-body.ts` refuses a declared `Content-Length` over the cap without reading and cuts a streamed body off as soon as it passes the cap (tests: Lao text counted in bytes, a character split across chunks, a lying `Content-Length`, at most 3 chunks pulled for a 100-byte cap). Used by the quote route and the CSP endpoint. The API answer is unchanged (400 `VALIDATION_ERROR`).
- **Sitemap dates are real** (review item 6). Every entry carried `lastModified` set to the build time, a signal search engines learn to ignore. Now a page carries the CMS row's `updatedAt` when it has a published CMS row (`getPageDates` in `src/lib/cms/pages.ts`), and no `lastModified` otherwise. The sitemap is regenerated at most hourly on the running server (`revalidate = 3600`), because the build runs without the database settings.
  - Not done: rebuilding the `.ua/` knowledge graph. It needs the Understand-Anything `/understand` Claude Code plugin, which was not available in this session; the graph is generated output and was not edited by hand. Run `/understand` (see `docs/knowledge-graph.md`) after this merges.
  - QA: 22 new tests (298 total, all pass); lint and typecheck clean; build passes.
  - Rollback: revert this release. No data or migration changes; removing `/api/csp-report` only stops the reports.

## [0.21.3] - 2026-10-31

### Patch Changed

- **Quote-form hardening from the 2026-10-31 codebase review** (owner request: "implement items 1-3").
  - **No form-wide lockout when the visitor's address is missing.** Requests without a usable `X-Real-IP` all count as one client (`"unknown"`). With the per-address limit of 5 per 10 minutes, a proxy change that stopped sending the header would have closed the quote form for every visitor after five requests, silently. That bucket now has its own budget, `LEAD_SHARED_RATE_LIMIT` (default 60 per window): enough for real traffic, still a ceiling on a flood. In production the server logs one warning naming the cause (`src/lib/leads/rate-limit.ts` `sharedRateLimitConfig`, `src/lib/leads/guard.ts` `limiterFor`). Visitors with an address keep their own 5-request budget, and spoofed forwarding headers are still ignored.
  - **Fallback leads are visible and can be imported.** When the database save fails, the lead still goes to `data/leads-local.jsonl`, but staff working in `/admin` could not see it. Now: the file is created with mode 600 (customer details); the journal gets `[leads] FALLBACK <leadId> ...` with the fix; the email subject starts with `[NOT IN CMS]` and the body says how to import it; the webhook carries `notInCms: true`. The new `pnpm cms:import-fallback-leads` (`scripts/import-fallback-leads.ts`, logic in `src/lib/leads/import-fallback.ts`) imports the file into the `leads` collection, keeping each lead's reference, skipping leads already in the CMS (safe to re-run), reporting bad lines by number and printing references only, never customer details. It never edits or deletes the file. `FALLBACK_LEADS_FILE` reads another copy. The CMS row mapping is shared with the normal save (`leadDocData` in `store.ts`).
  - **The server refuses to start without a proper CMS secret.** `payload.config.ts` used `PAYLOAD_SECRET ?? ""`. The config only loads on first CMS use and the CMS loaders fall back to built-in content on any error, so a missing secret went unnoticed (checked: the server answered 200 with built-in pages). `src/instrumentation.ts` now checks at startup: in production, with `DATABASE_URL` set, a secret shorter than 32 characters stops the process with exit code 1 and `[startup] PAYLOAD_SECRET must be at least 32 characters ...` (the secret itself is never printed). Exiting rather than throwing matters: with `server.mjs`, Next logs a thrown error and then answers 500 to every request while the process stays up. Not checked during `next build` (the preview server builds without the site's settings), without a database, or in development.
  - QA: 26 new tests (276 total, all pass): shared-bucket budget and one-time warning in the route, fallback flag, log line and file mode, email and webhook markers, file parsing and idempotent import, the secret rules. The two new route tests fail with the old limiter. `next build` passes without `PAYLOAD_SECRET`. The production server was checked four ways: database and no secret (exit 1), database and a 5-character secret via `next start` (exit 1), database and a 40-character secret (200), no database and no secret (200). Lint and typecheck clean.
  - Operator note: the checklist (§3) generates `PAYLOAD_SECRET` as 32 random bytes in hex (64 characters), which passes. Confirm the preview's `~/.config/dklao-site.env` value is at least 32 characters before deploying, otherwise the service will not start (the deploy then rolls back). `docs/deploy-checklist.md` and `FORMS_AND_LEADS.md` are updated.
  - Rollback: revert this release. No data, route or migration changes.

## [0.21.2] - 2026-10-27

### Patch Changed

- **Unknown URLs always answer 404 (no soft 404s).**
  - Reason: the catch-all route `src/app/(site)/[...slug]/page.tsx` had `dynamicParams = true` with `revalidate = 60`, so Next.js rendered any unknown slug (such as `/no-such-page`), called `notFound()` and saved that not-found render to the on-disk page cache (`.next/server/app/no-such-page.html|.meta|.rsc|.segments`). A server process started later without a rebuild (for example a `dklao-site` restart on the preview server after a settings change) could read that entry and answer 200 with the error page, which search engines treat as a soft 404. Every made-up URL also added files to the disk.
  - Fix: `dynamicParams = false`. Every page of this route comes from `generateStaticParams()` (published routes in `src/lib/data/routes.ts` with page data in `sitemap-pages.ts`); the CMS only edits a route's content and cannot add a route, so no valid page needs dynamic params. Unknown slugs now get a 404 before rendering and nothing is cached (Next.js 16 docs: `dynamicParams` false returns 404 for params not in `generateStaticParams`; Cache Components, where the option is unavailable, is not enabled).
  - QA: new `server.test.ts` case starts two fresh servers one after the other against the same build, asks each for `/no-such-page` and `/no/such/page`, and checks both answer 404 and that no cache file is written. It failed before the fix (cache files written) and passes after it.
  - Rollback: revert this release; no data, route or content changes.

## [0.21.1] - 2026-10-27

### Patch Changed

- **Lift-off hero redesigned as a "drive-in"** (owner request, 2026-10-27: the boxed photo hero looked flat; research pointed to layered parallax with a cut-out object; the owner chose this option and then removed the fork lift and the level bar).
  - The boxed studio photo is replaced by a warehouse stage: racking drawn in CSS at the back, a lit floor, and the owner-chosen Toyota 3.5 t cut-out (`public/images/hero/toyota-35-50-forklift-cutout.webp`, already used in the footer) carrying a pallet of cartons drawn as SVG over the forks (`PalletLoad` in `main-hero.tsx`). No new artwork or library.
  - On load (motion allowed): the truck drives in from the right, runs slightly past its mark and settles back; its shadow and the racking fade in (CSS keyframes `hero-drive-in`, `hero-shadow-in`, `hero-depth-in` in `globals.css`, replacing the three photo keyframes).
  - Scroll on desktop (pinned 1.2 screens): the racking and the blueprint grid drift at different speeds for depth ("grid" beat); at the "handoff" the truck rolls forward and grows slightly while the copy fades, the hero dims and the stripe thickens. The load is not lifted and there is no lift gauge.
  - Phones and short screens: the same drive-in on load and a gentle racking drift, no pin. Reduced motion: the stage at rest, nothing moves.
  - Fixed: the racking drift never ran, because its CSS fade-in (held by its fill mode) overrode GSAP's inline transform; the scene now moves a wrapper and the fade-in runs on the layer inside. A test checks no `data-lift` element carries a CSS animation.
  - QA: 257 of 258 tests pass (the failure is the Windows-only executable-bit check in `deploy-preview.test.ts`); lint and typecheck clean; production build checked in Chromium at 1440x900 (drive-in, pin, depth drift, handoff, no GSAP warnings), with reduced motion (nothing moves, no pin) and at 390x844 (no pin, no horizontal scroll).
  - Known limits: the cut-out is 698px wide, so it is slightly soft on high-density screens; a larger source image would fix it. The owner should confirm a Toyota-branded truck may lead the homepage (no unsupported distributor claims, `CONTENT.md`).
- **Homepage console clean:** three "GSAP target not found" console warnings on the homepage are gone (`site-motion.tsx` no longer tweens empty lists; test in `motion.test.ts`). Present since 0.20.x; found while checking the scene.
- **Preview deploys restart the site without sudo.** The `dklao` SSH shell is cPanel's jailshell (nosuid), where `sudo` cannot work, so the first real deploy was refused at the restart. `scripts/server/dklao-deploy-preview` now writes `~/.deploy/restart-request`, which the root systemd path unit `dklao-site-restart.path` turns into `systemctl restart dklao-site` and nothing else; the health check waits until the new Next build ID is served. The unused sudoers rule was removed. Tested with the restricted key on 2026-10-26, then by the first GitHub Actions deploy (run 40351591047). Server setup recorded in `docs/deploy-checklist.md` §3a.

## [0.21.0] - 2026-10-26

### Minor Changed

- **Homepage scroll scenes, part 1: scene system and scene 01 "Lift-off"** (owner request: start with the master brief and the Lift-off hero from the scroll-scenes prompt library).
  - Reason: turn the homepage into one authored scroll story (a forklift lifts DK LAO's offer into view, carries it down the page and sets it down at the quote form), using only the approved motion patterns in `DESIGNS.md` §13.
  - Scene system: `src/lib/motion/scene-config.ts` (shared conditions: motion only without reduced motion; full scene from 781px wide and 640px tall; lighter, never-pinned version on phones and short screens; timings from `TOKEN.md`; pin budget of 6 screens for the homepage; `NEXT_PUBLIC_MOTION_DEBUG=1` shows ScrollTrigger markers) and `src/components/dklao/scenes/use-scene.ts` (one `gsap.matchMedia()` per scene, scoped to its section, reverted on unmount or when a condition changes). Sections that become scenes carry `data-scene`; the site-wide reveal and focus fix in `site-motion.tsx` now leave them alone so nothing is animated twice.
  - Lift-off (`src/components/dklao/scenes/lift-off.tsx`, `main-hero.tsx`): on desktop the hero pins for 1.2 screens and fills the screen below the header while pinned. Scroll-linked beats: "raise" (frame up 44px, photo raised in its frame, a red-orange lift gauge fills), "grid" (blueprint grid drifts), "handoff" (copy rises out, hero dims, brand stripe thickens into the proof band). Scrolling back up reverses it. On load the eyebrow, headline, text and buttons now rise in 80ms apart instead of as one block. Phones get a gentle photo drift only; reduced motion shows the original hero at rest. Keyboard users who tab into the hero after the copy has faded are scrolled back to the start.
  - The blueprint grid and the brand stripe moved from the section background and `::after` to their own layers so the scene can move them; at rest the hero looks as before.
  - Business impact: a stronger first impression on desktop without hiding the main calls to action, which stay visible and usable until the hand-off.
  - QA: 13 new tests in `src/lib/data/scenes.test.ts` (245 total pass); lint, typecheck and build clean. Production build checked in Chromium at 1440x900 (pin, no console errors, keyboard return), 390x844 (no pin, no horizontal scroll) and with reduced motion (no pin, hero unchanged). Storyboard of the captured frames shared with the owner.
  - Rollback: revert this release; no data, route or content changes.
- **Automatic preview deploys (CI/CD to preview.dklao.com)** (owner request: deploy the scene to the preview through CI/CD).
  - Reason: the preview needed a manual SSH session per release; owner review of each scene should be one click.
  - `.github/workflows/deploy-preview.yml`: on a push to `main`, a pull request from this repository labelled `deploy:preview` (and its later pushes), or a manual run. It runs version, test, lint and typecheck checks, bundles the commit as `preview-<run>-<sha>`, sends it over one SSH connection, then confirms preview.dklao.com serves the new version. One deploy at a time; forks never deploy; the job waits in the GitHub `preview` environment for the owner's approval when required reviewers are set.
  - `scripts/server/dklao-deploy-preview` (installed as `~/bin/dklao-deploy-preview` for `dklao`): the only command the deploy key may run (`restrict,command=` in `authorized_keys`). Checks the requested tag, verifies the bundle, builds, dumps the database first when `src/payload/migrations` changed, restarts `dklao-site` through a sudoers rule that allows only that restart, checks the app answers on port 3110, and rebuilds and restarts the previous version if any step fails.
  - `ci.yml` stays check-only and secret-free. Setup steps, secrets and revocation: `docs/deploy-checklist.md` §3a; `DEPLOYMENT.md` §5 updated.
  - QA: the server script was run end to end in a sandbox clone with stubbed pnpm, sudo, curl and pg_dump: successful deploy, rejected command, failed build with rollback, failed health check with rollback, refused restart, migration change with dump, and failed dump aborting before restart. Tests in `src/lib/data/deploy-preview.test.ts`.
  - Not done by the agent (needs the owner): the deploy key, the sudoers rule, the `authorized_keys` line, the GitHub `preview` environment and its secrets, and SSH access from GitHub's runners through the server firewall.

## [0.20.1] - 2026-10-26

### Patch Changed

- **Version records corrected.** `con_agents/VERSIONING.md` still listed 0.18.0 (2026-10-25) as the current version after the 0.19.x and 0.20.0 releases; it now shows 0.20.1. `pnpm version:status` now also compares the VERSIONING.md "Current version", "Change level" and "Release date" lines with `VERSION.json`, so the next release that misses this file fails the check (and CI) instead of drifting silently.
- **README matches the code** (owner request). The technical sections described the original plan, not the built site. Rewritten: stack (Next.js 16, Payload CMS 3 + PostgreSQL, GSAP, pnpm; was Framer Motion, "CMS ready", Vercel), repository structure (`src/app/(site)|(app)|(payload)`, `src/components/{dklao,app,ui}`, `src/lib/...`, `con_agents/`), routes (the 26 published routes from `src/lib/data/routes.ts` plus `/app` and `/admin`; was 11 routes including `/used-equipment` and `/warehouse-solutions`, which do not exist), components, the single central quote form with its 8 categories (was four separate forms), install/dev/build commands (`pnpm`; was `npm`), quality gates, environment variables (from `.env.example`; was unused `NEXT_PUBLIC_*` names), deployment (cPanel server, see `docs/deploy-checklist.md`) and governance (`con_agents/`). Added a current-status note; the product-direction sections are unchanged and the product card model is marked as planned for Phase 2. Removed two stray code fences. `.env.example` no longer says production values live in Vercel.
- **`con_agents/AGENTS.md` stack matches the code** (owner request). §6 now lists the current stack instead of the original recommendation: GSAP instead of Framer Motion, Payload CMS 3 with its Postgres adapter instead of "PostgreSQL or MySQL" and "Prisma or Drizzle ORM", plus Nodemailer/webhook lead notification, Vitest, pnpm and Node.js 22. §5.3 names GSAP. The rule against new frameworks now also covers a second animation library and a separate ORM next to Payload.
- **Stack and deployment rules match the code** (owner request). `ARCHITECTURE.md` and `TECHNOLOGY_SOFTWARE_INFRA.md` now describe the current stack (GSAP, Payload CMS 3 with its Postgres adapter and reviewed migrations, PostgreSQL 16, Nodemailer and webhook notification, Vitest, pnpm, Node.js 22) instead of Framer Motion, MySQL and Prisma/Drizzle; Phase 2/3 now extend Payload first. `ARCHITECTURE.md` §7 shows the real `src/` folder structure. `DEPLOYMENT.md` and `TECHNOLOGY_SOFTWARE_INFRA.md` §7 record the cPanel server deployment (systemd + Apache, preview.dklao.com) instead of Vercel/Netlify options; other hosting needs change control and owner approval. `DEPLOYMENT.md` branch list now matches the root `AGENTS.md` (no `develop` branch; adds `design/dklao-website-2026` and `fix/*`) and its merge checks list the pnpm gates and CI.
- **Codebase knowledge graph** (owner request: use Understand-Anything on the preview.dklao.com code). `.ua/knowledge-graph.json` maps the repository with [Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) v2.9: 202 files analysed, 420 nodes (158 code files, 218 functions, 37 documents, 6 configs, 1 CI pipeline), 1,234 edges (imports, calls, tests, docs-to-code links), 10 architecture layers and a 15-step guided tour. Images, migration JSON snapshots and generated Payload types are excluded (`.ua/.understandignore`). Not loaded by the website. How to view and update it: `docs/knowledge-graph.md`. `.gitignore` skips the tool's local scratch files and `eslint.config.mjs` ignores `.ua/**`.

## [0.20.0] - 2026-10-26

### Minor Changed

- **Website asks phone visitors to install the app** (owner request: preview.dklao.com should ask users to install). New `AppInstallBanner` (`src/components/dklao/app-install-banner.tsx`) on every website page, phones only (under 780px, where the floating contact buttons are hidden): "Get the DK LAO app" with an Install button and Close. Install opens `/app?install`, where the existing card offers Chrome's Install button on Android or the Share > Add to Home Screen steps on iPhone; `?install` shows that card even if it was closed before, and where Chrome offers no install prompt (other browsers, or Chrome holding it back) the card shows the browser-menu steps (Install app / Add to Home screen) instead of nothing. Hidden inside the installed app and after Close (remembered on the phone under `dklao-site-app-banner-dismissed`).
- **Favicon refresh.** The website's icon URLs now carry the release version (`/favicon.ico?v=0.20.0`), so browsers fetch the current DK LAO icon after a release instead of a cached one. The icon files are unchanged (the official `FAV-Icon.png`).
- Tests in `src/components/dklao/app-install-banner.test.ts`.

## [0.19.4] - 2026-10-26

### Patch Changed

- **CMS emails are sent.** Payload had no email adapter, so password-reset and account-invite emails from `/admin` only went to the server log. `payload.config.ts` now uses `@payloadcms/email-nodemailer` 3.80.0 (same version as Payload) with the lead SMTP account (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`; on the server `notify@dklao.com`), sender name "DK LAO". Without `SMTP_HOST` there is no adapter, so developer machines keep logging emails instead of the adapter default of creating an online test mailbox. Settings come from `payloadEmailOptions` in `src/lib/leads/email.ts`, tested in `email.test.ts`.

## [0.19.3] - 2026-10-25

### Patch Changed

- **Quote-form rate limit can no longer be dodged with a made-up address** (security review, 2026-10-25). The limit used the first `X-Forwarded-For` entry, which the server's nginx passes on from the visitor, so a new made-up value on each request was never limited (shown from the internet against preview.dklao.com: 7 of 7 requests accepted with a rotating header). `clientKey` now uses `X-Real-IP`, which nginx overwrites with the address that actually connected, and uses `CF-Connecting-IP` only when that address is in Cloudflare's published ranges (the same list Apache trusts). `X-Forwarded-For` and `X-Vercel-Forwarded-For` are ignored; values that are not IP addresses fall into the shared bucket. Tests in `src/lib/leads/rate-limit.test.ts` cover spoofed headers, Cloudflare and non-Cloudflare connections, IPv6 and invalid values.
- **No caching of `/api` and `/admin` answers.** The host's nginx cache keys on the URL only and caches answers without a `Cache-Control` header for 60 minutes; Payload's API sends none. `next.config.ts` now sends `Cache-Control: private, no-store` for `/api/*`, `/admin` and `/admin/*`, so an answer to one visitor (or to the admin IP) is never replayed to another.
- **Preview hosting moved off Application Manager** (owner decision): the app runs as the systemd service `dklao-site` (user `dklao`, `127.0.0.1:3110`, settings in `/home/dklao/.config/dklao-site.env`, mode 600) behind an Apache proxy include for preview.dklao.com. `/admin` and `/api/users` on the preview answer only from the owner's public IP (Apache `LocationMatch` on nginx's `X-Real-IP`), set before the database settings were filled. See `docs/deploy-checklist.md`.
- **Preview connected to its database and mail** (owner request). New random passwords for the `dklao_app` database user and the `notify@dklao.com` mailbox were generated on the server and written only to the env file (nobody saw them). Lead email now sends from `notify@dklao.com` (`website@dklao.com` does not exist). On restart the app applied all migrations (31 tables, no users yet); `/admin` loads from the owner's IP. A test quote returned 200, was saved as a lead, and exim delivered its email to the info@dklao.com inbox. Open: Payload's own emails (password reset, invites) have no email adapter yet and only go to the server log.

## [0.19.2] - 2026-10-25

### Patch Changed

- **`app.js` entry file for cPanel Application Manager.** cPanel registers Node.js apps without a startup-file setting, so Phusion Passenger runs `app.js` from the app folder. `app.js` loads `server.mjs` with a dynamic `import()` and has no top-level `await`, because Passenger may load it with `require()`, which on Node 22 cannot load a module that uses top-level `await`. `server.test.ts` now starts the built app both ways (`node server.mjs`, and `require("./app.js")`): 8 checks pass. The deploy checklist names `app.js`.
- **First server deploy: private preview at preview.dklao.com** (2026-10-25). Code copied from this PC as a git bundle over SSH (repository is private; no deploy key), cloned to `/home/dklao/dklao-app` at tag `v0.19.2`, installed with pnpm 10.29.3 and built on the server with Node 22.23 as the `dklao` user (69 pages; logs in `~/deploy-logs/`). Smoke test on a private port: pages 200, unknown page 404; the app also starts through `require("./app.js")` on Node 22. Subdomain `preview.dklao.com` created in the dklao account (no DNS record at Cloudflare, so not public) and the app registered in Application Manager as `dklao-site-preview` (production) with APP_URL, DATABASE_POOL_MAX, SMTP_HOST, SMTP_PORT, SMTP_USER, LEAD_NOTIFY_EMAIL and a server-generated PAYLOAD_SECRET that nobody has seen. Through Apache and Passenger 6.2.1: all pages 200, unknown page 404; `/admin` 500 until the owner adds DATABASE_URL; HTTPS for the preview waits for a certificate. Not done: DATABASE_URL and SMTP_PASS (owner), end-to-end test, switch of dklao.com.

## [0.19.1] - 2026-10-25

### Patch Changed

- **Migrations run when the production app starts** (owner decision for the dklao.com cPanel deploy). `payload.config.ts` passes the migration list to the Postgres adapter as `prodMigrations`, so with `NODE_ENV=production` the app applies any pending migrations on start, using the `DATABASE_URL` the owner types into cPanel Application Manager. Nobody types the database password into a terminal; development still runs `pnpm cms:migrate` by hand, and `push: false` keeps schema changes in reviewed migrations. Test in `src/payload/migrations.test.ts`.

## [0.19.0] - 2026-10-25

### Minor Changed

- **iPhone web app at `/app`.** A second front end for customers on iPhone that looks and behaves like an iOS app instead of the website: system font, large titles, inset grouped lists, a translucent tab bar (Home, Services, Request, Location), iOS system colours with DK LAO blue and red as accents, light and dark mode, safe areas around the notch and home indicator. Its own root layout (`src/app/(app)/`), so the website header, footer, motion and stylesheet never load there; `noindex`, so search still shows the website. Routes in `ROUTES.md` section 4a.
  - **Home:** what DK LAO does, Request a Quote and Book a Service, one-tap Call, WhatsApp Sales, WhatsApp Service and Messenger, About (since 2010, Vientiane, open 24/7) and Trusted by.
  - **Services:** the seven Solutions services in the same two groups as the website menu (shared `groupMenuLinks`); a tap opens the request with that service chosen.
  - **Request:** one form, Quote or Service (iOS segmented control), sent to the existing `/api/leads/quote` and checked against the same schema. Service bookings record the problem, machine, site address and an optional site pin from "Use my current location", written into the lead message as a map link, lead type `SERVICE_BOOKING`. Contact details are remembered on the phone after a successful send, and the form is kept as a draft while typing, so a locked phone or lost connection loses nothing.
  - **Location:** office address with Apple Maps and Google Maps directions (the maps app searches the confirmed address; no pin is guessed), all contacts with their brand marks, hours, and "Send my site location", which opens the iPhone share sheet (or WhatsApp to the service team) with a map link.
  - **Works like an installed app:** web app manifest (`/app/manifest.webmanifest`, scope `/app`), home-screen icons built from the official favicon on a white square (no new artwork), standalone display, a one-time "Add to Home Screen" hint in Safari (iOS has no install prompt), and a service worker (`public/app-sw.js`) that serves the last visited screens or an offline page with the phone number when there is no connection. Lead requests are never cached.
  - **Location permission:** only `/app` may ask for location (`Permissions-Policy: geolocation=(self)`), and only when the customer taps a location button; the website keeps `geolocation=()`. Camera, microphone and payment stay off everywhere.
  - **Chosen from research:** in Laos, Messenger reaches about 60% of adults and WhatsApp leads for calls (DataReportal, Digital 2026 Laos), so both sit one tap away; iOS home-screen web apps support location, the share sheet and offline caching (WebKit). Left out on purpose because there is no backend for them yet: request tracking, push notifications, photo upload (the lead API takes no files), accounts, prices and stock.
  - **Contrast:** iOS's standard grey (0.6 alpha) is under 4.5:1 at the small sizes used, so secondary text uses 0.78 alpha; filled buttons keep DK LAO red and blue in dark mode so white text stays readable.
  - **Android gets its own look (Material 3).** A small script in the `/app` layout marks Android phones before the first paint (`<html data-platform="android">`), and an `android:` Tailwind variant switches every screen to Material 3: Roboto, regular-weight large titles, primary-blue list subheaders, list cards without separators or chevrons, round leading icons, a navigation bar with the pill indicator behind the current tab, outlined text fields with the label on top (blue when focused, red when invalid), a segmented button with a check mark, pill-shaped buttons and press state layers. Colour roles are generated from DK LAO blue (`--md-*` in `app.css`), light and dark; the Android status bar takes the Material surface colour. iPhone and other devices keep the iOS look.
  - **Installs as an app on Android.** Chrome's install prompt is caught early and shown as an "Install app" button on Home (iPhone keeps the Share > Add to Home Screen steps). The manifest adds maskable icons (`/app/icon/maskable-192|512`, the favicon kept inside the 80% safe zone so Android's round and squircle crops never cut it), long-press shortcuts on the app icon (Request a Quote, Book a Service, Send site location), `launch_handler: focus-existing`, `lang` and `categories`. Manifest content moved to `appManifest` in `src/lib/data/mobile-app.ts`, with a test of the install requirements.
  - **Native-feel checklist, both platforms:** Back works like an app (tab to tab replaces history, so Back from any tab goes to Home and Back from Home leaves the app); no text selection or long-press menu on interface text (form fields, the address and phone numbers stay selectable); no double-tap zoom delay, pull-to-refresh or overscroll bounce; images cannot be dragged; no scrollbar when installed; 17px (iPhone) and 16px (Android) inputs so the phone never zooms into a field.
  - New tests: `src/lib/data/mobile-app.test.ts` (contacts and maps only from confirmed facts, a service request passes the lead schema, every service opens the right request) and a `/app` location rule in `src/lib/security-headers.test.ts`.
  - Checked on the production build at 390x844 (iPhone 15 size) in light and dark: all four screens, empty-form errors with focus on the first problem, a service request with a site pin (the real API accepted the fields and failed only on the local database, which is off; the success screen was checked with the API simulated), the manifest, icons, offline page, service worker control, and the location policy on `/app` versus the website. Not checked on a real iPhone: Add to Home Screen, the location prompt, the share sheet and opening WhatsApp, Messenger and Maps from full-screen mode.
  - Android checked at 412x915 with an Android Chrome user agent, light and dark: Material look on all screens, status bar colour, Back (three tab switches added one history step; Back returned Home), the Install card and button (Chrome's prompt simulated), and the public manifest and maskable icons through the ngrok preview. The iPhone look was rechecked on the same pages. Not checked on a real Android phone: the real install prompt, the installed window, icon shortcuts and the maskable crop.
  - **Install fix found on a Samsung S24 (Edge): "This app cannot be installed".** Browsers fetch the web app manifest without cookies by default. Behind the free ngrok preview, a request without ngrok's "Visit Site" cookie gets ngrok's warning page instead of the file, so the phone received HTML, not a manifest, and showed a blank "N" icon. The `/app` layout now writes the manifest link itself with `crossorigin="use-credentials"` (Next's `metadata.manifest` cannot). Checked through the preview: without cookies the manifest URL returns ngrok's HTML, with cookies it returns the manifest, and the page's link now sends them. The app icons have the same limit behind ngrok (HTML without cookies, PNG with them); if the phone fetches icons without cookies the preview may still install with a plain icon or not at all. On the real domain there is no warning page, so neither applies.
  - **App info screen (`/app/info`), iPhone and Android.** A native-style About page, opened from Home > About > App info, with a back button that pops history (iPhone "‹ Home", Android arrow). It carries the lines every DK LAO footer must show: app icon, version and release date (from `VERSION.json`), "Copyright © DK LAO Since 2010-current year", website and Facebook, and "Develop by: BizEra" linking to https://www.bizera.la/. A Privacy & data group says when location is read, that the app has no login, tracking or advertising (no analytics code exists in the project), and offers "Clear saved details", which removes everything the app keeps on the phone (`appStorageKeys`: contact details, unsent draft, install card closed). The short footer stays at the bottom of Home.
  - **Owner review on a Samsung S24, round 2.** (1) The copyright and "Develop by" footer is removed from the app's Home (`app-footer.tsx` deleted); those lines live on App info only. (2) Every screen has a top bar with the DK LAO primary logo (`Logo-H_Text.svg`; on Home it replaces the large "DK LAO" title, which stays for screen readers). At the top of a screen the bar is fully transparent; once the screen scrolls it turns into see-through glass (24px blur, 80% surface colour, hairline edge) and shows the screen title in the middle, like iOS navigation bars and Material center-aligned top app bars. Screens opened from another one (App info) show the back button there instead of the logo. (3) **New app icon**, designed at the owner's request: the official oval DK emblem cropped out of the primary logo file (only the SVG viewBox is narrowed to the emblem, nothing redrawn), large on a full-bleed DK LAO navy square with the brand-blue glow, plus the blue-red-orange brand stripe along the bottom; the Android maskable version keeps the emblem inside the 80% safe circle and leaves the stripe out. Android's launch screen background is now the same navy. Checked at 512, 192, 180, 60 and 40 px, as a rounded square and as a circle. Fix after owner review: the first crop (x 0-124) cut the oval's right edge; measured in the file the emblem ends at x 129.1 and the lettering starts at 142.2, so the crop is now 0-131 and the whole oval shows.
  - Known: in dark mode the primary logo's blue "DK LAO" lettering is dim on black (the same file the website uses on its navy header). A light-on-dark logo version from the owner would fix it.
  - A Play Store app (Trusted Web Activity) is not part of this: it needs the production domain, a `/.well-known/assetlinks.json` file, a signing key and a Google Play developer account.

### Not changed

- The website and its lead form. Nothing was committed, pushed or deployed.

## [0.18.0] - 2026-10-25

### Minor Changed

- **UI system: shadcn/ui and Tailwind CSS v4.** Every page and shared component now uses Tailwind utilities and the shadcn-style primitives in `src/components/ui/` (Button, Card, Badge, Accordion, Sheet, Input, Label, and the Container / Section / Eyebrow / SectionTitle / SectionHeader / IconBadge layout set). DK LAO colours, radii, shadows and easing are Tailwind theme tokens, so a class like `bg-navy-950` or `shadow-card` always means the brand value.
- **Legacy stylesheet retired.** `src/app/(site)/globals.css` went from 1,596 to 256 lines: only the theme tokens, keyframes, base resets, the keyboard focus ring and the reduced-motion guard remain. Old class names that the scroll motion or tests use (for example `service-card`, `about-snapshot__card`, `industrial-footer__links`) stay in the markup as hooks with no CSS behind them.
- **Accessibility kept or improved on the way:** the phone menu is a focus-trapped sheet that returns focus to its button; the FAQ is a keyboard-operable accordion; quote-form errors are linked to their fields (`aria-describedby`, `aria-invalid`) and announced; the send result is a polite live region; reduced motion turns off the hero reveal and image settle.
- **Social share images.** Each published page has its own 1200x630 image at `/og/<page id>` (navy grid, logo, the page's eyebrow and heading, the Toyota forklift, brand stripe), built once at build time with `next/og`. Open Graph and X (Twitter) metadata point at it; an unknown page falls back to the Home image.
- Share images set their text in **Inter Bold** (Latin subset, 67 KB, `src/assets/fonts/Inter-Bold.ttf`, from Fontsource, Inter 5.2.5, SIL Open Font License) so headlines match the site's heavy type. Titles over 30 characters set at 58px so Home reads in two lines ("Forklift Rental, Sales & / Service in Laos").
- Matched Contact, Request a Quote and Forklift Rental to their pre-migration look at 1440 and 375 pixels: form fields back to 14px corners, 13px padding and 0.9rem labels; FAQ rows back to 18 x 22px padding (8px more per side on phones); a 12px gap under each "Step" label; card, breadcrumb and contact-table links 40px tall on phones only, as before, instead of at every width.
- About fixes found while rechecking: the vision and commitment headings and the card titles had lost their bold (Tailwind's reset removed the browser default); they are 850 and 750 again. The "Our vision" and "Our commitment" labels were red on red and blue cards and almost unreadable; they are now white at 85%.
- **Footer on phones (reported in Edge):** with Windows "Animation effects" off, most of the footer stayed invisible after scrolling down; with animation on, the contact chips stayed 90px to the side and were cut off at the screen edge. Cause: the GSAP `from()` tweens read their end state off the page, and the page re-measure after images load (`ScrollTrigger.refresh()`) could land mid-tween and record a half-hidden state as the end. The footer now uses `fromTo()` with an explicit end (`x: 0, opacity: 1`), and the contact chips no longer also transition their transform in CSS. Checked at 320, 375 and 430 pixels with motion on and off, scrolling step by step, jumping to the bottom, and scrolling up and back down: all 21 footer items visible and inside the screen every time. A test fails if `from()` or the chip transform transition comes back.
- **Keyboard and screen-reader check (Home, Contact, Request a Quote).** Passed as found: tab order follows the page, every stop shows a focus ring, the phone menu traps focus, closes with Escape and returns focus, the FAQ works with Enter, Space and arrow keys, and form errors move focus to the first problem and are read out. Fixed:
  - The header and footer were inside `<main>`, so screen readers had no banner or footer landmark and "Skip to main content" landed back on the header. They now sit outside `<main>`, which takes focus from the skip link.
  - Tabbing to content that had not yet faded in gave focus to something barely visible (as low as 30%). Focused content, including footer layers, is now shown at once.
  - "Solutions" and the card, breadcrumb and table links were 23px tall; now at least 24px (WCAG 2.5.8).
  - Quote form: required fields are announced as required before sending, Email is labelled "(optional)", and the send button stays focusable while sending (it was disabled, which dropped focus to the page).
  - New test: `src/lib/data/a11y.test.ts`.
- Removed the unused `@radix-ui/react-navigation-menu` and `@radix-ui/react-separator` packages. The navigation menu now comes from `radix-ui` 1.8.1 (pinned), through the shadcn `navigation-menu` component.
- **Solutions mega menu (desktop header).** "Solutions" opens a two-column panel: Equipment (Forklift Rental, Forklifts for Sale, Warehouse Equipment, Cleaning Equipment) and Service & parts (Maintenance Service, Spare Parts, Batteries & Chargers). Each link has an icon and a one-line description; a side card with a warehouse photo, "Not sure which solution fits?" and a Request a Quote button keeps the lead action inside the menu. Built from shadcn/studio `navigation-menu-06` (`src/components/shadcn-studio/navigation-menu/navigation-menu-06.tsx`), with DK LAO copy and `asChild` links. It replaces the hand-built dropdown; the phone menu is unchanged and still lists all seven links.
  - Keyboard focus: the shadcn component hid outlines (`outline-none`, and `outline-hidden` sets the same `--tw-outline-style: none` in Tailwind 4.3), so the menu links and the quote button showed no focus ring at all. Those classes are removed from `src/components/ui/navigation-menu.tsx`, so the site's own `:focus-visible` ring applies.
  - Checked at `http://localhost:3000/` on the production build: opens by click and by Enter; Tab goes through the seven links then Request a Quote; Escape closes and returns focus to "Solutions"; Left/Right move along the top bar; every stop shows a focus ring. At 1121px the panel sits at 346 to 1068px with no sideways scroll; at 1440px it fits beside the logo. At 375px the desktop menu is hidden, the phone menu opens as a focus-trapped dialog with all seven links, and Escape returns focus to its button. All eight menu links return 200; no console errors.
  - **Reworked into a DK LAO component.** The menu now lives in `src/components/dklao/mega-menu.tsx` as `MegaMenu` (one header item: label, groups, optional promo card) and `MainNavigation` (the desktop menu), keeping the navigation-menu-06 layout in DK LAO dress: blue-to-red-to-orange brand stripe on top, red eyebrow group titles, `IconBadge` icons that turn solid blue on hover with a red arrow sliding in, the navy-grid quote card used by the feature service card and closing call to action, and the orange underline under "Solutions" while it is open. The `src/components/shadcn-studio/` copy is deleted. Groups, icons and the quote card copy moved to `src/lib/data/navigation.ts` (`groupMenuLinks`, `solutionsPromo`); the phone menu now uses the same groups (Equipment, Service & parts) instead of one "Solutions" list. New test `src/lib/data/navigation.test.ts`; contract in `COMPONENTS.md` section 4a. Rechecked at 1440, 1121 (panel 356 to 1078px) and 375px, by mouse and keyboard, with the same results as above.
  - Fix after owner review: on Maintenance Service, "Preventive maintenance" and "Breakdown repair" showed the same photo (the library has one maintenance photo and both titles matched it). Breakdown repair keeps `maintenance` (machinery repair). Preventive maintenance first used `sales-used`, then, with owner approval, a new library photo `preventive.webp`: a technician checking a forklift's switch panel with a torch (U.S. Navy photo on Wikimedia Commons, public domain; original 3872x2592 JPG, 1,190,498 bytes, size checked against Wikimedia; cropped to 16:10 at x 672-3872, y 0-2000 to leave out the engine-cover brand lettering; 1600x1000 WebP, 126 KB). Registered in `public/images/library/LICENCES.md`, which now also allows public-domain Wikimedia Commons photos (with the no-endorsement condition; the register test accepts them). Rule in `src/lib/data/library.ts`, tests in `library.test.ts`. The four "What we service" cards all differ, and the new photo appears once on the page.
  - **Replaced the same day with DK LAO's own photo.** The owner shared the DK LAO photo and marketing archive and asked for a Lao technician. The Navy photo's face was not edited (it is a real, named person; changing his likeness would make a fabricated image); instead `preventive.webp` is now `P09.jpg` from `2020_MARKETING ARTWORK\01.Used Forklift\Old Photo`: a technician checking a forklift's battery and engine bay in a workshop. The original is only 640x480, so it is cropped to 640x400 (16:10) without upscaling: sharp enough for the 280x175 card, not for a full-width hero (comment in `library.ts`). Forklift brand lettering on a counterweight behind him is soft-blurred. `LICENCES.md` now lists "DK LAO" (owner's own photos, preferred over stock) as a source; the register test accepts `DK LAO archive:` rows. The archive does not record who the technician is (his shirt badge is not DK LAO's), so the site must not present him as DK LAO staff. Next's optimised-image cache (`.next/cache/images`) had to be cleared locally to show the replacement; replacing a library file under the same name on a deployed site needs the same cache clear or a new file name.
  - **More stock photos replaced with DK LAO's own** (owner-supplied archive, 2026-10-25), each 1600x1000 WebP, centre crop, no other edits: `contact` = DK LAO head office and Customer Relations entrance; `about` = DK LAO team photo (sales in red, technicians in blue; used on the Industries hero and About sections); `rental` = DK LAO rental forklifts with fleet numbers outside the office (also the Solutions menu card and the phone app's Home); `rental-long` = DK LAO fleet in the yard; `sales-used` = hall of used forklifts from the 2022 used-stock sourcing; `warehouse` = DK LAO team handling racking parts in the workshop. `LICENCES.md` rows updated; the Solutions menu card's alt text now describes the new photo. Not replaced: racking (the LPI catalogue photos in the archive are 900x600, too small for a 1600px hero, and are supplier photos), and the topics with no matching own photo (short-term rental, new sales, breakdown repair, parts, tyres, batteries, material handling, cleaning, the six industries, knowledge). Not done on request: generating new faces or adding DK LAO branding inside stock photos, because it would present stock scenes as DK LAO's own staff and fleet.
  - **DK LAO illustration treatment for stock photos** (owner request). `ownPhotoTopics` / `isOwnPhoto()` in `src/lib/data/library.ts` list the DK LAO-owned photos; a test keeps that list equal to the "DK LAO" rows in `LICENCES.md`. On cards and page heroes (`content-page.tsx`), every other (stock) photo is shown as a navy duotone (luminosity blend over navy-800, slight contrast lift) and cards get the blue-red-orange brand stripe along the photo's bottom edge (heroes already have it), so stock scenes read as illustrations and never pass for DK LAO's own staff or fleet. DK LAO's own photos keep natural colour. CSS only; image files are unchanged. Checked on Maintenance Service (own and stock side by side), Forklift Rental (own hero stays natural) and Spare Parts at 375px.
  - **Solutions card content and card detail sections** (owner request: explain each service, Why / When / What / Who / Where). Research by a helper agent gathered sourced industry facts (service intervals of about 200-250 hours or 90 days, OSHA daily pre-use checks, UK LOLER 12/6-month thorough examination, ISO 5057 10% fork heel wear, lead-acid watering and equalising, short- vs long-term rental use cases, tyre types, attachments, racking load notices); thinly sourced topics (filters, hydraulic seals, safety lights, LPG) are worded generally with no figures. LOLER and ISO figures are presented as international benchmarks, since Laos has no equivalent law.
    - Cards can now carry `details` (`what`, `why`, `when`, `who`, `where`; type `ItemDetails` in `pages.ts`). A card with complete details gets a "Read more" link and its own full-width section after the cards (`CardDetail` in `content-page.tsx`, anchor `detail-<title>`, clear of the sticky header): photo, title, summary and Request a Quote on the left; the five answers with icons on the right; alternating bands; one column on phones. Hidden (unconfirmed) cards and incomplete details never render. `pageFromDoc` reads `details` from a CMS page row too.
    - **Editable in the admin.** The Payload `pages` collection has a "Card details (What, Why, When, Who, Where)" group on section items (five text areas, shown only inside card sections; all five filled = a detail section, all empty = none). Migration `20261025_093358_card_details` (generated by `payload migrate:create`, with its schema snapshot) only adds five nullable columns to `pages_sections_items` and `_pages_v_version_sections_items`; down drops them. `payload-types.ts` regenerated. `pnpm cms:seed` writes details into new page rows, and for pages that already exist fills details only on card items whose details are still completely empty (matched by section and card title; `fillMissingDetails` in `src/lib/cms/details-backfill.ts`, tested), and skips a page with an unpublished draft. Not run here: the local Postgres (port 5433) is not running, so the migration, seed and admin form were not tried against a database; CI applies all migrations on a fresh database.
    - Detail sections written for Maintenance (Preventive maintenance, Breakdown repair, Inspection) and Spare Parts (Filters and fluids, Tyres and wheels, Forks and attachments, Hydraulic parts, Lights and safety devices). The other cards on all 13 Solutions pages link to their own page and got one-sentence summaries instead of two- or three-word labels or none (33 cards). No unconfirmed service is promised: onsite and workshop service, warranty and the inspection offer stay hidden and are not mentioned. New test `src/lib/data/card-details.test.ts`. Checked at 1440px (Maintenance: links, anchors, jump to Inspection) and 375px (Spare Parts).
    - **Superseded the same day: editorial card sections** (owner request: good-quality content per service, not bare What / Why / When / Who / Where labels). `ItemDetails` is now `lead` (opening paragraph), optional `facts` (up to 3 key figures, e.g. 200–250 h, 12 months, 10%), `topics` (two or more, each with its own heading written for the service, e.g. "Setting the right interval", "Why a small leak matters") and an optional `checklist` (heading and points). `CardDetail` shows photo, title, lead, figure tiles and Request a Quote on the left (sticky on desktop), the topics with an orange rule and the checklist card on the right. Content rewritten for the same 8 services; sources unchanged. The admin group is now "Card section (Read more)" with lead, facts, topics, checklist heading and checklist arrays. Migration `20261025_093358_card_details` was never applied anywhere and was deleted; it is replaced by `20261025_094137_card_sections` (6 array tables plus 2 columns on the live and version item tables, ends with `lockdownPublicSchema(db)`). New `src/payload/migrations.test.ts` fails if a migration that creates tables skips the lockdown call or is not registered in `index.ts`. `card-details.test.ts` rewritten (no generic headings, sizes, unique anchors, row round-trip, backfill). Checked: typecheck, lint, 203 tests and build pass; browser at 1440 px (`/maintenance-service`) and 375 px (`/spare-parts`), figure tiles on one line, no horizontal overflow. Still not run against a database.
    - **Card sections for five more Solutions pages** (owner request, same editorial model, no What / Why / When / Who / Where labels). Batteries & Chargers: the "What decides the right battery and charger" list became 4 cards with sections (Choosing battery and charger; Planning charging for your shifts, with the 8-8-8 lead-acid pattern; A safe charging area, 4% hydrogen ignition limit; Battery care in hot conditions). Forklift Rental: new "Planning your rental" cards (Short or long term?; Matching the truck to the job, 500 mm load centre; Operator safety on site, check every shift). Forklift Sales: new "Before you choose" cards (Capacity and load centre; Mast and lift height, 2.28 m standard container door; New or used?). Warehouse: the "Problems we help solve" list became 4 cards with sections (Unsafe racking and stacking, EN 15635 12-month expert inspection; Slow picking and loading; Aisles too narrow or blocked, typical counterbalance and reach-truck aisle widths; Dusty or slippery floors). Cleaning: new "Planning floor cleaning" cards (Sizing the machine to the area; Sweep, scrub or both; Daily machine care). The copy stays general guidance and claims nothing unconfirmed: no specific battery types, cleaning machine models, warranty, training or maintenance terms. A test now requires at least 3 card sections on each of these pages. CMS rows that already exist keep their old sections: a list that became cards, or a new section, is not added by the seed backfill; use `SEED_REFRESH_PAGES=batteries,rental,sales,warehouse,cleaning` before launch to replace them. Known gap: the library has one battery and one cleaning photo, so those cards and sections repeat the same photo. Checked: typecheck, lint, 203 tests and build pass; all five pages at 1440 px and 375 px, figures on one line, no horizontal overflow.
    - **DK LAO battery photos** (owner-approved 2026-10-25, from `2020_MARKETING ARTWORK\2.Jungheinrich\2023_FB-Page\Story\Odien Battery Replace`, a battery replacement job in January 2023). Three new own-photo library topics, centre crop to 16:10, 1600x1000 WebP, no other edits: `battery-label` (photo 8, the battery label: 48 V, 465 Ah, 770 kg) for "Choosing battery and charger"; `battery-swap` (photo 13, technicians moving a battery with a Toyota forklift at a loading dock) for "Planning charging for your shifts"; `battery-heat` (photo 10, a battery in full sun) for "Battery care in hot conditions". "A safe charging area" keeps the stock battery photo. Registered in `LICENCES.md` as DK LAO and in `ownPhotoTopics`, so they show without the stock brand stripe; matched by card title in `library.ts`. The battery cards no longer repeat one photo. Checked: typecheck, lint, 203 tests and build pass; `/batteries-chargers` at 1440 px shows four different card photos and no broken images. The cleaning cards still share one photo.
    - **Nilfisk as the cleaning brand** (owner-confirmed 2026-10-25: Nilfisk is the main brand, focus on industrial and professional, and DK LAO also supplies the Nilfisk consumer range). Cleaning page: meta title "Nilfisk Cleaning Equipment in Laos", eyebrow "Nilfisk Cleaning Equipment", H1 "Industrial and Professional Cleaning Equipment in Laos", intro naming Nilfisk (Danish brand since 1906). The four hidden machine cards were replaced by "The Nilfisk professional range": scrubber dryers, sweepers, robotic floor cleaners, industrial vacuums, commercial vacuums, pressure washers and detergents, following the categories on nilfisk.com/global/professional/products; robotic floor cleaners added the same day after the owner confirmed them. "Match machine to site" gained industrial vacuum, commercial vacuum and pressure washer rows. New "Nilfisk for home and small business" text section (pressure washers, vacuum cleaners, wet and dry vacuums, from nilfisk.com/global/consumer) and a "Cleaning equipment questions" FAQ (brand, which machine, prices). Nilfisk is also named in the Cleaning menu blurb (`routes.ts`), the homepage cleaning card, the Warehouse "Cleaning equipment" card and the About cleaning card. No stock, model, price or authorised-distributor claims. Checked: typecheck, lint, 203 tests and build pass; `/cleaning-equipment` at 1440 px, title and sections as above, no horizontal overflow. Known gap: all cleaning cards still use the one stock cleaning photo.
    - **Nilfisk product photos on the cleaning cards** (owner-approved 2026-10-25: DK LAO may use Nilfisk's product images as a Nilfisk dealer). Six images from the DK LAO archive (`2020_MARKETING ARTWORK\3.NILFISK` and `2023_FACEBOOK\2021_Post\Promote_DK-LAO_May 2021\Nilfisk`), cropped to 16:10 WebP (1600x1000; the Liberty SC50 is 1000x625 because its source is 1000x900), no other edits: `nilfisk-scrubber` (SC6500 ride-on in a warehouse), `nilfisk-sweeper` (SR1101 in a workshop), `nilfisk-robot` (Liberty SC50 autonomous scrubber), `nilfisk-industrial-vacuum` (GM80P in production), `nilfisk-commercial-vacuum` (GD5 backpack in a café), `nilfisk-pressure-washer` (MC6P under a bus). Matched to the range cards by exact title in `library.ts`; Detergents keeps the stock cleaning photo. Registered in `LICENCES.md` under a new licence "Nilfisk dealer material" (copyright Nilfisk, not DK LAO scenes, so cards keep the brand stripe); the licence test now accepts it. Nothing was downloaded from nilfisk.com. Checked: typecheck, lint, 203 tests and build pass; `/cleaning-equipment` at 1440 px shows the six images and no broken images.
    - **Nilfisk photos on the "Planning floor cleaning" cards** (owner-approved 2026-10-25, same "Nilfisk dealer material" licence). From the DK LAO archive, cropped to 16:10 WebP 1600x1000, no other edits: `nilfisk-large-area` (SC8000 ride-on in a long warehouse aisle) for "Sizing the machine to the area"; `nilfisk-combination` (CS7010 ride-on sweeper-scrubber in a warehouse) for "Sweep, scrub or both"; `nilfisk-machine-care` (SC500 parked in a clean room) for "Daily machine care", the closest match since no archive image shows maintenance steps. Matched by exact card title in `library.ts`; the card sections show the same photos. Checked: typecheck, lint, 203 tests and build pass; `/cleaning-equipment` at 1440 px shows the three photos on the cards and in their sections, no broken images. Every card on the cleaning page now has its own photo except Detergents (stock).
    - **Photos on the Warehouse "Problems we help solve" cards** (owner-approved 2026-10-25: DK LAO may use LPI Rack Range and Jungheinrich images as their dealer, as with Nilfisk). From the DK LAO archive, cropped to 16:10 WebP, no other edits: `warehouse-racking-guards` (LPI racking with column guards, 864x540, the "LPI RACK RANGE (THAILAND)" watermark strip cropped off) for "Unsafe racking and stacking"; `warehouse-picking` (Jungheinrich pallet trucks in a busy warehouse, 1280x800 from a 1920x800 banner) for "Slow picking and loading"; `warehouse-narrow-aisle` (Jungheinrich very-narrow-aisle truck, 1280x800) for "Aisles too narrow or blocked"; `warehouse-sweeper` (Nilfisk SW5500 ride-on sweeper, 1400x875) for "Dusty or slippery floors". New licences "LPI dealer material" and "Jungheinrich dealer material" in `LICENCES.md`; matched by exact card title in `library.ts`. Test repair: two shell substitutions had damaged the untracked `library.test.ts` (one prefixed every line, the earlier one turned the source check on line 35 into a pattern that matched anything and altered lines 87 and 107); all four lines restored by hand and the licence list extended. Checked: typecheck, lint, 203 tests and build pass with the strict checks back; `/warehouse-equipment` at 1440 px shows the four photos on the cards and in their sections, no broken images.
    - **Industries hub: a section per industry and a new hero** (owner request, same editorial model). The six "Choose your industry" cards (Logistics and warehousing, Manufacturing, Construction, Food and beverage, Retail and wholesale, Hospitality and facilities) each got an opening paragraph, three topics with their own headings and a checklist, in `industry-pages.ts`. Client names come only from the owner-confirmed `referenceClients` fact: HOYA in Manufacturing; Beerlao, Coca-Cola and Heineken in Food and beverage. No onsite-service, warranty or response-time claims. `LinkCard` in `content-page.tsx`: a card that has both its own page and a section shows "Read more" and "View page"; `CardDetail` adds a "<industry> page" button next to Request a Quote when the card links to a page. New hero: `industries.webp`, DK LAO's own photo of a technician with a UniCarriers forklift at a customer's beverage depot (`Pictures\Nissan Forklift Delivery to  SNK\WhatsApp Image 2022-12-09 at 20.46.53.jpg`, December 2022), 1280x800 centre crop, registered as DK LAO in `LICENCES.md`; it replaces the team photo on the Industries page. Test: the hub must have six card sections. Checked: typecheck, lint, 203 tests and build pass; `/industries` at 1440 px and 375 px, six sections, links reach the sector pages, no broken images, no horizontal overflow.
    - **Industry pages: a section for every recommended solution** (owner request, same editorial model). The "What we recommend" cards on all six `/industries/*` pages (23 cards) each got an opening paragraph, two topics with their own headings and a checklist, written for that industry: for example "Plan the peak in advance" for logistics rental, "Service by hours worked" for manufacturing maintenance, "Fit for rough ground" for used forklifts in construction, "A layout for first in, first out" for food and beverage racking, "Clean before the doors open" for retail cleaning, and "A back-of-house route" for hotel deliveries. The content lives in the new `src/lib/data/industry-details.ts` (keyed by industry page and card title) and is merged in `industryPage()`. Claims stay within confirmed facts: no onsite service, warranty, response times or stock; Nilfisk is named for the cleaning cards; the maintenance figures (200–250 h, 3 months) match the Maintenance page. Each card shows "Read more" and "View page", and each section links to the solution's page. Test: every "What we recommend" card on every industry page has its own section. Checked: typecheck, lint, 203 tests and build pass; all six pages render their sections (4, 4, 4, 4, 4 and 3), checked in the browser at 1440 px and 375 px, no broken images, no horizontal overflow.
    - **Section page buttons name the destination** (owner request). In `CardDetail`, the button beside Request a Quote now uses the linked route's label ("Maintenance Service page", "Short-Term Rental page", "Cleaning Equipment page") instead of the card title, falling back to the card title when the card has no route. Checked: typecheck, lint, 203 tests and build pass; `/industries/construction` shows Short-Term Rental, Long-Term Rental, Used Forklifts and Maintenance Service page buttons with matching links, and `/industries` shows the six industry page names.
    - **Key account customers with logos** (owner request, 2026-10-25; owner chose logos and confirmed DK LAO may show them). `referenceClients` now lists five groups from the owner's `D:\Backup_Old_Data\WORKS\DK_LAO\Key Account Customers` folder plus the earlier names: Beverage (Beerlao, Coca-Cola, Heineken, Pepsi, Tiger Beer), Logistics and power (DHL, Lao Freight Forwarder, NTPC, PTT, Savan Logistics), Mining and chemical (MMG, Phu Bia Mining, KCL, 5N Plus), Others (Lao Telecom, Lao Tobacco, Lao World, CPF, Phonesack Group, HOYA) and Government (Ministry of Public Health). The 19 supplied logos are WebP in `public/images/clients/` (500x250, 202 KB in total), mapped by name in `clientLogos` (`src/lib/data/clients.ts`). `TrustedBy` shows a logo tile with the company name as alt text, or a text pill when there is no logo (HOYA, Ministry of Public Health). Groups sit in two columns from 1100 px and stack below; phone tiles are 104 px so three fit per row. The Manufacturing and Food and beverage industry sections now say "DK LAO's customers include…" instead of naming the old "forklift rental and fleet" group. Tests: groups, every mapped logo file exists and is in the list, unmapped clients stay text; the app's client-group test uses the new titles. Checked: typecheck, lint, 204 tests and build pass; home page at 1440 px and 375 px and About at 375 px, 19 logos, no broken images, no horizontal overflow. HOYA's logo is waiting for a file from the owner.
    - **Ministry of Public Health logo** (sent by the owner in chat, 2026-10-25). The 320x320 emblem is centred on a 500x250 white canvas like the other logos, saved as `public/images/clients/ministry-of-public-health.webp` (15 KB) and mapped in `clientLogos`. The Government group now shows the logo; HOYA is still text because the HOYA image sent earlier was not saved to disk. Checked: typecheck, lint, 204 tests and build pass; home page at 1440 px shows 20 logos and the HOYA text pill, no broken images.
    - **HOYA logo** (owner-supplied link, 2026-10-25: `https://cdn.108.jobs/company-images/973d640d-017b-4f73-aead-d3a2e8e80f99.jpeg`, 866x650 JPEG, 11.7 KB). White border trimmed, wordmark centred on a 500x250 white canvas, saved as `public/images/clients/hoya.webp` (6 KB) and mapped in `clientLogos`. Every customer now shows a logo; the text-pill fallback stays for names added later without artwork. Checked: typecheck, lint, 204 tests and build pass; home page at 1440 px shows 21 logos, no text pills, no broken images.
    - **Link audit** (owner request: no dead links). A crawl from `/` and `/app` reached 31 pages and checked 127 unique links: every internal page, every `#anchor` against the ids on its target page, `tel:` and `mailto:` formats, and all 12 external URLs; all 26 sitemap URLs also return 200. One dead link: the app's "Company profile" opened `https://www.dklao.com/about`, which returns 404 because dklao.com still serves the old website. Fix: the app's "Company profile", "Open dklao.com" and "Website" rows now use relative links (`/about`, `/`, `/`), so they open this site's pages in every environment (local, ngrok preview, production) and still open outside the app; the unused `APP_URL` constants in those three pages were removed. Test: the app pages may not hard-code `https://www.dklao.com` or read `APP_URL` for links. Re-crawl: 31 pages, 125 links, 0 internal problems, 10 of 10 external links return 200. Checked: typecheck, lint, 205 tests and build pass. External checks are status codes only: Facebook and X can answer 200 with a login page.
    - **`pnpm links:check`** (owner request). The link audit crawler is now `scripts/check-links.mjs`: it crawls every page reachable from `/` and `/app` on a running site (default `http://127.0.0.1:3000`, or a base URL argument such as the ngrok preview), and fails with exit code 1 on internal 4xx/5xx or redirects, `#anchor` links without a matching id, malformed `tel:`/`mailto:` links, and external URLs at 400+ or unreachable; `--skip-external` checks internal links only. No new dependency (Node's built-in `fetch`). Documented in `con_agents/QA_CHECKLIST.md` (new section 8, and "links:check passes" added to Release QA). Checked: against the local site, 31 pages and 125 links, all work (exit 0), also with `--skip-external`; with no site running it explains how to start one (exit 1); against a throwaway local page with a 404, a missing anchor, a malformed `tel:` link and a 301, it reported all four (exit 1). Lint and 205 tests pass.
    - **Forms tested end to end, and every request emailed to info@dklao.com** (owner request). Found by testing: a valid request returned 500 "could not be saved" because `.env.local` points `DATABASE_URL` at the local Postgres, which is not running, so every lead was lost. Fixes:
    - **PostgreSQL 16 installed on the dklao.com cPanel server** (owner decision 2026-10-25: host the site and its database on dklao.com instead of Vercel and Supabase; owner chose PostgreSQL 16 over the cPanel default 13, which is end of life since November 2025). Server `host.bizera.la` (50.6.224.71, AlmaLinux 9.8, cPanel & WHM 11.138), which also hosts laogencms.com and 10 other accounts. Steps over SSH as root with key authentication: `dnf module enable postgresql:16`, then cPanel's supported installer `/usr/local/cpanel/scripts/installpostgres --yes`; log at `/root/installpostgres-20261025.log`. Installed postgresql-server 16.15 (AlmaLinux AppStream module); cPanel wrote its configuration, created a PostgreSQL login for every cPanel account and set a random password for the `postgres` superuser. Checked: service active and enabled at boot, monitored by cPanel (chkservd); listens on 127.0.0.1 and cPanel's internal 127.0.0.200 only, not the internet; password authentication for local connections; all 12 accounts, including `dklao` and `laogencms`, have their role and the "PostgreSQL Databases" feature (default and standard feature lists). No existing data was touched; MySQL is unchanged. Not done: databases for the site are not created yet; `docs/deploy-checklist.md` still describes Vercel and Supabase and needs updating for cPanel hosting.
    - **Website database created, and the deploy checklist rewritten for the cPanel server** (owner request, 2026-10-25). In the `dklao` cPanel account, through cPanel's UAPI as root: database `dklao_site` and user `dklao_app` (all privileges). The user was created with a random temporary password generated on the server and never shown or stored; the owner sets the real one in cPanel. Checked: cPanel lists the user under the database; the database is owned by role `dklao_site` and `dklao_app` is a member, which satisfies cPanel's "samerole" access rule and lets it create tables in `public` on PostgreSQL 16; `dklao_app` is not a superuser. `docs/deploy-checklist.md` now describes hosting the site, admin and database on the dklao.com cPanel server: server facts (Node.js 20.20 installed, 22 available; Passenger not installed yet), one-time WHM setup (EasyApache 4: `ea-apache24-mod-passenger`, `ea-nodejs22`; backups), building on the server, cPanel Application Manager registration and environment variables, migrations with a `pg_dump` before each, a protected preview subdomain, verification (including `pnpm links:check`), go-live through Cloudflare (Full strict), rollback, and what is not covered (the Passenger startup file `server.mjs`, uploads, monitoring). The CI workflow comment no longer says Vercel deploys the site.
    - **Passenger start file `server.mjs`** (owner request; `docs/deploy-checklist.md` section 3). A small Node HTTP server in the repository root that cPanel's Application Manager (Phusion Passenger) can start: it prepares the built Next.js app (`next({ dev: false })`), serves every request through Next's handler (pages, API and `/admin`), listens on `PORT`/`HOSTNAME` (default 127.0.0.1:3000), answers a plain 500 if a request handler throws, and closes open connections before exiting on SIGTERM or SIGINT. New `server.test.ts` starts it on a free port against the real build and checks: the ready line names the port, `/` and `/cleaning-equipment` return 200, an unknown page returns 404, the lead API answers 400 to an empty request, and SIGTERM stops it (exit code 0 checked on Linux and macOS; Windows has no signal handlers). Skipped when there is no build (CI runs tests before building). Checked: build, then the test (4 passed); by hand with `PORT=3010 node server.mjs`, the home page renders with all 21 client logos; `/admin` shows a server error both through `server.mjs` and through `pnpm start`, because `.env.local` points at the local Postgres on port 5433, which is not running (not caused by this change). Typecheck, lint and 220 tests pass. The deploy checklist marks the start file done.
    - **Passenger and Node.js 22 installed on the cPanel server** (owner-approved change list, 2026-10-25). On `host.bizera.la` through EasyApache 4 packages, as root: `dnf --allowerasing --setopt=install_weak_deps=False install ea-apache24-mod-passenger ea-nodejs22`. The transaction matched the reviewed dry run: 11 packages installed (Passenger 6.2.1, `ea-passenger-runtime`, `ea-nodejs22` 22.23.4, and AlmaLinux's Ruby 3.0.7 and Node.js 16.20 that Passenger depends on) and `ea-nodejs20` removed (EasyApache allows one Node.js; checked first that nothing on the host used it: `laos-travel-test` runs its own Node 24, the `omniroute` container carries its own Node, `berp-vm` is a VM). `/usr/local/bin/node`, `npm` and `npx` now point to Node 22 (`node -v` v22.23.4, npm 10.9.9). `httpd -t` Syntax OK, graceful restart, `passenger_module` loaded, Application Manager answers for `dklao`. Site check of all 13 hosted domains through 127.0.0.1 before and after: 12 unchanged; `pti-laos.com` already returned 500 before the change; `psvcoffee.com` changed from 200 to 403 for requests from 127.0.0.1 only. The 403 is a page from WordPress itself (PHP), consistent with its security plugin locking out the address the checks came from; from the internet psvcoffee.com, dklao.com and laogencms.com all return 200. That WordPress site was not touched. Logs on the server: `/root/ea4-passenger-20261025.log`, `/root/ea4-passenger-20261025-before.txt`, `-after.txt`. `docs/deploy-checklist.md` section 1 marks both steps done, with the rollback.
    - **Website database is `dklao_dklApp`** (owner, 2026-10-25). The owner created `dklao_dklApp` in cPanel, granted it to `dklao_app` and set that user's password. Checked on the server: `dklao_app` is a member of role `dklao_dklApp`, can connect and can create tables in `public`; both `dklao_dklApp` and the earlier `dklao_site` are empty. `docs/deploy-checklist.md` now uses `dklao_dklApp` (note the capital A) in the server table, `DATABASE_URL`, `pg_dump` and restore commands; it notes that the password must be percent-encoded in `DATABASE_URL` and how, that the password was pasted into chat and should be changed before go-live, and that `dklao_site` is unused and can be deleted once the owner confirms. The password was not written to any file.
    - **Unused `dklao_site` database deleted** (owner request, 2026-10-25). Checked first: no tables, views or sequences, and no open connections. Deleted with cPanel UAPI `Postgresql delete_database`. Verified: cPanel lists only `dklao_dklApp`, the `dklao_site` role is gone, and `dklao_app` can still connect to `dklao_dklApp`. Deploy checklist updated.
      - **No lost leads.** `storeLead` falls back to `data/leads-local.jsonl` when the database cannot be reached. The route then emails and calls the webhook, and answers success with a reference when the lead was saved or at least one notification reached DK LAO; only when all fail does it answer 500 "Your request could not be sent. Please try again, or call or WhatsApp DK LAO."
      - **Email.** New `src/lib/leads/email.ts` (nodemailer 7.0.10, new dependency; SMTP was already planned in ENVIRONMENT.md) sends the full request to `LEAD_NOTIFY_EMAIL`, default `info@dklao.com`, with Reply-To set to the visitor's email and line breaks stripped from header values. Settings only from the environment: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (added to `.env.example`; delivery documented in `con_agents/FORMS_AND_LEADS.md` section 10). No SMTP_HOST = no email.
      - **Website form** (`QuoteRequestForm`): validates each field when the visitor leaves it; server field errors land on their fields; a network failure or non-JSON reply shows a clear message and keeps the typed details; the success message includes the reference; "Company or organisation" label; a hint and a 0 / 1,200 counter on the requirement. Error texts now say how to fix the problem (for example "Use digits, spaces and + ( ) - only, for example +856 20 5555 1234").
      - **App form** (`/app/request`): focus goes to the first problem in screen order (it skipped "What is wrong" for "Address"); every problem in a group shows at once instead of only the first; a non-JSON reply shows a plain message, not a parser error.
      - Tests: email settings, content, Reply-To, header safety and never-throw (`email.test.ts`); route save/email/webhook combinations including database down; store fallback.
      - Checked: typecheck, lint, 216 tests and build pass. Against a test copy of the site with a local SMTP receiver: API valid (200 with reference), invalid (400 with a message per field), bot (thank-you, no email); website form in the browser (empty send shows four errors and focuses the first, blur validation, live clearing, sent with reference, form reset); app service form at 375 px (five errors shown, focus on "What is wrong", sent with reference). The receiver got exactly three emails, all to info@dklao.com, with the full request. Test leads and the test servers were removed afterwards. Not done: no real email was sent, because no SMTP account is configured.
  - **Owner change: original colours, blue on hover.** The always-on navy duotone for stock photos is replaced: every card photo (stock and DK LAO's own) shows its original colour, and a DK LAO blue layer (`bg-brand-blue`, "color" blend) fades in over 260ms on hover or keyboard focus inside the card; opacity animates, not the blend. Page heroes show original colour (under the existing navy text shade). Stock cards keep the brand stripe along the photo's bottom edge, so they still read as illustrations. Checked on Spare Parts at 1440px: all cards in original colour at rest; hovering "Forks and attachments" and focusing the Batteries "View details" link each turned only that card blue. Test updated in `library.test.ts`.
  - Fix after owner review: on Spare Parts, "Filters and fluids" and "Lights and safety devices" both showed the `parts` photo (a shelf of belts, also the page hero). With owner approval two free Unsplash photos were added: `filters.webp` (Hans Westbeek, fluid filter housings and a pressure gauge; brightened because the original disappeared under the navy treatment) and `safety.webp` (Ethan Hu, a forklift's blue safety spotlight and red working light; cropped to leave out brand lettering on the mast and seat panel). Both are 1600x1000, registered in `LICENCES.md`, and get the stock navy treatment. New title rules in `library.ts` put filter/fluid and light/safety cards on them before the general `parts` rule; only those two cards on the site match. All six "Parts we supply" cards now differ.
  - Fix after owner review: the "Solutions" arrow sat below the word on desktop. The trigger shared the plain links' `display: block`, so the arrow wrapped to a second line (button 43px tall). It is now `inline-flex` with centred items: arrow right of the label, button 27px tall, level with the other header links. Checked at 1440 and 1121px, menu still opens.
  - The worktree's `pnpm-lock.yaml` now matches `package.json` (exact versions, `radix-ui` added, the two removed packages dropped).
- Tests that read CSS now read the component classes instead; new `share.test.ts` checks every published page has a share card and that metadata uses it.

### Not changed

- Page content, routes and layout. Home, About, Contact, Request a Quote and Forklift Rental were compared against before-screenshots at 1440 and 375 pixels: page heights within 1%, no sideways scroll, no console errors. Nothing was committed, pushed or deployed.

## [0.17.3] - 2026-10-25

### Patch Changed

- About page "Industries we serve": the nine cards were text only. They are now six cards, one per industry page, each a link with an "Explore Industry" line, a hover lift and a visible keyboard focus.
- Merged the three that had no page of their own: "Logistics & Transportation" and "Warehousing & Distribution" became "Logistics & Warehousing"; "Industrial Facilities" joined "Manufacturing & Industrial"; "Government & Institutional Operations" joined "Hospitality, Facilities & Institutions" (offices and public buildings, matching the confirmed Ministry of Public Health client). Food & Beverage now uses a drinks icon instead of a battery.
- Tests check there is exactly one card per published industry page and that the merged sectors stay named in the wording.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.17.2] - 2026-10-25

### Patch Changed

- Design review (spacing, type, contrast, alignment, fit, repetition) of Home, About, Forklift Rental and Contact at 1440 and 375 pixels. Fixes:
- **Internal notes shown as copy (biggest issue).** Home and About carried planning text written for the build team, for example "Semi-ecommerce discovery", "Ready for future CRM", "Used forklift inquiries without fake stock claims", "Article routes are prepared for future SEO content", "One form, structured for DK LAO follow-up" and "Six connected solution paths". All rewritten in customer language ("Rent, buy, service and supply in one place", "What do you need today?", "Short guides before you ask for a quote", "Tell us what you need", "Six ways we support your operation"). A new test (`src/lib/data/home-copy.test.ts`) fails if such wording returns.
- **Repetition on Home.** Removed the dark "used / maintenance / spare parts" band (the same three services are already cards above) and the "cleaning / warehouse" pair (already in the equipment grid), and the three "how the site was built" trust cards. Home is about 16% shorter on desktop (8,679 to 7,250px) and 24% on phones (16,300 to 12,400px). The duplicate form heading under "Tell us what you need" is gone.
- **Home industry cards** now open the industry pages (Logistics, Manufacturing, Construction, and the Industries hub) instead of general contact actions.
- **About**: closing call to action cut from three buttons to two (Request a Quote, Talk to a DK LAO Advisor); the Coverage card now uses the confirmed wording ("Based in Vientiane, with customers served online across Laos").
- **Related solutions** shows at most one row of four, so no single card hangs on a second row (Forklift Rental had five).
- **Contact**: the form lines up with the sections below it instead of floating centred, and social links read "facebook.com/DKLAOonline" rather than full web addresses.
- **Buttons** keep their label on one line on phones; the row wraps instead ("View Rental Fleet" was breaking in two).

### Not changed

- The hero, proof strip, clients band, anatomy diagram and quote form are unchanged. Nothing was committed, pushed or deployed.

## [0.17.1] - 2026-10-25

### Patch Changed

- Design review of the industry pages (spacing, type, contrast, alignment, fit, repetition), fixed site-wide:
- **Lists** ("What slows ... down", "What to tell us for a fast quote" and every other list section) no longer sit as small run-in text inside a wide box with empty space on the right. They sit on the page in columns: a 17px bold title over a 16px explanation, marked by a small orange square. One column on phones.
- **Card titles** are bold (750) so they lead the card instead of reading like body text.
- **Related solutions** no longer repeats pages already linked from a card on the same page, pages in the breadcrumb, or the quote and contact pages (each page already has its own calls to action). On the industry pages this removed a second row of the same cards; the section only shows when at least two new links remain.
- Tests added for the related-links rule and the list layout.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.17.0] - 2026-10-24

### Minor Changed

- Industries rebuilt around one buyer journey, researched and documented in `docs/industries-journey.md` (Laos context per sector with sources, who arrives and why, what each section answers, how to measure it).
- Five new sector pages, published: Manufacturing (`/industries/manufacturing`), Construction (`/industries/construction`), Food & Beverage (`/industries/food-beverage`), Retail & Wholesale (`/industries/retail-wholesale`) and Hospitality & Facilities (`/industries/hospitality-facilities`). Before, five of the six industry cards linked back to the Industries page itself.
- Every sector page, Logistics included, now follows the same path: a hero that names the operation, "What slows [industry] down" (4 problems), "What we recommend" (3 to 4 cards linking to rental, sales, racking, batteries, maintenance or cleaning, with a reason for that industry), "How it works" (4 steps), "What to tell us for a fast quote" (5 details), 3 industry questions, and a closing call to action. Quote links preselect the industry's category (warehouse, rental or cleaning) and record the page as the source.
- The hub gives each industry a one-line need, adds Talk to a DK LAO Advisor beside Request a Quote, and a three-step "Not sure which fits?" route. Each sector page has its own library photo.
- Fixed three author notes that were showing on the pages: "Sector page (template)" on Logistics, and "Article (template)" and the section heading "Question-style H2 sections" on the rental guide (now "The five things to prepare"). The test that bans author notes now also checks eyebrows, headings and that wording.
- Footer: the six sector pages are reached from the Industries hub, so the footer lists the hub only. Breadcrumbs, sitemap and related links include all six.
- New pages contain no figures, clients, brands or response times. Case-study sections stay hidden until the owner supplies a real client or project.
- `pnpm cms:seed` creates the five new CMS pages. A new opt-in `SEED_REFRESH_PAGES=id,id` overwrites chosen pages with the built-in copy (used locally for industries, ind-logistics and article). Tests: `src/lib/data/industry-pages.test.ts`, plus updated page counts.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.16.0] - 2026-10-24

### Minor Changed

- Photo library: 22 topic photos in `public/images/library/` (1600 by 1000 WebP, 3.6 MB in total, 59 to 374 KB each), downloaded with the owner's approval from Unsplash (20) and Pexels (2) under their free commercial licences. Every file has a row in `public/images/library/LICENCES.md` with source page, photographer and licence. Plan and slot map: `docs/image-plan.md`.
- Eye check before use: three first picks showed a brand name or store signage (a forklift brand on the long-term rental and used-forklift picks, store signs on retail) and were swapped for their alternatives; the guides photo was cropped to the hands and tablet so no face or clothing logo shows. Two picks keep small lettering (truck cab, truck side) because their alternatives showed bigger logos.
- Every content page (rental, sales, service, parts, batteries, warehouse, material handling, racking, cleaning, industries, logistics, guides, contact, quote) now has its topic photo behind the hero, under a navy shade that keeps the text readable. Cards show a 16:10 photo above the text: a card that links to a page reuses that page's photo, and cards without a link (part types, industries, guides) pick one from their title. Photos are decorative (empty alt), lazy-loaded except the hero, and zoom 4% on hover (260ms, off for reduced motion). Home and About keep their own artwork.
- New `src/lib/data/library.ts` holds the topic list and the page and title mapping, so replacing a photo with DK LAO's own shot means replacing one file. Tests in `src/lib/data/library.test.ts`.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.15.0] - 2026-10-23

### Minor Changed

- Site-wide motion with GSAP, in one client layer mounted in the site layout (`src/components/dklao/site-motion.tsx`), audited against the 12 principles of animation adapted for the web.
- **Scroll reveals on every page:** section headers, cards, stats, chips, steps, FAQ rows, tables, the proof strip, the clients band, About cards and steps, the rental and cleaning panels and the quote form rise 28px and fade in the first time they scroll into view (0.6 seconds, eased out, 40ms stagger, grouped by what enters together). Only content that starts below the fold is hidden, so nothing visible on load flickers, and a parent and its child are never animated together. Hidden content uses opacity only, so screen readers and page search still find it.
- **Header:** turns a deeper navy with a soft shadow once the page leaves the top. Header links get an orange underline that grows from the left on hover and keyboard focus.
- **Depth:** the About story photos and the quote section photo drift slightly against the scroll (a 4% parallax).
- **Press feedback:** card links, footer chips, footer actions, social buttons and the menu trigger squash to 0.98 when pressed; the menu arrow now uses the same timing tokens as everything else.
- The old CSS scroll-timeline reveal only ran in Chrome-based browsers; it is replaced, so Firefox and Safari get the same motion. The footer stagger was cut from 70ms to 40ms to meet the 50ms rule.
- Reduced motion: no reveals, parallax or header animation; the page is shown at rest (the footer keeps its plain fade). Tests added in `src/lib/data/motion.test.ts` (stagger limit, eases, press scale, timing tokens, no linear transitions, reduced-motion gate, layout mount).

### Not changed

- The hero keeps its existing CSS entrance. Nothing was committed, pushed or deployed.

## [0.14.1] - 2026-10-23

### Patch Changed

- Owner report: the footer motion was not working. Cause: the computer and the built-in preview browser report "reduce motion" (Windows: Settings, Accessibility, Visual effects, Animation effects is off), and 0.14.0 deliberately showed no motion at all in that case. Fix: with reduced motion the footer layers now fade in and out (0.5 seconds, no sideways travel), so the feature is visible everywhere; with motion allowed they still slide in from the left and right and out again on scroll up. Test updated.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.14.0] - 2026-10-23

### Minor Changed

- Footer motion with GSAP (ScrollTrigger). Scrolling down to a footer layer makes its contents flow in: the left half slides in from the left and the right half from the right (90px, fading in, 0.7 seconds, eased out, short stagger). Scrolling back up plays the same motion in reverse, so the left half flows out to the left and the right half out to the right. The three layers (contact, links, copyright line) each have their own trigger and replay every time.
- What moves: Talk to us, the address and the left contact chips come from the left; the actions, the right contact chips, the Toyota forklift and the social buttons from the right. In the links layer the logo and first two groups come from the left, the last two groups from the right. The copyright line comes from the left and the BizEra credit from the right.
- The last layer starts as soon as it enters the viewport, and the triggers are re-measured whenever the page height changes (images above the footer settle after load). Without that re-measure the copyright line never played in the first test.
- Visitors who ask for reduced motion see the footer as before, with no movement. The footer is clipped sideways so the off-screen start positions never widen the page (checked at 375px).
- New dependencies, pinned: `gsap` 3.15.0 and `@gsap/react` 2.1.2. The footer shell is now a small client component (`footer-motion.tsx`); the footer content is still rendered on the server. Test added for the setup and for every selector existing in the markup.

### Verified

- In a browser with motion allowed: all three layers start hidden at the sides, are fully in after scrolling to the bottom, and are back out at the sides after scrolling to the top. The built-in preview browser reports "reduce motion", so there the footer correctly stays still.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.13.3] - 2026-10-23

### Patch Changed

- The footer forklift is now a transparent product image instead of a dark photo panel, so the machine stands directly on the blue contact layer. Source: `Landing_Page/images/toyota-35_50-tonne-8_series-4_wheel-forklift.png`, chosen by the owner. The original is copied unchanged to `public/images/hero/toyota-35-50-tonne-8-series-forklift.png`, and the file the footer uses is a trimmed WebP, `public/images/hero/toyota-35-50-forklift-cutout.webp` (698 by 483px, 49KB, alpha channel kept). The earlier AI-made cut-out was deleted. The studio photo `forklift-product-hero.png` is untouched and still used on the About page.
- Fit: the image is 340px wide, sits level with the contact chips and bottom-aligned, with a soft drop shadow. The address and social row below runs full width. It is decorative (empty alt text) and hidden below 900px. Test added for the image file (alpha channel, size limit) and the placement.

### To confirm

- This is a Toyota product photo. Before launch, confirm DK LAO may use it (for example as an authorised Toyota dealer). If not, replace the one file; the footer code does not change.
- Nothing was committed, pushed or deployed.

## [0.13.2] - 2026-10-23

### Patch Changed

- The footer contact layer now shows the DK LAO forklift product photo (`/images/hero/forklift-product-hero.png`, already in the repo and used on the About page) to the right of the contact details, 300px wide with rounded corners, cropped to the forklift. It is decorative (empty alt text, hidden from screen readers) and is not shown below 900px, where the contact details already fill the width. No new image was created or bought. Test added.

### Not changed

- The contact details and their order are unchanged. Nothing was committed, pushed or deployed.

## [0.13.1] - 2026-10-23

### Patch Changed

- Footer contact layer set out as the owner described. "Talk to us" and its actions sit on their own line above a hairline. Below it the chips are in two columns, row by row: Phone | info email, Sales | salescenter email, then the two Aftersales numbers. The last row is the address on one line (it wraps only below 900px) with the Facebook, YouTube and X buttons at the right. On phones the numbers pair up and the two emails take a full row each, as before.
- The row order comes from one small function, `orderFooterChannels`, so a missing channel never drops another. Tests added for the order, the one-line address and its small-screen wrap.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.13.0] - 2026-10-23

### Minor Changed

- Problem found by the owner: the footer still felt hard and unfriendly. Cause: one dark block held contact details, actions and thirty links in the same weight, with long link wording and no recognisable brand marks. Fix, in two layers:
- **Contact layer** (lighter blue, warmer): a short heading "Talk to us", the three actions (Request a Quote first), contact chips that show only an icon, a small label and the number (WhatsApp Sales and Aftersales show the WhatsApp mark, labelled "Sales" and "Aftersales"; phone and email show just the value), the address, and round white buttons for the Facebook, YouTube and X marks, 44px each with an accessible name.
- **Links layer** (dark, quiet) below it: the logo and the four link groups. Link wording is shortened because the group heading already gives the context (for example "Rental", "Short-term", "Long-term", "For sale", "New", "Used", "Maintenance", "Batteries", "Warehouse", "Racking", "Cleaning", "About", "Logistics", "Rental guide"). Page names elsewhere, and the sitemap, are unchanged.
- Brand marks come from the `simple-icons` package (16.35.0, pinned, CC0 official glyphs), not hand-drawn. Lucide still supplies the generic phone, mail and pin icons. On phones the contact chips sit two by two so the layer stays short.
- Tests added: brand marks sourced from the package, accessible names on icon-only links, contact layer before links layer, short unique labels (18 characters at most), chip pairing and button size.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.12.1] - 2026-10-23

### Patch Changed

- Checked the footer on Home, About and Contact at 1440 and 375 pixels. All three pages render the same footer with no sideways scroll, and every footer link is at least 40px tall on the phone. Fixes: on desktop the contact column was too narrow, so the address wrapped to four lines; it is now wider (address is three lines). On the phone the filled Request a Quote button came after two text links; it now comes first at full width, and the contact rows are slightly tighter. Tests added.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.12.0] - 2026-10-23

### Minor Changed

- Footer redesigned in a quiet, clean style taken from professional-services (law firm) sites: a thin blue and red brand rule, the logo with three short actions (Request a Quote is the only filled button), then one row of five columns: Contact and the four link groups, set under small uppercase headings with hairline dividers. No numbering, no cards, no hazard stripe.
- Icons use the site's own set: Lucide with the same `dk-icon-badge` tile as the service cards, 18px, for phone, WhatsApp, email and address. All are hidden from screen readers. Facebook, YouTube and X are plain text links because Lucide has no brand marks and logos are not guessed. The address shows only from the confirmed fact.
- Text kept short: the long blurb and the headline band were removed; every contact line is a small label plus the value, and every link group keeps its names. Spacing follows the 4/8/12/16/24/32/48 tokens. Hover motion is off for reduced-motion users.
- Required ownership line (copyright with version, BizEra credit) and all published-page links unchanged. Tests updated.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.11.2] - 2026-10-23

### Patch Changed

- Looked at the clients band on the About and Rental pages at 1440 and 375 pixels. Fixes: on desktop the two groups were spread far apart (1.6 to 1 columns), so they now size to their content with a 72px gap; on phones the pills were large and the band was 423px tall, so the pills, padding and gaps are smaller (band now 310px, no sideways scroll). Test for both rules.

### Not changed

- Nothing else looked wrong: the band sits cleanly between the page sections and keeps the heading "Our clients". Nothing was committed, pushed or deployed.

## [0.11.1] - 2026-10-23

### Patch Changed

- The reference clients (same `referenceClients` site fact) now also show on the About page, after the Company snapshot, and on the Forklift Rental page, after its sections, each under the short heading "Our clients". Home keeps its longer heading. The band reads the fact in one place, so editing the list in the admin updates all three pages, and an empty fact hides all three.
- `ContentPage` has a new `showClients` option, set only on the rental page, so other content pages do not repeat the list. Tests cover the placement and the heading.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.11.0] - 2026-10-23

### Minor Changed

- Reference clients supplied by the owner are published on the home page, in a "Trusted by businesses and public bodies in Laos" band under the proof strip. Forklift rental and fleet: Beerlao, Coca-Cola, Heineken, Lao Telecom, HOYA. Government: Ministry of Public Health. The owner said more would be added later.
- Stored as the `referenceClients` site fact in the form "Group: Name, Name | Group: Name", so the owner can add names in the admin without a developer (`src/lib/data/clients.ts` parses it). Names are shown as text pills, not logos: a logo wall needs each company's permission and artwork. The band disappears when the fact is empty.
- CMS: new Site facts field and a migration (`20261023_050041_reference_clients`). Local facts reseeded.
- Tests for parsing, odd input, the empty case and the placement on the home page.

### Not changed

- The Ministry and the companies' agreement to be named publicly has not been checked by us: the owner's list is taken as permission, and spellings (for example Coca-Cola) should be confirmed. No case study, result or number is claimed. The About and rental pages do not show the clients yet. Nothing was committed, pushed or deployed.

## [0.10.3] - 2026-10-23

### Patch Changed

- The owner confirmed the WhatsApp roles: Sales is +85620 2802 3355; Aftersales is +85620 2323 1922 and +85620 2323 1911 (the 1911 number does start with +85620). The fact now reads "Sales: ..., Aftersales: ..., Aftersales: ...", and the footer links are labelled "WhatsApp Sales" and "WhatsApp Aftersales". A WhatsApp value without a team name still shows as plain "WhatsApp", so the CMS field needs no change.
- Footer channel links now use their address as the list key, since several channels share a label.
- Test for the team labels. The 2802 3355 number is no longer listed under aftersales.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.10.2] - 2026-10-23

### Patch Changed

- Added two site facts, `youtube` (https://www.youtube.com/channel/UCONgeO8Upbiwk1ba681-Erg) and `twitter` (https://twitter.com/DKLaoTrading), supplied by the owner. They show in the footer "Reach us" block as "YouTube" and "X" links after Facebook, and as "YouTube" and "X (Twitter)" rows on the Contact page. Unset values stay hidden.
- CMS: two new fields in Site facts, and the two keys can be chosen for fact-bound page items. Migration `20261023_044132_social_links` adds the columns and enum values. The sanitiser treats them like every other fact. Local CMS facts and the Contact page row were refreshed.
- Tests for the channel order, labels, link text, hiding when unset, the Contact rows and the CMS sanitising.

### Not changed

- Nothing was committed, pushed or deployed. The links were not opened or checked by a request from this machine.

## [0.10.1] - 2026-10-23

### Patch Changed

- Published the contact details the owner supplied on 23 October 2026: office phone +85621 480 248; WhatsApp +85620 2802 3355 (sales), +85620 2323 1922 and +85620 2323 1911 (aftersales); email info@dklao.com and salescenter@dklao.com; address Unit 24, Kamphaengmeuang Rd, NongHai Village, Hatxayfong District, Vientiane Capital, Lao PDR. The footer "Reach us" block and the Contact page now show them. Facebook was already set.
- A contact fact can now hold several comma-separated values, and each becomes its own link (tel, wa.me, mailto). The local CMS site facts were reseeded.
- Tests for multi-value channels and the published contact details.

### Not changed

- The aftersales number 2323 1911 was written without the +85620 prefix in the owner's message; +85620 is assumed from the old live page. The old page listed 2802 3355 as Service and 2323 1911 and 1922 as Sales; the owner's new list swaps the roles, so only numbers are published, with no role labels. Twitter (DKLaoTrading) and YouTube channel links were supplied but are not shown yet (no fields). The 021 480 248 number on the old page is the same as the new office number without the country code. Nothing was committed, pushed or deployed.

## [0.10.0] - 2026-10-23

### Minor Changed

- Spam protection on `POST /api/leads/quote`: a hidden trap field (`homepageUrl`, off-screen, skipped by keyboard and screen readers) whose filled value gets the normal thank-you but is never saved or notified; a per-address limit (default 5 requests per 10 minutes, `LEAD_RATE_LIMIT` and `LEAD_RATE_WINDOW_SECONDS`) that answers 429 with a `Retry-After` time and counts bot attempts too; and a 20,000-character body cap. The trap field is stripped before saving. The limiter is in memory (`src/lib/leads/rate-limit.ts`), so on serverless hosting each instance counts alone: add the host's firewall before launch.
- New-lead notification (`src/lib/leads/notify.ts`): one outbound webhook set by `LEAD_NOTIFY_WEBHOOK_URL`, so email, WhatsApp, Slack or chat can be reached through any automation service with nothing secret in the code. https only (http for localhost), no embedded credentials, no redirects, a 4-second timeout. `LEAD_NOTIFY_WEBHOOK_SECRET` adds an `X-DKLAO-Signature: sha256=<hmac>` header. By default it sends only the lead id, category, company, source page and an admin link; `LEAD_NOTIFY_DETAILS=full` adds the contact, phone, email and message. It runs after the lead is saved and can never fail or slow the visitor's request beyond the timeout. Logs name only the lead id.
- The saved lead now returns its record id, which the notification uses for the admin link.
- Tests (116 in total): the limiter, the settings, the client address, the notification content, signing and failure handling, the endpoint end to end (honeypot, limit, size, validation, order of save and notify) and the trap markup. A live run with a local receiver confirmed signing, summary and full modes, honeypot, the sixth-request refusal, a down receiver and no receiver; its test leads were deleted.
- `.env.example` and `docs/deploy-checklist.md` list the new settings and the checks to run on the preview.

### Not changed

- No email service, WhatsApp account or webhook receiver was created or called, and no secret was added. Nothing was committed, pushed or deployed.

## [0.9.6] - 2026-10-23

### Patch Changed

- Launch-readiness test, run locally against the production build: 63 checks across pages, content, accessibility basics, links, SEO files, assets, security, the quote form and edge cases. First run found two items: no browser protection headers (real), and a test that wrongly flagged Next.js's own routing data (not a bug). The second run passed 63 of 63.
- Added security headers to every response (`src/lib/security-headers.ts`, wired in `next.config.ts`): `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` and a `Permissions-Policy` that turns off camera, microphone, location and payment. HSTS is left to the host, and a Content-Security-Policy is a later step.
- Test for the headers and for their wiring into `next.config.ts`.
- The test leads the run created in the local database were deleted.

### Not changed

- Nothing was committed, pushed or deployed. Not yet covered: a real device and screen reader test, a performance audit with Lighthouse, lead notifications, spam protection on the quote form, and analytics.

## [0.9.5] - 2026-10-22

### Patch Changed

- Search titles and descriptions: Home is now "Forklift Rental, Sales & Service in Laos | DK LAO" (49 characters, was 82) with a 128-character description (was 159), and the long dash is gone. About is now "About Us: Forklift & Warehouse Partner in Laos | DK LAO" (55 characters, was 98) with a 122-character description (was 206). Social titles and descriptions follow the same limits. The text lives in `src/lib/data/seo.ts`, used by the layout and the About page.
- The About title rule in `AGENTS.md` and the Home and About lines in `con_agents/CONTENT.md` were updated to match. This replaces the earlier 89-character About title, on the owner's instruction to keep titles to 60 characters.
- Call-to-action wording: one label per intent, all in Title Case. "Talk to a DK LAO Advisor" replaces "Talk to DK LAO Advisor", "Talk to a DK LAO advisor" and the About "Contact DK LAO" button. "Get a Recommendation" replaces "Ask for Recommendation", "Ask for a recommendation", "Get Recommendation" and "Get Cleaning Equipment Recommendation". "See Rental Options" replaces "See rental options". Changed in the home, About, content-page and footer sources, the sitemap page generator and the local CMS rows.
- Tests: `seo.test.ts` checks all 21 pages (title up to 60, description 70 to 155, no long dashes, unique titles and descriptions, Home and About read from one module). `cta.test.ts` checks Title Case and one label per intent across data and components.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.9.4] - 2026-10-22

### Patch Changed

- About page: the first trust card title "One-stop industrial equipment partner" is now "Forklift and warehouse equipment partner", matching the planned About wording and the hero. Its description is unchanged. No "one-stop" wording remains in the source.
- Tests: the card title, and a check that the About data and hero contain no "one-stop" wording.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.9.3] - 2026-10-22

### Patch Changed

- Footer: the single 18-link list is now four named groups in four columns (two on phones): Rent & buy, Service & parts, Warehouse & cleaning, Company & guides. The groups live in `src/lib/data/footer.ts`, and a test fails if a published page is missing from the footer or listed twice. The contact block (lead actions, reach us) sits above the groups.
- Phone tap targets: below 760px, footer links, the credit link, card links ("View details" and the home service band), About solution links, breadcrumb links, contact-table links and FAQ question rows are at least 40px tall. Measured on all 21 pages at 375px: 0 targets under 38px (it was 7 to 23 per page).
- Phone headlines: below 560px, hero headlines on content and About pages and section titles are smaller, with balanced wrapping. The longest headline now sets in 3 lines (it was 4 on About and Logistics), most in 1 to 2, and nothing scrolls sideways.
- Tests for the footer groups and for the phone rules in the stylesheet.

### Not changed

- Home page length on phones, page imagery and the About "One-stop" trust card are untouched. Nothing was committed, pushed or deployed.

## [0.9.2] - 2026-10-22

### Patch Changed

- Fixed `/forklift-sales`: the New forklifts and Used forklifts cards, and their links to `/forklift-sales/new` and `/forklift-sales/used`, had been hidden because their descriptions carried an unconfirmed claim. The cards now show with safe wording ("Compare new options for your site and budget." and "Ask what used units are available now."). The warranty, service history and inspection claims are kept as separate cards flagged **Needs owner confirmation**, so they stay hidden until the owner confirms them. The generated page data and the local CMS row were refreshed.
- About hero: the headline is now "Your Forklift and Warehouse Equipment Partner in Laos" (no "one-stop" wording), the copy is the planned sentence, and the hero has one primary button (Request a Quote) and one secondary button (Contact DK LAO). The "View Our Solutions" button and the four badge chips were removed; the founding year stays in the Company snapshot. Removed the unused badge styles.
- Tests: the hero buttons and copy, the sales cards and their links, and a rule that no page loses a link to a child page because of an unconfirmed claim.

### Not changed

- Nothing was committed, pushed or deployed.

## [0.9.1] - 2026-10-22

### Patch Changed

- Standout visual pass on the home page, keeping the DK LAO colours, Inter and the layout of the site (a preserving redesign, not a new style).
- Hero: the headline is now the planned search headline "Forklift Rental, Sales & Service in Laos", set in two lines; the approved tagline moved to the eyebrow; the word "platform" is gone; the copy under it is 19 words; the hero shows one primary and one secondary button (the maintenance button stays in the routing cards). Phones stack the two buttons.
- Added `HomeProof`, a strip under the hero with three plain facts: 2010, 24/7 reply (AI agents and human advisors) and Vientiane. Each comes from the founding year or the CMS site facts, and a fact that is not confirmed is not shown.
- Routing cards are now a bento: Rental inquiry as the large featured card with a navy grid texture, and three supporting cards, filling the 3 by 2 grid exactly. The section heading is stacked and left-aligned instead of split.
- Controls: cards lift and the arrow slides on hover, buttons press down on click, headings use tighter tracking and balanced wrapping.
- Motion: the hero text rises in, and sections reveal as they scroll into view using CSS scroll-driven animation. Browsers without it show everything at rest, and reduced-motion users get no animation.

### Not changed

- No new image, font or colour. Home copy below the hero, the other pages and all routes are unchanged. Nothing is deployed or pushed.

## [0.9.0] - 2026-10-22

### Minor Changed

- Built the 16 remaining sitemap pages, planned in `docs/cms-page-plan.md`: short and long term rental, forklifts for sale (new and used), maintenance, spare parts, batteries and chargers, warehouse, material handling, racking, cleaning, industries, logistics and warehousing, knowledge centre, and the rental checklist article. All 21 routes are now published and listed in `sitemap.xml`.
- One catch-all route, `src/app/(site)/[...slug]/page.tsx`, serves every published route without its own file. A published CMS row wins over the built-in page (`src/lib/data/sitemap-pages.ts`, generated from the sitemap). Unknown or unpublished addresses return 404.
- Five new section types: `list`, `stats`, `chips`, `text` and `form` (the real quote form, preselected for the page). Pages also get breadcrumbs on nested routes and `BreadcrumbList` and `FAQPage` structured data.
- Hidden content: the 38 sitemap items marked `[[CONFIRM]]` are stored with **Needs owner confirmation** ticked and the marker text removed, so they stay hidden until the owner reviews and unticks them. Sections and items can both carry the flag. Author notes in the sitemap (photo and diagram instructions, stock rules, article byline) were rewritten as real copy or dropped.
- Menu: new Solutions dropdown (seven pages with a line each), then Industries, Knowledge, About and Contact, with a grouped mobile menu. The menu is a `navigation` global in the CMS with a built-in default; links to unpublished pages are hidden. The dropdown opens on click or Enter, closes on Escape, outside click or tabbing away, and returns focus.
- Articles now use Payload's `slugField()`. Migration `20261022_151309_pages_sitemap_menu` adds the new fields and the navigation tables, and re-runs the Supabase lockdown through a shared helper (`src/payload/supabase-lockdown.ts`) so new tables are closed to the Data API too.
- `pnpm cms:seed` now also creates the 16 pages and the default menu, never overwriting existing rows. Added tests for the 16 pages, hidden items, breadcrumbs, quote categories and the menu.

### Not changed

- Home and About copy is still in `src/lib/data/`. No photos, no Lao content, no article pages from the Articles collection.
- Nothing is deployed, pushed or sent to a remote service. No prices, stock or brand or dealer claims are published.

## [0.8.1] - 2026-10-22

### Patch Changed

- Phase 3 preparation, local only. Added `.github/workflows/ci.yml`: one job runs the version check, tests, lint, typecheck and build with no database; a second job applies the migrations to an empty Postgres 17. It deploys nothing and holds no secrets.
- Added `.env.example` (git-ignore exempt) documenting `APP_URL`, `DATABASE_URL`, `DATABASE_POOL_MAX` and `PAYLOAD_SECRET`. Deployment tokens are explicitly not app variables.
- Added `docs/deploy-checklist.md`: owner decisions, push readiness, Supabase and Vercel setup, first-owner registration, preview checks, go-live, rollback.
- Added migration `20261022_150000_supabase_lockdown`: where Supabase's `anon` and `authenticated` roles exist, it revokes their table privileges and enables row level security on every table; elsewhere it does nothing. Tested on a scratch database with simulated roles, then removed.
- Set `packageManager` to `pnpm@10.29.3` and `pnpm.onlyBuiltDependencies` (esbuild, sharp, unrs-resolver) so a frozen install exits cleanly in CI. Added `DATABASE_POOL_MAX` to the database pool.

### Not changed

- Nothing was pushed, committed, deployed or created on GitHub, Vercel or Supabase, and no token was read. CI action versions are tags, not commit SHAs; pinning is listed in the checklist.

## [0.8.0] - 2026-10-22

### Minor Changed

- Phase 2 of `docs/cms-backend-decision.md`, local only. The site now reads owner-confirmed facts from the CMS `site-facts` global (`src/lib/cms/site-facts.ts`) in the footer and on every content page. Clearing a fact in the admin hides its items on the site. Masked numbers (`+85620xxxxxxxx`), empty values and `[CONFIRM]` text become "not confirmed".
- Added the `pages` collection, shaped like the built-in `PageContent` (sections, fact-bound items, closing call to action), with drafts and versions. `/request-quote`, `/contact` and `/forklift-rental` use the published CMS row when one exists and the built-in page otherwise (`src/lib/cms/pages.ts`).
- Added the `articles` collection (title, slug, category, excerpt, body, related solution pages, SEO fields, drafts). Public article pages are not built yet.
- Visitors and advisors read published rows only. Owners and editors also see drafts. Only owners and editors write; only the owner deletes.
- Hidden `[CONFIRM]` content: the admin refuses to save text containing planning markers, and `visibleSections` also drops any item or section carrying one. Items bound to a fact stay hidden until the fact is filled in.
- Second migration `pages_articles`. `pnpm cms:seed` now also creates published rows for the three built-in pages, and never overwrites an existing row.
- Home, About, Contact and Rental refresh at most once a minute; Request a Quote is rendered on demand.

### Not changed

- Home and About copy still come from `src/lib/data/homepage.ts` and `about.ts`, not the CMS. The five unbuilt routes in the registry are still unpublished.
- Nothing is deployed, pushed or committed, and no remote service was called.
- The live `dklao.com` numbers (phone 021 480 248 and three WhatsApp numbers) were seen on the public coming-soon page but are not in the facts until the owner confirms them.

## [0.7.0] - 2026-10-22

### Minor Changed

- Added Payload CMS 3.80.0 as the backend, local only (Phase 1 of `docs/cms-backend-decision.md`). Admin is at `/admin`, REST at `/api/*`. GraphQL is disabled.
- Three roles: `owner` (everything), `editor` (website content, no customer data), `advisor` (leads, no users or content). The first account registered at `/admin` becomes the owner.
- Added the `site-facts` global (public read, owner write) and the `leads` collection (staff read, owner delete, no public write). `/api/leads/quote` saves to the `leads` collection when `DATABASE_URL` is set, and to the local JSONL file otherwise.
- Database: a dedicated local PostgreSQL 17 cluster on 127.0.0.1:5433. The schema is applied by the reviewed migration in `src/payload/migrations` (`push` is off). `pnpm cms:seed` copies the confirmed facts and creates no users or passwords.
- Moved the public pages into the `src/app/(site)` route group so the admin can have its own root layout. URLs are unchanged. Set `"type": "module"` in `package.json` so the Payload CLI can load the config.
- Added tests for the role rules and the lead store fallback. Setup notes are in `docs/cms-local-setup.md`.

### Not changed

- Nothing is deployed, pushed or committed. No Supabase or Vercel call was made and no token was read. Site pages still read `src/lib/data/site-facts.ts`, not the CMS.
- Payload has no official MySQL adapter (Postgres, SQLite and MongoDB only), so the plan stays on Postgres.

## [0.6.2] - 2026-10-22

### Patch Changed

- Recorded owner-confirmed business facts in `src/lib/data/site-facts.ts` (22 October 2026): Facebook page `https://www.facebook.com/DKLAOonline`; opening hours and reply time as "24/7, AI agents and human advisors working together"; service area as based in Vientiane plus online channels; brand answer "we supply the brand that meets your requirement"; pricing depends on the equipment specification.
- `phone` and `whatsapp` stay unset. The owner sent masked numbers (`+85620xxxxxxxx`), which must not be published. A test now rejects masked or bracketed values in site facts.
- Added the `facebook` and `brands` fact keys and a `contactChannels()` helper. The footer shows a "Reach us" block with every confirmed channel (phone, WhatsApp and Facebook together once the numbers are set). Today it shows Facebook only.
- Contact page now shows Facebook, hours, service areas, and reply time. Rental page shows the brand answer. Rental and quote FAQs now say price depends on the equipment specification.
- Brand stance recorded as brand-neutral. The 2013 "sole authorised Mitsubishi dealer" claim is not used on the site, and tests reject "authorised dealer" wording.

### Not changed

- Still unconfirmed and hidden: phone and WhatsApp numbers, email, address, delivery coverage, maintenance terms, rent-to-buy terms, and the rental capacity range and power types.
- Whether human advisors are on duty 24/7 or only AI agents are is not stated precisely; the published wording follows the owner's phrase and should be confirmed.

## [0.6.1] - 2026-10-22

### Patch Changed

- Corrected the footer founding year from 2019 to 2010 on the owner's confirmation (22 October 2026). The footer now reads `Copyright © DK LAO Since 2010-<current year>, v0.6.1`, matching the About page, which already said 2010.
- Updated `foundedYear` in `src/lib/site-metadata.ts` and its test, and the footer contract in root `AGENTS.md` and `con_agents/AGENTS.md`.
- Resolves the founding year conflict recorded as open under 0.6.0 "Not changed". Earlier entries that mention 2019 (0.4.1) are history and are left as written.
- Updated version records from `0.6.0` to `0.6.1` as a patch content correction.

## [0.6.0] - 2026-10-22

### Minor Changed

- Added the route registry `src/lib/data/routes.ts` as the single source for the header, footer, 404 links, sitemap, and "Related solutions". Planned routes are listed with `published: false` and are never rendered or advertised until their page exists.
- Added the public routes `/forklift-rental`, `/contact`, and `/request-quote`, built on a shared `ContentPage` component and typed page content in `src/lib/data/pages.ts`.
- Added `src/lib/data/site-facts.ts`. Any page item bound to an unconfirmed fact (phone, WhatsApp, email, address, hours, service areas, reply time, delivery, maintenance terms, rent-to-buy terms) is hidden until the owner supplies the value.
- `/request-quote` now reads `?category=` to preselect the form and `?from=` (same-site paths only) to record the originating page. Lead type is derived from the selected category (`src/lib/leads/intents.ts`), so rental inquiries are stored as `RENTAL_INQUIRY`, service as `SERVICE_BOOKING`, and so on.
- Header, footer, 404 page, and the floating quote button now link to `/request-quote` instead of a bare `#quote-request` anchor that only worked on the homepage.
- Header, footer, and 404 links now list only published routes, which removes links to pages that returned 404.
- `sitemap.xml` is generated from the registry. Each new page sets its own canonical URL.
- Updated version records from `0.5.0` to `0.6.0` as a minor route expansion.

### Not changed

- Homepage cards, the knowledge preview, and About CTAs still link to pages that are not built yet (`/forklift-sales`, `/spare-parts`, `/maintenance-service`, `/cleaning-equipment`, `/warehouse-equipment`, `/material-handling`, `/batteries-chargers`, `/knowledge-center`). They are replaced as each page ships.
- The root layout still sets `alternates.canonical` to `/`; pages that do not set their own canonical inherit it.
- The founding year conflict (About says 2010, footer says 2019) is unresolved and awaits owner confirmation.

## [0.5.0] - 2026-06-16

### Minor Changed

- Added the public `/about` route for the About DK LAO page using the owner-provided Phase 1 design and content direction.
- Added route-specific About page sections: `AboutHero`, `CompanySnapshot`, `AboutStory`, `VisionCommitment`, `AboutWhatWeDo`, `WhyChooseDKLAO`, `IndustriesServed`, `ServicePromise`, and `AboutFinalCTA`.
- Added About page content data and tests covering DK LAO business scope, conversion actions, and claim safety.
- Added `About DK LAO` to the header, footer, route map, sitemap, content SEO title rules, root `AGENTS.md`, and master `con_agents/AGENTS.md`.
- Updated the header quote CTA to point to `/#quote-request` so it works from the About page and other routes.
- Extended `CTASection` to support a third action so the About final CTA includes `Contact DK LAO`.
- Updated version records from `0.4.2` to `0.5.0` as a minor route/content expansion.

### QA

- Ran `pnpm version:status`, `pnpm test -- --run`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` successfully.
- Browser-checked `/about` on desktop and 390px mobile: required sections render, final CTA includes `Contact DK LAO`, footer shows `v0.5.0`, and there are no console errors or horizontal overflow.
- Smoke-checked `http://localhost:3000/`: header includes `About DK LAO`, quote CTA targets `/#quote-request`, the `#solutions` anchor exists, footer shows `v0.5.0`, and there are no console errors or horizontal overflow.

## [0.4.2] - 2026-06-16

### Patch Changed

- Added DK LAO Website 2026 branch governance to root `AGENTS.md` and master `con_agents/AGENTS.md`.
- Defined `main` as the production-ready verified branch for owner-approved, tested, changelogged work.
- Defined `design/dklao-website-2026` as the owner-review branch for design, UI/UX, content placement, motion, and asset-direction exploration.
- Added promotion rules for moving selected design work into `main`, including owner approval, changelog updates, version checks when applicable, project gates, and browser QA for visible changes.
- Updated version records from `0.4.1` to `0.4.2` as a patch governance change.

### QA

- Version tracking must pass `pnpm version:status` before push preparation.
- Ran `pnpm version:status`, `pnpm test -- --run`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` successfully.

## [0.4.1] - 2026-06-16

### Patch Changed

- Added footer ownership metadata: left-side `Copyright © DK LAO Since 2019-2026, v0.4.1` and right-side BizEra developer credit linking to `https://www.bizera.la/`, with the visible website version sourced from `VERSION.json`.
- Added footer ownership and version rules to root `AGENTS.md` and master `con_agents/AGENTS.md`.
- Updated version records from `0.4.0` to `0.4.1` as a patch change.

### QA

- Added `siteFooterMetadata` coverage to keep footer ownership and version metadata aligned with `VERSION.json`.
- Ran `pnpm version:status`, `pnpm test -- --run`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` successfully.
- Browser-checked the footer at `http://localhost:3000/` on desktop and 390px mobile: left text renders as `Copyright © DK LAO Since 2019-2026, v0.4.1`, right text renders as `Develop by: BizEra (www.bizera.la)`, the BizEra link targets `https://www.bizera.la/`, and there are no console errors or horizontal overflow.

## [0.4.0] - 2026-06-16

### Minor Changed

- Added project version tracking across `package.json`, `VERSION.json`, `con_agents/VERSIONING.md`, and `con_agents/CHANGELOG.md`.
- Added `pnpm version:status` to verify that the package version, current-version manifest, and latest changelog entry remain aligned.
- Documented major, minor, and patch change-level rules, including when to use `Major Changed`, `Minor Changed`, and `Patch Changed` changelog labels.
- Updated root and master agent rules so version-impacting changes must update version records before completion.

### QA

- Version tracking must pass `pnpm version:status` before release or push preparation.
- Ran `pnpm version:status`, `pnpm test -- --run`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` successfully.

## [0.3.1] - 2026-06-16

### Changed

- Replaced the homepage "Equipment matching" anatomy visual with the owner-provided static forklift anatomy reference image at `public/images/anatomy/forklift-equipment-matching-reference.png`.
- Simplified `AnatomyDiagram` from a client-side animated callout component into a static server component using the reference image.
- Removed the old anatomy callout columns, connector-line CSS, scroll-triggered callout animation hooks, and unused legacy hotspot styles from `globals.css`.
- Added a conventional `public/favicon.ico` generated from the official DK LAO favicon PNG and updated metadata to prefer `/favicon.ico`.
- Added canonical GitHub repository details and implementation workflow rules to root `AGENTS.md` and master `con_agents/AGENTS.md`, including the moved remote `bstBizEra/dklWeb2026`, `main` branch policy, fetch-before-push behavior, local `localhost:3000` verification, and required project gates.
- Added ngrok local preview tunnel rules to root `AGENTS.md` and master `con_agents/AGENTS.md`, including the approved preview domain, direct port `3000` command, host-header fallback, optional Nginx reverse proxy route, and directory-index fail-safe.

### QA

- Ran `pnpm test -- --run`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` successfully.
- Browser-checked the Equipment matching section on desktop and 390px mobile: new reference image renders, no old callout DOM remains, animation names are `none`, no horizontal overflow, and no console errors.

## [0.3.0] — 2026-06-15

### Added

- Added branded `not-found.tsx` (404) page with header, footer, primary CTAs, and popular-destination links so unbuilt inner routes keep visitors in the lead funnel.
- Added accessibility skip-to-content link and `#main-content` landmark on the home and 404 pages.
- Added global `:focus-visible` keyboard focus ring using brand-blue token.
- Added `app/robots.ts` (allow all, disallow `/admin` and `/api`, sitemap + host) and `app/sitemap.ts` (homepage only to avoid advertising unbuilt routes).
- Added `.dk-skip-link` and `.not-found` token-driven styles to `globals.css`.
- Replaced the equipment-matching visual with a full `AnatomyDiagram` client component: 19 part callouts (mast, lift chains, tilt cylinder, load backrest, carriage, forks; safety beacon, overhead guard, operator seat, steering wheel, control levers, hydraulic hoses, engine compartment, counterweight, fuel/battery, service panel, rear steering wheels; front drive wheels, hydraulic cylinders) arranged in two side columns with connector lines, revealing one-by-one on scroll (IntersectionObserver, staggered). Callouts overflow on top of the image mask (`overflow: visible`, raised z-index); no-JS keeps them visible and `prefers-reduced-motion` shows them instantly. Removed the prior `AnatomyVisual` component.
- Wired the existing approved `public/images/hero/forklift-anatomy-hero.png` into the homepage "Equipment matching" section, replacing the CSS-drawn forklift shapes with the real photo and four part-anchored requirement callouts (capacity, lift height, power/runtime, indoor/outdoor); gave each requirement list item a distinct icon.

### Changed

- Reworked the equipment-matching section into two parts: left = heading/intro ("Know the forklift, ask the right questions"), right = the forklift diagram with callouts. Trimmed callouts to the requested balanced set of 6 per side (left: mast, lift chains, tilt cylinder, load backrest, carriage, forks; right: safety beacon, operator seat, hydraulic hoses, engine compartment, counterweight, rear steering wheels), anchored each column to the outer margin with connector lines pointing inward, and removed the previous bottom row.
- Swapped in a cleaner studio forklift render (provided by the owner) as `forklift-anatomy-hero.png`.

- Repositioned the homepage Quick-Quote bar below the hero (`margin-top` -46px -> 50px) instead of overlapping it; restyled the "Start with the right DK LAO workflow" heading to right-aligned brand-blue with navy default header text for the new light-surface placement.
- Reworked the "Equipment matching" forklift visual to zoom out (object-fit `cover` -> `contain`) so the full truck reads smaller and uncropped, and re-anchored the four spec callouts to the resized layout.

- Hardened homepage SEO metadata in `layout.tsx`: added `metadataBase`, title template, canonical, keywords, Open Graph image, Twitter card, granular robots directives, and a separate `viewport` export with brand `themeColor`.
- Aligned the Home `<title>` to the approved `CONTENT.md` em-dash form.

### QA

- Validated syntax/JSX of all changed `.ts`/`.tsx` files and CSS brace balance.
- Note: full `next build`, `lint`, `typecheck`, and `vitest` must be run on the Windows/Laragon toolchain (the sandbox cannot resolve the Windows pnpm symlink store). Unit tests are unaffected — they import only `leads.ts` and `homepage.ts`, which were not modified.

## [0.2.0] — 2026-06-15

### Added

- Added explicit Windows development path: `C:\laragon\www\dklao`.
- Added explicit agent control path: `C:\laragon\www\dklao\con_agents`.
- Added logo and favicon source path: `C:\laragon\www\dklao\images\logo & FAV_Icon`.
- Added slogan graphic source path: `C:\laragon\www\dklao\Icons for slogan`.
- Added `ASSETS.md` for logo, favicon, slogan graphics, image, and media rules.
- Added `TECHNOLOGY_SOFTWARE_INFRA.md` for technology stack, software, local environment, infrastructure, and phase-based platform rules.
- Updated root `AGENTS.md` bridge behavior.
- Updated master `AGENTS.md` source-of-truth list.
- Updated `AGENT_BOOTSTRAP.md` path detection rules.

### Changed

- Strengthened path-aware governance for Windows/Laragon and `/dklao` agent-control usage.
- Added asset discovery rules for design and frontend agents.

### Security

- Reinforced that Windows local asset paths must not be hardcoded into browser-rendered code.
- Reinforced secret/token handling through `TOKEN_MANAGEMENT.md`, `SECURITY.md`, and `ENVIRONMENT.md`.

## [0.1.0] — 2026-06-15

### Added

- Initial DK LAO root bridge `AGENTS.md`.
- Initial master control file under `/dklao/con_agents/AGENTS.md`.
- Initial companion control package for design, content, architecture, routes, components, data model, API contracts, forms, QA, security, deployment, and infrastructure.
