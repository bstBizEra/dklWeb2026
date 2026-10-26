# DEPLOYMENT.md — DK LAO Build, Environment, Release, and Rollback Rules

## 1. Purpose

This file controls deployment workflow, environment separation, build checks, release process, and rollback procedures.

## 2. Environment Strategy

```txt
local       Developer machine (http://localhost:3000)
preview     Private owner-review site at https://preview.dklao.com on the DK LAO cPanel server
production  Live DK LAO website/platform at https://dklao.com (switch still pending owner approval)
```

## 3. Branch Strategy

```txt
main                         Production-ready verified branch
design/dklao-website-2026    Owner-review design and UI/UX exploration branch
feature/*                    Scoped implementation work
fix/*                        Scoped bug fixes
hotfix/*                     Urgent production-ready fixes
```

Branch rules are defined in the root `AGENTS.md` and `con_agents/AGENTS.md` §16.

## 4. Required Checks Before Merge

```txt
pnpm version:status
pnpm test -- --run
pnpm lint
pnpm typecheck
pnpm build
migrations apply to an empty database (CI)
responsive QA
form QA
security review for forms/API
CHANGELOG update for every change
```

GitHub Actions (`.github/workflows/ci.yml`) runs the automated checks on every pull request.

## 5. Deployment Model

Current (owner decision, 2026-10-25): the site, Payload CMS and PostgreSQL run on DK LAO's own cPanel server.

```txt
Runtime:     systemd service dklao-site (user dklao, Node.js 22, 127.0.0.1:3110)
Web server:  Apache proxy include per site, Cloudflare DNS in front
Database:    PostgreSQL 16 on the same host, local connections only
Settings:    /home/dklao/.config/dklao-site.env (mode 600), never committed
Migrations:  applied on start in production (prodMigrations)
```

Preview deploys are automated: `.github/workflows/deploy-preview.yml` deploys `main`, any pull request labelled `deploy:preview`, or a branch run by hand, to preview.dklao.com. Each run waits for owner approval in the GitHub `preview` environment. It uses a deploy key limited to `scripts/server/dklao-deploy-preview` on the server (forced command), which backs up the database before new migrations and rolls back automatically on a failed build or health check. The live site (dklao.com) is still deployed by hand.

Step-by-step procedure, server facts and open items: `docs/deploy-checklist.md` (automatic preview deploys: section 3a). Moving to another hosting model (for example a VPS with Docker/Podman) requires the change control in `TECHNOLOGY_SOFTWARE_INFRA.md` §12 and owner approval.

## 6. Rollback Rules

Every production release must have:

```txt
Previous build available
Database migration rollback plan if migration exists
Environment variable change record
Emergency contact owner
```

## 7. Production Readiness

Do not deploy if:

- Forms do not work.
- Official logo/favicon is missing.
- Secrets are exposed.
- Build fails.
- Placeholder content remains.
- Admin route is public.
