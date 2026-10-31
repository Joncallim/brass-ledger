// Review 8: advice and summaries answer the plan as it stands, not the staff default. Every
// officer's counterfactual names an option and describes that option with every other current
// choice held fixed; the host and Lattice cards describe what the current plan does; and
// undoing a change restores exactly the words it replaced. Checked against simulate() directly.
import test from "node:test";
import assert from "node:assert/strict";
import { makeCampaign } from "../src/story/campaign.js";
import { effectiveDefence, ministersFor, needsApproval, simulate } from "../src/story/play.js";
import { seeded } from "../src/chart/random.js";
import * as story from "../src/fixture.js";
import { staffRoom } from "../src/story/rooms.js";

const strip = (t) => String(t).replace(/<[^>]+>/g, "");
const OPTS = { dec: { beacon: ["quiet", "rest", "show"], lattice: ["boats", "who", "when"] }, jan: { beacon: ["quiet", "show", "hold"], lattice: ["sarn", "when", "who"], way: [null, "buy", "act"] } };

// A walk of selections: change, combine, undo.
function* walks() {
  for (const d of ["steady", "shifting", "volatile"]) for (let i = 0; i < 8; i++) {
    const c = makeCampaign(`W${i}`, d), r = seeded(`walk-${i}-${d}`);
    const run = { dec: { beacon: "quiet", lattice: "boats", incident: null }, jan: { beacon: "quiet", lattice: "sarn", way: null, incident: null }, feb: { route: "quiet" } };
    for (let step = 0; step < 14; step++) {
      const month = r() < 0.5 ? "dec" : "jan", slots = Object.keys(OPTS[month]), slot = slots[Math.floor(r() * slots.length)];
      const list = OPTS[month][slot], v = list[Math.floor(r() * list.length)];
      if (slot === "way" && v === "act" && run.jan.beacon !== "show") continue;
      run[month][slot] = v;
      if (slot === "beacon" && month === "jan" && v !== "show" && run.jan.way === "act") run.jan.way = null;
      yield { c, run: structuredClone(run), month };
    }
  }
}

// What an option leads to, independently: the run with that option, simulated.
const at = (c, run, month, slot, id) => {
  const r = structuredClone(run); r[month][slot] = id;
  if (month === "jan" && slot === "beacon" && id !== "show" && r.jan.way === "act") r.jan.way = null;
  const sim = simulate(c, r), s = month === "dec" ? sim.decEnd : sim.janEnd;
  return { s, sim, r };
};

test("every officer's counterfactual describes the option it names, with the rest of the plan as it stands", () => {
  let n = 0;
  for (const { c, run, month } of walks()) {
    const O = story.orders(c, run, month);
    for (const [who, p] of Object.entries(O.council)) for (const [id, text] of Object.entries(p.risks)) {
      n++;
      const t = strip(text), X = at(c, run, month, "beacon", id), P = at(c, run, month, "beacon", p.prefers);
      const lv = t.match(/stands at level (\d+)/);
      if (lv) assert.equal(Number(lv[1]), effectiveDefence(X.s), `${who} on ${id}: ${t}`);
      if (who === "briggs") assert.equal(Boolean(lv), effectiveDefence(X.s) < effectiveDefence(P.s), `${who} on ${id}: ${t}`);
      const f = t.match(/at fatigue (\d+) instead of (\d+)/);
      if (who === "okafor") assert.equal(Boolean(f), X.s.fatigue > P.s.fatigue, t);
      if (f) assert.deepEqual([Number(f[1]), Number(f[2])], [X.s.fatigue, P.s.fatigue], t);
      // Photographs only for a daylight move made without the host's approval.
      const approved = month === "jan" && (X.r.jan.way === "buy" || !needsApproval(c, X.sim.janOrders, "show"));
      assert.equal(/photographs/.test(t), who === "sato" && id === "show" && p.prefers !== "show" && !approved, `${who} on ${id}: ${t}`);
      const m = t.match(/counts (\d+) for instead of (\d+)/);
      if (m) assert.deepEqual([Number(m[1]), Number(m[2])], [ministersFor(X.s.support), ministersFor(P.s.support)], t);
    }
  }
  assert.ok(n > 1000);
});

test("the host and Lattice cards describe the plan as it stands", () => {
  for (const { c, run } of walks()) {
    const H = story.host(c, run), vote = strip(H.vote);
    if (run.jan.way === "buy") { assert.match(vote, /bought the navy/); assert.doesNotMatch(vote, /stays in port/); }
    if (run.jan.way === "act") assert.doesNotMatch(vote, /vote on .* (fails|passes)/);
    const L = story.latticeOrders(c, run, "jan"), cost = strip(L.cost);
    assert.doesNotMatch(cost, /stays on duty/);
    const sarn = at(c, run, "jan", "lattice", "sarn").s.fatigue, when = at(c, run, "jan", "lattice", "when").s.fatigue;
    if (sarn > when) assert.match(cost, new RegExp(`fatigue ${sarn}, against ${when}`), cost);
    else assert.match(cost, /no rest this month/, cost);
    const w = strip(L.options.find((o) => o.id === "when").says);
    assert.equal(/(\d+) less fatigue/.exec(w)?.[1] ?? "0", String(sarn - when), w);
  }
});

test("undoing a change restores exactly the words it replaced", () => {
  for (const { c, run, month } of walks()) {
    const words = (r) => JSON.stringify([story.orders(c, r, month), story.latticeOrders(c, r, month), story.host(c, r)], (k, v) => (typeof v === "function" ? undefined : v));
    const before = words(run), slot = "beacon", was = run[month][slot];
    for (const id of OPTS[month][slot]) {
      const r = structuredClone(run); r[month][slot] = id;
      if (month === "jan" && id !== "show" && r.jan.way === "act") continue; // that change also drops the act order
      r[month][slot] = was;
      assert.equal(words(r), before);
    }
  }
});

test("the staff room answers the current choice, not the staff default", () => {
  for (const d of ["volatile", "shifting"]) for (let i = 0; i < 10; i++) {
    const c = makeCampaign(`E${i}`, d);
    for (const pick of ["quiet", "rest", "show"]) {
      const run = { dec: { beacon: pick, lattice: "boats", incident: null }, jan: {}, feb: {} };
      for (const o of staffRoom(c, run, 1)) {
        if (!o.now) continue;
        assert.equal(strip(o.now.chosen), strip(story.orders(c, run, "dec").options.find((x) => x.id === pick).name));
        const risk = strip(o.now.risk ?? "");
        // Resting sends no troops anywhere: nobody can be shown photographs of them.
        if (pick === "rest") assert.doesNotMatch(risk, /photographs/);
        if (pick === "show" && o.id === "briggs") assert.doesNotMatch(risk, /stands at level 1 instead/);
      }
    }
  }
});
