# CMS local setup (Phase 1)

Local only. Nothing here talks to GitHub, Vercel or Supabase.

## What exists

- Payload CMS 3.80.0 inside the Next.js app: admin at `/admin`, REST at `/api/*`.
- Roles: `owner`, `editor`, `advisor` (`src/payload/access.ts`). The first account registered at `/admin` becomes the owner.
- Global `site-facts`, collection `leads`, collection `users`.
- Database: its own PostgreSQL 17 cluster at `C:\laragon\data\dklao-pg`, `127.0.0.1:5433`, database `dklao_cms`. It does not use the Laragon cluster on 5432.
- Connection string and secret live in `.env.local` (git-ignored). Never print or commit them.

## Daily use

Start the database (once per boot), from the repo root:

```bash
/c/laragon/bin/postgresql/postgresql-17.10/bin/pg_ctl.exe -D C:/laragon/data/dklao-pg -o "-p 5433 -c listen_addresses=127.0.0.1" -l C:/laragon/data/dklao-pg.log start
```

Then `pnpm dev -p 3001` for the site and admin.

## Commands

| Command | What it does |
|---|---|
| `pnpm cms:migrate:create <name>` | Create a migration after you change a collection or global |
| `pnpm cms:migrate` | Apply migrations |
| `pnpm cms:types` | Regenerate `src/payload-types.ts` |
| `pnpm cms:importmap` | Regenerate the admin import map |
| `pnpm cms:seed` | Copy confirmed facts into `site-facts` (creates no users) |

## Rules

- Schema changes go through migrations only (`push` is off).
- Install packages from this folder with `pnpm install --ignore-workspace`. The repo sits inside the main checkout, which has a `pnpm-workspace.yaml`, so plain `pnpm add` edits the main checkout's lockfile instead of this one.
- Phase 2: the footer and the three content pages read facts from the `site-facts` global and page copy from the `pages` collection. With no `DATABASE_URL`, or no published row, the built-in content in `src/lib/data/` is used.
- Empty facts hide their items. Do not type placeholders such as `[CONFIRM]` into the admin: it refuses them, and the site drops them anyway.
- `pnpm cms:seed` never overwrites a page that already exists, so admin edits are safe. To reset a page, delete its row in the admin and seed again.
- Dev-mode schema pushes are off. If `pnpm cms:migrate` ever asks about "dev mode", the database was pushed by hand: recreate the local database rather than accepting data loss.
- Secrets for Supabase and Vercel stay in `C:\Users\ounkh\.claude\secrets\dklao-agent.env`. Phase 1 does not read them.
