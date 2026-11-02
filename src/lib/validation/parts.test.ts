/**
 * The spare parts page's request form (ported from feature/services-all-products, PartsPage).
 * Extra answers become labelled lines in the lead's message; the longest request still fits the leads
 * table's 1200-character message. Photo upload is a later stage, so the request is plain JSON.
 */
import { describe, expect, it } from "vitest";

import { partsRequestSchema, partsToLead } from "./parts";

const minimal = {
  productGroup: "forklift",
  partType: "SPARE_PART",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  preferredContactMethod: "WhatsApp",
  equipmentType: "Counterbalance forklift",
  equipmentBrand: "Toyota",
  partDescription: "Two mast rollers, worn flat on one side.",
  quantity: "2",
  urgency: "NORMAL",
  installationNeed: "NOT_SURE",
  location: "Vientiane",
};

describe("spare parts request", () => {
  it("files the request as a SPARE_PARTS_INQUIRY lead with the product group as its category", () => {
    const lead = partsToLead(partsRequestSchema.parse(minimal));

    expect(lead).toMatchObject({
      leadType: "SPARE_PARTS_INQUIRY",
      equipmentOrServiceCategory: "Forklift parts",
      sourcePage: "/spare-parts",
    });
    expect(lead.message).toContain("Two mast rollers, worn flat on one side.");
    expect(lead.message).toContain("Part type: Spare part");
    expect(lead.message).toContain("Quantity: 2");
    expect(lead.message).toContain("Installation needed: Not sure");
    expect(lead).not.toHaveProperty("status");
  });

  it("marks a stopped machine plainly for the team", () => {
    const lead = partsToLead(partsRequestSchema.parse({ ...minimal, urgency: "MACHINE_STOPPED" }));
    expect(lead.message).toContain("Urgency: Machine stopped");
  });

  it("keeps the longest possible request inside the 1200-character message field", () => {
    const longest = partsRequestSchema.parse({
      ...minimal,
      productGroup: "cleaning",
      partType: "SAFETY_PART",
      preferredContactMethod: "Messenger",
      equipmentType: "x".repeat(80),
      equipmentBrand: "x".repeat(60),
      equipmentModel: "x".repeat(60),
      serialNumber: "x".repeat(60),
      partDescription: "x".repeat(500),
      quantity: "x".repeat(40),
      urgency: "MACHINE_STOPPED",
      installationNeed: "NOT_SURE",
      location: "x".repeat(120),
    });

    expect(partsToLead(longest).message.length).toBeLessThanOrEqual(1200);
  });

  it("refuses over-long or missing answers", () => {
    expect(partsRequestSchema.safeParse({ ...minimal, partDescription: "x".repeat(501) }).success).toBe(false);
    expect(partsRequestSchema.safeParse({ ...minimal, equipmentBrand: "x".repeat(61) }).success).toBe(false);
    expect(partsRequestSchema.safeParse({ ...minimal, quantity: "" }).success).toBe(false);
  });
});
