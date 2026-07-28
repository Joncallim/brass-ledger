import type { ChiefStaffReadoutEvidence } from "@brass-ledger/shared";

type Props = {
  evidence: ChiefStaffReadoutEvidence;
};

const metricStatusColor = {
  healthy: "text-ink/60",
  watch: "text-yellow-400",
  risk: "text-red-400 font-semibold",
};

const metricStatusWord = {
  healthy: "healthy",
  watch: "worth watching",
  risk: "in the risk band",
};

const burdenWord = {
  overloaded: "overloaded",
  strained: "strained",
  light: "inside capacity",
};

export function StaffReadoutEvidence({ evidence }: Props) {
  return (
    <div className="text-xs border-t border-border/40 pt-2 mt-2 text-ink/60 leading-relaxed">
      <span className="uppercase tracking-widest text-ink/30 mr-2">Based on</span>
      <span>
        {evidence.staffFunctionLabel}: {evidence.metricLabel} is{" "}
        <span className={metricStatusColor[evidence.metricStatus]}>{Math.round(evidence.metricValue)}</span>
        {" "}({metricStatusWord[evidence.metricStatus]}), and the staff carrying this work are{" "}
        {burdenWord[evidence.burdenLevel]} at {evidence.burdenPoints}{" "}
        {evidence.burdenPoints === 1 ? "burden point" : "burden points"}.
      </span>
    </div>
  );
}
