# DK LAO 2026 site: UX metrics plan

Status: proposal, local only. Nothing is measured yet: the site is not live and has no analytics. Targets are starting guesses to replace with the first 4 weeks of real data.

## Goal and hypotheses

Goal: Lao and regional business buyers send a usable quote request instead of only phoning or messaging.

- H1: a clear hero, one main button and a short quote form raise completed requests.
- H2: pages with real answers (rental, parts, service) bring more qualified requests than the old coming-soon page.
- H3: phone and WhatsApp shown together (once confirmed) shift contacts from the form to calls, which we must count too.

## Primary metrics (5)

| Metric | Type | Definition | Method and source | Target (first guess) | Frequency | Owner |
|---|---|---|---|---|---|---|
| Quote requests per week | Business | Saved leads, excluding spam and test rows | Leads collection in the CMS (works today) | Set baseline in 4 weeks | Weekly | Sales lead |
| Visit-to-request rate | Behavioural | Visitors who submit a valid quote form / unique visitors | Analytics (not set up) plus leads count | 1.5% to 3% | Weekly | Marketing |
| Form completion rate | Task success | Submitted valid forms / forms started | Analytics events: form_start, form_submit, form_error | 55% or more | Weekly | UX |
| Contact clicks | Engagement | Taps on phone, WhatsApp and Facebook links | Analytics events (only once numbers are confirmed) | Baseline first | Weekly | Marketing |
| Lead quality | Business | Leads marked QUALIFYING or later / all leads | Lead status in the CMS (works today) | 40% or more | Monthly | Sales lead |

## Supporting metrics

- Spam share: refused requests (429) and honeypot hits / all attempts. Target under 20%. Source: server log counts.
- Reply time: submitted time to first CONTACTED status. Target within the promised window once confirmed. Source: CMS lead timestamps.
- Page health: Core Web Vitals (LCP under 2.5 s, INP under 200 ms, CLS under 0.1). Source: Lighthouse and field data after launch.
- Search: impressions and clicks for the 21 page titles. Source: Search Console.
- Mobile share and phone-width completion rate: the same form metrics split by device, since most Lao buyers use phones.

## Attitudinal (small, regular)

- One-question exit survey on the thank-you message: "Was it easy to ask for a quote?" (1 to 5). Target 4 or more.
- Quarterly: ask 5 customers to describe how they found DK LAO and what almost stopped them.

## HEART mapping

| Dimension | Signal |
|---|---|
| Happiness | Exit survey score |
| Engagement | Pages per visit, contact clicks |
| Adoption | First-time visitors who reach a solution page |
| Retention | Returning visitors in 30 days |
| Task success | Form completion rate, visit-to-request rate |

## Instrumentation needed (not built)

1. Privacy-friendly analytics with events: form_start, form_submit, form_error, click_phone, click_whatsapp, click_facebook, cta_click (label). No personal data in events.
2. A cookie notice only if the chosen tool needs one.
3. Count spam refusals in a log line (no personal data).
4. Dashboard: one page showing the five primary metrics, reviewed weekly.

## Rules

- Set baselines for 4 weeks before judging any change; change one thing at a time.
- Report numbers with the qualitative notes (calls, messages, lead comments).
- Never count staff or test leads.
- Review this plan quarterly.
