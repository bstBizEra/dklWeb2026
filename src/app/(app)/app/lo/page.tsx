import { HomeScreen } from "@/components/app/screens";
import { appMessages } from "@/messages/app-en";

export const metadata = { title: appMessages("lo").home.title };

export default function LaoAppHome() {
  return <HomeScreen locale="lo" />;
}
