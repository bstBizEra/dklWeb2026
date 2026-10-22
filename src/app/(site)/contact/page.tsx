import { ContentPage } from "@/components/dklao/content-page";
import { QuoteRequestForm } from "@/components/dklao/quote-request-form";
import { getPageContent } from "@/lib/cms/pages";
import { buildMetadata, contactPage } from "@/lib/data/pages";
import { leadIntents } from "@/lib/leads/intents";

export const revalidate = 60;

export async function generateMetadata() {
  return buildMetadata(await getPageContent(contactPage));
}

export default async function ContactPage() {
  return (
    <ContentPage page={await getPageContent(contactPage)}>
      <QuoteRequestForm defaultCategory={leadIntents.general.category} showHeader={false} />
    </ContentPage>
  );
}
