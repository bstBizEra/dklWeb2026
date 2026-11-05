import { describe, expect, it, vi } from "vitest";

import { requestEntryEmail, validEntryEmail } from "./email-entry-flow";

describe("email entry request", () => {
  it("validates an ordinary account email", () => {
    expect(validEntryEmail(" Staff@Example.com ")).toBe("staff@example.com");
    expect(validEntryEmail("not-an-email")).toBeNull();
    expect(validEntryEmail("x".repeat(255) + "@example.com")).toBeNull();
  });

  it("returns the same public result for unknown, existing and undeliverable accounts", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const response = { message: "If this is a CMS account, an entrance key has been sent." };
    expect(await requestEntryEmail("unknown@example.com", { issue: async () => null }, send)).toEqual(response);
    expect(send).not.toHaveBeenCalled();
    expect(await requestEntryEmail("known@example.com", { issue: async () => "123456" }, send)).toEqual(response);
    expect(send).toHaveBeenCalledWith("known@example.com", "123456");
    send.mockRejectedValueOnce(new Error("SMTP down"));
    expect(await requestEntryEmail("known@example.com", { issue: async () => "123456" }, send)).toEqual(response);
  });
});
