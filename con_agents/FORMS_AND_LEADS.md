# FORMS_AND_LEADS.md — DK LAO Quote, Rental, Service, and Spare-Parts Inquiry Workflows

## 1. Purpose

This file controls all public lead forms, internal lead classification, required fields, validation, statuses, and handoff rules.

The operational layer is central to the DK LAO platform.

## 2. Required Lead Types

```txt
QUOTE_REQUEST
RENTAL_INQUIRY
SERVICE_BOOKING
SPARE_PARTS_INQUIRY
USED_FORKLIFT_INQUIRY
CLEANING_EQUIPMENT_RECOMMENDATION
CONTACT_GENERAL
```

## 3. Universal Lead Fields

```txt
leadType
companyName
contactPerson
phone
email
equipmentOrServiceCategory
message
sourcePage
submissionTimestamp
status
```

## 4. Rental Inquiry Fields

```txt
rentalStartDate
rentalEndDate
rentalPeriod
requiredCapacity
requiredLiftHeight
equipmentType
indoorOrOutdoorUse
workingHoursPerDay
operatorRequired
transportDeliveryRequired
deliveryLocation
```

## 5. Service Booking Fields

```txt
equipmentBrand
equipmentModel
serialNumber
serviceType
problemDescription
onsiteOrWorkshop
preferredDate
photoUpload
```

## 6. Spare-Parts Inquiry Fields

```txt
partType
equipmentBrand
equipmentModel
serialNumber
quantity
urgency
photoUpload
```

## 7. Lead Handoff Rules

After submission:

1. Save or send lead to CRM/email.
2. Notify responsible team.
3. Show customer success message.
4. Store source page.
5. Track lead status.
6. Prepare for follow-up and quotation.

## 8. Success Message Standard

```txt
Thank you. Your request has been received. DK LAO will review your requirement and contact you shortly.
```

## 9. Form QA

- Required fields validate correctly.
- Phone number is required.
- Email is optional unless business process requires it.
- Uploads are restricted.
- Lead type is captured.
- Source page is captured.
- Success and error states are clear.

## 10. Lead Delivery (implemented)

> Added 2026-10-25 by Claude (Motor Agent) at owner request ("send to info@dklao.com"). Extend-only.

Both forms (the website `QuoteRequestForm` on every page that shows it, and the phone app's quote and
service form at `/app/request`) post to `POST /api/leads/quote`, which:

1. Rate-limits per address and drops bot submissions (hidden `homepageUrl` field) with a normal thank-you.
2. Validates with `quoteRequestSchema`; field problems come back per field and are shown on the field.
3. Saves the lead: Payload `leads` collection when `DATABASE_URL` is set, otherwise `data/leads-local.jsonl`.
   If the database cannot be reached, the lead is saved to the local file instead of being lost.
4. Emails the full request to `LEAD_NOTIFY_EMAIL` (default `info@dklao.com`) over SMTP
   (`src/lib/leads/email.ts`), with Reply-To set to the visitor's email when given, and calls the optional
   webhook (`src/lib/leads/notify.ts`). Neither ever fails the request on its own.
5. Answers success with a reference number when the lead was saved or at least one notification reached
   DK LAO. Only when every path fails does the visitor see "Your request could not be sent. Please try
   again, or call or WhatsApp DK LAO.", and the typed details stay in the form.

Email needs these in the hosting provider's environment (see `.env.example`): `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, optional `SMTP_FROM` and `LEAD_NOTIFY_EMAIL`. Without `SMTP_HOST` no email is sent.
After setting them, send one test request from the live site and confirm it arrives at info@dklao.com.
