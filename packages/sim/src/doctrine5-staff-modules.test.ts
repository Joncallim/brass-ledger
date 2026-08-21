import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { soloScenario, staffModuleDefinitions } from "@brass-ledger/content";
import {
  campaignStateSchema,
  optionalStaffModuleSchema,
  type CampaignState,
  type MemoSelection,
  type OptionalStaffModule,
  type ScenarioDefinition,
  type TurnInput,
} from "@brass-ledger/shared";
import {
  chooseEvents,
  coordinationLoad,
  coordinationRequestedEffects,
  previewTurn,
  resolveActiveStaffModules,
  resolveTurn,
  validateReplaySession,
  type Rng,
} from "./index";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Exact two-decimal expectation: the engine stores two-decimal state, so an
 * arithmetic-derived expectation must be rounded or JS float noise (69.18 - 7.55 =
 * 61.63000000000001) fails strictEqual against the engine's 61.63. */
function laneAfter(baseline: number, delta: number): number {
  return Number((baseline + delta).toFixed(2));
}

function scenarioWithModules(ids: OptionalStaffModule[]): ScenarioDefinition {
  const byId = new Map(staffModuleDefinitions.map((definition) => [definition.id, definition]));
  const staffModules = ids.map((id) => {
    const definition = byId.get(id);
    if (!definition) throw new Error(`missing fixture definition ${id}`);
    return definition;
  });
  return {
    ...soloScenario,
    doctrineProfile: { ...soloScenario.doctrineProfile, optionalStaffModules: ids },
    staffModules,
  };
}

const zeroModuleScenario = scenarioWithModules([]);
const allSevenScenario = scenarioWithModules(optionalStaffModuleSchema.options as OptionalStaffModule[]);

const balancedSelections: MemoSelection[] = [
  { memoId: "posture", optionId: "measured-deterrence" },
  { memoId: "intelligence-focus", optionId: "deception-hunt" },
  { memoId: "sustainment-focus", optionId: "repair-first" },
  { memoId: "alliance-frame", optionId: "quiet-reassurance" },
  { memoId: "force-development", optionId: "training-reset" },
];

function inputFor(turn: number, selections: MemoSelection[] = balancedSelections): TurnInput {
  return { turn, selectedActionIds: [], selections: clone(selections), acceptedRiskOverrides: [], staffNegotiations: [] };
}

function runTurns(scenario: ScenarioDefinition, selections: MemoSelection[], turns: number) {
  let state: CampaignState = clone(scenario.initialState);
  const results = [];
  for (let index = 0; index < turns && state.campaignStatus === "active"; index += 1) {
    const result = resolveTurn(scenario, state, inputFor(state.turn, selections));
    results.push(result);
    state = result.nextState;
  }
  return results;
}

// ── Pre-D5 golden and zero-module sim ─────────────────────────────────────────

test("doctrine 5: zero-module scenario is byte-identical to the pinned pre-D5 golden fixture", () => {
  const fixture = JSON.parse(
    readFileSync(new URL("./fixtures/doctrine5-pre-module-balanced.json", import.meta.url), "utf8"),
  ) as {
    input: TurnInput;
    nextState: CampaignState;
    staffFunctions: unknown;
    triggeredEventIds: string[];
    afterAction: unknown;
    replayHash: string;
    summary: string;
  };

  const result = resolveTurn(zeroModuleScenario, zeroModuleScenario.initialState, fixture.input);

  // The locked equality surface: next state, full S1-S5 readouts, event IDs/order,
  // after-action notes, replay hash, and summary. D5 intentionally adds defaulted
  // output keys, so complete TurnResult JSON cannot be byte-identical — the new
  // additive fields are asserted separately as []/0 below.
  assert.deepEqual(result.nextState, fixture.nextState, "normalized nextState must match the 56fee9fa golden");
  assert.deepEqual(result.staffFunctions, fixture.staffFunctions, "full S1-S5 readouts must match the golden");
  assert.deepEqual(result.triggeredEvents.map((event) => event.id), fixture.triggeredEventIds, "event IDs/order must match the golden");
  assert.deepEqual(result.afterAction, fixture.afterAction, "after-action notes must match the golden");
  assert.equal(result.replayHash, fixture.replayHash, "replay hash must match the golden");
  assert.equal(result.summary, fixture.summary, "summary must match the golden");

  // New additive D5 result fields default to empty/zero on the zero-module path.
  assert.deepEqual(result.staffModules, [], "zero-module result has no module readouts");
  assert.equal(result.coordinationLoad, 0, "zero-module result has zero coordination load");
  assert.ok(!result.afterAction.some((note) => note.heading.startsWith("Staff modules:")), "no module note on the zero-module path");
});

