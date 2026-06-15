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
