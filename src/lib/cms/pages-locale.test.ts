/**
 * Which language a CMS page row may speak. The 24 rows in the admin were filled in English only, and the
 * query asked for them with an English fallback, so every Lao page served the English row and the built-in
 * Lao pages (src/messages/lo/) went unused. A row counts for a language only when it is translated whole:
 * a part-translated row would drop the sections that are still empty, losing content without a trace.
 */
import { describe, expect, it, vi } from "vitest";

const find = vi.fn();

vi.mock("./client", () => ({
  cmsEnabled: () => true,
  getCms: async () => ({ find }),
}));

const { getPageContent } = await import("./pages");

const builtIn = {
  id: "rental",
  metaTitle: "ເຊົ່າລົດຍົກ",
  metaDescription: "ລາຍລະອຽດ",
  eyebrow: "ເຊົ່າ",
  h1: "ເຊົ່າລົດຍົກໃນລາວ",
  intro: "ແນະນຳ",
  ctas: [],
  sections: [{ kind: "cards" as const, title: "ຫົວຂໍ້ ກ", items: [] }, { kind: "cards" as const, title: "ຫົວຂໍ້ ຂ", items: [] }],
};

// A row as Payload returns it with no fallback: the rows exist, the text of this language may not.
const row = (h1: string, sectionTitles: string[]) => ({
  docs: [{ routeId: "rental", h1, metaTitle: h1 && "Forklift Rental in Laos", sections: sectionTitles.map((title) => ({ kind: "cards", title, items: [] })) }],
});

describe("getPageContent", () => {
  it("keeps the built-in Lao page when the row has no Lao text, and asks without the English fallback", async () => {
    find.mockResolvedValueOnce(row("", ["", ""]));

    const page = await getPageContent(builtIn, "lo");

    expect(find).toHaveBeenCalledWith(expect.objectContaining({ locale: "lo", fallbackLocale: false }));
    expect(page.h1).toBe(builtIn.h1);
  });

  it("keeps the built-in Lao page when only part of the row is translated", async () => {
    find.mockResolvedValueOnce(row("ເຊົ່າລົດຍົກ (CMS)", ["ຫົວຂໍ້ ກ", ""]));

    const page = await getPageContent({ ...builtIn, id: "rental-partial" }, "lo");

    expect(page.h1).toBe(builtIn.h1);
  });

  it("uses the row once every section is translated", async () => {
    find.mockResolvedValueOnce(row("ເຊົ່າລົດຍົກ (CMS)", ["ຫົວຂໍ້ ກ", "ຫົວຂໍ້ ຂ"]));

    const page = await getPageContent({ ...builtIn, id: "rental-full" }, "lo");

    expect(page.h1).toBe("ເຊົ່າລົດຍົກ (CMS)");
  });

  it("leaves English alone: the row wins, with the fallback as before", async () => {
    find.mockResolvedValueOnce(row("Forklift Rental in Laos", ["Pick the rental", ""]));

    const page = await getPageContent({ ...builtIn, id: "rental-en", h1: "built-in English" }, "en");

    expect(find).toHaveBeenCalledWith(expect.objectContaining({ locale: "en", fallbackLocale: "en" }));
    expect(page.h1).toBe("Forklift Rental in Laos");
  });
});
