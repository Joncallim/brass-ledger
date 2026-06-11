import { createHash } from "node:crypto";
import {
  type AcceptedRiskOverride,
  type CampaignObjective,
  type CampaignState,
  type ChiefPositionEntry,
  type DecisionPreviewEntry,
  type DecisionMemo,
  type DirectorateBurden,
  type EventDefinition,
  type ExplainabilityEntry,
  type ExternalConstraintState,
  type MemoOption,
  type MemoSelection,
  type ReplayValidation,
  type ScenarioDefinition,
  type StaffMechanicsState,
  type StateDelta,
  type StrategicState,
  type TurnInput,
  type TurnResult,
  buildChiefPositions,
  buildDirectorateBurden,
  buildStaffFunctionReadouts,
  summarizeState,
} from "@brass-ledger/shared";

type Rng = () => number;

function mulberry32(seed: number): Rng {
  let t = seed + 0x6d2b79f5;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Number(value.toFixed(2));
}

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeStateDelta(delta: StateDelta | undefined): Required<StateDelta> {
  return {
    resources: delta?.resources ?? {},
    forceGeneration: delta?.forceGeneration ?? {},
    intelligence: delta?.intelligence ?? {},
    sustainment: delta?.sustainment ?? {},
    alliance: delta?.alliance ?? {},
    domestic: delta?.domestic ?? {},
    escalation: delta?.escalation ?? {},
  };
}

function phaseIndex(phase: string) {
  return ["concept", "funded", "procured", "integrated", "trained", "operational"].indexOf(phase);
}

function phaseAt(index: number) {
  const phases = ["concept", "funded", "procured", "integrated", "trained", "operational"] as const;
  return phases[clamp(index, 0, phases.length - 1)] as (typeof phases)[number];
}

function strategicMetric(state: CampaignState, metric: CampaignObjective["metric"]) {
  if (metric === "deployableUnits") return state.strategic.forceGeneration.deployableUnits;
  if (metric === "politicalAlignment") return state.strategic.alliance.politicalAlignment;
  if (metric === "cabinetCover") return state.strategic.domestic.cabinetCover;
  return state.strategic.escalation.incidentLadder;
}

export function deriveDecisionMemos(scenario: ScenarioDefinition, state: CampaignState) {
  return scenario.memoTemplates.map((memo) => {
    if (memo.id !== "posture") {
      return memo;
    }

    const whyNow =
      state.strategic.escalation.warningTime < 32
        ? "Warning time is short enough that posture drift now will be felt immediately next month."
        : state.strategic.forceGeneration.deployableUnits < 6
          ? "Readiness remains short of a clearly credible deterrent posture."
          : memo.whyNow;

    return { ...memo, whyNow };
  });
}

function findOption(memos: DecisionMemo[], selection: MemoSelection) {
  const memo = memos.find((entry) => entry.id === selection.memoId);
  if (!memo) throw new Error(`Unknown memo ${selection.memoId}`);
  const option = memo.options.find((entry) => entry.id === selection.optionId);
  if (!option) throw new Error(`Unknown option ${selection.optionId} for memo ${selection.memoId}`);
  return { memo, option };
}

function validateSelections(memos: DecisionMemo[], input: TurnInput) {
  const seen = new Set<string>();
  for (const selection of input.selections) {
    if (seen.has(selection.memoId)) throw new Error(`Memo ${selection.memoId} was selected more than once.`);
    seen.add(selection.memoId);
    findOption(memos, selection);
  }
  for (const memo of memos) {
    if (!memo.optional && !seen.has(memo.id)) {
      throw new Error(`Required memo ${memo.title} is missing a selected option.`);
    }
  }
}

function applyStrategicDelta(current: StrategicState, delta: MemoOption["stateDelta"] | EventDefinition["stateDelta"]) {
  const normalizedDelta = normalizeStateDelta(delta as StateDelta | undefined);
  return {
    forceGeneration: {
      deployableUnits: clamp(current.forceGeneration.deployableUnits + (normalizedDelta.forceGeneration.deployableUnits ?? 0), 2, 12),
      reserveStrain: clamp(current.forceGeneration.reserveStrain + (normalizedDelta.forceGeneration.reserveStrain ?? 0), 0, 100),
      trainingThroughput: clamp(current.forceGeneration.trainingThroughput + (normalizedDelta.forceGeneration.trainingThroughput ?? 0), 0, 100),
      personnelShortfalls: clamp(current.forceGeneration.personnelShortfalls + (normalizedDelta.forceGeneration.personnelShortfalls ?? 0), 0, 100),
    },
    intelligence: {
      collectionCoverage: clamp(current.intelligence.collectionCoverage + (normalizedDelta.intelligence.collectionCoverage ?? 0), 0, 100),
      confidence: clamp(current.intelligence.confidence + (normalizedDelta.intelligence.confidence ?? 0), 0, 100),
      warningReliability: clamp(current.intelligence.warningReliability + (normalizedDelta.intelligence.warningReliability ?? 0), 0, 100),
      deceptionPressure: clamp(current.intelligence.deceptionPressure + (normalizedDelta.intelligence.deceptionPressure ?? 0), 0, 100),
    },
    sustainment: {
      depotBacklog: clamp(current.sustainment.depotBacklog + (normalizedDelta.sustainment.depotBacklog ?? 0), 0, 100),
      munitionsSufficiency: clamp(current.sustainment.munitionsSufficiency + (normalizedDelta.sustainment.munitionsSufficiency ?? 0), 0, 100),
      fuelSufficiency: clamp(current.sustainment.fuelSufficiency + (normalizedDelta.sustainment.fuelSufficiency ?? 0), 0, 100),
      liftAvailability: clamp(current.sustainment.liftAvailability + (normalizedDelta.sustainment.liftAvailability ?? 0), 0, 100),
    },
    alliance: {
      reassurance: clamp(current.alliance.reassurance + (normalizedDelta.alliance.reassurance ?? 0), 0, 100),
      politicalAlignment: clamp(current.alliance.politicalAlignment + (normalizedDelta.alliance.politicalAlignment ?? 0), 0, 100),
      partnerParticipation: clamp(current.alliance.partnerParticipation + (normalizedDelta.alliance.partnerParticipation ?? 0), 0, 100),
      partnerPublicSupport: clamp(current.alliance.partnerPublicSupport + (normalizedDelta.alliance.partnerPublicSupport ?? 0), 0, 100),
    },
    domestic: {
      cabinetCover: clamp(current.domestic.cabinetCover + (normalizedDelta.domestic.cabinetCover ?? 0), 0, 100),
      committeeTolerance: clamp(current.domestic.committeeTolerance + (normalizedDelta.domestic.committeeTolerance ?? 0), 0, 100),
      mediaHeat: clamp(current.domestic.mediaHeat + (normalizedDelta.domestic.mediaHeat ?? 0), 0, 100),
      publicPatience: clamp(current.domestic.publicPatience + (normalizedDelta.domestic.publicPatience ?? 0), 0, 100),
    },
    escalation: {
      probeTempo: clamp(current.escalation.probeTempo + (normalizedDelta.escalation.probeTempo ?? 0), 0, 100),
      warningTime: clamp(current.escalation.warningTime + (normalizedDelta.escalation.warningTime ?? 0), 0, 100),
      incidentLadder: clamp(current.escalation.incidentLadder + (normalizedDelta.escalation.incidentLadder ?? 0), 0, 100),
      crisisSensitivity: clamp(current.escalation.crisisSensitivity + (normalizedDelta.escalation.crisisSensitivity ?? 0), 0, 100),
    },
  };
}

