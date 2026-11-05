import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { createEmailEntryStore, entryCookieName } from "@/lib/auth/email-entry";
import { cmsPool } from "@/lib/leads/guard";

import { importMap } from "../importMap";

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

export default async function Page({ params, searchParams }: Args) {
  if ((await headers()).get("x-dklao-entry-login") === "1") {
    const token = (await cookies()).get(entryCookieName)?.value;
    if (!token) redirect("/cms-entry");
    let email: string | null = null;
    try { email = await createEmailEntryStore(await cmsPool(), process.env.PAYLOAD_SECRET ?? "").proofEmail(token); }
    catch { /* No database means no entrance proof. */ }
    if (!email) redirect("/cms-entry");
  }
  return RootPage({ config, params, searchParams, importMap });
}
