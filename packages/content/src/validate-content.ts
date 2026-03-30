const { soloScenario } = (await import(new URL("./scenario.ts", import.meta.url).href)) as typeof import("./scenario");

const chiefIds = new Set<string>();
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

console.log(
  `Validated scenario ${soloScenario.id} with ${soloScenario.memoTemplates.length} memos, ${soloScenario.capabilityPrograms.length} programs, and ${soloScenario.events.length} events.`,
);
