import { useRef, useState } from "react";
import type { SessionSummary } from "../lib/types";

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Records room</p>
          <h2 className="text-xl font-semibold tracking-tight text-ink">Campaign records</h2>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-ink/40 hover:text-ink border border-border px-2 py-1"
        >
          ← Hub
        </button>
      </div>

      {error && (
        <div className="border border-red-600/70/60 bg-red-950/40 text-red-300 px-4 py-3 text-sm mb-5">{error}</div>
      )}

      <div className="flex gap-3 mb-6">
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Import save file"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="text-sm border border-border px-3 py-2 hover:border-brass disabled:opacity-40"
        >
          Import save
        </button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-ink/40">No saved campaigns.</p>
      ) : (
        <table className="w-full text-sm border border-border">
          <thead>
            <tr className="border-b border-border bg-paper/60">
              <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Session ID</th>
              <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Turn</th>
              <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Status</th>
              <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Score</th>
              <th scope="col" className="text-left px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal">Validation</th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-wide text-ink/50 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const validation = validationResults[s.id];
              return (
                <tr key={s.id} className="border-b border-border/50 hover:bg-paper/40">
                  <td className="px-3 py-2 font-mono text-xs text-ink/50">{s.id.slice(0, 12)}…</td>
                  <td className="px-3 py-2 text-ink/70">{s.turn}/{s.maxTurns}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs ${s.campaignStatus === "won" ? "text-green-400" : s.campaignStatus === "lost" ? "text-red-400" : "text-ink/60"}`}>
                      {s.campaignStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-ink/60">{Math.round(s.campaignScore)}</td>
                  <td className="px-3 py-2">
                    {validation ? (
                      <span className={`text-xs font-mono ${validation.ok ? "text-green-400" : "text-red-400"}`}>
                        {validation.ok ? `✓ ${validation.checkedTurns} turns` : `✗ turn ${validation.failedAtTurn}`}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onValidate(s.id)}
                        disabled={busy}
                        className="text-xs text-ink/40 hover:text-ink disabled:opacity-40"
                      >
                        Validate
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => onLoad(s.id)}
                        disabled={busy}
                        className="text-xs border border-border px-2 py-1 hover:border-brass disabled:opacity-40"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => onExport(s.id)}
                        disabled={busy}
                        className="text-xs border border-border px-2 py-1 hover:border-brass disabled:opacity-40"
                      >
                        Export
                      </button>
                      {confirmDelete === s.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => { onDelete(s.id); setConfirmDelete(null); }}
                            className="text-xs border border-red-600/70/60 text-red-400 px-2 py-1 hover:bg-red-950/40"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs border border-border px-2 py-1"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(s.id)}
                          disabled={busy}
                          className="text-xs border border-border px-2 py-1 hover:border-red-600/70/60 hover:text-red-400 disabled:opacity-40"
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
