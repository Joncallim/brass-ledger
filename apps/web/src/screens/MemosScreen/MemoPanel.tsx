import { useState } from "react";
import { describeMemoOptionForComparison, directorateLabel, type DecisionMemo, type MemoOptionComparison } from "@brass-ledger/shared";
import { OptionRadio } from "./OptionRadio";

type Props = {
  memo: DecisionMemo;
  selectedOptionId: string | null;
  enabled: boolean;
  onSelect: (optionId: string | null) => void;
};

export function MemoPanel({ memo, selectedOptionId, enabled, onSelect }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [comparisonOptionId, setComparisonOptionId] = useState("");
  const selectedOption = memo.options.find((option) => option.id === selectedOptionId);
  const comparisonOption = memo.options.find((option) => option.id === comparisonOptionId);

  function handleOptionalToggle(checked: boolean) {
    if (!checked) {
      onSelect(null);
    } else {
      onSelect(memo.options[0]?.id ?? null);
    }
  }

  return (
    <div className={`border ${selectedOptionId ? "border-brass/40" : "border-border"}`}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-paper/60 border-none"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs uppercase tracking-widest text-ink/40">{memo.category}</span>
            {!memo.optional && (
              <span className="text-xs border border-ink/30 px-1 text-ink/40">Required</span>
            )}
            {memo.optional && (
              <span className="text-xs border border-border px-1 text-ink/30">Optional</span>
            )}
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-ink">{memo.title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selectedOptionId && (
            <span className="text-xs text-brass">Chosen ✓</span>
          )}
          <span className="text-xs text-ink/30">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {memo.issue && (
            <p className="text-xs text-ink/60 leading-relaxed mb-3">{memo.issue}</p>
          )}

          {memo.optional && (
            <label className="flex items-center gap-2 text-xs text-ink/60 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => handleOptionalToggle(e.currentTarget.checked)}
                className="accent-[#b5882e]"
              />
              Take this decision this month
            </label>
          )}

          {(!memo.optional || enabled) && (
            <>
              <fieldset className="border-0 p-0 m-0">
                <legend className="sr-only">Options for {memo.title}</legend>
                <div className="space-y-1.5">
                  {memo.options.map((option) => (
                    <OptionRadio
                      key={option.id}
                      option={option}
                      memoId={memo.id}
                      selected={selectedOptionId === option.id}
                      onChange={onSelect}
                    />
                  ))}
                </div>
              </fieldset>
              {selectedOption && (
                <div className="mt-3 border-t border-border pt-3">
                  <label className="block text-xs text-ink/60">
                    Compare courses
                    <select
                      value={comparisonOptionId}
                      onChange={(event) => setComparisonOptionId(event.target.value)}
                      className="mt-1 block w-full border border-border bg-canvas px-2 py-1.5 text-sm text-ink"
                    >
                      <option value="">Choose another course to compare</option>
                      {memo.options.filter((option) => option.id !== selectedOption.id).map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  {comparisonOption && comparisonOption.id !== selectedOption.id && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2" aria-label="Course comparison">
                      <ComparisonCard heading="Current course" option={describeMemoOptionForComparison(selectedOption)} />
                      <ComparisonCard heading="Alternative" option={describeMemoOptionForComparison(comparisonOption)} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ComparisonCard({ heading, option }: { heading: string; option: MemoOptionComparison }) {
  const burden = option.burden.filter((entry) => entry.points > 0);
  return (
    <section className="border border-border bg-surface px-3 py-2 text-xs">
      <p className="uppercase tracking-widest text-ink/40">{heading}</p>
      <p className="mt-1 font-medium text-ink">{option.label}</p>
      <p className="mt-1 text-ink/60 leading-relaxed">{option.summary}</p>
      <p className="mt-2 text-ink/40">Staff work: <span className="text-ink/60">{burden.length > 0 ? burden.map((entry) => `${directorateLabel(entry.directorate)} ${entry.points}`).join(", ") : "No direct staff load."}</span></p>
      {option.tradeoffs.length > 0 && <p className="mt-2 text-ink/40">Known trade-offs: <span className="text-ink/60">{option.tradeoffs.join(" ")}</span></p>}
    </section>
  );
}
