/**
 * Reference clients: the owner-supplied list parses into groups, odd input is tolerated, nothing shows
 * when the fact is empty, and the home page renders the section after the proof strip.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { clientLogo, clientLogos, parseClientGroups } from "./clients";
import { siteFacts } from "./site-facts";

describe("reference clients", () => {
  it("parses the owner's key account list into five groups", () => {
    expect(parseClientGroups(siteFacts.referenceClients)).toEqual([
      { title: "Beverage", names: ["Beerlao", "Coca-Cola", "Heineken", "Pepsi", "Tiger Beer"] },
      { title: "Logistics and power", names: ["DHL", "Lao Freight Forwarder", "NTPC", "PTT", "Savan Logistics"] },
      { title: "Mining and chemical", names: ["MMG", "Phu Bia Mining", "KCL", "5N Plus"] },
      { title: "Others", names: ["Lao Telecom", "Lao Tobacco", "Lao World", "CPF", "Phonesack Group", "HOYA"] },
      { title: "Government", names: ["Ministry of Public Health"] },
    ]);
  });

  it("has a logo file for every mapped client, and every mapped client is in the list", () => {
    const listed = parseClientGroups(siteFacts.referenceClients).flatMap((group) => group.names);

    for (const name of Object.keys(clientLogos)) {
      expect(listed, name).toContain(name);
      expect(existsSync(join(process.cwd(), "public", clientLogo(name)!)), name).toBe(true);
    }
    // Clients without supplied artwork stay as text.
    expect(clientLogo("Unlisted Company")).toBeUndefined();
  });

  it("returns nothing for an empty or unset fact", () => {
    for (const value of [null, undefined, "", "   ", "no colon here"]) expect(parseClientGroups(value), String(value)).toEqual([]);
  });

  it("drops groups without a title or names, and repeated names", () => {
    expect(parseClientGroups(": A, B | Government: | Rental: Beerlao, beerlao, , HOYA")).toEqual([
      { title: "Rental", names: ["Beerlao", "HOYA"] },
    ]);
  });

  it("keeps the first colon as the title break, so names may contain colons", () => {
    expect(parseClientGroups("Rental: Acme: Laos, Beta")).toEqual([{ title: "Rental", names: ["Acme: Laos", "Beta"] }]);
  });

  it("is also shown on the About and Rental pages under the short heading \"Our clients\"", () => {
    const about = readFileSync(join(process.cwd(), "src", "app", "(site)", "about", "page.tsx"), "utf8");
    const rental = readFileSync(join(process.cwd(), "src", "app", "(site)", "forklift-rental", "page.tsx"), "utf8");
    const content = readFileSync(join(process.cwd(), "src", "components", "dklao", "content-page.tsx"), "utf8");

    expect(about).toContain('<TrustedBy title="Our clients" />');
    expect(about.indexOf("<TrustedBy")).toBeGreaterThan(about.indexOf("<CompanySnapshot />"));
    expect(rental).toContain("showClients");
    expect(content).toContain('<TrustedBy title="Our clients" />');
    // Only the rental page asks for it; other content pages do not repeat the clients.
    for (const page of ["contact", "request-quote"]) {
      expect(readFileSync(join(process.cwd(), "src", "app", "(site)", page, "page.tsx"), "utf8")).not.toContain("showClients");
    }
  });

  it("compacts the logo tiles and pills on phones", () => {
    const component = readFileSync(join(process.cwd(), "src", "components", "dklao", "trusted-by.tsx"), "utf8");

    expect(component).toContain("max-[780px]:w-[104px]");
    expect(component).toContain("max-[780px]:text-[0.92rem]");
  });

  it("is shown on the home page right after the proof strip, logos named in their alt text", () => {
    const page = readFileSync(join(process.cwd(), "src", "app", "(site)", "page.tsx"), "utf8");
    const component = readFileSync(join(process.cwd(), "src", "components", "dklao", "trusted-by.tsx"), "utf8");

    expect(page.indexOf("<TrustedBy />")).toBeGreaterThan(page.indexOf("<HomeProof />"));
    expect(component).toContain("return null");
    expect(component).toContain("alt={name}");
  });
});
