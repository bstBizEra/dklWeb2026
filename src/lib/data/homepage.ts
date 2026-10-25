import {
  BatteryCharging,
  Boxes,
  Building2,
  ClipboardCheck,
  Factory,
  Forklift,
  HardHat,
  PackageCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  Warehouse,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Cta = {
  label: string;
  href: string;
  variant: "primary" | "secondary" | "dark";
};

export type FeatureCard = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  icon: LucideIcon;
};

export type ProductCategory = FeatureCard & {
  eyebrow: string;
};

export type IndustrySolution = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  icon: LucideIcon;
};

export const homepageCtas: Cta[] = [
  {
    label: "Request a Quote",
    href: "#quote-request",
    variant: "primary",
  },
  {
    label: "View Rental Fleet",
    href: "/forklift-rental",
    variant: "secondary",
  },
  {
    label: "Book Maintenance Service",
    href: "/maintenance-service",
    variant: "dark",
  },
];

export const quickQuoteActions: FeatureCard[] = [
  {
    title: "Rental inquiry",
    description: "Share capacity, lift height, site conditions, and rental period.",
    href: "/forklift-rental",
    ctaLabel: "Ask for Rental Price",
    icon: Forklift,
  },
  {
    title: "Service booking",
    description: "Request on-site or workshop support for forklift maintenance.",
    href: "/maintenance-service",
    ctaLabel: "Book Maintenance Service",
    icon: Wrench,
  },
  {
    title: "Spare parts",
    description: "Send part type, brand, model, serial number, and urgency.",
    href: "/spare-parts",
    ctaLabel: "Request Spare Parts",
    icon: PackageCheck,
  },
  {
    title: "Site survey",
    description: "Plan racking, warehouse flow, cleaning equipment, or fleet needs.",
    href: "/request-quote",
    ctaLabel: "Schedule Site Survey",
    icon: ClipboardCheck,
  },
];

export const solutionCards: FeatureCard[] = [
  {
    title: "Forklift rental",
    description: "Short-term for projects and peaks, long-term for steady operations.",
    href: "/forklift-rental",
    ctaLabel: "View Rental Fleet",
    icon: Forklift,
  },
  {
    title: "New and used forklift sales",
    description: "New and used forklifts matched to your load, lift height and site.",
    href: "/forklift-sales",
    ctaLabel: "Browse Forklifts",
    icon: ShoppingCart,
  },
  {
    title: "Maintenance and repair",
    description: "Preventive service, breakdown repair and inspections that keep trucks working.",
    href: "/maintenance-service",
    ctaLabel: "Book Maintenance Service",
    icon: Wrench,
  },
  {
    title: "Spare parts and accessories",
    description: "Send the model and serial number and we match the right part.",
    href: "/spare-parts",
    ctaLabel: "Request Spare Parts",
    icon: PackageCheck,
  },
];

export const productCategories: ProductCategory[] = [
  {
    eyebrow: "Material handling",
    title: "Forklifts and pallet movement",
    description: "Forklifts, pallet jacks and stackers chosen for what you move.",
    href: "/material-handling",
    ctaLabel: "Explore Equipment",
    icon: Truck,
  },
  {
    eyebrow: "Warehouse",
    title: "Racking and storage systems",
    description: "Racking and shelving planned around your goods and building.",
    href: "/warehouse-equipment",
    ctaLabel: "Explore Warehouse Solutions",
    icon: Warehouse,
  },
  {
    eyebrow: "Power",
    title: "Batteries and chargers",
    description: "Batteries and chargers matched to your trucks and shift hours.",
    href: "/batteries-chargers",
    ctaLabel: "Get a Recommendation",
    icon: BatteryCharging,
  },
  {
    eyebrow: "Cleaning",
    title: "Cleaning equipment",
    description: "Nilfisk scrubber dryers, sweepers and vacuums for warehouses, factories and shops.",
    href: "/cleaning-equipment",
    ctaLabel: "Get a Recommendation",
    icon: Sparkles,
  },
];

export const industrySolutions: IndustrySolution[] = [
  {
    title: "Logistics and warehousing",
    description: "Peaks, docks and storage that keep goods moving.",
    href: "/industries/logistics-warehousing",
    ctaLabel: "Explore Industry",
    icon: Boxes,
  },
  {
    title: "Manufacturing",
    description: "Steady flow between stores, lines and dispatch.",
    href: "/industries/manufacturing",
    ctaLabel: "Explore Industry",
    icon: Factory,
  },
  {
    title: "Construction",
    description: "Heavy loads on rough ground, for the length of a project.",
    href: "/industries/construction",
    ctaLabel: "Explore Industry",
    icon: HardHat,
  },
  {
    title: "Food, retail and hotels",
    description: "Clean floors, fast deliveries and tidy stores.",
    href: "/industries",
    ctaLabel: "Explore Industry",
    icon: Building2,
  },
];

export const knowledgeArticles = [
  {
    title: "How to prepare a forklift rental request",
    category: "Rental guide",
    href: "/knowledge-center/forklift-rental-request-checklist",
  },
  {
    title: "What serial numbers help spare-parts matching",
    category: "Parts guide",
    href: "/knowledge-center",
  },
  {
    title: "Choosing cleaning equipment for warehouse floors",
    category: "Cleaning guide",
    href: "/knowledge-center",
  },
];
