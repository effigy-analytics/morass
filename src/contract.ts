import type { MorassTheme, MorassTokenName } from "./themes";

export interface RequiredPair {
  /** Compositing chain, topmost first; the last entry must be opaque. */
  bg: MorassTokenName[];
  /** Where this combination renders. */
  context: string;
  fg: MorassTokenName;
}

export interface PairFailure {
  bg: MorassTokenName[];
  context: string;
  fg: MorassTokenName;
  ratio: number;
  required: number;
}

export interface ValidationResult {
  failures: PairFailure[];
  ok: boolean;
}

const REQUIRED = 4.5;

/**
 * The contrast contract: every fg/bg combination the components render as
 * text, at WCAG AA 4.5:1 (uniform — no large-text carve-out). Borders and
 * focus rings are deliberately out of contract v1: the built-in soft
 * borders are a divider aesthetic, and bringing WCAG 1.4.11 non-text
 * contrast into the contract would force a palette change on every
 * consumer. See docs/superpowers/specs/2026-07-19-morass-0.4.0-design.md.
 */
export const REQUIRED_PAIRS: readonly RequiredPair[] = [
  {
    bg: ["--m-color-bg"],
    context: "body text on page bg",
    fg: "--m-color-text",
  },
  {
    bg: ["--m-color-surface"],
    context: "text on Card/Modal/nav surface",
    fg: "--m-color-text",
  },
  {
    bg: ["--m-color-surface-muted"],
    context: "text on muted surface (ghost Button hover)",
    fg: "--m-color-text",
  },
  {
    bg: ["--m-color-input-bg"],
    context: "TextField/SelectField input text",
    fg: "--m-color-text",
  },
  {
    bg: ["--m-color-header-bg", "--m-color-bg"],
    context: "AppFrame header text over translucent header",
    fg: "--m-color-text",
  },
  {
    bg: ["--m-color-bg"],
    context: "muted text on page bg (ProgressSteps labels)",
    fg: "--m-color-text-muted",
  },
  {
    bg: ["--m-color-surface"],
    context: "muted text on surface (field help, Metric label, Hero lede)",
    fg: "--m-color-text-muted",
  },
  {
    bg: ["--m-color-surface-muted"],
    context: "muted text on muted surface",
    fg: "--m-color-text-muted",
  },
  {
    bg: ["--m-color-step-bg", "--m-color-bg"],
    context: "inactive ProgressSteps number badge",
    fg: "--m-color-text-muted",
  },
  {
    bg: ["--m-color-primary"],
    context: "primary Button label",
    fg: "--m-color-on-primary",
  },
  {
    bg: ["--m-color-primary-strong"],
    context: "primary Button hover label",
    fg: "--m-color-on-primary",
  },
  {
    bg: ["--m-color-danger"],
    context: "danger Button label",
    fg: "--m-color-on-primary",
  },
  {
    bg: ["--m-color-text"],
    context: "active Tabs label on text-colored bg",
    fg: "--m-color-on-primary",
  },
  {
    bg: ["--m-color-danger-bg", "--m-color-surface", "--m-color-bg"],
    context: "danger StatusPill",
    fg: "--m-color-danger",
  },
  {
    bg: ["--m-color-warning-bg", "--m-color-surface", "--m-color-bg"],
    context: "warning StatusPill",
    fg: "--m-color-warning",
  },
  {
    bg: ["--m-color-success-bg", "--m-color-surface", "--m-color-bg"],
    context: "success StatusPill",
    fg: "--m-color-success",
  },
  {
    bg: ["--m-color-info-bg", "--m-color-surface", "--m-color-bg"],
    context: "info StatusPill",
    fg: "--m-color-info",
  },
  {
    bg: ["--m-color-neutral-bg", "--m-color-surface", "--m-color-bg"],
    context: "neutral StatusPill",
    fg: "--m-color-neutral",
  },
  {
    bg: ["--m-color-surface"],
    context: "field error text on Card",
    fg: "--m-color-danger",
  },
  {
    bg: ["--m-color-bg"],
    context: "field error text on page bg",
    fg: "--m-color-danger",
  },
  {
    bg: ["--m-color-sidebar-bg"],
    context: "AppFrame sidebar nav text",
    fg: "--m-color-sidebar-text",
  },
];

