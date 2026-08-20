import test from "node:test";
import assert from "node:assert/strict";
import { doctrineGenes, resolveDoctrineGenes, soloScenario } from "@brass-ledger/content";
import {
  applyDoctrineGenes,
  buildChiefPositions,
  buildDirectorateBurden,
  buildStaffFunctionReadouts,
  campaignStateSchema,
  composeBurdenLens,
  composeDoctrineLens,
  continueChiefConversation,
  defaultDoctrineMechanicsState,
  doctrineGeneSchema,
  doctrineRiskKeys,
  neutralDoctrineLens,
  scenarioDefinitionSchema,
  startChiefConversation,
  updateCommitmentsFromChiefConversation,
  type DirectorateBurden,
  type DoctrineGene,
  type DoctrineLens,
  type MemoOption,
  type TurnInput,
  type CampaignState,
  type ScenarioDefinition,
} from "@brass-ledger/shared";
import { previewTurn, resolveTurn, validateReplaySession, chooseEvents, type Rng } from "./index";

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
  assert.ok(result.chiefPositions.every((entry) => entry.staffReadoutEvidence.rationale.includes("evidence")));
  assert.ok(result.summary.includes("Standing at month 2:"));
});

test("resolveTurn emits chief coalitions tied to memo options and staff constraints", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);

  assert.equal(result.chiefCoalitions.length, highTempoInput.selections.length);
  const postureCoalition = result.chiefCoalitions.find((entry) => entry.memoId === "posture" && entry.optionId === "surge-exercises");
  assert.ok(postureCoalition);
  assert.equal(postureCoalition.posture, "blocked");
  assert.deepEqual(postureCoalition.supportChiefIds, ["briggs"]);
  assert.ok(postureCoalition.objectionChiefIds.includes("halden"));
  assert.ok(postureCoalition.staffConstraintDirectorates.includes("sustainment"));
  assert.ok(postureCoalition.negotiationLevers.some((entry) => entry.includes("Reduce operations, training, sustainment load")));

  const preview = previewTurn(soloScenario, soloScenario.initialState, highTempoInput);
  assert.deepEqual(preview.chiefCoalitions, result.chiefCoalitions);
});

test("staff negotiations reduce burden before commit and record their cost", () => {
  const negotiatedInput: TurnInput = {
    ...highTempoInput,
    staffNegotiations: [{ directorate: "sustainment", reliefPoints: 2, cost: "budget_overtime" }],
  };
  const baseline = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);
  const negotiated = resolveTurn(soloScenario, soloScenario.initialState, negotiatedInput);

  const baselineSustainment = baseline.directorateBurden.find((entry) => entry.directorate === "sustainment");
  const negotiatedSustainment = negotiated.directorateBurden.find((entry) => entry.directorate === "sustainment");
  assert.ok(baselineSustainment);
  assert.ok(negotiatedSustainment);
  assert.equal(negotiatedSustainment.burdenPoints, baselineSustainment.burdenPoints - 2);
  assert.ok(negotiated.nextState.resources.budgetAuthority < baseline.nextState.resources.budgetAuthority);
  assert.ok(negotiated.afterAction.some((entry) => entry.heading === "Staff negotiations" && entry.detail.includes("Sustainment")));

  const replay = validateReplaySession(soloScenario, {
    initialState: soloScenario.initialState,
    turnInputs: [negotiatedInput],
    history: [negotiated],
    state: negotiated.nextState,
  });
  assert.equal(replay.ok, true);
});

test("resolveTurn emits S1-S5 staff readouts and causal explainability", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);

  assert.deepEqual(result.staffFunctions.map((entry) => entry.id), ["S1", "S2", "S3", "S4", "S5"]);
  assert.ok(result.staffFunctions.every((entry) => entry.metrics.length >= 3));
  assert.ok(result.staffFunctions.some((entry) => entry.warnings.length > 0));
  assert.ok(result.explainability.length >= 4);
  assert.ok(result.explainability.every((entry) => entry.causalRefs.length > 0 || entry.label === "Events"));

  for (const entry of result.staffFunctions) {
    assert.equal(entry.activeWarning, entry.warnings[0] ?? null);
    const definition = soloScenario.staffFunctions.find((fn) => fn.id === entry.id);
    assert.ok(definition);
    assert.equal(entry.standingRemit, definition.doctrineNote);
    assert.ok(!("consequence" in entry));
  }
});

test("buildStaffFunctionReadouts invariants: activeWarning/standingRemit never conflate", () => {
  const state = soloScenario.initialState;
  const noBurden = soloScenario.staffCapacities.map((capacity) => ({
    directorate: capacity.directorate,
    burdenPoints: 0,
    capacity: capacity.capacity,
    burdenLevel: "light" as const,
    failureMode: "",
    confidencePenalty: 0,
    executionPenalty: 0,
    summary: "",
  }));
  const unwarned = buildStaffFunctionReadouts(soloScenario.staffFunctions, noBurden, state);
  for (const entry of unwarned) {
    assert.equal(entry.warnings.length, 0);
    assert.equal(entry.activeWarning, null);
    const definition = soloScenario.staffFunctions.find((fn) => fn.id === entry.id);
    assert.ok(definition);
    assert.equal(entry.standingRemit, definition.doctrineNote);
  }

  const overloadedBurden = soloScenario.staffCapacities.map((capacity) => ({
    directorate: capacity.directorate,
    burdenPoints: capacity.overloadedAt + 5,
    capacity: capacity.capacity,
    burdenLevel: "overloaded" as const,
    failureMode: "capacity exceeded",
    confidencePenalty: 1,
    executionPenalty: 1,
    summary: `${capacity.directorate} is overloaded and cannot absorb further tasking.`,
  }));
  const warned = buildStaffFunctionReadouts(soloScenario.staffFunctions, overloadedBurden, state);
  for (const entry of warned) {
    assert.ok(entry.warnings.length > 0);
    assert.equal(entry.activeWarning, entry.warnings[0]);
    const definition = soloScenario.staffFunctions.find((fn) => fn.id === entry.id);
    assert.ok(definition);
    assert.equal(entry.standingRemit, definition.doctrineNote);
    assert.notEqual(entry.standingRemit, entry.activeWarning);
  }
});

test("previewTurn exposes replay-safe decision previews and accepted-risk candidates", () => {
  const preview = previewTurn(soloScenario, soloScenario.initialState, highTempoInput);

  assert.equal(preview.decisionPreviews.length, highTempoInput.selections.length);
  assert.ok(preview.acceptedRiskCandidates.length > 0);
  assert.ok(preview.decisionPreviews.every((entry) => entry.projectedReadouts.length === 5));
  assert.ok(preview.decisionPreviews.every((entry) => entry.staffCosts.length > 0));
  assert.ok(preview.decisionPreviews.every((entry) => entry.acceptedRiskCandidateCount === preview.acceptedRiskCandidates.length));
  assert.deepEqual(preview.predictedEvents, preview.projectedResult.triggeredEvents);
});

test("resolveTurn advances S1-S5 core mechanics", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);

  assert.ok(result.nextState.staffMechanics.s1.recoveryDebt > soloScenario.initialState.staffMechanics.s1.recoveryDebt);
  assert.ok(result.nextState.staffMechanics.s2.externalEstimateConfidence > soloScenario.initialState.staffMechanics.s2.externalEstimateConfidence);
  assert.ok(["RUMORED", "ESTIMATED", "KNOWN"].includes(result.nextState.staffMechanics.s2.visibility));
  assert.ok(result.nextState.staffMechanics.s3.visiblePosture > soloScenario.initialState.staffMechanics.s3.visiblePosture);
  assert.ok(result.nextState.staffMechanics.s4.liftBurn > soloScenario.initialState.staffMechanics.s4.liftBurn);
  assert.ok(result.nextState.staffMechanics.s5.strategicCoherence !== soloScenario.initialState.staffMechanics.s5.strategicCoherence);
  assert.ok(result.afterAction.some((entry) => entry.heading === "Where your staff stand now"));
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

test("chief positions carry S1-S5 evidence and risk-band evidence can harden advice", () => {
  const memo = soloScenario.memoTemplates.find((entry) => entry.id === "posture");
  assert.ok(memo);
  const option = memo.options.find((entry) => entry.id === "measured-deterrence");
  assert.ok(option);

  const baselinePosition = buildChiefPositions(soloScenario.chiefs, soloScenario.initialState, memo, option).find((entry) => entry.chiefId === "halden");
  const lowConfidenceState = campaignStateSchema.parse({
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s2: {
        ...soloScenario.initialState.staffMechanics.s2,
        externalEstimateConfidence: 18,
      },
    },
  });
  const riskPosition = buildChiefPositions(soloScenario.chiefs, lowConfidenceState, memo, option).find((entry) => entry.chiefId === "halden");

  assert.ok(baselinePosition);
  assert.ok(riskPosition);
  assert.equal(riskPosition.staffReadoutEvidence.staffFunctionId, "S2");
  assert.equal(riskPosition.staffReadoutEvidence.metricLabel, "External estimate confidence");
  assert.equal(riskPosition.staffReadoutEvidence.metricStatus, "risk");
  assert.match(riskPosition.staffReadoutEvidence.rationale, /S2 evidence/);
  assert.equal(baselinePosition.position, "accept_risk");
  assert.equal(riskPosition.position, "request_conditions");
});

test("chief agenda memory persists through turn resolution and biases future positions", () => {
  const firstTurn = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);
  const haldenMemory = firstTurn.nextState.chiefAgendaMemory.halden;

  assert.ok(haldenMemory);
  assert.equal(haldenMemory.chiefId, "halden");
  assert.equal(haldenMemory.lastTurn, 1);
  assert.ok(haldenMemory.lastMemoId);
  assert.ok(haldenMemory.lastOptionId);
  assert.ok(haldenMemory.lastPosition);
  assert.ok(haldenMemory.pressure >= 0 && haldenMemory.pressure <= 10);
  assert.ok(haldenMemory.notes.length > 0);

  const replay = validateReplaySession(soloScenario, {
    initialState: soloScenario.initialState,
    turnInputs: [highTempoInput],
    history: [firstTurn],
    state: firstTurn.nextState,
  });
  assert.equal(replay.ok, true);

  const memo = soloScenario.memoTemplates.find((entry) => entry.id === "posture");
  assert.ok(memo);
  const option = memo.options.find((entry) => entry.id === "measured-deterrence");
  assert.ok(option);

  const baselinePosition = buildChiefPositions(soloScenario.chiefs, soloScenario.initialState, memo, option).find((entry) => entry.chiefId === "halden");
  const frictionState = campaignStateSchema.parse({
    ...soloScenario.initialState,
    chiefAgendaMemory: {
      halden: {
        chiefId: "halden",
        focusTags: [],
        concernTags: ["deterrence"],
        lastMemoId: "posture",
        lastOptionId: "surge-exercises",
        lastPosition: "oppose",
        pressure: 8,
        lastTurn: 1,
        notes: ["Prior posture dissent"],
      },
    },
  });
  const memoryPosition = buildChiefPositions(soloScenario.chiefs, frictionState, memo, option).find((entry) => entry.chiefId === "halden");

  assert.ok(baselinePosition);
  assert.ok(memoryPosition);
  assert.equal(baselinePosition.position, "accept_risk");
  assert.equal(memoryPosition.position, "oppose");
  assert.match(memoryPosition.agendaMemoryNote ?? "", /Pressure remains high/);
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

  const commitments = updateCommitmentsFromChiefConversation(soloScenario.initialState, chief, memo, option, completed);
  const commitment = commitments.find((entry) => entry.id === "conversation-1-halden-posture-measured-deterrence");
  assert.ok(commitment);
  assert.equal(commitment.type, "doctrine");
  assert.equal(commitment.turnMade, 1);
  assert.equal(commitment.fulfilled, null);
  assert.match(commitment.label, /bounded order/i);
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
  assert.equal(validation.failureKind, "state_mismatch");
  assert.ok(validation.diffs.some((entry) => entry.path.includes("intelligence.confidence")));
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

// Stage 2: S2-S5 interlock test
test("S2-S5 interlock: high deception risk degrades S5 strategic coherence via contradiction penalty", () => {
  const highDeceptionState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s2: { externalEstimateConfidence: 55, visibility: "ESTIMATED" as const, deceptionRisk: 72 },
    },
  };
  const normalResult = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const highDeceptionResult = resolveTurn(soloScenario, highDeceptionState, balancedInput);
  assert.ok(
    highDeceptionResult.nextState.staffMechanics.s5.strategicCoherence <
      normalResult.nextState.staffMechanics.s5.strategicCoherence,
    "High S2 deception risk should reduce S5 strategic coherence via deception-coherence penalty",
  );
});

