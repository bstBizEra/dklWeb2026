/**
 * `pnpm verify` (scripts/verify-local.mjs) must stay a faithful copy of CI: every gate CI runs, in a form a
 * developer PC can run, with the database job behind TEST_DATABASE_URL. If ci.yml gains a gate, this fails
 * until the local command has it too.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// @ts-expect-error plain .mjs script without type declarations
const { databaseGates, gateEnv, gates } = await import("../../../scripts/verify-local.mjs");

type Gate = { name: string; args: string[]; env?: Record<string, string> };
const ci = readFileSync(join(process.cwd(), ".github", "workflows", "ci.yml"), "utf8");
const command = (gate: Gate) => `pnpm ${gate.args.join(" ")}`;

describe("pnpm verify", () => {
  it("runs every command CI runs, and nothing CI does not", () => {
    const ciCommands = [...ci.matchAll(/^\s+run: (pnpm (?!install).+)$/gm)].map((match) => match[1].trim());
    const local = [...(gates as Gate[]), ...(databaseGates("postgresql://x") as Gate[])].map(command);

    expect(ciCommands.length).toBeGreaterThan(0);
    for (const ciCommand of ciCommands) expect(local, ciCommand).toContain(ciCommand);
    expect(local.length).toBe(ciCommands.length);
  });

  it("builds without a database, as CI does, and gives the build a throwaway secret only when none is set", () => {
    const build = (gates as Gate[]).find((gate) => gate.name === "Build");
    expect(build?.env?.DATABASE_URL).toBe("");
    expect(build?.env?.PAYLOAD_SECRET).toBeTruthy();
  });

  it("points both database gates at the given database", () => {
    const [migrate, store] = databaseGates("postgresql://ci@127.0.0.1/empty") as Gate[];
    expect(migrate.env?.DATABASE_URL).toBe("postgresql://ci@127.0.0.1/empty");
    expect(store.env?.TEST_DATABASE_URL).toBe("postgresql://ci@127.0.0.1/empty");
  });

  it("keeps the test database away from the general gates, so database tests run only after the migrations", () => {
    const base = { PATH: "/bin", TEST_DATABASE_URL: "postgresql://x/empty" };
    const test = (gates as Gate[]).find((gate) => gate.name === "Test")!;
    const [, store] = databaseGates("postgresql://x/empty") as Gate[];

    expect(gateEnv(test, base).TEST_DATABASE_URL).toBeUndefined();
    expect(gateEnv(store, base).TEST_DATABASE_URL).toBe("postgresql://x/empty");
  });
});
