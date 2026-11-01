import { ContentPage } from "@/components/dklao/content-page";
import { getPageContent } from "@/lib/cms/pages";
import { buildMetadata, forkliftRentalPage, localizePage } from "@/lib/data/pages";
import { localeParam } from "@/lib/i18n";

export const revalidate = 60;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const locale = await localeParam(params);
  return buildMetadata(await getPageContent(localizePage(forkliftRentalPage, locale), locale), locale);
}

export default async function ForkliftRentalPage({ params }: { params: Params }) {
  const locale = await localeParam(params);
  return <ContentPage page={await getPageContent(localizePage(forkliftRentalPage, locale), locale)} locale={locale} showClients />;
}
