/**
 * Brass Ledger Simulation Engine
 *
 * Turn-based military headquarters wargame engine modelling S1–S5 staff functions.
 * Each turn processes player decisions (memo selections), applies staff burden penalties,
 * updates S1–S5 mechanics, advances programs and external industry nodes, and evaluates
 * campaign outcome.
 *
 * ## Design Philosophy
 * All state transitions are deterministic given the same seed and inputs so that sessions
 * can be validated by `validateReplaySession`. Stochastic elements (event selection) use
 * a seeded PRNG so replay remains exact.
 *
 * ## S1–S5 Mechanic Summary
 * | Function | Mechanic tracked          | Key doctrine source                          |
 * |----------|--------------------------|----------------------------------------------|
 * | S1       | Recovery debt / reserve  | FM 6-0; DoD Dwell Policy (2021)              |
 * | S2       | Estimate confidence / fog | ADP 2-0; Heuer (1999); Wohlstetter (1962)   |
 * | S3       | Visible vs executable posture | AJP-3; Schelling (1966); Jervis (1978)   |
 * | S4       | Stockpile / lift burn    | ADP 4-0; Goldratt (1984) Theory of Constraints |
 * | S5       | Strategic coherence / doctrine | JP 5-0; Lissner (2018)                |
 *
 * ## Academic References
 * - Berndtsson, J. & Österberg, J. (2022). "A question of time? Deployments, dwell time, and
 *   work-life balance for military personnel in Scandinavia." *Military Psychology* 35(2): 157–168.
 *   Empirical basis for deploy-to-dwell ratios (1:2 Sweden/Norway; 1:6 Denmark) and health
 *   outcomes under compressed recovery windows.
 * - DoD (2021). Deployment-to-Dwell Ratio Policy Memo (effective 10 Nov 2021). Establishes
 *   1:3 active-duty and 1:5 reserve component standards.
 * - MacGregor, A.J. et al. (2012). "Mental health outcomes following combat deployment." *American
 *   Journal of Public Health*. 65 000-person study linking dwell time to PTSD incidence.
 * - Heuer, R.J. (1999). *Psychology of Intelligence Analysis*. CIA Center for the Study of
 *   Intelligence. Foundational treatment of mirror imaging, cognitive bias, and ACH.
 * - Wohlstetter, R. (1962). *Pearl Harbor: Warning and Decision*. Stanford UP. Signal-vs-noise
 *   analysis; overconfidence in assessments despite high raw information volume.
 * - Tetlock, P. & Gardner, D. (2015). *Superforecasting*. Crown. Calibration research showing
 *   overconfident estimates degrade decision quality; amateur forecasters outperformed
 *   classified-access professionals by ≈30 % through better uncertainty acknowledgment.
 * - Lowenthal, M.M. (multiple eds.). *Intelligence: From Secrets to Policy*. CQ Press.
 *   Mirror-imaging syndrome as a primary failure mode for national-level analysis.
 * - Schelling, T.C. (1966). *Arms and Influence*. Yale UP. Compellence vs. deterrence;
 *   visible military demonstrations as commitment-creating devices.
 * - Jervis, R. (1978). "Cooperation Under the Security Dilemma." *World Politics* 30(2): 167–214.
 *   Offense-defense distinguishability; observable posture as a signal of intent.
 * - Fearon, J.D. (1994). "Domestic Political Audiences and the Escalation of International
 *   Dispute." *APSR* 88(3): 577–592. Audience costs; commitment credibility.
 * - Fearon, J.D. (1995). "Rationalist Explanations for War." *International Security* 18(3).
 *   Private information, costly signals, and commitment problems in crisis bargaining.
 * - Powell, R. (1990). *Nuclear Deterrence Theory: The Search for Credibility*. Cambridge UP.
 *   Deterrence as a political problem; resolve + capability must both be legible.
 * - Snyder, G.H. (1965). "The Stability-Instability Paradox." In Seabury (ed.), *Balance of
 *   Power*. Strategic stability enabling conventional sub-threshold adventurism.
 * - Goldratt, E.M. & Cox, J. (1984). *The Goal*. North River Press. Theory of Constraints:
 *   system throughput is bounded by its weakest link; applied to military logistics chains.
 * - Hellberg, R. & Lundmark, M. (2025). "Transformation in European Defence Supply Chains
 *   as Ukraine Conflict Fuels Demand." *Scandinavian Journal of Military Studies* 8(1): 17–39.
 *   Just-in-time failure; propellant, explosives, and electronics as binding bottlenecks.
 * - Ruokonen, A. (2024). "Ukraine's Artillery Shell Shortfall." *Lawfare*, 3 April 2024.
 *   Production-vs-demand gap: Ukraine required 20 000 rounds/day; received as few as 2 000.
 * - Dumond, J. et al. (2001). *Velocity Management: The Business Paradigm That Has Transformed
 *   U.S. Army Logistics*. RAND MR-1108. Supply chain throughput and inventory discipline.
 * - Lissner, R.F. (2018). "What Is Grand Strategy? Sweeping a Conceptual Minefield."
 *   *Texas National Security Review* 1(2). Grand strategy as coherent alignment of ends,
 *   ways, and means; strategic drift under tactical transactionalism.
 * - Posen, B.R. (1984). *The Sources of Military Doctrine*. Cornell UP. Doctrine alignment
 *   as an organisational constraint on strategy formulation.
 * - Snyder, G.H. (1984). "The Security Dilemma in Alliance Politics." *World Politics* 36(4):
 *   461–495. Abandonment-vs-entrapment as the core tension in alliance commitment.
 * - Huth, P.K. (1988). "Extended Deterrence and the Outbreak of War." *APSR* 82(2): 423–443.
 *   Four-factor model of deterrence success: military balance, signalling, resolve, interests.
 * - Mandel, D.R. & Barnes, A. (2014). "Accuracy of Forecasts in Strategic Intelligence."
 *   *PNAS* 111(30). Cost of overconfidence in intelligence "usually outweighs underconfidence."
 * - Sherbrooke, C.C. (1968). "METRIC: A Multi-Echelon Technique for Recoverable Item Control."
 *   *Operations Research* 16(1): 122–141. Foundational multi-echelon inventory model for
 *   military repairable parts; backorders at the base are the operationally relevant output.
 * - Jones, S.G. (2023). "Empty Bins in a Wartime Environment." CSIS. U.S. defence industrial
 *   base is not prepared for high-intensity conflict; long-range precision munitions exhausted
 *   in < 1 week in Taiwan Strait wargames.
 * - Estornell, A., Das, S., & Vorobeychik, Y. (2019). "Deception through Half-Truths."
 *   arXiv:1911.05885. Bayesian updating under adversarial masking; selective concealment of
 *   true facts is more effective and harder to detect than outright misinformation.
 */
import { createHash } from "node:crypto";
import {
  type AcceptedRiskOverride,
  type BurdenBias,
  type CampaignState,
  type CommanderIntent,
  type ChiefCoalitionEntry,
  type ChiefPositionEntry,
  type DecisionPreviewEntry,
  type DecisionMemo,
  type DirectorateBurden,
  type DirectorateId,
  type DoctrineLens,
  type DoctrineCondition,
  type DoctrineMechanicsState,
  type EventDefinition,
  type ExplainabilityEntry,
  type ExternalConstraintState,
  type ExternalTechNode,
  type MemoOption,
  type MemoSelection,
  type ModuleEffectLane,
  type ReplayValidation,
  type ScenarioDefinition,
  type StaffFunctionDefinition,
  type StaffMechanicsState,
  type StaffModuleDefinition,
  type StaffModuleEffect,
  type StaffModuleReadout,
  type StaffNegotiation,
  type StateDelta,
  type StrategicState,
  type TechProgressNode,
  type TurnInput,
  type TurnResult,
  buildChiefCoalitions,
  buildCampaignLegibility,
  buildCommandPacketSummary,
  buildChiefPositions,
  buildDirectorateBurden,
  buildStaffFunctionReadouts,
  continueChiefConversation,
  defaultDoctrineMechanicsState,
  directorateLabel,
  evaluateCampaignObjectives,
  getConversationRecordForTurn,
  moduleEffectLaneSchema,
  staffFunctionForDirectorate,
  summarizeState,
  startChiefConversation,
  updateChiefAgendaMemoryFromConversation,
  updateCommitmentsFromChiefConversation,
  updateChiefAgendaMemoryFromPositions,
  underpricedLaneWarningSuffix,
} from "@brass-ledger/shared";

export type Rng = () => number;

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

/**
 * Maps a program development phase to a three-level tech maturity score.
 *
 * The three-level scheme mirrors NATO Technology Readiness Level (TRL) groupings
 * used in defence acquisition to communicate programme maturity:
 *
 *   - Level 0 (concept/funded): TRL 1–3. Basic research, feasibility; no operational utility.
 *   - Level 1 (procured/integrated): TRL 4–7. Prototype demonstrated; some support capacity.
 *   - Level 2 (trained/operational): TRL 8–9. System qualified and fielded with trained personnel.
 *
 * The distinction between "procured" and "integrated" (both level 1) reflects that a system
 * delivered to unit stores does not become tactically available until it is embedded in
 * doctrine, communications, and maintenance pipelines — a delay well documented in US and
 * NATO programme histories (e.g. F-35 IOC vs. FOC gap of ≈5 years).
 */
