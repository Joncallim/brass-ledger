import test from "node:test";
import assert from "node:assert/strict";
import { soloScenario, spriteVisualLanguage } from "@brass-ledger/content";
import { buildAdvisorPortraitSvg, buildSpritePixels, spritePixelRuns, spriteSpecSchema, gameSessionSchema, SPRITE_NEGATIVE_PROMPT, createInitialGameSession, type TurnInput } from "@brass-ledger/shared";
import { acceptedRiskCandidatesForInput, createBatchSession, hashPromptText, replicateSeedFor, runHeadlessBatch, runHeadlessCampaign } from "./index";

const canonicalPrompt =
  "Military staff advisor portrait for a strategic command simulation, S1 Personnel, Sprite Chief, calm, calm, restrained editorial game art, clean bust portrait, readable at small size, consistent uniform silhouette, muted palette, no photorealism, no fantasy armor, no weapons, neutral command-room background.";

test("hashPromptText matches the verified SHA-256 vectors", () => {
  assert.equal(hashPromptText(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  assert.equal(Buffer.byteLength(canonicalPrompt, "utf8"), 309, "canonical prompt is 309 UTF-8 bytes");
  assert.equal(hashPromptText(canonicalPrompt), "d35ef1dbc9f589fa92203dcf51b38a8c8007d65956f290172190b67ba2a3ad02");
  assert.equal(Buffer.byteLength(SPRITE_NEGATIVE_PROMPT, "utf8"), 201, "negative prompt is 201 UTF-8 bytes");
  assert.equal(hashPromptText(SPRITE_NEGATIVE_PROMPT), "f5a675f7b6db06a46dba4ed29f5ef0133754805f6840f3432f6917be1387a140");
  assert.match(hashPromptText("any value"), /^[0-9a-f]{64}$/, "full lowercase 64-hex output");
});

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
    assert.ok(sprite.spec.variant, "variant render controls are present on every spec");
    assert.ok(Array.isArray(sprite.spec.variant.effects), "effects array is present");
    assert.equal(sprite.svg, buildAdvisorPortraitSvg(sprite.spec));
    assert.match(sprite.svg, /^<svg/);
    // Sprite 4 (#82): the emitted SVG is exactly the run-grouped serialization of
    // the canonical pixel matrix, and the matrix is a full 24×28 opaque grid.
    assert.ok(sprite.svg.includes('shape-rendering="crispEdges"'), "pixel renderer root carries crispEdges");
    const pixelRender = buildSpritePixels(sprite.spec);
    assert.equal(pixelRender.output.cells.length, 24 * 28);
    const rects = (sprite.svg.match(/<rect /g) ?? []).length;
    assert.equal(rects, spritePixelRuns(pixelRender.output.cells).length, "one rect per horizontal run");
    assert.ok(sprite.spec.temperament.length > 0, "temperament is copied from the chief");
    assert.ok(sprite.spec.prompt.length > 0, "positive prompt is filled");
    assert.equal(sprite.spec.negativePrompt, SPRITE_NEGATIVE_PROMPT);
    assert.equal(sprite.promptHash, hashPromptText(sprite.spec.prompt), "promptHash is SHA-256 of the exact spec prompt");
    assert.equal(sprite.negativePromptHash, hashPromptText(sprite.spec.negativePrompt), "negativePromptHash is SHA-256 of the exact spec negative prompt");
    assert.match(sprite.promptHash, /^[0-9a-f]{64}$/);
    assert.match(sprite.negativePromptHash, /^[0-9a-f]{64}$/);
  }
  // NOTE: this run resolves one real turn, so the sim has already derived real S2/S4 staff
  // mechanics into the state — the S4 chief may legitimately show the harness. The neutral
  // zero-history case is asserted in the determinism test below (v2 Changes #5).
});

