import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const checker = join(root, "scripts/check-repo-contract.mjs");
const exception = {
  control: "common.agents",
  ref_or_path: "AGENTS.md",
  reason: "Fixture historical decision",
  owner: "fixture",
  decision: "fixture decision",
  approval: "fixture approval",
  expires_at: "2000-01-01T00:00:00Z",
};

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), "morass-contract-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  cpSync(join(root, ".repo"), join(dir, ".repo"), { recursive: true });
  // A preload denies network and process execution in the validator itself.
  const deny = join(dir, "deny.cjs");
  writeFileSync(
    deny,
    `const fs = require("node:fs");
const blocked = () => { fs.writeFileSync(${JSON.stringify(join(dir, "blocked-call"))}, "attempt"); throw new Error("forbidden I/O"); };
for (const [module, keys] of [["node:net", ["connect", "createConnection", "createServer"]], ["node:tls", ["connect"]], ["node:http", ["request", "get"]], ["node:https", ["request", "get"]], ["node:dns", ["lookup", "resolve"]], ["node:child_process", ["exec", "execSync", "execFile", "execFileSync", "spawn", "spawnSync", "fork"]]]) {
  const target = require(module); for (const key of keys) target[key] = blocked;
}
require("node:net").Socket.prototype.connect = blocked;
globalThis.fetch = blocked;
require("node:module").syncBuiltinESMExports();
`,
  );
  return {
    dir,
    read: (file) => JSON.parse(readFileSync(join(dir, ".repo", file), "utf8")),
    write: (file, value) =>
      writeFileSync(join(dir, ".repo", file), JSON.stringify(value)),
    raw: (file, value) => writeFileSync(join(dir, ".repo", file), value),
    run: (args = []) => {
      const result = spawnSync(
        process.execPath,
        ["--require", deny, checker, ...args],
        { cwd: dir, encoding: "utf8", timeout: 5000 },
      );
      assert.equal(
        result.error,
        undefined,
        "validator must finish without blocking",
      );
      assert.equal(
        existsSync(join(dir, "blocked-call")),
        false,
        "no network or child process attempts",
      );
      return result;
    },
    refresh: () => {
      const lock = JSON.parse(
        readFileSync(join(dir, ".repo/policy.lock.json"), "utf8"),
      );
      for (const name of Object.keys(lock.files))
        lock.files[name] = createHash("sha256")
          .update(readFileSync(join(dir, ".repo/policy", name)))
          .digest("hex");
      writeFileSync(join(dir, ".repo/policy.lock.json"), JSON.stringify(lock));
    },
  };
}

function invalid(result, message) {
  assert.equal(result.status, 2);
  assert.match(result.stderr, message);
  assert.equal(result.stdout, "");
  assert.doesNotMatch(result.stderr, /PRIVATE-SENTINEL/);
}

test("valid bundled declaration succeeds offline without executing command data", (t) => {
  const f = fixture(t),
    doc = f.read("contract.json");
  doc.commands.check.run = `touch ${join(f.dir, "command-sentinel")}`;
  f.write("contract.json", doc);
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Contract valid/);
  assert.equal(existsSync(join(f.dir, "command-sentinel")), false);
});

