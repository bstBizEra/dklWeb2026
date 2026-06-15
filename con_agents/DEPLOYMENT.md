# DEPLOYMENT.md — DK LAO Build, Environment, Release, and Rollback Rules

## 1. Purpose

This file controls deployment workflow, environment separation, build checks, release process, and rollback procedures.

## 2. Environment Strategy

```txt
local       Developer machine
staging     Pre-production validation
production  Live DK LAO website/platform
```

## 3. Branch Strategy

```txt
main        Production-ready branch
develop     Integration branch
feature/*   Feature work
hotfix/*    Urgent production fixes
```

## 4. Required Checks Before Merge

```txt
lint
typecheck
build
responsive QA
form QA
security review for forms/API
CHANGELOG update for major changes
```

## 5. Deployment Models

Allowed:

```txt
Vercel/Netlify frontend-first
VPS Node.js full-stack
Docker/Podman-ready deployment
Hybrid frontend + backend API
```

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
