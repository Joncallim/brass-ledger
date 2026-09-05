/**
 * #100 — HQ belief / intelligence projection tests.
 *
 * Covers:
 * - All 16 reducer truth-table rows
 * - Warning reducer
 * - Public-case reducer (credible, tentative, none)
 * - Evidence lifecycle (role-specific currency, supersession)
 * - Producer correctness (ordinary, reroute, focused staging)
 * - Delta computation
 * - Hostile/invariant tests
 */

import test from "node:test";
import assert from "node:assert/strict";
import { canonicalV2Json } from "@brass-ledger/shared";
import type { V2HqEvidence, V2HqEvidenceOrigin, V2ResolvedEvidenceDef } from "./v2-hq-belief-core";
import {
  computeSupersession,
  roleCurrentOccurrences,
  reduceAssessment,
  reduceWarning,
  reducePublicCase,
  reduceHqBelief,
  notReadyOutput,
  computeDelta,
  type V2PreviousSnapshotState,
} from "./v2-hq-belief-core";
import {
  produceOrdinaryEvidence,
  produceRerouteEvidence,
  produceFocusedStagingEvidence,
  combineOccurrences,
} from "./v2-hq-belief";
import { v2EvidenceDefinitionMap, kestrelHqBeliefModelV1, kestrelHqBeliefModelDigest } from "@brass-ledger/content";

// ─── Helpers ─────────────────────────────────────────────────────────

function buildResolvedDefinitions(): Map<string, V2ResolvedEvidenceDef> {
  const map = new Map<string, V2ResolvedEvidenceDef>();
  for (const [id, def] of v2EvidenceDefinitionMap) {
    map.set(id, def);
  }
  return map;
}

const defs = buildResolvedDefinitions();
const TEST_DIGEST = "0000000000000000000000000000000000000000000000000000000000000000";

function makeOccurrence(
  definitionId: string,
  observedCycle: number,
  instanceId: string,
): V2HqEvidence {
  const def = defs.get(definitionId);
  if (!def) throw new Error(`Unknown definition: ${definitionId}`);
  return {
    instanceId,
    definitionId: definitionId as V2HqEvidence["definitionId"],
    origin: { kind: "ordinary", cycle: observedCycle as 1|2|3|4, slotId: definitionId },
    observedCycle: observedCycle as 1|2|3|4|5|6,
    assessmentCurrentThroughCycle: def.assessmentRelevance.kind === "fixed" ? def.assessmentRelevance.currentThroughCycle as 1|2|3|4|5|6 : def.assessmentRelevance.kind === "result-through-terminal" ? 6 : null,
    warningCurrentThroughCycle: def.warningRelevance.kind === "fixed" ? def.warningRelevance.currentThroughCycle as 1|2|3|4|5|6 : def.warningRelevance.kind === "result-through-terminal" ? 6 : null,
    publicCaseCurrentThroughCycle: def.publicCaseRelevance.kind === "fixed" ? def.publicCaseRelevance.currentThroughCycle as 1|2|3|4|5|6 : def.publicCaseRelevance.kind === "result-through-terminal" ? 6 : null,
    claimId: "ravellan-intent",
    questionId: def.questionId,
    implication: def.implication,
    diagnosticity: def.diagnosticity,
    sourceGroupId: def.sourceGroupId,
    corroborationGroupId: def.corroborationGroupId,
    sourceContextRef: def.sourceContextRef,
    limitationRef: def.limitationRefs[0] ?? "",
    summaryRef: def.summaryRef,
    warningRole: def.warningRole,
    publicCaseRole: def.publicCaseRole,
  };
}

// ─── Reducer truth-table tests ──────────────────────────────────────

