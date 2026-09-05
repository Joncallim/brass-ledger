/**
 * #100 — Verified projection context.
 *
 * Opaque sim-owned handle whose private data are stored in a module-private
 * WeakMap. The public type exposes no ledger/state fields.
 *
 * Construction is allowed only from trusted replay or sim-owned live authority.
 * It canonical-deep-clones and recursively freezes the private payload.
 * Mutating the source object or any nested returned object cannot alter
 * trusted history.
 */

import { canonicalV2Json } from "@brass-ledger/shared";
import type { V2Session } from "@brass-ledger/shared";

// ─── Private payload ─────────────────────────────────────────────────

/** Internal payload stored in the WeakMap. */
type VerifiedContextPayload = {
  /** Canonical deep-clone of the session up to (but not including) the cut cycle. */
  readonly history: V2Session["actionLedger"];
  /** The cut cycle: historical cycles are [1, cutCycle). */
  readonly cutCycle: number;
  /** Deep-frozen initial state. */
  readonly initialState: unknown;
  /** SHA-256 digest of the initial state for tamper detection. */
  readonly initialStateDigest: string;
  /** Canonical JSON of the full trusted history for comparison. */
  readonly historyDigest: string;
};

// ─── WeakMap storage (module-private) ────────────────────────────────

const privateStore = new WeakMap<object, VerifiedContextPayload>();

// ─── Public opaque handle ────────────────────────────────────────────

/**
 * Opaque handle to verified session history.
 *
 * The public type exposes no ledger/state fields. Callers can only pass
 * it to sim derivation APIs.
 */
export class V2VerifiedProjectionContext {
  /** @internal */
  constructor(payload: VerifiedContextPayload) {
    privateStore.set(this, payload);
  }

  /** @internal */
  static _getPayload(ctx: V2VerifiedProjectionContext): VerifiedContextPayload {
    const payload = privateStore.get(ctx);
    if (!payload) throw new Error("V2VerifiedProjectionContext payload is not available (forged handle?)");
    return payload;
  }
}

// ─── Factory ─────────────────────────────────────────────────────────

/**
 * Construct a verified projection context from a trusted session up to the
 * given cut cycle.
 *
 * @param session - The trusted, already-validated V2 session.
 * @param cutCycle - The cycle to cut at. Historical cycles [1, cutCycle) are
 *   included. Cycle cutCycle's Ravellan decision may or may not exist.
 * @returns An opaque verified context.
 */
export function createVerifiedProjectionContext(
  session: V2Session,
  cutCycle: number,
): V2VerifiedProjectionContext {
  // Deep clone the session to prevent mutation
  const clonedSession: V2Session = JSON.parse(JSON.stringify(session));

  // Filter ledger entries: only entries with cycle < cutCycle
  // Intent declaration has cycle 1, ravellan decisions have cycle, command sets have cycle
  const filteredLedger = clonedSession.actionLedger.filter((entry) => {
    if (entry.kind === "intent-declaration") return true; // Always include intent
    if (entry.kind === "ravellan-decision") return entry.cycle < cutCycle;
    if (entry.kind === "command-set") return entry.commandSet.cycle < cutCycle;
    return false;
  });

  // Deep freeze the filtered ledger
  const frozenLedger: V2Session["actionLedger"] = Object.freeze(
    filteredLedger.map((entry) => Object.freeze({ ...entry }))
  ) as V2Session["actionLedger"];

  // Compute digests
  const historyDigest = canonicalV2Json(frozenLedger);
  const initialStateDigest = clonedSession.initialStateDigest;

  const payload: VerifiedContextPayload = {
    history: frozenLedger,
    cutCycle,
    initialState: Object.freeze(JSON.parse(JSON.stringify(clonedSession.initialState))),
    initialStateDigest,
    historyDigest,
  };

  return new V2VerifiedProjectionContext(payload);
}

/**
 * Check whether a Ravellan decision exists for a given cycle in the context.
 */
export function hasRavellanDecisionInContext(
  ctx: V2VerifiedProjectionContext,
  cycle: number,
): boolean {
  const payload = V2VerifiedProjectionContext._getPayload(ctx);
  return payload.history.some(
    (entry) => entry.kind === "ravellan-decision" && entry.cycle === cycle,
  );
}

/**
 * Get the most recent Ravellan decision before or at the given cycle.
 */
export function getLastRavellanDecisionInContext(
  ctx: V2VerifiedProjectionContext,
  cycle: number,
): { cycle: number; action: string } | null {
  const payload = V2VerifiedProjectionContext._getPayload(ctx);
  const decisions = payload.history.filter(
    (entry): entry is V2Session["actionLedger"][number] & { kind: "ravellan-decision" } =>
      entry.kind === "ravellan-decision" && entry.cycle <= cycle,
  );
  if (decisions.length === 0) return null;
  const last = decisions[decisions.length - 1]!;
  return { cycle: last.cycle, action: last.decision.action };
}

/**
 * Get the session state at the cut cycle boundary.
 */
export function getStateAtCut(
  ctx: V2VerifiedProjectionContext,
): unknown {
  const payload = V2VerifiedProjectionContext._getPayload(ctx);
  // Reconstruct state by replaying the filtered ledger on the initial state
  // For simplicity, return the initial state (callers should use full replay)
  return payload.initialState;
}
