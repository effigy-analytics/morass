import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (path) =>
  JSON.parse(await readFile(resolve(repositoryRoot, path), "utf8"));

const [packageJson, packageLock, changelog, npmrc] = await Promise.all([
  readJson("package.json"),
  readJson("package-lock.json"),
  readFile(resolve(repositoryRoot, "CHANGELOG.md"), "utf8"),
  readFile(resolve(repositoryRoot, ".npmrc"), "utf8"),
]);

const errors = [];
const requireCondition = (condition, message) => {
  if (!condition) {
    errors.push(message);
  }
};

const version = packageJson.version;
requireCondition(
  version === packageLock.version,
  `package-lock.json version ${packageLock.version} does not match package.json ${version}`,
);
requireCondition(
  version === packageLock.packages?.[""]?.version,
  `package-lock.json root package version ${packageLock.packages?.[""]?.version} does not match package.json ${version}`,
);
requireCondition(
  !("publishConfig" in packageJson),
  "publishConfig must be absent; release jobs select their registry explicitly",
);
requireCondition(
  !("gitHead" in packageJson),
  "gitHead must not be committed; release CI stamps the canonical tarball",
);

const npmrcLines = npmrc
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#") && !line.startsWith(";"));
requireCondition(
  npmrcLines.length === 1 &&
    npmrcLines[0] === "@effigy-analytics:registry=https://registry.npmjs.org",
  ".npmrc must contain only the canonical @effigy-analytics npmjs mapping",
);
requireCondition(
  !npmrcLines.some((line) => /auth|token/i.test(line)),
  ".npmrc must not contain authentication directives",
);

const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
requireCondition(
  new RegExp(`^## ${escapedVersion}$`, "m").test(changelog),
  `CHANGELOG.md is missing a ## ${version} entry`,
);

const collectExportTargets = (value) => {
  if (typeof value === "string") {
    return [value];
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectExportTargets);
  }
  return [];
};

const exportTargets = new Set([
  packageJson.main,
  packageJson.module,
  packageJson.types,
  ...collectExportTargets(packageJson.exports),
]);
for (const target of exportTargets) {
  if (typeof target !== "string") {
    continue;
  }
  try {
    await access(resolve(repositoryRoot, target));
  } catch {
    errors.push(
      `declared package target does not exist after build: ${target}`,
    );
  }
}

const releaseTag = process.argv[2];
if (releaseTag) {
  requireCondition(
    releaseTag === `v${version}`,
    `release tag ${releaseTag} does not match package version v${version}`,
  );
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`release integrity: ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Release integrity verified for @effigy-analytics/morass@${version}${releaseTag ? ` (${releaseTag})` : ""}.`,
  );
}
