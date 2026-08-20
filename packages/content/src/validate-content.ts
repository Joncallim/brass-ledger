import { deepStrictEqual } from "node:assert";
import {
  applyDoctrineGenes,
  defaultDoctrineMechanicsState,
  doctrineRiskKeys,
} from "@brass-ledger/shared";
import { resolveDoctrineGenes, doctrineGenes } from "./doctrine-genes";
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
  }

  // Invariant: the scenario's declared opening position must equal the profile-applied
  // baseline. Guards against drift between the declared profile and initialState.
  const expectedBaseline = applyDoctrineGenes(defaultDoctrineMechanicsState, resolved);
  deepStrictEqual(
    soloScenario.initialState.doctrineMechanics,
    expectedBaseline,
    `initialState.doctrineMechanics must equal applyDoctrineGenes(defaultDoctrineMechanicsState, resolved genes) for profile ${profile.id}.`,
  );
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
