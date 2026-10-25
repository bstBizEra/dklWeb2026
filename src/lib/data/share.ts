import { contactPage, forkliftRentalPage, requestQuotePage, type PageContent } from "./pages";
import { sitemapPages } from "./sitemap-pages";

// What each page's 1200x630 social share image says: the page's own eyebrow and heading.
export type ShareCard = { eyebrow: string; title: string };

const fromPage = (page: PageContent): ShareCard => ({ eyebrow: page.eyebrow, title: page.h1 });

// Built on first use: pages.ts imports this module, so reading its pages at load time would hit them uninitialised.
let cards: Record<string, ShareCard> | undefined;

export function shareCards(): Record<string, ShareCard> {
  cards ??= {
    home: { eyebrow: "Lifting, Moving, Cleaning & Growing Your Business", title: "Forklift Rental, Sales & Service in Laos" },
    about: { eyebrow: "About DK LAO", title: "Your Forklift and Warehouse Equipment Partner in Laos" },
    ...Object.fromEntries(
      [contactPage, forkliftRentalPage, requestQuotePage, ...Object.values(sitemapPages)].map((page) => [page.id, fromPage(page)]),
    ),
  };
  return cards;
}

export const shareImageSize = { width: 1200, height: 630 };

// Open Graph image entry for a page; falls back to the Home card for an unknown id.
export function shareImage(id: string) {
  const known = id in shareCards();
  const card = shareCards()[known ? id : "home"];

  return { url: `/og/${known ? id : "home"}`, ...shareImageSize, alt: `DK LAO: ${card.title}` };
}
