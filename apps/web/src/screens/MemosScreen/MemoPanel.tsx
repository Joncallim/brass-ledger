import { useState } from "react";
import type { DecisionMemo } from "@brass-ledger/shared";
import { OptionRadio } from "./OptionRadio";

type Props = {
  memo: DecisionMemo;
  selectedOptionId: string | null;
  enabled: boolean;
  onSelect: (optionId: string | null) => void;
};

export function MemoPanel({ memo, selectedOptionId, enabled, onSelect }: Props) {
  const [expanded, setExpanded] = useState(true);

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
              <span className="text-xs border border-ink/30 px-1 text-ink/40">required</span>
            )}
            {memo.optional && (
              <span className="text-xs border border-border px-1 text-ink/30">optional</span>
            )}
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-ink">{memo.title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selectedOptionId && (
            <span className="text-xs font-mono text-brass">✓</span>
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
              Include this memo
            </label>
          )}

          {(!memo.optional || enabled) && (
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
          )}
        </div>
      )}
    </div>
  );
}
