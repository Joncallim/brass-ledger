import type { StaffFunctionReadout } from "@brass-ledger/shared";
import { StatusBadge } from "./StatusBadge";
import { BurdenBar } from "./BurdenBar";

type Props = {
  readout: StaffFunctionReadout;
  onClick?: () => void;
  active?: boolean;
};

export function StaffFunctionBadge({ readout, onClick, active = false }: Props) {
  const level = readout.status === "compromised" ? "overloaded" : readout.status === "overloaded" ? "overloaded" : readout.status === "strained" ? "strained" : "light";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 border transition-colors ${
        active
          ? "border-brass bg-brass/5"
          : "border-border hover:border-brass/50 hover:bg-paper/80"
      } ${readout.status === "overloaded" || readout.status === "compromised" ? "border-l-red-500 border-l-2" : readout.status === "strained" ? "border-l-yellow-500 border-l-2" : ""}`}
    >
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span className="font-semibold text-sm text-ink">{readout.shortLabel}</span>
        <StatusBadge status={readout.status} />
      </div>
      <div className="text-xs text-ink/60 mb-1.5 truncate">{readout.label}</div>
      <BurdenBar points={readout.burdenPoints} capacity={readout.capacity} level={level} maxSegments={6} />
      <div className="text-xs text-ink/50 mt-1 font-mono">{readout.burdenPoints}/{readout.capacity}</div>
    </button>
  );
}
