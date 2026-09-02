import { createHash } from "node:crypto";
import {
  type V2Identity,
  type V2Session,
  v2SessionSchema,
} from "@brass-ledger/shared";

export class V2ReplayValidationError extends Error {
  constructor(
    readonly code: "v2_content_identity_mismatch" | "v2_initial_state_digest_mismatch" | "v2_final_state_digest_mismatch" | "v2_nonempty_ledger_unsupported" | "v2_state_changed_without_ledger",
    message: string,
  ) {
    super(message);
    this.name = "V2ReplayValidationError";
  }
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

/**
 * #95 validates only a zero-action skeleton.  #96 must replace the ledger
 * branch with transition re-execution; it may not weaken this rejection.
 */
/**
 * Verifies an imported V2 root against itself only. This is suitable for the
 * #95 server's intentionally unsupported path: it can reject corruption but
 * cannot make registry claims before V2 content exists.
 */
export function validateV2ReplayIntegrity(rawSession: unknown): V2Session {
  // This early structural check produces the documented replay error rather
  // than a generic schema-size error for an action that #95 has no authority
  // to interpret. All other malformed roots still fail strict schema parsing.
  if (typeof rawSession === "object" && rawSession !== null
    && Array.isArray((rawSession as { actionLedger?: unknown }).actionLedger)
    && (rawSession as { actionLedger: unknown[] }).actionLedger.length !== 0) {
    throw new V2ReplayValidationError("v2_nonempty_ledger_unsupported", "V2 actions cannot be replayed before the authoritative order contract exists.");
  }
  const session = v2SessionSchema.parse(rawSession);
  const identity = session.identity;
  const initialDigest = v2InitialStateDigest(identity, session.initialState);
  if (session.initialStateDigest !== initialDigest) {
    throw new V2ReplayValidationError("v2_initial_state_digest_mismatch", "V2 initial-state digest does not match its canonical identity envelope.");
  }
  if (canonicalV2Json(session.state) !== canonicalV2Json(session.initialState)) {
    throw new V2ReplayValidationError("v2_state_changed_without_ledger", "A zero-action V2 ledger cannot change state.");
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
export function validateV2ReplaySkeleton(rawSession: unknown, trustedLiveIdentity: V2Identity): V2Session {
  const session = validateV2ReplayIntegrity(rawSession);
  const identity = session.identity;
  if (identity.rulesetVersion !== trustedLiveIdentity.rulesetVersion
    || identity.scenarioId !== trustedLiveIdentity.scenarioId
    || identity.contentVersion !== trustedLiveIdentity.contentVersion
    || identity.contentDigest !== trustedLiveIdentity.contentDigest) {
    throw new V2ReplayValidationError("v2_content_identity_mismatch", "V2 content identity does not match the live registry.");
  }
  return session;
}
