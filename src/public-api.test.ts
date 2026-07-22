import { describe, expect, it } from "vitest";
import * as morass from "./index";
import * as reminders from "./reminders";

describe("public runtime exports", () => {
  it("keeps the documented root surface explicit", () => {
    expect(Object.keys(morass).sort()).toEqual([
      "AppFrame",
      "Button",
      "ButtonLink",
      "Card",
      "EmptyState",
      "Hero",
      "MATERIAL_TREATMENTS",
      "Metric",
      "Modal",
      "NotFound",
      "PageHeader",
      "PageSection",
      "ProgressSteps",
      "REQUIRED_PAIRS",
      "SelectField",
      "ShellLayout",
      "StatusPill",
      "Tabs",
      "TextField",
      "cx",
      "themes",
      "toneClass",
      "validateTheme",
    ]);
  });

  it("keeps reminder helpers behind their subpath", () => {
    expect(Object.keys(reminders).sort()).toEqual([
      "formatRelativeDue",
      "getDueStateTone",
    ]);
    expect("formatRelativeDue" in morass).toBe(false);
  });
});
