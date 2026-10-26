import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";
import { contactPage, localizePage, requestQuotePage } from "@/lib/data/pages";
import { getRoute } from "@/lib/data/routes";
import { sitemapPageList, sitemapPagesFor } from "@/lib/data/sitemap-pages";
import { en } from "@/messages/en";
import { lo } from "@/messages/lo";

import { alternatePath, isLocale, localeOf, localizeHref, stripLocale } from "./index";
import { localeAlternates } from "./metadata";
import { localize } from "./localize";

describe("localizeHref", () => {
  it("prefixes internal site paths for Lao and keeps query and hash", () => {
    expect(localizeHref("/", "lo")).toBe("/lo");
    expect(localizeHref("/about", "lo")).toBe("/lo/about");
    expect(localizeHref("/request-quote?category=rental&from=/x", "lo")).toBe("/lo/request-quote?category=rental&from=/x");
    expect(localizeHref("/?a=1", "lo")).toBe("/lo?a=1");
    expect(localizeHref("/forklift-rental#faq", "lo")).toBe("/lo/forklift-rental#faq");
  });

  it("leaves English, external, special and file links alone", () => {
    for (const href of [
      "https://www.bizera.la/",
      "//cdn.example.com/x",
      "tel:+85621480248",
      "mailto:info@dklao.com",
      "#quote-request",
      "/api/leads/quote",
      "/admin",
      "/app",
      "/app?install",
      "/app/request",
      "/og/home",
      "/images/logo/Logo-H_Text.svg",
      "/favicon.ico?v=1",
      "/lo/about",
    ]) {
      expect(localizeHref(href, "lo"), href).toBe(href);
    }
    expect(localizeHref("/about", "en")).toBe("/about");
  });

  it("does not mistake a page that starts like a reserved path", () => {
    expect(localizeHref("/applications", "lo")).toBe("/lo/applications");
    expect(localizeHref("/local", "lo")).toBe("/lo/local");
  });
});

describe("locale paths", () => {
  it("strips the prefix and finds the counterpart page", () => {
    expect(stripLocale("/lo")).toBe("/");
    expect(stripLocale("/lo/about")).toBe("/about");
    expect(stripLocale("/en/about")).toBe("/about");
    expect(stripLocale("/about")).toBe("/about");
    expect(stripLocale("/local")).toBe("/local");
    expect(alternatePath("/about", "lo")).toBe("/lo/about");
    expect(alternatePath("/lo/industries/manufacturing", "en")).toBe("/industries/manufacturing");
    expect(alternatePath("/", "lo")).toBe("/lo");
    expect(localeOf("/lo/about")).toBe("lo");
    expect(localeOf("/local")).toBe("en");
    expect(isLocale("lo")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("gives each page a canonical and hreflang links", () => {
    expect(localeAlternates("/about", "lo")).toEqual({
      canonical: "/lo/about",
      languages: { en: "/about", lo: "/lo/about", "x-default": "/about" },
    });
    expect(localeAlternates("/", "en").canonical).toBe("/");
  });
});

describe("proxy", () => {
  const run = (path: string) => proxy(new NextRequest(new URL(path, "https://www.dklao.com")));

  it("rewrites English to /en, redirects /en away and passes Lao", () => {
    expect(run("/about").headers.get("x-middleware-rewrite")).toBe("https://www.dklao.com/en/about");
    expect(run("/").headers.get("x-middleware-rewrite")).toBe("https://www.dklao.com/en");
    const redirect = run("/en/about?x=1");
    expect(redirect.status).toBe(308);
    expect(redirect.headers.get("location")).toBe("https://www.dklao.com/about?x=1");
    expect(run("/en").headers.get("location")).toBe("https://www.dklao.com/");
    expect(run("/lo/about").headers.get("x-middleware-rewrite")).toBeNull();
    expect(run("/lo/about").headers.get("location")).toBeNull();
  });

  it("never touches the API, admin, phone app or share images", () => {
    for (const path of ["/api/leads/quote", "/admin", "/admin/collections/pages", "/app", "/app/request", "/og/home"]) {
      const response = run(path);
      expect(response.headers.get("x-middleware-rewrite"), path).toBeNull();
      expect(response.headers.get("location"), path).toBeNull();
    }
  });
});

describe("localize", () => {
  const enData = {
    id: "rental",
    title: "Forklift Rental",
    href: "/forklift-rental",
    items: [
      { title: "One", routeId: "rental", count: 3 },
      { title: "Two", routeId: "sales" },
    ],
  };

  it("merges text by key and arrays by index, keeping English where Lao is missing", () => {
    const merged = localize(enData, { title: "ເຊົ່າລົດຍົກ", items: [{}, { title: "ສອງ" }] });
    expect(merged).toEqual({ ...enData, title: "ເຊົ່າລົດຍົກ", items: [enData.items[0], { title: "ສອງ", routeId: "sales" }] });
  });

  it("never changes ids, links, non-text values or the shape", () => {
    const merged = localize(enData, {
      id: "x",
      href: "/x",
      items: [{ routeId: "x", count: 9 } as never, {}, { title: "extra" }],
      extra: "dropped",
    } as never);
    expect(merged).toEqual(enData);
  });

  it("treats an empty Lao string as missing", () => {
    expect(localize({ title: "Hello" }, { title: "  " })).toEqual({ title: "Hello" });
    expect(localize(enData, undefined)).toBe(enData);
  });
});

describe("messages and built-in content", () => {
  // serverErrors is a free-form record: English leaves it empty on purpose, Lao lists the codes it translates.
  const shape = (value: unknown): unknown =>
    value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, v]) => [key, key === "serverErrors" ? "record" : shape(v)])) : typeof value;

  it("Lao interface text has every English key", () => {
    expect(shape(lo)).toEqual(shape(en));
  });

  it("Lao pages keep English for anything not translated yet, with the same ids and links", () => {
    const strip = (value: unknown): unknown =>
      Array.isArray(value) ? value.map((v) => (typeof v === "string" ? "text" : strip(v))) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, typeof v === "string" && !["id", "href", "routeId", "fact", "kind"].includes(k) ? "text" : strip(v)])) : value;

    for (const page of [requestQuotePage, contactPage, ...sitemapPageList]) {
      expect(strip(localizePage(page, "lo")), page.id).toEqual(strip(page));
    }
    expect(localizePage(contactPage, "lo").h1).toBe("ຕິດຕໍ່ DK LAO");
    expect(localizePage(contactPage, "en")).toBe(contactPage);
    expect(Object.keys(sitemapPagesFor("lo"))).toEqual(Object.keys(sitemapPagesFor("en")));
    expect(getRoute("about", "lo")?.href).toBe("/about");
  });
});
