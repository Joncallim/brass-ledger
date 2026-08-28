import { scenarioDefinitionSchema, type ScenarioDefinition } from "@brass-ledger/shared";
import { soloScenario } from "./scenario";

/**
 * Scenario variants deliberately reuse the common rules vocabulary, but not a
 * common campaign problem. The engine never branches on these ids: each
 * difference is authored through ordinary scenario data.
 */
function variant(mutator: (scenario: ScenarioDefinition) => void): ScenarioDefinition {
  const scenario = structuredClone(soloScenario);
  mutator(scenario);
  // CampaignState preserves these legacy top-level convenience fields alongside
  // the strategic namespace. Keep authored openings identical in both views.
  scenario.initialState.strategic.forceGeneration = structuredClone(scenario.initialState.forceGeneration);
  scenario.initialState.strategic.sustainment = structuredClone(scenario.initialState.sustainment);
  scenario.initialState.strategic.alliance = structuredClone(scenario.initialState.alliance);
  scenario.initialState.strategic.domestic = structuredClone(scenario.initialState.domestic);
  scenario.initialState.strategic.escalation = structuredClone(scenario.initialState.escalation);
  return scenarioDefinitionSchema.parse(scenario);
}

export const shortWarningCoalitionScenario = variant((scenario) => {
  scenario.id = "short-warning-coalition";
  scenario.title = "Narrow Strait";
  scenario.contentVersion = "0.12.0-short-warning";
  scenario.description = "A coalition crisis has arrived with little warning. You have a capable force already in theater, but political room and allied patience are thin. Move quickly enough to make the coalition credible without spending the mandate that keeps it together.";
  scenario.maxTurns = 8;
  scenario.initialState.maxTurns = 8;
  scenario.initialState.seed = 24017;
  scenario.initialState.forceGeneration.deployableUnits += 1.4;
  scenario.initialState.alliance.reassurance -= 10;
  scenario.initialState.alliance.partnerParticipation -= 8;
  scenario.initialState.domestic.cabinetCover -= 9;
  scenario.initialState.escalation.warningTime -= 12;
  scenario.initialState.escalation.probeTempo += 5;
  // This campaign is about coalition signalling under a deadline, not a long
  // force-development programme. Removing the development packet changes the
  // monthly decision structure as well as the horizon.
  scenario.memoTemplates = scenario.memoTemplates.filter((memo) => memo.id !== "force-development");
  // Events arrive earlier and the late rebuild payoffs do not have time to
  // mature, making warning, posture, and alliance choices binding.
  scenario.events = scenario.events
    .filter((event) => !["training-payoff", "experience-dividend", "depot-breakthrough"].includes(event.id))
    .map((event) => ({ ...event, minTurn: Math.max(1, event.minTurn - 1), maxTurn: Math.min(8, event.maxTurn) }));
});

export const longRebuildScenario = variant((scenario) => {
  scenario.id = "long-rebuild-industrial";
  scenario.title = "Foundry Winter";
  scenario.contentVersion = "0.12.0-long-rebuild";
  scenario.description = "You inherit a headquarters whose readiness has been hollowed out by years of deferred repair. The immediate theater is quieter, but industrial capacity and recovery time are scarce. Build a force that can endure without letting the political mandate decay first.";
  scenario.maxTurns = 16;
  scenario.initialState.maxTurns = 16;
  scenario.initialState.seed = 61043;
  scenario.initialState.forceGeneration.deployableUnits -= 1.8;
  scenario.initialState.forceGeneration.reserveStrain += 9;
  scenario.initialState.sustainment.depotBacklog += 14;
  scenario.initialState.sustainment.munitionsSufficiency -= 11;
  scenario.initialState.escalation.probeTempo -= 4;
  scenario.initialState.escalation.warningTime += 8;
  // Political framing is still available, but starts as discretionary work;
  // the mandatory packet becomes readiness, sustainment, intelligence, and
  // force development rather than a reskinned baseline.
  const alliance = scenario.memoTemplates.find((memo) => memo.id === "alliance-frame");
  if (alliance) alliance.optional = true;
  // Extend the industrial and recovery arcs into the second year while
  // suppressing early crisis spikes that would make the opening a rescale.
  scenario.events = scenario.events
    .filter((event) => !["threshold-incident", "adversary-probe-surge", "alliance-signaling-backfire"].includes(event.id))
    .map((event) => ({
      ...event,
      minTurn: ["training-payoff", "depot-breakthrough", "experience-dividend", "public-patience-recovery"].includes(event.id) ? event.minTurn + 3 : event.minTurn,
      maxTurn: ["training-payoff", "depot-breakthrough", "experience-dividend", "public-patience-recovery"].includes(event.id) ? 16 : Math.min(16, event.maxTurn + 2),
    }));
});
