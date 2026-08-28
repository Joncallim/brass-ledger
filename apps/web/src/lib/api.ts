import type {
  MemoSelection,
  StaffNegotiation,
  AcceptedRiskOverride,
  SessionExport,
  ScenarioSummary,
} from "@brass-ledger/shared";
import type {
  SessionEnvelope,
  SessionSummary,
  PreviewPayload,
  TurnCycleState,
} from "./types";

const BASE = "/api";

const OFFLINE_MESSAGE =
  "Cannot reach the Brass Ledger server. Check that it is still running, then try again.";

/**
 * Turns a thrown value into something worth showing a player. The server sends
 * an explanation of its own, so prefer that; only fall back to our own wording
 * when the request never got an answer at all.
 */
export function describeError(error: unknown, fallback: string) {
  if (error instanceof TypeError) return OFFLINE_MESSAGE;
  if (error instanceof Error && error.message.length > 0) return error.message;
  return fallback;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
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
    throw new Error((data as { error?: string }).error ?? `Request failed: ${response.status}`);
  }
  return data as T;
}

export function listSessions() {
  return fetchJson<{ sessions: SessionSummary[] }>(`${BASE}/sessions`);
}

export function listScenarios() {
  return fetchJson<{ scenarios: ScenarioSummary[] }>(`${BASE}/scenarios`);
}

export function createSession(options: { scenarioId?: string; commandPressureId?: string; staffAssistanceId?: string } | string = {}) {
  const body = typeof options === "string" ? { scenarioId: options } : options;
  return fetchJson<SessionEnvelope>(`${BASE}/sessions`, {
    method: "POST",
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  });
}

export function loadSession(id: string) {
  return fetchJson<SessionEnvelope>(`${BASE}/sessions/${id}`);
}

export function deleteSession(id: string) {
  return fetchJson<{ ok: boolean }>(`${BASE}/sessions/${id}`, { method: "DELETE" });
}

export function previewTurn(
  sessionId: string,
  cycle: TurnCycleState,
  extraSelections?: MemoSelection[],
  staffNegotiations?: StaffNegotiation[],
  signal?: AbortSignal,
  commanderIntent?: import("@brass-ledger/shared").CommanderIntent,
) {
  const selections = extraSelections ?? cycle.selections;
  const negotiations = staffNegotiations ?? cycle.staffNegotiations;
  const turn = cycle.session.state.turn;
  return fetchJson<PreviewPayload>(`${BASE}/sessions/${sessionId}/preview-turn`, {
    method: "POST",
    body: JSON.stringify({
      input: { turn, selections, acceptedRiskOverrides: [], staffNegotiations: negotiations, commanderIntent: commanderIntent ?? cycle.commanderIntent },
    }),
    signal,
  });
}

export function resolveTurn(
  sessionId: string,
  session: TurnCycleState["session"],
  selections: MemoSelection[],
  acceptedRiskOverrides: AcceptedRiskOverride[],
  staffNegotiations: StaffNegotiation[],
  commanderIntent: import("@brass-ledger/shared").CommanderIntent | undefined,
  expectedRevision?: number,
) {
  return fetchJson<SessionEnvelope & { result: import("@brass-ledger/shared").TurnResult }>(`${BASE}/sessions/${sessionId}/resolve-turn`, {
    method: "POST",
    body: JSON.stringify({
      input: { turn: session.state.turn, selections, acceptedRiskOverrides, staffNegotiations, commanderIntent },
      expectedRevision,
    }),
  });
}

export function openChiefConversation(
  sessionId: string,
  chiefId: string,
  memoId: string,
  optionId: string,
  selections: MemoSelection[],
  expectedRevision?: number,
) {
  return fetchJson<SessionEnvelope & { conversation: import("@brass-ledger/shared").ChiefConversationRecord }>(
    `${BASE}/sessions/${sessionId}/chiefs/${chiefId}/conversation/open`,
    {
      method: "POST",
      body: JSON.stringify({ memoId, optionId, selections, expectedRevision }),
    },
  );
}

export function respondToChief(
  sessionId: string,
  chiefId: string,
  responseId: string,
  expectedRevision?: number,
) {
  return fetchJson<
    SessionEnvelope & {
      conversation: import("@brass-ledger/shared").ChiefConversationRecord;
      response: { id: string; label: string; commanderLine: string; chiefReply: string; trustDelta: number; trustAfter: number; relationshipEffect: string } | null;
    }
  >(`${BASE}/sessions/${sessionId}/chiefs/${chiefId}/respond`, {
    method: "POST",
    body: JSON.stringify({ responseId, expectedRevision }),
  });
}

export function exportSession(sessionId: string) {
  return fetchJson<SessionExport>(`${BASE}/sessions/${sessionId}/export`);
}

export function importSession(exportData: SessionExport) {
  return fetchJson<SessionEnvelope>(`${BASE}/sessions/import`, {
    method: "POST",
    body: JSON.stringify({ exportData }),
  });
}

export function validateReplay(sessionId: string) {
  return fetchJson<{ validation: import("@brass-ledger/shared").ReplayValidation }>(`${BASE}/sessions/${sessionId}/replay`);
}
