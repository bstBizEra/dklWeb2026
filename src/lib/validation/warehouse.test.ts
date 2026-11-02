/**
 * The warehouse page's inquiry form (ported from feature/services-all-products, WarehouseInquiryForm).
 * Extra answers become labelled lines in the lead's message; the longest inquiry still fits the leads
 * table's 1200-character message. The feature branch's racking-type and advanced-system choices are left
 * out: pallet racking and shelving are still needsConfirmation on this branch.
 */
import { describe, expect, it } from "vitest";

import { warehouseInquirySchema, warehouseNeeds, warehouseToLead } from "./warehouse";

const minimal = {
  need: "racking-shelving",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  preferredContactMethod: "Phone",
  siteLocation: "Vientiane",
  installationNeed: "NOT_SURE",
  requirementDetail: "New store room, about 400 pallets of drinks.",
};

describe("warehouse inquiry", () => {
  it("files the inquiry as a QUOTE_REQUEST lead with the need as its category", () => {
    const lead = warehouseToLead(warehouseInquirySchema.parse(minimal));

    expect(lead).toMatchObject({
      leadType: "QUOTE_REQUEST",
      equipmentOrServiceCategory: "Warehouse: racking and shelving",
      sourcePage: "/warehouse-equipment",
    });
    expect(lead.message).toContain("New store room, about 400 pallets of drinks.");
    expect(lead.message).toContain("Site location: Vientiane");
    expect(lead.message).toContain("Installation needed: Not sure");
    expect(lead).not.toHaveProperty("status");
  });

  it("offers only what the warehouse page lists, not unconfirmed racking types or advanced systems", () => {
    expect(warehouseNeeds).toEqual(["racking-shelving", "material-handling", "cleaning", "power", "several", "not-sure"]);
    expect(warehouseInquirySchema.safeParse({ ...minimal, need: "advanced-systems" }).success).toBe(false);
  });

  it("keeps the longest possible inquiry inside the 1200-character message field", () => {
    const longest = warehouseInquirySchema.parse({
      ...minimal,
      need: "material-handling",
      preferredContactMethod: "Messenger",
      siteLocation: "x".repeat(120),
      warehouseSize: "x".repeat(60),
      goodsType: "x".repeat(100),
      estimatedLoad: "x".repeat(60),
      installationNeed: "NOT_SURE",
      timeline: "More than 3 Months",
      budgetRange: "x".repeat(60),
      requirementDetail: "x".repeat(500),
    });

    expect(warehouseToLead(longest).message.length).toBeLessThanOrEqual(1200);
  });

  it("refuses over-long or missing answers", () => {
    expect(warehouseInquirySchema.safeParse({ ...minimal, requirementDetail: "x".repeat(501) }).success).toBe(false);
    expect(warehouseInquirySchema.safeParse({ ...minimal, siteLocation: "" }).success).toBe(false);
  });
});
