import { useCallback, useEffect, useState } from "react";
import type { ScenarioSummary, MemoSelection, StaffNegotiation, AcceptedRiskOverride, StaffFunctionReadout, ChiefConversationRecord } from "@brass-ledger/shared";
import { buildStaffFunctionReadouts, buildDirectorateBurden } from "@brass-ledger/shared";
import type { AppRoute, TurnCycleState, SessionSummary, TurnStep } from "./lib/types";
import {
  describeError,
  listSessions, createSession, loadSession, deleteSession,
  resolveTurn, exportSession, importSession, validateReplay,
  openChiefConversation, respondToChief,
} from "./lib/api";
import { usePreview } from "./hooks/usePreview";
import { scenarioLabels } from "./lib/labels";
import { AppShell } from "./components/AppShell";
import { SessionHub } from "./screens/SessionHub";
import { BriefingScreen } from "./screens/BriefingScreen";
import { MemosScreen } from "./screens/MemosScreen";
import { ChiefsPaperScreen } from "./screens/ChiefsPaperScreen";
import { PreCommitScreen } from "./screens/PreCommitScreen";
import { AfterActionScreen } from "./screens/AfterActionScreen";
import { RecordsScreen } from "./screens/RecordsScreen";

function riskKey(risk: AcceptedRiskOverride) {
  return `${risk.staffFunctionId}:${risk.warningText}`;
}

const emptyTurnCycle: TurnCycleState = {
  session: null as never,
  memos: [],
  selections: [],
  preview: null,
  acceptedRiskChoices: {},
  staffNegotiations: [],
  latestResult: null,
};

