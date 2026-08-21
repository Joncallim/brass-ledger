import { deepStrictEqual } from "node:assert";
import { readFileSync } from "node:fs";
import {
  applyDoctrineGenes,
  composeDoctrineLens,
  defaultDoctrineMechanicsState,
  doctrineRiskKeys,
  directorateSchema,
  moduleEffectDirection,
  moduleEffectLaneSchema,
  optionalStaffModuleSchema,
  type DoctrineGene,
  type EventDefinition,
  type ChiefArchetype,
  type OptionalStaffModule,
  type StaffModuleDefinition,
} from "@brass-ledger/shared";
import { portraitTrimColor, spriteVisualLanguageSchema } from "@brass-ledger/shared";
import { spriteVisualLanguage } from "./sprite-visual-language";
import { resolveDoctrineGenes, doctrineGenes } from "./doctrine-genes";
import { staffModuleDefinitions, resolveStaffModules } from "./staff-module-definitions";
import { doctrineEventCostMass } from "./index";
const { soloScenario } = (await import(new URL("./scenario.ts", import.meta.url).href)) as typeof import("./scenario");

const spriteRoles = ["S1", "S2", "S3", "S4", "S5", "training"] as const;
const directorateRoles = { people: "S1", intelligence: "S2", operations: "S3", sustainment: "S4", plans: "S5", training: "training" } as const;
const roadmapRows = {
  S1: ["rounded shoulders, grounded stance", "muted green", "protective, concerned"],
  S2: ["narrow framing, sharper contrast", "cool blue", "skeptical, precise"],
  S3: ["square posture, forward lean", "brass/amber", "direct, impatient"],
  S4: ["broad base, practical uniform detail", "clay/red-brown", "methodical, constraint-aware"],
  S5: ["composed silhouette, cleaner lines", "muted indigo", "strategic, reserved"],
} as const;
export function validateSpriteVisualLanguage(value: unknown, chiefs: readonly ChiefArchetype[] = []): void {
  const parsed = spriteVisualLanguageSchema.parse(value);
  if (new Set(spriteRoles.map((role) => parsed[role].shapeLanguage)).size !== spriteRoles.length) throw new Error("Sprite visual-language shapes must be distinct.");
  for (const role of Object.keys(roadmapRows) as (keyof typeof roadmapRows)[]) {
    const entry = parsed[role];
    const expected = roadmapRows[role];
    if (entry.shapeLanguage !== expected[0] || entry.paletteCue !== expected[1] || entry.expressionBias !== expected[2] || entry.sourceRef !== "POTATO/sprite-design-logic#Visual Language") throw new Error(`Sprite roadmap transcription mismatch for ${role}`);
  }
  if (parsed.training.sourceRef !== "POTATO/sprite-design-logic#Visual Language (training guidance; authored extension)") throw new Error("Training sprite row must be marked as an authored extension.");
  for (const chief of chiefs) {
    const role = directorateRoles[chief.directorate];
    if (parsed[role].accentColor !== portraitTrimColor(chief.directorate)) throw new Error(`Sprite accent mismatch for ${chief.directorate}`);
  }
}

validateSpriteVisualLanguage(spriteVisualLanguage, soloScenario.chiefs);

const chiefIds = new Set<string>();
const capacityDirectorates = new Set<string>();
const functionIds = new Set<string>();
const functionDirectorates = new Set<string>();
const memoIds = new Set<string>();
const optionIds = new Set<string>();
const programIds = new Set(soloScenario.capabilityPrograms.map((program) => program.id));
const constraintIds = new Set(soloScenario.externalConstraints.map((constraint) => constraint.id));
const eventIds = new Set<string>();

const patternMechanics = {
  objective: "campaignAimClarity", tempo: "relativeTempo", "main-effort": "mainEffortFocus",
  "economy-of-force": "secondaryRiskAccepted", maneuver: "optionDislocation", deception: "signatureControl",
  security: "exposureControl", simplicity: "orderClarity", culmination: "culminationRisk",
  reserve: "uncommittedCapacity", "sustainment-reach": "operationalReach", "mission-command": "commanderIntentClarity",
  "system-competition": "systemPressure",
} as const;

