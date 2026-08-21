import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act } from "react";
import { soloScenario, spriteVisualLanguage } from "@brass-ledger/content";
import { createInitialGameSession, countMetCampaignObjectives, type GameSession } from "@brass-ledger/shared";
import { deriveDecisionMemos } from "@brass-ledger/sim";
import type { PreviewPayload, SessionEnvelope, SessionSummary } from "../src/lib/types";
import { App } from "../src/App";

// ── DOM shim: App mounts a real React root, which needs a document. ──
const dom = new JSDOM("<!doctype html><html><body></body></html>");
const globals = globalThis as unknown as Record<string, unknown>;
globals.window = dom.window;
globals.document = dom.window.document;
// Node 22 exposes navigator as a getter-only global; redefine it for React.
Object.defineProperty(globals, "navigator", { value: dom.window.navigator, configurable: true });
globals.HTMLElement = dom.window.HTMLElement;
globals.IS_REACT_ACT_ENVIRONMENT = true;

const { createRoot } = await import("react-dom/client");

const SESSION_ID = "app-preview-regression-session";
const session: GameSession = createInitialGameSession(soloScenario, SESSION_ID);
const memos = deriveDecisionMemos(soloScenario, session.state);
const milestones = countMetCampaignObjectives(session.state);
const summary: SessionSummary = {
  id: SESSION_ID,
  turn: session.state.turn,
  milestonesMet: milestones.met,
  milestonesTotal: milestones.total,
  campaignStatus: session.state.campaignStatus,
  campaignScore: session.state.campaignScore,
  summary: "app preview regression fixture",
};
const envelope: SessionEnvelope = { session, memos, summary };

/** Each preview-turn call resolves its FETCH separately from its BODY, so a test
 * can publish a newer preview while an older response's body is still in flight. */
function deferredPreviewCall() {
  let resolveFetch!: (response: unknown) => void;
  let resolveBody!: (payload: PreviewPayload) => void;
  const body = new Promise<PreviewPayload>((resolve) => {
    resolveBody = resolve;
  });
  const fetchPromise = new Promise<unknown>((resolve) => {
    resolveFetch = resolve;
  });
  return {
    fetchPromise,
    resolveFetch: () => resolveFetch({ ok: true, json: () => body }),
    resolveBody,
  };
}

function appFetchMock(conversations?: {
  open: (chiefId: string, memoId: string, optionId: string, expectedRevision?: number) => Promise<unknown>;
  respond: (chiefId: string, responseId: string, expectedRevision?: number) => Promise<unknown>;
}) {
  const previewCalls: ReturnType<typeof deferredPreviewCall>[] = [];
  const resolveTurnCalls: Array<{ expectedRevision?: number }> = [];
  const fetchMock = (url: string, init?: RequestInit) => {
    if (url === "/api/scenario") {
      // The server transports the sprite visual-language table on the scenario
      // summary (it is NOT part of the raw content scenario).
      return Promise.resolve({ ok: true, json: async () => ({ scenario: { ...soloScenario, spriteVisualLanguage } }) });
    }
    if (url === "/api/sessions" && !init?.method) {
      return Promise.resolve({ ok: true, json: async () => ({ sessions: [summary] }) });
    }
    if (url === `/api/sessions/${SESSION_ID}` && !init?.method) {
      return Promise.resolve({ ok: true, json: async () => envelope });
    }
    if (url.endsWith("/preview-turn") && init?.method === "POST") {
      const call = deferredPreviewCall();
      previewCalls.push(call);
      return call.fetchPromise;
    }
    if (url.endsWith("/conversation/open") && init?.method === "POST") {
      if (!conversations) throw new Error(`unexpected fetch: ${init?.method ?? "GET"} ${url}`);
      const body = JSON.parse(String(init.body)) as { memoId: string; optionId: string; expectedRevision?: number };
      const chiefId = url.match(/chiefs\/([^/]+)\/conversation\/open$/)?.[1] ?? "";
      return Promise.resolve({
        ok: true,
        json: async () => conversations.open(chiefId, body.memoId, body.optionId, body.expectedRevision),
      });
    }
    if (url.endsWith("/respond") && init?.method === "POST") {
      if (!conversations) throw new Error(`unexpected fetch: ${init?.method ?? "GET"} ${url}`);
      const body = JSON.parse(String(init.body)) as { responseId: string; expectedRevision?: number };
      const chiefId = url.match(/chiefs\/([^/]+)\/respond$/)?.[1] ?? "";
      return Promise.resolve({
        ok: true,
        json: async () => conversations.respond(chiefId, body.responseId, body.expectedRevision),
      });
    }
    if (url.endsWith("/resolve-turn") && init?.method === "POST") {
      // Recorded (with the expected revision) so tests can assert the handler
      // NEVER fired against a stale/pending preview, and that a valid commit
      // carries the CURRENT revision; left pending so a stray call cannot
      // silently advance the app into after-action and mask the assertion.
      resolveTurnCalls.push(JSON.parse(String(init.body)) as { expectedRevision?: number });
      return new Promise<never>(() => {});
    }
    throw new Error(`unexpected fetch: ${init?.method ?? "GET"} ${url}`);
  };
  return { fetchMock, previewCalls, resolveTurnCalls };
}

