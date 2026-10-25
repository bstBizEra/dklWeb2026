import { WifiOff } from "lucide-react";

import { Group, Row, Screen } from "@/components/app/ios";
import { quickContacts } from "@/lib/data/mobile-app";

export const metadata = { title: "Offline" };

// Shown by the service worker when the phone has no connection and the page was never opened before.
// Phone calls still work without data, so the numbers are here.
export default function AppOffline() {
  const call = quickContacts().find((contact) => contact.id === "call");

  return (
    <Screen title="Offline" subtitle="This page needs a connection.">
      <section className="grid justify-items-center gap-2 rounded-[14px] bg-ios-cell px-5 py-7 text-center">
        <WifiOff className="size-10 text-ios-secondary" aria-hidden="true" />
        <p className="m-0 text-[15px] leading-5 text-ios-secondary">
          Check your mobile data or Wi-Fi. Any request you started is saved on this phone; send it when you are back online.
        </p>
      </section>
      {call ? (
        <Group header="Need help now?" footer="Calls work without mobile data.">
          <Row title="Call DK LAO" value={call.detail} href={call.href} tone="tint" />
        </Group>
      ) : null}
    </Screen>
  );
}