function legalTagSets() {
  let sets = [new Set<string>()];
  for (const memo of soloScenario.memoTemplates) {
    const choices = memo.options.map((option) => option.tags);
    if (memo.optional) choices.push([]);
    sets = sets.flatMap((current) => choices.map((tags) => new Set([...current, ...tags])));
  }
  return sets;
}

const legalSelectionTagSets = legalTagSets();


if (soloScenario.maxTurns < 6) {
  throw new Error("Scenario must support at least a six-turn opening arc.");
}

if (soloScenario.initialState.turn !== 1) {
  throw new Error("Initial state must start on turn 1.");
}

if (soloScenario.initialState.maxTurns !== soloScenario.maxTurns) {
  throw new Error("Initial state maxTurns must match scenario maxTurns.");
}

if (soloScenario.memoTemplates.length < 4 || soloScenario.memoTemplates.length > 5) {
  throw new Error("Scenario should surface 4-5 decision memos each month.");
}

for (const chief of soloScenario.chiefs) {
  if (chiefIds.has(chief.id)) {
    throw new Error(`Duplicate chief id: ${chief.id}`);
  }
  chiefIds.add(chief.id);
}

for (const capacity of soloScenario.staffCapacities) {
  if (capacityDirectorates.has(capacity.directorate)) {
    throw new Error(`Duplicate staff capacity directorate: ${capacity.directorate}`);
  }
  if (capacity.strainedAt > capacity.overloadedAt) {
    throw new Error(`Staff capacity ${capacity.directorate} has strainedAt greater than overloadedAt.`);
  }
  capacityDirectorates.add(capacity.directorate);
}

for (const directorate of ["people", "intelligence", "operations", "sustainment", "plans", "training"]) {
  if (!capacityDirectorates.has(directorate)) {
    throw new Error(`Missing staff capacity for directorate ${directorate}`);
  }
}

for (const staffFunction of soloScenario.staffFunctions) {
  if (functionIds.has(staffFunction.id)) {
    throw new Error(`Duplicate staff function id: ${staffFunction.id}`);
  }
  functionIds.add(staffFunction.id);
  for (const directorate of staffFunction.directorates) {
    if (!capacityDirectorates.has(directorate)) {
      throw new Error(`Staff function ${staffFunction.id} references unknown capacity directorate ${directorate}`);
    }
    functionDirectorates.add(directorate);
  }
}

for (const requiredFunction of ["S1", "S2", "S3", "S4", "S5"]) {
  if (!functionIds.has(requiredFunction)) {
    throw new Error(`Missing player-facing staff function ${requiredFunction}`);
  }
}

for (const directorate of ["people", "intelligence", "operations", "sustainment", "plans", "training"]) {
  if (!functionDirectorates.has(directorate)) {
    throw new Error(`Directorate ${directorate} is not represented in a staff function.`);
  }
}

for (const memo of soloScenario.memoTemplates) {
  if (memoIds.has(memo.id)) {
    throw new Error(`Duplicate memo id: ${memo.id}`);
  }
  memoIds.add(memo.id);

  for (const option of memo.options) {
    const optionKey = `${memo.id}:${option.id}`;
    if (optionIds.has(optionKey)) {
      throw new Error(`Duplicate memo option id: ${optionKey}`);
    }
    optionIds.add(optionKey);

    for (const push of option.programPushes) {
      if (!programIds.has(push.programId)) {
        throw new Error(`Memo option ${optionKey} references unknown program ${push.programId}`);
      }
    }

    for (const shift of option.constraintShifts) {
      if (!constraintIds.has(shift.constraintId)) {
        throw new Error(`Memo option ${optionKey} references unknown constraint ${shift.constraintId}`);
      }
    }
  }
}

for (const event of soloScenario.events) {
  if (eventIds.has(event.id)) {
    throw new Error(`Duplicate event id: ${event.id}`);
  }
  eventIds.add(event.id);

  for (const shift of event.constraintShifts) {
    if (!constraintIds.has(shift.constraintId)) {
      throw new Error(`Event ${event.id} references unknown constraint ${shift.constraintId}`);
    }
  }
}

