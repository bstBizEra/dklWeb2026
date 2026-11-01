// Quote-form rate limiting that every server process shares, kept in PostgreSQL (table lead_rate_limits,
// migration 20261031_120000_lead_rate_limits). The in-memory limiter in rate-limit.ts keeps its own count
// per process, so two processes (a second instance, a restart mid-window) would each allow the full limit.
//
// Algorithm: a sliding window approximated from two fixed windows, as Cloudflare and others do. The
// current window's count is incremented with one atomic upsert, and the previous window's count is
// weighted by how much of it still falls inside the sliding window:
//     estimate = previous * (1 - elapsed / window) + current
// Unlike the in-memory limiter, a refused request is counted too, so a client that keeps sending stays
// refused instead of getting a new slot every time an old request leaves the window.
//
// Failure: any database error or a reply slower than timeoutMs throws; guard.ts then falls back to the
// in-memory limiter for that request, so a database problem never blocks the quote form.

import type { RateLimitConfig, RateLimitResult } from "@/lib/leads/rate-limit";

export type Queryable = { query: (text: string, values: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> };
export type AsyncRateLimiter = { check: (key: string, now?: number) => Promise<RateLimitResult> };

const upsert = `
  WITH current AS (
    INSERT INTO lead_rate_limits (bucket, window_start, hits) VALUES ($1, $2, 1)
    ON CONFLICT (bucket, window_start) DO UPDATE SET hits = lead_rate_limits.hits + 1
    RETURNING hits
  )
  SELECT current.hits AS current,
         COALESCE((SELECT hits FROM lead_rate_limits WHERE bucket = $1 AND window_start = $3), 0) AS previous
  FROM current`;

// Each limiter clears only its own prefix: the login and reset limiters (lib/auth/throttle.ts) share this
// table with longer windows, and a quote-form cleanup must not wipe their counts.
const cleanup = `DELETE FROM lead_rate_limits WHERE window_start < $1 AND bucket LIKE $2`;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("rate limit store timed out")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function createDatabaseRateLimiter(
  db: Queryable,
  config: RateLimitConfig,
  options: { prefix: string; timeoutMs?: number; cleanupEvery?: number } = { prefix: "lead" },
): AsyncRateLimiter {
  const { prefix, timeoutMs = 1500, cleanupEvery = 50 } = options;
  let calls = 0;

  return {
    async check(key, now = Date.now()) {
      const windowMs = config.windowMs;
      const start = Math.floor(now / windowMs) * windowMs;
      const bucket = `${prefix}:${key}`.slice(0, 200);

      const { rows } = await withTimeout(
        db.query(upsert, [bucket, new Date(start), new Date(start - windowMs)]),
        timeoutMs,
      );
      const current = Number(rows[0]?.current ?? 1);
      const previous = Number(rows[0]?.previous ?? 0);
      const elapsed = now - start;
      const estimate = previous * (1 - elapsed / windowMs) + current;

      // Old windows are cleared now and then by the requests themselves: no cron job to set up.
      calls += 1;
      if (calls % cleanupEvery === 0) {
        void db.query(cleanup, [new Date(start - windowMs), `${prefix}:%`]).catch(() => {});
      }

      if (estimate > config.limit) {
        return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((windowMs - elapsed) / 1000)) };
      }
      return { allowed: true, remaining: Math.max(0, Math.floor(config.limit - estimate)), retryAfterSeconds: 0 };
    },
  };
}
