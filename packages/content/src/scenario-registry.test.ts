import test from "node:test";
import assert from "node:assert/strict";
import { defaultScenarioId, getDefaultScenario, getScenario, listScenarios } from "./scenario-registry";
import { createInitialGameSession } from "@brass-ledger/shared";
import { validateScenarioRegistry } from "./scenario-validation";

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

test("registry validation rejects a scenario with an unresolved authored reference", () => {
  const invalid = structuredClone(getDefaultScenario());
  invalid.id = "invalid-reference";
  invalid.memoTemplates[0]!.options[0]!.programPushes[0]!.programId = "not-installed";
  assert.throws(() => validateScenarioRegistry([getDefaultScenario(), invalid]), /unknown programme not-installed/);
});

test("campaign identity selects a bounded authored opening deterministically", () => {
  const scenario = getDefaultScenario();
  const first = createInitialGameSession(scenario, "opening-seed-a");
  const repeated = createInitialGameSession(scenario, "opening-seed-a");
  assert.equal(first.openingVariantId, repeated.openingVariantId);
  assert.deepEqual(first.initialState, repeated.initialState);
  assert.ok(scenario.openingVariants.some((variant) => variant.id === first.openingVariantId));
  assert.notDeepEqual(first.initialState, scenario.initialState);
});
