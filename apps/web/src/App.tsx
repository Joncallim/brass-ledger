import { useEffect, useMemo, useState } from "react";
import {
  buildAdvisorPortraitDataUri,
  type DecisionMemo,
  type GameSession,
  type ScenarioSummary,
  type TurnResult,
} from "@brass-ledger/shared";

type SessionEnvelope = {
  session: GameSession;
  memos: DecisionMemo[];
  summary: {
    id: string;
    turn: number;
    maxTurns: number;
    campaignStatus: string;
    campaignScore: number;
    summary: string;
  };
};

type SessionSummary = SessionEnvelope["summary"];

type PreviewPayload = {
  projectedResult: TurnResult;
  predictedEvents: TurnResult["triggeredEvents"];
};

const apiBase = "/api";

async function fetchJson<T>(url: string, init?: RequestInit) {
  const hasBody = init?.body !== undefined;
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed: ${response.status}`);
  }
  return data as T;
}

function defaultTurnInput(session: GameSession, memos: DecisionMemo[]) {
  return {
    turn: session.state.turn,
    selections: memos
      .filter((memo) => !memo.optional)
      .map((memo) => ({
        memoId: memo.id,
        optionId: memo.options[0]?.id ?? "",
      }))
      .filter((selection) => selection.optionId.length > 0),
  };
}

function engineSnapshot(session: GameSession | null, memos: DecisionMemo[], result: TurnResult | null) {
  if (!session) {
    return {
      mode: "engine-idle",
      note: "No session loaded.",
    };
  }

  return {
    mode: "engine-session",
    sessionId: session.id,
    turn: session.state.turn,
    maxTurns: session.state.maxTurns,
    status: session.state.campaignStatus,
    score: session.state.campaignScore,
    briefing: session.state.briefing,
    memos: memos.map((memo) => ({
      id: memo.id,
      title: memo.title,
      required: !memo.optional,
      options: memo.options.map((option) => ({
        id: option.id,
        label: option.label,
        tags: option.tags,
        burden: option.burden,
        stateDelta: option.stateDelta,
        programPushes: option.programPushes,
        constraintShifts: option.constraintShifts,
      })),
    })),
    latestResult: result
      ? {
          summary: result.summary,
          replayHash: result.replayHash,
          directorateBurden: result.directorateBurden,
          triggeredEvents: result.triggeredEvents,
          afterAction: result.afterAction,
        }
      : null,
  };
}

export function App() {
  const [scenario, setScenario] = useState<ScenarioSummary | null>(null);
  const [records, setRecords] = useState<SessionSummary[]>([]);
  const [session, setSession] = useState<GameSession | null>(null);
  const [memos, setMemos] = useState<DecisionMemo[]>([]);
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [latestResult, setLatestResult] = useState<TurnResult | null>(null);
  const [status, setStatus] = useState("Loading engine...");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const spriteRoster = useMemo(() => session?.advisorRoster ?? [], [session]);
  const snapshot = useMemo(() => engineSnapshot(session, memos, latestResult), [latestResult, memos, session]);

  async function refreshRecords() {
    const data = await fetchJson<{ sessions: SessionSummary[] }>(`${apiBase}/sessions`);
    setRecords(data.sessions);
  }

  async function startSession() {
    setBusy(true);
    setError(null);
    try {
      const data = await fetchJson<SessionEnvelope>(`${apiBase}/sessions`, { method: "POST" });
      setSession(data.session);
      setMemos(data.memos);
      setPreview(null);
      setLatestResult(data.session.history.at(-1) ?? null);
      setStatus("Engine session created.");
      await refreshRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create engine session");
    } finally {
      setBusy(false);
    }
  }

  async function loadLatest() {
    const latest = records[0];
    if (!latest) {
      await startSession();
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const data = await fetchJson<SessionEnvelope>(`${apiBase}/sessions/${latest.id}`);
      setSession(data.session);
      setMemos(data.memos);
      setPreview(null);
      setLatestResult(data.session.history.at(-1) ?? null);
      setStatus("Latest engine session loaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load engine session");
    } finally {
      setBusy(false);
    }
  }

  async function previewDefaultTurn() {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const data = await fetchJson<PreviewPayload>(`${apiBase}/sessions/${session.id}/preview-turn`, {
        method: "POST",
        body: JSON.stringify({ input: defaultTurnInput(session, memos) }),
      });
      setPreview(data);
      setStatus("Default text simulation preview generated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preview engine turn");
    } finally {
      setBusy(false);
    }
  }

  async function resolveDefaultTurn() {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const data = await fetchJson<SessionEnvelope & { result: TurnResult }>(`${apiBase}/sessions/${session.id}/resolve-turn`, {
        method: "POST",
        body: JSON.stringify({ input: defaultTurnInput(session, memos) }),
      });
      setSession(data.session);
      setMemos(data.memos);
      setPreview(null);
      setLatestResult(data.result);
      setStatus("Default text simulation turn resolved.");
      await refreshRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve engine turn");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      setError(null);
      try {
        const [scenarioData, recordsData] = await Promise.all([
          fetchJson<{ scenario: ScenarioSummary }>(`${apiBase}/scenario`),
          fetchJson<{ sessions: SessionSummary[] }>(`${apiBase}/sessions`),
        ]);
        if (cancelled) return;
        setScenario(scenarioData.scenario);
        setRecords(recordsData.sessions);
        setStatus("Engine ready. Load or create a session to generate text and sprites.");
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to initialize engine");
      }
    }
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="engine-shell">
      <section className="engine-header">
        <div>
          <p className="engine-kicker">Brass Ledger engine</p>
          <h1>Headless text and sprite workbench</h1>
          <p>{scenario?.description ?? "Scenario metadata is loading from the backend."}</p>
        </div>
        <div className="engine-actions">
          <button type="button" onClick={() => void loadLatest()} disabled={busy}>
            Load latest
          </button>
          <button type="button" onClick={() => void startSession()} disabled={busy}>
            New session
          </button>
          <button type="button" onClick={() => void previewDefaultTurn()} disabled={busy || !session}>
            Preview text turn
          </button>
          <button type="button" onClick={() => void resolveDefaultTurn()} disabled={busy || !session}>
            Resolve text turn
          </button>
        </div>
      </section>

      {error && <div className="engine-error">{error}</div>}
      <div className="engine-status">{status}</div>

      <section className="engine-grid">
        <article className="engine-panel">
          <h2>Engine Output</h2>
          <pre>{JSON.stringify(preview?.projectedResult ?? snapshot, null, 2)}</pre>
        </article>

        <aside className="engine-panel">
          <h2>Generated Sprites</h2>
          {spriteRoster.length === 0 ? (
            <p>No sprites yet. Create or load a session to generate the advisor roster.</p>
          ) : (
            <div className="sprite-grid">
              {spriteRoster.map((advisor) => (
                <figure key={advisor.chiefId}>
                  <img src={buildAdvisorPortraitDataUri(advisor.portrait)} alt={`${advisor.displayName} generated sprite`} />
                  <figcaption>
                    <strong>{advisor.displayName}</strong>
                    <span>{advisor.title}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </aside>
      </section>

      <section className="engine-panel">
        <h2>Scenario Contract</h2>
        <pre>
          {JSON.stringify(
            {
              scenario,
              savedSessionCount: records.length,
              requiredMemoCount: memos.filter((memo) => !memo.optional).length,
              optionalMemoCount: memos.filter((memo) => memo.optional).length,
            },
            null,
            2,
          )}
        </pre>
      </section>
    </main>
  );
}
