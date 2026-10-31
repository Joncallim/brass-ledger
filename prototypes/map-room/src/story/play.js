// How the campaign state moves with your choices, and the record it leaves. Pure and
// deterministic: the same campaign and choices always give the same state and the same facts.
// Every transition records what it did, on the day it did it (CALENDAR in definition.js), so
// the logs, forecasts, chart and debrief all read one record instead of reconstructing it.
// Prototype rules awaiting sign-off; packages/sim stays the authority for the real game.
import { CALENDAR, FIXED, TUNING, effectDay, incidentDay, incidentRule } from "./definition.js";

const n = (x, k) => Math.round(x * k);
const { fatigue: FT, cabinet: CAB } = TUNING;

export const ministersFor = (support, total = FIXED.ministers) => Math.max(0, Math.min(total, Math.round((support / 100) * total)));

// Beacon's defence level as a landing meets it: one lower if the main radar has failed, and
// one lower if the rival knows where our guns are (it lands where they are not).
export function effectiveDefence(s) {
  // Exposure lasts while the rival's picture still describes our positions. Decided (Jon,
  // review 9): it clears only when the exposed guns actually move to new positions; night can
  // hide a move but doesn't erase what the rival knows. No order does that yet (its design and
  // cost are open, RULES-REVIEW.md), so it lasts the sector.
  return s.def - (s.radarFails ? FIXED.radarFailure : 0) - (s.rivalKnows ? FIXED.exposure : 0);
}

// The rules before review 7, kept only so scripts/rules-review.mjs can measure what the
// decisions changed (c.variant = PREVIOUS_RULES). The game never sets a variant.
//   visit: "open"  the staff answer to the minister's visit was cameras
//   naval: "auto"  a second wave that slipped past the navies was always held
export const PREVIOUS_RULES = Object.freeze({ visit: "open", naval: "auto" });

// Kept for the copy and tests: the same numbers, by their old names.
export const BLUFF_PRESS = CAB.bluffPress, DATE_REST = FT.dateRest;
export const FATIGUE = { tired: FT.tired, unfit: FT.unfit };
export const JOINT_DAYS = FT.joint, BATTLE_DAYS = FT.battle, DIG_DAYS = FT.dig;
export const fatigueWord = (f) => (f === 0 ? "rested" : f > FT.unfit ? "unfit" : f > FT.tired ? "tired" : "fit");

// Whether the January order needs an answer from the host before Send.
export const needsApproval = (c, s, beacon) => beacon === "show" && !(c.hotline && s.support >= CAB.hotlineNeeds);

const at = (month, day, hour) => ({ month, day, ...(hour != null ? { hour } : {}) });
const M = { dec: 0, jan: 1, feb: 2 };
export const dateKey = (d) => M[d.month] * 10000 + d.day * 100 + (d.hour ?? 12);

// The moment we learn they are moving, and from what. Every February decision is made here,
// before they arrive. A boarding order heard two days out can fall in January.
export function decisionAt(c, s) {
  if (s.warning === "fresh") {
    if (s.plan === "land") return { ...(c.sailDay > 2 ? at("feb", c.sailDay - 2, 22) : at("jan", 29 + c.sailDay, 22)), source: "lattice-boarding" };
    return { ...(c.sailDay > 1 ? at("feb", c.sailDay - 1, 22) : at("jan", 31, 22)), source: "lattice-no-boarding" };
  }
  if (s.knows.date && !s.knows.date.planted && s.boats >= 2) return { ...at("feb", c.sailDay, 5), source: "patrol-boats" };
  return { ...at("feb", c.sailDay, 7), source: "radar" };
}
// The last day January's log covers: the 31st, or the day before a January decision.
const janLogEnd = (d) => (d.month === "jan" ? d.day - 1 : 31);

