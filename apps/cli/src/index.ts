#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { HeadlessAcceptedRiskError, runHeadlessBatch, runHeadlessCampaign } from "@brass-ledger/headless";
import {
  createFileSystemSaveStore,
  migrateSessionPayload,
  resolveSaveDirWithMigration,
  type SaveStore,
} from "@brass-ledger/save-store";
import {
  gameSessionSchema,
  sessionExportSchema,
  turnInputSchema,
  type GameSession,
} from "@brass-ledger/shared";

type CliOptions = {
  turns: number;
  batch: number | null;
  json: boolean;
  sprites: boolean;
  inputPath: string | null;
  sessionPath: string | null;
  resumeId: string | null;
  exportPath: string | null;
  save: boolean;
  listSessions: boolean;
  validate: boolean;
  autoAcceptRisks: boolean;
};

function readOptions(argv: string[]): CliOptions {
  const options: CliOptions = {
    turns: 1,
    batch: null,
    json: false,
    sprites: false,
    inputPath: null,
    sessionPath: null,
    resumeId: null,
    exportPath: null,
    save: false,
    listSessions: false,
    validate: false,
    autoAcceptRisks: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") options.json = true;
    if (arg === "--sprites") options.sprites = true;
    if (arg === "--validate") options.validate = true;
    if (arg === "--auto-accept-risks") options.autoAcceptRisks = true;
    if (arg === "--save") options.save = true;
    if (arg === "--list" || arg === "--list-sessions") options.listSessions = true;
    if (arg === "--resume") {
      const value = argv[index + 1];
      if (!value) throw new Error("--resume requires a session ID.");
      options.resumeId = value;
      index += 1;
    }
    if (arg === "--batch") {
      const value = Number(argv[index + 1]);
      if (!Number.isInteger(value) || value < 1) {
        throw new Error("--batch must be a positive integer.");
      }
      options.batch = value;
      index += 1;
    }
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
    return null;
  }

  const parsed = await readJsonFile(filePath);
  if (parsed && typeof parsed === "object" && "session" in (parsed as Record<string, unknown>)) {
    const value = parsed as Record<string, unknown>;
    const exported = sessionExportSchema.safeParse({ ...value, session: migrateSessionPayload(value.session) });
    if (exported.success) {
      return exported.data.session;
    }
  }
  return gameSessionSchema.parse(migrateSessionPayload(parsed));
}

async function readInputs(filePath: string | null) {
  if (!filePath) return [];
  const parsed = await readJsonFile(filePath);
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  return entries.map((entry) => turnInputSchema.parse(entry));
}

const options = readOptions(process.argv.slice(2));

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const saveDir = resolveSaveDirWithMigration([
  path.resolve(moduleDir, "../saves"),
  path.resolve(moduleDir, "../../../../data/saves"),
  path.resolve(moduleDir, "../../../data/saves"),
]);
const saveStore: SaveStore = createFileSystemSaveStore(saveDir);

if (options.listSessions) {
  const sessions = await saveStore.list();
  if (sessions.length === 0) {
    console.log("No saved sessions found.");
  } else {
    console.log(`Saved sessions (${saveDir}):`);
    for (const session of sessions) {
      const turnLabel = session.state.campaignOutcome ?? `turn ${session.state.turn}/${session.state.maxTurns}`;
      console.log(`  ${session.id}  revision=${session.revision}  ${session.updatedAt}  ${turnLabel}`);
    }
  }
  process.exit(0);
}

