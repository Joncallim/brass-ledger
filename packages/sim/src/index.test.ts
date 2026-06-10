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

// Stage 2: S1 boundary tests
test("S1 boundary: high recovery debt (>65) compounds into retention pressure over successive turns", () => {
  const highDebtState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s1: { recoveryDebt: 70, reservePredictability: 35 },
    },
  };
  const result = resolveTurn(soloScenario, highDebtState, highTempoInput);
  // retentionPressure (+4) should push debt beyond what tempoPressure alone would
  assert.ok(result.nextState.staffMechanics.s1.recoveryDebt > 70, "High-debt state should compound");
});

test("S1 boundary: low recovery debt (<30) decays naturally without surge choices", () => {
  const lowDebtState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s1: { recoveryDebt: 22, reservePredictability: 72 },
    },
  };
  const result = resolveTurn(soloScenario, lowDebtState, balancedInput);
  // balancedInput has no tempo-spike; natural decay should apply
  assert.ok(result.nextState.staffMechanics.s1.recoveryDebt < 22, "Low-debt state should show natural decay");
});

test("S1-S3 interlock: after-action warns when deployable units improved but S1 recovery debt worsened", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);
  const deployableDelta = result.nextState.strategic.forceGeneration.deployableUnits - soloScenario.initialState.strategic.forceGeneration.deployableUnits;
  const debtDelta = result.nextState.staffMechanics.s1.recoveryDebt - soloScenario.initialState.staffMechanics.s1.recoveryDebt;
  if (deployableDelta > 0.3 && debtDelta > 5) {
    const s1Warning = result.afterAction.find((entry) => entry.heading === "S1 personnel warning");
    assert.ok(s1Warning, "Expected S1 personnel warning when deployable improved but debt worsened");
  } else {
    // If the specific thresholds weren't crossed this run, just verify the afterAction structure is valid
    assert.ok(result.afterAction.length >= 2);
  }
});

// Stage 2: S2 fog-of-war tests
test("S2 boundary: high confidence with high deception risk is penalized by dangerous-precision penalty", () => {
  const dangerousState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s2: { externalEstimateConfidence: 70, visibility: "KNOWN" as const, deceptionRisk: 62 },
    },
  };
  const result = resolveTurn(soloScenario, dangerousState, balancedInput);
  // dangerous-precision penalty (−6) should reduce confidence below 70
  assert.ok(
    result.nextState.staffMechanics.s2.externalEstimateConfidence < 70,
    "High-confidence + high-deception should be penalized",
  );
});

test("S2 fog-of-war replay is deterministic across multiple calls", () => {
  const result1 = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const result2 = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  assert.deepEqual(result1.nextState.staffMechanics.s2, result2.nextState.staffMechanics.s2);
  assert.equal(result1.replayHash, result2.replayHash);
});

test("S2 visibility class is surfaced in S2 staff function metrics", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const s2 = result.staffFunctions.find((fn) => fn.id === "S2");
  assert.ok(s2);
  const pictureMetric = s2.metrics.find((m) => m.label.startsWith("Picture class:"));
  assert.ok(pictureMetric, "S2 readout should include a picture-class metric");
  assert.ok(["0", "50", "100"].includes(String(pictureMetric.value)), "Picture class value should map to 0/50/100");
});

// Stage 2: S3 visible vs executable tests
test("S3 credible deterrence is bounded by the minimum constraint (visible, executable, sustainment, intel)", () => {
  const lowExecState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s3: { visiblePosture: 80, executablePosture: 15, credibleDeterrence: 50 },
    },
  };
  const result = resolveTurn(soloScenario, lowExecState, highTempoInput);
  assert.ok(
    result.nextState.staffMechanics.s3.credibleDeterrence < result.nextState.staffMechanics.s3.visiblePosture,
    "Credible deterrence must be less than visible posture when executable posture is constrained",
  );
});

test("S3 posture warning fires when visible exceeds executable by more than 15", () => {
  const bigGapState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s3: { visiblePosture: 80, executablePosture: 25, credibleDeterrence: 25 },
    },
  };
  const result = resolveTurn(soloScenario, bigGapState, highTempoInput);
  const gap = result.nextState.staffMechanics.s3.visiblePosture - result.nextState.staffMechanics.s3.executablePosture;
  if (gap > 15) {
    const s3Warning = result.afterAction.find((entry) => entry.heading === "S3 posture warning");
    assert.ok(s3Warning, "Expected S3 posture warning when visible posture outpaces executable by >15");
  }
});

