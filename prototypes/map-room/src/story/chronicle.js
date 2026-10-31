// The campaign's record, as the rules left it: dated facts, dated intelligence (with source,
// certainty and whether it was true) and February's result. simulate() and outcome() in
// play.js write every entry as they apply each transition; this module only gathers them and
// answers "what did we know at this moment?". It adds no facts of its own.
import { dateKey, effectiveDefence, outcome, simulate } from "./play.js";

export { dateKey };
export { decisionAt } from "./play.js";

export function chronicle(c, run = {}) {
  const sim = simulate(c, run), o = outcome(c, run);
  const events = [...sim.facts, ...(run.feb?.route ? o.feb : [])].sort((a, b) => dateKey(a) - dateKey(b));
  return { events, intel: sim.intel, decision: sim.decision, logEnd: sim.logEnd, outcome: o, defence: effectiveDefence(sim.janEnd) };
}

export const logEnd = (c, s, month) => simulate(c, {}).logEnd[month];

// What we knew at a moment: the latest claim of each kind, with its source and certainty.
export function knownAt(record, date) {
  const known = {};
  for (const i of record.intel) if (dateKey(i) <= dateKey(date)) known[i.claim.kind] = i;
  return known;
}

// Everything visible at a moment, with the hidden truth taken out: the claims as they were
// made (not whether they were true) and the facts we could see. Two campaigns that differ only
// in hidden truth and leave the same evidence must get the same advice (test/surface.test.js).
export function evidence(record, date) {
  const seen = (x) => dateKey(x) <= dateKey(date);
  return {
    intel: record.intel.filter(seen).map(({ truth, ...visible }) => visible),
    facts: record.events.filter((e) => seen(e) && !["decision", "sailed", "moved", "contact"].includes(e.kind)),
  };
}
