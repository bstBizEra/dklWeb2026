/**
 * Locale routing. The English rewrite must stay inside the app: Next only rewrites internally when the
 * destination origin matches the origin of the request as it arrived on the socket. Behind the server's
 * nginx and Apache the visitor's request carries X-Forwarded-Proto: https while the app itself listens on
 * plain http, so a destination built from request.nextUrl (which follows that header) looked like another
 * origin. Next then tried to fetch the page from itself over HTTPS, the TLS handshake failed against the
 * plain-http port, and every English page answered 500 while /lo was fine (preview.dklao.com, 2026-11-02:
 * "Failed to proxy https://localhost:3110/en ... wrong version number").
 */
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "./proxy";

// A request as it reaches the app on 127.0.0.1, with the headers the proxy in front adds.
const arriving = (path: string, headers: Record<string, string> = {}) =>
  new NextRequest(new URL(path, "http://127.0.0.1:3110"), { headers: new Headers(headers) });

const forwarded = { host: "preview.dklao.com", "x-forwarded-proto": "https", "x-forwarded-host": "preview.dklao.com" };

const rewriteTarget = (response: Response) => response.headers.get("x-middleware-rewrite");

describe("locale routing", () => {
  // The origin must be the one the request arrived on. Only the running server can show the failure (there
  // request.nextUrl follows X-Forwarded-Proto while the socket is http), so the live check is in
  // docs/deploy-checklist.md; this keeps the rule written down.
  it("rewrites an English page to /en on the origin the request arrived on, not the public one", () => {
    const request = arriving("/about", forwarded);
    const target = rewriteTarget(proxy(request));

    expect(target).not.toBeNull();
    expect(new URL(target!).origin).toBe(new URL(request.url).origin);
    expect(new URL(target!).pathname).toBe("/en/about");
  });

  it("rewrites the home page and keeps the query string", () => {
    const target = rewriteTarget(proxy(arriving("/?utm_source=fb", forwarded)));

    expect(new URL(target!).pathname).toBe("/en");
    expect(new URL(target!).search).toBe("?utm_source=fb");
  });

  it("serves Lao pages as they are", () => {
    expect(rewriteTarget(proxy(arriving("/lo/about", forwarded)))).toBeNull();
  });

  it("sends /en to the unprefixed address, and serves it once the rewrite has marked it", () => {
    const redirect = proxy(arriving("/en/about", forwarded));
    expect(redirect.status).toBe(308);
    expect(new URL(redirect.headers.get("location")!).pathname).toBe("/about");

    const marked = proxy(arriving("/en/about", { ...forwarded, "x-dklao-locale-rewrite": "1" }));
    expect(marked.status).toBe(200);
    expect(rewriteTarget(marked)).toBeNull();
  });

  it("leaves the API, the admin and Next's own paths alone", () => {
    for (const path of ["/api/leads/quote", "/admin", "/app", "/og/x", "/_next/static/a.js"]) {
      expect(rewriteTarget(proxy(arriving(path, forwarded)))).toBeNull();
    }
  });
});
