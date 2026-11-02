import Image from "next/image";
import Link from "@/components/i18n/link";
import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { siFacebook, siWhatsapp, siX, siYoutube, type SimpleIcon } from "simple-icons";

import { Container } from "@/components/ui/section";
import { quoteHref } from "@/lib/data/routes";
import { getSiteFacts } from "@/lib/cms/site-facts";
import { footerGroups, orderFooterChannels } from "@/lib/data/footer";
import { contactChannels, type ContactChannel } from "@/lib/data/site-facts";
import { siteFooterMetadata } from "@/lib/site-metadata";
import { getMessages } from "@/messages";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { FooterMotion } from "./footer-motion";

// Two layers. The contact layer is lighter and friendlier: short chips (icon plus number) and the official
// brand marks for WhatsApp, Facebook, YouTube and X. The links layer below is darker and quiet. Brand marks
// come from the simple-icons package (official glyphs, never hand-drawn); Lucide covers the generic ones.
// The industrial-footer__* class names are kept as hooks for the scroll motion (footer-motion.tsx).
const brandIcons: Record<string, SimpleIcon> = { Facebook: siFacebook, YouTube: siYoutube, X: siX };
const socialLabels = new Set(Object.keys(brandIcons));

function BrandMark({ icon, size = 20 }: { icon: SimpleIcon; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={icon.path} />
    </svg>
  );
}

// "WhatsApp Sales" becomes "Sales" next to the WhatsApp mark; email and phone keep only their value.
const chipLabel = (channel: ContactChannel) => channel.label.replace(/^WhatsApp\s*/, "") || "WhatsApp";

function chipIcon(channel: ContactChannel) {
  if (channel.label.startsWith("WhatsApp")) return <BrandMark icon={siWhatsapp} />;
  const Icon: LucideIcon = channel.label === "Email" ? Mail : Phone;

  return <Icon size={20} aria-hidden="true" />;
}

const pressable = "transition-[transform,background-color,border-color] duration-150 ease-premium active:scale-[0.98] motion-reduce:transition-none";
// The contact chips slide in with GSAP, so CSS must not also transition their transform: the two would fight.
const pressableChip = "transition-[background-color,border-color] duration-150 ease-premium active:scale-[0.98] motion-reduce:transition-none";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-orange";

