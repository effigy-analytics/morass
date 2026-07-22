# morass Materialist Design System — Phase 1 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lay the token + material-treatment + contract foundation for morass's craft-materialist redesign, without redesigning any component yet.

**Architecture:** morass ships one `src/styles.css` (all rules inside `@layer morass`), whose token blocks are mirrored in `src/themes.ts` and gated by `src/styles.test.ts` and `src/contract.ts` (`validateTheme`, WCAG AA on `REQUIRED_PAIRS`). Phase 1 adds a warm-paper canvas, a pastel **felt** palette (paired `on-` tokens), material-structure tokens, five CSS **treatment** utilities (canvas-grid, paper, tape, postit, stitch, felt) built only from tokens, new contrast pairs, and a `material → role` map module with a scaffolding test. No `m-*` component class is restyled in Phase 1 (that is Phase 2).

**Tech Stack:** TypeScript, CSS custom properties, Vitest.

## Global Constraints

- Every rule in `src/styles.css` lives inside the single top-level `@layer morass { … }` block. (styles.test.ts: "keeps every rule inside @layer morass")
- Raw colors (`#hex`, `rgb()/rgba()`, literal `white`/`black`) appear **only** inside the three token blocks: `:root`, `[data-m-theme="dark"]`, `:root:not([data-m-theme])`. Treatments must reference `var(--m-*)` tokens only. (styles.test.ts: "declares raw colors only inside theme token blocks")
- The `[data-m-theme="dark"]` block and the `:root:not([data-m-theme])` (OS-auto) block must contain **identical declarations**. Every token added to one is added verbatim to the other. (styles.test.ts: "keeps the dark theme block and the OS-auto block in sync")
- `themes.ts` `light` mirrors the `:root` block exactly; `themes.dark` mirrors the `[data-m-theme="dark"]` block exactly. Every token added to a CSS block is added to the matching `themes.ts` record with the identical value string. (styles.test.ts: "themes.ts stays in sync with styles.css")
- Token names match `--m-${string}` (type `MorassTokenName`).
- Every new `RequiredPair` must resolve against **both** `themes.light` and `themes.dark`; any token used in a pair must be declared in the `:root`, dark, and OS-auto blocks. Target ratio is 4.5:1 (`REQUIRED = 4.5`).
- Commit after every task. Run `npm run test` (vitest) as the gate; the repo's full check is `npm run check` (format + lint + typecheck + test + build + pack).

---

### Task 1: Warm the canvas (paper background + surface)

Recolor the page and surface tokens to warm paper so morass reads as paper, keeping all existing contrast pairs green. No new tokens; value changes only.

**Files:**

- Modify: `src/styles.css` (`:root` block lines 3-4; note: dark block stays as-is this task)
- Modify: `src/themes.ts` (`themes.light` `--m-color-bg`, `--m-color-surface`)
- Test: `src/styles.test.ts` (existing), `src/contract.test.ts` (existing)

**Interfaces:**

- Consumes: nothing new.
- Produces: `--m-color-bg` = `#f7f2e7`, `--m-color-surface` = `#fffdf7` (light theme).

- [ ] **Step 1: Write the failing test** — add to `src/contract.test.ts` inside `describe("validateTheme", …)`:

```ts
it("keeps the warm-paper light theme AA-clean", () => {
  const result = validateTheme(themes.light);
  expect(result.ok).toBe(true);
});
```

- [ ] **Step 2: Run to verify it passes already OR fails** — `npm run test -- contract` — Expected: this test PASSES today (light is already AA). It is a guard: it must stay green after the recolor. Also run `npm run test -- styles` — Expected: PASS.

- [ ] **Step 3: Recolor the tokens** — in `src/styles.css` `:root`:

```css
--m-color-bg: #f7f2e7;
--m-color-surface: #fffdf7;
```

and in `src/themes.ts` `light`:

```ts
    "--m-color-bg": "#f7f2e7",
    "--m-color-surface": "#fffdf7",
```

