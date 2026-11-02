"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, LayoutGrid, MapPin, SquarePen, type LucideIcon } from "lucide-react";

import { appHref, appLocaleOf } from "@/lib/i18n/app-locale";
import { cn } from "@/lib/utils";
import { appMessages } from "@/messages/app-en";

const tabs: { href: string; key: "home" | "services" | "request" | "location"; icon: LucideIcon }[] = [
  { href: "/app", key: "home", icon: House },
  { href: "/app/services", key: "services", icon: LayoutGrid },
  { href: "/app/request", key: "request", icon: SquarePen },
  { href: "/app/location", key: "location", icon: MapPin },
];
const fromHomeKey = "dklao-app-tab-from-home";

function remember(value: boolean) {
  try {
    if (value) sessionStorage.setItem(fromHomeKey, "1");
    else sessionStorage.removeItem(fromHomeKey);
  } catch {
    // No storage: tab changes still work, Back just follows plain browser history.
  }
}

function cameFromHome(): boolean {
  try {
    return sessionStorage.getItem(fromHomeKey) === "1";
  } catch {
    return false;
  }
}

// Bottom navigation. iPhone: translucent iOS tab bar, current tab in DK LAO blue. Android: Material 3
// navigation bar with the pill indicator behind the current icon.
// Back behaves like a native app: tabs do not pile up history, so Back from any tab returns to Home and
// Back from Home leaves the app (Android's "pop up to the start destination").
export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = appLocaleOf(pathname);
  const t = appMessages(locale).tabs;
  const home = appHref("/app", locale);
  const isActive = (href: string) => (href === home ? pathname === home : pathname.startsWith(href));

  const go = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    const onHome = pathname === home;

    if (isActive(href) && pathname === href) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (onHome) {
      remember(true); // Home -> tab: a normal step, so Back returns Home.
    } else if (href === home) {
      event.preventDefault();
      if (cameFromHome()) router.back();
      else router.replace(home);
      remember(false);
    } else {
      event.preventDefault();
      router.replace(href); // Tab -> tab: swap in place.
    }
  };

  return (
    <nav
      aria-label={t.label}
      className="fixed inset-x-0 bottom-0 z-40 border-t-[0.5px] border-ios-separator bg-ios-bar pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-[1.8] android:border-t-0 android:bg-md-surface-container android:backdrop-blur-none"
    >
      <ul className="mx-auto m-0 grid max-w-[640px] list-none grid-cols-4 p-0 android:min-h-20">
        {tabs.map(({ href: path, key, icon: Icon }) => {
          const href = appHref(path, locale);
          const active = isActive(href);

          return (
            <li key={href} className="android:flex">
              <Link
                href={href}
                onClick={(event) => go(event, href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group/tab flex min-h-[49px] flex-col items-center justify-center gap-0.5 pt-1.5 text-[10px] leading-3 font-medium tracking-[0.1px] no-underline",
                  "android:w-full android:gap-1 android:pt-3 android:pb-4 android:text-[12px] android:leading-4 android:tracking-[0.5px]",
                  active
                    ? "text-ios-tint android:font-bold android:text-md-on-surface"
                    : "text-ios-secondary android:text-md-on-surface-variant",
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center android:h-8 android:w-16 android:rounded-full android:transition-colors android:duration-200",
                    active ? "android:bg-md-secondary-container android:text-md-on-secondary-container" : "android:group-active/tab:bg-md-on-surface/10",
                  )}
                >
                  <Icon className="size-[25px] android:size-6" strokeWidth={active ? 2.3 : 1.8} aria-hidden="true" />
                </span>
                {t[key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
