/**
 * The material = role contract (2026-07-21 spec). Each UI role is rendered
 * from exactly one craft material; Phase 2 asserts each component's rule
 * carries the treatment for its role. Class names match styles.css.
 */
export type MaterialRole =
  "canvas" | "content" | "ephemeral" | "control-status";

export const MATERIAL_TREATMENTS: Record<MaterialRole, string[]> = {
  canvas: [".m-canvas-grid"],
  content: [".m-paper"],
  ephemeral: [".m-postit"],
  "control-status": [".m-felt", ".m-stitch"],
};

/**
 * Opt-in Studio Workbench vocabulary. Unlike MATERIAL_TREATMENTS, these
 * selectors describe the approved 2026-07 prototype foundation and do not
 * imply that existing Morass components compose the treatment automatically.
 */
export type StudioTreatmentRole =
  "workbench" | "sheet" | "index-card" | "highlight" | "attachment" | "action";

export const STUDIO_TREATMENTS: Record<StudioTreatmentRole, string[]> = {
  workbench: [".m-workbench"],
  sheet: [".m-sheet"],
  "index-card": [".m-index-card"],
  highlight: [".m-highlight"],
  attachment: [".m-tape"],
  action: [".m-felt-action"],
};
