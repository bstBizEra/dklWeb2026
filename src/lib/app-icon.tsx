/* eslint-disable @next/next/no-img-element -- ImageResponse renders plain <img>; next/image does not apply here. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// DK LAO app icon, designed for the home screen at the owner's request (25 October 2026). The mark is the
// official oval DK emblem, cropped out of the primary logo file (public/images/logo/Logo-H_Text.svg) without
// redrawing it: only the SVG viewBox is narrowed to the emblem. Measured in the file, the emblem runs from
// x 0 to 129.1 and the "DK LAO" lettering starts at 142.2, so the crop is 0-131 (of 295). It sits on a full-bleed
// DK LAO navy square with the brand-blue glow used on the website's feature card, and the blue-red-orange
// brand stripe along the bottom.
// "maskable" is the Android version: Android crops icons to a circle or squircle, so the emblem stays inside
// the central safe zone (80% circle) and the stripe, which a circle would cut, is left out.
const emblemViewBox = { width: 131, height: 62.79 };

async function emblem(): Promise<string> {
  const svg = await readFile(join(process.cwd(), "public", "images", "logo", "Logo-H_Text.svg"), "utf8");
  const cropped = svg.replace(/viewBox="[^"]+"/, `viewBox="0 0 ${emblemViewBox.width} ${emblemViewBox.height}"`);
  return `data:image/svg+xml;base64,${Buffer.from(cropped).toString("base64")}`;
}

export async function appIcon(size: number, maskable = false): Promise<ImageResponse> {
  const width = Math.round(size * (maskable ? 0.68 : 0.84));
  const height = Math.round((width * emblemViewBox.height) / emblemViewBox.width);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundColor: "#07111f",
          backgroundImage:
            "radial-gradient(circle at 82% 12%, rgba(0,97,175,0.6), rgba(0,97,175,0) 58%), linear-gradient(160deg, #102a4c, #07111f)",
        }}
      >
        <img src={await emblem()} width={width} height={height} alt="" />
        {maskable ? null : (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: Math.max(2, Math.round(size * 0.045)),
              backgroundImage: "linear-gradient(90deg, #0061af, #d91a21, #e74422)",
            }}
          />
        )}
      </div>
    ),
    { width: size, height: size },
  );
}
