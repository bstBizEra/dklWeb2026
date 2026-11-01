"use client";

import { usePathname } from "next/navigation";

import { Flag } from "@/components/i18n/flag";
import { alternatePath, localeOf, locales, type Locale } from "@/lib/i18n";
import type { Messages } from "@/messages";
import { cn } from "@/lib/utils";

// 🇬🇧 EN / 🇱🇦 ລາວ switch. Plain links to the same page in the other language, so it works without JavaScript
// and every language has its own cacheable URL. The current language is marked with aria-pressed.
export function LanguageToggle({ labels, className }: { labels: Messages["language"]; className?: string }) {
  const pathname = usePathname() ?? "/";
  const current: Locale = localeOf(pathname);

  return (
    <nav aria-label={labels.label} className={cn("inline-flex items-center rounded-button border border-white/25 bg-white/10 p-0.5", className)}>
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <a
            key={locale}
            href={alternatePath(pathname, locale)}
            hrefLang={locale}
            lang={locale}
            role="button"
            aria-pressed={active}
            title={locale === "lo" ? labels.loName : labels.enName}
            className={cn(
              "inline-flex min-h-9 min-w-10 items-center justify-center gap-1.5 rounded-md px-2.5 text-[14px] font-[800] text-white/80 transition-colors duration-150 ease-premium hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-orange",
              active && "bg-white text-navy-950 hover:text-navy-950",
            )}
          >
            <Flag locale={locale} />
            {locale === "lo" ? labels.lo : labels.en}
          </a>
        );
      })}
    </nav>
  );
}