test("doctrine 5: event selection and RNG draw count are identical between enabled and disabled on the same first-turn state/input", () => {
  const state = clone(soloScenario.initialState);
  const enabled = resolveTurn(soloScenario, state, inputFor(1));
  const disabled = resolveTurn(zeroModuleScenario, state, inputFor(1));
  assert.deepEqual(disabled.triggeredEvents.map((event) => event.id), enabled.triggeredEvents.map((event) => event.id), "event IDs/order unchanged");

  const allTags = new Set(soloScenario.memoTemplates.flatMap((memo) => memo.options.flatMap((option) => option.tags)));
  const eligible = soloScenario.events.filter((event) => !event.doctrineTrigger && state.turn >= event.minTurn && state.turn <= event.maxTurn && event.triggerTags.every((tag) => allTags.has(tag)) && event.requiredFlags.every((flag) => state.eventFlags[flag]) && !event.excludedFlags.some((flag) => state.eventFlags[flag]));
  let enabledDraws = 0;
  let disabledDraws = 0;
  const enabledRng: Rng = () => { enabledDraws += 1; return 0.5; };
  const disabledRng: Rng = () => { disabledDraws += 1; return 0.5; };
  const enabledChosen = chooseEvents(soloScenario, state, allTags, enabledRng);
  const disabledChosen = chooseEvents(zeroModuleScenario, state, allTags, disabledRng);
  assert.equal(enabledDraws, eligible.length, "one RNG draw per eligible ordinary event (enabled)");
  assert.equal(disabledDraws, eligible.length, "one RNG draw per eligible ordinary event (disabled)");
  assert.deepEqual(disabledChosen.map((event) => event.id), enabledChosen.map((event) => event.id));
});

test("doctrine 5: duplicate definition ids throw at the simulation boundary before load or effects", () => {
  const j6 = staffModuleDefinitions.find((definition) => definition.id === "J6")!;
  const duplicateScenario: ScenarioDefinition = {
    ...soloScenario,
    doctrineProfile: { ...soloScenario.doctrineProfile, optionalStaffModules: ["J6", "J6"] },
    staffModules: [j6, j6],
  };
  // Direct resolveTurn with duplicate definitions must throw (the exported entry
  // point is the boundary; [J6,J6,J8] previously counted 3 for the load formula and
  // applied J6 twice).
  assert.throws(
    () => resolveTurn(duplicateScenario, duplicateScenario.initialState, inputFor(1)),
    /repeat id "J6"/,
    "resolveTurn rejects duplicate definitions",
  );
  assert.throws(
    () =>
      resolveActiveStaffModules({
        definitions: [j6, j6],
        selectedTags: new Set<string>(),
        staffMechanics: clone(soloScenario.initialState.staffMechanics),
        strategic: clone(soloScenario.initialState.strategic),
        resources: clone(soloScenario.initialState.resources),
      }),
    /repeat id "J6"/,
    "resolveActiveStaffModules rejects duplicate definitions",
  );
  // The count used by the coordination formula derives from validated unique ids:
  // [J6,J8] (two unique ids) loads 0, while [J6,J8,J9,STRATCOM] loads 0.4.
  assert.equal(resolveActiveStaffModules({
    definitions: [j6, staffModuleDefinitions.find((definition) => definition.id === "J8")!],
    selectedTags: new Set<string>(),
    staffMechanics: clone(soloScenario.initialState.staffMechanics),
    strategic: clone(soloScenario.initialState.strategic),
    resources: clone(soloScenario.initialState.resources),
  }).coordinationLoad, 0);
});

// ── Coordination curve and counterweight ──────────────────────────────────────

test("doctrine 5: coordination load follows the exact two-decimal curve for counts 0-7", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7].map(coordinationLoad), [0, 0, 0, 0.2, 0.4, 0.6, 0.8, 1]);
  assert.deepEqual(coordinationRequestedEffects(0.2), {
    "doctrine.systemPressure": 2.0,
    "doctrine.staffSynchronization": -2.4,
    "staff.s5.strategicCoherence": -0.4,
    "strategic.escalation.incidentLadder": 0.25,
    "resources.readiness": -0.15,
  });
  assert.deepEqual(coordinationRequestedEffects(0.4), {
    "doctrine.systemPressure": 4.0,
    "doctrine.staffSynchronization": -4.8,
    "staff.s5.strategicCoherence": -0.8,
    "strategic.escalation.incidentLadder": 0.5,
    "resources.readiness": -0.3,
  });
  assert.deepEqual(coordinationRequestedEffects(1), {
    "doctrine.systemPressure": 10.0,
    "doctrine.staffSynchronization": -12.0,
    "staff.s5.strategicCoherence": -2.0,
    "strategic.escalation.incidentLadder": 1.25,
    "resources.readiness": -0.75,
  });
});

