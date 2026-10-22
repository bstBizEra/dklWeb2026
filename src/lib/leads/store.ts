import { storeLocalLead } from "@/lib/leads/local-store";
import type { QuoteRequest } from "@/lib/validation/leads";

type StoredLead = QuoteRequest & { leadId: string };

// Saves to the Payload "leads" collection when a database is configured, otherwise to the
// local JSONL file used before the CMS existed. Both paths return the same shape.
export async function storeLead(lead: QuoteRequest): Promise<StoredLead> {
  if (!process.env.DATABASE_URL) return storeLocalLead(lead);

  const [{ getPayload }, { default: config }] = await Promise.all([import("payload"), import("@payload-config")]);
  const payload = await getPayload({ config });
  const doc = await payload.create({
    collection: "leads",
    overrideAccess: true,
    data: {
      leadType: lead.leadType,
      status: lead.status,
      companyName: lead.companyName,
      contactPerson: lead.contactPerson,
      phone: lead.phone,
      email: lead.email,
      equipmentOrServiceCategory: lead.equipmentOrServiceCategory,
      message: lead.message,
      sourcePage: lead.sourcePage,
      submittedAt: lead.submissionTimestamp,
    },
  });

  return { ...lead, leadId: doc.leadId as string };
}
