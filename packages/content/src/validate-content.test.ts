import test from "node:test";
import assert from "node:assert/strict";
import { doctrineGenes } from "./doctrine-genes";
import { validateDoctrineEvent, validateSpriteVisualLanguage } from "./validate-content";
import { soloScenario } from "./scenario";
import { spriteVisualLanguage } from "./sprite-visual-language";
import type { EventDefinition } from "@brass-ledger/shared";

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
