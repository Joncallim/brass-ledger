// Every word the story says, worked out from the campaign (what Ravellan is really doing,
// Marenna's politics, the incidents) and the state your choices produce. Copy rules: rank
// before every name; months, not turns; say who acts; every fact carries its so-what;
// officers report what they have seen, never what the other side feels.
import { WORLD as W } from "./world.js";
import { OFFICERS, fullName, surname } from "./officers.js";
import { incidentById } from "./incidents.js";
import { ministersFor, needsApproval, outcome, simulate } from "./play.js";

const B = W.stationShort, ST = W.station, R = W.rival, M = W.host, MA = W.hostAdj, S = W.harbour, L = W.network, BN = W.reserve;
const ord = (x) => `${x}${x % 100 >= 11 && x % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][x % 10] ?? "th"}`;
const lift = (craft) => (craft >= 9 ? "enough to put one battalion, about 600 soldiers, ashore at once" : "nearly enough to put one battalion, about 600 soldiers, ashore at once");
export const CALENDAR = ["September", "October", "November", "December", "January", "February"];
export const monthOf = (turn) => CALENDAR[turn - 1];
const PLAN_ORDER = ["quiet", "rest", "show", "hold"];

// ── what we know, in words ──────────────────────────────────────────────────
const WARN = {
  fresh: ["Warning before an attack: about two days", `${L} is listening to ${R}’s radio in ${S}. If ${R} orders troops aboard the landing craft, ${L} will hear it about two days before they sail. That is enough time to bring ${BN} to ${B}.`],
  stale: ["Warning before an attack: less reliable", `${L} spent December on another question, so our last close look at ${S} is from 1 December. We would still see ${R}’s ships leave ${S}. But we could miss the order that puts troops aboard, and that order is what gives us two days. We might get hours instead.`],
};
const warnNone = (s, troops) => s.warning === "fresh"
  ? ["Warning before an attack: used", troops
    ? `${L} heard ${R} order troops aboard the landing craft two days before they sailed. ${BN} had that time to move. This is a landing force.`
    : `${L} heard no order to put troops aboard before ${R}’s ships sailed. Unless the order went by hand, the landing craft are empty.`]
  : ["Warning before an attack: none", `${R}’s ships are already at sea. Our last close look inside ${S} is too old to tell us whether the landing craft carry troops. Until ${R} acts, we cannot tell a landing from a show of force.`];

// Readiness at a glance, for the bar along the top. Each value belongs to one officer.
export function status(c, s) {
  const days = s.fatigue, sup = ministersFor(s.support);
  return [
    { term: "battalion", label: BN, value: days === 0 ? "rested" : `${days} days on duty`, tone: days > 120 ? "bad" : days > 95 ? "warn" : "ok", who: "okafor" },
    { term: "marenna", label: `${MA} cabinet`, value: `${sup} of ${W.ministers} with us`, tone: sup < 6 ? "bad" : sup < 7 ? "warn" : "ok", who: "sato" },
    { term: "beacon", label: B, value: `${["garrison only", "reinforced", "fully reinforced", "fortified"][Math.min(3, s.def - 1)]}`, tone: s.def >= 3 ? "ok" : s.def === 2 ? "warn" : "bad", who: "briggs" },
    { term: "warning", label: "Warning", value: s.warning === "fresh" ? "about two days" : "less reliable", tone: s.warning === "fresh" ? "ok" : "warn", who: "halden" },
  ];
}

// ── the title ───────────────────────────────────────────────────────────────
export const TITLE = {
  line: `You command the defence of ${ST}, our radar post on the ${MA} coast, from September to February. Across ${W.strait}, ${R} is building up its forces in ${S}. Your staff handle the everyday orders. You step in when it matters.`,
  saved: "Saved this morning. Your December orders have not gone out.",
};

// ── briefings ───────────────────────────────────────────────────────────────
const readings = (c) => {
  const land = `${R} may mean to land that battalion on the ${B} headland and take the station.`;
  const bluff = `Or it may only want ${M}’s government to believe a landing is coming, so that ${M} asks us to leave ${B} without a shot fired.`;
  const probe = `Or it may test ${B} first, with ships close enough to count our guns, and land only if ${B} looks weak.`;
  return c.D.plans.includes("probe") ? `There are three ways to read this. ${land} ${bluff} ${probe}` : `There are two ways to read this. ${land} ${bluff}`;
};