// ── the months ──────────────────────────────────────────────────────────────
export function simulate(c, run = {}) {
  const k = c.D.severity;
  const s = {
    fatigue: c.fatigue0, ring: 30, def: FIXED.defence.start, support: c.support0, boats: 2, warning: "fresh",
    knows: {}, rivalSaw: false, rivalKnows: false, exposedIn: null, radarFails: false, radarWillFail: false, tension: 0, variant: c.variant ?? null,
    navy: null, voteFailed: false, actedAlone: false, approvedBy: null, incident: {}, notes: [], plan: c.plan, shift: null,
    // Fatigue the battalion's engineers owe this month (the radar repair), added after its orders.
    eng: 0,
  };
  const facts = [], intel = [];
  const tally = (support) => { const f = ministersFor(support); return { for: f, against: FIXED.ministers - f }; };
  const moved = (a, b) => (ministersFor(a) === ministersFor(b) ? null : { from: tally(a), to: tally(b) });
  const fact = (date, kind, data = {}) => { const f = { ...date, kind, ...data }; facts.push(f); return f; };
  const know = (date, source, claim, certainty, truth) => intel.push({ ...date, source, claim, certainty, truth });
  const snap = {};
  const take = () => structuredClone(s);
  snap.decStart = take();
  know(at("dec", CALENDAR.dec.count), "lattice-harbour", { kind: "count", value: c.craft.dec }, "confirmed", true);

  // Staff business and the incident, in the order of their dates, each with what it moved.
  const monthEvents = (month, choice) => {
    const list = [];
    if (c.staffEvent?.month === month) list.push({ id: c.staffEvent.id, staffBusiness: true });
    if (c.incidents[month]) list.push({ id: c.incidents[month] });
    // Applied on the day each takes effect, so the record's order is the rules' order.
    list.sort((a, b) => effectDay(a.id, month) - effectDay(b.id, month));
    for (const e of list) {
      const rule = incidentRule(e.id);
      const staffAnswer = c.variant?.visit === "open" && e.id === "visit" ? rule.options.find((o) => o.id === "open") : rule.options.find((o) => o.staff);
      const opt = e.staffBusiness ? staffAnswer : rule.options.find((o) => o.id === choice) ?? staffAnswer;
      const was = { support: s.support, rivalKnows: s.rivalKnows, fatigue: s.eng };
      opt.effect(s, c, k);
      const by = e.staffBusiness ? "staff" : opt.staff ? "staff-answer" : "you";
      if (e.staffBusiness) s.staffDone = { ...(s.staffDone ?? {}), [month]: opt.id };
      else s.incident[month] = opt.id;
      const exposed = s.rivalKnows && !was.rivalKnows;
      if (exposed) s.exposedIn = month;
      const day = incidentDay(e.id, month), effect = effectDay(e.id, month);
      if (effect === day) fact(at(month, day), e.staffBusiness ? "staff" : "incident", { id: e.id, option: opt.id, by, fatigue: s.eng - was.fatigue, cabinet: moved(was.support, s.support), exposed });
      else {
        // She asks on one day and visits on another: the answer is recorded when it is given,
        // and its effects on the day they happen.
        fact(at(month, day), "incident", { id: e.id, option: opt.id, by, deferred: true });
        fact(at(month, effect), "visit", { id: e.id, option: opt.id, cabinet: moved(was.support, s.support), exposed });
      }
      if (e.id === "collision" && opt.id === "search") know(at(month, day), "search", { kind: "role", value: c.fleetRole }, "confirmed", true);
      if (e.id === "defector" && opt.id === "talk") know(at(month, day + 7), "defector", { kind: "plan", value: s.knows.claim.plan }, "claimed", !s.knows.claim.planted);
    }
  };

  // ── December ──
  monthEvents("dec", run.dec?.incident);
  snap.decOrders = take();
  const db = run.dec?.beacon ?? "quiet";
  {
    const was = { def: s.def, fatigue: s.fatigue, support: s.support };
    if (db === "quiet") { s.def += 1; s.fatigue += FIXED.monthOnDuty; }
    if (db === "rest") { s.fatigue = 0; s.notes.push("rested-dec"); }
    if (db === "show") {
      s.def += 1; s.fatigue += FIXED.monthOnDuty; s.ring = 32; s.rivalSaw = true; s.support -= n(CAB.showPenalty[c.minister], k);
      // What Halden argues for: a move the rival can see makes it react, and the reaction is a
      // clue to its plan. One observation, so "likely", not confirmed.
      s.knows.reaction = { land: "faster", bluff: "cameras", probe: "probing" }[c.plan];
    }
    s.fatigue += s.eng; s.eng = 0;
    fact(at("dec", CALENDAR.dec[db]), "beacon", { option: db, by: db === "quiet" ? "staff" : "you", def: [was.def, s.def], fatigue: [was.fatigue, s.fatigue],
      rested: db === "rest" ? { from: at("dec", CALENDAR.dec.rest), to: at("dec", 31) } : null, cabinet: moved(was.support, s.support), exposedBefore: s.rivalKnows });
    if (db === "show") know(at("dec", CALENDAR.dec.reaction), "reaction", { kind: "reaction", value: s.knows.reaction }, "likely", true);
  }
  snap.decBeacon = take();
  // December's question buys knowledge only. Lattice goes back to the harbour net in January
  // unless January's orders point it elsewhere, so the February warning is decided in January.
  const q = run.dec?.lattice ?? "boats", L = CALENDAR.dec.lattice;
  if (q === "boats") { s.knows.count = c.craft.jan; know(at("dec", L), "lattice-harbour", { kind: "count", value: c.craft.jan }, "confirmed", true); }
  // In a war, refit money can keep a second post on the harbour: the count comes anyway.
  else if (c.knownCount) { s.knows.count = c.craft.jan; know(at("dec", L), "lattice-harbour", { kind: "count", value: c.craft.jan }, "confirmed", true); }
  if (q === "who") {
    s.knows.role = c.deceive === "who" ? "screen" : c.fleetRole;
    know(at("dec", L), "lattice-fishing", { kind: "role", value: s.knows.role }, "likely", c.deceive !== "who");
  }
  if (q === "when") {
    s.knows.date = c.deceive === "when"
      ? { day: c.plan === "land" ? Math.min(9, c.sailDay + 3) : c.sailDay, kind: "landing", planted: true }
      : { day: c.sailDay, kind: c.plan === "bluff" ? "exercise" : c.plan === "probe" ? "two-stage" : "landing" };
    know(at("dec", L), "lattice-fleet", { kind: "date", value: { day: s.knows.date.day, kind: s.knows.date.kind } }, "single", c.deceive !== "when");
  }
  fact(at("dec", CALENDAR.dec.rival), "rival", { behaviour: `${c.plan}-${db}` });
  {
    // Ministers who move on their own: the cabinet's drift, and the rival's press in a bluff.
    const was = s.support;
    if (c.plan === "bluff" && db === "show") s.support -= n(CAB.bluffShowPress, k);
    if (c.plan === "bluff") s.support -= n(CAB.bluffPress, k);
    s.support += c.drift.dec;
    const m = moved(was, s.support);
    if (m) fact(at("dec", CALENDAR.dec.drift, 9), "cabinet", m);
  }
  snap.decEnd = take();

  // ── January ──
  {
    // The drift and the press land before January's orders, so the count on the host's slip
    // is the count the vote will use unless you change it.
    const was = s.support;
    if (c.plan === "bluff") s.support -= n(CAB.bluffPress, k);
    s.support += c.drift.jan;
    const m = moved(was, s.support);
    if (m) fact(at("jan", CALENDAR.jan.drift, 8), "cabinet", m);
  }
  snap.janDrift = take();
  monthEvents("jan", run.jan?.incident);
  snap.janOrders = take();
  const jb = run.jan?.beacon ?? "quiet", way = run.jan?.way ?? null, jq = run.jan?.lattice ?? "sarn";
  const ordersSupport = s.support;
  // January's question. Twelve posts can cover one radio net properly: the harbour net
  // carries the order that puts troops aboard (the two days' warning); the fleet command net
  // carries the sailing date; the fishing fleet has its own. Leaving the harbour costs the warning.
  if (jq !== "sarn") s.warning = "stale";
  {
    const was = { def: s.def, fatigue: s.fatigue };
    if (jb === "quiet") { s.def += 1; s.ring = Math.max(s.ring, 32); s.fatigue += FIXED.monthOnDuty; }
    if (jb === "hold") { s.fatigue = 0; s.notes.push("rested-jan"); }
    if (jb === "show") { s.def += 1; s.ring = 32; s.fatigue += FIXED.monthOnDuty; s.rivalSaw = true; }
    s.fatigue += s.eng; s.eng = 0;
    let rotation = null;
    if (jq === "when") {
      const earlier = s.knows.date;
      s.knows.date = { day: c.sailDay, kind: c.plan === "bluff" ? "exercise" : c.plan === "probe" ? "two-stage" : "landing", confirmed: true, corrected: Boolean(earlier?.planted) };
      know(at("jan", CALENDAR.jan.date), "lattice-fleet", { kind: "date", value: { day: s.knows.date.day, kind: s.knows.date.kind } }, "confirmed", true);
      // With a true date, Okafor stands the battalion down a company at a time until the last
      // week: the month costs it less. Recorded on the day the rotation starts.
      const f1 = s.fatigue;
      s.fatigue = Math.max(0, s.fatigue - FT.dateRest);
      s.notes.push("rest-to-date");
      rotation = fact(at("jan", CALENDAR.jan.rotation), "rotation", { by: "staff", fatigue: f1 - s.fatigue, corrected: Boolean(earlier && earlier.day !== c.sailDay) });
    }
    // The battalion's month, net of any rotation, so the log adds up.
    fact(at("jan", CALENDAR.jan[jb]), "beacon", { option: jb, by: jb === "quiet" ? "staff" : "you", def: [was.def, s.def], fatigue: [was.fatigue, s.fatigue], rotated: Boolean(rotation?.fatigue),
      rested: jb === "hold" ? { from: at("jan", CALENDAR.jan.hold), to: null } : null, exposedBefore: s.rivalKnows, actedAlone: jb === "show" && way === "act" });
  }
  if (jq === "who") {
    s.knows.role = c.fleetRole;
    know(at("jan", CALENDAR.jan.fishing), "lattice-fishing", { kind: "role", value: c.fleetRole }, "confirmed", true);
  }
  {
    // The host: a trade, a hotline call, acting first, or the cabinet's vote.
    const hotlineYes = c.hotline && ordersSupport >= CAB.hotlineNeeds;
    const was = s.support;
    let how, day;
    if (way === "buy") { s.boats -= 2; s.navy = true; s.approvedBy = "trade"; how = "trade"; day = Math.min(c.voteDay, CALENDAR.jan.tradeBy); }
    else if (jb === "show" && way === "act") {
      s.support -= n(CAB.actPenalty[c.minister], k); s.actedAlone = true;
      s.navy = c.minister === "hawk" && s.support >= CAB.navyNeeds; how = "acted"; day = CALENDAR.jan.acted;
    } else if (jb === "show" && hotlineYes) { s.navy = s.support >= CAB.navyNeeds; s.approvedBy = "hotline"; how = "hotline"; day = CALENDAR.jan.hotline; }
    else { s.navy = s.support >= CAB.navyNeeds; s.voteFailed = !s.navy; s.approvedBy = s.navy ? "vote" : null; how = "vote"; day = c.voteDay; }
    fact(at("jan", day), "coalition", { how, navy: s.navy, ...tally(s.support), cabinet: moved(was, s.support) });
  }

  // What the rival actually does in February, given what it has seen.
  let plan = c.plan;
  if (c.D.planShift && plan === "bluff" && s.support < CAB.bluffTurnsBelow) { plan = "land"; s.shift = "bluff-to-land"; }
  if (plan === "land" && jb === "show" && s.def >= FIXED.defence.holdsAlone) { plan = "deterred"; s.shift = s.shift ?? "deterred"; }
  // A failing radar left running fails late in January, before anyone sails.
  if (s.radarWillFail) s.radarFails = true;
  if (plan === "probe") plan = effectiveDefence(s) < FIXED.defence.holdsAlone ? "land" : "turned";
  s.plan = plan;

  const d = decisionAt(c, s), end = janLogEnd(d);
  for (const f of facts) if (f.kind === "beacon" && f.month === "jan" && f.rested) f.rested.to = at("jan", end);
  if (s.radarFails) fact(at("jan", Math.min(CALENDAR.jan.radarFails, end)), "radar-failed", {});
  fact(at("jan", Math.min(CALENDAR.jan.rival, end)), "rival", { behaviour: "loading" });
  if (jq === "sarn") know(at("jan", end), "lattice-harbour", { kind: "boarding", value: false, asOf: at("jan", end) }, "confirmed", true);
  if (d.source === "lattice-boarding") know(d, "lattice-harbour", { kind: "boarding", value: true }, "confirmed", true);
  if (d.source === "lattice-no-boarding") know(d, "lattice-harbour", { kind: "boarding", value: false }, "confirmed", true);
  if (d.source === "patrol-boats") know(d, "patrol-boats", { kind: "sailing", value: true }, "confirmed", true);
  if (d.source === "radar") know(d, "radar", { kind: "sailing", value: true }, "confirmed", true);
  fact(d, "decision", { source: d.source });
  snap.janEnd = take();

  facts.sort((a, b) => dateKey(a) - dateKey(b));
  intel.sort((a, b) => dateKey(a) - dateKey(b));
  snap.facts = facts;
  snap.intel = intel;
  snap.decision = d;
  snap.logEnd = { dec: at("dec", 31), jan: at("jan", end) };
  return snap;
}