test("doctrine 5: three enabled modules apply coordination pressure on the exact adverse lanes and report load 0.20", () => {
  // J7/MED/ENGINEER with the balanced input: none of their ACTIVE rows touch the
  // coordination lanes (J7's benefits are coherence/order-clarity, MED's are
  // recovery/reserve/lift/budget, ENGINEER's are depot/lift/budget/training), and
  // both arms resolve system pressure above the >65 gate symmetrically, so every
  // coordination delta below is observed cleanly.
  const scenario = scenarioWithModules(["J7", "MED", "ENGINEER"]);
  const enabled = resolveTurn(scenario, scenario.initialState, inputFor(1));
  const disabled = resolveTurn(zeroModuleScenario, zeroModuleScenario.initialState, inputFor(1));

  assert.equal(enabled.coordinationLoad, 0.2);
  assert.ok(enabled.staffModules.every((readout) => readout.coordinationLoad === 0.2), "every readout carries the per-turn load");
  assert.ok(enabled.staffModules.every((readout) => readout.status === "coordination-strained"), "any positive load reads coordination-strained");
  assert.equal(enabled.nextState.doctrineMechanics.systemPressure, laneAfter(disabled.nextState.doctrineMechanics.systemPressure, 2), "systemPressure +10*load");
  assert.equal(enabled.nextState.doctrineMechanics.staffSynchronization, laneAfter(disabled.nextState.doctrineMechanics.staffSynchronization, -2.4), "staffSynchronization -12*load");
  assert.equal(enabled.nextState.staffMechanics.s5.strategicCoherence, laneAfter(disabled.nextState.staffMechanics.s5.strategicCoherence, 1.1), "J7 +1.5 coherence benefit minus -2*load coordination");
  assert.equal(enabled.nextState.escalation.incidentLadder, laneAfter(disabled.nextState.escalation.incidentLadder, 0.25), "incident ladder +1.25*load");
  assert.equal(enabled.nextState.resources.readiness, laneAfter(disabled.nextState.resources.readiness, -0.15), "readiness -0.75*load");
  const note = enabled.afterAction.at(-1)!;
  assert.equal(note.heading, "Staff modules: 3 cells active");
  assert.match(note.detail, /Coordination load 0\.20 requested \+2\.00 system pressure, -2\.40 staff synchronization, -0\.40 S5 coherence, \+0\.25 incident ladder, and -0\.15 readiness\./);
});

test("doctrine 5: one and two enabled modules apply their own effects with zero coordination", () => {
  for (const ids of [["MED"], ["MED", "J6"]] as OptionalStaffModule[][]) {
    const scenario = scenarioWithModules(ids);
    const enabled = resolveTurn(scenario, scenario.initialState, inputFor(1));
    const disabled = resolveTurn(zeroModuleScenario, zeroModuleScenario.initialState, inputFor(1));
    assert.equal(enabled.coordinationLoad, 0, `${ids.length} module(s) incur no coordination load`);
    assert.ok(enabled.staffModules.every((readout) => readout.coordinationLoad === 0));
    // MED's standing effects still apply.
    assert.equal(enabled.nextState.staffMechanics.s1.recoveryDebt, laneAfter(disabled.nextState.staffMechanics.s1.recoveryDebt, -2), "MED recovery benefit applies at count 1/2");
    // No coordination lane moves.
    assert.equal(enabled.nextState.doctrineMechanics.systemPressure, laneAfter(disabled.nextState.doctrineMechanics.systemPressure, ids.includes("J6") ? -7.55 : 0), "no coordination system-pressure offset");
    assert.equal(enabled.nextState.doctrineMechanics.staffSynchronization, disabled.nextState.doctrineMechanics.staffSynchronization, "no coordination synchronization offset");
    assert.equal(enabled.nextState.resources.readiness, disabled.nextState.resources.readiness, "no coordination readiness offset");
  }
});

// ── Integer-hundredths accumulation and order independence ────────────────────

