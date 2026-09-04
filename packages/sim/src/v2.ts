import { createHash } from "node:crypto";
import {
  type V2AgendaIssue,
  type V2CommandSet,
  type V2CommandSetLedgerEntry,
  type V2FinalOrder,
  type V2Identity,
  type V2IntentDeclaration,
  type V2IntentDeclarationLedgerEntry,
  type V2RavellanAction,
  type V2RavellanDecision,
  type V2RavellanDecisionLedgerEntry,
  type V2RavellanNormalAction,
  type V2RavellanObservation,
  type V2RavellanPosture,
  type V2RavellanState,
  type V2Session,
  v2AgendaIssueSchema,
  v2CommandSetSchema,
  v2IntentDeclarationSchema,
  v2SessionSchema,
} from "@brass-ledger/shared";

/** #99's narrow, non-omniscient policy input. Do not widen this to campaign state. */
export type V2RavellanPolicyInput = Readonly<{
  cycle: number;
  posture: V2RavellanPosture;
  preparation: V2RavellanState["preparation"];
  activeObservations: readonly V2RavellanObservation[];
}>;

/** Identity and seed are intentionally accepted here, and nowhere in normal policy. */
export function initializeV2RavellanState(input: Readonly<{ rulesetId: string; scenarioId: string; campaignSeed: string }>): Pick<V2RavellanState, "posture" | "preparation"> {
  const digest = v2Sha256({ rulesetId: input.rulesetId, scenarioId: input.scenarioId, campaignSeed: input.campaignSeed, tag: "ravellan-opening" });
  const posture = (["genuine_preparation", "coercive_feint", "testing"] as const)[Number.parseInt(digest.slice(0, 8), 16) % 3]!;
  return { posture, preparation: posture === "genuine_preparation" ? "developing" : "none" };
}

const observationLifetime: Record<V2RavellanObservation["signal"], number> = {
  beacon_coverage_signal: 2,
  visible_denial_signal: 1,
  coalition_unity_signal: 2,
  reserve_exhaustion_signal: 2,
  ravellan_discovery_signal: 1,
};

/** Normalizes persisted public observations; a signal is first usable next cycle. */
export function activeV2RavellanObservations(records: readonly V2RavellanObservation[], cycle: number): readonly V2RavellanObservation[] {
  const newest = new Map<V2RavellanObservation["signal"], V2RavellanObservation>();
  for (const record of records) {
    if (record.observedCycle >= cycle || cycle > record.observedCycle + observationLifetime[record.signal]) continue;
    const prior = newest.get(record.signal);
    if (prior !== undefined && prior.observedCycle === record.observedCycle && prior.value !== record.value) {
      throw new TypeError(`Contradictory Ravellan observation '${record.signal}' at cycle ${record.observedCycle}.`);
    }
    if (prior === undefined || record.observedCycle > prior.observedCycle) newest.set(record.signal, record);
  }
  return [...newest.values()].sort((left, right) => left.signal < right.signal ? -1 : left.signal > right.signal ? 1 : 0);
}

/** Persist only observations which can still affect a future policy decision. */
function canonicalizeV2RavellanObservations(records: readonly V2RavellanObservation[], cycle: number): V2RavellanObservation[] {
  const newest = new Map<V2RavellanObservation["signal"], V2RavellanObservation>();
  for (const record of records) {
    if (record.observedCycle > cycle) throw new TypeError("Ravellan observations cannot be recorded from a future cycle.");
    const prior = newest.get(record.signal);
    if (prior !== undefined && prior.observedCycle === record.observedCycle && prior.value !== record.value) {
      throw new TypeError(`Contradictory Ravellan observation '${record.signal}' at cycle ${record.observedCycle}.`);
    }
    if (prior === undefined || record.observedCycle > prior.observedCycle) newest.set(record.signal, record);
  }
  return [...newest.values()]
    .filter((record) => cycle <= record.observedCycle + observationLifetime[record.signal])
    .sort((left, right) => left.signal < right.signal ? -1 : left.signal > right.signal ? 1 : 0);
}

