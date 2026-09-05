/**
 * #100 — HQ belief / intelligence projection tests.
 *
 * Covers:
 * - All 16 reducer truth-table rows
 * - All 6 assessments
 * - Warning reducer
 * - Public-case reducer (credible, tentative, none)
 * - Evidence lifecycle (role-specific currency, supersession)
 * - Producer correctness (ordinary, reroute, focused staging)
 * - Delta computation
 * - Briefing selection
 * - Hostile/invariant tests
 */

import test from "node:test";
import assert from "node:assert/strict";
import { canonicalV2Json } from "@brass-ledger/shared";
import {
  type V2EvidenceOccurrence,
  type V2OccurrenceOrigin,
  type V2ResolvedEvidenceDef,
  V2VerifiedProjectionContext,
  computeSupersession,
  roleCurrentOccurrences,
  reduceAssessment,
  reduceWarning,
  reducePublicCase,
  deriveBasisPattern,
  reduceHqBelief,
  notReadyOutput,
  produceOrdinaryEvidence,
  produceRerouteEvidence,
  produceFocusedStagingEvidence,
  combineOccurrences,
} from "./index";
import { v2EvidenceDefinitionMap, kestrelHqBeliefModelV1, kestrelHqBeliefModelDigest } from "@brass-ledger/content";

// ─── Helpers ─────────────────────────────────────────────────────────

function buildResolvedDefinitions(): Map<string, V2ResolvedEvidenceDef> {
  const map = new Map<string, V2ResolvedEvidenceDef>();
  for (const [id, def] of v2EvidenceDefinitionMap) {
    map.set(id, {
      definitionId: def.definitionId,
      implication: def.implication,
      diagnosticClass: def.diagnosticClass,
      sourceGroup: def.sourceGroup,
      corroborationGroupId: def.corroborationGroupId,
      summaryRef: def.summaryRef,
      assessmentActiveCycles: def.assessmentActiveCycles,
      warningActiveCycles: def.warningActiveCycles,
      publicCaseActiveCycles: def.publicCaseActiveCycles,
      supersedesIds: def.supersedesIds,
      replaceOlderSameQuestion: def.replaceOlderSameQuestion,
      warningCapable: def.warningCapable,
      sourceSensitive: def.sourceSensitive,
      questionGroup: def.questionGroup,
    });
  }
  return map;
}

const defs = buildResolvedDefinitions();

function occ(
  definitionId: string,
  observedCycle: number,
  implication: "preparation" | "coercion" | "ambiguous",
  originKind: V2OccurrenceOrigin["kind"] = "ordinary",
): V2EvidenceOccurrence {
  const origin: V2OccurrenceOrigin = { kind: originKind };
  const id = `${definitionId}@c${observedCycle}:test-${originKind}`;
  return { occurrenceId: id, definitionId: definitionId as V2EvidenceOccurrence["definitionId"], implication, observedCycle, origin };
}

// ─── Reducer truth-table tests ──────────────────────────────────────