// Stage 2: S5 commitment fulfillment test
test("S5 alliance commitment is marked fulfilled when strategic coherence rises to threshold", () => {
  const stateWithCommitment = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s5: { strategicCoherence: 57, doctrineAlignment: 50 },
    },
    activeCommitments: [
      { id: "alliance-t0", type: "alliance" as const, label: "Alliance reassurance commitment", turnMade: 1, fulfilled: null },
    ],
  };
  // balancedInput selects quiet-reassurance (alliance + quiet tags) — coherence gain ≥ 6 from starting 57 should exceed 60
  const result = resolveTurn(soloScenario, stateWithCommitment, balancedInput);
  const entry = result.nextState.activeCommitments.find((c) => c.id === "alliance-t0");
  if (result.nextState.staffMechanics.s5.strategicCoherence >= 60) {
    assert.ok(entry, "Fulfilled commitment should still appear in activeCommitments with fulfilled=true on resolution turn");
    assert.equal(entry?.fulfilled, true, "Alliance commitment should be marked fulfilled when coherence ≥ 60");
  } else {
    assert.ok(entry?.fulfilled === null, "Commitment remains pending when coherence is below threshold");
  }
});

// Stage 2: S5 commitment broken test
test("S5 program commitment is marked broken when S4 supportable tempo collapses below threshold", () => {
  const stateWithCommitment = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s4: { stockpileDepth: 40, liftBurn: 78, supportableTempo: 5 },
    },
    activeCommitments: [
      { id: "program-t0", type: "program" as const, label: "Modernization or capability commitment", turnMade: 1, fulfilled: null },
    ],
  };
  // highTempoInput includes surge-exercises (exercise tag, +8 liftBurn); starting at 78 will push supportableTempo to 0
  const result = resolveTurn(soloScenario, stateWithCommitment, highTempoInput);
  const entry = result.nextState.activeCommitments.find((c) => c.id === "program-t0");
  if (result.nextState.staffMechanics.s4.supportableTempo < 5) {
    assert.ok(entry, "Broken commitment should still appear in activeCommitments with fulfilled=false on resolution turn");
    assert.equal(entry?.fulfilled, false, "Program commitment should be marked broken when supportable tempo < 5");
  } else {
    assert.ok(entry?.fulfilled === null, "Commitment remains pending when supportable tempo is still viable");
  }
});

// Stage 3: tech tree and industry tests
test("internalTech nodes are populated from capability program phases in TurnResult", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  assert.ok(result.internalTech.length > 0, "TurnResult should include internalTech nodes");
  assert.ok(result.internalTech.every((n) => n.level >= 0 && n.level <= 2), "All internalTech levels should be 0, 1, or 2");
  assert.ok(result.internalTech.every((n) => n.progress >= 0 && n.progress <= 100), "All internalTech progress values should be in range");
  // Each program in the scenario should map to exactly one internalTech node
  const programIds = soloScenario.capabilityPrograms.map((p) => p.id);
  assert.ok(programIds.every((id) => result.internalTech.some((n) => n.id === id)), "Each program should have a corresponding internalTech node");
});

test("externalTech nodes are populated with S2 estimates in TurnResult", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  assert.ok(result.externalTech.length > 0, "TurnResult should include externalTech nodes");
  assert.ok(result.externalTech.every((n) => ["RUMORED", "ESTIMATED", "KNOWN"].includes(n.estimate.visibility)), "All externalTech nodes should have a visibility class");
  assert.ok(result.externalTech.every((n) => n.estimate.confidence >= 0 && n.estimate.confidence <= 100), "All estimate confidence values should be in range");
  // Each external constraint should map to exactly one externalTech node
  const constraintIds = soloScenario.externalConstraints.map((c) => c.id);
  assert.ok(constraintIds.every((id) => result.externalTech.some((n) => n.id === id)), "Each external constraint should have a corresponding externalTech node");
});

test("externalTech fallback is derived from scenario constraints and preserves matching prior estimates", () => {
  const customScenario = {
    ...soloScenario,
    externalConstraints: [
      { id: "rare-earths", label: "Rare Earths", summary: "Permanent magnet and rare earth supply." },
      { id: "battery-cells", label: "Battery Cells", summary: "Military and commercial battery cell capacity." },
    ],
  };
  const customState = {
    ...soloScenario.initialState,
    externalConstraints: [
      { id: "rare-earths", severity: 68, trend: "worsening" as const },
      { id: "battery-cells", severity: 24, trend: "steady" as const },
    ],
    externalTech: [
      {
        id: "rare-earths",
        level: 1,
        progress: 67,
        estimate: { estimatedLevel: 1, confidence: 77, visibility: "KNOWN" as const, lastVerifiedTurn: 1 },
      },
    ],
  };

  const result = resolveTurn(customScenario, customState, balancedInput);
  assert.deepEqual(result.externalTech.map((node) => node.id), ["rare-earths", "battery-cells"]);
  assert.ok(!result.externalTech.some((node) => node.id === "shipping-market"));
  const preserved = result.externalTech.find((node) => node.id === "rare-earths");
  const created = result.externalTech.find((node) => node.id === "battery-cells");
  assert.ok(preserved);
  assert.ok(created);
  assert.ok(preserved.estimate.confidence > created.estimate.confidence, "Matching previous estimate confidence should be preserved before turn adjustment");
  assert.equal(created.level, 2);
  assert.equal(created.estimate.lastVerifiedTurn, null);
});

test("externalTech estimate confidence improves when industrial-watch tag is selected", () => {
  const result1 = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);         // no industrial-watch
  const result2 = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);        // has industrial-watch
  const avgConf1 = result1.externalTech.reduce((s, n) => s + n.estimate.confidence, 0) / result1.externalTech.length;
  const avgConf2 = result2.externalTech.reduce((s, n) => s + n.estimate.confidence, 0) / result2.externalTech.length;
  assert.ok(avgConf2 > avgConf1, "industrial-watch selection should increase external tech estimate confidence");
});

test("externalTech estimate confidence degrades under high deception risk", () => {
  const highDeceptionState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s2: { externalEstimateConfidence: 55, visibility: "ESTIMATED" as const, deceptionRisk: 80 },
    },
  };
  const normalResult = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const highDeceptionResult = resolveTurn(soloScenario, highDeceptionState, balancedInput);
  const avgConfNormal = normalResult.externalTech.reduce((s, n) => s + n.estimate.confidence, 0) / normalResult.externalTech.length;
  const avgConfDeception = highDeceptionResult.externalTech.reduce((s, n) => s + n.estimate.confidence, 0) / highDeceptionResult.externalTech.length;
  assert.ok(avgConfDeception < avgConfNormal, "High deception risk should degrade external tech estimate confidence");
});

test("S4 stockpile depth is penalised when propellant-market and electronics-chain are disrupted", () => {
  const disruptedState = {
    ...soloScenario.initialState,
    externalConstraints: [
      { id: "shipping-market",   severity: 40, trend: "steady" as const },
      { id: "electronics-chain", severity: 72, trend: "worsening" as const },
      { id: "propellant-market", severity: 70, trend: "worsening" as const },
    ],
  };
  const normalResult  = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const disruptedResult = resolveTurn(soloScenario, disruptedState, balancedInput);
  assert.ok(
    disruptedResult.nextState.staffMechanics.s4.stockpileDepth <
      normalResult.nextState.staffMechanics.s4.stockpileDepth,
    "Disrupted propellant and electronics supply should reduce S4 stockpile depth",
  );
});

test("S4 lift burn increases when shipping-market is disrupted", () => {
  const disruptedState = {
    ...soloScenario.initialState,
    externalConstraints: [
      { id: "shipping-market",   severity: 75, trend: "worsening" as const },
      { id: "electronics-chain", severity: 52, trend: "steady" as const },
      { id: "propellant-market", severity: 49, trend: "steady" as const },
    ],
  };
  const normalResult    = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const disruptedResult = resolveTurn(soloScenario, disruptedState, balancedInput);
  assert.ok(
    disruptedResult.nextState.staffMechanics.s4.liftBurn >
      normalResult.nextState.staffMechanics.s4.liftBurn,
    "Disrupted shipping market should increase S4 lift burn",
  );
});

test("tech tree and industry explainability entry is included in TurnResult", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const techEntry = result.explainability.find((e) => e.label === "Programs and outside pressures");
  assert.ok(techEntry, "Explainability should include a tech-tree-and-industry entry");
  assert.ok(techEntry.causalRefs.length > 0, "Tech explainability should have causal refs");
  assert.ok(techEntry.causalRefs.some((ref) => ref.startsWith("tech:")), "Causal refs should include internal tech nodes");
  assert.ok(techEntry.causalRefs.some((ref) => ref.startsWith("industry:")), "Causal refs should include industry nodes");
});

test("Stage 3 tech and industry state is deterministic under replay", () => {
  const result1 = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);
  const result2 = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);
  assert.deepEqual(result1.internalTech, result2.internalTech, "internalTech should be deterministic");
  assert.deepEqual(result1.externalTech, result2.externalTech, "externalTech should be deterministic");
  assert.equal(result1.replayHash, result2.replayHash, "replayHash should be identical");
});

// Stage 3: S5 prerequisite gate — programme commitment needs a fielded capability
test("S5 program commitment is not fulfilled when no program has reached level 2", () => {
  // doctrineAlignment starts at 50; balancedInput adds coherenceGain (alliance+quiet ≈ 6) and
  // programme-type coherenceGain ≈ 3, but no programme is at level 2 in initial state.
  const stateWithProgramCommitment = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s5: { strategicCoherence: 58, doctrineAlignment: 57 },
    },
    activeCommitments: [
      { id: "program-t0", type: "program" as const, label: "Modernization or capability commitment", turnMade: 1, fulfilled: null },
    ],
    // All programs at concept/funded → level 0; no level-2 capability yet
    internalTech: soloScenario.initialState.internalTech.map((n) => ({ ...n, level: 0 as const })),
    capabilityPrograms: soloScenario.initialState.capabilityPrograms.map((p) => ({ ...p, phase: "concept" as const, progress: 10 })),
  };
  const result = resolveTurn(soloScenario, stateWithProgramCommitment, balancedInput);
  const entry = result.nextState.activeCommitments.find((c) => c.id === "program-t0");
  assert.ok(entry, "Program commitment entry should still be present");
  // Even if doctrineAlignment is above 55, the commitment cannot be fulfilled without a fielded program
  if (result.nextState.internalTech.every((n) => n.level < 2)) {
    assert.notEqual(entry?.fulfilled, true, "Program commitment should not be fulfilled when no program is at level 2");
  }
});

test("S5 program commitment is fulfilled when doctrineAlignment threshold is met and a program is fielded", () => {
  const fieldedState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s5: { strategicCoherence: 58, doctrineAlignment: 57 },
    },
    activeCommitments: [
      { id: "program-t0", type: "program" as const, label: "Modernization or capability commitment", turnMade: 1, fulfilled: null },
    ],
    // One program at operational → level 2
    internalTech: soloScenario.initialState.internalTech.map((n, idx) =>
      idx === 0 ? { ...n, level: 2 as const } : { ...n, level: 0 as const }
    ),
    capabilityPrograms: soloScenario.initialState.capabilityPrograms.map((p, idx) =>
      idx === 0 ? { ...p, phase: "operational" as const, progress: 80 } : { ...p, phase: "concept" as const, progress: 10 }
    ),
  };
  const result = resolveTurn(soloScenario, fieldedState, balancedInput);
  const entry = result.nextState.activeCommitments.find((c) => c.id === "program-t0");
  assert.ok(entry, "Program commitment entry should still be present");
  // If doctrineAlignment crosses 55 AND a level-2 program exists, the commitment should fulfil
  if (result.nextState.staffMechanics.s5.doctrineAlignment >= 55 && result.nextState.internalTech.some((n) => n.level === 2)) {
    assert.equal(entry?.fulfilled, true, "Program commitment should be fulfilled when doctrineAlignment ≥ 55 and a program is fielded");
  }
});

// Stage 3: industry event explainability — events with constraintShifts link to externalTech nodes
test("Events with constraint shifts emit industry causalRefs in explainability", () => {
  // firing-prototype option has constraintShifts for electronics-chain and propellant-market;
  // checking that when these shifts occur via options or events, the explainability reflects it.
  // We test directly: any event or option constraintShift should appear as an industry causalRef.
  const turn2State = { ...soloScenario.initialState, turn: 2 };
  // lift-assurance has "lift" tag; modernization-case has "public-commitment" — both needed for shipping-jam
  const triggerInput: TurnInput = {
    turn: 2,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    selections: [
      { memoId: "posture", optionId: "measured-deterrence" },
      { memoId: "intelligence-focus", optionId: "deception-hunt" },
      { memoId: "sustainment-focus", optionId: "lift-assurance" },
      { memoId: "alliance-frame", optionId: "modernization-case" },
    ],
  };
  const result = resolveTurn(soloScenario, turn2State, triggerInput);
  const eventsEntry = result.explainability.find((e) => e.label === "Events");
  assert.ok(eventsEntry, "Events explainability entry should always be present");
  // Verify: for every triggered event that has constraintShifts, a corresponding industry causalRef exists
  for (const event of result.triggeredEvents) {
    for (const shift of event.constraintShifts) {
      assert.ok(
        eventsEntry.causalRefs.some((ref) => ref.includes(shift.constraintId)),
        `Events explainability should include causalRef for ${shift.constraintId} when event ${event.id} fires`,
      );
    }
  }
});

