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

// How tired 2nd Battalion is, in the words every screen uses. Past 100 days a unit starts
// losing people to sickness and mistakes; past 120 a third of it is unfit to fight.
export const FATIGUE = { tired: 100, unfit: 120 };
export const fatigueWord = (days) => (days === 0 ? "rested" : days > FATIGUE.unfit ? "unfit" : days > FATIGUE.tired ? "tired" : "fit");

// What a joint stand in February costs 2nd Battalion: a month of hard work; a battle on the
// headland costs more. Meeting an empty landing force with two navies costs Marenna's
// ministers' patience (OVERREACTION, in support points).
const JOINT_DAYS = 30, BATTLE_DAYS = 20, OVERREACTION = 15;

// The February result. Route is "quiet" (hold on Beacon) or "joint" (with Marenna's navy).
// Every fact the debrief states is computed here once, so the words can't contradict it.
export function outcome(c, run) {
  const s = simulate(c, run).janEnd;
  const route = run.feb?.route ?? "quiet";
  const fit = s.fatigue <= FATIGUE.unfit;
  // Two separate things: Lattice still listening to Sarn (hears troops ordered aboard), and
  // knowing the sailing date. A date alone only helps if the patrol boats are still ours to
  // see the ships actually leave.
  const listening = s.warning === "fresh";
  const dated = Boolean(s.knows.date && !s.knows.date.planted);
  const warned = listening || (dated && s.boats >= 2);
  const reinforced = fit && warned;
  const def = s.def - (s.radarFails ? 1 : 0);
  // A landing force of 12 or more craft is a battalion and a second wave: Beacon alone
  // cannot hold it, so a worn-out or unwarned 2nd Battalion loses the headland.
  const big = c.craft.jan >= 12;
  const holds = big ? def >= 3 && reinforced : def >= 3 || (def >= 2 && reinforced);
  // Two navies stop a landing at sea only if they know when it sails, or if it is small enough
  // to turn back in one meeting. Otherwise it lands, and Beacon has to hold.
  const intercept = warned || !big;
  let code;
  if (s.plan === "land") code = route === "joint" ? (intercept ? "stopped" : "landed") : holds ? "held" : "lost";
  else if (s.plan === "bluff") code = route === "joint" ? "called" : "outlasted";
  else code = route === "joint" ? "faced" : "waited";

  // The three things you are asked to protect, and the grade they add up to.
  const battle = code === "held" || code === "landed";
  const daysAfter = s.fatigue + (route === "joint" ? JOINT_DAYS : 0) + (battle ? BATTLE_DAYS : 0);
  const supportAfter = s.support - (code === "called" ? OVERREACTION : 0);
  const kept = {
    beacon: code !== "lost",
    ally: ministersFor(supportAfter) >= 6,
    battalion: daysAfter <= FATIGUE.unfit,
  };
  const grade = !kept.beacon ? "failure" : kept.ally && kept.battalion ? "success" : "costly";
  return { code, route, s, fit, listening, dated, warned, reinforced, def, big, intercept, battle, daysAfter, supportAfter, kept, grade };
}
