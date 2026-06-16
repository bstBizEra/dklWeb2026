import { describe, expect, it } from "vitest";

import versionInfo from "../../VERSION.json";
import { siteFooterMetadata } from "./site-metadata";

describe("siteFooterMetadata", () => {
  it("keeps footer ownership and version metadata aligned", () => {
    expect(siteFooterMetadata.copyrightPrefix).toBe("Copyright © DK LAO");
    expect(siteFooterMetadata.foundedYear).toBe(2019);
    expect(siteFooterMetadata.currentYear).toBe(new Date().getFullYear());
    expect(siteFooterMetadata.developerName).toBe("BizEra");
    expect(siteFooterMetadata.developerDisplayUrl).toBe("www.bizera.la");
    expect(siteFooterMetadata.developerUrl).toBe("https://www.bizera.la/");
    expect(siteFooterMetadata.version).toBe(versionInfo.version);
  });
});
