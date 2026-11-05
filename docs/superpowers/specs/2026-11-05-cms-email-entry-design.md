# CMS email entry before password login

## Intent

Replace the IP and adviser-managed email allowlist approach with a two-step sign-in that works from any location. An existing CMS user requests a one-time six-digit code at their account email address. The code expires after 10 minutes. Once verified, the user sees the current Payload email/password login. The emailed code does not create a CMS session or change account roles.

## Decisions from the owner

- The code is an entry step before, not a replacement for, Payload email and password login.
- Send one six-digit code, not two values, per sign-in attempt.
- Only existing CMS account emails may receive a code.
- Code lifetime: 10 minutes.
- The production portal should work from any IP.

## Flow

1. An unauthenticated visit to `/admin/login` opens a DK LAO branded access step asking for the CMS account email. The browser stays off the Payload password form until the code is verified.
2. The server accepts the email request, returns the same public response whether or not the account exists, and sends the code only for an existing account. Apply per-address, per-email and overall request limits to protect the mailbox and SMTP service.
3. The user enters the code. Verification is server-side, limits wrong attempts, invalidates the code after use, and sets a short-lived, signed, HTTP-only, Secure, SameSite cookie bound to that account email. A new code supersedes an earlier code.
4. The user is sent to the existing Payload login form, prefilled with the verified email if supported. They enter the existing password. Payload validates the password and, before issuing a session, checks that the signed entry proof is valid, unexpired, unused, and matches the account email. Consume the proof atomically at successful password login.
5. A valid Payload session opens the dashboard as it does today. The 10-minute window limits completion of a new sign-in; it does not shorten an established Payload session. Logout or a new sign-in requires another email code.

## Security boundaries

- Do not issue codes for unknown CMS emails, but do not disclose whether an email exists in public responses.
- Store only a keyed hash of each code, with expiry, attempt count and consumed status. Never log codes or include them in URLs.
- Use one-time, transactional consumption of the entry proof. A password login without matching proof is rejected even if the page or API is called directly.
- Keep Payload's password hashing, user sessions, lockout, roles, and collection permissions intact. The code cannot promote a role or create a user.
- Fail closed if the code store, SMTP, cookie signing, or verification fails. The owner can recover through server administration, not an anonymous bypass.
- Do not send the password or code to another service. Reuse DK LAO's configured SMTP account.

## Rollout

- Replace the `admin-allowlist` collection and login hook introduced in 1.0.0. Preserve the existing user accounts. Drop the unused allowlist table only if it is empty, or retain it without enforcement for a coordinated cleanup.
- Add and test the new code store migration before changing Apache. Deploy to preview, then production while the IP rule remains active.
- Verify a real email arrives, that a correct code plus password opens the dashboard, and that wrong, expired, reused and mismatched codes fail. Then remove the Apache IP restriction for `/admin` and `/api/users` on the live host and clear the proxy cache.
- Keep a rollback path: restore the Apache IP rule before rolling back application code.

## Product presentation

- Keep DK LAO as the only logo. Use the approved BizEra brandkit colours, typography and left/right login composition. The access step should read clearly on mobile and desktop and keep accessible labels, error text and keyboard focus.

## Builder choices

- Reuse the current Next.js 16 and Payload 3.80 application, PostgreSQL, and SMTP configuration.
- Choose an implementation that performs the final proof check in Payload's server-side login operation, not just in a client component or redirect.
- Prefer a dedicated code/proof table with atomic updates over an in-memory store because preview and production each run server processes and sessions must survive process restarts.
