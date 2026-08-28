import { useCallback, useEffect, useRef, useState } from "react";
import type { ScenarioSummary, MemoSelection, StaffNegotiation, AcceptedRiskOverride, StaffFunctionReadout, ChiefConversationRecord, CommanderIntent } from "@brass-ledger/shared";
import { buildStaffFunctionReadouts, buildDirectorateBurden } from "@brass-ledger/shared";
import type { AppRoute, TurnCycleState, SessionSummary, TurnStep } from "./lib/types";
import {
  describeError,
  listSessions, listScenarios, createSession, loadSession, deleteSession,
  resolveTurn, exportSession, importSession, validateReplay,
  openChiefConversation, respondToChief,
} from "./lib/api";
import { usePreview, previewFingerprint } from "./hooks/usePreview";
import { isPreviewValid } from "./lib/previewValidity";
import { scenarioLabels } from "./lib/labels";
import { AppShell } from "./components/AppShell";
import { FieldManual } from "./components/FieldManual";
import { PresentationModeToggle, type PresentationMode } from "./components/PresentationModeToggle";
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
  commanderIntent: undefined,
  latestResult: null,
};

const presentationStorageKey = "brass-ledger.presentation-mode";

function readPresentationMode(): PresentationMode {
  try {
    return window.localStorage.getItem(presentationStorageKey) === "compact" ? "compact" : "standard";
  } catch {
    return "standard";
  }
}

