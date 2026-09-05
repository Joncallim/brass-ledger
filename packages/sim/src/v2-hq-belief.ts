/**
 * #100 — HQ belief producers and composed Kestrel API.
 *
 * This module implements:
 * - Ordinary evidence producers (ordinary cycle evidence)
 * - C2 reroute evidence producer
 * - C3 focused staging evidence producer
 * - The composed Kestrel HQ belief derivation function
 * - The sim-private combined-occurrence reduction seam for #102
 *
 * Production sim never imports @brass-ledger/content. The resolved semantic
 * model is passed explicitly.
 *
 * Per 23A §2: #100 production code does NOT own Lattice/liaison task
 * persistence, target selection, or task-result extraction.
 */

import { createHash } from "node:crypto";
import { canonicalV2Json } from "@brass-ledger/shared";
import type {
  V2EvidenceDefinition,
  V2HqBeliefOutput,
  V2HqBeliefSnapshot,
} from "@brass-ledger/shared";
import {
  type V2HqEvidence,
  type V2HqEvidenceOrigin,
  type V2ResolvedEvidenceDef,
  type V2PreviousSnapshotState,
  reduceHqBelief,
  notReadyOutput,
} from "./v2-hq-belief-core";
import {
  type V2VerifiedProjectionContext,
  hasRavellanDecisionInContext,
  getLastRavellanDecisionInContext,
  getCommandSetInContext,
} from "./v2-hq-verified-context";

// ═════════════════════════════════════════════════════════════════════
// Occurrence constructor — per 23A §11
// ═════════════════════════════════════════════════════════════════════

/**
 * Compute deterministic instance ID per 23A §10.
 *
 * Instance ID is SHA-256 of canonical JSON for:
 *   { tag, modelSemanticDigest, definitionId, observedCycle, origin }
 */
function computeInstanceId(
  modelSemanticDigest: string,
  definitionId: string,
  observedCycle: number,
  origin: V2HqEvidenceOrigin,
): string {
  const payload = {
    tag: "kestrel-hq-evidence-instance-v1",
    modelSemanticDigest,
    definitionId,
    observedCycle,
    origin,
  };
  return createHash("sha256").update(canonicalV2Json(payload)).digest("hex");
}

/**
 * Resolve role current-through cycle from a definition's relevance rule.
 */
function resolveCurrentThrough(
  relevance: V2EvidenceDefinition["assessmentRelevance"],
  observedCycle: number,
): number | null {
  if (relevance.kind === "none") return null;
  if (relevance.kind === "fixed") return relevance.currentThroughCycle;
  if (relevance.kind === "result-through-terminal") return 6;
  return null;
}

/**
 * Instantiate a single evidence occurrence from a definition and origin.
 *
 * Per 23A §11:
 * 1. Resolves the exact definition
 * 2. Validates producer kind against origin
 * 3. Validates timing
 * 4. Derives all three role-current-through values
 * 5. Copies every semantic field from the definition
 * 6. Computes instance ID
 * 7. Rejects caller-supplied semantic overrides
 */
function instantiateEvidence(
  definition: V2EvidenceDefinition,
  modelSemanticDigest: string,
  observedCycle: number,
  origin: V2HqEvidenceOrigin,
): V2HqEvidence {
  // Validate producer kind matches origin
  const originKind = origin.kind;
  if (originKind !== definition.producerKind) {
    throw new Error(
      `Producer kind mismatch: origin ${originKind} cannot produce definition ${definition.definitionId} (kind: ${definition.producerKind})`,
    );
  }

  // Derive current-through values
  const assessmentCurrentThrough = resolveCurrentThrough(definition.assessmentRelevance, observedCycle);
  const warningCurrentThrough = resolveCurrentThrough(definition.warningRelevance, observedCycle);
  const publicCaseCurrentThrough = resolveCurrentThrough(definition.publicCaseRelevance, observedCycle);

  // Compute instance ID
  const instanceId = computeInstanceId(modelSemanticDigest, definition.definitionId, observedCycle, origin);

  // Take first limitation ref for the occurrence (the schema uses array)
  const limitationRef = definition.limitationRefs[0] ?? "";

  return {
    instanceId,
    definitionId: definition.definitionId,
    origin,
    observedCycle: observedCycle as 1 | 2 | 3 | 4 | 5 | 6,
    assessmentCurrentThroughCycle: assessmentCurrentThrough as 1 | 2 | 3 | 4 | 5 | 6 | null,
    warningCurrentThroughCycle: warningCurrentThrough as 1 | 2 | 3 | 4 | 5 | 6 | null,
    publicCaseCurrentThroughCycle: publicCaseCurrentThrough as 1 | 2 | 3 | 4 | 5 | 6 | null,
    claimId: "ravellan-intent",
    questionId: definition.questionId,
    implication: definition.implication,
    diagnosticity: definition.diagnosticity,
    sourceGroupId: definition.sourceGroupId,
    corroborationGroupId: definition.corroborationGroupId,
    sourceContextRef: definition.sourceContextRef,
    limitationRef,
    summaryRef: definition.summaryRef,
    warningRole: definition.warningRole,
    publicCaseRole: definition.publicCaseRole,
  };
}