- [ ] **Step 4: Run tests** — `npm run test -- styles contract` — Expected: PASS (mirror holds; both new pairs still ≥4.5:1). If `validateTheme` reports a failure on `text on page bg` or `text on surface`, darken `--m-color-text` slightly in both `styles.css` and `themes.ts` until green.

- [ ] **Step 5: Commit**

```bash
git add src/styles.css src/themes.ts src/contract.test.ts
git commit -m "feat(morass): warm-paper canvas + surface tokens"
```

---

### Task 2: Pastel felt palette (paired tokens + contract pairs)

Add the five pastel felt fills, each with a paired `on-` ink, to all three token blocks + `themes.ts`, and add a contrast pair per fill so `validateTheme` guarantees AA.

**Files:**

- Modify: `src/styles.css` (`:root`, `[data-m-theme="dark"]`, `:root:not([data-m-theme])`)
- Modify: `src/themes.ts` (`light`, `dark`)
- Modify: `src/contract.ts` (`REQUIRED_PAIRS`)
- Test: `src/contract.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces tokens (light / dark): `--m-felt-sage`,`--m-felt-sage-on`; `--m-felt-butter`,`--m-felt-butter-on`; `--m-felt-rose`,`--m-felt-rose-on`; `--m-felt-sky`,`--m-felt-sky-on`; `--m-felt-lavender`,`--m-felt-lavender-on`.

- [ ] **Step 1: Write the failing test** — add to `src/contract.test.ts`:

```ts
it("guarantees AA on every felt fill in light and dark", () => {
  for (const theme of [themes.light, themes.dark]) {
    const felts = REQUIRED_PAIRS.filter((p) => p.context.startsWith("felt "));
    expect(felts.length).toBe(5);
    const result = validateTheme(theme);
    const feltFailures = result.failures.filter((f) =>
      f.context.startsWith("felt "),
    );
    expect(feltFailures).toEqual([]);
  }
});
```

- [ ] **Step 2: Run to verify it fails** — `npm run test -- contract` — Expected: FAIL (`expect(felts.length).toBe(5)` gets 0 — pairs not added yet).

- [ ] **Step 3: Add the tokens** — in `src/styles.css` `:root` add:

```css
--m-felt-sage: #c9ddcb;
--m-felt-sage-on: #2f5741;
--m-felt-butter: #f6e6a6;
--m-felt-butter-on: #5f4e12;
--m-felt-rose: #efc9c6;
--m-felt-rose-on: #7a2f2a;
--m-felt-sky: #c4dbe6;
--m-felt-sky-on: #234b5c;
--m-felt-lavender: #d8cde9;
--m-felt-lavender-on: #453363;
```

Add these **identical** lines to BOTH `[data-m-theme="dark"]` and `:root:not([data-m-theme])` (dark "craft desk at night" — deeper fills, luminous ink):

```css
--m-felt-sage: #2c4b3c;
--m-felt-sage-on: #9fe4c0;
--m-felt-butter: #4a4222;
--m-felt-butter-on: #f4dd8f;
--m-felt-rose: #4d2e2b;
--m-felt-rose-on: #f3b6b0;
--m-felt-sky: #26404d;
--m-felt-sky-on: #a9d6e8;
--m-felt-lavender: #372c4a;
--m-felt-lavender-on: #cdb9ec;
```

In `src/themes.ts` add the light values to `light` and the dark values to `dark` (identical strings).

- [ ] **Step 4: Add the contract pairs** — in `src/contract.ts`, append to `REQUIRED_PAIRS`:

```ts
  { bg: ["--m-felt-sage"], context: "felt sage label", fg: "--m-felt-sage-on" },
  { bg: ["--m-felt-butter"], context: "felt butter label", fg: "--m-felt-butter-on" },
  { bg: ["--m-felt-rose"], context: "felt rose label", fg: "--m-felt-rose-on" },
  { bg: ["--m-felt-sky"], context: "felt sky label", fg: "--m-felt-sky-on" },
  { bg: ["--m-felt-lavender"], context: "felt lavender label", fg: "--m-felt-lavender-on" },
