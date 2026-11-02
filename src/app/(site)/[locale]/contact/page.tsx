import { ContactInquiryForm } from "@/components/dklao/contact-inquiry-form";
import { FastContactCards, ResponseProcess } from "@/components/dklao/contact-extras";
import { ContentPage } from "@/components/dklao/content-page";
import { getPageContent } from "@/lib/cms/pages";
import { getSiteFacts } from "@/lib/cms/site-facts";
import { buildMetadata, contactPage, localizePage } from "@/lib/data/pages";
import { localeParam } from "@/lib/i18n";
import { getMessages } from "@/messages";

export const revalidate = 60;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const locale = await localeParam(params);
  return buildMetadata(await getPageContent(localizePage(contactPage, locale), locale), locale);
}

// Quick ways to reach DK LAO, the contact inquiry form and the steps after a request (ported from
// feature/services-all-products), above the page's CMS sections (direct contact facts, routing cards).
export default async function ContactPage({ params }: { params: Params }) {
  const locale = await localeParam(params);
  const messages = getMessages(locale);
  return (
    <ContentPage page={await getPageContent(localizePage(contactPage, locale), locale)} locale={locale}>
      <FastContactCards facts={await getSiteFacts(locale)} t={messages.contactExtras} />
      <ContactInquiryForm labels={messages.contactForm} shared={messages.quoteForm} />
      <ResponseProcess t={messages.contactExtras} />
    </ContentPage>
  );
}
