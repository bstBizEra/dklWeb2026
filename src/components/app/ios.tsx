import Link from "next/link";
import { ChevronRight, ExternalLink, type LucideIcon } from "lucide-react";

import { TopBar } from "@/components/app/top-bar";
import { cn } from "@/lib/utils";

// Building blocks for the /app screens. iPhone: large-title screen, inset grouped lists, Settings-style
// coloured squares. Android (`android:` styles): Material 3 large top app bar title, list cards with
// primary-colour subheaders, 56dp list items without chevrons, round leading icons and a press state layer.

export function Screen({
  title,
  subtitle,
  back,
  brand,
  children,
}: {
  title: string;
  subtitle?: string;
  // A screen opened from another one (not a tab) shows a back button to it.
  back?: { href: string; label: string };
  // Home: the primary logo at the top stands in for the large title (kept for screen readers).
  brand?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar title={title} back={back} brand={brand} />
      <main
        id="main-content"
        className="mx-auto w-full max-w-[640px] px-4 pt-[calc(env(safe-area-inset-top)+56px)] pb-[calc(env(safe-area-inset-bottom)+104px)] android:pb-[calc(env(safe-area-inset-bottom)+112px)]"
      >
        <ScreenHeader title={title} subtitle={subtitle} brand={brand} />
        <div className={cn("grid gap-7 android:gap-6", brand && "pt-2")}>{children}</div>
      </main>
    </>
  );
}

function ScreenHeader({ title, subtitle, brand }: { title: string; subtitle?: string; brand?: boolean }) {
  return (
    <header className={cn("px-1 pt-3 pb-4 android:pt-4 android:pb-5", brand && "sr-only")}>
      <h1 className="m-0 text-[34px] leading-[41px] font-bold tracking-[0.37px] android:text-[32px] android:leading-10 android:font-normal android:tracking-normal">
        {title}
      </h1>
      {subtitle ? (
        <p className="m-0 mt-1 text-[15px] leading-5 text-ios-secondary android:mt-2 android:text-[14px] android:tracking-[0.25px] android:text-md-on-surface-variant">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

export function Group({
  header,
  footer,
  children,
  className,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {header ? (
        <h2 className="m-0 mb-1.5 px-4 text-[13px] leading-[18px] font-normal text-ios-secondary uppercase android:mb-2 android:text-[14px] android:leading-5 android:font-medium android:tracking-[0.1px] android:text-md-primary android:normal-case">
          {header}
        </h2>
      ) : null}
      <div className="overflow-hidden rounded-[10px] bg-ios-cell android:rounded-[16px] android:bg-md-surface-low">{children}</div>
      {footer ? (
        <p className="m-0 mt-1.5 px-4 text-[13px] leading-[18px] text-ios-secondary android:mt-2 android:text-[12px] android:leading-4 android:tracking-[0.4px] android:text-md-on-surface-variant">
          {footer}
        </p>
      ) : null}
    </section>
  );
}

// iPhone: 29pt rounded square, like Settings. Android: 40dp circle, like a Material list avatar.
export function RowIcon({ icon: Icon, color }: { icon: LucideIcon; color: string }) {
  return (
    <span
      className="grid size-[29px] shrink-0 place-items-center rounded-[7px] text-white android:size-10 android:rounded-full"
      style={{ background: color }}
    >
      <Icon className="size-[18px] android:size-5" strokeWidth={2.2} aria-hidden="true" />
    </span>
  );
}

type RowProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  external?: boolean;
  tone?: "default" | "tint" | "action";
  // Lets the visitor copy the text (an address, a number); interface text is otherwise not selectable.
  selectable?: boolean;
};

// One list row. With an href it is a link with a chevron (or an outward arrow when it leaves the app).
// iPhone: separator inset to the text, hidden on the last row. Android: no separators or chevrons.
export function Row({ title, subtitle, value, icon, href, external, tone = "default", selectable }: RowProps) {
  const body = (
    <>
      {icon}
      <span className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 border-b-[0.5px] border-ios-separator py-[11px] pr-4 group-last/row:border-b-0 android:min-h-14 android:border-b-0 android:py-2 android:pr-6">
        <span className="grid min-w-0 flex-1 gap-0.5" {...(selectable ? { "data-selectable": "" } : {})}>
          <span
            className={cn(
              "text-[17px] leading-[22px] android:text-[16px] android:leading-6 android:tracking-[0.5px]",
              tone === "tint" && "text-ios-tint android:text-md-primary",
              tone === "action" && "font-semibold text-ios-action",
            )}
          >
            {title}
          </span>
          {subtitle ? (
            <span className="text-[15px] leading-5 text-ios-secondary android:text-[14px] android:tracking-[0.25px] android:text-md-on-surface-variant">
              {subtitle}
            </span>
          ) : null}
        </span>
        {value ? (
          <span className="shrink-0 text-[17px] text-ios-secondary android:text-[14px] android:text-md-on-surface-variant" data-selectable="">
            {value}
          </span>
        ) : null}
        {href ? (
          external ? (
            <ExternalLink className="size-4 shrink-0 text-ios-tertiary android:text-md-on-surface-variant" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-5 shrink-0 text-ios-tertiary android:hidden" strokeWidth={2.5} aria-hidden="true" />
          )
        ) : null}
      </span>
    </>
  );
  const rowClass = "group/row flex items-center gap-3 pl-4 no-underline text-ios-label android:gap-4 android:text-md-on-surface";
  const pressed = "active:bg-ios-fill android:active:bg-md-on-surface/10";

  if (!href) return <div className={rowClass}>{body}</div>;

  return external || /^(tel|mailto|sms):/.test(href) ? (
    <a href={href} className={cn(rowClass, pressed)} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {body}
    </a>
  ) : (
    <Link href={href} className={cn(rowClass, pressed)}>
      {body}
    </Link>
  );
}
