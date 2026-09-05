/**
 * #100 — HQ belief reduction core.
 *
 * Canonical implementation per 23/23A/23B/23C/23D.
 *
 * This module is sim-private. All types and functions are internal.
 *
 * The core accepts a complete list of evidence occurrences and runs:
 *   validation → persistent supersession → role-current sets
 *   → reducers → total delta → briefing selection
 *
 * Pure computation: no global state, no caller-supplied evidence.
 */

import {
  type V2HqAssessment,
  type V2HqWarning,
  type V2HqPublicCaseBasis,
  type V2BasisPattern,
  type V2EvidenceDefinitionId,
  type V2EvidenceImplication,
  type V2EvidenceDefinition,
  type V2EvidenceSummary,
  type V2HqBeliefDelta,
  type V2HqBeliefSnapshot,
  type V2HqBeliefOutput,
  type V2AssessmentChange,
  type V2WarningChange,
  type V2PublicCaseStateChange,
  type V2PublicCaseDirectionChange,
  type V2PublicCaseSupportChange,
  type V2AssessmentBasisChange,
  type V2UpdateCause,
} from "@brass-ledger/shared";

// ═════════════════════════════════════════════════════════════════════
// Evidence occurrence types (sim-private)
// ═════════════════════════════════════════════════════════════════════

/** Canonical ledger entry ref for origin binding. */
export type V2CanonicalLedgerEntryRef = Readonly<{
  kind: "command-set" | "ravellan-decision";
  cycle: 1 | 2 | 3 | 4 | 5 | 6;
  preRevision: number;
  postRevision: number;
  postStateHash: string;
}>;

/** Authoritative origin discriminator per 23A §10. */
export type V2HqEvidenceOrigin =
  | { kind: "ordinary"; cycle: 1 | 2 | 3 | 4; slotId: string }
  | {
      kind: "reroute" | "focused";
      triggerEntry: V2CanonicalLedgerEntryRef;
      observationEntry: V2CanonicalLedgerEntryRef;
      producerSlotId: string;
    };

/** A single evidence occurrence: a historical observation instance per 23A §10. */
export type V2HqEvidence = Readonly<{
  instanceId: string;
  definitionId: V2EvidenceDefinitionId;
  origin: V2HqEvidenceOrigin;
  observedCycle: 1 | 2 | 3 | 4 | 5 | 6;
  assessmentCurrentThroughCycle: 1 | 2 | 3 | 4 | 5 | 6 | null;
  warningCurrentThroughCycle: 1 | 2 | 3 | 4 | 5 | 6 | null;
  publicCaseCurrentThroughCycle: 1 | 2 | 3 | 4 | 5 | 6 | null;
  // Copied from canonical definition only:
  claimId: "ravellan-intent";
  questionId: string;
  implication: V2EvidenceImplication;
  diagnosticity: "indicator" | "diagnostic";
  sourceGroupId: string;
  corroborationGroupId: string | null;
  sourceContextRef: string;
  limitationRef: string;
  summaryRef: string;
  warningRole: "none" | "usable";
  publicCaseRole: "none" | "source-sensitive";
}>;

/** @deprecated Use V2HqEvidence instead. */
export type V2EvidenceOccurrence = V2HqEvidence;

/** @deprecated Use V2HqEvidenceOrigin instead. */
export type V2OccurrenceOrigin = V2HqEvidenceOrigin;

/** Resolved evidence definition (sim-internal). */
export type V2ResolvedEvidenceDef = V2EvidenceDefinition;

// ═════════════════════════════════════════════════════════════════════
// Supersession state
// ═════════════════════════════════════════════════════════════════════

export type V2SupersessionState = {
  readonly superseded: ReadonlySet<string>;
  readonly questionAnswers: ReadonlyMap<string, string>;
};

/**
 * Compute persistent supersession from all occurrences observed by query cycle Q.
 *
 * Rules per 23C §8:
 * 1. If evidence A supersedes B (explicit supersedesDefinitionIds), B is superseded.
 * 2. If `replace-older-same-question`, newer occurrence replaces older same-question.
 * 3. Supersession is permanent: superseded evidence never becomes current again.
 */
export function computeSupersession(
  occurrences: readonly V2HqEvidence[],
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
): V2SupersessionState {
  const superseded = new Set<string>();
  const questionAnswers = new Map<string, string>();

  // Sort by observed cycle then instanceId for deterministic ordering
  const sorted = [...occurrences].sort((a, b) =>
    a.observedCycle !== b.observedCycle
      ? a.observedCycle - b.observedCycle
      : a.instanceId.localeCompare(b.instanceId),
  );

  for (const occ of sorted) {
    const def = definitions.get(occ.definitionId);
    if (!def) continue;

    // Explicit supersession
    for (const supersededId of def.supersedesDefinitionIds) {
      for (const other of sorted) {
        if (other.definitionId === supersededId && other.instanceId !== occ.instanceId) {
          superseded.add(other.instanceId);
        }
      }
    }

    // replace-older-same-question
    if (def.supersessionPolicy === "replace-older-same-question") {
      const priorId = questionAnswers.get(occ.questionId);
      if (priorId !== undefined && priorId !== occ.instanceId) {
        superseded.add(priorId);
      }
      questionAnswers.set(occ.questionId, occ.instanceId);
    }
  }

  return { superseded, questionAnswers };
}

