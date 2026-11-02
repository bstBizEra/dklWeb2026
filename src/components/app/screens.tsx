import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Building2, Clock, Globe, Info, Map as MapIcon, Mail, MapPin, MapPinned, Navigation, ShieldCheck, WifiOff } from "lucide-react";

import { ClearSavedDetails, InstallHint } from "@/components/app/app-helpers";
import { Group, Row, RowIcon, Screen } from "@/components/app/ios";
import { ContactRowIcon, QuickContacts } from "@/components/app/quick-contacts";
import { RequestForm } from "@/components/app/request-form";
import { ShareLocation } from "@/components/app/share-location";
import { libraryImage } from "@/lib/data/library";
import { appServiceGroups, clientGroups, mapLinks, quickContacts } from "@/lib/data/mobile-app";
import { contactChannels, siteFacts, siteFactsFor } from "@/lib/data/site-facts";
import type { Locale } from "@/lib/i18n";
import { appHref } from "@/lib/i18n/app-locale";
import { isIntentKey, leadIntents } from "@/lib/leads/intents";
import { siteFooterMetadata as meta } from "@/lib/site-metadata";
import { appMessages, appServiceText, fill } from "@/messages/app-en";

// The app's screens, shared by the English pages (/app/...) and the Lao pages (/app/lo/...). Each page
// file only picks the locale; links, text and facts follow it here.

type Props = { locale: Locale };

// The one-tap contacts with their labels in this language (numbers and links stay).
const contactsFor = (locale: Locale) => {
  const labels = appMessages(locale).contacts;
  return quickContacts().map((contact) => ({ ...contact, label: labels[contact.id as keyof typeof labels] ?? contact.label }));
};

// Home: who DK LAO is, the two main requests, one-tap contacts, and the company basics.
export function HomeScreen({ locale }: Props) {
  const t = appMessages(locale).home;
  const href = (path: string) => appHref(path, locale);
  const clients = clientGroups();

  return (
    <Screen title="DK LAO" brand>
      <section aria-label={t.heroLabel} className="relative overflow-hidden rounded-[18px] bg-ios-navy text-white android:rounded-[28px]">
        <Image src={libraryImage("rental")} alt="" fill sizes="(max-width: 640px) 100vw, 640px" priority className="object-cover opacity-45" />
        <div className="relative grid gap-4 bg-[linear-gradient(180deg,rgba(7,17,31,0.15),rgba(7,17,31,0.92))] p-5 pt-24">
          <div className="grid gap-1.5">
            <p className="m-0 text-[13px] font-semibold tracking-[0.06em] text-white/75 uppercase">{t.eyebrow}</p>
            <p className="m-0 text-[28px] leading-[32px] font-bold tracking-[0.2px]">{t.headline}</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href={href("/app/request")}
              className="grid min-h-[50px] place-items-center rounded-[14px] bg-ios-action px-3 text-[17px] font-semibold text-white no-underline active:opacity-80 android:min-h-12 android:rounded-full android:text-[15px] android:font-medium android:tracking-[0.1px]"
            >
              {t.quote}
            </Link>
            <Link
              href={href("/app/request?type=service")}
              className="grid min-h-[50px] place-items-center rounded-[14px] bg-white/18 px-3 text-[17px] font-semibold text-white no-underline backdrop-blur-md active:bg-white/30 android:min-h-12 android:rounded-full android:border android:border-white/60 android:bg-transparent android:text-[15px] android:font-medium android:tracking-[0.1px] android:backdrop-blur-none"
            >
              {t.service}
            </Link>
          </div>
        </div>
        {/* DK LAO brand stripe along the bottom edge, as on the website's navy sections. */}
        <span className="absolute inset-x-0 bottom-0 h-1 bg-[linear-gradient(90deg,#0061af,#d91a21,#e74422)]" aria-hidden="true" />
      </section>

      <section aria-label={t.contactLabel}>
        <QuickContacts contacts={contactsFor(locale)} />
      </section>

      <InstallHint />

      <Group header={t.about}>
        <Row icon={<RowIcon icon={BadgeCheck} color="#d91a21" />} title={t.since} subtitle={t.sinceDetail} />
        {siteFacts.serviceAreas ? (
          <Row icon={<RowIcon icon={MapPin} color="#0061af" />} title={t.based} subtitle={t.basedDetail} href={href("/app/location")} />
        ) : null}
        {siteFacts.hours ? <Row icon={<RowIcon icon={Clock} color="#34c759" />} title={t.open} subtitle={t.openDetail} /> : null}
        <Row icon={<RowIcon icon={Globe} color="#8e8e93" />} title={t.profile} subtitle={t.profileDetail} href={href("/about")} external />
        <Row icon={<RowIcon icon={Info} color="#5856d6" />} title={t.info} subtitle={fill(t.infoDetail, { version: meta.version })} href={href("/app/info")} />
      </Group>

      {clients.length > 0 ? (
        <Group header={t.trusted}>
          {clients.map((group) => (
            <Row key={group.title} icon={<RowIcon icon={Building2} color="#5856d6" />} title={t.clientGroups[group.title] ?? group.title} subtitle={group.names} />
          ))}
        </Group>
      ) : null}
    </Screen>
  );
}

