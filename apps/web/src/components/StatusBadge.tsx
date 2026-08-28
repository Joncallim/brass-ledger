type Status = "ready" | "strained" | "overloaded" | "compromised";

const statusClasses: Record<Status, string> = {
  ready: "text-ink border-border",
  strained: "text-yellow-400 border-yellow-600/60 bg-yellow-950/40",
  overloaded: "text-red-400 border-red-600 bg-red-950/40",
  compromised: "text-red-200 border-red-600 bg-red-950/60",
};

const statusLabel: Record<Status, string> = {
  ready: "ready",
  strained: "strained",
  overloaded: "overloaded",
  compromised: "compromised",
};

type Props = {
  status: Status;
  className?: string;
};

export function StatusBadge({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center border px-1.5 py-0.5 text-xs font-mono uppercase tracking-wide ${statusClasses[status]} ${className}`}
    >
      {statusLabel[status]}
    </span>
  );
}
