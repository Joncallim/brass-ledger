import type { GameSession, DecisionMemo, StaffFunctionReadout } from "@brass-ledger/shared";
import { StatusBadge } from "../components/StatusBadge";

type Props = {
  session: GameSession;
  memos: DecisionMemo[];
  staffReadouts: StaffFunctionReadout[];
  onProceed: () => void;
};

const metricStatusColor = {
  healthy: "text-ink",
  watch: "text-yellow-400",
  risk: "text-red-400 font-semibold",
};

function objectiveStatus(met: boolean) {
  return met ? "text-green-400" : "text-red-400";
}

function checkObjective(session: GameSession, metric: string, target: number, direction: "gte" | "lte") {
  const state = session.state;
  const value: number = (() => {
    switch (metric) {
      case "deployableUnits": return state.forceGeneration.deployableUnits;
      case "politicalAlignment": return state.alliance.politicalAlignment;
      case "cabinetCover": return state.domestic.cabinetCover;
      case "incidentLadder": return state.escalation.incidentLadder;
      default: return 0;
    }
  })();
  return direction === "gte" ? value >= target : value <= target;
}

export function BriefingScreen({ session, memos, staffReadouts, onProceed }: Props) {
  const state = session.state;
  const briefing = state.briefing;
  const objectives = briefing.campaignObjectives ?? [];
  const atRiskObjective = objectives.find((o) => !checkObjective(session, o.metric, o.target, o.direction));

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Monthly brief</p>
        <h2 className="text-xl font-semibold tracking-tight text-ink mb-1">
          Month {state.turn} of {state.maxTurns}
          {state.campaignStatus !== "active" && (
            <span className={`ml-3 text-sm ${state.campaignStatus === "won" ? "text-green-400" : "text-red-400"}`}>
              — Campaign {state.campaignStatus}
            </span>
          )}
        </h2>
        {atRiskObjective && (
          <p className="text-sm text-red-400 mb-2">⚠ At risk: {atRiskObjective.label} — {atRiskObjective.note}</p>
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
            <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">S1–S5 current read</p>
            <table className="w-full text-xs border border-border">
              <thead>
                <tr className="border-b border-border bg-paper/60">
                  <th scope="col" className="text-left px-3 py-2 font-normal text-ink/40 uppercase tracking-wide">Function</th>
                  <th scope="col" className="text-left px-3 py-2 font-normal text-ink/40 uppercase tracking-wide">Status</th>
                  <th scope="col" className="text-left px-3 py-2 font-normal text-ink/40 uppercase tracking-wide">Burden</th>
                  <th scope="col" className="text-left px-3 py-2 font-normal text-ink/40 uppercase tracking-wide">Consequence</th>
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

          {state.activeCommitments.length > 0 && (
            <section>
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Active commitments</p>
              <div className="space-y-1">
                {state.activeCommitments.filter((c) => c.fulfilled === null).map((c) => (
                  <div key={c.id} className="flex items-start gap-3 text-xs border border-border px-3 py-2">
                    <span className="text-ink/40 uppercase tracking-wide border border-border px-1">{c.type}</span>
                    <span className="text-ink/70 flex-1">{c.label}</span>
                    <span className="text-ink/40 font-mono shrink-0">Turn {c.turnMade}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {state.activeCommitments.filter((c) => c.fulfilled === null).length === 0 && (
            <p className="text-xs text-ink/40">No open commitments.</p>
          )}
        </div>

        <div className="space-y-6">
          {objectives.length > 0 && (
            <section>
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Campaign objectives</p>
              <div className="space-y-2">
                {objectives.map((obj) => {
                  const met = checkObjective(session, obj.metric, obj.target, obj.direction);
                  return (
                    <div key={obj.id} className="border border-border px-3 py-2 text-xs">
                      <div className={`font-semibold mb-0.5 ${objectiveStatus(met)}`}>{obj.label}</div>
                      <p className="text-ink/50 leading-relaxed">{obj.note}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {state.capabilityPrograms.length > 0 && (
            <section>
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Capability programs</p>
              <div className="space-y-1">
                {state.capabilityPrograms.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-xs border border-border px-3 py-2">
                    <span className="font-mono text-ink/50 w-4">{Math.round(p.progress)}</span>
                    <span className="text-ink/60 flex-1 truncate">{p.id}</span>
                    <span className="text-ink/40 border border-border px-1">{p.phase}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {state.externalConstraints.length > 0 && (
            <section>
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">External constraints</p>
              <div className="space-y-1">
                {state.externalConstraints.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-xs border border-border px-3 py-2">
                    <span className={`font-mono w-5 text-right ${c.severity >= 65 ? "text-red-400" : c.severity >= 35 ? "text-yellow-400" : "text-ink/50"}`}>
                      {Math.round(c.severity)}
                    </span>
                    <span className="text-ink/60 flex-1 truncate">{c.id}</span>
                    <span className={`text-ink/40 border border-border px-1 ${c.trend === "worsening" ? "border-red-600/70/60 text-red-400" : c.trend === "improving" ? "border-green-600/60 text-green-400" : ""}`}>
                      {c.trend}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {state.activeEventIds.length > 0 && (
            <section>
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-2">Events in play</p>
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
          {memos.filter((m) => !m.optional).length} required memo(s) and {memos.filter((m) => m.optional).length} optional memo(s) this month.
        </p>
        <button
          type="button"
          onClick={onProceed}
          className="px-5 py-2.5 bg-brass text-white border border-brass hover:bg-brass/90 text-sm font-medium"
        >
          Proceed to memos →
        </button>
      </div>
    </div>
  );
}