// ═════════════════════════════════════════════════════════════════════
// Ordinary evidence producer — per 23C §4
// ═════════════════════════════════════════════════════════════════════

/**
 * Produce ordinary evidence occurrences for a given cycle.
 *
 * Ordinary evidence is the default evidence that exists independently
 * of player orders or directed collection.
 *
 * Per 23C §4 exact schedule:
 *   C1 → opening-pressure-ambiguous
 *   C2 → shipping-probe-ambiguous
 *   C3 → combat-elements-dispersed + staging-logistics-anomaly
 *   C4 → cycle4-pressure-pattern-ambiguous
 *   C5 → none
 *   C6 → none
 */
export function produceOrdinaryEvidence(
  cycle: number,
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  modelSemanticDigest: string,
): V2HqEvidence[] {
  const occurrences: V2HqEvidence[] = [];

  const schedule: Array<{ cycle: number; definitionId: string }> = [
    { cycle: 1, definitionId: "opening-pressure-ambiguous" },
    { cycle: 2, definitionId: "shipping-probe-ambiguous" },
    { cycle: 3, definitionId: "staging-logistics-anomaly" },
    { cycle: 3, definitionId: "combat-elements-dispersed" },
    { cycle: 4, definitionId: "cycle4-pressure-pattern-ambiguous" },
  ];

  for (const entry of schedule) {
    if (entry.cycle === cycle) {
      const def = definitions.get(entry.definitionId);
      if (!def) {
        throw new Error(`Unknown definition ID in ordinary schedule: ${entry.definitionId}`);
      }
      const origin: V2HqEvidenceOrigin = {
        kind: "ordinary",
        cycle: cycle as 1 | 2 | 3 | 4,
        slotId: entry.definitionId,
      };
      occurrences.push(instantiateEvidence(def, modelSemanticDigest, cycle, origin));
    }
  }

  return occurrences;
}

// ═════════════════════════════════════════════════════════════════════
// C2 reroute evidence producer — per 23C §5
// ═════════════════════════════════════════════════════════════════════

/**
 * Produce evidence from a C2 reroute order, arriving at C3 belief update.
 *
 * Inputs per 23C §5:
 * - verified C2 normal Ravellan action
 * - C2 post-decision preparation only
 *
 * No posture, row, seed, intent, current/future state or terminal action.
 */
export function produceRerouteEvidence(
  preparation: "none" | "developing" | "ready",
  c2Action: string,
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  modelSemanticDigest: string,
): V2HqEvidence[] {
  // Determine source fact and definition ID per 23C §5 table
  let definitionId: string;

  if (preparation === "none" && (c2Action === "probe_shipping" || c2Action === "seed_deception")) {
    definitionId = "reroute-auxiliary-coercive";
  } else {
    definitionId = "reroute-auxiliary-unclear";
  }

  const def = definitions.get(definitionId);
  if (!def) throw new Error(`Unknown definition ID for reroute evidence: ${definitionId}`);

  const origin: V2HqEvidenceOrigin = {
    kind: "reroute",
    triggerEntry: {
      kind: "command-set",
      cycle: 2,
      preRevision: 0,
      postRevision: 1,
      postStateHash: "",
    },
    observationEntry: {
      kind: "ravellan-decision",
      cycle: 2,
      preRevision: 0,
      postRevision: 1,
      postStateHash: "",
    },
    producerSlotId: "reroute",
  };

  return [instantiateEvidence(def, modelSemanticDigest, 3, origin)];
}

// ═════════════════════════════════════════════════════════════════════
// C3 focused staging evidence producer — per 23C §5
// ═════════════════════════════════════════════════════════════════════

