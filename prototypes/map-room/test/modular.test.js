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
  for (const sc of Object.values(SCENARIOS)) for (const w of WITHDRAWAL.situation.warningHours) {
    const ctx = sketchContext(sc, w);
    for (const choice of CHOICES) {
      const { plan, result } = withdrawalPlan(ctx, choice);
      assert.deepEqual(checkPlan(plan), []);
      // One context: the plan carries it, and the result is the resolver's for it.
      assert.equal(plan.context, ctx);
      assert.deepEqual(result, resolveWithdrawal(ctx, choice));
      // The transports start and (if they get away) end at the anchorage the distance is measured to.
      assert.equal(plan.actors.find((a) => a.id === "transports").at, "anchorage");
      const end = stateAfter(plan, plan.steps.length - 1);
      // The garrison leaves the chart only if the first lift got away; a caught lift stays on the beach.
      assert.equal(end.actors.garrison.visible, !result.kept.garrison ? true : false, `${sc.id} w${w} ${choice.lift}/${choice.cover}`);
      if (!result.kept.garrison) assert.equal(end.actors.garrison.at, "beach");
      assert.equal(end.actors.transports.at, result.caught ? "beach" : "anchorage");
      assert.equal(end.effects.some((e) => e.kind === "flash" && e.at === "beach"), result.caught);
    }
  }
  assert.notDeepEqual(WITHDRAWAL.objectives.map((o) => o.id), STATION_DEFENCE.objectives.map((o) => o.id));
});

// Geography read from the chart must change which decision is best on some charts, and the
// outcome of the same decision, or the interfaces haven't shown that it can.
test("geography from the chart changes the sketch's best decision and its outcome", () => {
  const tally = new Map();
  const charts = [...Array.from({ length: 200 }, (_, i) => generateWorld(`G${i}`).layout), ...Object.values(SCENARIOS)];
  for (const sc of charts) { const k = bestChoices(sketchContext(sc, 6)).join(" | "); tally.set(k, (tally.get(k) ?? 0) + 1); }
  assert.ok(tally.size >= 3, [...tally].join("; "));
  for (const n of tally.values()) assert.ok(n < charts.length * 0.95, "one answer for almost every chart");
  // The same choice with the same three hours' warning: out on Kestrel Strait, taken on Harrow
  // Sound, whose anchorage is three times as far.
  const kestrel = sketchContext(SCENARIOS["kestrel-strait"], 3), harrow = sketchContext(SCENARIOS["harrow-sound"], 3);
  for (const choice of CHOICES) {
    assert.equal(resolveWithdrawal(kestrel, choice).kept.garrison, true, `Kestrel ${choice.lift}/${choice.cover}`);
    assert.equal(resolveWithdrawal(harrow, choice).grade, "failure", `Harrow ${choice.lift}/${choice.cover}`);
  }
});
