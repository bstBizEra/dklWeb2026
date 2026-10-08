import type { MetadataRoute } from "next";

const siteUrl = process.env.APP_URL ?? "https://www.dklao.com";

// Only published routes are listed. Add inner routes here as each page ships
// so the sitemap never advertises unbuilt (404) pages.
export default function sitemap(): MetadataRoute.Sitemap {
  const core: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
  const solutions = [
    "forklift-rental", "forklift-sales", "forklift-sales/new", "forklift-sales/used",
    "spare-parts", "maintenance-service", "material-handling", "warehouse-equipment",
    "batteries-chargers", "cleaning-equipment", "request-quote", "contact",
  ];
  return [...core, ...solutions.map((path) => ({
    url: `${siteUrl}/${path}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6,
  }))];
}
