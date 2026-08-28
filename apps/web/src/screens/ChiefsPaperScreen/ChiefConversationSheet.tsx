import { useEffect, useRef } from "react";
import type { ChiefConversationRecord } from "@brass-ledger/shared";
import { chiefConversationStageMeta } from "@brass-ledger/shared";

type Props = {
  conversation: ChiefConversationRecord;
  chiefName: string;
  busy: boolean;
  error: string | null;
  onRespond: (responseId: string) => void;
  onClose: () => void;
};

const positionLabel: Record<string, string> = {
  support: "▲ Supports",
  accept_risk: "~ Accepts the risk",
  request_conditions: "~ Wants conditions",
  oppose: "▼ Objects",
};

export function ChiefConversationSheet({ conversation, chiefName, busy, error, onRespond, onClose }: Props) {
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [conversation.transcript.length]);

  const trustDeltaColor = conversation.totalTrustDelta > 0 ? "text-green-400" : conversation.totalTrustDelta < 0 ? "text-red-400" : "text-ink/50";
  const stage = chiefConversationStageMeta(conversation.stage);

  return (
    <div
      role="dialog"
      aria-labelledby="conversation-title"
      className="fixed inset-y-0 right-0 w-[480px] bg-paper border-l border-border shadow-xl flex flex-col z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-0.5">
            {conversation.status === "completed"
              ? "Conversation finished"
              : `${stage.label} — step ${stage.index} of ${stage.total}`}
          </p>
          <h2 id="conversation-title" className="text-sm font-semibold text-ink">{chiefName}</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono ${trustDeltaColor}`} title="How much this chief trusts you, out of 100">
            Trust {Math.round(conversation.trustBefore)} → {Math.round(conversation.trustAfter)}
            {conversation.totalTrustDelta !== 0 && ` (${conversation.totalTrustDelta > 0 ? "+" : ""}${conversation.totalTrustDelta})`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-ink/40 hover:text-ink border-none bg-transparent text-xl leading-none"
            aria-label="Close conversation"
          >
            ×
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-border/60 shrink-0 bg-paper/60">
        <div className="flex items-center gap-2 text-xs">
          <span className={`border px-1.5 py-0.5 ${
            conversation.position === "support" ? "text-green-400 border-green-700/60" :
            conversation.position === "oppose" ? "text-red-400 border-red-600" :
            "text-yellow-400 border-yellow-700/60"
          }`}>
            {positionLabel[conversation.position] ?? conversation.position}
          </span>
          <span className="text-ink/50">{conversation.memoTitle} — {conversation.optionLabel}</span>
        </div>
        {conversation.institutionalReason && (
          <p className="text-xs text-ink/60 mt-1.5 leading-relaxed">{conversation.institutionalReason}</p>
        )}
      </div>

      <div ref={transcriptRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {conversation.transcript.map((turn, i) => (
          <div key={i} className={`text-xs ${turn.role === "commander" ? "text-right" : ""}`}>
            <span className="text-ink/30 uppercase tracking-wide mr-2">{turn.speaker}</span>
            <p className={`inline text-sm leading-relaxed ${turn.role === "commander" ? "text-ink/70" : "text-ink"}`}>
              {turn.text}
            </p>
          </div>
        ))}
        {conversation.status === "completed" && (
          <div className="border border-border bg-paper/80 px-3 py-2 text-center">
            <p className="text-xs text-ink/50">
              This conversation is finished. What you agreed is on the record and cannot be reopened this month.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="px-4 py-2 border-t border-red-800 bg-red-950/40 shrink-0">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {conversation.status !== "completed" && conversation.choices.length > 0 && (
        <div className="px-4 py-4 border-t border-border shrink-0 space-y-2">
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-2">How you reply</p>
          {conversation.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => onRespond(choice.id)}
              disabled={busy}
              className="w-full text-left border border-border px-3 py-2.5 hover:border-brass hover:bg-paper disabled:opacity-40 transition-colors"
            >
              <p className="text-xs font-medium text-ink mb-0.5">{choice.label}</p>
              <p className="text-xs text-ink/50 leading-relaxed">{choice.summary}</p>
              {choice.trustDelta !== 0 && (
                <p className={`text-xs font-mono mt-1 ${choice.trustDelta > 0 ? "text-green-400" : "text-red-400"}`}>
                  Trust {choice.trustDelta > 0 ? "+" : ""}{choice.trustDelta}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
