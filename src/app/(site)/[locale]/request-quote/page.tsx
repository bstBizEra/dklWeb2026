import { ContentPage } from "@/components/dklao/content-page";
import { QuoteRequestForm } from "@/components/dklao/quote-request-form";
import { getPageContent } from "@/lib/cms/pages";
import { buildMetadata, localizePage, requestQuotePage } from "@/lib/data/pages";
import { localeParam } from "@/lib/i18n";
import { resolveIntent, safeFromPath } from "@/lib/leads/intents";
import { getMessages } from "@/messages";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const locale = await localeParam(params);
  return buildMetadata(await getPageContent(localizePage(requestQuotePage, locale), locale), locale);
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// ?category= preselects the form and ?from= records the page the visitor came from.
export default async function RequestQuotePage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const locale = await localeParam(params);
  const query = await searchParams;
  const intent = resolveIntent(first(query.category));
  const from = safeFromPath(first(query.from));

  return (
    <ContentPage page={await getPageContent(localizePage(requestQuotePage, locale), locale)} locale={locale}>
      <QuoteRequestForm defaultCategory={intent.category} sourcePage={from} showHeader={false} labels={getMessages(locale).quoteForm} />
    </ContentPage>
  );
}