function applyResourceDelta(current: CampaignState["resources"], delta: MemoOption["stateDelta"] | EventDefinition["stateDelta"]) {
  const normalizedDelta = normalizeStateDelta(delta as StateDelta | undefined);
  return {
    budgetAuthority: clamp(current.budgetAuthority + (normalizedDelta.resources.budgetAuthority ?? 0), 0, 100),
    readiness: clamp(current.readiness + (normalizedDelta.resources.readiness ?? 0), 0, 100),
    politicalCapital: clamp(current.politicalCapital + (normalizedDelta.resources.politicalCapital ?? 0), 0, 100),
    allianceCohesion: clamp(current.allianceCohesion + (normalizedDelta.resources.allianceCohesion ?? 0), 0, 100),
    publicLegitimacy: clamp(current.publicLegitimacy + (normalizedDelta.resources.publicLegitimacy ?? 0), 0, 100),
    escalationPressure: clamp(current.escalationPressure + (normalizedDelta.resources.escalationPressure ?? 0), 0, 100),
  };
}

function applyBurdenPenalties(state: StrategicState, burdens: DirectorateBurden[]) {
  const burdenById = new Map(burdens.map((entry) => [entry.directorate, entry]));
  const intelligencePenalty = burdenById.get("intelligence")?.confidencePenalty ?? 0;
  const opsPenalty = burdenById.get("operations")?.executionPenalty ?? 0;
  const sustainPenalty = burdenById.get("sustainment")?.executionPenalty ?? 0;
  const plansPenalty = burdenById.get("plans")?.confidencePenalty ?? 0;
  const peoplePenalty = burdenById.get("people")?.executionPenalty ?? 0;
  const trainingPenalty = burdenById.get("training")?.executionPenalty ?? 0;

  return {
    forceGeneration: {
      ...state.forceGeneration,
      deployableUnits: clamp(state.forceGeneration.deployableUnits - opsPenalty * 0.03 - trainingPenalty * 0.02, 2, 12),
      reserveStrain: clamp(state.forceGeneration.reserveStrain + peoplePenalty * 0.5, 0, 100),
      trainingThroughput: clamp(state.forceGeneration.trainingThroughput - trainingPenalty * 0.5, 0, 100),
      personnelShortfalls: clamp(state.forceGeneration.personnelShortfalls + peoplePenalty * 0.35, 0, 100),
    },
    intelligence: {
      ...state.intelligence,
      confidence: clamp(state.intelligence.confidence - intelligencePenalty * 0.8, 0, 100),
      warningReliability: clamp(state.intelligence.warningReliability - intelligencePenalty * 0.6, 0, 100),
      deceptionPressure: clamp(state.intelligence.deceptionPressure + intelligencePenalty * 0.65, 0, 100),
    },
    sustainment: {
      ...state.sustainment,
      depotBacklog: clamp(state.sustainment.depotBacklog + sustainPenalty * 0.75, 0, 100),
      liftAvailability: clamp(state.sustainment.liftAvailability - sustainPenalty * 0.6, 0, 100),
      fuelSufficiency: clamp(state.sustainment.fuelSufficiency - sustainPenalty * 0.5, 0, 100),
    },
    alliance: {
      ...state.alliance,
      reassurance: clamp(state.alliance.reassurance - plansPenalty * 0.35, 0, 100),
      politicalAlignment: clamp(state.alliance.politicalAlignment - plansPenalty * 0.4, 0, 100),
    },
    domestic: {
      ...state.domestic,
      cabinetCover: clamp(state.domestic.cabinetCover - plansPenalty * 0.4, 0, 100),
      mediaHeat: clamp(state.domestic.mediaHeat + opsPenalty * 0.25 + plansPenalty * 0.2, 0, 100),
      publicPatience: clamp(state.domestic.publicPatience - peoplePenalty * 0.2 - trainingPenalty * 0.15, 0, 100),
      committeeTolerance: state.domestic.committeeTolerance,
    },
    escalation: {
      ...state.escalation,
      incidentLadder: clamp(state.escalation.incidentLadder + opsPenalty * 0.18, 0, 100),
      warningTime: clamp(state.escalation.warningTime - intelligencePenalty * 0.55, 0, 100),
      crisisSensitivity: clamp(state.escalation.crisisSensitivity + opsPenalty * 0.22, 0, 100),
      probeTempo: state.escalation.probeTempo,
    },
  };
}

function updateConstraint(state: ExternalConstraintState, delta: number): ExternalConstraintState {
  const severity = clamp(state.severity + delta, 0, 100);
  return {
    ...state,
    severity,
    trend: delta < 0 ? "improving" : delta > 0 ? "worsening" : "steady",
  };
}

function updatePrograms(
  scenario: ScenarioDefinition,
  state: CampaignState,
  selections: MemoSelection[],
  burdens: DirectorateBurden[],
) {
  const memos = deriveDecisionMemos(scenario, state);
  const burdenById = new Map(burdens.map((entry) => [entry.directorate, entry]));
  const pushes = new Map<string, number>();

  for (const selection of selections) {
    const { option } = findOption(memos, selection);
    for (const push of option.programPushes) {
      pushes.set(push.programId, (pushes.get(push.programId) ?? 0) + push.points);
    }
  }

  return state.capabilityPrograms.map((program) => {
    const definition = scenario.capabilityPrograms.find((entry) => entry.id === program.id);
    const burden = burdenById.get(definition?.absorbingDirectorate ?? "plans");
    const push = pushes.get(program.id) ?? 0;
    const absorptionPenalty = (burden?.executionPenalty ?? 0) * 0.6;
    const readinessFactor = (state.strategic.forceGeneration.trainingThroughput - 50) * 0.06;
    const confidenceFactor = (state.strategic.intelligence.confidence - 50) * 0.04;
    let nextProgress = program.progress + push - absorptionPenalty + readinessFactor + confidenceFactor - 4;
    let nextPhase = program.phase;

    if (nextProgress >= 100 && program.phase !== "operational") {
      nextProgress -= 100;
      nextPhase = phaseAt(phaseIndex(program.phase) + 1);
    }

    nextProgress = clamp(nextProgress, 0, 99.9);
    const blockers = [];
    if ((burden?.burdenLevel ?? "light") === "overloaded") blockers.push(burden?.failureMode ?? "directorate overload");
    if (definition?.absorbingDirectorate === "operations" && state.strategic.sustainment.munitionsSufficiency < 50) blockers.push("munitions depth");
    if (definition?.absorbingDirectorate === "sustainment" && (state.externalConstraints.find((entry) => entry.id === "electronics-chain")?.severity ?? 0) > 60) blockers.push("trusted electronics");
    if (definition?.absorbingDirectorate === "people" && state.strategic.domestic.publicPatience < 45) blockers.push("public patience");
    // S1-S5 gates: programs stall when staff prerequisites are not met
    if (program.id === "fires-network" && state.staffMechanics.s3.executablePosture < 35) blockers.push("S3 executable posture");
    if (program.id === "counter-deception-grid" && state.staffMechanics.s2.externalEstimateConfidence < 30) blockers.push("S2 collection confidence");
    if (program.id === "sustainment-ledger" && state.staffMechanics.s4.liftBurn > 70) blockers.push("S4 lift burn saturation");
    if (program.id === "reserve-rebuild" && state.staffMechanics.s1.recoveryDebt > 75) blockers.push("S1 recovery debt");

    return {
      ...program,
      phase: nextPhase,
      progress: round(nextProgress),
      blockers,
    };
  });
}

