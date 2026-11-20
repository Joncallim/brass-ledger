// Review 6: the foundations for modular campaigns. The campaign is a definition plus a
// resolver; a battle is a plan the table plays without knowing the campaign; geography read
// from the chart can drive a decision; and a different small scenario fits the same
// interfaces. Run with `npm test`.
import test from "node:test";
import assert from "node:assert/strict";
import { CALENDAR, FIXED, INCIDENT_RULES, SLOTS, STATION_DEFENCE, TUNING, effectDay, incidentDay } from "../src/story/definition.js";
import { checkPlan, stateAfter } from "../src/story/battle.js";
import { CHOICES, WITHDRAWAL, bestChoices, geographyOf, resolveWithdrawal, sketchContext, withdrawalPlan } from "../src/story/sketch.js";
import { makeCampaign } from "../src/story/campaign.js";
import { outcome } from "../src/story/play.js";
import { generateWorld } from "../src/gen/factions.js";
import { SCENARIOS } from "../src/scenarios/index.js";
import * as story from "../src/fixture.js";

test("the campaign definition is complete and frozen", () => {
  for (const key of ["roles", "objectives", "phases", "slots", "calendar", "incidents", "fixed", "tuning"]) assert.ok(STATION_DEFENCE[key], key);
  assert.ok(Object.isFrozen(FIXED) && Object.isFrozen(TUNING) && Object.isFrozen(CALENDAR));
  for (const inc of INCIDENT_RULES) {
    assert.equal(inc.options.filter((o) => o.staff).length, 1, `${inc.id}: one staff answer`);
    for (const m of inc.months) {
      assert.ok(incidentDay(inc.id, m) < CALENDAR[m].orders, `${inc.id} lands before ${m}'s orders`);
      assert.ok(effectDay(inc.id, m) < CALENDAR[m].orders, `${inc.id} takes effect before ${m}'s orders`);
    }
  }
  // Everything an order causes falls after the orders.
  for (const m of ["dec", "jan"]) for (const id of SLOTS[m].beacon) assert.ok(CALENDAR[m][id] > CALENDAR[m].orders, `${m} ${id}`);
});

test("every station-defence plan is well formed, and its end state is the report's", () => {
  for (const d of ["steady", "shifting", "volatile"]) for (let i = 0; i < 6; i++) {
    const c = makeCampaign(`M${i}`, d);
    for (const route of SLOTS.feb.route) for (const jl of SLOTS.jan.lattice) {
      const run = { dec: { beacon: "quiet", lattice: "boats" }, jan: { beacon: "quiet", lattice: jl, way: "buy" }, feb: { route } };
      const o = outcome(c, run), S = story.showdown(c, run), plan = S.play;
      assert.deepEqual(checkPlan(plan), [], `${c.seed}: ${checkPlan(plan)}`);
      const end = stateAfter(plan, plan.steps.length - 1);
      // The rival's craft end on a beach only if they landed, and are gone if they died there.
      if (o.battle && o.code !== "lost") assert.equal(end.actors.craft.visible, false);
      if (!o.battle) assert.equal(end.actors.craft.at, "harbour");
      if (o.code === "lost") assert.ok(end.effects.some((e) => e.kind === "flag" && e.at === "station"));
      else assert.ok(!end.effects.some((e) => e.kind === "flag"));
      // The battalion ends where the report puts it: dug in if it fought or dug in, back
      // inland if the station fell.
      // The battalion ends where the resolver put it: on the headland if it deployed (before
      // the landing or late), back inland if the station fell, at the reserve if it never moved.
      const unit = end.actors.unit.at;
      if (o.code === "lost") assert.equal(unit, "reserve");
      else assert.equal(unit, o.deploy === "none" ? "reserve" : "dug", `${o.code}/${o.deploy}`);
      // And it moved in the step the resolver gives: before contact, or during it.
      const moveStep = plan.steps.findIndex((st) => (st.moves ?? []).some((m) => m.actor === "unit" && m.path.at(-1) === "dug"));
      const contactStep = plan.steps.findIndex((st) => (st.moves ?? []).some((m) => m.actor === "craft" && m.path[0] === "approach"));
      if (o.deploy === "before") assert.ok(moveStep >= 0 && (contactStep < 0 || moveStep < contactStep), `deployed before, moved in step ${moveStep}, contact ${contactStep}`);
      if (o.deploy === "late") assert.equal(moveStep, contactStep);
      assert.equal(end.actors.friends?.at ?? null, route === "joint" ? "line" : null);
    }
  }
});

