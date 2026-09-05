/**
 * #100 — Kestrel HQ belief model v1.
 *
 * Exact 19 evidence definitions from 23C §2.
 * Content-owned semantic catalog. Lattice/liaison target defaults and
 * task-policy semantics belong to #102 (kestrel-collection-v1).
 *
 * This module never imports sim. The #100 model is a content-owned
 * semantic catalog; the sim receives an explicitly resolved bundle.
 */

import { createHash } from "node:crypto";
import {
  canonicalV2Json,
  v2EvidenceDefinitionSchema,
  type V2EvidenceDefinition,
  type V2EvidenceDefinitionId,
  type V2HqRelevanceRule,
} from "@brass-ledger/shared";

// ─── Helpers ────────────────────────────────────────────────────────

/** Fixed relevance rule helper. */
function fixed(observedCycle: number, currentThroughCycle: number): V2HqRelevanceRule {
  return { kind: "fixed", observedCycle, currentThroughCycle };
}

/** No relevance for a role. */
const noneRel: V2HqRelevanceRule = { kind: "none" };

/** Result-through-terminal relevance (for lattice/liaison results). */
const resultThroughTerminal: V2HqRelevanceRule = { kind: "result-through-terminal" };

// ─── Model identity ─────────────────────────────────────────────────

export const KESTREL_HQ_BELIEF_MODEL_ID = "kestrel-hq-belief-v1" as const;
export const KESTREL_HQ_BELIEF_SCENARIO_ID = "kestrel-strait" as const;
export const KESTREL_HQ_BELIEF_REDUCER_ID = "kestrel-binary-hypothesis-v1" as const;

// ─── Exact 19 definitions per 23C §2 ───────────────────────────────

function def(
  definitionId: V2EvidenceDefinitionId,
  questionId: "ravellan-intent-general" | "landing-force-staging" | "auxiliary-tasking" | "operational-sequence",
  producerKind: "ordinary" | "reroute" | "focused" | "lattice" | "liaison",
  implication: "preparation" | "coercion" | "ambiguous",
  diagnosticity: "indicator" | "diagnostic",
  sourceGroupId: string,
  corroborationGroupId: "physical-staging" | "auxiliary-tasking" | "operational-sequence" | "partner-liaison" | null,
  sourceContextRef: string,
  limitationRefs: string[],
  summaryRef: string,
  warningRole: "none" | "usable",
  publicCaseRole: "none" | "source-sensitive",
  assessmentRelevance: V2HqRelevanceRule,
  warningRelevance: V2HqRelevanceRule,
  publicCaseRelevance: V2HqRelevanceRule,
  supersessionPolicy: "explicit-only" | "replace-older-same-question",
  supersedesDefinitionIds: V2EvidenceDefinitionId[] = [],
): V2EvidenceDefinition {
  return v2EvidenceDefinitionSchema.parse({
    definitionId,
    claimId: "ravellan-intent" as const,
    questionId,
    producerKind,
    implication,
    diagnosticity,
    sourceGroupId,
    corroborationGroupId,
    sourceContextRef,
    limitationRefs,
    summaryRef,
    warningRole,
    publicCaseRole,
    assessmentRelevance,
    warningRelevance,
    publicCaseRelevance,
    supersessionPolicy,
    supersedesDefinitionIds,
  });
}

/** All 19 definition IDs in canonical order (lexical by ID). */
export const allEvidenceDefinitionIds: readonly V2EvidenceDefinitionId[] = [
  "cycle4-pressure-pattern-ambiguous",
  "combat-elements-dispersed",
  "focused-staging-buildup",
  "focused-staging-empty",
  "lattice-auxiliary-coercive",
  "lattice-auxiliary-mixed",
  "lattice-landing-concentration",
  "lattice-landing-dispersed",
  "lattice-sync-coercive-sequence",
  "lattice-sync-partial",
  "lattice-sync-preparation-sequence",
  "lattice-sync-preparation-signal",
  "liaison-auxiliary-coercive-links",
  "liaison-auxiliary-unclear",
  "opening-pressure-ambiguous",
  "reroute-auxiliary-coercive",
  "reroute-auxiliary-unclear",
  "shipping-probe-ambiguous",
  "staging-logistics-anomaly",
];