function eventEligible(event: EventDefinition, state: CampaignState, selectedTags: Set<string>) {
  if (state.turn < event.minTurn || state.turn > event.maxTurn) return false;
  if (state.eventHistory.includes(event.id)) return false;
  if (!event.triggerTags.every((tag) => selectedTags.has(tag))) return false;
  if (event.requiredFlags.some((flag) => !state.eventFlags[flag])) return false;
  if (event.excludedFlags.some((flag) => state.eventFlags[flag])) return false;
  return true;
}

function chooseEvents(
  scenario: ScenarioDefinition,
  previousState: CampaignState,
  selectedTags: Set<string>,
  rng: Rng,
) {
  const eligible = scenario.events.filter((event) => eventEligible(event, previousState, selectedTags));
  return eligible.filter((_event, index) => rng() > 0.35 || index === 0).slice(0, 2);
}

function chiefsPaperText(burdens: DirectorateBurden[]) {
  const overloaded = burdens.filter((entry) => entry.burdenLevel === "overloaded");
  const strained = burdens.filter((entry) => entry.burdenLevel === "strained");
  if (overloaded.length > 0) return "The chiefs paper is defensive and trying to narrow the month.";
  if (strained.length > 1) return "The chiefs paper is cautious: the room can do several things, but not all of them cleanly.";
  return "The chiefs paper sees room for measured movement if the headquarters stays disciplined.";
}

function commandersEstimate(previousState: CampaignState, nextState: CampaignState) {
  const readinessShift = nextState.strategic.forceGeneration.deployableUnits - previousState.strategic.forceGeneration.deployableUnits;
  const politicalShift = nextState.strategic.domestic.cabinetCover - previousState.strategic.domestic.cabinetCover;
  if (readinessShift > 0.5 && politicalShift >= -3) {
    return "The month improved credibility without losing the cabinet. The next risk is over-reading that success.";
  }
  if (readinessShift <= 0.2 && politicalShift < 0) {
    return "The headquarters spent cover faster than it bought usable strength. The next month should narrow the agenda.";
  }
  return "The force moved, but the gain is conditional. What matters next month is whether support lanes can absorb what was just asked of them.";
}

function createMonthlyEstimate(
  previousState: CampaignState,
  nextState: CampaignState,
  chiefPositions: ChiefPositionEntry[],
  burdens: DirectorateBurden[],
) {
  const opposed = chiefPositions.filter((entry) => entry.position === "oppose").length;
  const conditionals = chiefPositions.filter((entry) => entry.position === "request_conditions").length;

  return {
    chiefsPaperTitle: "Chiefs Paper",
    chiefsPaperSummary: chiefsPaperText(burdens),
    chiefsPaperBullets: [
      opposed > 2
        ? "Several chiefs believe the month accepted more risk than the staff can currently support."
        : "The room is not united, but most objections are conditional rather than absolute.",
      burdens.some((entry) => entry.burdenLevel === "overloaded")
        ? "At least one directorate believes execution quality will slip under current guidance."
        : "No directorate is fully breaking this month, but several are close to the edge.",
      conditionals > 3
        ? "Much of the staff support is contingent on assumptions that may not survive contact with the next brief."
        : "The chiefs are mostly aligned on intent, but not fully aligned on timing.",
    ],
    uncertainty:
      previousState.strategic.intelligence.confidence < 55
        ? "The underlying picture is still hazy enough that apparent precision may be misleading."
        : "The picture is usable, but several risks are still being inferred rather than directly observed.",
    commandersEstimate: commandersEstimate(previousState, nextState),
  };
}

