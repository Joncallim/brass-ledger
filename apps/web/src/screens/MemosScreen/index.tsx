import { directorateLabel, type CommanderIntent, type DecisionMemo, type DirectorateId, type MemoSelection, type StaffModuleDefinition, type StaffNegotiation, type TurnResult } from "@brass-ledger/shared";
import type { PreviewPayload } from "../../lib/types";
import { MemoPanel } from "./MemoPanel";
import { StatusBadge } from "../../components/StatusBadge";
import { BurdenBar } from "../../components/BurdenBar";
import { coalitionPostureLabel, pluralize } from "../../lib/labels";
import { StaffModuleConsequences } from "../../components/StaffModuleConsequences";
import { ContextualTeaching } from "../../components/ContextualTeaching";

function slackClass(status: "room" | "tight" | "overdrawn") {
  return status === "overdrawn" ? "text-red-400" : status === "tight" ? "text-yellow-400" : "text-green-400";
}

const posturePalette: Record<string, string> = {
  supporting: "text-green-400",
  conditional: "text-yellow-400",
  contested: "text-orange-400",
  blocked: "text-red-400",
};

type Props = {
  memos: DecisionMemo[];
  selections: MemoSelection[];
  staffNegotiations: StaffNegotiation[];
  commanderIntent?: CommanderIntent;
  staffAssistanceDetail?: "guided" | "standard" | "sparse";
  staffModules: StaffModuleDefinition[];
  /**
   * Optional, display-only context from a prior packet. The Memos screen does
   * not infer this from session history: callers decide which prior choice and
   * changed issue deserve to be surfaced for the current packet.
   */
  pacingPresentation?: MemosPacingPresentation;
  preview: PreviewPayload | null;
  previewLoading: boolean;
  previewError: string | null;
  canProceed: boolean;
  onSelect: (memoId: string, optionId: string | null) => void;
  onCommanderIntent: (intent: CommanderIntent | undefined) => void;
  onProceed: () => void;
  onBack: () => void;
};