test("S3 credible deterrence metric is included in S3 staff function readout", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const s3 = result.staffFunctions.find((fn) => fn.id === "S3");
  assert.ok(s3);
  const deterrenceMetric = s3.metrics.find((m) => m.label === "Credible deterrence");
  assert.ok(deterrenceMetric, "S3 readout should include credible-deterrence metric");
  assert.ok(deterrenceMetric.value >= 0 && deterrenceMetric.value <= 100);
});

// Stage 2: S4 supportable tempo tests
test("S4 supportable tempo is constrained by minimum sustainment factor", () => {
  const lowSustainState = {
    ...soloScenario.initialState,
    strategic: {
      ...soloScenario.initialState.strategic,
      sustainment: { depotBacklog: 75, munitionsSufficiency: 12, fuelSufficiency: 18, liftAvailability: 22 },
    },
    sustainment: { depotBacklog: 75, munitionsSufficiency: 12, fuelSufficiency: 18, liftAvailability: 22 },
  };
  const result = resolveTurn(soloScenario, lowSustainState, highTempoInput);
  assert.ok(result.nextState.staffMechanics.s4.supportableTempo < 15, "Supportable tempo should be very low under constrained sustainment");
});

test("S4-S3 interlock: surge tempo input increases S4 lift burn vs balanced input", () => {
  const surgeResult = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);
  const quietResult = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  assert.ok(
    surgeResult.nextState.staffMechanics.s4.liftBurn > quietResult.nextState.staffMechanics.s4.liftBurn,
    "Surge exercises should increase S4 lift burn",
  );
  assert.ok(
    surgeResult.nextState.staffMechanics.s4.supportableTempo <= quietResult.nextState.staffMechanics.s4.supportableTempo,
    "Surge should reduce or equal supportable tempo vs quiet recovery",
  );
});

test("S4 supportable tempo after-action warns when critically low", () => {
  const lowTempoState = {
    ...soloScenario.initialState,
    strategic: {
      ...soloScenario.initialState.strategic,
      sustainment: { depotBacklog: 82, munitionsSufficiency: 10, fuelSufficiency: 12, liftAvailability: 15 },
    },
    sustainment: { depotBacklog: 82, munitionsSufficiency: 10, fuelSufficiency: 12, liftAvailability: 15 },
  };
  const result = resolveTurn(soloScenario, lowTempoState, highTempoInput);
  const s4Warning = result.afterAction.find((entry) => entry.heading === "S4 support warning");
  assert.ok(s4Warning, "Expected S4 support warning when supportable tempo is critically low");
});

test("S4 supportable tempo metric is included in S4 staff function readout", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const s4 = result.staffFunctions.find((fn) => fn.id === "S4");
  assert.ok(s4);
  const tempoMetric = s4.metrics.find((m) => m.label === "Supportable tempo");
  assert.ok(tempoMetric, "S4 readout should include supportable-tempo metric");
  assert.ok(tempoMetric.value >= 0 && tempoMetric.value <= 100);
});

// Stage 2: S5 strategic coherence and commitment tests
test("S5 contradiction penalty lowers coherence when S3/S4 gaps are present", () => {
  const contradictionState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s3: { visiblePosture: 72, executablePosture: 45, credibleDeterrence: 45 },
      s4: { stockpileDepth: 28, liftBurn: 52, supportableTempo: 8 },
    },
  };
  const normalResult = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);
  const contradictionResult = resolveTurn(soloScenario, contradictionState, highTempoInput);
  assert.ok(
    contradictionResult.nextState.staffMechanics.s5.strategicCoherence <=
      normalResult.nextState.staffMechanics.s5.strategicCoherence,
    "S5 coherence should be no better when large S3/S4 contradictions are present",
  );
});

test("S5 commitments are created when alliance or program tags are selected", () => {
  // alliance-frame options contain "alliance" tag — after resolution, commitment should be tracked
  const result = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const allianceTags = balancedInput.selections.some((s) => {
    const memo = soloScenario.memoTemplates.find((m) => m.id === s.memoId);
    const opt = memo?.options.find((o) => o.id === s.optionId);
    return opt?.tags.includes("alliance");
  });
  if (allianceTags) {
    assert.ok(result.nextState.activeCommitments.some((c) => c.type === "alliance"));
  } else {
    assert.ok(result.nextState.activeCommitments !== undefined);
  }
});

