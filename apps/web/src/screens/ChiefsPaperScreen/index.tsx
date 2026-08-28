import { useEffect, useRef, useState } from "react";
import { buildChiefSpriteSpec, relationshipLabel, type ChiefPositionEntry, type ChiefCoalitionEntry, type SessionAdvisor, type ChiefConversationRecord, type GameSession, type DecisionMemo, type ScenarioSummary } from "@brass-ledger/shared";
import { CoalitionSummary } from "./CoalitionSummary";
import { ChiefPositionCard } from "./ChiefPositionCard";
import { ChiefConversationSheet } from "./ChiefConversationSheet";
import { ContextualTeaching } from "../../components/ContextualTeaching";

type Props = {
  chiefPositions: ChiefPositionEntry[];
  chiefCoalitions: ChiefCoalitionEntry[];
  advisorRoster: SessionAdvisor[];
  session: GameSession;
  scenario: ScenarioSummary;
  memos: DecisionMemo[];
  conversationBusy: boolean;
  conversationError: string | null;
  activeConversation: ChiefConversationRecord | null;
  compactPresentation?: boolean;
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
  scenario,
  memos,
  conversationBusy,
  conversationError,
  activeConversation,
  compactPresentation = false,
  onOpenConversation,
  onRespond,
  onProceed,
  onBack,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const conversationInvokerRef = useRef<HTMLButtonElement | null>(null);
  const restoreConversationFocusRef = useRef(false);

  useEffect(() => {
    if (!sheetOpen && restoreConversationFocusRef.current) {
      restoreConversationFocusRef.current = false;
      conversationInvokerRef.current?.focus();
    }
  }, [sheetOpen]);

  function handleTalk(position: ChiefPositionEntry, invoker: HTMLButtonElement) {
    conversationInvokerRef.current = invoker;
    onOpenConversation(position.chiefId, position.memoId, position.optionId);
    setSheetOpen(true);
  }

  function handleCloseConversation() {
    restoreConversationFocusRef.current = true;
    setSheetOpen(false);
  }

  function handleRespond(responseId: string) {
    if (!activeConversation) return;
    onRespond(activeConversation.chiefId, responseId);
  }

  const positionsByChief = Object.values(
    chiefPositions.reduce<Record<string, ChiefPositionEntry[]>>((acc, position) => {
      (acc[position.chiefId] ??= []).push(position);
      return acc;
    }, {}),
  );

  return (
    <div className="relative">
      <div className="p-6 max-w-3xl">
        <ContextualTeaching concept="chief-terms" title="Chiefs can constrain the packet">
          A chief may support, attach a condition, or record dissent. Discussion is about the selected issue in this month&apos;s packet; a promise can shape later choices, but you remain responsible for accepting its cost.
        </ContextualTeaching>
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
          {positionsByChief.map((positions) => {
            const position = positions[0]!;
            const advisor = advisorRoster.find((a) => a.chiefId === position.chiefId);
            const chief = scenario.chiefs.find((candidate) => candidate.id === position.chiefId);
            const sprite = advisor && chief
              ? buildChiefSpriteSpec({
                chief, portrait: advisor.portrait, sessionSeed: session.id,
                variantState: {
                  trustBand: relationshipLabel(session.state.chiefTrust[chief.id] ?? 50),
                  burdenLevel: position.staffReadoutEvidence.burdenLevel,
                  campaignStatus: session.state.campaignStatus,
                  s2ExternalEstimateConfidence: session.state.staffMechanics.s2.externalEstimateConfidence,
                  s4SupportableTempo: session.state.staffMechanics.s4.supportableTempo,
                },
                visualLanguage: scenario.spriteVisualLanguage,
              })
              : undefined;
            return (
              <div key={position.chiefId} className="border border-border">
                <ChiefPositionCard
                  position={position}
                  advisor={advisor}
                  sprite={sprite}
                  memos={memos}
                  compactPresentation={compactPresentation}
                  onTalk={(invoker) => handleTalk(position, invoker)}
                />
                {positions.length > 1 && (
                  <div className="border-t border-border px-4 py-3">
                    <p className="text-xs uppercase tracking-widest text-ink/40 mb-2">Other selected issues</p>
                    <div className="space-y-2">
                      {positions.slice(1).map((issue) => {
                        const issueMemo = memos.find((memo) => memo.id === issue.memoId);
                        const issueOption = issueMemo?.options.find((option) => option.id === issue.optionId);
                        return (
                        <div key={`${issue.memoId}:${issue.optionId}`} className="flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <span className="text-ink/70 font-medium">{issueMemo?.title ?? "Selected issue"}</span>
                            <span className="text-ink/40"> — {issueOption?.label ?? "Selected option"}</span>
                            <span className="ml-2 text-ink/50">{issue.requiredCondition}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(event) => handleTalk(issue, event.currentTarget)}
                            className="shrink-0 border border-border px-2 py-1 hover:border-brass hover:text-brass"
                          >
                            Discuss
                          </button>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {positionsByChief.length === 0 && (
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
            onClick={handleCloseConversation}
            aria-hidden="true"
          />
          <ChiefConversationSheet
            conversation={activeConversation}
            chiefName={activeConversation.chiefName}
            busy={conversationBusy}
            error={conversationError}
            onRespond={handleRespond}
            onClose={handleCloseConversation}
          />
        </>
      )}
    </div>
  );
}