export function brief(c, run, month) {
  const sim = simulate(c, run);
  if (month === "dec") {
    const s = sim.decStart;
    return {
      title: "Intelligence summary", from: `${fullName("halden")}, Intelligence`,
      sections: [
        ["Bottom line", `${R} is loading landing craft in ${S}, its main naval harbour, about ${W.harbourNm} nautical miles across the strait from ${B}. ${L} counted ${c.craft.dec} on 1 December, ${lift(c.craft.dec)}.`],
        ["Assessment", `${readings(c)} Loading landing craft serves every one of them. I will tell you which it is when I see troops boarding on the quay in ${S}. Not before.`],
        ["Watch for", `${R}’s fishing boats sailing together with the landing craft, and keeping military hours. Real fishermen don’t do that. If we see it, I will suspect the fishing boats are cover for an amphibious landing, though I would not yet know where.`],
      ],
      warning: WARN[s.warning],
      halden: `General. The closer look you ordered in November paid off. ${L} counted ${c.craft.dec} landing craft in ${S}, loading. Whether ${R} means to use them on ${B}, or only to frighten ${M}, I will tell you when I see troops on the quay. Anyone who tells you sooner is guessing.`,
    };
  }
  const s = sim.decEnd, q = run.dec?.lattice ?? "boats";
  const k = s.knows;
  const bottom = {
    boats: () => `${k.count} landing craft in ${S}, up from ${c.craft.dec}. ${c.plan === "bluff" ? `${R} has nearly stopped adding to them.` : k.count >= 12 ? `That is more than one battalion needs: enough for a battalion and a second wave behind it. ${B}’s garrison could not hold that alone; it would need ${BN}, fit and in time.` : `${R} is adding about one every few days, so it will have room for a battalion and its vehicles by early February.`}`,
    who: () => k.role === "screen"
      ? `${R}’s fishing boats are sailing together with the landing craft, and keeping military hours. Real fishermen don’t do that. ${L} traced their orders to ${R}’s navy: 23 boats in all.`
      : k.role === "swarm"
        ? `${R}’s fishing boats take their orders from ${R}’s navy, but they sail in daylight, in crowds, along the shipping lane, where cameras can see them. They do not go near the landing craft.`
        : `${R}’s fishing boats take their orders from ${R}’s navy. Since mid-December they have been running along our coast at night, one at a time, close enough to count ${B}’s guns.`,
    when: () => k.date.kind === "exercise"
      ? `${R} has announced a naval exercise in the strait starting ${k.date.day} February, and invited foreign reporters to watch it.`
      : k.date.kind === "two-stage"
        ? `${R}’s navy has ordered its ships to sea on ${k.date.day} February, and a second order holds the landing craft “ready to follow on command”.`
        : `${R}’s navy has ordered its ships to be ready at sea by ${k.date.day} February. Loading in ${S} should finish a few days before.`,
  }[q]();
  const assess = {
    boats: () => c.plan === "bluff"
      ? `A force for a landing that has stopped growing is either complete or for show. I cannot tell you which from a count. I will not give you a day, because I do not have one.`
      : `${R} is building enough landing craft for an amphibious landing on the ${B} headland. It may still use them only as a threat. I will not give you a day, because I do not have one.`,
    who: () => k.role === "screen"
      ? `We suspect the fishing boats are there to cover an amphibious landing, by crowding the strait so our radar cannot pick the landing craft out among them. We do not yet know where ${R} would land. ${B} is the obvious place, not the only one.`
      : k.role === "swarm"
        ? `Boats that want to be seen are working for the cameras, not for a landing. That points to a threat meant to frighten ${M}. It does not rule out a landing behind it.`
        : `Boats that count guns at night are scouting. ${R} wants to know how strong ${B} is before it commits. If ${B} looks weak, I would expect a landing to follow.`,
    when: () => k.date.kind === "exercise"
      ? `Navies hide real attacks inside exercises, and they also hold exercises to frighten people. An exercise with invited reporters leans toward the second. Plan for both from ${k.date.day} February.`
      : k.date.kind === "two-stage"
        ? `Ships first, landing craft on command, means ${R} wants to look before it lands. ${B} must look strong on ${k.date.day} February.`
        : `Ships ready at sea on ${k.date.day} February means a landing could come as early as the ${ord(k.date.day + 1)}. Plan for it.`,
  }[q]();
  return {
    title: "Intelligence summary", from: `${fullName("halden")}, Intelligence`,
    sections: [["Bottom line", bottom], ["Assessment", assess], ["Watch for", `Troops marching from their barracks down to the quay in ${S}. That is the last step before a landing force sails, and the clearest sign that this is an attack and not a threat.`]],
    warning: WARN[s.warning],
    halden: `General. ${bottom.split(". ")[0]}. ${q === "boats" ? `When ${R} will use them, I can’t give you yet.` : `What it means, I have told you on the sheet. Where I am guessing, I have said so.`}`,
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
const AWAY = `${L} stops listening to ${S} this month, so our warning before an attack becomes less reliable.`;
export const LATTICE = {
  head: `${L} · radio intercepts`,
  ask: `${surname("halden")} will point ${L}’s twelve listening posts at one question this month.`,
  what: `Twelve listening posts along the ${MA} coast that pick up ${R}’s military radio. Each month you can point them at one question. Setting the question does not use a personal order.`,
  questions: [
    { id: "boats", q: `How many landing craft are loading in ${S}?`, short: `landing craft in ${S}`, staff: true, means: `Tells us how big a force ${R} could land. Keeps ${L} listening to ${S}, so our warning before an attack stays at about two days.` },
    { id: "who", q: `Who gives orders to ${R}’s fishing fleet?`, short: "who runs the fishing fleet", means: `Tells us whether ${R}’s fishing boats are part of its military plans. ${AWAY}` },
    { id: "when", q: `When does ${R} plan to sail?`, short: `${R}’s sailing date`, means: `Gives us ${R}’s planned date, if it has set one. ${AWAY}` },
  ],
};
export const latticeQ = (id) => LATTICE.questions.find((x) => x.id === id);

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
      { id: "buy", name: "Trade patrol boats for a fast approval", says: `Give ${M} our two spare patrol boats. In return, the ${MA} cabinet approves on the ${ord(c.voteDay)}, in time for the 16th. We go without those two boats for the rest of the campaign.` },
      { id: "back", name: `Go back to reinforcing ${B} quietly`, says: `No clash with ${M}. ${B} is still reinforced, but ${R} doesn’t see it.`, gives: true },
    ],
    secure: { id: "buy", name: "Trade patrol boats for their votes", says: `Give ${M} our two spare patrol boats before the vote. ${surname("sato")} expects that to turn enough ministers. We go without those boats for the rest of the campaign.` },
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
    return { title: "Night report", sub: "Duty log, 9 December to 1 January", beats, still: WARN[s.warning], next: `The ${MA} cabinet votes on ${c.voteDay} January on whether to keep backing us at ${B}. ${surname("sato")} needs your January orders before then.`, go: "Begin January" };
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
  return { title: "Night report", sub: `Duty log, 5 January to ${c.sailDay} February`, beats, still: warnNone(s, troops), next: `This is the showdown. You choose how ${B} meets ${R}’s ships.`, go: "Begin February: the showdown" };
}

