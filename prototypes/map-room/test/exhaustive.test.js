// Review 6: every legal plan, not a sample. For each campaign below, every combination of
// orders the desk allows (within two personal orders a month) is played, and February's
// forecast, the result, the chart's end state, the top bar and the debrief are checked
// against each other. Coverage is asserted too: every warning source, every result and every
// intelligence state must come up, so the checks can't pass by never meeting a case.
import test from "node:test";
import assert from "node:assert/strict";
import { makeCampaign } from "../src/story/campaign.js";
import { outcome } from "../src/story/play.js";
import { stateAfter } from "../src/story/battle.js";
import { plans, runFor } from "../scripts/balance.mjs";
import * as story from "../src/fixture.js";

const CAMPAIGNS = [["X0", "steady"], ["X1", "steady"], ["X0", "shifting"], ["X1", "shifting"], ["X2", "shifting"], ["X0", "volatile"], ["X1", "volatile"], ["X2", "volatile"]];

test("every legal plan: forecast, result, chart, top bar and debrief agree", () => {
  const seen = { source: new Set(), code: new Set(), count: new Set(), boarding: new Set(), route: new Set(), naval: new Set() };
  let n = 0;
  for (const [seed, d] of CAMPAIGNS) {
    const c = makeCampaign(seed, d), done = new Set();
    for (const p of plans()) {
      const run = runFor(c, p);
      if (!run) continue;
      const key = JSON.stringify(run);
      if (done.has(key)) continue;
      done.add(key);
      n++;
      const o = outcome(c, run), F = story.february(c, run), S = story.showdown(c, run), D = story.debrief(c, run);
      const where = `${seed}/${d} ${key}`;
      seen.source.add(F.source); seen.code.add(o.code); seen.route.add(o.route);
      seen.count.add(o.s.knows.count != null); seen.boarding.add(F.source.startsWith("lattice"));
      if (o.route === "joint" && o.boarded) seen.naval.add(o.code);
      // Forecast: the true case's row is the result.
      const route = F.routes.find((r) => r.id === o.route);
      assert.ok(route, `${where}: route not offered`);
      const id = o.boarded ? (o.big ? "two" : "one") : o.s.plan === "bluff" ? "empty-show" : "empty-turned";
      const row = route.risk.find((r) => r.id === id) ?? (!o.boarded && route.risk.find((r) => r.id === "empty-show"));
      assert.ok(row && row.codes.includes(o.code), `${where}: no forecast row for ${o.code}`);
      assert.equal(row.daysAfter, o.daysAfter, where);
      assert.equal(row.supportAfter, o.supportAfter, where);
      // Chart: the plan ends where the result says.
      const end = stateAfter(S.play, S.play.steps.length - 1);
      assert.equal(end.effects.some((e) => e.kind === "flag"), o.code === "lost", `${where}: flag`);
      assert.equal(end.actors.craft.at === "harbour", !o.battle, `${where}: craft`);
      // Top bar and debrief: the same final numbers.
      assert.equal(D.after.fatigue, o.daysAfter, where);
      assert.deepEqual(D.score.map((x) => x.ok), [o.kept.beacon, o.kept.ally, o.kept.battalion], where);
      assert.ok(story.status(c, D.after)[1].value.startsWith(D.score[1].text.split(",")[0].replace(" for", " for ·").split(" ·")[0]), where);
      assert.ok(S.beats.at(-1).text.includes(`fatigue ${o.daysAfter}`), where);
    }
  }
  assert.ok(n > 5000, `${n} plans`);
  for (const s of ["lattice-boarding", "lattice-no-boarding", "patrol-boats", "radar"]) assert.ok(seen.source.has(s), `warning source ${s} never came up`);
  for (const code of ["held", "lost", "stopped", "landed", "repelled", "dugin", "outlasted", "called"]) assert.ok(seen.code.has(code), `result ${code} never came up`);
  assert.equal(seen.count.size, 2, "count known and unknown");
  assert.equal(seen.boarding.size, 2, "boarding known and unknown");
  assert.equal(seen.route.size, 3);
  // The naval route's three ends: stopped at sea, a breakthrough held on the beach, and a
  // breakthrough the ground defence can't hold.
  for (const code of ["stopped", "landed", "lost"]) assert.ok(seen.naval.has(code), `naval route never ended ${code}`);
});
