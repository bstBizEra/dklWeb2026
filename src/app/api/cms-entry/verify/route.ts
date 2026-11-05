import { NextResponse } from "next/server";

import { createEmailEntryStore, entryCookieName } from "@/lib/auth/email-entry";
import { validEntryEmail } from "@/lib/auth/email-entry-flow";
import { authThrottle } from "@/lib/auth/throttle";
import { cmsPool } from "@/lib/leads/guard";

export async function POST(request: Request) {
  const blocked = await authThrottle(request);
  if (blocked) return blocked;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const input = body as { email?: unknown; code?: unknown } | null;
  const email = validEntryEmail(input?.email);
  const code = input?.code;
  if (!email || typeof code !== "string" || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "Enter the six-digit key" }, { status: 400 });
  try {
    const store = createEmailEntryStore(await cmsPool(), process.env.PAYLOAD_SECRET ?? "");
    const proof = await store.verify(email, code);
    if (!proof) return NextResponse.json({ error: "Invalid or expired key" }, { status: 401 });
    const response = NextResponse.json({ next: "/admin/login" });
    response.cookies.set(entryCookieName, proof.token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
      maxAge: Math.max(1, Math.floor((proof.expiresAt.getTime() - Date.now()) / 1000)),
    });
    return response;
  } catch (error) {
    console.warn(`[auth] entrance verification failed: ${error instanceof Error ? error.name : "error"}`);
    return NextResponse.json({ error: "Entrance key is temporarily unavailable" }, { status: 503 });
  }
}
