import { beforeEach, describe, expect, it, vi } from "vitest";

const { submitPublicLead } = vi.hoisted(() => ({ submitPublicLead: vi.fn() }));
vi.mock("@/lib/leads/submit", () => ({ submitPublicLead }));

import { POST } from "./route";

const valid = {
  companyName: "Vientiane Logistics", contactPerson: "Operations Manager",
  phone: "+856 20 5555 1234", equipmentOrServiceCategory: "Forklift rental",
  message: "We need a forklift recommendation for warehouse loading.",
};

function request(body: unknown) {
  return new Request("http://localhost/api/leads/quote", {
    method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": "retry-key-123" },
    body: JSON.stringify(body),
  });
}

describe("public quote boundary", () => {
  beforeEach(() => submitPublicLead.mockReset());

  it("overrides forged status and timestamp before persistence", async () => {
    submitPublicLead.mockResolvedValue({ kind: "accepted", leadId: "DKL-test", status: "NEW" });
    const response = await POST(request({ ...valid, status: "WON", submissionTimestamp: "2000-01-01T00:00:00.000Z" }));
    expect(response.status).toBe(200);
    expect(submitPublicLead).toHaveBeenCalledOnce();
    expect(submitPublicLead.mock.calls[0][0]).toMatchObject({ status: "NEW" });
    expect(submitPublicLead.mock.calls[0][0].submissionTimestamp).not.toBe("2000-01-01T00:00:00.000Z");
  });

  it("rejects oversized requests before persistence", async () => {
    const response = await POST(request({ ...valid, message: "x".repeat(20_000) }));
    expect(response.status).toBe(400);
    expect(submitPublicLead).not.toHaveBeenCalled();
  });
});