export function App() {
  const [route, setRoute] = useState<AppRoute>({ screen: "hub" });
  const [scenario, setScenario] = useState<ScenarioSummary | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [cycle, setCycle] = useState<TurnCycleState>(emptyTurnCycle);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<ChiefConversationRecord | null>(null);
  const [conversationBusy, setConversationBusy] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [negotiationCandidates, setNegotiationCandidates] = useState<StaffNegotiation["directorate"][]>([]);
  const [validationResults, setValidationResults] = useState<Record<string, { ok: boolean; checkedTurns: number; failedAtTurn: number | null }>>({});

  const sessionId = route.screen === "session" ? route.sessionId : null;
  const { preview, loading: previewLoading, error: previewError, requestPreview, clearPreview, setPreview } = usePreview(sessionId);

  const currentStaffFunctions: StaffFunctionReadout[] = (() => {
    if (!cycle.session) return [];
    const definitions = scenario?.staffFunctions ?? [];
    const capacities = scenario?.staffCapacities ?? [];
    const burdens = buildDirectorateBurden(cycle.memos, cycle.selections, capacities, cycle.staffNegotiations);
    return buildStaffFunctionReadouts(definitions, burdens, cycle.session.state);
  })();

  const labels = scenarioLabels(scenario);

  const staffReadouts: StaffFunctionReadout[] =
    (preview?.projectedResult.staffFunctions.length ?? 0) > 0
      ? preview!.projectedResult.staffFunctions
      : currentStaffFunctions;

  async function refreshSessions() {
    const data = await listSessions();
    setSessions(data.sessions);
  }

  async function handleLoadSession(id: string) {
    setBusy(true);
    setError(null);
    try {
      const data = await loadSession(id);
      const latestResult = data.session.history.at(-1) ?? null;
      const newCycle: TurnCycleState = { ...emptyTurnCycle, session: data.session, memos: data.memos, latestResult };
      setCycle(newCycle);
      clearPreview();
      setActiveConversation(null);
      setNegotiationCandidates([]);
      const step: TurnStep = latestResult && data.session.state.campaignStatus === "active" ? "briefing" : latestResult ? "after-action" : "briefing";
      setRoute({ screen: "session", sessionId: id, step: latestResult ? "after-action" : "briefing" });
    } catch (err) {
      setError(describeError(err, "Could not open that campaign. It may have been deleted. Go back and try another."));
    } finally {
      setBusy(false);
    }
  }

  async function handleNewSession() {
    setBusy(true);
    setError(null);
    try {
      const data = await createSession();
      const newCycle: TurnCycleState = { ...emptyTurnCycle, session: data.session, memos: data.memos, latestResult: null };
      setCycle(newCycle);
      clearPreview();
      setActiveConversation(null);
      setNegotiationCandidates([]);
      await refreshSessions();
      setRoute({ screen: "session", sessionId: data.session.id, step: "briefing" });
    } catch (err) {
      setError(describeError(err, "Could not start a new campaign. Try again."));
    } finally {
      setBusy(false);
    }
  }

  function handleSelectMemo(memoId: string, optionId: string | null) {
    setCycle((prev) => {
      const filtered = prev.selections.filter((s) => s.memoId !== memoId);
      const nextSelections = optionId ? [...filtered, { memoId, optionId }] : filtered;
      const nextCycle = { ...prev, selections: nextSelections, preview: null, acceptedRiskChoices: {} };
      if (nextSelections.length > 0) {
        requestPreview(nextCycle, nextSelections, prev.staffNegotiations);
      }
      return nextCycle;
    });
  }

  function handleAcceptRisk(risk: AcceptedRiskOverride, accepted: boolean) {
    setCycle((prev) => ({
      ...prev,
      acceptedRiskChoices: { ...prev.acceptedRiskChoices, [riskKey(risk)]: accepted },
    }));
  }

  function handleNegotiation(directorate: StaffNegotiation["directorate"], enabled: boolean) {
    setCycle((prev) => {
      const filtered = prev.staffNegotiations.filter((n) => n.directorate !== directorate);
      const next: StaffNegotiation[] = enabled
        ? [...filtered, { directorate, reliefPoints: 1, cost: "political_cover" }]
        : filtered;
      const nextCycle = { ...prev, staffNegotiations: next, preview: null, acceptedRiskChoices: {} };
      requestPreview(nextCycle, prev.selections, next);
      return nextCycle;
    });
  }

  async function handleCommit() {
    if (!sessionId || !cycle.session) return;
    const candidates = preview?.acceptedRiskCandidates ?? [];
    const overrides: AcceptedRiskOverride[] = candidates.filter((r) => cycle.acceptedRiskChoices[riskKey(r)] === true);
    setBusy(true);
    setError(null);
    try {
      const data = await resolveTurn(
        sessionId,
        cycle.session,
        cycle.selections,
        overrides,
        cycle.staffNegotiations,
        cycle.session.revision,
      );
      const newCycle: TurnCycleState = {
        ...emptyTurnCycle,
        session: data.session,
        memos: data.memos,
        latestResult: data.result,
      };
      setCycle(newCycle);
      clearPreview();
      setPreview(null);
      setActiveConversation(null);
      setNegotiationCandidates([]);
      await refreshSessions();
      setRoute({ screen: "session", sessionId, step: "after-action" });
    } catch (err) {
      setError(describeError(err, "The month was not committed. Your choices are still here — try again."));
    } finally {
      setBusy(false);
    }
  }

  async function handleOpenConversation(chiefId: string, memoId: string, optionId: string) {
    if (!sessionId) return;
    setConversationBusy(true);
    setConversationError(null);
    try {
      const data = await openChiefConversation(sessionId, chiefId, memoId, optionId, cycle.session?.revision);
      setActiveConversation(data.conversation);
      setCycle((prev) => ({ ...prev, session: data.session, memos: data.memos }));
    } catch (err) {
      setConversationError(describeError(err, "Could not open a conversation with this chief. Close this panel and try again, or commit the month without talking to them."));
    } finally {
      setConversationBusy(false);
    }
  }

  async function handleRespond(chiefId: string, responseId: string) {
    if (!sessionId) return;
    setConversationBusy(true);
    setConversationError(null);
    try {
      const data = await respondToChief(sessionId, chiefId, responseId, cycle.session?.revision);
      setActiveConversation(data.conversation);
      setCycle((prev) => ({ ...prev, session: data.session, memos: data.memos }));
    } catch (err) {
      setConversationError(describeError(err, "Your reply did not reach the chief. Choose it again."));
    } finally {
      setConversationBusy(false);
    }
  }

  async function handleDeleteSession(id: string) {
    setBusy(true);
    setError(null);
    try {
      await deleteSession(id);
      await refreshSessions();
    } catch (err) {
      setError(describeError(err, "Could not delete that campaign. It is still in your records."));
    } finally {
      setBusy(false);
    }
  }

  async function handleExportSession(id: string) {
    try {
      const data = await exportSession(id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brass-ledger-${id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(describeError(err, "Could not save that campaign to a file."));
    }
  }

  async function handleImportSession(file: File) {
    setBusy(true);
    setError(null);
    try {
      const text = await file.text();
      const exportData = JSON.parse(text);
      await importSession(exportData);
      await refreshSessions();
    } catch (err) {
      setError(describeError(err, "Could not read that file. It must be a campaign file saved from this version of Brass Ledger."));
    } finally {
      setBusy(false);
    }
  }

  async function handleValidateReplay(id: string) {
    try {
      const data = await validateReplay(id);
      setValidationResults((prev) => ({
        ...prev,
        [id]: {
          ok: data.validation.ok,
          checkedTurns: data.validation.checkedTurns,
          failedAtTurn: data.validation.failedAtTurn,
        },
      }));
    } catch (err) {
      setError(describeError(err, "Could not check that campaign's replay."));
    }
  }

  function navigateStep(step: TurnStep) {
    if (route.screen !== "session") return;
    setRoute({ ...route, step });
    setError(null);
  }

  function handleNextMonth() {
    if (!cycle.session) return;
    const latestResult = cycle.session.history.at(-1) ?? null;
    setCycle((prev) => ({
      ...prev,
      selections: [],
      preview: null,
      acceptedRiskChoices: {},
      staffNegotiations: [],
      latestResult,
    }));
    clearPreview();
    setActiveConversation(null);
    setNegotiationCandidates([]);
    if (route.screen === "session") {
      setRoute({ ...route, step: "briefing" });
    }
  }

  useEffect(() => {
    if (preview) {
      setCycle((prev) => ({
        ...prev,
        preview,
        acceptedRiskChoices: Object.fromEntries(
          (preview.acceptedRiskCandidates ?? []).map((r) => [riskKey(r), false]),
        ),
      }));
      setNegotiationCandidates(
        Array.from(new Set(preview.chiefCoalitions.flatMap((c) => c.staffConstraintDirectorates))),
      );
    }
  }, [preview]);

  useEffect(() => {
    async function bootstrap() {
      try {
        const [scenarioData, recordsData] = await Promise.all([
          fetch("/api/scenario").then((r) => r.json()) as Promise<{ scenario: ScenarioSummary }>,
          listSessions(),
        ]);
        setScenario(scenarioData.scenario);
        setSessions(recordsData.sessions);
      } catch {
        setError("Cannot reach the Brass Ledger server. Check that it is running, then reload this page.");
      }
    }
    void bootstrap();
  }, []);

  const chiefPositions = preview?.projectedResult.chiefPositions ?? cycle.latestResult?.chiefPositions ?? [];
  const chiefCoalitions = preview?.chiefCoalitions ?? cycle.latestResult?.chiefCoalitions ?? [];
  const showRail = route.screen === "session";

  return (
    <AppShell
      readouts={staffReadouts}
      briefing={cycle.session?.state.briefing}
      state={cycle.session?.state}
      onNavigateHub={() => { setRoute({ screen: "hub" }); setError(null); }}
      onNavigateRecords={() => { setRoute({ screen: "records" }); setError(null); }}
      showRail={showRail}
    >
      {route.screen === "hub" && (
        <SessionHub
          sessions={sessions}
          scenarioTitle={scenario?.title ?? "Brass Ledger"}
          scenarioDescription={scenario?.description ?? "Loading the scenario…"}
          busy={busy}
          error={error}
          onLoad={handleLoadSession}
          onNew={handleNewSession}
        />
      )}

      {route.screen === "session" && cycle.session && route.step === "briefing" && (
        <BriefingScreen
          session={cycle.session}
          memos={cycle.memos}
          staffReadouts={currentStaffFunctions}
          labels={labels}
          onProceed={() => navigateStep("memos")}
        />
      )}

      {route.screen === "session" && cycle.session && route.step === "memos" && (
        <MemosScreen
          memos={cycle.memos}
          selections={cycle.selections}
          staffNegotiations={cycle.staffNegotiations}
          preview={preview}
          previewLoading={previewLoading}
          previewError={previewError}
          canProceed={Boolean(preview && cycle.selections.length > 0)}
          onSelect={handleSelectMemo}
          onProceed={() => navigateStep("chiefs")}
          onBack={() => navigateStep("briefing")}
        />
      )}

      {route.screen === "session" && cycle.session && route.step === "chiefs" && (
        <ChiefsPaperScreen
          chiefPositions={chiefPositions}
          chiefCoalitions={chiefCoalitions}
          advisorRoster={cycle.session.advisorRoster}
          session={cycle.session}
          memos={cycle.memos}
          conversationBusy={conversationBusy}
          conversationError={conversationError}
          activeConversation={activeConversation}
          onOpenConversation={handleOpenConversation}
          onRespond={handleRespond}
          onProceed={() => navigateStep("commit")}
          onBack={() => navigateStep("memos")}
        />
      )}

      {route.screen === "session" && cycle.session && route.step === "commit" && (
        <PreCommitScreen
          preview={preview}
          selections={cycle.selections}
          acceptedRiskChoices={cycle.acceptedRiskChoices}
          staffNegotiations={cycle.staffNegotiations}
          negotiationCandidates={negotiationCandidates}
          turnNumber={cycle.session.state.turn}
          busy={busy}
          error={error}
          onAcceptRisk={handleAcceptRisk}
          onNegotiation={handleNegotiation}
          onCommit={handleCommit}
          onBack={() => navigateStep("chiefs")}
        />
      )}

      {route.screen === "session" && cycle.session && route.step === "after-action" && cycle.latestResult && (
        <AfterActionScreen
          result={cycle.latestResult}
          previousStaffFunctions={cycle.latestResult.previousState
            ? buildStaffFunctionReadouts(
                scenario?.staffFunctions ?? [],
                buildDirectorateBurden(
                  cycle.latestResult.memos,
                  cycle.latestResult.input.selections,
                  scenario?.staffCapacities ?? [],
                ),
                cycle.latestResult.previousState,
              )
            : []}
          labels={labels}
          onNextMonth={handleNextMonth}
          onViewRecords={() => setRoute({ screen: "records" })}
        />
      )}

      {route.screen === "session" && cycle.session && route.step === "after-action" && !cycle.latestResult && (
        <div className="p-6">
          <p className="text-sm text-ink/50">
            There is nothing to report yet — this campaign has no committed month.
          </p>
          <button type="button" onClick={() => navigateStep("briefing")} className="mt-3 text-sm border border-border px-3 py-2">
            Back to the monthly brief
          </button>
        </div>
      )}

      {route.screen === "records" && (
        <RecordsScreen
          sessions={sessions}
          busy={busy}
          error={error}
          onLoad={handleLoadSession}
          onDelete={handleDeleteSession}
          onExport={handleExportSession}
          onImport={handleImportSession}
          onValidate={handleValidateReplay}
          onBack={() => setRoute({ screen: "hub" })}
          validationResults={validationResults}
        />
      )}
    </AppShell>
  );
}
