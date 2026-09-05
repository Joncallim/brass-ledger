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
 *
 * The constructor is module-private (not exported). External code receives
 * only the opaque handle type and must use the factory functions.
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
  readonly initialState: Readonly<Record<string, unknown>>;
  /** SHA-256 digest of the initial state for tamper detection. */
  readonly initialStateDigest: string;
  /** Canonical JSON of the full trusted history for comparison. */
  readonly historyDigest: string;
  /** Provenance marker — set by trusted factory only. */
  readonly provenance: "trusted-replay" | "live-authority";
};

// ─── WeakMap storage (module-private) ────────────────────────────────

const privateStore = new WeakMap<object, VerifiedContextPayload>();

// ─── Opaque handle (constructor NOT exported) ────────────────────────

/**
 * Opaque handle to verified session history.
 *
 * The public type exposes no ledger/state fields. Callers can only pass
 * it to sim derivation APIs.
 *
 * Constructor uses a private brand token that is only available inside this module.
 * External code cannot construct a valid handle.
 */
/** Module-private brand symbol — only available inside this module. */
const CONTEXT_BRAND: unique symbol = Symbol("V2VerifiedProjectionContext");

export class V2VerifiedProjectionContext {
  /** @internal */
  constructor(
    payload: VerifiedContextPayload,
    brand: typeof CONTEXT_BRAND,
  ) {
    if (brand !== CONTEXT_BRAND) {
      throw new Error("V2VerifiedProjectionContext cannot be constructed outside the module");
    }
    privateStore.set(this, payload);
  }

}

/** @internal Module-level accessor for sim-internal use only. Not exported from barrel. */
function getPayload(ctx: V2VerifiedProjectionContext): VerifiedContextPayload {
  const payload = privateStore.get(ctx);
  if (!payload) throw new Error("V2VerifiedProjectionContext payload is not available (forged handle?)");
  return payload;

}

// ─── Deep recursive freeze helper ───────────────────────────────────

/** Recursively freeze a value and all nested objects/arrays. */
function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
    return Object.freeze(value) as unknown as T;
  }
  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) deepFreeze(obj[key]);
  return Object.freeze(obj) as T;
}

// ─── Factories ───────────────────────────────────────────────────────

/**
 * Construct a verified projection context from a trusted replay-validated session.
 *
 * @param session - The canonical session returned by validateV2ReplaySkeleton(...).
 * @param cutCycle - The cycle to cut at. Historical cycles [1, cutCycle) are
 *   included. Ravellan decisions through cutCycle are included.
 * @returns An opaque verified context.
 * @throws If the session is not replay-validated (provenance check).
 */
export function createVerifiedProjectionContext(
  session: V2Session,
  cutCycle: number,
): V2VerifiedProjectionContext {
  // Deep clone the session to prevent mutation
  const clonedSession: V2Session = JSON.parse(JSON.stringify(session));

  // Filter ledger entries for historical cycle Q:
  // - intent declaration always included
  // - Ravellan decisions through cutCycle (<=) included
  // - command sets through cutCycle-1 (<) included
  // - command cutCycle and future entries excluded
  const filteredLedger = clonedSession.actionLedger.filter((entry) => {
    if (entry.kind === "intent-declaration") return true;
    if (entry.kind === "ravellan-decision") return entry.cycle <= cutCycle;
    if (entry.kind === "command-set") return entry.commandSet.cycle < cutCycle;
    return false;
  });

  // Recursively freeze the filtered ledger
  const frozenLedger = deepFreeze(filteredLedger);

  // Compute digests
  const historyDigest = canonicalV2Json(frozenLedger);
  const initialStateDigest = clonedSession.initialStateDigest;

  const payload: VerifiedContextPayload = {
    history: frozenLedger as V2Session["actionLedger"],
    cutCycle,
    initialState: deepFreeze(JSON.parse(JSON.stringify(clonedSession.initialState))),
    initialStateDigest,
    historyDigest,
    provenance: "trusted-replay",
  };

  return new V2VerifiedProjectionContext(payload, CONTEXT_BRAND);
}

/**
 * Construct a verified projection context from sim-owned live authority.
 * This is an internal factory for live game sessions, not for replay.
 */
export function createLiveProjectionContext(
  session: V2Session,
  cutCycle: number,
): V2VerifiedProjectionContext {
  const clonedSession: V2Session = JSON.parse(JSON.stringify(session));

  const filteredLedger = clonedSession.actionLedger.filter((entry) => {
    if (entry.kind === "intent-declaration") return true;
    if (entry.kind === "ravellan-decision") return entry.cycle <= cutCycle;
    if (entry.kind === "command-set") return entry.commandSet.cycle < cutCycle;
    return false;
  });

  const frozenLedger = deepFreeze(filteredLedger);
  const historyDigest = canonicalV2Json(frozenLedger);
  const initialStateDigest = clonedSession.initialStateDigest;

  const payload: VerifiedContextPayload = {
    history: frozenLedger as V2Session["actionLedger"],
    cutCycle,
    initialState: deepFreeze(JSON.parse(JSON.stringify(clonedSession.initialState))),
    initialStateDigest,
    historyDigest,
    provenance: "live-authority",
  };

  return new V2VerifiedProjectionContext(payload, CONTEXT_BRAND);
}

// ─── Query helpers ───────────────────────────────────────────────────

/**
 * Check whether a Ravellan decision exists for a given cycle in the context.
 */
export function hasRavellanDecisionInContext(
  ctx: V2VerifiedProjectionContext,
  cycle: number,
): boolean {
  const payload = getPayload(ctx);
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
): { cycle: number; action: string; nextPreparation: string; nextPosture: string } | null {
  const payload = getPayload(ctx);
  const decisions = payload.history.filter(
    (entry): entry is V2Session["actionLedger"][number] & { kind: "ravellan-decision" } =>
      entry.kind === "ravellan-decision" && entry.cycle <= cycle,
  );
  if (decisions.length === 0) return null;
  const last = decisions[decisions.length - 1]!;
  return {
    cycle: last.cycle,
    action: last.decision.action,
    nextPreparation: last.decision.nextPreparation,
    nextPosture: last.decision.nextPosture,
  };
}
export function getCommandSetInContext(
  ctx: V2VerifiedProjectionContext,
  cycle: number,
): V2Session["actionLedger"][number] & { kind: "command-set" } | null {
  const payload = getPayload(ctx);
  const entries = payload.history.filter(
    (entry): entry is V2Session["actionLedger"][number] & { kind: "command-set" } =>
      entry.kind === "command-set" && entry.commandSet.cycle === cycle,
  );
  return entries[0] ?? null;
}

/**
 * Get the cycle of the most recent command set in the context.
 */
export function getLatestCommandCycle(
  ctx: V2VerifiedProjectionContext,
): number | null {
  const payload = getPayload(ctx);
  const commands = payload.history.filter(
    (entry): entry is V2Session["actionLedger"][number] & { kind: "command-set" } =>
      entry.kind === "command-set",
  );
  if (commands.length === 0) return null;
  return commands[commands.length - 1]!.commandSet.cycle;
}

/**
 * Get the provenance of the context.
 */
export function getContextProvenance(
  ctx: V2VerifiedProjectionContext,
): "trusted-replay" | "live-authority" {
  const payload = getPayload(ctx);
  return payload.provenance;
}
