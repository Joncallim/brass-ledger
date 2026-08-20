import type { ChiefPositionEntry, SessionAdvisor, DecisionMemo, SpriteSpec } from "@brass-ledger/shared";
import { directorateLabel } from "@brass-ledger/shared";
import { ChiefPortrait } from "../../components/ChiefPortrait";
import { StaffReadoutEvidence } from "./StaffReadoutEvidence";

type Props = {
  position: ChiefPositionEntry;
  advisor: SessionAdvisor | undefined;
  sprite: SpriteSpec | undefined;
  memos: DecisionMemo[];
  onTalk: () => void;
};

const positionMeta = {
  support: { symbol: "▲", label: "Supports", color: "text-green-400 border-green-700/60 bg-green-950/40" },
  accept_risk: { symbol: "~", label: "Accepts the risk", color: "text-yellow-400 border-yellow-700/60 bg-yellow-950/40" },
  request_conditions: { symbol: "~", label: "Wants conditions", color: "text-yellow-400 border-yellow-700/60 bg-yellow-950/40" },
  oppose: { symbol: "▼", label: "Objects", color: "text-red-400 border-red-600/70/60 bg-red-950/40" },
};

export function ChiefPositionCard({ position, advisor, sprite, memos, onTalk }: Props) {
  const meta = positionMeta[position.position] ?? positionMeta.accept_risk;
  const memo = memos.find((m) => m.id === position.memoId);
  const option = memo?.options.find((o) => o.id === position.optionId);
  const memoTitle = memo?.title ?? "Unknown memo";
  const optionLabel = option?.label ?? "Unknown option";

  return (
    <div className={`border ${
      position.position === "oppose" ? "border-l-red-400 border-l-2 border-border" :
      position.position === "support" ? "border-l-green-400 border-l-2 border-border" :
      "border-border"
    } p-4`}>
      <div className="flex gap-3 mb-3">
        {advisor && sprite && (
          <ChiefPortrait
            sprite={sprite}
            title={advisor.title}
            size="sm"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-ink">{position.chiefName}</p>
              <p className="text-xs text-ink/50">{directorateLabel(position.directorate)}</p>
            </div>
            <span className={`text-xs border px-1.5 py-0.5 shrink-0 ${meta.color}`}>
              {meta.symbol} {meta.label}
            </span>
          </div>
        </div>
      </div>

      <div className="text-xs mb-2">
        <span className="uppercase tracking-widest text-ink/30 mr-1">{memoTitle}:</span>
        <span className="text-ink/70 font-medium">{optionLabel}</span>
      </div>

      {position.institutionalReason && (
        <p className="text-sm text-ink/70 leading-relaxed mb-2">
          {position.institutionalReason}
        </p>
      )}

      <StaffReadoutEvidence evidence={position.staffReadoutEvidence} />

      {position.agendaMemoryNote && (
        <p className="text-xs text-ink/40 mt-2 italic">{position.agendaMemoryNote}</p>
      )}

      {position.adviceStyleNote && (
        <p className="text-xs text-ink/40 mt-2 italic">{position.adviceStyleNote}</p>
      )}

      <div className="mt-3">
        <button
          type="button"
          onClick={onTalk}
          className="text-xs border border-border px-2.5 py-1 hover:border-brass hover:text-brass transition-colors"
        >
          Talk to {position.chiefName.split(" ").at(-1) ?? "this chief"}
        </button>
      </div>
    </div>
  );
}
