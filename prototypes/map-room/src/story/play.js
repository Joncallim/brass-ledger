// How the campaign state moves with your choices. Pure and deterministic: the same campaign
// and the same choices always give the same state, which is what the copy and the map read.
// Prototype rules awaiting sign-off; packages/sim stays the authority for the real game.
import { incidentById } from "./incidents.js";

const n = (x, k) => Math.round(x * k);
const MINISTER_PENALTY = { dove: 20, firm: 12, hawk: 6 }; // a daylight move made without the cabinet
const ACT_PENALTY = { dove: 25, firm: 15, hawk: 8 }; // acting first and telling Marenna after

export const ministersFor = (support, total = 11) => Math.max(0, Math.min(total, Math.round((support / 100) * total)));

function applyIncident(c, month, choice, s) {
  const id = c.incidents[month];
  if (!id) return;
  const inc = incidentById(id);
  const opt = inc.options.find((o) => o.id === choice) ?? inc.options.find((o) => o.staff);
  opt.effect(s, c, c.D.severity);
  s.incident[month] = opt.id;
}

// Snapshots at each point the screens need: the start of a month, the moment orders are
// written (after the month's incident), and the end of the month.
export function simulate(c, run = {}) {
  const k = c.D.severity;
  const s = {
    fatigue: c.fatigue0, ring: 30, def: 1, support: c.support0, boats: 2, warning: "fresh",
    knows: {}, rivalSaw: false, rivalKnows: false, radarFails: false, tension: 0,
    navy: null, voteFailed: false, actedAlone: false, approvedBy: null, incident: {}, notes: [], plan: c.plan, shift: null,
  };
  const snap = {};
  const take = () => structuredClone(s);
  snap.decStart = take();

  applyIncident(c, "dec", run.dec?.incident, s);
  snap.decOrders = take();
  const db = run.dec?.beacon ?? "quiet";
  if (db === "quiet") { s.def += 1; s.fatigue += 31; }
  if (db === "rest") { s.fatigue = 0; s.notes.push("rested-dec"); }
  if (db === "show") { s.def += 1; s.fatigue += 31; s.ring = 32; s.rivalSaw = true; s.support -= n(MINISTER_PENALTY[c.minister], k); }
  const q = run.dec?.lattice ?? "boats";
  s.warning = q === "boats" ? "fresh" : "stale";
  if (q === "boats") s.knows.count = c.craft.jan;
  if (q === "who") s.knows.role = c.deceive === "who" ? "screen" : c.fleetRole;
  if (q === "when") s.knows.date = c.deceive === "when"
    ? { day: c.plan === "land" ? Math.min(9, c.sailDay + 3) : c.sailDay, kind: "landing", planted: true }
    : { day: c.sailDay, kind: c.plan === "bluff" ? "exercise" : c.plan === "probe" ? "two-stage" : "landing" };
  if (c.plan === "bluff" && db === "show") s.support -= n(5, k); // Ravellan's press makes the most of it
  s.support += c.drift.dec;
  snap.decEnd = take();

  applyIncident(c, "jan", run.jan?.incident, s);
  snap.janOrders = take();
  const jb = run.jan?.beacon ?? "quiet", way = run.jan?.way ?? null;
  if (jb === "quiet") { s.def += 1; s.ring = Math.max(s.ring, 32); s.fatigue += 31; }
  if (jb === "hold") { s.fatigue = 0; s.notes.push("rested-jan"); }
  if (jb === "show") { s.def += 1; s.ring = 32; s.fatigue += 31; s.rivalSaw = true; }
  s.support += c.drift.jan;
  const hotlineYes = c.hotline && snap.janOrders.support >= 55;
  if (way === "buy") { s.boats -= 2; s.support += n(4, k); s.navy = true; s.approvedBy = "trade"; }
  else if (jb === "show" && way === "act") {
    s.support -= n(ACT_PENALTY[c.minister], k); s.actedAlone = true;
    s.navy = c.minister === "hawk" && s.support >= 50;
  } else if (jb === "show" && hotlineYes) { s.navy = s.support >= 50; s.approvedBy = "hotline"; }
  else { s.navy = s.support >= 50; s.voteFailed = !s.navy; s.approvedBy = s.navy ? "vote" : null; }

  // What Ravellan actually does in February, given what it has seen.
  let plan = c.plan;
  if (c.D.planShift && plan === "bluff" && s.support < 40) { plan = "land"; s.shift = "bluff-to-land"; }
  if (plan === "land" && jb === "show" && s.def >= 3) { plan = "deterred"; s.shift = s.shift ?? "deterred"; }
  if (plan === "probe") plan = s.def < 3 || s.radarFails ? "land" : "turned";
  s.plan = plan;
  snap.janEnd = take();
  return snap;
}

// Whether the January order needs an answer from Marenna before Send.
export const needsApproval = (c, s, beacon) => beacon === "show" && !(c.hotline && s.support >= 55);

// The February result. Route is "quiet" (hold on Beacon) or "joint" (with Marenna's navy).
export function outcome(c, run) {
  const s = simulate(c, run).janEnd;
  const route = run.feb?.route ?? "quiet";
  const fit = s.fatigue <= 120;
  const warned = s.warning === "fresh" || (s.knows.date && !s.knows.date.planted);
  const reinforced = fit && warned;
  const def = s.def - (s.radarFails ? 1 : 0);
  let code;
  // A landing force of 12 or more craft is a battalion and a second wave: Beacon alone
  // cannot hold it, so a worn-out or unwarned 2nd Battalion loses the headland.
  const big = c.craft.jan >= 12;
  const holds = big ? def >= 3 && reinforced : def >= 3 || (def >= 2 && reinforced);
  if (s.plan === "land") code = route === "joint" ? "stopped" : holds ? "held" : "lost";
  else if (s.plan === "bluff") code = route === "joint" ? "called" : "outlasted";
  else code = route === "joint" ? "faced" : "waited";
  return { code, route, s, fit, warned, reinforced, def, big };
}