function hasObservation(observations: readonly V2RavellanObservation[], signal: V2RavellanObservation["signal"], value: string): boolean {
  return observations.some((observation) => observation.signal === signal && observation.value === value);
}
function advancePreparation(preparation: V2RavellanState["preparation"]): V2RavellanState["preparation"] {
  return preparation === "none" ? "developing" : preparation === "developing" ? "ready" : "ready";
}
function legalNormalAction(cycle: number, action: V2RavellanNormalAction): boolean {
  return action === "probe_shipping" ? cycle >= 1 && cycle <= 5
    : action === "pause_consolidate" ? cycle >= 3 && cycle <= 5
      : cycle >= 2 && cycle <= 5;
}

/** Exact ordered 22-policy evaluator: first matching legal authored row wins. */
export function chooseV2RavellanAction(input: V2RavellanPolicyInput): V2RavellanDecision {
  const { cycle, posture, preparation, activeObservations: observations } = input;
  if (!Number.isInteger(cycle) || cycle < 1 || cycle > 6) throw new RangeError("Ravellan policy only supports cycles 1 through 6.");
  if (cycle === 1) return { action: "probe_shipping", matchedPolicyRowId: "C1", nextPosture: posture, nextPreparation: preparation };
  const weak = hasObservation(observations, "beacon_coverage_signal", "weak");
  const credible = hasObservation(observations, "beacon_coverage_signal", "credible");
  const withheld = hasObservation(observations, "visible_denial_signal", "withheld");
  const demonstrated = hasObservation(observations, "visible_denial_signal", "demonstrated");
  const fractured = hasObservation(observations, "coalition_unity_signal", "fractured");
  const coherent = hasObservation(observations, "coalition_unity_signal", "coherent");
  const exhausted = hasObservation(observations, "reserve_exhaustion_signal", "suspected");
  const discovered = hasObservation(observations, "ravellan_discovery_signal", "suspected");
  if (cycle === 6) {
    if (posture === "genuine_preparation") return { action: preparation === "ready" && !(discovered && credible && coherent) ? "attempt_seizure" : "threshold_challenge", matchedPolicyRowId: preparation === "ready" && !(discovered && credible && coherent) ? "R6-1" : "R6-2", nextPosture: posture, nextPreparation: preparation };
    if (posture === "coercive_feint") return { action: "threshold_challenge", matchedPolicyRowId: "R6-3", nextPosture: posture, nextPreparation: preparation };
    if (weak || fractured) return { action: "threshold_challenge", matchedPolicyRowId: "R6-4", nextPosture: posture, nextPreparation: preparation };
    return { action: "abort_and_pressure", matchedPolicyRowId: "R6-5", nextPosture: posture, nextPreparation: preparation };
  }
  const choose = (rowId: V2RavellanDecision["matchedPolicyRowId"], matches: boolean, action: V2RavellanNormalAction, nextPosture: V2RavellanPosture = posture): V2RavellanDecision | undefined =>
    matches && legalNormalAction(cycle, action) ? { action, matchedPolicyRowId: rowId, nextPosture, nextPreparation: action === "prepare_beacon_seizure" ? advancePreparation(preparation) : preparation } : undefined;
  if (posture === "genuine_preparation") {
    return choose("GP-1", discovered && credible && coherent, "pause_consolidate", "coercive_feint")
      ?? choose("GP-2", weak, "prepare_beacon_seizure")
      ?? choose("GP-3", discovered, "seed_deception")
      ?? choose("GP-4", fractured, "probe_shipping")
      ?? choose("GP-5", true, "prepare_beacon_seizure")!;
  }
  if (posture === "coercive_feint") {
    return choose("CF-1", weak && withheld && fractured, "prepare_beacon_seizure", "genuine_preparation")
      ?? choose("CF-2", exhausted, "probe_shipping")
      ?? choose("CF-3", fractured, "seed_deception")
      ?? choose("CF-4", demonstrated || coherent, "pause_consolidate")
      ?? choose("CF-5", true, "probe_shipping")!;
  }
  return choose("T-1", weak && fractured, "prepare_beacon_seizure", "genuine_preparation")
    ?? choose("T-2", credible && coherent, "pause_consolidate", "coercive_feint")
    ?? choose("T-3", exhausted, "probe_shipping")
    ?? choose("T-4", discovered, "seed_deception")
    ?? choose("T-5", true, "probe_shipping")!;
}

