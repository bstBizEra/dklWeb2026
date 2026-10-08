import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

import { storeLocalLead } from "@/lib/leads/local-store";
import type { QuoteRequest } from "@/lib/validation/leads";

export type SubmitResult =
  | { kind: "accepted"; leadId: string; status: "NEW" }
  | { kind: "rate_limited" }
  | { kind: "conflict" };

export async function submitPublicLead(
  lead: QuoteRequest,
  key: string,
  clientIp: string,
): Promise<SubmitResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const organizationId = process.env.PUBLIC_ORGANIZATION_ID;
  const rateSecret = process.env.PUBLIC_RATE_LIMIT_SECRET;

  if (!url || !secret || !organizationId || !rateSecret) {
    if (process.env.NODE_ENV === "production") throw new Error("Durable public intake is not configured");
    const saved = await storeLocalLead(lead);
    return { kind: "accepted", leadId: saved.leadId, status: "NEW" };
  }

  const client = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const payload = {
    lead_type: lead.leadType,
    company_name: lead.companyName,
    contact_person: lead.contactPerson,
    phone: lead.phone,
    email: lead.email ?? null,
    category: lead.equipmentOrServiceCategory,
    message: lead.message,
    source_page: lead.sourcePage,
  };
  const requestHash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  const ipHash = createHash("sha256").update(rateSecret).update(clientIp).digest("hex");
  const { data, error } = await client.rpc("submit_public_quote", {
    p_organization_id: organizationId,
    p_submission_key: key,
    p_request_hash: requestHash,
    p_client_hash: ipHash,
    p_payload: payload,
  });
  if (error || !data) throw new Error("Public intake database write failed");
  if (data.kind === "rate_limited") return { kind: "rate_limited" };
  if (data.kind === "conflict") return { kind: "conflict" };
  if (data.kind !== "accepted" || typeof data.lead_id !== "string") throw new Error("Invalid intake response");
  return { kind: "accepted", leadId: data.lead_id, status: "NEW" };
}
