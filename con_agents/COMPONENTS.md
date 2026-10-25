# COMPONENTS.md — DK LAO Reusable UI Component Contracts

## 1. Purpose

This file controls reusable UI component contracts for the DK LAO website and digital platform.

Frontend agents must build reusable components before creating page-specific one-off sections.

## 2. Component Principles

Components must be:

- Typed
- Reusable
- Responsive
- Accessible
- Token-driven
- Conversion-aware
- CMS/API-ready

## 3. Required Components

```txt
MainHero
RentalHero
ProductCategoryGrid
ProductCard
RentalFleetCard
UsedEquipmentCard
ServiceCard
SparePartsCard
ForkliftAnatomyInteractive
CleaningEquipmentSection
QuoteRequestForm
CTASection
IndustrialFooter
FloatingContactActions
QuickQuoteBar
IndustrySolutionCard
KnowledgeArticleCard
```

## 4. ProductCard Contract

```ts
type ProductCardProps = {
  id: string
  title: string
  category: string
  image?: string
  condition?: 'new' | 'used' | 'rental' | 'on-request'
  powerType?: 'electric' | 'diesel' | 'lpg' | 'manual' | 'battery' | 'other'
  capacity?: string
  liftHeight?: string
  availability?: 'in-stock' | 'on-request' | 'rental-available' | 'sold'
  ctaLabel?: string
  href?: string
}
```

## 4a. MegaMenu Contract

`src/components/dklao/mega-menu.tsx`. Layout from shadcn/studio `navigation-menu-06` (link groups left, promo card right), DK LAO look: brand stripe, red `Eyebrow` group titles, blue `IconBadge` icons, navy-grid promo card, orange header underline. Behaviour (Escape, arrow keys, focus return, `aria-expanded`) comes from Radix through `ui/navigation-menu`; do not add `outline-none` or `outline-hidden` there, or the keyboard focus ring disappears.

```ts
type MenuLink = { label: string; href: string; description?: string; icon: LucideIcon }
type MenuGroup = { title: string; links: MenuLink[] }
type MenuPromo = { image: string; imageAlt: string; title: string; copy: string; ctaLabel: string; ctaHref: string }

<MegaMenu label="Solutions" groups={groupMenuLinks(links)} promo={solutionsPromo} />  // one header item
<MainNavigation items={await getNavigation()} />                                      // the whole desktop menu
```

Groups, icons and the promo copy live in `src/lib/data/navigation.ts` (`groupMenuLinks`, `solutionsPromo`), and the phone menu uses the same `groupMenuLinks`, so both menus always list the same groups. A CMS page the map does not know shows under Equipment with an arrow icon.

## 5. Form Component Rules

Forms must use:

```txt
React Hook Form or equivalent
Zod or equivalent validation
Clear success state
Clear error state
Lead type classification
Source page tracking
```

## 6. Motion Component Rules

Motion components must respect:

```txt
prefers-reduced-motion
Approved motion patterns from DESIGNS.md
Performance constraints
No distracting loops
```

## 7. Component QA

A component is complete only if:

- It is typed.
- It is responsive.
- It uses tokens.
- It has accessible labels where needed.
- It avoids hardcoded business data.
- It supports future API/CMS data.
