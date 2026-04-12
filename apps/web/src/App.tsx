import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  buildAdvisorPortraitDataUri,
  buildStrategicMetricBriefs,
  chiefConversationStageMeta,
  directorateLabel,
  relationshipDeltaLabel,
  relationshipLabel,
  type ChiefPositionEntry,
  type ChiefConversationChoice,
  type ChiefConversationRecord,
  type DecisionMemo,
  type GameSession,
  type MonthlyEstimate,
  type ScenarioSummary,
  type SessionExport,
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

type SessionSummary = SessionEnvelope["summary"];

type ReplayValidationSummary = {
  ok: boolean;
  checkedTurns?: number;
  failedAtTurn?: number | null;
  failureKind?: string;
  diffs: Array<{ path: string; turn?: number }>;
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

type ChiefConversationOpenPayload = SessionEnvelope & {
  conversation: ChiefConversationRecord;
};

type ChiefConversationResponsePayload = SessionEnvelope & {
  conversation: ChiefConversationRecord;
  response: ChiefConversationChoice & {
    trustAfter: number;
    relationshipEffect: string;
  } | null;
};

type MainTab = "decisions" | "chiefs" | "after-action" | "records";
type DialogueTurn = { speaker: string; role: "commander" | "advisor"; text: string };

const apiBase = "/api";
const tabs: Array<{ id: MainTab; label: string; summary: string }> = [
  { id: "decisions", label: "Decisions", summary: "Monthly agenda, commander guidance, and memo selection." },
  { id: "chiefs", label: "Chiefs", summary: "Institutional advice, warnings, and strategic drift." },
  { id: "after-action", label: "After Action", summary: "What changed, what matured, and what was misread." },
  { id: "records", label: "Records", summary: "Saved campaigns and session continuity." },
];

const workflowSteps = [
  { id: "entry", label: "Entry", detail: "Start a campaign, resume one, or import a save." },
  { id: "briefing", label: "Briefing", detail: "Read the month and inspect the decision agenda." },
  { id: "decisions", label: "Decisions", detail: "Select required memos and any optional interventions." },
  { id: "forecast", label: "Forecast", detail: "Read the chiefs, burden, and expected event shifts." },
  { id: "guidance", label: "Guidance", detail: "Issue the month and let the staff resolve it." },
  { id: "after-action", label: "After action", detail: "Review the result, risk maturity, and the next problem." },
  { id: "records", label: "Records", detail: "Export, import, validate, or archive the save." },
] as const;

function directorateTheme(directorate: "people" | "intelligence" | "operations" | "sustainment" | "plans" | "training") {
  switch (directorate) {
    case "people":
      return { accent: "#8fcf88", wash: "rgba(143, 207, 136, 0.12)", line: "rgba(143, 207, 136, 0.42)" };
    case "intelligence":
      return { accent: "#78c4d4", wash: "rgba(120, 196, 212, 0.12)", line: "rgba(120, 196, 212, 0.4)" };
    case "operations":
      return { accent: "#e2b36c", wash: "rgba(226, 179, 108, 0.12)", line: "rgba(226, 179, 108, 0.4)" };
    case "sustainment":
      return { accent: "#d68d77", wash: "rgba(214, 141, 119, 0.12)", line: "rgba(214, 141, 119, 0.4)" };
    case "plans":
      return { accent: "#8ea4d6", wash: "rgba(142, 164, 214, 0.12)", line: "rgba(142, 164, 214, 0.4)" };
    case "training":
      return { accent: "#79c6ae", wash: "rgba(121, 198, 174, 0.12)", line: "rgba(121, 198, 174, 0.4)" };
  }
}

function chiefInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function metricAccent(key: string) {
  switch (key) {
    case "budget":
      return "#8ea4d6";
    case "readiness":
      return "#8fcf88";
    case "political":
      return "#e2b36c";
    case "allies":
      return "#79c6ae";
    case "public":
      return "#d68d77";
    case "escalation":
      return "#d77b7b";
    default:
      return "#9fb5ab";
  }
}

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

function advisorDisplay(chiefId: string, scenario: ScenarioSummary | null, session: GameSession | null) {
  const chief = scenario?.chiefs.find((entry) => entry.id === chiefId) ?? null;
  const advisor = session?.advisorRoster.find((entry) => entry.chiefId === chiefId) ?? null;

  return {
    chief,
    advisor,
    displayName: advisor?.displayName ?? chief?.name ?? chiefId,
    title: advisor?.title ?? chief?.title ?? "",
    directorate: advisor?.directorate ?? chief?.directorate ?? "plans",
    portraitSrc: advisor ? buildAdvisorPortraitDataUri(advisor.portrait) : null,
  };
}

function burdenBarWidth(points: number, capacity: number) {
  return `${Math.max(8, Math.min(100, Math.round((points / Math.max(capacity, 1)) * 100)))}%`;
}

function summarizeBurden(option: DecisionMemo["options"][number]) {
  if (option.burden.length === 0) return "Minimal staff disruption expected.";
  const ranked = [...option.burden].sort((left, right) => right.points - left.points);
  const lead = ranked[0];
  const secondary = ranked[1];
  return secondary
    ? `${directorateLabel(lead.directorate)} carries the lead burden, with ${directorateLabel(secondary.directorate).toLowerCase()} also pulled in early.`
    : `${directorateLabel(lead.directorate)} carries most of the staff load.`;
}

function optionSignal(option: DecisionMemo["options"][number]) {
  if (option.tags.includes("deterrence") || option.tags.includes("public-commitment")) {
    return "This reads outwardly as a visible posture move.";
  }
  if (option.tags.includes("recovery") || option.tags.includes("training")) {
    return "This reads more as force recovery than public signaling.";
  }
  if (option.tags.includes("program") || option.tags.includes("modernization")) {
    return "This reads as a future-capability choice more than an immediate operational move.";
  }
  return "This choice changes internal posture more than the public picture.";
}

function buildOptionBrief(memo: DecisionMemo, option: DecisionMemo["options"][number]) {
  const upside = option.tradeoffs[0] ?? option.summary;
  const cost = option.tradeoffs[1] ?? option.tradeoffs[0] ?? "The packet still carries real execution friction.";
  return {
    commandBrief: `${option.summary} ${summarizeBurden(option)}`,
    bestUsed: `Best used when the room wants to move on ${memo.category.toLowerCase()} without losing sight of ${option.tags.includes("recovery") ? "force recovery" : option.tags.includes("deterrence") ? "visible deterrence" : "support capacity"}.`,
    watchFor: cost,
    likelySignal: optionSignal(option),
    likelyUpside: upside,
  };
}

function decisionStatusCopy(completed: number, required: number) {
  const remaining = Math.max(required - completed, 0);
  if (required === 0) return "No standing decisions this month.";
  if (remaining === 0) return "The monthly agenda is fully tabled and ready for guidance.";
  if (remaining === 1) return "One required memo is still unresolved.";
  return `${remaining} required memos are still unresolved.`;
}

function objectiveSnapshot(session: GameSession, objective: GameSession["state"]["briefing"]["campaignObjectives"][number]) {
  let current = 0;
  switch (objective.metric) {
    case "deployableUnits":
      current = session.state.strategic.forceGeneration.deployableUnits;
      break;
    case "politicalAlignment":
      current = session.state.strategic.alliance.politicalAlignment;
      break;
    case "cabinetCover":
      current = session.state.strategic.domestic.cabinetCover;
      break;
    case "incidentLadder":
      current = session.state.strategic.escalation.incidentLadder;
      break;
  }
  const met = objective.direction === "gte" ? current >= objective.target : current <= objective.target;
  return {
    current,
    met,
    targetLabel: `${objective.direction === "gte" ? ">=" : "<="} ${objective.target}`,
    currentLabel: current.toFixed(objective.metric === "deployableUnits" ? 1 : 0),
  };
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function activeWorkflowStep(
  session: GameSession | null,
  activeTab: MainTab,
  hasPreviewInput: boolean,
  readyToPreview: boolean,
  latestResult: TurnResult | null,
): (typeof workflowSteps)[number]["id"] {
  if (!session) return "entry";
  if (activeTab === "records") return "records";
  if (session.state.campaignStatus !== "active") return "after-action";
  if (activeTab === "after-action" && latestResult) return "after-action";
  if (!hasPreviewInput) return "briefing";
  if (!readyToPreview) return "decisions";
  return "forecast";
}

function buildRoomPulse(
  session: GameSession,
  activeMemo: DecisionMemo | null,
  selectedOption: DecisionMemo["options"][number] | null,
  currentPositions: ChiefPositionEntry[],
  preview: PreviewPayload | null,
) {
  if (!activeMemo) {
    return {
      title: "The room is waiting for the first packet.",
      summary: "Open the month, pick the lead memo, and let the staff cohere around a concrete problem.",
      bullets: session.state.briefing.openQuestions.slice(0, 3),
    };
  }

  const loudestObjector = currentPositions.find((entry) => entry.position === "oppose");
  const conditionalVoice = currentPositions.find((entry) => entry.position === "request_conditions");
  const supportedBy = currentPositions.filter((entry) => entry.position === "support").map((entry) => entry.chiefName);

  return {
    title: selectedOption ? `${activeMemo.title} is pulling the room toward ${selectedOption.label.toLowerCase()}.` : `${activeMemo.title} is now the center of gravity.`,
    summary: selectedOption
      ? preview?.projectedResult.summary ?? selectedOption.summary
      : activeMemo.whyNow,
    bullets: [
      loudestObjector ? `${loudestObjector.chiefName} is the hardest objector.` : "No chief is openly breaking with the room yet.",
      conditionalVoice ? `${conditionalVoice.chiefName} wants conditions before endorsing the move.` : "No conditional support is currently dominating the debate.",
      supportedBy.length > 0 ? `The strongest support is coming from ${supportedBy.slice(0, 2).join(" and ")}.` : "Support is still diffuse and unsettled.",
    ],
  };
}

function buildDialogueTurns(
  chiefNameValue: string,
  doctrineBias: string,
  memo: DecisionMemo | null,
  option: DecisionMemo["options"][number] | null,
  position: ChiefPositionEntry | null,
  forecast: string | null,
): DialogueTurn[] {
  const subject = option?.label ?? memo?.title ?? "this month";
  return [
    { speaker: "Commander", role: "commander", text: `Talk me through ${subject.toLowerCase()}. What is the room missing?` },
    {
      speaker: chiefNameValue,
      role: "advisor",
      text: position?.institutionalReason ?? doctrineBias,
    },
    {
      speaker: "Commander",
      role: "commander",
      text: "What breaks first if I force this through anyway?",
    },
    {
      speaker: chiefNameValue,
      role: "advisor",
      text: position?.consequenceIfIgnored ?? forecast ?? "The risk is less about the first move than the second move the staff will no longer be able to support cleanly.",
    },
    {
      speaker: chiefNameValue,
      role: "advisor",
      text: position?.requiredCondition ?? "If you want this to hold, protect the staff from trying to do everything at once.",
    },
  ];
}

function formatPositionLabel(position: string | null | undefined) {
  if (!position) return "unsettled";
  return position.replaceAll("_", " ");
}

function buildDialogueGreeting(
  chiefDirectorate: "people" | "intelligence" | "operations" | "sustainment" | "plans" | "training",
  optionLabel: string | null,
) {
  const packet = optionLabel ? optionLabel.toLowerCase() : "the current packet";
  switch (chiefDirectorate) {
    case "people":
      return `I've reviewed ${packet}. If you want the human bill, I'll give it to you straight.`;
    case "intelligence":
      return `I've read ${packet} against the latest brief. If you want the uncertainty, I'll tell you where it lives.`;
    case "operations":
      return `I've looked at ${packet} in field terms. If you want usable effect, let's talk plainly.`;
    case "sustainment":
      return `I've traced ${packet} down to lift, fuel, and repair. Support reality is where this survives or breaks.`;
    case "plans":
      return `I've tested ${packet} against cabinet and coalition reactions. The language around it matters as much as the move itself.`;
    case "training":
      return `I've looked at what the force can really absorb from ${packet}. If it only works on paper, I'll say so.`;
  }
}

function buildDialogueFrontMatter(
  chiefTitle: string,
  memoTitle: string | null,
  optionLabel: string | null,
  positionLabel: string,
  relationship: string,
) {
  return [
    { label: "Channel", value: chiefTitle },
    { label: "Memo", value: memoTitle ?? "No memo selected" },
    { label: "Packet", value: optionLabel ?? "No course of action selected" },
    { label: "Current read", value: `${positionLabel} · relationship ${relationship}` },
  ];
}

function PlaceholderScene({
  title,
  subtitle,
  directorate,
  emphasis,
}: {
  title: string;
  subtitle: string;
  directorate: "people" | "intelligence" | "operations" | "sustainment" | "plans" | "training";
  emphasis: string;
}) {
  const theme = directorateTheme(directorate);
  const style = {
    borderColor: theme.line,
    background: `linear-gradient(180deg, ${theme.wash}, rgba(7, 12, 16, 0.92))`,
  } satisfies CSSProperties;

  return (
    <div className="placeholder-scene" style={style}>
      <div className="placeholder-scene__copy">
        <div className="placeholder-scene__title">{title}</div>
        <div className="placeholder-scene__subtitle">{subtitle}</div>
        <div className="placeholder-scene__emphasis">{emphasis}</div>
      </div>
      <svg className="placeholder-scene__art" viewBox="0 0 320 180" aria-hidden="true">
        <defs>
          <linearGradient id={`scene-gradient-${directorate}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.accent} stopOpacity="0.32" />
            <stop offset="100%" stopColor={theme.accent} stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <rect x="10" y="16" width="300" height="148" rx="10" fill={`url(#scene-gradient-${directorate})`} />
        <path d="M24 136 L88 84 L134 104 L190 54 L248 70 L296 42" stroke={theme.accent} strokeWidth="3" fill="none" opacity="0.9" />
        <path d="M28 146 L96 116 L152 124 L214 88 L294 106" stroke="#d7e2dc" strokeWidth="1.2" fill="none" opacity="0.32" />
        <circle cx="88" cy="84" r="6" fill={theme.accent} />
        <circle cx="190" cy="54" r="6" fill={theme.accent} />
        <circle cx="248" cy="70" r="6" fill={theme.accent} />
        <rect x="36" y="34" width="70" height="18" rx="4" fill="#0f171b" opacity="0.85" />
        <rect x="116" y="34" width="98" height="18" rx="4" fill="#0f171b" opacity="0.48" />
        <rect x="224" y="34" width="56" height="18" rx="4" fill="#0f171b" opacity="0.72" />
      </svg>
    </div>
  );
}

export function App() {
  const [scenario, setScenario] = useState<ScenarioSummary | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [memos, setMemos] = useState<DecisionMemo[]>([]);
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [records, setRecords] = useState<SessionSummary[]>([]);
  const [activeTab, setActiveTab] = useState<MainTab>("decisions");
  const [activeMemoId, setActiveMemoId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [latestResult, setLatestResult] = useState<TurnResult | null>(null);
  const [validation, setValidation] = useState<ReplayValidationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [importPayload, setImportPayload] = useState("");
  const [adminStatus, setAdminStatus] = useState<string | null>(null);
  const [adminBusy, setAdminBusy] = useState<"export" | "import" | "validate" | "delete" | "load" | "new" | null>(null);
  const [dialogueChiefId, setDialogueChiefId] = useState<string | null>(null);
  const [dialogueConversation, setDialogueConversation] = useState<ChiefConversationRecord | null>(null);
  const [dialogueBusy, setDialogueBusy] = useState<string | null>(null);
  const [dialogueStatus, setDialogueStatus] = useState<string | null>(null);

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
  const hasPreviewInput = useMemo(() => Object.keys(selections).length > 0, [selections]);
  const activeWorkflowId = useMemo(() => activeWorkflowStep(session, activeTab, hasPreviewInput, readyToPreview, latestResult), [activeTab, hasPreviewInput, latestResult, readyToPreview, session]);
  const activeWorkflow = useMemo(() => workflowSteps.find((step) => step.id === activeWorkflowId) ?? workflowSteps[0], [activeWorkflowId]);
  const latestRecord = useMemo(() => records[0] ?? null, [records]);
  const latestActiveRecord = useMemo(() => records.find((entry) => entry.campaignStatus === "active") ?? null, [records]);
  const roomPulse = useMemo(() => (session ? buildRoomPulse(session, activeMemo, selectedOption, currentPositions, preview) : null), [activeMemo, currentPositions, preview, selectedOption, session]);
  const dialogueAdvisor = useMemo(() => (dialogueChiefId ? advisorDisplay(dialogueChiefId, scenario, session) : null), [dialogueChiefId, scenario, session]);
  const dialogueChief = dialogueAdvisor?.chief ?? null;
  const dialoguePosition = useMemo(() => {
    if (!dialogueChief) return null;
    if (dialogueConversation) {
      return currentPositions.find(
        (entry) =>
          entry.chiefId === dialogueChief.id &&
          entry.memoId === dialogueConversation.memoId &&
          entry.optionId === dialogueConversation.optionId,
      ) ?? null;
    }
    return currentPositions.find((entry) => entry.chiefId === dialogueChief.id) ?? null;
  }, [currentPositions, dialogueChief, dialogueConversation]);
  const dialogueTurns = useMemo(
    () => {
      if (!dialogueChief) return [];
      if (dialogueConversation) return dialogueConversation.transcript;
      const turns = buildDialogueTurns(
            dialogueAdvisor?.displayName ?? dialogueChief.name,
            dialogueChief.doctrineBias,
            activeMemo,
            selectedOption,
            dialoguePosition,
            preview?.projectedResult.summary ?? latestResult?.summary ?? null,
          );
      return turns;
    },
    [activeMemo, dialogueAdvisor?.displayName, dialogueChief, dialogueConversation, dialoguePosition, latestResult?.summary, preview?.projectedResult.summary, selectedOption],
  );
  const dialogueRelationship = useMemo(
    () => relationshipLabel(session?.state.chiefTrust[dialogueChief?.id ?? ""] ?? 50),
    [dialogueChief?.id, session],
  );
  const dialogueFrontMatter = useMemo(
    () =>
      buildDialogueFrontMatter(
        dialogueAdvisor?.title ?? dialogueChief?.title ?? "Chief channel",
        dialogueConversation?.memoTitle ?? activeMemo?.title ?? null,
        dialogueConversation?.optionLabel ?? selectedOption?.label ?? null,
        formatPositionLabel(dialogueConversation?.position ?? dialoguePosition?.position ?? null),
        dialogueRelationship,
      ),
    [activeMemo?.title, dialogueAdvisor?.title, dialogueChief?.title, dialogueConversation?.memoTitle, dialogueConversation?.optionLabel, dialogueConversation?.position, dialoguePosition?.position, dialogueRelationship, selectedOption?.label],
  );
  const dialogueGreeting = useMemo(
    () =>
      dialogueChief
        ? buildDialogueGreeting(dialogueChief.directorate, dialogueConversation?.optionLabel ?? selectedOption?.label ?? null)
        : "",
    [dialogueChief, dialogueConversation?.optionLabel, selectedOption?.label],
  );

  async function refreshRecords() {
    try {
      const data = await fetchJson<{ sessions: SessionSummary[] }>(`${apiBase}/sessions`);
      setRecords(data.sessions);
    } catch (err) {
      setError((current) => current ?? (err instanceof Error ? err.message : "Failed to refresh records"));
      setRecords([]);
    }
  }

  async function startNewCampaign() {
    setLoading(true);
    setError(null);
    setAdminStatus(null);
    try {
      const sessionResponse = await fetchJson<SessionEnvelope>(`${apiBase}/sessions`, { method: "POST" });
      setSession(sessionResponse.session);
      setMemos(sessionResponse.memos);
      setSelections({});
      setPreview(null);
      setLatestResult(null);
      setValidation(null);
      setActiveMemoId(sessionResponse.memos[0]?.id ?? null);
      setActiveTab("decisions");
      setDialogueChiefId(null);
      setDialogueConversation(null);
      setDialogueStatus(null);
      await refreshRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start campaign");
    } finally {
      setLoading(false);
    }
  }

  async function loadSession(id: string) {
    setLoading(true);
    setError(null);
    setAdminStatus(null);
    try {
      const data = await fetchJson<SessionEnvelope>(`${apiBase}/sessions/${id}`);
      setSession(data.session);
      setMemos(data.memos);
      setSelections({});
      setPreview(null);
      setLatestResult(data.session.history.at(-1) ?? null);
      setValidation(null);
      setActiveMemoId(data.memos[0]?.id ?? null);
      setActiveTab(data.session.state.campaignStatus === "active" ? "decisions" : "after-action");
      setDialogueChiefId(null);
      setDialogueConversation(null);
      setDialogueStatus(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaign");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSession(id: string) {
    setAdminBusy("delete");
    setError(null);
    try {
      await fetchJson<{ ok: boolean }>(`${apiBase}/sessions/${id}`, { method: "DELETE" });
      if (session?.id === id) {
        setSession(null);
        setMemos([]);
        setSelections({});
        setPreview(null);
        setLatestResult(null);
        setValidation(null);
        setActiveMemoId(null);
        setActiveTab("decisions");
        setDialogueChiefId(null);
        setDialogueConversation(null);
        setDialogueStatus(null);
      }
      await refreshRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete campaign");
    } finally {
      setAdminBusy(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      setLoading(true);
      setError(null);
      try {
        const [scenarioResponse, recordsResponse] = await Promise.all([
          fetchJson<{ scenario: ScenarioSummary }>(`${apiBase}/scenario`),
          fetchJson<{ sessions: SessionSummary[] }>(`${apiBase}/sessions`),
        ]);
        if (cancelled) return;
        setScenario(scenarioResponse.scenario);
      setRecords(recordsResponse.sessions);
      setDialogueStatus(null);
      setDialogueConversation(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load startup state");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session || !hasPreviewInput) {
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
  }, [hasPreviewInput, memos, selections, session]);

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
      setDialogueChiefId(null);
      setDialogueConversation(null);
      setDialogueStatus(null);
      await refreshRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve month");
    } finally {
      setSaving(false);
    }
  }

  async function exportCurrentCampaign() {
    if (!session) return;
    setAdminBusy("export");
    setError(null);
    try {
      const payload = await fetchJson<SessionExport>(`${apiBase}/sessions/${session.id}/export`);
      downloadJson(`brass-ledger-${session.id}.json`, payload);
      setAdminStatus("Campaign export downloaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export campaign");
    } finally {
      setAdminBusy(null);
    }
  }

  async function copyCurrentExport() {
    if (!session) return;
    setAdminBusy("export");
    setError(null);
    try {
      const payload = await fetchJson<SessionExport>(`${apiBase}/sessions/${session.id}/export`);
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setAdminStatus("Campaign export copied to clipboard.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to copy export");
    } finally {
      setAdminBusy(null);
    }
  }

  async function importCampaign() {
    setAdminBusy("import");
    setError(null);
    try {
      const parsed = JSON.parse(importPayload);
      const data = await fetchJson<SessionEnvelope>(`${apiBase}/sessions/import`, {
        method: "POST",
        body: JSON.stringify({ exportData: parsed }),
      });
      setSession(data.session);
      setMemos(data.memos);
      setSelections({});
      setPreview(null);
      setLatestResult(data.session.history.at(-1) ?? null);
      setValidation(null);
      setActiveMemoId(data.memos[0]?.id ?? null);
      setActiveTab(data.session.state.campaignStatus === "active" ? "decisions" : "after-action");
      setDialogueChiefId(null);
      setDialogueConversation(null);
      setDialogueStatus(null);
      setImportPayload("");
      await refreshRecords();
      setAdminStatus("Campaign imported successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import campaign");
    } finally {
      setAdminBusy(null);
    }
  }

  async function validateCurrentCampaign() {
    if (!session) return;
    setAdminBusy("validate");
    setError(null);
    try {
      const data = await fetchJson<{ session: GameSession; validation: { ok: boolean; diffs: Array<{ path: string }> } }>(
        `${apiBase}/sessions/${session.id}/replay`,
      );
      setValidation(data.validation);
      setAdminStatus(data.validation.ok ? "Replay validation is clean." : "Replay validation found differences.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate replay");
    } finally {
      setAdminBusy(null);
    }
  }

  async function respondToChief(responseId: string) {
    if (!session || !dialogueChiefId || !dialogueConversation) return;
    setDialogueBusy(responseId);
    setDialogueStatus(null);
    setError(null);
    try {
      const data = await fetchJson<ChiefConversationResponsePayload>(`${apiBase}/sessions/${session.id}/chiefs/${dialogueChiefId}/respond`, {
        method: "POST",
        body: JSON.stringify({ responseId }),
      });
      setSession(data.session);
      setMemos(data.memos);
      setDialogueConversation(data.conversation);
      if (data.response) {
        setDialogueStatus(`${data.response.label}: ${data.response.relationshipEffect}.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update chief relationship";
      setDialogueStatus(message);
      setError(message);
    } finally {
      setDialogueBusy(null);
    }
  }

  async function openChiefChannel(chiefId: string) {
    setDialogueChiefId(chiefId);
    setDialogueStatus(null);
    setDialogueConversation(null);
    if (!session || !activeMemo || !selectedOption) {
      return;
    }
    setDialogueBusy(`open:${chiefId}`);
    setError(null);
    try {
      const data = await fetchJson<ChiefConversationOpenPayload>(`${apiBase}/sessions/${session.id}/chiefs/${chiefId}/conversation/open`, {
        method: "POST",
        body: JSON.stringify({
          memoId: activeMemo.id,
          optionId: selectedOption.id,
        }),
      });
      setSession(data.session);
      setMemos(data.memos);
      setDialogueConversation(data.conversation);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to open chief channel";
      setDialogueStatus(message);
      setError(message);
    } finally {
      setDialogueBusy(null);
    }
  }

  if (loading || !scenario || !session) {
    if (loading || !scenario) {
      return <div className="min-h-screen bg-[#0b1317] p-8 text-slate-100">Loading Brass Ledger...</div>;
    }

    return (
      <div className="min-h-screen bg-[#0b1317] text-slate-100">
        <header className="border-b border-white/10 bg-[#0f171b]">
          <div className="mx-auto max-w-[1600px] px-6 py-5">
            <div className="text-sm text-slate-500">Joint headquarters command desk</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">Brass Ledger</h1>
            <div className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{scenario.description}</div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1600px] gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <main className="border border-white/10 bg-[#10191d] px-6 py-6">
            {error && <div className="mb-4 border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
            {adminStatus && <div className="mb-4 border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-100">{adminStatus}</div>}
            <div className="text-sm font-medium text-slate-100">Startup</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">Start or resume the campaign.</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Each month is a command meeting. Read the brief, choose the memos, inspect the forecast, issue guidance, and then read the after action.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <button
                className="border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-left text-sm text-emerald-100 hover:bg-emerald-500/15"
                onClick={() => void startNewCampaign()}
              >
                <div className="font-medium">Start new campaign</div>
                <div className="mt-1 text-slate-400">Begin a fresh monthly run from turn one.</div>
              </button>
              <button
                className="border border-white/15 px-4 py-4 text-left text-sm text-slate-200 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:text-slate-500"
                disabled={!latestActiveRecord}
                onClick={() => latestActiveRecord && void loadSession(latestActiveRecord.id)}
              >
                <div className="font-medium">Resume active campaign</div>
                <div className="mt-1 text-slate-400">
                  {latestActiveRecord ? `${latestActiveRecord.summary} · ${latestActiveRecord.turn}/${latestActiveRecord.maxTurns}` : "No active campaign is saved right now."}
                </div>
              </button>
              <button
                className="border border-white/15 px-4 py-4 text-left text-sm text-slate-200 hover:bg-white/[0.04]"
                onClick={() => document.getElementById("startup-import")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                <div className="font-medium">Import campaign</div>
                <div className="mt-1 text-slate-400">Paste an exported save and reopen it on this desk.</div>
              </button>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <section className="border border-white/10 px-5 py-5">
                <div className="text-sm font-medium text-slate-100">Workflow</div>
                <div className="mt-4 grid gap-3">
                  {workflowSteps.slice(0, 6).map((step) => (
                    <div key={step.id} className={`border-l pl-3 ${step.id === "entry" ? "border-emerald-400/80" : "border-white/10"}`}>
                      <div className="text-sm font-medium text-slate-100">{step.label}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-400">{step.detail}</div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="border border-white/10 px-5 py-5">
                <div className="text-sm font-medium text-slate-100">Latest save</div>
                <div className="mt-3 text-sm text-slate-400">
                  {latestRecord
                    ? `${latestRecord.summary} · ${latestRecord.campaignStatus} · score ${latestRecord.campaignScore}`
                    : "No campaigns are saved yet."}
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-300">
                  {records.slice(0, 4).map((entry) => (
                    <button
                      key={entry.id}
                      className="border border-white/10 px-4 py-3 text-left hover:bg-white/[0.03]"
                      onClick={() => void loadSession(entry.id)}
                    >
                      <div className="font-medium text-slate-100">{entry.summary}</div>
                      <div className="mt-1 text-slate-400">
                        {entry.turn}/{entry.maxTurns} · {entry.campaignStatus} · score {entry.campaignScore}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <section id="startup-import" className="mt-8 border border-white/10 px-5 py-5">
              <div className="text-sm font-medium text-slate-100">Import command file</div>
              <div className="mt-2 text-sm leading-6 text-slate-400">
                Paste a previously exported Brass Ledger save below to reopen the campaign on this machine.
              </div>
              <textarea
                className="mt-4 min-h-[160px] w-full border border-white/10 bg-[#0d1519] px-4 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-600"
                placeholder='Paste a {"exportedAt": "...", "session": {...}} payload here.'
                value={importPayload}
                onChange={(event) => setImportPayload(event.target.value)}
              />
              <div className="mt-4 flex justify-end">
                <button
                  className="border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:text-slate-500"
                  disabled={!importPayload.trim() || adminBusy === "import"}
                  onClick={() => void importCampaign()}
                >
                  {adminBusy === "import" ? "Importing..." : "Import campaign"}
                </button>
              </div>
            </section>
          </main>

          <aside className="border border-white/10 bg-[#0d1519] px-5 py-5">
            <div className="text-sm font-medium text-slate-100">Scenario</div>
            <div className="mt-3 text-sm leading-6 text-slate-300">{scenario.description}</div>
            <div className="mt-5">
              <PlaceholderScene
                title="Theater command picture"
                subtitle={scenario.title}
                directorate="operations"
                emphasis="The room has to build credible posture without letting the headquarters outrun its sustainment, reserves, and political cover."
              />
            </div>
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="text-sm font-medium text-slate-100">What the player does</div>
              <div className="mt-3 grid gap-2 text-sm text-slate-400">
                <div>Read the monthly brief.</div>
                <div>Choose the memo options the staff can absorb.</div>
                <div>Inspect the forecast and chiefs’ objections.</div>
                <div>Issue guidance and read the after action.</div>
              </div>
            </div>
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="text-sm font-medium text-slate-100">Available saves</div>
              <div className="mt-3 text-sm text-slate-400">{records.length} campaign save{records.length === 1 ? "" : "s"} found.</div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  const activeBurden = currentResult?.directorateBurden ?? [];
  const activeEstimate: MonthlyEstimate | null = currentResult?.monthlyEstimate ?? null;
  const campaignEnded = session.state.campaignStatus !== "active";

  return (
    <div className="min-h-screen bg-[#0b1317] text-slate-100">
      <header className="border-b border-white/10 bg-[#0f171b]">
        <div className="mx-auto max-w-[1600px] px-6 py-5">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-sm text-slate-500">Joint headquarters command desk</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">Brass Ledger</h1>
              <div className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{scenario.description}</div>
            </div>
            <div className="min-w-[240px] text-right">
              <div className="text-sm text-slate-300">{session.state.briefing.monthLabel}</div>
              <div className="mt-1 text-lg font-medium text-slate-100">{session.state.briefing.theater}</div>
              <div className="mt-2 text-sm text-slate-500">{session.state.briefing.riskPosture}</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-px border border-white/10 bg-white/10 lg:grid-cols-6">
            {metricBriefs.map((metric) => (
              <button
                key={metric.key}
                className="relative overflow-visible bg-[#0f171b] px-4 py-4 text-left transition-colors hover:bg-[#121d22]"
                style={{ boxShadow: `inset 0 3px 0 ${metricAccent(metric.key)}` }}
                onMouseEnter={() => setHoveredMetric(metric.key)}
                onMouseLeave={() => setHoveredMetric((current) => (current === metric.key ? null : current))}
                onFocus={() => setHoveredMetric(metric.key)}
                onBlur={() => setHoveredMetric((current) => (current === metric.key ? null : current))}
                aria-describedby={hoveredMetric === metric.key ? `metric-tooltip-${metric.key}` : undefined}
                title={metric.detailLines.join("\n")}
              >
                <div className="text-sm text-slate-500">{metric.label}</div>
                <div className="mt-2 text-xl font-semibold text-slate-100">{metric.headline}</div>
                <div className={`mt-1 text-sm ${metricTone(metric.status)}`}>{metric.status}</div>
                {hoveredMetric === metric.key && (
                  <div id={`metric-tooltip-${metric.key}`} role="tooltip" className="pointer-events-none absolute left-0 top-[calc(100%+8px)] z-20 w-[320px] border border-white/10 bg-[#0c1418] px-4 py-3 text-sm text-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                    <div className="font-medium text-slate-100">{metric.detailTitle}</div>
                    <div className="mt-2 grid gap-1">
                      {metric.detailLines.map((line) => <div key={line}>{line}</div>)}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-6 py-6">
        {error && <div className="mb-4 border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
        {adminStatus && <div className="mb-4 border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-100">{adminStatus}</div>}

        <div className="grid gap-0 overflow-hidden border border-white/10 bg-[#0f171b] xl:grid-cols-[300px_minmax(0,1fr)_360px]">
          <aside className="border-b border-white/10 bg-[#0d1519] px-4 py-5 xl:sticky xl:top-6 xl:self-start xl:border-b-0 xl:border-r">
            <div className="text-sm font-medium text-slate-100">Workspace</div>
            <div className="mt-1 text-sm text-slate-500">One window for the monthly headquarters cycle.</div>

            <div className="mt-5 border border-white/10 bg-[#10191d] px-4 py-4">
              <div className="text-sm font-medium text-slate-100">Workflow</div>
              <div className="mt-2 text-xs text-slate-500">{activeWorkflow.label}</div>
              <div className="mt-1 text-sm leading-6 text-slate-300">{activeWorkflow.detail}</div>
              <div className="mt-4 grid gap-2">
                {workflowSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`border-l pl-3 text-sm ${
                      step.id === activeWorkflow.id ? "border-emerald-400/80 text-slate-100" : "border-white/10 text-slate-500"
                    }`}
                  >
                    <div className="font-medium">{step.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-2" role="tablist" aria-label="Workspace sections">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  className={`border px-4 py-3 text-left transition-colors ${activeTab === tab.id ? "border-white/20 bg-[#141d22] text-slate-100" : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.03]"}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className="text-sm font-medium">{tab.label}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">{tab.summary}</div>
                </button>
              ))}
            </div>

            {activeTab === "decisions" && !campaignEnded && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="text-sm font-medium text-slate-100">Monthly agenda</div>
                <div className="mt-3 grid gap-2">
                  {memos.map((memo) => (
                    <button
                      key={memo.id}
                      className={`border px-4 py-3 text-left transition-colors ${activeMemo?.id === memo.id ? "border-white/20 bg-[#141d22] text-slate-100" : "border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/[0.03]"}`}
                      onClick={() => setActiveMemoId(memo.id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium">{memo.title}</div>
                        <div className="text-xs text-slate-500">{memo.optional ? "Optional" : "Required"}</div>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{memo.category}</div>
                      <div className="mt-2 text-xs leading-5 text-slate-500">
                        {selections[memo.id] ? "Direction selected" : "Awaiting commander guidance"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {campaignEnded && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="text-sm font-medium text-slate-100">Campaign complete</div>
                <div className="mt-2 text-sm leading-6 text-slate-400">
                  The current save is finished. Start a new campaign or review the records archive.
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="text-sm font-medium text-slate-100">Campaign objectives</div>
              <div className="mt-3 grid gap-3 text-sm">
                {session.state.briefing.campaignObjectives.map((objective) => {
                  const snapshot = objectiveSnapshot(session, objective);
                  return (
                    <div key={objective.id} className={`border-l pl-3 ${snapshot.met ? "border-emerald-400/70" : "border-white/10"}`}>
                      <div className="font-medium text-slate-100">{objective.label}</div>
                      <div className="mt-1 text-slate-400">{objective.note}</div>
                      <div className={`mt-2 text-xs ${snapshot.met ? "text-emerald-200" : "text-slate-500"}`}>
                        {snapshot.currentLabel} against {snapshot.targetLabel}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="text-sm font-medium text-slate-100">Decision status</div>
              <div className="mt-3 text-sm text-slate-300">
                {campaignEnded ? "No more guidance can be issued for this campaign." : decisionStatusCopy(completedMemoCount, requiredMemoCount)}
              </div>
              <div className="mt-2 text-sm text-slate-500">{session.state.briefing.commandersIntent}</div>
            </div>

            <div className="mt-6 grid gap-2 border-t border-white/10 pt-4">
              <button className="border border-white/15 px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/[0.04]" onClick={() => void startNewCampaign()}>
                Start new campaign
              </button>
              <button className="border border-white/15 px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/[0.04]" onClick={() => void refreshRecords()}>
                Refresh records
              </button>
              <button
                className="border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-left text-sm text-emerald-100 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-black/10 disabled:text-slate-500"
                disabled={campaignEnded || !readyToPreview || saving}
                onClick={() => void commitMonth()}
              >
                {saving ? "Issuing guidance..." : campaignEnded ? "Campaign complete" : "Commit month"}
              </button>
            </div>
          </aside>

          <main className="min-w-0 border-b border-white/10 bg-[#10191d] px-5 py-5 xl:border-b-0 xl:border-r">
            {activeTab === "decisions" && (
              <div id="panel-decisions" role="tabpanel" aria-labelledby="tab-decisions" className="grid gap-5">
                {campaignEnded && (
                  <section className="border border-amber-500/20 bg-amber-500/10 px-5 py-4">
                    <div className="text-sm font-medium text-amber-100">Campaign complete</div>
                    <div className="mt-2 text-sm leading-6 text-amber-50/90">
                      {session.state.campaignOutcome ?? "This campaign has ended."} Open Records to inspect the save or start a fresh run.
                    </div>
                  </section>
                )}

                <section className="border-b border-white/10 pb-5">
                  <div className="text-sm font-medium text-slate-100">Situation brief</div>
                  <div className="mt-3 text-base leading-7 text-slate-200">{session.state.briefing.situationSummary}</div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <div className="border-l border-white/10 pl-4">
                      <div className="text-sm font-medium text-slate-100">Operational picture</div>
                      <div className="mt-2 text-sm leading-6 text-slate-400">{session.state.briefing.operationalPicture}</div>
                    </div>
                    <div className="border-l border-white/10 pl-4">
                      <div className="text-sm font-medium text-slate-100">Decision focus</div>
                      <div className="mt-2 text-sm leading-6 text-slate-400">{session.state.briefing.decisionFocus}</div>
                    </div>
                    <div className="border-l border-white/10 pl-4">
                      <div className="text-sm font-medium text-slate-100">Political frame</div>
                      <div className="mt-2 text-sm leading-6 text-slate-400">{session.state.briefing.geopoliticalSummary}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-400">
                    {session.state.briefing.openQuestions.map((question) => <div key={question}>{question}</div>)}
                  </div>
                </section>

                {roomPulse && activeMemo && (
                  <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_320px]">
                    <div className="border border-white/10 bg-[#0d1519] px-5 py-5">
                      <div className="text-sm font-medium text-slate-100">Room pulse</div>
                      <div className="mt-3 text-lg font-semibold leading-8 text-slate-100">{roomPulse.title}</div>
                      <div className="mt-3 text-sm leading-6 text-slate-300">{roomPulse.summary}</div>
                      <div className="mt-4 grid gap-2 text-sm text-slate-400">
                        {roomPulse.bullets.map((bullet) => (
                          <div key={bullet} className="border-l border-white/10 pl-3">
                            {bullet}
                          </div>
                        ))}
                      </div>
                    </div>
                    <PlaceholderScene
                      title={directorateLabel(activeMemo.sponsorDirectorate)}
                      subtitle={activeMemo.title}
                      directorate={activeMemo.sponsorDirectorate}
                      emphasis={selectedOption ? selectedOption.label : "Select an option to brief the room."}
                    />
                  </section>
                )}

                {activeMemo && (
                  <section>
                    <div className="text-sm text-slate-500">{activeMemo.category}</div>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">{activeMemo.title}</h2>
                    <div className="mt-3 max-w-4xl text-base leading-7 text-slate-300">{activeMemo.issue}</div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <div className="text-sm font-medium text-slate-100">Why now</div>
                        <div className="mt-2 text-sm text-slate-300">{activeMemo.whyNow}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-100">Staff friction</div>
                        <div className="mt-2 text-sm text-slate-300">Sponsor: {directorateLabel(activeMemo.sponsorDirectorate)}. Principal objector: {directorateLabel(activeMemo.objectorDirectorate)}.</div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 lg:grid-cols-2">
                      <div>
                        <div className="text-sm font-medium text-slate-100">Assumptions</div>
                        <div className="mt-2 grid gap-2 text-sm text-slate-400">
                          {activeMemo.assumptions.map((entry) => <div key={entry}>{entry}</div>)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-100">Known unknowns</div>
                        <div className="mt-2 grid gap-2 text-sm text-slate-400">
                          {activeMemo.knownUnknowns.map((entry) => <div key={entry}>{entry}</div>)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-5">
                      <div className="text-sm font-medium text-slate-100">Courses of action</div>
                      <div className="mt-2 text-sm leading-6 text-slate-400">
                        Each packet below is a distinct course of action. Read the brief, note who carries the staff burden, and then table the one the headquarters can actually absorb.
                      </div>
                      <div className="mt-4 grid gap-4">
                      {activeMemo.options.map((option) => {
                        const selected = selections[activeMemo.id] === option.id;
                        const brief = buildOptionBrief(activeMemo, option);
                        return (
                          <label
                            key={option.id}
                            className={`block border px-5 py-5 transition-colors ${selected ? "border-emerald-500/30 bg-emerald-500/8" : "border-white/10 bg-[#0d1519] hover:border-white/20 hover:bg-white/[0.02]"}`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="text-xs tracking-[0.06em] text-slate-500">Course of action</div>
                                <div className="mt-2 text-lg font-semibold text-slate-100">{option.label}</div>
                                <div className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{brief.commandBrief}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-xs text-slate-500">{selected ? "Tabled for guidance" : "Not selected"}</div>
                                <input
                                  className="mt-0"
                                  type="radio"
                                  checked={selected}
                                  name={activeMemo.id}
                                  disabled={campaignEnded}
                                  onChange={() => setSelections((current) => ({ ...current, [activeMemo.id]: option.id }))}
                                />
                              </div>
                            </div>

                            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_320px]">
                              <div className="grid gap-4">
                                <div className="border-l border-white/10 pl-4">
                                  <div className="text-sm font-medium text-slate-100">Why choose it</div>
                                  <div className="mt-2 text-sm leading-6 text-slate-400">{brief.likelyUpside}</div>
                                </div>
                                <div className="border-l border-white/10 pl-4">
                                  <div className="text-sm font-medium text-slate-100">Best used when</div>
                                  <div className="mt-2 text-sm leading-6 text-slate-400">{brief.bestUsed}</div>
                                </div>
                                <div className="border-l border-white/10 pl-4">
                                  <div className="text-sm font-medium text-slate-100">Watch for</div>
                                  <div className="mt-2 text-sm leading-6 text-slate-400">{brief.watchFor}</div>
                                </div>
                              </div>
                              <div className="border border-white/10 bg-[#10191d] px-4 py-4">
                                <div className="text-sm font-medium text-slate-100">Staff and signal brief</div>
                                <div className="mt-3 text-sm leading-6 text-slate-400">{brief.likelySignal}</div>
                                <div className="mt-4 text-xs font-medium tracking-[0.06em] text-slate-500">Staff pull</div>
                                <div className="mt-2 grid gap-2 text-sm text-slate-300">
                                  {option.burden.map((entry) => (
                                    <div key={`${option.id}-${entry.directorate}`} className="flex items-center justify-between gap-3">
                                      <span>{directorateLabel(entry.directorate)}</span>
                                      <span className="text-slate-500">{entry.points} load</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                      </div>
                    </div>
                  </section>
                )}
              </div>
            )}

            {activeTab === "chiefs" && (
              <div id="panel-chiefs" role="tabpanel" aria-labelledby="tab-chiefs" className="grid gap-5">
                <section className="border-b border-white/10 pb-5">
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_320px]">
                    <div>
                      <div className="text-sm font-medium text-slate-100">Chiefs paper</div>
                      <div className="mt-2 text-xl font-semibold text-slate-100">{activeEstimate?.chiefsPaperTitle ?? "Chiefs Paper"}</div>
                      <div className="mt-3 max-w-4xl text-base leading-7 text-slate-300">{activeEstimate?.chiefsPaperSummary ?? "Select decisions across the month to see where the chiefs think the headquarters is drifting."}</div>
                      <div className="mt-4 grid gap-2 text-sm text-slate-400">
                        {(activeEstimate?.chiefsPaperBullets ?? []).map((entry) => <div key={entry}>{entry}</div>)}
                      </div>
                      {activeEstimate?.uncertainty && <div className="mt-4 text-sm text-slate-500">{activeEstimate.uncertainty}</div>}
                      {activeEstimate?.commandersEstimate && <div className="mt-4 border-t border-white/10 pt-4 text-sm leading-6 text-slate-300">{activeEstimate.commandersEstimate}</div>}
                    </div>
                    <PlaceholderScene
                      title="Chiefs estimate"
                      subtitle={activeEstimate?.chiefsPaperTitle ?? "The room has not settled yet"}
                      directorate={activeMemo?.sponsorDirectorate ?? "plans"}
                      emphasis={activeEstimate?.commandersEstimate ?? "Once the month is tabled, the chiefs will converge on a rough estimate of where the headquarters is really drifting."}
                    />
                  </div>
                </section>

                <section>
                  <div className="text-sm font-medium text-slate-100">Chiefs</div>
                  <div className="mt-4 grid gap-3">
                    {scenario.chiefs.map((chief) => (
                      (() => {
                        const chiefView = advisorDisplay(chief.id, scenario, session);
                        const trust = session?.state.chiefTrust[chief.id] ?? 50;
                        return (
                          <div
                            key={chief.id}
                            className="grid gap-4 border-b border-white/10 px-1 py-4 md:grid-cols-[220px_minmax(0,1fr)]"
                            style={{ borderColor: directorateTheme(chief.directorate).line }}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className="advisor-portrait"
                                style={{
                                  background: `linear-gradient(135deg, ${directorateTheme(chief.directorate).wash}, rgba(12, 20, 24, 0.92))`,
                                  borderColor: directorateTheme(chief.directorate).line,
                                  color: directorateTheme(chief.directorate).accent,
                                }}
                              >
                                {chiefView.portraitSrc ? (
                                  <img className="advisor-portrait__image" src={chiefView.portraitSrc} alt={`${chiefView.displayName} portrait`} />
                                ) : (
                                  <span>{chiefInitials(chief.name)}</span>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-slate-100">{chiefView.displayName}</div>
                                <div className="mt-1 text-sm text-slate-400">{chiefView.title} | {directorateLabel(chief.directorate)}</div>
                                <div className="mt-2 text-xs text-slate-500">Working relationship: {relationshipLabel(trust)}</div>
                                <button
                                  className="mt-3 border px-3 py-1 text-xs hover:bg-white/[0.04]"
                                  style={{ borderColor: directorateTheme(chief.directorate).line, color: directorateTheme(chief.directorate).accent }}
                                  onClick={() => void openChiefChannel(chief.id)}
                                >
                                  Open channel
                                </button>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-slate-500">{chief.temperament}</div>
                              <div className="mt-2 text-sm leading-6 text-slate-300">{chief.doctrineBias}</div>
                            </div>
                          </div>
                        );
                      })()
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "after-action" && (
              <div id="panel-after-action" role="tabpanel" aria-labelledby="tab-after-action" className="grid gap-5">
                <section className="border-b border-white/10 pb-5">
                  <div className="text-sm font-medium text-slate-100">After action</div>
                  <div className="mt-3 text-xl font-semibold text-slate-100">{latestResult?.summary ?? "No month has been committed yet."}</div>
                </section>

                {latestResult && (
                  <>
                    {campaignEnded && (
                      <section className="border border-white/10 bg-[#0d1519] px-5 py-5">
                        <div className="text-sm font-medium text-slate-100">Campaign complete</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-100">{session.state.campaignOutcome}</div>
                        <div className="mt-3 text-sm text-slate-400">Score {session.state.campaignScore}/100. The completed save remains in Records.</div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button className="border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-500/15" onClick={() => void startNewCampaign()}>
                            Start new campaign
                          </button>
                          <button className="border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/[0.04]" onClick={() => setActiveTab("records")}>
                            Open records
                          </button>
                          <button className="border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/[0.04]" onClick={() => void exportCurrentCampaign()}>
                            Export save
                          </button>
                        </div>
                      </section>
                    )}

                    <section>
                      <div className="text-sm font-medium text-slate-100">Outcome ledger</div>
                      <div className="mt-4 divide-y divide-white/10 border border-white/10">
                        {latestResult.afterAction.map((entry) => (
                          <div key={entry.heading} className="px-4 py-4">
                            <div className="font-medium text-slate-100">{entry.heading}</div>
                            <div className="mt-2 text-sm leading-6 text-slate-300">{entry.detail}</div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <div className="text-sm font-medium text-slate-100">Objective review</div>
                      <div className="mt-4 grid gap-2">
                        {session.state.briefing.campaignObjectives.map((objective) => {
                          const snapshot = objectiveSnapshot(session, objective);
                          return (
                            <div key={objective.id} className="border border-white/10 px-4 py-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-medium text-slate-100">{objective.label}</div>
                                <div className={`text-xs ${snapshot.met ? "text-emerald-300" : "text-amber-200"}`}>{snapshot.met ? "met" : "open"}</div>
                              </div>
                              <div className="mt-2 text-sm text-slate-400">{objective.note}</div>
                              <div className="mt-2 text-xs text-slate-500">
                                Current {snapshot.currentLabel} · Target {snapshot.targetLabel}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    <section>
                      <div className="text-sm font-medium text-slate-100">Triggered events</div>
                      <div className="mt-4 divide-y divide-white/10 border border-white/10">
                        {latestResult.triggeredEvents.length === 0 ? (
                          <div className="px-4 py-4 text-sm text-slate-400">No named event spike dominated the month.</div>
                        ) : latestResult.triggeredEvents.map((event) => (
                          <div key={event.id} className="px-4 py-4">
                            <div className="font-medium text-slate-100">{event.title}</div>
                            <div className="mt-2 text-sm leading-6 text-slate-300">{event.summary}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                )}
              </div>
            )}

            {activeTab === "records" && (
              <div id="panel-records" role="tabpanel" aria-labelledby="tab-records">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <section>
                    <div className="text-sm font-medium text-slate-100">Saved campaigns</div>
                    <div className="mt-4 overflow-x-auto border border-white/10">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="border-b border-white/10 text-xs text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Campaign</th>
                        <th className="px-4 py-3 font-medium">Turn</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Outcome</th>
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
                          <td className="px-4 py-3 text-slate-300">{entry.campaignOutcome ?? "—"}</td>
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
                  </section>

                  <aside className="border border-white/10 bg-[#0d1519] px-4 py-4">
                    <div className="text-sm font-medium text-slate-100">Records admin</div>
                    <div className="mt-3 grid gap-2">
                      <button className="border border-white/15 px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:text-slate-500" disabled={!session || adminBusy === "export"} onClick={() => void exportCurrentCampaign()}>
                        Export current save
                      </button>
                      <button className="border border-white/15 px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:text-slate-500" disabled={!session || adminBusy === "export"} onClick={() => void copyCurrentExport()}>
                        Copy export JSON
                      </button>
                      <button className="border border-white/15 px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:text-slate-500" disabled={!session || adminBusy === "validate"} onClick={() => void validateCurrentCampaign()}>
                        Check replay integrity
                      </button>
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-4">
                      <div className="text-sm font-medium text-slate-100">Import save</div>
                      <textarea
                        className="mt-3 min-h-32 w-full border border-white/10 bg-[#10191d] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500"
                        placeholder="Paste a Brass Ledger export JSON here."
                        value={importPayload}
                        onChange={(event) => setImportPayload(event.target.value)}
                      />
                      <button
                        className="mt-3 w-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-black/10 disabled:text-slate-500"
                        disabled={!importPayload.trim() || adminBusy === "import"}
                        onClick={() => void importCampaign()}
                      >
                        {adminBusy === "import" ? "Importing..." : "Import campaign"}
                      </button>
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-4 text-sm text-slate-400">
                      {adminStatus ?? "Admin tools stay out of the main desk. Use them for save management and validation."}
                    </div>

                    {validation && (
                      <div className="mt-4 border border-white/10 px-3 py-3 text-xs text-slate-400">
                        <div className="font-medium text-slate-100">{validation.ok ? "Replay integrity: clean" : "Replay integrity: differences found"}</div>
                        <div className="mt-1">{validation.ok ? "The session replays cleanly from the current save." : `${validation.diffs.length} difference(s) detected.`}</div>
                      </div>
                    )}
                  </aside>
                </div>
              </div>
            )}
          </main>

          <aside className="bg-[#0d1519] px-5 py-5 xl:sticky xl:top-6 xl:self-start">
            {activeTab === "records" ? (
              <div className="grid gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-100">Records</div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">
                    Manage saves, import exports, and verify replay integrity without leaving the command desk.
                  </div>
                </div>
                <div className="border border-white/10 px-4 py-4">
                  <div className="text-sm font-medium text-slate-100">Current save</div>
                  <div className="mt-2 text-sm text-slate-400">
                    {session.state.campaignStatus === "active" ? "Active campaign" : "Campaign complete"}
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    {session.state.briefing.monthLabel} · score {session.state.campaignScore}
                  </div>
                </div>
                <div className="border border-white/10 px-4 py-4">
                  <div className="text-sm font-medium text-slate-100">Replay check</div>
                  <div className="mt-2 text-sm text-slate-400">
                    {validation ? (validation.ok ? "Validated cleanly." : "Replay differences were detected.") : "Run a replay check from the records panel."}
                  </div>
                  <button
                    className="mt-3 w-full border border-white/15 px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:text-slate-500"
                    disabled={!session || adminBusy === "validate"}
                    onClick={() => void validateCurrentCampaign()}
                  >
                    {adminBusy === "validate" ? "Checking..." : "Check replay integrity"}
                  </button>
                </div>
                <div className="border border-white/10 px-4 py-4">
                  <div className="text-sm font-medium text-slate-100">Import / export</div>
                  <div className="mt-2 grid gap-2">
                    <button className="border border-white/15 px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/[0.04]" onClick={() => void exportCurrentCampaign()}>
                      Download export
                    </button>
                    <button className="border border-white/15 px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/[0.04]" onClick={() => void copyCurrentExport()}>
                      Copy export JSON
                    </button>
                  </div>
                </div>
                <button className="border border-white/15 px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/[0.04]" onClick={() => void refreshRecords()}>
                  Refresh records
                </button>
              </div>
            ) : activeTab === "after-action" ? (
              <div className="grid gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-100">Status</div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">
                    {campaignEnded ? "The campaign is finished. Use Records for save management or start another run." : "The latest month has resolved and the desk is ready for the next briefing."}
                  </div>
                </div>
                <div className="border border-white/10 px-4 py-4">
                  <div className="text-sm font-medium text-slate-100">Campaign score</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-100">{session.state.campaignScore}</div>
                  <div className="mt-2 text-sm text-slate-400">{session.state.campaignOutcome ?? "No campaign outcome yet."}</div>
                </div>
                <div className="border border-white/10 px-4 py-4">
                  <div className="text-sm font-medium text-slate-100">Next step</div>
                  <div className="mt-2 text-sm text-slate-400">
                    {campaignEnded ? "Start a new campaign or inspect the archive." : "Return to Decisions to read the next month’s brief."}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!campaignEnded && (
                      <button className="border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/[0.04]" onClick={() => setActiveTab("decisions")}>
                        Back to decisions
                      </button>
                    )}
                    <button className="border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/[0.04]" onClick={() => setActiveTab("records")}>
                      Open records
                    </button>
                    <button className="border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-500/15" onClick={() => void startNewCampaign()}>
                      New campaign
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === "chiefs" ? (
              <div className="grid gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-100">Chiefs view</div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">
                    The chiefs paper is where the room settles into a shared but still uncertain estimate.
                  </div>
                </div>
                {activeEstimate ? (
                  <div className="border border-white/10 px-4 py-4">
                    <div className="text-sm font-medium text-slate-100">{activeEstimate.chiefsPaperTitle}</div>
                    <div className="mt-2 text-sm text-slate-400">{activeEstimate.chiefsPaperSummary}</div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-500">
                      {activeEstimate.chiefsPaperBullets.map((bullet) => (
                        <div key={bullet}>{bullet}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-400">Select and commit a month to generate the chiefs paper.</div>
                )}
                <div className="border border-white/10 px-4 py-4">
                  <div className="text-sm font-medium text-slate-100">Turn transitions</div>
                  <div className="mt-2 grid gap-2 text-sm text-slate-400">
                    <div>Read Decisions to table guidance.</div>
                    <div>Read After Action once the month is committed.</div>
                    <div>Use Records when you need archive or admin work.</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                <div className="text-sm font-medium text-slate-100">Inspector</div>
                {!activeMemo || !selectedOption ? (
                  <div className="mt-3 text-sm text-slate-400">Select an option in the active memo to inspect the chiefs’ positions and execution risk.</div>
                ) : (
                  <div className="mt-4 grid gap-3">
                    <div className="border-b border-white/10 pb-3">
                      <div className="text-sm font-medium text-slate-100">{selectedOption.label}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-400">{selectedOption.summary}</div>
                    </div>
                    {currentPositions.map((entry) => (
                      (() => {
                        const chiefView = advisorDisplay(entry.chiefId, scenario, session);
                        const trust = session?.state.chiefTrust[entry.chiefId] ?? 50;
                        return (
                          <div key={`${entry.chiefId}-${entry.memoId}-${entry.optionId}`} className={`border px-4 py-4 ${positionTone(entry.position)}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className="advisor-portrait"
                                  style={{
                                    width: "44px",
                                    height: "44px",
                                    flexBasis: "44px",
                                    borderRadius: "10px",
                                  }}
                                >
                                  {chiefView.portraitSrc ? (
                                    <img className="advisor-portrait__image" src={chiefView.portraitSrc} alt={`${chiefView.displayName} portrait`} />
                                  ) : (
                                    <span>{chiefInitials(chiefView.displayName)}</span>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-100">{chiefView.displayName}</div>
                                  <div className="mt-1 text-xs text-slate-500">{chiefView.title}</div>
                                  <div className="mt-1 text-[11px] text-slate-500">Relationship: {relationshipLabel(trust)}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-slate-400">{entry.position.replace("_", " ")}</div>
                                <button
                                  className="border border-white/10 px-2 py-1 text-[11px] text-slate-200 hover:bg-white/[0.05]"
                                  onClick={() => void openChiefChannel(entry.chiefId)}
                                >
                                  Talk
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-slate-300">{entry.institutionalReason}</div>
                            <div className="mt-3 text-xs text-slate-400">Condition: {entry.requiredCondition}</div>
                            <div className="mt-1 text-xs text-slate-500">{entry.confidenceNote}</div>
                            <div className="mt-2 text-xs text-slate-400">If ignored: {entry.consequenceIfIgnored}</div>
                          </div>
                        );
                      })()
                    ))}
                  </div>
                )}

                <div className="mt-6 border-t border-white/10 pt-4">
                  <div className="text-sm font-medium text-slate-100">Directorate burden</div>
                  <div className="mt-4 grid gap-3">
                    {activeBurden.length === 0 ? (
                      <div className="text-sm text-slate-400">Complete the required memos to forecast burden and execution risk.</div>
                    ) : activeBurden.map((entry) => (
                      <div key={entry.directorate} className="border border-white/10 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium text-slate-100">{directorateLabel(entry.directorate)}</div>
                          <div className="text-xs text-slate-400">{entry.burdenLevel}</div>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-white/10">
                          <div className={`${entry.burdenLevel === "overloaded" ? "bg-rose-400/80" : entry.burdenLevel === "strained" ? "bg-amber-300/80" : "bg-emerald-300/80"} h-full`} style={{ width: burdenBarWidth(entry.burdenPoints, entry.capacity) }} />
                        </div>
                        <div className="mt-2 text-sm text-slate-400">{entry.summary}</div>
                        <div className="mt-2 text-xs text-slate-500">Failure mode: {entry.failureMode}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {preview && (
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="text-sm font-medium text-slate-100">Forecast</div>
                    <div className="mt-3 text-sm text-slate-300">{preview.projectedResult.summary}</div>
                    {!readyToPreview && (
                      <div className="mt-2 text-xs text-slate-500">Forecast is provisional until the remaining required memos are resolved.</div>
                    )}
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
              </div>
            )}
          </aside>
        </div>

        {dialogueChief && (
          <div className="dialogue-overlay">
            <div
              className="dialogue-panel"
              style={{
                borderColor: directorateTheme(dialogueChief.directorate).line,
                background: `linear-gradient(180deg, rgba(15, 23, 27, 0.99), rgba(11, 19, 23, 0.995))`,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="dialogue-panel__header">
                <div className="flex items-start gap-4">
                  <div
                    className="advisor-portrait advisor-portrait--large"
                    style={{
                      background: `linear-gradient(135deg, ${directorateTheme(dialogueChief.directorate).wash}, rgba(12, 20, 24, 0.92))`,
                      borderColor: directorateTheme(dialogueChief.directorate).line,
                      color: directorateTheme(dialogueChief.directorate).accent,
                    }}
                  >
                    {dialogueAdvisor?.portraitSrc ? (
                      <img className="advisor-portrait__image" src={dialogueAdvisor.portraitSrc} alt={`${dialogueAdvisor.displayName} portrait`} />
                    ) : (
                      <span>{chiefInitials(dialogueAdvisor?.displayName ?? dialogueChief.name)}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-100">{dialogueAdvisor?.displayName ?? dialogueChief.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{dialogueAdvisor?.title ?? dialogueChief.title} | {directorateLabel(dialogueChief.directorate)}</div>
                    <div className="mt-2 text-xs text-slate-500">Working relationship: {dialogueRelationship}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-300">
                      {dialoguePosition?.position ? `${formatPositionLabel(dialoguePosition.position)} on ${selectedOption?.label ?? activeMemo?.title ?? "the current packet"}` : dialogueChief.doctrineBias}
                    </div>
                  </div>
                </div>
                <button
                  className="border border-white/10 px-3 py-1 text-sm text-slate-200 hover:bg-white/[0.04]"
                  onClick={() => {
                    setDialogueChiefId(null);
                    setDialogueConversation(null);
                  }}
                >
                  Close
                </button>
              </div>

              <div className="dialogue-panel__body">
                <div className="dialogue-frontmatter">
                  <div className="dialogue-frontmatter__title">Secure line open</div>
                  <div className="dialogue-frontmatter__greeting">{dialogueGreeting}</div>
                  <div className="dialogue-frontmatter__grid">
                    {dialogueFrontMatter.map((entry) => (
                      <div key={entry.label} className="dialogue-frontmatter__item">
                        <div className="dialogue-frontmatter__label">{entry.label}</div>
                        <div className="dialogue-frontmatter__value">{entry.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="dialogue-frontmatter__note">
                    {dialogueConversation?.institutionalReason ?? dialoguePosition?.institutionalReason ?? dialogueChief.doctrineBias}
                  </div>
                </div>
                <div className="dialogue-thread">
                  {dialogueTurns.map((turn, index) => (
                    <div key={`${turn.speaker}-${index}`} className={`dialogue-bubble dialogue-bubble--${turn.role}`}>
                      <div className="dialogue-bubble__speaker">{turn.speaker}</div>
                      <div className="dialogue-bubble__text">{turn.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 px-5 py-4">
                {!activeMemo || !selectedOption ? (
                  <div className="text-sm text-slate-400">Select a course of action in Decisions to draw this chief onto a concrete packet and open a real discussion.</div>
                ) : dialogueBusy && !dialogueConversation ? (
                  <div className="text-sm text-slate-400">Opening secure channel...</div>
                ) : !dialogueConversation ? (
                  <div className="text-sm text-slate-400">Open the channel against a selected packet to begin the discussion.</div>
                ) : dialogueConversation.status === "completed" ? (
                  <div className="grid gap-2">
                    <div className="text-sm font-medium text-slate-100">Discussion concluded</div>
                    <div className="text-sm text-slate-400">
                      Net effect: {relationshipDeltaLabel(dialogueConversation.totalTrustDelta)}. Relationship now {relationshipLabel(dialogueConversation.trustAfter)}.
                    </div>
                    {dialogueStatus && <div className="text-sm text-emerald-200">{dialogueStatus}</div>}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-slate-100">Reply</div>
                        <div className="text-sm text-slate-400">
                          {(() => {
                            const stageMeta = chiefConversationStageMeta(dialogueConversation.stage);
                            return `Stage ${stageMeta.index} of ${stageMeta.total}: ${stageMeta.label}. How you answer this chief shapes working trust and later advice.`;
                          })()}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        Net shift {dialogueConversation.totalTrustDelta >= 0 ? "+" : ""}{dialogueConversation.totalTrustDelta}
                      </div>
                    </div>
                    <div className="dialogue-quick-replies">
                      {dialogueConversation.choices.map((choice) => (
                        <button
                          key={choice.id}
                          className="border border-white/10 bg-[#0d1519] px-4 py-3 text-left hover:border-white/20 hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dialogueBusy !== null}
                          onClick={() => void respondToChief(choice.id)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-medium text-slate-100">{choice.label}</div>
                              <div className="mt-1 text-sm leading-6 text-slate-400">{choice.summary}</div>
                            </div>
                            <div className="text-xs text-slate-500">{relationshipDeltaLabel(choice.trustDelta)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {dialogueStatus && <div className="text-sm text-emerald-200">{dialogueStatus}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
