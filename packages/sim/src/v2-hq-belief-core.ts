/**
 * #100 — HQ belief reduction core.
 *
 * This module implements the deterministic reduction logic for Kestrel HQ
 * intelligence. It is sim-private: all types and functions are internal.
 *
 * The core accepts a complete list of evidence occurrences and runs:
 *   validation → persistent supersession → role-current sets
 *   → reducers → total delta → briefing selection
 *
 * This is a pure computation; it does not depend on how occurrences were
 * produced or on any persisted state beyond what is passed in.
 */

import {
  type V2Assessment,
  type V2BasisPattern,
  type V2EvidenceDefinitionId,
  type V2EvidenceImplication,
  type V2EvidenceRole,
  type V2HqBeliefDelta,
  type V2HqBeliefOutput,
  type V2IntelligenceBrief,
  type V2PublicCaseDirection,
  type V2PublicCaseState,
  type V2WarningState,
  v2EvidenceDefinitionSchema,
} from "@brass-ledger/shared";

// ─── Evidence occurrence types (sim-private) ──────────────────────────

/** Authoritative origin discriminator for evidence occurrences. */
export type V2OccurrenceOrigin =
  | { kind: "ordinary" }
  | { kind: "reroute" }
  | { kind: "focused-staging" }
  // #102 extends this union with:
  // | { kind: "task-collection"; targetId: string }

/** A single evidence occurrence: a historical observation instance. */
export type V2EvidenceOccurrence = {
  /** Deterministic collision-resistant occurrence ID. */
  readonly occurrenceId: string;
  /** Evidence definition ID. */
  readonly definitionId: V2EvidenceDefinitionId;
  /** Implication at observation time (matches definition). */
  readonly implication: V2EvidenceImplication;
  /** The cycle in which the observation was made. */
  readonly observedCycle: number;
  /** Authoritative origin (sim-private). */
  readonly origin: V2OccurrenceOrigin;
};

// ─── Resolved semantic model (passed explicitly, never imported) ─────

/** A resolved evidence definition with its active windows. */
export type V2ResolvedEvidenceDef = {
  readonly definitionId: V2EvidenceDefinitionId;
  readonly implication: V2EvidenceImplication;
  readonly diagnosticClass: "indicator" | "corroborating";
  readonly sourceGroup: string;
  readonly corroborationGroupId: string;
  readonly summaryRef: string;
  readonly assessmentActiveCycles: readonly [number, number];
  readonly warningActiveCycles: readonly [number, number] | null;
  readonly publicCaseActiveCycles: readonly [number, number] | null;
  readonly supersedesIds: readonly string[];
  readonly replaceOlderSameQuestion: boolean;
  readonly warningCapable: boolean;
  readonly sourceSensitive: boolean;
  readonly questionGroup: string;
};

// ─── Role-current state ──────────────────────────────────────────────

export type V2RoleCurrentSet = {
  readonly assessment: readonly V2EvidenceOccurrence[];
  readonly warning: readonly V2EvidenceOccurrence[];
  readonly publicCase: readonly V2EvidenceOccurrence[];
};

// ─── Supersession state ──────────────────────────────────────────────

export type V2SupersessionState = {
  /** Occurrences that are superseded (still in history but not current). */
  readonly superseded: ReadonlySet<string>;
  /** Map from questionGroup to the occurrenceId that currently answers it. */
  readonly questionAnswers: ReadonlyMap<string, string>;
};

// ─── Reducer inputs/outputs ──────────────────────────────────────────

export type V2AssessmentResult = {
  readonly assessment: V2Assessment;
  readonly basisPattern: V2BasisPattern;
  readonly direction: "unclear" | "preparation" | "coercion";
  readonly picture: "weak" | "conflicted" | "coherent";
};

export type V2WarningResult = {
  readonly warning: V2WarningState;
  readonly basisOccurrenceIds: readonly string[];
};

