// Every word the story says. The facts come from three places only: the campaign (what
// Ravellan is really doing), the rules (simulate and outcome in play.js) and the record of
// dated events and intelligence (chronicle.js). Nothing here infers an event from a number.
//
// Voice. Interface text is literal: what an order does, what it costs, in the rules' own
// terms. Officers speak from their jobs, briefly:
//   Briggs (operations): positions, levels and deadlines.
//   Halden (intelligence): sources, dates and how sure he is.
//   Okafor (logistics): readiness and what it costs the soldiers.
//   Sato (plans and the ally): permissions, votes and leverage.
// The ledger and the logs are a factual record. No officer reports a hidden fact as known,
// and no line promises an effect the rules do not deliver.
import { WORLD as W, onWorld } from "./world.js";
import { OFFICERS, fullName, surname } from "./officers.js";
import { incidentById } from "./incidents.js";
import { DATE_REST, DIG_DAYS, FATIGUE, JOINT_DAYS, BATTLE_DAYS, effectiveDefence, fatigueWord, landingCheck, ministersFor, needsApproval, outcome, simulate } from "./play.js";
import { chronicle, dateKey, decisionAt, knownAt, logEnd } from "./chronicle.js";

let B, ST, R, M, MA, S, L, BN;
const ord = (x) => `${x}${x % 100 >= 11 && x % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][x % 10] ?? "th"}`;
const MONTH = { dec: "December", jan: "January", feb: "February" };
export const CALENDAR = ["September", "October", "November", "December", "January", "February"];
export const monthOf = (turn) => CALENDAR[turn - 1];
const PLAN_ORDER = ["quiet", "rest", "show", "hold"];
const day = (d) => `${d.day} ${MONTH[d.month]}`;
const dayTime = (d) => `${day(d)}${d.hour != null ? `, ${String(d.hour).padStart(2, "0")}:00` : ""}`;
const lower = (t) => t[0].toLowerCase() + t.slice(1);

// ── shared facts, in words ─────────────────────────────────────────────────
const DEF = ["lost", "garrison only", "reinforced", "fully reinforced", "fortified"];
const defWord = (d) => DEF[Math.max(0, Math.min(4, d))];
export const defenceLabel = (d) => `level ${Math.max(0, d)}, ${defWord(d)}`;
const votes = (support) => { const f = ministersFor(support); return { for: f, against: W.ministers - f }; };
const voteText = (support) => { const v = votes(support); return `${v.for} for, ${v.against} against`; };
const fitText = (f) => (f > FATIGUE.unfit ? `unfit at fatigue ${f}` : `${fatigueWord(f)} at fatigue ${f}`);

// How much warning we would get, from what is actually listening or watching.
function warningState(s) {
  if (s.warning === "fresh") return { key: "two-days", label: "about two days", tone: "ok" };
  if (s.knows.date && !s.knows.date.planted && s.boats >= 2) return { key: "date", label: "on the known date", tone: "ok" };
  return { key: "none", label: "hours, by radar", tone: "warn" };
}

// The rule that decides a landing, stated once, so every screen that explains it says the same.
const RULE = () => `Against one wave, ${B} holds at defence level 3, or at level 2 if ${BN} is warned and fit. Against two waves it needs level 3, warning, and ${BN} fit and at full strength.`;

// The readiness bar along the top. Each value belongs to one officer.
export function status(c, s) {
  const f = s.fatigue, v = votes(s.support), w = warningState(s), eff = s.def <= 0 ? 0 : effectiveDefence(s);
  const strength = c.strength ?? W.battalion;
  return [
    { term: "battalion", label: BN, value: `${f === 0 ? "rested" : `fatigue ${f} · ${fatigueWord(f)}`}${strength < W.battalion ? ` · ${strength} strong` : ""}`, tone: f > FATIGUE.unfit || c.understrength ? "bad" : f > FATIGUE.tired ? "warn" : "ok", who: "okafor" },
    { term: "marenna", label: `${MA} cabinet`, value: `${v.for} for · ${v.against} against`, tone: v.for < 6 ? "bad" : v.for < 7 ? "warn" : "ok", who: "sato" },
    { term: "defence", label: `${B} defences`, value: s.def <= 0 ? "lost" : `level ${eff}${eff < s.def ? " · exposed" : ""}`, tone: eff >= 3 ? "ok" : eff === 2 ? "warn" : "bad", who: "briggs" },
    { term: "warning", label: "Warning", value: w.label, tone: w.tone, who: "halden" },
  ];
}

// ── the title ───────────────────────────────────────────────────────────────
export let TITLE;
export let ORIENT;

// ── what we know, from whom, how sure ──────────────────────────────────────
const CERTAINTY = { confirmed: "confirmed", likely: "likely", single: "one signal, unconfirmed", claimed: "one man’s word" };
const SOURCE = () => ({ "lattice-harbour": `${L}, on ${S}’s harbour net`, "lattice-fleet": `${L}, on the fleet command net`, "lattice-fishing": `${L}, on the fishing fleet’s net`, search: "our boarding party", defector: `${M}’s security service, from the defector`, reaction: "what we watched them do", "patrol-boats": "our patrol boats", radar: `${B}’s radar` });
const ROLE = () => ({ screen: "sailing with the landing craft under navy orders, as a screen", swarm: "crowding the shipping lane in daylight, for the cameras", scout: `running along our coast at night, close enough to count ${B}’s guns` });
const REACTION = () => ({ faster: `${R} loaded faster after it saw our frigate`, cameras: `${R}’s television doubled its coverage, and the loading slowed`, probing: `${R}’s patrol boats came close to ${B} at night, twice` });

function claimText(i) {
  const v = i.claim.value;
  switch (i.claim.kind) {
    case "count": return `${v} landing craft in ${S}${v >= 12 ? ": enough for a second wave" : ": one battalion’s worth, not a second wave"}`;
    case "role": return `${R}’s fishing boats are ${ROLE()[v]}`;
    case "date": return v.kind === "exercise" ? `a public naval exercise from ${v.day} February` : v.kind === "two-stage" ? `ships to sea on ${v.day} February, landing craft to follow on command` : `ships ready at sea by ${v.day} February`;
    case "plan": return v === "land" ? "a landing is planned" : v === "bluff" ? "there is no landing, only a threat" : "they will test us first and land only if we look weak";
    case "reaction": return REACTION()[v];
    case "boarding": return v ? `${R} has ordered troops aboard the landing craft` : `no order to put troops aboard${i.claim.asOf ? `, as of ${day(i.claim.asOf)}` : ""}`;
    case "sailing": return `${R}’s ships are leaving ${S}`;
    default: return "";
  }
}
const intelLine = (i) => `${claimText(i)[0].toUpperCase()}${claimText(i).slice(1)}. Source: ${SOURCE()[i.source]}, ${day(i)}. ${CERTAINTY[i.certainty][0].toUpperCase()}${CERTAINTY[i.certainty].slice(1)}.`;

// Everything we knew at a moment, one line per item, with source and certainty: the ledger's
// "What we know".
export function knownLines(c, run, date) {
  return Object.values(knownAt(chronicle(c, run), date)).map(intelLine);
}

// What January's briefing read from what we knew by then. The staff argue from it, and the
// debrief quotes it, so both say what you were actually told.
export function januaryRead(s) {
  const k = s.knows;
  if (k.claim) return k.claim.plan;
  if (k.role) return { screen: "land", swarm: "bluff", scout: "probe" }[k.role];
  if (k.date) return { landing: "land", exercise: "bluff", "two-stage": "probe" }[k.date.kind];
  if (k.reaction) return { faster: "land", cameras: "bluff", probing: "probe" }[k.reaction];
  return null;
}
const READ = () => ({ land: "a landing", bluff: "a show of force", probe: `a test, then a landing if ${B} looks weak` });

