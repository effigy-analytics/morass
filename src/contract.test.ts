import { describe, expect, it } from "vitest";
import { REQUIRED_PAIRS, validateTheme } from "./contract";
import { themes } from "./themes";

function themeWith(overrides: Record<string, string>) {
  return { ...themes.light, ...overrides };
}

describe("validateTheme", () => {
  it("gives black-on-white the maximum ratio", () => {
    const result = validateTheme(
      themeWith({ "--m-color-text": "#000000", "--m-color-bg": "#ffffff" }),
    );
    const pair = result.failures.find(
      (failure) => failure.fg === "--m-color-text",
    );
    expect(pair).toBeUndefined();
  });

  it("fails the 0.2.1 white-on-teal regression at ~2.4:1", () => {
    const result = validateTheme(
      themeWith({
        "--m-color-primary": "#5bb89c",
        "--m-color-on-primary": "#ffffff",
      }),
    );
    expect(result.ok).toBe(false);
    const failure = result.failures.find(
      (candidate) =>
        candidate.fg === "--m-color-on-primary" &&
        candidate.bg[0] === "--m-color-primary",
    );
    expect(failure).toBeDefined();
    expect(failure?.ratio).toBeGreaterThan(2.3);
    expect(failure?.ratio).toBeLessThan(2.5);
    expect(failure?.required).toBe(4.5);
  });

  it("composites alpha backgrounds over their chain", () => {
    // dark danger pill: #f97066 over rgb(180 35 24 / 0.16) over #1a2321
    // over #121817 — hand-computed ratio 5.39.
    const result = validateTheme(themes.dark);
    expect(result.ok).toBe(true);
  });

  it("reports a failure for an alpha bg that only works composited", () => {
    // Full-opacity dark danger-bg would be #b42318; danger text #f97066
    // on it is ~2.7:1 — proves compositing (not raw value) is measured.
    const result = validateTheme(
      themeWith({
        "--m-color-danger": "#f97066",
        "--m-color-danger-bg": "#b42318",
        "--m-color-surface": "#1a2321",
        "--m-color-bg": "#121817",
      }),
    );
    const failure = result.failures.find(
      (candidate) => candidate.fg === "--m-color-danger",
    );
    expect(failure).toBeDefined();
  });

  it("throws with the token name when a contract token is missing", () => {
    const theme = { ...themes.light };
    delete (theme as Record<string, string>)["--m-color-on-primary"];
    expect(() => validateTheme(theme)).toThrow("--m-color-on-primary");
  });

  it("throws with the token name on an unparseable value", () => {
    expect(() =>
      validateTheme(themeWith({ "--m-color-primary": "teal" })),
    ).toThrow("--m-color-primary");
  });

  it("ignores tokens outside the contract", () => {
    expect(() =>
      validateTheme(themeWith({ "--m-shadow": "not-a-color" })),
    ).not.toThrow();
  });

  it("names a real surface for every pair", () => {
    for (const pair of REQUIRED_PAIRS) {
      expect(pair.context.length).toBeGreaterThan(0);
      expect(pair.bg.length).toBeGreaterThan(0);
    }
  });
});
