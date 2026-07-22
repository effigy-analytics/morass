# Morass 0.7 public contract

This document describes the supported 0.7 package surface. It deliberately distinguishes shipped behavior from future design-system direction.

## Package and runtime

- Public npmjs is canonical: `npm install @effigy-analytics/morass` requires no token.
- The root package ships typed ESM and CommonJS builds. `./reminders` is a separate typed subpath and `./styles.css` is the stylesheet subpath.
- React and React DOM `^18.2.0 || ^19.0.0` are peers. CI exercises the minimum React 18 line and the repository's pinned React 19 line as disposable consumers.
- Components target browser DOM applications. React Native, React Server Components, and hydration-specific guarantees are not part of the 0.7 contract.
- The JavaScript build target is ES2022. CSS requires custom properties, Cascade Layers, `prefers-color-scheme`, and `prefers-reduced-motion`; forced-colors behavior is supplied where the browser exposes that media query. Morass supports modern evergreen browsers with those capabilities rather than promising historical version floors that are not browser-tested.
- Import `@effigy-analytics/morass/styles.css` once at the application entry. The stylesheet sets global `box-sizing` and the `body` background, foreground, margin, and font.

## Component surface

| Area            | Exports and supported behavior                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Structure       | `AppFrame`, `ShellLayout`, `Hero`, `PageHeader`, and `PageSection` support their documented slots. `ShellLayout` is intentionally Effigy-flavored; the case-sensitive values empty, `prod`, and `production` are hidden. `Hero` and `PageHeader` render `h1`.                                                                                                                                                                                          |
| Content         | `Card`, `EmptyState`, and `NotFound` support their typed content and action slots. Their titles render `h2`, `h3`, and `h1` respectively. Consumers remain responsible for placing those fixed levels in a coherent page hierarchy.                                                                                                                                                                                                                    |
| Actions         | `Button` is a native button and defaults to `type="button"`. `ButtonLink` is an anchor; it does not emulate disabled-button behavior. Icon-only actions need a consumer-supplied accessible name.                                                                                                                                                                                                                                                      |
| Forms           | `TextField` and `SelectField` label their controls, merge caller descriptions with help/error descriptions, and set `aria-invalid` when an error is present. An explicit control `id` wins; otherwise `labelProps.htmlFor` becomes the shared control/label ID before Morass generates one. Form validation and error timing remain application concerns.                                                                                              |
| Status/data     | `StatusPill`, `ProgressSteps`, and `Metric` provide presentation and state semantics. `Metric` is intended inside a consumer-owned `<dl>`. Color is never sufficient as the application's only status signal.                                                                                                                                                                                                                                          |
| Tabs/selections | `Tabs` requires an explicit mode. `mode="tabs"` with children renders a tablist plus one active tabpanel with bidirectional ID relationships and automatic keyboard activation. `mode="selection"` renders an `aria-pressed` selection group for filters and segmented choices and forbids children. In tab mode, an unmatched value falls back to the first item for a coherent selected-tab/panel relationship; an empty item list renders no panel. |
| Modal           | `Modal` supplies an `h2`-named `aria-modal` dialog, initial focus, Escape dismissal, focus trapping, and focus restoration. It does not make the rest of the application inert, lock body scrolling, manage nested dialogs, or choose application confirmation semantics.                                                                                                                                                                              |

The public component contract covers exported names, TypeScript props, documented slots, semantics, and tested keyboard behavior. The rendered internal BEM classes—such as `.m-card__*`, `.m-button__*`, and `.m-app-frame__*`—are implementation details and are not supported override points.

## Theme and CSS surface

`themes.light` is the complete base token record. `themes.dark` is an overlay that inherits structural tokens such as radius and font. Explicit `data-m-theme="light"` and `data-m-theme="dark"` pin native and Morass colors; no attribute follows the operating-system preference. Attributes may scope a subtree.

All `--m-*` names declared by the 0.7 base theme are public during the 0.7 line. A pre-1 minor release may revise them with a migration note. Consumer JavaScript themes should start with `themes.light`; CSS themes may override only the tokens they need because custom properties cascade.

The supported material utility classes are:

- `.m-canvas-grid`
- `.m-paper` and the combined `.m-paper.m-paper--taped`
- `.m-postit`
- `.m-felt` plus one complete swatch modifier: `.m-felt--sage`, `.m-felt--butter`, `.m-felt--rose`, `.m-felt--sky`, or `.m-felt--lavender`
- `.m-stitch`

`validateTheme` checks exported `REQUIRED_PAIRS`: component text uses a 4.5:1 threshold and the input boundary and focus indicator use 3:1, including the AppFrame sidebar and composited Modal backdrop. It throws for missing, invalid, or out-of-range contract colors. This validates the declared Morass pairs, not every combination an application can create, its semantics, or its complete accessibility. Normal-theme colors use tokens; forced-colors fallbacks intentionally use operating-system color keywords.

## Accessibility verification

Automated checks cover field relationships, dialog naming/focus, tab and selection keyboard behavior, explicit/OS light-dark token synchronization, text and non-text contrast, the structure of forced-color fallbacks, reduced motion, and native control color schemes. A real forced-colors browser environment remains a manual consumer check.

Before shipping a consumer, also verify:

1. Keyboard order, visible focus, Modal close/restore behavior, and the chosen tab or selection semantics.
2. Explicit light, explicit dark, and OS-selected color behavior.
3. Windows High Contrast or another real forced-colors environment.
4. Reduced-motion behavior.
5. Mobile layout, zoom/reflow, application landmarks, headings, names, errors, and status announcements.

Morass reduces repeated accessibility work; it does not certify a consuming application.

## Versioning, support, and demonstration

Patch releases within a 0.x minor preserve source and documented semantic compatibility unless a security correction makes that impossible. A pre-1 minor may make coordinated breaking changes and must include a migration note. Consumers should pin a published version during migrations instead of depending on a sibling checkout.

The [hosted showcase](https://effigy-analytics.com/morass) is the canonical visual consumer and displays the package version in its build. It can lag an unreleased package branch and is upgraded separately; an HTTP 200 alone is not package compatibility evidence.

Use [GitHub issues](https://github.com/effigy-analytics/morass/issues) for public defects and support. Report vulnerabilities through [GitHub's private security advisory form](https://github.com/effigy-analytics/morass/security/advisories/new). Support is best-effort and has no response-time SLA.
