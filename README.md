# Morass

Morass is a small React UI framework for durable product interfaces: app shells, dense dashboards, forms, modal workflows, and status-heavy operational views.

Morass is the standard UI package for the Effigy Analytics suite. It was born inside Webbery, but its public API is generic: primitives only, no product domain logic in the root export.

## Status

- TypeScript React package, MIT licensed
- ESM and CommonJS library builds with typed exports
- CSS token, light/dark theme, and contrast-validation system
- Tested field, tab, modal, keyboard, focus, and reduced-motion behavior, with structural checks for forced-color fallbacks
- CI gates for formatting, lint, types, tests, build, package integrity, and consumer installation

## Installation

Public npmjs is the canonical registry. Installation requires no account, token, or private registry configuration:

```bash
npm install @effigy-analytics/morass
```

If an existing project points the entire `@effigy-analytics` scope at GitHub Packages, remove that override or explicitly restore npmjs before installing Morass:

```
@effigy-analytics:registry=https://registry.npmjs.org
```

npm registry selection is scope-wide. If the same project still consumes private GitHub-only packages under `@effigy-analytics`, do not blindly replace the mapping: plan a registry/lockfile transition or move those packages to a distinct scope first.

The canonical hosted showcase is [effigy-analytics.com/morass](https://effigy-analytics.com/morass). It is a versioned consumer and can lag an unreleased package change; its displayed version is the source of truth for what the hosted page is exercising.

## Development

```bash
npm ci
npm run check
npm run install:check
```

## Public API

```tsx
import { AppFrame, Button, Card, StatusPill } from "@effigy-analytics/morass";
import "@effigy-analytics/morass/styles.css";
```

Primitives: `AppFrame`, `ShellLayout`, `Button`, `ButtonLink`, `Card`, `Hero`, `PageHeader`, `PageSection`, `EmptyState`, `NotFound`, `TextField`, `SelectField`, `StatusPill`, `Metric`, `Tabs`, `ProgressSteps`, and `Modal`, plus theme, contrast, material, tone, and class-name helpers.

`Tabs` requires one of two honest semantic modes. Use `mode="tabs"` with active content to render a linked tablist and tabpanel; use `mode="selection"` without children for filter-like selection buttons:

```tsx
<Tabs
  aria-label="Report sections"
  mode="tabs"
  tabs={tabs}
  value={section}
  onValueChange={setSection}
>
  <ReportSection section={section} />
</Tabs>
```

See the [public contract](docs/public-contract.md) for component caveats, supported CSS surfaces, accessibility boundaries, and runtime compatibility.

### Theming

All normal-theme colors flow through `--m-*` custom properties. Forced-colors rules intentionally use operating-system color keywords such as `Highlight` and `ButtonText`. The stylesheet is wrapped in `@layer morass`, so unlayered application CSS — including token overrides — always wins, regardless of stylesheet import order.

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

Morass's design contracts are documented and machine-enforced. `@layer`
guarantees your unlayered overrides win. `REQUIRED_PAIRS` covers component
text at WCAG AA 4.5:1 and the form-control boundary and focus indicator at
WCAG non-text contrast 3:1, including sidebar and Modal-backdrop focus contexts. `validateTheme` composites translucent
backgrounds the way the browser does.

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
out of range—a mistyped token must not pass vacuously. Decorative dividers
remain outside the contrast contract; control boundaries and focus rings do not.

### Subpath: reminders

Due-date presentation helpers (`DueState`, `getDueStateTone`, `formatRelativeDue`) live behind a subpath export so the root API stays purely generic:

```ts
import {
  formatRelativeDue,
  getDueStateTone,
} from "@effigy-analytics/morass/reminders";
```

Moved out of the root export in 0.2.0.

## Compatibility and migration

Morass supports browser-DOM React applications using React and React DOM 18.2 or 19. The JavaScript build targets ES2022; supported browsers must also provide CSS custom properties, CSS Cascade Layers, and the documented media-query behavior. React Native, legacy browsers, React Server Components, and exact historical browser-version floors are not currently claimed.

- [Public contract](docs/public-contract.md)
- [Migrating 0.4–0.6 consumers to the 0.7 baseline](docs/migrations/0.7.md)
- [GitHub issues](https://github.com/effigy-analytics/morass/issues) for support and defects
- [Private security report](https://github.com/effigy-analytics/morass/security/advisories/new) for vulnerabilities

## Release Boundary

Morass is consumed by Effigy Analytics products (Webbery today, the platform apps as they adopt it) as a versioned package. Treat these surfaces as public within a published version:

- exports from `@effigy-analytics/morass`
- exports from `@effigy-analytics/morass/reminders`
- `@effigy-analytics/morass/styles.css`
- the documented `--m-*` tokens and material utility classes
- component semantics and required peer dependency ranges

Breaking changes require a coordinated consumer update and a major version or explicit release note (pre-1.0, breaking changes ride minor versions and are called out in release notes). Consumers should pin Morass to a published version instead of depending on a live sibling checkout.

Before publishing:

```bash
npm run check
```

`npm run check` verifies version and export integrity and includes
`npm pack --dry-run` after the library build. CI also installs and typechecks the packed artifact
without credentials against React 18 and 19. Publication runs only from a GitHub
release tag matching `v<package.json version>` on canonical `main`; one tarball is
published to npmjs, verified by integrity and commit, anonymously installed, and then
mirrored byte-for-byte to GitHub Packages.

## License

[MIT](LICENSE)