function afterAction(
  previousState: CampaignState,
  nextState: CampaignState,
  burdens: DirectorateBurden[],
  events: EventDefinition[],
  acceptedRiskOverrides: Array<{ staffFunctionId: string; warningText: string }> = [],
) {
  const notes = [];
  const deployableDelta = nextState.strategic.forceGeneration.deployableUnits - previousState.strategic.forceGeneration.deployableUnits;
  const politicalDelta = nextState.strategic.domestic.cabinetCover - previousState.strategic.domestic.cabinetCover;
  const escalationDelta = nextState.strategic.escalation.incidentLadder - previousState.strategic.escalation.incidentLadder;

  notes.push({
    heading: "What changed",
    detail: `Deployable force shifted ${deployableDelta >= 0 ? "+" : ""}${round(deployableDelta)} brigades; cabinet cover shifted ${politicalDelta >= 0 ? "+" : ""}${round(politicalDelta)}; incident ladder shifted ${escalationDelta >= 0 ? "+" : ""}${round(escalationDelta)}.`,
  });

  const overloaded = burdens.filter((entry) => entry.burdenLevel === "overloaded");
  if (overloaded.length > 0) {
    notes.push({
      heading: "What the room underestimated",
      detail: `${overloaded.map((entry) => entry.failureMode).join("; ")} emerged because the headquarters tabled more than those directorates could absorb cleanly.`,
    });
  }

  if (events.length > 0) {
    notes.push({
      heading: "What matured into risk",
      detail: events.map((event) => event.summary).join(" "),
    });
  }

  const mechanics = nextState.staffMechanics;
  notes.push({
    heading: "S1-S5 consequences",
    detail:
      `S1 recovery debt is ${round(mechanics.s1.recoveryDebt)}, S2 visibility is ${mechanics.s2.visibility.toLowerCase()}, ` +
      `S3 credible deterrence is ${round(mechanics.s3.credibleDeterrence)} (visible ${round(mechanics.s3.visiblePosture)} / executable ${round(mechanics.s3.executablePosture)}), ` +
      `S4 supportable tempo is ${round(mechanics.s4.supportableTempo)}, ` +
      `and S5 strategic coherence is ${round(mechanics.s5.strategicCoherence)}.`,
  });

  // S1: warn when deployable units improved but recovery debt also worsened
  if (
    deployableDelta > 0.3 &&
    nextState.staffMechanics.s1.recoveryDebt > previousState.staffMechanics.s1.recoveryDebt + 5
  ) {
    notes.push({
      heading: "S1 personnel warning",
      detail: `Deployable units improved by ${round(deployableDelta)} but recovery debt rose from ${round(previousState.staffMechanics.s1.recoveryDebt)} to ${round(nextState.staffMechanics.s1.recoveryDebt)}. The gain is real but the people cost is accumulating.`,
    });
  }

  // S3: warn when visible posture outpaces executable by more than 15
  if (nextState.staffMechanics.s3.visiblePosture > nextState.staffMechanics.s3.executablePosture + 15) {
    notes.push({
      heading: "S3 posture warning",
      detail: `Visible posture (${round(nextState.staffMechanics.s3.visiblePosture)}) exceeds executable posture (${round(nextState.staffMechanics.s3.executablePosture)}) by more than 15 points. Deterrence credibility is lower than the visible activity level suggests.`,
    });
  }

  // S4: warn when supportable tempo is critically low
  if (nextState.staffMechanics.s4.supportableTempo < 15) {
    notes.push({
      heading: "S4 support warning",
      detail: `Supportable tempo is ${round(nextState.staffMechanics.s4.supportableTempo)}. Support reality is the binding constraint on further operational activity this month.`,
    });
  }

  // S5: doctrine bet after-action when doctrine alignment drops sharply
  if (nextState.staffMechanics.s5.doctrineAlignment < previousState.staffMechanics.s5.doctrineAlignment - 5) {
    notes.push({
      heading: "S5 doctrine bet",
      detail: `Doctrine alignment dropped from ${round(previousState.staffMechanics.s5.doctrineAlignment)} to ${round(nextState.staffMechanics.s5.doctrineAlignment)}. This was a conscious departure from coherent sequencing — the consequence depends on whether the campaign can absorb it.`,
    });
  }

  // Accepted-risk summary
  if (acceptedRiskOverrides.length > 0) {
    notes.push({
      heading: "Accepted risks",
      detail: `The commander explicitly accepted ${acceptedRiskOverrides.length} staff warning(s): ${acceptedRiskOverrides.map((r) => `${r.staffFunctionId} — ${r.warningText}`).join("; ")}.`,
    });
  }

  return notes;
}

function createExplainability(
  selectedPairs: Array<{ memo: DecisionMemo; option: MemoOption }>,
  burdens: DirectorateBurden[],
  events: EventDefinition[],
  previousState: CampaignState,
  nextState: CampaignState,
): ExplainabilityEntry[] {
  const overloaded = burdens.filter((entry) => entry.burdenLevel === "overloaded");
  const strained = burdens.filter((entry) => entry.burdenLevel === "strained");
  const deployableDelta = round(nextState.strategic.forceGeneration.deployableUnits - previousState.strategic.forceGeneration.deployableUnits);
  const cabinetDelta = round(nextState.strategic.domestic.cabinetCover - previousState.strategic.domestic.cabinetCover);
  const incidentDelta = round(nextState.strategic.escalation.incidentLadder - previousState.strategic.escalation.incidentLadder);

  return [
    {
      label: "Decision packet",
      summary: `${selectedPairs.length} memo selections shaped the month before events and staff capacity penalties were applied.`,
      positiveDrivers: selectedPairs.map(({ memo, option }) => `${memo.title}: ${option.label}`),
      blockers: selectedPairs.flatMap(({ option }) => option.tradeoffs.slice(0, 1)),
      causalRefs: selectedPairs.map(({ memo, option }) => `memo:${memo.id}/option:${option.id}`),
    },
    {
      label: "Staff capacity",
      summary:
        overloaded.length > 0
          ? `${overloaded.length} staff lanes overloaded and reduced execution quality.`
          : strained.length > 0
            ? `${strained.length} staff lanes were strained but still inside a recoverable envelope.`
            : "Staff burden remained inside declared scenario capacity.",
      positiveDrivers: burdens.filter((entry) => entry.burdenLevel === "light").map((entry) => `${entry.directorate} retained slack`),
      blockers: [...overloaded, ...strained].map((entry) => entry.failureMode),
      causalRefs: burdens.map((entry) => `staff:${entry.directorate}`),
    },
    {
      label: "State movement",
      summary: `Deployable force shifted ${deployableDelta >= 0 ? "+" : ""}${deployableDelta}; cabinet cover shifted ${cabinetDelta >= 0 ? "+" : ""}${cabinetDelta}; incident ladder shifted ${incidentDelta >= 0 ? "+" : ""}${incidentDelta}.`,
      positiveDrivers: [
        deployableDelta > 0 ? "readiness improved" : "",
        cabinetDelta > 0 ? "cabinet cover improved" : "",
        incidentDelta < 0 ? "escalation pressure eased" : "",
      ].filter(Boolean),
      blockers: [
        deployableDelta < 0 ? "readiness slipped" : "",
        cabinetDelta < 0 ? "cabinet cover was spent" : "",
        incidentDelta > 0 ? "incident ladder rose" : "",
      ].filter(Boolean),
      causalRefs: ["state:forceGeneration.deployableUnits", "state:domestic.cabinetCover", "state:escalation.incidentLadder"],
    },
    {
      label: "S1-S5 mechanics",
      summary:
        `S1 recovery debt ${nextState.staffMechanics.s1.recoveryDebt}; ` +
        `S2 estimate confidence ${nextState.staffMechanics.s2.externalEstimateConfidence} (${nextState.staffMechanics.s2.visibility}); ` +
        `S3 executable posture ${nextState.staffMechanics.s3.executablePosture}; ` +
        `S4 stockpile/lift ${nextState.staffMechanics.s4.stockpileDepth}/${nextState.staffMechanics.s4.liftBurn}; ` +
        `S5 coherence ${nextState.staffMechanics.s5.strategicCoherence}.`,
      positiveDrivers: [
        nextState.staffMechanics.s1.recoveryDebt < previousState.staffMechanics.s1.recoveryDebt ? "S1 recovery debt improved" : "",
        nextState.staffMechanics.s2.externalEstimateConfidence > previousState.staffMechanics.s2.externalEstimateConfidence ? "S2 estimate confidence improved" : "",
        nextState.staffMechanics.s3.executablePosture > previousState.staffMechanics.s3.executablePosture ? "S3 executable posture improved" : "",
        nextState.staffMechanics.s4.stockpileDepth > previousState.staffMechanics.s4.stockpileDepth ? "S4 stockpile depth improved" : "",
        nextState.staffMechanics.s5.strategicCoherence > previousState.staffMechanics.s5.strategicCoherence ? "S5 strategic coherence improved" : "",
      ].filter(Boolean),
      blockers: [
        nextState.staffMechanics.s1.recoveryDebt > previousState.staffMechanics.s1.recoveryDebt ? "S1 recovery debt worsened" : "",
        nextState.staffMechanics.s2.deceptionRisk > previousState.staffMechanics.s2.deceptionRisk ? "S2 deception risk rose" : "",
        nextState.staffMechanics.s4.liftBurn > previousState.staffMechanics.s4.liftBurn ? "S4 lift burn rose" : "",
        nextState.staffMechanics.s5.strategicCoherence < previousState.staffMechanics.s5.strategicCoherence ? "S5 strategic coherence slipped" : "",
      ].filter(Boolean),
      causalRefs: ["staff:S1", "staff:S2", "staff:S3", "staff:S4", "staff:S5"],
    },
    {
      label: "Events",
      summary: events.length > 0 ? `${events.length} event(s) triggered from selected tags.` : "No event triggered this turn.",
      positiveDrivers: events.length > 0 ? [] : ["no additional shock entered the month"],
      blockers: events.map((event) => event.summary),
      causalRefs: events.map((event) => `event:${event.id}`),
    },
  ];
}

