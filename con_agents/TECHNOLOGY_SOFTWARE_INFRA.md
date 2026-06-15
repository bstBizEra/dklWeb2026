# TECHNOLOGY_SOFTWARE_INFRA.md — DK LAO Technology, Software, and Infrastructure Control Rules

## 1. Purpose

This file controls the recommended technology stack, software choices, environment standards, local development assumptions, hosting direction, and infrastructure readiness for DK LAO.

It consolidates technology governance so agents do not introduce unnecessary tools or fragmented architecture.

## 2. Project Development Paths

Primary Windows development path:

```txt
C:\laragon\www\dklao
```

Agent control path:

```txt
C:\laragon\www\dklao\con_agents
```

Logo and favicon source:

```txt
C:\laragon\www\dklao\images\logo & FAV_Icon
```

Slogan graphics source:

```txt
C:\laragon\www\dklao\Icons for slogan
```

Agents must treat Windows paths as local source paths and use web-safe `/public/...` paths inside frontend code.

## 3. Recommended Application Stack

Frontend:

```txt
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Framer Motion
React Hook Form
Zod
```

Backend options:

```txt
Phase 1: Next.js API routes or server actions for lead capture
Phase 2: Dedicated API layer using NestJS, Fastify, Laravel, or equivalent
Phase 3: Service-oriented backend for rental, CRM, inventory, contracts, billing, and maintenance
```

Database:

```txt
PostgreSQL preferred
MySQL acceptable if existing hosting requires it
```

ORM/query layer:

```txt
Prisma or Drizzle for TypeScript stack
Laravel Eloquent if Laravel backend is selected
```

Admin/CMS:

```txt
Phase 1: Lightweight admin or headless CMS
Phase 2: Custom admin dashboard for catalog, leads, rental fleet, service requests
Phase 3: Full operations portal
```

## 4. Local Development Rules

Recommended local environment:

```txt
Windows 11
Laragon root: C:\laragon\www\dklao
Node.js runtime
Package manager: pnpm preferred, npm acceptable
Git for version control
Optional WSL support for Linux-compatible tooling
Optional Podman/Docker for container-ready deployment
```

Agents must not assume Linux-only paths when working in Laragon.

## 5. Frontend Rules

- Use TypeScript.
- Use reusable components.
- Use Tailwind tokens from `TOKEN.md`.
- Use shadcn/ui components only when they fit the design system.
- Use Framer Motion for approved motion patterns only.
- Use `next/image` for optimized images when using Next.js.
- Do not hardcode Windows asset paths in frontend code.
- Use `/public/images/...` and `/public/icons/...` for browser assets.

## 6. Backend Rules

- Validate all public forms with Zod or equivalent.
- Store leads in database or deliver to CRM/email with reliable logging.
- Never expose internal notes to customers.
- Keep API response shape consistent with `API_CONTRACTS.md`.
- Prepare data model for future CRM, rental, service, inventory, contracts, billing, and maintenance.

## 7. Infrastructure Options

Acceptable deployment models:

```txt
Option A: Vercel/Netlify frontend + managed database
Option B: VPS full-stack deployment with Node.js runtime
Option C: Docker/Podman-ready deployment for controlled infrastructure
Option D: Hybrid frontend hosting + backend API VPS
```

Agents must select the simplest option that satisfies the current phase.

## 8. Phase-Based Infrastructure

### Phase 1 — Lead-Generation Website

Required:

```txt
Static/dynamic website
Product catalog
Quote/rental/service/parts forms
Email/CRM notification
Analytics
Basic admin or CMS
```

### Phase 2 — Semi-Ecommerce Platform

Required:

```txt
Customer account
Saved quotations
Product comparison
Rental availability
Used equipment listings
Service ticket tracking
Spare-parts inquiry dashboard
Admin CRM dashboard
```

### Phase 3 — Digital Operations Platform

Required:

```txt
Online payment
Rental contract automation
Delivery tracking
Maintenance scheduling
Fleet movement tracking
Technician app
Inventory integration
Accounting integration
Customer portal
```

## 9. Integration Rules

Allowed integrations:

```txt
Email SMTP
CRM webhook
WhatsApp click-to-chat
Facebook Messenger
Google Maps
Analytics
Search console
Optional payment gateway in later phase
```

Do not add payment, tracking, or third-party scripts without documenting security and privacy impact.

## 10. Performance Rules

Minimum expectations:

- Optimize images.
- Lazy-load heavy sections.
- Keep JavaScript bundle controlled.
- Avoid animation that blocks rendering.
- Use server rendering or static generation where appropriate.
- Keep public forms fast and resilient.

## 11. Infrastructure Security Rules

- Use environment variables for secrets.
- Separate local, staging, and production credentials.
- Use HTTPS in production.
- Protect admin routes.
- Back up database and uploads.
- Rate-limit public forms.
- Monitor form failures and API errors.

## 12. Technology Change Control

Agents must not introduce new frameworks, databases, CMS platforms, or infrastructure providers without documenting:

```txt
Business reason
Technical reason
Cost impact
Operational impact
Security impact
Migration impact
Rollback plan
```

All major changes must be recorded in `CHANGELOG.md`.
