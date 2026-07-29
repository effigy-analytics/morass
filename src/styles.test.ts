import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { themes } from "./themes";

const css = readFileSync(
  fileURLToPath(new URL("./styles.css", import.meta.url)),
  "utf8",
);

const TOKEN_BLOCK_SELECTORS = [
  ":root",
  '[data-m-theme="light"]',
  '[data-m-theme="dark"]',
  ":root:not([data-m-theme])",
];

export function blockOf(source: string, selector: string): string | null {
  const marker = `${selector} {`;
  const start = source.indexOf(marker);
  if (start === -1) {
    return null;
  }
  let depth = 1;
  let index = start + marker.length;
  while (index < source.length && depth > 0) {
    if (source[index] === "{") {
      depth += 1;
    }
    if (source[index] === "}") {
      depth -= 1;
    }
    index += 1;
  }
  return source.slice(start + marker.length, index - 1);
}

export function declarationsOf(block: string): string[] {
  return block
    .split(";")
    .map((declaration) => declaration.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .sort();
}

describe("styles.css invariants", () => {
  it("keeps every rule inside @layer morass", () => {
    expect(css.trimStart().startsWith("@layer morass {")).toBe(true);
    const outside = css.replace(/@layer morass \{[\s\S]*\}/, "").trim();
    expect(outside).toBe("");
  });

  it("declares raw colors only inside theme token blocks", () => {
    let remainder = css;
    for (const selector of TOKEN_BLOCK_SELECTORS) {
      const block = blockOf(remainder, selector);
      if (block !== null) {
        remainder = remainder.replace(block, "");
      }
    }
    const rawColors = remainder.match(
      /#[0-9a-fA-F]{3,8}\b|rgba?\(|\b(?:white|black)\b/g,
    );
    expect(rawColors).toBeNull();
  });

  it("keeps the dark theme block and the OS-auto block in sync", () => {
    const dark = blockOf(css, '[data-m-theme="dark"]');
    const auto = blockOf(css, ":root:not([data-m-theme])");
    expect(dark).not.toBeNull();
    expect(auto).not.toBeNull();
    expect(declarationsOf(auto ?? "")).toEqual(declarationsOf(dark ?? ""));
  });

  it("fully resets an explicit light subtree inherited from dark", () => {
    const root = recordOf(blockOf(css, ":root") ?? "");
    const explicitLight = recordOf(
      blockOf(css, '[data-m-theme="light"]') ?? "",
    );
    expect(explicitLight).toEqual(root);
  });

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
      "--m-fixture-metal",
      "--m-fixture-metal-highlight",
      "--m-fixture-metal-shadow",
      "--m-fixture-inset",
      "--m-fixture-inset-on",
      "--m-fixture-patina",
      "--m-medallion-bronze",
      "--m-medallion-bronze-highlight",
      "--m-medallion-bronze-on",
      "--m-medallion-bronze-shadow",
      "--m-medallion-gold",
      "--m-medallion-gold-highlight",
      "--m-medallion-gold-on",
      "--m-medallion-gold-shadow",
      "--m-medallion-silver",
      "--m-medallion-silver-highlight",
      "--m-medallion-silver-on",
      "--m-medallion-silver-shadow",
      "--m-workbench-bg",
      "--m-workbench-on",
      "--m-workbench-grid",
      "--m-sheet-bg",
      "--m-sheet-on",
      "--m-sheet-border",
      "--m-sheet-shadow",
      "--m-index-card-bg",
      "--m-index-card-line",
      "--m-highlight-sage",
      "--m-highlight-rose",
      "--m-highlight-butter",
      "--m-highlight-sky",
      "--m-highlight-lavender",
      "--m-binder-tab-accent",
      "--m-attachment-tape",
      "--m-felt-action",
      "--m-felt-action-strong",
      "--m-felt-action-on",
    ]) {
      expect(root[t]).toBeDefined();
    }
  });
});

export function recordOf(block: string): Record<string, string> {
  const record: Record<string, string> = {};
  for (const declaration of block.split(";")) {
    const text = declaration.replace(/\s+/g, " ").trim();
    if (!text) {
      continue;
    }
    const colon = text.indexOf(":");
    record[text.slice(0, colon).trim()] = text.slice(colon + 1).trim();
  }
  return record;
}

describe("themes.ts stays in sync with styles.css", () => {
  it("matches the :root token block exactly", () => {
    expect(recordOf(blockOf(css, ":root") ?? "")).toEqual(themes.light);
  });

  it("matches the dark token block exactly", () => {
    expect(recordOf(blockOf(css, '[data-m-theme="dark"]') ?? "")).toEqual(
      themes.dark,
    );
  });
});