test("doctrine 5: overlapping lanes net exactly in integer hundredths, independent of definition order", () => {
  const ids = ["J6", "MED", "ENGINEER", "J9"] as OptionalStaffModule[];
  const defs = ids.map((id) => staffModuleDefinitions.find((definition) => definition.id === id)!);
  const args = {
    definitions: defs,
    selectedTags: new Set<string>(),
    staffMechanics: clone(soloScenario.initialState.staffMechanics),
    strategic: clone(soloScenario.initialState.strategic),
    resources: clone(soloScenario.initialState.resources),
  };
  const forward = resolveActiveStaffModules(args);
  const backward = resolveActiveStaffModules({ ...args, definitions: [...defs].reverse() });
  // J6 -8.00 system pressure (standing) plus four-module coordination +4.00 nets
  // exactly -4.00 before clamp, independent of order.
  assert.equal(forward.moduleDoctrineOffsets["doctrine.systemPressure"], -4);
  assert.deepEqual(backward.moduleDoctrineOffsets, forward.moduleDoctrineOffsets, "offsets are order-independent");
  assert.equal(forward.moduleDoctrineOffsets["doctrine.staffSynchronization"], -4.8);
  assert.equal(forward.moduleDoctrineOffsets["doctrine.orderClarity"], undefined);
  assert.deepEqual(forward.readouts.map((readout) => readout.id), ids, "readout order follows profile order");
  assert.deepEqual(backward.readouts.map((readout) => readout.id), [...ids].reverse(), "reversed definitions reverse the readout order");
});

test("doctrine 5: reordered definitions produce byte-identical next state and replay hash", () => {
  const ordered = allSevenScenario;
  const reversed: ScenarioDefinition = { ...allSevenScenario, staffModules: [...allSevenScenario.staffModules].reverse() };
  const left = resolveTurn(ordered, ordered.initialState, inputFor(1));
  const right = resolveTurn(reversed, reversed.initialState, inputFor(1));
  assert.deepEqual(right.nextState, left.nextState, "closed-lane application is order-independent");
  assert.equal(right.replayHash, left.replayHash, "replay hash is order-independent");
});

// ── Per-module parameterized mechanics ────────────────────────────────────────