// ── briefings ───────────────────────────────────────────────────────────────
const pos = (prefers, line, because, risk) => ({ prefers, line, because, risk });

export function brief(c, run, month) {
  const sim = simulate(c, run), rec = chronicle(c, run);
  const s = month === "dec" ? sim.decStart : sim.decEnd;
  const asOf = month === "dec" ? { month: "dec", day: 1 } : { month: "dec", day: 31 };
  const known = Object.values(knownAt(rec, asOf));
  const k = s.knows, count = k.count ?? (month === "dec" ? c.craft.dec : null);
  const plans = c.D.plans.includes("probe") ? `a landing on ${B}, a show of force to frighten ${M} into asking us to leave, or a test of ${B} first` : `a landing on ${B}, or a show of force to frighten ${M} into asking us to leave`;
  const read = month === "jan" ? januaryRead(s) : null;
  const unknown = [
    !k.count && month === "jan" ? "how many landing craft there are now" : null,
    "whether troops will board",
    !k.date ? "when they sail" : null,
  ].filter(Boolean);
  const carried = c.war && c.war.sector > 1 ? ` ${BN} arrives from the last sector at fatigue ${c.fatigue0}, ${c.strength ?? W.battalion} strong.` : "";
  const sections = [
    ["What we know", known.map(intelLine).join(" ")],
    ["What we don’t know", `${unknown[0][0].toUpperCase()}${unknown.join(", ").slice(1)}. ${month === "dec" ? `What ${R} means to do: ${plans}.` : read ? `Our best reading is ${READ()[read]}; nothing has settled it.` : "Nothing yet points to one plan over another."}`],
    ["What it means for your orders", `${RULE()} ${B} is at ${defenceLabel(effectiveDefence(s))} now; ${BN} is ${fitText(s.fatigue)}.${carried}`],
  ];
  const memory = c.memories?.find((m) => m.who === "halden")?.quote;
  const halden = month === "dec"
    ? `${memory ? `${memory} ` : ""}${count} craft at ${S}. ${count >= 9 ? "Enough to land a battalion." : "Not quite a battalion’s worth."} I have the numbers, not the intent. The order that puts troops aboard is the one thing that would tell me.`
    : k.count ? `${k.count} craft at ${S}${k.count >= 12 ? ", which is enough for a second wave" : ""}. I have the numbers, but not the boarding order.`
      : k.date ? `One date, ${k.date.day} February, from one signal on their fleet net. If it is true, it is the most useful thing I have. If it was meant for us, it is the most dangerous.`
        : k.role ? `Radio orders are harder to fake than pictures. Harder, not impossible. They tell me intent, not timing.`
          : `What we watched them do points one way. One observation is not a pattern.`;
  const dissent = month === "dec"
    ? (count >= 9 ? ["briggs", `${count} craft land a battalion whatever they are for. I plan for the landing until someone shows me an empty quay.`] : ["sato", `If this is theatre, the audience is the ${MA} cabinet. They will see our response before ${R} does.`])
    : { land: ["sato", `If we read this as a landing and we are wrong, the ${MA} cabinet will remember who frightened it. They vote on the ${ord(c.voteDay)}.`],
      bluff: ["briggs", `A show can turn into a landing in one night. I want the guns dug in regardless.`],
      probe: ["okafor", `A test goes for whatever looks weakest. That may be my battalion, at fatigue ${s.fatigue}.`],
      open: ["okafor", `Whatever it is, ${BN} has to be fit for it. It is at fatigue ${s.fatigue}.`] }[read ?? "open"];
  return { title: "Intelligence summary", from: `${fullName("halden")}, Intelligence`, sections, warning: null, dissent, halden };
}

// ── where each officer stands, and why ─────────────────────────────────────
// In a later sector of a war, each officer opens December's advice with what they remember.
function remembered(c, council) {
  for (const m of c.memories ?? []) if (council[m.who]) council[m.who] = { ...council[m.who], line: `${m.quote} ${council[m.who].line}` };
  return council;
}

function decemberCouncil(c, s) {
  const tired = s.fatigue >= 90, solid = s.support >= 66 && c.minister !== "dove", v = votes(s.support);
  return {
    briggs: pos("quiet", `Two rifle companies and the battery on the headland by the 20th, by night. That takes ${B} to level ${s.def + 1}.`,
      `${B} at level ${s.def + 1} by 20 December`, `${B} stays at level ${s.def}: the garrison alone.`),
    okafor: tired
      ? pos("rest", `Fatigue ${s.fatigue}. Another month on the headland takes them to ${s.fatigue + 31}. Past 120 a third of them can’t fight. Give me 18 to 31 December.`,
        `${BN} fit in February`, `${BN} reaches fatigue ${s.fatigue + 31} by New Year.`)
      : pos("quiet", `Fatigue ${s.fatigue}. They have one more month in them. Not two.`, `using ${BN} while it is fit`, "we rest a battalion that can still work."),
    sato: solid
      ? pos("show", `${v.for} of ${W.ministers} ministers are with us, and the defence minister ${c.minister === "hawk" ? "wants us seen" : "is content"}. A frigate in daylight costs us phone calls, not the vote.`,
        `${M} seeing us defend its coast`, `${M}’s ministers wonder whether we would fight for them.`)
      : pos("quiet", `${v.for} for, ${v.against} against. Move in daylight and ${R}’s embassy shows the photographs to those ministers before we do. Nothing visible before the vote on the ${ord(c.voteDay)}.`,
        `the vote on ${c.voteDay} January`, `${R} shows the ministers our troops before we have asked them.`),
    halden: c.D.plans.length > 2 || c.craft.dec < 9
      ? pos("show", `A move they can see makes them react, and the reaction is a clue. I would take one clue over a quiet month.`,
        `a clue to what ${R} means to do`, `we go into January with the same guesses.`)
      : pos("quiet", `I have the count. A quiet month gives me the best chance of hearing the rest.`, `a steady month on the radio`, `${R} changes its routine as we begin to read it.`),
  };
}

