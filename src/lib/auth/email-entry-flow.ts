import { normalizeEntryEmail } from "./email-entry";

const publicResponse = { message: "If this is a CMS account, an entrance key has been sent." };

export function validEntryEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = normalizeEntryEmail(value);
  return email.length <= 254 && /^[^\s@,<>]+@[^\s@,<>]+\.[a-z]{2,}$/i.test(email) ? email : null;
}

export async function requestEntryEmail(
  email: string,
  store: { issue: (email: string) => Promise<string | null> },
  send: (email: string, code: string) => Promise<unknown>,
) {
  const code = await store.issue(email);
  if (code) {
    try { await send(email, code); }
    catch (error) { console.warn(`[auth] entrance email delivery failed: ${error instanceof Error ? error.name : "error"}`); }
  }
  return publicResponse;
}
