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
    // Days the battalion's engineers owe this month (the radar repair), added after its orders.
    eng: 0,
  };
  // In a war, refit money can put Lattice in place early: the count is known from the start.
  if (c.knownCount) s.knows.count = c.craft.jan;
  const snap = {};
  const take = () => structuredClone(s);
  snap.decStart = take();

  applyIncident(c, "dec", run.dec?.incident, s);
  snap.decOrders = take();
  const db = run.dec?.beacon ?? "quiet";
  if (db === "quiet") { s.def += 1; s.fatigue += 31; }
  if (db === "rest") { s.fatigue = 0; s.notes.push("rested-dec"); }
  if (db === "show") { s.def += 1; s.fatigue += 31; s.ring = 32; s.rivalSaw = true; s.support -= n(MINISTER_PENALTY[c.minister], k); }
  s.fatigue += s.eng; s.eng = 0;
  // December's question buys knowledge only. Lattice goes back to Sarn's harbour net in
  // January unless January's orders point it elsewhere, so the February warning is
  // decided by the January question.
  const q = run.dec?.lattice ?? "boats";
  if (q === "boats") s.knows.count = c.craft.jan;
  if (q === "who") s.knows.role = c.deceive === "who" ? "screen" : c.fleetRole;
  if (q === "when") s.knows.date = c.deceive === "when"
    ? { day: c.plan === "land" ? Math.min(9, c.sailDay + 3) : c.sailDay, kind: "landing", planted: true }
    : { day: c.sailDay, kind: c.plan === "bluff" ? "exercise" : c.plan === "probe" ? "two-stage" : "landing" };
  if (c.plan === "bluff" && db === "show") s.support -= n(5, k); // Ravellan's press makes the most of it
  // A bluff is aimed at the ally: Ravellan's press works on the cabinet every month, so even
  // a campaign with no landing needs orders spent on keeping the ally.
  if (c.plan === "bluff") s.support -= n(BLUFF_PRESS, k);
  s.support += c.drift.dec;
  snap.decEnd = take();

  applyIncident(c, "jan", run.jan?.incident, s);
  snap.janOrders = take();
  const jb = run.jan?.beacon ?? "quiet", way = run.jan?.way ?? null;
  if (jb === "quiet") { s.def += 1; s.ring = Math.max(s.ring, 32); s.fatigue += 31; }
  if (jb === "hold") { s.fatigue = 0; s.notes.push("rested-jan"); }
  if (jb === "show") { s.def += 1; s.ring = 32; s.fatigue += 31; s.rivalSaw = true; }
  s.fatigue += s.eng; s.eng = 0;
  // January's question. Twelve posts can cover one radio net properly: Sarn's harbour net
  // carries the order that puts troops aboard (the two days' warning); the fleet command
  // net carries the sailing date; the fishing fleet has its own. Leaving Sarn costs the warning.
  const jq = run.jan?.lattice ?? "sarn";
  if (jq !== "sarn") s.warning = "stale";
  if (jq === "when") {
    const earlier = s.knows.date;
    s.knows.date = { day: c.sailDay, kind: c.plan === "bluff" ? "exercise" : c.plan === "probe" ? "two-stage" : "landing", confirmed: true, corrected: Boolean(earlier?.planted) };
    // With a true date, Okafor stands the battalion down until the last week.
    s.fatigue = Math.max(0, s.fatigue - DATE_REST);
    s.notes.push("rest-to-date");
  }
  if (jq === "who") s.knows.role = c.fleetRole;
  if (c.plan === "bluff") s.support -= n(BLUFF_PRESS, k);
  s.support += c.drift.jan;
  const hotlineYes = c.hotline && snap.janOrders.support >= 55;
  if (way === "buy") { s.boats -= 2; s.navy = true; s.approvedBy = "trade"; }
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

// Support points Ravellan's press takes from the ally's cabinet each month of a bluff.
export const BLUFF_PRESS = 3;

// Days of rest a true sailing date buys the battalion: it stands down until the last week.
export const DATE_REST = 20;

// Whether the January order needs an answer from Marenna before Send.
export const needsApproval = (c, s, beacon) => beacon === "show" && !(c.hotline && s.support >= 55);

// How tired 2nd Battalion is, in the words every screen uses. Past 100 days a unit starts
// losing people to sickness and mistakes; past 120 a third of it is unfit to fight.
export const FATIGUE = { tired: 100, unfit: 120 };
export const fatigueWord = (days) => (days === 0 ? "rested" : days > FATIGUE.unfit ? "unfit" : days > FATIGUE.tired ? "tired" : "fit");

