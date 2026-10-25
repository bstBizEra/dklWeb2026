import type { Metadata } from "next";

import { breadcrumbTrail, getRoute, isPublishedRoute, quoteHref, relatedRoutes, type SiteRoute } from "@/lib/data/routes";
import { hasConfirmMarker } from "@/lib/data/confirm";
import { siteFacts, type FactKey, type SiteFacts } from "@/lib/data/site-facts";
import { shareImage } from "./share";

// A card's own editorial section below the cards: an opening paragraph, up to three key figures,
// two or more topics with their own headings, and an optional practical checklist.
export type ItemDetails = {
  lead: string;
  facts?: { value: string; label: string }[];
  topics: { heading: string; body: string }[];
  checklist?: { heading: string; items: string[] };
};

// Enough to publish: an opening paragraph and at least two complete topics.
export function isCompleteDetails(details: ItemDetails | undefined): details is ItemDetails {
  const topics = details?.topics.filter((topic) => topic.heading.trim() && topic.body.trim()) ?? [];
  return Boolean(details?.lead.trim()) && topics.length >= 2;
}

// Same id for the card's "Read more" link and its section, built from the card title.
export const detailAnchor = (title: string) =>
  `detail-${title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export type PageItem = {
  title: string;
  description?: string;
  // Cards only: an editorial section of its own under the cards, reached from the card's "Read more".
  details?: ItemDetails;
  // Link target. Ignored until that route is published.
  routeId?: string;
  // Description comes from this owner-confirmed fact. The item is hidden until it is set.
  fact?: FactKey;
  // Draft wording the owner has not confirmed yet. Hidden on the site until this is cleared.
  needsConfirmation?: boolean;
};

export type SectionKind = "cards" | "steps" | "table" | "faq" | "list" | "stats" | "chips" | "text" | "form";

export const sectionKinds: readonly SectionKind[] = ["cards", "steps", "table", "faq", "list", "stats", "chips", "text", "form"];

export type PageSection = {
  kind: SectionKind;
  title: string;
  intro?: string;
  // Paragraph for "text" sections.
  body?: string;
  items: PageItem[];
  needsConfirmation?: boolean;
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

export type ResolvedSection = Omit<PageSection, "items" | "needsConfirmation"> & {
  items: { title: string; description?: string; href?: string; details?: ItemDetails; anchor?: string; routeId?: string }[];
};

export function visibleSections(
  page: PageContent,
  facts: SiteFacts = siteFacts,
): ResolvedSection[] {
  return page.sections
    .filter((section) => !section.needsConfirmation)
    .map((section) => ({
      kind: section.kind,
      title: section.title,
      intro: section.intro,
      body: section.body,
      items: section.items.flatMap((item) => {
        if (item.needsConfirmation) {
          return [];
        }

        const description = item.fact ? facts[item.fact] : item.description;

        if (item.fact && !description) {
          return [];
        }

        // A question, table row or figure without its answer or value is not worth showing.
        if ((section.kind === "faq" || section.kind === "table" || section.kind === "stats") && !description) {
          return [];
        }

        // Defence in depth: planning markers such as [CONFIRM] never render, whatever the source.
        if (hasConfirmMarker(item.title) || hasConfirmMarker(description)) {
          return [];
        }

        const route = item.routeId ? getRoute(item.routeId) : undefined;

        return [
          {
            title: item.title,
            description: description ?? undefined,
            href: route && isPublishedRoute(route.id) ? route.href : undefined,
            routeId: item.routeId,
            // A detail section only for cards, and only when its content is complete.
            ...(section.kind === "cards" && isCompleteDetails(item.details) ? { details: item.details, anchor: detailAnchor(item.title) } : {}),
          },
        ];
      }),
    }))
    .filter((section) => {
      if (hasConfirmMarker(section.title) || hasConfirmMarker(section.body)) return false;
      // Text and form sections carry no items of their own.
      return section.items.length > 0 || section.kind === "form" || Boolean(section.body);
    });
}

// "Related solutions" without repeats: pages already linked from a card on this page, pages in the
// breadcrumb and the quote and contact pages (the page has its own calls to action) are left out.
export function relatedToShow(pageId: string, sections: ResolvedSection[]): SiteRoute[] {
  const linked = new Set(sections.flatMap((section) => section.items.map((item) => item.href)));
  const trail = new Set(breadcrumbTrail(pageId).map((route) => route.id));

  // At most one row of four, so a lone card never hangs on a second row.
  return relatedRoutes(pageId)
    .filter((route) => route.group !== "conversion" && !trail.has(route.id) && !linked.has(route.href))
    .slice(0, 4);
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
      images: [shareImage(page.id)],
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
        { title: "How is pricing decided?", description: "Pricing is by quotation. It depends on the equipment specification or service, the period and the site." },
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
        { title: "Facebook", fact: "facebook" },
        { title: "YouTube", fact: "youtube" },
        { title: "X (Twitter)", fact: "twitter" },
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
    { label: "Talk to a DK LAO Advisor", href: "/contact" },
  ],
  sections: [
    {
      kind: "cards",
      title: "Pick the rental that fits your period",
      items: [
        {
          title: "Short-term rental",
          description: "Days to months of cover for projects, seasonal peaks, stock overflow, or while your own truck is being repaired.",
          routeId: "rental-short",
        },
        {
          title: "Long-term rental",
          description: "Typically one to five years of equipment for steady, year-round operations, without the upfront cost of buying.",
          routeId: "rental-long",
        },
      ],
    },
    {
      kind: "cards",
      title: "Planning your rental",
      items: [
        {
          title: "Short or long term?",
          description: "How long you need the truck, and how sure you are, decides the rental period.",
          details: {
            lead: "The right rental period depends on how long you need the truck and how sure you are about that need. Short-term rental buys flexibility; long-term rental buys a steady truck at a planned monthly cost.",
            facts: [
              { value: "Days–months", label: "short-term cover" },
              { value: "1–5 years", label: "typical long-term rental" },
            ],
            topics: [
              {
                heading: "When short-term makes sense",
                body: "A project with an end date, a harvest or holiday peak, a stock overflow, or your own truck off for repair. You pay for the weeks you use, and the truck goes back when the work ends.",
              },
              {
                heading: "When long-term makes sense",
                body: "Steady work all year. A long rental fixes the monthly cost, keeps cash in your business and avoids the upfront price of buying. If you expect to keep the same truck for many years, compare the total rental cost with buying, new or used.",
              },
              {
                heading: "Not sure yet? Start short",
                body: "A short rental shows how many hours the truck really works, which capacity you need and how high it must lift. That evidence makes a long-term rental or a purchase an easier decision.",
              },
            ],
            checklist: {
              heading: "Questions that decide the period",
              items: [
                "How many months a year will the truck work?",
                "Is the workload steady or seasonal?",
                "Does the project have an end date?",
                "Would you rather keep cash or own the truck?",
              ],
            },
          },
        },
        {
          title: "Matching the truck to the job",
          description: "Load, height and site decide the truck; small details avoid costly mismatches.",
          details: {
            lead: "A rental quotation is only as good as the details behind it. A truck that is too small cannot lift your load safely; one that is too big costs more and may not fit your aisles, doors or containers.",
            facts: [{ value: "500 mm", label: "usual load centre behind a capacity rating" }],
            topics: [
              {
                heading: "Weight and size of the load",
                body: "Forklift capacity is rated with the load's centre of gravity at a set distance from the fork face, usually 500 mm. Long or bulky loads sit further out and reduce what the truck can safely lift, so tell us the size as well as the weight.",
              },
              {
                heading: "Height and clearance",
                body: "Give us the highest point the forks must reach and the lowest door, beam or container the truck must pass through. Lift height and the mast's lowered height both matter, especially when you load containers.",
              },
              {
                heading: "Floor and surroundings",
                body: "Smooth concrete, a rough yard, slopes, rain and indoor air all change which truck and tyres suit the job. A few photos of the site and the route help us choose the right truck the first time.",
              },
            ],
            checklist: {
              heading: "Mismatches we help you avoid",
              items: [
                "A load longer than the truck's rated load centre",
                "A mast too tall to enter a door or container",
                "Indoor tyres on a rough outdoor yard",
                "A truck sized for the average load, not the heaviest",
              ],
            },
          },
        },
        {
          title: "Operator safety on site",
          description: "Trained operators and a check before every shift, from the first day.",
          details: {
            lead: "A rented forklift works on your site, with your operators. A few habits from the first day protect people, the load and the truck.",
            facts: [{ value: "Every shift", label: "check before use" }],
            topics: [
              {
                heading: "Trained operators only",
                body: "Forklifts should be driven only by people trained for that type of truck. If your team is new to the truck you are renting, plan their training before the rental starts, not after the first incident.",
              },
              {
                heading: "Check before every shift",
                body: "Operators walk around the truck before use: tyres, forks, chains, hydraulic leaks, brakes, horn and lights, and for electric trucks the battery charge and cables. A fault is reported, not worked around.",
              },
              {
                heading: "Tell us when the job changes",
                body: "A heavier load, a new site, a longer period or a fault: contact us early, so the rental keeps fitting the job and a small problem does not become a stopped truck.",
              },
            ],
            checklist: {
              heading: "Before the first lift",
              items: [
                "Delivery route and unloading point agreed",
                "Operators trained for the truck type",
                "Floor and ramps checked for the truck's weight",
                "A contact number for faults shared with the site team",
              ],
            },
          },
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
        { title: "How is rental priced?", description: "Rental is quotation-based. Price depends on the equipment specification, the rental period and the site." },
        { title: "What should I send?", description: "Load, lift height, site, dates and the delivery address." },
        { title: "Which forklift brands do you supply?", fact: "brands" },
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
    secondary: { label: "Talk to a DK LAO Advisor", href: "/contact" },
  },
};
