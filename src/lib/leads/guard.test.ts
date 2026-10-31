/**
 * Where the quote-form limit is counted: in the database when there is one (shared by every process), in
 * memory otherwise or when forced; and when the database store fails, the request is still limited, from
 * memory, and an ops alert is raised instead of the form failing.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const raiseAlert = vi.fn(async () => "throttled" as const);
vi.mock("@/lib/ops/alert", () => ({ raiseAlert: (...args: unknown[]) => raiseAlert(...(args as [])) }));

const query = vi.fn();
const getCms = vi.fn(async () => ({ db: { pool: { query } } }));
vi.mock("@/lib/cms/client", () => ({ getCms: () => getCms() }));

const { checkLeadLimit, rateStore, resetLeadLimiter } = await import("./guard");

const db = { DATABASE_URL: "postgresql://x@127.0.0.1/db", LEAD_RATE_LIMIT: "2" };

beforeEach(() => {
  resetLeadLimiter();
  query.mockReset();
  raiseAlert.mockClear();
  getCms.mockClear();
  vi.stubEnv("LEAD_RATE_LIMIT", "2");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("rate limit store choice", () => {
  it("uses the database when there is one, memory otherwise or when forced", () => {
    expect(rateStore({ DATABASE_URL: "postgresql://x" })).toBe("database");
    expect(rateStore({ DATABASE_URL: " " })).toBe("memory");
    expect(rateStore({ DATABASE_URL: "postgresql://x", LEAD_RATE_STORE: "memory" })).toBe("memory");
  });
});

describe("checkLeadLimit", () => {
  it("counts in the database through Payload's own pool", async () => {
    query.mockResolvedValue({ rows: [{ current: 3, previous: 0 }] });

    const result = await checkLeadLimit("203.0.113.1", db);

    expect(result.allowed).toBe(false);
    expect(query.mock.calls[0][1][0]).toBe("lead:203.0.113.1");
  });

  it("keeps the shared bucket apart from per-address buckets in the database", async () => {
    query.mockResolvedValue({ rows: [{ current: 1, previous: 0 }] });
    await checkLeadLimit("unknown", db);
    expect(query.mock.calls[0][1][0]).toBe("lead-shared:unknown");
  });

  it("limits from memory and raises an alert when the database store fails", async () => {
    query.mockRejectedValue(new Error("ECONNREFUSED"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const results = [];
    for (let i = 0; i < 3; i++) results.push((await checkLeadLimit("203.0.113.2", db)).allowed);

    // Still limited (LEAD_RATE_LIMIT 2), from memory.
    expect(results).toEqual([true, true, false]);
    expect(raiseAlert).toHaveBeenCalledWith("ratelimit.store_failed", { reason: "Error" });
    // Logged once, not once per request.
    expect(warn.mock.calls.filter(([line]) => String(line).includes("store failed"))).toHaveLength(1);
  });

  it("retries the database after a failed setup instead of giving up for good", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    getCms.mockRejectedValueOnce(new Error("starting"));
    query.mockResolvedValue({ rows: [{ current: 1, previous: 0 }] });

    await checkLeadLimit("203.0.113.3", db);
    await checkLeadLimit("203.0.113.3", db);

    expect(getCms).toHaveBeenCalledTimes(2);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("never touches the database without one", async () => {
    await checkLeadLimit("203.0.113.4", { LEAD_RATE_LIMIT: "2" });
    expect(getCms).not.toHaveBeenCalled();
  });

  it("alerts once in production when requests arrive without an address", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await checkLeadLimit("unknown", { NODE_ENV: "production" });
    await checkLeadLimit("unknown", { NODE_ENV: "production" });
    expect(raiseAlert).toHaveBeenCalledTimes(1);
    expect(raiseAlert).toHaveBeenCalledWith("ratelimit.no_address");
  });
});