// ═════════════════════════════════════════════════════════════════════
// Role-current filtering
// ═════════════════════════════════════════════════════════════════════

/**
 * Filter occurrences to those current for a given role at cycle Q.
 *
 * An occurrence is current if (per 23A §16):
 * - It is not superseded
 * - The current cycle Q falls within its current-through window for that role
 */
export function roleCurrentOccurrences(
  occurrences: readonly V2HqEvidence[],
  supersession: V2SupersessionState,
  role: "assessment" | "warning" | "public-case",
  cycle: number,
): V2HqEvidence[] {
  return occurrences.filter((occ) => {
    if (supersession.superseded.has(occ.instanceId)) return false;

    const through = role === "assessment"
      ? occ.assessmentCurrentThroughCycle
      : role === "warning"
        ? occ.warningCurrentThroughCycle
        : occ.publicCaseCurrentThroughCycle;

    if (through === null) return false;
    return occ.observedCycle <= cycle && cycle <= through;
  });
}

// ═════════════════════════════════════════════════════════════════════
// Assessment reducer — kestrel-binary-hypothesis-v1
// ═════════════════════════════════════════════════════════════════════

/**
 * Exact 16-row truth table per 23B §5.
 *
 * No weighted score, no vote counting. Evidence multiplicity does not
 * change the categorical result.
 */
export function reduceAssessment(
  assessmentCurrent: readonly V2HqEvidence[],
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
): { assessment: V2HqAssessment; basisPattern: V2BasisPattern } {
  const hasDiagnosticPrep = assessmentCurrent.some((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && occ.implication === "preparation" && def.diagnosticity === "diagnostic";
  });
  const hasDiagnosticCoercion = assessmentCurrent.some((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && occ.implication === "coercion" && def.diagnosticity === "diagnostic";
  });
  const hasIndicatorPrep = assessmentCurrent.some((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && occ.implication === "preparation" && def.diagnosticity === "indicator";
  });
  const hasIndicatorCoercion = assessmentCurrent.some((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && occ.implication === "coercion" && def.diagnosticity === "indicator";
  });

  const dp = hasDiagnosticPrep ? 1 : 0;
  const dc = hasDiagnosticCoercion ? 1 : 0;
  const ip = hasIndicatorPrep ? 1 : 0;
  const ic = hasIndicatorCoercion ? 1 : 0;
  const row = (dp << 3) | (dc << 2) | (ip << 1) | ic;

  let assessment: V2HqAssessment;
  let basisPattern: V2BasisPattern;

  switch (row) {
    case 0b0000:
      assessment = { direction: "unclear", picture: "weak", basisPattern: "no-direction" };
      basisPattern = "no-direction";
      break;
    case 0b0001:
      assessment = { direction: "coercion", picture: "weak", basisPattern: "indicator-coercion" };
      basisPattern = "indicator-coercion";
      break;
    case 0b0010:
      assessment = { direction: "preparation", picture: "weak", basisPattern: "indicator-preparation" };
      basisPattern = "indicator-preparation";
      break;
    case 0b0011:
      assessment = { direction: "unclear", picture: "conflicted", basisPattern: "indicator-conflict" };
      basisPattern = "indicator-conflict";
      break;
    case 0b0100:
      assessment = { direction: "coercion", picture: "coherent", basisPattern: "diagnostic-coercion-clear" };
      basisPattern = "diagnostic-coercion-clear";
      break;
    case 0b0101:
      assessment = { direction: "coercion", picture: "coherent", basisPattern: "diagnostic-coercion-clear" };
      basisPattern = "diagnostic-coercion-clear";
      break;
    case 0b0110:
      assessment = { direction: "coercion", picture: "weak", basisPattern: "diagnostic-coercion-qualified" };
      basisPattern = "diagnostic-coercion-qualified";
      break;
    case 0b0111:
      assessment = { direction: "coercion", picture: "weak", basisPattern: "diagnostic-coercion-qualified" };
      basisPattern = "diagnostic-coercion-qualified";
      break;
    case 0b1000:
      assessment = { direction: "preparation", picture: "coherent", basisPattern: "diagnostic-preparation-clear" };
      basisPattern = "diagnostic-preparation-clear";
      break;
    case 0b1001:
      assessment = { direction: "preparation", picture: "weak", basisPattern: "diagnostic-preparation-qualified" };
      basisPattern = "diagnostic-preparation-qualified";
      break;
    case 0b1010:
      assessment = { direction: "preparation", picture: "coherent", basisPattern: "diagnostic-preparation-clear" };
      basisPattern = "diagnostic-preparation-clear";
      break;
    case 0b1011:
      assessment = { direction: "preparation", picture: "weak", basisPattern: "diagnostic-preparation-qualified" };
      basisPattern = "diagnostic-preparation-qualified";
      break;
    case 0b1100:
      assessment = { direction: "unclear", picture: "conflicted", basisPattern: "diagnostic-conflict" };
      basisPattern = "diagnostic-conflict";
      break;
    case 0b1101:
      assessment = { direction: "unclear", picture: "conflicted", basisPattern: "diagnostic-conflict" };
      basisPattern = "diagnostic-conflict";
      break;
    case 0b1110:
      assessment = { direction: "unclear", picture: "conflicted", basisPattern: "diagnostic-conflict" };
      basisPattern = "diagnostic-conflict";
      break;
    case 0b1111:
      assessment = { direction: "unclear", picture: "conflicted", basisPattern: "diagnostic-conflict" };
      basisPattern = "diagnostic-conflict";
      break;
    default:
      assessment = { direction: "unclear", picture: "weak", basisPattern: "no-direction" };
      basisPattern = "no-direction";
  }

  return { assessment, basisPattern };
}

