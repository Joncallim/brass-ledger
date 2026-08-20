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
  const acceptedCount = candidates.filter((r) => acceptedRiskChoices[riskKey(r)] === true).length;
  const allAccepted = candidates.length === 0 || acceptedCount === candidates.length;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-5 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Final review</p>
          <h2 className="text-xl font-semibold tracking-tight text-ink">Month {turnNumber} — before you commit</h2>
          <p className="text-xs text-ink/50 mt-1 max-w-lg leading-relaxed">
            Committing runs the month. Your choices, the chiefs' reactions, and any events all resolve at once, and
            you cannot undo it.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-ink/40 hover:text-ink border border-border px-2 py-1 shrink-0"
        >
          ← Back to chiefs
        </button>
      </div>

      {error && (
        <div className="border border-red-600/70/60 bg-red-950/40 text-red-300 px-4 py-3 text-sm mb-5">{error}</div>
      )}

      <div className="space-y-4 mb-6">
        {(preview?.predictedEvents ?? []).filter((event) => event.doctrineTrigger && event.causalContext).length > 0 && (
          <section className="border border-yellow-800/60 bg-yellow-950/30 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-yellow-300/80 mb-2">Doctrine risks that may mature</p>
            <div className="space-y-3">
              {(preview?.predictedEvents ?? []).filter((event) => event.doctrineTrigger && event.causalContext).map((event) => (
                <div key={event.id}>
                  <p className="text-sm font-semibold text-yellow-200">{event.title}</p>
                  <p className="text-xs text-yellow-100/70">Bet: {event.causalContext!.betLabel}</p>
                  <p className="text-xs text-yellow-100/70">{event.causalContext!.maturedRiskLabel}; threshold: {event.doctrineTrigger!.conditions.map((condition) => `${condition.variable} ${condition.comparison} ${condition.threshold}`).join(", ")}; sustained {event.doctrineTrigger!.sustainedTurns} turns.</p>
                  <p className="text-xs text-yellow-100/70">Consequence: {event.summary}</p>
                </div>
              ))}
            </div>
          </section>
        )}

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
            Month {turnNumber} · {selections.length} option{selections.length !== 1 ? "s" : ""} chosen
            {candidates.length > 0 && ` · ${acceptedCount} of ${candidates.length} warnings accepted`}
            {staffNegotiations.length > 0 && ` · ${staffNegotiations.length} relief request${staffNegotiations.length !== 1 ? "s" : ""}`}
          </div>
          <button
            type="button"
            onClick={onCommit}
            disabled={!allAccepted || busy}
            className="px-6 py-2.5 bg-brass text-white border border-brass hover:bg-brass/90 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
          >
            {busy ? "Committing…" : "Commit the month"}
          </button>
        </div>
        {!allAccepted && (
          <p className="text-xs text-red-400 mt-2">
            You cannot commit yet: {candidates.length - acceptedCount} of {candidates.length} staff warnings are
            still unaccepted. Tick each one in "Staff risk warnings" above to confirm you are going ahead knowing the
            risk.
          </p>
        )}
      </div>
    </div>
  );
}
