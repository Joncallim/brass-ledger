import type { StaffFunctionReadout } from "@brass-ledger/shared";
import { StatusBadge } from "./StatusBadge";

type Props = {
  readout: StaffFunctionReadout;
  onClose: () => void;
};

const metricStatusColor = {
  healthy: "text-ink",
  watch: "text-yellow-400",
  risk: "text-red-400 font-semibold",
};

const metricStatusLabel = {
  healthy: "Healthy",
  watch: "Watch",
  risk: "At risk",
};

export function StaffFunctionDetail({ readout, onClose }: Props) {
  return (
    <div className="min-w-0 border border-border bg-paper p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-ink/50 mb-0.5">Your staff team</p>
          <h3 className="break-words font-semibold text-ink">
            {readout.shortLabel} — {readout.label}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-ink/40 hover:text-ink text-lg leading-none border-none bg-transparent p-0"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <StatusBadge status={readout.status} />
        <span className="text-xs text-ink/50 font-mono" title="Burden points carried, against what this function can absorb in a month">
          {readout.burdenPoints}/{readout.capacity} work this month
        </span>
      </div>

      {readout.metrics.length > 0 && (
        <div className="mb-3 overflow-x-auto">
        <table className="w-full min-w-[12rem] text-xs">
          <thead>
            <tr className="text-left text-ink/40 uppercase tracking-wider border-b border-border">
              <th className="pb-1 font-normal pr-3">Measure</th>
              <th className="pb-1 font-normal pr-3">Value</th>
              <th className="pb-1 font-normal">What it means</th>
            </tr>
          </thead>
          <tbody>
            {readout.metrics.map((metric) => (
              <tr key={metric.label} className="border-b border-border/40">
                <td className="py-1 pr-3 text-ink/70">{metric.label}</td>
                <td className="py-1 pr-3 font-mono">{Math.round(metric.value)}</td>
                <td className={`py-1 ${metricStatusColor[metric.status]}`}>{metricStatusLabel[metric.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      <div className="mb-3">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">What needs attention</p>
        {readout.warnings.length > 0 ? (
          readout.warnings.map((w) => (
            <p key={w} className="text-xs text-yellow-400 leading-relaxed">⚠ {w}</p>
          ))
        ) : (
          <p className="text-xs text-ink/40 leading-relaxed">No current warning.</p>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">What this team does</p>
        <p className="text-xs text-ink/60 leading-relaxed">{readout.standingRemit}</p>
      </div>
    </div>
  );
}