// ═════════════════════════════════════════════════════════════════════
// Warning reducer — per 23 §9 / 23A §17
// ═════════════════════════════════════════════════════════════════════

/**
 * Warning uses only warning-current, non-superseded preparation evidence
 * with warningRole = "usable". Deterministic basis occurrence selection.
 */
export function reduceWarning(
  warningCurrent: readonly V2HqEvidence[],
): V2HqWarning {
  const usable = warningCurrent.filter(
    (occ) => occ.implication === "preparation" && occ.warningRole === "usable",
  );

  if (usable.length === 0) {
    return { state: "none", basisEvidenceInstanceId: null };
  }

  // Sort by: newest observed cycle, then diagnostic before indicator,
  // then definition ID, then instance ID
  const sorted = [...usable].sort((a, b) => {
    if (a.observedCycle !== b.observedCycle) return b.observedCycle - a.observedCycle;
    const aDiag = a.diagnosticity === "diagnostic" ? 0 : 1;
    const bDiag = b.diagnosticity === "diagnostic" ? 0 : 1;
    if (aDiag !== bDiag) return aDiag - bDiag;
    if (a.definitionId !== b.definitionId) return a.definitionId.localeCompare(b.definitionId);
    return a.instanceId.localeCompare(b.instanceId);
  });

  return { state: "usable", basisEvidenceInstanceId: sorted[0]!.instanceId };
}

// ═════════════════════════════════════════════════════════════════════
// Public-case reducer — per 23 §10 / 23A §17
// ═════════════════════════════════════════════════════════════════════

/**
 * Public attribution is stricter than internal estimation.
 *
 * Credible direction D requires:
 * 1. A current source-sensitive diagnostic occurrence supporting D
 * 2. No current opposite directional occurrence (assessment or public-case)
 * 3. One additional same-direction source-sensitive occurrence from a different corroborationGroupId
 *
 * One diagnostic source = tentative. Two indicators = tentative.
 * Directionless credible is invalid.
 */
