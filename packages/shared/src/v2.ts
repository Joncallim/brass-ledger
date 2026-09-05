import { z } from "zod";

/**
 * V2 is deliberately a parallel save/replay format.  These contracts are
 * intentionally too small to express a command cycle: #96 owns orders and
 * #97 onward own state.  Rejecting unknown data here is safer than treating
 * unreviewed mechanics as opaque future payloads.
 */
export const v2RulesetTag = "v2" as const;
/**
 * #97 changes the persisted bootstrap state. Earlier V2 skeleton saves are
 * intentionally not parsed as this format: no migration has been authored.
 */
export const v2CurrentRulesetVersion = "0.4.0-prototype" as const;
export const sha256DigestSchema = z.string().regex(/^[a-f0-9]{64}$/, "must be a lowercase SHA-256 digest");

export const v2IdentitySchema = z.object({
  ruleset: z.literal(v2RulesetTag),
  rulesetVersion: z.literal(v2CurrentRulesetVersion),
  scenarioId: z.string().min(1),
  contentVersion: z.string().min(1),
  contentDigest: sha256DigestSchema,
}).strict();
export type V2Identity = z.infer<typeof v2IdentitySchema>;

/**
 * The deliberately small state surface owned by the order contract.  Later
 * issues add world, belief, commitments, and consequences as separate fields;
 * none of those may be smuggled into this root before their contracts exist.
 */
export const v2RavellanPostureSchema = z.enum(["genuine_preparation", "coercive_feint", "testing"]);
export type V2RavellanPosture = z.infer<typeof v2RavellanPostureSchema>;
export const v2RavellanPreparationSchema = z.enum(["none", "developing", "ready"]);
export type V2RavellanPreparation = z.infer<typeof v2RavellanPreparationSchema>;
export const v2RavellanNormalActionSchema = z.enum(["probe_shipping", "seed_deception", "prepare_beacon_seizure", "pause_consolidate"]);
export type V2RavellanNormalAction = z.infer<typeof v2RavellanNormalActionSchema>;
export const v2RavellanTerminalActionSchema = z.enum(["attempt_seizure", "threshold_challenge", "abort_and_pressure"]);
export type V2RavellanTerminalAction = z.infer<typeof v2RavellanTerminalActionSchema>;
export const v2RavellanActionSchema = z.union([v2RavellanNormalActionSchema, v2RavellanTerminalActionSchema]);
export type V2RavellanAction = z.infer<typeof v2RavellanActionSchema>;
/** Persisted system evidence; never a client command. */
export const v2RavellanDecisionSchema = z.object({
  action: v2RavellanActionSchema,
  matchedPolicyRowId: z.enum([
    "C1",
    "GP-1", "GP-2", "GP-3", "GP-4", "GP-5",
    "CF-1", "CF-2", "CF-3", "CF-4", "CF-5",
    "T-1", "T-2", "T-3", "T-4", "T-5",
    "R6-1", "R6-2", "R6-3", "R6-4", "R6-5",
  ]),
  nextPosture: v2RavellanPostureSchema,
  nextPreparation: v2RavellanPreparationSchema,
}).strict();
export type V2RavellanDecision = z.infer<typeof v2RavellanDecisionSchema>;

export const v2RavellanObservationSchema = z.discriminatedUnion("signal", [
  z.object({ signal: z.literal("beacon_coverage_signal"), value: z.enum(["weak", "credible"]), observedCycle: z.number().int().min(1), source: z.string().min(1) }).strict(),
  z.object({ signal: z.literal("visible_denial_signal"), value: z.enum(["withheld", "demonstrated"]), observedCycle: z.number().int().min(1), source: z.string().min(1) }).strict(),
  z.object({ signal: z.literal("coalition_unity_signal"), value: z.enum(["fractured", "coherent"]), observedCycle: z.number().int().min(1), source: z.string().min(1) }).strict(),
  z.object({ signal: z.literal("reserve_exhaustion_signal"), value: z.literal("suspected"), observedCycle: z.number().int().min(1), source: z.string().min(1) }).strict(),
  z.object({ signal: z.literal("ravellan_discovery_signal"), value: z.literal("suspected"), observedCycle: z.number().int().min(1), source: z.string().min(1) }).strict(),
]);
export type V2RavellanObservation = z.infer<typeof v2RavellanObservationSchema>;
export const v2RavellanStateSchema = z.object({
  posture: v2RavellanPostureSchema,
  preparation: v2RavellanPreparationSchema,
  observations: z.array(v2RavellanObservationSchema),
}).strict();
export type V2RavellanState = z.infer<typeof v2RavellanStateSchema>;

