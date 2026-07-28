import type { StaffNegotiation } from "@brass-ledger/shared";
import { directorateLabel } from "@brass-ledger/shared";

type Props = {
  candidates: StaffNegotiation["directorate"][];
  active: StaffNegotiation[];
  onChange: (directorate: StaffNegotiation["directorate"], enabled: boolean) => void;
};

export function StaffNegotiationPanel({ candidates, active, onChange }: Props) {
  if (candidates.length === 0) return null;

  return (
    <div className="border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest text-ink/40">Take work off a stretched directorate</p>
        <span className="text-xs font-mono text-ink/40">{active.length} requested</span>
      </div>
      <p className="text-xs text-ink/50 mb-3 leading-relaxed">
        These directorates are carrying more than they should this month. You can lift 1 burden point off any of
        them, but it spends political cover: cabinet cover and political capital fall, and media heat rises.
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
              <span className="text-sm text-ink/70">{directorateLabel(directorate)}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
