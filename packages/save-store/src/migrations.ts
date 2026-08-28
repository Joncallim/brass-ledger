import { soloScenario } from "@brass-ledger/content";

const doctrineNoteById = new Map<string, string>(
  soloScenario.staffFunctions.map((definition) => [definition.id, definition.doctrineNote]),
);

function migrateStaffFunctionReadout(readout: Record<string, unknown>): Record<string, unknown> {
  if (!("consequence" in readout)) return readout;
  const { consequence, ...rest } = readout;
  const warnings = Array.isArray(rest.warnings) ? (rest.warnings as unknown[]) : [];
  const id = typeof rest.id === "string" ? rest.id : undefined;
  return {
    ...rest,
    activeWarning: warnings.length > 0 ? warnings[0] : null,
    standingRemit: (id && doctrineNoteById.get(id)) ?? "",
  };
}

/**
 * Migrates a raw (untyped, pre-schema-validation) session payload from
 * saveFormatVersion "5" to "6". v5 embedded a single ambiguous
 * `StaffFunctionReadout.consequence` field that could hold either a live
 * warning or static doctrine copy; v6 replaces it with explicit
 * `activeWarning`/`standingRemit` fields. Returns the payload unchanged if
 * it is not a v5 session.
 */
export function migrateSessionPayload(payload: unknown): unknown {
  if (typeof payload !== "object" || payload === null) return payload;
  const session = payload as Record<string, unknown>;
  if (session.saveFormatVersion === "8") {
    const actions = Array.isArray(session.authoritativeActions) ? session.authoritativeActions : [];
    // A pre-campaign-bound conversation ledger cannot be safely upgraded: two
    // campaigns can share an opening state, so its records are transplantable.
    // Action-free v8 saves have no such provenance claim and can be upgraded.
    if (!(typeof session.campaignId === "string" && session.campaignId.length > 0) && actions.length === 0) {
      return {
        ...session,
        campaignId: typeof session.id === "string" && session.id.length > 0 ? session.id : undefined,
        contentVersion: session.contentVersion === "0.11.0" ? "0.12.0" : session.contentVersion,
      };
    }
    if (session.contentVersion === "0.11.0") return { ...session, contentVersion: "0.12.0" };
    return payload;
  }
  if (session.saveFormatVersion === "7") {
    const actions = Array.isArray(session.authoritativeActions) ? session.authoritativeActions : [];
    // v7 action records lacked an independently verifiable transition
    // envelope.  Only action-free sessions can be safely upgraded.
    if (actions.length > 0) return payload;
    return { ...session, saveFormatVersion: "8", contentVersion: session.contentVersion === "0.11.0" ? "0.12.0" : session.contentVersion, authoritativeActions: [], campaignId: session.id };
  }
  // Dialogue 0.12.0 is content-side and deterministic; existing v6 transcripts,
  // agenda memory, state, and replay hashes remain valid. Upgrade the compatibility
  // marker so active and completed 0.11.0 campaigns can continue with the new voice
  // contracts instead of being stranded at an arbitrary content boundary.
  if (session.saveFormatVersion === "6") {
    // v6 did not record conversations as authoritative actions.  A campaign
    // with no conversation state can be upgraded safely because relationship
    // state is then wholly resolver-derived; anything else must remain an
    // explicitly incompatible record rather than being silently trusted.
    const state = session.state as Record<string, unknown> | undefined;
    const historyHasConversation = Array.isArray(session.history) && session.history.some((entry) => {
      const previous = (entry as Record<string, unknown> | null)?.previousState as Record<string, unknown> | undefined;
      return Array.isArray(previous?.conversationHistory) && previous.conversationHistory.length > 0;
    });
    const hasConversation = Array.isArray(state?.conversationHistory) && state.conversationHistory.length > 0;
    if (!hasConversation && !historyHasConversation) {
      return {
        ...session,
        saveFormatVersion: "8",
        contentVersion: session.contentVersion === "0.11.0" ? "0.12.0" : session.contentVersion,
        authoritativeActions: [],
        campaignId: session.id,
      };
    }
    return payload;
  }
  if (session.saveFormatVersion !== "5") return payload;

  const history = Array.isArray(session.history)
    ? session.history.map((turnResult) => {
        if (typeof turnResult !== "object" || turnResult === null) return turnResult;
        const entry = turnResult as Record<string, unknown>;
        if (!Array.isArray(entry.staffFunctions)) return entry;
        return {
          ...entry,
          staffFunctions: entry.staffFunctions.map((readout) =>
            typeof readout === "object" && readout !== null
              ? migrateStaffFunctionReadout(readout as Record<string, unknown>)
              : readout,
          ),
        };
      })
    : session.history;

  return {
    ...session,
    saveFormatVersion: "8",
    authoritativeActions: [],
    campaignId: session.id,
    history,
  };
}