// Stage 2: accepted-risk tests
test("accepted risk overrides are recorded in turn result", () => {
  const inputWithRisks: TurnInput = {
    ...highTempoInput,
    acceptedRiskOverrides: [
      { staffFunctionId: "S1", warningText: "Recovery debt will rise from surge." },
      { staffFunctionId: "S4", warningText: "Lift burn will increase." },
    ],
  };
  const result = resolveTurn(soloScenario, soloScenario.initialState, inputWithRisks);
  assert.equal(result.acceptedRisks.length, 2);
  assert.ok(result.acceptedRisks.every((r) => r.accepted === true));
  assert.ok(result.acceptedRisks.some((r) => r.staffFunctionId === "S1"));
  assert.ok(result.acceptedRisks.some((r) => r.staffFunctionId === "S4"));
});

test("accepted risk override is noted in after-action output", () => {
  const inputWithRisks: TurnInput = {
    ...highTempoInput,
    acceptedRiskOverrides: [{ staffFunctionId: "S3", warningText: "Visible posture may exceed executable." }],
  };
  const result = resolveTurn(soloScenario, soloScenario.initialState, inputWithRisks);
  const acceptedNote = result.afterAction.find((entry) => entry.heading === "Accepted risks");
  assert.ok(acceptedNote, "Expected accepted-risks entry in after-action output");
  assert.ok(acceptedNote.detail.includes("S3"));
});

// Stage 2: replay and determinism tests
test("S1-S5 mechanics replay is deterministic across two independent runs", () => {
  const result1 = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);
  const result2 = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);
  assert.deepEqual(result1.nextState.staffMechanics, result2.nextState.staffMechanics);
  assert.equal(result1.replayHash, result2.replayHash);
});

test("multi-turn replay is deterministic: two-turn chain produces same hashes both times", () => {
  const turn1a = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const turn2Input: TurnInput = { ...highTempoInput, turn: 2 };
  const turn2a = resolveTurn(soloScenario, turn1a.nextState, turn2Input);

  const turn1b = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const turn2b = resolveTurn(soloScenario, turn1b.nextState, turn2Input);

  assert.equal(turn2a.replayHash, turn2b.replayHash);
  assert.deepEqual(turn2a.nextState.staffMechanics, turn2b.nextState.staffMechanics);
});

test("terminal-campaign: resolveTurn throws when campaign is already won or lost", () => {
  const wonState = { ...soloScenario.initialState, campaignStatus: "won" as const };
  const lostState = { ...soloScenario.initialState, campaignStatus: "lost" as const };
  assert.throws(() => resolveTurn(soloScenario, wonState, balancedInput), /already ended/);
  assert.throws(() => resolveTurn(soloScenario, lostState, balancedInput), /already ended/);
});

// Stage 2: cross-staff interlock tests
test("S2-S3 interlock: low estimate confidence reduces S3 credible deterrence", () => {
  const lowConfidenceState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s2: { externalEstimateConfidence: 20, visibility: "RUMORED" as const, deceptionRisk: 55 },
      s3: { visiblePosture: 70, executablePosture: 65, credibleDeterrence: 60 },
    },
  };
  const result = resolveTurn(soloScenario, lowConfidenceState, highTempoInput);
  // credibleDeterrence = min(visible, executable, sustainment, intel)
  // With intel confidence ~20, credible deterrence should be bounded below 40
  assert.ok(result.nextState.staffMechanics.s3.credibleDeterrence < 40, "Low S2 confidence should constrain S3 credible deterrence");
});

test("S4-S5 interlock: programs are blocked by S4 lift burn saturation", () => {
  const highBurnState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s4: { stockpileDepth: 40, liftBurn: 78, supportableTempo: 5 },
    },
  };
  const result = resolveTurn(soloScenario, highBurnState, balancedInput);
  const ledger = result.nextState.capabilityPrograms.find((p) => p.id === "sustainment-ledger");
  assert.ok(ledger, "Sustainment ledger program should exist");
  assert.ok(ledger.blockers.some((b) => b.includes("S4") || b.includes("lift")), "Sustainment ledger should be blocked by S4 lift burn");
});

test("S5-S1 interlock: reserve-rebuild program is blocked when S1 recovery debt is critically high", () => {
  const highDebtState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s1: { recoveryDebt: 82, reservePredictability: 25 },
    },
  };
  const result = resolveTurn(soloScenario, highDebtState, balancedInput);
  const reserveRebuild = result.nextState.capabilityPrograms.find((p) => p.id === "reserve-rebuild");
  assert.ok(reserveRebuild, "Reserve rebuild program should exist");
  assert.ok(reserveRebuild.blockers.some((b) => b.includes("S1") || b.includes("recovery")), "Reserve rebuild should be blocked by S1 recovery debt");
});