export const v2BootstrapStateSchema = z.object({
  cycle: z.number().int().min(1),
  seed: z.string().min(1),
  ravellan: v2RavellanStateSchema,
  /** Null until the one opening declaration has been authoritatively recorded. */
  standingIntent: z.lazy(() => v2StandingIntentSchema).nullable(),
}).strict();
export type V2BootstrapState = z.infer<typeof v2BootstrapStateSchema>;

/**
 * Internal, serialisable vocabulary for the four B1 choices. Presentation
 * owns the plain-language questions and answers; these identifiers are never
 * player-facing labels.
 */
export const v2MainPrioritySchema = z.enum(["beacon-security", "partner-cooperation", "ravellan-understanding"]);
export const v2RedLineSchema = z.enum(["civilian-shipping", "partner-consultation", "reserve-readiness"]);
export const v2ToleratedCostSchema = z.enum(["weaker-deterrence", "political-friction", "reserve-strain"]);
export const v2DefaultStyleSchema = z.enum(["quiet-preparation", "visible-deterrence", "partner-consultation"]);

export const v2StandingIntentSchema = z.object({
  mainPriority: v2MainPrioritySchema,
  redLine: v2RedLineSchema,
  toleratedCost: v2ToleratedCostSchema,
  defaultStyle: v2DefaultStyleSchema,
}).strict();
export type V2StandingIntent = z.infer<typeof v2StandingIntentSchema>;

export const v2IntentReasonRefSchema = z.discriminatedUnion("field", [
  z.object({ field: z.literal("mainPriority"), value: v2MainPrioritySchema }).strict(),
  z.object({ field: z.literal("redLine"), value: v2RedLineSchema }).strict(),
  z.object({ field: z.literal("toleratedCost"), value: v2ToleratedCostSchema }).strict(),
  z.object({ field: z.literal("defaultStyle"), value: v2DefaultStyleSchema }).strict(),
]);
export type V2IntentReasonRef = z.infer<typeof v2IntentReasonRefSchema>;

/** Canonical, typed references for later recommendation/readout contracts. */
export function v2IntentReasonRefs(intent: V2StandingIntent): readonly [
  Extract<V2IntentReasonRef, { field: "redLine" }>,
  Extract<V2IntentReasonRef, { field: "mainPriority" }>,
  Extract<V2IntentReasonRef, { field: "defaultStyle" }>,
  Extract<V2IntentReasonRef, { field: "toleratedCost" }>,
] {
  return [
    { field: "redLine", value: intent.redLine },
    { field: "mainPriority", value: intent.mainPriority },
    { field: "defaultStyle", value: intent.defaultStyle },
    { field: "toleratedCost", value: intent.toleratedCost },
  ];
}

/** The opening action is separate from a cycle command and consumes no token. */
export const v2IntentDeclarationSchema = z.object({
  cycle: z.literal(1),
  expectedRevision: z.number().int().min(0),
  intent: v2StandingIntentSchema,
}).strict();
export type V2IntentDeclaration = z.infer<typeof v2IntentDeclarationSchema>;

/** Fixed named owners keep delegation legible without making it UI-owned. */
export const v2OfficerSchema = z.enum(["intelligence", "operations", "political"]);
export type V2Officer = z.infer<typeof v2OfficerSchema>;

/**
 * Content supplies these trusted agenda definitions.  They are intentionally
 * not a player command payload: a browser may submit dispositions only.
 */
export const v2AgendaOrderSchema = z.object({
  id: z.string().min(1),
}).strict();
export type V2AgendaOrder = z.infer<typeof v2AgendaOrderSchema>;

export const v2AgendaIssueSchema = z.object({
  id: z.string().min(1),
  responsibleOfficer: v2OfficerSchema,
  recommendedOrderId: z.string().min(1),
  /** Exactly one staff recommendation plus one or two authored alternatives. */
  authoredOrders: z.array(v2AgendaOrderSchema).min(2).max(3),
  mayDefer: z.boolean(),
}).strict();
export type V2AgendaIssue = z.infer<typeof v2AgendaIssueSchema>;