```

- [ ] **Step 5: Run tests** — `npm run test -- contract styles` — Expected: PASS. If any felt pair fails AA, adjust that fill's `-on` ink darker (light) / lighter (dark) in `styles.css` + `themes.ts` until `validateTheme` is green in both themes.

- [ ] **Step 6: Commit**

```bash
git add src/styles.css src/themes.ts src/contract.ts src/contract.test.ts
git commit -m "feat(morass): pastel felt palette with paired on-tokens + AA contract pairs"
```

---

### Task 3: Material-structure tokens

Add non-color-pair structural tokens the treatments need: graph grid lines, margin rule, tape, stitch thread, paper lift shadow, post-it fill/ink/shadow. These are decorative (not in `REQUIRED_PAIRS`) but must live in the token blocks so treatments stay raw-color-free.

**Files:**

- Modify: `src/styles.css` (all three token blocks)
- Modify: `src/themes.ts` (`light`, `dark`)
- Test: `src/styles.test.ts` (existing sync/mirror tests cover it)

**Interfaces:**

- Produces tokens: `--m-grid-line`, `--m-grid-margin`, `--m-tape`, `--m-stitch`, `--m-paper-shadow`, `--m-postit-bg`, `--m-postit-on`, `--m-postit-shadow`.

- [ ] **Step 1: Write the failing test** — add to `src/styles.test.ts` inside `describe("styles.css invariants", …)`:

```ts
it("declares the material-structure tokens in :root", () => {
  const root = recordOf(blockOf(css, ":root") ?? "");
  for (const t of [
    "--m-grid-line",
    "--m-grid-margin",
    "--m-tape",
    "--m-stitch",
    "--m-paper-shadow",
    "--m-postit-bg",
    "--m-postit-on",
    "--m-postit-shadow",
  ]) {
    expect(root[t]).toBeDefined();
  }
});
```

- [ ] **Step 2: Run to verify it fails** — `npm run test -- styles` — Expected: FAIL (tokens undefined).

- [ ] **Step 3: Add the tokens** — `:root`:

```css
--m-grid-line: #e9ebdf;
--m-grid-margin: #f0b6ad;
--m-tape: rgb(196 219 230 / 0.62);
--m-stitch: #5c8168;
--m-paper-shadow: 3px 6px 16px rgb(120 105 70 / 0.16);
--m-postit-bg: #f6e6a6;
--m-postit-on: #5f4e12;
--m-postit-shadow: 2px 5px 12px rgb(120 100 40 / 0.25);
```

Add these **identical** lines to BOTH `[data-m-theme="dark"]` and `:root:not([data-m-theme])`:

```css
--m-grid-line: #232a27;
--m-grid-margin: #5c3f3b;
--m-tape: rgb(120 150 165 / 0.3);
--m-stitch: #9fe4c0;
--m-paper-shadow: 3px 6px 18px rgb(0 0 0 / 0.45);
--m-postit-bg: #4a4222;
--m-postit-on: #f4dd8f;
--m-postit-shadow: 2px 5px 14px rgb(0 0 0 / 0.5);
```

Mirror both into `themes.ts` `light` / `dark`.

- [ ] **Step 4: Run tests** — `npm run test -- styles` — Expected: PASS (token presence + mirror + sync all green).

- [ ] **Step 5: Commit**

```bash
git add src/styles.css src/themes.ts src/styles.test.ts
git commit -m "feat(morass): material-structure tokens (grid, tape, stitch, paper/post-it shadows)"
```

---

### Task 4: Surface treatments — canvas-grid, paper, tape, post-it

Add the content-side treatment utilities, built only from tokens. `canvas-grid` is opt-in (a class a consumer adds), never applied to `body`.

**Files:**

- Modify: `src/styles.css` (append rules inside `@layer morass`, after the token blocks)
- Test: `src/styles.test.ts`

**Interfaces:**

- Produces CSS classes: `.m-canvas-grid`, `.m-paper`, `.m-paper--taped`, `.m-postit`.

- [ ] **Step 1: Write the failing test** — add to `src/styles.test.ts`:

```ts
it("defines the surface treatments using only tokens", () => {
  for (const sel of [".m-canvas-grid", ".m-paper", ".m-postit"]) {
    expect(css.includes(`${sel} {`)).toBe(true);
  }
  // canvas-grid must be opt-in: body must not carry the grid
  const body = blockOf(css, "body") ?? "";
  expect(body.includes("repeating-linear-gradient")).toBe(false);
});
```

- [ ] **Step 2: Run to verify it fails** — `npm run test -- styles` — Expected: FAIL (`.m-canvas-grid {` absent).

- [ ] **Step 3: Add the treatments** — append inside `@layer morass` in `src/styles.css` (before the closing `}` of the layer):

```css
.m-canvas-grid {
  background:
    linear-gradient(var(--m-grid-margin) 0 0) 46px 0 / 1.5px 100% no-repeat,
    repeating-linear-gradient(var(--m-grid-line) 0 1px, transparent 1px 24px),
    repeating-linear-gradient(
      90deg,
      var(--m-grid-line) 0 1px,
      transparent 1px 24px
    ),
    var(--m-color-bg);
}