export function App() {
  const [route, setRoute] = useState<AppRoute>({ screen: "hub" });
  const [scenario, setScenario] = useState<ScenarioSummary | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedCommandPressureId, setSelectedCommandPressureId] = useState("standard");
  const [selectedStaffAssistanceId, setSelectedStaffAssistanceId] = useState("standard");
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [cycle, setCycle] = useState<TurnCycleState>(emptyTurnCycle);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<ChiefConversationRecord | null>(null);
  const [conversationBusy, setConversationBusy] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, { ok: boolean; checkedTurns: number; failedAtTurn: number | null }>>({});
  const [fieldManualOpen, setFieldManualOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState<PresentationMode>(readPresentationMode);
  const fieldManualTriggerRef = useRef<HTMLButtonElement>(null);
  // File inputs may report the same selection more than once while React is
  // reconciling the screen. Import creates a new authoritative campaign each
  // time, so guard the whole async transaction synchronously rather than
  // relying on the next render to disable the control.
  const importInFlightRef = useRef(false);

  const sessionId = route.screen === "session" ? route.sessionId : null;
  const { preview, previewKey, loading: previewLoading, error: previewError, requestPreview, clearPreview, setPreview } = usePreview(sessionId);

  const currentStaffFunctions: StaffFunctionReadout[] = (() => {
    if (!cycle.session) return [];
    const definitions = scenario?.staffFunctions ?? [];
    const capacities = scenario?.staffCapacities ?? [];
    // Thread the doctrine burdenBias so standing-session readouts carry the same
    // routingAttention labels and underpriced warnings the server returns (Codex P2,
    // PR #77) — without it the browser would silently show neutral routing until a
    // server preview arrives.
    const burdens = buildDirectorateBurden(cycle.memos, cycle.selections, capacities, cycle.staffNegotiations, scenario?.doctrineLens?.burdenBias);
    return buildStaffFunctionReadouts(definitions, burdens, cycle.session.state, scenario?.doctrineLens?.burdenBias);
  })();

  const labels = scenarioLabels(scenario);

  const currentPreviewKey = previewFingerprint(cycle.selections, cycle.staffNegotiations, cycle.session?.revision ?? null, cycle.commanderIntent);
  // ONE gated projection for EVERY preview consumer (staff readouts, chief
  // positions/coalitions, MemosScreen, PreCommitScreen, commit handling): a
  // preview may be consumed only when it is published, key-matched to the
  // CURRENT selections/negotiations/SESSION REVISION, and not still loading.
  // The fingerprint covers the revision, so any authoritative session
  // mutation (a chief conversation) invalidates it; the conversation handlers
  // additionally clear and re-request synchronously (closing pass 4 P1).
  const validPreview = isPreviewValid(preview, previewKey, currentPreviewKey, previewLoading) ? preview : null;

  // Relief-negotiation offers are DERIVED from the single gated projection, not
  // persisted separately (closing pass 5 P1): the moment validPreview becomes
  // null (a selection/negotiation change, a chief conversation advancing the
  // session revision, or a still-pending replacement request), the candidates
  // disappear SYNCHRONOUSLY — a stale offer can never stay checkable (or reach
  // the commit input) while the projection that produced it is invalid.
  // Closing pass 6 (c): ACTIVE negotiations stay visible even when the
  // negotiation-inclusive preview no longer lists their directorate — relief
  // that drops a directorate below the strain threshold must stay checkable so
  // it can still be unchecked. Such negotiations remain eligible per the
  // unnegotiated packet (the with-negotiations candidate set is a subset of
  // it), and the server re-validates eligibility at resolve-turn as the
  // authoritative gate.
  const negotiationCandidates: StaffNegotiation["directorate"][] = validPreview
    ? Array.from(
        new Set([
          ...validPreview.chiefCoalitions.flatMap((c) => c.staffConstraintDirectorates),
          ...cycle.staffNegotiations.map((n) => n.directorate),
        ]),
      )
    : [];

  const staffReadouts: StaffFunctionReadout[] =
    (validPreview?.projectedResult.staffFunctions.length ?? 0) > 0
      ? validPreview!.projectedResult.staffFunctions
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
      const loadedScenario = scenarios.find((candidate) => candidate.id === data.session.scenarioId && candidate.contentVersion === data.session.contentVersion);
      if (loadedScenario) setScenario(loadedScenario);
      const latestResult = data.session.history.at(-1) ?? null;
      const newCycle: TurnCycleState = { ...emptyTurnCycle, session: data.session, memos: data.memos, latestResult };
      setCycle(newCycle);
      clearPreview();
      setActiveConversation(null);
      const step: TurnStep = latestResult && data.session.state.campaignStatus === "active" ? "briefing" : latestResult ? "after-action" : "briefing";
      setRoute({ screen: "session", sessionId: id, step });
    } catch (err) {
      setError(describeError(err, "Could not open that campaign. It may have been deleted. Go back and try another."));
    } finally {
      setBusy(false);
    }
  }

  async function handleNewSession(scenarioId?: string) {
    setBusy(true);
    setError(null);
    try {
      const data = await createSession({ scenarioId, commandPressureId: selectedCommandPressureId, staffAssistanceId: selectedStaffAssistanceId });
      const createdScenario = scenarios.find((candidate) => candidate.id === data.session.scenarioId && candidate.contentVersion === data.session.contentVersion);
      if (createdScenario) setScenario(createdScenario);
      const newCycle: TurnCycleState = { ...emptyTurnCycle, session: data.session, memos: data.memos, latestResult: null };
      setCycle(newCycle);
      clearPreview();
      setActiveConversation(null);
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
      // Closing pass 6 P1: a selection edit changes WHICH relief offers are
      // legitimate (the packet's strained directorates shift), so the checked
      // negotiations must die SYNCHRONOUSLY — like a revision advance does —
      // and the replacement preview must be requested WITHOUT them. Keeping
      // them would let a no-longer-offered negotiation ride into the commit
      // input (the fingerprint matches because it includes them, so the
      // preview looks valid while the relief is stale).
      const nextCycle = { ...prev, selections: nextSelections, preview: null, acceptedRiskChoices: {}, staffNegotiations: [] };
      if (nextSelections.length > 0) {
        requestPreview(nextCycle, nextSelections, []);
      } else {
        // Deselecting the last memo leaves no selections to preview: the old
        // request and published preview must not stay valid (closing pass 2 P1).
        clearPreview();
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

  function handleCommanderIntent(intent: CommanderIntent | undefined) {
    setCycle((prev) => {
      const nextCycle = { ...prev, commanderIntent: intent, preview: null, acceptedRiskChoices: {} };
      if (nextCycle.selections.length > 0) requestPreview(nextCycle, nextCycle.selections, nextCycle.staffNegotiations, intent);
      return nextCycle;
    });
  }

  async function handleCommit() {
    if (!sessionId || !cycle.session) return;
    // Defense in depth (closing pass 3 P1): even if the commit button ever
    // slips past its disabled state, never fire resolve-turn while the preview
    // for the CURRENT selections/negotiations/session revision has not
    // resolved — a selection/negotiation change clears the preview
    // synchronously, and so does a chief conversation (which advances the
    // revision), so a stale projection (or none) must not reach the resolver.
    // validPreview is the single gated projection every consumer reads.
    if (validPreview === null || cycle.selections.length === 0) {
      return;
    }
    const candidates = validPreview.acceptedRiskCandidates ?? [];
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
        cycle.commanderIntent,
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
      const data = await openChiefConversation(sessionId, chiefId, memoId, optionId, cycle.selections, cycle.session?.revision);
      setActiveConversation(data.conversation);
      setCycle((prev) => {
        const revisionAdvanced = data.session.revision !== prev.session?.revision;
        const nextCycle = {
          ...prev,
          session: data.session,
          memos: data.memos,
          // The relief offers were projected against the PREVIOUS session
          // state, so a revision advance invalidates the checked negotiations
          // too (closing pass 5 P1): clear them SYNCHRONOUSLY and re-request
          // the preview WITHOUT them, so the old offer can never ride into the
          // commit input (or stay checkable) under a new projection. No-op
          // opens (the same conversation already on record) keep the revision
          // and the preview untouched.
          ...(revisionAdvanced ? { staffNegotiations: [], acceptedRiskChoices: {} } : {}),
        };
        // The server advanced the session revision (an authoritative mutation
        // — the conversation is on the record): the published preview was
        // projected against the OLD session state, so it must be invalidated
        // synchronously AND re-requested against the new revision, mirroring
        // a selection/negotiation change (closing pass 4 P1).
        if (revisionAdvanced) {
          requestPreview(nextCycle, nextCycle.selections, nextCycle.staffNegotiations);
        }
        return nextCycle;
      });
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
      setCycle((prev) => {
        const revisionAdvanced = data.session.revision !== prev.session?.revision;
        const nextCycle = {
          ...prev,
          session: data.session,
          memos: data.memos,
          // Same as handleOpenConversation (closing pass 5 P1): a reply mutates
          // the session (trust, commitments) and advances the revision, so the
          // old projection's relief offers — and any checked negotiations —
          // must not survive into the commit input. Clear synchronously and
          // re-request WITHOUT them.
          ...(revisionAdvanced ? { staffNegotiations: [], acceptedRiskChoices: {} } : {}),
        };
        // Same as handleOpenConversation: the preview for the old session must
        // be invalidated synchronously and re-requested against the new
        // revision (closing pass 4 P1).
        if (revisionAdvanced) {
          requestPreview(nextCycle, nextCycle.selections, nextCycle.staffNegotiations);
        }
        return nextCycle;
      });
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
    if (importInFlightRef.current) return;
    importInFlightRef.current = true;
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
      importInFlightRef.current = false;
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
    if (route.screen === "session") {
      setRoute({ ...route, step: "briefing" });
    }
  }

  useEffect(() => {
    if (validPreview) {
      setCycle((prev) => ({
        ...prev,
        preview: validPreview,
        acceptedRiskChoices: Object.fromEntries(
          (validPreview.acceptedRiskCandidates ?? []).map((r) => [riskKey(r), false]),
        ),
      }));
    }
  }, [validPreview]);

  useEffect(() => {
    async function bootstrap() {
      try {
        const [scenarioData, recordsData] = await Promise.all([
          listScenarios(),
          listSessions(),
        ]);
        const defaultScenario = scenarioData.scenarios[0] ?? null;
        setScenarios(scenarioData.scenarios);
        setScenario(defaultScenario);
        setSelectedScenarioId(defaultScenario?.id ?? null);
        setSessions(recordsData.sessions);
      } catch {
        setError("Cannot reach the Brass Ledger server. Check that it is running, then reload this page.");
      }
    }
    void bootstrap();
  }, []);

  // Previous results are historical reporting, never advice for the current
  // packet.  During a replacement forecast this deliberately renders empty
  // and the chiefs surface explains that it is recalculating.
  const chiefPositions = validPreview?.projectedResult.chiefPositions ?? [];
  const chiefCoalitions = validPreview?.chiefCoalitions ?? [];
  const showRail = route.screen === "session";
  const compactPresentation = presentationMode === "compact";

  function handlePresentationMode(mode: PresentationMode) {
    setPresentationMode(mode);
    try { window.localStorage.setItem(presentationStorageKey, mode); } catch { /* Preferences remain optional. */ }
  }

  return (
    <AppShell
      readouts={staffReadouts}
      briefing={cycle.session?.state.briefing}
      state={cycle.session?.state}
      onNavigateHub={() => { setRoute({ screen: "hub" }); setError(null); }}
      onNavigateRecords={() => { setRoute({ screen: "records" }); setError(null); }}
      showRail={showRail}
    >
      <div className="fixed right-4 bottom-4 z-40 flex gap-2">
        <PresentationModeToggle mode={presentationMode} onChange={handlePresentationMode} />
        <button ref={fieldManualTriggerRef} type="button" onClick={() => setFieldManualOpen(true)} aria-haspopup="dialog" aria-expanded={fieldManualOpen} className="border border-border bg-paper px-3 py-2 text-xs text-ink shadow hover:border-brass">Field manual</button>
      </div>
      {fieldManualOpen && <FieldManual scenario={scenario} onClose={() => setFieldManualOpen(false)} returnFocusRef={fieldManualTriggerRef} />}
      {route.screen === "hub" && (
        <SessionHub
          sessions={sessions}
          scenarioTitle={scenario?.title ?? "Brass Ledger"}
          scenarioDescription={scenario?.description ?? "Loading the scenario…"}
          scenarios={scenarios}
          selectedScenarioId={selectedScenarioId}
          selectedCommandPressureId={selectedCommandPressureId}
          selectedStaffAssistanceId={selectedStaffAssistanceId}
          busy={busy}
          error={error}
          onLoad={handleLoadSession}
          onSelectScenario={(id) => {
            const selected = scenarios.find((candidate) => candidate.id === id);
            if (selected) {
              setSelectedScenarioId(id);
              setScenario(selected);
              setSelectedCommandPressureId(selected.commandPressureProfiles.some((profile) => profile.id === "standard") ? "standard" : selected.commandPressureProfiles[0]?.id ?? "standard");
              setSelectedStaffAssistanceId(selected.staffAssistanceProfiles.some((profile) => profile.id === "standard") ? "standard" : selected.staffAssistanceProfiles[0]?.id ?? "standard");
            }
          }}
          onSelectCommandPressure={setSelectedCommandPressureId}
          onSelectStaffAssistance={setSelectedStaffAssistanceId}
          onNew={handleNewSession}
        />
      )}

      {route.screen === "session" && cycle.session && route.step === "briefing" && (
        <BriefingScreen
          session={cycle.session}
          memos={cycle.memos}
          staffReadouts={currentStaffFunctions}
          scenario={scenario}
          labels={labels}
          compactPresentation={compactPresentation}
          onProceed={() => navigateStep("memos")}
        />
      )}

      {route.screen === "session" && cycle.session && route.step === "memos" && (
        <MemosScreen
          memos={cycle.memos}
          selections={cycle.selections}
          session={cycle.session}
          chiefPositions={validPreview?.chiefPositions ?? []}
          staffNegotiations={cycle.staffNegotiations}
          commanderIntent={cycle.commanderIntent}
          staffAssistanceDetail={scenario?.staffAssistanceProfiles.find((profile) => profile.id === cycle.session.staffAssistanceId)?.forecastDetail}
          staffModules={scenario?.staffModules ?? []}
          preview={validPreview}
          previewLoading={previewLoading}
          previewError={previewError}
          canProceed={validPreview !== null && cycle.selections.length > 0}
          onSelect={handleSelectMemo}
          onCommanderIntent={handleCommanderIntent}
          onProceed={() => navigateStep("chiefs")}
          onBack={() => navigateStep("briefing")}
        />
      )}

      {route.screen === "session" && cycle.session && scenario && route.step === "chiefs" && (
        <ChiefsPaperScreen
          chiefPositions={chiefPositions}
          scenario={scenario}
          chiefCoalitions={chiefCoalitions}
          advisorRoster={cycle.session.advisorRoster}
          session={cycle.session}
          memos={cycle.memos}
          conversationBusy={conversationBusy}
          conversationError={conversationError}
          activeConversation={activeConversation}
          compactPresentation={compactPresentation}
          onOpenConversation={handleOpenConversation}
          onRespond={handleRespond}
          onProceed={() => navigateStep("commit")}
          onBack={() => navigateStep("memos")}
        />
      )}

      {route.screen === "session" && cycle.session && route.step === "commit" && (
        <PreCommitScreen
          preview={validPreview}
          previewKey={previewKey}
          currentPreviewKey={currentPreviewKey}
          previewLoading={previewLoading}
          selections={cycle.selections}
          session={cycle.session}
          chiefPositions={validPreview?.chiefPositions ?? []}
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
                  cycle.latestResult.input.staffNegotiations,
                  scenario?.doctrineLens?.burdenBias,
                ),
                cycle.latestResult.previousState,
                scenario?.doctrineLens?.burdenBias,
              )
            : []}
          labels={labels}
          compactPresentation={compactPresentation}
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
