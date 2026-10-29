// The side rooms: the staff room (who your officers are, what they want now, and how
// often you have taken their advice) and the ledger (every decision committed so far and
// what it changed). Pure: both are read from the campaign and the committed choices, so
// they add no rules of their own.
import { WORLD as W, onWorld } from "./world.js";
import { OFFICERS } from "./officers.js";
import { host, incident, latticeQ, orders, status } from "./copy.js";
import { ministersFor, simulate } from "./play.js";

let MA, R, S, B;
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
    jan: { beacon: progress >= 4 ? run.jan?.beacon ?? "quiet" : "quiet", way: progress >= 4 ? run.jan?.way ?? null : null, incident: progress >= 3 ? run.jan?.incident ?? null : null },
    feb: { route: progress >= 5 ? run.feb?.route ?? "quiet" : null },
  };
}

// Every decision taken so far that at least one officer argued about.
function decisions(c, run, progress) {
  const done = committed(run, progress), out = [];
  const inc = (month, at) => {
    if (progress < at || !c.incidents[month]) return;
    const I = incident(c, done, month), pick = done[month].incident ?? I.staffId;
    out.push({ when: I.date, what: I.title, chose: I.options.find((o) => o.id === pick).name, staff: pick === I.staffId, council: I.council, pick });
  };
  const ord = (month, at) => {
    if (progress < at) return;
    const o = orders(c, done, month), pick = done[month].beacon;
    out.push({ when: month === "dec" ? "18 December" : "January", what: `${B}’s ${month === "dec" ? "December" : "January"} orders`, chose: o.options.find((x) => x.id === pick).name, staff: pick === o.staffId, council: o.council, pick });
  };
  inc("dec", 1); ord("dec", 2); inc("jan", 3); ord("jan", 4);
  return out;
}

// ── the staff room ──────────────────────────────────────────────────────────
export function staffRoom(c, run, progress) {
  const done = committed(run, progress), s = simulate(c, done)[POINT[progress]];
  const month = progress < 2 ? "dec" : progress < 4 ? "jan" : null;
  const now = month ? orders(c, done, month) : null;
  const chips = status(c, s), past = decisions(c, run, progress);
  return STAFF.map((id) => {
    const o = OFFICERS[id], view = now?.council[id];
    const heard = past.filter((d) => d.council[id]);
    const followed = heard.filter((d) => d.council[id].prefers === d.pick).length;
    return {
      id, rank: o.rank, name: o.name, post: o.post, from: o.from, focus: o.focus, pushes: o.pushes, role: o.role,
      watching: chips.find((x) => x.who === id),
      now: view && { month: month === "dec" ? "December" : "January", wants: now.options.find((x) => x.id === view.prefers).name, staffPlan: view.prefers === now.staffId, because: view.because, risk: view.risk, line: view.line },
      record: heard.length ? { followed, of: heard.length, last: heard.at(-1) && { what: heard.at(-1).what, agreed: heard.at(-1).council[id].prefers === heard.at(-1).pick } } : null,
    };
  });
}

// ── the ledger ──────────────────────────────────────────────────────────────
const knowLines = (c, s) => {
  const k = s.knows, out = [];
  if (k.count) out.push(`${k.count} landing craft in ${S} at the end of December.`);
  if (k.role) out.push({ screen: `${R}’s fishing boats are sailing with the landing craft, under navy orders.`, swarm: `${R}’s fishing boats crowd the shipping lane in daylight, under navy orders.`, scout: `${R}’s fishing boats are counting ${B}’s guns at night, under navy orders.` }[k.role]);
  if (k.date) out.push(k.date.kind === "exercise" ? `${R} has announced an exercise from ${k.date.day} February.` : `${R}’s ships are ordered to sea by ${k.date.day} February.`);
  if (k.claim) out.push(`The defector says ${k.claim.plan === "land" ? "a landing is planned" : k.claim.plan === "bluff" ? "there is no landing, only a threat" : "they will test us first"}. Not yet confirmed.`);
  return out;
};

export function ledger(c, run, progress) {
  const done = committed(run, progress), sim = simulate(c, done);
  const entries = [];
  const add = (when, title, lines, stateKey) => entries.push({ when, title, lines, after: stateKey && status(c, sim[stateKey]) });
  if (progress >= 1 && c.incidents.dec) {
    const I = incident(c, done, "dec"), pick = done.dec.incident ?? I.staffId, o = I.options.find((x) => x.id === pick);
    add(I.date, I.title, [`${o.staff ? "Staff answer" : "Your call, one personal order"}: ${lower(o.name)}.`], "decOrders");
  }
  if (progress >= 2) {
    const o = orders(c, done, "dec"), b = o.options.find((x) => x.id === done.dec.beacon), q = latticeQ(done.dec.lattice);
    add("December", "December orders", [`${B}: ${lower(b.name)}${b.staff ? " (staff plan)" : " (your order)"}.`, `${W.network}: ${q.q}${q.staff ? " (staff plan)" : " (your question)"}`], "decEnd");
  }
  if (progress >= 3 && c.incidents.jan) {
    const I = incident(c, done, "jan"), pick = done.jan.incident ?? I.staffId, o = I.options.find((x) => x.id === pick);
    add(I.date, I.title, [`${o.staff ? "Staff answer" : "Your call, one personal order"}: ${lower(o.name)}.`], "janOrders");
  }
  if (progress >= 4) {
    const o = orders(c, done, "jan"), b = o.options.find((x) => x.id === done.jan.beacon), H = host(c, done);
    const way = done.jan.way && [...H.ways, H.secure].find((x) => x.id === done.jan.way);
    add("January", "January orders", [`${B}: ${lower(b.name)}${b.staff ? " (staff plan)" : " (your order)"}.`, `${W.host}: ${way ? lower(way.name) : "wait for the cabinet’s vote"}${way ? " (your order)" : " (staff plan)"}.`], "janEnd");
  }
  if (progress >= 5) add("February", "The showdown", [done.feb.route === "joint" ? `Stood with ${W.host}’s navy.` : "Held quietly."], null);
  const s = sim[POINT[progress]];
  return {
    code: c.seed, difficulty: c.D.name, entries,
    knows: knowLines(c, s),
    cabinet: `${ministersFor(s.support)} of ${W.ministers} ${MA} ministers with us.`,
    now: status(c, s),
  };
}

// Recomputed whenever the theatre changes (see setWorld in src/story/world.js).
onWorld(() => {
  MA = W.hostAdj; R = W.rival; S = W.harbour; B = W.stationShort;
});
