import { OfflineScreen } from "@/components/app/screens";
import { appMessages } from "@/messages/app-en";

export const metadata = { title: appMessages("lo").offline.title };

export default function LaoAppOffline() {
  return <OfflineScreen locale="lo" />;
}