function januaryCouncil(c, s) {
  const read = januaryRead(s), v = votes(s.support), eff = effectiveDefence(s);
  return {
    briggs: (read === "land" || read === "probe") && eff + 1 >= 3
      ? pos("show", `A frigate and two companies off ${B} on the 16th, in daylight. At level ${eff + 1}, a landing they can see coming may not come at all.`,
        `${R} seeing a ${B} too strong to attack`, `${R} plans against a ${B} it thinks is thin.`)
      : pos("quiet", `Battery to full strength by the 20th, by night. That takes ${B} to level ${s.def + 1}. ${R} sees nothing.`,
        `${B} at level ${s.def + 1} without a show`, `${B} stays at level ${s.def}.`),
    okafor: s.fatigue > 90
      ? pos("hold", `Fatigue ${s.fatigue}. Another month takes them to ${s.fatigue + 31}. Stand them down from the 10th and I can give you a fit battalion in February.`,
        `${BN} fit in February`, `${BN} goes into February at fatigue ${s.fatigue + 31}.`)
      : pos("quiet", `Fatigue ${s.fatigue}. They can carry January.`, `using ${BN} while it is fit`, "we rest troops who can still work."),
    sato: s.support >= 60 && (c.hotline || c.minister === "hawk")
      ? pos("show", c.hotline ? `We have the hotline. With ${v.for} for, I can have their yes within hours.` : `The defence minister wants us seen, and ${v.for} of ${W.ministers} are with us.`,
        `${M} seeing us stand with it`, `${M}’s ministers start to doubt we would fight for them.`)
      : pos("quiet", `The vote is on the ${ord(c.voteDay)}: ${v.for} for, ${v.against} against. Anything in daylight before then, they hear from ${R} first.`,
        `the vote on ${c.voteDay} January`, `${M}’s navy stays in port in February.`),
    halden: read === "bluff"
      ? pos("hold", `What we have points to a show for the cameras. Answer it with troops and we give them the pictures. That is a reading, not a certainty.`,
        `not playing the part ${R} has written`, `we hand ${R}’s press the escalation it wants.`)
      : read === "land"
        ? pos("quiet", `What we have points to a landing. Every gun they cannot see is a gun they have not planned for.`, `${B} stronger than ${R} thinks`, `${R} plans around what it sees us add.`)
        : pos("quiet", `I cannot tell you yet whether this is a landing. Keep the headland quiet and my nets clear.`, `a clean picture on the radio`, `${R} changes its signals before I can read them.`),
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
    const s = sim.decOrders, f = s.fatigue, eng = s.eng ?? 0;
    return {
      head: ST, lead: "briggs", staffId: "quiet",
      plan: `will move two rifle companies and the air-defence battery onto the ${B} headland by night, in place by 20 December.`,
      does: `${B} goes from level ${s.def} to level ${s.def + 1}. ${RULE()}`,
      cost: `${BN} works through Christmas: fatigue ${f} to ${f + 31 + eng} by the end of December.`,
      question: `What should ${B} do in December?`,
      options: [
        { id: "quiet", name: `Strengthen ${B} quietly`, short: `strengthen ${B} quietly`, says: `${B} to level ${s.def + 1} by 20 December, moved by night. ${BN} stays on duty: fatigue ${f + 31 + eng} by New Year.`, staff: true, mark: { at: "beacon", text: `Level ${s.def + 1} by 20 Dec, by night` } },
        { id: "rest", name: `Rest ${BN}`, short: `rest ${BN}`, says: `${BN} stands down from 18 to 31 December: fatigue ${f} to ${eng}. ${B} gets nothing new and stays at level ${s.def}.`, mark: { at: "beacon", text: `${BN} rests · ${B} stays level ${s.def}`, tone: "bad" } },
        { id: "show", name: "Show force openly", short: "show force openly", says: `${B} to level ${s.def + 1}, in daylight from 19 December, with the frigate. ${R} sees it, and how it reacts is a clue to its plan. ${M} has not approved it: ${voteText(s.support)} today, and some will turn. Fatigue ${f + 31 + eng}.`, mark: { at: "beacon", text: `Level ${s.def + 1} · frigate in daylight`, tone: "warn" } },
      ],
      council: remembered(c, decemberCouncil(c, s)),
      reply: {
        quiet: ["briggs", "Companies move on the night of the 18th. In place by the 20th."],
        rest: ["briggs", `Then ${B} stays at level ${s.def} until January. Understood.`],
        show: ["briggs", `Frigate sails on the 19th. ${surname("sato")} needs to tell ${M} before they read it.`],
      },
      ring: { rest: 190, show: 270 },
    };
  }
  const s = sim.janOrders, f = s.fatigue, eng = s.eng ?? 0;
  return {
    head: ST, lead: "briggs", staffId: "quiet",
    plan: `will bring ${B}’s air-defence battery to full strength, by night, by 20 January.`,
    does: `${B} goes from level ${s.def} to level ${s.def + 1}. ${RULE()}`,
    cost: `${BN} stays on duty: fatigue ${f} to ${f + 31 + eng} by the end of January.`,
    question: `What should ${B} do in January?`,
    options: [
      { id: "quiet", name: `Reinforce ${B} quietly`, short: `reinforce ${B} quietly`, says: `${B} to level ${s.def + 1} by 20 January, moved by night. Fatigue ${f + 31 + eng} by the end of January.`, staff: true, mark: { at: "beacon", text: `Level ${s.def + 1} by 20 Jan, by night` } },
      { id: "show", name: `Reinforce ${B} openly`, short: `reinforce ${B} openly`, says: `${B} to level ${s.def + 1}, in daylight from 16 January, with the frigate. If ${R} means to land and ${B} reaches level 3, it may call the landing off. ${needsApproval(c, s, "show") ? `${M} must approve it first, and the answer is slow.` : `${surname("sato")} can get ${M}’s answer the same day on the hotline.`} Fatigue ${f + 31 + eng}.`, mark: { at: "beacon", text: `Level ${s.def + 1} · frigate, 16 Jan`, tone: "warn" } },
      { id: "hold", name: "Hold as we are", short: "hold as we are", says: `${BN} stands down from 10 January: fatigue ${f} to ${eng}. ${B} gets nothing new and stays at level ${s.def}.`, mark: { at: "beacon", text: `${BN} rests from 10 Jan · ${B} stays level ${s.def}`, tone: "warn" } },
    ],
    council: januaryCouncil(c, s),
    reply: {
      quiet: ["briggs", `Battery at full strength by the 20th. ${R} won’t see it happen.`],
      show: ["briggs", `Frigate sails on the 16th. ${needsApproval(c, s, "show") ? `Not without ${M}’s yes. Talk to ${surname("sato")}.` : `${surname("sato")} is on the hotline now.`}`],
      hold: ["briggs", `We hold at level ${s.def}. If they come, ${B} fights with what it has.`],
    },
  };
}

// The Lattice question. Halden's question is the staff plan; asking anything else uses a
// personal order.
export let LATTICE;
export const latticeQ = (id, month = "dec") => LATTICE[month].find((x) => x.id === id);

function latticeCouncil(c, s, month) {
  const k = s.knows;
  if (month === "dec") {
    const three = c.D.plans.includes("probe");
    return {
      halden: pos("boats", `Ten craft is one battalion. Twelve is a second wave, and that changes what ${B} needs. I want the count.`,
        `knowing whether a second wave is coming`, `we plan ${B}’s defence without knowing how many waves.`),
      briggs: three
        ? pos("who", `Three plans fit what we have. The fishing boats are the tell. Tell me which plan I am digging against.`, `knowing which plan ${R} is following`, `we count boats and still can’t tell a landing from a show.`)
        : pos(c.craft.dec >= 9 ? "when" : "boats", c.craft.dec >= 9 ? `They have enough craft already. I need a date.` : `Count them. Then I know how much headland to dig.`,
          c.craft.dec >= 9 ? `a date to plan ${B}’s defence around` : `knowing how big a landing to plan for`, c.craft.dec >= 9 ? "the battery moves on a guess." : "I dig for a force I haven’t measured."),
      ...(s.support < 60 ? { sato: pos("who", `If those fishing boats are only for the cameras, I can show the ministers the evidence.`, `evidence to steady the ${MA} cabinet`, `the ministers hear only ${R}’s version.`) } : {}),
    };
  }
  return {
    halden: pos("sarn", `The boarding order is the one thing that tells a landing from a show. It comes over ${S}’s harbour net, two days before they sail. Keep my ears on the quay.`,
      `hearing whether troops board`, `when the ships sail, we can’t tell a landing from a show.`),
    okafor: s.fatigue >= 90
      ? pos("when", `Get me the true date early and I stand them down a company at a time until the last week. Twenty fatigue I can’t take off any other way.`, `${BN} rested before February`, `${BN} carries fatigue ${s.fatigue} into February.`)
      : pos("sarn", `${BN} can carry January. I’d rather know whether to send them.`, `${BN} sent only when needed`, "we move the battalion on a guess."),
    briggs: k.date?.planted || !k.date
      ? pos("when", k.date ? `December’s date is one signal. A second source tells me whether to trust it.` : `I have a battery to move and no date to move it by.`, `a date to time ${B}’s defence to`, "the headland stays on alert for a week we can’t name.")
      : pos("sarn", `I have the date. Now I need to know whether they bring soldiers.`, `knowing whether to expect a landing`, `${B} braces for a landing that may be a show.`),
  };
}

