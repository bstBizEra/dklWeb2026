# QA_CHECKLIST.md — DK LAO Acceptance Criteria Before Delivery

## 1. Purpose

This file controls final quality checks before any DK LAO page, component, form, API, or release is marked complete.

## 2. Strategic QA

Confirm:

- The work supports DK LAO's business model.
- The work improves lead generation or operational clarity.
- The page does not behave like a static brochure.
- The output supports future CRM, rental, service, inventory, contract, or billing expansion where relevant.

## 3. Design QA

Confirm:

- DK LAO colors are used correctly.
- Official logo/favicon assets are used.
- Slogan graphics come from approved path if used.
- Typography is consistent.
- Cards, buttons, and sections follow tokens.
- Layout is premium, industrial, and professional.
- Motion supports business meaning.
- Reduced-motion preference is respected.

## 4. Frontend QA

Confirm:

- Page is responsive on desktop, tablet, and mobile.
- No horizontal scrolling on mobile.
- Components are reusable and typed.
- Images are optimized.
- Links work.
- CTA buttons are visible.
- Forms have clear validation.

## 5. Backend/API QA

Confirm:

- Input validation exists.
- API response shape is consistent.
- Errors are user-safe.
- Leads capture source page and lead type.
- Uploads are restricted.
- Secrets are not exposed.

## 6. Content/SEO QA

Confirm:

- SEO title and meta description exist.
- No unsupported claims exist.
- No fake prices or stock claims exist.
- CTA copy is clear.
- Lao/English labels are consistent where used.

## 7. Release QA

Before production:

```txt
lint passes
typecheck passes
build passes
forms tested
404 checked
mobile checked
favicon checked
analytics checked if enabled
no placeholder content remains
CHANGELOG updated
```