export const v2DelegateDispositionSchema = z.object({
  issueId: z.string().min(1),
  kind: z.literal("delegate"),
}).strict();
export const v2InterveneDispositionSchema = z.object({
  issueId: z.string().min(1),
  kind: z.literal("intervene"),
  orderId: z.string().min(1),
}).strict();
export const v2DeferDispositionSchema = z.object({
  issueId: z.string().min(1),
  kind: z.literal("defer"),
}).strict();
export const v2IssueDispositionSchema = z.discriminatedUnion("kind", [
  v2DelegateDispositionSchema,
  v2InterveneDispositionSchema,
  v2DeferDispositionSchema,
]);
export type V2IssueDisposition = z.infer<typeof v2IssueDispositionSchema>;

/** One all-or-nothing cycle command. Agenda order is verified by the sim. */
export const v2CommandSetSchema = z.object({
  cycle: z.number().int().min(1),
  expectedRevision: z.number().int().min(0),
  dispositions: z.array(v2IssueDispositionSchema),
}).strict();
export type V2CommandSet = z.infer<typeof v2CommandSetSchema>;

/** The authoritative result stored in the ledger, never supplied by a client. */
export const v2DelegatedFinalOrderSchema = z.object({
  issueId: z.string().min(1),
  responsibleOfficer: v2OfficerSchema,
  disposition: z.literal("delegate"),
  orderId: z.string().min(1),
  interventionCost: z.literal(0),
}).strict();
export const v2IntervenedFinalOrderSchema = z.object({
  issueId: z.string().min(1),
  responsibleOfficer: v2OfficerSchema,
  disposition: z.literal("intervene"),
  orderId: z.string().min(1),
  interventionCost: z.literal(1),
}).strict();
export const v2DeferredFinalOrderSchema = z.object({
  issueId: z.string().min(1),
  responsibleOfficer: v2OfficerSchema,
  disposition: z.literal("defer"),
  orderId: z.null(),
  interventionCost: z.literal(0),
}).strict();
export const v2FinalOrderSchema = z.discriminatedUnion("disposition", [
  v2DelegatedFinalOrderSchema,
  v2IntervenedFinalOrderSchema,
  v2DeferredFinalOrderSchema,
]);
export type V2FinalOrder = z.infer<typeof v2FinalOrderSchema>;

/**
 * Every entry carries its canonical input and output evidence. Future action
 * kinds must be explicitly discriminated rather than appended as opaque data.
 */
export const v2CommandSetLedgerEntrySchema = z.object({
  kind: z.literal("command-set"),
  commandSet: v2CommandSetSchema,
  finalOrders: z.array(v2FinalOrderSchema),
  interventionCost: z.number().int().min(0).max(2),
  preState: v2BootstrapStateSchema,
  postState: v2BootstrapStateSchema,
  preRevision: z.number().int().min(0),
  postRevision: z.number().int().min(0),
  preStateHash: sha256DigestSchema,
  postStateHash: sha256DigestSchema,
}).strict();
export type V2CommandSetLedgerEntry = z.infer<typeof v2CommandSetLedgerEntrySchema>;

/**
 * Ravellan is an authoritative system transition, not evidence attached to a
 * player command. Its full state snapshots make the hidden policy replayable
 * without ever trusting a client-facing history.
 */
export const v2RavellanDecisionLedgerEntrySchema = z.object({
  kind: z.literal("ravellan-decision"),
  cycle: z.number().int().min(1).max(6),
  decision: v2RavellanDecisionSchema,
  preState: v2BootstrapStateSchema,
  postState: v2BootstrapStateSchema,
  preRevision: z.number().int().min(0),
  postRevision: z.number().int().min(0),
  preStateHash: sha256DigestSchema,
  postStateHash: sha256DigestSchema,
}).strict();
export type V2RavellanDecisionLedgerEntry = z.infer<typeof v2RavellanDecisionLedgerEntrySchema>;

export const v2IntentDeclarationLedgerEntrySchema = z.object({
  kind: z.literal("intent-declaration"),
  intentDeclaration: v2IntentDeclarationSchema,
  preState: v2BootstrapStateSchema,
  postState: v2BootstrapStateSchema,
  preRevision: z.number().int().min(0),
  postRevision: z.number().int().min(0),
  preStateHash: sha256DigestSchema,
  postStateHash: sha256DigestSchema,
}).strict();
export type V2IntentDeclarationLedgerEntry = z.infer<typeof v2IntentDeclarationLedgerEntrySchema>;

