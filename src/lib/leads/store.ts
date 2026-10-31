import { localLeadFile, storeLocalLead } from "@/lib/leads/local-store";
import type { QuoteRequest } from "@/lib/validation/leads";

// notInCms: a database is configured but this lead went to the local file because the save failed. Staff
// working in /admin will not see it until it is imported (pnpm cms:import-fallback-leads), so the email
// and the webhook say so.
type StoredLead = QuoteRequest & { leadId: string; recordId?: string | number; notInCms?: true };

// Saves to the Payload "leads" collection when a database is configured, otherwise to the
// local JSONL file used before the CMS existed. Both paths return the same shape. When the database
// is configured but cannot be reached, the lead goes to the local file instead of being lost.
export async function storeLead(lead: QuoteRequest): Promise<StoredLead> {
  if (!process.env.DATABASE_URL) return storeLocalLead(lead);

  try {
    return await storeDatabaseLead(lead);
  } catch (error) {
    console.warn(`[leads] database save failed (${error instanceof Error ? error.name : "error"}); saving to the local file`);
    const stored = await storeLocalLead(lead);
    console.warn(
      `[leads] FALLBACK ${stored.leadId} is in ${localLeadFile}, not in the CMS. Import it with: pnpm cms:import-fallback-leads`,
    );
    return { ...stored, notInCms: true };
  }
}

async function storeDatabaseLead(lead: QuoteRequest): Promise<StoredLead> {
  const [{ getPayload }, { default: config }] = await Promise.all([import("payload"), import("@payload-config")]);
  const payload = await getPayload({ config });
  const doc = await payload.create({ collection: "leads", overrideAccess: true, data: leadDocData(lead) });

  return { ...lead, leadId: doc.leadId as string, recordId: doc.id };
}

// The "leads" row for a request. Shared with the fallback import, which also passes the leadId the
// visitor was given, so the reference in their confirmation and in the email stays the same.
export function leadDocData(lead: QuoteRequest, leadId?: string) {
  return {
    ...(leadId ? { leadId } : {}),
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
  };
}
