# morass Materialist Design System — Design Spec

**Date:** 2026-07-21
**Status:** Direction approved (aesthetic + material-semantics mapping validated with Kevin via visual brainstorming, 2026-07-21). This spec defines the design; a phased implementation plan follows via the writing-plans skill.

## 1. Context & motivation

morass is being elevated from a deliberately narrow "proof-of-craft" kit into **the opinionated, public-facing UI system for all Effigy web properties** — the foundational format for how every Effigy site is structured. It becomes the **spiritual successor to `@effigy-analytics/effigy-ui`**, which enters terminal deprecation: once morass reaches parity and the four remaining consumers (awards, fiscally, steam-sage, declassify) migrate, effigy-ui is archived.

This supersedes, for the UI-system question specifically, the 2026-07-13 "attrition / no migration project" posture (Kevin, 2026-07-21): we are now actively investing in morass to make it complete and distinctive, and actively retiring effigy-ui.

**Aesthetic north star — craft materialism.** UIs that feel *tangible*, built from common household craft materials: paper, graph/notebook paper, fabric and felt, tape, post-it notes. A warm pastel palette. Opinionated and specific — a look nobody else in analytics has. This is not decoration for its own sake: the tactility and the material logic are the brand.

## 2. The core idea — `material = role` (the semantic contract)

Every surface is "made of" a craft material, and the material is chosen by the element's **role**, applied consistently and **lintably**. This is the differentiator and the reason it fits morass: `material → role` becomes a **machine-enforced design contract**, extending morass's existing `@layer` + no-raw-colors + `validateTheme` story. A control that renders as canvas, or a card that renders as a control, is a CI failure — not a code-review nit.

Three materials, three roles:

| Material | Role | Applies to |
|---|---|---|
| **Graph paper** | **The canvas** — the work surface everything sits on | App/page backgrounds, data tables, chart gridlines, form-field alignment |
| **Cut paper + tape** | **Content** — discrete pieces placed on the canvas | Cards, panels, dialogs, list items. The **post-it** variant = ephemeral notes, callouts, tooltips |
| **Felt + stitching** | **Controls & status** — durable, sewn-on, interactive/indicator bits | Buttons, badges, status pills, tags, toggles, chips |

Mental model: *a craft desk.* You work on graph-paper (canvas); you make and arrange cut-paper pieces (content), taping them down or leaving post-it notes; the interactive/labeling bits are felt patches sewn on with a visible stitch (controls & status).

## 3. Palette & tokens

Layered on morass's existing `--m-*` token system (`styles.css` `:root` light block + `[data-m-theme="dark"]` overlay, mirrored in `themes.ts`, enforced equal by `styles.test.ts`). The current teal/professional palette is replaced by a **warm pastel craft palette**:

- **Canvas:** warm paper cream (`--m-color-bg`), faint grid lines (divider-weight), a soft red margin rule accent.
- **Pastel swatches** (each with a paired `on-` foreground per the 0.4.0 paired-token doctrine): **sage** = primary, **butter** = warning/attention, **rose** = danger, **sky** = info, **lavender** = accent, plus a **success** green.
- **Ink** text (`--m-color-text` / `-muted`) tuned so every pastel pairing clears WCAG AA 4.5:1.

Exact hex values are tuned against `validateTheme` during Phase 1 (see §8); the brainstorm mockups used a working set (sage `#c9ddcb`/deep `#5c8168`, butter `#f6e6a6`, rose `#efc9c6`, sky `#c4dbe6`, lavender `#d8cde9`, cream `#f7f2e7`, ink `#423d34`) as the starting point.

**Dark mode = "craft desk at night":** a dark warm-neutral canvas, materials rendered as darker felt/paper, pastels desaturated. Must remain a strict overlay (dark-sync test) and preserve AA.

## 4. Material treatment primitives

Reusable, token-driven CSS treatments live inside `@layer morass` so components declare a *material*, never raw texture. All built from **CSS only** (layered gradients, dashed outlines, box-shadows) — no raster assets, keeping morass self-contained and themeable:

- **canvas-grid** — the graph-paper background (layered `repeating-linear-gradient`s + margin rule). Applied to background/table/section roles.
- **paper** — content-surface treatment: warm surface, soft "paper lift" shadow, optional **tape** tab (pseudo-element).
- **postit** — ephemeral-note treatment: butter fill, slight rotation, tape.
- **stitch** — dashed inset "seam" (`outline` dashed, negative offset) for felt controls/status.
- **felt** — matte pastel fills for controls.

