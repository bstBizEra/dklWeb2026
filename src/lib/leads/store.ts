import { storeLocalLead } from "@/lib/leads/local-store";
import type { QuoteRequest } from "@/lib/validation/leads";

type StoredLead = QuoteRequest & { leadId: string; recordId?: string | number };

// Saves to the Payload "leads" collection when a database is configured, otherwise to the
// local JSONL file used before the CMS existed. Both paths return the same shape. When the database
// is configured but cannot be reached, the lead goes to the local file instead of being lost.
export async function storeLead(lead: QuoteRequest): Promise<StoredLead> {
  if (!process.env.DATABASE_URL) return storeLocalLead(lead);

  try {
    return await storeDatabaseLead(lead);
  } catch (error) {
    console.warn(`[leads] database save failed (${error instanceof Error ? error.name : "error"}); saving to the local file`);
    return storeLocalLead(lead);
  }
}

async function storeDatabaseLead(lead: QuoteRequest): Promise<StoredLead> {
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

  return { ...lead, leadId: doc.leadId as string, recordId: doc.id };
}
