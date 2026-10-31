// Review 8: an oracle that doesn't share the resolver's code. Cross-screen consistency only
// proves the screens agree with each other; these tables are written from the rules as the
// README and glossary state them, so a wrong resolver fails here even if every screen agrees.
import test from "node:test";
import assert from "node:assert/strict";
import { effectiveDefence, landingCheck, resolve } from "../src/story/play.js";
import { stationDefencePlan } from "../src/story/battle.js";
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
// When the station falls, the cause named is the first missing requirement in the order the
// briefing lists them (defences, warning, fitness, strength; dug in against two waves:
// fitness, defences, strength; behind the navies: defences, then fitness), and `failed` lists
// every one that was missing.
function expected({ route, big, eff, fit, warned, strong }) {
  const missing = (list) => list.filter(([, ok]) => !ok).map(([k]) => k);
  const fall = (failed) => ({ code: "lost", decider: failed[0], failed });
  if (route === "joint") {
    if (!big || warned) return { code: "stopped", decider: "sea", failed: [] };
    if (eff >= 3) return { code: "landed", decider: "defences", failed: ["warning"] };
    const second = missing([["defences", eff >= 2], ["fit", fit]]);
    if (!second.length) return { code: "landed", decider: "battalion", failed: ["warning"] };
    return { code: "lost", decider: second[0], failed: ["warning", ...second] };
  }
  if (route === "forward") {
    const m = big ? missing([["fit", fit], ["defences", eff >= 3], ["strength", strong]]) : missing([["defences", eff >= (fit ? 1 : 2)]]);
    return m.length ? fall(m) : { code: "repelled", decider: "trenches", failed: [] };
  }
  if (!big && eff >= 3) return { code: "held", decider: "defences", failed: [] };
  const m = big ? missing([["defences", eff >= 3], ["warning", warned], ["fit", fit], ["strength", strong]]) : missing([["defences", eff >= 2], ["warning", warned], ["fit", fit]]);
  return m.length ? fall(m) : { code: "held", decider: "battalion", failed: [] };
}
// Who fought, and when the battalion got there, from the same statement of the rules.
function expectedTimeline({ route, warned }, code) {
  const battle = ["held", "landed", "repelled", "lost"].includes(code);
  const deploy = route !== "quiet" || warned ? "before" : battle ? "late" : "none";
  return { deploy, participants: { garrison: battle, battalion: battle && deploy === "before", navies: route === "joint" } };
}

test("every route, size, level, fitness, warning and strength resolves as the rules state, with the cause that decided it", () => {
  let n = 0;
  for (const route of ["quiet", "forward", "joint"]) for (const big of [false, true]) for (const eff of [0, 1, 2, 3, 4])
    for (const fit of [true, false]) for (const warned of [true, false]) for (const strong of [true, false]) {
      const s = state({ def: eff, fatigue: fit ? 60 : 130, listening: warned });
      const r = resolve(C(!strong), s, route, { troops: true, big, show: false });
      const want = expected({ route, big, eff, fit, warned, strong }), where = JSON.stringify({ route, big, eff, fit, warned, strong });
      assert.equal(r.code, want.code, where);
      assert.equal(r.decider, want.decider, where);
      assert.deepEqual(r.failed.map((x) => x.key), want.failed, where);
      const tl = expectedTimeline({ route, warned }, want.code);
      assert.equal(r.deploy, tl.deploy, where);
      assert.deepEqual(r.participants, tl.participants, where);
      // Who fought: dug in or behind the navies always; holding quietly only with warning.
      assert.equal(r.engaged, r.battle && (route !== "quiet" || warned), where);
      n++;
    }
  assert.equal(n, 240);
});

