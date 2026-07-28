import type { TechProgressNode, ExternalTechNode } from "@brass-ledger/shared";
import { estimateVisibilityLabel, programLevelLabel, type ScenarioLabels } from "../../lib/labels";

type Props = {
  internalTech: TechProgressNode[];
  externalTech: ExternalTechNode[];
  labels: ScenarioLabels;
};

const visibilityColor: Record<string, string> = {
  KNOWN: "text-green-400",
  ESTIMATED: "text-yellow-400",
  RUMORED: "text-red-400",
};

export function ProgramProgress({ internalTech, externalTech, labels }: Props) {
  if (internalTech.length === 0 && externalTech.length === 0) return null;

  return (
    <section>
      <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Programs and outside pressures</p>
      <div className="grid grid-cols-2 gap-4">
        {internalTech.length > 0 && (
          <div>
            <p className="text-xs text-ink/40 uppercase tracking-wide mb-1">Your programs</p>
            <p className="text-xs text-ink/40 mb-2 leading-relaxed">Progress out of 100, and the stage reached.</p>
            <div className="space-y-1.5">
              {internalTech.map((node) => (
                <div key={node.id} className="flex items-center gap-2 text-xs border border-border px-3 py-2">
                  <span className="font-mono text-ink/40 w-9 shrink-0">{node.progress}</span>
                  <span className="flex-1 text-ink/60 truncate" title={labels.program(node.id)}>{labels.program(node.id)}</span>
                  <span className="text-ink/50 border border-border px-1">
                    {programLevelLabel[node.level] ?? `Level ${node.level}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {externalTech.length > 0 && (
          <div>
            <p className="text-xs text-ink/40 uppercase tracking-wide mb-1">Outside pressures</p>
            <p className="text-xs text-ink/40 mb-2 leading-relaxed">
              How reliably you can see each one, and how confident that reading is.
            </p>
            <div className="space-y-1.5">
              {externalTech.map((node) => (
                <div key={node.id} className="flex items-center gap-2 text-xs border border-border px-3 py-2">
                  <span className={`w-20 shrink-0 ${visibilityColor[node.estimate.visibility] ?? "text-ink/40"}`}>
                    {estimateVisibilityLabel[node.estimate.visibility] ?? node.estimate.visibility}
                  </span>
                  <span className="flex-1 text-ink/60 truncate" title={labels.constraint(node.id)}>{labels.constraint(node.id)}</span>
                  <span className="text-ink/40 font-mono">{node.estimate.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