Each treatment is expressed as a token set / utility applied by the component for its role — the unit of the `material → role` lint (§6).

## 5. Component roster & role assignment

**Restyle existing (13) to the material system:**

| Component | Material / role |
|---|---|
| Button, ButtonLink | felt (control) |
| Card | paper + tape (content) |
| AppFrame | graph canvas + paper panels |
| Hero, PageSection | canvas region |
| TextField, SelectField | paper input on canvas |
| StatusPill | stitched felt (status) |
| Metric | paper card (content) |
| Tabs | felt (control) |
| ProgressSteps | stitched felt (control/status) |
| Modal | paper (taped) over backdrop |

**Add to reach effigy-ui parity (4):** **Avatar**, **Badge** (stitched felt), **EmptyState** (post-it/paper), **PageHeader** (canvas header). These are the only components the four frozen consumers use that morass lacks today.

morass stays intentionally lean: **no components beyond effigy-ui parity + the material system.** Component-count remains deprioritized past parity.

## 6. Contract enforcement (the machine-enforced part)

Extend `styles.test.ts` / `contract.ts`:

- **Keep:** `@layer morass` containment, raw-colors-only-in-token-blocks, dark/OS-auto sync, `themes.ts` mirror, `validateTheme` AA on `REQUIRED_PAIRS`.
- **Add — `material → role` checks:** a mapping table (component role → required treatment token) asserted in the test. A status/badge rule must carry the `stitch` treatment; a card/dialog must carry the `paper` treatment; `canvas-grid` may appear only on background/table/section roles. A control using a canvas/paper treatment (or vice-versa) fails CI.
- **Add — new contrast pairs** to `REQUIRED_PAIRS`: ink on cream canvas, ink on paper, and each felt-pill text on its pastel fill.

## 7. Accessibility stance

- **Status never by color or texture alone:** pills carry text + a dot; live/syncing/failed are distinguishable monochrome.
- **All text pairs clear AA 4.5:1** via `validateTheme`; the new pastel pairs are added to the contract. Low-contrast felt is the known risk flagged in brainstorming — it is gated by the validator, not by eye.
- **Decorative vs meaningful:** stitched outlines and grid lines are decorative (borders remain out of contract v1 per the 0.4.0 spec); they must not be the sole carrier of meaning.
- **Motion:** press/`:active` animations respect `prefers-reduced-motion`.
- **Canvas legibility:** graph-grid lines stay at divider weight so they never reduce text contrast.

## 8. Versioning & phased rollout

A comprehensive visual + token change → **morass 0.5.0** (breaking-minor, pre-1.0). Each phase is independently shippable:

1. **Foundation** — pastel palette + material treatment primitives + tokens + contract-test scaffolding. Tune hex against `validateTheme`. No component redesign yet beyond tokens.
2. **Core components** — restyle Card, Button, StatusPill, AppFrame, TextField/SelectField; add the `material → role` lint.
3. **Parity** — remaining components + the four new ones (Avatar, Badge, EmptyState, PageHeader). effigy-ui feature parity reached here.
4. **Dark craft pass** — dark-mode material treatments; finalize `validateTheme` pairs.
5. **Dogfood + showcase** — apply on the hub/frontend (already a morass consumer); publish a **single public showcase route** demonstrating the material system as morass's "proof of craft." (Not a docs site.)

## 9. effigy-ui deprecation path

1. **Gate:** morass 0.5.x at component parity for the four consumers' actual usage (Card, PageHeader, EmptyState, Badge, Button, Input/Select, Avatar).
2. **Migrate** awards, fiscally, steam-sage, declassify off `@effigy-analytics/effigy-ui` → morass. Small surfaces (declassify uses only 3 components). Each migration is the "touch that unfreezes" per the deprecation ruling, tracked as its own follow-on.
3. **Archive** effigy-ui at zero consumers.
4. declassify #104's pending effigy-ui package grant becomes moot after that migration — but it still lands now, to unblock the in-flight security patch.

## 10. Out of scope / YAGNI

- No components beyond effigy-ui parity + the material system.
- No docs-site build — one showcase route only.
- No raster/image textures — CSS-only, self-contained.
- Consumer migrations (§9.2) are a follow-on plan, not this spec's implementation.

## 11. Open questions (resolve during Phase 1 / review)

- Final palette hex values (tuned against `validateTheme`).
- Is the graph-paper canvas always-on per page, or opt-in per app?
- Dark-mode craft fidelity — how literal should "craft desk at night" be?
