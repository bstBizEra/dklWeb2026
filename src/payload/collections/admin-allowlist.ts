import type { CollectionConfig } from "payload";

import { isOwnerOrAdvisor, never } from "../access";

const normalizeEmail = (value: unknown) => typeof value === "string" ? value.trim().toLowerCase() : "";

export const AdminAllowlist: CollectionConfig = {
  slug: "admin-allowlist",
  labels: { singular: "Admin access email", plural: "Admin access emails" },
  admin: {
    group: "Access",
    useAsTitle: "email",
    description: "Only existing CMS accounts can be added. An entry permits login from any location; the account's role still controls its permissions.",
  },
  access: {
    create: isOwnerOrAdvisor,
    read: isOwnerOrAdvisor,
    update: never,
    delete: isOwnerOrAdvisor,
  },
  hooks: {
    beforeValidate: [async ({ data, req, operation }) => {
      if (operation !== "create") return data;
      const email = normalizeEmail(data?.email);
      if (!email) throw new Error("Enter an existing CMS account email.");
      const users = await req.payload.find({
        collection: "users",
        where: { email: { equals: email } },
        limit: 1,
        overrideAccess: true,
        req,
      });
      if (users.totalDocs !== 1 || users.docs[0]?.role === "owner") {
        throw new Error("Choose an existing non-owner CMS account.");
      }
      return { ...data, email };
    }],
    afterDelete: [async ({ doc, req }) => {
      // Match Payload's all-sessions logout operation: write the auth row directly so
      // a removed email loses every existing cookie without running user edit hooks.
      const user = await req.payload.db.findOne({
        collection: "users",
        where: { email: { equals: doc.email } },
        req,
      });
      if (user) await req.payload.db.updateOne({
        collection: "users",
        id: user.id,
        data: { ...user, sessions: [], updatedAt: null },
        req,
        returning: false,
      });
      return doc;
    }],
  },
  fields: [{ name: "email", type: "email", required: true, unique: true, index: true }],
};

export async function mayAccessAdmin(req: { payload: { count: (...args: never[]) => Promise<{ totalDocs: number }> }; user?: { email?: string; role?: string } | null }) {
  if (req.user?.role === "owner") return true;
  const email = normalizeEmail(req.user?.email);
  if (!email) return false;
  const result = await req.payload.count({
    collection: "admin-allowlist",
    where: { email: { equals: email } },
    overrideAccess: true,
    req,
  } as never);
  return result.totalDocs > 0;
}
