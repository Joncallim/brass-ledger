import { deepStrictEqual } from "node:assert";
import {
  applyDoctrineGenes,
  composeDoctrineLens,
  defaultDoctrineMechanicsState,
  doctrineRiskKeys,
  directorateSchema,
  type DoctrineGene,
  type EventDefinition,
} from "@brass-ledger/shared";
import { resolveDoctrineGenes, doctrineGenes } from "./doctrine-genes";
import { doctrineEventCostMass } from "./index";
const { soloScenario } = (await import(new URL("./scenario.ts", import.meta.url).href)) as typeof import("./scenario");

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

console.log(
  `Validated scenario ${soloScenario.id} with ${soloScenario.memoTemplates.length} memos, ${soloScenario.capabilityPrograms.length} programs, and ${soloScenario.events.length} events.`,
);
console.log(
  `Chief tag coverage: ${soloScenario.chiefs.length} chiefs, all preferred/concern tags covered by memo options.`,
);