export function reducePublicCase(
  publicCaseCurrent: readonly V2HqEvidence[],
  assessmentCurrent: readonly V2HqEvidence[],
): V2HqPublicCaseBasis {
  const sourceSensitive = publicCaseCurrent.filter(
    (occ) => occ.publicCaseRole === "source-sensitive",
  );

  if (sourceSensitive.length === 0) {
    return { state: "none", direction: null, supportingInstanceIds: [], supportingCorroborationGroupIds: [] };
  }

  // Find diagnostic (diagnosticity = "diagnostic") source-sensitive by direction
  const prepDiagnostic = sourceSensitive.filter(
    (occ) => occ.diagnosticity === "diagnostic" && occ.implication === "preparation",
  );
  const coercionDiagnostic = sourceSensitive.filter(
    (occ) => occ.diagnosticity === "diagnostic" && occ.implication === "coercion",
  );

  // Check for material opposite-direction blockers in assessment-current
  const hasMaterialPrepBlocker = assessmentCurrent.some(
    (occ) => occ.implication === "preparation" && occ.diagnosticity === "diagnostic",
  );
  const hasMaterialCoercionBlocker = assessmentCurrent.some(
    (occ) => occ.implication === "coercion" && occ.diagnosticity === "diagnostic",
  );

  // Helper: sort occurrences by ranking (newest, then diagnostic before indicator, then stable IDs)
  const rank = (occ: V2HqEvidence): string => {
    const diag = occ.diagnosticity === "diagnostic" ? "0" : "1";
    const cycle = String(occ.observedCycle).padStart(2, "0");
    return `${diag}-${cycle}-${occ.definitionId}-${occ.instanceId}`;
  };

  // Try preparation direction
  if (prepDiagnostic.length > 0 && !hasMaterialCoercionBlocker) {
    const groups = new Set<string>();
    for (const occ of prepDiagnostic) {
      if (occ.corroborationGroupId) groups.add(occ.corroborationGroupId);
    }
    if (groups.size >= 2) {
      const sorted = [...prepDiagnostic].sort((a, b) => rank(a).localeCompare(rank(b)));
      const groupMap = new Map<string, V2HqEvidence>();
      for (const occ of sorted) {
        if (occ.corroborationGroupId && !groupMap.has(occ.corroborationGroupId)) {
          groupMap.set(occ.corroborationGroupId, occ);
        }
      }
      const basis = [...groupMap.values()].slice(0, 2);
      return {
        state: "credible-source-sensitive",
        direction: "preparation",
        supportingInstanceIds: [basis[0]!.instanceId, basis[1]!.instanceId],
        supportingCorroborationGroupIds: [basis[0]!.corroborationGroupId!, basis[1]!.corroborationGroupId!],
      };
    }
  }

  // Try coercion direction
  if (coercionDiagnostic.length > 0 && !hasMaterialPrepBlocker) {
    const groups = new Set<string>();
    for (const occ of coercionDiagnostic) {
      if (occ.corroborationGroupId) groups.add(occ.corroborationGroupId);
    }
    if (groups.size >= 2) {
      const sorted = [...coercionDiagnostic].sort((a, b) => rank(a).localeCompare(rank(b)));
      const groupMap = new Map<string, V2HqEvidence>();
      for (const occ of sorted) {
        if (occ.corroborationGroupId && !groupMap.has(occ.corroborationGroupId)) {
          groupMap.set(occ.corroborationGroupId, occ);
        }
      }
      const basis = [...groupMap.values()].slice(0, 2);
      return {
        state: "credible-source-sensitive",
        direction: "coercion",
        supportingInstanceIds: [basis[0]!.instanceId, basis[1]!.instanceId],
        supportingCorroborationGroupIds: [basis[0]!.corroborationGroupId!, basis[1]!.corroborationGroupId!],
      };
    }
  }

  // Tentative: any source-sensitive directional evidence
  const directional = sourceSensitive.filter((occ) => occ.implication !== "ambiguous");
  if (directional.length > 0) {
    const sorted = [...directional].sort((a, b) => rank(a).localeCompare(rank(b)));
    const primary = sorted[0]!;
    const dir = primary.implication === "preparation" ? "preparation" : "coercion";
    return {
      state: "tentative",
      direction: dir,
      supportingInstanceIds: [primary.instanceId],
      supportingCorroborationGroupIds: primary.corroborationGroupId ? [primary.corroborationGroupId] : [],
    };
  }

  return { state: "none", direction: null, supportingInstanceIds: [], supportingCorroborationGroupIds: [] };
}

// ═════════════════════════════════════════════════════════════════════
// Delta computation — per 23D §9-15
// ═════════════════════════════════════════════════════════════════════

/** Previous snapshot state for delta computation. */
export type V2PreviousSnapshotState = {
  readonly assessment: V2HqAssessment;
  readonly warning: V2HqWarning;
  readonly publicCaseBasis: V2HqPublicCaseBasis;
  readonly currentInstanceIds: ReadonlySet<string>;
  readonly supersededIds: ReadonlySet<string>;
};

/**
 * Compute assessment change per 23D §10.
 * Total over all 36 pairs.
 */
function computeAssessmentChange(
  prev: V2HqAssessment | null,
  current: V2HqAssessment,
): V2AssessmentChange {
  if (prev === null) return "initial";

  const prevStr = `${prev.direction}/${prev.picture}`;
  const curStr = `${current.direction}/${current.picture}`;

  if (prevStr === curStr) return "unchanged";

  // reversed: directional swap
  if (
    (prev.direction === "preparation" && current.direction === "coercion") ||
    (prev.direction === "coercion" && current.direction === "preparation")
  ) return "reversed";

  // Same direction: weak ↔ coherent
  if (prev.direction === current.direction && prev.direction !== "unclear") {
    if (prev.picture === "weak" && current.picture === "coherent") return "strengthened";
    if (prev.picture === "coherent" && current.picture === "weak") return "weakened";
  }

  // Current unclear/conflicted
  if (current.direction === "unclear" && current.picture === "conflicted") return "conflicted";

  // Previous unclear/conflicted → current unclear/weak
  if (prev.direction === "unclear" && prev.picture === "conflicted" && current.direction === "unclear" && current.picture === "weak") return "cleared-conflict";

  // Previous any unclear → current directional
  if (prev.direction === "unclear" && current.direction !== "unclear") return "narrowed";

  // Previous directional → current unclear/weak
  if (prev.direction !== "unclear" && current.direction === "unclear" && current.picture === "weak") return "reopened";

  return "unchanged";
}

/**
 * Compute assessment basis change per 23D §10.
 */
function computeAssessmentBasisChange(
  prev: V2HqAssessment | null,
  current: V2HqAssessment,
): V2AssessmentBasisChange {
  if (prev === null) return "initial";
  if (prev.basisPattern === current.basisPattern) return "unchanged";
  return "changed";
}

/**
 * Compute warning change per 23D §11 / 23A §18.
 */
