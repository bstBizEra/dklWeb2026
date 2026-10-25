/* eslint-disable @next/next/no-img-element -- ImageResponse renders plain <img>; next/image does not apply here. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { shareCards, shareImageSize } from "@/lib/data/share";

// Branded 1200x630 share image per page: navy blueprint grid, logo, eyebrow, heading, forklift, brand stripe.
// Built once at build time for every page id; an unknown id is a 404.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(shareCards()).map((id) => ({ id }));
}

const asset = async (path: string, type: string) =>
  `data:${type};base64,${(await readFile(join(process.cwd(), "public", path))).toString("base64")}`;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const card = shareCards()[(await params).id];
  if (!card) return new Response("Not found", { status: 404 });

  const [logo, forklift, interBold] = await Promise.all([
    asset("images/logo/Logo-H_Text.svg", "image/svg+xml"),
    asset("images/hero/toyota-35-50-tonne-8-series-forklift.png", "image/png"),
    // Inter Bold, Latin subset (Fontsource, SIL Open Font License), so headlines match the site's heavy type.
    readFile(join(process.cwd(), "src", "assets", "fonts", "Inter-Bold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          fontFamily: "Inter",
          color: "#ffffff",
          backgroundColor: "#07111f",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(135deg, #07111f 0%, #0b1b33 56%, #102a4c 100%)",
          backgroundSize: "48px 48px, 48px 48px, 100% 100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 700, padding: "64px 0 0 72px" }}>
          <div style={{ display: "flex", padding: "10px 16px", borderRadius: 14, backgroundColor: "#ffffff", alignSelf: "flex-start" }}>
            <img src={logo} width={236} height={50} alt="" />
          </div>
          <div style={{ marginTop: 64, fontSize: 24, letterSpacing: 2, textTransform: "uppercase", color: "#e74422" }}>{card.eyebrow}</div>
          <div style={{ marginTop: 18, fontSize: card.title.length > 30 ? 58 : 68, lineHeight: 1.04, letterSpacing: -2 }}>{card.title}</div>
          <div style={{ marginTop: "auto", marginBottom: 54, fontSize: 24, color: "rgba(255,255,255,0.72)" }}>www.dklao.com</div>
        </div>
        <img src={forklift} width={520} height={520} alt="" style={{ position: "absolute", right: 24, bottom: 18 }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 10,
            backgroundImage: "linear-gradient(90deg, #0061af, #d91a21 50%, #e74422)",
          }}
        />
      </div>
    ),
    { ...shareImageSize, fonts: [{ name: "Inter", data: interBold, weight: 700, style: "normal" }] },
  );
}
