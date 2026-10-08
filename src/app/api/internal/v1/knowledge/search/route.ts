import { NextResponse } from "next/server";
import { z } from "zod";

import { getStaff } from "@/lib/staff/auth";

const searchSchema = z.object({ query: z.string().trim().min(2).max(200) });

export async function POST(request: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ ok: false, error: { code: "AUTH_REQUIRED", message: "Sign in required", details: [] } }, { status: 401 });
  let input: unknown;
  try { input = await request.json(); } catch { input = null; }
  const parsed = searchSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Enter a question or search term", details: parsed.error.issues } }, { status: 422 });

  const { data, error } = await staff.client.rpc("search_verified_knowledge", {
    p_organization_id: staff.organizationId,
    p_query: parsed.data.query,
    p_limit: 5,
  });
  if (error) return NextResponse.json({ ok: false, error: { code: "INTEGRATION_FAILED", message: "Verified knowledge is unavailable", details: [] } }, { status: 503 });
  return NextResponse.json({ ok: true, data: data ?? [], message: data?.length ? "Verified sources found" : "No verified source matched. Ask a responsible staff member to confirm." });
}
