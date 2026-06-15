# DESIGNS.md — DK LAO Brand, UI, Motion, Layout, and Component Rules

## 1. Purpose

This file controls the visual, interaction, and interface behavior of the DK LAO website and digital platform.

All design work must reinforce DK LAO as a premium industrial B2B platform for forklift rental, sales, service, spare parts, warehouse solutions, and professional cleaning equipment.

The website must feel like a modern semi-ecommerce industrial platform, not a static company brochure.

## 2. Asset Source Rules

Official logo and favicon source path:

```txt
C:\laragon\www\dklao\images\logo & FAV_Icon
```

Official slogan/icon graphic source path:

```txt
C:\laragon\www\dklao\Icons for slogan
```

Agents must follow `ASSETS.md` before using logo, favicon, or slogan graphics.

## 3. Visual Direction

Design personality:

- Industrial
- Reliable
- Technical
- Safe
- Fast
- Modern
- Professional
- Lead-generation focused

Primary experience layers:

```txt
Top layer: premium industrial landing page
Middle layer: semi-ecommerce product discovery
Operational layer: quote, rental, service, spare-parts inquiry
Motion layer: forklift movement, lifting animation, product transitions, anatomy hotspots, clean sweep effects
```

## 4. Approved Core Message

```txt
DK LAO — Lifting, Moving, Cleaning & Growing Your Business
```

Hero message:

```txt
Reliable forklift rental, new and used forklift sales, spare parts, maintenance services, warehouse solutions, and professional cleaning equipment across Laos.
```

## 5. Color System

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

## 6. Color Usage

- Blue = trust, industrial capability, navigation, secondary actions.
- Red/orange = primary action, quote request, rental inquiry, urgent service.
- Dark navy = premium hero, footer, dark CTA, operational authority.
- White/silver = catalog, content, forms, technical specification cards.
- Green = available, confirmed, success.
- Amber = warning, pending, needs attention.

Do not introduce random colors without updating `TOKEN.md`.

## 7. Gradient System

```css
--gradient-dk-blue: linear-gradient(135deg, #154A99 0%, #0061AF 100%);
--gradient-dk-action: linear-gradient(135deg, #D91A21 0%, #E74422 55%, #EF3937 100%);
--gradient-dk-hero:
  radial-gradient(circle at 20% 20%, rgba(0,97,175,0.35), transparent 32%),
  radial-gradient(circle at 80% 10%, rgba(217,26,33,0.22), transparent 28%),
  linear-gradient(135deg, #07111F 0%, #0B1B33 55%, #102A4C 100%);
--gradient-dk-silver: linear-gradient(135deg, #FFFFFF 0%, #F1F2F2 48%, #E2E8F0 100%);
```

## 8. Typography

Recommended fonts:

```txt
English headings: Poppins or Inter
English body: Inter or Roboto
Lao text: Noto Sans Lao
Technical specs: Roboto Mono or IBM Plex Mono
```

Type scale:

```css
--text-hero: 64px;
--text-h1: 52px;
--text-h2: 40px;
--text-h3: 28px;
--text-h4: 22px;
--text-body-lg: 18px;
--text-body: 16px;
--text-small: 14px;
--text-caption: 12px;
```

## 9. Layout Rules

Use:

- Strong section hierarchy
- Wide spacing
- Technical grid alignment
- Premium cards
- Sticky or repeated CTA access
- Mobile-first stacking
- Clear catalog filtering

Avoid:

- Brochure-only layout
- Weak CTAs
- Generic templates
- Cluttered product blocks
- Animation without business meaning

## 10. Background Classes

```css
.dk-bg-industrial-grid {
  background:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px),
    var(--gradient-dk-hero);
  background-size: 48px 48px, 48px 48px, cover;
}

.dk-bg-blueprint {
  background:
    radial-gradient(circle at 25% 20%, rgba(0,97,175,0.16), transparent 28%),
    linear-gradient(135deg, #F8FAFC 0%, #EEF4FA 100%);
}

.dk-bg-clean {
  background:
    radial-gradient(circle at 80% 20%, rgba(0,97,175,0.10), transparent 28%),
    linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%);
}

.dk-bg-dark-warehouse {
  background:
    radial-gradient(circle at 15% 20%, rgba(0,97,175,0.35), transparent 30%),
    radial-gradient(circle at 85% 80%, rgba(217,26,33,0.25), transparent 32%),
    linear-gradient(135deg, #07111F 0%, #0B1B33 100%);
}
```

## 11. Button Rules

Primary buttons are for conversion actions only:

```txt
Request a Quote
Ask for Rental Price
Book Maintenance Service
Request Spare Parts
```

Secondary buttons are for discovery actions:

```txt
View Rental Fleet
Browse Forklifts
View Cleaning Equipment
Explore Warehouse Solutions
```

## 12. Card Rules

Card types:

```txt
ProductCard
RentalFleetCard
UsedEquipmentCard
ServiceCard
SparePartsCard
TrustCard
IndustrySolutionCard
KnowledgeArticleCard
```

Cards must be responsive, token-driven, and CTA-aware.

## 13. Motion Rules

Allowed motion patterns:

```txt
Forklift movement
Lifting animation
Product card transition
Spare-parts conveyor flow
Forklift anatomy hotspots
Clean sweep effect
```

All motion must respect `prefers-reduced-motion`.

## 14. Homepage Section Order

```txt
1. Header / navigation
2. Premium industrial hero
3. Quick quote / rental / service action bar
4. Main solution cards
5. Forklift rental highlight
6. Product category discovery
7. Used forklift stock section
8. Maintenance and spare-parts section
9. Forklift anatomy interactive block
10. Professional cleaning equipment section
11. Warehouse solutions section
12. Industries served
13. Why DK LAO
14. Customer logos
15. Knowledge center
16. Final quote request form
17. Footer with contact and location
```

## 15. Final Design Acceptance Criteria

A design is acceptable only if it:

- Looks premium, industrial, and trustworthy.
- Uses official logo and assets.
- Follows approved colors and tokens.
- Has visible conversion CTAs.
- Is responsive from mobile to desktop.
- Supports lead generation.
- Uses reusable components.
- Avoids fake product claims, fake prices, and fake stock.
