import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  campaignStateSchema,
  buildAdvisorPortraitDataUri,
  buildAdvisorPortraitSvg,
  buildChiefSpriteSpec,
  buildChiefSpriteVariant,
  buildSpritePromptText,
  chiefArchetypeSchema,
  chiefSpriteDeterministicSeed,
  chiefSpriteVariantStateSchema,
  defaultStaffFunctionDefinitions,
  defaultStaffMechanicsState,
  doctrineAcceptedRiskRefSchema,
  doctrineMaturityEntrySchema,
  eventDefinitionSchema,
  gameSessionSchema,
  scenarioSummarySchema,
  spriteExpressionSchema,
  spriteRenderVariantSchema,
  spriteRoleSchema,
  spriteSpecSchema,
  spriteVariantEffectSchema,
  SPRITE_EXPRESSION_VISUALS,
  SPRITE_NEGATIVE_PROMPT,
  SPRITE_PROMPT_ROLE_LABELS,
  generateAdvisorRoster,
  relationshipLabel,
  turnResultSchema,
  type ChiefSpriteVariantState,
  type EventDefinition,
  type SpriteRole,
} from "./index";

const spriteVisualLanguage = Object.fromEntries(["S1", "S2", "S3", "S4", "S5", "training"].map((role) => [role, {
  shapeLanguage: `${role} shape`, paletteCue: "cue", accentColor: "#8fcf88", expressionBias: "bias", baseExpression: "calm", uniformLanguage: "uniform", sourceRef: "source",
}])) as any;

const spriteChief = { id: "sprite-chief", name: "Sprite Chief", genderPresentation: "female" as const, directorate: "people" as const, title: "Chief", doctrineBias: "bias", temperament: "calm", competence: 0.8, riskTolerance: 0.5, preferredTags: [], concernTags: [] };
const spritePortrait = { genderPresentation: "female" as const, skinTone: "#f0d2ba", hairColor: "#181513", eyeColor: "#202b36", uniformColor: "#2e3736", trimColor: "#8fcf88", backgroundColor: "#142129", panelColor: "#22313b", faceShape: "oval" as const, hairStyle: "bun" as const, accessory: "none" as const, browTilt: 0, mouthCurve: 0 };

/**
 * Deliberately sourced neutral variant state (Sprite 3, Changes #5): S2 confidence 46 (> 42)
 * and S4 tempo 50 (>= 15) match what the content-authored soloScenario initial state resolves
 * to. NOT defaultStaffMechanicsState, whose s4.supportableTempo = 13 is already bottlenecked.
 */
function variantState(overrides: Partial<ChiefSpriteVariantState> = {}): ChiefSpriteVariantState {
  return {
    trustBand: "steady",
    burdenLevel: "light",
    campaignStatus: "active",
    s2ExternalEstimateConfidence: 46,
    s4SupportableTempo: 50,
    ...overrides,
  };
}

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

function neutralSpriteInput() {
  return {
    chief: spriteChief,
    portrait: spritePortrait,
    sessionSeed: "session-a",
    variantState: variantState(),
    visualLanguage: spriteVisualLanguage,
  };
}

test("chief sprite derivation is deterministic per (portrait, state) tuple with a neutral render variant", () => {
  const sprite = buildChiefSpriteSpec(neutralSpriteInput());
  const svg = buildAdvisorPortraitSvg(sprite);
  // The legacy bare-portrait overload is gone: the renderer takes a complete SpriteSpec and
  // the data URI is exactly the renderer output percent-encoded (replaces the #50 equality).
  assert.equal(buildAdvisorPortraitDataUri(sprite), `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`);
  assert.equal(sprite.expression, "calm");
  assert.equal(sprite.temperament, "calm", "temperament is copied verbatim from the chief");
  assert.equal(sprite.prompt, canonicalSpritePrompt, "positive prompt must match the roadmap template byte-for-byte");
  assert.equal(sprite.negativePrompt, SPRITE_NEGATIVE_PROMPT, "negative prompt is the exact roadmap constant");
  assert.equal(sprite.deterministicSeed, chiefSpriteDeterministicSeed("session-a", "sprite-chief"));
  assert.deepEqual(sprite.palette, [spritePortrait.skinTone, spritePortrait.hairColor, spritePortrait.eyeColor, spritePortrait.uniformColor, spritePortrait.trimColor, spritePortrait.backgroundColor, spritePortrait.panelColor], "palette must preserve the 7 legacy colors in canonical order");
  assert.deepEqual(sprite.variant, {
    effects: [],
    posture: "neutral",
    backgroundDarkenOpacity: 0,
    saturation: 1,
    framing: "default",
    supportDetail: "none",
  }, "neutral state yields the neutral render variant");
  // Same (portrait, chief, visualLanguage, variantState, sessionSeed) tuple, deep-cloned
  // twice → deep-equal spec, byte-identical SVG, byte-identical data URI.
  const first = buildChiefSpriteSpec(structuredClone(neutralSpriteInput()));
  const second = buildChiefSpriteSpec(structuredClone(neutralSpriteInput()));
  assert.deepEqual(first, second);
  assert.equal(buildAdvisorPortraitSvg(first), buildAdvisorPortraitSvg(second));
  assert.equal(buildAdvisorPortraitDataUri(first), buildAdvisorPortraitDataUri(second));
  assert.throws(() => chiefSpriteDeterministicSeed("", "sprite-chief"), /sessionSeed/);
  assert.throws(() => chiefSpriteDeterministicSeed("session-a", ""), /chiefId/);
});

