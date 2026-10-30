// Every screen against the record (playtest 5). For a broad sample of campaigns (each
// difficulty, plan, intelligence choice, incident answer, coalition state, warning source,
// landing size and defence level) and both sectors of a war, render every surface the
// desk can show and check it agrees with the committed events and the actual outcome.
// Run with `npm test`.
import test from "node:test";
import assert from "node:assert/strict";
import { makeCampaign } from "../src/story/campaign.js";
import { BATTLE_DAYS, DIG_DAYS, JOINT_DAYS, outcome, simulate } from "../src/story/play.js";
import { chronicle, dateKey, evidence } from "../src/story/chronicle.js";
import { CALENDAR } from "../src/story/definition.js";
import { FLEET_ROLE } from "../src/story/campaign.js";
import { campaignFor, closeSector, newWar, nextSector, worldForSector } from "../src/story/war.js";
import { KESTREL, setWorld } from "../src/story/world.js";
import { ledger, staffRoom } from "../src/story/rooms.js";
import * as story from "../src/fixture.js";
import { seeded } from "../src/chart/random.js";

const OWN = { radar: "run", defector: "talk", leak: "brief", collision: "search", visit: "quiet" };
const STAFF = { radar: "fix", defector: "hand", leak: "silent", collision: "return", visit: "open" };
const pick = (r, list) => list[Math.floor(r() * list.length)];

// A deterministic sample of legal runs for a campaign: every option of every slip appears.
function runs(c, n = 18) {
  const r = seeded(`runs-${c.seed}-${c.difficulty}`), out = [];
  for (let i = 0; i < n; i++) {
    const jb = pick(r, ["quiet", "show", "hold"]);
    const run = {
      dec: { beacon: pick(r, ["quiet", "rest", "show"]), lattice: pick(r, ["boats", "who", "when"]), incident: c.incidents.dec ? pick(r, [OWN, STAFF])[c.incidents.dec] : null },
      jan: { beacon: jb, lattice: pick(r, ["sarn", "when", "who"]), way: pick(r, [null, "buy", jb === "show" ? "act" : null]), incident: c.incidents.jan ? pick(r, [OWN, STAFF])[c.incidents.jan] : null },
      feb: { route: pick(r, ["quiet", "forward", "joint"]) },
    };
    if (run.feb.route === "joint" && !simulate(c, run).janEnd.navy) run.feb.route = "quiet";
    out.push(run);
  }
  return out;
}

function* sample() {
  for (const d of ["steady", "shifting", "volatile"]) for (let i = 0; i < 14; i++) {
    const c = makeCampaign(`S${i}`, d);
    for (const run of runs(c)) yield { c, run };
  }
}

// Every text the desk can show for a campaign, by surface.
function surfaces(c, run) {
  const flat = (x) => JSON.stringify(x, (k, v) => (typeof v === "function" ? undefined : v));
  return {
    brief: flat([story.brief(c, run, "dec"), story.brief(c, run, "jan")]),
    orders: flat([story.orders(c, run, "dec"), story.orders(c, run, "jan"), story.latticeOrders(c, run, "dec"), story.latticeOrders(c, run, "jan"), story.host(c, run)]),
    incidents: flat([story.incident(c, run, "dec"), story.incident(c, run, "jan")]),
    logs: flat([story.night(c, run, "dec"), story.night(c, run, "jan")]),
    february: flat(story.february(c, run)),
    showdown: flat(story.showdown(c, run)),
    debrief: story.debrief(c, run),
    rooms: flat([staffRoom(c, run, 5), ledger(c, run, 5)]),
  };
}

