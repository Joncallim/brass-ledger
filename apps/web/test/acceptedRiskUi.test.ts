import test from "node:test";
import assert from "node:assert/strict";
import {
  acceptedRiskKey,
  acceptedRiskOverridesFromChoices,
  allAcceptedRiskCandidatesChosen,
  defaultTurnInput,
  initialAcceptedRiskChoices,
  setAcceptedRiskChoice,
} from "../src/acceptedRiskUi";
import type { AcceptedRiskOverride, DecisionMemo, GameSession } from "@brass-ledger/shared";

const risks: AcceptedRiskOverride[] = [
  { staffFunctionId: "S1", warningText: "Recovery debt will rise." },
  { staffFunctionId: "S4", warningText: "Stockpile depth cannot support the tempo." },
];

test("accepted-risk candidates start unresolved and block resolution", () => {
  const choices = initialAcceptedRiskChoices(risks);

  assert.equal(allAcceptedRiskCandidatesChosen(risks, choices), false);
  assert.deepEqual(acceptedRiskOverridesFromChoices(risks, choices), []);
});

test("accepted-risk overrides are created only from player-selected choices", () => {
  const firstChoice = setAcceptedRiskChoice(initialAcceptedRiskChoices(risks), risks[0], true);

  assert.equal(allAcceptedRiskCandidatesChosen(risks, firstChoice), false);
  assert.deepEqual(acceptedRiskOverridesFromChoices(risks, firstChoice), [risks[0]]);

  const allChoices = setAcceptedRiskChoice(firstChoice, risks[1], true);
  assert.equal(allAcceptedRiskCandidatesChosen(risks, allChoices), true);
  assert.deepEqual(acceptedRiskOverridesFromChoices(risks, allChoices), risks);
});

test("default turn input does not silently copy preview accepted-risk candidates", () => {
  const session = {
    state: {
      turn: 3,
    },
  } as GameSession;
  const memos = [
    { id: "required", optional: false, options: [{ id: "first-option" }] },
    { id: "optional", optional: true, options: [{ id: "optional-option" }] },
  ] as DecisionMemo[];

  const silentInput = defaultTurnInput(session, memos);
  assert.deepEqual(silentInput.acceptedRiskOverrides, []);

  const choices = risks.reduce((state, risk) => setAcceptedRiskChoice(state, risk, true), initialAcceptedRiskChoices(risks));
  const deliberateInput = defaultTurnInput(session, memos, acceptedRiskOverridesFromChoices(risks, choices));
  assert.deepEqual(deliberateInput.acceptedRiskOverrides.map(acceptedRiskKey), risks.map(acceptedRiskKey));
});
