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
  // True only when the page exists: a file under src/app, or built-in page data in src/lib/data/sitemap-pages.ts.
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
  { id: "rental-short", href: "/forklift-rental/short-term", label: "Short-Term Rental", group: "solutions", blurb: "Forklifts for projects and peak seasons.", published: true, related: ["rental", "rental-long", "sales-used", "maintenance", "quote"] },
  { id: "rental-long", href: "/forklift-rental/long-term", label: "Long-Term Rental", group: "solutions", blurb: "Forklifts for steady operations.", published: true, related: ["rental", "rental-short", "sales", "maintenance", "batteries", "quote"] },
  { id: "sales", href: "/forklift-sales", label: "Forklifts for Sale", navLabel: "Forklifts", group: "solutions", blurb: "New and used forklifts for your site.", published: true, related: ["sales-new", "sales-used", "rental", "maintenance", "parts", "batteries", "material", "quote"] },
  { id: "sales-new", href: "/forklift-sales/new", label: "New Forklifts", group: "solutions", blurb: "Compare new forklifts.", published: true, related: ["sales", "sales-used", "rental", "parts", "batteries", "quote"] },
  { id: "sales-used", href: "/forklift-sales/used", label: "Used Forklifts", group: "solutions", blurb: "Selected used forklifts and inspection.", published: true, related: ["sales", "sales-new", "rental", "maintenance", "parts", "knowledge", "quote"] },
  { id: "parts", href: "/spare-parts", label: "Spare Parts", navLabel: "Parts", group: "solutions", blurb: "Parts matched by model and serial number.", published: true, related: ["maintenance", "batteries", "sales", "rental", "article", "knowledge", "quote"] },
  { id: "maintenance", href: "/maintenance-service", label: "Maintenance Service", navLabel: "Service", group: "solutions", blurb: "Preventive service and repair.", published: true, related: ["parts", "batteries", "rental", "rental-long", "sales-used", "cleaning", "quote"] },
  { id: "batteries", href: "/batteries-chargers", label: "Batteries & Chargers", group: "solutions", blurb: "Power for electric forklifts.", published: true, related: ["parts", "maintenance", "rental", "sales-new", "warehouse", "quote"] },
  { id: "warehouse", href: "/warehouse-equipment", label: "Warehouse Equipment", group: "solutions", blurb: "Racking, handling and site survey.", published: true, related: ["material", "racking", "sales", "cleaning", "batteries", "industries", "quote"] },
  { id: "material", href: "/material-handling", label: "Material Handling", group: "solutions", blurb: "Equipment to lift, move and stack.", published: true, related: ["sales", "rental", "batteries", "warehouse", "racking", "quote"] },
  { id: "racking", href: "/racking-shelving", label: "Racking & Shelving", group: "solutions", blurb: "Storage planned around your goods.", published: true, related: ["warehouse", "material", "sales", "industries", "quote"] },
  { id: "cleaning", href: "/cleaning-equipment", label: "Cleaning Equipment", navLabel: "Cleaning", group: "solutions", blurb: "Nilfisk professional cleaning machines.", published: true, related: ["warehouse", "industries", "maintenance", "quote", "contact"] },
  { id: "industries", href: "/industries", label: "Industries", group: "company", blurb: "Equipment solutions by industry.", published: true, related: ["ind-logistics", "ind-manufacturing", "ind-construction", "ind-food-beverage", "ind-retail", "ind-hospitality", "rental", "sales", "warehouse", "cleaning", "about", "quote"] },
  { id: "ind-logistics", href: "/industries/logistics-warehousing", label: "Logistics & Warehousing", group: "company", blurb: "Equipment for logistics operations.", published: true, related: ["industries", "rental", "sales", "racking", "maintenance", "cleaning", "quote"] },
  { id: "ind-manufacturing", href: "/industries/manufacturing", label: "Manufacturing", group: "company", blurb: "Equipment for factories and production lines.", published: true, related: ["industries", "sales-new", "batteries", "material", "maintenance", "quote"] },
  { id: "ind-construction", href: "/industries/construction", label: "Construction", group: "company", blurb: "Rental and equipment for construction sites.", published: true, related: ["industries", "rental-short", "rental-long", "sales-used", "maintenance", "quote"] },
  { id: "ind-food-beverage", href: "/industries/food-beverage", label: "Food & Beverage", group: "company", blurb: "Equipment for food and drinks producers.", published: true, related: ["industries", "sales-new", "racking", "cleaning", "rental-short", "quote"] },
  { id: "ind-retail", href: "/industries/retail-wholesale", label: "Retail & Wholesale", group: "company", blurb: "Equipment for shops and wholesalers.", published: true, related: ["industries", "material", "racking", "sales", "cleaning", "quote"] },
  { id: "ind-hospitality", href: "/industries/hospitality-facilities", label: "Hospitality & Facilities", group: "company", blurb: "Cleaning and equipment for hotels and facilities.", published: true, related: ["industries", "cleaning", "material", "maintenance", "contact", "quote"] },
  { id: "knowledge", href: "/knowledge-center", label: "Knowledge Center", group: "company", blurb: "Practical forklift and warehouse guides.", published: true, related: ["article", "rental", "sales-used", "parts", "cleaning", "about", "quote"] },
  { id: "article", href: "/knowledge-center/forklift-rental-request-checklist", label: "How to Prepare a Rental Request", group: "company", blurb: "A checklist before you ask for a rental price.", published: true, related: ["knowledge", "rental", "rental-short", "quote"] },
  { id: "contact", href: "/contact", label: "Contact DK LAO", navLabel: "Contact", group: "conversion", blurb: "Talk to a DK LAO advisor.", published: true, related: ["quote", "about", "maintenance", "parts", "rental"] },
  { id: "quote", href: "/request-quote", label: "Request a Quote", group: "conversion", blurb: "One form for every equipment or service need.", published: true, related: ["contact", "rental", "sales", "maintenance", "parts"] },
];

