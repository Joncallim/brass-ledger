// Campaign generator checks: the same seed always rolls the same campaign, new seeds roll
// different ones, every difficulty stays inside its own limits, and the story copy is
// complete on every path. Run with `npm test`.
import test from "node:test";
import assert from "node:assert/strict";
import { DIFFICULTY, makeCampaign } from "../src/story/campaign.js";
import { simulate } from "../src/story/play.js";
import * as story from "../src/fixture.js";

const RUNS = [
  { dec: { beacon: "quiet", lattice: "boats" }, jan: { beacon: "quiet", way: null }, feb: { route: "quiet" } },
  { dec: { beacon: "rest", lattice: "who" }, jan: { beacon: "show", way: "buy" }, feb: { route: "joint" } },
  { dec: { beacon: "show", lattice: "when" }, jan: { beacon: "show", way: "act" }, feb: { route: "quiet" } },
  { dec: { beacon: "quiet", lattice: "who" }, jan: { beacon: "hold", way: "buy" }, feb: { route: "joint" } },
];

test("same seed and difficulty, same campaign", () => {
  assert.deepEqual(makeCampaign("ABC", "volatile"), makeCampaign("ABC", "volatile"));
});

test("new seeds give different campaigns", () => {
  const seen = new Set(Array.from({ length: 60 }, (_, i) => JSON.stringify(makeCampaign(`X${i}`, "shifting"))));
  assert.ok(seen.size >= 58, `only ${seen.size} distinct campaigns from 60 seeds`);
});

for (const [id, D] of Object.entries(DIFFICULTY)) {
  test(`${id}: campaigns stay inside the difficulty's limits`, () => {
    for (let i = 0; i < 80; i++) {
      const c = makeCampaign(`L${i}`, id);
      assert.ok(D.plans.includes(c.plan));
      assert.ok(c.sailDay >= D.sailDays[0] && c.sailDay <= D.sailDays[1]);
      assert.ok(c.support0 >= D.support[0] && c.support0 <= D.support[1]);
      assert.ok(D.ministers.includes(c.minister));
      if (!D.deception) assert.equal(c.deceive, null);
      const incidents = Object.values(c.incidents).filter(Boolean).length;
      assert.equal(incidents, D.incidents);
    }
  });

  test(`${id}: story copy is complete on every path`, () => {
    for (let i = 0; i < 12; i++) {
      const c = makeCampaign(`P${i}`, id);
      for (const run of RUNS) {
        const all = [story.brief(c, run, "dec"), story.brief(c, run, "jan"), story.orders(c, run, "dec"), story.orders(c, run, "jan"), story.host(c, run),
          story.night(c, run, "dec"), story.night(c, run, "jan"), story.february(c, run), story.debrief(c, run), story.incident(c, run, "dec"), story.incident(c, run, "jan")];
        const text = JSON.stringify(all, (k, v) => (typeof v === "function" ? undefined : v));
        assert.doesNotMatch(text, /undefined|NaN|\[object/);
      }
    }
  });
}

test("the staff disagree in different ways from campaign to campaign", () => {
  const splits = new Set();
  for (let i = 0; i < 60; i++) {
    const c = makeCampaign(`D${i}`, "shifting");
    for (const m of ["dec", "jan"]) {
      const o = story.orders(c, RUNS[0], m), sp = story.split(o.council, "quiet");
      splits.add(sp.agree ? "agree" : `${sp.a[0]}/${sp.b[0]}`);
    }
  }
  assert.ok(splits.size >= 4, `only ${splits.size} kinds of disagreement`);
});

test("following the staff plan is not always safe", () => {
  const titles = new Set(Array.from({ length: 80 }, (_, i) => story.debrief(makeCampaign(`F${i}`, "shifting"), RUNS[0]).title));
  assert.ok(titles.size >= 3);
  assert.ok([...titles].some((t) => t.endsWith("lost")), "the staff plan never loses");
});

test("simulate is pure", () => {
  const c = makeCampaign("PURE", "volatile");
  assert.deepEqual(simulate(c, RUNS[1]), simulate(c, RUNS[1]));
});