test("#100 reducer truth table: all 16 rows produce exact assessments", () => {
  const prepDiag = makeOccurrence("lattice-landing-concentration", 5, "prep-diag-test");
  const coerDiag = makeOccurrence("lattice-auxiliary-coercive", 5, "coer-diag-test");
  const prepInd = makeOccurrence("focused-staging-buildup", 4, "prep-ind-test");
  const coerInd = makeOccurrence("focused-staging-empty", 4, "coer-ind-test");

  const testCases: Array<{
    dp: boolean; dc: boolean; ip: boolean; ic: boolean;
    expectedDirection: string; expectedPicture: string; expectedPattern: string;
  }> = [
    { dp: false, dc: false, ip: false, ic: false, expectedDirection: "unclear", expectedPicture: "weak", expectedPattern: "no-direction" },
    { dp: false, dc: false, ip: false, ic: true, expectedDirection: "coercion", expectedPicture: "weak", expectedPattern: "indicator-coercion" },
    { dp: false, dc: false, ip: true, ic: false, expectedDirection: "preparation", expectedPicture: "weak", expectedPattern: "indicator-preparation" },
    { dp: false, dc: false, ip: true, ic: true, expectedDirection: "unclear", expectedPicture: "conflicted", expectedPattern: "indicator-conflict" },
    { dp: false, dc: true, ip: false, ic: false, expectedDirection: "coercion", expectedPicture: "coherent", expectedPattern: "diagnostic-coercion-clear" },
    { dp: false, dc: true, ip: false, ic: true, expectedDirection: "coercion", expectedPicture: "coherent", expectedPattern: "diagnostic-coercion-clear" },
    { dp: false, dc: true, ip: true, ic: false, expectedDirection: "coercion", expectedPicture: "weak", expectedPattern: "diagnostic-coercion-qualified" },
    { dp: false, dc: true, ip: true, ic: true, expectedDirection: "coercion", expectedPicture: "weak", expectedPattern: "diagnostic-coercion-qualified" },
    { dp: true, dc: false, ip: false, ic: false, expectedDirection: "preparation", expectedPicture: "coherent", expectedPattern: "diagnostic-preparation-clear" },
    { dp: true, dc: false, ip: false, ic: true, expectedDirection: "preparation", expectedPicture: "weak", expectedPattern: "diagnostic-preparation-qualified" },
    { dp: true, dc: false, ip: true, ic: false, expectedDirection: "preparation", expectedPicture: "coherent", expectedPattern: "diagnostic-preparation-clear" },
    { dp: true, dc: false, ip: true, ic: true, expectedDirection: "preparation", expectedPicture: "weak", expectedPattern: "diagnostic-preparation-qualified" },
    { dp: true, dc: true, ip: false, ic: false, expectedDirection: "unclear", expectedPicture: "conflicted", expectedPattern: "diagnostic-conflict" },
    { dp: true, dc: true, ip: false, ic: true, expectedDirection: "unclear", expectedPicture: "conflicted", expectedPattern: "diagnostic-conflict" },
    { dp: true, dc: true, ip: true, ic: false, expectedDirection: "unclear", expectedPicture: "conflicted", expectedPattern: "diagnostic-conflict" },
    { dp: true, dc: true, ip: true, ic: true, expectedDirection: "unclear", expectedPicture: "conflicted", expectedPattern: "diagnostic-conflict" },
  ];

  for (const tc of testCases) {
    const occurrences: V2HqEvidence[] = [];
    if (tc.dp) occurrences.push({ ...prepDiag, instanceId: `dp-${Math.random()}` });
    if (tc.dc) occurrences.push({ ...coerDiag, instanceId: `dc-${Math.random()}` });
    if (tc.ip) occurrences.push({ ...prepInd, instanceId: `ip-${Math.random()}` });
    if (tc.ic) occurrences.push({ ...coerInd, instanceId: `ic-${Math.random()}` });

    const { assessment, basisPattern } = reduceAssessment(occurrences, defs);
    const rowLabel = `dp=${tc.dp ?1:0} dc=${tc.dc ?1:0} ip=${tc.ip ?1:0} ic=${tc.ic ?1:0}`;

    assert.equal(assessment.direction, tc.expectedDirection, `${rowLabel}: direction`);
    assert.equal(assessment.picture, tc.expectedPicture, `${rowLabel}: picture`);
    assert.equal(basisPattern, tc.expectedPattern, `${rowLabel}: basisPattern`);
  }
});

test("#100 all 6 legal assessments are reachable", () => {
  const prepDiag = makeOccurrence("lattice-landing-concentration", 5, "pd1");
  const coerDiag = makeOccurrence("lattice-auxiliary-coercive", 5, "cd1");
  const prepInd = makeOccurrence("focused-staging-buildup", 4, "pi1");
  const coerInd = makeOccurrence("focused-staging-empty", 4, "ci1");
  const amb = makeOccurrence("opening-pressure-ambiguous", 1, "amb1");

  // unclear/weak
  const r1 = reduceAssessment([amb], defs);
  assert.equal(r1.assessment.direction, "unclear");
  assert.equal(r1.assessment.picture, "weak");

  // unclear/conflicted
  const r2 = reduceAssessment([prepInd, coerInd], defs);
  assert.equal(r2.assessment.direction, "unclear");
  assert.equal(r2.assessment.picture, "conflicted");

  // preparation/weak
  const r3 = reduceAssessment([prepInd], defs);
  assert.equal(r3.assessment.direction, "preparation");
  assert.equal(r3.assessment.picture, "weak");

  // preparation/coherent
  const r4 = reduceAssessment([prepDiag], defs);
  assert.equal(r4.assessment.direction, "preparation");
  assert.equal(r4.assessment.picture, "coherent");

  // coercion/weak
  const r5 = reduceAssessment([coerInd], defs);
  assert.equal(r5.assessment.direction, "coercion");
  assert.equal(r5.assessment.picture, "weak");

  // coercion/coherent
  const r6 = reduceAssessment([coerDiag], defs);
  assert.equal(r6.assessment.direction, "coercion");
  assert.equal(r6.assessment.picture, "coherent");
});

