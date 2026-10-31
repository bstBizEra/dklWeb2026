// Runs once when the Next.js server starts (next start, server.mjs, the systemd service), before any
// request. The CMS config is only loaded on first use and the CMS loaders fall back to built-in content on
// any error, so a bad PAYLOAD_SECRET would otherwise go unnoticed: the site would serve built-in pages and
// /admin would fail. A thrown error here is not enough either: with server.mjs, Next logs it and then
// answers 500 to every request while the process stays up. So the process exits, and systemd (or
// Passenger) reports a failed start with the reason in the log; the preview deploy then rolls back.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { payloadSecret } = await import("./lib/payload-secret");
  try {
    payloadSecret();
  } catch (error) {
    console.error(`[startup] ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
