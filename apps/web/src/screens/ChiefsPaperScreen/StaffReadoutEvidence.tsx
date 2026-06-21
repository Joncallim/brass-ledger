import type { ChiefStaffReadoutEvidence } from "@brass-ledger/shared";

type Props = {
  evidence: ChiefStaffReadoutEvidence;
};

const metricStatusColor = {
  healthy: "text-ink/60",
  watch: "text-yellow-400",
  risk: "text-red-400 font-semibold",
};

export function StaffReadoutEvidence({ evidence }: Props) {
  return (
    <div className="text-xs border-t border-border/40 pt-2 mt-2">
      <span className="uppercase tracking-widest text-ink/30 mr-2">Evidence:</span>
      <span className="text-ink/60">
        {evidence.staffFunctionLabel} — {evidence.metricLabel}{" "}
        <span className={metricStatusColor[evidence.metricStatus]}>
          {Math.round(evidence.metricValue)}
        </span>
        {" "}[{evidence.burdenLevel === "overloaded" ? "overloaded" : evidence.burdenLevel === "strained" ? "strained" : "inside capacity"}, burden {evidence.burdenPoints}] —{" "}
        <span className="italic">{evidence.rationale}</span>
      </span>
    </div>
  );
}
