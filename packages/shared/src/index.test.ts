import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  campaignStateSchema,
  doctrineAcceptedRiskRefSchema,
  doctrineMaturityEntrySchema,
  eventDefinitionSchema,
  gameSessionSchema,
  scenarioSummarySchema,
  turnResultSchema,
  type EventDefinition,
} from "./index";

const coalitionEvent = {
  id: "doctrine-coalition-caveat-exposure",
  title: "Partner caveats become an exposure",
  summary: "A visible commitment reaches the staff faster than policy, legal, media, and partner caveats can be reconciled; partners hedge and the cabinet absorbs the contradiction.",
  minTurn: 2,
  maxTurn: 11,
  triggerTags: ["public-commitment"],
  requiredFlags: [],
  excludedFlags: [],
  setsFlags: ["doctrine_coalition_caveat_exposed"],
  clearsFlags: [],
  stateDelta: { alliance: { politicalAlignment: -4, partnerPublicSupport: -3 }, domestic: { cabinetCover: -3, mediaHeat: 4 } },
  constraintShifts: [],
  doctrineTrigger: {
    sourceGeneId: "coalition-native-staff",
    sourceGeneLabel: "Coalition-Native Staff",
    patternId: "deception",
    vulnerability: "More policy, legal, media, and partner caveat constraints on every commitment",
    evidenceRefs: ["CELERY/doctrine-proof-register#NATO AJP-3 Staff Directorate Baseline", "CELERY/doctrine-proof-register#UK PJHQ Staff Responsibilities"],
    conditions: [{ variable: "signatureControl", comparison: "lte", threshold: 35 }],
    sustainedTurns: 2,
  },
  causalContext: { betLabel: "Repeated visible coalition commitments before caveats were reconciled", maturedRiskLabel: "Signature control stayed at or below 35 for two commitment turns", staffFunctionRefs: ["S2", "S5"] },
};

const adaptiveEvent = {
  id: "doctrine-adaptive-cell-sprawl",
  title: "Competing cells neglect the line",
  summary: "Temporary cells proliferate across the headquarters until no lane owns the handoff; training and readiness pay for a main effort that never became clear.",
  minTurn: 2,
  maxTurn: 11,
  triggerTags: ["program", "modernization"],
  requiredFlags: [],
  excludedFlags: [],
  setsFlags: ["doctrine_adaptive_cells_sprawled"],
  clearsFlags: [],
  stateDelta: { forceGeneration: { trainingThroughput: -4 }, resources: { readiness: -3 } },
  constraintShifts: [],
  doctrineTrigger: {
    sourceGeneId: "adaptive-cell-staff",
    sourceGeneLabel: "Adaptive Cell Staff",
    patternId: "main-effort",
    vulnerability: "Coordination cost rises when too many temporary cells compete for attention",
    evidenceRefs: ["CELERY/doctrine-proof-register#Netherlands No Pure Staff Structure", "CELERY/doctrine-proof-register#Netherlands Chief Of Staff Role"],
    conditions: [{ variable: "mainEffortFocus", comparison: "lte", threshold: 30 }],
    sustainedTurns: 2,
  },
  causalContext: { betLabel: "Repeated multi-lane modernization through temporary cross-functional cells", maturedRiskLabel: "Main-effort focus stayed at or below 30 for two cell-building turns", staffFunctionRefs: ["S1", "S3", "S5"] },
};

const sustainmentEvent = {
  id: "doctrine-sustainment-patience-gap",
  title: "The patience gap becomes policy blowback",
  summary: "The headquarters keeps waiting for a fully supportable posture while the public and cabinet demand visible action; political room contracts around an otherwise sound sustainment plan.",
  minTurn: 3,
  maxTurn: 11,
  triggerTags: ["slow-burn"],
  requiredFlags: [],
  excludedFlags: [],
  setsFlags: ["doctrine_sustainment_patience_blowback"],
  clearsFlags: [],
  stateDelta: { domestic: { cabinetCover: -10, publicPatience: -10, mediaHeat: 6 }, resources: { politicalCapital: -6 } },
  constraintShifts: [],
  doctrineTrigger: {
    sourceGeneId: "sustainment-first-operational-reach",
    sourceGeneLabel: "Sustainment-First Operational Reach",
    patternId: "tempo",
    vulnerability: "Slower visible posture; political frustration when the public wants immediate action",
    evidenceRefs: ["CELERY/doctrine-proof-register#US Army ADP 4-0 Sustainment", "CELERY/doctrine-proof-register#Sustainment Warfighting Function Elements"],
    conditions: [{ variable: "relativeTempo", comparison: "lte", threshold: 30 }],
    sustainedTurns: 3,
  },
  causalContext: { betLabel: "Repeated slow-burn sequencing until supportability was earned", maturedRiskLabel: "Relative tempo stayed at or below 30 for three slow-burn turns", staffFunctionRefs: ["S4", "S5"] },
};

