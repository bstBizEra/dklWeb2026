# CMS login audit — 2026-11-05

Target: `/admin/login` at commit `5488afc` plus the audit fixes in `src/app/(payload)/custom.scss`. Mode: **Operate**. Scope: the login and its shared CMS styling.

## Implementation integrity verdict

**Pass.** The screen uses DK LAO's approved logo, slogan, and forklift imagery; BizEra's published palette and type roles shape the UI. The form remains Payload's built-in login. The CSS limits the split layout to the login template, while shared colour tokens style editor controls.

## Audit health

| Dimension | Score | Evidence |
|---|---:|---|
| Accessibility | 4/4 | Lighthouse accessibility 100 in light and dark, navigation and snapshot; labelled form inputs, visible focus, main landmark. |
| Performance | 3/4 | No authored layout animation; the CSS background image is 1.85 MB. |
| Responsive design | 4/4 | 320px phone stacks image and form without horizontal overflow; desktop uses two columns. |
| Theming | 4/4 | Official BizEra light/dark tokens, legible action and text pairs. |
| Implementation integrity | 4/4 | Product-specific imagery and copy, one DK LAO logo, authentication unchanged. |
| **Total** | **19/20** | **Excellent** |

## Findings

**P0: 0 · P1: 0 · P2: 1 · P3: 0**

### [P2] Large login background image

- **Location:** `src/app/(payload)/custom.scss`, `.login__brand`; `public/images/hero/forklift-product-hero.png` (1,849,637 bytes).
- **Category:** Performance.
- **Impact:** The product image adds roughly 1.85 MB to a first visit on a slow connection. The form remains usable because the image is decorative.
- **Recommendation:** Supply an optimized image variant while preserving the same DK LAO product composition and overlay.
- **Suggested command:** `$impeccable optimize /admin/login`.

## Detector

- `impeccable detect --json` on the changed stylesheet and components: `[]`.
- Rendered URL after the 14px correction: one `layout-transition` warning (`transition: height`). A DOM inspection of the loaded login found **no element** with a height transition; Payload's collapsible navigation and editor blocks use that transition on authenticated screens. Waived for this login audit because it is a framework control outside the login surface and did not affect the tested interaction. The earlier `tiny-text` warning was resolved by setting the intro and developer credit to 14px.

## Browser checks

- Local login: successful sign-in using the existing account; Payload dashboard opened.
- Authenticated CMS: dashboard, navigation, Pages list, and existing Page editor reviewed in light mode; account and Pages list also reviewed in dark mode. Fields, search, filters, status, and publish controls rendered; no content was changed.
- Code review caught dark `--theme-elevation-500` label contrast at 2.02:1 on a raised surface. The dark elevation ramp now uses `#8aa19a` at step 500 (5.78:1 on that surface), with a regression assertion. The dark Pages search placeholder now uses BizEra's night-muted token instead of Payload's dim default.
- Desktop light and dark, and 320px dark phone inspected. No horizontal overflow at 320px.
- Lighthouse accessibility: **100 / 100 / 100 / 100** (light navigation, light snapshot, dark navigation, dark snapshot). The login intentionally carries `noindex`, so the navigation SEO score is unrelated to accessibility.

## Positive findings

- Authentication and editing remain Payload-owned; the changes are limited to branding, layout, type, and colours.
- The image overlay preserves white slogan contrast; the DK LAO logo sits on a white plate and remains identifiable.
- The form stays readable and usable with the product image absent or delayed.

## Recommended actions

1. **[P2] `$impeccable optimize /admin/login`**: replace the 1.85 MB background with a smaller equivalent asset.
2. **`$impeccable polish /admin/login`**: final visual check after an image change.
