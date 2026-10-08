import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IndustrialFooter } from "@/components/dklao/industrial-footer";
import { QuoteRequestForm } from "@/components/dklao/quote-request-form";
import { SiteHeader } from "@/components/dklao/site-header";
import type { QuoteRequestInput } from "@/lib/validation/leads";

type Topic = {
  title: string;
  description: string;
  category: string;
  leadType: QuoteRequestInput["leadType"];
  details: string[];
};

const topics: Record<string, Topic> = {
  "forklift-rental": {
    title: "Forklift rental", category: "Forklift rental", leadType: "RENTAL_INQUIRY",
    description: "Tell us about your site, the load, lift height and rental period so an advisor can review your requirement.",
    details: ["Start and end dates or expected duration", "Load and lift height", "Site conditions and operating hours", "Delivery or operator needs"],
  },
  "forklift-sales": {
    title: "Forklift sales", category: "New forklift sales", leadType: "QUOTE_REQUEST",
    description: "Ask DK LAO to assess new or used equipment for your operation. Availability and specifications are confirmed individually.",
    details: ["Application and load", "Lift height and environment", "New or used preference", "Timing and site"],
  },
  "forklift-sales/new": {
    title: "New forklifts", category: "New forklift sales", leadType: "QUOTE_REQUEST",
    description: "Share your operating requirements for a new forklift recommendation and quotation.",
    details: ["Application and load", "Lift height and environment", "Power preference, if known", "Timing and site"],
  },
  "forklift-sales/used": {
    title: "Used forklifts", category: "Used forklift inquiry", leadType: "USED_FORKLIFT_INQUIRY",
    description: "Tell us your application and timing. DK LAO will confirm any current used equipment options before making an offer.",
    details: ["Application and load", "Lift height and environment", "Preferred equipment condition", "Timing and site"],
  },
  "spare-parts": {
    title: "Spare parts", category: "Spare parts", leadType: "SPARE_PARTS_INQUIRY",
    description: "Send the part reference and equipment details for a compatibility and availability review.",
    details: ["Part description or reference", "Equipment brand, model and serial number", "Quantity", "Urgency"],
  },
  "maintenance-service": {
    title: "Maintenance service", category: "Maintenance service", leadType: "SERVICE_BOOKING",
    description: "Describe the equipment, symptoms and location so the service team can triage your request.",
    details: ["Brand, model and serial number if available", "Symptoms or service need", "Site location", "Safety urgency"],
  },
  "material-handling": {
    title: "Material handling", category: "Material handling", leadType: "QUOTE_REQUEST",
    description: "Share what you need to move, lift or store. An advisor can discuss suitable equipment paths.",
    details: ["Material and load", "Movement distance and lift height", "Site constraints", "Timing"],
  },
  "warehouse-equipment": {
    title: "Warehouse equipment", category: "Warehouse solutions", leadType: "QUOTE_REQUEST",
    description: "Describe your storage or material-flow problem and whether a site survey is needed.",
    details: ["Site dimensions or survey need", "Storage and load requirements", "Aisle and flow constraints", "Timing"],
  },
  "batteries-chargers": {
    title: "Batteries and chargers", category: "Batteries and chargers", leadType: "QUOTE_REQUEST",
    description: "Provide equipment and usage details so compatibility can be reviewed before a recommendation.",
    details: ["Equipment model", "Battery or charger reference", "Operating hours", "Site power information"],
  },
  "cleaning-equipment": {
    title: "Cleaning equipment", category: "Cleaning equipment", leadType: "CLEANING_EQUIPMENT_RECOMMENDATION",
    description: "Tell us about the floor, area and operating conditions for a cleaning equipment recommendation.",
    details: ["Floor and site type", "Area to clean", "Dirt or application", "Operating conditions and timing"],
  },
  "request-quote": {
    title: "Request a quote or site survey", category: "Warehouse solutions", leadType: "QUOTE_REQUEST",
    description: "Share your equipment, service or site-survey requirement. DK LAO will review the details before quoting.",
    details: ["Equipment or service need", "Site and application", "Timing", "Any known constraints"],
  },
  contact: {
    title: "Contact DK LAO", category: "General inquiry", leadType: "CONTACT_GENERAL",
    description: "Send your question to DK LAO and include enough context for the right team to follow up.",
    details: ["What you need help with", "Equipment or service category", "Location", "Preferred contact details"],
  },
  "knowledge-center": {
    title: "Knowledge center", category: "General inquiry", leadType: "CONTACT_GENERAL",
    description: "Guides are being reviewed. Ask an advisor about your application while verified material is prepared.",
    details: ["Your question", "Equipment model or service", "Site context", "Any safety concern"],
  },
};

export function generateStaticParams() { return Object.keys(topics).map((path) => ({ slug: path.split("/") })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const key = (await params).slug.join("/");
  const topic = topics[key];
  return topic ? { title: topic.title, description: topic.description, alternates: { canonical: `/${key}` } } : {};
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const topic = topics[(await params).slug.join("/")];
  if (!topic) notFound();
  return <main id="main-content" className="dk-page">
    <SiteHeader />
    <section className="dk-section topic-page"><div className="dk-container topic-page__grid">
      <div>
        <p className="dk-eyebrow">DK LAO solutions</p>
        <h1>{topic.title}</h1>
        <p className="dk-section-copy">{topic.description}</p>
        <h2>Helpful details to share</h2>
        <ul>{topic.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
        <p>Prices, stock and technical suitability are confirmed by DK LAO after review.</p>
        <Link className="dk-button dk-button-light" href="/">Back to all solutions</Link>
      </div>
      <QuoteRequestForm initialCategory={topic.category} leadType={topic.leadType} />
    </div></section>
    <IndustrialFooter />
  </main>;
}
