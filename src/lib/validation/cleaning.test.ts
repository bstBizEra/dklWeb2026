/**
 * The cleaning equipment page's recommendation form (ported from feature/services-all-products,
 * CleaningRecommendationWizard and lead-message.ts). The choices follow this page: its Nilfisk range and its
 * "Match machine to site" rows. Extra answers become labelled lines in the lead's message; the longest
 * request still fits the leads table's 1200-character message. The feature branch's site survey, delivery
 * and training questions are left out: none of those services is confirmed.
 */
import { describe, expect, it } from "vitest";

import { cleaningMachines, cleaningRequestSchema, cleaningToLead } from "./cleaning";

const minimal = {
  machine: "scrubber-dryer",
  site: "LARGE_FLOORS",
  customerType: "BUSINESS",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  preferredContactMethod: "Phone",
  location: "Vientiane",
  requirementDetail: "Concrete warehouse floor, about 3,000 m2, cleaned daily.",
};

describe("cleaning recommendation request", () => {
  it("files the request as a CLEANING_EQUIPMENT_RECOMMENDATION lead with the machine as its category", () => {
    const lead = cleaningToLead(cleaningRequestSchema.parse(minimal));

    expect(lead).toMatchObject({
      leadType: "CLEANING_EQUIPMENT_RECOMMENDATION",
      equipmentOrServiceCategory: "Cleaning: scrubber dryer",
      sourcePage: "/cleaning-equipment",
    });
    expect(lead.message).toContain("Concrete warehouse floor, about 3,000 m2, cleaned daily.");
    expect(lead.message).toContain("Site: Large smooth floors");
    expect(lead.message).toContain("For: A business");
    expect(lead).not.toHaveProperty("status");
  });

  it("offers the page's Nilfisk range, with no site survey, delivery or training question", () => {
    expect(cleaningMachines).toEqual([
      "scrubber-dryer",
      "sweeper",
      "robotic",
      "industrial-vacuum",
      "commercial-vacuum",
      "pressure-washer",
      "detergent",
      "not-sure",
    ]);
    const parsed = cleaningRequestSchema.parse({ ...minimal, siteSurvey: "Yes", deliveryRequired: "Yes", trainingRequired: "Yes" });
    expect(parsed).not.toHaveProperty("siteSurvey");
    expect(parsed).not.toHaveProperty("deliveryRequired");
    expect(parsed).not.toHaveProperty("trainingRequired");
  });

  it("keeps the longest possible request inside the 1200-character message field", () => {
    const longest = cleaningRequestSchema.parse({
      ...minimal,
      machine: "not-sure",
      site: "PRODUCTION",
      customerType: "HOME_SMALL_BUSINESS",
      preferredContactMethod: "Messenger",
      location: "x".repeat(120),
      areaSize: "x".repeat(60),
      frequency: "OCCASIONALLY",
      timeline: "More than 3 Months",
      budgetRange: "x".repeat(60),
      requirementDetail: "x".repeat(500),
    });

    expect(cleaningToLead(longest).message.length).toBeLessThanOrEqual(1200);
  });

  it("refuses over-long or missing answers", () => {
    expect(cleaningRequestSchema.safeParse({ ...minimal, requirementDetail: "x".repeat(501) }).success).toBe(false);
    expect(cleaningRequestSchema.safeParse({ ...minimal, location: "" }).success).toBe(false);
    expect(cleaningRequestSchema.safeParse({ ...minimal, machine: "carpet-extractor" }).success).toBe(false);
  });
});
