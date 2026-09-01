import { directorateLabel, type AcceptedRiskOverride, type ChiefConversationRecord, type ChiefPositionEntry, type GameSession, type MemoSelection, type StaffNegotiation } from "@brass-ledger/shared";
import type { PreviewPayload } from "../../lib/types";
import { isPreviewValid } from "../../lib/previewValidity";
import { AcceptedRiskDocket } from "./AcceptedRiskDocket";
import { StaffNegotiationPanel } from "./StaffNegotiationPanel";
import { StaffModuleConsequences } from "../../components/StaffModuleConsequences";
import { ContextualTeaching } from "../../components/ContextualTeaching";

type Props = {
  preview: PreviewPayload | null;
  previewKey: string | null;
  currentPreviewKey: string;
  previewLoading: boolean;
  selections: MemoSelection[];
  session?: GameSession;
  chiefPositions?: ChiefPositionEntry[];
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
  onRestoreConflict?: (conversation: ChiefConversationRecord) => void;
};

function riskKey(risk: AcceptedRiskOverride) {
  return `${risk.staffFunctionId}:${risk.warningText}`;
}

export function PreCommitScreen({
  preview,
  previewKey,
  currentPreviewKey,
  previewLoading,
  selections,
  session,
  chiefPositions = [],
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
  onRestoreConflict = () => {},
}: Props) {
  const candidates = preview?.acceptedRiskCandidates ?? [];
  const acceptedCount = candidates.filter((r) => acceptedRiskChoices[riskKey(r)] === true).length;
  const allAccepted = candidates.length === 0 || acceptedCount === candidates.length;
  // Commit requires the preview for the CURRENT selections/negotiations to be
  // published (a negotiation change clears it synchronously while the
  // replacement request debounces) AND resolved (closing pass 3 P1) — an empty
  // candidate list from a null/stale preview must never look like "all
  // accepted".
  const burden = preview?.projectedResult.directorateBurden ?? [];
  const packetSummary = preview?.packetSummary;
  const currentConversations = session?.state.conversationHistory.filter((conversation) => conversation.turn === turnNumber) ?? [];
  const openTerms = session?.state.activeCommitments.filter((commitment) => commitment.fulfilled === null) ?? [];
  const conflicts = currentConversations.filter((conversation) => !selections.some((selection) => selection.memoId === conversation.memoId && selection.optionId === conversation.optionId));
  const canCommit =
    isPreviewValid(preview, previewKey, currentPreviewKey, previewLoading) && selections.length > 0 && conflicts.length === 0;
  const termLabel: Record<string, string> = {
    protected_boundary: "Protected boundary", sequencing_promise: "Sequencing promise", bounded_concession: "Bounded concession",
    accepted_risk: "Accepted risk", recorded_dissent: "Dissent on record", deferred: "Deferral",
  };

  function focusRiskWarnings() {
    // Same-page anchors scroll visually, but do not consistently move keyboard
    // focus. Keep the acknowledgement destination usable without pointer travel.
    document.getElementById("staff-risk-warnings")?.focus();
  }

  return (
    <div className="p-6 max-w-2xl">
      <ContextualTeaching concept="accepted-risk" title="Make the final call">
        This is your last check. You can go back and change a choice, request relief when it is offered, or carry a warning knowingly. When you commit, the month runs and this packet cannot be undone.
      </ContextualTeaching>
      {negotiationCandidates.length > 0 && (
        <ContextualTeaching concept="staff-relief" title="Staff relief still has a cost">
          Relief moves or defers named work when it is actually available for this packet. It can change the forecast, so review the replacement projection before committing; it never silently clears every warning.
        </ContextualTeaching>
      )}
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
        <div className="border border-red-600 bg-red-950/40 text-red-300 px-4 py-3 text-sm mb-5">{error}</div>
      )}

      <div className="space-y-4 mb-6">
        {packetSummary && (
          <section className="border border-border bg-surface px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">Packet balance</p>
            <p className="text-xs text-ink/60">{packetSummary.mainEffort ? `${packetSummary.mainEffortSource === "declared" ? "Named" : "Observed"} main effort: ${directorateLabel(packetSummary.mainEffort)}.` : "No main effort is carried by these choices."} Headquarters room left: <span className={packetSummary.slackStatus === "overdrawn" ? "text-red-400" : packetSummary.slackStatus === "tight" ? "text-yellow-400" : "text-green-400"}>{Math.max(0, packetSummary.slackPoints)} points, {packetSummary.slackStatus}.</span></p>
            {packetSummary.strainedDirectorates.length > 0 && <p className="mt-1 text-xs text-ink/50">Teams already under pressure: {packetSummary.strainedDirectorates.map(directorateLabel).join(", ")}.</p>}
          </section>
        )}
        <section className="border border-border bg-surface px-4 py-3">
          <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">Command ledger</p>
          <p className="text-xs text-ink/60 mb-3">Chief support, recorded terms, and any contradictions carried into this order.</p>
          <div className="space-y-2 text-xs">
            {chiefPositions.map((position) => (
              <p key={`${position.chiefId}:${position.memoId}`} className="text-ink/65"><span className={position.position === "support" ? "text-green-400" : position.position === "oppose" ? "text-red-400" : "text-yellow-400"}>{position.chiefName}: {position.position.replace("_", " ")}</span> — {position.requiredCondition}</p>
            ))}
            {currentConversations.map((conversation) => <p key={conversation.id} className="text-ink/60">Discussed: {conversation.chiefName} on {conversation.memoTitle} · {conversation.status === "completed" ? "recorded" : "still open"}</p>)}
            {openTerms.map((commitment) => <p key={commitment.id} className="text-ink/60">{termLabel[commitment.term ?? "sequencing_promise"] ?? commitment.term}: {commitment.label}</p>)}
            {chiefPositions.length === 0 && currentConversations.length === 0 && openTerms.length === 0 && <p className="text-ink/40">No chief term is currently carried into this order.</p>}
            {conflicts.map((conversation) => (
              <div key={`conflict:${conversation.id}`} className="text-red-400">
                <p>Conflict: {conversation.chiefName} discussed {conversation.memoTitle} — {conversation.optionLabel}, which is no longer in this packet.</p>
                <button type="button" onClick={() => onRestoreConflict(conversation)} className="mt-1 border border-red-600 px-2 py-1 text-xs hover:border-brass hover:text-brass">
                  Restore that discussed option and return to chiefs
                </button>
              </div>
            ))}
          </div>
        </section>
        {(preview?.predictedEvents ?? []).filter((event) => event.doctrineTrigger && event.causalContext).length > 0 && (
          <>
          <ContextualTeaching concept="doctrine-risk" title="Repeated choices create doctrine risk">
            This is a pattern warning, not a hidden penalty for one option. Use it to judge whether the packet still supports the approach your command has been building over several months.
          </ContextualTeaching>
          <section className="border border-yellow-800/60 bg-yellow-950/30 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-yellow-300/80 mb-2">Doctrine risks that may mature</p>
            <div className="space-y-3">
              {(preview?.predictedEvents ?? []).filter((event) => event.doctrineTrigger && event.causalContext).map((event) => (
                <div key={event.id}>
                  <p className="text-sm font-semibold text-yellow-200">{event.title}</p>
                  <p className="text-xs text-yellow-100/70">Bet: {event.causalContext!.betLabel}</p>
                  <p className="text-xs text-yellow-100/70">{event.causalContext!.maturedRiskLabel} This risk is building through repeated choices; exact engine thresholds are intentionally not shown in the command brief.</p>
                  <p className="text-xs text-yellow-100/70">Consequence: {event.summary}</p>
                </div>
              ))}
            </div>
          </section>
          </>
        )}

        <AcceptedRiskDocket
          candidates={candidates}
          choices={acceptedRiskChoices}
          onChange={onAcceptRisk}
        />

        <StaffModuleConsequences modules={preview?.projectedResult.staffModules ?? []} />

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
            disabled={!allAccepted || !canCommit || busy}
            className="px-6 py-2.5 bg-brass text-white border border-brass hover:bg-brass/90 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
          >
            {busy ? "Committing…" : "Commit the month"}
          </button>
        </div>
        {!allAccepted ? (
          <p className="text-xs text-red-400 mt-2">
            You cannot commit yet: {candidates.length - acceptedCount} of {candidates.length} staff warnings are
            still unaccepted. <a href="#staff-risk-warnings" onClick={focusRiskWarnings} className="underline hover:text-brass">Go to the named staff risk warnings</a> to confirm you are going ahead knowing the risk.
          </p>
        ) : conflicts.length > 0 ? (
          <p className="text-xs text-red-400 mt-2">
            You cannot commit while a recorded chief conversation conflicts with this packet. Use the named conflict above to restore its discussed option and review it with the chiefs.
          </p>
        ) : !canCommit ? (
          <p className="text-xs text-ink/50 mt-2">
            The forecast is updating for your latest choices — commit unlocks once the new projection is shown.
          </p>
        ) : null}
      </div>
    </div>
  );
}
