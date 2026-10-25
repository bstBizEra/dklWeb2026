"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Eyebrow, IconBadge } from "@/components/ui/section";
import { groupMenuLinks, solutionsPromo, type MenuGroup, type MenuLink, type MenuPromo, type ResolvedNavItem } from "@/lib/data/navigation";
import { cn } from "@/lib/utils";

// Desktop main menu. Radix (through ui/navigation-menu) handles opening, Escape, arrow keys and focus;
// everything visible here is DK LAO. The panel keeps the shadcn/studio navigation-menu-06 layout:
// link groups on the left, a quote card on the right.

// White header text with an orange underline that grows on hover, focus and while a panel is open.
const topLinkClass =
  "block h-auto min-h-6 rounded-none bg-transparent bg-[linear-gradient(var(--dk-color-action-orange),var(--dk-color-action-orange))] bg-no-repeat bg-[position:0_100%] bg-[length:0_2px] p-0 pb-1 text-[15px] font-[750] text-white/80 transition-[background-size,color] duration-[260ms] ease-premium hover:bg-transparent hover:bg-[length:100%_2px] hover:text-white focus:bg-transparent focus:text-white focus-visible:bg-[length:100%_2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action-orange motion-reduce:transition-none";

// The same navy grid as the feature service card and the closing call to action.
const navyGrid =
  "bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),radial-gradient(120%_90%_at_100%_0%,rgba(0,97,175,0.55),transparent_60%),linear-gradient(160deg,var(--dk-color-navy-900),var(--dk-color-navy-950))] bg-[length:28px_28px,28px_28px,auto,auto]";

function MegaMenuLink({ link }: { link: MenuLink }) {
  const Icon = link.icon;

  return (
    <NavigationMenuLink
      asChild
      className="group/link flex-row items-start gap-3 rounded-xl p-2.5 text-navy-950 hover:bg-surface hover:text-navy-950 focus:bg-surface focus:text-navy-950"
    >
      <Link href={link.href}>
        <IconBadge className="size-10 shrink-0 rounded-xl transition-colors duration-[260ms] ease-premium group-hover/link:bg-brand-blue group-hover/link:text-white motion-reduce:transition-none">
          <Icon className="size-5 text-current" aria-hidden="true" />
        </IconBadge>
        <span className="grid gap-0.5">
          <span className="inline-flex items-center gap-1.5 text-[15px] leading-tight font-[750]">
            {link.label}
            <ArrowRight
              className="size-3.5 -translate-x-1 text-action-red opacity-0 transition-[opacity,transform] duration-[260ms] ease-premium group-hover/link:translate-x-0 group-hover/link:opacity-100 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </span>
          {link.description ? <span className="text-[13px] leading-snug text-slate-700">{link.description}</span> : null}
        </span>
      </Link>
    </NavigationMenuLink>
  );
}

function MegaMenuPromo({ promo }: { promo: MenuPromo }) {
  return (
    <div className={cn("grid content-start gap-3 rounded-2xl p-3 text-white", navyGrid)}>
      <Image
        src={promo.image}
        alt={promo.imageAlt}
        width={480}
        height={270}
        sizes="280px"
        className="aspect-video w-full rounded-xl object-cover"
      />
      <div className="grid gap-1.5 px-1">
        <p className="m-0 text-[15px] font-[850]">{promo.title}</p>
        <p className="m-0 text-[13px] leading-snug text-white/75">{promo.copy}</p>
      </div>
      <NavigationMenuLink
        asChild
        className={cn(buttonVariants({ variant: "primary" }), "w-full flex-row justify-between hover:bg-transparent hover:text-white focus:text-white")}
      >
        <Link href={promo.ctaHref}>
          {promo.ctaLabel}
          <ArrowRight className="size-[18px] text-current" aria-hidden="true" />
        </Link>
      </NavigationMenuLink>
    </div>
  );
}

// One header item that opens a panel of grouped links, with an optional promo card on the right.
export function MegaMenu({ label, groups, promo }: { label: string; groups: MenuGroup[]; promo?: MenuPromo }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn(
          topLinkClass,
          // topLinkClass is display:block for plain links; the trigger must stay a row so the arrow sits right of the label.
          "inline-flex w-auto items-center focus-visible:ring-0 data-[state=open]:bg-transparent data-[state=open]:bg-[length:100%_2px] data-[state=open]:text-white data-[state=open]:hover:bg-transparent data-[state=open]:focus:bg-transparent [&>svg]:size-4",
        )}
      >
        {label}
      </NavigationMenuTrigger>
      <NavigationMenuContent
        className={cn(
          "w-[min(760px,calc(100vw_-_48px))] p-3 pt-4 md:w-[min(760px,calc(100vw_-_48px))]",
          "group-data-[viewport=false]/navigation-menu:mt-[25px] group-data-[viewport=false]/navigation-menu:rounded-card group-data-[viewport=false]/navigation-menu:border-slate-300/60 group-data-[viewport=false]/navigation-menu:bg-white group-data-[viewport=false]/navigation-menu:shadow-card",
          // Brand stripe along the top edge, as on the navy page sections.
          "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-[linear-gradient(90deg,var(--dk-color-brand-blue),var(--dk-color-action-red),var(--dk-color-action-orange))]",
        )}
      >
        <div className={cn("grid gap-5", promo && "grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]")}>
          <div className="grid grid-cols-2 gap-4">
            {groups.map((group) => (
              <div key={group.title}>
                <Eyebrow className="mb-2 px-2.5 text-xs tracking-[0.12em]">{group.title}</Eyebrow>
                <ul className="m-0 grid list-none gap-1 p-0">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <MegaMenuLink link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {promo ? <MegaMenuPromo promo={promo} /> : null}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

// The desktop header menu: an item with children opens a mega menu, the rest are plain links.
export function MainNavigation({ items, className }: { items: ResolvedNavItem[]; className?: string }) {
  return (
    <NavigationMenu viewport={false} aria-label="Main menu" className={cn("max-w-none", className)}>
      <NavigationMenuList className="gap-[22px]">
        {items.map((item) =>
          item.children ? (
            <MegaMenu key={item.label} label={item.label} groups={groupMenuLinks(item.children)} promo={solutionsPromo} />
          ) : (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink asChild className={topLinkClass}>
                <Link href={item.href ?? "/"}>{item.label}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