export class V2ReplayValidationError extends Error {
  constructor(
    readonly code: "v2_content_identity_mismatch" | "v2_initial_state_digest_mismatch" | "v2_final_state_digest_mismatch" | "v2_nonempty_ledger_unsupported" | "v2_state_changed_without_ledger" | "v2_trusted_agenda_required" | "v2_ledger_transition_invalid" | "v2_ledger_pre_state_mismatch" | "v2_ledger_post_state_mismatch" | "v2_ledger_hash_mismatch" | "v2_ledger_revision_mismatch",
    message: string,
  ) {
    super(message);
    this.name = "V2ReplayValidationError";
  }
}

export class V2CommandValidationError extends Error {
  constructor(
    readonly code: "v2_invalid_command" | "v2_stale_revision" | "v2_wrong_cycle" | "v2_invalid_agenda" | "v2_disposition_count" | "v2_disposition_order" | "v2_illegal_intervention" | "v2_illegal_defer" | "v2_intervention_limit" | "v2_missing_standing_intent" | "v2_intent_already_declared" | "v2_invalid_intent_declaration",
    message: string,
  ) {
    super(message);
    this.name = "V2CommandValidationError";
  }
}

/**
 * Trusted authored content provides agenda issues in the exact display/order
 * contract. It is never derived from a client command or saved ledger entry.
 */
export type V2TrustedAgendaProvider = (state: V2Session["state"]) => readonly V2AgendaIssue[];

export type V2ResolvedCommandSet = {
  finalOrders: V2FinalOrder[];
  interventionCost: number;
  postState: V2Session["state"];
  postRevision: number;
};

export type V2ResolvedIntentDeclaration = {
  postState: V2Session["state"];
  postRevision: number;
};

export type V2ResolvedRavellanDecision = {
  decision: V2RavellanDecision;
  postState: V2Session["state"];
  postRevision: number;
};

/**
 * Records the immutable opening direction. It is deliberately not an order:
 * it leaves cycle and intervention budget unchanged while occupying exactly
 * one revisioned, replayable action.
 */
export function declareV2StandingIntent(
  state: V2Session["state"],
  revision: number,
  rawDeclaration: unknown,
): V2ResolvedIntentDeclaration {
  let declaration: V2IntentDeclaration;
  try {
    declaration = v2IntentDeclarationSchema.parse(rawDeclaration);
  } catch {
    throw new V2CommandValidationError("v2_invalid_intent_declaration", "The opening intent declaration does not match the authoritative contract.");
  }
  if (revision !== 0) {
    throw new V2CommandValidationError("v2_invalid_intent_declaration", "The opening standing intent must be the first V2 revision.");
  }
  if (declaration.expectedRevision !== revision) {
    throw new V2CommandValidationError("v2_stale_revision", "The opening intent declaration was created for a stale revision.");
  }
  if (state.cycle !== 1 || declaration.cycle !== state.cycle) {
    throw new V2CommandValidationError("v2_wrong_cycle", "Standing intent can only be declared during cycle 1.");
  }
  if (state.standingIntent !== null) {
    throw new V2CommandValidationError("v2_intent_already_declared", "Standing intent is immutable once declared.");
  }
  return { postState: { ...state, standingIntent: declaration.intent }, postRevision: revision + 1 };
}

