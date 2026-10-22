import type { IntentKey } from "@/lib/leads/intents";

export type RouteGroup = "solutions" | "company" | "conversion";

export type SiteRoute = {
  id: string;
  href: string;
  label: string;
  // Short header label. Routes without one are not in the header.
  navLabel?: string;
  group: RouteGroup;
  blurb: string;
  // Flip to true in the same change that adds the page under src/app.
  published: boolean;
  related: readonly string[];
};

// Single source for the header, footer, 404 links, sitemap and "Related solutions".
// Planned routes are listed so related links are validated, but only published
// routes are ever rendered or advertised.
export const routes: readonly SiteRoute[] = [
  { id: "home", href: "/", label: "Home", group: "company", blurb: "DK LAO home page.", published: true, related: [] },
  { id: "about", href: "/about", label: "About DK LAO", navLabel: "About DK LAO", group: "company", blurb: "Who we are and what we support.", published: true, related: ["rental", "sales", "maintenance", "parts", "warehouse", "cleaning", "industries", "contact", "quote"] },
  { id: "rental", href: "/forklift-rental", label: "Forklift Rental", navLabel: "Rental", group: "solutions", blurb: "Short and long term forklift rental.", published: true, related: ["rental-short", "rental-long", "sales", "maintenance", "batteries", "industries", "knowledge", "quote"] },
  { id: "rental-short", href: "/forklift-rental/short-term", label: "Short-Term Rental", group: "solutions", blurb: "Forklifts for projects and peak seasons.", published: false, related: ["rental", "rental-long", "sales-used", "maintenance", "quote"] },
  { id: "rental-long", href: "/forklift-rental/long-term", label: "Long-Term Rental", group: "solutions", blurb: "Forklifts for steady operations.", published: false, related: ["rental", "rental-short", "sales", "maintenance", "batteries", "quote"] },
  { id: "sales", href: "/forklift-sales", label: "Forklifts for Sale", navLabel: "Forklifts", group: "solutions", blurb: "New and used forklifts for your site.", published: false, related: ["sales-new", "sales-used", "rental", "maintenance", "parts", "batteries", "material", "quote"] },
  { id: "sales-new", href: "/forklift-sales/new", label: "New Forklifts", group: "solutions", blurb: "Compare new forklifts.", published: false, related: ["sales", "sales-used", "rental", "parts", "batteries", "quote"] },
  { id: "sales-used", href: "/forklift-sales/used", label: "Used Forklifts", group: "solutions", blurb: "Selected used forklifts and inspection.", published: false, related: ["sales", "sales-new", "rental", "maintenance", "parts", "knowledge", "quote"] },
  { id: "parts", href: "/spare-parts", label: "Spare Parts", navLabel: "Parts", group: "solutions", blurb: "Parts matched by model and serial number.", published: false, related: ["maintenance", "batteries", "sales", "rental", "article", "knowledge", "quote"] },
  { id: "maintenance", href: "/maintenance-service", label: "Maintenance Service", navLabel: "Service", group: "solutions", blurb: "Preventive service and repair.", published: false, related: ["parts", "batteries", "rental", "rental-long", "sales-used", "cleaning", "quote"] },
  { id: "batteries", href: "/batteries-chargers", label: "Batteries & Chargers", group: "solutions", blurb: "Power for electric forklifts.", published: false, related: ["parts", "maintenance", "rental", "sales-new", "warehouse", "quote"] },
  { id: "warehouse", href: "/warehouse-equipment", label: "Warehouse Equipment", group: "solutions", blurb: "Racking, handling and site survey.", published: false, related: ["material", "racking", "sales", "cleaning", "batteries", "industries", "quote"] },
  { id: "material", href: "/material-handling", label: "Material Handling", group: "solutions", blurb: "Equipment to lift, move and stack.", published: false, related: ["sales", "rental", "batteries", "warehouse", "racking", "quote"] },
  { id: "racking", href: "/racking-shelving", label: "Racking & Shelving", group: "solutions", blurb: "Storage planned around your goods.", published: false, related: ["warehouse", "material", "sales", "industries", "quote"] },
  { id: "cleaning", href: "/cleaning-equipment", label: "Cleaning Equipment", navLabel: "Cleaning", group: "solutions", blurb: "Industrial cleaning machines.", published: false, related: ["warehouse", "industries", "maintenance", "quote", "contact"] },
  { id: "industries", href: "/industries", label: "Industries", group: "company", blurb: "Equipment solutions by industry.", published: false, related: ["ind-logistics", "rental", "sales", "warehouse", "cleaning", "about", "quote"] },
  { id: "ind-logistics", href: "/industries/logistics-warehousing", label: "Logistics & Warehousing", group: "company", blurb: "Equipment for logistics operations.", published: false, related: ["industries", "rental", "sales", "racking", "maintenance", "cleaning", "quote"] },
  { id: "knowledge", href: "/knowledge-center", label: "Knowledge Center", group: "company", blurb: "Practical forklift and warehouse guides.", published: false, related: ["article", "rental", "sales-used", "parts", "cleaning", "about", "quote"] },
  { id: "article", href: "/knowledge-center/forklift-rental-request-checklist", label: "How to Prepare a Rental Request", group: "company", blurb: "A checklist before you ask for a rental price.", published: false, related: ["knowledge", "rental", "rental-short", "quote"] },
  { id: "contact", href: "/contact", label: "Contact DK LAO", navLabel: "Contact", group: "conversion", blurb: "Talk to a DK LAO advisor.", published: true, related: ["quote", "about", "maintenance", "parts", "rental"] },
  { id: "quote", href: "/request-quote", label: "Request a Quote", group: "conversion", blurb: "One form for every equipment or service need.", published: true, related: ["contact", "rental", "sales", "maintenance", "parts"] },
];

const routeById = new Map(routes.map((route) => [route.id, route]));

export function getRoute(id: string): SiteRoute | undefined {
  return routeById.get(id);
}

export function isPublishedRoute(id: string): boolean {
  return getRoute(id)?.published === true;
}

export function publishedRoutes(): SiteRoute[] {
  return routes.filter((route) => route.published);
}

export function navRoutes(): SiteRoute[] {
  return publishedRoutes().filter((route) => route.navLabel);
}

export function relatedRoutes(id: string): SiteRoute[] {
  return (getRoute(id)?.related ?? [])
    .map(getRoute)
    .filter((route): route is SiteRoute => route !== undefined && route.published);
}

// Every "request" button points here so the visitor always lands on the central form.
// `category` preselects the form, `from` records the page the visitor came from.
export function quoteHref(category?: IntentKey, from?: string): string {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (from) {
    params.set("from", from);
  }

  const query = params.toString();

  return query ? `/request-quote?${query}` : "/request-quote";
}
