/**
 * The contact page's inquiry form (ported from feature/services-all-products). Its extra answers are
 * written into the lead's message as labelled lines, so they reach the CMS and the email without a new
 * database field, and the longest possible answer still fits the leads table's 1200-character message.
 */
import { describe, expect, it } from "vitest";

import { contactInquirySchema, contactToLead } from "./contact";

const minimal = {
  inquiryType: "Forklift Rental",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  preferredContactMethod: "WhatsApp",
  message: "Need a 3 tonne forklift for two weeks.",
};

describe("contact inquiry", () => {
  it("files the inquiry as a general contact lead with the inquiry type as its category", () => {
    const lead = contactToLead(contactInquirySchema.parse(minimal));

    expect(lead).toMatchObject({
      leadType: "CONTACT_GENERAL",
      equipmentOrServiceCategory: "Forklift Rental",
      companyName: "Mekong Cold Chain",
      sourcePage: "/contact",
    });
    expect(lead.message).toContain("Need a 3 tonne forklift for two weeks.");
    expect(lead.message).toContain("Preferred contact: WhatsApp");
    // Status and time are the server's (route), never the visitor's.
    expect(lead).not.toHaveProperty("status");
    expect(lead).not.toHaveProperty("submissionTimestamp");
  });

  it("adds only the answers that were given", () => {
    const lead = contactToLead(contactInquirySchema.parse({ ...minimal, capacityRequirement: "3 tonnes", timeline: "" }));

    expect(lead.message).toContain("Capacity: 3 tonnes");
    expect(lead.message).not.toContain("Timeline");
    expect(lead.message).not.toContain("Lift height");
  });

  it("keeps the longest possible inquiry inside the 1200-character message field", () => {
    const longest = contactInquirySchema.parse({
      ...minimal,
      preferredContactMethod: "Messenger",
      productCategory: "x".repeat(60),
      equipmentType: "x".repeat(80),
      condition: "Not Sure",
      capacityRequirement: "x".repeat(40),
      liftHeight: "x".repeat(40),
      location: "x".repeat(120),
      timeline: "More than 3 Months",
      message: "x".repeat(650),
    });

    expect(contactToLead(longest).message.length).toBeLessThanOrEqual(1200);
  });

  it("refuses unknown inquiry types and over-long answers", () => {
    expect(contactInquirySchema.safeParse({ ...minimal, inquiryType: "Anything" }).success).toBe(false);
    expect(contactInquirySchema.safeParse({ ...minimal, message: "x".repeat(651) }).success).toBe(false);
    expect(contactInquirySchema.safeParse({ ...minimal, location: "x".repeat(121) }).success).toBe(false);
  });
});
