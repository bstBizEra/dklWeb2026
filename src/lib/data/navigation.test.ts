import { describe, expect, it } from "vitest";

import { groupMenuLinks, resolveNavigation } from "./navigation";

describe("Solutions menu groups", () => {
  const solutions = resolveNavigation().find((item) => item.children)?.children ?? [];

  it("splits every Solutions link into Equipment or Service & parts, losing none", () => {
    const groups = groupMenuLinks(solutions);

    expect(groups.map((group) => group.title)).toEqual(["Equipment", "Service & parts"]);
    expect(groups.flatMap((group) => group.links.map((link) => link.href)).sort()).toEqual(solutions.map((link) => link.href).sort());
  });

  it("puts a page it does not know under Equipment instead of dropping it", () => {
    const [group] = groupMenuLinks([{ label: "New page", href: "/new-page" }]);

    expect(group.title).toBe("Equipment");
    expect(group.links[0].href).toBe("/new-page");
    expect(group.links[0].icon).toBeDefined();
  });
});
