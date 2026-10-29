// Every word the story says, worked out from the campaign (what Ravellan is really doing,
// Marenna's politics, the incidents) and the state your choices produce. Copy rules: rank
// before every name; months, not turns; say who acts; every fact carries its so-what;
// officers report what they have seen, never what the other side feels.
import { WORLD as W, onWorld } from "./world.js";
import { OFFICERS, fullName, surname } from "./officers.js";
import { incidentById } from "./incidents.js";
import { FATIGUE, fatigueWord, ministersFor, needsApproval, outcome, simulate } from "./play.js";

let B, ST, R, M, MA, S, L, BN;
const ord = (x) => `${x}${x % 100 >= 11 && x % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][x % 10] ?? "th"}`;
const lift = (craft) => (craft >= 9 ? "enough to put one battalion, about 600 soldiers, ashore at once" : "nearly enough to put one battalion, about 600 soldiers, ashore at once");
export const CALENDAR = ["September", "October", "November", "December", "January", "February"];
export const monthOf = (turn) => CALENDAR[turn - 1];
const PLAN_ORDER = ["quiet", "rest", "show", "hold"];

// ── what we know, in words ──────────────────────────────────────────────────
let WARN;
// Once the ships have sailed there is nothing left to warn of: say what we know about them.
const atSea = (s, troops) => s.warning === "fresh"
  ? (troops
    ? ["At sea: a landing force", `${L} heard ${R} order troops aboard two days before the ships sailed. ${BN} has had that time to move.`]
    : ["At sea: no troops seen boarding", `${L} heard no order to put troops aboard before the ships sailed. The landing craft are probably empty.`])
  : ["At sea: troops aboard unknown", `We saw the ships leave ${S}, but ${L} was not listening for the order that puts troops aboard. Until ${R} acts, we cannot tell a landing from a show of force.`];

// Readiness at a glance, for the bar along the top. Each value belongs to one officer.
export function status(c, s) {
  const days = s.fatigue, sup = ministersFor(s.support);
  return [
    { term: "battalion", label: BN, value: days === 0 ? "rested" : `${days} days · ${fatigueWord(days)}`, tone: days > FATIGUE.unfit ? "bad" : days > FATIGUE.tired ? "warn" : "ok", who: "okafor" },
    { term: "marenna", label: `${MA} cabinet`, value: `${sup} of ${W.ministers} with us`, tone: sup < 6 ? "bad" : sup < 7 ? "warn" : "ok", who: "sato" },
    { term: "beacon", label: B, value: `${["garrison only", "reinforced", "fully reinforced", "fortified"][Math.min(3, s.def - 1)]}`, tone: s.def >= 3 ? "ok" : s.def === 2 ? "warn" : "bad", who: "briggs" },
    { term: "warning", label: "Warning", value: s.warning === "fresh" ? "about two days" : "less reliable", tone: s.warning === "fresh" ? "ok" : "warn", who: "halden" },
  ];
}

// ── the title ───────────────────────────────────────────────────────────────
export let TITLE;
// What a new player needs before the first briefing: the goal, the monthly loop, and what
// was decided before they took over.
export let ORIENT;

// ── briefings ───────────────────────────────────────────────────────────────
const readings = (c) => `${R} may mean to land a battalion and take ${B}, or only to frighten ${M} into asking us to leave${c.D.plans.includes("probe") ? `, or to test ${B} first and land only if it looks weak` : ""}.`;

