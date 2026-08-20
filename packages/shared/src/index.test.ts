import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  campaignStateSchema,
  buildAdvisorPortraitDataUri,
  buildAdvisorPortraitSvg,
  buildChiefSpriteSpec,
  buildSpritePromptText,
  chiefArchetypeSchema,
  chiefSpriteDeterministicSeed,
  defaultStaffFunctionDefinitions,
  doctrineAcceptedRiskRefSchema,
  doctrineMaturityEntrySchema,
  eventDefinitionSchema,
  gameSessionSchema,
  scenarioSummarySchema,
  spriteExpressionSchema,
  spriteRoleSchema,
  spriteSpecSchema,
  SPRITE_NEGATIVE_PROMPT,
  SPRITE_PROMPT_ROLE_LABELS,
  generateAdvisorRoster,
  relationshipLabel,
  turnResultSchema,
  type EventDefinition,
  type SpriteRole,
} from "./index";

const spriteVisualLanguage = Object.fromEntries(["S1", "S2", "S3", "S4", "S5", "training"].map((role) => [role, {
  shapeLanguage: `${role} shape`, paletteCue: "cue", accentColor: "#8fcf88", expressionBias: "bias", baseExpression: "calm", uniformLanguage: "uniform", sourceRef: "source",
}])) as any;

const spriteChief = { id: "sprite-chief", name: "Sprite Chief", genderPresentation: "female" as const, directorate: "people" as const, title: "Chief", doctrineBias: "bias", temperament: "calm", competence: 0.8, riskTolerance: 0.5, preferredTags: [], concernTags: [] };
const spritePortrait = { genderPresentation: "female" as const, skinTone: "#f0d2ba", hairColor: "#181513", eyeColor: "#202b36", uniformColor: "#2e3736", trimColor: "#8fcf88", backgroundColor: "#142129", panelColor: "#22313b", faceShape: "oval" as const, hairStyle: "bun" as const, accessory: "none" as const, browTilt: 0, mouthCurve: 0 };

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
  stateDelta: { alliance: { politicalAlignment: -18 }, domestic: { cabinetCover: -10, publicPatience: -8, mediaHeat: 5 }, resources: { politicalCapital: -4 }, forceGeneration: { reserveStrain: 16, deployableUnits: -1.5 }, escalation: { incidentLadder: 28 } },
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
    spriteVisualLanguage: {
      S1: { shapeLanguage: "s1", paletteCue: "green", accentColor: "#8fcf88", expressionBias: "calm", baseExpression: "calm", uniformLanguage: "uniform", sourceRef: "source" },
      S2: { shapeLanguage: "s2", paletteCue: "blue", accentColor: "#78c4d4", expressionBias: "skeptical", baseExpression: "skeptical", uniformLanguage: "uniform", sourceRef: "source" },
      S3: { shapeLanguage: "s3", paletteCue: "amber", accentColor: "#e2b36c", expressionBias: "urgent", baseExpression: "urgent", uniformLanguage: "uniform", sourceRef: "source" },
      S4: { shapeLanguage: "s4", paletteCue: "red", accentColor: "#d68d77", expressionBias: "calm", baseExpression: "calm", uniformLanguage: "uniform", sourceRef: "source" },
      S5: { shapeLanguage: "s5", paletteCue: "indigo", accentColor: "#8ea4d6", expressionBias: "calm", baseExpression: "calm", uniformLanguage: "uniform", sourceRef: "source" },
      training: { shapeLanguage: "training", paletteCue: "teal", accentColor: "#79c6ae", expressionBias: "calm", baseExpression: "calm", uniformLanguage: "uniform", sourceRef: "source" },
    },
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

const canonicalSpritePrompt =
  "Military staff advisor portrait for a strategic command simulation, S1 Personnel, Sprite Chief, calm, calm, restrained editorial game art, clean bust portrait, readable at small size, consistent uniform silhouette, muted palette, no photorealism, no fantasy armor, no weapons, neutral command-room background.";

test("chief archetypes reject empty temperaments at scenario parse time", () => {
  assert.throws(() => chiefArchetypeSchema.parse({ ...spriteChief, temperament: "" }), /too_small/);
  assert.throws(() => scenarioSummarySchema.parse({ ...baseScenarioSummary([ordinaryEvent]), chiefs: [{ ...spriteChief, temperament: "" }] }), /too_small/);
});