test("sprite output is deterministic for the same supplied session", async () => {
  const session = createInitialGameSession(soloScenario, "sprite-headless-session");
  const first = await runHeadlessCampaign({ session: structuredClone(session), turns: 0, includeSprites: true });
  const second = await runHeadlessCampaign({ session: structuredClone(session), turns: 0, includeSprites: true });
  assert.deepEqual(first.sprites, second.sprites);
  // Hashes are stable across runs and re-derive from the exact emitted spec strings.
  assert.deepEqual(first.sprites!.map((sprite) => sprite.promptHash), second.sprites!.map((sprite) => sprite.promptHash));
  for (const sprite of first.sprites ?? []) {
    assert.equal(sprite.promptHash, hashPromptText(sprite.spec.prompt), "re-derived hash matches the emitted sibling");
    // Zero history means the burden falls back to "light" and trust is not strained, so no
    // precedence override fires — expression must be the authored base expression.
    assert.equal(sprite.spec.expression, spriteVisualLanguage[sprite.spec.role].baseExpression, `${sprite.spec.role} must fall through to its authored base expression`);
  }
  // Zero history + fresh content fixture: staffMechanics come straight from the schema-parsed
  // soloScenario initial state (S4 tempo 50 >= 15, S2 confidence 46 > 42), so the S2/S4 role
  // signals are genuinely neutral — no crop, no harness (v2 Changes #5).
  const s4 = first.sprites!.find((sprite) => sprite.spec.role === "S4");
  const s2 = first.sprites!.find((sprite) => sprite.spec.role === "S2");
  assert.equal(s4?.spec.variant.supportDetail, "none", "zero-history S4 tempo 50 is not bottlenecked");
  assert.equal(s4?.spec.variant.framing, "default");
  assert.equal(s2?.spec.variant.framing, "default", "zero-history S2 confidence 46 is not low");
});

test("sprite variants respond to final session state and latest history burden", async () => {
  const base = createInitialGameSession(soloScenario, "sprite-variant-session");
  // Run one real turn so history carries schema-valid chief positions to mutate.
  const warmed = await runHeadlessCampaign({ session: structuredClone(base), turns: 1, includeSprites: false });
  const session = warmed.sessionExport;
  // Controlled final state: lost campaign, strained trust for every chief, S2/S4 staff
  // signals in the bottleneck ranges, and an overloaded burden on the latest history entry.
  for (const advisor of session.advisorRoster) {
    session.state.chiefTrust[advisor.chiefId] = 30;
  }
  session.state.campaignStatus = "lost";
  session.state.staffMechanics.s2.externalEstimateConfidence = 30;
  session.state.staffMechanics.s4.supportableTempo = 10;
  const last = session.history.at(-1)!;
  last.chiefPositions = last.chiefPositions.map((entry) => ({
    ...entry,
    staffReadoutEvidence: { ...entry.staffReadoutEvidence, burdenLevel: "overloaded" },
  }));

  const output = await runHeadlessCampaign({ session: structuredClone(session), turns: 0, includeSprites: true });
  const byRole = new Map(output.sprites!.map((sprite) => [sprite.spec.role, sprite]));
  const s1 = byRole.get("S1")!;
  const s2 = byRole.get("S2")!;
  const s4 = byRole.get("S4")!;
  assert.equal(s1.spec.expression, "severe", "lost campaign drives severe");
  assert.equal(s1.spec.variant.posture, "closed", "strained trust closes the posture");
  assert.equal(s1.spec.variant.backgroundDarkenOpacity, 0.22, "overload darkens the background");
  assert.equal(s1.spec.variant.saturation, 0.45, "loss desaturates");
  assert.deepEqual(s1.spec.variant.effects, ["trust-low", "directorate-overloaded", "campaign-lost"], "canonical effects order");
  assert.equal(s2.spec.variant.framing, "tight", "S2 low confidence crops the frame");
  assert.equal(s4.spec.variant.supportDetail, "utility-harness", "S4 bottleneck shows the utility harness");
  assert.equal(s4.spec.variant.posture, "closed");
  for (const sprite of output.sprites ?? []) {
    assert.ok(sprite.spec.prompt.includes("severe"), "every chief prompt carries the severe token when lost");
    assert.equal(sprite.promptHash, hashPromptText(sprite.spec.prompt), "re-derived hash matches the emitted sibling");
    assert.equal(sprite.negativePromptHash, hashPromptText(sprite.spec.negativePrompt));
  }
  // Same supplied session twice → deep-equal sprite outputs, SVG, and hashes.
  const again = await runHeadlessCampaign({ session: structuredClone(session), turns: 0, includeSprites: true });
  assert.deepEqual(output.sprites, again.sprites);
});