function computeWarningChange(
  prev: V2HqWarning | null,
  current: V2HqWarning,
  prevSupersededIds: ReadonlySet<string>,
  currentSupersededIds: ReadonlySet<string>,
  staleForWarningIds: ReadonlySet<string>,
): V2WarningChange {
  if (prev === null) return "initial";

  const prevState = prev.state;
  const curState = current.state;

  if (prevState === "none" && curState === "none") return "unchanged";
  if (prevState === "none" && curState === "usable") return "gained";
  if (prevState === "usable" && curState === "none") {
    // Determine cause
    const wasSuperseded = prev.basisEvidenceInstanceId !== null && currentSupersededIds.has(prev.basisEvidenceInstanceId);
    const wasStale = prev.basisEvidenceInstanceId !== null && staleForWarningIds.has(prev.basisEvidenceInstanceId);
    if (wasSuperseded && wasStale) return "lost-mixed";
    if (wasSuperseded) return "lost-superseded";
    return "lost-stale";
  }
  // Both usable
  if (prevState === "usable" && curState === "usable") {
    if (prev.basisEvidenceInstanceId === current.basisEvidenceInstanceId) return "unchanged";
    return "refreshed";
  }

  return "unchanged";
}

/**
 * Compute public-case state change per 23D §12.
 */
function computePublicCaseStateChange(
  prev: V2HqPublicCaseBasis | null,
  current: V2HqPublicCaseBasis,
): V2PublicCaseStateChange {
  if (prev === null) return "initial";
  if (prev.state === current.state) return "unchanged";
  if (prev.state === "none" && current.state !== "none") return "opened";
  if (prev.state !== "none" && current.state === "none") return "closed";
  if (prev.state === "tentative" && current.state === "credible-source-sensitive") return "strengthened";
  if (prev.state === "credible-source-sensitive" && current.state === "tentative") return "weakened";
  return "unchanged";
}

/**
 * Compute public-case direction change per 23D §13.
 */
function computePublicCaseDirectionChange(
  prev: V2HqPublicCaseBasis | null,
  current: V2HqPublicCaseBasis,
): V2PublicCaseDirectionChange {
  if (prev === null) return "initial";
  if (prev.direction === current.direction) return "unchanged";

  // Previous none/null → current directional
  if (prev.direction === null && current.direction !== null) {
    // If previous was tentative/null, it's "clarified"; otherwise "established"
    if (prev.state === "tentative") return "clarified";
    return "established";
  }
  // Previous directional → current none/null
  if (prev.direction !== null && current.direction === null) {
    if (current.state === "none") return "cleared";
    return "became-conflicted";
  }
  // Opposite directions
  if (prev.direction !== null && current.direction !== null && prev.direction !== current.direction) return "reversed";

  return "unchanged";
}

/**
 * Compute public-case support change per 23D §14.
 */
function computePublicCaseSupportChange(
  prev: V2HqPublicCaseBasis | null,
  current: V2HqPublicCaseBasis,
): V2PublicCaseSupportChange {
  if (prev === null) return "initial";

  const prevIds = prev.supportingInstanceIds.join(",");
  const curIds = current.supportingInstanceIds.join(",");

  if (prevIds === curIds) return "unchanged";
  if (prev.supportingInstanceIds.length > 0 && current.supportingInstanceIds.length === 0) return "cleared";
  return "changed";
}

/**
 * Compute update cause per 23D §15.
 */
function computeUpdateCause(
  addedIds: ReadonlySet<string>,
  staleForAnyRole: ReadonlySet<string>,
  newlySupersededIds: ReadonlySet<string>,
  hasProductChange: boolean,
): V2UpdateCause {
  const hasNew = addedIds.size > 0 && hasProductChange;
  const hasStale = staleForAnyRole.size > 0 && hasProductChange;
  const hasSupersession = newlySupersededIds.size > 0 && hasProductChange;

  const causes = (hasNew ? 1 : 0) + (hasStale ? 1 : 0) + (hasSupersession ? 1 : 0);
  if (causes >= 2) return "mixed";
  if (hasSupersession) return "supersession";
  if (hasStale) return "staleness";
  if (hasNew) return "new-evidence";
  return "none";
}

/**
 * Compute the total product/evidence delta between previous and current state.
 */
