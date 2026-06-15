# AGENTS.md — DK LAO Website & Digital Platform Control Rules

## 1. Project Mission

Build DK LAO into a premium industrial digital platform for:

- Forklift rental
- New and used forklift sales
- Material handling equipment
- Warehouse solutions
- Spare parts and accessories
- Maintenance and repair service
- Professional cleaning equipment
- Quote request, rental inquiry, service booking, and spare-parts inquiry

The website must not behave like a static company profile. It must function as a semi-ecommerce, lead-generation, quotation, and operational inquiry platform.

## 2. Project Paths

Primary project path:

```txt
/dklao
```

Windows development path:

```txt
C:\laragon\www\dklao
```

Agent control path:

```txt
/dklao/con_agents
C:\laragon\www\dklao\con_agents
```

Logo and favicon path:

```txt
C:\laragon\www\dklao\images\logo & FAV_Icon
```

Slogan graphic path:

```txt
C:\laragon\www\dklao\Icons for slogan
```

## 3. Agent Operating Principles

All agents must follow these principles:

1. Business-first execution.
2. Conversion-focused design.
3. Industrial-grade visual quality.
4. Mobile-first and responsive delivery.
5. Reusable component architecture.
6. Maintainable code and clear file boundaries.
7. No fake product claims, fake stock, fake pricing, or unsupported technical specifications.
8. Every major page must guide users toward a business action.
9. Every implementation must support future expansion into CRM, rental tracking, inventory, contracts, billing, and customer portal.

## 4. Source of Truth

Agents must treat the following files as source documents:

- `AGENTS.md` for execution rules.
- `AGENT_BOOTSTRAP.md` for path detection and startup behavior.
- `ASSETS.md` for logo, favicon, slogan icons, and media rules.
- `DESIGNS.md` for visual and UI direction.
- `TOKEN.md` for design tokens.
- `TOKENIZE.md` for knowledge tokenization and prompt chunking.
- `TOKEN_MANAGEMENT.md` for context-token and credential-token governance.
- `TECHNOLOGY_SOFTWARE_INFRA.md` for stack, software, local path, and infrastructure rules.
- `CONTENT.md` for copywriting, SEO, and bilingual text.
- `ARCHITECTURE.md` for technical architecture.
- `ROUTES.md` for page structure.
- `COMPONENTS.md` for reusable UI components.
- `DATA_MODEL.md` for business entities.
- `API_CONTRACTS.md` for backend/frontend integration.
- `FORMS_AND_LEADS.md` for lead workflows.
- `QA_CHECKLIST.md` for final validation.
- `SECURITY.md` for security and privacy.
- `DEPLOYMENT.md` for release workflow.
- `INFRA.md` for operational infrastructure.
- `ENVIRONMENT.md` for environment variables and environment separation.
- `OBSERVABILITY.md` for logs, metrics, alerts, and lead visibility.
- `CHANGELOG.md` for version history.

If a requested task conflicts with these documents, the agent must preserve the strategic direction unless the project owner explicitly approves a change.

## 5. Agent Roles

### 5.1 Strategy Agent

Responsible for business structure, roadmap, conversion logic, product positioning, and lead-generation flows.

Must ensure the platform supports product catalog, product comparison, request quotation, rental request, service booking, spare-parts inquiry, used equipment inquiry, cleaning equipment recommendation, and CRM-ready lead capture.

### 5.2 UI/UX Design Agent

Responsible for layout, visual hierarchy, interaction design, responsive behavior, and motion design.

Must follow `DESIGNS.md`, `TOKEN.md`, and `ASSETS.md`.

Must not introduce random colors, inconsistent border radius, generic stock-photo layouts, or weak brochure-style sections.

### 5.3 Frontend Agent

Responsible for Next.js, React, Tailwind CSS, shadcn/ui, Framer Motion, component structure, page implementation, accessibility, and performance.

Must build reusable components before creating one-off UI.

Must respect mobile-first responsive design, semantic HTML, accessibility labels, keyboard navigation, reduced-motion support, and clean folder structure.

### 5.4 Backend Agent

Responsible for API design, database models, lead routing, admin workflow, file upload, CRM-ready structure, and future operational modules.

Must support product catalog, rental fleet, used equipment stock, quote requests, rental requests, service bookings, spare-parts inquiries, customer CRM, inventory, contracts, billing, maintenance records, content CMS, and admin dashboard.

### 5.5 Content Agent

Responsible for English/Lao content, CTA copy, page metadata, SEO titles, product category descriptions, and customer-facing copy.

Must follow `CONTENT.md` and write in a professional B2B tone.

### 5.6 QA Agent

Responsible for checking implementation quality before delivery.