test("doctrine 5: every module activates all its conditional rows and moves the real target lanes", () => {
  const modernizationInput = inputFor(1, balancedSelections.map((selection) =>
    selection.memoId === "alliance-frame" ? { memoId: "alliance-frame", optionId: "modernization-case" } : selection,
  ));
  const tourInput = inputFor(1, balancedSelections.map((selection) =>
    selection.memoId === "alliance-frame" ? { memoId: "alliance-frame", optionId: "public-assurance-tour" } : selection,
  ));

  const cases: Array<{
    ids: OptionalStaffModule[];
    input: TurnInput;
    expectedBenefits: Array<{ lane: string; delta: number; activatedByTags: string[] }>;
    expectedPressures: Array<{ lane: string; delta: number; activatedByTags: string[] }>;
    expectLane: (enabled: CampaignState, disabled: CampaignState) => void;
  }> = [
    {
      ids: ["J6"],
      input: inputFor(1),
      expectedBenefits: [{ lane: "doctrine.systemPressure", delta: -8, activatedByTags: [] }],
      expectedPressures: [
        { lane: "staff.s2.deceptionRisk", delta: 1.5, activatedByTags: [] },
        { lane: "resources.budgetAuthority", delta: -1, activatedByTags: [] },
      ],
      expectLane: (enabled, disabled) => {
        assert.equal(enabled.staffMechanics.s2.deceptionRisk, laneAfter(disabled.staffMechanics.s2.deceptionRisk, 1.5), "J6 deception risk pressure applies before the doctrine system-pressure formula");
        assert.equal(enabled.resources.budgetAuthority, laneAfter(disabled.resources.budgetAuthority, -1), "J6 budget authority pressure");
        // J6's -8 enters the doctrine formula: observed as -8 + 0.45 (deceptionRisk +1.5 x 0.3).
        assert.equal(enabled.doctrineMechanics.systemPressure, laneAfter(disabled.doctrineMechanics.systemPressure, -7.55), "J6 system-pressure offset inside the formula");
      },
    },
    {
      ids: ["J7"],
      input: inputFor(1),
      expectedBenefits: [
        { lane: "staff.s5.strategicCoherence", delta: 1.5, activatedByTags: ["standardization", "training"] },
        { lane: "doctrine.orderClarity", delta: 3, activatedByTags: ["standardization", "training"] },
      ],
      expectedPressures: [
        { lane: "strategic.forceGeneration.trainingThroughput", delta: -0.5, activatedByTags: ["standardization", "training"] },
        { lane: "resources.budgetAuthority", delta: -0.25, activatedByTags: [] },
      ],
      expectLane: (enabled, disabled) => {
        assert.equal(enabled.staffMechanics.s5.strategicCoherence, laneAfter(disabled.staffMechanics.s5.strategicCoherence, 1.5), "J7 coherence benefit");
        assert.equal(enabled.doctrineMechanics.orderClarity, laneAfter(disabled.doctrineMechanics.orderClarity, 3), "J7 order-clarity benefit");
        assert.equal(enabled.strategic.forceGeneration.trainingThroughput, laneAfter(disabled.strategic.forceGeneration.trainingThroughput, -0.5), "J7 training throughput pressure");
      },
    },
    {
      ids: ["J8"],
      input: modernizationInput,
      expectedBenefits: [{ lane: "strategic.domestic.cabinetCover", delta: 0.5, activatedByTags: ["program", "modernization", "committee-heavy"] }],
      expectedPressures: [
        { lane: "resources.budgetAuthority", delta: -1, activatedByTags: [] },
        { lane: "strategic.domestic.committeeTolerance", delta: -0.5, activatedByTags: ["program", "modernization", "committee-heavy"] },
      ],
      expectLane: (enabled, disabled) => {
        assert.equal(enabled.strategic.domestic.cabinetCover, laneAfter(disabled.strategic.domestic.cabinetCover, 0.5), "J8 cabinet-cover benefit");
        assert.equal(enabled.strategic.domestic.committeeTolerance, laneAfter(disabled.strategic.domestic.committeeTolerance, -0.5), "J8 committee-tolerance pressure");
      },
    },
    {
      ids: ["J9"],
      input: tourInput,
      // J9's political-alignment benefit is declared STANDING (whenAnyTags: []): the
      // alliance-frame memo is required and every legal option carries at least one
      // of alliance/public-commitment/quiet, so the predicate had no legal avoid
      // witness — it was a standing effect wearing a conditional costume (closing
      // review P2). It always acts; activatedByTags stays [].
      expectedBenefits: [{ lane: "strategic.alliance.politicalAlignment", delta: 0.75, activatedByTags: [] }],
      expectedPressures: [
        { lane: "strategic.domestic.mediaHeat", delta: 1.5, activatedByTags: ["public-commitment"] },
        { lane: "strategic.domestic.cabinetCover", delta: -0.5, activatedByTags: ["public-commitment"] },
        { lane: "resources.budgetAuthority", delta: -0.5, activatedByTags: [] },
      ],
      expectLane: (enabled, disabled) => {
        assert.equal(enabled.strategic.alliance.politicalAlignment, laneAfter(disabled.strategic.alliance.politicalAlignment, 0.75), "J9 political-alignment benefit");
        assert.equal(enabled.strategic.domestic.mediaHeat, laneAfter(disabled.strategic.domestic.mediaHeat, 1.5), "J9 media pressure");
        assert.equal(enabled.strategic.domestic.cabinetCover, laneAfter(disabled.strategic.domestic.cabinetCover, -0.5), "J9 cabinet-cover pressure");
      },
    },
    {
      ids: ["STRATCOM"],
      input: tourInput,
      // STRATCOM's reassurance benefit is declared STANDING (whenAnyTags: []): every
      // legal alliance-frame option carries at least one of deterrence/alliance/
      // public-commitment, so the predicate had no legal avoid witness (closing
      // review P2). It always acts; activatedByTags stays [].
      expectedBenefits: [{ lane: "strategic.alliance.reassurance", delta: 1, activatedByTags: [] }],
      expectedPressures: [
        { lane: "strategic.escalation.incidentLadder", delta: 0.75, activatedByTags: ["deterrence", "public-commitment"] },
        { lane: "strategic.domestic.mediaHeat", delta: 1, activatedByTags: ["deterrence", "public-commitment"] },
      ],
      expectLane: (enabled, disabled) => {
        assert.equal(enabled.strategic.alliance.reassurance, laneAfter(disabled.strategic.alliance.reassurance, 1), "STRATCOM reassurance benefit");
        assert.equal(enabled.strategic.escalation.incidentLadder, laneAfter(disabled.strategic.escalation.incidentLadder, 0.75), "STRATCOM incident-ladder pressure");
      },
    },
    {
      ids: ["MED"],
      input: inputFor(1),
      expectedBenefits: [
        { lane: "staff.s1.recoveryDebt", delta: -2, activatedByTags: [] },
        { lane: "strategic.forceGeneration.reserveStrain", delta: -0.4, activatedByTags: [] },
      ],
      expectedPressures: [
        { lane: "resources.budgetAuthority", delta: -0.75, activatedByTags: [] },
        { lane: "strategic.sustainment.liftAvailability", delta: -0.25, activatedByTags: [] },
      ],
      expectLane: (enabled, disabled) => {
        assert.equal(enabled.staffMechanics.s1.recoveryDebt, laneAfter(disabled.staffMechanics.s1.recoveryDebt, -2), "MED recovery-debt benefit");
        assert.equal(enabled.strategic.forceGeneration.reserveStrain, laneAfter(disabled.strategic.forceGeneration.reserveStrain, -0.4), "MED reserve-strain benefit");
        assert.equal(enabled.resources.budgetAuthority, laneAfter(disabled.resources.budgetAuthority, -0.75), "MED budget pressure");
        assert.equal(enabled.strategic.sustainment.liftAvailability, laneAfter(disabled.strategic.sustainment.liftAvailability, -0.25), "MED lift pressure");
      },
    },
    {
      ids: ["ENGINEER"],
      input: inputFor(1),
      expectedBenefits: [
        { lane: "strategic.sustainment.depotBacklog", delta: -1.5, activatedByTags: ["repair"] },
        { lane: "strategic.sustainment.liftAvailability", delta: 0.75, activatedByTags: ["repair"] },
      ],
      expectedPressures: [
        { lane: "resources.budgetAuthority", delta: -1, activatedByTags: ["repair"] },
        { lane: "strategic.forceGeneration.trainingThroughput", delta: -0.5, activatedByTags: ["repair"] },
      ],
      expectLane: (enabled, disabled) => {
        assert.equal(enabled.strategic.sustainment.depotBacklog, laneAfter(disabled.strategic.sustainment.depotBacklog, -1.5), "ENGINEER depot-backlog benefit");
        assert.equal(enabled.strategic.sustainment.liftAvailability, laneAfter(disabled.strategic.sustainment.liftAvailability, 0.75), "ENGINEER lift benefit");
      },
    },
  ];

  for (const entry of cases) {
    const scenario = scenarioWithModules(entry.ids);
    const enabled = resolveTurn(scenario, scenario.initialState, entry.input);
    const disabled = resolveTurn(zeroModuleScenario, zeroModuleScenario.initialState, entry.input);
    assert.equal(enabled.staffModules.length, 1, `${entry.ids[0]} readout present`);
    const readout = enabled.staffModules[0]!;
    assert.equal(readout.id, entry.ids[0]);
    assert.equal(readout.status, "pressured", `${entry.ids[0]} has active pressures and no coordination`);
    assert.deepEqual(
      readout.benefits.map(({ lane, requestedDelta, activatedByTags }) => ({ lane, delta: requestedDelta, activatedByTags })),
      entry.expectedBenefits,
      `${entry.ids[0]} benefit readouts (profile/declaration order)`,
    );
    assert.deepEqual(
      readout.pressures.map(({ lane, requestedDelta, activatedByTags }) => ({ lane, delta: requestedDelta, activatedByTags })),
      entry.expectedPressures,
      `${entry.ids[0]} pressure readouts (profile/declaration order)`,
    );
    entry.expectLane(enabled.nextState, disabled.nextState);
  }
});

