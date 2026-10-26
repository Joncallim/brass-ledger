// The playtest found endings that contradicted the game state. These checks hold every
// campaign and choice path to the facts outcome() computes. Run with `npm test`.
import test from "node:test";
import assert from "node:assert/strict";
import { makeCampaign } from "../src/story/campaign.js";
import { outcome } from "../src/story/play.js";
import * as story from "../src/fixture.js";

const PATHS = [];
for (const beacon of ["quiet", "rest", "show"]) for (const lattice of ["boats", "who", "when"])
  for (const [jb, way] of [["quiet", null], ["hold", null], ["show", "act"], ["show", "buy"], ["quiet", "buy"]]) for (const route of ["quiet", "joint"])
    PATHS.push({ dec: { beacon, lattice }, jan: { beacon: jb, way }, feb: { route } });

function* everyEnding() {
  for (const d of ["steady", "shifting", "volatile"]) for (let i = 0; i < 12; i++) {
    const c = makeCampaign(`K${i}`, d);
    for (const run of PATHS) yield { c, run, o: outcome(c, run), D: story.debrief(c, run) };
  }
}

test("Halden only claims we kept watch on Sarn when Lattice was listening", () => {
  for (const { o, D } of everyEnding()) {
    const claims = /kept Lattice on Sarn|kept our watch/.test(D.halden);
    assert.equal(claims, o.listening, D.halden);
  }
});

test("the ending never calls an unfit battalion fit", () => {
  for (const { o, D } of everyEnding()) {
    assert.equal(/ends the campaign fit/.test(D.line), o.kept.battalion, D.line);
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

test("months before your command are credited to your predecessor", () => {
  for (const { D } of everyEnding()) {
    assert.match(D.rows[0][1], /^Before you/);
    assert.match(D.rows[1][1], /^Before you/);
  }
});

test("once the ships sail, no screen warns of an attack still to come", () => {
  for (const { c, run } of everyEnding()) {
    assert.doesNotMatch(story.night(c, run, "jan").still[0], /Warning before an attack/);
    assert.doesNotMatch(story.february(c, run).warning[0], /Warning before an attack/);
  }
});

test("the February believed-column matches what Lattice could hear", () => {
  for (const { o, D } of everyEnding()) assert.equal(D.rows[4][2].startsWith("Lattice heard"), o.listening);
});