function updateChiefTrust(previousState: CampaignState, chiefPositions: ChiefPositionEntry[]) {
  const next: Record<string, number> = {};
  for (const [chiefId, trust] of Object.entries(previousState.chiefTrust)) {
    const positions = chiefPositions.filter((entry) => entry.chiefId === chiefId);
    const shift = positions.reduce((sum, entry) => {
      if (entry.position === "support") return sum + 1;
      if (entry.position === "accept_risk") return sum;
      if (entry.position === "request_conditions") return sum - 1;
      return sum - 2;
    }, 0);
    next[chiefId] = clamp(trust + shift, 0, 100);
  }
  return next;
}

function updateConstraints(
  previousState: CampaignState,
  selectedOptions: MemoOption[],
  events: EventDefinition[],
) {
  return previousState.externalConstraints.map((constraint) => {
    const optionDelta = selectedOptions
      .flatMap((option) => option.constraintShifts)
      .filter((entry) => entry.constraintId === constraint.id)
      .reduce((sum, entry) => sum + entry.delta, 0);
    const eventDelta = events
      .flatMap((event) => event.constraintShifts)
      .filter((entry) => entry.constraintId === constraint.id)
      .reduce((sum, entry) => sum + entry.delta, 0);
    return updateConstraint(constraint, optionDelta + eventDelta);
  });
}

function visibilityFor(confidence: number): StaffMechanicsState["s2"]["visibility"] {
  if (confidence >= 72) return "KNOWN";
  if (confidence >= 40) return "ESTIMATED";
  return "RUMORED";
}

function updateStaffMechanics(
  previousState: CampaignState,
  selectedOptions: MemoOption[],
  burdens: DirectorateBurden[],
  events: EventDefinition[],
): StaffMechanicsState {
  const tags = new Set(selectedOptions.flatMap((option) => option.tags));
  const burdenById = new Map(burdens.map((entry) => [entry.directorate, entry]));
  const people = burdenById.get("people")?.executionPenalty ?? 0;
  const intel = burdenById.get("intelligence")?.confidencePenalty ?? 0;
  const operations = burdenById.get("operations")?.executionPenalty ?? 0;
  const sustainment = burdenById.get("sustainment")?.executionPenalty ?? 0;
  const plans = burdenById.get("plans")?.confidencePenalty ?? 0;
  const training = burdenById.get("training")?.executionPenalty ?? 0;
  const eventPressure = events.length * 3;
  const mechanics = previousState.staffMechanics;

  const recoveryRelief =
    (tags.has("recovery") ? 6 : 0) +
    (tags.has("retention") ? 4 : 0) +
    (tags.has("training") && !tags.has("tempo-spike") ? 2 : 0);
  const tempoPressure = tags.has("tempo-spike") ? 9 : tags.has("exercise") ? 5 : 0;
  // Natural decay when debt is low and no surge; compounding retention pressure when debt is persistently high
  const naturalDecay = mechanics.s1.recoveryDebt < 30 && tempoPressure === 0 && eventPressure === 0 ? 2 : 0;
  const retentionPressure = mechanics.s1.recoveryDebt > 65 ? 4 : 0;
  const recoveryDebt = clamp(
    mechanics.s1.recoveryDebt + people * 0.45 + tempoPressure + eventPressure + retentionPressure - recoveryRelief - naturalDecay,
    0,
    100,
  );
  const reservePredictability = clamp(
    mechanics.s1.reservePredictability + recoveryRelief * 0.7 - tempoPressure * 0.6 - people * 0.35,
    0,
    100,
  );

  const collectionGain =
    (tags.has("collection") ? 5 : 0) +
    (tags.has("warning") ? 4 : 0) +
    (tags.has("industrial-watch") ? 6 : 0) +
    (tags.has("counter-deception") ? 4 : 0);
  const deceptionRisk = clamp(
    mechanics.s2.deceptionRisk + previousState.strategic.intelligence.deceptionPressure * 0.03 + eventPressure - (tags.has("counter-deception") ? 8 : 0) - collectionGain * 0.2,
    0,
    100,
  );
  const baseConfidence = clamp(
    mechanics.s2.externalEstimateConfidence + collectionGain - intel * 0.4 - deceptionRisk * 0.03,
    0,
    100,
  );
  // High-confidence + high-deception is dangerous: apparent precision masks unreliable estimates
  const dangerousPrecisionPenalty = baseConfidence > 65 && deceptionRisk > 55 ? 6 : 0;
  const externalEstimateConfidence = clamp(baseConfidence - dangerousPrecisionPenalty, 0, 100);

  const visiblePosture = clamp(
    mechanics.s3.visiblePosture +
      (tags.has("deterrence") ? 7 : 0) +
      (tags.has("exercise") ? 8 : 0) +
      (tags.has("forward-posture") ? 6 : 0) -
      (tags.has("quiet") || tags.has("slow-burn") ? 4 : 0),
    0,
    100,
  );
  const executablePosture = clamp(
    mechanics.s3.executablePosture +
      previousState.strategic.forceGeneration.trainingThroughput * 0.03 +
      previousState.strategic.sustainment.liftAvailability * 0.02 -
      operations * 0.35 -
      training * 0.45 -
      sustainment * 0.25 +
      (tags.has("standardization") ? 5 : 0),
    0,
    100,
  );
  const stockpileDepth = clamp(
    mechanics.s4.stockpileDepth +
      (tags.has("munitions") ? 8 : 0) +
      (tags.has("repair") ? 3 : 0) +
      previousState.strategic.sustainment.munitionsSufficiency * 0.03 -
      visiblePosture * 0.04 -
      sustainment * 0.25,
    0,
    100,
  );
  const liftBurn = clamp(
    mechanics.s4.liftBurn +
      (tags.has("lift") ? 4 : 0) +
      (tags.has("exercise") ? 8 : 0) +
      (tags.has("forward-posture") ? 6 : 0) +
      sustainment * 0.3 -
      previousState.strategic.sustainment.liftAvailability * 0.04,
    0,
    100,
  );
  // credible_deterrence = min(visible, executable, sustainment_support, intel_confidence)
  const sustainmentSupport = (stockpileDepth + (100 - liftBurn)) / 2;
  const credibleDeterrence = clamp(
    Math.min(visiblePosture, executablePosture, sustainmentSupport, externalEstimateConfidence),
    0,
    100,
  );

  // supportable_tempo = min(lift, fuel, munitions, depot_capacity) - liftBurn
  const s = previousState.strategic.sustainment;
  const sustainableCapacity = Math.min(s.liftAvailability, s.fuelSufficiency, s.munitionsSufficiency, 100 - s.depotBacklog);
  const supportableTempo = clamp(sustainableCapacity - liftBurn, 0, 100);

  const coherenceGain =
    (tags.has("alliance") ? 4 : 0) +
    (tags.has("modernization") ? 4 : 0) +
    (tags.has("program") ? 3 : 0) +
    (tags.has("quiet") ? 2 : 0);
  const contradictionPenalty =
    (visiblePosture > executablePosture + 15 ? 6 : 0) +
    (liftBurn > stockpileDepth + 15 ? 5 : 0) +
    (recoveryDebt > reservePredictability + 15 ? 5 : 0);
  // Extra coherence penalty when selected options have explicit contradictionTags
  const contradictionTagPenalty = selectedOptions.reduce((sum, option) => sum + option.contradictionTags.length * 2, 0);
  const strategicCoherence = clamp(
    mechanics.s5.strategicCoherence + coherenceGain - plans * 0.35 - contradictionPenalty - contradictionTagPenalty * 0.5 + previousState.strategic.alliance.politicalAlignment * 0.02,
    0,
    100,
  );
  const doctrineAlignment = clamp(
    mechanics.s5.doctrineAlignment +
      (tags.has("ad-hoc") ? -7 : 0) +
      (tags.has("hollow") ? -5 : 0) +
      (tags.has("standardization") ? 4 : 0) +
      coherenceGain * 0.3 -
      contradictionPenalty * 0.4 -
      contradictionTagPenalty * 0.3,
    0,
    100,
  );

  return {
    s1: {
      recoveryDebt: round(recoveryDebt),
      reservePredictability: round(reservePredictability),
    },
    s2: {
      externalEstimateConfidence: round(externalEstimateConfidence),
      visibility: visibilityFor(externalEstimateConfidence),
      deceptionRisk: round(deceptionRisk),
    },
    s3: {
      visiblePosture: round(visiblePosture),
      executablePosture: round(executablePosture),
      credibleDeterrence: round(credibleDeterrence),
    },
    s4: {
      stockpileDepth: round(stockpileDepth),
      liftBurn: round(liftBurn),
      supportableTempo: round(supportableTempo),
    },
    s5: {
      strategicCoherence: round(strategicCoherence),
      doctrineAlignment: round(doctrineAlignment),
    },
  };
}