test("doctrine 5: conditional rows stay inactive when no tag is selected", () => {
  const scenario = scenarioWithModules(["J7"]);
  const input = inputFor(1, [
    { memoId: "posture", optionId: "tempo-hold" },
    { memoId: "intelligence-focus", optionId: "deception-hunt" },
    { memoId: "sustainment-focus", optionId: "repair-first" },
    { memoId: "alliance-frame", optionId: "quiet-reassurance" },
  ]);
  // Tags: recovery, retention, slow-burn, counter-deception, warning, repair, alliance, quiet — none of J7's simulation/standardization/training/program/modernization.
  const enabled = resolveTurn(scenario, scenario.initialState, input);
  assert.deepEqual(enabled.staffModules[0]!.benefits, [], "no benefit row activated");
  assert.deepEqual(enabled.staffModules[0]!.pressures.map((entry) => entry.lane), ["resources.budgetAuthority"], "only the standing budget pressure is active");
  assert.equal(enabled.staffModules[0]!.status, "pressured");
});

// ── Doctrine-gate ordering ────────────────────────────────────────────────────

test("doctrine 5: J6's offset enters system pressure before the >65 incident consequence", () => {
  const disabled = resolveTurn(zeroModuleScenario, zeroModuleScenario.initialState, inputFor(1));
  const enabled = resolveTurn(scenarioWithModules(["J6"]), soloScenario.initialState, inputFor(1));
  // Opening state: system pressure resolves to 69.18 without J6 (gate fires) and
  // 61.63 with J6 (gate suppressed), so the +1 incident-ladder consequence is
  // observed in exactly one arm.
  assert.ok(disabled.afterAction.some((note) => note.heading === "Doctrine: system pressure"), "disabled crosses the >65 gate");
  assert.ok(!enabled.afterAction.some((note) => note.heading === "Doctrine: system pressure"), "J6 suppresses the gate");
  assert.equal(enabled.nextState.escalation.incidentLadder, laneAfter(disabled.nextState.escalation.incidentLadder, -1), "only the disabled arm pays the +1 incident-ladder consequence");
  assert.equal(enabled.nextState.doctrineMechanics.systemPressure, laneAfter(disabled.nextState.doctrineMechanics.systemPressure, -7.55), "J6 system-pressure offset applied inside the formula");
});

