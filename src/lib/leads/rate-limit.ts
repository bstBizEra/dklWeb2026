// Per-address request limiting for the quote form. A sliding window held in memory: it stops a single
// address from flooding the form, and it costs nothing to run. On serverless hosting each instance keeps
// its own count, so treat it as a first line of defence and put a shared store (or the host's firewall)
// behind it before a real launch. Nothing here stores an address beyond the window.

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };
export type RateLimiter = { check: (key: string, now?: number) => RateLimitResult };
export type RateLimitConfig = { limit: number; windowMs: number };

const defaults: RateLimitConfig = { limit: 5, windowMs: 10 * 60 * 1000 };
const maxKeys = 5000;

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// LEAD_RATE_LIMIT requests per LEAD_RATE_WINDOW_SECONDS per address. Defaults: 5 per 10 minutes.
export function rateLimitConfig(env: Record<string, string | undefined> = process.env): RateLimitConfig {
  return {
    limit: positiveInt(env.LEAD_RATE_LIMIT, defaults.limit),
    windowMs: positiveInt(env.LEAD_RATE_WINDOW_SECONDS, defaults.windowMs / 1000) * 1000,
  };
}

export function createRateLimiter(config: RateLimitConfig = defaults): RateLimiter {
  const hits = new Map<string, number[]>();

  function prune(now: number) {
    for (const [key, times] of hits) {
      const fresh = times.filter((time) => now - time < config.windowMs);
      if (fresh.length === 0) hits.delete(key);
      else if (fresh.length !== times.length) hits.set(key, fresh);
    }
  }

  return {
    check(key, now = Date.now()) {
      if (hits.size >= maxKeys) {
        prune(now);
        // Still full of live keys: drop the oldest ones rather than grow without bound.
        for (const oldest of hits.keys()) {
          if (hits.size < maxKeys) break;
          hits.delete(oldest);
        }
      }

      const times = (hits.get(key) ?? []).filter((time) => now - time < config.windowMs);

      if (times.length >= config.limit) {
        hits.set(key, times);
        return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((times[0] + config.windowMs - now) / 1000)) };
      }

      times.push(now);
      hits.set(key, times);
      return { allowed: true, remaining: config.limit - times.length, retryAfterSeconds: 0 };
    },
  };
}

// The visitor's address as the host reports it. Behind a proxy the first entry of X-Forwarded-For is the
// client. Requests with no address at all share one bucket, so they are limited too.
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  const first = forwarded?.split(",")[0]?.trim().slice(0, 64);
  return first || "unknown";
}
