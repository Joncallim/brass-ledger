import type { AcceptedRiskOverride, DecisionMemo, GameSession, StaffNegotiation } from "@brass-ledger/shared";

export type AcceptedRiskChoiceState = Record<string, boolean>;

export function acceptedRiskKey(risk: AcceptedRiskOverride) {
  return `${risk.staffFunctionId}\u0000${risk.warningText}`;
}

export function initialAcceptedRiskChoices(candidates: AcceptedRiskOverride[]): AcceptedRiskChoiceState {
  return Object.fromEntries(candidates.map((risk) => [acceptedRiskKey(risk), false]));
}

export function setAcceptedRiskChoice(
  choices: AcceptedRiskChoiceState,
  risk: AcceptedRiskOverride,
  accepted: boolean,
): AcceptedRiskChoiceState {
  return {
    ...choices,
    [acceptedRiskKey(risk)]: accepted,
  };
}

export function acceptedRiskOverridesFromChoices(
  candidates: AcceptedRiskOverride[],
  choices: AcceptedRiskChoiceState,
) {
  return candidates.filter((risk) => choices[acceptedRiskKey(risk)] === true);
}

export function allAcceptedRiskCandidatesChosen(
  candidates: AcceptedRiskOverride[],
  choices: AcceptedRiskChoiceState,
) {
  return candidates.every((risk) => choices[acceptedRiskKey(risk)] === true);
}

export function defaultTurnInput(
  session: GameSession,
  memos: DecisionMemo[],
  acceptedRiskOverrides: AcceptedRiskOverride[] = [],
  staffNegotiations: StaffNegotiation[] = [],
) {
  return {
    turn: session.state.turn,
    selectedActionIds: [],
    acceptedRiskOverrides,
    staffNegotiations,
    selections: memos
      .filter((memo) => !memo.optional)
      .map((memo) => ({
        memoId: memo.id,
        optionId: memo.options[0]?.id ?? "",
      }))
      .filter((selection) => selection.optionId.length > 0),
  };
}