export const v2ActionLedgerEntrySchema = z.discriminatedUnion("kind", [
  v2IntentDeclarationLedgerEntrySchema,
  v2RavellanDecisionLedgerEntrySchema,
  v2CommandSetLedgerEntrySchema,
]);
export type V2ActionLedgerEntry = z.infer<typeof v2ActionLedgerEntrySchema>;

export const v2ActionLedgerSchema = z.array(v2ActionLedgerEntrySchema);
export type V2ActionLedger = z.infer<typeof v2ActionLedgerSchema>;

export const v2SessionSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  revision: z.number().int().min(0),
  identity: v2IdentitySchema,
  initialState: v2BootstrapStateSchema,
  state: v2BootstrapStateSchema,
  actionLedger: v2ActionLedgerSchema,
  initialStateDigest: sha256DigestSchema,
  finalStateDigest: sha256DigestSchema,
  updatedAt: z.string().datetime(),
}).strict();
export type V2Session = z.infer<typeof v2SessionSchema>;

export const v2SessionExportSchema = z.object({
  exportedAt: z.string().datetime(),
  session: v2SessionSchema,
}).strict();
export type V2SessionExport = z.infer<typeof v2SessionExportSchema>;

/**
 * Dispatch is based on an explicit V2 discriminator.  V1 has no discriminator
 * by design and remains parsed by its legacy schema; this helper must be called
 * before it so V2 cannot be silently stripped into a V1-shaped object.
 */
export function isV2SessionPayload(value: unknown): value is { identity?: { ruleset?: unknown } } {
  return typeof value === "object" && value !== null
    && "identity" in value
    && typeof (value as { identity?: unknown }).identity === "object"
    && (value as { identity?: { ruleset?: unknown } }).identity?.ruleset === v2RulesetTag;
}

export function isV2ExportPayload(value: unknown): value is { session?: unknown } {
  return typeof value === "object" && value !== null
    && "session" in value
    && isV2SessionPayload((value as { session?: unknown }).session);
}

// ============================================================
// ============================================================
// #100 — HQ belief / intelligence projection derived types
// ============================================================
// These are pure derived/public schemas. No persisted V2 session
// or ledger state is added here. Runtime occurrence/origin and
// verified-context payload remain sim-private.
//
// Canonical authorities:
//   23-HQ-BELIEF-AND-EVIDENCE — product/tradecraft semantics
//   23A-HQ-BELIEF-EXECUTION-ARCHITECTURE — execution/replay architecture
//   23B-HQ-BELIEF-STATE-SPACE-AUDIT — exhaustive state-space contract
//   23C-HQ-BELIEF-EVIDENCE-CATALOG — exact evidence catalog
//   23D-HQ-BELIEF-BRIEF-AND-DELTA-MATRIX — briefing/delta semantics

/** Evidence implication direction per 23 §3. */
export const v2EvidenceImplicationSchema = z.enum(["preparation", "coercion", "ambiguous"]);
export type V2EvidenceImplication = z.infer<typeof v2EvidenceImplicationSchema>;

/** Evidence diagnostic class per 23A §7. */
export const v2EvidenceDiagnosticitySchema = z.enum(["indicator", "diagnostic"]);
export type V2EvidenceDiagnosticity = z.infer<typeof v2EvidenceDiagnosticitySchema>;

/** Claim ID per 23C §1. */
export const v2HqClaimIdSchema = z.literal("ravellan-intent");

/** Question IDs per 23C §1. */
export const v2HqQuestionIdSchema = z.enum([
  "ravellan-intent-general",
  "landing-force-staging",
  "auxiliary-tasking",
  "operational-sequence",
]);
export type V2HqQuestionId = z.infer<typeof v2HqQuestionIdSchema>;

/** Producer kinds per 23C §1. */
export const v2HqProducerKindSchema = z.enum(["ordinary", "reroute", "focused", "lattice", "liaison"]);
export type V2HqProducerKind = z.infer<typeof v2HqProducerKindSchema>;

/** Supersession policies per 23C §1. */
export const v2HqSupersessionPolicySchema = z.enum(["explicit-only", "replace-older-same-question"]);
export type V2HqSupersessionPolicy = z.infer<typeof v2HqSupersessionPolicySchema>;

/** Corroboration groups per 23C §1. */
export const v2HqCorroborationGroupIdSchema = z.enum([
  "physical-staging",
  "auxiliary-tasking",
  "operational-sequence",
  "partner-liaison",
]);
export type V2HqCorroborationGroupId = z.infer<typeof v2HqCorroborationGroupIdSchema>;