export function brief(c, run, month) {
  const sim = simulate(c, run);
  if (month === "dec") {
    const s = sim.decStart;
    return {
      title: "Intelligence summary", from: `${fullName("halden")}, Intelligence`,
      sections: [
        ["What changed", `${R} has started loading landing craft in ${S}, its main naval harbour, ${W.harbourNm} nautical miles across the strait from ${B}. ${L} counted ${c.craft.dec} on 1 December, ${lift(c.craft.dec)}.`],
        ["How sure we are", `Sure of the count: ${L} heard the loading orders. Not sure what the craft are for. ${readings(c)} Troops boarding on the quay in ${S} would settle it.`],
        ["What it means for your orders", `If this is a landing, ${B} needs more guns before February and ${BN} must be fit to reinforce it. If it is a threat, the danger is losing ${M}, so how visibly we move matters as much as what we move.`],
      ],
      warning: WARN[s.warning],
      halden: `General. ${c.craft.dec} landing craft are loading in ${S}. Whether they are meant for ${B} or for the cameras, I will tell you when I see troops on the quay. Not before.`,
    };
  }
  const s = sim.decEnd, q = run.dec?.lattice ?? "boats";
  const k = s.knows;
  const changed = {
    boats: () => `${k.count} landing craft in ${S}, up from ${c.craft.dec}. ${c.plan === "bluff" ? `${R} has nearly stopped adding to them.` : k.count >= 12 ? `That is more than one battalion needs: a battalion and a second wave behind it.` : `${R} is adding about one every few days.`}`,
    who: () => k.role === "screen"
      ? `${R}’s fishing boats are sailing together with the landing craft, keeping military hours, under navy orders: 23 boats in all.`
      : k.role === "swarm"
        ? `${R}’s fishing boats take navy orders, but they crowd the shipping lane in daylight, where cameras can see them, and stay away from the landing craft.`
        : `${R}’s fishing boats take navy orders. Since mid-December they have been running along our coast at night, close enough to count ${B}’s guns.`,
    when: () => k.date.kind === "exercise"
      ? `${R} has announced a naval exercise in the strait from ${k.date.day} February, and invited foreign reporters.`
      : k.date.kind === "two-stage"
        ? `${R}’s ships are ordered to sea on ${k.date.day} February; the landing craft are held “ready to follow on command”.`
        : `${R}’s ships are ordered to be ready at sea by ${k.date.day} February.`,
  }[q]();
  const sure = {
    boats: () => `Sure of the numbers: ${L} counted them, and is still listening to ${S}.`,
    who: () => `Fairly sure: ${L} traced the boats’ orders over the radio. A trail laid for us to find would look the same.`,
    when: () => `Fairly sure: one navy signal, not yet confirmed by a second source.`,
  }[q]() + (k.claim ? ` A defector says ${k.claim.plan === "land" ? "a landing is planned" : k.claim.plan === "bluff" ? "there is no landing, only a threat" : "they will test us first"}; that is one man’s word.` : "");
  const means = {
    boats: () => c.plan === "bluff"
      ? `A force that has stopped growing is either complete or for show. Plan to defend ${B}, but don’t give ${R}’s cameras a reason to call us the aggressor.`
      : k.count >= 12 ? `${B}’s garrison could not hold a second wave alone. It would need ${BN}, fit and in time, or ${M}’s navy beside ours at sea.` : `Enough for a landing on the ${B} headland. ${B} should be at full strength by February.`,
    who: () => k.role === "screen" ? `That points to an amphibious landing, screened by the fishing fleet. ${B} is the obvious target, not the only one.`
      : k.role === "swarm" ? `That points to a show of force meant to frighten ${M}. It does not rule out a landing behind it.` : `That points to scouting before a decision. If ${B} looks weak, expect a landing.`,
    when: () => k.date.kind === "exercise" ? `An exercise with reporters leans toward a show of force, but exercises also hide real attacks. Plan for both from ${k.date.day} February.`
      : k.date.kind === "two-stage" ? `${R} wants to look before it lands. ${B} must look strong on ${k.date.day} February.` : `A landing could come as early as the ${ord(k.date.day + 1)}. Plan for it.`,
  }[q]();
  return {
    title: "Intelligence summary", from: `${fullName("halden")}, Intelligence`,
    sections: [["What changed", changed], ["How sure we are", sure], ["What it means for your orders", means]],
    warning: WARN[s.warning],
    halden: `General. ${changed.split(". ")[0].replace(/\.$/, "")}. That is what has changed since December.`,
  };
}

// ── where each officer stands, and why ─────────────────────────────────────
// For each decision, an officer's recommendation follows from their priority and the state.
// `because` is what they are protecting; `risk` is what happens if you overrule them.
const pos = (prefers, line, because, risk) => ({ prefers, line, because, risk });

function decemberCouncil(c, s) {
  const tired = s.fatigue >= 90, solid = s.support >= 66 && c.minister !== "dove", murky = c.D.plans.length > 2 || c.craft.dec < 9;
  return {
    briggs: pos("quiet", `Two rifle companies and the air-defence battery on the headland by 20 December, moved at night. That holds ${B} for three weeks against a battalion landed from the sea. It costs ${BN} its Christmas. I can live with that.`,
      `${B} able to stop a landing`, `${B} faces a battalion with ${W.garrison} soldiers.`),
    okafor: tired
      ? pos("rest", `${BN} has been on duty ${s.fatigue} days. Past 100, I lose a third of them to sickness and mistakes. Stand them down from 18 to 31 December and they are fit for January. ${B}’s own garrison covers the gap.`,
        `${BN} still able to fight in February`, `${BN} passes 120 days by the end of January, and a third of it is unfit when ${R} comes.`)
      : pos("quiet", `${BN} is on ${s.fatigue} days. It can take one more month before it needs rest. Move them now, rest them in January.`,
        `${BN} being used while it is still fresh`, "we spend the battalion’s good month doing nothing."),
    sato: solid
      ? pos("show", `I count ${ministersFor(s.support)} of ${W.ministers} ministers with us, and the defence minister is ${c.minister === "hawk" ? "pushing us to do more" : "content"}. A frigate in daylight will cost us a day of phone calls, not a vote.`,
        `${M} seeing us defend its coast`, `${M}’s ministers wonder whether we would fight for them at all.`)
      : pos("quiet", `I count ${ministersFor(s.support)} of ${W.ministers} ministers with us. If ${R} photographs us moving troops in daylight, ${R}’s government will show those photographs to the ${MA} ministers before we have told them anything. Keep it quiet until the vote on ${c.voteDay} January.`,
        `the ${MA} cabinet’s vote on ${c.voteDay} January`, `the vote that decides whether ${M}’s navy sails with ours.`),
    halden: murky
      ? pos("show", `A move ${R} can see is a test I can read. ${R} will see it within 24 hours, and the loading in ${S} will either stop or speed up. Either answer is worth more than what I have today.`,
        `knowing what ${R} really means to do`, `we go into January still unable to tell a landing from a threat.`)
      : pos("quiet", `I have the count. What I need now is the date, and a quiet month gives me the best chance of hearing it. Do not give ${R} a reason to change its plans.`,
        `a steady month to read ${R}’s plans`, `${R} changes its plans just as we begin to understand them.`),
  };
}

