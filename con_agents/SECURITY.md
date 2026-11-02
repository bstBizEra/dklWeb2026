# SECURITY.md — DK LAO Form, Data, Admin, Upload, and Privacy Rules

## 1. Purpose

This file controls security requirements for public forms, admin tools, integrations, uploads, logs, environment variables, and customer data.

## 2. Security Principles

Agents must follow:

- Least privilege
- Secure by default
- Validate all inputs
- Never expose secrets
- Protect customer data
- Restrict public uploads
- Keep admin access private
- Log only what is necessary

## 3. Secret Rules

Never commit:

```txt
API keys
Database passwords
SMTP credentials
Webhook secrets
Session secrets
JWT secrets
Cloud storage credentials
Payment credentials
```

## 4. Public Form Protection

All public forms must have:

```txt
Server-side validation
Rate limiting
Spam protection
Safe error messages
Input length limits
Optional honeypot or captcha depending on spam risk
```

## 5. Upload Protection

If photo upload is enabled:

```txt
Allow only approved image/PDF types
Limit file size
Scan or validate file signature where possible
Sanitize filenames
Store outside executable paths
Do not expose private storage paths
```

## 6. Admin Protection

Admin routes must require authentication.

Admin access must be role-based when multiple users are added.

### Content-Security-Policy

Every response carries a Content-Security-Policy built in `src/lib/security-headers.ts`: own origin only,
no plugins (`object-src 'none'`), no framing by other sites, `base-uri` and `form-action` limited to the
site, and no `unsafe-eval` in production builds. `'unsafe-inline'` stays for scripts (Next.js page data,
JSON-LD) and styles (GSAP) until nonces are worth giving up static pages.

Rollout: since 0.22.0 the policy is sent as `Content-Security-Policy-Report-Only`. Browsers report what it
would block to `POST /api/csp-report`, which logs `[csp] <directive> blocked <origin> on <path>` once per
distinct violation (no query strings or script samples). Switching `cspMode` to `"enforce"` is its own
reviewed release, after the reports from the preview, including `/admin`, have been reviewed. Do not add a
third-party origin to the site without adding it to the policy in the same change.

## 7. Logging Rules

Log:

```txt
Timestamp
Endpoint
Status
Lead type
Error code
Correlation ID
```

Do not log:

```txt
Passwords
Full tokens
Raw secrets
Private customer notes unless operationally required
```

## 8. Privacy Rule

Collect only data needed for quotation, rental, service, spare parts, or contact workflows.
