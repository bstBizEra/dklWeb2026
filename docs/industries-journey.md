# Industries: research and UX journey

Prepared 2026-10-24 for `/industries` and its sub-pages. Local only.

## What was wrong

- Only one sector page existed (Logistics). Five of the six industry cards linked back to `/industries` itself, so a visitor who picked "Manufacturing" went nowhere.
- The logistics page showed the author note "Sector page (template)" as its eyebrow, and listed problems with no answers.
- No page told the visitor what to send for a fast quote, and the quote form opened on a generic category.

## Laos context (research, October 2026)

| Industry | What is happening | What it means for equipment | Source |
|---|---|---|---|
| Logistics and warehousing | Vientiane Logistics Park and Thanaleng Dry Port are being built out as the national hub; dry-port capacity is planned to rise from about 3 to 10.5 million tonnes a year as the Lao-China and Lao-Thailand rail links run; the park plan includes a cold-chain zone. | More containers and pallets moving through Vientiane; peaks around train and truck arrivals; demand for loading, stacking and dock equipment, and for flexible capacity. | IFC press release; UNESCAP Thanaleng Dry Port presentation |
| Manufacturing | Laos runs 21 special economic zones; Savan-Seno alone hosts about 100 companies, and Saysettha (Vientiane) hosts garment and other factories. | Steady material flow between stores, lines and dispatch, often in shifts; electric trucks indoors; uptime matters more than price. | VDB Loi on Lao SEZs; IOM SEZ factsheet; People's Daily on Saysettha |
| Construction | Industry and construction were about 31% of GDP in 2024, growing 4.7%; material prices in Vientiane have risen sharply. | Rough, uneven yards; heavy loads (cement, steel, blocks); project-length needs, so rental fits better than buying. | US trade.gov Laos commercial guide; Vientiane Times |
| Food and beverage | Lao Brewery leads the drinks market, produces beer, soft drinks and water, and expanded its plant; its network also distributes snack brands. | High-volume pallets of bottles, cans and crates; hygiene and clean floors; fast loading for distribution. | Lao Brewery site; Wikipedia; Laotian Times |
| Retail and wholesale | Import-export wholesalers bring goods in and sell to retailers; cash-and-carry and supermarkets have grown in Vientiane. | Mixed goods, frequent deliveries, tight aisles and back rooms; pallet jacks and stackers as much as forklifts; clean shop floors. | US trade.gov distribution guide; Vientiane Times |
| Hospitality and facilities | Tourism has recovered steadily since 2022, helped by Lao-China Railway passenger routes; hotel occupancy in 2025 ran at roughly 39 to 59%. | Large floors to keep clean every day; deliveries into back-of-house; budgets favour reliable machines with service. | US trade.gov tourism guide; The Hotel Blueprint |

The numbers stay in this document; the pages describe the needs without figures, so they do not date.

## Who arrives, and why

- **Operations or warehouse manager** (most visitors): has a problem today (a breakdown, a peak, a new site) and wants to know DK LAO understands their kind of operation.
- **Procurement or owner**: compares suppliers; wants scope, process and proof before asking for a price.
- **Project manager** (construction, new factory): needs equipment for a set period and wants to know what to send.

## The journey and what each page section does

| Stage | Visitor question | Section on every industry page |
|---|---|---|
| Recognise | "Do they get my kind of operation?" | Hero: the industry and its everyday pressure in one line, with Request a Quote and Talk to an Advisor |
| Understand | "What slows us down?" | **What slows [industry] down**: 4 problems written in the visitor's words |
| Explore | "What would fix it?" | **What we recommend**: 3 to 4 cards, each linking to the solution page (rental, racking, maintenance, cleaning, batteries) with an industry-specific reason |
| Evaluate | "How would working with them go?" | **How it works**: 4 steps from "tell us about your operation" to "service after delivery" |
| Prepare | "What do I need to send?" | **What to tell us for a fast quote**: the 5 details that let an advisor reply (load, lift height, ground or floor, hours, period) |
| Reassure | Last doubts | **FAQ**: 3 questions specific to the industry |
| Act | "Ask now" | Closing call to action; the quote form opens with the industry's category preselected and the page recorded as the source |

The hub (`/industries`) becomes the chooser: a short promise, one card per industry with a one-line need, a "not sure which fits?" route to an advisor, and the reference clients the owner confirmed.

## Rules kept

- No invented clients, figures, brands, stock or response times. Case-study sections stay hidden until the owner supplies a real client or project.
- Every page links onward to solutions and to a quote, and is reachable from the hub, the breadcrumb and the sitemap.
- Search titles stay within 60 characters and descriptions within 155.
- Each page uses its own library photo (`public/images/library`).

## Measuring it (see docs/metrics-plan.md)

- Industry page to quote-form start rate, by industry (the `from` parameter on the quote link).
- Quote submissions whose category came preselected from an industry page.
- Hub card click-through by industry, to see which sectors visitors actually come from.
