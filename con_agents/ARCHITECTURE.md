# ARCHITECTURE.md — DK LAO Technical Architecture and Module Boundaries

## 1. Purpose

This file controls technical architecture, module boundaries, integration approach, and future scalability.

The architecture must support Phase 1 lead generation and remain ready for Phase 2 semi-ecommerce and Phase 3 digital operations.

## 2. Architecture Phases

```txt
Phase 1: Lead-generation website
Phase 2: Semi-ecommerce platform
Phase 3: Full digital operations platform
```

## 3. Current Stack

Frontend:

```txt
Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui-style components on Radix UI, GSAP
```

Backend:

```txt
Phase 1 (built): Next.js route handlers (POST /api/leads/quote) and Payload CMS 3 running inside the Next.js app
Phase 2/3: extend Payload collections and endpoints first; a dedicated API layer only if Payload no longer fits
```

Data:

```txt
PostgreSQL 16 through Payload's Postgres adapter
Schema changes only through reviewed Payload migrations (src/payload/migrations, push: false)
No second ORM or database layer next to Payload without owner approval
```

The site renders from built-in content in `src/lib/data` when no database is configured; CMS loaders in `src/lib/cms` fall back to it.

## 4. Module Boundaries

```txt
Catalog Module: products, categories, specifications, images
Rental Module: fleet units, availability, rental inquiries
Sales Module: new/used product listings and sales inquiries
Service Module: maintenance booking and service requests
Spare Parts Module: parts inquiry and compatibility references
CRM Module: customers, contacts, lead status, activities
Content Module: pages, knowledge articles, SEO metadata
Admin Module: internal management and review workflow
```

## 5. Integration Boundaries

Allowed integrations:

```txt
SMTP/email
CRM webhook
WhatsApp/Messenger contact links
Google Maps
Analytics
CMS
Payment gateway in later phase only
```

## 6. Expansion Rules

Do not build Phase 3 complexity in Phase 1 unless it directly supports the immediate launch.

However, do not block future expansion into:

```txt
Customer portal
Rental contract automation
Fleet movement tracking
Maintenance scheduling
Inventory management
Billing and invoices
Accounting integration
Technician app
```

## 7. Folder Structure

```txt
/dklao
  /src/app/(site)            Public website
  /src/app/(app)/app         Installable mobile web app (/app)
  /src/app/(payload)         Payload admin (/admin) and API (/api/*)
  /src/app/api/leads/quote   Quote request endpoint
  /src/components/dklao      Website components
  /src/components/app        Web app components
  /src/components/ui         Base UI components
  /src/lib/data              Built-in content and route registry
  /src/lib/cms               CMS loaders with built-in fallback
  /src/lib/leads             Lead pipeline (rate limit, guard, store, email, notify)
  /src/lib/validation        Zod schemas
  /src/payload               Collections, globals, access rules, migrations
  /public/images/logo
  /public/images/fav-icon
  /public/images/library
  /public/icons
  /scripts
  /con_agents
  /docs
```

Product catalog folders (for example `/public/images/products`) are added when the Phase 2 catalog is built.

## 8. Architecture QA

Before implementation is accepted:

- Module boundaries are clear.
- Forms are validation-ready.
- Data model supports future operations.
- Components do not contain hardcoded business data.
- APIs follow `API_CONTRACTS.md`.
- Security follows `SECURITY.md`.