function januaryCouncil(c, s) {
  const k = s.knows, claim = k.claim?.plan;
  const read = claim ?? (k.role === "screen" || k.date?.kind === "landing" ? "land" : k.role === "swarm" || k.date?.kind === "exercise" ? "bluff" : k.role === "scout" || k.date?.kind === "two-stage" ? "probe" : null);
  return {
    briggs: read === "land" || read === "probe"
      ? pos("show", `If ${R} is coming in early February, I want it to see a frigate and two companies off ${B} on the 16th. A landing that can see what it faces is a landing that may not happen.`,
        `${B} looking too strong to attack`, `${R} plans its landing against a ${B} it believes is thin.`)
      : pos("quiet", `Full air defence on ${B} by 20 January, moved at night. That covers us to the first week of February, and ${R} never sees us do it.`,
        `${B} at full strength without a show`, `${B} goes into February with the guns it has now.`),
    okafor: s.fatigue > 110
      ? pos("hold", `${BN} passes ${s.fatigue + 10} days on the 10th. Rest them from 10 January, or I cannot promise you a fit battalion in February. ${B} already has its guns.`,
        `${BN} fit to fight in February`, `a third of ${BN} is sick or unfit when ${R} sails.`)
      : pos("quiet", `${BN} rested over Christmas and has days to spare. Use them now while they are fresh.`,
        "using a rested battalion while it is fresh", "we hold back troops who can afford the work."),
    sato: s.support >= 60 && (c.hotline || c.minister === "hawk")
      ? pos("show", c.hotline ? `We have a hotline to the ${MA} ministers. I can have their yes within hours, and with ${ministersFor(s.support)} of ${W.ministers} behind us, it will be yes.` : `The defence minister wants us to be seen. With ${ministersFor(s.support)} of ${W.ministers} ministers behind us, a daylight move helps the vote.`,
        `${M} seeing us stand with it`, `${M}’s ministers start to doubt we would fight for them.`)
      : pos("quiet", `The ${MA} cabinet votes on ${c.voteDay} January, and I count ${ministersFor(s.support)} of ${W.ministers} with us. If we do anything in daylight before then, the ${MA} ministers will hear about it from ${R} first, and some of them will vote against us.`,
        `the ${MA} vote on ${c.voteDay} January`, `${M}’s navy stays in port in February.`),
    halden: read === "bluff"
      ? pos("hold", `Everything I have says ${R} is putting on a show for the cameras. If we answer it with troops, we give them the pictures they want. Rest the battalion and let them sail at nothing.`,
        `not playing the part ${R} has written for us`, `we hand ${R}’s press the escalation it is hoping for.`)
      : read === "land"
        ? pos("quiet", `${R} is coming. Dig in quietly. Every gun ${R} cannot see is a gun it has not planned for.`,
          `${B} stronger than ${R} thinks`, `${R} adjusts its landing to what it sees us add.`)
        : pos("show", `I still cannot tell you whether this is a landing or a threat. A frigate off ${B} on the 16th will make ${R} show me which, two weeks before it sails.`,
          `forcing ${R} to show its hand`, `we meet February without knowing what is coming.`),
  };
}

// The two strongest opposing views on a decision, for the "hard call" panel.
export function split(council, staffId) {
  const groups = {};
  for (const [who, p] of Object.entries(council)) (groups[p.prefers] ??= []).push(who);
  const sides = Object.entries(groups).sort((a, b) => b[1].length - a[1].length || (a[0] === staffId ? -1 : b[0] === staffId ? 1 : 0));
  if (sides.length < 2) return { agree: true, side: sides[0], rest: [] };
  return { agree: false, a: sides[0], b: sides[1], rest: sides.slice(2) };
}

// ── the month's orders ──────────────────────────────────────────────────────
export function orders(c, run, month) {
  const sim = simulate(c, run);
  if (month === "dec") {
    const s = sim.decOrders;
    return {
      head: ST, lead: "briggs", staffId: "quiet",
      plan: `will move two rifle companies and the air-defence battery onto the ${B} headland by night, in place by 20 December.`,
      does: `${B} could hold for about three weeks against a battalion landed from the sea. That is long enough for reinforcements to arrive.`,
      cost: `${BN} works through Christmas, its ${ord(s.fatigue + 24)} day on duty without rest. ${R} will see that ${B} is now defended, though not how strongly.`,
      question: `What should ${B} do in December?`,
      options: [
        { id: "quiet", name: `Strengthen ${B} quietly`, short: `strengthen ${B} quietly`, says: `Two rifle companies and the air-defence battery, moved by night, in place by 20 December. ${BN} stays on duty.`, staff: true },
        { id: "rest", name: `Rest ${BN}`, short: `rest ${BN}`, says: `Stand ${BN} down from 18 to 31 December, so it is fit for January. ${B} keeps only its own garrison of ${W.garrison} soldiers, and its radar range drops from 30 to 20 nautical miles while the extra radar crews rest.` },
        { id: "show", name: "Show force openly", short: "show force openly", says: `A frigate and two rifle companies exercise off ${B} in daylight from 19 December. ${R} will see it within a day. ${M}’s government has not approved it, and I count ${ministersFor(s.support)} of ${W.ministers} ministers with us.` },
      ],
      council: decemberCouncil(c, s),
      reply: {
        quiet: ["briggs", "Understood. Companies move on the night of the 18th. In place by the 20th."],
        rest: ["briggs", `Then ${B} runs on ${W.garrison} soldiers and 20 miles of radar until the 31st. If ${R} sails in that window, I need two days to get ${BN} back. That’s the trade, General.`],
        show: ["briggs", `We can sail the frigate on the 19th. ${surname("sato")} will need to tell ${M}’s government before they read about it in the press.`],
      },
      ring: { rest: 190, show: 270 },
    };
  }
  const s = sim.janOrders;
  return {
    head: ST, lead: "briggs", staffId: "quiet",
    plan: `will bring ${B}’s air-defence battery to full strength, by night, by 20 January.`,
    does: `${B} could hold until reinforcements arrive in the first week of February.`,
    cost: s.fatigue === 0 || s.fatigue <= 31 ? `${BN} goes back on duty after its Christmas rest.` : `${BN} passes ${s.fatigue + 20} days on duty. ${surname("okafor")} expects a third of it to be sick or unfit by February.`,
    question: `What should ${B} do in January?`,
    options: [
      { id: "quiet", name: `Reinforce ${B} quietly`, short: `reinforce ${B} quietly`, says: `Air-defence battery to full strength, moved by night, by 20 January. ${BN} stays on duty.`, staff: true },
      { id: "show", name: `Reinforce ${B} openly`, short: `reinforce ${B} openly`, says: `A frigate and two rifle companies off ${B} in daylight from 16 January. ${R} will see that we mean to defend ${B}. ${needsApproval(c, s, "show") ? `${M}’s government must approve it first, and its answer is slow.` : `${surname("sato")} can get ${M}’s answer the same day on the hotline.`}` },
      { id: "hold", name: "Hold as we are", short: "hold as we are", says: `No new troops. ${BN} rests from 10 January, so it is fit for February. ${B}’s radar stays at its current range.` },
    ],
    council: januaryCouncil(c, s),
    reply: {
      quiet: ["briggs", `Good. Battery at full strength by the 20th. ${R} won’t see it happen.`],
      show: ["briggs", `Frigate sails on the 16th. ${needsApproval(c, s, "show") ? `That’s the day after the ${MA} cabinet votes, General. Talk to ${surname("sato")}.` : `${surname("sato")} is on the hotline now.`}`],
      hold: ["briggs", `We hold. If ${R} comes in early February, ${B} fights with what it has.`],
    },
  };
}

