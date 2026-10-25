// @vitest-environment node
/**
 * The Passenger start file (server.mjs) serves the built app: it starts on the port it is given, answers
 * pages and the lead API, and exits cleanly on SIGTERM (how Passenger and cPanel stop an app).
 * Needs a finished `pnpm build`; without one the test is skipped (CI runs the tests before building).
 */
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const root = process.cwd();
const built = existsSync(join(root, ".next", "BUILD_ID"));

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer().listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() => (typeof address === "object" && address ? resolve(address.port) : reject(new Error("no port"))));
    });
  });
}

describe.skipIf(!built)("server.mjs", () => {
  let child: ChildProcess;
  let base = "";
  let output = "";

  beforeAll(async () => {
    const port = await freePort();
    base = `http://127.0.0.1:${port}`;
    // No database or mail settings: the built-in pages are served and leads go to the local file path.
    child = spawn(process.execPath, ["server.mjs"], {
      cwd: root,
      env: { ...process.env, PORT: String(port), HOSTNAME: "127.0.0.1", DATABASE_URL: "", SMTP_HOST: "" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout?.on("data", (chunk) => (output += chunk));
    child.stderr?.on("data", (chunk) => (output += chunk));

    const deadline = Date.now() + 60_000;
    while (!output.includes("DK LAO ready on")) {
      if (child.exitCode !== null || Date.now() > deadline) throw new Error(`server did not start:\n${output}`);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }, 70_000);

  afterAll(() => {
    if (child && child.exitCode === null) child.kill("SIGKILL");
  });

  it("announces the port it was given", () => {
    expect(output).toContain(`DK LAO ready on ${base}`);
  });

  it("serves the home page and a content page", async () => {
    const home = await fetch(`${base}/`);
    expect(home.status).toBe(200);
    expect(await home.text()).toContain("DK LAO");
    expect((await fetch(`${base}/cleaning-equipment`)).status).toBe(200);
  });

  it("returns 404 for an unknown page and serves the lead API", async () => {
    expect((await fetch(`${base}/no-such-page`)).status).toBe(404);
    const invalid = await fetch(`${base}/api/leads/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "203.0.113.250" },
      body: JSON.stringify({}),
    });
    expect(invalid.status).toBe(400);
    expect((await invalid.json()).error.code).toBe("VALIDATION_ERROR");
  });

  // Windows has no SIGTERM handler (Node ends the process at once), so the clean exit code is checked
  // on Linux and macOS, as on the cPanel server; everywhere the server must stop.
  it("stops on SIGTERM, with exit code 0 where signals can be handled", async () => {
    const exited = new Promise<number | null>((resolve) => child.once("exit", (code) => resolve(code)));
    child.kill("SIGTERM");
    const code = await exited;
    if (process.platform !== "win32") expect(code).toBe(0);
    expect(child.exitCode !== null || child.signalCode !== null).toBe(true);
  }, 15_000);
});
