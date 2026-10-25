import { Screen } from "@/components/app/ios";
import { RequestForm } from "@/components/app/request-form";
import { isIntentKey, leadIntents } from "@/lib/leads/intents";

export const metadata = { title: "Request" };

type Props = { searchParams: Promise<{ type?: string; category?: string }> };

// ?type=service opens the service booking; ?category=<intent> preselects the quote category.
export default async function AppRequest({ searchParams }: Props) {
  const { type, category } = await searchParams;
  const mode = type === "service" ? "service" : "quote";
  const initialCategory = leadIntents[isIntentKey(category) && category !== "service" ? category : "rental"].category;

  return (
    <Screen title="Request" subtitle="Quotes and service bookings go straight to the DK LAO team, 24/7.">
      <RequestForm key={`${mode}-${initialCategory}`} initialMode={mode} initialCategory={initialCategory} />
    </Screen>
  );
}
