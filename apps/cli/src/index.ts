#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { HeadlessAcceptedRiskError, runHeadlessCampaign } from "@brass-ledger/headless";
import {
  gameSessionSchema,
  sessionExportSchema,
  turnInputSchema,
} from "@brass-ledger/shared";

type CliOptions = {
  turns: number;
  json: boolean;
  sprites: boolean;
  inputPath: string | null;
  sessionPath: string | null;
  exportPath: string | null;
  validate: boolean;
  autoAcceptRisks: boolean;
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
    autoAcceptRisks: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") options.json = true;
    if (arg === "--sprites") options.sprites = true;
    if (arg === "--validate") options.validate = true;
    if (arg === "--auto-accept-risks") options.autoAcceptRisks = true;
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

const options = readOptions(process.argv.slice(2));
const session = await readSession(options.sessionPath);
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
