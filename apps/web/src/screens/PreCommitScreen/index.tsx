import type { AcceptedRiskOverride, MemoSelection, StaffNegotiation } from "@brass-ledger/shared";
import type { PreviewPayload } from "../../lib/types";
import { AcceptedRiskDocket } from "./AcceptedRiskDocket";
import { StaffNegotiationPanel } from "./StaffNegotiationPanel";

type Props = {
  preview: PreviewPayload | null;
  selections: MemoSelection[];
  acceptedRiskChoices: Record<string, boolean>;
  staffNegotiations: StaffNegotiation[];
  negotiationCandidates: StaffNegotiation["directorate"][];
  turnNumber: number;
  busy: boolean;
  error: string | null;
  onAcceptRisk: (risk: AcceptedRiskOverride, accepted: boolean) => void;
  onNegotiation: (directorate: StaffNegotiation["directorate"], enabled: boolean) => void;
  onCommit: () => void;
  onBack: () => void;
};

function riskKey(risk: AcceptedRiskOverride) {
  return `${risk.staffFunctionId}:${risk.warningText}`;
}

export function PreCommitScreen({
  preview,
  selections,
  acceptedRiskChoices,
  staffNegotiations,
  negotiationCandidates,
  turnNumber,
  busy,
  error,
  onAcceptRisk,
  onNegotiation,
  onCommit,
  onBack,
}: Props) {
  const candidates = preview?.acceptedRiskCandidates ?? [];
  const allAccepted = candidates.length === 0 || candidates.every((r) => acceptedRiskChoices[riskKey(r)] === true);

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Pre-commit</p>
          <h2 className="text-xl font-semibold tracking-tight text-ink">Turn {turnNumber} — final review</h2>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-ink/40 hover:text-ink border border-border px-2 py-1"
        >
          ← Chiefs
        </button>
      </div>

      {error && (
        <div className="border border-red-600/70/60 bg-red-950/40 text-red-300 px-4 py-3 text-sm mb-5">{error}</div>
      )}

      <div className="space-y-4 mb-6">
        <AcceptedRiskDocket
          candidates={candidates}
          choices={acceptedRiskChoices}
          onChange={onAcceptRisk}
        />

        <StaffNegotiationPanel
          candidates={negotiationCandidates}
          active={staffNegotiations}
          onChange={onNegotiation}
        />
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-ink/50">
            Turn {turnNumber} · {selections.length} option{selections.length !== 1 ? "s" : ""} selected
            {candidates.length > 0 && ` · ${candidates.filter((r) => acceptedRiskChoices[riskKey(r)] === true).length}/${candidates.length} risks accepted`}
            {staffNegotiations.length > 0 && ` · ${staffNegotiations.length} negotiation${staffNegotiations.length !== 1 ? "s" : ""}`}
          </div>
          <button
            type="button"
            onClick={onCommit}
            disabled={!allAccepted || busy}
            className="px-6 py-2.5 bg-brass text-white border border-brass hover:bg-brass/90 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
          >
            {busy ? "Committing…" : "Commit turn"}
          </button>
        </div>
        {!allAccepted && (
          <p className="text-xs text-red-400 mt-2">Accept all risk warnings before committing.</p>
        )}
      </div>
    </div>
  );
}