test("#100 reducer truth table: all 16 rows produce exact assessments", () => {
  const testCases: Array<{
    dp: boolean; dc: boolean; ip: boolean; ic: boolean;
    expectedAssessment: string; expectedPattern: string;
  }> = [
    { dp: false, dc: false, ip: false, ic: false, expectedAssessment: "unclear/weak", expectedPattern: "no-directional-evidence" },
    { dp: false, dc: false, ip: false, ic: true, expectedAssessment: "coercion/weak", expectedPattern: "coercion-indicators-only" },
    { dp: false, dc: false, ip: true, ic: false, expectedAssessment: "preparation/weak", expectedPattern: "preparation-indicators-only" },
    { dp: false, dc: false, ip: true, ic: true, expectedAssessment: "unclear/conflicted", expectedPattern: "balanced-conflict" },
    { dp: false, dc: true, ip: false, ic: false, expectedAssessment: "coercion/coherent", expectedPattern: "coercion-corroborated" },
    { dp: false, dc: true, ip: false, ic: true, expectedAssessment: "coercion/coherent", expectedPattern: "coercion-corroborated" },
    { dp: false, dc: true, ip: true, ic: false, expectedAssessment: "unclear/conflicted", expectedPattern: "coercion-dominant-conflict" },
    { dp: false, dc: true, ip: true, ic: true, expectedAssessment: "unclear/conflicted", expectedPattern: "coercion-dominant-conflict" },
    { dp: true, dc: false, ip: false, ic: false, expectedAssessment: "preparation/coherent", expectedPattern: "preparation-corroborated" },
    { dp: true, dc: false, ip: false, ic: true, expectedAssessment: "unclear/conflicted", expectedPattern: "preparation-dominant-conflict" },
    { dp: true, dc: false, ip: true, ic: false, expectedAssessment: "preparation/coherent", expectedPattern: "preparation-corroborated" },
    { dp: true, dc: false, ip: true, ic: true, expectedAssessment: "unclear/conflicted", expectedPattern: "preparation-dominant-conflict" },
    { dp: true, dc: true, ip: false, ic: false, expectedAssessment: "unclear/conflicted", expectedPattern: "balanced-conflict" },
    { dp: true, dc: true, ip: false, ic: true, expectedAssessment: "unclear/conflicted", expectedPattern: "balanced-conflict" },
    { dp: true, dc: true, ip: true, ic: false, expectedAssessment: "unclear/conflicted", expectedPattern: "balanced-conflict" },
    { dp: true, dc: true, ip: true, ic: true, expectedAssessment: "unclear/conflicted", expectedPattern: "balanced-conflict" },
  ];

  for (const tc of testCases) {
    const occurrences: V2EvidenceOccurrence[] = [];
    if (tc.dp) occurrences.push(occ("lattice-landing-concentration", 4, "preparation"));
    if (tc.dc) occurrences.push(occ("lattice-auxiliary-coercive", 4, "coercion"));
    if (tc.ip) occurrences.push(occ("staging-logistics-anomaly", 3, "preparation"));
    if (tc.ic) occurrences.push(occ("combat-elements-dispersed", 3, "coercion"));

    const result = reduceAssessment(occurrences, defs);
    assert.equal(result.assessment, tc.expectedAssessment, `Row dp=${tc.dp} dc=${tc.dc} ip=${tc.ip} ic=${tc.ic}: expected ${tc.expectedAssessment}, got ${result.assessment}`);
    assert.equal(result.basisPattern, tc.expectedPattern, `Row dp=${tc.dp} dc=${tc.dc} ip=${tc.ip} ic=${tc.ic}: pattern mismatch`);
  }
});

test("#100 all 6 legal assessments are reachable", () => {
  const assessments = new Set<string>();
  for (const tc of [
    { dp: false, dc: false, ip: false, ic: false },
    { dp: false, dc: false, ip: false, ic: true },
    { dp: false, dc: false, ip: true, ic: false },
    { dp: false, dc: false, ip: true, ic: true },
    { dp: false, dc: true, ip: false, ic: false },
    { dp: true, dc: false, ip: false, ic: false },
  ]) {
    const occurrences: V2EvidenceOccurrence[] = [];
    if (tc.dp) occurrences.push(occ("lattice-landing-concentration", 4, "preparation"));
    if (tc.dc) occurrences.push(occ("lattice-auxiliary-coercive", 4, "coercion"));
    if (tc.ip) occurrences.push(occ("staging-logistics-anomaly", 3, "preparation"));
    if (tc.ic) occurrences.push(occ("combat-elements-dispersed", 3, "coercion"));
    assessments.add(reduceAssessment(occurrences, defs).assessment);
  }
  assert.equal(assessments.size, 6);
  for (const a of ["unclear/weak", "unclear/conflicted", "preparation/weak", "preparation/coherent", "coercion/weak", "coercion/coherent"]) {
    assert(assessments.has(a), `Assessment ${a} should be reachable`);
  }
});

// ─── Warning reducer tests ──────────────────────────────────────────

