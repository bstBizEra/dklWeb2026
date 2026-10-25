import { contactChannels, siteFacts, type ContactChannel, type SiteFacts } from "@/lib/data/site-facts";
import { groupMenuLinks, resolveNavigation, type MenuGroup } from "@/lib/data/navigation";
import { routeIntent, routes } from "@/lib/data/routes";
import type { IntentKey } from "@/lib/leads/intents";

// Data for the iPhone web app under /app. Everything comes from owner-confirmed facts and the route
// registry, so the app and the website never disagree. Nothing here is invented: no coordinates, no prices.

// Everything the app keeps on the phone (localStorage). App info lists these and can clear them.
export const appStorageKeys = {
  contact: "dklao-app-contact",
  draft: "dklao-app-draft",
  installHintDismissed: "dklao-app-install-hint-dismissed",
} as const;

const icon = (src: string, size: number, purpose: "any" | "maskable") => ({ src, sizes: `${size}x${size}`, type: "image/png", purpose });

// Web app manifest. Installed, the app opens in its own window with no browser bar (standalone).
// Android also reads: maskable icons (cropped to the phone's icon shape), long-press shortcuts on the
// app icon, and launch_handler so opening a link reuses the open app window instead of a second one.
export const appManifest = {
  name: "DK LAO",
  short_name: "DK LAO",
  description: "Forklift rental, sales, service and spare parts in Laos. Request a quote or book a service.",
  id: "/app",
  start_url: "/app",
  scope: "/app",
  lang: "en",
  dir: "ltr",
  display: "standalone",
  display_override: ["standalone"],
  orientation: "portrait",
  // Android's launch screen: the navy of the app icon, so opening the app reads as one branded moment.
  background_color: "#07111f",
  theme_color: "#07111f",
  categories: ["business", "shopping"],
  prefer_related_applications: false,
  launch_handler: { client_mode: "focus-existing" },
  icons: [
    icon("/app/icon/192", 192, "any"),
    icon("/app/icon/512", 512, "any"),
    icon("/app/icon/maskable-192", 192, "maskable"),
    icon("/app/icon/maskable-512", 512, "maskable"),
  ],
  shortcuts: [
    { name: "Request a Quote", short_name: "Quote", url: "/app/request", icons: [icon("/app/icon/192", 192, "any")] },
    { name: "Book a Service", short_name: "Service", url: "/app/request?type=service", icons: [icon("/app/icon/192", 192, "any")] },
    { name: "Send site location", short_name: "Location", url: "/app/location", icons: [icon("/app/icon/192", 192, "any")] },
  ],
};

// Facebook page -> Messenger chat. Messenger reaches about 60% of adults in Laos, so it sits next to WhatsApp.
export function messengerHref(facebook: string | null): string | undefined {
  const page = facebook?.match(/facebook\.com\/([^/?#]+)/i)?.[1];
  return page ? `https://m.me/${page}` : undefined;
}

export type QuickContact = { id: string; label: string; detail: string; href: string };

// The four one-tap contacts: call, WhatsApp sales, WhatsApp aftersales (service), Messenger.
export function quickContacts(facts: SiteFacts = siteFacts): QuickContact[] {
  const channels = contactChannels(facts);
  const first = (match: (channel: ContactChannel) => boolean) => channels.find(match);
  const picks: (QuickContact | undefined)[] = [];

  const phone = first((c) => c.label === "Phone");
  if (phone) picks.push({ id: "call", label: "Call", detail: phone.text, href: phone.href });

  const sales = first((c) => c.label === "WhatsApp Sales") ?? first((c) => c.label.startsWith("WhatsApp"));
  if (sales) picks.push({ id: "whatsapp-sales", label: "WhatsApp Sales", detail: sales.text, href: sales.href });

  const service = first((c) => c.label === "WhatsApp Aftersales");
  if (service) picks.push({ id: "whatsapp-service", label: "WhatsApp Service", detail: service.text, href: service.href });

  const messenger = messengerHref(facts.facebook);
  if (messenger) picks.push({ id: "messenger", label: "Messenger", detail: "DKLAOonline", href: messenger });

  return picks.filter((pick): pick is QuickContact => pick !== undefined);
}

// Maps links built from the confirmed address. The owner has not confirmed a map pin, so the maps app
// searches the address instead of us guessing coordinates.
export function mapLinks(address: string | null = siteFacts.address) {
  if (!address) return undefined;
  const query = encodeURIComponent(address);

  return {
    appleDirections: `https://maps.apple.com/?daddr=${query}`,
    apple: `https://maps.apple.com/?q=${query}`,
    google: `https://www.google.com/maps/search/?api=1&query=${query}`,
  };
}

export type Coordinates = { latitude: number; longitude: number; accuracy?: number };

// A pin anyone can open (iPhone or Android): used in service requests and shared messages.
export function pinLink({ latitude, longitude }: Coordinates): string {
  return `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
}

// "Share my site location" sends this through WhatsApp to the aftersales team.
export function locationMessage(coords: Coordinates): string {
  const accuracy = coords.accuracy ? ` (accurate to about ${Math.round(coords.accuracy)} m)` : "";
  return `Hello DK LAO, this is our site location for service${accuracy}: ${pinLink(coords)}`;
}

export function whatsappWithText(href: string, text: string): string {
  return `${href}${href.includes("?") ? "&" : "?"}text=${encodeURIComponent(text)}`;
}

export const serviceIssues = ["Breakdown: machine stopped", "Scheduled maintenance", "Inspection or check-up", "Battery or charger problem"] as const;
export type ServiceIssue = (typeof serviceIssues)[number];

export type ServiceRequestDetails = {
  issue: ServiceIssue;
  machine: string;
  siteAddress: string;
  pin?: Coordinates;
  description: string;
};

// A service request goes through the same lead API as quotes, so its details are written into the message.
export function serviceRequestMessage({ issue, machine, siteAddress, pin, description }: ServiceRequestDetails): string {
  return [
    `Service needed: ${issue}`,
    machine.trim() ? `Machine: ${machine.trim()}` : "",
    siteAddress.trim() ? `Site: ${siteAddress.trim()}` : "",
    pin ? `Site pin: ${pinLink(pin)}` : "",
    `Details: ${description.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// "Beerlao, Coca-Cola | Government: Ministry of Public Health" -> one row per client group.
export function clientGroups(referenceClients: string | null = siteFacts.referenceClients) {
  return (referenceClients ?? "")
    .split("|")
    .map((part) => part.match(/^\s*([^:]+):\s*(.+)$/))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => ({ title: match[1].trim(), names: match[2].trim() }));
}

export type AppService =MenuGroup["links"][number] & { intent: IntentKey | undefined };
export type AppServiceGroup = { title: string; links: AppService[] };

// The same Solutions list and groups as the website menu, each with the request category it preselects.
export function appServiceGroups(): AppServiceGroup[] {
  const solutions = resolveNavigation().find((item) => item.children)?.children ?? [];

  return groupMenuLinks(solutions).map((group) => ({
    title: group.title,
    links: group.links.map((link) => {
      const route = routes.find((candidate) => candidate.href === link.href);
      const intent = route ? (routeIntent(route.id) ?? (route.id === "rental" ? "rental" : undefined)) : undefined;
      return { ...link, intent };
    }),
  }));
}
