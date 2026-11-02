// Staff room and ledger checks: they show only what has been committed, count advice
// correctly, and never print undefined. Run with `npm test`.
import test from "node:test";
import assert from "node:assert/strict";
import { makeCampaign } from "../src/story/campaign.js";
import { committed, ledger, staffRoom, STAFF } from "../src/story/rooms.js";

const RUN = { dec: { beacon: "rest", lattice: "who", incident: null }, jan: { beacon: "show", way: "act", incident: null }, feb: { route: "quiet" } };

test("choices still being made are not in the record", () => {
  const c = makeCampaign("ROOMS", "shifting");
  // At progress 1 (December's incident answered, orders not sent) the December order on the
  // desk must not count: the record and the ledger use the staff plan until it is sent.
  assert.equal(committed(RUN, 1).dec.beacon, "quiet");
  assert.ok(!ledger(c, RUN, 1).entries.some((e) => e.title === "December orders"));
  assert.ok(ledger(c, RUN, 2).entries.some((e) => e.title === "December orders"));
});

test("advice records count only decisions the officer argued about", () => {
  for (let i = 0; i < 30; i++) {
    const c = makeCampaign(`A${i}`, "volatile");
    for (const o of staffRoom(c, RUN, 5)) {
      if (!o.record) continue;
      assert.ok(o.record.followed >= 0 && o.record.followed <= o.record.of);
      assert.ok(o.record.of <= 6, "at most two incidents, and two months of station and listening orders");
    }
  }
});

test("every officer has a job, a priority and something they watch", () => {
  const room = staffRoom(makeCampaign("JOBS", "steady"), RUN, 0);
  assert.deepEqual(room.map((o) => o.id), STAFF);
  for (const o of room) {
    assert.ok(o.focus && o.pushes && o.watching, `${o.id} is missing a job, priority or readout`);
    assert.ok(o.now?.wants, `${o.id} has no view on December's orders`);
  }
});

test("rooms read cleanly at every point of every campaign", () => {
  for (const d of ["steady", "shifting", "volatile"]) for (let i = 0; i < 10; i++) {
    const c = makeCampaign(`C${i}`, d);
    for (let p = 0; p <= 5; p++) {
      const text = JSON.stringify([staffRoom(c, RUN, p), ledger(c, RUN, p)]);
      assert.doesNotMatch(text, /undefined|NaN|\[object/, `${d} C${i} at ${p}`);
    }
  }
});

// Playtest 6: the battalion's card said "on duty without rest since the autumn" after a
// December stand-down. Its history now comes from the committed plan, like the top bar.
import { battalionNow } from "../src/story/rooms.js";
import { glossaryFor } from "../src/fixture.js";
import { simulate } from "../src/story/play.js";
test("the battalion's card tells its rest history as committed, and agrees with the top bar", () => {
  for (const d of ["steady", "shifting", "volatile"]) for (let i = 0; i < 12; i++) {
    const c = makeCampaign(`R${i}`, d);
    assert.doesNotMatch(glossaryFor(c.world).battalion.body, /without rest since/);
    for (const dec of ["quiet", "rest", "show"]) for (const jan of ["quiet", "hold"]) for (const progress of [0, 2, 4, 5]) {
      const run = { dec: { beacon: dec, lattice: "boats", incident: null }, jan: { beacon: jan, lattice: "sarn", way: null, incident: null }, feb: { route: "quiet" } };
      const t = battalionNow(c, run, progress), s = simulate(c, committed(run, progress));
      const rested = (progress >= 2 && dec === "rest") || (progress >= 4 && jan === "hold");
      assert.equal(/stood down/.test(t) && !/not been stood down/.test(t), rested, t);
      if (rested) assert.doesNotMatch(t, /has not been stood down/);
      const f = s[["decStart", "decOrders", "decEnd", "janOrders", "janEnd", "janEnd"][progress]].fatigue;
      assert.match(t, f === 0 ? /Now: rested/ : new RegExp(`Now: fatigue ${f},`), t);
    }
  }
  const war = makeCampaign("R1", "shifting"); war.fatigue0 = 0;
  assert.match(battalionNow(war, { dec: {}, jan: {}, feb: {} }, 0), /began this campaign rested/);
});
