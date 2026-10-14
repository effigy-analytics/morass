// Offline declaration validation only. Commands remain data; no schema retrieval.
import Ajv2020 from "ajv/dist/2020.js";
import { parseTree } from "jsonc-parser";
import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const POLICY_REPOSITORY = "effigy-analytics/effigy-analytics-umbrella";
const SCHEMA_NAMES = [
  "contract.schema.json",
  "profiles.schema.json",
  "policy-lock.schema.json",
];
const PUBLIC_FILES = [...SCHEMA_NAMES, "profiles.json"].sort();
const DIALECT = "https://json-schema.org/draft/2020-12/schema";
class InputError extends Error {}
const reject = (message) => {
  throw new InputError(message);
};
const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const exactKeys = (value, keys) =>
  object(value) &&
  JSON.stringify(Object.keys(value).sort()) ===
    JSON.stringify([...keys].sort());
const fullMatch = (pattern, value) =>
  typeof value === "string" && pattern.exec(value)?.[0] === value;

function safePath(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    ![...value].some(
      (char) =>
        char.charCodeAt(0) <= 32 ||
        char.charCodeAt(0) === 127 ||
        "\\:".includes(char),
    ) &&
    value
      .split("/")
      .every((part) => part !== "" && part !== "." && part !== "..")
  );
}

function localPath(path) {
  if (path.split("/").includes("..")) reject("path: traversal is forbidden");
  const absolute = resolve(path);
  for (let part = absolute; ; part = dirname(part)) {
    try {
      if (lstatSync(part).isSymbolicLink())
        reject("path: symlinks are forbidden");
    } catch (error) {
      if (error instanceof InputError) throw error;
      reject("input: inaccessible file");
    }
    if (dirname(part) === part) break;
  }
  return absolute;
}

function readBytes(path) {
  const absolute = localPath(path);
  let descriptor;
  try {
    descriptor = openSync(
      absolute,
      constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
    );
    const metadata = fstatSync(descriptor);
    if (!metadata.isFile()) reject("input: expected regular file");
    if (metadata.size > MAX_FILE_BYTES) reject("input: size limit exceeded");
    const data = Buffer.alloc(MAX_FILE_BYTES + 1);
    let length = 0,
      count;
    do {
      count = readSync(descriptor, data, length, data.length - length, null);
      length += count;
      if (length > MAX_FILE_BYTES) reject("input: size limit exceeded");
    } while (count > 0);
    return data.subarray(0, length);
  } catch (error) {
    if (error instanceof InputError) throw error;
    reject("input: inaccessible file");
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function parseDocument(data, exactIntegers = true) {
  let source;
  try {
    source = new TextDecoder("utf-8", { fatal: true }).decode(data);
  } catch {
    reject("JSON: invalid document");
  }
  const errors = [];
  const tree = parseTree(source, errors, {
    disallowComments: true,
    allowTrailingComma: false,
  });
  if (errors.length || !tree || tree.type !== "object")
    reject("JSON: invalid document or expected object");
  // Check raw tokens before converting the AST: JS numbers erase 1.0 and 1e0.
  function inspect(node) {
    if (node.type === "number" && !Number.isFinite(node.value))
      reject("JSON: non-finite number");
    if (node.type === "object") {
      const seen = new Set();
      for (const property of node.children ?? []) {
        const [key, value] = property.children;
        if (seen.has(key.value)) reject("JSON: duplicate key");
        seen.add(key.value);
        if (
          exactIntegers &&
          ["schema_version", "app_id"].includes(key.value) &&
          (value.type !== "number" ||
            !fullMatch(
              /-?(?:0|[1-9]\d*)/u,
              source.slice(value.offset, value.offset + value.length),
            ) ||
            !Number.isSafeInteger(value.value))
        )
          reject(
            "JSON: version and app id must be exact integer within safe precision",
          );
      }
    }
    for (const child of node.children ?? []) inspect(child);
  }
  inspect(tree);
  // Ajv's uniqueItems comparison expects normal JSON objects, rather than
  // jsonc-parser's null-prototype objects. The AST has already passed guards.
  return JSON.parse(source);
}

function utcDate(value) {
  if (typeof value !== "string") return true;
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|\+00:00)/u.exec(
      value,
    );
  if (!match || match[0] !== value) return false;
  const [year, month, day, hour, minute, second] = match.slice(1).map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= days[month - 1] &&
    hour <= 23 &&
    minute <= 59 &&
    second <= 59
  );
}

