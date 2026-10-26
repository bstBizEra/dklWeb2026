import { getRoute, publishedRoutes, type SiteRoute } from "@/lib/data/routes";
import type { Locale } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localize";
import { loFooter } from "@/messages/lo/footer";

export type FooterLink = { id: string; href: string; label: string; published: boolean };
export type FooterGroup = { title: string; links: FooterLink[] };

// Short footer wording: the group heading already gives the context, so "Rental" under "Rent & buy" is enough.
// Pages not listed keep their own label.
export const footerLabels: Record<string, string> = {
  rental: "Rental",
  "rental-short": "Short-term",
  "rental-long": "Long-term",
  sales: "For sale",
  "sales-new": "New",
  "sales-used": "Used",
  maintenance: "Maintenance",
  batteries: "Batteries",
  warehouse: "Warehouse",
  racking: "Racking",
  cleaning: "Cleaning",
  about: "About",
  article: "Rental guide",
};

// The footer links to every published page except Home and the conversion pages (the quote and contact
// links sit in their own block). A test fails if a published page is missing from every group.
const groupSpec: { title: string; ids: string[] }[] = [
  { title: "Rent & buy", ids: ["rental", "rental-short", "rental-long", "sales", "sales-new", "sales-used"] },
  { title: "Service & parts", ids: ["maintenance", "parts", "batteries"] },
  { title: "Warehouse & cleaning", ids: ["warehouse", "material", "racking", "cleaning"] },
  { title: "Company & guides", ids: ["about", "industries", "knowledge", "article"] },
];

// Footer wording per locale (labels by route id, group titles by position). Lao text: src/messages/lo/footer.ts.
export type FooterText = { labels: Record<string, string>; groupTitles: string[] };
export const footerTextFor = localized<FooterText>({ labels: footerLabels, groupTitles: groupSpec.map((group) => group.title) }, loFooter);

export function footerGroups(locale: Locale = "en"): FooterGroup[] {
  const text = footerTextFor(locale);
  return groupSpec
    .map((group, index) => ({
      title: text.groupTitles[index],
      links: group.ids
        .map((id) => getRoute(id, locale))
        .filter((route): route is SiteRoute => route !== undefined && route.published)
        .map((route) => ({ id: route.id, href: route.href, published: route.published, label: text.labels[route.id] ?? route.label })),
    }))
    .filter((group) => group.links.length > 0);
}

// Published pages the footer is expected to list. The six industry pages are reached from the Industries
// hub, so the footer lists the hub only and each group stays short.
export function footerRoutes(): SiteRoute[] {
  return publishedRoutes().filter(
    (route) => route.group !== "conversion" && route.id !== "home" && !route.id.startsWith("ind-"),
  );
}

// Contact chips are laid out two per row: Phone | Email, Sales | Email, then the Aftersales numbers.
// Anything that does not fit that pattern (a missing channel, an extra one) follows in its original order.
export function orderFooterChannels<T extends { label: string }>(channels: T[]): T[] {
  const pick = (test: (label: string) => boolean) => channels.filter((channel) => test(channel.label));
  const phones = pick((label) => label === "Phone");
  const emails = pick((label) => label === "Email");
  const aftersales = pick((label) => label.startsWith("WhatsApp Aftersales"));
  const sales = pick((label) => label.startsWith("WhatsApp") && !label.startsWith("WhatsApp Aftersales"));
  const head = [phones[0], emails[0], sales[0], emails[1], ...aftersales].filter((channel): channel is T => channel !== undefined);

  return [...head, ...channels.filter((channel) => !head.includes(channel))];
}