function evidenceDefinitionById(id: V2EvidenceDefinitionId): V2EvidenceDefinition {
  switch (id) {
    // ── 1. opening-pressure-ambiguous ──
    case "opening-pressure-ambiguous":
      return def(id, "ravellan-intent-general", "ordinary", "ambiguous", "indicator",
        "routine-opening-pressure", null,
        "intel.source.routine-opening",
        ["intel.limit.pressure-ambiguous"],
        "intel.evidence.opening-pressure",
        "none", "none",
        fixed(1, 2), noneRel, noneRel,
        "explicit-only");

    // ── 2. shipping-probe-ambiguous ──
    case "shipping-probe-ambiguous":
      return def(id, "ravellan-intent-general", "ordinary", "ambiguous", "indicator",
        "routine-maritime-pressure", null,
        "intel.source.routine-maritime",
        ["intel.limit.surface-only"],
        "intel.evidence.shipping-pressure",
        "none", "none",
        fixed(2, 3), noneRel, noneRel,
        "explicit-only");

    // ── 3. staging-logistics-anomaly ──
    case "staging-logistics-anomaly":
      return def(id, "ravellan-intent-general", "ordinary", "preparation", "indicator",
        "routine-regional-logistics", null,
        "intel.source.routine-logistics",
        ["intel.limit.logistics-indirect"],
        "intel.evidence.logistics-anomaly",
        "none", "none",
        fixed(3, 4), noneRel, noneRel,
        "explicit-only");

    // ── 4. combat-elements-dispersed ──
    case "combat-elements-dispersed":
      return def(id, "ravellan-intent-general", "ordinary", "coercion", "indicator",
        "routine-force-disposition", null,
        "intel.source.routine-disposition",
        ["intel.limit.routine-coverage"],
        "intel.evidence.combat-dispersed",
        "none", "none",
        fixed(3, 4), noneRel, noneRel,
        "explicit-only");

    // ── 5. cycle4-pressure-pattern-ambiguous ──
    case "cycle4-pressure-pattern-ambiguous":
      return def(id, "ravellan-intent-general", "ordinary", "ambiguous", "indicator",
        "routine-visible-pattern", null,
        "intel.source.visible-pattern",
        ["intel.limit.pattern-ambiguous"],
        "intel.evidence.pressure-pattern",
        "none", "none",
        fixed(4, 5), noneRel, noneRel,
        "explicit-only");

    // ── 6. reroute-auxiliary-coercive ──
    case "reroute-auxiliary-coercive":
      return def(id, "auxiliary-tasking", "reroute", "coercion", "indicator",
        "reroute-auxiliary-monitoring", null,
        "intel.source.reroute-monitoring",
        ["intel.limit.reroute-tasking-only"],
        "intel.evidence.reroute-coercive",
        "none", "none",
        fixed(3, 5), noneRel, noneRel,
        "replace-older-same-question");

    // ── 7. reroute-auxiliary-unclear ──
    case "reroute-auxiliary-unclear":
      return def(id, "auxiliary-tasking", "reroute", "ambiguous", "indicator",
        "reroute-auxiliary-monitoring", null,
        "intel.source.reroute-monitoring",
        ["intel.limit.reroute-tasking-only"],
        "intel.evidence.reroute-unclear",
        "none", "none",
        fixed(3, 5), noneRel, noneRel,
        "replace-older-same-question");

    // ── 8. focused-staging-buildup ──
    case "focused-staging-buildup":
      return def(id, "landing-force-staging", "focused", "preparation", "indicator",
        "focused-staging-collection", "physical-staging",
        "intel.source.focused-staging",
        ["intel.limit.focused-positive-intent", "intel.limit.focused-positive-warning"],
        "intel.evidence.focused-buildup",
        "usable", "source-sensitive",
        fixed(4, 6), fixed(4, 5), fixed(4, 6),
        "replace-older-same-question",
        ["combat-elements-dispersed"]);

    // ── 9. focused-staging-empty ──
    case "focused-staging-empty":
      return def(id, "landing-force-staging", "focused", "coercion", "indicator",
        "focused-staging-collection", "physical-staging",
        "intel.source.focused-staging",
        ["intel.limit.focused-negative-currency"],
        "intel.evidence.focused-empty",
        "none", "source-sensitive",
        fixed(4, 5), noneRel, fixed(4, 6),
        "replace-older-same-question",
        ["staging-logistics-anomaly"]);

    // ── 10. lattice-landing-concentration ──
    case "lattice-landing-concentration":
      return def(id, "landing-force-staging", "lattice", "preparation", "diagnostic",
        "lattice-landing-collection", "physical-staging",
        "intel.source.lattice-landing",
        ["intel.limit.landing-positive-timing"],
        "intel.evidence.lattice-landing-concentration",
        "usable", "source-sensitive",
        resultThroughTerminal, resultThroughTerminal, resultThroughTerminal,
        "replace-older-same-question");

    // ── 11. lattice-landing-dispersed ──
    case "lattice-landing-dispersed":
      return def(id, "landing-force-staging", "lattice", "coercion", "indicator",
        "lattice-landing-collection", "physical-staging",
        "intel.source.lattice-landing",
        ["intel.limit.landing-negative-pivot"],
        "intel.evidence.lattice-landing-dispersed",
        "none", "source-sensitive",
        resultThroughTerminal, noneRel, resultThroughTerminal,
        "replace-older-same-question");

    // ── 12. lattice-auxiliary-coercive ──
    case "lattice-auxiliary-coercive":
      return def(id, "auxiliary-tasking", "lattice", "coercion", "diagnostic",
        "lattice-auxiliary-collection", "auxiliary-tasking",
        "intel.source.lattice-auxiliary",
        ["intel.limit.auxiliary-current-tasking"],
        "intel.evidence.lattice-auxiliary-coercive",
        "none", "source-sensitive",
        resultThroughTerminal, noneRel, resultThroughTerminal,
        "replace-older-same-question");

    // ── 13. lattice-auxiliary-mixed ──
    case "lattice-auxiliary-mixed":
      return def(id, "auxiliary-tasking", "lattice", "ambiguous", "indicator",
        "lattice-auxiliary-collection", null,
        "intel.source.lattice-auxiliary",
        ["intel.limit.auxiliary-mixed"],
        "intel.evidence.lattice-auxiliary-mixed",
        "none", "none",
        resultThroughTerminal, noneRel, noneRel,
        "replace-older-same-question");

    // ── 14. lattice-sync-preparation-sequence ──
    case "lattice-sync-preparation-sequence":
      return def(id, "operational-sequence", "lattice", "preparation", "diagnostic",
        "lattice-sequence-analysis", "operational-sequence",
        "intel.source.lattice-sequence",
        ["intel.limit.sequence-window"],
        "intel.evidence.lattice-sequence-preparation",
        "none", "source-sensitive",
        resultThroughTerminal, noneRel, resultThroughTerminal,
        "explicit-only");

    // ── 15. lattice-sync-preparation-signal ──
    case "lattice-sync-preparation-signal":
      return def(id, "operational-sequence", "lattice", "preparation", "indicator",
        "lattice-sequence-analysis", "operational-sequence",
        "intel.source.lattice-sequence",
        ["intel.limit.sequence-single"],
        "intel.evidence.lattice-sequence-signal",
        "none", "source-sensitive",
        resultThroughTerminal, noneRel, resultThroughTerminal,
        "explicit-only");

    // ── 16. lattice-sync-coercive-sequence ──
    case "lattice-sync-coercive-sequence":
      return def(id, "operational-sequence", "lattice", "coercion", "indicator",
        "lattice-sequence-analysis", "operational-sequence",
        "intel.source.lattice-sequence",
        ["intel.limit.sequence-negative"],
        "intel.evidence.lattice-sequence-coercive",
        "none", "source-sensitive",
        resultThroughTerminal, noneRel, resultThroughTerminal,
        "explicit-only");

    // ── 17. lattice-sync-partial ──
    case "lattice-sync-partial":
      return def(id, "operational-sequence", "lattice", "ambiguous", "indicator",
        "lattice-sequence-analysis", null,
        "intel.source.lattice-sequence",
        ["intel.limit.sequence-partial"],
        "intel.evidence.lattice-sequence-partial",
        "none", "none",
        resultThroughTerminal, noneRel, noneRel,
        "explicit-only");

    // ── 18. liaison-auxiliary-coercive-links ──
    case "liaison-auxiliary-coercive-links":
      return def(id, "auxiliary-tasking", "liaison", "coercion", "indicator",
        "partner-liaison-reporting", "partner-liaison",
        "intel.source.partner-liaison",
        ["intel.limit.liaison-narrow"],
        "intel.evidence.liaison-coercive",
        "none", "source-sensitive",
        fixed(5, 6), noneRel, fixed(5, 6),
        "replace-older-same-question");

    // ── 19. liaison-auxiliary-unclear ──
    case "liaison-auxiliary-unclear":
      return def(id, "auxiliary-tasking", "liaison", "ambiguous", "indicator",
        "partner-liaison-reporting", null,
        "intel.source.partner-liaison",
        ["intel.limit.liaison-unclear"],
        "intel.evidence.liaison-unclear",
        "none", "none",
        fixed(5, 6), noneRel, noneRel,
        "replace-older-same-question");

    default: {
      // Exhaustiveness check
      const _exhaustive: never = id;
      throw new Error(`Unknown evidence definition ID: ${_exhaustive}`);
    }
  }
}

