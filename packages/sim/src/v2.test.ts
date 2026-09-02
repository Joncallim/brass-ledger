import test from "node:test";
import assert from "node:assert/strict";
import { v2CurrentRulesetVersion, type V2AgendaIssue, type V2Identity, type V2Session } from "@brass-ledger/shared";
import {
  createV2CommandSetLedgerEntry,
  createV2IntentDeclarationLedgerEntry,
  V2CommandValidationError,
  V2ReplayValidationError,
  canonicalV2Json,
  v2FinalSessionDigest,
  v2InitialStateDigest,
  v2Sha256,
  resolveV2CommandSet,
  declareV2StandingIntent,
  validateV2ReplaySkeleton,
} from "./index";

const intent = {
  mainPriority: "beacon-security",
  redLine: "civilian-shipping",
  toleratedCost: "political-friction",
  defaultStyle: "quiet-preparation",
} as const;

const identity: V2Identity = {
  ruleset: "v2", rulesetVersion: v2CurrentRulesetVersion, scenarioId: "kestrel-strait", contentVersion: "2026.09.02",
  contentDigest: "a".repeat(64),
};

function validSession(): V2Session {
  const initialState = { cycle: 1, seed: "kestrel-seed", standingIntent: null } as const;
  const session = {
    id: "v2-save-1", campaignId: "v2-campaign-1", revision: 0, identity,
    initialState, state: initialState, actionLedger: [] as [], updatedAt: "2026-09-02T00:00:00.000Z",
  };
  return {
    ...session,
    initialStateDigest: v2InitialStateDigest(identity, initialState),
    finalStateDigest: v2FinalSessionDigest(session),
  };
}

const agenda: readonly V2AgendaIssue[] = [
  { id: "watch", responsibleOfficer: "operations", recommendedOrderId: "maintain", authoredOrders: [{ id: "maintain" }, { id: "reinforce" }], mayDefer: false },
  { id: "consult", responsibleOfficer: "political", recommendedOrderId: "liaison", authoredOrders: [{ id: "liaison" }, { id: "agreement" }], mayDefer: true },
  { id: "lattice", responsibleOfficer: "intelligence", recommendedOrderId: "defer-funding", authoredOrders: [{ id: "defer-funding" }, { id: "protect" }], mayDefer: true },
] as const;

const agendaProvider = () => agenda;

function declaredState() {
  return { cycle: 1, seed: "kestrel-seed", standingIntent: intent } as const;
}

test("V2 canonical SHA-256 has stable hard-coded vectors", () => {
  assert.equal(canonicalV2Json({ b: 2, a: 1 }), '{"a":1,"b":2}');
  assert.equal(v2Sha256({ b: 2, a: 1 }), "43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777");
  assert.equal(canonicalV2Json({ é: 4, z: 1, ä: 3, Å: 2 }), '{"z":1,"Å":2,"ä":3,"é":4}');
  assert.equal(v2Sha256({ é: 4, z: 1, ä: 3, Å: 2 }), "997c7e2cf5d27456c0e6bfb9006a736c2f156f753e419c06ee6f61d7872d8190");
  const session = validSession();
  assert.equal(session.initialStateDigest, "876316c73db6980ec0085727c539ca2a76a6cd3a658d922d021f81c6eee65bda");
  assert.equal(session.finalStateDigest, "8809c3710decfd36a0fc4a322fa5946c6276ab84ef38fbb8958278dcbcb72bd3");
});

test("V2 digest evidence changes for every identity field", () => {
  const state = { cycle: 1, seed: "kestrel-seed" };
  const baseline = v2InitialStateDigest(identity, state);
  const changed: V2Identity[] = [
    { ...identity, rulesetVersion: "different" },
    { ...identity, scenarioId: "other-scenario" },
    { ...identity, contentVersion: "other-content" },
    { ...identity, contentDigest: "b".repeat(64) },
  ];
  for (const candidate of changed) assert.notEqual(v2InitialStateDigest(candidate, state), baseline);
});

