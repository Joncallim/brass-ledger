// Review 8: an oracle that doesn't share the resolver's code. Cross-screen consistency only
// proves the screens agree with each other; these tables are written from the rules as the
// README and glossary state them, so a wrong resolver fails here even if every screen agrees.
import test from "node:test";
import assert from "node:assert/strict";
import { effectiveDefence, landingCheck, resolve } from "../src/story/play.js";
import { makeCampaign } from "../src/story/campaign.js";
import { plans, runFor } from "../scripts/balance.mjs";
import { outcome } from "../src/story/play.js";

// A state with exactly the inputs the rules name, and nothing else.
const state = ({ def = 1, rivalKnows = false, radarFails = false, fatigue = 50, listening = false, date = null, boats = 2 }) => ({
  def, rivalKnows, radarFails, fatigue, warning: listening ? "fresh" : "stale", boats,
  knows: date ? { date: { day: 3, kind: "landing", planted: date === "planted", confirmed: date === "confirmed" } } : {},
});
const C = (understrength = false) => ({ understrength });

test("warning: the harbour net, or a true date with patrol boats to see them go", () => {
  const rows = [
    // listening, date, boats → warned
    [true, null, 2, true], [true, null, 0, true], [true, "planted", 0, true],
    [false, "true", 2, true], [false, "confirmed", 2, true],
    [false, "planted", 2, false], // a planted date sends the boats to watch the wrong day
    [false, "true", 0, false], [false, "confirmed", 0, false], // the boats were traded away
    [false, null, 2, false], [false, null, 0, false],
  ];
  for (const [listening, date, boats, warned] of rows) assert.equal(landingCheck(C(), state({ listening, date, boats }), "quiet", false).warned, warned, JSON.stringify({ listening, date, boats }));
});

test("defence against a landing: built level, one lower if exposed, one lower if the radar failed", () => {
  const rows = [
    // built, exposed, radar failed → against a landing
    [1, false, false, 1], [3, false, false, 3], [3, true, false, 2], [3, false, true, 2], [3, true, true, 1], [2, true, true, 0], [4, true, false, 3],
  ];
  for (const [def, rivalKnows, radarFails, eff] of rows) assert.equal(effectiveDefence(state({ def, rivalKnows, radarFails })), eff);
});

test("fitness: fit at fatigue 120, unfit at 121", () => {
  assert.equal(landingCheck(C(), state({ fatigue: 120 }), "quiet", false).fit, true);
  assert.equal(landingCheck(C(), state({ fatigue: 121 }), "quiet", false).fit, false);
});

// The landing rules, as stated in the glossary and the briefing, written out independently:
//   one wave:  level 3 holds alone; level 2 holds with a warned, fit battalion
//   two waves: level 3, warning, a fit battalion at full strength
//   dug in:    one wave: level 1 with a fit battalion, level 2 with an unfit one;
//              two waves: level 3, fit and at full strength
//   navies:    one wave is turned at sea; two waves are both turned at sea with warning;
//              without warning the second lands and meets the one-wave ground defence, the
//              battalion already in place behind the navies
function expected({ route, big, eff, fit, warned, strong }) {
  if (route === "joint") {
    if (!big || warned) return { code: "stopped", decider: "sea" };
    if (eff >= 3) return { code: "landed", decider: "defences" };
    if (eff >= 2 && fit) return { code: "landed", decider: "battalion" };
    return { code: "lost" };
  }
  if (route === "forward") {
    const holds = big ? fit && eff >= 3 && strong : eff >= (fit ? 1 : 2);
    return holds ? { code: "repelled", decider: "trenches" } : { code: "lost" };
  }
  if (big) return eff >= 3 && warned && fit && strong ? { code: "held", decider: "battalion" } : { code: "lost" };
  if (eff >= 3) return { code: "held", decider: "defences" };
  return eff >= 2 && warned && fit ? { code: "held", decider: "battalion" } : { code: "lost" };
}

test("every route, size, level, fitness, warning and strength resolves as the rules state, with the cause that decided it", () => {
  let n = 0;
  for (const route of ["quiet", "forward", "joint"]) for (const big of [false, true]) for (const eff of [0, 1, 2, 3, 4])
    for (const fit of [true, false]) for (const warned of [true, false]) for (const strong of [true, false]) {
      const s = state({ def: eff, fatigue: fit ? 60 : 130, listening: warned });
      const r = resolve(C(!strong), s, route, { troops: true, big, show: false });
      const want = expected({ route, big, eff, fit, warned, strong }), where = JSON.stringify({ route, big, eff, fit, warned, strong });
      assert.equal(r.code, want.code, where);
      if (want.decider) assert.equal(r.decider, want.decider, where);
      else assert.ok(r.failed.length > 0 && r.decider, `${where}: a fall names what failed`);
      // Who fought: dug in or behind the navies always; holding quietly only with warning.
      assert.equal(r.engaged, r.battle && (route !== "quiet" || warned), where);
      n++;
    }
  assert.equal(n, 240);
});

// The refit can buy a third personal order for December. The plan enumerator must allow it,
// or the balance and exhaustive runs never see the plans it buys.
test("a third December order is a legal plan when the campaign grants it", () => {
  const c = makeCampaign("THIRD", "shifting");
  c.seals = { dec: 3, jan: 2 };
  const three = [...plans()].map((p) => ({ p, run: runFor(c, p) })).filter(({ p, run }) => run && (p.db !== "quiet") + (p.dl !== "boats") + (c.incidents.dec && p.di === "own" ? 1 : 0) === 3);
  assert.ok(three.length > 0, "no plan uses three December orders");
  for (const { run } of three.slice(0, 50)) assert.ok(outcome(c, run).code);
  const two = makeCampaign("THIRD", "shifting");
  assert.ok(![...plans()].some((p) => runFor(two, p) && (p.db !== "quiet") + (p.dl !== "boats") + (two.incidents.dec && p.di === "own" ? 1 : 0) === 3));
});
