import { InfoScreen } from "@/components/app/screens";
import { appMessages } from "@/messages/app-en";

export const metadata = { title: appMessages("lo").info.title };

export default function LaoAppInfo() {
  return <InfoScreen locale="lo" />;
}