const ordinaryEvent = {
  id: "shipping-jam",
  title: "Shipping jam",
  summary: "Congestion at regional ports tightens commercial lift capacity.",
  minTurn: 2,
  maxTurn: 6,
  triggerTags: ["lift", "public-commitment"],
  requiredFlags: [],
  excludedFlags: [],
  setsFlags: ["shipping_jam"],
  clearsFlags: [],
  stateDelta: { sustainment: { liftAvailability: -7, depotBacklog: 4 }, escalation: { incidentLadder: 1 } },
  constraintShifts: [],
};

function baseScenarioSummary(events: EventDefinition[]) {
  return {
    id: "test-scenario",
    title: "Test scenario",
    description: "Fixture",
    contentVersion: "0.10.0",
    maxTurns: 12,
    chiefs: [
      { id: "chief-1", name: "Chief One", genderPresentation: "female", directorate: "plans", title: "Chief of Plans", doctrineBias: "bias", temperament: "calm", competence: 0.8, riskTolerance: 0.5, preferredTags: ["program"], concernTags: ["hollow"] },
    ],
    capabilityPrograms: [{ id: "program-1", label: "Program One", summary: "A program", absorbingDirectorate: "plans", payoff: "payoff", fragility: "fragility", preferredTags: ["program"] }],
    externalConstraints: [{ id: "constraint-1", label: "Constraint One", summary: "A constraint" }],
    events,
  };
}

test("ordinary events without doctrine fields parse unchanged", () => {
  const parsed = eventDefinitionSchema.parse(ordinaryEvent);
  assert.equal(parsed.doctrineTrigger, undefined);
  assert.equal(parsed.causalContext, undefined);
});

test("complete doctrine events parse with exact state deltas (all three shipped events)", () => {
  for (const raw of [coalitionEvent, adaptiveEvent, sustainmentEvent]) {
    const parsed = eventDefinitionSchema.parse(raw);
    assert.ok(parsed.doctrineTrigger);
    assert.ok(parsed.causalContext);
    assert.deepEqual(parsed.stateDelta, raw.stateDelta);
  }
});

test("doctrineTrigger without causalContext is rejected and vice versa", () => {
  assert.throws(() => eventDefinitionSchema.parse({ ...coalitionEvent, causalContext: undefined }), /must appear together/);
  assert.throws(() => eventDefinitionSchema.parse({ ...coalitionEvent, doctrineTrigger: undefined }), /must appear together/);
});

test("unknown doctrine keys including supportableTempo are rejected", () => {
  assert.throws(() =>
    eventDefinitionSchema.parse({
      ...coalitionEvent,
      doctrineTrigger: { ...coalitionEvent.doctrineTrigger, conditions: [{ variable: "supportableTempo", comparison: "lte", threshold: 30 }] },
    }),
  );
});