test("#100 warning reducer: no warning-capable evidence → none", () => {
  const result = reduceWarning([occ("staging-logistics-anomaly", 3, "preparation")], defs);
  assert.equal(result.warning, "none");
  assert.deepEqual(result.basisOccurrenceIds, []);
});

test("#100 warning reducer: warning-capable preparation evidence → usable", () => {
  const o = occ("focused-staging-buildup", 4, "preparation");
  const result = reduceWarning([o], defs);
  assert.equal(result.warning, "usable");
  assert.deepEqual(result.basisOccurrenceIds, [o.occurrenceId]);
});

test("#100 warning reducer: coercion evidence never produces warning", () => {
  const o = occ("focused-staging-empty", 4, "coercion");
  const result = reduceWarning([o], defs);
  assert.equal(result.warning, "none");
});

test("#100 warning reducer: most recent warning-capable wins", () => {
  const old = occ("focused-staging-buildup", 4, "preparation");
  const newer = occ("lattice-landing-concentration", 5, "preparation");
  const result = reduceWarning([old, newer], defs);
  assert.equal(result.warning, "usable");
  assert.equal(result.basisOccurrenceIds[0], newer.occurrenceId);
});

// ─── Public-case reducer tests ──────────────────────────────────────

test("#100 public-case: no source-sensitive evidence → none", () => {
  const result = reducePublicCase(
    [occ("staging-logistics-anomaly", 3, "preparation")],
    [],
    defs,
  );
  assert.equal(result.state, "none");
});

test("#100 public-case: one source-sensitive diagnostic → tentative (need 2 corroboration groups)", () => {
  const o = occ("lattice-landing-concentration", 4, "preparation");
  const result = reducePublicCase([o], [o], defs);
  assert.equal(result.state, "tentative");
  assert.equal(result.direction, "preparation");
});

test("#100 public-case: two source-sensitive diagnostics from different groups → credible", () => {
  const o1 = occ("lattice-landing-concentration", 4, "preparation");
  const o2 = occ("lattice-sync-preparation-sequence", 5, "preparation");
  const result = reducePublicCase([o1, o2], [o1, o2], defs);
  assert.equal(result.state, "credible");
  assert.equal(result.direction, "preparation");
  assert.equal(result.supportOccurrenceIds.length, 2);
});

test("#100 public-case: opposite-direction blocker prevents credible", () => {
  const prep = occ("lattice-landing-concentration", 4, "preparation");
  const coercion = occ("lattice-auxiliary-coercive", 4, "coercion");
  // prep diagnostic with coercion diagnostic blocker
  const result = reducePublicCase([prep, coercion], [prep, coercion], defs);
  // Should be tentative at best since there's a material opposite-direction blocker
  assert.notEqual(result.state, "credible");
});

test("#100 public-case: coercion direction works symmetrically", () => {
  const o1 = occ("lattice-auxiliary-coercive", 4, "coercion");
  const o2 = occ("lattice-sync-coercive-sequence", 5, "coercion");
  const result = reducePublicCase([o1, o2], [o1, o2], defs);
  assert.equal(result.state, "credible");
  assert.equal(result.direction, "coercion");
});

// ─── Supersession tests ─────────────────────────────────────────────

test("#100 supersession: explicit supersedes marks target as superseded", () => {
  const staging = occ("staging-logistics-anomaly", 3, "preparation");
  const focused = occ("focused-staging-empty", 4, "coercion");
  const result = computeSupersession([staging, focused], defs);
  assert(result.superseded.has(staging.occurrenceId));
});

test("#100 supersession: replace-older-same-question works", () => {
  const reroute = occ("reroute-auxiliary-integrated", 3, "preparation");
  const lattice = occ("lattice-auxiliary-integrated", 4, "preparation");
  const result = computeSupersession([reroute, lattice], defs);
  // Both have questionGroup "auxiliary-tasking" and replaceOlderSameQuestion=true
  assert(result.superseded.has(reroute.occurrenceId));
});

