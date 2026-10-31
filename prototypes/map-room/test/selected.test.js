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

// Review 9: the main advice, every option's description and every counterfactual come from the
// same simulated plan. Numbers and promises in the text are checked against simulate().
const variants = (c) => {
  const k = structuredClone(c); k.knownCount = true; // a war's refit: a second team brings the count
  const t = structuredClone(c); t.seals = { dec: 3, jan: 2 }; // a refit's third December order
  return [c, k, t];
};
const fatigueOf = (c, run, month, slot, id) => at(c, run, month, slot, id).s.fatigue;

test("review 9 cases: the advice matches what the plan does", () => {
  // B18 Shifting: quiet + boats, then quiet + the date. The battalion ends January at 120, fit.
  const b18 = makeCampaign("B18", "shifting");
  const r18 = { dec: { beacon: "quiet", lattice: "boats", incident: null }, jan: { beacon: "quiet", lattice: "when", way: null, incident: null }, feb: {} };
  const end = simulate(b18, r18).janEnd.fatigue, O = story.orders(b18, r18, "jan");
  assert.equal(end, 120);
  assert.match(strip(O.cost), /to 120 by the end of January/);
  assert.match(strip(O.options.find((o) => o.id === "quiet").says), /Fatigue 120\b/);
  assert.doesNotMatch(strip(JSON.stringify(O)), /\b140\b/);
  // B6: both patrol boats traded away, Lattice on the date. No warning, and nothing promises one.
  const b6 = makeCampaign("B6", "shifting");
  const r6 = { dec: { beacon: "quiet", lattice: "boats", incident: null }, jan: { beacon: "quiet", lattice: "when", way: "buy", incident: null }, feb: {} };
  const when6 = strip(story.latticeOrders(b6, r6, "jan").options.find((o) => o.id === "when").says);
  assert.equal(simulate(b6, r6).janEnd.boats, 0);
  assert.doesNotMatch(when6, /would still see them sail/);
  assert.match(when6, /no warning at all/);
  // Hold: the battalion is already standing down, so the date buys no rest and Okafor doesn't ask for it.
  const r3 = { ...r6, jan: { ...r6.jan, beacon: "hold", way: null } };
  const L3 = story.latticeOrders(b6, r3, "jan");
  assert.equal(fatigueOf(b6, r3, "jan", "lattice", "sarn"), fatigueOf(b6, r3, "jan", "lattice", "when"));
  assert.notEqual(L3.council.okafor.prefers, "when");
  assert.doesNotMatch(strip(L3.council.okafor.line), /fatigue I can’t take off/);
  // A refit's fresh count: delivered whatever Lattice is asked, and nothing says otherwise.
  const k = makeCampaign("B6", "shifting"); k.knownCount = true;
  const rk = { dec: { beacon: "quiet", lattice: "who", incident: null }, jan: {}, feb: {} };
  for (const q of ["boats", "who", "when"]) assert.notEqual(simulate(k, { ...rk, dec: { ...rk.dec, lattice: q } }).decEnd.knows.count ?? null, null);
  const LK = story.latticeOrders(k, rk, "dec");
  for (const o of LK.options) assert.doesNotMatch(strip(o.says), /No new count/);
  for (const p of Object.values(LK.council)) for (const t of Object.values(p.risks)) assert.doesNotMatch(strip(t), /no fresh count/);
});

test("every fatigue figure, warning promise and count claim is the simulated plan's", () => {
  let n = 0;
  for (const base of walks()) for (const c of variants(base.c)) {
    const { run, month } = base;
    const O = story.orders(c, run, month), L = story.latticeOrders(c, run, month);
    // The station order: the staff plan's cost and each option's own figure.
    const duty = fatigueOf(c, run, month, "beacon", "quiet");
    assert.match(strip(O.cost), new RegExp(`to ${duty} by the end of`), strip(O.cost));
    for (const o of O.options) {
      const f = fatigueOf(c, run, month, "beacon", o.id), said = [...strip(o.says).matchAll(/(?:[Ff]atigue|to) (\d+)(?: by|\.)/g)].map((m) => Number(m[1]));
      assert.ok(said.length && said.every((x) => x === f), `${month} ${o.id}: says ${said}, plan gives ${f}: ${strip(o.says)}`);
    }
    // Okafor's own numbers.
    for (const m of strip(O.council.okafor.line).matchAll(/(?:takes them to|, )(\d+)(?: by|\.)/g)) assert.equal(Number(m[1]), duty, strip(O.council.okafor.line));
    if (month === "jan") {
      const sarn = fatigueOf(c, run, "jan", "lattice", "sarn"), when = fatigueOf(c, run, "jan", "lattice", "when");
      const ok = L.council.okafor;
      if (ok.prefers === "when") assert.ok(sarn > when, "Okafor asks for the date when it buys no rest");
      const said = strip(ok.line).match(/That is (\d+) fatigue/);
      if (said) assert.equal(Number(said[1]), sarn - when);
      const boats = at(c, run, "jan", "lattice", "when").s.boats, w = strip(L.options.find((o) => o.id === "when").says);
      assert.equal(/would still see them sail/.test(w), boats >= 2, w);
    } else {
      for (const o of L.options) {
        const counted = (at(c, run, "dec", "lattice", o.id).s.knows.count ?? null) !== null;
        if (/No new count/.test(strip(o.says))) assert.ok(!counted, `${o.id} says no count, but one comes`);
        if (/still brings a fresh count/.test(strip(o.says))) assert.ok(counted);
      }
      for (const [who, p] of Object.entries(L.council)) for (const [id, t] of Object.entries(p.risks)) {
        if (!/no fresh count/.test(strip(t))) continue;
        assert.ok((at(c, run, "dec", "lattice", id).s.knows.count ?? null) === null, `${who} on ${id}: ${strip(t)}`);
      }
    }
    n++;
  }
  assert.ok(n > 500);
});

test("undo restores the words, refits and every slot included", () => {
  for (const base of walks()) for (const c of variants(base.c)) {
    const { run, month } = base;
    const words = (r) => JSON.stringify([story.orders(c, r, month), story.latticeOrders(c, r, month), story.host(c, r)], (k, v) => (typeof v === "function" ? undefined : v));
    const before = words(run);
    for (const slot of Object.keys(OPTS[month])) {
      const was = run[month][slot];
      for (const id of OPTS[month][slot]) {
        const r = structuredClone(run); r[month][slot] = id;
        if (month === "jan" && ((slot === "beacon" && id !== "show" && r.jan.way === "act") || (slot === "way" && id === "act" && r.jan.beacon !== "show"))) continue;
        words(r); r[month][slot] = was;
        assert.equal(words(r), before, `${month} ${slot} ${id} then back`);
      }
    }
  }
});
