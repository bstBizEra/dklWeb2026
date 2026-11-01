// Generated from the DK LAO content sitemap (16 pages). Edit copy in the CMS admin, or regenerate from the sitemap.
// Items marked needsConfirmation hold draft wording the owner has not confirmed: they stay hidden on the site.
import { localizePage, type PageContent } from "@/lib/data/pages";
import type { Locale } from "@/lib/i18n";
import { industryPageList } from "@/lib/data/industry-pages";
import { quoteHref } from "@/lib/data/routes";

export const sitemapPageList: PageContent[] = [
  {
    id: "rental-short",
    metaTitle: "Short-Term Forklift Rental in Laos",
    metaDescription: "Short-term forklift rental in Laos for projects, peak seasons and one-off lifts. Send capacity, height and dates for a quotation.",
    eyebrow: "Short-Term Rental",
    h1: "Short-Term Forklift Rental in Laos",
    intro: "A forklift when the job needs it, for the days or months you need it.",
    ctas: [
      {
        label: "Ask for Rental Price",
        href: quoteHref("rental", "/forklift-rental/short-term"),
      },
    ],
    sections: [
      {
        kind: "list",
        title: "Best for these jobs",
        items: [
          {
            title: "Project and construction phases",
          },
          {
            title: "Seasonal and peak stock",
          },
          {
            title: "Equipment breakdown cover",
          },
          {
            title: "Trial before a long-term decision",
          },
        ],
      },
      {
        kind: "form",
        title: "Start your short-term request",
        items: [],
      },
      {
        kind: "cards",
        title: "Also consider",
        items: [
          {
            title: "Long-term rental",
            description: "For trucks you need most of the year: usually a lower day rate and less paperwork than renting short term.",
            routeId: "rental-long",
          },
          {
            title: "Used forklifts",
            description: "If a rental keeps running past a year, compare buying a selected used unit instead.",
            routeId: "sales-used",
          },
        ],
      },
      {
        kind: "faq",
        title: "Short-term questions",
        items: [
          {
            title: "Minimum period?",
            needsConfirmation: true,
          },
          {
            title: "Operator included?",
            needsConfirmation: true,
          },
        ],
      },
    ],
    closing: {
      title: "Get your quotation",
      copy: "Tell us what you need and we reply with a quotation.",
      primary: {
        label: "Ask for Rental Price",
        href: quoteHref("rental", "/forklift-rental/short-term"),
      },
    },
  },
  {
    id: "rental-long",
    metaTitle: "Long-Term Forklift Rental in Laos",
    metaDescription: "Long-term forklift rental in Laos with predictable cost and maintenance support. Tell us your operation and we quote a plan.",
    eyebrow: "Long-Term Rental",
    h1: "Long-Term Forklift Rental in Laos",
    intro: "A forklift fleet for steady operations, without the purchase.",
    ctas: [
      {
        label: "Ask for Rental Price",
        href: quoteHref("rental", "/forklift-rental/long-term"),
      },
    ],
    sections: [
      {
        kind: "text",
        title: "Predictable cost and a service partner",
        body: "Rent for months or years and plan one steady cost. Tell us your fleet and shifts, and your quotation sets out what the rental covers.",
        items: [
          {
            title: "What the rental includes",
            description: "Scheduled maintenance, a replacement unit during repairs and battery support.",
            needsConfirmation: true,
          },
        ],
      },
      {
        kind: "table",
        title: "Rent or buy?",
        items: [
          {
            title: "Upfront cost",
            description: "Rent: low. Buy: high.",
          },
          {
            title: "Maintenance",
            description: "Rent:. Buy: your cost.",
            needsConfirmation: true,
          },
          {
            title: "Flexibility",
            description: "Rent: change fleet. Buy: fixed.",
          },
          {
            title: "Best for",
            description: "Rent: changing needs. Buy: stable, long use.",
          },
        ],
      },
      {
        kind: "cards",
        title: "Keep your fleet running",
        items: [
          {
            title: "Maintenance",
            description: "Scheduled servicing that keeps long-term units safe and available every shift.",
            routeId: "maintenance",
          },
          {
            title: "Batteries and chargers",
            description: "Battery care, chargers and replacement batteries for electric rental fleets.",
            routeId: "batteries",
          },
          {
            title: "Buy a forklift",
            description: "Compare owning the truck if you will need it for many years.",
            routeId: "sales",
          },
        ],
      },
    ],
    closing: {
      title: "Plan your long-term fleet",
      copy: "Tell us what you need and we reply with a quotation.",
      primary: {
        label: "Ask for Rental Price",
        href: quoteHref("rental", "/forklift-rental/long-term"),
      },
    },
  },
  {
    id: "sales",
    metaTitle: "Forklifts for Sale in Laos: New & Used",
    metaDescription: "Buy new or used forklifts in Laos. We match capacity, power type and site to your needs and send a quotation. Availability on request.",
    eyebrow: "Forklift Sales",
    h1: "Forklifts for Sale in Laos",
    intro: "New or used, matched to your load, site and budget. Quotation-based pricing. Availability on request.",
    ctas: [
      {
        label: "Request a Quote",
        href: quoteHref("new", "/forklift-sales"),
      },
      {
        label: "Get a Recommendation",
        href: "/contact",
      },
    ],
    sections: [
      {
        kind: "cards",
        title: "Choose your path",
        items: [
          {
            title: "New forklifts",
            description: "Current models chosen for your load, lift height and site, with a full working life ahead.",
            routeId: "sales-new",
          },
          {
            title: "Used forklifts",
            description: "Selected used units for a lower upfront cost, checked before you decide. Ask what is available now.",
            routeId: "sales-used",
          },
          {
            title: "Warranty and service history",
            description: "Warranty and full service history ahead.",
            needsConfirmation: true,
          },
          {
            title: "Inspection offer",
            description: "Selected used units with an inspection offer.",
            needsConfirmation: true,
          },
        ],
      },
      {
        kind: "table",
        title: "How to choose",
        items: [
          {
            title: "Capacity",
            description: "Heaviest load plus margin",
          },
          {
            title: "Lift height",
            description: "Highest rack or stack",
          },
          {
            title: "Power",
            description: "Electric, diesel, LPG",
            needsConfirmation: true,
          },
          {
            title: "Environment",
            description: "Indoor, outdoor, narrow aisle",
          },
        ],
      },
      {
        kind: "cards",
        title: "Before you choose",
        items: [
          {
            title: "Capacity and load centre",
            description: "What the capacity rating really means for your loads and attachments.",
            details: {
              lead: "Capacity is the first number buyers look at, and the one most often misread. The rating on the data plate applies to a load of a set size held up to a set height; real loads are often longer, higher, or both.",
              facts: [{ value: "500 mm", label: "usual load centre behind a capacity rating" }],
              topics: [
                {
                  heading: "What the rating means",
                  body: "A truck rated at 2.5 t lifts 2.5 t with the load's centre of gravity 500 mm from the fork face, up to a stated height. With a longer load, or above that height, the safe capacity falls; the data plate shows by how much.",
                },
                {
                  heading: "Allow for attachments",
                  body: "A side shifter, fork positioner or clamp adds weight and moves the load forward, so the truck can lift less with it fitted. Choose the capacity with the attachment you plan to use already counted.",
                },
                {
                  heading: "Size for the heaviest load",
                  body: "Choose the truck for your heaviest regular load at your highest lift, not for the average load. A sensible margin covers heavier batches without working the truck at its limit every day.",
                },
              ],
              checklist: {
                heading: "Have these ready",
                items: ["Weight of the heaviest load", "Load length or pallet size", "Highest lift height", "Attachments you need"],
              },
            },
          },
          {
            title: "Mast and lift height",
            description: "How high you stack, and the lowest door or container on the way.",
            details: {
              lead: "The mast decides how high the truck can stack and where it can go. Two measurements matter: the height you need to reach, and the lowest clearance on the truck's routes.",
              facts: [{ value: "2.28 m", label: "door height of a standard shipping container" }],
              topics: [
                {
                  heading: "Lift height",
                  body: "Measure to the top of your highest rack beam or stack, then add room to lift the pallet over it. Capacity falls as the mast reaches higher, so check what the truck can lift at that height, not only at ground level.",
                },
                {
                  heading: "Collapsed height and free lift",
                  body: "Collapsed height is the mast's height when fully lowered; it must pass under doors and beams and into containers. Free lift raises the forks before the mast extends, so the truck can stack inside a container without touching the roof.",
                },
                {
                  heading: "Two-stage or three-stage mast",
                  body: "A three-stage mast reaches higher from the same collapsed height, which helps when a low door leads into a tall warehouse. It costs and weighs more, so choose it when the site needs it, not by default.",
                },
              ],
              checklist: {
                heading: "Measure on site",
                items: [
                  "Top of the highest rack beam or stack",
                  "Lowest door or roof beam on the route",
                  "Container door height, if you load containers",
                  "Lights, sprinklers and pipes above the stacks",
                ],
              },
            },
          },
          {
            title: "New or used?",
            description: "How hard the truck will work, and for how long, points to the better buy.",
            details: {
              lead: "New and used forklifts both make good sense. The better buy depends on how hard the truck will work, how long you plan to keep it, and how soon you need it.",
              topics: [
                {
                  heading: "When new is the better buy",
                  body: "Long daily hours, more than one shift, a specific specification, or a plan to keep the truck for many years. A new truck starts at zero hours with its whole working life ahead of it.",
                },
                {
                  heading: "When used is the better buy",
                  body: "Lighter or occasional work, a tight budget, or a truck needed quickly. A well-kept used truck with known hours and service records can work for years at a lower upfront cost.",
                },
                {
                  heading: "Count the whole cost",
                  body: "The purchase price is only part of the cost. Fuel or power, servicing, parts and downtime add up over the years, and they rise with a truck's age and hours. Compare the total cost over the years you plan to keep it.",
                },
              ],
              checklist: {
                heading: "Questions that point the way",
                items: [
                  "How many hours a day will it work?",
                  "How many years will you keep it?",
                  "How soon do you need it?",
                  "Would renting first answer these questions?",
                ],
              },
            },
          },
        ],
      },
      {
        kind: "cards",
        title: "Brands we supply",
        items: [
          {
            title: "Brand-neutral supply",
            fact: "brands",
          },
        ],
      },
      {
        kind: "cards",
        title: "Support after you buy",
        items: [
          {
            title: "Maintenance",
            description: "Scheduled servicing from the first day, so the truck stays safe and productive.",
            routeId: "maintenance",
          },
          {
            title: "Spare parts",
            description: "Filters, tyres, forks and other parts matched to your model and serial number.",
            routeId: "parts",
          },
          {
            title: "Batteries and chargers",
            description: "Chargers, battery care and replacement batteries for electric forklifts.",
            routeId: "batteries",
          },
        ],
      },
      {
        kind: "faq",
        title: "Buying questions",
        items: [
          {
            title: "Do you show prices?",
            description: "We quote per request.",
          },
          {
            title: "Can I see the forklift first?",
            needsConfirmation: true,
          },
          {
            title: "Warranty?",
            needsConfirmation: true,
          },
        ],
      },
    ],
    closing: {
      title: "Get your quotation",
      copy: "Tell us what you need and we reply with a quotation.",
      primary: {
        label: "Request a Quote",
        href: quoteHref("new", "/forklift-sales"),
      },
    },
  },
  {
    id: "sales-new",
    metaTitle: "New Forklifts for Sale in Laos",
    metaDescription: "New forklifts for Laos operations. Tell us load, height and site and we recommend a model and send a quotation.",
    eyebrow: "New Forklifts",
    h1: "New Forklifts for Sale in Laos",
    intro: "Tell us how you work and we recommend the right model.",
    ctas: [
      {
        label: "Request a Quote",
        href: quoteHref("new", "/forklift-sales/new"),
      },
    ],
    sections: [
      {
        kind: "cards",
        title: "Forklift types",
        items: [
          {
            title: "Electric",
            description: "Indoor, clean, quiet.",
            needsConfirmation: true,
          },
          {
            title: "Diesel",
            description: "Outdoor, heavy duty.",
            needsConfirmation: true,
          },
          {
            title: "LPG",
            description: "Mixed indoor and outdoor.",
            needsConfirmation: true,
          },
          {
            title: "Warehouse trucks",
            description: "Pallet and stacker trucks.",
            needsConfirmation: true,
          },
        ],
      },
      {
        kind: "list",
        title: "Details that speed up your quote",
        items: [
          {
            title: "Load and lift height",
          },
          {
            title: "Indoor or outdoor, floor condition",
          },
          {
            title: "Hours per day",
          },
          {
            title: "Power preference and budget range",
          },
        ],
      },
      {
        kind: "cards",
        title: "Go further",
        items: [
          {
            title: "Used forklifts",
            description: "A lower upfront cost for lighter or occasional work, with selected units checked before sale.",
            routeId: "sales-used",
          },
          {
            title: "Rent first",
            description: "Try a model on your own site and loads before you commit to buying.",
            routeId: "rental",
          },
          {
            title: "Spare parts",
            description: "Filters, tyres and wear parts for servicing later in the truck's life.",
            routeId: "parts",
          },
        ],
      },
    ],
    closing: {
      title: "Get your quotation",
      copy: "Tell us what you need and we reply with a quotation.",
      primary: {
        label: "Request a Quote",
        href: quoteHref("new", "/forklift-sales/new"),
      },
    },
  },
  {
    id: "sales-used",
    metaTitle: "Used Forklifts for Sale in Laos",
    metaDescription: "Selected used forklifts in Laos. Ask for current stock and an inspection. Availability on request, no stock listed that we cannot supply.",
    eyebrow: "Used Forklifts",
    h1: "Used Forklifts for Sale in Laos",
    intro: "Selected used units, checked before you decide. Ask what is available now.",
    ctas: [
      {
        label: "Ask for Used Forklift Stock",
        href: quoteHref("used", "/forklift-sales/used"),
      },
      {
        label: "Request Inspection",
        href: quoteHref("used", "/forklift-sales/used"),
      },
    ],
    sections: [
      {
        kind: "steps",
        title: "How buying used works",
        items: [
          {
            title: "Tell us your need",
            description: "Load, height, budget.",
          },
          {
            title: "We shortlist",
            description: "Units that fit.",
          },
          {
            title: "Inspect",
            description: "Check before purchase.",
            needsConfirmation: true,
          },
          {
            title: "Deliver and support",
            description: "Service and parts.",
          },
        ],
      },
      {
        kind: "list",
        title: "What to check on a used forklift",
        items: [
          {
            title: "Hours and service records",
          },
          {
            title: "Mast, chains and forks",
          },
          {
            title: "Hydraulics and leaks",
          },
          {
            title: "Battery or engine condition",
          },
          {
            title: "Safety devices",
          },
        ],
      },
      {
        kind: "text",
        title: "Current stock",
        body: "Stock changes often. Tell us the capacity and lift height you need and we tell you what is available now.",
        items: [],
      },
      {
        kind: "cards",
        title: "After purchase",
        items: [
          {
            title: "Maintenance",
            description: "A first service and safety check before the truck goes to work, then a regular schedule.",
            routeId: "maintenance",
          },
          {
            title: "Spare parts",
            description: "Parts matched to the model and serial number on the nameplate.",
            routeId: "parts",
          },
          {
            title: "New forklifts",
            description: "Compare new for heavy, multi-shift work or when you want a full working life ahead.",
            routeId: "sales-new",
          },
        ],
      },
    ],
    closing: {
      title: "Get your quotation",
      copy: "Tell us what you need and we reply with a quotation.",
      primary: {
        label: "Request Inspection",
        href: quoteHref("used", "/forklift-sales/used"),
      },
    },
  },
  {
    id: "maintenance",
    metaTitle: "Forklift Maintenance & Repair in Laos",
    metaDescription: "Forklift maintenance and repair in Laos, onsite or in our workshop. Book a service visit and keep your fleet running.",
    eyebrow: "Maintenance & Repair",
    h1: "Forklift Maintenance and Repair in Laos",
    intro: "Preventive service, diagnostics and repair, at your site or in our workshop.",
    ctas: [
      {
        label: "Book Maintenance Service",
        href: quoteHref("service", "/maintenance-service"),
      },
      {
        label: "Talk to a DK LAO Advisor",
        href: "/contact",
      },
    ],
    sections: [
      {
        kind: "cards",
        title: "What we service",
        items: [
          {
            title: "Preventive maintenance",
            description: "Planned servicing at set intervals, so small faults are fixed before they stop work.",
            details: {
              lead: "A forklift that is serviced on schedule rarely stops without warning. Preventive maintenance replaces wearing parts and fluids at set intervals, so faults are found during planned work instead of in the middle of a shift.",
              facts: [
                { value: "200–250 h", label: "typical service interval, by operating hours" },
                { value: "3 months", label: "for lightly used trucks, whichever comes first" },
                { value: "Every shift", label: "operator check before work starts" },
              ],
              topics: [
                {
                  heading: "What a scheduled service covers",
                  body: "Engine oil, hydraulic, coolant, transmission and brake fluids are checked and changed to the manufacturer's plan, and filters are replaced. The mast, lift chains, brakes, steering and tyres are inspected and adjusted, so a weeping hose or a worn brake is dealt with before it turns into a breakdown.",
                },
                {
                  heading: "Setting the right interval",
                  body: "Manufacturers set service by operating hours, typically every 200 to 250 hours, or about every three months for trucks that work fewer hours. Multi-shift work, heavy loads, heat and dust all shorten that interval. Share each truck's hours and working conditions, and the schedule is built around them.",
                },
                {
                  heading: "Planned around your operation",
                  body: "Because the work is planned, it can be booked for a quieter day instead of interrupting loading and dispatch. In a mixed fleet, each truck follows its own schedule, so no unit is overlooked and running costs become predictable.",
                },
              ],
              checklist: {
                heading: "Between services, operators check every shift",
                items: [
                  "Forks, chains and mast for damage",
                  "Tyres and wheel nuts",
                  "Fluid leaks under the truck",
                  "Brakes, steering and horn",
                  "Lights, alarm and seat belt",
                  "Battery charge or fuel level",
                ],
              },
            },
          },
          {
            title: "Breakdown repair",
            description: "Fault finding and repair when a forklift will not start, lift, steer or stop as it should.",
            details: {
              lead: "When a forklift stops, loading and dispatch stop with it. Breakdown repair finds the real cause of the fault, fixes it and returns the truck to work safely, whatever its make or fuel.",
              topics: [
                {
                  heading: "Faults we diagnose and repair",
                  body: "Typical faults include trucks that will not start, electrical problems, slow or jerky lifting, hydraulic leaks, heavy steering, weak brakes, and damage to the mast, chains or tyres. The aim is to fix the cause, not only the symptom, so the same fault does not return a week later.",
                },
                {
                  heading: "Safety comes first",
                  body: "Some faults make a truck unsafe to use. Leaking hydraulics can let a raised load drop, and weak brakes or steering put the operator and everyone nearby at risk. If you see one of the warning signs below, lower the forks, park the truck and keep it out of use until it has been checked.",
                },
                {
                  heading: "Help us bring the right parts",
                  body: "Send the brand, model and serial number from the nameplate, with a short description and a photo or video of the fault. With that information the likely parts can be prepared before work starts, which shortens the time the truck is out of service.",
                },
              ],
              checklist: {
                heading: "Stop the truck and call when you see",
                items: [
                  "Fluid under the truck or on the hoses",
                  "Forks drifting down with a load",
                  "Slow, jerky or noisy lifting",
                  "Warning lights or smoke",
                  "Soft brakes or heavy steering",
                  "Cracked forks or damaged chains",
                ],
              },
            },
          },
          {
            title: "Onsite service",
            description: "We come to you.",
            needsConfirmation: true,
          },
          {
            title: "Workshop service",
            description: "Bring or collect.",
            needsConfirmation: true,
          },
          {
            title: "Battery and charger service",
            description: "Watering, equalising charges and charger checks that keep electric forklifts running a full shift.",
            routeId: "batteries",
          },
          {
            title: "Inspection",
            description: "Safety and condition checks of the mast, chains, forks, brakes and safety devices.",
            details: {
              lead: "Forks, chains and brakes wear gradually, and often where nobody looks. A thorough inspection measures that wear against clear limits, so you know which trucks are safe to keep working and what needs attention next.",
              facts: [
                { value: "12 months", label: "thorough examination, international practice" },
                { value: "6 months", label: "for fork arms and trucks that lift people" },
                { value: "10%", label: "fork heel wear limit (ISO 5057)" },
              ],
              topics: [
                {
                  heading: "International benchmarks",
                  body: "Laos has no single forklift inspection law, so international practice is a sound guide. The UK LOLER regulations call for a thorough examination at least every 12 months, and every 6 months for fork arms and for trucks that lift people. Under ISO 5057, a fork arm worn by 10% at the heel is taken out of service.",
                },
                {
                  heading: "When else to inspect",
                  body: "Before you buy or return a used or rented truck, after any collision or overload, and whenever operators notice a change in how the truck lifts, brakes or steers. If customers or insurers ask for proof that equipment is checked, an inspection gives you that picture truck by truck.",
                },
              ],
              checklist: {
                heading: "What an inspection examines",
                items: [
                  "Mast, carriage and lift chains",
                  "Fork arms, heels and tips",
                  "Hydraulic hoses and cylinders",
                  "Brakes and steering",
                  "Tyres and wheels",
                  "Lights, alarms and seat belt",
                ],
              },
            },
          },
        ],
      },
      {
        kind: "steps",
        title: "How a service booking works",
        items: [
          {
            title: "Report the issue",
            description: "Brand, model, serial, symptoms.",
          },
          {
            title: "Schedule",
            description: "Date and location.",
          },
          {
            title: "Service",
            description: "Technician works.",
          },
          {
            title: "Report",
            description: "What was done and next steps.",
          },
        ],
      },
      // Ported from feature/services-all-products (maintenance checklist). General guidance on what a
      // check covers, not a promise of service terms (maintenanceTerms is not confirmed).
      {
        kind: "list",
        title: "What a maintenance check covers",
        intro: "A full preventive maintenance check usually goes through these points. The technician confirms which apply to your machine.",
        items: [
          { title: "Safety equipment", description: "Seat belt, horn, lights and beacon, overhead guard, load backrest." },
          { title: "Battery and charger", description: "Charge level, terminals, electrolyte level on lead-acid batteries, charger output, cables." },
          { title: "Engine and fuel", description: "Engine oil, coolant, air filter, fuel lines, exhaust." },
          { title: "Electric motor", description: "Brushes, wiring insulation, controller temperature, drive motor noise, regenerative braking." },
          { title: "Brakes", description: "Service brake travel and hold, parking brake, brake fluid, drum or disc wear, pedals." },
          { title: "Chassis and frame", description: "Cracks, counterweight bolts, steps and handrails, operator compartment, nameplate." },
          { title: "Mast and forks", description: "Mast channels and lubrication, lift chains, fork thickness and twist, fork tips, carriage rollers." },
          { title: "Tyres", description: "Tread depth, sidewalls, pressure on pneumatic tyres, rims and hubs, wheel nut torque." },
          { title: "Hydraulics", description: "Fluid level, cylinder seals, hoses, pump pressure, tilt cylinders." },
          { title: "Paint and labels", description: "Rust and corrosion, safety decals, warning labels, capacity plate." },
          { title: "Cleaning and test run", description: "Operator area, grease points, cleaning after service, a final test of every function." },
        ],
      },
      {
        kind: "form",
        title: "Book a service visit",
        items: [],
      },
      {
        kind: "stats",
        title: "Our service promise",
        items: [
          {
            title: "Response",
            needsConfirmation: true,
          },
          {
            title: "Coverage",
            needsConfirmation: true,
          },
          {
            title: "Workshop",
            needsConfirmation: true,
          },
        ],
      },
      {
        kind: "faq",
        title: "Service questions",
        items: [
          {
            title: "Which brands do you service?",
            needsConfirmation: true,
          },
          {
            title: "Do you offer service contracts?",
            needsConfirmation: true,
          },
          {
            title: "Can I get a loan unit while mine is repaired?",
            description: "Ask about rental.",
          },
          {
            title: "Where do spare parts come from?",
            description: "See spare parts.",
          },
        ],
      },
    ],
    closing: {
      title: "Get your quotation",
      copy: "Tell us what you need and we reply with a quotation.",
      primary: {
        label: "Book Maintenance Service",
        href: quoteHref("service", "/maintenance-service"),
      },
    },
  },
  {
    id: "parts",
    metaTitle: "Forklift Spare Parts in Laos",
    metaDescription: "Forklift spare parts and accessories in Laos. Send brand, model and serial number and we match the part and quote.",
    eyebrow: "Spare Parts",
    h1: "Forklift Spare Parts in Laos",
    intro: "Send brand, model and serial number. We match the right part and quote.",
    ctas: [
      {
        label: "Request Spare Parts",
        href: quoteHref("parts", "/spare-parts"),
      },
    ],
    sections: [
      {
        kind: "cards",
        title: "Parts we supply",
        items: [
          {
            title: "Filters and fluids",
            description: "Engine, air, fuel and hydraulic filters, and the oils and fluids your forklift runs on.",
            details: {
              lead: "Filters and fluids are among the cheapest parts on a forklift, and they protect the most expensive ones. Clean filters and fresh, correct fluids keep the engine, hydraulic pump and transmission working the way they were designed to.",
              topics: [
                {
                  heading: "Matched to your model",
                  body: "Engine oil, air, fuel, hydraulic and transmission filters, together with the engine oil, hydraulic fluid, coolant and brake fluid your truck's maker specifies. Send the model and serial number and the right set is matched, so a scheduled service is not held up waiting for one missing filter.",
                },
                {
                  heading: "Why the intervals matter",
                  body: "A blocked filter starves the engine or pump, and old or wrong fluid wears seals and bearings from the inside. Power loss, overheating and slow hydraulics can often be traced back to a filter change that was skipped.",
                },
                {
                  heading: "Electric trucks need them too",
                  body: "Electric forklifts have no engine oil, but their hydraulic system still depends on the correct fluid and a clean filter, so they belong on the same service plan as diesel and LPG trucks.",
                },
              ],
              checklist: {
                heading: "Change sooner than planned if you see",
                items: [
                  "Dark or low fluid at the daily check",
                  "Leaks under the truck",
                  "Loss of power or overheating",
                  "Slow or noisy lifting",
                  "Hot, dusty or heavy-duty work",
                ],
              },
            },
          },
          {
            title: "Tyres and wheels",
            description: "Pneumatic and solid tyres, replaced before worn tread or chunking affects grip and stability.",
            details: {
              lead: "Tyres carry the truck and everything on its forks. As they wear, grip and braking drop and the truck becomes less steady when it lifts and turns, so worn tyres are a safety issue, not only a comfort one.",
              topics: [
                {
                  heading: "Choosing the right tyre",
                  body: "Pneumatic, air-filled tyres cushion the ride and give more ground clearance on outdoor yards, ramps and uneven surfaces, but they can puncture. Solid and press-on tyres cannot puncture and last longer on smooth warehouse concrete. The right choice depends on where each truck spends its day.",
                },
                {
                  heading: "When to replace",
                  body: "Replace a tyre when the tread reaches its wear line, when chunks break away from it, after deep cuts or a puncture, or when the truck starts to vibrate or pull to one side. Replacing both tyres on an axle together keeps the truck level and its load stable.",
                },
              ],
              checklist: {
                heading: "Check tyres every shift for",
                items: [
                  "Tread worn to the wear line",
                  "Missing chunks or deep cuts",
                  "Low pressure on pneumatic tyres",
                  "Loose wheel nuts",
                  "Uneven wear from side to side",
                ],
              },
            },
          },
          {
            title: "Forks and attachments",
            description: "Replacement forks, and attachments such as side shifters, fork positioners, clamps and rotators.",
            details: {
              lead: "Forks take every load the truck lifts. They wear at the heel and can crack or bend, and a worn fork carries less than its rating. The right attachment, in turn, can make each lift faster and gentler on your goods.",
              facts: [{ value: "10%", label: "heel wear limit before a fork is replaced (ISO 5057)" }],
              topics: [
                {
                  heading: "Replacing worn forks",
                  body: "Fork arms are supplied in the length and capacity class your truck and carriage need. A fork worn by 10% at the heel, cracked, bent or with uneven tips is taken out of service under ISO 5057, and forks are normally replaced as a pair so both carry the load evenly.",
                },
                {
                  heading: "Attachments that save time",
                  body: "A side shifter moves the forks sideways without repositioning the truck, which speeds up loading in tight racking. Fork positioners change the fork spread from the seat for mixed pallet sizes. Clamps handle cartons, appliances and drums without pallets, and rotators tip bins and turn loads.",
                },
                {
                  heading: "Keeping capacity right",
                  body: "An attachment adds weight and moves the load further forward, which lowers what the truck can safely lift. Each attachment is matched to the truck, and the capacity plate should show the rating with the attachment fitted.",
                },
              ],
              checklist: {
                heading: "Have forks checked when you see",
                items: [
                  "A heel that looks thinner or worn",
                  "Tips at different heights",
                  "Cracks at the heel or hooks",
                  "Bent or twisted blades",
                ],
              },
            },
          },
          {
            title: "Hydraulic parts",
            description: "Seals, hoses, cylinders and pumps that keep lifting and tilting smooth and leak-free.",
            details: {
              lead: "The hydraulic system lifts, tilts and holds every load. A worn seal or leaking hose shows first as slow, jerky lifting and forks that creep down; left alone, a failing hose can drop a raised load.",
              topics: [
                {
                  heading: "Parts for the whole system",
                  body: "Hoses and fittings, seal kits, lift and tilt cylinders, pumps and control valves, matched to your truck's model and serial number. Diesel, LPG and electric forklifts, stackers and reach trucks all lift with hydraulics, so the same parts and checks apply across a mixed fleet.",
                },
                {
                  heading: "Why a small leak matters",
                  body: "Hydraulic fluid on the floor is a slip hazard, and a system that is losing pressure cannot hold a raised load securely. Hoses often fail where they rub against the mast or where a shifting load presses on them, so a chafed hose is worth replacing before it splits.",
                },
              ],
              checklist: {
                heading: "Signs of a hydraulic problem",
                items: [
                  "Fluid under the truck or on the mast",
                  "Forks creeping down with a load",
                  "Slow, jerky or noisy lifting",
                  "Wet, cracked or chafed hoses",
                  "A mast that tilts on its own",
                ],
              },
            },
          },
          {
            title: "Batteries and chargers",
            description: "Traction batteries, chargers and battery care for electric trucks.",
            routeId: "batteries",
          },
          {
            title: "Lights and safety devices",
            description: "Work lights, beacons, floor warning spots, reverse alarms, mirrors and seat belts.",
            details: {
              lead: "In a busy warehouse, people often hear a forklift before they see it, and sometimes not at all. Lights, beacons and alarms give pedestrians warning in time, and a fastened seat belt keeps the operator protected if a truck tips.",
              topics: [
                {
                  heading: "Be seen",
                  body: "Headlights and work lights light up the load and the route. Flashing beacons mark a moving truck, and blue or red spots projected onto the floor show where a truck is heading before it appears at a corner or a rack end.",
                },
                {
                  heading: "Be heard",
                  body: "Reverse alarms and horns warn people behind and beside the truck. They matter most where racking, machinery noise or dock doors block the view.",
                },
                {
                  heading: "Stay inside the cab",
                  body: "If a counterbalance forklift tips sideways, the safest place for the operator is inside the overhead guard, not jumping clear. A fastened seat belt keeps them there.",
                },
              ],
              checklist: {
                heading: "Fit or replace devices when",
                items: [
                  "A light, alarm or belt fails the daily check",
                  "Trucks share aisles with pedestrians",
                  "Work runs at night or in dim areas",
                  "Your site or customers require extra warnings",
                ],
              },
            },
          },
        ],
      },
      {
        kind: "form",
        title: "Request a part",
        items: [],
      },
      {
        kind: "text",
        title: "Where to find the serial number",
        body: "The nameplate on the forklift shows the brand, model and serial number. Send these with your request, or a clear photo of the nameplate, and we match the part.",
        items: [],
      },
      {
        kind: "cards",
        title: "Need more than a part?",
        items: [
          {
            title: "Install and repair",
            description: "Let our technicians fit the part and check the system it belongs to.",
            routeId: "maintenance",
          },
          {
            title: "Batteries and chargers",
            description: "Batteries, chargers and battery care for electric forklifts.",
            routeId: "batteries",
          },
          {
            title: "Guide: parts matching",
            description: "How to read the nameplate and send the details that match the right part.",
            routeId: "article",
          },
        ],
      },
      {
        kind: "faq",
        title: "Parts questions",
        items: [
          {
            title: "Genuine or aftermarket?",
            needsConfirmation: true,
          },
          {
            title: "Lead time?",
            needsConfirmation: true,
          },
          {
            title: "Can I send a photo?",
            description: "Yes, on WhatsApp.",
            needsConfirmation: true,
          },
        ],
      },
    ],
    closing: {
      title: "Get your quotation",
      copy: "Tell us what you need and we reply with a quotation.",
      primary: {
        label: "Request Spare Parts",
        href: quoteHref("parts", "/spare-parts"),
      },
    },
  },
  {
    id: "batteries",
    metaTitle: "Forklift Batteries & Chargers in Laos",
    metaDescription: "Forklift batteries and chargers in Laos matched to your truck and shift pattern. Send model and hours for a recommendation.",
    eyebrow: "Batteries & Chargers",
    h1: "Forklift Batteries and Chargers in Laos",
    intro: "Power matched to your truck, your shifts and your site.",
    ctas: [
      {
        label: "Get a Recommendation",
        href: quoteHref("parts", "/batteries-chargers"),
      },
    ],
    sections: [
      {
        kind: "cards",
        title: "What decides the right battery and charger",
        items: [
          {
            title: "Choosing battery and charger",
            description: "The truck's data plate, your working hours and the charger all have to agree.",
            details: {
              lead: "A forklift battery is part of the truck's design: its voltage, size and weight are set by the manufacturer, and in many electric trucks it also works as counterweight. The right choice starts with the truck's data plate, not with the lowest price.",
              facts: [{ value: "24–80 V", label: "common forklift battery voltages" }],
              topics: [
                {
                  heading: "Read the data plate first",
                  body: "The truck's data plate lists the battery voltage and the minimum battery weight. A lighter battery than specified reduces the truck's stability, and its rated capacity no longer applies. Send us the plate, or a photo of it, with your request.",
                },
                {
                  heading: "Size the battery for the shift",
                  body: "Battery capacity, in ampere-hours, decides how long the truck works between charges. Two trucks of the same model can need different batteries when one runs a light single shift and the other lifts all day.",
                },
                {
                  heading: "The charger must match the battery",
                  body: "A charger is built for one voltage and one battery type, and sized for the battery's capacity. An undersized charger never finishes the charge; the wrong charging profile shortens battery life. Check the charger whenever the battery changes.",
                },
              ],
              checklist: {
                heading: "Send us with your request",
                items: [
                  "Forklift brand, model and serial number",
                  "Battery voltage and capacity, from the battery label",
                  "Charger model and output",
                  "Hours per shift and shifts per day",
                ],
              },
            },
          },
          {
            title: "Planning charging for your shifts",
            description: "A charging routine built around your shifts keeps trucks available and batteries healthy.",
            details: {
              lead: "How you charge matters as much as what you buy. A lead-acid battery charged at random moments and run flat wears out years early; a charging plan built around your shifts keeps trucks available and batteries healthy.",
              facts: [
                { value: "8 h", label: "work on one lead-acid charge" },
                { value: "8 h", label: "to charge fully" },
                { value: "8 h", label: "to cool before use" },
              ],
              topics: [
                {
                  heading: "One shift, one battery",
                  body: "For a single shift, one lead-acid battery per truck is usually enough: work the shift, charge it fully, then let it cool before the next morning. This is the classic 8-8-8 pattern of work, charge and rest.",
                },
                {
                  heading: "Two or three shifts",
                  body: "When trucks work around the clock, one battery has no time to charge and rest. The options are a second battery per truck with a changing point, or batteries and chargers built for charging in breaks. Tell us your hours and we say which fits.",
                },
                {
                  heading: "Habits that shorten battery life",
                  body: "Topping up a lead-acid battery for a few minutes at every break adds charge cycles and heat, and running it below about 20% charge strains it. Put it on charge at around 20–30% and let the charge finish.",
                },
              ],
              checklist: {
                heading: "Signs your charging routine needs a review",
                items: [
                  "Trucks slow down or lose lift power late in the shift",
                  "Batteries are hot when they come off charge",
                  "Charges are stopped before they finish",
                  "Operators charge whenever they like",
                ],
              },
            },
          },
          {
            title: "A safe charging area",
            description: "Ventilation, protective equipment and a planned layout for charging lead-acid batteries.",
            details: {
              lead: "Lead-acid batteries give off hydrogen while they charge and contain sulphuric acid. A charging area does not need to be large, but it needs to be planned before the first battery is connected.",
              facts: [{ value: "4%", label: "hydrogen in air that can ignite" }],
              topics: [
                {
                  heading: "Fresh air and no sparks",
                  body: "Hydrogen is lighter than air and can ignite at about 4% in air. Charge in a well-ventilated area, keep flames, smoking and grinding away, and switch the charger off before connecting or disconnecting a battery.",
                },
                {
                  heading: "Protection for people",
                  body: "Anyone who waters or handles batteries needs eye protection, gloves and an apron, with an eyewash station or clean running water close by. Acid spills are neutralised and cleaned up, not washed into drains.",
                },
                {
                  heading: "Power supply and layout",
                  body: "Chargers need a suitable electrical supply and room for trucks to park and connect without blocking aisles. Barriers keep trucks from hitting chargers and cables. Tell us your available power supply when you ask for a charger.",
                },
              ],
              checklist: {
                heading: "A charging area should have",
                items: [
                  "Good airflow, with no ceiling pockets where gas collects",
                  "No-smoking signs and no open flames",
                  "An eyewash station or clean water nearby",
                  "Eye protection, gloves and an apron",
                  "A spill kit for battery acid",
                  "Barriers between trucks and chargers",
                ],
              },
            },
          },
          {
            title: "Battery care in hot conditions",
            description: "Daily habits that protect batteries in the Lao heat.",
            details: {
              lead: "Heat is the main enemy of forklift batteries in Laos. A battery that runs hot every day loses capacity sooner, and a lead-acid battery also loses water faster. A few minutes of care each day protects one of the most expensive parts of the truck.",
              topics: [
                {
                  heading: "Water after charging, not before",
                  body: "Lead-acid batteries use water while they charge. Top them up with distilled or deionised water after a full charge, to the level the maker marks. Filling before charging can make the electrolyte overflow.",
                },
                {
                  heading: "Keep it clean and cool",
                  body: "Dirt and spilled electrolyte on the battery top carry current and corrode terminals. Wipe the top, keep vent caps closed, charge in shade with good airflow, and let a hot battery cool before it goes on charge.",
                },
                {
                  heading: "Equalise and test",
                  body: "A periodic equalising charge balances the cells of a lead-acid battery, as the maker advises. Measuring cell voltage or specific gravity finds a weak cell before it stops the truck. Battery checks can be part of your service visits.",
                },
              ],
              checklist: {
                heading: "Daily and weekly care",
                items: [
                  "Check the water level after charging, as the maker advises",
                  "Wipe the battery top and terminals",
                  "Look for damaged cables and plugs",
                  "Report a battery that runs hot or charges slowly",
                ],
              },
            },
          },
        ],
      },
      {
        kind: "table",
        title: "Battery types at a glance",
        items: [
          {
            title: "Lead-acid",
            description: "Familiar, needs watering",
            needsConfirmation: true,
          },
          {
            title: "Lithium-ion",
            description: "Faster charging, less upkeep",
            needsConfirmation: true,
          },
        ],
      },
      {
        kind: "form",
        title: "Ask for a recommendation",
        items: [],
      },
      {
        kind: "cards",
        title: "Keep electric fleets running",
        items: [
          {
            title: "Battery service",
            description: "Watering, equalising charges and charger checks that keep lead-acid batteries healthy.",
            routeId: "maintenance",
          },
          {
            title: "Spare parts",
            description: "Other parts your electric trucks need: filters, tyres, forks and safety devices.",
            routeId: "parts",
          },
          {
            title: "Electric forklifts",
            description: "Quiet trucks with no exhaust fumes, suited to indoor warehouses and food handling.",
            routeId: "sales-new",
          },
        ],
      },
    ],
    closing: {
      title: "Get your quotation",
      copy: "Tell us what you need and we reply with a quotation.",
      primary: {
        label: "Get a Recommendation",
        href: quoteHref("parts", "/batteries-chargers"),
      },
    },
  },
  {
    id: "warehouse",
    metaTitle: "Warehouse Equipment & Solutions in Laos",
    metaDescription: "Warehouse equipment in Laos: racking, shelving, handling and cleaning. Book a site survey and plan safer, faster material flow.",
    eyebrow: "Warehouse Equipment",
    h1: "Warehouse Equipment and Solutions in Laos",
    intro: "Plan racking, handling and cleaning together, from one site visit.",
    ctas: [
      {
        label: "Schedule Site Survey",
        href: quoteHref("warehouse", "/warehouse-equipment"),
      },
    ],
    sections: [
      {
        kind: "cards",
        title: "What we equip",
        items: [
          {
            title: "Racking and shelving",
            description: "Pallet racking and shelving planned around your goods, trucks and aisle widths.",
            routeId: "racking",
          },
          {
            title: "Material handling",
            description: "Forklifts, pallet trucks and stackers matched to how your goods move.",
            routeId: "material",
          },
          {
            title: "Cleaning equipment",
            description: "Nilfisk scrubber dryers, sweepers and industrial vacuums for warehouse and facility floors.",
            routeId: "cleaning",
          },
          {
            title: "Power",
            description: "Batteries and chargers that keep electric trucks working through each shift.",
            routeId: "batteries",
          },
        ],
      },
      {
        kind: "steps",
        title: "How a site survey works",
        items: [
          {
            title: "Request",
            description: "Tell us about the site.",
          },
          {
            title: "Visit",
            description: "We measure and observe flow.",
            needsConfirmation: true,
          },
          {
            title: "Recommend",
            description: "Layout and equipment list.",
          },
          {
            title: "Quote",
            description: "Clear quotation.",
          },
        ],
      },
      {
        kind: "cards",
        title: "Problems we help solve",
        items: [
          {
            title: "Unsafe racking and stacking",
            description: "Overloaded beams, damaged uprights and floor stacks that lean.",
            details: {
              lead: "Unsafe storage rarely fails all at once. It starts with a bent upright, a beam loaded past its label or a floor stack one pallet too high, and it grows until something falls.",
              facts: [
                { value: "12 months", label: "longest gap between expert rack inspections (EN 15635)" },
                { value: "Weekly", label: "visual rack check by your own team" },
              ],
              topics: [
                {
                  heading: "Know your load limits",
                  body: "Every rack has a safe working load per beam level and per bay. When the limits are not labelled, nobody can tell when a level is overloaded. Load signs should be easy to read from the aisle.",
                },
                {
                  heading: "Damage needs action",
                  body: "Forklift impacts bend uprights and knock beams loose, and a damaged upright carries less than its rating. Unload badly damaged bays until they are repaired. Column guards and end-of-aisle barriers reduce new damage.",
                },
                {
                  heading: "Floor stacks",
                  body: "Stack only as many pallets as the goods and packaging can carry, on a level floor, with stable loads. Crushed bottom cartons and leaning stacks are the first warning that a stack is too high.",
                },
              ],
              checklist: {
                heading: "Warning signs",
                items: ["Bent or twisted uprights", "Beams without locking pins", "Missing load signs", "Pallets overhanging beams", "Leaning floor stacks"],
              },
            },
          },
          {
            title: "Slow picking and loading",
            description: "Long walks, searching for stock and trucks queuing at the dock.",
            details: {
              lead: "Most of the time in a warehouse goes on moving between places, not on lifting. Layout and the place each product is stored decide how far people and trucks travel for every order.",
              topics: [
                {
                  heading: "Fast movers close to dispatch",
                  body: "Products picked most often belong nearest the dispatch area, at easy working height. Slow movers can go higher and further away. Review the storage places when your product range or sales pattern changes.",
                },
                {
                  heading: "One-way flow",
                  body: "Receiving, storage, picking and dispatch work better when trucks and pickers do not cross each other's paths. A one-way flow through the building cuts waiting time and the risk of collisions.",
                },
                {
                  heading: "The right tool for each move",
                  body: "A forklift is not always the fastest tool. Pallet trucks and stackers suit short moves and order picking; forklifts suit loading vehicles and high storage. Matching each task to the right equipment frees forklifts for the work only they can do.",
                },
              ],
              checklist: {
                heading: "Signs the layout is slowing you down",
                items: [
                  "Pickers walk past slow stock to reach fast stock",
                  "Trucks wait for each other in the aisles",
                  "Goods are staged in the aisles",
                  "Loading falls behind at the end of the day",
                ],
              },
            },
          },
          {
            title: "Aisles too narrow or blocked",
            description: "Trucks that cannot turn, and pallets left where people walk.",
            details: {
              lead: "Aisle width and truck choice are one decision. A truck that needs more room than the aisle gives works slowly, hits racking and damages goods.",
              facts: [
                { value: "3.5–4 m", label: "typical aisle for a counterbalance forklift" },
                { value: "2.7–3 m", label: "typical aisle for a reach truck" },
              ],
              topics: [
                {
                  heading: "Check the truck's turning room",
                  body: "Every forklift's data sheet states the aisle width it needs to turn and stack a pallet of a given size. Compare that figure with your aisles, measured between loads, before you buy or rent, and leave room for the operator.",
                },
                {
                  heading: "Narrower aisles need different trucks",
                  body: "When floor space is tight, a reach truck or another narrow-aisle truck can store more pallets in the same building. These trucks need a smooth, level floor and suit indoor work, so the floor is part of the decision.",
                },
                {
                  heading: "Keep aisles clear",
                  body: "Pallets parked in aisles, wrapping waste and staged goods narrow the working width and hide pedestrians. Marked floor lanes and a staging area by the dock keep aisles open and walkers visible.",
                },
              ],
              checklist: {
                heading: "Measure before choosing a truck",
                items: [
                  "Clear width between loads, not between uprights",
                  "Pallet size and which way it is picked",
                  "Turning space at the aisle ends",
                  "Walkways that cross the aisles",
                ],
              },
            },
          },
          {
            title: "Dusty or slippery floors",
            description: "Dust that settles on stock, and spills that make floors unsafe.",
            details: {
              lead: "Floors carry everything in a warehouse. Dust settles on stock and machines, and oil or water turns a busy floor into a slip risk for people and a skid risk for forklifts.",
              topics: [
                {
                  heading: "Clean as you work",
                  body: "Sweeping on a schedule removes the dust and pallet debris that forklift tyres grind into the floor. Clean spills straight away and find where they come from: a leaking truck, a damaged pack or a roof leak.",
                },
                {
                  heading: "The right machine for the area",
                  body: "Sweepers collect dry dust and debris; scrubber dryers wash and dry the floor in one pass, so it can be used straight away. The area, the floor and the type of dirt decide which you need.",
                },
                {
                  heading: "Floors and forklifts",
                  body: "A clean, dry floor gives forklift tyres grip for braking and turning. Cracked concrete and loose debris also wear tyres faster and shake loads, so floor repairs belong on the same list.",
                },
              ],
              checklist: {
                heading: "Floor problems to look for",
                items: ["Dust on stored goods", "Oil or water patches in the aisles", "Grit and tyre marks at turns", "Cracked or broken concrete"],
              },
            },
          },
        ],
      },
    ],
    closing: {
      title: "Book your site survey",
      copy: "Tell us what you need and we reply with a quotation.",
      primary: {
        label: "Schedule Site Survey",
        href: quoteHref("warehouse", "/warehouse-equipment"),
      },
    },
  },
  {
    id: "material",
    metaTitle: "Material Handling Equipment in Laos",
    metaDescription: "Material handling equipment in Laos: forklifts, pallet trucks and stackers matched to your warehouse or factory.",
    eyebrow: "Material Handling",
    h1: "Material Handling Equipment in Laos",
    intro: "The right equipment to lift, move and stack your goods.",
    ctas: [
      {
        label: "Request a Quote",
        href: quoteHref("warehouse", "/material-handling"),
      },
    ],
    sections: [
      {
        kind: "cards",
        title: "Equipment types",
        items: [
          {
            title: "Forklifts",
            description: "Rent or buy counterbalance forklifts for docks, yards and racking.",
            routeId: "sales",
          },
          {
            title: "Pallet trucks and stackers",
            needsConfirmation: true,
          },
          {
            title: "Attachments",
            needsConfirmation: true,
          },
        ],
      },
      {
        kind: "cards",
        title: "Plan the whole flow",
        items: [
          {
            title: "Racking",
            description: "Storage matched to your trucks' lift height and aisle width.",
            routeId: "racking",
          },
          {
            title: "Rental",
            description: "Extra trucks for seasonal peaks and projects, without buying.",
            routeId: "rental",
          },
          {
            title: "Power",
            description: "Batteries and chargers for electric trucks, pallet trucks and stackers.",
            routeId: "batteries",
          },
        ],
      },
    ],
    closing: {
      title: "Get your quotation",
      copy: "Tell us what you need and we reply with a quotation.",
      primary: {
        label: "Request a Quote",
        href: quoteHref("warehouse", "/material-handling"),
      },
    },
  },
  {
    id: "racking",
    metaTitle: "Pallet Racking & Shelving in Laos",
    metaDescription: "Pallet racking and shelving for warehouses in Laos. Book a site survey for a layout that fits your goods and your forklifts.",
    eyebrow: "Racking & Shelving",
    h1: "Pallet Racking and Shelving in Laos",
    intro: "Storage planned around your goods, your aisles and your forklifts.",
    ctas: [
      {
        label: "Schedule Site Survey",
        href: quoteHref("warehouse", "/racking-shelving"),
      },
    ],
    sections: [
      {
        kind: "cards",
        title: "Storage systems",
        items: [
          {
            title: "Pallet racking",
            needsConfirmation: true,
          },
          {
            title: "Shelving",
            needsConfirmation: true,
          },
          {
            title: "Picking bins and workstations",
            needsConfirmation: true,
          },
        ],
      },
      {
        kind: "list",
        title: "Racking safety basics",
        items: [
          {
            title: "Load capacity labels",
          },
          {
            title: "Aisle width for your truck",
          },
          {
            title: "Inspection and damage checks",
          },
        ],
      },
      {
        kind: "cards",
        title: "Pair with",
        items: [
          {
            title: "Forklifts for racking height",
            description: "Trucks that reach your top beam level safely with a full load.",
            routeId: "sales",
          },
          {
            title: "Rental for peak storage",
            description: "Extra lifting capacity for seasonal stock, without adding to your fleet.",
            routeId: "rental",
          },
          {
            title: "Warehouse survey",
            description: "Plan the layout, aisle width and load capacity before you buy racking.",
            routeId: "warehouse",
          },
        ],
      },
    ],
    closing: {
      title: "Get your quotation",
      copy: "Tell us what you need and we reply with a quotation.",
      primary: {
        label: "Schedule Site Survey",
        href: quoteHref("warehouse", "/racking-shelving"),
      },
    },
  },
  {
    id: "cleaning",
    // Brand confirmed by the owner on 25 October 2026: Nilfisk is the main cleaning brand, professional range
    // first, and DK LAO also supplies the Nilfisk consumer range. No stock, model or price claims.
    metaTitle: "Nilfisk Cleaning Equipment in Laos",
    metaDescription:
      "Nilfisk scrubber dryers, sweepers, industrial vacuums and pressure washers in Laos. Tell us your floor and area and we recommend the machine.",
    eyebrow: "Nilfisk Cleaning Equipment",
    h1: "Industrial and Professional Cleaning Equipment in Laos",
    intro:
      "We supply Nilfisk, the Danish cleaning brand since 1906: scrubber dryers, sweepers, vacuums and pressure washers matched to your floor, your area and your routine.",
    ctas: [
      {
        label: "Get a Recommendation",
        href: quoteHref("cleaning", "/cleaning-equipment"),
      },
    ],
    sections: [
      {
        kind: "cards",
        title: "The Nilfisk professional range",
        intro: "Machines for industry and business, from walk-behind to ride-on. Ask which models are available now.",
        items: [
          {
            title: "Scrubber dryers",
            description: "Wash, scrub and dry hard floors in one pass, for warehouses, factories, shops and halls.",
          },
          {
            title: "Sweepers",
            description: "Collect dust, sand and pallet debris from warehouse floors, yards and car parks.",
          },
          {
            title: "Robotic floor cleaners",
            description: "Autonomous scrubbers that clean large floors on a set route, so your team can focus on other work.",
          },
          {
            title: "Industrial vacuums",
            description: "Pick up dust, fine powder, liquids and chips in production, food processing and workshops.",
          },
          {
            title: "Commercial vacuums",
            description: "Dry, wet and dry, and upright vacuums for offices, hotels, shops and daily cleaning.",
          },
          {
            title: "Pressure washers",
            description: "Mobile and stationary high-pressure washers for vehicles, machines, workshops and farm buildings.",
          },
          {
            title: "Detergents",
            description: "Nilfisk cleaning agents for tough dirt and films, matched to the machine and the floor.",
          },
        ],
      },
      {
        kind: "table",
        title: "Match machine to site",
        items: [
          {
            title: "Large smooth floors",
            description: "Scrubber dryer",
          },
          {
            title: "Dust and debris",
            description: "Sweeper",
          },
          {
            title: "Fine dust, chips or liquids in production",
            description: "Industrial vacuum",
          },
          {
            title: "Offices, hotels and shops",
            description: "Commercial vacuum",
          },
          {
            title: "Vehicles, machines and outdoor areas",
            description: "Pressure washer",
          },
          {
            title: "Spills and small areas",
            description: "Wet and dry vacuum",
          },
        ],
      },
      {
        kind: "cards",
        title: "Planning floor cleaning",
        items: [
          {
            title: "Sizing the machine to the area",
            description: "Floor area, cleaning frequency and the narrowest gap decide the machine size.",
            details: {
              lead: "Cleaning machines are chosen by the floor area and how often it must be cleaned. A machine too small for the area keeps operators busy for hours; one too large cannot reach corners and narrow aisles.",
              facts: [{ value: "2,000 m²/h", label: "a 50 cm path at 4 km/h, in theory" }],
              topics: [
                {
                  heading: "Work out the cleaning time",
                  body: "A machine's theoretical output is its cleaning width times its speed. Real output is well below that because of turns, overlaps and emptying tanks. Divide your floor area by the real rate to see how long each round takes.",
                },
                {
                  heading: "Walk-behind or ride-on",
                  body: "Walk-behind machines suit smaller areas, shops and tight spaces. Ride-on machines cover large open floors faster and with less effort for the operator. Sites with both kinds of space sometimes use one of each.",
                },
                {
                  heading: "Battery or cable",
                  body: "Battery machines move freely and suit large floors and busy sites. Mains machines suit small areas close to sockets. A battery machine's run time should cover a full cleaning round without a recharge.",
                },
              ],
              checklist: {
                heading: "Measure for a recommendation",
                items: [
                  "Floor area to clean, in square metres",
                  "How often it is cleaned",
                  "Narrowest aisle or doorway",
                  "Obstacles such as racking, columns and stock",
                ],
              },
            },
          },
          {
            title: "Sweep, scrub or both",
            description: "Sweepers collect dry dirt; scrubber dryers wash. Many sites need both.",
            details: {
              lead: "Sweepers and scrubber dryers do different jobs. Many sites need both: one to collect dry debris, the other to wash the floor and leave it dry.",
              topics: [
                {
                  heading: "Sweepers for dry dirt",
                  body: "A sweeper brushes dust, sand, pallet splinters and packaging scraps into a hopper, with filters that hold back fine dust. It suits warehouses, yards and car parks with plenty of loose debris.",
                },
                {
                  heading: "Scrubber dryers for washing",
                  body: "A scrubber dryer puts down water and detergent, scrubs with brushes or pads, then vacuums the dirty water back up through a squeegee. The floor is clean and dry enough to walk on straight away.",
                },
                {
                  heading: "Sweep first, then scrub",
                  body: "Heavy debris blocks a scrubber's squeegee and leaves streaks of water behind. Sweep loose dirt first, then scrub. On lightly soiled floors a scrubber dryer alone can do both in one pass.",
                },
              ],
              checklist: {
                heading: "Which machine for which dirt",
                items: [
                  "Mostly dry dust and debris: a sweeper",
                  "Oil, tyre marks or stains: a scrubber dryer",
                  "Food and hygiene areas: a scrubber dryer",
                  "Loose debris and stains: sweep, then scrub",
                ],
              },
            },
          },
          {
            title: "Daily machine care",
            description: "A few minutes after each use keeps machines cleaning well for years.",
            details: {
              lead: "Cleaning machines work in dirt every day, so a few minutes of care after each use decides how well they clean next time and how long they last.",
              facts: [{ value: "Every use", label: "empty and rinse the tanks" }],
              topics: [
                {
                  heading: "Tanks and squeegee",
                  body: "Empty and rinse the recovery tank after every use, and leave it open to dry so it does not smell. Wipe the squeegee blades; a worn or dirty blade leaves stripes of water on the floor.",
                },
                {
                  heading: "Brushes, pads and filters",
                  body: "Remove string and wire wrapped around brushes, turn or change pads, and clean dust filters. A clogged filter makes a sweeper blow dust around instead of collecting it.",
                },
                {
                  heading: "Batteries",
                  body: "Battery machines need the same care as forklift batteries: full charges, water after charging for lead-acid types, and a cool, ventilated place to charge.",
                },
              ],
              checklist: {
                heading: "After every use",
                items: ["Empty and rinse the recovery tank", "Clean the squeegee and suction hose", "Check brushes or pads", "Charge the battery fully"],
              },
            },
          },
        ],
      },
      {
        kind: "text",
        title: "Nilfisk for home and small business",
        body: "We also supply the Nilfisk consumer range for homes, cars and small shops:",
        items: [
          { title: "High-pressure washers", description: "cars, motorbikes, terraces and garden tools" },
          { title: "Vacuum cleaners", description: "everyday cleaning at home and in small offices" },
          { title: "Wet and dry vacuums", description: "spills, workshops and garages" },
        ],
      },
      {
        kind: "form",
        title: "Get a recommendation",
        items: [],
      },
      {
        kind: "cards",
        title: "For these facilities",
        items: [
          {
            title: "Warehouses",
            description: "High-traffic floors where dust and pallet debris need regular sweeping and scrubbing.",
            routeId: "warehouse",
          },
          {
            title: "Industries",
            description: "See which cleaning and handling equipment suits your sector.",
            routeId: "industries",
          },
          {
            title: "Machine service",
            description: "Servicing that keeps cleaning machines working, alongside your forklifts.",
            routeId: "maintenance",
          },
        ],
      },
      {
        kind: "faq",
        title: "Cleaning equipment questions",
        items: [
          {
            title: "Which cleaning brand do you supply?",
            description: "Nilfisk, for professional and industrial cleaning, and the Nilfisk consumer range for homes and small businesses.",
          },
          {
            title: "Which machine do I need?",
            description: "Tell us the floor type, the area in square metres, the kind of dirt and how often you clean. We recommend the machine and send a quotation.",
          },
          {
            title: "Do you show prices?",
            description: "We quote per request, because the right model depends on your floor, area and routine.",
          },
        ],
      },
    ],
    closing: {
      title: "Get your Nilfisk recommendation",
      copy: "Tell us your floor, area and the dirt you deal with. We recommend the machine and reply with a quotation.",
      primary: {
        label: "Get a Recommendation",
        href: quoteHref("cleaning", "/cleaning-equipment"),
      },
    },
  },
  // Industries hub and sector pages live in industry-pages.ts.
  ...industryPageList,
  {
    id: "knowledge",
    metaTitle: "Forklift & Warehouse Guides for Laos",
    metaDescription: "Practical guides on forklift rental, buying, maintenance, spare parts and warehouse equipment for businesses in Laos.",
    eyebrow: "Knowledge Center",
    h1: "Forklift and Warehouse Guides",
    intro: "Short, practical answers before you request a quote.",
    ctas: [
      {
        label: "Request a Quote",
        href: quoteHref(undefined, "/knowledge-center"),
      },
    ],
    sections: [
      {
        kind: "cards",
        title: "Latest guides",
        items: [
          {
            title: "How to prepare a forklift rental request",
            description: "Rental",
            routeId: "article",
          },
          {
            title: "How to choose forklift capacity",
            description: "Buying",
            routeId: "sales",
          },
          {
            title: "What to check on a used forklift",
            description: "Buying",
            routeId: "sales-used",
          },
          {
            title: "Which details match a spare part",
            description: "Parts",
            routeId: "parts",
          },
          {
            title: "Choosing a floor scrubber",
            description: "Cleaning",
            routeId: "cleaning",
          },
          {
            title: "Electric or diesel forklift?",
            description: "Buying",
            routeId: "sales-new",
          },
        ],
      },
    ],
    closing: {
      title: "Get your quotation",
      copy: "Tell us what you need and we reply with a quotation.",
      primary: {
        label: "Request a Quote",
        href: quoteHref(undefined, "/knowledge-center"),
      },
    },
  },
  {
    id: "article",
    metaTitle: "How to Prepare a Forklift Rental Request",
    metaDescription: "A short checklist of what to prepare before asking for forklift rental in Laos, so you get an accurate quotation faster.",
    eyebrow: "Knowledge Center · Rental guide",
    h1: "How to Prepare a Forklift Rental Request",
    intro: "A short checklist of what to prepare before you ask for a forklift rental price, so the quotation comes back faster.",
    ctas: [],
    sections: [
      {
        kind: "faq",
        title: "The five things to prepare",
        items: [
          {
            title: "What is the load?",
            description: "The weight of the heaviest pallet or item you lift. Add its size if it is unusual.",
          },
          {
            title: "How high must it lift?",
            description: "The height of the highest rack or stack you reach, in metres.",
          },
          {
            title: "Where will it work?",
            description: "Indoor or outdoor, the floor surface, ramps, doors and any narrow aisles.",
          },
          {
            title: "How long do you need it?",
            description: "The start date and how long you expect to need the forklift, from days to months.",
          },
          {
            title: "What else helps us quote faster?",
            description: "Your power preference (electric, diesel or LPG), the delivery address and any access limits.",
          },
        ],
      },
      {
        kind: "cards",
        title: "Related guides and pages",
        items: [
          {
            title: "Short-term rental",
            routeId: "rental-short",
          },
          {
            title: "More guides",
            routeId: "knowledge",
          },
        ],
      },
    ],
    closing: {
      title: "Ready to request?",
      copy: "Tell us what you need and we reply with a quotation.",
      primary: {
        label: "Ask for Rental Price",
        href: quoteHref("rental", "/knowledge-center/forklift-rental-request-checklist"),
      },
      secondary: {
        label: "See Rental Options",
        href: "/forklift-rental",
      },
    },
  },
];

export const sitemapPages: Record<string, PageContent> = Object.fromEntries(
  sitemapPageList.map((page) => [page.id, page]),
);

// The sitemap pages in one locale (Lao text: src/messages/lo/sitemap-pages.ts and industry-pages.ts).
export const sitemapPagesFor = (locale: Locale): Record<string, PageContent> =>
  locale === "en" ? sitemapPages : Object.fromEntries(sitemapPageList.map((page) => [page.id, localizePage(page, locale)]));
