/** Test-only #100 vector generator. Run with --write to regenerate the canon. */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { canonicalV2Json } from "@brass-ledger/shared";
import { computeCycleStates, deriveRefEvidence, getCachedHistories, getCachedProjections, getCachedSchedules } from "../packages/sim/src/v2-hq-belief-state-space.test";

const vectorPath = resolve("Brass Ledge Documentation/GROCER/POTATO/V2/23D-HQ-BELIEF-STATE-SPACE-VECTORS.json");
const sha = (value: unknown) => createHash("sha256").update(canonicalV2Json(value)).digest("hex");
const sortSet = <T>(values: Iterable<T>) => [...new Map([...values].map(value => [canonicalV2Json(value), value])).values()]
  .sort((a, b) => canonicalV2Json(a).localeCompare(canonicalV2Json(b)));
const histories = getCachedHistories();
const projections = getCachedProjections();
const schedules = getCachedSchedules();
const historyByKey = new Map(histories.map(history => [history.projectionKey, history]));

const evidence = schedules.map(schedule => deriveRefEvidence(historyByKey.get(schedule.projectionKey)!, schedule.hasFocusedStaging, schedule.collectionCourse));
const stateTrajectories = evidence.map(result => computeCycleStates(result.occurrences));
const headlineTrajectories = sortSet(stateTrajectories.map(states => states.map(state => [state.assessmentDirection, state.assessmentPicture, state.warningState, state.publicCaseState])));
const basisTrajectories = sortSet(stateTrajectories.map(states => states.map(state => [state.basisPattern, state.warningState, state.publicCaseState])));
const headlineStates = sortSet(stateTrajectories.flatMap(states => states.map(state => [state.assessmentDirection, state.assessmentPicture, state.warningState, state.publicCaseState])));
const basisStates = sortSet(stateTrajectories.flatMap(states => states.map(state => [state.basisPattern, state.warningState, state.publicCaseState])));
const perCycleHeadline = Object.fromEntries([1, 2, 3, 4, 5, 6].map(cycle => [String(cycle), sortSet(stateTrajectories.map(states => states[cycle - 1]!).map(state => [state.assessmentDirection, state.assessmentPicture, state.warningState, state.publicCaseState]))]));
const perCycleBasis = Object.fromEntries([1, 2, 3, 4, 5, 6].map(cycle => [String(cycle), sortSet(stateTrajectories.map(states => states[cycle - 1]!).map(state => [state.basisPattern, state.warningState, state.publicCaseState]))]));
const existing = JSON.parse(readFileSync(vectorPath, "utf8"));
const vectors = {
  ...existing,
  counts: {
    ...existing.counts,
    rawCommandAdversaryHistories: histories.length,
    trustedHqRelevantHistoryProjections: projections.length,
    producerSchedules: schedules.length,
    semanticEvidenceHistories: new Set(evidence.map(result => result.historyId)).size,
    headlineProductTrajectories: headlineTrajectories.length,
    basisPatternProductTrajectories: basisTrajectories.length,
    headlineCompositeStates: headlineStates.length,
    basisPatternCompositeStates: basisStates.length,
    maxEvidenceHistoryOccurrences: Math.max(...evidence.map(result => result.occurrences.length)),
    maxCurrentAssessmentOccurrences: Math.max(...stateTrajectories.flatMap(states => states.map(state => state.currentCount))),
  },
  perCycleCounts: Object.fromEntries([1, 2, 3, 4, 5, 6].map(cycle => [String(cycle), { headline: perCycleHeadline[String(cycle)]!.length, basisPattern: perCycleBasis[String(cycle)]!.length }])),
  perCycleHeadlineStates: perCycleHeadline,
  hashes: {
    ...existing.hashes,
    rawHistoriesSha256: sha(sortSet(histories.map(history => history.id))),
    projectionsSha256: sha(sortSet(projections.map(projection => projection.key))),
    schedulesSha256: sha(sortSet(schedules.map(schedule => schedule))),
    semanticEvidenceHistoriesSha256: sha(sortSet(evidence.map(result => result.historyId))),
    headlineProductTrajectoriesSha256: sha(headlineTrajectories),
    basisPatternProductTrajectoriesSha256: sha(basisTrajectories),
    headlineCompositeStatesSha256: sha(headlineStates),
    basisPatternCompositeStatesSha256: sha(basisStates),
    perCycleHeadlineStatesSha256: sha(perCycleHeadline),
    perCycleBasisPatternStatesSha256: sha(perCycleBasis),
  },
};
const output = `${JSON.stringify(vectors, null, 2)}\n`;
if (process.argv.includes("--write")) writeFileSync(vectorPath, output);
else if (readFileSync(vectorPath, "utf8") !== output) throw new Error("Vectors are stale; run this generator with --write.");
process.stdout.write(`${sha(vectors)}\n`);
