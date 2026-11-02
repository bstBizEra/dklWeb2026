import { RequestScreen, type RequestSearchParams } from "@/components/app/screens";
import { appMessages } from "@/messages/app-en";

export const metadata = { title: appMessages("lo").request.title };

export default function LaoAppRequest({ searchParams }: { searchParams: RequestSearchParams }) {
  return <RequestScreen locale="lo" searchParams={searchParams} />;
}
