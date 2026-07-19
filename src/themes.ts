export type MorassTokenName = `--m-${string}`;

export type MorassTheme = Record<MorassTokenName, string>;

/**
 * Snapshots of the styles.css token blocks, enforced equal by
 * styles.test.ts. `light` mirrors :root; `dark` mirrors
 * [data-m-theme="dark"] and is an overlay — it only carries the tokens
 * that block declares.
 */
export const themes: { light: MorassTheme; dark: MorassTheme } = {
  light: {
    "--m-color-bg": "#f7f4ef",
    "--m-color-surface": "#ffffff",
    "--m-color-surface-muted": "#f0f7f4",
    "--m-color-text": "#1d2524",
    "--m-color-text-muted": "#5f6d6a",
    "--m-color-border": "#d9ded8",
    "--m-color-primary": "#1d766f",
    "--m-color-primary-strong": "#115c56",
    "--m-color-danger": "#b42318",
    "--m-color-danger-bg": "#fef3f2",
    "--m-color-warning": "#b45309",
    "--m-color-warning-bg": "#fff7ed",
    "--m-color-success": "#047857",
    "--m-color-success-bg": "#ecfdf3",
    "--m-color-info": "#1d4ed8",
    "--m-color-info-bg": "#eff6ff",
    "--m-color-neutral": "#384642",
    "--m-color-neutral-bg": "#eef1ef",
    "--m-color-on-primary": "#ffffff",
    "--m-color-sidebar-bg": "#143330",
    "--m-color-sidebar-text": "#f8faf8",
    "--m-color-step-bg": "#ebede9",
    "--m-color-input-bg": "#ffffff",
    "--m-color-header-bg": "rgb(255 255 255 / 0.92)",
    "--m-color-backdrop": "rgb(15 23 42 / 0.44)",
    "--m-focus-ring": "rgb(29 118 111 / 0.25)",
    "--m-shadow-modal": "0 24px 80px rgb(15 23 42 / 0.24)",
    "--m-radius": "8px",
    "--m-shadow": "0 16px 40px rgb(29 37 36 / 0.08)",
    "--m-font":
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  dark: {
    "--m-color-bg": "#121817",
    "--m-color-surface": "#1a2321",
    "--m-color-surface-muted": "#15201d",
    "--m-color-text": "#e6ebe9",
    "--m-color-text-muted": "#9fb0ac",
    "--m-color-border": "#2c3835",
    "--m-color-primary": "#3ba69d",
    "--m-color-primary-strong": "#5fc0b7",
    "--m-color-danger": "#f97066",
    "--m-color-danger-bg": "rgb(180 35 24 / 0.16)",
    "--m-color-warning": "#fdb022",
    "--m-color-warning-bg": "rgb(180 83 9 / 0.16)",
    "--m-color-success": "#4cc38a",
    "--m-color-success-bg": "rgb(4 120 87 / 0.16)",
    "--m-color-info": "#7ba6f7",
    "--m-color-info-bg": "rgb(29 78 216 / 0.16)",
    "--m-color-neutral": "#b8c4c0",
    "--m-color-neutral-bg": "#243230",
    "--m-color-on-primary": "#0c1514",
    "--m-color-sidebar-bg": "#0e2523",
    "--m-color-sidebar-text": "#e6ebe9",
    "--m-color-step-bg": "#243230",
    "--m-color-input-bg": "#151d1b",
    "--m-color-header-bg": "rgb(26 35 33 / 0.92)",
    "--m-color-backdrop": "rgb(0 0 0 / 0.6)",
    "--m-focus-ring": "rgb(95 192 183 / 0.35)",
    "--m-shadow": "0 16px 40px rgb(0 0 0 / 0.4)",
    "--m-shadow-modal": "0 24px 80px rgb(0 0 0 / 0.55)",
  },
};
