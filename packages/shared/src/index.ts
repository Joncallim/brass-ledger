import { z } from "zod";

export const directorateSchema = z.enum([
  "people",
  "intelligence",
  "operations",
  "sustainment",
  "plans",
  "training",
]);
export type DirectorateId = z.infer<typeof directorateSchema>;

export const genderPresentationSchema = z.enum(["female", "male"]);
export type GenderPresentation = z.infer<typeof genderPresentationSchema>;

export const burdenLevelSchema = z.enum(["light", "strained", "overloaded"]);
export type BurdenLevel = z.infer<typeof burdenLevelSchema>;

export const programPhaseSchema = z.enum([
  "concept",
  "funded",
  "procured",
  "integrated",
  "trained",
  "operational",
]);
export type ProgramPhase = z.infer<typeof programPhaseSchema>;

export const chiefPositionSchema = z.enum([
  "support",
  "accept_risk",
  "oppose",
  "request_conditions",
]);
export type ChiefPositionType = z.infer<typeof chiefPositionSchema>;

export const staffFunctionIdSchema = z.enum(["S1", "S2", "S3", "S4", "S5"]);
export type StaffFunctionId = z.infer<typeof staffFunctionIdSchema>;

const indexMetricSchema = z.number().min(0).max(100);
const deployableUnitsSchema = z.number().min(2).max(12);
const campaignScoreSchema = z.number().min(0).max(100);
const nonNegativeNumberSchema = z.number().min(0);

export const chiefStaffReadoutEvidenceSchema = z.object({
  staffFunctionId: staffFunctionIdSchema,
  staffFunctionLabel: z.string(),
  metricLabel: z.string(),
  metricValue: z.number(),
  metricStatus: z.enum(["healthy", "watch", "risk"]),
  burdenLevel: burdenLevelSchema,
  burdenPoints: nonNegativeNumberSchema,
  rationale: z.string(),
});
export type ChiefStaffReadoutEvidence = z.infer<typeof chiefStaffReadoutEvidenceSchema>;

export const forceGenerationStateSchema = z.object({
  deployableUnits: deployableUnitsSchema,
  reserveStrain: indexMetricSchema,
  trainingThroughput: indexMetricSchema,
  personnelShortfalls: indexMetricSchema,
});
export type ForceGenerationState = z.infer<typeof forceGenerationStateSchema>;

export const intelStateSchema = z.object({
  collectionCoverage: indexMetricSchema,
  confidence: indexMetricSchema,
  warningReliability: indexMetricSchema,
  deceptionPressure: indexMetricSchema,
});
export type IntelState = z.infer<typeof intelStateSchema>;

export const sustainmentStateSchema = z.object({
  depotBacklog: indexMetricSchema,
  munitionsSufficiency: indexMetricSchema,
  fuelSufficiency: indexMetricSchema,
  liftAvailability: indexMetricSchema,
});
export type SustainmentState = z.infer<typeof sustainmentStateSchema>;

export const allianceStateSchema = z.object({
  reassurance: indexMetricSchema,
  politicalAlignment: indexMetricSchema,
  partnerParticipation: indexMetricSchema,
  partnerPublicSupport: indexMetricSchema,
});
export type AllianceState = z.infer<typeof allianceStateSchema>;

export const domesticStateSchema = z.object({
  cabinetCover: indexMetricSchema,
  committeeTolerance: indexMetricSchema,
  mediaHeat: indexMetricSchema,
  publicPatience: indexMetricSchema,
});
export type DomesticState = z.infer<typeof domesticStateSchema>;

export const escalationStateSchema = z.object({
  probeTempo: indexMetricSchema,
  warningTime: indexMetricSchema,
  incidentLadder: indexMetricSchema,
  crisisSensitivity: indexMetricSchema,
});
export type EscalationState = z.infer<typeof escalationStateSchema>;

export const strategicStateSchema = z.object({
  forceGeneration: forceGenerationStateSchema,
  intelligence: intelStateSchema,
  sustainment: sustainmentStateSchema,
  alliance: allianceStateSchema,
  domestic: domesticStateSchema,
  escalation: escalationStateSchema,
});
export type StrategicState = z.infer<typeof strategicStateSchema>;

export const staffMechanicsStateSchema = z.object({
  s1: z.object({
    recoveryDebt: indexMetricSchema,
    reservePredictability: indexMetricSchema,
  }),
  s2: z.object({
    externalEstimateConfidence: indexMetricSchema,
    visibility: z.enum(["RUMORED", "ESTIMATED", "KNOWN"]),
    deceptionRisk: indexMetricSchema,
  }),
  s3: z.object({
    visiblePosture: indexMetricSchema,
    executablePosture: indexMetricSchema,
    credibleDeterrence: indexMetricSchema.default(50),
  }),
  s4: z.object({
    stockpileDepth: indexMetricSchema,
    liftBurn: indexMetricSchema,
    supportableTempo: indexMetricSchema.default(50),
  }),
  s5: z.object({
    strategicCoherence: indexMetricSchema,
    doctrineAlignment: indexMetricSchema,
  }),
});
export type StaffMechanicsState = z.infer<typeof staffMechanicsStateSchema>;

export const defaultStaffMechanicsState: StaffMechanicsState = {
  s1: { recoveryDebt: 42, reservePredictability: 51 },
  s2: { externalEstimateConfidence: 46, visibility: "ESTIMATED", deceptionRisk: 44 },
  s3: { visiblePosture: 48, executablePosture: 50, credibleDeterrence: 46 },
  s4: { stockpileDepth: 47, liftBurn: 41, supportableTempo: 13 },
  s5: { strategicCoherence: 52, doctrineAlignment: 50 },
};

// Doctrine variables from the CELERY pattern-to-mechanic map (see
// POTATO/doctrine-mechanics-roadmap.md). Neutral-initialized per faction; a scenario's
// DoctrineProfile (Phase 2, issue #56) biases these away from neutral via doctrine genes
// applied once at scenario-definition time (see applyDoctrineGenes below).
// Every field is 0-100. Risk/pressure-type fields (culminationRisk, systemPressure) are
// neutral near their low end (little accumulated risk at campaign start); quality/capacity
// fields are neutral near the midpoint.
export const doctrineMechanicsStateSchema = z.object({
  campaignAimClarity: indexMetricSchema,
  relativeTempo: indexMetricSchema,
  mainEffortFocus: indexMetricSchema,
  secondaryRiskAccepted: indexMetricSchema,
  optionDislocation: indexMetricSchema,
  signatureControl: indexMetricSchema,
  exposureControl: indexMetricSchema,
  orderClarity: indexMetricSchema,
  culminationRisk: indexMetricSchema,
  uncommittedCapacity: indexMetricSchema,
  operationalReach: indexMetricSchema,
  staffSynchronization: indexMetricSchema,
  commanderIntentClarity: indexMetricSchema,
  systemPressure: indexMetricSchema,
});
export type DoctrineMechanicsState = z.infer<typeof doctrineMechanicsStateSchema>;

export const defaultDoctrineMechanicsState: DoctrineMechanicsState = {
  campaignAimClarity: 55,
  relativeTempo: 50,
  mainEffortFocus: 50,
  secondaryRiskAccepted: 50,
  optionDislocation: 40,
  signatureControl: 45,
  exposureControl: 50,
  orderClarity: 60,
  culminationRisk: 18,
  uncommittedCapacity: 45,
  operationalReach: 48,
  staffSynchronization: 55,
  commanderIntentClarity: 55,
  systemPressure: 45,
};

// Optional staff modules a faction may field on top of the mandatory S1-S5 contract
// (Doctrine 5, issue #59, will give them mechanics; Doctrine 2 only declares them).
// Sources: POTATO/s1-s5-mechanics-translation.md (Faction Variable Frame), issue #56 scope.
export const optionalStaffModuleSchema = z.enum([
  "J6",
  "J7",
  "J8",
  "J9",
  "STRATCOM",
  "MED",
  "ENGINEER",
]);
export type OptionalStaffModule = z.infer<typeof optionalStaffModuleSchema>;

// Doctrine variables whose increase is a cost (accumulated risk or accepted risk)
// rather than a capability gain. Under the mass-balance rule in lint:content, a
// POSITIVE modifier on one of these keys counts as counterweight mass, while a
// NEGATIVE modifier on one of these keys is a BENEFIT (risk reduction) — see
// packages/content/src/validate-content.ts.
// NOTE: secondaryRiskAccepted is dual-direction — the sim treats LOW unacknowledged
// risk (strained lanes with no accepted-risk override) as the warning state, so
// "increase = cost" is the correct classification for counterweight purposes but a
// future gene using +secondaryRiskAccepted as a benefit would be silently reclassified.
// NOTE: culminationRisk modifiers are transient by design — the sim recomputes it
// from staff condition each turn and does not anchor it (see resolveDoctrineMechanics).
export const doctrineRiskKeys = [
  "culminationRisk",
  "systemPressure",
  "secondaryRiskAccepted",
] as const;
export type DoctrineRiskKey = (typeof doctrineRiskKeys)[number];

// A gene may modify any subset of the doctrine variables. Modifiers are additive
// deltas (not absolute values), bounded to +/-50 so a single gene cannot overwhelm
// the neutral baseline; the summed result is clamped to the 0-100 index range by
// applyDoctrineGenes.
const doctrineVariableKeys = Object.keys(
  doctrineMechanicsStateSchema.shape,
) as Array<keyof DoctrineMechanicsState>;
const doctrineVariableModifierShape = Object.fromEntries(
  doctrineVariableKeys.map((key) => [key, z.number().int().min(-50).max(50).optional()]),
) as { [K in keyof DoctrineMechanicsState]?: z.ZodOptional<z.ZodNumber> };
// .strict(): an unknown modifier key must fail loudly at gene-definition time rather
// than being silently stripped by Zod (a real bug — supportableTempo was declared as a
// modifier before it existed as a doctrine key, and the -5 never applied).
export const doctrineVariableModifierSchema = z.object(doctrineVariableModifierShape).strict();
export type DoctrineVariableModifiers = z.infer<typeof doctrineVariableModifierSchema>;

// A single doctrine gene: a fictionalized, evidence-linked ingredient sourced from the
// CELERY gene bank (CELERY/faction-doctrine-gene-bank.md). Genes are content data, never
// hard-coded into the engine — the sim only ever sees the applied baseline.
//
// Doctrine 3 (issue #57): staffAdviceStyle is promoted from inert prose to a mechanical
// input. Each directive carries the authored summary plus the anchors that make it
// mechanical: option-tag biases, tag cautions, and a readout-gated position lean. The
// sim consumes only the composed DoctrineLens (see composeDoctrineLens below), never
// genes directly — the sim→content layering boundary is preserved.
export const adviceDirectiveSchema = z
  .object({
    // The authored directive text (verbatim from the gene bank), rendered as the chief's
    // adviceStyleNote. Human-facing only; the mechanical effect comes from the anchors.
    summary: z.string().min(1),
    // Option tags the gene's staff weighs MORE (biasTags) or treats as RISK (cautionTags).
    // Both are lint-verified against the scenario's option tag vocabulary so advice can
    // never reference flavor that no memo option carries.
    biasTags: z.array(z.string()).default([]),
    cautionTags: z.array(z.string()).default([]),
    // Readout-anchored nudge: fires only when the chief's own S1-S5 readout signals
    // metricStatus === "risk" or a non-light burden level. Negative = dig in / veto,
    // positive = champion the fix. No free-floating leans: a non-zero lean requires at
    // least one tag anchor (enforced here and re-asserted by lint:content).
    positionLean: z.number().int().min(-2).max(2).default(0),
  })
  .superRefine((directive, ctx) => {
    if (directive.positionLean !== 0 && directive.biasTags.length === 0 && directive.cautionTags.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["positionLean"],
        message: "positionLean requires >=1 biasTag or cautionTag anchor (no free-floating lean).",
      });
    }
  });
export type AdviceDirective = z.infer<typeof adviceDirectiveSchema>;

export const staffAdviceStyleSchema = z
  .object({
    S1: adviceDirectiveSchema.optional(),
    S2: adviceDirectiveSchema.optional(),
    S3: adviceDirectiveSchema.optional(),
    S4: adviceDirectiveSchema.optional(),
    S5: adviceDirectiveSchema.optional(),
  })
  .default({});
export type StaffAdviceStyle = z.infer<typeof staffAdviceStyleSchema>;

// Doctrine 3 burden-routing bias: which directorates a gene's staff over-prioritizes and
// which it underprices. These change ATTENTION only (routingAttention labels, chief
// position leans, underpriced warnings, after-action notes) — never burden points,
// capacities, or penalties ("change routing, not math"). A lane cannot be both
// over-prioritized and underpriced for the same gene.
export const burdenBiasSchema = z
  .object({
    priorityLanes: z.array(directorateSchema).default([]),
    underpricedLanes: z.array(directorateSchema).default([]),
  })
  .superRefine((bias, ctx) => {
    const overlap = bias.priorityLanes.filter((directorate) => bias.underpricedLanes.includes(directorate));
    if (overlap.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["underpricedLanes"],
        message: `A lane cannot be both over-prioritized and underpriced: ${overlap.join(", ")}.`,
      });
    }
  });
export type BurdenBias = z.infer<typeof burdenBiasSchema>;

// The canonical suffix of the underpriced-lane warning text (Codex P2, PR #77):
// acceptance of the underpriced warning is matched by this exact suffix, so the
// template MUST stay in this single exported constant — buildStaffFunctionReadouts
// appends it and resolveBurdenDissent matches on it.
export const underpricedLaneWarningSuffix =
  "This lane is one the staff underprices — expect it to surface as staff dissent unless you accept the risk explicitly.";

export const doctrineGeneSchema = z.object({
  id: z.string(),
  label: z.string(),
  // Every doctrine-derived trait must trace to at least one CELERY evidence anchor.
  evidenceRefs: z.array(z.string()).min(1),
  strengths: z.array(z.string()).min(1),
  vulnerabilities: z.array(z.string()).min(1),
  variableModifiers: doctrineVariableModifierSchema,
  staffAdviceStyle: staffAdviceStyleSchema,
  // Routing attention bias (Doctrine 3). Counterweight rule is enforced by lint:content
  // at the gene level (one-sided bias = free lunch = ERROR; both empty is legal).
  burdenBias: burdenBiasSchema.default({ priorityLanes: [], underpricedLanes: [] }),
});
export type DoctrineGene = z.infer<typeof doctrineGeneSchema>;

// Scenario-level doctrine identity: a composition of genes from the content registry,
// plus any optional staff modules the scenario fields. The profile is declared on the
// scenario definition; the engine consumes only the baseline it produces.
export const doctrineProfileSchema = z.object({
  id: z.string(),
  label: z.string(),
  evidenceRefs: z.array(z.string()).min(1),
  geneIds: z.array(z.string()).min(1),
  optionalStaffModules: z.array(optionalStaffModuleSchema).default([]),
}).superRefine((profile, ctx) => {
  if (new Set(profile.optionalStaffModules).size !== profile.optionalStaffModules.length) {
    ctx.addIssue({
      code: "custom",
      path: ["optionalStaffModules"],
      message: "optional staff modules must be unique",
    });
  }
});
export type DoctrineProfile = z.infer<typeof doctrineProfileSchema>;

// ── Doctrine 5 (issue #59): optional staff module mechanics ────────────────────
// Closed monotone lane enum: the ONLY state lanes a staff module (or the
// coordination-load counterweight) may touch. Sim switches only over this enum and
// never over module ids; content owns identity/evidence/tags/deltas. Context-sensitive
// lanes (staff.s3.visiblePosture, doctrine.relativeTempo, ...) are deliberately absent.
export const moduleEffectLaneSchema = z.enum([
  "staff.s1.recoveryDebt",
  "staff.s2.deceptionRisk",
  "staff.s5.strategicCoherence",
  "doctrine.orderClarity",
  "doctrine.systemPressure",
  "doctrine.staffSynchronization",
  "strategic.forceGeneration.reserveStrain",
  "strategic.forceGeneration.trainingThroughput",
  "strategic.sustainment.depotBacklog",
  "strategic.sustainment.liftAvailability",
  "strategic.alliance.reassurance",
  "strategic.alliance.politicalAlignment",
  "strategic.domestic.cabinetCover",
  "strategic.domestic.committeeTolerance",
  "strategic.domestic.mediaHeat",
  "strategic.escalation.incidentLadder",
  "resources.budgetAuthority",
  "resources.readiness",
]);
export type ModuleEffectLane = z.infer<typeof moduleEffectLaneSchema>;

export const moduleEffectDirection = {
  "staff.s1.recoveryDebt": "higher-adverse",
  "staff.s2.deceptionRisk": "higher-adverse",
  "staff.s5.strategicCoherence": "higher-favorable",
  "doctrine.orderClarity": "higher-favorable",
  "doctrine.systemPressure": "higher-adverse",
  "doctrine.staffSynchronization": "higher-favorable",
  "strategic.forceGeneration.reserveStrain": "higher-adverse",
  "strategic.forceGeneration.trainingThroughput": "higher-favorable",
  "strategic.sustainment.depotBacklog": "higher-adverse",
  "strategic.sustainment.liftAvailability": "higher-favorable",
  "strategic.alliance.reassurance": "higher-favorable",
  "strategic.alliance.politicalAlignment": "higher-favorable",
  "strategic.domestic.cabinetCover": "higher-favorable",
  "strategic.domestic.committeeTolerance": "higher-favorable",
  "strategic.domestic.mediaHeat": "higher-adverse",
  "strategic.escalation.incidentLadder": "higher-adverse",
  "resources.budgetAuthority": "higher-favorable",
  "resources.readiness": "higher-favorable",
} as const satisfies Record<ModuleEffectLane, "higher-favorable" | "higher-adverse">;

const doctrineProofRefSchema = z.string().regex(
  /^CELERY\/doctrine-proof-register#[^#]+$/,
  "module evidence must reference an exact doctrine-proof-register heading",
);

export const staffModuleEffectSchema = z.object({
  lane: moduleEffectLaneSchema,
  delta: z.number()
    .min(-10)
    .max(10)
    .refine((value) => value !== 0, "delta must be non-zero")
    .refine((value) => Number(value.toFixed(2)) === value, "delta supports at most two decimals"),
  // Empty means standing. Otherwise any selected option tag activates the row.
  whenAnyTags: z.array(z.string().min(1)).default([]),
  summary: z.string().min(1),
}).strict();
export type StaffModuleEffect = z.infer<typeof staffModuleEffectSchema>;

export const staffModuleDefinitionSchema = z.object({
  id: optionalStaffModuleSchema,
  label: z.string().min(1),
  remit: z.string().min(1),
  primaryStaffFunctionRefs: z.array(staffFunctionIdSchema).min(1),
  evidenceRefs: z.array(doctrineProofRefSchema).min(1),
  benefitEffects: z.array(staffModuleEffectSchema).min(1),
  pressureEffects: z.array(staffModuleEffectSchema).min(1),
}).strict();
export type StaffModuleDefinition = z.infer<typeof staffModuleDefinitionSchema>;

export const staffModuleEffectReadoutSchema = z.object({
  lane: moduleEffectLaneSchema,
  requestedDelta: z.number(),
  summary: z.string(),
  activatedByTags: z.array(z.string()),
}).strict();
export type StaffModuleEffectReadout = z.infer<typeof staffModuleEffectReadoutSchema>;

export const staffModuleReadoutSchema = z.object({
  id: optionalStaffModuleSchema,
  label: z.string(),
  remit: z.string(),
  primaryStaffFunctionRefs: z.array(staffFunctionIdSchema),
  evidenceRefs: z.array(doctrineProofRefSchema).min(1),
  status: z.enum(["active", "pressured", "coordination-strained"]),
  benefits: z.array(staffModuleEffectReadoutSchema),
  pressures: z.array(staffModuleEffectReadoutSchema),
  coordinationLoad: z.number().min(0).max(1),
}).strict();
export type StaffModuleReadout = z.infer<typeof staffModuleReadoutSchema>;

// Apply a scenario's doctrine genes to the neutral doctrine baseline. Pure and
// deterministic: every delta accumulates per variable first (order-independent), then
// the final total is clamped to the 0-100 index range once. Called at
// scenario-definition time, so serialized saves carry the biased opening position and
// replay never re-applies genes.
export function applyDoctrineGenes(
  neutral: DoctrineMechanicsState,
  genes: readonly DoctrineGene[],
): DoctrineMechanicsState {
  // Accumulate-then-clamp (not clamp-per-gene): clamping inside the loop would make
  // the result order-dependent — e.g. +50 then -50 on an 80 baseline would yield 50
  // instead of the true summed result 80.
  const deltas: Partial<Record<keyof DoctrineMechanicsState, number>> = {};
  for (const gene of genes) {
    for (const [key, delta] of Object.entries(
      gene.variableModifiers,
    ) as Array<[keyof DoctrineMechanicsState, number | undefined]>) {
      if (delta === undefined) continue;
      deltas[key] = (deltas[key] ?? 0) + delta;
    }
  }
  const result: DoctrineMechanicsState = { ...neutral };
  for (const key of doctrineVariableKeys) {
    const delta = deltas[key];
    if (delta !== undefined) {
      result[key] = Math.min(100, Math.max(0, result[key] + delta));
    }
  }
  return result;
}

// ── Doctrine 3: composed advice/burden lens (issue #57) ──────────────────────────────
// The profile's genes compose to a single serialized DoctrineLens computed ONCE at
// scenario-definition time and stored on scenarioDefinition.doctrineLens. The sim
// consumes only the lens; replay re-runs resolveTurn against the scenario, so the lens
// is always in scope. Composition is pure and gene-order deterministic: arrays dedupe
// preserving first-appearance order (Set insertion order == geneIds order), positionLean
// sums then clamps to [-2, 2] (same accumulate-then-clamp philosophy as
// applyDoctrineGenes), and underpricedLanes = union MINUS any lane in priorityLanes
// (priority wins — deterministic, documented, lint-warned). No RNG anywhere.

export const composedAdviceDirectiveSchema = z.object({
  summaries: z.array(z.string()), // one per contributing gene, in gene order
  biasTags: z.array(z.string()),
  cautionTags: z.array(z.string()),
  positionLean: z.number().int().min(-2).max(2), // summed & clamped
});
export type ComposedAdviceDirective = z.infer<typeof composedAdviceDirectiveSchema>;

export const doctrineLensSchema = z.object({
  adviceStyle: z.object({
    S1: composedAdviceDirectiveSchema.optional(),
    S2: composedAdviceDirectiveSchema.optional(),
    S3: composedAdviceDirectiveSchema.optional(),
    S4: composedAdviceDirectiveSchema.optional(),
    S5: composedAdviceDirectiveSchema.optional(),
  }),
  burdenBias: burdenBiasSchema,
});
export type DoctrineLens = z.infer<typeof doctrineLensSchema>;

export const neutralDoctrineLens: DoctrineLens = {
  adviceStyle: {},
  burdenBias: { priorityLanes: [], underpricedLanes: [] },
};

const staffFunctionKeys = ["S1", "S2", "S3", "S4", "S5"] as const;

export function composeAdviceStyle(genes: readonly DoctrineGene[]): DoctrineLens["adviceStyle"] {
  const result: DoctrineLens["adviceStyle"] = {};
  for (const staffFunction of staffFunctionKeys) {
    const directives = genes
      .map((gene) => gene.staffAdviceStyle[staffFunction])
      .filter((directive): directive is AdviceDirective => Boolean(directive));
    if (directives.length === 0) continue;
    result[staffFunction] = {
      summaries: directives.map((directive) => directive.summary),
      biasTags: Array.from(new Set(directives.flatMap((directive) => directive.biasTags))),
      cautionTags: Array.from(new Set(directives.flatMap((directive) => directive.cautionTags))),
      positionLean: Math.min(
        2,
        Math.max(-2, directives.reduce((sum, directive) => sum + directive.positionLean, 0)),
      ),
    };
  }
  return result;
}

export function composeBurdenLens(genes: readonly DoctrineGene[]): BurdenBias {
  const priorityLanes = Array.from(new Set(genes.flatMap((gene) => gene.burdenBias.priorityLanes)));
  const underpricedLanes = Array.from(
    new Set(genes.flatMap((gene) => gene.burdenBias.underpricedLanes)),
  ).filter((directorate) => !priorityLanes.includes(directorate));
  return { priorityLanes, underpricedLanes };
}

export function composeDoctrineLens(genes: readonly DoctrineGene[]): DoctrineLens {
  return { adviceStyle: composeAdviceStyle(genes), burdenBias: composeBurdenLens(genes) };
}

export const resourcesSchema = z.object({
  budgetAuthority: indexMetricSchema,
  readiness: indexMetricSchema,
  politicalCapital: indexMetricSchema,
  allianceCohesion: indexMetricSchema,
  publicLegitimacy: indexMetricSchema,
  escalationPressure: indexMetricSchema,
});
export type Resources = z.infer<typeof resourcesSchema>;

export const campaignObjectiveSchema = z.object({
  id: z.string(),
  label: z.string(),
  metric: z.enum([
    "deployableUnits",
    "politicalAlignment",
    "cabinetCover",
    "incidentLadder",
  ]),
  target: z.number(),
  direction: z.enum(["gte", "lte"]),
  note: z.string(),
});
export type CampaignObjective = z.infer<typeof campaignObjectiveSchema>;
export type CampaignObjectiveCheck = CampaignObjective & { current: number; met: boolean };

export const campaignBriefSchema = z.object({
  theater: z.string(),
  monthLabel: z.string(),
  situationSummary: z.string(),
  riskPosture: z.string(),
  commandersIntent: z.string(),
  operationalPicture: z.string().default(""),
  decisionFocus: z.string().default(""),
  openQuestions: z.array(z.string()),
  campaignObjectives: z.array(campaignObjectiveSchema),
  budgetHeadline: z.string().default(""),
  readinessHeadline: z.string().default(""),
  geopoliticalSummary: z.string().default(""),
});
export type CampaignBrief = z.infer<typeof campaignBriefSchema>;

export const chiefsPaperSchema = z.object({
  title: z.string(),
  synopsis: z.string(),
  bullets: z.array(z.string()),
  uncertainty: z.string(),
});
export type ChiefsPaper = z.infer<typeof chiefsPaperSchema>;

export const explainabilityEntrySchema = z.object({
  label: z.string(),
  summary: z.string(),
  positiveDrivers: z.array(z.string()),
  blockers: z.array(z.string()),
  causalRefs: z.array(z.string()).default([]),
});
export type ExplainabilityEntry = z.infer<typeof explainabilityEntrySchema>;

export const chiefDialogueProfileSchema = z.object({
  cadence: z.string().min(1),
  argumentMode: z.string().min(1),
  pressureResponse: z.string().min(1),
  disagreementStyle: z.string().min(1),
  trustPositiveTell: z.string().min(1),
  trustNegativeTell: z.string().min(1),
  unpromptedSubjects: z.array(z.string()).min(1),
  reservedPhrases: z.array(z.string()).min(2),
  forbiddenPhrases: z.array(z.string()).min(1),
  opener: z.array(z.string()).min(2),
  cooperative: z.array(z.string()).min(2),
  skeptical: z.array(z.string()).min(2),
  confrontational: z.array(z.string()).min(2),
  closer: z.array(z.string()).min(2),
});
export type ChiefDialogueProfile = z.infer<typeof chiefDialogueProfileSchema>;

