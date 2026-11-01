/**
 * The shared (database) rate limiter's arithmetic, with the database replaced: the previous window counts
 * in proportion to how much of it is still inside the sliding window, a refused request gets the time to
 * the next window, a slow database is treated as a failure, and old rows are cleared now and then.
 * src/lib/leads/rate-store.db.test.ts runs the same limiter against a real PostgreSQL.
 */
import { describe, expect, it, vi } from "vitest";

import { createDatabaseRateLimiter, type Queryable } from "./rate-store";

const minute = 60_000;
const config = { limit: 5, windowMs: 10 * minute };

function fakeDb(current: number, previous: number) {
  const query = vi.fn<Queryable["query"]>(async (text) => (text.includes("DELETE") ? { rows: [] } : { rows: [{ current, previous }] }));
  return { query };
}

describe("database rate limiter", () => {
  it("allows up to the limit in a fresh window", async () => {
    const start = 10 * config.windowMs;
    expect((await createDatabaseRateLimiter(fakeDb(5, 0), config).check("a", start)).allowed).toBe(true);
    expect((await createDatabaseRateLimiter(fakeDb(6, 0), config).check("a", start)).allowed).toBe(false);
  });

  it("weights the previous window by how much of it is still inside the sliding window", async () => {
    const start = 10 * config.windowMs;
    // 6 in the previous window, 2 now. Just after the boundary nearly all 6 still count: refused.
    expect((await createDatabaseRateLimiter(fakeDb(2, 6), config).check("a", start + minute)).allowed).toBe(false);
    // 8 of 10 minutes later only 20% of them count: 1.2 + 2 = 3.2, allowed.
    const late = await createDatabaseRateLimiter(fakeDb(2, 6), config).check("a", start + 8 * minute);
    expect(late.allowed).toBe(true);
    expect(late.remaining).toBe(1);
  });

  it("tells a refused client when the current window ends", async () => {
    const start = 10 * config.windowMs;
    const result = await createDatabaseRateLimiter(fakeDb(9, 0), config).check("a", start + 7 * minute);
    expect(result).toEqual({ allowed: false, remaining: 0, retryAfterSeconds: 180 });
  });

  it("sends the bucket, the window start and the previous window start", async () => {
    const db = fakeDb(1, 0);
    const now = 10 * config.windowMs + 3 * minute;
    await createDatabaseRateLimiter(db, config, { prefix: "lead" }).check("203.0.113.9", now);

    const [, values] = db.query.mock.calls[0];
    expect(values).toEqual(["lead:203.0.113.9", new Date(10 * config.windowMs), new Date(9 * config.windowMs)]);
  });

  it("treats a database that does not answer in time as a failure", async () => {
    const slow: Queryable = { query: () => new Promise(() => {}) };
    await expect(createDatabaseRateLimiter(slow, config, { prefix: "lead", timeoutMs: 20 }).check("a")).rejects.toThrow(/timed out/);
  });

  it("clears windows older than the previous one every so often", async () => {
    const db = fakeDb(1, 0);
    const limiter = createDatabaseRateLimiter(db, config, { prefix: "lead", cleanupEvery: 3 });
    const now = 10 * config.windowMs;
    for (let i = 0; i < 6; i++) await limiter.check("a", now);

    const deletes = db.query.mock.calls.filter(([text]) => text.includes("DELETE"));
    expect(deletes).toHaveLength(2);
    // Only its own buckets: the login and reset limiters use other windows in the same table.
    expect(deletes[0][1]).toEqual([new Date(9 * config.windowMs), "lead:%"]);
  });
});
