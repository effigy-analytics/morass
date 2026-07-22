import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [registry, tarballArgument, expectedGitHead, option] =
  process.argv.slice(2);

if (!registry || !tarballArgument || !expectedGitHead) {
  console.error(
    "Usage: node scripts/verify-registry-artifact.mjs <registry> <tarball> <git-head> [--wait]",
  );
  process.exit(1);
}

const packageJson = JSON.parse(
  await readFile(resolve(repositoryRoot, "package.json"), "utf8"),
);
const tarball = await readFile(resolve(repositoryRoot, tarballArgument));
const expectedIntegrity = `sha512-${createHash("sha512").update(tarball).digest("base64")}`;
const spec = `${packageJson.name}@${packageJson.version}`;
const waitForRegistry = option === "--wait";

function inspectRegistry() {
  const result = spawnSync(
    "npm",
    [
      "view",
      spec,
      "dist.integrity",
      "gitHead",
      "--json",
      `--registry=${registry}`,
    ],
    { cwd: repositoryRoot, encoding: "utf8", env: process.env },
  );

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const diagnostic = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    if (/\bE404\b/.test(diagnostic)) {
      return null;
    }
    throw new Error(
      `npm view failed for ${spec} on ${registry} (exit ${result.status}):\n${diagnostic.trim()}`,
    );
  }

  const parsed = JSON.parse(result.stdout);
  const metadata = Array.isArray(parsed)
    ? parsed[0]
    : parsed["dist.integrity"]
      ? parsed
      : Object.values(parsed)[0];
  if (!metadata || typeof metadata !== "object") {
    throw new Error(
      `npm view returned unsupported metadata for ${spec}: ${result.stdout}`,
    );
  }
  return {
    gitHead: metadata.gitHead,
    integrity: metadata["dist.integrity"],
  };
}

let metadata = null;
const attempts = waitForRegistry ? 7 : 1;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  metadata = inspectRegistry();
  if (metadata !== null) {
    break;
  }
  if (attempt < attempts) {
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 5_000));
  }
}

if (metadata === null) {
  console.error(`${spec} is not present on ${registry}.`);
  process.exit(3);
}

const mismatches = [];
if (metadata.integrity !== expectedIntegrity) {
  mismatches.push(
    `dist.integrity ${metadata.integrity ?? "<missing>"} does not match local ${expectedIntegrity}`,
  );
}
if (metadata.gitHead !== expectedGitHead) {
  mismatches.push(
    `gitHead ${metadata.gitHead ?? "<missing>"} does not match release ${expectedGitHead}`,
  );
}
if (mismatches.length > 0) {
  for (const mismatch of mismatches) {
    console.error(`${registry}: ${mismatch}`);
  }
  process.exit(1);
}

console.log(
  `Verified ${spec} on ${registry}: tarball integrity and gitHead match the release.`,
);
