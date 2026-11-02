# OBSERVABILITY.md — DK LAO Logging, Monitoring, Metrics, and Alert Rules

## 1. Purpose

This file controls operational visibility for DK LAO website and platform behavior.

Observability must help the team understand availability, performance, form conversion, and operational errors.

## 2. What to Monitor

Minimum monitoring:

```txt
Website uptime
Page load errors
API errors
Public form submission success/failure
Email or CRM webhook delivery
Upload failures
Server resource usage when applicable
Database connection health when applicable
```

## 3. Business Metrics

Track:

```txt
Quote requests
Rental inquiries
Service bookings
Spare-parts inquiries
Used forklift inquiries
Cleaning equipment recommendation requests
CTA click rate
Form abandonment if available
```

## 4. Log Structure

Recommended fields:

```txt
timestamp
environment
requestId
route
method
statusCode
leadType
errorCode
processingTimeMs
```

## 5. Alert Conditions

Alert when:

```txt
Website is down
Forms fail repeatedly
CRM/email webhook fails
API error rate rises
Database connection fails
Upload failures spike
```

### Built alerts (since 0.23.0)

`src/lib/ops/alert.ts` raises `lead.all_failed` (critical), `lead.not_in_cms`, `lead.email_failed`,
`lead.webhook_failed`, `ratelimit.store_failed` and `ratelimit.no_address`. Each is logged as
`[alert] <severity> <kind> [<leadId>]` and, when configured, sent to `OPS_ALERT_WEBHOOK_URL` (signed with
`OPS_ALERT_WEBHOOK_SECRET`) and `OPS_ALERT_EMAIL`, at most once per kind per 15 minutes with a count of the
ones held back. Alerts carry the lead reference and a short reason only, never customer details. "Website is
down" needs an external uptime monitor: the app cannot report its own absence. Setup:
`docs/deploy-checklist.md` section 9.

## 6. Privacy Rule

Do not log sensitive customer details unless required for operations. Never log secrets.