function validateTrustedAgenda(agenda: readonly V2AgendaIssue[]): void {
  if (agenda.length === 0) {
    throw new V2CommandValidationError("v2_invalid_agenda", "A trusted agenda must contain at least one issue.");
  }
  const issueIds = new Set<string>();
  for (const rawIssue of agenda) {
    let issue: V2AgendaIssue;
    try {
      issue = v2AgendaIssueSchema.parse(rawIssue);
    } catch {
      throw new V2CommandValidationError("v2_invalid_agenda", "Trusted agenda has an invalid issue contract.");
    }
    if (issueIds.has(issue.id)) {
      throw new V2CommandValidationError("v2_invalid_agenda", `Trusted agenda repeats issue '${issue.id}'.`);
    }
    issueIds.add(issue.id);
    const orderIds = new Set<string>();
    for (const order of issue.authoredOrders) {
      if (orderIds.has(order.id)) {
        throw new V2CommandValidationError("v2_invalid_agenda", `Trusted agenda repeats order '${order.id}' for '${issue.id}'.`);
      }
      orderIds.add(order.id);
    }
    if (!orderIds.has(issue.recommendedOrderId)) {
      throw new V2CommandValidationError("v2_invalid_agenda", `Trusted recommendation '${issue.recommendedOrderId}' is not an authored order for '${issue.id}'.`);
    }
  }
}

/**
 * Accept any complete client submission order, then turn it into the one
 * persisted/replayed agenda order. This removes incidental UI ordering from
 * canonical evidence while still rejecting missing, duplicated, and extra IDs.
 */
export function canonicalizeV2CommandSet(trustedAgenda: readonly V2AgendaIssue[], rawCommandSet: unknown): V2CommandSet {
  let commandSet: V2CommandSet;
  try {
    commandSet = v2CommandSetSchema.parse(rawCommandSet);
  } catch {
    throw new V2CommandValidationError("v2_invalid_command", "The command set does not match the authoritative command contract.");
  }
  validateTrustedAgenda(trustedAgenda);
  if (commandSet.dispositions.length !== trustedAgenda.length) {
    throw new V2CommandValidationError("v2_disposition_count", "A command set must contain exactly one disposition for every trusted agenda issue.");
  }
  const dispositionsByIssue = new Map<string, V2CommandSet["dispositions"][number]>();
  for (const disposition of commandSet.dispositions) {
    if (dispositionsByIssue.has(disposition.issueId) || !trustedAgenda.some((issue) => issue.id === disposition.issueId)) {
      throw new V2CommandValidationError("v2_disposition_order", "A command set must contain every trusted agenda issue exactly once.");
    }
    dispositionsByIssue.set(disposition.issueId, disposition);
  }
  return { ...commandSet, dispositions: trustedAgenda.map((issue) => dispositionsByIssue.get(issue.id)!) };
}

/**
 * Resolves an entire cycle atomically. This function does not implement B2
 * recommendations, costs, or consequences: it merely enforces the trusted
 * agenda's legal command surface and records which order was finally chosen.
 */
