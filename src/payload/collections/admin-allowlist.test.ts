import { describe, expect, it, vi } from "vitest";

import { AdminAllowlist, mayAccessAdmin } from "./admin-allowlist";

const hook = (name: "beforeValidate" | "afterDelete") => AdminAllowlist.hooks?.[name]?.[0] as (...args: never[]) => Promise<unknown>;

describe("admin email allowlist", () => {
  it("allows the owner to recover access and requires an entry for everyone else", async () => {
    const count = vi.fn().mockResolvedValue({ totalDocs: 1 });
    expect(await mayAccessAdmin({ payload: { count }, user: { role: "owner" } })).toBe(true);
    expect(count).not.toHaveBeenCalled();
    expect(await mayAccessAdmin({ payload: { count }, user: { role: "advisor", email: " Staff@Example.COM " } })).toBe(true);
    expect(count).toHaveBeenCalledWith(expect.objectContaining({
      collection: "admin-allowlist",
      where: { email: { equals: "staff@example.com" } },
    }));
    count.mockResolvedValue({ totalDocs: 0 });
    expect(await mayAccessAdmin({ payload: { count }, user: { role: "editor", email: "staff@example.com" } })).toBe(false);
    expect(await mayAccessAdmin({ payload: { count }, user: null })).toBe(false);
  });

  it("accepts only an existing non-owner user and normalizes email", async () => {
    const find = vi.fn().mockResolvedValue({ totalDocs: 1, docs: [{ role: "editor" }] });
    const req = { payload: { find } };
    expect(await hook("beforeValidate")({ operation: "create", data: { email: " Staff@Example.COM " }, req } as never))
      .toEqual({ email: "staff@example.com" });
    find.mockResolvedValue({ totalDocs: 0, docs: [] });
    await expect(hook("beforeValidate")({ operation: "create", data: { email: "new@example.com" }, req } as never))
      .rejects.toThrow("existing non-owner");
    find.mockResolvedValue({ totalDocs: 1, docs: [{ role: "owner" }] });
    await expect(hook("beforeValidate")({ operation: "create", data: { email: "owner@example.com" }, req } as never))
      .rejects.toThrow("existing non-owner");
  });

  it("ends active sessions when an email is removed", async () => {
    const find = vi.fn().mockResolvedValue({ docs: [{ id: 7 }] });
    const update = vi.fn().mockResolvedValue({});
    const req = { payload: { find, update } };
    await hook("afterDelete")({ doc: { email: "staff@example.com" }, req } as never);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      collection: "users", id: 7, data: { sessions: [] }, overrideAccess: true,
    }));
  });
});
