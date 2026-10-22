import { ContentPage } from "@/components/dklao/content-page";
import { buildMetadata, forkliftRentalPage } from "@/lib/data/pages";

export const metadata = buildMetadata(forkliftRentalPage);

export default function ForkliftRentalPage() {
  return <ContentPage page={forkliftRentalPage} />;
}
