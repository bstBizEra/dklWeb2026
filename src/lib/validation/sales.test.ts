/**
 * The forklift sales page's inquiry form (ported from feature/services-all-products, ForkliftInquiryForm).
 * Extra answers become labelled lines in the lead's message; the longest inquiry still fits the leads
 * table's 1200-character message. The feature branch's brand list, power types and equipment categories are
 * left out: this branch supplies brand-neutral, and power types are still needsConfirmation.
 */
import { describe, expect, it } from "vitest";

import { salesConditions, salesInquirySchema, salesToLead } from "./sales";

const minimal = {
  condition: "NEW",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  preferredContactMethod: "Phone",
  location: "Vientiane",
  environment: "INDOOR",
  requirementDetail: "One forklift for loading trucks at our dock.",
};

describe("forklift sales inquiry", () => {
  it("files the inquiry as a QUOTE_REQUEST lead with the condition as its category", () => {
    const lead = salesToLead(salesInquirySchema.parse(minimal));

    expect(lead).toMatchObject({
      leadType: "QUOTE_REQUEST",
      equipmentOrServiceCategory: "Forklift sales: new",
      sourcePage: "/forklift-sales",
    });
    expect(lead.message).toContain("One forklift for loading trucks at our dock.");
    expect(lead.message).toContain("Location: Vientiane");
    expect(lead.message).toContain("Working area: Indoor");
    expect(lead).not.toHaveProperty("status");
  });

  it("asks only new or used, with no rental (its own page) and no brand or power lists", () => {
    expect(salesConditions).toEqual(["NEW", "USED", "NOT_SURE"]);
    expect(salesInquirySchema.safeParse({ ...minimal, condition: "RENTAL" }).success).toBe(false);
    expect(salesInquirySchema.parse({ ...minimal, powerType: "Diesel" })).not.toHaveProperty("powerType");
  });

  it("keeps the longest possible inquiry inside the 1200-character message field", () => {
    const longest = salesInquirySchema.parse({
      ...minimal,
      condition: "NOT_SURE",
      preferredContactMethod: "Messenger",
      location: "x".repeat(120),
      capacity: "x".repeat(40),
      liftHeight: "x".repeat(40),
      environment: "BOTH",
      application: "x".repeat(100),
      preferredBrand: "x".repeat(60),
      timeline: "More than 3 Months",
      budgetRange: "x".repeat(60),
      requirementDetail: "x".repeat(500),
    });

    expect(salesToLead(longest).message.length).toBeLessThanOrEqual(1200);
  });

  it("refuses over-long or missing answers", () => {
    expect(salesInquirySchema.safeParse({ ...minimal, requirementDetail: "x".repeat(501) }).success).toBe(false);
    expect(salesInquirySchema.safeParse({ ...minimal, location: "" }).success).toBe(false);
  });
});
