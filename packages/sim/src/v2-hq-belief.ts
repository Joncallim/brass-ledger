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
 */

import { createHash } from "node:crypto";
import { canonicalV2Json, type V2HqBeliefOutput, type V2RavellanDecision, type V2RavellanPreparation } from "@brass-ledger/shared";
import {
  type V2EvidenceOccurrence,
  type V2OccurrenceOrigin,
  type V2ResolvedEvidenceDef,
  type V2PreviousBeliefState,
  reduceHqBelief,
  notReadyOutput,
} from "./v2-hq-belief-core";
import {
  type V2VerifiedProjectionContext,
  hasRavellanDecisionInContext,
} from "./v2-hq-verified-context";

// ─── Occurrence identity ─────────────────────────────────────────────

/**
 * Deterministic collision-resistant occurrence ID.
 *
 * Uses: model digest prefix + definition ID + observed cycle + origin digest.
 */
function computeOccurrenceId(
  definitionId: string,
  observedCycle: number,
  origin: V2OccurrenceOrigin,
): string {
  const originDigest = createHash("sha256")
    .update(canonicalV2Json(origin))
    .digest("hex")
    .slice(0, 16);
  return `${definitionId}@c${observedCycle}:${originDigest}`;
}

// ─── Ordinary evidence producer ──────────────────────────────────────

/**
 * Produce ordinary evidence occurrences for a given cycle.
 *
 * Ordinary evidence is the default evidence that exists independently
 * of player orders or directed collection.
 */
export function produceOrdinaryEvidence(cycle: number): V2EvidenceOccurrence[] {
  const occurrences: V2EvidenceOccurrence[] = [];
  const origin: V2OccurrenceOrigin = { kind: "ordinary" };

  switch (cycle) {
    case 1:
      occurrences.push({
        occurrenceId: computeOccurrenceId("opening-pressure-ambiguous", 1, origin),
        definitionId: "opening-pressure-ambiguous",
        implication: "ambiguous",
        observedCycle: 1,
        origin,
      });
      break;

    case 2:
      occurrences.push({
        occurrenceId: computeOccurrenceId("shipping-probe-ambiguous", 2, origin),
        definitionId: "shipping-probe-ambiguous",
        implication: "ambiguous",
        observedCycle: 2,
        origin,
      });
      break;

    case 3:
      // Mandatory conflicting bundle
      occurrences.push({
        occurrenceId: computeOccurrenceId("staging-logistics-anomaly", 3, origin),
        definitionId: "staging-logistics-anomaly",
        implication: "preparation",
        observedCycle: 3,
        origin,
      });
      occurrences.push({
        occurrenceId: computeOccurrenceId("combat-elements-dispersed", 3, origin),
        definitionId: "combat-elements-dispersed",
        implication: "coercion",
        observedCycle: 3,
        origin,
      });
      break;

    case 4:
      occurrences.push({
        occurrenceId: computeOccurrenceId("cycle4-pressure-pattern-ambiguous", 4, origin),
        definitionId: "cycle4-pressure-pattern-ambiguous",
        implication: "ambiguous",
        observedCycle: 4,
        origin,
      });
      break;
  }

  return occurrences;
}

// ─── C2 reroute evidence producer ────────────────────────────────────

/**
 * Produce evidence from a C2 reroute order, arriving at C3 belief update.
 *
 * Reads:
 * - seizure-preparation state immediately after the C2 Ravellan decision
 * - verified C2 normal Ravellan action
 */
export function produceRerouteEvidence(
  preparation: V2RavellanPreparation,
  c2Action: string,
): V2EvidenceOccurrence[] {
  const origin: V2OccurrenceOrigin = { kind: "reroute" };

  if (preparation === "developing" || preparation === "ready") {
    if (c2Action === "probe_shipping") {
      return [{
        occurrenceId: computeOccurrenceId("reroute-auxiliary-integrated", 3, origin),
        definitionId: "reroute-auxiliary-integrated",
        implication: "preparation",
        observedCycle: 3,
        origin,
      }];
    }
    return [{
      occurrenceId: computeOccurrenceId("reroute-auxiliary-unclear", 3, origin),
      definitionId: "reroute-auxiliary-unclear",
      implication: "ambiguous",
      observedCycle: 3,
      origin,
    }];
  }

  // preparation === "none"
  if (c2Action === "probe_shipping" || c2Action === "seed_deception") {
    return [{
      occurrenceId: computeOccurrenceId("reroute-auxiliary-coercive", 3, origin),
      definitionId: "reroute-auxiliary-coercive",
      implication: "coercion",
      observedCycle: 3,
      origin,
    }];
  }

  return [{
    occurrenceId: computeOccurrenceId("reroute-auxiliary-unclear", 3, origin),
    definitionId: "reroute-auxiliary-unclear",
    implication: "ambiguous",
    observedCycle: 3,
    origin,
  }];
}

// ─── C3 focused staging evidence producer ────────────────────────────

/**
 * Produce evidence from a C3 focused staging collection order, arriving at C4.
 *
 * Reads seizure preparation only (not posture).
 */
export function produceFocusedStagingEvidence(
  preparation: V2RavellanPreparation,
): V2EvidenceOccurrence[] {
  const origin: V2OccurrenceOrigin = { kind: "focused-staging" };

  if (preparation === "developing" || preparation === "ready") {
    return [{
      occurrenceId: computeOccurrenceId("focused-staging-buildup", 4, origin),
      definitionId: "focused-staging-buildup",
      implication: "preparation",
      observedCycle: 4,
      origin,
    }];
  }

  return [{
    occurrenceId: computeOccurrenceId("focused-staging-empty", 4, origin),
    definitionId: "focused-staging-empty",
    implication: "coercion",
    observedCycle: 4,
    origin,
  }];
}

