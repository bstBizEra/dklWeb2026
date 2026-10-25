import { Globe, MapPin, ShieldCheck } from "lucide-react";

import { ClearSavedDetails } from "@/components/app/app-helpers";
import { Group, Row, RowIcon, Screen } from "@/components/app/ios";
import { siteFacts } from "@/lib/data/site-facts";
import { siteFooterMetadata as meta } from "@/lib/site-metadata";

export const metadata = { title: "App info" };


// App info: what a native app shows under Settings > About. It carries the ownership, version and
// developer lines that every DK LAO footer must show, plus what the app keeps on the phone.
export default function AppInfo() {
  return (
    <Screen title="App info" back={{ href: "/app", label: "Home" }}>
      <section className="grid justify-items-center gap-2 pt-2 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- the app's own home-screen icon route, already sized */}
        <img
          src="/app/icon/180"
          alt=""
          width={88}
          height={88}
          className="size-[88px] rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.12)] android:rounded-[28px]"
        />
        <p className="m-0 text-[22px] leading-7 font-bold android:font-normal">DK LAO</p>
        <p className="m-0 text-[15px] text-ios-secondary android:text-[14px] android:text-md-on-surface-variant">
          Version {meta.version} · {meta.releaseDate}
        </p>
      </section>

      <Group header="About">
        <Row title="Version" value={meta.version} />
        <Row title={`${meta.copyrightPrefix} Since ${meta.foundedYear}-${meta.currentYear}`} subtitle="All rights reserved" />
        <Row icon={<RowIcon icon={Globe} color="#0061af" />} title="Website" value="dklao.com" href="/" external />
        {siteFacts.facebook ? (
          <Row title="Facebook" value="DKLAOonline" href={siteFacts.facebook} external />
        ) : null}
      </Group>

      <Group header="Developer">
        <Row title={`${meta.developerLabel.replace(/:$/, "")} ${meta.developerName}`} value={meta.developerDisplayUrl} href={meta.developerUrl} external />
      </Group>

      <Group
        header="Privacy & data"
        footer="Requests you send go to DK LAO to reply to you. On this phone the app keeps only your contact details (after a request is sent) and an unsent draft."
      >
        <Row
          icon={<RowIcon icon={MapPin} color="#34c759" />}
          title="Location"
          subtitle="Read only when you tap a location button, and sent only with that request."
        />
        <Row icon={<RowIcon icon={ShieldCheck} color="#8e8e93" />} title="No account, no tracking" subtitle="The app has no login and no advertising." />
        <ClearSavedDetails />
      </Group>
    </Screen>
  );
}