Must validate visual consistency, responsive behavior, CTA coverage, form functionality, accessibility, performance, SEO metadata, no placeholder content, no broken links, and no missing lead forms.

### 5.7 Security Agent

Responsible for form security, admin protection, upload safety, spam prevention, privacy, and production hardening.

Must follow `SECURITY.md`, `TOKEN_MANAGEMENT.md`, and `ENVIRONMENT.md`.

## 6. Implementation Stack

Recommended stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Hook Form
- Zod validation
- PostgreSQL or MySQL
- Prisma or Drizzle ORM
- Admin CMS or custom admin panel
- Email/CRM integration
- WhatsApp/Messenger contact integration

Agents must not introduce a new framework without justification.

## 7. Core Website Pages

Agents must preserve the following page groups:

1. Home
2. Forklift Rental
3. New Forklifts
4. Used Forklifts
5. Material Handling
6. Warehouse Equipment
7. Racking & Shelving
8. Spare Parts & Accessories
9. Batteries & Chargers
10. Cleaning Equipment
11. Maintenance Service
12. Industries
13. Knowledge Center
14. Contact / Request Quote

## 8. Required Conversion Actions

Every major page must include at least one relevant CTA:

- Request a Quote
- View Rental Fleet
- Ask for Rental Price
- Book Maintenance Service
- Request Spare Parts
- Get Cleaning Equipment Recommendation
- Schedule Site Survey
- Contact DK LAO Advisor

Product and service pages must include contextual inquiry forms or CTA links.

## 9. Forms and Lead Rules

All forms must include validation, clear success state, error state, and lead category.

Required form types:

1. Quote Request Form
2. Rental Inquiry Form
3. Service Booking Form
4. Spare-Parts Inquiry Form
5. Used Forklift Inquiry Form
6. Cleaning Equipment Recommendation Form
7. Contact Form

Every submitted lead must capture lead type, company name, contact person, phone number, email if provided, equipment or service category, message, source page, submission timestamp, and status.

## 10. UI Component Rules

Agents must create reusable components for:

- MainHero
- RentalHero
- ProductCategoryGrid
- ProductCard
- RentalFleetCard
- UsedEquipmentCard
- ServiceCard
- SparePartsCard
- ForkliftAnatomyInteractive
- CleaningEquipmentSection
- QuoteRequestForm
- CTASection
- IndustrialFooter
- FloatingContactActions
- QuickQuoteBar
- IndustrySolutionCard
- KnowledgeArticleCard

Do not duplicate component logic across pages.

## 11. Motion Rules

Motion must support business meaning, not decoration.

Allowed motion themes:

- Forklift movement
- Lifting animation
- Product card transition
- Spare-parts conveyor flow
- Forklift anatomy hotspots
- Clean sweep effect

All motion must respect `prefers-reduced-motion`.

Avoid excessive animation, gaming-style effects, or distracting transitions.

## 12. Content Rules

Content must be clear, commercial, and operational.

Avoid overly generic claims, unsupported “best in Laos” claims unless verified, fake pricing, fake stock availability, and technical specifications not confirmed by source data.

Use professional B2B language suitable for procurement teams, warehouse managers, operations managers, and business owners.

## 13. Data and Backend Rules

The data model must be prepared for future operational scaling.

Minimum entities include Product, Product Category, Equipment Type, Rental Fleet Unit, Used Equipment Listing, Spare Part, Service Request, Quote Request, Rental Request, Customer, Contact Person, Industry, Brand, Specification, Attachment/Image, Admin User, Lead Activity, Maintenance Record, Contract, and Invoice.

Do not hardcode product data into UI components if it should later be managed by admin or CMS.

## 14. Quality Gates

Before completing any task, agents must check:

- Does this support the DK LAO business model?
- Does this improve lead generation?
- Is the design consistent with the industrial premium direction?
- Is the component reusable?
- Is the page responsive?
- Are CTAs visible?
- Are forms validated?
- Is the code typed and maintainable?
- Are there no broken links or placeholder text?
- Is the implementation ready for future backend integration?

## 15. Prohibited Behavior

Agents must not:

- Change brand colors without approval.
- Replace the industrial direction with a generic corporate template.
- Build pages without CTAs.
- Use fake product pricing.
- Use fake availability labels.
- Ignore Lao/English content requirements.
- Create one-off components when reusable components are needed.
- Add unnecessary dependencies.
- Commit secrets, credentials, or API keys.
- Leave console logs, debug panels, or mock notices in production.
- Use animation that harms performance or accessibility.

## 16. Completion Format

When an agent finishes work, it must report:

1. Files changed
2. Components created or updated
3. Business flow affected
4. Design rules followed
5. Forms or data touched
6. Testing performed
7. Remaining risks or assumptions
8. Recommended next step
