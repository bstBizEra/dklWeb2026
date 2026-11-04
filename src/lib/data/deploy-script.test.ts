/**
 * scripts/server/dklao-deploy, run for real in a sandbox: a temporary home folder, real git repositories and
 * bundles, and stand-ins for pnpm, curl and pg_dump. Checks what matters on the server: each target deploys
 * only its own tags, production refuses to run unconfigured, a shared production instance closes preview
 * deploys, the database is dumped when it must be, and a failed build rolls back to the running version.
 */
import { execFileSync, spawnSync, type SpawnSyncOptionsWithStringEncoding } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

const script = join(process.cwd(), "scripts", "server", "dklao-deploy");
const gitEnv = { GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" };

let home: string;
let source: string;

const git = (cwd: string, ...args: string[]) => execFileSync("git", args, { cwd, env: { ...process.env, ...gitEnv }, encoding: "utf8" }).trim();

function write(path: string, content: string, mode?: number) {
  writeFileSync(path, content);
  if (mode) chmodSync(path, mode);
}

// A commit in the source repository, tagged; returns the tag.
function release(tagPrefix: string, run: number, changeMigrations = false): string {
  write(join(source, "release.txt"), `run ${run}\n`);
  if (changeMigrations) write(join(source, "src", "payload", "migrations", `m${run}.ts`), "// migration\n");
  git(source, "add", "-A");
  git(source, "commit", "-qm", `run ${run}`);
  const tag = `${tagPrefix}-${run}-${git(source, "rev-parse", "--short=7", "HEAD")}`;
  git(source, "tag", tag);
  return tag;
}

function bundle(tag: string): Buffer {
  const file = join(home, "upload.bundle");
  git(source, "bundle", "create", "-q", file, `refs/tags/${tag}`);
  return readFileSync(file);
}

function deploy(target: string | undefined, command: string, input: Buffer = Buffer.alloc(0), extraEnv: Record<string, string> = {}) {
  const args = target ? [script, target] : [script];
  const options: SpawnSyncOptionsWithStringEncoding = {
    input,
    env: { NODE_ENV: "test", PATH: process.env.PATH ?? "", HOME: home, SSH_ORIGINAL_COMMAND: command, ...gitEnv, ...extraEnv },
    encoding: "utf8",
    timeout: 60_000,
  };
  const result = spawnSync("bash", args, options);
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

function makeInstance(app: string) {
  execFileSync("git", ["clone", "-q", source, app]);
  git(app, "checkout", "-q", "v-initial");
  mkdirSync(join(app, ".next"), { recursive: true });
}

beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), "dkl-deploy-"));
  source = join(home, "source");
  mkdirSync(join(source, "src", "payload", "migrations"), { recursive: true });
  git(source, "init", "-q");
  write(join(source, "src", "payload", "migrations", "base.ts"), "// base\n");
  write(join(source, "release.txt"), "initial\n");
  git(source, "add", "-A");
  git(source, "commit", "-qm", "initial");
  git(source, "tag", "v-initial");
  makeInstance(join(home, "dklao-app"));

  const bin = join(home, "bin");
  mkdirSync(bin);
  mkdirSync(join(home, ".deploy"));
  mkdirSync(join(home, ".config"));
  // pnpm: install does nothing; build writes a build ID, or fails for the tag in FAIL_TAG.
  write(join(bin, "pnpm"), `#!/usr/bin/env bash
[[ "$1" == "build" ]] || exit 0
[[ -n "\${FAIL_TAG:-}" && "$(git describe --tags)" == "$FAIL_TAG" ]] && { echo "build broke"; exit 1; }
mkdir -p .next && git rev-parse HEAD > .next/BUILD_ID
printf '%s' "$APP_URL" > .next/APP_URL
`, 0o755);
  // curl: the running site serves the build ID of whichever instance owns that port.
  write(join(bin, "curl"), `#!/usr/bin/env bash
port="\${@: -1}"; port="\${port##*:}"; port="\${port%/}"
app="$HOME/dklao-app"; [[ "$port" == "3120" ]] && app="$HOME/dklao-live"
printf 'page %s\\n200' "$(cat "$app/.next/BUILD_ID" 2>/dev/null)"
`, 0o755);
  write(join(bin, "pg_dump"), `#!/usr/bin/env bash\necho "$*" >> "$HOME/pg_dump.calls"\necho "-- dump"\n`, 0o755);
  write(join(home, ".config", "dklao-site.env"), "DATABASE_URL=postgresql://preview\nAPP_URL=https://preview.dklao.com\n");
});

afterEach(() => rmSync(home, { recursive: true, force: true }));

