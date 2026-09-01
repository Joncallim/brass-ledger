import type { ScenarioSummary } from "@brass-ledger/shared";
import type { SessionSummary } from "../lib/types";
import { campaignStatusLabel } from "../lib/labels";

type Props = {
  sessions: SessionSummary[];
  scenarios: ScenarioSummary[];
  selectedScenarioId: string | null;
  selectedCommandPressureId: string;
  selectedStaffAssistanceId: string;
  busy: boolean;
  error: string | null;
  onLoad: (id: string) => void;
  onSelectScenario: (scenarioId: string) => void;
  onSelectCommandPressure: (profileId: string) => void;
  onSelectStaffAssistance: (profileId: string) => void;
  onNew: (scenarioId?: string) => void;
};

export function SessionHub({ sessions, scenarios, selectedScenarioId, selectedCommandPressureId, selectedStaffAssistanceId, busy, error, onLoad, onSelectScenario, onSelectCommandPressure, onSelectStaffAssistance, onNew }: Props) {
  const selectedScenario = scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0];
  return (
    <div className="p-6 max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">New campaign</p>
      <h1 className="text-2xl font-semibold tracking-tight text-ink mb-2">Choose your campaign</h1>
      <p className="text-sm text-ink/50 leading-relaxed mb-6 max-w-xl">
        You command a joint headquarters. Each month you read the brief, choose one course of action per decision
        memo, hear what your chiefs think, then commit the month and live with the results.
      </p>

      {scenarios.length > 1 && (
        <section className="mb-8" aria-label="Choose scenario">
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Choose a campaign</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {scenarios.map((candidate) => {
              const selected = candidate.id === selectedScenarioId;
              return (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => onSelectScenario(candidate.id)}
                  disabled={busy}
                  aria-pressed={selected}
                  className={`border p-4 text-left disabled:opacity-50 ${selected ? "border-brass bg-brass/10" : "border-border hover:border-brass"}`}
                >
                  <span className="block text-sm font-medium text-ink">{candidate.title}</span>
                  {candidate.trainingExercise && <span className="mt-1 inline-block border border-brass/50 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-brass">Recommended first</span>}
                  <span className="mt-1 block text-xs leading-relaxed text-ink/60">{candidate.description}</span>
                  <span className="mt-3 block text-xs text-ink/45">{candidate.maxTurns} months · {candidate.openingVariants.length} possible opening briefs</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {selectedScenario && (
        <section className="mb-8 grid gap-4 sm:grid-cols-2" aria-label="Campaign conditions">
          <label className="block text-sm text-ink/70">
            <span className="block text-xs uppercase tracking-widest text-ink/40 mb-2">Command pressure</span>
            <select value={selectedCommandPressureId} onChange={(event) => onSelectCommandPressure(event.target.value)} disabled={busy} className="w-full border border-border bg-paper px-3 py-2 text-ink">
              {selectedScenario.commandPressureProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}
            </select>
            <span className="mt-1 block text-xs leading-relaxed text-ink/50">{selectedScenario.commandPressureProfiles.find((profile) => profile.id === selectedCommandPressureId)?.description}</span>
          </label>
          <label className="block text-sm text-ink/70">
            <span className="block text-xs uppercase tracking-widest text-ink/40 mb-2">Staff assistance</span>
            <select value={selectedStaffAssistanceId} onChange={(event) => onSelectStaffAssistance(event.target.value)} disabled={busy} className="w-full border border-border bg-paper px-3 py-2 text-ink">
              {selectedScenario.staffAssistanceProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}
            </select>
            <span className="mt-1 block text-xs leading-relaxed text-ink/50">{selectedScenario.staffAssistanceProfiles.find((profile) => profile.id === selectedStaffAssistanceId)?.description}</span>
          </label>
        </section>
      )}

      <div className="flex gap-3 mb-8">
        {sessions.length > 0 && (
          <button
            type="button"
            onClick={() => onLoad(sessions[0].id)}
            disabled={busy}
            className="px-4 py-2 bg-brass text-white border border-brass hover:bg-brass/90 disabled:opacity-50 text-sm font-medium"
          >
            Continue last campaign
          </button>
        )}
        <button
          type="button"
          onClick={() => onNew(selectedScenarioId ?? undefined)}
          disabled={busy}
          className="px-4 py-2 border border-border text-ink hover:border-brass disabled:opacity-50 text-sm"
        >
          Start new campaign
        </button>
      </div>

      {error && (
        <div className="border border-red-600 bg-red-950/40 text-red-300 px-4 py-3 text-sm mb-6">{error}</div>
      )}

      {sessions.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Saved campaigns</p>
          <table className="w-full text-sm border border-border">
            <thead>
              <tr className="border-b border-border bg-paper/60">
                <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Campaign</th>
                <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Month</th>
                <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Milestones</th>
                <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Status</th>
                <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Score</th>
                <th scope="col" className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-paper/60">
                  <td className="px-3 py-2">
                    <p className="text-sm text-ink/75">{s.displayName ?? "Saved campaign"}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-ink/35" title={s.id}>{s.id.slice(0, 8)} · {s.updatedAt ? new Date(s.updatedAt).toLocaleString() : "date unavailable"}</p>
                  </td>
                  <td className="px-3 py-2 text-ink/70">{s.turn}</td>
                  <td className="px-3 py-2 text-ink/70">{s.milestonesMet} of {s.milestonesTotal}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs ${s.campaignStatus === "won" ? "text-green-400" : s.campaignStatus === "lost" ? "text-red-400" : "text-ink/60"}`}>
                      {campaignStatusLabel[s.campaignStatus] ?? s.campaignStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-ink/60">{Math.round(s.campaignScore)}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onLoad(s.id)}
                      disabled={busy}
                      className="text-xs border border-border px-2 py-1 hover:border-brass disabled:opacity-40"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-ink/40 mt-2">Campaigns save automatically after every committed month.</p>
        </div>
      )}

      {sessions.length === 0 && !busy && (
        <p className="text-sm text-ink/40">You have no saved campaigns yet. Start a new campaign to begin.</p>
      )}
    </div>
  );
}
