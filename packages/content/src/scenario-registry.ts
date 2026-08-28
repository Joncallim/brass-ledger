import type { ScenarioDefinition } from "@brass-ledger/shared";
import { soloScenario } from "./scenario";
import { longRebuildScenario, shortWarningCoalitionScenario, staffExerciseScenario } from "./scenario-variants";

/**
 * Canonical authored scenario registry.  Runtime callers must resolve a
 * scenario from the persisted session identity; `defaultScenarioId` is only
 * for creating a new campaign when the caller deliberately omits a choice.
 */
export const scenarioRegistry = [staffExerciseScenario, soloScenario, shortWarningCoalitionScenario, longRebuildScenario] as const satisfies readonly ScenarioDefinition[];

export const defaultScenarioId = soloScenario.id;

export function listScenarios(): readonly ScenarioDefinition[] {
  return scenarioRegistry;
}

export function getScenario(scenarioId: string, contentVersion?: string): ScenarioDefinition | undefined {
  return scenarioRegistry.find((scenario) =>
    scenario.id === scenarioId && (contentVersion === undefined || scenario.contentVersion === contentVersion),
  );
}

export function getDefaultScenario(): ScenarioDefinition {
  const scenario = getScenario(defaultScenarioId);
  if (!scenario) throw new Error(`The configured default scenario '${defaultScenarioId}' is not registered.`);
  return scenario;
}