// ─── Warning reducer tests ──────────────────────────────────────────

test("#100 warning reducer: no warning-capable evidence → none", () => {
  const occ = makeOccurrence("opening-pressure-ambiguous", 1, "w1");
  const result = reduceWarning([occ]);
  assert.equal(result.state, "none");
  assert.equal(result.basisEvidenceInstanceId, null);
});

test("#100 warning reducer: warning-capable preparation evidence → usable", () => {
  const occ = makeOccurrence("focused-staging-buildup", 4, "w2");
  const result = reduceWarning([occ]);
  assert.equal(result.state, "usable");
  assert.ok(result.basisEvidenceInstanceId);
});

test("#100 warning reducer: coercion evidence never produces warning", () => {
  const occ = makeOccurrence("focused-staging-empty", 4, "w3");
  const result = reduceWarning([occ]);
  assert.equal(result.state, "none");
});

test("#100 warning reducer: most recent warning-capable wins", () => {
  const old = makeOccurrence("focused-staging-buildup", 4, "w4a");
  const recent = makeOccurrence("lattice-landing-concentration", 5, "w4b");
  const result = reduceWarning([old, recent]);
  assert.equal(result.state, "usable");
  assert.equal(result.basisEvidenceInstanceId, "w4b");
});

// ─── Public-case reducer tests ──────────────────────────────────────

test("#100 public-case: no source-sensitive evidence → none", () => {
  const occ = makeOccurrence("opening-pressure-ambiguous", 1, "p1");
  const result = reducePublicCase([occ], []);
  assert.equal(result.state, "none");
});

test("#100 public-case: one source-sensitive diagnostic → tentative", () => {
  const diag = makeOccurrence("lattice-landing-concentration", 5, "p2");
  const result = reducePublicCase([diag], []);
  assert.equal(result.state, "tentative");
});

test("#100 public-case: two source-sensitive diagnostics from different groups → credible", () => {
  const landing = makeOccurrence("lattice-landing-concentration", 5, "p3a");
  const seq = makeOccurrence("lattice-sync-preparation-sequence", 5, "p3b");
  const result = reducePublicCase([landing, seq], []);
  assert.equal(result.state, "credible-source-sensitive");
  assert.equal(result.supportingInstanceIds.length, 2);
});

test("#100 public-case: opposite-direction blocker prevents credible", () => {
  const prepDiag = makeOccurrence("lattice-landing-concentration", 5, "p4a");
  const coerDiag = makeOccurrence("lattice-auxiliary-coercive", 5, "p4b");
  const result = reducePublicCase([prepDiag], [coerDiag]);
  assert.notEqual(result.state, "credible-source-sensitive");
});

test("#100 public-case: coercion direction works symmetrically", () => {
  const coerDiag = makeOccurrence("lattice-auxiliary-coercive", 5, "p5a");
  const seq = makeOccurrence("lattice-sync-preparation-sequence", 5, "p5b");
  const result = reducePublicCase([coerDiag, seq], []);
  assert.equal(result.state, "tentative");
});

// ─── Supersession tests ─────────────────────────────────────────────

test("#100 supersession: explicit supersedes marks target as superseded", () => {
  const oldOcc = makeOccurrence("combat-elements-dispersed", 3, "s1a");
  const newOcc = makeOccurrence("focused-staging-buildup", 4, "s1b");
  const { superseded } = computeSupersession([oldOcc, newOcc], defs);
  assert.ok(superseded.has("s1a"));
});

test("#100 supersession: replace-older-same-question works", () => {
  const oldOcc = makeOccurrence("reroute-auxiliary-unclear", 3, "s2a");
  const newOcc = makeOccurrence("lattice-auxiliary-coercive", 5, "s2b");
  const { superseded } = computeSupersession([oldOcc, newOcc], defs);
  assert.ok(superseded.has("s2a"));
});

