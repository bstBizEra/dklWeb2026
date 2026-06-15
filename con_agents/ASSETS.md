# ASSETS.md — DK LAO Logo, Favicon, Graphic, and Media Asset Rules

## 1. Purpose

This file controls how agents use DK LAO brand assets, logo files, favicon files, slogan graphics, icons, product images, and media.

## 2. Authoritative Asset Paths

Logo and favicon path:

```txt
C:\laragon\www\dklao\images\logo & FAV_Icon
```

Slogan and graphic icon path:

```txt
C:\laragon\www\dklao\Icons for slogan
```

Agents must check these folders before using or generating visual identity assets.

## 3. Asset Discovery Rules

Agents must look for:

```txt
Logo files: .svg, .png, .webp, .jpg
Favicon files: .ico, .png, .svg
Slogan icons: .svg, .png, .webp
Graphic assets: .svg, .png, .webp, .jpg
```

Preferred order:

```txt
SVG > PNG > WebP > JPG
```

Use SVG for logos and icons when available.

## 4. Logo Usage Rules

- Use the official DK LAO logo from the logo path.
- Do not redraw the logo.
- Do not alter logo colors unless creating an approved white/silver version for dark backgrounds.
- Keep at least 24px clear space around the logo on desktop.
- Keep at least 16px clear space around the logo on mobile.
- Do not place the logo on busy machinery imagery without a dark overlay.
- Use favicon from the official favicon folder only.

## 5. Slogan Icon Usage Rules

The slogan icon folder is the source for graphic elements related to the DK LAO slogan and industrial value proposition.

Approved slogan direction:

```txt
Lifting – Moving – Growing Your Business
Lifting, Moving, Cleaning & Growing Your Business
```

Slogan icons may be used for:

- Hero support graphics
- Service cards
- Solution cards
- Motion animation elements
- Trust/value sections
- Quick quote action bar

Do not use slogan icons as random decoration. Each icon must support a business message.

## 6. Product Image Rules

Use images that support:

- Forklift rental
- New forklift sales
- Used forklift sales
- Warehouse equipment
- Racking and shelving
- Spare parts and accessories
- Maintenance and repair
- Professional cleaning equipment

Avoid generic corporate photos, irrelevant construction images, low-quality machinery images, or unlicensed assets.

## 7. Naming Convention

Recommended asset naming:

```txt
dklao-logo-horizontal.svg
dklao-logo-vertical.svg
dklao-favicon.ico
icon-slogan-lifting.svg
icon-slogan-moving.svg
icon-slogan-growing.svg
category-forklift-rental.webp
category-cleaning-equipment.webp
product-electric-forklift-2-5t.webp
```

## 8. Frontend Import Rule

When using Next.js, assets should be placed or referenced through the public asset layer, for example:

```txt
/public/images/logo/
/public/images/fav-icon/
/public/icons/slogan/
/public/images/products/
```

Do not hardcode Windows paths in browser-rendered code. Windows paths are source/discovery paths only.

## 9. Missing Asset Rule

If assets are missing:

1. Use a clearly labeled placeholder.
2. Add a task to replace placeholder assets.
3. Do not mark the page production-ready.
4. Do not generate a fake official logo.

## 10. QA Checklist

Before delivery, confirm:

- Official logo is used.
- Favicon is configured.
- Slogan icons are from the approved path.
- Product images are relevant and optimized.
- No broken image paths exist.
- No placeholder assets remain in production.
