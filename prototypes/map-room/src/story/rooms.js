// The side rooms: the staff room (who your officers are, what they want now, and how
// often you have taken their advice) and the ledger (every decision committed so far and
// what it changed). Pure: both are read from the campaign and the committed choices, so
// they add no rules of their own.
import { officersFor } from "./officers.js";
import { host, incident, knownLines, latticeOrders, latticeQ, orders, status } from "./copy.js";
import { ministersFor, simulate } from "./play.js";
import { incidentsFor } from "./incidents.js";
import { CALENDAR, FIXED, incidentDay } from "./definition.js";

// Lower-case only the first letter, so names inside an option (Beacon, Marenna) keep theirs.
const lower = (t) => t[0].toLowerCase() + t.slice(1);
export const STAFF = ["halden", "briggs", "okafor", "sato"];

// How far the campaign has got at each chapter: 0 nothing committed, 1 December's incident
// answered, 2 December's orders sent, 3 January's incident answered, 4 January's orders
// sent, 5 February decided. Choices beyond this point are still being made and don't count.
export const PROGRESS = {
  title: 0, chart: 0, "dec-brief": 0, "dec-signal": 0, "dec-orders": 1, "dec-night": 2,
  "jan-brief": 2, "jan-signal": 2, "jan-orders": 3, "jan-night": 4, "feb-showdown": 4, debrief: 5,
};
const POINT = ["decStart", "decOrders", "decEnd", "janOrders", "janEnd", "janEnd"];

// Only what had been committed by `progress`, with staff defaults for what had not.
export function committed(run, progress) {
  return {
    dec: { beacon: progress >= 2 ? run.dec?.beacon ?? "quiet" : "quiet", lattice: progress >= 2 ? run.dec?.lattice ?? "boats" : "boats", incident: progress >= 1 ? run.dec?.incident ?? null : null },
    jan: { beacon: progress >= 4 ? run.jan?.beacon ?? "quiet" : "quiet", lattice: progress >= 4 ? run.jan?.lattice ?? "sarn" : "sarn", way: progress >= 4 ? run.jan?.way ?? null : null, incident: progress >= 3 ? run.jan?.incident ?? null : null },
    feb: { route: progress >= 5 ? run.feb?.route ?? "quiet" : null },
  };
}

// Every decision taken so far that at least one officer argued about.
function decisions(c, run, progress) {
  const W = c.world, B = W.stationShort, done = committed(run, progress), out = [];
  const inc = (month, at) => {
    if (progress < at || !c.incidents[month]) return;
    const I = incident(c, done, month), pick = done[month].incident ?? I.staffId;
    out.push({ when: I.date, what: I.title, chose: I.options.find((o) => o.id === pick).name, staff: pick === I.staffId, council: I.council, pick });
  };
  const ord = (month, at) => {
    if (progress < at) return;
    const o = orders(c, done, month), pick = done[month].beacon;
    out.push({ when: `${CALENDAR[month].orders} ${month === "dec" ? "December" : "January"}`, what: `${B}’s ${month === "dec" ? "December" : "January"} orders`, chose: o.options.find((x) => x.id === pick).name, staff: pick === o.staffId, council: o.council, pick });
    const l = latticeOrders(c, done, month), q = done[month].lattice;
    out.push({ when: `${CALENDAR[month].orders} ${month === "dec" ? "December" : "January"}`, what: `${W.network}’s ${month === "dec" ? "December" : "January"} question`, chose: l.options.find((x) => x.id === q).name, staff: q === l.staffId, council: l.council, pick: q });
  };
  inc("dec", 1); ord("dec", 2); inc("jan", 3); ord("jan", 4);
  return out;
}

// ── the staff room ──────────────────────────────────────────────────────────
export function staffRoom(c, run, progress) {
  const done = committed(run, progress), s = simulate(c, done)[POINT[progress]];
  const month = progress < 2 ? "dec" : progress < 4 ? "jan" : null;
  // The month being decided is read as it now stands on the desk, so advice answers the plan
  // you have, not the staff default.
  const live = month ? { ...done, [month]: { ...done[month], ...(run[month] ?? {}) } } : done;
  const now = month ? orders(c, live, month) : null, pick = month ? live[month].beacon ?? "quiet" : null;
  const chips = status(c, s), past = decisions(c, run, progress);
  const OFFICERS = officersFor(c.world);
  return STAFF.map((id) => {
    const o = OFFICERS[id], view = now?.council[id];
    const heard = past.filter((d) => d.council[id]);
    const followed = heard.filter((d) => d.council[id].prefers === d.pick).length;
    return {
      id, rank: o.rank, name: o.name, post: o.post, from: o.from, focus: o.focus, pushes: o.pushes, role: o.role,
      watching: chips.find((x) => x.who === id),
      now: view && { month: month === "dec" ? "December" : "January", wants: now.options.find((x) => x.id === view.prefers).name, staffPlan: view.prefers === now.staffId, because: view.because, line: view.line,
        chosen: now.options.find((x) => x.id === pick).name, following: view.prefers === pick, risk: view.prefers === pick ? null : view.risks[pick] },
      record: heard.length ? { followed, of: heard.length, last: heard.at(-1) && { what: heard.at(-1).what, agreed: heard.at(-1).council[id].prefers === heard.at(-1).pick } } : null,
    };
  });
}