describe.skipIf(process.platform === "win32")("server deploy script (sandbox)", () => {
  it("deploys a preview tag, restarts and confirms the new build", () => {
    const tag = release("preview", 1);
    const result = deploy("preview", `deploy ${tag}`, bundle(tag));

    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain(`deployed ${tag}`);
    expect(git(join(home, "dklao-app"), "describe", "--tags")).toBe(tag);
    expect(readFileSync(join(home, ".deploy", "restart-request"), "utf8")).toContain(tag);
    expect(readFileSync(join(home, "dklao-app", ".next", "APP_URL"), "utf8")).toBe("https://preview.dklao.com");
    // No migration changed: no dump.
    expect(existsSync(join(home, "pg_dump.calls"))).toBe(false);
  });

  it("keeps working with the old forced command, which gives no target", () => {
    const tag = release("preview", 2);
    expect(deploy(undefined, `deploy ${tag}`, bundle(tag)).status).toBe(0);
  });

  it("dumps the preview database before a release that changes migrations", () => {
    const tag = release("preview", 3, true);
    const result = deploy("preview", `deploy ${tag}`, bundle(tag));

    expect(result.status, result.output).toBe(0);
    expect(readFileSync(join(home, "pg_dump.calls"), "utf8")).toContain("--dbname=postgresql://preview");
    expect(existsSync(join(home, "backups", `preview-before-${tag}.sql`))).toBe(true);
  });

  it("rolls back to the running version when the build fails", () => {
    const tag = release("preview", 4);
    const result = deploy("preview", `deploy ${tag}`, bundle(tag), { FAIL_TAG: tag });

    expect(result.status).toBe(1);
    expect(result.output).toContain("rolled back to v-initial");
    expect(git(join(home, "dklao-app"), "describe", "--tags")).toBe("v-initial");
  });

  it("accepts only its own target's tags and only `deploy <tag>`", () => {
    const tag = release("production", 5);
    expect(deploy("preview", `deploy ${tag}`, bundle(tag)).status).toBe(2);
    expect(deploy("preview", "bash -i").status).toBe(2);
    expect(deploy("preview", `deploy ${tag} extra`).status).toBe(2);
    expect(deploy("staging", `deploy ${tag}`).status).toBe(2);
  });

  it("refuses to deploy production until it is configured", () => {
    const tag = release("production", 6);
    const result = deploy("production", `deploy ${tag}`, bundle(tag));
    expect(result.status).toBe(4);
    expect(result.output).toContain("production is not configured");
  });

  it("deploys a separate production instance and always dumps its database first", () => {
    makeInstance(join(home, "dklao-live"));
    write(join(home, ".config", "dklao-live.env"), 'DATABASE_URL="postgresql://live"\nAPP_URL="https://www.dklao.com"\n');
    write(
      join(home, ".config", "dklao-deploy-production.conf"),
      "# production instance\nAPP=~/dklao-live\nPORT=3120\nENV_FILE=~/.config/dklao-live.env\nRESTART_REQUEST=~/.deploy/restart-live\n",
    );
    const tag = release("production", 7);
    const result = deploy("production", `deploy ${tag}`, bundle(tag));

    expect(result.status, result.output).toBe(0);
    expect(git(join(home, "dklao-live"), "describe", "--tags")).toBe(tag);
    // The quoted APP_URL in the env file reaches the build without its quotes.
    expect(readFileSync(join(home, "dklao-live", ".next", "APP_URL"), "utf8")).toBe("https://www.dklao.com");
    // The preview instance is untouched.
    expect(git(join(home, "dklao-app"), "describe", "--tags")).toBe("v-initial");
    expect(readFileSync(join(home, "pg_dump.calls"), "utf8")).toContain("--dbname=postgresql://live");
    expect(readdirSync(join(home, "backups"))).toEqual([`production-before-${tag}.sql`]);
    expect(existsSync(join(home, ".deploy", "restart-live"))).toBe(true);
    expect(existsSync(join(home, ".deploy", "restart-request"))).toBe(false);
  });

  it("allows production on the preview instance only when confirmed, and then closes preview deploys", () => {
    const conf = join(home, ".config", "dklao-deploy-production.conf");
    const settings = `APP=~/dklao-app\nPORT=3110\nENV_FILE=~/.config/dklao-site.env\nRESTART_REQUEST=~/.deploy/restart-request\n`;
    write(conf, settings);
    const tag = release("production", 8);
    expect(deploy("production", `deploy ${tag}`, bundle(tag)).output).toContain("set SHARED_WITH_PREVIEW=yes");

    write(conf, `${settings}SHARED_WITH_PREVIEW=yes\n`);
    expect(deploy("production", `deploy ${tag}`, bundle(tag)).status).toBe(0);

    const preview = release("preview", 9);
    const refused = deploy("preview", `deploy ${preview}`, bundle(preview));
    expect(refused.status).toBe(5);
    expect(refused.output).toContain("preview deploys are closed");
  });

  it("refuses to build when the env file has no APP_URL", () => {
    write(join(home, ".config", "dklao-site.env"), "DATABASE_URL=postgresql://preview\n");
    const tag = release("preview", 11);
    const result = deploy("preview", `deploy ${tag}`, bundle(tag));

    expect(result.status).not.toBe(0);
    expect(result.output).toContain("APP_URL not found in");
    expect(git(join(home, "dklao-app"), "describe", "--tags")).toBe("v-initial");
  });

  it("stops on a setting it does not know", () => {
    write(join(home, ".config", "dklao-deploy-preview.conf"), "APP=~/dklao-app\nEXTRA_COMMAND=rm -rf /\n");
    const tag = release("preview", 10);
    const result = deploy("preview", `deploy ${tag}`, bundle(tag));
    expect(result.status).toBe(4);
    expect(result.output).toContain("unknown setting EXTRA_COMMAND");
  });
});