/** A preview whose projected staff readout carries the marker in the rendered
 * forecast panel, so a test can see WHICH preview is published in the DOM. */
function previewPayload(
  marker: string,
  chiefCoalitions: Array<{
    memoId: string;
    optionId: string;
    posture: string;
    optionLabel: string;
    supportChiefNames: string[];
    conditionalChiefNames: string[];
    objectionChiefNames: string[];
    staffConstraintDirectorates: string[];
  }> = [],
  chiefPositions: unknown[] = [],
): PreviewPayload {
  return {
    marker,
    decisionPreviews: [],
    acceptedRiskCandidates: [],
    predictedEvents: [],
    chiefCoalitions: chiefCoalitions as unknown as PreviewPayload["chiefCoalitions"],
    projectedResult: {
      staffModules: [],
      staffFunctions: [
        {
          id: `fn-${marker}`,
          shortLabel: marker,
          label: marker,
          burdenPoints: 1,
          capacity: 10,
          status: "light",
          standingRemit: "",
          activeWarning: null,
          warnings: [],
        },
      ],
      chiefPositions,
    } as unknown as PreviewPayload["projectedResult"],
  } as unknown as PreviewPayload;
}

// ── Chief-conversation fixtures (closing pass 4 P1): a real scenario chief
// ("briggs", Chief of Operations) so the position card renders with the real
// advisor/sprite machinery, and a minimal conversation record for the sheet. ──
const CHIEF_ID = "briggs";

const briggsPosition = {
  chiefId: CHIEF_ID,
  chiefName: "Lt. Gen. Mara Briggs",
  directorate: "operations",
  memoId: "posture",
  optionId: "tempo-hold",
  position: "support",
  institutionalReason: "Readiness that is visible enough to deter keeps the frontage quiet.",
  requiredCondition: "",
  confidenceNote: "",
  consequenceIfIgnored: "",
  staffReadoutEvidence: {
    staffFunctionLabel: "Operations",
    metricLabel: "Supportable tempo",
    metricValue: 62,
    metricStatus: "healthy",
    burdenLevel: "light",
    burdenPoints: 1,
  },
} as unknown as import("@brass-ledger/shared").ChiefPositionEntry;

function conversationRecord(status: "active" | "completed", revision: number) {
  return {
    id: `conv-${CHIEF_ID}-${revision}`,
    turn: session.state.turn,
    chiefId: CHIEF_ID,
    chiefName: "Lt. Gen. Mara Briggs",
    memoId: "posture",
    memoTitle: "Posture for the northern frontage",
    optionId: "tempo-hold",
    optionLabel: "Tempo hold",
    stage: status === "active" ? "bargaining" : "completed",
    status,
    title: "The tempo hold",
    synopsis: "Briggs backs a posture the force can sustain.",
    position: "support",
    institutionalReason: "Readiness that is visible enough to deter keeps the frontage quiet.",
    requiredCondition: "",
    confidenceNote: "",
    consequenceIfIgnored: "",
    staffReadoutEvidence: briggsPosition.staffReadoutEvidence,
    transcript: [
      {
        role: "chief",
        speaker: "Lt. Gen. Mara Briggs",
        text: "A steady posture keeps the force ready without burning it out.",
      },
    ],
    choices:
      status === "active"
        ? [{ id: "reassure", label: "Reassure her", summary: "Confirm the hold is deliberate and reviewed.", trustDelta: 2, nextStage: "completed" }]
        : [],
    choiceTrail: [],
    trustBefore: 58,
    trustAfter: 60,
    totalTrustDelta: 2,
  } as unknown as import("@brass-ledger/shared").ChiefConversationRecord;
}

