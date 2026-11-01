import type { MetadataRoute } from "next";

import { getPageDates } from "@/lib/cms/pages";
import { publishedRoutes } from "@/lib/data/routes";
import { localizeHref } from "@/lib/i18n";

const siteUrl = process.env.APP_URL ?? "https://www.dklao.com";

// Rebuilt at most once an hour on the running server, where the CMS is reachable (the build itself runs
// without the database settings, so a build-time sitemap could never carry CMS dates).
export const revalidate = 3600;

// Built from the route registry, so only published routes are advertised and a
// planned (404) page can never appear here. Each page is listed in English and Lao, with hreflang links.
// lastModified is the CMS page's real last change, and is left out when there is none, instead of the
// build time on every page.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dates = await getPageDates();

  return publishedRoutes().flatMap((route) => {
    const lastModified = dates.get(route.id);
    const languages = { en: `${siteUrl}${route.href}`, lo: `${siteUrl}${localizeHref(route.href, "lo")}` };
    return (["en", "lo"] as const).map((locale) => ({
      url: languages[locale],
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: route.id === "home" ? ("weekly" as const) : ("monthly" as const),
      priority: route.id === "home" ? 1 : 0.8,
      alternates: { languages },
    }));
  });
}
