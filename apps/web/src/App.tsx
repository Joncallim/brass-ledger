import { useEffect, useMemo, useState } from "react";
import {
  buildStrategicMetricBriefs,
  directorateLabel,
  type ChiefPositionEntry,
  type DecisionMemo,
  type GameSession,
  type MonthlyEstimate,
  type ScenarioSummary,
  type TurnResult,
} from "@brass-ledger/shared";

type SessionEnvelope = {
  session: GameSession;
  summary: {
    id: string;
    updatedAt: string;
    turn: number;
    maxTurns: number;
    campaignStatus: string;
    campaignScore: number;
    campaignOutcome: string | null;
    replayCount: number;
    summary: string;
  };
  memos: DecisionMemo[];
};

type PreviewPayload = {
  projectedResult: TurnResult;
  disagreements: Array<{
    memoId: string;
    label: string;
    opposedBy: string[];
    conditionalBy: string[];
    supportedBy: string[];
  }>;
  predictedEvents: TurnResult["triggeredEvents"];
};

type MainTab = "decisions" | "chiefs" | "after-action" | "records";

const apiBase = "/api";

async function fetchJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed: ${response.status}`);
  }
  return data as T;
}

function metricTone(status: string) {
  if (status.includes("tight") || status.includes("thin") || status.includes("acute") || status.includes("brittle")) return "text-rose-200";
  if (status.includes("managed") || status.includes("recovering") || status.includes("watchful") || status.includes("mixed")) return "text-amber-100";
  return "text-emerald-200";
}

function positionTone(position: ChiefPositionEntry["position"]) {
  if (position === "support") return "border-emerald-500/25 bg-emerald-500/8";
  if (position === "accept_risk") return "border-slate-400/20 bg-slate-200/5";
  if (position === "request_conditions") return "border-amber-500/25 bg-amber-500/8";
  return "border-rose-500/25 bg-rose-500/10";
}

function formatSelectionInput(memos: DecisionMemo[], selections: Record<string, string>) {
  return memos.filter((memo) => selections[memo.id]).map((memo) => ({ memoId: memo.id, optionId: selections[memo.id] }));
}

function chiefName(chiefId: string, scenario: ScenarioSummary | null) {
  return scenario?.chiefs.find((entry) => entry.id === chiefId)?.name ?? chiefId;
}

export function App() {
  const [scenario, setScenario] = useState<ScenarioSummary | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [memos, setMemos] = useState<DecisionMemo[]>([]);
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [records, setRecords] = useState<Array<{ id: string; updatedAt: string; turn: number; maxTurns: number; campaignStatus: string; campaignScore: number; summary: string }>>([]);
  const [activeTab, setActiveTab] = useState<MainTab>("decisions");
  const [activeMemoId, setActiveMemoId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [latestResult, setLatestResult] = useState<TurnResult | null>(null);
  const [validation, setValidation] = useState<{ ok: boolean; diffs: Array<{ path: string }> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const activeMemo = useMemo(() => memos.find((entry) => entry.id === activeMemoId) ?? memos[0] ?? null, [activeMemoId, memos]);
  const selectedOption = activeMemo?.options.find((entry) => entry.id === selections[activeMemo.id]) ?? null;
  const currentResult = preview?.projectedResult ?? latestResult;
  const metricBriefs = useMemo(() => (session ? buildStrategicMetricBriefs(session.state) : []), [session]);
  const currentPositions = useMemo(() => {
    if (!currentResult || !activeMemo || !selectedOption) return [];
    return currentResult.chiefPositions.filter((entry) => entry.memoId === activeMemo.id && entry.optionId === selectedOption.id);
  }, [activeMemo, currentResult, selectedOption]);
  const requiredMemoCount = useMemo(() => memos.filter((memo) => !memo.optional).length, [memos]);
  const completedMemoCount = useMemo(() => memos.filter((memo) => Boolean(selections[memo.id])).length, [memos, selections]);
  const readyToPreview = useMemo(() => memos.filter((memo) => !memo.optional).every((memo) => selections[memo.id]), [memos, selections]);

  async function refreshRecords() {
    const data = await fetchJson<{ sessions: typeof records }>(`${apiBase}/sessions`);
    setRecords(data.sessions);
  }

  async function startNewCampaign() {
    setLoading(true);
    setError(null);
    const [scenarioResponse, sessionResponse] = await Promise.all([
      fetchJson<{ scenario: ScenarioSummary }>(`${apiBase}/scenario`),
      fetchJson<SessionEnvelope>(`${apiBase}/sessions`, { method: "POST" }),
    ]);
    setScenario(scenarioResponse.scenario);
    setSession(sessionResponse.session);
    setMemos(sessionResponse.memos);
    setSelections({});
    setPreview(null);
    setLatestResult(null);
    setValidation(null);
    setActiveMemoId(sessionResponse.memos[0]?.id ?? null);
    await refreshRecords();
    setLoading(false);
  }

  async function loadSession(id: string) {
    setLoading(true);
    setError(null);
    const data = await fetchJson<SessionEnvelope>(`${apiBase}/sessions/${id}`);
    setSession(data.session);
    setMemos(data.memos);
    setSelections({});
    setPreview(null);
    setLatestResult(data.session.history.at(-1) ?? null);
    setValidation(null);
    setActiveMemoId(data.memos[0]?.id ?? null);
    setLoading(false);
  }

  async function deleteSession(id: string) {
    await fetchJson<{ ok: boolean }>(`${apiBase}/sessions/${id}`, { method: "DELETE" });
    if (session?.id === id) {
      await startNewCampaign();
    } else {
      await refreshRecords();
    }
  }

  useEffect(() => {
    void startNewCampaign().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to start campaign");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!session || !readyToPreview) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    void fetchJson<PreviewPayload>(`${apiBase}/sessions/${session.id}/preview-turn`, {
      method: "POST",
      body: JSON.stringify({ input: { turn: session.state.turn, selections: formatSelectionInput(memos, selections) } }),
    })
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to preview month");
      });
    return () => {
      cancelled = true;
    };
  }, [memos, readyToPreview, selections, session]);

  async function commitMonth() {
    if (!session || !readyToPreview) return;
    setSaving(true);
    setError(null);
    try {
      const data = await fetchJson<SessionEnvelope & { result: TurnResult; validation: { ok: boolean; diffs: Array<{ path: string }> } }>(
        `${apiBase}/sessions/${session.id}/resolve-turn`,
        {
          method: "POST",
          body: JSON.stringify({ input: { turn: session.state.turn, selections: formatSelectionInput(memos, selections) } }),
        },
      );
      setSession(data.session);
      setMemos(data.memos);
      setSelections({});
      setPreview(null);
      setLatestResult(data.result);
      setValidation(data.validation);
      setActiveTab("after-action");
      setActiveMemoId(data.memos[0]?.id ?? null);
      await refreshRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve month");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !scenario || !session) {
    return <div className="min-h-screen bg-[#0b1317] p-8 text-slate-100">Loading Brass Ledger...</div>;
  }

  const hoveredMetricData = metricBriefs.find((entry) => entry.key === hoveredMetric) ?? null;
  const activeBurden = currentResult?.directorateBurden ?? [];
  const activeEstimate: MonthlyEstimate | null = currentResult?.monthlyEstimate ?? null;

  return (
    <div className="min-h-screen bg-[#0b1317] text-slate-100">
      <header className="border-b border-white/10 bg-[#10191d]">
        <div className="mx-auto max-w-[1600px] px-6 py-5">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Joint Headquarters Command Desk</div>
              <h1 className="mt-2 text-3xl font-semibold text-slate-100">Brass Ledger</h1>
              <div className="mt-2 max-w-3xl text-sm text-slate-400">{scenario.description}</div>
            </div>
            <div className="flex gap-2">
              <button className="border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/[0.04]" onClick={() => void startNewCampaign()}>New Campaign</button>
              <button className="border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/[0.04]" onClick={() => void refreshRecords()}>Refresh Records</button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-px border border-white/10 bg-white/10 lg:grid-cols-6">
            {metricBriefs.map((metric) => (
              <button
                key={metric.key}
                className="bg-[#0f171b] px-4 py-4 text-left hover:bg-[#121d22]"
                onMouseEnter={() => setHoveredMetric(metric.key)}
                onMouseLeave={() => setHoveredMetric((current) => (current === metric.key ? null : current))}
              >
                <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">{metric.label}</div>
                <div className="mt-2 text-xl font-semibold text-slate-100">{metric.headline}</div>
                <div className={`mt-1 text-sm ${metricTone(metric.status)}`}>{metric.status}</div>
              </button>
            ))}
          </div>

          {hoveredMetricData && (
            <div className="mt-3 border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-300">
              <div className="font-medium text-slate-100">{hoveredMetricData.detailTitle}</div>
              <div className="mt-2 grid gap-1 md:grid-cols-2">
                {hoveredMetricData.detailLines.map((line) => <div key={line}>{line}</div>)}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-6 py-6">
        {error && <div className="mb-4 border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

        <div className="mb-4 flex gap-2">
          {[
            ["decisions", "Decisions"],
            ["chiefs", "Chiefs"],
            ["after-action", "After Action"],
            ["records", "Records"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`min-w-[160px] border px-4 py-3 text-left text-base ${activeTab === id ? "border-white/30 bg-[#161f24] text-slate-100" : "border-white/10 bg-black/10 text-slate-400 hover:bg-white/[0.03]"}`}
              onClick={() => setActiveTab(id as MainTab)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
          <aside className="border border-white/10 bg-black/10 px-4 py-5">
            <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">{session.state.briefing.monthLabel}</div>
            <div className="mt-2 text-lg font-semibold text-slate-100">{session.state.briefing.theater}</div>
            <div className="mt-3 text-sm text-slate-300">{session.state.briefing.commandersIntent}</div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Objectives</div>
              <div className="mt-3 grid gap-3 text-sm">
                {session.state.briefing.campaignObjectives.map((objective) => (
                  <div key={objective.id} className="border-l border-white/10 pl-3">
                    <div className="font-medium text-slate-100">{objective.label}</div>
                    <div className="mt-1 text-slate-400">{objective.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Decision Status</div>
              <div className="mt-3 text-sm text-slate-300">{completedMemoCount}/{requiredMemoCount} required memos selected</div>
              <div className="mt-2 text-sm text-slate-400">{session.state.briefing.riskPosture}</div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <button
                className="w-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-left text-sm text-emerald-100 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-black/10 disabled:text-slate-500"
                disabled={!readyToPreview || saving || session.state.campaignStatus !== "active"}
                onClick={() => void commitMonth()}
              >
                {saving ? "Committing month..." : "Commit Commander Guidance"}
              </button>
            </div>
          </aside>

          <main className="min-w-0">
            {activeTab === "decisions" && (
              <div className="grid gap-5">
                <section className="border border-white/10 bg-black/10 px-5 py-5">
                  <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Situation Brief</div>
                  <div className="mt-3 text-base text-slate-200">{session.state.briefing.situationSummary}</div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-400">
                    {session.state.briefing.openQuestions.map((question) => <div key={question}>{question}</div>)}
                  </div>
                </section>

                <section className="border border-white/10 bg-black/10 px-5 py-5">
                  <div className="flex flex-wrap gap-2">
                    {memos.map((memo) => (
                      <button
                        key={memo.id}
                        className={`min-w-[170px] border px-4 py-3 text-left ${activeMemo?.id === memo.id ? "border-white/30 bg-[#161f24] text-slate-100" : "border-white/10 bg-black/10 text-slate-400 hover:bg-white/[0.03]"}`}
                        onClick={() => setActiveMemoId(memo.id)}
                      >
                        <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{memo.category}</div>
                        <div className="mt-2 text-base font-medium">{memo.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{selections[memo.id] ? "Decision selected" : memo.optional ? "Optional memo" : "Decision required"}</div>
                      </button>
                    ))}
                  </div>
                </section>

                {activeMemo && (
                  <section className="border border-white/10 bg-black/10 px-5 py-5">
                    <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">{activeMemo.category}</div>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-100">{activeMemo.title}</h2>
                    <div className="mt-3 text-slate-300">{activeMemo.issue}</div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Why Now</div>
                        <div className="mt-2 text-sm text-slate-300">{activeMemo.whyNow}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Staff Friction</div>
                        <div className="mt-2 text-sm text-slate-300">Sponsor: {directorateLabel(activeMemo.sponsorDirectorate)}. Principal objector: {directorateLabel(activeMemo.objectorDirectorate)}.</div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Assumptions</div>
                        <div className="mt-2 grid gap-2 text-sm text-slate-400">
                          {activeMemo.assumptions.map((entry) => <div key={entry}>{entry}</div>)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Known Unknowns</div>
                        <div className="mt-2 grid gap-2 text-sm text-slate-400">
                          {activeMemo.knownUnknowns.map((entry) => <div key={entry}>{entry}</div>)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4">
                      {activeMemo.options.map((option) => {
                        const selected = selections[activeMemo.id] === option.id;
                        return (
                          <label key={option.id} className={`block border px-5 py-4 ${selected ? "border-emerald-500/30 bg-emerald-500/8" : "border-white/10 bg-black/10 hover:bg-white/[0.02]"}`}>
                            <div className="flex items-start gap-4">
                              <input
                                className="mt-1"
                                type="radio"
                                checked={selected}
                                name={activeMemo.id}
                                onChange={() => setSelections((current) => ({ ...current, [activeMemo.id]: option.id }))}
                              />
                              <div className="min-w-0">
                                <div className="text-lg font-semibold text-slate-100">{option.label}</div>
                                <div className="mt-2 text-sm text-slate-300">{option.summary}</div>
                                <div className="mt-3 grid gap-2 text-sm text-slate-400 md:grid-cols-2">
                                  {option.tradeoffs.map((tradeoff) => <div key={tradeoff}>{tradeoff}</div>)}
                                </div>
                                <div className="mt-3 text-xs uppercase tracking-[0.12em] text-slate-500">
                                  Burden: {option.burden.map((entry) => `${directorateLabel(entry.directorate)} ${entry.points}`).join(" | ")}
                                </div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            )}

            {activeTab === "chiefs" && (
              <div className="grid gap-5">
                <section className="border border-white/10 bg-black/10 px-5 py-5">
                  <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Chiefs Paper</div>
                  <div className="mt-2 text-xl font-semibold text-slate-100">{activeEstimate?.chiefsPaperTitle ?? "Chiefs Paper"}</div>
                  <div className="mt-3 text-slate-300">{activeEstimate?.chiefsPaperSummary ?? "Select decisions across the month to see where the chiefs think the headquarters is drifting."}</div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-400">
                    {(activeEstimate?.chiefsPaperBullets ?? []).map((entry) => <div key={entry}>{entry}</div>)}
                  </div>
                  {activeEstimate?.uncertainty && <div className="mt-4 text-sm text-slate-500">{activeEstimate.uncertainty}</div>}
                  {activeEstimate?.commandersEstimate && <div className="mt-4 border-t border-white/10 pt-4 text-sm text-slate-300">{activeEstimate.commandersEstimate}</div>}
                </section>

                <section className="border border-white/10 bg-black/10 px-5 py-5">
                  <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Chiefs</div>
                  <div className="mt-4 grid gap-3">
                    {scenario.chiefs.map((chief) => (
                      <div key={chief.id} className="border border-white/10 px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium text-slate-100">{chief.name}</div>
                            <div className="mt-1 text-sm text-slate-400">{chief.title} | {directorateLabel(chief.directorate)}</div>
                          </div>
                          <div className="text-sm text-slate-500">{chief.temperament}</div>
                        </div>
                        <div className="mt-3 text-sm text-slate-300">{chief.doctrineBias}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "after-action" && (
              <div className="grid gap-5">
                <section className="border border-white/10 bg-black/10 px-5 py-5">
                  <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">After Action</div>
                  <div className="mt-3 text-xl font-semibold text-slate-100">{latestResult?.summary ?? "No month has been committed yet."}</div>
                  {validation && (
                    <div className={`mt-4 border px-4 py-3 text-sm ${validation.ok ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-100" : "border-rose-500/20 bg-rose-500/10 text-rose-200"}`}>
                      Replay validation: {validation.ok ? "clean" : `diffs detected (${validation.diffs.length})`}
                    </div>
                  )}
                </section>

                {latestResult && (
                  <>
                    <section className="border border-white/10 bg-black/10 px-5 py-5">
                      <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Outcome Ledger</div>
                      <div className="mt-4 grid gap-3">
                        {latestResult.afterAction.map((entry) => (
                          <div key={entry.heading} className="border border-white/10 px-4 py-4">
                            <div className="font-medium text-slate-100">{entry.heading}</div>
                            <div className="mt-2 text-sm text-slate-300">{entry.detail}</div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="border border-white/10 bg-black/10 px-5 py-5">
                      <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Triggered Events</div>
                      <div className="mt-4 grid gap-3">
                        {latestResult.triggeredEvents.length === 0 ? (
                          <div className="text-sm text-slate-400">No named event spike dominated the month.</div>
                        ) : latestResult.triggeredEvents.map((event) => (
                          <div key={event.id} className="border border-white/10 px-4 py-4">
                            <div className="font-medium text-slate-100">{event.title}</div>
                            <div className="mt-2 text-sm text-slate-300">{event.summary}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                )}
              </div>
            )}

            {activeTab === "records" && (
              <div className="border border-white/10 bg-black/10 px-5 py-5">
                <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Saved Campaigns</div>
                <div className="mt-4 border border-white/10 bg-black/10">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="border-b border-white/10 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Campaign</th>
                        <th className="px-4 py-3 font-medium">Turn</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Score</th>
                        <th className="px-4 py-3 font-medium">Updated</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((entry) => (
                        <tr key={entry.id} className={`border-b border-white/5 ${entry.id === session.id ? "bg-white/[0.03]" : ""}`}>
                          <td className="px-4 py-3 font-medium text-slate-100">{entry.summary}</td>
                          <td className="px-4 py-3 text-slate-300">{entry.turn}/{entry.maxTurns}</td>
                          <td className="px-4 py-3 text-slate-300">{entry.campaignStatus}</td>
                          <td className="px-4 py-3 text-slate-300">{entry.campaignScore}</td>
                          <td className="px-4 py-3 text-slate-400">{new Date(entry.updatedAt).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button className="border border-white/15 px-3 py-1 text-xs text-slate-200 hover:bg-white/[0.04]" onClick={() => void loadSession(entry.id)}>Load</button>
                              <button className="border border-rose-500/20 px-3 py-1 text-xs text-rose-200 hover:bg-rose-500/10" onClick={() => void deleteSession(entry.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>

          <aside className="border border-white/10 bg-black/10 px-5 py-5">
            <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Chiefs Debate</div>
            {!activeMemo || !selectedOption ? (
              <div className="mt-3 text-sm text-slate-400">Select an option in the active memo to see the chiefs’ institutional positions.</div>
            ) : (
              <div className="mt-4 grid gap-3">
                {currentPositions.map((entry) => (
                  <div key={`${entry.chiefId}-${entry.memoId}-${entry.optionId}`} className={`border px-4 py-4 ${positionTone(entry.position)}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-medium text-slate-100">{entry.chiefName}</div>
                      <div className="text-xs uppercase tracking-[0.1em] text-slate-400">{entry.position.replace("_", " ")}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">{entry.institutionalReason}</div>
                    <div className="mt-3 text-xs text-slate-400">Condition: {entry.requiredCondition}</div>
                    <div className="mt-1 text-xs text-slate-500">{entry.confidenceNote}</div>
                    <div className="mt-2 text-xs text-slate-400">If ignored: {entry.consequenceIfIgnored}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Directorate Burden</div>
              <div className="mt-4 grid gap-3">
                {activeBurden.length === 0 ? (
                  <div className="text-sm text-slate-400">Complete the required memos to forecast burden and execution risk.</div>
                ) : activeBurden.map((entry) => (
                  <div key={entry.directorate} className="border border-white/10 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-slate-100">{directorateLabel(entry.directorate)}</div>
                      <div className="text-xs uppercase tracking-[0.1em] text-slate-400">{entry.burdenLevel}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">{entry.burdenPoints}/{entry.capacity} load</div>
                    <div className="mt-2 text-sm text-slate-400">{entry.summary}</div>
                    <div className="mt-2 text-xs text-slate-500">Failure mode: {entry.failureMode}</div>
                  </div>
                ))}
              </div>
            </div>

            {preview && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Forecast</div>
                <div className="mt-3 text-sm text-slate-300">{preview.projectedResult.summary}</div>
                <div className="mt-3 grid gap-2 text-xs text-slate-400">
                  {preview.disagreements.map((entry) => (
                    <div key={entry.memoId}>
                      <div className="font-medium text-slate-300">{entry.label}</div>
                      <div>Support: {entry.supportedBy.map((id) => chiefName(id, scenario)).join(", ") || "none"}</div>
                      <div>Conditional: {entry.conditionalBy.map((id) => chiefName(id, scenario)).join(", ") || "none"}</div>
                      <div>Oppose: {entry.opposedBy.map((id) => chiefName(id, scenario)).join(", ") || "none"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