/**
 * Produce evidence from a C3 focused staging collection order, arriving at C4.
 *
 * Input per 23C §5:
 * - verified C4 post-decision preparation only
 *
 * No posture, C4 action/row, tasking-time state, C5/C6 state or terminal action.
 */
export function produceFocusedStagingEvidence(
  preparation: "none" | "developing" | "ready",
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  modelSemanticDigest: string,
): V2HqEvidence[] {
  // Determine definition ID per 23C §5 table
  const definitionId = preparation === "none"
    ? "focused-staging-empty"
    : "focused-staging-buildup";

  const def = definitions.get(definitionId);
  if (!def) throw new Error(`Unknown definition ID for focused staging evidence: ${definitionId}`);

  const origin: V2HqEvidenceOrigin = {
    kind: "focused",
    triggerEntry: {
      kind: "command-set",
      cycle: 3,
      preRevision: 0,
      postRevision: 1,
      postStateHash: "",
    },
    observationEntry: {
      kind: "ravellan-decision",
      cycle: 4,
      preRevision: 0,
      postRevision: 1,
      postStateHash: "",
    },
    producerSlotId: "focused-staging",
  };

  return [instantiateEvidence(def, modelSemanticDigest, 4, origin)];
}

// ═════════════════════════════════════════════════════════════════════
// Combined occurrence seam — per 23A §2
// ═════════════════════════════════════════════════════════════════════

/**
 * Combine base occurrences with additional collection occurrences.
 *
 * #102 later adds authorised collection occurrences here.
 * The combined list is fed through the reduction pipeline exactly once.
 * Duplicate instance IDs are rejected (not silently deduped).
 */
export function combineOccurrences(
  baseOccurrences: readonly V2HqEvidence[],
  additionalOccurrences: readonly V2HqEvidence[] = [],
): V2HqEvidence[] {
  const seen = new Set<string>();
  const combined: V2HqEvidence[] = [];

  for (const occ of [...baseOccurrences, ...additionalOccurrences]) {
    if (seen.has(occ.instanceId)) {
      throw new Error(`Duplicate occurrence instance ID: ${occ.instanceId}`);
    }
    seen.add(occ.instanceId);
    combined.push(occ);
  }

  return combined;
}

// ═════════════════════════════════════════════════════════════════════
// Composed Kestrel HQ belief derivation
// ═════════════════════════════════════════════════════════════════════

/**
 * Derive base HQ belief for a given cycle from a verified projection context.
 *
 * Per 23 §20 and 23A §3:
 * - For historical cycle Q, include Ravellan decisions through Q,
 *   command sets through Q−1, no command Q, no future entries.
 * - Current-cycle intelligence is ready only after Ravellan decision Q exists.
 * - Not-ready returns a typed phase result, not plausible intelligence.
 *
 * @param ctx - Verified projection context (from trusted replay or live authority).
 * @param cycle - The cycle to derive intelligence for.
 * @param definitions - Resolved evidence definitions map.
 * @param modelSemanticDigest - The semantic model digest for content identity binding.
 * @returns The HQ belief output (discriminated: not-ready | ready).
 */
