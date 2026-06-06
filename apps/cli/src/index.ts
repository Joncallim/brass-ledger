#!/usr/bin/env node

import { soloScenario } from "@brass-ledger/content";
import { buildAdvisorPortraitSvg, createInitialGameSession, type GameSession, type TurnInput } from "@brass-ledger/shared";
import { deriveDecisionMemos, resolveTurn } from "@brass-ledger/sim";

type CliOptions = {
  turns: number;
  json: boolean;
  sprites: boolean;
};

function readOptions(argv: string[]): CliOptions {
  const options: CliOptions = {
    turns: 1,
    json: false,
    sprites: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") options.json = true;
    if (arg === "--sprites") options.sprites = true;
    if (arg === "--turns") {
      const value = Number(argv[index + 1]);
      if (!Number.isInteger(value) || value < 0) {
        throw new Error("--turns must be a non-negative integer.");
      }
      options.turns = value;
      index += 1;
    }
  }

  return options;
}

function defaultInput(session: GameSession): TurnInput {
  const memos = deriveDecisionMemos(soloScenario, session.state);
  return {
    turn: session.state.turn,
    selectedActionIds: [],
    selections: memos
      .filter((memo) => !memo.optional)
      .map((memo) => ({
        memoId: memo.id,
        optionId: memo.options[0]?.id ?? "",
      }))
      .filter((selection) => selection.optionId.length > 0),
  };
}

function runHeadlessCampaign(options: CliOptions) {
  let session: GameSession = {
    ...createInitialGameSession(soloScenario, "cli-headless"),
    id: "cli-headless",
  };

  const turnSummaries = [];
  for (let index = 0; index < options.turns && session.state.campaignStatus === "active"; index += 1) {
    const input = defaultInput(session);
    const result = resolveTurn(soloScenario, session.state, input);
    session = {
      ...session,
      state: result.nextState,
      turnInputs: [...session.turnInputs, input],
      history: [...session.history, result],
      updatedAt: new Date().toISOString(),
    };
    turnSummaries.push({
      turn: input.turn,
      summary: result.summary,
      replayHash: result.replayHash,
      triggeredEvents: result.triggeredEvents.map((event) => event.id),
    });
  }

  return {
    scenario: {
      id: soloScenario.id,
      title: soloScenario.title,
      contentVersion: soloScenario.contentVersion,
    },
    session: {
      id: session.id,
      turn: session.state.turn,
      status: session.state.campaignStatus,
      score: session.state.campaignScore,
      outcome: session.state.campaignOutcome,
    },
    turnSummaries,
    sprites: options.sprites
      ? session.advisorRoster.map((advisor) => ({
          chiefId: advisor.chiefId,
          displayName: advisor.displayName,
          title: advisor.title,
          directorate: advisor.directorate,
          svg: buildAdvisorPortraitSvg(advisor.portrait),
        }))
      : undefined,
  };
}

const options = readOptions(process.argv.slice(2));
const output = runHeadlessCampaign(options);

if (options.json) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`${output.scenario.title} headless engine`);
  console.log(`Session ${output.session.id}: turn ${output.session.turn}, status ${output.session.status}, score ${output.session.score}`);
  for (const summary of output.turnSummaries) {
    console.log(`Turn ${summary.turn}: ${summary.summary} replay=${summary.replayHash}`);
  }
  if (options.sprites) {
    console.log(`Generated ${output.sprites?.length ?? 0} advisor sprite SVG payloads.`);
  }
}