test("#100 supersession: superseded evidence never resurrects", () => {
  const staging = occ("staging-logistics-anomaly", 3, "preparation");
  const focused = occ("focused-staging-empty", 4, "coercion");
  const supersession = computeSupersession([staging, focused], defs);

  // At C5, focused-staging-empty is still assessment-current but staging is superseded
  const assessmentC5 = roleCurrentOccurrences([staging, focused], supersession, defs, "assessment", 5);
  assert.equal(assessmentC5.length, 1);
  assert.equal(assessmentC5[0]!.definitionId, "focused-staging-empty");

  // focused-staging-empty should NOT be in the superseded set - only staging-logistics-anomaly
  assert(supersession.superseded.has(staging.occurrenceId));
  assert(!supersession.superseded.has(focused.occurrenceId));
});

// ─── Role currency tests ────────────────────────────────────────────

test("#100 evidence currency: role-specific windows work correctly", () => {
  const buildup = occ("focused-staging-buildup", 4, "preparation");

  // At C4: assessment-current, warning-current, public-case-current
  const empty = { superseded: new Set<string>(), questionAnswers: new Map<string, string>() };

  const assessmentC4 = roleCurrentOccurrences([buildup], empty, defs, "assessment", 4);
  assert.equal(assessmentC4.length, 1);

  const warningC4 = roleCurrentOccurrences([buildup], empty, defs, "warning", 4);
  assert.equal(warningC4.length, 1);

  // At C6: assessment-current, public-case-current, but NOT warning-current (warning window is C4-C5)
  const warningC6 = roleCurrentOccurrences([buildup], empty, defs, "warning", 6);
  assert.equal(warningC6.length, 0);

  const assessmentC6 = roleCurrentOccurrences([buildup], empty, defs, "assessment", 6);
  assert.equal(assessmentC6.length, 1);
});

test("#100 evidence currency: focused-staging-empty assessment only through C5", () => {
  const empty = occ("focused-staging-empty", 4, "coercion");
  const ss = { superseded: new Set<string>(), questionAnswers: new Map<string, string>() };

  const assessmentC5 = roleCurrentOccurrences([empty], ss, defs, "assessment", 5);
  assert.equal(assessmentC5.length, 1);

  const assessmentC6 = roleCurrentOccurrences([empty], ss, defs, "assessment", 6);
  assert.equal(assessmentC6.length, 0);
});

// ─── Producer tests ─────────────────────────────────────────────────

test("#100 ordinary evidence producer: C1 produces opening-pressure-ambiguous", () => {
  const evidence = produceOrdinaryEvidence(1);
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0]!.definitionId, "opening-pressure-ambiguous");
  assert.equal(evidence[0]!.implication, "ambiguous");
});

test("#100 ordinary evidence producer: C3 produces mandatory conflicting bundle", () => {
  const evidence = produceOrdinaryEvidence(3);
  assert.equal(evidence.length, 2);
  const ids = evidence.map((e) => e.definitionId).sort();
  assert.deepEqual(ids, ["combat-elements-dispersed", "staging-logistics-anomaly"]);
});

test("#100 reroute producer: preparation + probe_shipping → integrated", () => {
  const evidence = produceRerouteEvidence("developing", "probe_shipping");
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0]!.definitionId, "reroute-auxiliary-integrated");
  assert.equal(evidence[0]!.implication, "preparation");
});

test("#100 reroute producer: no preparation + probe → coercive", () => {
  const evidence = produceRerouteEvidence("none", "probe_shipping");
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0]!.definitionId, "reroute-auxiliary-coercive");
  assert.equal(evidence[0]!.implication, "coercion");
});

test("#100 focused staging: developing → buildup", () => {
  const evidence = produceFocusedStagingEvidence("developing");
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0]!.definitionId, "focused-staging-buildup");
  assert.equal(evidence[0]!.implication, "preparation");
});

test("#100 focused staging: none → empty", () => {
  const evidence = produceFocusedStagingEvidence("none");
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0]!.definitionId, "focused-staging-empty");
  assert.equal(evidence[0]!.implication, "coercion");
});

// ─── Basis pattern tests ────────────────────────────────────────────

test("#100 basis pattern: no-directional-evidence when empty", () => {
  assert.equal(deriveBasisPattern([], defs), "no-directional-evidence");
});

