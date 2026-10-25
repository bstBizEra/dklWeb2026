// Search and social text for the pages that are not built from PageContent (Home and About).
// Limits: a rendered title is at most 60 characters, a description at most 155. A test enforces both.
// Home sets its own full title (no suffix is added). About and the content pages get " | DK LAO" appended.
export const titleSuffix = " | DK LAO";

export const homeSeo = {
  title: "Forklift Rental, Sales & Service in Laos | DK LAO",
  description:
    "Rent, buy and maintain forklifts in Laos. Spare parts, warehouse equipment and cleaning machines from one team. Request a quote.",
  shareTitle: "Forklift Rental, Sales & Service in Laos | DK LAO",
  shareDescription:
    "Forklift rental, sales, spare parts, maintenance, warehouse equipment and cleaning machines across Laos.",
} as const;

export const aboutSeo = {
  title: "About Us: Forklift & Warehouse Partner in Laos",
  description:
    "DK LAO supplies and services forklifts, spare parts, warehouse equipment and cleaning machines for businesses across Laos.",
  shareTitle: "About DK LAO: Forklift & Warehouse Partner in Laos",
  shareDescription:
    "Who DK LAO is, and how we support forklift rental, sales, service, parts, warehouse equipment and cleaning in Laos.",
} as const;