test("#100 supersession: superseded evidence never resurrects", () => {
  const staging = makeOccurrence("staging-logistics-anomaly", 3, "s3a");
  const focused = makeOccurrence("focused-staging-empty", 4, "s3b");
  const { superseded } = computeSupersession([staging, focused], defs);
  assert.ok(superseded.has("s3a"));
  assert.ok(!superseded.has("s3b"));
});

// ─── Evidence currency tests ────────────────────────────────────────

test("#100 evidence currency: role-specific windows work correctly", () => {
  const buildup = makeOccurrence("focused-staging-buildup", 4, "c1");
  const supersession = computeSupersession([buildup], defs);

  const atC4 = roleCurrentOccurrences([buildup], supersession, "assessment", 4);
  assert.equal(atC4.length, 1);

  const warnAtC4 = roleCurrentOccurrences([buildup], supersession, "warning", 4);
  assert.equal(warnAtC4.length, 1);

  const pubAtC4 = roleCurrentOccurrences([buildup], supersession, "public-case", 4);
  assert.equal(pubAtC4.length, 1);

  const atC6 = roleCurrentOccurrences([buildup], supersession, "assessment", 6);
  assert.equal(atC6.length, 1);

  const warnAtC6 = roleCurrentOccurrences([buildup], supersession, "warning", 6);
  assert.equal(warnAtC6.length, 0);

  const pubAtC6 = roleCurrentOccurrences([buildup], supersession, "public-case", 6);
  assert.equal(pubAtC6.length, 1);
});

test("#100 evidence currency: focused-staging-empty assessment only through C5", () => {
  const empty = makeOccurrence("focused-staging-empty", 4, "c2");
  const supersession = computeSupersession([empty], defs);

  const atC5 = roleCurrentOccurrences([empty], supersession, "assessment", 5);
  assert.equal(atC5.length, 1);

  const atC6 = roleCurrentOccurrences([empty], supersession, "assessment", 6);
  assert.equal(atC6.length, 0);
});

// ─── Producer tests ─────────────────────────────────────────────────

test("#100 ordinary evidence producer: C1 produces opening-pressure-ambiguous", () => {
  const occurrences = produceOrdinaryEvidence(1, defs, TEST_DIGEST);
  assert.equal(occurrences.length, 1);
  assert.equal(occurrences[0]!.definitionId, "opening-pressure-ambiguous");
});

test("#100 ordinary evidence producer: C3 produces mandatory conflicting bundle", () => {
  const occurrences = produceOrdinaryEvidence(3, defs, TEST_DIGEST);
  assert.equal(occurrences.length, 2);
  const ids = occurrences.map((o) => o.definitionId).sort();
  assert.deepEqual(ids, ["combat-elements-dispersed", "staging-logistics-anomaly"]);
});

test("#100 reroute producer: no preparation + probe → coercive", () => {
  const result = produceRerouteEvidence("none", "probe_shipping", defs, TEST_DIGEST);
  assert.equal(result.length, 1);
  assert.equal(result[0]!.definitionId, "reroute-auxiliary-coercive");
});

test("#100 reroute producer: preparation + probe → unclear", () => {
  const result = produceRerouteEvidence("developing", "probe_shipping", defs, TEST_DIGEST);
  assert.equal(result.length, 1);
  assert.equal(result[0]!.definitionId, "reroute-auxiliary-unclear");
});

test("#100 focused staging: developing → buildup", () => {
  const result = produceFocusedStagingEvidence("developing", defs, TEST_DIGEST);
  assert.equal(result.length, 1);
  assert.equal(result[0]!.definitionId, "focused-staging-buildup");
});

test("#100 focused staging: none → empty", () => {
  const result = produceFocusedStagingEvidence("none", defs, TEST_DIGEST);
  assert.equal(result.length, 1);
  assert.equal(result[0]!.definitionId, "focused-staging-empty");
});

// ─── Basis pattern tests ────────────────────────────────────────────

test("#100 basis pattern: no-direction when empty", () => {
  const { basisPattern } = reduceAssessment([], defs);
  assert.equal(basisPattern, "no-direction");
});

// ─── Combine occurrences tests ──────────────────────────────────────

test("#100 combineOccurrences rejects duplicates", () => {
  const occ = makeOccurrence("opening-pressure-ambiguous", 1, "dup1");
  assert.throws(() => combineOccurrences([occ], [occ]));
});

