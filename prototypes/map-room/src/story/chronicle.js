// The campaign's record: what happened, on which day, and what we learned, from whom and how
// surely. Every screen that tells the story reads from this one record: the monthly logs, the
// February decision, the showdown, the debrief, the ledger and the officers' memories. So
// none of them can claim an event that did not happen, or a certainty we never had.
//
// It holds facts only, no words; copy.js turns them into sentences with the theatre's names.
// Pure: the same campaign and choices always give the same record.
import { incidentById, incidentDay } from "./incidents.js";
import { DATE_REST, effectiveDefence, ministersFor, outcome, simulate } from "./play.js";

// A date as (month, day, hour), ordered: December, January, February.
const M = { dec: 0, jan: 1, feb: 2 };
export const dateKey = (d) => M[d.month] * 10000 + d.day * 100 + (d.hour ?? 12);
const at = (month, day, hour) => ({ month, day, hour });

// The moment we learn they are moving, and from what. Every February decision is made
// here, before they arrive. A boarding order heard two days out can fall in January.
export function decisionAt(c, s) {
  const boarded = s.plan === "land";
  if (s.warning === "fresh") {
    if (boarded) return c.sailDay > 2 ? { ...at("feb", c.sailDay - 2, 22), source: "lattice-boarding" } : { ...at("jan", 29 + c.sailDay, 22), source: "lattice-boarding" };
    return { ...(c.sailDay > 1 ? at("feb", c.sailDay - 1, 22) : at("jan", 31, 22)), source: "lattice-no-boarding" };
  }
  if (s.knows.date && !s.knows.date.planted && s.boats >= 2) return { ...at("feb", c.sailDay, 5), source: "patrol-boats" };
  return { ...at("feb", c.sailDay, 7), source: "radar" };
}

// The last day a month's log covers: the month's end, or the day before the decision if
// the decision comes first.
export function logEnd(c, s, month) {
  if (month === "dec") return at("dec", 31);
  const d = decisionAt(c, s);
  return d.month === "jan" ? at("jan", d.day - 1) : at("jan", 31);
}

