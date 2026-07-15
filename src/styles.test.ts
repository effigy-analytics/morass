import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  fileURLToPath(new URL("./styles.css", import.meta.url)),
  "utf8",
);

const TOKEN_BLOCK_SELECTORS = [
  ":root",
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
});