export function MemosScreen({
  memos,
  selections,
  staffNegotiations,
  commanderIntent,
  staffAssistanceDetail = "standard",
  staffModules,
  pacingPresentation,
  preview,
  previewLoading,
  previewError,
  canProceed,
  onSelect,
  onCommanderIntent,
  onProceed,
  onBack,
}: Props) {
  const projectedFunctions = preview?.projectedResult.staffFunctions ?? [];
  const projectedModules = preview?.projectedResult.staffModules ?? [];
  const warningCount = preview?.acceptedRiskCandidates.length ?? 0;
  const packetSummary = preview?.packetSummary;
  const directorateBurden = preview?.projectedResult.directorateBurden ?? [];
  const mainEffortChoices = directorateBurden.filter((entry) => entry.burdenPoints > 0);
  const secondaryRiskChoices = directorateBurden.filter((entry) => entry.burdenLevel !== "light" && entry.directorate !== commanderIntent?.mainEffort);
  const selectedChoices = memos.flatMap((memo) => {
    const optionId = selections.find((selection) => selection.memoId === memo.id)?.optionId;
    const option = memo.options.find((candidate) => candidate.id === optionId);
    return option ? [{ memo, option }] : [];
  });
  const skippedOptionalMemos = memos.filter((memo) => memo.optional && !selections.some((selection) => selection.memoId === memo.id));
  const missingRequiredMemos = memos.filter((memo) => !memo.optional && !selections.some((selection) => selection.memoId === memo.id));

  function getSelection(memoId: string) {
    return selections.find((s) => s.memoId === memoId)?.optionId ?? null;
  }

  function isEnabled(memo: DecisionMemo) {
    return getSelection(memo.id) !== null;
  }

  return (
    <div className="flex gap-0 h-full">
      <div className="flex-1 min-w-0 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Decision memos</p>
            <p className="text-sm text-ink/60">
              {memos.filter((m) => !m.optional).length} required · {memos.filter((m) => m.optional).length} optional
            </p>
            <p className="text-xs text-ink/50 mt-1 max-w-lg leading-relaxed">
              {staffAssistanceDetail === "guided"
                ? "Choose one course per memo, then use the right-hand forecast to name which staff lane is binding before you commit. Forecast warnings show work your packet creates; they never choose or accept risk for you."
                : staffAssistanceDetail === "sparse"
                  ? "Choose one course per memo. The forecast reports the staff work your packet creates, but leaves more of the trade-off for your own reading."
                  : "Choose one course of action per memo. The panel on the right updates as you choose, so you can see the work each choice loads onto your staff before you commit anything. The small tags on an option are the themes your chiefs and outside events react to."}
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-ink/40 hover:text-ink border border-border px-2 py-1 shrink-0"
          >
            ← Back to brief
          </button>
        </div>

        <div className="space-y-3 max-w-2xl">
          <ContextualTeaching concept="forecast" title="Forecast before you commit">
            The forecast is a projection, not a recommendation. As you change the packet, use it to see which staff lane becomes binding and how confident the picture is. It never accepts a warning or selects a course for you.
          </ContextualTeaching>
          {preview && (
            <ContextualTeaching concept="uncertainty-confidence" title="Confidence is not certainty">
              The forecast can be useful without being exact. Read confidence as the strength of the command picture, not a promise that the visible posture will unfold exactly as projected.
            </ContextualTeaching>
          )}
          {mainEffortChoices.length > 0 && (
            <section className="border border-border bg-surface px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Commander&apos;s intent</p>
              <p className="text-xs text-ink/60 mb-3">Name the effort this packet is actually carrying before you take it to the chiefs. It changes the authoritative concentration check; it is not a free bonus.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-ink/65">Main effort
                  <select
                    aria-label="Main effort"
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
                    aria-label="Accepted secondary risk"
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
          )}
          {memos.map((memo) => (
            <MemoPanel
              key={memo.id}
              memo={memo}
              selectedOptionId={getSelection(memo.id)}
              enabled={isEnabled(memo)}
              priorChoice={pacingPresentation?.priorChoices?.find((choice) => choice.memoId === memo.id)}
              issueChange={pacingPresentation?.issueChanges?.find((change) => change.memoId === memo.id)}
              onSelect={(optionId) => onSelect(memo.id, optionId)}
            />
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border max-w-2xl">
          <button
            type="button"
            onClick={onProceed}
            disabled={!canProceed}
            className="px-5 py-2.5 bg-brass text-white border border-brass hover:bg-brass/90 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
          >
            Hear from the chiefs →
          </button>
          {!canProceed && (
            <p className="text-xs text-ink/40 mt-2">
              {missingRequiredMemos.length > 0
                ? <>Choose an option for {missingRequiredMemos.map((memo) => memo.title).join(", ")}. Every required memo needs a course before you can hear from the chiefs.</>
                : "The forecast is still updating for this packet. Wait for the current forecast before hearing from the chiefs."}
            </p>
          )}
        </div>
      </div>

      <div className="w-64 shrink-0 border-l border-border p-4 bg-paper/40">
        <section className="mb-5 border border-border bg-surface px-3 py-3">
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-2">This month&apos;s packet</p>
          {selectedChoices.length === 0 ? (
            <p className="text-xs text-ink/40">Select an option to begin assembling the month&apos;s work.</p>
          ) : (
            <div className="space-y-2">
              {selectedChoices.map(({ memo, option }) => (
                <div key={memo.id}>
                  <p className="text-xs text-ink/40">{memo.title}</p>
                  <p className="text-xs text-ink/70 leading-snug">{option.label}</p>
                </div>
              ))}
            </div>
          )}
          {packetSummary && (
            <div className="mt-3 border-t border-border pt-2 text-xs text-ink/60">
              <p>Organisational slack: <span className={slackClass(packetSummary.slackStatus)}>{Math.max(0, packetSummary.slackPoints)} points, {packetSummary.slackStatus}.</span></p>
              {packetSummary.strainedDirectorates.length > 0 && (
                <p className="mt-1">Pressure carried: {packetSummary.strainedDirectorates.map(directorateLabel).join(", ")}.</p>
              )}
            </div>
          )}
          {skippedOptionalMemos.length > 0 && (
            <div className="mt-3 border-t border-border pt-2">
              <p className="text-xs text-ink/40">Deliberately not taking</p>
              {skippedOptionalMemos.map((memo) => <p key={memo.id} className="text-xs text-ink/60 leading-snug">{memo.title}</p>)}
            </div>
          )}
        </section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-ink/40">Forecast staff burden</p>
          {previewLoading && <span className="text-xs text-ink/40 animate-pulse">Updating…</span>}
        </div>

        {previewError && (
          <p className="text-xs text-red-400 mb-3">Could not update the forecast: {previewError}</p>
        )}

        {projectedFunctions.length === 0 && !previewLoading && (
          <p className="text-xs text-ink/40">Choose an option to see how much work each staff function would carry.</p>
        )}

        <div className="space-y-2">
          {projectedFunctions.map((fn) => {
            const level = fn.status === "overloaded" || fn.status === "compromised" ? "overloaded" : fn.status === "strained" ? "strained" : "light";
            return (
              <div key={fn.id}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink/70">{fn.shortLabel}</span>
                  <span className="text-xs font-mono text-ink/50">{fn.burdenPoints}/{fn.capacity}</span>
                  <StatusBadge status={fn.status} className="ml-auto shrink-0" />
                </div>
                <div className="mt-0.5 overflow-hidden">
                  <BurdenBar points={fn.burdenPoints} capacity={fn.capacity} level={level} maxSegments={6} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          {projectedModules.length > 0 ? (
            <StaffModuleConsequences modules={projectedModules} />
          ) : staffModules.length > 0 ? (
            <section>
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Optional staff cells</p>
              <div className="space-y-2">
                {staffModules.map((definition) => (
                  <div key={definition.id} className="border border-border px-4 py-3">
                    <p className="text-sm font-semibold text-ink/70">{definition.label}</p>
                    <p className="text-xs text-ink/60 mt-1">{definition.remit}</p>
                    <p className="text-xs text-ink/40 mt-1 italic">
                      Awaiting a selection — effects and coordination load appear once you choose.
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {warningCount > 0 && (
          <div className="mt-4 border border-yellow-700/60 bg-yellow-950/40 px-3 py-2">
            <p className="text-xs text-yellow-300 leading-relaxed">
              {warningCount} staff {pluralize(warningCount, "warning")} forecast. You will have to accept
              {warningCount === 1 ? " it" : " each of them"} before you can commit the month.
            </p>
          </div>
        )}

        {preview?.chiefCoalitions && preview.chiefCoalitions.length > 0 && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-widest text-ink/40 mb-2">Where the chiefs stand</p>
            <div className="space-y-1">
              {preview.chiefCoalitions.slice(0, 4).map((c) => (
                <div key={`${c.memoId}:${c.optionId}`} className="text-xs border border-border px-2 py-1.5">
                  <span className={`block ${posturePalette[c.posture]}`}>{coalitionPostureLabel[c.posture] ?? c.posture}</span>
                  <span className="text-ink/60 truncate">{c.optionLabel}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Presentation-only context for pacing a new packet against the last one. */
export type MemosPacingPresentation = {
  /** A player-visible reference to the course chosen for the same memo previously. */
  priorChoices?: Array<{
    memoId: string;
    optionLabel: string;
  }>;
  /** Explains why a recurring memo needs attention now; never recommends a course. */
  issueChanges?: Array<{
    memoId: string;
    whyNow: string;
  }>;
};

/**
 * Turns the prior resolved packet into display context for the next packet.
 * It deliberately reports only authored labels and current memo wording: it
 * neither predicts an outcome nor carries a prior option into the selection.
 */
export function buildMemosPacingPresentation(
  memos: DecisionMemo[],
  history: readonly Pick<TurnResult, "input" | "memos">[],
): MemosPacingPresentation | undefined {
  const priorTurn = history.at(-1);
  if (!priorTurn) return undefined;
  const priorChoices = priorTurn.input.selections.flatMap((selection) => {
    const priorMemo = priorTurn.memos.find((memo) => memo.id === selection.memoId);
    const priorOption = priorMemo?.options.find((option) => option.id === selection.optionId);
    return priorOption ? [{ memoId: selection.memoId, optionLabel: priorOption.label }] : [];
  });
  const issueChanges = memos.flatMap((memo) => {
    const priorMemo = priorTurn.memos.find((candidate) => candidate.id === memo.id);
    return priorMemo && priorMemo.issue !== memo.issue && memo.issue
      ? [{ memoId: memo.id, whyNow: memo.issue }]
      : [];
  });
  return { priorChoices, issueChanges };
}
