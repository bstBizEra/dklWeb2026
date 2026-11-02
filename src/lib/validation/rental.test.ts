/**
 * The forklift rental page's inquiry form (ported from feature/services-all-products, RentalInquiryForm).
 * Extra answers become labelled lines in the lead's message; the longest inquiry still fits the leads
 * table's 1200-character message. The feature branch's operator and delivery questions and its equipment
 * list are left out: operator supply and delivery coverage are not confirmed.
 */
import { describe, expect, it } from "vitest";

import { rentalInquirySchema, rentalPeriods, rentalToLead } from "./rental";

const minimal = {
  rentalPeriod: "SHORT_TERM",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  preferredContactMethod: "Phone",
  location: "Vientiane",
  capacity: "2.5 tonnes",
  liftHeight: "4 m",
  environment: "INDOOR",
  requirementDetail: "Extra forklift for the rice harvest season.",
};

describe("forklift rental inquiry", () => {
  it("files the inquiry as a RENTAL_INQUIRY lead with the rental period as its category", () => {
    const lead = rentalToLead(rentalInquirySchema.parse(minimal));

    expect(lead).toMatchObject({
      leadType: "RENTAL_INQUIRY",
      equipmentOrServiceCategory: "Forklift rental: short term",
      sourcePage: "/forklift-rental",
    });
    expect(lead.message).toContain("Extra forklift for the rice harvest season.");
    expect(lead.message).toContain("Capacity: 2.5 tonnes");
    expect(lead.message).toContain("Lift height: 4 m");
    expect(lead.message).toContain("Working area: Indoor");
    expect(lead).not.toHaveProperty("status");
  });

  it("offers the page's short and long term periods, with no operator or delivery question", () => {
    expect(rentalPeriods).toEqual(["SHORT_TERM", "LONG_TERM", "NOT_SURE"]);
    const parsed = rentalInquirySchema.parse({ ...minimal, operatorRequired: "Yes", deliveryRequired: "Yes" });
    expect(parsed).not.toHaveProperty("operatorRequired");
    expect(parsed).not.toHaveProperty("deliveryRequired");
  });

  it("keeps the longest possible inquiry inside the 1200-character message field", () => {
    const longest = rentalInquirySchema.parse({
      ...minimal,
      rentalPeriod: "NOT_SURE",
      preferredContactMethod: "Messenger",
      location: "x".repeat(120),
      capacity: "x".repeat(40),
      liftHeight: "x".repeat(40),
      environment: "BOTH",
      powerPreference: "NO_PREFERENCE",
      startDate: "x".repeat(40),
      duration: "x".repeat(40),
      workingHours: "x".repeat(40),
      requirementDetail: "x".repeat(500),
    });

    expect(rentalToLead(longest).message.length).toBeLessThanOrEqual(1200);
  });

  it("refuses over-long or missing answers", () => {
    expect(rentalInquirySchema.safeParse({ ...minimal, requirementDetail: "x".repeat(501) }).success).toBe(false);
    expect(rentalInquirySchema.safeParse({ ...minimal, capacity: "" }).success).toBe(false);
    expect(rentalInquirySchema.safeParse({ ...minimal, location: "" }).success).toBe(false);
  });
});
