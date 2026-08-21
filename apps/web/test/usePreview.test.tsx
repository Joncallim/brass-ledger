import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act } from "react";
import { soloScenario } from "@brass-ledger/content";
import { createInitialGameSession, type MemoSelection } from "@brass-ledger/shared";
import type { PreviewPayload, TurnCycleState } from "../src/lib/types";
import { previewTurn } from "../src/lib/api";
import { usePreview, previewFingerprint } from "../src/hooks/usePreview";

// ── DOM shim: the hook tests mount a real React root, which needs a document. ──
const dom = new JSDOM("<!doctype html><html><body></body></html>");
const globals = globalThis as unknown as Record<string, unknown>;
globals.window = dom.window;
globals.document = dom.window.document;
// Node 22 exposes navigator as a getter-only global; redefine it for React.
Object.defineProperty(globals, "navigator", { value: dom.window.navigator, configurable: true });
globals.HTMLElement = dom.window.HTMLElement;
globals.IS_REACT_ACT_ENVIRONMENT = true;

const { createRoot } = await import("react-dom/client");

/** Deferred fetch mock: each call returns a promise the test settles manually.
 * Honours AbortSignal the way fetch does — abort before settlement rejects with an
 * AbortError; abort after settlement is a no-op (a response that already resolved
 * still lands, which is exactly the race the generation guard must survive). */
function deferredFetch() {
  type Call = {
    signal: AbortSignal | null;
    resolve: (response: { ok: boolean; json: () => Promise<unknown> }) => void;
  };
  const calls: Call[] = [];
  const fetchMock = (_url: string, init?: RequestInit) => {
    const call: Call = { signal: init?.signal ?? null, resolve: () => {} };
    const promise = new Promise<{ ok: boolean; json: () => Promise<unknown> }>((resolve, reject) => {
      call.resolve = resolve;
      call.signal?.addEventListener("abort", () => {
        reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      });
    });
    calls.push(call);
    return promise;
  };
  return { fetchMock, calls };
}

function response(payload: PreviewPayload) {
  return { ok: true, json: async () => payload };
}

function payload(marker: string): PreviewPayload {
  return {
    marker,
    decisionPreviews: [],
    acceptedRiskCandidates: [],
    predictedEvents: [],
    chiefCoalitions: [],
    projectedResult: { staffModules: [], staffFunctions: [] },
  } as unknown as PreviewPayload;
}

function cycleFor(selections: MemoSelection[]): TurnCycleState {
  return {
    session: createInitialGameSession(soloScenario, `preview-race-${Math.random()}`),
    memos: [],
    selections,
    preview: null,
    acceptedRiskChoices: {},
    staffNegotiations: [],
    latestResult: null,
  };
}

/** The same cycle, but with the session revision advanced — what the app holds
 * after an authoritative server mutation (a chief conversation). */
function cycleAtRevision(selections: MemoSelection[], revision: number): TurnCycleState {
  const cycle = cycleFor(selections);
  return { ...cycle, session: { ...cycle.session, revision } };
}

type HookApi = {
  requestPreview: (cycle: TurnCycleState, selections?: MemoSelection[], staffNegotiations?: never[]) => void;
  clearPreview: () => void;
  preview: PreviewPayload | null;
  previewKey: string | null;
  loading: boolean;
  error: string | null;
};

function Harness({ apiRef }: { apiRef: { current: HookApi | null } }) {
  const api = usePreview("preview-race-session");
  apiRef.current = api;
  return null;
}

function mountHarness() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const apiRef: { current: HookApi | null } = { current: null };
  act(() => {
    root.render(<Harness apiRef={apiRef} />);
  });
  return { api: () => apiRef.current!, root, container };
}

async function actTick(ms: number) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

const measuredDeterrence: MemoSelection[] = [{ memoId: "posture", optionId: "measured-deterrence" }];
const tempoHold: MemoSelection[] = [{ memoId: "posture", optionId: "tempo-hold" }];

test("previewTurn forwards the caller's AbortSignal into fetch (never signal:null)", async () => {
  const { fetchMock, calls } = deferredFetch();
  globals.fetch = fetchMock;
  const controller = new AbortController();
  const pending = previewTurn("session-1", cycleFor(measuredDeterrence), undefined, undefined, controller.signal);
  assert.equal(calls.length, 1, "one request reached the network");
  assert.equal(calls[0]!.signal, controller.signal, "fetch receives the exact AbortSignal");
  assert.equal(calls[0]!.signal?.aborted, false, "the signal starts live");
  calls[0]!.resolve(response(payload("ok")));
  const data = await pending;
  assert.equal((data as { marker: string }).marker, "ok");
  controller.abort();
});

