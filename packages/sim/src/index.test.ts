import test from "node:test";
import assert from "node:assert/strict";
import { soloScenario } from "@brass-ledger/content";
import { buildChiefPositions, campaignStateSchema, continueChiefConversation, startChiefConversation, type TurnInput } from "@brass-ledger/shared";
import { resolveTurn, validateReplaySession } from "./index";

const balancedInput: TurnInput = {
  turn: 1,
  selectedActionIds: [],
  selections: [
    { memoId: "posture", optionId: "measured-deterrence" },
    { memoId: "intelligence-focus", optionId: "deception-hunt" },
    { memoId: "sustainment-focus", optionId: "repair-first" },
    { memoId: "alliance-frame", optionId: "quiet-reassurance" },
    { memoId: "force-development", optionId: "training-reset" },
  ],
};

const highTempoInput: TurnInput = {
  turn: 1,
  selectedActionIds: [],
  selections: [
    { memoId: "posture", optionId: "surge-exercises" },
    { memoId: "intelligence-focus", optionId: "industrial-watch" },
    { memoId: "sustainment-focus", optionId: "munitions-hedge" },
    { memoId: "alliance-frame", optionId: "modernization-case" },
    { memoId: "force-development", optionId: "fires-prototype" },
  ],
};

test("resolveTurn is deterministic for the same memo selections", () => {
  const left = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const right = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);

  assert.equal(left.replayHash, right.replayHash);
  assert.deepEqual(left.nextState, right.nextState);
});

test("resolveTurn advances the month and emits directorate burden and chiefs positions", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, {
    turn: 1,
    selectedActionIds: [],
    selections: [
      { memoId: "posture", optionId: "surge-exercises" },
      { memoId: "intelligence-focus", optionId: "warning-net" },
      { memoId: "sustainment-focus", optionId: "lift-assurance" },
      { memoId: "alliance-frame", optionId: "public-assurance-tour" },
      { memoId: "force-development", optionId: "fires-prototype" },
    ],
  });

  assert.equal(result.nextState.turn, 2);
  assert.ok(result.directorateBurden.length === 6);
  assert.ok(result.chiefPositions.length >= 20);
  assert.ok(result.summary.includes("Turn 2/12"));
});

test("resolveTurn emits S1-S5 staff readouts and causal explainability", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);

  assert.deepEqual(result.staffFunctions.map((entry) => entry.id), ["S1", "S2", "S3", "S4", "S5"]);
  assert.ok(result.staffFunctions.every((entry) => entry.metrics.length >= 3));
  assert.ok(result.staffFunctions.some((entry) => entry.warnings.length > 0));
  assert.ok(result.explainability.length >= 4);
  assert.ok(result.explainability.every((entry) => entry.causalRefs.length > 0 || entry.label === "Events"));
});

test("resolveTurn advances S1-S5 core mechanics", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);

  assert.ok(result.nextState.staffMechanics.s1.recoveryDebt > soloScenario.initialState.staffMechanics.s1.recoveryDebt);
  assert.ok(result.nextState.staffMechanics.s2.externalEstimateConfidence > soloScenario.initialState.staffMechanics.s2.externalEstimateConfidence);
  assert.ok(["RUMORED", "ESTIMATED", "KNOWN"].includes(result.nextState.staffMechanics.s2.visibility));
  assert.ok(result.nextState.staffMechanics.s3.visiblePosture > soloScenario.initialState.staffMechanics.s3.visiblePosture);
  assert.ok(result.nextState.staffMechanics.s4.liftBurn > soloScenario.initialState.staffMechanics.s4.liftBurn);
  assert.ok(result.nextState.staffMechanics.s5.strategicCoherence !== soloScenario.initialState.staffMechanics.s5.strategicCoherence);
  assert.ok(result.afterAction.some((entry) => entry.heading === "S1-S5 consequences"));
  assert.ok(result.explainability.some((entry) => entry.label === "S1-S5 mechanics"));
});

test("chief trust influences future positions on the same packet", () => {
  const memo = soloScenario.memoTemplates.find((entry) => entry.id === "posture");
  assert.ok(memo);
  const option = memo.options.find((entry) => entry.id === "measured-deterrence");
  assert.ok(option);

  const lowTrustState = {
    ...soloScenario.initialState,
    chiefTrust: {
      ...soloScenario.initialState.chiefTrust,
      halden: 20,
    },
  };
  const highTrustState = {
    ...soloScenario.initialState,
    chiefTrust: {
      ...soloScenario.initialState.chiefTrust,
      halden: 85,
    },
  };

  const lowTrustPosition = buildChiefPositions(soloScenario.chiefs, lowTrustState, memo, option).find((entry) => entry.chiefId === "halden");
  const highTrustPosition = buildChiefPositions(soloScenario.chiefs, highTrustState, memo, option).find((entry) => entry.chiefId === "halden");

  assert.ok(lowTrustPosition);
  assert.ok(highTrustPosition);
  assert.equal(lowTrustPosition.position, "oppose");
  assert.equal(highTrustPosition.position, "support");
});

