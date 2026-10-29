// Every word the story says, worked out from the campaign (what Ravellan is really doing,
// Marenna's politics, the incidents) and the state your choices produce. Copy rules: rank
// before every name; months, not turns; say who acts; every fact carries its so-what;
// officers report what they have seen, never what the other side feels.
import { WORLD as W, onWorld } from "./world.js";
import { OFFICERS, fullName, surname } from "./officers.js";
import { incidentById } from "./incidents.js";
import { DATE_REST, DIG_DAYS, FATIGUE, fatigueWord, ministersFor, needsApproval, outcome, simulate } from "./play.js";

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
    { term: "battalion", label: BN, value: days === 0 ? "rested" : `fatigue ${days} · ${fatigueWord(days)}`, tone: days > FATIGUE.unfit ? "bad" : days > FATIGUE.tired ? "warn" : "ok", who: "okafor" },
    { term: "marenna", label: `${MA} cabinet`, value: `${sup} of ${W.ministers} with us`, tone: sup < 6 ? "bad" : sup < 7 ? "warn" : "ok", who: "sato" },
    { term: "beacon", label: B, value: s.def <= 0 ? "lost" : ["garrison only", "reinforced", "fully reinforced", "fortified"][Math.min(3, s.def - 1)], tone: s.def >= 3 ? "ok" : s.def === 2 ? "warn" : "bad", who: "briggs" },
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
      // A second reading of the same facts, so the sheet is an argument, not a lecture.
      dissent: c.craft.dec >= 9
        ? ["briggs", `${c.craft.dec} craft can land a battalion whatever they are for. I plan for the landing until someone shows me troops are not on that quay.`]
        : ["sato", `If this is theatre, the audience is the ${MA} cabinet. Whatever we do on ${B}, they will be watching it before ${R} does.`],
      halden: `${c.memories?.find((m) => m.who === "halden")?.quote.concat(" ") ?? ""}I can count landing craft, General. I cannot yet tell you what they are for. Until I hear troops ordered onto that quay, anyone who says landing or bluff is guessing, including me.`,
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
    dissent: {
      land: ["sato", `If we read this as a landing and we are wrong, we have frightened the ${MA} cabinet for nothing. They vote on the ${ord(c.voteDay)}.`],
      bluff: ["briggs", `A show can turn into a landing in one night. I would still want the guns dug in.`],
      probe: ["okafor", `A test is aimed at whatever looks weakest. Right now that may be my battalion, at fatigue ${s.fatigue}.`],
      open: ["okafor", `Whatever it is, ${BN} has to be fit for it, and it is at fatigue ${s.fatigue}.`],
    }[januaryRead(s) ?? "open"],
    // Halden's own read, not a repeat of the sheet: how far he trusts what he has, and what
    // it still leaves open.
    halden: {
      boats: () => `A count is a fact, General. ${k.count >= 12 ? "This one says two waves." : "This one says one wave."} It still does not tell me whether they mean to use them.`,
      who: () => `Radio orders are harder to fake than pictures. Harder, not impossible: a trail can be laid for us to find. It tells me their intent, not their date.`,
      when: () => `One signal on the fleet net. If it is true, it is the most useful thing I have. If it was meant for us, it is the most dangerous.`,
    }[q](),
  };
}

// ── where each officer stands, and why ─────────────────────────────────────
// For each decision, an officer's recommendation follows from their priority and the state.
// `because` is what they are protecting; `risk` is what happens if you overrule them.
const pos = (prefers, line, because, risk) => ({ prefers, line, because, risk });

// In a later sector of a war, each officer opens December's advice with what they
// remember from the last one.
function remembered(c, council) {
  for (const m of c.memories ?? []) if (council[m.who]) council[m.who] = { ...council[m.who], line: `${m.quote} ${council[m.who].line}` };
  return council;
}