// The Lattice question for December. Each choice says what it gives and what it costs.
let AWAY;
export let LATTICE;
export const latticeQ = (id) => LATTICE.questions.find((x) => x.id === id);

// What the patrol boats do for us, so trading them is a real cost.
let BOATS;

// Marenna in January: wait for the vote, or act, depending on what the beacon order needs.
export function host(c, run) {
  const s = simulate(c, run).janOrders, jb = run.jan?.beacon ?? "quiet";
  const count = ministersFor(s.support), shaky = s.support < 50;
  const answerDay = c.voteDay + 7;
  return {
    head: M,
    staff: ["sato", `will wait for the ${MA} cabinet’s vote on ${c.voteDay} January before we do anything in daylight.`],
    why: `${B} stands on ${MA} land. We promised ${M}’s government we would ask before any move ${R} could see. ${c.hotline ? `We have a hotline to its ministers, so an answer can come within hours.` : `Without a hotline to its ministers, ${M}’s answer to a new request reaches us on ${answerDay} January.`}`,
    vote: `I count ${count} of ${W.ministers} ministers with us. ${shaky ? `On those numbers the vote on ${c.voteDay} January fails, and ${M}’s navy stays in port in February.` : `On those numbers the vote passes, and ${M}’s navy will sail with ours if ${R} comes.`}`,
    shaky, clash: needsApproval(c, s, jb),
    clashText: c.hotline
      ? `A daylight reinforcement on the 16th needs ${M}’s approval. ${surname("sato")} can ask on the hotline today, but with ${count} of ${W.ministers} ministers with us, the answer would be no.`
      : `A daylight reinforcement on the 16th needs ${M}’s approval, but ${M}’s answer only reaches us on ${answerDay} January. We never set up a hotline to its ministers.`,
    ways: [
      { id: "act", name: `Act on the 16th, tell ${M} after`, says: `Fast. ${c.minister === "hawk" ? `The defence minister will grumble, but she wants us to be seen. ${M}’s navy may still sail with us if the cabinet holds.` : `But ${M}’s defence minister has said that if we do, ${M} will not send its navy to help us in February.`}` },
      { id: "buy", name: "Trade patrol boats for a fast approval", says: `Give ${M} our two spare patrol boats. In return, the ${MA} cabinet approves on the ${ord(c.voteDay)}, in time for the 16th. ${BOATS}` },
      { id: "back", name: `Go back to reinforcing ${B} quietly`, says: `No clash with ${M}. ${B} is still reinforced, but ${R} doesn’t see it.`, gives: true },
    ],
    secure: { id: "buy", name: "Trade patrol boats for their votes", says: `Give ${M} our two spare patrol boats before the vote. ${surname("sato")} expects that to turn enough ministers. ${BOATS}` },
    sato: `General, a frigate off ${B} on the 16th needs ${M}’s approval. ${c.hotline ? `I can ask on the hotline, but with ${count} of ${W.ministers} ministers with us, I will get a no.` : `Without a hotline, the ${MA} cabinet’s answer reaches us on ${answerDay} January. That is too late. I have asked for a hotline twice since October.`}`,
    blocked: `Settle the clash between ${B} and ${M} first. Your other orders are kept.`,
  };
}

// ── incidents, as the desk shows them ───────────────────────────────────────
export function incident(c, run, month) {
  const id = c.incidents[month];
  if (!id) return null;
  const inc = incidentById(id);
  const s = simulate(c, run)[month === "dec" ? "decStart" : "decEnd"];
  return { ...inc, body: inc.text(c, s, c.D.severity), council: inc.council(c, s), staffId: inc.options.find((o) => o.staff).id, date: `${inc.day[month]} ${month === "dec" ? "December" : "January"}` };
}

