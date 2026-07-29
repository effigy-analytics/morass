# Morass Studio Workbench — Design Direction

**Date:** 2026-07-28  
**Status:** Prototype direction approved; opt-in foundation implemented on the
unreleased branch; not yet a supported published contract  
**Product-frame prototype:** `prototype/studio-workbench.html`  
**Analytical laboratory:** `prototype/studio-workbench-lab.html`

**Implementation checkpoint:** Foundation tokens, utilities,
`STUDIO_TREATMENTS`, light/dark values, edge-causality checks, forced-colors
flattening, reduced-motion behavior, and contrast pairs are implemented.
The product-frame prototype and analytical laboratory dogfood the package
workbench, sheet, index-card, highlighter, tape, and felt-action utilities.
Existing component defaults are unchanged. Binder Tabs and typed component
variants remain the next phase after consumer composition testing.

## Prototype feedback checkpoint

The first specimen over-applied the vocabulary. Rounded display typography,
multi-colored tabs, conspicuous cut edges, tape, notebook rules, post-it
rotation, and felt texture all competed at the same level. The result felt too
uniformly themed, cartoony, and childish rather than like a modern adult
studio.

The revised specimen applies three corrections:

- **Modern editorial structure first:** sharp, high-contrast typography, larger
  whitespace, flatter hierarchy, quiet neutral architecture, and fewer rounded
  silhouettes.
- **One tactile intervention per region:** material details become specific
  moments instead of a treatment on every surface.
- **Pastel as annotation, not atmosphere:** most structure stays neutral while
  the selected tab, highlighter, note, tape, or felt action carries color.

Handmade quality must come from precise, credible physical details and
composition. If the page reads as a craft theme before it reads as a capable
modern interface, the rationing has failed.

The second review established the color and attachment grammar:

- **Forest green is the Effigy ground.** A deep green cutting-mat/workbench
  surface replaces the beige tabletop. Green is the permanent suite identity;
  pastel remains available above it without forcing the ground itself to be
  pastel.
- **Highlighter and tape may be bold.** Restraint governs how many are used, not
  whether the chosen gesture is visible. Highlighter owns authored emphasis;
  blue tape consistently owns attachment.
- **Product accent stays singular within a frame.** Awards uses rose for active
  choice and emphasis; the operational frame uses sage. The shared tape,
  neutral paper, forest ground, and typography keep them in one family.
- **Remove the drawn paper clip.** Its CSS rendering did not feel credible.
  Multiple pages are represented by a stacked-sheet edge until a better
  attachment primitive proves itself.

The third review clarified that restraint must not make the human gesture
timid. The work surface moves from forest-dark to a lighter pastel sage while
remaining recognizably Effigy green. Highlighter and tape are allowed to
overshoot: strokes extend beyond their text, overlap in more than one pass, and
tape crosses the paper edge. The system rations the number of gestures, but a
gesture that is chosen should look confidently made by a person.

### Edge causality

Imperfection must explain how an object was made:

- **Highlighter** has blunt chisel ends, gently wandering stroke edges,
  translucent pressure variation, and darker overlap where a person passes
  twice. It does not have torn edges.
- **Tape** has straight manufactured long edges, torn short ends, directional
  fibers, and translucency. It does not wobble like liquid ink along its full
  length.
- **Cut paper** may vary around its perimeter because the perimeter was cut.
- **Felt** may be soft around its full perimeter because fibers define the
  material edge.
- **Post-its and index cards** keep mostly manufactured edges; their physical
  character comes from lift, rules, attachment, and stacking.

Two materials must not share the same rough-edge polygon merely because both
need to look handmade.

## 1. Direction

Morass should feel like an organized designer's workbench crossed with an art
teacher's supply table: tactile, crunchy, and clean. It should be undeniably
handmade without becoming busy, juvenile, or a cheap imitation of photographed
materials.

The working name for this direction is **Studio Workbench**.

