import test from "node:test";
import assert from "node:assert/strict";
import { soloScenario } from "@brass-ledger/content";
import type { CampaignState, MemoSelection, TurnInput } from "@brass-ledger/shared";
import { resolveTurn } from "./index.ts";

// Doctrine 5 balance guardrail: under the SHIPPED four-cell scenario (J6/J8/J9/
// STRATCOM), the four exact doctrine gate thresholds must be reachable from both
// sides by legal memo selections — the gates must not become always-on or
// unreachable. The witnesses below were found by exhaustive search over all 432
// legal selection traces (v2: "The batch must be independently rerun"; the search
// script is not committed, but each witness is a plain legal selection run).

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function laneAfter(baseline: number, delta: number): number {
  return Number((baseline + delta).toFixed(2));
}

function inputFor(turn: number, selections: MemoSelection[]): TurnInput {
  return { turn, selectedActionIds: [], selections, acceptedRiskOverrides: [], staffNegotiations: [] };
}

/** Runs the same legal selection for `turns` consecutive months; returns the results and the state after each. */
function runTrace(selection: MemoSelection[], turns: number) {
  let state: CampaignState = clone(soloScenario.initialState);
  const results = [];
  for (let index = 0; index < turns && state.campaignStatus === "active"; index += 1) {
    const result = resolveTurn(soloScenario, state, inputFor(state.turn, clone(selection)));
    results.push(result);
    state = result.nextState;
  }
  return results;
}

const quietBuild: MemoSelection[] = [
  { memoId: "posture", optionId: "measured-deterrence" },
  { memoId: "intelligence-focus", optionId: "warning-net" },
  { memoId: "sustainment-focus", optionId: "repair-first" },
  { memoId: "alliance-frame", optionId: "quiet-reassurance" },
];
const surgeBuild: MemoSelection[] = [
  { memoId: "posture", optionId: "surge-exercises" },
  { memoId: "intelligence-focus", optionId: "warning-net" },
  { memoId: "sustainment-focus", optionId: "repair-first" },
  { memoId: "alliance-frame", optionId: "quiet-reassurance" },
];
const reserveBuild: MemoSelection[] = [
  { memoId: "posture", optionId: "measured-deterrence" },
  { memoId: "intelligence-focus", optionId: "warning-net" },
  { memoId: "sustainment-focus", optionId: "munitions-hedge" },
  { memoId: "alliance-frame", optionId: "quiet-reassurance" },
];
const deceptionBuild: MemoSelection[] = [
  { memoId: "posture", optionId: "measured-deterrence" },
  { memoId: "intelligence-focus", optionId: "deception-hunt" },
  { memoId: "sustainment-focus", optionId: "repair-first" },
  { memoId: "alliance-frame", optionId: "quiet-reassurance" },
];
const modernizationBuild: MemoSelection[] = [
  { memoId: "posture", optionId: "measured-deterrence" },
  { memoId: "intelligence-focus", optionId: "warning-net" },
  { memoId: "sustainment-focus", optionId: "repair-first" },
  { memoId: "alliance-frame", optionId: "quiet-reassurance" },
  { memoId: "force-development", optionId: "fires-prototype" },
];

test("doctrine 5: relativeTempo > 65 is reachable (unsupported branch) and avoidable", () => {
  const overreach = runTrace(surgeBuild, 2);
  assert.equal(overreach.length, 2, "trace stays active");
  assert.ok(overreach[1]!.nextState.doctrineMechanics.relativeTempo > 65, "two consecutive surges cross 65");
  const supportableTempo = overreach[1]!.nextState.staffMechanics.s4.supportableTempo;
  assert.ok(!(overreach[1]!.nextState.staffMechanics.s1.recoveryDebt < 62 && overreach[1]!.nextState.staffMechanics.s2.externalEstimateConfidence > 42 && supportableTempo > 15), "the witness is the UNSUPPORTED high-tempo branch (S4 supportable tempo collapsed)");
  assert.ok(overreach[1]!.afterAction.some((note) => note.heading === "Doctrine bet: tempo" && note.detail.includes("outran")), "tempo overreach consequence observed");

  const below = runTrace(quietBuild, 1);
  assert.ok(below[0]!.nextState.doctrineMechanics.relativeTempo <= 65, "measured posture stays at or below 65");
});

