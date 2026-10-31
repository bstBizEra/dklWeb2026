/**
 * Production deploys (.github/workflows/deploy-production.yml): started by a person only, from main only,
 * for the version main is actually at, after every gate including the build, behind the "production"
 * environment's approval, with its own key and queue, and confirmed on the live site afterwards.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), "utf8").replace(/\r\n/g, "\n");
const workflow = read(".github", "workflows", "deploy-production.yml");
const preview = read(".github", "workflows", "deploy-preview.yml");
const on = workflow.slice(workflow.indexOf("\non:"), workflow.indexOf("\npermissions:"));

describe("deploy-production workflow", () => {
  it("runs only when a person starts it, naming a version", () => {
    expect(on).toContain("workflow_dispatch:");
    expect(on).not.toMatch(/\n\s+(push|pull_request|schedule|release):/);
    expect(workflow).toMatch(/version:\s*\n\s*description: .*\n\s*required: true/);
  });

  it("deploys main only, and only when main is at the requested version", () => {
    expect(workflow).toContain("if: github.ref == 'refs/heads/main'");
    expect(workflow).toMatch(/ref: main\n/);
    expect(workflow).toContain(`actual="$(node -p 'require("./package.json").version')"`);
    expect(workflow).toContain('if [ "$actual" != "$REQUESTED" ]; then');
    // The deploy job ships exactly the commit the checks ran on.
    expect(workflow).toContain("DEPLOY_SHA: ${{ needs.verify.outputs.sha }}");
  });

  it("runs every gate, including the build, before the approval step", () => {
    for (const gate of ["pnpm version:status", "pnpm test -- --run", "pnpm lint", "pnpm typecheck", "pnpm build"]) {
      expect(workflow).toContain(gate);
    }
    expect(workflow).toContain("needs: verify");
    expect(workflow).toMatch(/environment:\s*\n\s*name: production/);
  });

  it("uses its own secrets, key file and queue, apart from the preview", () => {
    for (const name of ["PRODUCTION_SSH_KEY", "PRODUCTION_SSH_KNOWN_HOSTS", "PRODUCTION_SSH_HOST", "PRODUCTION_SSH_PORT"]) {
      expect(workflow).toContain(`secrets.${name}`);
    }
    expect(workflow).not.toContain("secrets.PREVIEW_");
    expect(preview).not.toContain("secrets.PRODUCTION_");
    expect(workflow).toMatch(/group: production-deploy\s*\n\s*cancel-in-progress: false/);
    expect(workflow).toMatch(/permissions:\s*\n\s*contents: read/);
    expect(workflow).toContain("StrictHostKeyChecking=yes");
    expect(workflow).not.toMatch(/echo\s+"?\$SSH_KEY/);
    expect(workflow).toContain("rm -f ~/.ssh/production_deploy");
  });

  it("sends production tags, fails loudly without secrets, and confirms the live site serves the version", () => {
    expect(workflow).toContain('tag="production-${GITHUB_RUN_NUMBER}-${DEPLOY_SHA::7}"');
    expect(workflow).toContain('"deploy ${TAG}" < "$RUNNER_TEMP/deploy.bundle"');
    expect(workflow).toContain("::error::Production secrets are not set");
    expect(workflow).not.toContain("ready=false");
    expect(workflow).toContain("favicon.ico?v=${VERSION}");
  });
});
