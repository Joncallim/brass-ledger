export { soloScenario } from "./scenario";
export { longRebuildScenario, shortWarningCoalitionScenario, staffExerciseScenario } from "./scenario-variants";
export { defaultScenarioId, getDefaultScenario, getScenario, listScenarios, scenarioRegistry } from "./scenario-registry";
export { doctrineGenes, resolveDoctrineGenes } from "./doctrine-genes";
export { staffModuleDefinitions, resolveStaffModules } from "./staff-module-definitions";
export { spriteVisualLanguage } from "./sprite-visual-language";
import type { EventDefinition } from "@brass-ledger/shared";

/** Doctrine 4 authored adverse mass, shared by static balance lint and batch telemetry. */
export function doctrineEventCostMass(event: EventDefinition) {
  const delta = event.stateDelta;
  // Good-variable lanes count only adverse (negative) deltas; a positive delta on these
  // lanes is a benefit, not a cost. mediaHeat, incidentLadder, and reserveStrain are
  // adverse when positive; deployableUnits is adverse when negative.
  return Math.max(0, -(delta.resources?.readiness ?? 0)) + Math.max(0, -(delta.resources?.politicalCapital ?? 0)) + Math.max(0, -(delta.alliance?.politicalAlignment ?? 0)) + Math.max(0, -(delta.alliance?.partnerPublicSupport ?? 0)) + Math.max(0, -(delta.domestic?.cabinetCover ?? 0)) + Math.max(0, -(delta.domestic?.publicPatience ?? 0)) + Math.max(0, -(delta.forceGeneration?.trainingThroughput ?? 0)) + Math.max(0, delta.domestic?.mediaHeat ?? 0) + Math.max(0, delta.escalation?.incidentLadder ?? 0) + Math.max(0, delta.forceGeneration?.reserveStrain ?? 0) + Math.max(0, -(delta.forceGeneration?.deployableUnits ?? 0));
}
