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

GitHub repository:

```txt
https://github.com/bstBizEra/dklWeb2026
```

Git remote:

```txt
https://github.com/bstBizEra/dklWeb2026.git
```

Legacy moved repository URL:

```txt
https://github.com/BizEraERP/dklWeb2026
```

Default branch:

```txt
main
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
- `VERSIONING.md` for major, minor, and patch version tracking rules.

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

Responsible for Next.js, React, Tailwind CSS, shadcn/ui, GSAP, component structure, page implementation, accessibility, and performance.

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

Current stack (versions in `package.json`):

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-style components on Radix UI
- GSAP (`@gsap/react`) for motion, reduced-motion aware
- React Hook Form
- Zod validation
- Payload CMS 3 inside the Next.js app (admin at `/admin`), with its Postgres adapter as the data layer
- PostgreSQL
- Nodemailer over SMTP for lead and CMS email; optional outbound webhook for lead notification
- WhatsApp/Messenger contact integration
- Vitest and Testing Library for tests
- pnpm, Node.js 22

Agents must not introduce a new framework, a second animation library, or a separate ORM or database layer next to Payload without justification and owner approval.

## 7. Core Website Pages

Agents must preserve the following page groups:

1. Home
2. About DK LAO
3. Forklift Rental
4. New Forklifts
5. Used Forklifts
6. Material Handling
7. Warehouse Equipment
8. Racking & Shelving
9. Spare Parts & Accessories
10. Batteries & Chargers
11. Cleaning Equipment
12. Maintenance Service
13. Industries
14. Knowledge Center
15. Contact / Request Quote

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
- AboutHero
- CompanySnapshot
- VisionCommitment
- ServicePromise
- IndustrySolutionCard
- KnowledgeArticleCard

Do not duplicate component logic across pages.

### 10.1 About DK LAO Page Contract

The `/about` route must present DK LAO as a trustworthy, established, service-driven industrial equipment partner in Laos.

Required About DK LAO sections:

```txt
AboutHero
CompanySnapshot
AboutStory
VisionCommitment
AboutWhatWeDo
WhyChooseDKLAO
IndustriesServed
ServicePromise
AboutFinalCTA
```

Required About page CTAs:

```txt
Request a Quote
View Our Solutions
Contact DK LAO
Book Maintenance Service
```

About page content must support forklift rental, new and used forklift sales, spare parts, maintenance services, warehouse and material handling solutions, and professional cleaning equipment. It must not introduce fake pricing, fake stock, unsupported distributor claims, or unsupported technical specifications.

### 10.2 Footer Ownership and Version Contract

`IndustrialFooter` must display:

```txt
Left: Copyright © DK LAO Since 2010-current year, v{VERSION.json version}
Right: Develop by: BizEra (www.bizera.la)
```

The BizEra credit must link to:

```txt
https://www.bizera.la/
```

Agents must source the visible website version from the project version tracking system, update the current year from runtime/build context, and avoid hardcoded stale footer version strings.

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

## 16. GitHub and Implementation Workflow

### 16.1 Repository Source of Truth

The canonical GitHub repository for the DK LAO 2026 website is:

```txt
bstBizEra/dklWeb2026
```

The canonical remote URL is:

```txt
https://github.com/bstBizEra/dklWeb2026.git
```

If a checkout still references the legacy moved URL `https://github.com/BizEraERP/dklWeb2026.git`, agents must update `origin` to the canonical remote before pushing.

### 16.2 Branch and Commit Rules

- `main` is the production-ready branch.
- `design/dklao-website-2026` is the standard owner-review branch for DK LAO Website 2026 design, UI, UX, content placement, motion, and asset-direction exploration.
- Feature work should use `feature/*` or a clear task branch unless the owner explicitly asks for a direct `main` update.
- Fixes should use `fix/*`; urgent production-ready fixes should use `hotfix/*`.
- Commit messages must use task-prefixed wording, for example `[TASK-002] Fix conventional favicon route`.
- Agents must run `git fetch origin` before pushing.
- Agents must not force-push to `main` without explicit owner approval.
- If remote `main` has changed, agents must inspect the incoming commits and merge or rebase in a way that preserves owner work.

### 16.2.1 DK LAO Website 2026 Design Branch and Main Rules

Branch roles:

```txt
main                         Production-ready verified branch
design/dklao-website-2026    Owner-review design and UI/UX exploration branch
feature/*                    Scoped implementation work
fix/*                        Scoped bug fixes
hotfix/*                     Urgent production-ready fixes
```

