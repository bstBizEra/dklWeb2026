import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Building2, Clock, Globe, Info, MapPin } from "lucide-react";

import { InstallHint } from "@/components/app/app-helpers";
import { Group, Row, RowIcon, Screen } from "@/components/app/ios";
import { QuickContacts } from "@/components/app/quick-contacts";
import { libraryImage } from "@/lib/data/library";
import { clientGroups, quickContacts } from "@/lib/data/mobile-app";
import { siteFacts } from "@/lib/data/site-facts";
import { siteFooterMetadata } from "@/lib/site-metadata";

export const metadata = { title: "Home" };


// Home: who DK LAO is, the two main requests, one-tap contacts, and the company basics.
export default function AppHome() {
  return (
    <Screen title="DK LAO" brand>
      <section aria-label="What we do" className="relative overflow-hidden rounded-[18px] bg-ios-navy text-white android:rounded-[28px]">
        <Image
          src={libraryImage("rental")}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 640px"
          priority
          className="object-cover opacity-45"
        />
        <div className="relative grid gap-4 bg-[linear-gradient(180deg,rgba(7,17,31,0.15),rgba(7,17,31,0.92))] p-5 pt-24">
          <div className="grid gap-1.5">
            <p className="m-0 text-[13px] font-semibold tracking-[0.06em] text-white/75 uppercase">Rent · Buy · Service · Parts</p>
            <p className="m-0 text-[28px] leading-[32px] font-bold tracking-[0.2px]">Keep your warehouse moving.</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/app/request"
              className="grid min-h-[50px] place-items-center rounded-[14px] bg-ios-action px-3 text-[17px] font-semibold text-white no-underline active:opacity-80 android:min-h-12 android:rounded-full android:text-[15px] android:font-medium android:tracking-[0.1px]"
            >
              Request a Quote
            </Link>
            <Link
              href="/app/request?type=service"
              className="grid min-h-[50px] place-items-center rounded-[14px] bg-white/18 px-3 text-[17px] font-semibold text-white no-underline backdrop-blur-md active:bg-white/30 android:min-h-12 android:rounded-full android:border android:border-white/60 android:bg-transparent android:text-[15px] android:font-medium android:tracking-[0.1px] android:backdrop-blur-none"
            >
              Book a Service
            </Link>
          </div>
        </div>
        {/* DK LAO brand stripe along the bottom edge, as on the website's navy sections. */}
        <span className="absolute inset-x-0 bottom-0 h-1 bg-[linear-gradient(90deg,#0061af,#d91a21,#e74422)]" aria-hidden="true" />
      </section>

      <section aria-label="Contact DK LAO">
        <QuickContacts contacts={quickContacts()} />
      </section>

      <InstallHint />

      <Group header="About DK LAO">
        <Row icon={<RowIcon icon={BadgeCheck} color="#d91a21" />} title="Since 2010" subtitle="Serving businesses across Laos" />
        {siteFacts.serviceAreas ? (
          <Row icon={<RowIcon icon={MapPin} color="#0061af" />} title="Based in Vientiane" subtitle="Customers served online across Laos" href="/app/location" />
        ) : null}
        {siteFacts.hours ? (
          <Row icon={<RowIcon icon={Clock} color="#34c759" />} title="Open 24/7" subtitle="AI agents and human advisors reply together" />
        ) : null}
        <Row icon={<RowIcon icon={Globe} color="#8e8e93" />} title="Company profile" subtitle="Full story on dklao.com" href="/about" external />
        <Row icon={<RowIcon icon={Info} color="#5856d6" />} title="App info" subtitle={`Version ${siteFooterMetadata.version}, developer, privacy`} href="/app/info" />
      </Group>

      {clientGroups().length > 0 ? (
        <Group header="Trusted by">
          {clientGroups().map((group) => (
            <Row key={group.title} icon={<RowIcon icon={Building2} color="#5856d6" />} title={group.title} subtitle={group.names} />
          ))}
        </Group>
      ) : null}

    </Screen>
  );
}
