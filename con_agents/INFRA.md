# INFRA.md — DK LAO Infrastructure and Operations Control Rules

## 1. Purpose

This file controls infrastructure direction for hosting, domains, runtime, storage, database, monitoring, backups, and operational readiness.

## 2. Infrastructure Principles

Infrastructure must be:

- Reliable
- Secure
- Maintainable
- Cost-aware
- Easy to deploy
- Ready for CRM, rental, service, inventory, billing, and maintenance expansion

## 3. Recommended Runtime Options

```txt
Frontend-first hosting for Phase 1
VPS full-stack runtime for more control
Docker/Podman-ready deployment for controlled infrastructure
Managed database where practical
```

## 4. Storage Rules

Use structured storage for:

```txt
Product images
Service request photos
Spare-parts inquiry photos
Catalog PDFs/spec sheets
CMS images
```

Uploads must be protected by `SECURITY.md`.

## 5. Backup Rules

Back up:

```txt
Database
Uploaded files
Environment configuration records
CMS content
```

## 6. Domain and SSL Rules

- Production must use HTTPS.
- Redirect HTTP to HTTPS.
- Configure canonical domain.
- Protect admin domain/path.

## 7. Future Operations Readiness

Infrastructure must be able to support:

```txt
Customer portal
Admin dashboard
Technician workflow
Rental fleet movement
Service scheduling
Inventory operations
Billing integration
```
