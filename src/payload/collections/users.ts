import type { CollectionConfig } from "payload";
import { Forbidden } from "payload";

import { createEmailEntryStore, readEntryCookie } from "@/lib/auth/email-entry";
import type { Queryable } from "@/lib/leads/rate-store";

import { isOwner, ownerOrSelf, roles } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  // More failures than one address may send in the window (lib/auth/throttle.ts allows 10 per 15 minutes),
  // so a single caller cannot lock an account out.
  auth: { maxLoginAttempts: 20, lockTime: 15 * 60 * 1000 },
  admin: { useAsTitle: "email", defaultColumns: ["email", "name", "role"] },
  // unlock: Payload's default lets any logged-in user unlock any account.
  access: { create: isOwner, read: ownerOrSelf, update: ownerOrSelf, delete: isOwner, unlock: isOwner },
  hooks: {
    beforeLogin: [async ({ req, user }) => {
      const token = readEntryCookie(req.headers.get("cookie"));
      const pool = (req.payload.db as unknown as { pool?: Queryable }).pool;
      if (!token || !pool || !user.email || !await createEmailEntryStore(pool, req.payload.secret).consumeProof(user.email, token)) {
        throw new Forbidden(req.t);
      }
      return user;
    }],
    beforeChange: [
      async ({ data, operation, req }) => {
        // The first account created through the admin screen becomes the owner.
        if (operation === "create") {
          const { totalDocs } = await req.payload.count({ collection: "users", overrideAccess: true });
          if (totalDocs === 0) return { ...data, role: "owner" };
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text" },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "advisor",
      saveToJWT: true,
      options: roles.map((value) => ({ label: value, value })),
      access: { update: ({ req }) => (req.user as { role?: string } | null)?.role === "owner" },
    },
  ],
};
