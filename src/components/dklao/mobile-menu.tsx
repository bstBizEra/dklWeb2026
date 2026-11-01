"use client";

import Link from "@/components/i18n/link";
import { ArrowRight, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { groupMenuLinks, type ResolvedNavItem } from "@/lib/data/navigation";
import type { Messages } from "@/messages";

type MobileMenuLabels = Messages["mobileMenu"] & { requestQuote: string };

// Phone and tablet menu: a side sheet (Radix Dialog), so focus stays inside while it is open, Escape
// closes it, and choosing a link closes it before the page changes.
export function MobileMenu({
  items,
  quoteHref,
  groupTitles,
  labels,
}: {
  items: ResolvedNavItem[];
  quoteHref: string;
  groupTitles: string[];
  labels: MobileMenuLabels;
}) {
  const linkClass =
    "flex min-h-11 items-center rounded-xl px-3 font-extrabold text-white/85 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-orange";

  return (
    <Sheet>
      <SheetTrigger
        className="grid size-11 cursor-pointer place-items-center justify-self-end rounded-xl border border-white/25 bg-white/10 text-white min-[1121px]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-orange"
        aria-label={labels.open}
      >
        <Menu size={24} aria-hidden="true" />
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="m-0 pr-12 text-lg font-[850]">{labels.title}</SheetTitle>
        <SheetDescription className="sr-only">{labels.description}</SheetDescription>
        <nav aria-label={labels.navLabel} className="grid gap-1.5">
          {items.map((item) =>
            item.children ? (
              // Same groups as the desktop mega menu (Equipment, Service & parts).
              groupMenuLinks(item.children, groupTitles).map((group) => (
                <div key={group.title} className="grid gap-1.5">
                  <p className="mt-2.5 mb-0 px-3 text-xs font-[850] tracking-[0.08em] text-white/55 uppercase">{group.title}</p>
                  {group.links.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              ))
            ) : (
              <SheetClose asChild key={item.label}>
                <Link href={item.href ?? "/"} className={linkClass}>
                  {item.label}
                </Link>
              </SheetClose>
            ),
          )}
        </nav>
        <SheetClose asChild>
          <Button asChild variant="primary" className="mt-2">
            <Link href={quoteHref}>
              {labels.requestQuote}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
