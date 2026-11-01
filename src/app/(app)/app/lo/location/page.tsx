import { LocationScreen } from "@/components/app/screens";
import { appMessages } from "@/messages/app-en";

export const metadata = { title: appMessages("lo").location.title };

export default function LaoAppLocation() {
  return <LocationScreen locale="lo" />;
}
