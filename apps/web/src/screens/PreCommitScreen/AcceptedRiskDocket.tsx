import type { AcceptedRiskOverride } from "@brass-ledger/shared";

type Props = {
  candidates: AcceptedRiskOverride[];
  choices: Record<string, boolean>;
  onChange: (risk: AcceptedRiskOverride, accepted: boolean) => void;
};

function riskKey(risk: AcceptedRiskOverride) {
  return `${risk.staffFunctionId}:${risk.warningText}`;
}

export function AcceptedRiskDocket({ candidates, choices, onChange }: Props) {
  const acceptedCount = candidates.filter((r) => choices[riskKey(r)] === true).length;
  const allAccepted = candidates.length > 0 && acceptedCount === candidates.length;

  if (candidates.length === 0) {
    return (
      <div className="border border-border p-4">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Accepted risk docket</p>
        <p className="text-sm text-ink/60">No risk warnings projected. Ready to commit.</p>
      </div>
    );
  }

  return (
    <div className="border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest text-ink/40">Accepted risk docket</p>
        <span className={`text-xs border px-1.5 py-0.5 font-mono ${allAccepted ? "border-green-700/60 text-green-400 bg-green-950/40" : "border-yellow-700/60 text-yellow-400"}`}>
          {acceptedCount}/{candidates.length} accepted
        </span>
      </div>
      <p className="text-xs text-ink/50 mb-3">Acknowledge each projected S1–S5 warning before committing.</p>
      <div className="space-y-2">
        {candidates.map((risk) => {
          const key = riskKey(risk);
          return (
            <label key={key} className="flex items-start gap-2.5 border border-border px-3 py-2.5 cursor-pointer hover:bg-paper/60">
              <input
                type="checkbox"
                checked={choices[key] === true}
                onChange={(e) => onChange(risk, e.currentTarget.checked)}
                className="mt-0.5 accent-[#b5882e]"
              />
              <span className="text-sm leading-relaxed">
                <strong className="text-ink/70 font-mono text-xs">{risk.staffFunctionId}</strong>
                {" "}<span className="text-ink/60">{risk.warningText}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