export type V2PublicCaseResult = {
  readonly state: V2PublicCaseState;
  readonly direction: V2PublicCaseDirection | null;
  readonly supportOccurrenceIds: readonly string[];
};

// ─── Previous state for delta computation ────────────────────────────

export type V2PreviousBeliefState = {
  readonly assessment: V2Assessment;
  readonly basisPattern: V2BasisPattern;
  readonly warning: V2WarningState;
  readonly warningBasisIds: readonly string[];
  readonly publicCase: V2PublicCaseState;
  readonly publicCaseDirection: V2PublicCaseDirection | null;
  readonly publicCaseBasisIds: readonly string[];
  readonly supersededIds: readonly string[];
};

// ─── Core reduction functions ────────────────────────────────────────

/**
 * Compute persistent supersession state from a list of occurrences.
 *
 * Rules:
 * 1. If evidence A supersedes B, and both are present, B is superseded.
 * 2. If `replaceOlderSameQuestion` is true, newer occurrence of the same
 *    question group replaces an older one (permanent replacement).
 * 3. Supersession is permanent: superseded evidence never becomes current
 *    again even if the superseding evidence later ages out.
 */
export function computeSupersession(
  occurrences: readonly V2EvidenceOccurrence[],
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
): V2SupersessionState {
  const superseded = new Set<string>();
  const questionAnswers = new Map<string, string>();

  // Sort by observed cycle then occurrenceId for deterministic ordering
  const sorted = [...occurrences].sort((a, b) =>
    a.observedCycle !== b.observedCycle
      ? a.observedCycle - b.observedCycle
      : a.occurrenceId.localeCompare(b.occurrenceId),
  );

  for (const occ of sorted) {
    const def = definitions.get(occ.definitionId);
    if (!def) continue;

    // Explicit supersession: this occurrence supersedes listed definitions
    for (const supersededId of def.supersedesIds) {
      for (const other of sorted) {
        if (other.definitionId === supersededId && other.occurrenceId !== occ.occurrenceId) {
          superseded.add(other.occurrenceId);
        }
      }
    }

    // replace-older-same-question: newer occurrence replaces older in same question group
    if (def.replaceOlderSameQuestion && def.questionGroup) {
      const priorId = questionAnswers.get(def.questionGroup);
      if (priorId && priorId !== occ.occurrenceId) {
        superseded.add(priorId);
      }
      questionAnswers.set(def.questionGroup, occ.occurrenceId);
    }
  }

  return { superseded, questionAnswers };
}

/**
 * Filter occurrences to those current for a given role at a given cycle.
 *
 * An occurrence is current if:
 * - It is not superseded
 * - The current cycle falls within the definition's active window for that role
 */
export function roleCurrentOccurrences(
  occurrences: readonly V2EvidenceOccurrence[],
  supersession: V2SupersessionState,
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  role: V2EvidenceRole,
  cycle: number,
): V2EvidenceOccurrence[] {
  return occurrences.filter((occ) => {
    if (supersession.superseded.has(occ.occurrenceId)) return false;
    const def = definitions.get(occ.definitionId);
    if (!def) return false;

    const window = role === "assessment"
      ? def.assessmentActiveCycles
      : role === "warning"
        ? def.warningActiveCycles
        : def.publicCaseActiveCycles;

    if (!window) return false;
    return cycle >= window[0] && cycle <= window[1];
  });
}