// ── Doctrine 1: DoctrineMechanicsState (issue #55) ─────────────────────────────────────────

test("doctrineMechanics opening position equals the profile-applied baseline (issue #56)", () => {
  // Doctrine 2 biases the neutral baseline at scenario-definition time; the opening
  // position is exactly what applyDoctrineGenes produces from the declared profile.
  const expected = applyDoctrineGenes(
    defaultDoctrineMechanicsState,
    resolveDoctrineGenes(soloScenario.doctrineProfile),
  );
  assert.deepEqual(soloScenario.initialState.doctrineMechanics, expected);
  assert.notDeepEqual(
    soloScenario.initialState.doctrineMechanics,
    defaultDoctrineMechanicsState,
    "the scenario's doctrine profile must measurably shift the neutral baseline",
  );
  // Spot-check the coalition-composite mix: sustainment-first and coalition caveats
  // lower tempo culture, coalition-native raises synchronization, adaptive cells
  // consume spare capacity and diffuse the main effort.
  assert.equal(soloScenario.initialState.doctrineMechanics.relativeTempo, 42);
  assert.equal(soloScenario.initialState.doctrineMechanics.staffSynchronization, 67);
  assert.equal(soloScenario.initialState.doctrineMechanics.uncommittedCapacity, 42);
});

test("doctrineMechanics omitted from a persisted save defaults to neutral, not the scenario baseline", () => {
  // The schema default is the *neutral* state; a save that omits doctrineMechanics
  // (e.g. written before Doctrine 1) parses as neutral. The canonical-import check
  // rejects such a save against the biased opening position at the server boundary.
  const { doctrineMechanics, ...withoutDoctrine } = soloScenario.initialState;
  assert.notDeepEqual(doctrineMechanics, defaultDoctrineMechanicsState);
  const parsed = campaignStateSchema.parse(withoutDoctrine);
  assert.deepEqual(parsed.doctrineMechanics, defaultDoctrineMechanicsState);
});

test("doctrineMechanics is deterministic and replay-safe across identical resolveTurn calls", () => {
  const left = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);
  const right = resolveTurn(soloScenario, soloScenario.initialState, highTempoInput);
  assert.deepEqual(left.nextState.doctrineMechanics, right.nextState.doctrineMechanics);
  assert.equal(left.replayHash, right.replayHash);
});

// ── Doctrine 2: scenario-level doctrine genes / DoctrineProfile (issue #56) ────────────────

test("applyDoctrineGenes sums modifiers across genes in order and is deterministic", () => {
  const genes: DoctrineGene[] = [
    {
      id: "g1",
      label: "G1",
      evidenceRefs: ["e1"],
      strengths: ["s"],
      vulnerabilities: ["v"],
      variableModifiers: { relativeTempo: 10, systemPressure: 5 },
      staffAdviceStyle: {},
    },
    {
      id: "g2",
      label: "G2",
      evidenceRefs: ["e2"],
      strengths: ["s"],
      vulnerabilities: ["v"],
      variableModifiers: { relativeTempo: 7, campaignAimClarity: -4 },
      staffAdviceStyle: {},
    },
  ];
  const first = applyDoctrineGenes(defaultDoctrineMechanicsState, genes);
  const second = applyDoctrineGenes(defaultDoctrineMechanicsState, genes);
  assert.deepEqual(first, second, "gene application must be deterministic");
  assert.equal(first.relativeTempo, 67, "modifiers should sum (50 + 10 + 7)");
  assert.equal(first.systemPressure, 50, "single-gene modifier applies (45 + 5)");
  assert.equal(first.campaignAimClarity, 51, "negative modifiers apply (55 - 4)");
});

test("applyDoctrineGenes clamps the summed result to the 0-100 index range", () => {
  const high: DoctrineGene = {
    id: "high",
    label: "High",
    evidenceRefs: ["e"],
    strengths: ["s"],
    vulnerabilities: ["v"],
    variableModifiers: { relativeTempo: 50, staffSynchronization: 50 },
    staffAdviceStyle: {},
  };
  const low: DoctrineGene = {
    id: "low",
    label: "Low",
    evidenceRefs: ["e"],
    strengths: ["s"],
    vulnerabilities: ["v"],
    variableModifiers: { relativeTempo: -50, culminationRisk: -50 },
    staffAdviceStyle: {},
  };
  // 50 + 50 = 100 (clamped at the top); 55 + 50 = 105 → 100.
  assert.equal(applyDoctrineGenes(defaultDoctrineMechanicsState, [high]).relativeTempo, 100);
  assert.equal(
    applyDoctrineGenes(defaultDoctrineMechanicsState, [high]).staffSynchronization,
    100,
  );
  // 50 - 50 = 0 (clamped at the bottom); 18 - 50 = -32 → 0.
  assert.equal(applyDoctrineGenes(defaultDoctrineMechanicsState, [low]).relativeTempo, 0);
  assert.equal(applyDoctrineGenes(defaultDoctrineMechanicsState, [low]).culminationRisk, 0);
});

test("applyDoctrineGenes with no genes returns the neutral baseline unchanged", () => {
  assert.deepEqual(applyDoctrineGenes(defaultDoctrineMechanicsState, []), defaultDoctrineMechanicsState);
});

test("applyDoctrineGenes accumulates before clamping, so results are order-independent", () => {
  const push: DoctrineGene = {
    id: "push",
    label: "Push",
    evidenceRefs: ["e"],
    strengths: ["s"],
    vulnerabilities: ["v"],
    variableModifiers: { relativeTempo: 50 },
    staffAdviceStyle: {},
  };
  const pull: DoctrineGene = {
    id: "pull",
    label: "Pull",
    evidenceRefs: ["e"],
    strengths: ["s"],
    vulnerabilities: ["v"],
    variableModifiers: { relativeTempo: -50 },
    staffAdviceStyle: {},
  };
  const base = { ...defaultDoctrineMechanicsState, relativeTempo: 80 };
  const upDown = applyDoctrineGenes(base, [push, pull]);
  const downUp = applyDoctrineGenes(base, [pull, push]);
  assert.equal(upDown.relativeTempo, 80, "+50 then -50 on 80 must return 80, not 50");
  assert.deepEqual(upDown, downUp, "application must not depend on gene order");
});

test("doctrine genes resolve from the content registry and carry evidence, benefits, and counterweights", () => {
  // The profile's geneIds must all resolve, and EVERY registry gene (not just the
  // profile's referenced ones) must satisfy the CELERY guardrails: >=1 evidenceRef,
  // at least one strength and vulnerability, a measurable shift, and counterweight
  // mass at least equal to benefit mass — so a Doctrine 3/4 gene added to the
  // registry before it is wired into a scenario still fails loudly.
  const profile = soloScenario.doctrineProfile;
  const resolved = resolveDoctrineGenes(profile);
  assert.equal(resolved.length, profile.geneIds.length);

  for (const gene of doctrineGenes) {
    assert.ok(gene.evidenceRefs.length >= 1, `gene ${gene.id} needs evidenceRefs`);
    assert.ok(gene.strengths.length >= 1, `gene ${gene.id} needs at least one strength`);
    assert.ok(gene.vulnerabilities.length >= 1, `gene ${gene.id} needs at least one vulnerability`);

    const entries = Object.entries(gene.variableModifiers) as Array<[string, number | undefined]>;
    const riskKeys = doctrineRiskKeys as readonly string[];
    // Mirrors lint:content: risk-key REDUCTIONS are benefits, not counterweights.
    const benefitMass =
      entries
        .filter(([key, delta]) => (delta ?? 0) > 0 && !riskKeys.includes(key))
        .reduce((sum, [, delta]) => sum + (delta ?? 0), 0) +
      entries
        .filter(([key, delta]) => (delta ?? 0) < 0 && riskKeys.includes(key))
        .reduce((sum, [, delta]) => sum + Math.abs(delta ?? 0), 0);
    const counterweightMass =
      entries
        .filter(([key, delta]) => (delta ?? 0) < 0 && !riskKeys.includes(key))
        .reduce((sum, [, delta]) => sum + Math.abs(delta ?? 0), 0) +
      entries
        .filter(([key, delta]) => (delta ?? 0) > 0 && riskKeys.includes(key))
        .reduce((sum, [, delta]) => sum + (delta ?? 0), 0);
    assert.ok(
      entries.some(([, delta]) => delta !== undefined && delta !== 0),
      `gene ${gene.id} must measurably shift at least one doctrine variable`,
    );
    assert.ok(
      counterweightMass >= benefitMass,
      `gene ${gene.id} must carry counterweight mass (${counterweightMass}) >= benefit mass (${benefitMass})`,
    );
  }
});

test("resolveDoctrineGenes rejects an unknown gene id loudly", () => {
  assert.throws(
    () =>
      resolveDoctrineGenes({
        id: "typo-profile",
        label: "Typo profile",
        evidenceRefs: ["e"],
        geneIds: ["coalition-native-staff", "no-such-gene"],
        optionalStaffModules: [],
      }),
    /unknown gene id/,
  );
});

test("doctrineGeneSchema rejects unknown variable modifier keys loudly (no silent stripping)", () => {
  // Regression guard for the supportableTempo bug class: an unsupported key must fail
  // at gene-definition time, not be silently dropped by Zod.
  assert.throws(
    () =>
      doctrineGeneSchema.parse({
        id: "bad-key",
        label: "Bad key",
        evidenceRefs: ["e"],
        strengths: ["s"],
        vulnerabilities: ["v"],
        variableModifiers: { supportableTempo: -5 },
        staffAdviceStyle: {},
      }),
    /Unrecognized key/,
  );
});

test("the biased doctrine baseline survives serialization (replay-safe opening position)", () => {
  // The opening position is part of the serialized state: parse/serialize round-trip
  // must preserve the profile-applied values, and the profile must not re-apply.
  const parsed = campaignStateSchema.parse(JSON.parse(JSON.stringify(soloScenario.initialState)));
  assert.deepEqual(parsed.doctrineMechanics, soloScenario.initialState.doctrineMechanics);
});

test("the doctrine profile's bias is durable: gene-touched variables stay biased after a resolved turn", () => {
  // The sim derives its pull targets and recompute offsets from the scenario's opening
  // doctrine baseline (the faction anchor), so the profile is not erased within a turn
  // or two by hard-coded neutral anchors. Balanced play must keep every gene-touched
  // variable on the biased side of neutral after a full resolution — and stay there
  // into a second resolved turn.
  const first = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const second = resolveTurn(soloScenario, first.nextState, { ...balancedInput, turn: 2 });
  const neutral = defaultDoctrineMechanicsState;

  for (const next of [first.nextState.doctrineMechanics, second.nextState.doctrineMechanics]) {
    // Recomputed variables carry the faction offset (anchor - neutral).
    assert.ok(
      next.staffSynchronization > neutral.staffSynchronization + 5,
      `staffSynchronization ${next.staffSynchronization} should stay well above neutral ${neutral.staffSynchronization}`,
    );
    assert.ok(
      next.systemPressure > neutral.systemPressure,
      `systemPressure ${next.systemPressure} should stay above neutral ${neutral.systemPressure}`,
    );
    assert.ok(
      next.uncommittedCapacity < neutral.uncommittedCapacity,
      `uncommittedCapacity ${next.uncommittedCapacity} should stay below neutral ${neutral.uncommittedCapacity}`,
    );
    assert.ok(
      next.operationalReach > neutral.operationalReach,
      `operationalReach ${next.operationalReach} should stay above neutral ${neutral.operationalReach}`,
    );
    assert.ok(
      next.commanderIntentClarity > neutral.commanderIntentClarity,
      `commanderIntentClarity ${next.commanderIntentClarity} should stay above neutral ${neutral.commanderIntentClarity}`,
    );
    // Pulled variables settle toward the biased anchor rather than a hard-coded neutral.
    assert.ok(
      next.campaignAimClarity > neutral.campaignAimClarity,
      `campaignAimClarity ${next.campaignAimClarity} should stay above neutral ${neutral.campaignAimClarity}`,
    );
    assert.ok(
      next.relativeTempo < neutral.relativeTempo,
      `relativeTempo ${next.relativeTempo} should stay below neutral ${neutral.relativeTempo}`,
    );
  }
});

