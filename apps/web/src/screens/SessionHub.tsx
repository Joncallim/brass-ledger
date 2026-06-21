import type { SessionSummary } from "../lib/types";

type Props = {
  sessions: SessionSummary[];
  scenarioTitle: string;
  scenarioDescription: string;
  busy: boolean;
  error: string | null;
  onLoad: (id: string) => void;
  onNew: () => void;
};

const statusLabel: Record<string, string> = {
  active: "Active",
  won: "Won",
  lost: "Lost",
};

export function SessionHub({ sessions, scenarioTitle, scenarioDescription, busy, error, onLoad, onNew }: Props) {
  return (
    <div className="p-6 max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Campaign</p>
      <h1 className="text-2xl font-semibold tracking-tight text-ink mb-2">{scenarioTitle}</h1>
      <p className="text-sm text-ink/60 leading-relaxed mb-6 max-w-xl">{scenarioDescription}</p>

      <div className="flex gap-3 mb-8">
        {sessions.length > 0 && (
          <button
            type="button"
            onClick={() => onLoad(sessions[0].id)}
            disabled={busy}
            className="px-4 py-2 bg-brass text-white border border-brass hover:bg-brass/90 disabled:opacity-50 text-sm font-medium"
          >
            Resume campaign
          </button>
        )}
        <button
          type="button"
          onClick={onNew}
          disabled={busy}
          className="px-4 py-2 border border-border text-ink hover:border-brass disabled:opacity-50 text-sm"
        >
          New campaign
        </button>
      </div>

      {error && (
        <div className="border border-red-600/70/60 bg-red-950/40 text-red-300 px-4 py-3 text-sm mb-6">{error}</div>
      )}

      {sessions.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Saved campaigns</p>
          <table className="w-full text-sm border border-border">
            <thead>
              <tr className="border-b border-border bg-paper/60">
                <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Session</th>
                <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Turn</th>
                <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Status</th>
                <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Score</th>
                <th scope="col" className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-paper/60">
                  <td className="px-3 py-2 font-mono text-xs text-ink/50">{s.id.slice(0, 8)}</td>
                  <td className="px-3 py-2 text-ink/70">{s.turn}/{s.maxTurns}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs ${s.campaignStatus === "won" ? "text-green-400" : s.campaignStatus === "lost" ? "text-red-400" : "text-ink/60"}`}>
                      {statusLabel[s.campaignStatus] ?? s.campaignStatus}
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
                      Load
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sessions.length === 0 && !busy && (
        <p className="text-sm text-ink/40">No saved campaigns. Start a new campaign to begin.</p>
      )}
    </div>
  );
}
