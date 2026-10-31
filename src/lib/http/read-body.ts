// Reads a request body as text, stopping as soon as it passes maxBytes. request.text() would read the whole
// body into memory first, so the real limit was whatever the proxy in front allowed, and a length check on
// the decoded string counted characters, not bytes (Lao text is 3 bytes per character in UTF-8).
//
// A declared Content-Length over the limit is refused without reading anything. Otherwise the stream is read
// chunk by chunk and cancelled the moment the running total passes the limit, so a client that lies about
// the length (or sends none, with chunked encoding) still cannot make the server hold more than maxBytes.

export type BodyResult = { ok: true; text: string } | { ok: false; reason: "too-large" };

export async function readLimitedText(request: Request, maxBytes: number): Promise<BodyResult> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, reason: "too-large" };

  if (!request.body) return { ok: true, text: "" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      return { ok: false, reason: "too-large" };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, text: new TextDecoder().decode(bytes) };
}
