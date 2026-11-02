# DATA_MODEL.md — DK LAO Business Entities and Data Rules

## 1. Purpose

This file controls DK LAO business data entities for catalog, rental, service, spare parts, CRM, and future operations.

The model must support Phase 1 lead generation and future Phase 2/3 operational expansion.

## 2. Core Entity Groups

```txt
Catalog
Rental
Sales
Service
Spare Parts
Cleaning Equipment
Warehouse Solutions
Customer CRM
Leads
Contracts
Billing
Maintenance
Content CMS
Admin
```

## 3. Minimum Entities

```txt
Product
ProductCategory
EquipmentType
RentalFleetUnit
UsedEquipmentListing
SparePart
ServiceRequest
QuoteRequest
RentalRequest
Customer
ContactPerson
Industry
Brand
Specification
AttachmentImage
AdminUser
LeadActivity
MaintenanceRecord
Contract
Invoice
ContentPage
KnowledgeArticle
```

## 4. Lead Status Values

```txt
NEW
CONTACTED
QUALIFYING
QUOTATION_PREPARING
QUOTATION_SENT
FOLLOW_UP
WON
LOST
CLOSED
```

## 5. Availability Values

```txt
IN_STOCK
ON_REQUEST
RENTAL_AVAILABLE
RESERVED
SOLD
UNAVAILABLE
```

## 6. Data Rules

- Do not hardcode operational data in UI components.
- Product specs must be editable from data source later.
- Lead source page must be captured.
- Attachments must be linked securely.
- Maintenance records must connect to customer and equipment where available.
- Rental fleet must be separated from general product catalog.

### Operational tables outside Payload collections

```txt
lead_rate_limits   Quote-form rate limit shared by every server process (since 0.23.0).
                   bucket (lead:<address> or lead-shared:unknown), window_start, hits; primary key
                   (bucket, window_start). Rows older than two windows are deleted as the form is used.
                   No customer data. Migration 20261031_120000_lead_rate_limits.
```

## 7. Future Readiness

Data model must remain ready for:

```txt
Rental contracts
Fleet movement tracking
Service scheduling
Spare-parts inventory
Billing and invoice generation
Customer portal
Technician app
Accounting integration
```