export async function IndustrialFooter({ locale }: { locale: Locale }) {
  const facts = await getSiteFacts(locale);
  const channels = contactChannels(facts);
  const chips = orderFooterChannels(channels.filter((channel) => !socialLabels.has(channel.label)));
  const social = channels.filter((channel) => socialLabels.has(channel.label));
  const groups = footerGroups(locale);
  const t = getMessages(locale).footer;

  return (
    <FooterMotion>
      <div
        className="industrial-footer__rule h-[3px] bg-[linear-gradient(90deg,var(--dk-color-brand-blue)_0_70%,var(--dk-color-action-red)_70%_100%)]"
        aria-hidden="true"
      />
      <section
        className="industrial-footer__contact bg-[linear-gradient(135deg,var(--dk-color-brand-blue-deep),var(--dk-color-navy-800))] py-10 max-[640px]:py-8"
        aria-labelledby="footer-contact-title"
      >
        <Container className="industrial-footer__contact-grid grid grid-cols-[minmax(0,1fr)_340px] items-start gap-x-10 max-[900px]:grid-cols-1">
          <div className="contents">
            <div className="industrial-footer__lead col-span-full flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b border-white/20 pb-6">
              <h2 id="footer-contact-title" className="m-0 text-[clamp(1.5rem,3vw,2rem)] font-[850] tracking-[-0.01em] text-white">
                {t.talkToUs}
              </h2>
              <nav
                aria-label={t.leadActions}
                className="industrial-footer__actions flex flex-wrap items-center gap-5 font-bold max-[640px]:gap-x-6 max-[640px]:gap-y-3"
              >
                <Link href={quoteHref("warehouse")} className={cn("inline-flex min-h-10 items-center text-white/85 hover:text-white", pressable, focusRing)}>
                  {t.siteSurvey}
                </Link>
                <Link href="/contact" className={cn("inline-flex min-h-10 items-center text-white/85 hover:text-white", pressable, focusRing)}>
                  {t.advisor}
                </Link>
                <Link
                  href={quoteHref()}
                  className={cn(
                    "industrial-footer__cta inline-flex min-h-11 items-center rounded-button bg-action-red px-6 font-extrabold text-white max-[640px]:order-first max-[640px]:w-full max-[640px]:justify-center",
                    pressable,
                    focusRing,
                  )}
                >
                  {t.requestQuote}
                </Link>
              </nav>
            </div>
            {chips.length > 0 ? (
              <nav
                aria-label={t.channels}
                className="industrial-footer__chips col-start-1 row-start-2 mt-6 grid grid-cols-[repeat(2,minmax(0,320px))] gap-x-4 gap-y-3 max-[640px]:flex max-[640px]:flex-wrap max-[640px]:gap-3"
              >
                {chips.map((channel) => {
                  const email = channel.href.startsWith("mailto:");

                  return (
                    <a
                      key={channel.href}
                      href={channel.href}
                      {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={cn(
                        "inline-flex min-h-[52px] items-center gap-3 rounded-full border border-white/20 bg-white/10 py-2 pr-5 pl-4 leading-[1.2] font-extrabold text-white hover:border-white hover:bg-white/15 [&_svg]:shrink-0",
                        "max-[640px]:min-w-0 max-[640px]:flex-[1_1_calc(50%_-_12px)] max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-2 max-[640px]:rounded-md max-[640px]:p-3 max-[640px]:text-[0.85rem] max-[640px]:[overflow-wrap:anywhere]",
                        email && "max-[640px]:order-1 max-[640px]:basis-full max-[640px]:flex-row max-[640px]:items-center max-[640px]:gap-3",
                        pressableChip,
                        focusRing,
                      )}
                    >
                      {chipIcon(channel)}
                      <span>
                        {channel.label === "Email" || channel.label === "Phone" ? null : (
                          <small className="block text-[0.72rem] font-bold text-white/75">{chipLabel(channel)}</small>
                        )}
                        {channel.text}
                      </span>
                    </a>
                  );
                })}
              </nav>
            ) : null}
            {facts.address || social.length > 0 ? (
              <div className="industrial-footer__find col-span-full row-start-3 mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 max-[900px]:row-auto">
                {facts.address ? (
                  <p className="m-0 flex items-center gap-2 text-[0.86rem] leading-normal whitespace-nowrap text-white/85 max-[900px]:whitespace-normal [&_svg]:shrink-0">
                    <MapPin size={20} aria-hidden="true" />
                    {facts.address}
                  </p>
                ) : null}
                {social.length > 0 ? (
                  <nav aria-label={t.social} className="industrial-footer__social flex gap-3">
                    {social.map((channel) => (
                      <a
                        key={channel.href}
                        href={channel.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={channel.label}
                        className={cn(
                          "inline-grid size-11 place-items-center rounded-full bg-white text-navy-900 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
                          pressable,
                          focusRing,
                        )}
                      >
                        <BrandMark icon={brandIcons[channel.label]} />
                      </a>
                    ))}
                  </nav>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="industrial-footer__photo col-start-2 row-start-2 -mt-6 self-end max-[900px]:hidden" aria-hidden="true">
            {/* Transparent product image from the old landing page folder (Toyota 8-series, supplied by the owner). */}
            <Image
              src="/images/hero/toyota-35-50-forklift-cutout.webp"
              alt=""
              width={698}
              height={483}
              sizes="(max-width: 900px) 0px, 340px"
              className="block h-auto w-full drop-shadow-[0_14px_18px_rgba(7,17,31,0.45)]"
            />
          </div>
        </Container>
      </section>
      <Container className="industrial-footer__links grid grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))] gap-8 py-12 max-[1100px]:grid-cols-2 max-[640px]:py-8">
        <div className="industrial-footer__brand max-[1100px]:col-span-full">
          <Image src="/images/logo/Logo-H_Text.svg" width={295} height={63} alt="DK LAO" className="h-auto w-[170px]" />
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="mt-0 mb-4 text-[0.72rem] font-[850] tracking-[0.14em] text-white/60 uppercase">{group.title}</h2>
            <nav aria-label={`${t.groupPrefix} ${group.title}`} className="grid gap-1 font-semibold text-white/80 max-[760px]:gap-0">
              {group.links.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn("max-[760px]:inline-flex max-[760px]:min-h-10 max-[760px]:items-center hover:text-white hover:underline hover:underline-offset-4", focusRing)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </Container>
      <Container className="industrial-footer__meta flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/15 pt-5 pr-[76px] pb-6 text-[0.85rem] font-[760] text-white/70 max-[780px]:grid max-[780px]:justify-items-start max-[760px]:gap-y-0">
        <p className="industrial-footer__copyright m-0 leading-[1.4]">
          {t.copyrightPrefix} {t.since}{" "}
          {siteFooterMetadata.foundedYear}-{siteFooterMetadata.currentYear}, v
          {siteFooterMetadata.version}
        </p>
        <p className="industrial-footer__credit m-0 text-right text-[0.78rem] leading-[1.4] max-[780px]:text-left">
          {t.developedBy}{" "}
          <a
            href={siteFooterMetadata.developerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("text-white/85 hover:text-white max-[760px]:inline-flex max-[760px]:min-h-10 max-[760px]:items-center", focusRing)}
          >
            {`${siteFooterMetadata.developerName} (${siteFooterMetadata.developerDisplayUrl})`}
          </a>
        </p>
      </Container>
    </FooterMotion>
  );
}