function assessOutcome(state: CampaignState) {
  const checks = state.briefing.campaignObjectives.map((objective) => {
    const current = strategicMetric(state, objective.metric);
    const met = objective.direction === "gte" ? current >= objective.target : current <= objective.target;
    return { ...objective, current, met };
  });
  const metCount = checks.filter((entry) => entry.met).length;
  const collapse =
    state.strategic.domestic.cabinetCover <= 12 ||
    state.strategic.escalation.incidentLadder >= 82 ||
    state.strategic.forceGeneration.deployableUnits <= 3.5;
  const finished = collapse || state.turn > state.microCampaignLength;
  const score = clamp(
    Math.round(
      30 +
        state.strategic.forceGeneration.deployableUnits * 5 +
        state.strategic.alliance.politicalAlignment * 0.28 +
        state.strategic.domestic.cabinetCover * 0.18 -
        state.strategic.escalation.incidentLadder * 0.3 -
        state.strategic.forceGeneration.reserveStrain * 0.12,
    ),
    0,
    100,
  );

  if (!finished) return { status: "active" as const, score, outcome: null };

  const won = !collapse && metCount >= 3;
  return {
    status: won ? ("won" as const) : ("lost" as const),
    score,
    outcome: won
      ? `Mission accomplished: ${metCount}/${checks.length} command objectives were met and the headquarters finished the opening arc in a credible posture.`
      : collapse
        ? "Campaign failed early: the headquarters lost either domestic cover, credible readiness, or escalation control."
        : `Campaign complete but incomplete: only ${metCount}/${checks.length} command objectives were secured.`,
  };
}

function normalizeState(state: CampaignState) {
  return JSON.parse(JSON.stringify(state, (_key, value) => (typeof value === "number" ? Number(value.toFixed(3)) : value))) as CampaignState;
}

function diffStates(expected: unknown, actual: unknown, path = "state", acc: Array<{ path: string; expected: unknown; actual: unknown }> = []) {
  if (acc.length >= 12) return acc;
  if (Object.is(expected, actual)) return acc;
  if (expected == null || actual == null || typeof expected !== "object" || typeof actual !== "object") {
    acc.push({ path, expected, actual });
    return acc;
  }
  if (Array.isArray(expected) && Array.isArray(actual)) {
    const length = Math.max(expected.length, actual.length);
    for (let index = 0; index < length; index += 1) {
      diffStates(expected[index], actual[index], `${path}[${index}]`, acc);
      if (acc.length >= 12) break;
    }
    return acc;
  }
  const keys = new Set([...Object.keys(expected as Record<string, unknown>), ...Object.keys(actual as Record<string, unknown>)]);
  for (const key of [...keys].sort()) {
    diffStates((expected as Record<string, unknown>)[key], (actual as Record<string, unknown>)[key], `${path}.${key}`, acc);
    if (acc.length >= 12) break;
  }
  return acc;
}

type CommitmentEntry = CampaignState["activeCommitments"][number];

