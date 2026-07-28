import { useState } from "react";
import type { ExplainabilityEntry } from "@brass-ledger/shared";

type Props = {
  entries: ExplainabilityEntry[];
};

export function ExplainabilityDrawer({ entries }: Props) {
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  return (
    <div className="border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-paper/50 hover:bg-paper text-left border-none"
      >
        <span className="text-xs uppercase tracking-widest text-ink/50">Why the numbers moved</span>
        <span className="text-xs text-ink/40">{open ? "▲ Hide" : "▼ Show"}</span>
      </button>

      {open && (
        <div className="p-4 space-y-4">
          {entries.map((entry) => (
            <div key={entry.label} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-0.5">{entry.label}</p>
              <p className="text-sm text-ink mb-2">{entry.summary}</p>
              {entry.positiveDrivers.length > 0 && (
                <div className="mb-1">
                  <span className="text-xs text-ink/50 uppercase tracking-wide">Helped — </span>
                  <span className="text-xs text-ink/60">{entry.positiveDrivers.join(" · ")}</span>
                </div>
              )}
              {entry.blockers.length > 0 && (
                <div className="mb-1">
                  <span className="text-xs text-ink/50 uppercase tracking-wide">Held it back — </span>
                  <span className="text-xs text-red-400">{entry.blockers.join(" · ")}</span>
                </div>
              )}
              {entry.causalRefs.length > 0 && (
                <details className="mt-1">
                  <summary className="text-xs text-ink/30 cursor-pointer">Engine references</summary>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.causalRefs.map((ref) => (
                      <span key={ref} className="text-xs font-mono text-ink/40 border border-border px-1">{ref}</span>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