// ── the ledger ──────────────────────────────────────────────────────────────
// The moment each stage of the campaign has reached, for "what we knew then".
const ASOF = [{ month: "dec", day: 1 }, { month: "dec", day: CALENDAR.dec.orders - 1 }, { month: "dec", day: 31 }, { month: "jan", day: CALENDAR.jan.orders - 1 }, { month: "jan", day: 31 }, { month: "feb", day: 28 }];

export function ledger(c, run, progress) {
  const W = c.world, B = W.stationShort, MA = W.hostAdj, INC = incidentsFor(W);
  const done = committed(run, progress), sim = simulate(c, done);
  const entries = [];
  const add = (when, title, lines, stateKey) => entries.push({ when, title, lines, after: stateKey && status(c, sim[stateKey]) });
  const staffBusiness = (month, name) => { const e = INC.byId(c.staffEvent.id); add(`${incidentDay(e.id, month)} ${name}`, e.title, [`Staff handled: ${lower(e.options.find((o) => o.staff).name)}.`], null); };
  if (progress >= 1 && c.staffEvent?.month === "dec") staffBusiness("dec", "December");
  if (progress >= 3 && c.staffEvent?.month === "jan") staffBusiness("jan", "January");
  if (progress >= 1 && c.incidents.dec) {
    const I = incident(c, done, "dec"), pick = done.dec.incident ?? I.staffId, o = I.options.find((x) => x.id === pick);
    add(I.date, I.title, [`${o.staff ? "Staff answer" : "Your call, one personal order"}: ${lower(o.name)}.`], "decOrders");
  }
  if (progress >= 2) {
    const o = orders(c, done, "dec"), b = o.options.find((x) => x.id === done.dec.beacon), q = latticeQ(c, done.dec.lattice, "dec");
    add(`${CALENDAR.dec.orders} December`, "December orders", [`${B}: ${lower(b.name)}${b.staff ? " (staff plan)" : " (your order)"}.`, `${W.network}: ${q.q}${q.staff ? " (staff plan)" : " (your order)"}`], "decEnd");
  }
  if (progress >= 3 && c.incidents.jan) {
    const I = incident(c, done, "jan"), pick = done.jan.incident ?? I.staffId, o = I.options.find((x) => x.id === pick);
    add(I.date, I.title, [`${o.staff ? "Staff answer" : "Your call, one personal order"}: ${lower(o.name)}.`], "janOrders");
  }
  if (progress >= 4) {
    const o = orders(c, done, "jan"), b = o.options.find((x) => x.id === done.jan.beacon), H = host(c, done);
    const way = done.jan.way && [...H.ways, H.secure].find((x) => x.id === done.jan.way);
    const jq = latticeQ(c, done.jan.lattice, "jan");
    add(`${CALENDAR.jan.orders} January`, "January orders", [`${B}: ${lower(b.name)}${b.staff ? " (staff plan)" : " (your order)"}.`, `${W.network}: ${lower(jq.q)}${jq.staff ? " (staff plan)" : " (your order)"}.`, `${W.host}: ${way ? lower(way.name) : "wait for the cabinet’s vote"}${way ? " (your order)" : " (staff plan)"}.`], "janEnd");
  }
  if (progress >= 5) add("February", "The showdown", [{ joint: `Stood with ${W.host}’s navy.`, forward: `Dug ${W.reserve} in on the headland.`, quiet: "Held quietly." }[done.feb.route]], null);
  const s = sim[POINT[progress]];
  return {
    code: c.seed, difficulty: c.D.name, entries,
    knows: knownLines(c, done, ASOF[progress]),
    cabinet: `${MA} cabinet: ${ministersFor(s.support)} for, ${FIXED.ministers - ministersFor(s.support)} against.`,
    now: status(c, s),
  };
}
