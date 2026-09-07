/**
 * #100 Phase 1 consumer checks.
 *
 * Expected policy, timing, package, evidence, and reducer semantics are owned
 * exclusively by v2-hq-belief-state-space.test.ts. This file deliberately
 * contains no duplicate reference tables or generator.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { getCachedHistories } from "./v2-hq-belief-state-space.test";

test("PHASE1: canonical oracle executes the complete raw envelope", () => {
  const histories = getCachedHistories();
  assert.equal(histories.length, 62_208);
  assert.equal(new Set(histories.map(history => history.id)).size, histories.length);
});
