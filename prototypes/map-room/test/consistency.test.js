// The playtest found endings that contradicted the game state. These checks hold every
// campaign and choice path to the facts outcome() computes. Run with `npm test`.
import test from "node:test";
import assert from "node:assert/strict";
import { makeCampaign } from "../src/story/campaign.js";
import { outcome, simulate } from "../src/story/play.js";
import * as story from "../src/fixture.js";

const PATHS = [];
for (const beacon of ["quiet", "rest", "show"]) for (const lattice of ["boats", "who", "when"]) for (const jl of ["sarn", "when"])
  for (const [jb, way] of [["quiet", null], ["hold", null], ["show", "act"], ["show", "buy"], ["quiet", "buy"]]) for (const route of ["quiet", "forward", "joint"])
    PATHS.push({ dec: { beacon, lattice }, jan: { beacon: jb, lattice: jl, way }, feb: { route } });

function* everyEnding() {
  for (const d of ["steady", "shifting", "volatile"]) for (let i = 0; i < 12; i++) {
    const c = makeCampaign(`K${i}`, d);
    for (const path of PATHS) {
      // The joint stand is only offered when the host's navy sails; otherwise the plan holds quietly.
      const run = !simulate(c, path).janEnd.navy && path.feb.route === "joint" ? { ...path, feb: { route: "quiet" } } : path;
      yield { c, run, o: outcome(c, run), D: story.debrief(c, run) };
    }
  }
}

test("Halden only claims we kept watch on Sarn when Lattice was listening", () => {
  for (const { o, D } of everyEnding()) {
    const claims = /stayed on Sarn’s harbour net/.test(D.halden);
    assert.equal(claims, o.listening, D.halden);
  }
});

test("the ending never calls an unfit battalion fit", () => {
  for (const { o, D } of everyEnding()) {
    assert.equal(/ends fit at fatigue/.test(D.line), o.kept.battalion, D.line);
    if (!o.kept.battalion) assert.match(D.line, /unfit/);
  }
});

test("the grade follows the three things you were asked to keep", () => {
  for (const { o, D } of everyEnding()) {
    assert.equal(D.grade === "failure", o.code === "lost");
    assert.equal(D.grade === "success", o.kept.beacon && o.kept.ally && o.kept.battalion);
    assert.deepEqual(D.score.map((x) => x.ok), [o.kept.beacon, o.kept.ally, o.kept.battalion]);
  }
});

test("the debrief reads your three months in calendar order", () => {
  for (const { D } of everyEnding()) assert.deepEqual(D.rows.map((r) => r[0]), ["December", "January", "February"]);
});

// The playtest found the debrief saying "fit after 61 days" while the top bar still showed
// 31: the bar read the state before February. Both must read the same final state.
test("the debrief and the top bar read the same final state", () => {
  for (const { c, o, D } of everyEnding()) {
    const bar = story.status(c, D.after);
    assert.equal(D.after.fatigue, o.daysAfter);
    assert.ok(bar[0].value.includes(String(o.daysAfter)) || o.daysAfter === 0, `${bar[0].value} vs ${o.daysAfter}`);
    assert.ok(bar[1].value.startsWith(String(D.score[1].text.split(" ")[0])), `${bar[1].value} vs ${D.score[1].text}`);
    assert.equal(bar[0].tone === "bad", !o.kept.battalion);
  }
});

test("once the ships sail, no screen warns of an attack still to come", () => {
  for (const { c, run } of everyEnding()) {
    assert.equal(story.night(c, run, "jan").still, null);
    assert.doesNotMatch(story.february(c, run).warning[0], /Warning before an attack/);
  }
});

test("the February believed-column matches what Lattice could hear", () => {
  for (const { o, D } of everyEnding()) assert.equal(D.rows[2][2].startsWith("Lattice heard"), o.listening);
});

// Playtest 3: a briefing favoured a show of force while the debrief said a landing had
// looked more likely. January's "we believed" must be the reading the staff argued from.
test("the debrief's January belief is what January's orders were argued from", () => {
  const WORDS = { land: /as a landing/, bluff: /as a show of force/, probe: /as a test/, null: /No reading yet/ };
  for (const { c, run, D } of everyEnding()) {
    const read = story.januaryRead(simulate(c, run).janOrders);
    assert.match(D.rows[1][2], WORDS[read], D.rows[1][2]);
  }
});

// Playtest 4: a player met every requirement February showed them and still lost, to a
// defence level the screen never mentioned; the debrief then blamed the reserve. The risk
// shown before the choice must be the rule that decides it, and the cause given after must
// be a requirement that actually failed.
// Since review 6 the forecast is the resolver itself, run on every case still open: the row
// for the case that happens must be the result, number for number.
test("February's forecast row for the case that happens is the result, number for number", () => {
  for (const { c, run, o } of everyEnding()) {
    const F = story.february(c, run), route = F.routes.find((r) => r.id === o.route);
    assert.ok(route, `${o.route} not offered`);
    const id = o.boarded ? (o.big ? "two" : "one") : o.s.plan === "bluff" ? "empty-show" : "empty-turned";
    const row = route.risk.find((r) => r.id === id) ?? route.risk.find((r) => r.id === "empty-show" && !o.boarded);
    assert.ok(row, `${c.seed}: no row for ${id} in ${route.risk.map((r) => r.id)}`);
    assert.ok(row.codes.includes(o.code), `${row.codes} / ${o.code}`);
    assert.deepEqual([row.daysAfter, row.supportAfter, row.losses, row.engaged], [o.daysAfter, o.supportAfter, o.losses, o.engaged], row.text);
    assert.ok(route.costs.includes(`fatigue ${o.daysAfter}`), `${route.costs} / ${o.daysAfter}`);
  }
});

test("a fallen station's debrief names a requirement that failed", () => {
  const WORDS = { defences: /defences at level/, warning: /warning/, fit: /fit battalion/, strength: /full strength/ };
  for (const { o, D } of everyEnding()) {
    if (o.code !== "lost") continue;
    assert.ok(o.failed.length > 0, "lost with nothing failed");
    for (const r of o.failed) assert.match(D.why, WORDS[r.key], D.why);
  }
});
