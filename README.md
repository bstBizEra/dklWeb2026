Below is a **developer-ready `README.md`** for the **DK LAO Website 2026**. It is based on DK LAO’s company profile, semi-ecommerce strategy, and design system direction: DK LAO is positioned around sales, service, spare parts, rental, material handling equipment, warehouse solutions, and professional cleaning equipment in Laos.  The website strategy defines the site as a lead-generation and semi-ecommerce platform, not only a company profile.  The visual system is industrial-grade, B2B, motion-enabled, and conversion-focused. 

````md
# DK LAO Website 2026

Premium industrial B2B website and semi-ecommerce platform for **DK LAO**, supporting forklift rental, new and used forklift sales, spare parts inquiry, maintenance service booking, warehouse solutions, and professional cleaning equipment across Laos.

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

## 6. Recommended Technology Stack

```txt
Framework: Next.js
Frontend: React
Language: TypeScript
Styling: Tailwind CSS
UI Components: shadcn/ui
Animation: Framer Motion
Forms: React Hook Form + Zod
Icons: Lucide React
CMS Ready: Markdown / Headless CMS / Database later
Deployment: Vercel, VPS, Docker, or Cloudflare-supported hosting
````

---

## 7. Repository Structure

```txt
dklao-website/
│
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   │
│   ├── forklift-rental/
│   │   └── page.tsx
│   │
│   ├── forklift-sales/
│   │   └── page.tsx
│   │
│   ├── used-equipment/
│   │   └── page.tsx
│   │
│   ├── maintenance-service/
│   │   └── page.tsx
│   │
│   ├── spare-parts/
│   │   └── page.tsx
│   │
│   ├── warehouse-solutions/
│   │   └── page.tsx
│   │
│   ├── cleaning-equipment/
│   │   └── page.tsx
│   │
│   ├── industries/
│   │   └── page.tsx
│   │
│   ├── knowledge-center/
│   │   └── page.tsx
│   │
│   └── contact/
│       └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── hero/
│   │   ├── MainHero.tsx
│   │   ├── RentalHero.tsx
│   │   ├── SalesHero.tsx
│   │   ├── ServiceHero.tsx
│   │   └── CleaningHero.tsx
│   │
│   ├── sections/
│   │   ├── SolutionCards.tsx
│   │   ├── ProductCategoryGrid.tsx
│   │   ├── RentalHighlight.tsx
│   │   ├── UsedEquipmentStock.tsx
│   │   ├── MaintenanceSection.tsx
│   │   ├── SparePartsSection.tsx
│   │   ├── CleaningEquipmentSection.tsx
│   │   ├── WarehouseSolutionsSection.tsx
│   │   ├── IndustriesServed.tsx
│   │   ├── WhyDKLao.tsx
│   │   └── CustomerLogos.tsx
│   │
│   ├── cards/
│   │   ├── ProductCard.tsx
│   │   ├── RentalFleetCard.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── SparePartsCard.tsx
│   │   └── IndustryCard.tsx
│   │
│   ├── forms/
│   │   ├── QuoteRequestForm.tsx
│   │   ├── RentalRequestForm.tsx
│   │   ├── ServiceBookingForm.tsx
│   │   └── SparePartsInquiryForm.tsx
│   │
│   ├── motion/
│   │   ├── ForkliftMotion.tsx
│   │   ├── LiftingAnimation.tsx
│   │   ├── ProductCardTransition.tsx
│   │   ├── ForkliftAnatomyInteractive.tsx
│   │   └── CleanSweepEffect.tsx
│   │
│   └── ui/
│       └── shadcn components
│
├── data/
│   ├── navigation.ts
│   ├── products.ts
│   ├── rentalFleet.ts
│   ├── services.ts
│   ├── industries.ts
│   ├── cleaningEquipment.ts
│   └── seo.ts
│
├── lib/
│   ├── constants.ts
│   ├── utils.ts
│   ├── validation.ts
│   └── seo.ts
│
├── public/
│   ├── images/
│   │   ├── logo/
│   │   ├── hero/
│   │   ├── forklifts/
│   │   ├── warehouse/
│   │   ├── cleaning/
│   │   └── spare-parts/
│   │
│   └── icons/
│
├── docs/
│   ├── DESIGN.md
│   ├── CONTENT.md
│   ├── ARCHITECTURE.md
│   ├── ROUTES.md
│   ├── COMPONENTS.md
│   ├── FORMS_AND_LEADS.md
│   ├── QA_CHECKLIST.md
│   ├── SECURITY.md
│   └── DEPLOYMENT.md
│
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── README.md
└── .env.example
```

---

## 8. Main Routes

| Route                  | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `/`                    | Homepage and main conversion gateway                     |
| `/forklift-rental`     | Short-term and long-term forklift rental                 |
| `/forklift-sales`      | New forklift sales                                       |
| `/used-equipment`      | Used and refurbished forklift listings                   |
| `/maintenance-service` | Maintenance, repair, inspection, and preventive service  |
| `/spare-parts`         | Spare parts and accessories inquiry                      |
| `/warehouse-solutions` | Racking, shelving, warehouse equipment, safety solutions |
| `/cleaning-equipment`  | Professional cleaning equipment catalog                  |
| `/industries`          | Industry-specific solutions                              |
| `/knowledge-center`    | Guides, articles, equipment education, SEO content       |
| `/contact`             | Contact, quote request, map, and social channels         |

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

### Layout Components

* `Header`
* `Footer`
* `MobileNav`
* `CTASection`
* `PageHeader`

### Hero Components

* `MainHero`
* `RentalHero`
* `SalesHero`
* `ServiceHero`
* `CleaningHero`

### Catalog Components

* `ProductCategoryGrid`
* `ProductCard`
* `ProductFilterBar`
* `ProductSpecTable`
* `ComparisonCard`

### Lead Components

* `QuoteRequestForm`
* `RentalRequestForm`
* `ServiceBookingForm`
* `SparePartsInquiryForm`
* `ContactCard`
* `FloatingContactButtons`

### Motion Components

* `ForkliftMotion`
* `LiftingAnimation`
* `ProductCardTransition`
* `ForkliftAnatomyInteractive`
* `CleanSweepEffect`

---

## 13. Product Card Data Model

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

## 14. Lead Form Types

### Quote Request Form

Fields:

* Company name
* Contact person
* Phone number
* Email
* Service type
* Equipment category
* Capacity requirement
* Location
* Message

---

### Rental Request Form

Fields:

* Company name
* Contact person
* Phone number
* Location
* Rental start date
* Rental end date
* Rental period
* Equipment type
* Required load capacity
* Required lift height
* Indoor or outdoor usage
* Operator required
* Delivery required
* Message

---

### Service Booking Form

Fields:

* Company name
* Contact person
* Phone number
* Equipment brand/model
* Serial number
* Service type
* Problem description
* Onsite or workshop service
* Preferred date
* Photo upload
* Message

---

### Spare Parts Inquiry Form

Fields:

* Company name
* Contact person
* Phone number
* Equipment model
* Serial number
* Part type
* Quantity
* Urgency
* Photo upload
* Message

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

```bash
git clone <repository-url>
cd dklao-website
npm install
```

---

## 18. Development

```bash
npm run dev
```

Default local URL:

```txt
http://localhost:3000
```

---

## 19. Build

```bash
npm run build
```

---

## 20. Production Start

```bash
npm run start
```

---

## 21. Linting

```bash
npm run lint
```

---

## 22. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=https://www.dklao.com
NEXT_PUBLIC_COMPANY_NAME="DK LAO"
NEXT_PUBLIC_CONTACT_PHONE="+856 21 480 248"
NEXT_PUBLIC_CONTACT_PHONE_SECONDARY="+856 21 480 249"
NEXT_PUBLIC_MOBILE_PHONE="+856 20 2802 3338"
NEXT_PUBLIC_FACEBOOK_URL="https://fb.me/DKLAOonline"
NEXT_PUBLIC_GOOGLE_MAPS_URL=""
NEXT_PUBLIC_WHATSAPP_NUMBER=""
NEXT_PUBLIC_MESSENGER_URL=""
```

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

## 28. Deployment Options

Recommended deployment options:

1. Vercel
2. Cloudflare Pages
3. VPS with Docker
4. VPS with Node.js and reverse proxy
5. Future integration with DK LAO backend platform

---

## 29. Development Governance

This repository should maintain documentation under the `docs/` directory.

Recommended control files:

```txt
DESIGN.md
CONTENT.md
ARCHITECTURE.md
ROUTES.md
COMPONENTS.md
DATA_MODEL.md
API_CONTRACTS.md
FORMS_AND_LEADS.md
QA_CHECKLIST.md
SECURITY.md
DEPLOYMENT.md
CHANGELOG.md
```

Each file should guide developers, designers, content writers, and future AI agents working on the DK LAO platform.

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

```
```