// ── night reports ───────────────────────────────────────────────────────────
const incidentBeat = (c, run, month) => {
  const id = c.incidents[month];
  if (!id) return null;
  const s = simulate(c, run)[month === "dec" ? "decEnd" : "janEnd"];
  const pick = s.incident[month];
  const day = incidentById(id).day[month], mon = month === "dec" ? "December" : "January";
  const text = {
    radar: pick === "fix" ? `The main radar came back on after six days of repairs. ${B} can see 30 nautical miles again.` : `The main radar is running on its cracked waveguide. ${s.radarFails ? "The engineers report the crack is spreading." : "It has held so far."}`,
    defector: pick === "talk"
      ? `The lieutenant from ${S} says ${R} ${s.knows.claim.plan === "land" ? `means to land on the ${B} headland in early February` : s.knows.claim.plan === "bluff" ? `has no plan to land, and wants ${M} frightened into asking us to leave` : `will test ${B} first and land only if it looks weak`}. ${surname("halden")} says the story is consistent; whether it is true, he cannot yet say.`
      : `${M}’s security service questioned the lieutenant and sent us a summary: he worked in ${S} and is frightened. The ${MA} ministers were pleased to be trusted.`,
    leak: pick === "brief" ? `We confirmed our numbers on ${B} to the press. ${MA} papers ran our reasons the next morning. ${R} now knows exactly what defends ${B}.` : `We said nothing. The story ran for three days, quoted by ${R}’s embassy, and the ${MA} ministers asked ${surname("sato")} why they had read it in a newspaper.`,
    collision: pick === "search" ? `The fishing boat carried a ${R} navy radio and a log of ${B}’s guns. ${R} called the search piracy; the ${MA} ministers were uneasy.` : `The fisherman and his boat went home by morning. ${R} state television ran the story for two days.`,
    visit: pick === "open" ? `${M}’s defence minister visited ${B} in front of the cameras. ${MA} television led with it; so did ${R}’s.` : `${M}’s defence minister visited ${B} privately and saw everything. She told ${surname("sato")} she was satisfied.`,
  }[id];
  return { at: "beacon", cause: `${day} ${mon} · ${incidentById(id).title}`, text };
};

// What a month changed, readout by readout, for the night report.
const changes = (c, before, after) => {
  const a = status(c, before), b = status(c, after);
  return b.map((x, i) => ({ label: x.label, term: x.term, before: a[i].value, after: x.value, tone: x.tone, same: a[i].value === x.value }));
};

export function night(c, run, month) {
  const sim = simulate(c, run);
  if (month === "dec") {
    const s = sim.decEnd, b = run.dec?.beacon ?? "quiet", l = run.dec?.lattice ?? "boats";
    const away = `${L} was not listening to ${S} this month.`;
    const k = s.knows;
    const answer = {
      boats: () => `${L} counted ${k.count} landing craft in ${S}, up from ${c.craft.dec}. Because ${L} stayed on ${S}, our warning before an attack is still about two days.`,
      who: () => `${L} traced the orders for ${R}’s fishing fleet to its navy headquarters in ${S}, not its fisheries ministry. ${k.role === "screen" ? "The boats are working with the landing craft." : k.role === "swarm" ? "The boats are working the shipping lane in daylight." : `The boats are running along our coast at night.`} ${away}`,
      when: () => `${L} picked up a ${R} navy signal: ${k.date.kind === "exercise" ? `a public exercise from ${k.date.day} February` : k.date.kind === "two-stage" ? `ships to sea on ${k.date.day} February, landing craft to follow on command` : `ships ready at sea by ${k.date.day} February`}. ${away}`,
    }[l]();
    const rival = {
      land: { quiet: `Six ${R} fishing boats came within 30 nautical miles of ${B}, close enough to see the new guns, and turned back to ${S}. We should assume ${R} now knows ${B} has been reinforced.`, rest: `Six ${R} fishing boats moved onto the shipping lane, just inside the 20 nautical miles ${B}’s radar still covers. Anything further out, we did not see.`, show: `${R} answered our exercise. Two of its corvettes now patrol 12 nautical miles off ${B}, day and night.` },
      bluff: { quiet: `${R} state television showed its landing craft loading in ${S}, with music. ${MA} papers reprinted the pictures.`, rest: `${R} state television showed its landing craft loading in ${S}, and a map with ${B} circled.`, show: `${R}’s press called our exercise a provocation. Two ${MA} ministers asked ${surname("sato")} why they had not been told.` },
      probe: { quiet: `A ${R} patrol boat ran along our coast at night with its lights off, close enough to count ${B}’s guns, then went home.`, rest: `A ${R} patrol boat ran along our coast at night with its lights off, and found ${B} with only its own garrison.`, show: `${R} answered our exercise. Two corvettes now patrol 12 nautical miles off ${B}, day and night.` },
    }[c.plan][b];
    const beats = [
      { at: "beacon", ring: { quiet: 250, rest: 190, show: 270 }[b], dashed: b === "rest", cause: `18 December · ${b === "quiet" ? "staff, under your direction" : "your order"}`,
        text: { quiet: `Two rifle companies and the air-defence battery dug in on the headland. ${B}’s radar still covers 30 nautical miles. ${BN} is now on its ${ord(s.fatigue)} day without rest.`, rest: `${BN} stood down until the 31st and is resting. ${B} held with its own ${W.garrison} soldiers. Its radar now covers 20 nautical miles, down from 30, so ships between 20 and 30 miles out went unwatched.`, show: `The frigate and two companies exercised off ${B} in daylight. Radar cover held at 32 nautical miles. ${M}’s defence minister found out from the press, not from us.` }[b] },
      { at: "harbour", cause: `27 December · ${L}, ${l === "boats" ? `${surname("halden")}’s question` : "your question"}`, text: answer, marker: `Answered: ${latticeQ(l).short}` },
      incidentBeat(c, run, "dec"),
      { at: "lane", cause: `30 December · ${R}`, text: rival },
    ].filter(Boolean);
    return { title: "Night report", sub: "Duty log, 9 December to 1 January", beats, changes: changes(c, sim.decStart, s), still: WARN[s.warning], next: `The ${MA} cabinet votes on ${c.voteDay} January on whether to keep backing us at ${B}. ${surname("sato")} needs your January orders before then.`, go: "Begin January" };
  }
  const s = sim.janEnd, jb = run.jan?.beacon ?? "quiet", way = run.jan?.way ?? null;
  const troops = s.plan === "land" || s.plan === "turned";
  const vote = s.approvedBy === "trade" ? `The ${MA} cabinet approved, as agreed. Our two spare patrol boats now serve in ${M}’s navy, and ${M}’s navy will sail with ours if ${R} comes.`
    : s.actedAlone ? (s.navy ? `${M}’s defence minister protested, then said ${M}’s navy would still sail with ours.` : `${M}’s defence minister withdrew her support. ${M}’s navy will not sail with ours in February.`)
      : s.approvedBy === "hotline" ? `${surname("sato")} called the ${MA} ministers on the hotline before the frigate sailed. They approved within hours, and ${M}’s navy will sail with ours.`
        : s.navy ? `The ${MA} cabinet voted ${ministersFor(s.support)} to ${W.ministers - ministersFor(s.support)} to keep backing us. If ${R} comes, ${M}’s navy will sail with ours.`
          : `The ${MA} cabinet voted ${ministersFor(s.support)} to ${W.ministers - ministersFor(s.support)} against sending its navy. ${M} still lets us use ${B}, but its ships stay in port.`;
  const beats = [
    { at: "beacon", ring: jb === "hold" ? 190 : 270, dashed: jb === "hold", cause: `${jb === "show" ? "16" : jb === "hold" ? "10" : "20"} January · ${jb === "quiet" ? "staff, under your direction" : "your order"}`,
      text: { quiet: `${B}’s air-defence battery reached full strength. Its radar covers 32 nautical miles. ${BN} is on its ${ord(s.fatigue)} day without rest.`, hold: `${BN} stood down to rest and will be fit for February. ${B} kept its own guns.`, show: way === "act" ? `The frigate and two companies arrived off ${B} in daylight. We told ${M}’s government the next morning.` : `The frigate and two companies arrived off ${B} in daylight, with ${M}’s approval. ${R} saw them within hours.` }[jb] },
    { at: "beacon", cause: `${s.approvedBy === "trade" ? c.voteDay : s.actedAlone ? 17 : s.approvedBy === "hotline" ? 15 : c.voteDay} January · ${M}`, text: vote },
    incidentBeat(c, run, "jan"),
    { at: "lane", cause: `${c.sailDay} February · ${R}`, text: `${R}’s ships left ${S} at dawn: four warships and the landing craft${s.radarFails ? `. ${B}’s main radar failed an hour later; we are tracking them on the spare` : ""}. They are heading for ${B}.` },
  ].filter(Boolean);
  return { title: "Night report", sub: `Duty log, 5 January to ${c.sailDay} February`, beats, changes: changes(c, sim.decEnd, s), still: atSea(s, troops), next: `This is the showdown. You choose how ${B} meets ${R}’s ships.`, go: "Begin February: the showdown" };
}