// ── February ────────────────────────────────────────────────────────────────
// What decides a landing, one requirement at a time. The February choice shows these before
// you pick (for each case still possible), and the debrief names the ones that failed, so the
// cause it gives is the cause the rules used.
//   defences: the defence level a landing meets (effectiveDefence)
//   warning:  two days' notice (Lattice on the quay, or a true date and patrol boats to see them go)
//   fit:      the battalion's fatigue at or under the unfit line
//   strength: the battalion at full strength
export function landingCheck(c, s, route, big) {
  const D = FIXED.defence;
  const fit = s.fatigue <= FT.unfit;
  const listening = s.warning === "fresh";
  const dated = Boolean(s.knows.date && !s.knows.date.planted);
  const warned = listening || (dated && s.boats >= 2);
  const def = effectiveDefence(s);
  const strong = !c.understrength;
  const req = (key, ok, need) => ({ key, ok, need });
  let needs;
  if (route === "joint") {
    // Two navies stop a landing at sea if they know when it sails, or if it is one wave.
    needs = big ? [req("warning", warned, "warning, to meet both waves at sea")] : [];
    if (big && !warned) {
      // A second wave that gets past them lands, and meets the normal ground defence for one
      // wave: level 3 holds it alone; level 2 holds it with the battalion, which is already in
      // place behind the navies, if the battalion is fit (review 7).
      const second = def >= D.holdsAlone ? [req("defences", true, D.holdsAlone)]
        : [req("defences", def >= D.holdsWithReserve, D.holdsWithReserve), req("fit", fit, "a fit battalion")];
      const secondHolds = s.variant?.naval === "auto" || second.every((r) => r.ok);
      return { holds: false, needs: [...needs, ...second], failed: [needs[0], ...(secondHolds ? [] : second.filter((r) => !r.ok))], def, warned, fit, strong, listening, dated, intercepted: false, second, secondHolds };
    }
  } else if (route === "forward") {
    needs = big ? [req("fit", fit, "a fit battalion"), req("defences", def >= D.holdsAlone, D.holdsAlone), req("strength", strong, "a battalion at full strength")]
      // Dug in, a fit battalion holds one wave on almost anything; a worn-out one needs level 2.
      : [req("defences", def >= (fit ? D.dugInFit : D.dugInUnfit), fit ? D.dugInFit : D.dugInUnfit)];
  } else if (big) {
    needs = [req("defences", def >= D.holdsAlone, D.holdsAlone), req("warning", warned, "warning, so the battalion arrives in time"), req("fit", fit, "a fit battalion"), req("strength", strong, "a battalion at full strength")];
  } else if (def >= D.holdsAlone) {
    needs = [req("defences", true, D.holdsAlone)]; // full defences hold one wave alone
  } else {
    needs = [req("defences", def >= D.holdsWithReserve, D.holdsWithReserve), req("warning", warned, "warning, so the battalion arrives in time"), req("fit", fit, "a fit battalion")];
  }
  const holds = needs.every((r) => r.ok);
  return { holds, needs, failed: needs.filter((r) => !r.ok), def, warned, fit, strong, listening, dated, intercepted: route === "joint" && holds };
}

