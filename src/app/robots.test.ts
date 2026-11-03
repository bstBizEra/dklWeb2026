/**
 * Only the live address is indexable. Every other host the app is served from — the preview, a future
 * staging name — must answer Disallow: / and name itself, so it cannot compete with www.dklao.com.
 */
import { afterEach, describe, expect, it } from "vitest";

import robots, { dynamic } from "./robots";

afterEach(() => {
  delete process.env.APP_URL;
});

describe("robots", () => {
  it("lets the live site be indexed, apart from the admin and the API", () => {
    process.env.APP_URL = "https://www.dklao.com";

    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
      sitemap: "https://www.dklao.com/sitemap.xml",
      host: "https://www.dklao.com",
    });
  });

  it("keeps the preview out of search results and names itself, not the live site", () => {
    process.env.APP_URL = "https://preview.dklao.com";

    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
      sitemap: "https://preview.dklao.com/sitemap.xml",
      host: "https://preview.dklao.com",
    });
  });

  it("reads a trailing slash on APP_URL as the live site, so the real site stays indexable", () => {
    process.env.APP_URL = "https://www.dklao.com/";

    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
      sitemap: "https://www.dklao.com/sitemap.xml",
      host: "https://www.dklao.com",
    });
  });

  it("falls back to the live site when APP_URL is unset", () => {
    expect(robots()).toMatchObject({ rules: { allow: "/" }, host: "https://www.dklao.com" });
  });

  it("is built per request, so the instance's APP_URL reaches it without a rebuild", () => {
    expect(dynamic).toBe("force-dynamic");
  });
});