test("SpriteSpec strict validation retains legacy fields plus variant and rejects incomplete or unknown payloads", () => {
  const sprite = buildChiefSpriteSpec(neutralSpriteInput());
  assert.deepEqual(Object.keys(sprite).sort(), ["accessory", "backgroundColor", "browTilt", "deterministicSeed", "displayName", "eyeColor", "expression", "faceShape", "genderPresentation", "hairColor", "hairStyle", "id", "mouthCurve", "negativePrompt", "palette", "panelColor", "prompt", "role", "skinTone", "subjectType", "temperament", "trimColor", "trustBand", "uniform", "uniformColor", "silhouette", "variant"].sort());
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, unknown: true }));
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, prompt: undefined }));
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, prompt: "" }), /too_small/);
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, negativePrompt: "" }), /too_small/);
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, temperament: undefined }));
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, temperament: "" }), /too_small/);
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, palette: [] }));
  // #52: severe is now a valid expression; a genuinely unknown value is rejected instead.
  assert.doesNotThrow(() => spriteSpecSchema.parse({ ...sprite, expression: "severe" }));
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, expression: "melancholic" }));
  // variant is strict and required: unknown, missing, or out-of-enum fields fail.
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, variant: undefined }));
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, variant: { ...sprite.variant, unknown: true } }));
  assert.throws(() => spriteSpecSchema.parse({ ...sprite, variant: { ...sprite.variant, posture: "slouched" } }));
  assert.throws(() => spriteRenderVariantSchema.parse({ ...sprite.variant, effects: ["trust-low", "made-up"] }));
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
  // #52 adds the severe expression: 6 roles × 6 expressions = 36, derived not magic.
  const expectedCount = spriteRoleSchema.options.length * spriteExpressionSchema.options.length;
  assert.equal(prompts.length, expectedCount);
  assert.equal(new Set(prompts).size, expectedCount, `all ${expectedCount} role/expression prompts are distinct`);
});

test("only the four source fields change the prompt; visual fields never do", () => {
  const base = neutralSpriteInput();
  const baseline = buildChiefSpriteSpec(base);
  const differentName = buildChiefSpriteSpec({ ...base, chief: { ...spriteChief, name: "Renamed Chief" } });
  assert.notEqual(differentName.prompt, baseline.prompt);
  assert.equal(differentName.prompt.replace("Renamed Chief", "Sprite Chief"), baseline.prompt, "only the display-name segment changed");
  assert.equal(differentName.negativePrompt, baseline.negativePrompt);

  const differentTemperament = buildChiefSpriteSpec({ ...base, chief: { ...spriteChief, temperament: "unflappable" } });
  assert.notEqual(differentTemperament.prompt, baseline.prompt);
  assert.equal(differentTemperament.prompt.replace("unflappable", "calm"), baseline.prompt, "only the temperament segment changed");

  const differentExpression = buildChiefSpriteSpec({ ...base, variantState: variantState({ campaignStatus: "won" }) });
  assert.equal(differentExpression.expression, "resolved");
  assert.notEqual(differentExpression.prompt, baseline.prompt);
  assert.ok(differentExpression.prompt.endsWith("resolved, restrained editorial game art, clean bust portrait, readable at small size, consistent uniform silhouette, muted palette, no photorealism, no fantasy armor, no weapons, neutral command-room background."));
  assert.equal(differentExpression.prompt.replace("resolved", "calm"), baseline.prompt, "only the expression segment changed");

  // Silhouette/palette/uniform/trust changes must not leak into prompt text.
  const visuallyDifferent = buildChiefSpriteSpec({
    ...base,
    variantState: variantState({ trustBand: "watchful" }),
    portrait: { ...spritePortrait, uniformColor: "#000000", trimColor: "#ffffff" },
    visualLanguage: { ...spriteVisualLanguage, S1: { ...spriteVisualLanguage.S1, shapeLanguage: "changed shape", uniformLanguage: "changed uniform" } },
  });
  assert.equal(visuallyDifferent.expression, "calm", "watchful trust must not trigger precedence");
  assert.equal(visuallyDifferent.prompt, baseline.prompt, "prompt ignores silhouette, palette, uniform, and trust");
});

