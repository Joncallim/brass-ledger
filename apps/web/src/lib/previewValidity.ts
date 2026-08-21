import type { PreviewPayload } from "./types";

/** A preview may be consumed ONLY when it is (1) actually published (non-null —
 * every selection/negotiation change clears it synchronously), (2) produced for
 * the EXACT current selections/negotiations (previewKey === currentPreviewKey —
 * a published preview for earlier choices must never enable proceeding or
 * committing), and (3) not still loading. Each condition is an independent
 * failure mode observed in the wild; dropping any one re-opens the stale-preview
 * consumption race (closing pass 3 P1). */
export function isPreviewValid(
  preview: PreviewPayload | null,
  previewKey: string | null,
  currentPreviewKey: string,
  loading: boolean,
): boolean {
  return preview !== null && previewKey === currentPreviewKey && !loading;
}