// ── February ────────────────────────────────────────────────────────────────
export function february(c, run) {
  const s = simulate(c, run).janEnd;
  const troops = s.plan === "land" || s.plan === "turned";
  const routes = [{
    id: "quiet", name: "Hold quietly", does: `${B}’s guns and garrison hold the headland. ${BN} stays in reserve, out of sight.`,
    costs: `${R}’s press will say we were too afraid to show ourselves. The ${MA} ministers read that press, and it makes their next vote on backing us harder to win.`,
    needs: `${B}’s defences holding until ${BN} can reach them, which takes warning and a fit battalion. ${BN} is ${fatigueWord(s.fatigue) === "unfit" ? `unfit, on its ${ord(s.fatigue)} day without rest` : fatigueWord(s.fatigue) === "rested" ? "rested" : `${fatigueWord(s.fatigue)}, on ${s.fatigue} days`}.`,
    voice: ["briggs", s.def >= 3 ? "The guns are dug in. We can hold for three days without showing our hand." : `${B} is thinner than I would like. If they land, we will need ${BN} fast.`],
  }];
  if (s.navy) routes.push({
    id: "joint", name: `Stand with ${M}’s navy`, does: `Our frigate and ${M}’s two corvettes block the approach in daylight. ${BN} goes in behind them.`,
    costs: `${BN} works another month: ${s.fatigue + 30} days without rest by March${s.fatigue + 30 > FATIGUE.unfit ? ", past the point where a third of it is unfit" : ""}. If there are no troops aboard, ${M}’s ministers may say we escalated over nothing.`,
    needs: s.approvedBy === "trade" ? `${M}’s navy, which ${M} agreed to send in return for our two patrol boats.` : `${M}’s navy, which the ${MA} cabinet agreed to send.`,
    voice: ["sato", `${M}’s navy sails with ours on the ${ord(c.sailDay + 1)}. Seen together on the water, we are much harder for ${R} to split apart.`],
  });
  return {
    turn: 6,
    halden: s.warning === "fresh"
      ? `Four warships and the landing craft are holding ten miles off ${B}. ${troops ? `${L} heard the order to put troops aboard. This is a landing force.` : `${L} heard no order to put troops aboard. I believe the landing craft are empty.`} How ${B} meets them is your call, General.`
      : `Four warships and the landing craft are holding ten miles off ${B}. They have not landed, and they have not turned back. I cannot tell you whether they carry troops. How ${B} meets them is your call, General.`,
    warning: atSea(s, troops),
    routes,
    notOffered: s.navy ? "" : s.actedAlone
      ? `Standing with ${M}’s navy is off the table. You reinforced ${B} in January without ${M}’s approval, so ${M}’s defence minister has kept its navy in port.`
      : `Standing with ${M}’s navy is off the table. The ${MA} cabinet voted against sending it, ${ministersFor(s.support)} to ${W.ministers - ministersFor(s.support)}.`,
  };
}

