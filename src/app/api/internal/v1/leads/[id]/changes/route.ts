import { NextResponse } from "next/server";
import { z } from "zod";

import { can, getStaff } from "@/lib/staff/auth";
import { leadStatusSchema } from "@/lib/validation/leads";

const changeSchema = z.object({
  status: leadStatusSchema.optional(),
  assignee: z.uuid().optional(),
  nextAction: z.string().trim().min(2).max(500).optional(),
  dueAt: z.iso.datetime().optional(),
  reason: z.string().trim().min(2).max(500).optional(),
  evidence: z.string().trim().min(2).max(500).optional(),
}).refine((value) => Object.keys(value).length > 0, "At least one change is required");

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Request origin denied", details: [] } }, { status: 403 });
  }
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ ok: false, error: { code: "AUTH_REQUIRED", message: "Sign in required", details: [] } }, { status: 401 });
  if (!can(staff.role, "manage_leads")) return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Access denied", details: [] } }, { status: 403 });
  const { id } = await context.params;
  const versionHeader = request.headers.get("if-match") ?? "";
  const key = request.headers.get("idempotency-key") ?? "";
  if (!z.uuid().safeParse(id).success || !/^"[1-9]\d*"$/.test(versionHeader) || !/^[A-Za-z0-9_-]{8,128}$/.test(key)) {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Valid resource, version and retry key are required", details: [] } }, { status: 400 });
  }
  let input: unknown;
  try { input = await request.json(); } catch { input = null; }
  const parsed = changeSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid lead change", details: parsed.error.issues } }, { status: 422 });

  const { data, error } = await staff.client.rpc("apply_lead_change", {
    p_lead_id: id,
    p_expected_version: Number(versionHeader.slice(1, -1)),
    p_idempotency_key: key,
    p_target_status: parsed.data.status ?? null,
    p_assignee: parsed.data.assignee ?? null,
    p_next_action: parsed.data.nextAction ?? null,
    p_due_at: parsed.data.dueAt ?? null,
    p_reason: parsed.data.reason ?? null,
    p_evidence: parsed.data.evidence ?? null,
  });
  if (error || !data) return NextResponse.json({ ok: false, error: { code: "INTEGRATION_FAILED", message: "Lead change is unavailable", details: [] } }, { status: 503 });
  if (data.kind !== "updated") {
    const status = data.kind === "stale" ? 412 : data.kind === "not_found" ? 404 : data.kind === "denied" ? 403 : 409;
    return NextResponse.json({ ok: false, error: { code: data.kind.toUpperCase(), message: "Lead change was not applied", details: [] } }, { status });
  }
  return NextResponse.json({ ok: true, data, message: "Lead updated" });
}
