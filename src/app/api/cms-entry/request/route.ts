import { createHash } from "node:crypto";

import { after } from "next/server";
import { NextResponse } from "next/server";

import { createEmailEntryStore } from "@/lib/auth/email-entry";
import { validEntryEmail, requestEntryEmail } from "@/lib/auth/email-entry-flow";
import { sendEntryCode } from "@/lib/auth/email-entry-mail";
import { authThrottle } from "@/lib/auth/throttle";
import { cmsPool } from "@/lib/leads/guard";
import { createDatabaseRateLimiter } from "@/lib/leads/rate-store";

export async function POST(request: Request) {
  const blocked = await authThrottle(request);
  if (blocked) return blocked;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const email = validEntryEmail((body as { email?: unknown } | null)?.email);
  if (!email) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  try {
    const pool = await cmsPool();
    const limiter = createDatabaseRateLimiter(pool, { limit: 3, windowMs: 30 * 60_000 }, { prefix: "cms-entry-email" });
    const key = createHash("sha256").update(email).digest("hex");
    const limit = await limiter.check(key);
    if (!limit.allowed) return NextResponse.json({ error: "Please wait before requesting another key" }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
    const response = await requestEntryEmail(email, createEmailEntryStore(pool, process.env.PAYLOAD_SECRET ?? ""), (recipient, code) => {
      after(() => sendEntryCode(recipient, code).catch((error) => {
        console.warn(`[auth] entrance email delivery failed: ${error instanceof Error ? error.name : "error"}`);
      }));
      return Promise.resolve();
    });
    return NextResponse.json(response);
  } catch (error) {
    console.warn(`[auth] entrance request failed: ${error instanceof Error ? error.name : "error"}`);
    return NextResponse.json({ error: "Entrance key is temporarily unavailable" }, { status: 503 });
  }
}
