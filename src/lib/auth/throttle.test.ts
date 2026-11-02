/**
 * Requester-side limits on Payload's login and forgot-password endpoints (2026-11-02 audit). Payload counts
 * failed logins only on the target account, so without these any caller could keep an account locked, and
 * every forgot-password request sent an email through the SMTP account the lead emails share.
 * The counts live in the database when there is one, so several server processes share them; when the
 * database store fails, the request is limited from memory instead.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Queryable } from "@/lib/leads/rate-store";

import { createAuthThrottle } from "./throttle";

type Throttle = ReturnType<typeof createAuthThrottle>;

const request = (path: string, ip: string | null = "203.0.113.10", method = "POST") =>
  new Request(`http://localhost${path}`, { method, headers: ip ? { "x-real-ip": ip } : {} });

// One lead_rate_limits table in memory, answering the store's upsert like PostgreSQL does.
function sharedTable(): Queryable {
  const hits = new Map<string, number>();
  return {
    async query(text, values) {
      if (text.includes("DELETE")) return { rows: [] };
      const [bucket, start, previous] = values as [string, Date, Date];
      const key = `${bucket}|${start.getTime()}`;
      hits.set(key, (hits.get(key) ?? 0) + 1);
      return { rows: [{ current: hits.get(key), previous: hits.get(`${bucket}|${previous.getTime()}`) ?? 0 }] };
    },
  };
}

describe("authThrottle (in memory)", () => {
  let throttle: Throttle;
  const hit = (path: string, ip?: string | null, method?: string) => throttle(request(path, ip, method));

  beforeEach(() => {
    throttle = createAuthThrottle({ db: null });
  });

  it("refuses an address after 10 login attempts in 15 minutes, before the account lock (20) can trip", async () => {
    for (let i = 0; i < 10; i++) expect(await hit("/api/users/login")).toBeNull();

    const refused = await hit("/api/users/login");
    expect(refused?.status).toBe(429);
    expect(Number(refused?.headers.get("Retry-After"))).toBeGreaterThan(0);
    // Another address is not affected.
    expect(await hit("/api/users/login", "198.51.100.7")).toBeNull();
  });

  it("allows 3 forgot-password requests an hour per address", async () => {
    for (let i = 0; i < 3; i++) expect(await hit("/api/users/forgot-password")).toBeNull();
    expect((await hit("/api/users/forgot-password"))?.status).toBe(429);
  });

  it("caps reset emails at 30 an hour across all addresses, so the lead emails' SMTP quota is safe", async () => {
    for (let i = 0; i < 30; i++) expect(await hit("/api/users/forgot-password", `203.0.113.${i + 1}`)).toBeNull();

    const refused = await hit("/api/users/forgot-password", "198.51.100.99");
    expect(refused?.status).toBe(429);
    // Payload's error shape, so the admin screen shows the message.
    expect((await refused?.json()).errors[0].message).toMatch(/try again/i);
  });

  it("leaves every other REST call alone", async () => {
    for (let i = 0; i < 20; i++) {
      expect(await hit("/api/users/me", undefined, "GET")).toBeNull();
      expect(await hit("/api/pages")).toBeNull();
      expect(await hit("/api/users/logout")).toBeNull();
    }
  });

  it("gives requests without an address one larger shared budget instead of 10", async () => {
    for (let i = 0; i < 60; i++) expect(await hit("/api/users/login", null)).toBeNull();
    expect((await hit("/api/users/login", null))?.status).toBe(429);
  });
});

describe("authThrottle (database store)", () => {
  it("shares one count between two server processes: the 11th login across both is refused", async () => {
    const table = sharedTable();
    // Two throttles with separate state stand in for two processes on one database.
    const first = createAuthThrottle({ db: async () => table });
    const second = createAuthThrottle({ db: async () => table });

    const results = [];
    for (let i = 0; i < 11; i++) results.push((await (i % 2 ? second : first)(request("/api/users/login")))?.status ?? 200);

    expect(results.slice(0, 10)).toEqual(Array(10).fill(200));
    expect(results[10]).toBe(429);
  });

  it("shares the overall reset cap between processes too", async () => {
    const table = sharedTable();
    const [first, second] = [createAuthThrottle({ db: async () => table }), createAuthThrottle({ db: async () => table })];
    for (let i = 0; i < 30; i++) expect(await (i % 2 ? second : first)(request("/api/users/forgot-password", `203.0.113.${i + 1}`))).toBeNull();
    expect((await first(request("/api/users/forgot-password", "198.51.100.99")))?.status).toBe(429);
  });

  it("falls back to memory when the database store fails, and still limits", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const throttle = createAuthThrottle({ db: async () => ({ query: async () => Promise.reject(new Error("connection refused")) }) });

    for (let i = 0; i < 10; i++) expect(await throttle(request("/api/users/login"))).toBeNull();
    expect((await throttle(request("/api/users/login")))?.status).toBe(429);
    // Logged once, not on every request.
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
