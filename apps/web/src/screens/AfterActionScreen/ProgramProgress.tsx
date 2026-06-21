import type { TechProgressNode, ExternalTechNode } from "@brass-ledger/shared";

type Props = {
  internalTech: TechProgressNode[];
  externalTech: ExternalTechNode[];
};

const levelLabel = ["Concept", "In development", "Fielded"];
const visibilityColor: Record<string, string> = {
  KNOWN: "text-green-400",
  ESTIMATED: "text-yellow-400",
  RUMORED: "text-red-400",
};

export function ProgramProgress({ internalTech, externalTech }: Props) {
  if (internalTech.length === 0 && externalTech.length === 0) return null;

  return (
    <section>
      <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Program and industry updates</p>
      <div className="grid grid-cols-2 gap-4">
        {internalTech.length > 0 && (
          <div>
            <p className="text-xs text-ink/40 uppercase tracking-wide mb-2">Internal programs</p>
            <div className="space-y-1.5">
              {internalTech.map((node) => (
                <div key={node.id} className="flex items-center gap-2 text-xs border border-border px-3 py-2">
                  <span className="font-mono text-ink/40 w-4">{node.progress}</span>
                  <span className="flex-1 text-ink/60 truncate">{node.id}</span>
                  <span className="text-ink/50 border border-border px-1">{levelLabel[node.level] ?? `L${node.level}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {externalTech.length > 0 && (
          <div>
            <p className="text-xs text-ink/40 uppercase tracking-wide mb-2">External constraints</p>
            <div className="space-y-1.5">
              {externalTech.map((node) => (
                <div key={node.id} className="flex items-center gap-2 text-xs border border-border px-3 py-2">
                  <span className={`font-mono w-16 ${visibilityColor[node.estimate.visibility] ?? "text-ink/40"}`}>
                    {node.estimate.visibility.toLowerCase()}
                  </span>
                  <span className="flex-1 text-ink/60 truncate">{node.id}</span>
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
