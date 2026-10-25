import versionInfo from "../../VERSION.json";

export const siteFooterMetadata = {
  copyrightPrefix: "Copyright © DK LAO",
  foundedYear: 2010,
  currentYear: new Date().getFullYear(),
  developerLabel: "Develop by:",
  developerName: "BizEra",
  developerUrl: "https://www.bizera.la/",
  developerDisplayUrl: "www.bizera.la",
  version: versionInfo.version,
  releaseDate: versionInfo.releaseDate,
} as const;
