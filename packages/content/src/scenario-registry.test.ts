import test from "node:test";
import assert from "node:assert/strict";
import { defaultScenarioId, getDefaultScenario, getScenario, listScenarios } from "./scenario-registry";

test("the canonical scenario registry resolves the configured default by immutable identity", () => {
  const scenario = getDefaultScenario();
  assert.equal(scenario.id, defaultScenarioId);
  assert.equal(getScenario(scenario.id, scenario.contentVersion), scenario);
  assert.equal(getScenario(scenario.id, "missing-version"), undefined);
  assert.deepEqual(listScenarios().map((entry) => entry.id), [defaultScenarioId, "short-warning-coalition", "long-rebuild-industrial"]);
});

test("registered scenarios differ through authored campaign structure, not only opening values", () => {
  const [baseline, shortWarning, longRebuild] = listScenarios();
  assert.ok(baseline && shortWarning && longRebuild);
  assert.equal(shortWarning.maxTurns, 8);
  assert.equal(shortWarning.memoTemplates.length, baseline.memoTemplates.length - 1);
  assert.ok(shortWarning.events.length < baseline.events.length);
  assert.equal(longRebuild.maxTurns, 16);
  assert.equal(longRebuild.memoTemplates.find((memo) => memo.id === "alliance-frame")?.optional, true);
  assert.ok(longRebuild.events.some((event) => event.maxTurn === 16));
});
