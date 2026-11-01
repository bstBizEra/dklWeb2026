// Requester-side limits for Payload's login and forgot-password endpoints. Payload itself only counts
// failed logins on the target account (users.ts: 20 per 15 minutes), so without this any caller who knows
// an email could keep that account locked, and every forgot-password request would send an email through
// the SMTP account the lead emails depend on. Checked in the REST route before Payload sees the request.
// shortcut: counted in memory per server process; move to the database store (lib/leads/rate-store.ts)
// if the host runs several app processes.

import { clientKey, createRateLimiter, sharedClientKey, type RateLimiter } from "@/lib/leads/rate-limit";

const minute = 60 * 1000;
// Requests without a usable address share one bucket, so it gets a larger budget (as for the quote form).
const sharedFactor = 6;

type Rule = { perAddress: RateLimiter; shared: RateLimiter; overall?: RateLimiter };

function rule(limit: number, windowMs: number, overall?: number): Rule {
  return {
    perAddress: createRateLimiter({ limit, windowMs }),
    shared: createRateLimiter({ limit: limit * sharedFactor, windowMs }),
    overall: overall ? createRateLimiter({ limit: overall, windowMs }) : undefined,
  };
}

let rules: Record<string, Rule> = {};

export function resetAuthThrottle(): void {
  rules = {
    // Fewer than the 20 failures that lock an account, so one address cannot lock anyone out.
    login: rule(10, 15 * minute),
    // Each request sends a reset email; the overall cap keeps the SMTP quota for lead emails.
    "forgot-password": rule(3, 60 * minute, 30),
  };
}
resetAuthThrottle();

// A 429 in Payload's error shape when the request is over a limit, otherwise null (let Payload handle it).
export function authThrottle(request: Request): Response | null {
  if (request.method !== "POST") return null;
  const action = new URL(request.url).pathname.match(/^\/api\/users\/(login|forgot-password)\/?$/)?.[1];
  if (!action) return null;

  const { perAddress, shared, overall } = rules[action];
  const key = clientKey(request);
  const result = (key === sharedClientKey ? shared : perAddress).check(key);
  const total = result.allowed && overall ? overall.check("all") : result;
  if (total.allowed) return null;

  return Response.json(
    { errors: [{ message: "Too many attempts. Please wait a few minutes and try again." }] },
    { status: 429, headers: { "Retry-After": String(total.retryAfterSeconds) } },
  );
}
