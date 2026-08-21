import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  buildAdvisorPortraitDataUri,
  buildAdvisorPortraitSvg,
  buildChiefSpriteSpec,
  buildChiefSpriteVariant,
  buildSpritePixels,
  buildSpritePromptText,
  campaignStateSchema,
  chiefArchetypeSchema,
  chiefSpriteDeterministicSeed,
  chiefSpriteVariantStateSchema,
  createInitialGameSession,
  defaultStaffFunctionDefinitions,
  defaultStaffMechanicsState,
  doctrineAcceptedRiskRefSchema,
  doctrineMaturityEntrySchema,
  eventDefinitionSchema,
  gameSessionSchema,
  generateAdvisorRoster,
  relationshipLabel,
  resolveSpriteBasePalette,
  scenarioSummarySchema,
  spriteDarkenVignette,
  spriteDesaturate45,
  spriteExpressionSchema,
  spriteHighlightTone,
  spriteLoadTint,
  spriteLuma,
  spriteOutlineTone,
  spritePixelRuns,
  spriteRenderVariantSchema,
  spriteRoleSchema,
  spriteShadowTone,
  spriteSpecSchema,
  spriteVariantEffectSchema,
  SPRITE_NEGATIVE_PROMPT,
  SPRITE_PIXEL_ACCESSORY,
  SPRITE_PIXEL_CALM_BROWS,
  SPRITE_PIXEL_CALM_MOUTHS,
  SPRITE_PIXEL_EXPRESSION,
  SPRITE_PIXEL_FACE,
  SPRITE_PIXEL_HAIR,
  SPRITE_PIXEL_HARNESS,
  SPRITE_PIXEL_HEIGHT,
  SPRITE_PIXEL_PALETTE,
  SPRITE_PIXEL_POSTURE,
  SPRITE_PIXEL_PRESENTATION,
  SPRITE_PIXEL_TIGHT_X_MAP,
  SPRITE_PIXEL_WIDTH,
  SPRITE_PROMPT_ROLE_LABELS,
  turnResultSchema,
  writeSpriteCells,
  type ChiefSpriteVariantState,
  type EventDefinition,
  type SpriteHexColor,
  type SpritePixelGrid,
  type SpritePixelPaletteIndex,
  type SpriteRole,
  type SpriteSemanticPixel,
  type SpriteSpec,
} from "./index";
import { soloScenario } from "@brass-ledger/content";

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
  const forbidden = ["prompt", "negativePrompt", "promptHash", "negativePromptHash", "deterministicSeed", "temperament", "variant", "effects", "posture", "framing", "supportDetail", "saturation", "backgroundDarkenOpacity", "pixelGrid", "pixelMatrix", "pixels", "svg", "png"];
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