export function latticeOrders(c, run, month) {
  const sim = simulate(c, run), s = month === "dec" ? sim.decOrders : sim.janOrders, k = s.knows;
  const qs = LATTICE[month].map((q) => ({ ...q, name: q.q, says: typeof q.means === "function" ? q.means(k) : q.means }));
  return {
    head: LATTICE.head, lead: "halden", staffId: qs.find((q) => q.staff).id,
    plan: month === "dec" ? `will keep ${L} on ${S}’s harbour net and count the landing craft by 27 December.` : `will keep ${L} on ${S}’s harbour net through January, listening for the order that puts troops aboard.`,
    does: month === "dec" ? `A confirmed count, so we know whether ${R} has enough for a second wave.` : `About two days’ warning in February, and whether troops boarded.`,
    cost: month === "dec" ? `Nothing on the fishing boats or the sailing date this month.` : `No sailing date unless we already have one, so ${BN} stays on duty until the ships sail.`,
    question: `What should ${L} listen for in ${MONTH[month]}?`,
    options: qs, council: latticeCouncil(c, s, month), explain: LATTICE.nets,
    reply: Object.fromEntries(qs.map((q) => [q.id, ["halden", q.reply]])),
  };
}

// What the patrol boats do for us, so trading them is a real cost.
let BOATS;

// The ally in January: wait for the vote, or act, depending on what the station order needs.
export function host(c, run) {
  const s = simulate(c, run).janOrders, jb = run.jan?.beacon ?? "quiet";
  const v = votes(s.support), shaky = s.support < 50;
  const answerDay = c.voteDay + 7;
  return {
    head: M,
    staff: ["sato", `will wait for the ${MA} cabinet’s vote on ${c.voteDay} January before we do anything in daylight.`],
    why: `${B} stands on ${MA} land, and we promised to ask before any move ${R} could see. ${c.hotline ? `We have a hotline to its ministers: an answer within hours.` : `Without a hotline, an answer to a new request reaches us on ${answerDay} January.`}`,
    vote: `${v.for} for, ${v.against} against. ${shaky ? `On those numbers the vote on ${c.voteDay} January fails, and ${M}’s navy stays in port in February.` : `On those numbers the vote passes, and ${M}’s navy sails with ours in February.`}`,
    shaky, clash: needsApproval(c, s, jb),
    clashText: c.hotline
      ? `A daylight move on the 16th needs ${M}’s approval. ${surname("sato")} can ask on the hotline today, but at ${v.for} for, the answer is no.`
      : `A daylight move on the 16th needs ${M}’s approval, and without a hotline the answer comes on ${answerDay} January: too late.`,
    ways: [
      { id: "act", name: `Act on the 16th, tell ${M} after`, says: `${c.minister === "hawk" ? `The defence minister will protest, but she wants us seen: ${M}’s navy may still sail if the cabinet holds.` : `${M}’s defence minister has said that if we do, ${M}’s navy stays in port in February.`} Costs the cabinet’s goodwill either way.` },
      { id: "buy", name: "Trade patrol boats for the approval", mark: { at: "lane", text: `Our 2 patrol boats go to ${M}’s navy`, tone: "warn" }, says: `Give ${M} our two spare patrol boats. The ${MA} cabinet approves the move and the navy for February. ${BOATS}` },
      { id: "back", name: `Go back to reinforcing ${B} quietly`, says: `No clash with ${M}. ${B} still reaches level ${s.def + 1}, by night.`, gives: true },
    ],
    secure: { id: "buy", name: "Trade patrol boats for their votes", mark: { at: "lane", text: `Our 2 patrol boats go to ${M}’s navy`, tone: "warn" }, says: `Give ${M} our two spare patrol boats before the vote: the navy sails with ours in February. ${BOATS}` },
    sato: `A frigate off ${B} on the 16th needs ${M}’s yes. ${c.hotline ? `I can call tonight, but at ${v.for} for, I get a no.` : `Without the hotline their answer comes on the ${ord(answerDay)}. Too late. I’ve asked for a hotline twice since October.`}`,
    blocked: `Settle the clash between ${B} and ${M} first. Your other orders are kept.`,
  };
}

// ── incidents, as the desk shows them ───────────────────────────────────────
export function incident(c, run, month) {
  const id = c.incidents[month];
  if (!id) return null;
  const inc = incidentById(id);
  const s = simulate(c, run)[month === "dec" ? "decStart" : "decEnd"];
  return { ...inc, body: inc.text(c, s, c.D.severity), council: inc.council(c, s), staffId: inc.options.find((o) => o.staff).id, date: `${inc.day[month]} ${MONTH[month]}` };
}

// ── the month's log, from the record ───────────────────────────────────────
function eventBeat(c, run, e, rec) {
  const sim = simulate(c, run), s = e.month === "dec" ? sim.decEnd : sim.janEnd, who = e.by === "you" ? "your order" : e.by === "staff-answer" ? "staff answer" : "staff";
  switch (e.kind) {
    case "beacon": {
      const [d0, d1] = e.def, [f0, f1] = e.fatigue;
      const text = {
        quiet: `${e.month === "dec" ? "Two rifle companies and the air-defence battery dug in on the headland, by night." : `${B}’s air-defence battery reached full strength, by night.`} Defences level ${d0} to ${d1}. ${BN}: fatigue ${f0} to ${f1}.`,
        show: `${e.month === "dec" ? "The frigate and two companies exercised off" : "The frigate and two companies arrived off"} ${B} in daylight. Defences level ${d0} to ${d1}. ${BN}: fatigue ${f0} to ${f1}.${e.month === "jan" && run.jan?.way === "act" ? ` We told ${M} the next morning.` : ""}`,
        rest: `${BN} stood down from 18 to 31 December: fatigue ${f0} to ${f1}. ${B} stayed at level ${d1}.`,
        hold: `${BN} stood down from 10 January: fatigue ${f0} to ${f1}. ${B} stayed at level ${d1}.`,
      }[e.option];
      return { at: "beacon", ring: e.option === "rest" || e.option === "hold" ? 190 : e.option === "show" ? 270 : 250, dashed: e.option === "rest" || e.option === "hold", cause: `${day(e)} · ${B}, ${who}`, text };
    }
    case "staff": {
      const text = e.id === "radar" ? `${BN}’s engineers changed the main radar’s cracked waveguide in six days: ${e.fatigue} more fatigue on the battalion.`
        : e.option === "hand" ? `${M}’s security service took the defector. Its summary says he served in ${S}; nothing in it we can check.` : `${surname("halden")}’s people questioned the defector.`;
      return { at: "beacon", cause: `${day(e)} · ${incidentById(e.id).title} · staff handled`, text };
    }
    case "incident": {
      const text = {
        leak: e.option === "brief" ? `We confirmed our numbers to the press. ${MA} papers ran our reasons. ${R} now knows where our guns are: against a landing, ${B} counts one level lower.` : `We said nothing. The story ran for three days, quoted by ${R}’s embassy.`,
        collision: e.option === "search" ? `The fishing boat carried a ${R} navy radio and a log of ${B}’s guns. ${R} called it piracy.` : `The fisherman and his boat went home by morning. ${R} television ran the story for two days.`,
        visit: e.option === "open" ? `${M}’s defence minister toured ${B} in front of the cameras. ${R} has the pictures: against a landing, ${B} counts one level lower.` : `${M}’s defence minister toured ${B} privately. No pictures.`,
      }[e.id];
      return { at: "beacon", cause: `${day(e)} · ${incidentById(e.id).title}, ${who}`, text };
    }
    case "rival": {
      const text = e.month === "dec" ? {
        land: { quiet: `Six ${R} fishing boats came within 30 nautical miles of ${B} and turned back.`, rest: `Six ${R} fishing boats worked the shipping lane, inside our radar cover.`, show: `Two ${R} corvettes began patrolling 12 nautical miles off ${B}.` },
        bluff: { quiet: `${R} television showed its landing craft loading in ${S}, with music.`, rest: `${R} television showed a map with ${B} circled.`, show: `${R}’s press called our exercise a provocation.` },
        probe: { quiet: `A ${R} patrol boat ran along our coast at night with its lights off.`, rest: `A ${R} patrol boat ran along our coast at night and came close to ${B}.`, show: `Two ${R} corvettes began patrolling 12 nautical miles off ${B}.` },
      }[c.plan][e.beacon] : `${R}’s warships and landing craft in ${S} are taking on fuel and stores. They could sail within days.`;
      return { at: "lane", cause: `${day(e)} · ${R}`, text };
    }
    case "rotation":
      return { at: "beacon", cause: `${day(e)} · ${BN}, staff`, text: `With the true date in hand, ${surname("okafor")} stood ${BN} down a company at a time until the last week: ${e.fatigue} less fatigue.${e.corrected ? " December’s date had been planted." : ""}` };
    case "coalition": {
      const text = {
        trade: `${M}’s cabinet approved, as agreed. Our two spare patrol boats now serve in ${M}’s navy, and its navy will sail with ours in February.`,
        hotline: `${surname("sato")} called the ${MA} ministers on the hotline. They approved within hours; ${M}’s navy will sail with ours.`,
        acted: e.navy ? `${M}’s defence minister protested, then said its navy would still sail with ours.` : `${M}’s defence minister withdrew her support. ${M}’s navy stays in port in February.`,
        vote: e.navy ? `The ${MA} cabinet voted ${e.for} for, ${e.against} against: its navy sails with ours in February.` : `The ${MA} cabinet voted ${e.for} for, ${e.against} against: its navy stays in port. We keep ${B}.`,
      }[e.how];
      return { at: "beacon", cause: `${day(e)} · ${M}`, text };
    }
    case "radar-failed":
      return { at: "beacon", cause: `${day(e)} · ${B}`, text: `The main radar failed for good. Against a landing, ${B} now counts one level lower.` };
    default: return null;
  }
}

