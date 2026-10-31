// Balance guards, from scripts/balance.mjs. The targets are prototype proposals awaiting
// sign-off (README): on Shifting no single fixed plan should win most campaigns, the best
// answer should change with the campaign, and the two-orders limit should bind in January
// often. Run with `npm test`; the full report is `node scripts/balance.mjs`.
import test from "node:test";
import assert from "node:assert/strict";
import { decisionDiversity, report } from "../scripts/balance.mjs";

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

// A proposed target (README), not a measure of whether the advice is credible: the staff plan
// trades the battalion for the station's safety (RULES-REVIEW.md, review 9). Jon decides it.
test("following the staff plan every month never wins outright", () => {
  for (const d of ["steady", "shifting", "volatile"]) assert.equal(r[d].staff, 0);
});

// Review 9: ties. A campaign with several best plans counts for each of them; the measure never
// keeps only the first one found, which would make one plan look rarer and the rest look varied.
test("decision diversity counts every tied best plan, with overlapping ties", () => {
  const P = (db, route) => ({ db, dl: "boats", di: "staff", jb: "quiet", jl: "sarn", way: null, ji: "staff", route });
  const A = P("quiet", "quiet"), B = P("rest", "quiet"), C = P("rest", "joint");
  // Campaign 1: A and B tie. Campaign 2: B and C tie. Campaign 3: A alone.
  const d = decisionDiversity([[A, B], [B, C], [A]]);
  const share = (p) => d.planShare.get(`${p.db}/${p.dl}/${p.di} · ${p.jb}/${p.jl}/${p.way ?? "-"}/${p.ji} · ${p.route}`) / 3;
  assert.equal(d.distinctBestPlans, 3);
  assert.deepEqual([share(A), share(B), share(C)], [2 / 3, 2 / 3, 1 / 3]);
  assert.equal(d.commonestShare, 2 / 3);
  // Per slot: December's station order is "quiet" in a best plan in campaigns 1 and 3, "rest" in 1 and 2.
  assert.deepEqual(d.slots.db.share, { quiet: 2 / 3, rest: 2 / 3, show: 0 });
  assert.deepEqual(d.slots.route.share, { quiet: 1, forward: 0, joint: 1 / 3 });
  // A slot every best plan agrees on is decisive wherever another option exists and isn't best.
  assert.equal(d.slots.dl.decisive, 1);
  // Everything tied everywhere: each plan is best in every campaign, not a third each.
  const all = decisionDiversity([[A, B, C], [A, B, C]]);
  assert.equal(all.commonestShare, 1);
  assert.equal(all.distinctBestPlans, 3);
});