export function resolveV2CommandSet(
  state: V2Session["state"],
  revision: number,
  trustedAgenda: readonly V2AgendaIssue[],
  rawCommandSet: unknown,
): V2ResolvedCommandSet {
  const commandSet = canonicalizeV2CommandSet(trustedAgenda, rawCommandSet);
  if (commandSet.expectedRevision !== revision) {
    throw new V2CommandValidationError("v2_stale_revision", "The command set was created for a stale revision.");
  }
  if (commandSet.cycle !== state.cycle) {
    throw new V2CommandValidationError("v2_wrong_cycle", "The command set does not target the current cycle.");
  }
  if (state.standingIntent === null) {
    throw new V2CommandValidationError("v2_missing_standing_intent", "The opening standing intent must be declared before any command set.");
  }
  let interventions = 0;
  const finalOrders: V2FinalOrder[] = [];
  for (let index = 0; index < trustedAgenda.length; index += 1) {
    const issue = trustedAgenda[index]!;
    const disposition = commandSet.dispositions[index]!;
    if (disposition.kind === "delegate") {
      finalOrders.push({ issueId: issue.id, responsibleOfficer: issue.responsibleOfficer, disposition: "delegate", orderId: issue.recommendedOrderId, interventionCost: 0 });
      continue;
    }
    if (disposition.kind === "defer") {
      if (!issue.mayDefer) {
        throw new V2CommandValidationError("v2_illegal_defer", `Issue '${issue.id}' cannot be deferred.`);
      }
      finalOrders.push({ issueId: issue.id, responsibleOfficer: issue.responsibleOfficer, disposition: "defer", orderId: null, interventionCost: 0 });
      continue;
    }
    if (!issue.authoredOrders.some((order) => order.id === disposition.orderId)) {
      throw new V2CommandValidationError("v2_illegal_intervention", `Order '${disposition.orderId}' is not an authored intervention for '${issue.id}'.`);
    }
    if (disposition.orderId === issue.recommendedOrderId) {
      throw new V2CommandValidationError("v2_illegal_intervention", `Intervention for '${issue.id}' must select an authored order other than the staff recommendation.`);
    }
    interventions += 1;
    if (interventions > 2) {
      throw new V2CommandValidationError("v2_intervention_limit", "A cycle permits at most two personal interventions.");
    }
    finalOrders.push({ issueId: issue.id, responsibleOfficer: issue.responsibleOfficer, disposition: "intervene", orderId: disposition.orderId, interventionCost: 1 });
  }

  return {
    finalOrders,
    interventionCost: interventions,
    postState: { ...state, cycle: state.cycle + 1 },
    postRevision: revision + 1,
  };
}

/**
 * The narrow policy is deliberately isolated from the broader session. This
 * system transition is the only place Ravellan state changes in #99.
 */
export function resolveV2RavellanDecision(
  state: V2Session["state"],
  revision: number,
): V2ResolvedRavellanDecision {
  if (state.standingIntent === null) {
    throw new V2CommandValidationError("v2_missing_standing_intent", "Ravellan cannot act before the opening standing intent is declared.");
  }
  const observations = canonicalizeV2RavellanObservations(state.ravellan.observations, state.cycle);
  const decision = chooseV2RavellanAction({
    cycle: state.cycle,
    posture: state.ravellan.posture,
    preparation: state.ravellan.preparation,
    activeObservations: activeV2RavellanObservations(observations, state.cycle),
  });
  return {
    decision,
    postState: {
      ...state,
      ravellan: {
        posture: decision.nextPosture,
        preparation: decision.nextPreparation,
        observations,
      },
    },
    postRevision: revision + 1,
  };
}