function intelBeat(i) {
  return { at: i.source.startsWith("lattice") ? "harbour" : "lane", cause: `${day(i)} · ${SOURCE()[i.source]}`, text: intelLine(i), marker: i.source.startsWith("lattice") ? `${L}: ${claimText(i).slice(0, 48)}` : null };
}

// What a month changed, readout by readout.
const changes = (c, before, after) => {
  const a = status(c, before), b = status(c, after);
  return b.map((x, i) => ({ label: x.label, term: x.term, before: a[i].value, after: x.value, tone: x.tone, same: a[i].value === x.value }));
};

export function night(c, run, month) {
  const sim = simulate(c, run), rec = chronicle(c, run), end = rec.logEnd[month];
  const start = { month, day: 1 };
  const inMonth = (x) => x.month === month && dateKey(x) >= dateKey(start) && dateKey(x) <= dateKey(end) + 99;
  const beats = [
    ...rec.events.filter((e) => inMonth(e) && !["exposed", "decision", "sailed", "contact"].includes(e.kind)).map((e) => ({ k: dateKey(e), b: eventBeat(c, run, e, rec) })),
    ...rec.intel.filter((i) => inMonth(i) && !(i.month === "dec" && i.day === 1)).map((i) => ({ k: dateKey(i), b: intelBeat(i) })),
  ].filter((x) => x.b).sort((a, b) => a.k - b.k).map((x) => x.b);
  const s = month === "dec" ? sim.decEnd : sim.janEnd;
  return {
    title: `${MONTH[month]} log`, sub: `Duty log, 1 to ${day(end)}`, beats,
    changes: changes(c, month === "dec" ? sim.decStart : sim.decEnd, s), still: null,
    next: month === "dec" ? `The ${MA} cabinet votes on ${c.voteDay} January. ${surname("sato")} needs your January orders before then.` : `February: you decide how ${B} meets ${R}’s ships when we learn they are moving.`,
    go: month === "dec" ? "Begin January" : "Begin February",
  };
}

// ── February ────────────────────────────────────────────────────────────────
const fightAtSea = { dove: "some ministers will blame us for every sailor lost", firm: "the cabinet will count its losses against us", hawk: "the defence minister will make heroes of them" };

// One requirement, in words, for the risk table and the debrief.
function requirementText(r, chk, s) {
  if (r.key === "defences") return `${B}’s defences at level ${r.need} or more (now level ${chk.def}${s.rivalKnows ? `, one lower because ${R} knows where our guns are` : ""}${s.radarFails ? ", one lower since the radar failed" : ""})`;
  if (r.key === "warning") return `${r.need} (${chk.warned ? "we have it" : "we have none"})`;
  if (r.key === "fit") return `${r.need} (fatigue ${s.fatigue})`;
  return r.need;
}

// The risk of each route for each case still open: one wave or two, troops or none.
function riskRows(c, s, route, boardingKnown) {
  const k = s.knows, rows = [];
  const waves = k.count ? [k.count >= 12] : [false, true];
  const troops = s.plan === "land";
  if (!boardingKnown || troops) for (const big of waves) {
    const chk = landingCheck(c, s, route, big);
    const engaged = route !== "quiet" || chk.warned;
    if (route === "joint") rows.push({ label: big ? "If two waves come" : "If one wave comes", ok: true,
      text: chk.holds ? "Stopped at sea." : `Holds after a battle on the beach: the second wave gets past the navies. To stop it at sea needs ${requirementText(chk.failed[0], chk, s)}.` });
    else rows.push({ label: big ? "If two waves land" : "If one wave lands", ok: chk.holds, text: (chk.holds
      ? `Holds: ${chk.needs.map((r) => requirementText(r, chk, s)).join("; ")}.`
      : `Falls. Needs ${chk.failed.map((r) => requirementText(r, chk, s)).join("; and ")}.`) + (engaged ? ` ${BN} fights: +${BATTLE_DAYS} fatigue.` : ` ${BN} arrives after the fight.`) });
  }
  if (!boardingKnown || !troops) rows.push({ label: "If no troops are aboard", ok: route === "quiet", text: { quiet: "Costs nothing.", forward: `The ${MA} cabinet winces at the pictures of our trenches.`, joint: `The ${MA} cabinet hears we escalated over nothing.` }[route] });
  return rows;
}