test("the renderer's plan check catches unknown anchors, actors and effects", () => {
  const bad = { actors: [{ id: "a", kind: "unit", at: "nowhere" }], steps: [{ moves: [{ actor: "b", path: ["beach"] }], effects: [{ kind: "explode" }], labels: [{ at: "sky", text: "" }] }] };
  assert.equal(checkPlan(bad).length, 4);
});

test("a different small scenario fits the same interfaces", () => {
  for (const sc of Object.values(SCENARIOS)) for (const w of [2, 3, 6]) {
    const ctx = sketchContext(sc, w);
    for (const choice of CHOICES) {
      const { plan, result } = withdrawalPlan(ctx, choice);
      assert.deepEqual(checkPlan(plan), []);
      // One context: the plan carries it, and the result is the resolver's for it.
      assert.equal(plan.context, ctx);
      assert.deepEqual(result, resolveWithdrawal(ctx, choice));
      assert.equal(plan.actors.find((a) => a.id === "transports").at, "anchorage");
      const end = stateAfter(plan, plan.steps.length - 1), where = `${sc.id} ${w}h ${choice.lift}/${choice.cover}`;
      // The garrison leaves the chart only once its lift has loaded and cleared the beach; a
      // lift caught loading stays on the beach with whoever was waiting.
      assert.equal(end.actors.garrison.visible, !result.kept.garrison, where);
      if (!result.kept.garrison) assert.equal(end.actors.garrison.at, "beach");
      assert.equal(end.actors.transports.at, result.interruption === "caught" ? "beach" : "anchorage", where);
      assert.equal(end.effects.some((e) => e.kind === "flash" && e.at === "beach"), result.interruption === "caught", where);
      // Frigate damage is shown when it happens, before the lift it was covering, and only then.
      const hit = plan.steps.findIndex((st) => (st.labels ?? []).some((l) => /is hit/.test(l.text)));
      assert.equal(hit >= 0, !result.kept.frigate, where);
      if (hit >= 0) {
        assert.ok(plan.steps[hit].effects.some((e) => e.kind === "flash" && e.at === "line"), where);
        assert.equal(hit, plan.steps.length - 2 - 1, `${where}: the hit comes just before the last lift`);
      }
    }
  }
  assert.notDeepEqual(WITHDRAWAL.objectives.map((o) => o.id), STATION_DEFENCE.objectives.map((o) => o.id));
});

