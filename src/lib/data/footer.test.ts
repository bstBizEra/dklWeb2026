/**
 * Footer link groups, the footer layout, and the phone rules that keep links tappable and headlines short.
 * The footer must list every published page exactly once, in a few named groups instead of one long list.
 * Layout rules live in the components' Tailwind classes, so the checks read the component source.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { en as enMessages } from "@/messages/en";
import { lo as loMessages } from "@/messages/lo";

import { footerGroups, footerRoutes, orderFooterChannels } from "./footer";
import { contactChannels, siteFacts } from "./site-facts";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), "src", ...parts), "utf8").replace(/\r\n/g, "\n");
const css = read("app", "(site)", "globals.css");
const source = read("components", "dklao", "industrial-footer.tsx");

describe("footer groups", () => {
  it("lists every published page exactly once", () => {
    const listed = footerGroups().flatMap((group) => group.links.map((link) => link.id));

    expect([...listed].sort()).toEqual(footerRoutes().map((route) => route.id).sort());
    expect(new Set(listed).size).toBe(listed.length);
  });

  it("uses four short, named groups instead of one long list", () => {
    const groups = footerGroups();

    expect(groups.map((group) => group.title)).toEqual([
      "Rent & buy",
      "Service & parts",
      "Warehouse & cleaning",
      "Company & guides",
    ]);
    for (const group of groups) expect(group.links.length, group.title).toBeLessThanOrEqual(6);
  });

  it("links only published pages and never Home or the conversion pages", () => {
    for (const link of footerGroups().flatMap((group) => group.links)) {
      expect(link.published, link.id).toBe(true);
      expect(["home", "quote", "contact"]).not.toContain(link.id);
    }
  });
});

describe("phone rules", () => {
  it("makes footer, card, breadcrumb and contact links at least 40px tall on phones", () => {
    // Footer group links and the BizEra credit grow to 40px below 760px.
    expect(source.match(/max-\[760px\]:min-h-10/g)?.length).toBeGreaterThanOrEqual(2);
    expect(read("components", "dklao", "service-card.tsx")).toMatch(/service-card__link[^"]*max-\[760px\]:min-h-10/);
    // Breadcrumb and contact-table links, and the FAQ question rows.
    // Only on phones (below 760px): on desktop the rows keep their original height.
    expect(read("components", "dklao", "content-page.tsx").match(/max-\[760px\]:min-h-10/g)?.length).toBeGreaterThanOrEqual(3);
    expect(read("components", "ui", "accordion.tsx")).toContain("min-h-12");
  });

  it("sets hero and section headlines smaller on phones", () => {
    expect(read("components", "dklao", "content-page.tsx")).toContain("max-[560px]:text-[clamp(1.6rem,7.3vw,1.95rem)]");
    expect(read("components", "ui", "section.tsx")).toContain("max-[560px]:text-[1.6rem]");
  });
});

describe("footer redesign", () => {
  it("keeps the required ownership line and the three lead actions", () => {
    for (const text of ["siteFooterMetadata.version", "siteFooterMetadata.developerUrl"]) {
      expect(source).toContain(text);
    }

    // The words themselves come from the page's language, so the source holds keys, never English.
    for (const key of ["requestQuote", "advisor", "siteSurvey"]) {
      expect(source).toMatch(new RegExp(`>\\s*\\{t\\.${key}\\}\\s*</Link>`));
    }
  });

  it("writes every footer and floating-action word in the page's language", () => {
    const floating = read("components", "dklao", "floating-contact-actions.tsx");
    for (const [file, text] of [
      [source, "Talk to us"],
      [source, "Footer lead actions"],
      [source, "Footer contact channels"],
      [source, "Footer social links"],
      [source, "Copyright © DK LAO"],
      [source, "Develop by:"],
      [floating, "Quick contact actions"],
      [floating, "Request a DK LAO quote"],
      [floating, "Contact DK LAO advisor"],
    ] as const) {
      expect(file).not.toContain(text);
    }

    for (const [en, lo] of [
      [enMessages.footer, loMessages.footer],
      [enMessages.floatingActions, loMessages.floatingActions],
    ]) {
      for (const key of Object.keys(en)) {
        expect((lo as Record<string, string>)[key], key).not.toBe((en as Record<string, string>)[key]);
      }
    }
  });

  it("takes brand marks from the simple-icons package, never hand-drawn, and hides decorative icons", () => {
    expect(source).toContain('from "simple-icons"');
    for (const mark of ["siWhatsapp", "siFacebook", "siYoutube", "siX"]) expect(source).toContain(mark);
    expect(source).toContain('from "lucide-react"');
    expect(source).not.toMatch(/<img|emoji/i);
    expect(source.match(/aria-hidden="true"/g)?.length).toBeGreaterThanOrEqual(2);
    // Icon-only social links carry their name for screen readers.
    expect(source).toContain("aria-label={channel.label}");
  });

  it("separates the contact layer from the links layer, with the links below", () => {
    expect(source.indexOf("industrial-footer__contact")).toBeLessThan(source.indexOf("industrial-footer__links"));
    expect(source.indexOf("industrial-footer__links")).toBeLessThan(source.indexOf("industrial-footer__meta"));
  });

  it("uses short link wording that stays unique inside each group", () => {
    for (const group of footerGroups()) {
      const labels = group.links.map((link) => link.label);

      expect(new Set(labels).size, group.title).toBe(labels.length);
      for (const label of labels) expect(label.length, label).toBeLessThanOrEqual(18);
    }
  });

  it("shows the address only from the confirmed fact", () => {
    expect(source).toContain("facts.address ?");
  });

  it("puts the filled Request a Quote first on a phone and pairs the contact chips two by two", () => {
    expect(source).toMatch(/industrial-footer__cta[^"]*max-\[640px\]:order-first/);
    expect(source).toContain("max-[640px]:flex-[1_1_calc(50%_-_12px)]");
    // The two emails take a full row each, after the numbers.
    expect(source).toContain("max-[640px]:order-1 max-[640px]:basis-full");
  });

  it("orders the contact chips two per row: Phone | Email, Sales | Email, then the Aftersales numbers", () => {
    const labels = orderFooterChannels(contactChannels(siteFacts).filter((channel) => !["Facebook", "YouTube", "X"].includes(channel.label))).map(
      (channel) => channel.label,
    );

    expect(labels).toEqual(["Phone", "Email", "WhatsApp Sales", "Email", "WhatsApp Aftersales", "WhatsApp Aftersales"]);
    // A missing channel never drops the others.
    expect(orderFooterChannels([{ label: "WhatsApp Sales" }, { label: "Email" }, { label: "Phone" }, { label: "Zalo" }]).map((c) => c.label)).toEqual([
      "Phone",
      "Email",
      "WhatsApp Sales",
      "Zalo",
    ]);
  });

  it("keeps the address on one line on desktop and wraps it on small screens", () => {
    expect(source).toContain("whitespace-nowrap text-white/85 max-[900px]:whitespace-normal");
  });

  it("shows a transparent forklift cut-out level with the contact chips, decorative and hidden on small screens", () => {
    const image = readFileSync(join(process.cwd(), "public", "images", "hero", "toyota-35-50-forklift-cutout.webp"));

    // WebP with an alpha channel: a VP8X chunk whose alpha flag (0x10) is set.
    expect(image.subarray(0, 4).toString()).toBe("RIFF");
    expect(image.subarray(12, 16).toString()).toBe("VP8X");
    expect(image[20] & 0x10).toBe(0x10);
    expect(image.length).toBeLessThan(200_000);
    expect(source).toContain('src="/images/hero/toyota-35-50-forklift-cutout.webp"');
    expect(source).toMatch(/industrial-footer__photo [^"]*" aria-hidden="true"/);
    expect(source).toContain('alt=""');
    expect(source).toContain("grid-cols-[minmax(0,1fr)_340px]");
    expect(source).toMatch(/industrial-footer__photo col-start-2 row-start-2[^"]*max-\[900px\]:hidden/);
  });

  it("flows each layer in from the left and right on scroll down and back out on scroll up, with GSAP, unless motion is reduced", () => {
    const motion = read("components", "dklao", "footer-motion.tsx");

    expect(motion.startsWith('"use client"')).toBe(true);
    expect(motion).toContain("registerPlugin(ScrollTrigger, useGSAP)");
    expect(motion).toContain('toggleActions: "play none none reverse"');
    // The layers travel; they never fade. A faded link is a link whose text is not there yet, and the
    // chips carry the phone numbers: scrolling past them showed them at 0.5 opacity for a few hundred ms.
    expect(motion).not.toMatch(/opacity:\s*0\b/);
    expect(motion).toMatch(/\{ x \}/);
    expect(motion).toContain("from(layer.left, -distance)");
    expect(motion).toContain("from(layer.right, distance)");
    expect(motion).toContain("(prefers-reduced-motion: no-preference)");
    // Reduced motion: no travel, and since nothing fades either, the footer simply stands still.
    expect(motion).toContain("(prefers-reduced-motion: reduce)");
    expect(motion).toContain("context.conditions?.reduced ? 0 : 90");
    expect(motion).toContain("mm.revert()");
    // Re-measures after a resize, once scrolling has stopped (behaviour: refresh-when-idle.test.ts).
    expect(motion).toContain("refreshWhenIdle(() => ScrollTrigger.refresh())");
    // Every selector the motion targets exists in the footer markup.
    for (const selector of motion.match(/\.industrial-footer__[a-z-]+/g) ?? []) {
      expect(source, selector).toContain(selector.slice(1));
    }

    expect(source).toContain("<FooterMotion>");
    expect(motion).toContain('className="industrial-footer overflow-x-clip');
  });

  it("always ends the footer motion fully visible and in place, whatever a refresh does mid-tween", () => {
    const motion = read("components", "dklao", "footer-motion.tsx");

    // from() reads its end state off the page; a mid-tween refresh left layers at opacity 0 or 90px off-screen.
    expect(motion).not.toMatch(/timeline\.from\(/);
    expect(motion).toContain("timeline.fromTo(");
    expect(motion).toContain("{ x: 0,");
    // Animated chips must not also have a CSS transform transition.
    expect(source).toMatch(/const pressableChip = "transition-\[background-color,border-color\]/);
  });

  it("makes the social marks at least 44px round buttons", () => {
    expect(source).toContain("inline-grid size-11 place-items-center rounded-full");
  });

  it("has the thin brand rule, honours reduced motion and keeps no footer rules in the stylesheet", () => {
    expect(source).toContain("industrial-footer__rule h-[3px]");
    expect(source.match(/motion-reduce:transition-none/g)?.length).toBeGreaterThanOrEqual(1);
    expect(css).not.toContain(".industrial-footer");
  });
});