// ─── Sim-private combined-occurrence seam ────────────────────────────

/**
 * Combine base occurrences with additional collection occurrences.
 *
 * #102 later adds authorised collection occurrences here.
 * The combined list is fed through the reduction pipeline exactly once.
 */
export function combineOccurrences(
  baseOccurrences: readonly V2EvidenceOccurrence[],
  additionalOccurrences: readonly V2EvidenceOccurrence[] = [],
): V2EvidenceOccurrence[] {
  const seen = new Set<string>();
  const combined: V2EvidenceOccurrence[] = [];

  for (const occ of [...baseOccurrences, ...additionalOccurrences]) {
    if (!seen.has(occ.occurrenceId)) {
      seen.add(occ.occurrenceId);
      combined.push(occ);
    }
  }

  return combined;
}

// ─── Previous state persistence (private) ────────────────────────────

/**
 * Simple in-memory store for previous belief state.
 * This is NOT persisted; it is reconstructed from the ledger on replay.
 */
const previousBeliefStore = new Map<string, V2PreviousBeliefState>();

function loadPreviousBelief(sessionKey: string): V2PreviousBeliefState | null {
  return previousBeliefStore.get(sessionKey) ?? null;
}

function savePreviousBelief(sessionKey: string, state: V2PreviousBeliefState): void {
  previousBeliefStore.set(sessionKey, state);
}

// ─── Composed Kestrel HQ belief derivation ───────────────────────────

/**
 * Derive HQ belief for a given cycle from a verified projection context.
 *
 * This is the main entry point for #100 intelligence derivation.
 * The resolved definitions map is passed explicitly (production sim never
 * imports @brass-ledger/content).
 *
 * @param ctx - Verified projection context (from trusted replay or live authority).
 * @param cycle - The cycle to derive intelligence for.
 * @param sessionKey - A unique key for the session (used for delta tracking).
 * @param definitions - Resolved evidence definitions map.
 * @param rerouteOrdered - Whether the C2 reroute order was given.
 * @param focusedStagingOrdered - Whether the C3 focused staging order was given.
 * @param ravellanDecision - The Ravellan decision for the previous cycle (if available).
 * @returns The HQ belief output.
 */
export function deriveHqBelief(
  ctx: V2VerifiedProjectionContext,
  cycle: number,
  sessionKey: string,
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  rerouteOrdered: boolean,
  focusedStagingOrdered: boolean,
  ravellanDecision?: V2RavellanDecision,
): V2HqBeliefOutput {
  // Fail closed if the current cycle's Ravellan decision doesn't exist yet
  if (!hasRavellanDecisionInContext(ctx, cycle)) {
    return notReadyOutput(cycle);
  }

  // Collect base occurrences from ordinary evidence
  const ordinaryOccurrences: V2EvidenceOccurrence[] = [];
  for (let c = 1; c <= cycle; c += 1) {
    ordinaryOccurrences.push(...produceOrdinaryEvidence(c));
  }

  // Add reroute evidence if ordered (arrives C3)
  if (rerouteOrdered && cycle >= 3 && ravellanDecision) {
    const rerouteEvidence = produceRerouteEvidence(
      ravellanDecision.nextPreparation,
      ravellanDecision.action,
    );
    ordinaryOccurrences.push(...rerouteEvidence);
  }

  // Add focused staging evidence if ordered (arrives C4)
  if (focusedStagingOrdered && cycle >= 4 && ravellanDecision) {
    const stagingEvidence = produceFocusedStagingEvidence(
      ravellanDecision.nextPreparation,
    );
    ordinaryOccurrences.push(...stagingEvidence);
  }

  // Combine occurrences (seam for #102)
  const allOccurrences = combineOccurrences(ordinaryOccurrences);

  // Load previous state for delta computation
  const prevState = loadPreviousBelief(sessionKey);

  // Run reduction
  const output = reduceHqBelief(allOccurrences, definitions, cycle, prevState);

  // Save current state as previous for next cycle
  savePreviousBelief(sessionKey, {
    assessment: output.brief.assessment,
    basisPattern: output.basisPattern,
    warning: output.brief.warning,
    warningBasisIds: output.brief.warningBasis.map((s) => s.definitionId),
    publicCase: output.brief.publicCase,
    publicCaseDirection: output.brief.publicCaseDirection,
    publicCaseBasisIds: output.brief.publicCaseBasis.map((s) => s.definitionId),
    supersededIds: output.delta.newlySupersededIds,
  });

  return output;
}

/**
 * Derive HQ belief with a fully explicit occurrence list.
 *
 * This is the low-level API used by #102 to inject collection occurrences.
 */
export function deriveHqBeliefFromOccurrences(
  occurrences: readonly V2EvidenceOccurrence[],
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  cycle: number,
  sessionKey: string,
): V2HqBeliefOutput {
  const prevState = loadPreviousBelief(sessionKey);
  const output = reduceHqBelief(occurrences, definitions, cycle, prevState);

  savePreviousBelief(sessionKey, {
    assessment: output.brief.assessment,
    basisPattern: output.basisPattern,
    warning: output.brief.warning,
    warningBasisIds: output.brief.warningBasis.map((s) => s.definitionId),
    publicCase: output.brief.publicCase,
    publicCaseDirection: output.brief.publicCaseDirection,
    publicCaseBasisIds: output.brief.publicCaseBasis.map((s) => s.definitionId),
    supersededIds: output.delta.newlySupersededIds,
  });

  return output;
}
