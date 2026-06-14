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