test("sprite derivation is deterministic across equivalent deep-cloned inputs", () => {
  const input = neutralSpriteInput();
  const first = buildChiefSpriteSpec(structuredClone(input));
  const second = buildChiefSpriteSpec(structuredClone(input));
  assert.deepEqual(first, second);
  assert.deepEqual(input, neutralSpriteInput(), "inputs are not mutated");
});

test("trust thresholds and expression precedence are total", () => {
  assert.deepEqual([43, 44, 57, 58, 71, 72].map((trust) => relationshipLabel(trust)), ["strained", "watchful", "watchful", "steady", "steady", "solid"]);
  const base = neutralSpriteInput();
  assert.equal(buildChiefSpriteSpec({ ...base, variantState: variantState({ campaignStatus: "won" }) }).expression, "resolved");
  assert.equal(buildChiefSpriteSpec({ ...base, variantState: variantState({ campaignStatus: "lost" }) }).expression, "severe");
  assert.equal(buildChiefSpriteSpec({ ...base, variantState: variantState({ burdenLevel: "overloaded" }) }).expression, "strained");
  assert.equal(buildChiefSpriteSpec({ ...base, variantState: variantState({ trustBand: "strained" }) }).expression, "skeptical");
  assert.equal(buildChiefSpriteSpec({ ...base, variantState: variantState({ burdenLevel: "strained" }) }).expression, "strained");
  // NEW #52 precedence: solid trust → calm, even over a non-calm authored base.
  assert.equal(buildChiefSpriteSpec({ ...base, variantState: variantState({ trustBand: "solid" }) }).expression, "calm");
  // Compound lost + overload + low trust still resolves to severe (outcome wins).
  const compound = buildChiefSpriteSpec({ ...base, variantState: variantState({ campaignStatus: "lost", burdenLevel: "overloaded", trustBand: "strained" }) });
  assert.equal(compound.expression, "severe");
  assert.deepEqual(compound.variant, {
    effects: ["trust-low", "directorate-overloaded", "campaign-lost"],
    posture: "closed",
    backgroundDarkenOpacity: 0.22,
    saturation: 0.45,
    framing: "default",
    supportDetail: "none",
  }, "non-expression effects compose in canonical order");
});

test("S2 and S3 authored base expressions win for neutral input (fall-through precedence)", () => {
  const biasedLanguage = {
    ...spriteVisualLanguage,
    S2: { ...spriteVisualLanguage.S2, baseExpression: "skeptical" },
    S3: { ...spriteVisualLanguage.S3, baseExpression: "urgent" },
  } as any;
  const neutral = { portrait: spritePortrait, sessionSeed: "session-a", variantState: variantState(), visualLanguage: spriteVisualLanguage };
  const s2Chief = { ...spriteChief, id: "s2-chief", directorate: "intelligence" as const };
  const s3Chief = { ...spriteChief, id: "s3-chief", directorate: "operations" as const };
  assert.equal(buildChiefSpriteSpec({ ...neutral, chief: s2Chief, visualLanguage: biasedLanguage }).expression, "skeptical");
  assert.equal(buildChiefSpriteSpec({ ...neutral, chief: s3Chief, visualLanguage: biasedLanguage }).expression, "urgent");
  // NEW #52: solid trust overrides the authored base, so both flip to calm.
  assert.equal(buildChiefSpriteSpec({ ...neutral, chief: s2Chief, visualLanguage: biasedLanguage, variantState: variantState({ trustBand: "solid" }) }).expression, "calm");
  assert.equal(buildChiefSpriteSpec({ ...neutral, chief: s3Chief, visualLanguage: biasedLanguage, variantState: variantState({ trustBand: "solid" }) }).expression, "calm");
});

