type PresentationMode = "standard" | "compact";

type Props = {
  mode: PresentationMode;
  onChange: (mode: PresentationMode) => void;
};

/** A local presentation preference. It never changes a campaign, forecast, or commitment. */
export function PresentationModeToggle({ mode, onChange }: Props) {
  const compact = mode === "compact";
  return (
    <button
      type="button"
      aria-pressed={compact}
      onClick={() => onChange(compact ? "standard" : "compact")}
      className="border border-border bg-paper px-3 py-2 text-xs text-ink shadow hover:border-brass"
    >
      {compact ? "Standard view" : "Compact view"}
    </button>
  );
}

export type { PresentationMode };
