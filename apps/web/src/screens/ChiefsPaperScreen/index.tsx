import { useState } from "react";
import type { ChiefPositionEntry, ChiefCoalitionEntry, SessionAdvisor, ChiefConversationRecord, GameSession, DecisionMemo } from "@brass-ledger/shared";
import { CoalitionSummary } from "./CoalitionSummary";
import { ChiefPositionCard } from "./ChiefPositionCard";
import { ChiefConversationSheet } from "./ChiefConversationSheet";

type Props = {
  chiefPositions: ChiefPositionEntry[];
  chiefCoalitions: ChiefCoalitionEntry[];
  advisorRoster: SessionAdvisor[];
  session: GameSession;
  memos: DecisionMemo[];
  conversationBusy: boolean;
  conversationError: string | null;
  activeConversation: ChiefConversationRecord | null;
  onOpenConversation: (chiefId: string, memoId: string, optionId: string) => void;
  onRespond: (chiefId: string, responseId: string) => void;
  onProceed: () => void;
  onBack: () => void;
};

export function ChiefsPaperScreen({
  chiefPositions,
  chiefCoalitions,
  advisorRoster,
  session,
  memos,
  conversationBusy,
  conversationError,
  activeConversation,
  onOpenConversation,
  onRespond,
  onProceed,
  onBack,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleTalk(position: ChiefPositionEntry) {
    onOpenConversation(position.chiefId, position.memoId, position.optionId);
    setSheetOpen(true);
  }

  function handleRespond(responseId: string) {
    if (!activeConversation) return;
    onRespond(activeConversation.chiefId, responseId);
  }

  const uniquePositions = Object.values(
    chiefPositions.reduce<Record<string, ChiefPositionEntry>>((acc, pos) => {
      const key = pos.chiefId;
      if (!acc[key]) acc[key] = pos;
      return acc;
    }, {}),
  );

  return (
    <div className="relative">
      <div className="p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-5 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Chiefs paper</p>
            <h2 className="text-xl font-semibold tracking-tight text-ink">Where your chiefs stand</h2>
            <p className="text-xs text-ink/50 mt-1 max-w-xl leading-relaxed">
              Your chiefs have read the options you picked. Each one tells you whether they back the choice, accept
              its risk, want conditions attached, or object — and the staff evidence behind that view.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-ink/40 hover:text-ink border border-border px-2 py-1 shrink-0"
          >
            ← Back to memos
          </button>
        </div>

        <CoalitionSummary coalitions={chiefCoalitions} />

        <div className="space-y-3 mb-8">
          {uniquePositions.map((position) => {
            const advisor = advisorRoster.find((a) => a.chiefId === position.chiefId);
            return (
              <ChiefPositionCard
                key={position.chiefId}
                position={position}
                advisor={advisor}
                memos={memos}
                onTalk={() => handleTalk(position)}
              />
            );
          })}
          {uniquePositions.length === 0 && (
            <p className="text-sm text-ink/40">
              No chief has a position yet, because no option is selected. Go back to the memos and choose an option.
            </p>
          )}
        </div>

        <div className="pt-6 border-t border-border">
          <button
            type="button"
            onClick={onProceed}
            className="px-5 py-2.5 bg-brass text-white border border-brass hover:bg-brass/90 text-sm font-medium"
          >
            Continue to final review →
          </button>
          <p className="text-xs text-ink/40 mt-2 max-w-xl leading-relaxed">
            Talking to a chief is optional. You can speak to each chief once a month. A conversation changes how much
            that chief trusts you, and can put a commitment on the record, but it does not change the options you
            have selected.
          </p>
        </div>
      </div>

      {sheetOpen && activeConversation && (
        <>
          <div
            className="fixed inset-0 bg-ink/20 z-40"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />
          <ChiefConversationSheet
            conversation={activeConversation}
            chiefName={activeConversation.chiefName}
            busy={conversationBusy}
            error={conversationError}
            onRespond={handleRespond}
            onClose={() => setSheetOpen(false)}
          />
        </>
      )}
    </div>
  );
}
