/**
 * #99 differential consumer.
 *
 * The independent evaluator and delayed normalizer live in the single
 * test-only state-space oracle. This consumer compares that oracle's raw
 * histories with shipping policy, without maintaining another policy table.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { chooseV2RavellanAction } from "./v2";
import { activeObservations, getCachedHistories, refChooseRavellanAction } from "./v2-hq-belief-state-space.test";

test("DIFFERENTIAL: canonical oracle matches shipping #99 across all raw decisions", () => {
  for (const history of getCachedHistories()) {
    let posture = history.openingPosture;
    let preparation = history.openingPreparation;
    for (let cycle = 1; cycle <= 6; cycle++) {
      const observations = activeObservations(history.packages, cycle);
      const expected = refChooseRavellanAction({ cycle, posture, preparation, activeObservations: observations });
      const actual = chooseV2RavellanAction({ cycle, posture, preparation, activeObservations: observations });
      assert.deepEqual(actual, expected, `${history.id} C${cycle}`);
      posture = expected.nextPosture;
      preparation = expected.nextPreparation;
    }
  }
});