test("stale preview responses cannot overwrite the preview for newer selections (closing review P1 repro)", async () => {
  const { fetchMock, calls } = deferredFetch();
  globals.fetch = fetchMock;
  const { api } = mountHarness();

  // Selection change #1: request A. After the debounce, fetch A is in flight.
  act(() => {
    api().requestPreview(cycleFor(measuredDeterrence));
  });
  await actTick(450);
  assert.equal(calls.length, 1, "request A reached the network");
  assert.notEqual(calls[0]!.signal, null, "request A carries an AbortSignal");

  // Request A's FETCH already resolved on the server before the next selection
  // change — abort cannot retract a fulfilled response — but A's BODY is still
  // in flight. This is the exact case where only the generation guard can stop
  // the stale publish.
  let resolveBodyA!: (payload: PreviewPayload) => void;
  const bodyA = new Promise<PreviewPayload>((resolve) => {
    resolveBodyA = resolve;
  });
  calls[0]!.resolve({ ok: true, json: () => bodyA });

  // Selection change #2 (tempo-hold): the active request must be aborted and
  // invalidated IMMEDIATELY — synchronously, before the new debounce elapses.
  act(() => {
    api().requestPreview(cycleFor(tempoHold));
  });
  assert.equal(calls[0]!.signal?.aborted, true, "request A is aborted immediately on selection change");
  assert.equal(api().preview, null, "the stale response A must not publish");

  await actTick(450);
  assert.equal(calls.length, 2, "request B reached the network");
  assert.equal(calls[1]!.signal?.aborted, false, "request B carries its own live signal");

  // B fully resolves and publishes FIRST (the newer request wins).
  calls[1]!.resolve(response(payload("B")));
  await actTick(0);
  assert.equal((api().preview as { marker: string } | null)?.marker, "B", "the current request publishes");
  assert.equal(api().error, null, "no spurious error from the superseded request");
  assert.equal(api().loading, false, "loading clears for the current generation");

  // Only NOW does the older request's BODY land: the stale continuation must be
  // dropped. The committed regression fails without the generation guard — the
  // final preview would flip to A.
  resolveBodyA(payload("A"));
  await actTick(0);
  assert.equal((api().preview as { marker: string } | null)?.marker, "B", "the stale response A cannot overwrite B");
  assert.equal(api().error, null, "the dropped stale response leaves no error");
  assert.equal(api().loading, false, "the dropped stale response leaves no stuck loading");
});

test("aborting an in-flight preview (unresolved) rejects cleanly and leaves no error or stuck loading", async () => {
  const { fetchMock, calls } = deferredFetch();
  globals.fetch = fetchMock;
  const { api } = mountHarness();

  act(() => {
    api().requestPreview(cycleFor(measuredDeterrence));
  });
  await actTick(450);
  assert.equal(calls.length, 1);

  // The next selection change aborts the unresolved request A, then starts B.
  act(() => {
    api().requestPreview(cycleFor(tempoHold));
  });
  await actTick(450);
  assert.equal(calls.length, 2, "request B reached the network after A was aborted");

  // B resolves normally; A's AbortError must have been swallowed by the hook.
  calls[1]!.resolve(response(payload("B")));
  await actTick(0);
  assert.equal((api().preview as { marker: string } | null)?.marker, "B");
  assert.equal(api().error, null, "AbortError from the superseded request is not surfaced");
  assert.equal(api().loading, false);
});

test("clearPreview invalidates an in-flight request so its late response cannot resurrect a preview", async () => {
  const { fetchMock, calls } = deferredFetch();
  globals.fetch = fetchMock;
  const { api } = mountHarness();

  act(() => {
    api().requestPreview(cycleFor(measuredDeterrence));
  });
  await actTick(450);
  assert.equal(calls.length, 1);

  act(() => {
    api().clearPreview();
  });
  assert.equal(calls[0]!.signal?.aborted, true, "clearPreview aborts the in-flight request");
  calls[0]!.resolve(response(payload("late")));
  await actTick(0);
  assert.equal(api().preview, null, "a response landing after clearPreview is dropped");
  assert.equal(api().loading, false);
});

test("an advanced session revision invalidates the published preview and yields a new key (closing pass 4 P1 repro)", async () => {
  const { fetchMock, calls } = deferredFetch();
  globals.fetch = fetchMock;
  const { api } = mountHarness();

  // Preview A publishes for revision 0.
  act(() => {
    api().requestPreview(cycleAtRevision(measuredDeterrence, 0));
  });
  await actTick(450);
  assert.equal(calls.length, 1, "request A reached the network");
  calls[0]!.resolve(response(payload("A")));
  await actTick(0);
  assert.equal((api().preview as { marker: string } | null)?.marker, "A");
  assert.equal(api().previewKey, previewFingerprint(measuredDeterrence, [], 0), "the key carries the projection revision");

  // An authoritative mutation (chief conversation) advances the revision while
  // the selections stay IDENTICAL. The published preview for revision 0 must
  // be invalidated synchronously and a fresh preview requested — exactly like
  // a selection change.
  act(() => {
    api().requestPreview(cycleAtRevision(measuredDeterrence, 1));
  });
  assert.equal(api().preview, null, "the revision-0 preview is dropped synchronously");
  assert.equal(api().previewKey, null, "the revision-0 key is dropped synchronously");
  await actTick(450);
  assert.equal(calls.length, 2, "the revision advance requested a fresh preview");
  calls[1]!.resolve(response(payload("B")));
  await actTick(0);
  assert.equal((api().preview as { marker: string } | null)?.marker, "B", "the fresh preview publishes");
  assert.equal(api().previewKey, previewFingerprint(measuredDeterrence, [], 1), "the fresh key carries the NEW revision");
  assert.notEqual(
    api().previewKey,
    previewFingerprint(measuredDeterrence, [], 0),
    "a revision-1 preview must never carry the revision-0 key — with the revision left out of the fingerprint, this assertion fails",
  );
});