function checkLock(lock) {
  if (!exactKeys(lock, ["schema_version", "repository", "commit", "files"]))
    reject("policy lock: invalid fields");
  if (lock.schema_version !== 1)
    reject("policy lock: unsupported schema version");
  if (lock.repository !== POLICY_REPOSITORY)
    reject("policy lock: source repository mismatch");
  if (!fullMatch(/[a-f0-9]{40}/u, lock.commit))
    reject("policy lock: invalid commit");
  if (!exactKeys(lock.files, PUBLIC_FILES))
    reject("policy lock: missing or forbidden bundle files");
  if (
    Object.values(lock.files).some(
      (value) => !fullMatch(/[a-f0-9]{64}/u, value),
    )
  )
    reject("policy lock: invalid digest");
}

// Walk schema positions only: instance data in const/enum is opaque.
function* schemaNodes(schema) {
  yield schema;
  if (!object(schema)) return;
  for (const key of [
    "$defs",
    "definitions",
    "properties",
    "patternProperties",
    "dependentSchemas",
  ])
    for (const child of Object.values(schema[key] ?? {}))
      yield* schemaNodes(child);
  for (const key of ["allOf", "anyOf", "oneOf", "prefixItems"])
    for (const child of schema[key] ?? []) yield* schemaNodes(child);
  for (const key of [
    "items",
    "contains",
    "not",
    "if",
    "then",
    "else",
    "additionalProperties",
    "unevaluatedProperties",
    "propertyNames",
    "unevaluatedItems",
  ])
    if (Object.hasOwn(schema, key)) yield* schemaNodes(schema[key]);
}

function compileSchemas(schemas) {
  // No loadSchema/compileAsync: all referenced resources must be bundled.
  const ajv = new Ajv2020({
    strict: false,
    allErrors: true,
    validateFormats: true,
  });
  ajv.addFormat("utc-date-time", { type: "string", validate: utcDate });
  for (const [name, schema] of Object.entries(schemas)) {
    if (!object(schema) || schema.$id !== name || schema.$schema !== DIALECT)
      reject("schema: invalid identity or dialect");
    let valid;
    try {
      valid = ajv.validateSchema(schema);
    } catch {
      reject("schema: invalid structure");
    }
    if (!valid) reject("schema: invalid structure");
    for (const node of schemaNodes(schema)) {
      if (!object(node)) continue;
      // Ajv's nonstandard async extension would return a Promise, rather than
      // the synchronous boolean this offline interface requires.
      if (Object.hasOwn(node, "$async"))
        reject("schema: asynchronous validation forbidden");
      if (Object.hasOwn(node, "$id") && node !== schema)
        reject("schema: nested identity forbidden");
      if (
        Object.hasOwn(node, "$dynamicRef") ||
        Object.hasOwn(node, "$dynamicAnchor")
      )
        reject("schema: dynamic references forbidden");
      if (Object.hasOwn(node, "format") && node.format !== "utc-date-time")
        reject("schema: unsupported format");
      if (Object.hasOwn(node, "$ref")) {
        const index = node.$ref.indexOf("#");
        const resource = index < 0 ? node.$ref : node.$ref.slice(0, index);
        const fragment = index < 0 ? "" : node.$ref.slice(index + 1);
        if (resource && !Object.hasOwn(schemas, resource))
          reject("schema: nonlocal or unknown reference");
        if (fragment && !fragment.startsWith("/"))
          reject("schema: unsupported reference fragment");
        // Resolve every reference, including unused $defs, before compilation.
        let target = schemas[resource || name];
        try {
          if (fragment)
            for (const part of decodeURIComponent(fragment)
              .slice(1)
              .split("/")) {
              const key = part.replace(/~1/gu, "/").replace(/~0/gu, "~");
              if (!object(target) && !Array.isArray(target))
                reject("schema: unresolved local reference");
              if (!Object.hasOwn(target, key))
                reject("schema: unresolved local reference");
              target = target[key];
            }
        } catch {
          reject("schema: unresolved local reference");
        }
      }
    }
  }
  try {
    for (const schema of Object.values(schemas)) ajv.addSchema(schema);
    return Object.fromEntries(
      Object.keys(schemas).map((name) => [name, ajv.getSchema(name)]),
    );
  } catch {
    reject(
      "schema: validation could not complete or unresolved local reference",
    );
  }
}