function mountApp() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<App />);
  });
  return { root, container };
}

function buttonWithText(text: string): HTMLButtonElement {
  const found = [...document.querySelectorAll("button")].find((button) => button.textContent?.includes(text));
  if (!found) throw new Error(`no button containing "${text}"`);
  return found;
}

function proceedButton(): HTMLButtonElement {
  return buttonWithText("Hear from the chiefs");
}

async function actTick(ms: number) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

test("App blocks proceeding on a stale preview after selections change and clears the preview when the last selection is removed (closing pass 2 P1 regression)", async () => {
  const { fetchMock, previewCalls } = appFetchMock();
  globals.fetch = fetchMock;
  const { root } = mountApp();

  // Bootstrap: scenario + sessions resolve, hub renders with the fixture session.
  await actTick(0);
  assert.ok(buttonWithText("Continue last campaign"), "hub lists the fixture session");

  act(() => {
    buttonWithText("Continue last campaign").click();
  });
  await actTick(0);
  act(() => {
    buttonWithText("Open decision memos").click();
  });
  await actTick(0);
  assert.ok(proceedButton(), "memos screen rendered");

  // ── Zero-selection deselect case: select the optional memo, let its preview
  // publish, then deselect it → the preview must be CLEARED (no new request, no
  // stale forecast left on screen).
  const optionalCheckbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
  assert.ok(optionalCheckbox, "the optional memo checkbox is rendered");
  act(() => {
    optionalCheckbox.click();
  });
  await actTick(450);
  assert.equal(previewCalls.length, 1, "the optional selection requested a preview");
  previewCalls[0]!.resolveFetch();
  previewCalls[0]!.resolveBody(previewPayload("MARKER-OPT"));
  await actTick(0);
  assert.equal(proceedButton().disabled, false, "canProceed once the optional preview is published");
  assert.ok(document.body.textContent!.includes("MARKER-OPT"), "the optional preview is published");

  act(() => {
    optionalCheckbox.click();
  });
  await actTick(0);
  assert.equal(previewCalls.length, 1, "deselecting the last memo fires no preview request");
  assert.ok(!document.body.textContent!.includes("MARKER-OPT"), "the published preview is cleared on zero selections");
  assert.ok(
    document.body.textContent!.includes("Choose an option to see how much work"),
    "the forecast panel returns to the awaiting state",
  );
  assert.equal(proceedButton().disabled, true, "cannot proceed with zero selections");

  // ── Stale-preview consumption race: publish preview A, select B, and attempt
  // to proceed BEFORE B resolves → must be blocked (with the old code, preview A
  // stayed published during B's debounce and canProceed stayed true).
  const postureRadio = (optionId: string) =>
    document.querySelector(`input[name="memo-posture"][value="${optionId}"]`) as HTMLInputElement;
  act(() => {
    postureRadio("measured-deterrence").click();
  });
  await actTick(450);
  assert.equal(previewCalls.length, 2, "selection A requested a preview");
  previewCalls[1]!.resolveFetch();
  previewCalls[1]!.resolveBody(previewPayload("MARKER-A"));
  await actTick(0);
  assert.equal(proceedButton().disabled, false, "canProceed once preview A is published for the current selections");
  assert.ok(document.body.textContent!.includes("MARKER-A"), "preview A is published");

  act(() => {
    postureRadio("tempo-hold").click();
  });
  // Synchronous invalidation: the published preview A must be gone immediately —
  // before B's 400ms debounce has even elapsed, let alone resolved.
  assert.ok(!document.body.textContent!.includes("MARKER-A"), "selecting B synchronously clears the published preview A");
  assert.equal(
    proceedButton().disabled,
    true,
    "proceeding is blocked while B's preview is pending — the stale preview A cannot reach the chiefs/precommit flow",
  );
  await actTick(450);
  assert.equal(previewCalls.length, 3, "selection B requested a preview");
  assert.equal(proceedButton().disabled, true, "still blocked while B is in flight");
  previewCalls[2]!.resolveFetch();
  previewCalls[2]!.resolveBody(previewPayload("MARKER-B"));
  await actTick(0);
  assert.equal(proceedButton().disabled, false, "canProceed once preview B is published");
  assert.ok(document.body.textContent!.includes("MARKER-B"), "preview B is published");
  assert.ok(!document.body.textContent!.includes("MARKER-A"), "preview A is fully gone");

  act(() => {
    root.unmount();
  });
});