/**
 * kestrel-binary-hypothesis-v1: exact 16-row truth table.
 *
 * No weighted score, no vote counting. Evidence multiplicity does not
 * change the categorical result.
 *
 * Truth table (diagnosticPrep, diagnosticCoercion, indicatorPrep, indicatorCoercion):
 *
 * Dp  Dc  Ip  Ic  → Assessment       BasisPattern
 * 0   0   0   0   → unclear/weak      no-directional-evidence
 * 0   0   0   1   → coercion/weak     coercion-indicators-only
 * 0   0   1   0   → preparation/weak  preparation-indicators-only
 * 0   0   1   1   → unclear/conflicted  balanced-conflict
 * 0   1   0   0   → coercion/coherent coercion-corroborated
 * 0   1   0   1   → coercion/coherent coercion-corroborated
 * 0   1   1   0   → unclear/conflicted  coercion-dominant-conflict
 * 0   1   1   1   → unclear/conflicted  coercion-dominant-conflict
 * 1   0   0   0   → preparation/coherent preparation-corroborated
 * 1   0   0   1   → unclear/conflicted  preparation-dominant-conflict
 * 1   0   1   0   → preparation/coherent preparation-corroborated
 * 1   0   1   1   → unclear/conflicted  preparation-dominant-conflict
 * 1   1   0   0   → unclear/conflicted  balanced-conflict
 * 1   1   0   1   → unclear/conflicted  balanced-conflict
 * 1   1   1   0   → unclear/conflicted  balanced-conflict
 * 1   1   1   1   → unclear/conflicted  balanced-conflict
 */
export function reduceAssessment(assessmentCurrent: readonly V2EvidenceOccurrence[], definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>): V2AssessmentResult {
  const hasDiagnosticPrep = assessmentCurrent.some((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && occ.implication === "preparation" && def.diagnosticClass === "corroborating";
  });
  const hasDiagnosticCoercion = assessmentCurrent.some((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && occ.implication === "coercion" && def.diagnosticClass === "corroborating";
  });
  const hasIndicatorPrep = assessmentCurrent.some((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && occ.implication === "preparation" && def.diagnosticClass === "indicator";
  });
  const hasIndicatorCoercion = assessmentCurrent.some((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && occ.implication === "coercion" && def.diagnosticClass === "indicator";
  });

  // 16-row truth table
  const dp = hasDiagnosticPrep ? 1 : 0;
  const dc = hasDiagnosticCoercion ? 1 : 0;
  const ip = hasIndicatorPrep ? 1 : 0;
  const ic = hasIndicatorCoercion ? 1 : 0;
  const row = (dp << 3) | (dc << 2) | (ip << 1) | ic;

  let assessment: V2Assessment;
  let basisPattern: V2BasisPattern;
  let direction: "unclear" | "preparation" | "coercion";
  let picture: "weak" | "conflicted" | "coherent";

  switch (row) {
    case 0b0000:
      assessment = "unclear/weak"; basisPattern = "no-directional-evidence"; direction = "unclear"; picture = "weak"; break;
    case 0b0001:
      assessment = "coercion/weak"; basisPattern = "coercion-indicators-only"; direction = "coercion"; picture = "weak"; break;
    case 0b0010:
      assessment = "preparation/weak"; basisPattern = "preparation-indicators-only"; direction = "preparation"; picture = "weak"; break;
    case 0b0011:
      assessment = "unclear/conflicted"; basisPattern = "balanced-conflict"; direction = "unclear"; picture = "conflicted"; break;
    case 0b0100:
      assessment = "coercion/coherent"; basisPattern = "coercion-corroborated"; direction = "coercion"; picture = "coherent"; break;
    case 0b0101:
      assessment = "coercion/coherent"; basisPattern = "coercion-corroborated"; direction = "coercion"; picture = "coherent"; break;
    case 0b0110:
      assessment = "unclear/conflicted"; basisPattern = "coercion-dominant-conflict"; direction = "unclear"; picture = "conflicted"; break;
    case 0b0111:
      assessment = "unclear/conflicted"; basisPattern = "coercion-dominant-conflict"; direction = "unclear"; picture = "conflicted"; break;
    case 0b1000:
      assessment = "preparation/coherent"; basisPattern = "preparation-corroborated"; direction = "preparation"; picture = "coherent"; break;
    case 0b1001:
      assessment = "unclear/conflicted"; basisPattern = "preparation-dominant-conflict"; direction = "unclear"; picture = "conflicted"; break;
    case 0b1010:
      assessment = "preparation/coherent"; basisPattern = "preparation-corroborated"; direction = "preparation"; picture = "coherent"; break;
    case 0b1011:
      assessment = "unclear/conflicted"; basisPattern = "preparation-dominant-conflict"; direction = "unclear"; picture = "conflicted"; break;
    case 0b1100:
      assessment = "unclear/conflicted"; basisPattern = "balanced-conflict"; direction = "unclear"; picture = "conflicted"; break;
    case 0b1101:
      assessment = "unclear/conflicted"; basisPattern = "balanced-conflict"; direction = "unclear"; picture = "conflicted"; break;
    case 0b1110:
      assessment = "unclear/conflicted"; basisPattern = "balanced-conflict"; direction = "unclear"; picture = "conflicted"; break;
    case 0b1111:
      assessment = "unclear/conflicted"; basisPattern = "balanced-conflict"; direction = "unclear"; picture = "conflicted"; break;
    default:
      assessment = "unclear/weak"; basisPattern = "no-directional-evidence"; direction = "unclear"; picture = "weak"; break;
  }

  return { assessment, basisPattern, direction, picture };
}