/** Stable evidence definition ID — exact 19 IDs from 23C §2. */
export const v2EvidenceDefinitionIdSchema = z.enum([
  "opening-pressure-ambiguous",
  "shipping-probe-ambiguous",
  "staging-logistics-anomaly",
  "combat-elements-dispersed",
  "cycle4-pressure-pattern-ambiguous",
  "reroute-auxiliary-coercive",
  "reroute-auxiliary-unclear",
  "focused-staging-buildup",
  "focused-staging-empty",
  "lattice-landing-concentration",
  "lattice-landing-dispersed",
  "lattice-auxiliary-coercive",
  "lattice-auxiliary-mixed",
  "lattice-sync-preparation-sequence",
  "lattice-sync-preparation-signal",
  "lattice-sync-coercive-sequence",
  "lattice-sync-partial",
  "liaison-auxiliary-coercive-links",
  "liaison-auxiliary-unclear",
]);
export type V2EvidenceDefinitionId = z.infer<typeof v2EvidenceDefinitionIdSchema>;

/** Source group ID for evidence definitions per 23C §9. */
export const v2EvidenceSourceGroupSchema = z.enum([
  "routine-opening-pressure",
  "routine-maritime-pressure",
  "routine-regional-logistics",
  "routine-force-disposition",
  "routine-visible-pattern",
  "reroute-auxiliary-monitoring",
  "focused-staging-collection",
  "lattice-landing-collection",
  "lattice-auxiliary-collection",
  "lattice-sequence-analysis",
  "partner-liaison-reporting",
]);
export type V2EvidenceSourceGroup = z.infer<typeof v2EvidenceSourceGroupSchema>;

/** Role-specific relevance window types per 23A §8. */
export const v2EvidenceRoleSchema = z.enum(["assessment", "warning", "public-case"]);
export type V2EvidenceRole = z.infer<typeof v2EvidenceRoleSchema>;

/** Relevance rule per 23A §8. */
export const v2HqRelevanceRuleSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("none") }),
  z.object({ kind: z.literal("fixed"), observedCycle: z.number().int().min(1).max(6), currentThroughCycle: z.number().int().min(1).max(6) }),
  z.object({ kind: z.literal("result-through-terminal") }),
]);
export type V2HqRelevanceRule = z.infer<typeof v2HqRelevanceRuleSchema>;

/** Intent assessment direction per 23 §3. */
export const v2HqDirectionSchema = z.enum(["unclear", "preparation", "coercion"]);
export type V2HqDirection = z.infer<typeof v2HqDirectionSchema>;

/** Intent assessment picture per 23 §3. */
export const v2HqPictureSchema = z.enum(["weak", "conflicted", "coherent"]);
export type V2HqPicture = z.infer<typeof v2HqPictureSchema>;

/** Nine-state internal basis pattern (analytical provenance) per 23D §1. */
export const v2BasisPatternSchema = z.enum([
  "no-direction",
  "indicator-preparation",
  "indicator-coercion",
  "indicator-conflict",
  "diagnostic-preparation-clear",
  "diagnostic-preparation-qualified",
  "diagnostic-coercion-clear",
  "diagnostic-coercion-qualified",
  "diagnostic-conflict",
]);
export type V2BasisPattern = z.infer<typeof v2BasisPatternSchema>;

/** Six legal assessment combinations per 23 §4. */
export const v2HqAssessmentSchema = z.discriminatedUnion("direction", [
  z.object({ direction: z.literal("unclear"), picture: z.enum(["weak", "conflicted"]), basisPattern: v2BasisPatternSchema }),
  z.object({ direction: z.enum(["preparation", "coercion"]), picture: z.enum(["weak", "coherent"]), basisPattern: v2BasisPatternSchema }),
]);
export type V2HqAssessment = z.infer<typeof v2HqAssessmentSchema>;

/** Tactical warning per 23 §9. */
export const v2HqWarningSchema = z.discriminatedUnion("state", [
  z.object({ state: z.literal("none"), basisEvidenceInstanceId: z.null() }),
  z.object({ state: z.literal("usable"), basisEvidenceInstanceId: z.string().min(1) }),
]);
export type V2HqWarning = z.infer<typeof v2HqWarningSchema>;

