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

  it("returns failure bg chains that do not alias REQUIRED_PAIRS", () => {
    const result = validateTheme(
      themeWith({
        "--m-color-primary": "#5bb89c",
        "--m-color-on-primary": "#ffffff",
      }),
    );
    const failure = result.failures.find(
      (candidate) => candidate.bg[0] === "--m-color-primary",
    );
    const contractPair = REQUIRED_PAIRS.find(
      (pair) => pair.bg[0] === "--m-color-primary",
    );
    expect(failure).toBeDefined();
    expect(failure?.bg).toEqual(contractPair?.bg);
    expect(failure?.bg).not.toBe(contractPair?.bg);
  });

  it("names a real surface for every pair", () => {
    for (const pair of REQUIRED_PAIRS) {
      expect(pair.context.length).toBeGreaterThan(0);
      expect(pair.bg.length).toBeGreaterThan(0);
    }
  });

  it("throws on an rgb() channel above 255 instead of computing nonsense", () => {
    expect(() =>
      validateTheme(themeWith({ "--m-color-primary": "rgb(300 0 0)" })),
    ).toThrow("--m-color-primary");
  });

  it("throws on an alpha above 1", () => {
    expect(() =>
      validateTheme(themeWith({ "--m-color-primary": "rgb(0 0 0 / 1.5)" })),
    ).toThrow("--m-color-primary");
  });

  it("throws on a NaN alpha instead of passing vacuously", () => {
    // "1.5.2" matches [\d.]+ but Number() yields NaN; NaN ratios compare
    // false against the threshold, so without a guard this silently passes.
    expect(() =>
      validateTheme(themeWith({ "--m-color-primary": "rgb(0 0 0 / 1.5.2)" })),
    ).toThrow("--m-color-primary");
  });

  it("rejects a malformed rgb() value without catastrophic backtracking", () => {
    const start = performance.now();
    expect(() =>
      validateTheme(
        themeWith({ "--m-color-primary": `rgb(9 9 9${" ".repeat(10000)}` }),
      ),
    ).toThrow("--m-color-primary");
    expect(performance.now() - start).toBeLessThan(1000);
  });

  it("keeps the warm-paper light theme AA-clean", () => {
    const result = validateTheme(themes.light);
    expect(result.ok).toBe(true);
  });

  it("enforces 3:1 control-boundary and focus-indicator contrast", () => {
    const nonTextPairs = REQUIRED_PAIRS.filter((pair) => pair.required === 3);
    expect(nonTextPairs.length).toBeGreaterThanOrEqual(6);
    expect(nonTextPairs.map((pair) => pair.context)).toEqual(
      expect.arrayContaining([
        "focus indicator in AppFrame sidebar",
        "Modal panel focus indicator over backdrop",
      ]),
    );
    expect(validateTheme(themes.light).failures).toEqual([]);
    expect(validateTheme(themes.dark).failures).toEqual([]);

    const result = validateTheme(
      themeWith({ "--m-focus-ring": "rgb(29 118 111 / 0.25)" }),
    );
    const focusFailures = result.failures.filter((failure) =>
      failure.context.startsWith("focus indicator"),
    );
    expect(focusFailures.length).toBeGreaterThan(0);
    expect(focusFailures.every((failure) => failure.required === 3)).toBe(true);
  });
});

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