const profileGenes = new Map(doctrineGenes.filter((gene) => soloScenario.doctrineProfile.geneIds.includes(gene.id)).map((gene) => [gene.id, gene]));
const doctrineEvents = soloScenario.events.filter((event) => event.doctrineTrigger && event.causalContext);
if (soloScenario.initialState.doctrineMaturity === undefined || Object.keys(soloScenario.initialState.doctrineMaturity).length !== 0) throw new Error("Shipped initialState.doctrineMaturity must be exactly {}.");
if (doctrineEvents.length !== soloScenario.doctrineProfile.geneIds.length) throw new Error("Doctrine 4 requires exactly one event per shipped profile gene.");
const sourceGeneIds = new Set<string>();
for (const event of doctrineEvents) {
  validateDoctrineEvent(event, { profileGenes, legalSelectionTagSets, allDoctrineGenes: doctrineGenes, sourceGeneIds });
}

if (sourceGeneIds.size !== soloScenario.doctrineProfile.geneIds.length) throw new Error("Every shipped profile gene must have exactly one Doctrine 4 event.");
const sharedTraceCount = Math.max(0, ...legalSelectionTagSets.map((tags) => doctrineEvents.filter((event) => event.triggerTags.every((tag) => tags.has(tag))).length));
if (sharedTraceCount > 2) console.warn(`Doctrine 4 shared repeated trace warning: ${sharedTraceCount} doctrine predicates can share one legal repeated selection trace.`);

export type DoctrineValidationContext = {
  profileGenes: Map<string, DoctrineGene>;
  legalSelectionTagSets: Set<string>[];
  allDoctrineGenes: readonly DoctrineGene[];
  sourceGeneIds: Set<string>;
};

/** Static Doctrine 4 event guardrails. Throws on the first violated check. */
export function validateDoctrineEvent(event: EventDefinition, context: DoctrineValidationContext): void {
  const trigger = event.doctrineTrigger;
  const causal = event.causalContext;
  if (!trigger || !causal) throw new Error(`Doctrine event ${event.id} must carry both doctrineTrigger and causalContext.`);
  const gene = context.profileGenes.get(trigger.sourceGeneId);
  if (!context.allDoctrineGenes.some((candidate) => candidate.id === trigger.sourceGeneId)) throw new Error(`Doctrine event ${event.id} references an unknown gene: ${trigger.sourceGeneId}.`);
  if (!gene) throw new Error(`Doctrine event ${event.id} references a gene not shipped in the profile: ${trigger.sourceGeneId}.`);
  if (context.sourceGeneIds.has(trigger.sourceGeneId)) throw new Error(`Doctrine gene ${trigger.sourceGeneId} has more than one Doctrine 4 event.`);
  context.sourceGeneIds.add(trigger.sourceGeneId);
  if (gene.label !== trigger.sourceGeneLabel) throw new Error(`Doctrine event ${event.id} sourceGeneLabel does not exactly match gene ${gene.id} label.`);
  if (!gene.vulnerabilities.includes(trigger.vulnerability)) throw new Error(`Doctrine event ${event.id} vulnerability does not exactly match gene ${gene.id}.`);
  if (!trigger.evidenceRefs.every((ref) => gene.evidenceRefs.includes(ref))) throw new Error(`Doctrine event ${event.id} contains evidence outside gene ${gene.id}.`);
  const canonical = patternMechanics[trigger.patternId as keyof typeof patternMechanics];
  if (!canonical || !trigger.conditions.some((condition) => condition.variable === canonical)) throw new Error(`Doctrine event ${event.id} has an invalid pattern/condition mapping.`);
  if (new Set(trigger.conditions.map((condition) => condition.variable)).size !== trigger.conditions.length) throw new Error(`Doctrine event ${event.id} repeats a condition variable.`);
  if (trigger.conditions.some((condition) => !Number.isInteger(condition.threshold))) throw new Error(`Doctrine event ${event.id} must use integer thresholds.`);
  if (trigger.conditions.every((condition) => conditionMetStatic(condition, defaultDoctrineMechanicsState))) throw new Error(`Doctrine event ${event.id} is active at the neutral doctrine baseline.`);
  if (event.minTurn > trigger.sustainedTurns + 1 || event.minTurn > event.maxTurn) throw new Error(`Doctrine event ${event.id} has an invalid maturation window.`);
  if (causal.staffFunctionRefs.length === 0 || doctrineEventCostMass(event) <= 0) throw new Error(`Doctrine event ${event.id} needs causal staff refs and adverse authored mass.`);
  if (!trigger.evidenceRefs.length || !causal.staffFunctionRefs.length) throw new Error(`Doctrine event ${event.id} needs evidence and causal staff references.`);
  if (!context.legalSelectionTagSets.some((tags) => event.triggerTags.every((tag) => tags.has(tag)))) throw new Error(`Doctrine event ${event.id} has trigger tags that cannot coexist in a legal memo selection.`);
}

