# CHANGELOG.md — DK LAO Agent Control and Platform Decision History

All notable changes to DK LAO agent-control rules, architecture, design system, data model, and deployment decisions must be documented here.

## [0.3.1] - 2026-06-16

### Changed

- Replaced the homepage "Equipment matching" anatomy visual with the owner-provided static forklift anatomy reference image at `public/images/anatomy/forklift-equipment-matching-reference.png`.
- Simplified `AnatomyDiagram` from a client-side animated callout component into a static server component using the reference image.
- Removed the old anatomy callout columns, connector-line CSS, scroll-triggered callout animation hooks, and unused legacy hotspot styles from `globals.css`.

### QA

- Ran `pnpm test -- --run`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` successfully.
- Browser-checked the Equipment matching section on desktop and 390px mobile: new reference image renders, no old callout DOM remains, animation names are `none`, no horizontal overflow, and no console errors.

## [0.3.0] — 2026-06-15

### Added

- Added branded `not-found.tsx` (404) page with header, footer, primary CTAs, and popular-destination links so unbuilt inner routes keep visitors in the lead funnel.
- Added accessibility skip-to-content link and `#main-content` landmark on the home and 404 pages.
- Added global `:focus-visible` keyboard focus ring using brand-blue token.
- Added `app/robots.ts` (allow all, disallow `/admin` and `/api`, sitemap + host) and `app/sitemap.ts` (homepage only to avoid advertising unbuilt routes).
- Added `.dk-skip-link` and `.not-found` token-driven styles to `globals.css`.
- Replaced the equipment-matching visual with a full `AnatomyDiagram` client component: 19 part callouts (mast, lift chains, tilt cylinder, load backrest, carriage, forks; safety beacon, overhead guard, operator seat, steering wheel, control levers, hydraulic hoses, engine compartment, counterweight, fuel/battery, service panel, rear steering wheels; front drive wheels, hydraulic cylinders) arranged in two side columns with connector lines, revealing one-by-one on scroll (IntersectionObserver, staggered). Callouts overflow on top of the image mask (`overflow: visible`, raised z-index); no-JS keeps them visible and `prefers-reduced-motion` shows them instantly. Removed the prior `AnatomyVisual` component.
- Wired the existing approved `public/images/hero/forklift-anatomy-hero.png` into the homepage "Equipment matching" section, replacing the CSS-drawn forklift shapes with the real photo and four part-anchored requirement callouts (capacity, lift height, power/runtime, indoor/outdoor); gave each requirement list item a distinct icon.

### Changed

- Reworked the equipment-matching section into two parts: left = heading/intro ("Know the forklift, ask the right questions"), right = the forklift diagram with callouts. Trimmed callouts to the requested balanced set of 6 per side (left: mast, lift chains, tilt cylinder, load backrest, carriage, forks; right: safety beacon, operator seat, hydraulic hoses, engine compartment, counterweight, rear steering wheels), anchored each column to the outer margin with connector lines pointing inward, and removed the previous bottom row.
- Swapped in a cleaner studio forklift render (provided by the owner) as `forklift-anatomy-hero.png`.

- Repositioned the homepage Quick-Quote bar below the hero (`margin-top` -46px -> 50px) instead of overlapping it; restyled the "Start with the right DK LAO workflow" heading to right-aligned brand-blue with navy default header text for the new light-surface placement.
- Reworked the "Equipment matching" forklift visual to zoom out (object-fit `cover` -> `contain`) so the full truck reads smaller and uncropped, and re-anchored the four spec callouts to the resized layout.

- Hardened homepage SEO metadata in `layout.tsx`: added `metadataBase`, title template, canonical, keywords, Open Graph image, Twitter card, granular robots directives, and a separate `viewport` export with brand `themeColor`.
- Aligned the Home `<title>` to the approved `CONTENT.md` em-dash form.

### QA

- Validated syntax/JSX of all changed `.ts`/`.tsx` files and CSS brace balance.
- Note: full `next build`, `lint`, `typecheck`, and `vitest` must be run on the Windows/Laragon toolchain (the sandbox cannot resolve the Windows pnpm symlink store). Unit tests are unaffected — they import only `leads.ts` and `homepage.ts`, which were not modified.

## [0.2.0] — 2026-06-15

### Added

- Added explicit Windows development path: `C:\laragon\www\dklao`.
- Added explicit agent control path: `C:\laragon\www\dklao\con_agents`.
- Added logo and favicon source path: `C:\laragon\www\dklao\images\logo & FAV_Icon`.
- Added slogan graphic source path: `C:\laragon\www\dklao\Icons for slogan`.
- Added `ASSETS.md` for logo, favicon, slogan graphics, image, and media rules.
- Added `TECHNOLOGY_SOFTWARE_INFRA.md` for technology stack, software, local environment, infrastructure, and phase-based platform rules.
- Updated root `AGENTS.md` bridge behavior.
- Updated master `AGENTS.md` source-of-truth list.
- Updated `AGENT_BOOTSTRAP.md` path detection rules.

### Changed

- Strengthened path-aware governance for Windows/Laragon and `/dklao` agent-control usage.
- Added asset discovery rules for design and frontend agents.

### Security

- Reinforced that Windows local asset paths must not be hardcoded into browser-rendered code.
- Reinforced secret/token handling through `TOKEN_MANAGEMENT.md`, `SECURITY.md`, and `ENVIRONMENT.md`.

## [0.1.0] — 2026-06-15

### Added

- Initial DK LAO root bridge `AGENTS.md`.
- Initial master control file under `/dklao/con_agents/AGENTS.md`.
- Initial companion control package for design, content, architecture, routes, components, data model, API contracts, forms, QA, security, deployment, and infrastructure.