`main` is the stable source for verified DK LAO Website 2026 work. It must contain only owner-approved, tested, changelogged changes. Direct work on `main` is allowed only when the owner asks for it or approves it in the current task. Agents must never force-push `main` without explicit owner approval.

`design/dklao-website-2026` is for:

- Visual design exploration.
- Layout revisions.
- UI/UX polish.
- Motion studies.
- Content placement.
- Asset direction.
- Owner preview and review.

The design branch must follow `DESIGNS.md`, `TOKEN.md`, `ASSETS.md`, `COMPONENTS.md`, and `CONTENT.md`. It must not contain secrets, customer lead data, production deployment credentials, destructive migrations, or unrelated backend architecture changes.

Before promoting design branch work into `main`, agents must:

1. Get owner approval for the selected design direction.
2. Promote only selected final changes, not abandoned experiments.
3. Update `con_agents/CHANGELOG.md`.
4. Update version records when the change is version-impacting.
5. Run `pnpm version:status` when version records changed.
6. Run `pnpm test -- --run`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
7. Browser-check `http://localhost:3001/` for visible page or component changes.

### 16.3 Local Implementation Checklist

Before marking implementation work complete, agents must:

1. Confirm the active path is `C:\laragon\www\dklao`.
2. Load root `AGENTS.md`, master `con_agents/AGENTS.md`, `AGENT_BOOTSTRAP.md`, and task-relevant companion files.
3. Keep browser-rendered code free of Windows-only paths.
4. Keep secrets out of Git; never commit `.env`, API keys, database credentials, webhook secrets, or customer lead logs.
5. Update `con_agents/CHANGELOG.md` for governance, implementation, asset, route, or release-impacting work.
6. Run `pnpm test -- --run`.
7. Run `pnpm lint`.
8. Run `pnpm typecheck`.
9. Run `pnpm build`.
10. Verify browser-facing changes at `http://localhost:3001/`.
11. For version-impacting changes, update `package.json`, `VERSION.json`, and `con_agents/CHANGELOG.md`, then run `pnpm version:status`.
12. Check `git status -sb` before completion and report whether local and remote branches are synchronized.

### 16.4 Ngrok Local Preview Tunnel

Ngrok may be used only as a temporary public preview tunnel for local review. It must not be treated as the DK LAO production deployment target.

The rendered local application origin is:

```txt
http://localhost:3001/
```

The approved preview domain is:

```txt
https://snare-snowsuit-obnoxious.ngrok-free.dev
```

Preferred command for DK LAO local previews:

```powershell
ngrok http 3001 --domain=snare-snowsuit-obnoxious.ngrok-free.dev
```

If the Node.js or Next.js runtime blocks the remote host/origin, use the host-header fallback:

```powershell
ngrok http 3001 --domain=snare-snowsuit-obnoxious.ngrok-free.dev --host-header=localhost:3001
```

Do not point ngrok at Laragon/Nginx port `8080` unless Nginx has been configured to reverse proxy to `http://localhost:3001`. If the public ngrok URL shows an `Index of /` page listing project files or folders such as `con_agents/`, `src/`, `node_modules/`, `public/`, `package.json`, or `AGENTS.md`, the tunnel is pointed at the static filesystem docroot instead of the rendered application. Stop and repoint ngrok directly to port `3001`, or configure Nginx as a proxy.

Optional Nginx reverse-proxy block for `dklao.dev`:

```nginx
location / {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Laragon auto-generates files with the `auto.` prefix. If proxy changes must persist, rename `auto.dklao.dev.conf` to `dklao.dev.conf`, restart Nginx in Laragon, then tunnel through Nginx only when required:

```powershell
ngrok http http://dklao.dev:8080 --host-header=dklao.dev
```

Ngrok verification requirement:

1. Start the local Next.js server on `http://localhost:3001/`.
2. Start ngrok using the direct port `3001` command first.
3. Open `https://snare-snowsuit-obnoxious.ngrok-free.dev/`.
4. Confirm the rendered DK LAO website appears.
5. Fail the check if a directory index appears.

## 17. Completion Format

When an agent finishes work, it must report:

1. Files changed
2. Components created or updated
3. Business flow affected
4. Design rules followed
5. Forms or data touched
6. Testing performed
7. Remaining risks or assumptions
8. Recommended next step
