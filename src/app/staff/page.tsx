import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getStaff } from "@/lib/staff/auth";
import { signOut } from "./login/actions";

export const metadata: Metadata = { title: "Staff workspace", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function StaffHome() {
  const staff = await getStaff();
  if (!staff) redirect("/staff/login");

  return (
    <main id="main-content" className="staff-shell">
      <div className="staff-card dk-card">
        <p className="dk-eyebrow">DK LAO staff workspace</p>
        <h1>Welcome</h1>
        <p>Signed in as {staff.email}. Your role is {staff.role.replace("_", " ")}.</p>
        <p>Customer records and actions appear here only when your organization and permissions are configured.</p>
        {staff.role === "admin" || staff.role === "sales_manager" || staff.role === "sales" ? <p><Link href="/staff/leads">View leads →</Link></p> : null}
        <p><Link href="/staff/knowledge">Search verified knowledge →</Link></p>
        <form action={signOut}><button className="dk-button dk-button-light" type="submit">Sign out</button></form>
      </div>
    </main>
  );
}
