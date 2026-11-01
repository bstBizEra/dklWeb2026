import {
  ArrowRight,
  BatteryCharging,
  Forklift,
  Package,
  Sparkles,
  Tag,
  Warehouse,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { libraryImage } from "@/lib/data/library";
import { getRoute, isPublishedRoute, quoteHref } from "@/lib/data/routes";
import { localized } from "@/lib/i18n/localize";
import { loNavigation } from "@/messages/lo/navigation";

export type NavLink = { label: string; routeId: string; description?: string };
export type NavItem = { label: string; routeId?: string; children?: NavLink[] };

export type ResolvedNavLink = { label: string; href: string; description?: string };
export type ResolvedNavItem = { label: string; href?: string; children?: ResolvedNavLink[] };

const solution = (routeId: string, label: string): NavLink => ({
  label,
  routeId,
  description: getRoute(routeId)?.blurb,
});

// Used when the CMS has no saved menu. Solutions is a dropdown, the rest are direct links.
export const defaultNavigation: NavItem[] = [
  {
    label: "Solutions",
    children: [
      solution("rental", "Forklift Rental"),
      solution("sales", "Forklifts for Sale"),
      solution("maintenance", "Maintenance Service"),
      solution("parts", "Spare Parts"),
      solution("batteries", "Batteries & Chargers"),
      solution("warehouse", "Warehouse Equipment"),
      solution("cleaning", "Cleaning Equipment"),
    ],
  },
  { label: "Industries", routeId: "industries" },
  { label: "Knowledge", routeId: "knowledge" },
  { label: "About", routeId: "about" },
  { label: "Contact", routeId: "contact" },
];

export type MenuLink = ResolvedNavLink & { icon: LucideIcon };
export type MenuGroup = { title: string; links: MenuLink[] };
export type MenuPromo = { image: string; imageAlt: string; title: string; copy: string; ctaLabel: string; ctaHref: string };

// Solutions is split the way buyers arrive: by the equipment they need, or by the service and parts that
// keep it running. A page added in the CMS that is not listed here lands under Equipment with an arrow icon.
const menuGroups = [
  { id: "equipment", title: "Equipment" },
  { id: "service", title: "Service & parts" },
] as const;

const solutionInfo: Record<string, { icon: LucideIcon; group: (typeof menuGroups)[number]["id"] }> = {
  "/forklift-rental": { icon: Forklift, group: "equipment" },
  "/forklift-sales": { icon: Tag, group: "equipment" },
  "/warehouse-equipment": { icon: Warehouse, group: "equipment" },
  "/cleaning-equipment": { icon: Sparkles, group: "equipment" },
  "/maintenance-service": { icon: Wrench, group: "service" },
  "/spare-parts": { icon: Package, group: "service" },
  "/batteries-chargers": { icon: BatteryCharging, group: "service" },
};

// Shared by the desktop mega menu and the phone menu, so both list the same groups in the same order.
// `titles` are the group titles in the page's language (navigationFor(locale).menuGroupTitles).
export function groupMenuLinks(links: ResolvedNavLink[], titles: string[] = menuGroups.map((group) => group.title)): MenuGroup[] {
  return menuGroups.flatMap((group, index) => {
    const groupLinks = links
      .filter((link) => (solutionInfo[link.href]?.group ?? "equipment") === group.id)
      .map((link) => ({ ...link, icon: solutionInfo[link.href]?.icon ?? ArrowRight }));
    return groupLinks.length > 0 ? [{ title: titles[index], links: groupLinks }] : [];
  });
}

// The card beside the Solutions links, for visitors who are not sure which page they need yet.
export const solutionsPromo: MenuPromo = {
  image: libraryImage("rental"),
  imageAlt: "DK LAO rental forklifts parked outside the DK LAO office in Vientiane",
  title: "Not sure which solution fits?",
  copy: "Tell us the load, site and timing. An advisor recommends the equipment and sends a quotation.",
  ctaLabel: "Request a Quote",
  ctaHref: quoteHref(),
};

// Links to pages that are not published are dropped, and a dropdown left with no links disappears.
export function resolveNavigation(items: NavItem[] = defaultNavigation): ResolvedNavItem[] {
  return items.flatMap((item): ResolvedNavItem[] => {
    if (item.children?.length) {
      const children = item.children.flatMap((child): ResolvedNavLink[] => {
        const route = getRoute(child.routeId);
        return route && isPublishedRoute(route.id)
          ? [{ label: child.label, href: route.href, description: child.description }]
          : [];
      });
      return children.length > 0 ? [{ label: item.label, children }] : [];
    }

    const route = item.routeId ? getRoute(item.routeId) : undefined;
    return route && isPublishedRoute(route.id) ? [{ label: item.label, href: route.href }] : [];
  });
}

// Built-in menu, menu group titles and promo card per locale. Lao text: src/messages/lo/navigation.ts.
// The CMS menu (Navigation global) is localized in the CMS itself.
export type NavigationText = { defaultNavigation: NavItem[]; menuGroupTitles: string[]; solutionsPromo: MenuPromo };
export const navigationFor = localized<NavigationText>(
  { defaultNavigation, menuGroupTitles: menuGroups.map((group) => group.title), solutionsPromo },
  loNavigation,
);
