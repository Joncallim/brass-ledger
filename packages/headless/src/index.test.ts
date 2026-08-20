import test from "node:test";
import assert from "node:assert/strict";
import { soloScenario, spriteVisualLanguage } from "@brass-ledger/content";
import { buildAdvisorPortraitSvg, spriteSpecSchema, createInitialGameSession, type TurnInput } from "@brass-ledger/shared";
import { acceptedRiskCandidatesForInput, createBatchSession, replicateSeedFor, runHeadlessBatch, runHeadlessCampaign } from "./index";

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

test("sprite output is additive, schema-valid, and renderer-equivalent", async () => {
  const without = await runHeadlessCampaign({ turns: 0 });
  assert.equal(without.sprites, undefined);
  const withSprites = await runHeadlessCampaign({ turns: 1, includeSprites: true });
  assert.equal(withSprites.sprites?.length, 6);
  for (const sprite of withSprites.sprites ?? []) {
    assert.deepEqual(spriteSpecSchema.parse(sprite.spec), sprite.spec);
    assert.equal(sprite.svg, buildAdvisorPortraitSvg(sprite.spec));
    assert.match(sprite.svg, /^<svg/);
  }
});

test("sprite output is deterministic for the same supplied session", async () => {
  const session = createInitialGameSession(soloScenario, "sprite-headless-session");
  const first = await runHeadlessCampaign({ session: structuredClone(session), turns: 0, includeSprites: true });
  const second = await runHeadlessCampaign({ session: structuredClone(session), turns: 0, includeSprites: true });
  assert.deepEqual(first.sprites, second.sprites);
  // Zero history means the burden falls back to "light" and trust is not strained, so no
  // precedence override fires — expression must be the authored base expression.
  for (const sprite of first.sprites ?? []) {
    assert.equal(sprite.spec.expression, spriteVisualLanguage[sprite.spec.role].baseExpression, `${sprite.spec.role} must fall through to its authored base expression`);
  }
});

test("a small batch is deterministic across independent runs", async () => {
  const first = await runHeadlessBatch(16);
  const second = await runHeadlessBatch(16);
  assert.deepEqual(first, second);
});

test("partial strategy cohorts retain zero-valued telemetry", async () => {
  for (const campaignCount of [1, 2, 3]) {
    const telemetry = await runHeadlessBatch(campaignCount);
    assert.equal(telemetry.doctrineStrategies.length, 4, `N=${campaignCount} includes every cohort`);
    for (const strategy of telemetry.doctrineStrategies) {
      if (strategy.campaigns === 0) {
        assert.deepEqual(
          {
            meanScore: strategy.meanScore,
            winRate: strategy.winRate,
            meanDoctrineEvents: strategy.meanDoctrineEvents,
            meanDoctrineEventCostMass: strategy.meanDoctrineEventCostMass,
            doctrineCampaignHitRate: strategy.doctrineCampaignHitRate,
          },
          { meanScore: 0, winRate: 0, meanDoctrineEvents: 0, meanDoctrineEventCostMass: 0, doctrineCampaignHitRate: 0 },
          `N=${campaignCount} zeroes unassigned ${strategy.strategyId}`,
        );
      }
    }
  }
});

test("structured doctrine summaries retain matching accepted risks from the firing turn", async () => {
  const eventId = "doctrine-sustainment-patience-gap";
  const session = createInitialGameSession(soloScenario, "firing-turn-risk");
  session.state = {
    ...structuredClone(soloScenario.initialState),
    turn: 3,
    doctrineMechanics: { ...soloScenario.initialState.doctrineMechanics, relativeTempo: 28 },
    doctrineMaturity: { [eventId]: { consecutiveTurns: 2, startedTurn: 1, acceptedRiskRefs: [] } },
  };
  const input: TurnInput = {
    turn: 3,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    staffNegotiations: [],
    selections: [
      { memoId: "posture", optionId: "quiet-recovery" },
      { memoId: "intelligence-focus", optionId: "warning-net" },
      { memoId: "sustainment-focus", optionId: "repair-first" },
      { memoId: "alliance-frame", optionId: "quiet-reassurance" },
    ],
  };
  const matchingRisk = acceptedRiskCandidatesForInput(session, input).find((risk) => risk.staffFunctionId === "S4" || risk.staffFunctionId === "S5");
  if (!matchingRisk) throw new Error("fixture must project an S4 or S5 accepted-risk warning");

  const output = await runHeadlessCampaign({ session, inputs: [{ ...input, acceptedRiskOverrides: [matchingRisk] }], autoAcceptRisks: true });
  const doctrineEvent = output.turnSummaries[0]?.doctrineEvents.find((event) => event.eventId === eventId);
  assert.ok(doctrineEvent, "mature doctrine event fires");
  assert.ok(
    doctrineEvent!.acceptedRiskRefs.some((risk) => risk.turn === 3 && risk.staffFunctionId === matchingRisk.staffFunctionId && risk.warningText === matchingRisk.warningText),
    "current-turn matching warning is retained even with no prior maturity refs",
  );
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

test("balanced cohort rotates through every posture option (round-2 F2)", async () => {
  const telemetry = await runHeadlessBatch(240);
  const balancedPosture = telemetry.strategyOptionSelectionRates["balanced-cycle"].filter((entry) => entry.memoId === "posture");
  // Pre-round-2, the balanced cohort's sparse campaign index (ci ∈ {0,4,8,…})
  // pinned a 4-option memo to option 0 in every campaign. The dense per-cohort
  // replicate rotation must select all four posture options; per-selection rates
  // skew by campaign length (measured-deterrence campaigns run longest), so the
  // lock is: every option appears, and no option is pinned at ~100%.
  assert.equal(balancedPosture.length, 4, "all four posture options must be selected across the balanced cohort");
  for (const entry of balancedPosture) {
    assert.ok(entry.selectionRate > 0, `posture option ${entry.optionId} never selected in the balanced cohort`);
    assert.ok(entry.selectionRate < 0.6, `posture option ${entry.optionId} selection rate ${entry.selectionRate} shows a pinned rotation`);
  }
});
