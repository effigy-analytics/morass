# Studio Workbench CSS contract

Studio Workbench is Morass's opt-in material vocabulary for tactile product
composition. Morass owns the material tokens, accessible states, and reusable
selectors. Consumers own semantic elements, product meaning, placement, and
material density. Applying these classes does not change existing Morass
component defaults.

## Treatment roles

`STUDIO_TREATMENTS` is a typed selector map with six roles:

| Role         | Public selectors                                                | Intended use                            |
| ------------ | --------------------------------------------------------------- | --------------------------------------- |
| `workbench`  | `.m-workbench`                                                  | Route or bounded workspace ground       |
| `sheet`      | `.m-sheet`, `.m-sheet--edge-{1,2,3}`                            | Primary content and forms               |
| `index-card` | `.m-index-card`, `.m-index-card--stacked`                       | Compact records, options, and summaries |
| `highlight`  | `.m-highlight`, `.m-highlight--{sage,rose,butter,sky,lavender}` | Short authored emphasis or selection    |
| `attachment` | `.m-tape`, `.m-tape--small`, `.m-tape--large`                   | Visible attachment or anchoring         |
| `action`     | `.m-felt-action`                                                | Consequential primary actions           |

Edge variants are predefined and deterministic. Consumers may choose among
them using stable data, but must not generate random variants during render.
Tape and highlighter are decorative marks; hide decorative-only elements from
assistive technology.

## Binder tabs

`.m-binder-tabs` and `.m-binder-tab` are appearance-only primitives. Apply one
optional color modifier:
`.m-binder-tab--{sage,rose,butter,sky,lavender}`. These classes do not provide
interaction semantics. Use navigation links for routes, buttons for steps or
choices, and Morass `Tabs` only when the controls actually operate tab panels.

The container uses horizontal overflow on narrow screens. Items wrap long text,
remain at least 44 pixels high, and preserve visible focus. Mark the current
item with the class that matches the consumer's meaning:

- `.m-binder-tab--current` for a current route or page;
- `.m-binder-tab--active` for an active step or local choice.

The selectors also recognize `aria-current="page"` and
`aria-selected="true"` when those attributes are semantically correct. The
active treatment uses weight, border thickness, and a marker as well as color.
Do not add `aria-selected` to ordinary navigation links merely to obtain the
appearance.

```html
<nav aria-label="Awards sections" class="m-binder-tabs">
  <a
    aria-current="page"
    class="m-binder-tab m-binder-tab--current"
    href="/shows"
  >
    Current and upcoming shows
  </a>
  <a class="m-binder-tab" href="/history">History</a>
</nav>
```

## Theme tokens

| Area        | Public tokens                                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| Workbench   | `--m-workbench-bg`, `--m-workbench-on`, `--m-workbench-grid`                                                      |
| Sheet       | `--m-sheet-bg`, `--m-sheet-on`, `--m-sheet-border`, `--m-sheet-shadow`                                            |
| Index card  | `--m-index-card-bg`, `--m-index-card-line`                                                                        |
| Highlight   | `--m-highlight-sage`, `--m-highlight-rose`, `--m-highlight-butter`, `--m-highlight-sky`, `--m-highlight-lavender` |
| Binder tab  | `--m-binder-tab-accent`                                                                                           |
| Attachment  | `--m-attachment-tape`                                                                                             |
| Felt action | `--m-felt-action`, `--m-felt-action-strong`, `--m-felt-action-on`                                                 |

Built-in light and dark themes provide every token. `themes.light` and
`themes.dark` expose the same names for typed JavaScript composition.
`REQUIRED_PAIRS` validates workbench, sheet, index-card, highlighter,
active-binder-tab, and felt action text combinations. Tape is decorative and
does not replace text or programmatic state.

## Accessibility and fallback behavior

- Workbench, sheet, index-card, highlighter, and felt-action text pairs meet the
  Morass contrast contract.
- `.m-felt-action` preserves native disabled behavior and visible hover,
  pressed, and focus states.
- Reduced-motion mode removes binder-tab and felt-action transitions and
  controlled paper rotation.
- Forced-colors mode removes highlighter and tape decoration, flattens material
  surfaces, preserves boundaries and focus, and gives active/current binder
  tabs system highlight colors.
- Materials never become the only indication of selected, current, complete,
  warning, error, submitted, locked, open, or disabled state.

Consumers must still test keyboard operation, 320-pixel reflow, explicit light
and dark themes, operating-system theme selection, and a real forced-colors
environment in the composed application.