The interface is assembled from restrained base layers and a shared vocabulary
of paper, stationery, attachments, and human marks. Cleanliness comes from
hierarchy and rationing, not from perfect geometry. Imperfect edges, slight
misalignment, overlap, and visible attachment are intentional parts of the
system.

## 2. Design principles

### Tactile

Objects have a material identity. Their silhouette, edge, thickness, overlap,
shadow, and interaction should reinforce what they are made from. A felt button
must not be only a pastel rounded rectangle. A paper sheet should not be only a
white card with a shadow.

### Crunchy

Controlled imperfections remain visible: cut-paper edges, translucent marker
overlap, slightly irregular corners, off-center tape, and selected variations in
rotation or attachment. These details are curated and repeatable.

### Clean

A screen uses a small material palette and a clear hierarchy. Decoration is not
a quota. A composition should normally use:

- one ground;
- no more than two principal paper types;
- one dominant mark language;
- one or two attachment types; and
- one restrained pastel family.

### Adult studio, rough around the edges

The result should be warm, capable, and expressive. It may be playful, but
should not resemble a children's scrapbook, novelty skeuomorphism, or an
undisciplined collage.

### Handmade is preferred to polished-software neutrality

When forced to choose, Morass should risk a little visible roughness rather than
retreat to a conventional corporate UI with pastel colors.

## 3. The two-part semantic question

The existing material-role model asks:

> What is this surface made from?

Studio Workbench adds a second question:

> What has a person done to it?

The first question selects the object. The second selects its mark or
attachment. This keeps highlighter, pencil, clips, tabs, and tape semantic
instead of decorative.

## 4. Vocabulary

### Grounds

Grounds establish a physical tabletop without turning the application into a
literal illustrated scene.

- **Tabletop:** the default application ground; plain, warm, subtly textured.
- **Dark tabletop:** the same material logic translated into a darker format.
- **Graph field:** a bounded work area for arranging, comparing, or entering
  information.
- **Notebook field:** a bounded ruled area for sequential or written work.

The ground does not need to be paper. Neutral base layers make room for pastel
objects and annotations above them.

### Sheets

- **Clean sheet:** durable primary content and forms.
- **Index card:** compact records, summaries, options, and discrete facts.
- **Post-it:** temporary guidance, drafts, reminders, or provisional content.

The initial prototype deliberately excludes torn sheets and receipts. Add a
paper form only after it demonstrates a distinct semantic job in two consumers.

### Marks

- **Highlighter wash:** selection, emphasis, current position, or a key phrase.
- **Marker underline:** active navigation, section emphasis, or authored
  emphasis.
- **Pencil annotation:** supplemental context, provenance, or an aside.
- **Check/correction marks:** completion or revision, always paired with text or
  programmatic state.

Marks supplement semantics; they never replace labels, focus, error text, or
status text.

### Attachments

- **Tape:** deliberately pins or features one object.
- **Paper clip:** indicates attached supporting material or multiple pages that
  can be flipped through.
- **Binder tab:** navigation, section switching, or a visible page category.

Attachment is a relationship, not generic decoration.

### Controls

- **Felt patch:** preferred primary action when its material quality, state
  behavior, and contrast meet the release bar.
- **Paper label:** likely secondary-action treatment.
- **Highlighted conventional control:** fallback when felt cannot remain
  convincing or usable in a context.
- **Rubber stamp:** reserved for infrequent consequential states such as
  submitted, approved, or archived; not a default button.

## 5. Component hypotheses

These are prototype hypotheses, not API commitments.

| Component              | Studio Workbench hypothesis                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| AppFrame / ShellLayout | Tabletop ground with quiet structural sheets; avoid a corporate dark rail as the dominant identity          |
| Card                   | Explicit `sheet`, `index-card`, and `post-it` forms rather than one generic rounded container               |
| Tabs                   | Binder tabs by default, with overflow and narrow-screen behavior treated as first-class                     |
| Button                 | Material felt primary; paper-label secondary; highlighted conventional fallback                             |
| StatusPill             | Small clipped, stamped, or highlighted label with explicit status text                                      |
| PageHeader             | Clean sheet or open tabletop composition with a marker/highlighter title gesture                            |
| Forms                  | Legible clean-sheet controls; annotation type for help; marker/pencil language for selection and validation |
| Tables                 | Quiet ledger/notebook mode with minimal material variety and strong scan alignment                          |
| ProgressSteps          | A sequence of binder labels or marked checkpoints, without relying on texture or color alone                |