.m-paper {
  background: var(--m-color-surface);
  border-radius: var(--m-radius);
  box-shadow: var(--m-paper-shadow);
  position: relative;
}

.m-paper--taped::before {
  content: "";
  position: absolute;
  top: -12px;
  left: 34px;
  width: 104px;
  height: 26px;
  background: var(--m-tape);
}

.m-postit {
  background: var(--m-postit-bg);
  color: var(--m-postit-on);
  border-radius: 3px;
  box-shadow: var(--m-postit-shadow);
  padding: 16px;
  transform: rotate(-2deg);
}

@media (prefers-reduced-motion: reduce) {
  .m-postit {
    transform: none;
  }
}
```

- [ ] **Step 4: Run tests** — `npm run test -- styles` — Expected: PASS (treatments present, token-only, body grid-free, still inside `@layer`).

- [ ] **Step 5: Commit**

```bash
git add src/styles.css src/styles.test.ts
git commit -m "feat(morass): surface treatments (canvas-grid opt-in, paper, tape, post-it)"
```

---

### Task 5: Control treatments — stitch + felt

Add the control/status treatment utilities. `felt` provides the swatch fill+ink; `stitch` provides the sewn dashed seam. Both token-only.

**Files:**

- Modify: `src/styles.css`
- Test: `src/styles.test.ts`

**Interfaces:**

- Produces CSS classes: `.m-felt`, modifiers `.m-felt--sage|butter|rose|sky|lavender`, and `.m-stitch`.

- [ ] **Step 1: Write the failing test** — add to `src/styles.test.ts`:

```ts
it("defines the control treatments (felt + stitch) using only tokens", () => {
  for (const sel of [".m-felt {", ".m-felt--sage {", ".m-stitch {"]) {
    expect(css.includes(sel)).toBe(true);
  }
});
```

- [ ] **Step 2: Run to verify it fails** — `npm run test -- styles` — Expected: FAIL.

- [ ] **Step 3: Add the treatments** — append inside `@layer morass`:

```css
.m-felt {
  background: var(--m-felt-sage);
  color: var(--m-felt-sage-on);
  border: none;
  border-radius: 12px;
}

.m-felt--sage {
  background: var(--m-felt-sage);
  color: var(--m-felt-sage-on);
}
.m-felt--butter {
  background: var(--m-felt-butter);
  color: var(--m-felt-butter-on);
}
.m-felt--rose {
  background: var(--m-felt-rose);
  color: var(--m-felt-rose-on);
}
.m-felt--sky {
  background: var(--m-felt-sky);
  color: var(--m-felt-sky-on);
}
.m-felt--lavender {
  background: var(--m-felt-lavender);
  color: var(--m-felt-lavender-on);
}

