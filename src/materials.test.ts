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
