# ROUTES.md — DK LAO Website Route Map and Page Responsibility

## 1. Purpose

This file controls public routes, page ownership, required CTAs, SEO targets, and route-level responsibilities.

## 2. Core Routes

```txt
/                           Home
/about                      About DK LAO
/forklift-rental            Forklift rental landing page
/forklift-rental/short-term Short-term rental page
/forklift-rental/long-term  Long-term rental page
/forklift-sales             Forklift sales landing page
/forklift-sales/new         New forklift sales
/forklift-sales/used        Used forklift sales
/material-handling          Material handling solutions
/warehouse-equipment        Warehouse equipment
/racking-shelving           Racking and shelving
/spare-parts                Spare parts and accessories
/batteries-chargers         Batteries and chargers
/cleaning-equipment         Professional cleaning equipment
/maintenance-service        Maintenance and repair service
/industries                 Industry solutions
/knowledge-center           Articles and guides
/contact                    Contact DK LAO
/request-quote              Central quote request
```

## 3. Page CTA Requirements

Every route must have at least one conversion action.

```txt
Home -> Request a Quote, View Rental Fleet, Book Maintenance Service
About -> Request a Quote, View Our Solutions, Contact DK LAO
Forklift Rental -> Ask for Rental Price, View Rental Fleet
Forklift Sales -> Request a Quote, Ask for Recommendation
Used Forklifts -> Request Inspection, Ask for Used Forklift Stock
Spare Parts -> Request Spare Parts
Maintenance -> Book Maintenance Service
Cleaning Equipment -> Get Cleaning Equipment Recommendation
Contact -> Submit Inquiry
```

## 4. SEO URL Rules

- Use lowercase English slugs.
- Use hyphen separators.
- Avoid deeply nested paths unless necessary.
- Keep pages understandable for customers and search engines.

## 4a. iPhone Web App Routes

A separate iOS-style web app with its own root layout (`src/app/(app)/`), not indexed by search engines (`noindex`). Saved to the Home Screen it opens full screen.

```txt
/app                          Home: company, Request a Quote, Book a Service, one-tap contacts, About, Trusted by
/app/services                 Every Solutions service, grouped like the website menu; a tap opens the request
/app/request                  Quote form; ?category=<intent> preselects the category
/app/request?type=service     Service booking: problem, machine, site address or pin
/app/location                 Office address, Maps directions, contacts, hours, "Send my site location"
/app/info                     App info: version, copyright, website, developer (BizEra), privacy, clear saved details
/app/offline                  Shown by the service worker when there is no connection
/app/manifest.webmanifest     Web app manifest (scope /app)
/app/icon/180|192|512         Home-screen icons (official favicon on a white square)
/app/icon/maskable-192|512    Android icons with the mark inside the safe zone for round crops
/app-sw.js                    Service worker, scope /app
```

Only `/app` may ask for the visitor's location (`Permissions-Policy: geolocation=(self)`); the website keeps `geolocation=()`.

## 5. Future Route Expansion

```txt
/customer-portal
/admin
/admin/leads
/admin/products
/admin/rental-fleet
/admin/service-requests
/admin/spare-parts
/admin/contracts
/admin/billing
```

Admin routes must be protected.