export const chiefArchetypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  genderPresentation: genderPresentationSchema,
  directorate: directorateSchema,
  title: z.string(),
  doctrineBias: z.string(),
  temperament: z.string().min(1),
  competence: z.number().min(0).max(1),
  riskTolerance: z.number().min(0).max(1),
  preferredTags: z.array(z.string()),
  concernTags: z.array(z.string()),
  // Optional at the transport boundary so historical scenario summaries remain
  // readable; shipped content validation requires it for every playable chief.
  dialogue: chiefDialogueProfileSchema.optional(),
});
export type ChiefArchetype = z.infer<typeof chiefArchetypeSchema>;

/** @deprecated Use `spriteSpecSchema` for newly derived visual output; retained for saved-session compatibility. */
export const advisorPortraitSpecSchema = z.object({
  genderPresentation: genderPresentationSchema,
  skinTone: z.string(),
  hairColor: z.string(),
  eyeColor: z.string(),
  uniformColor: z.string(),
  trimColor: z.string(),
  backgroundColor: z.string(),
  panelColor: z.string(),
  faceShape: z.enum(["oval", "square", "round"]),
  hairStyle: z.enum(["side-part", "crew", "crop", "bun", "bob", "tied-back"]),
  accessory: z.enum(["none", "glasses", "earpiece"]),
  browTilt: z.number(),
  mouthCurve: z.number(),
});
export type AdvisorPortraitSpec = z.infer<typeof advisorPortraitSpecSchema>;

export const spriteSubjectTypeSchema = z.enum(["chief", "staff", "event", "program"]);
export type SpriteSubjectType = z.infer<typeof spriteSubjectTypeSchema>;
export const spriteRoleSchema = z.enum(["S1", "S2", "S3", "S4", "S5", "training"]);
export type SpriteRole = z.infer<typeof spriteRoleSchema>;
export const spriteExpressionSchema = z.enum(["calm", "skeptical", "strained", "urgent", "resolved", "severe"]);
export type SpriteExpression = z.infer<typeof spriteExpressionSchema>;
export const spriteTrustBandSchema = z.enum(["strained", "watchful", "steady", "solid"]);
export type SpriteTrustBand = z.infer<typeof spriteTrustBandSchema>;

/** Raw serialized state consumed by the pure sprite variant policy (Sprite 3, issue #52). */
export const chiefSpriteVariantStateSchema = z.object({
  trustBand: spriteTrustBandSchema,
  burdenLevel: burdenLevelSchema,
  campaignStatus: z.enum(["active", "won", "lost"]),
  s2ExternalEstimateConfidence: z.number().min(0).max(100),
  s4SupportableTempo: z.number().min(0).max(100),
}).strict();
export type ChiefSpriteVariantState = z.infer<typeof chiefSpriteVariantStateSchema>;

/** Ordered diagnostic effect markers; a result field, never an input. Order is part of byte determinism. */
export const spriteVariantEffectSchema = z.enum([
  "trust-low", "trust-high",
  "directorate-strained", "directorate-overloaded",
  "campaign-won", "campaign-lost",
  "s2-low-confidence", "s4-bottleneck",
]);
export type SpriteVariantEffect = z.infer<typeof spriteVariantEffectSchema>;

const spriteVariantEffectOrder = Object.fromEntries(
  spriteVariantEffectSchema.options.map((effect, index) => [effect, index]),
) as Record<SpriteVariantEffect, number>;

function canonicalVariantIssue(
  ctx: z.RefinementCtx,
  path: (string | number)[],
  message: string,
): void {
  ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
}

/** Strict renderer controls derived from the variant policy; never persisted, never in the prompt. */
export const spriteRenderVariantSchema = z.object({
  effects: z.array(spriteVariantEffectSchema),
  posture: z.enum(["neutral", "closed", "open"]),
  backgroundDarkenOpacity: z.number().min(0).max(1),
  saturation: z.number().min(0).max(1),
  framing: z.enum(["default", "tight"]),
  supportDetail: z.enum(["none", "utility-harness"]),
}).strict().superRefine((variant, ctx) => {
  const effects = new Set(variant.effects);
  if (effects.size !== variant.effects.length) {
    canonicalVariantIssue(ctx, ["effects"], "effects must be unique");
  }
  if (variant.effects.some((effect, index) => index > 0 && spriteVariantEffectOrder[effect] < spriteVariantEffectOrder[variant.effects[index - 1]!])) {
    canonicalVariantIssue(ctx, ["effects"], "effects must use canonical order");
  }
  for (const [first, second] of [["trust-low", "trust-high"], ["directorate-strained", "directorate-overloaded"], ["campaign-won", "campaign-lost"]] as const) {
    if (effects.has(first) && effects.has(second)) {
      canonicalVariantIssue(ctx, ["effects"], `${first} and ${second} cannot both appear in a canonical effect list`);
    }
  }
  const expectedPosture = effects.has("trust-low") ? "closed" : effects.has("trust-high") ? "open" : "neutral";
  if (variant.posture !== expectedPosture) {
    canonicalVariantIssue(ctx, ["posture"], "posture must match canonical trust effects");
  }
  const expectedDarken = effects.has("directorate-overloaded") ? 0.22 : 0;
  if (variant.backgroundDarkenOpacity !== expectedDarken) {
    canonicalVariantIssue(ctx, ["backgroundDarkenOpacity"], "background darkening must match canonical overload effect");
  }
  const expectedSaturation = effects.has("campaign-lost") ? 0.45 : 1;
  if (variant.saturation !== expectedSaturation) {
    canonicalVariantIssue(ctx, ["saturation"], "saturation must match canonical campaign-loss effect");
  }
  const expectedFraming = effects.has("s2-low-confidence") ? "tight" : "default";
  if (variant.framing !== expectedFraming) {
    canonicalVariantIssue(ctx, ["framing"], "framing must match canonical S2 confidence effect");
  }
  const expectedSupportDetail = effects.has("s4-bottleneck") ? "utility-harness" : "none";
  if (variant.supportDetail !== expectedSupportDetail) {
    canonicalVariantIssue(ctx, ["supportDetail"], "support detail must match canonical S4 bottleneck effect");
  }
});
export type SpriteRenderVariant = z.infer<typeof spriteRenderVariantSchema>;

export const spriteVisualLanguageEntrySchema = z.object({
  shapeLanguage: z.string().min(1), paletteCue: z.string().min(1),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), expressionBias: z.string().min(1),
  baseExpression: spriteExpressionSchema, uniformLanguage: z.string().min(1), sourceRef: z.string().min(1),
}).strict();
export type SpriteVisualLanguageEntry = z.infer<typeof spriteVisualLanguageEntrySchema>;
export const spriteVisualLanguageSchema = z.object({
  S1: spriteVisualLanguageEntrySchema, S2: spriteVisualLanguageEntrySchema,
  S3: spriteVisualLanguageEntrySchema, S4: spriteVisualLanguageEntrySchema,
  S5: spriteVisualLanguageEntrySchema, training: spriteVisualLanguageEntrySchema,
}).strict();
export type SpriteVisualLanguage = z.infer<typeof spriteVisualLanguageSchema>;

export const spriteSpecSchema = advisorPortraitSpecSchema.extend({
  id: z.string().min(1), subjectType: spriteSubjectTypeSchema, role: spriteRoleSchema,
  displayName: z.string().min(1), temperament: z.string().min(1), silhouette: z.string().min(1), palette: z.array(z.string().min(1)).min(1),
  uniform: z.string().min(1), expression: spriteExpressionSchema, trustBand: spriteTrustBandSchema.optional(),
  prompt: z.string().min(1), negativePrompt: z.string().min(1), deterministicSeed: z.string().min(1),
  variant: spriteRenderVariantSchema,
}).strict().superRefine((sprite, ctx) => {
  const effects = new Set(sprite.variant.effects);
  if (sprite.trustBand === "strained" && !effects.has("trust-low") || sprite.trustBand !== "strained" && effects.has("trust-low")) {
    canonicalVariantIssue(ctx, ["variant", "effects"], "effects must match the canonical trust band");
  }
  if (sprite.trustBand === "solid" && !effects.has("trust-high") || sprite.trustBand !== "solid" && effects.has("trust-high")) {
    canonicalVariantIssue(ctx, ["variant", "effects"], "effects must match the canonical trust band");
  }
  if (effects.has("s2-low-confidence") && sprite.role !== "S2") {
    canonicalVariantIssue(ctx, ["variant", "effects"], "S2 confidence effect is only valid for the S2 role");
  }
  if (effects.has("s4-bottleneck") && sprite.role !== "S4") {
    canonicalVariantIssue(ctx, ["variant", "effects"], "S4 bottleneck effect is only valid for the S4 role");
  }
  // Canonicality is effect→expression only, by design: expression is a legitimately
  // authored base value (baseExpression is not stored on SpriteSpec), so an authored
  // "severe"/"strained" expression with no effects must keep parsing — do NOT reverse-check.
  const expectedExpression = effects.has("campaign-won") ? "resolved"
    : effects.has("campaign-lost") ? "severe"
      : effects.has("directorate-overloaded") ? "strained"
        : effects.has("trust-low") ? "skeptical"
          : effects.has("directorate-strained") ? "strained"
            : effects.has("trust-high") ? "calm" : undefined;
  if (expectedExpression !== undefined && sprite.expression !== expectedExpression) {
    canonicalVariantIssue(ctx, ["expression"], "expression must match canonical variant effects");
  }
});
export type SpriteSpec = z.infer<typeof spriteSpecSchema>;

export type ChiefSpriteSpecInput = {
  chief: ChiefArchetype;
  portrait: AdvisorPortraitSpec;
  sessionSeed: string;
  visualLanguage: SpriteVisualLanguage;
  variantState: ChiefSpriteVariantState;
};

export type DerivedChiefSpriteVariant = Readonly<{
  expression: SpriteExpression;
  variant: SpriteRenderVariant;
}>;

/** The exact negative prompt from the sprite roadmap; identical for every sprite. */
export const SPRITE_NEGATIVE_PROMPT =
  "photorealistic, cinematic glow, fantasy armor, tactical weapon pose, exaggerated emotion, glossy sci-fi suit, decorative background, cluttered medals, text, logo, watermark, distorted face, extra limbs";

/** Frozen fixed role vocabulary for prompt rendering (roadmap `[S-function role]` placeholder). */
export const SPRITE_PROMPT_ROLE_LABELS = Object.freeze({
  S1: "S1 Personnel",
  S2: "S2 Intelligence",
  S3: "S3 Operations",
  S4: "S4 Logistics",
  S5: "S5 Plans",
  training: "Training",
} satisfies Record<SpriteRole, string>);

export type SpritePromptSource = Pick<
  SpriteSpec,
  "role" | "displayName" | "temperament" | "expression"
>;

export type SpritePromptText = Pick<SpriteSpec, "prompt" | "negativePrompt">;

/**
 * Pure deterministic prompt fill: the positive prompt is the roadmap template with exactly
 * four verbatim substitutions (role label, display name, temperament, expression); the
 * negative prompt is the roadmap constant. No trimming, casing, normalization, or escaping.
 */
export function buildSpritePromptText(source: SpritePromptSource): SpritePromptText {
  return {
    prompt:
      "Military staff advisor portrait for a strategic command simulation, " +
      `${SPRITE_PROMPT_ROLE_LABELS[source.role]}, ${source.displayName}, ` +
      `${source.temperament}, ${source.expression}, ` +
      "restrained editorial game art, clean bust portrait, readable at small size, " +
      "consistent uniform silhouette, muted palette, no photorealism, no fantasy armor, " +
      "no weapons, neutral command-room background.",
    negativePrompt: SPRITE_NEGATIVE_PROMPT,
  };
}

export const sessionAdvisorSchema = z.object({
  chiefId: z.string(),
  displayName: z.string(),
  title: z.string(),
  directorate: directorateSchema,
  genderPresentation: genderPresentationSchema,
  portrait: advisorPortraitSpecSchema,
});
export type SessionAdvisor = z.infer<typeof sessionAdvisorSchema>;

export const chiefConversationStageSchema = z.enum(["opening", "diagnosis", "bargaining", "closing", "completed"]);
export type ChiefConversationStage = z.infer<typeof chiefConversationStageSchema>;

export const chiefConversationTurnSchema = z.object({
  speaker: z.string(),
  role: z.enum(["commander", "advisor"]),
  text: z.string(),
});
export type ChiefConversationTurn = z.infer<typeof chiefConversationTurnSchema>;

export type ChiefConversationChoice = {
  id: string;
  label: string;
  summary: string;
  commanderLine: string;
  chiefReply: string;
  trustDelta: number;
  nextStage: ChiefConversationStage;
};

export const chiefConversationChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  summary: z.string(),
  commanderLine: z.string(),
  chiefReply: z.string(),
  trustDelta: z.number(),
  nextStage: chiefConversationStageSchema,
});
export type StoredChiefConversationChoice = z.infer<typeof chiefConversationChoiceSchema>;

export const chiefConversationRecordSchema = z.object({
  id: z.string(),
  turn: z.number().int().min(1),
  chiefId: z.string(),
  chiefName: z.string(),
  memoId: z.string(),
  memoTitle: z.string(),
  optionId: z.string(),
  optionLabel: z.string(),
  stage: chiefConversationStageSchema,
  status: z.enum(["active", "completed"]),
  title: z.string(),
  synopsis: z.string(),
  position: chiefPositionSchema,
  institutionalReason: z.string(),
  requiredCondition: z.string(),
  confidenceNote: z.string(),
  consequenceIfIgnored: z.string(),
  agendaMemoryNote: z.string().optional(),
  staffReadoutEvidence: chiefStaffReadoutEvidenceSchema,
  transcript: z.array(chiefConversationTurnSchema),
  choices: z.array(chiefConversationChoiceSchema),
  choiceTrail: z.array(z.string()).default([]),
  trustBefore: indexMetricSchema,
  trustAfter: indexMetricSchema,
  totalTrustDelta: z.number(),
});
export type ChiefConversationRecord = z.infer<typeof chiefConversationRecordSchema>;

export const burdenContributionSchema = z.object({
  directorate: directorateSchema,
  points: nonNegativeNumberSchema,
});
export type BurdenContribution = z.infer<typeof burdenContributionSchema>;

const forceGenerationDeltaSchema = z.object({
  deployableUnits: z.number(),
  reserveStrain: z.number(),
  trainingThroughput: z.number(),
  personnelShortfalls: z.number(),
});

const intelDeltaSchema = z.object({
  collectionCoverage: z.number(),
  confidence: z.number(),
  warningReliability: z.number(),
  deceptionPressure: z.number(),
});

const sustainmentDeltaSchema = z.object({
  depotBacklog: z.number(),
  munitionsSufficiency: z.number(),
  fuelSufficiency: z.number(),
  liftAvailability: z.number(),
});

const allianceDeltaSchema = z.object({
  reassurance: z.number(),
  politicalAlignment: z.number(),
  partnerParticipation: z.number(),
  partnerPublicSupport: z.number(),
});

const domesticDeltaSchema = z.object({
  cabinetCover: z.number(),
  committeeTolerance: z.number(),
  mediaHeat: z.number(),
  publicPatience: z.number(),
});

const escalationDeltaSchema = z.object({
  probeTempo: z.number(),
  warningTime: z.number(),
  incidentLadder: z.number(),
  crisisSensitivity: z.number(),
});

const resourcesDeltaSchema = z.object({
  budgetAuthority: z.number(),
  readiness: z.number(),
  politicalCapital: z.number(),
  allianceCohesion: z.number(),
  publicLegitimacy: z.number(),
  escalationPressure: z.number(),
});

export const stateDeltaSchema = z.object({
  resources: resourcesDeltaSchema.partial(),
  forceGeneration: forceGenerationDeltaSchema.partial(),
  intelligence: intelDeltaSchema.partial(),
  sustainment: sustainmentDeltaSchema.partial(),
  alliance: allianceDeltaSchema.partial(),
  domestic: domesticDeltaSchema.partial(),
  escalation: escalationDeltaSchema.partial(),
}).partial();
export type StateDelta = z.infer<typeof stateDeltaSchema>;

const emptyStateDelta: StateDelta = {
  resources: {},
  forceGeneration: {},
  intelligence: {},
  sustainment: {},
  alliance: {},
  domestic: {},
  escalation: {},
};

export const programPushSchema = z.object({
  programId: z.string(),
  points: nonNegativeNumberSchema,
});
export type ProgramPush = z.infer<typeof programPushSchema>;

export const constraintShiftSchema = z.object({
  constraintId: z.string(),
  delta: z.number(),
});
export type ConstraintShift = z.infer<typeof constraintShiftSchema>;

export const memoOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  summary: z.string(),
  tradeoffs: z.array(z.string()),
  burden: z.array(burdenContributionSchema),
  tags: z.array(z.string()),
  assumptions: z.array(z.string()).default([]),
  linkedActionIds: z.array(z.string()).optional(),
  stateDelta: stateDeltaSchema.default(emptyStateDelta),
  programPushes: z.array(programPushSchema).default([]),
  constraintShifts: z.array(constraintShiftSchema).default([]),
  contradictionTags: z.array(z.string()).default([]),
});
export type MemoOption = z.infer<typeof memoOptionSchema>;

export const decisionMemoSchema = z.object({
  id: z.string(),
  turn: z.number().int().min(1).optional(),
  category: z.string(),
  title: z.string(),
  issue: z.string(),
  whyNow: z.string(),
  sponsorDirectorate: directorateSchema,
  objectorDirectorate: directorateSchema,
  assumptions: z.array(z.string()),
  knownUnknowns: z.array(z.string()),
  optional: z.boolean().optional(),
  options: z.array(memoOptionSchema).min(2).max(4),
});
export type DecisionMemo = z.infer<typeof decisionMemoSchema>;

export const memoSelectionSchema = z.object({
  memoId: z.string(),
  optionId: z.string(),
});
export type MemoSelection = z.infer<typeof memoSelectionSchema>;
export type DecisionSelection = MemoSelection;

export const chiefPositionEntrySchema = z.object({
  chiefId: z.string(),
  chiefName: z.string(),
  directorate: directorateSchema,
  memoId: z.string(),
  optionId: z.string(),
  position: chiefPositionSchema,
  institutionalReason: z.string(),
  requiredCondition: z.string(),
  confidenceNote: z.string(),
  consequenceIfIgnored: z.string(),
  agendaMemoryNote: z.string().optional(),
  // Doctrine 3: the composed gene-voice note (directive summaries joined in gene order).
  // Omitted when the chief's staff function has no directive — same convention as
  // agendaMemoryNote (.optional() + omitted when absent).
  adviceStyleNote: z.string().optional(),
  staffReadoutEvidence: chiefStaffReadoutEvidenceSchema,
});
export type ChiefPositionEntry = z.infer<typeof chiefPositionEntrySchema>;
export type ChiefPosition = ChiefPositionEntry;

export const chiefAgendaMemoryEntrySchema = z.object({
  chiefId: z.string(),
  focusTags: z.array(z.string()).default([]),
  concernTags: z.array(z.string()).default([]),
  lastMemoId: z.string().nullable().default(null),
  lastOptionId: z.string().nullable().default(null),
  lastPosition: chiefPositionSchema.nullable().default(null),
  pressure: z.number().min(0).max(10).default(0),
  lastTurn: z.number().int().min(0).default(0),
  notes: z.array(z.string()).default([]),
});
export type ChiefAgendaMemoryEntry = z.infer<typeof chiefAgendaMemoryEntrySchema>;

export const chiefCoalitionEntrySchema = z.object({
  memoId: z.string(),
  memoTitle: z.string(),
  optionId: z.string(),
  optionLabel: z.string(),
  posture: z.enum(["supporting", "conditional", "contested", "blocked"]),
  supportChiefIds: z.array(z.string()).default([]),
  supportChiefNames: z.array(z.string()).default([]),
  conditionalChiefIds: z.array(z.string()).default([]),
  conditionalChiefNames: z.array(z.string()).default([]),
  objectionChiefIds: z.array(z.string()).default([]),
  objectionChiefNames: z.array(z.string()).default([]),
  staffConstraintDirectorates: z.array(directorateSchema).default([]),
  staffConstraintSummaries: z.array(z.string()).default([]),
  summary: z.string(),
  negotiationLevers: z.array(z.string()).default([]),
});
export type ChiefCoalitionEntry = z.infer<typeof chiefCoalitionEntrySchema>;

export const staffCapacityDefinitionSchema = z.object({
  directorate: directorateSchema,
  capacity: nonNegativeNumberSchema,
  strainedAt: nonNegativeNumberSchema,
  overloadedAt: nonNegativeNumberSchema,
});
export type StaffCapacityDefinition = z.infer<typeof staffCapacityDefinitionSchema>;

export const staffFunctionDefinitionSchema = z.object({
  id: staffFunctionIdSchema,
  label: z.string(),
  shortLabel: z.string(),
  directorates: z.array(directorateSchema).min(1),
  doctrineNote: z.string(),
  metricLabels: z.array(z.string()).min(1),
});
export type StaffFunctionDefinition = z.infer<typeof staffFunctionDefinitionSchema>;

export const directorateBurdenSchema = z.object({
  directorate: directorateSchema,
  burdenPoints: nonNegativeNumberSchema,
  capacity: nonNegativeNumberSchema,
  burdenLevel: burdenLevelSchema,
  failureMode: z.string(),
  confidencePenalty: nonNegativeNumberSchema,
  executionPenalty: nonNegativeNumberSchema,
  summary: z.string(),
  // Doctrine 3 routing attention: labels the lane's place in the composed burden bias.
  // Attention only — burden points/capacity/penalties are untouched by the lens.
  routingAttention: z.enum(["priority", "underpriced", "neutral"]).default("neutral"),
});
export type DirectorateBurden = z.infer<typeof directorateBurdenSchema>;

export const staffFunctionMetricSchema = z.object({
  label: z.string(),
  value: z.number(),
  status: z.enum(["healthy", "watch", "risk"]),
});
export type StaffFunctionMetric = z.infer<typeof staffFunctionMetricSchema>;

export const staffFunctionReadoutSchema = z.object({
  id: staffFunctionIdSchema,
  label: z.string(),
  shortLabel: z.string(),
  directorates: z.array(directorateSchema),
  status: z.enum(["ready", "strained", "overloaded", "compromised"]),
  burdenPoints: nonNegativeNumberSchema,
  capacity: nonNegativeNumberSchema,
  headroom: z.number(),
  warnings: z.array(z.string()),
  failureMode: z.string(),
  activeWarning: z.string().nullable(),
  standingRemit: z.string(),
  metrics: z.array(staffFunctionMetricSchema),
  // Doctrine 3: union of the function's directorates' routing labels with priority
  // precedence (priority > underpriced > neutral). The underpriced WARNING logic keys
  // off the individual directorate entries and is independent of this label.
  routingAttention: z.enum(["priority", "underpriced", "neutral"]).default("neutral"),
});
export type StaffFunctionReadout = z.infer<typeof staffFunctionReadoutSchema>;

export const monthlyEstimateSchema = z.object({
  chiefsPaperTitle: z.string(),
  chiefsPaperSummary: z.string(),
  chiefsPaperBullets: z.array(z.string()),
  uncertainty: z.string(),
  commandersEstimate: z.string(),
});
export type MonthlyEstimate = z.infer<typeof monthlyEstimateSchema>;

export const capabilityProgramDefinitionSchema = z.object({
  id: z.string(),
  label: z.string(),
  summary: z.string(),
  absorbingDirectorate: directorateSchema,
  payoff: z.string(),
  fragility: z.string(),
  preferredTags: z.array(z.string()),
});
export type CapabilityProgramDefinition = z.infer<typeof capabilityProgramDefinitionSchema>;

export const capabilityProgramStateSchema = z.object({
  id: z.string(),
  phase: programPhaseSchema,
  progress: indexMetricSchema,
  blockers: z.array(z.string()),
});
export type CapabilityProgramState = z.infer<typeof capabilityProgramStateSchema>;

export const externalConstraintDefinitionSchema = z.object({
  id: z.string(),
  label: z.string(),
  summary: z.string(),
});
export type ExternalConstraintDefinition = z.infer<typeof externalConstraintDefinitionSchema>;

export const externalConstraintStateSchema = z.object({
  id: z.string(),
  severity: indexMetricSchema,
  trend: z.enum(["improving", "steady", "worsening"]),
});
export type ExternalConstraintState = z.infer<typeof externalConstraintStateSchema>;

export const doctrineVariableSchema = z.enum([
  "campaignAimClarity", "relativeTempo", "mainEffortFocus", "secondaryRiskAccepted",
  "optionDislocation", "signatureControl", "exposureControl", "orderClarity",
  "culminationRisk", "uncommittedCapacity", "operationalReach", "staffSynchronization",
  "commanderIntentClarity", "systemPressure",
]);
export type DoctrineVariable = z.infer<typeof doctrineVariableSchema>;

export const doctrineConditionSchema = z.object({
  variable: doctrineVariableSchema,
  comparison: z.enum(["gte", "lte"]),
  threshold: z.number().int().min(0).max(100),
}).strict();
export type DoctrineCondition = z.infer<typeof doctrineConditionSchema>;

export const doctrineEventTriggerSchema = z.object({
  sourceGeneId: z.string().min(1),
  sourceGeneLabel: z.string().min(1),
  patternId: z.string().min(1),
  vulnerability: z.string().min(1),
  evidenceRefs: z.array(z.string().min(1)).min(1),
  conditions: z.array(doctrineConditionSchema).min(1),
  sustainedTurns: z.number().int().min(2).max(4),
}).strict();
export type DoctrineEventTrigger = z.infer<typeof doctrineEventTriggerSchema>;

export const doctrineEventCausalContextSchema = z.object({
  betLabel: z.string().min(1),
  maturedRiskLabel: z.string().min(1),
  staffFunctionRefs: z.array(staffFunctionIdSchema).min(1),
}).strict();
export type DoctrineEventCausalContext = z.infer<typeof doctrineEventCausalContextSchema>;

export const eventDefinitionSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  minTurn: z.number().int().min(1),
  maxTurn: z.number().int().min(1),
  triggerTags: z.array(z.string()).default([]),
  requiredFlags: z.array(z.string()).default([]),
  excludedFlags: z.array(z.string()).default([]),
  setsFlags: z.array(z.string()).default([]),
  clearsFlags: z.array(z.string()).default([]),
  stateDelta: stateDeltaSchema.default(emptyStateDelta),
  constraintShifts: z.array(constraintShiftSchema).default([]),
  doctrineTrigger: doctrineEventTriggerSchema.optional(),
  causalContext: doctrineEventCausalContextSchema.optional(),
}).superRefine((event, ctx) => {
  if (Boolean(event.doctrineTrigger) !== Boolean(event.causalContext)) {
    ctx.addIssue({
      code: "custom",
      path: [event.doctrineTrigger ? "causalContext" : "doctrineTrigger"],
      message: "doctrineTrigger and causalContext must appear together",
    });
  }
});
export type EventDefinition = z.infer<typeof eventDefinitionSchema>;