function conditionMetStatic(condition: { variable: keyof typeof defaultDoctrineMechanicsState; comparison: "gte" | "lte"; threshold: number }, state: typeof defaultDoctrineMechanicsState) {
  return condition.comparison === "gte" ? state[condition.variable] >= condition.threshold : state[condition.variable] <= condition.threshold;
}

const allOptionTags = new Set<string>();
for (const memo of soloScenario.memoTemplates) {
  for (const option of memo.options) {
    for (const tag of option.tags) {
      allOptionTags.add(tag);
    }
  }
}

for (const event of soloScenario.events) {
  for (const tag of event.triggerTags) {
    if (!allOptionTags.has(tag)) {
      throw new Error(
        `Event ${event.id} has triggerTag "${tag}" that does not appear in any memo option. ` +
          `This event can never fire. Add the tag to a memo option or remove it from the event.`,
      );
    }
  }
}

for (const chief of soloScenario.chiefs) {
  const coveredPreferred = chief.preferredTags.filter((tag) => allOptionTags.has(tag));
  if (coveredPreferred.length === 0) {
    throw new Error(
      `Chief ${chief.id} has no preferredTags covered by any memo option. ` +
        `preferredTags: [${chief.preferredTags.join(", ")}]. Add memo options with at least one of these tags.`,
    );
  }
  const coveredConcern = chief.concernTags.filter((tag) => allOptionTags.has(tag));
  if (coveredConcern.length === 0) {
    throw new Error(
      `Chief ${chief.id} has no concernTags covered by any memo option. ` +
        `concernTags: [${chief.concernTags.join(", ")}]. Add memo options with at least one of these tags.`,
    );
  }
}

// ── Doctrine profile checks (Doctrine 2, issue #56) ──────────────────────────────
// Guardrails from POTATO/s1-s5-mechanics-translation.md: every doctrine-derived trait
// carries at least one evidenceRefs entry; doctrine traits create tradeoffs (a benefit
// always has a counterweight); factions are fictional composites (enforced in review).

