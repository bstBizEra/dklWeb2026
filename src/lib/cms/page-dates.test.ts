/**
 * Sitemap dates from the CMS: published pages give their real last change by route id; rows without a
 * usable route id or date are skipped; without a database, or when it fails, there are no dates at all.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

const find = vi.fn();
const enabled = vi.fn();
vi.mock("./client", () => ({ cmsEnabled: () => enabled(), getCms: async () => ({ find }) }));

const { getPageDates } = await import("./pages");

afterEach(() => {
  find.mockReset();
  enabled.mockReset();
});

describe("getPageDates", () => {
  it("maps published pages to their last change", async () => {
    enabled.mockReturnValue(true);
    find.mockResolvedValue({
      docs: [
        { routeId: "about", updatedAt: "2026-10-20T08:00:00.000Z" },
        { routeId: "", updatedAt: "2026-10-21T08:00:00.000Z" },
        { routeId: "contact", updatedAt: "not a date" },
      ],
    });

    const dates = await getPageDates();

    expect([...dates.keys()]).toEqual(["about"]);
    expect(dates.get("about")?.toISOString()).toBe("2026-10-20T08:00:00.000Z");
    expect(find.mock.calls[0][0]).toMatchObject({ collection: "pages", where: { _status: { equals: "published" } } });
  });

  it("has no dates without a database, or when the database fails", async () => {
    enabled.mockReturnValue(false);
    expect((await getPageDates()).size).toBe(0);
    expect(find).not.toHaveBeenCalled();

    enabled.mockReturnValue(true);
    find.mockRejectedValue(new Error("ECONNREFUSED"));
    expect((await getPageDates()).size).toBe(0);
  });
});