/** Public-case basis per 23 §4 and 23A §17. */
export const v2HqPublicCaseBasisSchema = z.discriminatedUnion("state", [
  z.object({ state: z.literal("none"), direction: z.null(), supportingInstanceIds: z.tuple([]), supportingCorroborationGroupIds: z.tuple([]) }),
  z.object({ state: z.literal("tentative"), direction: z.enum(["preparation", "coercion"]).nullable(), supportingInstanceIds: z.array(z.string()), supportingCorroborationGroupIds: z.array(z.string()) }),
  z.object({ state: z.literal("credible-source-sensitive"), direction: z.enum(["preparation", "coercion"]), supportingInstanceIds: z.tuple([z.string(), z.string()]), supportingCorroborationGroupIds: z.tuple([z.string(), z.string()]) }),
]);
export type V2HqPublicCaseBasis = z.infer<typeof v2HqPublicCaseBasisSchema>;

/** Assessment change type for delta per 23D §10. */
export const v2AssessmentChangeSchema = z.enum([
  "initial", "unchanged", "narrowed", "strengthened",
  "weakened", "conflicted", "cleared-conflict",
  "reopened", "reversed",
]);
export type V2AssessmentChange = z.infer<typeof v2AssessmentChangeSchema>;

/** Warning change type for delta per 23A §18 / 23B §9. */
export const v2WarningChangeSchema = z.enum([
  "initial", "unchanged", "gained", "refreshed",
  "lost-stale", "lost-superseded", "lost-mixed",
]);
export type V2WarningChange = z.infer<typeof v2WarningChangeSchema>;

/** Public-case state change per 23D §12. */
export const v2PublicCaseStateChangeSchema = z.enum([
  "initial", "unchanged", "opened", "strengthened",
  "weakened", "closed",
]);
export type V2PublicCaseStateChange = z.infer<typeof v2PublicCaseStateChangeSchema>;

/** Public-case direction change per 23D §13. */
export const v2PublicCaseDirectionChangeSchema = z.enum([
  "initial", "unchanged", "established", "clarified",
  "became-conflicted", "reversed", "cleared",
]);
export type V2PublicCaseDirectionChange = z.infer<typeof v2PublicCaseDirectionChangeSchema>;

/** Public-case support change per 23D §14. */
export const v2PublicCaseSupportChangeSchema = z.enum([
  "initial", "unchanged", "changed", "cleared",
]);
export type V2PublicCaseSupportChange = z.infer<typeof v2PublicCaseSupportChangeSchema>;

/** Update cause per 23D §15. */
export const v2UpdateCauseSchema = z.enum([
  "none", "new-evidence", "staleness", "supersession", "mixed",
]);
export type V2UpdateCause = z.infer<typeof v2UpdateCauseSchema>;

/** Assessment basis change per 23D §10. */
export const v2AssessmentBasisChangeSchema = z.enum(["initial", "unchanged", "changed"]);
export type V2AssessmentBasisChange = z.infer<typeof v2AssessmentBasisChangeSchema>;

/** Safe evidence summary reference (player-facing) per 23C §9/§10/§11. */
export const v2EvidenceSummarySchema = z.object({
  definitionId: v2EvidenceDefinitionIdSchema,
  observedCycle: z.number().int().min(1).max(6),
  summaryRef: z.string().min(1),
  sourceContextRef: z.string().min(1),
  limitationRef: z.string().min(1),
}).strict();
export type V2EvidenceSummary = z.infer<typeof v2EvidenceSummarySchema>;

/** Player-safe warning block per 23D §8. */
export const v2PlayerSafeWarningSchema = z.object({
  state: z.enum(["none", "usable"]),
  statementRef: z.string().min(1),
  basisEvidence: v2EvidenceSummarySchema.nullable(),
}).strict();
export type V2PlayerSafeWarning = z.infer<typeof v2PlayerSafeWarningSchema>;

/**
 * Safe intelligence brief (player-facing) per 23 §16 and 38-PLAYER-SAFE-PROJECTION-CONTRACT.
 * Does NOT expose internal public-case state, basis patterns, or weak/conflicted/coherent labels.
 */
export const v2IntelligenceBriefSchema = z.object({
  judgementRef: z.string().min(1),
  basisEvidence: z.array(v2EvidenceSummarySchema).min(0).max(2),
  contraryEvidence: z.array(v2EvidenceSummarySchema).min(0).max(1),
  keyGapRef: z.string().min(1),
  watchForRef: z.string().min(1),
  updateLine: z.string().nullable(),
  warning: v2PlayerSafeWarningSchema,
}).strict();
export type V2IntelligenceBrief = z.infer<typeof v2IntelligenceBriefSchema>;