test("bad comparison, threshold outside 0-100, sustainedTurns outside 2-4, empty evidence are rejected", () => {
  assert.throws(() =>
    eventDefinitionSchema.parse({
      ...coalitionEvent,
      doctrineTrigger: { ...coalitionEvent.doctrineTrigger, conditions: [{ variable: "signatureControl", comparison: "lt", threshold: 35 }] },
    }),
  );
  assert.throws(() =>
    eventDefinitionSchema.parse({
      ...coalitionEvent,
      doctrineTrigger: { ...coalitionEvent.doctrineTrigger, conditions: [{ variable: "signatureControl", comparison: "lte", threshold: 101 }] },
    }),
  );
  assert.throws(() =>
    eventDefinitionSchema.parse({
      ...coalitionEvent,
      doctrineTrigger: { ...coalitionEvent.doctrineTrigger, conditions: [{ variable: "signatureControl", comparison: "lte", threshold: -1 }] },
    }),
  );
  assert.throws(() =>
    eventDefinitionSchema.parse({
      ...coalitionEvent,
      doctrineTrigger: { ...coalitionEvent.doctrineTrigger, sustainedTurns: 1 },
    }),
  );
  assert.throws(() =>
    eventDefinitionSchema.parse({
      ...coalitionEvent,
      doctrineTrigger: { ...coalitionEvent.doctrineTrigger, sustainedTurns: 5 },
    }),
  );
  assert.throws(() =>
    eventDefinitionSchema.parse({
      ...coalitionEvent,
      doctrineTrigger: { ...coalitionEvent.doctrineTrigger, evidenceRefs: [] },
    }),
  );
});

test("unknown nested keys and invalid staff refs are rejected", () => {
  assert.throws(() =>
    eventDefinitionSchema.parse({
      ...coalitionEvent,
      doctrineTrigger: { ...coalitionEvent.doctrineTrigger, conditions: [{ variable: "signatureControl", comparison: "lte", threshold: 35, extra: true }] },
    }),
  );
  assert.throws(() =>
    eventDefinitionSchema.parse({
      ...coalitionEvent,
      causalContext: { ...coalitionEvent.causalContext, staffFunctionRefs: ["S6"] },
    }),
  );
  assert.throws(() =>
    eventDefinitionSchema.parse({
      ...coalitionEvent,
      doctrineTrigger: { ...coalitionEvent.doctrineTrigger, extraKey: "nope" },
    }),
  );
});

test("maturity entries round-trip with accepted risks", () => {
  const entry = doctrineMaturityEntrySchema.parse({
    consecutiveTurns: 2,
    startedTurn: 1,
    acceptedRiskRefs: [
      { turn: 1, staffFunctionId: "S4", warningText: "Sustainment cannot support the visible tempo." },
      { turn: 2, staffFunctionId: "S5", warningText: "The alliance frame is overpromised." },
    ],
  });
  assert.equal(entry.consecutiveTurns, 2);
  assert.equal(entry.acceptedRiskRefs.length, 2);
  const ref = doctrineAcceptedRiskRefSchema.parse({ turn: 2, staffFunctionId: "S5", warningText: "w" });
  assert.equal(ref.staffFunctionId, "S5");
  assert.throws(() => doctrineAcceptedRiskRefSchema.parse({ turn: 2, staffFunctionId: "S9", warningText: "w" }));
});

function validState(overrides: Record<string, unknown> = {}) {
  const metric = { collectionCoverage: 50, confidence: 50, warningReliability: 50, deceptionPressure: 50 };
  const forceGeneration = { deployableUnits: 5, reserveStrain: 50, trainingThroughput: 50, personnelShortfalls: 50 };
  const sustainment = { depotBacklog: 50, munitionsSufficiency: 50, fuelSufficiency: 50, liftAvailability: 50 };
  const alliance = { reassurance: 50, politicalAlignment: 50, partnerParticipation: 50, partnerPublicSupport: 50 };
  const domestic = { cabinetCover: 50, committeeTolerance: 50, mediaHeat: 50, publicPatience: 50 };
  const escalation = { probeTempo: 50, warningTime: 50, incidentLadder: 50, crisisSensitivity: 50 };
  return campaignStateSchema.parse({
    turn: 1,
    maxTurns: 12,
    campaignStatus: "active",
    campaignOutcome: null,
    campaignScore: 0,
    seed: 1,
    strategic: { forceGeneration, intelligence: metric, sustainment, alliance, domestic, escalation },
    doctrineMaturity: {},
    resources: { budgetAuthority: 50, readiness: 50, politicalCapital: 50, allianceCohesion: 50, publicLegitimacy: 50, escalationPressure: 50 },
    forceGeneration,
    intel: metric,
    sustainment,
    alliance,
    domestic,
    escalation,
    capabilityPrograms: [],
    externalConstraints: [],
    internalTech: [],
    externalTech: [],
    chiefTrust: {},
    chiefAgendaMemory: {},
    activeCommitments: [],
    conversationHistory: [],
    eventHistory: [],
    eventFlags: {},
    briefing: {
      theater: "theater",
      monthLabel: "Month 1",
      situationSummary: "situation",
      riskPosture: "risk",
      commandersIntent: "intent",
      operationalPicture: "picture",
      decisionFocus: "focus",
      openQuestions: [],
      campaignObjectives: [],
      budgetHeadline: "",
      readinessHeadline: "",
      geopoliticalSummary: "",
    },
    ...overrides,
  });
}

