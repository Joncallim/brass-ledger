import test from "node:test";
import assert from "node:assert/strict";
import { soloScenario, spriteVisualLanguage } from "@brass-ledger/content";
import type { ScenarioSummary } from "@brass-ledger/shared";

import { scenarioLabels } from "../src/lib/labels.ts";

function toScenarioSummary(): ScenarioSummary {
  return {
    id: soloScenario.id,
    title: soloScenario.title,
    description: soloScenario.description,
    contentVersion: soloScenario.contentVersion,
    maxTurns: soloScenario.maxTurns,
    chiefs: soloScenario.chiefs,
    staffCapacities: soloScenario.staffCapacities,
    staffFunctions: soloScenario.staffFunctions,
    capabilityPrograms: soloScenario.capabilityPrograms,
    externalConstraints: soloScenario.externalConstraints,
    events: soloScenario.events,
    doctrineLens: soloScenario.doctrineLens,
    spriteVisualLanguage,
  };
}

test("scenarioLabels().event returns the scenario-backed title for a known event id", () => {
  const labels = scenarioLabels(toScenarioSummary());
  const knownEvent = soloScenario.events[0];
  assert.ok(knownEvent);
  assert.equal(labels.event(knownEvent.id), knownEvent.title);
  assert.equal(labels.eventSummary(knownEvent.id), knownEvent.summary);
});

test("scenarioLabels().event never echoes an unknown raw id", () => {
  const labels = scenarioLabels(toScenarioSummary());
  const unknownId = "some-internal-event-code-1234";
  const label = labels.event(unknownId);
  assert.notEqual(label, unknownId);
  assert.equal(label, "Unknown active event");
  assert.equal(labels.eventSummary(unknownId), null);
});

test("scenarioLabels().program and .constraint resolve known labels and never echo unknown ids", () => {
  const labels = scenarioLabels(toScenarioSummary());
  const knownProgram = soloScenario.capabilityPrograms[0];
  const knownConstraint = soloScenario.externalConstraints[0];
  assert.ok(knownProgram);
  assert.ok(knownConstraint);
  assert.equal(labels.program(knownProgram.id), knownProgram.label);
  assert.equal(labels.constraint(knownConstraint.id), knownConstraint.label);

  assert.notEqual(labels.program("unknown-program-id"), "unknown-program-id");
  assert.notEqual(labels.constraint("unknown-constraint-id"), "unknown-constraint-id");
});

test("scenarioLabels() handles a null scenario without throwing and never leaks ids", () => {
  const labels = scenarioLabels(null);
  assert.equal(labels.event("anything"), "Unknown active event");
  assert.equal(labels.program("anything"), "Unknown capability program");
  assert.equal(labels.constraint("anything"), "Unknown external constraint");
});