test("doctrine 5: relativeTempo > 65 supported branch is mechanically live (crafted schema-legal state)", () => {
  // No legal selection trace reaches supported high tempo within the 12-turn horizon:
  // exhaustive search over all 432 legal traces shows the maximum relativeTempo ever
  // observed while S1 debt < 62 AND S2 confidence > 42 AND S4 supportable tempo > 15
  // is 42 (the faction anchor) — the surge needed to cross 65 collapses liftBurn, and
  // the 4/turn tempo decay outruns S4 recovery. This is a PRE-EXISTING scenario
  // property (the shipped D5 modules never touch S4/tempo), so the supported branch
  // is witnessed with a schema-legal state patched from a real quiet-build trace:
  // the branch mechanics (paid-off note, +0.15 deployable) must still be live.
  const base = runTrace(quietBuild, 5);
  const state = clone(base.at(-1)!.nextState);
  assert.ok(state.staffMechanics.s1.recoveryDebt < 62 && state.staffMechanics.s2.externalEstimateConfidence > 42 && state.staffMechanics.s4.supportableTempo > 15, "quiet-build state satisfies the support preconditions");
  state.doctrineMechanics.relativeTempo = 70;
  // The paid-off turn must not select quiet/slow-burn (which drag tempo down) nor
  // tempo-spike/exercise (which would rebuild overreach); modernization-case carries
  // neither, so tempo decays by only the 4/turn pull and stays above 65.
  const supportedTurn = inputFor(state.turn, [
    { memoId: "posture", optionId: "measured-deterrence" },
    { memoId: "intelligence-focus", optionId: "warning-net" },
    { memoId: "sustainment-focus", optionId: "repair-first" },
    { memoId: "alliance-frame", optionId: "modernization-case" },
  ]);
  const paidOff = resolveTurn(soloScenario, state, supportedTurn);
  assert.ok(paidOff.nextState.doctrineMechanics.relativeTempo > 65, "tempo stays above 65 after resolution");
  const note = paidOff.afterAction.find((entry) => entry.heading === "Doctrine bet: tempo");
  assert.ok(note && note.detail.includes("genuinely supportable"), "supported high-tempo branch pays off");
  // Isolate the +0.15 dividend: the identical turn from the identical state with
  // tempo held at 60 (no branch) must differ from the paid-off run by exactly 0.15.
  const noBranchState = clone(state);
  noBranchState.doctrineMechanics.relativeTempo = 60;
  const noBranch = resolveTurn(soloScenario, noBranchState, supportedTurn);
  assert.equal(paidOff.nextState.forceGeneration.deployableUnits, laneAfter(noBranch.nextState.forceGeneration.deployableUnits, 0.15), "supported branch adds +0.15 deployable");

  // Same crafted state with the support preconditions broken flips to overreach.
  // updateStaffMechanics recomputes supportableTempo from previousState sustainment,
  // so the S4 support precondition is broken at its input (depot backlog).
  const broken = clone(state);
  broken.strategic.sustainment.depotBacklog = 90;
  broken.doctrineMechanics.relativeTempo = 70;
  const overreach = resolveTurn(soloScenario, broken, supportedTurn);
  assert.ok(overreach.afterAction.some((entry) => entry.heading === "Doctrine bet: tempo" && entry.detail.includes("outran")), "unsupported branch observed on the same state");
});

test("doctrine 5: uncommittedCapacity > 25 is reachable and avoidable", () => {
  const held = runTrace(reserveBuild, 1);
  assert.ok(held[0]!.nextState.doctrineMechanics.uncommittedCapacity > 25, "restrained selections hold reserve above 25");
  const committed = runTrace(quietBuild, 1);
  assert.ok(committed[0]!.nextState.doctrineMechanics.uncommittedCapacity <= 25, "heavier selections commit below 25");
});

test("doctrine 5: culminationRisk > 72 is reachable and avoidable", () => {
  const strained = runTrace(modernizationBuild, 6);
  assert.equal(strained.length, 6, "trace stays active through the window");
  assert.ok(strained.some((result) => result.nextState.doctrineMechanics.culminationRisk > 72), "sustained modernization strain crosses 72");
  const healthy = runTrace(quietBuild, 1);
  assert.ok(healthy[0]!.nextState.doctrineMechanics.culminationRisk <= 72, "healthy opening stays at or below 72");
});

test("doctrine 5: systemPressure > 65 is reachable and avoidable under the shipped J6 cell", () => {
  const pressured = runTrace(deceptionBuild, 1);
  assert.ok(pressured[0]!.nextState.doctrineMechanics.systemPressure > 65, "deception-heavy selections cross 65 despite J6's -8");
  const calm = runTrace(quietBuild, 1);
  assert.ok(calm[0]!.nextState.doctrineMechanics.systemPressure <= 65, "warning-net selections stay at or below 65");
});
