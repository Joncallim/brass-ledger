import test from "node:test";
import assert from "node:assert/strict";
import { soloScenario } from "@brass-ledger/content";
import { createBatchSession, replicateSeedFor, runHeadlessBatch } from "./index";

test("batch campaigns use paired replicate seeds across strategies", () => {
  const balanced = createBatchSession(0); // balanced-cycle, replicate 0
  const sustainment = createBatchSession(3); // sustainment-delay, replicate 0
  const nextReplicate = createBatchSession(4); // balanced-cycle, replicate 1

  assert.equal(balanced.state.seed, balanced.initialState.seed, "state.seed === initialState.seed");
  assert.equal(balanced.state.seed, sustainment.state.seed, "all four strategies share one numeric seed per replicate");
  assert.notEqual(balanced.state.seed, nextReplicate.state.seed, "different replicates get different seeds");
  assert.equal(replicateSeedFor(0), soloScenario.initialState.seed);
  assert.equal(replicateSeedFor(1), soloScenario.initialState.seed + 1009);
});

test("a small batch is deterministic across independent runs", async () => {
  const first = await runHeadlessBatch(16);
  const second = await runHeadlessBatch(16);
  assert.deepEqual(first, second);
});

test("N=240 satisfies the doctrine balance gates with real balanced hit rates", async () => {
  const telemetry = await runHeadlessBatch(240);

  // 60 campaigns per strategy, stable sorting.
  assert.equal(telemetry.campaignCount, 240);
  for (const strategy of telemetry.doctrineStrategies) {
    assert.equal(strategy.campaigns, 60);
    assert.ok(strategy.meanScore > 0);
  }
  assert.deepEqual(telemetry.doctrineEvents.map((entry) => entry.eventId), [...telemetry.doctrineEvents.map((entry) => entry.eventId)].sort());
  assert.deepEqual(telemetry.doctrineStrategies.map((entry) => entry.strategyId), [...telemetry.doctrineStrategies.map((entry) => entry.strategyId)].sort());

  // Targeted maturation 0.70-1.00 and firing reliability exactly 1.0.
  for (const event of telemetry.doctrineEvents) {
    assert.ok(event.maturationRate >= 0.70 && event.maturationRate <= 1.00, `${event.eventId} maturation ${event.maturationRate} outside 0.70-1.00`);
    assert.equal(event.firingReliability, 1, `${event.eventId} firing reliability must be 1`);
  }

  // Balanced cohort hit rates are real (balanced fires are attributed) and < 0.85.
  const balanced = telemetry.doctrineStrategies.find((strategy) => strategy.strategyId === "balanced-cycle")!;
  assert.ok(balanced.doctrineCampaignHitRate > 0, "balanced doctrine fires must be attributed (not a 0 artifact)");
  assert.ok(balanced.doctrineCampaignHitRate < 0.85, `balanced campaign hit rate ${balanced.doctrineCampaignHitRate} must stay below 0.85`);

  // Each targeted strategy carries positive authored event cost mass.
  for (const strategy of telemetry.doctrineStrategies) {
    if (strategy.strategyId !== "balanced-cycle") {
      assert.ok(strategy.meanDoctrineEventCostMass > 0, `${strategy.strategyId} must have positive event cost mass`);
    }
  }

  // No dominant no-tradeoff strategy (spec rule: >5 score, >10pp win rate, and no higher
  // doctrine-event cost than balanced). The >50pp win-rate signal warning is allowed to
  // exist (it is the calibration signal), but no strict gate warning may fire.
  assert.deepEqual(telemetry.dominantDoctrineStrategies, []);
  const strictGateWarnings = telemetry.balanceWarnings.filter((warning) => !warning.includes("win-rate advantage"));
  assert.deepEqual(strictGateWarnings, [], `unexpected balance gate warnings: ${strictGateWarnings.join("; ")}`);

  // Existing aggregates remain populated.
  assert.ok(Object.keys(telemetry.overloadFrequency).length > 0);
  assert.ok(Object.keys(telemetry.acceptedRiskFrequency).length > 0);
  assert.equal(typeof telemetry.negotiationFrequency, "number");
  assert.equal(typeof telemetry.commitmentFulfillmentRate, "number");
  assert.ok(telemetry.optionSelectionRates.length > 0);
  assert.ok(telemetry.totalTurns > 0);
});

test("two N=240 runs deep-equal telemetry", async () => {
  const first = await runHeadlessBatch(240);
  const second = await runHeadlessBatch(240);
  assert.deepEqual(first, second, "paired-seed batches are fully deterministic in telemetry");
});