test("PreCommitScreen cannot commit while a negotiation change's replacement preview is pending (closing pass 3 P1 regression)", async () => {
  const { fetchMock, previewCalls, resolveTurnCalls } = appFetchMock();
  globals.fetch = fetchMock;
  const { root } = mountApp();

  // Bootstrap to the memos screen.
  await actTick(0);
  assert.ok(buttonWithText("Continue last campaign"), "hub lists the fixture session");
  act(() => {
    buttonWithText("Continue last campaign").click();
  });
  await actTick(0);
  act(() => {
    buttonWithText("Open decision memos").click();
  });
  await actTick(0);
  assert.ok(proceedButton(), "memos screen rendered");

  // Select the optional memo; its preview must carry a staff-constraint
  // coalition so the commit screen offers a negotiation toggle.
  const optionalCheckbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
  assert.ok(optionalCheckbox, "the optional memo checkbox is rendered");
  act(() => {
    optionalCheckbox.click();
  });
  await actTick(450);
  assert.equal(previewCalls.length, 1, "the optional selection requested a preview");
  previewCalls[0]!.resolveFetch();
  previewCalls[0]!.resolveBody(
    previewPayload("MARKER-NEG", [
      {
        memoId: "posture",
        optionId: "tempo-hold",
        posture: "supporting",
        optionLabel: "Tempo hold",
        supportChiefNames: [],
        conditionalChiefNames: [],
        objectionChiefNames: [],
        staffConstraintDirectorates: ["operations"],
      },
    ]),
  );
  await actTick(0);
  assert.equal(proceedButton().disabled, false, "canProceed once the optional preview is published");

  // Walk to the commit screen.
  act(() => {
    proceedButton().click();
  });
  await actTick(0);
  act(() => {
    buttonWithText("Continue to final review").click();
  });
  await actTick(0);
  assert.ok(document.body.textContent!.includes("Final review"), "commit screen rendered");
  assert.ok(
    document.body.textContent!.includes("Take work off a stretched directorate"),
    "the negotiation panel is rendered",
  );
  const commitButton = buttonWithText("Commit the month");
  assert.equal(commitButton.disabled, false, "commit is enabled for the published, key-matched preview");

  // Toggle a negotiation: requestPreview synchronously clears the preview, so
  // commit must lock until the replacement preview resolves. (With the old
  // code, candidates = [] from the null preview read as allAccepted and the
  // button rendered WITHOUT a disabled attribute.)
  const negotiationCheckbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
  assert.ok(negotiationCheckbox, "the negotiation toggle is rendered");
  act(() => {
    negotiationCheckbox.click();
  });
  assert.equal(commitButton.disabled, true, "commit locks immediately while the replacement preview is pending");

  // React does not deliver clicks to a button rendered disabled (even via
  // dispatchEvent or clearing the DOM property), so the handler-level guard is
  // verified separately: the predicate truth-table unit tests cover its
  // condition, and the positive control below proves a valid commit DOES fire
  // resolve-turn — the negative assertions above are not vacuous.
  assert.equal(resolveTurnCalls.length, 0, "no resolve-turn while the replacement preview is pending");

  // Positive control: once the replacement preview resolves, commit re-enables
  // and a real click DOES fire resolve-turn exactly once — proving the negative
  // assertion above is not vacuous.
  await actTick(450);
  assert.equal(previewCalls.length, 2, "the negotiation change requested a replacement preview");
  previewCalls[1]!.resolveFetch();
  previewCalls[1]!.resolveBody(
    previewPayload("MARKER-NEG2", [
      {
        memoId: "posture",
        optionId: "tempo-hold",
        posture: "supporting",
        optionLabel: "Tempo hold",
        supportChiefNames: [],
        conditionalChiefNames: [],
        objectionChiefNames: [],
        staffConstraintDirectorates: ["operations"],
      },
    ]),
  );
  await actTick(0);
  assert.equal(buttonWithText("Commit the month").disabled, false, "commit re-enables once the replacement preview publishes");
  act(() => {
    buttonWithText("Commit the month").click();
  });
  assert.equal(resolveTurnCalls.length, 1, "a valid commit fires resolve-turn exactly once");

  act(() => {
    root.unmount();
  });
});