test("roster identity is order-independent and sprite derivation does not mutate sessions", () => {
  const chiefs = [spriteChief, { ...spriteChief, id: "other", name: "Other Chief" }];
  const first = generateAdvisorRoster(chiefs, "order-session");
  const second = generateAdvisorRoster([...chiefs].reverse(), "order-session");
  assert.deepEqual(Object.fromEntries(first.map((entry) => [entry.chiefId, entry.portrait])), Object.fromEntries(second.map((entry) => [entry.chiefId, entry.portrait])));
  const session = { id: "nonmutation-session", advisorRoster: [{ portrait: spritePortrait }], state: { campaignStatus: "active" } } as any;
  const snapshot = JSON.stringify(session);
  buildChiefSpriteSpec({ chief: spriteChief, portrait: session.advisorRoster[0].portrait, sessionSeed: session.id, variantState: variantState({ campaignStatus: session.state.campaignStatus }), visualLanguage: spriteVisualLanguage });
  assert.equal(JSON.stringify(session), snapshot);
  const forbidden = ["prompt", "negativePrompt", "promptHash", "negativePromptHash", "deterministicSeed", "temperament", "variant", "effects", "posture", "framing", "supportDetail", "saturation", "backgroundDarkenOpacity"];
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

test("variant schemas are strict: unknown or out-of-range state fails, effects stay closed", () => {
  assert.doesNotThrow(() => chiefSpriteVariantStateSchema.parse(variantState()));
  assert.throws(() => chiefSpriteVariantStateSchema.parse({ ...variantState(), unknown: true }));
  assert.throws(() => chiefSpriteVariantStateSchema.parse({ ...variantState(), trustBand: "hostile" }));
  assert.throws(() => chiefSpriteVariantStateSchema.parse({ ...variantState(), burdenLevel: "crushed" }));
  assert.throws(() => chiefSpriteVariantStateSchema.parse({ ...variantState(), campaignStatus: "paused" }));
  assert.throws(() => chiefSpriteVariantStateSchema.parse({ ...variantState(), s2ExternalEstimateConfidence: 101 }), /too_big/);
  assert.throws(() => chiefSpriteVariantStateSchema.parse({ ...variantState(), s4SupportableTempo: -1 }), /too_small/);
  const renderVariant = buildChiefSpriteVariant("calm", "S1", variantState()).variant;
  assert.throws(() => spriteRenderVariantSchema.parse({ ...renderVariant, effects: ["trust-low", "made-up"] }));
  assert.throws(() => spriteRenderVariantSchema.parse({ ...renderVariant, posture: "slouched" }));
  assert.throws(() => spriteRenderVariantSchema.parse({ ...renderVariant, saturation: 1.5 }), /too_big/);
  assert.throws(() => spriteRenderVariantSchema.parse({ ...renderVariant, unknown: true }));
});

test("SpriteSpec rejects hand-authored variants that break canonical effects, role gates, or controls", () => {
  const neutral = buildChiefSpriteSpec(neutralSpriteInput());
  const won = buildChiefSpriteSpec({ ...neutralSpriteInput(), variantState: variantState({ campaignStatus: "won" }) });
  const s4Bottleneck = buildChiefSpriteSpec({
    ...neutralSpriteInput(),
    chief: { ...spriteChief, directorate: "sustainment" },
    variantState: variantState({ s4SupportableTempo: 10 }),
  });

  assert.doesNotThrow(() => spriteSpecSchema.parse(won), "canonical builder output remains valid");
  assert.doesNotThrow(() => spriteSpecSchema.parse(s4Bottleneck), "canonical role-gated builder output remains valid");
  assert.throws(() => spriteSpecSchema.parse({
    ...neutral,
    expression: "severe",
    variant: { ...neutral.variant, effects: ["campaign-won"], posture: "closed", saturation: 0.45 },
  }), /canonical/i, "won effect cannot be paired with a severe loss render");
  assert.throws(() => spriteSpecSchema.parse({
    ...neutral,
    variant: { ...neutral.variant, effects: ["s4-bottleneck"], supportDetail: "utility-harness" },
  }), /S4/i, "S4 harness cannot be attached to a non-S4 sprite");
  assert.throws(() => spriteSpecSchema.parse({
    ...won,
    variant: { ...won.variant, effects: ["campaign-won", "trust-low"] },
  }), /canonical order/i, "effect order is part of the canonical contract");
  assert.throws(() => spriteSpecSchema.parse({
    ...won,
    variant: { ...won.variant, effects: ["campaign-won", "campaign-won"] },
  }), /unique/i, "effects cannot be duplicated");
  assert.throws(() => spriteSpecSchema.parse({
    ...neutral,
    trustBand: "strained",
    expression: "skeptical",
    variant: { ...neutral.variant, effects: ["trust-low", "trust-high"], posture: "closed" },
  }), /cannot both/i, "mutually exclusive state effects cannot be hand-combined");
});

test("exact roadmap effects map every predicate and boundary to expression and render controls", () => {
  // Trust: only strained/solid activate trust effects; watchful/steady stay neutral.
  assert.deepEqual(buildChiefSpriteVariant("calm", "S1", variantState({ trustBand: "strained" })).variant.effects, ["trust-low"]);
  assert.deepEqual(buildChiefSpriteVariant("calm", "S1", variantState({ trustBand: "solid" })).variant.effects, ["trust-high"]);
  assert.deepEqual(buildChiefSpriteVariant("calm", "S1", variantState({ trustBand: "watchful" })).variant.effects, []);
  assert.deepEqual(buildChiefSpriteVariant("calm", "S1", variantState({ trustBand: "steady" })).variant.effects, []);
  // Burden: strained vs overloaded.
  assert.deepEqual(buildChiefSpriteVariant("calm", "S1", variantState({ burdenLevel: "strained" })).variant.effects, ["directorate-strained"]);
  assert.deepEqual(buildChiefSpriteVariant("calm", "S1", variantState({ burdenLevel: "overloaded" })).variant.effects, ["directorate-overloaded"]);
  // Campaign outcome.
  assert.deepEqual(buildChiefSpriteVariant("calm", "S1", variantState({ campaignStatus: "won" })).variant.effects, ["campaign-won"]);
  assert.deepEqual(buildChiefSpriteVariant("calm", "S1", variantState({ campaignStatus: "lost" })).variant.effects, ["campaign-lost"]);
  // S2 confidence: <= 42 active, 43 inactive, and role-gated.
  assert.deepEqual(buildChiefSpriteVariant("calm", "S2", variantState({ s2ExternalEstimateConfidence: 42 })).variant, {
    effects: ["s2-low-confidence"], posture: "neutral", backgroundDarkenOpacity: 0, saturation: 1, framing: "tight", supportDetail: "none",
  });
  assert.equal(buildChiefSpriteVariant("calm", "S2", variantState({ s2ExternalEstimateConfidence: 43 })).variant.framing, "default");
  assert.equal(buildChiefSpriteVariant("calm", "S1", variantState({ s2ExternalEstimateConfidence: 10 })).variant.framing, "default", "S2 signal is role-gated");
  // S4 tempo: < 15 active, 15 inactive, and role-gated.
  assert.equal(buildChiefSpriteVariant("calm", "S4", variantState({ s4SupportableTempo: 14.99 })).variant.supportDetail, "utility-harness");
  assert.equal(buildChiefSpriteVariant("calm", "S4", variantState({ s4SupportableTempo: 15 })).variant.supportDetail, "none");
  assert.equal(buildChiefSpriteVariant("calm", "S1", variantState({ s4SupportableTempo: 0 })).variant.supportDetail, "none", "S4 signal is role-gated");
  // The exact S2 <= 42 / S4 < 15 numbers are deliberately NOT unified (v2 Changes #6).
  assert.equal(buildChiefSpriteVariant("calm", "S2", variantState({ s2ExternalEstimateConfidence: 42 })).variant.framing, "tight");
  assert.equal(buildChiefSpriteVariant("calm", "S4", variantState({ s4SupportableTempo: 14 })).variant.supportDetail, "utility-harness");
});

test("non-expression effects compose in fixed canonical order without last-writer-wins", () => {
  const derived = buildChiefSpriteVariant("calm", "S4", variantState({ trustBand: "strained", burdenLevel: "overloaded", campaignStatus: "lost", s2ExternalEstimateConfidence: 30, s4SupportableTempo: 5 }));
  assert.equal(derived.expression, "severe", "campaign lost wins expression precedence");
  assert.deepEqual(derived.variant, {
    effects: ["trust-low", "directorate-overloaded", "campaign-lost", "s4-bottleneck"],
    posture: "closed",
    backgroundDarkenOpacity: 0.22,
    saturation: 0.45,
    framing: "default",
    supportDetail: "utility-harness",
  }, "S2/S4 signals are role-gated; canonical effects order holds");
  assert.deepEqual(spriteRenderVariantSchema.parse(derived.variant), derived.variant);
});

test("expression geometry deltas are exhaustive, exact, and clamped", () => {
  assert.deepEqual(Object.keys(SPRITE_EXPRESSION_VISUALS).sort(), spriteExpressionSchema.options.slice().sort(), "table covers all six expressions");
  assert.deepEqual(SPRITE_EXPRESSION_VISUALS.calm, { browTiltDelta: 0, mouthCurveDelta: 0.6 });
  assert.deepEqual(SPRITE_EXPRESSION_VISUALS.skeptical, { browTiltDelta: -3.0, mouthCurveDelta: -0.6 });
  assert.deepEqual(SPRITE_EXPRESSION_VISUALS.strained, { browTiltDelta: -3.5, mouthCurveDelta: -1.5 });
  assert.deepEqual(SPRITE_EXPRESSION_VISUALS.urgent, { browTiltDelta: -1.5, mouthCurveDelta: -2.0 });
  assert.deepEqual(SPRITE_EXPRESSION_VISUALS.resolved, { browTiltDelta: 0.8, mouthCurveDelta: 1.4 });
  assert.deepEqual(SPRITE_EXPRESSION_VISUALS.severe, { browTiltDelta: -4.5, mouthCurveDelta: -2.8 });

  // Rendered = authored base + expression delta (authored base 0 here).
  const neutralSvg = buildAdvisorPortraitSvg(buildChiefSpriteSpec(neutralSpriteInput()));
  assert.match(neutralSvg, /C100 118 108 118 114 122/, "calm keeps the authored flat brow (delta 0)");
  assert.match(neutralSvg, /C110 165\.6 130 165\.6 139 165/, "calm lifts the mouth by +0.6");

  const lost = buildChiefSpriteSpec({ ...neutralSpriteInput(), variantState: variantState({ campaignStatus: "lost" }) });
  const lostSvg = buildAdvisorPortraitSvg(lost);
  assert.match(lostSvg, /C100 113\.5 108 122\.5 114 122/, "severe furrows the brow by -4.5");
  assert.match(lostSvg, /C110 162\.2 130 162\.2 139 165/, "severe downturns the mouth by -2.8");

  // Clamp safety net binds only at extreme severe + authored-min combination:
  // brow -0.7 + -4.5 = -5.2 → clamps to -5; mouth -0.35 + -2.8 = -3.15 stays in [-4, 4].
  const extreme = buildChiefSpriteSpec({
    ...neutralSpriteInput(),
    portrait: { ...spritePortrait, browTilt: -0.7, mouthCurve: -0.35 },
    variantState: variantState({ campaignStatus: "lost" }),
  });
  const extremeSvg = buildAdvisorPortraitSvg(extreme);
  assert.match(extremeSvg, /C100 113 108 123 114 122/, "brow clamps at -5");
  assert.match(extremeSvg, /C110 161\.85 130 161\.85 139 165/, "mouth renders at -3.15 without clamping");
});

test("chief identity is invariant across all variant states; only state fields differ", () => {
  const states: ChiefSpriteVariantState[] = [
    variantState(),
    variantState({ trustBand: "strained" }),
    variantState({ trustBand: "solid" }),
    variantState({ burdenLevel: "overloaded" }),
    variantState({ burdenLevel: "strained" }),
    variantState({ campaignStatus: "won" }),
    variantState({ campaignStatus: "lost" }),
    variantState({ s2ExternalEstimateConfidence: 20 }),
    variantState({ s4SupportableTempo: 5 }),
  ];
  const sprites = states.map((state) => buildChiefSpriteSpec({ ...neutralSpriteInput(), variantState: state }));
  // Decision D state-invariant projection (all 23 fields) is deep-equal across every state.
  const identityKeys = ["id", "subjectType", "role", "displayName", "temperament", "deterministicSeed", "silhouette", "uniform", "palette", "genderPresentation", "skinTone", "hairColor", "eyeColor", "uniformColor", "trimColor", "backgroundColor", "panelColor", "faceShape", "hairStyle", "accessory", "browTilt", "mouthCurve", "negativePrompt"];
  const project = (sprite: Record<string, unknown>) => Object.fromEntries(identityKeys.map((key) => [key, sprite[key]]));
  for (const sprite of sprites) {
    assert.deepEqual(project(sprite), project(sprites[0]), "identity projection must not change with state");
  }
  // State-variant fields: trustBand, expression, prompt, variant.
  for (const key of ["trustBand", "expression", "prompt", "variant"] as const) {
    const values = sprites.map((sprite) => JSON.stringify(sprite[key]));
    assert.ok(new Set(values).size > 1, `state-variant field ${key} must differ across states`);
  }
});

test("each roadmap state changes the SVG bytes and carries its targeted markup", () => {
  const neutralSvg = buildAdvisorPortraitSvg(buildChiefSpriteSpec(neutralSpriteInput()));
  assert.match(neutralSvg, /viewBox="0 0 240 280"/);
  assert.match(neutralSvg, /M24 218 C64 182 84 176 120 176 C156 176 176 182 216 218 L216 260 L24 260 Z/, "neutral keeps the current bust posture");
  assert.ok(!neutralSvg.includes("<defs>"), "neutral has no filter defs");
  assert.ok(!neutralSvg.includes("fill=\"#000000\""), "neutral has no dark overlay");

  const closedSvg = buildAdvisorPortraitSvg(buildChiefSpriteSpec({ ...neutralSpriteInput(), variantState: variantState({ trustBand: "strained" }) }));
  assert.notEqual(closedSvg, neutralSvg);
  assert.match(closedSvg, /M34 220 C72 188 91 181 120 181 C149 181 168 188 206 220 L206 260 L34 260 Z/, "low trust closes the posture");

  const openSvg = buildAdvisorPortraitSvg(buildChiefSpriteSpec({ ...neutralSpriteInput(), variantState: variantState({ trustBand: "solid" }) }));
  assert.notEqual(openSvg, neutralSvg);
  assert.match(openSvg, /M16 216 C58 178 80 172 120 172 C160 172 182 178 224 216 L224 260 L16 260 Z/, "high trust opens the posture");

  const overloadedSvg = buildAdvisorPortraitSvg(buildChiefSpriteSpec({ ...neutralSpriteInput(), variantState: variantState({ burdenLevel: "overloaded" }) }));
  assert.notEqual(overloadedSvg, neutralSvg);
  assert.match(overloadedSvg, /fill="#000000" opacity="0\.22"/, "overload darkens the background");

  const lostSvg = buildAdvisorPortraitSvg(buildChiefSpriteSpec({ ...neutralSpriteInput(), variantState: variantState({ campaignStatus: "lost" }) }));
  assert.notEqual(lostSvg, neutralSvg);
  assert.match(lostSvg, /<feColorMatrix type="saturate" values="0\.45" \/>/, "loss desaturates via the color matrix");
  assert.match(lostSvg, /<g filter="url\(#sprite-saturation\)">/, "loss wraps the scene in the saturation group");
  assert.match(lostSvg, /<\/g>/, "saturation group closes");

  const tightSvg = buildAdvisorPortraitSvg(buildChiefSpriteSpec({ ...neutralSpriteInput(), chief: { ...spriteChief, id: "s2-chief", directorate: "intelligence" as const }, variantState: variantState({ s2ExternalEstimateConfidence: 30 }) }));
  assert.match(tightSvg, /viewBox="12 8 216 252"/, "low S2 confidence crops the framing");

  const harnessSvg = buildAdvisorPortraitSvg(buildChiefSpriteSpec({ ...neutralSpriteInput(), chief: { ...spriteChief, id: "s4-chief", directorate: "sustainment" as const }, variantState: variantState({ s4SupportableTempo: 10 }) }));
  assert.match(harnessSvg, /M96 208 L114 258/, "S4 bottleneck shows the utility harness strap");
  assert.match(harnessSvg, /<rect x="103" y="224" width="34" height="26"/, "S4 bottleneck shows the ledger pocket");
  assert.ok(!harnessSvg.includes("M72 208 L98 258"), "harness is nudged off the trim bars");
});

test("prompt text depends only on the final expression, never on render controls", () => {
  const calm = buildChiefSpriteSpec(neutralSpriteInput());
  // Overload and strained burden both yield "strained" expression but different SVG controls.
  const overloaded = buildChiefSpriteSpec({ ...neutralSpriteInput(), variantState: variantState({ burdenLevel: "overloaded" }) });
  const strainedBurden = buildChiefSpriteSpec({ ...neutralSpriteInput(), variantState: variantState({ burdenLevel: "strained" }) });
  assert.equal(overloaded.expression, "strained");
  assert.equal(strainedBurden.expression, "strained");
  assert.equal(overloaded.prompt, strainedBurden.prompt, "background darkening must not leak into the prompt");
  assert.notEqual(buildAdvisorPortraitSvg(overloaded), buildAdvisorPortraitSvg(strainedBurden), "the SVG still differs");

  // S2/S4 role effects share the calm expression and therefore the exact calm prompt
  // for the same role (role is one of the four prompt sources).
  const s2Calm = buildChiefSpriteSpec({ ...neutralSpriteInput(), chief: { ...spriteChief, id: "s2-chief", directorate: "intelligence" as const } });
  const s2 = buildChiefSpriteSpec({ ...neutralSpriteInput(), chief: { ...spriteChief, id: "s2-chief", directorate: "intelligence" as const }, variantState: variantState({ s2ExternalEstimateConfidence: 20 }) });
  const s4Calm = buildChiefSpriteSpec({ ...neutralSpriteInput(), chief: { ...spriteChief, id: "s4-chief", directorate: "sustainment" as const } });
  const s4 = buildChiefSpriteSpec({ ...neutralSpriteInput(), chief: { ...spriteChief, id: "s4-chief", directorate: "sustainment" as const }, variantState: variantState({ s4SupportableTempo: 5 }) });
  assert.equal(s2.expression, "calm");
  assert.equal(s4.expression, "calm");
  assert.equal(s2.prompt, s2Calm.prompt, "S2 crop must not leak into the prompt");
  assert.equal(s4.prompt, s4Calm.prompt, "S4 harness must not leak into the prompt");

  // Changing only the expression changes only that segment.
  const lost = buildChiefSpriteSpec({ ...neutralSpriteInput(), variantState: variantState({ campaignStatus: "lost" }) });
  assert.ok(lost.prompt.includes("severe"), "lost campaigns carry the exact severe token");
  assert.equal(lost.prompt.replace("severe", "calm"), calm.prompt, "only the expression segment changed");
});

test("default staff mechanics asymmetry is locked: schema default is not neutral for S4", () => {
  // defaultStaffMechanicsState.s4.supportableTempo = 13 (< 15) → bottlenecked.
  const fromDefaults = buildChiefSpriteVariant("calm", "S4", {
    trustBand: "steady",
    burdenLevel: "light",
    campaignStatus: "active",
    s2ExternalEstimateConfidence: defaultStaffMechanicsState.s2.externalEstimateConfidence,
    s4SupportableTempo: defaultStaffMechanicsState.s4.supportableTempo,
  });
  assert.equal(fromDefaults.variant.supportDetail, "utility-harness");
  assert.deepEqual(fromDefaults.variant.effects, ["s4-bottleneck"]);
  // S2's neutral default 46 is safely above the <= 42 risk boundary.
  const s2FromDefaults = buildChiefSpriteVariant("calm", "S2", {
    trustBand: "steady",
    burdenLevel: "light",
    campaignStatus: "active",
    s2ExternalEstimateConfidence: defaultStaffMechanicsState.s2.externalEstimateConfidence,
    s4SupportableTempo: defaultStaffMechanicsState.s4.supportableTempo,
  });
  assert.equal(s2FromDefaults.variant.framing, "default", "S2 default 46 is neutral");
  // The content-authored soloScenario initial state omits s4.supportableTempo, so it resolves
  // to the per-field schema default 50 (>= 15) → genuinely neutral (v2 Changes #5).
  assert.equal(buildChiefSpriteVariant("calm", "S4", variantState()).variant.supportDetail, "none");
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
