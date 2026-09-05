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
// #100 — HQ belief / intelligence projection derived types
// ============================================================
// These are pure derived/public schemas. No persisted V2 session
// or ledger state is added here. Runtime occurrence/origin and
// verified-context payload remain sim-private.

/** Evidence implication direction. */
export const v2EvidenceImplicationSchema = z.enum(["preparation", "coercion", "ambiguous"]);
export type V2EvidenceImplication = z.infer<typeof v2EvidenceImplicationSchema>;

/** Evidence diagnostic class. */
export const v2EvidenceDiagnosticClassSchema = z.enum(["indicator", "corroborating"]);
export type V2EvidenceDiagnosticClass = z.infer<typeof v2EvidenceDiagnosticClassSchema>;

/** Stable evidence definition ID (all 19 from 23C). */
export const v2EvidenceDefinitionIdSchema = z.enum([
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
]);
export type V2EvidenceDefinitionId = z.infer<typeof v2EvidenceDefinitionIdSchema>;

/** Source group ID for evidence definitions. */
export const v2EvidenceSourceGroupSchema = z.enum([
  "opening-maritime-pressure",
  "shipping-pressure",
  "reroute-auxiliary-monitoring",
  "regional-logistics",
  "force-disposition",
  "focused-staging-collection",
  "visible-pressure-pattern",
  "lattice-landing-force-staging",
  "lattice-auxiliary-tasking",
  "lattice-political-operational-sync",
]);
export type V2EvidenceSourceGroup = z.infer<typeof v2EvidenceSourceGroupSchema>;

/** Corroboration group ID for multi-source credibility. */
export const v2CorroborationGroupIdSchema = z.enum([
  "opening-pressure",
  "shipping-pressure",
  "reroute-monitoring",
  "logistics-anomaly",
  "force-disposition",
  "focused-staging",
  "pressure-pattern",
  "lattice-landing",
  "lattice-auxiliary",
  "lattice-sync",
]);
export type V2CorroborationGroupId = z.infer<typeof v2CorroborationGroupIdSchema>;

/** Role-specific relevance window types. */
export const v2EvidenceRoleSchema = z.enum(["assessment", "warning", "public-case"]);
export type V2EvidenceRole = z.infer<typeof v2EvidenceRoleSchema>;

/** Intent assessment direction. */
export const v2IntentDirectionSchema = z.enum(["unclear", "preparation", "coercion"]);
export type V2IntentDirection = z.infer<typeof v2IntentDirectionSchema>;

/** Intent assessment picture strength. */
export const v2IntentPictureSchema = z.enum(["weak", "conflicted", "coherent"]);
export type V2IntentPicture = z.infer<typeof v2IntentPictureSchema>;

/** Six legal assessment combinations. */
export const v2AssessmentSchema = z.enum([
  "unclear/weak",
  "unclear/conflicted",
  "preparation/weak",
  "preparation/coherent",
  "coercion/weak",
  "coercion/coherent",
]);
export type V2Assessment = z.infer<typeof v2AssessmentSchema>;

/** Nine-state internal basis pattern (analytical provenance). */
export const v2BasisPatternSchema = z.enum([
  "no-directional-evidence",
  "preparation-indicators-only",
  "preparation-corroborated",
  "coercion-indicators-only",
  "coercion-corroborated",
  "preparation-dominant-conflict",
  "coercion-dominant-conflict",
  "balanced-conflict",
  "ambiguous-only",
]);
export type V2BasisPattern = z.infer<typeof v2BasisPatternSchema>;

/** Tactical warning state. */
export const v2WarningStateSchema = z.enum(["none", "usable"]);
export type V2WarningState = z.infer<typeof v2WarningStateSchema>;

/** Public-case basis state. */
export const v2PublicCaseStateSchema = z.enum(["none", "tentative", "credible", "used"]);
export type V2PublicCaseState = z.infer<typeof v2PublicCaseStateSchema>;

/** Public-case direction. */
export const v2PublicCaseDirectionSchema = z.enum(["preparation", "coercion"]);
export type V2PublicCaseDirection = z.infer<typeof v2PublicCaseDirectionSchema>;

/** Assessment change type for delta. */
export const v2AssessmentChangeSchema = z.enum([
  "unchanged",
  "direction-changed",
  "picture-changed",
  "both-changed",
]);
export type V2AssessmentChange = z.infer<typeof v2AssessmentChangeSchema>;

/** Warning change type for delta. */
export const v2WarningChangeSchema = z.enum([
  "unchanged",
  "gained",
  "refreshed",
  "lost",
]);
export type V2WarningChange = z.infer<typeof v2WarningChangeSchema>;

