# API_CONTRACTS.md — DK LAO API Request and Response Standards

## 1. Purpose

This file controls API design, validation, response shape, error handling, and integration standards.

All API contracts must be typed and validation-ready.

## 2. API Principles

APIs must be:

- Predictable
- Typed
- Validated
- Secure
- Version-ready
- Frontend-friendly
- CRM-ready

## 3. Base Response Shape

Success:

```json
{
  "ok": true,
  "data": {},
  "message": "Success"
}
```

Error:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  }
}
```

## 4. Required Lead APIs

```txt
POST /api/leads/quote
POST /api/leads/rental
POST /api/leads/service
POST /api/leads/spare-parts
POST /api/leads/used-equipment
POST /api/leads/cleaning-equipment
POST /api/contact
```

### Built supporting endpoints

```txt
POST /api/csp-report    Browser Content-Security-Policy violation reports (report-uri format, and the
                        Reporting API format). Always 204 with no body. Body cap 16 KB, 20 reports per
                        address per minute; logs one line per distinct violation, no visitor data.
```

Request bodies on public endpoints are read with a byte cap (`src/lib/http/read-body.ts`): a declared
`Content-Length` over the cap is refused without reading, and a streamed body is cut off as soon as it
passes the cap. `POST /api/leads/quote` allows 20,000 bytes and answers an oversized body with 400
`VALIDATION_ERROR`, as before.

## 5. Validation Rules

All public API inputs must be validated for:

```txt
Required fields
String length
Phone format
Email format if provided
Allowed enum values
File type and size if upload exists
Spam/rate-limit checks
```

## 6. Error Codes

```txt
VALIDATION_ERROR
AUTH_REQUIRED
FORBIDDEN
NOT_FOUND
RATE_LIMITED
UPLOAD_REJECTED
INTEGRATION_FAILED
INTERNAL_ERROR
```

## 7. Security Rules

- Do not expose stack traces.
- Do not expose internal CRM errors to customers.
- Log enough for operations, not secrets.
- Rate-limit public endpoints.
- Sanitize uploaded filenames.
