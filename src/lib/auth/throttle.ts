// Requester-side limits for Payload's login and forgot-password endpoints. Payload itself only counts
// failed logins on the target account (users.ts: 20 per 15 minutes), so without this any caller who knows
// an email could keep that account locked, and every forgot-password request would send an email through
// the SMTP account the lead emails depend on. Checked in the REST route before Payload sees the request.
// Counted in the database when there is one (table lead_rate_limits, shared by every server process), as
// the quote form is (lib/leads/guard.ts); when the database store fails, the request is limited from memory.

import { cmsPool, rateStore } from "@/lib/leads/guard";
import { clientKey, createRateLimiter, sharedClientKey, type RateLimitResult } from "@/lib/leads/rate-limit";
import { createDatabaseRateLimiter, type AsyncRateLimiter, type Queryable } from "@/lib/leads/rate-store";

const minute = 60 * 1000;
// Requests without a usable address share one bucket, so it gets a larger budget (as for the quote form).
const sharedFactor = 6;

type Spec = { limit: number; windowMs: number; overall?: number };
const specs: Record<string, Spec> = {
  // Fewer than the 20 failures that lock an account, so one address cannot lock anyone out.
  login: { limit: 10, windowMs: 15 * minute },
  // Each request sends a reset email; the overall cap keeps the SMTP quota for lead emails.
  "forgot-password": { limit: 3, windowMs: 60 * minute, overall: 30 },
  "entry-request": { limit: 3, windowMs: 10 * minute, overall: 30 },
  "entry-verify": { limit: 10, windowMs: 10 * minute },
};

type Rule = { perAddress: AsyncRateLimiter; shared: AsyncRateLimiter; overall?: AsyncRateLimiter };
type Make = (name: string, limit: number, windowMs: number) => AsyncRateLimiter;

function rules(make: Make): Record<string, Rule> {
  return Object.fromEntries(
    Object.entries(specs).map(([action, { limit, windowMs, overall }]) => [
      action,
      {
        perAddress: make(`auth-${action}`, limit, windowMs),
        shared: make(`auth-${action}-shared`, limit * sharedFactor, windowMs),
        overall: overall ? make(`auth-${action}-all`, overall, windowMs) : undefined,
      },
    ]),
  );
}

const memoryRules = () =>
  rules((_, limit, windowMs) => {
    const limiter = createRateLimiter({ limit, windowMs });
    return { check: async (key) => limiter.check(key) };
  });

async function decide(rule: Rule, key: string): Promise<RateLimitResult> {
  const result = await (key === sharedClientKey ? rule.shared : rule.perAddress).check(key);
  return result.allowed && rule.overall ? rule.overall.check("all") : result;
}

// db: where the shared counts live. Default: the CMS database when rateStore() says so, read per request;
// null forces memory.
export function createAuthThrottle({ db }: { db?: (() => Promise<Queryable>) | null } = {}) {
  const memory = memoryRules();
  let database: Promise<Record<string, Rule>> | undefined;
  let lastWarning = 0;

  return async function authThrottle(request: Request): Promise<Response | null> {
    if (request.method !== "POST") return null;
    const path = new URL(request.url).pathname;
    const action = path.match(/^\/api\/users\/(login|forgot-password)\/?$/)?.[1]
      ?? path.match(/^\/api\/cms-entry\/(request|verify)\/?$/)?.[1]?.replace(/^/, "entry-");
    if (!action) return null;

    const key = clientKey(request);
    const entryAction = action.startsWith("entry-");
    const pool = db === undefined ? (entryAction || rateStore() === "database" ? cmsPool : null) : db;
    let result: RateLimitResult;

    if (pool) {
      try {
        database ??= pool().then((store) => rules((name, limit, windowMs) => createDatabaseRateLimiter(store, { limit, windowMs }, { prefix: name })));
        result = await decide((await database)[action], key);
      } catch (error) {
        // A failed setup is retried on the next request instead of being cached.
        database = undefined;
        if (entryAction) return Response.json({ error: "Entrance key is temporarily unavailable" }, { status: 503 });
        if (Date.now() - lastWarning > 60_000) {
          lastWarning = Date.now();
          console.warn(`[auth] shared rate-limit store failed (${error instanceof Error ? error.name : "error"}); limiting from memory`);
        }
        result = await decide(memory[action], key);
      }
    } else {
      result = await decide(memory[action], key);
    }

    if (result.allowed) return null;
    return Response.json(
      { errors: [{ message: "Too many attempts. Please wait a few minutes and try again." }] },
      { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
    );
  };
}

export const authThrottle = createAuthThrottle();
