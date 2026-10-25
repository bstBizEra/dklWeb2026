import { Group, Row, RowIcon, Screen } from "@/components/app/ios";
import { appServiceGroups } from "@/lib/data/mobile-app";

export const metadata = { title: "Services" };


// Equipment blue, service and parts red: the same split as the website's Solutions menu.
const groupColor: Record<string, string> = { Equipment: "#0061af", "Service & parts": "#d91a21" };

// Maintenance opens the service booking; everything else opens the quote form with its category chosen.
const requestHref = (intent: string | undefined) =>
  intent === "service" ? "/app/request?type=service" : `/app/request${intent ? `?category=${intent}` : ""}`;

// Every DK LAO service, grouped the way buyers look for it. A tap opens the request with that service chosen.
export default function AppServices() {
  const groups = appServiceGroups();

  return (
    <Screen title="Services" subtitle="Tap a service to request it">
      {groups.map((group) => (
        <Group key={group.title} header={group.title}>
          {group.links.map((link) => (
            <Row
              key={link.href}
              icon={<RowIcon icon={link.icon} color={groupColor[group.title] ?? "#8e8e93"} />}
              title={link.label}
              subtitle={link.description}
              href={requestHref(link.intent)}
            />
          ))}
        </Group>
      ))}

      <Group footer="Specifications, photos and guides for each service are on the website.">
        <Row title="Open dklao.com" href="/" external tone="tint" />
      </Group>
    </Screen>
  );
}
