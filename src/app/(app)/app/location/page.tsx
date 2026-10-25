import { Clock, Mail, Map as MapIcon, MapPinned, Navigation } from "lucide-react";

import { Group, Row, RowIcon, Screen } from "@/components/app/ios";
import { ContactRowIcon } from "@/components/app/quick-contacts";
import { ShareLocation } from "@/components/app/share-location";
import { mapLinks, quickContacts } from "@/lib/data/mobile-app";
import { contactChannels, siteFacts } from "@/lib/data/site-facts";

export const metadata = { title: "Location" };

// Where DK LAO is, how to get there, every way to reach the team, and sending the customer's site pin.
export default function AppLocation() {
  const maps = mapLinks();
  const contacts = quickContacts();
  const emails = contactChannels().filter((channel) => channel.label === "Email");
  const serviceWhatsapp = contacts.find((contact) => contact.id === "whatsapp-service")?.href;

  return (
    <Screen title="Location" subtitle="Vientiane Capital, Lao PDR">
      {siteFacts.address && maps ? (
        <Group header="DK LAO office" footer="Opens in Maps and searches the address.">
          <Row icon={<RowIcon icon={MapPinned} color="#d91a21" />} title={siteFacts.address} selectable />
          <Row icon={<RowIcon icon={Navigation} color="#0061af" />} title="Directions in Apple Maps" href={maps.appleDirections} external tone="tint" />
          <Row icon={<RowIcon icon={MapIcon} color="#34c759" />} title="Open in Google Maps" href={maps.google} external tone="tint" />
        </Group>
      ) : null}

      <ShareLocation whatsappHref={serviceWhatsapp} />

      <Group header="Contact">
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
          <Row key={email.href} icon={<RowIcon icon={Mail} color="#8e8e93" />} title="Email" value={email.text} href={email.href} />
        ))}
      </Group>

      {siteFacts.hours ? (
        <Group header="Hours">
          <Row icon={<RowIcon icon={Clock} color="#ff9500" />} title="Open 24/7" subtitle={siteFacts.hours} />
        </Group>
      ) : null}
    </Screen>
  );
}