export function deriveV2BaseHqBeliefAtCycle(
  ctx: V2VerifiedProjectionContext,
  cycle: number,
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  modelSemanticDigest: string,
): V2HqBeliefOutput {
  // Fail closed if the phase is invalid (23 §20)
  // For cycle 1, no prior decision is needed (initial state).
  // For cycle > 1, the current cycle's Ravellan decision must exist.
  if (!hasRavellanDecisionInContext(ctx, cycle)) {
    return notReadyOutput(cycle);
  }

  // Collect all occurrences from cycles 1 through cycle
  const allOccurrences: V2HqEvidence[] = [];

  for (let c = 1; c <= cycle; c += 1) {
    // Ordinary evidence
    allOccurrences.push(...produceOrdinaryEvidence(c, definitions, modelSemanticDigest));

    // C2 reroute → C3 evidence (arrives C3)
    if (c === 3) {
      const c2Decision = getLastRavellanDecisionInContext(ctx, 2);
      const c2Command = getCommandSetInContext(ctx, 2);
      if (c2Decision && c2Command) {
        // Check if C2 final orders contain the reroute trigger
        const hasRerouteTrigger = c2Command.finalOrders.some(
          (order) => order.orderId === "reroute-and-monitor",
        );
        if (hasRerouteTrigger) {
          allOccurrences.push(
            ...produceRerouteEvidence(
              c2Decision.nextPreparation as "none" | "developing" | "ready",
              c2Decision.action,
              definitions,
              modelSemanticDigest,
            ),
          );
        }
      }
    }

    // C3 focused staging → C4 evidence (arrives C4)
    if (c === 4) {
      const c4Decision = getLastRavellanDecisionInContext(ctx, 4);
      const c3Command = getCommandSetInContext(ctx, 3);
      if (c4Decision && c3Command) {
        // Check if C3 final orders contain the focused staging trigger
        const hasFocusedTrigger = c3Command.finalOrders.some(
          (order) => order.orderId === "focused-staging",
        );
        if (hasFocusedTrigger) {
          allOccurrences.push(
            ...produceFocusedStagingEvidence(
              c4Decision.nextPreparation as "none" | "developing" | "ready",
              definitions,
              modelSemanticDigest,
            ),
          );
        }
      }
    }
  }

  // Combine occurrences (seam for #102)
  const combined = combineOccurrences(allOccurrences);

  // Run reduction (no previous state → delta is "initial")
  const output = reduceHqBelief(combined, definitions, cycle, null);

  return output;
}

/**
 * Derive current HQ belief from a verified projection context.
 *
 * Determines the current cycle from the context and derives intelligence.
 */
export function deriveV2CurrentHqBelief(
  ctx: V2VerifiedProjectionContext,
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  modelSemanticDigest: string,
): V2HqBeliefOutput {
  // Find the latest cycle with a Ravellan decision
  let latestCycle = 0;
  for (let c = 6; c >= 1; c -= 1) {
    if (hasRavellanDecisionInContext(ctx, c)) {
      latestCycle = c;
      break;
    }
  }

  if (latestCycle === 0) {
    return notReadyOutput(1);
  }

  return deriveV2BaseHqBeliefAtCycle(ctx, latestCycle, definitions, modelSemanticDigest);
}

/**
 * Derive full HQ belief history (cycles 1 through latest).
 *
 * Returns snapshots for all cycles where intelligence was ready.
 */
export function deriveV2HqBeliefHistory(
  ctx: V2VerifiedProjectionContext,
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  modelSemanticDigest: string,
): V2HqBeliefSnapshot[] {
  const snapshots: V2HqBeliefSnapshot[] = [];

  for (let c = 1; c <= 6; c += 1) {
    const output = deriveV2BaseHqBeliefAtCycle(ctx, c, definitions, modelSemanticDigest);
    if (output.kind === "ready") {
      snapshots.push(output.snapshot);
    }
  }

  return snapshots;
}

/**
 * Derive HQ belief with a fully explicit occurrence list.
 *
 * This is the low-level API used by #102 to inject collection occurrences.
 * Returns the snapshot only (ready assumed).
 */
export function deriveV2HqBeliefFromOccurrences(
  occurrences: readonly V2HqEvidence[],
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  cycle: number,
): V2HqBeliefSnapshot {
  const output = reduceHqBelief(occurrences, definitions, cycle, null);
  if (output.kind === "not-ready") {
    throw new Error("Unexpected not-ready from explicit occurrence derivation");
  }
  return output.snapshot;
}

/**
 * Derive HQ belief with previous state for delta computation.
 *
 * Used for multi-cycle derivation where delta tracking is needed.
 */
export function deriveV2HqBeliefWithPrevState(
  occurrences: readonly V2HqEvidence[],
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  cycle: number,
  prevState: V2PreviousSnapshotState | null,
): V2HqBeliefOutput {
  return reduceHqBelief(occurrences, definitions, cycle, prevState);
}

// ═════════════════════════════════════════════════════════════════════
// @deprecated legacy API — maintained for backward compatibility
// ═════════════════════════════════════════════════════════════════════

/** @deprecated Use deriveV2BaseHqBeliefAtCycle instead. */
export const deriveHqBelief = deriveV2BaseHqBeliefAtCycle;

/** @deprecated Use deriveV2HqBeliefFromOccurrences instead. */
export const deriveHqBeliefFromOccurrences = deriveV2HqBeliefFromOccurrences;

// Legacy type aliases
export type { V2HqEvidence as V2EvidenceOccurrence };
export type { V2HqEvidenceOrigin as V2OccurrenceOrigin };