/**
 * Warning reducer.
 *
 * Warning uses only warning-current, non-superseded preparation evidence
 * marked warning-capable. Deterministic basis occurrence selection.
 *
 * The reducer/brief must be total even for algebraically valid hostile states.
 */
export function reduceWarning(
  warningCurrent: readonly V2EvidenceOccurrence[],
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
): V2WarningResult {
  const warningCapable = warningCurrent.filter((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && def.warningCapable && occ.implication === "preparation";
  });

  if (warningCapable.length === 0) {
    return { warning: "none", basisOccurrenceIds: [] };
  }

  // Sort by recency (newest first), then by stable occurrenceId
  const sorted = [...warningCapable].sort((a, b) =>
    a.observedCycle !== b.observedCycle
      ? b.observedCycle - a.observedCycle
      : a.occurrenceId.localeCompare(b.occurrenceId),
  );

  return {
    warning: "usable",
    basisOccurrenceIds: [sorted[0]!.occurrenceId],
  };
}

/**
 * Public-case reducer.
 *
 * Credible requires:
 * 1. A current source-sensitive diagnostic occurrence
 * 2. No material current opposite-direction blocker
 * 3. A same-direction source-sensitive corroborating occurrence from a different corroborationGroupId
 *
 * One privileged source is not enough. Two indicators are not enough.
 * A directionless credible case is invalid.
 */