if (soloScenario.doctrineProfile) {
  const profile = soloScenario.doctrineProfile;
  const resolved = resolveDoctrineGenes(profile);

  // Per-gene guardrails run over the FULL registry, not just the genes the profile
  // references: a gene added for Doctrine 3/4 but not yet wired into a scenario must
  // still satisfy evidence, mass-balance, and measurable-shift rules. `resolved` is
  // used only for the profile baseline invariant below.
  for (const gene of doctrineGenes) {
    if (gene.evidenceRefs.length < 1) {
      throw new Error(`Doctrine gene ${gene.id} must carry at least one evidenceRefs entry.`);
    }

    const entries = Object.entries(gene.variableModifiers) as Array<
      [string, number | undefined]
    >;
    // Tradeoff guardrail: counterweight mass must be at least benefit mass, so no gene
    // is a free lunch. A REDUCTION on a doctrine risk key (lowering accumulated or
    // accepted risk) is a benefit, not a counterweight — this closes the hole where a
    // gene like { campaignAimClarity: +10, systemPressure: -10 } would pass as
    // "balanced" while being pure upside. The strict variableModifiers schema
    // guarantees no modifier can be hidden by stripping — an unknown key fails parse.
    const riskKeys = doctrineRiskKeys as readonly string[];
    const benefitMass =
      entries
        .filter(([key, delta]) => (delta ?? 0) > 0 && !riskKeys.includes(key))
        .reduce((sum, [, delta]) => sum + (delta ?? 0), 0) +
      entries
        .filter(([key, delta]) => (delta ?? 0) < 0 && riskKeys.includes(key))
        .reduce((sum, [, delta]) => sum + Math.abs(delta ?? 0), 0);
    const counterweightMass =
      entries
        .filter(([key, delta]) => (delta ?? 0) < 0 && !riskKeys.includes(key))
        .reduce((sum, [, delta]) => sum + Math.abs(delta ?? 0), 0) +
      entries
        .filter(([key, delta]) => (delta ?? 0) > 0 && riskKeys.includes(key))
        .reduce((sum, [, delta]) => sum + (delta ?? 0), 0);
    if (counterweightMass < benefitMass) {
      throw new Error(
        `Doctrine gene ${gene.id} has benefit mass ${benefitMass} exceeding counterweight mass ${counterweightMass}. ` +
          `Every benefit needs a counterweight: negative modifiers or positive modifiers on doctrine risk keys (${doctrineRiskKeys.join(", ")}).`,
      );
    }

    const measurable = entries.some(([, delta]) => delta !== undefined && delta !== 0);
    if (!measurable) {
      throw new Error(
        `Doctrine gene ${gene.id} must measurably shift at least one doctrine variable.`,
      );
    }

    // ── Doctrine 3 guardrails (issue #57) ──────────────────────────────────────────
    // These run over the FULL registry too, so a gene added for Doctrine 4/5 that is
    // not yet wired into a scenario must still satisfy advice-anchoring and
    // burden-counterweight rules.

    // 1. Directive tag coverage (ERROR): every biasTag/cautionTag of every directive
    // must exist in some memo option — the "advice stays evidence-anchored" guardrail.
    // If a memo drops a tag in a later PR, lint fails immediately.
    const staffFunctionKeys = ["S1", "S2", "S3", "S4", "S5"] as const;
    for (const staffFunction of staffFunctionKeys) {
      const directive = gene.staffAdviceStyle[staffFunction];
      if (!directive) continue;
      for (const tag of directive.biasTags) {
        if (!allOptionTags.has(tag)) {
          throw new Error(
            `Doctrine gene ${gene.id} directive ${staffFunction} has biasTag "${tag}" that does not appear in any memo option. ` +
              `Add the tag to a memo option or remove it from the directive.`,
          );
        }
      }
      for (const tag of directive.cautionTags) {
        if (!allOptionTags.has(tag)) {
          throw new Error(
            `Doctrine gene ${gene.id} directive ${staffFunction} has cautionTag "${tag}" that does not appear in any memo option. ` +
              `Add the tag to a memo option or remove it from the directive.`,
          );
        }
      }
    }

    // 2. Directive anchor invariant (ERROR): positionLean !== 0 requires >=1 tag anchor
    // (schema superRefine enforces this too; re-asserted for clear lint output).
    for (const staffFunction of staffFunctionKeys) {
      const directive = gene.staffAdviceStyle[staffFunction];
      if (directive && directive.positionLean !== 0 && directive.biasTags.length === 0 && directive.cautionTags.length === 0) {
        throw new Error(
          `Doctrine gene ${gene.id} directive ${staffFunction} has a non-zero positionLean (${directive.positionLean}) with no biasTag or cautionTag anchor — no free-floating leans.`,
        );
      }
    }

    // 3. Burden-bias lane validity (ERROR): lanes must be real directorates and disjoint
    // (schema-enforced; re-asserted for output clarity).
    const validLanes = directorateSchema.options;
    for (const lane of [...gene.burdenBias.priorityLanes, ...gene.burdenBias.underpricedLanes]) {
      if (!validLanes.includes(lane)) {
        throw new Error(`Doctrine gene ${gene.id} burdenBias references unknown lane "${lane}".`);
      }
    }
    const laneOverlap = gene.burdenBias.priorityLanes.filter((lane) => gene.burdenBias.underpricedLanes.includes(lane));
    if (laneOverlap.length > 0) {
      throw new Error(`Doctrine gene ${gene.id} declares lane(s) ${laneOverlap.join(", ")} as both priority and underpriced.`);
    }

    // 4. Burden-bias counterweight rule (ERROR): a gene with exactly one non-empty side
    // is an unopposed bias (free lunch) — every routing benefit needs a counterweight
    // lane (gene-bank Strength/Vulnerability pairing). Both empty is legal (advice-only
    // gene).
    if ((gene.burdenBias.priorityLanes.length > 0) !== (gene.burdenBias.underpricedLanes.length > 0)) {
      const side = gene.burdenBias.priorityLanes.length > 0 ? "priorityLanes" : "underpricedLanes";
      const other = gene.burdenBias.priorityLanes.length > 0 ? "underpricedLanes" : "priorityLanes";
      throw new Error(
        `Doctrine gene ${gene.id} declares ${side} but not ${other} — every routing bias needs a counterweight lane (gene-bank Strength/Vulnerability pairing).`,
      );
    }
  }

  // Invariant: the scenario's declared opening position must equal the profile-applied
  // baseline. Guards against drift between the declared profile and initialState.
  const expectedBaseline = applyDoctrineGenes(defaultDoctrineMechanicsState, resolved);
  deepStrictEqual(
    soloScenario.initialState.doctrineMechanics,
    expectedBaseline,
    `initialState.doctrineMechanics must equal applyDoctrineGenes(defaultDoctrineMechanicsState, resolved genes) for profile ${profile.id}.`,
  );

  // 5. Composite-lens invariant (ERROR, Doctrine 3): the scenario's declared lens must
  // equal the composed lens over the resolved genes — guards against drift between the
  // profile and the serialized doctrineLens the engine consumes.
  deepStrictEqual(
    soloScenario.doctrineLens,
    composeDoctrineLens(resolved),
    `doctrineLens must equal composeDoctrineLens(resolved genes) for profile ${profile.id}.`,
  );

  // 6. Cross-gene cancellation (WARNING, Doctrine 3): when a lane is underpriced by one
  // gene but over-prioritized by another, the composite subtracts it from
  // underpricedLanes ("priority wins"). That is the stable mechanical outcome in
  // Doctrine 3; the gene-bank Gene Mixing Rules coordination-cost note applies, so flag
  // it — non-fatal.
  const rawUnderpriced = Array.from(new Set(doctrineGenes.flatMap((gene) => gene.burdenBias.underpricedLanes)));
  const cancelled = rawUnderpriced.filter((lane) => soloScenario.doctrineLens.burdenBias.priorityLanes.includes(lane));
  if (cancelled.length > 0) {
    console.warn(
      `Doctrine lens cross-gene cancellation (Gene Mixing Rules coordination cost): lane(s) [${cancelled.join(", ")}] are underpriced by one gene but over-prioritized by another. "Priority wins": the lane is subtracted from the composite underpricedLanes. This is the stable mechanical outcome in Doctrine 3; a hard coordination-cost rule is deferred to a later PR.`,
    );
  }

  console.log(
    `Doctrine profile ${profile.id}: ${resolved.length} gene(s) [${resolved.map((g) => g.id).join(", ")}] applied, baseline verified against initialState.`,
  );
} else {
  // doctrineProfile is required on the scenario definition schema; this branch is
  // defensive only.
  throw new Error("Scenario must declare a doctrineProfile (Doctrine 2, issue #56).");
}

