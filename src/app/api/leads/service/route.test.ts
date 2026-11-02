// @vitest-environment node
/**
 * The service booking endpoint runs the shared lead pipeline (lib/leads/intake.ts). Storage and
 * notification are replaced here. It also takes up to two photos, sent as multipart/form-data with the
 * booking in a "lead" field; photo checks are real (lib/leads/photos.ts), photo storage is replaced.
 * Node environment: under jsdom, Node's form-data parser makes jsdom File objects and then rejects them.
 */
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetLeadLimiter } from "@/lib/leads/guard";

const storeLead = vi.fn();
const storeLeadPhotos = vi.fn();
const raiseAlert = vi.fn(async () => "throttled");

vi.mock("@/lib/leads/store", () => ({ storeLead: (lead: unknown) => storeLead(lead) }));
vi.mock("@/lib/leads/notify", () => ({ notifyNewLead: vi.fn(async () => "sent") }));
vi.mock("@/lib/leads/email", () => ({ emailNewLead: vi.fn(async () => "sent") }));
vi.mock("@/lib/ops/alert", () => ({ raiseAlert: (...args: unknown[]) => raiseAlert(...(args as [])) }));
vi.mock("@/lib/leads/photo-store", () => ({ storeLeadPhotos: (...args: unknown[]) => storeLeadPhotos(...args) }));

const { POST } = await import("./route");

const good = {
  serviceType: "battery-charger",
  productFamily: "battery",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  preferredContactMethod: "Phone",
  equipmentBrand: "Toyota",
  siteLocation: "Vientiane",
  urgency: "URGENT",
  requirementDetail: "The charger trips after ten minutes.",
};

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/leads/service", { method: "POST", headers: { "content-type": "application/json", "x-real-ip": "203.0.113.20" }, body: JSON.stringify(body) }));

const jpeg = async () => new Uint8Array(await sharp({ create: { width: 8, height: 8, channels: 3, background: "#c00" } }).jpeg().toBuffer());

const postForm = (lead: unknown, files: File[]) => {
  const form = new FormData();
  form.set("lead", JSON.stringify(lead));
  for (const file of files) form.append("photos", file);
  return POST(new Request("http://localhost/api/leads/service", { method: "POST", headers: { "x-real-ip": "203.0.113.20" }, body: form }));
};

beforeEach(() => {
  storeLeadPhotos.mockReset().mockResolvedValue("cms");
  raiseAlert.mockClear();
  vi.stubEnv("LEAD_RATE_STORE", "memory");
  resetLeadLimiter();
  storeLead.mockReset().mockImplementation(async (lead: object) => ({ ...lead, leadId: "DKL-999", recordId: 5 }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  resetLeadLimiter();
});

describe("POST /api/leads/service", () => {
  it("saves the booking as a NEW service lead, whatever status the visitor sends", async () => {
    const response = await post({ ...good, status: "WON" });

    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual({ leadId: "DKL-999", status: "NEW" });
    expect(storeLead.mock.calls[0][0]).toMatchObject({
      leadType: "SERVICE_BOOKING",
      equipmentOrServiceCategory: "Battery and charger service",
      status: "NEW",
    });
  });

  it("refuses a booking without the machine's brand", async () => {
    const response = await post({ ...good, equipmentBrand: "" });

    expect(response.status).toBe(400);
    expect(storeLead).not.toHaveBeenCalled();
  });

  it("saves nothing for a filled honeypot", async () => {
    expect((await post({ ...good, homepageUrl: "x" })).status).toBe(200);
    expect(storeLead).not.toHaveBeenCalled();
  });

  it("saves photos sent with the booking, cleaned, after the lead, and notes them in the message", async () => {
    const response = await postForm(good, [new File([await jpeg()], "IMG_0001.jpg", { type: "image/jpeg" })]);

    expect(response.status).toBe(200);
    expect(storeLead.mock.calls[0][0].message.endsWith("\nPhotos: 1 attached (open the lead in the CMS)")).toBe(true);
    const [savedLead, photos] = storeLeadPhotos.mock.calls[0];
    expect(savedLead).toMatchObject({ leadId: "DKL-999", recordId: 5 });
    expect(photos).toHaveLength(1);
    expect(photos[0]).toMatchObject({ mimeType: "image/jpeg", extension: "jpg" });
  });

  it("refuses a file that is not a JPEG, PNG or WebP photo, whatever it is called, and saves nothing", async () => {
    const svg = new File(["<svg xmlns=\"http://www.w3.org/2000/svg\"><script>alert(1)</script></svg>"], "photo.jpg", { type: "image/jpeg" });
    const response = await postForm(good, [svg]);

    expect(response.status).toBe(400);
    expect((await response.json()).error.details[0].path).toEqual(["photos"]);
    expect(storeLead).not.toHaveBeenCalled();
    expect(storeLeadPhotos).not.toHaveBeenCalled();
  });

  it("refuses a third photo", async () => {
    const photo = new File([await jpeg()], "a.jpg", { type: "image/jpeg" });
    const response = await postForm(good, [photo, photo, photo]);

    expect(response.status).toBe(400);
    expect(storeLead).not.toHaveBeenCalled();
  });

  it("keeps the booking when saving its photos fails, and alerts whoever runs the site", async () => {
    storeLeadPhotos.mockRejectedValue(new Error("disk full"));
    const response = await postForm(good, [new File([await jpeg()], "a.jpg", { type: "image/jpeg" })]);

    expect(response.status).toBe(200);
    expect(raiseAlert).toHaveBeenCalledWith("lead.photos_failed", { leadId: "DKL-999" });
  });

  it("asks for the import when the CMS refused the photos and they were kept on disk", async () => {
    storeLeadPhotos.mockResolvedValue("local-after-cms-failure");
    const response = await postForm(good, [new File([await jpeg()], "a.jpg", { type: "image/jpeg" })]);

    expect(response.status).toBe(200);
    expect(raiseAlert).toHaveBeenCalledWith("lead.photos_not_in_cms", { leadId: "DKL-999" });
    expect(raiseAlert).not.toHaveBeenCalledWith("lead.photos_failed", expect.anything());
  });

  it("saves a booking sent as a form without photos like a JSON one", async () => {
    const response = await postForm(good, []);

    expect(response.status).toBe(200);
    expect(storeLead.mock.calls[0][0].message).not.toContain("Photos:");
    expect(storeLeadPhotos).not.toHaveBeenCalled();
  });
});
