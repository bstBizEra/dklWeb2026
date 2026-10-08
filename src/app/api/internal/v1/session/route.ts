import { NextResponse } from "next/server";
import { getStaff } from "@/lib/staff/auth";

export async function GET() {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ ok: false, error: { code: "AUTH_REQUIRED", message: "Sign in required", details: [] } }, { status: 401 });
  return NextResponse.json({ ok: true, data: { role: staff.role, capabilities: {
    quoteApproval: staff.quoteApprover,
  } }, message: "Active staff session" });
}
