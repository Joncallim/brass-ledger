import type {
  GameSession,
  DecisionMemo,
  TurnPreview,
  TurnResult,
  MemoSelection,
  StaffNegotiation,
  ChiefConversationRecord,
  ReplayValidation,
  AcceptedRiskOverride,
} from "@brass-ledger/shared";

export type SessionSummary = {
  id: string;
  turn?: number;
  milestonesMet?: number;
  milestonesTotal?: number;
  campaignStatus?: string;
  campaignScore?: number;
  summary?: string;
  recordStatus?: "corrupt" | "incompatible";
  recordReason?: string;
};

export type SessionEnvelope = {
  session: GameSession;
  memos: DecisionMemo[];
  summary: SessionSummary;
};

export type PreviewPayload = TurnPreview & { projectedResult: TurnResult };

export type ConversationResponse = {
  id: string;
  label: string;
  summary: string;
  commanderLine: string;
  chiefReply: string;
  trustDelta: number;
  trustAfter: number;
  relationshipEffect: string;
};

export type TurnStep = "briefing" | "memos" | "chiefs" | "commit" | "after-action";

export type AppRoute =
  | { screen: "hub" }
  | { screen: "session"; sessionId: string; step: TurnStep }
  | { screen: "records" };

export type TurnCycleState = {
  session: GameSession;
  memos: DecisionMemo[];
  selections: MemoSelection[];
  preview: PreviewPayload | null;
  acceptedRiskChoices: Record<string, boolean>;
  staffNegotiations: StaffNegotiation[];
  latestResult: TurnResult | null;
};

export type { AcceptedRiskOverride, ChiefConversationRecord, ReplayValidation };
