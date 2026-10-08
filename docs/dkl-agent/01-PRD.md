# DKL-PRD-001 — DK LAO Business Assistant

Version: 0.1 • Status: proposed implementation baseline • Owner: Product Manager • Date: 2026-10-08

## 1. Product outcome and source authority

Give DK LAO sales, operations and support staff a shared Lao–English workspace that converts inquiries into accountable follow-up and after-sales service. Preserve the existing public website and build on `bstBizEra/dklWeb2026`, commit `29057c6435f65c3f8448532c094f9604542b43d8`, rather than introducing a replacement application.

Repository inspection reported a Next.js website with `/`, `/about`, a Zod-validated public `POST /api/leads/quote`, and local JSONL lead storage. Staff authentication, durable CRM and the assistant are proposed additions. The supplied 2026 page summary describes `/rental`, `/forklifts` and other links; these routes are not verified in the inspected commit. Do not mark them delivered from the summary alone.

Evidence inputs: supplied `2024_DKL Solution and Products.pdf`; supplied `20260618_pages_summary_UpdateDate-18062026.md`; inspected canonical repository revision. The six initial catalog lines are equipment sales, rental, maintenance, spare parts, warehouse solutions and cleaning equipment. Other 2024 offerings require a current business-owner decision. Published historical copy is not authority for live stock, prices, warranty or maintenance inclusions.

## 2. Business goals

1. Reduce lost inquiries by making ownership, next action and due date mandatory when staff accept a lead.
2. Improve conversion through requirements capture, supported recommendations and related-service proposals.
3. Make departmental handoffs visible, with acceptance and completion evidence.
4. Retain customers through support history, maintenance follow-up and rental renewal reminders.
5. Provide consistent Lao and English assistance based on approved knowledge.

The assistant is a staff copilot first. An external customer conversation surface is a later controlled extension. It may draft actions; it must not independently grant discounts, promise availability, approve credit, accept contracts or send outbound messages without the applicable authorization.

## 3. Personas and access boundaries

| Persona | Job and value | Initial access |
|---|---|---|
| Sales representative | Qualify inquiries; manage own opportunities and follow-ups | Assigned accounts, leads and tasks; authorized catalog |
| Sales manager | Allocate leads and review pipeline and proposals | Team records, reassignment and quotation approval within configured authority |
| Operations coordinator | Arrange survey, equipment preparation and delivery | Accepted handoff records and necessary customer/site details |
| Service/support staff | Triage cases and coordinate maintenance | Assigned cases, relevant assets and customer history |
| Business administrator | Configure users, roles, knowledge and workflows | Configuration and audit review; separate from unrestricted business approval |
| Customer, later phase | Request advice and see own case status | Own authorized records only; never staff notes or other customers |

Role titles do not themselves confer permissions. Server-side policy defines scope. Operations needs the contact and delivery address for a delivery handoff, not unrestricted commercial notes or every lead.

## 4. Scope and requirement acceptance

Foundation constraint F01 applies to every requirement: installation begins with the pinned canonical clone; existing verified pages, public lead contract and baseline tests are preserved; route discrepancies remain documented. The six-document suite and work packages must use the same R01–R10 mapping below.

| ID | Requirement | Acceptance criteria |
|---|---|---|
| R01 | Staff identity and scoped access | Authenticated active membership and server authorization protect every private route. Role/resource and organization isolation tests deny access without leaking records; account administration is separate from commercial approval. |
| R02 | Bilingual interaction | Staff choose Lao or English and switch during a session. Names, model numbers, quantities, dates and IDs survive translation; competent Lao review verifies meaning and rendering. |
| R03 | Verified knowledge | Sources have owner, version/review date, verification state and access scope. Only approved eligible material grounds answers; citations identify versions; unknown price/stock triggers clarification or handoff. |
| R04 | Lead intake and CRM records | Preserve the existing public quote contract; server assigns initial status and timestamps. Authorized staff manage accounts/contacts and qualified lead records with source provenance; duplicate candidates are reviewed, never silently merged. |
| R05 | Sales pipeline | Allowed transitions and required qualification fields are checked server-side; concurrent updates do not silently overwrite; WON requires approved order/rental evidence. |
| R06 | Follow-up and handoff | Accepted leads have an owner, next action and due date. Handoffs specify recipient, purpose and checklist; recipient can accept or return with reason. Overdue work is visible. |
| R07 | Support workflow | Staff open and assign a ticket with urgency, equipment/site details and evidence; resolve with a completion note; reopening preserves history. Immediate danger invokes approved emergency handoff. |
| R08 | Quotation drafts and approval | Unconfirmed prices, stock and specifications are explicit. Only configured authority approves an exact immutable quote version; approval does not automatically dispatch or bind a contract. |
| R09 | Controlled agent actions | Authenticated actor, validated parameters, resource checks, idempotency and audit protect every action. The model drafts/recommends; actual authorized execution is separately recorded. |
| R10 | Audit and operational reporting | Dashboard shows lead aging, overdue actions and support backlog with scoped definitions/denominators. Audit records actor/time/action/result. No synthetic data is labeled live. |

