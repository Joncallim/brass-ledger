import test from "node:test";
import assert from "node:assert/strict";
import { soloScenario } from "@brass-ledger/content";
import { resolveTurn } from "./index";

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
