# DK LAO Website 2026

Premium industrial B2B website and semi-ecommerce platform for **DK LAO**, supporting forklift rental, new and used forklift sales, spare parts inquiry, maintenance service booking, warehouse solutions, and professional cleaning equipment across Laos.

> **Current status (v0.20.1, local-preview):** Phase 1 lead-generation website built with Next.js 16 and Payload CMS 3. A private preview runs at https://preview.dklao.com. Sections 1–5, 9–11, 15–16 and 23–31 describe the product direction; sections 6–8, 12–14 and 17–22 describe the code as it is today. Version history: `con_agents/CHANGELOG.md`. Agent governance: `AGENTS.md` and `con_agents/`.

---

## 1. Project Overview

The **DK LAO Website 2026** is designed to transform DK LAO from a static corporate website into a modern **digital sales and service gateway**.

The platform helps customers:

- Discover forklifts, warehouse equipment, spare parts, and cleaning equipment
- Request quotations
- Submit forklift rental inquiries
- Book maintenance and repair services
- Request spare parts
- Contact DK LAO through structured digital lead channels
- Prepare for future CRM, rental fleet, inventory, billing, and customer portal integration

---

## 2. Brand Positioning

### Main Message

**Lifting, Moving, Cleaning & Growing Your Business**

### Business Positioning

DK LAO is positioned as a trusted industrial equipment partner in Laos for:

- Forklift rental
- New forklift sales
- Used forklift sales
- Material handling equipment
- Warehouse solutions
- Racking and shelving
- Spare parts and accessories
- Maintenance and after-sales service
- Professional cleaning equipment
- Heavy machinery and automobile spare parts

The website should not behave like a simple brochure. It should function as a **semi-ecommerce discovery platform** and **lead-generation engine**.

---

## 3. Strategic Objectives

The website has five core objectives:

1. Present DK LAO as a premium industrial equipment partner in Laos
2. Convert visitors into qualified leads
3. Support product and service discovery
4. Enable quotation, rental, service, and spare-parts workflows
5. Build a scalable foundation for future digital operations

---

## 4. Website Model

This project follows a **semi-ecommerce model**.

Industrial equipment usually requires consultation, quotation, availability confirmation, delivery planning, maintenance terms, and after-sales support. Therefore, the website does not prioritize direct checkout in Phase 1.

### Supported in Phase 1

- Product catalog
- Product category pages
- Rental inquiry
- Quote request
- Service booking
- Spare-parts inquiry
- Used equipment inquiry
- Cleaning equipment recommendation
- Contact form
- Messenger / WhatsApp / Facebook contact integration

### Future-Ready

- Customer account portal
- Saved quotation history
- Rental fleet availability
- Inventory integration
- Service ticket tracking
- Contract management
- Billing integration
- Online payment
- Technician workflow
- CRM dashboard

---

## 5. Core User Journeys

### 5.1 Forklift Rental Inquiry

1. Customer opens Forklift Rental page
2. Selects rental period
3. Chooses equipment type, capacity, lift height, and power type
4. Submits rental inquiry form
5. DK LAO sales team receives lead
6. Sales team confirms availability
7. Quotation is issued
8. Rental contract and delivery process begin

---

### 5.2 New Forklift Sales Inquiry

1. Customer browses forklift categories
2. Filters by equipment type, power type, capacity, lift height, and application
3. Opens product detail page
4. Reviews specifications
5. Requests quotation or recommendation
6. DK LAO sales team follows up

---

### 5.3 Used Forklift Inquiry

1. Customer opens Used Equipment page
2. Reviews available used or refurbished units
3. Checks condition summary
4. Requests inspection or quotation
5. DK LAO confirms stock and service package

---

### 5.4 Maintenance Service Booking

1. Customer opens Maintenance Service page
2. Selects service type
3. Enters equipment model, serial number, issue description, and preferred date
4. Uploads photo if needed
5. DK LAO service team receives booking request
6. Technician scheduling begins

---

### 5.5 Spare Parts Inquiry

1. Customer opens Spare Parts page
2. Enters equipment model and serial number
3. Selects part type and urgency
4. Uploads photo if available
5. DK LAO parts team validates availability
6. Quotation or recommendation is issued

---

### 5.6 Cleaning Equipment Recommendation

1. Customer opens Cleaning Equipment page
2. Selects facility type or cleaning use case
3. Browses vacuum cleaners, scrubber dryers, sweepers, and industrial cleaning machines
4. Requests recommendation
5. DK LAO sales team proposes suitable equipment

---

## 6. Technology Stack