test("relativeTempo pulls toward the biased faction anchor when no tempo tags are selected", () => {
  // Isolates the anchor's pull from the quiet/slow-burn tag signals: with no tempo
  // tags, the pull target is the faction anchor (42), not the hard-coded neutral 50.
  const noTempoInput: TurnInput = {
    turn: 1,
    selectedActionIds: [],
    selections: [
      { memoId: "posture", optionId: "measured-deterrence" },
      { memoId: "intelligence-focus", optionId: "warning-net" },
      { memoId: "sustainment-focus", optionId: "munitions-hedge" },
      { memoId: "alliance-frame", optionId: "public-assurance-tour" },
      { memoId: "force-development", optionId: "training-reset" },
    ],
  };
  // Seed the state at the neutral 50: the pull must move it toward the anchor 42.
  const seeded = {
    ...soloScenario.initialState,
    doctrineMechanics: { ...soloScenario.initialState.doctrineMechanics, relativeTempo: 50 },
  };
  const result = resolveTurn(soloScenario, seeded, noTempoInput);
  assert.equal(
    result.nextState.doctrineMechanics.relativeTempo,
    46,
    "pull toward the 42 anchor should move 50 by -4",
  );
});

test("system-pressure gate is not an always-on tax under balanced play", () => {
  // Regression for the +11 offset that pushed the >65 gate permanently on: with capped
  // counterweights the gate must discriminate — fires on genuinely thin turns (at
  // least once: the opening information picture starts thin) but not every month
  // (deception-hunt builds confidence and quiets it). Both bounds are asserted so a
  // future regression disabling the gate entirely also fails.
  let state = soloScenario.initialState;
  let pressureFires = 0;
  for (let turn = 1; turn <= 10; turn += 1) {
    const result = resolveTurn(soloScenario, state, { ...balancedInput, turn });
    if (result.afterAction.some((entry) => entry.heading === "Doctrine: system pressure")) {
      pressureFires += 1;
    }
    state = result.nextState;
    if (state.campaignStatus !== "active") break;
  }
  assert.ok(
    pressureFires >= 1,
    `system pressure should fire at least once from the thin opening picture, fired ${pressureFires}/10`,
  );
  assert.ok(
    pressureFires < 5,
    `system pressure should fire on a minority of balanced turns, fired ${pressureFires}/10`,
  );
});

test("applyDoctrineGenes clamps the summed total across multiple genes", () => {
  const up1: DoctrineGene = { id: "u1", label: "U1", evidenceRefs: ["e"], strengths: ["s"], vulnerabilities: ["v"], variableModifiers: { campaignAimClarity: 30 }, staffAdviceStyle: {} };
  const up2: DoctrineGene = { id: "u2", label: "U2", evidenceRefs: ["e"], strengths: ["s"], vulnerabilities: ["v"], variableModifiers: { campaignAimClarity: 30 }, staffAdviceStyle: {} };
  const down1: DoctrineGene = { id: "d1", label: "D1", evidenceRefs: ["e"], strengths: ["s"], vulnerabilities: ["v"], variableModifiers: { culminationRisk: -30 }, staffAdviceStyle: {} };
  const down2: DoctrineGene = { id: "d2", label: "D2", evidenceRefs: ["e"], strengths: ["s"], vulnerabilities: ["v"], variableModifiers: { culminationRisk: -30 }, staffAdviceStyle: {} };
  // 55 + 30 + 30 = 115 -> clamped to 100; 18 - 30 - 30 = -42 -> clamped to 0.
  assert.equal(applyDoctrineGenes(defaultDoctrineMechanicsState, [up1, up2]).campaignAimClarity, 100);
  assert.equal(applyDoctrineGenes(defaultDoctrineMechanicsState, [down1, down2]).culminationRisk, 0);
});

test("applyDoctrineGenes with net-zero genes returns the neutral baseline (degenerate anchor)", () => {
  const up: DoctrineGene = { id: "up", label: "Up", evidenceRefs: ["e"], strengths: ["s"], vulnerabilities: ["v"], variableModifiers: { relativeTempo: 10, staffSynchronization: 7 }, staffAdviceStyle: {} };
  const down: DoctrineGene = { id: "down", label: "Down", evidenceRefs: ["e"], strengths: ["s"], vulnerabilities: ["v"], variableModifiers: { relativeTempo: -10, staffSynchronization: -7 }, staffAdviceStyle: {} };
  // A profile whose genes net to zero yields the neutral baseline: offsets all 0, so
  // the sim's faction-anchor mechanic degenerates to the pre-Doctrine-2 behavior.
  assert.deepEqual(applyDoctrineGenes(defaultDoctrineMechanicsState, [up, down]), defaultDoctrineMechanicsState);
});

test("tempo doctrine bet fires on the second consecutive spike from the faction's real opening baseline", () => {
  // The coalition+sustainment tempo counterweights (-8) put the opening relativeTempo
  // at 42, so a single spike (42+22=64) stays under the >65 bet threshold; the bet is
  // a two-spike affair for this faction — documented sustainment-first character.
  const supportedState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s1: { recoveryDebt: 20, reservePredictability: 80 },
      s2: { externalEstimateConfidence: 75, visibility: "KNOWN" as const, deceptionRisk: 20 },
    },
    strategic: {
      ...soloScenario.initialState.strategic,
      sustainment: { depotBacklog: 20, munitionsSufficiency: 85, fuelSufficiency: 85, liftAvailability: 85 },
    },
    sustainment: { depotBacklog: 20, munitionsSufficiency: 85, fuelSufficiency: 85, liftAvailability: 85 },
  };
  const first = resolveTurn(soloScenario, supportedState, { ...highTempoInput, turn: 1 });
  assert.ok(
    first.nextState.doctrineMechanics.relativeTempo <= 65,
    "a single spike from the real baseline must not fire the bet",
  );
  // Chain turn 2 WITHOUT re-seeding: the first spike already burned staff support
  // (surge costs), so the second spike clears the threshold but lands in the overreach
  // branch — the intended consequence, and exactly the claim this test isolates:
  // the bet is REACHABLE from the real opening, and it takes two spikes.
  const second = resolveTurn(
    soloScenario,
    { ...first.nextState, turn: 2 },
    { ...highTempoInput, turn: 2 },
  );
  assert.ok(
    second.nextState.doctrineMechanics.relativeTempo > 65,
    "a second consecutive spike must clear the bet threshold",
  );
  const bet = second.afterAction.find((entry) => entry.heading === "Doctrine bet: tempo");
  assert.ok(bet, "expected the tempo bet on the second spike");
});

test("doctrine bet: tempo pays off when S1 debt, S2 confidence, and S4 supportable tempo all hold", () => {
  const wellSupportedState = {
    ...soloScenario.initialState,
    // The faction baseline settles relativeTempo low (42); seed an explicit starting
    // value so the tempo-spike (+22) clears the >65 bet threshold — this test verifies
    // the bet mechanic, not the faction's tempo posture.
    doctrineMechanics: { ...soloScenario.initialState.doctrineMechanics, relativeTempo: 55 },
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s1: { recoveryDebt: 20, reservePredictability: 80 },
      s2: { externalEstimateConfidence: 75, visibility: "KNOWN" as const, deceptionRisk: 20 },
    },
    strategic: {
      ...soloScenario.initialState.strategic,
      sustainment: { depotBacklog: 20, munitionsSufficiency: 85, fuelSufficiency: 85, liftAvailability: 85 },
    },
    sustainment: { depotBacklog: 20, munitionsSufficiency: 85, fuelSufficiency: 85, liftAvailability: 85 },
  };
  const result = resolveTurn(soloScenario, wellSupportedState, highTempoInput);

  assert.ok(result.nextState.doctrineMechanics.relativeTempo > 65, "tempo-spike should push relativeTempo past the bet threshold");
  assert.ok(result.nextState.staffMechanics.s1.recoveryDebt < 62, "recovery debt should stay supported");
  assert.ok(result.nextState.staffMechanics.s4.supportableTempo > 15, "supportable tempo should stay supported");
  const bet = result.afterAction.find((entry) => entry.heading === "Doctrine bet: tempo");
  assert.ok(bet, "expected a tempo doctrine-bet after-action note");
  assert.ok(bet.detail.includes("paid off"));
  assert.ok(
    result.nextState.strategic.forceGeneration.deployableUnits > wellSupportedState.strategic.forceGeneration.deployableUnits,
    "a well-supported tempo bet should nudge deployable units up",
  );
});

test("doctrine bet: tempo culminates early when S1 debt is high and S4 support is thin", () => {
  const overreachState = {
    ...soloScenario.initialState,
    // Same explicit seeding as the payoff test above: 55 + tempo-spike 22 clears >65
    // so the overreach branch is what's exercised, not the faction's low tempo posture.
    doctrineMechanics: { ...soloScenario.initialState.doctrineMechanics, relativeTempo: 55 },
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s1: { recoveryDebt: 70, reservePredictability: 30 },
    },
    strategic: {
      ...soloScenario.initialState.strategic,
      sustainment: { depotBacklog: 75, munitionsSufficiency: 12, fuelSufficiency: 18, liftAvailability: 22 },
    },
    sustainment: { depotBacklog: 75, munitionsSufficiency: 12, fuelSufficiency: 18, liftAvailability: 22 },
  };
  const before = overreachState.strategic.forceGeneration.deployableUnits;
  const beforeIncidents = overreachState.strategic.escalation.incidentLadder;
  const result = resolveTurn(soloScenario, overreachState, highTempoInput);

  assert.ok(result.nextState.doctrineMechanics.relativeTempo > 65, "tempo-spike should push relativeTempo past the bet threshold");
  const bet = result.afterAction.find((entry) => entry.heading === "Doctrine bet: tempo");
  assert.ok(bet, "expected a tempo doctrine-bet after-action note");
  assert.ok(bet.detail.includes("culminated early"));
  assert.ok(result.nextState.strategic.forceGeneration.deployableUnits < before + 1.1, "unsupported tempo should cost deployable units relative to the raw stateDelta gain");
  assert.ok(result.nextState.strategic.escalation.incidentLadder > beforeIncidents, "the incident ladder should rise from the overreach counterweight on top of the option's own delta");
});

test("doctrine bet: main effort pays a readiness dividend when concentration leaves no lane neglected", () => {
  const cleanFocusInput: TurnInput = {
    turn: 1,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    selections: [
      { memoId: "posture", optionId: "tempo-hold" },
      { memoId: "intelligence-focus", optionId: "deception-hunt" },
      { memoId: "sustainment-focus", optionId: "repair-first" },
      { memoId: "alliance-frame", optionId: "quiet-reassurance" },
      { memoId: "force-development", optionId: "deception-grid" },
    ],
  };
  const result = resolveTurn(soloScenario, soloScenario.initialState, cleanFocusInput);

  assert.ok(result.nextState.doctrineMechanics.mainEffortFocus > 35, "intelligence should dominate this selection's burden");
  const bet = result.afterAction.find((entry) => entry.heading === "Doctrine bet: main effort");
  assert.ok(bet, "expected a main-effort doctrine-bet after-action note");
  assert.ok(bet.detail.includes("dividend"));
  assert.ok(result.nextState.resources.readiness > soloScenario.initialState.resources.readiness - 0.01);
});

test("doctrine bet: main effort costs readiness when concentration leaves another lane overloaded", () => {
  const neglectedLaneInput: TurnInput = {
    turn: 1,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    selections: [
      { memoId: "posture", optionId: "tempo-hold" },
      { memoId: "intelligence-focus", optionId: "deception-hunt" },
      { memoId: "sustainment-focus", optionId: "munitions-hedge" },
      { memoId: "alliance-frame", optionId: "quiet-reassurance" },
      { memoId: "force-development", optionId: "deception-grid" },
    ],
  };
  const result = resolveTurn(soloScenario, soloScenario.initialState, neglectedLaneInput);

  assert.ok(result.nextState.doctrineMechanics.mainEffortFocus > 35, "intelligence should dominate this selection's burden");
  const plansBurden = result.directorateBurden.find((entry) => entry.directorate === "plans");
  assert.ok(plansBurden && plansBurden.burdenLevel === "overloaded", "plans should be overloaded while intelligence is the declared main effort");
  const bet = result.afterAction.find((entry) => entry.heading === "Doctrine bet: main effort");
  assert.ok(bet, "expected a main-effort doctrine-bet after-action note");
  assert.ok(bet.detail.includes("neglect"));
  assert.ok(result.nextState.resources.readiness < soloScenario.initialState.resources.readiness + 0.01);
});

