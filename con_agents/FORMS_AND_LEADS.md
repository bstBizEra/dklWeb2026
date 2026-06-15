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
