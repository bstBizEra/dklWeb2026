/**
 * Every page ships the basic browser protections: no content sniffing, no framing by other sites,
 * a safe referrer policy, and no camera, microphone, location or payment access. The headers must
 * also be wired into next.config.ts, so the list cannot be forgotten.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { appPermissionsPolicy, securityHeaders } from "./security-headers";

describe("security headers", () => {
  const byKey = Object.fromEntries(securityHeaders.map((header) => [header.key, header.value]));

  it("sets the four basic protections", () => {
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["Permissions-Policy"]).toMatch(/camera=\(\).*microphone=\(\).*geolocation=\(\)/);
  });

  it("has no duplicate or empty headers", () => {
    expect(new Set(securityHeaders.map((header) => header.key)).size).toBe(securityHeaders.length);
    expect(securityHeaders.every((header) => header.value.length > 0)).toBe(true);
  });

  it("is applied to every path in next.config.ts", () => {
    const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");

    expect(config).toContain("securityHeaders");
    expect(config).toContain('source: "/:path*"');
    expect(config).toContain("poweredByHeader: false");
  });

  it("lets only the /app pages ask for location, same origin only, with camera, mic and payment still off", () => {
    expect(appPermissionsPolicy.key).toBe("Permissions-Policy");
    expect(appPermissionsPolicy.value).toBe("camera=(), microphone=(), geolocation=(self), payment=()");

    // Next applies the later rule for the same header, so the /app rule must come after the site-wide one.
    const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    expect(config.indexOf('source: "/app/:path*"')).toBeGreaterThan(config.indexOf('source: "/:path*"'));
  });
});
