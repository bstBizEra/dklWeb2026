import {
  BatteryCharging,
  Boxes,
  Building2,
  ClipboardCheck,
  Factory,
  Forklift,
  HardHat,
  PackageCheck,
  Recycle,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  Warehouse,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AboutCta = {
  label: string;
  href: string;
  variant: "primary" | "secondary" | "light";
};

export type AboutCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  ctaLabel?: string;
};

export type SnapshotMetric = {
  label: string;
  value: string;
  detail: string;
};

export const aboutHeroCtas: AboutCta[] = [
  { label: "Request a Quote", href: "/request-quote", variant: "primary" },
  { label: "View Our Solutions", href: "/#solutions", variant: "secondary" },
  { label: "Contact DK LAO", href: "/contact", variant: "light" },
];

export const aboutHeroBadges = [
  "Established 2010",
  "Rental & Service",
  "Warehouse Solutions",
  "Spare Parts Support",
];

export const companySnapshot: SnapshotMetric[] = [
  {
    label: "Established",
    value: "Since 2010",
    detail: "Industrial equipment support for Laos operations.",
  },
  {
    label: "Core Business",
    value: "Sales, Rental, Service, Parts",
    detail: "One inquiry path across major equipment needs.",
  },
  {
    label: "Main Sector",
    value: "Material Handling",
    detail: "Forklifts, warehouse flow, movement, and storage.",
  },
  {
    label: "Coverage",
    value: "Across Laos",
    detail: "Support structured for business sites and operations.",
  },
  {
    label: "Service Model",
    value: "Onsite & Workshop",
    detail: "Maintenance, inspection, and repair support.",
  },
  {
    label: "Customer Focus",
    value: "Business-ready Solutions",
    detail: "Recommendations shaped by real operating conditions.",
  },
];

export const aboutSolutions: AboutCard[] = [
  {
    title: "Forklift Rental",
    description:
      "Short-term and long-term forklift rental for warehouses, factories, logistics operators, construction sites, and project-based operations.",
    href: "/forklift-rental",
    ctaLabel: "Ask for Rental Price",
    icon: Forklift,
  },
  {
    title: "New & Used Forklift Sales",
    description:
      "Equipment recommendations based on capacity, lift height, power type, working environment, usage period, and operational requirements.",
    href: "/forklift-sales",
    ctaLabel: "Browse Forklifts",
    icon: ShoppingCart,
  },
  {
    title: "Maintenance & Repair Services",
    description:
      "Preventive maintenance, onsite service, workshop repair, inspection, battery and charger support, and technical service.",
    href: "/maintenance-service",
    ctaLabel: "Book Maintenance Service",
    icon: Wrench,
  },
  {
    title: "Spare Parts & Accessories",
    description:
      "Forklift parts, batteries, chargers, forks, attachments, safety lights, tires, hydraulic parts, filters, and related components.",
    href: "/spare-parts",
    ctaLabel: "Request Spare Parts",
    icon: PackageCheck,
  },
  {
    title: "Warehouse & Material Handling Solutions",
    description:
      "Racking, shelving, storage systems, safety equipment, workstations, picking bins, and operational support equipment.",
    href: "/warehouse-equipment",
    ctaLabel: "Explore Warehouse Solutions",
    icon: Warehouse,
  },
  {
    title: "Professional Cleaning Equipment",
    description:
      "Vacuum cleaners, wet and dry vacuum machines, scrubber dryers, sweepers, and heavy-duty cleaning machines for commercial and industrial facilities.",
    href: "/cleaning-equipment",
    ctaLabel: "Get Recommendation",
    icon: Sparkles,
  },
];

export const aboutTrustPoints: AboutCard[] = [
  {
    title: "One-stop industrial equipment partner",
    description:
      "Sales, rental, service, parts, warehouse, and cleaning workflows connected through one DK LAO team.",
    icon: Boxes,
  },
  {
    title: "Flexible rental options",
    description:
      "Rental conversations can match operating period, site conditions, capacity needs, and delivery requirements.",
    icon: Truck,
  },
  {
    title: "Technical service support",
    description:
      "Maintenance and repair support helps reduce downtime, improve safety, and extend equipment life.",
    icon: Wrench,
  },
  {
    title: "Spare parts supply",
    description:
      "Parts inquiries can include brand, model, serial number, urgency, and future attachment support.",
    icon: PackageCheck,
  },
  {
    title: "Warehouse productivity solutions",
    description:
      "Recommendations can connect equipment, racking, storage, and workflow improvements.",
    icon: Warehouse,
  },
  {
    title: "Practical recommendations",
    description:
      "Equipment guidance starts from workload, site conditions, safety requirements, and budget.",
    icon: ClipboardCheck,
  },
  {
    title: "Professional facility cleaning",
    description:
      "Cleaning equipment support for warehouses, factories, offices, hotels, logistics centers, and retail spaces.",
    icon: Sparkles,
  },
  {
    title: "Direct inquiry response",
    description:
      "Visitors can move from requirement to quote, delivery, service, and long-term support.",
    icon: ShieldCheck,
  },
];

export const servedIndustries: AboutCard[] = [
  {
    title: "Logistics & Transportation",
    description: "Fleet, loading, unloading, and movement support.",
    icon: Truck,
  },
  {
    title: "Warehousing & Distribution",
    description: "Storage, handling, picking, and daily equipment flow.",
    icon: Warehouse,
  },
  {
    title: "Manufacturing",
    description: "Factory movement, maintenance, cleaning, and production support.",
    icon: Factory,
  },
  {
    title: "Retail & Wholesale",
    description: "Stock movement, back-of-house logistics, and facility support.",
    icon: Building2,
  },
  {
    title: "Construction",
    description: "Site movement and project-based equipment access.",
    icon: HardHat,
  },
  {
    title: "Food & Beverage",
    description: "Warehouse handling and facility cleaning for controlled operations.",
    icon: BatteryCharging,
  },
  {
    title: "Hospitality",
    description: "Cleaning, storage, and operations support for facility teams.",
    icon: Sparkles,
  },
  {
    title: "Industrial Facilities",
    description: "Durable equipment support for demanding environments.",
    icon: Recycle,
  },
  {
    title: "Government & Institutional Operations",
    description: "Quotation-based equipment and service support.",
    icon: ClipboardCheck,
  },
];

export const servicePromiseSteps = [
  "Understand your equipment or service requirement",
  "Recommend the right product, rental plan, spare part, or service package",
  "Prepare a clear quotation",
  "Support delivery, installation, service, or maintenance",
  "Provide ongoing after-sales support",
  "Help your business operate with better reliability and productivity",
];