test("chief sprite derivation is deterministic and preserves legacy SVG bytes", () => {
  const input = { chief: spriteChief, portrait: spritePortrait, sessionSeed: "session-a", trustBand: "steady" as const, burdenLevel: "light" as const, campaignStatus: "active" as const, visualLanguage: spriteVisualLanguage };
  const sprite = buildChiefSpriteSpec(input);
  const legacySvg = buildAdvisorPortraitSvg(spritePortrait);
  assert.equal(buildAdvisorPortraitSvg(sprite), legacySvg);
  assert.equal(buildAdvisorPortraitDataUri(sprite), `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(legacySvg)}`);
  assert.equal(sprite.expression, "calm");
  assert.equal(sprite.temperament, "calm", "temperament is copied verbatim from the chief");
  assert.equal(sprite.prompt, canonicalSpritePrompt, "positive prompt must match the roadmap template byte-for-byte");
  assert.equal(sprite.negativePrompt, SPRITE_NEGATIVE_PROMPT, "negative prompt is the exact roadmap constant");
  assert.equal(sprite.deterministicSeed, chiefSpriteDeterministicSeed("session-a", "sprite-chief"));
  assert.deepEqual(sprite.palette, [spritePortrait.skinTone, spritePortrait.hairColor, spritePortrait.eyeColor, spritePortrait.uniformColor, spritePortrait.trimColor, spritePortrait.backgroundColor, spritePortrait.panelColor], "palette must preserve the 7 legacy colors in canonical order");
  assert.throws(() => chiefSpriteDeterministicSeed("", "sprite-chief"), /sessionSeed/);
  assert.throws(() => chiefSpriteDeterministicSeed("session-a", ""), /chiefId/);
});

test("SpriteSpec strict validation retains legacy fields and rejects incomplete or unknown payloads", () => {
  const sprite = buildChiefSpriteSpec({ chief: spriteChief, portrait: spritePortrait, sessionSeed: "session-a", trustBand: "steady", burdenLevel: "light", campaignStatus: "active", visualLanguage: spriteVisualLanguage });
  assert.deepEqual(Object.keys(sprite).sort(), ["accessory", "backgroundColor", "browTilt", "deterministicSeed", "displayName", "eyeColor", "expression", "faceShape", "genderPresentation", "hairColor", "hairStyle", "id", "mouthCurve", "negativePrompt", "palette", "panelColor", "prompt", "role", "skinTone", "subjectType", "temperament", "trimColor", "trustBand", "uniform", "uniformColor", "silhouette"].sort());
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, unknown: true }));
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, prompt: undefined }));
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, prompt: "" }), /too_small/);
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, negativePrompt: "" }), /too_small/);
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, temperament: undefined }));
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, temperament: "" }), /too_small/);
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, palette: [] }));
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, expression: "severe" }));
});

test("role labels are exhaustive, frozen, and match the staff-function vocabulary", () => {
  assert.deepEqual(Object.keys(SPRITE_PROMPT_ROLE_LABELS).sort(), spriteRoleSchema.options.slice().sort(), "exhaustive over every SpriteRole");
  for (const role of spriteRoleSchema.options) {
    if (role === "training") {
      assert.equal(SPRITE_PROMPT_ROLE_LABELS[role], "Training", "training is an authored extension, not an S-function");
    } else {
      const definition = defaultStaffFunctionDefinitions.find((entry) => entry.id === role);
      assert.ok(definition, `staff function definition exists for ${role}`);
      assert.equal(SPRITE_PROMPT_ROLE_LABELS[role], `${definition!.shortLabel} ${definition!.label}`, `${role} label must track the shared staff-function vocabulary`);
    }
  }
  assert.equal(Object.isFrozen(SPRITE_PROMPT_ROLE_LABELS), true, "role labels are frozen at runtime");
  assert.throws(() => {
    (SPRITE_PROMPT_ROLE_LABELS as Record<SpriteRole, string>).S1 = "Mutated";
  }, TypeError, "frozen table rejects runtime mutation");
});

