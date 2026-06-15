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
}

const allOptionTags = new Set<string>();
for (const memo of soloScenario.memoTemplates) {
  for (const option of memo.options) {
    for (const tag of option.tags) {
      allOptionTags.add(tag);
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

console.log(
  `Validated scenario ${soloScenario.id} with ${soloScenario.memoTemplates.length} memos, ${soloScenario.capabilityPrograms.length} programs, and ${soloScenario.events.length} events.`,
);
console.log(
  `Chief tag coverage: ${soloScenario.chiefs.length} chiefs, all preferred/concern tags covered by memo options.`,
);
