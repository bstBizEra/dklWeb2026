# TOKEN.md — DK LAO Design Token Control Rules

## 1. Purpose

This file controls design tokens for colors, typography, spacing, radius, shadows, gradients, motion, z-index, and component states.

Agents must use tokens instead of hardcoded values whenever possible.

## 2. Token Naming Convention

```txt
--dk-[category]-[role]-[scale/state]
```

Examples:

```txt
--dk-color-brand-blue
--dk-color-action-red
--dk-radius-card
--dk-shadow-card
--dk-motion-duration-fast
```

## 3. Core CSS Tokens

```css
:root {
  --dk-color-brand-blue-deep: #154A99;
  --dk-color-brand-blue: #0061AF;
  --dk-color-brand-blue-icon: #0060AE;
  --dk-color-action-red: #D91A21;
  --dk-color-action-red-bright: #EF3937;
  --dk-color-action-orange: #E74422;
  --dk-color-neutral-white: #FFFFFF;
  --dk-color-neutral-silver: #F1F2F2;
  --dk-color-neutral-silver-soft: #EFEFF0;
  --dk-color-navy-950: #07111F;
  --dk-color-navy-900: #0B1B33;
  --dk-color-navy-800: #102A4C;
  --dk-color-slate-700: #334155;
  --dk-color-slate-500: #64748B;
  --dk-color-slate-300: #CBD5E1;
  --dk-color-slate-100: #F1F5F9;
  --dk-color-surface: #F8FAFC;
  --dk-color-card: #FFFFFF;
  --dk-color-success: #16A34A;
  --dk-color-warning: #F59E0B;
  --dk-color-danger: #DC2626;
  --dk-color-info: #0284C7;

  --dk-radius-xs: 6px;
  --dk-radius-sm: 10px;
  --dk-radius-button: 14px;
  --dk-radius-card: 24px;
  --dk-radius-pill: 999px;

  --dk-space-1: 4px;
  --dk-space-2: 8px;
  --dk-space-3: 12px;
  --dk-space-4: 16px;
  --dk-space-5: 20px;
  --dk-space-6: 24px;
  --dk-space-8: 32px;
  --dk-space-10: 40px;
  --dk-space-12: 48px;
  --dk-space-16: 64px;
  --dk-space-20: 80px;
  --dk-space-24: 96px;

  --dk-shadow-card: 0 16px 40px rgba(15, 23, 42, 0.08);
  --dk-shadow-cta: 0 12px 30px rgba(217, 26, 33, 0.24);
  --dk-shadow-blue-glow: 0 18px 46px rgba(0, 97, 175, 0.24);

  --dk-motion-duration-fast: 160ms;
  --dk-motion-duration-base: 260ms;
  --dk-motion-duration-slow: 600ms;
  --dk-motion-ease-premium: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## 4. Tailwind Theme Extension

```ts
export const dkLaoTheme = {
  colors: {
    dk: {
      blueDeep: '#154A99',
      blue: '#0061AF',
      blueIcon: '#0060AE',
      red: '#D91A21',
      redBright: '#EF3937',
      orange: '#E74422',
      navy950: '#07111F',
      navy900: '#0B1B33',
      navy800: '#102A4C',
      silver: '#F1F2F2',
      silverSoft: '#EFEFF0',
      surface: '#F8FAFC',
      card: '#FFFFFF',
    },
  },
  borderRadius: {
    card: '24px',
    button: '14px',
    pill: '999px',
  },
  boxShadow: {
    card: '0 16px 40px rgba(15, 23, 42, 0.08)',
    cta: '0 12px 30px rgba(217, 26, 33, 0.24)',
    blueGlow: '0 18px 46px rgba(0, 97, 175, 0.24)',
  },
}
```

## 5. Token Governance

- Do not hardcode brand colors in components.
- Do not create new tokens without adding them here.
- Do not use one-off shadow, radius, or gradient values unless approved.
- Components must consume tokens from Tailwind config, CSS variables, or a central theme file.
- Token changes must be recorded in `CHANGELOG.md`.