test("gameSessionSchema strips output-only sprite keys nested in a real session export", () => {
  const session = {
    id: "00000000-0000-0000-0000-000000000099",
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
  };
  const collect = (value: unknown): string[] => {
    const keys: string[] = [];
    const walk = (entry: unknown) => {
      if (Array.isArray(entry)) return entry.forEach(walk);
      if (entry && typeof entry === "object") {
        for (const [key, child] of Object.entries(entry)) {
          keys.push(key);
          walk(child);
        }
      }
    };
    walk(value);
    return keys;
  };
  for (const key of ["pixelGrid", "pixelMatrix", "pixels", "svg", "png"]) {
    const parsed = gameSessionSchema.parse({ ...session, state: { ...session.state, [key]: "output-only" } });
    assert.equal(collect(parsed).includes(key), false, `${key} must never survive into a saved session`);
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

// ============================================================================
// Sprite 4 pixel grammar tests (issue #82; v2 §8.1 replaces the two vector
// tests from Sprite 3). The grammar is the design: exact cell locks below are
// the accepted art and any mask change must update them deliberately.
// ============================================================================

const PIX = SPRITE_PIXEL_PALETTE;

const pixelNineStates: ChiefSpriteVariantState[] = [
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

const s2ChiefFixture = { ...spriteChief, id: "s2-chief", directorate: "intelligence" as const };
const s4ChiefFixture = { ...spriteChief, id: "s4-chief", directorate: "sustainment" as const };

function pixelSprite(state: ChiefSpriteVariantState = variantState(), chief = spriteChief): SpriteSpec {
  return buildChiefSpriteSpec({ ...neutralSpriteInput(), chief, variantState: state });
}

function pixelRender(state: ChiefSpriteVariantState = variantState(), chief = spriteChief) {
  return buildSpritePixels(pixelSprite(state, chief));
}

const PIXEL_LETTERS: Record<number, string> = {
  0: "b", 1: "B", 2: "h", 3: "p", 4: "P", 5: "H", 6: "s", 7: "S", 8: "L",
  9: "a", 10: "A", 11: "Z", 12: "e", 13: "u", 14: "U", 15: "V", 16: "t", 17: "T", 18: "W", 19: "o",
};

function semanticRows(render: ReturnType<typeof buildSpritePixels>): string[] {
  const rows: string[] = [];
  for (let y = 0; y < SPRITE_PIXEL_HEIGHT; y += 1) {
    let row = "";
    for (let x = 0; x < SPRITE_PIXEL_WIDTH; x += 1) {
      row += PIXEL_LETTERS[render.identity.grid.cells[y * SPRITE_PIXEL_WIDTH + x].basePaletteIndex] ?? "?";
    }
    rows.push(row);
  }
  return rows;
}

function colorRows(grid: SpritePixelGrid<SpriteHexColor>): string[] {
  const rows: string[] = [];
  for (let y = 0; y < SPRITE_PIXEL_HEIGHT; y += 1) {
    let row = "";
    for (let x = 0; x < SPRITE_PIXEL_WIDTH; x += 1) {
      row += grid.cells[y * SPRITE_PIXEL_WIDTH + x];
    }
    rows.push(row);
  }
  return rows;
}

/** "x,y" cells whose semantic basePaletteIndex differs between two grids. */
function semanticDiff(a: readonly SpriteSemanticPixel[], b: readonly SpriteSemanticPixel[]): string[] {
  const changed: string[] = [];
  for (let index = 0; index < SPRITE_PIXEL_WIDTH * SPRITE_PIXEL_HEIGHT; index += 1) {
    if (a[index].basePaletteIndex !== b[index].basePaletteIndex) {
      changed.push(`${index % SPRITE_PIXEL_WIDTH},${Math.floor(index / SPRITE_PIXEL_WIDTH)}`);
    }
  }
  return changed.sort();
}

/** "x,y" cells whose resolved source RGB differs between two color grids. */
function sourceColorDiff(a: readonly SpriteHexColor[], b: readonly SpriteHexColor[]): string[] {
  const changed: string[] = [];
  for (let index = 0; index < SPRITE_PIXEL_WIDTH * SPRITE_PIXEL_HEIGHT; index += 1) {
    if (a[index] !== b[index]) {
      changed.push(`${index % SPRITE_PIXEL_WIDTH},${Math.floor(index / SPRITE_PIXEL_WIDTH)}`);
    }
  }
  return changed.sort();
}

/** The declared writable/readable regions of v2 §3.11 for each effect. */
function inDeclaredRegion(x: number, y: number, region: "posture" | "expression" | "tint" | "desat" | "harness"): boolean {
  switch (region) {
    case "posture": return y >= 19 && y <= 22 && x >= 1 && x <= 22;
    case "expression": return (y >= 9 && y <= 11 && x >= 8 && x <= 15)
      || (y === 15 && x >= 9 && x <= 14)
      || (y === 16 && x >= 10 && x <= 13);
    case "tint": return spriteDarkenVignette(x, y);
    case "desat": return y >= 4 && y <= 17;
    case "harness": return y >= 22 && y <= 26 && x >= 8 && x <= 15;
  }
}

test("pixel grammar tables are exhaustive over the schema enums and every coordinate is in bounds", () => {
  assert.deepEqual(Object.keys(SPRITE_PIXEL_FACE).sort(), ["oval", "round", "square"]);
  assert.deepEqual(Object.keys(SPRITE_PIXEL_HAIR).sort(), ["bob", "bun", "crew", "crop", "side-part", "tied-back"]);
  assert.deepEqual(Object.keys(SPRITE_PIXEL_ACCESSORY).sort(), ["earpiece", "glasses", "none"]);
  assert.deepEqual(Object.keys(SPRITE_PIXEL_PRESENTATION).sort(), ["female", "male"]);
  assert.deepEqual(Object.keys(SPRITE_PIXEL_POSTURE).sort(), ["closed", "neutral", "open"]);
  assert.deepEqual(Object.keys(SPRITE_PIXEL_EXPRESSION).sort(), spriteExpressionSchema.options.slice().sort(), "expression table covers all six expressions");
  const indices = [...new Set(Object.values(SPRITE_PIXEL_PALETTE))].sort((a, b) => a - b);
  assert.deepEqual(indices, Array.from({ length: 20 }, (_, i) => i), "palette indices are unique/contiguous 0..19");

  // Face maps: exactly 14 rows × 14 chars of '.'/'O'/'s'.
  for (const [shape, rows] of Object.entries(SPRITE_PIXEL_FACE)) {
    assert.equal(rows.length, 14, `${shape} has 14 rows`);
    for (const row of rows) {
      assert.equal(row.length, 14, `${shape} rows are exactly 14 chars`);
      for (const char of row) assert.ok(char === "." || char === "O" || char === "s", `${shape} row char ${char}`);
    }
  }

  // Every authored coordinate is an integer inside 0..23 × 0..27.
  const points: string[] = [];
  for (const hair of Object.values(SPRITE_PIXEL_HAIR)) {
    for (const [yKey, runs] of Object.entries(hair.rows)) {
      const y = Number(yKey);
      for (const [start, end] of runs) {
        assert.ok(start <= end && start >= 0 && end < SPRITE_PIXEL_WIDTH && y >= 0 && y < SPRITE_PIXEL_HEIGHT, `hair run ${start}..${end} @${y}`);
        for (let x = start; x <= end; x += 1) points.push(`${x},${y}`);
      }
    }
    for (const [x, y] of [...hair.highlights, ...hair.parts]) points.push(`${x},${y}`);
  }
  for (const accessory of Object.values(SPRITE_PIXEL_ACCESSORY)) {
    for (const [x, y] of accessory.cells) points.push(`${x},${y}`);
  }
  for (const neckline of Object.values(SPRITE_PIXEL_PRESENTATION)) {
    for (const [x, y] of neckline) points.push(`${x},${y}`);
  }
  for (const glyph of Object.values(SPRITE_PIXEL_EXPRESSION)) {
    for (const [x, y] of [...glyph.brow, ...glyph.mouth]) points.push(`${x},${y}`);
  }
  for (const [x, y] of SPRITE_PIXEL_HARNESS) points.push(`${x},${y}`);
  for (const point of points) {
    const [x, y] = point.split(",").map(Number);
    assert.ok(Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < SPRITE_PIXEL_WIDTH && y >= 0 && y < SPRITE_PIXEL_HEIGHT, `coordinate ${point} in bounds`);
  }
  // Hair highlights and parts stay inside their connected masks (incl. tied-back tail).
  for (const [style, hair] of Object.entries(SPRITE_PIXEL_HAIR)) {
    const isHair = (x: number, y: number) => {
      const runs = hair.rows[y];
      return runs !== undefined && runs.some(([start, end]) => x >= start && x <= end);
    };
    for (const [x, y] of [...hair.highlights, ...hair.parts]) {
      assert.ok(isHair(x, y), `${style} highlight/part (${x},${y}) is inside the hair mask`);
    }
  }
  // Corrected NECK_SQUARE is symmetric about the x=11/12 gap and supported by all postures.
  const male = SPRITE_PIXEL_PRESENTATION.male;
  const mirrored = male.map(([x, y]) => [23 - x, y] as const);
  assert.deepEqual(mirrored.slice().sort(), male.slice().sort(), "NECK_SQUARE is mirror-symmetric (v2 Changes #2)");
  const female = SPRITE_PIXEL_PRESENTATION.female;
  const mirroredFemale = female.map(([x, y]) => [23 - x, y] as const);
  assert.deepEqual(mirroredFemale.slice().sort(), female.slice().sort(), "NECK_V is mirror-symmetric");
  for (const [x, y] of [...male, ...female]) {
    for (const [postureName, posture] of Object.entries(SPRITE_PIXEL_POSTURE)) {
      const runs = posture[y];
      assert.ok(runs !== undefined && runs.some(([start, end]) => x >= start && x <= end),
        `neckline cell (${x},${y}) is supported by the ${postureName} posture mask`);
    }
  }
  // The harness intersects neither neckline template nor either fixed trim bar.
  const harnessSet = new Set(SPRITE_PIXEL_HARNESS.map(([x, y]) => `${x},${y}`));
  for (const neckline of [...male, ...female]) assert.equal(harnessSet.has(`${neckline[0]},${neckline[1]}`), false, "harness avoids necklines");
  for (const coordinate of harnessSet) {
    const [hx, hy] = coordinate.split(",").map(Number);
    assert.ok(!((hy === 25) && ((hx >= 4 && hx <= 7) || (hx >= 16 && hx <= 19))), "harness avoids protected role bars");
  }
});

test("every expression glyph is unprotected skin in every face map and absent from every hair mask", () => {
  const allGlyphs: { brow: readonly (readonly [number, number])[]; mouth: readonly (readonly [number, number])[] }[] = [
    ...Object.values(SPRITE_PIXEL_EXPRESSION),
    ...Object.values(SPRITE_PIXEL_CALM_BROWS).map((cells) => ({ brow: cells, mouth: [] as const })),
    ...Object.values(SPRITE_PIXEL_CALM_MOUTHS).map((cells) => ({ brow: [] as const, mouth: cells })),
  ];
  for (const faceShape of ["oval", "square", "round"] as const) {
    for (const hairStyle of ["side-part", "crew", "crop", "bun", "bob", "tied-back"] as const) {
      const identity = buildSpritePixels(buildChiefSpriteSpec({
        ...neutralSpriteInput(),
        portrait: { ...spritePortrait, faceShape, hairStyle },
      })).identity.grid.cells;
      for (const glyph of allGlyphs) {
        for (const [x, y] of [...glyph.brow, ...glyph.mouth]) {
          const cell = identity[y * SPRITE_PIXEL_WIDTH + x];
          assert.ok(!cell.protected && cell.region === "skin" && inDeclaredRegion(x, y, "expression"),
            `glyph cell (${x},${y}) must be unprotected skin in an expression slot for ${faceShape}/${hairStyle}`);
        }
      }
    }
  }
});

test("calm micro-bias bins are exact at their boundaries and state glyphs ignore them", () => {
  const outlineCells = (render: ReturnType<typeof buildSpritePixels>, box: "brow" | "mouth") => {
    const cells: string[] = [];
    for (let y = 9; y <= 11; y += 1) {
      for (let x = 8; x <= 15; x += 1) {
        if (render.source.cells[y * SPRITE_PIXEL_WIDTH + x].basePaletteIndex === PIX.OUTLINE && box === "brow") cells.push(`${x},${y}`);
      }
    }
    for (let y = 15; y <= 16; y += 1) {
      for (let x = 9; x <= 14; x += 1) {
        if (render.source.cells[y * SPRITE_PIXEL_WIDTH + x].basePaletteIndex === PIX.OUTLINE && box === "mouth" && inDeclaredRegion(x, y, "expression")) cells.push(`${x},${y}`);
      }
    }
    return cells.sort();
  };
  const bins = (browTilt: number, mouthCurve: number) => {
    const render = buildSpritePixels(buildChiefSpriteSpec({
      ...neutralSpriteInput(),
      portrait: { ...spritePortrait, browTilt, mouthCurve },
    }));
    return { brow: outlineCells(render, "brow"), mouth: outlineCells(render, "mouth") };
  };
  const sortPoints = (points: readonly (readonly [number, number])[]) => points.map(([x, y]) => `${x},${y}`).sort();
  // Boundaries: brow down < -0.24, up > 0.24, else flat; mouth down < 0, up >= 0.40, else flat.
  assert.deepEqual(bins(-0.24, 0).brow, sortPoints(SPRITE_PIXEL_CALM_BROWS.flat), "brow -0.24 stays flat");
  assert.deepEqual(bins(-0.25, 0).brow, sortPoints(SPRITE_PIXEL_CALM_BROWS.down), "brow -0.25 goes down");
  assert.deepEqual(bins(0.24, 0).brow, sortPoints(SPRITE_PIXEL_CALM_BROWS.flat), "brow 0.24 stays flat");
  assert.deepEqual(bins(0.25, 0).brow, sortPoints(SPRITE_PIXEL_CALM_BROWS.up), "brow 0.25 goes up");
  assert.deepEqual(bins(0, -0.01).mouth, sortPoints(SPRITE_PIXEL_CALM_MOUTHS.down), "mouth -0.01 goes down");
  assert.deepEqual(bins(0, 0).mouth, sortPoints(SPRITE_PIXEL_CALM_MOUTHS.flat), "mouth 0 stays flat");
  assert.deepEqual(bins(0, 0.39).mouth, sortPoints(SPRITE_PIXEL_CALM_MOUTHS.flat), "mouth 0.39 stays flat");
  assert.deepEqual(bins(0, 0.40).mouth, sortPoints(SPRITE_PIXEL_CALM_MOUTHS.up), "mouth 0.40 goes up");
  // The authored calm base in the table is the flat/flat glyph.
  assert.deepEqual(SPRITE_PIXEL_EXPRESSION.calm.brow, SPRITE_PIXEL_CALM_BROWS.flat);
  assert.deepEqual(SPRITE_PIXEL_EXPRESSION.calm.mouth, SPRITE_PIXEL_CALM_MOUTHS.flat);
  // State-selected glyphs ignore the authored micro-bias entirely.
  const severeLow = buildSpritePixels(buildChiefSpriteSpec({
    ...neutralSpriteInput(),
    portrait: { ...spritePortrait, browTilt: -0.7, mouthCurve: -0.35 },
    variantState: variantState({ campaignStatus: "lost" }),
  }));
  const severeHigh = buildSpritePixels(buildChiefSpriteSpec({
    ...neutralSpriteInput(),
    portrait: { ...spritePortrait, browTilt: 0.7, mouthCurve: 0.9 },
    variantState: variantState({ campaignStatus: "lost" }),
  }));
  assert.deepEqual(severeLow.identity, severeHigh.identity, "brow/mouth micro-bias is not identity");
  assert.deepEqual(severeLow.output, severeHigh.output, "state glyphs ignore authored micro-bias");
  // Exact literal glyph locks (v2 §3.9).
  assert.deepEqual(sortPoints(SPRITE_PIXEL_EXPRESSION.severe.brow), ["10,11", "13,11", "14,10", "15,10", "15,9", "8,10", "8,9", "9,10"]);
  assert.deepEqual(sortPoints(SPRITE_PIXEL_EXPRESSION.severe.mouth), ["10,16", "11,15", "12,15", "13,16"]);
  assert.deepEqual(sortPoints(SPRITE_PIXEL_EXPRESSION.skeptical.brow), ["10,11", "13,11", "14,10", "15,10", "8,10", "9,10"]);
  assert.deepEqual(sortPoints(SPRITE_PIXEL_EXPRESSION.skeptical.mouth), ["10,15", "11,15", "12,15", "13,16"]);
  assert.deepEqual(sortPoints(SPRITE_PIXEL_EXPRESSION.strained.brow), ["10,11", "13,11", "14,10", "14,11", "15,10", "8,10", "9,10", "9,11"]);
  assert.deepEqual(sortPoints(SPRITE_PIXEL_EXPRESSION.strained.mouth), ["10,15", "11,16", "12,15", "13,16"]);
  assert.deepEqual(sortPoints(SPRITE_PIXEL_EXPRESSION.urgent.brow), ["10,9", "13,9", "14,9", "15,9", "8,9", "9,9"]);
  assert.deepEqual(sortPoints(SPRITE_PIXEL_EXPRESSION.urgent.mouth), ["11,15", "11,16", "12,15", "12,16"]);
  assert.deepEqual(sortPoints(SPRITE_PIXEL_EXPRESSION.resolved.brow), ["10,9", "13,9", "14,9", "15,10", "8,10", "9,9"]);
  assert.deepEqual(sortPoints(SPRITE_PIXEL_EXPRESSION.resolved.mouth), ["10,16", "11,16", "12,16", "13,16", "14,15", "9,15"]);
});

test("guarded writes require an explicit region discipline and reject invalid targets", () => {
  const grid = pixelRender().identity.grid;
  const backdropGuard = { allowedRegion: "backdrop" as const };
  assert.throws(() => writeSpriteCells(grid, [[3, 3, PIX.OUTLINE]]), /explicit.*guard/i, "an absent guard cannot write backdrop cells");
  assert.throws(() => writeSpriteCells(grid, [[3, 3, PIX.OUTLINE]], {}), /explicit.*guard/i, "an empty guard cannot write backdrop cells");
  assert.throws(() => writeSpriteCells(grid, [[-1, 5, PIX.OUTLINE]], backdropGuard), /out-of-bounds/);
  assert.throws(() => writeSpriteCells(grid, [[24, 5, PIX.OUTLINE]], backdropGuard), /out-of-bounds/);
  assert.throws(() => writeSpriteCells(grid, [[5, 28, PIX.OUTLINE]], backdropGuard), /out-of-bounds/);
  assert.throws(() => writeSpriteCells(grid, [[0, 5, PIX.OUTLINE]], backdropGuard), /protected/, "outer margin is protected");
  assert.throws(() => writeSpriteCells(grid, [[9, 12, PIX.OUTLINE]], backdropGuard), /protected/, "eyes are protected");
  assert.throws(() => writeSpriteCells(grid, [[11, 13, PIX.OUTLINE]], backdropGuard), /protected/, "nose is protected");
  assert.throws(() => writeSpriteCells(grid, [[5, 25, PIX.OUTLINE]], backdropGuard), /protected/, "trim bars are protected");
  assert.throws(() => writeSpriteCells(grid, [[8, 20, PIX.OUTLINE]], backdropGuard), /protected/, "neckline is protected");
  assert.throws(() => writeSpriteCells(grid, [[9, 23, PIX.OUTLINE]], { allowedSlot: "posture" }), /slot/, "torso cell is not a posture target");
  assert.throws(() => writeSpriteCells(grid, [[9, 23, PIX.OUTLINE]], { allowedRegion: "hair" }), /region/, "region guard rejects wrong region");
  assert.throws(() => writeSpriteCells(grid, [[9, 23, 20 as SpritePixelPaletteIndex]], { allowedSlots: ["support"] }), /palette index/, "palette index 20 is rejected");
  const written = writeSpriteCells(grid, [[9, 23, PIX.TRIM_BASE]], { allowedSlots: ["support"] });
  assert.equal(written.cells[23 * SPRITE_PIXEL_WIDTH + 9].basePaletteIndex, PIX.TRIM_BASE, "a declared support write succeeds");
  assert.equal(grid.cells[23 * SPRITE_PIXEL_WIDTH + 9].basePaletteIndex, PIX.UNIFORM_BASE, "the input grid is never mutated");
});

test("canonical calm art is locked: 28 semantic rows and 28 final color rows", () => {
  const render = pixelRender();
  assert.deepEqual(render.identity.portraitColors, ["#f0d2ba", "#181513", "#202b36", "#2e3736", "#8fcf88", "#142129", "#22313b"], "seven named colors in canonical order");
  assert.deepEqual(semanticRows(render), CALM_SEMANTIC_ROWS, "identity semantic grid is locked");
  assert.deepEqual(colorRows(render.output), CALM_COLOR_ROWS, "neutral final color matrix is locked");
  const grid = render.identity.grid.cells;
  assert.equal(grid[12 * SPRITE_PIXEL_WIDTH + 9].basePaletteIndex, PIX.EYE_BASE, "left eye");
  assert.equal(grid[12 * SPRITE_PIXEL_WIDTH + 14].basePaletteIndex, PIX.EYE_BASE, "right eye");
  assert.equal(grid[13 * SPRITE_PIXEL_WIDTH + 11].basePaletteIndex, PIX.SKIN_SHADOW, "nose is SKIN_SHADOW");
  assert.equal(grid[13 * SPRITE_PIXEL_WIDTH + 11].protected, true, "nose is protected");
  assert.equal(grid[14 * SPRITE_PIXEL_WIDTH + 12].basePaletteIndex, PIX.SKIN_SHADOW, "nose lower pixel");
  assert.equal(grid[14 * SPRITE_PIXEL_WIDTH + 12].protected, true);
  assert.equal(grid[25 * SPRITE_PIXEL_WIDTH + 5].basePaletteIndex, PIX.TRIM_BASE, "left role bar");
  assert.equal(grid[25 * SPRITE_PIXEL_WIDTH + 5].protected, true, "role bar is protected");
  assert.equal(grid[25 * SPRITE_PIXEL_WIDTH + 17].basePaletteIndex, PIX.TRIM_BASE, "right role bar");
  assert.equal(grid[20 * SPRITE_PIXEL_WIDTH + 8].basePaletteIndex, PIX.TRIM_BASE, "female V collar");
  assert.equal(grid[20 * SPRITE_PIXEL_WIDTH + 15].basePaletteIndex, PIX.TRIM_BASE, "V collar mirror");
  assert.equal(grid[22 * SPRITE_PIXEL_WIDTH + 10].basePaletteIndex, PIX.TRIM_BASE, "V collar point");
  assert.equal(grid[22 * SPRITE_PIXEL_WIDTH + 13].basePaletteIndex, PIX.TRIM_BASE, "V collar point mirror");
  assert.equal(grid[18 * SPRITE_PIXEL_WIDTH + 10].basePaletteIndex, PIX.SKIN_BASE, "neck skin behind the chin");
  assert.equal(grid[20 * SPRITE_PIXEL_WIDTH + 13].basePaletteIndex, PIX.SKIN_SHADOW, "neck right shadow column");
  // Calm flat/flat glyph pixels in the composed source (browTilt 0, mouthCurve 0).
  const source = render.source.cells;
  assert.equal(source[10 * SPRITE_PIXEL_WIDTH + 8].basePaletteIndex, PIX.OUTLINE, "flat brow left");
  assert.equal(source[10 * SPRITE_PIXEL_WIDTH + 15].basePaletteIndex, PIX.OUTLINE, "flat brow right");
  assert.equal(source[15 * SPRITE_PIXEL_WIDTH + 10].basePaletteIndex, PIX.OUTLINE, "flat mouth left");
  assert.equal(source[15 * SPRITE_PIXEL_WIDTH + 13].basePaletteIndex, PIX.OUTLINE, "flat mouth right");
  // The source outer margin stays background and protected in the neutral state.
  for (let index = 0; index < SPRITE_PIXEL_WIDTH * SPRITE_PIXEL_HEIGHT; index += 1) {
    const x = index % SPRITE_PIXEL_WIDTH;
    const y = Math.floor(index / SPRITE_PIXEL_WIDTH);
    if (x === 0 || x === SPRITE_PIXEL_WIDTH - 1 || y === 0 || y === SPRITE_PIXEL_HEIGHT - 1) {
      assert.equal(render.source.cells[index].basePaletteIndex, PIX.BG_BASE, `source margin (${x},${y}) stays background`);
      assert.equal(render.source.cells[index].protected, true, `source margin (${x},${y}) is protected`);
      assert.equal(render.sourceColors.cells[index], render.identity.palette[PIX.BG_BASE], `source margin color (${x},${y})`);
    }
  }
});

const CALM_SEMANTIC_ROWS = [
"bbbbbbbbbbbbbbbbbbbbbbbb",
  "bPPPPPPPPPPPPPPPPPPPPPPb",
  "bPHHHHHHHHHooHHHHHHHHHPb",
  "bPHpppppppoZaoppppppppPb",
  "bPHppppppoZaaaopppppppPb",
  "bPHppppooZZaaaaoopppppPb",
  "bPHpppooaaaaaaaaooppppPb",
  "bPHppooaaaaAAaaaaoopppPb",
  "bPHppooaAAossoAAaoopppPb",
  "bPHppoooLsssssssooopppPb",
  "bPHppooossssssssooopppPb",
  "bPHppossssssssssSsopppPb",
  "bPHpposssessssesSsopppPb",
  "bPHpposssssSssssSsopppPb",
  "bPHppposssssSssSsoppppPb",
  "bPHpppposssssssSopppppPb",
  "bPHpppppossssssoppppppPb",
  "bPHppppppoossoopppppppPb",
  "bPHpppppppsssSppppppppPb",
  "bPHpppppppsssSppppppppPb",
  "bPHppppptpsssSptppppppPb",
  "bPHpppppptpppptpppppppPb",
  "bPHppppppptpptppppppppPb",
  "bPoVVVuuuuuuuuuuuuUUUoPb",
  "bPoVVVuuuuuuuuuuuuUUUoPb",
  "bPouttttuuuuuuuuttttUoPb",
  "bPouuuuuuuuuuuuuuuUUUoPb",
  "bbbbbbbbbbbbbbbbbbbbbbbb",
];

const CALM_COLOR_ROWS = [
"#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129",
  "#142129#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#19242c#142129",
  "#142129#19242c#4e5a62#4e5a62#4e5a62#4e5a62#4e5a62#4e5a62#4e5a62#4e5a62#4e5a62#0f161a#0f161a#4e5a62#4e5a62#4e5a62#4e5a62#4e5a62#4e5a62#4e5a62#4e5a62#4e5a62#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#22313b#22313b#22313b#22313b#22313b#0f161a#464342#181513#0f161a#22313b#22313b#22313b#22313b#22313b#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#22313b#22313b#22313b#22313b#0f161a#464342#181513#181513#181513#0f161a#22313b#22313b#22313b#22313b#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#22313b#22313b#0f161a#0f161a#464342#464342#181513#181513#181513#181513#0f161a#0f161a#22313b#22313b#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#22313b#0f161a#0f161a#181513#181513#181513#181513#181513#181513#181513#181513#0f161a#0f161a#22313b#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#0f161a#0f161a#181513#181513#181513#181513#120f0e#120f0e#181513#181513#181513#181513#0f161a#0f161a#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#0f161a#0f161a#181513#120f0e#120f0e#0f161a#f0d2ba#f0d2ba#0f161a#120f0e#120f0e#181513#0f161a#0f161a#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#0f161a#0f161a#0f161a#f3dbc7#f0d2ba#f0d2ba#f0d2ba#f0d2ba#f0d2ba#f0d2ba#f0d2ba#0f161a#0f161a#0f161a#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#0f161a#0f161a#0f161a#0f161a#0f161a#0f161a#f0d2ba#f0d2ba#0f161a#0f161a#0f161a#0f161a#0f161a#0f161a#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#0f161a#f0d2ba#f0d2ba#f0d2ba#f0d2ba#f0d2ba#f0d2ba#f0d2ba#f0d2ba#f0d2ba#f0d2ba#b49d8b#f0d2ba#0f161a#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#0f161a#f0d2ba#f0d2ba#f0d2ba#202b36#f0d2ba#f0d2ba#f0d2ba#f0d2ba#202b36#f0d2ba#b49d8b#f0d2ba#0f161a#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#0f161a#f0d2ba#f0d2ba#f0d2ba#f0d2ba#f0d2ba#b49d8b#f0d2ba#f0d2ba#f0d2ba#f0d2ba#b49d8b#f0d2ba#0f161a#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#22313b#0f161a#f0d2ba#f0d2ba#f0d2ba#f0d2ba#f0d2ba#b49d8b#f0d2ba#f0d2ba#b49d8b#f0d2ba#0f161a#22313b#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#22313b#22313b#0f161a#f0d2ba#f0d2ba#0f161a#0f161a#0f161a#0f161a#f0d2ba#b49d8b#0f161a#22313b#22313b#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#22313b#22313b#22313b#0f161a#f0d2ba#f0d2ba#f0d2ba#f0d2ba#f0d2ba#f0d2ba#0f161a#22313b#22313b#22313b#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#22313b#22313b#22313b#22313b#0f161a#0f161a#f0d2ba#f0d2ba#0f161a#0f161a#22313b#22313b#22313b#22313b#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#22313b#22313b#22313b#22313b#22313b#f0d2ba#f0d2ba#f0d2ba#b49d8b#22313b#22313b#22313b#22313b#22313b#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#22313b#22313b#22313b#22313b#0f161a#f0d2ba#f0d2ba#f0d2ba#b49d8b#0f161a#22313b#22313b#22313b#22313b#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#22313b#22313b#0f161a#0f161a#8fcf88#2e3736#f0d2ba#f0d2ba#f0d2ba#b49d8b#2e3736#8fcf88#0f161a#0f161a#22313b#22313b#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#22313b#0f161a#0f161a#575f5e#575f5e#2e3736#8fcf88#2e3736#2e3736#2e3736#2e3736#8fcf88#2e3736#222928#222928#0f161a#0f161a#22313b#22313b#19242c#142129",
  "#142129#19242c#4e5a62#0f161a#575f5e#575f5e#575f5e#575f5e#2e3736#2e3736#8fcf88#2e3736#2e3736#8fcf88#2e3736#2e3736#222928#222928#222928#222928#0f161a#22313b#19242c#142129",
  "#142129#19242c#0f161a#575f5e#575f5e#575f5e#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#222928#222928#222928#0f161a#19242c#142129",
  "#142129#19242c#0f161a#575f5e#575f5e#575f5e#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#222928#222928#222928#0f161a#19242c#142129",
  "#142129#19242c#0f161a#2e3736#8fcf88#8fcf88#8fcf88#8fcf88#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#8fcf88#8fcf88#8fcf88#8fcf88#222928#0f161a#19242c#142129",
  "#142129#19242c#0f161a#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#2e3736#222928#222928#222928#0f161a#19242c#142129",
  "#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129#142129",
];



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

test("the Halden compound state composes exactly per the v2 §3.12 lock", () => {
  const halden = { id: "halden", name: "Dr. Elias Halden", genderPresentation: "male" as const, directorate: "intelligence" as const, title: "Dr.", doctrineBias: "bias", temperament: "meticulous", competence: 0.8, riskTolerance: 0.5, preferredTags: [], concernTags: [] };
  const haldenPortrait = { genderPresentation: "male" as const, skinTone: "#d5aa8c", hairColor: "#6f5a48", eyeColor: "#202b36", uniformColor: "#324040", trimColor: "#78c4d4", backgroundColor: "#1a2722", panelColor: "#244239", faceShape: "round" as const, hairStyle: "side-part" as const, accessory: "earpiece" as const, browTilt: -0.67, mouthCurve: -0.02 };
  const state = { trustBand: "strained" as const, burdenLevel: "overloaded" as const, campaignStatus: "lost" as const, s2ExternalEstimateConfidence: 30, s4SupportableTempo: 50 };
  const sprite = buildChiefSpriteSpec({ chief: halden, portrait: haldenPortrait, sessionSeed: "brass-ledger-jhq", variantState: state, visualLanguage: spriteVisualLanguage });
  assert.equal(sprite.expression, "severe");
  assert.deepEqual(sprite.variant, {
    effects: ["trust-low", "directorate-overloaded", "campaign-lost", "s2-low-confidence"],
    posture: "closed", backgroundDarkenOpacity: 0.22, saturation: 0.45, framing: "tight", supportDetail: "none",
  }, "the verified #52 policy output from v2 §3.12");
  const render = buildSpritePixels(sprite);
  const { identity, source, sourceColors, output } = render;
  // Severe glyph cells are OUTLINE in the composed source.
  for (const [x, y] of [[8, 9], [8, 10], [9, 10], [10, 11], [13, 11], [14, 10], [15, 9], [15, 10], [11, 15], [12, 15], [10, 16], [13, 16]]) {
    assert.equal(source.cells[y * SPRITE_PIXEL_WIDTH + x].basePaletteIndex, PIX.OUTLINE, `severe cell (${x},${y})`);
  }
  // Closed posture: the y20 run is entirely protected identity (collar + neck);
  // y21/y22 are painted with the shoulder rule.
  const collarM = (x: number, y: number) => SPRITE_PIXEL_PRESENTATION.male.some(([cx, cy]) => cx === x && cy === y);
  for (let x = 8; x <= 15; x += 1) {
    const index = source.cells[20 * SPRITE_PIXEL_WIDTH + x].basePaletteIndex;
    assert.ok(collarM(x, 20) ? index === PIX.TRIM_BASE : index === PIX.SKIN_BASE || index === PIX.SKIN_SHADOW, `closed y20 (${x},20) stays protected identity`);
  }
  assert.equal(source.cells[21 * SPRITE_PIXEL_WIDTH + 6].basePaletteIndex, PIX.OUTLINE, "y21 left step");
  assert.equal(source.cells[21 * SPRITE_PIXEL_WIDTH + 8].basePaletteIndex, PIX.UNIFORM_BASE, "y21 uniform");
  assert.equal(source.cells[21 * SPRITE_PIXEL_WIDTH + 11].basePaletteIndex, PIX.UNIFORM_BASE, "neck ends at y=20; (11,21) is uniform");
  assert.equal(source.cells[22 * SPRITE_PIXEL_WIDTH + 6].basePaletteIndex, PIX.UNIFORM_HIGHLIGHT, "y22 left highlight cluster");
  assert.equal(source.cells[22 * SPRITE_PIXEL_WIDTH + 17].basePaletteIndex, PIX.UNIFORM_SHADOW, "y22 right shadow cluster");
  // No harness: the support slot stays untouched.
  assert.equal(source.cells[25 * SPRITE_PIXEL_WIDTH + 11].basePaletteIndex, PIX.UNIFORM_BASE, "no harness pocket fill");
  // Overload tint: exactly D minus the protected earpiece cells (v2 §3.12 step 3).
  const earpieceSet = new Set(SPRITE_PIXEL_ACCESSORY.earpiece.cells.map(([x, y]) => `${x},${y}`));
  const tinted: string[] = [];
  for (let index = 0; index < SPRITE_PIXEL_WIDTH * SPRITE_PIXEL_HEIGHT; index += 1) {
    const cell = source.cells[index];
    const x = index % SPRITE_PIXEL_WIDTH;
    const y = Math.floor(index / SPRITE_PIXEL_WIDTH);
    if (cell.protected || cell.region !== "backdrop" || !spriteDarkenVignette(x, y)) continue;
    assert.equal(sourceColors.cells[index], spriteLoadTint(identity.palette[cell.basePaletteIndex]), `tint (${x},${y})`);
    tinted.push(`${x},${y}`);
  }
  const expectedTint: string[] = [];
  for (let y = 2; y <= 3; y += 1) {
    for (let x = 1; x <= 22; x += 1) {
      if ((x >= 1 && x <= 8) || (x >= 15 && x <= 22)) if (!earpieceSet.has(`${x},${y}`)) expectedTint.push(`${x},${y}`);
    }
  }
  for (let y = 4; y <= 18; y += 1) {
    for (let x = 1; x <= 22; x += 1) {
      if ((x >= 1 && x <= 4) || (x >= 19 && x <= 22)) if (!earpieceSet.has(`${x},${y}`)) expectedTint.push(`${x},${y}`);
    }
  }
  assert.deepEqual(tinted.sort(), expectedTint.sort(), "Halden tint set is exactly D minus the earpiece");
  // Eligible-skin desaturation rows (v2 §3.12 step 4); the protected nose stays byte-identical.
  const documentedDesat: Record<number, number[]> = {
    8: [13, 14], 9: [9, 10, 11, 12, 13, 14, 16], 10: [10, 11, 12, 13, 16], 11: [6, 7, 8, 9, 11, 12, 14, 15, 16, 17],
    12: [6, 7, 8, 10, 11, 12, 13, 15, 16, 17], 13: [6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17], 14: [7, 8, 9, 10, 11, 13, 14, 15, 16],
    15: [8, 9, 10, 13, 14, 15], 16: [11, 12],
  };
  const desat: Record<number, number[]> = {};
  for (let index = 0; index < SPRITE_PIXEL_WIDTH * SPRITE_PIXEL_HEIGHT; index += 1) {
    const cell = source.cells[index];
    const x = index % SPRITE_PIXEL_WIDTH;
    const y = Math.floor(index / SPRITE_PIXEL_WIDTH);
    if (y < 4 || y > 17 || cell.protected || cell.region !== "skin") continue;
    if (![PIX.SKIN_BASE, PIX.SKIN_SHADOW, PIX.SKIN_HIGHLIGHT].includes(cell.basePaletteIndex)) continue;
    const base = identity.palette[cell.basePaletteIndex];
    if (sourceColors.cells[index] !== base) {
      assert.equal(sourceColors.cells[index], spriteDesaturate45(base), `desat (${x},${y})`);
      (desat[y] ??= []).push(x);
    }
  }
  for (const [y, xs] of Object.entries(documentedDesat)) {
    assert.deepEqual((desat[Number(y)] ?? []).sort((a, b) => a - b), [...xs].sort((a, b) => a - b), `desat row y${y} matches the documented set`);
  }
  assert.equal(sourceColors.cells[13 * SPRITE_PIXEL_WIDTH + 11], identity.palette[PIX.SKIN_SHADOW], "nose (11,13) byte-identical");
  assert.equal(sourceColors.cells[14 * SPRITE_PIXEL_WIDTH + 12], identity.palette[PIX.SKIN_SHADOW], "nose (12,14) byte-identical");
  // Tight framing is the literal 24-entry projection vector (v2 §3.11).
  for (let y = 0; y < SPRITE_PIXEL_HEIGHT; y += 1) {
    for (let x = 0; x < SPRITE_PIXEL_WIDTH; x += 1) {
      assert.equal(output.cells[y * SPRITE_PIXEL_WIDTH + x], sourceColors.cells[y * SPRITE_PIXEL_WIDTH + SPRITE_PIXEL_TIGHT_X_MAP[x]], `projection (${x},${y})`);
    }
  }
  // Full 28-row final RGB matrix lock.
  assert.deepEqual(colorRows(output), HALDEN_COLOR_ROWS, "Halden compound final matrix is locked");
  // Trim bars survive every compound effect.
  assert.equal(sourceColors.cells[25 * SPRITE_PIXEL_WIDTH + 5], identity.palette[PIX.TRIM_BASE]);
  assert.equal(sourceColors.cells[25 * SPRITE_PIXEL_WIDTH + 17], identity.palette[PIX.TRIM_BASE]);
});

const HALDEN_COLOR_ROWS = [
"#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722",
"#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a#1b312a",
"#3d504a#3d504a#3d504a#3d504a#3d504a#3d504a#3d504a#3d504a#3d504a#4f6760#4f6760#4f6760#4f6760#4f6760#4f6760#4f6760#3d504a#3d504a#3d504a#3d504a#3d504a#3d504a#3d504a#3d504a",
"#3d504a#3d504a#1c332c#1c332c#1c332c#1c332c#1c332c#1c332c#1c332c#244239#244239#244239#244239#244239#244239#244239#1c332c#1c332c#1c332c#1c332c#1c332c#1c332c#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#244239#244239#244239#244239#244239#101d19#101d19#101d19#101d19#101d19#101d19#101d19#244239#244239#244239#244239#244239#1c332c#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#244239#244239#101d19#101d19#101d19#8b7b6c#8b7b6c#6f5a48#6f5a48#6f5a48#101d19#6f5a48#101d19#101d19#244239#244239#244239#1c332c#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#244239#101d19#101d19#101d19#8b7b6c#8b7b6c#6f5a48#6f5a48#6f5a48#6f5a48#101d19#6f5a48#6f5a48#6f5a48#101d19#101d19#244239#1c332c#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#101d19#101d19#6f5a48#6f5a48#6f5a48#6f5a48#6f5a48#6f5a48#101d19#101d19#534336#534336#6f5a48#6f5a48#101d19#101d19#101d19#1c332c#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#101d19#101d19#6f5a48#6f5a48#534336#534336#534336#534336#101d19#101d19#c0ad9f#c0ad9f#101d19#534336#101d19#101d19#101d19#1c332c#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#101d19#101d19#101d19#101d19#101d19#c0ad9f#c0ad9f#c0ad9f#c0ad9f#c0ad9f#c0ad9f#c0ad9f#101d19#908177#101d19#101d19#101d19#1c332c#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#101d19#101d19#101d19#101d19#101d19#101d19#c0ad9f#c0ad9f#c0ad9f#c0ad9f#c0ad9f#101d19#101d19#908177#101d19#101d19#93cfdc#1c332c#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#101d19#c0ad9f#c0ad9f#c0ad9f#c0ad9f#c0ad9f#101d19#c0ad9f#c0ad9f#c0ad9f#101d19#c0ad9f#c0ad9f#908177#c0ad9f#c0ad9f#101d19#93cfdc#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#101d19#c0ad9f#c0ad9f#c0ad9f#c0ad9f#202b36#c0ad9f#c0ad9f#c0ad9f#c0ad9f#c0ad9f#202b36#c0ad9f#908177#c0ad9f#c0ad9f#101d19#93cfdc#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#101d19#c0ad9f#c0ad9f#c0ad9f#c0ad9f#c0ad9f#c0ad9f#9f7f69#c0ad9f#c0ad9f#c0ad9f#c0ad9f#c0ad9f#908177#c0ad9f#c0ad9f#93cfdc#1c332c#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#244239#101d19#c0ad9f#c0ad9f#c0ad9f#c0ad9f#c0ad9f#c0ad9f#9f7f69#9f7f69#c0ad9f#c0ad9f#908177#c0ad9f#101d19#101d19#244239#1c332c#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#244239#244239#101d19#101d19#c0ad9f#c0ad9f#c0ad9f#101d19#101d19#101d19#c0ad9f#c0ad9f#908177#101d19#244239#244239#244239#1c332c#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#244239#244239#244239#244239#101d19#101d19#101d19#c0ad9f#c0ad9f#c0ad9f#101d19#101d19#101d19#244239#244239#244239#244239#1c332c#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#244239#244239#244239#244239#244239#244239#101d19#101d19#101d19#101d19#101d19#244239#244239#244239#244239#244239#244239#1c332c#1c332c#1c332c",
"#3d504a#3d504a#1c332c#1c332c#244239#244239#244239#244239#244239#244239#d5aa8c#d5aa8c#d5aa8c#d5aa8c#9f7f69#244239#244239#244239#244239#244239#244239#1c332c#1c332c#1c332c",
"#4f6760#4f6760#244239#244239#244239#244239#244239#244239#244239#244239#d5aa8c#d5aa8c#d5aa8c#d5aa8c#9f7f69#244239#244239#244239#244239#244239#244239#244239#244239#244239",
"#4f6760#4f6760#244239#244239#244239#244239#244239#244239#78c4d4#78c4d4#d5aa8c#d5aa8c#d5aa8c#d5aa8c#9f7f69#78c4d4#78c4d4#244239#244239#244239#244239#244239#244239#244239",
"#4f6760#4f6760#244239#244239#244239#101d19#101d19#101d19#324040#78c4d4#78c4d4#324040#324040#324040#78c4d4#78c4d4#324040#101d19#101d19#101d19#244239#244239#244239#244239",
"#4f6760#4f6760#244239#101d19#101d19#5b6666#5b6666#5b6666#324040#324040#324040#324040#324040#324040#324040#324040#324040#253030#253030#253030#101d19#101d19#244239#244239",
"#101d19#101d19#5b6666#5b6666#5b6666#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#253030#253030#253030#101d19",
"#101d19#101d19#5b6666#5b6666#5b6666#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#253030#253030#253030#101d19",
"#101d19#101d19#324040#78c4d4#78c4d4#78c4d4#78c4d4#78c4d4#324040#324040#324040#324040#324040#324040#324040#324040#324040#78c4d4#78c4d4#78c4d4#78c4d4#78c4d4#253030#101d19",
"#101d19#101d19#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#324040#253030#253030#253030#101d19",
"#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722#1a2722"
];

test("pixel identity is deep-equal across all nine states and protected cells never change", () => {
  const renders = pixelNineStates.map((state) => pixelRender(state));
  for (const render of renders) {
    assert.deepEqual(render.identity, renders[0].identity, "identity object must be state-invariant");
    assert.deepEqual(render.identity.portraitColors, renders[0].identity.portraitColors, "seven named colors never change");
    for (let index = 0; index < SPRITE_PIXEL_WIDTH * SPRITE_PIXEL_HEIGHT; index += 1) {
      const identityCell = render.identity.grid.cells[index];
      if (identityCell.protected) {
        assert.deepEqual(render.source.cells[index], identityCell, `protected cell ${index} semantics are state-invariant`);
        assert.equal(render.sourceColors.cells[index], render.identity.palette[identityCell.basePaletteIndex], `protected cell ${index} RGB is state-invariant`);
        // §3.13.2's RGB invariant is pre-projection: tight output may remap edge columns.
        // pixelNineStates is S1 (S2-tight is role-gated); the Halden test locks tight output.
        assert.equal(render.output.cells[index], render.identity.palette[identityCell.basePaletteIndex], `protected cell ${index} output RGB is state-invariant`);
      }
    }
  }
});

test("effect-region exactness and totality lock every declared source control", () => {
  const point = (coordinate: string) => coordinate.split(",").map(Number) as [number, number];
  const union = (...sets: readonly string[][]) => [...new Set(sets.flat())].sort();
  const closedPostureDiff = [
    "14,19", "14,20", "16,20", "16,21", "17,20", "17,21", "18,21", "18,22", "19,21", "19,22", "20,22",
    "3,22", "4,21", "4,22", "5,21", "5,22", "6,20", "6,21", "7,20", "7,21", "9,19", "9,20",
  ].sort();
  const openPostureDiff = [
    "1,22", "15,19", "16,19", "16,20", "18,20", "18,21", "19,20", "19,21", "2,21", "2,22", "20,21",
    "20,22", "21,21", "21,22", "22,22", "3,21", "3,22", "4,20", "4,21", "5,20", "5,21", "7,19", "7,20", "8,19",
  ].sort();
  const glyphDiff = {
    skeptical: ["10,10", "10,11", "13,10", "13,11", "13,15", "13,16"],
    strained: ["10,10", "10,11", "11,15", "11,16", "13,10", "13,11", "13,15", "13,16", "14,11", "9,11"],
    resolved: ["10,10", "10,15", "10,16", "10,9", "11,15", "11,16", "12,15", "12,16", "13,10", "13,15", "13,16", "13,9", "14,10", "14,15", "14,9", "9,10", "9,15", "9,9"],
    severe: ["10,10", "10,11", "10,15", "10,16", "13,10", "13,11", "13,15", "13,16", "15,9", "8,9"],
  } as const;
  const declaredTransformCells = (render: ReturnType<typeof buildSpritePixels>, region: "tint" | "desat") => {
    const skinSlots = new Set([PIX.SKIN_BASE, PIX.SKIN_SHADOW, PIX.SKIN_HIGHLIGHT]);
    return render.source.cells.flatMap((cell, index) => {
      const x = index % SPRITE_PIXEL_WIDTH;
      const y = Math.floor(index / SPRITE_PIXEL_WIDTH);
      const eligible = !cell.protected
        && (region === "tint"
          ? cell.region === "backdrop" && inDeclaredRegion(x, y, "tint")
          : cell.region === "skin" && skinSlots.has(cell.basePaletteIndex) && inDeclaredRegion(x, y, "desat"));
      return eligible ? [`${x},${y}`] : [];
    }).sort();
  };

  const neutral = pixelRender();
  const s2Neutral = pixelRender(variantState(), s2ChiefFixture);
  const s4Neutral = pixelRender(variantState(), s4ChiefFixture);
  const cases = [
    { effect: "trust-low", render: pixelRender(variantState({ trustBand: "strained" })), neutral, semantic: union(closedPostureDiff, glyphDiff.skeptical) },
    { effect: "trust-high", render: pixelRender(variantState({ trustBand: "solid" })), neutral, semantic: openPostureDiff },
    { effect: "directorate-strained", render: pixelRender(variantState({ burdenLevel: "strained" })), neutral, semantic: glyphDiff.strained },
    { effect: "directorate-overloaded", render: pixelRender(variantState({ burdenLevel: "overloaded" })), neutral, semantic: glyphDiff.strained, transform: "tint" as const },
    { effect: "campaign-won", render: pixelRender(variantState({ campaignStatus: "won" })), neutral, semantic: glyphDiff.resolved },
    { effect: "campaign-lost", render: pixelRender(variantState({ campaignStatus: "lost" })), neutral, semantic: glyphDiff.severe, transform: "desat" as const },
  ] as const;

  for (const { effect, render, neutral: baseline, semantic, transform } of cases) {
    assert.deepEqual(render.identity, baseline.identity, `${effect}: identity is unchanged`);
    assert.deepEqual(semanticDiff(baseline.source.cells, render.source.cells), semantic, `${effect}: source semantic diff is exact`);
    const expectedColorDiff = transform === undefined ? semantic : union(semantic, declaredTransformCells(render, transform));
    assert.deepEqual(sourceColorDiff(baseline.sourceColors.cells, render.sourceColors.cells), expectedColorDiff, `${effect}: source RGB diff is exact`);
    assert.notDeepEqual(render.output.cells, baseline.output.cells, `${effect}: declared representation visibly changes output`);
  }

  // S2 framing is only a read-only camera projection: source semantics and RGB are byte-identical.
  const s2Tight = pixelRender(variantState({ s2ExternalEstimateConfidence: 20 }), s2ChiefFixture);
  assert.deepEqual(s2Tight.source, s2Neutral.source, "s2-low-confidence makes zero source semantic writes");
  assert.deepEqual(s2Tight.sourceColors, s2Neutral.sourceColors, "s2-low-confidence makes zero source RGB writes");
  assert.notDeepEqual(s2Tight.output, s2Neutral.output, "s2-low-confidence has the declared tight projection representation");

  // The §3.11 table has 22 authoring writes, with two strap/rim entries sharing cells.
  const harnessWrites = SPRITE_PIXEL_HARNESS.map(([x, y]) => `${x},${y}`);
  const harnessCells = [...new Set(harnessWrites)].sort();
  assert.equal(harnessWrites.length, 22, "§3.11 declares all 22 harness writes");
  assert.equal(harnessCells.length, 20, "the two shared strap/rim cells are counted once in a source diff");
  assert.ok(harnessCells.every((coordinate) => inDeclaredRegion(...point(coordinate), "harness")), "every harness cell stays inside its declared region");
  const s4Harness = pixelRender(variantState({ s4SupportableTempo: 5 }), s4ChiefFixture);
  assert.deepEqual(semanticDiff(s4Neutral.source.cells, s4Harness.source.cells), harnessCells, "s4-bottleneck writes exactly the declared harness cells");
  assert.deepEqual(sourceColorDiff(s4Neutral.sourceColors.cells, s4Harness.sourceColors.cells), harnessCells, "s4-bottleneck changes RGB at exactly the declared harness cells");
  assert.notDeepEqual(s4Harness.output.cells, s4Neutral.output.cells, "s4-bottleneck has the declared harness representation");
});

test("pixel bytes are deterministic per (portrait, state) and independent of prompt and seed", () => {
  assert.deepEqual(pixelRender(), pixelRender(), "same state twice is deep-equal");
  assert.equal(buildAdvisorPortraitSvg(pixelSprite()), buildAdvisorPortraitSvg(pixelSprite()));
  assert.equal(buildAdvisorPortraitDataUri(pixelSprite()), buildAdvisorPortraitDataUri(pixelSprite()));
  const first = buildChiefSpriteSpec(structuredClone(neutralSpriteInput()));
  const second = buildChiefSpriteSpec(structuredClone(neutralSpriteInput()));
  assert.deepEqual(buildSpritePixels(first), buildSpritePixels(second));
  assert.equal(buildAdvisorPortraitSvg(first), buildAdvisorPortraitSvg(second));
  // deterministicSeed and prompt are not pixel inputs.
  const otherSeed = buildChiefSpriteSpec({ ...neutralSpriteInput(), sessionSeed: "different-session" });
  assert.deepEqual(buildSpritePixels(otherSeed).output, pixelRender().output, "seed never enters pixels");
  const editedPrompt = spriteSpecSchema.parse({ ...pixelSprite(), prompt: "an unrelated prompt that only changes prompt text" });
  assert.deepEqual(buildSpritePixels(editedPrompt).output, pixelRender().output, "prompt never enters pixels");
  // States that change canonical controls are unequal.
  assert.notEqual(buildAdvisorPortraitSvg(pixelSprite(variantState({ campaignStatus: "lost" }))), buildAdvisorPortraitSvg(pixelSprite()));
  assert.notEqual(buildAdvisorPortraitSvg(pixelSprite(variantState({ trustBand: "strained" }))), buildAdvisorPortraitSvg(pixelSprite()));
});

test("the seven named portrait colors are the only color sources; sprite.palette is ignored", () => {
  const base = pixelSprite();
  const baseRender = buildSpritePixels(base);
  // Mutating only sprite.palette (still schema-valid) must not change pixels.
  const reordered = spriteSpecSchema.parse({ ...base, palette: [...base.palette].reverse() });
  assert.deepEqual(buildSpritePixels(reordered), baseRender, "sprite.palette is ignored for rendering (v2 Changes #3/#4)");
  // Each named color change propagates to its identity palette slot and the output.
  const directSlots: Record<string, number> = {
    skinTone: 6, hairColor: 9, eyeColor: 12, uniformColor: 13, trimColor: 16, backgroundColor: 0, panelColor: 3,
  };
  for (const [field, slot] of Object.entries(directSlots)) {
    const changed = spriteSpecSchema.parse({ ...base, [field]: "#102030" });
    const render = buildSpritePixels(changed);
    assert.equal(render.identity.palette[slot], "#102030", `${field} maps to palette slot ${slot}`);
    assert.notDeepEqual(render.output.cells, baseRender.output.cells, `${field} changes the pixels`);
  }
  // Unsupported color syntax fails clearly at the render boundary.
  assert.throws(() => buildSpritePixels(spriteSpecSchema.parse({ ...base, skinTone: "not-a-color" })), /#RRGGBB/);
  assert.throws(() => buildSpritePixels(spriteSpecSchema.parse({ ...base, skinTone: "#12345" })), /#RRGGBB/);
  assert.throws(() => buildSpritePixels(spriteSpecSchema.parse({ ...base, skinTone: "#GGGGGG" })), /#RRGGBB/);
});

test("SVG serializer is exact, bounded, and minimal", () => {
  const render = pixelRender();
  const svg = buildAdvisorPortraitSvg(pixelSprite());
  assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="28" viewBox="0 0 24 28" shape-rendering="crispEdges" role="img" aria-label="Generated advisor portrait">'), "root is fixed");
  assert.ok(svg.endsWith("</svg>"));
  assert.ok(!svg.includes("<path") && !svg.includes("<circle") && !svg.includes("<ellipse"), "no vector geometry");
  assert.ok(!svg.includes("<filter") && !svg.includes("opacity") && !svg.includes("stroke"), "no filters/opacity/strokes");
  const runs = spritePixelRuns(render.output.cells);
  const covered = new Set<number>();
  let area = 0;
  for (const run of runs) {
    assert.ok(Number.isInteger(run.x) && Number.isInteger(run.y) && Number.isInteger(run.width), "integer rect coordinates");
    for (let dx = 0; dx < run.width; dx += 1) {
      const index = run.y * SPRITE_PIXEL_WIDTH + run.x + dx;
      assert.equal(covered.has(index), false, "runs never overlap");
      assert.equal(render.output.cells[index], run.color, "run color matches the canonical matrix");
      covered.add(index);
    }
    area += run.width;
  }
  assert.equal(covered.size, SPRITE_PIXEL_WIDTH * SPRITE_PIXEL_HEIGHT, "runs cover all 672 cells exactly once");
  assert.equal(area, SPRITE_PIXEL_WIDTH * SPRITE_PIXEL_HEIGHT);
  assert.equal((svg.match(/<rect /g) ?? []).length, runs.length, "one rect per run");
  // Bounds: checkerboard = 672 runs; uniform = 28 runs.
  const checker: SpriteHexColor[] = Array.from({ length: SPRITE_PIXEL_WIDTH * SPRITE_PIXEL_HEIGHT }, (_, i) => (i % 2 === 0 ? "#000000" : "#ffffff") as SpriteHexColor);
  assert.equal(spritePixelRuns(checker).length, SPRITE_PIXEL_WIDTH * SPRITE_PIXEL_HEIGHT);
  const uniform: SpriteHexColor[] = Array.from({ length: SPRITE_PIXEL_WIDTH * SPRITE_PIXEL_HEIGHT }, () => "#000000" as SpriteHexColor);
  assert.equal(spritePixelRuns(uniform).length, SPRITE_PIXEL_HEIGHT);
});

test("pixel color math is exact integer arithmetic over the seven named sources", () => {
  assert.equal(spriteShadowTone("#ddb395"), "#a5866f");
  assert.equal(spriteHighlightTone("#ddb395"), "#e3c2aa");
  assert.equal(spriteOutlineTone("#22313b"), "#0f161a");
  assert.equal(spriteLoadTint("#244239"), "#1c332c");
  assert.equal(spriteLuma("#f0d2ba"), 214);
  assert.equal(spriteDesaturate45("#f0d2ba"), "#e1d4c9");
  const sources = ["#f0d2ba", "#181513", "#202b36", "#2e3736", "#8fcf88", "#142129", "#22313b"] as const;
  const palette = resolveSpriteBasePalette(sources);
  assert.equal(palette.length, 20);
  const transforms = (color: string) => [
    color,
    spriteShadowTone(color as SpriteHexColor),
    spriteHighlightTone(color as SpriteHexColor),
    spriteOutlineTone(color as SpriteHexColor),
  ];
  const allowed = new Set(sources.flatMap((color) => transforms(color)));
  for (const tone of palette) {
    assert.ok(allowed.has(tone), `base tone ${tone} traces to one of the seven named sources`);
  }
  // Serialization is always lowercase six-digit hex.
  for (const tone of palette) assert.match(tone, /^#[0-9a-f]{6}$/);
});

test("the brass-ledger-jhq reference seed yields the exact six-chief enumeration (v2 §2.3)", () => {
  const roster = generateAdvisorRoster(soloScenario.chiefs, "brass-ledger-jhq");
  assert.equal(roster.length, 6);
  const expected: Record<string, { genderPresentation: string; skinTone: string; hairColor: string; eyeColor: string; uniformColor: string; trimColor: string; backgroundColor: string; panelColor: string; faceShape: string; hairStyle: string; accessory: string; browTilt: number; mouthCurve: number }> = {
    warden: { genderPresentation: "female", skinTone: "#ddb395", hairColor: "#c9d7df", eyeColor: "#607861", uniformColor: "#394045", trimColor: "#8fcf88", backgroundColor: "#14221e", panelColor: "#233244", faceShape: "oval", hairStyle: "bob", accessory: "none", browTilt: -0.17, mouthCurve: 0.48 },
    halden: { genderPresentation: "male", skinTone: "#d5aa8c", hairColor: "#6f5a48", eyeColor: "#202b36", uniformColor: "#324040", trimColor: "#78c4d4", backgroundColor: "#1a2722", panelColor: "#244239", faceShape: "round", hairStyle: "side-part", accessory: "earpiece", browTilt: -0.67, mouthCurve: -0.02 },
    briggs: { genderPresentation: "female", skinTone: "#c28b6b", hairColor: "#47342d", eyeColor: "#324b5f", uniformColor: "#324040", trimColor: "#e2b36c", backgroundColor: "#221d19", panelColor: "#233244", faceShape: "oval", hairStyle: "bun", accessory: "earpiece", browTilt: 0.30, mouthCurve: 0.39 },
    okafor: { genderPresentation: "male", skinTone: "#84523b", hairColor: "#2d211d", eyeColor: "#5a4438", uniformColor: "#324040", trimColor: "#d68d77", backgroundColor: "#14221e", panelColor: "#22313b", faceShape: "square", hairStyle: "side-part", accessory: "none", browTilt: -0.10, mouthCurve: -0.18 },
    sato: { genderPresentation: "female", skinTone: "#ddb395", hairColor: "#47342d", eyeColor: "#324b5f", uniformColor: "#394045", trimColor: "#8ea4d6", backgroundColor: "#221d19", panelColor: "#3a2f2a", faceShape: "square", hairStyle: "bun", accessory: "none", browTilt: 0.51, mouthCurve: 0.74 },
    navarro: { genderPresentation: "female", skinTone: "#5f3b2d", hairColor: "#2d211d", eyeColor: "#607861", uniformColor: "#394045", trimColor: "#79c6ae", backgroundColor: "#14221e", panelColor: "#22313b", faceShape: "round", hairStyle: "tied-back", accessory: "earpiece", browTilt: 0.16, mouthCurve: 0.84 },
  };
  for (const entry of roster) {
    const exp = expected[entry.chiefId];
    assert.ok(exp, `unexpected chief ${entry.chiefId}`);
    for (const field of ["genderPresentation", "skinTone", "hairColor", "eyeColor", "uniformColor", "trimColor", "backgroundColor", "panelColor", "faceShape", "hairStyle", "accessory", "browTilt", "mouthCurve"] as const) {
      assert.equal(entry.portrait[field], exp[field], `${entry.chiefId}.${field} matches the reference enumeration`);
    }
  }
  const tuples = roster.map((entry) => `${entry.portrait.faceShape}/${entry.portrait.hairStyle}/${entry.portrait.accessory}/${entry.portrait.genderPresentation}`);
  assert.equal(new Set(tuples).size, 6, "six distinct template tuples");
  assert.equal(new Set(roster.map((entry) => entry.portrait.trimColor)).size, 6, "six distinct visible trim colors");
  const signatures = roster.map((entry) => {
    const chief = soloScenario.chiefs.find((candidate) => candidate.id === entry.chiefId)!;
    return JSON.stringify(buildSpritePixels(buildChiefSpriteSpec({ chief, portrait: entry.portrait, sessionSeed: "brass-ledger-jhq", variantState: variantState(), visualLanguage: spriteVisualLanguage })).identity);
  });
  assert.equal(new Set(signatures).size, 6, "six distinct pixel identity signatures");
  assert.deepEqual(createInitialGameSession(soloScenario).advisorRoster, generateAdvisorRoster(soloScenario.chiefs, "brass-ledger-jhq"), "session roster equals direct generation for the reference seed");
  // Run-count report across all six reference chiefs × nine states (v2 §4A).
  const perChief: Record<string, number> = {};
  let totalRuns = 0;
  for (const entry of roster) {
    const chief = soloScenario.chiefs.find((candidate) => candidate.id === entry.chiefId)!;
    let sum = 0;
    for (const state of pixelNineStates) {
      const spec = buildChiefSpriteSpec({ chief, portrait: entry.portrait, sessionSeed: "brass-ledger-jhq", variantState: state, visualLanguage: spriteVisualLanguage });
      sum += spritePixelRuns(buildSpritePixels(spec).output.cells).length;
    }
    perChief[entry.chiefId] = sum;
    totalRuns += sum;
  }
  console.log(`sprite pixel runs across six reference chiefs × nine states: ${JSON.stringify(perChief)} total ${totalRuns}`);
  assert.ok(totalRuns > 0 && totalRuns <= 54 * SPRITE_PIXEL_WIDTH * SPRITE_PIXEL_HEIGHT, "run total is within the strict 672-run bound");
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