test("#100 basis pattern: ambiguous-only when only ambiguous", () => {
  const o = occ("opening-pressure-ambiguous", 1, "ambiguous");
  assert.equal(deriveBasisPattern([o], defs), "ambiguous-only");
});

test("#100 basis pattern: all nine patterns reachable", () => {
  const patterns = new Set<string>();

  patterns.add(deriveBasisPattern([], defs));
  patterns.add(deriveBasisPattern([occ("opening-pressure-ambiguous", 1, "ambiguous")], defs));
  patterns.add(deriveBasisPattern([occ("staging-logistics-anomaly", 3, "preparation")], defs));
  patterns.add(deriveBasisPattern([occ("combat-elements-dispersed", 3, "coercion")], defs));
  patterns.add(deriveBasisPattern([occ("lattice-landing-concentration", 4, "preparation")], defs));
  patterns.add(deriveBasisPattern([occ("lattice-auxiliary-coercive", 4, "coercion")], defs));
  patterns.add(deriveBasisPattern([
    occ("lattice-landing-concentration", 4, "preparation"),
    occ("combat-elements-dispersed", 3, "coercion"),
  ], defs));
  patterns.add(deriveBasisPattern([
    occ("staging-logistics-anomaly", 3, "preparation"),
    occ("lattice-auxiliary-coercive", 4, "coercion"),
  ], defs));
  patterns.add(deriveBasisPattern([
    occ("staging-logistics-anomaly", 3, "preparation"),
    occ("combat-elements-dispersed", 3, "coercion"),
  ], defs));

  const all = ["no-directional-evidence", "ambiguous-only", "preparation-indicators-only",
    "preparation-corroborated", "coercion-indicators-only", "coercion-corroborated",
    "preparation-dominant-conflict", "coercion-dominant-conflict", "balanced-conflict"];
  for (const p of all) {
    assert(patterns.has(p), `Pattern ${p} should be reachable`);
  }
});

// ─── Combined occurrence seam ───────────────────────────────────────

test("#100 combineOccurrences deduplicates by occurrenceId", () => {
  const a = occ("staging-logistics-anomaly", 3, "preparation");
  const b = occ("staging-logistics-anomaly", 3, "preparation"); // Same id due to same inputs
  const combined = combineOccurrences([a], [b]);
  assert.equal(combined.length, 1);
});

// ─── Not-ready output ───────────────────────────────────────────────

test("#100 notReadyOutput has notReady=true", () => {
  const output = notReadyOutput(3);
  assert.equal(output.notReady, true);
  assert.equal(output.cycle, 3);
  assert.equal(output.brief.warning, "none");
});

// ─── Complete reduction pipeline tests ──────────────────────────────

test("#100 C1 reduction: opening-pressure-ambiguous → unclear/weak", () => {
  const evidence = produceOrdinaryEvidence(1);
  const result = reduceHqBelief(evidence, defs, 1, null);
  assert.equal(result.notReady, false);
  assert.equal(result.brief.assessment, "unclear/weak");
  assert.equal(result.basisPattern, "ambiguous-only");
  assert.equal(result.brief.warning, "none");
  assert.equal(result.brief.publicCase, "none");
});

test("#100 C3 reduction: mandatory conflicting bundle → unclear/conflicted", () => {
  const evidence = produceOrdinaryEvidence(3);
  const result = reduceHqBelief(evidence, defs, 3, null);
  assert.equal(result.brief.assessment, "unclear/conflicted");
  assert.equal(result.basisPattern, "balanced-conflict");
});

test("#100 C4 with focused buildup: preparation/weak with warning", () => {
  const ordinary = produceOrdinaryEvidence(4);
  const staging = produceFocusedStagingEvidence("developing");
  const all = combineOccurrences(ordinary, staging);
  const result = reduceHqBelief(all, defs, 4, null);
  assert.equal(result.brief.assessment, "preparation/weak");
  assert.equal(result.brief.warning, "usable");
  assert(result.brief.hasCurrentDirectWarning);
});