test("campaign state omitted doctrineMaturity defaults to {}", () => {
  const parsed = campaignStateSchema.parse({ ...validState(), doctrineMaturity: undefined });
  assert.deepEqual(parsed.doctrineMaturity, {});
});

test("doctrine metadata parses inside scenario summary and arrays (superRefine propagates)", () => {
  const summary = scenarioSummarySchema.parse(baseScenarioSummary([ordinaryEvent, coalitionEvent, adaptiveEvent, sustainmentEvent]));
  assert.equal(summary.events.length, 4);
  assert.ok(summary.events.every((event) => Boolean(event.doctrineTrigger) === Boolean(event.causalContext)));
  assert.ok(summary.doctrineLens);

  const array = z.array(eventDefinitionSchema).parse([ordinaryEvent, sustainmentEvent]);
  assert.equal(array.length, 2);
  assert.throws(() => z.array(eventDefinitionSchema).parse([{ ...coalitionEvent, causalContext: undefined }]), /must appear together/);
});

test("turnResultSchema accepts a doctrine event in triggeredEvents", () => {
  const state = validState();
  const estimate = { chiefsPaperTitle: "t", chiefsPaperSummary: "s", chiefsPaperBullets: [], uncertainty: "low", commandersEstimate: "ce" };
  const result = {
    input: { turn: 1, selectedActionIds: [], acceptedRiskOverrides: [], staffNegotiations: [], selections: [] },
    previousState: state,
    nextState: validState({ turn: 2 }),
    recommendations: [],
    advisoryPaper: { title: "t", synopsis: "s", bullets: [], uncertainty: "low" },
    commandersEstimate: "ce",
    memos: [],
    chiefPositions: [],
    chiefCoalitions: [],
    monthlyEstimate: estimate,
    directorateBurden: [],
    staffFunctions: [],
    explainability: [],
    portfolioLoad: [],
    triggeredEvents: [coalitionEvent],
    afterAction: [],
    acceptedRisks: [],
    internalTech: [],
    externalTech: [],
    replayHash: "hash",
    summary: "summary",
  };
  const parsed = turnResultSchema.parse(result);
  assert.equal(parsed.triggeredEvents.length, 1);
  assert.equal(parsed.triggeredEvents[0].id, "doctrine-coalition-caveat-exposure");
});

test("gameSessionSchema round-trips a mid-streak doctrineMaturity state", () => {
  const session = {
    id: "00000000-0000-0000-0000-000000000000",
    saveFormatVersion: "6",
    engineVersion: "0.1.0",
    revision: 0,
    scenarioId: "test-scenario",
    contentVersion: "0.10.0",
    advisorRoster: [],
    state: validState({ doctrineMaturity: { "doctrine-sustainment-patience-gap": { consecutiveTurns: 2, startedTurn: 1, acceptedRiskRefs: [{ turn: 1, staffFunctionId: "S4", warningText: "w" }] } } }),
    initialState: validState(),
    turnInputs: [],
    history: [],
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
  const parsed = gameSessionSchema.parse(session);
  assert.equal(parsed.state.doctrineMaturity["doctrine-sustainment-patience-gap"]?.consecutiveTurns, 2);
  assert.equal(parsed.state.doctrineMaturity["doctrine-sustainment-patience-gap"]?.startedTurn, 1);
  assert.equal(parsed.state.doctrineMaturity["doctrine-sustainment-patience-gap"]?.acceptedRiskRefs.length, 1);
});
