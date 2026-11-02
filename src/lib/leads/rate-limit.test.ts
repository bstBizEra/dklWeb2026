/**
 * Per-address limiting for the quote form: a sliding window per address, a retry time when refused,
 * independent budgets for different addresses, and settings read from the environment.
 */
import { describe, expect, it } from "vitest";

import { clientKey, createRateLimiter, rateLimitConfig, sharedClientKey, sharedRateLimitConfig } from "./rate-limit";

const minute = 60_000;

describe("rate limiter", () => {
  it("allows the limit, then refuses with a retry time", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 10 * minute });
    const t0 = 1_000_000;

    expect(limiter.check("a", t0)).toEqual({ allowed: true, remaining: 2, retryAfterSeconds: 0 });
    expect(limiter.check("a", t0 + 1000).remaining).toBe(1);
    expect(limiter.check("a", t0 + 2000).remaining).toBe(0);

    const refused = limiter.check("a", t0 + 3000);
    expect(refused.allowed).toBe(false);
    expect(refused.retryAfterSeconds).toBe(597);
  });

  it("gives each address its own budget", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: minute });

    expect(limiter.check("a", 0).allowed).toBe(true);
    expect(limiter.check("a", 1).allowed).toBe(false);
    expect(limiter.check("b", 2).allowed).toBe(true);
  });

  it("lets an address back in once its oldest request leaves the window", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: minute });

    limiter.check("a", 0);
    limiter.check("a", 30_000);
    expect(limiter.check("a", 59_000).allowed).toBe(false);
    expect(limiter.check("a", 61_000).allowed).toBe(true);
  });

  it("does not count refused requests against the window", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: minute });

    limiter.check("a", 0);
    for (let i = 1; i <= 20; i++) limiter.check("a", i * 1000);
    expect(limiter.check("a", 61_000).allowed).toBe(true);
  });

  it("stays bounded when thousands of addresses show up", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 10 * minute });

    for (let i = 0; i < 6000; i++) limiter.check(`ip-${i}`, i);
    expect(limiter.check("ip-5999", 6001).allowed).toBe(false);
    expect(limiter.check("fresh", 6002).allowed).toBe(true);
  });
});

describe("rate limit settings", () => {
  it("defaults to 5 requests per 10 minutes", () => {
    expect(rateLimitConfig({})).toEqual({ limit: 5, windowMs: 600_000 });
  });

  it("reads limit and window from the environment and ignores bad values", () => {
    expect(rateLimitConfig({ LEAD_RATE_LIMIT: "12", LEAD_RATE_WINDOW_SECONDS: "60" })).toEqual({ limit: 12, windowMs: 60_000 });
    expect(rateLimitConfig({ LEAD_RATE_LIMIT: "0", LEAD_RATE_WINDOW_SECONDS: "abc" })).toEqual({ limit: 5, windowMs: 600_000 });
    expect(rateLimitConfig({ LEAD_RATE_LIMIT: "-3" }).limit).toBe(5);
  });
});

describe("shared bucket settings (requests without an address)", () => {
  it("defaults to 60 requests per the same window, so one visitor cannot close the form for everyone", () => {
    expect(sharedClientKey).toBe("unknown");
    expect(sharedRateLimitConfig({})).toEqual({ limit: 60, windowMs: 600_000 });
  });

  it("reads LEAD_SHARED_RATE_LIMIT, shares the window setting and ignores bad values", () => {
    expect(sharedRateLimitConfig({ LEAD_SHARED_RATE_LIMIT: "200", LEAD_RATE_WINDOW_SECONDS: "60" })).toEqual({ limit: 200, windowMs: 60_000 });
    expect(sharedRateLimitConfig({ LEAD_SHARED_RATE_LIMIT: "0" }).limit).toBe(60);
  });
});

describe("client address", () => {
  const request = (headers: Record<string, string>) => new Request("http://localhost/api/leads/quote", { headers });

  it("uses the address nginx saw (X-Real-IP), else one shared bucket", () => {
    expect(clientKey(request({ "x-real-ip": "192.0.2.7" }))).toBe("192.0.2.7");
    expect(clientKey(request({ "x-real-ip": "2001:db8::7" }))).toBe("2001:db8::7");
    expect(clientKey(request({}))).toBe("unknown");
  });

  it("ignores forwarding headers a visitor can make up", () => {
    const real = { "x-real-ip": "192.0.2.7" };
    expect(clientKey(request({ ...real, "x-forwarded-for": "203.0.113.9" }))).toBe("192.0.2.7");
    expect(clientKey(request({ ...real, "x-vercel-forwarded-for": "198.51.100.4" }))).toBe("192.0.2.7");
    expect(clientKey(request({ "x-forwarded-for": "203.0.113.9" }))).toBe("unknown");
  });

  it("trusts CF-Connecting-IP only when the connection came from Cloudflare", () => {
    expect(clientKey(request({ "x-real-ip": "192.0.2.7", "cf-connecting-ip": "203.0.113.9" }))).toBe("192.0.2.7");
    expect(clientKey(request({ "x-real-ip": "172.70.1.2", "cf-connecting-ip": "203.0.113.9" }))).toBe("203.0.113.9");
    expect(clientKey(request({ "x-real-ip": "2606:4700::1", "cf-connecting-ip": "2001:db8::9" }))).toBe("2001:db8::9");
    // From Cloudflare but without a usable visitor address: counted under the Cloudflare address.
    expect(clientKey(request({ "x-real-ip": "172.70.1.2", "cf-connecting-ip": "not-an-ip" }))).toBe("172.70.1.2");
  });

  it("rejects values that are not addresses", () => {
    expect(clientKey(request({ "x-real-ip": "x".repeat(500) }))).toBe("unknown");
    expect(clientKey(request({ "x-real-ip": "192.0.2.7, 10.0.0.1" }))).toBe("unknown");
  });
});
