import test, { after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { soloScenario } from "@brass-ledger/content";
import { createInitialGameSession, SPRITE_NEGATIVE_PROMPT } from "@brass-ledger/shared";
import { hashPromptText } from "@brass-ledger/headless";
import { deriveDecisionMemos } from "@brass-ledger/sim";

const tempDir = await mkdtemp(path.join(tmpdir(), "brass-ledger-cli-"));

after(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

function defaultInputPath(name: string) {
  const session = {
    ...createInitialGameSession(soloScenario, "cli-test"),
    id: "cli-test",
  };
  const memos = deriveDecisionMemos(soloScenario, session.state);
  const input = {
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
  return writeJson(name, input);
}

async function writeJson(name: string, value: unknown) {
  const filePath = path.join(tempDir, name);
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
  return filePath;
}

function runCli(args: string[]) {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(process.execPath, ["--import", "tsx", "src/index.ts", ...args], {
      cwd: process.cwd(),
      env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("default JSON run records accepted risks and validates replay", async () => {
  const result = await runCli(["--turns", "1", "--json", "--validate"]);

  assert.equal(result.code, 0, result.stderr);
  const body = JSON.parse(result.stdout);
  assert.equal(body.validation.ok, true);
  assert.ok(body.turnSummaries[0].acceptedRisks.length > 0);
  assert.ok(body.turnSummaries[0].chiefPositions.length > 0);
  assert.ok(body.turnSummaries[0].chiefPositions.every((entry: { staffReadoutEvidence?: { rationale?: string } }) => entry.staffReadoutEvidence?.rationale?.includes("evidence")));
  assert.ok(body.turnSummaries[0].chiefCoalitions.length > 0);
  assert.ok(body.turnSummaries[0].chiefCoalitions.every((entry: { negotiationLevers: string[] }) => entry.negotiationLevers.length > 0));
  assert.equal(body.sessionExport, undefined, "CLI JSON output should not dump the full session by default");
});

test("--sprites adds schema payloads to JSON and preserves plain-text count output", async () => {
  const json = await runCli(["--turns", "1", "--sprites", "--json"]);
  assert.equal(json.code, 0, json.stderr);
  const body = JSON.parse(json.stdout);
  assert.equal(body.sprites.length, 6);
  const sprite = body.sprites[0];
  assert.ok(sprite.spec.prompt.length > 0, "positive prompt is filled");
  assert.match(sprite.spec.prompt, /^Military staff advisor portrait for a strategic command simulation, /);
  assert.equal(sprite.spec.negativePrompt, SPRITE_NEGATIVE_PROMPT);
  assert.ok(sprite.spec.variant, "variant render controls are present");
  assert.ok(Array.isArray(sprite.spec.variant.effects), "variant effects are an ordered array");
  assert.equal(sprite.promptHash, hashPromptText(sprite.spec.prompt), "promptHash is SHA-256 of the emitted prompt");
  assert.equal(sprite.negativePromptHash, hashPromptText(sprite.spec.negativePrompt), "negativePromptHash is SHA-256 of the emitted negative prompt");
  assert.match(sprite.promptHash, /^[0-9a-f]{64}$/);
  assert.match(sprite.negativePromptHash, /^[0-9a-f]{64}$/);
  assert.match(sprite.svg, /^<svg/);
  assert.equal(body.sessionExport, undefined);

  const text = await runCli(["--turns", "1", "--sprites"]);
  assert.equal(text.code, 0, text.stderr);
  assert.match(text.stdout, /Generated 6 advisor sprite SVG payloads\./);
  assert.equal(text.stdout.includes("Military staff advisor portrait for a strategic command simulation"), false, "plain mode must not print the positive prompt");
  assert.equal(text.stdout.includes(SPRITE_NEGATIVE_PROMPT), false, "plain mode must not print the negative prompt");
});

test("supplied input without accepted-risk overrides is rejected", async () => {
  const inputPath = await defaultInputPath("strict-input.json");
  const result = await runCli(["--input", inputPath]);

  assert.equal(result.code, 1);
  assert.match(result.stderr, /acceptedRiskOverrides/i);
  assert.match(result.stderr, /--auto-accept-risks/i);
});

test("batch run outputs balance telemetry with outcome distribution and option rates", async () => {
  const result = await runCli(["--batch", "12", "--json"]);

  assert.equal(result.code, 0, result.stderr);
  const body = JSON.parse(result.stdout);
  assert.ok(typeof body.campaignCount === "number" && body.campaignCount === 12);
  assert.ok(typeof body.totalTurns === "number" && body.totalTurns > 0);
  assert.ok(typeof body.outcomeDistribution === "object");
  assert.ok((body.outcomeDistribution.won ?? 0) + (body.outcomeDistribution.lost ?? 0) + (body.outcomeDistribution.active ?? 0) === 12);
  assert.ok(Array.isArray(body.optionSelectionRates) && body.optionSelectionRates.length > 0);
  assert.ok(Array.isArray(body.dominantOptions));
  assert.ok(typeof body.scoreStats === "object");
  assert.ok(typeof body.scoreStats.mean === "number");
});

test("batch run produces varied selection rates when cycling options", async () => {
  const result = await runCli(["--batch", "9", "--json"]);

  assert.equal(result.code, 0, result.stderr);
  const body = JSON.parse(result.stdout);
  const memoIds = new Set<string>(body.optionSelectionRates.map((entry: { memoId: string }) => entry.memoId));
  assert.ok(memoIds.size >= 4, "at least 4 memos should appear in selection rates");
  const rates = body.optionSelectionRates.map((entry: { selectionRate: number }) => entry.selectionRate);
  const maxRate = Math.max(...rates);
  assert.ok(maxRate <= 1.0, "no option can have a selection rate above 100%");
});

test("batch text output shows outcome and dominant-option report", async () => {
  const result = await runCli(["--batch", "6"]);

  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /Batch:/);
  assert.match(result.stdout, /Outcomes:/);
  assert.match(result.stdout, /Score:/);
  assert.match(result.stdout, /dominant options/i);
});

test("auto-accept flag fills supplied input risks and writes a replayable export", async () => {
  const inputPath = await defaultInputPath("auto-input.json");
  const exportPath = path.join(tempDir, "export.json");
  const result = await runCli(["--input", inputPath, "--auto-accept-risks", "--json", "--validate", "--export", exportPath]);

  assert.equal(result.code, 0, result.stderr);
  const body = JSON.parse(result.stdout);
  assert.equal(body.validation.ok, true);
  assert.ok(body.turnSummaries[0].acceptedRisks.length > 0);
  assert.equal(body.exportedTo, exportPath);

  const exported = JSON.parse(await readFile(exportPath, "utf8"));
  assert.equal(exported.session.history.length, 1);
  assert.deepEqual(
    exported.session.turnInputs[0].acceptedRiskOverrides,
    body.turnSummaries[0].acceptedRisks.map(({ staffFunctionId, warningText }: { staffFunctionId: string; warningText: string }) => ({
      staffFunctionId,
      warningText,
    })),
  );
});

test("batch output includes doctrine telemetry, strategy outcomes, and balance warnings", async () => {
  const text = await runCli(["--batch", "8"]);
  assert.equal(text.code, 0, text.stderr);
  assert.match(text.stdout, /Doctrine event telemetry:/);
  assert.match(text.stdout, /doctrine-sustainment-patience-gap/);
  assert.match(text.stdout, /Doctrine strategies:/);
  assert.match(text.stdout, /balanced-cycle/);
  assert.match(text.stdout, /WARNING: Doctrine balance gates are calibrated for --batch 240 or larger\./);

  const json = await runCli(["--batch", "8", "--json"]);
  assert.equal(json.code, 0, json.stderr);
  const body = JSON.parse(json.stdout);
  assert.equal(body.campaignCount, 8);
  assert.equal(body.doctrineEvents.length, 6, "event telemetry is paired by enabled/disabled module set");
  assert.ok(body.doctrineEvents.every((event: { moduleSet: string; strategyId: string }) => ["enabled", "disabled"].includes(event.moduleSet) && event.strategyId));
  assert.equal(body.doctrineStrategies.length, 4);
  assert.ok(body.doctrineStrategies.every((strategy: { campaigns: number }) => strategy.campaigns === 2));
  assert.ok(body.doctrineStrategies.every((strategy: { doctrineCampaignHitRate: number }) => typeof strategy.doctrineCampaignHitRate === "number"));
  assert.ok(Array.isArray(body.dominantDoctrineStrategies));
  assert.ok(Array.isArray(body.balanceWarnings));
});

test("batch JSON projects resolver-backed enabled/disabled module rows and human output orders S1-S5 first", async () => {
  const json = await runCli(["--batch", "8", "--json"]);
  assert.equal(json.code, 0, json.stderr);
  const body = JSON.parse(json.stdout);
  assert.equal(body.moduleSetRows.length, body.doctrineStrategies.length * 2);
  assert.deepEqual(new Set(body.moduleSetRows.map((row: { moduleSet: string }) => row.moduleSet)), new Set(["enabled", "disabled"]));
  assert.ok(body.moduleSetRows.every((row: { strategyId: string; moduleSet: string }) => row.strategyId && row.moduleSet));

  const text = await runCli(["--turns", "1"]);
  assert.equal(text.code, 0, text.stderr);
  const optional = text.stdout.indexOf("Optional staff cells:");
  assert.ok(optional >= 0, "human mode shows optional cells");
  const core = ["  S1:", "  S2:", "  S3:", "  S4:", "  S5:"];
  for (const marker of core) assert.ok(text.stdout.indexOf(marker) >= 0 && text.stdout.indexOf(marker) < optional, `${marker} precedes optional cells`);
});