```txt
Framework:     Next.js 16 (App Router) on React 19
Language:      TypeScript 6
Styling:       Tailwind CSS 4, shadcn/ui-style components on Radix UI
Animation:     GSAP 3 (@gsap/react), reduced-motion aware
Forms:         React Hook Form + Zod 4
Icons:         Lucide React, Simple Icons (social brands)
CMS:           Payload CMS 3.80 inside the Next.js app (/admin), PostgreSQL 16, Lexical rich text
Email:         Nodemailer over SMTP (lead emails and CMS emails)
Tests:         Vitest 4 + Testing Library (jsdom)
Package mgr:   pnpm 10.29.3
Node.js:       22
CI:            GitHub Actions (.github/workflows/ci.yml)
Hosting:       DK LAO cPanel server (Apache proxy -> systemd Node service), Cloudflare DNS
```

The site still renders without a database: with `DATABASE_URL` empty it uses its built-in content from `src/lib/data`.

---

## 7. Repository Structure

```txt
dklao/
├── src/
│   ├── app/
│   │   ├── (site)/                 Public website: layout, home, /about, /contact, /request-quote,
│   │   │                           /forklift-rental and a catch-all [...slug] for content pages
│   │   ├── (app)/app/              Installable iPhone/Android web app at /app (own layout, noindex)
│   │   ├── (payload)/              Payload CMS admin (/admin) and REST/GraphQL API (/api/*)
│   │   ├── api/leads/quote/        Quote request endpoint (POST)
│   │   ├── og/[id]/                Open Graph images
│   │   ├── robots.ts, sitemap.ts
│   ├── components/
│   │   ├── dklao/                  Website sections: header, mega menu, mobile menu, hero, footer,
│   │   │                           content page, quote form, CTA, trusted-by, motion
│   │   ├── app/                    Web app UI: iOS-style views, tab bar, request form, share location
│   │   └── ui/                     Base components (button, card, input, sheet, accordion, ...)
│   ├── lib/
│   │   ├── data/                   Built-in content and the route registry (routes.ts, sitemap-pages.ts, ...)
│   │   ├── cms/                    Loaders that read Payload and fall back to built-in content
│   │   ├── leads/                  Lead pipeline: rate limit, bot guard, store, email, webhook notify
│   │   ├── validation/             Zod schemas for leads
│   │   └── security-headers.ts, site-metadata.ts, utils.ts
│   ├── payload/                    CMS collections (pages, articles, leads, users), globals
│   │                               (navigation, site facts), access rules, migrations
│   └── payload.config.ts
├── public/                         Images (library, clients, hero, logo), favicon, app service worker
├── scripts/                        version-status, check-links, seed-cms
├── con_agents/                     Governance and control rules for agents (see AGENTS.md)
├── docs/                           Plans and checklists (deploy, CMS, images, metrics, knowledge graph)
├── .ua/                            Understand-Anything knowledge graph of this codebase
├── server.mjs, app.js              Production server entry points
├── VERSION.json, package.json
└── .env.example
```

---

## 8. Main Routes

The route registry is `src/lib/data/routes.ts`; the full route map is `con_agents/ROUTES.md`.

| Route | Purpose |
| --- | --- |
| `/` | Homepage and main conversion gateway |
| `/about` | About DK LAO |
| `/forklift-rental` (`/short-term`, `/long-term`) | Forklift rental |
| `/forklift-sales` (`/new`, `/used`) | New and used forklift sales |
| `/maintenance-service` | Maintenance, repair and preventive service |
| `/spare-parts` | Spare parts matched by model and serial number |
| `/batteries-chargers` | Batteries and chargers for electric forklifts |
| `/warehouse-equipment` | Warehouse equipment and site survey |
| `/material-handling` | Material handling equipment |
| `/racking-shelving` | Racking and shelving |
| `/cleaning-equipment` | Nilfisk professional cleaning equipment |
| `/industries` and 6 industry pages | Solutions by industry (logistics, manufacturing, construction, food & beverage, retail, hospitality) |
| `/knowledge-center` and articles | Guides and equipment education |
| `/contact` | Contact DK LAO |
| `/request-quote` | Central quote form; `?category=` preselects the need |
| `/app` | Installable mobile web app (not indexed) |
| `/admin` | Payload CMS admin (restricted) |

---

## 9. Homepage Sections

The homepage should follow this structure:

1. Header and navigation
2. Premium industrial hero
3. Quick quote action bar
4. Main solution cards
5. Forklift rental highlight
6. Product category catalog
7. Used forklift stock highlight
8. Maintenance and spare-parts section
9. Forklift anatomy interactive block
10. Professional cleaning equipment section
11. Warehouse solutions section
12. Industries served
13. Why DK LAO
14. Customer logos
15. Knowledge center preview
16. Final quote request form
17. Footer with contact and location