export function february(c, run) {
  const s = simulate(c, run).janEnd, rec = chronicle(c, run), d = rec.decision, k = s.knows;
  const known = knownAt(rec, d);
  const boardingKnown = known.boarding && dateKey(known.boarding) >= dateKey({ month: "jan", day: 25 }) && d.source.startsWith("lattice");
  const f = s.fatigue;
  const routes = [{
    id: "quiet", name: "Hold quietly", does: `${B}’s garrison holds the headland. ${BN} waits inland and moves ${warningState(s).key === "none" ? "when the ships are seen" : "on the warning"}.`,
    costs: `If ${BN} fights: +${BATTLE_DAYS} fatigue (${fitText(f + BATTLE_DAYS)}) and casualties.`,
    voice: ["briggs", effectiveDefence(s) >= 3 ? `Level ${effectiveDefence(s)}. One wave, we hold alone.` : `Level ${effectiveDefence(s)}. If they land, I need ${BN} on the headland inside a day.`],
  }, {
    id: "forward", name: `Dig ${BN} in on the headland now`, does: `${BN} goes onto the ${B} headland tonight and digs in before the ships arrive. It needs no warning.`,
    costs: `+${DIG_DAYS} fatigue whatever happens (${fitText(f + DIG_DAYS)}); +${BATTLE_DAYS} more if it fights.`,
    voice: ["okafor", f > FATIGUE.tired ? `Fatigue ${f}. In a trench they’ll hold. I can’t promise for how long.` : `Fatigue ${f}. Put them where the fight will be, and nobody has to run to it.`],
  }];
  if (s.navy) routes.push({
    id: "joint", name: `Stand with ${M}’s navy`, does: `Our frigate and ${M}’s two corvettes block the approach. ${BN} goes in behind them.`,
    costs: `+${JOINT_DAYS} fatigue (${fitText(f + JOINT_DAYS)}). If it comes to shooting, ${fightAtSea[c.minister]}.`,
    voice: ["sato", c.minister === "dove" ? `The navy will sail. Whether the cabinet survives a funeral is another question.` : `Seen together on the water, we’re much harder for ${R} to split apart.`],
  });
  for (const r of routes) r.risk = riskRows(c, s, r.id, boardingKnown);
  const moment = {
    "lattice-boarding": `${L} has just heard ${R} order troops aboard the landing craft in ${S}. They sail in two days.`,
    "lattice-no-boarding": `${R}’s ships in ${S} are raising steam. ${L} has heard no order to put troops aboard.`,
    "patrol-boats": `On the date we had, our patrol boats report ${R}’s ships leaving ${S}. We have no word on whether troops are aboard.`,
    radar: `${B}’s radar has ${R}’s ships coming out of ${S}. They will be off ${B} tonight. We have no word on whether troops are aboard.`,
  }[d.source];
  const waves = k.count ? `${k.count} landing craft, counted ${known.count ? day(known.count) : "earlier"}: ${k.count >= 12 ? "enough for a second wave" : "one wave"}.` : "We never counted the landing craft, so a second wave is possible.";
  return {
    turn: 6, when: dayTime(d),
    halden: `${moment} ${k.count ? `${k.count} craft${k.count >= 12 ? ", enough for a second wave" : ""}.` : "I don’t have a count, so I can’t rule out a second wave."}`,
    warning: [dayTime(d), `${moment} ${waves} ${B}’s defences: ${defenceLabel(effectiveDefence(s))}.`],
    routes,
    notOffered: s.navy ? "" : s.actedAlone
      ? `Standing with ${M}’s navy is off the table: you moved in January without ${M}’s approval, and its navy stays in port.`
      : `Standing with ${M}’s navy is off the table: the ${MA} cabinet voted ${voteText(s.support)}.`,
  };
}

// ── the showdown ────────────────────────────────────────────────────────────
export function showdown(c, run) {
  const o = outcome(c, run), s = o.s, a = o.after;
  const sail = c.sailDay, meet = `${sail + 1} February`;
  const turnedBack = !["held", "repelled", "landed", "lost"].includes(o.code);
  const move = {
    quiet: `${BN} stands by inland, ${o.warned ? "ready to move on the warning" : "with no warning to move on"}.`,
    forward: `${BN} digs in above the beach overnight.`,
    joint: `Our frigate and ${M}’s corvettes form a line across the approach.`,
  }[o.route];
  const contact = {
    stopped: `Shots across the bows. One ${MA} corvette is hit. The landing force turns away.`,
    landed: `The first wave turns at the line. The second slips round it and lands south of ${B}.`,
    held: `About 600 soldiers land below ${B}. ${o.engaged ? `${BN} reaches them on the warning; they are held on the beach.` : `${B}’s guns hold them on the beach; ${BN} arrives after the fight.`}`,
    lost: `They land below ${B}. ${{ defences: o.big ? `Two waves against defences at level ${o.def}: the second comes ashore${o.route === "forward" ? " round the trenches" : ""}.` : `The garrison alone can’t hold them.`, warning: `With no warning, ${BN} is still on the road.`, fit: `${BN} is there, but too worn to hold.`, strength: `${BN} is too few to hold a second wave.` }[o.failed[0]?.key] ?? ""}`,
    repelled: `They land below ${B} and run into ${BN}’s trenches.`,
    faced: `The two navies meet them in daylight. Nobody fires.`,
    waited: `They come within sight of ${B}, look, and stop. Nobody fires.`,
    called: `The two navies meet them. The landing craft are empty.`,
    outlasted: `They sail up and down in front of their own cameras. The landing craft are empty.`,
    dugin: `They come close, see ${BN} in its trenches, and stop.`,
  }[o.code];
  const ended = turnedBack ? `${R}’s ships turn for home. By evening they are back in ${S}.`
    : o.code === "lost" ? `${R}’s flag is over ${B}. ${BN} falls back inland.`
      : `The landing craft that reached the beach never leave it. ${R}’s warships go home.`;
  const v0 = votes(s.support), v1 = votes(o.supportAfter);
  const cabinet = `${MA} cabinet: ${v1.for} for, ${v1.against} against${v1.for === v0.for ? "" : `, ${v1.for > v0.for ? "up" : "down"} from ${v0.for}`}.`;
  const lossText = [o.losses.garrison ? `garrison ${o.losses.garrison} killed or wounded` : "", o.losses.battalion ? `${BN} ${o.losses.battalion}` : ""].filter(Boolean).join("; ");
  const unit = `${BN}: fatigue ${o.daysAfter}.${lossText ? ` Losses: ${lossText}.` : ""}`;
  const strengthAfter = (c.strength ?? W.battalion) - o.losses.battalion;
  return {
    title: "The showdown", sub: `${sail} to ${sail + 2} February`,
    beats: [
      { cause: `${sail} February · ${R}`, text: `${R}’s ships leave ${S} at dawn. ${o.warned ? "We knew they were coming." : "We had no warning."}` },
      { cause: `${sail} February · ${{ quiet: B, forward: BN, joint: `${M}’s navy` }[o.route]}`, text: move },
      { cause: `${meet} · contact`, text: contact },
      { cause: `${meet} · evening`, text: ended },
      { cause: `${sail + 2} February · the cost`, text: `${unit} ${cabinet}` },
    ],
    play: { callouts: [
      [0, "harbour", o.warned ? (o.listening ? `${L}: troops boarding, two days’ warning` : "Patrol boats: seen leaving, on the known date") : "No warning: seen only as they sail", o.warned ? "ok" : "bad"],
      [1, "beacon", `Defences: ${defenceLabel(o.def)}`, o.def >= 3 ? "ok" : o.def >= 2 ? "warn" : "bad"],
      [1, "unit", `Before: fatigue ${s.fatigue}${o.fit ? "" : ", unfit"}`, o.fit ? "ok" : "bad"],
      [2, "beacon", !o.boarded ? "No troops aboard" : o.code === "stopped" ? (o.big ? "Warned: both waves met at sea" : "One wave: turned at sea")
        : o.code === "landed" ? "No warning: the second wave gets past"
          : o.failed.length ? `Needed: ${o.failed.map((r) => ({ defences: `defences ${r.need}`, warning: "warning", fit: "a fit battalion", strength: "full strength" })[r.key]).join(", ")}`
            : o.code === "repelled" ? "Dug in before they landed" : !o.engaged ? "Level 3: held without the battalion" : "Warned, fit, in time", o.code === "lost" || o.code === "landed" ? "bad" : "ok"],
    ], code: o.code, route: o.route, warned: o.warned, craft: c.craft.jan, unitName: BN,
      unitTag: `After: fatigue ${o.daysAfter}${o.losses.battalion ? ` · ${strengthAfter} strong` : ""}`, unitTone: o.kept.battalion ? "ok" : "bad" },
    after: a, go: "To the debrief",
  };
}