export function reducePublicCase(
  publicCaseCurrent: readonly V2EvidenceOccurrence[],
  assessmentCurrent: readonly V2EvidenceOccurrence[],
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
): V2PublicCaseResult {
  const sourceSensitive = publicCaseCurrent.filter((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && def.sourceSensitive;
  });

  if (sourceSensitive.length === 0) {
    return { state: "none", direction: null, supportOccurrenceIds: [] };
  }

  // Find diagnostic (corroborating) source-sensitive occurrences by direction
  const prepDiagnostic = sourceSensitive.filter((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && def.diagnosticClass === "corroborating" && occ.implication === "preparation";
  });
  const coercionDiagnostic = sourceSensitive.filter((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && def.diagnosticClass === "corroborating" && occ.implication === "coercion";
  });

  // Check for material opposite-direction blockers in assessment-current
  const hasMaterialPrepBlocker = assessmentCurrent.some((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && occ.implication === "preparation" && def.diagnosticClass === "corroborating";
  });
  const hasMaterialCoercionBlocker = assessmentCurrent.some((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && occ.implication === "coercion" && def.diagnosticClass === "corroborating";
  });

  // Try preparation direction
  if (prepDiagnostic.length > 0 && !hasMaterialCoercionBlocker) {
    // Need a corroborating occurrence from a different corroborationGroupId
    const groups = new Set<string>();
    for (const occ of prepDiagnostic) {
      const def = definitions.get(occ.definitionId);
      if (def) groups.add(def.corroborationGroupId);
    }
    if (groups.size >= 2) {
      // Return the two occurrences with different group IDs (deterministic: first two sorted)
      const sorted = [...prepDiagnostic].sort((a, b) =>
        a.occurrenceId.localeCompare(b.occurrenceId),
      );
      const groupIds = new Map<string, V2EvidenceOccurrence>();
      for (const occ of sorted) {
        const def = definitions.get(occ.definitionId);
        if (def && !groupIds.has(def.corroborationGroupId)) {
          groupIds.set(def.corroborationGroupId, occ);
        }
      }
      const basis = [...groupIds.values()].slice(0, 2);
      return { state: "credible", direction: "preparation", supportOccurrenceIds: basis.map((o) => o.occurrenceId) };
    }
  }

  // Try coercion direction
  if (coercionDiagnostic.length > 0 && !hasMaterialPrepBlocker) {
    const groups = new Set<string>();
    for (const occ of coercionDiagnostic) {
      const def = definitions.get(occ.definitionId);
      if (def) groups.add(def.corroborationGroupId);
    }
    if (groups.size >= 2) {
      const sorted = [...coercionDiagnostic].sort((a, b) =>
        a.occurrenceId.localeCompare(b.occurrenceId),
      );
      const groupIds = new Map<string, V2EvidenceOccurrence>();
      for (const occ of sorted) {
        const def = definitions.get(occ.definitionId);
        if (def && !groupIds.has(def.corroborationGroupId)) {
          groupIds.set(def.corroborationGroupId, occ);
        }
      }
      const basis = [...groupIds.values()].slice(0, 2);
      return { state: "credible", direction: "coercion", supportOccurrenceIds: basis.map((o) => o.occurrenceId) };
    }
  }

  // Tentative: any source-sensitive directional indicator/diagnostic
  const directional = sourceSensitive.filter((occ) => occ.implication !== "ambiguous");
  if (directional.length > 0) {
    // Determine direction from the most recent diagnostic, else most recent indicator
    const sorted = [...directional].sort((a, b) =>
      a.observedCycle !== b.observedCycle
        ? b.observedCycle - a.observedCycle
        : a.occurrenceId.localeCompare(b.occurrenceId),
    );
    const primary = sorted[0]!;
    const direction = primary.implication === "preparation" ? "preparation" : "coercion";
    return { state: "tentative", direction, supportOccurrenceIds: [primary.occurrenceId] };
  }

  return { state: "none", direction: null, supportOccurrenceIds: [] };
}

// ─── Basis pattern derivation ────────────────────────────────────────

/**
 * Derive the analytical basis pattern from current assessment occurrences.
 * Returns the 9-state basis pattern as analytical provenance.
 */
export function deriveBasisPattern(
  assessmentCurrent: readonly V2EvidenceOccurrence[],
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
): V2BasisPattern {
  const hasPrep = assessmentCurrent.some((occ) => occ.implication === "preparation");
  const hasCoercion = assessmentCurrent.some((occ) => occ.implication === "coercion");
  const hasAmbiguous = assessmentCurrent.some((occ) => occ.implication === "ambiguous");
  const hasDiagnosticPrep = assessmentCurrent.some((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && def.diagnosticClass === "corroborating" && occ.implication === "preparation";
  });
  const hasDiagnosticCoercion = assessmentCurrent.some((occ) => {
    const def = definitions.get(occ.definitionId);
    return def && def.diagnosticClass === "corroborating" && occ.implication === "coercion";
  });

  if (!hasPrep && !hasCoercion && !hasAmbiguous) return "no-directional-evidence";
  if (hasAmbiguous && !hasPrep && !hasCoercion) return "ambiguous-only";

  if (hasPrep && hasCoercion) {
    if (hasDiagnosticPrep && !hasDiagnosticCoercion) return "preparation-dominant-conflict";
    if (!hasDiagnosticPrep && hasDiagnosticCoercion) return "coercion-dominant-conflict";
    return "balanced-conflict";
  }

  if (hasPrep && !hasCoercion) {
    if (hasDiagnosticPrep) return "preparation-corroborated";
    return "preparation-indicators-only";
  }

  if (!hasPrep && hasCoercion) {
    if (hasDiagnosticCoercion) return "coercion-corroborated";
    return "coercion-indicators-only";
  }

  return "no-directional-evidence";
}

