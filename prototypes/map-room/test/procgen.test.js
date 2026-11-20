// Generated theatres: every code gives a sound chart and a usable set of names, the same
// code always gives the same theatre, and the story copy speaks only that theatre's names.
// Run with `npm test`.
import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, worldFor } from "../src/gen/factions.js";
import { buildGeometry, validateScenario } from "../src/chart/geometry.js";
import { KESTREL, WORLD, setWorld } from "../src/story/world.js";
import { makeCampaign } from "../src/story/campaign.js";
import { PROGRESS, ledger, staffRoom } from "../src/story/rooms.js";
import * as story from "../src/fixture.js";

const CODES = Array.from({ length: 200 }, (_, i) => `P${i.toString(36).toUpperCase()}`);
const NAMES = ["strait", "station", "stationShort", "host", "hostAdj", "rival", "harbour", "network", "reserve"];

test("every code gives a chart that passes validation", () => {
  for (const code of CODES) {
    const w = generateWorld(code);
    assert.deepEqual(validateScenario(w.layout, buildGeometry(w.layout)), [], code);
    const { beacon, harbour } = w.layout.places;
    assert.ok(beacon.x < harbour.x, `${code}: our station is on the west coast`);
    assert.ok(w.harbourNm >= 20 && w.harbourNm <= 40, `${code}: crossing ${w.harbourNm} nm`);
  }
});

test("the same code gives the same theatre", () => {
  for (const code of CODES.slice(0, 20)) assert.deepEqual(generateWorld(code), generateWorld(code));
});

test("names are distinct and never the authored theatre's", () => {
  for (const code of CODES) {
    const w = generateWorld(code);
    for (const k of NAMES) {
      assert.ok(w[k] && !/undefined/.test(w[k]), `${code}.${k}`);
      if (k !== "reserve") assert.notEqual(w[k], KESTREL[k], `${code}.${k}`);
    }
    const proper = [w.host, w.rival, w.harbour, w.network, w.stationShort];
    assert.equal(new Set(proper).size, proper.length, `${code}: ${proper}`);
    assert.ok(w.hostAdj.startsWith(w.host), `${code}: ${w.hostAdj}`);
  }
});

test("KESTREL is the authored theatre", () => {
  assert.equal(worldFor("KESTREL").generated, false);
  assert.equal(worldFor(null).host, "Marenna");
  assert.equal(worldFor("AB12C").generated, true);
});

// Everything the desk can show for one campaign, as text.
function allCopy(c) {
  const runs = [
    { dec: { beacon: "quiet", lattice: "boats" }, jan: { beacon: "quiet", way: null }, feb: { route: "quiet" } },
    { dec: { beacon: "show", lattice: "when" }, jan: { beacon: "show", way: "buy" }, feb: { route: "joint" } },
  ];
  const T = story.storyFor(c.world);
  const out = [T.TITLE, T.ORIENT, T.LATTICE, story.glossaryFor(c.world), story.officersFor(c.world)];
  for (const run of runs) {
    for (const m of ["dec", "jan"]) {
      out.push(story.brief(c, run, m), story.orders(c, run, m), story.night(c, run, m));
      if (c.incidents[m]) out.push(story.incident(c, run, m));
    }
    out.push(story.host(c, run), story.february(c, run), story.debrief(c, run));
    for (const p of [0, PROGRESS.debrief]) out.push(staffRoom(c, run, p), ledger(c, run, p));
  }
  return JSON.stringify(out);
}

// Review 6: a campaign's world travels with it. The shared world (the chart on the table) is
// never touched here, and two theatres worded in turn never borrow each other's names.
test("the story speaks the generated theatre's names, and only those", () => {
  const authored = ["Kestrel", "Marenna", "Ravellan", "Sarn", "Beacon", "Lattice", "2nd Battalion"];
  const before = JSON.stringify(WORLD);
  for (const code of CODES.slice(0, 12)) {
    const world = generateWorld(code), other = generateWorld(`${code}-other`);
    for (const d of ["steady", "volatile"]) {
      const c = makeCampaign(code, d, world), c2 = makeCampaign(`${code}-other`, d, other);
      allCopy(c2); // word another theatre first: nothing may carry over
      const text = allCopy(c);
      for (const name of authored) assert.ok(!text.includes(name), `${code}: "${name}" leaked into the copy`);
      for (const k of ["host", "rival", "harbour", "network", "stationShort"]) assert.ok(text.includes(world[k]), `${code}: ${k} never named`);
      for (const k of ["host", "harbour"]) if (other[k] !== world[k]) assert.ok(!text.includes(other[k]), `${code}: the other theatre's ${k} leaked in`);
      assert.ok(!/undefined|NaN/.test(text), `${code}: undefined or NaN in the copy`);
    }
  }
  assert.equal(JSON.stringify(WORLD), before, "the shared world was changed");
});
