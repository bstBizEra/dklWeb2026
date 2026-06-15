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

## 6. Privacy Rule

Do not log sensitive customer details unless required for operations. Never log secrets.