function decemberCouncil(c, s) {
  const tired = s.fatigue >= 90, solid = s.support >= 66 && c.minister !== "dove", murky = c.D.plans.length > 2 || c.craft.dec < 9;
  return {
    briggs: pos("quiet", `Two rifle companies and the battery on the headland by the 20th, by night. Holds ${B} three weeks against a battalion from the sea. Costs ${BN} its Christmas. Worth it.`,
      `${B} able to stop a landing`, `${B} faces a battalion with ${W.garrison} soldiers.`),
    okafor: tired
      ? pos("rest", `${BN}’s fatigue is ${s.fatigue}. Past 100 my sick list grows every week; past 120 a third of them cannot fight. Give me 18 to 31 December and I will give you a battalion in January.`,
        `${BN} still able to fight in February`, `${BN}’s fatigue passes 120 by the end of January, and a third of it is unfit when ${R} comes.`)
      : pos("quiet", `Fatigue ${s.fatigue}. They have one more month in them, not two. Use it now and rest them in January.`,
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

// What January's briefing told you Ravellan means to do, from what we knew by then. The
// staff argue from it and the debrief quotes it, so both say what you were actually told.
export function januaryRead(s) {
  const k = s.knows;
  if (k.claim) return k.claim.plan;
  if (k.role) return { screen: "land", swarm: "bluff", scout: "probe" }[k.role];
  if (k.date) return { landing: "land", exercise: "bluff", "two-stage": "probe" }[k.date.kind];
  return null; // a count says how big, not what for
}

function januaryCouncil(c, s) {
  const read = januaryRead(s);
  return {
    briggs: read === "land" || read === "probe"
      ? pos("show", `If ${R} is coming in early February, I want it to see a frigate and two companies off ${B} on the 16th. A landing that can see what it faces is a landing that may not happen.`,
        `${B} looking too strong to attack`, `${R} plans its landing against a ${B} it believes is thin.`)
      : pos("quiet", `Battery to full strength by the 20th, by night. Covers us into February. ${R} sees nothing.`,
        `${B} at full strength without a show`, `${B} goes into February with the guns it has now.`),
    okafor: s.fatigue > 110
      ? pos("hold", `${BN}’s fatigue passes ${s.fatigue + 10} by the 10th. Rest them from 10 January, or I cannot promise you a fit battalion in February. ${B} already has its guns.`,
        `${BN} fit to fight in February`, `a third of ${BN} is sick or unfit when ${R} sails.`)
      : pos("quiet", `They rested over Christmas. I have no objection to working them now.`,
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
      cost: `${BN} works through Christmas: its fatigue reaches ${s.fatigue + 31} by the end of December. ${R} will see that ${B} is now defended, though not how strongly.`,
      question: `What should ${B} do in December?`,
      options: [
        { id: "quiet", name: `Strengthen ${B} quietly`, short: `strengthen ${B} quietly`, says: `${BN} stays on duty through Christmas. Two rifle companies and the air-defence battery, moved by night, in place by 20 December.`, staff: true, mark: { at: "beacon", text: "+2 companies and the battery, by night" } },
        { id: "rest", name: `Rest ${BN}`, short: `rest ${BN}`, says: `${B} keeps only its own ${W.garrison} soldiers, and its radar drops from 30 to 20 nautical miles while the crews rest. ${BN} stands down from 18 to 31 December and comes back fit.`, mark: { at: "beacon", text: "Garrison only · radar 20 nm", tone: "bad" } },
        { id: "show", name: "Show force openly", short: "show force openly", says: `${M}’s government has not approved it, and ${ministersFor(s.support)} of ${W.ministers} ministers are with us. A frigate and two rifle companies exercise off ${B} in daylight from 19 December, and ${R} sees it within a day.`, mark: { at: "beacon", text: "Frigate in daylight · seen by both capitals", tone: "warn" } },
      ],
      council: remembered(c, decemberCouncil(c, s)),
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
    cost: s.fatigue === 0 || s.fatigue <= 31 ? `${BN} goes back on duty after its Christmas rest.` : `${BN}’s fatigue passes ${s.fatigue + 20}. ${surname("okafor")} expects a third of it to be sick or unfit by February.`,
    question: `What should ${B} do in January?`,
    options: [
      { id: "quiet", name: `Reinforce ${B} quietly`, short: `reinforce ${B} quietly`, says: `${BN} stays on duty, another month. The air-defence battery reaches full strength, moved by night, by 20 January.`, staff: true, mark: { at: "beacon", text: "Battery to full strength, by night" } },
      { id: "show", name: `Reinforce ${B} openly`, short: `reinforce ${B} openly`, says: `${needsApproval(c, s, "show") ? `${M}’s government must approve it first, and its answer is slow.` : `${surname("sato")} can get ${M}’s answer the same day on the hotline.`} ${BN} stays on duty. A frigate and two rifle companies off ${B} in daylight from 16 January: ${R} will see that we mean to defend ${B}.`, mark: { at: "beacon", text: "Frigate and 2 companies, 16 Jan, in daylight", tone: "warn" } },
      { id: "hold", name: "Hold as we are", short: "hold as we are", says: `${B} gets no new guns. ${BN} rests from 10 January and is fit for February.`, mark: { at: "beacon", text: `No new guns · ${BN} rests from 10 Jan`, tone: "warn" } },
    ],
    council: januaryCouncil(c, s),
    reply: {
      quiet: ["briggs", `Good. Battery at full strength by the 20th. ${R} won’t see it happen.`],
      show: ["briggs", `Frigate sails on the 16th. ${needsApproval(c, s, "show") ? `${M} has to approve it first, and a new request takes a week without a hotline. Talk to ${surname("sato")}.` : `${surname("sato")} is on the hotline now.`}`],
      hold: ["briggs", `We hold. If ${R} comes in early February, ${B} fights with what it has.`],
    },
  };
}

// The Lattice question for December. Each choice says what it gives and what it costs.
export let LATTICE;
export const latticeQ = (id, month = "dec") => LATTICE[month].find((x) => x.id === id);

// Where Lattice listens, as an order slip like the others. Halden's question is the staff
// plan; asking anything else uses a personal order.
function latticeCouncil(c, s, month) {
  const k = s.knows;
  if (month === "dec") {
    const three = c.D.plans.includes("probe");
    return {
      halden: pos("boats", `Ten craft is one battalion. Thirteen is a battalion and a second wave, and that is a different war. I want the count.`,
        `knowing whether a second wave is coming`, `we plan ${B}’s defence without knowing how many waves it faces.`),
      briggs: three
        ? pos("who", `Three plans fit what we have. The fishing boats are the tell. I would rather know which plan I am digging against than count one more boat.`,
          `knowing which plan ${R} is following`, `we count boats for a month and still cannot tell a landing from a show.`)
        : pos(c.craft.dec >= 9 ? "when" : "boats", c.craft.dec >= 9 ? `They have enough craft already. What I cannot plan without is a date.` : `Count them. If the number stops growing, I know how much headland to dig.`,
          c.craft.dec >= 9 ? `a date to plan ${B}’s defence around` : `knowing how big a landing to plan for`, c.craft.dec >= 9 ? "the battery moves on a guess." : "I dig for a force I have not measured."),
      ...(s.support < 60 ? { sato: pos("who", `If those fishing boats are only for the cameras, I can tell the ministers so, with evidence. That steadies the vote.`, `evidence to steady the ${MA} cabinet`, `the ministers hear only ${R}’s version of what the boats are for.`) } : {}),
    };
  }
  return {
    halden: pos("sarn", `The order to put troops aboard is the one thing that tells a landing from a show. It comes over ${S}’s harbour net, two days before they sail. Don’t take my ears off the quay.`,
      `knowing in February whether troops are aboard`, `when the ships sail, we cannot tell a landing from a show of force.`),
    okafor: s.fatigue >= 90
      ? pos("when", `Give me the true date early in January and I stand ${BN} down a company at a time until the last week. That is twenty fatigue I cannot take off any other way.`, `${BN} rested before February`, `${BN} carries every one of its ${s.fatigue} days into February.`)
      : pos("sarn", `${BN} can carry January. Keep listening; I would rather know whether to send them.`, `${BN} sent only when it is needed`, "we move the battalion on a guess."),
    briggs: k.date?.planted || !k.date
      ? pos("when", k.date ? `December’s date came from one signal. A second source on the fleet net tells me whether to trust it.` : `I have a battery to move and no date to move it by. The fleet net has the date.`, `a date ${B}’s defence can be timed to`, "we keep the whole headland on alert for a week we cannot name.")
      : pos("sarn", `I have the date. Now I need to know whether they are coming with soldiers.`, `knowing whether to expect a landing`, `${B} braces for a landing that may be a show.`),
  };
}

export function latticeOrders(c, run, month) {
  const sim = simulate(c, run), s = month === "dec" ? sim.decOrders : sim.janOrders, k = s.knows;
  const qs = LATTICE[month].map((q) => ({ ...q, name: q.q, says: typeof q.means === "function" ? q.means(k) : q.means }));
  const name = month === "dec" ? "December" : "January";
  return {
    head: LATTICE.head, lead: "halden", staffId: qs.find((q) => q.staff).id,
    plan: month === "dec" ? `will keep ${L} on ${S}’s harbour net and count the landing craft by the end of December.` : `will keep ${L} on ${S}’s harbour net through January, listening for the order that puts troops aboard.`,
    does: month === "dec" ? `A count, so we know whether ${R} has a second wave.` : `About two days’ warning in February, and whether troops are aboard when the ships sail.`,
    cost: month === "dec" ? `We learn nothing about the fishing boats or the sailing date this month.` : `No sailing date unless we already have one, so ${BN} stays on duty until the ships sail.`,
    question: `What should ${L} listen for in ${name}?`,
    options: qs, council: latticeCouncil(c, s, month), explain: LATTICE.nets,
    reply: Object.fromEntries(qs.map((q) => [q.id, ["halden", q.reply]])),
  };
}

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
      { id: "buy", name: "Trade patrol boats for a fast approval", mark: { at: "lane", text: `Our 2 patrol boats go to ${M}’s navy`, tone: "warn" }, says: `Give ${M} our two spare patrol boats. In return, the ${MA} cabinet approves the move at once, in time for the 16th, and the navy for February with it. ${BOATS}` },
      { id: "back", name: `Go back to reinforcing ${B} quietly`, says: `No clash with ${M}. ${B} is still reinforced, but ${R} doesn’t see it.`, gives: true },
    ],
    secure: { id: "buy", name: "Trade patrol boats for their votes", mark: { at: "lane", text: `Our 2 patrol boats go to ${M}’s navy`, tone: "warn" }, says: `Give ${M} our two spare patrol boats before the vote. ${surname("sato")} expects that to turn enough ministers. ${BOATS}` },
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
    radar: pick === "fix" ? `${BN}’s engineers changed the waveguide in six days and went back on duty without their rest. ${B} can see 30 nautical miles again.` : `The main radar is running on its cracked waveguide. ${s.radarFails ? "The engineers report the crack is spreading." : "It has held so far."}`,
    defector: pick === "talk"
      ? `The lieutenant from ${S} says ${R} ${s.knows.claim.plan === "land" ? `means to land on the ${B} headland in early February` : s.knows.claim.plan === "bluff" ? `has no plan to land, and wants ${M} frightened into asking us to leave` : `will test ${B} first and land only if it looks weak`}. ${surname("halden")} says the story is consistent; whether it is true, he cannot yet say.`
      : `${M}’s security service questioned the lieutenant and sent us a summary: he worked in ${S} and is frightened. The ${MA} ministers were pleased to be trusted.`,
    leak: pick === "brief" ? `We confirmed our numbers on ${B} to the press. ${MA} papers ran our reasons the next morning. ${R} now knows exactly what defends ${B}.` : `We said nothing. The story ran for three days, quoted by ${R}’s embassy, and the ${MA} ministers asked ${surname("sato")} why they had read it in a newspaper.`,
    collision: pick === "search" ? `The fishing boat carried a ${R} navy radio and a log of ${B}’s guns. ${R} called the search piracy; the ${MA} ministers were uneasy.` : `The fisherman and his boat went home by morning. ${R} state television ran the story for two days.`,
    visit: pick === "open" ? `${M}’s defence minister visited ${B} in front of the cameras. ${MA} television led with it; so did ${R}’s.` : `${M}’s defence minister visited ${B} privately and saw everything. She told ${surname("sato")} she was satisfied.`,
  }[id];
  return { at: "beacon", cause: `${day} ${mon} · ${incidentById(id).title}`, text };
};

// The day troops would be ordered aboard: two days before the sailing.
const boardDay = (c) => (c.sailDay > 2 ? `${c.sailDay - 2} February` : `${29 + c.sailDay} January`);

// Night reports read in date order: "9 December · …" sorts before "18 December · …".
const MONTH_ORDER = { December: 0, January: 1, February: 2 };
const dayKey = (b) => { const [d, m] = b.cause.split(" · ")[0].split(" "); return MONTH_ORDER[m] * 100 + Number(d); };
const byDay = (a, b) => dayKey(a) - dayKey(b);

// What a month changed, readout by readout, for the night report.
const changes = (c, before, after) => {
  const a = status(c, before), b = status(c, after);
  return b.map((x, i) => ({ label: x.label, term: x.term, before: a[i].value, after: x.value, tone: x.tone, same: a[i].value === x.value }));
};

export function night(c, run, month) {
  const sim = simulate(c, run);
  if (month === "dec") {
    const s = sim.decEnd, b = run.dec?.beacon ?? "quiet", l = run.dec?.lattice ?? "boats";
    const away = `We have no new count of the landing craft: ${L} was off ${S}’s harbour net.`;
    const k = s.knows;
    const answer = {
      boats: () => `${L} counted ${k.count} landing craft in ${S}, up from ${c.craft.dec}. ${k.count >= 12 ? "That is a battalion and a second wave." : "Enough for one battalion, not a second wave."}`,
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
        text: { quiet: `Two rifle companies and the air-defence battery dug in on the headland. ${B}’s radar still covers 30 nautical miles. ${BN}’s fatigue is now ${s.fatigue}.`, rest: `${BN} stood down until the 31st and is resting. ${B} held with its own ${W.garrison} soldiers. Its radar now covers 20 nautical miles, down from 30, so ships between 20 and 30 miles out went unwatched.`, show: `The frigate and two companies exercised off ${B} in daylight. Radar cover held at 32 nautical miles. ${M}’s defence minister found out from the press, not from us.` }[b] },
      { at: "harbour", cause: `27 December · ${L}, ${l === "boats" ? `${surname("halden")}’s question` : "your question"}`, text: answer, marker: `Answered: ${latticeQ(l).short}` },
      incidentBeat(c, run, "dec"),
      { at: "lane", cause: `30 December · ${R}`, text: rival },
    ].filter(Boolean).sort(byDay);
    return { title: "Night report", sub: "Duty log, 9 December to 1 January", beats, changes: changes(c, sim.decStart, s), still: WARN[s.warning], next: `The ${MA} cabinet votes on ${c.voteDay} January on whether to keep backing us at ${B}. ${surname("sato")} needs your January orders before then.`, go: "Begin January" };
  }
  const s = sim.janEnd, jb = run.jan?.beacon ?? "quiet", way = run.jan?.way ?? null;
  const troops = s.plan === "land" || s.plan === "turned";
  const vote = s.approvedBy === "trade" ? `The ${MA} cabinet approved, as agreed. Our two spare patrol boats now serve in ${M}’s navy, and ${M}’s navy will sail with ours if ${R} comes.`
    : s.actedAlone ? (s.navy ? `${M}’s defence minister protested, then said ${M}’s navy would still sail with ours.` : `${M}’s defence minister withdrew her support. ${M}’s navy will not sail with ours in February.`)
      : s.approvedBy === "hotline" ? `${surname("sato")} called the ${MA} ministers on the hotline before the frigate sailed. They approved within hours, and ${M}’s navy will sail with ours.`
        : s.navy ? `The ${MA} cabinet voted ${ministersFor(s.support)} to ${W.ministers - ministersFor(s.support)} to keep backing us. If ${R} comes, ${M}’s navy will sail with ours.`
          : `The ${MA} cabinet voted ${ministersFor(s.support)} to ${W.ministers - ministersFor(s.support)} against sending its navy. ${M} still lets us use ${B}, but its ships stay in port.`;
  const jq = run.jan?.lattice ?? "sarn", k = s.knows;
  const listen = {
    sarn: `${L} stayed on ${S}’s harbour net. ${troops ? `On ${boardDay(c)} it heard the order to put troops aboard.` : "It heard no order to put troops aboard before the ships sailed."}`,
    when: `By 8 January ${L} had the sailing date from the fleet command net: ${c.sailDay} February.${k.date?.corrected ? " December’s date was wrong; it had been planted." : ""} Knowing it, ${surname("okafor")} stood ${BN} down a company at a time until the last week: ${DATE_REST} less fatigue. ${L} was off ${S}’s harbour, so we did not hear whether troops went aboard.`,
    who: `${L} followed ${R}’s fishing fleet: ${k.role === "screen" ? "the boats are screening the landing craft" : k.role === "swarm" ? "the boats are crowding the lane for the cameras" : `the boats are counting ${B}’s guns at night`}. ${L} was off ${S}’s harbour, so we did not hear whether troops went aboard.`,
  }[jq];
  const beats = [
    { at: "harbour", cause: `${jq === "sarn" ? boardDay(c) : jq === "when" ? "8 January" : "24 January"} · ${L}, ${jq === "sarn" ? `${surname("halden")}’s net` : "your question"}`, text: listen, marker: `Listening: ${latticeQ(jq, "jan").short}` },
    { at: "beacon", ring: jb === "hold" ? 190 : 270, dashed: jb === "hold", cause: `${jb === "show" ? "16" : jb === "hold" ? "10" : "20"} January · ${jb === "quiet" ? "staff, under your direction" : "your order"}`,
      text: { quiet: `${B}’s air-defence battery reached full strength. Its radar covers 32 nautical miles. ${BN}’s fatigue is ${s.fatigue}.`, hold: `${BN} stood down to rest and will be fit for February. ${B} kept its own guns.`, show: way === "act" ? `The frigate and two companies arrived off ${B} in daylight. We told ${M}’s government the next morning.` : `The frigate and two companies arrived off ${B} in daylight, with ${M}’s approval. ${R} saw them within hours.` }[jb] },
    { at: "beacon", cause: `${s.approvedBy === "trade" ? c.voteDay : s.actedAlone ? 17 : s.approvedBy === "hotline" ? 15 : c.voteDay} January · ${M}`, text: vote },
    incidentBeat(c, run, "jan"),
    { at: "lane", cause: `${c.sailDay} February · ${R}`, text: `${R}’s ships left ${S} at dawn: four warships and the landing craft${s.radarFails ? `. ${B}’s main radar failed an hour later; we are tracking them on the spare` : ""}. They are heading for ${B}.` },
  ].filter(Boolean).sort(byDay);
  // No separate "what we know" box: the Lattice beat above already says what we heard.
  return { title: "Night report", sub: `Duty log, 5 January to ${c.sailDay} February`, beats, changes: changes(c, sim.decEnd, s), still: null, next: `This is the showdown. You choose how ${B} meets ${R}’s ships.`, go: "Begin February: the showdown" };
}

