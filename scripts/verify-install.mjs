import { execFileSync } from "node:child_process";
import {
  access,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registry = "https://registry.npmjs.org";
const reactVersion = process.env.MORASS_REACT_VERSION ?? "18.2.0";
const reactTypesVersion =
  process.env.MORASS_REACT_TYPES_VERSION ??
  (reactVersion.startsWith("18.") ? "18.2.0" : "19.2.17");
const reactDomTypesVersion =
  process.env.MORASS_REACT_DOM_TYPES_VERSION ??
  (reactVersion.startsWith("18.") ? "18.2.0" : "19.2.3");
const temporaryRoot = await mkdtemp(join(tmpdir(), "morass-install-"));
const userConfig = join(temporaryRoot, "anonymous.npmrc");
const consumerRoot = join(temporaryRoot, "consumer");

const environment = { ...process.env };
for (const key of Object.keys(environment)) {
  if (/(^|_)(?:auth(?:token)?|token)(?:_|$)/i.test(key)) {
    delete environment[key];
  }
}
environment.NPM_CONFIG_USERCONFIG = userConfig;
environment.NPM_CONFIG_REGISTRY = registry;
environment.NPM_CONFIG_CACHE = join(temporaryRoot, "npm-cache");

const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    cwd: consumerRoot,
    env: environment,
    stdio: "inherit",
    ...options,
  });

try {
  await mkdir(consumerRoot);
  await writeFile(userConfig, `registry=${registry}/\n`);
  await writeFile(
    join(consumerRoot, "package.json"),
    `${JSON.stringify({ name: "morass-install-smoke", private: true, type: "module" }, null, 2)}\n`,
  );

  let installSpec = process.argv[2];
  if (!installSpec) {
    const packOutput = execFileSync(
      "npm",
      ["pack", "--json", "--pack-destination", temporaryRoot],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: environment,
        stdio: ["ignore", "pipe", "inherit"],
      },
    );
    const parsedPackOutput = JSON.parse(packOutput);
    const packed = Array.isArray(parsedPackOutput)
      ? parsedPackOutput[0]
      : parsedPackOutput.filename
        ? parsedPackOutput
        : Object.values(parsedPackOutput)[0];
    if (!packed?.filename) {
      throw new Error(`npm pack did not return a filename: ${packOutput}`);
    }
    installSpec = join(temporaryRoot, packed.filename);
  }

  run("npm", [
    "install",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    "--package-lock=false",
    `--registry=${registry}`,
    `--userconfig=${userConfig}`,
    "--save-exact",
    `react@${reactVersion}`,
    `react-dom@${reactVersion}`,
    `@types/react@${reactTypesVersion}`,
    `@types/react-dom@${reactDomTypesVersion}`,
    "@types/scheduler@0.16.8",
    "typescript@6.0.3",
    installSpec,
  ]);

  const packageRoot = join(
    consumerRoot,
    "node_modules",
    "@effigy-analytics",
    "morass",
  );
  const expectedFiles = [
    "LICENSE",
    "README.md",
    "package.json",
    "docs/migrations/0.7.md",
    "docs/public-contract.md",
    "dist/index.d.ts",
    "dist/morass.cjs",
    "dist/morass.js",
    "dist/reminders.cjs",
    "dist/reminders.d.ts",
    "dist/reminders.js",
    "dist/styles.css",
  ];
  await Promise.all(
    expectedFiles.map((path) => access(join(packageRoot, path))),
  );

  run("node", [
    "--input-type=module",
    "--eval",
    `
      import { createElement } from "react";
      import { renderToStaticMarkup } from "react-dom/server";
      import { Button, themes, validateTheme } from "@effigy-analytics/morass";
      import { formatRelativeDue } from "@effigy-analytics/morass/reminders";
      const html = renderToStaticMarkup(createElement(Button, null, "Ready"));
      if (!html.includes("Ready") || !validateTheme(themes.light).ok) process.exit(1);
      if (typeof formatRelativeDue !== "function") process.exit(1);
      if (!import.meta.resolve("@effigy-analytics/morass/styles.css").startsWith("file:")) process.exit(1);
    `,
  ]);

  await writeFile(
    join(consumerRoot, "smoke.tsx"),
    `import { Button, Modal, Tabs, TextField, themes, validateTheme } from "@effigy-analytics/morass";
import { formatRelativeDue } from "@effigy-analytics/morass/reminders";

const change = (_value: "all" | "open") => {};
export const consumer = (
  <>
    <Button>Ready</Button>
    <TextField label="Name" helpText="Required" />
    <Tabs mode="selection" aria-label="Filters" tabs={[{ label: "All", value: "all" }]} value="all" onValueChange={change} />
    <Tabs mode="tabs" aria-label="Sections" tabs={[{ label: "Open", value: "open" }]} value="open" onValueChange={change}><p>Open items</p></Tabs>
    <Modal open={false} title="Confirm" onClose={() => {}}>Body</Modal>
  </>
);
export const due: string = formatRelativeDue(2);
export const valid: boolean = validateTheme(themes.light).ok;
`,
  );
  await writeFile(
    join(consumerRoot, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          jsx: "react-jsx",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          noEmit: true,
          skipLibCheck: false,
          strict: true,
          target: "ES2022",
        },
        include: ["smoke.tsx"],
      },
      null,
      2,
    )}\n`,
  );
  run("node", [
    join(consumerRoot, "node_modules", "typescript", "bin", "tsc"),
    "--project",
    join(consumerRoot, "tsconfig.json"),
  ]);
  run("node", [
    "--eval",
    `
      const morass = require("@effigy-analytics/morass");
      const reminders = require("@effigy-analytics/morass/reminders");
      if (typeof morass.Button !== "function" || typeof reminders.formatRelativeDue !== "function") process.exit(1);
      require.resolve("@effigy-analytics/morass/styles.css");
    `,
  ]);

  const installedPackage = JSON.parse(
    await readFile(join(packageRoot, "package.json"), "utf8"),
  );
  console.log(
    `Anonymous consumer install and typecheck verified for ${installedPackage.name}@${installedPackage.version} with React ${reactVersion} / types ${reactTypesVersion}.`,
  );
} finally {
  await rm(temporaryRoot, { force: true, recursive: true });
}