test("chief conversations advance the session revision, lock the stale preview, and re-request so commit uses the fresh projection (closing pass 4 P1 regression)", async () => {
  // The mock mirrors the server: opening a NEW conversation and every reply
  // advance the revision; re-opening the SAME conversation is a no-op that
  // leaves the revision (and thus the preview) untouched.
  let revision = session.revision;
  let activeConversation: ReturnType<typeof conversationRecord> | null = null;
  const openCalls: Array<{ chiefId: string; memoId: string; optionId: string; expectedRevision?: number }> = [];
  const respondCalls: Array<{ chiefId: string; responseId: string; expectedRevision?: number }> = [];
  const { fetchMock, previewCalls, resolveTurnCalls } = appFetchMock({
    open: async (chiefId, memoId, optionId, expectedRevision) => {
      openCalls.push({ chiefId, memoId, optionId, expectedRevision });
      if (activeConversation) {
        return { session: { ...session, revision }, memos, summary, conversation: activeConversation };
      }
      revision += 1;
      activeConversation = conversationRecord("active", revision);
      return { session: { ...session, revision }, memos, summary, conversation: activeConversation };
    },
    respond: async (chiefId, responseId, expectedRevision) => {
      respondCalls.push({ chiefId, responseId, expectedRevision });
      revision += 1;
      activeConversation = conversationRecord("completed", revision);
      return { session: { ...session, revision }, memos, summary, conversation: activeConversation };
    },
  });
  globals.fetch = fetchMock;
  const { root } = mountApp();

  // Bootstrap to the memos screen and publish preview A (revision 0).
  await actTick(0);
  assert.ok(buttonWithText("Continue last campaign"), "hub lists the fixture session");
  act(() => {
    buttonWithText("Continue last campaign").click();
  });
  await actTick(0);
  act(() => {
    buttonWithText("Open decision memos").click();
  });
  await actTick(0);
  const postureRadio = (optionId: string) =>
    document.querySelector(`input[name="memo-posture"][value="${optionId}"]`) as HTMLInputElement;
  act(() => {
    postureRadio("tempo-hold").click();
  });
  await actTick(450);
  assert.equal(previewCalls.length, 1, "the selection requested a preview");
  previewCalls[0]!.resolveFetch();
  previewCalls[0]!.resolveBody(previewPayload("MARKER-CONV-A", [], [briggsPosition]));
  await actTick(0);
  assert.equal(proceedButton().disabled, false, "canProceed once preview A publishes");
  assert.ok(document.body.textContent!.includes("MARKER-CONV-A"), "preview A is published");

  // Walk to the chiefs screen and open a conversation with Briggs. The server
  // advances the revision to 1 — the preview projected against revision 0 must
  // be invalidated SYNCHRONOUSLY and re-requested against the new revision.
  act(() => {
    proceedButton().click();
  });
  await actTick(0);
  act(() => {
    buttonWithText("Talk to Briggs").click();
  });
  await actTick(0);
  assert.equal(openCalls.length, 1, "open-conversation reached the server");
  assert.equal(openCalls[0]!.expectedRevision, 0, "open carries the pre-mutation revision");
  assert.ok(
    !document.body.textContent!.includes("MARKER-CONV-A"),
    "opening a conversation synchronously clears the stale revision-0 preview",
  );
  assert.equal(previewCalls.length, 1, "the replacement preview is still debouncing");

  // The stale preview must be LOCKED out of every consumer: the commit screen
  // must refuse to commit (and say the forecast is updating) while the
  // replacement preview is pending.
  act(() => {
    buttonWithText("Continue to final review").click();
  });
  await actTick(0);
  const commitButton = buttonWithText("Commit the month");
  assert.equal(commitButton.disabled, true, "commit locks while the conversation's replacement preview is pending");
  assert.ok(
    document.body.textContent!.includes("commit unlocks once the new projection is shown"),
    "the commit screen explains the lock",
  );
  assert.equal(resolveTurnCalls.length, 0, "no resolve-turn while the preview is stale/invalid");
  act(() => {
    buttonWithText("Back to chiefs").click();
  });
  await actTick(0);

  // The conversation mutation re-requested the preview against the new
  // revision; once it publishes, proceeding re-enables and commit consumes
  // the FRESH projection.
  await actTick(450);
  assert.equal(previewCalls.length, 2, "the conversation mutation requested a fresh preview");
  previewCalls[1]!.resolveFetch();
  previewCalls[1]!.resolveBody(previewPayload("MARKER-CONV-B", [], [briggsPosition]));
  await actTick(0);
  assert.ok(document.body.textContent!.includes("MARKER-CONV-B"), "the fresh revision-1 preview publishes");
  act(() => {
    buttonWithText("Continue to final review").click();
  });
  await actTick(0);
  assert.ok(document.body.textContent!.includes("MARKER-CONV-B"), "the commit screen shows the fresh projection");
  assert.ok(!document.body.textContent!.includes("MARKER-CONV-A"), "the stale projection never reaches the commit screen");
  assert.equal(buttonWithText("Commit the month").disabled, false, "commit re-enables on the fresh preview");

  // Back to the chiefs screen for the respond step. Re-opening the SAME
  // conversation is a server no-op (revision unchanged) — the preview must
  // stay valid and published.
  act(() => {
    buttonWithText("Back to chiefs").click();
  });
  await actTick(0);
  act(() => {
    buttonWithText("Talk to Briggs").click();
  });
  await actTick(0);
  assert.equal(openCalls.length, 2, "re-opening the same conversation reached the server");
  assert.equal(previewCalls.length, 2, "a no-op re-open does not re-request the preview");
  assert.ok(document.body.textContent!.includes("MARKER-CONV-B"), "the preview survives the no-op re-open");

  // Respond: the reply advances the revision to 2 — the revision-1 preview
  // must lock synchronously and a third preview must be requested.
  act(() => {
    buttonWithText("Reassure her").click();
  });
  await actTick(0);
  assert.equal(respondCalls.length, 1, "respond reached the server");
  assert.equal(respondCalls[0]!.expectedRevision, 1, "respond carries the post-open revision");
  assert.ok(
    !document.body.textContent!.includes("MARKER-CONV-B"),
    "responding synchronously clears the stale revision-1 preview",
  );
  await actTick(450);
  assert.equal(previewCalls.length, 3, "the respond mutation requested a fresh preview");
  previewCalls[2]!.resolveFetch();
  previewCalls[2]!.resolveBody(previewPayload("MARKER-CONV-C", [], [briggsPosition]));
  await actTick(0);

  // Commit must consume the FRESH (revision-2) projection and carry the
  // current revision as expectedRevision.
  act(() => {
    buttonWithText("Continue to final review").click();
  });
  await actTick(0);
  assert.ok(document.body.textContent!.includes("MARKER-CONV-C"), "the commit screen shows the post-respond projection");
  assert.ok(!document.body.textContent!.includes("MARKER-CONV-B"), "the respond-stale projection never reaches the commit screen");
  assert.equal(buttonWithText("Commit the month").disabled, false, "commit re-enables on the post-respond preview");
  act(() => {
    buttonWithText("Commit the month").click();
  });
  assert.equal(resolveTurnCalls.length, 1, "a valid commit fires resolve-turn exactly once");
  assert.equal(resolveTurnCalls[0]!.expectedRevision, 2, "resolve-turn carries the post-respond revision");

  act(() => {
    root.unmount();
  });
});