test("prompt fill is exhaustive, exact, and distinct across all roles and expressions", () => {
  const displayName = "Fixed Chief";
  const temperament = "fixed temperament";
  const expectedPrompt = (role: SpriteRole, expression: string) =>
    "Military staff advisor portrait for a strategic command simulation, " +
    `${SPRITE_PROMPT_ROLE_LABELS[role]}, ${displayName}, ` +
    `${temperament}, ${expression}, ` +
    "restrained editorial game art, clean bust portrait, readable at small size, " +
    "consistent uniform silhouette, muted palette, no photorealism, no fantasy armor, " +
    "no weapons, neutral command-room background.";
  const prompts: string[] = [];
  for (const role of spriteRoleSchema.options) {
    for (const expression of spriteExpressionSchema.options) {
      const result = buildSpritePromptText({ role, displayName, temperament, expression });
      assert.equal(result.prompt, expectedPrompt(role, expression), `${role}/${expression} prompt must match the template exactly`);
      assert.equal(result.negativePrompt, SPRITE_NEGATIVE_PROMPT, "negative prompt is constant");
      prompts.push(result.prompt);
    }
  }
  assert.equal(prompts.length, 30);
  assert.equal(new Set(prompts).size, 30, "all 30 role/expression prompts are distinct");
});

test("only the four source fields change the prompt; visual fields never do", () => {
  const base = { chief: spriteChief, portrait: spritePortrait, sessionSeed: "session-a", trustBand: "steady" as const, burdenLevel: "light" as const, campaignStatus: "active" as const, visualLanguage: spriteVisualLanguage };
  const baseline = buildChiefSpriteSpec(base);
  const differentName = buildChiefSpriteSpec({ ...base, chief: { ...spriteChief, name: "Renamed Chief" } });
  assert.notEqual(differentName.prompt, baseline.prompt);
  assert.equal(differentName.prompt.replace("Renamed Chief", "Sprite Chief"), baseline.prompt, "only the display-name segment changed");
  assert.equal(differentName.negativePrompt, baseline.negativePrompt);

  const differentTemperament = buildChiefSpriteSpec({ ...base, chief: { ...spriteChief, temperament: "unflappable" } });
  assert.notEqual(differentTemperament.prompt, baseline.prompt);
  assert.equal(differentTemperament.prompt.replace("unflappable", "calm"), baseline.prompt, "only the temperament segment changed");

  const differentExpression = buildChiefSpriteSpec({ ...base, campaignStatus: "won" });
  assert.equal(differentExpression.expression, "resolved");
  assert.notEqual(differentExpression.prompt, baseline.prompt);
  assert.ok(differentExpression.prompt.endsWith("resolved, restrained editorial game art, clean bust portrait, readable at small size, consistent uniform silhouette, muted palette, no photorealism, no fantasy armor, no weapons, neutral command-room background."));
  assert.equal(differentExpression.prompt.replace("resolved", "calm"), baseline.prompt, "only the expression segment changed");

  // Silhouette/palette/uniform/trust changes must not leak into prompt text.
  const visuallyDifferent = buildChiefSpriteSpec({
    ...base,
    trustBand: "watchful",
    portrait: { ...spritePortrait, uniformColor: "#000000", trimColor: "#ffffff" },
    visualLanguage: { ...spriteVisualLanguage, S1: { ...spriteVisualLanguage.S1, shapeLanguage: "changed shape", uniformLanguage: "changed uniform" } },
  });
  assert.equal(visuallyDifferent.expression, "calm", "watchful trust must not trigger precedence");
  assert.equal(visuallyDifferent.prompt, baseline.prompt, "prompt ignores silhouette, palette, uniform, and trust");
});

test("sprite derivation is deterministic across equivalent deep-cloned inputs", () => {
  const input = { chief: spriteChief, portrait: spritePortrait, sessionSeed: "session-a", trustBand: "steady" as const, burdenLevel: "light" as const, campaignStatus: "active" as const, visualLanguage: spriteVisualLanguage };
  const first = buildChiefSpriteSpec(structuredClone(input));
  const second = buildChiefSpriteSpec(structuredClone(input));
  assert.deepEqual(first, second);
  assert.deepEqual(input, { chief: spriteChief, portrait: spritePortrait, sessionSeed: "session-a", trustBand: "steady" as const, burdenLevel: "light" as const, campaignStatus: "active" as const, visualLanguage: spriteVisualLanguage }, "inputs are not mutated");
});