export const afterActionNoteSchema = z.object({
  heading: z.string(),
  detail: z.string(),
});
export type AfterActionNote = z.infer<typeof afterActionNoteSchema>;

export const doctrineAcceptedRiskRefSchema = z.object({
  turn: z.number().int().min(1),
  staffFunctionId: staffFunctionIdSchema,
  warningText: z.string().min(1),
}).strict();
export type DoctrineAcceptedRiskRef = z.infer<typeof doctrineAcceptedRiskRefSchema>;

export const doctrineMaturityEntrySchema = z.object({
  consecutiveTurns: z.number().int().min(1).max(4),
  startedTurn: z.number().int().min(1),
  acceptedRiskRefs: z.array(doctrineAcceptedRiskRefSchema).default([]),
}).strict();
export type DoctrineMaturityEntry = z.infer<typeof doctrineMaturityEntrySchema>;

export const techProgressSchema = z.object({ id: z.string(), level: z.number().int().min(0), progress: indexMetricSchema });
export type TechProgressNode = z.infer<typeof techProgressSchema>;

export const externalTechNodeSchema = z.object({
  id: z.string(),
  level: z.number().int().min(0).max(2),
  progress: indexMetricSchema,
  estimate: z.object({
    estimatedLevel: z.number().int().min(0).max(2),
    confidence: indexMetricSchema,
    visibility: z.enum(["RUMORED", "ESTIMATED", "KNOWN"]),
    lastVerifiedTurn: z.number().int().min(1).nullable(),
  }),
});
export type ExternalTechNode = z.infer<typeof externalTechNodeSchema>;

export const activeCommitmentSchema = z.object({
  id: z.string(),
  type: z.enum(["doctrine", "alliance", "cabinet", "program"]),
  label: z.string(),
  turnMade: z.number().int().min(1),
  fulfilled: z.boolean().nullable().default(null),
});
export type ActiveCommitment = z.infer<typeof activeCommitmentSchema>;

function addMirrorIssue(ctx: z.RefinementCtx, path: string, message: string) {
  ctx.addIssue({
    code: "custom",
    path: [path],
    message,
  });
}

export const campaignStateSchema = z.object({
  turn: z.number().int().min(1),
  maxTurns: z.number().int().min(1),
  seed: z.number().int(),
  campaignStatus: z.enum(["active", "won", "lost"]).default("active"),
  campaignScore: campaignScoreSchema.default(0),
  campaignOutcome: z.string().nullable().default(null),
  strategic: strategicStateSchema,
  staffMechanics: staffMechanicsStateSchema.default(defaultStaffMechanicsState),
  doctrineMechanics: doctrineMechanicsStateSchema.default(defaultDoctrineMechanicsState),
  doctrineMaturity: z.record(z.string(), doctrineMaturityEntrySchema).default({}),
  resources: resourcesSchema,
  forceGeneration: forceGenerationStateSchema,
  intel: intelStateSchema,
  sustainment: sustainmentStateSchema,
  alliance: allianceStateSchema,
  domestic: domesticStateSchema,
  escalation: escalationStateSchema,
  capabilityPrograms: z.array(capabilityProgramStateSchema),
  externalConstraints: z.array(externalConstraintStateSchema),
  internalTech: z.array(techProgressSchema).default([]),
  externalTech: z.array(externalTechNodeSchema).default([]),
  chiefTrust: z.record(z.string(), indexMetricSchema),
  chiefAgendaMemory: z.record(z.string(), chiefAgendaMemoryEntrySchema).default({}),
  advisorTrust: z.record(z.string(), indexMetricSchema).default({}),
  activeEventIds: z.array(z.string()).default([]),
  eventHistory: z.array(z.string()).default([]),
  eventFlags: z.record(z.string(), z.boolean()).default({}),
  conversationHistory: z.array(chiefConversationRecordSchema).default([]),
  activeCommitments: z.array(activeCommitmentSchema).default([]),
  briefing: campaignBriefSchema,
}).superRefine((state, ctx) => {
  if (state.turn > state.maxTurns + 1) {
    ctx.addIssue({
      code: "custom",
      path: ["turn"],
      message: "turn cannot exceed maxTurns + 1",
    });
  }

  if (JSON.stringify(state.forceGeneration) !== JSON.stringify(state.strategic.forceGeneration)) {
    addMirrorIssue(ctx, "forceGeneration", "forceGeneration must mirror strategic.forceGeneration");
  }
  if (JSON.stringify(state.intel) !== JSON.stringify(state.strategic.intelligence)) {
    addMirrorIssue(ctx, "intel", "intel must mirror strategic.intelligence");
  }
  if (JSON.stringify(state.sustainment) !== JSON.stringify(state.strategic.sustainment)) {
    addMirrorIssue(ctx, "sustainment", "sustainment must mirror strategic.sustainment");
  }
  if (JSON.stringify(state.alliance) !== JSON.stringify(state.strategic.alliance)) {
    addMirrorIssue(ctx, "alliance", "alliance must mirror strategic.alliance");
  }
  if (JSON.stringify(state.domestic) !== JSON.stringify(state.strategic.domestic)) {
    addMirrorIssue(ctx, "domestic", "domestic must mirror strategic.domestic");
  }
  if (JSON.stringify(state.escalation) !== JSON.stringify(state.strategic.escalation)) {
    addMirrorIssue(ctx, "escalation", "escalation must mirror strategic.escalation");
  }
});
export type CampaignState = z.infer<typeof campaignStateSchema>;

export const acceptedRiskOverrideSchema = z.object({
  staffFunctionId: staffFunctionIdSchema,
  warningText: z.string(),
});
export type AcceptedRiskOverride = z.infer<typeof acceptedRiskOverrideSchema>;

export const staffNegotiationSchema = z.object({
  directorate: directorateSchema,
  reliefPoints: z.number().int().min(1).max(2),
  cost: z.enum(["political_cover", "readiness_delay", "budget_overtime"]),
  note: z.string().optional(),
});
export type StaffNegotiation = z.infer<typeof staffNegotiationSchema>;

/** A bounded, replayed declaration of where the packet is really concentrating
 * command attention. It grants no standing bonus: the simulator checks it
 * against the selected packet and uses that actual concentration. */
export const commanderIntentSchema = z.object({
  mainEffort: directorateSchema,
  acceptedSecondaryRisk: directorateSchema.optional(),
}).superRefine((intent, ctx) => {
  if (intent.acceptedSecondaryRisk === intent.mainEffort) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "The accepted secondary risk must be outside the declared main effort.", path: ["acceptedSecondaryRisk"] });
  }
});
export type CommanderIntent = z.infer<typeof commanderIntentSchema>;

export const turnInputSchema = z.object({
  turn: z.number().int().min(1),
  selectedActionIds: z.array(z.string()).default([]),
  selections: z.array(memoSelectionSchema),
  acceptedRiskOverrides: z.array(acceptedRiskOverrideSchema).default([]),
  staffNegotiations: z.array(staffNegotiationSchema).default([]),
  commanderIntent: commanderIntentSchema.optional(),
});
export type TurnInput = z.infer<typeof turnInputSchema>;

export const decisionPreviewEntrySchema = z.object({
  memoId: z.string(),
  memoTitle: z.string(),
  optionId: z.string(),
  optionLabel: z.string(),
  staffCosts: z.array(burdenContributionSchema),
  staffWarnings: z.array(acceptedRiskOverrideSchema),
  projectedReadouts: z.array(staffFunctionReadoutSchema),
  projectedModuleReadouts: z.array(staffModuleReadoutSchema).default([]),
  projectedBlockers: z.array(z.string()),
  acceptedRiskCandidateCount: z.number().int().min(0),
});
export type DecisionPreviewEntry = z.infer<typeof decisionPreviewEntrySchema>;

export const turnPreviewSchema = z.object({
  decisionPreviews: z.array(decisionPreviewEntrySchema),
  acceptedRiskCandidates: z.array(acceptedRiskOverrideSchema),
  predictedEvents: z.array(eventDefinitionSchema),
  chiefCoalitions: z.array(chiefCoalitionEntrySchema).default([]),
  staffModules: z.array(staffModuleReadoutSchema).default([]),
  coordinationLoad: z.number().min(0).max(1).default(0),
});
export type TurnPreview = z.infer<typeof turnPreviewSchema>;

export const turnResultSchema = z.object({
  input: turnInputSchema,
  previousState: campaignStateSchema,
  nextState: campaignStateSchema,
  recommendations: z.array(chiefPositionEntrySchema).default([]),
  advisoryPaper: chiefsPaperSchema,
  chiefsPaper: chiefsPaperSchema.optional(),
  commandersEstimate: z.string().default(""),
  memos: z.array(decisionMemoSchema),
  chiefPositions: z.array(chiefPositionEntrySchema),
  chiefCoalitions: z.array(chiefCoalitionEntrySchema).default([]),
  monthlyEstimate: monthlyEstimateSchema,
  directorateBurden: z.array(directorateBurdenSchema),
  staffFunctions: z.array(staffFunctionReadoutSchema).default([]),
  staffModules: z.array(staffModuleReadoutSchema).default([]),
  coordinationLoad: z.number().min(0).max(1).default(0),
  explainability: z.array(explainabilityEntrySchema).default([]),
  portfolioLoad: z.array(z.object({
    directorate: directorateSchema,
    itemCount: z.number(),
    actionPoints: z.number(),
    capacity: z.number(),
    overloadCount: z.number(),
    effectivenessMultiplier: z.number(),
    overloaded: z.boolean(),
    summary: z.string(),
  })).default([]),
  triggeredEvents: z.array(eventDefinitionSchema),
  afterAction: z.array(afterActionNoteSchema),
  acceptedRisks: z.array(z.object({
    staffFunctionId: staffFunctionIdSchema,
    warningText: z.string(),
    accepted: z.boolean(),
  })).default([]),
  internalTech: z.array(techProgressSchema).default([]),
  externalTech: z.array(externalTechNodeSchema).default([]),
  replayHash: z.string(),
  summary: z.string(),
});
export type TurnResult = z.infer<typeof turnResultSchema>;

export const scenarioDefinitionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  contentVersion: z.string(),
  maxTurns: z.number().int(),
  chiefs: z.array(chiefArchetypeSchema),
  staffCapacities: z.array(staffCapacityDefinitionSchema).default([]),
  staffFunctions: z.array(staffFunctionDefinitionSchema).default([]),
  capabilityPrograms: z.array(capabilityProgramDefinitionSchema),
  externalConstraints: z.array(externalConstraintDefinitionSchema),
  memoTemplates: z.array(decisionMemoSchema),
  events: z.array(eventDefinitionSchema),
  initialState: campaignStateSchema,
  doctrineProfile: doctrineProfileSchema,
  // Doctrine 3: the composed advice/burden lens, computed once at scenario-definition
  // time from the profile's genes. The .default() exists so a hypothetical pre-D3
  // scenario JSON parses as neutral; the shipped scenario always sets it explicitly.
  doctrineLens: doctrineLensSchema.default(neutralDoctrineLens),
  // Doctrine 5: resolved optional staff module definitions in profile order. The
  // .default() keeps pre-D5 scenario JSON parseable; the shipped scenario always sets
  // it explicitly and the shared refinement below ties it to the profile exactly.
  staffModules: z.array(staffModuleDefinitionSchema).default([]),
}).superRefine((scenario, ctx) => {
  const profileIds = scenario.doctrineProfile.optionalStaffModules;
  const resolvedIds = scenario.staffModules.map((definition) => definition.id);
  if (JSON.stringify(profileIds) !== JSON.stringify(resolvedIds)) {
    ctx.addIssue({
      code: "custom",
      path: ["staffModules"],
      message: "staffModules ids must exactly match doctrineProfile.optionalStaffModules in order",
    });
  }
});
export type ScenarioDefinition = z.infer<typeof scenarioDefinitionSchema>;

// Every mutation made between turn resolutions must be present here.  A save is
// not trustworthy merely because its turn inputs replay: the relationship state
// that exists immediately before a turn must be reconstructable too.
const authoritativeActionContextSchema = {
  sequence: z.number().int().min(1),
  turn: z.number().int().min(1),
  revisionBefore: z.number().int().min(0),
  revisionAfter: z.number().int().min(1),
  scenarioId: z.string(),
  contentVersion: z.string(),
  // Stable across import: the session id changes for storage isolation, but
  // ledger evidence must remain bound to the campaign that produced it.
  campaignId: z.string().min(1),
  preStateHash: z.string().regex(/^[a-f0-9]{64}$/),
  postStateHash: z.string().regex(/^[a-f0-9]{64}$/),
};

export const authoritativeActionSchema = z.discriminatedUnion("type", [
  z.object({
    ...authoritativeActionContextSchema,
    type: z.literal("chief-conversation-open"),
    chiefId: z.string(),
    memoId: z.string(),
    optionId: z.string(),
    // The packet is evidence for why this chief/topic was legal. It is kept
    // with the action so replay never has to trust a browser-only selection.
    packetSelections: z.array(memoSelectionSchema).min(1),
  }),
  z.object({
    ...authoritativeActionContextSchema,
    type: z.literal("chief-conversation-response"),
    chiefId: z.string(),
    responseId: z.string(),
  }),
]);
export type AuthoritativeAction = z.infer<typeof authoritativeActionSchema>;

export const gameSessionSchema = z.object({
  id: z.string(),
  campaignId: z.string().min(1),
  saveFormatVersion: z.literal("8"),
  engineVersion: z.literal("0.1.0").default("0.1.0"),
  revision: z.number().int().min(0).default(0),
  scenarioId: z.string(),
  contentVersion: z.string(),
  advisorRoster: z.array(sessionAdvisorSchema),
  state: campaignStateSchema,
  initialState: campaignStateSchema,
  turnInputs: z.array(turnInputSchema),
  authoritativeActions: z.array(authoritativeActionSchema).default([]),
  history: z.array(turnResultSchema),
  updatedAt: z.string(),
});
export type GameSession = z.infer<typeof gameSessionSchema>;

export function buildCampaignHistory(session: GameSession) {
  return session.history.map((result) => {
    const legibility = buildCampaignLegibility(result.nextState, result.previousState);
    const changedRisks = legibility.risks.filter((risk) => risk.trend !== "stable");
    return {
      turn: result.input.turn,
      risks: changedRisks,
      events: result.triggeredEvents.map((event) => ({ id: event.id, title: event.title })),
      programmePhases: result.nextState.capabilityPrograms
        .filter((program) => result.previousState.capabilityPrograms.find((prior) => prior.id === program.id)?.phase !== program.phase)
        .map((program) => ({ id: program.id, phase: program.phase })),
      commitmentsOpened: result.nextState.activeCommitments.filter((commitment) => !result.previousState.activeCommitments.some((prior) => prior.id === commitment.id)).map((commitment) => commitment.label),
      commitmentsClosed: result.nextState.activeCommitments.filter((commitment) => {
        const prior = result.previousState.activeCommitments.find((entry) => entry.id === commitment.id);
        return prior?.fulfilled === null && commitment.fulfilled !== null;
      }).map((commitment) => commitment.label),
      relationshipChanges: Object.entries(result.nextState.chiefTrust)
        .map(([chiefId, trustAfter]) => ({ chiefId, delta: trustAfter - (result.previousState.chiefTrust[chiefId] ?? trustAfter) }))
        .filter((change) => change.delta !== 0),
    };
  });
}

export const sessionExportSchema = z.object({
  exportedAt: z.string(),
  engineVersion: z.literal("0.1.0").default("0.1.0"),
  session: gameSessionSchema,
});
export type SessionExport = z.infer<typeof sessionExportSchema>;

export const replayValidationDiffSchema = z.object({
  turn: z.number().int(),
  path: z.string(),
  expected: z.string(),
  actual: z.string(),
});
export type ReplayValidationDiff = z.infer<typeof replayValidationDiffSchema>;

export const replayValidationSchema = z.object({
  ok: z.boolean(),
  checkedTurns: z.number().int(),
  failedAtTurn: z.number().int().nullable().default(null),
  failureKind: z.enum(["none", "history_length_mismatch", "authoritative_action_mismatch", "replay_hash_mismatch", "state_mismatch", "final_state_mismatch"]).default("none"),
  diffs: z.array(replayValidationDiffSchema),
});
export type ReplayValidation = z.infer<typeof replayValidationSchema>;

export const scenarioSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  contentVersion: z.string(),
  maxTurns: z.number().int(),
  chiefs: z.array(chiefArchetypeSchema),
  staffCapacities: z.array(staffCapacityDefinitionSchema).default([]),
  staffFunctions: z.array(staffFunctionDefinitionSchema).default([]),
  capabilityPrograms: z.array(capabilityProgramDefinitionSchema),
  externalConstraints: z.array(externalConstraintDefinitionSchema),
  events: z.array(eventDefinitionSchema).default([]),
  doctrineLens: doctrineLensSchema.default(neutralDoctrineLens),
  staffModules: z.array(staffModuleDefinitionSchema).default([]),
  spriteVisualLanguage: spriteVisualLanguageSchema,
});
export type ScenarioSummary = z.infer<typeof scenarioSummarySchema>;