## 5. End-to-end business flows

**Sales:** inquiry → triage → qualification → quotation draft → commercial review → customer follow-up → won/lost decision → operations handoff. A won record requires evidence/reference to the approved order or rental arrangement; CRM status alone does not create an enforceable contract.

**Operations:** receive handoff → accept or return → schedule site survey/preparation/delivery → record execution → close checklist → transfer after-sales responsibility. External ERP and inventory integrations remain future work; initial references are explicit manual links.

**Support:** request → triage → assign → investigate → service proposal if required → work completion → customer confirmation or documented close reason → reopen/renewal follow-up. Warranty entitlement and chargeable work require verification.

Related-service suggestions: sale → maintenance/parts; rental → delivery/operator inquiry and renewal; warehouse survey → racking/material handling/cleaning assessment. Treat each as an assessed option, not automatic inclusion in a package.

## 6. Metrics and proposed targets

No baseline has been measured. Targets below are pilot hypotheses, evaluated after two weeks of recorded use; the owner may revise them before release.

| Indicator | Definition | Pilot target |
|---|---|---|
| Assigned lead completeness | Accepted leads with owner + next action + due date / accepted leads | ≥95% |
| First response timeliness | Eligible inquiries with first staff response within configured business-hour SLA / eligible inquiries | ≥90%; SLA decided by owner |
| Follow-up completion | Follow-ups completed by due date / due follow-ups | ≥90% |
| Assistant factual quality | Reviewed grounded answers with no unsupported material claim / reviewed grounded answers | ≥95%, with zero approved fabricated price/stock commitments |
| Language adequacy | Reviewed Lao/English samples passing meaning and readability rubric / samples | ≥90% in each language |
| Access isolation | Negative authorization cases correctly denied | 100% of release-gate cases |

Conversion and support resolution time are tracked before targets are committed. Exclude test records, define business hours and disclose denominator/sample size.

## 7. Delivery phases and release gates

| Phase | Deliverable | Exit gate |
|---|---|---|
| P0 — foundation | Pinned clone, baseline checks, agreed source map, six-document suite, authority matrix | Source/route discrepancies recorded; no secrets in artifacts; existing verification result recorded |
| P1 — internal pilot | Staff auth, scoped CRM, intake mapping, tasks, ticketing, approved knowledge and bilingual assistant | R01–R07 and R09 security and functional cases pass; restore/retry checks pass; Lao sample reviewed by competent reviewer |
| P2 — commercial workflow | Quotation approval, accepted handoffs, reporting and pilot metrics | R08/R10 acceptance; approved business authorities configured; staff UAT signed off |
| P3 — controlled customer extension | Customer identity, own-case access, channel integrations and renewal automation | Customer isolation, consent/outbound policy and channel failure tests pass before launch |

Non-goals for P1: full ERP, autonomous pricing, inventory truth, credit underwriting, accounting, payments, predictive scoring and autonomous outbound campaigns.

## 8. Decisions still required and assumptions

The Windows destination is `C:\laragon\www\dklAgent`; the current remote environment cannot write directly to that machine. Apply the prepared overlay only after a real canonical clone. Repository access, Supabase project, Vercel project, model credentials and deployment environment must be verified; placeholders are not provisioned infrastructure.

Owner decisions: pilot staff and record scopes; business-hour SLA; commercial approval limits; retention/deletion policy; Lao terminology reviewer; authoritative stock/pricing system; permission to use customer data with the selected model provider. These block their dependent production behavior, not local documented preparation.

## 9. Requirement traceability

FSD behavior is defined in `03-Functional-Specification.md`; architecture/contracts in `02-Technical-Design.md`; detailed UX and schema in `supporting/`; security review is a supporting release gate. QA cases are in `04-QA-Test-Plan.md`; production procedure in document 05; usage and truthful release notes in document 06. Every work package references requirement IDs and executable acceptance conditions. Proposed documentation is not evidence that features exist.