export function computeDelta(
  prev: V2PreviousSnapshotState | null,
  current: {
    assessment: V2HqAssessment;
    warning: V2HqWarning;
    publicCaseBasis: V2HqPublicCaseBasis;
    currentInstanceIds: ReadonlySet<string>;
    supersededIds: ReadonlySet<string>;
    staleForAssessmentIds: ReadonlySet<string>;
    staleForWarningIds: ReadonlySet<string>;
    staleForPublicCaseIds: ReadonlySet<string>;
    addedInstanceIds: ReadonlySet<string>;
    newlySupersededInstanceIds: ReadonlySet<string>;
  },
): V2HqBeliefDelta {
  const assessmentChange = computeAssessmentChange(prev?.assessment ?? null, current.assessment);
  const assessmentBasisChange = computeAssessmentBasisChange(prev?.assessment ?? null, current.assessment);
  const warningChange = computeWarningChange(
    prev?.warning ?? null,
    current.warning,
    prev?.supersededIds ?? new Set(),
    current.supersededIds,
    current.staleForWarningIds,
  );
  const publicCaseStateChange = computePublicCaseStateChange(prev?.publicCaseBasis ?? null, current.publicCaseBasis);
  const publicCaseDirectionChange = computePublicCaseDirectionChange(prev?.publicCaseBasis ?? null, current.publicCaseBasis);
  const publicCaseSupportChange = computePublicCaseSupportChange(prev?.publicCaseBasis ?? null, current.publicCaseBasis);

  const staleForAnyRole = new Set<string>([...current.staleForAssessmentIds, ...current.staleForWarningIds, ...current.staleForPublicCaseIds]);
  const hasProductChange = assessmentChange !== "unchanged" || warningChange !== "unchanged" || publicCaseStateChange !== "unchanged";
  const updateCause = computeUpdateCause(current.addedInstanceIds, staleForAnyRole, current.newlySupersededInstanceIds, hasProductChange);

  return {
    assessmentChange,
    assessmentBasisChange,
    warningChange,
    publicCaseStateChange,
    publicCaseDirectionChange,
    publicCaseSupportChange,
    updateCause,
    addedInstanceIds: [...current.addedInstanceIds].sort(),
    staleForAssessmentInstanceIds: [...current.staleForAssessmentIds].sort(),
    staleForWarningInstanceIds: [...current.staleForWarningIds].sort(),
    staleForPublicCaseInstanceIds: [...current.staleForPublicCaseIds].sort(),
    newlySupersededInstanceIds: [...current.newlySupersededInstanceIds].sort(),
  };
}

// ═════════════════════════════════════════════════════════════════════
// Briefing selection — per 23 §16 / 23D §2-8
// ═════════════════════════════════════════════════════════════════════

/** Select the primary basis evidence from current occurrences within a direction. */
function selectPrimaryBasis(
  current: readonly V2HqEvidence[],
  direction: "preparation" | "coercion",
): V2HqEvidence | null {
  const directional = current.filter((occ) => occ.implication === direction);
  if (directional.length === 0) return null;

  // Rank: 1. diagnostic before indicator, 2. warning-bearing before non-warning (within same class),
  // 3. newer observed cycle, 4. definition ID, 5. instance ID
  const ranked = [...directional].sort((a, b) => {
    const aDiag = a.diagnosticity === "diagnostic" ? 0 : 1;
    const bDiag = b.diagnosticity === "diagnostic" ? 0 : 1;
    if (aDiag !== bDiag) return aDiag - bDiag;
    // Within same class, warning-bearing before non-warning
    const aWarn = a.warningRole === "usable" ? 0 : 1;
    const bWarn = b.warningRole === "usable" ? 0 : 1;
    if (aWarn !== bWarn) return aWarn - bWarn;
    if (a.observedCycle !== b.observedCycle) return b.observedCycle - a.observedCycle;
    if (a.definitionId !== b.definitionId) return a.definitionId.localeCompare(b.definitionId);
    return a.instanceId.localeCompare(b.instanceId);
  });

  return ranked[0]!;
}

/** Select the highest-ranked opposite-direction occurrence for contrary evidence. */
function selectContraryBasis(
  current: readonly V2HqEvidence[],
  oppositeDirection: "preparation" | "coercion",
): V2HqEvidence | null {
  return selectPrimaryBasis(current, oppositeDirection);
}

/** Convert evidence to safe summary. */
function toSummary(occ: V2HqEvidence): V2EvidenceSummary {
  return {
    definitionId: occ.definitionId,
    observedCycle: occ.observedCycle,
    summaryRef: occ.summaryRef,
    sourceContextRef: occ.sourceContextRef,
    limitationRef: occ.limitationRef,
  };
}

/**
 * Build the player-safe intelligence brief per 23D §5-8.
 */
