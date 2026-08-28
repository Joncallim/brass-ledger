import type { ChiefCoalitionEntry } from "@brass-ledger/shared";
import { directorateLabel } from "@brass-ledger/shared";
import { coalitionPostureHelp, coalitionPostureLabel } from "../../lib/labels";

type Props = {
  coalitions: ChiefCoalitionEntry[];
};

const postureColor: Record<ChiefCoalitionEntry["posture"], string> = {
  supporting: "text-green-400 border-green-700/60",
  conditional: "text-yellow-400 border-yellow-700/60",
  contested: "text-orange-400 border-orange-700/60",
  blocked: "text-red-400 border-red-600",
};

export function CoalitionSummary({ coalitions }: Props) {
  if (coalitions.length === 0) return null;

  return (
    <div className="border border-border bg-paper/60 px-4 py-3 mb-6">
      <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Support for each option</p>
      <p className="text-xs text-ink/50 mb-3 leading-relaxed">
        {coalitionPostureHelp.map((entry, index) => (
          <span key={entry.label}>
            {index > 0 && " · "}
            <span className="text-ink/70">{entry.label}</span> — {entry.meaning}
          </span>
        ))}
        . None of these stop you from committing an option.
      </p>
      <div className="space-y-2">
        {coalitions.map((c) => (
          <div key={`${c.memoId}:${c.optionId}`} className="flex items-start gap-3 text-xs">
            <span className={`border px-1.5 py-0.5 shrink-0 ${postureColor[c.posture]}`}>
              {coalitionPostureLabel[c.posture] ?? c.posture}
            </span>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-ink/80">{c.optionLabel}</span>
              {c.supportChiefNames.length > 0 && (
                <span className="text-green-400 ml-2">Backs it: {c.supportChiefNames.join(", ")}</span>
              )}
              {c.conditionalChiefNames.length > 0 && (
                <span className="text-yellow-400 ml-2">Wants conditions: {c.conditionalChiefNames.join(", ")}</span>
              )}
              {c.objectionChiefNames.length > 0 && (
                <span className="text-red-400 ml-2">Objects: {c.objectionChiefNames.join(", ")}</span>
              )}
              {c.staffConstraintDirectorates.length > 0 && (
                <span className="text-ink/40 ml-2">
                  · already stretched: {c.staffConstraintDirectorates.map((d) => directorateLabel(d)).join(", ")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
