# Repository contract pilot

`npm run contract:check` runs the native Node declaration validator and its
subprocess tests. It also runs through `npm run check`, which existing CI invokes.
Exit 0 attests structural and semantic consistency with bundled policy and exact
Morass identity. Exit 2 means invalid or inaccessible input. Commands are data:
the validator executes no commands, makes no network calls, and fetches no
schemas. It does not attest current fleet health, branch protection, deployment,
credentials, or exception approval. Expired exceptions may be historical metadata;
this validator never grants waivers. Morass currently declares no exceptions.

## Declaration authority

- The proposed owner handle `effigy-analytics` follows the organization named by
  `package.json` author and repository URL. This is context for review, not an
  approved GitHub team, ownership decision, or access attestation.
- The UI foundation business line follows `AGENTS.md`, `README.md`, and the public
  package description. `ts-library` matches the typed public React package.
- The moderate risk tier is an explicit proposal: changes can affect public npm
  consumers. Strict TypeScript (`tsconfig.json`), component and interface tests,
  release integrity, tarball allowlisting, and clean consumer checks inform it.
  No private portfolio decision or risk approval is claimed.
- `.nvmrc` declares Node 24.15.0. `package.json` supplies all seven commands.
  `format` writes formatting; `check` uses the existing read-only format check.
- CI contexts come from `.github/workflows/ci.yml`, `shared-lint.yml`, and
  `codeql.yml`. They are desired controls matching existing job names, not proof
  of live protection. `verify` runs bootstrap and aggregate check; check composes
  format checking, lint, strict types, tests, build, integrity, and pack checking.
  Clean consumer jobs install and typecheck React 18.2.0 and 19.2.7, with a shared
  consumer gate. Existing security workflows remain unchanged.
  The v1 fleet evaluator checks literal workflow command invocations and does
  not expand npm script aggregates. It may report nested lint/typecheck/test/build
  commands as unproved even though the existing `npm run check` executes them.
  This is a static evidence limitation, not a declaration of missing enforcement;
  command evidence records only the actual bootstrap and check workflow steps.
- The vendored `.github/workflows/shared-lint.yml` header records the July 7,
  2026 Umbrella ADR 002 amendment: this public repository cannot call the private
  reusable workflow. That explanatory authority remains intact. It supplies no
  dated expiry or approved waiver record, so no exception is fabricated.
- Integration and rollback wording in `contract.json` is proposed guidance.
  Existing `.github/workflows/publish.yml` retains release authority: one verified
  canonical tarball, public npmjs publication, and an identical GitHub Packages
  mirror. This pilot adds no release, version, tag, publication, or workflow call.

## Immutable public policy

Source: `effigy-analytics/effigy-analytics-umbrella`, reviewed commit
`f935d8e64c20b8fe246a98d2c694c7792a5410c7`. This reviewed merged source is
available to consumers; source availability does not adopt default policy.
Consumer contract and default adoption remain proposals pending authorized
merges and fresh collection. Only the contract, profiles, and policy-lock schemas,
`profiles.json`, and their generated digest lock are bundled. Private catalog,
inventory, and decision data are neither required nor shipped.

The four `.repo/policy/` JSON files retain exact upstream bytes. Their explicit
Prettier exclusions preserve the SHA-256 pin; the validator checks every digest
before interpreting policy and rejects missing or extra lock entries. Authored
contract, lock, documentation, and scripts stay under normal formatting rules.

After installing development dependencies, validation works offline with exact
Ajv 8.20.0 (2020-12) and jsonc-parser 3.3.1. Inputs must be bounded regular local
files with no symlink ancestors or traversal. Duplicate JSON keys, comments,
trailing commas, non-finite numbers, inexact integer versions/App ids, unsafe
precision, invalid UTC calendar dates, and nonlocal schema references fail closed.
Errors omit document values, paths, and command contents. Schema references are
checked in schema positions, leaving instance-valued `const`/`enum` data opaque.

Replace contract, public data, and lock together only from an exact reviewed
source commit. Revert all three together to restore a previous reviewed pin.
The copies do not automatically synchronize. `package.json`'s existing package
file allowlist excludes `.repo/` and scripts from the published tarball; public
exports, product code, CSS classes, and custom properties are unchanged.
