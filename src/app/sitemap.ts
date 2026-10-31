import type { MetadataRoute } from "next";

import { getPageDates } from "@/lib/cms/pages";
import { publishedRoutes } from "@/lib/data/routes";

const siteUrl = process.env.APP_URL ?? "https://www.dklao.com";

// Rebuilt at most once an hour on the running server, where the CMS is reachable (the build itself runs
// without the database settings, so a build-time sitemap could never carry CMS dates).
export const revalidate = 3600;

// Built from the route registry, so only published routes are advertised and a
// planned (404) page can never appear here. lastModified is the CMS page's real last change, and is left
// out when there is none, instead of the build time on every page.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dates = await getPageDates();

  return publishedRoutes().map((route) => {
    const lastModified = dates.get(route.id);
    return {
      url: `${siteUrl}${route.href}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: route.id === "home" ? "weekly" : "monthly",
      priority: route.id === "home" ? 1 : 0.8,
    };
  });
}
