# Changelog

All notable Morass changes should be recorded here before publishing a package version.

## 0.4.1

- `validateTheme` now throws on out-of-range or non-numeric `rgb()` channels and alpha (e.g. `rgb(300 0 0)`, alpha `1.5`) instead of computing nonsense or passing NaN ratios vacuously.
- `PairFailure.bg` is a fresh array per failure — it no longer aliases the `REQUIRED_PAIRS` entry, so callers can't mutate the exported contract.
- `Modal` focus trap recaptures Tab/Shift+Tab when focus has escaped the panel, instead of letting it walk the background page.
- `Tabs` keeps the first tab keyboard-reachable (`tabIndex 0`) when `value` matches no tab; previously every tab was `-1` and the tablist was unreachable.
- Internal: `Modal`'s `onClose` ref is updated in an insertion effect (concurrent-render safe with no stale-handler window before paint); `themes` lists `light` before `dark` to match the base/overlay relationship.

## 0.4.0

- Themes as data: `themes.light` / `themes.dark` exported as token records, enforced in sync with the stylesheet by test.
- Contrast contract: `REQUIRED_PAIRS` (21 usage-audited text pairs, WCAG AA 4.5:1 uniform, alpha chains composited) and pure `validateTheme` for consumer CI. Throws loudly on missing or unparseable contract tokens.
- Palette fix: light `--m-color-step-bg` `#e6e9e6` → `#ebede9` (inactive ProgressSteps badge 4.42 → 4.59, the one failing pair).
- `Modal` moves focus into the panel on open, traps Tab, closes on Escape, and restores focus on close.
- `Tabs` roving tabindex: inactive tabs leave the Tab order; Arrow/Home/End move selection.

## 0.3.0

- **Behavior change:** morass now follows the OS dark-mode preference when no `data-m-theme` attribute is set. Pin `data-m-theme="light"` on `<html>` to keep always-light rendering.
- Built-in dark theme: set `data-m-theme="dark"` on any subtree. Themes are plain token sets; custom themes are consumer CSS.
- Every color is now a `--m-*` token (new: neutral pill, sidebar, progress step, input, header, backdrop, focus ring, modal shadow, on-primary) — enforced by test.
- Entire stylesheet moved into `@layer morass`: consumer CSS and token overrides win regardless of import order.
- `AppFrame` lays out single-column when no `sidebar` is provided (previously content landed in the 248px sidebar track).
- New `ButtonLink`: anchor with Button styling, for CTAs and marketing links.
- `Card` gains a `footer` slot for card-level actions.
- New marketing primitives: `Hero` (eyebrow/title/lede/actions) and `PageSection` (label + content).

## 0.1.1

- Move package ownership to the Effigy Analytics GitHub organization as `@effigy-analytics/morass`.

## 0.1.0

- Initial private package foundation for Webbery.
- React primitives for app shells, cards, controls, tabs, modals, progress, status, and reminder-oriented interfaces.
- CSS token system exported through `@kevinblum/morass/styles.css`.
