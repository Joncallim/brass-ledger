import type { ProgramPhase, ScenarioSummary } from "@brass-ledger/shared";

/**
 * Canonical player-facing wording for values the engine stores as identifiers or
 * enums. Screens should read from here instead of printing a raw stored value,
 * so the same state always reads the same way across the app.
 */

export const campaignStatusLabel: Record<string, string> = {
  active: "In progress",
  won: "Won",
  lost: "Lost",
};

export const commitmentTypeLabel: Record<string, string> = {
  doctrine: "Doctrine",
  alliance: "Alliance",
  cabinet: "Cabinet",
  program: "Program",
};

export const programPhaseLabel: Record<ProgramPhase, string> = {
  concept: "Concept",
  funded: "Funded",
  procured: "Procured",
  integrated: "Integrated",
  trained: "Trained",
  operational: "Operational",
};

export const constraintTrendLabel: Record<string, string> = {
  improving: "Easing",
  steady: "Steady",
  worsening: "Worsening",
};

export const estimateVisibilityLabel: Record<string, string> = {
  KNOWN: "Known",
  ESTIMATED: "Estimated",
  RUMORED: "Rumored",
};

/**
 * How the chiefs as a group stand on one selected option. These four states are
 * distinct and must not be collapsed: "Contested + strained" means a chief
 * objects *and* the staff lane the option needs is already strained or
 * overloaded. None of them stop you from committing the option.
 */
export const coalitionPostureLabel: Record<string, string> = {
  supporting: "Supported",
  conditional: "Conditional",
  contested: "Contested",
  blocked: "Contested + strained",
};

export const coalitionPostureHelp: Array<{ label: string; meaning: string }> = [
  { label: "Supported", meaning: "every chief who spoke backs it" },
  { label: "Conditional", meaning: "backed, but some chiefs want conditions held to" },
  { label: "Contested", meaning: "at least one chief objects" },
  { label: "Contested + strained", meaning: "a chief objects and the staff it needs is already stretched" },
];

/** How one chief stands on one option. */
export const chiefPositionLabel: Record<string, string> = {
  support: "Supports",
  accept_risk: "Accepts the risk",
  request_conditions: "Wants conditions",
  oppose: "Objects",
};

/** Program levels reported by the engine as 0, 1, 2. */
export const programLevelLabel = ["Concept", "In development", "Fielded"];

/**
 * Option tags are engine ids in kebab-case ("tempo-spike"). They drive which
 * chiefs react and which events can fire, so players need to see them — but
 * they should read as words, not as identifiers. This only respaces the id; it
 * never invents a name for it.
 */
export function themeLabel(tag: string) {
  return tag.replace(/-/g, " ");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

/**
 * Turns capability-program and external-constraint ids into the names the
 * scenario gives them. Falls back to the id so nothing disappears if the
 * scenario has not loaded yet.
 */
export function scenarioLabels(scenario: ScenarioSummary | null | undefined) {
  const programs = new Map((scenario?.capabilityPrograms ?? []).map((entry) => [entry.id, entry.label]));
  const constraints = new Map((scenario?.externalConstraints ?? []).map((entry) => [entry.id, entry.label]));
  return {
    program: (id: string) => programs.get(id) ?? id,
    constraint: (id: string) => constraints.get(id) ?? id,
  };
}

export type ScenarioLabels = ReturnType<typeof scenarioLabels>;
