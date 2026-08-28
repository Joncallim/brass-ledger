import test from "node:test";
import assert from "node:assert/strict";
import { defaultScenarioId, getDefaultScenario, getScenario, listScenarios } from "./scenario-registry";

test("the canonical scenario registry resolves the configured default by immutable identity", () => {
  const scenario = getDefaultScenario();
  assert.equal(scenario.id, defaultScenarioId);
  assert.equal(getScenario(scenario.id, scenario.contentVersion), scenario);
  assert.equal(getScenario(scenario.id, "missing-version"), undefined);
  assert.deepEqual(listScenarios().map((entry) => entry.id), [defaultScenarioId]);
});
