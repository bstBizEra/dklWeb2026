// Lao overrides for src/lib/data/site-facts.ts: wording of the owner-confirmed text facts only. Phone
// numbers, WhatsApp, email and social links are never translated. A fact that is null in English stays
// hidden whatever is written here. With a database the CMS Site facts global (locale lo) is used instead.
import type { SiteFacts } from "@/lib/data/site-facts";

type TextFact = "address" | "hours" | "serviceAreas" | "quoteReplyTime" | "deliveryCoverage" | "maintenanceTerms" | "rentToBuyTerms";

export const loSiteFacts: Partial<Pick<SiteFacts, TextFact>> = {};
