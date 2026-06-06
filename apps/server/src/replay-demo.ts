import { soloScenario } from "@brass-ledger/content";
import { createInitialGameSession, sessionExportSchema, type GameSession } from "@brass-ledger/shared";
import { resolveTurn, validateReplaySession } from "@brass-ledger/sim";

let session: GameSession = {
  ...createInitialGameSession(soloScenario),
  id: "demo-session",
};

const turns = [
  [
    { memoId: "posture", optionId: "measured-deterrence" },
    { memoId: "intelligence-focus", optionId: "deception-hunt" },
    { memoId: "sustainment-focus", optionId: "repair-first" },
    { memoId: "alliance-frame", optionId: "quiet-reassurance" },
    { memoId: "force-development", optionId: "training-reset" },
  ],
  [
    { memoId: "posture", optionId: "quiet-recovery" },
    { memoId: "intelligence-focus", optionId: "industrial-watch" },
    { memoId: "sustainment-focus", optionId: "lift-assurance" },
    { memoId: "alliance-frame", optionId: "quiet-reassurance" },
    { memoId: "force-development", optionId: "deception-grid" },
  ],
  [
    { memoId: "posture", optionId: "measured-deterrence" },
    { memoId: "intelligence-focus", optionId: "warning-net" },
    { memoId: "sustainment-focus", optionId: "munitions-hedge" },
    { memoId: "alliance-frame", optionId: "public-assurance-tour" },
    { memoId: "force-development", optionId: "training-reset" },
  ],
];

for (const [index, selections] of turns.entries()) {
  const input = {
    turn: session.state.turn,
    selectedActionIds: selections.map((selection) => selection.optionId),
    selections,
  };
  const result = resolveTurn(soloScenario, session.state, input);
  session = {
    ...session,
    revision: session.revision + 1,
    state: result.nextState,
    turnInputs: [...session.turnInputs, input],
    history: [...session.history, result],
    updatedAt: new Date().toISOString(),
  };
  console.log(`Turn ${index + 1}: ${result.summary} replay=${result.replayHash}`);
}

const exportPayload = sessionExportSchema.parse({
  exportedAt: new Date().toISOString(),
  session,
});

console.log(JSON.stringify({
  turn: session.state.turn,
  score: session.state.campaignScore,
  outcome: session.state.campaignOutcome,
}));
console.log(JSON.stringify(exportPayload));
console.log(JSON.stringify(validateReplaySession(soloScenario, session)));