// App info: what a native app shows under Settings > About. It carries the ownership, version and
// developer lines that every DK LAO footer must show, plus what the app keeps on the phone.
export function InfoScreen({ locale }: Props) {
  const t = appMessages(locale).info;

  return (
    <Screen title={t.title} back={{ href: appHref("/app", locale), label: appMessages(locale).home.title }}>
      <section className="grid justify-items-center gap-2 pt-2 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- the app's own home-screen icon route, already sized */}
        <img src="/app/icon/180" alt="" width={88} height={88} className="size-[88px] rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.12)] android:rounded-[28px]" />
        <p className="m-0 text-[22px] leading-7 font-bold android:font-normal">DK LAO</p>
        <p className="m-0 text-[15px] text-ios-secondary android:text-[14px] android:text-md-on-surface-variant">
          {t.version} {meta.version} · {meta.releaseDate}
        </p>
      </section>

      <Group header={t.about}>
        <Row title={t.version} value={meta.version} />
        <Row title={fill(t.copyright, { from: meta.foundedYear, to: meta.currentYear })} subtitle={t.rights} />
        <Row icon={<RowIcon icon={Globe} color="#0061af" />} title={t.website} value="dklao.com" href={appHref("/", locale)} external />
        {siteFacts.facebook ? <Row title="Facebook" value="DKLAOonline" href={siteFacts.facebook} external /> : null}
      </Group>

      <Group header={t.developerHeader}>
        <Row title={`${t.developer} ${meta.developerName}`} value={meta.developerDisplayUrl} href={meta.developerUrl} external />
      </Group>

      <Group header={t.privacy} footer={t.privacyFooter}>
        <Row icon={<RowIcon icon={MapPin} color="#34c759" />} title={t.location} subtitle={t.locationDetail} />
        <Row icon={<RowIcon icon={ShieldCheck} color="#8e8e93" />} title={t.noTracking} subtitle={t.noTrackingDetail} />
        <ClearSavedDetails />
      </Group>
    </Screen>
  );
}