// ── February ────────────────────────────────────────────────────────────────
export function february(c, run) {
  const s = simulate(c, run).janEnd;
  const troops = s.plan === "land" || s.plan === "turned";
  const routes = [{
    id: "quiet", name: "Hold quietly", does: `${B}’s guns and garrison hold the headland. ${BN} stays in reserve, out of sight.`,
    costs: `${R}’s press will say we were too afraid to show ourselves. The ${MA} ministers read that press, and it makes their next vote on backing us harder to win.`,
    needs: `${B}’s defences holding on their own until ${BN} can reach them${s.fatigue > 120 ? `, and ${BN} is on its ${ord(s.fatigue)} day without rest` : ""}.`,
    voice: ["briggs", s.def >= 3 ? "The guns are dug in. We can hold for three days without showing our hand." : `${B} is thinner than I would like. If they land, we will need ${BN} fast.`],
  }];
  if (s.navy) routes.push({
    id: "joint", name: `Stand with ${M}’s navy`, does: `Our frigate and ${M}’s two corvettes block the approach in daylight. ${BN} goes in behind them.`,
    costs: `${BN} will be worn out by the end of the month and need most of March to recover. If ${R} never meant to land, we have escalated for nothing.`,
    needs: s.approvedBy === "trade" ? `${M}’s navy, which ${M} agreed to send in return for our two patrol boats.` : `${M}’s navy, which the ${MA} cabinet agreed to send.`,
    voice: ["sato", `${M}’s navy sails with ours on the ${ord(c.sailDay + 1)}. Seen together on the water, we are much harder for ${R} to split apart.`],
  });
  return {
    turn: 6,
    halden: s.warning === "fresh"
      ? `Four warships and the landing craft are holding ten miles off ${B}. ${troops ? `${L} heard the order to put troops aboard. This is a landing force.` : `${L} heard no order to put troops aboard. I believe the landing craft are empty.`} How ${B} meets them is your call, General.`
      : `Four warships and the landing craft are holding ten miles off ${B}. They have not landed, and they have not turned back. I cannot tell you whether they carry troops. How ${B} meets them is your call, General.`,
    warning: warnNone(s, troops),
    routes,
    notOffered: s.navy ? "" : s.actedAlone
      ? `Standing with ${M}’s navy is off the table. You reinforced ${B} in January without ${M}’s approval, so ${M}’s defence minister has kept its navy in port.`
      : `Standing with ${M}’s navy is off the table. The ${MA} cabinet voted against sending it, ${ministersFor(s.support)} to ${W.ministers - ministersFor(s.support)}.`,
  };
}

