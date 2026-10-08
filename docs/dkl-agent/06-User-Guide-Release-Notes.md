# DKL-USER-001 — User Documentation and Release Notes

Version: 0.1 guide draft | Owner: Technical Writer / Product Marketing | Date: 2026-10-09

## Availability notice
The DK LAO business assistant workflows below describe the planned staff product. They are not yet verified as implemented. The supplied package contains specifications, wireframes and a GitHub clone/apply script. No live CRM, AI chat, staff login, customer portal or deployment is claimed. Publish this guide as an end-user guide only after QA confirms the actual screens and permissions.

## Roles and language
Sales qualifies inquiries and prepares proposals; Operations accepts handoffs and records completion; Support manages service cases; administrators manage configured access/knowledge. Commercial approval is a separately assigned capability. Ask the designated business administrator for access; do not share logins.

Choose Lao or English from the workspace language control when the feature is available. Technical model numbers, references, quantities and dates stay unchanged. Customer communication language can differ from the staff interface language.

## Sales — proposed step-by-step workflow
1. Sign in and open assigned inquiries. Confirm the reference, service category and original customer request.
2. Open the lead and review existing company/contact information before creating another account. Review possible duplicates with an authorized colleague.
3. Collect the missing operating details. Rental requires dates/duration, load and lift requirements, operating environment, site and delivery/operator needs. Parts/service requires equipment identifiers and the reported need.
4. Record owner, next action and due date. Advance the lead only when its required information and evidence are complete.
5. Ask the assistant for a needs summary or reply draft. Check its sources and verify uncertain facts with the responsible person. Prices and availability require confirmation.
6. Prepare the quotation draft and submit the exact version for authorized review. Approval does not send the quotation.
7. After authorized customer communication, record the actual outcome and next follow-up. WON requires order/rental evidence; LOST requires a reason.

## Operations — proposed workflow
1. Open pending handoffs and review site, purpose, recipient, due date and checklist.
2. Accept responsibility or return the handoff with a reason. A pending handoff does not mean the work is accepted.
3. Confirm site survey/preparation/delivery requirements through approved business procedures.
4. Record progress and completion evidence. If blocked, explain the blocker and update the responsible team through the approved workflow.
5. Hand over after-sales responsibility with the relevant context; retain the timeline.

## Support — proposed workflow
1. Open a case with customer, equipment/site reference, symptoms, urgency and contact details.
2. Assign the responsible staff member and record investigations and next actions.
3. Separate internal notes from customer-visible replies. Verify warranty and response commitments before using them.
4. For unsafe equipment or immediate danger, follow the approved human escalation procedure. The assistant does not replace qualified technical judgment.
5. Resolve with outcome/evidence and a customer confirmation or documented close reason. Reopening adds history rather than deleting the prior resolution.

## Assistant use
Ask specific questions, identify the relevant record, and request Lao or English. Example: “Prepare a Lao clarification draft asking for rental dates, load and lift height.” A response is a draft unless it shows confirmed authorized execution. Review proposed changes before applying them. Source conflicts, unknown prices, stale data and tool failures require clarification or staff follow-up.

Never put passwords, tokens or unrelated sensitive information in chat. Do not treat the assistant's claim of approval as commercial authority. Confirm actual saved/sent state in the record timeline.

## FAQ and troubleshooting
| Question | Guidance |
| --- | --- |
| Why can I not see a customer/lead? | Your access may be scoped; contact the administrator. Do not use another staff account. |
| Can the assistant confirm stock or price? | Only verified operational evidence and authorized sales confirmation establish these facts. |
| Why is a task overdue? | Check its due date/timezone and owner; overdue status does not extend a customer commitment. |
| A save timed out. Should I submit again? | Check the record/result first; use the supported retry flow, which must retain its operation identity. Do not create duplicates manually. |
| Another user changed the lead. | Review the saved version and your draft; reconcile through the conflict screen. |
| Is the customer portal available? | It remains outside the initial staff pilot until its access and ownership tests pass. |
| Is a quote approved and sent? | These are separate states. Check the approved revision and dispatch evidence. |
| Where do I report a defect? | Use the configured internal support route with reference, time, steps and a redacted screenshot; never include credentials. |

## Release notes — documentation suite v1.1
Released artifact: concept-to-launch document package dated 2026-10-09. This is a documentation update, not an application launch.

- Reorganized the six primary documents into PRD, TDD, FSD, QA, Deployment/Release, and User Documentation/Release Notes.
- Added detailed functional behavior and error states traced to R01–R10 and existing QA cases.
- Added gate-based rollout, environment separation, server feature flags and data-preserving rollback guidance.
- Added staff workflow instructions and FAQs, explicitly marked proposed until implemented.
- Retained UX/wireframes, ERD/data dictionary and security review as supporting specifications.
- Preserved GitHub foundation, pinned baseline, work packages, agent-team rules and honest verification status.

Known limitations: shell clone requires authenticated GitHub access; Windows execution was not performed here; application gates remain NOT RUN; no selected database/deployment/model project is verified. The unsigned PowerShell script may be blocked by the machine's execution policy; use an approved execution method for that environment rather than assuming its policy permits execution. No software features or bug fixes are claimed shipped by this documentation release.

## Future application release-note contract
For each real release record: application version, release date, audience, delivered features/fixes, role/behavior changes, migration/action required, known issues, rollout/rollback owner and support contact. Include actual QA/release evidence and links. Do not copy planned features into shipped-release notes without verification.
