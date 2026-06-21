type BurdenLevel = "light" | "strained" | "overloaded";

const fillColor: Record<BurdenLevel, string> = {
  light: "bg-ink/40",
  strained: "bg-yellow-500",
  overloaded: "bg-red-500",
};

type Props = {
  points: number;
  capacity: number;
  level: BurdenLevel;
  maxSegments?: number;
};

export function BurdenBar({ points, capacity, level, maxSegments = 8 }: Props) {
  const segments = Math.max(capacity, points, maxSegments);
  const filled = Math.min(points, segments);
  const color = fillColor[level];

  return (
    <span className="inline-flex gap-px" aria-label={`${points}/${capacity} burden`}>
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          className={`inline-block h-3 w-2.5 border border-border/60 ${i < filled ? color : "bg-paper"}`}
        />
      ))}
    </span>
  );
}