---

## 10. Design System

### Visual Personality

The website should feel:

* Industrial
* Reliable
* Technical
* Safe
* Fast
* Modern
* Premium B2B
* Conversion-focused

---

### Core Colors

```css
:root {
  --dk-blue-deep: #154A99;
  --dk-blue: #0061AF;
  --dk-blue-icon: #0060AE;

  --dk-red: #D91A21;
  --dk-red-bright: #EF3937;
  --dk-orange: #E74422;

  --dk-white: #FFFFFF;
  --dk-silver: #F1F2F2;
  --dk-silver-soft: #EFEFF0;

  --dk-navy-950: #07111F;
  --dk-navy-900: #0B1B33;
  --dk-navy-800: #102A4C;

  --dk-slate-700: #334155;
  --dk-slate-500: #64748B;
  --dk-slate-300: #CBD5E1;
  --dk-slate-100: #F1F5F9;

  --dk-surface: #F8FAFC;
  --dk-card: #FFFFFF;

  --dk-success: #16A34A;
  --dk-warning: #F59E0B;
  --dk-danger: #DC2626;
  --dk-info: #0284C7;
}
```

---

### Gradients

```css
:root {
  --gradient-dk-blue: linear-gradient(135deg, #154A99 0%, #0061AF 100%);

  --gradient-dk-action: linear-gradient(
    135deg,
    #D91A21 0%,
    #E74422 55%,
    #EF3937 100%
  );

  --gradient-dk-hero:
    radial-gradient(circle at 20% 20%, rgba(0,97,175,0.35), transparent 32%),
    radial-gradient(circle at 80% 10%, rgba(217,26,33,0.22), transparent 28%),
    linear-gradient(135deg, #07111F 0%, #0B1B33 55%, #102A4C 100%);

  --gradient-dk-silver: linear-gradient(
    135deg,
    #FFFFFF 0%,
    #F1F2F2 48%,
    #E2E8F0 100%
  );
}
```

---

### Typography

Recommended font system:

```txt
English Headings: Poppins / Inter
English Body: Inter / Roboto
Lao Text: Noto Sans Lao
Technical Specs: Roboto Mono / IBM Plex Mono
```

---

## 11. Motion System

Motion should communicate operational value, not decoration.

### Required Motion Concepts

* Forklift movement
* Cargo lifting animation
* Product card transition
* Forklift anatomy hotspots
* Spare-parts conveyor flow
* Clean sweep effect
* CTA reveal animation

### Motion Principles

* Professional and controlled
* Smooth easing
* No excessive gaming-style animation
* Must respect `prefers-reduced-motion`
* Motion should support conversion and storytelling

---

## 12. Core Components

Website components live in `src/components/dklao/`:

* Layout: `SiteHeader`, `MegaMenu`, `MobileMenu`, `IndustrialFooter`, `FloatingContactActions`, `AppInstallBanner`
* Hero and sections: `MainHero`, `QuickQuoteBar`, homepage sections, `ProductCategoryGrid`, `ServiceCard`, `TrustedBy`, `HomeProof`, About sections
* Content pages: `ContentPage` renders every solution, industry and article page from `src/lib/data/sitemap-pages.ts` or the CMS
* Leads: `QuoteRequestForm`, `CtaSection`
* Motion: `SiteMotion`, `FooterMotion` (GSAP, reduced-motion aware), `AnatomyDiagram`

The mobile web app has its own components in `src/components/app/`.

---

## 13. Product Card Data Model (planned, Phase 2)

Product listings with stock and specifications are not built yet. The intended card model:

```ts
export type ProductCard = {
  id: string;
  name: string;
  category: string;
  condition?: "new" | "used" | "rental";
  powerType?: "electric" | "diesel" | "lpg" | "manual";
  capacity?: string;
  liftHeight?: string;
  availability?: "in-stock" | "on-request" | "rental-available";
  image: string;
  tags: string[];
  ctaLabel: string;
};
```

---

## 14. Lead Form

Every request button leads to one central form at `/request-quote` (and `/app/request` in the web app). The `?category=` value preselects the need and sets the lead type:

