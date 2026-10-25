import { ContentPage } from "@/components/dklao/content-page";
import { getPageContent } from "@/lib/cms/pages";
import { buildMetadata, forkliftRentalPage } from "@/lib/data/pages";

export const revalidate = 60;

export async function generateMetadata() {
  return buildMetadata(await getPageContent(forkliftRentalPage));
}

export default async function ForkliftRentalPage() {
  return <ContentPage page={await getPageContent(forkliftRentalPage)} showClients />;
}
