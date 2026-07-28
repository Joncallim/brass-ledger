import type { GameSession, DecisionMemo, StaffFunctionReadout } from "@brass-ledger/shared";
import { evaluateCampaignObjectives } from "@brass-ledger/shared";
import { StatusBadge } from "../components/StatusBadge";
import {
  commitmentTypeLabel,
  constraintTrendLabel,
  programPhaseLabel,
  pluralize,
  type ScenarioLabels,
} from "../lib/labels";

type Props = {
  session: GameSession;
  memos: DecisionMemo[];
  staffReadouts: StaffFunctionReadout[];
  labels: ScenarioLabels;
  onProceed: () => void;
};

export function BriefingScreen({ session, memos, staffReadouts, labels, onProceed }: Props) {
  const state = session.state;
  const briefing = state.briefing;
  const objectiveChecks = evaluateCampaignObjectives(state);
  const metCount = objectiveChecks.filter((o) => o.met).length;
  const unmetObjective = objectiveChecks.find((o) => !o.met);
  const openCommitments = state.activeCommitments.filter((c) => c.fulfilled === null);
  const requiredCount = memos.filter((m) => !m.optional).length;
  const optionalCount = memos.filter((m) => m.optional).length;

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Monthly brief</p>
        <h2 className="text-xl font-semibold tracking-tight text-ink mb-1">
          Month {state.turn}
          {state.campaignStatus !== "active" && (
            <span className={`ml-3 text-sm ${state.campaignStatus === "won" ? "text-green-400" : "text-red-400"}`}>
              — campaign {state.campaignStatus === "won" ? "won" : "lost"}
            </span>
          )}
        </h2>
        <p className="text-xs text-ink/40 mb-2">
          This campaign has a set length, but it is not shown here — track your progress by milestones instead. It
          can also end early if the headquarters loses domestic cover, credible readiness, or escalation control.
        </p>
        {unmetObjective && (
          <p className="text-sm text-red-400 mb-2">
            ⚠ Not currently met: {unmetObjective.label} — {unmetObjective.note}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {briefing.situationSummary && (
            <section>
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-2">Situation</p>
              <p className="text-sm text-ink leading-relaxed">{briefing.situationSummary}</p>
            </section>
          )}

          {briefing.commandersIntent && (
            <section>
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-2">Commander's intent</p>
              <p className="text-sm text-ink leading-relaxed">{briefing.commandersIntent}</p>
            </section>
          )}

          <section>
            <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">How your staff stand today</p>
            <p className="text-xs text-ink/50 mb-3 leading-relaxed">
              Your five staff functions each have a limited amount of work they can absorb in a month. Burden is how
              many points of work they are carrying against that limit.
            </p>
            <table className="w-full text-xs border border-border">
              <thead>
                <tr className="border-b border-border bg-paper/60">
                  <th scope="col" className="text-left px-3 py-2 font-normal text-ink/40 uppercase tracking-wide">Staff function</th>
                  <th scope="col" className="text-left px-3 py-2 font-normal text-ink/40 uppercase tracking-wide">Status</th>
                  <th scope="col" className="text-left px-3 py-2 font-normal text-ink/40 uppercase tracking-wide">Burden</th>
                  <th scope="col" className="text-left px-3 py-2 font-normal text-ink/40 uppercase tracking-wide">What to watch</th>
                </tr>
              </thead>
              <tbody>
                {staffReadouts.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="px-3 py-2 font-semibold">{r.shortLabel} {r.label}</td>
                    <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-2 font-mono">{r.burdenPoints}/{r.capacity}</td>
                    <td className="px-3 py-2 text-ink/60 max-w-xs">{r.consequence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {openCommitments.length > 0 && (
            <section>
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Promises still open</p>
              <p className="text-xs text-ink/50 mb-3 leading-relaxed">
                Commitments you have already made and not yet closed out.
              </p>
              <div className="space-y-1">
                {openCommitments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 text-xs border border-border px-3 py-2">
                    <span className="text-ink/40 uppercase tracking-wide border border-border px-1">
                      {commitmentTypeLabel[c.type] ?? c.type}
                    </span>
                    <span className="text-ink/70 flex-1">{c.label}</span>
                    <span className="text-ink/40 shrink-0">Made in month {c.turnMade}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {openCommitments.length === 0 && (
            <p className="text-xs text-ink/40">No promises are outstanding.</p>
          )}
        </div>

        <div className="space-y-6">
          {objectiveChecks.length > 0 && (
            <section>
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">
                Campaign milestones — {metCount} of {objectiveChecks.length} met
              </p>
              <p className="text-xs text-ink/50 mb-3 leading-relaxed">
                Green means you are meeting the milestone right now. Red means you are not. Meeting enough of these
                by the campaign's end is how you win.
              </p>
              <div className="space-y-2">
                {objectiveChecks.map((obj) => (
                  <div key={obj.id} className="border border-border px-3 py-2 text-xs">
                    <div className={`font-semibold mb-0.5 ${obj.met ? "text-green-400" : "text-red-400"}`}>{obj.label}</div>
                    <p className="text-ink/50 leading-relaxed">{obj.note}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {state.capabilityPrograms.length > 0 && (
            <section>
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Capability programs</p>
              <p className="text-xs text-ink/50 mb-3 leading-relaxed">
                Long-running builds. The number is progress out of 100; the tag is the stage reached.
              </p>
              <div className="space-y-1">
                {state.capabilityPrograms.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-xs border border-border px-3 py-2">
                    <span className="font-mono text-ink/50 w-4">{Math.round(p.progress)}</span>
                    <span className="text-ink/60 flex-1 truncate" title={labels.program(p.id)}>{labels.program(p.id)}</span>
                    <span className="text-ink/40 border border-border px-1">{programPhaseLabel[p.phase] ?? p.phase}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {state.externalConstraints.length > 0 && (
            <section>
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Outside pressures</p>
              <p className="text-xs text-ink/50 mb-3 leading-relaxed">
                Markets and supply chains you do not control. Higher numbers mean tighter conditions.
              </p>
              <div className="space-y-1">
                {state.externalConstraints.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-xs border border-border px-3 py-2">
                    <span className={`font-mono w-5 text-right ${c.severity >= 65 ? "text-red-400" : c.severity >= 35 ? "text-yellow-400" : "text-ink/50"}`}>
                      {Math.round(c.severity)}
                    </span>
                    <span className="text-ink/60 flex-1 truncate" title={labels.constraint(c.id)}>{labels.constraint(c.id)}</span>
                    <span className={`text-ink/40 border border-border px-1 ${c.trend === "worsening" ? "border-red-600/70/60 text-red-400" : c.trend === "improving" ? "border-green-600/60 text-green-400" : ""}`}>
                      {constraintTrendLabel[c.trend] ?? c.trend}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {state.activeEventIds.length > 0 && (
            <section>
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Events still in play</p>
              <p className="text-xs text-ink/50 mb-2 leading-relaxed">
                Shown by event code. Each event was described in full in the after-action report for the month it
                first appeared.
              </p>
              <div className="space-y-1">
                {state.activeEventIds.map((id) => (
                  <div key={id} className="text-xs border border-yellow-800/60 bg-yellow-950/40 px-3 py-2 text-yellow-300 font-mono">
                    {id}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-xs text-ink/40 mb-4">
          {requiredCount} {pluralize(requiredCount, "decision")} you must make this month
          {optionalCount > 0 && `, and ${optionalCount} you can skip`}.
        </p>
        <button
          type="button"
          onClick={onProceed}
          className="px-5 py-2.5 bg-brass text-white border border-brass hover:bg-brass/90 text-sm font-medium"
        >
          Open decision memos →
        </button>
      </div>
    </div>
  );
}
