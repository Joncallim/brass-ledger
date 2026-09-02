import { createHash } from "node:crypto";
import {
  type V2AgendaIssue,
  type V2CommandSet,
  type V2CommandSetLedgerEntry,
  type V2FinalOrder,
  type V2Identity,
  type V2Session,
  v2AgendaIssueSchema,
  v2CommandSetSchema,
  v2SessionSchema,
} from "@brass-ledger/shared";

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
    readonly code: "v2_invalid_command" | "v2_stale_revision" | "v2_wrong_cycle" | "v2_invalid_agenda" | "v2_disposition_count" | "v2_disposition_order" | "v2_illegal_intervention" | "v2_illegal_defer" | "v2_intervention_limit",
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

  return { finalOrders, interventionCost: interventions, postState: { ...state, cycle: state.cycle + 1 }, postRevision: revision + 1 };
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

/**
 * Verifies an imported V2 root against itself only. This is suitable for the
 * server import path: a non-empty ledger additionally requires a trusted agenda
 * provider so replay never treats saved client data as authored game content.
 */
export function validateV2ReplayIntegrity(rawSession: unknown, trustedAgendaProvider?: V2TrustedAgendaProvider): V2Session {
  // Keep #95's registry-less import boundary stable. It cannot treat a saved
  // agenda as content, so it rejects all non-empty ledgers before structural
  // parsing. A real V2 dispatcher must supply the trusted provider below.
  if (trustedAgendaProvider === undefined
    && typeof rawSession === "object" && rawSession !== null
    && Array.isArray((rawSession as { actionLedger?: unknown }).actionLedger)
    && (rawSession as { actionLedger: unknown[] }).actionLedger.length !== 0) {
    throw new V2ReplayValidationError("v2_nonempty_ledger_unsupported", "V2 actions cannot be replayed without a trusted authored agenda provider.");
  }
  const session = v2SessionSchema.parse(rawSession);
  const identity = session.identity;
  const initialDigest = v2InitialStateDigest(identity, session.initialState);
  if (session.initialStateDigest !== initialDigest) {
    throw new V2ReplayValidationError("v2_initial_state_digest_mismatch", "V2 initial-state digest does not match its canonical identity envelope.");
  }
  if (session.actionLedger.length === 0) {
    if (canonicalV2Json(session.state) !== canonicalV2Json(session.initialState)) {
      throw new V2ReplayValidationError("v2_state_changed_without_ledger", "A zero-action V2 ledger cannot change state.");
    }
  } else {
    if (trustedAgendaProvider === undefined) throw new V2ReplayValidationError("v2_trusted_agenda_required", "A non-empty V2 ledger requires a trusted authored agenda provider for replay.");
    let replayState = session.initialState;
    let replayRevision = 0;
    for (const entry of session.actionLedger) {
      if (canonicalV2Json(entry.preState) !== canonicalV2Json(replayState)) {
        throw new V2ReplayValidationError("v2_ledger_pre_state_mismatch", "A V2 ledger entry does not begin at the reconstructed state.");
      }
      if (entry.preRevision !== replayRevision || entry.commandSet.expectedRevision !== replayRevision) {
        throw new V2ReplayValidationError("v2_ledger_revision_mismatch", "A V2 ledger entry has an invalid revision chain.");
      }
      if (entry.preStateHash !== v2StateHash(entry.preState) || entry.postStateHash !== v2StateHash(entry.postState)) {
        throw new V2ReplayValidationError("v2_ledger_hash_mismatch", "A V2 ledger entry has invalid canonical state evidence.");
      }
      let resolved: V2ResolvedCommandSet;
      try {
        const trustedAgenda = trustedAgendaProvider(replayState);
        const canonicalCommandSet = canonicalizeV2CommandSet(trustedAgenda, entry.commandSet);
        if (canonicalV2Json(entry.commandSet) !== canonicalV2Json(canonicalCommandSet)) {
          throw new V2CommandValidationError("v2_disposition_order", "A V2 ledger command is not stored in canonical agenda order.");
        }
        resolved = resolveV2CommandSet(replayState, replayRevision, trustedAgenda, canonicalCommandSet);
      } catch (error) {
        if (error instanceof V2CommandValidationError) {
          throw new V2ReplayValidationError("v2_ledger_transition_invalid", `A V2 ledger command is no longer legal: ${error.code}.`);
        }
        throw error;
      }
      if (entry.interventionCost !== resolved.interventionCost
        || canonicalV2Json(entry.finalOrders) !== canonicalV2Json(resolved.finalOrders)
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
