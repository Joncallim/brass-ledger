import { doctrineEventCostMass, soloScenario } from "@brass-ledger/content";
import { randomUUID } from "node:crypto";
import {
  buildAdvisorPortraitSvg,
  buildDirectorateBurden,
  buildStaffFunctionReadouts,
  createInitialGameSession,
  type AcceptedRiskOverride,
  type GameSession,
  type ReplayValidation,
  type TurnInput,
} from "@brass-ledger/shared";
import { deriveDecisionMemos, doctrineEventEligible, previewTurn, resolveTurn, validateReplaySession } from "@brass-ledger/sim";

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
  doctrineEvents: DoctrineEventTelemetry[];
  doctrineStrategies: DoctrineStrategyTelemetry[];
  dominantDoctrineStrategies: string[];
  balanceWarnings: string[];
};

export type DoctrineEventTelemetry = {
  eventId: string;
  sourceGeneId: string;
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
  turns?: number;
  session?: GameSession;
  inputs?: TurnInput[];
  validate?: boolean;
  includeSprites?: boolean;
  autoAcceptRisks?: boolean;
};

export class HeadlessAcceptedRiskError extends Error {
  readonly acceptedRiskCandidates: AcceptedRiskOverride[];

  constructor(acceptedRiskCandidates: AcceptedRiskOverride[]) {
    super("Headless turn requires explicit acceptedRiskOverrides for projected S1-S5 staff warnings.");
    this.name = "HeadlessAcceptedRiskError";
    this.acceptedRiskCandidates = acceptedRiskCandidates;
  }
}

