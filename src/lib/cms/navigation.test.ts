/**
 * The header menu from the admin. Rule: a saved menu may only speak the language of the page it is on.
 * The admin menu was saved in English with no Lao labels, and asking Payload with an English fallback
 * put English items on top of every Lao page, so the menu is used only where the locale has every label.
 */
import { describe, expect, it, vi } from "vitest";

const findGlobal = vi.fn();

vi.mock("./client", () => ({
  cmsEnabled: () => true,
  getCms: async () => ({ findGlobal }),
}));

const { getNavigation, navIsComplete } = await import("./navigation");

// What the admin saved on 25 Oct: five items, seven dropdown links, labels in English only.
const savedMenu = (label: (id: string) => string | undefined) => ({
  items: [
    {
      label: label("solutions"),
      children: ["rental", "sales", "maintenance", "parts", "batteries", "warehouse", "cleaning"].map((routeId) => ({
        label: label(routeId),
        routeId,
      })),
    },
    ...["industries", "knowledge", "about", "contact"].map((routeId) => ({ label: label(routeId), routeId, children: [] })),
  ],
});

describe("navIsComplete", () => {
  it("accepts a menu whose every row has a label, and rejects one with any row unlabelled", () => {
    const doc = savedMenu((id) => id);
    expect(navIsComplete(doc, [{ label: "a", children: [{ label: "b", routeId: "rental" }] }, { label: "c", routeId: "about" }])).toBe(false);
    expect(navIsComplete({ items: [{ label: "a", routeId: "about" }] }, [{ label: "a", routeId: "about" }])).toBe(true);
    expect(navIsComplete(doc, [])).toBe(false);
    expect(navIsComplete(null, [])).toBe(true);
  });
});

describe("getNavigation", () => {
  it("uses the built-in Lao menu when the saved menu has no Lao labels", async () => {
    findGlobal.mockResolvedValueOnce(savedMenu(() => undefined));

    const items = await getNavigation("lo");

    expect(findGlobal).toHaveBeenCalledWith(expect.objectContaining({ slug: "navigation", locale: "lo", fallbackLocale: false }));
    expect(items.map((item) => item.label)).toEqual(["ວິທີແກ້ໄຂ", "ອຸດສາຫະກຳ", "ສູນຄວາມຮູ້", "ກ່ຽວກັບພວກເຮົາ", "ຕິດຕໍ່"]);
  });

  it("uses the saved menu where the locale has every label", async () => {
    findGlobal.mockResolvedValueOnce(savedMenu((id) => `Saved ${id}`));

    const items = await getNavigation("en");

    expect(items.map((item) => item.label)).toEqual([
      "Saved solutions",
      "Saved industries",
      "Saved knowledge",
      "Saved about",
      "Saved contact",
    ]);
  });
});
