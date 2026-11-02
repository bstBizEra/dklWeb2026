import { localized } from "@/lib/i18n/localize";
import { loSiteFacts } from "@/messages/lo/site-facts";

// Owner-confirmed business facts. A null value means "not confirmed yet".
// Any page item bound to a null fact is hidden, so nothing unverified is published.
// Fill a value here (and nowhere else) once the owner has confirmed it.
export type FactKey =
  | "phone"
  | "whatsapp"
  | "facebook"
  | "youtube"
  | "twitter"
  | "email"
  | "address"
  | "hours"
  | "serviceAreas"
  | "quoteReplyTime"
  | "deliveryCoverage"
  | "maintenanceTerms"
  | "rentToBuyTerms"
  | "brands"
  | "referenceClients";

export type SiteFacts = Record<FactKey, string | null>;


// Other facts were confirmed by the owner on 22 October 2026, in the owner's own words where possible.
// Contact details were supplied by the owner on 23 October 2026. A fact may hold several values
// separated by commas: each becomes its own link. Sales number first, then the aftersales numbers.
export const siteFacts: SiteFacts = {
  phone: "+85621 480 248",
  whatsapp: "Sales: +85620 2802 3355, Aftersales: +85620 2323 1922, Aftersales: +85620 2323 1911",
  facebook: "https://www.facebook.com/DKLAOonline",
  youtube: "https://www.youtube.com/channel/UCONgeO8Upbiwk1ba681-Erg",
  twitter: "https://twitter.com/DKLaoTrading",
  email: "info@dklao.com, salescenter@dklao.com",
  address: "Unit 24, Kamphaengmeuang Rd, NongHai Village, Hatxayfong District, Vientiane Capital, Lao PDR",
  hours: "Open 24/7. AI agents and human advisors work together.",
  serviceAreas:
    "Based in Vientiane. We also serve customers online through Facebook, WhatsApp and phone.",
  quoteReplyTime:
    "Send a request any time, 24/7. AI agents and human advisors work together to reply.",
  deliveryCoverage: null,
  maintenanceTerms: null,
  rentToBuyTerms: null,
  // Key account customers from the owner's "Key Account Customers" folder (25 October 2026), plus HOYA and
  // the Ministry of Public Health from the earlier list.
  referenceClients:
    "Beverage: Beerlao, Coca-Cola, Heineken, Pepsi, Tiger Beer | Logistics and power: DHL, Lao Freight Forwarder, NTPC, PTT, Savan Logistics | Mining and chemical: MMG, Phu Bia Mining, KCL, 5N Plus | Others: Lao Telecom, Lao Tobacco, Lao World, CPF, Phonesack Group, HOYA | Government: Ministry of Public Health",
  brands:
    "We supply the brand that meets your requirement. Tell us your load, lift height and site and we recommend.",
};

export const factKeys = Object.keys(siteFacts) as FactKey[];

// Built-in facts per locale: the wording of text facts can be translated, numbers and links stay.
// Lao text: src/messages/lo/site-facts.ts. With a database the CMS Site facts global is used instead.
export const siteFactsFor = localized(siteFacts, loSiteFacts);

export type ContactChannel = { label: string; href: string; text: string; external: boolean };

// Phone, WhatsApp and Facebook are shown together wherever contact details appear,
// because customers combine all three. Only channels with a confirmed value are returned.
const splitValues = (value: string | null): string[] =>
  (value ?? "").split(/[,;\n]/).map((part) => part.trim()).filter(Boolean);

export function contactChannels(facts: SiteFacts = siteFacts): ContactChannel[] {
  const channels: ContactChannel[] = [];

  for (const phone of splitValues(facts.phone)) {
    channels.push({ label: "Phone", href: `tel:${phone.replace(/[^\d+]/g, "")}`, text: phone, external: false });
  }

  // A WhatsApp value may start with a team name and a colon: "Sales: +85620 2802 3355".
  for (const entry of splitValues(facts.whatsapp)) {
    const match = entry.match(/^([^:+\d][^:]*):\s*(.+)$/);
    const team = match ? match[1].trim() : "";
    const number = match ? match[2].trim() : entry;
    channels.push({
      label: team ? `WhatsApp ${team}` : "WhatsApp",
      href: `https://wa.me/${number.replace(/\D/g, "")}`,
      text: number,
      external: true,
    });
  }

  if (facts.facebook) {
    channels.push({
      label: "Facebook",
      href: facts.facebook,
      text: facts.facebook.replace(/^https?:\/\/(www\.)?/, ""),
      external: true,
    });
  }

  const social: [string, string | null][] = [["YouTube", facts.youtube], ["X", facts.twitter]];

  for (const [label, url] of social) {
    if (url) channels.push({ label, href: url, text: url.replace(/^https?:\/\/(www\.)?/, ""), external: true });
  }

  for (const email of splitValues(facts.email)) {
    channels.push({ label: "Email", href: `mailto:${email}`, text: email, external: false });
  }

  return channels;
}