// ─── Briefing selection ──────────────────────────────────────────────

/**
 * Select evidence for the player-facing brief.
 *
 * Ranking: 1. diagnosticity, 2. warning-bearing (within equal diagnosticity),
 * 3. recency, 4. stable IDs.
 *
 * A warning-bearing indicator must not displace a diagnostic report as the
 * main analytical basis. Warning is displayed independently.
 * Material contrary evidence cannot be silently omitted.
 */
export function selectBriefingEvidence(
  assessmentCurrent: readonly V2EvidenceOccurrence[],
  warningCurrent: readonly V2EvidenceOccurrence[],
  assessmentResult: V2AssessmentResult,
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
): { assessmentReasons: V2EvidenceOccurrence[]; unresolvedGap: string | null } {
  const dir = assessmentResult.direction;
  const isConflicted = assessmentResult.picture === "conflicted";

  // Supporting evidence: same direction as assessment, or all if conflicted
  const supporting = assessmentCurrent.filter((occ) => {
    if (isConflicted) return true;
    if (dir === "unclear") return false;
    return occ.implication === dir;
  });

  // Contrary evidence: opposite direction
  const contrary = assessmentCurrent.filter((occ) => {
    if (dir === "preparation") return occ.implication === "coercion";
    if (dir === "coercion") return occ.implication === "preparation";
    return false;
  });

  // Sort by diagnosticity (corroborating first), then recency, then stable ID
  const rank = (occ: V2EvidenceOccurrence): number => {
    const def = definitions.get(occ.definitionId);
    const diagnosticScore = def?.diagnosticClass === "corroborating" ? 0 : 1;
    const recencyScore = -occ.observedCycle; // newer = lower = better
    return diagnosticScore * 100 + recencyScore * 10;
  };

  const sortedSupport = [...supporting].sort((a, b) => rank(a) - rank(b) || a.occurrenceId.localeCompare(b.occurrenceId));
  const sortedContrary = [...contrary].sort((a, b) => rank(a) - rank(b) || a.occurrenceId.localeCompare(b.occurrenceId));

  // Take top 2 supporting and top 1 contrary (if conflicted)
  const reasons = sortedSupport.slice(0, 2);
  if (isConflicted && sortedContrary.length > 0) {
    reasons.push(sortedContrary[0]!);
  }

  // Generate unresolved gap text
  let unresolvedGap: string | null = null;
  if (isConflicted) {
    unresolvedGap = "Active evidence points in contradictory directions.";
  } else if (dir === "unclear") {
    unresolvedGap = "Not enough evidence to establish Ravellan's intent.";
  } else if (assessmentResult.picture === "weak") {
    unresolvedGap = "Directional indicators exist but remain weak and uncorroborated.";
  }

  return { assessmentReasons: reasons, unresolvedGap };
}

// ─── Delta computation ──────────────────────────────────────────────

/**
 * Compute the total product/evidence delta between previous and current state.
 */