test("chief conversations branch across multiple stages and update trust deltas", () => {
  const chief = soloScenario.chiefs.find((entry) => entry.id === "halden");
  const memo = soloScenario.memoTemplates.find((entry) => entry.id === "posture");
  assert.ok(chief);
  assert.ok(memo);
  const option = memo.options.find((entry) => entry.id === "measured-deterrence");
  assert.ok(option);
  const position = buildChiefPositions(soloScenario.chiefs, soloScenario.initialState, memo, option).find((entry) => entry.chiefId === "halden");
  assert.ok(position);

  const opening = startChiefConversation(chief, memo, option, position, soloScenario.initialState);
  assert.equal(opening.stage, "opening");
  assert.ok(opening.choices.length >= 5);
  assert.deepEqual(opening.choiceTrail, []);

  const diagnosis = continueChiefConversation(opening, chief, memo, option, soloScenario.initialState, opening.choices[0].id);
  assert.equal(diagnosis.stage, "diagnosis");
  assert.equal(diagnosis.status, "active");
  assert.ok(diagnosis.transcript.length > opening.transcript.length);
  assert.equal(diagnosis.choiceTrail.length, 1);

  const bargaining = continueChiefConversation(diagnosis, chief, memo, option, soloScenario.initialState, diagnosis.choices[0].id);
  assert.equal(bargaining.stage, "bargaining");
  assert.equal(bargaining.status, "active");
  assert.equal(bargaining.choiceTrail.length, 2);

  const closing = continueChiefConversation(bargaining, chief, memo, option, soloScenario.initialState, bargaining.choices[0].id);
  assert.equal(closing.stage, "closing");
  assert.equal(closing.status, "active");
  assert.equal(closing.choiceTrail.length, 3);

  const completed = continueChiefConversation(closing, chief, memo, option, soloScenario.initialState, closing.choices[0].id);
  assert.equal(completed.stage, "completed");
  assert.equal(completed.status, "completed");
  assert.equal(completed.choices.length, 0);
  assert.equal(completed.choiceTrail.length, 4);
  assert.ok(completed.totalTrustDelta >= 0);
});

test("validateReplaySession reports mismatched history length without throwing", () => {
  const validation = validateReplaySession(soloScenario, {
    initialState: soloScenario.initialState,
    turnInputs: [balancedInput],
    history: [],
    state: soloScenario.initialState,
  });

  assert.equal(validation.ok, false);
  assert.equal(validation.failureKind, "history_length_mismatch");
  assert.equal(validation.checkedTurns, 0);
});

test("validateReplaySession reports replay hash corruption", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const validation = validateReplaySession(soloScenario, {
    initialState: soloScenario.initialState,
    turnInputs: [balancedInput],
    history: [{ ...result, replayHash: "forged" }],
    state: result.nextState,
  });

  assert.equal(validation.ok, false);
  assert.equal(validation.failureKind, "replay_hash_mismatch");
});

test("validateReplaySession reports altered final state corruption", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const alteredState = {
    ...result.nextState,
    strategic: {
      ...result.nextState.strategic,
      domestic: {
        ...result.nextState.strategic.domestic,
        cabinetCover: result.nextState.strategic.domestic.cabinetCover + 1,
      },
    },
    domestic: {
      ...result.nextState.domestic,
      cabinetCover: result.nextState.domestic.cabinetCover + 1,
    },
  };
  const validation = validateReplaySession(soloScenario, {
    initialState: soloScenario.initialState,
    turnInputs: [balancedInput],
    history: [result],
    state: alteredState,
  });

  assert.equal(validation.ok, false);
  assert.equal(validation.failureKind, "final_state_mismatch");
});

test("validateReplaySession reports altered initial state corruption", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const alteredInitialState = {
    ...soloScenario.initialState,
    strategic: {
      ...soloScenario.initialState.strategic,
      intelligence: {
        ...soloScenario.initialState.strategic.intelligence,
        confidence: soloScenario.initialState.strategic.intelligence.confidence + 1,
      },
    },
    intel: {
      ...soloScenario.initialState.intel,
      confidence: soloScenario.initialState.intel.confidence + 1,
    },
  };
  const validation = validateReplaySession(soloScenario, {
    initialState: alteredInitialState,
    turnInputs: [balancedInput],
    history: [result],
    state: result.nextState,
  });

  assert.equal(validation.ok, false);
  assert.equal(validation.failureKind, "replay_hash_mismatch");
});

test("validateReplaySession reports extra history length corruption", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const validation = validateReplaySession(soloScenario, {
    initialState: soloScenario.initialState,
    turnInputs: [balancedInput],
    history: [result, result],
    state: result.nextState,
  });

  assert.equal(validation.ok, false);
  assert.equal(validation.failureKind, "history_length_mismatch");
});

test("campaign state schema rejects impossible persisted metric ranges", () => {
  const invalidState = {
    ...soloScenario.initialState,
    strategic: {
      ...soloScenario.initialState.strategic,
      domestic: {
        ...soloScenario.initialState.strategic.domestic,
        cabinetCover: 125,
      },
    },
    domestic: {
      ...soloScenario.initialState.domestic,
      cabinetCover: 125,
    },
  };

  const parsed = campaignStateSchema.safeParse(invalidState);

  assert.equal(parsed.success, false);
});

test("campaign state schema rejects divergent strategic mirror fields", () => {
  const invalidState = {
    ...soloScenario.initialState,
    domestic: {
      ...soloScenario.initialState.domestic,
      cabinetCover: soloScenario.initialState.domestic.cabinetCover - 1,
    },
  };

  const parsed = campaignStateSchema.safeParse(invalidState);

  assert.equal(parsed.success, false);
  assert.ok(parsed.error.issues.some((issue) => issue.message.includes("domestic must mirror")));
});