/** Stable JSON encoding for V2 replay evidence. Objects are key-sorted. */
export function canonicalV2Json(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("V2 canonical JSON does not permit non-finite numbers.");
    return JSON.stringify(Object.is(value, -0) ? 0 : value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalV2Json).join(",")}]`;
  if (typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      // Deliberately compare UTF-16 code units, never the process locale. JSON
      // strings preserve those code units, so this remains stable on every host.
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalV2Json(entry)}`)
      .join(",")}}`;
  }
  throw new TypeError("V2 canonical JSON does not permit unsupported values.");
}

export function v2Sha256(value: unknown): string {
  return createHash("sha256").update(canonicalV2Json(value)).digest("hex");
}

export type V2DigestEnvelope = {
  tag: "v2";
  ruleset: "v2";
  rulesetVersion: string;
  scenarioId: string;
  contentVersion: string;
  contentDigest: string;
  initialState: unknown;
  action: unknown;
  preState: unknown;
  postState: unknown;
};

export function v2DigestEnvelopeDigest(envelope: V2DigestEnvelope): string {
  return v2Sha256(envelope);
}

export function v2InitialStateDigest(identity: V2Identity, initialState: unknown): string {
  return v2DigestEnvelopeDigest({
    tag: "v2",
    ruleset: identity.ruleset,
    rulesetVersion: identity.rulesetVersion,
    scenarioId: identity.scenarioId,
    contentVersion: identity.contentVersion,
    contentDigest: identity.contentDigest,
    initialState,
    action: null,
    preState: initialState,
    postState: initialState,
  });
}

export function v2FinalSessionDigest(session: Pick<V2Session, "identity" | "initialState" | "state" | "actionLedger">): string {
  return v2DigestEnvelopeDigest({
    tag: "v2",
    ruleset: session.identity.ruleset,
    rulesetVersion: session.identity.rulesetVersion,
    scenarioId: session.identity.scenarioId,
    contentVersion: session.identity.contentVersion,
    contentDigest: session.identity.contentDigest,
    initialState: session.initialState,
    action: session.actionLedger,
    preState: session.initialState,
    postState: session.state,
  });
}

export function v2StateHash(state: V2Session["state"]): string {
  return v2Sha256(state);
}

/** Build replay evidence only after the full atomic command set has resolved. */
export function createV2CommandSetLedgerEntry(
  state: V2Session["state"],
  revision: number,
  trustedAgenda: readonly V2AgendaIssue[],
  rawCommandSet: unknown,
): V2CommandSetLedgerEntry {
  const commandSet = canonicalizeV2CommandSet(trustedAgenda, rawCommandSet);
  const resolved = resolveV2CommandSet(state, revision, trustedAgenda, commandSet);
  return {
    kind: "command-set",
    commandSet,
    finalOrders: resolved.finalOrders,
    interventionCost: resolved.interventionCost,
    preState: state,
    postState: resolved.postState,
    preRevision: revision,
    postRevision: resolved.postRevision,
    preStateHash: v2StateHash(state),
    postStateHash: v2StateHash(resolved.postState),
  };
}

export function createV2RavellanDecisionLedgerEntry(
  state: V2Session["state"],
  revision: number,
): V2RavellanDecisionLedgerEntry {
  const resolved = resolveV2RavellanDecision(state, revision);
  return {
    kind: "ravellan-decision",
    cycle: state.cycle,
    decision: resolved.decision,
    preState: state,
    postState: resolved.postState,
    preRevision: revision,
    postRevision: resolved.postRevision,
    preStateHash: v2StateHash(state),
    postStateHash: v2StateHash(resolved.postState),
  };
}

export function createV2IntentDeclarationLedgerEntry(
  state: V2Session["state"],
  revision: number,
  rawDeclaration: unknown,
): V2IntentDeclarationLedgerEntry {
  let intentDeclaration: V2IntentDeclaration;
  try {
    intentDeclaration = v2IntentDeclarationSchema.parse(rawDeclaration);
  } catch {
    throw new V2CommandValidationError("v2_invalid_intent_declaration", "The opening intent declaration does not match the authoritative contract.");
  }
  const resolved = declareV2StandingIntent(state, revision, intentDeclaration);
  return {
    kind: "intent-declaration",
    intentDeclaration,
    preState: state,
    postState: resolved.postState,
    preRevision: revision,
    postRevision: resolved.postRevision,
    preStateHash: v2StateHash(state),
    postStateHash: v2StateHash(resolved.postState),
  };
}

/**
 * Verifies an imported V2 root against itself only. This is suitable for the
 * server import path: a non-empty ledger additionally requires a trusted agenda
 * provider so replay never treats saved client data as authored game content.
 */
export function validateV2ReplayIntegrity(rawSession: unknown, trustedAgendaProvider?: V2TrustedAgendaProvider): V2Session {
  // Keep #95's registry-less import boundary stable for commands: the server
  // cannot trust a saved agenda without live authored content. An opening
  // intent declaration has no agenda and can be structurally replayed alone.
  if (trustedAgendaProvider === undefined
    && typeof rawSession === "object" && rawSession !== null
    && Array.isArray((rawSession as { actionLedger?: unknown }).actionLedger)
    && (rawSession as { actionLedger: Array<{ kind?: unknown }> }).actionLedger.some((entry) => entry?.kind === "command-set")) {
    throw new V2ReplayValidationError("v2_nonempty_ledger_unsupported", "V2 actions cannot be replayed without a trusted authored agenda provider.");
  }
  const session = v2SessionSchema.parse(rawSession);
  const identity = session.identity;
  if (session.initialState.standingIntent !== null) {
    throw new V2ReplayValidationError("v2_ledger_transition_invalid", "A V2 session must begin before its opening standing-intent declaration.");
  }
  const initialDigest = v2InitialStateDigest(identity, session.initialState);
  if (session.initialStateDigest !== initialDigest) {
    throw new V2ReplayValidationError("v2_initial_state_digest_mismatch", "V2 initial-state digest does not match its canonical identity envelope.");
  }
  if (session.actionLedger.length === 0) {
    if (canonicalV2Json(session.state) !== canonicalV2Json(session.initialState)) {
      throw new V2ReplayValidationError("v2_state_changed_without_ledger", "A zero-action V2 ledger cannot change state.");
    }
    if (session.revision !== 0) {
      throw new V2ReplayValidationError("v2_ledger_revision_mismatch", "A zero-action V2 ledger must have revision zero.");
    }
  } else {
    let replayState = session.initialState;
    let replayRevision = 0;
    let openingIntentRecorded = false;
    let phase: "ravellan" | "command" = "ravellan";
    for (const entry of session.actionLedger) {
      if (canonicalV2Json(entry.preState) !== canonicalV2Json(replayState)) {
        throw new V2ReplayValidationError("v2_ledger_pre_state_mismatch", "A V2 ledger entry does not begin at the reconstructed state.");
      }
      const expectedRevision = entry.kind === "intent-declaration"
        ? entry.intentDeclaration.expectedRevision
        : entry.preRevision;
      if (entry.preRevision !== replayRevision || expectedRevision !== replayRevision) {
        throw new V2ReplayValidationError("v2_ledger_revision_mismatch", "A V2 ledger entry has an invalid revision chain.");
      }
      if (entry.preStateHash !== v2StateHash(entry.preState) || entry.postStateHash !== v2StateHash(entry.postState)) {
        throw new V2ReplayValidationError("v2_ledger_hash_mismatch", "A V2 ledger entry has invalid canonical state evidence.");
      }
      let resolved: V2ResolvedCommandSet | V2ResolvedIntentDeclaration | V2ResolvedRavellanDecision;
      try {
        if (entry.kind === "intent-declaration") {
          if (openingIntentRecorded || replayRevision !== 0 || replayState.cycle !== 1) {
            throw new V2CommandValidationError("v2_invalid_intent_declaration", "The opening declaration is out of canonical ledger order.");
          }
          resolved = declareV2StandingIntent(replayState, replayRevision, entry.intentDeclaration);
          openingIntentRecorded = true;
        } else if (entry.kind === "ravellan-decision") {
          if (!openingIntentRecorded || phase !== "ravellan" || entry.cycle !== replayState.cycle) {
            throw new V2CommandValidationError("v2_wrong_cycle", "The Ravellan decision is out of canonical ledger order.");
          }
          const terminal = entry.cycle === 6;
          const actionIsTerminal = entry.decision.action === "attempt_seizure" || entry.decision.action === "threshold_challenge" || entry.decision.action === "abort_and_pressure";
          if (terminal !== actionIsTerminal) {
            throw new V2CommandValidationError("v2_wrong_cycle", "Ravellan terminal behaviour is only legal in cycle 6.");
          }
          resolved = resolveV2RavellanDecision(replayState, replayRevision);
          phase = "command";
        } else {
          if (!openingIntentRecorded || phase !== "command" || replayState.cycle === 6) {
            throw new V2CommandValidationError("v2_wrong_cycle", "The command set is out of canonical ledger order.");
          }
          if (trustedAgendaProvider === undefined) throw new V2CommandValidationError("v2_missing_standing_intent", "A V2 command requires its trusted authored agenda.");
          const trustedAgenda = trustedAgendaProvider(replayState);
          const canonicalCommandSet = canonicalizeV2CommandSet(trustedAgenda, entry.commandSet);
          if (canonicalV2Json(entry.commandSet) !== canonicalV2Json(canonicalCommandSet)) {
            throw new V2CommandValidationError("v2_disposition_order", "A V2 ledger command is not stored in canonical agenda order.");
          }
          resolved = resolveV2CommandSet(replayState, replayRevision, trustedAgenda, canonicalCommandSet);
          phase = "ravellan";
        }
      } catch (error) {
        if (error instanceof V2CommandValidationError) {
          throw new V2ReplayValidationError("v2_ledger_transition_invalid", `A V2 ledger command is no longer legal: ${error.code}.`);
        }
        throw error;
      }
      const evidenceMatches = entry.kind === "command-set"
        ? (resolved as V2ResolvedCommandSet).interventionCost === entry.interventionCost
          && canonicalV2Json((resolved as V2ResolvedCommandSet).finalOrders) === canonicalV2Json(entry.finalOrders)
        : entry.kind === "ravellan-decision"
          ? canonicalV2Json((resolved as V2ResolvedRavellanDecision).decision) === canonicalV2Json(entry.decision)
          : true;
      if (!evidenceMatches
        || canonicalV2Json(entry.postState) !== canonicalV2Json(resolved.postState)) {
        throw new V2ReplayValidationError("v2_ledger_post_state_mismatch", "A V2 ledger entry does not match authoritative re-execution.");
      }
      if (entry.postRevision !== resolved.postRevision) {
        throw new V2ReplayValidationError("v2_ledger_revision_mismatch", "A V2 ledger entry has an invalid post-revision.");
      }
      replayState = resolved.postState;
      replayRevision = resolved.postRevision;
    }
    if (canonicalV2Json(session.state) !== canonicalV2Json(replayState)) {
      throw new V2ReplayValidationError("v2_ledger_post_state_mismatch", "The V2 session state does not match ledger re-execution.");
    }
    if (session.revision !== replayRevision) {
      throw new V2ReplayValidationError("v2_ledger_revision_mismatch", "The V2 session revision does not match ledger re-execution.");
    }
  }
  const finalDigest = v2FinalSessionDigest(session);
  if (session.finalStateDigest !== finalDigest) {
    throw new V2ReplayValidationError("v2_final_state_digest_mismatch", "V2 final-session digest does not match its canonical ledger envelope.");
  }
  return session;
}

/**
 * Registry-aware replay entry point. Callers must pass an identity resolved
 * from trusted live content, never a field supplied by the imported save.
 */
export function validateV2ReplaySkeleton(rawSession: unknown, trustedLiveIdentity: V2Identity, trustedAgendaProvider?: V2TrustedAgendaProvider): V2Session {
  // Resolve the identity boundary before interpreting any ledger transition.
  // An import from a different live registry must fail as that mismatch, not
  // because its historical agenda cannot be replayed by this registry.
  const parsed = v2SessionSchema.parse(rawSession);
  const identity = parsed.identity;
  if (identity.rulesetVersion !== trustedLiveIdentity.rulesetVersion
    || identity.scenarioId !== trustedLiveIdentity.scenarioId
    || identity.contentVersion !== trustedLiveIdentity.contentVersion
    || identity.contentDigest !== trustedLiveIdentity.contentDigest) {
    throw new V2ReplayValidationError("v2_content_identity_mismatch", "V2 content identity does not match the live registry.");
  }
  return validateV2ReplayIntegrity(parsed, trustedAgendaProvider);
}
