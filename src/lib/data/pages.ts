import type { Metadata } from "next";

import { getRoute, isPublishedRoute, quoteHref } from "@/lib/data/routes";
import { siteFacts, type FactKey, type SiteFacts } from "@/lib/data/site-facts";

export type PageItem = {
  title: string;
  description?: string;
  // Link target. Ignored until that route is published.
  routeId?: string;
  // Description comes from this owner-confirmed fact. The item is hidden until it is set.
  fact?: FactKey;
};

export type PageSection = {
  kind: "cards" | "steps" | "table" | "faq";
  title: string;
  intro?: string;
  items: PageItem[];
};

export type PageContent = {
  id: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  ctas: { label: string; href: string }[];
  sections: PageSection[];
  closing?: {
    title: string;
    copy: string;
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
};

export type ResolvedSection = Omit<PageSection, "items"> & {
  items: { title: string; description?: string; href?: string }[];
};

export function visibleSections(
  page: PageContent,
  facts: SiteFacts = siteFacts,
): ResolvedSection[] {
  return page.sections
    .map((section) => ({
      ...section,
      items: section.items.flatMap((item) => {
        const description = item.fact ? facts[item.fact] : item.description;

        if (item.fact && !description) {
          return [];
        }

        const route = item.routeId ? getRoute(item.routeId) : undefined;

        return [
          {
            title: item.title,
            description: description ?? undefined,
            href: route && isPublishedRoute(route.id) ? route.href : undefined,
          },
        ];
      }),
    }))
    .filter((section) => section.items.length > 0);
}

export function buildMetadata(page: PageContent): Metadata {
  const route = getRoute(page.id);
  const url = route?.href ?? "/";

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url,
      images: [
        {
          url: "/images/hero/forklift-product-hero.png",
          width: 1672,
          height: 941,
          alt: "DK LAO forklift and industrial equipment support",
        },
      ],
    },
  };
}

export const requestQuotePage: PageContent = {
  id: "quote",
  metaTitle: "Request a Quote",
  metaDescription:
    "Request a quotation from DK LAO for forklift rental, sales, service, spare parts, warehouse or cleaning equipment in Laos.",
  eyebrow: "Request a Quote",
  h1: "Request a Quote",
  intro:
    "Choose what you need and tell us about your site. We reply with a quotation. Pricing is by quotation and availability is on request.",
  ctas: [],
  sections: [
    {
      kind: "steps",
      title: "What happens next",
      items: [
        { title: "We review your request", description: "A DK LAO advisor reads your details." },
        { title: "We contact you", description: "An advisor confirms the details and answers your questions." },
        { title: "You receive a quotation", description: "Based on your equipment, site and period." },
      ],
    },
    {
      kind: "faq",
      title: "Before you send",
      items: [
        { title: "Do I need exact specifications?", description: "No. Describe the job and the site, and we recommend options." },
        { title: "How is pricing decided?", description: "Pricing is by quotation, based on the equipment or service, the period and the site." },
        { title: "How fast will you reply?", fact: "quoteReplyTime" },
      ],
    },
  ],
};

export const contactPage: PageContent = {
  id: "contact",
  metaTitle: "Contact DK LAO: Quotes & Support in Laos",
  metaDescription:
    "Contact DK LAO for forklift rental, sales, service, spare parts and cleaning equipment in Laos. Send an inquiry and an advisor will reply.",
  eyebrow: "Contact DK LAO",
  h1: "Contact DK LAO",
  intro: "Tell us what you need. A DK LAO advisor replies with a clear next step.",
  ctas: [],
  sections: [
    {
      kind: "table",
      title: "Reach us directly",
      items: [
        { title: "Phone", fact: "phone" },
        { title: "WhatsApp", fact: "whatsapp" },
        { title: "Email", fact: "email" },
        { title: "Address", fact: "address" },
        { title: "Opening hours", fact: "hours" },
        { title: "Service areas", fact: "serviceAreas" },
        { title: "Typical reply time", fact: "quoteReplyTime" },
      ],
    },
    {
      kind: "cards",
      title: "Need something specific?",
      items: [
        { title: "Ask for a rental price", description: "Send load, lift height, site and dates.", routeId: "rental" },
        { title: "Request a quote", description: "One form for any equipment or service.", routeId: "quote" },
      ],
    },
  ],
};

export const forkliftRentalPage: PageContent = {
  id: "rental",
  metaTitle: "Forklift Rental in Laos: Short & Long Term",
  metaDescription:
    "Rent forklifts in Laos for projects, peak seasons or steady operations. Tell us load, height and site and we send a rental quotation.",
  eyebrow: "Forklift rental",
  h1: "Forklift Rental in Laos",
  intro:
    "Short-term for projects and peaks. Long-term for steady operations. Tell us what you lift and where, and we send a rental quotation.",
  ctas: [
    { label: "Ask for Rental Price", href: quoteHref("rental", "/forklift-rental") },
    { label: "Talk to DK LAO Advisor", href: "/contact" },
  ],
  sections: [
    {
      kind: "cards",
      title: "Pick the rental that fits your period",
      items: [
        {
          title: "Short-term rental",
          description: "For projects, peak seasons and one-off lifting jobs.",
          routeId: "rental-short",
        },
        {
          title: "Long-term rental",
          description: "For steady operations that need equipment for months or years.",
          routeId: "rental-long",
        },
      ],
    },
    {
      kind: "table",
      title: "What to tell us so we can quote fast",
      items: [
        { title: "Load weight", description: "The heaviest pallet or item you lift." },
        { title: "Lift height", description: "The highest rack or stack you reach." },
        { title: "Power type", description: "Electric, diesel or LPG preference, if you have one." },
        { title: "Site", description: "Indoor or outdoor, floor surface, ramps and access." },
        { title: "Period", description: "Start date and expected duration." },
        { title: "Delivery", description: "Site address and access conditions." },
      ],
    },
    {
      kind: "steps",
      title: "How rental works",
      items: [
        { title: "Request", description: "Send your load, height, site and dates." },
        { title: "Recommend", description: "We match equipment to your job." },
        { title: "Confirm", description: "You receive a quotation and agree the schedule." },
        { title: "Support", description: "Contact us if the job changes." },
      ],
    },
    {
      kind: "faq",
      title: "Rental questions",
      items: [
        { title: "How is rental priced?", description: "Rental is quotation-based. Price depends on the unit, the period and the site." },
        { title: "What should I send?", description: "Load, lift height, site, dates and the delivery address." },
        { title: "Do you deliver?", fact: "deliveryCoverage" },
        { title: "Who maintains the forklift during rental?", fact: "maintenanceTerms" },
        { title: "Can I buy the forklift after renting?", fact: "rentToBuyTerms" },
      ],
    },
  ],
  closing: {
    title: "Get your rental quotation",
    copy: "Tell us the load, lift height, site and dates. We reply with a rental quotation.",
    primary: { label: "Ask for Rental Price", href: quoteHref("rental", "/forklift-rental") },
    secondary: { label: "Talk to DK LAO Advisor", href: "/contact" },
  },
};
