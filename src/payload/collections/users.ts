import type { CollectionConfig } from "payload";

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
