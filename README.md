# Morass

Morass is a small React UI framework for durable product interfaces: app shells, dense dashboards, forms, modal workflows, and status-heavy operational views.

Morass is the standard UI package for the Effigy Analytics suite. It was born inside Webbery, but its public API is generic: primitives only, no product domain logic in the root export.

## Status

- TypeScript React package, MIT licensed
- Vite library build
- CSS token system
- Accessible primitives for shell, cards, controls, tabs, modals, progress, and status
- CI-ready lint, typecheck, test, and build scripts

## Installation

The package is published to the public npm registry — no authentication or registry configuration needed:

```bash
npm install @effigy-analytics/morass
```

It is also mirrored to GitHub Packages. Unlike npmjs, GitHub Packages requires authentication even for public packages; only use it if your project already points the `@effigy-analytics` scope there, and provide a token with `read:packages`:

```
@effigy-analytics:registry=https://npm.pkg.github.com
```

## Development

```bash
npm install
npm run check
npm run build
```

## Public API

```tsx
import { AppFrame, Button, Card, StatusPill } from "@effigy-analytics/morass";
import "@effigy-analytics/morass/styles.css";
```

Primitives: `AppFrame`, `Button`, `ButtonLink`, `Card`, `TextField`, `SelectField`, `StatusPill`, `Metric`, `Tabs`, `ProgressSteps`, `Modal`, `Hero`, `PageSection`, plus shared tone/utility helpers.

### Theming

All colors flow through `--m-*` custom properties. The stylesheet is wrapped in `@layer morass`, so unlayered application CSS — including token overrides — always wins, regardless of stylesheet import order.

A theme is a token set. Morass ships two:

- **Default (light):** declared at `:root`.
- **Dark:** applied when an ancestor has `data-m-theme="dark"`, or automatically when the OS prefers dark and no `data-m-theme` attribute is set.

```text
<html data-m-theme="dark">   force dark
<html data-m-theme="light">  force light (disables OS auto-switching)
<html>                       follow the OS preference
```

Tokens cascade, so `data-m-theme` works on any subtree, not just the document root. Custom themes are plain CSS — override any `--m-*` token in unlayered styles, or define a named theme:

```css
[data-m-theme="parchment"] {
  --m-color-bg: #f4ead8;
  --m-color-text: #3a3226;
}
```

The full token list lives at the top of `styles.css`.

### Theme contract

morass's design contracts are machine-enforced, not documented. `@layer`
guarantees your overrides win; the contrast contract guarantees your
theme stays readable. Every fg/bg pair the components render as text is
listed in `REQUIRED_PAIRS`, and `validateTheme` checks any theme against
it at WCAG AA (4.5:1), compositing translucent backgrounds the way the
browser does.

Validate a remapped theme in your own CI:

```ts
import { themes, validateTheme } from "@effigy-analytics/morass";

const result = validateTheme({
  ...themes.light,
  "--m-color-primary": "#5bb89c",
  "--m-color-on-primary": "#ffffff",
});
// result.ok === false
// result.failures[0] →
// { fg: "--m-color-on-primary", bg: ["--m-color-primary"],
//   ratio: 2.39, required: 4.5, context: "primary Button label" }
```

To validate the theme a page actually renders (after your own CSS), pull
the live values and pass them in:

```js
const styles = getComputedStyle(document.documentElement);
const theme = Object.fromEntries(
  Object.keys(themes.light).map((token) => [
    token,
    styles.getPropertyValue(token).trim(),
  ]),
);
validateTheme(theme);
```

`validateTheme` throws if a contract token is missing, unparseable, or
out of range — a typo'd token must not pass as vacuously valid. Borders and focus rings
are not in contract v1 (they're a divider aesthetic, not text); see the
0.4.0 design doc for the rationale.

### Subpath: reminders

Due-date presentation helpers (`DueState`, `getDueStateTone`, `formatRelativeDue`) live behind a subpath export so the root API stays purely generic:

```ts
import {
  formatRelativeDue,
  getDueStateTone,
} from "@effigy-analytics/morass/reminders";
```

Moved out of the root export in 0.2.0.

## Release Boundary

Morass is consumed by Effigy Analytics products (Webbery today, the platform apps as they adopt it) as a versioned package. Treat these surfaces as public within a published version:

- exports from `@effigy-analytics/morass`
- exports from `@effigy-analytics/morass/reminders`
- `@effigy-analytics/morass/styles.css`
- CSS custom properties intended for application theming
- component semantics and required peer dependency ranges

Breaking changes require a coordinated consumer update and a major version or explicit release note (pre-1.0, breaking changes ride minor versions and are called out in release notes). Consumers should pin Morass to a published version instead of depending on a live sibling checkout.

Before publishing:

```bash
npm run check
```

`npm run check` includes `npm pack --dry-run` after the library build, so CI
verifies the publishable package contents before a release. Then publish through
the GitHub Actions `Publish` workflow from a GitHub release whose tag matches
`v<package.json version>`.

## License

[MIT](LICENSE)
