import { buildCampaignLegibility, type TurnResult, type StaffFunctionReadout } from "@brass-ledger/shared";
import { StaffConsequences } from "./StaffConsequences";
import { StaffModuleConsequences } from "../../components/StaffModuleConsequences";
import { EventList } from "./EventList";
import { ProgramProgress } from "./ProgramProgress";
import { ExplainabilityDrawer } from "../../components/ExplainabilityDrawer";
import { ContextualTeaching } from "../../components/ContextualTeaching";
import type { ScenarioLabels } from "../../lib/labels";

type Props = {
  result: TurnResult;
  previousStaffFunctions: StaffFunctionReadout[];
  labels: ScenarioLabels;
  compactPresentation?: boolean;
  onNextMonth: () => void;
  onViewRecords: () => void;
};

export function AfterActionScreen({ result, previousStaffFunctions, labels, compactPresentation = false, onNextMonth, onViewRecords }: Props) {
  const isCampaignOver = result.nextState.campaignStatus !== "active";
  const won = result.nextState.campaignStatus === "won";
  const legibility = buildCampaignLegibility(result.nextState, result.previousState);
  const mainGain = result.afterAction.find((note) => /gain|improved|recovered|dividend/i.test(note.heading + note.detail));
  const mainCost = result.afterAction.find((note) => /cost|slipped|overload|strain|debt/i.test(note.heading + note.detail));
  const matured = result.afterAction.find((note) => /matured|fulfilled|breach|commitment/i.test(note.heading + note.detail));

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">After action</p>

        {isCampaignOver ? (
          <div className={`border p-4 mb-4 ${won ? "border-green-700 bg-green-950/40" : "border-red-600 bg-red-950/40"}`}>
            <h2 className={`text-xl font-semibold tracking-tight mb-1 ${won ? "text-green-300" : "text-red-300"}`}>
              Campaign {won ? "won" : "lost"}
            </h2>
            <p className={`text-sm ${won ? "text-green-400" : "text-red-400"}`}>
              Final score: {Math.round(result.nextState.campaignScore)} out of 100
              {result.nextState.campaignOutcome && ` — ${result.nextState.campaignOutcome}`}
            </p>
          </div>
        ) : (
          <h2 className="text-xl font-semibold tracking-tight text-ink mb-2">
            What happened in month {result.input.turn}
          </h2>
        )}

        <p className="text-sm text-ink/60 leading-relaxed max-w-2xl">{result.summary}</p>

        {result.replayHash && (
          <details className="mt-2">
            <summary className="text-xs text-ink/30 cursor-pointer">Replay checksum for this month</summary>
            <p className="text-xs text-ink/30 leading-relaxed mt-1">
              A fingerprint of this month's result. The records room uses it to confirm a saved campaign still
              replays to exactly the same outcome.
            </p>
            <span className="text-xs font-mono text-ink/30">{result.replayHash}</span>
          </details>
        )}
      </div>

      <div className="space-y-6">
        <ContextualTeaching concept="after-action" title="Read the result, then adjust">
          Read this in four parts: what worked, what it cost, what carried forward, and what needs attention next month. On the next turn, change the part of the plan that caused the cost you do not want to carry.
        </ContextualTeaching>
        <section className="border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Command consequence digest</p>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div><p className="text-xs text-green-400 mb-1">Main gain</p><p className="text-ink/65">{mainGain?.detail ?? "No single gain dominated this month; the packet held the current position."}</p></div>
            <div><p className="text-xs text-red-400 mb-1">Main cost</p><p className="text-ink/65">{mainCost?.detail ?? "No single new cost dominated the month; remaining pressure still carries forward."}</p></div>
            <div><p className="text-xs text-yellow-400 mb-1">What matured</p><p className="text-ink/65">{matured?.detail ?? "No commitment, programme, or doctrine consequence closed this month."}</p></div>
            <div><p className="text-xs text-ink/45 mb-1">Next pressure</p><p className="text-ink/65">{legibility.risks.slice(0, 2).map((risk) => `${risk.label}: ${risk.status}, ${risk.trend}`).join(" · ")}</p></div>
          </div>
        </section>
        <details open={!compactPresentation} className="group">
          <summary className="cursor-pointer list-none text-xs uppercase tracking-widest text-ink/40">Staff consequences {compactPresentation ? "— expand detail" : ""}</summary>
          <div className="mt-3 space-y-6">
            <StaffConsequences previous={previousStaffFunctions} current={result.staffFunctions} />
            <StaffModuleConsequences modules={result.staffModules} />
          </div>
        </details>

        {result.afterAction.length > 0 && (
          <details open={!compactPresentation} className="group">
            <summary className="cursor-pointer list-none text-xs uppercase tracking-widest text-ink/40">After-action notes {compactPresentation ? "— expand detail" : ""}</summary>
            <div className="mt-3">
            <div className="space-y-2">
              {result.afterAction.map((note, index) => (
                <div key={`${note.heading}:${index}`} className="border border-border px-4 py-3">
                  <p className="text-xs font-semibold text-ink/70 mb-1">{note.heading}</p>
                  <p className="text-sm text-ink/60 leading-relaxed">{note.detail}</p>
                </div>
              ))}
            </div>
            </div>
          </details>
        )}

        <EventList events={result.triggeredEvents} />

        <ProgramProgress internalTech={result.internalTech} externalTech={result.externalTech} labels={labels} />

        {result.acceptedRisks.length > 0 && (
          <section>
            <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Risks you accepted</p>
            <p className="text-xs text-ink/50 mb-3">Staff warnings you went ahead with, and how they were recorded.</p>
            <div className="space-y-1">
              {result.acceptedRisks.map((r) => (
                <div key={`${r.staffFunctionId}:${r.warningText}`} className="flex items-start gap-3 text-xs border border-border px-3 py-2">
                  <span className="font-mono text-ink/50 shrink-0">{r.staffFunctionId}</span>
                  <span className="text-ink/60 flex-1">{r.warningText}</span>
                  <span className={r.accepted ? "text-green-400" : "text-red-400"}>{r.accepted ? "Accepted" : "Not accepted"}</span>
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
            Start next month →
          </button>
        )}
        <button
          type="button"
          onClick={onViewRecords}
          className="px-4 py-2.5 border border-border text-ink hover:border-brass text-sm"
        >
          Go to records
        </button>
      </div>
    </div>
  );
}