// ── February ────────────────────────────────────────────────────────────────
// Good intelligence narrows February without settling it: knowing troops are aboard still
// leaves how many waves, and what each way of meeting them costs the battalion and the ally.
const fightAtSea = { dove: "some ministers will blame us for every sailor they lose", firm: "the cabinet will count its losses against us, a little", hawk: "the defence minister will make heroes of them, and the cabinet will rally" };

export function february(c, run) {
  const s = simulate(c, run).janEnd, k = s.knows;
  const troops = s.plan === "land" || s.plan === "turned";
  const days = s.fatigue, fit = (d) => (d > FATIGUE.unfit ? `unfit at fatigue ${d}` : `${fatigueWord(d)} at fatigue ${d}`);
  const routes = [{
    id: "quiet", name: "Hold quietly", does: `${B}’s guns and garrison hold the headland. ${BN} waits in reserve and moves when we see them come.`,
    costs: `Nothing, if they turn back. If they land, it is a battle on the headland: ${BN} ends ${fit(days + 20)}, and we lose soldiers.`,
    needs: `${s.def >= 3 ? `${B} is strong enough to hold a single wave alone.` : `${B} cannot hold alone; it needs ${BN} to arrive in time.`} ${BN} reaches it in time only with warning, and only if it is fit. It is ${fit(days)}.`,
    voice: ["briggs", s.def >= 3 ? "The guns are dug in. We hold for three days without showing our hand." : `${B} is thin. If they land, I need ${BN} on the headland inside a day.`],
  }, {
    id: "forward", name: `Dig ${BN} in on the headland now`, does: `${BN} goes onto the ${B} headland tonight and digs in before the ships arrive. It needs no warning to be in place.`,
    costs: `Digging in and holding the trenches adds ${DIG_DAYS} fatigue whether or not they land: ${fit(days + DIG_DAYS)}; ${fit(days + DIG_DAYS + 20)} after a battle. If there are no troops aboard, ${R}’s press gets pictures of our soldiers in trenches over nothing, and a few ${MA} ministers wince.`,
    needs: `A fit battalion. ${days > FATIGUE.unfit ? `At fatigue ${days}, a third of ${BN} is unfit, so it holds less than it should.` : `${BN} is ${fatigueWord(days)}.`}`,
    voice: ["okafor", days > FATIGUE.tired ? `They are tired, General. In a trench they will hold; I cannot promise they will hold for long.` : `They are fit. Put them where the fight will be, and nobody has to run to it.`],
  }];
  if (s.navy) routes.push({
    id: "joint", name: `Stand with ${M}’s navy`, does: `Our frigate and ${M}’s two corvettes block the approach in daylight. ${BN} goes in behind them.`,
    costs: `A month at sea and on standby adds 30 fatigue: ${fit(days + 30)}. If there are troops aboard, ${M}’s corvettes may take fire, and ${fightAtSea[c.minister]}. If there are none, ${M}’s ministers may say we escalated over nothing.`,
    needs: `${s.approvedBy === "trade" ? `${M}’s navy, which ${M} agreed to send in return for our two patrol boats.` : `${M}’s navy, which the ${MA} cabinet agreed to send.`} To stop a second wave at sea we must know when it sails.`,
    voice: ["sato", c.minister === "dove" ? `The navy will sail, General. Whether the cabinet survives a funeral is another question.` : `${M}’s navy sails with ours on the ${ord(c.sailDay + 1)}. Seen together on the water, we are much harder for ${R} to split apart.`],
  });
  // What is still unknown, said plainly: the warning settles troops; the count settles waves.
  const waves = k.count ? (k.count >= 12 ? `${k.count} landing craft: a battalion and a second wave.` : `${k.count} landing craft: one battalion, no second wave.`) : "We never counted the landing craft, so I cannot tell you whether a second wave is behind the first.";
  const cargo = s.warning === "fresh"
    ? (troops ? `${L} heard the order to put troops aboard. This is a landing force.` : `${L} heard no order to put troops aboard. I believe the landing craft are empty.`)
    : "I cannot tell you whether they carry troops.";
  return {
    turn: 6,
    halden: `Four warships and the landing craft are holding ten miles off ${B}. ${cargo} ${waves}`,
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
let ORDER, ROUTE_ORDER, BELIEF;
let PLAN_TRUTH;

// The showdown, as the chart plays it: five short entries, each read in step with one move
// on the map (TableScene.showdownSetup). Read from outcome(), so two campaigns that end
// differently also play out differently, and the map ends where the words do.
export function showdown(c, run) {
  const o = outcome(c, run), s = o.s, a = o.after;
  const sail = c.sailDay, meet = `${sail + 1} February`;
  const turnedBack = !["held", "repelled", "landed", "lost"].includes(o.code);
  const move = {
    quiet: `${BN} stands by inland${o.warned ? ", ready to move on the warning" : ", with no warning to move on"}.`,
    forward: `${BN} digs in above the beach overnight.`,
    joint: `Our frigate and ${M}’s corvettes form a line across the approach.`,
  }[o.route];
  const contact = {
    stopped: `Shots across the bows. One ${MA} corvette is hit. The landing force turns away.`,
    landed: `The first wave turns at the line. The second slips round it and lands south of ${B}.`,
    held: `About 600 soldiers land below ${B}. ${BN} reaches them ${o.warned ? "in time" : "late"}; they are held on the beach.`,
    lost: `They land below ${B}. ${o.route === "forward" ? (o.fit ? "A second wave comes ashore round the trenches." : `${BN} is dug in but too worn to hold.`) : !o.warned ? `With no warning, ${BN} is still on the road.` : !o.fit ? `${BN} arrives too worn to hold.` : `${B}’s guns can’t hold ${o.big ? "two waves" : "them"}.`}`,
    repelled: `They land below ${B} and run into ${BN}’s trenches.`,
    faced: `The two navies meet them in daylight. Nobody fires.`,
    waited: `They come within sight of ${B}, ${s.plan === "deterred" ? "carrying no troops" : "count its guns"}, and stop.`,
    called: `The two navies meet them. The landing craft are empty.`,
    outlasted: `They sail up and down in front of their own cameras. The landing craft are empty.`,
    dugin: `They come close, see ${BN} in its trenches, and stop.`,
  }[o.code];
  const ended = turnedBack ? `${R}’s ships turn for home. By evening they are back in ${S}.`
    : o.code === "lost" ? `${R}’s flag is over ${B}. ${BN} falls back inland.`
      : `The landing craft that reached the beach never leave it. ${R}’s warships go home.`;
  const backers = ministersFor(o.supportAfter), before = ministersFor(s.support);
  const cabinet = `${MA} cabinet: ${backers} of ${W.ministers} with us${backers === before ? "" : `, ${backers > before ? "up" : "down"} from ${before}`}.`;
  const unit = `${BN}: fatigue ${o.daysAfter}${o.casualties ? `, ${o.casualties} killed or wounded` : ""}.`;
  return {
    title: "The showdown", sub: `${sail} to ${sail + 2} February`,
    beats: [
      { cause: `${sail} February · ${R}`, text: `${R}’s ships leave ${S} at dawn${s.radarFails ? `; ${B}’s main radar fails an hour later` : ""}.` },
      { cause: `${sail} February · ${{ quiet: B, forward: BN, joint: `${M}’s navy` }[o.route]}`, text: move },
      { cause: `${meet} · contact`, text: contact },
      { cause: `${meet} · evening`, text: ended },
      { cause: `${sail + 2} February · the cost`, text: `${unit} ${cabinet}` },
    ],
    // What the chart needs to play it.
    play: { code: o.code, route: o.route, warned: o.warned, craft: c.craft.jan, unitName: BN, unitTag: `Fatigue ${o.daysAfter}${o.casualties ? ` · −${o.casualties}` : ""}`, unitTone: o.kept.battalion ? "ok" : "bad" },
    after: a, go: "To the debrief",
  };
}

// What a campaign leaves the task force: the condition it carries into the next sector,
// and what each officer will remember. Specific, so the next campaign can quote it.
function memories(c, run, o) {
  const s = o.s, out = [];
  // `line` is the debrief's note; `quote` is what the officer says about it in the next
  // sector, with this sector's names already in it.
  const add = (who, line, quote) => out.push({ who, line, quote });
  const rested = run.dec?.beacon === "rest" || run.jan?.beacon === "hold" || run.jan?.lattice === "when";
  if (rested) add("okafor", `You found ${BN} its rest${run.jan?.lattice === "when" ? " by buying the sailing date" : ""}. ${surname("okafor")} will trust your next promise about it.`, `You found them their rest at ${B}. I am asking you to do it again.`);
  else if (o.daysAfter > FATIGUE.unfit) add("okafor", `You took ${BN}’s fatigue to ${o.daysAfter}. ${surname("okafor")} has written it down.`, `At ${B} you took their fatigue to ${o.daysAfter}. I would rather not watch that twice.`);
  else add("okafor", `${BN} never rested, and got through. ${surname("okafor")} calls that luck.`, `They never rested at ${B} and got away with it. Luck is not a plan.`);
  if ((run.jan?.lattice ?? "sarn") !== "sarn") {
    const cost = o.code === "called" || o.code === "lost";
    add("halden", `You took ${L} off ${S}’s harbour in January, and ${cost ? "it cost us" : "we got away with it"}. ${surname("halden")} will argue harder for the quay next time.`, cost ? `We left the quay at ${S} and paid for it. I would like my ears where the boarding order is.` : `We left the quay at ${S} and got away with it. I would not count on that twice.`);
  } else if (s.knows.date?.corrected) add("halden", `${L} caught a planted date. ${surname("halden")} will remember that ${R} lies on its fleet net.`, `${R} lied to us on its fleet net at ${S}. I will not take its dates on one signal again.`);
  else add("halden", `You kept ${L} on the quay. ${surname("halden")} heard what he needed when it mattered.`, `At ${S} the quay told us what we needed. Same again, if you will.`);
  if (s.actedAlone) add("sato", `You told ${M} after, not before. ${surname("sato")} will need a month to repair it.`, `${M} heard about our move from the press. This government will have heard that story too.`);
  else if (s.approvedBy === "trade") add("sato", `Our patrol boats bought ${M}’s vote. ${surname("sato")} will say so to the next ally, too.`, `We bought ${M}’s vote with boats. Word of that travels faster than we do.`);
  else if (o.navyFought && c.minister === "dove") add("sato", `${M} lost sailors standing with us. ${surname("sato")} expects to be reminded.`, `${M} buried sailors for us. Allies remember who asks that of them.`);
  else add("sato", `${M} was asked first, every time. ${surname("sato")} can build on that.`, `We asked ${M} first every time. I can say so to this government, and they will check.`);
  if (s.radarFails) add("briggs", `The radar failed on the day. ${surname("briggs")} will not let you run equipment hot again without a fight.`, `The radar failed on the day at ${B}. I am not running anything hot again.`);
  else if (o.code === "lost") add("briggs", `${B} fell on ${surname("briggs")}’s watch. She will not forget it.`, `We lost ${B}. I am not losing this one.`);
  else if (o.battle) add("briggs", `${B} held a landing. ${surname("briggs")} knows what the headland can take.`, `${B} held a landing. I know what a dug-in headland can take now.`);
  else add("briggs", `${B} was never tested. ${surname("briggs")} still does not know what it can take.`, `${B} was never tested. I still do not know what a headland like this can take.`);
  return out;
}

export function debrief(c, run) {
  const o = outcome(c, run), s = o.s;
  const [title, happened] = HAPPENED[o.code];
  const q = run.dec?.lattice ?? "boats", jq = run.jan?.lattice ?? "sarn";
  const troops = s.plan === "land" || s.plan === "turned";
  const planted = (q === "who" && c.deceive === "who") || (q === "when" && c.deceive === "when" && !s.knows.date?.corrected) || s.knows.claim?.planted;
  const backers = ministersFor(o.supportAfter);
  const days = o.daysAfter;
  const allyLine = o.kept.ally
    ? (o.route === "joint" ? `${M}’s navy stood beside ours in public, and ${backers} of ${W.ministers} ministers back us going into the spring.` : `The ${MA} cabinet still backs us, ${backers} of ${W.ministers}.`)
    : (o.code === "called" ? `Some ${MA} ministers say we escalated over nothing; only ${backers} of ${W.ministers} still back us.` : `Only ${backers} of ${W.ministers} ${MA} ministers still back us, so ${M}’s support is in doubt for the spring.`);
  const battalionLine = o.kept.battalion
    ? `${BN} ends the campaign fit${days === 0 ? " and rested" : `, at fatigue ${days}`}${o.casualties ? `, with ${o.casualties} killed or wounded` : ""}.`
    : `${BN} ends the campaign unfit at fatigue ${days}${o.battle ? ` and a battle that cost ${o.casualties} killed or wounded` : ""}, a third of it is sick or injured. It needs most of March to recover.`;
  const janTruth = s.shift === "bluff-to-land" ? `${R} saw ${M} wavering and turned its show of force into a real landing plan.`
    : s.shift === "deterred" ? `After your frigate appeared on 16 January, ${R} cancelled its landing order. Its ships would sail without troops.`
      : c.plan === "probe" ? (s.plan === "land" ? `${R}’s scouts found ${B} weak enough, so the landing order went out.` : `${R}’s scouts found ${B} too strong, and the landing order was held back.`)
        : c.plan === "land" ? `${R}’s landing plan stayed in place.` : `${R} kept up the show, with no troops behind it.`;
  const halden = o.listening
    ? `${L} stayed on ${S}’s harbour net through January, so when ${R} sailed we knew ${troops ? "troops were aboard" : "no troops had boarded"}.${planted ? " One clue was planted, and I should have said so sooner." : ""}`
    : o.dated
      ? `We had ${R}’s true date. But ${L} was off ${S}’s harbour in January, so we could not tell whether troops were aboard. ${o.warned ? "The patrol boats saw them leave, which gave us time to move." : s.boats < 2 ? `With our patrol boats traded away, we didn’t see them leave until they were nearly at ${B}.` : ""}`.trim()
      : `${L} was off ${S}’s harbour in January, so when ${R} sailed you chose without knowing if this was a landing or a show of force.${planted ? ` And one of our clues was planted: ${R} meant us to read it as a landing.` : ""}`;
  return {
    title, grade: o.grade, gradeName: GRADE[o.grade], after: o.after,
    line: `${happened} ${allyLine} ${battalionLine}`,
    score: [
      { label: ST, ok: o.kept.beacon, text: o.kept.beacon ? "Still ours" : "Lost" },
      { label: M, ok: o.kept.ally, text: `${backers} of ${W.ministers} ministers with us` },
      { label: BN, ok: o.kept.battalion, text: o.kept.battalion ? (days === 0 ? "Rested" : `Fit, fatigue ${days}`) : `Unfit, fatigue ${days}` },
    ],
    rows: [
      ["December", `${ORDER.dec[run.dec?.beacon ?? "quiet"]} ${L}: ${latticeQ(q).short}.`, `${c.craft.dec}${s.knows.count ? `, then ${s.knows.count}` : ""} landing craft loading in ${S}.`, planted ? `One of our clues was planted: ${R} wanted us to read it as a landing.` : PLAN_TRUTH[c.plan]],
      ["January", `${ORDER.jan(run.jan ?? { beacon: "quiet" })} ${L}: ${latticeQ(jq, "jan").short}.`, BELIEF[januaryRead(simulate(c, run).janOrders) ?? "open"] + (s.knows.claim ? " (the defector’s word)" : ""), janTruth],
      ["February", ROUTE_ORDER[o.route], o.listening ? `${L} heard ${troops ? "troops ordered aboard" : "no order to board troops"}.` : "We could not tell whether the landing craft carried troops.", happened.split(". ")[0].replace(/\.$/, "") + "."],
    ],
    // Where the campaign leaves the task force, for the next sector.
    leaves: memories(c, run, o),
    halden,
    truth: [`Really: ${{ land: "a landing on " + B, bluff: "a bluff, no troops", probe: "a test, then a landing if " + B + " looked weak" }[c.plan]}`, `February: ${{ stopped: "turned back at sea", landed: "they landed; " + B + " held", held: "they landed; " + B + " held", repelled: "they landed; beaten on the beach", lost: "they landed; " + B + " fell", faced: "turned back without firing", waited: "turned back without firing", dugin: "turned back without landing", called: "no troops aboard", outlasted: "no troops aboard" }[o.code]}`],
  };
}

export { PLAN_ORDER, OFFICERS };

// Recomputed whenever the theatre changes (see setWorld in src/story/world.js).
onWorld(() => {
  B = W.stationShort; ST = W.station; R = W.rival; M = W.host; MA = W.hostAdj; S = W.harbour; L = W.network; BN = W.reserve;
  WARN = {
    fresh: ["Warning before an attack: about two days", `While ${L} listens to ${S}’s harbour net, we hear the order that puts troops aboard two days before they sail: enough time to bring ${BN} to ${B}, and we will know whether this is a landing.`],
    stale: ["Warning before an attack: less reliable", `${L} left ${S}’s harbour net in January. We would see the ships leave, but not whether troops went aboard, so we might get hours of warning instead of days.`],
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
  LATTICE = {
    head: `${L} · radio intercepts`,
    what: `Twelve listening posts along the ${MA} coast that pick up ${R}’s military radio.`,
    // Why a question has a price: the posts can follow one radio net properly at a time.
    nets: `Twelve posts can follow one radio net at a time: ${S}’s harbour net (the boarding order, our two days’ warning), the fleet command net (the sailing date) or the fishing fleet’s. Whatever ${L} listens to, it stops hearing the others.`,
    dec: [
      { id: "boats", q: `How many landing craft are loading in ${S}?`, short: `landing craft in ${S}`, staff: true, mark: { at: "harbour", text: `${L}: counting the landing craft` }, means: `A count by the end of December, so we know whether ${R} can land a second wave. Nothing on the fishing boats or the sailing date.`, reply: `We stay on the quay. You will have a count by the 27th.` },
      { id: "who", q: `Who gives orders to ${R}’s fishing fleet?`, short: "who runs the fishing fleet", mark: { at: "lane", text: `${L}: following the fishing fleet` }, means: `Tells us whether the fishing boats are screening a landing, staging a show or scouting ${B}. No new count of the landing craft.`, reply: `Then we follow the fishing boats. A trail can be laid for us to find; I will tell you how far I trust it.` },
      { id: "when", q: `When does ${R} plan to sail?`, short: `${R}’s sailing date`, mark: { at: "harbour", text: `${L}: fleet net, for the date` }, means: `${R}’s planned date, from the fleet command net. One signal, which could be planted. No new count of the landing craft.`, reply: `The fleet net, then. One signal is one signal, General.` },
    ],
    jan: [
      { id: "sarn", q: `Stay on ${S}’s harbour net`, short: `${S}’s harbour net`, staff: true, mark: { at: "harbour", text: `${L}: listening for troops boarding` }, means: `Keeps the two days’ warning: if ${R} orders troops aboard, we hear it before the ships sail, so in February we know whether this is a landing or a show.`, reply: `My ears stay on the quay.` },
      { id: "when", q: "Listen to the fleet command net for the sailing date", short: "the sailing date", mark: { at: "harbour", text: `${L}: fleet net · no boarding warning`, tone: "warn" }, means: (k) => `${k.date ? `Checks December’s date against a second source, so a planted date is caught. ` : `Gives the true sailing date. `}With the date by early January, ${surname("okafor")} can stand ${BN} down a company at a time until the last week: about ${DATE_REST} less fatigue. But ${L} stops hearing ${S}’s harbour, so in February we will not know whether troops are aboard.`, reply: `The fleet net. When they sail, I will know the day and not the cargo.` },
      { id: "who", q: "Listen to the fishing fleet", short: "the fishing fleet", mark: { at: "lane", text: `${L}: fishing fleet · no boarding warning`, tone: "warn" }, means: (k) => `${k.role ? "We already know what the fishing boats are for; this only confirms it. " : `Tells us what the fishing boats are for: a screen for a landing, a show or scouting. `}${L} stops hearing ${S}’s harbour, so in February we will not know whether troops are aboard.`, reply: `The fishing boats, then. We give up the quay for it.` },
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
    repelled: ["Repelled on the beach", `${R} landed a battalion below ${B} and ran into ${BN}, already dug in. The landing failed on the beach, and we lost soldiers holding it.`],
    dugin: ["Dug in, and they turned back", `${R}’s ships found ${BN} dug in on the headland and turned back without landing. ${R}’s press printed the pictures of our trenches.`],
    called: ["Called their bluff, loudly", `There were no troops aboard. We met an empty landing force with two navies, and ${R}’s press is calling it our escalation.`],
    outlasted: ["Waited them out", `There were no troops aboard, and ${R} went home. We never took the bait.`],
  };
  BELIEF = {
    land: "We read it as a landing.",
    bluff: "We read it as a show of force.",
    probe: `We read it as a test, then a landing if ${B} looked weak.`,
    open: "Still open: the count said how big a force, not what it was for.",
  };
  ROUTE_ORDER = { quiet: "Hold quietly.", forward: `Dig ${BN} in on the headland.`, joint: `Stand with ${M}’s navy.` };
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
