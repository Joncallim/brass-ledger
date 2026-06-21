import type { MemoOption } from "@brass-ledger/shared";

type Props = {
  option: MemoOption;
  memoId: string;
  selected: boolean;
  onChange: (optionId: string) => void;
};

const directorateShort: Record<string, string> = {
  people: "S1",
  intelligence: "S2",
  operations: "S3",
  sustainment: "S4",
  plans: "S5",
  training: "J7",
};

export function OptionRadio({ option, memoId, selected, onChange }: Props) {
  const burdenParts = option.burden
    .filter((b) => b.points > 0)
    .map((b) => `${directorateShort[b.directorate] ?? b.directorate} ${b.points}`);

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
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className={`text-sm font-medium ${selected ? "text-brass" : "text-ink"}`}>{option.label}</span>
            {burdenParts.length > 0 && (
              <span className="text-xs font-mono text-ink/50 shrink-0">{burdenParts.join(", ")}</span>
            )}
          </div>
          {option.summary && (
            <p className="text-xs text-ink/60 leading-relaxed mb-1.5">{option.summary}</p>
          )}
          {option.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {option.tags.map((tag) => (
                <span key={tag} className="text-xs font-mono text-ink/40 border border-border/50 px-1">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </label>
  );
}
