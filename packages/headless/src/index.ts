import { doctrineEventCostMass, getDefaultScenario, getScenario, soloScenario, spriteVisualLanguage, staffModuleDefinitions } from "@brass-ledger/content";
import { createHash, randomUUID } from "node:crypto";
import {
  buildAdvisorPortraitSvg,
  buildChiefSpriteSpec,
  relationshipLabel,
  buildDirectorateBurden,
  buildStaffFunctionReadouts,
  createInitialGameSession,
  type AcceptedRiskOverride,
  type CampaignState,
  type DirectorateId,
  type GameSession,
  type ReplayValidation,
  type SpriteSpec,
  type StaffNegotiation,
  type TurnInput,
  type ScenarioDefinition,
  scenarioDefinitionSchema,
} from "@brass-ledger/shared";
import { deriveDecisionMemos, doctrineEventEligible, ineligibleStaffNegotiations, previewTurn, rawCampaignScore, resolveTurn, validateReplaySession } from "@brass-ledger/sim";

export type OptionRate = {
  memoId: string;
  optionId: string;
  selectionRate: number;
};

export type BalanceTelemetry = {
  campaignCount: number;
  totalTurns: number;
  outcomeDistribution: { won: number; lost: number; active: number };
  scoreStats: { min: number; max: number; mean: number; p25: number; p75: number };
  overloadFrequency: Record<string, number>;
  acceptedRiskFrequency: Record<string, number>;
  negotiationFrequency: number;
  commitmentFulfillmentRate: number | null;
  commitmentBreachRate: number | null;
  optionSelectionRates: OptionRate[];
  dominantOptions: OptionRate[];
  /** Per-strategy selection rates (keyed by strategyId), for cohort rotation locks. */
  strategyOptionSelectionRates: Record<string, OptionRate[]>;
  /** Complete per-turn decision packets, grouped without exposing hidden event outcomes. */
  packetFamilies: PacketFamilyTelemetry[];
  /** Declared main efforts are measured separately from option rates. */
  intentFamilies: IntentFamilyTelemetry[];
  optionalMemoTakeRate: number;
  repeatedOptionLoopRate: number;
  overloadProfileByStrategy: Record<string, number>;
  programmeCompletionRates: Record<string, number>;
  collapseReasons: Record<string, number>;
  doctrineEvents: DoctrineEventTelemetry[];
  doctrineStrategies: DoctrineStrategyTelemetry[];
  /** D4 gate: no-tradeoff doctrine strategies, evaluated per module set against each set's balanced-cycle cohort. */
  dominantDoctrineStrategies: string[];
  /** Doctrine 5 addition: enabled strategies dominating their own disabled twins. Distinct from the D4 gate above. */
  modulePairDominance: string[];
  balanceWarnings: string[];
  pairCount: number;
  simulationCount: number;
  moduleSetRows: ModuleSetTelemetry[];
  pairedDeltas: PairedModuleDelta[];
  twoVsSevenCalibration: { meanIncidentLadderDelta: number; meanStaffSynchronizationDelta: number; meanScoreDelta: number; winRateDelta: number };
};

export type PacketFamilyTelemetry = {
  packetId: string;
  selections: string[];
  turns: number;
  campaigns: number;
  winRate: number;
  meanScore: number;
};

export type IntentFamilyTelemetry = {
  mainEffort: DirectorateId;
  campaigns: number;
  turns: number;
  winRate: number;
  meanScore: number;
};

export type ModuleSetTelemetry = DoctrineStrategyTelemetry & {
  moduleSet: "enabled" | "disabled";
  pairCount: number;
  simulationCount: number;
  meanRawScore: number;
  meanDeployableUnits: number;
  meanPoliticalAlignment: number;
  meanCabinetCover: number;
  meanIncidentLadder: number;
  meanReserveStrain: number;
  meanRecoveryDebt: number;
  meanSupportableTempo: number;
  meanSystemPressure: number;
  meanStaffSynchronization: number;
  meanCoordinationLoad: number;
  requestedCoordinationIncidentOffset: number;
  requestedCoordinationReadinessOffset: number;
  lostCampaigns: number;
  activeCampaigns: number;
  wonCampaigns: number;
};

export type PairedModuleDelta = { strategyId: StrategyId; meanScoreDelta: number; winRateDelta: number; meanIncidentLadderDelta: number; meanStaffSynchronizationDelta: number };

export type DoctrineEventTelemetry = {
  eventId: string;
  sourceGeneId: string;
  strategyId: StrategyId;
  moduleSet: "enabled" | "disabled";
  attemptedCampaigns: number;
  qualifyingCampaigns: number;
  firedCampaigns: number;
  campaignHitRate: number;
  maturationRate: number;
  firingReliability: number;
};

export type DoctrineStrategyTelemetry = {
  profileId: string;
  strategyId: "balanced-cycle" | "coalition-commitment" | "adaptive-cell-sprawl" | "sustainment-delay";
  campaigns: number;
  meanScore: number;
  winRate: number;
  meanDoctrineEvents: number;
  meanDoctrineEventCostMass: number;
  /** Fraction of this strategy's campaigns in which at least one doctrine event fired. */
  doctrineCampaignHitRate: number;
};

export type HeadlessRunOptions = {
  /** Selects a registered scenario for a newly-created campaign. Ignored when session is supplied. */
  scenarioId?: string;
  /** Stable campaign identity for a newly-created campaign. It selects the authored opening variation and is retained on export. */
  campaignSeed?: string;
  turns?: number;
  session?: GameSession;
  inputs?: TurnInput[];
  validate?: boolean;
  includeSprites?: boolean;
  autoAcceptRisks?: boolean;
};

/**
 * SHA-256 over the exact UTF-8 bytes of a prompt string, as full lowercase hex.
 * No trim, normalization, prefix, or truncation. Computed at the Node output
 * boundary only — never inside shared (browser-safe) or persisted sessions.
 */
