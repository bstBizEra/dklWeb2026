import { ContentPage } from "@/components/dklao/content-page";
import { QuoteRequestForm } from "@/components/dklao/quote-request-form";
import { getPageContent } from "@/lib/cms/pages";
import { buildMetadata, contactPage, localizePage } from "@/lib/data/pages";
import { localeParam } from "@/lib/i18n";
import { leadIntents } from "@/lib/leads/intents";

export const revalidate = 60;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const locale = await localeParam(params);
  return buildMetadata(await getPageContent(localizePage(contactPage, locale), locale), locale);
}

export default async function ContactPage({ params }: { params: Params }) {
  const locale = await localeParam(params);
  return (
    <ContentPage page={await getPageContent(localizePage(contactPage, locale), locale)} locale={locale}>
      <QuoteRequestForm defaultCategory={leadIntents.general.category} showHeader={false} />
    </ContentPage>
  );
}
