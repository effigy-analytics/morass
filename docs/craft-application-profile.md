# Morass 0.7.1 craft application profile

- Status: consumer guidance
- Package baseline: exact `@effigy-analytics/morass@0.7.1`
- Reference consumers: Effigy public hub and Awards
- Tracking: [Morass #57](https://github.com/effigy-analytics/morass/issues/57)

This profile turns Morass's public material utilities into a restrained,
repeatable application grammar. The intent is a human, homey, crafted feel
with product-specific expression—not one imposed skin across every product.

This is guidance for the supported 0.7.1 contract. It does not add a package
export, component, named theme, or release. The
[public contract](public-contract.md) remains authoritative when this profile
and an older design-direction document differ. This phase is limited to the
hub and Awards; TumbleTime native and game presentation stay outside its
scope.

## Start from the exact public contract

Pin the selected baseline from public npmjs and import its stylesheet once:

```bash
npm install --save-exact @effigy-analytics/morass@0.7.1
```

```tsx
import {
  ButtonLink,
  Card,
  MATERIAL_TREATMENTS,
  PageSection,
} from "@effigy-analytics/morass";
import "@effigy-analytics/morass/styles.css";
```

`MATERIAL_TREATMENTS` describes the four shipped roles:

```ts
{
  canvas: [".m-canvas-grid"],
  content: [".m-paper"],
  ephemeral: [".m-postit"],
  "control-status": [".m-felt", ".m-stitch"],
}
```

The values in this map are CSS selectors, including their leading dots. Strip
the dot when using one as a React `className`; do not pass a map value directly
to `className`. The map is a public vocabulary, not automatic component styling
or a consumer lint rule. In 0.7.1:

- Morass ships default light and dark themes. It does not ship named
  Notebook, Quilt, or Workshop themes.
- `.m-canvas-grid` is an opt-in utility. There is no `AppFrame` canvas prop.
- Components do not all compose their proposed material role automatically.
- `MATERIAL_TREATMENTS` enumerates the public utility selectors; it does not
  certify an application's role choices.

Do not target a rendered `.m-*` selector unless the public contract documents
it as a utility. Other rendered selectors are private implementation details.
Use public utilities, tokens, component props, or a product-owned wrapper.

## Material means role

Choose material from the surface's job, not from a desire to decorate every
region.

| Role                 | Supported 0.7.1 surface                                                                                                                                                        | Use                                                                                                                                                              | Avoid                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Canvas and workspace | `.m-canvas-grid`, `--m-grid-line`, `--m-grid-margin`, `--m-color-bg`                                                                                                           | One bounded making, arranging, or data-entry region; a plain warm canvas elsewhere                                                                               | Applying a grid to every page, content card, or text-heavy reading surface                                                                    |
| Durable content      | `.m-paper`; `.m-paper.m-paper--taped`; `--m-color-surface`, `--m-paper-shadow`, `--m-tape`                                                                                     | Cards, panels, and durable information placed on the canvas; tape for one genuinely pinned focal item                                                            | Taping every card, random rotation, or using paper as an action/status signal                                                                 |
| Temporary guidance   | `.m-postit`; `--m-postit-bg`, `--m-postit-on`, `--m-postit-shadow`                                                                                                             | Dismissible onboarding, a short-lived instruction, or a temporary operator note                                                                                  | Errors, legal/privacy terms, locked state, permanent help, or any message users must reliably revisit                                         |
| Control and status   | `Button`, `ButtonLink`, `StatusPill`, `Tabs`, and `ProgressSteps` as shipped; `.m-felt` plus exactly one `.m-felt--*` swatch and optional `.m-stitch` for decorative structure | Use the Morass primitive that owns interaction or status; at most one noninteractive product-owned label or grouping may add felt/stitch after independent tests | Treating felt as a canonical button recipe, relying on swatch or stitching alone, or adding undocumented CSS overrides to force the treatment |

The complete public felt swatches are `sage`, `butter`, `rose`, `sky`, and
`lavender`. Always pair `.m-felt` with one matching modifier such as
`.m-felt--sage`; use the paired foreground supplied by Morass rather than a raw
text color. A swatch communicates visual grouping, not application meaning.
Keep the explicit label, `tone`, state attribute, error text, or other semantic
signal.

### Compose semantics first

Use the exported component that owns the behavior before adding material:

- `Button` and `ButtonLink` accept `className`, but keep their shipped visual
  treatment in this profile. Felt/stitch does not have a complete 0.7.1
  control-state and forced-colors contract, so it is not a supported control
  composition in this profile.
- `Card`, `Hero`, `PageHeader`, `PageSection`, and `EmptyState` accept
  `className`. `EmptyState` already composes `.m-paper`.
- `TextField` and `SelectField` accept `className`, but it lands on the native
  control rather than the field wrapper. Do not use it as a wrapper material
  hook.
- `ShellLayout` already uses felt and stitch for a non-production environment
  badge.
- `AppFrame`, `ShellLayout`, `NotFound`, `StatusPill`, `Metric`, `Tabs`,
  `ProgressSteps`, and `Modal` do not expose a material `className` hook in
  0.7.1. Keep their supported rendering instead of targeting undocumented
  rendered selectors. Record a missing hook only if both reference consumers
  independently demonstrate the same need.

Bare material utilities do not receive every component-specific forced-colors
fallback. An interactive element should retain a Morass component or native
control class and semantics; a status must retain explicit text. Verify the
actual composition in forced colors rather than assuming the material utility
supplies the whole fallback.

Treat each utility as paint, not layout or semantics:

- `.m-canvas-grid` owns the surface background but adds no spacing or landmark
  semantics.
- `.m-paper.m-paper--taped` can extend beyond its surface; leave room for it and
  check clipping at narrow widths and zoom.
- `.m-postit` includes spacing and a small rotation. Morass removes the rotation
  for reduced motion, but consumers must still check reflow and clipping.
- Felt and stitch are decorative structure. They do not establish a control
  boundary or focus indicator.

## Restraint and hierarchy

Use these rules for both reference consumers:

1. Pick one dominant workspace. Let the rest of the page use the quiet warm
   background.
2. Use paper to group durable content. Add tape only when the information is
   meaningfully pinned or featured.
3. Use a post-it only for temporary guidance. The absence of a post-it is a
   valid design decision.
4. Let at most one small, noninteractive label or grouping carry felt/stitch
   character after independent contrast and boundary checks. Keep controls in
   their shipped treatment and dense toolbars quiet.
5. Keep product semantics and outcome colors product-owned. Alias shared roles
   to Morass tokens instead of copying their raw color values.
6. Use system-font stacks and CSS tokens/gradients/shadows. Do not require a
   webfont, raster texture, parallax, animated glow, or JavaScript texture
   system.
7. Treat shape, texture, material, and color as supporting cues. Names, text,
   state, structure, and focus must remain sufficient without them.

## Reference composition: public hub home

The hub application is one bounded workbench section. It does not change the
page's information architecture, product copy, CTA destination, or analytics.

```text
Quiet warm page canvas
┌──────────────────────────────────────────────────────────────┐
│ Hero: company identity and existing primary message          │
├─ Workbench section · bounded .m-canvas-grid ─────────────────┤
│  ┌ Featured product · .m-paper.m-paper--taped ┐              │
│  │ Durable summary + unchanged semantic CTA   │              │
│  └─────────────────────────────────────────────┘              │
│  ┌ Product · .m-paper ┐  ┌ Product · .m-paper ┐              │
│  │ summary + CTA      │  │ summary + CTA      │              │
│  └────────────────────┘  └────────────────────┘              │
├──────────────────────────────────────────────────────────────┤
│ Existing contact/footer surfaces remain quiet                │
└──────────────────────────────────────────────────────────────┘
```

| Zone              | Material decision                                              | Annotation                                                                                                    |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Page and hero     | Plain `--m-color-bg`                                           | The brand message stays readable and calm; the grid does not become wallpaper.                                |
| Workbench         | `PageSection` or a product-owned section with `.m-canvas-grid` | Give the section a heading and landmark relationship. The class changes presentation, not document structure. |
| Product cards     | `Card` with `.m-paper`                                         | Keep each existing CTA as a real link or button and preserve the current analytics contract.                  |
| One featured card | `.m-paper.m-paper--taped`                                      | Tape communicates one deliberate focal item. Remove it if nothing is genuinely featured.                      |
| Temporary note    | None by default                                                | Do not invent temporary guidance merely to use `.m-postit`.                                                   |

A supported composition can stay this small:

```tsx
<PageSection aria-labelledby="work-title" className="m-canvas-grid">
  <h2 id="work-title">Our work</h2>
  <Card aria-labelledby="featured-title" className="m-paper m-paper--taped">
    <h3 id="featured-title">Featured product</h3>
    <p>Durable, truthful product summary.</p>
    <ButtonLink href="/existing-destination">Explore</ButtonLink>
  </Card>
</PageSection>
```

## Reference composition: Awards entry and prediction

Awards uses the material grammar inside the authorized participant journey. It
does not change authentication, privacy, scoring, lock behavior, operations,
or pilot scope.

```text
Quiet page header: event title + explicit date/state text
┌─ Prediction workspace · bounded .m-canvas-grid ──────────────┐
│  ProgressSteps: Entry → Predictions → Review                 │
│  StatusPill: "Open until <published deadline and timezone>"  │
│  ┌ Category/prediction group · Card + .m-paper ┐             │
│  │ labelled choices, help, and inline error text│             │
│  └──────────────────────────────────────────────┘             │
│  ┌ Temporary onboarding · .m-postit ┐                         │
│  │ short, dismissible instruction   │                         │
│  └───────────────────────────────────┘                         │
│  [Save predictions · Button as shipped]                      │
└──────────────────────────────────────────────────────────────┘
Locked state: explicit "Locked" text + disabled/read-only semantics
Leaderboard: quiet durable paper rows; results remain text-labelled
```

| Zone                 | Material decision                           | Annotation                                                                                                                                                               |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Event header         | Quiet canvas                                | Show event name, deadline, timezone, and state as text. Material must not carry urgency.                                                                                 |
| Prediction workspace | Bounded `.m-canvas-grid`                    | Use the grid only if it improves grouping and alignment at 320–390 px and zoomed layouts.                                                                                |
| Prediction groups    | `Card` with `.m-paper`                      | Keep labels, descriptions, validation, and choice semantics intact. Errors are error text, never post-its.                                                               |
| Onboarding note      | One `.m-postit` aside                       | Use only for temporary, dismissible guidance with a heading or accessible label. Remove the transform under reduced motion as Morass already does.                       |
| Progress and status  | `ProgressSteps` and `StatusPill` as shipped | Keep their explicit text/current-state semantics. Do not add undocumented CSS overrides to force felt.                                                                   |
| Primary save/submit  | `Button` as shipped                         | Exercise default, hover, focus, active, disabled, pending, error, and forced-colors states. Do not force felt onto the control in 0.7.1. Keep the button label explicit. |
| Locked/results       | Product-owned state plus Morass primitives  | Text and native disabled/read-only state remain sufficient without color, texture, or stitching.                                                                         |

## Consumer audit rubric

Record pass/fail evidence and an artifact link for every applicable item.

### Installation and contract

- [ ] `package.json` and the lockfile pin exact
      `@effigy-analytics/morass@0.7.1` from public npmjs.
- [ ] `@effigy-analytics/morass/styles.css` is imported once at the application
      entry.
- [ ] Consumer CSS does not target undocumented `.m-*` selectors or other
      rendered implementation selectors.
- [ ] Every shared role uses a public token, utility, prop, or product-owned
      wrapper; one-off product semantics remain local.
- [ ] No missing primitive is proposed for Morass unless the hub and Awards
      independently demonstrate the same need.

### Material and hierarchy

- [ ] Canvas, durable content, temporary guidance, and control/status
      treatments match the role table above.
- [ ] The design has one dominant workspace and quiet dense/reading surfaces.
- [ ] Tape, post-it, rotation, felt, and stitching are restrained rather than
      quotas applied to every component.
- [ ] Product meaning remains explicit without material, shape, or color.
- [ ] No raw color duplicates a shared Morass role; product-specific colors
      are named and tested locally.

### Theme, contrast, and forced colors

- [ ] The consumer declares and tests its explicit light/dark/OS theme posture;
      it does not claim an unshipped named Morass theme.
- [ ] `validateTheme` passes the final computed public token values. The
      consumer separately checks every product-specific combination.
- [ ] The consumer independently verifies `--m-postit-on` against
      `--m-postit-bg`, because `validateTheme` does not cover that pair.
- [ ] Normal text reaches 4.5:1 and applicable control boundaries/focus
      indicators reach 3:1. Felt and other material boundaries are checked
      against each adjacent page/surface color; `validateTheme` does not
      certify those boundaries, tape, stitch, grid, or shadows.
- [ ] Light, dark, and OS-selected presentation keep content and focus visible.
- [ ] Playwright forced-colors emulation passes, followed by a release-gate
      check in Windows High Contrast or another real forced-colors environment.
- [ ] Content, state, focus, and meaningful boundaries survive when bare
      material utilities disappear or flatten in forced colors; those utilities
      do not supply a complete component fallback.

### Semantics, keyboard, and motion

- [ ] Landmarks and heading order remain coherent after wrappers are added.
- [ ] Every control has an accessible name; every error and status has explicit
      text and the required programmatic relationship or announcement.
- [ ] Keyboard order, visible focus, Modal trap/Escape/restore, and the selected
      Tabs mode remain correct.
- [ ] Screen-reader-facing roles, names, states, and relationships match the
      visible interface. A periodic actual NVDA/VoiceOver/Orca pass remains a
      human release check; a browser driver does not certify spoken output.
- [ ] `prefers-reduced-motion: reduce` removes the post-it rotation and any
      consumer-added nonessential motion or transition.

### Reflow and performance

- [ ] 320, 360, and 390 px viewports have no horizontal overflow or obscured
      action, dialog, status, error, or heading.
- [ ] Browser zoom/reflow keeps the journey usable and the material hierarchy
      understandable.
- [ ] Screenshots contain no clipped tape, focus ring, stitch outline, or
      rotated note.
- [ ] The treatment remains CSS/token/system-font based, with no raster texture,
      webfont requirement, parallax, animated glow, or JavaScript texture code.
- [ ] Bundle and page-performance checks show no material regression outside
      the consumer's approved budget.

## Playwright evidence recipe

Keep journey tests in each consumer repository. Visual and accessibility
evidence can share this matrix:

| Axis          | Required evidence                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Routes/states | Hub home/workbench; Awards entry, prediction, validation, review, locked state, and leaderboard        |
| Viewports     | Approved desktop plus 320×800, 360×800, and 390×844                                                    |
| Themes        | The consumer's explicit light/dark/OS posture                                                          |
| Media         | Reduced motion and forced colors                                                                       |
| Interaction   | Keyboard-only primary journey, Modal trap/Escape/restore, Tabs mode, disabled/locked states            |
| Semantics     | Main/heading structure, accessible names, states/relationships, ARIA snapshot, and zero axe violations |
| Visuals       | Stable full-page and focused-component screenshots with intentional human baseline approval            |

Use fresh contexts so media settings cannot leak between cases:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const cases = [
  { name: "desktop-light", viewport: { width: 1440, height: 1000 } },
  { name: "mobile-320", viewport: { width: 320, height: 800 } },
  { name: "mobile-360", viewport: { width: 360, height: 800 } },
  { name: "mobile-390", viewport: { width: 390, height: 844 } },
];

for (const evidence of cases) {
  test(evidence.name, async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: "light",
      reducedMotion: "reduce",
      viewport: evidence.viewport,
    });
    const page = await context.newPage();

    // Point this recipe only at local preview or an approved stage environment
    // backed by disposable fixtures and an explicit write allowlist.
    await page.goto(process.env.BASE_URL ?? "http://127.0.0.1:4173/");

    const fitsViewport = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    );
    expect(fitsViewport).toBe(true);

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations).toEqual([]);

    const aria = await page.locator("main").ariaSnapshot();
    expect(aria).toMatchSnapshot(`${evidence.name}.aria.yml`);
    await expect(page).toHaveScreenshot(`${evidence.name}.png`, {
      animations: "disabled",
      caret: "hide",
      fullPage: true,
    });

    await context.close();
  });
}
```

Install `@playwright/test` and `@axe-core/playwright` in the consumer test
workspace. This sample is one evidence slice, not the whole matrix: adapt route
names, deterministic fixtures, allowed endpoints, theme selection, and keyboard
assertions to the consumer. Run functional journeys in Chromium, Firefox, and
WebKit, while keeping visual baselines on one pinned browser/platform. Run
forced colors in a separate context with `forcedColors: "active"`; run a
separate reduced-motion assertion that the computed `.m-postit` transform is
`none`; and run normal-motion evidence separately rather than combining every
media feature in one screenshot. Screenshot animation suppression is not
reduced-motion evidence. The `ariaSnapshot()` call requires Playwright 1.49 or
newer; pin the consumer's test version.

Do not silently update screenshots in CI. A changed baseline needs an explicit
review that the material still communicates the intended role at every
viewport and theme. Do not point this generic recipe at production. A production
smoke needs a separate, consumer-owned fail-closed allowlist covering every
request destination; any write or analytics event requires explicit
release-gate approval.

## Evidence record

For each reference consumer, attach one concise record to its implementation
issue:

| Evidence                                        | Result    | Artifact                                          |
| ----------------------------------------------- | --------- | ------------------------------------------------- |
| Exact 0.7.1 install and public-surface audit    | Pass/fail | Lockfile and selector audit                       |
| Desktop/mobile/theme screenshots                | Pass/fail | Playwright artifact                               |
| Keyboard, names, states, axe, and ARIA snapshot | Pass/fail | Test run                                          |
| Reduced-motion and forced-colors checks         | Pass/fail | Test run plus manual forced-colors note           |
| Product comprehension                           | Pass/fail | Hub review or aggregate Awards rehearsal evidence |
| Performance restraint                           | Pass/fail | Bundle/performance output                         |

Hub and Awards are internal reference consumers. Their adoption does not count
as one of the external implementations or the qualified paid audit lead in
[Morass #42](https://github.com/effigy-analytics/morass/issues/42).