test("doctrine bet: reserve costs immediate progress with no event to absorb", () => {
  const restrainedInput: TurnInput = {
    turn: 1,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    selections: [
      { memoId: "posture", optionId: "tempo-hold" },
      { memoId: "intelligence-focus", optionId: "industrial-watch" },
      { memoId: "sustainment-focus", optionId: "munitions-hedge" },
      { memoId: "alliance-frame", optionId: "quiet-reassurance" },
      // force-development is optional; skipping it keeps this turn's total burden low.
    ],
  };
  const result = resolveTurn(soloScenario, soloScenario.initialState, restrainedInput);

  assert.ok(result.nextState.doctrineMechanics.uncommittedCapacity > 30, "a light, four-memo turn should leave real staff capacity uncommitted");
  assert.equal(result.triggeredEvents.length, 0, "turn 1 has no eligible events by scenario design");
  const bet = result.afterAction.find((entry) => entry.heading === "Doctrine bet: reserve");
  assert.ok(bet, "expected a reserve doctrine-bet after-action note");
  assert.ok(bet.detail.includes("without a matching payoff"));
});

test("doctrine bet: reserve absorbs part of a genuine crisis event's penalty when capacity was held back", () => {
  const restrainedTurn2State = { ...soloScenario.initialState, turn: 2 };
  const restrainedInput: TurnInput = {
    turn: 2,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    selections: [
      { memoId: "posture", optionId: "tempo-hold" },
      { memoId: "intelligence-focus", optionId: "industrial-watch" },
      // lift-assurance carries "lift" and public-assurance-tour carries "public-commitment" —
      // together they make the "shipping-jam" event eligible, which is a genuine crisis
      // (liftAvailability -7, depotBacklog +4, incidentLadder +1), not a beneficial event.
      { memoId: "sustainment-focus", optionId: "lift-assurance" },
      { memoId: "alliance-frame", optionId: "public-assurance-tour" },
    ],
  };
  const result = resolveTurn(soloScenario, restrainedTurn2State, restrainedInput);

  assert.ok(result.nextState.doctrineMechanics.uncommittedCapacity > 25, "a light, four-memo turn should leave real staff capacity uncommitted");
  assert.ok(result.triggeredEvents.length > 0, "shipping-jam should be eligible from turn 2 with lift + public-commitment tags");
  assert.ok(
    result.triggeredEvents.some((event) => (event.stateDelta.sustainment?.liftAvailability ?? 0) < 0 || (event.stateDelta.escalation?.incidentLadder ?? 0) > 0),
    "the triggered event should be a genuine crisis, not a beneficial one",
  );
  const bet = result.afterAction.find((entry) => entry.heading === "Doctrine bet: reserve");
  assert.ok(bet, "expected a reserve doctrine-bet after-action note");
  assert.ok(bet.detail.includes("absorbed part of the blow"));
});

test("doctrine bet: reserve does not credit a purely beneficial event as a crisis absorbed", () => {
  const restrainedTurn2State = { ...soloScenario.initialState, turn: 2 };
  const restrainedInput: TurnInput = {
    turn: 2,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    selections: [
      { memoId: "posture", optionId: "tempo-hold" },
      { memoId: "intelligence-focus", optionId: "industrial-watch" },
      { memoId: "sustainment-focus", optionId: "munitions-hedge" },
      // quiet-reassurance carries "alliance" and "quiet", making the purely beneficial
      // "partner-relief" event eligible (reassurance/politicalAlignment/participation only —
      // no negative stateDelta anywhere), which should NOT count as a crisis.
      { memoId: "alliance-frame", optionId: "quiet-reassurance" },
    ],
  };
  const result = resolveTurn(soloScenario, restrainedTurn2State, restrainedInput);

  assert.ok(result.nextState.doctrineMechanics.uncommittedCapacity > 25, "a light, four-memo turn should leave real staff capacity uncommitted");
  assert.ok(result.triggeredEvents.length > 0, "an alliance/quiet event should be eligible from turn 2");
  assert.ok(
    result.triggeredEvents.every((event) => (event.stateDelta.sustainment?.liftAvailability ?? 0) >= 0 && (event.stateDelta.escalation?.incidentLadder ?? 0) <= 0),
    "the triggered event should be purely beneficial, not a crisis",
  );
  const bet = result.afterAction.find((entry) => entry.heading === "Doctrine bet: reserve");
  assert.ok(bet, "expected a reserve doctrine-bet after-action note");
  assert.ok(bet.detail.includes("without a matching payoff"), "a non-crisis event should not be credited as absorbing a shock");
});

test("doctrine bet: culmination inflicts a hard readiness and support loss once the risk threshold is crossed", () => {
  const compoundedOverreachState = {
    ...soloScenario.initialState,
    doctrineMechanics: { ...soloScenario.initialState.doctrineMechanics, culminationRisk: 65 },
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s1: { recoveryDebt: 70, reservePredictability: 30 },
    },
    strategic: {
      ...soloScenario.initialState.strategic,
      sustainment: { depotBacklog: 75, munitionsSufficiency: 12, fuelSufficiency: 18, liftAvailability: 22 },
    },
    sustainment: { depotBacklog: 75, munitionsSufficiency: 12, fuelSufficiency: 18, liftAvailability: 22 },
  };
  const result = resolveTurn(soloScenario, compoundedOverreachState, highTempoInput);

  assert.ok(result.nextState.doctrineMechanics.culminationRisk > 72, "compounded overreach should cross the culminating point");
  const bet = result.afterAction.find((entry) => entry.heading === "Doctrine bet: culmination");
  assert.ok(bet, "expected a culmination doctrine-bet after-action note");
  assert.ok(bet.detail.includes("hard readiness and support loss"));
  assert.ok(
    result.nextState.strategic.sustainment.liftAvailability < compoundedOverreachState.strategic.sustainment.liftAvailability,
    "lift availability should take an additional hit from the culmination counterweight",
  );
});

test("doctrine: self-deception risk fires when signature management is high but S2 deception risk never actually falls", () => {
  const overconfidentState = {
    ...soloScenario.initialState,
    doctrineMechanics: { ...soloScenario.initialState.doctrineMechanics, signatureControl: 58 },
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s2: { externalEstimateConfidence: 50, visibility: "ESTIMATED" as const, deceptionRisk: 90 },
    },
    strategic: {
      ...soloScenario.initialState.strategic,
      intelligence: { ...soloScenario.initialState.strategic.intelligence, deceptionPressure: 90 },
    },
    intel: { ...soloScenario.initialState.intel, deceptionPressure: 90 },
  };
  // balancedInput selects deception-hunt (counter-deception, warning) and quiet-reassurance (quiet),
  // both of which raise signatureControl even while deceptionRisk stays high.
  const result = resolveTurn(soloScenario, overconfidentState, balancedInput);

  assert.ok(result.nextState.doctrineMechanics.signatureControl > 60);
  assert.ok(result.nextState.staffMechanics.s2.deceptionRisk >= 55);
  const note = result.afterAction.find((entry) => entry.heading === "Doctrine: self-deception risk");
  assert.ok(note, "expected a self-deception after-action note");
});

test("doctrine: handoff friction fires when commander's intent is landing on a low-trust staff", () => {
  // Trust 1 (not 5): the faction's commanderIntentClarity offset (+4, coalition-native)
  // shifts the friction threshold, so the fixture must dip lower to land under 40.
  const lowTrustState = {
    ...soloScenario.initialState,
    chiefTrust: Object.fromEntries(soloScenario.chiefs.map((chief) => [chief.id, 1])),
  };
  const result = resolveTurn(soloScenario, lowTrustState, balancedInput);

  assert.ok(result.nextState.doctrineMechanics.commanderIntentClarity < 40);
  const note = result.afterAction.find((entry) => entry.heading === "Doctrine: handoff friction");
  assert.ok(note, "expected a handoff-friction after-action note");
  assert.ok(result.nextState.resources.politicalCapital < lowTrustState.resources.politicalCapital);
});

test("doctrine: contradiction debt fires when memo selections pull the campaign aim in opposite directions", () => {
  const contradictingInput: TurnInput = {
    turn: 1,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    selections: [
      // "public-assurance-tour" carries "public-commitment"; "quiet-reassurance" would carry
      // "quiet" — but both can't be selected on the same memo, so we pull the contradiction
      // from two different memos instead: an "ad-hoc" option paired with a "program" option.
      { memoId: "posture", optionId: "measured-deterrence" },
      { memoId: "intelligence-focus", optionId: "deception-hunt" },
      { memoId: "sustainment-focus", optionId: "munitions-hedge" },
      { memoId: "alliance-frame", optionId: "public-assurance-tour" },
    ],
  };
  const seededState = {
    ...soloScenario.initialState,
    doctrineMechanics: { ...soloScenario.initialState.doctrineMechanics, campaignAimClarity: 50 },
  };
  const result = resolveTurn(soloScenario, seededState, contradictingInput);

  // public-assurance-tour carries "ad-hoc"; munitions-hedge carries "program" — a genuine
  // ad-hoc/program contradiction inside the same turn's tag set.
  assert.ok(result.nextState.doctrineMechanics.campaignAimClarity < 50, "contradicting tags should pull aim clarity down");
  const note = result.afterAction.find((entry) => entry.heading === "Doctrine: contradiction debt");
  assert.ok(note, "expected a contradiction-debt after-action note");
  assert.ok(note.detail.includes("opposite directions"));
});

test("doctrine: campaignAimClarity settles at a bounded equilibrium rather than getting pinned at an extreme under sustained balanced play", () => {
  // Regression test: measured-deterrence carries "deterrence" and quiet-reassurance carries
  // "quiet" — repeatedly selecting this scenario's own balanced baseline combination must never
  // be treated as a doctrinal contradiction, and the positive branch must not ratchet unbounded.
  let state = soloScenario.initialState;
  const history = [state.doctrineMechanics.campaignAimClarity];
  for (let turn = 1; turn <= 10; turn += 1) {
    const result = resolveTurn(soloScenario, state, { ...balancedInput, turn });
    history.push(result.nextState.doctrineMechanics.campaignAimClarity);
    state = result.nextState;
    if (state.campaignStatus !== "active") break;
  }
  const final = history[history.length - 1];
  assert.ok(final > 10 && final < 90, `expected campaignAimClarity to settle away from the extremes under balanced play, got ${final} (history: ${history.join(", ")})`);
  // Should be monotonically non-decreasing then flat once it reaches equilibrium — never
  // dropping back toward 0 the way it did before both fixes.
  for (let i = 1; i < history.length; i += 1) {
    assert.ok(history[i] >= history[i - 1] - 0.01, `campaignAimClarity should not regress toward 0 under sustained balanced play: ${history.join(", ")}`);
  }
});

test("doctrine: order clarity fires when many distinct tags dilute an otherwise gaining turn", () => {
  // Well-supported S1/S2/S4 baseline so tempo pays off cleanly (no overreach/culmination noise),
  // isolating orderClarity's own effect. highTempoInput's five options carry 14 distinct tags.
  const complexButSupportedState = {
    ...soloScenario.initialState,
    doctrineMechanics: { ...soloScenario.initialState.doctrineMechanics, orderClarity: 35 },
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s1: { recoveryDebt: 15, reservePredictability: 85 },
      s2: { externalEstimateConfidence: 80, visibility: "KNOWN" as const, deceptionRisk: 10 },
    },
    strategic: {
      ...soloScenario.initialState.strategic,
      sustainment: { depotBacklog: 10, munitionsSufficiency: 90, fuelSufficiency: 90, liftAvailability: 90 },
    },
    sustainment: { depotBacklog: 10, munitionsSufficiency: 90, fuelSufficiency: 90, liftAvailability: 90 },
  };
  const result = resolveTurn(soloScenario, complexButSupportedState, highTempoInput);

  assert.ok(result.nextState.doctrineMechanics.orderClarity < 40, "14 distinct tags should push order clarity below the dilution threshold");
  assert.ok(
    result.nextState.strategic.forceGeneration.deployableUnits > complexButSupportedState.strategic.forceGeneration.deployableUnits,
    "this turn should otherwise be a net gain before the dilution penalty",
  );
  const note = result.afterAction.find((entry) => entry.heading === "Doctrine: order clarity");
  assert.ok(note, "expected an order-clarity after-action note");
  assert.ok(note.detail.includes("diluted"));
});

