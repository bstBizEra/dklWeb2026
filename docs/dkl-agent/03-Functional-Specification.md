# DKL-FSD-001 — Functional Specification

Version: 0.1 proposed product behavior | Owner: Product Manager / Systems Analyst | Date: 2026-10-09

## Scope and authority
This is the behavior contract for the DK LAO Sales, Operations and CRM/Support assistant in Lao and English. It extends the existing website at `bstBizEra/dklWeb2026`, inspected revision `29057c6435f65c3f8448532c094f9604542b43d8`. Existing public `/`, `/about` and `POST /api/leads/quote` are verified baseline surfaces; all staff workflows below are proposed. The suite revision is 1.1; it is not an application release version.

PRD defines value/scope; this document defines behavior; TDD defines mechanisms. Detailed layouts and data constraints are in `supporting/UX-Specification.md` and `supporting/ERD-Data-Dictionary.md`. `supporting/UX-Wireframes.html` is a clickable low-fidelity design artifact with fictional content, not a connected product.

## Functional contracts
| Function / requirement | Actor and precondition | Normal behavior | Boundary and failure |
| --- | --- | --- | --- |
| F01 / R01: Sign in and access | Active staff identity with configured membership | Show only authorized workspaces and resource scope | Anonymous private requests denied; expired session prompts sign-in; identity outage never grants fallback access |
| F02 / R02: Choose language | Staff in authorized workspace | Switch Lao/English without changing record data; preserve IDs, dates, numbers and model names | Missing approved translation shows identified fallback; untranslated commercial text is not presented as approved |
| F03 / R03: Ask portfolio/SOP question | Eligible verified source exists within actor scope | Answer with source/version; separate known facts from suggestions | Unknown price, availability, specifications or stale sources trigger clarification/handoff; no invented claims |
| F04 / R04: Public intake | Prospect submits existing validated quote fields | Server assigns NEW, timestamp and reference; acknowledge only after durable acceptance | Field errors preserve safe entries; invalid JSON rejected; rate limit gives recovery guidance; retry key suppresses duplicates |
| F05 / R04: Customer record | Staff has customer-resource permission | Maintain account/contact, preferred language and authorized timeline; present duplicate candidates for human review | Same-name customers are not auto-merged; wrong-scope IDs reveal no record content |
| F06 / R05: Qualify and advance lead | Authorized sales user and current record version | Capture service-specific fields; validate transition and required evidence; append activity | Stale revision shows conflict; invalid transition leaves record unchanged; public input cannot create WON state |
| F07 / R06: Follow-up | Accepted lead and active owner | Record owner, next action, due timestamp; queue shows overdue items | No owner/due date blocks acceptance; overdue does not silently change commitments |
| F08 / R06: Handoff | Sender owns task or has reassignment authority | Create pending handoff with recipient, purpose, checklist and due date; recipient accepts or returns with reason | Pending recipient does not become owner until acceptance; inactive recipient blocks submission; retry produces one handoff |
| F09 / R07: Ticket | Authorized support user; customer and equipment/site context | Triage, assign, record evidence, resolve and close with reason; reopen preserves history | Unverified warranty/SLA remains unknown; dangerous equipment report invokes approved human escalation |
| F10 / R08: Quote draft | Authorized sales; qualified lead | Draft item lines/terms, mark unconfirmed values; submit exact revision for review | Draft is not a commercial commitment; missing confirmed pricing prevents final approval |
| F11 / R08: Quote approval | Configured commercial approver; current revision/hash | Approve or reject an immutable version; record authority, time and decision | Changed version requires new approval; admin membership alone does not grant commercial approval; approval does not send |
| F12 / R09: Agent proposal/action | Verified staff context and allowed tool | Model proposes bounded action; authorized staff reviews; server revalidates before execution | Model role/approval claims ignored; tool timeout leaves actual result explicit; no duplicate mutation or arbitrary SQL/shell |
| F13 / R10: Reports/audit | Actor has reporting/audit permission | Display scoped counts, aging, overdue tasks and source freshness with timestamp/denominator | Empty is zero with context; unavailable is not zero; unauthorized aggregates and audit exports denied |

## Business status and workflow rules
Lead statuses preserve the repository enum: NEW, CONTACTED, QUALIFYING, QUOTATION_PREPARING, QUOTATION_SENT, FOLLOW_UP, WON, LOST, CLOSED. Proposed normal progression is NEW → CONTACTED → QUALIFYING → QUOTATION_PREPARING → QUOTATION_SENT → FOLLOW_UP → WON/LOST → CLOSED. Reviewable backward corrections require manager capability, reason and audit. The final implemented state machine must define every allowed edge; an enum alone is insufficient.

A WON lead requires an approved order/rental evidence reference. LOST requires a reason. CLOSED does not delete pending tasks: open work must be reassigned, completed or explicitly cancelled. QUOTATION_SENT requires authorized dispatch evidence; it cannot be inferred from quote approval.

Task states: OPEN, IN_PROGRESS, BLOCKED, DONE, CANCELLED. DONE requires completion evidence and time. Handoff states: PENDING, ACCEPTED, RETURNED, CANCELLED. RETURNED requires reason. Ticket states: OPEN, ASSIGNED, IN_PROGRESS, WAITING_CUSTOMER, RESOLVED, CLOSED. RESOLVED/CLOSED require outcome evidence; reopening records a new event.

## Required qualification by business line
| Line | Required facts to collect before a specific recommendation |
| --- | --- |
| Equipment sale | Application, load/capacity need, lift height, environment, timing, new/used preference |
| Rental | Start/end dates or duration, load/lift requirements, hours, site, indoor/outdoor use, delivery/operator needs |
| Maintenance | Brand/model/serial if available, symptoms, location, safety urgency, preferred service mode |
| Spare parts | Part description/reference, equipment model/serial, quantity, urgency; photo only through approved upload flow |
| Warehouse | Site dimensions or survey requirement, storage/load needs, aisle/flow constraints and timing |
| Cleaning | Site/floor type, area, dirt/application, operating conditions, timing |

Unknown fields remain unknown and trigger follow-up, never model-generated values. No technical suitability or safety guarantee is inferred from incomplete requirements.

## UI and error behavior
S01 overview, S02 lead detail, S03 customer, S04 quote, S05 handoff, S06 support, S07 assistant follow the supporting UX specification. Every screen requires loading, empty, error, denied and success states. Editors retain unsaved safe drafts on transient failures; they do not claim persistence before confirmed success. Conflict views show current saved version and local draft only after access is rechecked. Language switches preserve the business record and technical identifiers.

Field validation is shown next to the field and in an accessible summary. Server errors use safe messages and correlation IDs; no stack traces. Buttons reflect pending actions and suppress repeat clicks, while backend idempotency remains authoritative. Date/time displays use Asia/Vientiane with explicit timezone when ambiguity exists; storage uses UTC.

## Customer communication and release boundary
The initial pilot is staff-only. Customer portal, automated sending and external channel integrations remain disabled until their own identity/ownership/recipient-authority gates pass. Staff can prepare bilingual reply drafts; the product must distinguish draft, approved and actually dispatched states. Internal notes must never enter customer-visible communications by default.

## Acceptance and traceability
F01–F13 cover R01–R10. QA-001–004 prove access; QA-005–006 language; QA-007–009 knowledge; QA-010–012 intake; QA-013–014 pipeline; QA-015–016 handoffs; QA-017–018 tickets; QA-019–021 quotation; QA-022–024 controlled tools; QA-025–028 audit/durability. Expected and actual results remain separate; all application test outcomes are NOT RUN until implementation exists and is verified.