| `category` | Shown as | Lead type |
| --- | --- | --- |
| `rental` | Forklift rental | `RENTAL_INQUIRY` |
| `new` | New forklift sales | `QUOTE_REQUEST` |
| `used` | Used forklift inquiry | `USED_FORKLIFT_INQUIRY` |
| `parts` | Spare parts | `SPARE_PARTS_INQUIRY` |
| `service` | Maintenance service | `SERVICE_BOOKING` |
| `warehouse` | Warehouse solutions | `QUOTE_REQUEST` |
| `cleaning` | Cleaning equipment | `CLEANING_EQUIPMENT_RECOMMENDATION` |
| `general` | General inquiry | `CONTACT_GENERAL` |

Fields: company name, contact person, phone, email (optional), equipment or service category, message. The source page is recorded.

Submissions go to `POST /api/leads/quote`, which validates them with Zod (`src/lib/validation/leads.ts`), rate-limits per visitor, rejects bots through a hidden trap field, saves the lead in the CMS, emails it to DK LAO and optionally calls a webhook. See `con_agents/FORMS_AND_LEADS.md`.

Separate rental, service and spare-parts forms with extra fields (dates, serial numbers, photo upload) are a later option.

---

## 15. Content Rules

The website should support both **English and Lao** content.

### Content Direction

* Use clear B2B language
* Keep CTAs action-oriented
* Explain industrial value in practical terms
* Avoid generic marketing text
* Use equipment specifications where relevant
* Use benefit-driven copy for rental, service, and spare parts

### Main CTAs

* Request a Quote
* View Rental Fleet
* Book Maintenance Service
* Ask for Rental Price
* Request Spare Parts
* Get Cleaning Equipment Recommendation
* Talk to DK LAO Advisor
* Schedule Site Survey

---

## 16. SEO Strategy

### Priority SEO Pages

| Page                | SEO Title                                                                 |
| ------------------- | ------------------------------------------------------------------------- |
| Home                | DK LAO — Forklift Rental, Sales, Spare Parts & Cleaning Equipment in Laos |
| Forklift Rental     | Forklift Rental in Laos — Short-Term & Long-Term Rental                   |
| New Forklifts       | New Forklifts for Sale in Laos                                            |
| Used Forklifts      | Used Forklifts for Sale in Laos                                           |
| Maintenance Service | Forklift Maintenance and Repair Service in Laos                           |
| Spare Parts         | Forklift Spare Parts and Accessories in Laos                              |
| Warehouse Solutions | Warehouse Equipment, Racking and Material Handling Solutions              |
| Cleaning Equipment  | Professional Cleaning Equipment in Laos                                   |
| Contact             | Request Quote from DK LAO                                                 |

---

## 17. Installation

Requires Node.js 22 and pnpm 10.

```bash
git clone https://github.com/bstBizEra/dklWeb2026.git dklao
cd dklao
pnpm install
cp .env.example .env.local
```

Windows development path: `C:\laragon\www\dklao`.

---

## 18. Development

```bash
pnpm dev
```

Default local URL:

```txt
http://localhost:3000
```

For the CMS locally, set `DATABASE_URL` and `PAYLOAD_SECRET`, then run `pnpm cms:migrate` and optionally `pnpm cms:seed` (see `docs/cms-local-setup.md`).

---

## 19. Build

```bash
pnpm build
```

---

## 20. Production Start

```bash
pnpm start
```

The server runs `server.mjs` (`app.js` loads it for hosts that `require()` the entry file). With `NODE_ENV=production`, pending CMS migrations are applied on start.

---

## 21. Quality Gates

Run before every completed change (CI runs the same). One command runs them all, continues past a failure and prints a summary:

```bash
pnpm verify
```

It runs these, in this order:

```bash
pnpm version:status
pnpm test -- --run
pnpm lint
pnpm typecheck
pnpm build
```

To also run CI's database job (every migration on an empty database, then the PostgreSQL tests), point it at an **empty throwaway** database, never the site's own:

```powershell
$env:TEST_DATABASE_URL="postgresql://USER:PASSWORD@127.0.0.1:5433/dklao_ci_empty"; pnpm verify
```

`pnpm verify` is the reference when GitHub Actions is unavailable. A test (`src/lib/data/verify-local.test.ts`) fails if `ci.yml` gains a gate that `pnpm verify` lacks.

---

## 22. Environment Variables

Copy `.env.example` to `.env.local`; it documents every variable. Never commit real values.

| Variable | Purpose |
| --- | --- |
| `APP_URL` | Canonical site address for metadata and sitemap |
| `DATABASE_URL`, `DATABASE_POOL_MAX` | PostgreSQL for Payload CMS; empty = built-in content only |
| `PAYLOAD_SECRET` | Signs CMS admin sessions (32+ random characters) |
| `LEAD_RATE_LIMIT`, `LEAD_RATE_WINDOW_SECONDS` | Quote form rate limit |
| `LEAD_NOTIFY_WEBHOOK_URL`, `LEAD_NOTIFY_WEBHOOK_SECRET`, `LEAD_NOTIFY_DETAILS` | Optional new-lead webhook |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Lead and CMS email |
| `LEAD_NOTIFY_EMAIL` | Inbox for lead emails (default `info@dklao.com`) |

