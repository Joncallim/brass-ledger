// The war layer (ROADMAP, phase 2): what a task force carries from one sector to the next.
// Run with `npm test`.
import test from "node:test";
import assert from "node:assert/strict";
import { FULL_STRENGTH, REFIT, campaignFor, closeSector, newWar, nextSector, toggleSpend, worldForSector } from "../src/story/war.js";
import { setWorld, KESTREL } from "../src/story/world.js";
import { debrief } from "../src/story/copy.js";
import { outcome } from "../src/story/play.js";
import { makeCampaign } from "../src/story/campaign.js";

const RUN = { dec: { beacon: "quiet", lattice: "boats" }, jan: { beacon: "quiet", lattice: "sarn", way: null }, feb: { route: "quiet" } };

function playSector(war, run = RUN) {
  const world = worldForSector(war);
  setWorld(world);
  const c = campaignFor(war), D = debrief(c, run);
  closeSector(war, c, run, D.leaves, world);
  return { c, o: outcome(c, run), world };
}

test("the rival and the task force keep their names; the sector is new", () => {
  try {
    for (let i = 0; i < 20; i++) {
      const war = newWar(`W${i}`, "shifting");
      const { world: a } = playSector(war);
      nextSector(war);
      const b = worldForSector(war);
      assert.equal(b.rival, a.rival);
      assert.equal(b.network, a.network);
      assert.equal(b.reserve, a.reserve);
      assert.notEqual(b.strait + b.host, a.strait + a.host);
      assert.notEqual(b.host, b.rival);
    }
  } finally { setWorld(KESTREL); }
});

test("the battalion's days and casualties carry into the next sector", () => {
  try {
    for (let i = 0; i < 30; i++) {
      const war = newWar(`C${i}`, "volatile");
      const { o } = playSector(war);
      nextSector(war);
      const c = campaignFor(war);
      assert.equal(c.fatigue0, o.daysAfter);
      assert.equal(c.strength, FULL_STRENGTH - o.casualties);
      assert.equal(c.understrength, FULL_STRENGTH - o.casualties < 500);
    }
  } finally { setWorld(KESTREL); }
});

test("every result pays a refit, a better result pays more, and failure adds no penalty", () => {
  assert.ok(REFIT.failure > 0 && REFIT.costly >= REFIT.failure && REFIT.success > REFIT.costly);
  try {
    for (let i = 0; i < 30; i++) {
      const war = newWar(`F${i}`, "shifting");
      const { o } = playSector(war);
      assert.equal(war.funding, REFIT[o.grade]);
      nextSector(war);
      // The next sector's campaign is rolled the same way whatever happened before; only
      // what the task force carries changes it.
      const fresh = makeCampaign(`F${i}-2`, "shifting"), next = campaignFor(war);
      assert.equal(next.plan, fresh.plan);
      assert.equal(next.D, fresh.D);
      assert.ok(next.craft.jan <= fresh.craft.jan);
    }
  } finally { setWorld(KESTREL); }
});

test("refit money buys what it says, and no more than the war has", () => {
  try {
    const war = newWar("SPEND", "shifting");
    playSector(war);
    nextSector(war);
    const before = war.funding;
    assert.ok(toggleSpend(war, "rest"));
    assert.equal(war.funding, before - 2);
    assert.equal(campaignFor(war).fatigue0, 0);
    assert.ok(toggleSpend(war, "rest"));
    assert.equal(war.funding, before);
    // Buy everything affordable; what can't be paid for is refused, and money never goes below zero.
    for (const id of ["rest", "replace", "order", "count"]) toggleSpend(war, id);
    assert.ok(war.funding >= 0);
    assert.ok(war.spent.length < 4, "a refit of at most 5 can't buy all four");
  } finally { setWorld(KESTREL); }
});

test("officers quote what they remember in the next sector's December", () => {
  try {
    const war = newWar("MEM", "shifting");
    const { c } = playSector(war);
    nextSector(war);
    const next = campaignFor(war);
    assert.equal(next.memories.length, 4);
    assert.ok(next.memories.every((m) => m.quote && m.line));
    assert.ok(c.memories === undefined);
  } finally { setWorld(KESTREL); }
});
