import { ServicesScreen } from "@/components/app/screens";
import { appMessages } from "@/messages/app-en";

export const metadata = { title: appMessages("lo").services.title };

export default function LaoAppServices() {
  return <ServicesScreen locale="lo" />;
}