function defaultInput(session: GameSession): TurnInput {
  const memos = deriveDecisionMemos(soloScenario, session.state);
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

export function acceptedRiskCandidatesForInput(session: GameSession, input: TurnInput) {
  return previewTurn(soloScenario, session.state, { ...input, acceptedRiskOverrides: [] }).acceptedRiskCandidates;
}

function inputWithAcceptedRiskPolicy(session: GameSession, input: TurnInput, autoAcceptRisks: boolean) {
  const accepted = new Set((input.acceptedRiskOverrides ?? []).map(riskKey));
  const missing = acceptedRiskCandidatesForInput(session, input).filter((candidate) => !accepted.has(riskKey(candidate)));
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
export function replicateSeedFor(replicate: number): number {
  return soloScenario.initialState.seed + replicate * 1009;
}

/** Builds a batch campaign session with the paired replicate seed applied to state and initialState. */
export function createBatchSession(campaignIndex: number): GameSession {
  const replicate = Math.floor(campaignIndex / orderedStrategies.length);
  const session: GameSession = { ...createInitialGameSession(soloScenario, `batch-${campaignIndex}`), id: `batch-${campaignIndex}` };
  session.state.seed = replicateSeedFor(replicate);
  session.initialState.seed = replicateSeedFor(replicate);
  return session;
}

function batchInput(session: GameSession, campaignIndex: number, replicate: number, strategyId: StrategyId): TurnInput {
  const memos = deriveDecisionMemos(soloScenario, session.state);
  // The balanced policy preserves the pre-Doctrine-4 cycling driven by the campaign
  // index (ci); replicate only drives seeds. Targeted policies rotate non-target memos
  // by replicate so every targeted cohort sees the same optional-memo rotation.
  const cycle = strategyId === "balanced-cycle" ? campaignIndex : replicate;
  // Track how many campaigns have actually included the optional memo so far.
  // Every 3rd campaign (ci % 3 === 0) skips it; the rest include it.
  // Formula: campaigns included = ci - floor((ci + 2) / 3)
  // This lets us cycle through the optional memo's options independently of the skip pattern,
  // so all options (including deception-grid at index 1) get equal selection frequency.
  const optionalIncludeCount = cycle - Math.floor((cycle + 2) / 3);
  const targeted: Record<StrategyId, Record<string, string>> = {
    "balanced-cycle": {},
    "coalition-commitment": { posture: "measured-deterrence", "intelligence-focus": "warning-net", "sustainment-focus": "repair-first", "alliance-frame": "public-assurance-tour" },
    "adaptive-cell-sprawl": { posture: "measured-deterrence", "intelligence-focus": "industrial-watch", "sustainment-focus": "lift-assurance", "alliance-frame": "modernization-case", "force-development": "fires-prototype" },
    "sustainment-delay": { posture: "quiet-recovery", "intelligence-focus": "warning-net", "sustainment-focus": "repair-first", "alliance-frame": "quiet-reassurance" },
  };
  return {
    turn: session.state.turn,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    staffNegotiations: [],
    selections: memos.map((memo, memoIndex) => {
      if (targeted[strategyId][memo.id]) return { memoId: memo.id, optionId: targeted[strategyId][memo.id] };
      if (memo.optional) {
        if (cycle % 3 === 0) return null;
        const optionId = memo.options[optionalIncludeCount % memo.options.length]?.id ?? "";
        return { memoId: memo.id, optionId };
      }
      const optionIndex = (cycle + memoIndex) % memo.options.length;
      return { memoId: memo.id, optionId: memo.options[optionIndex]?.id ?? memo.options[0]?.id ?? "" };
    }).filter((sel): sel is { memoId: string; optionId: string } => sel !== null),
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

export async function runHeadlessBatch(campaignCount: number): Promise<BalanceTelemetry> {
  const strategies: StrategyId[] = orderedStrategies;
  const outcomes = { won: 0, lost: 0, active: 0 };
  const scores: number[] = [];
  const overloadTurns: Record<string, number> = {};
  const acceptedRiskTurns: Record<string, number> = {};
  let totalNegotiations = 0;
  let totalTurns = 0;
  let totalFulfilled = 0;
  let totalBroken = 0;
  const optionCounts: Record<string, number> = {};
  const memoCampaignCounts: Record<string, number> = {};
  const eventStats = new Map<string, { attempted: number; qualifying: number; fired: number }>();
  // Doctrine fires are attributed to the CURRENT campaign's strategy regardless of the
  // event's authored target mapping, so the balanced cohort's fires are visible too.
  const strategyStats = new Map<StrategyId, { campaigns: number; score: number; wins: number; events: number; cost: number; doctrineCampaigns: number }>();
  // Fires of each doctrine event inside balanced-cycle campaigns, for the <0.85 gate.
  const balancedEventFires = new Map<string, number>();
  for (const event of soloScenario.events.filter((candidate) => candidate.doctrineTrigger)) eventStats.set(event.id, { attempted: 0, qualifying: 0, fired: 0 });

  for (let ci = 0; ci < campaignCount; ci += 1) {
    const strategyId = strategies[ci % strategies.length];
    const replicate = Math.floor(ci / strategies.length);
    let session: GameSession = createBatchSession(ci);
    const strategy = strategyStats.get(strategyId) ?? { campaigns: 0, score: 0, wins: 0, events: 0, cost: 0, doctrineCampaigns: 0 };
    strategy.campaigns += 1;
    strategyStats.set(strategyId, strategy);
    const campaignEventIds = new Set<string>();
    const campaignAttemptIds = new Set<string>();
    const campaignQualifyingIds = new Set<string>();
    let campaignFiredAnyDoctrine = false;

    while (session.state.campaignStatus === "active" && session.state.turn <= soloScenario.maxTurns) {
      const base = batchInput(session, ci, replicate, strategyId);
      const input = inputWithAcceptedRiskPolicy(session, base, true);
      const selectedTags = new Set(input.selections.flatMap((selection) => memosForSelection(soloScenario, session.state, selection)));
      const result = resolveTurn(soloScenario, session.state, input);
      totalTurns += 1;
      for (const event of soloScenario.events.filter((candidate) => candidate.doctrineTrigger)) {
        const fired = result.triggeredEvents.some((triggered) => triggered.id === event.id);
        if (event.triggerTags.every((tag) => selectedTags.has(tag))) campaignAttemptIds.add(event.id);
        // Qualifying means the event was actually eligible to fire this turn,
        // including the pre-turn predicate and mature streak—not merely that a
        // new one-turn streak happened to be written.
        if (doctrineEventEligible(event, session.state, selectedTags)) campaignQualifyingIds.add(event.id);
        if (fired) {
          campaignEventIds.add(event.id);
          strategy.events += 1;
          strategy.cost += doctrineEventCostMass(event);
          campaignFiredAnyDoctrine = true;
          if (strategyId === "balanced-cycle") balancedEventFires.set(event.id, (balancedEventFires.get(event.id) ?? 0) + 1);
        }
      }

      for (const burden of result.directorateBurden) {
        if (burden.burdenLevel === "overloaded") {
          overloadTurns[burden.directorate] = (overloadTurns[burden.directorate] ?? 0) + 1;
        }
      }
      for (const risk of result.acceptedRisks) {
        if (risk.accepted) {
          acceptedRiskTurns[risk.staffFunctionId] = (acceptedRiskTurns[risk.staffFunctionId] ?? 0) + 1;
        }
      }
      totalNegotiations += (input.staffNegotiations ?? []).length;

      for (const sel of input.selections) {
        const key = `${sel.memoId}:${sel.optionId}`;
        optionCounts[key] = (optionCounts[key] ?? 0) + 1;
        memoCampaignCounts[sel.memoId] = (memoCampaignCounts[sel.memoId] ?? 0) + 1;
      }

      session = {
        ...session,
        revision: session.revision + 1,
        state: result.nextState,
        turnInputs: [...session.turnInputs, input],
        history: [...session.history, result],
        updatedAt: new Date().toISOString(),
      };
    }

    const status = session.state.campaignStatus;
    outcomes[status] = (outcomes[status] ?? 0) + 1;
    scores.push(session.state.campaignScore);
    strategy.score += session.state.campaignScore;
    if (status === "won") strategy.wins += 1;
    if (campaignFiredAnyDoctrine) strategy.doctrineCampaigns += 1;
    for (const id of campaignAttemptIds) eventStats.get(id)!.attempted += 1;
    for (const id of campaignQualifyingIds) eventStats.get(id)!.qualifying += 1;
    for (const id of campaignEventIds) eventStats.get(id)!.fired += 1;

    for (const commitment of session.state.activeCommitments) {
      if (commitment.fulfilled === true) totalFulfilled += 1;
      else if (commitment.fulfilled === false) totalBroken += 1;
    }
  }

  scores.sort((a, b) => a - b);
  const meanScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;

  const overloadFrequency: Record<string, number> = {};
  for (const [directorate, count] of Object.entries(overloadTurns)) {
    overloadFrequency[directorate] = totalTurns > 0 ? count / totalTurns : 0;
  }

  const acceptedRiskFrequency: Record<string, number> = {};
  for (const [id, count] of Object.entries(acceptedRiskTurns)) {
    acceptedRiskFrequency[id] = totalTurns > 0 ? count / totalTurns : 0;
  }

  const totalCommitments = totalFulfilled + totalBroken;
  const commitmentFulfillmentRate = totalCommitments > 0 ? totalFulfilled / totalCommitments : null;
  const commitmentBreachRate = totalCommitments > 0 ? totalBroken / totalCommitments : null;

  const optionSelectionRates: OptionRate[] = Object.entries(optionCounts).map(([key, count]) => {
    const [memoId, optionId] = key.split(":");
    const total = memoCampaignCounts[memoId] ?? 1;
    return { memoId, optionId, selectionRate: count / total };
  }).sort((a, b) => b.selectionRate - a.selectionRate);

  const dominantOptions = optionSelectionRates.filter((entry) => entry.selectionRate > 0.75);

  const doctrineStrategies = strategies.map((strategyId) => { const stat = strategyStats.get(strategyId)!; return { profileId: soloScenario.doctrineProfile.id, strategyId, campaigns: stat.campaigns, meanScore: stat.campaigns ? stat.score / stat.campaigns : 0, winRate: stat.campaigns ? stat.wins / stat.campaigns : 0, meanDoctrineEvents: stat.campaigns ? stat.events / stat.campaigns : 0, meanDoctrineEventCostMass: stat.campaigns ? stat.cost / stat.campaigns : 0, doctrineCampaignHitRate: stat.campaigns ? stat.doctrineCampaigns / stat.campaigns : 0 }; }).sort((a, b) => a.strategyId.localeCompare(b.strategyId));
  // campaignHitRate is fired / all campaigns in the event's relevant (target) cohort,
  // per the v2 telemetry definition — not fired / total campaigns.
  const doctrineEvents = soloScenario.events.filter((event) => event.doctrineTrigger).map((event) => {
    const stat = eventStats.get(event.id)!;
    const qualifying = stat.qualifying;
    const targetStrategy = doctrineStrategies.find((strategy) => strategy.strategyId === targetStrategyForEvent(event.id));
    const cohortCampaigns = targetStrategy?.campaigns ?? campaignCount;
    return { eventId: event.id, sourceGeneId: event.doctrineTrigger!.sourceGeneId, attemptedCampaigns: stat.attempted, qualifyingCampaigns: qualifying, firedCampaigns: stat.fired, campaignHitRate: cohortCampaigns > 0 ? stat.fired / cohortCampaigns : 0, maturationRate: stat.attempted ? qualifying / stat.attempted : 0, firingReliability: qualifying ? stat.fired / qualifying : 0 };
  }).sort((a, b) => a.eventId.localeCompare(b.eventId));
  const balanced = doctrineStrategies.find((entry) => entry.strategyId === "balanced-cycle");
  const adequateN = campaignCount >= 240 && doctrineStrategies.every((entry) => entry.campaigns >= 60);
  const dominantDoctrineStrategies = adequateN && balanced
    ? doctrineStrategies.filter((entry) => entry.strategyId !== "balanced-cycle" && entry.meanScore > balanced.meanScore + 5 && entry.winRate > balanced.winRate + 0.10 && entry.meanDoctrineEventCostMass <= balanced.meanDoctrineEventCostMass).map((entry) => entry.strategyId)
    : [];
  const balanceWarnings = campaignCount < 240 ? ["Doctrine balance gates are calibrated for --batch 240 or larger."] : [];
  if (campaignCount >= 240) {
    for (const entry of doctrineEvents) {
      if (entry.attemptedCampaigns > 0 && (entry.maturationRate < 0.70 || entry.maturationRate > 1)) balanceWarnings.push(`${entry.eventId} maturation rate is outside the 0.70–1.00 target.`);
      if (entry.firingReliability !== 1 && entry.qualifyingCampaigns > 0) balanceWarnings.push(`${entry.eventId} has non-deterministic firing after qualification.`);
      const targetStrategy = doctrineStrategies.find((strategy) => strategy.strategyId === targetStrategyForEvent(entry.eventId));
      if (!targetStrategy || targetStrategy.meanDoctrineEventCostMass <= 0) balanceWarnings.push(`${entry.eventId} has no authored adverse event cost in its target strategy.`);
    }
    // Balanced event campaign hit rates must stay below 0.85 so the paired cohorts
    // remain distinguishable from the deliberate overuse policies.
    if (balanced && balanced.campaigns > 0) {
      if (balanced.doctrineCampaignHitRate >= 0.85) balanceWarnings.push(`Balanced-cycle doctrine campaign hit rate is ${(balanced.doctrineCampaignHitRate * 100).toFixed(0)}%, not below the 0.85 gate.`);
      for (const entry of doctrineEvents) {
        const balancedHitRate = (balancedEventFires.get(entry.eventId) ?? 0) / balanced.campaigns;
        if (balancedHitRate >= 0.85) balanceWarnings.push(`${entry.eventId} fired in ${(balancedHitRate * 100).toFixed(0)}% of balanced campaigns; the balanced cohort hit-rate gate (<0.85) is breached.`);
      }
    }
    // A >50pp win-rate advantage that persists despite positive authored event cost means
    // the event's adverse deltas are not enough — surface it so the signal cannot go unseen.
    if (balanced) {
      for (const entry of doctrineStrategies) {
        if (entry.strategyId !== "balanced-cycle" && entry.meanDoctrineEventCostMass > 0 && entry.winRate > balanced.winRate + 0.50) {
          balanceWarnings.push(`${entry.strategyId} holds a ${Math.round((entry.winRate - balanced.winRate) * 100)}pp win-rate advantage over balanced despite positive doctrine event cost; authored adverse deltas are not enough.`);
        }
      }
    }
  }
  if (dominantDoctrineStrategies.length > 0) balanceWarnings.push(`Dominant doctrine strategies: ${dominantDoctrineStrategies.join(", ")}.`);

  return {
    campaignCount,
    totalTurns,
    outcomeDistribution: outcomes,
    scoreStats: {
      min: scores[0] ?? 0,
      max: scores[scores.length - 1] ?? 0,
      mean: Math.round(meanScore * 10) / 10,
      p25: Math.round(percentile(scores, 25) * 10) / 10,
      p75: Math.round(percentile(scores, 75) * 10) / 10,
    },
    overloadFrequency,
    acceptedRiskFrequency,
    negotiationFrequency: campaignCount > 0 ? totalNegotiations / campaignCount : 0,
    commitmentFulfillmentRate,
    commitmentBreachRate,
    optionSelectionRates,
    dominantOptions,
    doctrineEvents,
    doctrineStrategies,
    dominantDoctrineStrategies,
    balanceWarnings,
  };
}

function memosForSelection(scenario: typeof soloScenario, state: GameSession["state"], selection: { memoId: string; optionId: string }) {
  return deriveDecisionMemos(scenario, state).find((memo) => memo.id === selection.memoId)?.options.find((option) => option.id === selection.optionId)?.tags ?? [];
}

function targetStrategyForEvent(eventId: string): StrategyId {
  if (eventId === "doctrine-coalition-caveat-exposure") return "coalition-commitment";
  if (eventId === "doctrine-adaptive-cell-sprawl") return "adaptive-cell-sprawl";
  return "sustainment-delay";
}

export async function runHeadlessCampaign(options: HeadlessRunOptions = {}) {
  const sessionId = randomUUID();
  let session = options.session ?? {
    ...createInitialGameSession(soloScenario, sessionId),
    id: sessionId,
  };
  const turns = options.turns ?? 1;
  const providedInputs = options.inputs ?? [];

  const turnSummaries = [];
  for (let index = 0; index < turns && session.state.campaignStatus === "active"; index += 1) {
    const providedInput = providedInputs[index];
    const baseInput = providedInput ?? defaultInput(session);
    const autoAcceptRisks = options.autoAcceptRisks === true || providedInput === undefined;
    const input = inputWithAcceptedRiskPolicy(session, baseInput, autoAcceptRisks);
    const result = resolveTurn(soloScenario, session.state, input);
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
        acceptedRiskRefs: result.previousState.doctrineMaturity[event.id]?.acceptedRiskRefs ?? [],
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

  const validation: ReplayValidation | undefined = options.validate ? validateReplaySession(soloScenario, session) : undefined;

  return {
    scenario: {
      id: soloScenario.id,
      title: soloScenario.title,
      contentVersion: soloScenario.contentVersion,
    },
    session: {
      id: session.id,
      turn: session.state.turn,
      status: session.state.campaignStatus,
      score: session.state.campaignScore,
      outcome: session.state.campaignOutcome,
      staffFunctions: buildStaffFunctionReadouts(
        soloScenario.staffFunctions,
        buildDirectorateBurden(deriveDecisionMemos(soloScenario, session.state), [], soloScenario.staffCapacities, [], soloScenario.doctrineLens.burdenBias),
        session.state,
        soloScenario.doctrineLens.burdenBias,
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
      ? session.advisorRoster.map((advisor) => ({
          chiefId: advisor.chiefId,
          displayName: advisor.displayName,
          title: advisor.title,
          directorate: advisor.directorate,
          svg: buildAdvisorPortraitSvg(advisor.portrait),
        }))
      : undefined,
    sessionExport: session,
  };
}