.m-stitch {
  outline: 2px dashed var(--m-stitch);
  outline-offset: -5px;
}
```

- [ ] **Step 4: Run tests** — `npm run test -- styles contract` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles.css src/styles.test.ts
git commit -m "feat(morass): control treatments (felt swatches + stitch seam)"
```

---

### Task 6: `material → role` contract map + scaffolding test

Introduce the machine-readable mapping (role → required treatment class) that Phase 2 will assert per component, plus a test that every treatment the map references actually exists in `styles.css`. This is the enforcement backbone.

**Files:**

- Create: `src/materials.ts`
- Modify: `src/index.ts` (export the map so consumers/tests can read it)
- Test: `src/materials.test.ts`

**Interfaces:**

- Consumes: the treatment classes from Tasks 4–5.
- Produces: `export type MaterialRole = "canvas" | "content" | "ephemeral" | "control-status";` and `export const MATERIAL_TREATMENTS: Record<MaterialRole, string[]>`.

- [ ] **Step 1: Write the failing test** — create `src/materials.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MATERIAL_TREATMENTS } from "./materials";

const css = readFileSync(
  fileURLToPath(new URL("./styles.css", import.meta.url)),
  "utf8",
);

describe("material → role map", () => {
  it("maps all four roles", () => {
    expect(Object.keys(MATERIAL_TREATMENTS).sort()).toEqual([
      "canvas",
      "content",
      "control-status",
      "ephemeral",
    ]);
  });

  it("references only treatment classes that exist in styles.css", () => {
    for (const classes of Object.values(MATERIAL_TREATMENTS)) {
      for (const cls of classes) {
        expect(css.includes(`${cls} {`)).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 2: Run to verify it fails** — `npm run test -- materials` — Expected: FAIL (`Cannot find module './materials'`).

- [ ] **Step 3: Create the map** — `src/materials.ts`:

```ts
/**
 * The material = role contract (2026-07-21 spec). Each UI role is rendered
 * from exactly one craft material; Phase 2 asserts each component's rule
 * carries the treatment for its role. Class names match styles.css.
 */
export type MaterialRole =
  "canvas" | "content" | "ephemeral" | "control-status";

export const MATERIAL_TREATMENTS: Record<MaterialRole, string[]> = {
  canvas: [".m-canvas-grid"],
  content: [".m-paper"],
  ephemeral: [".m-postit"],
  "control-status": [".m-felt", ".m-stitch"],
};
```

- [ ] **Step 4: Export it** — add to `src/index.ts`:

```ts
export * from "./materials";
```

- [ ] **Step 5: Run tests** — `npm run test -- materials` then `npm run test` — Expected: PASS (all suites green).

- [ ] **Step 6: Commit**

```bash
git add src/materials.ts src/materials.test.ts src/index.ts
git commit -m "feat(morass): material=role contract map + scaffolding test"
```

---

## Phase-1 exit check

- [ ] `npm run check` passes (format + lint + typecheck + test + build + pack).
- [ ] `validateTheme(themes.light)` and `validateTheme(themes.dark)` both `ok` with the new felt pairs.
- [ ] No raw colors outside token blocks; dark and OS-auto blocks identical; `themes.ts` mirrors CSS.
- [ ] Treatments render from tokens only; `canvas-grid` is opt-in (not on `body`).

**Follow-on (separate plans):** Phase 2 restyles the `m-*` components onto the treatments and adds the per-component `material → role` assertions; Phase 3 adds Avatar/Badge/EmptyState/PageHeader for effigy-ui parity; Phase 4 the full dark craft pass + Quilt/Workshop themes; Phase 5 dogfood + public showcase.