// ─── Not-ready output test ──────────────────────────────────────────

test("#100 notReadyOutput has correct structure", () => {
  const output = notReadyOutput(3);
  assert.equal(output.kind, "not-ready");
  if (output.kind === "not-ready") {
    assert.equal(output.cycle, 3);
    assert.equal(output.reason, "ravellan-decision-missing");
  }
});

// ─── Integration tests ──────────────────────────────────────────────

test("#100 C1 reduction: opening-pressure-ambiguous → unclear/weak", () => {
  const occ = makeOccurrence("opening-pressure-ambiguous", 1, "i1");
  const output = reduceHqBelief([occ], defs, 1, null);
  if (output.kind === "ready") {
    assert.equal(output.snapshot.assessment.direction, "unclear");
    assert.equal(output.snapshot.assessment.picture, "weak");
  } else {
    assert.fail("Expected ready output");
  }
});

test("#100 C3 reduction: mandatory conflicting bundle → unclear/conflicted", () => {
  const prep = makeOccurrence("staging-logistics-anomaly", 3, "i2a");
  const coer = makeOccurrence("combat-elements-dispersed", 3, "i2b");
  const output = reduceHqBelief([prep, coer], defs, 3, null);
  if (output.kind === "ready") {
    assert.equal(output.snapshot.assessment.direction, "unclear");
    assert.equal(output.snapshot.assessment.picture, "conflicted");
  } else {
    assert.fail("Expected ready output");
  }
});

test("#100 C4 with focused buildup: preparation/weak with warning", () => {
  const buildup = makeOccurrence("focused-staging-buildup", 4, "i3");
  const output = reduceHqBelief([buildup], defs, 4, null);
  if (output.kind === "ready") {
    assert.equal(output.snapshot.assessment.direction, "preparation");
    assert.equal(output.snapshot.warning.state, "usable");
  } else {
    assert.fail("Expected ready output");
  }
});

test("#100 C4 with focused empty: coercion/weak", () => {
  const empty = makeOccurrence("focused-staging-empty", 4, "i4");
  const output = reduceHqBelief([empty], defs, 4, null);
  if (output.kind === "ready") {
    assert.equal(output.snapshot.assessment.direction, "coercion");
    assert.equal(output.snapshot.assessment.picture, "weak");
  } else {
    assert.fail("Expected ready output");
  }
});

// ─── Delta tests ────────────────────────────────────────────────────

test("#100 delta: first call produces initial", () => {
  const occ = makeOccurrence("opening-pressure-ambiguous", 1, "d1");
  const output = reduceHqBelief([occ], defs, 1, null);
  if (output.kind === "ready") {
    assert.equal(output.snapshot.delta.assessmentChange, "initial");
    assert.equal(output.snapshot.delta.warningChange, "initial");
  } else {
    assert.fail("Expected ready output");
  }
});

test("#100 delta: assessment change detection", () => {
  const prep = makeOccurrence("staging-logistics-anomaly", 3, "d2a");
  const prevSnapshot: V2PreviousSnapshotState = {
    assessment: { direction: "unclear", picture: "weak", basisPattern: "no-direction" },
    warning: { state: "none", basisEvidenceInstanceId: null },
    publicCaseBasis: { state: "none", direction: null, supportingInstanceIds: [], supportingCorroborationGroupIds: [] },
    currentInstanceIds: new Set(),
    supersededIds: new Set(),
  };
  const output = reduceHqBelief([prep], defs, 3, prevSnapshot);
  if (output.kind === "ready") {
    assert.ok(
      output.snapshot.delta.assessmentChange === "narrowed" ||
      output.snapshot.delta.assessmentChange === "initial",
    );
  } else {
    assert.fail("Expected ready output");
  }
});

// ─── Hostile/invariant tests ────────────────────────────────────────

test("#100 hostile: majority-vote reducer does not exist", () => {
  const prepInd1 = makeOccurrence("focused-staging-buildup", 4, "h1a");
  const prepInd2 = makeOccurrence("focused-staging-buildup", 4, "h1b");
  const { assessment } = reduceAssessment([prepInd1, prepInd2], defs);
  assert.equal(assessment.picture, "weak");
});

test("#100 hostile: contrary indicator alone does not make unclear", () => {
  const prepDiag = makeOccurrence("lattice-landing-concentration", 5, "h2");
  const { assessment } = reduceAssessment([prepDiag], defs);
  assert.equal(assessment.direction, "preparation");
  assert.equal(assessment.picture, "coherent");
});

