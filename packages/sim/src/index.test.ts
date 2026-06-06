import test from "node:test";
import assert from "node:assert/strict";
import { soloScenario } from "@brass-ledger/content";
import { buildChiefPositions, campaignStateSchema, continueChiefConversation, startChiefConversation } from "@brass-ledger/shared";
import { resolveTurn, validateReplaySession } from "./index";

test("resolveTurn is deterministic for the same memo selections", () => {
  const input = {
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

  const left = resolveTurn(soloScenario, soloScenario.initialState, input);
  const right = resolveTurn(soloScenario, soloScenario.initialState, input);

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
  const input = {
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

  const validation = validateReplaySession(soloScenario, {
    initialState: soloScenario.initialState,
    turnInputs: [input],
    history: [],
    state: soloScenario.initialState,
  });

  assert.equal(validation.ok, false);
  assert.equal(validation.failureKind, "history_length_mismatch");
  assert.equal(validation.checkedTurns, 0);
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
