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
    saveFormatVersion: "6",
    history,
  };
}