// The boundaries a player argues about, named one by one: the cause, who fought, when the
// battalion arrived, and the order the chart plays it in (stationDefencePlan).
const BOUNDARY = [
  // name, inputs, code, decider, deploy, battalion fought
  ["level 3 holds one wave with an unfit, unwarned battalion", { route: "quiet", big: false, eff: 3, fatigue: 130, warned: false }, "held", "defences", "late", false],
  ["level 2 and warned: fit at 120 holds", { route: "quiet", big: false, eff: 2, fatigue: 120, warned: true }, "held", "battalion", "before", true],
  ["level 2 and warned: unfit at 121 falls for fitness", { route: "quiet", big: false, eff: 2, fatigue: 121, warned: true }, "lost", "fit", "before", true],
  ["level 2, fit, no warning: falls for warning, battalion too late", { route: "quiet", big: false, eff: 2, fatigue: 60, warned: false }, "lost", "warning", "late", false],
  ["level 1, warned and fit: falls for defences", { route: "quiet", big: false, eff: 1, fatigue: 60, warned: true }, "lost", "defences", "before", true],
  ["two waves at level 3, warned, fit, under strength: falls for strength", { route: "quiet", big: true, eff: 3, fatigue: 60, warned: true, under: true }, "lost", "strength", "before", true],
  ["dug in at level 1, fit: trenches hold one wave", { route: "forward", big: false, eff: 1, fatigue: 120, warned: false }, "repelled", "trenches", "before", true],
  ["dug in at level 1, unfit: falls for defences", { route: "forward", big: false, eff: 1, fatigue: 121, warned: false }, "lost", "defences", "before", true],
  ["dug in against two waves, unfit at level 3: falls for fitness", { route: "forward", big: true, eff: 3, fatigue: 121, warned: true }, "lost", "fit", "before", true],
  ["navies, two waves, warned: turned at sea, no battle", { route: "joint", big: true, eff: 1, fatigue: 130, warned: true }, "stopped", "sea", "before", false],
  ["navies, breakthrough at level 3, unfit: the defences hold it", { route: "joint", big: true, eff: 3, fatigue: 130, warned: false }, "landed", "defences", "before", true],
  ["navies, breakthrough at level 2, fit: the battalion holds it", { route: "joint", big: true, eff: 2, fatigue: 60, warned: false }, "landed", "battalion", "before", true],
  ["navies, breakthrough at level 2, unfit: falls for fitness", { route: "joint", big: true, eff: 2, fatigue: 121, warned: false }, "lost", "fit", "before", true],
  ["navies, breakthrough at level 1: falls for defences", { route: "joint", big: true, eff: 1, fatigue: 60, warned: false }, "lost", "defences", "before", true],
  // Several things missing at once: the first in the briefing's order is named, all are listed.
  ["level 1, no warning, unfit: falls for defences, all three listed", { route: "quiet", big: false, eff: 1, fatigue: 130, warned: false, failed: ["defences", "warning", "fit"] }, "lost", "defences", "late", false],
  ["two waves at level 2, no warning, unfit, under strength: all four listed", { route: "quiet", big: true, eff: 2, fatigue: 130, warned: false, under: true, failed: ["defences", "warning", "fit", "strength"] }, "lost", "defences", "late", false],
];

test("named boundary cases: the right cause, who fought, and when the battalion arrived", () => {
  for (const [name, x, code, decider, deploy, fought] of BOUNDARY) {
    const r = resolve(C(Boolean(x.under)), state({ def: x.eff, fatigue: x.fatigue, listening: x.warned }), x.route, { troops: true, big: x.big, show: false });
    assert.deepEqual([r.code, r.decider, r.deploy, r.participants.battalion], [code, decider, deploy, fought], name);
    if (x.failed) assert.deepEqual(r.failed.map((f) => f.key), x.failed, name);
    // The chart plays the battalion's move when the resolver says it moved: in "we move"
    // before contact, in the contact step after the fight starts, or not at all.
    const plan = stationDefencePlan({ ...r, route: x.route }, { craft: 8, unitName: "unit", callouts: [], unitTag: "", unitTone: "ok" });
    const moved = plan.steps.map((st, i) => ((st.moves ?? []).some((m) => m.actor === "unit" && m.path.at(-1) === "dug") ? i : -1)).filter((i) => i >= 0);
    assert.deepEqual(moved, { before: [1], late: [2], none: [] }[deploy], `${name}: battalion moves in steps ${moved}`);
    // A fall flies the flag at the station in the contact step; a hold doesn't.
    assert.equal(plan.steps[2].effects.some((e) => e.kind === "flag"), code === "lost", name);
  }
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
