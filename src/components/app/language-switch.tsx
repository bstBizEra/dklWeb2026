"use client";

import { usePathname } from "next/navigation";

import { appAlternatePath, appLocaleOf } from "@/lib/i18n/app-locale";
import { locales } from "@/lib/i18n";
import { appMessages } from "@/messages/app-en";
import { cn } from "@/lib/utils";

// EN / ລາວ in the app's top bar. Plain links to the same screen in the other language (/app <-> /app/lo),
// like the website's toggle: no JavaScript needed, and each language has its own cacheable URL.
export function LanguageSwitch() {
  const pathname = usePathname() ?? "/app";
  const current = appLocaleOf(pathname);
  const t = appMessages(current).language;

  return (
    <nav aria-label={t.label} className="inline-flex items-center rounded-full bg-ios-fill p-0.5 android:bg-md-surface-container">
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <a
            key={locale}
            href={appAlternatePath(pathname, locale)}
            hrefLang={locale}
            lang={locale}
            role="button"
            aria-pressed={active}
            title={locale === "lo" ? t.loName : t.enName}
            className={cn(
              "inline-flex min-h-8 min-w-10 items-center justify-center rounded-full px-2.5 text-[13px] font-semibold text-ios-secondary no-underline",
              active && "bg-ios-cell text-ios-label shadow-[0_1px_3px_rgba(0,0,0,0.12)] android:bg-md-secondary-container android:text-md-on-secondary-container android:shadow-none",
            )}
          >
            {locale === "lo" ? t.lo : t.en}
          </a>
        );
      })}
    </nav>
  );
}
