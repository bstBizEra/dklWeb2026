/**
 * Automatic preview deploys (.github/workflows/deploy-preview.yml and scripts/server/dklao-deploy).
 * The workflow must keep secrets in the preview environment, never deploy forks or unlabelled pull
 * requests, and run one deploy at a time. The server script must accept only its own command, back up the
 * database before new migrations, and roll back when a step fails.
 */
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), "utf8").replace(/\r\n/g, "\n");
const workflow = read(".github", "workflows", "deploy-preview.yml");
const ci = read(".github", "workflows", "ci.yml");
const script = read("scripts", "server", "dklao-deploy");

describe("deploy-preview workflow", () => {
  it("deploys main, labelled pull requests from this repository, and manual runs only", () => {
    expect(workflow).toMatch(/push:\s*\n\s*branches: \[main\]/);
    expect(workflow).toContain("types: [labeled, synchronize]");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("contains(github.event.pull_request.labels.*.name, 'deploy:preview')");
    expect(workflow).toContain("github.event.pull_request.head.repo.full_name == github.repository");
  });

  it("keeps secrets in the preview environment and permissions read-only", () => {
    expect(workflow).toMatch(/environment:\s*\n\s*name: preview/);
    expect(workflow).toMatch(/permissions:\s*\n\s*contents: read/);
    for (const name of ["PREVIEW_SSH_KEY", "PREVIEW_SSH_KNOWN_HOSTS", "PREVIEW_SSH_HOST", "PREVIEW_SSH_PORT"]) {
      expect(workflow).toContain(`secrets.${name}`);
    }
    // Secrets go to a key file and known_hosts, never echoed to the log.
    expect(workflow).not.toMatch(/echo\s+"?\$SSH_KEY/);
    expect(workflow).toContain("StrictHostKeyChecking=yes");
    expect(workflow).toContain("rm -f ~/.ssh/preview_deploy");
  });

  it("checks before deploying, runs one deploy at a time and confirms the new version is served", () => {
    expect(workflow).toContain("needs: verify");
    expect(workflow).toMatch(/group: preview-deploy\s*\n\s*cancel-in-progress: false/);
    for (const gate of ["pnpm version:status", "pnpm test -- --run", "pnpm lint", "pnpm typecheck"]) {
      expect(workflow).toContain(gate);
    }
    expect(workflow).toContain('"deploy ${TAG}" < "$RUNNER_TEMP/deploy.bundle"');
    expect(workflow).toContain("favicon.ico?v=${VERSION}");
  });

  it("skips a push to main with a notice until the secrets exist, but fails a requested deploy", () => {
    expect(workflow).toContain('echo "ready=false" >> "$GITHUB_OUTPUT"');
    expect(workflow).toContain('elif [ "$GITHUB_EVENT_NAME" = "push" ]; then');
    expect(workflow).toContain("::error::Preview secrets are not set");
    expect(workflow.match(/if: steps\.setup\.outputs\.ready == 'true'/g)?.length).toBe(3);
  });

  it("leaves CI check-only", () => {
    expect(ci).toContain("it deploys nothing and holds no secrets");
    expect(ci).not.toMatch(/secrets\.[A-Z_]/);
  });
});

describe("server deploy script", () => {
  it("is executable bash that stops on errors", () => {
    expect(script.startsWith("#!/usr/bin/env bash\n")).toBe(true);
    expect(script).toContain("set -euo pipefail");
    // Windows file stats never carry the Unix exec bit; git's index (100755) still does, and CI checks it on Linux.
    if (process.platform !== "win32") expect(statSync(join(process.cwd(), "scripts", "server", "dklao-deploy")).mode & 0o111).not.toBe(0);
  });

  it("accepts only `deploy <target>-<run>-<sha>` (behaviour: deploy-script.test.ts)", () => {
    expect(script).toContain('read -r action tag extra <<<"${SSH_ORIGINAL_COMMAND:-}"');
    expect(script).toContain('"${tag:-}" =~ ^${target}-[0-9]+-[0-9a-f]{7,40}$');
    expect(script).toContain('-n "${extra:-}"');
  });

  it("verifies the bundle and limits its size", () => {
    expect(script).toContain('head -c "$MAX_BUNDLE_BYTES"');
    expect(script).toContain('git bundle verify --quiet "$bundle"');
  });

  it("dumps the database before a release that changes migrations, and stops if the dump fails", () => {
    expect(script).toContain("git diff --quiet \"$previous\" \"$tag\" -- src/payload/migrations");
    expect(script).toContain('[[ "$BACKUP_ALWAYS" != "yes" ]]');
    expect(script).toContain('pg_dump --dbname="$url" > "$dump" || { echo "database dump failed" >&2; return 1; }');
    expect(script).toContain("backup_database && restart && healthy");
  });

  it("restarts only its own service and rolls back when any step fails", () => {
    // No sudo (it cannot work in cPanel's jailshell): the script asks root's path unit for a restart.
    expect(script).not.toMatch(/^\s*sudo\b/m);
    expect(script).toContain('RESTART_REQUEST="$HOME/.deploy/restart-request"');
    expect(script).toContain('> "$RESTART_REQUEST"');
    // Healthy means the new build is served, so an old process that has not restarted never passes.
    expect(script).toContain('id="$(cat "$APP/.next/BUILD_ID")"');
    expect(script).toContain('"$code" == "200" && "$page" == *"$id"*');
    expect(script).toContain('git checkout --quiet --force "$1" && pnpm install --frozen-lockfile && pnpm build');
    expect(script).toContain('build "$previous"');
    expect(script).toMatch(/exit 1\n$/);
  });
});
