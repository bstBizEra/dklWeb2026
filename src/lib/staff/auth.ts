import { createStaffClient, staffDatabaseConfigured } from "@/lib/staff/supabase";

export type StaffRole = "admin" | "sales_manager" | "sales" | "operations" | "support";
export type Capability =
  | "manage_staff"
  | "view_all_leads"
  | "manage_leads"
  | "manage_tasks"
  | "manage_tickets"
  | "approve_quotes"
  | "view_reports";

const grants: Record<StaffRole, ReadonlySet<Capability>> = {
  admin: new Set(["manage_staff", "view_all_leads", "manage_leads", "manage_tasks", "manage_tickets", "view_reports"]),
  sales_manager: new Set(["view_all_leads", "manage_leads", "manage_tasks", "view_reports"]),
  sales: new Set(["manage_leads", "manage_tasks"]),
  operations: new Set(["manage_tasks"]),
  support: new Set(["manage_tasks", "manage_tickets"]),
};

export function can(role: StaffRole, capability: Capability, quoteApprover = false) {
  return capability === "approve_quotes" ? quoteApprover : grants[role].has(capability);
}

export async function getStaff() {
  if (!staffDatabaseConfigured()) return null;
  const client = await createStaffClient();
  const { data: identity, error: authError } = await client.auth.getUser();
  if (authError || !identity.user) return null;

  const { data: membership, error } = await client
    .from("staff_memberships")
    .select("id, organization_id, role, can_approve_quotes")
    .eq("user_id", identity.user.id)
    .eq("organization_id", process.env.STAFF_ORGANIZATION_ID!)
    .eq("active", true)
    .maybeSingle();
  if (error || !membership) return null;

  return {
    client,
    userId: identity.user.id,
    email: identity.user.email ?? "",
    membershipId: membership.id as string,
    organizationId: membership.organization_id as string,
    role: membership.role as StaffRole,
    quoteApprover: membership.can_approve_quotes as boolean,
  };
}
