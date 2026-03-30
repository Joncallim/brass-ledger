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

export const forceGenerationStateSchema = z.object({
  deployableUnits: z.number(),
  reserveStrain: z.number(),
  trainingThroughput: z.number(),
  personnelShortfalls: z.number(),
});
export type ForceGenerationState = z.infer<typeof forceGenerationStateSchema>;

export const intelStateSchema = z.object({
  collectionCoverage: z.number(),
  confidence: z.number(),
  warningReliability: z.number(),
  deceptionPressure: z.number(),
});
export type IntelState = z.infer<typeof intelStateSchema>;

export const sustainmentStateSchema = z.object({
  depotBacklog: z.number(),
  munitionsSufficiency: z.number(),
  fuelSufficiency: z.number(),
  liftAvailability: z.number(),
});
export type SustainmentState = z.infer<typeof sustainmentStateSchema>;

export const allianceStateSchema = z.object({
  reassurance: z.number(),
  politicalAlignment: z.number(),
  partnerParticipation: z.number(),
  partnerPublicSupport: z.number(),
});
export type AllianceState = z.infer<typeof allianceStateSchema>;

export const domesticStateSchema = z.object({
  cabinetCover: z.number(),
  committeeTolerance: z.number(),
  mediaHeat: z.number(),
  publicPatience: z.number(),
});
export type DomesticState = z.infer<typeof domesticStateSchema>;

export const escalationStateSchema = z.object({
  probeTempo: z.number(),
  warningTime: z.number(),
  incidentLadder: z.number(),
  crisisSensitivity: z.number(),
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

export const resourcesSchema = z.object({
  budgetAuthority: z.number(),
  readiness: z.number(),
  politicalCapital: z.number(),
  allianceCohesion: z.number(),
  publicLegitimacy: z.number(),
  escalationPressure: z.number(),
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
});
export type ExplainabilityEntry = z.infer<typeof explainabilityEntrySchema>;

export const chiefArchetypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  directorate: directorateSchema,
  title: z.string(),
  doctrineBias: z.string(),
  temperament: z.string(),
  competence: z.number(),
  riskTolerance: z.number(),
  preferredTags: z.array(z.string()),
  concernTags: z.array(z.string()),
});
export type ChiefArchetype = z.infer<typeof chiefArchetypeSchema>;

export const burdenContributionSchema = z.object({
  directorate: directorateSchema,
  points: z.number(),
});
export type BurdenContribution = z.infer<typeof burdenContributionSchema>;

export const stateDeltaSchema = z.object({
  resources: resourcesSchema.partial(),
  forceGeneration: forceGenerationStateSchema.partial(),
  intelligence: intelStateSchema.partial(),
  sustainment: sustainmentStateSchema.partial(),
  alliance: allianceStateSchema.partial(),
  domestic: domesticStateSchema.partial(),
  escalation: escalationStateSchema.partial(),
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
  points: z.number(),
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
});
export type ChiefPositionEntry = z.infer<typeof chiefPositionEntrySchema>;
export type ChiefPosition = ChiefPositionEntry;

export const directorateBurdenSchema = z.object({
  directorate: directorateSchema,
  burdenPoints: z.number(),
  capacity: z.number(),
  burdenLevel: burdenLevelSchema,
  failureMode: z.string(),
  confidencePenalty: z.number(),
  executionPenalty: z.number(),
  summary: z.string(),
});
export type DirectorateBurden = z.infer<typeof directorateBurdenSchema>;

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
  progress: z.number(),
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
  severity: z.number(),
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

export const campaignStateSchema = z.object({
  turn: z.number().int(),
  maxTurns: z.number().int(),
  microCampaignLength: z.number().int().min(1).default(6),
  seed: z.number().int(),
  campaignStatus: z.enum(["active", "won", "lost"]).default("active"),
  campaignScore: z.number().default(0),
  campaignOutcome: z.string().nullable().default(null),
  strategic: strategicStateSchema,
  resources: resourcesSchema,
  forceGeneration: forceGenerationStateSchema,
  intel: intelStateSchema,
  sustainment: sustainmentStateSchema,
  alliance: allianceStateSchema,
  domestic: domesticStateSchema,
  escalation: escalationStateSchema,
  capabilityPrograms: z.array(capabilityProgramStateSchema),
  externalConstraints: z.array(externalConstraintStateSchema),
  internalTech: z.array(z.object({ id: z.string(), level: z.number(), progress: z.number() })).default([]),
  externalTech: z.array(z.object({
    id: z.string(),
    level: z.number(),
    progress: z.number(),
    estimate: z.object({
      estimatedLevel: z.number(),
      confidence: z.number(),
      visibility: z.enum(["RUMORED", "ESTIMATED", "KNOWN"]),
      lastVerifiedTurn: z.number().nullable(),
    }),
  })).default([]),
  chiefTrust: z.record(z.string(), z.number()),
  advisorTrust: z.record(z.string(), z.number()).default({}),
  activeEventIds: z.array(z.string()).default([]),
  eventHistory: z.array(z.string()).default([]),
  eventFlags: z.record(z.string(), z.boolean()).default({}),
  briefing: campaignBriefSchema,
});
export type CampaignState = z.infer<typeof campaignStateSchema>;

