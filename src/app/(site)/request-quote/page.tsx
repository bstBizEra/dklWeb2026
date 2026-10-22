import { ContentPage } from "@/components/dklao/content-page";
import { QuoteRequestForm } from "@/components/dklao/quote-request-form";
import { getPageContent } from "@/lib/cms/pages";
import { buildMetadata, requestQuotePage } from "@/lib/data/pages";
import { resolveIntent, safeFromPath } from "@/lib/leads/intents";

export async function generateMetadata() {
  return buildMetadata(await getPageContent(requestQuotePage));
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// ?category= preselects the form and ?from= records the page the visitor came from.
export default async function RequestQuotePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const intent = resolveIntent(first(params.category));
  const from = safeFromPath(first(params.from));

  return (
    <ContentPage page={await getPageContent(requestQuotePage)}>
      <QuoteRequestForm defaultCategory={intent.category} sourcePage={from} showHeader={false} />
    </ContentPage>
  );
}