// ── the debrief ─────────────────────────────────────────────────────────────
const RESULT = {
  stopped: ["Stopped at sea", `${R}’s landing force turned back at sea when it met our frigate and ${M}’s corvettes together. No soldier reached the beach. ${M} saw its navy fight beside ours, which binds it to us for the spring. The cost: ${BN} is worn out and needs most of March to recover.`],
  held: ["Held, at a cost", `${R} landed a battalion on the ${B} headland, and ${B}’s defences held until ${BN} arrived. ${B} is still ours. We lost soldiers doing it, and ${R} now calls it a battle, which puts ${M}’s cabinet under pressure from its own public.`],
  lost: [`${B} lost`, `${R} landed a battalion on the ${B} headland and took the station before ${BN} could reach it. Without ${B}, we cannot watch the strait. Getting it back will need ${M}’s full support, and a much bigger force.`],
  faced: ["Faced them down", `${R}’s ships came, met our frigate and ${M}’s corvettes in daylight, and turned back without firing. ${M} stood with us in public, so the alliance goes into spring stronger. The cost: ${BN} is worn out for March.`],
  waited: ["Held, quietly", `${R}’s ships came close enough to count our guns, found ${B} ready, and turned back. We never had to fire, so ${R} has nothing to call an act of war, and ${BN} is still fit if ${R} tries again in the spring. The cost: ${R}’s press says we were too afraid to show ourselves.`],
  called: ["Called their bluff, loudly", `There were no troops aboard. We met an empty landing force with two navies, and ${R}’s press is calling it our escalation. ${M} stood with us, but some ${MA} ministers say we overreacted, and ${BN} is worn out for March.`],
  outlasted: ["Waited them out", `There were no troops aboard, and ${R} went home. We never took the bait. But ${R}’s press has had a month of pictures of its landing craft and our silence, and the ${MA} cabinet is less sure of us than it was.`],
};
const ORDER = {
  dec: { quiet: `${B} strengthened quietly (staff).`, rest: `Rest ${BN}.`, show: "Show force openly." },
  jan: (j) => j.beacon === "show" ? `Reinforce ${B} openly, and ${j.way === "act" ? `tell ${M} after` : j.way === "buy" ? `trade patrol boats for ${M}’s approval` : `ask ${M} on the hotline`}.` : `${j.beacon === "hold" ? "Hold as we are." : `Reinforce ${B} quietly (staff).`}${j.way === "buy" ? " Patrol boats traded to secure the vote." : ""}`,
};
const PLAN_TRUTH = {
  land: `${R} had been planning a landing on the ${B} headland since September.`,
  bluff: `${R} never meant to land. The landing craft were for the cameras, to make ${M} ask us to leave.`,
  probe: `${R} planned to test ${B} first and land only if it looked weak.`,
};

