import { z } from "zod";
export const resourcesSchema = z.object({
    budgetAuthority: z.number(),
    readiness: z.number(),
    politicalCapital: z.number(),
    allianceCohesion: z.number(),
    publicLegitimacy: z.number(),
    escalationPressure: z.number(),
});
export const portfolioSchema = z.enum(["S1", "S2", "S3", "S4", "S5"]);
export const visibilitySchema = z.enum(["RUMORED", "ESTIMATED", "KNOWN"]);
export const contributorSchema = z.object({
    label: z.string(),
    value: z.number(),
});
export const explainabilityEntrySchema = z.object({
    nodeId: z.string(),
    deltaLevel: z.number(),
    deltaProgress: z.number(),
    visibilityBefore: visibilitySchema.optional(),
    visibilityAfter: visibilitySchema.optional(),
    confidenceBefore: z.number().optional(),
    confidenceAfter: z.number().optional(),
    lockedByGate: z.boolean().default(false),
    topPositiveContributors: z.array(contributorSchema),
    topBlockers: z.array(contributorSchema),
    summary: z.string(),
});
export const techDependencySchema = z.object({
    nodeId: z.string(),
    requiredLevel: z.number().int().min(1).max(5),
});
export const internalTechNodeDefinitionSchema = z.object({
    id: z.string(),
    label: z.string(),
    domain: z.string(),
    description: z.string(),
    beta: z.number(),
    decay: z.number(),
    gateThreshold: z.number(),
    internalPrerequisites: z.array(techDependencySchema),
    externalPrerequisites: z.array(techDependencySchema),
    essential: z.boolean().default(false),
});
export const externalTechNodeDefinitionSchema = z.object({
    id: z.string(),
    label: z.string(),
    domain: z.string(),
    description: z.string(),
    alpha: z.number(),
    scale: z.number(),
    maxUp: z.number(),
    maxDown: z.number(),
    baseError: z.number(),
});
export const techEstimateSchema = z.object({
    estimatedLevel: z.number(),
    confidence: z.number(),
    visibility: visibilitySchema,
    lastVerifiedTurn: z.number().nullable(),
});
export const techNodeStateSchema = z.object({
    id: z.string(),
    level: z.number(),
    progress: z.number(),
});
export const externalTechStateSchema = techNodeStateSchema.extend({
    estimate: techEstimateSchema,
});
export const advisorArchetypeSchema = z.object({
    id: z.string(),
    name: z.string(),
    portfolio: portfolioSchema,
    doctrineBias: z.string(),
    competence: z.number(),
    loyalty: z.number(),
    ambition: z.number(),
    riskTolerance: z.number(),
    preferredDomains: z.array(z.string()),
});
export const advisorRecommendationSchema = z.object({
    advisorId: z.string(),
    portfolio: portfolioSchema,
    title: z.string(),
    rationale: z.string(),
    confidence: z.number(),
    politicalEffect: z.number(),
    relationshipEffect: z.number(),
    recommendedActions: z.array(z.string()),
    objections: z.array(z.string()),
    followUp: z.string(),
});
export const actionOrderSchema = z.object({
    id: z.string(),
    portfolio: portfolioSchema,
    label: z.string(),
    targetNodeId: z.string().nullable(),
    budgetCost: z.number(),
    actionPointsCost: z.number(),
    readinessEffect: z.number().default(0),
    politicalEffect: z.number().default(0),
    legitimacyEffect: z.number().default(0),
    allianceEffect: z.number().default(0),
    escalationEffect: z.number().default(0),
    intelligenceEffect: z.number().default(0),
    executionRisk: z.number().default(0),
    tags: z.array(z.string()).default([]),
});
export const eventDefinitionSchema = z.object({
    id: z.string(),
    title: z.string(),
    summary: z.string(),
    triggerTags: z.array(z.string()),
    weight: z.number(),
    budgetDelta: z.number().default(0),
    readinessDelta: z.number().default(0),
    politicalDelta: z.number().default(0),
    legitimacyDelta: z.number().default(0),
    allianceDelta: z.number().default(0),
    escalationDelta: z.number().default(0),
    affectedExternalNodeId: z.string().nullable(),
    shock: z.number().default(0),
});
export const campaignBriefSchema = z.object({
    theater: z.string(),
    monthLabel: z.string(),
    budgetHeadline: z.string(),
    readinessHeadline: z.string(),
    geopoliticalSummary: z.string(),
});
export const campaignStateSchema = z.object({
    turn: z.number().int(),
    maxTurns: z.number().int(),
    seed: z.number().int(),
    resources: resourcesSchema,
    actionPoints: z.number(),
    internalTech: z.array(techNodeStateSchema),
    externalTech: z.array(externalTechStateSchema),
    advisorTrust: z.record(z.string(), z.number()),
    activeEventIds: z.array(z.string()),
    briefing: campaignBriefSchema,
});
export const turnInputSchema = z.object({
    turn: z.number().int(),
    selectedActionIds: z.array(z.string()),
});
export const turnResultSchema = z.object({
    previousState: campaignStateSchema,
    nextState: campaignStateSchema,
    chosenActions: z.array(actionOrderSchema),
    recommendations: z.array(advisorRecommendationSchema),
    triggeredEvents: z.array(eventDefinitionSchema),
    explainability: z.array(explainabilityEntrySchema),
    replayHash: z.string(),
    summary: z.string(),
});
export const scenarioDefinitionSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    maxTurns: z.number().int(),
    contentVersion: z.string(),
    initialState: campaignStateSchema,
    internalTechDefinitions: z.array(internalTechNodeDefinitionSchema),
    externalTechDefinitions: z.array(externalTechNodeDefinitionSchema),
    actions: z.array(actionOrderSchema),
    advisors: z.array(advisorArchetypeSchema),
    events: z.array(eventDefinitionSchema),
});
export const gameSessionSchema = z.object({
    scenarioId: z.string(),
    contentVersion: z.string(),
    state: campaignStateSchema,
    history: z.array(turnResultSchema),
});
//# sourceMappingURL=index.js.map