test("doctrine 5: J7's order-clarity offset enters before the <40 deployable-upside trim", () => {
  const state = clone(soloScenario.initialState);
  state.doctrineMechanics.orderClarity = 14;
  const disabled = resolveTurn(zeroModuleScenario, state, inputFor(1));
  const enabled = resolveTurn(scenarioWithModules(["J7"]), state, inputFor(1));
  // orderClarity resolves to 37 without J7 (trim fires, -0.1 deployable) and 40 with
  // J7 (+3 offset) — the trim check sees the module-adjusted value.
  assert.ok(disabled.afterAction.some((note) => note.heading === "Doctrine: order clarity"), "disabled falls below 40");
  assert.ok(!enabled.afterAction.some((note) => note.heading === "Doctrine: order clarity"), "J7 keeps order clarity at 40");
  assert.equal(enabled.nextState.forceGeneration.deployableUnits, laneAfter(disabled.nextState.forceGeneration.deployableUnits, 0.1), "only the disabled arm pays the -0.1 trim");
  assert.equal(enabled.nextState.doctrineMechanics.orderClarity, laneAfter(disabled.nextState.doctrineMechanics.orderClarity, 3));
});

test("doctrine 5: ENGINEER feeds same-turn operational reach but not same-turn S4 supportable tempo; the following turn reflects it", () => {
  const enabled = scenarioWithModules(["ENGINEER"]);
  const firstEnabled = resolveTurn(enabled, enabled.initialState, inputFor(1));
  const firstDisabled = resolveTurn(zeroModuleScenario, zeroModuleScenario.initialState, inputFor(1));
  assert.equal(firstEnabled.nextState.staffMechanics.s4.supportableTempo, firstDisabled.nextState.staffMechanics.s4.supportableTempo, "S4 supportable tempo is computed before module application (same-turn unchanged)");
  assert.ok(firstEnabled.nextState.doctrineMechanics.operationalReach > firstDisabled.nextState.doctrineMechanics.operationalReach, "depot/lift feed same-turn operational reach");

  const secondEnabled = resolveTurn(enabled, firstEnabled.nextState, inputFor(2));
  const secondDisabled = resolveTurn(zeroModuleScenario, firstDisabled.nextState, inputFor(2));
  assert.notEqual(secondEnabled.nextState.staffMechanics.s4.supportableTempo, secondDisabled.nextState.staffMechanics.s4.supportableTempo, "the following turn's S4 formula reads the module-adjusted sustainment");
});

// ── Boundary clamp ────────────────────────────────────────────────────────────

test("doctrine 5: requested readouts stay authored while state clamps once and stays schema-valid", () => {
  const state = clone(soloScenario.initialState);
  state.staffMechanics.s1.recoveryDebt = 1;
  const enabled = resolveTurn(scenarioWithModules(["MED"]), state, inputFor(1));
  const recovery = enabled.staffModules[0]!.benefits.find((benefit) => benefit.lane === "staff.s1.recoveryDebt")!;
  assert.equal(recovery.requestedDelta, -2, "readout reports the authored requested contribution");
  assert.equal(enabled.nextState.staffMechanics.s1.recoveryDebt, 0, "state clamps once at the floor");
  assert.doesNotThrow(() => campaignStateSchema.parse(enabled.nextState), "clamped state stays schema-valid");
});

// ── S1-S5 primacy and readout/note shape ──────────────────────────────────────

