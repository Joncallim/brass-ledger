import test from "node:test";
import assert from "node:assert/strict";
import { doctrineGenes } from "./doctrine-genes";
import { validateDoctrineEvent, validateSpriteVisualLanguage, validateStaffModuleDefinition } from "./validate-content";
import { soloScenario } from "./scenario";
import { spriteVisualLanguage } from "./sprite-visual-language";
import type { EventDefinition } from "@brass-ledger/shared";
import { resolveStaffModules, staffModuleDefinitions } from "./staff-module-definitions";

function context() {
  return {
    profileGenes: new Map(doctrineGenes.filter((gene) => soloScenario.doctrineProfile.geneIds.includes(gene.id)).map((gene) => [gene.id, gene])),
    legalSelectionTagSets: legalTagSets(),
    allDoctrineGenes: doctrineGenes,
    sourceGeneIds: new Set<string>(),
  };
}

function legalTagSets(): Set<string>[] {
  let sets = [new Set<string>()];
  for (const memo of soloScenario.memoTemplates) {
    const choices = memo.options.map((option) => option.tags);
    if (memo.optional) choices.push([]);
    sets = sets.flatMap((current) => choices.map((tags) => new Set([...current, ...tags])));
  }
  return sets;
}

function coalitionEvent(): EventDefinition {
  return structuredClone(soloScenario.events.find((event) => event.id === "doctrine-coalition-caveat-exposure")!);
}

test("all three shipped Doctrine 4 events pass the static guardrails", () => {
  for (const event of soloScenario.events.filter((candidate) => candidate.doctrineTrigger)) {
    assert.doesNotThrow(() => validateDoctrineEvent(event, context()));
  }
});

test("unknown gene is rejected", () => {
  const event = coalitionEvent();
  event.doctrineTrigger = { ...event.doctrineTrigger!, sourceGeneId: "no-such-gene" };
  assert.throws(() => validateDoctrineEvent(event, context()), /unknown gene/);
});

test("wrong vulnerability string is rejected", () => {
  const event = coalitionEvent();
  event.doctrineTrigger = { ...event.doctrineTrigger!, vulnerability: "Not the gene's authored vulnerability." };
  assert.throws(() => validateDoctrineEvent(event, context()), /vulnerability does not exactly match/);
});

test("wrong pattern/variable mapping is rejected", () => {
  // patternId "tempo" canonically maps to relativeTempo; conditioning signatureControl
  // instead fails the pattern/condition mapping check.
  const event = coalitionEvent();
  event.doctrineTrigger = { ...event.doctrineTrigger!, patternId: "tempo" };
  assert.throws(() => validateDoctrineEvent(event, context()), /invalid pattern\/condition mapping/);
});

test("neutral-on condition is rejected", () => {
  const event = coalitionEvent();
  event.doctrineTrigger = { ...event.doctrineTrigger!, patternId: "tempo", conditions: [{ variable: "relativeTempo", comparison: "lte", threshold: 55 }] };
  assert.throws(() => validateDoctrineEvent(event, context()), /active at the neutral doctrine baseline/);
});

test("illegal tag conjunction is rejected", () => {
  // slow-burn and exercise both live on posture options, which are mutually exclusive.
  const event = coalitionEvent();
  event.triggerTags = ["slow-burn", "exercise"];
  assert.throws(() => validateDoctrineEvent(event, context()), /cannot coexist/);
});

test("beneficial-only delta is rejected by check #15 (no adverse authored mass)", () => {
  const event = coalitionEvent();
  event.stateDelta = { resources: { readiness: 3, politicalCapital: 2 }, forceGeneration: { trainingThroughput: 4 } };
  assert.throws(() => validateDoctrineEvent(event, context()), /needs causal staff refs and adverse authored mass/);
});