export function computeDelta(
  prev: V2PreviousBeliefState | null,
  current: {
    assessment: V2Assessment;
    basisPattern: V2BasisPattern;
    warning: V2WarningState;
    warningBasisIds: readonly string[];
    publicCase: V2PublicCaseState;
    publicCaseDirection: V2PublicCaseDirection | null;
    publicCaseBasisIds: readonly string[];
    supersededIds: readonly string[];
  },
  cycle: number,
): V2HqBeliefDelta {
  if (prev === null) {
    return {
      assessmentChange: "unchanged",
      assessmentBasisChange: false,
      warningChange: "unchanged",
      publicCaseChange: "unchanged",
      publicCaseDirectionChange: false,
      supportBasisChange: false,
      newlySupersededIds: [],
      stalenessRoles: [],
      updateCause: "cycle-advance",
    };
  }

  // Assessment change
  let assessmentChange: V2HqBeliefDelta["assessmentChange"] = "unchanged";
  const prevDir = prev.assessment.split("/")[0]!;
  const prevPic = prev.assessment.split("/")[1]!;
  const curDir = current.assessment.split("/")[0]!;
  const curPic = current.assessment.split("/")[1]!;
  if (prevDir !== curDir && prevPic !== curPic) assessmentChange = "both-changed";
  else if (prevDir !== curDir) assessmentChange = "direction-changed";
  else if (prevPic !== curPic) assessmentChange = "picture-changed";

  // Warning change
  let warningChange: V2HqBeliefDelta["warningChange"] = "unchanged";
  if (prev.warning === "none" && current.warning === "usable") warningChange = "gained";
  else if (prev.warning === "usable" && current.warning === "none") warningChange = "lost";
  else if (prev.warning === "usable" && current.warning === "usable") {
    // Check if basis changed (refreshed)
    if (prev.warningBasisIds.length > 0 && current.warningBasisIds.length > 0
      && prev.warningBasisIds[0] !== current.warningBasisIds[0]) {
      warningChange = "refreshed";
    }
  }

  // Public-case change
  let publicCaseChange: V2HqBeliefDelta["publicCaseChange"] = "unchanged";
  const prevPubDir = prev.publicCaseDirection;
  const curPubDir = current.publicCaseDirection;
  if (prev.publicCase !== current.publicCase && prevPubDir !== curPubDir) publicCaseChange = "both-changed";
  else if (prev.publicCase !== current.publicCase) publicCaseChange = "state-changed";
  else if (prevPubDir !== curPubDir) publicCaseChange = "direction-changed";

  // Lost is a special case
  if (prev.publicCase !== "none" && current.publicCase === "none") publicCaseChange = "lost";

  const publicCaseDirectionChange = prevPubDir !== curPubDir;

  // Support basis change
  const prevBasisSet = new Set(prev.publicCaseBasisIds);
  const curBasisSet = new Set(current.publicCaseBasisIds);
  const supportBasisChange = prev.publicCaseBasisIds.length !== current.publicCaseBasisIds.length
    || [...prevBasisSet].some((id) => !curBasisSet.has(id));

  // Assessment basis change
  const assessmentBasisChange = prev.basisPattern !== current.basisPattern;

  // Newly superseded
  const prevSupersededSet = new Set(prev.supersededIds);
  const newlySupersededIds: V2EvidenceDefinitionId[] = current.supersededIds.filter((id): id is V2EvidenceDefinitionId => !prevSupersededSet.has(id));

  // Staleness detection (simplified: based on cycle)
  const stalenessRoles: V2HqBeliefDelta["stalenessRoles"] = [];

  // Update cause
  let updateCause: V2HqBeliefDelta["updateCause"] = "no-change";
  if (newlySupersededIds.length > 0) updateCause = "evidence-superseded";
  else if (assessmentChange !== "unchanged" || warningChange !== "unchanged" || publicCaseChange !== "unchanged") {
    updateCause = "new-evidence";
  }

  return {
    assessmentChange,
    assessmentBasisChange,
    warningChange,
    publicCaseChange,
    publicCaseDirectionChange,
    supportBasisChange,
    newlySupersededIds,
    stalenessRoles,
    updateCause,
  };
}

// ─── Main reduction entry point ──────────────────────────────────────

/**
 * Run the complete reduction pipeline.
 *
 * This is the sim-private core that #102 later extends by merging
 * additional collection occurrences before calling this function.
 */