## 6. Controlled irregularity

The first implementation should ship a small family of predefined variations,
for example `calm`, `left-cut`, `right-cut`, and `offset`. Each variant owns a
tested combination of edge shape, attachment placement, and maximum rotation.

A later helper may select a variant from a stable consumer-provided seed.
Selection must be deterministic across server and client rendering, test runs,
and reordering. Do not use render-time randomness.

Variation should never:

- reorder information;
- move interactive targets enough to affect motor expectations;
- clip focus indicators, content, or attachments;
- create horizontal overflow;
- change the accessible name or state; or
- become the only indication that two objects differ.

## 7. Typography

Morass should distinguish three roles:

- **Body:** highly legible and calm for dense reading and forms.
- **Display:** warmer and more authored for headings.
- **Annotation:** visibly handwritten or marked for short labels and asides.

Expose roles as tokens before committing to a bundled font. Research an
appropriately licensed, redistributable annotation face and evaluate package
size, loading, privacy, fallback behavior, and legibility. Consumers must be
able to replace any role.

Handwritten typography is an accent, not the body copy default.

## 8. Color

Base layers remain plain and relatively neutral. Pastel color is concentrated
in highlighter, post-its, binder tabs, tape, felt controls, and
product-specific accents.

Products share the material vocabulary while choosing different, restrained
usage. Awards may use show-specific tabs, ballot-like index cards, and selected
prediction highlights. An operational product should use the same system as a
quiet ledger with fewer simultaneous materials.

## 9. Dark mode

Dark mode is first-class and uses the same objects translated into darker
materials. It may borrow from dark construction paper, but it does not need a
literal nighttime scene.

Dark mode should preserve:

- distinguishable tabletop, sheet, and index-card layers;
- translucent highlighter character without fluorescent glare;
- felt depth and fiber without muddy contrast;
- visible paper edges, tape, clips, and focus indicators; and
- the same material-to-role meaning as light mode.

## 10. CSS-first implementation

Start with CSS gradients, masks or clip paths, pseudo-elements, borders, and
shadows. CSS is preferred because it remains themeable and self-contained.

Painted SVG assets may be considered only after CSS prototypes fail a defined
quality test. If introduced, assets should be small, recolorable where
possible, accessible as decoration, and distributed without external requests.

The design must not depend on raster paper textures, JavaScript noise
generation, animated grain, or photorealistic material scans.

## 11. Prototype frames

The visual gate uses two contrasting frames:

1. **Awards frame:** expressive public workflow with prediction cards, binder
   tabs, a clipped multi-page record, a post-it, and highlighter selection.
2. **Operational frame:** quieter recurring-work dashboard with clean sheets,
   compact index cards, restrained attachment, and a dense ledger treatment.

TumbleTime may inform the expressive vocabulary, but it is not currently a
direct React-DOM Morass consumer. Awards plus an operational frame provide the
more useful framework test.

## 12. Prototype release gates

Do not change public component defaults until the specimen demonstrates:

- felt that looks materially distinct from a generic rounded button;
- binder tabs that remain usable with long labels and narrow screens;
- irregular edges that preserve alignment, overflow, and focus indicators;
- a handmade effect that survives without raster texture;
- designed light and dark modes;
- dense scanning without material clutter;
- reduced-motion and forced-colors fallbacks;
- explicit state independent of color and texture; and
- family resemblance across the two frames without making them identical.

## 13. Explicit non-goals

- Photorealistic desk scenes
- Unbounded runtime randomness
- A different material on every component
- Handwritten body copy
- Decoration without semantic or compositional purpose
- Retrofitting all public components before the prototype is approved
- Treating the prototype classes as a supported 0.7 contract