const routeById = new Map(routes.map((route) => [route.id, route]));

// Parent page for breadcrumbs. Material handling and racking sit under Warehouse but keep flat URLs.
const parents: Record<string, string> = {
  "rental-short": "rental",
  "rental-long": "rental",
  "sales-new": "sales",
  "sales-used": "sales",
  material: "warehouse",
  racking: "warehouse",
  "ind-logistics": "industries",
  "ind-manufacturing": "industries",
  "ind-construction": "industries",
  "ind-food-beverage": "industries",
  "ind-retail": "industries",
  "ind-hospitality": "industries",
  article: "knowledge",
};

// Pages from Home down to (and including) this route, published pages only.
export function breadcrumbTrail(id: string): SiteRoute[] {
  const trail: SiteRoute[] = [];
  let current = getRoute(id);

  while (current) {
    trail.unshift(current);
    current = parents[current.id] ? getRoute(parents[current.id]) : undefined;
  }

  const home = getRoute("home");
  if (home && trail[0]?.id !== "home") trail.unshift(home);

  return trail.filter((route) => route.published);
}

// Which quote category each page preselects.
const intents: Record<string, IntentKey> = {
  "rental-short": "rental",
  "rental-long": "rental",
  sales: "new",
  "sales-new": "new",
  "sales-used": "used",
  maintenance: "service",
  parts: "parts",
  batteries: "parts",
  warehouse: "warehouse",
  material: "warehouse",
  racking: "warehouse",
  cleaning: "cleaning",
  "ind-logistics": "warehouse",
  "ind-manufacturing": "warehouse",
  "ind-construction": "rental",
  "ind-food-beverage": "warehouse",
  "ind-retail": "warehouse",
  "ind-hospitality": "cleaning",
  article: "rental",
};

export function routeIntent(id: string): IntentKey | undefined {
  return intents[id];
}

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