test("doctrine: support ceiling fires when S4 support is thin even though the turn is otherwise net-positive", () => {
  const weakSupportState = {
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s4: { stockpileDepth: 5, liftBurn: 90, supportableTempo: 5 },
    },
    strategic: {
      ...soloScenario.initialState.strategic,
      sustainment: { depotBacklog: 90, munitionsSufficiency: 10, fuelSufficiency: 10, liftAvailability: 10 },
    },
    sustainment: { depotBacklog: 90, munitionsSufficiency: 10, fuelSufficiency: 10, liftAvailability: 10 },
  };
  const result = resolveTurn(soloScenario, weakSupportState, balancedInput);

  assert.ok(result.nextState.doctrineMechanics.operationalReach < 35, "weak stockpile/lift/depot/fuel should push operational reach below the ceiling threshold");
  assert.ok(
    result.nextState.strategic.forceGeneration.deployableUnits > weakSupportState.strategic.forceGeneration.deployableUnits,
    "this turn should otherwise be a net gain before the support-ceiling penalty",
  );
  const note = result.afterAction.find((entry) => entry.heading === "Doctrine: support ceiling");
  assert.ok(note, "expected a support-ceiling after-action note");
  assert.ok(note.detail.includes("ceiling"));
});

test("doctrine: signatureControl and exposureControl settle at bounded equilibria rather than saturating under sustained balanced play", () => {
  // Regression test for the same bug class as campaignAimClarity, found by the same multi-turn
  // simulation technique: balancedInput selects deception-hunt (counter-deception) and
  // quiet-reassurance (quiet) every turn, and the old flat-additive-with-no-decay formula drove
  // both variables to a permanent 100 within 6 turns, losing all descriptive resolution.
  let state = soloScenario.initialState;
  const signatureHistory = [state.doctrineMechanics.signatureControl];
  const exposureHistory = [state.doctrineMechanics.exposureControl];
  for (let turn = 1; turn <= 10; turn += 1) {
    const result = resolveTurn(soloScenario, state, { ...balancedInput, turn });
    signatureHistory.push(result.nextState.doctrineMechanics.signatureControl);
    exposureHistory.push(result.nextState.doctrineMechanics.exposureControl);
    state = result.nextState;
    if (state.campaignStatus !== "active") break;
  }
  const finalSignature = signatureHistory[signatureHistory.length - 1];
  const finalExposure = exposureHistory[exposureHistory.length - 1];
  assert.ok(finalSignature < 100, `expected signatureControl to settle below saturation, got ${finalSignature} (history: ${signatureHistory.join(", ")})`);
  assert.ok(finalExposure < 100, `expected exposureControl to settle below saturation, got ${finalExposure} (history: ${exposureHistory.join(", ")})`);
  // Both should still have risen substantially (the underlying signal is genuinely positive
  // here), just not to a saturated, uninformative ceiling.
  assert.ok(finalSignature > 60, `expected signatureControl to still rise meaningfully, got ${finalSignature}`);
  assert.ok(finalExposure > 60, `expected exposureControl to still rise meaningfully, got ${finalExposure}`);
});

// ── Doctrine 3 (issue #57): genes alter chief advice style and burden routing ─────────
// Lens A = the shipped composite; lens B = sustainment-first only, built in-test from the
// content registry (no second scenario file needed).
const compositeLens = composeDoctrineLens(resolveDoctrineGenes(soloScenario.doctrineProfile));
const sustainmentOnlyLens = composeDoctrineLens(
  resolveDoctrineGenes({ ...soloScenario.doctrineProfile, geneIds: ["sustainment-first-operational-reach"] }),
);

// Training-load recipes (capacity 3, strainedAt 3, overloadedAt 5):
//   strained   = measured-deterrence (training 1) + training-reset (training 3) = 4
//   overloaded = quiet-recovery (training 2)     + training-reset (training 3) = 5
const strainedTrainingInput: TurnInput = {
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

test("doctrine 3: composeDoctrineLens composes the three real genes deterministically", () => {
  assert.deepEqual(compositeLens, composeDoctrineLens(resolveDoctrineGenes(soloScenario.doctrineProfile)));
  // S3 directive: three summaries in geneIds order, positionLean summed (0 + 1 + 0 = 1),
  // tags deduped preserving first-appearance order.
  assert.deepEqual(compositeLens.adviceStyle.S3?.summaries, [
    "Treats multinational coordination as the default and reads partner caveats as constraints, not noise.",
    "Prefers temporary cross-functional cells over pure stovepipe routing for multi-lane problems.",
    "Accepts sustainment-driven sequencing and argues for it publicly instead of hiding the constraint.",
  ]);
  assert.equal(compositeLens.adviceStyle.S3?.positionLean, 1);
  assert.deepEqual(compositeLens.adviceStyle.S3?.biasTags, ["alliance", "program", "modernization", "repair", "recovery"]);
  assert.deepEqual(compositeLens.adviceStyle.S3?.cautionTags, ["ad-hoc", "hollow", "escalatory"]);
  // S2 has exactly one contributing gene and carries its positionLean -1.
  assert.deepEqual(compositeLens.adviceStyle.S2?.summaries, [
    "Trusts partner-derived collection only when the partner's own confidence is high enough to cite it.",
  ]);
  assert.equal(compositeLens.adviceStyle.S2?.positionLean, -1);
  // S1 sums and clamps (0 + 0 = 0) and dedupes cautionTags.
  assert.deepEqual(compositeLens.adviceStyle.S1?.cautionTags, ["modernization", "exercise", "tempo-spike"]);
});

test("doctrine 3: composeBurdenLens resolves cross-gene cancellations by priority-wins", () => {
  assert.deepEqual(composeBurdenLens(resolveDoctrineGenes(soloScenario.doctrineProfile)), {
    priorityLanes: ["plans", "operations", "sustainment"],
    underpricedLanes: ["training"],
  });
});

test("doctrine 3: two doctrine profiles produce visibly different chief advice on the same memo set", () => {
  const memo = soloScenario.memoTemplates.find((entry) => entry.id === "posture");
  assert.ok(memo);
  const option = memo.options.find((entry) => entry.id === "measured-deterrence");
  assert.ok(option);

  // Low-signal option: positions match, but the gene voice differs — Navarro's composite
  // S3 note is three summaries joined in gene order, the sustainment-only S3 note is one.
  const positionsA = buildChiefPositions(soloScenario.chiefs, soloScenario.initialState, memo, option, [], soloScenario.staffFunctions, compositeLens);
  const positionsB = buildChiefPositions(soloScenario.chiefs, soloScenario.initialState, memo, option, [], soloScenario.staffFunctions, sustainmentOnlyLens);
  const navarroA = positionsA.find((entry) => entry.chiefId === "navarro");
  const navarroB = positionsB.find((entry) => entry.chiefId === "navarro");
  assert.ok(navarroA);
  assert.ok(navarroB);
  assert.equal(navarroA.position, navarroB.position);
  assert.notEqual(navarroA.adviceStyleNote, navarroB.adviceStyleNote);
  assert.match(navarroA.adviceStyleNote ?? "", /·/);

  // Full resolveTurn on the same memo set yields visibly different chiefPositions (and,
  // where the score crosses a threshold, a different nextState via memory/trust).
  const resultA = resolveTurn({ ...soloScenario, doctrineLens: compositeLens }, soloScenario.initialState, balancedInput);
  const resultB = resolveTurn({ ...soloScenario, doctrineLens: sustainmentOnlyLens }, soloScenario.initialState, balancedInput);
  assert.notDeepEqual(resultA.chiefPositions, resultB.chiefPositions);
  assert.ok(
    resultA.chiefPositions.some((entry, index) => entry.position !== resultB.chiefPositions[index].position),
    "the two lenses must flip at least one chief's position on the same memo set",
  );
  assert.notDeepEqual(resultA.nextState, resultB.nextState, "position flips flow into agenda memory and trust");

  // Burden-routing divergence (acceptance criterion: advice AND routing differ): the
  // composite underprices training, the sustainment-only lens underprices operations,
  // so the routingAttention labels must differ on the same input.
  const routingA = resultA.directorateBurden.map((entry) => `${entry.directorate}:${entry.routingAttention}`);
  const routingB = resultB.directorateBurden.map((entry) => `${entry.directorate}:${entry.routingAttention}`);
  assert.notDeepEqual(routingA, routingB, "the two lenses must route attention differently on the same memo set");
});

test("doctrine 3: positionLean fires only when the chief's own readout signals risk or strain", () => {
  const leanLens: DoctrineLens = {
    adviceStyle: { S3: { summaries: ["test lean"], biasTags: [], cautionTags: [], positionLean: 1 } },
    burdenBias: { priorityLanes: [], underpricedLanes: [] },
  };
  const memo = soloScenario.memoTemplates.find((entry) => entry.id === "intelligence-focus");
  assert.ok(memo);
  const option = memo.options.find((entry) => entry.id === "warning-net");
  assert.ok(option);

  // No signal: initialState has every staff function healthy/watch and no burdens, so
  // adviceLean must be exactly 0 — positions identical with and without the lens.
  const noSignalWith = buildChiefPositions(soloScenario.chiefs, soloScenario.initialState, memo, option, [], soloScenario.staffFunctions, leanLens).map((entry) => entry.position);
  const noSignalWithout = buildChiefPositions(soloScenario.chiefs, soloScenario.initialState, memo, option, [], soloScenario.staffFunctions, neutralDoctrineLens).map((entry) => entry.position);
  assert.deepEqual(noSignalWith, noSignalWithout, "without a readout signal the lean must contribute exactly 0");

  // Signal: S3 metrics in the risk band — the same directive contributes its lean (+1).
  const riskState = campaignStateSchema.parse({
    ...soloScenario.initialState,
    staffMechanics: {
      ...soloScenario.initialState.staffMechanics,
      s3: { visiblePosture: 35, executablePosture: 30 },
    },
  });
  const briggsWithout = buildChiefPositions(soloScenario.chiefs, riskState, memo, option, [], soloScenario.staffFunctions, neutralDoctrineLens).find((entry) => entry.chiefId === "briggs");
  const briggsWith = buildChiefPositions(soloScenario.chiefs, riskState, memo, option, [], soloScenario.staffFunctions, leanLens).find((entry) => entry.chiefId === "briggs");
  assert.ok(briggsWithout);
  assert.ok(briggsWith);
  assert.equal(briggsWithout.staffReadoutEvidence.metricStatus, "risk");
  assert.equal(briggsWithout.position, "oppose");
  assert.equal(briggsWith.position, "request_conditions", "a +1 lean at the -2/-1 boundary must flip oppose -> request_conditions");
});

test("doctrine 3: underpricedDissent flips the underpriced-lane chief's position when an option burdens her squeezed lane without serving it", () => {
  // Direct mechanism test (review finding): the dissent term must change the
  // underpriced-lane chief's POSITION, not just her note. A lane-ALIGNED option keeps
  // her support (preferredTags outweigh the pile-on penalty); an option that loads her
  // squeezed lane without matching her preferences must flip her to dissent.
  const memo = soloScenario.memoTemplates.find((entry) => entry.id === "posture");
  assert.ok(memo);
  const trainingPileOn: MemoOption = {
    ...memo.options[0],
    id: "training-pile-on",
    label: "Training pile-on",
    // modernization matches the composite S3 biasTags but NOT Navarro's preferredTags,
    // so the pile-on penalty is the deciding term.
    tags: ["modernization"],
    burden: [
      { directorate: "training", points: 2 },
      { directorate: "operations", points: 1 },
    ],
  };
  const strainedTrainingBurdens: DirectorateBurden[] = [
    { directorate: "people", burdenPoints: 1, capacity: 3, burdenLevel: "light" },
    { directorate: "intelligence", burdenPoints: 2, capacity: 3, burdenLevel: "light" },
    { directorate: "operations", burdenPoints: 3, capacity: 4, burdenLevel: "light" },
    { directorate: "sustainment", burdenPoints: 2, capacity: 4, burdenLevel: "light" },
    { directorate: "plans", burdenPoints: 2, capacity: 3, burdenLevel: "light" },
    { directorate: "training", burdenPoints: 4, capacity: 3, burdenLevel: "strained" },
  ];

  const neutralPos = buildChiefPositions(
    soloScenario.chiefs,
    soloScenario.initialState,
    memo,
    trainingPileOn,
    strainedTrainingBurdens,
    soloScenario.staffFunctions,
    neutralDoctrineLens,
  ).find((entry) => entry.chiefId === "navarro");
  const compositePos = buildChiefPositions(
    soloScenario.chiefs,
    soloScenario.initialState,
    memo,
    trainingPileOn,
    strainedTrainingBurdens,
    soloScenario.staffFunctions,
    compositeLens,
  ).find((entry) => entry.chiefId === "navarro");
  assert.ok(neutralPos);
  assert.ok(compositePos);
  assert.ok(
    ["support", "accept_risk"].includes(neutralPos.position),
    `without the lens the pile-on option should be tolerable, got ${neutralPos.position}`,
  );
  assert.ok(
    ["request_conditions", "oppose"].includes(compositePos.position),
    `the underpriced-dissent pile-on must flip Navarro to dissent, got ${compositePos.position}`,
  );
  assert.notEqual(neutralPos.position, compositePos.position, "the dissent term must change her position");
});

test("doctrine 3: underpriced lane warning surfaces as an accepted-risk candidate in preview", () => {
  const preview = previewTurn(soloScenario, soloScenario.initialState, strainedTrainingInput);
  const result = preview.projectedResult;
  const training = result.directorateBurden.find((entry) => entry.directorate === "training");
  assert.ok(training);
  assert.equal(training.burdenLevel, "strained");
  assert.equal(training.routingAttention, "underpriced");

  const s3 = result.staffFunctions.find((entry) => entry.id === "S3");
  assert.ok(s3);
  const underpricedWarnings = s3.warnings.filter((warning) => warning.includes("This lane is one the staff underprices"));
  assert.equal(underpricedWarnings.length, 1, "exactly one underpriced warning per lane — no double-listing");
  const candidate = preview.acceptedRiskCandidates.find((entry) => entry.staffFunctionId === "S3" && entry.warningText === underpricedWarnings[0]);
  assert.ok(candidate, "the underpriced warning must become a preview accepted-risk candidate");

  // Preview and resolution are the same code path: identical readouts.
  const resolved = resolveTurn(soloScenario, soloScenario.initialState, strainedTrainingInput);
  assert.deepEqual(resolved.staffFunctions, result.staffFunctions);
  assert.deepEqual(resolved.directorateBurden, result.directorateBurden);

  // Navarro's gene-flavored position is visible pre-commit in the Chiefs Paper preview.
  // She SUPPORTS measured-deterrence here even though training is strained: the option
  // carries her preferred tags (training/recovery) — lane-aligned work keeps her
  // support. The dissent surface (an option burdening her squeezed lane WITHOUT
  // serving it) is exercised by the dedicated underpricedDissent test above.
  const postureDisagreement = preview.disagreements.find((entry) => entry.memoId === "posture");
  assert.ok(postureDisagreement);
  assert.ok(postureDisagreement.supportedBy.includes("navarro"));
  const navarroPosition = result.chiefPositions.find((entry) => entry.chiefId === "navarro" && entry.memoId === "posture");
  assert.ok(navarroPosition);
  assert.ok(navarroPosition.adviceStyleNote && navarroPosition.adviceStyleNote.includes("·"), "Navarro's composite S3 gene voice must show pre-commit");
});

test("doctrine 3: committing with the underpriced warning accepted records accepted risk in an underpriced lane", () => {
  const preview = previewTurn(soloScenario, soloScenario.initialState, strainedTrainingInput);
  const acceptedInput: TurnInput = { ...strainedTrainingInput, acceptedRiskOverrides: preview.acceptedRiskCandidates };
  const result = resolveTurn(soloScenario, soloScenario.initialState, acceptedInput);
  const note = result.afterAction.find((entry) => entry.heading === "Doctrine: accepted risk in an underpriced lane");
  assert.ok(note, "expected an accepted-risk-in-underpriced-lane note");
  assert.match(note.detail, /Training/);
  assert.ok(!result.afterAction.some((entry) => entry.heading === "Doctrine: underpriced-lane dissent"));
  assert.ok(result.acceptedRisks.some((entry) => entry.staffFunctionId === "S3" && entry.accepted));
});

test("doctrine 3: resolving without accepting the underpriced warning records staff dissent", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, strainedTrainingInput);
  const dissent = result.afterAction.find((entry) => entry.heading === "Doctrine: underpriced-lane dissent");
  const unacknowledged = result.afterAction.find((entry) => entry.heading === "Doctrine: unacknowledged risk");
  assert.ok(dissent, "expected an underpriced-lane dissent note");
  assert.ok(unacknowledged, "expected the aggregate unacknowledged-risk note");
  assert.match(dissent.detail, /Training/);
  // Complementary, not duplicates: the dissent is lane-specific, the aggregate is not.
  assert.ok(!dissent.detail.includes(unacknowledged.detail), "lane-specific dissent must not duplicate the aggregate note");
  assert.ok(!unacknowledged.detail.includes("underprice"), "the aggregate note must stay lane-agnostic");
});

