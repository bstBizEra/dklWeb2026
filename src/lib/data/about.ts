import {
  Boxes,
  Building2,
  CupSoda,
  ClipboardCheck,
  Factory,
  Forklift,
  HardHat,
  Hotel,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  Warehouse,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { localized } from "@/lib/i18n/localize";
import { loAbout } from "@/messages/lo/about";

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

// One primary and one secondary action. The founding year is in the Company snapshot, not in the hero.
export const aboutHeroCtas: AboutCta[] = [
  { label: "Request a Quote", href: "/request-quote", variant: "primary" },
  { label: "Talk to a DK LAO Advisor", href: "/contact", variant: "secondary" },
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
    detail: "Based in Vientiane, with customers served online across Laos.",
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
      "Nilfisk scrubber dryers, sweepers, industrial and commercial vacuums, and pressure washers for commercial and industrial facilities.",
    href: "/cleaning-equipment",
    ctaLabel: "Get a Recommendation",
    icon: Sparkles,
  },
];

export const aboutTrustPoints: AboutCard[] = [
  {
    title: "Forklift and warehouse equipment partner",
    description:
      "Sales, rental, service, parts, warehouse and cleaning from one DK LAO team.",
    icon: Boxes,
  },
  {
    title: "Flexible rental options",
    description:
      "Rental matched to your period, site, loads and delivery.",
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
      "Send the brand, model and serial number and we match the part.",
    icon: PackageCheck,
  },
  {
    title: "Warehouse productivity solutions",
    description:
      "Equipment, racking and storage planned together so goods move faster.",
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

// One card per industry page. The old nine cards were merged where no page exists: transport and warehousing
// share the logistics page, industrial facilities sit with manufacturing, and government and institutional
// buildings sit with hospitality and facilities (the Ministry of Public Health is a confirmed client).
export const servedIndustries: (AboutCard & { href: string })[] = [
  {
    title: "Logistics & Warehousing",
    description: "Loading, storage, picking and dispatch for transport and distribution.",
    icon: Truck,
    href: "/industries/logistics-warehousing",
  },
  {
    title: "Manufacturing & Industrial",
    description: "Material flow, maintenance and cleaning for factories and plants.",
    icon: Factory,
    href: "/industries/manufacturing",
  },
  {
    title: "Construction",
    description: "Heavy loads on site, with equipment for the length of a project.",
    icon: HardHat,
    href: "/industries/construction",
  },
  {
    title: "Food & Beverage",
    description: "High-volume pallets, clean floors and fast loading for distribution.",
    icon: CupSoda,
    href: "/industries/food-beverage",
  },
  {
    title: "Retail & Wholesale",
    description: "Stock movement, back rooms and clean shop floors.",
    icon: Building2,
    href: "/industries/retail-wholesale",
  },
  {
    title: "Hospitality, Facilities & Institutions",
    description: "Hotels, malls, offices and public buildings kept clean and supplied.",
    icon: Hotel,
    href: "/industries/hospitality-facilities",
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

const aboutContent = { aboutHeroCtas, companySnapshot, aboutSolutions, aboutTrustPoints, servedIndustries, servicePromiseSteps };
export type AboutContent = typeof aboutContent;

// About page data per locale. Lao text: src/messages/lo/about.ts.
export const aboutFor = localized(aboutContent, loAbout);