// ── memories, from the record ──────────────────────────────────────────────
// What each officer will say about this sector in the next one. Built only from dated events,
// never inferred from a number.
function memories(c, run, rec) {
  const o = rec.outcome, ev = (kind, f = () => true) => rec.events.find((e) => e.kind === kind && f(e)), out = [];
  const add = (who, line, quote) => out.push({ who, line, quote });
  const rest = rec.events.filter((e) => e.rested), rotation = ev("rotation");
  if (rest.length || rotation) {
    const when = [...rest.map((e) => `${day(e.rested.from)} to ${day(e.rested.to)}`), ...(rotation ? ["in rotation through January"] : [])].join(", and ");
    add("okafor", `${BN} stood down ${when}. It ended at fatigue ${o.daysAfter}.`, `At ${B} you stood them down ${when}. I’m asking for the same here.`);
  } else add("okafor", `${BN} never stood down. It ended at fatigue ${o.daysAfter}${o.daysAfter > FATIGUE.unfit ? ": unfit" : ""}.`, `At ${B} they never stood down, and ended at fatigue ${o.daysAfter}. I’d rather not repeat that.`);
  const jq = run.jan?.lattice ?? "sarn", boarding = rec.intel.find((i) => i.claim.kind === "boarding" && i.claim.value === true);
  if (jq !== "sarn") add("halden", `${L} left ${S}’s harbour net in January, so February came without the boarding order${o.boarded ? ", and troops were aboard" : ""}.`, `At ${S} we went into February without the boarding order. I want my ears on the quay.`);
  else add("halden", boarding ? `${L} heard the boarding order on ${day(boarding)}.` : `${L} stayed on ${S}’s harbour net; no boarding order came, and none was given.`, boarding ? `At ${S} the quay gave us two days. Same again.` : `At ${S} the quay told us the truth: nobody boarded.`);
  const coal = ev("coalition");
  const satoLine = { trade: [`Our patrol boats bought ${M}’s approval.`, `We bought ${M}’s approval with boats. Word travels.`],
    hotline: [`${M} approved on the hotline before we moved.`, `${M} approved before we moved. I can say so here.`],
    acted: [`We moved first and told ${M} after.`, `${M} heard about our move after we made it. This government will know that story.`],
    vote: coal.navy ? [`${M}’s cabinet voted ${coal.for} for, ${coal.against} against, and sent its navy.`, `${M} voted for us, ${coal.for} to ${coal.against}. I can build on that.`] : [`${M}’s cabinet voted ${coal.for} for, ${coal.against} against, and kept its navy in port.`, `${M} voted ${coal.for} to ${coal.against} against sending its navy. I don’t want that count again.`] }[coal.how];
  add("sato", satoLine[0] + (o.navyFought && c.minister === "dove" ? ` ${M} lost sailors standing with us.` : ""), satoLine[1]);
  if (ev("radar-failed")) add("briggs", `The radar failed on ${day(ev("radar-failed"))}.`, `The radar failed at ${B}. Not again.`);
  else if (o.code === "lost") add("briggs", `${B} fell on ${day({ month: "feb", day: c.sailDay + 1 })}.`, `We lost ${B}. I’m not losing this one.`);
  else if (["held", "repelled", "landed"].includes(o.code)) add("briggs", `${B} held a landing at level ${o.def}.`, `${B} held a landing at level ${o.def}. I know what a headland can take now.`);
  else add("briggs", `${B} was never tested.`, `${B} was never tested. I still don’t know what a headland like this can take.`);
  return out;
}

// ── the debrief ─────────────────────────────────────────────────────────────
let HAPPENED;
const GRADE = { success: "Success", costly: "Costly success", failure: "Failure" };
let PLAN_TRUTH, ROUTE_ORDER;

function orderedLine(rec, month, run) {
  const parts = rec.events.filter((e) => e.month === month && ["beacon", "incident"].includes(e.kind)).map((e) => {
    const tag = e.by === "you" ? "" : " (staff)";
    if (e.kind === "incident") return `${incidentById(e.id).options.find((o) => o.id === e.option).name}${tag}.`;
    return `${{ quiet: `Strengthen ${B} quietly`, rest: `Rest ${BN}`, show: `Show force openly`, hold: "Hold as we are" }[e.option]}${month === "jan" && e.option === "quiet" ? "" : ""}${tag}.`;
  });
  const q = month === "dec" ? latticeQ(run.dec?.lattice ?? "boats") : latticeQ(run.jan?.lattice ?? "sarn", "jan");
  parts.push(`${L}: ${q.short}${q.staff ? " (staff)" : ""}.`);
  if (month === "jan") { const c = rec.events.find((e) => e.kind === "coalition"); if (c.how === "trade") parts.push("Patrol boats traded."); if (c.how === "acted") parts.push(`Told ${M} after.`); }
  return parts.join(" ");
}

function believedLine(rec, month) {
  const end = month === "dec" ? { month: "dec", day: 31 } : month === "jan" ? rec.logEnd.jan : rec.decision;
  const known = knownAt(rec, end);
  if (month === "feb") return known.boarding ? (known.boarding.claim.value ? `${L} heard troops ordered aboard.` : `${L} heard no boarding order.`) : "We could not tell whether troops were aboard.";
  const items = ["count", "role", "date", "reaction", "plan"].filter((kk) => known[kk] && (month === "dec" || known[kk].month === "jan" || kk === "count")).map((kk) => `${claimText(known[kk])} (${CERTAINTY[known[kk].certainty]})`);
  return items.length ? `${items.join("; ")}.`.replace(/^./, (x) => x.toUpperCase()) : "Nothing new.";
}

export function debrief(c, run) {
  const rec = chronicle(c, run), o = rec.outcome, s = o.s;
  const [title, happened] = HAPPENED[o.code];
  const v = votes(o.supportAfter), f = o.daysAfter, strength = (c.strength ?? W.battalion) - o.losses.battalion;
  const planted = rec.intel.some((i) => !i.truth && dateKey(i) <= dateKey(rec.decision));
  const allyLine = o.kept.ally ? `The ${MA} cabinet backs us, ${v.for} for, ${v.against} against.` : `The ${MA} cabinet is against us, ${v.for} for, ${v.against} against: ${M}’s support is in doubt for the spring.`;
  const battalionLine = `${BN} ends ${o.kept.battalion ? "fit" : "unfit"} at fatigue ${f}${strength < (c.strength ?? W.battalion) ? `, and ${strength} strong after its losses` : ""}.`;
  const req = (r) => requirementText(r, o.check, s);
  const why = o.code === "lost" ? `Why it fell: it needed ${o.failed.map(req).join("; and ")}.`
    : o.code === "held" ? (o.engaged ? `Why it held: ${o.check.needs.map(req).join("; ")}.` : `Why it held: ${B}’s defences at level ${o.def} hold one wave without ${BN}.`)
      : o.code === "repelled" ? `Why it held: ${BN} was dug in before they landed; ${o.check.needs.map(req).join("; ")}.`
        : o.code === "stopped" ? (o.big ? "Why they were stopped: we had warning, so the two navies met both waves at sea." : "Why they were stopped: one wave can be turned back at sea in a single meeting.")
          : o.code === "landed" ? "Why they got ashore: with no warning, the two navies met only the first wave."
            : o.code === "called" || o.code === "dugin" ? "Why it cost us: there were no troops aboard, so the show of strength was spent on a show."
              : "Why no shots were fired: there were no troops aboard to land.";
  const janTruth = s.shift === "bluff-to-land" ? `${R} saw ${M} wavering and turned its show into a real landing plan.`
    : s.shift === "deterred" ? `After the frigate appeared on 16 January, ${R} cancelled its landing order. Its ships sailed without troops.`
      : c.plan === "probe" ? (s.plan === "land" ? `${R}’s scouts found ${B} weak enough, so the landing order went out.` : `${R}’s scouts found ${B} too strong, and no troops boarded.`)
        : c.plan === "land" ? `${R}’s landing plan stayed in place.` : `${R} kept up the show, with no troops behind it.`;
  const halden = o.listening
    ? `${L} stayed on ${S}’s harbour net through January, so when ${R} sailed we knew ${o.boarded ? "troops were aboard" : "no troops had boarded"}.${planted ? " One of our earlier clues was planted; I should have weighted it less." : ""}`
    : `${L} was off ${S}’s harbour in January, so ${o.warned ? "we had the date and the patrol boats, but not the cargo" : "we had neither the boarding order nor the cargo"}.${planted ? " And one of our clues was planted." : ""}`;
  return {
    title, grade: o.grade, gradeName: GRADE[o.grade], after: o.after, why,
    line: `${happened} ${allyLine} ${battalionLine}`,
    score: [
      { label: ST, ok: o.kept.beacon, text: o.kept.beacon ? "Still ours" : "Lost" },
      { label: M, ok: o.kept.ally, text: `${v.for} for, ${v.against} against` },
      { label: BN, ok: o.kept.battalion, text: `${o.kept.battalion ? "Fit" : "Unfit"}, fatigue ${f}${strength < W.battalion ? ` · ${strength} strong` : ""}` },
    ],
    rows: [
      ["December", orderedLine(rec, "dec", run), believedLine(rec, "dec"), planted && rec.intel.some((i) => !i.truth && i.month === "dec") ? `One of our clues was planted: ${R} wanted us to read it as a landing.` : PLAN_TRUTH[c.plan]],
      ["January", orderedLine(rec, "jan", run), `${januaryRead(simulate(c, run).janOrders) ? `We read it as ${READ()[januaryRead(simulate(c, run).janOrders)]}.` : "No reading yet."} ${believedLine(rec, "jan")}`, janTruth],
      ["February", ROUTE_ORDER[o.route], believedLine(rec, "feb"), happened.split(". ")[0].replace(/\.$/, "") + "."],
    ],
    leaves: memories(c, run, rec),
    halden,
    truth: [],
  };
}

