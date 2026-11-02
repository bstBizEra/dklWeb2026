import {
  createRateLimiter,
  rateLimitConfig,
  sharedClientKey,
  sharedRateLimitConfig,
  type RateLimiter,
  type RateLimitResult,
} from "@/lib/leads/rate-limit";
import { createDatabaseRateLimiter, type AsyncRateLimiter, type Queryable } from "@/lib/leads/rate-store";
import { raiseAlert } from "@/lib/ops/alert";

// In-memory limiters, one per server instance, created on first use so the environment is read at request
// time. They are the whole limit without a database, and the fallback when the database store fails.
let limiter: RateLimiter | undefined;
// Requests with no usable visitor address share one bucket, with its own larger budget.
let sharedLimiter: RateLimiter | undefined;
let databaseLimiters: Promise<{ perAddress: AsyncRateLimiter; shared: AsyncRateLimiter }> | undefined;
let warnedNoAddress = false;
let lastStoreWarning = 0;

export function leadLimiter(): RateLimiter {
  limiter ??= createRateLimiter(rateLimitConfig());
  return limiter;
}

function sharedLeadLimiter(): RateLimiter {
  sharedLimiter ??= createRateLimiter(sharedRateLimitConfig());
  return sharedLimiter;
}

// Where the quote-form limit is counted. "database" (the default when DATABASE_URL is set) is shared by
// every server process; "memory" counts per process. LEAD_RATE_STORE=memory forces memory.
export type RateStore = "database" | "memory";

export function rateStore(env: Record<string, string | undefined> = process.env): RateStore {
  if (env.LEAD_RATE_STORE?.trim() === "memory") return "memory";
  return env.DATABASE_URL?.trim() ? "database" : "memory";
}

// The Postgres adapter's own connection pool: no second pool next to Payload's. Also used by lib/auth/throttle.ts.
export async function cmsPool(): Promise<Queryable> {
  const { getCms } = await import("@/lib/cms/client");
  const cms = await getCms();
  const pool = (cms.db as unknown as { pool?: Queryable }).pool;
  if (!pool) throw new Error("no database pool");
  return pool;
}

async function loadDatabaseLimiters() {
  const pool = await cmsPool();
  return {
    perAddress: createDatabaseRateLimiter(pool, rateLimitConfig(), { prefix: "lead" }),
    shared: createDatabaseRateLimiter(pool, sharedRateLimitConfig(), { prefix: "lead-shared" }),
  };
}

// Checks the quote-form limit for one client key. Never throws: if the database store fails, this request
// is limited from memory instead, logged at most once a minute and raised as an ops alert.
export async function checkLeadLimit(key: string, env: Record<string, string | undefined> = process.env): Promise<RateLimitResult> {
  const shared = key === sharedClientKey;

  // In production a request without X-Real-IP means the proxy in front of the app is not passing the
  // visitor's address: say so once, so the shared bucket is noticed.
  if (shared && env.NODE_ENV === "production" && !warnedNoAddress) {
    warnedNoAddress = true;
    console.warn(
      "[leads] quote request without a usable X-Real-IP: requests without an address share one limit " +
        "(LEAD_SHARED_RATE_LIMIT). Check that the proxy in front of the app sets X-Real-IP.",
    );
    void raiseAlert("ratelimit.no_address");
  }

  const memory = shared ? sharedLeadLimiter() : leadLimiter();
  if (rateStore(env) === "memory") return memory.check(key);

  try {
    databaseLimiters ??= loadDatabaseLimiters();
    const limiters = await databaseLimiters;
    return await (shared ? limiters.shared : limiters.perAddress).check(key);
  } catch (error) {
    // A failed setup is retried on the next request instead of being cached.
    databaseLimiters = undefined;
    const reason = error instanceof Error ? error.name : "error";
    if (Date.now() - lastStoreWarning > 60_000) {
      lastStoreWarning = Date.now();
      console.warn(`[leads] shared rate-limit store failed (${reason}); limiting from memory`);
    }
    void raiseAlert("ratelimit.store_failed", { reason });
    return memory.check(key);
  }
}

export function resetLeadLimiter(): void {
  limiter = undefined;
  sharedLimiter = undefined;
  databaseLimiters = undefined;
  warnedNoAddress = false;
  lastStoreWarning = 0;
}

// A real visitor never sees or fills this field. A bot that fills every input does.
export const honeypotField = "homepageUrl";

export function isBotSubmission(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const value = (body as Record<string, unknown>)[honeypotField];
  return typeof value === "string" && value.trim().length > 0;
}

// The trap field is for detection only: it never goes on to storage or notification.
export function withoutHoneypot<T extends object>(data: T): Omit<T, typeof honeypotField> {
  const copy = { ...data } as Record<string, unknown>;
  delete copy[honeypotField];
  return copy as Omit<T, typeof honeypotField>;
}

// Bytes, not characters. A full request in Lao (3 bytes per character) stays far below this.
export const maxBodyBytes = 20_000;
