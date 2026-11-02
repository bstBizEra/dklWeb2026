import { getRoute, publishedRoutes } from "@/lib/data/routes";

// Reusable photo library: one image per topic in public/images/library (sources and licences in
// public/images/library/LICENCES.md). A page shows its topic photo behind the hero, and a card that
// links to another page reuses that page's photo, so the same subject always looks the same.
export const libraryTopics = [
  "rental",
  "rental-short",
  "rental-long",
  "sales-new",
  "sales-used",
  "maintenance",
  "preventive",
  "parts",
  "filters",
  "safety",
  "tyres",
  "batteries",
  "battery-label",
  "battery-swap",
  "battery-heat",
  "warehouse",
  "material",
  "racking",
  "cleaning",
  "nilfisk-scrubber",
  "nilfisk-sweeper",
  "nilfisk-robot",
  "nilfisk-industrial-vacuum",
  "nilfisk-commercial-vacuum",
  "nilfisk-pressure-washer",
  "nilfisk-large-area",
  "nilfisk-combination",
  "nilfisk-machine-care",
  "warehouse-racking-guards",
  "warehouse-picking",
  "warehouse-narrow-aisle",
  "warehouse-sweeper",
  "industries",
  "logistics",
  "manufacturing",
  "construction",
  "food-beverage",
  "retail",
  "hospitality",
  "knowledge",
  "contact",
  "about",
] as const;

export type LibraryTopic = (typeof libraryTopics)[number];

export const libraryImage = (topic: LibraryTopic) => `/images/library/${topic}.webp`;

// Topics whose photo is DK LAO's own (licence "DK LAO" in LICENCES.md; a test keeps the two in step).
// Every other topic is a stock photo: its cards carry the DK LAO brand stripe, so stock scenes read as
// illustrations and never pass for DK LAO's own staff or fleet.
export const ownPhotoTopics: ReadonlySet<LibraryTopic> = new Set<LibraryTopic>([
  "rental",
  "rental-long",
  "sales-used",
  "preventive",
  "battery-label",
  "battery-swap",
  "battery-heat",
  "industries",
  "warehouse",
  "contact",
  "about",
]);

export const isOwnPhoto = (topic: LibraryTopic) => ownPhotoTopics.has(topic);

// Hero photo per page id. Pages not listed (Home, About) keep their own artwork.
export const pageTopics: Record<string, LibraryTopic> = {
  rental: "rental",
  "rental-short": "rental-short",
  "rental-long": "rental-long",
  sales: "sales-new",
  "sales-new": "sales-new",
  "sales-used": "sales-used",
  maintenance: "maintenance",
  parts: "parts",
  batteries: "batteries",
  warehouse: "warehouse",
  material: "material",
  racking: "racking",
  cleaning: "cleaning",
  industries: "industries",
  "ind-logistics": "logistics",
  "ind-manufacturing": "manufacturing",
  "ind-construction": "construction",
  "ind-food-beverage": "food-beverage",
  "ind-retail": "retail",
  "ind-hospitality": "hospitality",
  knowledge: "knowledge",
  article: "knowledge",
  contact: "contact",
  quote: "contact",
  about: "about",
};

// Cards that do not link to a page (part types, industries, guides) pick a photo from their title.
// First match wins, so the more specific words come first.
const titleTopics: [RegExp, LibraryTopic][] = [
  [/tyre|wheel/i, "tyres"],
  // Battery cards with DK LAO's own photos from a battery replacement job; other battery cards use the stock photo.
  [/choosing battery/i, "battery-label"],
  [/charging for your shifts/i, "battery-swap"],
  [/battery care/i, "battery-heat"],
  [/batter|charger|electric|power/i, "batteries"],
  // Preventive maintenance sits next to Breakdown repair: a technician checking a forklift (planned work,
  // from DK LAO's own archive), not the same machinery-repair photo, so the two cards never look identical.
  // The file is 640x400, fine for cards; use a larger photo before showing this topic as a hero.
  [/preventive/i, "preventive"],
  [/hydraulic|repair|breakdown|install/i, "maintenance"],
  [/inspect|check|guide|capacity|prepare|matching/i, "knowledge"],
  [/used/i, "sales-used"],
  // Nilfisk range cards on the Cleaning page: Nilfisk's own product photos (dealer material, not DK LAO scenes).
  [/^scrubber dryers$/i, "nilfisk-scrubber"],
  [/^sweepers$/i, "nilfisk-sweeper"],
  [/^robotic floor cleaners$/i, "nilfisk-robot"],
  [/^industrial vacuums$/i, "nilfisk-industrial-vacuum"],
  [/^commercial vacuums$/i, "nilfisk-commercial-vacuum"],
  [/^pressure washers$/i, "nilfisk-pressure-washer"],
  // "Planning floor cleaning" cards on the same page.
  [/^sizing the machine/i, "nilfisk-large-area"],
  [/^sweep, scrub or both$/i, "nilfisk-combination"],
  [/^daily machine care$/i, "nilfisk-machine-care"],
  // Warehouse "Problems we help solve" cards: LPI, Jungheinrich and Nilfisk dealer images.
  [/^unsafe racking and stacking$/i, "warehouse-racking-guards"],
  [/^slow picking and loading$/i, "warehouse-picking"],
  [/^aisles too narrow or blocked$/i, "warehouse-narrow-aisle"],
  [/^dusty or slippery floors$/i, "warehouse-sweeper"],
  [/clean|scrubber|floor/i, "cleaning"],
  [/rack|shel|storage/i, "racking"],
  [/logistic/i, "logistics"],
  [/manufactur/i, "manufacturing"],
  [/construction/i, "construction"],
  [/food|beverage/i, "food-beverage"],
  [/retail|wholesale/i, "retail"],
  [/hospitality|facilit/i, "hospitality"],
  // Spare-part types with their own photo, so they do not all repeat the Spare Parts hero shelf.
  [/filter|fluid/i, "filters"],
  [/light|safety/i, "safety"],
  [/part/i, "parts"],
  [/rent/i, "rental"],
  [/quote|price|contact|advisor/i, "contact"],
  [/new|brand|fork|buy|sale/i, "sales-new"],
  [/maint|service|preventive/i, "maintenance"],
  [/warehouse|material/i, "warehouse"],
];

export function topicForPage(pageId: string): LibraryTopic | undefined {
  return pageTopics[pageId];
}

// A card's photo: the linked page's photo when it links to another page, else a match on its title,
// else the page's own photo. A card that links back to its own page ("Manufacturing" on Industries) is
// matched by title, so it does not repeat the hero photo. On a translated page the English title
// (photoTitle) is matched, so the card keeps its English photo.
export function topicForCard(card: { title: string; href?: string; routeId?: string; photoTitle?: string }, pageId: string): LibraryTopic | undefined {
  const routeId = card.routeId ?? publishedRoutes().find((route) => route.href === card.href)?.id;
  const linked = routeId && routeId !== pageId && getRoute(routeId) ? pageTopics[routeId] : undefined;
  const title = card.photoTitle ?? card.title;

  return linked ?? titleTopics.find(([pattern]) => pattern.test(title))?.[1] ?? pageTopics[pageId];
}