// ── the debrief ─────────────────────────────────────────────────────────────
// Every sentence here is chosen from the facts outcome() computed, so the ending can't say
// we kept watch when we didn't, or call a worn-out battalion fit.
let HAPPENED;
const GRADE = { success: "Success", costly: "Costly success", failure: "Failure" };
let ORDER;
let PLAN_TRUTH;

export function debrief(c, run) {
  const o = outcome(c, run), s = o.s;
  const [title, happened] = HAPPENED[o.code];
  const q = run.dec?.lattice ?? "boats";
  const troops = s.plan === "land" || s.plan === "turned";
  const planted = (q === "who" && c.deceive === "who") || (q === "when" && c.deceive === "when") || s.knows.claim?.planted;
  const backers = ministersFor(o.supportAfter);
  const days = o.daysAfter;
  const allyLine = o.kept.ally
    ? (o.route === "joint" ? `${M}’s navy stood beside ours in public, and ${backers} of ${W.ministers} ministers back us going into the spring.` : `The ${MA} cabinet still backs us, ${backers} of ${W.ministers}.`)
    : (o.code === "called" ? `Some ${MA} ministers say we escalated over nothing; only ${backers} of ${W.ministers} still back us.` : `Only ${backers} of ${W.ministers} ${MA} ministers still back us, so ${M}’s support is in doubt for the spring.`);
  const battalionLine = o.kept.battalion
    ? `${BN} ends the campaign fit${days === 0 ? " and rested" : `, on ${days} days without rest`}, ready if ${R} tries again in the spring.`
    : `${BN} ends the campaign unfit: after ${days} days without rest${o.battle ? " and a battle" : ""}, a third of it is sick or injured. It needs most of March to recover.`;
  const janTruth = s.shift === "bluff-to-land" ? `${R} saw ${M} wavering and turned its show of force into a real landing plan.`
    : s.shift === "deterred" ? `After your frigate appeared on 16 January, ${R} cancelled its landing order. Its ships would sail without troops.`
      : c.plan === "probe" ? (s.plan === "land" ? `${R}’s scouts found ${B} weak enough, so the landing order went out.` : `${R}’s scouts found ${B} too strong, and the landing order was held back.`)
        : c.plan === "land" ? `${R}’s landing plan stayed in place.` : `${R} kept up the show, with no troops behind it.`;
  const learned = q === "boats" ? "how many landing craft there were" : q === "who" ? "what the fishing fleet was for" : `${R}’s sailing date`;
  const halden = o.listening
    ? `We kept ${L} on ${S}, so when ${R} sailed we knew ${troops ? "troops were aboard" : "no troops had boarded"}. That is what the warning is for.${planted ? " One clue was planted, and I should have said so sooner." : ""}`
    : o.dated
      ? `We had ${R}’s date and it held. But ${L} was not listening to ${S}, so when the ships sailed we could not tell whether troops were aboard. ${o.warned ? "The patrol boats saw them leave, which gave us time to move." : s.boats < 2 ? `With our patrol boats traded away, we didn’t see them leave until they were nearly at ${B}.` : ""}`.trim()
      : `We learned ${learned}, and it cost us our watch on ${S}. When ${R} sailed, we could not tell whether the landing craft carried troops, so you chose how to meet them without knowing if this was a landing or a show of force.${planted ? ` And one of our clues was planted: ${R} meant us to read it as a landing.` : ""}`;
  return {
    title, grade: o.grade, gradeName: GRADE[o.grade],
    line: `${happened} ${allyLine} ${battalionLine}`,
    score: [
      { label: ST, ok: o.kept.beacon, text: o.kept.beacon ? "Still ours" : "Lost" },
      { label: M, ok: o.kept.ally, text: `${backers} of ${W.ministers} ministers with us` },
      { label: BN, ok: o.kept.battalion, text: o.kept.battalion ? (days === 0 ? "Rested" : `Fit, ${days} days`) : `Unfit, ${days} days` },
    ],
    rows: [
      ["September", `Before you: your predecessor strengthened ${B} quietly and set up ${L}.`, "Nothing yet worth reporting.", PLAN_TRUTH[c.plan]],
      ["November", `Before you: your predecessor ordered a closer look at ${S}.`, `${R} was either preparing to attack, or bluffing to frighten ${M}.`, `${R} had the ships and troops to do more than one thing at once.`],
      ["December", `${ORDER.dec[run.dec?.beacon ?? "quiet"]} ${L}: ${latticeQ(q).short}.`, `${c.craft.dec}${s.knows.count ? `, then ${s.knows.count}` : ""} landing craft loading in ${S}.`, planted ? `One of our clues was planted: ${R} wanted us to read it as a landing.` : PLAN_TRUTH[c.plan]],
      ["January", ORDER.jan(run.jan ?? { beacon: "quiet" }), s.knows.claim ? `The defector said ${s.knows.claim.plan === "land" ? "a landing" : s.knows.claim.plan === "bluff" ? "a bluff" : "a test, then a landing"}.` : "A landing looked more likely than a bluff.", janTruth],
      ["February", o.route === "joint" ? `Stand with ${M}’s navy.` : "Hold quietly.", o.listening ? `${L} heard ${troops ? "troops ordered aboard" : "no order to board troops"}.` : "We could not tell whether the landing craft carried troops.", happened.split(". ")[0] + "."],
    ],
    halden,
    truth: [`Really: ${{ land: "a landing on " + B, bluff: "a bluff, no troops", probe: "a test, then a landing if " + B + " looked weak" }[c.plan]}`, `February: ${{ stopped: "turned back at sea", landed: "they landed; " + B + " held", held: "they landed; " + B + " held", lost: "they landed; " + B + " fell", faced: "turned back without firing", waited: "turned back without firing", called: "no troops aboard", outlasted: "no troops aboard" }[o.code]}`],
  };
}

