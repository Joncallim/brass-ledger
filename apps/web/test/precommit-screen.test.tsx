import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act } from "react";
import type { MemoSelection, StaffNegotiation } from "@brass-ledger/shared";
import type { PreviewPayload } from "../src/lib/types";
import { PreCommitScreen } from "../src/screens/PreCommitScreen";

// ── DOM shim: PreCommitScreen mounts a real React root, which needs a document. ──
const dom = new JSDOM("<!doctype html><html><body></body></html>");
const globals = globalThis as unknown as Record<string, unknown>;
globals.window = dom.window;
globals.document = dom.window.document;
// Node 22 exposes navigator as a getter-only global; redefine it for React.
Object.defineProperty(globals, "navigator", { value: dom.window.navigator, configurable: true });
globals.HTMLElement = dom.window.HTMLElement;
globals.IS_REACT_ACT_ENVIRONMENT = true;

const { createRoot } = await import("react-dom/client");

const selections: MemoSelection[] = [{ memoId: "posture", optionId: "tempo-hold" }];
const preview = {
  marker: "valid",
  decisionPreviews: [],
  acceptedRiskCandidates: [],
  predictedEvents: [],
  chiefCoalitions: [],
  projectedResult: { staffModules: [], staffFunctions: [] },
} as unknown as PreviewPayload;

const DEFAULT_PROPS = {
  preview,
  previewKey: "k" as string | null,
  currentPreviewKey: "k",
  previewLoading: false,
  selections,
  acceptedRiskChoices: {},
  staffNegotiations: [] as StaffNegotiation[],
  negotiationCandidates: [] as StaffNegotiation["directorate"][],
  turnNumber: 1,
  busy: false,
  error: null as string | null,
  onAcceptRisk: () => {},
  onNegotiation: () => {},
  onCommit: () => {},
  onBack: () => {},
};

function renderScreen(overrides: Partial<typeof DEFAULT_PROPS>) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const commitCalls: string[] = [];
  act(() => {
    root.render(
      <PreCommitScreen {...DEFAULT_PROPS} {...overrides} onCommit={() => commitCalls.push("commit")} />,
    );
  });
  const commitButton = [...document.querySelectorAll("button")].find((b) =>
    b.textContent?.includes("Commit the month"),
  );
  assert.ok(commitButton, "commit button rendered");
  return { root, commitButton: commitButton!, commitCalls };
}

test("PreCommitScreen keeps commit disabled while the published preview has a STALE key (closing pass 3 P1)", () => {
  const { root, commitButton } = renderScreen({ previewKey: "stale" });
  assert.equal(
    commitButton.disabled,
    true,
    "a published preview produced for different selections/negotiations must not enable commit",
  );
  act(() => root.unmount());
});

test("PreCommitScreen keeps commit disabled while the replacement preview is still loading", () => {
  const { root, commitButton } = renderScreen({ previewLoading: true });
  assert.equal(commitButton.disabled, true, "a still-loading preview must not enable commit");
  act(() => root.unmount());
});

test("PreCommitScreen keeps commit disabled when no preview is published", () => {
  const { root, commitButton } = renderScreen({ preview: null });
  assert.equal(commitButton.disabled, true, "no preview must not enable commit");
  act(() => root.unmount());
});

test("PreCommitScreen enables commit only for a published, key-matched, non-loading preview", () => {
  const { root, commitButton, commitCalls } = renderScreen({});
  assert.equal(commitButton.disabled, false, "valid preview + all warnings accepted → commit enabled");
  act(() => {
    commitButton.click();
  });
  assert.deepEqual(commitCalls, ["commit"], "clicking commit fires the handler only when the preview is valid");
  act(() => root.unmount());
});
