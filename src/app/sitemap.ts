import type { MetadataRoute } from "next";

import { publishedRoutes } from "@/lib/data/routes";
import { localizeHref } from "@/lib/i18n";

const siteUrl = process.env.APP_URL ?? "https://www.dklao.com";

// Built from the route registry, so only published routes are advertised and a
// planned (404) page can never appear here. Each page is listed in English and Lao, with hreflang links.
export default function sitemap(): MetadataRoute.Sitemap {
  return publishedRoutes().flatMap((route) => {
    const languages = { en: `${siteUrl}${route.href}`, lo: `${siteUrl}${localizeHref(route.href, "lo")}` };
    return (["en", "lo"] as const).map((locale) => ({
      url: languages[locale],
      lastModified: new Date(),
      changeFrequency: route.id === "home" ? ("weekly" as const) : ("monthly" as const),
      priority: route.id === "home" ? 1 : 0.8,
      alternates: { languages },
    }));
  });
}
