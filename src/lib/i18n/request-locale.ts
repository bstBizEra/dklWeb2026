import { cache } from "react";

import { defaultLocale, type Locale } from "./index";

// not-found.tsx receives no params, so the layout and the catch-all page record the URL locale here
// for the request (React cache() is per request on the server).
const store = cache(() => ({ locale: defaultLocale as Locale }));

export const setRequestLocale = (locale: Locale) => {
  store().locale = locale;
};
export const getRequestLocale = (): Locale => store().locale;