export const turnInputSchema = z.object({
  turn: z.number().int(),
  selectedActionIds: z.array(z.string()).default([]),
  selections: z.array(memoSelectionSchema),
});
export type TurnInput = z.infer<typeof turnInputSchema>;

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
  monthlyEstimate: monthlyEstimateSchema,
  directorateBurden: z.array(directorateBurdenSchema),
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
  capabilityPrograms: z.array(capabilityProgramDefinitionSchema),
  externalConstraints: z.array(externalConstraintDefinitionSchema),
  memoTemplates: z.array(decisionMemoSchema),
  events: z.array(eventDefinitionSchema),
  initialState: campaignStateSchema,
});
export type ScenarioDefinition = z.infer<typeof scenarioDefinitionSchema>;

export const gameSessionSchema = z.object({
  id: z.string(),
  saveFormatVersion: z.literal("2"),
  scenarioId: z.string(),
  contentVersion: z.string(),
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
  failureKind: z.enum(["none", "replay_hash_mismatch", "state_mismatch", "final_state_mismatch"]).default("none"),
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
): DirectorateBurden[] {
  const selectedByMemo = new Map(selections.map((selection) => [selection.memoId, selection.optionId]));
  const capacities: Record<DirectorateId, number> = {
    people: 3,
    intelligence: 3,
    operations: 4,
    sustainment: 4,
    plans: 3,
    training: 3,
  };
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

  return directorateSchema.options.map((directorate) => {
    const burdenPoints = totals[directorate];
    const capacity = capacities[directorate];
    const excess = Math.max(0, burdenPoints - capacity);
    const burdenLevel: BurdenLevel =
      excess > 1 ? "overloaded" : burdenPoints >= capacity ? "strained" : "light";

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

export function buildChiefPositions(
  chiefs: ChiefArchetype[],
  state: CampaignState,
  memo: DecisionMemo,
  option: MemoOption,
): ChiefPositionEntry[] {
  return chiefs.map((chief) => {
    const preferredMatches = option.tags.filter((tag) => chief.preferredTags.includes(tag)).length;
    const concernMatches = option.tags.filter((tag) => chief.concernTags.includes(tag)).length;
    const sponsorAffinity = chief.directorate === memo.sponsorDirectorate ? 1 : 0;
    const objectorPenalty = chief.directorate === memo.objectorDirectorate ? 1 : 0;
    const riskPenalty =
      option.tags.includes("escalatory") && chief.riskTolerance < 0.55
        ? 2
        : option.tags.includes("slow-burn") && chief.directorate === "operations"
          ? 1
          : 0;
    const score = preferredMatches * 2 + sponsorAffinity - concernMatches * 2 - objectorPenalty - riskPenalty;

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
    };
  });
}

export function summarizeState(state: CampaignState) {
  return `Turn ${state.turn}/${state.maxTurns}: ${state.strategic.forceGeneration.deployableUnits.toFixed(1)} brigades deployable, alliance alignment ${state.strategic.alliance.politicalAlignment.toFixed(0)}, cabinet cover ${state.strategic.domestic.cabinetCover.toFixed(0)}, incident ladder ${state.strategic.escalation.incidentLadder.toFixed(0)}.`;
}

export function createInitialGameSession(scenario: ScenarioDefinition): GameSession {
  const timestamp = new Date().toISOString();
  return {
    id: scenario.id,
    saveFormatVersion: "2",
    scenarioId: scenario.id,
    contentVersion: scenario.contentVersion,
    state: scenario.initialState,
    initialState: scenario.initialState,
    turnInputs: [],
    history: [],
    updatedAt: timestamp,
  };
}