test("sprite prompts and hashes stay outside the saved session", async () => {
  const output = await runHeadlessCampaign({ turns: 0, includeSprites: true });
  assert.ok(output.sprites, "sprites are emitted when opted in");
  assert.ok(output.sessionExport, "raw GameSession sibling is present");
  gameSessionSchema.parse(output.sessionExport);
  const forbidden = ["prompt", "negativePrompt", "promptHash", "negativePromptHash", "deterministicSeed", "temperament", "variant", "effects", "posture", "framing", "supportDetail", "saturation", "backgroundDarkenOpacity", "pixelGrid", "pixelMatrix", "pixels", "svg", "png"];
  const keys: string[] = [];
  const collect = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(collect);
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        keys.push(key);
        collect(child);
      }
    }
  };
  collect(output.sessionExport);
  for (const key of forbidden) {
    assert.equal(keys.includes(key), false, `session JSON must not contain ${key}`);
  }
  assert.equal("sprites" in output.sessionExport, false, "sprites is a sibling of sessionExport, not nested in it");
});

test("a small batch is deterministic across independent runs", async () => {
  const first = await runHeadlessBatch(16);
  const second = await runHeadlessBatch(16);
  assert.deepEqual(first, second);
});

test("batch telemetry reports replay-safe intent and packet strategy families", async () => {
  const telemetry = await runHeadlessBatch(16);
  assert.ok(telemetry.packetFamilies.length > 0, "complete packet families are retained");
  assert.ok(telemetry.packetFamilies.every((family) => family.packetId === family.selections.join("|") && family.turns > 0 && family.campaigns > 0));
  assert.ok(telemetry.intentFamilies.length > 0, "the batch policy declares an observed main effort");
  assert.ok(telemetry.intentFamilies.every((family) => family.turns > 0 && family.campaigns > 0));
  assert.ok(telemetry.optionalMemoTakeRate > 0 && telemetry.optionalMemoTakeRate < 1, "the optional memo remains a real choice");
  assert.equal(telemetry.repeatedOptionLoopRate, 1, "the current fixed policy makes its loop visible rather than hiding it");
  assert.equal(Object.keys(telemetry.overloadProfileByStrategy).length, 4);
  assert.equal(Object.keys(telemetry.programmeCompletionRates).length, soloScenario.capabilityPrograms.length);
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
  assert.equal(telemetry.pairCount, 240);
  assert.equal(telemetry.simulationCount, 480);
  assert.equal(telemetry.moduleSetRows.length, 8, "four strategies × enabled/disabled");
  assert.ok(telemetry.moduleSetRows.every((row) => row.campaigns === 60 && row.pairCount === 60 && row.simulationCount === 60));
  assert.ok(telemetry.moduleSetRows.filter((row) => row.moduleSet === "enabled").every((row) => row.meanCoordinationLoad === 0.4));
  assert.ok(telemetry.moduleSetRows.filter((row) => row.moduleSet === "disabled").every((row) => row.meanCoordinationLoad === 0));
  assert.ok(telemetry.pairedDeltas.some((delta) => Math.abs(delta.meanScoreDelta) >= 0.5 || Math.abs(delta.winRateDelta) >= 0.02));
  assert.ok(telemetry.pairedDeltas.some((delta) => delta.meanIncidentLadderDelta !== 0 || delta.meanStaffSynchronizationDelta !== 0));
  assert.ok(telemetry.twoVsSevenCalibration.meanIncidentLadderDelta >= 2);
  assert.ok(telemetry.twoVsSevenCalibration.meanStaffSynchronizationDelta <= -6);
  assert.ok(telemetry.twoVsSevenCalibration.meanScoreDelta <= 2);
  assert.ok(telemetry.twoVsSevenCalibration.winRateDelta <= 0.05);
  assert.ok(telemetry.scoreStats.p75 > 0 && telemetry.scoreStats.p75 >= telemetry.scoreStats.p25);
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
    assert.ok(event.moduleSet && event.strategyId, "event counters retain both pairing dimensions");
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

  // No dominant no-tradeoff doctrine strategy in EITHER module set. The D4 gate runs
  // independently per module set: within each set, no overuse strategy may beat its own
  // balanced-cycle cohort by >5 score AND >10pp win rate with no higher doctrine-event
  // cost mass, and none may sit at the 100/100 ceiling (winRate 1.0 AND meanScore 100).
  // The >50pp win-rate signal warning is allowed to exist (it is the calibration signal),
  // but no strict gate warning may fire. The module-pair detector (enabled strategy vs its
  // disabled twin) is a SEPARATE Doctrine 5 field and must likewise report no dominance.
  assert.deepEqual(telemetry.dominantDoctrineStrategies, []);
  assert.deepEqual(telemetry.modulePairDominance, [], "no enabled strategy may dominate its disabled twin");
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
