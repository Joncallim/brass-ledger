import type { StaffNegotiation } from "@brass-ledger/shared";

type Props = {
  candidates: StaffNegotiation["directorate"][];
  active: StaffNegotiation[];
  onChange: (directorate: StaffNegotiation["directorate"], enabled: boolean) => void;
};

const costLabel: Record<StaffNegotiation["cost"], string> = {
  political_cover: "political cover",
  readiness_delay: "readiness margin",
  budget_overtime: "budget authority",
};

export function StaffNegotiationPanel({ candidates, active, onChange }: Props) {
  if (candidates.length === 0) return null;

  return (
    <div className="border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest text-ink/40">Staff negotiations</p>
        <span className="text-xs font-mono text-ink/40">{active.length} active</span>
      </div>
      <p className="text-xs text-ink/50 mb-3">
        Relieve constrained staff directorates before committing. Each negotiation costs one resource.
      </p>
      <div className="space-y-2">
        {candidates.map((directorate) => {
          const isActive = active.some((n) => n.directorate === directorate);
          return (
            <label key={directorate} className="flex items-start gap-2.5 border border-border px-3 py-2.5 cursor-pointer hover:bg-paper/60">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => onChange(directorate, e.currentTarget.checked)}
                className="mt-0.5 accent-[#b5882e]"
              />
              <span className="text-sm">
                <strong className="text-ink/70 capitalize">{directorate}</strong>{" "}
                <span className="text-ink/50 text-xs">— relieve 1 burden point</span>{" "}
                <span className="text-ink/40 text-xs">(cost: {costLabel.political_cover})</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
