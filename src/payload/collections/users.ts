import type { CollectionConfig } from "payload";

import { isOwner, ownerOrSelf, roles } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: { useAsTitle: "email", defaultColumns: ["email", "name", "role"] },
  access: { create: isOwner, read: ownerOrSelf, update: ownerOrSelf, delete: isOwner },
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
