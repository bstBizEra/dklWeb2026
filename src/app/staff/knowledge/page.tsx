import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StaffKnowledgeSearch } from "@/components/dklao/staff-knowledge-search";
import { getStaff } from "@/lib/staff/auth";

export const metadata: Metadata = { title: "Verified knowledge", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  if (!(await getStaff())) redirect("/staff/login");
  return <main id="main-content" className="staff-shell staff-shell--wide"><div className="staff-card staff-card--wide dk-card">
    <Link href="/staff">← Workspace</Link>
    <p className="dk-eyebrow">Staff knowledge</p>
    <h1>Verified sources</h1>
    <p>Use approved material to answer questions. Price, stock and delivery commitments always require confirmation.</p>
    <StaffKnowledgeSearch />
  </div></main>;
}