// One February result, for one case: whether troops are aboard, whether there are two waves,
// and (if no troops) whether it was a show for the cameras. outcome() resolves the true case;
// forecast() resolves every case the evidence leaves open, with the same function, so a
// forecast can never disagree with the result.
export function resolve(c, s, route, hyp) {
  const check = landingCheck(c, s, route, hyp.big);
  const { warned } = check;
  let code;
  if (hyp.troops) code = route === "joint" ? (check.holds ? "stopped" : check.secondHolds === false ? "lost" : "landed") : check.holds ? (route === "forward" ? "repelled" : "held") : "lost";
  else if (hyp.show) code = route === "joint" ? "called" : route === "forward" ? "dugin" : "outlasted";
  else code = route === "joint" ? "faced" : route === "forward" ? "dugin" : "waited";
  const battle = ["held", "landed", "repelled", "lost"].includes(code);
  // Whether the battalion itself fought: it was dug in, it went ashore behind the navies, or it
  // reached the headland on the warning. Without warning it arrives after the fight.
  const engaged = battle && (route !== "quiet" || warned);
  // The navies fought whenever they met a landing force with troops aboard.
  const navyFought = route === "joint" && hyp.troops;
  const daysAfter = s.fatigue + (route === "joint" ? FT.joint : 0) + (route === "forward" ? FT.dig : 0) + (engaged ? FT.battle : 0);
  const supportAfter = s.support
    - (code === "called" ? CAB.overreaction : 0) - (code === "dugin" ? CAB.dugInForNothing : 0) - (code === "lost" ? CAB.lostStation : 0)
    + (navyFought ? CAB.navyInAFight[c.minister] : 0);
  const losses = {
    garrison: TUNING.losses.garrison[code] ?? 0,
    battalion: engaged ? (TUNING.losses.battalion[code] ?? 0) : 0,
  };
  // What decided it, who took part, and when the battalion got there: facts the forecast, the
  // report, the chart's labels and the animation all read, so none of them guesses a cause.
  //   sea        the navies turned the landing back
  //   defences   the station's guns held a single wave alone (level 3 against a landing)
  //   battalion  the battalion, with the defences, held it on the beach
  //   trenches   the battalion, dug in before they came, held it
  //   <key>      the station fell for want of this requirement
  let decider = null;
  if (hyp.troops) {
    if (code === "stopped") decider = "sea";
    else if (code === "lost") decider = (route === "joint" ? check.failed.find((x) => x.key !== "warning") : check.failed[0])?.key ?? "defences";
    else if (code === "repelled") decider = "trenches";
    else decider = (!hyp.big || route === "joint") && check.def >= FIXED.defence.holdsAlone ? "defences" : "battalion";
  }
  // The battalion moves before the landing if it digs in, goes in behind the navies, or has
  // warning; otherwise it arrives after the fight, if there is one.
  const deploy = route !== "quiet" || warned ? "before" : battle ? "late" : "none";
  const participants = { garrison: battle, battalion: engaged, navies: route === "joint" && hyp.troops };
  const kept = {
    beacon: code !== "lost",
    ally: ministersFor(supportAfter) >= FIXED.majority,
    battalion: daysAfter <= FT.unfit,
  };
  const grade = !kept.beacon ? "failure" : kept.ally && kept.battalion ? "success" : "costly";
  return { code, check, battle, engaged, navyFought, daysAfter, supportAfter, losses, kept, grade, failed: hyp.troops ? check.failed : [], decider, deploy, participants };
}