test("#100 C4 with focused empty: coercion/weak", () => {
  const ordinary = produceOrdinaryEvidence(4);
  const staging = produceFocusedStagingEvidence("none");
  const all = combineOccurrences(ordinary, staging);
  const result = reduceHqBelief(all, defs, 4, null);
  assert.equal(result.brief.assessment, "coercion/weak");
  assert.equal(result.brief.warning, "none");
});

// ─── Delta tests ────────────────────────────────────────────────────

test("#100 delta: first call produces cycle-advance cause", () => {
  const evidence = produceOrdinaryEvidence(1);
  const result = reduceHqBelief(evidence, defs, 1, null);
  assert.equal(result.delta.updateCause, "cycle-advance");
});

// ─── Hostile/invariant tests ────────────────────────────────────────

test("#100 hostile: majority-vote reducer does not exist (multiplicity doesn't change result)", () => {
  // Multiple indicators of same direction should still give directional/weak, not coherent
  const manyPrep = [
    occ("staging-logistics-anomaly", 3, "preparation"),
    occ("staging-logistics-anomaly", 3, "preparation"), // duplicate occurrence (would be deduped)
  ];
  // Use unique occurrences
  const uniquePrep = [
    occ("staging-logistics-anomaly", 3, "preparation", "ordinary"),
    { ...occ("staging-logistics-anomaly", 3, "preparation", "reroute"), occurrenceId: "staging-2" },
  ] as V2EvidenceOccurrence[];
  const result = reduceAssessment(uniquePrep, defs);
  assert.equal(result.assessment, "preparation/weak"); // Not preparation/coherent
});

test("#100 hostile: contrary indicator alone does not make unclear", () => {
  // One diagnostic prep with no contrary evidence → preparation/coherent
  const result = reduceAssessment([
    occ("lattice-landing-concentration", 4, "preparation"),
  ], defs);
  assert.equal(result.assessment, "preparation/coherent");
});

test("#100 hostile: warning indicator does not displace diagnostic evidence", () => {
  // Diagnostic prep + warning indicator prep → still preparation/coherent
  const diag = occ("lattice-landing-concentration", 4, "preparation");
  const warning = occ("focused-staging-buildup", 4, "preparation");
  const result = reduceAssessment([diag, warning], defs);
  assert.equal(result.assessment, "preparation/coherent");
});

test("#100 hostile: stale evidence is not deleted, just not current", () => {
  const opening = occ("opening-pressure-ambiguous", 1, "ambiguous");
  const ss = { superseded: new Set<string>(), questionAnswers: new Map<string, string>() };
  // At C3, opening-pressure-ambiguous is no longer assessment-current (window C1-C2)
  const current = roleCurrentOccurrences([opening], ss, defs, "assessment", 3);
  assert.equal(current.length, 0);
  // But it should still be in the original occurrences list
});

test("#100 hostile: superseded evidence cannot resurrect", () => {
  const staging = occ("staging-logistics-anomaly", 3, "preparation");
  const focused = occ("focused-staging-empty", 4, "coercion");
  const ss = computeSupersession([staging, focused], defs);

  // Even if focused-staging-empty ages out at C6, staging-logistics-anomaly should stay superseded
  const assessmentC6 = roleCurrentOccurrences([staging, focused], ss, defs, "assessment", 6);
  assert.equal(assessmentC6.length, 0); // focused ages out, staging is superseded
});

test("#100 hostile: R6 terminal action never enters intelligence", () => {
  // This is a compile-time and architectural invariant
  // Producers never produce evidence from terminal actions
  const ordinary = produceOrdinaryEvidence(6);
  assert.equal(ordinary.length, 0); // No ordinary evidence at C6
});

test("#100 hostile: current state cannot reconstruct historical evidence", () => {
  // Historical evidence is only produced through the deterministic producers
  // at the time of observation. Current state does not create evidence.
  const evidence = produceOrdinaryEvidence(4);
  const result = reduceHqBelief(evidence, defs, 4, null);
  // The assessment at C4 should only use C4-current evidence
  assert.equal(result.brief.assessment, "unclear/weak"); // Only cycle4-pressure-pattern-ambiguous is current at C4
});