function checkSchema(document, name, validators) {
  const validator = validators[name];
  let valid;
  try {
    valid = validator(document);
  } catch {
    reject("schema: validation could not complete");
  }
  if (!valid) {
    // Never echo Ajv's messages, paths, or values: commands may contain secrets.
    const keywords = [
      ...new Set(validator.errors.map((error) => error.keyword)),
    ].sort();
    reject(keywords.map((keyword) => `${name}: invalid ${keyword}`).join("; "));
  }
}

function checkContract(contract, profiles, repository) {
  if (contract.repository !== repository)
    reject("contract: repository identity mismatch");
  const controls = [...profiles.common_controls];
  for (const profile of contract.profiles) {
    if (!Object.hasOwn(profiles.profiles, profile))
      reject("contract: unknown policy profile");
    controls.push(...profiles.profiles[profile]);
  }
  for (const control of controls) {
    if (
      control.kind === "command" &&
      control.applicability.condition === "always" &&
      control.applicability.lifecycles.includes(contract.lifecycle) &&
      contract.commands[control.expected.key].status !== "applicable"
    )
      reject("contract: required profile command marked not applicable");
  }
  const refs = contract.ci.refs,
    refNames = refs.map((ref) => ref.ref);
  if (refNames.some((ref) => !safePath(ref))) reject("contract: unsafe CI ref");
  if (new Set(refNames).size !== refNames.length)
    reject("contract: duplicate CI ref");
  if (contract.delivery.integration_refs.some((ref) => !refNames.includes(ref)))
    reject("contract: integration ref lacks CI declaration");
  const workflows = new Set(refs.flatMap((ref) => ref.workflows));
  for (const ref of refs) {
    const contexts = ref.required_contexts.map((context) =>
      JSON.stringify([context.name, context.app_id ?? null]),
    );
    if (new Set(contexts).size !== contexts.length)
      reject("contract: duplicate CI context");
  }
  for (const evidence of contract.ci.command_evidence) {
    if (!workflows.has(evidence.workflow))
      reject("contract: command evidence uses undeclared workflow");
    if (contract.commands[evidence.command].status !== "applicable")
      reject("contract: command evidence points to not applicable command");
  }
  const controlIds = new Set(controls.map((control) => control.id)),
    scopes = new Set();
  for (const exception of contract.exceptions) {
    if (!safePath(exception.ref_or_path))
      reject("contract: unsafe exception scope");
    if (!controlIds.has(exception.control))
      reject("contract: exception uses unknown control");
    const scope = JSON.stringify([exception.control, exception.ref_or_path]);
    if (scopes.has(scope)) reject("contract: duplicate exception scope");
    scopes.add(scope);
  }
}

function main() {
  let values;
  try {
    ({ values } = parseArgs({
      options: {
        contract: { type: "string", default: ".repo/contract.json" },
        lock: { type: "string", default: ".repo/policy.lock.json" },
        "policy-dir": { type: "string", default: ".repo/policy" },
        repository: { type: "string", default: "effigy-analytics/morass" },
      },
    }));
  } catch {
    reject("arguments: invalid options");
  }
  const lock = parseDocument(readBytes(values.lock));
  checkLock(lock);
  const policyRoot = localPath(values["policy-dir"]);
  const contents = {};
  for (const name of PUBLIC_FILES) {
    const bytes = readBytes(join(policyRoot, name));
    if (createHash("sha256").update(bytes).digest("hex") !== lock.files[name])
      reject("policy: digest mismatch");
    contents[name] = bytes;
  }
  const documents = Object.fromEntries(
    PUBLIC_FILES.map((name) => [
      name,
      parseDocument(contents[name], name === "profiles.json"),
    ]),
  );
  const schemas = Object.fromEntries(
    SCHEMA_NAMES.map((name) => [name, documents[name]]),
  );
  const validators = compileSchemas(schemas);
  checkSchema(lock, "policy-lock.schema.json", validators);
  const profiles = documents["profiles.json"];
  checkSchema(profiles, "profiles.schema.json", validators);
  const allControls = [
    ...profiles.common_controls,
    ...Object.values(profiles.profiles).flat(),
  ];
  if (
    new Set(allControls.map((control) => control.id)).size !==
    allControls.length
  )
    reject("profiles: duplicate control id");
  const contract = parseDocument(readBytes(values.contract));
  checkSchema(contract, "contract.schema.json", validators);
  checkContract(contract, profiles, values.repository);
  console.log(
    "Contract valid against pinned policy; consumer identity verified.",
  );
}

try {
  main();
} catch (error) {
  console.error(
    error instanceof InputError
      ? error.message
      : "input: validation could not complete",
  );
  process.exitCode = 2;
}