for (const [name, mutate, message] of [
  [
    "identity",
    (d) => (d.repository = "effigy-analytics/other"),
    /identity mismatch/,
  ],
  [
    "unknown field",
    (d) => (d.secret = "PRIVATE-SENTINEL"),
    /additionalProperties/,
  ],
  ["path escape", (d) => (d.commands.check.cwd = "../escape"), /invalid/],
  [
    "unsafe runtime path",
    (d) => (d.runtimes[0].source = "/tmp/escape"),
    /invalid/,
  ],
  ["unsafe CI ref", (d) => (d.ci.refs[0].ref = "../escape"), /unsafe CI ref/],
  [
    "duplicate CI ref",
    (d) => d.ci.refs.push({ ...d.ci.refs[0], workflows: ["different.yml"] }),
    /duplicate CI ref/,
  ],
  [
    "missing integration CI",
    (d) => (d.delivery.integration_refs = ["unlisted"]),
    /integration ref/,
  ],
  [
    "duplicate CI context",
    (d) =>
      d.ci.refs[0].required_contexts.push(d.ci.refs[0].required_contexts[0]),
    /invalid|duplicate CI context/,
  ],
  [
    "undeclared workflow",
    (d) => (d.ci.command_evidence[0].workflow = "unlisted.yml"),
    /undeclared workflow/,
  ],
  [
    "required command not applicable",
    (d) => (d.commands.test = { status: "not_applicable", reason: "fixture" }),
    /required profile command/,
  ],
  [
    "unknown exception control",
    (d) => (d.exceptions = [{ ...exception, control: "unknown" }]),
    /unknown control/,
  ],
  [
    "unsafe exception scope",
    (d) => (d.exceptions = [{ ...exception, ref_or_path: "../escape" }]),
    /unsafe exception/,
  ],
  [
    "duplicate exception scope",
    (d) => (d.exceptions = [exception, { ...exception, reason: "other" }]),
    /duplicate exception scope/,
  ],
])
  test(`rejects ${name}`, (t) => {
    const f = fixture(t),
      doc = f.read("contract.json");
    mutate(doc);
    f.write("contract.json", doc);
    invalid(f.run(), message);
  });

for (const value of [
  "2026-02-30T00:00:00Z",
  "0000-01-01T00:00:00Z",
  "2026-10-13T24:00:00Z",
  "2026-10-13T00:00:60Z",
  "2026-10-13T00:00:00+01:00",
  "2026-10-13T00:00:00Z\n",
  "2026-10-13",
])
  test(`rejects invalid UTC date ${JSON.stringify(value)}`, (t) => {
    const f = fixture(t),
      doc = f.read("contract.json");
    doc.exceptions = [{ ...exception, expires_at: value }];
    f.write("contract.json", doc);
    invalid(f.run(), /format/);
  });
for (const value of [
  "2000-01-01T00:00:00Z",
  "2024-02-29T12:34:56.123456+00:00",
])
  test(`accepts historical UTC metadata ${value} without evaluating waivers`, (t) => {
    const f = fixture(t),
      doc = f.read("contract.json");
    doc.exceptions = [{ ...exception, expires_at: value }];
    f.write("contract.json", doc);
    assert.equal(f.run().status, 0);
  });

for (const file of [
  "contract.json",
  "policy.lock.json",
  "policy/profiles.json",
]) {
  for (const token of ["1.0", "1e0", "true"])
    test(`rejects exact version token ${token} in ${file}`, (t) => {
      const f = fixture(t);
      f.raw(
        file,
        JSON.stringify(f.read(file)).replace(
          '"schema_version":1',
          `"schema_version":${token}`,
        ),
      );
      if (file.startsWith("policy/")) f.refresh();
      invalid(f.run(), /exact integer|unsupported schema version/);
    });
}
for (const token of ["15368.0", "15368e0", "9007199254740993", "true"])
  test(`rejects inexact App id ${token}`, (t) => {
    const f = fixture(t),
      doc = f.read("contract.json");
    doc.ci.refs[0].required_contexts[0].app_id = "TOKEN";
    f.raw("contract.json", JSON.stringify(doc).replace('"TOKEN"', token));
    invalid(f.run(), /exact integer/);
  });

for (const [name, raw] of [
  [
    "duplicate nested keys",
    '{"name":"PRIVATE-SENTINEL","na\\u006de":"second"}',
  ],
  ["comment", '{/* PRIVATE-SENTINEL */ "schema_version":1}'],
  ["trailing comma", '{"schema_version":1,}'],
  ["nonfinite number", '{"schema_version":1,"x":1e999}'],
  ["non-object", "[]"],
  ["invalid UTF8", Buffer.from([0x7b, 0x22, 0xff, 0x22, 0x3a, 0x31, 0x7d])],
])
  test(`rejects JSON ${name}`, (t) => {
    const f = fixture(t);
    f.raw("contract.json", raw);
    invalid(f.run(), /JSON/);
  });

