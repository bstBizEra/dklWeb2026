import { localLeadFile, newLeadId, storeLocalLead } from "@/lib/leads/local-store";
import type { QuoteRequest } from "@/lib/validation/leads";

// notInCms: a database is configured but this lead went to the local file because the save failed. Staff
// working in /admin will not see it until it is imported (pnpm cms:import-fallback-leads), so the email
// and the webhook say so.
type StoredLead = QuoteRequest & { leadId: string; recordId?: string | number; notInCms?: true };

// Saves to the Payload "leads" collection when a database is configured, otherwise to the
// local JSONL file used before the CMS existed. Both paths return the same shape. When the database
// is configured but cannot be reached, the lead goes to the local file instead of being lost.
//
// The database save has a time limit. Without one, a database that went away while the server was
// connected left the request waiting with no answer, no file copy and no email (found 2026-10-31: no
// answer after 40 seconds). The reference is chosen before saving and used on both paths, so a save that
// times out but completes later carries the same reference as the file copy, and the import skips it.
export const databaseSaveTimeoutMs = 8000;

export async function storeLead(lead: QuoteRequest, timeoutMs = databaseSaveTimeoutMs): Promise<StoredLead> {
  const leadId = newLeadId();
  if (!process.env.DATABASE_URL) return storeLocalLead(lead, leadId);

  try {
    return await withTimeout(storeDatabaseLead(lead, leadId), timeoutMs);
  } catch (error) {
    console.warn(`[leads] database save failed (${error instanceof Error ? error.name : "error"}); saving to the local file`);
    const stored = await storeLocalLead(lead, leadId);
    console.warn(
      `[leads] FALLBACK ${stored.leadId} is in ${localLeadFile}, not in the CMS. Import it with: pnpm cms:import-fallback-leads`,
    );
    return { ...stored, notInCms: true };
  }
}

class SaveTimeout extends Error {
  override name = "SaveTimeout";
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new SaveTimeout(`database save took over ${ms} ms`)), ms);
  });
  // A late failure of the abandoned save must not become an unhandled rejection.
  promise.catch(() => {});
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function storeDatabaseLead(lead: QuoteRequest, leadId: string): Promise<StoredLead> {
  const { getCms } = await import("@/lib/cms/client");
  const payload = await getCms();
  const doc = await payload.create({ collection: "leads", overrideAccess: true, data: leadDocData(lead, leadId) });

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
