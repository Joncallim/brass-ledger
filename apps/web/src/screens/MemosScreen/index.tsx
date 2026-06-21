import type { DecisionMemo, MemoSelection, StaffNegotiation } from "@brass-ledger/shared";
import type { PreviewPayload } from "../../lib/types";
import { MemoPanel } from "./MemoPanel";
import { StatusBadge } from "../../components/StatusBadge";
import { BurdenBar } from "../../components/BurdenBar";

type Props = {
  memos: DecisionMemo[];
  selections: MemoSelection[];
  staffNegotiations: StaffNegotiation[];
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
  preview,
  previewLoading,
  previewError,
  canProceed,
  onSelect,
  onProceed,
  onBack,
}: Props) {
  const projectedFunctions = preview?.projectedResult.staffFunctions ?? [];
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
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-ink/40 hover:text-ink border border-border px-2 py-1"
          >
            ← Brief
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
            Review chiefs paper →
          </button>
          {!canProceed && (
            <p className="text-xs text-ink/40 mt-2">Preview must complete before proceeding.</p>
          )}
        </div>
      </div>

      <div className="w-64 shrink-0 border-l border-border p-4 bg-paper/40">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-ink/40">Projected S1–S5 burden</p>
          {previewLoading && <span className="text-xs text-ink/40 animate-pulse">Updating…</span>}
        </div>

        {previewError && (
          <p className="text-xs text-red-400 mb-3">{previewError}</p>
        )}

        {projectedFunctions.length === 0 && !previewLoading && (
          <p className="text-xs text-ink/40">Select options to see projected staff burden.</p>
        )}

        <div className="space-y-2">
          {projectedFunctions.map((fn) => {
            const level = fn.status === "overloaded" || fn.status === "compromised" ? "overloaded" : fn.status === "strained" ? "strained" : "light";
            return (
              <div key={fn.id} className="flex items-center gap-2">
                <span className="text-xs font-semibold w-6 text-ink/70">{fn.shortLabel}</span>
                <BurdenBar points={fn.burdenPoints} capacity={fn.capacity} level={level} maxSegments={6} />
                <span className="text-xs font-mono text-ink/50 ml-1">{fn.burdenPoints}/{fn.capacity}</span>
                <StatusBadge status={fn.status} className="ml-auto shrink-0" />
              </div>
            );
          })}
        </div>

        {warningCount > 0 && (
          <div className="mt-4 border border-yellow-700/60 bg-yellow-950/40 px-3 py-2">
            <p className="text-xs text-yellow-300">{warningCount} warning{warningCount !== 1 ? "s" : ""} projected</p>
          </div>
        )}

        {preview?.chiefCoalitions && preview.chiefCoalitions.length > 0 && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-widest text-ink/40 mb-2">Coalition snapshot</p>
            <div className="space-y-1">
              {preview.chiefCoalitions.slice(0, 4).map((c) => (
                <div key={`${c.memoId}:${c.optionId}`} className="text-xs border border-border px-2 py-1.5">
                  <span className={`font-mono mr-1 ${c.posture === "supporting" ? "text-green-400" : c.posture === "blocked" ? "text-red-400" : "text-yellow-400"}`}>
                    {c.posture === "supporting" ? "▲" : c.posture === "blocked" ? "▼" : "~"}
                  </span>
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