export function buildBrief(
  assessment: V2HqAssessment,
  warning: V2HqWarning,
  assessmentCurrent: readonly V2HqEvidence[],
  warningCurrent: readonly V2HqEvidence[],
): {
  judgementRef: string;
  basisEvidence: V2EvidenceSummary[];
  contraryEvidence: V2EvidenceSummary[];
  keyGapRef: string;
  watchForRef: string;
  updateLine: string | null;
  warningStatementRef: string;
  warningBasisEvidence: V2EvidenceSummary | null;
} {
  const bp = assessment.basisPattern;
  const warnState = warning.state;

  // Determine gap and watch-for refs from basisPattern + warning state (23D §3)
  const gapWatchMap: Record<string, { gap: string; watch: string }> = {
    "no-direction_none": { gap: "intel.gap.no-direction", watch: "intel.watch.no-direction" },
    "indicator-preparation_none": { gap: "intel.gap.indicator-preparation-none", watch: "intel.watch.indicator-preparation-none" },
    "indicator-preparation_usable": { gap: "intel.gap.indicator-preparation-warning", watch: "intel.watch.indicator-preparation-warning" },
    "indicator-coercion_none": { gap: "intel.gap.indicator-coercion", watch: "intel.watch.indicator-coercion" },
    "indicator-conflict_none": { gap: "intel.gap.indicator-conflict-none", watch: "intel.watch.indicator-conflict-none" },
    "indicator-conflict_usable": { gap: "intel.gap.indicator-conflict-warning", watch: "intel.watch.indicator-conflict-warning" },
    "diagnostic-preparation-clear_none": { gap: "intel.gap.diagnostic-preparation-clear-none", watch: "intel.watch.diagnostic-preparation-clear-none" },
    "diagnostic-preparation-clear_usable": { gap: "intel.gap.diagnostic-preparation-clear-warning", watch: "intel.watch.diagnostic-preparation-clear-warning" },
    "diagnostic-preparation-qualified_none": { gap: "intel.gap.diagnostic-preparation-qualified-none", watch: "intel.watch.diagnostic-preparation-qualified-none" },
    "diagnostic-preparation-qualified_usable": { gap: "intel.gap.diagnostic-preparation-qualified-warning", watch: "intel.watch.diagnostic-preparation-qualified-warning" },
    "diagnostic-coercion-clear_none": { gap: "intel.gap.diagnostic-coercion-clear", watch: "intel.watch.diagnostic-coercion-clear" },
    "diagnostic-coercion-qualified_none": { gap: "intel.gap.diagnostic-coercion-qualified-none", watch: "intel.watch.diagnostic-coercion-qualified-none" },
    "diagnostic-coercion-qualified_usable": { gap: "intel.gap.diagnostic-coercion-qualified-warning", watch: "intel.watch.diagnostic-coercion-qualified-warning" },
    "diagnostic-conflict_none": { gap: "intel.gap.diagnostic-conflict-none", watch: "intel.watch.diagnostic-conflict-none" },
    "diagnostic-conflict_usable": { gap: "intel.gap.diagnostic-conflict-warning", watch: "intel.watch.diagnostic-conflict-warning" },
  };

  const gwKey = `${bp}_${warnState}`;
  const gw = gapWatchMap[gwKey] ?? { gap: "intel.gap.no-direction", watch: "intel.watch.no-direction" };

  // Directional brief selection (23D §5)
  const isConflicted = assessment.direction === "unclear" && assessment.picture === "conflicted";
  const isUnclearWeak = assessment.direction === "unclear" && assessment.picture === "weak";

  let basisEvidence: V2EvidenceSummary[] = [];
  let contraryEvidence: V2EvidenceSummary[] = [];

  if (isConflicted) {
    // Select one preparation and one coercion representative (23D §6)
    const prepRep = selectPrimaryBasis(assessmentCurrent, "preparation");
    const coercionRep = selectPrimaryBasis(assessmentCurrent, "coercion");
    if (prepRep) basisEvidence.push(toSummary(prepRep));
    if (coercionRep) basisEvidence.push(toSummary(coercionRep));
  } else if (!isUnclearWeak) {
    // Directional assessment
    const dir = assessment.direction as "preparation" | "coercion";
    const primary = selectPrimaryBasis(assessmentCurrent, dir);
    if (primary) basisEvidence.push(toSummary(primary));

    // Second basis slot: prefer another question/group
    const remaining = assessmentCurrent
      .filter((occ) => occ.implication === dir && occ.instanceId !== primary?.instanceId);
    if (remaining.length > 0 && basisEvidence.length < 2) {
      // Prefer different question, then different corroboration group
      const sortedRemaining = [...remaining].sort((a, b) => {
        if (a.questionId !== b.questionId && b.questionId === primary?.questionId) return -1;
        if (b.questionId !== a.questionId && a.questionId === primary?.questionId) return 1;
        return a.instanceId.localeCompare(b.instanceId);
      });
      basisEvidence.push(toSummary(sortedRemaining[0]!));
    }

    // Mandatory contrary evidence (23D §5 rule 3)
    const oppositeDir = dir === "preparation" ? "coercion" : "preparation";
    const contrary = selectContraryBasis(assessmentCurrent, oppositeDir);
    if (contrary) {
      contraryEvidence.push(toSummary(contrary));
    }
  }

  // Warning block (23D §8)
  const warningStatementRef = warnState === "usable"
    ? "intel.warning.usable"
    : "intel.warning.none";

  let warningBasisEvidence: V2EvidenceSummary | null = null;
  if (warnState === "usable" && warning.basisEvidenceInstanceId !== null) {
    const basisOcc = warningCurrent.find((occ) => occ.instanceId === warning.basisEvidenceInstanceId);
    if (basisOcc) {
      warningBasisEvidence = toSummary(basisOcc);
    }
  }

  return {
    judgementRef: `${assessment.direction}/${assessment.picture}`,
    basisEvidence,
    contraryEvidence,
    keyGapRef: gw.gap,
    watchForRef: gw.watch,
    updateLine: null, // Set by caller
    warningStatementRef,
    warningBasisEvidence,
  };
}

