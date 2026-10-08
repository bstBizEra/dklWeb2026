import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { can, getStaff } from "@/lib/staff/auth";

export const metadata: Metadata = { title: "Leads", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function StaffLeads() {
  const staff = await getStaff();
  if (!staff) redirect("/staff/login");
  if (!can(staff.role, "manage_leads")) return <main id="main-content" className="staff-shell"><p>Access denied.</p></main>;

  const { data: leads, error } = await staff.client.from("leads")
    .select("id,reference,company_name,category,status,next_action,due_at,received_at")
    .eq("organization_id", staff.organizationId)
    .order("received_at", { ascending: false }).limit(50);

  return (
    <main id="main-content" className="staff-shell staff-shell--wide">
      <div className="staff-card staff-card--wide dk-card">
        <Link href="/staff">← Workspace</Link>
        <p className="dk-eyebrow">Sales</p>
        <h1>Leads</h1>
        {error ? <p role="alert">Lead data is unavailable. Please try again later.</p> : null}
        {!error && !leads?.length ? <p>No leads are assigned to your view yet.</p> : null}
        {!error && leads?.length ? <div className="staff-table-wrap"><table className="staff-table">
          <thead><tr><th>Reference</th><th>Company</th><th>Category</th><th>Status</th><th>Next action</th><th>Due</th></tr></thead>
          <tbody>{leads.map((lead) => <tr key={lead.id}>
            <td><Link href={`/staff/leads/${lead.id}`}>{lead.reference}</Link></td><td>{lead.company_name}</td><td>{lead.category}</td><td>{lead.status}</td>
            <td>{lead.next_action ?? "Unassigned"}</td>
            <td>{lead.due_at ? new Intl.DateTimeFormat("en-LA", { timeZone: "Asia/Vientiane", dateStyle: "medium" }).format(new Date(lead.due_at)) : "—"}</td>
          </tr>)}</tbody>
        </table></div> : null}
      </div>
    </main>
  );
}