// ── Doctrine 5 guardrails (issue #59): optional staff modules ─────────────────
// The seven module definitions are content data with mechanical effects on a closed
// lane enum; every guardrail below is static (no simulation).

// 1. Registry completeness: exactly one definition per enum member, no duplicates.
const registryIds = staffModuleDefinitions.map((definition) => definition.id);
if (new Set(registryIds).size !== registryIds.length) {
  throw new Error("staff module registry must not repeat an id");
}
if (registryIds.length !== optionalStaffModuleSchema.options.length) {
  throw new Error(
    `staff module registry must contain exactly one definition per enum member ` +
      `(registry ${registryIds.length}, enum ${optionalStaffModuleSchema.options.length})`,
  );
}
for (const id of optionalStaffModuleSchema.options) {
  if (!registryIds.includes(id)) {
    throw new Error(`staff module registry is incomplete: missing ${id}`);
  }
}

// 2. Approved exact proof-register H2 headings per module, and heading existence.
// The approved sets are the v2 architecture's anchor map; citing an approved heading
// for the WRONG module (e.g. Netherlands Chief Of Staff Role as engineering evidence
// or UK PJHQ as a STRATCOM listing) is an error even if the heading exists.
const approvedModuleHeadings: Record<OptionalStaffModule, string[]> = {
  J6: ["NATO AJP-3 Staff Directorate Baseline", "UK PJHQ Staff Responsibilities", "France CPOIA J-Branches", "Japan Joint Staff Organization"],
  J7: ["NATO AJP-3 Staff Directorate Baseline", "Netherlands Staff Functions"],
  J8: ["NATO AJP-3 Staff Directorate Baseline", "UK PJHQ Staff Responsibilities", "Netherlands Staff Functions", "France CPOIA J-Branches"],
  J9: ["NATO AJP-3 Staff Directorate Baseline", "UK PJHQ Staff Responsibilities", "Netherlands Staff Functions"],
  STRATCOM: ["NATO AJP-3 Staff Directorate Baseline"],
  MED: ["NATO AJP-3 Staff Directorate Baseline", "UK PJHQ Staff Responsibilities", "Japan Joint Staff Organization"],
  ENGINEER: ["NATO AJP-3 Staff Directorate Baseline"],
};
const proofRegisterSource = readFileSync(
  new URL("../../../Brass Ledge Documentation/GROCER/CELERY/doctrine-proof-register.md", import.meta.url),
  "utf8",
);
const proofRegisterHeadings = new Set([...proofRegisterSource.matchAll(/^## (.+)$/gm)].map((match) => match[1]!));

// 3. Per-definition guardrails: benefits/pressures present, evidence approved and
//    existing, sign matches the per-lane favorable/adverse map, conditional tags are
//    real option tags, deltas bounded/two-decimal, and no effect can write a
//    score/outcome/event/maturity/seed/turn/chiefTrust/campaign-identity target.
const forbiddenTargetPrefixes = ["score", "outcome", "event", "maturity", "seed", "turn", "chiefTrust", "campaign"];
export function validateStaffModuleDefinition(definition: StaffModuleDefinition): void {
  if (definition.benefitEffects.length < 1 || definition.pressureEffects.length < 1) {
    throw new Error(`Staff module ${definition.id} needs at least one benefit and one pressure effect.`);
  }
  const approved = approvedModuleHeadings[definition.id];
  for (const ref of definition.evidenceRefs) {
    const heading = ref.slice("CELERY/doctrine-proof-register#".length);
    if (!approved.includes(heading)) {
      throw new Error(`Staff module ${definition.id} cites heading "${heading}" which is not approved for it.`);
    }
    if (!proofRegisterHeadings.has(heading)) {
      throw new Error(`Staff module ${definition.id} cites heading "${heading}" which does not exist in the doctrine proof register.`);
    }
  }
  for (const effect of [...definition.benefitEffects, ...definition.pressureEffects]) {
    if (!moduleEffectLaneSchema.options.includes(effect.lane)) {
      throw new Error(`Staff module ${definition.id} uses unknown effect lane "${effect.lane}".`);
    }
    if (forbiddenTargetPrefixes.some((prefix) => effect.lane.startsWith(prefix))) {
      throw new Error(`Staff module ${definition.id} effect lane "${effect.lane}" could alter a forbidden target.`);
    }
    if (!Number.isFinite(effect.delta) || effect.delta === 0 || Math.abs(effect.delta) > 10 || Number(effect.delta.toFixed(2)) !== effect.delta) {
      throw new Error(`Staff module ${definition.id} effect on ${effect.lane} must be a non-zero delta bounded to [-10, 10] with at most two decimals.`);
    }
    for (const tag of effect.whenAnyTags) {
      if (!allOptionTags.has(tag)) {
        throw new Error(
          `Staff module ${definition.id} conditional tag "${tag}" does not appear in any memo option. ` +
            `This effect can never activate. Add the tag to a memo option or remove it from the module.`,
        );
      }
    }
    const direction = moduleEffectDirection[effect.lane];
    const inBenefits = definition.benefitEffects.includes(effect);
    const favorableSign = direction === "higher-favorable" ? 1 : -1;
    const expectedSign = inBenefits ? favorableSign : -favorableSign;
    if (Math.sign(effect.delta) !== expectedSign) {
      throw new Error(
        `Staff module ${definition.id} ${inBenefits ? "benefit" : "pressure"} on ${effect.lane} (${direction}) ` +
          `has delta ${effect.delta} with the wrong sign; benefits must push toward favorable and pressures toward adverse.`,
      );
    }
  }
}
for (const definition of staffModuleDefinitions) validateStaffModuleDefinition(definition);

// 4. Conditional-predicate witness guardrail (closing review P2): every non-empty
//    whenAnyTags predicate must have a legal one-turn selection trace that
//    ACTIVATES it AND a legal trace that AVOIDS it, exhaustively over the 432 legal
//    tag sets. A predicate with no avoid witness is a standing effect wearing a
//    conditional costume; one with no hit witness can never fire. Either way the row
//    must be declared standing (`whenAnyTags: []`) or its tags revised. Standing rows
//    (empty predicate) are exempt by declaration.
export function validateStaffModulePredicateWitnesses(
  definitions: readonly StaffModuleDefinition[],
  legalSelectionTagSets: readonly (ReadonlySet<string>)[],
): void {
  for (const definition of definitions) {
    for (const effect of [...definition.benefitEffects, ...definition.pressureEffects]) {
      if (effect.whenAnyTags.length === 0) continue;
      const hit = legalSelectionTagSets.some((tags) => effect.whenAnyTags.some((tag) => tags.has(tag)));
      const avoid = legalSelectionTagSets.some((tags) => effect.whenAnyTags.every((tag) => !tags.has(tag)));
      if (!hit || !avoid) {
        throw new Error(
          `Staff module ${definition.id} predicate ${JSON.stringify(effect.whenAnyTags)} on ${effect.lane} must have BOTH a legal activating trace and a legal avoiding trace over the scenario's memo options ` +
            `(found activating: ${hit}, avoiding: ${avoid}); declare the row standing with whenAnyTags: [] if it is unconditional, or revise its tags.`,
        );
      }
    }
  }
}
validateStaffModulePredicateWitnesses(staffModuleDefinitions, legalSelectionTagSets);

// 5. Resolver correctness: unknown/repeated profile ids throw; the shipped profile
//    enables exactly J6/J8/J9/STRATCOM in that order; the serialized scenario
//    definitions deep-equal a fresh resolution (the shared schema refinement already
//    ties scenario.staffModules ids to the profile; this asserts full definitions).
if (soloScenario.doctrineProfile.optionalStaffModules.length !== 0) {
  assertStaffModuleResolution(soloScenario.doctrineProfile);
}
deepStrictEqual(
  soloScenario.doctrineProfile.optionalStaffModules,
  ["J6", "J8", "J9", "STRATCOM"],
  "Shipped coalition-composite profile must enable exactly J6/J8/J9/STRATCOM in order.",
);
deepStrictEqual(
  soloScenario.staffModules,
  resolveStaffModules(soloScenario.doctrineProfile),
  "soloScenario.staffModules must deep-equal resolveStaffModules(doctrineProfile).",
);

function assertStaffModuleResolution(profile: { id: string; optionalStaffModules: string[] }): void {
  if (new Set(profile.optionalStaffModules).size !== profile.optionalStaffModules.length) {
    throw new Error(`doctrine profile ${profile.id} repeats an optional staff module`);
  }
  for (const id of profile.optionalStaffModules) {
    if (!optionalStaffModuleSchema.options.includes(id as OptionalStaffModule)) {
      throw new Error(`doctrine profile ${profile.id} references unknown staff module ${id}`);
    }
  }
}

console.log(
  `Validated scenario ${soloScenario.id} with ${soloScenario.memoTemplates.length} memos, ${soloScenario.capabilityPrograms.length} programs, and ${soloScenario.events.length} events.`,
);
console.log(
  `Chief tag coverage: ${soloScenario.chiefs.length} chiefs, all preferred/concern tags covered by memo options.`,
);
