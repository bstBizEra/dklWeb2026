/**
 * The iPhone app (/app) builds its contacts, map links and service requests from owner-confirmed facts.
 * These tests make sure nothing is invented, that a service request passes the same lead schema as the
 * website form, and that every service in the app opens the right request.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { quoteRequestSchema } from "@/lib/validation/leads";

import {
  appManifest,
  appServiceGroups,
  appStorageKeys,
  clientGroups,
  locationMessage,
  mapLinks,
  messengerHref,
  pinLink,
  quickContacts,
  serviceIssues,
  serviceRequestMessage,
  whatsappWithText,
} from "./mobile-app";
import { siteFacts } from "./site-facts";

describe("iPhone app data", () => {
  it("offers call, WhatsApp sales, WhatsApp service and Messenger, all from site facts", () => {
    const contacts = quickContacts();

    expect(contacts.map((contact) => contact.id)).toEqual(["call", "whatsapp-sales", "whatsapp-service", "messenger"]);
    expect(contacts[0].href).toBe("tel:+85621480248");
    expect(contacts[1].href).toBe("https://wa.me/8562028023355");
    expect(contacts[2].href).toBe("https://wa.me/8562023231922");
    expect(contacts[3].href).toBe("https://m.me/DKLAOonline");
  });

  it("drops a contact whose fact is not confirmed", () => {
    expect(quickContacts({ ...siteFacts, whatsapp: null, facebook: null }).map((contact) => contact.id)).toEqual(["call"]);
    expect(messengerHref(null)).toBeUndefined();
  });

  it("searches the confirmed address in Maps instead of guessing a pin", () => {
    const links = mapLinks();

    expect(links?.apple).toContain(encodeURIComponent("Kamphaengmeuang Rd"));
    expect(links?.google).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
    expect(mapLinks(null)).toBeUndefined();
  });

  it("writes a site pin anyone can open", () => {
    const pin = { latitude: 17.9757, longitude: 102.6331, accuracy: 12.4 };

    expect(pinLink(pin)).toBe("https://www.google.com/maps?q=17.975700,102.633100");
    expect(locationMessage(pin)).toContain("about 12 m");
    expect(whatsappWithText("https://wa.me/1", "a b")).toBe("https://wa.me/1?text=a%20b");
  });

  it("builds a service request the lead API accepts", () => {
    const message = serviceRequestMessage({
      issue: serviceIssues[0],
      machine: "Toyota 8FD25",
      siteAddress: "Warehouse 3, Dongdok",
      pin: { latitude: 18, longitude: 102.6 },
      description: "Will not lift",
    });

    expect(message).toContain("Service needed: Breakdown: machine stopped");
    expect(message).toContain("Site pin: https://www.google.com/maps?q=");
    expect(
      quoteRequestSchema.safeParse({
        leadType: "SERVICE_BOOKING",
        companyName: "Test Co",
        contactPerson: "Test Person",
        phone: "+856 20 1234 5678",
        equipmentOrServiceCategory: "Maintenance service",
        message,
        sourcePage: "/app/request?type=service",
      }).success,
    ).toBe(true);
  });

  it("splits reference clients into one row per group", () => {
    expect(clientGroups().map((group) => group.title)).toEqual(["Beverage", "Logistics and power", "Mining and chemical", "Others", "Government"]);
    expect(clientGroups(null)).toEqual([]);
  });

  it("has a manifest Android can install: own window, 192 and 512 icons, maskable icons, shortcuts inside the app", () => {
    const sizes = (purpose: string) => appManifest.icons.filter((item) => item.purpose === purpose).map((item) => item.sizes);

    expect(appManifest.display).toBe("standalone");
    expect(appManifest.start_url.startsWith(appManifest.scope)).toBe(true);
    expect(sizes("any")).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    expect(sizes("maskable")).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    expect(appManifest.shortcuts.length).toBeGreaterThan(0);
    for (const shortcut of appManifest.shortcuts) expect(shortcut.url.startsWith(appManifest.scope)).toBe(true);
  });

  it("links the manifest with cookies, so a gated preview (ngrok's warning page) still serves it", () => {
    const layout = readFileSync(join(process.cwd(), "src", "app", "(app)", "layout.tsx"), "utf8");

    expect(layout).toMatch(/<link rel="manifest" href="\/app\/manifest\.webmanifest" crossOrigin="use-credentials" \/>/);
    expect(layout).not.toMatch(/^\s*manifest:/m);
  });

  it("shows the footer's ownership, version and developer lines on App info, and clears every saved key", () => {
    const info = readFileSync(join(process.cwd(), "src", "app", "(app)", "app", "info", "page.tsx"), "utf8");
    const helpers = readFileSync(join(process.cwd(), "src", "components", "app", "app-helpers.tsx"), "utf8");

    for (const field of ["copyrightPrefix", "foundedYear", "currentYear", "version", "developerName", "developerUrl"]) expect(info).toContain(`meta.${field}`);
    expect(helpers).toContain("Object.values(appStorageKeys)");
    expect(Object.values(appStorageKeys)).toHaveLength(3);
  });

  it("lists every Solutions service and opens maintenance as a service booking", () => {
    const links = appServiceGroups().flatMap((group) => group.links);

    expect(links).toHaveLength(7);
    expect(links.find((link) => link.href === "/maintenance-service")?.intent).toBe("service");
    expect(links.find((link) => link.href === "/forklift-rental")?.intent).toBe("rental");
    expect(links.find((link) => link.href === "/spare-parts")?.intent).toBe("parts");
  });

  it("links to this site's own pages, not a fixed domain that may still serve the old website", () => {
    for (const page of ["page.tsx", "services/page.tsx", "info/page.tsx"]) {
      const source = readFileSync(join(process.cwd(), "src", "app", "(app)", "app", page), "utf8");
      expect(source, page).not.toContain("https://www.dklao.com");
      expect(source, page).not.toContain("process.env.APP_URL");
    }
  });
});
