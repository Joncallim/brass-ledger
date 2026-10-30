// Every word the story says, for one world. The facts come from three places only: the
// campaign (what the rival is really doing, revealed only in the debrief), the rules' record
// (simulate, outcome and forecast in play.js) and what each source told us (the intelligence
// in that record). Nothing here infers an event from a number or invents a date.
//
// Voice. Interface text is literal: what an order does, what it costs, in the rules' own
// terms. Officers speak from their jobs, briefly:
//   Briggs (operations): positions, levels and deadlines.
//   Halden (intelligence): sources, dates and how sure he is.
//   Okafor (logistics): readiness and what it costs the soldiers.
//   Sato (plans and the ally): permissions, votes and leverage.
// The ledger and the logs are a factual record. Before the debrief, nothing reads hidden
// truth: an officer's advice depends only on what has been seen and heard, so two campaigns
// that look the same get the same advice.
//
// The words for a world are built once and cached (storyFor). The functions exported at the
// bottom take a campaign and speak in its world, so no shared world state is involved.
import { KESTREL } from "./world.js";
import { CALENDAR, FIXED, TUNING, incidentDay } from "./definition.js";
import { fullName, surname } from "./officers.js";
import { incidentsFor } from "./incidents.js";
import { effectiveDefence, fatigueWord, forecast, ministersFor, needsApproval, outcome, simulate } from "./play.js";
import { chronicle, dateKey, knownAt } from "./chronicle.js";
import { stationDefencePlan } from "./battle.js";

const ord = (x) => `${x}${x % 100 >= 11 && x % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][x % 10] ?? "th"}`;
const MONTH = { dec: "December", jan: "January", feb: "February" };
export const TURN_MONTHS = ["September", "October", "November", "December", "January", "February"];
export const monthOf = (turn) => TURN_MONTHS[turn - 1];
export const PLAN_ORDER = ["quiet", "rest", "show", "hold"];
const day = (d) => `${d.day} ${MONTH[d.month]}`;
const dayTime = (d) => `${day(d)}${d.hour != null ? `, ${String(d.hour).padStart(2, "0")}:00` : ""}`;
const lower = (t) => t[0].toLowerCase() + t.slice(1);
const cap = (t) => t[0].toUpperCase() + t.slice(1);
const FT = TUNING.fatigue, D = FIXED.defence, WAVE = FIXED.secondWave;
const fitText = (f) => (f > FT.unfit ? `unfit at fatigue ${f}` : `${fatigueWord(f)} at fatigue ${f}`);

// What January's briefing reads from what we knew by then. The staff argue from it, and the
// debrief quotes it, so both say what you were actually told. Visible evidence only.
export function januaryRead(s) {
  const k = s.knows;
  if (k.claim) return k.claim.plan;
  if (k.role) return { screen: "land", swarm: "bluff", scout: "probe" }[k.role];
  if (k.date) return { landing: "land", exercise: "bluff", "two-stage": "probe" }[k.date.kind];
  if (k.reaction) return { faster: "land", cameras: "bluff", probing: "probe" }[k.reaction];
  return null;
}

// The two strongest opposing views on a decision, for the "hard call" panel.
export function split(council, staffId) {
  const groups = {};
  for (const [who, p] of Object.entries(council)) (groups[p.prefers] ??= []).push(who);
  const sides = Object.entries(groups).sort((a, b) => b[1].length - a[1].length || (a[0] === staffId ? -1 : b[0] === staffId ? 1 : 0));
  if (sides.length < 2) return { agree: true, side: sides[0], rest: [] };
  return { agree: false, a: sides[0], b: sides[1], rest: sides.slice(2) };
}

// Built level and the level a landing meets, said the same way on every screen.
export const levels = (built, eff) => (built === eff ? `level ${built}` : `level ${eff} against a landing (${built} built)`);

// ─────────────────────────────────────────────────────────────────────────────
const cache = new WeakMap();
export function storyFor(W = KESTREL) {
  if (!cache.has(W)) cache.set(W, build(W));
  return cache.get(W);
}

