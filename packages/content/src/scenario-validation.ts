import type { ScenarioDefinition } from "@brass-ledger/shared";

/** Stable, scenario-agnostic authoring checks. Deep doctrine/content checks
 * remain below in validate-content.ts; this guard ensures every registry entry
 * gets the fundamental campaign-contract checks rather than only the default. */
export function validateScenarioRegistry(scenarios: readonly ScenarioDefinition[]): void {
  const identities = new Set<string>();
  const ids = new Set<string>();
  for (const scenario of scenarios) {
    if (!scenario.id.trim() || !scenario.title.trim() || !scenario.description.trim()) {
      throw new Error("Every scenario needs a player-facing id, title, and description.");
    }
    if (ids.has(scenario.id)) throw new Error(`Duplicate scenario id: ${scenario.id}`);
    ids.add(scenario.id);
    const identity = `${scenario.id}@${scenario.contentVersion}`;
    if (identities.has(identity)) throw new Error(`Duplicate scenario identity: ${identity}`);
    identities.add(identity);
    if (scenario.maxTurns < 6 || scenario.initialState.turn !== 1 || scenario.initialState.maxTurns !== scenario.maxTurns) {
      throw new Error(`Scenario ${scenario.id} has an invalid campaign horizon.`);
    }
    if (scenario.memoTemplates.length < 4 || scenario.memoTemplates.length > 5) {
      throw new Error(`Scenario ${scenario.id} must surface 4-5 decision memos each month.`);
    }
    const openingVariantIds = new Set<string>();
    for (const variant of scenario.openingVariants) {
      if (openingVariantIds.has(variant.id)) throw new Error(`Scenario ${scenario.id} repeats opening variant ${variant.id}.`);
      openingVariantIds.add(variant.id);
      if (Object.keys(variant.stateDelta).length === 0) throw new Error(`Scenario ${scenario.id} opening variant ${variant.id} has no authored change.`);
    }
    const programmeIds = new Set(scenario.capabilityPrograms.map((programme) => programme.id));
    const constraintIds = new Set(scenario.externalConstraints.map((constraint) => constraint.id));
    const memoIds = new Set<string>();
    for (const memo of scenario.memoTemplates) {
      if (memoIds.has(memo.id)) throw new Error(`Scenario ${scenario.id} repeats memo id ${memo.id}.`);
      memoIds.add(memo.id);
      const optionIds = new Set<string>();
      for (const option of memo.options) {
        if (optionIds.has(option.id)) throw new Error(`Scenario ${scenario.id} repeats option ${memo.id}:${option.id}.`);
        optionIds.add(option.id);
        for (const push of option.programPushes) if (!programmeIds.has(push.programId)) throw new Error(`Scenario ${scenario.id} memo ${memo.id} references unknown programme ${push.programId}.`);
        for (const shift of option.constraintShifts) if (!constraintIds.has(shift.constraintId)) throw new Error(`Scenario ${scenario.id} memo ${memo.id} references unknown constraint ${shift.constraintId}.`);
      }
    }
    const eventIds = new Set<string>();
    for (const event of scenario.events) {
      if (eventIds.has(event.id)) throw new Error(`Scenario ${scenario.id} repeats event id ${event.id}.`);
      eventIds.add(event.id);
      if (event.minTurn > event.maxTurn || event.minTurn > scenario.maxTurns) throw new Error(`Scenario ${scenario.id} event ${event.id} is outside its campaign horizon.`);
      for (const shift of event.constraintShifts) if (!constraintIds.has(shift.constraintId)) throw new Error(`Scenario ${scenario.id} event ${event.id} references unknown constraint ${shift.constraintId}.`);
    }
  }
}
