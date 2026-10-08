import { describe, expect, it } from "vitest";
import { can } from "./auth";

describe("staff capability boundary", () => {
  it("keeps commercial approval separate from administration", () => {
    expect(can("admin", "approve_quotes")).toBe(false);
    expect(can("support", "approve_quotes")).toBe(false);
    expect(can("sales_manager", "approve_quotes", true)).toBe(true);
  });

  it("limits departmental capabilities", () => {
    expect(can("sales", "manage_tickets")).toBe(false);
    expect(can("support", "manage_leads")).toBe(false);
    expect(can("operations", "view_all_leads")).toBe(false);
  });
});