/** Public-case change type for delta. */
export const v2PublicCaseChangeSchema = z.enum([
  "unchanged",
  "state-changed",
  "direction-changed",
  "both-changed",
  "lost",
]);
export type V2PublicCaseChange = z.infer<typeof v2PublicCaseChangeSchema>;

/** Update cause category. */
export const v2UpdateCauseSchema = z.enum([
  "new-evidence",
  "evidence-expired",
  "evidence-superseded",
  "cycle-advance",
  "no-change",
]);
export type V2UpdateCause = z.infer<typeof v2UpdateCauseSchema>;

/** Safe evidence summary reference (player-facing). */
export const v2EvidenceSummarySchema = z.object({
  definitionId: v2EvidenceDefinitionIdSchema,
  observedCycle: z.number().int().min(1).max(6),
  summaryRef: z.string().min(1),
}).strict();
export type V2EvidenceSummary = z.infer<typeof v2EvidenceSummarySchema>;

/** Safe intelligence brief (player-facing). */
export const v2IntelligenceBriefSchema = z.object({
  assessment: v2AssessmentSchema,
  assessmentReasons: z.array(v2EvidenceSummarySchema).min(0).max(3),
  unresolvedGap: z.string().nullable(),
  warning: v2WarningStateSchema,
  warningBasis: z.array(v2EvidenceSummarySchema).min(0).max(2),
  publicCase: v2PublicCaseStateSchema,
  publicCaseDirection: v2PublicCaseDirectionSchema.nullable(),
  publicCaseBasis: z.array(v2EvidenceSummarySchema).min(0).max(2),
  hasCurrentDirectWarning: z.boolean(),
}).strict();
export type V2IntelligenceBrief = z.infer<typeof v2IntelligenceBriefSchema>;

/** Total product/evidence delta. */
export const v2HqBeliefDeltaSchema = z.object({
  assessmentChange: v2AssessmentChangeSchema,
  assessmentBasisChange: z.boolean(),
  warningChange: v2WarningChangeSchema,
  publicCaseChange: v2PublicCaseChangeSchema,
  publicCaseDirectionChange: z.boolean(),
  supportBasisChange: z.boolean(),
  newlySupersededIds: z.array(v2EvidenceDefinitionIdSchema),
  stalenessRoles: z.array(z.object({
    definitionId: v2EvidenceDefinitionIdSchema,
    role: v2EvidenceRoleSchema,
    becameStale: z.boolean(),
  })),
  updateCause: v2UpdateCauseSchema,
}).strict();
export type V2HqBeliefDelta = z.infer<typeof v2HqBeliefDeltaSchema>;

/** Complete #100 HQ belief output. */
export const v2HqBeliefOutputSchema = z.object({
  brief: v2IntelligenceBriefSchema,
  delta: v2HqBeliefDeltaSchema,
  basisPattern: v2BasisPatternSchema,
  cycle: z.number().int().min(1).max(6),
  notReady: z.boolean(),
}).strict();
export type V2HqBeliefOutput = z.infer<typeof v2HqBeliefOutputSchema>;

/** Evidence definition catalog entry (content-owned). */
export const v2EvidenceDefinitionSchema = z.object({
  definitionId: v2EvidenceDefinitionIdSchema,
  implication: v2EvidenceImplicationSchema,
  diagnosticClass: v2EvidenceDiagnosticClassSchema,
  sourceGroup: v2EvidenceSourceGroupSchema,
  corroborationGroupId: v2CorroborationGroupIdSchema,
  summaryRef: z.string().min(1),
  assessmentActiveCycles: z.tuple([z.number().int().min(1), z.number().int().min(1).max(6)]),
  warningActiveCycles: z.tuple([z.number().int().min(1), z.number().int().min(1).max(6)]).nullable(),
  publicCaseActiveCycles: z.tuple([z.number().int().min(1), z.number().int().min(1).max(6)]).nullable(),
  supersedesIds: z.array(v2EvidenceDefinitionIdSchema).default([]),
  replaceOlderSameQuestion: z.boolean().default(false),
  warningCapable: z.boolean().default(false),
  sourceSensitive: z.boolean().default(false),
  questionGroup: z.string().default(""),
}).strict();
export type V2EvidenceDefinition = z.infer<typeof v2EvidenceDefinitionSchema>;

/** Semantic model digest for content-identity binding. */
export const v2HqBeliefModelDigestSchema = z.object({
  modelId: z.literal("kestrel-hq-belief-v1"),
  definitionCount: z.literal(19),
  digest: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export type V2HqBeliefModelDigest = z.infer<typeof v2HqBeliefModelDigestSchema>;