/** Evidence definition lookup map. */
export const v2EvidenceDefinitionMap: ReadonlyMap<V2EvidenceDefinitionId, V2EvidenceDefinition> = new Map(
  allEvidenceDefinitionIds.map((id) => [id, evidenceDefinitionById(id)]),
);

/** The complete Kestrel HQ belief model v1. */
export const kestrelHqBeliefModelV1: {
  modelId: "kestrel-hq-belief-v1";
  scenarioId: "kestrel-strait";
  reducerSemanticsId: "kestrel-binary-hypothesis-v1";
  definitions: readonly V2EvidenceDefinition[];
} = {
  modelId: "kestrel-hq-belief-v1",
  scenarioId: "kestrel-strait",
  reducerSemanticsId: "kestrel-binary-hypothesis-v1",
  definitions: allEvidenceDefinitionIds.map((id) => v2EvidenceDefinitionMap.get(id)!),
};

/**
 * Computes the canonical semantic digest of the Kestrel HQ belief model.
 * This digest binds content identity to the evidence catalog.
 */
export function kestrelHqBeliefModelDigest(): string {
  const sorted = [...kestrelHqBeliefModelV1.definitions]
    .sort((a, b) => a.definitionId.localeCompare(b.definitionId));
  const envelope = {
    modelId: "kestrel-hq-belief-v1",
    scenarioId: "kestrel-strait",
    reducerSemanticsId: "kestrel-binary-hypothesis-v1",
    definitionCount: 19,
    definitions: sorted,
  };
  return createHash("sha256").update(canonicalV2Json(envelope)).digest("hex");
}

/** Verify the content model has exactly 19 definitions. */
export function validateContentModel(): void {
  if (allEvidenceDefinitionIds.length !== 19) {
    throw new Error(`Expected exactly 19 evidence definitions, got ${allEvidenceDefinitionIds.length}`);
  }
  if (v2EvidenceDefinitionMap.size !== 19) {
    throw new Error(`Expected exactly 19 entries in definition map, got ${v2EvidenceDefinitionMap.size}`);
  }
  // Verify every definition parses
  for (const id of allEvidenceDefinitionIds) {
    const def = v2EvidenceDefinitionMap.get(id);
    if (!def) throw new Error(`Missing definition for ${id}`);
    // Verify parse round-trip
    v2EvidenceDefinitionSchema.parse(def);
  }
}