export type StrategicMetricBrief = {
  key: string;
  label: string;
  headline: string;
  status: string;
  detailTitle: string;
  detailLines: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundMetric(value: number) {
  return Math.round(value * 10) / 10;
}

function createSeededRng(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function sample<T>(items: T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)] ?? items[0];
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function capitalize(value: string) {
  return value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value;
}

function formatBillions(value: number) {
  return `${value.toFixed(1)}B USD`;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

export function directorateLabel(directorate: DirectorateId) {
  switch (directorate) {
    case "people":
      return "People";
    case "intelligence":
      return "Intelligence";
    case "operations":
      return "Operations";
    case "sustainment":
      return "Sustainment";
    case "plans":
      return "Plans";
    case "training":
      return "Training";
  }
}

export const directorateMeta: Record<DirectorateId, { label: string; shortLabel: string; summary: string }> = {
  people: {
    label: "People",
    shortLabel: "J1",
    summary: "Recruitment, retention, reserve depth, and the people side of force generation.",
  },
  intelligence: {
    label: "Intelligence",
    shortLabel: "J2",
    summary: "Collection posture, analytic validation, and the confidence behind every decision.",
  },
  operations: {
    label: "Operations",
    shortLabel: "J3",
    summary: "Operational tempo, frontline readiness, visible exercises, and near-term force employment.",
  },
  sustainment: {
    label: "Sustainment",
    shortLabel: "J4",
    summary: "Purchasing, repair throughput, fuel, mobility, and stock planning.",
  },
  plans: {
    label: "Plans",
    shortLabel: "J5",
    summary: "Budget shaping, alliance design, modernization sequencing, and the interactive tech tree.",
  },
  training: {
    label: "Training",
    shortLabel: "J7",
    summary: "Course cycles, certification tempo, simulation, and the conversion of plans into real skill.",
  },
};

const defaultStaffCapacities: StaffCapacityDefinition[] = [
  { directorate: "people", capacity: 3, strainedAt: 3, overloadedAt: 5 },
  { directorate: "intelligence", capacity: 3, strainedAt: 3, overloadedAt: 5 },
  { directorate: "operations", capacity: 4, strainedAt: 4, overloadedAt: 6 },
  { directorate: "sustainment", capacity: 4, strainedAt: 4, overloadedAt: 6 },
  { directorate: "plans", capacity: 3, strainedAt: 3, overloadedAt: 5 },
  { directorate: "training", capacity: 3, strainedAt: 3, overloadedAt: 5 },
];

export const defaultStaffFunctionDefinitions: StaffFunctionDefinition[] = [
  {
    id: "S1",
    label: "Personnel",
    shortLabel: "S1",
    directorates: ["people"],
    doctrineNote: "Protect force generation, retention, reserve predictability, and recovery debt.",
    metricLabels: ["Deployable units", "Reserve strain", "Personnel shortfalls"],
  },
  {
    id: "S2",
    label: "Intelligence",
    shortLabel: "S2",
    directorates: ["intelligence"],
    doctrineNote: "Keep warning confidence honest under collection gaps and deception pressure.",
    metricLabels: ["Confidence", "Warning reliability", "Deception pressure"],
  },
  {
    id: "S3",
    label: "Operations",
    shortLabel: "S3",
    directorates: ["operations", "training"],
    doctrineNote: "Convert posture and training guidance into executable readiness.",
    metricLabels: ["Deployable units", "Training throughput", "Incident ladder"],
  },
  {
    id: "S4",
    label: "Logistics",
    shortLabel: "S4",
    directorates: ["sustainment"],
    doctrineNote: "Keep depot, munitions, fuel, and lift constraints inside the promise envelope.",
    metricLabels: ["Depot backlog", "Munitions", "Lift availability"],
  },
  {
    id: "S5",
    label: "Plans",
    shortLabel: "S5",
    directorates: ["plans"],
    doctrineNote: "Sequence alliance, political, and modernization choices into a coherent campaign.",
    metricLabels: ["Cabinet cover", "Alliance alignment", "Committee tolerance"],
  },
];

function campaignObjectiveMetricValue(state: CampaignState, metric: CampaignObjective["metric"]) {
  if (metric === "deployableUnits") return state.strategic.forceGeneration.deployableUnits;
  if (metric === "politicalAlignment") return state.strategic.alliance.politicalAlignment;
  if (metric === "cabinetCover") return state.strategic.domestic.cabinetCover;
  return state.strategic.escalation.incidentLadder;
}

/**
 * The player-facing milestones for a campaign, each with whether it is
 * currently met. This is the single source of truth for objective status —
 * the browser, the records list, and the engine's own win/lose check all read
 * from here so a milestone never reads "met" in one place and "not met" in
 * another.
 */
export function evaluateCampaignObjectives(state: CampaignState): CampaignObjectiveCheck[] {
  return state.briefing.campaignObjectives.map((objective) => {
    const current = campaignObjectiveMetricValue(state, objective.metric);
    const met = objective.direction === "gte" ? current >= objective.target : current <= objective.target;
    return { ...objective, current, met };
  });
}

export function countMetCampaignObjectives(state: CampaignState) {
  const checks = evaluateCampaignObjectives(state);
  return { met: checks.filter((entry) => entry.met).length, total: checks.length };
}

export type CampaignRiskMargin = {
  key: "force" | "political" | "escalation";
  label: string;
  margin: number;
  status: "secure" | "watch" | "critical";
  trend: "improving" | "stable" | "worsening";
  detail: string;
};

/**
 * The canonical player-facing campaign orientation. These are directly
 * observable command conditions only; adversary-derived S2 estimates remain
 * in their own confidence-aware readouts rather than being turned into false
 * precision here. The same collapse margins are consumed by the resolver.
 */
export function buildCampaignLegibility(state: CampaignState, previous?: CampaignState) {
  const measures = [
    {
      key: "force" as const,
      label: "Credible force",
      current: state.strategic.forceGeneration.deployableUnits,
      previous: previous?.strategic.forceGeneration.deployableUnits,
      limit: 3.5,
      direction: "higher" as const,
      detail: "Deployable formations before the posture can no longer be held.",
    },
    {
      key: "political" as const,
      label: "Political cover",
      current: state.strategic.domestic.cabinetCover,
      previous: previous?.strategic.domestic.cabinetCover,
      limit: 12,
      direction: "higher" as const,
      detail: "Cabinet room before the campaign loses domestic cover.",
    },
    {
      key: "escalation" as const,
      label: "Escalation control",
      current: state.strategic.escalation.incidentLadder,
      previous: previous?.strategic.escalation.incidentLadder,
      limit: 82,
      direction: "lower" as const,
      detail: "Room before the incident ladder runs beyond command control.",
    },
  ];
  const risks: CampaignRiskMargin[] = measures.map((measure) => {
    const margin = roundMetric(measure.direction === "higher" ? measure.current - measure.limit : measure.limit - measure.current);
    const movement = measure.previous === undefined ? 0 : measure.current - measure.previous;
    const beneficialMovement = measure.direction === "higher" ? movement : -movement;
    return {
      key: measure.key,
      label: measure.label,
      margin,
      status: margin <= 8 ? "critical" : margin <= 20 ? "watch" : "secure",
      trend: beneficialMovement > 0.5 ? "improving" : beneficialMovement < -0.5 ? "worsening" : "stable",
      detail: measure.detail,
    };
  });
  return {
    month: Math.min(state.turn, state.maxTurns),
    maxTurns: state.maxTurns,
    turnsRemaining: Math.max(0, state.maxTurns - state.turn + 1),
    risks: risks.sort((left, right) => left.margin - right.margin),
    milestones: evaluateCampaignObjectives(state),
  };
}

/** A stable player-facing identity derived from the authoritative opening seed. */
export function campaignDisplayName(state: CampaignState) {
  const callsigns = ["Anvil", "Beacon", "Cedar", "Falcon", "Harbor", "Lantern", "Northstar", "Vanguard"];
  const phases = ["Watch", "Line", "Shield", "Resolve", "Horizon", "Bridge", "Signal", "Reserve"];
  const left = callsigns[Math.abs(state.seed) % callsigns.length];
  const right = phases[Math.floor(Math.abs(state.seed) / callsigns.length) % phases.length];
  return `${left} ${right}`;
}

export function buildStrategicMetricBriefs(state: CampaignState): StrategicMetricBrief[] {
  const force = state.strategic.forceGeneration;
  const intel = state.strategic.intelligence;
  const sustainment = state.strategic.sustainment;
  const alliance = state.strategic.alliance;
  const domestic = state.strategic.domestic;
  const escalation = state.strategic.escalation;

  const budgetTotal = clamp(1.15 + alliance.politicalAlignment * 0.004 - domestic.mediaHeat * 0.0018, 0.8, 2.4);
  const budgetShare = clamp(2.7 + domestic.committeeTolerance * 0.018, 2.0, 4.4);
  const committed = clamp(budgetTotal * (0.56 + (100 - sustainment.depotBacklog) / 320), 0.3, budgetTotal * 0.95);
  const lastYear = clamp(budgetTotal * 0.93, 0.4, 3.2);

  const deployable = Math.round(force.deployableUnits);
  const readyPct = Math.round(clamp(42 + force.trainingThroughput * 0.34 - force.personnelShortfalls * 0.18, 28, 86));
  const cabinetVotes = Math.round(clamp(domestic.cabinetCover * 0.78, 12, 84));
  const coalitionSeats = 96;
  const alignedPartners = Math.round(clamp(alliance.politicalAlignment / 12, 1, 8));
  const partnerCount = 8;
  const publicSupport = Math.round(clamp(domestic.publicPatience * 0.76 - domestic.mediaHeat * 0.18, 20, 78));
  const incidents = Math.round(clamp(escalation.probeTempo * 0.85 + escalation.incidentLadder * 0.45, 2, 24));

  return [
    {
      key: "budget",
      label: "Budget",
      headline: formatBillions(budgetTotal),
      status: budgetTotal > 1.7 ? "usable headroom" : budgetTotal > 1.25 ? "managed envelope" : "tight envelope",
      detailTitle: "Defense program position",
      detailLines: [
        `${budgetShare.toFixed(1)}% of national budget`,
        `${formatBillions(committed)} committed this fiscal year`,
        `${formatBillions(lastYear)} last year`,
        `${Math.round(domestic.committeeTolerance)} committee tolerance index`,
      ],
    },
    {
      key: "readiness",
      label: "Readiness",
      headline: `${deployable}/12 brigades deployable`,
      status: deployable >= 7 ? "credible posture" : deployable >= 5 ? "recovering posture" : "thin posture",
      detailTitle: "Force generation picture",
      detailLines: [
        `${readyPct}% mission-ready formations`,
        `${Math.round(force.trainingThroughput)} training throughput index`,
        `${Math.round(force.personnelShortfalls)} personnel shortfall pressure`,
        `${Math.round(sustainment.depotBacklog)} depot backlog pressure`,
      ],
    },
    {
      key: "political",
      label: "Political",
      headline: `${cabinetVotes}/${coalitionSeats} coalition votes`,
      status: domestic.cabinetCover >= 58 ? "secure cover" : domestic.cabinetCover >= 42 ? "contested cover" : "thin cover",
      detailTitle: "Domestic cover",
      detailLines: [
        `${Math.round(domestic.cabinetCover)} cabinet cover index`,
        `${Math.round(domestic.committeeTolerance)} committee tolerance`,
        `${Math.round(domestic.mediaHeat)} media heat`,
        `${Math.round(domestic.publicPatience)} public patience`,
      ],
    },
    {
      key: "alliance",
      label: "Allies",
      headline: `${alignedPartners}/${partnerCount} aligned`,
      status: alliance.reassurance >= 60 ? "cohesive front" : alliance.reassurance >= 45 ? "holding together" : "fraying front",
      detailTitle: "Alliance posture",
      detailLines: [
        `${Math.round(alliance.reassurance)} reassurance index`,
        `${Math.round(alliance.partnerParticipation)} partner participation`,
        `${Math.round(alliance.partnerPublicSupport)} partner public support`,
        `${Math.round(alliance.politicalAlignment)} political alignment`,
      ],
    },
    {
      key: "public",
      label: "Public",
      headline: `${publicSupport}% support`,
      status: domestic.publicPatience >= 60 ? "settled mood" : domestic.publicPatience >= 45 ? "mixed mood" : "brittle mood",
      detailTitle: "Public backing",
      detailLines: [
        `${Math.round(domestic.publicPatience)} patience index`,
        `${Math.round(domestic.mediaHeat)} hostile coverage pressure`,
        `${Math.round(force.reserveStrain)} reserve strain`,
        `${Math.round(average([domestic.cabinetCover, domestic.publicPatience]))}% modeled confidence in command`,
      ],
    },
    {
      key: "escalation",
      label: "Escalation",
      headline: `${incidents} incidents/month`,
      status: escalation.incidentLadder <= 38 ? "contained pressure" : escalation.incidentLadder <= 58 ? "watchful pressure" : "acute pressure",
      detailTitle: "Theater pressure",
      detailLines: [
        `${Math.round(escalation.probeTempo)} probe tempo`,
        `${Math.round(escalation.warningTime)} hours warning time`,
        `${Math.round(escalation.crisisSensitivity)} crisis sensitivity`,
        `${Math.round(intel.warningReliability)} warning reliability`,
      ],
    },
  ];
}

export function buildDirectorateBurden(
  memos: DecisionMemo[],
  selections: MemoSelection[],
  staffCapacities: StaffCapacityDefinition[] = defaultStaffCapacities,
  staffNegotiations: StaffNegotiation[] = [],
  burdenBias: BurdenBias = { priorityLanes: [], underpricedLanes: [] },
): DirectorateBurden[] {
  const selectedByMemo = new Map(selections.map((selection) => [selection.memoId, selection.optionId]));
  const capacities = new Map(staffCapacities.map((entry) => [entry.directorate, entry]));
  const totals: Record<DirectorateId, number> = {
    people: 0,
    intelligence: 0,
    operations: 0,
    sustainment: 0,
    plans: 0,
    training: 0,
  };

  for (const memo of memos) {
    const optionId = selectedByMemo.get(memo.id);
    const option = memo.options.find((entry) => entry.id === optionId);
    if (!option) {
      continue;
    }
    for (const entry of option.burden) {
      totals[entry.directorate] += entry.points;
    }
  }
  for (const negotiation of staffNegotiations) {
    totals[negotiation.directorate] = Math.max(0, totals[negotiation.directorate] - negotiation.reliefPoints);
  }

  return directorateSchema.options.map((directorate) => {
    const burdenPoints = totals[directorate];
    const config = capacities.get(directorate) ?? defaultStaffCapacities.find((entry) => entry.directorate === directorate);
    const capacity = config?.capacity ?? 3;
    const strainedAt = config?.strainedAt ?? capacity;
    const overloadedAt = config?.overloadedAt ?? capacity + 2;
    const excess = Math.max(0, burdenPoints - capacity);
    const burdenLevel: BurdenLevel =
      burdenPoints >= overloadedAt ? "overloaded" : burdenPoints >= strainedAt ? "strained" : "light";

    const failureMode =
      directorate === "people"
        ? "follow-through attrition and reserve friction"
        : directorate === "intelligence"
          ? "lower confidence and contradictory briefing"
          : directorate === "operations"
            ? "shallow rehearsal and hollow readiness claims"
            : directorate === "sustainment"
              ? "repair backlog and transport slippage"
              : directorate === "plans"
                ? "elegant but unabsorbable plans"
                : "paper certifications and instructor bottlenecks";

    const confidencePenalty = burdenLevel === "overloaded" ? 8 + excess * 4 : burdenLevel === "strained" ? 4 : 0;
    const executionPenalty = burdenLevel === "overloaded" ? 10 + excess * 6 : burdenLevel === "strained" ? 5 : 0;

    // Doctrine 3: routing attention labels the lane's place in the composed burden bias.
    // Negotiations subtract BEFORE classification, so the label reflects the
    // post-negotiation reality. Attention only — the math above is untouched.
    const routingAttention: DirectorateBurden["routingAttention"] = burdenBias.priorityLanes.includes(directorate)
      ? "priority"
      : burdenBias.underpricedLanes.includes(directorate)
        ? "underpriced"
        : "neutral";

    return {
      directorate,
      burdenPoints,
      capacity,
      burdenLevel,
      failureMode,
      confidencePenalty,
      executionPenalty,
      routingAttention,
      summary:
        burdenLevel === "overloaded"
          ? `${directorateLabel(directorate)} is carrying more than it can absorb this month. Expect ${failureMode}.`
          : burdenLevel === "strained"
            ? `${directorateLabel(directorate)} is right at the limit of what it can absorb this month.`
            : `${directorateLabel(directorate)} has room to absorb what you have chosen.`,
    };
  });
}

function staffMetricStatus(value: number, inverted = false): StaffFunctionMetric["status"] {
  const risk = inverted ? value >= 62 : value <= 42;
  const watch = inverted ? value >= 48 : value <= 55;
  if (risk) return "risk";
  if (watch) return "watch";
  return "healthy";
}

function staffFunctionMetrics(id: StaffFunctionId, state: CampaignState): StaffFunctionMetric[] {
  switch (id) {
    case "S1":
      return [
        { label: "Recovery debt", value: state.staffMechanics.s1.recoveryDebt, status: staffMetricStatus(state.staffMechanics.s1.recoveryDebt, true) },
        { label: "Reserve predictability", value: state.staffMechanics.s1.reservePredictability, status: staffMetricStatus(state.staffMechanics.s1.reservePredictability) },
        { label: "Deployable units", value: state.strategic.forceGeneration.deployableUnits, status: state.strategic.forceGeneration.deployableUnits < 5 ? "risk" : state.strategic.forceGeneration.deployableUnits < 7 ? "watch" : "healthy" },
        { label: "Reserve strain", value: state.strategic.forceGeneration.reserveStrain, status: staffMetricStatus(state.strategic.forceGeneration.reserveStrain, true) },
      ];
    case "S2": {
      const visValue = state.staffMechanics.s2.visibility === "KNOWN" ? 100 : state.staffMechanics.s2.visibility === "ESTIMATED" ? 50 : 0;
      const visStatus: StaffFunctionMetric["status"] = state.staffMechanics.s2.visibility === "KNOWN" ? "healthy" : state.staffMechanics.s2.visibility === "ESTIMATED" ? "watch" : "risk";
      return [
        { label: "External estimate confidence", value: state.staffMechanics.s2.externalEstimateConfidence, status: staffMetricStatus(state.staffMechanics.s2.externalEstimateConfidence) },
        { label: "Deception risk", value: state.staffMechanics.s2.deceptionRisk, status: staffMetricStatus(state.staffMechanics.s2.deceptionRisk, true) },
        { label: "Confidence", value: state.strategic.intelligence.confidence, status: staffMetricStatus(state.strategic.intelligence.confidence) },
        { label: `Picture class: ${state.staffMechanics.s2.visibility.toLowerCase()}`, value: visValue, status: visStatus },
      ];
    }
    case "S3":
      return [
        { label: "Visible posture", value: state.staffMechanics.s3.visiblePosture, status: staffMetricStatus(state.staffMechanics.s3.visiblePosture) },
        { label: "Executable posture", value: state.staffMechanics.s3.executablePosture, status: staffMetricStatus(state.staffMechanics.s3.executablePosture) },
        { label: "Credible deterrence", value: state.staffMechanics.s3.credibleDeterrence, status: staffMetricStatus(state.staffMechanics.s3.credibleDeterrence) },
        { label: "Deployable units", value: state.strategic.forceGeneration.deployableUnits, status: state.strategic.forceGeneration.deployableUnits < 5 ? "risk" : state.strategic.forceGeneration.deployableUnits < 7 ? "watch" : "healthy" },
      ];
    case "S4":
      return [
        { label: "Stockpile depth", value: state.staffMechanics.s4.stockpileDepth, status: staffMetricStatus(state.staffMechanics.s4.stockpileDepth) },
        { label: "Lift burn", value: state.staffMechanics.s4.liftBurn, status: staffMetricStatus(state.staffMechanics.s4.liftBurn, true) },
        { label: "Supportable tempo", value: state.staffMechanics.s4.supportableTempo, status: staffMetricStatus(state.staffMechanics.s4.supportableTempo) },
        { label: "Depot backlog", value: state.strategic.sustainment.depotBacklog, status: staffMetricStatus(state.strategic.sustainment.depotBacklog, true) },
      ];
    case "S5":
      return [
        { label: "Strategic coherence", value: state.staffMechanics.s5.strategicCoherence, status: staffMetricStatus(state.staffMechanics.s5.strategicCoherence) },
        { label: "Doctrine alignment", value: state.staffMechanics.s5.doctrineAlignment, status: staffMetricStatus(state.staffMechanics.s5.doctrineAlignment) },
        { label: "Cabinet cover", value: state.strategic.domestic.cabinetCover, status: staffMetricStatus(state.strategic.domestic.cabinetCover) },
        { label: "Alliance alignment", value: state.strategic.alliance.politicalAlignment, status: staffMetricStatus(state.strategic.alliance.politicalAlignment) },
      ];
  }
}

export function buildStaffFunctionReadouts(
  definitions: StaffFunctionDefinition[] = defaultStaffFunctionDefinitions,
  burdens: DirectorateBurden[],
  state: CampaignState,
  burdenBias: BurdenBias = { priorityLanes: [], underpricedLanes: [] },
): StaffFunctionReadout[] {
  const burdenByDirectorate = new Map(burdens.map((entry) => [entry.directorate, entry]));
  return definitions.map((definition) => {
    const entries = definition.directorates.map((directorate) => burdenByDirectorate.get(directorate)).filter((entry): entry is DirectorateBurden => Boolean(entry));
    const burdenPoints = entries.reduce((sum, entry) => sum + entry.burdenPoints, 0);
    const capacity = entries.reduce((sum, entry) => sum + entry.capacity, 0);
    const headroom = capacity - burdenPoints;
    const hasOverloaded = entries.some((entry) => entry.burdenLevel === "overloaded");
    const hasStrained = entries.some((entry) => entry.burdenLevel === "strained");
    const metrics = staffFunctionMetrics(definition.id, state);
    const hasMetricRisk = metrics.some((metric) => metric.status === "risk");
    const status: StaffFunctionReadout["status"] = hasOverloaded && hasMetricRisk ? "compromised" : hasOverloaded ? "overloaded" : hasStrained ? "strained" : "ready";
    // Doctrine 3: an underpriced lane that is strained/overloaded REPLACES its plain
    // summary with the underpriced-framed warning — exactly ONE warning per lane, so the
    // accepted-risk docket shows exactly one tick per lane (no double-listing).
    const warnings = [
      ...entries
        .filter((entry) => entry.burdenLevel !== "light")
        .map((entry) =>
          burdenBias.underpricedLanes.includes(entry.directorate)
            ? `${entry.summary} ${underpricedLaneWarningSuffix}`
            : entry.summary,
        ),
      ...metrics.filter((metric) => metric.status === "risk").map((metric) => `${metric.label} is in the risk band.`),
    ];

    // Doctrine 3: union of the function's directorates' routing labels with priority
    // precedence (priority > underpriced > neutral). Warning logic is independent of
    // this label — S3 (ops=priority, training=underpriced) still surfaces the training
    // warning even though the readout label is "priority".
    const routingAttention: StaffFunctionReadout["routingAttention"] = definition.directorates.some((directorate) =>
      burdenBias.priorityLanes.includes(directorate),
    )
      ? "priority"
      : definition.directorates.some((directorate) => burdenBias.underpricedLanes.includes(directorate))
        ? "underpriced"
        : "neutral";

    const primaryBurden = entries.find((entry) => entry.burdenLevel === "overloaded")
      ?? entries.find((entry) => entry.burdenLevel === "strained")
      ?? entries[0];
    const failureMode = primaryBurden?.failureMode ?? "";
    return {
      id: definition.id,
      label: definition.label,
      shortLabel: definition.shortLabel,
      directorates: definition.directorates,
      status,
      burdenPoints,
      capacity,
      headroom,
      warnings,
      failureMode,
      activeWarning: warnings[0] ?? null,
      standingRemit: definition.doctrineNote,
      metrics,
      routingAttention,
    };
  });
}

// Maps a directorate to the staff function that carries it (falls back to S3, matching
// the engine's aggregation behavior for multi-directorate functions). Exported so the
// sim can re-use the same mapping for Doctrine 3 override matching (resolveBurdenDissent).
export function staffFunctionForDirectorate(definitions: StaffFunctionDefinition[], directorate: DirectorateId) {
  return (
    definitions.find((definition) => definition.directorates.includes(directorate)) ??
    definitions.find((definition) => definition.id === "S3") ??
    defaultStaffFunctionDefinitions[2]
  );
}

function mostUrgentMetric(metrics: StaffFunctionMetric[]) {
  return (
    metrics.find((metric) => metric.status === "risk") ??
    metrics.find((metric) => metric.status === "watch") ??
    metrics[0] ?? { label: "Staff condition", value: 50, status: "healthy" as const }
  );
}

function buildChiefStaffReadoutEvidence(
  chief: ChiefArchetype,
  state: CampaignState,
  burdens: DirectorateBurden[] = [],
  definitions: StaffFunctionDefinition[] = defaultStaffFunctionDefinitions,
): ChiefStaffReadoutEvidence {
  const staffFunction = staffFunctionForDirectorate(definitions, chief.directorate);
  const metrics = staffFunctionMetrics(staffFunction.id, state);
  const metric = mostUrgentMetric(metrics);
  const relevantBurdens = staffFunction.directorates
    .map((directorate) => burdens.find((entry) => entry.directorate === directorate))
    .filter((entry): entry is DirectorateBurden => Boolean(entry));
  const burdenPoints = relevantBurdens.reduce((sum, entry) => sum + entry.burdenPoints, 0);
  const burdenLevel: BurdenLevel = relevantBurdens.some((entry) => entry.burdenLevel === "overloaded")
    ? "overloaded"
    : relevantBurdens.some((entry) => entry.burdenLevel === "strained")
      ? "strained"
      : "light";
  const burdenText =
    burdenLevel === "overloaded"
      ? "overloaded"
      : burdenLevel === "strained"
        ? "strained"
        : "inside capacity";
  const rationale =
    `${staffFunction.shortLabel} evidence: ${metric.label} is ${Math.round(metric.value)} (${metric.status}), ` +
    `and the staff carrying this work are ${burdenText} at ${roundMetric(burdenPoints)} ` +
    `${roundMetric(burdenPoints) === 1 ? "burden point" : "burden points"}.`;

  return {
    staffFunctionId: staffFunction.id,
    staffFunctionLabel: staffFunction.label,
    metricLabel: metric.label,
    metricValue: roundMetric(metric.value),
    metricStatus: metric.status,
    burdenLevel,
    burdenPoints: roundMetric(burdenPoints),
    rationale,
  };
}

function uniqueLimited<T extends string>(values: T[], limit: number): T[] {
  return Array.from(new Set(values.filter(Boolean))).slice(0, limit);
}

function defaultChiefAgendaMemory(chiefId: string): ChiefAgendaMemoryEntry {
  return {
    chiefId,
    focusTags: [],
    concernTags: [],
    lastMemoId: null,
    lastOptionId: null,
    lastPosition: null,
    pressure: 0,
    lastTurn: 0,
    notes: [],
  };
}

function agendaMemoryFor(state: CampaignState, chiefId: string) {
  return state.chiefAgendaMemory[chiefId] ?? defaultChiefAgendaMemory(chiefId);
}

function agendaTagsFor(chief: ChiefArchetype, option: MemoOption) {
  const preferred = option.tags.filter((tag) => chief.preferredTags.includes(tag));
  const concerns = option.tags.filter((tag) => chief.concernTags.includes(tag));
  return {
    focusTags: uniqueLimited(preferred.length > 0 ? preferred : option.tags, 4),
    concernTags: uniqueLimited(concerns, 4),
  };
}

function pressureDeltaFor(position: ChiefPositionType) {
  if (position === "support") return -1;
  if (position === "accept_risk") return 0;
  if (position === "request_conditions") return 1;
  return 2;
}

function agendaMemoryNote(memory: ChiefAgendaMemoryEntry) {
  if (!memory.lastMemoId || !memory.lastOptionId || !memory.lastPosition || memory.notes.length === 0) return null;
  const pressureLine = memory.pressure >= 7 ? "Pressure remains high" : memory.pressure >= 4 ? "Pressure remains active" : "Prior concern is logged";
  return `${pressureLine}: ${memory.notes[0]}`;
}

function updateChiefAgendaMemoryEntry(
  state: CampaignState,
  chief: ChiefArchetype,
  memo: DecisionMemo,
  option: MemoOption,
  position: ChiefPositionType,
  noteSuffix?: string,
) {
  const previous = agendaMemoryFor(state, chief.id);
  const tags = agendaTagsFor(chief, option);
  const nextPressure = clamp(previous.pressure + pressureDeltaFor(position), 0, 10);
  const positionText = position.replace("_", " ");
  const suffix = noteSuffix ? ` ${noteSuffix}` : "";
  const note = `${memo.title}: ${positionText} on ${option.label}.${suffix}`;

  return {
    chiefId: chief.id,
    focusTags: uniqueLimited([...tags.focusTags, ...previous.focusTags], 4),
    concernTags: uniqueLimited([...tags.concernTags, ...previous.concernTags], 4),
    lastMemoId: memo.id,
    lastOptionId: option.id,
    lastPosition: position,
    pressure: nextPressure,
    lastTurn: state.turn,
    notes: uniqueLimited([note, ...previous.notes], 4),
  };
}

export function updateChiefAgendaMemoryFromPositions(
  state: CampaignState,
  chiefs: ChiefArchetype[],
  selections: Array<{ memo: DecisionMemo; option: MemoOption; positions: ChiefPositionEntry[] }>,
) {
  const nextMemory = { ...state.chiefAgendaMemory };
  for (const chief of chiefs) {
    for (const selection of selections) {
      const position = selection.positions.find((entry) => entry.chiefId === chief.id);
      if (!position) continue;
      const memoryState = { ...state, chiefAgendaMemory: nextMemory };
      nextMemory[chief.id] = updateChiefAgendaMemoryEntry(memoryState, chief, selection.memo, selection.option, position.position);
    }
  }
  return nextMemory;
}

export function updateChiefAgendaMemoryFromConversation(
  state: CampaignState,
  chief: ChiefArchetype,
  memo: DecisionMemo,
  option: MemoOption,
  conversation: ChiefConversationRecord,
) {
  return {
    ...state.chiefAgendaMemory,
    [chief.id]: updateChiefAgendaMemoryEntry(
      state,
      chief,
      memo,
      option,
      conversation.position,
      `Conversation closed ${conversation.totalTrustDelta >= 0 ? "with alignment" : "with friction"}.`,
    ),
  };
}

function commitmentTypeForOption(option: MemoOption): ActiveCommitment["type"] {
  if (option.tags.includes("public-commitment")) return "cabinet";
  if (option.tags.includes("alliance")) return "alliance";
  if (option.tags.includes("program") || option.tags.includes("modernization")) return "program";
  return "doctrine";
}

function conversationCommitmentLabel(chief: ChiefArchetype, option: MemoOption, closingChoice: string) {
  const closingText =
    closingChoice === "closing-bounded-order"
      ? "bounded order"
      : closingChoice === "closing-dissent-on-record"
        ? "dissent on record"
        : closingChoice === "closing-override"
          ? "overridden risk"
          : closingChoice === "closing-reframe"
            ? "tighter packet"
            : "negotiated commitment";
  return `${chief.title} ${closingText}: ${option.label}`;
}

export function updateCommitmentsFromChiefConversation(
  state: CampaignState,
  chief: ChiefArchetype,
  memo: DecisionMemo,
  option: MemoOption,
  conversation: ChiefConversationRecord,
): ActiveCommitment[] {
  if (conversation.status !== "completed") return state.activeCommitments;
  const closingChoice = conversation.choiceTrail[conversation.choiceTrail.length - 1] ?? "";
  if (closingChoice === "closing-defer") return state.activeCommitments;

  const id = `conversation-${state.turn}-${chief.id}-${memo.id}-${option.id}`;
  if (state.activeCommitments.some((entry) => entry.id === id)) return state.activeCommitments;

  return [
    ...state.activeCommitments,
    {
      id,
      type: commitmentTypeForOption(option),
      label: conversationCommitmentLabel(chief, option, closingChoice),
      turnMade: state.turn,
      fulfilled: null,
    },
  ];
}

function coalitionPosture(
  supporters: ChiefPositionEntry[],
  conditional: ChiefPositionEntry[],
  objectors: ChiefPositionEntry[],
  staffConstraints: DirectorateBurden[],
): ChiefCoalitionEntry["posture"] {
  if (objectors.length > 0 && staffConstraints.length > 0) return "blocked";
  if (objectors.length > 0) return "contested";
  if (conditional.length > 0) return "conditional";
  return "supporting";
}

function chiefNames(entries: ChiefPositionEntry[]) {
  return entries.map((entry) => entry.chiefName);
}

function chiefIds(entries: ChiefPositionEntry[]) {
  return entries.map((entry) => entry.chiefId);
}

export function buildChiefCoalitions(
  selections: Array<{ memo: DecisionMemo; option: MemoOption }>,
  chiefPositions: ChiefPositionEntry[],
  burdens: DirectorateBurden[],
): ChiefCoalitionEntry[] {
  const burdenByDirectorate = new Map(burdens.map((entry) => [entry.directorate, entry]));
  return selections.map(({ memo, option }) => {
    const positions = chiefPositions.filter((entry) => entry.memoId === memo.id && entry.optionId === option.id);
    const supporters = positions.filter((entry) => entry.position === "support");
    const conditional = positions.filter((entry) => entry.position === "accept_risk" || entry.position === "request_conditions");
    const objectors = positions.filter((entry) => entry.position === "oppose");
    const staffConstraints = option.burden
      .map((entry) => burdenByDirectorate.get(entry.directorate))
      .filter((entry): entry is DirectorateBurden => entry !== undefined && (entry.burdenLevel === "strained" || entry.burdenLevel === "overloaded"));
    const constrainedDirectorates = uniqueLimited(staffConstraints.map((entry) => entry.directorate), 6);
    const constrainedLabels = constrainedDirectorates.map((directorate) => directorateLabel(directorate).toLowerCase());
    const objectorNames = chiefNames(objectors);
    const conditionalNames = chiefNames(conditional);
    const supporterNames = chiefNames(supporters);
    const posture = coalitionPosture(supporters, conditional, objectors, staffConstraints);
    const constraintLine =
      constrainedDirectorates.length > 0
        ? `Staff constraint sits in ${constrainedLabels.join(", ")}.`
        : "No selected staff lane is currently strained or overloaded.";
    const negotiationLevers = [
      ...(constrainedDirectorates.length > 0 ? [`Reduce ${constrainedLabels.join(", ")} load before locking ${option.label}.`] : []),
      ...(objectorNames.length > 0 ? [`Negotiate objections with ${objectorNames.join(", ")}.`] : []),
      ...(conditionalNames.length > 0 ? [`Convert conditional support from ${conditionalNames.join(", ")} into written conditions.`] : []),
      ...(supporterNames.length > 0 ? [`Use ${supporterNames.join(", ")} as the support base.`] : []),
    ].slice(0, 4);

    return {
      memoId: memo.id,
      memoTitle: memo.title,
      optionId: option.id,
      optionLabel: option.label,
      posture,
      supportChiefIds: chiefIds(supporters),
      supportChiefNames: supporterNames,
      conditionalChiefIds: chiefIds(conditional),
      conditionalChiefNames: conditionalNames,
      objectionChiefIds: chiefIds(objectors),
      objectionChiefNames: objectorNames,
      staffConstraintDirectorates: constrainedDirectorates,
      staffConstraintSummaries: staffConstraints.map((entry) => entry.summary),
      summary: `${option.label} has ${supporters.length} supporter(s), ${conditional.length} conditional chief(s), and ${objectors.length} objector(s). ${constraintLine}`,
      negotiationLevers,
    };
  });
}

export function buildChiefPositions(
  chiefs: ChiefArchetype[],
  state: CampaignState,
  memo: DecisionMemo,
  option: MemoOption,
  burdens: DirectorateBurden[] = [],
  staffFunctionDefinitions: StaffFunctionDefinition[] = defaultStaffFunctionDefinitions,
  lens: DoctrineLens = neutralDoctrineLens,
): ChiefPositionEntry[] {
  return chiefs.map((chief) => {
    const trust = state.chiefTrust[chief.id] ?? 50;
    const staffReadoutEvidence = buildChiefStaffReadoutEvidence(chief, state, burdens, staffFunctionDefinitions);
    // ── Doctrine 3: advice style + routing leans (issue #57) ──────────────────────────
    // Advice style keys off the chief's STAFF FUNCTION (the composed directive for the
    // function covering the chief's directorate); routing keys off the chief's OWN
    // DIRECTORATE burden entry (underpricing is a directorate-level property — training,
    // not S3-as-a-whole). Every lean is anchor-gated: tag biases require the option to
    // carry the tag, positionLean fires only when the chief's own readout signals risk
    // or strain, routing leans fire only on the chief's own lane's burden. No
    // free-floating flavor.
    const staffFunction = staffFunctionForDirectorate(staffFunctionDefinitions, chief.directorate);
    const directive = lens.adviceStyle[staffFunction.id];
    const biasMatches = directive ? option.tags.filter((tag) => directive.biasTags.includes(tag)).length : 0;
    const cautionMatches = directive ? option.tags.filter((tag) => directive.cautionTags.includes(tag)).length : 0;
    // Advice-style anchor: FUNCTION-level readout (S3 evidence includes ops+training —
    // correct for advice style, which is a function voice).
    const readoutSignal =
      staffReadoutEvidence.metricStatus === "risk" || staffReadoutEvidence.burdenLevel !== "light";
    const adviceLean = directive !== undefined && readoutSignal ? directive.positionLean : 0;
    const adviceTagScore = Math.min(biasMatches, 2) - Math.min(cautionMatches, 2);

    // Routing leans anchor on the chief's OWN DIRECTORATE burden (not the aggregated
    // function readout): underpricing is a directorate-level property.
    const ownLaneBurden = burdens.find((entry) => entry.directorate === chief.directorate);
    const laneSignal = ownLaneBurden ? ownLaneBurden.burdenLevel !== "light" : false;
    const feedsOwnLane = option.burden.some((contribution) => contribution.directorate === chief.directorate);
    const priorityLaneLean =
      lens.burdenBias.priorityLanes.includes(chief.directorate) && feedsOwnLane ? 1 : 0;
    // Underpriced-lane dissent: a chief whose lane the faction's doctrine underprices
    // objects when her lane is squeezed. The pile-on penalty (-3) fires only when the
    // option actually loads her lane while it is strained/overloaded; the background
    // term (-1) reflects general wariness while the lane stays squeezed. Lane-ALIGNED
    // options (matching her preferredTags) still earn enough score to keep her support
    // — dissent is reserved for burden without alignment, which is the underpricing
    // failure mode.
    const underpricedDissent =
      lens.burdenBias.underpricedLanes.includes(chief.directorate) && laneSignal
        ? feedsOwnLane
          ? -3
          : -1
        : 0;

    const relationshipBias = trust >= 72 ? 2 : trust >= 60 ? 1 : trust <= 32 ? -2 : trust <= 44 ? -1 : 0;
    const preferredMatches = option.tags.filter((tag) => chief.preferredTags.includes(tag)).length;
    const concernMatches = option.tags.filter((tag) => chief.concernTags.includes(tag)).length;
    const memory = agendaMemoryFor(state, chief.id);
    const memoryPreferredMatches = option.tags.filter((tag) => memory.focusTags.includes(tag)).length;
    const memoryConcernMatches = option.tags.filter((tag) => memory.concernTags.includes(tag)).length;
    const memoryPressurePenalty = memory.pressure >= 7 && memory.lastPosition === "oppose" ? 1 : 0;
    const sponsorAffinity = chief.directorate === memo.sponsorDirectorate ? 1 : 0;
    const objectorPenalty = chief.directorate === memo.objectorDirectorate ? 1 : 0;
    const riskPenalty =
      option.tags.includes("escalatory") && chief.riskTolerance < 0.55
        ? 2
        : option.tags.includes("slow-burn") && chief.directorate === "operations"
          ? 1
          : 0;
    const memoryBias = Math.min(memoryPreferredMatches, 2) - Math.min(memoryConcernMatches, 2) - memoryPressurePenalty;
    const staffEvidencePenalty =
      (staffReadoutEvidence.metricStatus === "risk" ? 1 : 0) +
      (staffReadoutEvidence.burdenLevel === "overloaded" ? 1 : 0);
    const score =
      preferredMatches * 2 +
      sponsorAffinity +
      relationshipBias +
      memoryBias -
      concernMatches * 2 -
      objectorPenalty -
      riskPenalty -
      staffEvidencePenalty +
      adviceTagScore +
      adviceLean +
      priorityLaneLean +
      underpricedDissent;

    const position: ChiefPositionType =
      score >= 2
        ? "support"
        : score >= 0
          ? "accept_risk"
          : score === -1
            ? "request_conditions"
            : "oppose";

    const institutionalReason =
      position === "support"
        ? `${chief.title} backs this. It fits the directorate's line — ${chief.doctrineBias}.`
        : position === "accept_risk"
          ? `${chief.title} can live with this, but expects friction in ${directorateLabel(chief.directorate).toLowerCase()}.`
          : position === "request_conditions"
            ? `${chief.title} wants tighter assumptions before backing this.`
            : `${chief.title} objects. This cuts against what the directorate is responsible for.`;

    const requiredCondition =
      chief.directorate === "intelligence"
        ? "warning confidence must remain credible"
        : chief.directorate === "sustainment"
          ? "sustainment assumptions must remain inside realistic throughput"
          : chief.directorate === "operations"
            ? "readiness claims must survive rehearsal and branch planning"
            : chief.directorate === "plans"
              ? "political cover must survive first contact with committee scrutiny"
              : chief.directorate === "training"
                ? "units must be able to absorb the change repeatedly"
                : "personnel strain must stay inside a manageable range";

    const confidenceNote =
      state.strategic.intelligence.confidence < 55
        ? "The estimate is built on a partial picture."
        : state.strategic.escalation.warningTime < 42
          ? "Warning time is short enough that confidence may be false precision."
          : "The estimate is usable, but still not clean.";

    const consequenceIfIgnored =
      chief.directorate === "people"
        ? "Reserve friction and follow-through will surface next month."
        : chief.directorate === "intelligence"
          ? "Confidence will look cleaner on paper than in the brief."
          : chief.directorate === "operations"
            ? "Readiness will outrun actual executable plans."
            : chief.directorate === "sustainment"
              ? "The force will promise more than fuel, lift, and repair can support."
              : chief.directorate === "plans"
                ? "The room will become strategically coherent but operationally detached."
                : "Certification may improve faster than usable field performance.";

    // Doctrine 3: the gene voice carried on the card. Evidence stays on
    // staffReadoutEvidence (rendered adjacent), so the note is the joined summaries
    // only — it cannot drift from the evidence anchor. Omitted when the chief's staff
    // function has no composed directive.
    const adviceStyleNote = directive ? directive.summaries.join(" · ") : undefined;

    return {
      chiefId: chief.id,
      chiefName: chief.name,
      directorate: chief.directorate,
      memoId: memo.id,
      optionId: option.id,
      position,
      institutionalReason,
      requiredCondition,
      confidenceNote,
      consequenceIfIgnored,
      agendaMemoryNote: agendaMemoryNote(memory) ?? undefined,
      adviceStyleNote,
      staffReadoutEvidence,
    };
  });
}

export function relationshipLabel(trust: number) {
  if (trust >= 72) return "solid";
  if (trust >= 58) return "steady";
  if (trust >= 44) return "watchful";
  return "strained";
}

export function relationshipDeltaLabel(delta: number) {
  if (delta >= 2) return "relationship improves noticeably";
  if (delta === 1) return "relationship improves slightly";
  if (delta === 0) return "relationship holds steady";
  if (delta <= -2) return "relationship cools sharply";
  return "relationship cools";
}

export function getConversationRecordForTurn(state: CampaignState, chiefId: string, turn = state.turn) {
  return state.conversationHistory.find((entry) => entry.turn === turn && entry.chiefId === chiefId) ?? null;
}

export function chiefConversationStageMeta(stage: ChiefConversationStage) {
  const stages: Exclude<ChiefConversationStage, "completed">[] = ["opening", "diagnosis", "bargaining", "closing"];
  if (stage === "completed") {
    return { index: stages.length, total: stages.length, label: "Concluded" };
  }

  return {
    index: stages.indexOf(stage) + 1,
    total: stages.length,
    label:
      stage === "opening"
        ? "Opening"
        : stage === "diagnosis"
          ? "Diagnosis"
          : stage === "bargaining"
            ? "Bargaining"
            : "Decision",
  };
}

function conversationSeed(state: CampaignState, chiefId: string, memoId: string, optionId: string, stage: ChiefConversationStage, salt = "") {
  return hashString(`${state.seed}:${state.turn}:${chiefId}:${memoId}:${optionId}:${stage}:${salt}`);
}

function conversationTopic(memo: DecisionMemo, option: MemoOption) {
  if (option.tags.includes("deterrence")) return "visible deterrence";
  if (option.tags.includes("training")) return "training absorption";
  if (option.tags.includes("modernization") || option.tags.includes("program")) return "future capability";
  if (option.tags.includes("alliance")) return "coalition signaling";
  if (option.tags.includes("warning") || option.tags.includes("counter-deception")) return "warning confidence";
  if (option.tags.includes("repair") || option.tags.includes("lift") || option.tags.includes("fuel")) return "support reality";
  return memo.category.toLowerCase();
}

function directorateFocus(chief: ChiefArchetype) {
  switch (chief.directorate) {
    case "people":
      return "retention, reserve strain, and follow-through in the force";
    case "intelligence":
      return "the warning picture, deception pressure, and what the brief can actually claim";
    case "operations":
      return "rehearsal quality, visible readiness, and whether the plan can really be executed";
    case "sustainment":
      return "repair depth, lift, fuel, and the practical cost of every extra promise";
    case "plans":
      return "sequence, coalition messaging, and whether the room is spending future credibility too cheaply";
    case "training":
      return "repeatability, instructor depth, and whether units can absorb the change for real";
  }
}

function directorateRedLine(chief: ChiefArchetype) {
  switch (chief.directorate) {
    case "people":
      return "asking the force to absorb tempo without preserving experience";
    case "intelligence":
      return "pretending the brief is cleaner than it really is";
    case "operations":
      return "calling something ready before branch plans survive contact";
    case "sustainment":
      return "letting promise outrun lift, repair, and stock";
    case "plans":
      return "confusing a good concept with an absorbable month";
    case "training":
      return "mistaking paper certification for usable field performance";
  }
}

function pick<T>(values: T[], seed: number) {
  return values[seed % values.length] ?? values[0];
}

function trustColorText(trust: number) {
  if (trust >= 72) return "The chief is leaning in because prior guidance has felt disciplined.";
  if (trust >= 58) return "The chief is working with you in a professional, steady register.";
  if (trust >= 44) return "The chief is cooperative, but still reading for drift or overreach.";
  return "The chief is already guarding against being overcommitted by the room.";
}

type ConversationTopicProfile = {
  subject: string;
  hiddenRisk: string;
  operationalPayoff: string;
  externalAudience: string;
  burdenReality: string;
  likelyBreak: string;
  nextMonthBill: string;
};

type ChiefVoiceProfile = {
  opener: string[];
  cooperative: string[];
  skeptical: string[];
  confrontational: string[];
  closer: string[];
};

const chiefVoiceLibrary: Record<string, ChiefVoiceProfile> = {
  warden: {
    opener: [
      "Warden speaks as if she is already thinking about the names behind the numbers.",
      "Warden does not waste words when she thinks the force is being asked to absorb too much.",
      "Warden answers like someone who has already counted the follow-through cost.",
    ],
    cooperative: [
      "If you keep the force inside a survivable rhythm, I can help the room carry this.",
      "If the order protects experience instead of burning it, I can align behind it.",
    ],
    skeptical: [
      "I need the room to stop treating personnel strain as a line item that regenerates by itself.",
      "The force can look obedient while still becoming brittle underneath you.",
    ],
    confrontational: [
      "If you borrow readiness from families and reserve employers, the bill arrives fast and ugly.",
      "Do not ask me to call this disciplined if what you mean is that people will simply endure it.",
    ],
    closer: [
      "Give me a bounded order and I will keep the force with you.",
      "If you keep the month honest, my office can carry the human side of it.",
    ],
  },
  halden: {
    opener: [
      "Halden answers in the dry register of someone trying to keep the room from fooling itself.",
      "Halden looks down once at the brief and then comes back with the point he actually cares about.",
      "Halden sounds almost clinical when he thinks the estimate is being oversold.",
    ],
    cooperative: [
      "If the room is honest about uncertainty, I can defend the estimate.",
      "If the assumptions stay narrow, I can keep the brief coherent.",
    ],
    skeptical: [
      "The danger is not ignorance. It is false confidence wearing the shape of a clean packet.",
      "What worries me is not lack of activity; it is how quickly the room starts calling estimates facts.",
    ],
    confrontational: [
      "If you want theatrics, do not ask intelligence to certify them as reality.",
      "I will not let this headquarters advertise certainty it has not earned.",
    ],
    closer: [
      "Bound the claim and I can keep the warning picture usable.",
      "Leave the uncertainty visible and I can carry the brief without distorting it.",
    ],
  },
  briggs: {
    opener: [
      "Briggs answers with the impatience of someone who thinks drift can be as dangerous as error.",
      "Briggs leans in like the packet only matters if it changes what the force does in the field.",
      "Briggs sounds ready to move, but not ready to indulge decorative caution.",
    ],
    cooperative: [
      "If the order buys real field effect, I can put the force behind it.",
      "If you want deterrence, I can give you deterrence, but it has to be executable.",
    ],
    skeptical: [
      "I can live with caution. I cannot live with elegant drift dressed up as discipline.",
      "If this ends as slides instead of posture, the other side will spot it before cabinet does.",
    ],
    confrontational: [
      "Do not tell me to signal resolve with a packet too timid to survive first contact.",
      "If we are going to accept risk, I would rather accept visible risk than slow irrelevance.",
    ],
    closer: [
      "Give me a clear order and I will make it visible enough to matter.",
      "Just do not ask operations to carry a posture the rest of the headquarters refuses to support.",
    ],
  },
  okafor: {
    opener: [
      "Okafor answers like a man who has already traced the packet down to fuel, lift, and repair slots.",
      "Okafor does not sound alarmed; he sounds like he already knows where the month breaks first.",
      "Okafor replies in the tone of someone trying to rescue the room from its own optimism.",
    ],
    cooperative: [
      "If the order stays inside physical reality, I can keep the support picture stable.",
      "If we define the boundary honestly, I can make the month supportable.",
    ],
    skeptical: [
      "Headquarters optimism is cheap; lift, spares, and time are not.",
      "The force can promise more than the depots can actually carry. That gap is where trouble starts.",
    ],
    confrontational: [
      "If you want the appearance of activity without the bill, you are asking sustainment to perform fiction.",
      "Every extra promise consumes something real. The room should be made to say what that is.",
    ],
    closer: [
      "Bound the promise and I can keep the support side credible.",
      "If you decide to spend the buffer, at least spend it consciously.",
    ],
  },
  sato: {
    opener: [
      "Sato answers like she is listening to the room and the coalition at the same time.",
      "Sato rarely sounds hurried; she sounds like she is measuring whether this month will still make sense three months from now.",
      "Sato treats the packet as part strategy, part political instrument, and part future liability.",
    ],
    cooperative: [
      "If the line of effort is coherent, I can build the political and alliance frame around it.",
      "If the month holds together as a story and a plan, I can widen the room available to you.",
    ],
    skeptical: [
      "My worry is not whether the packet is attractive. It is whether it remains coherent once other audiences touch it.",
      "The room keeps confusing strategic elegance with absorbable pacing.",
    ],
    confrontational: [
      "If you want a sharper line, decide first which audience you are prepared to disappoint.",
      "Strategy dies when the headquarters says three different things to cabinet, allies, and the force.",
    ],
    closer: [
      "Give me a coherent line and I can carry it into the coalition cleanly.",
      "If the order is honest about limits, I can preserve some political room for the next month.",
    ],
  },
  navarro: {
    opener: [
      "Navarro answers like someone who measures plans against repetition, not enthusiasm.",
      "Navarro’s first instinct is always to ask whether the force can absorb the idea more than once.",
      "Navarro speaks in the clipped register of someone tired of promises outrunning preparation.",
    ],
    cooperative: [
      "If the order can be repeated cleanly, I can help make it real.",
      "If you want usable improvement instead of prestige, training can carry this.",
    ],
    skeptical: [
      "The force will certify faster than it learns if the room is careless.",
      "I can improve throughput, but not by pretending every new demand becomes skill on contact.",
    ],
    confrontational: [
      "If this is another packet that values presentation over repetition, say so now.",
      "I will not call something trained because the headquarters is impatient for applause.",
    ],
    closer: [
      "Keep the standard realistic and I can turn the order into usable repetition.",
      "If you narrow the packet, training can make it stick.",
    ],
  },
};

function chiefVoice(chief: ChiefArchetype) {
  return chief.dialogue ?? chiefVoiceLibrary[chief.id] ?? {
    opener: ["The chief answers in a careful, institutional register."], cooperative: ["If the month stays honest, I can support it."], skeptical: ["I need the room to be sharper about the risk it is accepting."], confrontational: ["I will not let the packet hide its real cost."], closer: ["Give me a bounded order and I can carry it."],
  };
}

function relationshipLine(chief: ChiefArchetype, state: CampaignState) {
  if (!chief.dialogue) return null;
  const completed = state.conversationHistory.filter((entry) => entry.chiefId === chief.id && entry.status === "completed");
  const last = completed.at(-1);
  const trust = state.chiefTrust[chief.id] ?? 50;
  const priorClosing = last?.choiceTrail.at(-1);
  const trustDirection = completed.slice(-2).reduce((sum, entry) => sum + entry.totalTrustDelta, 0);
  const commitment = state.activeCommitments.find((entry) => entry.id.includes(`-${chief.id}-`) && entry.fulfilled !== null);
  if (commitment?.fulfilled) return `${chief.dialogue.trustPositiveTell} You kept the earlier commitment, and that changes what I am prepared to carry now.`;
  if (commitment?.fulfilled === false) return `${chief.dialogue.trustNegativeTell} The earlier commitment broke; do not ask me to treat this as a fresh ledger.`;
  if (priorClosing === "closing-override") return `${chief.dialogue.trustNegativeTell} Last time you overrode the objection, so I am naming the cost before it becomes someone else's problem.`;
  if (priorClosing === "closing-defer") return `You deferred the last order. ${chief.dialogue.pressureResponse}; delay has not made that underlying condition disappear.`;
  if (priorClosing === "closing-bounded-order" || priorClosing === "closing-reframe") return `${chief.dialogue.trustPositiveTell} You protected the last boundary; I can be more specific about this one.`;
  if (trust >= 72 || trustDirection >= 3) return `${chief.dialogue.trustPositiveTell} That is why I will give you the usable version, not merely the safe answer.`;
  if (trust < 44 || trustDirection <= -3) return `${chief.dialogue.trustNegativeTell} I will still give you the facts; support is no longer automatic.`;
  if ((state.chiefAgendaMemory[chief.id]?.pressure ?? 0) >= 4) return `${chief.dialogue.pressureResponse}; this office has been carrying the same pressure across more than one month.`;
  return null;
}

function statePressureLine(chief: ChiefArchetype, state: CampaignState) {
  switch (chief.directorate) {
    case "people":
      return `Reserve strain is ${Math.round(state.strategic.forceGeneration.reserveStrain)} and personnel shortfalls are ${Math.round(state.strategic.forceGeneration.personnelShortfalls)}.`;
    case "intelligence":
      return `Confidence is ${Math.round(state.strategic.intelligence.confidence)} with warning reliability at ${Math.round(state.strategic.intelligence.warningReliability)}.`;
    case "operations":
      return `${Math.round(state.strategic.forceGeneration.deployableUnits)} brigades look deployable, but warning time is only ${Math.round(state.strategic.escalation.warningTime)} hours.`;
    case "sustainment":
      return `Depot backlog is ${Math.round(state.strategic.sustainment.depotBacklog)} with lift availability at ${Math.round(state.strategic.sustainment.liftAvailability)}.`;
    case "plans":
      return `Alliance alignment is ${Math.round(state.strategic.alliance.politicalAlignment)} while committee tolerance is ${Math.round(state.strategic.domestic.committeeTolerance)}.`;
    case "training":
      return `Training throughput is ${Math.round(state.strategic.forceGeneration.trainingThroughput)} with reserve strain still sitting at ${Math.round(state.strategic.forceGeneration.reserveStrain)}.`;
  }
}

function optionBurdenLine(chief: ChiefArchetype, option: MemoOption) {
  const ownBurden = option.burden.find((entry) => entry.directorate === chief.directorate)?.points ?? 0;
  const busiest = [...option.burden].sort((left, right) => right.points - left.points)[0];

  if (ownBurden >= 3) return `This packet lands hard on ${directorateLabel(chief.directorate).toLowerCase()} this month.`;
  if (ownBurden > 0) return "My office can absorb part of this, but only if the rest of the room stays disciplined.";
  if (busiest) return `${directorateLabel(busiest.directorate)} is carrying the heaviest direct burden in the packet.`;
  return "The direct burden is modest; the real risk is in what the room will quietly add later.";
}

function conversationTopicProfile(memo: DecisionMemo, option: MemoOption, state: CampaignState): ConversationTopicProfile {
  const subject = conversationTopic(memo, option);
  const warningTime = Math.round(state.strategic.escalation.warningTime);
  const reserveStrain = Math.round(state.strategic.forceGeneration.reserveStrain);
  const depotBacklog = Math.round(state.strategic.sustainment.depotBacklog);
  const allianceAlignment = Math.round(state.strategic.alliance.politicalAlignment);

  if (option.tags.includes("warning") || option.tags.includes("counter-deception")) {
    return {
      subject,
      hiddenRisk: "The room may be tempted to act on a cleaner picture than intelligence can honestly support.",
      operationalPayoff: `If done properly, the headquarters buys cleaner warning and a little more decision time than the current ${warningTime}-hour picture.`,
      externalAudience: "Cabinet and allies will only feel the value indirectly, so the room has to tolerate a quieter visible month.",
      burdenReality: "Analyst bandwidth and validation discipline become the real scarce goods.",
      likelyBreak: "The first break is a brief that sounds more certain than the collection base allows.",
      nextMonthBill: "If the packet is oversold now, next month’s bill is mistrust in the brief itself.",
    };
  }

  if (option.tags.includes("alliance") || option.tags.includes("public-commitment")) {
    return {
      subject,
      hiddenRisk: "Public reassurance can outrun what the force or cabinet is actually willing to sustain.",
      operationalPayoff: "A cleaner political frame can widen room for maneuver without immediately moving brigades.",
      externalAudience: "Allies will hear coherence, but domestic audiences may hear commitment before the headquarters has banked the means to carry it.",
      burdenReality: "Plans, intelligence, and operations all end up paying for sloppy public language.",
      likelyBreak: "The first break is mismatch between visible signaling and actual theater depth.",
      nextMonthBill: `If the message gets ahead of the force, next month starts with alliance expectation above the current ${allianceAlignment} alignment base.`,
    };
  }

  if (option.tags.includes("training") || option.tags.includes("standardization") || option.tags.includes("simulation")) {
    return {
      subject,
      hiddenRisk: "The headquarters may count certification gains before the force has actually absorbed the change.",
      operationalPayoff: "Training-heavy months are the cleanest way to build readiness that still exists next quarter.",
      externalAudience: "The outside audience sees less glamour now, but the force becomes more usable later.",
      burdenReality: "Instructors, repetitions, and protected calendar time matter more than rhetoric.",
      likelyBreak: "The first break is paper readiness outrunning repeated performance.",
      nextMonthBill: "If the repetitions do not happen, next month inherits the same force with only better slides.",
    };
  }

  if (option.tags.includes("repair") || option.tags.includes("lift") || option.tags.includes("fuel") || option.tags.includes("munitions")) {
    return {
      subject,
      hiddenRisk: "Support capacity can look adequate until a single movement or repair bottleneck suddenly dominates the month.",
      operationalPayoff: "Support-first decisions make every later option more real, even when they do not look dramatic today.",
      externalAudience: "The benefit is mostly invisible until the theater tries to move fast and discovers it still can.",
      burdenReality: `Depot backlog and market friction are the truth underneath the packet; backlog is already ${depotBacklog}.`,
      likelyBreak: "The first break is a promise that reaches the field faster than the support tail behind it.",
      nextMonthBill: "If sustainment is hollowed out now, next month’s choices all become narrower whether the room admits it or not.",
    };
  }

  if (option.tags.includes("modernization") || option.tags.includes("program") || option.tags.includes("fires")) {
    return {
      subject,
      hiddenRisk: "Program momentum can create the appearance of advantage before fielding and absorption are real.",
      operationalPayoff: "Used carefully, the packet can open genuine future advantage instead of buying another month of maintenance.",
      externalAudience: "Cabinet hears future prevention; the force hears another thing it must absorb while still covering today.",
      burdenReality: "Plans can move the paperwork faster than operations, training, and sustainment can make the capability credible.",
      likelyBreak: "The first break is the headquarters claiming progress at the concept stage like it already changed the field.",
      nextMonthBill: "If modernization outruns absorption, next month begins with scrutiny and a force that still cannot use what was announced.",
    };
  }

  return {
    subject,
    hiddenRisk: "The packet becomes dangerous when the room treats this month like it exists in isolation.",
    operationalPayoff: "Done well, the packet buys a month of usable breathing room rather than decorative motion.",
    externalAudience: "Different audiences will project different meanings onto the same move unless the room keeps the line tight.",
    burdenReality: `Reserve strain is ${reserveStrain}, and every office is tempted to assume someone else will absorb the second-order cost.`,
    likelyBreak: "The first break is usually in the hidden assumptions, not the headline intent.",
    nextMonthBill: "If this packet drifts, next month inherits a weaker base and a louder room.",
  };
}

function conversationBranch(choiceTrail: string[]) {
  const first = choiceTrail[0] ?? "";
  if (first.includes("alignment")) return "alignment";
  if (first.includes("conditions")) return "conditions";
  if (first.includes("politics")) return "politics";
  if (first.includes("topic")) return "topic";
  if (first.includes("effect")) return "effect";
  return "challenge";
}

function stageIntro(
  chief: ChiefArchetype,
  memo: DecisionMemo,
  option: MemoOption,
  position: ChiefPositionEntry,
  state: CampaignState,
) {
  const seed = conversationSeed(state, chief.id, memo.id, option.id, "opening");
  const voice = chiefVoice(chief);
  const topic = conversationTopicProfile(memo, option, state);
  const trust = state.chiefTrust[chief.id] ?? 50;
  const relationship = relationshipLine(chief, state);
  const positionLine =
    position.position === "support"
      ? `${chief.title} thinks ${option.label.toLowerCase()} is workable if the room stays disciplined.`
      : position.position === "accept_risk"
        ? `${chief.title} can live with ${option.label.toLowerCase()}, but only as a managed risk.`
        : position.position === "request_conditions"
          ? `${chief.title} is not rejecting ${option.label.toLowerCase()}, but refuses to let the room wave away the conditions.`
          : `${chief.title} thinks ${option.label.toLowerCase()} is leaning into ${directorateRedLine(chief)}.`;

  return [
    { speaker: chief.name, role: "advisor" as const, text: `${pick(voice.opener, seed)} ${positionLine}` },
    { speaker: chief.name, role: "advisor" as const, text: `${position.institutionalReason} ${topic.hiddenRisk}` },
    { speaker: chief.name, role: "advisor" as const, text: position.staffReadoutEvidence.rationale },
    ...(relationship ? [{ speaker: chief.name, role: "advisor" as const, text: relationship }] : []),
    ...(position.agendaMemoryNote ? [{ speaker: chief.name, role: "advisor" as const, text: position.agendaMemoryNote }] : []),
    { speaker: chief.name, role: "advisor" as const, text: `${statePressureLine(chief, state)} ${optionBurdenLine(chief, option)}` },
    { speaker: chief.name, role: "advisor" as const, text: `${trustColorText(trust)} ${topic.operationalPayoff}` },
  ];
}

function stageSynopsis(memo: DecisionMemo, option: MemoOption, position: ChiefPositionEntry) {
  return `Discussion of ${option.label.toLowerCase()} under ${memo.title.toLowerCase()}. ${capitalize(position.position.replace("_", " "))} from the chief.`;
}

function openingChoices(
  chief: ChiefArchetype,
  memo: DecisionMemo,
  option: MemoOption,
  position: ChiefPositionEntry,
  state: CampaignState,
): ChiefConversationChoice[] {
  const topic = conversationTopicProfile(memo, option, state);
  const voice = chiefVoice(chief);

  return [
    {
      id: "opening-blunt",
      label: "Ask for the blunt version",
      summary: "Strip away the polite staff language and ask what truly worries this office.",
      commanderLine: `Give me the blunt read on ${option.label.toLowerCase()}. What is this packet hiding from the room?`,
      chiefReply: `${pick(voice.skeptical, conversationSeed(state, chief.id, memo.id, option.id, "opening", "blunt"))} ${topic.nextMonthBill}`,
      trustDelta: 2,
      nextStage: "diagnosis",
    },
    {
      id: "opening-conditions",
      label: "Pin down the conditions",
      summary: "Narrow the discussion to the minimum conditions that keep the chief inside the packet.",
      commanderLine: `Then put the conditions on the table. What has to stay true before you will carry this cleanly?`,
      chiefReply: `The minimum line is this: ${position.requiredCondition}. If the room breaks that line, I stop calling the packet sound.`,
      trustDelta: 1,
      nextStage: "diagnosis",
    },
    {
      id: "opening-topic",
      label: "Probe the hidden hinge",
      summary: `Drive into the real hinge inside ${topic.subject} instead of staying at the packet headline.`,
      commanderLine: `All right. Where is the hidden hinge in ${topic.subject}? What looks manageable on paper but fails first in reality?`,
      chiefReply: `${topic.likelyBreak} ${optionBurdenLine(chief, option)}`,
      trustDelta: 1,
      nextStage: "diagnosis",
    },
    {
      id: "opening-politics",
      label: "Ask how it reads outside the room",
      summary: "Force the chief to translate the packet into cabinet, ally, and press consequences.",
      commanderLine: `Leave your shop for a moment. How does this actually read once cabinet, allies, and the press touch it?`,
      chiefReply: `${topic.externalAudience} ${position.position === "oppose" ? "That is why I am pushing back." : "That is where discipline matters most."}`,
      trustDelta: chief.directorate === "plans" || chief.directorate === "intelligence" ? 2 : 1,
      nextStage: "diagnosis",
    },
    {
      id: "opening-alignment",
      label: "Bring the chief inside your intent",
      summary: "Signal that you want a working channel, not just a formal objection or endorsement.",
      commanderLine: `I am not looking to roll your office. Tell me how you want the room to carry this if I decide to move.`,
      chiefReply: `${pick(voice.cooperative, conversationSeed(state, chief.id, memo.id, option.id, "opening", "alignment"))} Keep the room centered on ${directorateFocus(chief)} and out of ${directorateRedLine(chief)}.`,
      trustDelta: 2,
      nextStage: "diagnosis",
    },
    {
      id: "opening-effect",
      label: "Demand a sharper effect",
      summary: "Push the chief to identify the hardest-edged version they would still call honest.",
      commanderLine: `I hear the caution, but caution alone does not buy me a month. Where is the sharper effect that still stays honest?`,
      chiefReply: chief.riskTolerance >= 0.58
        ? `${pick(voice.confrontational, conversationSeed(state, chief.id, memo.id, option.id, "opening", "effect"))} There is sharper effect available, but it spends slack the headquarters does not easily replace.`
        : `There is no honest sharper version that does not degrade ${directorateFocus(chief)} faster than the room is admitting.`,
      trustDelta: chief.riskTolerance >= 0.58 ? 0 : -2,
      nextStage: "diagnosis",
    },
  ];
}

function diagnosisChoices(
  chief: ChiefArchetype,
  memo: DecisionMemo,
  option: MemoOption,
  position: ChiefPositionEntry,
  state: CampaignState,
  choiceTrail: string[],
): ChiefConversationChoice[] {
  const topic = conversationTopicProfile(memo, option, state);
  const branch = conversationBranch(choiceTrail);
  const burden = option.burden.map((entry) => `${directorateLabel(entry.directorate)} ${entry.points}`).join(", ");

  const branchChoice: ChiefConversationChoice =
    branch === "alignment"
      ? {
          id: "diagnosis-alignment",
          label: "Ask what support the chief needs from you",
          summary: "Turn alignment into specifics and ask what the office needs from the commander to carry the month.",
          commanderLine: `If I move, what do you need from me so your office carries the month instead of just surviving it?`,
          chiefReply: `I need the room to stop freelancing after the packet is signed. Protect ${position.requiredCondition}, and when the month starts drifting, say so early instead of leaving my office to absorb it alone.`,
          trustDelta: 2,
          nextStage: "bargaining",
        }
      : branch === "conditions"
        ? {
            id: "diagnosis-conditions",
            label: "Test which condition breaks first",
            summary: "Push on the chief’s own condition set and find the first real breaking point.",
            commanderLine: `Which of your conditions is most likely to break first once the room gets busy?`,
            chiefReply: `${topic.likelyBreak} That is usually where a bounded packet becomes a dishonest one.`,
            trustDelta: 1,
            nextStage: "bargaining",
          }
        : branch === "politics"
          ? {
              id: "diagnosis-politics",
              label: "Ask which audience bites first",
              summary: "Force a call on whether cabinet, allies, media, or the force itself reacts badly first.",
              commanderLine: `Who bites first if this goes wrong: cabinet, allies, the press, or the force?`,
              chiefReply: `${topic.externalAudience} The first audience to notice is usually the one we were least honest with.`,
              trustDelta: 1,
              nextStage: "bargaining",
            }
          : branch === "topic"
            ? {
                id: "diagnosis-topic",
                label: `Drive deeper into ${topic.subject}`,
                summary: `Make the chief stay on the real mechanics beneath ${topic.subject}.`,
                commanderLine: `Stay on ${topic.subject}. What exactly is the room underestimating?`,
                chiefReply: `${topic.burdenReality} The room keeps treating that as support detail when it is actually decision-level reality.`,
                trustDelta: 1,
                nextStage: "bargaining",
              }
            : {
                id: "diagnosis-effect",
                label: "Force a trade between speed and honesty",
                summary: "Ask whether the sharper effect is worth the hidden bill it creates.",
                commanderLine: `If I want more visible effect, what truth am I paying with to buy it?`,
                chiefReply: `${topic.hiddenRisk} The faster the visible effect, the more the room is tempted to pretend the hidden bill will pay itself.`,
                trustDelta: chief.riskTolerance >= 0.58 ? 0 : -1,
                nextStage: "bargaining",
              };

  return [
    {
      id: "diagnosis-assumptions",
      label: "Interrogate the assumptions",
      summary: "Press the chief on the assumptions beneath the packet instead of the headline recommendation.",
      commanderLine: `Which assumption breaks first if this month goes wrong? I want the hidden hinge, not the obvious one.`,
      chiefReply: state.strategic.intelligence.confidence < 55
        ? "The hidden hinge is still confidence in the picture itself. The room is close to confusing activity with certainty."
        : "The first break is usually not the visible one. It is that the staff starts assuming the packet can absorb one more demand because the first demand looked manageable.",
      trustDelta: 1,
      nextStage: "bargaining",
    },
    {
      id: "diagnosis-burden",
      label: "Trade burden across the staff",
      summary: "Ask who should carry more of the month if this chief is going to carry less.",
      commanderLine: `If I protect your red line, whose shop picks up the pain instead? The room does not get a free veto.`,
      chiefReply: `Then be honest about the burden. Right now this packet is already pulling ${burden}. If you shift more weight, do it openly and stop pretending the headquarters can do everything at once.`,
      trustDelta: 0,
      nextStage: "bargaining",
    },
    branchChoice,
    {
      id: "diagnosis-red-line",
      label: "Ask what the chief refuses to let the room blur",
      summary: "Make the chief define the one line they will keep defending even under pressure.",
      commanderLine: `What is the one line you will not let this room blur if I choose this packet?`,
      chiefReply: `I will keep coming back to ${directorateRedLine(chief)}. Once the room stops naming that risk aloud, the month has already started lying to itself.`,
      trustDelta: 1,
      nextStage: "bargaining",
    },
  ];
}

function bargainingChoices(
  chief: ChiefArchetype,
  memo: DecisionMemo,
  option: MemoOption,
  position: ChiefPositionEntry,
  state: CampaignState,
  choiceTrail: string[],
): ChiefConversationChoice[] {
  const topic = conversationTopicProfile(memo, option, state);
  const branch = conversationBranch(choiceTrail);
  const voice = chiefVoice(chief);

  return [
    {
      id: "bargaining-bounded",
      label: "Build a bounded version",
      summary: "Tell the chief you will move, but only inside a hard boundary the room cannot blur.",
      commanderLine: `All right. Build me the bounded version. What is the narrowest honest order that still gets me effect?`,
      chiefReply: `${pick(voice.cooperative, conversationSeed(state, chief.id, memo.id, option.id, "bargaining", "bounded"))} Keep it inside ${position.requiredCondition}, and the month stays intelligible.`,
      trustDelta: 2,
      nextStage: "closing",
    },
    {
      id: "bargaining-phase",
      label: "Phase the move",
      summary: "Stage the packet so the headquarters buys effect in steps instead of all at once.",
      commanderLine: `Could this be phased? I want the first step now and the rest only if the month still supports it.`,
      chiefReply: `Yes, if the room accepts that the first phase is mostly about protecting ${topic.subject} and not pretending the whole effect has already arrived.`,
      trustDelta: 1,
      nextStage: "closing",
    },
    {
      id: "bargaining-shift",
      label: "Shift the burden openly",
      summary: "Admit that one office must carry more and ask where the weight should sit.",
      commanderLine: `If I spend burden somewhere, I would rather spend it consciously. Where do you want the weight carried?`,
      chiefReply: `${topic.burdenReality} If you shift it, do it openly and write it into the guidance instead of hiding it in execution.`,
      trustDelta: 0,
      nextStage: "closing",
    },
    branch === "politics"
      ? {
          id: "bargaining-cover",
          label: "Buy political cover first",
          summary: "Tell the chief you are willing to narrow military effect if it protects cabinet and alliance room.",
          commanderLine: `Then I may buy less field effect and more political room. What line keeps cabinet and allies with us?`,
          chiefReply: "Keep the message narrower than the temptation. If the room stays coherent, I can preserve more room for the next decision than a louder packet would.",
          trustDelta: 2,
          nextStage: "closing",
        }
      : {
          id: "bargaining-risk",
          label: "Carry visible risk instead of hidden drift",
          summary: "Tell the chief you are willing to accept a visible, named risk if it buys decisive time.",
          commanderLine: `I would rather accept visible risk than hidden drift. If I do that, where should the risk sit?`,
          chiefReply: chief.riskTolerance >= 0.58
            ? `Then keep the risk where the room can still see it and govern it. Do not bury it in ${directorateFocus(chief)}.`
            : `${pick(voice.skeptical, conversationSeed(state, chief.id, memo.id, option.id, "bargaining", "risk"))} If you choose visible risk, keep it bounded and named.`,
          trustDelta: chief.riskTolerance >= 0.58 ? 1 : -1,
          nextStage: "closing",
        },
    {
      id: "bargaining-reframe",
      label: "Reframe the packet around the red line",
      summary: "Ask the chief to rewrite the month around what absolutely cannot be broken.",
      commanderLine: `Strip this back to the red line. If I rebuilt the packet around what must not break, what remains?`,
      chiefReply: `What remains is smaller, but it is honest. Protect ${directorateRedLine(chief)}, and the room still has a usable month after this one.`,
      trustDelta: 1,
      nextStage: "closing",
    },
  ];
}

function closingChoices(
  chief: ChiefArchetype,
  memo: DecisionMemo,
  option: MemoOption,
  position: ChiefPositionEntry,
  state: CampaignState,
): ChiefConversationChoice[] {
  const voice = chiefVoice(chief);
  return [
    {
      id: "closing-bounded-order",
      label: "Issue a bounded order",
      summary: "Move ahead, but explicitly cap the packet with the chief’s conditions.",
      commanderLine: `Fine. We move, but inside your conditions. I want the packet carried without pretending it is broader than it is.`,
      chiefReply: `${pick(voice.closer, conversationSeed(state, chief.id, memo.id, option.id, "closing", "bounded-order"))} If the room keeps the order bounded, I can keep my office aligned behind it.`,
      trustDelta: 2,
      nextStage: "completed",
    },
    {
      id: "closing-dissent-on-record",
      label: "Proceed with dissent on record",
      summary: "Advance the packet while formally acknowledging the chief’s reservations.",
      commanderLine: `I may still move, but your dissent stays on the record. I want no one later claiming the warning was never given.`,
      chiefReply: "That is at least honest. If we are carrying risk, the room should carry it consciously.",
      trustDelta: 1,
      nextStage: "completed",
    },
    {
      id: "closing-override",
      label: "Override the objection",
      summary: "Push through the chief’s concerns and accept the relationship cost.",
      commanderLine: `I have heard the warning. I am still directing the packet to move. Make it work.`,
      chiefReply: chief.riskTolerance >= 0.62
        ? "Understood. I will execute, but the room is now spending coherence as a deliberate choice."
        : "I will comply, but you should assume I no longer think this month is balanced.",
      trustDelta: chief.riskTolerance >= 0.62 && position.position !== "oppose" ? -1 : -3,
      nextStage: "completed",
    },
    {
      id: "closing-reframe",
      label: "Return for a tighter packet",
      summary: "Pause and ask the chief to come back with a narrower, cleaner version.",
      commanderLine: `Not like this. Tighten the packet, strip the drift out of it, and bring me back a cleaner version.`,
      chiefReply: "That buys coherence, not momentum. If you want a cleaner month, this is the honest way to get it.",
      trustDelta: 1,
      nextStage: "completed",
    },
    {
      id: "closing-defer",
      label: "Defer and preserve the month",
      summary: "Let this packet slip rather than spending more coherence on it right now.",
      commanderLine: `We are not carrying this cleanly enough today. We defer and preserve room for the rest of the month.`,
      chiefReply: "That costs momentum, but it preserves credibility. Sometimes that is the cleaner command decision.",
      trustDelta: chief.directorate === "plans" || chief.directorate === "intelligence" ? 2 : 1,
      nextStage: "completed",
    },
  ];
}

function stageBridgeLine(
  chief: ChiefArchetype,
  memo: DecisionMemo,
  option: MemoOption,
  state: CampaignState,
  choiceTrail: string[],
  nextStage: ChiefConversationStage,
) {
  const topic = conversationTopicProfile(memo, option, state);
  const branch = conversationBranch(choiceTrail);
  const seed = conversationSeed(state, chief.id, memo.id, option.id, nextStage, choiceTrail.join("|"));

  if (nextStage === "diagnosis") {
    if (branch === "alignment") {
      return pick(
        [
          `Good. Then help me keep the room aligned. Where does this packet start drifting if I do not police it myself?`,
          `All right. If you are in the frame, show me where the frame breaks first.`,
        ],
        seed,
      );
    }

    if (branch === "politics") {
      return pick(
        [
          `Fine. Stay on the audience problem. Where does the message detach from the force first?`,
          `Good. Take me from optics to mechanics. What has to stay true for the signal not to become fiction?`,
        ],
        seed,
      );
    }

    return pick(
      [
        `Take me one level deeper. What is the room still not admitting about ${topic.subject}?`,
        `Good. Now leave the headline and show me the mechanism. Where does ${topic.subject} actually bite this month?`,
        `All right. The room has heard the surface argument. I want the part underneath it now.`,
      ],
      seed,
    );
  }

  if (nextStage === "bargaining") {
    return pick(
      [
        `Understood. We are past diagnosis. Tell me what order keeps this month honest once the room starts leaning on it.`,
        `Fine. Then we are at the bargaining edge. What version of this can the headquarters actually carry?`,
        `All right. Stop describing the problem and help me write the order.`,
      ],
      seed,
    );
  }

  if (nextStage === "closing") {
    return pick(
      [
        `Then we are at decision. Give me the cleanest close: what wording keeps this order honest once it leaves the room?`,
        `All right. Last turn. How do I close this discussion without borrowing a worse month behind it?`,
        `We are at the command edge now. Tell me the final shape of the order you can live with.`,
      ],
      seed,
    );
  }

  return "";
}

export function buildChiefConversationChoices(
  chief: ChiefArchetype,
  memo: DecisionMemo,
  option: MemoOption,
  position: ChiefPositionEntry,
  stage: ChiefConversationStage,
  state: CampaignState,
  choiceTrail: string[] = [],
): ChiefConversationChoice[] {
  if (stage === "opening") return openingChoices(chief, memo, option, position, state);
  if (stage === "diagnosis") return diagnosisChoices(chief, memo, option, position, state, choiceTrail);
  if (stage === "bargaining") return bargainingChoices(chief, memo, option, position, state, choiceTrail);
  if (stage === "closing") return closingChoices(chief, memo, option, position, state);
  return [];
}

export function startChiefConversation(
  chief: ChiefArchetype,
  memo: DecisionMemo,
  option: MemoOption,
  position: ChiefPositionEntry,
  state: CampaignState,
): ChiefConversationRecord {
  const trustBefore = state.chiefTrust[chief.id] ?? 50;
  return {
    id: `${state.turn}:${chief.id}:${memo.id}:${option.id}`,
    turn: state.turn,
    chiefId: chief.id,
    chiefName: chief.name,
    memoId: memo.id,
    memoTitle: memo.title,
    optionId: option.id,
    optionLabel: option.label,
    stage: "opening",
    status: "active",
    title: `${directorateLabel(chief.directorate)} channel`,
    synopsis: stageSynopsis(memo, option, position),
    position: position.position,
    institutionalReason: position.institutionalReason,
    requiredCondition: position.requiredCondition,
    confidenceNote: position.confidenceNote,
    consequenceIfIgnored: position.consequenceIfIgnored,
    agendaMemoryNote: position.agendaMemoryNote,
    staffReadoutEvidence: position.staffReadoutEvidence,
    transcript: stageIntro(chief, memo, option, position, state),
    choices: buildChiefConversationChoices(chief, memo, option, position, "opening", state, []),
    choiceTrail: [],
    trustBefore,
    trustAfter: trustBefore,
    totalTrustDelta: 0,
  };
}

export function continueChiefConversation(
  record: ChiefConversationRecord,
  chief: ChiefArchetype,
  memo: DecisionMemo,
  option: MemoOption,
  state: CampaignState,
  responseId: string,
): ChiefConversationRecord {
  const response = record.choices.find((entry) => entry.id === responseId);
  if (!response) throw new Error("The selected response is not valid for the current conversation stage.");

  const trustAfter = clamp(record.trustAfter + response.trustDelta, 0, 100);
  const nextStage = response.nextStage;
  const nextChoiceTrail = [...record.choiceTrail, response.id];
  const positionSnapshot: ChiefPositionEntry = {
    chiefId: record.chiefId,
    chiefName: record.chiefName,
    directorate: chief.directorate,
    memoId: record.memoId,
    optionId: record.optionId,
    position: record.position,
    institutionalReason: record.institutionalReason,
    requiredCondition: record.requiredCondition,
    confidenceNote: record.confidenceNote,
    consequenceIfIgnored: record.consequenceIfIgnored,
    agendaMemoryNote: record.agendaMemoryNote,
    staffReadoutEvidence: record.staffReadoutEvidence,
  };

  const nextState = {
    ...state,
    chiefTrust: {
      ...state.chiefTrust,
      [chief.id]: trustAfter,
    },
  };

  const nextChoices = nextStage === "completed"
    ? []
    : buildChiefConversationChoices(chief, memo, option, positionSnapshot, nextStage, nextState, nextChoiceTrail);

  const followUp = stageBridgeLine(chief, memo, option, nextState, nextChoiceTrail, nextStage);

  const nextTranscript = [
    ...record.transcript,
    { speaker: "Commander", role: "commander" as const, text: response.commanderLine },
    { speaker: chief.name, role: "advisor" as const, text: response.chiefReply },
    ...(nextStage === "completed" ? [] : [{ speaker: "Commander", role: "commander" as const, text: followUp }]),
  ];

  return {
    ...record,
    stage: nextStage,
    status: nextStage === "completed" ? "completed" : "active",
    transcript: nextTranscript,
    choices: nextChoices,
    choiceTrail: nextChoiceTrail,
    trustAfter,
    totalTrustDelta: record.totalTrustDelta + response.trustDelta,
  };
}

export function summarizeState(state: CampaignState) {
  return `Standing at month ${state.turn}: ${state.strategic.forceGeneration.deployableUnits.toFixed(1)} brigades deployable, alliance alignment ${state.strategic.alliance.politicalAlignment.toFixed(0)}, cabinet cover ${state.strategic.domestic.cabinetCover.toFixed(0)}, incident ladder ${state.strategic.escalation.incidentLadder.toFixed(0)}.`;
}

export function portraitTrimColor(directorate: DirectorateId) {
  switch (directorate) {
    case "people":
      return "#8fcf88";
    case "intelligence":
      return "#78c4d4";
    case "operations":
      return "#e2b36c";
    case "sustainment":
      return "#d68d77";
    case "plans":
      return "#8ea4d6";
    case "training":
      return "#79c6ae";
  }
}

function createAdvisorPortrait(chief: ChiefArchetype, rng: () => number): AdvisorPortraitSpec {
  const skinTones = chief.genderPresentation === "female"
    ? ["#f0d2ba", "#ddb395", "#c28b6b", "#8d5a42", "#5f3b2d"]
    : ["#efd1b7", "#d5aa8c", "#b88566", "#84523b", "#58382b"];
  const hairColors = ["#181513", "#2d211d", "#47342d", "#6f5a48", "#c9d7df"];
  const eyeColors = ["#202b36", "#324b5f", "#5a4438", "#607861"];
  const uniformColors = ["#2e3736", "#324040", "#3b4047", "#394045"];
  const backgroundColors = ["#142129", "#1a2722", "#221d19", "#161f2e", "#14221e"];
  const panelColors = ["#22313b", "#223a35", "#3a2f2a", "#233244", "#244239"];
  const femaleStyles: AdvisorPortraitSpec["hairStyle"][] = ["bun", "bob", "tied-back"];
  const maleStyles: AdvisorPortraitSpec["hairStyle"][] = ["side-part", "crew", "crop"];

  return {
    genderPresentation: chief.genderPresentation,
    skinTone: sample(skinTones, rng),
    hairColor: sample(hairColors, rng),
    eyeColor: sample(eyeColors, rng),
    uniformColor: sample(uniformColors, rng),
    trimColor: portraitTrimColor(chief.directorate),
    backgroundColor: sample(backgroundColors, rng),
    panelColor: sample(panelColors, rng),
    faceShape: sample(["oval", "square", "round"], rng),
    hairStyle: sample(chief.genderPresentation === "female" ? femaleStyles : maleStyles, rng),
    accessory: sample(["none", "glasses", "earpiece"], rng),
    browTilt: Number((rng() * 1.4 - 0.7).toFixed(2)),
    mouthCurve: Number((rng() * 1.2 - 0.35).toFixed(2)),
  };
}

export function generateAdvisorRoster(chiefs: ChiefArchetype[], seedSource: string) {
  return chiefs.map((chief) => {
    const rng = createSeededRng(hashString(chiefSpriteDeterministicSeed(seedSource, chief.id)));
    return {
      chiefId: chief.id,
      displayName: chief.name,
      title: chief.title,
      directorate: chief.directorate,
      genderPresentation: chief.genderPresentation,
      portrait: createAdvisorPortrait(chief, rng),
    };
  });
}

export function roleForChiefDirectorate(directorate: DirectorateId): SpriteRole {
  switch (directorate) {
    case "people": return "S1";
    case "intelligence": return "S2";
    case "operations": return "S3";
    case "sustainment": return "S4";
    case "plans": return "S5";
    case "training": return "training";
  }
}

export function chiefSpriteDeterministicSeed(sessionSeed: string, chiefId: string): string {
  if (sessionSeed.length === 0) throw new Error("sessionSeed must not be empty");
  if (chiefId.length === 0) throw new Error("chiefId must not be empty");
  return "brass-ledger:sprite:v1" + `|session=${JSON.stringify(sessionSeed)}` + "|subjectType=chief" + `|subjectId=${JSON.stringify(chiefId)}`;
}

function canonicalEffects(role: SpriteRole, state: ChiefSpriteVariantState): SpriteVariantEffect[] {
  const effects: SpriteVariantEffect[] = [];
  effects.push(state.trustBand === "strained" ? "trust-low"
    : state.trustBand === "solid" ? "trust-high" : undefined!);
  effects.push(state.burdenLevel === "overloaded" ? "directorate-overloaded"
    : state.burdenLevel === "strained" ? "directorate-strained" : undefined!);
  effects.push(state.campaignStatus === "won" ? "campaign-won"
    : state.campaignStatus === "lost" ? "campaign-lost" : undefined!);
  if (role === "S2" && state.s2ExternalEstimateConfidence <= 42) effects.push("s2-low-confidence");
  if (role === "S4" && state.s4SupportableTempo < 15) effects.push("s4-bottleneck");
  return effects.filter((effect): effect is SpriteVariantEffect => effect !== undefined);
}

/**
 * The ONLY state→effect policy for chief sprites (Sprite 3, issue #52). Pure and
 * deterministic: consumes raw shared-domain state, never CSS/browser state, never content.
 * Returns the final expression plus the strict renderer controls. Expression precedence,
 * highest first: won→resolved, lost→severe, overloaded→strained, trust strained→skeptical,
 * burden strained→strained, trust solid→calm (NEW in #52), else authored baseExpression.
 * Non-expression effects compose independently: trust posture, overload darkening,
 * loss desaturation, S2 tight framing, S4 utility detail.
 */
export function buildChiefSpriteVariant(
  baseExpression: SpriteExpression,
  role: SpriteRole,
  state: ChiefSpriteVariantState,
): DerivedChiefSpriteVariant {
  const expression: SpriteExpression =
    state.campaignStatus === "won" ? "resolved" :
    state.campaignStatus === "lost" ? "severe" :
    state.burdenLevel === "overloaded" ? "strained" :
    state.trustBand === "strained" ? "skeptical" :
    state.burdenLevel === "strained" ? "strained" :
    state.trustBand === "solid" ? "calm" :
    baseExpression;

  const trustLow = state.trustBand === "strained";
  const trustHigh = state.trustBand === "solid";
  const overloaded = state.burdenLevel === "overloaded";
  const lost = state.campaignStatus === "lost";
  const s2Low = role === "S2" && state.s2ExternalEstimateConfidence <= 42;
  const s4Blocked = role === "S4" && state.s4SupportableTempo < 15;

  return {
    expression,
    variant: spriteRenderVariantSchema.parse({
      effects: canonicalEffects(role, state),
      posture: trustLow ? "closed" : trustHigh ? "open" : "neutral",
      backgroundDarkenOpacity: overloaded ? 0.22 : 0,
      saturation: lost ? 0.45 : 1,
      framing: s2Low ? "tight" : "default",
      supportDetail: s4Blocked ? "utility-harness" : "none",
    }),
  };
}

export function buildChiefSpriteSpec(input: ChiefSpriteSpecInput): SpriteSpec {
  const variantState = chiefSpriteVariantStateSchema.parse(input.variantState);
  const role = roleForChiefDirectorate(input.chief.directorate);
  const visual = input.visualLanguage[role];
  const derived = buildChiefSpriteVariant(visual.baseExpression, role, variantState);
  const source: SpritePromptSource = {
    role,
    displayName: input.chief.name,
    temperament: input.chief.temperament,
    expression: derived.expression,
  };
  const { prompt, negativePrompt } = buildSpritePromptText(source);
  return spriteSpecSchema.parse({
    ...input.portrait,
    id: `chief:${input.chief.id}`, subjectType: "chief", ...source,
    silhouette: visual.shapeLanguage,
    palette: [input.portrait.skinTone, input.portrait.hairColor, input.portrait.eyeColor, input.portrait.uniformColor, input.portrait.trimColor, input.portrait.backgroundColor, input.portrait.panelColor],
    uniform: visual.uniformLanguage,
    trustBand: variantState.trustBand, prompt, negativePrompt,
    deterministicSeed: chiefSpriteDeterministicSeed(input.sessionSeed, input.chief.id),
    variant: derived.variant,
  });
}

/**
 * Sprite 4 (issue #82): coherent 24×28 pixel-art portraits at 48×56.
 *
 * This is the pixel-art grammar from the reviewed v2 architecture
 * (/tmp/pixel-renderer-architecture-v2.md): a deterministic 24×28 semantic grid,
 * hand-authored template library, region-owned effects, and run-grouped crispEdges
 * SVG. It replaces the Sprite 1-3 vector geometry while KEEPING the public names
 * `buildAdvisorPortraitSvg` / `buildAdvisorPortraitDataUri` and their exact
 * signatures, so every consumer (headless, web ChiefPortrait, CLI, server) compiles
 * unchanged (v2 Changes #7 — no dual API, no buildPixelPortrait* exports). The
 * pixel matrix is output-only derived data and never enters saves.
 *
 * COLOR AUTHORITY (v2 Changes #3/#4): the SEVEN NAMED portrait fields on SpriteSpec
 * (skinTone, hairColor, eyeColor, uniformColor, trimColor, backgroundColor,
 * panelColor) are the only color sources. `sprite.palette` is intentionally IGNORED
 * for rendering because spriteSpecSchema only checks it as a non-empty string array
 * — it cannot enforce length or correspondence with the named fields — so a
 * schema-valid hand-built SpriteSpec could disagree with its own named colors.
 * Rendering from the named fields keeps every tone traceable and the identity
 * contract exact. The canonical builder mirrors the seven fields into `palette` in
 * order, but the renderer never trusts that array.
 */
export const SPRITE_PIXEL_WIDTH = 24 as const;
export const SPRITE_PIXEL_HEIGHT = 28 as const;

/** The 20 deterministic base semantic tone slots (v2 §3.3). Region-gated effect
 * transforms (loadTint/desat45) can produce RGB values beyond these slots; those
 * values still derive solely from the seven named portrait colors. */
export const SPRITE_PIXEL_PALETTE = {
  BG_BASE: 0, BG_SHADOW: 1, BG_HIGHLIGHT: 2,
  PANEL_BASE: 3, PANEL_SHADOW: 4, PANEL_HIGHLIGHT: 5,
  SKIN_BASE: 6, SKIN_SHADOW: 7, SKIN_HIGHLIGHT: 8,
  HAIR_BASE: 9, HAIR_SHADOW: 10, HAIR_HIGHLIGHT: 11,
  EYE_BASE: 12,
  UNIFORM_BASE: 13, UNIFORM_SHADOW: 14, UNIFORM_HIGHLIGHT: 15,
  TRIM_BASE: 16, TRIM_SHADOW: 17, TRIM_HIGHLIGHT: 18,
  OUTLINE: 19,
} as const;

export type SpritePixelPaletteIndex =
  (typeof SPRITE_PIXEL_PALETTE)[keyof typeof SPRITE_PIXEL_PALETTE];

export type SpritePixelRegion =
  | "backdrop" | "head" | "skin" | "hair" | "face-feature"
  | "neckline" | "shoulder" | "torso" | "accessory" | "support";

export type SpritePixelSlot =
  | "identity" | "expression" | "posture" | "support";

export type SpriteSemanticPixel = Readonly<{
  basePaletteIndex: SpritePixelPaletteIndex;
  region: SpritePixelRegion;
  slot: SpritePixelSlot;
  protected: boolean;
}>;

export type SpriteHexColor = `#${string}`;

export type SpritePortraitColorSources = readonly [
  skinTone: SpriteHexColor,
  hairColor: SpriteHexColor,
  eyeColor: SpriteHexColor,
  uniformColor: SpriteHexColor,
  trimColor: SpriteHexColor,
  backgroundColor: SpriteHexColor,
  panelColor: SpriteHexColor,
];

export type SpriteResolvedPalette = readonly [
  bgBase: SpriteHexColor, bgShadow: SpriteHexColor, bgHighlight: SpriteHexColor,
  panelBase: SpriteHexColor, panelShadow: SpriteHexColor, panelHighlight: SpriteHexColor,
  skinBase: SpriteHexColor, skinShadow: SpriteHexColor, skinHighlight: SpriteHexColor,
  hairBase: SpriteHexColor, hairShadow: SpriteHexColor, hairHighlight: SpriteHexColor,
  eyeBase: SpriteHexColor,
  uniformBase: SpriteHexColor, uniformShadow: SpriteHexColor, uniformHighlight: SpriteHexColor,
  trimBase: SpriteHexColor, trimShadow: SpriteHexColor, trimHighlight: SpriteHexColor,
  outline: SpriteHexColor,
];

export type SpritePixelGrid<T> = Readonly<{
  width: typeof SPRITE_PIXEL_WIDTH;
  height: typeof SPRITE_PIXEL_HEIGHT;
  /** Row-major; asserted at runtime to have exactly 672 entries. */
  cells: readonly T[];
}>;

export type SpritePixelIdentity = Readonly<{
  /** From the seven named portrait fields; never from sprite.palette. */
  portraitColors: SpritePortraitColorSources;
  /** The 20 deterministic base tones before region-gated effect transforms. */
  palette: SpriteResolvedPalette;
  grid: SpritePixelGrid<SpriteSemanticPixel>;
}>;

export type SpritePixelRender = Readonly<{
  /** Complete state-invariant identity contract. */
  identity: SpritePixelIdentity;
  /** Composed pre-camera semantic source grid. */
  source: SpritePixelGrid<SpriteSemanticPixel>;
  /** Composed, color-transformed, pre-camera RGB diff surface. */
  sourceColors: SpritePixelGrid<SpriteHexColor>;
  /** Final post-transform/post-camera opaque RGB grid; future #53 input. */
  output: SpritePixelGrid<SpriteHexColor>;
}>;

export type SpritePixelRun = Readonly<{
  x: number;
  y: number;
  width: number;
  color: SpriteHexColor;
}>;

const SPRITE_PIXEL_CELL_COUNT = SPRITE_PIXEL_WIDTH * SPRITE_PIXEL_HEIGHT;

/** Parse only #RRGGBB (case-insensitive); serialize lowercase. The render boundary
 * fails clearly on unsupported color strings; the saved-session Zod schema is
 * intentionally not tightened in this slice. */
function parseSpriteHexColor(value: string): SpriteHexColor {
  const match = /^#([0-9a-fA-F]{6})$/.exec(value);
  if (!match) throw new Error(`Unsupported sprite color "${value}": expected #RRGGBB`);
  return `#${match[1]!.toLowerCase()}` as SpriteHexColor;
}

function rgbChannels(color: SpriteHexColor): readonly [number, number, number] {
  return [
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16),
  ];
}

function toSpriteHex(r: number, g: number, b: number): SpriteHexColor {
  const channel = (value: number) => Math.floor(value).toString(16).padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}` as SpriteHexColor;
}

/** shadow(c) = floor(3*c/4): 75% of base. */
export function spriteShadowTone(color: SpriteHexColor): SpriteHexColor {
  const [r, g, b] = rgbChannels(color);
  return toSpriteHex(Math.floor((3 * r) / 4), Math.floor((3 * g) / 4), Math.floor((3 * b) / 4));
}

/** highlight(c) = c + floor((255-c)/5): 20% toward white. */
export function spriteHighlightTone(color: SpriteHexColor): SpriteHexColor {
  const [r, g, b] = rgbChannels(color);
  return toSpriteHex(r + Math.floor((255 - r) / 5), g + Math.floor((255 - g) / 5), b + Math.floor((255 - b) / 5));
}

/** outline(c) = floor(9*c/20): 45% of panel color. */
export function spriteOutlineTone(color: SpriteHexColor): SpriteHexColor {
  const [r, g, b] = rgbChannels(color);
  return toSpriteHex(Math.floor((9 * r) / 20), Math.floor((9 * g) / 20), Math.floor((9 * b) / 20));
}

/** loadTint(c) = floor(78*c/100): exact 1 - 0.22 overload tint. */
export function spriteLoadTint(color: SpriteHexColor): SpriteHexColor {
  const [r, g, b] = rgbChannels(color);
  return toSpriteHex(Math.floor((78 * r) / 100), Math.floor((78 * g) / 100), Math.floor((78 * b) / 100));
}

/** luma(r,g,b) = floor((54r + 183g + 19b)/256): integer Rec.709 approximation. */
export function spriteLuma(color: SpriteHexColor): number {
  const [r, g, b] = rgbChannels(color);
  return Math.floor((54 * r + 183 * g + 19 * b) / 256);
}

/** desat45(c,Y) = floor((45c + 55Y)/100): exact saturation control 0.45. */
export function spriteDesaturate45(color: SpriteHexColor): SpriteHexColor {
  const [r, g, b] = rgbChannels(color);
  const y = spriteLuma(color);
  return toSpriteHex(Math.floor((45 * r + 55 * y) / 100), Math.floor((45 * g + 55 * y) / 100), Math.floor((45 * b + 55 * y) / 100));
}

/** The 20 deterministic base tones in SPRITE_PIXEL_PALETTE index order, derived
 * ONLY from the seven named portrait colors (v2 §3.3). */
export function resolveSpriteBasePalette(sources: SpritePortraitColorSources): SpriteResolvedPalette {
  const [skin, hair, eye, uniform, trim, background, panel] = sources;
  return [
    background,
    spriteShadowTone(background),
    spriteHighlightTone(background),
    panel,
    spriteShadowTone(panel),
    spriteHighlightTone(panel),
    skin,
    spriteShadowTone(skin),
    spriteHighlightTone(skin),
    hair,
    spriteShadowTone(hair),
    spriteHighlightTone(hair),
    eye,
    uniform,
    spriteShadowTone(uniform),
    spriteHighlightTone(uniform),
    trim,
    spriteShadowTone(trim),
    spriteHighlightTone(trim),
    spriteOutlineTone(panel),
  ];
}

/** Inclusive horizontal run [xStart, xEnd]. */
export type SpritePixelRowRun = readonly [xStart: number, xEnd: number];
export type SpritePixelPoint = readonly [x: number, y: number];

/** Frozen tuple builders keep the grammar tables immutable and exactly typed. */
function run(xStart: number, xEnd: number): SpritePixelRowRun {
  return Object.freeze([xStart, xEnd] as const);
}
function pt(x: number, y: number): SpritePixelPoint {
  return Object.freeze([x, y] as const);
}

/** Literal head maps: exactly 14 rows × 14 chars, y=4..17, x=5..18. `.` = leave
 * the underlying panel, `O` = universal outline, `s` = skin base before the fixed
 * shading pass (v2 §3.5). */
export const SPRITE_PIXEL_FACE = Object.freeze({
  oval: Object.freeze([
    "....OOOOOO....",
    "..OOssssssOO..",
    ".OssssssssssO.",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    ".OssssssssssO.",
    "..OssssssssO..",
    "...OssssssO...",
    "....OOssOO....",
  ]),
  square: Object.freeze([
    ".OOOOOOOOOOOO.",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "..OOssssssOO..",
  ]),
  round: Object.freeze([
    "....OOOOOO....",
    "..OOssssssOO..",
    ".OssssssssssO.",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    "OssssssssssssO",
    ".OssssssssssO.",
    "..OssssssssO..",
    "...OOssssOO...",
    ".....OOOO.....",
  ]),
} satisfies Record<AdvisorPortraitSpec["faceShape"], readonly string[]>);

export type SpritePixelHairTemplate = Readonly<{
  /** y → inclusive row runs; paint no hair outside the listed mask (v2 §3.6). */
  rows: Readonly<Record<number, readonly SpritePixelRowRun[]>>;
  /** Fixed upper-left highlight cells; applied only to remaining HAIR_BASE. */
  highlights: readonly SpritePixelPoint[];
  /** Identity part marks; applied as OUTLINE last. */
  parts: readonly SpritePixelPoint[];
}>;

/** All six hair styles as exact unions of inclusive row runs (v2 §3.6). */
export const SPRITE_PIXEL_HAIR: Record<AdvisorPortraitSpec["hairStyle"], SpritePixelHairTemplate> = {
  "side-part": {
    rows: {
      4: [run(9, 14)],
      5: [run(8, 16)],
      6: [run(7, 17)],
      7: [run(6, 17)],
      8: [run(6, 12), run(15, 17)],
      9: [run(6, 7), run(17, 17)],
      10: [run(6, 7), run(17, 17)],
    },
    highlights: [pt(9, 5), pt(10, 5), pt(8, 6), pt(9, 6)],
    parts: [pt(13, 5), pt(13, 6), pt(12, 7), pt(12, 8)],
  },
  crew: {
    rows: {
      5: [run(9, 14)],
      6: [run(7, 16)],
      7: [run(6, 17)],
      8: [run(6, 8), run(10, 12), run(14, 17)],
      9: [run(6, 7), run(16, 17)],
    },
    highlights: [pt(9, 6), pt(10, 6), pt(8, 7)],
    parts: [],
  },
  crop: {
    rows: {
      5: [run(10, 13)],
      6: [run(8, 15)],
      7: [run(7, 16)],
      8: [run(6, 9), run(11, 13), run(15, 17)],
      9: [run(6, 7), run(16, 17)],
    },
    highlights: [pt(10, 6), pt(9, 7)],
    parts: [],
  },
  bun: {
    rows: {
      2: [run(11, 12)],
      3: [run(10, 13)],
      4: [run(9, 14)],
      5: [run(8, 15)],
      6: [run(7, 16)],
      7: [run(6, 17)],
      8: [run(6, 10), run(13, 17)],
      9: [run(6, 7), run(16, 17)],
      10: [run(6, 7), run(16, 17)],
    },
    highlights: [pt(11, 3), pt(10, 4), pt(9, 5), pt(10, 5)],
    parts: [],
  },
  bob: {
    rows: {
      4: [run(9, 14)],
      5: [run(7, 16)],
      6: [run(6, 17)],
      7: [run(5, 18)],
      8: [run(5, 18)],
      9: [run(5, 7), run(16, 18)],
      10: [run(5, 7), run(16, 18)],
      11: [run(5, 7), run(16, 18)],
      12: [run(5, 7), run(16, 18)],
      13: [run(5, 7), run(16, 18)],
      14: [run(5, 7), run(16, 18)],
      15: [run(6, 8), run(15, 17)],
      16: [run(7, 8), run(15, 16)],
    },
    highlights: [pt(9, 5), pt(10, 5), pt(8, 6), pt(8, 7)],
    parts: [],
  },
  "tied-back": {
    rows: {
      4: [run(9, 14)],
      5: [run(7, 16)],
      6: [run(6, 17)],
      7: [run(6, 17)],
      8: [run(6, 10), run(13, 17)],
      9: [run(6, 7), run(16, 19)],
      10: [run(6, 7), run(16, 20)],
      11: [run(18, 20)],
      12: [run(19, 20)],
      13: [run(19, 21)],
      14: [run(19, 21)],
      15: [run(18, 20)],
      16: [run(18, 19)],
    },
    highlights: [pt(9, 5), pt(10, 5), pt(8, 6)],
    parts: [],
  },
};

export type SpritePixelAccessoryTemplate = Readonly<{
  /** Protected identity pixels, 1 logical pixel thick; disjoint from expression slots. */
  cells: readonly SpritePixelPoint[];
}>;

export const SPRITE_PIXEL_ACCESSORY: Record<AdvisorPortraitSpec["accessory"], SpritePixelAccessoryTemplate> = {
  none: { cells: [] },
  glasses: {
    cells: [
      pt(8, 12), pt(8, 13), pt(9, 13), pt(10, 13), pt(10, 12),
      pt(13, 12), pt(13, 13), pt(14, 13), pt(15, 13), pt(15, 12),
      pt(11, 12), pt(12, 12),
    ],
  },
  earpiece: {
    cells: [pt(18, 10), pt(19, 11), pt(19, 12), pt(18, 13)],
  },
};

/** Presentation necklines (v2 §3.7). Both share the protected skin neck
 * x=10..13,y=18..20 with (13,18..20) skin shadow. NECK_SQUARE uses the corrected
 * symmetric coordinates (v2 Changes #2): every collar cell is supported by all
 * three posture masks. Drawn after posture in identity, so collars never shift. */
export const SPRITE_PIXEL_PRESENTATION: Record<AdvisorPortraitSpec["genderPresentation"], readonly SpritePixelPoint[]> = {
  female: [pt(8, 20), pt(9, 21), pt(10, 22), pt(15, 20), pt(14, 21), pt(13, 22)],
  male: [pt(8, 20), pt(9, 20), pt(9, 21), pt(10, 21), pt(13, 21), pt(14, 21), pt(14, 20), pt(15, 20)],
};

export type SpritePixelExpressionGlyph = Readonly<{
  /** Brow cells, x=8..15,y=9..11; all OUTLINE. */
  brow: readonly SpritePixelPoint[];
  /** Mouth cells, x=9..14,y=15 plus x=10..13,y=16; all OUTLINE. */
  mouth: readonly SpritePixelPoint[];
}>;

/** Calm-only authored micro-bias bins (identity metadata; used ONLY by EXPR_CALM
 * so a chief's authored value can never cancel a state-selected expression). */
export const SPRITE_PIXEL_CALM_BROWS: Record<"flat" | "down" | "up", readonly SpritePixelPoint[]> = {
  flat: [pt(8, 10), pt(9, 10), pt(10, 10), pt(13, 10), pt(14, 10), pt(15, 10)],
  down: [pt(8, 10), pt(9, 10), pt(10, 11), pt(13, 11), pt(14, 10), pt(15, 10)],
  up: [pt(8, 10), pt(9, 9), pt(10, 9), pt(13, 9), pt(14, 9), pt(15, 10)],
};
export const SPRITE_PIXEL_CALM_MOUTHS: Record<"flat" | "up" | "down", readonly SpritePixelPoint[]> = {
  flat: [pt(10, 15), pt(11, 15), pt(12, 15), pt(13, 15)],
  up: [pt(10, 15), pt(13, 15), pt(11, 16), pt(12, 16)],
  down: [pt(11, 15), pt(12, 15), pt(10, 16), pt(13, 16)],
};

/** The six expression glyphs (v2 §3.9): authored pixel glyphs, obvious at 48px,
 * inside every face mask and outside every hair mask (computationally verified).
 * `calm` here is the authored flat/flat base; the renderer replaces it with the
 * micro-bias bins above. All glyph cells are OUTLINE over skin. */
export const SPRITE_PIXEL_EXPRESSION: Record<SpriteExpression, SpritePixelExpressionGlyph> = {
  calm: {
    brow: [pt(8, 10), pt(9, 10), pt(10, 10), pt(13, 10), pt(14, 10), pt(15, 10)],
    mouth: [pt(10, 15), pt(11, 15), pt(12, 15), pt(13, 15)],
  },
  skeptical: {
    brow: [pt(8, 10), pt(9, 10), pt(10, 11), pt(13, 11), pt(14, 10), pt(15, 10)],
    mouth: [pt(10, 15), pt(11, 15), pt(12, 15), pt(13, 16)],
  },
  strained: {
    brow: [pt(8, 10), pt(9, 10), pt(9, 11), pt(10, 11), pt(13, 11), pt(14, 10), pt(14, 11), pt(15, 10)],
    mouth: [pt(10, 15), pt(11, 16), pt(12, 15), pt(13, 16)],
  },
  urgent: {
    brow: [pt(8, 9), pt(9, 9), pt(10, 9), pt(13, 9), pt(14, 9), pt(15, 9)],
    mouth: [pt(11, 15), pt(12, 15), pt(11, 16), pt(12, 16)],
  },
  resolved: {
    brow: [pt(8, 10), pt(9, 9), pt(10, 9), pt(13, 9), pt(14, 9), pt(15, 10)],
    mouth: [pt(9, 15), pt(14, 15), pt(10, 16), pt(11, 16), pt(12, 16), pt(13, 16)],
  },
  severe: {
    brow: [pt(8, 9), pt(8, 10), pt(9, 10), pt(10, 11), pt(13, 11), pt(14, 10), pt(15, 9), pt(15, 10)],
    mouth: [pt(11, 15), pt(12, 15), pt(10, 16), pt(13, 16)],
  },
};

/** Posture shoulder masks (v2 §3.10): state-owned runs over y=19..22; run
 * endpoints and cells with no shoulder above become OUTLINE, remaining cells are
 * uniform tones (upper-left highlight cluster x<=7, right shadow cluster x>=16). */
export type SpritePixelPostureTemplate = Readonly<Record<number, readonly SpritePixelRowRun[]>>;

export const SPRITE_PIXEL_POSTURE: Record<SpriteRenderVariant["posture"], SpritePixelPostureTemplate> = {
  neutral: {
    19: [run(9, 14)],
    20: [run(6, 17)],
    21: [run(4, 19)],
    22: [run(3, 20)],
  },
  closed: {
    20: [run(8, 15)],
    21: [run(6, 17)],
    22: [run(4, 19)],
  },
  open: {
    19: [run(7, 16)],
    20: [run(4, 19)],
    21: [run(2, 21)],
    22: [run(1, 22)],
  },
};

/** S4 utility harness (v2 §3.11): all TRIM_BASE except the TRIM_SHADOW pocket
 * interior. Avoids neckline cells and the protected trim bars (x=4..7, x=16..19);
 * both diagonal straps converge into the 4×3 ledger pocket. */
export const SPRITE_PIXEL_HARNESS: readonly (readonly [x: number, y: number, index: SpritePixelPaletteIndex])[] = Object.freeze([
  [8, 22, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [9, 22, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [9, 23, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [10, 23, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [10, 24, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [15, 22, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [14, 22, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [14, 23, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [13, 23, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [13, 24, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [10, 24, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [11, 24, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [12, 24, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [13, 24, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [10, 25, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [13, 25, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [10, 26, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [11, 26, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [12, 26, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [13, 26, SPRITE_PIXEL_PALETTE.TRIM_BASE],
  [11, 25, SPRITE_PIXEL_PALETTE.TRIM_SHADOW],
  [12, 25, SPRITE_PIXEL_PALETTE.TRIM_SHADOW],
]);

/** Tight framing's fixed nearest-neighbor destination→source x-vector (v2 §3.11):
 * shows 20 centered source columns, duplicates four columns, emits a full 24-wide
 * matrix, preserves 2× physical pixels. y maps unchanged. */
export const SPRITE_PIXEL_TIGHT_X_MAP: readonly number[] = Object.freeze([2, 2, 3, 4, 5, 6, 7, 7, 8, 9, 10, 11, 12, 12, 13, 14, 15, 16, 17, 17, 18, 19, 20, 21]);

/** Overload stress vignette D (v2 §3.11): ((x=1..8 or 15..22) and y=2..3) OR
 * ((x=1..4 or 19..22) and y=4..18). Tint applies only where region is backdrop
 * and the cell is unprotected. */
export function spriteDarkenVignette(x: number, y: number): boolean {
  const topBand = y >= 2 && y <= 3 && ((x >= 1 && x <= 8) || (x >= 15 && x <= 22));
  const sideBand = y >= 4 && y <= 18 && ((x >= 1 && x <= 4) || (x >= 19 && x <= 22));
  return topBand || sideBand;
}

type MutableSemanticPixel = {
  basePaletteIndex: SpritePixelPaletteIndex;
  region: SpritePixelRegion;
  slot: SpritePixelSlot;
  protected: boolean;
};

function createMutableGrid(): MutableSemanticPixel[] {
  const cells: MutableSemanticPixel[] = [];
  for (let index = 0; index < SPRITE_PIXEL_CELL_COUNT; index += 1) {
    cells.push({ basePaletteIndex: SPRITE_PIXEL_PALETTE.BG_BASE, region: "backdrop", slot: "identity", protected: false });
  }
  return cells;
}

/** Identity-phase paint: overwrites freely (state protection is not yet active). */
function setCell(
  cells: MutableSemanticPixel[],
  x: number,
  y: number,
  index: SpritePixelPaletteIndex,
  region: SpritePixelRegion,
  options: { slot?: SpritePixelSlot; protected?: boolean } = {},
): void {
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= SPRITE_PIXEL_WIDTH || y < 0 || y >= SPRITE_PIXEL_HEIGHT) {
    throw new Error(`setCell: out-of-bounds identity cell (${x},${y})`);
  }
  const cell = cells[y * SPRITE_PIXEL_WIDTH + x];
  cell.basePaletteIndex = index;
  cell.region = region;
  if (options.slot !== undefined) cell.slot = options.slot;
  if (options.protected !== undefined) cell.protected = options.protected;
}

function freezeSemanticGrid(cells: readonly MutableSemanticPixel[]): SpritePixelGrid<SpriteSemanticPixel> {
  return Object.freeze({
    width: SPRITE_PIXEL_WIDTH,
    height: SPRITE_PIXEL_HEIGHT,
    cells: Object.freeze(cells.map((cell) => Object.freeze({ ...cell }))),
  });
}

function freezeColorGrid(cells: readonly SpriteHexColor[]): SpritePixelGrid<SpriteHexColor> {
  return Object.freeze({
    width: SPRITE_PIXEL_WIDTH,
    height: SPRITE_PIXEL_HEIGHT,
    cells: Object.freeze([...cells]),
  });
}

type SpritePixelWriteGuard = {
  allowedSlot?: SpritePixelSlot;
  allowedSlots?: readonly SpritePixelSlot[];
  allowedRegion?: SpritePixelRegion;
};

function hasExplicitSpritePixelWriteGuard(options: SpritePixelWriteGuard | undefined): options is SpritePixelWriteGuard {
  return options?.allowedSlot !== undefined
    || options?.allowedRegion !== undefined
    || (options?.allowedSlots?.length ?? 0) > 0;
}

function slotAllowed(slot: SpritePixelSlot, options: SpritePixelWriteGuard): boolean {
  if (options.allowedSlot !== undefined && options.allowedSlot !== slot) return false;
  if (options.allowedSlots !== undefined && !options.allowedSlots.includes(slot)) return false;
  return true;
}

/** Strict guarded write (v2 §6): throws on out-of-bounds, protected, or
 * undeclared slot/region targets. Internal painters use the tolerant guard so
 * protected identity survives; this export exists so tests can prove the guard
 * rejects malformed operations. */
export function writeSpriteCells(
  grid: SpritePixelGrid<SpriteSemanticPixel>,
  writes: readonly (readonly [x: number, y: number, index: SpritePixelPaletteIndex])[],
  options?: SpritePixelWriteGuard,
): SpritePixelGrid<SpriteSemanticPixel> {
  if (!hasExplicitSpritePixelWriteGuard(options)) {
    throw new Error("writeSpriteCells: an explicit allowedSlot, non-empty allowedSlots, or allowedRegion guard is required");
  }
  const cells = grid.cells.map((cell) => ({ ...cell }));
  for (const [x, y, index] of writes) {
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= SPRITE_PIXEL_WIDTH || y < 0 || y >= SPRITE_PIXEL_HEIGHT) {
      throw new Error(`writeSpriteCells: out-of-bounds write at (${x},${y})`);
    }
    if (!Number.isInteger(index) || index < 0 || index >= 20) {
      throw new Error(`writeSpriteCells: palette index ${index} is outside 0..19`);
    }
    const cell = cells[y * SPRITE_PIXEL_WIDTH + x];
    if (cell.protected) throw new Error(`writeSpriteCells: protected cell at (${x},${y})`);
    if (!slotAllowed(cell.slot, options)) {
      throw new Error(`writeSpriteCells: cell (${x},${y}) has slot ${cell.slot}, not in the declared write guard`);
    }
    if (options.allowedRegion !== undefined && cell.region !== options.allowedRegion) {
      throw new Error(`writeSpriteCells: cell (${x},${y}) has region ${cell.region}, expected ${options.allowedRegion}`);
    }
    cells[y * SPRITE_PIXEL_WIDTH + x] = { ...cell, basePaletteIndex: index };
  }
  return Object.freeze({ width: SPRITE_PIXEL_WIDTH, height: SPRITE_PIXEL_HEIGHT, cells: Object.freeze(cells) });
}

/** Tolerant guarded paint for state writers: skips protected / undeclared-slot /
 * undeclared-region cells so identity survives every effect (v2 §3.11). */
function guardedPaint(
  cells: MutableSemanticPixel[],
  writes: readonly (readonly [x: number, y: number, index: SpritePixelPaletteIndex])[],
  options: SpritePixelWriteGuard = {},
): void {
  for (const [x, y, index] of writes) {
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= SPRITE_PIXEL_WIDTH || y < 0 || y >= SPRITE_PIXEL_HEIGHT) {
      throw new Error(`guardedPaint: out-of-bounds write at (${x},${y})`);
    }
    const cell = cells[y * SPRITE_PIXEL_WIDTH + x];
    if (cell.protected) continue;
    if (!slotAllowed(cell.slot, options)) continue;
    if (options.allowedRegion !== undefined && cell.region !== options.allowedRegion) continue;
    cell.basePaletteIndex = index;
  }
}

/** Immutable semantic identity layer: portrait colors, 20 base tones, and the
 * full 672-cell semantic grid with slots, regions, and protection bits. */
function buildSpritePixelIdentity(sprite: SpriteSpec): SpritePixelIdentity {
  const portraitColors: SpritePortraitColorSources = [
    parseSpriteHexColor(sprite.skinTone),
    parseSpriteHexColor(sprite.hairColor),
    parseSpriteHexColor(sprite.eyeColor),
    parseSpriteHexColor(sprite.uniformColor),
    parseSpriteHexColor(sprite.trimColor),
    parseSpriteHexColor(sprite.backgroundColor),
    parseSpriteHexColor(sprite.panelColor),
  ];
  const palette = resolveSpriteBasePalette(portraitColors);
  const cells = createMutableGrid();

  // Outer source margin: always background, always protected. Tight framing is a
  // read-only projection and may replace OUTPUT edge columns (v2 Changes #6).
  for (let x = 0; x < SPRITE_PIXEL_WIDTH; x += 1) {
    for (let y = 0; y < SPRITE_PIXEL_HEIGHT; y += 1) {
      if (x === 0 || x === SPRITE_PIXEL_WIDTH - 1 || y === 0 || y === SPRITE_PIXEL_HEIGHT - 1) {
        cells[y * SPRITE_PIXEL_WIDTH + x].protected = true;
      }
    }
  }

  // Inset panel (x=1..22,y=1..26), border, and fixed top/left highlight.
  for (let x = 1; x <= 22; x += 1) {
    for (let y = 1; y <= 26; y += 1) {
      setCell(cells, x, y, SPRITE_PIXEL_PALETTE.PANEL_BASE, "backdrop");
    }
  }
  for (let y = 1; y <= 26; y += 1) {
    setCell(cells, 1, y, SPRITE_PIXEL_PALETTE.PANEL_SHADOW, "backdrop");
    setCell(cells, 22, y, SPRITE_PIXEL_PALETTE.PANEL_SHADOW, "backdrop");
  }
  for (let x = 1; x <= 22; x += 1) {
    setCell(cells, x, 1, SPRITE_PIXEL_PALETTE.PANEL_SHADOW, "backdrop");
    setCell(cells, x, 26, SPRITE_PIXEL_PALETTE.PANEL_SHADOW, "backdrop");
  }
  for (let y = 2; y <= 25; y += 1) setCell(cells, 2, y, SPRITE_PIXEL_PALETTE.PANEL_HIGHLIGHT, "backdrop");
  for (let x = 2; x <= 21; x += 1) setCell(cells, x, 2, SPRITE_PIXEL_PALETTE.PANEL_HIGHLIGHT, "backdrop");

  // Fixed lower torso (x=2..21,y=23..26): run endpoints outline, upper-left
  // highlight and right/lower shadow clusters, protected role bars (x=4..7 and
  // x=16..19 at y=25) that guarantee the role color survives every state.
  for (let y = 23; y <= 26; y += 1) {
    for (let x = 2; x <= 21; x += 1) {
      const index = x === 2 || x === 21
        ? SPRITE_PIXEL_PALETTE.OUTLINE
        : x <= 5 && y <= 24 ? SPRITE_PIXEL_PALETTE.UNIFORM_HIGHLIGHT
          : x >= 18 ? SPRITE_PIXEL_PALETTE.UNIFORM_SHADOW
            : SPRITE_PIXEL_PALETTE.UNIFORM_BASE;
      setCell(cells, x, y, index, "torso");
    }
  }
  for (const x of [4, 5, 6, 7, 16, 17, 18, 19]) {
    setCell(cells, x, 25, SPRITE_PIXEL_PALETTE.TRIM_BASE, "torso", { protected: true });
  }

  // Posture slot (x=1..22,y=19..22); protected neck/neckline cells keep identity.
  for (let x = 1; x <= 22; x += 1) {
    for (let y = 19; y <= 22; y += 1) {
      const cell = cells[y * SPRITE_PIXEL_WIDTH + x];
      if (!cell.protected) {
        cell.slot = "posture";
        cell.region = "shoulder";
      }
    }
  }

  // Neck behind head: x=10..13,y=17..20, right column shadow. Protected so
  // posture can never erase it (v2 §3.2/§3.7).
  for (let x = 10; x <= 13; x += 1) {
    for (let y = 17; y <= 20; y += 1) {
      setCell(cells, x, y, SPRITE_PIXEL_PALETTE.SKIN_BASE, "skin", { protected: true, slot: "identity" });
    }
  }
  for (let y = 18; y <= 20; y += 1) {
    setCell(cells, 13, y, SPRITE_PIXEL_PALETTE.SKIN_SHADOW, "skin", { protected: true, slot: "identity" });
  }

  // Literal head map (v2 §3.5): 'O' = universal outline, 's' = skin base.
  const faceRows = SPRITE_PIXEL_FACE[sprite.faceShape];
  for (let row = 0; row < faceRows.length; row += 1) {
    const line = faceRows[row];
    if (line.length !== 14) throw new Error(`SPRITE_PIXEL_FACE.${sprite.faceShape} row ${row} must be exactly 14 chars`);
    for (let col = 0; col < line.length; col += 1) {
      const char = line[col];
      const x = 5 + col;
      const y = 4 + row;
      if (char === "O") setCell(cells, x, y, SPRITE_PIXEL_PALETTE.OUTLINE, "head", { protected: true, slot: "identity" });
      else if (char === "s") setCell(cells, x, y, SPRITE_PIXEL_PALETTE.SKIN_BASE, "skin", { slot: "identity" });
    }
  }

  // Fixed skin shading clusters (v2 §3.3): upper-left highlight, right-jaw/chin
  // shadow. Only unprotected skin cells; the nose is painted separately below and
  // is protected, so the loss-desaturation predicate (region skin && !protected)
  // can never touch it (v2 Changes #5).
  for (const [x, y] of [[8, 8], [9, 8], [8, 9]] as const) {
    const cell = cells[y * SPRITE_PIXEL_WIDTH + x];
    if (cell.region === "skin" && !cell.protected) setCell(cells, x, y, SPRITE_PIXEL_PALETTE.SKIN_HIGHLIGHT, "skin");
  }
  for (let y = 9; y <= 13; y += 1) {
    const cell = cells[y * SPRITE_PIXEL_WIDTH + 16];
    if (cell.region === "skin" && !cell.protected) setCell(cells, 16, y, SPRITE_PIXEL_PALETTE.SKIN_SHADOW, "skin");
  }
  for (let y = 14; y <= 16; y += 1) {
    const cell = cells[y * SPRITE_PIXEL_WIDTH + 15];
    if (cell.region === "skin" && !cell.protected) setCell(cells, 15, y, SPRITE_PIXEL_PALETTE.SKIN_SHADOW, "skin");
  }
  {
    const cell = cells[17 * SPRITE_PIXEL_WIDTH + 13];
    if (cell.region === "skin" && !cell.protected) setCell(cells, 13, 17, SPRITE_PIXEL_PALETTE.SKIN_SHADOW, "skin");
  }

  // Literal hair mask (v2 §3.6), then the §3.4 boundary convention: exposed
  // top/left/right hair cells become OUTLINE, exposed bottom/hairline cells become
  // HAIR_SHADOW (unless already outline), listed highlights replace only remaining
  // HAIR_BASE, and listed part cells become OUTLINE last.
  const hair = SPRITE_PIXEL_HAIR[sprite.hairStyle];
  const hairCells = new Set<number>();
  for (const [yKey, runs] of Object.entries(hair.rows)) {
    const y = Number(yKey);
    for (const [start, end] of runs) {
      for (let x = start; x <= end; x += 1) {
        setCell(cells, x, y, SPRITE_PIXEL_PALETTE.HAIR_BASE, "hair", { protected: true, slot: "identity" });
        hairCells.add(y * SPRITE_PIXEL_WIDTH + x);
      }
    }
  }
  const isHair = (x: number, y: number): boolean => hairCells.has(y * SPRITE_PIXEL_WIDTH + x);
  for (const index of hairCells) {
    const x = index % SPRITE_PIXEL_WIDTH;
    const y = Math.floor(index / SPRITE_PIXEL_WIDTH);
    if (!isHair(x, y - 1) || !isHair(x - 1, y) || !isHair(x + 1, y)) {
      setCell(cells, x, y, SPRITE_PIXEL_PALETTE.OUTLINE, "hair", { protected: true });
    } else if (!isHair(x, y + 1)) {
      setCell(cells, x, y, SPRITE_PIXEL_PALETTE.HAIR_SHADOW, "hair", { protected: true });
    }
  }
  for (const [x, y] of hair.highlights) {
    const cell = cells[y * SPRITE_PIXEL_WIDTH + x];
    if (cell.basePaletteIndex === SPRITE_PIXEL_PALETTE.HAIR_BASE) {
      setCell(cells, x, y, SPRITE_PIXEL_PALETTE.HAIR_HIGHLIGHT, "hair", { protected: true });
    }
  }
  for (const [x, y] of hair.parts) {
    setCell(cells, x, y, SPRITE_PIXEL_PALETTE.OUTLINE, "hair", { protected: true });
  }

  // Fixed facial identity (v2 §3.8): one hard pixel per eye; the nose is a
  // protected SKIN_SHADOW pair so loss desaturation never touches it (v2 Changes #5).
  setCell(cells, 9, 12, SPRITE_PIXEL_PALETTE.EYE_BASE, "face-feature", { protected: true, slot: "identity" });
  setCell(cells, 14, 12, SPRITE_PIXEL_PALETTE.EYE_BASE, "face-feature", { protected: true, slot: "identity" });
  setCell(cells, 11, 13, SPRITE_PIXEL_PALETTE.SKIN_SHADOW, "face-feature", { protected: true, slot: "identity" });
  setCell(cells, 12, 14, SPRITE_PIXEL_PALETTE.SKIN_SHADOW, "face-feature", { protected: true, slot: "identity" });

  // Expression slots: brows x=8..15,y=9..11; mouth x=9..14,y=15 plus x=10..13,y=16.
  // Underlying identity cells stay skin; only the final expression may write here.
  for (let y = 9; y <= 11; y += 1) {
    for (let x = 8; x <= 15; x += 1) {
      const cell = cells[y * SPRITE_PIXEL_WIDTH + x];
      if (!cell.protected) cell.slot = "expression";
    }
  }
  for (let x = 9; x <= 14; x += 1) {
    const cell = cells[15 * SPRITE_PIXEL_WIDTH + x];
    if (!cell.protected) cell.slot = "expression";
  }
  for (let x = 10; x <= 13; x += 1) {
    const cell = cells[16 * SPRITE_PIXEL_WIDTH + x];
    if (!cell.protected) cell.slot = "expression";
  }

  // Presentation neckline (v2 §3.7): protected identity so it never shifts with
  // shoulders; NECK_SQUARE uses the corrected symmetric coordinates (v2 Changes #2).
  for (const [x, y] of SPRITE_PIXEL_PRESENTATION[sprite.genderPresentation]) {
    setCell(cells, x, y, SPRITE_PIXEL_PALETTE.TRIM_BASE, "neckline", { protected: true, slot: "identity" });
  }

  // Accessories (v2 §3.8): protected identity pixels disjoint from every
  // expression slot; mutable writers must skip protected cells (v2 Changes #17).
  // Painted after hair so the earpiece sits over tied-back hair.
  for (const [x, y] of SPRITE_PIXEL_ACCESSORY[sprite.accessory].cells) {
    setCell(cells, x, y, SPRITE_PIXEL_PALETTE.TRIM_HIGHLIGHT, "accessory", { protected: true, slot: "identity" });
  }

  // Support slot (v2 §3.1/§3.11): central TORSO cells x=8..15,y=23..26 eligible
  // for the S4 harness. The y=22 harness strap anchors stay in the posture slot so
  // the shoulder mask paints them as uniform ("only unprotected uniform/support
  // cells" in the §3.11 harness region); the harness guard accepts both slots.
  // Marked last so neckline and protected cells are excluded.
  for (let y = 23; y <= 26; y += 1) {
    for (let x = 8; x <= 15; x += 1) {
      const cell = cells[y * SPRITE_PIXEL_WIDTH + x];
      if (!cell.protected) {
        cell.slot = "support";
        cell.region = "support";
      }
    }
  }

  return { portraitColors, palette, grid: freezeSemanticGrid(cells) };
}

/** Copy identity cells back over a state-owned slot (protected cells untouched). */
function restoreUnprotectedSlot(source: MutableSemanticPixel[], identity: SpritePixelGrid<SpriteSemanticPixel>, slot: SpritePixelSlot): void {
  for (let index = 0; index < SPRITE_PIXEL_CELL_COUNT; index += 1) {
    const identityCell = identity.cells[index];
    if (identityCell.slot === slot && !identityCell.protected) {
      source[index] = { ...identityCell };
    }
  }
}

/** Calm uses the authored micro-bias bins; every state-selected expression uses
 * its exact authored glyph and ignores the bins so state can never be canceled. */
function glyphFor(sprite: SpriteSpec): SpritePixelExpressionGlyph {
  if (sprite.expression === "calm") {
    const brow = sprite.browTilt < -0.24 ? "down" : sprite.browTilt > 0.24 ? "up" : "flat";
    const mouth = sprite.mouthCurve < 0 ? "down" : sprite.mouthCurve >= 0.40 ? "up" : "flat";
    return { brow: SPRITE_PIXEL_CALM_BROWS[brow], mouth: SPRITE_PIXEL_CALM_MOUTHS[mouth] };
  }
  return SPRITE_PIXEL_EXPRESSION[sprite.expression];
}

/** Exactly one posture mask with protected-cell guards (v2 §3.10/§3.11). */
function paintPosture(cells: MutableSemanticPixel[], template: SpritePixelPostureTemplate): void {
  const inMask = (x: number, y: number): boolean => {
    const runs = template[y];
    return runs !== undefined && runs.some(([start, end]) => x >= start && x <= end);
  };
  for (let y = 19; y <= 22; y += 1) {
    const runs = template[y];
    if (runs === undefined) continue;
    for (const [start, end] of runs) {
      for (let x = start; x <= end; x += 1) {
        const cell = cells[y * SPRITE_PIXEL_WIDTH + x];
        if (cell.protected || cell.slot !== "posture") continue;
        // §3.4 shoulder rule: cells with no shoulder above and run endpoints are
        // OUTLINE; the rest are uniform tones from the fixed upper-left light.
        const index = !inMask(x, y - 1) || x === start || x === end
          ? SPRITE_PIXEL_PALETTE.OUTLINE
          : x <= 7 ? SPRITE_PIXEL_PALETTE.UNIFORM_HIGHLIGHT
            : x >= 16 ? SPRITE_PIXEL_PALETTE.UNIFORM_SHADOW
              : SPRITE_PIXEL_PALETTE.UNIFORM_BASE;
        cell.basePaletteIndex = index;
      }
    }
  }
}

/** Exactly one final-expression glyph with protected-cell guards (v2 §3.9/§3.11). */
function paintExpression(cells: MutableSemanticPixel[], glyph: SpritePixelExpressionGlyph): void {
  const writes: (readonly [number, number, SpritePixelPaletteIndex])[] = [];
  for (const point of glyph.brow) writes.push([point[0], point[1], SPRITE_PIXEL_PALETTE.OUTLINE]);
  for (const point of glyph.mouth) writes.push([point[0], point[1], SPRITE_PIXEL_PALETTE.OUTLINE]);
  guardedPaint(cells, writes, { allowedSlot: "expression" });
}

/** Resolve base palette RGB, then apply region-gated transforms: overload tint
 * (backdrop only, in the fixed vignette) and loss desaturation (unprotected skin
 * in y=4..17 with a skin base role). Topology and palette indices are unchanged. */
function resolveSourceColors(source: readonly MutableSemanticPixel[], palette: SpriteResolvedPalette, variant: SpriteRenderVariant): SpriteHexColor[] {
  const colors: SpriteHexColor[] = [];
  for (let index = 0; index < SPRITE_PIXEL_CELL_COUNT; index += 1) {
    const cell = source[index];
    let color = palette[cell.basePaletteIndex];
    const x = index % SPRITE_PIXEL_WIDTH;
    const y = Math.floor(index / SPRITE_PIXEL_WIDTH);
    if (variant.backgroundDarkenOpacity === 0.22 && !cell.protected && cell.region === "backdrop" && spriteDarkenVignette(x, y)) {
      color = spriteLoadTint(color);
    }
    if (variant.saturation === 0.45 && !cell.protected && cell.region === "skin" && y >= 4 && y <= 17
      && (cell.basePaletteIndex === SPRITE_PIXEL_PALETTE.SKIN_BASE
        || cell.basePaletteIndex === SPRITE_PIXEL_PALETTE.SKIN_SHADOW
        || cell.basePaletteIndex === SPRITE_PIXEL_PALETTE.SKIN_HIGHLIGHT)) {
      color = spriteDesaturate45(color);
    }
    colors.push(color);
  }
  return colors;
}

/** Default framing is identity mapping; tight framing is the fixed read-only
 * camera projection (v2 §3.11). */
function projectColors(sourceColors: readonly SpriteHexColor[], framing: SpriteRenderVariant["framing"]): SpriteHexColor[] {
  if (framing !== "tight") return [...sourceColors];
  const output: SpriteHexColor[] = [];
  for (let y = 0; y < SPRITE_PIXEL_HEIGHT; y += 1) {
    for (let x = 0; x < SPRITE_PIXEL_WIDTH; x += 1) {
      output.push(sourceColors[y * SPRITE_PIXEL_WIDTH + SPRITE_PIXEL_TIGHT_X_MAP[x]]);
    }
  }
  return output;
}

function assertCellCount(cells: readonly unknown[], label: string): void {
  if (cells.length !== SPRITE_PIXEL_CELL_COUNT) {
    throw new Error(`${label} must have exactly ${SPRITE_PIXEL_CELL_COUNT} cells, got ${cells.length}`);
  }
}

function assertGridCells<T>(grid: SpritePixelGrid<T>, label: string): void {
  if (grid.width !== SPRITE_PIXEL_WIDTH || grid.height !== SPRITE_PIXEL_HEIGHT || grid.cells.length !== SPRITE_PIXEL_CELL_COUNT) {
    throw new Error(`${label} must be exactly ${SPRITE_PIXEL_WIDTH}×${SPRITE_PIXEL_HEIGHT} (${SPRITE_PIXEL_CELL_COUNT} cells)`);
  }
}

/** Canonical pixel render: immutable identity → state overlays → region-gated
 * color transforms → optional camera projection → 672 opaque RGB cells. Pure and
 * deterministic: (portrait, state) through buildChiefSpriteSpec yields identical
 * bytes; identity topology is state-invariant; no RNG/clock/locale/DOM. */
export function buildSpritePixels(sprite: SpriteSpec): SpritePixelRender {
  const identity = buildSpritePixelIdentity(sprite);
  assertGridCells(identity.grid, "identity.grid");

  const source = identity.grid.cells.map((cell) => ({ ...cell }));
  restoreUnprotectedSlot(source, identity.grid, "posture");
  paintPosture(source, SPRITE_PIXEL_POSTURE[sprite.variant.posture]);
  restoreUnprotectedSlot(source, identity.grid, "expression");
  paintExpression(source, glyphFor(sprite));
  if (sprite.variant.supportDetail === "utility-harness") {
    // y=22 strap anchors are posture-painted uniform cells; the pocket lives in the
    // support slot (v2 §3.11 "only unprotected uniform/support cells").
    guardedPaint(source, SPRITE_PIXEL_HARNESS, { allowedSlots: ["posture", "support"] });
  }

  const sourceColors = resolveSourceColors(source, identity.palette, sprite.variant);
  const output = projectColors(sourceColors, sprite.variant.framing);

  // Structural invariants (v2 §3.13): grid sizes, untouched source outer margin,
  // and lowercase opaque hex output.
  assertCellCount(source, "source");
  assertCellCount(sourceColors, "sourceColors");
  assertCellCount(output, "output");
  for (let index = 0; index < SPRITE_PIXEL_CELL_COUNT; index += 1) {
    const x = index % SPRITE_PIXEL_WIDTH;
    const y = Math.floor(index / SPRITE_PIXEL_WIDTH);
    if (x === 0 || x === SPRITE_PIXEL_WIDTH - 1 || y === 0 || y === SPRITE_PIXEL_HEIGHT - 1) {
      const identityCell = identity.grid.cells[index];
      const sourceCell = source[index];
      if (sourceCell.basePaletteIndex !== identityCell.basePaletteIndex || sourceCell.region !== identityCell.region
        || sourceCell.slot !== identityCell.slot || sourceCell.protected !== identityCell.protected) {
        throw new Error(`source outer margin changed at (${x},${y})`);
      }
      if (sourceColors[index] !== identity.palette[identityCell.basePaletteIndex]) {
        throw new Error(`source outer margin color changed at (${x},${y})`);
      }
    }
    if (!/^#[0-9a-f]{6}$/.test(output[index])) {
      throw new Error(`output cell ${index} is not lowercase opaque #rrggbb: ${output[index]}`);
    }
  }

  return Object.freeze({
    identity,
    source: freezeSemanticGrid(source),
    sourceColors: freezeColorGrid(sourceColors),
    output: freezeColorGrid(output),
  });
}

