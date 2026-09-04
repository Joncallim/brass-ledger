import test from "node:test";
import assert from "node:assert/strict";
import { v2CurrentRulesetVersion, type V2AgendaIssue, type V2Identity, type V2Session } from "@brass-ledger/shared";
import {
  createV2CommandSetLedgerEntry,
  createV2IntentDeclarationLedgerEntry,
  createV2RavellanDecisionLedgerEntry,
  V2CommandValidationError,
  V2ReplayValidationError,
  canonicalV2Json,
  v2FinalSessionDigest,
  v2InitialStateDigest,
  v2StateHash,
  v2Sha256,
  resolveV2CommandSet,
  declareV2StandingIntent,
  activeV2RavellanObservations,
  chooseV2RavellanAction,
  initializeV2RavellanState,
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
const ravellan = { posture: "genuine_preparation", preparation: "developing", observations: [] } as const;

function validSession(): V2Session {
  const initialState = { cycle: 1, seed: "kestrel-seed", ravellan, standingIntent: null } as const;
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
  return { cycle: 1, seed: "kestrel-seed", ravellan, standingIntent: intent } as const;
}

test("V2 canonical SHA-256 has stable hard-coded vectors", () => {
  assert.equal(canonicalV2Json({ b: 2, a: 1 }), '{"a":1,"b":2}');
  assert.equal(v2Sha256({ b: 2, a: 1 }), "43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777");
  assert.equal(canonicalV2Json({ é: 4, z: 1, ä: 3, Å: 2 }), '{"z":1,"Å":2,"ä":3,"é":4}');
  assert.equal(v2Sha256({ é: 4, z: 1, ä: 3, Å: 2 }), "997c7e2cf5d27456c0e6bfb9006a736c2f156f753e419c06ee6f61d7872d8190");
  const session = validSession();
  assert.equal(session.initialStateDigest, "40869a49312da88065b6613238a2aac725d199fe8b7bc8ac6efbc48e91f5fb73");
  assert.equal(session.finalStateDigest, "48f8b6cf87180e9fa972c22ffe7a1f022904f1bb143f4f2ac42b9d4f6e2f20ad");
});

test("V2 digest evidence changes for every identity field", () => {
  const state = { cycle: 1, seed: "kestrel-seed", ravellan };
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
    [{ ...session, state: { cycle: 1, seed: "other", ravellan, standingIntent: null } }, identity, "v2_state_changed_without_ledger"],
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
  assert.deepEqual(resolved.postState, { cycle: 2, seed: "kestrel-seed", ravellan, standingIntent: intent });
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
  const initialState = { cycle: 1, seed: "kestrel-seed", ravellan, standingIntent: null } as const;
  const declaration = createV2IntentDeclarationLedgerEntry(initialState, 0, { cycle: 1, expectedRevision: 0, intent });
  const ravellanEntry = createV2RavellanDecisionLedgerEntry(declaration.postState, 1);
  const entry = createV2CommandSetLedgerEntry(ravellanEntry.postState, 2, agenda, {
    cycle: 1, expectedRevision: 2,
    dispositions: [{ issueId: "lattice", kind: "intervene", orderId: "protect" }, { issueId: "watch", kind: "delegate" }, { issueId: "consult", kind: "defer" }],
  });
  assert.deepEqual(entry.commandSet.dispositions.map((disposition) => disposition.issueId), ["watch", "consult", "lattice"]);
  const root = { id: "v2-save-1", campaignId: "v2-campaign-1", revision: 3, identity, initialState, state: entry.postState, actionLedger: [declaration, ravellanEntry, entry], updatedAt: "2026-09-02T00:00:00.000Z" };
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
  assert.throws(() => validateV2ReplaySkeleton({ ...session, actionLedger: [declaration, ravellanEntry, { ...entry, finalOrders: [{ ...entry.finalOrders[0]!, orderId: "reinforce" }, ...entry.finalOrders.slice(1)] }] }, identity, agendaProvider), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_post_state_mismatch");
  assert.throws(() => validateV2ReplaySkeleton({ ...session, actionLedger: [declaration, { ...ravellanEntry, preStateHash: "0".repeat(64) }, entry] }, identity, agendaProvider), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_hash_mismatch");
  assert.throws(() => validateV2ReplaySkeleton({ ...session, actionLedger: [declaration, ravellanEntry, { ...entry, interventionCost: 0 }] }, identity, agendaProvider), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_post_state_mismatch");
  assert.throws(() => validateV2ReplaySkeleton({ ...session, actionLedger: [declaration, ravellanEntry, { ...entry, commandSet: { ...entry.commandSet, dispositions: [...entry.commandSet.dispositions].reverse() } }] }, identity, agendaProvider), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_transition_invalid");
});

test("opening intent declaration is the sole non-advancing prerequisite for commands and replays without an agenda", () => {
  const initialState = { cycle: 1, seed: "kestrel-seed", ravellan, standingIntent: null } as const;
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

const observation = (signal: "beacon_coverage_signal" | "visible_denial_signal" | "coalition_unity_signal" | "reserve_exhaustion_signal" | "ravellan_discovery_signal", value: "weak" | "credible" | "withheld" | "demonstrated" | "fractured" | "coherent" | "suspected", observedCycle = 1) => ({ signal, value, observedCycle, source: "authored-public-signal" }) as never;
const policy = (posture: "genuine_preparation" | "coercive_feint" | "testing", preparation: "none" | "developing" | "ready", cycle: number, activeObservations: readonly ReturnType<typeof observation>[] = []) => chooseV2RavellanAction({ cycle, posture, preparation, activeObservations });

test("#99 evaluates every GP, CF, and T row with exact preparation and cycle-two skip semantics", () => {
  assert.deepEqual(policy("genuine_preparation", "developing", 1), { action: "probe_shipping", matchedPolicyRowId: "C1", nextPosture: "genuine_preparation", nextPreparation: "developing" });
  // GP-1 illegal in cycle 2 skips its transition and falls through to GP-3.
  assert.equal(policy("genuine_preparation", "developing", 2, [observation("ravellan_discovery_signal", "suspected"), observation("beacon_coverage_signal", "credible"), observation("coalition_unity_signal", "coherent")]).action, "seed_deception");
  assert.deepEqual(policy("genuine_preparation", "developing", 3, [observation("ravellan_discovery_signal", "suspected"), observation("beacon_coverage_signal", "credible"), observation("coalition_unity_signal", "coherent")]), { action: "pause_consolidate", matchedPolicyRowId: "GP-1", nextPosture: "coercive_feint", nextPreparation: "developing" });
  assert.equal(policy("genuine_preparation", "none", 3, [observation("beacon_coverage_signal", "weak")]).action, "prepare_beacon_seizure"); // GP-2
  assert.equal(policy("genuine_preparation", "none", 3, [observation("ravellan_discovery_signal", "suspected")]).action, "seed_deception"); // GP-3
  assert.equal(policy("genuine_preparation", "none", 3, [observation("coalition_unity_signal", "fractured")]).action, "probe_shipping"); // GP-4
  assert.equal(policy("genuine_preparation", "none", 3).action, "prepare_beacon_seizure"); // GP-5
  const cf1 = [observation("beacon_coverage_signal", "weak"), observation("visible_denial_signal", "withheld"), observation("coalition_unity_signal", "fractured"), observation("reserve_exhaustion_signal", "suspected")];
  assert.deepEqual(policy("coercive_feint", "none", 3, cf1), { action: "prepare_beacon_seizure", matchedPolicyRowId: "CF-1", nextPosture: "genuine_preparation", nextPreparation: "developing" }); // CF-1 beats CF-2/3
  assert.equal(policy("coercive_feint", "none", 3, [observation("reserve_exhaustion_signal", "suspected")]).action, "probe_shipping"); // CF-2
  assert.deepEqual(policy("coercive_feint", "none", 3, [observation("coalition_unity_signal", "fractured")]), { action: "seed_deception", matchedPolicyRowId: "CF-3", nextPosture: "coercive_feint", nextPreparation: "none" }); // CF-3
  assert.equal(policy("coercive_feint", "none", 2, [observation("visible_denial_signal", "demonstrated")]).action, "probe_shipping"); // illegal CF-4 skips entire row
  assert.equal(policy("coercive_feint", "none", 3, [observation("visible_denial_signal", "demonstrated")]).action, "pause_consolidate"); // CF-4
  assert.equal(policy("coercive_feint", "none", 3).action, "probe_shipping"); // CF-5
  assert.deepEqual(policy("testing", "none", 3, [observation("beacon_coverage_signal", "weak"), observation("coalition_unity_signal", "fractured")]), { action: "prepare_beacon_seizure", matchedPolicyRowId: "T-1", nextPosture: "genuine_preparation", nextPreparation: "developing" }); // T-1
  assert.equal(policy("testing", "none", 2, [observation("beacon_coverage_signal", "credible"), observation("coalition_unity_signal", "coherent")]).action, "probe_shipping"); // illegal T-2 cannot transition
  assert.deepEqual(policy("testing", "none", 3, [observation("beacon_coverage_signal", "credible"), observation("coalition_unity_signal", "coherent")]), { action: "pause_consolidate", matchedPolicyRowId: "T-2", nextPosture: "coercive_feint", nextPreparation: "none" }); // T-2
  assert.equal(policy("testing", "none", 3, [observation("reserve_exhaustion_signal", "suspected")]).action, "probe_shipping"); // T-3
  assert.equal(policy("testing", "none", 3, [observation("ravellan_discovery_signal", "suspected")]).action, "seed_deception"); // T-4
  assert.equal(policy("testing", "none", 3).action, "probe_shipping"); // T-5
});

test("#99 observations are public, delayed, expiring, replaceable, and terminal policy is exhaustive", () => {
  const weak = observation("beacon_coverage_signal", "weak", 1);
  assert.deepEqual(activeV2RavellanObservations([weak], 1), []);
  assert.equal(activeV2RavellanObservations([weak], 2)[0]?.value, "weak");
  assert.equal(activeV2RavellanObservations([weak], 3)[0]?.value, "weak");
  assert.deepEqual(activeV2RavellanObservations([weak], 4), []);
  assert.equal(activeV2RavellanObservations([weak, observation("beacon_coverage_signal", "credible", 2)], 3)[0]?.value, "credible");
  assert.throws(() => activeV2RavellanObservations([weak, observation("beacon_coverage_signal", "credible", 1)], 2), /Contradictory/);
  assert.equal(activeV2RavellanObservations([observation("visible_denial_signal", "withheld", 1)], 3).length, 0);
  assert.equal(policy("genuine_preparation", "ready", 6).action, "attempt_seizure"); // R6-1
  assert.equal(policy("genuine_preparation", "ready", 6, [observation("ravellan_discovery_signal", "suspected"), observation("beacon_coverage_signal", "credible"), observation("coalition_unity_signal", "coherent")]).action, "threshold_challenge");
  assert.equal(policy("genuine_preparation", "developing", 6).action, "threshold_challenge"); // R6-2
  assert.equal(policy("coercive_feint", "none", 6).action, "threshold_challenge"); // R6-3
  assert.equal(policy("testing", "none", 6, [weak]).action, "threshold_challenge"); // R6-4
  assert.equal(policy("testing", "none", 6).action, "abort_and_pressure"); // R6-5
});

test("#99 initialization is seed-only and normal decisions cannot vary with seed or private state", () => {
  const openings = new Set<string>();
  for (let index = 0; index < 100; index += 1) openings.add(initializeV2RavellanState({ rulesetId: "v2", scenarioId: "kestrel-strait", campaignSeed: `seed-${index}` }).posture);
  assert.deepEqual([...openings].sort(), ["coercive_feint", "genuine_preparation", "testing"]);
  const initial = initializeV2RavellanState({ rulesetId: "v2", scenarioId: "kestrel-strait", campaignSeed: "same" });
  assert.equal(initial.preparation, initial.posture === "genuine_preparation" ? "developing" : "none");
  const decision = policy("coercive_feint", "none", 3, [observation("reserve_exhaustion_signal", "suspected")]);
  assert.deepEqual(decision, policy("coercive_feint", "none", 3, [observation("reserve_exhaustion_signal", "suspected")]));
});

test("#99 Ravellan system ledger re-executes policy, lifecycle, hashes, and canonical ordering", () => {
  const state = {
    cycle: 3,
    seed: "kestrel-seed",
    standingIntent: intent,
    ravellan: {
      posture: "coercive_feint" as const,
      preparation: "none" as const,
      observations: [
        observation("beacon_coverage_signal", "weak", 2),
        observation("visible_denial_signal", "withheld", 2),
        observation("coalition_unity_signal", "fractured", 2),
      ],
    },
  };
  const entry = createV2RavellanDecisionLedgerEntry(state, 5);
  assert.deepEqual(entry.decision, { action: "prepare_beacon_seizure", matchedPolicyRowId: "CF-1", nextPosture: "genuine_preparation", nextPreparation: "developing" });
  assert.deepEqual(entry.postState.ravellan, {
    posture: "genuine_preparation", preparation: "developing",
    observations: [...state.ravellan.observations].sort((left, right) => left.signal < right.signal ? -1 : left.signal > right.signal ? 1 : 0),
  });
  assert.equal(entry.postRevision, 6);

  // Build a valid opening prefix, then prove imported system evidence is only
  // evidence: replay recomputes it rather than applying it.
  const initialState = { cycle: 1, seed: "kestrel-seed", ravellan, standingIntent: null } as const;
  const declaration = createV2IntentDeclarationLedgerEntry(initialState, 0, { cycle: 1, expectedRevision: 0, intent });
  const openingDecision = createV2RavellanDecisionLedgerEntry(declaration.postState, 1);
  const root = { id: "v2-save-1", campaignId: "v2-campaign-1", revision: 2, identity, initialState, state: openingDecision.postState, actionLedger: [declaration, openingDecision], updatedAt: "2026-09-02T00:00:00.000Z" };
  const session: V2Session = { ...root, initialStateDigest: v2InitialStateDigest(identity, initialState), finalStateDigest: v2FinalSessionDigest(root) };
  assert.deepEqual(validateV2ReplaySkeleton(session, identity), session);
  const reject = (candidate: unknown) => assert.throws(() => validateV2ReplaySkeleton(candidate, identity), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_post_state_mismatch");
  const alteredPost = (postState: typeof openingDecision.postState) => ({ ...openingDecision, postState, postStateHash: v2StateHash(postState) });
  reject({ ...session, actionLedger: [declaration, { ...openingDecision, decision: { ...openingDecision.decision, action: "seed_deception" } }] });
  reject({ ...session, actionLedger: [declaration, { ...openingDecision, decision: { ...openingDecision.decision, matchedPolicyRowId: "GP-3" } }] });
  reject({ ...session, actionLedger: [declaration, alteredPost({ ...openingDecision.postState, ravellan: { ...openingDecision.postState.ravellan, posture: "testing" } })] });
  reject({ ...session, actionLedger: [declaration, alteredPost({ ...openingDecision.postState, ravellan: { ...openingDecision.postState.ravellan, preparation: "ready" } })] });
  reject({ ...session, actionLedger: [declaration, alteredPost({ ...openingDecision.postState, ravellan: { ...openingDecision.postState.ravellan, observations: [observation("beacon_coverage_signal", "weak", 1)] } })] });
  assert.throws(() => validateV2ReplaySkeleton({ ...session, actionLedger: [declaration, openingDecision, openingDecision] }, identity), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_revision_mismatch");
  assert.throws(() => validateV2ReplaySkeleton({ ...session, actionLedger: [declaration] }, identity), (error: unknown) => error instanceof V2ReplayValidationError && error.code === "v2_ledger_revision_mismatch");
});
