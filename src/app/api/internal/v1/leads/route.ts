import { NextResponse } from "next/server";
import { z } from "zod";

import { can, getStaff } from "@/lib/staff/auth";
import { leadStatusSchema } from "@/lib/validation/leads";

const querySchema = z.object({
  status: leadStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export async function GET(request: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ ok: false, error: { code: "AUTH_REQUIRED", message: "Sign in required", details: [] } }, { status: 401 });
  if (!can(staff.role, "manage_leads") && !can(staff.role, "view_all_leads")) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Access denied", details: [] } }, { status: 403 });
  }
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid filters", details: parsed.error.issues } }, { status: 400 });

  let query = staff.client.from("leads")
    .select("id,reference,company_name,contact_person,category,status,assigned_to,next_action,due_at,received_at,version")
    .eq("organization_id", staff.organizationId)
    .order("received_at", { ascending: false })
    .limit(parsed.data.limit);
  if (parsed.data.status) query = query.eq("status", parsed.data.status);
  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: { code: "INTEGRATION_FAILED", message: "Lead list is unavailable", details: [] } }, { status: 503 });
  return NextResponse.json({ ok: true, data: data ?? [], message: "Leads" });
}