// Where DK LAO is, how to get there, every way to reach the team, and sending the customer's site pin.
export function LocationScreen({ locale }: Props) {
  const messages = appMessages(locale);
  const t = messages.location;
  // Maps search the English address; the address shown follows the language.
  const maps = mapLinks();
  const facts = siteFactsFor(locale);
  const contacts = contactsFor(locale);
  const emails = contactChannels().filter((channel) => channel.label === "Email");
  const serviceWhatsapp = contacts.find((contact) => contact.id === "whatsapp-service")?.href;

  return (
    <Screen title={t.title} subtitle={t.subtitle}>
      {facts.address && maps ? (
        <Group header={t.office} footer={t.officeFooter}>
          <Row icon={<RowIcon icon={MapPinned} color="#d91a21" />} title={facts.address} selectable />
          <Row icon={<RowIcon icon={Navigation} color="#0061af" />} title={t.apple} href={maps.appleDirections} external tone="tint" />
          <Row icon={<RowIcon icon={MapIcon} color="#34c759" />} title={t.google} href={maps.google} external tone="tint" />
        </Group>
      ) : null}

      <ShareLocation whatsappHref={serviceWhatsapp} />

      <Group header={t.contact}>
        {contacts.map((contact) => (
          <Row
            key={contact.id}
            icon={<ContactRowIcon id={contact.id} />}
            title={contact.label}
            value={contact.detail}
            href={contact.href}
            external={contact.href.startsWith("http")}
          />
        ))}
        {emails.map((email) => (
          <Row key={email.href} icon={<RowIcon icon={Mail} color="#8e8e93" />} title={messages.contacts.email} value={email.text} href={email.href} />
        ))}
      </Group>

      {facts.hours ? (
        <Group header={t.hours}>
          <Row icon={<RowIcon icon={Clock} color="#ff9500" />} title={t.open} subtitle={facts.hours} />
        </Group>
      ) : null}
    </Screen>
  );
}

// Shown by the service worker when the phone has no connection and the page was never opened before.
// Phone calls still work without data, so the numbers are here.
export function OfflineScreen({ locale }: Props) {
  const t = appMessages(locale).offline;
  const call = quickContacts().find((contact) => contact.id === "call");

  return (
    <Screen title={t.title} subtitle={t.subtitle}>
      <section className="grid justify-items-center gap-2 rounded-[14px] bg-ios-cell px-5 py-7 text-center">
        <WifiOff className="size-10 text-ios-secondary" aria-hidden="true" />
        <p className="m-0 text-[15px] leading-5 text-ios-secondary">{t.body}</p>
      </section>
      {call ? (
        <Group header={t.help} footer={t.helpFooter}>
          <Row title={t.call} value={call.detail} href={call.href} tone="tint" />
        </Group>
      ) : null}
    </Screen>
  );
}

export type RequestSearchParams = Promise<{ type?: string; category?: string }>;

// ?type=service opens the service booking; ?category=<intent> preselects the quote category.
export async function RequestScreen({ locale, searchParams }: Props & { searchParams: RequestSearchParams }) {
  const t = appMessages(locale).request;
  const { type, category } = await searchParams;
  const mode = type === "service" ? "service" : "quote";
  const initialCategory = leadIntents[isIntentKey(category) && category !== "service" ? category : "rental"].category;

  return (
    <Screen title={t.title} subtitle={t.subtitle}>
      <RequestForm key={`${mode}-${initialCategory}`} initialMode={mode} initialCategory={initialCategory} />
    </Screen>
  );
}

// Equipment blue, service and parts red: the same split as the website's Solutions menu.
const groupColors = ["#0061af", "#d91a21"];

// Every DK LAO service, grouped the way buyers look for it. A tap opens the request with that service chosen.
export function ServicesScreen({ locale }: Props) {
  const t = appMessages(locale).services;
  // Maintenance opens the service booking; everything else opens the quote form with its category chosen.
  const requestHref = (intent: string | undefined) =>
    appHref(intent === "service" ? "/app/request?type=service" : `/app/request${intent ? `?category=${intent}` : ""}`, locale);

  return (
    <Screen title={t.title} subtitle={t.subtitle}>
      {appServiceGroups().map((group) => {
        // Groups come with their English title; an empty group is left out, so match by title, not position.
        const index = appMessages("en").services.groups.indexOf(group.title);
        return (
        <Group key={group.title} header={t.groups[index] ?? group.title}>
          {group.links.map((link) => {
            const text = appServiceText(locale, link.href);
            return (
              <Row
                key={link.href}
                icon={<RowIcon icon={link.icon} color={groupColors[index] ?? "#8e8e93"} />}
                title={text?.label ?? link.label}
                subtitle={text?.description ?? link.description}
                href={requestHref(link.intent)}
              />
            );
          })}
        </Group>
        );
      })}

      <Group footer={t.footer}>
        <Row title={t.website} href={appHref("/", locale)} external tone="tint" />
      </Group>
    </Screen>
  );
}