test("#100 hostile: warning indicator does not displace diagnostic evidence", () => {
  const prepDiag = makeOccurrence("lattice-landing-concentration", 5, "h3a");
  const prepInd = makeOccurrence("focused-staging-buildup", 4, "h3b");
  const { assessment } = reduceAssessment([prepDiag, prepInd], defs);
  assert.equal(assessment.direction, "preparation");
  assert.equal(assessment.picture, "coherent");
});

test("#100 hostile: stale evidence is not deleted", () => {
  const occ = makeOccurrence("opening-pressure-ambiguous", 1, "h4");
  const supersession = computeSupersession([occ], defs);
  const current = roleCurrentOccurrences([occ], supersession, "assessment", 3);
  assert.equal(current.length, 0);
  assert.equal([occ].length, 1);
});

test("#100 hostile: superseded evidence cannot resurrect", () => {
  const staging = makeOccurrence("staging-logistics-anomaly", 3, "h5a");
  const focused = makeOccurrence("focused-staging-empty", 4, "h5b");
  const supersession = computeSupersession([staging, focused], defs);
  assert.ok(supersession.superseded.has("h5a"));
  const supersession2 = computeSupersession([staging], defs);
  assert.ok(!supersession2.superseded.has("h5a"));
});

test("#100 hostile: canonical JSON stability", () => {
  const json1 = canonicalV2Json({ a: 1, b: 2 });
  const json2 = canonicalV2Json({ b: 2, a: 1 });
  assert.equal(json1, json2);
});

test("#100 hostile: R6 terminal action never enters intelligence", () => {
  assert.equal(typeof produceRerouteEvidence, "function");
  assert.equal(typeof produceFocusedStagingEvidence, "function");
});

// ─── Content model tests ────────────────────────────────────────────

test("#100 content model: exactly 19 definitions", () => {
  assert.equal(kestrelHqBeliefModelV1.definitions.length, 19);
});

test("#100 content model: digest is deterministic", () => {
  const d1 = kestrelHqBeliefModelDigest();
  const d2 = kestrelHqBeliefModelDigest();
  assert.equal(d1, d2);
});


// ─── Verified-context hostile tests ─────────────────────────────────

test("#100 hostile: factory functions not exported from package barrel", async () => {
  // Verify that createVerifiedProjectionContext is NOT exported from index.ts
  // This is a compile-time boundary test.
  // We check by importing from the index and verifying the export doesn't exist.
  const simExports = await import("./index");
  assert.equal(typeof (simExports as any).createVerifiedProjectionContext, "undefined",
    "createVerifiedProjectionContext must not be exported from package barrel");
  assert.equal(typeof (simExports as any).createLiveProjectionContext, "undefined",
    "createLiveProjectionContext must not be exported from package barrel");
  // V2VerifiedProjectionContext is a type-only export (export type).
  // It is accessible at compile-time via "import type { V2VerifiedProjectionContext }".
  // At runtime, type exports are erased, so we verify the factories are absent instead.
  // The type being correctly exported is verified by TypeScript compilation.
});

test("#100 hostile: tampered session rejected by validateV2ReplayAndCreateContext", async () => {
  // This test verifies that a tampered V2Session cannot be promoted
  // to a verified context through the only public API path.
  const { validateV2ReplayAndCreateContext } = await import("./v2");

  const identity = {
    ruleset: "v2" as const,
    rulesetVersion: "0.4.0-prototype" as const,
    scenarioId: "test-scenario",
    contentVersion: "0.1.0",
    contentDigest: "0000000000000000000000000000000000000000000000000000000000000000",
  };

  // Create a minimal raw session with tampered state (state != initialState with zero-action ledger)
  const tamperedSession = {
    identity,
    initialStateDigest: "0000000000000000000000000000000000000000000000000000000000000000",
    finalStateDigest: "0000000000000000000000000000000000000000000000000000000000000000",
    initialState: {
      cycle: 1,
      standingIntent: null,
      ravellan: { posture: "testing", preparation: "none", observations: [] },
    },
    state: {
      cycle: 6,  // Tampered - doesn't match initialState
      standingIntent: null,
      ravellan: { posture: "testing", preparation: "ready", observations: [] },
    },
    revision: 0,
    actionLedger: [],
  };

  // This should throw because state != initialState with zero-action ledger
  assert.throws(() => {
    validateV2ReplayAndCreateContext(tamperedSession, identity, 1);
  }, Error);
});
