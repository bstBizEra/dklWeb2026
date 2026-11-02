// Runs the same gates as CI (.github/workflows/ci.yml) on this machine, so a change can be verified without
// GitHub Actions: on a developer PC (Windows/Laragon included), on the server, or while Actions is down.
//
//   pnpm verify                     version records, tests, lint, typecheck, build
//   TEST_DATABASE_URL=... pnpm verify
//                                   also CI's database job: apply every migration, then the PostgreSQL tests.
//                                   Point it at an EMPTY throwaway database, never at the site's database:
//                                   the tests write to it and CI runs the migrations from scratch.
//
// Every gate runs even if an earlier one fails, then a summary is printed. Exit code 1 if any gate failed.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const windows = process.platform === "win32";

// The same throwaway value CI uses, so the build can start without a real secret. Not a secret.
const ciSecret = "ci-build-only-not-a-secret-0000000000000000";

export const gates = [
  { name: "Version records agree", args: ["version:status"] },
  { name: "Test", args: ["test", "--", "--run"] },
  { name: "Lint", args: ["lint"] },
  { name: "Typecheck", args: ["typecheck"] },
  // Like CI: no database, so the site builds from its built-in content.
  { name: "Build", args: ["build"], env: { DATABASE_URL: "", PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || ciSecret } },
];

export const databaseGates = (url) => [
  { name: "Migrations apply", args: ["cms:migrate"], env: { DATABASE_URL: url, PAYLOAD_SECRET: ciSecret } },
  {
    name: "Rate limit store on PostgreSQL",
    args: ["vitest", "run", "src/lib/leads/rate-store.db.test.ts"],
    env: { TEST_DATABASE_URL: url },
  },
];

// Like CI, the general gates run without the test database: CI's test job has none, and the PostgreSQL tests
// must only run after the migrations gate has created their tables.
export function gateEnv(gate, base = process.env) {
  const env = { ...base, NEXT_TELEMETRY_DISABLED: "1" };
  delete env.TEST_DATABASE_URL;
  return { ...env, ...(gate.env ?? {}) };
}

function run(gate) {
  const started = Date.now();
  console.log(`\n[verify] ${gate.name}: pnpm ${gate.args.join(" ")}`);
  const result = spawnSync(windows ? "pnpm.cmd" : "pnpm", gate.args, {
    cwd: root,
    stdio: "inherit",
    env: gateEnv(gate),
    // pnpm.cmd is a batch file: Windows runs it only through a shell.
    shell: windows,
  });
  return { name: gate.name, ok: result.status === 0, seconds: Math.round((Date.now() - started) / 1000) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const url = process.env.TEST_DATABASE_URL?.trim();
  const plan = [...gates, ...(url ? databaseGates(url) : [])];
  const results = plan.map(run);

  console.log("\n[verify] Summary");
  for (const result of results) console.log(`  ${result.ok ? "PASS" : "FAIL"}  ${result.name} (${result.seconds}s)`);
  if (!url) console.log("  SKIP  Database gates (set TEST_DATABASE_URL to an empty throwaway database to run them)");

  const failed = results.filter((result) => !result.ok);
  console.log(failed.length ? `\n[verify] ${failed.length} gate(s) failed.` : "\n[verify] All gates passed.");
  process.exit(failed.length ? 1 : 0);
}