export { PLAN_ORDER, OFFICERS };

// Recomputed whenever the theatre changes (see setWorld in src/story/world.js).
onWorld(() => {
  B = W.stationShort; ST = W.station; R = W.rival; M = W.host; MA = W.hostAdj; S = W.harbour; L = W.network; BN = W.reserve;
  TITLE = {
    line: `On 1 December you take command of the defence of ${ST}, our radar post on the ${MA} coast. Across ${W.strait}, ${R} is loading landing craft in ${S}. You have three months.`,
    saved: "Saved this morning. Your December orders have not gone out.",
  };
  ORIENT = [
    ["Your goal", `Keep ${B} in our hands, keep ${M} on our side, and bring ${BN} through fit. All three is a success. Holding ${B} at the cost of one of the others is a costly success. Losing ${B} is a failure.`],
    ["Each month", `A briefing, sometimes a signal that needs your answer, then your orders. Your staff draft every order and handle the rest; you can overrule them twice a month. The month’s log shows what happened.`],
    ["Where you start", `In September your predecessor reinforced ${B} quietly and set up ${L}, our listening posts. In November they ordered the closer look at ${S} that opens your first briefing.`],
  ];
  LATTICE = {
    head: `${L} · radio intercepts`,
    what: `Twelve listening posts along the ${MA} coast that pick up ${R}’s military radio.`,
    nets: `Twelve posts can follow one radio net at a time: ${S}’s harbour net (the boarding order, our two days’ warning), the fleet command net (the sailing date) or the fishing fleet’s. Whatever ${L} listens to, it stops hearing the others.`,
    dec: [
      { id: "boats", q: `How many landing craft are loading in ${S}?`, short: `landing craft in ${S}`, staff: true, mark: { at: "harbour", text: `${L}: counting the landing craft` }, means: `A confirmed count by 27 December: whether ${R} has enough for a second wave. Nothing on the fishing boats or the sailing date.`, reply: `We stay on the quay. You’ll have a count by the 27th.` },
      { id: "who", q: `Who gives orders to ${R}’s fishing fleet?`, short: "who runs the fishing fleet", mark: { at: "lane", text: `${L}: following the fishing fleet` }, means: `Whether the fishing boats are screening a landing, staging a show or scouting ${B}. Likely, not certain: a trail can be laid for us. No new count of the landing craft.`, reply: `Then we follow the fishing boats. I’ll tell you how far I trust what we find.` },
      { id: "when", q: `When does ${R} plan to sail?`, short: `${R}’s sailing date`, mark: { at: "harbour", text: `${L}: fleet net, for the date` }, means: `${R}’s planned date, from one signal on the fleet command net. One signal can be planted. No new count of the landing craft.`, reply: `The fleet net, then. One signal is one signal, General.` },
    ],
    jan: [
      { id: "sarn", q: `Stay on ${S}’s harbour net`, short: `${S}’s harbour net`, staff: true, mark: { at: "harbour", text: `${L}: listening for troops boarding` }, means: `Keeps the two days’ warning: if ${R} orders troops aboard, we hear it before the ships sail, and we know whether this is a landing.`, reply: `My ears stay on the quay.` },
      { id: "when", q: "Listen to the fleet command net for the sailing date", short: "the sailing date", mark: { at: "harbour", text: `${L}: fleet net · no boarding warning`, tone: "warn" }, means: (k) => `${k.date ? `Checks December’s date against a second source, so a planted date is caught. ` : `Gives the true sailing date by 8 January. `}With it, ${surname("okafor")} stands ${BN} down a company at a time: ${DATE_REST} less fatigue. But ${L} stops hearing ${S}’s harbour: in February we won’t know whether troops are aboard. The patrol boats would still see them sail on the date.`, reply: `The fleet net. When they sail, I’ll know the day and not the cargo.` },
      { id: "who", q: "Listen to the fishing fleet", short: "the fishing fleet", mark: { at: "lane", text: `${L}: fishing fleet · no boarding warning`, tone: "warn" }, means: (k) => `${k.role ? "We already have a reading of the fishing boats; this would confirm it. " : `Confirms what the fishing boats are for: a screen for a landing, a show or scouting. `}${L} stops hearing ${S}’s harbour: in February we won’t know whether troops are aboard.`, reply: `The fishing boats, then. We give up the quay for it.` },
    ],
  };
  BOATS = `Without the boats, only ${L} on ${S}’s harbour net would warn us before they arrive.`;
  HAPPENED = {
    stopped: ["Stopped at sea", `${R}’s landing force turned back at sea when it met our frigate and ${M}’s corvettes. No soldier reached the beach.`],
    landed: ["Held, after a landing", `${R}’s second wave slipped past the two navies and landed on the headland. ${B} held, after a battle.`],
    held: ["Held, after a battle", `${R} landed a battalion below ${B} and was held on the beach.`],
    lost: [`${B} lost`, `${R} landed a battalion on the ${B} headland and took the station. Without ${B}, we can’t watch the strait.`],
    faced: ["Faced them down", `${R}’s ships met our frigate and ${M}’s corvettes in daylight and turned back without firing.`],
    waited: ["Held, quietly", `${R}’s ships came within sight of ${B} and turned back. No shots were fired.`],
    repelled: ["Repelled on the beach", `${R} landed a battalion below ${B} and ran into ${BN}, already dug in. The landing failed on the beach.`],
    dugin: ["Dug in, and they turned back", `${R}’s ships found ${BN} dug in on the headland and turned back without landing. ${R}’s press printed the pictures of our trenches.`],
    called: ["Called their bluff, loudly", `There were no troops aboard. We met an empty landing force with two navies, and ${R}’s press is calling it our escalation.`],
    outlasted: ["Waited them out", `There were no troops aboard, and ${R} went home. We never took the bait.`],
  };
  ROUTE_ORDER = { quiet: "Hold quietly.", forward: `Dig ${BN} in on the headland.`, joint: `Stand with ${M}’s navy.` };
  PLAN_TRUTH = {
    land: `${R} had been planning a landing on the ${B} headland since September.`,
    bluff: `${R} never meant to land. The landing craft were for the cameras, to make ${M} ask us to leave.`,
    probe: `${R} planned to test ${B} first and land only if it looked weak.`,
  };
});
