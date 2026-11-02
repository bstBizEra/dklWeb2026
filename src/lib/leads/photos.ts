// Photos that visitors attach to the service, parts and warehouse forms (ported from feature/services-all-
// products, where only the parts form took them). The visitor is not trusted:
// - the type comes from the file's first bytes, never from the browser's claim or the file name, and only
//   JPEG, PNG and WebP pass, so an SVG or HTML file renamed .jpg is refused;
// - every photo is decoded and re-encoded with sharp. Output carries no metadata (sharp's default), so the
//   phone's EXIF data, GPS position included, is dropped, and so is anything appended after the image;
// - count, size and pixel limits keep one request from exhausting memory.
// The visitor's file name is never used; storage names come from the lead reference (photo-store.ts).
import sharp from "sharp";

import { maxPhotoBytes, maxPhotos } from "@/lib/leads/photos-limits";

export { maxPhotoBytes, maxPhotos };
// Room for the photos, the lead's own fields and the multipart boundaries.
export const maxMultipartBytes = maxPhotos * maxPhotoBytes + 64 * 1024;
// 40 million pixels, about a 7300 x 5500 photo: above any phone camera, far below sharp's own default.
export const maxPhotoPixels = 40_000_000;

export type PhotoType = "image/jpeg" | "image/png" | "image/webp";
export type CleanPhoto = { data: Buffer; mimeType: PhotoType; extension: "jpg" | "png" | "webp"; size: number };
export type PhotoCheck = { ok: true; photos: CleanPhoto[] } | { ok: false; reason: "too-many" | "too-large" | "wrong-type" };

const formats = {
  "image/jpeg": { format: "jpeg", extension: "jpg" },
  "image/png": { format: "png", extension: "png" },
  "image/webp": { format: "webp", extension: "webp" },
} as const;

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  bytes.length >= offset + signature.length && signature.every((byte, index) => bytes[offset + index] === byte);

export function sniffImageType(bytes: Uint8Array): PhotoType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  // "RIFF" ....  "WEBP"
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  return null;
}

// Decoding takes far more memory than the file (40 million pixels is about 120 MB), so at most two photos are
// decoded at once in this server process, however many visitors send at the same moment; the rest wait.
const photoSlots = 2;
let busy = 0;
const waiting: (() => void)[] = [];

export async function withPhotoSlot<T>(job: () => Promise<T>): Promise<T> {
  // A finished job hands its slot straight to the next waiting one, so a newcomer can never squeeze in between.
  if (busy >= photoSlots) await new Promise<void>((resolve) => waiting.push(resolve));
  else busy += 1;
  try {
    return await job();
  } finally {
    const next = waiting.shift();
    if (next) next();
    else busy -= 1;
  }
}

export async function cleanPhoto(bytes: Uint8Array, limitInputPixels = maxPhotoPixels): Promise<CleanPhoto | null> {
  const mimeType = sniffImageType(bytes);
  if (!mimeType) return null;
  const { format, extension } = formats[mimeType];
  try {
    // rotate() with no angle turns the picture upright from its EXIF orientation before that data is dropped.
    const data = await withPhotoSlot(() => sharp(bytes, { limitInputPixels, failOn: "warning" }).rotate().toFormat(format).toBuffer());
    return { data, mimeType, extension, size: data.byteLength };
  } catch {
    return null;
  }
}

export async function checkPhotos(files: File[]): Promise<PhotoCheck> {
  // A file input left empty still sends a nameless, empty part.
  const chosen = files.filter((file) => file.size > 0);
  if (chosen.length > maxPhotos) return { ok: false, reason: "too-many" };
  if (chosen.some((file) => file.size > maxPhotoBytes)) return { ok: false, reason: "too-large" };

  const photos: CleanPhoto[] = [];
  for (const file of chosen) {
    const cleaned = await cleanPhoto(new Uint8Array(await file.arrayBuffer()));
    if (!cleaned) return { ok: false, reason: "wrong-type" };
    photos.push(cleaned);
  }
  return { ok: true, photos };
}

// The line added to the lead's message, so the email and the webhook say the photos are in the CMS.
export const photoNote = (count: number) => (count ? `Photos: ${count} attached (open the lead in the CMS)` : "");
