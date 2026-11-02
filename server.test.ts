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

import { en } from "@/messages/en";
import { lo } from "@/messages/lo";

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

type Server = { child: ChildProcess; base: string; output: () => string };

// No database or mail settings: the built-in pages are served and leads go to the local file path.
async function startServer(args: string[]): Promise<Server> {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  let output = "";
  const child = spawn(process.execPath, args, {
    cwd: root,
    env: { ...process.env, PORT: String(port), HOSTNAME: "127.0.0.1", DATABASE_URL: "", SMTP_HOST: "" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout?.on("data", (chunk) => (output += chunk));
  child.stderr?.on("data", (chunk) => (output += chunk));

  const deadline = Date.now() + 60_000;
  while (!output.includes("DK LAO ready on")) {
    if (child.exitCode !== null || Date.now() > deadline) throw new Error(`server did not start:
${output}`);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return { child, base, output: () => output };
}

// What a visitor without JavaScript sees: the markup, with the scripts (and the data payload inside them,
// which repeats every string on the page) taken out. A page drawn only in the browser leaves this empty.
const visibleText = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Started directly, and through app.js loaded with require() the way Passenger may load it.
describe.skipIf(!built).each([
  ["server.mjs", ["server.mjs"]],
  ["app.js loaded with require()", ["-e", "require('./app.js')"]],
])("%s", (_label, args) => {
  let child: ChildProcess;
  let base = "";
  let output = "";

  beforeAll(async () => {
    const server = await startServer(args);
    ({ child, base } = server);
    output = server.output();
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
    const unknown = await fetch(`${base}/no-such-page`);
    expect(unknown.status).toBe(404);
    // The site's own 404 (app/global-not-found.tsx), in the language of the address, as markup rather than
    // a payload the browser has to draw, and asking search engines to leave it alone.
    const page = await unknown.text();
    expect(page).not.toContain("__next_error__");
    expect(visibleText(page)).toContain(en.notFound.title);
    expect(page).toMatch(/name="robots"[^>]*noindex/);
    const unknownLao = await fetch(`${base}/lo/no-such-page`);
    expect(unknownLao.status).toBe(404);
    expect(unknownLao.headers.get("content-type")).toMatch(/text\/html/);
    const laoPage = await unknownLao.text();
    expect(laoPage).toMatch(/<html[^>]*lang="lo"/);
    expect(visibleText(laoPage)).toContain(lo.notFound.title);
    const invalid = await fetch(`${base}/api/leads/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Real-IP": "203.0.113.250" },
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

// An unknown URL must stay a 404 for a server started later, and Next.js must save nothing for it under
// .next/server/app: a saved entry can be served by a fresh process with status 200 (a soft 404), and any
// address a visitor invents would add files to the disk. Pages live under their locale since 0.23.0, so
// those are the paths to watch; the check sat on the pre-locale ones and passed whatever happened.
describe.skipIf(!built)("unknown pages after a restart", () => {
  it("still returns 404 from a fresh server, with nothing saved for the address", async () => {
    for (let run = 0; run < 2; run++) {
      const { child, base } = await startServer(["server.mjs"]);
      try {
        expect((await fetch(`${base}/no-such-page`)).status).toBe(404);
        expect((await fetch(`${base}/no/such/page`)).status).toBe(404);
        expect((await fetch(`${base}/lo/no-such-page`)).status).toBe(404);
        // Next saves its answer after replying, so look a moment later.
        await new Promise((resolve) => setTimeout(resolve, 1000));
        for (const saved of ["en/no-such-page.html", "lo/no-such-page.html", "en/no/such/page.html"]) {
          expect(existsSync(join(root, ".next", "server", "app", ...saved.split("/")))).toBe(false);
        }
      } finally {
        child.kill("SIGKILL");
      }
    }
  }, 150_000);
});