/** Total product/evidence delta per 23D §9. */
export const v2HqBeliefDeltaSchema = z.object({
  assessmentChange: v2AssessmentChangeSchema,
  assessmentBasisChange: v2AssessmentBasisChangeSchema,
  warningChange: v2WarningChangeSchema,
  publicCaseStateChange: v2PublicCaseStateChangeSchema,
  publicCaseDirectionChange: v2PublicCaseDirectionChangeSchema,
  publicCaseSupportChange: v2PublicCaseSupportChangeSchema,
  updateCause: v2UpdateCauseSchema,
  addedInstanceIds: z.array(z.string()),
  staleForAssessmentInstanceIds: z.array(z.string()),
  staleForWarningInstanceIds: z.array(z.string()),
  staleForPublicCaseInstanceIds: z.array(z.string()),
  newlySupersededInstanceIds: z.array(z.string()),
}).strict();
export type V2HqBeliefDelta = z.infer<typeof v2HqBeliefDeltaSchema>;

/** Complete #100 HQ belief snapshot per 23A §18. */
export const v2HqBeliefSnapshotSchema = z.object({
  cycle: z.number().int().min(1).max(6),
  assessment: v2HqAssessmentSchema,
  warning: v2HqWarningSchema,
  publicCaseBasis: v2HqPublicCaseBasisSchema,
  delta: v2HqBeliefDeltaSchema,
  brief: v2IntelligenceBriefSchema,
}).strict();
export type V2HqBeliefSnapshot = z.infer<typeof v2HqBeliefSnapshotSchema>;

/** #100 output — discriminated result per 23 §20. */
export const v2HqBeliefOutputSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("not-ready"), cycle: z.number().int().min(1).max(6), reason: z.literal("ravellan-decision-missing") }),
  z.object({ kind: z.literal("ready"), snapshot: v2HqBeliefSnapshotSchema }),
]);
export type V2HqBeliefOutput = z.infer<typeof v2HqBeliefOutputSchema>;

/** Evidence definition catalog entry (content-owned) per 23A §9 and 23C §2. */
export const v2EvidenceDefinitionSchema = z.object({
  definitionId: v2EvidenceDefinitionIdSchema,
  claimId: v2HqClaimIdSchema,
  questionId: v2HqQuestionIdSchema,
  producerKind: v2HqProducerKindSchema,
  implication: v2EvidenceImplicationSchema,
  diagnosticity: v2EvidenceDiagnosticitySchema,
  sourceGroupId: v2EvidenceSourceGroupSchema,
  corroborationGroupId: v2HqCorroborationGroupIdSchema.nullable(),
  sourceContextRef: z.string().min(1),
  limitationRefs: z.array(z.string()).min(1),
  summaryRef: z.string().min(1),
  warningRole: z.enum(["none", "usable"]),
  publicCaseRole: z.enum(["none", "source-sensitive"]),
  assessmentRelevance: v2HqRelevanceRuleSchema,
  warningRelevance: v2HqRelevanceRuleSchema,
  publicCaseRelevance: v2HqRelevanceRuleSchema,
  supersessionPolicy: v2HqSupersessionPolicySchema,
  supersedesDefinitionIds: z.array(v2EvidenceDefinitionIdSchema).default([]),
}).strict();
export type V2EvidenceDefinition = z.infer<typeof v2EvidenceDefinitionSchema>;

/** Semantic model digest per 23A §12. */
export const v2HqBeliefModelDigestSchema = z.object({
  modelId: z.literal("kestrel-hq-belief-v1"),
  scenarioId: z.literal("kestrel-strait"),
  reducerSemanticsId: z.literal("kestrel-binary-hypothesis-v1"),
  definitionCount: z.literal(19),
  digest: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export type V2HqBeliefModelDigest = z.infer<typeof v2HqBeliefModelDigestSchema>;

/** Resolved model bundle per 23A §12. */
export const v2ResolvedHqBeliefModelSchema = z.object({
  definitions: z.record(v2EvidenceDefinitionIdSchema, v2EvidenceDefinitionSchema),
  semanticDigest: v2HqBeliefModelDigestSchema,
}).strict();
export type V2ResolvedHqBeliefModel = z.infer<typeof v2ResolvedHqBeliefModelSchema>;