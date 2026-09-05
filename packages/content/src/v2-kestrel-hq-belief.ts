import { createHash } from "node:crypto";
import { canonicalV2Json, v2EvidenceDefinitionSchema, type V2EvidenceDefinition, type V2EvidenceDefinitionId } from "@brass-ledger/shared";

/**
 * Kestrel HQ belief model v1 — exact 19 evidence definitions from 23C.
 *
 * This module owns evidence semantics only. It never imports sim.
 * The #100 model is a content-owned semantic catalog; Lattice/liaison
 * target defaults and task-policy semantics belong to the separate #102 model.
 */

export type V2HqBeliefModel = {
  modelId: "kestrel-hq-belief-v1";
  definitions: readonly V2EvidenceDefinition[];
};

function def(
  definitionId: V2EvidenceDefinitionId,
  implication: "preparation" | "coercion" | "ambiguous",
  diagnosticClass: "indicator" | "corroborating",
  sourceGroup: string,
  corroborationGroupId: string,
  summaryRef: string,
  assessmentStart: number,
  assessmentEnd: number,
  warningStart: number | null = null,
  warningEnd: number | null = null,
  publicStart: number | null = null,
  publicEnd: number | null = null,
  supersedesIds: string[] = [],
  replaceOlderSameQuestion = false,
  warningCapable = false,
  sourceSensitive = false,
  questionGroup = "",
): V2EvidenceDefinition {
  return v2EvidenceDefinitionSchema.parse({
    definitionId,
    implication,
    diagnosticClass,
    sourceGroup,
    corroborationGroupId,
    summaryRef,
    assessmentActiveCycles: [assessmentStart, assessmentEnd] as [number, number],
    warningActiveCycles: warningCapable && warningStart !== null
      ? ([warningStart, warningEnd] as [number, number])
      : null,
    publicCaseActiveCycles: sourceSensitive && publicStart !== null
      ? ([publicStart, publicEnd] as [number, number])
      : null,
    supersedesIds,
    replaceOlderSameQuestion,
    warningCapable,
    sourceSensitive,
    questionGroup,
  });
}

export const allEvidenceDefinitionIds: readonly V2EvidenceDefinitionId[] = [
  "opening-pressure-ambiguous",
  "shipping-probe-ambiguous",
  "reroute-auxiliary-integrated",
  "reroute-auxiliary-coercive",
  "reroute-auxiliary-unclear",
  "staging-logistics-anomaly",
  "combat-elements-dispersed",
  "focused-staging-buildup",
  "focused-staging-empty",
  "cycle4-pressure-pattern-ambiguous",
  "lattice-landing-concentration",
  "lattice-landing-dispersed",
  "lattice-auxiliary-integrated",
  "lattice-auxiliary-coercive",
  "lattice-auxiliary-mixed",
  "lattice-sync-preparation-sequence",
  "lattice-sync-preparation-signal",
  "lattice-sync-coercive-sequence",
  "lattice-sync-partial",
];

/** Evidence definition lookup map. */
export const v2EvidenceDefinitionMap: ReadonlyMap<V2EvidenceDefinitionId, V2EvidenceDefinition> = new Map(
  allEvidenceDefinitionIds.map((id) => [id, evidenceDefinitionById(id)]),
);

