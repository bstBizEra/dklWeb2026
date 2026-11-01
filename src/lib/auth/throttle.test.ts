/**
 * Requester-side limits on Payload's login and forgot-password endpoints (2026-11-02 audit). Payload counts
 * failed logins only on the target account, so without these any caller could keep an account locked, and
 * every forgot-password request sent an email through the SMTP account the lead emails share.
 */
import { beforeEach, describe, expect, it } from "vitest";

import { authThrottle, resetAuthThrottle } from "./throttle";

const hit = (path: string, ip = "203.0.113.10", method = "POST") =>
  authThrottle(new Request(`http://localhost${path}`, { method, headers: { "x-real-ip": ip } }));

beforeEach(() => resetAuthThrottle());

describe("authThrottle", () => {
  it("refuses an address after 10 login attempts in 15 minutes, before the account lock (20) can trip", () => {
    for (let i = 0; i < 10; i++) expect(hit("/api/users/login")).toBeNull();

    const refused = hit("/api/users/login");
    expect(refused?.status).toBe(429);
    expect(Number(refused?.headers.get("Retry-After"))).toBeGreaterThan(0);
    // Another address is not affected.
    expect(hit("/api/users/login", "198.51.100.7")).toBeNull();
  });

  it("allows 3 forgot-password requests an hour per address", () => {
    for (let i = 0; i < 3; i++) expect(hit("/api/users/forgot-password")).toBeNull();
    expect(hit("/api/users/forgot-password")?.status).toBe(429);
  });

  it("caps reset emails at 30 an hour across all addresses, so the lead emails' SMTP quota is safe", async () => {
    for (let i = 0; i < 30; i++) expect(hit("/api/users/forgot-password", `203.0.113.${i + 1}`)).toBeNull();

    const refused = hit("/api/users/forgot-password", "198.51.100.99");
    expect(refused?.status).toBe(429);
    // Payload's error shape, so the admin screen shows the message.
    expect((await refused?.json()).errors[0].message).toMatch(/try again/i);
  });

  it("leaves every other REST call alone", () => {
    for (let i = 0; i < 20; i++) {
      expect(hit("/api/users/me", undefined, "GET")).toBeNull();
      expect(hit("/api/pages")).toBeNull();
      expect(hit("/api/users/logout")).toBeNull();
    }
  });

  it("gives requests without an address one larger shared budget instead of 10", () => {
    for (let i = 0; i < 60; i++) expect(authThrottle(new Request("http://localhost/api/users/login", { method: "POST" }))).toBeNull();
    expect(authThrottle(new Request("http://localhost/api/users/login", { method: "POST" }))?.status).toBe(429);
  });
});
