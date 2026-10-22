import type { Access } from "payload";

export type Role = "owner" | "editor" | "advisor";
export const roles: Role[] = ["owner", "editor", "advisor"];

// owner: everything. editor: website content, no customer data. advisor: leads, no content or users.
const roleOf = (user: unknown): Role | undefined => (user as { role?: Role } | null)?.role;

export const anyone: Access = () => true;
export const never: Access = () => false;
export const isOwner: Access = ({ req }) => roleOf(req.user) === "owner";
export const isOwnerOrEditor: Access = ({ req }) => ["owner", "editor"].includes(roleOf(req.user) ?? "");
export const isOwnerOrAdvisor: Access = ({ req }) => ["owner", "advisor"].includes(roleOf(req.user) ?? "");
// Visitors see published content only. Owners and editors also see drafts.
export const publishedOrStaff: Access = ({ req }) =>
  ["owner", "editor"].includes(roleOf(req.user) ?? "") ? true : { _status: { equals: "published" } };
export const ownerOrSelf: Access = ({ req }) => {
  if (roleOf(req.user) === "owner") return true;
  return req.user ? { id: { equals: req.user.id } } : false;
};