export function chronicle(c, run = {}) {
  const sim = simulate(c, run), o = outcome(c, run), s = o.s;
  const events = [], intel = [];
  const ev = (date, kind, facts = {}) => events.push({ ...date, kind, ...facts });
  const know = (date, source, claim, certainty, truth) => intel.push({ ...date, source, claim, certainty, truth });

  // The cabinet's count, and every move in it, logged against the event that moved it.
  const count = (x) => ministersFor(x.support), tally = (x) => ({ for: count(x), against: 11 - count(x) });
  const moved = (a, b) => (count(a) === count(b) ? null : { from: tally(a), to: tally(b) });
  const movedBy = (key) => { const m = sim.janEnd.moved?.[key]; return m ? moved({ support: m[0] }, { support: m[1] }) : null; };

  // ── December ──
  know(at("dec", 1), "lattice-harbour", { kind: "count", value: c.craft.dec }, "confirmed", true);
  for (const month of ["dec", "jan"]) {
    const orders = month === "dec" ? sim.decOrders : sim.janOrders;
    const e = c.staffEvent;
    if (e?.month === month) {
      const inc = incidentById(e.id), pick = orders.staffDone?.[month];
      ev(at(month, incidentDay(c, e.id, month)), "staff", { id: e.id, option: pick, by: "staff", fatigue: e.id === "radar" ? 12 : 0, cabinet: movedBy(`staff-${month}`) });
      if (e.id === "defector" && orders.knows.claim) know(at(month, incidentDay(c, e.id, month) + 7), "defector", { kind: "plan", value: orders.knows.claim.plan }, "claimed", !orders.knows.claim.planted);
    }
    const id = c.incidents[month];
    if (id) {
      const inc = incidentById(id), pick = orders.incident[month];
      ev(at(month, incidentDay(c, id, month)), "incident", { id, option: pick, by: inc.options.find((x) => x.id === pick)?.staff ? "staff-answer" : "you", cabinet: movedBy(`incident-${month}`) });
      if (id === "collision" && pick === "search") know(at(month, incidentDay(c, id, month)), "search", { kind: "role", value: c.fleetRole }, "confirmed", true);
      if ((id === "leak" && pick === "brief") || (id === "visit" && pick === "open")) ev(at(month, incidentDay(c, id, month) + 1), "exposed", { id });
    }
  }
  const db = run.dec?.beacon ?? "quiet";
  // The day the order promised: in place by the 20th by night, the frigate from the 19th, rest from the 18th.
  ev(at("dec", { quiet: 20, show: 19, rest: 18 }[db]), "beacon", { option: db, by: db === "quiet" ? "staff" : "you", def: [sim.decOrders.def, sim.decEnd.def], fatigue: [sim.decOrders.fatigue, sim.decEnd.fatigue], rested: db === "rest" ? { from: at("dec", 18), to: at("dec", 31) } : null, cabinet: moved(sim.decOrders, sim.decBeacon) });
  // Ministers who move on their own (drift, or the rival's press): logged when the count changes.
  const drift = [[sim.decBeacon, sim.decEnd, at("dec", 31, 9)], [sim.decEnd, sim.janDrift, at("jan", 2, 8)]];
  for (const [a, b, date] of drift) { const m = moved(a, b); if (m) ev(date, "cabinet", m); }
  if (db === "show") know(at("dec", 21), "reaction", { kind: "reaction", value: sim.decEnd.knows.reaction }, "likely", true);
  const q = run.dec?.lattice ?? "boats";
  if (q === "boats") know(at("dec", 27), "lattice-harbour", { kind: "count", value: c.craft.jan }, "confirmed", true);
  if (q === "who") know(at("dec", 27), "lattice-fishing", { kind: "role", value: sim.decEnd.knows.role }, "likely", c.deceive !== "who");
  if (q === "when") know(at("dec", 27), "lattice-fleet", { kind: "date", value: sim.decEnd.knows.date }, "single", c.deceive !== "when");
  ev(at("dec", 30), "rival", { plan: c.plan, beacon: db });

  // ── January ──
  const jb = run.jan?.beacon ?? "quiet", jq = run.jan?.lattice ?? "sarn", end = logEnd(c, s, "jan");
  const jDay = { quiet: 20, show: 16, hold: 10 }[jb];
  ev(at("jan", jDay), "beacon", { option: jb, by: jb === "quiet" ? "staff" : "you", def: [sim.janOrders.def, s.def], fatigue: [sim.janOrders.fatigue, s.fatigue], rested: jb === "hold" ? { from: at("jan", 10), to: end } : null });
  if (jq === "when") {
    know(at("jan", 8), "lattice-fleet", { kind: "date", value: s.knows.date }, "confirmed", true);
    ev(at("jan", 9), "rotation", { by: "staff", fatigue: DATE_REST, corrected: Boolean(s.knows.date?.corrected) });
  }
  if (jq === "who") know(at("jan", 24), "lattice-fishing", { kind: "role", value: c.fleetRole }, "confirmed", true);
  // Coalition: who approved what, and the cabinet's count for and against.
  const forUs = ministersFor(s.support);
  const coalition = s.approvedBy === "trade" ? { how: "trade", day: Math.min(c.voteDay, 14) }
    : s.actedAlone ? { how: "acted", day: 17 }
      : s.approvedBy === "hotline" ? { how: "hotline", day: 15 }
        : { how: "vote", day: c.voteDay };
  ev(at("jan", coalition.day), "coalition", { how: coalition.how, navy: s.navy, for: forUs, against: 11 - forUs, cabinet: moved(sim.janOrders, s) });
  if (s.radarFails) ev(at("jan", Math.min(28, end.day)), "radar-failed", {});
  ev(at("jan", Math.min(30, end.day)), "rival", { plan: s.plan });
  if (jq === "sarn") know(at("jan", end.day), "lattice-harbour", { kind: "boarding", value: false, asOf: end }, "confirmed", true);

  // ── February ──
  const d = decisionAt(c, s);
  if (d.source === "lattice-boarding") know(d, "lattice-harbour", { kind: "boarding", value: true }, "confirmed", true);
  if (d.source === "lattice-no-boarding") know(d, "lattice-harbour", { kind: "boarding", value: false }, "confirmed", true);
  if (d.source === "patrol-boats") know(d, "patrol-boats", { kind: "sailing", value: true }, "confirmed", true);
  if (d.source === "radar") know(d, "radar", { kind: "sailing", value: true }, "confirmed", true);
  ev(d, "decision", { source: d.source });
  if (run.feb?.route) {
    ev(at("feb", c.sailDay, 6), "sailed", { boarded: o.boarded });
    ev(at("feb", c.sailDay + 1, 6), "contact", { code: o.code, route: o.route, failed: o.failed.map((r) => r.key), engaged: o.engaged, losses: o.losses });
  }
  events.sort((a, b) => dateKey(a) - dateKey(b));
  intel.sort((a, b) => dateKey(a) - dateKey(b));
  return { events, intel, decision: d, logEnd: { dec: logEnd(c, s, "dec"), jan: end }, outcome: o, defence: effectiveDefence(s) };
}

// What we knew at a moment: the latest claim of each kind, with its certainty.
export function knownAt(record, date) {
  const known = {};
  for (const i of record.intel) if (dateKey(i) <= dateKey(date)) known[i.claim.kind] = i;
  return known;
}
