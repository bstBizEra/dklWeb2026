// Production start file for cPanel's Application Manager (Phusion Passenger). Passenger runs one Node
// file and gives it the port to listen on, so the built Next.js app (pages, API and /admin) is served
// through a small HTTP server here. Build first with `pnpm build`.
//
// Local check: `node server.mjs` serves http://127.0.0.1:3000 (or PORT / HOSTNAME from the environment).
// Under Passenger the port and host are handled by Passenger itself.
import { createServer } from "node:http";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import next from "next";

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || "127.0.0.1";

const app = next({ dev: false, dir: dirname(fileURLToPath(import.meta.url)), hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const server = createServer((request, response) => {
  handle(request, response).catch((error) => {
    console.error("[server] request failed:", error instanceof Error ? error.message : error);
    if (!response.headersSent) response.writeHead(500, { "Content-Type": "text/plain" });
    response.end("Internal Server Error");
  });
});

server.listen(port, hostname, () => {
  console.log(`[server] DK LAO ready on http://${hostname}:${port}`);
});

// Passenger and cPanel stop the app with SIGTERM: finish open requests, then exit.
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 10_000).unref();
  });
}