// What February costs. A joint stand is a month of hard work for the battalion; a battle
// on the headland costs days and soldiers; digging the battalion in before the ships arrive
// costs days whether or not they land. Allied ships in a fight move the cabinet according to
// the defence minister; meeting an empty landing force with two navies looks like escalation.
export const JOINT_DAYS = 30, BATTLE_DAYS = 20, DIG_DAYS = 20;
const OVERREACTION = 20, DUG_IN_FOR_NOTHING = 10, LOST_STATION = 10;
const NAVY_IN_A_FIGHT = { dove: -12, firm: -6, hawk: 4 };
const CASUALTIES = { held: 60, repelled: 40, landed: 80, lost: 140 };

// The February result. Route is "quiet" (hold on Beacon, battalion in reserve), "forward"
// (the battalion digs in on the headland before the ships arrive) or "joint" (with
// Marenna's navy). Every fact the debrief states is computed here once, so the words can't
// contradict it, and `after` is the state every screen shows once February is over.
export function outcome(c, run) {
  const s = simulate(c, run).janEnd;
  const route = run.feb?.route ?? "quiet";
  const fit = s.fatigue <= FATIGUE.unfit;
  // Two separate things: Lattice listening to Sarn in January (hears troops ordered aboard),
  // and knowing the true sailing date. A date alone only helps if the patrol boats are still
  // ours to see the ships actually leave.
  const listening = s.warning === "fresh";
  const dated = Boolean(s.knows.date && !s.knows.date.planted);
  const warned = listening || (dated && s.boats >= 2);
  const reinforced = fit && warned;
  const def = s.def - (s.radarFails ? 1 : 0);
  // A landing force of 12 or more craft is a battalion and a second wave: Beacon alone
  // cannot hold it, so a worn-out or unwarned battalion loses the headland.
  const big = c.craft.jan >= 12;
  // An under-strength battalion (casualties carried from an earlier sector) can't hold a
  // second wave, wherever it stands.
  const strong = !c.understrength;
  const holds = big ? def >= 3 && reinforced && strong : def >= 3 || (def >= 2 && reinforced);
  // Dug in beforehand, the battalion needs no warning, but it holds one beach: a second
  // wave lands round it unless Beacon's own guns are strong. A worn-out battalion holds less.
  const holdsDug = fit ? (big ? def >= 3 && strong : def >= 1) : (big ? false : def >= 2);
  // Two navies stop a landing at sea only if they know when it sails, or if it is small enough
  // to turn back in one meeting. Otherwise it lands, and Beacon has to hold.
  const intercept = warned || !big;
  let code;
  if (s.plan === "land") code = route === "joint" ? (intercept ? "stopped" : "landed") : route === "forward" ? (holdsDug ? "repelled" : "lost") : holds ? "held" : "lost";
  else if (s.plan === "bluff") code = route === "joint" ? "called" : route === "forward" ? "dugin" : "outlasted";
  else code = route === "joint" ? "faced" : route === "forward" ? "dugin" : "waited";

  // The three things you are asked to protect, and the grade they add up to.
  const battle = ["held", "landed", "repelled", "lost"].includes(code);
  const navyFought = code === "stopped" || code === "landed";
  const daysAfter = s.fatigue + (route === "joint" ? JOINT_DAYS : 0) + (route === "forward" ? DIG_DAYS : 0) + (battle && code !== "lost" ? BATTLE_DAYS : 0);
  const supportAfter = s.support
    - (code === "called" ? OVERREACTION : 0) - (code === "dugin" ? DUG_IN_FOR_NOTHING : 0) - (code === "lost" ? LOST_STATION : 0)
    + (navyFought ? NAVY_IN_A_FIGHT[c.minister] : 0);
  const casualties = CASUALTIES[code] ?? 0;
  // What the rival lost: a landing force beaten on the beach is gone; one turned back at sea
  // goes home to try again.
  const rivalLost = battle && code !== "lost" ? c.craft.jan : 0;
  const kept = {
    beacon: code !== "lost",
    ally: ministersFor(supportAfter) >= 6,
    battalion: daysAfter <= FATIGUE.unfit,
  };
  const grade = !kept.beacon ? "failure" : kept.ally && kept.battalion ? "success" : "costly";
  const after = { ...structuredClone(s), fatigue: daysAfter, support: supportAfter, def: code === "lost" ? 0 : def, warning: s.warning };
  return { code, route, s, after, holdsDug, fit, listening, dated, warned, reinforced, def, big, intercept, battle, navyFought, daysAfter, supportAfter, casualties, rivalLost, kept, grade };
}