function updateCommitments(
  previous: CommitmentEntry[],
  selectedTags: Set<string>,
  currentTurn: number,
  nextMechanics: StaffMechanicsState,
): CommitmentEntry[] {
  const next: CommitmentEntry[] = [];

  for (const commitment of previous) {
    if (commitment.fulfilled !== null) continue;
    const isBroken =
      (commitment.type === "alliance" && (selectedTags.has("ad-hoc") || selectedTags.has("hollow"))) ||
      (commitment.type === "program" && nextMechanics.s4.supportableTempo < 5);
    const isFulfilled =
      (commitment.type === "alliance" && nextMechanics.s5.strategicCoherence >= 60) ||
      (commitment.type === "program" && nextMechanics.s5.doctrineAlignment >= 55) ||
      (commitment.type === "doctrine" && nextMechanics.s5.doctrineAlignment >= 60) ||
      (commitment.type === "cabinet" && nextMechanics.s5.strategicCoherence >= 65);
    next.push({ ...commitment, fulfilled: isFulfilled ? true : isBroken ? false : null });
  }

  const turn = currentTurn + 1;
  if (selectedTags.has("alliance") && !next.some((c) => c.type === "alliance" && c.fulfilled === null)) {
    next.push({ id: `alliance-t${currentTurn}`, type: "alliance", label: "Alliance reassurance commitment", turnMade: turn, fulfilled: null });
  }
  if ((selectedTags.has("program") || selectedTags.has("modernization")) && !next.some((c) => c.type === "program" && c.fulfilled === null)) {
    next.push({ id: `program-t${currentTurn}`, type: "program", label: "Modernization or capability commitment", turnMade: turn, fulfilled: null });
  }
  if (selectedTags.has("public-commitment") && !next.some((c) => c.type === "cabinet" && c.fulfilled === null)) {
    next.push({ id: `cabinet-t${currentTurn}`, type: "cabinet", label: "Public commitment to cabinet and allies", turnMade: turn, fulfilled: null });
  }

  return next;
}

export function previewTurn(scenario: ScenarioDefinition, state: CampaignState, input: TurnInput) {
  const projectedResult = resolveTurn(scenario, state, input);
  const memos = deriveDecisionMemos(scenario, state);
  const acceptedRiskCandidates: AcceptedRiskOverride[] = projectedResult.staffFunctions.flatMap((readout) =>
    readout.warnings.map((warningText) => ({
      staffFunctionId: readout.id,
      warningText,
    })),
  );
  const projectedBlockers = projectedResult.directorateBurden
    .filter((entry) => entry.burdenLevel === "strained" || entry.burdenLevel === "overloaded")
    .map((entry) => entry.summary);
  const decisionPreviews: DecisionPreviewEntry[] = memos.flatMap((memo) => {
    const selected = input.selections.find((entry) => entry.memoId === memo.id);
    if (!selected) return [];
    const option = memo.options.find((entry) => entry.id === selected.optionId);
    if (!option) return [];
    return [{
      memoId: memo.id,
      memoTitle: memo.title,
      optionId: option.id,
      optionLabel: option.label,
      staffCosts: option.burden,
      staffWarnings: acceptedRiskCandidates,
      projectedReadouts: projectedResult.staffFunctions,
      projectedBlockers,
      acceptedRiskCandidateCount: acceptedRiskCandidates.length,
    }];
  });
  const disagreements = memos.flatMap((memo) => {
    const selected = input.selections.find((entry) => entry.memoId === memo.id);
    if (!selected) return [];
    const positions = projectedResult.chiefPositions.filter((entry) => entry.memoId === memo.id && entry.optionId === selected.optionId);
    return [{
      memoId: memo.id,
      label: memo.title,
      opposedBy: positions.filter((entry) => entry.position === "oppose").map((entry) => entry.chiefId),
      conditionalBy: positions.filter((entry) => entry.position === "request_conditions").map((entry) => entry.chiefId),
      supportedBy: positions.filter((entry) => entry.position === "support").map((entry) => entry.chiefId),
    }];
  });
  return { projectedResult, disagreements, decisionPreviews, acceptedRiskCandidates, predictedEvents: projectedResult.triggeredEvents };
}

