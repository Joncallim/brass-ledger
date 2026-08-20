export { soloScenario } from "./scenario";
export { doctrineGenes, resolveDoctrineGenes } from "./doctrine-genes";
import type { EventDefinition } from "@brass-ledger/shared";

/** Doctrine 4 authored adverse mass, shared by static balance lint and batch telemetry. */
export function doctrineEventCostMass(event: EventDefinition) {
  const delta = event.stateDelta;
  return Math.abs(delta.resources?.readiness ?? 0) + Math.abs(delta.resources?.politicalCapital ?? 0) + Math.abs(delta.alliance?.politicalAlignment ?? 0) + Math.abs(delta.alliance?.partnerPublicSupport ?? 0) + Math.abs(delta.domestic?.cabinetCover ?? 0) + Math.abs(delta.domestic?.publicPatience ?? 0) + Math.abs(delta.forceGeneration?.trainingThroughput ?? 0) + Math.max(0, delta.domestic?.mediaHeat ?? 0);
}