export function hashPromptText(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** Additive sprite artifact: deterministic SVG + spec, with prompt hashes as siblings. */
export type HeadlessSpriteOutput = {
  chiefId: string;
  displayName: string;
  title: string;
  directorate: DirectorateId;
  svg: string;
  spec: SpriteSpec;
  promptHash: string;
  negativePromptHash: string;
};

export class HeadlessAcceptedRiskError extends Error {
  readonly acceptedRiskCandidates: AcceptedRiskOverride[];

  constructor(acceptedRiskCandidates: AcceptedRiskOverride[]) {
    super("Headless turn requires explicit acceptedRiskOverrides for projected S1-S5 staff warnings.");
    this.name = "HeadlessAcceptedRiskError";
    this.acceptedRiskCandidates = acceptedRiskCandidates;
  }
}

export class HeadlessIneligibleNegotiationError extends Error {
  readonly ineligibleNegotiations: StaffNegotiation[];

  constructor(ineligibleNegotiations: StaffNegotiation[]) {
    super("Headless turn requested relief for directorates the current selections do not offer.");
    this.name = "HeadlessIneligibleNegotiationError";
    this.ineligibleNegotiations = ineligibleNegotiations;
  }
}

function defaultInput(session: GameSession, scenario: ScenarioDefinition = soloScenario): TurnInput {
  const memos = deriveDecisionMemos(scenario, session.state);
  return {
    turn: session.state.turn,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    staffNegotiations: [],
    selections: memos
      .filter((memo) => !memo.optional)
      .map((memo) => ({
        memoId: memo.id,
        optionId: memo.options[0]?.id ?? "",
      }))
      .filter((selection) => selection.optionId.length > 0),
  };
}

function riskKey(risk: AcceptedRiskOverride) {
  return `${risk.staffFunctionId}\u0000${risk.warningText}`;
}

export function acceptedRiskCandidatesForInput(session: GameSession, input: TurnInput, scenario: ScenarioDefinition = soloScenario) {
  return previewTurn(scenario, session.state, { ...input, acceptedRiskOverrides: [] }).acceptedRiskCandidates;
}

function inputWithAcceptedRiskPolicy(session: GameSession, input: TurnInput, autoAcceptRisks: boolean, scenario: ScenarioDefinition = soloScenario) {
  const accepted = new Set((input.acceptedRiskOverrides ?? []).map(riskKey));
  const missing = acceptedRiskCandidatesForInput(session, input, scenario).filter((candidate) => !accepted.has(riskKey(candidate)));
  if (missing.length === 0) return input;
  if (!autoAcceptRisks) throw new HeadlessAcceptedRiskError(missing);
  return {
    ...input,
    acceptedRiskOverrides: [...(input.acceptedRiskOverrides ?? []), ...missing],
  };
}

type StrategyId = DoctrineStrategyTelemetry["strategyId"];

export const orderedStrategies: StrategyId[] = ["balanced-cycle", "coalition-commitment", "adaptive-cell-sprawl", "sustainment-delay"];

/**
 * Deterministic per-replicate simulation seed. All four strategies in one replicate
 * share this seed so the cohorts are paired; different replicates differ.
 */
export function replicateSeedFor(replicate: number, scenario: ScenarioDefinition = soloScenario): number {
  return scenario.initialState.seed + replicate * 1009;
}

/** Builds a batch campaign session with the paired replicate seed applied to state and initialState. */
export function createBatchSession(campaignIndex: number, scenario: ScenarioDefinition = soloScenario): GameSession {
  const replicate = Math.floor(campaignIndex / orderedStrategies.length);
  const session: GameSession = { ...createInitialGameSession(scenario, `batch-${campaignIndex}`), id: `batch-${campaignIndex}` };
  session.state.seed = replicateSeedFor(replicate, scenario);
  session.initialState.seed = replicateSeedFor(replicate, scenario);
  return session;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

/*
 * The batch collector deliberately records facts at the point where the sim
 * produces them.  In particular, no aggregate below is derived from a target
 * cohort's expected size or from the module count.  This is important because
 * the batch is also used as the balance-gate witness.
 */
function memosForSelection(scenario: typeof soloScenario, state: GameSession["state"], selection: { memoId: string; optionId: string }) {
  return deriveDecisionMemos(scenario, state).find((memo) => memo.id === selection.memoId)?.options.find((option) => option.id === selection.optionId)?.tags ?? [];
}

function targetStrategyForEvent(eventId: string): StrategyId {
  if (eventId === "doctrine-coalition-caveat-exposure") return "coalition-commitment";
  if (eventId === "doctrine-adaptive-cell-sprawl") return "adaptive-cell-sprawl";
  return "sustainment-delay";
}

export async function runHeadlessCampaign(options: HeadlessRunOptions = {}) {
  const requestedScenario = options.session
    ? getScenario(options.session.scenarioId, options.session.contentVersion)
    : options.scenarioId
      ? getScenario(options.scenarioId)
      : getDefaultScenario();
  if (!requestedScenario) {
    const identity = options.session
      ? `${options.session.scenarioId}@${options.session.contentVersion}`
      : options.scenarioId ?? "the configured default";
    throw new Error(`No installed scenario matches ${identity}.`);
  }
  const scenario = requestedScenario;
  const sessionId = options.campaignSeed ?? randomUUID();
  let session = options.session ?? {
    ...createInitialGameSession(scenario, sessionId),
    id: sessionId,
  };
  const turns = options.turns ?? 1;
  const providedInputs = options.inputs ?? [];

  const turnSummaries = [];
  for (let index = 0; index < turns && session.state.campaignStatus === "active"; index += 1) {
    const providedInput = providedInputs[index];
    const baseInput = providedInput ?? defaultInput(session, scenario);
    // Closing pass 7 P1: supplied inputs share the /resolve-turn input-validity
    // contract — an ineligible relief negotiation must never reach the resolver
    // (checked BEFORE the accepted-risk precondition, exactly like /resolve-turn).
    // Auto-generated default inputs carry no negotiations, so this is a no-op there.
    const ineligible = ineligibleStaffNegotiations(scenario, session.state, baseInput);
    if (ineligible.length > 0) {
      throw new HeadlessIneligibleNegotiationError(ineligible);
    }
    const autoAcceptRisks = options.autoAcceptRisks === true || providedInput === undefined;
    const input = inputWithAcceptedRiskPolicy(session, baseInput, autoAcceptRisks, scenario);
    const result = resolveTurn(scenario, session.state, input);
    session = {
      ...session,
      revision: session.revision + 1,
      state: result.nextState,
      turnInputs: [...session.turnInputs, input],
      history: [...session.history, result],
      updatedAt: new Date().toISOString(),
    };
    turnSummaries.push({
      turn: input.turn,
      summary: result.summary,
      replayHash: result.replayHash,
      acceptedRisks: result.acceptedRisks,
      chiefPositions: result.chiefPositions.map((position) => ({
        chiefId: position.chiefId,
        memoId: position.memoId,
        optionId: position.optionId,
        position: position.position,
        staffReadoutEvidence: position.staffReadoutEvidence,
      })),
      chiefCoalitions: result.chiefCoalitions.map((coalition) => ({
        memoId: coalition.memoId,
        optionId: coalition.optionId,
        posture: coalition.posture,
        supportChiefIds: coalition.supportChiefIds,
        conditionalChiefIds: coalition.conditionalChiefIds,
        objectionChiefIds: coalition.objectionChiefIds,
        staffConstraintDirectorates: coalition.staffConstraintDirectorates,
        negotiationLevers: coalition.negotiationLevers,
      })),
      staffFunctions: result.staffFunctions.map((entry) => ({
        id: entry.id,
        status: entry.status,
        burdenPoints: entry.burdenPoints,
        capacity: entry.capacity,
        warnings: entry.warnings,
      })),
      staffModules: result.staffModules.map((entry) => ({ id: entry.id, status: entry.status, benefits: entry.benefits, pressures: entry.pressures })),
      coordinationLoad: result.coordinationLoad,
      afterAction: result.afterAction,
      triggeredEvents: result.triggeredEvents.map((event) => event.id),
      doctrineEvents: result.triggeredEvents.filter((event) => event.doctrineTrigger && event.causalContext).map((event) => ({
        eventId: event.id,
        title: event.title,
        sourceGeneId: event.doctrineTrigger!.sourceGeneId,
        betLabel: event.causalContext!.betLabel,
        maturedRiskLabel: event.causalContext!.maturedRiskLabel,
        vulnerability: event.doctrineTrigger!.vulnerability,
        evidenceRefs: event.doctrineTrigger!.evidenceRefs,
        conditions: event.doctrineTrigger!.conditions,
        sustainedTurns: event.doctrineTrigger!.sustainedTurns,
        staffFunctionRefs: event.causalContext!.staffFunctionRefs,
        acceptedRiskRefs: [
          ...(result.previousState.doctrineMaturity[event.id]?.acceptedRiskRefs ?? []),
          ...(result.input.acceptedRiskOverrides ?? [])
            .filter((risk) => event.causalContext!.staffFunctionRefs.includes(risk.staffFunctionId))
            .map((risk) => ({ turn: result.input.turn, staffFunctionId: risk.staffFunctionId, warningText: risk.warningText })),
        ].filter((risk, index, all) =>
          all.findIndex((candidate) => candidate.turn === risk.turn && candidate.staffFunctionId === risk.staffFunctionId && candidate.warningText === risk.warningText) === index,
        ),
        consequence: event.summary,
      })),
      internalTech: result.internalTech.map((node) => ({ id: node.id, level: node.level, progress: node.progress })),
      externalTech: result.externalTech.map((node) => ({
        id: node.id,
        level: node.level,
        estimatedLevel: node.estimate.estimatedLevel,
        confidence: node.estimate.confidence,
        visibility: node.estimate.visibility,
      })),
    });
  }

  const validation: ReplayValidation | undefined = options.validate ? validateReplaySession(scenario, session) : undefined;

  return {
    scenario: {
      id: scenario.id,
      title: scenario.title,
      contentVersion: scenario.contentVersion,
      staffModules: scenario.staffModules,
    },
    session: {
      id: session.id,
      turn: session.state.turn,
      status: session.state.campaignStatus,
      score: session.state.campaignScore,
      outcome: session.state.campaignOutcome,
      staffModules: session.history.at(-1)?.staffModules ?? [],
      coordinationLoad: session.history.at(-1)?.coordinationLoad ?? 0,
      staffFunctions: buildStaffFunctionReadouts(
        scenario.staffFunctions,
        buildDirectorateBurden(deriveDecisionMemos(scenario, session.state), [], scenario.staffCapacities, [], scenario.doctrineLens.burdenBias),
        session.state,
        scenario.doctrineLens.burdenBias,
      ),
      techTree: {
        internalTech: session.state.internalTech.map((node) => ({ id: node.id, level: node.level, progress: node.progress })),
        externalTech: session.state.externalTech.map((node) => ({
          id: node.id,
          level: node.level,
          estimatedLevel: node.estimate.estimatedLevel,
          confidence: node.estimate.confidence,
          visibility: node.estimate.visibility,
        })),
        fieldedCount: session.state.internalTech.filter((node) => node.level === 2).length,
        disruptedCount: session.state.externalTech.filter((node) => node.level === 0).length,
      },
    },
    turnSummaries,
    validation,
    sprites: options.includeSprites
      ? session.advisorRoster.map((advisor): HeadlessSpriteOutput => {
        const chief = scenario.chiefs.find((candidate) => candidate.id === advisor.chiefId);
        if (!chief) throw new Error(`Missing chief for advisor ${advisor.chiefId}`);
        const position = session.history.at(-1)?.chiefPositions.find((candidate) => candidate.chiefId === advisor.chiefId);
        const spec = buildChiefSpriteSpec({
          chief, portrait: advisor.portrait, sessionSeed: session.id,
          variantState: {
            trustBand: relationshipLabel(session.state.chiefTrust[chief.id] ?? 50),
            burdenLevel: position?.staffReadoutEvidence.burdenLevel ?? "light",
            campaignStatus: session.state.campaignStatus,
            s2ExternalEstimateConfidence: session.state.staffMechanics.s2.externalEstimateConfidence,
            s4SupportableTempo: session.state.staffMechanics.s4.supportableTempo,
          },
          visualLanguage: spriteVisualLanguage,
        });
        return {
          chiefId: advisor.chiefId,
          displayName: advisor.displayName,
          title: advisor.title,
          directorate: advisor.directorate,
          svg: buildAdvisorPortraitSvg(spec), spec,
          promptHash: hashPromptText(spec.prompt),
          negativePromptHash: hashPromptText(spec.negativePrompt),
        };
      })
      : undefined,
    sessionExport: session,
  };
}

function disabledScenario(): ScenarioDefinition {
  return scenarioDefinitionSchema.parse({
    ...soloScenario,
    doctrineProfile: { ...soloScenario.doctrineProfile, optionalStaffModules: [] },
    staffModules: [],
  });
}

// The ONE batch input policy (closing pass 6 P3): scenario-parameterized so the
// paired module-set cohorts share the exact same selection traces. All cohorts
// rotate their memo/option cycle on the DENSE per-cohort index
// (replicate = floor(ci / 4), dense 0..59). Pre-Doctrine-4 the cycle was the
// dense campaign index; under round-robin partitioning the balanced cohort's
// campaignIndex is sparse (ci ∈ {0,4,8,…}), which would pin a 4-option memo
// to option 0 forever (round-2 F2). replicate stays dense inside every cohort,
// so each posture option rotates uniformly; `ci` is used only for round-robin
// strategy assignment. Every 3rd replicate (replicate % 3 === 0) skips the
// optional memo; the rest include it, cycling its options independently of the
// skip pattern (optionalIncludeCount) so all options (including deception-grid
// at index 1) get equal selection frequency.
function batchInputForScenario(scenario: ScenarioDefinition, session: GameSession, replicate: number, strategyId: StrategyId): TurnInput {
  const memos = deriveDecisionMemos(scenario, session.state);
  const targeted: Record<StrategyId, Record<string, string>> = {
    "balanced-cycle": {},
    "coalition-commitment": { posture: "measured-deterrence", "intelligence-focus": "warning-net", "sustainment-focus": "repair-first", "alliance-frame": "public-assurance-tour" },
    "adaptive-cell-sprawl": { posture: "measured-deterrence", "intelligence-focus": "industrial-watch", "sustainment-focus": "lift-assurance", "alliance-frame": "quiet-reassurance", "force-development": "fires-prototype" },
    "sustainment-delay": { posture: "quiet-recovery", "intelligence-focus": "warning-net", "sustainment-focus": "repair-first", "alliance-frame": "quiet-reassurance" },
  };
  const optionalIncludeCount = replicate - Math.floor((replicate + 2) / 3);
  return {
    turn: session.state.turn, selectedActionIds: [], acceptedRiskOverrides: [], staffNegotiations: [],
    selections: memos.map((memo, index) => {
      const forced = targeted[strategyId][memo.id];
      if (forced) return { memoId: memo.id, optionId: forced };
      if (memo.optional && replicate % 3 === 0) return null;
      const optionIndex = memo.optional ? optionalIncludeCount % memo.options.length : (replicate + index) % memo.options.length;
      return { memoId: memo.id, optionId: memo.options[optionIndex]?.id ?? memo.options[0]?.id ?? "" };
    }).filter((entry): entry is { memoId: string; optionId: string } => entry !== null),
  };
}

function policyForScenario(scenario: ScenarioDefinition, session: GameSession, input: TurnInput): TurnInput {
  const preview = previewTurn(scenario, session.state, { ...input, acceptedRiskOverrides: [] });
  const mainEffort = [...preview.projectedResult.directorateBurden]
    .filter((entry) => entry.burdenPoints > 0)
    .sort((left, right) => right.burdenPoints - left.burdenPoints || left.directorate.localeCompare(right.directorate))[0]?.directorate;
  return {
    ...input,
    acceptedRiskOverrides: [...(input.acceptedRiskOverrides ?? []), ...preview.acceptedRiskCandidates],
    ...(mainEffort ? { commanderIntent: { mainEffort } } : {}),
  };
}

type EventSampleStat = { attempted: boolean; qualifying: boolean; fired: boolean; cost: number };
type BatchSample = {
  session: GameSession; turns: number; rawScore: number; final: CampaignState; strategyId: StrategyId;
  meanCoordination: number; incidentOffset: number; readinessOffset: number;
  eventStats: Record<string, EventSampleStat>;
  optionCounts: Record<string, number>; memoCounts: Record<string, number>;
  overloadCounts: Record<string, number>; acceptedRiskCounts: Record<string, number>;
  negotiations: number; fulfilled: number; broken: number;
  packetCounts: Record<string, number>; intentCounts: Partial<Record<DirectorateId, number>>;
  optionalOpportunities: number; optionalTaken: number; repeatedSelections: number; selectionTransitions: number;
};

function simulateBatchSample(scenario: ScenarioDefinition, campaignIndex: number, replicate: number, strategyId: StrategyId): BatchSample {
  let session: GameSession = createBatchSession(campaignIndex, scenario);
  let coordination = 0; let incidentOffset = 0; let readinessOffset = 0; let turns = 0;
  const eventStats: Record<string, EventSampleStat> = {};
  for (const event of scenario.events.filter((candidate) => candidate.doctrineTrigger)) eventStats[event.id] = { attempted: false, qualifying: false, fired: false, cost: 0 };
  const optionCounts: Record<string, number> = {}; const memoCounts: Record<string, number> = {};
  const overloadCounts: Record<string, number> = {}; const acceptedRiskCounts: Record<string, number> = {};
  const packetCounts: Record<string, number> = {}; const intentCounts: Partial<Record<DirectorateId, number>> = {};
  let optionalOpportunities = 0; let optionalTaken = 0; let repeatedSelections = 0; let selectionTransitions = 0;
  let priorSelections = new Set<string>();
  let negotiations = 0;
  while (session.state.campaignStatus === "active" && session.state.turn <= scenario.maxTurns) {
    const base = batchInputForScenario(scenario, session, replicate, strategyId);
    const input = policyForScenario(scenario, session, base);
    const packet = input.selections.map((selection) => `${selection.memoId}:${selection.optionId}`).sort();
    const packetKey = packet.join("|");
    packetCounts[packetKey] = (packetCounts[packetKey] ?? 0) + 1;
    if (input.commanderIntent) intentCounts[input.commanderIntent.mainEffort] = (intentCounts[input.commanderIntent.mainEffort] ?? 0) + 1;
    const optionalMemos = deriveDecisionMemos(scenario, session.state).filter((memo) => memo.optional);
    optionalOpportunities += optionalMemos.length;
    optionalTaken += optionalMemos.filter((memo) => input.selections.some((selection) => selection.memoId === memo.id)).length;
    if (turns > 0) {
      selectionTransitions += packet.length;
      repeatedSelections += packet.filter((selection) => priorSelections.has(selection)).length;
    }
    priorSelections = new Set(packet);
    const selectedTags = new Set(input.selections.flatMap((selection) => memosForSelection(scenario, session.state, selection)));
    for (const selection of input.selections) {
      const key = `${selection.memoId}:${selection.optionId}`;
      optionCounts[key] = (optionCounts[key] ?? 0) + 1;
      memoCounts[selection.memoId] = (memoCounts[selection.memoId] ?? 0) + 1;
    }
    negotiations += input.staffNegotiations?.length ?? 0;
    for (const event of scenario.events.filter((candidate) => candidate.doctrineTrigger)) {
      const stat = eventStats[event.id]!;
      stat.attempted ||= event.triggerTags.every((tag) => selectedTags.has(tag));
      stat.qualifying ||= doctrineEventEligible(event, session.state, selectedTags);
    }
    const result = resolveTurn(scenario, session.state, input);
    turns += 1; coordination += result.coordinationLoad;
    if (result.coordinationLoad > 0) { incidentOffset += 1.25 * result.coordinationLoad; readinessOffset -= 0.75 * result.coordinationLoad; }
    for (const burden of result.directorateBurden) if (burden.burdenLevel === "overloaded") overloadCounts[burden.directorate] = (overloadCounts[burden.directorate] ?? 0) + 1;
    for (const risk of result.acceptedRisks) if (risk.accepted) acceptedRiskCounts[risk.staffFunctionId] = (acceptedRiskCounts[risk.staffFunctionId] ?? 0) + 1;
    for (const event of result.triggeredEvents.filter((candidate) => candidate.doctrineTrigger)) {
      const stat = eventStats[event.id];
      if (stat) { stat.fired = true; stat.cost += doctrineEventCostMass(event); }
    }
    session = { ...session, revision: session.revision + 1, state: result.nextState, turnInputs: [...session.turnInputs, input], history: [...session.history, result] };
  }
  let fulfilled = 0; let broken = 0;
  for (const commitment of session.state.activeCommitments) { if (commitment.fulfilled === true) fulfilled += 1; else if (commitment.fulfilled === false) broken += 1; }
  return { session, turns, rawScore: rawCampaignScore(session.state), final: session.state, strategyId, meanCoordination: turns ? coordination / turns : 0, incidentOffset, readinessOffset, eventStats, optionCounts, memoCounts, overloadCounts, acceptedRiskCounts, negotiations, fulfilled, broken, packetCounts, intentCounts, optionalOpportunities, optionalTaken, repeatedSelections, selectionTransitions };
}

function moduleRow(scenario: ScenarioDefinition, moduleSet: "enabled" | "disabled", strategyId: StrategyId, samples: BatchSample[]): ModuleSetTelemetry {
  const n = samples.length; const sum = (fn: (s: CampaignState) => number) => n ? samples.reduce((a, s) => a + fn(s.final), 0) / n : 0;
  const wins = samples.filter((s) => s.final.campaignStatus === "won").length;
  const events = samples.reduce((a, s) => a + Object.values(s.eventStats).reduce((n, event) => n + (event.fired ? 1 : 0), 0), 0);
  const costs = samples.reduce((a, s) => a + Object.values(s.eventStats).reduce((n, event) => n + event.cost, 0), 0);
  return {
    profileId: scenario.doctrineProfile.id, strategyId, moduleSet, pairCount: n, simulationCount: n,
    campaigns: n, meanScore: n ? samples.reduce((a, s) => a + s.final.campaignScore, 0) / n : 0, winRate: n ? wins / n : 0,
    meanRawScore: n ? samples.reduce((a, s) => a + s.rawScore, 0) / n : 0,
    meanDoctrineEvents: n ? events / n : 0, meanDoctrineEventCostMass: n ? costs / n : 0, doctrineCampaignHitRate: n ? samples.filter((s) => Object.values(s.eventStats).some((event) => event.fired)).length / n : 0,
    meanDeployableUnits: sum((s) => s.strategic.forceGeneration.deployableUnits), meanPoliticalAlignment: sum((s) => s.strategic.alliance.politicalAlignment), meanCabinetCover: sum((s) => s.strategic.domestic.cabinetCover), meanIncidentLadder: sum((s) => s.strategic.escalation.incidentLadder), meanReserveStrain: sum((s) => s.strategic.forceGeneration.reserveStrain),
    meanRecoveryDebt: sum((s) => s.staffMechanics.s1.recoveryDebt), meanSupportableTempo: sum((s) => s.staffMechanics.s4.supportableTempo), meanSystemPressure: sum((s) => s.doctrineMechanics.systemPressure), meanStaffSynchronization: sum((s) => s.doctrineMechanics.staffSynchronization),
    meanCoordinationLoad: n ? Number((samples.reduce((a, s) => a + s.meanCoordination, 0) / n).toFixed(2)) : 0, requestedCoordinationIncidentOffset: samples.reduce((a, s) => a + s.incidentOffset, 0), requestedCoordinationReadinessOffset: samples.reduce((a, s) => a + s.readinessOffset, 0), lostCampaigns: samples.filter((s) => s.final.campaignStatus === "lost").length, activeCampaigns: samples.filter((s) => s.final.campaignStatus === "active").length, wonCampaigns: samples.filter((s) => s.final.campaignStatus === "won").length,
  };
}

/** Paired Doctrine 5 telemetry: every campaign index runs enabled and disabled with identical strategy/seed/traces. */
export async function runHeadlessBatch(campaignCount: number): Promise<BalanceTelemetry> {
  const disabled = disabledScenario(); const deltas: PairedModuleDelta[] = [];
  const allRows: ModuleSetTelemetry[] = [];
  const enabledSamplesAll: BatchSample[] = []; const disabledSamplesAll: BatchSample[] = [];
  for (const strategyId of orderedStrategies) {
    const enabledSamples: BatchSample[] = []; const disabledSamples: BatchSample[] = [];
    for (let replicate = 0; replicate < Math.ceil(campaignCount / orderedStrategies.length); replicate += 1) {
      const ci = replicate * orderedStrategies.length + orderedStrategies.indexOf(strategyId);
      if (ci >= campaignCount) continue;
      enabledSamples.push(simulateBatchSample(soloScenario, ci, replicate, strategyId));
      disabledSamples.push(simulateBatchSample(disabled, ci, replicate, strategyId));
    }
    const enabledRow = moduleRow(soloScenario, "enabled", strategyId, enabledSamples); const disabledRow = moduleRow(disabled, "disabled", strategyId, disabledSamples);
    enabledSamplesAll.push(...enabledSamples); disabledSamplesAll.push(...disabledSamples);
    allRows.push(enabledRow, disabledRow);
    deltas.push({ strategyId, meanScoreDelta: enabledRow.meanScore - disabledRow.meanScore, winRateDelta: enabledRow.winRate - disabledRow.winRate, meanIncidentLadderDelta: enabledRow.meanIncidentLadder - disabledRow.meanIncidentLadder, meanStaffSynchronizationDelta: enabledRow.meanStaffSynchronization - disabledRow.meanStaffSynchronization });
  }
  const enabled = allRows.filter((r) => r.moduleSet === "enabled"); const allSamples = enabled.reduce((a, r) => a + r.campaigns, 0);
  const first = enabled[0];
  const two = scenarioDefinitionSchema.parse({ ...soloScenario, doctrineProfile: { ...soloScenario.doctrineProfile, optionalStaffModules: ["J6", "J8"] }, staffModules: staffModuleDefinitions.filter((d) => d.id === "J6" || d.id === "J8") });
  const seven = scenarioDefinitionSchema.parse({ ...soloScenario, doctrineProfile: { ...soloScenario.doctrineProfile, optionalStaffModules: ["J6", "J7", "J8", "J9", "STRATCOM", "MED", "ENGINEER"] }, staffModules: [...staffModuleDefinitions] });
  const twoSamples: BatchSample[] = []; const sevenSamples: BatchSample[] = [];
  for (let ci = 0; ci < campaignCount; ci += 1) { const strategyId = orderedStrategies[ci % orderedStrategies.length]!; const replicate = Math.floor(ci / orderedStrategies.length); twoSamples.push(simulateBatchSample(two, ci, replicate, strategyId)); sevenSamples.push(simulateBatchSample(seven, ci, replicate, strategyId)); }
  const meanState = (samples: BatchSample[], fn: (state: CampaignState) => number) => samples.length ? samples.reduce((a, s) => a + fn(s.final), 0) / samples.length : 0;
  const twoVsSevenCalibration = { meanIncidentLadderDelta: meanState(sevenSamples, (s) => s.strategic.escalation.incidentLadder) - meanState(twoSamples, (s) => s.strategic.escalation.incidentLadder), meanStaffSynchronizationDelta: meanState(sevenSamples, (s) => s.doctrineMechanics.staffSynchronization) - meanState(twoSamples, (s) => s.doctrineMechanics.staffSynchronization), meanScoreDelta: sevenSamples.length ? sevenSamples.reduce((a, s) => a + s.final.campaignScore, 0) / sevenSamples.length - twoSamples.reduce((a, s) => a + s.final.campaignScore, 0) / twoSamples.length : 0, winRateDelta: sevenSamples.length ? sevenSamples.filter((s) => s.final.campaignStatus === "won").length / sevenSamples.length - twoSamples.filter((s) => s.final.campaignStatus === "won").length / twoSamples.length : 0 };
  const balanceWarnings = first && first.meanCoordinationLoad === 0.4 ? [] : ["enabled coordination load is not 0.40"];
  if (campaignCount < 240) balanceWarnings.unshift("Doctrine balance gates are calibrated for --batch 240 or larger.");
  if (allRows.some((r) => r.campaigns !== Math.ceil(campaignCount / 4))) balanceWarnings.push("paired module-set cell counts are uneven");
  if (campaignCount >= 240 && (twoVsSevenCalibration.meanIncidentLadderDelta < 2 || twoVsSevenCalibration.meanStaffSynchronizationDelta > -6 || twoVsSevenCalibration.meanScoreDelta > 2 || twoVsSevenCalibration.winRateDelta > 0.05)) balanceWarnings.push("two-vs-seven calibration gate failed");
  const strategyRows = [...enabled].sort((a, b) => a.strategyId.localeCompare(b.strategyId));
  const enabledRowsForGate = allRows.filter((row) => row.moduleSet === "enabled");
  const disabledRowsForGate = allRows.filter((row) => row.moduleSet === "disabled");
  const strategyOptionSelectionRates: Record<string, OptionRate[]> = {};
  for (const strategyId of orderedStrategies) {
    const counts = new Map<string, number>(); const totals = new Map<string, number>();
    for (let replicate = 0; replicate < Math.ceil(campaignCount / 4); replicate += 1) {
      const ci = replicate * 4 + orderedStrategies.indexOf(strategyId); if (ci >= campaignCount) continue;
      const session = { ...createInitialGameSession(soloScenario, `telemetry-${ci}`), id: `telemetry-${ci}` };
      for (const selection of batchInputForScenario(soloScenario, session, replicate, strategyId).selections) { const key = `${selection.memoId}:${selection.optionId}`; counts.set(key, (counts.get(key) ?? 0) + 1); totals.set(selection.memoId, (totals.get(selection.memoId) ?? 0) + 1); }
    }
    strategyOptionSelectionRates[strategyId] = [...counts.entries()].map(([key, count]) => { const [memoId, optionId] = key.split(":"); return { memoId, optionId, selectionRate: count / (totals.get(memoId) ?? 1) }; }).sort((a, b) => a.optionId.localeCompare(b.optionId) || a.memoId.localeCompare(b.memoId));
  }
  const allEnabledOptionCounts: Record<string, number> = {}; const allEnabledMemoCounts: Record<string, number> = {};
  for (const sample of enabledSamplesAll) for (const [key, count] of Object.entries(sample.optionCounts)) allEnabledOptionCounts[key] = (allEnabledOptionCounts[key] ?? 0) + count;
  for (const sample of enabledSamplesAll) for (const [key, count] of Object.entries(sample.memoCounts)) allEnabledMemoCounts[key] = (allEnabledMemoCounts[key] ?? 0) + count;
  const optionSelectionRates = Object.entries(allEnabledOptionCounts).map(([key, count]) => { const [memoId, optionId] = key.split(":"); return { memoId, optionId, selectionRate: count / (allEnabledMemoCounts[memoId] ?? 1) }; }).sort((a, b) => b.selectionRate - a.selectionRate);
  const doctrineEvents: DoctrineEventTelemetry[] = [];
  for (const moduleSet of ["enabled", "disabled"] as const) {
    for (const strategyId of orderedStrategies) {
      const samples = (moduleSet === "enabled" ? enabledSamplesAll : disabledSamplesAll).filter((sample) => sample.strategyId === strategyId);
      for (const event of (moduleSet === "enabled" ? soloScenario : disabled).events.filter((candidate) => candidate.doctrineTrigger)) {
        if (targetStrategyForEvent(event.id) !== strategyId) continue;
        const stats = samples.map((sample) => sample.eventStats[event.id]!).filter(Boolean);
        const attempted = stats.filter((stat) => stat.attempted).length;
        const qualifying = stats.filter((stat) => stat.qualifying).length;
        const fired = stats.filter((stat) => stat.fired).length;
        doctrineEvents.push({ eventId: event.id, sourceGeneId: event.doctrineTrigger!.sourceGeneId, strategyId, moduleSet, attemptedCampaigns: attempted, qualifyingCampaigns: qualifying, firedCampaigns: fired, campaignHitRate: samples.length ? fired / samples.length : 0, maturationRate: attempted ? qualifying / attempted : 0, firingReliability: qualifying ? fired / qualifying : 0 });
      }
    }
  }
  doctrineEvents.sort((a, b) => a.eventId.localeCompare(b.eventId) || `${a.moduleSet}:${a.strategyId}`.localeCompare(`${b.moduleSet}:${b.strategyId}`));
  if (campaignCount >= 240) {
    if (enabledSamplesAll.some((sample) => sample.session.history.some((result) => result.coordinationLoad !== 0.4))) balanceWarnings.push("an enabled result did not report coordination load 0.40");
    if (disabledSamplesAll.some((sample) => sample.session.history.some((result) => result.coordinationLoad !== 0))) balanceWarnings.push("a disabled result reported non-zero coordination load");
    for (const event of doctrineEvents) {
      // Evaluate each enabled/disabled cell independently. A cell with no
      // qualifying attempts is not a passing gate: it is missing evidence and
      // must remain visible in telemetry rather than being silently skipped.
      if (event.attemptedCampaigns === 0 || event.maturationRate < 0.70 || event.maturationRate > 1 || event.firingReliability !== 1) balanceWarnings.push(`${event.moduleSet} ${event.strategyId} ${event.eventId} failed doctrine maturation/reliability gate`);
    }
    for (const row of allRows.filter((candidate) => candidate.strategyId === "balanced-cycle")) {
      if (row.doctrineCampaignHitRate <= 0 || row.doctrineCampaignHitRate >= 0.85) balanceWarnings.push(`${row.moduleSet} ${row.strategyId} failed balanced doctrine hit-rate gate`);
    }
    for (const row of enabledRowsForGate) {
      const other = disabledRowsForGate.find((candidate) => candidate.strategyId === row.strategyId);
      if (!other) continue;
      if ((row.meanScore - other.meanScore > 5 && row.winRate - other.winRate > 0.10) || (row.meanScore >= 100 && row.winRate >= 1 && (other.meanScore < 100 || other.winRate < 1))) balanceWarnings.push(`${row.strategyId} enabled module dominance gate failed`);
    }
    if (!enabledRowsForGate.some((row) => Math.abs(row.meanScore - (disabledRowsForGate.find((candidate) => candidate.strategyId === row.strategyId)?.meanScore ?? row.meanScore)) >= 0.5 || Math.abs(row.winRate - (disabledRowsForGate.find((candidate) => candidate.strategyId === row.strategyId)?.winRate ?? row.winRate)) >= 0.02)) balanceWarnings.push("enabled modules produced no observed direct-outcome movement");
    if (!(enabledRowsForGate.some((row) => Math.abs(row.meanSystemPressure - (disabledRowsForGate.find((candidate) => candidate.strategyId === row.strategyId)?.meanSystemPressure ?? row.meanSystemPressure)) > 0) || enabledRowsForGate.some((row) => Math.abs(row.meanStaffSynchronization - (disabledRowsForGate.find((candidate) => candidate.strategyId === row.strategyId)?.meanStaffSynchronization ?? row.meanStaffSynchronization)) > 0))) balanceWarnings.push("enabled modules produced no observed indirect-lane movement");
    if (enabledRowsForGate.some((row) => row.requestedCoordinationIncidentOffset <= 0 || row.requestedCoordinationReadinessOffset >= 0)) balanceWarnings.push("coordination signs are not incident-positive/readiness-negative");
    // D4 dominance warnings (restored, spec F correction #21 / telemetry acceptance #2):
    // evaluated per module set against each set's OWN balanced-cycle cohort. Neither this
    // detector nor the module-pair detector below replaces the other.
    for (const rowsIn of [enabledRowsForGate, disabledRowsForGate]) {
      const balancedIn = rowsIn.find((entry) => entry.strategyId === "balanced-cycle");
      if (!balancedIn) continue;
      // A >50pp win-rate advantage at the 100 score ceiling that persists despite
      // positive authored event cost means the event's adverse deltas are not
      // observed in score/win terms — surface it so the signal cannot go unseen.
      for (const entry of rowsIn) {
        if (entry.strategyId !== "balanced-cycle" && entry.meanDoctrineEventCostMass > 0 && entry.meanScore >= 100 && entry.winRate > balancedIn.winRate + 0.50) {
          balanceWarnings.push(`${entry.moduleSet} ${entry.strategyId} holds a ${Math.round((entry.winRate - balancedIn.winRate) * 100)}pp win-rate advantage over balanced at the 100 score ceiling despite positive doctrine event cost; authored adverse deltas are not observed.`);
        }
        // Hardened-ceiling warning: winRate 1.0 AND meanScore at the 100 ceiling is a
        // literally unbeatable overuse strategy — no-tradeoff by definition, regardless
        // of authored cost mass.
        if (entry.strategyId !== "balanced-cycle" && entry.winRate >= 1.0 && entry.meanScore >= 100) {
          balanceWarnings.push(`${entry.moduleSet} ${entry.strategyId} wins every campaign at the 100 score ceiling despite doctrine event cost; a no-tradeoff overuse strategy under the hardened dominance rule.`);
        }
      }
    }
  }
  const legacyRows = strategyRows;
  const totalTurns = enabledSamplesAll.reduce((sum, sample) => sum + sample.turns, 0);
  const allScores = enabledSamplesAll.map((sample) => sample.final.campaignScore).sort((a, b) => a - b);
  const allOverloads: Record<string, number> = {}; const allRisks: Record<string, number> = {};
  let negotiations = 0; let fulfilled = 0; let broken = 0;
  for (const sample of enabledSamplesAll) { for (const [key, count] of Object.entries(sample.overloadCounts)) allOverloads[key] = (allOverloads[key] ?? 0) + count; for (const [key, count] of Object.entries(sample.acceptedRiskCounts)) allRisks[key] = (allRisks[key] ?? 0) + count; negotiations += sample.negotiations; fulfilled += sample.fulfilled; broken += sample.broken; }
  const overloadFrequency = Object.fromEntries(Object.entries(allOverloads).map(([key, value]) => [key, totalTurns ? value / totalTurns : 0]));
  const acceptedRiskFrequency = Object.fromEntries(Object.entries(allRisks).map(([key, value]) => [key, totalTurns ? value / totalTurns : 0]));
  const commitmentTotal = fulfilled + broken;
  const packetTotals = new Map<string, { turns: number; campaigns: BatchSample[] }>();
  const intentTotals = new Map<DirectorateId, { turns: number; campaigns: BatchSample[] }>();
  const programmeCompletions: Record<string, number> = {};
  const collapseReasons: Record<string, number> = {};
  let optionalOpportunities = 0; let optionalTaken = 0; let repeatedSelections = 0; let selectionTransitions = 0;
  for (const sample of enabledSamplesAll) {
    optionalOpportunities += sample.optionalOpportunities; optionalTaken += sample.optionalTaken;
    repeatedSelections += sample.repeatedSelections; selectionTransitions += sample.selectionTransitions;
    for (const [packetId, turns] of Object.entries(sample.packetCounts)) {
      const entry = packetTotals.get(packetId) ?? { turns: 0, campaigns: [] };
      entry.turns += turns; entry.campaigns.push(sample); packetTotals.set(packetId, entry);
    }
    for (const [mainEffort, turns] of Object.entries(sample.intentCounts) as [DirectorateId, number][]) {
      const entry = intentTotals.get(mainEffort) ?? { turns: 0, campaigns: [] };
      entry.turns += turns; entry.campaigns.push(sample); intentTotals.set(mainEffort, entry);
    }
    for (const programme of sample.final.capabilityPrograms) if (programme.phase === "operational") programmeCompletions[programme.id] = (programmeCompletions[programme.id] ?? 0) + 1;
    if (sample.final.campaignStatus === "lost") {
      const reason = sample.final.campaignOutcome ?? "unclassified-loss";
      collapseReasons[reason] = (collapseReasons[reason] ?? 0) + 1;
    }
  }
  const packetFamilies = [...packetTotals.entries()].map(([packetId, entry]) => {
    const campaigns = [...new Set(entry.campaigns)];
    return { packetId, selections: packetId.split("|"), turns: entry.turns, campaigns: campaigns.length, winRate: campaigns.length ? campaigns.filter((sample) => sample.final.campaignStatus === "won").length / campaigns.length : 0, meanScore: campaigns.length ? campaigns.reduce((sum, sample) => sum + sample.final.campaignScore, 0) / campaigns.length : 0 };
  }).sort((left, right) => right.turns - left.turns || left.packetId.localeCompare(right.packetId));
  const intentFamilies = [...intentTotals.entries()].map(([mainEffort, entry]) => {
    const campaigns = [...new Set(entry.campaigns)];
    return { mainEffort, turns: entry.turns, campaigns: campaigns.length, winRate: campaigns.length ? campaigns.filter((sample) => sample.final.campaignStatus === "won").length / campaigns.length : 0, meanScore: campaigns.length ? campaigns.reduce((sum, sample) => sum + sample.final.campaignScore, 0) / campaigns.length : 0 };
  }).sort((left, right) => left.mainEffort.localeCompare(right.mainEffort));
  const overloadProfileByStrategy = Object.fromEntries(orderedStrategies.map((strategyId) => {
    const samples = enabledSamplesAll.filter((sample) => sample.strategyId === strategyId);
    const overloadedTurns = samples.reduce((sum, sample) => sum + Object.values(sample.overloadCounts).reduce((inner, count) => inner + count, 0), 0);
    const turns = samples.reduce((sum, sample) => sum + sample.turns, 0);
    return [strategyId, turns ? overloadedTurns / turns : 0];
  }));
  const programmeCompletionRates = Object.fromEntries(soloScenario.capabilityPrograms.map((programme) => [programme.id, enabledSamplesAll.length ? (programmeCompletions[programme.id] ?? 0) / enabledSamplesAll.length : 0]));
  const scoreStats = { min: allScores[0] ?? 0, max: allScores.at(-1) ?? 0, mean: allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0, p25: percentile(allScores, 25), p75: percentile(allScores, 75) };
  // D4 doctrine-strategy dominance detector (restored — spec F correction #21 / telemetry
  // acceptance #2): scoped WITHIN each module set, so the enabled and disabled sets are
  // each evaluated independently against their own balanced-cycle cohort. An overuse
  // strategy is dominant when it beats balanced by >5 mean score AND >10pp win rate with
  // no higher doctrine-event cost mass, or when it sits at the 100/100 ceiling (winRate
  // 1.0 AND meanScore 100) — literally unbeatable, regardless of authored cost. The
  // module-pair detector below is a SEPARATE Doctrine 5 addition; neither replaces the
  // other.
  const adequateN = campaignCount >= 240 && allRows.every((entry) => entry.campaigns >= 60);
  const doctrineDominantWithin = (rowsIn: ModuleSetTelemetry[]): string[] => {
    const balanced = rowsIn.find((entry) => entry.strategyId === "balanced-cycle");
    if (!adequateN || !balanced) return [];
    return rowsIn
      .filter((entry) =>
        entry.strategyId !== "balanced-cycle" &&
        ((entry.winRate >= 1.0 && entry.meanScore >= 100) ||
          (entry.meanScore > balanced.meanScore + 5 && entry.winRate > balanced.winRate + 0.10 && entry.meanDoctrineEventCostMass <= balanced.meanDoctrineEventCostMass)),
      )
      .map((entry) => `${entry.moduleSet} ${entry.strategyId}`)
      .sort();
  };
  const dominantDoctrineStrategies = [...doctrineDominantWithin(enabledRowsForGate), ...doctrineDominantWithin(disabledRowsForGate)];
  // Doctrine 5 module-pair detector: an enabled strategy dominating its own disabled twin
  // (identical strategy, seeds, and trace). DISTINCT field — not a replacement for the D4
  // doctrine-strategy gate above.
  const modulePairDominance = enabledRowsForGate
    .filter((row) => {
      const other = disabledRowsForGate.find((candidate) => candidate.strategyId === row.strategyId);
      return !!other && ((row.meanScore - other.meanScore > 5 && row.winRate - other.winRate > 0.10) || (row.meanScore >= 100 && row.winRate >= 1 && (other.meanScore < 100 || other.winRate < 1)));
    })
    .map((row) => row.strategyId)
    .sort();
  return {
    campaignCount, pairCount: allSamples, simulationCount: allSamples * 2, moduleSetRows: allRows, pairedDeltas: deltas,
    twoVsSevenCalibration,
    totalTurns, outcomeDistribution: { won: enabled.reduce((a, r) => a + r.wonCampaigns, 0), lost: enabled.reduce((a, r) => a + r.lostCampaigns, 0), active: enabled.reduce((a, r) => a + r.activeCampaigns, 0) }, scoreStats, overloadFrequency, acceptedRiskFrequency, negotiationFrequency: campaignCount ? negotiations / campaignCount : 0, commitmentFulfillmentRate: commitmentTotal ? fulfilled / commitmentTotal : null, commitmentBreachRate: commitmentTotal ? broken / commitmentTotal : null, optionSelectionRates, dominantOptions: optionSelectionRates.filter((entry) => entry.selectionRate > 0.75), strategyOptionSelectionRates, packetFamilies, intentFamilies, optionalMemoTakeRate: optionalOpportunities ? optionalTaken / optionalOpportunities : 0, repeatedOptionLoopRate: selectionTransitions ? repeatedSelections / selectionTransitions : 0, overloadProfileByStrategy, programmeCompletionRates, collapseReasons, doctrineEvents, doctrineStrategies: legacyRows, dominantDoctrineStrategies, modulePairDominance, balanceWarnings,
  };
}
