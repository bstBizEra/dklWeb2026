/**
 * The maintenance page's service booking form (ported from feature/services-all-products, ServiceHub).
 * Extra answers become labelled lines in the lead's message; the longest booking still fits the leads
 * table's 1200-character message. Onsite and workshop service are not offered here: the owner has not
 * confirmed them (sitemap-pages.ts marks both needsConfirmation).
 */
import { describe, expect, it } from "vitest";

import { serviceBookingSchema, serviceToLead, serviceTypes } from "./service";

const minimal = {
  serviceType: "preventive-maintenance",
  productFamily: "forklift",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  preferredContactMethod: "WhatsApp",
  equipmentBrand: "Toyota",
  siteLocation: "Vientiane",
  urgency: "NORMAL",
  requirementDetail: "Due for the 500-hour service.",
};

describe("service booking", () => {
  it("files the booking as a SERVICE_BOOKING lead with the service type as its category", () => {
    const lead = serviceToLead(serviceBookingSchema.parse(minimal));

    expect(lead).toMatchObject({
      leadType: "SERVICE_BOOKING",
      equipmentOrServiceCategory: "Preventive maintenance",
      sourcePage: "/maintenance-service",
    });
    expect(lead.message).toContain("Due for the 500-hour service.");
    expect(lead.message).toContain("Equipment brand: Toyota");
    expect(lead.message).toContain("Urgency: Normal");
    expect(lead).not.toHaveProperty("status");
  });

  it("marks a stopped machine plainly for the team", () => {
    const lead = serviceToLead(serviceBookingSchema.parse({ ...minimal, serviceType: "emergency-repair", urgency: "MACHINE_STOPPED" }));
    expect(lead.message).toContain("Urgency: Machine stopped");
    expect(lead.equipmentOrServiceCategory).toBe("Breakdown repair");
  });

  it("offers no onsite or workshop service, which the owner has not confirmed", () => {
    expect(serviceTypes).not.toContain("inhouse-service");
    expect(serviceTypes).not.toContain("site-visit");
    expect(serviceBookingSchema.safeParse({ ...minimal, serviceType: "inhouse-service" }).success).toBe(false);
  });

  it("keeps the longest possible booking inside the 1200-character message field", () => {
    const longest = serviceBookingSchema.parse({
      ...minimal,
      serviceType: "equipment-recommendation",
      productFamily: "warehouse",
      preferredContactMethod: "Messenger",
      equipmentBrand: "x".repeat(60),
      equipmentModel: "x".repeat(60),
      serialNumber: "x".repeat(60),
      siteLocation: "x".repeat(120),
      urgency: "MACHINE_STOPPED",
      preferredServiceDate: "x".repeat(40),
      quotationChoice: "NOT_SURE",
      requirementDetail: "x".repeat(500),
    });

    expect(serviceToLead(longest).message.length).toBeLessThanOrEqual(1200);
  });

  it("refuses over-long answers", () => {
    expect(serviceBookingSchema.safeParse({ ...minimal, requirementDetail: "x".repeat(501) }).success).toBe(false);
    expect(serviceBookingSchema.safeParse({ ...minimal, equipmentBrand: "x".repeat(61) }).success).toBe(false);
  });
});
