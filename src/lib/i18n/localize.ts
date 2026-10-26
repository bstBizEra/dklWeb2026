import type { Locale } from "./index";

// Lao overrides are written as a partial copy of the English data. localize() lays one over the other:
// objects merge by key, arrays by index, and only text replaces text. Keys and indexes the English data
// does not have are ignored, and ids, links, images and other non-text values always stay English.
export type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? DeepPartial<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

// Fields that identify or link, never translated even when they hold a string.
const fixedKeys = new Set(["id", "href", "routeId", "ctaHref", "primaryHref", "secondaryHref", "image", "src", "fact", "kind", "variant", "intent", "icon"]);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype && !("$$typeof" in value);

export function localize<T>(en: T, override: DeepPartial<NoInfer<T>> | undefined): T {
  if (override === undefined || override === null) return en;

  if (typeof en === "string") {
    return (typeof override === "string" && override.trim() ? override : en) as T;
  }

  if (Array.isArray(en)) {
    if (!Array.isArray(override)) return en;
    return en.map((item, index) => localize(item, (override as unknown[])[index] as DeepPartial<typeof item>)) as T;
  }

  if (isPlainObject(en)) {
    if (!isPlainObject(override)) return en;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(en)) {
      result[key] = fixedKeys.has(key) ? value : localize(value, override[key] as DeepPartial<typeof value>);
    }
    return result as T;
  }

  return en;
}

// A locale-aware accessor: English as is, Lao merged once and reused.
export function localized<T>(en: T, lo: DeepPartial<NoInfer<T>>): (locale: Locale) => T {
  let merged: T | undefined;
  return (locale) => (locale === "lo" ? (merged ??= localize(en, lo)) : en);
}
