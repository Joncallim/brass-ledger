import type { StaffFunctionReadout } from "@brass-ledger/shared";
import { StatusBadge } from "../../components/StatusBadge";

type Props = {
  previous: StaffFunctionReadout[];
  current: StaffFunctionReadout[];
};

export function StaffConsequences({ previous, current }: Props) {
  if (current.length === 0) return null;

  return (
    <section>
      <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">S1–S5 consequences</p>
      <div className="space-y-2">
        {current.map((fn) => {
          const prev = previous.find((p) => p.id === fn.id);
          const changed = prev && prev.status !== fn.status;
          return (
            <div key={fn.id} className={`border px-4 py-3 ${changed ? "border-brass/40 bg-brass/5" : "border-border"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-sm font-semibold">{fn.shortLabel} {fn.label}</span>
                {prev && prev.status !== fn.status && (
                  <span className="text-xs text-ink/40 font-mono">
                    <StatusBadge status={prev.status} /> → <StatusBadge status={fn.status} />
                  </span>
                )}
                {(!prev || prev.status === fn.status) && (
                  <StatusBadge status={fn.status} />
                )}
              </div>
              <p className="text-sm text-ink/60 leading-relaxed">{fn.consequence}</p>
              {fn.warnings.length > 0 && (
                <div className="mt-1.5">
                  {fn.warnings.map((w) => (
                    <p key={w} className="text-xs text-yellow-400">⚠ {w}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