export function debrief(c, run) {
  const o = outcome(c, run), s = o.s;
  const [title, line] = RESULT[o.code];
  const q = run.dec?.lattice ?? "boats";
  const knew = q === "boats" ? "how many landing craft" : q === "who" ? "what the fishing fleet was for" : `${R}’s date`;
  const planted = (q === "who" && c.deceive === "who") || (q === "when" && c.deceive === "when") || s.knows.claim?.planted;
  const janTruth = s.shift === "bluff-to-land" ? `${R} saw ${M} wavering and turned its show of force into a real landing plan.`
    : s.shift === "deterred" ? `After your frigate appeared on 16 January, ${R} cancelled its landing order. Its ships would sail without troops.`
      : c.plan === "probe" ? (s.plan === "land" ? `${R}’s scouts found ${B} weak enough, so the landing order went out.` : `${R}’s scouts found ${B} too strong, and the landing order was held back.`)
        : c.plan === "land" ? `${R}’s landing plan stayed in place.` : `${R} kept up the show, with no troops behind it.`;
  return {
    title, line,
    rows: [
      ["September", `Strengthened ${B} quietly. Set up ${L}.`, "Nothing yet worth reporting.", PLAN_TRUTH[c.plan]],
      ["November", `A closer look at ${S}.`, `${R} was either preparing to attack, or bluffing to frighten ${M}.`, `${R} had the ships and troops to do more than one thing at once.`],
      ["December", `${ORDER.dec[run.dec?.beacon ?? "quiet"]} ${L}: ${latticeQ(q).short}.`, `${c.craft.dec}${s.knows.count ? `, then ${s.knows.count}` : ""} landing craft loading in ${S}.`, planted ? `One of our clues was planted: ${R} wanted us to read it as a landing.` : PLAN_TRUTH[c.plan]],
      ["January", ORDER.jan(run.jan ?? { beacon: "quiet" }), s.knows.claim ? `The defector said ${s.knows.claim.plan === "land" ? "a landing" : s.knows.claim.plan === "bluff" ? "a bluff" : "a test, then a landing"}.` : "A landing looked more likely than a bluff.", janTruth],
      ["February", o.route === "joint" ? `Stand with ${M}’s navy.` : "Hold quietly.", s.warning === "fresh" ? `${L} heard ${s.plan === "land" || s.plan === "turned" ? "troops ordered aboard" : "no order to board troops"}.` : "We could not tell whether the landing craft carried troops.", line.split(". ")[0] + "."],
    ],
    halden: o.warned
      ? `We knew ${knew}, and we kept our watch on ${S}, so when ${R} sailed we knew what was coming. ${planted ? "One clue was planted, and I should have said so sooner." : "That is what intelligence is for."}`
      : `We learned ${knew}, and it cost us our watch on ${S}. When ${R} sailed, we could not tell whether the landing craft carried troops, so you had to choose how to meet them without knowing if this was a landing or a show of force.${planted ? ` And one of our clues was planted. ${R} meant us to read it as a landing.` : ""}`,
    truth: [`Really: ${{ land: "a landing on " + B, bluff: "a bluff, no troops", probe: "a test, then a landing if " + B + " looked weak" }[c.plan]}`, `February: ${{ stopped: "turned back at sea", held: "they landed; " + B + " held", lost: "they landed; " + B + " fell", faced: "turned back without firing", waited: "turned back without firing", called: "no troops aboard", outlasted: "no troops aboard" }[o.code]}`],
  };
}

export { PLAN_ORDER, OFFICERS };
