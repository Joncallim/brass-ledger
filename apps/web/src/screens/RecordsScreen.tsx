import { useRef, useState } from "react";
import type { SessionSummary } from "../lib/types";
import { campaignStatusLabel, pluralize } from "../lib/labels";

type Props = {
  sessions: SessionSummary[];
  busy: boolean;
  error: string | null;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onImport: (file: File) => void;
  onValidate: (id: string) => void;
  onBack: () => void;
  validationResults: Record<string, { ok: boolean; checkedTurns: number; failedAtTurn: number | null }>;
};

export function RecordsScreen({
  sessions,
  busy,
  error,
  onLoad,
  onDelete,
  onExport,
  onImport,
  onValidate,
  onBack,
  validationResults,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (file) onImport(file);
    e.currentTarget.value = "";
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Records room</p>
          <h2 className="text-xl font-semibold tracking-tight text-ink">Campaign records</h2>
          <p className="text-xs text-ink/50 mt-1 max-w-xl leading-relaxed">
            Every campaign you have saved. You can open one, save a copy to a file, bring a copy back in, or check
            that a campaign still replays exactly as it was recorded.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-ink/40 hover:text-ink border border-border px-2 py-1 shrink-0"
        >
          ← Back to campaigns
        </button>
      </div>

      {error && (
        <div className="border border-red-600 bg-red-950/40 text-red-300 px-4 py-3 text-sm mb-5">{error}</div>
      )}

      <div className="flex gap-3 mb-6">
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Choose a saved campaign file to bring in"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="text-sm border border-border px-3 py-2 hover:border-brass disabled:opacity-40"
        >
          Bring in a saved file
        </button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-ink/40">You have no saved campaigns yet.</p>
      ) : (
        <table className="w-full text-sm border border-border">
          <thead>
            <tr className="border-b border-border bg-paper/60">
              <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Campaign</th>
              <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Month</th>
              <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Milestones</th>
              <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Status</th>
              <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Score</th>
              <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Replay check</th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const unavailable = s.recordStatus !== undefined;
              const validation = validationResults[s.id];
              return (
                <tr key={s.id} className="border-b border-border/50 hover:bg-paper/40">
                  <td className="px-3 py-2">
                    <p className="text-xs text-ink/70">{s.displayName ?? "Campaign record"}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-ink/40" title={s.id}>{s.id.slice(0, 12)}…</p>
                  </td>
                  <td className="px-3 py-2 text-ink/70">{unavailable ? "—" : s.turn}</td>
                  <td className="px-3 py-2 text-ink/70">{unavailable ? "—" : `${s.milestonesMet} of ${s.milestonesTotal}`}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs ${unavailable ? "text-red-400" : s.campaignStatus === "won" ? "text-green-400" : s.campaignStatus === "lost" ? "text-red-400" : "text-ink/60"}`}>
                      {unavailable ? (s.recordStatus === "corrupt" ? "Damaged file" : "Incompatible file") : (campaignStatusLabel[s.campaignStatus ?? ""] ?? s.campaignStatus)}
                    </span>
                    {unavailable && <p className="mt-1 max-w-xs text-xs leading-snug text-ink/50">{s.recordReason}</p>}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-ink/60">{unavailable ? "—" : Math.round(s.campaignScore ?? 0)}</td>
                  <td className="px-3 py-2">
                    {unavailable ? (
                      <span className="text-xs text-ink/40">Not available</span>
                    ) : validation ? (
                      <span className={`text-xs ${validation.ok ? "text-green-400" : "text-red-400"}`}>
                        {validation.ok
                          ? `✓ ${validation.checkedTurns} ${pluralize(validation.checkedTurns, "month")} verified`
                          : `✗ month ${validation.failedAtTurn} does not match`}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onValidate(s.id)}
                        disabled={busy}
                        title="Re-run every recorded month and confirm the results still match"
                        className="text-xs text-ink/40 hover:text-ink disabled:opacity-40"
                      >
                        Check replay
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => onLoad(s.id)}
                        disabled={busy || unavailable}
                        className="text-xs border border-border px-2 py-1 hover:border-brass disabled:opacity-40"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => onExport(s.id)}
                        disabled={busy || unavailable}
                        title={unavailable ? "Only a safe campaign can be exported through the normal export path" : "Save a copy of this campaign to a file"}
                        className="text-xs border border-border px-2 py-1 hover:border-brass disabled:opacity-40"
                      >
                        Save to file
                      </button>
                      {confirmDelete === s.id ? (
                        <>
                          <span className="text-xs text-red-400 self-center">Delete for good?</span>
                          <button
                            type="button"
                            onClick={() => { onDelete(s.id); setConfirmDelete(null); }}
                            className="text-xs border border-red-600 text-red-400 px-2 py-1 hover:bg-red-950/40"
                          >
                            Yes, delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs border border-border px-2 py-1"
                          >
                            Keep it
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(s.id)}
                          disabled={busy}
                          className="text-xs border border-border px-2 py-1 hover:border-red-600 hover:text-red-400 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
