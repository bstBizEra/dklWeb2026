/**
 * Byte-limited body reading: the limit is in bytes (not characters), a declared oversize body is refused
 * without being read, and a body that streams past the limit is cut off as soon as it does.
 */
import { describe, expect, it } from "vitest";

import { readLimitedBytes, readLimitedText } from "./read-body";

const post = (body: BodyInit | null, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/x", { method: "POST", body, headers, ...(body instanceof ReadableStream ? { duplex: "half" } : {}) } as RequestInit);

function stream(chunks: string[], pulled: { count: number }) {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index >= chunks.length) return controller.close();
      pulled.count += 1;
      controller.enqueue(encoder.encode(chunks[index++]));
    },
  // No read-ahead: a chunk is produced only when the reader asks for one.
  }, { highWaterMark: 0 });
}

describe("readLimitedText", () => {
  it("returns the text of a body within the limit", async () => {
    expect(await readLimitedText(post('{"a":1}'), 100)).toEqual({ ok: true, text: '{"a":1}' });
    expect(await readLimitedText(post(null), 100)).toEqual({ ok: true, text: "" });
  });

  it("counts bytes, not characters", async () => {
    const lao = "ສະບາຍດີ"; // 7 characters, 21 bytes in UTF-8
    expect(await readLimitedText(post(lao), 21)).toEqual({ ok: true, text: lao });
    expect(await readLimitedText(post(lao), 20)).toEqual({ ok: false, reason: "too-large" });
  });

  it("decodes a character split across chunks", async () => {
    const bytes = new TextEncoder().encode("ດີ");
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.slice(0, 2));
        controller.enqueue(bytes.slice(2));
        controller.close();
      },
    });
    expect(await readLimitedText(post(body), 100)).toEqual({ ok: true, text: "ດີ" });
  });

  it("refuses a declared oversize body without reading it", async () => {
    const pulled = { count: 0 };
    const result = await readLimitedText(post(stream(["x"], pulled), { "content-length": "5000" }), 100);
    expect(result).toEqual({ ok: false, reason: "too-large" });
    expect(pulled.count).toBe(0);
  });

  it("stops reading as soon as a streamed body passes the limit, whatever the client declared", async () => {
    const pulled = { count: 0 };
    const chunks = Array.from({ length: 50 }, () => "x".repeat(40));
    const result = await readLimitedText(post(stream(chunks, pulled), { "content-length": "10" }), 100);
    expect(result).toEqual({ ok: false, reason: "too-large" });
    // The third 40-byte chunk passes 100; the other 47 are never pulled.
    expect(pulled.count).toBe(3);
  });
});

// Photo uploads read the raw bytes (a multipart body is not text) under the same rules.
describe("readLimitedBytes", () => {
  it("returns the exact bytes of a body within the limit", async () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0x00, 0x80]);
    const result = await readLimitedBytes(post(bytes), 10);
    expect(result.ok && Array.from(result.bytes)).toEqual([0xff, 0xd8, 0xff, 0x00, 0x80]);
  });

  it("refuses a body over the limit", async () => {
    expect(await readLimitedBytes(post(new Uint8Array(11)), 10)).toEqual({ ok: false, reason: "too-large" });
  });
});
