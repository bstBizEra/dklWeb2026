// Interface wording shared by every page (header, menus, footer, 404, language toggle). Page content lives
// in src/lib/data and its Lao overrides in src/messages/lo/. lo.ts must carry every key below: the type checks it.
export const en = {
  skipToContent: "Skip to main content",
  header: {
    navLabel: "DK LAO primary navigation",
    homeLabel: "DK LAO home",
    requestQuote: "Request a Quote",
    mainMenu: "Main menu",
  },
  mobileMenu: {
    open: "Open navigation menu",
    title: "Menu",
    description: "Pages on the DK LAO website",
    navLabel: "Mobile menu",
  },
  language: {
    label: "Language",
    en: "EN",
    lo: "ລາວ",
    enName: "English",
    loName: "Lao",
  },
  notFound: {
    metaTitle: "Page not found",
    metaDescription:
      "The page you are looking for is not available yet. Explore DK LAO forklift rental, sales, spare parts, maintenance, and cleaning equipment workflows.",
    eyebrow: "Error 404",
    title: "This page is not available",
    copy: "The page may have moved or is not published yet. You can return to the homepage or send a request and a DK LAO advisor will route it to the right workflow.",
    home: "Back to Home",
    quote: "Request a Quote",
    popular: "Popular destinations",
  },
};

export type Messages = typeof en;