type Rgba = [number, number, number, number];

/**
 * Range-checks every parsed color at the single point all formats return
 * through, so a future format branch cannot reintroduce a silent
 * nonsense-ratio or NaN pass-through.
 */
function parseColor(token: MorassTokenName, value: string): Rgba {
  const [r, g, b, alpha] = parseChannels(token, value);
  const inRange =
    [r, g, b].every(
      (channel) => Number.isFinite(channel) && channel >= 0 && channel <= 255,
    ) &&
    Number.isFinite(alpha) &&
    alpha >= 0 &&
    alpha <= 1;
  if (!inRange) {
    throw new Error(`validateTheme: out-of-range ${token} value "${value}"`);
  }
  return [r, g, b, alpha];
}

function parseChannels(token: MorassTokenName, value: string): Rgba {
  const text = value.trim();
  const hex = text.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (hex) {
    const packed = parseInt(hex[1], 16);
    return [
      packed >> 16,
      (packed >> 8) & 0xff,
      packed & 0xff,
      hex[2] === undefined ? 1 : parseInt(hex[2], 16) / 255,
    ];
  }
  const short = text.match(/^#([0-9a-f]{3})$/i);
  if (short) {
    const [r, g, b] = short[1].split("");
    return parseChannels(token, `#${r}${r}${g}${g}${b}${b}`);
  }
  const rgb = text.match(
    /^rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)(?:\s*[/,]\s*([\d.]+))?\s*\)$/,
  );
  if (rgb) {
    return [
      Number(rgb[1]),
      Number(rgb[2]),
      Number(rgb[3]),
      rgb[4] === undefined ? 1 : Number(rgb[4]),
    ];
  }
  throw new Error(`validateTheme: cannot parse ${token} value "${value}"`);
}

function tokenColor(theme: MorassTheme, token: MorassTokenName): Rgba {
  const value = theme[token];
  if (value === undefined) {
    throw new Error(`validateTheme: theme is missing contract token ${token}`);
  }
  return parseColor(token, value);
}

function over(
  top: Rgba,
  base: [number, number, number],
): [number, number, number] {
  const alpha = top[3];
  return [
    top[0] * alpha + base[0] * (1 - alpha),
    top[1] * alpha + base[1] * (1 - alpha),
    top[2] * alpha + base[2] * (1 - alpha),
  ];
}

function luminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number) => {
    const scaled = value / 255;
    return scaled <= 0.04045
      ? scaled / 12.92
      : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(
  fg: [number, number, number],
  bg: [number, number, number],
): number {
  const lighter = Math.max(luminance(fg), luminance(bg));
  const darker = Math.min(luminance(fg), luminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks a theme (built-in or consumer remap) against REQUIRED_PAIRS.
 * Pure and dependency-free; intended for tests/CI, never at runtime.
 * Throws when a contract token is missing or unparseable — a typo must
 * not pass as vacuously valid. Tokens outside the contract are ignored,
 * so passing a superset (e.g. scraped from getComputedStyle) is fine.
 */
export function validateTheme(theme: MorassTheme): ValidationResult {
  const failures: PairFailure[] = [];
  for (const pair of REQUIRED_PAIRS) {
    let base = tokenColor(theme, pair.bg[pair.bg.length - 1]).slice(0, 3) as [
      number,
      number,
      number,
    ];
    for (let index = pair.bg.length - 2; index >= 0; index -= 1) {
      base = over(tokenColor(theme, pair.bg[index]), base);
    }
    const fg = over(tokenColor(theme, pair.fg), base);
    const ratio = contrastRatio(fg, base);
    if (ratio < REQUIRED) {
      failures.push({
        bg: [...pair.bg],
        context: pair.context,
        fg: pair.fg,
        ratio: Math.round(ratio * 100) / 100,
        required: REQUIRED,
      });
    }
  }
  return { failures, ok: failures.length === 0 };
}
