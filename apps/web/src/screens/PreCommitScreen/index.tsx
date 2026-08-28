import { directorateLabel, type AcceptedRiskOverride, type CommanderIntent, type DirectorateId, type MemoSelection, type StaffNegotiation } from "@brass-ledger/shared";
import type { PreviewPayload } from "../../lib/types";
import { isPreviewValid } from "../../lib/previewValidity";
import { AcceptedRiskDocket } from "./AcceptedRiskDocket";
import { StaffNegotiationPanel } from "./StaffNegotiationPanel";
import { StaffModuleConsequences } from "../../components/StaffModuleConsequences";

type Props = {
  preview: PreviewPayload | null;
  previewKey: string | null;
  currentPreviewKey: string;
  previewLoading: boolean;
  selections: MemoSelection[];
  acceptedRiskChoices: Record<string, boolean>;
  staffNegotiations: StaffNegotiation[];
  commanderIntent?: CommanderIntent;
  negotiationCandidates: StaffNegotiation["directorate"][];
  turnNumber: number;
  busy: boolean;
  error: string | null;
  onAcceptRisk: (risk: AcceptedRiskOverride, accepted: boolean) => void;
  onNegotiation: (directorate: StaffNegotiation["directorate"], enabled: boolean) => void;
  onCommanderIntent: (intent: CommanderIntent | undefined) => void;
  onCommit: () => void;
  onBack: () => void;
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
  acceptedRiskChoices,
  staffNegotiations,
  commanderIntent,
  negotiationCandidates,
  turnNumber,
  busy,
  error,
  onAcceptRisk,
  onNegotiation,
  onCommanderIntent,
  onCommit,
  onBack,
}: Props) {
  const candidates = preview?.acceptedRiskCandidates ?? [];
  const acceptedCount = candidates.filter((r) => acceptedRiskChoices[riskKey(r)] === true).length;
  const allAccepted = candidates.length === 0 || acceptedCount === candidates.length;
  // Commit requires the preview for the CURRENT selections/negotiations to be
  // published (a negotiation change clears it synchronously while the
  // replacement request debounces) AND resolved (closing pass 3 P1) — an empty
  // candidate list from a null/stale preview must never look like "all
  // accepted".
  const canCommit =
    isPreviewValid(preview, previewKey, currentPreviewKey, previewLoading) && selections.length > 0;
  const burden = preview?.projectedResult.directorateBurden ?? [];
  const mainEffortChoices = burden.filter((entry) => entry.burdenPoints > 0);
  const secondaryRiskChoices = burden.filter((entry) => entry.burdenLevel !== "light" && entry.directorate !== commanderIntent?.mainEffort);

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
        <div className="border border-red-600/70 bg-red-950/40 text-red-300 px-4 py-3 text-sm mb-5">{error}</div>
      )}

      <div className="space-y-4 mb-6">
        <section className="border border-border bg-surface px-4 py-3">
          <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">Commander’s intent</p>
          <p className="text-xs text-ink/60 mb-3">Name the effort this packet is actually carrying. It changes the authoritative concentration check; it is not a free bonus.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-ink/65">Main effort
              <select
                className="mt-1 block w-full border border-border bg-canvas px-2 py-1.5 text-sm text-ink"
                value={commanderIntent?.mainEffort ?? ""}
                onChange={(event) => {
                  const mainEffort = event.target.value as DirectorateId;
                  onCommanderIntent(mainEffort ? { mainEffort } : undefined);
                }}
              >
                <option value="">Use observed packet concentration</option>
                {mainEffortChoices.map((entry) => <option key={entry.directorate} value={entry.directorate}>{directorateLabel(entry.directorate)} ({entry.burdenPoints} staff load)</option>)}
              </select>
            </label>
            <label className="text-xs text-ink/65">Deliberately accepted secondary risk
              <select
                disabled={!commanderIntent}
                className="mt-1 block w-full border border-border bg-canvas px-2 py-1.5 text-sm text-ink disabled:opacity-50"
                value={commanderIntent?.acceptedSecondaryRisk ?? ""}
                onChange={(event) => onCommanderIntent(commanderIntent ? {
                  mainEffort: commanderIntent.mainEffort,
                  ...(event.target.value ? { acceptedSecondaryRisk: event.target.value as DirectorateId } : {}),
                } : undefined)}
              >
                <option value="">No declared secondary risk</option>
                {secondaryRiskChoices.map((entry) => <option key={entry.directorate} value={entry.directorate}>{directorateLabel(entry.directorate)} ({entry.burdenLevel})</option>)}
              </select>
            </label>
          </div>
        </section>
        {(preview?.predictedEvents ?? []).filter((event) => event.doctrineTrigger && event.causalContext).length > 0 && (
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
            still unaccepted. Tick each one in "Staff risk warnings" above to confirm you are going ahead knowing the
            risk.
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
