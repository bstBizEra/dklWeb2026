import { ContentPage } from "@/components/dklao/content-page";
import { QuoteRequestForm } from "@/components/dklao/quote-request-form";
import { buildMetadata, contactPage } from "@/lib/data/pages";
import { leadIntents } from "@/lib/leads/intents";

export const metadata = buildMetadata(contactPage);

export default function ContactPage() {
  return (
    <ContentPage page={contactPage}>
      <QuoteRequestForm defaultCategory={leadIntents.general.category} showHeader={false} />
    </ContentPage>
  );
}