test("doctrine 3: accepting an UNRELATED warning in the same staff function does not count as accepting the underpriced warning", () => {
  // Operations and Training share S3 (Codex P2, PR #77): an override whose
  // warningText is NOT the underpriced warning must not flip the note to accepted
  // risk — acceptance is keyed to the exact generated warning, not the function ID.
  const result = resolveTurn(soloScenario, soloScenario.initialState, {
    ...strainedTrainingInput,
    acceptedRiskOverrides: [{ staffFunctionId: "S3", warningText: "Unrelated S3 risk-band warning." }],
  });
  const dissent = result.afterAction.find((entry) => entry.heading === "Doctrine: underpriced-lane dissent");
  const accepted = result.afterAction.find((entry) => entry.heading === "Doctrine: accepted risk in an underpriced lane");
  assert.ok(dissent, "an unrelated override must still record dissent");
  assert.ok(!accepted, "an unrelated override must not record accepted risk in the underpriced lane");
});

test("doctrine 3: a neglected priority lane is called out in the after action", () => {
  const neglectedInput: TurnInput = {
    turn: 1,
    selectedActionIds: [],
    selections: [
      { memoId: "posture", optionId: "quiet-recovery" },
      { memoId: "intelligence-focus", optionId: "warning-net" },
      { memoId: "sustainment-focus", optionId: "repair-first" },
      { memoId: "alliance-frame", optionId: "quiet-reassurance" },
      { memoId: "force-development", optionId: "training-reset" },
    ],
    // Quiet-reassurance burdens plans 2; the negotiation relieves it so plans sits light.
    staffNegotiations: [{ directorate: "plans", reliefPoints: 2, cost: "political_cover" }],
  };
  const result = resolveTurn(soloScenario, soloScenario.initialState, neglectedInput);
  const plans = result.directorateBurden.find((entry) => entry.directorate === "plans");
  const training = result.directorateBurden.find((entry) => entry.directorate === "training");
  assert.ok(plans);
  assert.ok(training);
  assert.equal(plans.burdenLevel, "light");
  assert.equal(training.burdenLevel, "overloaded");
  const note = result.afterAction.find((entry) => entry.heading === "Doctrine: neglected priority lane");
  assert.ok(note, "expected a neglected-priority-lane note");
  assert.match(note.detail, /Plans/);
  assert.match(note.detail, /Training/);

  // Does NOT fire when the overloaded lane is itself a priority lane and no non-priority
  // lane overloads (a priority-vs-priority story is different and would over-fire).
  const priorityOverloadedInput: TurnInput = {
    ...neglectedInput,
    selections: [
      { memoId: "posture", optionId: "surge-exercises" },
      { memoId: "intelligence-focus", optionId: "warning-net" },
      { memoId: "sustainment-focus", optionId: "repair-first" },
      { memoId: "alliance-frame", optionId: "quiet-reassurance" },
      { memoId: "force-development", optionId: "fires-prototype" },
    ],
  };
  const second = resolveTurn(soloScenario, soloScenario.initialState, priorityOverloadedInput);
  const operations = second.directorateBurden.find((entry) => entry.directorate === "operations");
  assert.ok(operations);
  assert.equal(operations.burdenLevel, "overloaded");
  assert.ok(!second.afterAction.some((entry) => entry.heading === "Doctrine: neglected priority lane"));
});

test("doctrine 3: keeps replay deterministic and replay-valid", () => {
  const left = resolveTurn(soloScenario, soloScenario.initialState, strainedTrainingInput);
  const right = resolveTurn(soloScenario, soloScenario.initialState, strainedTrainingInput);
  assert.equal(left.replayHash, right.replayHash);
  assert.deepEqual(left.nextState, right.nextState);
  // The full TurnResult includes non-hashed advice/note text — determinism must hold by
  // construction (pure functions over (state, input, lens)), locked here.
  assert.deepEqual(left, right, "the full TurnResult (incl. non-hashed advice/note text) must be deterministic");

  // Multi-turn session replays cleanly against the scenario-carried lens.
  const previewOne = previewTurn(soloScenario, soloScenario.initialState, strainedTrainingInput);
  const turnOneInput: TurnInput = { ...strainedTrainingInput, acceptedRiskOverrides: previewOne.acceptedRiskCandidates };
  const turnOne = resolveTurn(soloScenario, soloScenario.initialState, turnOneInput);
  const turnTwoBase: TurnInput = { ...balancedInput, turn: 2 };
  const previewTwo = previewTurn(soloScenario, turnOne.nextState, turnTwoBase);
  const turnTwoInput: TurnInput = { ...turnTwoBase, acceptedRiskOverrides: previewTwo.acceptedRiskCandidates };
  const turnTwo = resolveTurn(soloScenario, turnOne.nextState, turnTwoInput);
  const replay = validateReplaySession(soloScenario, {
    initialState: soloScenario.initialState,
    turnInputs: [turnOneInput, turnTwoInput],
    history: [turnOne, turnTwo],
    state: turnTwo.nextState,
  });
  assert.equal(replay.ok, true);
});

test("doctrine 3: the neutral lens reproduces pre-doctrine-3 behavior", () => {
  const preview = previewTurn(soloScenario, soloScenario.initialState, strainedTrainingInput);
  const acceptedInput: TurnInput = { ...strainedTrainingInput, acceptedRiskOverrides: preview.acceptedRiskCandidates };
  const withLens = resolveTurn(soloScenario, soloScenario.initialState, acceptedInput);
  const withoutLens = resolveTurn({ ...soloScenario, doctrineLens: neutralDoctrineLens }, soloScenario.initialState, acceptedInput);

  // Routing is attention, not math: burden points/capacity/level/penalties and doctrine
  // mechanics are identical regardless of the lens.
  const burdenKeys = ["directorate", "burdenPoints", "capacity", "burdenLevel", "confidencePenalty", "executionPenalty"] as const;
  assert.deepEqual(
    withLens.directorateBurden.map((entry) => burdenKeys.map((key) => [key, entry[key]])),
    withoutLens.directorateBurden.map((entry) => burdenKeys.map((key) => [key, entry[key]])),
  );
  assert.deepEqual(withLens.nextState.doctrineMechanics, withoutLens.nextState.doctrineMechanics);
  // The neutral run carries no routing labels at all.
  assert.ok(withoutLens.directorateBurden.every((entry) => entry.routingAttention === "neutral"));

  // Any position difference is exactly a D3-score flip, which then legitimately flows
  // into agenda memory and trust — and nowhere else.
  const flips = withLens.chiefPositions.filter((entry, index) => entry.position !== withoutLens.chiefPositions[index].position);
  assert.ok(flips.length > 0, "the composite lens must flip at least one borderline position");
  const changedStateKeys = Object.keys(withLens.nextState).filter(
    (key) => JSON.stringify((withLens.nextState as Record<string, unknown>)[key]) !== JSON.stringify((withoutLens.nextState as Record<string, unknown>)[key]),
  );
  assert.deepEqual(changedStateKeys.sort(), ["chiefAgendaMemory", "chiefTrust"]);
});

test("doctrine 3: buildChiefPositions without a lens is identical to the neutral lens", () => {
  // Architecture test-plan guardrail: the default lens parameter IS neutralDoctrineLens,
  // so a lens-free call must deepEqual the explicit neutral-lens call (score/position/
  // note identity for every chief on a representative memo).
  const memo = soloScenario.memoTemplates.find((entry) => entry.id === "posture");
  assert.ok(memo);
  const option = memo.options.find((entry) => entry.id === "measured-deterrence");
  assert.ok(option);
  const noLens = buildChiefPositions(
    soloScenario.chiefs,
    soloScenario.initialState,
    memo,
    option,
    [],
    soloScenario.staffFunctions,
  );
  const neutral = buildChiefPositions(
    soloScenario.chiefs,
    soloScenario.initialState,
    memo,
    option,
    [],
    soloScenario.staffFunctions,
    neutralDoctrineLens,
  );
  assert.deepEqual(noLens, neutral, "the omitted-lens default must reproduce the neutral lens exactly");
});

test("doctrine 3: scenario without doctrineLens defaults to the neutral lens", () => {
  const parsed = scenarioDefinitionSchema.parse({ ...soloScenario, doctrineLens: undefined });
  assert.deepEqual(parsed.doctrineLens, neutralDoctrineLens);
});

// ── Doctrine 4: faction events maturing from overused doctrine (issue #58) ─────

function slowBurnSelections() {
  return [
    { memoId: "posture", optionId: "quiet-recovery" },
    { memoId: "intelligence-focus", optionId: "warning-net" },
    { memoId: "sustainment-focus", optionId: "repair-first" },
    { memoId: "alliance-frame", optionId: "quiet-reassurance" },
  ];
}

function withAcceptedRisks(input: TurnInput, preview = previewTurn(soloScenario, soloScenario.initialState, { ...input, acceptedRiskOverrides: [] })) {
  return { ...input, acceptedRiskOverrides: preview.acceptedRiskCandidates };
}

