import { appIcon } from "@/lib/app-icon";

export const dynamic = "force-static";
export const dynamicParams = false;

// 180 for the iPhone home screen (apple-touch-icon), 192 and 512 for the web app manifest, and the
// maskable 192 and 512 for Android's round and squircle icon shapes.
const appIconSizes = ["180", "192", "512", "maskable-192", "maskable-512"] as const;

export function generateStaticParams() {
  return appIconSizes.map((size) => ({ size }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const size = (await params).size;
  return appIcon(Number(size.replace("maskable-", "")), size.startsWith("maskable-"));
}