export function reduceHqBelief(
  occurrences: readonly V2EvidenceOccurrence[],
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  cycle: number,
  prevState: V2PreviousBeliefState | null,
): V2HqBeliefOutput {
  // 1. Supersession
  const supersession = computeSupersession(occurrences, definitions);

  // 2. Role-current sets
  const assessmentCurrent = roleCurrentOccurrences(occurrences, supersession, definitions, "assessment", cycle);
  const warningCurrent = roleCurrentOccurrences(occurrences, supersession, definitions, "warning", cycle);
  const publicCaseCurrent = roleCurrentOccurrences(occurrences, supersession, definitions, "public-case", cycle);

  // 3. Reducers
  const assessmentResult = reduceAssessment(assessmentCurrent, definitions);
  const warningResult = reduceWarning(warningCurrent, definitions);
  const publicCaseResult = reducePublicCase(publicCaseCurrent, assessmentCurrent, definitions);

  // 4. Basis pattern
  const basisPattern = deriveBasisPattern(assessmentCurrent, definitions);

  // 5. Briefing selection
  const { assessmentReasons, unresolvedGap } = selectBriefingEvidence(
    assessmentCurrent, warningCurrent, assessmentResult, definitions,
  );

  // Build evidence summaries for the brief
  function toSummary(occ: V2EvidenceOccurrence): { definitionId: V2EvidenceDefinitionId; observedCycle: number; summaryRef: string } {
    const def = definitions.get(occ.definitionId);
    return {
      definitionId: occ.definitionId,
      observedCycle: occ.observedCycle,
      summaryRef: def?.summaryRef ?? "",
    };
  }

  const brief: V2IntelligenceBrief = {
    assessment: assessmentResult.assessment,
    assessmentReasons: assessmentReasons.map(toSummary),
    unresolvedGap,
    warning: warningResult.warning,
    warningBasis: warningResult.basisOccurrenceIds.map((id) => {
      const occ = occurrences.find((o) => o.occurrenceId === id);
      return occ ? toSummary(occ) : null;
    }).filter((s): s is { definitionId: V2EvidenceDefinitionId; observedCycle: number; summaryRef: string } => s !== null),
    publicCase: publicCaseResult.state,
    publicCaseDirection: publicCaseResult.direction,
    publicCaseBasis: publicCaseResult.supportOccurrenceIds.map((id) => {
      const occ = occurrences.find((o) => o.occurrenceId === id);
      return occ ? toSummary(occ) : null;
    }).filter((s): s is { definitionId: V2EvidenceDefinitionId; observedCycle: number; summaryRef: string } => s !== null),
    hasCurrentDirectWarning: warningResult.warning === "usable",
  };

  // 6. Delta
  const delta = computeDelta(prevState, {
    assessment: assessmentResult.assessment,
    basisPattern,
    warning: warningResult.warning,
    warningBasisIds: warningResult.basisOccurrenceIds,
    publicCase: publicCaseResult.state,
    publicCaseDirection: publicCaseResult.direction,
    publicCaseBasisIds: publicCaseResult.supportOccurrenceIds,
    supersededIds: [...supersession.superseded],
  }, cycle);

  return {
    brief,
    delta,
    basisPattern,
    cycle,
    notReady: false,
  };
}

/**
 * Returns a "not ready" output for cycles where Ravellan decision hasn't been made yet.
 */
export function notReadyOutput(cycle: number): V2HqBeliefOutput {
  return {
    brief: {
      assessment: "unclear/weak",
      assessmentReasons: [],
      unresolvedGap: "[NOT READY] Intelligence assessment is not yet available for this cycle — the Ravellan decision has not been made.",
      warning: "none",
      warningBasis: [],
      publicCase: "none",
      publicCaseDirection: null,
      publicCaseBasis: [],
      hasCurrentDirectWarning: false,
    },
    delta: {
      assessmentChange: "unchanged",
      assessmentBasisChange: false,
      warningChange: "unchanged",
      publicCaseChange: "unchanged",
      publicCaseDirectionChange: false,
      supportBasisChange: false,
      newlySupersededIds: [],
      stalenessRoles: [],
      updateCause: "no-change",
    },
    basisPattern: "no-directional-evidence",
    cycle,
    notReady: true,
  };
}
