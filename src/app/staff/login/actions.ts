"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getStaff } from "@/lib/staff/auth";
import { createStaffClient, staffDatabaseConfigured } from "@/lib/staff/supabase";

const credentials = z.object({ email: z.email(), password: z.string().min(1) });

export async function signIn(formData: FormData) {
  if (!staffDatabaseConfigured()) redirect("/staff/login?error=unavailable");
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/staff/login?error=invalid");

  const client = await createStaffClient();
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error) redirect("/staff/login?error=invalid");
  if (!(await getStaff())) {
    await client.auth.signOut();
    redirect("/staff/login?error=access");
  }
  redirect("/staff");
}

export async function signOut() {
  if (staffDatabaseConfigured()) await (await createStaffClient()).auth.signOut();
  redirect("/staff/login");
}
