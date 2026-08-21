import test from "node:test";
import assert from "node:assert/strict";
import { isPreviewValid } from "../src/lib/previewValidity";
import type { PreviewPayload } from "../src/lib/types";

const published = { marker: "any" } as unknown as PreviewPayload;

test("isPreviewValid truth table: only a published, key-matched, non-loading preview is valid", () => {
  const cases: Array<{
    label: string;
    preview: PreviewPayload | null;
    previewKey: string | null;
    currentPreviewKey: string;
    loading: boolean;
    expected: boolean;
  }> = [
    { label: "no preview published", preview: null, previewKey: "k", currentPreviewKey: "k", loading: false, expected: false },
    { label: "no preview published while loading", preview: null, previewKey: "k", currentPreviewKey: "k", loading: true, expected: false },
    { label: "preview pending (null key)", preview: published, previewKey: null, currentPreviewKey: "current", loading: false, expected: false },
    { label: "stale preview (key mismatch)", preview: published, previewKey: "older", currentPreviewKey: "current", loading: false, expected: false },
    { label: "stale preview while loading", preview: published, previewKey: "older", currentPreviewKey: "current", loading: true, expected: false },
    { label: "matching key but still loading", preview: published, previewKey: "k", currentPreviewKey: "k", loading: true, expected: false },
    { label: "matching key, loading, stale key", preview: published, previewKey: "older", currentPreviewKey: "k", loading: true, expected: false },
    { label: "published, key-matched, not loading", preview: published, previewKey: "k", currentPreviewKey: "k", loading: false, expected: true },
  ];
  for (const c of cases) {
    assert.equal(isPreviewValid(c.preview, c.previewKey, c.currentPreviewKey, c.loading), c.expected, c.label);
  }
});
