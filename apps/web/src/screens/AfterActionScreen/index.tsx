import type { TurnResult, StaffFunctionReadout } from "@brass-ledger/shared";
import { StaffConsequences } from "./StaffConsequences";
import { EventList } from "./EventList";
import { ProgramProgress } from "./ProgramProgress";
import { ExplainabilityDrawer } from "../../components/ExplainabilityDrawer";

type Props = {
  result: TurnResult;
  previousStaffFunctions: StaffFunctionReadout[];
  onNextMonth: () => void;
  onViewRecords: () => void;
};

export function AfterActionScreen({ result, previousStaffFunctions, onNextMonth, onViewRecords }: Props) {
  const isCampaignOver = result.nextState.campaignStatus !== "active";
  const won = result.nextState.campaignStatus === "won";

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">After action</p>

        {isCampaignOver ? (
          <div className={`border p-4 mb-4 ${won ? "border-green-700/60 bg-green-950/40" : "border-red-600/70/60 bg-red-950/40"}`}>
            <h2 className={`text-xl font-semibold tracking-tight mb-1 ${won ? "text-green-300" : "text-red-300"}`}>
              Campaign {won ? "won" : "lost"}
            </h2>
            <p className={`text-sm ${won ? "text-green-400" : "text-red-400"}`}>
              Final score: {Math.round(result.nextState.campaignScore)}
              {result.nextState.campaignOutcome && ` — ${result.nextState.campaignOutcome}`}
            </p>
          </div>
        ) : (
          <h2 className="text-xl font-semibold tracking-tight text-ink mb-2">
            Turn {result.input.turn} resolved
          </h2>
        )}

        <p className="text-sm text-ink/60 leading-relaxed max-w-2xl">{result.summary}</p>

        {result.replayHash && (
          <details className="mt-2">
            <summary className="text-xs text-ink/30 cursor-pointer">Replay hash</summary>
            <span className="text-xs font-mono text-ink/30">{result.replayHash}</span>
          </details>
        )}
      </div>

      <div className="space-y-6">
        <StaffConsequences
          previous={previousStaffFunctions}
          current={result.staffFunctions}
        />

        {result.afterAction.length > 0 && (
          <section>
            <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Notes</p>
            <div className="space-y-2">
              {result.afterAction.map((note) => (
                <div key={note.heading} className="border border-border px-4 py-3">
                  <p className="text-xs font-semibold text-ink/70 mb-1">{note.heading}</p>
                  <p className="text-sm text-ink/60 leading-relaxed">{note.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <EventList events={result.triggeredEvents} />

        <ProgramProgress internalTech={result.internalTech} externalTech={result.externalTech} />

        {result.acceptedRisks.length > 0 && (
          <section>
            <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Accepted risks</p>
            <div className="space-y-1">
              {result.acceptedRisks.map((r) => (
                <div key={`${r.staffFunctionId}:${r.warningText}`} className="flex items-start gap-3 text-xs border border-border px-3 py-2">
                  <span className="font-mono text-ink/50 shrink-0">{r.staffFunctionId}</span>
                  <span className="text-ink/60 flex-1">{r.warningText}</span>
                  <span className={r.accepted ? "text-green-400" : "text-red-400"}>{r.accepted ? "accepted" : "not accepted"}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <ExplainabilityDrawer entries={result.explainability} />
      </div>

      <div className="mt-8 pt-6 border-t border-border flex gap-3">
        {!isCampaignOver && (
          <button
            type="button"
            onClick={onNextMonth}
            className="px-5 py-2.5 bg-brass text-white border border-brass hover:bg-brass/90 text-sm font-medium"
          >
            Next month →
          </button>
        )}
        <button
          type="button"
          onClick={onViewRecords}
          className="px-4 py-2.5 border border-border text-ink hover:border-brass text-sm"
        >
          View records
        </button>
      </div>
    </div>
  );
}
