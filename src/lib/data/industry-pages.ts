import type { PageContent, PageItem } from "@/lib/data/pages";
import { quoteHref } from "@/lib/data/routes";
import type { IntentKey } from "@/lib/leads/intents";

import { industryCardDetails } from "./industry-details";

// Industry pages follow one buyer journey (docs/industries-journey.md): recognise the operation,
// name what slows it down, show the equipment that fixes it, explain how working together goes, say
// what to send for a fast quote, answer the last doubts, then ask for the quote with the category
// preselected. No figures, clients or response times are stated unless the owner confirmed them.

type IndustrySpec = {
  id: string;
  href: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  intent: IntentKey;
  pains: PageItem[];
  recommend: PageItem[];
  quoteDetails: PageItem[];
  faq: PageItem[];
  closingTitle: string;
};

const howItWorks: PageItem[] = [
  { title: "Tell us about your operation", description: "Loads, hours, site and what is slowing you down." },
  { title: "We check the site", description: "An advisor looks at floors, aisles, ramps and docks with you." },
  { title: "You get a clear recommendation", description: "Rent, buy new or used, or a mix, with the quotation in writing." },
  { title: "We keep it running", description: "Maintenance, parts and batteries from the same team after delivery." },
];

function industryPage(spec: IndustrySpec): PageContent {
  const quote = quoteHref(spec.intent, spec.href);

  return {
    id: spec.id,
    metaTitle: spec.metaTitle,
    metaDescription: spec.metaDescription,
    eyebrow: `Industries · ${spec.name}`,
    h1: spec.h1,
    intro: spec.intro,
    ctas: [
      { label: "Request a Quote", href: quote },
      { label: "Talk to a DK LAO Advisor", href: "/contact" },
    ],
    sections: [
      { kind: "list", title: `What slows ${spec.name.toLowerCase()} down`, items: spec.pains },
      {
        kind: "cards",
        title: "What we recommend",
        items: spec.recommend.map((item) => ({ ...item, details: industryCardDetails[spec.id]?.[item.title] })),
      },
      { kind: "steps", title: "How it works", items: howItWorks },
      {
        kind: "list",
        title: "What to tell us for a fast quote",
        intro: "Send these and an advisor can recommend the right equipment the first time.",
        items: spec.quoteDetails,
      },
      { kind: "faq", title: "Questions we hear", items: spec.faq },
      {
        kind: "stats",
        title: "Case or example",
        needsConfirmation: true,
        items: [
          { title: "Client or project", needsConfirmation: true },
          { title: "Result", needsConfirmation: true },
        ],
      },
    ],
    closing: {
      title: spec.closingTitle,
      copy: "Tell us about your operation and we reply with a recommendation and a quotation.",
      primary: { label: "Request a Quote", href: quote },
      secondary: { label: "Talk to a DK LAO Advisor", href: "/contact" },
    },
  };
}

const baseDetails = (extra: PageItem): PageItem[] => [
  { title: "Heaviest load", description: "Weight and size of the heaviest pallet or item you move." },
  { title: "Lift height", description: "The highest shelf, rack level or truck bed you load." },
  extra,
  { title: "Working hours", description: "Shifts per day and days per week." },
  { title: "How long you need it", description: "A few weeks, a season, years, or to own." },
];

