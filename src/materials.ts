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
