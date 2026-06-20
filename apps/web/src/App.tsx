import { useEffect, useMemo, useState } from "react";
import {
  buildAdvisorPortraitDataUri,
  type DecisionMemo,
  type GameSession,
  type ScenarioSummary,
  type StaffNegotiation,
  type TurnPreview,
  type TurnResult,
} from "@brass-ledger/shared";
import {
  acceptedRiskKey,
  acceptedRiskOverridesFromChoices,
  allAcceptedRiskCandidatesChosen,
  defaultTurnInput,
  initialAcceptedRiskChoices,
  setAcceptedRiskChoice,
  type AcceptedRiskChoiceState,
} from "./acceptedRiskUi";

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
} & TurnPreview;

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

function previewSnapshot(preview: PreviewPayload) {
  return {
    decisionPreviews: preview.decisionPreviews,
    acceptedRiskCandidates: preview.acceptedRiskCandidates,
    predictedEvents: preview.predictedEvents,
    chiefCoalitions: preview.chiefCoalitions,
    projectedChiefPositions: preview.projectedResult.chiefPositions.map((position) => ({
      chiefId: position.chiefId,
      chiefName: position.chiefName,
      memoId: position.memoId,
      optionId: position.optionId,
      position: position.position,
      staffReadoutEvidence: position.staffReadoutEvidence,
    })),
    projectedSummary: preview.projectedResult.summary,
    projectedStaffFunctions: preview.projectedResult.staffFunctions,
    projectedAfterAction: preview.projectedResult.afterAction,
    replayHash: preview.projectedResult.replayHash,
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
          chiefCoalitions: result.chiefCoalitions,
          triggeredEvents: result.triggeredEvents,
          acceptedRisks: result.acceptedRisks,
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
  const [acceptedRiskChoices, setAcceptedRiskChoices] = useState<AcceptedRiskChoiceState>({});
  const [staffNegotiations, setStaffNegotiations] = useState<StaffNegotiation[]>([]);
  const [negotiationCandidates, setNegotiationCandidates] = useState<StaffNegotiation["directorate"][]>([]);
  const [status, setStatus] = useState("Loading engine...");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const spriteRoster = useMemo(() => session?.advisorRoster ?? [], [session]);
  const snapshot = useMemo(() => engineSnapshot(session, memos, latestResult), [latestResult, memos, session]);
  const previewMatchesCurrentTurn = Boolean(preview && session && preview.projectedResult.input.turn === session.state.turn);
  const acceptedRiskCandidates = previewMatchesCurrentTurn && preview ? preview.acceptedRiskCandidates : [];
  const acceptedRiskCount = acceptedRiskOverridesFromChoices(acceptedRiskCandidates, acceptedRiskChoices).length;
  const acceptedRisksReady = previewMatchesCurrentTurn && allAcceptedRiskCandidatesChosen(acceptedRiskCandidates, acceptedRiskChoices);
  const visibleChiefPositions = previewMatchesCurrentTurn && preview ? preview.projectedResult.chiefPositions : latestResult?.chiefPositions ?? [];

  function updateNegotiation(directorate: StaffNegotiation["directorate"], enabled: boolean) {
    setStaffNegotiations((entries) => {
      const rest = entries.filter((entry) => entry.directorate !== directorate);
      return enabled ? [...rest, { directorate, reliefPoints: 1, cost: "political_cover" }] : rest;
    });
    setPreview(null);
    setAcceptedRiskChoices({});
    setStatus("Staff negotiation changed. Preview the turn again before resolving.");
  }

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
      setAcceptedRiskChoices({});
      setStaffNegotiations([]);
      setNegotiationCandidates([]);
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
      setAcceptedRiskChoices({});
      setStaffNegotiations([]);
      setNegotiationCandidates([]);
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
        body: JSON.stringify({ input: defaultTurnInput(session, memos, [], staffNegotiations) }),
      });
      setPreview(data);
      setNegotiationCandidates(Array.from(new Set(data.chiefCoalitions.flatMap((entry) => entry.staffConstraintDirectorates))));
      setAcceptedRiskChoices(initialAcceptedRiskChoices(data.acceptedRiskCandidates));
      setStatus("Default text simulation preview generated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preview engine turn");
    } finally {
      setBusy(false);
    }
  }

  async function resolveDefaultTurn() {
    if (!session) return;
    if (!preview || preview.projectedResult.input.turn !== session.state.turn) {
      setError("Preview the text turn before resolving so S1-S5 warnings can be accepted explicitly.");
      return;
    }
    if (!allAcceptedRiskCandidatesChosen(preview.acceptedRiskCandidates, acceptedRiskChoices)) {
      setError("Resolve turn requires player acceptance for every projected S1-S5 staff warning.");
      return;
    }
    const acceptedRiskOverrides = acceptedRiskOverridesFromChoices(preview.acceptedRiskCandidates, acceptedRiskChoices);
    setBusy(true);
    setError(null);
    try {
      const data = await fetchJson<SessionEnvelope & { result: TurnResult }>(`${apiBase}/sessions/${session.id}/resolve-turn`, {
        method: "POST",
        body: JSON.stringify({ input: defaultTurnInput(session, memos, acceptedRiskOverrides, staffNegotiations) }),
      });
      setSession(data.session);
      setMemos(data.memos);
      setPreview(null);
      setAcceptedRiskChoices({});
      setStaffNegotiations([]);
      setNegotiationCandidates([]);
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
    <main className="app">
      <header className="app-bar">
        <div>
          <p className="app-bar__eyebrow">Brass Ledger Engine</p>
          <h1 className="app-bar__title">Command Workbench</h1>
          <p className="app-bar__lede">{scenario?.description ?? "Scenario metadata is loading from the backend."}</p>
        </div>
        <div className="app-bar__actions">
          <button type="button" className="btn" onClick={() => void loadLatest()} disabled={busy}>
            Load latest
          </button>
          <button type="button" className="btn" onClick={() => void startSession()} disabled={busy}>
            New session
          </button>
          <button type="button" className="btn" onClick={() => void previewDefaultTurn()} disabled={busy || !session}>
            Preview text turn
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void resolveDefaultTurn()}
            disabled={busy || !session || !acceptedRisksReady}
          >
            Resolve accepted turn
          </button>
        </div>
      </header>

      {error && (
        <div className="alert" role="alert">
          <svg className="alert__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.42 0Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="statusline" role="status" aria-live="polite">
        <span className="statusline__dot" data-busy={busy ? "true" : "false"} aria-hidden="true" />
        <span>{status}</span>
      </div>

      <section className="panel-grid">
        <article className="panel" aria-labelledby="engine-output-heading">
          <div className="panel__head">
            <div>
              <h2 className="panel__title" id="engine-output-heading">
                Engine Output
              </h2>
            </div>
          </div>
          <pre className="readout">{JSON.stringify(preview ? previewSnapshot(preview) : snapshot, null, 2)}</pre>
        </article>

        <aside className="panel" aria-labelledby="sprites-heading">
          <div className="panel__head">
            <div>
              <h2 className="panel__title" id="sprites-heading">
                Generated Sprites
              </h2>
            </div>
            {spriteRoster.length > 0 && <span className="pill">{spriteRoster.length} sprites</span>}
          </div>
          {spriteRoster.length === 0 ? (
            <p className="panel__note">No sprites yet. Create or load a session to generate the advisor roster.</p>
          ) : (
            <div className="sprite-grid">
              {spriteRoster.map((advisor) => (
                <figure className="sprite" key={advisor.chiefId}>
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

      <section className="panel" aria-labelledby="accepted-risk-heading">
        <div className="panel__head">
          <div>
            <h2 className="panel__title" id="accepted-risk-heading">
              Accepted Risk Docket
            </h2>
          </div>
          {previewMatchesCurrentTurn && (
            <span className={acceptedRisksReady ? "pill pill--ready" : "pill"}>
              {acceptedRiskCount}/{acceptedRiskCandidates.length} accepted
            </span>
          )}
        </div>
        {!previewMatchesCurrentTurn ? (
          <p className="panel__note">Preview a turn to review projected S1-S5 warnings.</p>
        ) : acceptedRiskCandidates.length === 0 ? (
          <p className="panel__note">No accepted-risk warnings projected for this turn.</p>
        ) : (
          <div className="choice-list">
            {acceptedRiskCandidates.map((risk) => {
              const key = acceptedRiskKey(risk);
              return (
                <label className="choice" key={key}>
                  <input
                    type="checkbox"
                    checked={acceptedRiskChoices[key] === true}
                    onChange={(event) => {
                      const accepted = event.currentTarget.checked;
                      setAcceptedRiskChoices((choices) => setAcceptedRiskChoice(choices, risk, accepted));
                    }}
                  />
                  <span className="choice__body">
                    <strong className="choice__code">{risk.staffFunctionId}</strong>
                    <span className="choice__text">{risk.warningText}</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel" aria-labelledby="staff-negotiation-heading">
        <div className="panel__head">
          <div>
            <h2 className="panel__title" id="staff-negotiation-heading">
              Staff Negotiations
            </h2>
          </div>
          <span className={staffNegotiations.length > 0 ? "pill pill--active" : "pill"}>{staffNegotiations.length} active</span>
        </div>
        {negotiationCandidates.length === 0 ? (
          <p className="panel__note">Preview a turn to identify constrained staff lanes.</p>
        ) : (
          <div className="choice-list">
            {negotiationCandidates.map((directorate) => {
              const active = staffNegotiations.some((entry) => entry.directorate === directorate);
              return (
                <label className="choice" key={directorate}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(event) => updateNegotiation(directorate, event.currentTarget.checked)}
                  />
                  <span className="choice__body">
                    <strong className="choice__code">{directorate}</strong>
                    <span className="choice__text">Relieve 1 burden point for political cover.</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel" aria-labelledby="chief-evidence-heading">
        <div className="panel__head">
          <div>
            <h2 className="panel__title" id="chief-evidence-heading">
              S1-S5 Evidence
            </h2>
          </div>
          <span className="pill">{visibleChiefPositions.length} reads</span>
        </div>
        {visibleChiefPositions.length === 0 ? (
          <p className="panel__note">No chief positions available.</p>
        ) : (
          <div className="evidence-grid">
            {visibleChiefPositions.slice(0, 12).map((position) => (
              <article className="evidence" key={`${position.chiefId}:${position.memoId}:${position.optionId}`}>
                <div className="evidence__head">
                  <strong className="evidence__name">{position.chiefName}</strong>
                  <span className="evidence__position">{position.position.replace("_", " ")}</span>
                </div>
                <p className="evidence__rationale">{position.staffReadoutEvidence.rationale}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel" aria-labelledby="scenario-contract-heading">
        <div className="panel__head">
          <div>
            <h2 className="panel__title" id="scenario-contract-heading">
              Scenario Contract
            </h2>
          </div>
        </div>
        <pre className="readout">
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
