import test, { after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { soloScenario } from "@brass-ledger/content";
import { createInitialGameSession } from "@brass-ledger/shared";
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