test("no screen shows undefined, NaN or a broken object", () => {
  for (const { c, run } of sample()) {
    const all = JSON.stringify(surfaces(c, run));
    assert.doesNotMatch(all, /undefined|NaN|\[object/, `${c.seed}/${c.difficulty}`);
  }
});

test("nobody reports troops boarding unless Lattice heard the order", () => {
  for (const { c, run } of sample()) {
    const rec = chronicle(c, run), heard = rec.intel.some((i) => i.claim.kind === "boarding" && i.claim.value);
    const S = surfaces(c, run);
    const told = [S.logs, S.february, S.debrief.halden, S.debrief.rows.map((r) => r[2]).join(" "), S.debrief.leaves.map((m) => m.line).join(" ")].join(" ");
    assert.equal(/heard (?!no )[^.]*troops aboard|order troops aboard|troops ordered aboard|heard the boarding order/.test(told), heard, `${c.seed}: heard=${heard}`);
    if (heard) assert.ok(rec.outcome.boarded, "the order was heard, so troops boarded");
  }
});

test("a turned-back or empty sailing is never also described as troops boarding", () => {
  for (const { c, run } of sample()) {
    const o = outcome(c, run);
    if (o.boarded) continue;
    const S = surfaces(c, run);
    assert.doesNotMatch(S.february + S.showdown + S.debrief.halden, /troops were aboard|order troops aboard|heard troops ordered aboard/);
  }
});

test("rest is claimed only when the record has it", () => {
  for (const { c, run } of sample()) {
    const rec = chronicle(c, run), rested = rec.events.some((e) => e.rested || e.kind === "rotation");
    const S = surfaces(c, run), memory = S.debrief.leaves.map((m) => `${m.line} ${m.quote}`).join(" ");
    assert.equal(/stood (?:them |\S+ )?down (?:\d|from|a company|in rotation)/.test(memory), rested, memory);
    assert.doesNotMatch(S.orders + S.logs, /Christmas rest|rested over Christmas/);
  }
});

test("February's cost forecast matches the result: fatigue added and who fought", () => {
  for (const { c, run } of sample()) {
    const o = outcome(c, run), s = o.s;
    const expected = s.fatigue + (o.route === "joint" ? JOINT_DAYS : 0) + (o.route === "forward" ? DIG_DAYS : 0) + (o.engaged ? BATTLE_DAYS : 0);
    assert.equal(o.daysAfter, expected);
    // The route's cost line lists every fatigue its rows can leave, including the fight.
    const route = story.february(c, run).routes.find((r) => r.id === o.route);
    for (const r of route.risk) assert.ok(route.costs.includes(`fatigue ${r.daysAfter}`), `${route.costs} / ${r.text}`);
    if (o.engaged) assert.match(route.costs, /if it fights|fights and ends/, route.costs);
  }
});

test("every cabinet count adds up, for and against", () => {
  for (const { c, run } of sample()) {
    const all = JSON.stringify(surfaces(c, run));
    for (const m of all.matchAll(/(\d+) for, (\d+) against/g)) assert.equal(Number(m[1]) + Number(m[2]), 11, m[0]);
    for (const m of all.matchAll(/(\d+) for · (\d+) against/g)) assert.equal(Number(m[1]) + Number(m[2]), 11, m[0]);
  }
});

test("every move in the cabinet's count is logged where it happens, and the log ends on the real count", () => {
  for (const { c, run } of sample()) {
    const sim = simulate(c, run), count = (x) => Math.round((x.support / 100) * 11);
    for (const [month, a, b] of [["dec", sim.decStart, sim.decEnd], ["jan", sim.decEnd, sim.janEnd]]) {
      let now = Math.max(0, Math.min(11, count(a)));
      for (const beat of story.night(c, run, month).beats) {
        for (const m of beat.text.matchAll(/(\d+) for, (\d+) against, from (\d+) for/g)) {
          assert.equal(Number(m[3]), now, `${c.seed}/${c.difficulty} ${month}: ${beat.text}`);
          now = Number(m[1]);
        }
        const vote = beat.text.match(/voted (\d+) for/);
        if (vote) assert.equal(Number(vote[1]), now, `${c.seed} ${month}: ${beat.text}`);
      }
      assert.equal(now, Math.max(0, Math.min(11, count(b))), `${c.seed}/${c.difficulty} ${month} ends on the real count`);
    }
  }
});

test("logs stay inside their month and before the decision; the decision comes before the sailing", () => {
  for (const { c, run } of sample()) {
    const rec = chronicle(c, run);
    for (const month of ["dec", "jan"]) {
      const N = story.night(c, run, month), end = rec.logEnd[month];
      for (const b of N.beats) {
        const [d, mon] = b.cause.split(" · ")[0].split(" ");
        assert.equal(mon, { dec: "December", jan: "January" }[month], b.cause);
        assert.ok(Number(d) <= end.day, `${b.cause} after ${end.day}`);
      }
    }
    assert.ok(dateKey(rec.logEnd.jan) < dateKey(rec.decision), "January's log ends before the decision");
    // Lattice hears them before they sail; the patrol boats and the radar see them sailing.
    // Either way the decision comes before they arrive.
    if (rec.decision.source.startsWith("lattice")) assert.ok(dateKey(rec.decision) < dateKey({ month: "feb", day: c.sailDay, hour: 6 }), "Lattice's word comes before the sailing");
    assert.ok(dateKey(rec.decision) < dateKey({ month: "feb", day: c.sailDay + 1, hour: 6 }), "the decision comes before they arrive");
  }
});

test("exposure to the rival is claimed exactly when the rules apply it", () => {
  for (const { c, run } of sample()) {
    const s = simulate(c, run).janEnd, logs = surfaces(c, run).logs;
    assert.equal(/counts one level lower/.test(logs), s.rivalKnows || s.radarFails, `rivalKnows ${s.rivalKnows}`);
  }
});

test("unfit and under strength are separate, and each is said only when true", () => {
  for (const { c, run } of sample()) {
    const o = outcome(c, run), D = story.debrief(c, run);
    assert.equal(D.score[2].text.startsWith("Unfit"), o.daysAfter > 120);
    assert.equal(/strong/.test(D.score[2].text), o.losses.battalion > 0);
  }
});

test("memories quote only recorded events", () => {
  for (const { c, run } of sample()) {
    const rec = chronicle(c, run), D = story.debrief(c, run);
    const halden = D.leaves.find((m) => m.who === "halden").line;
    const heard = rec.intel.find((i) => i.claim.kind === "boarding" && i.claim.value);
    if (/heard the boarding order on (\d+) (\w+)/.test(halden)) assert.ok(heard && halden.includes(`${heard.day} `), halden);
    const sato = D.leaves.find((m) => m.who === "sato").line, coal = rec.events.find((e) => e.kind === "coalition");
    assert.ok({ trade: /patrol boats/, hotline: /hotline/, acted: /moved first/, vote: /voted/ }[coal.how].test(sato), sato);
  }
});

test("a war's second sector tells the same truth", () => {
  try {
    for (let i = 0; i < 12; i++) {
      const war = newWar(`SW${i}`, "shifting");
      setWorld(worldForSector(war));
      const c1 = campaignFor(war), run1 = runs(c1, 1)[0], D1 = story.debrief(c1, run1);
      closeSector(war, c1, run1, D1.leaves, worldForSector(war));
      nextSector(war);
      setWorld(worldForSector(war));
      const c2 = campaignFor(war);
      for (const run of runs(c2, 6)) {
        const all = JSON.stringify(surfaces(c2, run));
        assert.doesNotMatch(all, /undefined|NaN|\[object/);
        assert.match(story.brief(c2, run, "dec").sections[2][1], new RegExp(`fatigue ${c2.fatigue0}`));
      }
    }
  } finally { setWorld(KESTREL); }
});

// Review 6: advice must not depend on hidden truth. Variants of a campaign that differ only in
// what the rival is really doing (its plan, a planted clue, its sailing date, its real craft
// count) and that leave the same evidence up to January's orders must get the same words on
// every screen up to that point: the same briefings, councils, options and log.
test("identical evidence gives identical advice, whatever the hidden truth", () => {
  const cutoff = { month: "jan", day: CALENDAR.jan.orders - 1, hour: 23 };
  // What the player can see. Two rival behaviours that read the same are the same evidence.
  const SAME = { "probe-show": "land-show" };
  const signature = (c, run) => {
    const ev = evidence(chronicle(c, run), cutoff), s = simulate(c, run).janOrders;
    return JSON.stringify({ intel: ev.intel, facts: ev.facts.map((f) => (f.kind === "rival" ? { ...f, behaviour: SAME[f.behaviour] ?? f.behaviour } : f)), knows: s.knows.count ?? null });
  };
  const screens = (c, run) => JSON.stringify([
    story.brief(c, run, "dec"), story.brief(c, run, "jan"), story.orders(c, run, "dec"), story.orders(c, run, "jan"),
    story.latticeOrders(c, run, "dec"), story.latticeOrders(c, run, "jan"), story.host(c, run), story.incident(c, run, "dec"), story.incident(c, run, "jan"),
    story.night(c, run, "dec"), story.status(c, simulate(c, run).janOrders), staffRoom(c, run, 3),
  ], (k, v) => (typeof v === "function" ? undefined : v));
  let compared = 0;
  for (const d of ["shifting", "volatile"]) for (let i = 0; i < 3; i++) {
    const base = makeCampaign(`H${i}`, d);
    for (const run of runs(base, 4)) {
      const groups = new Map();
      for (const plan of base.D.plans) for (const deceive of [null, "who", "when"]) for (const sailDay of [2, 4, 5, 7]) for (const extra of [0, 3]) {
        const c = { ...base, plan, deceive, sailDay, fleetRole: FLEET_ROLE[plan], craft: { dec: base.craft.dec, jan: base.craft.dec + extra } };
        const key = signature(c, run);
        if (!groups.has(key)) groups.set(key, { c, words: screens(c, run) });
        else { compared++; assert.equal(screens(c, run), groups.get(key).words, `${base.seed}/${d}: ${plan}/${deceive}/${sailDay}/${extra} reads differently from ${groups.get(key).c.plan}/${groups.get(key).c.deceive}/${groups.get(key).c.sailDay}`); }
      }
    }
  }
  assert.ok(compared > 100, `only ${compared} same-evidence pairs: the test is not exercising anything`);
});

// Review 6: a January incident on the 11th came before an order whose result was dated the
// 8th. Every month runs incidents, then orders, then what the orders cause; the record must be
// causally possible on every path.
test("the record is causally possible: incidents, then orders, then what they cause", () => {
  const CAUSED = ["beacon", "rotation", "coalition"];
  for (const { c, run } of sample()) {
    const rec = chronicle(c, run);
    for (const month of ["dec", "jan"]) {
      const orders = CALENDAR[month].orders, mine = rec.events.filter((e) => e.month === month);
      for (const e of mine.filter((x) => ["incident", "staff"].includes(x.kind))) assert.ok(e.day < orders, `${c.seed}: ${e.kind} ${e.id} on ${e.day} ${month}, orders on ${orders}`);
      for (const e of mine.filter((x) => CAUSED.includes(x.kind))) assert.ok(e.day > orders, `${c.seed}: ${e.kind} on ${e.day} ${month}, before the orders on ${orders}`);
      // What the orders bought from Lattice arrives after them; the 1 December count is the
      // closer look ordered in November.
      for (const i of rec.intel.filter((x) => x.month === month && x.source.startsWith("lattice") && !(x.month === "dec" && x.day === CALENDAR.dec.count))) assert.ok(i.day > orders, `${c.seed}: ${i.source} on ${i.day} ${month}`);
    }
    // The visit's effects come after she asks, and the vote comes after everything it counts.
    const vote = rec.events.find((e) => e.kind === "coalition");
    for (const e of rec.events.filter((x) => x.month === "jan" && x.cabinet && x.kind !== "coalition")) assert.ok(dateKey(e) < dateKey(vote), `${c.seed}: ${e.kind} on ${e.day} moved the cabinet after the ${vote.how} on ${vote.day}`);
    for (let i = 1; i < rec.events.length; i++) assert.ok(dateKey(rec.events[i - 1]) <= dateKey(rec.events[i]), "events out of order");
  }
});

// Review 6: B0 (a bluff, Lattice on the quay, holding quietly) showed "troops boarding" on the
// chart. Every chart label says how we knew from the decision in the record.
test("the chart's labels never claim troops boarded unless the record has the order", () => {
  for (const { c, run } of sample()) {
    const rec = chronicle(c, run), heard = rec.decision.source === "lattice-boarding";
    const labels = story.showdown(c, run).play.steps.flatMap((s) => s.labels ?? []).map((l) => l.text).join(" | ");
    assert.equal(/troops boarding/.test(labels), heard, `${c.seed}: ${labels}`);
    if (!outcome(c, run).boarded) assert.match(labels, /No troops aboard/);
  }
});

// Review 6: every number and threshold about landing craft says the same thing.
test("landing-craft counts are described by one threshold everywhere", () => {
  for (const { c, run } of sample()) {
    const all = JSON.stringify(surfaces(c, run));
    assert.doesNotMatch(all, /battalion’s worth|Not quite a battalion|Enough to land a battalion|Ten craft is one battalion/);
    for (const m of all.matchAll(/(\d+) (?:landing )?craft[^.]*?: (enough for a second wave|one wave, not enough for a second)/g)) assert.equal(m[2] === "enough for a second wave", Number(m[1]) >= 12, m[0]);
  }
});

// Review 6: after exposure, the built level and the level a landing meets are both said, on
// every screen that names a level.
test("built level and level against a landing are distinguished wherever they differ", () => {
  for (const { c, run } of sample()) {
    const s = simulate(c, run).janEnd;
    const bar = story.status(c, s)[2].value, F = story.february(c, run).warning[1];
    if (s.rivalKnows || s.radarFails) {
      assert.match(bar, /built/, bar);
      assert.match(F, /against a landing \(\d built/, F);
    } else assert.doesNotMatch(bar, /built/, bar);
  }
});
