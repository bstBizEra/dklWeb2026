# CMS page plan: the remaining 16 sitemap pages and the menu

Source: the DK LAO content sitemap (21 page specs). Five pages exist already (Home, About, Rental, Contact, Request a Quote). This plan covers the other 16, built as CMS-driven pages on the current frontend. Local only.

## 1. The 16 pages

| Route id | URL | Needs beyond today |
|---|---|---|
| rental-short | /forklift-rental/short-term | list, form, faq |
| rental-long | /forklift-rental/long-term | text, table, closing |
| sales | /forklift-sales | chips (brands), table, faq |
| sales-new | /forklift-sales/new | list, cards by power type |
| sales-used | /forklift-sales/used | list, steps |
| maintenance | /maintenance-service | form, stats, faq |
| parts | /spare-parts | text, form, faq |
| batteries | /batteries-chargers | list, table, form |
| warehouse | /warehouse-equipment | steps, closing |
| material | /material-handling | cards |
| racking | /racking-shelving | cards |
| cleaning | /cleaning-equipment | table, cards |
| industries | /industries | cards |
| ind-logistics | /industries/logistics-warehousing | list, stats, closing |
| knowledge | /knowledge-center | cards |
| article | /knowledge-center/forklift-rental-request-checklist | list, closing |

## 2. Section types

Existing: `cards`, `steps`, `table`, `faq`. New, all found in the sitemap specs:

| New type | Used for | Shows |
|---|---|---|
| `list` | "Best for", checklists, problems | A bullet list of short items |
| `stats` | Service promise, proof | Label and value pairs in large type |
| `chips` | Brand strip | Short labels as pills |
| `text` | Why long term, nameplate help | A paragraph, optionally with bullets |
| `form` | Mini quote or booking form | The real quote form, preselected for the page |

Sitemap "hero" becomes the page headline, intro and buttons. Sitemap "cta" becomes the closing call to action. Nothing else is needed.

Also added to every page: breadcrumbs for nested routes, a "Related solutions" block (already built from the route registry), `BreadcrumbList` and, where a page has questions, `FAQPage` structured data.

## 3. Hidden `[CONFIRM]` content

The sitemap has 40 items marked `[[CONFIRM]]`. They are not dropped and not published:

- Each such item is stored with **Needs owner confirmation** ticked. It is hidden on the site.
- The marker text is removed from the copy. The draft wording stays visible in the admin so the owner can read it, edit it and untick the box.
- A section whose items are all hidden disappears. The admin and the site both refuse `[CONFIRM]` or `[[...]]` text.

## 4. Data and fallback

- The 16 pages are generated from the sitemap into `src/lib/data/sitemap-pages.ts`, so the site works with no database (CI, local, fallback).
- `pnpm cms:seed` creates a published CMS row for each page. Admin edits are never overwritten.
- One catch-all route (`src/app/(site)/[...slug]/page.tsx`) serves every published route that has no file of its own. The CMS row wins over the built-in page. An unpublished route stays a 404.
- Routes are published in the registry only when their page data exists. A test enforces this.

## 5. Menu

- Header: **Solutions** (a dropdown with the 7 solution pages and a short line each), **Industries**, **Knowledge**, **About**, **Contact**, and the **Request a Quote** button.
- Mobile: the same items as grouped lists in the menu panel.
- Keyboard: the dropdown opens on click and Enter, closes on Escape and when focus leaves.
- Source: a `navigation` global in the CMS. With no database, or no saved menu, a built-in default is used. Items pointing to an unpublished route are hidden.
- Footer links already follow the route registry.

## 6. Out of scope here

- Real photos, media library and storage.
- Article pages from the Articles collection (the one checklist article is a normal page for now).
- Lao content and the Lao language switch.
- Prices, stock and brand or dealer claims: none are published.

## 7. Done when

- All 16 URLs return a page, and nothing unconfirmed shows.
- Tests, lint, typecheck and build pass.
- Each title is 60 characters or fewer with the site suffix, and each meta description 155 or fewer.
- Every page links to the quote form and to at least three related pages.

## 8. Status (built locally, version 0.9.0)

- All 16 pages, the five new section types, breadcrumbs, structured data, the catch-all route and the menu are built and tested.
- 38 draft items from the sitemap are stored hidden. The owner reviews them under Pages in the admin, edits the wording, and unticks **Needs owner confirmation** to publish each one. The page refreshes within a minute.
- The first thing for the owner to fill in: facts that unlock several pages at once (brands, delivery, maintenance and rent-to-buy terms) under Site facts.
- Still open: photos and the media library, Lao content, article pages from the Articles collection, and Home and About copy in the CMS.