/** Row-major horizontal runs of equal final colors: each run becomes exactly one
 * <rect>. Bounded: a checkerboard reaches the strict 672-run maximum, a uniform
 * 24×28 matrix collapses to 28 runs. */
export function spritePixelRuns(cells: readonly SpriteHexColor[]): SpritePixelRun[] {
  if (cells.length !== SPRITE_PIXEL_CELL_COUNT) {
    throw new Error(`spritePixelRuns expects exactly ${SPRITE_PIXEL_CELL_COUNT} cells, got ${cells.length}`);
  }
  const runs: SpritePixelRun[] = [];
  for (let y = 0; y < SPRITE_PIXEL_HEIGHT; y += 1) {
    let x = 0;
    while (x < SPRITE_PIXEL_WIDTH) {
      const color = cells[y * SPRITE_PIXEL_WIDTH + x];
      let end = x + 1;
      while (end < SPRITE_PIXEL_WIDTH && cells[y * SPRITE_PIXEL_WIDTH + end] === color) end += 1;
      runs.push({ x, y, width: end - x, color });
      x = end;
    }
  }
  return runs;
}

/** Run-grouped crispEdges SVG: fixed root, one integer <rect height="1"> per
 * horizontal run, row-major, fixed attribute order, no paths/filters/opacity. */
