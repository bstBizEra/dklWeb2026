import type { ItemDetails } from "@/lib/data/pages";

// Card sections for the "What we recommend" cards on each industry page: how that solution serves that
// industry, written per industry. Keyed by industry page id, then card title. Claims stay within what the
// owner has confirmed: no onsite-service, warranty, response-time or stock promises.
export const industryCardDetails: Record<string, Record<string, ItemDetails>> = {
  "ind-logistics": {
    "Flexible forklift rental": {
      lead: "Logistics volumes rise and fall with harvests, festivals and the end of the year. Renting the extra trucks for those weeks keeps the dock moving without paying all year for machines that stand idle.",
      topics: [
        {
          heading: "Plan the peak in advance",
          body: "Look back at last year's busiest weeks and book extra trucks before them. Peak months are busy for everyone, so an early request is easier to match with the right capacity and mast.",
        },
        {
          heading: "Match the rental to the job",
          body: "Container work needs a truck with a low lowered mast and free lift; yard work needs tyres for rough ground. Tell us where the rented trucks will work, not only how many you need.",
        },
      ],
      checklist: {
        heading: "For a peak rental request",
        items: ["Extra trucks needed, and for how many weeks", "Heaviest pallet and highest lift", "Container, dock or yard work", "Delivery date and site address"],
      },
    },
    "Racking and layout": {
      lead: "Many warehouses still stack pallets on the floor and use only the lower part of the building. Racking planned around your goods and trucks turns that empty height into storage you already pay for.",
      topics: [
        {
          heading: "Plan racking and trucks together",
          body: "The rack height must match what the forklift can lift, and the aisle width must match the room the truck needs to turn and stack. Planning both at once avoids racking the fleet cannot reach.",
        },
        {
          heading: "Labels, guards and checks",
          body: "Every rack bay needs a visible load sign, uprights beside busy aisles need guards, and your team should look for damage regularly. A damaged upright carries less than its rating.",
        },
      ],
      checklist: {
        heading: "Measure before we plan",
        items: ["Clear height to the lowest roof beam", "Pallet size and weight", "Number of pallet places needed", "Forklifts in use today"],
      },
    },
    "Pallet jacks and stackers": {
      lead: "Not every move needs a forklift. On the dock and in short aisles, pallet jacks and stackers move pallets quickly and leave the forklifts free for loading trucks and high racking.",
      topics: [
        {
          heading: "The right tool for short moves",
          body: "A pallet jack is the quickest way to move a pallet a short distance at floor level, such as from a truck to a staging lane. A stacker lifts pallets to lower rack levels in aisles where a forklift cannot turn.",
        },
        {
          heading: "Powered for busy docks",
          body: "Powered pallet trucks and stackers save effort on long or frequent moves, and keep the team working at the same pace through the shift, especially with heavy drink or cement loads.",
        },
      ],
      checklist: {
        heading: "Tell us about the moves",
        items: ["Distance of a typical move", "Pallets moved per hour", "Highest rack level to reach", "Floor surface and ramps"],
      },
    },
    "Scheduled maintenance": {
      lead: "In logistics, one forklift that stops mid-shift holds up the whole dock. Service planned around your shifts and seasons keeps trucks working when the containers arrive.",
      topics: [
        {
          heading: "Service between the peaks",
          body: "Plan the main service visits for the quieter weeks, so every truck has been checked before the busy season starts rather than taken off the dock in the middle of it.",
        },
        {
          heading: "Daily checks catch faults early",
          body: "Operators who check tyres, forks, chains, brakes and leaks before each shift find most faults while they are still small. A truck with a fault is taken out of use and reported, not worked around.",
        },
      ],
      checklist: {
        heading: "To plan a service schedule",
        items: ["Number of trucks, brands and models", "Hour meter reading on each truck", "Shifts per day", "Your peak months"],
      },
    },
  },
  "ind-manufacturing": {
    "Electric forklifts": {
      lead: "Inside a factory the air and the noise matter. Electric forklifts give off no exhaust where they work and run quietly, which makes them the usual choice for production halls and indoor stores.",
      topics: [
        {
          heading: "Where electric fits best",
          body: "Smooth indoor floors, short to medium travel and steady loads suit electric trucks. Outdoor yards with rough ground or long slopes may still need an engine truck, and many plants run both.",
        },
        {
          heading: "Simpler routine service",
          body: "Electric trucks have no engine oil, fuel filters or exhaust system to look after. Routine service centres on brakes, hydraulics, tyres and the battery, which keeps planned maintenance simpler.",
        },
      ],
      checklist: {
        heading: "For an electric forklift quote",
        items: ["Heaviest load and lift height", "Indoor floor and any ramps", "Hours per shift and shifts per day", "Space for charging"],
      },
    },
    "Batteries and chargers": {
      lead: "An electric truck is only as reliable as its battery. In a plant that runs long shifts, the charging plan decides whether the trucks last until the end of every shift.",
      topics: [
        {
          heading: "One battery or two",
          body: "For one shift, one lead-acid battery charged overnight is usually enough. For two or three shifts, plan a second battery per truck or chargers made for charging in breaks.",
        },
        {
          heading: "A charging area that is safe",
          body: "Charge lead-acid batteries in a ventilated area away from sparks, with eye protection, gloves and water for rinsing close by, and keep the charging area out of the way of truck traffic.",
        },
      ],
      checklist: {
        heading: "Send for a battery recommendation",
        items: ["Truck model and battery voltage", "Hours per shift and shifts per day", "Where batteries are charged now", "Power supply in that area"],
      },
    },
    "Material handling": {
      lead: "Line-side work is a series of short, frequent moves: raw material in, finished goods out. Pallet jacks and stackers handle those moves in the tight spaces around machines.",
      topics: [
        {
          heading: "Feed the line on time",
          body: "A stacker can hold material at working height beside the line, and a pallet jack can bring the next pallet before the current one runs out, so machine operators never wait for material.",
        },
        {
          heading: "Keep forklifts away from the line",
          body: "Compact equipment near machines and people keeps the heavier forklifts in the stores and on the dock, where they are safer and do the work only they can do.",
        },
      ],
      checklist: {
        heading: "Map the line-side moves",
        items: ["Pallets per line per shift", "Distance from stores to line", "Aisle widths around machines", "Height material is needed at"],
      },
    },
    "Preventive maintenance": {
      lead: "In a factory an unplanned stop costs more than the repair. Preventive maintenance finds wear before it stops a truck in the middle of a shift and holds up a production line.",
      facts: [
        { value: "200–250 h", label: "typical service interval" },
        { value: "3 months", label: "if the hours come later" },
      ],
      topics: [
        {
          heading: "Service by hours worked",
          body: "Forklifts are usually serviced every 200 to 250 working hours or every three months, whichever comes first. Multi-shift plants reach those hours quickly, so the schedule follows the hour meter.",
        },
        {
          heading: "Plan around production",
          body: "Service visits planned for shift changes, weekends or maintenance days keep the trucks available whenever the lines are running, instead of taking them away at the busiest time.",
        },
      ],
      checklist: {
        heading: "For a service plan",
        items: ["Number of trucks and models", "Hour meter readings", "Shift pattern", "Planned shutdown days"],
      },
    },
  },
  "ind-construction": {
    "Short-term rental": {
      lead: "Most construction work happens in phases. Short-term rental puts the right truck on site for the weeks a phase needs it, and takes it away again when the phase is finished.",
      topics: [
        {
          heading: "Match the truck to the phase",
          body: "Unloading materials, moving bags and blocks, and lifting to upper floors each need different capacity and lift height. Tell us what the truck will do in each phase of the work.",
        },
        {
          heading: "Plan the delivery to site",
          body: "Site access, firm ground at the unloading point and the right time of day all matter when a forklift is delivered. Share the site address and the access route when you book.",
        },
      ],
      checklist: {
        heading: "For a short-term site rental",
        items: ["Start date and number of weeks", "Heaviest load and lift height", "Ground surface on site", "Site address and access"],
      },
    },
    "Long-term rental": {
      lead: "Projects that run a year or more need equipment for the whole programme. Long-term rental gives a steady truck at a planned monthly cost, without buying a machine that sits idle after the project.",
      topics: [
        {
          heading: "Money for the project, not the fleet",
          body: "Renting keeps money in the project instead of tied up in equipment, and a fixed monthly cost can be planned into the project budget from the start.",
        },
        {
          heading: "Change as the site changes",
          body: "As a project moves from groundwork to building and finishing, the loads and heights change. Tell us early when the work changes, so the truck on site still fits the job.",
        },
      ],
      checklist: {
        heading: "For a long-term rental",
        items: ["Project length", "Loads and lift heights over the project", "Ground and weather on site", "Delivery and return dates"],
      },
    },
    "Used forklifts": {
      lead: "For contractors who work on sites year after year, a well-kept used forklift can be a sensible buy: a lower upfront cost for a machine that will face rough conditions anyway.",
      topics: [
        {
          heading: "What to check first",
          body: "Look at the hour meter and service records, the mast, chains and forks, hydraulic leaks, tyres and brakes. On trucks that have worked on sites, look closely underneath and at wear on the mast.",
        },
        {
          heading: "Fit for rough ground",
          body: "Choose pneumatic tyres, enough ground clearance and engine power for the site, even if a smooth-floor warehouse truck costs less. The wrong truck on rough ground wears out quickly.",
        },
      ],
      checklist: {
        heading: "Before buying used",
        items: ["Typical loads and lift height", "Ground conditions on your sites", "Years you plan to keep it", "Budget range"],
      },
    },
    "Breakdown repair": {
      lead: "On a construction site a stopped forklift holds up crews and deliveries. A clear fault report and the right parts are what get it working again quickly.",
      topics: [
        {
          heading: "Help us bring the right parts",
          body: "Send the truck's brand, model and serial number, a short description of the fault and, if you can, a photo or video. That lets the technician find the cause sooner and prepare the likely parts.",
        },
        {
          heading: "Stop before it gets worse",
          body: "A truck with a leaking hydraulic hose, weak brakes or a warning light should be stopped and reported. Working around a fault can turn a small repair into a long one and puts people at risk.",
        },
      ],
      checklist: {
        heading: "When you report a breakdown",
        items: ["Truck brand, model and serial number", "What happened, and any warning lights", "A photo or video of the fault", "Site address and access"],
      },
    },
  },
  "ind-food-beverage": {
    "Electric forklifts": {
      lead: "In food and drink production and storage, exhaust and noise are unwelcome. Electric forklifts give off no fumes where they work, which suits production, packing and storage areas.",
      topics: [
        {
          heading: "Clean air near food",
          body: "With no exhaust where they work, electric trucks help keep production and storage areas clean, which matters wherever products or packaging are open to the air.",
        },
        {
          heading: "Ready for long peak days",
          body: "In the peak season trucks work long hours. Plan the battery and charging around those hours, with a spare battery or charging in breaks for the busiest weeks of the year.",
        },
      ],
      checklist: {
        heading: "For an electric forklift quote",
        items: ["Pallet weight and height", "Hygiene or cold areas", "Hours in the peak season", "Space for charging"],
      },
    },
    "Racking for stock rotation": {
      lead: "Food and drink carry best-before dates. Racking laid out for first in, first out keeps older stock leaving first and makes it easy to see what is in the warehouse.",
      topics: [
        {
          heading: "A layout for first in, first out",
          body: "Lanes or locations arranged so pallets are put away at one end and picked from the other help older stock leave first, with fewer pallets moved twice to reach the oldest one.",
        },
        {
          heading: "Strong enough for full pallets",
          body: "Pallets of bottles and cans are heavy. Every rack level must be rated for the full pallet weight, carry a load sign, and be checked for damage from forklift contact.",
        },
      ],
      checklist: {
        heading: "For a racking plan",
        items: ["Pallet weight and height", "Number of products and pallets", "Building height", "Forklift lift height"],
      },
    },
    "Floor scrubbers": {
      lead: "Spilled product, syrup and water make food and drink floors slippery and unhygienic. Nilfisk scrubber dryers wash and dry the floor in one pass, so it can be used again straight away.",
      topics: [
        {
          heading: "Dry floors, safer trucks",
          body: "A floor left dry gives forklift tyres grip and keeps people from slipping, which a mop and bucket cannot do in a busy hall where trucks keep crossing the wet area.",
        },
        {
          heading: "Choose by area and dirt",
          body: "Walk-behind scrubbers suit smaller rooms, and ride-on machines cover large warehouses. Sticky spills may need a stronger detergent, and the machine is rinsed and dried after every use.",
        },
      ],
      checklist: {
        heading: "For a scrubber recommendation",
        items: ["Floor area to clean", "Floor type", "Kind of spills", "How often you clean"],
      },
    },
    "Peak-season rental": {
      lead: "Drink sales rise sharply around festivals and the hot season. Renting extra forklifts for those weeks keeps loading on schedule without buying trucks for the peak.",
      topics: [
        {
          heading: "Book before the rush",
          body: "Peak weeks are busy for every distributor. Plan the number of extra trucks and the dates early, so the right capacity is ready on site when the volumes start to rise.",
        },
        {
          heading: "The same standard as your fleet",
          body: "Rented trucks should match the loads and lift heights of your own fleet, so operators can move between them safely and every truck can do every job in the busy weeks.",
        },
      ],
      checklist: {
        heading: "For a peak rental",
        items: ["Extra trucks and number of weeks", "Pallet weight and height", "Loading dock or yard", "Delivery date"],
      },
    },
  },
  "ind-retail": {
    "Pallet jacks and stackers": {
      lead: "Back rooms and stockrooms are tight. Pallet jacks and stackers move deliveries and stock where a forklift cannot turn, and with far less noise near customers.",
      topics: [
        {
          heading: "From delivery truck to shelf",
          body: "A pallet jack moves the delivery from the truck into the stockroom, and a stacker lifts pallets to the upper shelving levels in narrow aisles where a forklift will not fit.",
        },
        {
          heading: "Safe around people",
          body: "Compact, slow equipment is safer in spaces staff and customers share. Keep routes clear, and move stock outside the busiest opening hours wherever possible.",
        },
      ],
      checklist: {
        heading: "For a quote",
        items: ["Pallet size and weight", "Stockroom aisle width", "Highest shelf level", "Deliveries per week"],
      },
    },
    "Racking and shelving": {
      lead: "Shelving planned around your product range keeps stock visible, within reach and easy to count. A back room with the right shelving restocks the shop faster.",
      topics: [
        {
          heading: "Fit the shelving to the products",
          body: "Shelf depth and spacing should match your cartons and pallet sizes. Fast sellers belong near the shop door at easy reach; slow-moving stock can go higher and further back.",
        },
        {
          heading: "Clear, labelled locations",
          body: "Every shelf location labelled and kept free of stray stock makes restocking quicker, stock counts more accurate and lost stock easier to find.",
        },
      ],
      checklist: {
        heading: "For a shelving plan",
        items: ["Room dimensions", "Product and carton sizes", "Number of products", "Pallet or carton storage"],
      },
    },
    "Forklifts for the warehouse": {
      lead: "Wholesalers move full pallets in and out every day. A forklift sized for your heaviest pallet and your highest rack keeps both the warehouse and the delivery yard moving.",
      topics: [
        {
          heading: "Size for the heaviest pallet",
          body: "Choose capacity for your heaviest regular pallet at your highest lift, and check what the truck can lift at that height, not only at ground level, where the rating is highest.",
        },
        {
          heading: "Yard and warehouse",
          body: "If the truck works in the yard as well as inside, its tyres and power must suit both surfaces. Tell us where it will drive, including ramps and rough ground.",
        },
      ],
      checklist: {
        heading: "For a forklift quote",
        items: ["Heaviest pallet", "Highest rack level", "Indoor, yard or both", "Hours of work per day"],
      },
    },
    "Floor cleaning machines": {
      lead: "A shop floor is part of every customer's first impression. Nilfisk scrubber dryers clean the aisles before opening and leave the floor dry and safe to walk on.",
      topics: [
        {
          heading: "Clean before the doors open",
          body: "A scrubber dryer cleans the aisles in a fraction of the time a mop needs and leaves no wet patches, so the shop is ready and safe when the first customers arrive.",
        },
        {
          heading: "Quiet machines for opening hours",
          body: "Battery machines with low noise can clean up spills during opening hours, without cables across the aisles or the smell of a wet mop in the shop.",
        },
      ],
      checklist: {
        heading: "For a cleaning recommendation",
        items: ["Floor area", "Floor type", "Opening hours", "Narrowest aisle"],
      },
    },
  },
  "ind-hospitality": {
    "Floor scrubbers": {
      lead: "Lobbies, halls and corridors are the first thing guests see. Nilfisk scrubber dryers clean large hard floors quickly and leave them dry and ready to walk on.",
      topics: [
        {
          heading: "Faster than mops, dry at once",
          body: "A scrubber dryer scrubs and collects the dirty water in one pass, so floors are clean and safe straight away, without wet-floor signs left standing in the lobby.",
        },
        {
          heading: "Walk-behind or ride-on",
          body: "Walk-behind machines suit corridors, restaurants and smaller halls; ride-on machines cover large lobbies, malls and car parks in a fraction of the time.",
        },
      ],
      checklist: {
        heading: "For a recommendation",
        items: ["Floor area and type", "Cleaning times", "Narrowest corridor or door", "Lifts the machine must use"],
      },
    },
    "Pallet jacks for deliveries": {
      lead: "Hotels and malls receive food, drinks, linen and supplies every day. Pallet jacks move them from the loading bay to the stores quickly and out of guests' sight.",
      topics: [
        {
          heading: "A back-of-house route",
          body: "Plan a route from the loading bay to the stores and kitchens that avoids guest areas, with doors and lifts wide enough for a pallet jack and its load.",
        },
        {
          heading: "Less lifting by hand",
          body: "Moving whole pallets instead of single boxes saves the receiving team time and strain, and gets chilled and frozen goods into storage sooner.",
        },
      ],
      checklist: {
        heading: "For a quote",
        items: ["Deliveries per day", "Pallet size and weight", "Route from bay to stores", "Lifts or ramps on the route"],
      },
    },
    "Machine service": {
      lead: "A cleaning machine that stops means floors are missed. Regular service and spare parts keep scrubbers, sweepers and handling equipment working every day.",
      topics: [
        {
          heading: "Daily care by your team",
          body: "Empty and rinse the tanks, clean the squeegee and brushes, and charge the batteries after every use. A few minutes of daily care keeps a machine cleaning well and lasting longer.",
        },
        {
          heading: "Planned service and parts",
          body: "Planned service checks brushes, squeegees, pumps, batteries and drive parts before they fail, and maintenance and parts are available for the machines we supply.",
        },
      ],
      checklist: {
        heading: "For a service plan",
        items: ["Machines, brands and models", "Hours of use per day", "Current problems", "Where the machines are kept"],
      },
    },
  },
};