test("V2 skeleton verifies matching identity and explicitly empty ledger", () => {
  const session = validSession();
  assert.deepEqual(validateV2ReplaySkeleton(session, identity), session);
});

test("V2 skeleton rejects registry, digest, and zero-ledger state tampering with stable codes", () => {
  const session = validSession();
  const cases: Array<[unknown, V2Identity, V2ReplayValidationError["code"]]> = [
    [session, { ...identity, contentDigest: "b".repeat(64) }, "v2_content_identity_mismatch"],
    [{ ...session, initialStateDigest: "0".repeat(64) }, identity, "v2_initial_state_digest_mismatch"],
    [{ ...session, state: { cycle: 1, seed: "other", standingIntent: null } }, identity, "v2_state_changed_without_ledger"],
    [{ ...session, finalStateDigest: "0".repeat(64) }, identity, "v2_final_state_digest_mismatch"],
  ];
  for (const [candidate, liveIdentity, code] of cases) {
    assert.throws(() => validateV2ReplaySkeleton(candidate, liveIdentity), (error: unknown) => error instanceof V2ReplayValidationError && error.code === code);
  }
  const revisedZeroLedger = { ...session, revision: 1 };
  const digestRecomputedZeroLedger = { ...revisedZeroLedger, finalStateDigest: v2FinalSessionDigest(revisedZeroLedger) };
  assert.throws(() => validateV2ReplaySkeleton(digestRecomputedZeroLedger, identity), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_revision_mismatch");
});

test("authoritative command resolution delegates by responsible-officer recommendation and is atomic", () => {
  const state = declaredState();
  const resolved = resolveV2CommandSet(state, 4, agenda, {
    cycle: 1, expectedRevision: 4,
    dispositions: [
      { issueId: "watch", kind: "delegate" },
      { issueId: "consult", kind: "defer" },
      { issueId: "lattice", kind: "intervene", orderId: "protect" },
    ],
  });
  assert.deepEqual(resolved.finalOrders, [
    { issueId: "watch", responsibleOfficer: "operations", disposition: "delegate", orderId: "maintain", interventionCost: 0 },
    { issueId: "consult", responsibleOfficer: "political", disposition: "defer", orderId: null, interventionCost: 0 },
    { issueId: "lattice", responsibleOfficer: "intelligence", disposition: "intervene", orderId: "protect", interventionCost: 1 },
  ]);
  assert.equal(resolved.interventionCost, 1);
  assert.deepEqual(resolved.postState, { cycle: 2, seed: "kestrel-seed", standingIntent: intent });
  assert.equal(resolved.postRevision, 5);
});

test("command resolution rejects stale, reordered, illegal, and over-budget whole command sets", () => {
  const state = declaredState();
  const cases: Array<[unknown, V2CommandValidationError["code"]]> = [
    [{ cycle: 1, expectedRevision: 4, dispositions: [{ issueId: "watch", kind: "delegate", orderId: "forged" }] }, "v2_invalid_command"],
    [{ cycle: 1, expectedRevision: 3, dispositions: agenda.map((issue) => ({ issueId: issue.id, kind: "delegate" })) }, "v2_stale_revision"],
    [{ cycle: 2, expectedRevision: 4, dispositions: agenda.map((issue) => ({ issueId: issue.id, kind: "delegate" })) }, "v2_wrong_cycle"],
    [{ cycle: 1, expectedRevision: 4, dispositions: [{ issueId: "watch", kind: "delegate" }, { issueId: "watch", kind: "delegate" }, { issueId: "lattice", kind: "delegate" }] }, "v2_disposition_order"],
    [{ cycle: 1, expectedRevision: 4, dispositions: [{ issueId: "watch", kind: "defer" }, { issueId: "consult", kind: "delegate" }, { issueId: "lattice", kind: "delegate" }] }, "v2_illegal_defer"],
    [{ cycle: 1, expectedRevision: 4, dispositions: [{ issueId: "watch", kind: "intervene", orderId: "invented" }, { issueId: "consult", kind: "delegate" }, { issueId: "lattice", kind: "delegate" }] }, "v2_illegal_intervention"],
    [{ cycle: 1, expectedRevision: 4, dispositions: [{ issueId: "watch", kind: "intervene", orderId: "maintain" }, { issueId: "consult", kind: "delegate" }, { issueId: "lattice", kind: "delegate" }] }, "v2_illegal_intervention"],
    [{ cycle: 1, expectedRevision: 4, dispositions: [{ issueId: "watch", kind: "intervene", orderId: "reinforce" }, { issueId: "consult", kind: "intervene", orderId: "agreement" }, { issueId: "lattice", kind: "intervene", orderId: "protect" }] }, "v2_intervention_limit"],
  ];
  for (const [commandSet, code] of cases) {
    assert.throws(() => resolveV2CommandSet(state, 4, agenda, commandSet), (error: unknown) => error instanceof V2CommandValidationError && error.code === code);
  }
});

test("complete command submissions canonicalize to trusted agenda order before persistence", () => {
  const state = declaredState();
  const canonical = resolveV2CommandSet(state, 0, agenda, {
    cycle: 1, expectedRevision: 0,
    dispositions: [{ issueId: "watch", kind: "delegate" }, { issueId: "consult", kind: "defer" }, { issueId: "lattice", kind: "intervene", orderId: "protect" }],
  });
  const permuted = resolveV2CommandSet(state, 0, agenda, {
    cycle: 1, expectedRevision: 0,
    dispositions: [{ issueId: "lattice", kind: "intervene", orderId: "protect" }, { issueId: "watch", kind: "delegate" }, { issueId: "consult", kind: "defer" }],
  });
  assert.deepEqual(permuted, canonical);
  assert.throws(() => resolveV2CommandSet(state, 0, [], { cycle: 1, expectedRevision: 0, dispositions: [] }), (error: unknown) => error instanceof V2CommandValidationError && error.code === "v2_invalid_agenda");
});

test("non-empty command ledger replays only against trusted canonical agenda and detects action evidence tampering", () => {
  const initialState = { cycle: 1, seed: "kestrel-seed", standingIntent: null } as const;
  const declaration = createV2IntentDeclarationLedgerEntry(initialState, 0, { cycle: 1, expectedRevision: 0, intent });
  const entry = createV2CommandSetLedgerEntry(declaration.postState, 1, agenda, {
    cycle: 1, expectedRevision: 1,
    dispositions: [{ issueId: "lattice", kind: "intervene", orderId: "protect" }, { issueId: "watch", kind: "delegate" }, { issueId: "consult", kind: "defer" }],
  });
  assert.deepEqual(entry.commandSet.dispositions.map((disposition) => disposition.issueId), ["watch", "consult", "lattice"]);
  const root = { id: "v2-save-1", campaignId: "v2-campaign-1", revision: 2, identity, initialState, state: entry.postState, actionLedger: [declaration, entry], updatedAt: "2026-09-02T00:00:00.000Z" };
  const session: V2Session = { ...root, initialStateDigest: v2InitialStateDigest(identity, initialState), finalStateDigest: v2FinalSessionDigest(root) };
  assert.deepEqual(validateV2ReplaySkeleton(session, identity, agendaProvider), session);
  let mismatchedProviderCalls = 0;
  const mismatchedProvider = () => {
    mismatchedProviderCalls += 1;
    throw new Error("A registry mismatch must be rejected before agenda lookup.");
  };
  assert.throws(() => validateV2ReplaySkeleton(session, { ...identity, contentDigest: "b".repeat(64) }, mismatchedProvider), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_content_identity_mismatch");
  assert.equal(mismatchedProviderCalls, 0);
  assert.throws(() => validateV2ReplaySkeleton(session, identity), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_nonempty_ledger_unsupported");
  assert.throws(() => validateV2ReplaySkeleton({ ...session, actionLedger: [declaration, { ...entry, finalOrders: [{ ...entry.finalOrders[0]!, orderId: "reinforce" }, ...entry.finalOrders.slice(1)] }] }, identity, agendaProvider), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_post_state_mismatch");
  assert.throws(() => validateV2ReplaySkeleton({ ...session, actionLedger: [declaration, { ...entry, preStateHash: "0".repeat(64) }] }, identity, agendaProvider), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_hash_mismatch");
  assert.throws(() => validateV2ReplaySkeleton({ ...session, actionLedger: [declaration, { ...entry, interventionCost: 0 }] }, identity, agendaProvider), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_post_state_mismatch");
  assert.throws(() => validateV2ReplaySkeleton({ ...session, actionLedger: [declaration, { ...entry, commandSet: { ...entry.commandSet, dispositions: [...entry.commandSet.dispositions].reverse() } }] }, identity, agendaProvider), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_transition_invalid");
});

test("opening intent declaration is the sole non-advancing prerequisite for commands and replays without an agenda", () => {
  const initialState = { cycle: 1, seed: "kestrel-seed", standingIntent: null } as const;
  const declaration = { cycle: 1, expectedRevision: 4, intent };
  const openingDeclaration = { ...declaration, expectedRevision: 0 };
  const resolved = declareV2StandingIntent(initialState, 0, openingDeclaration);
  assert.deepEqual(resolved.postState, { ...initialState, standingIntent: intent });
  assert.equal(resolved.postRevision, 1);
  assert.throws(() => resolveV2CommandSet(initialState, 0, agenda, { cycle: 1, expectedRevision: 0, dispositions: agenda.map((issue) => ({ issueId: issue.id, kind: "delegate" })) }), (error: unknown) => error instanceof V2CommandValidationError && error.code === "v2_missing_standing_intent");
  assert.throws(() => declareV2StandingIntent(resolved.postState, 1, { cycle: 1, expectedRevision: 1, intent }), (error: unknown) => error instanceof V2CommandValidationError && error.code === "v2_invalid_intent_declaration");
  assert.throws(() => declareV2StandingIntent(initialState, 1, { cycle: 1, expectedRevision: 1, intent }), (error: unknown) => error instanceof V2CommandValidationError && error.code === "v2_invalid_intent_declaration");
  assert.throws(() => declareV2StandingIntent(initialState, 0, { ...openingDeclaration, cycle: 2 }), (error: unknown) => error instanceof V2CommandValidationError && error.code === "v2_invalid_intent_declaration");
  const entry = createV2IntentDeclarationLedgerEntry(initialState, 0, { cycle: 1, expectedRevision: 0, intent });
  const root = { id: "v2-save-1", campaignId: "v2-campaign-1", revision: 1, identity, initialState, state: entry.postState, actionLedger: [entry], updatedAt: "2026-09-02T00:00:00.000Z" };
  const session: V2Session = { ...root, initialStateDigest: v2InitialStateDigest(identity, initialState), finalStateDigest: v2FinalSessionDigest(root) };
  assert.deepEqual(validateV2ReplaySkeleton(session, identity), session);
  assert.throws(() => validateV2ReplaySkeleton({ ...session, actionLedger: [{ ...entry, intentDeclaration: { ...entry.intentDeclaration, intent: { ...intent, defaultStyle: "visible-deterrence" } } }] }, identity), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_post_state_mismatch");
  assert.throws(() => validateV2ReplaySkeleton({ ...session, actionLedger: [{ ...entry, postRevision: 2 }] }, identity), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_revision_mismatch");
  assert.throws(() => validateV2ReplaySkeleton({ ...session, initialState: { ...initialState, standingIntent: intent } }, identity), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_transition_invalid");
});
