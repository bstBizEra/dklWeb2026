# Deploy checklist: GitHub, Supabase, Vercel

Phase 3 of `docs/cms-backend-decision.md`. This is a checklist for a human or an approved agent. Nothing in it has been run: no push, no project created, no service called.
Each step that touches a remote service needs the owner's go-ahead on that day.

## 0. Decide before starting

| Question | Why it matters | Answer |
|---|---|---|
| Who owns and pays for the Supabase and Vercel accounts? | Production needs Supabase Pro (USD 25 a month) and Vercel Pro. Free plans pause the database after a week and Vercel Hobby is non-commercial only | |
| Which email owns the first CMS account? | The first person to register at `/admin` becomes the owner | |
| When may `dklao.com` move off the current host? | It now shows a "coming soon" page from a cPanel server behind Cloudflare | |
| Are the live-page phone and WhatsApp numbers confirmed? | Facts stay hidden until confirmed | |

Vendor prices and limits were read on 2026-10-22. Check them again before buying.

## 1. Before any push

- [ ] Review the uncommitted work in this folder, then commit it on a task branch (format `[TASK-XXX] Description`, branch `<agent>/<feature>/<description>`). Do not commit `.env.local`, `data/` or `lao-review-sheet.csv`.
- [ ] Confirm `origin` is `https://github.com/bstBizEra/dklWeb2026.git`.
- [ ] Run the gates once more: `pnpm test -- --run`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm version:status`.
- [ ] `git fetch origin`, then merge or rebase. Never force-push `main`.
- [ ] Open a pull request into `main`. The CI workflow (`.github/workflows/ci.yml`) must pass: it runs the gates and applies the migrations to an empty Postgres.
- [ ] Optional hardening: replace the `@v4` action tags in `ci.yml` with full commit SHAs, so a moved tag cannot change what runs.
- [ ] Branch protection on `main`: require the CI checks and one review.

## 2. Supabase (database)

- [ ] Create one project, region **Singapore** (closest to Laos), plan **Pro**.
- [ ] Set a long database password and keep it in the password manager only.
- [ ] Copy two connection strings from the project's Connect panel: the pooled one (for the running site) and the direct or session one (for migrations).
- [ ] Do **not** create tables by hand. Do not use the Data API keys in the site: the CMS connects with the database string only.
- [ ] Run the migrations once, from a trusted machine, with the direct string:
  `DATABASE_URL=<direct string> PAYLOAD_SECRET=<any 32+ characters> pnpm cms:migrate`
- [ ] Check the lockdown migration worked. In the SQL editor, both of these must return no rows:
  `select tablename from pg_tables where schemaname='public' and not rowsecurity;`
  `select table_name from information_schema.role_table_grants where grantee in ('anon','authenticated') and table_schema='public';`
- [ ] Turn on daily backups (Pro includes them) and note the restore steps in `docs/DR_Plan.md`.
- [ ] Media storage is not wired yet. When uploads are added, use a private bucket and the S3 storage adapter, not the database.

## 3. Vercel (site and admin)

- [ ] Create a **Pro** team and import the GitHub repository. Framework preset: Next.js. Package manager is read from `package.json` (`pnpm@10.29.3`).
- [ ] Set the function region to Singapore (`sin1`) so it sits next to the database.
- [ ] Add environment variables for **Production** and **Preview** (values are never committed):

| Variable | Production | Preview |
|---|---|---|
| `DATABASE_URL` | Supabase pooled string | A separate Supabase project or branch, never production data |
| `DATABASE_POOL_MAX` | `3` | `3` |
| `PAYLOAD_SECRET` | New random 32 bytes (see `.env.example`) | A different random value |
| `APP_URL` | `https://www.dklao.com` | Leave unset |

- [ ] Do not add `SUPABASE_ACCESS_TOKEN` or `VERCEL_TOKEN` to the project. The site does not read them.
- [ ] Turn on **Deployment Protection** for previews, so only the team can open them.
- [ ] Deploy a preview first. Do not attach the real domain yet.

## 4. First start (do this before anything is public)

- [ ] On the protected preview, open `/admin`. The first account registered there becomes the **owner**, so the owner registers it personally, right away.
- [ ] Create the editor and advisor accounts from the admin.
- [ ] Run `pnpm cms:seed` against the new database (with the direct string). It copies the confirmed facts and the three pages, and never overwrites existing rows.
- [ ] Fill in the facts the owner has confirmed (phone, WhatsApp, address). Leave the others empty: empty facts stay hidden.
- [ ] Send a test quote from the preview. Check it appears under Leads, then delete it.

## 5. Verify the preview

- [ ] `/`, `/about`, `/contact`, `/forklift-rental`, `/request-quote` all load.
- [ ] A fact cleared in the admin disappears from the pages within a minute.
- [ ] No page text contains `[CONFIRM]`, `[[` or `xxxx`.
- [ ] Logged out, `GET /api/leads` and `GET /api/users` return 403, and `POST /api/leads` returns 403.
- [ ] An editor account cannot open Leads. An advisor account cannot open Pages or Users.
- [ ] The browser shows no Supabase keys or connection strings (View source, Network tab).

## 6. Go live (needs the owner's approval)

- [ ] Lower the DNS TTL a day before. Add `dklao.com` and `www.dklao.com` in Vercel, then change the records in Cloudflare. Keep the old cPanel files until the new site has run for a week.
- [ ] Re-check section 5 on the real domain, plus the sitemap and `robots.txt`.
- [ ] Rotate the tokens that were pasted into chat (Supabase access token, Vercel token, SSH password) and store the new ones in the password manager.

## 7. Rollback

- Site: in Vercel, promote the previous deployment. Nothing else changes.
- DNS: put the old records back (kept for a week above).
- Database: Supabase restore to a point in time. Migrations are forward-only; do not edit a migration that has run.

## 8. Not covered yet

- Media uploads and the storage adapter.
- Home and About copy still live in `src/lib/data/`, not the CMS.
- Lao content, article pages and redirects (Phase 4).
- Monitoring and alerts.
