import { localizeHref, type Locale } from "./index";

// The phone app's language comes from the URL only, like the website (the host's nginx cache keys on the
// URL): /app/... is English, /app/lo/... is Lao. Lao stays under /app so it shares the service worker
// scope, the manifest scope and the proxy exclusion of the English app.
const laoApp = /^\/app\/lo(\/|$|\?|#)/;
const appPath = /^\/app(\/|$|\?|#)/;

export const appLocaleOf = (pathname: string): Locale => (laoApp.test(pathname) ? "lo" : "en");

// An app link in this locale: /app/request -> /app/lo/request. Website links go to that locale's site page
// (/about -> /lo/about); external links, tel: and mailto: stay as they are.
export function appHref(href: string, locale: Locale): string {
  if (locale === "en" || laoApp.test(href)) return href;
  if (appPath.test(href)) return `/app/lo${href.slice(4)}`;
  return localizeHref(href, locale);
}

// The same app screen in another language, for the EN / ລາວ switch.
export function appAlternatePath(pathname: string, target: Locale): string {
  const english = laoApp.test(pathname) ? `/app${pathname.slice(7)}` : pathname;
  return appHref(english, target);
}
