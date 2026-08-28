import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act } from "react";
import type { DecisionMemo } from "@brass-ledger/shared";
import type { PreviewPayload } from "../src/lib/types";
import { MemosScreen } from "../src/screens/MemosScreen";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
const globals = globalThis as unknown as Record<string, unknown>;
globals.window = dom.window;
globals.document = dom.window.document;
Object.defineProperty(globals, "navigator", { value: dom.window.navigator, configurable: true });
globals.HTMLElement = dom.window.HTMLElement;
globals.IS_REACT_ACT_ENVIRONMENT = true;

const { createRoot } = await import("react-dom/client");

const memos = [
  {
    id: "posture", title: "Posture", category: "Operations", optional: false, options: [
      { id: "hold", label: "Hold the line", summary: "Preserve readiness.", tradeoffs: [], tags: [], burden: [] },
      { id: "surge", label: "Surge forward", summary: "Trade recovery for visibility.", tradeoffs: ["Higher current pressure."], tags: [], burden: [{ directorate: "operations", points: 2 }] },
    ],
  },
  {
    id: "industry", title: "Industrial capacity", category: "Sustainment", optional: true, options: [
      { id: "fund", label: "Fund the line", summary: "Build future capacity.", tags: [], burden: [] },
    ],
  },
] as unknown as DecisionMemo[];

const preview = {
  decisionPreviews: [], acceptedRiskCandidates: [], predictedEvents: [], chiefCoalitions: [],
  packetSummary: { mainEffort: "operations", mainEffortSource: "observed", slackPoints: 3, slackStatus: "room", strainedDirectorates: ["plans"] },
  projectedResult: { staffFunctions: [], staffModules: [], directorateBurden: [{ directorate: "operations", burdenPoints: 2, capacity: 4, burdenLevel: "light" }] },
} as unknown as PreviewPayload;

test("MemosScreen presents the selected portfolio, capacity left, and optional work deliberately skipped", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<MemosScreen
      memos={memos}
      selections={[{ memoId: "posture", optionId: "hold" }]}
      staffNegotiations={[]}
      staffModules={[]}
      preview={preview}
      previewLoading={false}
      previewError={null}
      canProceed
      onSelect={() => {}}
      onCommanderIntent={() => {}}
      onProceed={() => {}}
      onBack={() => {}}
    />);
  });
  assert.match(container.textContent ?? "", /This month's packet/);
  assert.match(container.textContent ?? "", /Posture/);
  assert.match(container.textContent ?? "", /Hold the line/);
  assert.match(container.textContent ?? "", /Organisational slack: 3 points, room/);
  assert.match(container.textContent ?? "", /Pressure carried: Plans/);
  assert.match(container.textContent ?? "", /Deliberately not taking/);
  assert.match(container.textContent ?? "", /Industrial capacity/);
  act(() => root.unmount());
});

test("MemosScreen compares the selected course with authored alternative facts without a score", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<MemosScreen
      memos={memos}
      selections={[{ memoId: "posture", optionId: "hold" }]}
      staffNegotiations={[]}
      staffModules={[]}
      preview={preview}
      previewLoading={false}
      previewError={null}
      canProceed
      onSelect={() => {}}
      onCommanderIntent={() => {}}
      onProceed={() => {}}
      onBack={() => {}}
    />);
  });
  const compare = container.querySelector('select[aria-label="Compare courses"]')!;
  act(() => {
    compare.value = "surge";
    compare.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  });
  assert.match(container.textContent ?? "", /Current course/);
  assert.match(container.textContent ?? "", /Alternative/);
  assert.match(container.textContent ?? "", /Surge forward/);
  assert.match(container.textContent ?? "", /Staff work: Operations 2/);
  assert.doesNotMatch(container.textContent ?? "", /recommended|overall score/i);
  act(() => root.unmount());
});

test("MemosScreen records Commander’s Intent during packet assembly", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const intents: unknown[] = [];
  act(() => {
    root.render(<MemosScreen
      memos={memos}
      selections={[{ memoId: "posture", optionId: "hold" }]}
      staffNegotiations={[]}
      staffModules={[]}
      preview={preview}
      previewLoading={false}
      previewError={null}
      canProceed
      onSelect={() => {}}
      onCommanderIntent={(intent) => intents.push(intent)}
      onProceed={() => {}}
      onBack={() => {}}
    />);
  });
  const intentSelect = container.querySelector('select[aria-label="Main effort"]')!;
  act(() => {
    intentSelect.value = "operations";
    intentSelect.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  });
  assert.deepEqual(intents, [{ mainEffort: "operations" }]);
  act(() => root.unmount());
});