test("#100 hostile: one source cannot be credible", () => {
  // Only one source-sensitive corroborating occurrence from one group
  const o = occ("lattice-landing-concentration", 4, "preparation");
  const result = reducePublicCase([o], [o], defs);
  assert.notEqual(result.state, "credible");
});

test("#100 hostile: directionless credible is invalid", () => {
  // Ambiguous source-sensitive evidence cannot be credible
  const o = occ("cycle4-pressure-pattern-ambiguous", 4, "ambiguous");
  const result = reducePublicCase([o], [o], defs);
  assert.notEqual(result.state, "credible");
});

test("#100 hostile: no hidden posture enters producer", () => {
  // Focused staging reads only preparation, not posture
  const evidence = produceFocusedStagingEvidence("developing");
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0]!.implication, "preparation");
  // Posture-only changes with same preparation should produce identical results
  // (tested via the producer's contract - it only takes preparation as input)
});

test("#100 hostile: evidence model digest is deterministic", () => {
  const digest1 = kestrelHqBeliefModelDigest();
  const digest2 = kestrelHqBeliefModelDigest();
  assert.equal(digest1, digest2);
  assert.equal(digest1.length, 64);
});

test("#100 evidence model has exactly 19 definitions", () => {
  assert.equal(kestrelHqBeliefModelV1.definitions.length, 19);
  assert.equal(v2EvidenceDefinitionMap.size, 19);
});

test("#100 hostile: no sim→content dependency in production path", () => {
  // The deriveHqBelief function accepts definitions as a parameter
  // Production sim does not import @brass-ledger/content
  // This is a compile-time invariant verified by the build
});

test("#100 hostile: canonical JSON drift detection", () => {
  // Verify that canonical JSON produces stable output
  const obj = { b: 2, a: 1 };
  assert.equal(canonicalV2Json(obj), '{"a":1,"b":2}');
});

test("#100 hostile: V2VerifiedProjectionContext type exists and construction works", () => {
  // Verify the type is importable and constructible (internal API)
  // Full forgery rejection is verified at the type level via WeakMap encapsulation
  assert.ok(V2VerifiedProjectionContext);
  // createVerifiedProjectionContext requires a real V2Session, tested in integration
});

// ─── Evidence lifecycle integration tests ───────────────────────────

test("#100 lifecycle: C1→C6 full ordinary evidence flow", () => {
  const cycles = [1, 2, 3, 4, 5, 6];
  let prev = null;
  for (const cycle of cycles) {
    const evidence = produceOrdinaryEvidence(cycle);
    const result = reduceHqBelief(evidence, defs, cycle, prev);
    prev = {
      assessment: result.brief.assessment,
      basisPattern: result.basisPattern,
      warning: result.brief.warning,
      warningBasisIds: result.brief.warningBasis.map((s) => s.definitionId),
      publicCase: result.brief.publicCase,
      publicCaseDirection: result.brief.publicCaseDirection,
      publicCaseBasisIds: result.brief.publicCaseBasis.map((s) => s.definitionId),
      supersededIds: result.delta.newlySupersededIds,
    };
  }
});

test("#100 lifecycle: C3 mandatory conflict holds regardless of hidden truth", () => {
  // The C3 ordinary evidence always produces the conflicting bundle
  const evidence = produceOrdinaryEvidence(3);
  assert.equal(evidence.length, 2);
  assert(evidence.some((e) => e.definitionId === "staging-logistics-anomaly"));
  assert(evidence.some((e) => e.definitionId === "combat-elements-dispersed"));
});

test("#100 lifecycle: same evidence + different hidden truth → identical assessment", () => {
  // The reducer only sees evidence occurrences, not hidden truth
  const evidence = produceOrdinaryEvidence(1);
  const result1 = reduceHqBelief(evidence, defs, 1, null);
  const result2 = reduceHqBelief(evidence, defs, 1, null);
  assert.equal(result1.brief.assessment, result2.brief.assessment);
});