for (const [name, mutate, message] of [
  [
    "remote ref",
    (s) => (s.properties.owner.$ref = "https://invalid.example/schema"),
    /nonlocal/,
  ],
  [
    "unknown ref",
    (s) => (s.properties.owner.$ref = "missing.schema.json"),
    /nonlocal/,
  ],
  [
    "missing pointer",
    (s) => (s.properties.owner.$ref = "#/$defs/missing"),
    /unresolved/,
  ],
  ["anchor ref", (s) => (s.properties.owner.$ref = "#anchor"), /fragment/],
  [
    "nested identity",
    (s) => (s.properties.owner.$id = "other.json"),
    /nested identity/,
  ],
  [
    "dynamic ref",
    (s) => (s.properties.owner.$dynamicRef = "#anchor"),
    /dynamic/,
  ],
  [
    "unsupported format",
    (s) => (s.properties.owner.format = "date-time"),
    /unsupported format/,
  ],
  ["schema identity", (s) => (s.$id = "other.json"), /identity/],
  [
    "schema dialect",
    (s) => (s.$schema = "https://invalid.example/schema"),
    /identity or dialect/,
  ],
  ["async validation", (s) => (s.$async = true), /asynchronous/],
  [
    "schema structure",
    (s) => (s.properties.owner.type = "unknown"),
    /structure/,
  ],
])
  test(`rejects schema ${name} even with refreshed digest`, (t) => {
    const f = fixture(t),
      schema = f.read("policy/contract.schema.json");
    mutate(schema);
    f.write("policy/contract.schema.json", schema);
    f.refresh();
    invalid(f.run(), message);
  });
test("schema walker leaves instance-valued const data opaque", (t) => {
  const f = fixture(t),
    schema = f.read("policy/contract.schema.json");
  schema.$defs.opaque = {
    const: { $ref: "https://invalid.example/instance", $id: "opaque" },
  };
  f.write("policy/contract.schema.json", schema);
  f.refresh();
  assert.equal(f.run().status, 0);
});

for (const [name, mutate, message] of [
  [
    "digest mismatch",
    (f) =>
      f.raw(
        "policy/profiles.json",
        readFileSync(join(f.dir, ".repo/policy/profiles.json"), "utf8") + " ",
      ),
    /digest mismatch/,
  ],
  [
    "lock source",
    (f) => {
      const d = f.read("policy.lock.json");
      d.repository = "effigy-analytics/other";
      f.write("policy.lock.json", d);
    },
    /source repository/,
  ],
  [
    "lock commit newline",
    (f) => {
      const d = f.read("policy.lock.json");
      d.commit += "\n";
      f.write("policy.lock.json", d);
    },
    /invalid commit/,
  ],
  [
    "forbidden inventory",
    (f) => {
      const d = f.read("policy.lock.json");
      d.files["catalog.json"] = "a".repeat(64);
      f.write("policy.lock.json", d);
    },
    /forbidden bundle/,
  ],
  [
    "duplicate profiles control",
    (f) => {
      const d = f.read("policy/profiles.json");
      d.profiles["ts-library"][0].id = d.common_controls[0].id;
      f.write("policy/profiles.json", d);
      f.refresh();
    },
    /duplicate control/,
  ],
  [
    "oversized file",
    (f) => f.raw("contract.json", " ".repeat(2 * 1024 * 1024 + 1)),
    /size limit/,
  ],
  [
    "file symlink",
    (f) => {
      const path = join(f.dir, ".repo/contract.json");
      rmSync(path);
      symlinkSync(join(root, ".repo/contract.json"), path);
    },
    /symlink/,
  ],
  [
    "parent symlink",
    (f) => {
      rmSync(join(f.dir, ".repo/policy"), { recursive: true });
      symlinkSync(join(root, ".repo/policy"), join(f.dir, ".repo/policy"));
    },
    /symlink/,
  ],
  [
    "FIFO",
    (f) => {
      const path = join(f.dir, ".repo/contract.json");
      rmSync(path);
      assert.equal(spawnSync("mkfifo", [path]).status, 0);
    },
    /regular file/,
  ],
  [
    "directory input",
    (f) => {
      rmSync(join(f.dir, ".repo/contract.json"));
      mkdirSync(join(f.dir, ".repo/contract.json"));
    },
    /regular file/,
  ],
])
  test(`rejects ${name}`, (t) => {
    const f = fixture(t);
    mutate(f);
    invalid(f.run(), message);
  });
test("rejects input path traversal before normalization", (t) => {
  const f = fixture(t);
  invalid(f.run(["--contract", ".repo/../.repo/contract.json"]), /traversal/);
});