describe("surface treatments", () => {
  it("defines the surface treatments using only tokens", () => {
    for (const sel of [".m-canvas-grid", ".m-paper", ".m-postit"]) {
      expect(css.includes(`${sel} {`)).toBe(true);
    }
    // canvas-grid must be opt-in: body must not carry the grid
    const body = blockOf(css, "body") ?? "";
    expect(body.includes("repeating-linear-gradient")).toBe(false);
  });

  it("defines structural fixture treatments using only tokens", () => {
    for (const sel of [
      ".m-fixture",
      ".m-fixture__surface",
      ".m-medallion",
      ".m-plaque",
      ".m-rail",
    ]) {
      expect(css.includes(`${sel} {`)).toBe(true);
    }
  });

  it("defines the opt-in Studio Workbench surfaces", () => {
    for (const sel of [
      ".m-workbench",
      ".m-sheet",
      ".m-index-card",
      ".m-highlight",
      ".m-tape",
      ".m-felt-action",
    ]) {
      expect(css.includes(`${sel} {`)).toBe(true);
    }
  });

  it("keeps highlighter stroke edges distinct from torn tape ends", () => {
    const highlighter = blockOf(css, ".m-highlight::before") ?? "";
    const tapeStart = css.lastIndexOf(".m-tape {");
    const tape = blockOf(css.slice(tapeStart), ".m-tape") ?? "";
    expect(highlighter).toContain("53% 8%");
    expect(highlighter).toContain("filter: blur(0.2px)");
    expect(tape).toContain("10% 0");
    expect(tape).toContain("90% 100%");
    expect(tape).not.toEqual(highlighter);
  });

  it("keeps binder tabs usable and stateful without prescribing semantics", () => {
    const list = blockOf(css, ".m-binder-tabs") ?? "";
    const tab = blockOf(css, ".m-binder-tab") ?? "";
    const current = blockOf(css, ".m-binder-tab--current") ?? "";

    expect(list).toContain("overflow-x: auto");
    expect(list).toContain("display: flex");
    expect(tab).toContain("max-inline-size:");
    expect(tab).toContain("min-height: 44px");
    expect(tab).toContain("overflow-wrap: anywhere");
    expect(current).toContain("font-weight: 800");
    expect(css).toContain(".m-binder-tab--active");
    expect(css).toContain(".m-binder-tab--rose");
    expect(css).toContain('.m-binder-tab[aria-current="page"]');
    expect(css).toContain('.m-binder-tab[aria-selected="true"]');
    expect(css).toContain(".m-binder-tab:focus-visible");
  });
});

describe("control treatments", () => {
  it("defines the control treatments (felt + stitch) using only tokens", () => {
    for (const sel of [".m-felt {", ".m-felt--sage {", ".m-stitch {"]) {
      expect(css.includes(sel)).toBe(true);
    }
  });

  it("provides visible focus, forced-color, and reduced-motion fallbacks", () => {
    const root = recordOf(blockOf(css, ":root") ?? "");
    expect(root["--m-focus-ring"]).toBe("#1d766f");
    expect(root["--m-focus-ring-on-backdrop"]).toBe("#ffffff");
    expect(css).toContain(".m-modal__panel:focus");
    expect(css).toContain(".m-tabs__panel:focus-visible");

    const forcedColors = blockOf(css, "@media (forced-colors: active)") ?? "";
    expect(forcedColors).toContain("ButtonText");
    expect(forcedColors).toContain("Highlight");
    expect(forcedColors).toContain("HighlightText");
    expect(forcedColors).toContain(".m-highlight::before");
    expect(forcedColors).toContain(".m-tape");
    expect(forcedColors).toContain(".m-binder-tab");
    expect(forcedColors).toContain(".m-binder-tab--current");

    const reducedMotion =
      blockOf(css, "@media (prefers-reduced-motion: reduce)") ?? "";
    expect(reducedMotion).toContain("transition: none");
    expect(reducedMotion).toContain("transform: none");
  });

  it("maps native controls to explicit and OS-selected color schemes", () => {
    expect(css).toContain('[data-m-theme="light"] {\n    color-scheme: light;');
    expect(css).toContain('[data-m-theme="dark"] {\n    color-scheme: dark;');
    expect(css).toContain(
      ":root:not([data-m-theme]) {\n      color-scheme: dark;",
    );
  });
});
