import { soloScenario } from "@brass-ledger/content";
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
import { deriveDecisionMemos, previewTurn, resolveTurn, validateReplaySession } from "@brass-ledger/sim";

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

function batchInput(session: GameSession, campaignIndex: number): TurnInput {
  const memos = deriveDecisionMemos(soloScenario, session.state);
  return {
    turn: session.state.turn,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    staffNegotiations: [],
    selections: memos.map((memo, memoIndex) => {
      if (memo.optional && campaignIndex % 3 === 0) return null;
      const optionIndex = (campaignIndex + memoIndex) % memo.options.length;
      const optionId = memo.options[optionIndex]?.id ?? memo.options[0]?.id ?? "";
      return { memoId: memo.id, optionId };
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

  for (let ci = 0; ci < campaignCount; ci += 1) {
    let session: GameSession = {
      ...createInitialGameSession(soloScenario, `batch-${ci}`),
      id: `batch-${ci}`,
    };

    while (session.state.campaignStatus === "active" && session.state.turn <= soloScenario.maxTurns) {
      const base = batchInput(session, ci);
      const input = inputWithAcceptedRiskPolicy(session, base, true);
      const result = resolveTurn(soloScenario, session.state, input);
      totalTurns += 1;

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
  };
}

export async function runHeadlessCampaign(options: HeadlessRunOptions = {}) {
  let session = options.session ?? {
    ...createInitialGameSession(soloScenario, "cli-headless"),
    id: "cli-headless",
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
        buildDirectorateBurden(deriveDecisionMemos(soloScenario, session.state), [], soloScenario.staffCapacities),
        session.state,
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