// The true case.
export const truthOf = (c, s) => ({ troops: s.plan === "land", big: c.craft.jan >= FIXED.secondWave, show: s.plan === "bluff" });

// The February result. Route is "quiet" (hold on Beacon, battalion in reserve), "forward"
// (the battalion digs in on the headland before the ships arrive) or "joint" (with the host's
// navy). Every fact the debrief states is computed here once, and `after` is the state every
// screen shows once February is over.
export function outcome(c, run) {
  const sim = simulate(c, run), s = sim.janEnd;
  const route = run.feb?.route ?? "quiet";
  const hyp = truthOf(c, s), r = resolve(c, s, route, hyp);
  const { check } = r;
  const casualties = r.losses.garrison + r.losses.battalion;
  // What the rival lost: a landing force beaten on the beach is gone; one turned back at sea
  // goes home to try again.
  const rivalLost = r.battle && r.code !== "lost" ? c.craft.jan : 0;
  const after = { ...structuredClone(s), fatigue: r.daysAfter, support: r.supportAfter, def: r.code === "lost" ? 0 : s.def, warning: s.warning };
  // February's facts, dated: the ships sail at dawn (seen at 05:00 by the patrol boats or the
  // radar, which is when they leave); our orders go out within the hour of the decision, so a
  // move ordered on a boarding report two days out happens two days before the sailing.
  const sail = c.sailDay, d = sim.decision;
  const sailedAt = at("feb", sail, d.source === "radar" || d.source === "patrol-boats" ? 5 : 6);
  const movedAt = { month: d.month, day: d.day, hour: d.hour + 1 };
  const feb = [
    { ...sailedAt, kind: "sailed", boarded: hyp.troops },
    { ...movedAt, kind: "moved", route },
    { ...at("feb", sail + 1, 6), kind: "contact", code: r.code, route, failed: r.failed.map((x) => x.key), engaged: r.engaged, losses: r.losses },
  ].sort((a, b) => dateKey(a) - dateKey(b));
  return {
    ...r, route, s, after, boarded: hyp.troops, big: hyp.big, def: check.def, fit: check.fit, listening: check.listening, dated: check.dated, warned: check.warned,
    intercept: route === "joint" && check.holds, holdsDug: route === "forward" && check.holds, reinforced: check.fit && check.warned,
    casualties, rivalLost, feb, decision: sim.decision,
  };
}

// Every case the evidence at the decision leaves open, each resolved for each route. What we
// know at that moment: whether troops boarded (only if Lattice was on the quay), and how many
// craft (if we counted them). A show for the cameras and a force that turned back both sail
// empty; they differ only in what the host's cabinet makes of our answer, so both are listed.
export function forecast(c, run) {
  const sim = simulate(c, run), s = sim.janEnd, d = sim.decision;
  const boarding = d.source === "lattice-boarding" ? true : d.source === "lattice-no-boarding" ? false : null;
  const count = s.knows.count ?? null;
  const waves = count != null ? [count >= FIXED.secondWave] : [false, true];
  const cases = [];
  if (boarding !== false) for (const big of waves) cases.push({ id: big ? "two" : "one", troops: true, big, show: false });
  if (boarding !== true) for (const show of [true, false]) cases.push({ id: show ? "empty-show" : "empty-turned", troops: false, big: count != null && count >= FIXED.secondWave, show });
  const routes = ["quiet", "forward", ...(s.navy ? ["joint"] : [])];
  return {
    s, decision: d, boarding, count, cases,
    routes: routes.map((route) => ({ route, cases: cases.map((h) => ({ ...h, r: resolve(c, s, route, h) })) })),
  };
}
