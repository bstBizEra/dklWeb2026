import {
  createRateLimiter,
  rateLimitConfig,
  sharedClientKey,
  sharedRateLimitConfig,
  type RateLimiter,
} from "@/lib/leads/rate-limit";

// One limiter per server instance, created on first use so the environment is read at request time.
let limiter: RateLimiter | undefined;
// Requests with no usable visitor address share one bucket, with its own larger budget.
let sharedLimiter: RateLimiter | undefined;
let warnedNoAddress = false;

export function leadLimiter(): RateLimiter {
  limiter ??= createRateLimiter(rateLimitConfig());
  return limiter;
}

function sharedLeadLimiter(): RateLimiter {
  sharedLimiter ??= createRateLimiter(sharedRateLimitConfig());
  return sharedLimiter;
}

// The limiter for this client key. In production a request without X-Real-IP means the proxy in front of
// the app is not passing the visitor's address: say so once in the log, so the shared bucket is noticed.
export function limiterFor(key: string, env: Record<string, string | undefined> = process.env): RateLimiter {
  if (key !== sharedClientKey) return leadLimiter();
  if (env.NODE_ENV === "production" && !warnedNoAddress) {
    warnedNoAddress = true;
    console.warn(
      "[leads] quote request without a usable X-Real-IP: requests without an address share one limit " +
        "(LEAD_SHARED_RATE_LIMIT). Check that the proxy in front of the app sets X-Real-IP.",
    );
  }
  return sharedLeadLimiter();
}

export function resetLeadLimiter(): void {
  limiter = undefined;
  sharedLimiter = undefined;
  warnedNoAddress = false;
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

export const maxBodyBytes = 20_000;
