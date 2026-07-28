import type { MemoOption } from "@brass-ledger/shared";
import { directorateLabel } from "@brass-ledger/shared";
import { themeLabel } from "../../lib/labels";

type Props = {
  option: MemoOption;
  memoId: string;
  selected: boolean;
  onChange: (optionId: string) => void;
};

export function OptionRadio({ option, memoId, selected, onChange }: Props) {
  const burdenParts = option.burden.filter((b) => b.points > 0);

  return (
    <label
      className={`block border px-3 py-2.5 cursor-pointer transition-colors ${
        selected
          ? "border-brass bg-brass/5"
          : "border-border hover:border-brass/40 hover:bg-paper"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <input
          type="radio"
          name={`memo-${memoId}`}
          value={option.id}
          checked={selected}
          onChange={() => onChange(option.id)}
          className="mt-0.5 shrink-0 accent-[#b5882e]"
        />
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium ${selected ? "text-brass" : "text-ink"}`}>{option.label}</span>
          {option.summary && (
            <p className="text-xs text-ink/60 leading-relaxed mt-1 mb-1.5">{option.summary}</p>
          )}
          {burdenParts.length > 0 && (
            <p className="text-xs text-ink/50 mb-1.5">
              <span className="text-ink/40">Staff work this adds: </span>
              {burdenParts
                .map((b) => `${directorateLabel(b.directorate)} ${b.points}`)
                .join(", ")}
            </p>
          )}
          {option.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {option.tags.map((tag) => (
                <span key={tag} className="text-xs text-ink/40 border border-border/50 px-1">{themeLabel(tag)}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </label>
  );
}