// ═════════════════════════════════════════════════════════════════════
// Main reduction pipeline
// ═════════════════════════════════════════════════════════════════════

/**
 * Run the complete reduction pipeline for a single cycle.
 *
 * Pure function: given occurrences, definitions, and optional previous state,
 * returns the complete output.
 */
export function reduceHqBelief(
  occurrences: readonly V2HqEvidence[],
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  cycle: number,
  prevState: V2PreviousSnapshotState | null,
): V2HqBeliefOutput {
  // 1. Supersession
  const supersession = computeSupersession(occurrences, definitions);

  // 2. Role-current sets
  const assessmentCurrent = roleCurrentOccurrences(occurrences, supersession, "assessment", cycle);
  const warningCurrent = roleCurrentOccurrences(occurrences, supersession, "warning", cycle);
  const publicCaseCurrent = roleCurrentOccurrences(occurrences, supersession, "public-case", cycle);

  // 3. Reducers
  const { assessment, basisPattern } = reduceAssessment(assessmentCurrent, definitions);
  const warning = reduceWarning(warningCurrent);
  const publicCaseBasis = reducePublicCase(publicCaseCurrent, assessmentCurrent);

  // 4. Briefing
  const brief = buildBrief(assessment, warning, assessmentCurrent, warningCurrent);

  // 5. Delta computation
  const currentInstanceIds = new Set(assessmentCurrent.map((o) => o.instanceId));
  const currentWarningIds = new Set(warningCurrent.map((o) => o.instanceId));
  const currentPublicIds = new Set(publicCaseCurrent.map((o) => o.instanceId));

  // Determine stale-for-role: occurrences in previous current set but not in current
  const staleForAssessmentIds = new Set<string>();
  const staleForWarningIds = new Set<string>();
  const staleForPublicCaseIds = new Set<string>();
  const addedInstanceIds = new Set<string>();

  if (prevState) {
    for (const id of prevState.currentInstanceIds) {
      if (!currentInstanceIds.has(id)) staleForAssessmentIds.add(id);
    }
    // Track warning and public-case staleness separately
    for (const id of prevState.currentInstanceIds) {
      if (!currentWarningIds.has(id) && prevState.currentInstanceIds.has(id)) staleForWarningIds.add(id);
      if (!currentPublicIds.has(id) && prevState.currentInstanceIds.has(id)) staleForPublicCaseIds.add(id);
    }
    for (const id of currentInstanceIds) {
      if (!prevState.currentInstanceIds.has(id)) addedInstanceIds.add(id);
    }
  } else {
    for (const id of currentInstanceIds) addedInstanceIds.add(id);
  }

  // Newly superseded
  const newlySupersededInstanceIds = new Set<string>();
  if (prevState) {
    for (const id of supersession.superseded) {
      if (!prevState.supersededIds.has(id)) newlySupersededInstanceIds.add(id);
    }
  } else {
    for (const id of supersession.superseded) newlySupersededInstanceIds.add(id);
  }

  const delta = computeDelta(prevState, {
    assessment,
    warning,
    publicCaseBasis,
    currentInstanceIds,
    supersededIds: new Set(supersession.superseded),
    staleForAssessmentIds,
    staleForWarningIds,
    staleForPublicCaseIds,
    addedInstanceIds,
    newlySupersededInstanceIds,
  });

  // Build snapshot
  const snapshot: V2HqBeliefSnapshot = {
    cycle: cycle as 1 | 2 | 3 | 4 | 5 | 6,
    assessment,
    warning,
    publicCaseBasis,
    delta,
    brief: {
      judgementRef: brief.judgementRef,
      basisEvidence: brief.basisEvidence,
      contraryEvidence: brief.contraryEvidence,
      keyGapRef: brief.keyGapRef,
      watchForRef: brief.watchForRef,
      updateLine: brief.updateLine,
      warning: {
        state: brief.warningStatementRef === "intel.warning.usable" ? "usable" : "none",
        statementRef: brief.warningStatementRef,
        basisEvidence: brief.warningBasisEvidence,
      },
    },
  };

  return { kind: "ready", snapshot };
}

/**
 * Create a "not ready" output when the phase is invalid (23 §20).
 */
export function notReadyOutput(cycle: number): V2HqBeliefOutput {
  return {
    kind: "not-ready",
    cycle: cycle as 1 | 2 | 3 | 4 | 5 | 6,
    reason: "ravellan-decision-missing",
  };
}

/** Get the current assessment instance IDs for computing basis change. */
export function getAssessmentInstanceIds(
  assessment: V2HqAssessment,
  assessmentCurrent: readonly V2HqEvidence[],
): string[] {
  if (assessment.direction === "unclear") return [];
  const dir = assessment.direction;
  return assessmentCurrent
    .filter((occ) => occ.implication === dir)
    .sort((a, b) => a.instanceId.localeCompare(b.instanceId))
    .map((occ) => occ.instanceId);
}