function phaseToLevel(phase: string): 0 | 1 | 2 {
  const idx = phaseIndex(phase);
  if (idx <= 1) return 0;
  if (idx <= 3) return 1;
  return 2;
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

// The declaration is replayed input, but it only has meaning when the packet
// itself bears it. This same validation therefore covers server, CLI, import,
// preview, and deterministic replay.
function validateCommanderIntent(input: TurnInput, directorateBurden: DirectorateBurden[]) {
  const intent = input.commanderIntent;
  if (!intent) return;
  const mainEffort = directorateBurden.find((entry) => entry.directorate === intent.mainEffort);
  if (!mainEffort || mainEffort.burdenPoints <= 0) {
    throw new Error(`Declared main effort ${directorateLabel(intent.mainEffort)} is not carried by this packet.`);
  }
  if (intent.acceptedSecondaryRisk) {
    const secondary = directorateBurden.find((entry) => entry.directorate === intent.acceptedSecondaryRisk);
    if (!secondary || secondary.burdenLevel === "light") {
      throw new Error(`Accepted secondary risk ${directorateLabel(intent.acceptedSecondaryRisk)} is not a strained lane in this packet.`);
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

function negotiationCostDelta(negotiation: TurnInput["staffNegotiations"][number]): StateDelta {
  if (negotiation.cost === "political_cover") {
    return {
      resources: { politicalCapital: -2, publicLegitimacy: -1 },
      domestic: { cabinetCover: -2, mediaHeat: 1 },
    };
  }
  if (negotiation.cost === "readiness_delay") {
    return {
      resources: { readiness: -1 },
      forceGeneration: { deployableUnits: -0.15, trainingThroughput: -1 },
    };
  }
  return {
    resources: { budgetAuthority: -2 },
    domestic: { committeeTolerance: -1 },
  };
}

/** Scenario-declared names for capability programs and external constraints. */
function buildNodeNameLookup(scenario: ScenarioDefinition) {
  const names = new Map<string, string>();
  for (const program of scenario.capabilityPrograms) names.set(program.id, program.label);
  for (const constraint of scenario.externalConstraints) names.set(constraint.id, constraint.label);
  return (id: string) => names.get(id) ?? id;
}

function staffNegotiationSummary(negotiation: TurnInput["staffNegotiations"][number]) {
  const cost =
    negotiation.cost === "political_cover"
      ? "political cover"
      : negotiation.cost === "readiness_delay"
        ? "readiness delay"
        : "budget overtime";
  const points = `${negotiation.reliefPoints} burden ${negotiation.reliefPoints === 1 ? "point" : "points"}`;
  return `${directorateLabel(negotiation.directorate)}, lifting ${points} at the cost of ${cost}`;
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

function conditionMet(condition: DoctrineCondition, mechanics: DoctrineMechanicsState) {
  const value = mechanics[condition.variable];
  return condition.comparison === "gte" ? value >= condition.threshold : value <= condition.threshold;
}

function doctrinePredicateMet(event: EventDefinition, mechanics: DoctrineMechanicsState) {
  return event.doctrineTrigger?.conditions.every((condition) => conditionMet(condition, mechanics)) ?? false;
}

export function doctrineEventEligible(event: EventDefinition, state: CampaignState, selectedTags: Set<string>) {
  if (!event.doctrineTrigger) return false;
  if (state.turn < event.minTurn || state.turn > event.maxTurn) return false;
  if (state.eventHistory.includes(event.id)) return false;
  if (!event.triggerTags.every((tag) => selectedTags.has(tag))) return false;
  if (!event.requiredFlags.every((flag) => state.eventFlags[flag])) return false;
  if (event.excludedFlags.some((flag) => state.eventFlags[flag])) return false;
  if (!doctrinePredicateMet(event, state.doctrineMechanics)) return false;
  return (state.doctrineMaturity[event.id]?.consecutiveTurns ?? 0) >= event.doctrineTrigger.sustainedTurns - 1;
}

export function chooseEvents(
  scenario: ScenarioDefinition,
  previousState: CampaignState,
  selectedTags: Set<string>,
  rng: Rng,
) {
  const doctrineEligible = scenario.events.filter((event) => doctrineEventEligible(event, previousState, selectedTags));
  const ordinaryEligible = scenario.events.filter((event) => !event.doctrineTrigger && eventEligible(event, previousState, selectedTags));
  const ordinaryPassed = ordinaryEligible.filter((_event, index) => rng() > 0.35 || index === 0);
  const ordinaryChosen = ordinaryPassed.slice(0, Math.max(0, 2 - doctrineEligible.length));
  const chosen = new Set([...doctrineEligible, ...ordinaryChosen].map((event) => event.id));
  return scenario.events.filter((event) => chosen.has(event.id));
}

function updateDoctrineMaturity(args: {
  previousState: CampaignState;
  nextDoctrineMechanics: DoctrineMechanicsState;
  selectedTags: Set<string>;
  acceptedRiskOverrides: AcceptedRiskOverride[];
  events: EventDefinition[];
  triggeredEvents: EventDefinition[];
  turn: number;
}) {
  const fired = new Set(args.triggeredEvents.map((event) => event.id));
  const next: CampaignState["doctrineMaturity"] = {};
  for (const event of args.events) {
    const trigger = event.doctrineTrigger;
    if (!trigger || fired.has(event.id) || args.previousState.eventHistory.includes(event.id)) continue;
    if (args.turn > event.maxTurn || !event.requiredFlags.every((flag) => args.previousState.eventFlags[flag])) continue;
    if (event.excludedFlags.some((flag) => args.previousState.eventFlags[flag])) continue;
    if (!event.triggerTags.every((tag) => args.selectedTags.has(tag)) || !doctrinePredicateMet(event, args.nextDoctrineMechanics)) continue;
    const refs = args.acceptedRiskOverrides
      .filter((risk) => trigger && event.causalContext?.staffFunctionRefs.includes(risk.staffFunctionId))
      .map((risk) => ({ turn: args.turn, staffFunctionId: risk.staffFunctionId, warningText: risk.warningText }));
    const prior = args.previousState.doctrineMaturity[event.id];
    const acceptedRiskRefs = [...(prior?.acceptedRiskRefs ?? []), ...refs].filter((risk, index, all) =>
      all.findIndex((candidate) => candidate.turn === risk.turn && candidate.staffFunctionId === risk.staffFunctionId && candidate.warningText === risk.warningText) === index,
    );
    next[event.id] = {
      consecutiveTurns: Math.min(trigger.sustainedTurns, (prior?.consecutiveTurns ?? 0) + 1),
      startedTurn: prior?.startedTurn ?? args.turn,
      acceptedRiskRefs,
    };
  }
  return next;
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
  staffNegotiations: TurnInput["staffNegotiations"] = [],
  nodeName: (id: string) => string = (id) => id,
) {
  const notes = [];
  const deployableDelta = nextState.strategic.forceGeneration.deployableUnits - previousState.strategic.forceGeneration.deployableUnits;
  const politicalDelta = nextState.strategic.domestic.cabinetCover - previousState.strategic.domestic.cabinetCover;
  const escalationDelta = nextState.strategic.escalation.incidentLadder - previousState.strategic.escalation.incidentLadder;

  notes.push({
    heading: "What changed this month",
    detail: `Deployable force shifted ${deployableDelta >= 0 ? "+" : ""}${round(deployableDelta)} brigades; cabinet cover shifted ${politicalDelta >= 0 ? "+" : ""}${round(politicalDelta)}; incident ladder shifted ${escalationDelta >= 0 ? "+" : ""}${round(escalationDelta)}.`,
  });

  const overloaded = burdens.filter((entry) => entry.burdenLevel === "overloaded");
  if (overloaded.length > 0) {
    notes.push({
      heading: "What the headquarters underestimated",
      detail: `You asked more of ${overloaded.map((entry) => directorateLabel(entry.directorate)).join(", ")} than ${overloaded.length === 1 ? "it" : "they"} could absorb cleanly, so this followed: ${overloaded.map((entry) => entry.failureMode).join("; ")}.`,
    });
  }

  if (events.length > 0) {
    notes.push({
      heading: "What turned into a real problem",
      detail: events.map((event) => event.summary).join(" "),
    });
  }

  const mechanics = nextState.staffMechanics;
  notes.push({
    heading: "Where your staff stand now",
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
      detail: `Supportable tempo is ${round(nextState.staffMechanics.s4.supportableTempo)}. What logistics can actually support is now the hard limit on any further activity this month, whatever else the plan says.`,
    });
  }

  // S5: doctrine bet after-action when doctrine alignment drops sharply
  if (nextState.staffMechanics.s5.doctrineAlignment < previousState.staffMechanics.s5.doctrineAlignment - 5) {
    notes.push({
      heading: "S5 doctrine bet",
      detail: `Doctrine alignment dropped from ${round(previousState.staffMechanics.s5.doctrineAlignment)} to ${round(nextState.staffMechanics.s5.doctrineAlignment)}. You stepped away from a coherent sequence of moves on purpose. Whether that costs you depends on whether the campaign can absorb it.`,
    });
  }

  // Accepted-risk summary
  if (acceptedRiskOverrides.length > 0) {
    notes.push({
      heading: "Accepted risks",
      detail: `You went ahead knowing ${acceptedRiskOverrides.length} staff ${acceptedRiskOverrides.length === 1 ? "warning" : "warnings"}: ${acceptedRiskOverrides.map((r) => `${r.staffFunctionId} — ${r.warningText}`).join(" ")}`,
    });
  }

  if (staffNegotiations.length > 0) {
    notes.push({
      heading: "Staff negotiations",
      detail: `Before committing the month, you took work off ${staffNegotiations.map(staffNegotiationSummary).join("; ")}.`,
    });
  }

  // Industry level changes: note when an external node degrades or recovers
  const prevTechById = new Map(
    externalTechBaseline(previousState.externalConstraints, previousState.externalTech, previousState.staffMechanics.s2.externalEstimateConfidence)
      .map((node) => [node.id, node]),
  );
  for (const node of nextState.externalTech) {
    const prev = prevTechById.get(node.id);
    if (!prev || prev.level === node.level) continue;
    if (node.level < prev.level) {
      notes.push({
        heading: "An outside pressure got worse",
        detail: `${nodeName(node.id)} fell from level ${prev.level} to level ${node.level}. Expect logistics (S4) to get tighter over the next few months.`,
      });
    } else {
      notes.push({
        heading: "An outside pressure eased",
        detail: `${nodeName(node.id)} improved from level ${prev.level} to level ${node.level}. It puts less pressure on logistics (S4) than it did.`,
      });
    }
  }

  // Program level advances: note when a capability reaches a new milestone
  const prevProgramById = new Map(previousState.internalTech.map((n) => [n.id, n]));
  for (const node of nextState.internalTech) {
    const prev = prevProgramById.get(node.id);
    if (!prev || prev.level === node.level) continue;
    const levelLabel = node.level === 1 ? "the prototype stage" : "full fielding";
    notes.push({
      heading: "A program reached a milestone",
      detail: `${nodeName(node.id)} reached ${levelLabel}. You can now plan around this capability.`,
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
  nodeName: (id: string) => string = (id) => id,
): ExplainabilityEntry[] {
  const overloaded = burdens.filter((entry) => entry.burdenLevel === "overloaded");
  const strained = burdens.filter((entry) => entry.burdenLevel === "strained");
  const deployableDelta = round(nextState.strategic.forceGeneration.deployableUnits - previousState.strategic.forceGeneration.deployableUnits);
  const cabinetDelta = round(nextState.strategic.domestic.cabinetCover - previousState.strategic.domestic.cabinetCover);
  const incidentDelta = round(nextState.strategic.escalation.incidentLadder - previousState.strategic.escalation.incidentLadder);

  return [
    {
      label: "Your choices",
      summary: `Your ${selectedPairs.length} ${selectedPairs.length === 1 ? "choice" : "choices"} set the direction for the month. Events and staff overload were applied on top of them.`,
      positiveDrivers: selectedPairs.map(({ memo, option }) => `${memo.title}: ${option.label}`),
      blockers: selectedPairs.flatMap(({ option }) => option.tradeoffs.slice(0, 1)),
      causalRefs: selectedPairs.map(({ memo, option }) => `memo:${memo.id}/option:${option.id}`),
    },
    {
      label: "Staff capacity",
      summary:
        overloaded.length > 0
          ? `${overloaded.length} ${overloaded.length === 1 ? "directorate was" : "directorates were"} overloaded, which lowered how well the month was carried out.`
          : strained.length > 0
            ? `${strained.length} ${strained.length === 1 ? "directorate was" : "directorates were"} strained, but not past the point of recovery.`
            : "Every directorate stayed inside what it can absorb in a month.",
      positiveDrivers: burdens.filter((entry) => entry.burdenLevel === "light").map((entry) => `${directorateLabel(entry.directorate)} kept room to spare`),
      blockers: [...overloaded, ...strained].map((entry) => entry.failureMode),
      causalRefs: burdens.map((entry) => `staff:${entry.directorate}`),
    },
    {
      label: "How the headline numbers moved",
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
      summary: events.length > 0
        ? `${events.length} ${events.length === 1 ? "event was" : "events were"} triggered by the tags on the options you chose.`
        : "No events were triggered this month.",
      positiveDrivers: events.length > 0 ? [] : ["nothing outside your control hit the month"],
      blockers: events.map((event) => event.summary),
      causalRefs: [
        ...events.map((event) => `event:${event.id}`),
        // Include industry constraint shifts from events so downstream consumers can trace
        // which externalTech node an event affects and by how much. Shifts with delta > 0
        // worsen constraints; delta < 0 improves them.
        ...events.flatMap((event) =>
          event.constraintShifts.map((shift) => `industry:${shift.constraintId}/delta:${shift.delta >= 0 ? "+" : ""}${shift.delta}`)
        ),
      ],
    },
    {
      label: "Programs and outside pressures",
      summary: (() => {
        const operationalCount = nextState.internalTech.filter((n) => n.level === 2).length;
        const disruptedCount = nextState.externalTech.filter((n) => n.level === 0).length;
        return `${operationalCount} ${operationalCount === 1 ? "program is" : "programs are"} fielded; `
          + `${disruptedCount} outside ${disruptedCount === 1 ? "pressure is" : "pressures are"} disrupted.`;
      })(),
      positiveDrivers: nextState.internalTech.filter((n) => n.level === 2).map((n) => `${nodeName(n.id)} is fielded`),
      blockers: nextState.externalTech.filter((n) => n.level === 0).map((n) => `${nodeName(n.id)} is disrupted`),
      causalRefs: [
        ...nextState.internalTech.map((n) => `tech:${n.id}/level:${n.level}`),
        ...nextState.externalTech.map((n) => `industry:${n.id}/level:${n.level}/estimate:${n.estimate.estimatedLevel}`),
      ],
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

/**
 * Maps external constraint severity (0–100) to a discrete industry health level.
 *
 * Thresholds are calibrated against the defence industrial base literature:
 * - Severity ≥ 65 → disrupted (level 0): supply chain failure observable in delivery data.
 *   Analogous to European propellant and explosives shortages documented by Hellberg &
 *   Lundmark (2025) where "lean, just-in-time operations cannot easily respond to a sudden
 *   surge" — the system had structurally lost redundancy before the stress event.
 * - Severity 35–64 → constrained (level 1): degraded but still functional; delays and
 *   substitution costs are rising but the bottleneck has not yet become system-wide.
 * - Severity < 35 → reliable (level 2): normal commercial/industrial operation.
 */
function severityToLevel(severity: number): 0 | 1 | 2 {
  if (severity >= 65) return 0;
  if (severity >= 35) return 1;
  return 2;
}

/**
 * Converts a numerical confidence score into a three-tier visibility classification.
 *
 * The RUMORED / ESTIMATED / KNOWN taxonomy is borrowed from NATO INTREP / INTSUM
 * reporting standards and mirrors the National Intelligence Council's five-tier
 * confidence vocabulary (very low / low / moderate / high / very high) compressed
 * to three buckets suitable for a turn-level game.
 *
 * Thresholds:
 * - ≥ 65 → KNOWN: collection is current and not significantly contested by deception.
 * - 40–64 → ESTIMATED: usable for planning but carries acknowledged uncertainty.
 * - < 40 → RUMORED: single-source or uncorroborated; analytical judgments at this level
 *   are especially vulnerable to mirror-imaging (Heuer, 1999) and adversary manipulation.
 */
function industryVisibilityFor(confidence: number): ExternalTechNode["estimate"]["visibility"] {
  if (confidence >= 65) return "KNOWN";
  if (confidence >= 40) return "ESTIMATED";
  return "RUMORED";
}

function externalTechFromConstraint(constraint: ExternalConstraintState, confidence: number): ExternalTechNode {
  const level = severityToLevel(constraint.severity);
  const roundedConfidence = round(clamp(confidence, 0, 100));
  return {
    id: constraint.id,
    level,
    progress: round(clamp(100 - constraint.severity, 0, 100)),
    estimate: {
      estimatedLevel: level,
      confidence: roundedConfidence,
      visibility: industryVisibilityFor(roundedConfidence),
      lastVerifiedTurn: null,
    },
  };
}

function externalTechBaseline(
  constraints: ExternalConstraintState[],
  previousTech: ExternalTechNode[],
  confidence: number,
): ExternalTechNode[] {
  const previousById = new Map(previousTech.map((node) => [node.id, node]));
  return constraints.map((constraint) => previousById.get(constraint.id) ?? externalTechFromConstraint(constraint, confidence));
}

/**
 * Advances external industry node estimates given updated constraint severities and S2 state.
 *
 * ## What this models
 * Three external market nodes (shipping, electronics, propellant) represent the defence
 * industrial base constraints most directly relevant to S4 logistics capacity. Each node
 * has a *true* level (derived from constraint severity) and an *estimated* level (what the
 * headquarters believes, subject to S2 confidence and adversary deception).
 *
 * This separation reflects the intelligence challenge identified by Wohlstetter (1962):
 * large quantities of raw information do not guarantee accurate assessment; analysts must
 * work from estimates that can be manipulated. The optimistic-bias rule under RUMORED +
 * high-deception implements the adversary's incentive to inflate the apparent health of
 * their own industrial capacity (e.g. claims of stockpile adequacy before 2022 that did
 * not survive the first six months of high-intensity conflict — Ruokonen, 2024).
 *
 * ## Confidence dynamics
 * - `industrial-watch` tag: +8 confidence — dedicated industrial attaché-level collection.
 * - `collection` tag: +3 confidence — general HUMINT/OSINT sweep includes industry.
 * - S2 deception risk × 0.06 decay per turn: sustained adversary denial-and-deception
 *   programme erodes the reliability of all indirect collection, consistent with the
 *   findings of Heuer (1999) on how deception degrades the value of even correct signals.
 *
 * ## Optimistic-bias rule under RUMORED visibility
 * When confidence < 40 (RUMORED) and deception risk > 50, `estimatedLevel` is raised by 1
 * above the true level (capped at 2). This encodes the adversary's ability to manipulate
 * low-confidence estimates — a "half-truth" injection as modelled by Estornell et al. (2019)
 * where the attacker achieves maximum effect by concealing rather than falsifying.
 */
function updateExternalTech(
  previousState: CampaignState,
  nextConstraints: ExternalConstraintState[],
  selectedTags: Set<string>,
  nextMechanics: StaffMechanicsState,
): ExternalTechNode[] {
  const constraintById = new Map(nextConstraints.map((c) => [c.id, c]));
  const previous = externalTechBaseline(
    nextConstraints,
    previousState.externalTech,
    previousState.staffMechanics.s2.externalEstimateConfidence,
  );
  // industrial-watch gives dedicated attaché-level collection (+8); generic collection sweep (+3)
  const industryGain = selectedTags.has("industrial-watch") ? 8 : selectedTags.has("collection") ? 3 : 0;

  return previous.map((node) => {
    const constraint = constraintById.get(node.id);
    if (!constraint) return node;

    const trueLevel = severityToLevel(constraint.severity);
    const estimateConf = clamp(
      // Collection investment improves confidence; sustained deception erodes it (×0.06/turn)
      node.estimate.confidence + industryGain - nextMechanics.s2.deceptionRisk * 0.06,
      0, 100,
    );
    const estimateVisibility = industryVisibilityFor(estimateConf);
    // Under RUMORED visibility with elevated deception risk, adversary manipulation makes constraints look less severe.
    // Implements the "half-truth" deception model (Estornell et al., 2019): attacker achieves effect by
    // concealing disruption rather than falsifying data.
    const estimatedLevel = (estimateVisibility === "RUMORED" && nextMechanics.s2.deceptionRisk > 50)
      ? Math.min(2, trueLevel + 1) as 0 | 1 | 2
      : trueLevel;
    // Progress represents how far above the disruption threshold current severity sits (higher = healthier)
    const progress = round(clamp(100 - constraint.severity, 0, 100));

    return {
      id: node.id,
      level: trueLevel,
      progress,
      estimate: {
        estimatedLevel,
        confidence: round(estimateConf),
        visibility: estimateVisibility,
        lastVerifiedTurn: industryGain > 0 ? previousState.turn : node.estimate.lastVerifiedTurn,
      },
    };
  });
}

/**
 * Maps a numerical S2 confidence score to the visibility classification used in staff readouts.
 *
 * The higher threshold (72 for KNOWN vs 65 for `industryVisibilityFor`) reflects that direct
 * adversary order-of-battle estimates require more corroboration than commercial market
 * assessments. This asymmetry mirrors NATO INTREP standards where KNOWN requires independent
 * corroboration from a second source (e.g. SIGINT confirming HUMINT).
 */
function visibilityFor(confidence: number): StaffMechanicsState["s2"]["visibility"] {
  if (confidence >= 72) return "KNOWN";
  if (confidence >= 40) return "ESTIMATED";
  return "RUMORED";
}

/**
 * Computes the next S1–S5 mechanics state from player decisions, staff burden, and events.
 *
 * This is the principal simulation function. Every coefficient and threshold below is
 * derived from or calibrated against military doctrine and academic research. See the
 * file-level JSDoc for full bibliography.
 *
 * ## S1 — Personnel (Recovery Debt)
 * Models the aggregate institutional cost of sustained operational tempo, expressed as
 * accumulated debt against the personnel system's recovery capacity.
 *
 * Empirical basis:
 * - DoD (2021) policy establishes a 1:3 deploy-to-dwell ratio for active-duty personnel;
 *   the 1:2 previous standard was deemed insufficient to prevent health and retention
 *   degradation. The naturalDecay term (−2 when debt < 30 and no tempo) represents the
 *   system operating inside its recovery envelope.
 * - Berndtsson & Österberg (2022) find that dwell periods below six months correlate with
 *   significantly elevated mental health referrals and suicide ideation — modelled here as
 *   the `retentionPressure` compounding term (+4 when debt > 65).
 * - MacGregor et al. (2012) establish that PTSD incidence and retention intent decline
 *   nonlinearly once recovery windows are repeatedly compressed. The 65-point threshold
 *   for compounding captures this nonlinearity.
 *
 * ## S2 — Intelligence (Estimate Confidence / Deception Risk)
 * Models the headquarters' ability to form reliable estimates of adversary intentions and
 * industry capacity, subject to adversary denial-and-deception.
 *
 * Empirical basis:
 * - Heuer (1999) identifies mirror imaging (projecting own decision calculus onto adversary)
 *   as the most common source of intelligence failure. The confidence decay under high
 *   deception risk (×0.03/turn) models the gradual erosion of analytic confidence when
 *   collection is being systematically contested.
 * - Wohlstetter (1962) demonstrates that even large volumes of raw signals do not protect
 *   against failure when analysts hold strong prior beliefs. High collection gain alone
 *   cannot overcome deception; only explicit counter-deception investment breaks the cycle.
 * - Tetlock & Gardner (2015): overconfident estimates are worse than acknowledged uncertainty.
 *   The `dangerousPrecisionPenalty` (−6 when confidence > 65 and deception > 55) models
 *   the epistemic hazard of high-apparent-confidence under active deception — the picture
 *   looks clear precisely because the adversary is managing what the collector sees.
 *
 * ## S3 — Operations (Visible vs. Executable Posture)
 * Models the gap between the posture an adversary can observe and the posture the
 * headquarters can actually execute, and how that gap affects deterrence credibility.
 *
 * Empirical basis:
 * - Schelling (1966) establishes that visible forward deployments create commitment
 *   through "tripwire" logic — physical presence forces the adversary to understand that
 *   an attack engages the force automatically. Exercises (+8) and forward deployments (+6)
 *   are the strongest visible-posture drivers, matching Schelling's hierarchy of
 *   demonstrative actions.
 * - Jervis (1978) shows that observable posture matters for signalling only when offensive
 *   and defensive postures are distinguishable. The gap formula (visible − executable > 15
 *   triggers coherence and after-action warnings) captures the credibility collapse when
 *   an observable force posture cannot actually be executed.
 * - Fearon (1997) on costly signals: mobilisation and exercises are credible precisely
 *   because they are expensive. The `tempoPressure` connection between exercises and S1
 *   debt ensures the model preserves this cost structure.
 * - Powell (1990): credibility is political; all four inputs (visible, executable,
 *   sustainment, intelligence) must be simultaneously credible. Hence:
 *     credibleDeterrence = min(visible, executable, sustainmentSupport, estimateConfidence)
 *   The weakest link determines the ceiling; improving only one input has diminishing returns
 *   until the other three are also brought up.
 *
 * ## S4 — Logistics (Stockpile / Lift Burn / Supportable Tempo)
 * Models the physical logistics system as a series of interconnected capacity constraints
 * where the weakest determines the achievable operational tempo.
 *
 * Empirical basis:
 * - Goldratt & Cox (1984) Theory of Constraints: total system throughput equals the
 *   throughput of the bottleneck. `supportableTempo = min(lift, fuel, munitions, depot_capacity) − liftBurn`
 *   directly implements this principle.
 * - Hellberg & Lundmark (2025) document that European defence supply chains failed not
 *   because of aggregate capacity shortfalls but because of discrete bottlenecks in
 *   propellant powder, electronics, and skilled labour. The three industry node penalties
 *   map directly: propellant −6 stockpile (production rate of explosive fill), electronics
 *   −4 stockpile (guided-munition components), shipping +5 liftBurn (movement cost).
 * - Ruokonen (2024) reports Ukraine requiring 20 000 shells/day but receiving as few as
 *   2 000 — a 10× gap driven by industrial-base constraints, not aggregate Western GDP.
 *   This calibrates the magnitude: a disrupted propellant market should measurably but not
 *   catastrophically constrain stockpile depth in a single turn.
 * - ADP 4-0 (2017) classifies sustainment by supply class; the four-factor min() formula
 *   matches the doctrine-standard view that operational reach is limited by the first
 *   supply class to run out.
 *
 * ## S5 — Plans (Strategic Coherence / Doctrine Alignment)
 * Models the degree to which the campaign's sequence of decisions forms a recognisably
 * coherent strategy rather than a series of tactical responses.
 *
 * Empirical basis:
 * - Lissner (2018) defines grand strategy as the coherent alignment of ends, ways, and means
 *   over time. "Strategic drift" (tactical transactionalism) is precisely what `contradictionPenalty`
 *   captures: individual decisions that are locally rational but globally incoherent.
 * - Fearon (1994) audience costs: broken public commitments carry political costs precisely
 *   because adversaries and allies revise their beliefs about the state's future resolve.
 *   The S5 coherence penalty from broken commitments models these reputation effects.
 * - Posen (1984) on doctrine: organisations develop doctrine through competitive processes
 *   that resist ad-hoc departures. `ad-hoc` (−7) and `hollow` (−5) tag penalties model the
 *   institutional cost of doctrine departure.
 * - S2→S5 link: deception risk > 60 penalises coherence (−4) because a strategy built on
 *   an unreliable picture is internally inconsistent — the plan assumes a world that may
 *   not exist. Lowenthal's "mirror imaging" syndrome is the pathological extreme.
 */
function updateStaffMechanics(
  previousState: CampaignState,
  selectedOptions: MemoOption[],
  burdens: DirectorateBurden[],
  events: EventDefinition[],
  nextConstraints: ExternalConstraintState[] = [],
): StaffMechanicsState {
  const tags = new Set(selectedOptions.flatMap((option) => option.tags));
  const burdenById = new Map(burdens.map((entry) => [entry.directorate, entry]));
  const people = burdenById.get("people")?.executionPenalty ?? 0;
  const intel = burdenById.get("intelligence")?.confidencePenalty ?? 0;
  const operations = burdenById.get("operations")?.executionPenalty ?? 0;
  const sustainment = burdenById.get("sustainment")?.executionPenalty ?? 0;
  const plans = burdenById.get("plans")?.confidencePenalty ?? 0;
  const training = burdenById.get("training")?.executionPenalty ?? 0;
  // Each triggered event adds 3 pressure points across all mechanics (≈ equivalent to moderate directorate overload)
  const eventPressure = events.length * 3;
  const mechanics = previousState.staffMechanics;

  // S4 industry penalties: disrupted external nodes degrade stockpile depth and lift burn
  const constraintById = new Map(nextConstraints.map((c) => [c.id, c]));
  const propellantDisrupted = (constraintById.get("propellant-market")?.severity ?? 0) >= 65;
  const electronicsDisrupted = (constraintById.get("electronics-chain")?.severity ?? 0) >= 65;
  const shippingDisrupted = (constraintById.get("shipping-market")?.severity ?? 0) >= 65;

  // ── S1: Recovery Debt ────────────────────────────────────────────────────────────────────
  const recoveryRelief =
    (tags.has("recovery") ? 6 : 0) +   // dedicated recovery / rest-and-recuperation programme
    (tags.has("retention") ? 4 : 0) +   // retention incentives reduce voluntary separation pressure
    (tags.has("training") && !tags.has("tempo-spike") ? 2 : 0); // steady-state training rebuilds unit cohesion
  const tempoPressure = tags.has("tempo-spike") ? 9 : tags.has("exercise") ? 5 : 0;
  // Natural decay (−2) only when debt is well inside the safe zone and no new pressure.
  // Calibrated so a force at sustainable tempo (debt < 30) recovers within ≈15 turns
  // of relief operations — consistent with DoD 1:3 ratio requiring 3 months recovery
  // per month deployed (Berndtsson & Österberg 2022; DoD 2021 policy memo).
  const naturalDecay = mechanics.s1.recoveryDebt < 30 && tempoPressure === 0 && eventPressure === 0 ? 2 : 0;
  // Nonlinear compounding: when debt exceeds 65, retention crisis compounds new departures
  // (MacGregor et al. 2012 — PTSD incidence and exit intent rise sharply beyond this threshold)
  const retentionPressure = mechanics.s1.recoveryDebt > 65 ? 4 : 0;
  const recoveryDebt = clamp(
    // people×0.45: moderate staff burden translates to ~half a point per unit burden per turn
    mechanics.s1.recoveryDebt + people * 0.45 + tempoPressure + eventPressure + retentionPressure - recoveryRelief - naturalDecay,
    0,
    100,
  );
  const reservePredictability = clamp(
    // Recovery investment at 70 % efficiency (0.7×relief); tempo rapidly erodes predictability (0.6×tempo)
    mechanics.s1.reservePredictability + recoveryRelief * 0.7 - tempoPressure * 0.6 - people * 0.35,
    0,
    100,
  );

  // ── S2: Deception Risk / Estimate Confidence ─────────────────────────────────────────────
  const collectionGain =
    (tags.has("collection") ? 5 : 0) +        // general HUMINT / OSINT investment
    (tags.has("warning") ? 4 : 0) +            // dedicated early-warning collection
    (tags.has("industrial-watch") ? 6 : 0) +   // industrial attaché / commercial intelligence
    (tags.has("counter-deception") ? 4 : 0);   // structured red-team analysis reduces susceptibility
  const deceptionRisk = clamp(
    // Ambient deception pressure grows at ×0.03 of state.deceptionPressure per turn;
    // counter-deception investment (−8) breaks through active D&D programmes.
    // Collection investment decays risk at 0.2 per unit gained (Heuer 1999: structured
    // analysis impedes adversary D&D by generating competing hypotheses).
    mechanics.s2.deceptionRisk + previousState.strategic.intelligence.deceptionPressure * 0.03 + eventPressure - (tags.has("counter-deception") ? 8 : 0) - collectionGain * 0.2,
    0,
    100,
  );
  const baseConfidence = clamp(
    // Intelligence directorate overload (intel penalty) degrades confidence at ×0.4 —
    // analytical capacity loss is the primary mechanism (Heuer 1999).
    // Ambient deception risk erodes confidence slowly (×0.03/turn) even without active D&D.
    mechanics.s2.externalEstimateConfidence + collectionGain - intel * 0.4 - deceptionRisk * 0.03,
    0,
    100,
  );
  // Dangerous precision: high-apparent-confidence under active deception is an epistemic hazard.
  // A picture that "looks clear" when adversary D&D is active means the adversary is managing
  // what the collection system sees — analogous to the pre-Pearl Harbor overconfidence
  // documented by Wohlstetter (1962) and the Iraq WMD analytical failure (Tetlock 2015).
  const dangerousPrecisionPenalty = baseConfidence > 65 && deceptionRisk > 55 ? 6 : 0;
  const externalEstimateConfidence = clamp(baseConfidence - dangerousPrecisionPenalty, 0, 100);

  // ── S3: Visible / Executable Posture ─────────────────────────────────────────────────────
  const visiblePosture = clamp(
    mechanics.s3.visiblePosture +
      (tags.has("deterrence") ? 7 : 0) +      // declaratory policy and public commitment (Schelling 1966: words as commitments)
      (tags.has("exercise") ? 8 : 0) +         // exercises are the most visible credible signal (Fearon 1997: costly sinking cost)
      (tags.has("forward-posture") ? 6 : 0) -  // forward deployment creates Schelling-style tripwire commitment
      (tags.has("quiet") || tags.has("slow-burn") ? 4 : 0), // deliberate restraint reduces observable threat level
    0,
    100,
  );
  const executablePosture = clamp(
    mechanics.s3.executablePosture +
      // Training throughput improves execution capacity at 3 % per unit —
      // reflects doctrine-standards ratio of trained-to-deployable units (FM 7-0)
      previousState.strategic.forceGeneration.trainingThroughput * 0.03 +
      // Lift availability provides the enabling infrastructure for executable posture
      previousState.strategic.sustainment.liftAvailability * 0.02 -
      // Operations directorate overload degrades execution planning quality (×0.35)
      operations * 0.35 -
      // Training overload prevents readiness generation even if direction is correct (×0.45 — strongest penalty)
      training * 0.45 -
      sustainment * 0.25 +
      // Standardisation improves interoperability — Jervis (1978): observable alliance
      // standardisation is a credible signal of defensive intent
      (tags.has("standardization") ? 5 : 0),
    0,
    100,
  );
  // ── S4: Stockpile / Lift Burn / Supportable Tempo ────────────────────────────────────────
  const stockpileDepth = clamp(
    mechanics.s4.stockpileDepth +
      (tags.has("munitions") ? 8 : 0) +  // direct munitions procurement
      (tags.has("repair") ? 3 : 0) +     // parts procurement and depot repair extends effective stockpile
      // Ambient munitions sufficiency provides partial regeneration through normal supply
      previousState.strategic.sustainment.munitionsSufficiency * 0.03 -
      // Visible posture exercises consume stockpile (×0.04 of visible): exercises expend
      // ammunition and increase war-reserve draw-down — calibrated to Ukraine lesson that
      // 1 week of high-intensity exercises ≈ 1–2 % of reserve stockpile (Ruokonen 2024)
      visiblePosture * 0.04 -
      sustainment * 0.25 -
      // Propellant disruption: explosives/propellant chain bottleneck reduces munitions
      // production rate by ~6 pts/turn (Hellberg & Lundmark 2025: propellant as binding bottleneck)
      (propellantDisrupted ? 6 : 0) -
      // Electronics disruption: precision-guided munitions require chip sets; disruption
      // degrades guided-munition regeneration rate by ~4 pts/turn
      (electronicsDisrupted ? 4 : 0),
    0,
    100,
  );
  const liftBurn = clamp(
    mechanics.s4.liftBurn +
      (tags.has("lift") ? 4 : 0) +            // new lift investment builds throughput pressure
      (tags.has("exercise") ? 8 : 0) +         // large exercises are the primary lift consumers
      (tags.has("forward-posture") ? 6 : 0) +  // sustained forward posture requires continuous resupply
      // Sustainment directorate overload burns lift capacity maintaining existing commitments (×0.3)
      sustainment * 0.3 -
      // Higher lift availability reduces burn through better routing / spare capacity (×0.04)
      previousState.strategic.sustainment.liftAvailability * 0.04 +
      // Shipping disruption increases movement costs — analogous to Red Sea / Suez shipping
      // disruptions increasing container transit times and costs (Hellberg & Lundmark 2025)
      (shippingDisrupted ? 5 : 0),
    0,
    100,
  );

  // credibleDeterrence = min(visible, executable, sustainmentSupport, estimateConfidence)
  // Implements Powell (1990): deterrence credibility cannot exceed its weakest component.
  // All four inputs must be simultaneously credible; improving one beyond the minimum
  // has no effect until the binding constraint is addressed (Goldratt & Cox 1984: ToC).
  const sustainmentSupport = (stockpileDepth + (100 - liftBurn)) / 2;
  const credibleDeterrence = clamp(
    Math.min(visiblePosture, executablePosture, sustainmentSupport, externalEstimateConfidence),
    0,
    100,
  );

  // supportableTempo = min(liftAvailability, fuel, munitions, depotCapacity) − liftBurn
  // Direct implementation of Goldratt's Theory of Constraints (1984):
  // operational tempo is limited by the most constrained supply class (ADP 4-0).
  const s = previousState.strategic.sustainment;
  const sustainableCapacity = Math.min(s.liftAvailability, s.fuelSufficiency, s.munitionsSufficiency, 100 - s.depotBacklog);
  const supportableTempo = clamp(sustainableCapacity - liftBurn, 0, 100);

  // ── S5: Strategic Coherence / Doctrine Alignment ─────────────────────────────────────────
  const coherenceGain =
    (tags.has("alliance") ? 4 : 0) +       // alliance investment signals enduring commitment (Fearon 1994: audience costs)
    (tags.has("modernization") ? 4 : 0) +  // modernisation demonstrates coherent long-term intent (Lissner 2018)
    (tags.has("program") ? 3 : 0) +        // capability programme progress confirms ends-ways-means alignment
    (tags.has("quiet") ? 2 : 0);           // deliberate restraint can signal credible non-escalation

  // S2→S5 link: a strategy built on a picture that is actively contested by adversary deception
  // is internally inconsistent — the ends-ways-means chain assumes facts that may not obtain.
  // Lowenthal's "mirror imaging" syndrome at its extreme: planning coherently for a world
  // the adversary has been deliberately constructing in the analyst's mind.
  const deceptionCoherencePenalty = mechanics.s2.deceptionRisk > 60 ? 4 : 0;

  // Contradiction penalties: when operational state contradicts declared strategy, coherence
  // erodes because leaders must choose between maintaining the claim or adjusting behaviour.
  // Fearon (1994): audience costs accrue when leaders back down from visible commitments —
  // each contradiction represents a commitment the strategy implicitly breaks.
  const contradictionPenalty =
    (visiblePosture > executablePosture + 15 ? 6 : 0) + // posture bluff (Jervis 1978: unverified deterrence claim)
    (liftBurn > stockpileDepth + 15 ? 5 : 0) +          // logistics over-commitment (Hellberg & Lundmark 2025)
    (recoveryDebt > reservePredictability + 15 ? 5 : 0) + // personnel overstretch (Berndtsson & Österberg 2022)
    deceptionCoherencePenalty;
  // Extra coherence penalty when selected options have explicit contradictionTags
  const contradictionTagPenalty = selectedOptions.reduce((sum, option) => sum + option.contradictionTags.length * 2, 0);
  const strategicCoherence = clamp(
    // Plans directorate overload erodes the headquarters' ability to maintain coherent direction (×0.35)
    // Political alignment contributes positively (×0.02): allied political support widens the
    // feasible strategy space and reduces constraint from partner management.
    mechanics.s5.strategicCoherence + coherenceGain - plans * 0.35 - contradictionPenalty - contradictionTagPenalty * 0.5 + previousState.strategic.alliance.politicalAlignment * 0.02,
    0,
    100,
  );
  const doctrineAlignment = clamp(
    mechanics.s5.doctrineAlignment +
      // Ad-hoc operations (−7) and hollow force posture (−5) are the primary doctrine-alignment
      // destroyers — Posen (1984) identifies both as pathologies of under-institutionalised militaries
      (tags.has("ad-hoc") ? -7 : 0) +
      (tags.has("hollow") ? -5 : 0) +
      (tags.has("standardization") ? 4 : 0) +  // NATO/joint standardisation improves doctrinal coherence
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

/**
 * Doctrine Mechanics (Phase 1 of the faction-gene roadmap; issue #55)
 *
 * Implements the CELERY pattern-to-mechanic map from
 * POTATO/doctrine-mechanics-roadmap.md. Doctrine variables never rewrite S1-S5 formulas
 * directly — this is a read-only layer computed from the already-resolved S1-S5 state and
 * this turn's decisions, applied back onto strategic/resource state only through small,
 * bounded counterweight deltas. That keeps the S1-S5 core (and its existing test suite)
 * untouched, which matters because faction genes (issue #56) bias these same
 * variables through the faction anchor without needing to know anything about S1-S5
 * internals.
 *
 * Every benefit needs a counterweight (roadmap "Player-Facing Rules"). Four gates carry
 * concrete strategic-state counterweights, matching the issue #55 acceptance criteria:
 * tempo, main effort, reserve, and culmination. The remaining ten variables are computed
 * from their documented gate inputs and reported in after-action notes when their failure
 * condition matures, without mutating strategic state directly — full faction-scale
 * counterweights for all fourteen arrive with the gene system in issues #56-59.
 *
 * Doctrine sources:
 * - Clausewitz, C. von (1832). *On War*, Book 7, Ch. 22. "Culminating point of the attack" —
 *   an offensive that outruns its logistics and cohesion collapses past a threshold rather
 *   than degrading gracefully.
 * - Boyd, J. (1976). "Destruction and Creation" (unpublished briefing). Main-effort
 *   concentration vs. economy-of-force distribution as a command-attention allocation problem.
 * - Liddell Hart, B.H. (1954). *Strategy*. Faber. The indirect approach: dislocation before
 *   destruction; maneuver credibility depends on the picture the adversary is denied.
 * - USMC (1997). *Warfighting* (MCDP 1). Simplicity, mission command, and commander's intent
 *   as force multipliers under uncertainty and compressed decision cycles; reserves as the
 *   commander's only means of influencing a fight not yet fought.
 */
// "deterrence"+"quiet" is deliberately NOT listed here: a measured operational posture paired
// with quiet, private ally reassurance is coherent restraint, not doctrinal incoherence — and
// both tags co-occur in this scenario's own "balanced" baseline turn (measured-deterrence +
// quiet-reassurance), so flagging that pairing pinned campaignAimClarity at 0 within ~7 turns
// of ordinary play. Only list pairs that are genuinely incompatible on their face.
const CONTRADICTORY_TAG_PAIRS: Array<[string, string]> = [
  ["ad-hoc", "program"],
  ["quiet", "public-commitment"],
  ["hollow", "standardization"],
];

/** Pulls a persisted doctrine variable toward a target equilibrium when no explicit signal fires this turn. The target is usually the faction anchor (the scenario's profile-applied baseline) or a tag-derived equilibrium — not necessarily the hard-coded neutral. */
function pullToNeutral(current: number, neutral: number, magnitude: number) {
  if (current === neutral) return 0;
  return Math.sign(neutral - current) * Math.min(magnitude, Math.abs(neutral - current));
}

/**
 * An event counts as a "crisis" for the reserve gate when its own stateDelta directionally
 * hurts core readiness/legitimacy metrics. This is what the reserve doctrine test idea means
 * by "reserve held during a crisis reduces event penalty" — the dampening below only fires
 * against a genuine shock, not against any event regardless of whether it helped or hurt.
 */
function isCrisisEvent(event: EventDefinition): boolean {
  const delta = event.stateDelta;
  return (
    (delta.domestic?.cabinetCover ?? 0) < 0 ||
    (delta.domestic?.mediaHeat ?? 0) > 0 ||
    (delta.escalation?.incidentLadder ?? 0) > 0 ||
    (delta.forceGeneration?.reserveStrain ?? 0) > 0 ||
    (delta.sustainment?.liftAvailability ?? 0) < 0
  );
}

type DoctrineNote = { heading: string; detail: string };

// Doctrine 3 (issue #57): after-action notes for burden-routing attention. Pure and
// deterministic — iterates directorateBurden in directorateSchema order, no RNG.
// Override matching is PER STAFF FUNCTION (not the global length check the
// "unacknowledged risk" note uses), which is what makes the dissent note complementary
// to that aggregate note rather than a duplicate. Branch reachability:
//   - Interactive UI / headless autoAcceptRisks: the 428 gate / policy always fills
//     overrides, so the accepted-risk variant fires and chief-position dissent is
//     visible pre-commit in the preview (underpricedDissent lean).
//   - Direct sim calls with no overrides: the dissent variant fires alongside the
//     existing "Doctrine: unacknowledged risk" aggregate note.
function resolveBurdenDissent(
  directorateBurden: DirectorateBurden[],
  burdenBias: BurdenBias,
  acceptedRiskOverrides: AcceptedRiskOverride[],
  staffFunctionDefinitions: StaffFunctionDefinition[],
): DoctrineNote[] {
  const notes: DoctrineNote[] = [];

  // Underpriced lanes that went strained/overloaded: dissent (no override for the
  // lane's staff function) or explicit accepted risk (override present).
  for (const entry of directorateBurden) {
    if (!burdenBias.underpricedLanes.includes(entry.directorate)) continue;
    if (entry.burdenLevel === "light") continue;
    const staffFunction = staffFunctionForDirectorate(staffFunctionDefinitions, entry.directorate);
    // Acceptance must be tied to the underpriced warning ITSELF, not just the staff
    // function: Operations and Training share S3, so an override for an unrelated S3
    // warning (e.g. a risk-band warning) must NOT count as accepting this lane's
    // underpriced warning (Codex P2, PR #77).
    const hasOverride = acceptedRiskOverrides.some(
      (override) =>
        override.staffFunctionId === staffFunction.id &&
        override.warningText.endsWith(underpricedLaneWarningSuffix),
    );
    if (hasOverride) {
      notes.push({
        heading: "Doctrine: accepted risk in an underpriced lane",
        detail: `You explicitly accepted the risk in ${directorateLabel(entry.directorate)}, a lane the staff normally underprices.`,
      });
    } else {
      notes.push({
        heading: "Doctrine: underpriced-lane dissent",
        detail: `The staff underprices ${directorateLabel(entry.directorate)}; it went under-resourced this month and surfaced as staff dissent rather than a clean warning.`,
      });
    }
  }

  // Neglected priority lane: a priority lane left light while >=1 NON-priority lane
  // overloads (a priority lane left light while another priority lane overloads is a
  // different story and would over-fire). Labels reflect post-negotiation burden.
  const priorityLaneLight = directorateBurden.filter(
    (entry) => burdenBias.priorityLanes.includes(entry.directorate) && entry.burdenLevel === "light",
  );
  const nonPriorityOverloaded = directorateBurden.filter(
    (entry) => !burdenBias.priorityLanes.includes(entry.directorate) && entry.burdenLevel === "overloaded",
  );
  if (priorityLaneLight.length > 0 && nonPriorityOverloaded.length > 0) {
    notes.push({
      heading: "Doctrine: neglected priority lane",
      detail: `The staff's natural priority (${priorityLaneLight.map((entry) => directorateLabel(entry.directorate)).join(", ")}) was left light while ${nonPriorityOverloaded.map((entry) => directorateLabel(entry.directorate)).join(", ")} ran overloaded.`,
    });
  }

  return notes;
}

type DoctrineResolution = {
  doctrineMechanics: DoctrineMechanicsState;
  strategic: StrategicState;
  resources: CampaignState["resources"];
  notes: DoctrineNote[];
};

type DoctrineResolutionInput = {
  previousState: CampaignState;
  doctrineAnchor: DoctrineMechanicsState;
  selectedOptions: MemoOption[];
  directorateBurden: DirectorateBurden[];
  nextStaffMechanics: StaffMechanicsState;
  strategic: StrategicState;
  resources: CampaignState["resources"];
  triggeredEvents: EventDefinition[];
  chiefs: ScenarioDefinition["chiefs"];
  previousChiefTrust: Record<string, number>;
  acceptedRiskOverrides: AcceptedRiskOverride[];
  commanderIntent?: CommanderIntent;
  /** Doctrine 5: staff-module/coordination totals for orderClarity, staffSynchronization, and systemPressure, added inside their base formulas before clamp/round and consequence checks. */
  moduleDoctrineOffsets?: Partial<Record<ModuleEffectLane, number>>;
};

function resolveDoctrineMechanics({
  previousState,
  doctrineAnchor,
  selectedOptions,
  directorateBurden,
  nextStaffMechanics,
  strategic: strategicIn,
  resources: resourcesIn,
  triggeredEvents,
  chiefs,
  previousChiefTrust,
  acceptedRiskOverrides,
  commanderIntent,
  moduleDoctrineOffsets = {},
}: DoctrineResolutionInput): DoctrineResolution {
  const tags = new Set(selectedOptions.flatMap((option) => option.tags));
  const prev = previousState.doctrineMechanics;
  // Faction anchor: the scenario's opening doctrine baseline (the profile-applied
  // position serialized in scenario.initialState). Pull targets below derive from it,
  // and recomputed variables receive its offset vs the neutral default, so a
  // scenario's doctrine genes produce a DURABLE bias instead of being erased by
  // hard-coded neutral anchors within a turn or two. For a profile whose genes net to
  // zero, the anchor equals the neutral default and every offset is 0 — behavior is
  // unchanged. orderClarity's equilibrium shifts via the offset on its complexity
  // term; culminationRisk is intentionally signal-driven (staff condition), so
  // doctrine modifiers on it are transient by design.
  const factionOffset: Partial<Record<keyof DoctrineMechanicsState, number>> = {};
  for (const key of Object.keys(defaultDoctrineMechanicsState) as Array<keyof DoctrineMechanicsState>) {
    factionOffset[key] = doctrineAnchor[key] - defaultDoctrineMechanicsState[key];
  }
  const notes: DoctrineNote[] = [];
  let strategic = strategicIn;
  let resources = resourcesIn;

  // ── Objective: campaignAimClarity ────────────────────────────────────────────────────────
  // Gate: S5 coherence and memo-tag consistency. Failure event: contradiction debt.
  const contradictingPairs = CONTRADICTORY_TAG_PAIRS.filter(([a, b]) => tags.has(a) && tags.has(b)).length;
  // Both non-contradiction branches use pullToNeutral (unlike a flat increment) so this
  // variable settles at a bounded equilibrium under sustained play instead of ratcheting to an
  // extreme: coherent play drifts toward a healthy-but-not-maxed target (neutral 55 + 15,
  // shifted by the faction anchor), everything else drifts back toward the faction's baseline
  // (the profile-applied opening value). Every other persisted doctrine variable in this
  // function already follows this pattern; campaignAimClarity previously didn't, which combined
  // with a contradiction pair that could re-fire every turn to pin it at 0 permanently.
  const aimSignal =
    contradictingPairs > 0
      ? -8 * contradictingPairs
      : nextStaffMechanics.s5.strategicCoherence > 55
        ? pullToNeutral(prev.campaignAimClarity, clamp(doctrineAnchor.campaignAimClarity + 15, 0, 100), 3)
        : pullToNeutral(prev.campaignAimClarity, doctrineAnchor.campaignAimClarity, 3);
  const campaignAimClarity = clamp(prev.campaignAimClarity + aimSignal, 0, 100);
  if (contradictingPairs > 0 && campaignAimClarity < 45) {
    notes.push({
      heading: "Doctrine: contradiction debt",
      detail: `This month's selections pulled in opposite directions (${contradictingPairs} contradicting tag pair${contradictingPairs > 1 ? "s" : ""} across the memos you chose). Campaign aim clarity fell to ${round(campaignAimClarity)}.`,
    });
  }

  // ── Tempo: relativeTempo (REQUIRED gate) ─────────────────────────────────────────────────
  // Gate: S1 recovery debt, S2 estimate confidence, S4 supportable tempo. Failure: early culmination.
  const tempoSignal = tags.has("tempo-spike")
    ? 22
    : tags.has("exercise")
      ? 13
      : tags.has("quiet") || tags.has("slow-burn")
        ? -14
        : pullToNeutral(prev.relativeTempo, doctrineAnchor.relativeTempo, 4);
  const relativeTempo = clamp(prev.relativeTempo + tempoSignal, 0, 100);
  const tempoSupported =
    nextStaffMechanics.s1.recoveryDebt < 62 &&
    nextStaffMechanics.s2.externalEstimateConfidence > 42 &&
    nextStaffMechanics.s4.supportableTempo > 15;
  const tempoOverreach = relativeTempo > 65 && !tempoSupported;
  const tempoPaidOff = relativeTempo > 65 && tempoSupported;
  if (tempoOverreach) {
    strategic = {
      ...strategic,
      forceGeneration: { ...strategic.forceGeneration, deployableUnits: clamp(strategic.forceGeneration.deployableUnits - 0.4, 2, 12) },
      escalation: { ...strategic.escalation, incidentLadder: clamp(strategic.escalation.incidentLadder + 3, 0, 100) },
    };
    notes.push({
      heading: "Doctrine bet: tempo",
      detail: `Tempo (${round(relativeTempo)}) outran what S1 debt, S2 confidence, and S4 supportable tempo could carry this month. The push culminated early — deployable strength and the incident ladder both paid for it.`,
    });
  } else if (tempoPaidOff) {
    // No same-turn tax on this branch: the counterweight is the precondition itself. Reaching
    // it required S1 debt, S2 confidence, and S4 supportable tempo to already be healthy —
    // capacity that could otherwise have gone toward a different bet. See tempoOverreach above
    // for the paired cost this same lever pays when the precondition isn't met.
    strategic = {
      ...strategic,
      forceGeneration: { ...strategic.forceGeneration, deployableUnits: clamp(strategic.forceGeneration.deployableUnits + 0.15, 2, 12) },
    };
    notes.push({
      heading: "Doctrine bet: tempo",
      detail: `High tempo (${round(relativeTempo)}) was genuinely supportable this month — S1 debt, S2 confidence, and S4 supportable tempo all held. The bet paid off in a small extra readiness gain.`,
    });
  }

  // ── Main effort: mainEffortFocus (REQUIRED gate) ─────────────────────────────────────────
  // Gate: declared priority (burden concentration) and support allocation across the rest
  // of the staff. Failure event: neglected-lane failure.
  const burdenByDirectorate = new Map<DirectorateId, number>();
  for (const option of selectedOptions) {
    for (const contribution of option.burden) {
      burdenByDirectorate.set(contribution.directorate, (burdenByDirectorate.get(contribution.directorate) ?? 0) + contribution.points);
    }
  }
  const totalBurdenPoints = [...burdenByDirectorate.values()].reduce((sum, value) => sum + value, 0);
  const maxDirectoratePoints = burdenByDirectorate.size > 0 ? Math.max(...burdenByDirectorate.values()) : 0;
  const declaredMainEffortPoints = commanderIntent
    ? burdenByDirectorate.get(commanderIntent.mainEffort) ?? 0
    : maxDirectoratePoints;
  const mainEffortFocus =
    totalBurdenPoints > 0
      ? clamp(round((100 * declaredMainEffortPoints) / totalBurdenPoints) + (factionOffset.mainEffortFocus ?? 0), 0, 100)
      : clamp(defaultDoctrineMechanicsState.mainEffortFocus + (factionOffset.mainEffortFocus ?? 0), 0, 100);
  const mainEffortDirectorate = commanderIntent?.mainEffort
    ?? [...burdenByDirectorate.entries()].find(([, points]) => points === maxDirectoratePoints)?.[0];
  const neglectedLanes = directorateBurden.filter((entry) => entry.directorate !== mainEffortDirectorate && entry.burdenLevel === "overloaded");
  // Threshold calibrated to this scenario's content: every memo option spreads points across
  // 2-4 directorates by design, so a perfectly even 6-lane split sits near 17% and the
  // maximum concentration any real 5-memo turn can reach is ~41%. >35 requires genuinely
  // favoring one lane over the others, not just an artifact of how burden happens to fall.
  const mainEffortConcentrated = mainEffortFocus > 35 && totalBurdenPoints > 0;
  if (commanderIntent && !mainEffortConcentrated) {
    notes.push({
      heading: "Command intent: dispersed effort",
      detail: `You named ${directorateLabel(commanderIntent.mainEffort)} as the main effort, but the packet did not concentrate enough work there to make that priority real. The declaration creates no dividend on its own.`,
    });
  }
  if (mainEffortConcentrated && neglectedLanes.length > 0 && mainEffortDirectorate) {
    resources = { ...resources, readiness: clamp(resources.readiness - Math.min(4, neglectedLanes.length * 2), 0, 100) };
    notes.push({
      heading: "Doctrine bet: main effort",
      detail: `The month concentrated on ${directorateLabel(mainEffortDirectorate)} while ${neglectedLanes.map((entry) => directorateLabel(entry.directorate)).join(", ")} went unsupported and overloaded. That neglect cost readiness.`,
    });
  } else if (mainEffortConcentrated && mainEffortDirectorate) {
    // Same principle as the tempo payoff above: the counterweight is that covering every other
    // lane while still concentrating on one required enough capacity that overload didn't
    // happen — not a same-turn tax on the dividend itself.
    resources = { ...resources, readiness: clamp(resources.readiness + 1, 0, 100) };
    notes.push({
      heading: "Doctrine bet: main effort",
      detail: `Effort concentrated on ${directorateLabel(mainEffortDirectorate)} without leaving another lane overloaded. A focused main effort with covered flanks paid a small readiness dividend.`,
    });
  }

  // ── Reserve: uncommittedCapacity (REQUIRED gate) ─────────────────────────────────────────
  // Gate: unspent staff/action capacity. Failure event (the tradeoff itself): lower
  // immediate progress. Test idea: reserve held during a crisis reduces event penalty.
  const totalCapacity = directorateBurden.reduce((sum, entry) => sum + entry.capacity, 0);
  const totalCommitted = directorateBurden.reduce((sum, entry) => sum + entry.burdenPoints, 0);
  const uncommittedCapacity =
    totalCapacity > 0
      ? clamp(round((100 * (totalCapacity - totalCommitted)) / totalCapacity) + (factionOffset.uncommittedCapacity ?? 0), 0, 100)
      : clamp(defaultDoctrineMechanicsState.uncommittedCapacity + (factionOffset.uncommittedCapacity ?? 0), 0, 100);
  // Threshold calibrated to this scenario's content: even the lightest legal 4-memo turn that
  // still reaches a genuine crisis event's trigger tags commits 14 of the staff's 20 points of
  // capacity (verified against packages/content/src/scenario.ts), landing at exactly 30%
  // uncommitted — so >25 stays reachable by a crisis-triggering turn while still requiring
  // deliberately restrained selections rather than being reachable by accident.
  const reserveHeld = uncommittedCapacity > 25;
  const crisisEvents = triggeredEvents.filter(isCrisisEvent);
  if (reserveHeld) {
    resources = { ...resources, readiness: clamp(resources.readiness - 1.5, 0, 100) };
    if (crisisEvents.length > 0) {
      resources = { ...resources, readiness: clamp(resources.readiness + 2 * crisisEvents.length, 0, 100) };
      notes.push({
        heading: "Doctrine bet: reserve",
        detail: `You held ${round(uncommittedCapacity)} points of staff capacity uncommitted going into the month. When ${crisisEvents.length === 1 ? "a crisis" : "crises"} hit, that reserve absorbed part of the blow instead of the line taking it cold — at the cost of somewhat slower immediate progress.`,
      });
    } else {
      notes.push({
        heading: "Doctrine bet: reserve",
        detail: `You held ${round(uncommittedCapacity)} points of staff capacity uncommitted. Nothing forced your hand this month, so the reserve cost you a little immediate progress without a matching payoff — yet.`,
      });
    }
  }

  // ── Economy of force: secondaryRiskAccepted ──────────────────────────────────────────────
  // Gate: explicit accepted risk. Failure: surprise from an under-resourced lane.
  const strainedLanes = directorateBurden.filter((entry) => entry.burdenLevel !== "light").length;
  const secondaryRiskAccepted =
    strainedLanes === 0
      ? clamp(defaultDoctrineMechanicsState.secondaryRiskAccepted + (factionOffset.secondaryRiskAccepted ?? 0), 0, 100)
      : clamp(round((100 * Math.min(acceptedRiskOverrides.length, strainedLanes)) / strainedLanes) + (factionOffset.secondaryRiskAccepted ?? 0), 0, 100);
  if (commanderIntent?.acceptedSecondaryRisk) {
    notes.push({
      heading: "Command intent: accepted secondary risk",
      detail: `${directorateLabel(commanderIntent.acceptedSecondaryRisk)} was deliberately left as the secondary risk. This records the trade-off; it does not remove staff warnings or their consequences.`,
    });
  }
  if (strainedLanes > 0 && acceptedRiskOverrides.length === 0) {
    notes.push({
      heading: "Doctrine: unacknowledged risk",
      detail: `${strainedLanes} staff lane${strainedLanes > 1 ? "s were" : " was"} strained or overloaded this month and none of it was explicitly accepted going in. An under-resourced lane can still surprise you even when the headline numbers look fine.`,
    });
  }

  // ── Maneuver: optionDislocation ───────────────────────────────────────────────────────────
  // Gate: S2 confidence and S4 lift/support. Failure: hollow movement or revealed posture.
  const maneuverTagsPresent = tags.has("forward-posture") || tags.has("lift") || tags.has("exercise");
  const maneuverRaw = (tags.has("forward-posture") ? 10 : 0) + (tags.has("lift") ? 6 : 0) + (tags.has("exercise") ? 4 : 0);
  // Pulls toward a target derived from the raw tag signal (faction anchor base, scaled by
  // strength) rather than adding the raw signal every turn — a flat additive delta with no
  // decay would ratchet this variable to the 100 ceiling and pin it there under any playstyle
  // that sustains the same maneuver tags turn after turn (this was a real, verified bug in a
  // sibling variable, campaignAimClarity, before it was fixed the same way).
  const maneuverSignal = maneuverTagsPresent
    ? pullToNeutral(prev.optionDislocation, clamp(doctrineAnchor.optionDislocation + maneuverRaw * 3, 0, 100), Math.max(3, maneuverRaw))
    : pullToNeutral(prev.optionDislocation, doctrineAnchor.optionDislocation, 4);
  const optionDislocation = clamp(prev.optionDislocation + maneuverSignal, 0, 100);
  const maneuverSupported = nextStaffMechanics.s2.externalEstimateConfidence > 42 && nextStaffMechanics.s4.liftBurn < 65;
  if (optionDislocation > 60 && !maneuverSupported) {
    strategic = { ...strategic, escalation: { ...strategic.escalation, crisisSensitivity: clamp(strategic.escalation.crisisSensitivity + 2, 0, 100) } };
    notes.push({
      heading: "Doctrine: maneuver revealed",
      detail: `Movement this month (${round(optionDislocation)}) outran S2 confidence and S4 lift headroom. The maneuver read as hollow or exposed rather than dislocating, and crisis sensitivity ticked up.`,
    });
  }

  // ── Deception: signatureControl ───────────────────────────────────────────────────────────
  // Gate: S2 counter-deception and S3 synchronization. Failure: exposure or self-deception.
  const signatureTagsPresent = tags.has("counter-deception") || tags.has("quiet") || tags.has("public-commitment");
  const signatureRaw = (tags.has("counter-deception") ? 8 : 0) + (tags.has("quiet") ? 4 : 0) - (tags.has("public-commitment") ? 6 : 0);
  // Same target/pull pattern as optionDislocation above, for the same reason: sustained
  // counter-deception+quiet selections (this scenario's own moderate baseline) would otherwise
  // ratchet this to a permanent 100 with no way back, verified by simulating balanced play.
  const signatureSignal = signatureTagsPresent
    ? pullToNeutral(prev.signatureControl, clamp(doctrineAnchor.signatureControl + signatureRaw * 4, 0, 100), Math.max(3, Math.abs(signatureRaw)))
    : pullToNeutral(prev.signatureControl, doctrineAnchor.signatureControl, 3);
  const signatureControl = clamp(prev.signatureControl + signatureSignal, 0, 100);
  if (signatureControl > 60 && nextStaffMechanics.s2.deceptionRisk >= 55) {
    resources = { ...resources, publicLegitimacy: clamp(resources.publicLegitimacy - 1, 0, 100) };
    notes.push({
      heading: "Doctrine: self-deception risk",
      detail: `Signature management (${round(signatureControl)}) is high, but S2 deception risk never actually came down. A confident-sounding brief may be managing your own picture, not the adversary's.`,
    });
  }

  // ── Security: exposureControl ─────────────────────────────────────────────────────────────
  // Gate: S2/S4 risk control. Failure: tempo drag.
  const exposureTagsPresent = tags.has("counter-deception") || tags.has("quiet") || tags.has("forward-posture") || tags.has("public-commitment");
  const exposureRaw = (tags.has("counter-deception") ? 4 : 0) + (tags.has("quiet") ? 5 : 0) - (tags.has("forward-posture") ? 5 : 0) - (tags.has("public-commitment") ? 4 : 0);
  // Same target/pull pattern as optionDislocation/signatureControl above, for the same reason.
  const exposureSignal = exposureTagsPresent
    ? pullToNeutral(prev.exposureControl, clamp(doctrineAnchor.exposureControl + exposureRaw * 4, 0, 100), Math.max(3, Math.abs(exposureRaw)))
    : pullToNeutral(prev.exposureControl, doctrineAnchor.exposureControl, 3);
  const exposureControl = clamp(prev.exposureControl + exposureSignal, 0, 100);
  if (exposureControl < 35 && (nextStaffMechanics.s2.externalEstimateConfidence <= 42 || nextStaffMechanics.s4.stockpileDepth <= 42)) {
    strategic = { ...strategic, forceGeneration: { ...strategic.forceGeneration, trainingThroughput: clamp(strategic.forceGeneration.trainingThroughput - 1, 0, 100) } };
    notes.push({
      heading: "Doctrine: security gap",
      detail: `Exposure control fell to ${round(exposureControl)} without S2 or S4 headroom to cover it. The drag showed up as slower training throughput.`,
    });
  }

  // ── Simplicity: orderClarity ──────────────────────────────────────────────────────────────
  // Gate: low complexity load. Failure: lower upside on multi-lane actions.
  const complexityScore = clamp(100 - Math.max(0, tags.size - 4) * 8, 0, 100);
  // The faction offset shifts the complexity term, so a doctrine gene on orderClarity
  // moves the equilibrium durably (the variable still settles at complexity + offset
  // instead of ratcheting to an extreme).
  const orderClarity = clamp(
    round(prev.orderClarity * 0.5 + (complexityScore + (factionOffset.orderClarity ?? 0)) * 0.5 + (moduleDoctrineOffsets["doctrine.orderClarity"] ?? 0)),
    0,
    100,
  );
  // Compares against previousState (the turn's true starting point), not strategicIn (which
  // already includes this turn's own option/event/burden deltas) — strategicIn only moves when
  // an earlier doctrine gate (tempo/main-effort) has already nudged deployableUnits, so using it
  // here would make this guard fire only in that narrow case instead of reflecting whether the
  // turn as a whole was actually gaining ground.
  if (orderClarity < 40 && strategic.forceGeneration.deployableUnits > previousState.strategic.forceGeneration.deployableUnits) {
    strategic = { ...strategic, forceGeneration: { ...strategic.forceGeneration, deployableUnits: clamp(strategic.forceGeneration.deployableUnits - 0.1, 2, 12) } };
    notes.push({
      heading: "Doctrine: order clarity",
      detail: `Running ${tags.size} distinct threads at once (order clarity ${round(orderClarity)}) diluted the upside of an otherwise good month.`,
    });
  }

  // ── Culmination: culminationRisk (REQUIRED gate) ─────────────────────────────────────────
  // Gate: combined S1/S4/S3 condition, sharpened by an unsupported tempo bet this same turn.
  // Failure event: hard readiness/support loss once the culminating point is crossed.
  const culminationPressure =
    (nextStaffMechanics.s1.recoveryDebt > 62 ? 6 : 0) +
    (nextStaffMechanics.s4.supportableTempo < 15 ? 8 : 0) +
    (nextStaffMechanics.s3.executablePosture < 35 ? 6 : 0) +
    (tempoOverreach ? 12 : 0);
  const culminationRelief = nextStaffMechanics.s1.recoveryDebt < 40 && nextStaffMechanics.s4.supportableTempo > 40 ? 10 : 3;
  const culminationRisk = clamp(prev.culminationRisk + culminationPressure - culminationRelief, 0, 100);
  if (culminationRisk > 72) {
    strategic = {
      ...strategic,
      forceGeneration: { ...strategic.forceGeneration, deployableUnits: clamp(strategic.forceGeneration.deployableUnits - 0.6, 2, 12) },
      sustainment: { ...strategic.sustainment, liftAvailability: clamp(strategic.sustainment.liftAvailability - 4, 0, 100) },
    };
    notes.push({
      heading: "Doctrine bet: culmination",
      detail: `S1, S3, and S4 condition crossed the culminating point this month (culmination risk ${round(culminationRisk)}). The headquarters took a hard readiness and support loss rather than a graceful slowdown.`,
    });
  }

  // ── Sustainment reach: operationalReach ───────────────────────────────────────────────────
  // Gate: S4 stock, lift, repair, and fuel support — one term per factor, averaged. Repair
  // capacity is depot throughput (inverse of depot backlog). Reads strategicIn (this turn's
  // already-resolved sustainment state), not previousState, so the gate reflects current
  // conditions rather than lagging by a turn. Failure: support ceiling.
  const operationalReach = clamp(
    round(
      (nextStaffMechanics.s4.stockpileDepth +
        (100 - nextStaffMechanics.s4.liftBurn) +
        (100 - strategicIn.sustainment.depotBacklog) +
        strategicIn.sustainment.fuelSufficiency) /
        4,
    ) + (factionOffset.operationalReach ?? 0),
    0,
    100,
  );
  // Compares against previousState, same as orderClarity above (see that comment for why
  // strategicIn is the wrong baseline). Because culmination runs between the two checks and can
  // also touch deployableUnits, a culmination hit earlier this turn can bring this comparison
  // back below previousState's value even when orderClarity's identical-shaped check passed
  // moments earlier — which is the intended behavior: if culmination already inflicted a hard
  // readiness loss this turn, the turn is no longer "ahead of where it started," so this note
  // correctly stays quiet instead of stacking a second, redundant support-ceiling narrative on
  // top of the culmination note for the same underlying capacity problem.
  if (operationalReach < 35 && strategic.forceGeneration.deployableUnits > previousState.strategic.forceGeneration.deployableUnits) {
    strategic = { ...strategic, forceGeneration: { ...strategic.forceGeneration, deployableUnits: clamp(strategic.forceGeneration.deployableUnits - 0.1, 2, 12) } };
    notes.push({
      heading: "Doctrine: support ceiling",
      detail: `Operational reach is only ${round(operationalReach)}. Further gains this month ran into a hard support ceiling rather than a soft constraint.`,
    });
  }

  // ── Staff synchronization: staffSynchronization ──────────────────────────────────────────
  // Not in the CELERY pattern table; derived from how evenly loaded the staff is this turn.
  // Low variance in burden ratios across directorates reads as a well-synchronized staff.
  const burdenRatios = directorateBurden.map((entry) => (entry.capacity > 0 ? entry.burdenPoints / entry.capacity : 0));
  const meanRatio = burdenRatios.length > 0 ? burdenRatios.reduce((sum, value) => sum + value, 0) / burdenRatios.length : 0;
  const ratioVariance = burdenRatios.length > 0 ? burdenRatios.reduce((sum, value) => sum + (value - meanRatio) ** 2, 0) / burdenRatios.length : 0;
  const staffSynchronization = clamp(
    round(100 - Math.sqrt(ratioVariance) * 90) + (factionOffset.staffSynchronization ?? 0) + (moduleDoctrineOffsets["doctrine.staffSynchronization"] ?? 0),
    0,
    100,
  );

  // ── Mission command: commanderIntentClarity ──────────────────────────────────────────────
  // Gate: trust and chief competence. Failure: handoff friction.
  // Object.hasOwn (not `?? 50`) guards against a chief id like "__proto__" resolving through
  // the prototype chain to a truthy Object.prototype instead of falling back to the default —
  // which would otherwise inject NaN into commanderIntentClarity and corrupt persisted state.
  const trustValues = chiefs.map((chief) => (Object.hasOwn(previousChiefTrust, chief.id) ? previousChiefTrust[chief.id] : 50));
  const meanTrust = trustValues.length > 0 ? trustValues.reduce((sum, value) => sum + value, 0) / trustValues.length : 50;
  const meanCompetence = chiefs.length > 0 ? (chiefs.reduce((sum, chief) => sum + chief.competence, 0) / chiefs.length) * 100 : 70;
  const commanderIntentClarity = clamp(
    round(meanTrust * 0.6 + meanCompetence * 0.4) + (factionOffset.commanderIntentClarity ?? 0),
    0,
    100,
  );
  if (commanderIntentClarity < 40) {
    resources = { ...resources, politicalCapital: clamp(resources.politicalCapital - 1, 0, 100) };
    notes.push({
      heading: "Doctrine: handoff friction",
      detail: `Commander's intent is landing poorly right now (clarity ${round(commanderIntentClarity)}) — low trust and thin competence coverage are compressing planning into friction at the handoff.`,
    });
  }

  // ── System competition: systemPressure ────────────────────────────────────────────────────
  // Gate: S2 estimate confidence (optional J6/C2 modules arrive in issue #59). Failure:
  // mis-targeting or dependency blowback.
  const systemPressure = clamp(
    round(100 - nextStaffMechanics.s2.externalEstimateConfidence + nextStaffMechanics.s2.deceptionRisk * 0.3) +
      (factionOffset.systemPressure ?? 0) +
      (moduleDoctrineOffsets["doctrine.systemPressure"] ?? 0),
    0,
    100,
  );
  if (systemPressure > 65) {
    strategic = { ...strategic, escalation: { ...strategic.escalation, incidentLadder: clamp(strategic.escalation.incidentLadder + 1, 0, 100) } };
    notes.push({
      heading: "Doctrine: system pressure",
      detail: `The contested information picture (system pressure ${round(systemPressure)}) is thin enough that mis-targeting or dependency blowback is a live risk this month.`,
    });
  }

  return {
    doctrineMechanics: {
      campaignAimClarity: round(campaignAimClarity),
      relativeTempo: round(relativeTempo),
      mainEffortFocus: round(mainEffortFocus),
      secondaryRiskAccepted: round(secondaryRiskAccepted),
      optionDislocation: round(optionDislocation),
      signatureControl: round(signatureControl),
      exposureControl: round(exposureControl),
      orderClarity: round(orderClarity),
      culminationRisk: round(culminationRisk),
      uncommittedCapacity: round(uncommittedCapacity),
      operationalReach: round(operationalReach),
      staffSynchronization: round(staffSynchronization),
      commanderIntentClarity: round(commanderIntentClarity),
      systemPressure: round(systemPressure),
    },
    strategic,
    resources,
    notes,
  };
}

/**
 * Evaluates whether the campaign has ended and computes the score.
 *
 * ## Collapse conditions (early termination)
 * Three collapse triggers model the three classic forms of strategic failure:
 * - `cabinetCover ≤ 12`: loss of domestic political authority — the government cannot
 *   sustain the campaign without cabinet support. Analogous to Fearon's (1994)
 *   audience-cost mechanism: the political audience has withdrawn consent.
 * - `incidentLadder ≥ 82`: escalation beyond manageable thresholds — the security
 *   dilemma (Jervis 1978) has spiralled past the point where either actor can
 *   de-escalate without unacceptable domestic cost.
 * - `deployableUnits ≤ 3.5`: force generation failure — too few credible brigades to
 *   maintain deterrence. Below this threshold, credible deterrence collapses even if
 *   political and industrial support remain (Powell 1990: capability floor).
 *
 * ## Scoring formula
 * Score = 30 + (deployableUnits × 5) + (politicalAlignment × 0.28) +
 *         (cabinetCover × 0.18) − (incidentLadder × 0.30) − (reserveStrain × 0.12)
 *
 * Weights reflect the relative strategic importance of each variable:
 * - deployableUnits has the largest single coefficient (×5) because credible force is the
 *   primary instrument of deterrence (Huth 1988: military balance is the first of four
 *   factors in extended deterrence success).
 * - incidentLadder carries a larger negative weight (−0.30) than reserveStrain (−0.12)
 *   because escalation risk is more immediately strategically threatening than personnel
 *   degradation, which has a longer time constant before it affects operational output.
 * - politicalAlignment (×0.28) reflects the alliance-cohesion premium: a diplomatically
 *   isolated deterrent posture is inherently less credible than one backed by coalition
 *   political will (Snyder 1984: alliance support raises perceived resolve).
 * - The 30-point floor ensures a minimum score even in failed campaigns, reflecting the
 *   real-world norm that strategic failure rarely means zero residual capacity.
 */
export function rawCampaignScore(state: CampaignState): number {
  return 30 +
    state.strategic.forceGeneration.deployableUnits * 5 +
    state.strategic.alliance.politicalAlignment * 0.28 +
    state.strategic.domestic.cabinetCover * 0.18 -
    state.strategic.escalation.incidentLadder * 0.3 -
    state.strategic.forceGeneration.reserveStrain * 0.12;
}

export function assessOutcome(state: CampaignState) {
  const checks = evaluateCampaignObjectives(state);
  const legibility = buildCampaignLegibility(state);
  const metCount = checks.filter((entry) => entry.met).length;
  const collapse = legibility.risks.some((risk) => risk.margin <= 0);
  // maxTurns is the actual length of this campaign — it is scenario data, so a
  // longer (e.g. multi-year) campaign is just a scenario with a larger
  // maxTurns. Nothing about ending the campaign should hardcode a turn count.
  const finished = collapse || state.turn > state.maxTurns;
  const score = clamp(Math.round(rawCampaignScore(state)), 0, 100);

  if (!finished) return { status: "active" as const, score, outcome: null };

  const won = !collapse && metCount >= 3;
  // Name the condition that actually ended the campaign rather than listing all
  // three, so the player learns which one they lost control of.
  const collapseReasons = [
    legibility.risks.find((risk) => risk.key === "political")!.margin <= 0 ? "domestic cover collapsed" : "",
    legibility.risks.find((risk) => risk.key === "escalation")!.margin <= 0 ? "escalation ran beyond control" : "",
    legibility.risks.find((risk) => risk.key === "force")!.margin <= 0 ? "the deployable force fell too low to hold a credible posture" : "",
  ].filter(Boolean);

  return {
    status: won ? ("won" as const) : ("lost" as const),
    score,
    outcome: won
      ? `You held a credible posture to the end, meeting ${metCount} of ${checks.length} campaign objectives.`
      : collapse
        ? `The campaign ended early: ${collapseReasons.join(", and ")}.`
        : `The campaign is over and you met ${metCount} of ${checks.length} campaign objectives. Three were needed to finish in a credible posture.`,
  };
}

function normalizeState(state: CampaignState) {
  return JSON.parse(JSON.stringify(state, (_key, value) => (typeof value === "number" ? Number(value.toFixed(3)) : value))) as CampaignState;
}

function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "number") return JSON.stringify(Object.is(value, -0) ? 0 : value);
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`;
  }
  throw new Error("Cannot canonicalize an unsupported authoritative state value.");
}

/** Stable, full-state digest used to bind an inter-turn action to the exact
 * transition it claims to have caused.  It is a verifier input, never a
 * substitute for re-executing the action. */
export function campaignStateHash(state: CampaignState) {
  return createHash("sha256").update(canonicalJson(normalizeState(state))).digest("hex");
}

function turnReplayComparableState(state: CampaignState) {
  const comparable = normalizeState(state);
  return {
    ...comparable,
    chiefTrust: {},
    chiefAgendaMemory: {},
    activeCommitments: [],
    conversationHistory: [],
  };
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

/**
 * Advances the lifecycle of active commitments: checks for fulfilment or breach, and
 * creates new commitments when the player makes alliance, programme, or public-commitment
 * tag choices.
 *
 * ## Theoretical basis
 * Commitment theory (Snyder 1984, 1997; Fearon 1994) holds that public commitments are
 * costly to break because domestic and international audiences update their beliefs about
 * future resolve when a commitment is reneged. The game models this with two mechanisms:
 *
 * 1. **Fulfilment check**: commitments are fulfilled when the strategic/doctrinal state
 *    crosses a coherence threshold — representing the sustained follow-through that
 *    validates the original signal. Threshold values:
 *    - alliance commitment: strategicCoherence ≥ 60 (reassurance-sustained posture)
 *    - programme commitment: doctrineAlignment ≥ 55 (capability follow-through)
 *    - doctrine commitment: doctrineAlignment ≥ 60 (institutional embedding)
 *    - cabinet commitment: strategicCoherence ≥ 65 (highest bar — public and cabinet exposure)
 *
 * 2. **Breach check**: commitments are broken by specific behavioural signals.
 *    - alliance: `ad-hoc` or `hollow` tags signal the kind of tactical transactionalism
 *      identified by Lissner (2018) as destroying grand-strategic credibility.
 *    - programme: when supportableTempo falls below 5, the logistics chain can no longer
 *      sustain the commitment even if intent remains — the classic material credibility gap.
 *
 * Broken commitments feed back into S5 strategicCoherence through `contradictionTagPenalty`
 * and the S5 doctrine-bet after-action note, modelling Fearon's (1994) audience-cost logic:
 * credibility costs are borne whether or not the break was intentional.
 *
 * ## S5 programme prerequisite gate (Stage 3)
 * Programme-type commitment fulfilment also requires that at least one internal tech node
 * has reached level 2 (trained/operational). This prevents a purely declaratory commitment
 * from being counted as fulfilled: the public signal must be backed by visible capability
 * delivery. Fearon (1994) audience costs arise only when the audience can observe the
 * follow-through — a programme commitment with no fielded system is, by definition,
 * unfulfilled in the eyes of any informed observer.
 *
 * ## Alliance dilemma mechanics (Snyder 1984)
 * Each new commitment represents the player accepting some entrapment risk in exchange for
 * reduced abandonment risk in the alliance relationship. The system enforces at most one
 * open commitment of each type, preventing unrealistic simultaneous signalling.
 */
function updateCommitments(
  previous: CommitmentEntry[],
  selectedTags: Set<string>,
  currentTurn: number,
  nextMechanics: StaffMechanicsState,
  nextInternalTech: TechProgressNode[],
): CommitmentEntry[] {
  const next: CommitmentEntry[] = [];

  for (const commitment of previous) {
    if (commitment.fulfilled !== null) continue;
    const isBroken =
      (commitment.type === "alliance" && (selectedTags.has("ad-hoc") || selectedTags.has("hollow"))) ||
      (commitment.type === "program" && nextMechanics.s4.supportableTempo < 5);
    const isFulfilled =
      (commitment.type === "alliance" && nextMechanics.s5.strategicCoherence >= 60) ||
      // Programme gate: doctrineAlignment threshold AND at least one fielded capability (level 2 = trained/operational).
      // A commitment without any fielded system is declaratory — audience costs require observable follow-through (Fearon 1994).
      (commitment.type === "program" && nextMechanics.s5.doctrineAlignment >= 55 && nextInternalTech.some((n) => n.level === 2)) ||
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

// ── Doctrine 5 (issue #59): optional staff modules ─────────────────────────────
// The sim consumes scenario.staffModules generically: it never imports content and
// never switches on module ids — only on the closed lane enum (moduleEffectLaneSchema).
// Requested deltas accumulate as integer hundredths by lane (order-independent),
// convert once, apply once per lane in enum order, clamp once, round to two decimals.
// Module resolution draws ZERO RNG and runs after event selection, so same-turn event
// choice and RNG order/count are untouched. A scenario with zero resolved modules is
// byte-identical to the pre-D5 engine: no totals, no offsets, empty readouts, load 0.

export function coordinationLoad(moduleCount: number): number {
  return Number(Math.min(1, Math.max(0, (moduleCount - 2) / 5)).toFixed(2));
}

export function coordinationRequestedEffects(load: number) {
  return {
    "doctrine.systemPressure": Number((10 * load).toFixed(2)),
    "doctrine.staffSynchronization": Number((-12 * load).toFixed(2)),
    "staff.s5.strategicCoherence": Number((-2 * load).toFixed(2)),
    "strategic.escalation.incidentLadder": Number((1.25 * load).toFixed(2)),
    "resources.readiness": Number((-0.75 * load).toFixed(2)),
  } as const;
}

type ActiveModuleEffect = {
  effect: StaffModuleEffect;
  activatedByTags: string[];
};

type ActiveModuleRow = {
  definition: StaffModuleDefinition;
  activeBenefits: ActiveModuleEffect[];
  activePressures: ActiveModuleEffect[];
};

/** Select the active authored rows: standing rows always act; conditional rows act when ANY tag is selected. */
function resolveActiveModuleRows(definitions: readonly StaffModuleDefinition[], selectedTags: Set<string>): ActiveModuleRow[] {
  return definitions.map((definition) => {
    const active = (effects: readonly StaffModuleEffect[]): ActiveModuleEffect[] =>
      effects.flatMap((effect) => {
        const activatedByTags = effect.whenAnyTags.filter((tag) => selectedTags.has(tag));
        if (effect.whenAnyTags.length > 0 && activatedByTags.length === 0) return [];
        return [{ effect, activatedByTags }];
      });
    return { definition, activeBenefits: active(definition.benefitEffects), activePressures: active(definition.pressureEffects) };
  });
}

export type ModuleResolution = {
  staffMechanics: StaffMechanicsState;
  strategic: StrategicState;
  resources: CampaignState["resources"];
  /** Doctrine-lane totals (orderClarity/systemPressure/staffSynchronization), fed into resolveDoctrineMechanics before its threshold checks. */
  moduleDoctrineOffsets: Partial<Record<ModuleEffectLane, number>>;
  readouts: StaffModuleReadout[];
  coordinationLoad: number;
  /** One aggregate after-action note; null when no module is enabled. */
  note: { heading: string; detail: string } | null;
};

export function resolveActiveStaffModules(args: {
  definitions: readonly StaffModuleDefinition[];
  selectedTags: Set<string>;
  staffMechanics: StaffMechanicsState;
  strategic: StrategicState;
  resources: CampaignState["resources"];
}): ModuleResolution {
  // Uniqueness is enforced at the simulation boundary: a duplicate definition id
  // would double-count the row in the coordination-load formula AND apply its
  // effects twice. Throw BEFORE computing load or applying any effect; the load is
  // then derived from the validated unique ids (Map preserves profile order, so
  // readout order is untouched for legal inputs).
  const uniqueDefinitions = new Map<string, StaffModuleDefinition>();
  for (const definition of args.definitions) {
    if (uniqueDefinitions.has(definition.id)) {
      throw new Error(
        `staff module definitions repeat id "${definition.id}"; every definition must appear exactly once`,
      );
    }
    uniqueDefinitions.set(definition.id, definition);
  }
  const load = coordinationLoad(uniqueDefinitions.size);
  const rows = resolveActiveModuleRows([...uniqueDefinitions.values()], args.selectedTags);

  // Accumulate requested deltas as integer hundredths in closed lane-enum order.
  // Summing floats in profile order is not order-independent; integer hundredths are.
  const totals = Object.fromEntries(moduleEffectLaneSchema.options.map((lane) => [lane, 0])) as Record<ModuleEffectLane, number>;
  for (const row of rows) {
    for (const { effect } of [...row.activeBenefits, ...row.activePressures]) {
      totals[effect.lane] += Math.round(effect.delta * 100);
    }
  }
  if (load > 0) {
    const coordination = coordinationRequestedEffects(load);
    for (const [lane, value] of Object.entries(coordination) as Array<[ModuleEffectLane, number]>) {
      totals[lane] += Math.round(value * 100);
    }
  }

  // Convert once, then apply each lane once in enum order with a single clamp and
  // two-decimal rounding. Doctrine lanes are NOT clamped here: they enter the
  // resolveDoctrineMechanics base formulas before those formulas' own clamp/round and
  // consequence checks.
  let staffMechanics = cloneState(args.staffMechanics);
  let strategic = cloneState(args.strategic);
  let resources = cloneState(args.resources);
  const moduleDoctrineOffsets: Partial<Record<ModuleEffectLane, number>> = {};
  for (const lane of moduleEffectLaneSchema.options) {
    const hundredths = totals[lane];
    if (hundredths === 0) continue;
    const delta = hundredths / 100;
    switch (lane) {
      case "staff.s1.recoveryDebt":
        staffMechanics = { ...staffMechanics, s1: { ...staffMechanics.s1, recoveryDebt: round(clamp(staffMechanics.s1.recoveryDebt + delta, 0, 100)) } };
        break;
      case "staff.s2.deceptionRisk":
        staffMechanics = { ...staffMechanics, s2: { ...staffMechanics.s2, deceptionRisk: round(clamp(staffMechanics.s2.deceptionRisk + delta, 0, 100)) } };
        break;
      case "staff.s5.strategicCoherence":
        staffMechanics = { ...staffMechanics, s5: { ...staffMechanics.s5, strategicCoherence: round(clamp(staffMechanics.s5.strategicCoherence + delta, 0, 100)) } };
        break;
      case "doctrine.orderClarity":
      case "doctrine.systemPressure":
      case "doctrine.staffSynchronization":
        moduleDoctrineOffsets[lane] = delta;
        break;
      case "strategic.forceGeneration.reserveStrain":
        strategic = { ...strategic, forceGeneration: { ...strategic.forceGeneration, reserveStrain: round(clamp(strategic.forceGeneration.reserveStrain + delta, 0, 100)) } };
        break;
      case "strategic.forceGeneration.trainingThroughput":
        strategic = { ...strategic, forceGeneration: { ...strategic.forceGeneration, trainingThroughput: round(clamp(strategic.forceGeneration.trainingThroughput + delta, 0, 100)) } };
        break;
      case "strategic.sustainment.depotBacklog":
        strategic = { ...strategic, sustainment: { ...strategic.sustainment, depotBacklog: round(clamp(strategic.sustainment.depotBacklog + delta, 0, 100)) } };
        break;
      case "strategic.sustainment.liftAvailability":
        strategic = { ...strategic, sustainment: { ...strategic.sustainment, liftAvailability: round(clamp(strategic.sustainment.liftAvailability + delta, 0, 100)) } };
        break;
      case "strategic.alliance.reassurance":
        strategic = { ...strategic, alliance: { ...strategic.alliance, reassurance: round(clamp(strategic.alliance.reassurance + delta, 0, 100)) } };
        break;
      case "strategic.alliance.politicalAlignment":
        strategic = { ...strategic, alliance: { ...strategic.alliance, politicalAlignment: round(clamp(strategic.alliance.politicalAlignment + delta, 0, 100)) } };
        break;
      case "strategic.domestic.cabinetCover":
        strategic = { ...strategic, domestic: { ...strategic.domestic, cabinetCover: round(clamp(strategic.domestic.cabinetCover + delta, 0, 100)) } };
        break;
      case "strategic.domestic.committeeTolerance":
        strategic = { ...strategic, domestic: { ...strategic.domestic, committeeTolerance: round(clamp(strategic.domestic.committeeTolerance + delta, 0, 100)) } };
        break;
      case "strategic.domestic.mediaHeat":
        strategic = { ...strategic, domestic: { ...strategic.domestic, mediaHeat: round(clamp(strategic.domestic.mediaHeat + delta, 0, 100)) } };
        break;
      case "strategic.escalation.incidentLadder":
        strategic = { ...strategic, escalation: { ...strategic.escalation, incidentLadder: round(clamp(strategic.escalation.incidentLadder + delta, 0, 100)) } };
        break;
      case "resources.budgetAuthority":
        resources = { ...resources, budgetAuthority: round(clamp(resources.budgetAuthority + delta, 0, 100)) };
        break;
      case "resources.readiness":
        resources = { ...resources, readiness: round(clamp(resources.readiness + delta, 0, 100)) };
        break;
    }
  }

  // Readouts report the exact active authored/requested rows in profile order; the
  // resolved post-clamp state stays available through nextState. Status precedence:
  // coordination-strained when load > 0, pressured when any pressure is active,
  // otherwise active.
  const readouts: StaffModuleReadout[] = rows.map((row) => {
    const status = load > 0 ? "coordination-strained" : row.activePressures.length > 0 ? "pressured" : "active";
    return {
      id: row.definition.id,
      label: row.definition.label,
      remit: row.definition.remit,
      primaryStaffFunctionRefs: row.definition.primaryStaffFunctionRefs,
      evidenceRefs: row.definition.evidenceRefs,
      status,
      benefits: row.activeBenefits.map(({ effect, activatedByTags }) => ({
        lane: effect.lane,
        requestedDelta: effect.delta,
        summary: effect.summary,
        activatedByTags,
      })),
      pressures: row.activePressures.map(({ effect, activatedByTags }) => ({
        lane: effect.lane,
        requestedDelta: effect.delta,
        summary: effect.summary,
        activatedByTags,
      })),
      coordinationLoad: load,
    };
  });

  // One aggregate note, appended last in the engine note order. The coordination
  // sentence appears only when load > 0 (counts 0-2 apply no coordination rows).
  let note: ModuleResolution["note"] = null;
  if (rows.length > 0) {
    const moduleLines = rows.map((row) => {
      const summaries = [...row.activeBenefits.map(({ effect }) => effect.summary), ...row.activePressures.map(({ effect }) => effect.summary)];
      return `${row.definition.label}: ${summaries.join(" ")}`;
    });
    let detail = moduleLines.join(" ");
    if (load > 0) {
      const coordination = coordinationRequestedEffects(load);
      const signed = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
      detail +=
        ` Coordination load ${load.toFixed(2)} requested ${signed(coordination["doctrine.systemPressure"])} system pressure, ` +
        `${signed(coordination["doctrine.staffSynchronization"])} staff synchronization, ` +
        `${signed(coordination["staff.s5.strategicCoherence"])} S5 coherence, ` +
        `${signed(coordination["strategic.escalation.incidentLadder"])} incident ladder, and ` +
        `${signed(coordination["resources.readiness"])} readiness.`;
    }
    note = { heading: `Staff modules: ${rows.length} cells active`, detail };
  }

  return {
    staffMechanics,
    strategic,
    resources,
    moduleDoctrineOffsets,
    readouts,
    coordinationLoad: load,
    note,
  };
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
      projectedModuleReadouts: projectedResult.staffModules,
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
  return {
    projectedResult,
    disagreements,
    decisionPreviews,
    acceptedRiskCandidates,
    predictedEvents: projectedResult.triggeredEvents,
    chiefCoalitions: projectedResult.chiefCoalitions,
    // Doctrine 5: the top-level preview carries the projected module readouts and
    // coordination load so every client (web, server, headless) reads one engine result.
    staffModules: projectedResult.staffModules,
    coordinationLoad: projectedResult.coordinationLoad,
    packetSummary: buildCommandPacketSummary(projectedResult.directorateBurden, input.commanderIntent),
  };
}

/**
 * Doctrine 5 (issue #59): the authoritative eligibility gate for relief
 * negotiations — the ONLY place the current-unnegotiated-packet derivation
 * lives. A negotiation is legitimate ONLY for a directorate the CURRENT
 * unnegotiated packet reports as strained/overloaded (the same
 * `staffConstraintDirectorates` the preview endpoint transports). A
 * negotiation carried over from an earlier memo selection — or invented
 * client-side — for a directorate that is not stretched must never reach the
 * resolver: the sim would happily apply its costs (−2 political capital, −2
 * cabinet cover, +1 media heat) even though no relief was on offer. Derived
 * from the unnegotiated packet so relief that DROPS a directorate below the
 * strain threshold stays eligible (it was strained before the relief was
 * applied). Pure: operates on `(scenario, state, input)` so every boundary —
 * `/resolve-turn`, import/replay validation, and headless supplied inputs —
 * shares ONE gate (closing pass 7 P1: the headless and import paths previously
 * accepted replay-consistent sessions whose recorded turns contained
 * ineligible negotiations).
 */
export function ineligibleStaffNegotiations(
  scenario: ScenarioDefinition,
  state: CampaignState,
  input: TurnInput,
): StaffNegotiation[] {
  const negotiations = input.staffNegotiations ?? [];
  if (negotiations.length === 0) return [];
  const preview = previewTurn(scenario, state, { ...input, staffNegotiations: [] });
  const eligible = new Set(preview.chiefCoalitions.flatMap((coalition) => coalition.staffConstraintDirectorates));
  return negotiations.filter((negotiation) => !eligible.has(negotiation.directorate));
}

export function resolveTurn(scenario: ScenarioDefinition, previousState: CampaignState, input: TurnInput): TurnResult {
  if (input.turn !== previousState.turn) throw new Error(`Expected turn ${previousState.turn}, received ${input.turn}.`);
  if (previousState.campaignStatus !== "active") throw new Error("This campaign has already ended.");

  const memos = deriveDecisionMemos(scenario, previousState);
  validateSelections(memos, input);
  const rng = mulberry32(previousState.seed + previousState.turn * 97 + input.selections.length * 17);
  const selectedPairs = input.selections.map((selection) => findOption(memos, selection));
  const selectedOptions = selectedPairs.map((entry) => entry.option);
  const staffNegotiations = input.staffNegotiations ?? [];
  // Doctrine 3 (issue #57): the composed lens serialized on the scenario definition
  // (schema default guarantees existence). Threaded through every call-site that shapes
  // attention — burden routing, chief positions, readout warnings, after-action notes.
  const lens = scenario.doctrineLens;
  const directorateBurden = buildDirectorateBurden(memos, input.selections, scenario.staffCapacities, staffNegotiations, lens.burdenBias);
  validateCommanderIntent(input, directorateBurden);

  let nextStrategic = cloneState(previousState.strategic);
  let nextResources = cloneState(previousState.resources);
  for (const option of selectedOptions) {
    nextStrategic = applyStrategicDelta(nextStrategic, option.stateDelta);
    nextResources = applyResourceDelta(nextResources, option.stateDelta);
  }
  for (const negotiation of staffNegotiations) {
    const delta = negotiationCostDelta(negotiation);
    nextStrategic = applyStrategicDelta(nextStrategic, delta);
    nextResources = applyResourceDelta(nextResources, delta);
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

  const chiefPositions = selectedPairs.flatMap(({ memo, option }) =>
    buildChiefPositions(scenario.chiefs, previousState, memo, option, directorateBurden, scenario.staffFunctions, lens)
  );
  const chiefCoalitions: ChiefCoalitionEntry[] = buildChiefCoalitions(selectedPairs, chiefPositions, directorateBurden);
  const nextChiefAgendaMemory = updateChiefAgendaMemoryFromPositions(
    previousState,
    scenario.chiefs,
    selectedPairs.map(({ memo, option }) => ({
      memo,
      option,
      positions: chiefPositions.filter((entry) => entry.memoId === memo.id && entry.optionId === option.id),
    })),
  );
  const nextPrograms = updatePrograms(scenario, previousState, input.selections, directorateBurden);
  const nextConstraints = updateConstraints(previousState, selectedOptions, triggeredEvents);
  const nextTrust = updateChiefTrust(previousState, chiefPositions);
  let nextStaffMechanics = updateStaffMechanics(previousState, selectedOptions, directorateBurden, triggeredEvents, nextConstraints);
  // Doctrine 5 (issue #59): resolve active optional staff modules AFTER the S1-S5 core
  // so their staff/strategic/resource deltas are visible to the same-turn doctrine
  // gates, and pass only the doctrine-lane totals into resolveDoctrineMechanics (added
  // inside the orderClarity/staffSynchronization/systemPressure base formulas before
  // clamp/round and before each consequence check). Zero RNG, zero events: the module
  // resolution never touches selection, the event stream, or the RNG budget.
  const moduleResolution = resolveActiveStaffModules({
    definitions: scenario.staffModules,
    selectedTags,
    staffMechanics: nextStaffMechanics,
    strategic: nextStrategic,
    resources: nextResources,
  });
  nextStaffMechanics = moduleResolution.staffMechanics;
  nextStrategic = moduleResolution.strategic;
  nextResources = moduleResolution.resources;
  const doctrineResolution = resolveDoctrineMechanics({
    previousState,
    doctrineAnchor: scenario.initialState.doctrineMechanics,
    selectedOptions,
    directorateBurden,
    nextStaffMechanics,
    strategic: nextStrategic,
    resources: nextResources,
    triggeredEvents,
    chiefs: scenario.chiefs,
    previousChiefTrust: previousState.chiefTrust,
    acceptedRiskOverrides: input.acceptedRiskOverrides ?? [],
    commanderIntent: input.commanderIntent,
    moduleDoctrineOffsets: moduleResolution.moduleDoctrineOffsets,
  });
  nextStrategic = doctrineResolution.strategic;
  nextStrategic.forceGeneration.deployableUnits = round(nextStrategic.forceGeneration.deployableUnits);
  nextResources = doctrineResolution.resources;
  const nextDoctrineMechanics = doctrineResolution.doctrineMechanics;
  const nextDoctrineMaturity = updateDoctrineMaturity({
    previousState,
    nextDoctrineMechanics,
    selectedTags,
    acceptedRiskOverrides: input.acceptedRiskOverrides ?? [],
    events: scenario.events,
    triggeredEvents,
    turn: input.turn,
  });
  const nextInternalTech: TechProgressNode[] = nextPrograms.map((program) => ({
    id: program.id,
    level: phaseToLevel(program.phase),
    progress: program.progress,
  }));
  const nextExternalTech = updateExternalTech(previousState, nextConstraints, selectedTags, nextStaffMechanics);

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
  const nextCommitments = updateCommitments(previousState.activeCommitments, selectedTags, previousState.turn, nextStaffMechanics, nextInternalTech);

  const nextState: CampaignState = {
    ...previousState,
    turn: nextTurn,
    resources: nextResources,
    staffMechanics: nextStaffMechanics,
    doctrineMechanics: nextDoctrineMechanics,
    doctrineMaturity: nextDoctrineMaturity,
    forceGeneration: nextStrategic.forceGeneration,
    intel: nextStrategic.intelligence,
    sustainment: nextStrategic.sustainment,
    alliance: nextStrategic.alliance,
    domestic: nextStrategic.domestic,
    escalation: nextStrategic.escalation,
    strategic: nextStrategic,
    capabilityPrograms: nextPrograms,
    externalConstraints: nextConstraints,
    internalTech: nextInternalTech,
    externalTech: nextExternalTech,
    chiefTrust: nextTrust,
    chiefAgendaMemory: nextChiefAgendaMemory,
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
  const nodeName = buildNodeNameLookup(scenario);
  const resultAfterAction = [
    ...afterAction(previousState, nextState, directorateBurden, triggeredEvents, input.acceptedRiskOverrides, staffNegotiations, nodeName),
    ...doctrineResolution.notes,
    ...triggeredEvents.filter((event) => event.doctrineTrigger && event.causalContext).map((event) => {
      const trigger = event.doctrineTrigger!;
      const context = event.causalContext!;
      const prior = previousState.doctrineMaturity[event.id];
      const currentRefs = (input.acceptedRiskOverrides ?? [])
        .filter((risk) => context.staffFunctionRefs.includes(risk.staffFunctionId))
        .map((risk) => `${risk.staffFunctionId} — ${risk.warningText}`);
      const refs = [...(prior?.acceptedRiskRefs ?? []).map((risk) => `${risk.staffFunctionId} — ${risk.warningText}`), ...currentRefs];
      return {
        heading: `Doctrine risk matured: ${event.title}`,
        detail: `${context.betLabel} Repeated tags: ${event.triggerTags.join(", ")}. ${context.maturedRiskLabel}; observed ${trigger.conditions.map((condition) => `${condition.variable} ${condition.comparison} ${condition.threshold}`).join(" and ")} for ${trigger.sustainedTurns} consecutive turns. Vulnerability: ${trigger.vulnerability} (${trigger.sourceGeneLabel}; gene ${trigger.sourceGeneId}). Consequence: ${event.summary} ${refs.length > 0 ? `Matching accepted risks: ${refs.join("; ")}.` : "No matching warning was accepted."}`,
      };
    }),
    ...resolveBurdenDissent(directorateBurden, lens.burdenBias, input.acceptedRiskOverrides ?? [], scenario.staffFunctions),
    ...(moduleResolution.note ? [moduleResolution.note] : []),
    ...nextCommitments
      .filter((commitment) => {
        const prior = previousState.activeCommitments.find((entry) => entry.id === commitment.id);
        return prior?.fulfilled === null && commitment.fulfilled !== null && commitment.chiefId;
      })
      .map((commitment) => ({
        heading: commitment.fulfilled ? "Chief term honoured" : "Chief term breached",
        detail: `${commitment.label} was ${commitment.fulfilled ? "honoured" : "breached"} by what the month actually carried. The result is now part of the relationship record.`,
      })),
  ];
  const staffFunctions = buildStaffFunctionReadouts(scenario.staffFunctions, directorateBurden, nextState, lens.burdenBias);
  const explainability = createExplainability(selectedPairs, directorateBurden, triggeredEvents, previousState, nextState, nodeName);
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
    chiefCoalitions,
    monthlyEstimate,
    directorateBurden,
    staffFunctions,
    staffModules: moduleResolution.readouts,
    coordinationLoad: moduleResolution.coordinationLoad,
    explainability,
    portfolioLoad: [],
    triggeredEvents,
    afterAction: resultAfterAction,
    acceptedRisks,
    internalTech: nextInternalTech,
    externalTech: nextExternalTech,
    replayHash,
    summary,
  };
}

function replayAuthoritativeActions(
  scenario: ScenarioDefinition,
  state: CampaignState,
  actions: Array<import("@brass-ledger/shared").AuthoritativeAction>,
  revision: number,
  expectedSequence: number,
  campaignId: string | undefined,
): { state: CampaignState; revision: number; nextSequence: number; error: string | null } {
  let current = cloneState(state);
  let currentRevision = revision;
  let sequence = expectedSequence;
  for (const action of actions) {
    if (action.sequence !== sequence) return { state: current, revision: currentRevision, nextSequence: sequence, error: "action sequence is not contiguous" };
    if (action.turn !== current.turn) return { state: current, revision: currentRevision, nextSequence: sequence, error: "action turn does not match replay state" };
    if (action.revisionBefore !== currentRevision || action.revisionAfter !== currentRevision + 1) return { state: current, revision: currentRevision, nextSequence: sequence, error: "action revision context is invalid" };
    if (action.scenarioId !== scenario.id || action.contentVersion !== scenario.contentVersion) return { state: current, revision: currentRevision, nextSequence: sequence, error: "action scenario/content identity is invalid" };
    if (!campaignId || action.campaignId !== campaignId) return { state: current, revision: currentRevision, nextSequence: sequence, error: "action campaign identity is invalid" };
    if (action.preStateHash !== campaignStateHash(current)) return { state: current, revision: currentRevision, nextSequence: sequence, error: "action pre-state digest does not match replay state" };
    const chief = scenario.chiefs.find((entry) => entry.id === action.chiefId);
    if (!chief) return { state: current, revision: currentRevision, nextSequence: sequence, error: "action references an unknown chief" };
    if (action.type === "chief-conversation-open") {
      if (getConversationRecordForTurn(current, chief.id)) return { state: current, revision: currentRevision, nextSequence: sequence, error: "chief was engaged more than once in one month" };
      const memos = deriveDecisionMemos(scenario, current);
      const selectedMemoIds = new Set<string>();
      for (const selection of action.packetSelections) {
        if (selectedMemoIds.has(selection.memoId)) return { state: current, revision: currentRevision, nextSequence: sequence, error: "conversation packet repeats a memo" };
        selectedMemoIds.add(selection.memoId);
        const selectedMemo = memos.find((entry) => entry.id === selection.memoId);
        if (!selectedMemo?.options.some((entry) => entry.id === selection.optionId)) {
          return { state: current, revision: currentRevision, nextSequence: sequence, error: "conversation packet references an unavailable selection" };
        }
      }
      const memo = memos.find((entry) => entry.id === action.memoId);
      const option = memo?.options.find((entry) => entry.id === action.optionId);
      if (!memo || !option) return { state: current, revision: currentRevision, nextSequence: sequence, error: "conversation references an unavailable option" };
      if (!action.packetSelections.some((selection) => selection.memoId === memo.id && selection.optionId === option.id)) {
        return { state: current, revision: currentRevision, nextSequence: sequence, error: "conversation target is absent from its recorded packet" };
      }
      const burden = buildDirectorateBurden(memos, [{ memoId: memo.id, optionId: option.id }], scenario.staffCapacities, [], scenario.doctrineLens.burdenBias);
      const position = buildChiefPositions(scenario.chiefs, current, memo, option, burden, scenario.staffFunctions, scenario.doctrineLens)
        .find((entry) => entry.chiefId === chief.id);
      if (!position) return { state: current, revision: currentRevision, nextSequence: sequence, error: "conversation has no chief position" };
      current = {
        ...current,
        conversationHistory: [...current.conversationHistory, startChiefConversation(chief, memo, option, position, current)],
      };
      if (action.postStateHash !== campaignStateHash(current)) return { state: current, revision: currentRevision, nextSequence: sequence, error: "action post-state digest does not match transition" };
      currentRevision += 1;
      sequence += 1;
      continue;
    }

    const conversation = getConversationRecordForTurn(current, chief.id);
    if (!conversation || conversation.status === "completed") return { state: current, revision: currentRevision, nextSequence: sequence, error: "response has no active conversation" };
    const memos = deriveDecisionMemos(scenario, current);
    const memo = memos.find((entry) => entry.id === conversation.memoId);
    const option = memo?.options.find((entry) => entry.id === conversation.optionId);
    if (!memo || !option) return { state: current, revision: currentRevision, nextSequence: sequence, error: "response references an unavailable option" };
    let nextConversation: ReturnType<typeof continueChiefConversation>;
    try {
      nextConversation = continueChiefConversation(conversation, chief, memo, option, current, action.responseId);
    } catch {
      return { state: current, revision: currentRevision, nextSequence: sequence, error: "response is not legal for the conversation stage" };
    }
    current = {
      ...current,
      chiefTrust: { ...current.chiefTrust, [chief.id]: nextConversation.trustAfter },
      chiefAgendaMemory: nextConversation.status === "completed"
        ? updateChiefAgendaMemoryFromConversation(current, chief, memo, option, nextConversation)
        : current.chiefAgendaMemory,
      activeCommitments: nextConversation.status === "completed"
        ? updateCommitmentsFromChiefConversation(current, chief, memo, option, nextConversation)
        : current.activeCommitments,
      conversationHistory: current.conversationHistory.map((entry) => entry.turn === current.turn && entry.chiefId === chief.id ? nextConversation : entry),
    };
    if (action.postStateHash !== campaignStateHash(current)) return { state: current, revision: currentRevision, nextSequence: sequence, error: "action post-state digest does not match transition" };
    currentRevision += 1;
    sequence += 1;
  }
  return { state: current, revision: currentRevision, nextSequence: sequence, error: null };
}

export function validateReplaySession(scenario: ScenarioDefinition, session: { initialState: CampaignState; turnInputs: TurnInput[]; authoritativeActions?: Array<import("@brass-ledger/shared").AuthoritativeAction>; history: TurnResult[]; state: CampaignState; revision?: number; campaignId?: string }): ReplayValidation {
  let current = cloneState(session.initialState);
  let failedAtTurn: number | null = null;
  let failureKind: ReplayValidation["failureKind"] = "none";
  const diffs: ReplayValidation["diffs"] = [];
  const actions = session.authoritativeActions ?? [];
  let actionIndex = 0;
  let revision = 0;
  let nextSequence = 1;

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
    const actual = session.history[index];
    // The ledger is an ordered evidence stream, not a bag to be searched by
    // turn. Consuming only the contiguous prefix means an action spliced in
    // from a later turn (or a reordered record) cannot be skipped over and
    // accidentally treated as though it belonged to another transition.
    const pending: typeof actions = [];
    while (actions[actionIndex]?.turn === current.turn) {
      pending.push(actions[actionIndex]!);
      actionIndex += 1;
    }
    const replayedActions = replayAuthoritativeActions(scenario, current, pending, revision, nextSequence, session.campaignId);
    if (replayedActions.error) {
      failedAtTurn = current.turn;
      failureKind = "authoritative_action_mismatch";
      diffs.push({ turn: current.turn, path: "authoritativeActions", expected: "legal deterministic action", actual: replayedActions.error });
      break;
    }
    current = replayedActions.state;
    revision = replayedActions.revision;
    nextSequence = replayedActions.nextSequence;
    const preTurnDiffs = diffStates(normalizeState(current), normalizeState(actual.previousState)).map((entry) => ({
      turn: actual.input.turn,
      path: entry.path,
      expected: JSON.stringify(entry.expected),
      actual: JSON.stringify(entry.actual),
    }));
    if (preTurnDiffs.length > 0) {
      failedAtTurn = actual.input.turn;
      failureKind = "state_mismatch";
      diffs.push(...preTurnDiffs);
      break;
    }

    const expected = resolveTurn(scenario, current, session.turnInputs[index]);
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
    revision += 1;
  }

  if (failedAtTurn == null) {
    const remaining = actions.slice(actionIndex);
    const replayedActions = replayAuthoritativeActions(scenario, current, remaining, revision, nextSequence, session.campaignId);
    if (replayedActions.error) {
      failedAtTurn = current.turn;
      failureKind = "authoritative_action_mismatch";
      diffs.push({ turn: current.turn, path: "authoritativeActions", expected: "legal deterministic action", actual: replayedActions.error });
    } else {
      current = replayedActions.state;
      revision = replayedActions.revision;
      nextSequence = replayedActions.nextSequence;
    }
  }

  if (failedAtTurn == null) {
    if (session.revision !== undefined && session.revision !== revision) {
      failedAtTurn = session.state.turn;
      failureKind = "authoritative_action_mismatch";
      diffs.push({ turn: session.state.turn, path: "revision", expected: String(revision), actual: String(session.revision) });
    }
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