// Review 8: the sketch's causal boundary is explicit. Escape means loading and clearing the
// beach before the rival reaches the post; each lift's times follow from the chart.
test("the sketch's timeline: loading, clearing the beach, the rival's arrival, home, and frigate damage", () => {
  const F = WITHDRAWAL.fixed;
  for (const sc of Object.values(SCENARIOS)) for (const w of [2, 3, 6]) for (const choice of CHOICES) {
    const ctx = sketchContext(sc, w), r = resolveWithdrawal(ctx, choice), T = ctx.geo.homeNm / F.transportKnots;
    let t = 0;
    for (const L of r.timeline) {
      assert.equal(L.leaves, t);
      assert.ok(Math.abs(L.atBeach - (t + T)) < 1e-9 && Math.abs(L.loaded - (L.atBeach + F.loadHours)) < 1e-9);
      // Clears (and gets home) exactly when it finishes loading no later than they reach the post.
      assert.equal(L.fate === "cleared", L.loaded <= r.arrives);
      assert.equal(L.fate === "caught", L.loaded > r.arrives && L.atBeach <= r.arrives);
      if (L.fate === "cleared") { assert.equal(L.clears, L.loaded); assert.ok(Math.abs(L.home - (L.loaded + T)) < 1e-9); t = L.home; }
    }
    // The rival reaches the post at the warning plus its crossing, two hours later if the frigate stands in the way.
    assert.ok(Math.abs(r.arrives - (w + ctx.geo.harbourNm / F.rivalKnots + (choice.cover === "frigate" ? F.coverHours : 0))) < 1e-9);
    assert.equal(r.kept.frigate, !(choice.cover === "frigate" && r.timeline.at(-1).loaded > r.unopposed));
  }
  // The equality boundary, on a made-up chart where the times are exact: finishing loading at
  // the very moment they reach the post escapes (a tie goes to the lift), and needs no frigate;
  // reaching the beach at that moment, still to load, is caught.
  const exact = (harbourNm, homeNm, warningHours, choice) => resolveWithdrawal({ geo: { harbourNm, homeNm }, warningHours }, choice);
  const tie = exact(24, 15, 1, { lift: "one", cover: "none" }); // loaded at 1 + 2 = 3; they arrive at 1 + 2 = 3
  assert.equal(tie.timeline[0].loaded, tie.arrives);
  assert.equal(tie.timeline[0].fate, "cleared");
  assert.equal(exact(24, 15, 1, { lift: "one", cover: "frigate" }).kept.frigate, true, "no fight is needed at a tie");
  const late = exact(24, 15, 0.999, { lift: "one", cover: "none" });
  assert.equal(late.timeline[0].fate, "caught");
  const atBeach = exact(0, 15, 1, { lift: "one", cover: "none" }); // at the beach at 1, they arrive at 1
  assert.equal(atBeach.timeline[0].atBeach, atBeach.arrives);
  assert.equal(atBeach.timeline[0].fate, "caught");
  assert.equal(exact(0, 15, 0.999, { lift: "one", cover: "none" }).timeline[0].fate, "turned back");
  // The review's case: Harrow Sound, three hours' warning, one lift, no frigate. Loaded at
  // about 5.47 hours, before they reach the post at 6.33: the garrison is out.
  const harrow = resolveWithdrawal(sketchContext(SCENARIOS["harrow-sound"], 3), { lift: "one", cover: "none" });
  assert.ok(Math.abs(harrow.timeline[0].loaded - 5.47) < 0.01 && Math.abs(harrow.arrives - 6.33) < 0.01);
  assert.equal(harrow.kept.garrison, true);
});

// What geography does to the sketch, measured on charts not used while writing it (G200 to
// G399): how often each choice is optimal (ties count for every tied choice) and the regret
// of each choice (value lost against the best available on that chart). This demonstrates that
// geography reaches the resolver and changes outcomes. It does NOT demonstrate varied strategy:
// one choice is optimal on almost every chart, and the README says so.
const VALUE = { garrison: 4, guns: 2, frigate: 1 };
const value = (r) => Object.entries(r.kept).reduce((n, [k, v]) => n + (v ? VALUE[k] : 0), 0);
// For each chart, every choice whose value equals the best is optimal there (ties included).
export function optimalShare(charts) {
  const count = {};
  for (const vals of charts) {
    const best = Math.max(...vals.map((x) => x.v));
    for (const x of vals) count[x.k] = (count[x.k] ?? 0) + (x.v === best ? 1 : 0);
  }
  return Object.fromEntries(Object.entries(count).map(([k, v]) => [k, v / charts.length]));
}
export function sketchDiversity(charts, warning) {
  const optimal = Object.fromEntries(CHOICES.map((c) => [`${c.lift}/${c.cover}`, 0])), regret = { ...optimal }, perChart = [], grades = Object.fromEntries(Object.keys(optimal).map((k) => [k, new Set()]));
  for (const sc of charts) {
    const ctx = sketchContext(sc, warning), vals = CHOICES.map((c) => ({ k: `${c.lift}/${c.cover}`, r: resolveWithdrawal(ctx, c) })), best = Math.max(...vals.map((x) => value(x.r)));
    for (const x of vals) { regret[x.k] += best - value(x.r); grades[x.k].add(x.r.grade); }
    perChart.push(vals.map((x) => ({ k: x.k, v: value(x.r) })));
  }
  const n = charts.length;
  return { n, optimal: optimalShare(perChart), regret: Object.fromEntries(Object.entries(regret).map(([k, v]) => [k, v / n])), grades };
}

