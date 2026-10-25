# DK LAO image plan

Status: approved and built 2026-10-24 (v0.16.0). Swaps made after the eye check are recorded in public/images/library/LICENCES.md.

## The problem

The site has three photos (studio forklift, anatomy forklift, Toyota cut-out), reused on Home, About and the footer. The 19 sitemap pages use the shared content-page layout with no hero image and no card images, so most of the site is text on flat colour.

## The approach: one reusable library, keyed by topic

- One photo per topic (22 topics). A page uses its topic photo as the **hero background**.
- A card that links to another page reuses **that page's** photo. One photo then serves many slots, and the same subject always looks the same everywhere (good for recognition).
- Category cards that are not pages (the six parts types, the six industries) use their own topic photos.
- Files live in `public/images/library/<topic>.webp`, named after the topic id, so the CMS and code can refer to a topic, not a file.
- A licence register (`public/images/library/LICENCES.md`) records source URL, photographer, licence and date for each file.

## Treatment, so stock photos look like DK LAO

- One grade for every photo: a navy overlay (`#07111F` to transparent) on hero backgrounds so white text always passes contrast, and a slight desaturation on cards so mixed sources look like one set.
- Fixed crops: hero backgrounds 21:9 (1920 by 820), cards 16:10 (800 by 500). `object-position` per topic picks the focal point.
- WebP, about 120 to 250 KB each, loaded lazily below the fold with `next/image` sizes.
- Alt text describes the subject ("Forklift loading pallets onto a truck"); images used only as decoration get empty alt.

## Slot map

| Page | Hero background | Cards that reuse other topics |
|---|---|---|
| Forklift Rental | rental | rental-short, rental-long |
| Short-Term Rental | rental-short | rental-long, sales-used |
| Long-Term Rental | rental-long | maintenance, batteries, sales |
| Forklifts for Sale | sales-new | sales-new, sales-used, maintenance, parts, batteries |
| New Forklifts | sales-new | sales-used, rental, parts |
| Used Forklifts | sales-used | maintenance, parts, sales-new |
| Maintenance | maintenance | preventive (Preventive maintenance), maintenance (Breakdown repair), batteries, knowledge (Inspection) |
| Spare Parts | parts | parts, tyres, batteries (6 part types), maintenance, knowledge |
| Batteries and Chargers | batteries | maintenance, parts, sales-new |
| Warehouse Equipment | warehouse | racking, material, cleaning, batteries |
| Material Handling | material | rental, racking, batteries |
| Racking and Shelving | racking | rental, warehouse |
| Cleaning Equipment | cleaning | warehouse, industries, maintenance |
| Industries | about | logistics, manufacturing, construction, food-beverage, retail, hospitality |
| Logistics and Warehousing | logistics | rental, racking, maintenance, cleaning |
| Knowledge Center | knowledge | one per guide topic (rental, sales-new, sales-used, parts, cleaning, batteries) |
| Rental guide article | knowledge | rental-short |
| Contact | contact | rental, contact |
| Request a Quote | contact | none |

## Candidates (free for commercial use, no attribution required)

Checked by licence flags and page titles, **not yet by eye**: each must be looked at for logos, faces and setting before use. First row per topic is the recommended pick.

