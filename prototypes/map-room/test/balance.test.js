// Balance guards, from scripts/balance.mjs. The targets are prototype proposals awaiting
// sign-off (README): on Shifting no single fixed plan should win most campaigns, the best
// answer should change with the campaign, and the two-orders limit should bind in January
// often. Run with `npm test`; the full report is `node scripts/balance.mjs`.
import test from "node:test";
import assert from "node:assert/strict";
import { report } from "../scripts/balance.mjs";

const r = report(100);

test("Shifting: no fixed plan wins most campaigns", () => {
  assert.ok(r.shifting.best.rate <= 0.6, `${r.shifting.best.plan} wins ${(r.shifting.best.rate * 100).toFixed(0)}%`);
});

test("Shifting: the best answer depends on the campaign", () => {
  assert.ok(r.shifting.bestPlanMissesBestOutcome >= 0.5, `${(r.shifting.bestPlanMissesBestOutcome * 100).toFixed(0)}%`);
});

test("Shifting and Volatile: January's two personal orders often both matter", () => {
  for (const d of ["shifting", "volatile"]) assert.ok(r[d].januaryLimitBinds >= 0.3, `${d}: ${(r[d].januaryLimitBinds * 100).toFixed(0)}%`);
});

// Volatile is allowed more campaigns that can only be survived, not won. The Shifting guard
// stays at 20% (product owner, playtest 4): diagnose the unwinnable campaigns before moving it.
test("most campaigns can still be won outright", () => {
  for (const [d, cap] of [["steady", 0.05], ["shifting", 0.2], ["volatile", 0.3]]) assert.ok(r[d].unwinnable <= cap, `${d}: ${(r[d].unwinnable * 100).toFixed(0)}% unwinnable`);
});

test("following the staff plan every month never wins outright", () => {
  for (const d of ["steady", "shifting", "volatile"]) assert.equal(r[d].staff, 0);
});