describe("validateTheme with declared semantic pairs", () => {
  const appTokens = {
    "--app-accent": "#1f5f8b",
    "--app-accent-on-surface": "#173a4a",
    "--app-note-surface": "#fff4c2",
  };
  const appTheme = { ...themes.light, ...appTokens };

  it("is backward compatible when no options are given", () => {
    expect(validateTheme(themes.light)).toEqual(
      validateTheme(themes.light, {}),
    );
    expect(validateTheme(themes.light, { pairs: [] })).toEqual(
      validateTheme(themes.light),
    );
  });

  it("passes a custom pair that meets AA on its declared surface", () => {
    const result = validateTheme(appTheme, {
      pairs: [
        {
          bg: ["--app-note-surface"],
          context: "accent text on note surface",
          fg: "--app-accent-on-surface",
        },
      ],
    });
    expect(result.failures).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("reports a failing custom pair with its tokens, context and ratio", () => {
    const result = validateTheme(
      { ...appTheme, "--app-accent": "#9c9884" },
      {
        pairs: [
          {
            bg: ["--app-note-surface"],
            context: "accent on note surface",
            fg: "--app-accent",
          },
        ],
      },
    );
    expect(result.ok).toBe(false);
    expect(result.failures).toHaveLength(1);
    const [failure] = result.failures;
    expect(failure.fg).toBe("--app-accent");
    expect(failure.bg).toEqual(["--app-note-surface"]);
    expect(failure.context).toBe("accent on note surface");
    expect(failure.required).toBe(4.5);
    expect(failure.ratio).toBeLessThan(4.5);
  });

  it("checks the same fg against each surface independently", () => {
    const result = validateTheme(
      { ...appTheme, "--app-dark-surface": "#173a4a" },
      {
        pairs: [
          {
            bg: ["--app-note-surface"],
            context: "on light note",
            fg: "--app-accent-on-surface",
          },
          {
            bg: ["--app-dark-surface"],
            context: "on dark note",
            fg: "--app-accent-on-surface",
          },
        ],
      },
    );
    expect(result.failures.map((failure) => failure.context)).toEqual([
      "on dark note",
    ]);
  });

  it("honors a per-pair required ratio", () => {
    const pair = {
      bg: ["--app-note-surface"],
      context: "non-text accent",
      fg: "--app-accent",
    } as const;
    expect(
      validateTheme(appTheme, { pairs: [{ ...pair, required: 3 }] }).ok,
    ).toBe(true);
    const strict = validateTheme(appTheme, {
      pairs: [{ ...pair, required: 12 }],
    });
    expect(strict.failures[0]?.required).toBe(12);
  });

  it("composites alpha surfaces over the declared chain", () => {
    const theme = {
      ...appTheme,
      "--app-tint": "rgb(0 0 0 / 0.5)",
      "--app-tint-text": "#ffffff",
      "--app-black": "#000000",
    };
    const chain = (bg: [`--${string}`, ...`--${string}`[]]) =>
      validateTheme(theme, {
        pairs: [{ bg, context: "tint", fg: "--app-tint-text" }],
      });
    // white on 50% black over white (#808080) is ~3.9:1; over bare black it is 21:1.
    expect(chain(["--app-tint", "--m-color-bg"]).ok).toBe(false);
    expect(chain(["--app-tint", "--app-black"]).ok).toBe(true);
    expect(
      chain(["--app-tint", "--m-color-bg"]).failures[0]?.ratio,
    ).toBeGreaterThan(3.5);
  });

  it("reports built-in failures before custom failures", () => {
    const result = validateTheme(
      {
        ...appTheme,
        "--m-color-primary": "#5bb89c",
        "--app-accent": "#9c9884",
      },
      {
        pairs: [
          {
            bg: ["--app-note-surface"],
            context: "accent on note surface",
            fg: "--app-accent",
          },
        ],
      },
    );
    const contexts = result.failures.map((failure) => failure.context);
    expect(contexts.length).toBeGreaterThan(1);
    expect(contexts[contexts.length - 1]).toBe("accent on note surface");
    expect(contexts[0]).not.toBe("accent on note surface");
  });

  it("throws naming a custom token that is missing from the theme", () => {
    expect(() =>
      validateTheme(appTheme, {
        pairs: [
          {
            bg: ["--app-note-surface"],
            context: "typo",
            fg: "--app-acent",
          },
        ],
      }),
    ).toThrow("--app-acent");
  });

  it("throws naming a custom token with an unparseable value", () => {
    expect(() =>
      validateTheme(
        { ...appTheme, "--app-accent": "teal" },
        {
          pairs: [
            {
              bg: ["--app-note-surface"],
              context: "bad value",
              fg: "--app-accent",
            },
          ],
        },
      ),
    ).toThrow("--app-accent");
  });

  it("throws on a pair with an empty bg chain", () => {
    expect(() =>
      validateTheme(appTheme, {
        pairs: [{ bg: [], context: "no surface", fg: "--app-accent" }],
      }),
    ).toThrow("no surface");
  });

  it("throws on a non-finite or sub-1 required ratio", () => {
    for (const required of [Number.NaN, 0, -3, Number.POSITIVE_INFINITY]) {
      expect(() =>
        validateTheme(appTheme, {
          pairs: [
            {
              bg: ["--app-note-surface"],
              context: "bad threshold",
              fg: "--app-accent",
              required,
            },
          ],
        }),
      ).toThrow("bad threshold");
    }
  });

  it("returns failure bg chains that do not alias the declared pair", () => {
    const bg: `--${string}`[] = ["--app-note-surface"];
    const result = validateTheme(
      { ...appTheme, "--app-accent": "#9c9884" },
      { pairs: [{ bg, context: "alias", fg: "--app-accent" }] },
    );
    expect(result.failures[0]?.bg).toEqual(bg);
    expect(result.failures[0]?.bg).not.toBe(bg);
  });

  it("does not mutate REQUIRED_PAIRS or the declared pairs", () => {
    const before = REQUIRED_PAIRS.length;
    const pairs = [
      {
        bg: ["--app-note-surface"],
        context: "stable",
        fg: "--app-accent-on-surface",
      },
    ] as const;
    validateTheme(appTheme, { pairs });
    expect(REQUIRED_PAIRS).toHaveLength(before);
    expect(pairs).toHaveLength(1);
  });
});

describe("built-in themes satisfy the contract", () => {
  it.each(["light", "dark"] as const)("%s theme validates clean", (name) => {
    const result = validateTheme(themes[name]);
    expect(result.failures).toEqual([]);
    expect(result.ok).toBe(true);
  });
});
