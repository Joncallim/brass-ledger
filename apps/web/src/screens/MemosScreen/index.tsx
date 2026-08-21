import type { DecisionMemo, MemoSelection, StaffModuleDefinition, StaffNegotiation } from "@brass-ledger/shared";
import type { PreviewPayload } from "../../lib/types";
import { MemoPanel } from "./MemoPanel";
import { StatusBadge } from "../../components/StatusBadge";
import { BurdenBar } from "../../components/BurdenBar";
import { coalitionPostureLabel, pluralize } from "../../lib/labels";
import { StaffModuleConsequences } from "../../components/StaffModuleConsequences";

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
  staffModules: StaffModuleDefinition[];
  preview: PreviewPayload | null;
  previewLoading: boolean;
  previewError: string | null;
  canProceed: boolean;
  onSelect: (memoId: string, optionId: string | null) => void;
  onProceed: () => void;
  onBack: () => void;
};

export function MemosScreen({
  memos,
  selections,
  staffNegotiations,
  staffModules,
  preview,
  previewLoading,
  previewError,
  canProceed,
  onSelect,
  onProceed,
  onBack,
}: Props) {
  const projectedFunctions = preview?.projectedResult.staffFunctions ?? [];
  const projectedModules = preview?.projectedResult.staffModules ?? [];
  const warningCount = preview?.acceptedRiskCandidates.length ?? 0;

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
              Choose one course of action per memo. The panel on the right updates as you choose, so you can see the
              work each choice loads onto your staff before you commit anything. The small tags on an option are the
              themes your chiefs and outside events react to.
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
          {memos.map((memo) => (
            <MemoPanel
              key={memo.id}
              memo={memo}
              selectedOptionId={getSelection(memo.id)}
              enabled={isEnabled(memo)}
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
              Choose at least one option to continue. Every required memo needs an option before you can commit the
              month.
            </p>
          )}
        </div>
      </div>

      <div className="w-64 shrink-0 border-l border-border p-4 bg-paper/40">
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
