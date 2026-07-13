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

The package is published to GitHub Packages under the `@effigy-analytics` scope. GitHub Packages requires authentication to install, even for public packages — consumers need an `.npmrc` pointing the scope at the registry and a token with `read:packages`:

```
@effigy-analytics:registry=https://npm.pkg.github.com
```

```bash
npm install @effigy-analytics/morass
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

Primitives: `AppFrame`, `Button`, `Card`, `TextField`, `SelectField`, `StatusPill`, `Metric`, `Tabs`, `ProgressSteps`, `Modal`, plus shared tone/utility helpers.

Morass ships unopinionated class names and CSS variables. Applications can override tokens at `:root` or inside a scoped theme container.

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
