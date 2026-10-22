import type { MetadataRoute } from "next";

import { publishedRoutes } from "@/lib/data/routes";

const siteUrl = process.env.APP_URL ?? "https://www.dklao.com";

// Built from the route registry, so only published routes are advertised and a
// planned (404) page can never appear here.
export default function sitemap(): MetadataRoute.Sitemap {
  return publishedRoutes().map((route) => ({
    url: `${siteUrl}${route.href}`,
    lastModified: new Date(),
    changeFrequency: route.id === "home" ? "weekly" : "monthly",
    priority: route.id === "home" ? 1 : 0.8,
  }));
}
