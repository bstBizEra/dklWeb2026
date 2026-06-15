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

## 3. Recommended Stack

Frontend:

```txt
Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
```

Backend:

```txt
Next.js API/server actions for Phase 1
Dedicated API layer for Phase 2/3 if needed
```

Data:

```txt
PostgreSQL preferred
MySQL acceptable
Prisma or Drizzle ORM
```

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

## 7. Folder Structure Recommendation

```txt
/dklao
  /app or /pages
  /components
  /components/dklao
  /lib
  /lib/validation
  /lib/api
  /lib/data
  /public/images/logo
  /public/images/fav-icon
  /public/icons/slogan
  /public/images/products
  /con_agents
```

## 8. Architecture QA

Before implementation is accepted:

- Module boundaries are clear.
- Forms are validation-ready.
- Data model supports future operations.
- Components do not contain hardcoded business data.
- APIs follow `API_CONTRACTS.md`.
- Security follows `SECURITY.md`.