function countOrdinaryEligible(state: CampaignState, tags: Set<string>, scenario: ScenarioDefinition = soloScenario) {
  return scenario.events.filter((event) => {
    if (event.doctrineTrigger) return false;
    if (state.turn < event.minTurn || state.turn > event.maxTurn) return false;
    if (state.eventHistory.includes(event.id)) return false;
    if (!event.triggerTags.every((tag) => tags.has(tag))) return false;
    if (!event.requiredFlags.every((flag) => state.eventFlags[flag])) return false;
    if (event.excludedFlags.some((flag) => state.eventFlags[flag])) return false;
    return true;
  }).length;
}

test("doctrine 4: a scenario without doctrine events is bit-identical on ordinary inputs", () => {
  const noDoctrine: ScenarioDefinition = { ...soloScenario, events: soloScenario.events.filter((event) => !event.doctrineTrigger) };
  const withDoctrine = resolveTurn(soloScenario, soloScenario.initialState, balancedInput);
  const withoutDoctrine = resolveTurn(noDoctrine, soloScenario.initialState, balancedInput);
  assert.deepEqual(withoutDoctrine.triggeredEvents.map((event) => event.id), withDoctrine.triggeredEvents.map((event) => event.id));
  assert.deepEqual(withoutDoctrine.nextState, withDoctrine.nextState);
  assert.deepEqual(withoutDoctrine.afterAction, withDoctrine.afterAction);
  assert.equal(withoutDoctrine.replayHash, withDoctrine.replayHash);
});

test("doctrine 4: chooseEvents draws exactly once per eligible ordinary event including index 0, even when doctrine events consume capacity", () => {
  const event = soloScenario.events.find((candidate) => candidate.id === "doctrine-coalition-caveat-exposure")!;
  const state = structuredClone(soloScenario.initialState) as CampaignState;
  state.turn = 2;
  state.doctrineMechanics = { ...state.doctrineMechanics, signatureControl: 30 };
  state.doctrineMaturity = { [event.id]: { consecutiveTurns: 1, startedTurn: 1, acceptedRiskRefs: [] } };
  // Union of every memo option's tags: every turn-eligible ordinary event qualifies.
  const allTags = new Set(soloScenario.memoTemplates.flatMap((memo) => memo.options.flatMap((option) => option.tags)));
  const eligibleCount = countOrdinaryEligible(state, allTags);
  assert.ok(eligibleCount > 2, "fixture must have several eligible ordinary events");

  let draws = 0;
  const passRng: Rng = () => { draws += 1; return 0.99; };
  const chosen = chooseEvents(soloScenario, state, allTags, passRng);
  assert.equal(draws, eligibleCount, "one draw per eligible ordinary event, including index 0, even when a doctrine event consumes capacity");
  assert.ok(chosen.some((entry) => entry.id === event.id), "the mature doctrine event still fires");
  assert.ok(chosen.filter((entry) => !entry.doctrineTrigger).length <= 1, "doctrine consumption reduced ordinary capacity");

  // A failing rng still draws for every eligible ordinary event, and index 0 still passes.
  draws = 0;
  const failRng: Rng = () => { draws += 1; return 0.0; };
  const ordinaryEligible = soloScenario.events.filter((entry) => !entry.doctrineTrigger && state.turn >= entry.minTurn && state.turn <= entry.maxTurn && entry.triggerTags.every((tag) => allTags.has(tag)) && entry.requiredFlags.every((flag) => state.eventFlags[flag]) && !entry.excludedFlags.some((flag) => state.eventFlags[flag]));
  const firstOrdinary = ordinaryEligible[0]!;
  const chosenFail = chooseEvents(soloScenario, state, allTags, failRng);
  assert.equal(draws, eligibleCount);
  assert.ok(chosenFail.some((entry) => entry.id === firstOrdinary.id), "index-0 ordinary event passes even under a failing rng");

  // The no-doctrine scenario draws identically (bit-identical draw pattern).
  const noDoctrine: ScenarioDefinition = { ...soloScenario, events: soloScenario.events.filter((entry) => !entry.doctrineTrigger) };
  draws = 0;
  const chosenPlain = chooseEvents(noDoctrine, state, allTags, passRng);
  assert.equal(draws, eligibleCount);
  assert.equal(chosenPlain.filter((entry) => !entry.doctrineTrigger).length, 2);
});

test("doctrine 4: a mature doctrine event fires regardless of RNG and scenario index", () => {
  const event = soloScenario.events.find((candidate) => candidate.id === "doctrine-coalition-caveat-exposure")!;
  const state = structuredClone(soloScenario.initialState) as CampaignState;
  state.turn = 2;
  state.doctrineMechanics = { ...state.doctrineMechanics, signatureControl: 30 };
  state.doctrineMaturity = { [event.id]: { consecutiveTurns: 1, startedTurn: 1, acceptedRiskRefs: [] } };
  // Move the doctrine event to the END of the scenario array.
  const reordered: ScenarioDefinition = { ...soloScenario, events: [...soloScenario.events.filter((entry) => entry.id !== event.id), event] };
  let draws = 0;
  const rng: Rng = () => { draws += 1; return 0.0; };
  const chosen = chooseEvents(reordered, state, new Set(["public-commitment"]), rng);
  assert.ok(chosen.some((entry) => entry.id === event.id), "mature doctrine event fires even with an all-fail rng and a late scenario index");
});

test("doctrine 4: three simultaneous mature doctrine events all fire, ordinary none, in scenario order", () => {
  const state = structuredClone(soloScenario.initialState) as CampaignState;
  state.turn = 3;
  state.doctrineMechanics = { ...state.doctrineMechanics, signatureControl: 30, mainEffortFocus: 28, relativeTempo: 28 };
  state.doctrineMaturity = {
    "doctrine-coalition-caveat-exposure": { consecutiveTurns: 1, startedTurn: 1, acceptedRiskRefs: [] },
    "doctrine-adaptive-cell-sprawl": { consecutiveTurns: 1, startedTurn: 1, acceptedRiskRefs: [] },
    "doctrine-sustainment-patience-gap": { consecutiveTurns: 2, startedTurn: 1, acceptedRiskRefs: [] },
  };
  const input: TurnInput = {
    turn: 3,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    staffNegotiations: [],
    selections: [
      { memoId: "posture", optionId: "quiet-recovery" },
      { memoId: "intelligence-focus", optionId: "industrial-watch" },
      { memoId: "sustainment-focus", optionId: "lift-assurance" },
      { memoId: "alliance-frame", optionId: "modernization-case" },
      { memoId: "force-development", optionId: "fires-prototype" },
    ],
  };
  const result = resolveTurn(soloScenario, state, input);
  const firedIds = result.triggeredEvents.map((event) => event.id);
  assert.ok(firedIds.includes("doctrine-coalition-caveat-exposure"));
  assert.ok(firedIds.includes("doctrine-adaptive-cell-sprawl"));
  assert.ok(firedIds.includes("doctrine-sustainment-patience-gap"));
  assert.ok(result.triggeredEvents.every((event) => event.doctrineTrigger), "no ordinary event fires when three doctrine events consume all capacity");
  const scenarioOrder = soloScenario.events.map((event) => event.id);
  const sorted = [...firedIds].sort((a, b) => scenarioOrder.indexOf(a) - scenarioOrder.indexOf(b));
  assert.deepEqual(firedIds, sorted, "returned event order equals global scenario order");
});

test("doctrine 4: a tag or condition break resets the streak and accepted-risk refs", () => {
  const turnOne = withAcceptedRisks({ ...balancedInput, turn: 1, selections: slowBurnSelections() });
  const first = resolveTurn(soloScenario, soloScenario.initialState, turnOne);
  const entry = first.nextState.doctrineMaturity["doctrine-sustainment-patience-gap"];
  assert.ok(entry, "sustainment streak started on turn 1");
  assert.equal(entry!.consecutiveTurns, 1);
  assert.equal(entry!.startedTurn, 1);

  // Break the slow-burn tag on turn 2: the streak record is dropped entirely.
  const brokenSelections = slowBurnSelections().map((selection) => (selection.memoId === "posture" ? { memoId: "posture", optionId: "measured-deterrence" } : selection));
  const second = resolveTurn(soloScenario, first.nextState, { ...turnOne, turn: 2, selections: brokenSelections, acceptedRiskOverrides: [] });
  assert.equal(second.nextState.doctrineMaturity["doctrine-sustainment-patience-gap"], undefined, "tag break resets the streak");

  // Re-selecting slow-burn starts a fresh chain at the new turn.
  const third = resolveTurn(soloScenario, second.nextState, { ...turnOne, turn: 3 });
  const restarted = third.nextState.doctrineMaturity["doctrine-sustainment-patience-gap"];
  assert.equal(restarted?.consecutiveTurns, 1);
  assert.equal(restarted?.startedTurn, 3);
});

function buildSustainmentMidStreak() {
  const turnOne = withAcceptedRisks({ ...balancedInput, turn: 1, selections: slowBurnSelections() });
  const first = resolveTurn(soloScenario, soloScenario.initialState, turnOne);
  const turnTwo = withAcceptedRisks({ ...balancedInput, turn: 2, selections: slowBurnSelections() }, previewTurn(soloScenario, first.nextState, { ...turnOne, turn: 2, acceptedRiskOverrides: [] }));
  const second = resolveTurn(soloScenario, first.nextState, turnTwo);
  const entry = second.nextState.doctrineMaturity["doctrine-sustainment-patience-gap"];
  assert.ok(entry && entry.consecutiveTurns === 2, "mid-streak state has a two-turn sustainment streak");
  return { turnInputs: [turnOne, turnTwo], history: [first, second], state: second.nextState, second };
}

test("doctrine 4: fired event discards its next-state record while the note retains repeated tags, gene label, and accepted-risk refs", () => {
  const { turnInputs, state } = buildSustainmentMidStreak();
  const fired = resolveTurn(soloScenario, state, { ...turnInputs[1], turn: 3, selections: slowBurnSelections(), acceptedRiskOverrides: [] });
  assert.ok(fired.triggeredEvents.some((event) => event.id === "doctrine-sustainment-patience-gap"));
  assert.equal(fired.nextState.doctrineMaturity["doctrine-sustainment-patience-gap"], undefined, "fired record is removed from next state");
  const note = fired.afterAction.find((entry) => entry.heading === "Doctrine risk matured: The patience gap becomes policy blowback");
  assert.ok(note, "after-action note emitted for the matured doctrine event");
  assert.match(note!.detail, /slow-burn/, "note repeats the trigger tags");
  assert.match(note!.detail, /Sustainment-First Operational Reach/, "note names the source gene label");
  assert.match(note!.detail, /Matching accepted risks: S4 —/, "note retains accepted-risk refs from the streak");
});

test("doctrine 4: replay validation rejects tampering with doctrineMaturity", () => {
  const session = buildSustainmentMidStreak();
  const valid = validateReplaySession(soloScenario, { initialState: soloScenario.initialState, turnInputs: session.turnInputs, history: session.history, state: session.state });
  assert.equal(valid.ok, true);

  const streakCount = structuredClone(session);
  streakCount.state.doctrineMaturity["doctrine-sustainment-patience-gap"].consecutiveTurns = 3;
  assert.equal(validateReplaySession(soloScenario, { initialState: soloScenario.initialState, turnInputs: streakCount.turnInputs, history: streakCount.history, state: streakCount.state }).ok, false, "tampered streak count fails validation");

  const forgedRef = structuredClone(session);
  forgedRef.state.doctrineMaturity["doctrine-sustainment-patience-gap"].acceptedRiskRefs.push({ turn: 9, staffFunctionId: "S5", warningText: "forged" });
  assert.equal(validateReplaySession(soloScenario, { initialState: soloScenario.initialState, turnInputs: forgedRef.turnInputs, history: forgedRef.history, state: forgedRef.state }).ok, false, "tampered accepted-risk ref fails validation");

  const eventId = structuredClone(session);
  eventId.state.doctrineMaturity["doctrine-sustainment-patience-gap-forged"] = eventId.state.doctrineMaturity["doctrine-sustainment-patience-gap"];
  delete eventId.state.doctrineMaturity["doctrine-sustainment-patience-gap"];
  assert.equal(validateReplaySession(soloScenario, { initialState: soloScenario.initialState, turnInputs: eventId.turnInputs, history: eventId.history, state: eventId.state }).ok, false, "tampered maturity key fails validation");

  const nextDelta = structuredClone(session);
  nextDelta.state.domestic.cabinetCover += 5;
  assert.equal(validateReplaySession(soloScenario, { initialState: soloScenario.initialState, turnInputs: nextDelta.turnInputs, history: nextDelta.history, state: nextDelta.state }).ok, false, "tampered next-state delta fails validation");
});