test("repeated source gene across events is rejected", () => {
  const ctx = context();
  validateDoctrineEvent(coalitionEvent(), ctx);
  const second = structuredClone(soloScenario.events.find((event) => event.id === "doctrine-adaptive-cell-sprawl")!);
  second.doctrineTrigger = { ...second.doctrineTrigger!, sourceGeneId: "coalition-native-staff", sourceGeneLabel: "Coalition-Native Staff", vulnerability: "More policy, legal, media, and partner caveat constraints on every commitment", evidenceRefs: ["CELERY/doctrine-proof-register#NATO AJP-3 Staff Directorate Baseline", "CELERY/doctrine-proof-register#UK PJHQ Staff Responsibilities"] };
  assert.throws(() => validateDoctrineEvent(second, ctx), /more than one Doctrine 4 event/);
});

test("sourceGeneLabel must exactly match the registry label", () => {
  const event = coalitionEvent();
  event.doctrineTrigger = { ...event.doctrineTrigger!, sourceGeneLabel: "Coalition Native Staff (wrong label)" };
  assert.throws(() => validateDoctrineEvent(event, context()), /sourceGeneLabel does not exactly match/);
});

test("the shipped module registry validates from the same resolver definitions", () => {
  assert.deepEqual(soloScenario.staffModules, staffModuleDefinitions.filter((definition) => soloScenario.doctrineProfile.optionalStaffModules.includes(definition.id)));
  for (const definition of soloScenario.staffModules) assert.doesNotThrow(() => validateStaffModuleDefinition(definition));
});

test("module resolver rejects duplicate, unknown, and incomplete profile selections", () => {
  assert.throws(() => resolveStaffModules({ ...soloScenario.doctrineProfile, optionalStaffModules: ["J6", "J6"] }), /repeats/);
  assert.throws(() => resolveStaffModules({ ...soloScenario.doctrineProfile, optionalStaffModules: ["J6", "NOPE"] as any }), /unknown/);
  assert.deepEqual(resolveStaffModules({ ...soloScenario.doctrineProfile, optionalStaffModules: [] }), []);
});

for (const [label, mutate, message] of [
  ["bad evidence path", (value: any) => { value.evidenceRefs[0] = "CELERY/not-the-register#NATO AJP-3 Staff Directorate Baseline"; }, /heading/],
  ["missing evidence heading", (value: any) => { value.evidenceRefs[0] = "CELERY/doctrine-proof-register#No Such Heading"; }, /not approved/],
  ["unapproved module heading", (value: any) => { value.evidenceRefs[0] = "CELERY/doctrine-proof-register#France CPOIA J-Branches"; }, /not approved/],
  ["forward posture lane", (value: any) => { value.benefitEffects[0].lane = "staff.s3.visiblePosture"; }, /unknown effect lane/],
  ["sign inversion", (value: any) => { value.benefitEffects[0].delta = Math.abs(value.benefitEffects[0].delta); }, /wrong sign/],
  ["incomplete effects", (value: any) => { value.pressureEffects = []; }, /needs at least one/],
] as const) {
  test(`module lint rejects ${label}`, () => {
    const fixture = structuredClone(staffModuleDefinitions[0]);
    mutate(fixture);
    assert.throws(() => validateStaffModuleDefinition(fixture), message);
  });
}

test("sprite visual language has the exact authored rows and chief coverage", () => {
  assert.doesNotThrow(() => validateSpriteVisualLanguage(spriteVisualLanguage, soloScenario.chiefs));
});

for (const [label, mutate] of [
  ["missing role", (value: any) => { delete value.S5; }],
  ["duplicate shape", (value: any) => { value.S2.shapeLanguage = value.S1.shapeLanguage; }],
  ["changed roadmap prose", (value: any) => { value.S3.paletteCue = "gold"; }],
  ["incorrect accent", (value: any) => { value.S1.accentColor = "#000000"; }],
  ["false training provenance", (value: any) => { value.training.sourceRef = "POTATO/sprite-design-logic# Visual Language"; }],
] as const) {
  test(`sprite validator rejects ${label}`, () => {
    const fixture = structuredClone(spriteVisualLanguage);
    mutate(fixture);
    assert.throws(() => validateSpriteVisualLanguage(fixture, soloScenario.chiefs));
  });
}
