# DK LAO Homepage Design

Source: C:\laragon\www\dklao\con_agents\AGENTS.md
Timestamp: 2026-06-15T15:30:00+07:00
Agent ID: Codex Motor Agent

## Goal

Create the first DK LAO homepage as a premium industrial lead-generation page for forklift rental, new and used forklift sales, spare parts, maintenance, warehouse solutions, and cleaning equipment.

## Scope

The homepage will be the first implementation surface in this repository. It will scaffold a Next.js, TypeScript, and Tailwind CSS application in `C:\laragon\www\dklao` while preserving the existing `con_agents` governance layer.

## User Experience

The page opens with the official DK LAO logo, conversion-focused navigation, and a dark industrial hero using the approved DK LAO message:

`DK LAO - Lifting, Moving, Cleaning & Growing Your Business`

Primary calls to action are `Request a Quote`, `View Rental Fleet`, and `Book Maintenance Service`. The homepage then guides visitors through quick quote actions, solution categories, forklift rental, product discovery, used equipment inquiry, maintenance and spare parts, cleaning equipment, warehouse solutions, industries served, trust reasons, a central quote form, and footer contact paths.

## Architecture

Use the Next.js App Router with server components for static homepage sections and a small client component for the quote request form. Business content will live in typed data files under `src/lib/data` so future CMS/API integration can replace static content without rewriting UI components.

## Forms and Leads

The first form will be a quote request form with Zod validation, React Hook Form client validation, source page tracking, and a Next.js route handler at `/api/leads/quote`. The route will follow the response shape from `API_CONTRACTS.md` and store local development submissions in a local-only JSONL file when no CRM/email integration is configured.

## Assets

Official assets discovered in this checkout:

- `C:\laragon\www\dklao\images\logo\Logo-H_Text.svg`
- `C:\laragon\www\dklao\images\logo\Logo-V_Text.svg`
- `C:\laragon\www\dklao\images\logo\FAV-Icon.png`
- `C:\laragon\www\dklao\Icons\Material-Handling-Icons.svg`

Governance documents currently reference `images\logo & FAV_Icon` and `Icons for slogan`, but those folders are not present. Implementation will copy the available official assets into web-safe `public` paths and record this as a risk.

## Testing and QA

Automated tests will cover homepage data contracts and lead validation. Build verification will include linting, type checking, production build, and browser review of the local homepage.

