#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { soloScenario } from "@brass-ledger/content";
import {
  buildAdvisorPortraitSvg,
  buildDirectorateBurden,
  buildStaffFunctionReadouts,
  createInitialGameSession,
  gameSessionSchema,
  sessionExportSchema,
  turnInputSchema,
  type GameSession,
  type TurnInput,
} from "@brass-ledger/shared";
import { deriveDecisionMemos, resolveTurn, validateReplaySession } from "@brass-ledger/sim";

type CliOptions = {
  turns: number;
  json: boolean;
  sprites: boolean;
  inputPath: string | null;
  sessionPath: string | null;
  exportPath: string | null;
  validate: boolean;
};

function readOptions(argv: string[]): CliOptions {
  const options: CliOptions = {
    turns: 1,
    json: false,
    sprites: false,
    inputPath: null,
    sessionPath: null,
    exportPath: null,
    validate: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") options.json = true;
    if (arg === "--sprites") options.sprites = true;
    if (arg === "--validate") options.validate = true;
    if (arg === "--turns") {
      const value = Number(argv[index + 1]);
      if (!Number.isInteger(value) || value < 0) {
        throw new Error("--turns must be a non-negative integer.");
      }
      options.turns = value;
      index += 1;
    }
    if (arg === "--input") {
      const value = argv[index + 1];
      if (!value) throw new Error("--input requires a JSON file path.");
      options.inputPath = value;
      index += 1;
    }
    if (arg === "--session") {
      const value = argv[index + 1];
      if (!value) throw new Error("--session requires a JSON file path.");
      options.sessionPath = value;
      index += 1;
    }
    if (arg === "--export") {
      const value = argv[index + 1];
      if (!value) throw new Error("--export requires a JSON file path.");
      options.exportPath = value;
      index += 1;
    }
  }

  return options;
}

async function readJsonFile(filePath: string) {
  return JSON.parse(await readFile(filePath, "utf8")) as unknown;
}

async function readSession(filePath: string | null) {
  if (!filePath) {
    return {
      ...createInitialGameSession(soloScenario, "cli-headless"),
      id: "cli-headless",
    };
  }

  const parsed = await readJsonFile(filePath);
  const exported = sessionExportSchema.safeParse(parsed);
  if (exported.success) {
    return exported.data.session;
  }
  return gameSessionSchema.parse(parsed);
}

async function readInputs(filePath: string | null) {
  if (!filePath) return [];
  const parsed = await readJsonFile(filePath);
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  return entries.map((entry) => turnInputSchema.parse(entry));
}

function defaultInput(session: GameSession): TurnInput {
  const memos = deriveDecisionMemos(soloScenario, session.state);
  return {
    turn: session.state.turn,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    selections: memos
      .filter((memo) => !memo.optional)
      .map((memo) => ({
        memoId: memo.id,
        optionId: memo.options[0]?.id ?? "",
      }))
      .filter((selection) => selection.optionId.length > 0),
  };
}

async function runHeadlessCampaign(options: CliOptions) {
  let session = await readSession(options.sessionPath);
  const providedInputs = await readInputs(options.inputPath);

  const turnSummaries = [];
  for (let index = 0; index < options.turns && session.state.campaignStatus === "active"; index += 1) {
    const input = providedInputs[index] ?? defaultInput(session);
    const result = resolveTurn(soloScenario, session.state, input);
    session = {
      ...session,
      revision: session.revision + 1,
      state: result.nextState,
      turnInputs: [...session.turnInputs, input],
      history: [...session.history, result],
      updatedAt: new Date().toISOString(),
    };
    turnSummaries.push({
      turn: input.turn,
      summary: result.summary,
      replayHash: result.replayHash,
      staffFunctions: result.staffFunctions.map((entry) => ({
        id: entry.id,
        status: entry.status,
        burdenPoints: entry.burdenPoints,
        capacity: entry.capacity,
        warnings: entry.warnings,
      })),
      triggeredEvents: result.triggeredEvents.map((event) => event.id),
      internalTech: result.internalTech.map((n) => ({ id: n.id, level: n.level, progress: n.progress })),
      externalTech: result.externalTech.map((n) => ({
        id: n.id, level: n.level, estimatedLevel: n.estimate.estimatedLevel,
        confidence: n.estimate.confidence, visibility: n.estimate.visibility,
      })),
    });
  }

  const validation = options.validate ? validateReplaySession(soloScenario, session) : undefined;
  if (options.exportPath) {
    await writeFile(
      options.exportPath,
      JSON.stringify(
        sessionExportSchema.parse({
          exportedAt: new Date().toISOString(),
          session,
        }),
        null,
        2,
      ),
      "utf8",
    );
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
      staffFunctions: buildStaffFunctionReadouts(
        soloScenario.staffFunctions,
        buildDirectorateBurden(deriveDecisionMemos(soloScenario, session.state), [], soloScenario.staffCapacities),
        session.state,
      ),
      techTree: {
        internalTech: session.state.internalTech.map((n) => ({ id: n.id, level: n.level, progress: n.progress })),
        externalTech: session.state.externalTech.map((n) => ({
          id: n.id,
          level: n.level,
          estimatedLevel: n.estimate.estimatedLevel,
          confidence: n.estimate.confidence,
          visibility: n.estimate.visibility,
        })),
        fieldedCount: session.state.internalTech.filter((n) => n.level === 2).length,
        disruptedCount: session.state.externalTech.filter((n) => n.level === 0).length,
      },
    },
    turnSummaries,
    validation,
    exportedTo: options.exportPath ?? undefined,
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
const output = await runHeadlessCampaign(options);

if (options.json) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`${output.scenario.title} headless engine`);
  console.log(`Session ${output.session.id}: turn ${output.session.turn}, status ${output.session.status}, score ${output.session.score}`);
  for (const summary of output.turnSummaries) {
    console.log(`Turn ${summary.turn}: ${summary.summary} replay=${summary.replayHash}`);
  }
  const tt = output.session.techTree;
  console.log(`Tech tree: ${tt.fieldedCount} program(s) fielded, ${tt.disruptedCount} industry node(s) disrupted`);
  for (const n of tt.internalTech) {
    console.log(`  program ${n.id}: level ${n.level}, progress ${n.progress}`);
  }
  for (const n of tt.externalTech) {
    console.log(`  industry ${n.id}: true level ${n.level}, estimated ${n.estimatedLevel} (${n.visibility} conf ${n.confidence})`);
  }
  if (output.validation) {
    console.log(`Replay validation: ${output.validation.ok ? "ok" : output.validation.failureKind}`);
  }
  if (output.exportedTo) {
    console.log(`Exported session to ${output.exportedTo}`);
  }
  if (options.sprites) {
    console.log(`Generated ${output.sprites?.length ?? 0} advisor sprite SVG payloads.`);
  }
}
