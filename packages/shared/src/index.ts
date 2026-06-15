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

const defaultStaffMechanicsState: StaffMechanicsState = {
  s1: { recoveryDebt: 42, reservePredictability: 51 },
  s2: { externalEstimateConfidence: 46, visibility: "ESTIMATED", deceptionRisk: 44 },
  s3: { visiblePosture: 48, executablePosture: 50, credibleDeterrence: 46 },
  s4: { stockpileDepth: 47, liftBurn: 41, supportableTempo: 13 },
  s5: { strategicCoherence: 52, doctrineAlignment: 50 },
};

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

export const chiefArchetypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  genderPresentation: genderPresentationSchema,
  directorate: directorateSchema,
  title: z.string(),
  doctrineBias: z.string(),
  temperament: z.string(),
  competence: z.number().min(0).max(1),
  riskTolerance: z.number().min(0).max(1),
  preferredTags: z.array(z.string()),
  concernTags: z.array(z.string()),
});
export type ChiefArchetype = z.infer<typeof chiefArchetypeSchema>;

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
  consequence: z.string(),
  metrics: z.array(staffFunctionMetricSchema),
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
});
export type EventDefinition = z.infer<typeof eventDefinitionSchema>;

export const afterActionNoteSchema = z.object({
  heading: z.string(),
  detail: z.string(),
});
export type AfterActionNote = z.infer<typeof afterActionNoteSchema>;

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
  microCampaignLength: z.number().int().min(1).default(6),
  seed: z.number().int(),
  campaignStatus: z.enum(["active", "won", "lost"]).default("active"),
  campaignScore: campaignScoreSchema.default(0),
  campaignOutcome: z.string().nullable().default(null),
  strategic: strategicStateSchema,
  staffMechanics: staffMechanicsStateSchema.default(defaultStaffMechanicsState),
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

  if (state.microCampaignLength > state.maxTurns) {
    ctx.addIssue({
      code: "custom",
      path: ["microCampaignLength"],
      message: "microCampaignLength cannot exceed maxTurns",
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

export const turnInputSchema = z.object({
  turn: z.number().int().min(1),
  selectedActionIds: z.array(z.string()).default([]),
  selections: z.array(memoSelectionSchema),
  acceptedRiskOverrides: z.array(acceptedRiskOverrideSchema).default([]),
  staffNegotiations: z.array(staffNegotiationSchema).default([]),
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
  projectedBlockers: z.array(z.string()),
  acceptedRiskCandidateCount: z.number().int().min(0),
});
export type DecisionPreviewEntry = z.infer<typeof decisionPreviewEntrySchema>;

export const turnPreviewSchema = z.object({
  decisionPreviews: z.array(decisionPreviewEntrySchema),
  acceptedRiskCandidates: z.array(acceptedRiskOverrideSchema),
  predictedEvents: z.array(eventDefinitionSchema),
  chiefCoalitions: z.array(chiefCoalitionEntrySchema).default([]),
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
});
export type ScenarioDefinition = z.infer<typeof scenarioDefinitionSchema>;

export const gameSessionSchema = z.object({
  id: z.string(),
  saveFormatVersion: z.literal("5"),
  revision: z.number().int().min(0).default(0),
  scenarioId: z.string(),
  contentVersion: z.string(),
  advisorRoster: z.array(sessionAdvisorSchema),
  state: campaignStateSchema,
  initialState: campaignStateSchema,
  turnInputs: z.array(turnInputSchema),
  history: z.array(turnResultSchema),
  updatedAt: z.string(),
});
export type GameSession = z.infer<typeof gameSessionSchema>;

export const sessionExportSchema = z.object({
  exportedAt: z.string(),
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
  failureKind: z.enum(["none", "history_length_mismatch", "replay_hash_mismatch", "state_mismatch", "final_state_mismatch"]).default("none"),
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

    return {
      directorate,
      burdenPoints,
      capacity,
      burdenLevel,
      failureMode,
      confidencePenalty,
      executionPenalty,
      summary:
        burdenLevel === "overloaded"
          ? `${directorateLabel(directorate)} is overloaded; expect ${failureMode}.`
          : burdenLevel === "strained"
            ? `${directorateLabel(directorate)} is at the edge of monthly capacity.`
            : `${directorateLabel(directorate)} has enough slack to absorb the current guidance.`,
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
    const warnings = [
      ...entries.filter((entry) => entry.burdenLevel !== "light").map((entry) => entry.summary),
      ...metrics.filter((metric) => metric.status === "risk").map((metric) => `${metric.label} is in the risk band.`),
    ];

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
      consequence: warnings[0] ?? definition.doctrineNote,
      metrics,
    };
  });
}

function staffFunctionForDirectorate(definitions: StaffFunctionDefinition[], directorate: DirectorateId) {
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
    `${staffFunction.shortLabel} evidence: ${metric.label} is ${Math.round(metric.value)} (${metric.status}); ` +
    `staff load is ${burdenText} at ${roundMetric(burdenPoints)} point(s).`;

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
): ChiefPositionEntry[] {
  return chiefs.map((chief) => {
    const trust = state.chiefTrust[chief.id] ?? 50;
    const staffReadoutEvidence = buildChiefStaffReadoutEvidence(chief, state, burdens, staffFunctionDefinitions);
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
      staffEvidencePenalty;

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
        ? `${chief.title} sees this option as consistent with ${chief.doctrineBias}.`
        : position === "accept_risk"
          ? `${chief.title} can live with this course of action, but expects friction in ${directorateLabel(chief.directorate).toLowerCase()}.`
          : position === "request_conditions"
            ? `${chief.title} needs tighter assumptions before backing this line.`
            : `${chief.title} sees this option as misaligned with the directorate's obligations.`;

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
  return chiefVoiceLibrary[chief.id] ?? {
    opener: ["The chief answers in a careful, institutional register."],
    cooperative: ["If the month stays honest, I can support it."],
    skeptical: ["I need the room to be sharper about the risk it is accepting."],
    confrontational: ["I will not let the packet hide its real cost."],
    closer: ["Give me a bounded order and I can carry it."],
  };
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
  return `Turn ${state.turn}/${state.maxTurns}: ${state.strategic.forceGeneration.deployableUnits.toFixed(1)} brigades deployable, alliance alignment ${state.strategic.alliance.politicalAlignment.toFixed(0)}, cabinet cover ${state.strategic.domestic.cabinetCover.toFixed(0)}, incident ladder ${state.strategic.escalation.incidentLadder.toFixed(0)}.`;
}

function portraitTrimColor(directorate: DirectorateId) {
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
  return chiefs.map((chief, index) => {
    const rng = createSeededRng(hashString(`${seedSource}:${chief.id}:${index}`));
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

export function buildAdvisorPortraitSvg(portrait: AdvisorPortraitSpec) {
  const jawRadius = portrait.faceShape === "square" ? 22 : portrait.faceShape === "round" ? 28 : 25;
  const cheekWidth = portrait.faceShape === "square" ? 76 : portrait.faceShape === "round" ? 72 : 68;
  const faceHeight = portrait.faceShape === "round" ? 88 : 94;
  const mouthY = portrait.genderPresentation === "female" ? 165 : 168;

  const hair =
    portrait.hairStyle === "bun"
      ? `
        <circle cx="120" cy="42" r="18" fill="${portrait.hairColor}" />
        <path d="M58 108 C58 58 83 36 120 36 C157 36 182 58 182 108 L182 118 C164 95 147 84 120 84 C93 84 76 95 58 118 Z" fill="${portrait.hairColor}" />
      `
      : portrait.hairStyle === "bob"
        ? `<path d="M56 114 C56 58 84 40 120 40 C156 40 184 58 184 114 C177 146 162 164 146 170 L146 132 C137 119 130 114 120 114 C110 114 103 119 94 132 L94 170 C77 164 63 146 56 114 Z" fill="${portrait.hairColor}" />`
        : portrait.hairStyle === "tied-back"
          ? `
            <path d="M60 112 C60 60 88 38 120 38 C152 38 180 60 180 112 L180 120 C164 96 147 84 120 84 C93 84 76 96 60 120 Z" fill="${portrait.hairColor}" />
            <path d="M166 142 C183 148 190 164 186 184 C172 180 161 167 156 150 Z" fill="${portrait.hairColor}" />
          `
          : portrait.hairStyle === "crew"
            ? `<path d="M66 102 C70 66 93 48 120 48 C147 48 170 66 174 102 C154 85 138 80 120 80 C102 80 86 85 66 102 Z" fill="${portrait.hairColor}" />`
            : portrait.hairStyle === "crop"
              ? `<path d="M70 100 C78 64 97 50 120 50 C143 50 162 64 170 100 C152 88 137 84 120 84 C103 84 88 88 70 100 Z" fill="${portrait.hairColor}" />`
              : `<path d="M64 104 C70 60 95 40 124 40 C149 40 168 52 176 88 C162 72 145 66 132 66 C109 66 91 76 64 104 Z" fill="${portrait.hairColor}" />`;

  const accessory =
    portrait.accessory === "glasses"
      ? `
        <rect x="82" y="126" width="28" height="18" rx="6" fill="none" stroke="#d6dde0" stroke-width="3" />
        <rect x="130" y="126" width="28" height="18" rx="6" fill="none" stroke="#d6dde0" stroke-width="3" />
        <path d="M110 135 L130 135" stroke="#d6dde0" stroke-width="3" />
      `
      : portrait.accessory === "earpiece"
        ? `<path d="M174 140 C184 144 188 152 186 162" stroke="#d6dde0" stroke-width="3" fill="none" />`
        : "";

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280" role="img" aria-label="Generated advisor portrait">
      <rect width="240" height="280" rx="16" fill="${portrait.backgroundColor}" />
      <rect x="14" y="14" width="212" height="252" rx="12" fill="${portrait.panelColor}" opacity="0.55" />
      <path d="M24 218 C64 182 84 176 120 176 C156 176 176 182 216 218 L216 260 L24 260 Z" fill="${portrait.uniformColor}" />
      <path d="M34 226 C70 196 93 190 120 190 C147 190 170 196 206 226" stroke="${portrait.trimColor}" stroke-width="6" fill="none" opacity="0.95" />
      <rect x="108" y="187" width="24" height="30" rx="10" fill="${portrait.skinTone}" />
      <rect x="48" y="234" width="42" height="8" rx="4" fill="${portrait.trimColor}" opacity="0.9" />
      <rect x="150" y="234" width="42" height="8" rx="4" fill="${portrait.trimColor}" opacity="0.9" />
      <path d="M120 68 C${120 - cheekWidth / 2} 68 76 ${104 + faceHeight / 3} 76 ${142 + faceHeight / 4} C76 ${176 + faceHeight / 6} 94 208 120 208 C146 208 164 ${176 + faceHeight / 6} 164 ${142 + faceHeight / 4} C164 ${104 + faceHeight / 3} ${120 + cheekWidth / 2} 68 120 68 Z" fill="${portrait.skinTone}" />
      <circle cx="73" cy="146" r="11" fill="${portrait.skinTone}" />
      <circle cx="167" cy="146" r="11" fill="${portrait.skinTone}" />
      ${hair}
      <path d="M92 122 C100 ${118 + portrait.browTilt} 108 ${118 - portrait.browTilt} 114 122" stroke="#231d1a" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <path d="M126 122 C132 ${118 - portrait.browTilt} 140 ${118 + portrait.browTilt} 148 122" stroke="#231d1a" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <ellipse cx="102" cy="138" rx="9" ry="7" fill="#f4f7f6" />
      <ellipse cx="138" cy="138" rx="9" ry="7" fill="#f4f7f6" />
      <circle cx="102" cy="138" r="4.5" fill="${portrait.eyeColor}" />
      <circle cx="138" cy="138" r="4.5" fill="${portrait.eyeColor}" />
      <circle cx="104" cy="136" r="1.2" fill="#f5fbff" />
      <circle cx="140" cy="136" r="1.2" fill="#f5fbff" />
      <path d="M120 142 L116 158 L123 160" stroke="#8f6f5b" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7" />
      <path d="M101 ${mouthY} C110 ${mouthY + portrait.mouthCurve} 130 ${mouthY + portrait.mouthCurve} 139 ${mouthY}" stroke="#6e3f40" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M78 94 C92 74 103 66 120 66 C137 66 148 74 162 94" stroke="${portrait.hairColor}" stroke-width="${jawRadius / 7}" fill="none" stroke-linecap="round" opacity="0.85" />
      ${accessory}
    </svg>
  `.trim();
}

export function buildAdvisorPortraitDataUri(portrait: AdvisorPortraitSpec) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildAdvisorPortraitSvg(portrait))}`;
}

export function createInitialGameSession(scenario: ScenarioDefinition, sessionSeed = scenario.id): GameSession {
  const timestamp = new Date().toISOString();
  const initialState = deepClone(scenario.initialState);
  return {
    id: scenario.id,
    saveFormatVersion: "5",
    revision: 0,
    scenarioId: scenario.id,
    contentVersion: scenario.contentVersion,
    advisorRoster: generateAdvisorRoster(scenario.chiefs, sessionSeed),
    state: initialState,
    initialState: deepClone(initialState),
    turnInputs: [],
    history: [],
    updatedAt: timestamp,
  };
}