function evidenceDefinitionById(id: V2EvidenceDefinitionId): V2EvidenceDefinition {
  switch (id) {
    // 1. Cycle 1 — opening pressure
    case "opening-pressure-ambiguous":
      return def(id, "ambiguous", "indicator", "opening-maritime-pressure", "opening-pressure",
        "Increased patrol/auxiliary activity near Beacon Channel. Compatible with coercion, testing, or cover for preparation.",
        1, 2, null, null, null, null, [], false, false, false, "");

    // 2. Cycle 2 — continuing shipping pressure
    case "shipping-probe-ambiguous":
      return def(id, "ambiguous", "indicator", "shipping-pressure", "shipping-pressure",
        "Shipping pressure continues. Remains compatible with both coercion and cover for preparation.",
        2, 3, null, null, null, null, [], false, false, false, "");

    // 3. C2 reroute → C3: auxiliary integrated
    case "reroute-auxiliary-integrated":
      return def(id, "preparation", "indicator", "reroute-auxiliary-monitoring", "reroute-monitoring",
        "Monitored shipping-pressure vessels show tasking consistent with wider preparation pattern.",
        3, 5, null, null, null, null, [], true, false, false, "auxiliary-tasking");

    // 4. C2 reroute → C3: auxiliary coercive
    case "reroute-auxiliary-coercive":
      return def(id, "coercion", "indicator", "reroute-auxiliary-monitoring", "reroute-monitoring",
        "Monitoring points to coercive/pressure tasking chain rather than seizure-force sequence.",
        3, 5, null, null, null, null, [], true, false, false, "auxiliary-tasking");

    // 5. C2 reroute → C3: unclear
    case "reroute-auxiliary-unclear":
      return def(id, "ambiguous", "indicator", "reroute-auxiliary-monitoring", "reroute-monitoring",
        "Monitoring improves picture but does not establish how shipping pressure relates to wider operations.",
        3, 5, null, null, null, null, [], true, false, false, "auxiliary-tasking");

    // 6. C3 mandatory: staging logistics anomaly
    case "staging-logistics-anomaly":
      return def(id, "preparation", "indicator", "regional-logistics", "logistics-anomaly",
        "Logistics activity near staging areas is above recent baseline.",
        3, 4, null, null, null, null, [], false, false, false, "");

    // 7. C3 mandatory: combat elements dispersed
    case "combat-elements-dispersed":
      return def(id, "coercion", "indicator", "force-disposition", "force-disposition",
        "Major elements needed for a rapid seizure remain visibly dispersed.",
        3, 4, null, null, null, null, [], false, false, false, "");

    // 8. C4 focused staging: buildup
    case "focused-staging-buildup":
      return def(id, "preparation", "indicator", "focused-staging-collection", "focused-staging",
        "Focused collection shows movement consistent with seizure-force staging.",
        4, 6, 4, 5, 4, 6,
        ["combat-elements-dispersed"], false, true, true, "staging-focus");

    // 9. C4 focused staging: empty
    case "focused-staging-empty":
      return def(id, "coercion", "indicator", "focused-staging-collection", "focused-staging",
        "Logistics anomaly is not accompanied by concentration of the force package needed for a rapid seizure.",
        4, 5, null, null, null, null,
        ["staging-logistics-anomaly"], false, false, false, "staging-focus");

    // 10. C4 pressure pattern ambiguous
    case "cycle4-pressure-pattern-ambiguous":
      return def(id, "ambiguous", "indicator", "visible-pressure-pattern", "pressure-pattern",
        "Ravellan's visible pressure pattern has changed. The shift is ambiguous and does not establish direction.",
        4, 5, null, null, null, null, [], false, false, false, "");

    // 11. Lattice: landing concentration (corroborating)
    case "lattice-landing-concentration":
      return def(id, "preparation", "corroborating", "lattice-landing-force-staging", "lattice-landing",
        "Landing elements associated with previous seizure exercises are concentrating near embarkation areas.",
        4, 6, 4, 6, 4, 6,
        [], false, true, true, "");

    // 12. Lattice: landing dispersed
    case "lattice-landing-dispersed":
      return def(id, "coercion", "indicator", "lattice-landing-force-staging", "lattice-landing",
        "The force package required for a rapid Beacon seizure remains dispersed.",
        4, 6, null, null, null, null, [], false, false, false, "");

    // 13. Lattice: auxiliary integrated
    case "lattice-auxiliary-integrated":
      return def(id, "preparation", "indicator", "lattice-auxiliary-tasking", "lattice-auxiliary",
        "Auxiliary vessels appear to be receiving tasking consistent with wider military preparation effort.",
        4, 6, null, null, null, null,
        [], true, false, false, "auxiliary-tasking");

    // 14. Lattice: auxiliary coercive (corroborating)
    case "lattice-auxiliary-coercive":
      return def(id, "coercion", "corroborating", "lattice-auxiliary-tasking", "lattice-auxiliary",
        "Shipping pressure is being directed through a coherent coercive/political tasking chain.",
        4, 6, null, null, 4, 6,
        [], true, false, true, "auxiliary-tasking");

    // 15. Lattice: auxiliary mixed
    case "lattice-auxiliary-mixed":
      return def(id, "ambiguous", "indicator", "lattice-auxiliary-tasking", "lattice-auxiliary",
        "Tasking crosses auxiliary and military channels; pattern does not establish one common operational plan.",
        4, 6, null, null, null, null,
        [], true, false, false, "auxiliary-tasking");

    // 16. Lattice: sync preparation sequence (corroborating)
    case "lattice-sync-preparation-sequence":
      return def(id, "preparation", "corroborating", "lattice-political-operational-sync", "lattice-sync",
        "Recent operational milestones form a sustained preparation sequence rather than isolated activity.",
        4, 6, null, null, 4, 6,
        [], false, false, true, "");

    // 17. Lattice: sync preparation signal
    case "lattice-sync-preparation-signal":
      return def(id, "preparation", "indicator", "lattice-political-operational-sync", "lattice-sync",
        "One recent operational milestone aligns with the pressure campaign, but the wider sequence remains mixed.",
        4, 6, null, null, null, null, [], false, false, false, "");

    // 18. Lattice: sync coercive sequence (corroborating)
    case "lattice-sync-coercive-sequence":
      return def(id, "coercion", "corroborating", "lattice-political-operational-sync", "lattice-sync",
        "Recent activity sustains political/coercive pressure without corresponding seizure-preparation milestones.",
        4, 6, null, null, 4, 6,
        [], false, false, true, "");

    // 19. Lattice: sync partial
    case "lattice-sync-partial":
      return def(id, "ambiguous", "indicator", "lattice-political-operational-sync", "lattice-sync",
        "Recent activity does not establish whether the political and operational tracks share one timetable.",
        4, 6, null, null, null, null, [], false, false, false, "");

    default:
      throw new Error(`Unknown evidence definition ID: ${id}`);
  }
}

/** The complete Kestrel HQ belief model v1. */
export const kestrelHqBeliefModelV1: V2HqBeliefModel = {
  modelId: "kestrel-hq-belief-v1",
  definitions: allEvidenceDefinitionIds.map((id) => v2EvidenceDefinitionMap.get(id)!),
};

/**
 * Computes the canonical semantic digest of the Kestrel HQ belief model.
 * This digest binds content identity to the evidence catalog.
 */
export function kestrelHqBeliefModelDigest(): string {
  // Sort definitions by definitionId for canonical ordering
  const sorted = [...kestrelHqBeliefModelV1.definitions]
    .sort((a, b) => a.definitionId.localeCompare(b.definitionId));
  const envelope = {
    modelId: "kestrel-hq-belief-v1",
    definitionCount: 19,
    definitions: sorted,
  };
  return createHash("sha256").update(canonicalV2Json(envelope)).digest("hex");
}
