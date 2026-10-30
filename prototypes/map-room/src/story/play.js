// How the campaign state moves with your choices. Pure and deterministic: the same campaign
// and the same choices always give the same state, which is what the copy and the map read.
// Prototype rules awaiting sign-off; packages/sim stays the authority for the real game.
import { incidentById } from "./incidents.js";

const n = (x, k) => Math.round(x * k);
const MINISTER_PENALTY = { dove: 20, firm: 12, hawk: 6 }; // a daylight move made without the cabinet
const ACT_PENALTY = { dove: 25, firm: 15, hawk: 8 }; // acting first and telling Marenna after

export const ministersFor = (support, total = 11) => Math.max(0, Math.min(total, Math.round((support / 100) * total)));

// Staff business for the month: the staff answer, applied without asking you.
function applyStaffEvent(c, month, s) {
  const e = c.staffEvent;
  if (!e || e.month !== month) return;
  const opt = incidentById(e.id).options.find((o) => o.staff);
  opt.effect(s, c, c.D.severity);
  s.staffDone = { ...(s.staffDone ?? {}), [month]: opt.id };
}

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

  applyStaffEvent(c, "dec", s);
  applyIncident(c, "dec", run.dec?.incident, s);
  snap.decOrders = take();
  const db = run.dec?.beacon ?? "quiet";
  if (db === "quiet") { s.def += 1; s.fatigue += 31; }
  if (db === "rest") { s.fatigue = 0; s.notes.push("rested-dec"); }
  if (db === "show") {
    s.def += 1; s.fatigue += 31; s.ring = 32; s.rivalSaw = true; s.support -= n(MINISTER_PENALTY[c.minister], k);
    // What Halden argues for: a move Ravellan can see makes it react, and the reaction is a
    // clue to its plan. One observation, so "likely", not confirmed.
    s.knows.reaction = { land: "faster", bluff: "cameras", probe: "probing" }[c.plan];
  }
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

  applyStaffEvent(c, "jan", s);
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
  if (plan === "probe") plan = effectiveDefence(s) < 3 ? "land" : "turned";
  s.plan = plan;
  snap.janEnd = take();
  return snap;
}

// Beacon's defence level as a landing meets it: one lower if the main radar failed, and one
// lower if Ravellan knows where our guns are (a press briefing or a visit before the cameras),
// because it lands where they are not.
export function effectiveDefence(s) {
  return s.def - (s.radarFails ? 1 : 0) - (s.rivalKnows ? 1 : 0);
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

// What decides a landing, one requirement at a time. The February choice shows these before
// you pick (for each size of landing still possible), and the debrief names the ones that
// failed, so the cause it gives is the cause the rules used.
//   defences: Beacon's defence level (1 garrison only … 4 fortified), one lower if the radar failed
//   warning:  two days' notice (Lattice on the quay, or a true date and patrol boats to see them go)
//   fit:      the battalion's fatigue at or under 120
//   strength: the battalion at 500 soldiers or more
export function landingCheck(c, s, route, big) {
  const fit = s.fatigue <= FATIGUE.unfit;
  const listening = s.warning === "fresh";
  const dated = Boolean(s.knows.date && !s.knows.date.planted);
  const warned = listening || (dated && s.boats >= 2);
  const def = effectiveDefence(s);
  const strong = !c.understrength;
  const req = (key, ok, need) => ({ key, ok, need });
  let needs;
  if (route === "joint") {
    // Two navies stop a landing at sea if they know when it sails, or if it is one wave. A
    // second wave that gets past them lands, and Beacon holds it only behind the battalion.
    needs = big ? [req("warning", warned, "warning, to meet both waves at sea")] : [];
  } else if (route === "forward") {
    needs = big ? [req("fit", fit, "a fit battalion"), req("defences", def >= 3, 3), req("strength", strong, "a battalion at full strength")]
      // Dug in, a fit battalion holds one wave on almost anything; a worn-out one needs defences 2.
      : [req("defences", def >= (fit ? 1 : 2), fit ? 1 : 2)];
  } else if (big) {
    needs = [req("defences", def >= 3, 3), req("warning", warned, "warning, so the battalion arrives in time"), req("fit", fit, "a fit battalion"), req("strength", strong, "a battalion at full strength")];
  } else if (def >= 3) {
    needs = [req("defences", true, 3)]; // full defences hold one wave alone
  } else {
    needs = [req("defences", def >= 2, 2), req("warning", warned, "warning, so the battalion arrives in time"), req("fit", fit, "a fit battalion")];
  }
  const holds = needs.every((r) => r.ok);
  return { holds, needs, failed: needs.filter((r) => !r.ok), def, warned, fit, strong, listening, dated, intercepted: route === "joint" && holds };
}

// The February result. Route is "quiet" (hold on Beacon, battalion in reserve), "forward"
// (the battalion digs in on the headland before the ships arrive) or "joint" (with
// Marenna's navy). Every fact the debrief states is computed here once, so the words can't
// contradict it, and `after` is the state every screen shows once February is over.
export function outcome(c, run) {
  const s = simulate(c, run).janEnd;
  const route = run.feb?.route ?? "quiet";
  const big = c.craft.jan >= 12;
  const check = landingCheck(c, s, route, big);
  const { fit, listening, dated, warned, def } = check;
  const reinforced = fit && warned;
  const holdsDug = route === "forward" && check.holds;
  const intercept = route === "joint" && check.holds;
  let code;
  if (s.plan === "land") code = route === "joint" ? (intercept ? "stopped" : "landed") : check.holds ? (route === "forward" ? "repelled" : "held") : "lost";
  else if (s.plan === "bluff") code = route === "joint" ? "called" : route === "forward" ? "dugin" : "outlasted";
  else code = route === "joint" ? "faced" : route === "forward" ? "dugin" : "waited";

  // Whether troops were ever ordered aboard. A probe that found Beacon too strong, and a
  // landing cancelled by a visible frigate, sail empty; so does a bluff.
  const boarded = s.plan === "land";
  const battle = ["held", "landed", "repelled", "lost"].includes(code);
  // Whether the battalion itself fought: it was dug in, it went ashore behind the navies, or
  // it reached the headland on the warning. Without warning it arrives after the fight.
  const engaged = battle && (route !== "quiet" || warned);
  const navyFought = code === "stopped" || code === "landed";
  const daysAfter = s.fatigue + (route === "joint" ? JOINT_DAYS : 0) + (route === "forward" ? DIG_DAYS : 0) + (engaged ? BATTLE_DAYS : 0);
  const supportAfter = s.support
    - (code === "called" ? OVERREACTION : 0) - (code === "dugin" ? DUG_IN_FOR_NOTHING : 0) - (code === "lost" ? LOST_STATION : 0)
    + (navyFought ? NAVY_IN_A_FIGHT[c.minister] : 0);
  // Killed or wounded, by who took them: the station's own garrison, and the battalion.
  const losses = {
    garrison: { held: 40, repelled: 10, landed: 20, lost: 140 }[code] ?? 0,
    battalion: engaged ? ({ held: 60, repelled: 40, landed: 60, lost: 120 }[code] ?? 0) : 0,
  };
  const casualties = losses.garrison + losses.battalion;
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
  // Why it went as it did: the requirements that failed (empty when the landing was held,
  // stopped or never came).
  const failed = s.plan === "land" ? check.failed : [];
  return { code, route, s, after, check, failed, boarded, engaged, losses, holdsDug, fit, listening, dated, warned, reinforced, def, big, intercept, battle, navyFought, daysAfter, supportAfter, casualties, rivalLost, kept, grade };
}
