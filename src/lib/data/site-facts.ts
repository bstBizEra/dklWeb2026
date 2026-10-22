// Owner-confirmed business facts. A null value means "not confirmed yet".
// Any page item bound to a null fact is hidden, so nothing unverified is published.
// Fill a value here (and nowhere else) once the owner has confirmed it.
export type FactKey =
  | "phone"
  | "whatsapp"
  | "facebook"
  | "email"
  | "address"
  | "hours"
  | "serviceAreas"
  | "quoteReplyTime"
  | "deliveryCoverage"
  | "maintenanceTerms"
  | "rentToBuyTerms"
  | "brands";

export type SiteFacts = Record<FactKey, string | null>;


// Confirmed by the owner on 22 October 2026, in the owner's own words where possible.
// phone and whatsapp stay null: the owner sent masked numbers (+85620xxxxxxxx).
export const siteFacts: SiteFacts = {
  phone: null,
  whatsapp: null,
  facebook: "https://www.facebook.com/DKLAOonline",
  email: null,
  address: null,
  hours: "Open 24/7. AI agents and human advisors work together.",
  serviceAreas:
    "Based in Vientiane. We also serve customers online through Facebook, WhatsApp and phone.",
  quoteReplyTime:
    "Send a request any time, 24/7. AI agents and human advisors work together to reply.",
  deliveryCoverage: null,
  maintenanceTerms: null,
  rentToBuyTerms: null,
  brands:
    "We supply the brand that meets your requirement. Tell us your load, lift height and site and we recommend.",
};

export const factKeys = Object.keys(siteFacts) as FactKey[];

export type ContactChannel = { label: string; href: string; text: string; external: boolean };

// Phone, WhatsApp and Facebook are shown together wherever contact details appear,
// because customers combine all three. Only channels with a confirmed value are returned.
export function contactChannels(facts: SiteFacts = siteFacts): ContactChannel[] {
  const channels: ContactChannel[] = [];

  if (facts.phone) {
    channels.push({
      label: "Phone",
      href: `tel:${facts.phone.replace(/[^\d+]/g, "")}`,
      text: facts.phone,
      external: false,
    });
  }

  if (facts.whatsapp) {
    channels.push({
      label: "WhatsApp",
      href: `https://wa.me/${facts.whatsapp.replace(/\D/g, "")}`,
      text: facts.whatsapp,
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

  if (facts.email) {
    channels.push({ label: "Email", href: `mailto:${facts.email}`, text: facts.email, external: false });
  }

  return channels;
}
