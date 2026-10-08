import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { can, getStaff } from "@/lib/staff/auth";
import { LeadChangeForm } from "./lead-change-form";

export const metadata: Metadata = { title: "Lead details", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LeadDetails({ params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaff();
  if (!staff) redirect("/staff/login");
  if (!can(staff.role, "manage_leads")) notFound();
  const { id } = await params;
  const { data: lead, error } = await staff.client.from("leads")
    .select("id,reference,company_name,contact_person,phone,email,category,request_text,source_page,status,assigned_to,next_action,due_at,status_reason,outcome_evidence,received_at,version")
    .eq("organization_id", staff.organizationId).eq("id", id).maybeSingle();
  if (error || !lead) notFound();

  return <main id="main-content" className="staff-shell staff-shell--wide"><div className="staff-card staff-card--wide dk-card">
    <Link href="/staff/leads">← Leads</Link>
    <p className="dk-eyebrow">{lead.reference}</p><h1>{lead.company_name}</h1>
    <dl className="staff-details">
      <div><dt>Contact</dt><dd>{lead.contact_person}</dd></div>
      <div><dt>Phone</dt><dd><a href={`tel:${lead.phone}`}>{lead.phone}</a></dd></div>
      <div><dt>Email</dt><dd>{lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "—"}</dd></div>
      <div><dt>Category</dt><dd>{lead.category}</dd></div>
      <div><dt>Source</dt><dd>{lead.source_page}</dd></div>
      <div><dt>Received</dt><dd>{new Intl.DateTimeFormat("en-LA", { timeZone: "Asia/Vientiane", dateStyle: "medium", timeStyle: "short" }).format(new Date(lead.received_at))}</dd></div>
    </dl>
    <h2>Request</h2><p className="staff-request">{lead.request_text}</p>
    <h2>Follow-up</h2>
    <p>Status: <strong>{lead.status}</strong>. {lead.next_action ?? "No next action"}</p>
    {lead.due_at ? <p>Due: {new Intl.DateTimeFormat("en-LA", { timeZone: "Asia/Vientiane", dateStyle: "medium", timeStyle: "short" }).format(new Date(lead.due_at))}</p> : null}
    <LeadChangeForm lead={{ id: lead.id, status: lead.status, version: lead.version, assignedTo: lead.assigned_to }}
      canAssignSelf={staff.role === "sales_manager" && lead.assigned_to !== staff.membershipId} membershipId={staff.membershipId} />
  </div></main>;
}
