// Every chart the prototype can draw. `?scenario=<id>` picks one; the default is the
// sea the fixture story is written for.
import kestrel from "./kestrel.js";
import harrow from "./harrow.js";

export const SCENARIOS = { [kestrel.id]: kestrel, [harrow.id]: harrow };
export const STORY_SCENARIO = kestrel.id;

export function getScenario(id) {
  return SCENARIOS[id] ?? SCENARIOS[STORY_SCENARIO];
}
