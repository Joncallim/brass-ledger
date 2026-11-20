// Balance guards, from scripts/balance.mjs. The targets are prototype proposals awaiting
// sign-off (README): on Shifting no single fixed plan should win most campaigns, the best
// answer should change with the campaign, and the two-orders limit should bind in January
// often. Run with `npm test`; the full report is `node scripts/balance.mjs`.
import test from "node:test";
import assert from "node:assert/strict";
import { POLICIES, decisionDiversity, playPolicy, report } from "../scripts/balance.mjs";
import { makeCampaign } from "../src/story/campaign.js";
import { needsApproval, simulate } from "../src/story/play.js";
import { latticeOrders, orders } from "../src/fixture.js";

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

// Review 9: a policy named after an officer plays that officer's advice on each slip, read
// again after every choice is applied, within the month's personal orders. Checked by replaying
// the run slip by slip and asking the desk (orders / latticeOrders) directly at each step.
const STAFF = { beacon: "quiet", lattice: { dec: "boats", jan: "sarn" } };
function replay(c, who, run) {
  const partial = { dec: { beacon: "quiet", lattice: "boats", incident: null }, jan: { beacon: "quiet", lattice: "sarn", way: null, incident: null }, feb: {} }, steps = [];
  for (const month of ["dec", "jan"]) {
    const limit = c.seals?.[month] ?? 2;
    let used = 0;
    for (const slot of ["beacon", "lattice"]) {
      const staff = slot === "beacon" ? STAFF.beacon : STAFF.lattice[month];
      const advice = (slot === "beacon" ? orders : latticeOrders)(c, partial, month).council[who]?.prefers ?? staff;
      const expect = advice !== staff && used < limit ? advice : staff;
      steps.push({ month, slot, advice, expect, got: run[month][slot], used, limit });
      if (expect !== staff) used++;
      partial[month][slot] = expect;
      // The shared daylight rule: a move that needs the host's answer in time trades the boats if
      // an order is left, or falls back to the quiet move and returns its order.
      if (month === "jan" && slot === "beacon" && expect === "show" && needsApproval(c, simulate(c, partial).janOrders, "show")) {
        if (used < limit) { partial.jan.way = "buy"; used++; }
        else { partial.jan.beacon = "quiet"; used--; steps.at(-1).expect = "quiet"; }
        steps.push({ month, slot: "way", advice: "buy", expect: partial.jan.way, got: run.jan.way, used, limit });
      }
    }
  }
  return steps;
}
const NAMES = { okafor: "follow Okafor", briggs: "follow Briggs", sato: "follow Sato", halden: "follow Halden" };

test("each 'follow' policy plays that officer's advice as it stands after every choice, both months", () => {
  let jan = 0, limited = 0;
  for (const who of Object.keys(NAMES)) for (const d of ["shifting", "volatile"]) for (let i = 0; i < 20; i++) for (const tight of [false, true]) {
    const c = makeCampaign(`B${i}`, d);
    if (tight) c.seals = { dec: 1, jan: 1 }; // one order a month: the budget binds
    const run = playPolicy(c, POLICIES[NAMES[who]]);
    for (const st of replay(c, who, run)) {
      assert.equal(st.got, st.expect, `${who} ${d} B${i}${tight ? " (one order)" : ""}: ${st.month} ${st.slot} is ${st.got}, advice ${st.advice} with ${st.used} of ${st.limit} orders used`);
      if (st.month === "jan") jan++;
      if (st.advice !== st.expect) limited++;
    }
  }
  assert.ok(jan > 0 && limited > 0, "the budget limit was never exercised");
});

test("B3 Shifting: after Hold, following Okafor keeps Lattice on Sarn (his advice then)", () => {
  const c = makeCampaign("B3", "shifting"), trace = [], run = playPolicy(c, POLICIES["follow Okafor"], trace);
  assert.equal(run.jan.beacon, "hold");
  const after = latticeOrders(c, { ...run, jan: { ...run.jan, lattice: "sarn" } }, "jan").council.okafor.prefers;
  assert.equal(after, "sarn");
  assert.equal(run.jan.lattice, "sarn");
  assert.deepEqual(trace.find((t) => t.month === "jan" && t.slot === "lattice"), { month: "jan", slot: "lattice", advised: "sarn", applied: "sarn", used: 1, limit: 2 });
});
