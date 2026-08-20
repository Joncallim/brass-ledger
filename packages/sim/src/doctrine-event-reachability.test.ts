import test from "node:test";
import assert from "node:assert/strict";
import { soloScenario } from "@brass-ledger/content";
import type { CampaignState, MemoSelection, ScenarioDefinition, TurnInput } from "@brass-ledger/shared";
import { deriveDecisionMemos, resolveTurn } from "./index.ts";

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }

function legalSelections(): MemoSelection[][] {
  const memos = deriveDecisionMemos(soloScenario, soloScenario.initialState);
  const choices: Array<MemoSelection[] | null> = [[]];
  for (const memo of memos) {
    const next: Array<MemoSelection[] | null> = [];
    for (const partial of choices) {
      if (!partial) continue;
      if (memo.optional) next.push(partial);
      for (const option of memo.options) next.push([...partial, { memoId: memo.id, optionId: option.id }]);
    }
    choices.splice(0, choices.length, ...next);
  }
  return choices.filter((choice): choice is MemoSelection[] => choice !== null);
}

function runTrace(selection: MemoSelection[], turns: number, scenario: ScenarioDefinition = soloScenario) {
  let state: CampaignState = clone(scenario.initialState);
  const results = [];
  for (let index = 0; index < turns && state.campaignStatus === "active"; index += 1) {
    const input: TurnInput = { turn: state.turn, selectedActionIds: [], selections: clone(selection), acceptedRiskOverrides: [], staffNegotiations: [] };
    const result = resolveTurn(scenario, state, input);
    results.push(result);
    state = result.nextState;
  }
  return results;
}

test("every Doctrine 4 event has a legal repeated witness and avoid trace", () => {
  const selections = legalSelections();
  for (const event of soloScenario.events.filter((candidate) => candidate.doctrineTrigger)) {
    const turns = event.doctrineTrigger!.sustainedTurns + 1;
    const witness = selections.find((selection) => runTrace(selection, turns).some((result) => result.triggeredEvents.some((triggered) => triggered.id === event.id)));
    const avoid = selections.find((selection) => !runTrace(selection, turns).some((result) => result.triggeredEvents.some((triggered) => triggered.id === event.id)));
    assert.ok(witness, `${event.id} has no legal witness`);
    assert.ok(avoid, `${event.id} has no legal avoid trace`);
  }
});

test("Doctrine 4 fires on the authored maturity turns", () => {
  const selections = legalSelections();
  const expected = new Map([
    ["doctrine-coalition-caveat-exposure", 2],
    ["doctrine-adaptive-cell-sprawl", 2],
    ["doctrine-sustainment-patience-gap", 3],
  ]);
  for (const [eventId, turn] of expected) {
    const event = soloScenario.events.find((candidate) => candidate.id === eventId)!;
    const trace = selections.map((selection) => runTrace(selection, turn)).find((results) => results.some((result) => result.triggeredEvents.some((triggered) => triggered.id === eventId)));
    assert.ok(trace, `${eventId} did not fire`);
    assert.equal(trace!.findIndex((result) => result.triggeredEvents.some((triggered) => triggered.id === eventId)) + 1, turn);
  }
});

test("baseline does not fire doctrine events without their trigger tags", () => {
  const result = resolveTurn(soloScenario, soloScenario.initialState, { turn: 1, selectedActionIds: [], selections: legalSelections()[0] ?? [], acceptedRiskOverrides: [], staffNegotiations: [] });
  assert.equal(result.triggeredEvents.filter((event) => event.doctrineTrigger).length, 0);
});

test("fired doctrine events discard maturity only after preserving the causal note", () => {
  const event = soloScenario.events.find((candidate) => candidate.id === "doctrine-coalition-caveat-exposure")!;
  const selection = legalSelections().find((candidate) => runTrace(candidate, 2).some((result) => result.triggeredEvents.some((triggered) => triggered.id === event.id)));
  assert.ok(selection);
  const results = runTrace(selection!, 2);
  const fired = results[1];
  assert.ok(fired.triggeredEvents.some((candidate) => candidate.id === event.id));
  assert.equal(fired.nextState.doctrineMaturity[event.id], undefined);
  assert.ok(fired.afterAction.some((note) => note.heading === `Doctrine risk matured: ${event.title}` && note.detail.includes(event.doctrineTrigger!.vulnerability)));
});

test("an unreachable doctrine threshold has no legal witness within the campaign horizon", () => {
  // relativeTempo never reaches 100 under any legal repeated selection: slow-burn drags
  // it down and surge-exercises cannot push it to the ceiling within maxTurns.
  const event = soloScenario.events.find((candidate) => candidate.id === "doctrine-sustainment-patience-gap")!;
  const unreachable: ScenarioDefinition = {
    ...soloScenario,
    events: [
      ...soloScenario.events.filter((candidate) => candidate.id !== event.id),
      { ...event, id: "doctrine-unreachable-threshold", doctrineTrigger: { ...event.doctrineTrigger!, conditions: [{ variable: "relativeTempo", comparison: "gte", threshold: 100 }] } },
    ],
  };
  const selections = legalSelections();
  const witness = selections.find((selection) => runTrace(selection, 12, unreachable).some((result) => result.triggeredEvents.some((triggered) => triggered.id === "doctrine-unreachable-threshold")));
  assert.equal(witness, undefined, "an impossible threshold must have no witness trace");
});