export function resolveTurn(scenario: ScenarioDefinition, previousState: CampaignState, input: TurnInput): TurnResult {
  if (input.turn !== previousState.turn) throw new Error(`Expected turn ${previousState.turn}, received ${input.turn}.`);
  if (previousState.campaignStatus !== "active") throw new Error("This campaign has already ended.");

  const memos = deriveDecisionMemos(scenario, previousState);
  validateSelections(memos, input);
  const rng = mulberry32(previousState.seed + previousState.turn * 97 + input.selections.length * 17);
  const selectedPairs = input.selections.map((selection) => findOption(memos, selection));
  const selectedOptions = selectedPairs.map((entry) => entry.option);
  const directorateBurden = buildDirectorateBurden(memos, input.selections, scenario.staffCapacities);

  let nextStrategic = cloneState(previousState.strategic);
  let nextResources = cloneState(previousState.resources);
  for (const option of selectedOptions) {
    nextStrategic = applyStrategicDelta(nextStrategic, option.stateDelta);
    nextResources = applyResourceDelta(nextResources, option.stateDelta);
  }

  const selectedTags = new Set(selectedOptions.flatMap((option) => option.tags));
  const triggeredEvents = chooseEvents(scenario, previousState, selectedTags, rng);
  for (const event of triggeredEvents) {
    nextStrategic = applyStrategicDelta(nextStrategic, event.stateDelta);
    nextResources = applyResourceDelta(nextResources, event.stateDelta);
  }

  nextStrategic = applyBurdenPenalties(nextStrategic, directorateBurden);
  nextStrategic.forceGeneration.deployableUnits = round(nextStrategic.forceGeneration.deployableUnits);
  nextStrategic.forceGeneration.reserveStrain = round(nextStrategic.forceGeneration.reserveStrain);

  const chiefPositions = selectedPairs.flatMap(({ memo, option }) => buildChiefPositions(scenario.chiefs, previousState, memo, option));
  const nextPrograms = updatePrograms(scenario, previousState, input.selections, directorateBurden);
  const nextConstraints = updateConstraints(previousState, selectedOptions, triggeredEvents);
  const nextTrust = updateChiefTrust(previousState, chiefPositions);
  const nextStaffMechanics = updateStaffMechanics(previousState, selectedOptions, directorateBurden, triggeredEvents);

  const nextFlags = triggeredEvents.reduce<Record<string, boolean>>((flags, event) => {
    const updated = { ...flags };
    for (const flag of event.setsFlags) updated[flag] = true;
    for (const flag of event.clearsFlags) delete updated[flag];
    return updated;
  }, cloneState(previousState.eventFlags));

  if (nextPrograms.find((program) => program.id === "counter-deception-grid")?.phase === "integrated") {
    nextFlags.counter_deception_mature = true;
  }

  const nextTurn = previousState.turn + 1;
  const nextCommitments = updateCommitments(previousState.activeCommitments, selectedTags, previousState.turn, nextStaffMechanics);

  const nextState: CampaignState = {
    ...previousState,
    turn: nextTurn,
    resources: nextResources,
    staffMechanics: nextStaffMechanics,
    forceGeneration: nextStrategic.forceGeneration,
    intel: nextStrategic.intelligence,
    sustainment: nextStrategic.sustainment,
    alliance: nextStrategic.alliance,
    domestic: nextStrategic.domestic,
    escalation: nextStrategic.escalation,
    strategic: nextStrategic,
    capabilityPrograms: nextPrograms,
    externalConstraints: nextConstraints,
    chiefTrust: nextTrust,
    activeCommitments: nextCommitments,
    eventHistory: [...previousState.eventHistory, ...triggeredEvents.map((event) => event.id)],
    eventFlags: nextFlags,
    briefing: {
      theater: previousState.briefing.theater,
      monthLabel: `Month ${nextTurn}`,
      situationSummary:
        triggeredEvents.length > 0
          ? triggeredEvents.map((event) => event.summary).join(" ")
          : "No single shock dominated the month, but the staff burden did shape what became credible.",
      riskPosture:
        directorateBurden.some((entry) => entry.burdenLevel === "overloaded")
          ? "The headquarters is now carrying more decision weight than at least one directorate can cleanly execute."
          : "The headquarters remains inside a usable decision envelope, but slack is limited.",
      commandersIntent:
        nextStrategic.forceGeneration.deployableUnits >= previousState.strategic.forceGeneration.deployableUnits
          ? "Preserve the gain in credible readiness without letting the staff outrun itself."
          : "Recover coherence before chasing a second ambitious move.",
      operationalPicture:
        nextStrategic.forceGeneration.deployableUnits >= previousState.strategic.forceGeneration.deployableUnits
          ? "The force held the line and kept credible readiness from slipping backward."
          : "Readiness recovered unevenly, with support capacity still the binding constraint.",
      decisionFocus:
        directorateBurden.some((entry) => entry.burdenLevel === "overloaded")
          ? "Reduce staff overload before asking for another visible move."
          : "Exploit the gain without overextending the headquarters.",
      openQuestions: [
        "Which assumption in this month’s brief is most likely to fail next?",
        "What did the room ask of sustainment that it has not yet actually earned?",
        "Where is the next political cost likely to surface first?",
      ],
      campaignObjectives: previousState.briefing.campaignObjectives,
      budgetHeadline: previousState.briefing.budgetHeadline,
      readinessHeadline: previousState.briefing.readinessHeadline,
      geopoliticalSummary: previousState.briefing.geopoliticalSummary,
    },
  };

  const outcome = assessOutcome(nextState);
  nextState.campaignStatus = outcome.status;
  nextState.campaignScore = outcome.score;
  nextState.campaignOutcome = outcome.outcome;

  const monthlyEstimate = createMonthlyEstimate(previousState, nextState, chiefPositions, directorateBurden);
  const resultAfterAction = afterAction(previousState, nextState, directorateBurden, triggeredEvents, input.acceptedRiskOverrides);
  const staffFunctions = buildStaffFunctionReadouts(scenario.staffFunctions, directorateBurden, nextState);
  const explainability = createExplainability(selectedPairs, directorateBurden, triggeredEvents, previousState, nextState);
  const summary = nextState.campaignStatus === "active" ? summarizeState(nextState) : nextState.campaignOutcome ?? summarizeState(nextState);

  const acceptedRisks = (input.acceptedRiskOverrides ?? []).map((override) => ({
    staffFunctionId: override.staffFunctionId,
    warningText: override.warningText,
    accepted: true as const,
  }));

  const replayHash = createHash("sha256")
    .update(JSON.stringify({ previousState: normalizeState(previousState), input, nextState: normalizeState(nextState) }))
    .digest("hex")
    .slice(0, 16);

  return {
    input,
    previousState,
    nextState,
    recommendations: chiefPositions,
    advisoryPaper: {
      title: monthlyEstimate.chiefsPaperTitle,
      synopsis: monthlyEstimate.chiefsPaperSummary,
      bullets: monthlyEstimate.chiefsPaperBullets,
      uncertainty: monthlyEstimate.uncertainty,
    },
    chiefsPaper: {
      title: monthlyEstimate.chiefsPaperTitle,
      synopsis: monthlyEstimate.chiefsPaperSummary,
      bullets: monthlyEstimate.chiefsPaperBullets,
      uncertainty: monthlyEstimate.uncertainty,
    },
    commandersEstimate: monthlyEstimate.commandersEstimate,
    memos,
    chiefPositions,
    monthlyEstimate,
    directorateBurden,
    staffFunctions,
    explainability,
    portfolioLoad: [],
    triggeredEvents,
    afterAction: resultAfterAction,
    acceptedRisks,
    replayHash,
    summary,
  };
}

export function validateReplaySession(scenario: ScenarioDefinition, session: { initialState: CampaignState; turnInputs: TurnInput[]; history: TurnResult[]; state: CampaignState }): ReplayValidation {
  let current = cloneState(session.initialState);
  let failedAtTurn: number | null = null;
  let failureKind: ReplayValidation["failureKind"] = "none";
  const diffs: ReplayValidation["diffs"] = [];

  if (session.turnInputs.length !== session.history.length) {
    const turn = session.turnInputs[session.history.length]?.turn ?? session.state.turn;
    return {
      ok: false,
      checkedTurns: Math.min(session.turnInputs.length, session.history.length),
      failedAtTurn: turn,
      failureKind: "history_length_mismatch",
      diffs: [
        {
          turn,
          path: "history.length",
          expected: String(session.turnInputs.length),
          actual: String(session.history.length),
        },
      ],
    };
  }

  for (let index = 0; index < session.turnInputs.length; index += 1) {
    const expected = resolveTurn(scenario, current, session.turnInputs[index]);
    const actual = session.history[index];
    if (expected.replayHash !== actual.replayHash) {
      failedAtTurn = actual.input.turn;
      failureKind = "replay_hash_mismatch";
      diffs.push({ turn: actual.input.turn, path: "replayHash", expected: expected.replayHash, actual: actual.replayHash });
      break;
    }

    const stateDiffs = diffStates(normalizeState(expected.nextState), normalizeState(actual.nextState)).map((entry) => ({
      turn: actual.input.turn,
      path: entry.path,
      expected: JSON.stringify(entry.expected),
      actual: JSON.stringify(entry.actual),
    }));
    if (stateDiffs.length > 0) {
      failedAtTurn = actual.input.turn;
      failureKind = "state_mismatch";
      diffs.push(...stateDiffs);
      break;
    }
    current = actual.nextState;
  }

  if (failedAtTurn == null) {
    const finalStateDiffs = diffStates(normalizeState(current), normalizeState(session.state)).map((entry) => ({
      turn: session.state.turn,
      path: entry.path,
      expected: JSON.stringify(entry.expected),
      actual: JSON.stringify(entry.actual),
    }));
    if (finalStateDiffs.length > 0) {
      failedAtTurn = session.state.turn;
      failureKind = "final_state_mismatch";
      diffs.push(...finalStateDiffs);
    }
  }

  return {
    ok: failedAtTurn == null,
    checkedTurns: session.turnInputs.length,
    failedAtTurn,
    failureKind,
    diffs,
  };
}