export function buildAdvisorPortraitSvg(sprite: SpriteSpec): string {
  const output = buildSpritePixels(sprite).output.cells;
  const rects = spritePixelRuns(output).map((run) => `<rect x="${run.x}" y="${run.y}" width="${run.width}" height="1" fill="${run.color}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="28" viewBox="0 0 24 28" shape-rendering="crispEdges" role="img" aria-label="Generated advisor portrait">${rects.join("")}</svg>`;
}

export function buildAdvisorPortraitDataUri(sprite: SpriteSpec) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildAdvisorPortraitSvg(sprite))}`;
}



export function createInitialGameSession(scenario: ScenarioDefinition, sessionSeed = scenario.id): GameSession {
  const timestamp = new Date().toISOString();
  const initialState = deepClone(scenario.initialState);
  return {
    id: scenario.id,
    campaignId: sessionSeed,
    saveFormatVersion: "8",
    engineVersion: "0.1.0",
    revision: 0,
    scenarioId: scenario.id,
    contentVersion: scenario.contentVersion,
    advisorRoster: generateAdvisorRoster(scenario.chiefs, sessionSeed),
    state: initialState,
    initialState: deepClone(initialState),
    turnInputs: [],
    authoritativeActions: [],
    history: [],
    updatedAt: timestamp,
  };
}
