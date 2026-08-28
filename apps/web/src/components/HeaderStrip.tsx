import type { CampaignState, CampaignBrief } from "@brass-ledger/shared";
import { countMetCampaignObjectives } from "@brass-ledger/shared";

type Props = {
  briefing?: CampaignBrief;
  state?: CampaignState;
  onNavigateHub: () => void;
  onNavigateRecords: () => void;
};

export function HeaderStrip({ briefing, state, onNavigateHub, onNavigateRecords }: Props) {
  const milestones = state ? countMetCampaignObjectives(state) : null;

  return (
    <header className="flex items-center gap-4 px-4 py-2 border-b border-border bg-paper/80 shrink-0">
      <button
        type="button"
        onClick={onNavigateHub}
        title="Back to your campaigns"
        className="font-semibold tracking-tight text-ink text-sm border-none bg-transparent p-0 hover:text-brass"
      >
        BRASS LEDGER
      </button>

      {state && (
        <>
          <span className="text-ink/30">|</span>
          <span className="text-xs text-ink/60 font-mono">
            Month {Math.min(state.turn, state.maxTurns)} of {state.maxTurns}
          </span>
          <span className="text-ink/30">|</span>
          <span className={`text-xs font-mono ${
            state.campaignStatus === "won" ? "text-green-400" :
            state.campaignStatus === "lost" ? "text-red-400" : "text-ink/60"
          }`}>
            {state.campaignStatus === "active"
              ? `Score ${Math.round(state.campaignScore)}`
              : state.campaignStatus === "won" ? "Campaign won" : "Campaign lost"}
          </span>
          {milestones && milestones.total > 0 && (
            <>
              <span className="text-ink/30">|</span>
              <span
                className="text-xs text-ink/50"
                title="How many campaign objectives you are currently meeting"
              >
                {milestones.met} of {milestones.total} milestones met
              </span>
            </>
          )}
        </>
      )}

      {briefing && (
        <>
          <span className="text-ink/30">|</span>
          <span className="text-xs text-ink/50 truncate">{briefing.theater}</span>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onNavigateRecords}
          className="text-xs text-ink/50 hover:text-ink border border-border px-2 py-1"
        >
          Records
        </button>
      </div>
    </header>
  );
}
