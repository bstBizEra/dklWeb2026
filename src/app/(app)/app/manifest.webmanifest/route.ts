import { appManifest } from "@/lib/data/mobile-app";

export const dynamic = "force-static";

// Web app manifest for the phone app only. It is linked from the /app layout, not from the website,
// so "Add to Home Screen" on a website page still saves a bookmark to that page.
export function GET() {
  return Response.json(appManifest, { headers: { "Content-Type": "application/manifest+json" } });
}
