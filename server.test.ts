// @vitest-environment node
/**
 * The Passenger start file (server.mjs) serves the built app: it starts on the port it is given, answers
 * pages and the lead API, and exits cleanly on SIGTERM (how Passenger and cPanel stop an app).
 * Needs a finished `pnpm build`; without one the test is skipped (CI runs the tests before building).
 */
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
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

// Since dynamicParams is true, a request for an invented address leaves a saved answer behind, and a run
// killed mid-write leaves a torn one. Every deploy builds .next anew, so the tests start from that state
// too: without this, one run's leftovers decide the next run's statuses.
const savedPaths = ["en/no-such-page", "lo/no-such-page", "en/no"];
function clearSavedAnswers() {
  if (!built) return;
  for (const path of savedPaths) {
    // .segments is a directory, the others are files.
    for (const extension of ["", ".html", ".meta", ".rsc", ".segments"]) {
      rmSync(join(root, ".next", "server", "app", ...path.split("/")) + extension, { force: true, recursive: true });
    }
  }
}
beforeAll(clearSavedAnswers);

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
    // The site's own 404 page, in the language of the address, not Next.js's bare built-in one, and never
    // offered to a search engine whatever status a saved copy of it is later served with.
    const page = await unknown.text();
    expect(page).toContain(en.notFound.title);
    expect(page).toMatch(/name="robots"[^>]*noindex/);
    const unknownLao = await fetch(`${base}/lo/no-such-page`);
    expect(unknownLao.status).toBe(404);
    expect(await unknownLao.text()).toContain(lo.notFound.title);
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

// An unknown URL must stay a 404 for a server started later. Since dynamicParams is true, Next does keep
// the not-found render for an invented address (app/en/..., app/lo/... — pages moved under their locale in
// 0.23.0), so that a repeat hit costs nothing; what matters is that the saved entry records status 404. A
// 200 there would be a soft 404: a fresh process would serve "not found" as a success.
describe.skipIf(!built)("unknown pages after a restart", () => {
  // Again here: the servers above were killed the moment their last request finished, which can leave a
  // torn entry behind, and this test is about what a fresh process makes of a complete one.
  beforeAll(clearSavedAnswers);

  const savedStatus = (...parts: string[]) => {
    const file = join(root, ".next", "server", "app", ...parts);
    const text = existsSync(file) ? readFileSync(file, "utf8") : "";
    // Empty means a write cut short by the kill below, not a status this build chose.
    return text ? (JSON.parse(text) as { status?: number }).status : undefined;
  };

  it("still returns 404 from a fresh server", async () => {
    for (let run = 0; run < 2; run++) {
      const { child, base } = await startServer(["server.mjs"]);
      try {
        expect((await fetch(`${base}/no-such-page`)).status).toBe(404);
        expect((await fetch(`${base}/no/such/page`)).status).toBe(404);
        expect((await fetch(`${base}/lo/no-such-page`)).status).toBe(404);
        for (const saved of [savedStatus("en", "no-such-page.meta"), savedStatus("lo", "no-such-page.meta")]) {
          if (saved !== undefined) expect(saved).toBe(404);
        }
        // Next saves its answer after replying; give that write the moment a graceful stop would allow.
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } finally {
        child.kill("SIGKILL");
      }
    }
  }, 150_000);
});