test("doctrine 5: S1-S5 object keys/IDs/order are unchanged and the module note is last", () => {
  const enabled = resolveTurn(soloScenario, soloScenario.initialState, inputFor(1));
  const disabled = resolveTurn(zeroModuleScenario, zeroModuleScenario.initialState, inputFor(1));
  assert.deepEqual(enabled.staffFunctions.map((entry) => entry.id), disabled.staffFunctions.map((entry) => entry.id), "S1-S5 ids and order unchanged");
  assert.deepEqual(enabled.staffFunctions.map((entry) => entry.id), ["S1", "S2", "S3", "S4", "S5"]);
  const moduleNote = enabled.afterAction.filter((note) => note.heading.startsWith("Staff modules:"));
  assert.equal(moduleNote.length, 1, "exactly one aggregate module note");
  assert.equal(enabled.afterAction.at(-1)!.heading, "Staff modules: 4 cells active", "module note is appended last");
  assert.match(enabled.afterAction.at(-1)!.detail, /Coordination load 0\.40 requested \+4\.00 system pressure, -4\.80 staff synchronization, -0\.80 S5 coherence, \+0\.50 incident ladder, and -0\.30 readiness\./);
  assert.ok(enabled.afterAction.at(-1)!.detail.includes("J6 — Communications and information systems"), "note lists each module's active summaries in profile order");
  assert.ok(enabled.afterAction.at(-1)!.detail.indexOf("J6 — Communications") < enabled.afterAction.at(-1)!.detail.indexOf("J8 — Finance"), "profile order J6 before J8");
  assert.ok(!disabled.afterAction.some((note) => note.heading.startsWith("Staff modules:")), "no module note when disabled");
});

// ── Preview parity ────────────────────────────────────────────────────────────

test("doctrine 5: preview parity across the projected result, top-level preview, and every decision entry", () => {
  const preview = previewTurn(soloScenario, soloScenario.initialState, inputFor(1));
  const projected = preview.projectedResult;
  assert.deepEqual(preview.staffModules, projected.staffModules, "top-level preview mirrors the projected result");
  assert.equal(preview.coordinationLoad, projected.coordinationLoad);
  assert.equal(projected.coordinationLoad, 0.4, "shipped four-cell profile reports load 0.40 on every enabled resolved turn");
  assert.ok(preview.decisionPreviews.length > 0, "preview has decision entries");
  for (const entry of preview.decisionPreviews) {
    assert.deepEqual(entry.projectedModuleReadouts, projected.staffModules, "every decision entry carries the projected module readouts");
  }
  const zeroPreview = previewTurn(zeroModuleScenario, zeroModuleScenario.initialState, inputFor(1));
  assert.deepEqual(zeroPreview.staffModules, [], "disabled preview emits empty module readouts");
  assert.equal(zeroPreview.coordinationLoad, 0);
});

// ── Determinism, multi-turn, and replay ───────────────────────────────────────

test("doctrine 5: enabled, disabled, and all-seven multi-turn runs are deterministic and replay-valid; module-induced lane tampering fails", () => {
  const scenarios: Array<{ name: string; scenario: ScenarioDefinition }> = [
    { name: "disabled", scenario: zeroModuleScenario },
    { name: "shipped-4", scenario: soloScenario },
    { name: "all-seven", scenario: allSevenScenario },
  ];
  for (const { name, scenario } of scenarios) {
    const first = runTurns(scenario, balancedSelections, 4);
    const second = runTurns(scenario, balancedSelections, 4);
    assert.deepEqual(second, first, `${name} repeated run is fully deterministic`);
    assert.ok(first.every((result) => result.coordinationLoad === 0 || result.coordinationLoad === 0.2 || result.coordinationLoad === 0.4 || result.coordinationLoad === 1), `${name} loads stay on the curve`);

    const session = {
      initialState: scenario.initialState,
      turnInputs: first.map((result) => result.input),
      history: first,
      state: first.at(-1)!.nextState,
    };
    const validation = validateReplaySession(scenario, session);
    assert.equal(validation.ok, true, `${name} replay validates`);

    // Tamper with a module-induced next-state lane: MED's recovery-debt delta lives
    // in nextState, so it is replay-covered and must fail validation.
    const tampered = clone(session);
    tampered.history[0]!.nextState.resources.budgetAuthority += 1;
    const tamperedValidation = validateReplaySession(scenario, tampered);
    assert.equal(tamperedValidation.ok, false, `${name} tampered module-induced lane fails replay`);

    // Output-only readout tampering is NOT detected (documented v2 boundary).
    const readoutTamper = clone(session);
    readoutTamper.history[0]!.staffModules = [];
    assert.equal(validateReplaySession(scenario, readoutTamper).ok, true, "output-only readout tampering is not caught by replay");
  }
});

test("doctrine 5: coordination load is observed per turn and the shipped 4-cell mean is exactly 0.40", () => {
  const results = runTurns(soloScenario, balancedSelections, 5);
  assert.ok(results.length === 5, "campaign stayed active for the window");
  for (const result of results) {
    assert.equal(result.coordinationLoad, 0.4, "every shipped enabled result reports load 0.40");
  }
  const mean = results.reduce((sum, result) => sum + result.coordinationLoad, 0) / results.length;
  assert.equal(mean, 0.4, "mean coordination load is exactly 0.4 (telemetry must not derive it from the count)");
});