test("trust thresholds and expression precedence are total", () => {
  assert.deepEqual([43, 44, 57, 58, 71, 72].map((trust) => relationshipLabel(trust)), ["strained", "watchful", "watchful", "steady", "steady", "solid"]);
  const base = { chief: spriteChief, portrait: spritePortrait, sessionSeed: "session-a", trustBand: "steady" as const, burdenLevel: "light" as const, campaignStatus: "active" as const, visualLanguage: spriteVisualLanguage };
  assert.equal(buildChiefSpriteSpec({ ...base, campaignStatus: "won" }).expression, "resolved");
  assert.equal(buildChiefSpriteSpec({ ...base, campaignStatus: "lost" }).expression, "strained");
  assert.equal(buildChiefSpriteSpec({ ...base, burdenLevel: "overloaded" }).expression, "strained");
  assert.equal(buildChiefSpriteSpec({ ...base, trustBand: "strained" }).expression, "skeptical");
  assert.equal(buildChiefSpriteSpec({ ...base, burdenLevel: "strained" }).expression, "strained");
});

test("S2 and S3 authored base expressions win for neutral input (fall-through precedence)", () => {
  const biasedLanguage = {
    ...spriteVisualLanguage,
    S2: { ...spriteVisualLanguage.S2, baseExpression: "skeptical" },
    S3: { ...spriteVisualLanguage.S3, baseExpression: "urgent" },
  } as any;
  const neutral = { portrait: spritePortrait, sessionSeed: "session-a", trustBand: "steady" as const, burdenLevel: "light" as const, campaignStatus: "active" as const };
  const s2Chief = { ...spriteChief, id: "s2-chief", directorate: "intelligence" as const };
  const s3Chief = { ...spriteChief, id: "s3-chief", directorate: "operations" as const };
  assert.equal(buildChiefSpriteSpec({ ...neutral, chief: s2Chief, visualLanguage: biasedLanguage }).expression, "skeptical");
  assert.equal(buildChiefSpriteSpec({ ...neutral, chief: s3Chief, visualLanguage: biasedLanguage }).expression, "urgent");
});

test("roster identity is order-independent and sprite derivation does not mutate sessions", () => {
  const chiefs = [spriteChief, { ...spriteChief, id: "other", name: "Other Chief" }];
  const first = generateAdvisorRoster(chiefs, "order-session");
  const second = generateAdvisorRoster([...chiefs].reverse(), "order-session");
  assert.deepEqual(Object.fromEntries(first.map((entry) => [entry.chiefId, entry.portrait])), Object.fromEntries(second.map((entry) => [entry.chiefId, entry.portrait])));
  const session = { id: "nonmutation-session", advisorRoster: [{ portrait: spritePortrait }], state: { campaignStatus: "active" } } as any;
  const snapshot = JSON.stringify(session);
  buildChiefSpriteSpec({ chief: spriteChief, portrait: session.advisorRoster[0].portrait, sessionSeed: session.id, trustBand: "steady", burdenLevel: "light", campaignStatus: session.state.campaignStatus, visualLanguage: spriteVisualLanguage });
  assert.equal(JSON.stringify(session), snapshot);
  const forbidden = ["prompt", "negativePrompt", "promptHash", "negativePromptHash", "deterministicSeed", "temperament"];
  const keys: string[] = [];
  const collect = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(collect);
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        keys.push(key);
        collect(child);
      }
    }
  };
  collect(session);
  for (const key of forbidden) {
    assert.equal(keys.includes(key), false, `session must not gain sprite-only key ${key}`);
  }
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

test("gameSessionSchema parses a legacy-only v6 session roster (no sprite fields stored)", () => {
  const parsed = gameSessionSchema.parse({
    id: "00000000-0000-0000-0000-000000000001",
    saveFormatVersion: "6",
    engineVersion: "0.1.0",
    revision: 0,
    scenarioId: "test-scenario",
    contentVersion: "0.10.0",
    advisorRoster: [{ chiefId: "chief-1", displayName: "Chief One", title: "Chief of Plans", directorate: "plans", genderPresentation: "female", portrait: spritePortrait }],
    state: validState(),
    initialState: validState(),
    turnInputs: [],
    history: [],
    updatedAt: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(parsed.advisorRoster.length, 1);
  assert.equal(parsed.advisorRoster[0].portrait.skinTone, spritePortrait.skinTone);
  assert.equal("deterministicSeed" in parsed.advisorRoster[0].portrait, false, "sprite-only fields must never be stored on a session portrait");
});
