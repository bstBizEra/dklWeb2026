import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";

import type { Queryable } from "@/lib/leads/rate-store";

export const entryLifetimeMs = 10 * 60 * 1000;
export const entryCookieName = "cms-entry";
export const normalizeEntryEmail = (value: string) => value.trim().toLowerCase();

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export function createEmailEntryStore(db: Queryable, secret: string) {
  const codeHash = (email: string, code: string) =>
    createHmac("sha256", secret).update(`${email}\0${code}`).digest("hex");

  return {
    async issue(rawEmail: string, now = new Date()): Promise<string | null> {
      const email = normalizeEntryEmail(rawEmail);
      if (!email || email.length > 254) return null;
      const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
      const expiry = new Date(now.getTime() + entryLifetimeMs);
      const { rows } = await db.query(`
        INSERT INTO cms_email_entry (email, code_hash, expires_at, attempts, verified_at, proof_hash, consumed_at)
        SELECT lower(email), $2, $3, 0, NULL, NULL, NULL FROM users WHERE lower(email) = $1
        ON CONFLICT (email) DO UPDATE SET
          code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at,
          attempts = 0, verified_at = NULL, proof_hash = NULL, consumed_at = NULL
        RETURNING email`, [email, codeHash(email, code), expiry]);
      return rows.length ? code : null;
    },

    async verify(rawEmail: string, code: string, now = new Date()): Promise<{ token: string; expiresAt: Date } | null> {
      const email = normalizeEntryEmail(rawEmail);
      if (!email || email.length > 254) return null;
      const token = randomBytes(32).toString("base64url");
      const { rows } = await db.query(`
        UPDATE cms_email_entry SET
          attempts = attempts + 1, verified_at = $3, code_hash = NULL, proof_hash = $4
        WHERE email = $1 AND code_hash = $2 AND attempts < 5
          AND expires_at > $3 AND verified_at IS NULL
        RETURNING expires_at`, [email, codeHash(email, code), now, digest(token)]);
      if (rows.length) return { token, expiresAt: new Date(rows[0].expires_at as string) };
      await db.query(`
        UPDATE cms_email_entry SET attempts = attempts + 1
        WHERE email = $1 AND attempts < 5 AND expires_at > $2 AND verified_at IS NULL`, [email, now]);
      return null;
    },

    async hasProof(rawEmail: string, token: string, now = new Date()): Promise<boolean> {
      const email = normalizeEntryEmail(rawEmail);
      if (!email || !token) return false;
      const { rows } = await db.query(`
        SELECT 1 FROM cms_email_entry
        WHERE email = $1 AND proof_hash = $2 AND verified_at IS NOT NULL
          AND consumed_at IS NULL AND expires_at > $3`, [email, digest(token), now]);
      return rows.length > 0;
    },

    async proofEmail(token: string, now = new Date()): Promise<string | null> {
      if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
      const { rows } = await db.query(`
        SELECT email FROM cms_email_entry WHERE proof_hash = $1 AND verified_at IS NOT NULL
          AND consumed_at IS NULL AND expires_at > $2`, [digest(token), now]);
      return typeof rows[0]?.email === "string" ? rows[0].email : null;
    },

    async consumeProof(rawEmail: string, token: string, now = new Date()): Promise<boolean> {
      const email = normalizeEntryEmail(rawEmail);
      if (!email || !token) return false;
      const { rows } = await db.query(`
        UPDATE cms_email_entry SET consumed_at = $3
        WHERE email = $1 AND proof_hash = $2 AND verified_at IS NOT NULL
          AND consumed_at IS NULL AND expires_at > $3
        RETURNING email`, [email, digest(token), now]);
      return rows.length === 1;
    },
  };
}

export function readEntryCookie(header: string | null): string | null {
  const value = header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${entryCookieName}=`));
  const token = value?.slice(entryCookieName.length + 1);
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}
