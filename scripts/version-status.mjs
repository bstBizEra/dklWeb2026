import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

const packageJson = readJson("package.json");
const versionJson = readJson("VERSION.json");
const changelog = readFileSync(join(root, "con_agents", "CHANGELOG.md"), "utf8");
const topRelease = changelog.match(/^## \[([0-9]+\.[0-9]+\.[0-9]+)\]\s+-\s+([0-9]{4}-[0-9]{2}-[0-9]{2})/m);

const failures = [];

if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(versionJson.version)) {
  failures.push(`VERSION.json version is not semantic: ${versionJson.version}`);
}

if (packageJson.version !== versionJson.version) {
  failures.push(`package.json version ${packageJson.version} does not match VERSION.json ${versionJson.version}`);
}

if (!topRelease) {
  failures.push("con_agents/CHANGELOG.md is missing a top release heading like ## [0.4.0] - YYYY-MM-DD");
} else {
  const [, changelogVersion, changelogDate] = topRelease;

  if (changelogVersion !== versionJson.version) {
    failures.push(`CHANGELOG top version ${changelogVersion} does not match VERSION.json ${versionJson.version}`);
  }

  if (changelogDate !== versionJson.releaseDate) {
    failures.push(`CHANGELOG top date ${changelogDate} does not match VERSION.json releaseDate ${versionJson.releaseDate}`);
  }
}

const versioningDoc = readFileSync(join(root, "con_agents", "VERSIONING.md"), "utf8");
const versioningFields = {
  "Current version": versionJson.version,
  "Change level": versionJson.changeLevel,
  "Release date": versionJson.releaseDate,
};

for (const [label, expected] of Object.entries(versioningFields)) {
  const found = versioningDoc.match(new RegExp(`^${label}: (.+)$`, "m"))?.[1]?.trim();

  if (found !== expected) {
    failures.push(`con_agents/VERSIONING.md ${label} ${found ?? "(missing)"} does not match VERSION.json ${expected}`);
  }
}

if (!["major", "minor", "patch"].includes(versionJson.changeLevel)) {
  failures.push(`VERSION.json changeLevel must be major, minor, or patch; received ${versionJson.changeLevel}`);
}

if (failures.length > 0) {
  console.error("[version] DK LAO version tracking failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`[version] DK LAO ${versionJson.version}`);
console.log(`[version] Change level: ${versionJson.changeLevel}`);
console.log(`[version] Release date: ${versionJson.releaseDate}`);
console.log(`[version] Package, VERSION.json, CHANGELOG, and VERSIONING.md are aligned.`);