| Topic | Recommended | Alternative | Watch for |
|---|---|---|---|
| rental | [Forklift in pallet aisle, Bernd Dittrich](https://unsplash.com/photos/a-forklift-driving-through-a-warehouse-filled-with-pallets-F2C_mSrb6iM) | [Driver in warehouse, fr0ggy5](https://unsplash.com/photos/a-man-driving-a-forklift-in-a-warehouse-Yz2Q4dHyMW0) | brand on the mast |
| rental-short | [Loading bricks onto a truck, metin erkut bayrak](https://unsplash.com/photos/forklift-loading-bricks-onto-a-truck-outdoors-xKxdWu-HDfI) | [Loading a delivery truck, Bernd Dittrich](https://unsplash.com/photos/forklift-loading-pallets-of-goods-into-a-truck-f0qt5HS40E4) | truck livery |
| rental-long | [Orange forklifts in a row, Bernd Dittrich](https://unsplash.com/photos/orange-forklifts-parked-outside-a-modern-building-Axa8zfNvrso) | [Warehouse of parked machines, Duc LE](https://unsplash.com/photos/a-large-warehouse-filled-with-lots-of-machines-p0VP_TOAd5E) | only 2 to 3 trucks, not a fleet |
| sales-new | [Yellow and black forklift, Pickawood](https://unsplash.com/photos/yellow-and-black-fork-lift-6tAIO3pxde4) | [Forklift in tidy warehouse, Man Chung](https://unsplash.com/photos/a-forklift-parked-inside-of-a-warehouse-OqeSaL0nl28) | brand on the body |
| sales-used | [Cab, seat and controls, Cooper Kuppens](https://unsplash.com/photos/forklift-cab-with-seat-and-controls-QGie3dtuXVI) | [Man on a forklift, Cemrecan Yurtman](https://unsplash.com/photos/a-man-standing-on-top-of-a-forklift-in-a-warehouse-GjmQzjPuF30) | weak match, see gaps |
| maintenance | [Workers repairing machinery, Kenny](https://unsplash.com/photos/workers-in-hard-hats-repair-large-industrial-machinery-gears-nJo5fYZ_OK0) | [Mechanic at an engine, Dextar Studio](https://unsplash.com/photos/mechanic-working-on-a-car-engine-in-a-workshop-XP8o9_Arwqg) | faces |
| parts | [Belts and parts on shelves, Balaji Srinivasan](https://www.pexels.com/photo/lots-of-rubber-belts-on-shelves-and-floor-4238222/) | [Pile of metal parts, cottonbro](https://www.pexels.com/photo/a-pile-of-metal-spare-parts-7568430/) | cluttered |
| tyres | [Stacked tyres, Goh Rhy Yan](https://unsplash.com/photos/assorted-verhicle-tire-lot-ud0twV98uvg) | [Row of tyres, Iggy Love](https://unsplash.com/photos/a-row-of-tires-sitting-in-a-warehouse-UlMjKg7ua78) | sidewall brands |
| batteries | [Worker checking industrial batteries, Heru Dharma](https://www.pexels.com/photo/industrial-worker-inspecting-batteries-in-warehouse-36594160/) | [Battery terminals, Vanya Smythe](https://unsplash.com/photos/rows-of-batteries-with-red-and-blue-terminals-CH7kRmyBQ4I) | not forklift charging |
| warehouse | [Wide warehouse, Arum Visuals](https://unsplash.com/photos/a-warehouse-filled-with-lots-of-boxes-and-pallets-VnMbc9Szs-E) | [High-ceiling warehouse, Alberto Rodríguez](https://unsplash.com/photos/a-large-warehouse-filled-with-lots-of-boxes--aCrA9FmT8Y) | box labels |
| material | [Yellow pallet jack, Thomas Rodriguez](https://unsplash.com/photos/person-pulling-yellow-pallet-jack-hXncUMgzeuA) | [Pallets on a pallet jack, Gorilla ROI](https://unsplash.com/photos/man-pushing-wooden-pallets-on-a-pallet-jack-outdoors-GP1dZgM6jfc) | outdoors |
| racking | [Long racking aisles, Lance Chang](https://unsplash.com/photos/a-large-warehouse-filled-with-lots-of-shelves-h3pVxOIpnzk) | [Blue shelving, Jacques Dillies](https://unsplash.com/photos/warehouse-shelving-with-cardboard-boxes-jcav1COVvOc) | none known |
| cleaning | [Floor scrubber in use, Bin White](https://unsplash.com/photos/a-person-uses-a-floor-scrubber-inside-a-building-INDGbj_ojG4) | [Scrubber product shot, giyofloor](https://unsplash.com/photos/teal-industrial-floor-scrubber-with-front-brushes-jP34CmsnLa0) | maker branding on the alternative |
| logistics | [Trucks at a warehouse, Troy Mortier](https://unsplash.com/photos/truck-and-trailers-parked-in-front-of-a-warehouse-xkAIwD0hsbg) | [Container handler at a port, Solømen](https://unsplash.com/photos/forklift-moving-shipping-containers-at-a-port-EoS4ZFRJCJ4) | livery, container logos |
| manufacturing | [Textile factory floor, Lalit Kumar](https://unsplash.com/photos/industrial-textile-factory-with-machinery-and-pipes-HpPmiduLDC0) | [Orange machines, Simon Kadula](https://unsplash.com/photos/a-factory-filled-with-lots-of-orange-machines-8gr6bObQLOI) | robot brand on the alternative |
| construction | [Site with trucks and equipment, Troy Mortier](https://unsplash.com/photos/a-construction-site-with-trucks-and-construction-equipment-MqrMV9id_oo) | [Excavator loading a truck, Troy Mortier](https://unsplash.com/photos/excavator-dumping-soil-into-dump-truck-eKY6_9W_iqY) | equipment brands |
| food-beverage | [Stacked plastic crates, Irving Trejo](https://unsplash.com/photos/assorted-plastic-crate-lot-UMgsYLI3if4) | none suitable (beer can stack has brand labels) | weak match, see gaps |
| retail | [Stocked store aisle, Oxana Melis](https://unsplash.com/photos/a-store-aisle-filled-with-lots-of-items-loDPKt_srQ0) | [Store interior, Oxana Melis](https://unsplash.com/photos/a-store-filled-with-lots-of-shelves-filled-with-items-hNaZIOgaEBQ) | product labels |
| hospitality | [Housekeeping cart in a hotel corridor, Ashwini Chaudhary](https://unsplash.com/photos/housekeeping-cart-in-hotel-corridor-Iu6parQAO-U) | [Maintenance worker in a hallway, Bagoes Ilhamy](https://unsplash.com/photos/a-man-in-a-hard-hat-and-overalls-standing-in-a-hallway-aXxd_GM1KMs) | none known |
| knowledge | [Tablet in a warehouse, Rodrigo Rodrigues](https://unsplash.com/photos/man-in-a-warehouse-looking-up-while-holding-a-tablet-DvUy7qVOJRE) | [Vest and tablet, Rodrigo Rodrigues](https://unsplash.com/photos/man-in-vest-using-tablet-in-a-warehouse-4kjtbC-wMHs) | face |
| contact | [Handshake, Cytonn Photography](https://unsplash.com/photos/two-people-shaking-hands-n95VMLxqM2I) | [Headsets in an office, Charanjeet Dhiman](https://unsplash.com/photos/women-wearing-headsets-in-workspace-mHusyBu4bxM) | office, not warehouse |
| about | [Workers in a warehouse aisle, Adrian Sulyok](https://unsplash.com/photos/workers-walking-through-warehouse-aisle-c_4eaGRDSVU) | [Team on a factory floor, Arno Senoner](https://unsplash.com/photos/a-group-of-men-in-a-factory-oLS6IxceVNs) | faces on the alternative |

Licences: [Unsplash License](https://unsplash.com/license) and [Pexels License](https://www.pexels.com/license/). Both allow free commercial use without attribution; neither allows selling the photo unaltered or implying the photographer endorses DK LAO. Attribution is still recorded in the register as good practice.

## Honest limits of stock

Stock photos are **not unique**: competitors can use the same ones. Weak or missing topics:

- sales-new: no unbranded studio forklift (the Pexels ones show ACE, a competitor brand).
- sales-used: no forklift being inspected in a workshop.
- batteries: no forklift battery on charge.
- parts and tyres: no clean shelves of forklift parts, no forklift wheels.
- food-beverage: no unbranded drinks on pallets.
- contact: no handshake in a warehouse.
- rental-long: no real fleet row.

## The unique option: DK LAO's own photos

One half-day shoot at the Vientiane yard would replace the weakest stock and make the site truly DK LAO's. Shot list, in priority order:

1. The rental fleet lined up (rental-long, rental).
2. A forklift loading a truck at a customer dock (rental-short).
3. A technician servicing a forklift, hands and tools in focus (maintenance, sales-used).
4. Forklift batteries on charge (batteries).
5. Parts shelves: filters, tyres, forks (parts, tyres).
6. A new forklift on delivery day, clean background (sales-new).
7. A floor scrubber working in a customer warehouse (cleaning).
8. The advisor team at the office, phone and laptop (contact, about).

Landscape, daylight, no visible customer branding without the customer's permission. Each new photo drops into the same topic file name, so no code changes.

## Next steps

1. Owner approves the download of the recommended picks (22 files, about 4 to 5 MB in total at 1600 px WebP).
2. Each file is checked by eye; anything with a prominent logo or face is swapped for the alternative.
3. Build the topic-image support in the content page (hero background and card images) and the licence register.