function build(W) {
  const B = W.stationShort, ST = W.station, R = W.rival, M = W.host, MA = W.hostAdj, S = W.harbour, L = W.network, BN = W.reserve;
  const INC = incidentsFor(W);
  const DEC = CALENDAR.dec, JAN = CALENDAR.jan;

  // ── shared facts, in words ───────────────────────────────────────────────
  const DEF = ["lost", "garrison only", "reinforced", "fully reinforced", "fortified"];
  const defWord = (d) => DEF[Math.max(0, Math.min(4, d))];
  const why = (s) => [s.rivalKnows ? `${R} knows where our guns are` : "", s.radarFails ? "the main radar has failed" : ""].filter(Boolean).join(", and ");
  // The level a landing would meet, with why it is lower than what is built.
  const defenceText = (s) => {
    if (s.def <= 0) return "lost";
    const eff = effectiveDefence(s);
    return eff < s.def ? `level ${eff} against a landing (${s.def} built, but ${why(s)})` : `level ${s.def}, ${defWord(s.def)}`;
  };
  const votes = (support) => { const f = ministersFor(support); return { for: f, against: FIXED.ministers - f }; };
  const voteText = (support) => { const v = votes(support); return `${v.for} for, ${v.against} against`; };
  // Landing craft: one threshold, said one way. Twelve or more carry a second wave.
  const craftWord = (n) => (n >= WAVE ? "enough for a second wave" : "one wave, not enough for a second");
  // What each level's order puts on the headland, and the log's record of it.
  const MOVE = { 2: "move two rifle companies and the air-defence battery onto the headland", 3: "bring the air-defence battery up to full strength", 4: "put the last guns and wire on the headland" };
  const MOVED = { 2: "Two rifle companies and the air-defence battery dug in on the headland", 3: `${B}’s air-defence battery reached full strength`, 4: "The last guns and wire went in on the headland" };

  // How much warning we would get, from what is actually listening or watching. A date from a
  // single signal is said as such: nothing here knows whether it was planted.
  function warningState(s) {
    if (s.warning === "fresh") return { key: "two-days", label: "about two days", tone: "ok" };
    if (s.knows.date && s.boats >= 2) return s.knows.date.confirmed ? { key: "date", label: "on the known date", tone: "ok" } : { key: "date-single", label: "on our one-signal date", tone: "warn" };
    return { key: "none", label: "hours, by radar", tone: "warn" };
  }

  // The rule that decides a landing, stated once, from December, so every screen says the same.
  const RULE = `Against one wave, ${B} holds at defence level ${D.holdsAlone}, or at level ${D.holdsWithReserve} if ${BN} is warned and fit. Against two waves it needs level ${D.holdsAlone}, warning, and ${BN} fit and at full strength. Those are levels against a landing: one lower than what is built if ${R} knows where our guns are, and one lower if the main radar fails.`;

  // The readiness bar along the top. Each value belongs to one officer.
  function status(c, s) {
    const f = s.fatigue, v = votes(s.support), w = warningState(s), eff = s.def <= 0 ? 0 : effectiveDefence(s);
    const strength = c.strength ?? W.battalion;
    return [
      { term: "battalion", label: BN, value: `${f === 0 ? "rested" : `fatigue ${f} · ${fatigueWord(f)}`}${strength < W.battalion ? ` · ${strength} strong` : ""}`, tone: f > FT.unfit || c.understrength ? "bad" : f > FT.tired ? "warn" : "ok", who: "okafor" },
      { term: "marenna", label: `${MA} cabinet`, value: `${v.for} for · ${v.against} against`, tone: v.for < FIXED.majority ? "bad" : v.for < FIXED.majority + 1 ? "warn" : "ok", who: "sato" },
      { term: "defence", label: `${B} defences`, value: s.def <= 0 ? "lost" : eff < s.def ? `level ${eff} · ${s.def} built` : `level ${eff}`, tone: eff >= D.holdsAlone ? "ok" : eff === D.holdsWithReserve ? "warn" : "bad", who: "briggs" },
      { term: "warning", label: "Warning", value: w.label, tone: w.tone, who: "halden" },
    ];
  }

  // ── the title ────────────────────────────────────────────────────────────
  const TITLE = {
    line: `On 1 December you take command of the defence of ${ST}, our radar post on the ${MA} coast. Across ${W.strait}, ${R} is loading landing craft in ${S}. You have three months.`,
    saved: "Saved this morning. Your December orders have not gone out.",
  };
  const ORIENT = [
    ["Your goal", `Keep ${B} in our hands, keep ${M} on our side, and bring ${BN} through fit. All three is a success. Holding ${B} at the cost of one of the others is a costly success. Losing ${B} is a failure.`],
    ["Each month", `A briefing, sometimes a signal that needs your answer, then your orders. Your staff draft every order and handle the rest; you can overrule them twice a month. The month’s log shows what happened.`],
    ["Where you start", `In September your predecessor reinforced ${B} quietly and set up ${L}, our listening posts. In November they ordered the closer look at ${S} that opens your first briefing.`],
  ];

  // ── what we know, from whom, how sure ────────────────────────────────────
  const CERTAINTY = { confirmed: "confirmed", likely: "likely", single: "one signal, unconfirmed", claimed: "one man’s word" };
  const SOURCE = { "lattice-harbour": `${L}, on ${S}’s harbour net`, "lattice-fleet": `${L}, on the fleet command net`, "lattice-fishing": `${L}, on the fishing fleet’s net`, search: "our boarding party", defector: `${M}’s security service, from the defector`, reaction: "what we watched them do", "patrol-boats": "our patrol boats", radar: `${B}’s radar` };
  const ROLE = { screen: "sailing with the landing craft under navy orders, as a screen", swarm: "crowding the shipping lane in daylight, for the cameras", scout: `running along our coast at night, close enough to count ${B}’s guns` };
  const REACTION = { faster: `${R} loaded faster after it saw our frigate`, cameras: `${R}’s television doubled its coverage, and the loading slowed`, probing: `${R}’s patrol boats came close to ${B} at night, twice` };
  function claimText(i) {
    const v = i.claim.value;
    switch (i.claim.kind) {
      case "count": return `${v} landing craft in ${S}: ${craftWord(v)}`;
      case "role": return `${R}’s fishing boats are ${ROLE[v]}`;
      case "date": return v.kind === "exercise" ? `a public naval exercise from ${v.day} February` : v.kind === "two-stage" ? `ships to sea on ${v.day} February, landing craft to follow on command` : `ships ready at sea by ${v.day} February`;
      case "plan": return v === "land" ? "a landing is planned" : v === "bluff" ? "there is no landing, only a threat" : "they will test us first and land only if we look weak";
      case "reaction": return REACTION[v];
      case "boarding": return v ? `${R} has ordered troops aboard the landing craft` : `no order to put troops aboard${i.claim.asOf ? `, as of ${day(i.claim.asOf)}` : ""}`;
      case "sailing": return `${R}’s ships are leaving ${S}`;
      default: return "";
    }
  }
  // Cut at a word, for a chart label.
  const clip = (t, n) => (t.length <= n ? t : `${t.slice(0, t.lastIndexOf(" ", n))}…`);
  const intelLine = (i) => `${cap(claimText(i))}. Source: ${SOURCE[i.source]}, ${day(i)}. ${cap(CERTAINTY[i.certainty])}.`;
  const knownLines = (c, run, date) => Object.values(knownAt(chronicle(c, run), date)).map(intelLine);
  const READ = { land: "a landing", bluff: "a show of force", probe: `a test, then a landing if ${B} looks weak` };

  // ── briefings ────────────────────────────────────────────────────────────
  const pos = (prefers, line, because, risk) => ({ prefers, line, because, risk });
  function brief(c, run, month) {
    const sim = simulate(c, run), rec = chronicle(c, run);
    const s = month === "dec" ? sim.decStart : sim.decEnd;
    const asOf = month === "dec" ? { month: "dec", day: DEC.brief } : { month: "dec", day: 31 };
    const known = knownAt(rec, asOf), k = s.knows;
    // The count Halden quotes is the count in the record, and the record says when it was taken.
    const count = known.count?.claim.value, recounted = known.count && known.count.day !== DEC.count;
    const plans = c.D.plans.includes("probe") ? `a landing on ${B}, a show of force to frighten ${M} into asking us to leave, or a test of ${B} first` : `a landing on ${B}, or a show of force to frighten ${M} into asking us to leave`;
    const read = month === "jan" ? januaryRead(s) : null;
    const unknown = [
      month === "jan" && !recounted ? "how many landing craft there are now" : null,
      "whether troops will board",
      !k.date ? "when they sail" : null,
    ].filter(Boolean);
    const carried = c.war && c.war.sector > 1 && month === "dec" ? ` It comes from the last sector ${c.strength ?? W.battalion} strong.` : "";
    const sections = [
      ["What we know", Object.values(known).map(intelLine).join(" ")],
      ["What we don’t know", `${cap(unknown.join(", "))}. ${month === "dec" ? `What ${R} means to do: ${plans}.` : read ? `Our best reading is ${READ[read]}; nothing has settled it.` : "Nothing yet points to one plan over another."}`],
      ["What it means for your orders", `${RULE} ${B} is now at ${defenceText(s)}; ${BN} is ${fitText(s.fatigue)}.${carried}`],
    ];
    const memory = c.memories?.find((m) => m.who === "halden")?.quote;
    const halden = month === "dec"
      ? `${memory ? `${memory} ` : ""}${count} craft at ${S}: ${craftWord(count)}. I have the numbers, not the intent. The order that puts troops aboard is the one thing that would tell me.`
      : recounted ? `${count} craft at ${S}, counted on the ${ord(known.count.day)}: ${craftWord(count)}. I have the numbers, but not the boarding order.`
        : k.date ? `One date, ${k.date.day} February, from one signal on their fleet net. If it is true, it is the most useful thing I have. If it was meant for us, it is the most dangerous.`
          : k.role ? `Radio orders are harder to fake than pictures. Harder, not impossible. They tell me intent, not timing.`
            : k.reaction ? `What we watched them do points one way. One observation is not a pattern.`
              : `${count} craft at ${S} on 1 December. I have nothing newer, and nothing on intent.`;
    const dissent = month === "dec"
      ? (count >= 9 ? ["briggs", `${count} craft carry a landing whatever they are for. I plan for the landing until someone shows me an empty quay.`] : ["sato", `If this is theatre, the audience is the ${MA} cabinet. They will see our response before ${R} does.`])
      : { land: ["sato", `If we read this as a landing and we are wrong, the ${MA} cabinet will remember who frightened it. They vote on the ${ord(c.voteDay)}.`],
        bluff: ["briggs", `A show can turn into a landing in one night. I want the guns dug in regardless.`],
        probe: ["okafor", `A test goes for whatever looks weakest. That may be my battalion, at fatigue ${s.fatigue}.`],
        open: ["okafor", `Whatever it is, ${BN} has to be fit for it. It is at fatigue ${s.fatigue}.`] }[read ?? "open"];
    return { title: "Intelligence summary", from: `${fullName("halden")}, Intelligence`, sections, warning: null, dissent, halden };
  }

  // ── where each officer stands, and why ───────────────────────────────────
  // In a later sector of a war, each officer opens December's advice with what they remember.
  function remembered(c, council) {
    for (const m of c.memories ?? []) if (council[m.who]) council[m.who] = { ...council[m.who], line: `${m.quote} ${council[m.who].line}` };
    return council;
  }
  const next = (s) => levels(s.def + 1, effectiveDefence(s) + 1);
  const nowLevel = (s) => levels(s.def, effectiveDefence(s));

  function decemberCouncil(c, s) {
    const tired = s.fatigue >= 90, solid = s.support >= 66 && c.minister !== "dove", v = votes(s.support);
    return {
      briggs: pos("quiet", `${cap(MOVE[s.def + 1])} by the ${ord(DEC.quiet)}, by night. That takes ${B} to ${next(s)}.`,
        `${B} at ${next(s)} by ${DEC.quiet} December`, `${B} stays at ${nowLevel(s)}: the garrison alone.`),
      okafor: tired
        ? pos("rest", `Fatigue ${s.fatigue}. Another month on the headland takes them to ${s.fatigue + FIXED.monthOnDuty + s.eng}. Past ${FT.unfit} they can’t hold a landing. Give me ${DEC.rest} to 31 December.`,
          `${BN} fit in February`, `${BN} reaches fatigue ${s.fatigue + FIXED.monthOnDuty + s.eng} by New Year.`)
        : pos("quiet", `Fatigue ${s.fatigue}. They have one more month in them. Not two.`, `using ${BN} while it is fit`, "we rest a battalion that can still work."),
      sato: solid
        ? pos("show", `${v.for} of ${FIXED.ministers} ministers are with us, and the defence minister ${c.minister === "hawk" ? "wants us seen" : "is content"}. A frigate in daylight costs us phone calls, not the vote.`,
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
      briggs: (read === "land" || read === "probe") && eff + 1 >= D.holdsAlone
        ? pos("show", `A frigate and two companies off ${B} on the ${ord(JAN.show)}, in daylight. At ${next(s)}, a landing they can see coming may not come at all.`,
          `${R} seeing a ${B} too strong to attack`, `${R} plans against a ${B} it thinks is thin.`)
        : pos("quiet", `${cap(MOVE[s.def + 1])} by the ${ord(JAN.quiet)}, by night. That takes ${B} to ${next(s)}. ${R} sees nothing.`,
          `${B} at ${next(s)} without a show`, `${B} stays at ${nowLevel(s)}.`),
      okafor: s.fatigue > 90
        ? pos("hold", `Fatigue ${s.fatigue}. Another month takes them to ${s.fatigue + FIXED.monthOnDuty + s.eng}. Stand them down from the ${ord(JAN.hold)} and I can give you a fit battalion in February.`,
          `${BN} fit in February`, `${BN} goes into February at fatigue ${s.fatigue + FIXED.monthOnDuty + s.eng}.`)
        : pos("quiet", `Fatigue ${s.fatigue}. They can carry January.`, `using ${BN} while it is fit`, "we rest troops who can still work."),
      sato: s.support >= 60 && (c.hotline || c.minister === "hawk")
        ? pos("show", c.hotline ? `We have the hotline. With ${v.for} for, I can have their yes within hours.` : `The defence minister wants us seen, and ${v.for} of ${FIXED.ministers} are with us.`,
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

  // ── the month's orders ───────────────────────────────────────────────────
  function orders(c, run, month) {
    const sim = simulate(c, run), s = month === "dec" ? sim.decOrders : sim.janOrders;
    const f = s.fatigue, eng = s.eng ?? 0, onDuty = f + FIXED.monthOnDuty + eng, C = CALENDAR[month], mon = MONTH[month];
    const staffPlan = `will ${MOVE[s.def + 1]} by night, in place by ${C.quiet} ${mon}.`;
    // The full rule is in the briefing; the slip keeps the line this order bears on.
    const does = `${B} goes from ${nowLevel(s)} to ${next(s)}. Level ${D.holdsAlone} against a landing holds one wave without ${BN}.`;
    const council = month === "dec" ? remembered(c, decemberCouncil(c, s)) : januaryCouncil(c, s);
    if (month === "dec") {
      return {
        head: ST, lead: "briggs", staffId: "quiet", plan: staffPlan, does,
        cost: `${BN} works through Christmas: fatigue ${f} to ${onDuty} by the end of December.`,
        question: `What should ${B} do in December?`,
        options: [
          { id: "quiet", name: `Strengthen ${B} quietly`, short: `strengthen ${B} quietly`, says: `${B} to ${next(s)} by ${C.quiet} December, moved by night. ${BN} stays on duty: fatigue ${onDuty} by New Year.`, staff: true, mark: { at: "beacon", text: `Level ${s.def + 1} by ${C.quiet} Dec, by night` } },
          { id: "rest", name: `Rest ${BN}`, short: `rest ${BN}`, says: `${BN} stands down from ${C.rest} to 31 December: fatigue ${f} to ${eng}. ${B} gets nothing new and stays at ${nowLevel(s)}.`, mark: { at: "beacon", text: `${BN} rests · ${B} stays level ${s.def}`, tone: "bad" } },
          { id: "show", name: "Show force openly", short: "show force openly", says: `${B} to ${next(s)}, in daylight from ${C.show} December, with the frigate. ${R} sees it, and how it reacts is a clue to its plan. ${M} has not approved it: ${voteText(s.support)} today, and some will turn. Fatigue ${onDuty}.`, mark: { at: "beacon", text: `Level ${s.def + 1} · frigate in daylight`, tone: "warn" } },
        ],
        council,
        reply: {
          quiet: ["briggs", `Companies move on the night of the ${ord(C.quietStart)}. In place by the ${ord(C.quiet)}.`],
          rest: ["briggs", `Then ${B} stays at ${nowLevel(s)} until January. Understood.`],
          show: ["briggs", `Frigate sails on the ${ord(C.show)}. ${surname("sato")} needs to tell ${M} before they read it.`],
        },
        ring: { rest: 190, show: 270 },
      };
    }
    return {
      head: ST, lead: "briggs", staffId: "quiet", plan: staffPlan, does,
      cost: `${BN} stays on duty: fatigue ${f} to ${onDuty} by the end of January.`,
      question: `What should ${B} do in January?`,
      options: [
        { id: "quiet", name: `Reinforce ${B} quietly`, short: `reinforce ${B} quietly`, says: `${B} to ${next(s)} by ${C.quiet} January, moved by night. Fatigue ${onDuty} by the end of January.`, staff: true, mark: { at: "beacon", text: `Level ${s.def + 1} by ${C.quiet} Jan, by night` } },
        { id: "show", name: `Reinforce ${B} openly`, short: `reinforce ${B} openly`, says: `${B} to ${next(s)}, in daylight from ${C.show} January, with the frigate. If ${R} means to land and the built level reaches ${D.holdsAlone}, it may call the landing off. ${needsApproval(c, s, "show") ? `${M} must approve it first, and the answer is slow.` : `${surname("sato")} can get ${M}’s answer the same day on the hotline.`} Fatigue ${onDuty}.`, mark: { at: "beacon", text: `Level ${s.def + 1} · frigate, ${C.show} Jan`, tone: "warn" } },
        { id: "hold", name: "Hold as we are", short: "hold as we are", says: `${BN} stands down from ${C.hold} January: fatigue ${f} to ${eng}. ${B} gets nothing new and stays at ${nowLevel(s)}.`, mark: { at: "beacon", text: `${BN} rests from ${C.hold} Jan · ${B} stays level ${s.def}`, tone: "warn" } },
      ],
      council,
      reply: {
        quiet: ["briggs", `Done by the ${ord(C.quiet)}, by night. ${R} won’t see it happen.`],
        show: ["briggs", `Frigate sails on the ${ord(C.show)}. ${needsApproval(c, s, "show") ? `Not without ${M}’s yes. Talk to ${surname("sato")}.` : `${surname("sato")} is on the hotline now.`}`],
        hold: ["briggs", `We hold at ${nowLevel(s)}. If they come, ${B} fights with what it has.`],
      },
    };
  }

  // ── the Lattice question ─────────────────────────────────────────────────
  // Halden's question is the staff plan; asking anything else uses a personal order.
  const LATTICE = {
    head: `${L} · radio intercepts`,
    what: `Twelve listening posts along the ${MA} coast that pick up ${R}’s military radio.`,
    nets: `Twelve posts can follow one radio net at a time: ${S}’s harbour net (the boarding order, our two days’ warning), the fleet command net (the sailing date) or the fishing fleet’s. Whatever ${L} listens to, it stops hearing the others.`,
    dec: [
      { id: "boats", q: `How many landing craft are loading in ${S}?`, short: `landing craft in ${S}`, staff: true, mark: { at: "harbour", text: `${L}: counting the landing craft` }, means: `A confirmed count by ${DEC.lattice} December: whether ${R} has enough for a second wave. Nothing on the fishing boats or the sailing date.`, reply: `We stay on the quay. You’ll have a count by the ${ord(DEC.lattice)}.` },
      { id: "who", q: `Who gives orders to ${R}’s fishing fleet?`, short: "who runs the fishing fleet", mark: { at: "lane", text: `${L}: following the fishing fleet` }, means: `Whether the fishing boats are screening a landing, staging a show or scouting ${B}, by ${DEC.lattice} December. Likely, not certain: a trail can be laid for us. No new count of the landing craft.`, reply: `Then we follow the fishing boats. I’ll tell you how far I trust what we find.` },
      { id: "when", q: `When does ${R} plan to sail?`, short: `${R}’s sailing date`, mark: { at: "harbour", text: `${L}: fleet net, for the date` }, means: `${R}’s planned date, from one signal on the fleet command net, by ${DEC.lattice} December. One signal can be planted. No new count of the landing craft.`, reply: `The fleet net, then. One signal is one signal, General.` },
    ],
    jan: [
      { id: "sarn", q: `Stay on ${S}’s harbour net`, short: `${S}’s harbour net`, staff: true, mark: { at: "harbour", text: `${L}: listening for troops boarding` }, means: `Keeps the two days’ warning: if ${R} orders troops aboard, we hear it before the ships sail, and we know whether this is a landing.`, reply: `My ears stay on the quay.` },
      { id: "when", q: "Listen to the fleet command net for the sailing date", short: "the sailing date", mark: { at: "harbour", text: `${L}: fleet net · no boarding warning`, tone: "warn" }, means: (k) => `${k.date ? `Checks December’s date against a second source by ${JAN.date} January, so a planted date is caught. ` : `Gives the true sailing date by ${JAN.date} January. `}With it, ${surname("okafor")} stands ${BN} down a company at a time: ${FT.dateRest} less fatigue. But ${L} stops hearing ${S}’s harbour: in February we won’t know whether troops are aboard. The patrol boats would still see them sail on the date.`, reply: `The fleet net. When they sail, I’ll know the day and not the cargo.` },
      { id: "who", q: "Listen to the fishing fleet", short: "the fishing fleet", mark: { at: "lane", text: `${L}: fishing fleet · no boarding warning`, tone: "warn" }, means: (k) => `${k.roleSure ? "Our boarding party has already confirmed what the fishing boats are for: this adds nothing. " : k.role ? `We already have a reading of the fishing boats; this would confirm it by ${JAN.fishing} January. ` : `Confirms what the fishing boats are for by ${JAN.fishing} January: a screen for a landing, a show or scouting. `}${L} stops hearing ${S}’s harbour: in February we won’t know whether troops are aboard.`, reply: `The fishing boats, then. We give up the quay for it.` },
    ],
  };
  const latticeQ = (id, month = "dec") => LATTICE[month].find((x) => x.id === id);

  function latticeCouncil(c, s, month) {
    const k = s.knows;
    if (month === "dec") {
      const three = c.D.plans.includes("probe");
      return {
        halden: pos("boats", `Twelve craft or more is a second wave, and that changes what ${B} needs. I want the count.`,
          `knowing whether a second wave is coming`, `we plan ${B}’s defence without knowing how many waves.`),
        briggs: three
          ? pos("who", `Three plans fit what we have. The fishing boats are the tell. Tell me which plan I am digging against.`, `knowing which plan ${R} is following`, `we count boats and still can’t tell a landing from a show.`)
          : pos(c.craft.dec >= 9 ? "when" : "boats", c.craft.dec >= 9 ? `They have the craft for one wave already. I need a date.` : `Count them. Then I know how much headland to dig.`,
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
      // On what we hold, not on whether it is true: a date from one signal needs a second source.
      briggs: !k.date || !k.date.confirmed
        ? pos("when", k.date ? `December’s date is one signal. A second source tells me whether to trust it.` : `I have a battery to move and no date to move it by.`, `a date to time ${B}’s defence to`, "the headland stays on alert for a week we can’t name.")
        : pos("sarn", `I have the date. Now I need to know whether they bring soldiers.`, `knowing whether to expect a landing`, `${B} braces for a landing that may be a show.`),
    };
  }

  function latticeOrders(c, run, month) {
    const sim = simulate(c, run), s = month === "dec" ? sim.decOrders : sim.janOrders, k = s.knows;
    const qs = LATTICE[month].map((q) => ({ ...q, name: q.q, says: typeof q.means === "function" ? q.means(k) : q.means }));
    return {
      head: LATTICE.head, lead: "halden", staffId: qs.find((q) => q.staff).id,
      plan: month === "dec" ? `will keep ${L} on ${S}’s harbour net and count the landing craft by ${DEC.lattice} December.` : `will keep ${L} on ${S}’s harbour net through January, listening for the order that puts troops aboard.`,
      does: month === "dec" ? `A confirmed count, so we know whether ${R} has enough for a second wave.` : `About two days’ warning in February, and whether troops boarded.`,
      cost: month === "dec" ? `Nothing on the fishing boats or the sailing date this month.` : `No sailing date unless we already have one, so ${BN} stays on duty until the ships sail.`,
      question: `What should ${L} listen for in ${MONTH[month]}?`,
      options: qs, council: latticeCouncil(c, s, month), explain: LATTICE.nets,
      reply: Object.fromEntries(qs.map((q) => [q.id, ["halden", q.reply]])),
    };
  }

  // What the patrol boats do for us, so trading them is a real cost.
  const BOATS = `Without the boats, only ${L} on ${S}’s harbour net would warn us before they arrive.`;

  // The ally in January: wait for the vote, or act, depending on what the station order needs.
  function host(c, run) {
    const s = simulate(c, run).janOrders, jb = run.jan?.beacon ?? "quiet";
    const v = votes(s.support), shaky = ministersFor(s.support) < FIXED.majority;
    const answerDay = c.voteDay + 7;
    return {
      head: M,
      staff: ["sato", `will wait for the ${MA} cabinet’s vote on ${c.voteDay} January before we do anything in daylight.`],
      why: `${B} stands on ${MA} land, and we promised to ask before any move ${R} could see. ${c.hotline ? `We have a hotline to its ministers: an answer within hours.` : `Without a hotline, an answer to a new request reaches us on ${answerDay} January.`}`,
      vote: `${v.for} for, ${v.against} against. ${shaky ? `On those numbers the vote on ${c.voteDay} January fails, and ${M}’s navy stays in port in February.` : `On those numbers the vote passes, and ${M}’s navy sails with ours in February.`}`,
      shaky, clash: needsApproval(c, s, jb),
      clashText: c.hotline
        ? `A daylight move on the ${ord(JAN.show)} needs ${M}’s approval. ${surname("sato")} can ask on the hotline today, but at ${v.for} for, the answer is no.`
        : `A daylight move on the ${ord(JAN.show)} needs ${M}’s approval, and without a hotline the answer comes on ${answerDay} January: too late.`,
      ways: [
        { id: "act", name: `Act on the ${ord(JAN.show)}, tell ${M} after`, says: `${c.minister === "hawk" ? `The defence minister will protest, but she wants us seen: ${M}’s navy may still sail if the cabinet holds.` : `${M}’s defence minister has said that if we do, ${M}’s navy stays in port in February.`} Costs the cabinet’s goodwill either way.` },
        { id: "buy", name: "Trade patrol boats for the approval", mark: { at: "lane", text: `Our 2 patrol boats go to ${M}’s navy`, tone: "warn" }, says: `Give ${M} our two spare patrol boats. The ${MA} cabinet approves the move and the navy for February by the ${ord(Math.min(c.voteDay, JAN.tradeBy))}. ${BOATS}` },
        { id: "back", name: `Go back to reinforcing ${B} quietly`, says: `No clash with ${M}. ${B} still reaches ${next(s)}, by night.`, gives: true },
      ],
      secure: { id: "buy", name: "Trade patrol boats for their votes", mark: { at: "lane", text: `Our 2 patrol boats go to ${M}’s navy`, tone: "warn" }, says: `Give ${M} our two spare patrol boats before the vote: the navy sails with ours in February. ${BOATS}` },
      sato: `A frigate off ${B} on the ${ord(JAN.show)} needs ${M}’s yes. ${c.hotline ? `I can call tonight, but at ${v.for} for, I get a no.` : `Without the hotline their answer comes on the ${ord(answerDay)}. Too late. I’ve asked for a hotline twice since October.`}`,
      blocked: `Settle the clash between ${B} and ${M} first. Your other orders are kept.`,
    };
  }

  // ── incidents, as the desk shows them ────────────────────────────────────
  function incident(c, run, month) {
    const id = c.incidents[month];
    if (!id) return null;
    const inc = INC.byId(id);
    const s = simulate(c, run)[month === "dec" ? "decStart" : "janDrift"];
    return { ...inc, body: inc.text(c, s, c.D.severity), council: inc.council(c, s), staffId: inc.options.find((o) => o.staff).id, date: `${incidentDay(id, month)} ${MONTH[month]}` };
  }

  // ── the month's log, from the record ─────────────────────────────────────
  // The cabinet count, added to any event that moved it.
  const cabinetTail = (e) => (e.cabinet ? ` ${MA} cabinet: ${e.cabinet.to.for} for, ${e.cabinet.to.against} against, from ${e.cabinet.from.for} for.` : "");
  const exposedNow = `${R} now knows where our guns are: from today ${B} counts one level lower against a landing than what is built.`;
  const RIVAL = {
    "land-quiet": `Six ${R} fishing boats came within 30 nautical miles of ${B} and turned back.`, "land-rest": `Six ${R} fishing boats worked the shipping lane, inside our radar cover.`, "land-show": `Two ${R} corvettes began patrolling 12 nautical miles off ${B}.`,
    "bluff-quiet": `${R} television showed its landing craft loading in ${S}, with music.`, "bluff-rest": `${R} television showed a map with ${B} circled.`, "bluff-show": `${R}’s press called our exercise a provocation.`,
    "probe-quiet": `A ${R} patrol boat ran along our coast at night with its lights off.`, "probe-rest": `A ${R} patrol boat ran along our coast at night and came close to ${B}.`, "probe-show": `Two ${R} corvettes began patrolling 12 nautical miles off ${B}.`,
    loading: `${R}’s warships and landing craft in ${S} are taking on fuel and stores. They could sail within days.`,
  };

  function eventBeat(c, run, e) {
    const who = e.by === "you" ? "your order" : e.by === "staff-answer" ? "staff answer" : "staff";
    switch (e.kind) {
      case "beacon": {
        const [d0, d1] = e.def, [f0, f1] = e.fatigue, x = e.exposedBefore ? FIXED.exposure : 0;
        const lv = d0 === d1 ? `${B} stayed at ${levels(d1, d1 - x)}.` : x ? `Defences level ${d0} to ${d1} built; against a landing, ${d0 - x} to ${d1 - x}.` : `Defences level ${d0} to ${d1}.`;
        const bn = `${BN}: fatigue ${f0} to ${f1}${e.rotated ? ", with the rotation" : ""}.`;
        const text = {
          quiet: `${MOVED[d1]}, by night. ${lv} ${bn}`,
          show: `The frigate and two companies ${e.month === "dec" ? "exercised" : "arrived"} off ${B} in daylight. ${lv} ${bn}${e.actedAlone ? ` We told ${M} the next morning.` : ""}`,
          rest: `${BN} stood down from ${day(e.rested?.from ?? e)} to ${day(e.rested?.to ?? e)}: fatigue ${f0} to ${f1}. ${lv}`,
          hold: `${BN} stood down from ${day(e.rested?.from ?? e)}: fatigue ${f0} to ${f1}. ${lv}`,
        }[e.option];
        return { at: "beacon", ring: e.option === "rest" || e.option === "hold" ? 190 : e.option === "show" ? 270 : 250, dashed: e.option === "rest" || e.option === "hold", cause: `${day(e)} · ${B}, ${who}`, text };
      }
      case "staff": {
        const text = e.id === "radar" ? `${BN}’s engineers changed the main radar’s cracked waveguide in six days: ${e.fatigue} more fatigue on the battalion.`
          : e.option === "hand" ? `${M}’s security service took the defector. Its summary says he served in ${S}; nothing in it we can check.` : `${surname("halden")}’s people questioned the defector.`;
        return { at: "beacon", cause: `${day(e)} · ${INC.byId(e.id).title} · staff handled`, text };
      }
      case "incident": {
        if (e.id === "radar") return { at: "beacon", cause: `${day(e)} · ${INC.byId(e.id).title}, ${who}`, text: e.option === "run" ? "We kept the main radar running on its cracked waveguide." : `${BN}’s engineers changed the waveguide: ${e.fatigue} more fatigue on the battalion.` };
        if (e.id === "defector") return { at: "beacon", cause: `${day(e)} · ${INC.byId(e.id).title}, ${who}`, text: e.option === "talk" ? `${surname("halden")}’s people took the defector for questioning.` : `${M}’s security service took the defector.` };
        const text = {
          leak: e.option === "brief" ? `We confirmed our numbers to the press. ${MA} papers ran our reasons. ${exposedNow}` : `We said nothing. The story ran for three days, quoted by ${R}’s embassy.`,
          collision: e.option === "search" ? `The fishing boat carried a ${R} navy radio and a log of ${B}’s guns. ${R} called it piracy.` : `The fisherman and his boat went home by morning. ${R} television ran the story for two days.`,
          visit: `${M}’s defence minister will visit ${B} on the ${ord(JAN.visit)}, ${e.option === "open" ? "with cameras" : "without cameras"}.`,
        }[e.id];
        return { at: "beacon", cause: `${day(e)} · ${INC.byId(e.id).title}, ${who}`, text };
      }
      case "visit":
        return { at: "beacon", cause: `${day(e)} · ${M}’s defence minister at ${B}`, text: e.option === "open" ? `She toured ${B} in front of the cameras. ${R} has the pictures. ${exposedNow}` : `She toured ${B} privately. No pictures.` };
      case "rival":
        return { at: "lane", cause: `${day(e)} · ${R}`, text: RIVAL[e.behaviour] };
      case "cabinet":
        return { at: "beacon", cause: `${day(e)} · ${MA} cabinet`, text: `${surname("sato")}’s count: ${e.to.for} for, ${e.to.against} against, from ${e.from.for} for, ${e.from.against} against. Ministers moved for reasons we can’t pin down.` };
      case "rotation":
        return { at: "beacon", cause: `${day(e)} · ${BN}, staff`, text: e.fatigue
          ? `With the true date in hand, ${surname("okafor")} began standing ${BN} down a company at a time until the last week: ${e.fatigue} less fatigue over January.${e.corrected ? " The fleet net’s date differs from December’s signal, which was wrong." : ""}`
          : `With the true date in hand, ${surname("okafor")} had nothing to take off: ${BN} was already standing down.${e.corrected ? " The fleet net’s date differs from December’s signal, which was wrong." : ""}` };
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
        return { at: "beacon", cause: `${day(e)} · ${B}`, text: `The main radar failed for good. From today ${B} counts one level lower against a landing than what is built.` };
      default: return null;
    }
  }

  const intelBeat = (i) => ({ at: i.source.startsWith("lattice") ? "harbour" : "lane", cause: `${day(i)} · ${SOURCE[i.source]}`, text: intelLine(i), marker: i.source.startsWith("lattice") ? clip(cap(claimText(i)), 52) : null });

  // What a month changed, readout by readout.
  const changes = (c, before, after) => {
    const a = status(c, before), b = status(c, after);
    return b.map((x, i) => ({ label: x.label, term: x.term, before: a[i].value, after: x.value, tone: x.tone, same: a[i].value === x.value }));
  };

  function night(c, run, month) {
    const sim = simulate(c, run), rec = chronicle(c, run), end = rec.logEnd[month];
    const inMonth = (x) => x.month === month && dateKey(x) <= dateKey({ ...end, hour: 23 });
    const beats = [
      ...rec.events.filter((e) => inMonth(e) && !["decision", "sailed", "moved", "contact"].includes(e.kind)).map((e) => { const b = eventBeat(c, run, e); return { k: dateKey(e), b: b && { ...b, text: b.text + cabinetTail(e) } }; }),
      ...rec.intel.filter((i) => inMonth(i) && !(i.month === "dec" && i.day === DEC.count)).map((i) => ({ k: dateKey(i), b: intelBeat(i) })),
    ].filter((x) => x.b).sort((a, b) => a.k - b.k).map((x) => x.b);
    const s = month === "dec" ? sim.decEnd : sim.janEnd;
    return {
      title: `${MONTH[month]} log`, sub: `Duty log, 1 to ${day(end)}`, beats,
      changes: changes(c, month === "dec" ? sim.decStart : sim.decEnd, s), still: null,
      next: month === "dec" ? `The ${MA} cabinet votes on ${c.voteDay} January. ${surname("sato")} needs your January orders by the ${ord(JAN.orders)}.` : `February: you decide how ${B} meets ${R}’s ships when we learn they are moving.`,
      go: month === "dec" ? "Begin January" : "Begin February",
    };
  }

  // ── February ─────────────────────────────────────────────────────────────
  const fightAtSea = { dove: "some ministers will blame us for every sailor lost", firm: "the cabinet will count its losses against us", hawk: "the defence minister will make heroes of them" };

  // One requirement, in words, for the forecast and the debrief.
  function requirementText(r, chk, s, past = false) {
    if (r.key === "defences") return `${B}’s defences at level ${r.need} or more against a landing (${past ? "they were at" : "now"} ${chk.def}${chk.def < s.def ? `, with ${s.def} built: ${why(s)}` : ""})`;
    if (r.key === "warning") return `${r.need} (${chk.warned ? (past ? "we had it" : "we have it") : (past ? "we had none" : "we have none")})`;
    if (r.key === "fit") return `${r.need} (${BN} at fatigue ${s.fatigue})`;
    return r.need;
  }
  const RESULT = {
    held: (r) => (r.engaged ? `Holds, with ${BN} on the beach` : `Holds without ${BN}`),
    repelled: () => `Holds: they land into ${BN}’s trenches`,
    stopped: () => "Stopped at sea",
    landed: () => `The second wave gets past the navies and lands; ${BN} fights it on the beach and holds`,
    lost: () => "Falls",
  };
  const caseLabel = (h, route, merged) => (h.troops ? (route === "joint" ? (h.big ? "If two waves come" : "If one wave comes") : h.big ? "If two waves land" : "If one wave lands")
    : merged ? "If no troops are aboard" : h.show ? "If no troops are aboard, as a show for the cameras" : "If no troops are aboard, and they turn back");
  // One forecast row: the result, why, and what it leaves (the same numbers the result will show).
  function caseRow(c, s, route, h, merged) {
    const r = h.r, v0 = votes(s.support), v1 = votes(r.supportAfter);
    const result = RESULT[r.code]?.(r) ?? "No fight";
    const reqs = h.troops && route !== "joint" ? (r.check.holds ? ` Needs ${r.check.needs.map((x) => requirementText(x, r.check, s)).join("; ")}: met.` : ` Needs ${r.failed.map((x) => requirementText(x, r.check, s)).join("; and ")}.`)
      : h.troops && route === "joint" && !r.check.holds ? ` To stop both at sea needs ${requirementText(r.failed[0], r.check, s)}.` : "";
    const loss = [r.losses.garrison ? `garrison ${r.losses.garrison} killed or wounded` : "", r.losses.battalion ? `${BN} ${r.losses.battalion}` : ""].filter(Boolean).join(", ");
    const bn = `${BN} ends ${fitText(r.daysAfter)}${r.engaged ? ", after fighting" : r.battle ? ", arriving after the fight" : ""}.`;
    const cab = v1.for !== v0.for ? ` ${MA} cabinet: ${v1.for} for, ${v1.against} against.` : !h.troops && route !== "quiet" ? ` ${MA} cabinet unmoved.` : "";
    return { id: h.id, label: caseLabel(h, route, merged), ok: r.grade === "success", tone: r.grade === "success" ? "ok" : r.grade === "costly" ? "warn" : "bad",
      text: `${result}.${reqs} ${bn}${loss ? ` Losses: ${loss}.` : ""}${cab}`, code: r.code, daysAfter: r.daysAfter, supportAfter: r.supportAfter, losses: r.losses, engaged: r.engaged };
  }
  // The rows for one route: the empty cases merge when they come to the same thing.
  function routeRows(c, s, rt) {
    const empties = rt.cases.filter((h) => !h.troops);
    const effect = (h) => JSON.stringify([h.r.daysAfter, h.r.supportAfter, h.r.losses, h.r.grade]);
    const same = empties.length === 2 && effect(empties[0]) === effect(empties[1]);
    const list = same ? rt.cases.filter((h) => h.troops || h.show) : rt.cases;
    return list.map((h) => ({ ...caseRow(c, s, rt.route, h, same && !h.troops), codes: same && !h.troops ? empties.map((e) => e.r.code) : [h.r.code] }));
  }
  // The fatigue a route can leave, from its rows: the cost line says the same as the rows.
  function costLine(rows) {
    const quiet = rows.filter((r) => !r.engaged).map((r) => r.daysAfter), fought = rows.filter((r) => r.engaged).map((r) => r.daysAfter);
    const a = [...new Set(quiet)], b = [...new Set(fought)];
    const part = (xs) => xs.map((f) => fitText(f)).join(" or ");
    if (!b.length) return `${BN} ends ${part(a)}.`;
    if (!a.length) return `${BN} fights and ends ${part(b)}.`;
    return `${BN} ends ${part(a)}, or ${part(b)} if it fights.`;
  }

  function february(c, run) {
    const F = forecast(c, run), s = F.s, d = F.decision, rec = chronicle(c, run);
    const known = knownAt(rec, d), count = known.count?.claim.value, countRecent = known.count && known.count.day !== DEC.count;
    const wn = warningState(s);
    const base = {
      quiet: { name: "Hold quietly", does: `${B}’s garrison holds the headland. ${BN} waits inland and moves ${d.source === "radar" ? "when the ships are seen" : "on the warning"}.`,
        voice: ["briggs", effectiveDefence(s) >= D.holdsAlone ? `${cap(nowLevel(s))}. One wave, we hold alone.` : `${cap(nowLevel(s))}. If they land, I need ${BN} on the headland inside a day.`] },
      forward: { name: `Dig ${BN} in on the headland now`, does: `${BN} goes onto the ${B} headland tonight and digs in before the ships arrive. It needs no warning. +${FT.dig} fatigue whatever happens.`,
        voice: ["okafor", s.fatigue > FT.tired ? `Fatigue ${s.fatigue}. In a trench they’ll hold. I can’t promise for how long.` : `Fatigue ${s.fatigue}. Put them where the fight will be, and nobody has to run to it.`] },
      joint: { name: `Stand with ${M}’s navy`, does: `Our frigate and ${M}’s two corvettes block the approach. ${BN} goes in behind them: +${FT.joint} fatigue. If it comes to shooting, ${fightAtSea[c.minister]}.`,
        voice: ["sato", c.minister === "dove" ? `The navy will sail. Whether the cabinet survives a funeral is another question.` : `Seen together on the water, we’re much harder for ${R} to split apart.`] },
    };
    const routes = F.routes.map((rt) => { const risk = routeRows(c, s, rt); return { id: rt.route, ...base[rt.route], risk, costs: costLine(risk) }; });
    const moment = {
      "lattice-boarding": `${L} has just heard ${R} order troops aboard the landing craft in ${S}. They sail in two days.`,
      "lattice-no-boarding": `${R}’s ships in ${S} are raising steam. ${L} has heard no order to put troops aboard.`,
      "patrol-boats": `On the date we had, our patrol boats report ${R}’s ships leaving ${S}. We have no word on whether troops are aboard.`,
      radar: `${B}’s radar has ${R}’s ships coming out of ${S}. They will be off ${B} tonight. We have no word on whether troops are aboard.`,
    }[d.source];
    const waves = countRecent ? `${count} landing craft, counted ${day(known.count)}: ${craftWord(count)}.` : `Our last count is ${count} landing craft, on 1 December: there may be more now, so a second wave is possible.`;
    return {
      turn: 6, when: dayTime(d), source: d.source, warning: [dayTime(d), `${moment} ${waves} ${B}’s defences: ${defenceText(s)}.`],
      halden: `${moment} ${countRecent ? `${count} craft, counted on the ${ord(known.count.day)}: ${craftWord(count)}.` : "I have no recent count, so I can’t rule out a second wave."}`,
      routes, warningState: wn,
      notOffered: s.navy ? "" : s.actedAlone
        ? `Standing with ${M}’s navy is off the table: you moved in January without ${M}’s approval, and its navy stays in port.`
        : `Standing with ${M}’s navy is off the table: the ${MA} cabinet voted ${voteText(s.support)}.`,
    };
  }

  // ── the showdown ─────────────────────────────────────────────────────────
  function showdown(c, run) {
    const o = outcome(c, run), s = o.s, a = o.after;
    const sail = c.sailDay, meet = `${sail + 1} February`;
    const lv = levels(s.def, o.def);
    const move = {
      quiet: `${BN} stands by inland, ${o.warned ? "ready to move on the warning" : "with no warning to move on"}.`,
      forward: `${BN} digs in above the beach overnight.`,
      joint: `Our frigate and ${M}’s corvettes form a line across the approach.`,
    }[o.route];
    const contact = {
      stopped: `Shots across the bows. One ${MA} corvette is hit. The landing force turns away.`,
      landed: `The first wave turns at the line. The second slips round it and lands south of ${B}; ${BN} meets it on the beach.`,
      held: `About ${W.battalion} soldiers land below ${B}. ${o.engaged ? `${BN} reaches them on the warning; they are held on the beach.` : `${B}’s guns hold them on the beach; ${BN} arrives after the fight.`}`,
      lost: `They land below ${B}. ${{ defences: o.big ? `Two waves against defences at ${lv}: the second comes ashore${o.route === "forward" ? " round the trenches" : ""}.` : `Defences at ${lv} can’t hold them.`, warning: `With no warning, ${BN} is still on the road.`, fit: `${BN} is there, but too worn to hold.`, strength: `${BN} is too few to hold a second wave.` }[o.failed[0]?.key] ?? ""}`,
      repelled: `They land below ${B} and run into ${BN}’s trenches.`,
      faced: `The two navies meet them in daylight. Nobody fires.`,
      waited: `They come within sight of ${B}, look, and stop. Nobody fires.`,
      called: `The two navies meet them. The landing craft are empty.`,
      outlasted: `They sail up and down in front of their own cameras. The landing craft are empty.`,
      dugin: `They come close, see ${BN} in its trenches, and stop.`,
    }[o.code];
    const ended = !o.battle ? `${R}’s ships turn for home. By evening they are back in ${S}.`
      : o.code === "lost" ? `${R}’s flag is over ${B}. ${BN} falls back inland.`
        : `The landing craft that reached the beach never leave it. ${R}’s warships go home.`;
    const v0 = votes(s.support), v1 = votes(o.supportAfter);
    const cabinet = `${MA} cabinet: ${v1.for} for, ${v1.against} against${v1.for === v0.for ? "" : `, ${v1.for > v0.for ? "up" : "down"} from ${v0.for}`}.`;
    const lossText = [o.losses.garrison ? `garrison ${o.losses.garrison} killed or wounded` : "", o.losses.battalion ? `${BN} ${o.losses.battalion}` : ""].filter(Boolean).join("; ");
    const strengthAfter = (c.strength ?? W.battalion) - o.losses.battalion;
    // The labels say how we knew, from the decision in the record, never from the plan.
    const heard = { "lattice-boarding": [`${L}: troops boarding, two days’ warning`, "ok"], "lattice-no-boarding": [`${L}: no boarding order heard`, "ok"],
      "patrol-boats": ["Patrol boats: seen leaving on the known date", "ok"], radar: ["No warning: seen only as they sail", "bad"] }[o.decision.source];
    const deciding = !o.boarded ? "No troops aboard" : o.code === "stopped" ? (o.big ? "Warned: both waves met at sea" : "One wave: turned at sea")
      : o.code === "landed" ? `No warning: the second wave gets past; ${BN} holds the beach`
        : o.failed.length ? `Needed: ${o.failed.map((r) => ({ defences: `defences ${r.need} against a landing`, warning: "warning", fit: "a fit battalion", strength: "full strength" })[r.key]).join(", ")}`
          : o.code === "repelled" ? "Dug in before they landed" : !o.engaged ? `Level ${o.def}: held without the battalion` : "Warned, fit, in time";
    const callouts = [
      [0, "harbour", heard[0], heard[1]],
      [1, "station", `Defences: ${lv}`, o.def >= D.holdsAlone ? "ok" : o.def >= D.holdsWithReserve ? "warn" : "bad"],
      [1, "unit", `Before: fatigue ${s.fatigue}${o.fit ? "" : ", unfit"}`, o.fit ? "ok" : "bad"],
      [2, "contact", deciding, o.code === "lost" ? "bad" : o.code === "landed" ? "warn" : "ok"],
    ];
    const unitTag = `After: fatigue ${o.daysAfter}${o.losses.battalion ? ` · ${strengthAfter} strong` : ""}`, unitTone = o.kept.battalion ? "ok" : "bad";
    return {
      title: "The showdown", sub: `${sail} to ${sail + 2} February`,
      beats: [
        { cause: `${sail} February · ${R}`, text: `${R}’s ships leave ${S} at dawn. ${o.warned ? "We knew they were coming." : "We had no warning."}` },
        { cause: `${sail} February · ${{ quiet: B, forward: BN, joint: `${M}’s navy` }[o.route]}`, text: move },
        { cause: `${meet} · contact`, text: contact },
        { cause: `${meet} · evening`, text: ended },
        { cause: `${sail + 2} February · the cost`, text: `${BN}: fatigue ${o.daysAfter}.${lossText ? ` Losses: ${lossText}.` : ""} ${cabinet}` },
      ],
      play: { ...stationDefencePlan(o, { craft: c.craft.jan, unitName: BN, unitTag, unitTone, callouts }), callouts, unitTag, unitTone, unitName: BN, route: o.route, code: o.code, warned: o.warned },
      after: a, go: "To the debrief",
    };
  }

  // ── memories, from the record ────────────────────────────────────────────
  // What each officer will say about this sector in the next one. Built only from recorded
  // facts, never inferred from a number.
  function memories(c, run, rec) {
    const o = rec.outcome, ev = (kind, f = () => true) => rec.events.find((e) => e.kind === kind && f(e)), out = [];
    const add = (who, line, quote) => out.push({ who, line, quote });
    const rest = rec.events.filter((e) => e.rested), rotation = ev("rotation", (e) => e.fatigue > 0);
    if (rest.length || rotation) {
      const when = [...rest.map((e) => `${day(e.rested.from)} to ${day(e.rested.to)}`), ...(rotation ? ["in rotation through January"] : [])].join(", and ");
      add("okafor", `${BN} stood down ${when}. It ended at fatigue ${o.daysAfter}.`, `At ${B} you stood them down ${when}. I’m asking for the same here.`);
    } else add("okafor", `${BN} never stood down. It ended at fatigue ${o.daysAfter}${o.daysAfter > FT.unfit ? ": unfit" : ""}.`, `At ${B} they never stood down, and ended at fatigue ${o.daysAfter}. I’d rather not repeat that.`);
    const jq = run.jan?.lattice ?? "sarn", boarding = rec.intel.find((i) => i.claim.kind === "boarding" && i.claim.value === true);
    if (jq !== "sarn") add("halden", `${L} left ${S}’s harbour net in January, so February came without the boarding order${o.boarded ? ", and troops were aboard" : ""}.`, `At ${S} we went into February without the boarding order. I want my ears on the quay.`);
    else add("halden", boarding ? `${L} heard the boarding order on ${day(boarding)}.` : `${L} stayed on ${S}’s harbour net; no boarding order came, and none was given.`, boarding ? `At ${S} the quay gave us two days. Same again.` : `At ${S} the quay told us the truth: nobody boarded.`);
    const coal = ev("coalition");
    const satoLine = { trade: [`Our patrol boats bought ${M}’s approval.`, `We bought ${M}’s approval with boats. Word travels.`],
      hotline: [`${M} approved on the hotline before we moved.`, `${M} approved before we moved. I can say so here.`],
      acted: [`We moved first and told ${M} after.`, `${M} heard about our move after we made it. This government will know that story.`],
      vote: coal.navy ? [`${M}’s cabinet voted ${coal.for} for, ${coal.against} against, and sent its navy.`, `${M} voted for us, ${coal.for} to ${coal.against}. I can build on that.`] : [`${M}’s cabinet voted ${coal.for} for, ${coal.against} against, and kept its navy in port.`, `${M} voted ${coal.for} to ${coal.against} against sending its navy. I don’t want that count again.`] }[coal.how];
    add("sato", satoLine[0] + (o.navyFought && c.minister === "dove" ? ` ${M} lost sailors standing with us.` : ""), satoLine[1]);
    const lv = levels(o.s.def, o.def);
    if (ev("radar-failed")) add("briggs", `The radar failed on ${day(ev("radar-failed"))}.`, `The radar failed at ${B}. Not again.`);
    else if (o.code === "lost") add("briggs", `${B} fell on ${day({ month: "feb", day: c.sailDay + 1 })}.`, `We lost ${B}. I’m not losing this one.`);
    else if (o.battle) add("briggs", `${B} held when they landed, with defences at ${lv}.`, `${B} held when they landed, at ${lv}. I know what a headland can take now.`);
    else add("briggs", `${B} was never tested.`, `${B} was never tested. I still don’t know what a headland like this can take.`);
    return out;
  }

  // ── the debrief ──────────────────────────────────────────────────────────
  const GRADE = { success: "Success", costly: "Costly success", failure: "Failure" };
  const HAPPENED = {
    stopped: ["Stopped at sea", `${R}’s landing force turned back at sea when it met our frigate and ${M}’s corvettes. No soldier reached the beach.`],
    landed: ["Held, after a landing", `${R}’s second wave slipped past the two navies and landed on the headland. ${BN} fought it on the beach, and ${B} held.`],
    held: ["Held, after a battle", `${R} landed a battalion below ${B} and was held on the beach.`],
    lost: [`${B} lost`, `${R} landed a battalion on the ${B} headland and took the station. Without ${B}, we can’t watch the strait.`],
    faced: ["Faced them down", `${R}’s ships met our frigate and ${M}’s corvettes in daylight and turned back without firing.`],
    waited: ["Held, quietly", `${R}’s ships came within sight of ${B} and turned back. No shots were fired.`],
    repelled: ["Repelled on the beach", `${R} landed a battalion below ${B} and ran into ${BN}, already dug in. The landing failed on the beach.`],
    dugin: ["Dug in, and they turned back", `${R}’s ships found ${BN} dug in on the headland and turned back without landing. ${R}’s press printed the pictures of our trenches.`],
    called: ["Called their bluff, loudly", `There were no troops aboard. We met an empty landing force with two navies, and ${R}’s press is calling it our escalation.`],
    outlasted: ["Waited them out", `There were no troops aboard, and ${R} went home. We never took the bait.`],
  };
  const ROUTE_ORDER = { quiet: "Hold quietly.", forward: `Dig ${BN} in on the headland.`, joint: `Stand with ${M}’s navy.` };
  const PLAN_TRUTH = {
    land: `${R} had been planning a landing on the ${B} headland since September.`,
    bluff: `${R} never meant to land. The landing craft were for the cameras, to make ${M} ask us to leave.`,
    probe: `${R} planned to test ${B} first and land only if it looked weak.`,
  };
  const ORDER_NAME = { dec: { quiet: `Strengthen ${B} quietly`, rest: `Rest ${BN}`, show: "Show force openly" }, jan: { quiet: `Reinforce ${B} quietly`, show: `Reinforce ${B} openly`, hold: "Hold as we are" } };

  function orderedLine(rec, month, run) {
    const parts = rec.events.filter((e) => e.month === month && ["beacon", "incident"].includes(e.kind)).map((e) => {
      const tag = e.by === "you" ? "" : " (staff)";
      if (e.kind === "incident") return `${INC.byId(e.id).options.find((o) => o.id === e.option).name}${tag}.`;
      return `${ORDER_NAME[month][e.option]}${tag}.`;
    });
    const q = month === "dec" ? latticeQ(run.dec?.lattice ?? "boats") : latticeQ(run.jan?.lattice ?? "sarn", "jan");
    parts.push(`${L}: ${q.short}${q.staff ? " (staff)" : ""}.`);
    if (month === "jan") { const co = rec.events.find((e) => e.kind === "coalition"); if (co.how === "trade") parts.push("Patrol boats traded."); if (co.how === "acted") parts.push(`Told ${M} after.`); }
    return parts.join(" ");
  }

  function believedLine(rec, month) {
    const end = month === "dec" ? { month: "dec", day: 31 } : month === "jan" ? rec.logEnd.jan : rec.decision;
    const known = knownAt(rec, end);
    if (month === "feb") return known.boarding ? (known.boarding.claim.value ? `${L} heard troops ordered aboard.` : `${L} heard no boarding order.`) : "We could not tell whether troops were aboard.";
    const items = ["count", "role", "date", "reaction", "plan", ...(month === "jan" ? ["boarding"] : [])].filter((kk) => known[kk] && (month === "dec" || known[kk].month === "jan")).map((kk) => `${claimText(known[kk])} (${CERTAINTY[known[kk].certainty]})`);
    return items.length ? cap(`${items.join("; ")}.`) : "Nothing new.";
  }

  function debrief(c, run) {
    const rec = chronicle(c, run), o = rec.outcome, s = o.s;
    const [title, happened] = HAPPENED[o.code];
    const v = votes(o.supportAfter), f = o.daysAfter, strength = (c.strength ?? W.battalion) - o.losses.battalion;
    const planted = rec.intel.some((i) => !i.truth && dateKey(i) <= dateKey(rec.decision));
    const allyLine = o.kept.ally ? `The ${MA} cabinet backs us, ${v.for} for, ${v.against} against.` : `The ${MA} cabinet is against us, ${v.for} for, ${v.against} against: ${M}’s support is in doubt for the spring.`;
    const battalionLine = `${BN} ends ${o.kept.battalion ? "fit" : "unfit"} at fatigue ${f}${strength < (c.strength ?? W.battalion) ? `, and ${strength} strong after its losses` : ""}.`;
    const req = (r) => requirementText(r, o.check, s, true);
    const lv = levels(s.def, o.def);
    const whyLine = o.code === "lost" ? `Why it fell: it needed ${o.failed.map(req).join("; and ")}.`
      : o.code === "held" ? (o.engaged ? `Why it held: ${o.check.needs.map(req).join("; ")}.` : `Why it held: defences at ${lv} hold one wave without ${BN}.`)
        : o.code === "repelled" ? `Why it held: ${BN} was dug in before they landed; ${o.check.needs.map(req).join("; ")}.`
          : o.code === "stopped" ? (o.big ? "Why they were stopped: we had warning, so the two navies met both waves at sea." : "Why they were stopped: one wave can be turned back at sea in a single meeting.")
            : o.code === "landed" ? `Why they got ashore: with no warning, the two navies met only the first wave. Under this campaign’s rule, ${BN} holds a second wave that gets past the navies.`
              : o.code === "called" || o.code === "dugin" ? "Why it cost us: there were no troops aboard, so the show of strength was spent on a show."
                : "Why no shots were fired: there were no troops aboard to land.";
    const janTruth = s.shift === "bluff-to-land" ? `${R} saw ${M} wavering and turned its show into a real landing plan.`
      : s.shift === "deterred" ? `After the frigate appeared on ${JAN.show} January, ${R} cancelled its landing order. Its ships sailed without troops.`
        : c.plan === "probe" ? (s.plan === "land" ? `${R}’s scouts found ${B} weak enough, so the landing order went out.` : `${R}’s scouts found ${B} too strong, and no troops boarded.`)
          : c.plan === "land" ? `${R}’s landing plan stayed in place.` : `${R} kept up the show, with no troops behind it.`;
    const halden = o.listening
      ? `${L} stayed on ${S}’s harbour net through January, so when ${R} sailed we knew ${o.boarded ? "troops were aboard" : "no troops had boarded"}.${planted ? " One of our earlier clues was planted; I should have weighted it less." : ""}`
      : `${L} was off ${S}’s harbour in January, so ${o.warned ? "we had the date and the patrol boats, but not the cargo" : "we had neither the boarding order nor the cargo"}.${planted ? " And one of our clues was planted." : ""}`;
    const read = januaryRead(simulate(c, run).janOrders);
    return {
      title, grade: o.grade, gradeName: GRADE[o.grade], after: o.after, why: whyLine,
      line: `${happened} ${allyLine} ${battalionLine}`,
      score: [
        { label: ST, ok: o.kept.beacon, text: o.kept.beacon ? "Still ours" : "Lost" },
        { label: M, ok: o.kept.ally, text: `${v.for} for, ${v.against} against` },
        { label: BN, ok: o.kept.battalion, text: `${o.kept.battalion ? "Fit" : "Unfit"}, fatigue ${f}${strength < W.battalion ? ` · ${strength} strong` : ""}` },
      ],
      rows: [
        ["December", orderedLine(rec, "dec", run), believedLine(rec, "dec"), planted && rec.intel.some((i) => !i.truth && i.month === "dec") ? `One of our clues was planted: ${R} wanted us to read it as a landing.` : PLAN_TRUTH[c.plan]],
        ["January", orderedLine(rec, "jan", run), `${read ? `We read it as ${READ[read]}.` : "No reading yet."} ${believedLine(rec, "jan")}`, janTruth],
        ["February", ROUTE_ORDER[o.route], believedLine(rec, "feb"), `${happened.split(". ")[0].replace(/\.$/, "")}.`],
      ],
      leaves: memories(c, run, rec),
      halden, truth: [],
    };
  }

  return { W, TITLE, ORIENT, LATTICE, RULE, latticeQ, status, brief, orders, latticeOrders, host, incident, night, february, showdown, debrief, knownLines, defenceText, intelLine, claimText };
}

// ── the public API: each takes the campaign and speaks in its world ─────────
const of = (c) => storyFor(c.world);
export const status = (c, s) => of(c).status(c, s);
export const brief = (c, run, month) => of(c).brief(c, run, month);
export const orders = (c, run, month) => of(c).orders(c, run, month);
export const latticeOrders = (c, run, month) => of(c).latticeOrders(c, run, month);
export const latticeQ = (c, id, month) => of(c).latticeQ(id, month);
export const host = (c, run) => of(c).host(c, run);
export const incident = (c, run, month) => of(c).incident(c, run, month);
export const night = (c, run, month) => of(c).night(c, run, month);
export const february = (c, run) => of(c).february(c, run);
export const showdown = (c, run) => of(c).showdown(c, run);
export const debrief = (c, run) => of(c).debrief(c, run);
export const knownLines = (c, run, date) => of(c).knownLines(c, run, date);