// Review 9: grades hide differences. At two hours every choice is graded "costly", but two lifts
// with the frigate also lose the frigate for nothing: its score is lower and it is never best.
test("at two hours' warning, the frigate is wasted: same grade, lower score", () => {
  const held = Array.from({ length: 200 }, (_, i) => generateWorld(`G${200 + i}`).layout);
  const d = sketchDiversity(held, 2);
  for (const k of Object.keys(d.grades)) assert.deepEqual([...d.grades[k]], ["costly"], k);
  assert.equal(d.optimal["two/frigate"], 0);
  assert.equal(d.regret["two/frigate"], VALUE.frigate);
  for (const k of ["two/none", "one/none", "one/frigate"]) { assert.equal(d.optimal[k], 1, k); assert.equal(d.regret[k], 0, k); }
  for (const sc of held) {
    const ctx = sketchContext(sc, 2), r = resolveWithdrawal(ctx, { lift: "two", cover: "frigate" }), n = resolveWithdrawal(ctx, { lift: "two", cover: "none" });
    assert.equal(r.grade, n.grade);
    assert.equal(value(r), value(n) - VALUE.frigate);
    assert.equal(r.kept.frigate, false);
  }
});

// Ties: a chart where several choices are best counts for each of them, so the shares can add
// up to more than 1. Checked on hand-made results, including overlapping ties.
test("the optimal-share measure counts every tied best choice", () => {
  const share = (charts) => optimalShare(charts.map((vals) => Object.entries(vals).map(([k, v]) => ({ k, v }))));
  // Chart 1: A and B tie; chart 2: B and C tie; chart 3: A alone.
  const s3 = share([{ A: 5, B: 5, C: 1 }, { A: 1, B: 4, C: 4 }, { A: 3, B: 2, C: 2 }]);
  assert.deepEqual(s3, { A: 2 / 3, B: 2 / 3, C: 1 / 3 });
  // Every choice ties on every chart: each is optimal everywhere, not "a third each".
  assert.deepEqual(share([{ A: 1, B: 1, C: 1 }, { A: 0, B: 0, C: 0 }]), { A: 1, B: 1, C: 1 });
});

test("geography reaches the sketch's resolver: the same choice ends differently on different charts", () => {
  const held = Array.from({ length: 200 }, (_, i) => generateWorld(`G${200 + i}`).layout);
  // Every choice is measured; at six hours' warning, at least one choice's result depends on
  // the chart. (At two hours, no generated chart lets the guns out: every result is the same.)
  const d = sketchDiversity(held, 6);
  assert.equal(Object.keys(d.optimal).length, CHOICES.length);
  assert.ok(Object.values(d.grades).some((g) => g.size > 1), "no choice's result varies with the chart");
  // And the measure is honest about strategy: the commonest optimal choice is optimal on
  // (nearly) every chart. Reported in README; nothing is tuned to move it.
  assert.ok(Math.max(...Object.values(d.optimal)) >= 0.9);
  // On the authored charts with two hours' warning, geography changes the decision: on
  // Kestrel Strait every choice gets the garrison out, so the frigate is wasted; on Harrow
  // Sound, whose anchorage is three times as far, only the frigate's two hours get the first
  // lift loaded in time, and it is damaged doing it.
  const kestrel = sketchContext(SCENARIOS["kestrel-strait"], 2), harrow = sketchContext(SCENARIOS["harrow-sound"], 2);
  for (const choice of CHOICES) {
    assert.equal(resolveWithdrawal(kestrel, choice).kept.garrison, true, `Kestrel ${choice.lift}/${choice.cover}`);
    const h = resolveWithdrawal(harrow, choice);
    assert.equal(h.kept.garrison, choice.cover === "frigate", `Harrow ${choice.lift}/${choice.cover}`);
    if (choice.cover === "frigate") assert.equal(h.kept.frigate, false);
  }
});