if (options.batch !== null) {
  const telemetry = await runHeadlessBatch(options.batch);
  if (options.json) {
    console.log(JSON.stringify(telemetry, null, 2));
  } else {
    const { outcomeDistribution: od, scoreStats: ss, dominantOptions, overloadFrequency, acceptedRiskFrequency } = telemetry;
    console.log(`Batch: ${telemetry.campaignCount} campaigns, ${telemetry.totalTurns} total turns`);
    console.log(`Outcomes: ${od.won} won / ${od.lost} lost / ${od.active} active`);
    console.log(`Score: min ${ss.min} p25 ${ss.p25} mean ${ss.mean} p75 ${ss.p75} max ${ss.max}`);
    const fulfil = telemetry.commitmentFulfillmentRate;
    const breach = telemetry.commitmentBreachRate;
    if (fulfil !== null && breach !== null) {
      console.log(`Commitments: ${(fulfil * 100).toFixed(0)}% fulfilled, ${(breach * 100).toFixed(0)}% breached`);
    }
    console.log(`Avg negotiations/campaign: ${telemetry.negotiationFrequency.toFixed(2)}`);
    const overloadKeys = Object.keys(overloadFrequency).sort();
    if (overloadKeys.length > 0) {
      console.log(`Overload frequency per turn: ${overloadKeys.map((k) => `${k}=${(overloadFrequency[k] * 100).toFixed(0)}%`).join(" ")}`);
    }
    const riskKeys = Object.keys(acceptedRiskFrequency).sort();
    if (riskKeys.length > 0) {
      console.log(`Accepted-risk frequency per turn: ${riskKeys.map((k) => `${k}=${(acceptedRiskFrequency[k] * 100).toFixed(0)}%`).join(" ")}`);
    }
    if (dominantOptions.length > 0) {
      console.log("DOMINANT OPTIONS DETECTED (>75% selection rate for their memo):");
      for (const entry of dominantOptions) {
        console.log(`  ${entry.memoId}:${entry.optionId} = ${(entry.selectionRate * 100).toFixed(0)}%`);
      }
    } else {
      console.log("No dominant options detected.");
    }
  }
  process.exit(0);
}

let session: GameSession | null = null;
let initialRevision: number | undefined;
if (options.sessionPath) {
  const loaded = await readSession(options.sessionPath);
  if (!loaded) {
    console.error(`Failed to read session from ${options.sessionPath}`);
    process.exit(1);
  }
  session = loaded;
  initialRevision = session.revision;
} else if (options.resumeId) {
  try {
    session = await saveStore.read(options.resumeId);
    initialRevision = session.revision;
  } catch {
    console.error(`Session not found: ${options.resumeId}`);
    process.exit(1);
  }
}

const inputs = await readInputs(options.inputPath);
let output;

try {
  output = await runHeadlessCampaign({
    turns: options.turns,
    session: session ?? undefined,
    inputs,
    validate: options.validate,
    includeSprites: options.sprites,
    autoAcceptRisks: options.autoAcceptRisks,
  });
} catch (error) {
  if (error instanceof HeadlessAcceptedRiskError) {
    if (options.json) {
      console.error(JSON.stringify({ error: error.message, acceptedRiskCandidates: error.acceptedRiskCandidates }, null, 2));
    } else {
      console.error(error.message);
      console.error("Add the listed acceptedRiskOverrides to the input file, or pass --auto-accept-risks for unattended batch runs.");
      for (const risk of error.acceptedRiskCandidates) {
        console.error(`  ${risk.staffFunctionId}: ${risk.warningText}`);
      }
    }
    process.exit(1);
  }
  throw error;
}

if (options.exportPath) {
  await writeFile(
    options.exportPath,
    JSON.stringify(
      sessionExportSchema.parse({
        exportedAt: new Date().toISOString(),
        session: output.sessionExport,
      }),
      null,
      2,
    ),
    "utf8",
  );
}

if (options.save) {
  try {
    await saveStore.write(output.sessionExport, initialRevision);
    if (options.json) {
      console.error(JSON.stringify({ saved: true, sessionId: output.sessionExport.id, saveDir }));
    } else {
      console.log(`Saved session ${output.sessionExport.id} to ${saveDir}`);
    }
  } catch (error) {
    if (options.json) {
      console.error(JSON.stringify({ saved: false, error: error instanceof Error ? error.message : "unknown error" }));
    } else {
      console.error(`Failed to save session: ${error instanceof Error ? error.message : "unknown error"}`);
    }
    process.exit(1);
  }
}

if (options.json) {
  const { sessionExport: _sessionExport, ...jsonOutput } = output;
  console.log(JSON.stringify({ ...jsonOutput, exportedTo: options.exportPath ?? undefined }, null, 2));
} else {
  console.log(`${output.scenario.title} headless engine`);
  console.log(`Session ${output.session.id}: turn ${output.session.turn}, status ${output.session.status}, score ${output.session.score}`);
  for (const summary of output.turnSummaries) {
    console.log(`Turn ${summary.turn}: ${summary.summary} replay=${summary.replayHash} acceptedRisks=${summary.acceptedRisks.length}`);
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
  if (options.exportPath) {
    console.log(`Exported session to ${options.exportPath}`);
  }
  if (options.sprites) {
    console.log(`Generated ${output.sprites?.length ?? 0} advisor sprite SVG payloads.`);
  }
}
