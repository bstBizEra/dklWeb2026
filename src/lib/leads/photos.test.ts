/**
 * Photos that visitors attach to the service, parts and warehouse forms. A visitor is not trusted, so the
 * type comes from the file's own first bytes (never the browser's claim), only JPEG, PNG and WebP pass,
 * every photo is re-encoded (which drops EXIF data such as the phone's GPS position, and anything hidden
 * after the image), and count, size and pixel limits stop memory exhaustion.
 */
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { checkPhotos, cleanPhoto, maxPhotoBytes, maxPhotos, photoNote, sniffImageType, withPhotoSlot } from "./photos";

const image = (format: "jpeg" | "png" | "webp", width = 8, height = 8) =>
  sharp({ create: { width, height, channels: 3, background: { r: 200, g: 30, b: 30 } } })
    .toFormat(format)
    .toBuffer();

const file = (bytes: Uint8Array, type: string, name = "photo") => new File([bytes as BlobPart], name, { type });

describe("sniffImageType", () => {
  it("recognises JPEG, PNG and WebP from their bytes", async () => {
    expect(sniffImageType(await image("jpeg"))).toBe("image/jpeg");
    expect(sniffImageType(await image("png"))).toBe("image/png");
    expect(sniffImageType(await image("webp"))).toBe("image/webp");
  });

  it("refuses SVG, HTML, GIF and short files, whatever they are called", () => {
    const text = (value: string) => new TextEncoder().encode(value);
    expect(sniffImageType(text('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).toBeNull();
    expect(sniffImageType(text("<html><script>alert(1)</script></html>"))).toBeNull();
    expect(sniffImageType(text("GIF89a......"))).toBeNull();
    expect(sniffImageType(new Uint8Array([0xff, 0xd8]))).toBeNull();
  });
});

describe("cleanPhoto", () => {
  it("re-encodes the photo and drops its EXIF data, including the GPS position", async () => {
    const withGps = await sharp(await image("jpeg"))
      .withExif({ IFD0: { Make: "PhoneCo" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "17/1 58/1 0/1" } })
      .jpeg()
      .toBuffer();
    expect((await sharp(withGps).metadata()).exif).toBeDefined();

    const cleaned = await cleanPhoto(withGps);

    expect(cleaned).toMatchObject({ mimeType: "image/jpeg", extension: "jpg" });
    expect((await sharp(cleaned!.data).metadata()).exif).toBeUndefined();
  });

  it("drops bytes appended after the image", async () => {
    const tail = new TextEncoder().encode("<script>alert(1)</script>");
    const polyglot = Buffer.concat([await image("png"), Buffer.from(tail)]);
    const cleaned = await cleanPhoto(polyglot);
    expect(cleaned && Buffer.from(cleaned.data).includes(Buffer.from(tail))).toBe(false);
  });

  it("refuses an image with more pixels than the limit, and a file that is not an image", async () => {
    expect(await cleanPhoto(await image("png", 100, 100), 50 * 50)).toBeNull();
    expect(await cleanPhoto(new TextEncoder().encode("not an image"))).toBeNull();
  });
});

describe("checkPhotos", () => {
  it("accepts up to two photos and returns them cleaned", async () => {
    const result = await checkPhotos([file(await image("jpeg"), "image/jpeg"), file(await image("webp"), "image/webp")]);
    expect(result.ok && result.photos.map((photo) => photo.mimeType)).toEqual(["image/jpeg", "image/webp"]);
  });

  it("refuses a third photo, an oversize photo and a disguised file", async () => {
    const jpeg = await image("jpeg");
    expect(maxPhotos).toBe(2);
    expect(await checkPhotos([file(jpeg, "image/jpeg"), file(jpeg, "image/jpeg"), file(jpeg, "image/jpeg")])).toMatchObject({ ok: false, reason: "too-many" });
    expect(await checkPhotos([file(new Uint8Array(maxPhotoBytes + 1), "image/jpeg")])).toMatchObject({ ok: false, reason: "too-large" });
    const svg = new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'/>");
    expect(await checkPhotos([file(svg, "image/jpeg", "photo.jpg")])).toMatchObject({ ok: false, reason: "wrong-type" });
  });

  it("ignores empty file inputs", async () => {
    expect(await checkPhotos([file(new Uint8Array(0), "application/octet-stream", "")])).toEqual({ ok: true, photos: [] });
  });
});

// Decoding a large photo takes far more memory than the file (40 million pixels is about 120 MB), so the
// server decodes at most two at a time, whatever the number of visitors sending at once.
describe("withPhotoSlot", () => {
  it("runs at most two photo jobs at the same time and runs them all", async () => {
    let running = 0;
    let most = 0;
    const job = async (value: number) => {
      running += 1;
      most = Math.max(most, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running -= 1;
      return value;
    };

    const results = await Promise.all([1, 2, 3, 4, 5, 6].map((value) => withPhotoSlot(() => job(value))));

    expect(results).toEqual([1, 2, 3, 4, 5, 6]);
    expect(most).toBe(2);
  });

  it("hands a freed slot to the job already waiting, not to one that arrives in the same moment", async () => {
    let running = 0;
    let most = 0;
    const gates: (() => void)[] = [];
    const held = () =>
      withPhotoSlot(async () => {
        running += 1;
        most = Math.max(most, running);
        await new Promise<void>((resolve) => gates.push(resolve));
        running -= 1;
      });

    const jobs = [held(), held(), held()]; // two run, the third waits
    await new Promise((resolve) => setTimeout(resolve, 0));
    gates.shift()?.(); // the first finishes...
    jobs.push(held()); // ...and a new job arrives at once
    for (let round = 0; round < 6; round += 1) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      gates.shift()?.();
    }
    await Promise.all(jobs);

    expect(most).toBe(2);
  });

  it("frees the slot when a job fails", async () => {
    await expect(withPhotoSlot(async () => Promise.reject(new Error("bad")))).rejects.toThrow("bad");
    await expect(withPhotoSlot(async () => Promise.reject(new Error("bad")))).rejects.toThrow("bad");
    expect(await withPhotoSlot(async () => "still works")).toBe("still works");
  });
});

describe("photoNote", () => {
  it("tells the team in the lead's message how many photos came with it", () => {
    expect(photoNote(0)).toBe("");
    expect(photoNote(2)).toBe("Photos: 2 attached (open the lead in the CMS)");
  });
});