---

## 23. Phase 1 Scope

### Lead-Generation Website MVP

Phase 1 should include:

* Homepage
* Forklift Rental page
* Forklift Sales page
* Used Equipment page
* Maintenance Service page
* Spare Parts page
* Warehouse Solutions page
* Cleaning Equipment page
* Contact page
* Product category cards
* Quote request form
* Rental inquiry form
* Service booking form
* Spare-parts inquiry form
* Messenger / WhatsApp / Facebook integration
* Responsive design
* SEO metadata
* Basic analytics readiness

---

## 24. Phase 2 Scope

### Semi-Ecommerce Platform

Phase 2 should include:

* Customer account
* Saved quotations
* Product comparison
* Rental availability display
* Used equipment stock management
* Service ticket tracking
* Spare-parts inquiry tracking
* Admin CRM dashboard
* Lead status management
* Content CMS

---

## 25. Phase 3 Scope

### Full Digital Operations Platform

Phase 3 should include:

* Online payment
* Rental contract automation
* Delivery tracking
* Fleet movement tracking
* Maintenance scheduling
* Technician app
* Parts inventory integration
* Billing integration
* Accounting system integration
* Customer portal
* Admin operations dashboard

---

## 26. Quality Assurance Checklist

Before production release, verify:

* All routes load correctly
* Mobile navigation works
* Forms validate correctly
* CTAs are visible on all key pages
* Lao and English text display correctly
* Product cards are responsive
* Hero motion respects reduced-motion settings
* Images are optimized
* SEO metadata is configured
* Contact details are correct
* Social links are correct
* Forms have spam protection
* Deployment build passes
* Lighthouse performance is acceptable
* Accessibility basics are implemented

---

## 27. Security Checklist

The website should include:

* Input validation
* Form spam protection
* File upload restrictions
* Environment variable protection
* HTTPS deployment
* Secure headers
* Rate limiting for forms
* No secret keys in repository
* Clear privacy handling for customer inquiries

---

## 28. Deployment

The site, CMS and database run on DK LAO's own cPanel server (owner decision, 2026-10-25): a systemd Node service behind an Apache proxy, PostgreSQL 16 on the same host, Cloudflare DNS. The private preview is https://preview.dklao.com. Steps, server facts and open items: `docs/deploy-checklist.md`.

---

## 29. Development Governance

Agents and developers follow the control rules in `con_agents/`, starting with the root `AGENTS.md`, `con_agents/AGENTS.md` and `con_agents/AGENT_BOOTSTRAP.md`.

```txt
con_agents/
  AGENTS.md  AGENT_BOOTSTRAP.md  ARCHITECTURE.md  ROUTES.md  COMPONENTS.md  CONTENT.md
  DESIGNS.md  TOKEN.md  TOKENIZE.md  TOKEN_MANAGEMENT.md  ASSETS.md  DATA_MODEL.md
  API_CONTRACTS.md  FORMS_AND_LEADS.md  QA_CHECKLIST.md  SECURITY.md  DEPLOYMENT.md
  INFRA.md  ENVIRONMENT.md  OBSERVABILITY.md  TECHNOLOGY_SOFTWARE_INFRA.md
  CHANGELOG.md  VERSIONING.md
```

Every change is recorded in `con_agents/CHANGELOG.md`; versions follow `con_agents/VERSIONING.md`. A navigable map of the code is in `.ua/knowledge-graph.json` (see `docs/knowledge-graph.md`).

---

## 30. Roadmap Summary

| Phase   | Focus                       | Business Value                                              |
| ------- | --------------------------- | ----------------------------------------------------------- |
| Phase 1 | Lead-generation website     | Faster launch and inquiry capture                           |
| Phase 2 | Semi-ecommerce platform     | Better product discovery and sales pipeline                 |
| Phase 3 | Digital operations platform | Scalable rental, service, inventory, and billing operations |

---

## 31. Final Direction

The DK LAO Website 2026 should become a **premium industrial digital showroom and operational inquiry platform**.

It should help customers move from browsing to action faster by supporting:

* Equipment discovery
* Rental inquiry
* Quotation request
* Service booking
* Spare-parts inquiry
* Cleaning equipment recommendation
* Warehouse solution consultation

The goal is to position DK LAO as a trusted one-stop industrial equipment partner in Laos.