export { PLAN_ORDER, OFFICERS };

// Recomputed whenever the theatre changes (see setWorld in src/story/world.js).
onWorld(() => {
  B = W.stationShort; ST = W.station; R = W.rival; M = W.host; MA = W.hostAdj; S = W.harbour; L = W.network; BN = W.reserve;
  WARN = {
    fresh: ["Warning before an attack: about two days", `If ${R} orders troops aboard the landing craft, ${L} will hear it two days before they sail: enough time to bring ${BN} to ${B}.`],
    stale: ["Warning before an attack: less reliable", `${L} stopped listening to ${S} in December. We would see the ships leave, but could miss the order that puts troops aboard, so we might get hours of warning instead of days.`],
  };
  TITLE = {
    line: `On 1 December you take command of the defence of ${ST}, our radar post on the ${MA} coast. Across ${W.strait}, ${R} is loading landing craft in ${S}. You have three months.`,
    saved: "Saved this morning. Your December orders have not gone out.",
  };
  ORIENT = [
    ["Your goal", `Keep ${B} in our hands, keep ${M} on our side, and bring ${BN} through fit to fight. All three is a success. Holding ${B} at the cost of one of the others is a costly success. Losing ${B} is a failure.`],
    ["Each month", `A briefing, sometimes a signal that needs an answer, then your orders. Your staff draft every order; you can overrule them twice a month. The night report shows what happened.`],
    ["Where you start", `Three months into the crisis. In September your predecessor reinforced ${B} quietly and set up ${L}, our listening posts. In November they ordered the closer look at ${S} that opens your first briefing.`],
  ];
  AWAY = `${L} stops listening to ${S} this month, so our warning before an attack becomes less reliable.`;
  LATTICE = {
    head: `${L} · radio intercepts`,
    ask: `${surname("halden")} will point ${L}’s twelve listening posts at one question this month.`,
    what: `Twelve listening posts along the ${MA} coast that pick up ${R}’s military radio. Each month you can point them at one question. Setting the question does not use a personal order.`,
    questions: [
      { id: "boats", q: `How many landing craft are loading in ${S}?`, short: `landing craft in ${S}`, staff: true, means: `Tells us how big a force ${R} could land. Keeps ${L} listening to ${S}, so our warning before an attack stays at about two days.` },
      { id: "who", q: `Who gives orders to ${R}’s fishing fleet?`, short: "who runs the fishing fleet", means: `Tells us whether ${R}’s fishing boats are part of its military plans. ${AWAY}` },
      { id: "when", q: `When does ${R} plan to sail?`, short: `${R}’s sailing date`, means: `Gives us ${R}’s planned date, if it has set one. ${AWAY}` },
    ],
  };
  BOATS = `Without the boats we can’t see ${R}’s ships leave ${S}, so only ${L} listening there would warn us in time.`;
  HAPPENED = {
    stopped: ["Stopped at sea", `${R}’s landing force turned back at sea when it met our frigate and ${M}’s corvettes together. No soldier reached the beach.`],
    landed: ["Held, after a landing", `With no warning of the sailing, ${R}’s second wave slipped past the joint patrol and landed on the headland. ${B} held until ${BN} arrived, but it was a battle.`],
    held: ["Held, after a battle", `${R} landed a battalion on the ${B} headland, and ${B}’s defences held until ${BN} arrived. It was a battle, and we lost soldiers.`],
    lost: [`${B} lost`, `${R} landed a battalion on the ${B} headland and took the station before ${BN} could reach it. Without ${B}, we cannot watch the strait.`],
    faced: ["Faced them down", `${R}’s ships met our frigate and ${M}’s corvettes in daylight and turned back without firing.`],
    waited: ["Held, quietly", `${R}’s ships came close enough to count our guns, found ${B} ready, and turned back. No shots were fired, so ${R} has nothing to call an act of war.`],
    called: ["Called their bluff, loudly", `There were no troops aboard. We met an empty landing force with two navies, and ${R}’s press is calling it our escalation.`],
    outlasted: ["Waited them out", `There were no troops aboard, and ${R} went home. We never took the bait.`],
  };
  ORDER = {
    dec: { quiet: `${B} strengthened quietly (staff).`, rest: `Rest ${BN}.`, show: "Show force openly." },
    jan: (j) => j.beacon === "show" ? `Reinforce ${B} openly, and ${j.way === "act" ? `tell ${M} after` : j.way === "buy" ? `trade patrol boats for ${M}’s approval` : `ask ${M} on the hotline`}.` : `${j.beacon === "hold" ? "Hold as we are." : `Reinforce ${B} quietly (staff).`}${j.way === "buy" ? " Patrol boats traded to secure the vote." : ""}`,
  };
  PLAN_TRUTH = {
    land: `${R} had been planning a landing on the ${B} headland since September.`,
    bluff: `${R} never meant to land. The landing craft were for the cameras, to make ${M} ask us to leave.`,
    probe: `${R} planned to test ${B} first and land only if it looked weak.`,
  };
});