export const industryPageList: PageContent[] = [
  {
    id: "industries",
    metaTitle: "Equipment Solutions by Industry in Laos",
    metaDescription:
      "Forklifts, warehouse equipment, service and cleaning for logistics, manufacturing, construction, food, retail and hotels in Laos.",
    eyebrow: "Industries",
    h1: "Equipment Solutions by Industry in Laos",
    intro: "Every operation moves goods differently. Pick yours to see what slows it down and the equipment that fixes it.",
    ctas: [
      { label: "Request a Quote", href: quoteHref(undefined, "/industries") },
      { label: "Talk to a DK LAO Advisor", href: "/contact" },
    ],
    sections: [
      {
        kind: "cards",
        title: "Choose your industry",
        items: [
          {
            title: "Logistics and warehousing",
            description: "Peaks, docks and storage that keep goods moving.",
            routeId: "ind-logistics",
            details: {
              lead: "In a distribution centre the equipment has to match the busiest hour, not the average day. Containers arrive together, the dock fills up, and every stopped truck holds up the line behind it.",
              topics: [
                {
                  heading: "Own for the base, rent for the peak",
                  body: "Keep the trucks you need every day, and add short-term rentals for harvest, festival and year-end peaks. You stop paying all year for machines that only work a few months.",
                },
                {
                  heading: "Docks that flow",
                  body: "Unloading containers needs trucks with a low lowered mast and free lift to work inside the box, plus marked lanes so pallets move from door to storage without crossing walkways.",
                },
                {
                  heading: "Storage that uses the height",
                  body: "Pallet racking matched to the forklift's lift height and aisle width stores far more in the same building than floor stacking, and makes stock easier to find and count.",
                },
              ],
              checklist: {
                heading: "Bring to the first conversation",
                items: ["Pallets moved per day, and at peak", "Containers or trucks arriving per week", "Building height and current layout", "Months when volumes peak"],
              },
            },
          },
          {
            title: "Manufacturing",
            description: "Steady flow between stores, lines and dispatch.",
            routeId: "ind-manufacturing",
            details: {
              lead: "In a factory, materials handling is part of the production line. When a pallet arrives late the line waits, and when a truck breaks down a shift's output is at risk. DK LAO's customers include manufacturers such as HOYA.",
              topics: [
                {
                  heading: "Clean air and less noise indoors",
                  body: "Electric forklifts and warehouse trucks give off no exhaust where they work and run quietly, which suits enclosed production halls. Engine trucks belong in ventilated yards and outdoor stores.",
                },
                {
                  heading: "Power for every shift",
                  body: "Plants that run more than one shift need a battery and charging plan: a second battery per truck, or chargers built for charging in breaks, so no truck runs flat in the middle of a shift.",
                },
                {
                  heading: "People and trucks apart",
                  body: "Marked walkways, crossing points, speed limits and mirrors at blind corners lower the risk where operators, forklifts and line workers share the same floor.",
                },
              ],
              checklist: {
                heading: "What we look at in a factory",
                items: ["The route from stores to line to dispatch", "Shifts and hours per truck", "Indoor, outdoor or both", "Floor condition and ramps"],
              },
            },
          },
          {
            title: "Construction",
            description: "Heavy loads on rough ground, for the length of a project.",
            routeId: "ind-construction",
            details: {
              lead: "Construction sites change every week. The ground turns from dust to mud with the rain, loads are heavy and awkward, and the equipment is needed for a project, not for ever.",
              topics: [
                {
                  heading: "Trucks made for the ground",
                  body: "Pneumatic tyres, good ground clearance and engine power suit rough yards; smooth-floor warehouse trucks do not. Tell us the surface and the slopes on site so we match the truck to them.",
                },
                {
                  heading: "Rent for the length of the project",
                  body: "Short-term rental covers a project phase, and long-term rental covers works that run a year or more. The trucks go back when the job ends, so money is not tied up in idle machines.",
                },
                {
                  heading: "Plan for dust and mud",
                  body: "On site, dust and mud wear filters, tyres and brakes faster than in a warehouse. Daily checks by the operator and maintenance planned with the rental keep the truck working.",
                },
              ],
              checklist: {
                heading: "Tell us about the site",
                items: ["Ground surface and slopes", "Heaviest load and its shape", "Project start date and length", "Access for delivery to the site"],
              },
            },
          },
          {
            title: "Food and beverage",
            description: "High-volume pallets, clean floors and fast loading.",
            routeId: "ind-food-beverage",
            details: {
              lead: "Food and beverage plants move heavy, high-volume pallets of bottles, cans and packs, and must keep floors clean while they do it. DK LAO's customers include Beerlao, Coca-Cola, Heineken, Pepsi and Tiger Beer.",
              topics: [
                {
                  heading: "Gentle with glass and liquids",
                  body: "Full pallets of bottles are heavy and unforgiving. Trucks with the right capacity at the load centre, smooth hydraulics and, where useful, a side shifter cut damage when loading trucks and stacking.",
                },
                {
                  heading: "Stock that rotates on time",
                  body: "Racking laid out for first in, first out keeps dated stock moving in order, and clear location labels make stock counts faster before the busy festival season.",
                },
                {
                  heading: "Clean floors are safe floors",
                  body: "Spilled product and water make floors slippery for people and trucks. Scrubber dryers wash and dry the floor in one pass, and electric trucks keep exhaust out of production and storage areas.",
                },
              ],
              checklist: {
                heading: "For a food and beverage quote",
                items: ["Pallet weight and height, full and empty", "Daily volume and peak season", "Hygiene or cold areas", "How floors are cleaned today"],
              },
            },
          },
          {
            title: "Retail and wholesale",
            description: "Frequent deliveries, tight aisles and tidy shop floors.",
            routeId: "ind-retail",
            details: {
              lead: "Retail and wholesale move many small deliveries through tight back rooms and onto shop floors that customers see every day. Equipment has to be compact, quiet and safe around people.",
              topics: [
                {
                  heading: "Compact handling",
                  body: "Pallet trucks and stackers suit back rooms and narrow aisles where a forklift cannot turn; a forklift handles the delivery yard and high storage. Most shops need a mix of both.",
                },
                {
                  heading: "Shelving that fits the range",
                  body: "Shelving and racking planned around your product sizes keep stock visible and within reach, and leave aisles clear for trolleys, staff and customers.",
                },
                {
                  heading: "Floors customers notice",
                  body: "A scrubber dryer cleans a supermarket floor before opening and leaves it dry, so it is safe to walk on straight away, with no wet patches or mop marks for the first customers.",
                },
              ],
              checklist: {
                heading: "Useful for a retail quote",
                items: ["Deliveries per week and pallet size", "Back-room and aisle widths", "Shop floor area", "Opening hours, for cleaning times"],
              },
            },
          },
          {
            title: "Hospitality and facilities",
            description: "Large floors kept clean and deliveries kept moving.",
            routeId: "ind-hospitality",
            details: {
              lead: "Hotels, malls, hospitals and large buildings are judged by how clean and well run they look. Big floors need the right cleaning machines, and deliveries need to move without disturbing guests.",
              topics: [
                {
                  heading: "Machines for large floors",
                  body: "Nilfisk ride-on and walk-behind scrubber dryers clean lobbies, halls and corridors faster than mops and leave floors dry; backpack and upright vacuums handle carpets, stairs and seating.",
                },
                {
                  heading: "Quiet, discreet cleaning",
                  body: "Battery machines run without cables or fumes and with less noise, so in many areas cleaning can carry on while the building is open, without trailing leads across walkways.",
                },
                {
                  heading: "Deliveries behind the scenes",
                  body: "Pallet trucks move linen, food and supplies from the loading bay to the stores without blocking guest areas, and a clear back-of-house route keeps trolleys out of sight.",
                },
              ],
              checklist: {
                heading: "Tell us about the building",
                items: ["Floor areas and types: stone, tiles, carpet", "Daily cleaning routine", "Areas open to guests while cleaning", "Delivery and storage space"],
              },
            },
          },
        ],
      },
      {
        kind: "steps",
        title: "Not sure which fits?",
        items: [
          { title: "Describe your operation", description: "What you move, where and how often." },
          { title: "Talk to an advisor", description: "By phone, WhatsApp or the quote form." },
          { title: "Get one recommendation", description: "Equipment, service and cleaning planned together." },
        ],
      },
    ],
    closing: {
      title: "Get your quotation",
      copy: "Tell us about your operation and we reply with a recommendation and a quotation.",
      primary: { label: "Request a Quote", href: quoteHref(undefined, "/industries") },
      secondary: { label: "Talk to a DK LAO Advisor", href: "/contact" },
    },
  },
  industryPage({
    id: "ind-logistics",
    href: "/industries/logistics-warehousing",
    name: "Logistics",
    metaTitle: "Logistics & Warehousing Equipment in Laos",
    metaDescription:
      "Forklifts, racking, rental and service for logistics hubs and warehouses in Laos. Tell us your site and we send a plan.",
    h1: "Equipment for Logistics and Warehousing in Laos",
    intro: "Containers, trucks and trains arrive in waves. Keep loading, storage and dispatch moving every shift.",
    intent: "warehouse",
    pains: [
      { title: "Arrival peaks", description: "Trucks and containers land together and the dock backs up." },
      { title: "Too few trucks at busy times", description: "Buying for the peak leaves machines idle the rest of the year." },
      { title: "Storage that runs out", description: "Floor stacking wastes height and slows picking." },
      { title: "Breakdowns mid-shift", description: "One stopped forklift holds up the whole dock." },
    ],
    recommend: [
      { title: "Flexible forklift rental", description: "Add trucks for the peak and return them after.", routeId: "rental" },
      { title: "Racking and layout", description: "Use the height you already pay for.", routeId: "racking" },
      { title: "Pallet jacks and stackers", description: "Fast moves on the dock and in short aisles.", routeId: "material" },
      { title: "Scheduled maintenance", description: "Service planned around your shifts.", routeId: "maintenance" },
    ],
    quoteDetails: baseDetails({ title: "Dock and floor", description: "Loading dock or ground level, and the floor surface." }),
    faq: [
      { title: "Can we rent extra forklifts only for busy months?", description: "Yes. Short-term rental covers peaks; long-term rental covers your base fleet." },
      { title: "Do you plan racking for an existing building?", description: "Yes. We plan racking around your goods, your building and the forklifts that will reach it." },
      { title: "Can one supplier handle forklifts, racking and service?", description: "Yes. Equipment, racking, maintenance, parts and cleaning come from one team." },
    ],
    closingTitle: "Plan your logistics equipment",
  }),
  industryPage({
    id: "ind-manufacturing",
    href: "/industries/manufacturing",
    name: "Manufacturing",
    metaTitle: "Forklifts & Equipment for Factories in Laos",
    metaDescription:
      "Forklifts, material handling, batteries and service for factories in Laos and its economic zones. Keep lines supplied every shift.",
    h1: "Equipment for Manufacturing in Laos",
    intro: "Raw material in, finished goods out, all day. Keep your lines supplied and your dispatch on time.",
    intent: "warehouse",
    pains: [
      { title: "Lines waiting for material", description: "A late pallet stops a whole production line." },
      { title: "Shift work wears machines", description: "Long hours need trucks and batteries that last." },
      { title: "Fumes and noise indoors", description: "Engine trucks are a poor fit inside the plant." },
      { title: "Crowded floors", description: "People, lines and trucks share the same space." },
    ],
    recommend: [
      { title: "Electric forklifts", description: "Clean and quiet for indoor work.", routeId: "sales-new" },
      { title: "Batteries and chargers", description: "Power planned for your shift pattern.", routeId: "batteries" },
      { title: "Material handling", description: "Pallet jacks and stackers for line-side moves.", routeId: "material" },
      { title: "Preventive maintenance", description: "Regular service so trucks do not stop mid-shift.", routeId: "maintenance" },
    ],
    quoteDetails: baseDetails({ title: "Indoor or outdoor", description: "Where the truck works and whether fumes are a concern." }),
    faq: [
      { title: "Electric or diesel for a factory?", description: "Electric for indoor work, engine trucks for outdoor yards. We help you choose." },
      { title: "Can we try before we buy?", description: "Yes. Renting first is a good way to test a truck in your plant." },
      { title: "Do you service the trucks after purchase?", description: "Yes. Maintenance, parts and batteries continue after delivery." },
    ],
    closingTitle: "Keep your lines supplied",
  }),
  industryPage({
    id: "ind-construction",
    href: "/industries/construction",
    name: "Construction",
    metaTitle: "Forklift Rental for Construction in Laos",
    metaDescription:
      "Forklift rental and equipment for construction sites in Laos: heavy loads, rough ground and project timelines. Ask for a quote.",
    h1: "Equipment for Construction Sites in Laos",
    intro: "Cement, steel and blocks on uneven ground, for the length of a project. Rent what the job needs.",
    intent: "rental",
    pains: [
      { title: "Heavy, awkward loads", description: "Bags, bundles and blocks that are slow to move by hand." },
      { title: "Rough, muddy ground", description: "Site yards that change with the weather." },
      { title: "Equipment only for the project", description: "Buying for one job ties up money afterwards." },
      { title: "Delays when a machine stops", description: "A broken truck holds up crews and deliveries." },
    ],
    recommend: [
      { title: "Short-term rental", description: "Trucks for the weeks you need them.", routeId: "rental-short" },
      { title: "Long-term rental", description: "For projects that run a year or more.", routeId: "rental-long" },
      { title: "Used forklifts", description: "A lower-cost option if you need to own.", routeId: "sales-used" },
      { title: "Breakdown repair", description: "Service so the site keeps moving.", routeId: "maintenance" },
    ],
    quoteDetails: baseDetails({ title: "Ground conditions", description: "Concrete, gravel, mud or slopes on site." }),
    faq: [
      { title: "Can we rent for a single project?", description: "Yes. Short-term rental covers a project phase; long-term rental covers longer builds." },
      { title: "Which forklift suits a rough site?", description: "It depends on load, ground and lift height. Tell us the site and we recommend." },
      { title: "Who services the truck on site?", description: "Our maintenance team. Tell us the site location when you ask." },
    ],
    closingTitle: "Equip your next project",
  }),
  industryPage({
    id: "ind-food-beverage",
    href: "/industries/food-beverage",
    name: "Food and beverage",
    metaTitle: "Equipment for Food & Beverage in Laos",
    metaDescription:
      "Forklifts, racking, batteries and floor cleaning for food and drinks producers and distributors in Laos. Ask for a plan.",
    h1: "Equipment for Food and Beverage in Laos",
    intro: "Bottles, cans, crates and sacks move in volume. Keep loading fast and floors clean.",
    intent: "warehouse",
    pains: [
      { title: "High-volume loading", description: "Distribution trucks need full loads, fast." },
      { title: "Spills and dirty floors", description: "Product, water and dust make floors unsafe and unhygienic." },
      { title: "Fragile, heavy pallets", description: "Glass and liquids punish rough handling." },
      { title: "Long days in peak season", description: "Festivals and holidays push volumes up." },
    ],
    recommend: [
      { title: "Electric forklifts", description: "Clean, quiet trucks for production and storage.", routeId: "sales-new" },
      { title: "Racking for stock rotation", description: "First in, first out made easier.", routeId: "racking" },
      { title: "Floor scrubbers", description: "Clean floors in production and storage areas.", routeId: "cleaning" },
      { title: "Peak-season rental", description: "Extra trucks for the busy months.", routeId: "rental-short" },
    ],
    quoteDetails: baseDetails({ title: "Hygiene areas", description: "Production, cold or wet areas the truck must enter." }),
    faq: [
      { title: "Can you supply both forklifts and floor cleaning?", description: "Yes. Equipment and cleaning machines come from one team." },
      { title: "Electric or engine trucks near food?", description: "Electric trucks are the usual choice indoors. We recommend for your site." },
      { title: "Can we add trucks for the festival season?", description: "Yes. Short-term rental covers seasonal peaks." },
    ],
    closingTitle: "Plan your food and beverage equipment",
  }),
  industryPage({
    id: "ind-retail",
    href: "/industries/retail-wholesale",
    name: "Retail and wholesale",
    metaTitle: "Equipment for Retail & Wholesale in Laos",
    metaDescription:
      "Pallet jacks, stackers, forklifts, shelving and floor cleaning for shops, supermarkets and wholesalers in Laos.",
    h1: "Equipment for Retail and Wholesale in Laos",
    intro: "Deliveries every day, mixed goods and tight back rooms. Move stock quickly and keep the shop floor tidy.",
    intent: "warehouse",
    pains: [
      { title: "Daily deliveries", description: "Trucks arrive while the shop is open." },
      { title: "Tight back rooms", description: "Little space to turn a forklift." },
      { title: "Mixed goods", description: "Pallets, cartons and sacks of every size." },
      { title: "Shop floors to keep clean", description: "Customers notice dirty floors first." },
    ],
    recommend: [
      { title: "Pallet jacks and stackers", description: "Compact moves in tight spaces.", routeId: "material" },
      { title: "Racking and shelving", description: "Back-room storage that is easy to pick from.", routeId: "racking" },
      { title: "Forklifts for the warehouse", description: "For wholesalers moving full pallets.", routeId: "sales" },
      { title: "Floor cleaning machines", description: "Clean shop floors before opening.", routeId: "cleaning" },
    ],
    quoteDetails: baseDetails({ title: "Aisle and door widths", description: "The narrowest aisle and doorway the equipment must pass." }),
    faq: [
      { title: "Do we need a forklift or a pallet jack?", description: "Small stores often need only pallet jacks or stackers. Tell us the space and we advise." },
      { title: "Can you plan shelving for a back room?", description: "Yes. We plan storage around your goods and space." },
      { title: "Which cleaning machine suits a supermarket?", description: "It depends on floor size and type. We recommend after a short description." },
    ],
    closingTitle: "Plan your store and warehouse equipment",
  }),
  industryPage({
    id: "ind-hospitality",
    href: "/industries/hospitality-facilities",
    name: "Hospitality and facilities",
    metaTitle: "Cleaning & Equipment for Hotels in Laos",
    metaDescription:
      "Floor scrubbers, cleaning machines and handling equipment for hotels, malls and large facilities in Laos.",
    h1: "Equipment for Hotels and Facilities in Laos",
    intro: "Lobbies, corridors and car parks to keep spotless, and deliveries to keep moving behind the scenes.",
    intent: "cleaning",
    pains: [
      { title: "Large floors every day", description: "Mopping by hand takes too long." },
      { title: "Guests on site", description: "Cleaning must be quiet and safe around people." },
      { title: "Back-of-house deliveries", description: "Food, linen and supplies arrive daily." },
      { title: "Machines that stop", description: "A broken scrubber means floors are missed." },
    ],
    recommend: [
      { title: "Floor scrubbers", description: "Faster, cleaner floors in lobbies and halls.", routeId: "cleaning" },
      { title: "Pallet jacks for deliveries", description: "Move supplies from the dock to stores.", routeId: "material" },
      { title: "Machine service", description: "Maintenance and parts to keep machines working.", routeId: "maintenance" },
    ],
    quoteDetails: [
      { title: "Floor area", description: "Square metres to clean, and how often." },
      { title: "Floor types", description: "Tile, stone, carpet, concrete or a mix." },
      { title: "Cleaning hours", description: "Day, night, or around guests." },
      { title: "Deliveries", description: "What arrives at the back door and how it is moved." },
      { title: "How long you need it", description: "Buy, or try first." },
    ],
    faq: [
      { title: "Which floor scrubber suits a hotel?", description: "It depends on floor area and type. Tell us both and we recommend." },
      { title: "Can the machine run while guests are around?", description: "Some machines are quieter and compact. We recommend for your hours." },
      { title: "Do you service cleaning machines?", description: "Yes. Maintenance and parts are available for the machines we supply." },
    ],
    closingTitle: "Keep your facility spotless",
  }),
];
