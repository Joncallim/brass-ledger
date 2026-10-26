// Player-safe fixture for the map-room prototype. Every line here is sample copy:
// in the game, the sim's player-safe projection decides what may be said. This file
// only fixes *how* it is said: rank before every name, each officer's own way of
// naming time, and doubt voiced in character rather than as a "what we don't know" list.
//
// Every recommendation is SMART: a named unit or asset, a number, a place and a date.
// Those figures are story dressing invented for this prototype. The sim tracks steps
// (reserve usable, strained, worn out), so a content table must map figures to steps.

// One turn is one month. Six turns run from September to February.
export const CALENDAR = ["September", "October", "November", "December", "January", "February"];
export const monthOf = (turn) => CALENDAR[turn - 1];

// Rank is part of the name everywhere it is shown. `time` lists how each officer refers
// to dates; `doubt` is how they admit uncertainty without sounding unsure.
export const OFFICERS = {
  halden: {
    rank: "Major General", name: "Elias Halden", post: "Intelligence", portrait: "halden",
    from: "British", time: ["since the autumn", "before Christmas", "in the new year"],
    doubt: "Draws a hard line between what he has seen and what he will not guess at.",
    role: "Head of intelligence. Runs Lattice and tells you what Ravellan is doing. Reports only what his people have seen or heard.",
  },
  briggs: {
    rank: "Brigadier General", name: "Mara Briggs", post: "Operations", portrait: "briggs",
    from: "American", time: ["since October", "through Q1", "by end of January"],
    doubt: "States the trade-off and her recommendation, then leaves the call to you.",
    role: "Head of operations. Plans every troop and ship movement, including Beacon’s defences and 2nd Battalion’s duty.",
  },
  okafor: {
    rank: "Rear Admiral", name: "Tunde Okafor", post: "Logistics", portrait: "okafor",
    from: "Nigerian", time: ["since September", "these three months", "before the rains turn"],
    doubt: "Talks in what the troops and ships can stand, never in odds.",
    role: "Head of logistics. Tracks supplies, fuel, and how long a unit can stay on duty before sickness and mistakes set in.",
  },
  sato: {
    rank: "Rear Admiral", name: "Mina Sato", post: "Plans and Marenna", portrait: "sato",
    from: "Japanese", time: ["before the fiscal year closes", "in the new year", "by the end of the month"],
    doubt: "Precise about what the Marennan cabinet has and has not agreed to.",
    role: "Head of plans, and our link to Marenna’s government. Knows exactly what the Marennan cabinet has and has not agreed to.",
  },
  warden: { rank: "Major General", name: "Ruth Warden", post: "Personnel", portrait: "warden", role: "Head of personnel." },
  navarro: { rank: "Brigadier General", name: "Elena Navarro", post: "Force development", portrait: "navarro", role: "Head of force development." },
};
// Names render as their own type: sans, brass, rank a step lighter than the name, so an
// officer reads apart from the words around them. plainName is for labels and aria text.
export const plainName = (id) => `${OFFICERS[id].rank} ${OFFICERS[id].name}`;
const mark = (id, name) => `<span class="officer" data-term="officer:${id}"><span class="rank">${OFFICERS[id].rank}</span> ${name}</span>`;
export const fullName = (id) => mark(id, OFFICERS[id].name);
export const surname = (id) => mark(id, OFFICERS[id].name.split(" ").pop());

// Map places (beacon, harbour, lane) live in the scenario, src/scenarios/; the story only
// names them.

// The world, named. Marenna is the host country; Sarn is Ravellan's main naval harbour.
export const WORLD = {
  host: "Marenna",
  cabinet: "the Marennan cabinet",
  vote: "15 January",
  harbour: "Sarn",
  lattice: "Lattice, our radio-intercept network",
  latticeWhat: "Twelve listening posts along the Marennan coast that pick up Ravellan’s military radio. Each month you can point them at one question. Setting the question does not use a personal order.",
};

// Every highlighted name or term opens one of these on hover or focus. `match` lists the
// exact words that link to it; `kind` sets the style (a proper noun, or a piece of jargon).
// Officers link to their own profile from OFFICERS.
export const GLOSSARY = {
  beacon: {
    title: "Beacon Station", kind: "name", tag: "Our post",
    match: ["Beacon Station", "Beacon"],
    body: "Our radar and radio post on a headland on the Marennan coast. From it we can watch ships in Kestrel Strait up to 30 nautical miles away. Its own garrison is 140 soldiers. Whoever holds Beacon can watch the whole strait, which is why Ravellan wants it.",
  },
  sarn: {
    title: "Sarn", kind: "name", tag: "Ravellan’s main naval harbour",
    match: ["Sarn"],
    body: "Ravellan’s main naval harbour, on the far side of Kestrel Strait, about 30 nautical miles from Beacon. Ravellan’s warships and landing craft are based here. If Ravellan attacks Beacon from the sea, the attack will sail from Sarn.",
  },
  lattice: {
    title: "Lattice", kind: "name", tag: "Our radio-intercept network",
    match: ["Lattice"],
    body: "Twelve listening posts along the Marennan coast, built since September and run by Major General Halden’s intelligence staff. They pick up Ravellan’s military radio. Each month you point Lattice at one question. While it is listening to Sarn, it gives us our warning before an attack.",
  },
  marenna: {
    title: "Marenna", kind: "name", tag: "Our ally and host country",
    match: ["Marennan", "Marenna"],
    body: "The country Beacon Station stands in. We are there with the permission of Marenna’s government, and we promised to ask before any move Ravellan could see. The Marennan cabinet, its senior ministers, votes on 15 January on whether to keep backing us. Marenna has a small navy of two corvettes.",
  },
  ravellan: {
    title: "Ravellan", kind: "name", tag: "The other side",
    match: ["Ravellan"],
    body: "The country across Kestrel Strait. Ravellan claims the waters around Beacon and has been building up its forces in Sarn since September. It has not fired a shot.",
  },
  kestrel: {
    title: "Kestrel Strait", kind: "name", tag: "The sea between",
    match: ["Kestrel Strait"],
    body: "The stretch of sea between Marenna and Ravellan, about 40 nautical miles wide. A busy shipping lane runs through the middle of it.",
  },
  battalion: {
    title: "2nd Battalion", kind: "name", tag: "Our reserve",
    match: ["2nd Battalion"],
    body: "Our reserve infantry battalion, about 600 soldiers, based a day’s move from Beacon. It reinforces Beacon when needed. It has been on duty without rest since September. Rear Admiral Okafor’s rule of thumb: past 100 days, a third of a unit is lost to sickness and mistakes.",
  },
  craft: {
    title: "Landing craft", kind: "term", tag: "Ships",
    match: ["landing craft"],
    body: "Flat-bottomed boats built to carry soldiers and vehicles from the sea straight onto a beach. Nine of them can put one battalion, about 600 soldiers, ashore at once. A country loads them when it is preparing an amphibious landing, or wants others to think it is.",
  },
  landing: {
    title: "Amphibious landing", kind: "term", tag: "An attack from the sea",
    match: ["amphibious landing", "landing"],
    body: "Putting soldiers ashore from ships to seize ground. Here, it would mean Ravellan landing a battalion on the Beacon headland to take the station. The other possibility is that Ravellan only wants us and Marenna to believe a landing is coming, to frighten Marenna into asking us to leave.",
  },
  warning: {
    title: "Warning before an attack", kind: "term", tag: "How much notice we would get",
    match: ["Warning before an attack", "warning before an attack"],
    body: "Before a landing, Ravellan has to order its troops aboard the landing craft in Sarn. Lattice hears that order about two days before they sail. Two days is enough to bring 2nd Battalion to Beacon. If Lattice stops listening to Sarn, we can miss that order and get hours of notice instead of days.",
  },
  frigate: {
    title: "Frigate", kind: "term", tag: "Ship",
    match: ["frigate"],
    body: "Our largest warship in Kestrel Strait. Ravellan can see it from the shore, so using it in daylight is a deliberate signal.",
  },
  corvette: {
    title: "Corvettes", kind: "term", tag: "Ships",
    match: ["corvettes", "corvette"],
    body: "Small warships. Marenna’s navy has two. Ravellan has its own patrolling the strait.",
  },
  battery: {
    title: "Air-defence battery", kind: "term", tag: "Unit",
    match: ["air-defence battery"],
    body: "Anti-aircraft guns and their crews, about 120 soldiers. On Beacon they protect the radar and garrison from air attack, and add radar of their own.",
  },
  hotline: {
    title: "Hotline", kind: "term", tag: "Fast channel",
    match: ["hotline"],
    body: "A direct line to Marenna’s ministers, so they can approve our moves within hours. We never set one up, so every request goes through normal channels and takes about a week.",
  },
  order: {
    title: "Personal order", kind: "term", tag: "Your intervention",
    match: ["personal orders", "personal order"],
    body: "Your staff handle every order unless you step in. Each time you change their plan, you spend one personal order. You have two a month, and changing back returns it.",
  },
};

export const TITLE = {
  line: "You command the defence of Beacon Station, our radar post on the Marennan coast, from September to February. Across Kestrel Strait, Ravellan is building up its forces in Sarn. Your staff handle the everyday orders. You step in when it matters.",
  saved: "Saved this morning. Your December orders have not gone out.",
};

// The campaign as the player has played it so far. Every screen after December reads this,
// so what you see follows from what you ordered. Jumping straight to a chapter uses these.
export const DEFAULT_RUN = () => ({
  dec: { beacon: "rest", lattice: "who" },
  jan: { beacon: "show", way: "buy" },
  feb: { route: "joint" },
});

// Each Lattice question says what its answer would give us, and what asking it costs.
const AWAY = "Lattice stops listening to Sarn this month, so our warning before an attack becomes less reliable.";
const LATTICE_QUESTIONS = [
  { id: "boats", q: "How many landing craft are loading in Sarn?", short: "landing craft in Sarn", staff: true,
    means: "Tells us how big a force Ravellan could land. Keeps Lattice listening to Sarn, so our warning before an attack stays at about two days." },
  { id: "who", q: "Who gives orders to Ravellan’s fishing fleet?", short: "who runs the fishing fleet",
    means: `Tells us whether Ravellan’s fishing boats are part of its military plans. ${AWAY}` },
  { id: "when", q: "When does Ravellan plan to sail?", short: "Ravellan’s sailing date",
    means: `Gives us Ravellan’s planned date, if it has set one. ${AWAY}` },
];
export const latticeQ = (id) => LATTICE_QUESTIONS.find((x) => x.id === id);

// The warning block, worded by whether Lattice kept listening to Sarn in December.
const WARN_FRESH = ["Warning before an attack: about two days", "Lattice is listening to Ravellan’s radio in Sarn. If Ravellan orders troops aboard the landing craft, Lattice will hear it about two days before they sail. That is enough time to bring 2nd Battalion to Beacon."];
const WARN_STALE = ["Warning before an attack: less reliable", "Lattice spent December on another question, so our last close look at Sarn is from 1 December. We would still see Ravellan’s ships leave Sarn. But we could miss the order that puts troops aboard, and that order is what gives us two days. We might get hours instead."];
const WARN_NONE = ["Warning before an attack: none left", "Ravellan’s ships are already at sea, so there is nothing left to warn us of. Our last close look inside Sarn is too old to tell us whether the landing craft carry troops. Until Ravellan acts, we cannot tell a landing from a show of force."];

// Beacon's radar coverage in nautical miles for each ring size the map can draw.
export const COVER_NM = { 190: 20, 250: 30, 270: 32 };

export const DECEMBER = {
  turn: 4,
  brief: {
    title: "Intelligence summary",
    from: `${fullName("halden")}, Intelligence`,
    sections: [
      ["Bottom line", "Ravellan is loading landing craft in Sarn, its main naval harbour, about 30 nautical miles across the strait from Beacon. Lattice counted nine on 1 December. Nine landing craft can put one battalion, about 600 soldiers, ashore at once."],
      ["Assessment", "There are two ways to read this. Ravellan may mean to land that battalion on the Beacon headland and take the station. Or it may only want Marenna’s government to believe a landing is coming, so that Marenna asks us to leave Beacon without a shot fired. Loading landing craft serves both. I will tell you which it is when I see troops boarding them on the quay in Sarn. Not before."],
      ["Watch for", "Ravellan’s fishing boats sailing together with the landing craft, and keeping military hours. Real fishermen don’t do that. If we see it, I will suspect the fishing boats are cover for an amphibious landing, though I would not yet know where."],
    ],
    warning: WARN_FRESH,
  },
  halden: "General. The closer look you ordered in November paid off. Lattice counted nine landing craft in Sarn, loading. That is enough to put a battalion ashore. Whether Ravellan means to use them on Beacon, or only to frighten Marenna, I will tell you when I see troops on the quay. Anyone who tells you sooner is guessing.",
  orders: {
    beacon: {
      head: "Beacon Station",
      lead: "briggs",
      plan: "will move two rifle companies and the air-defence battery onto the Beacon headland by night, in place by 20 December.",
      does: "Beacon could hold for about three weeks against a battalion landed from the sea. That is long enough for reinforcements to arrive.",
      cost: "2nd Battalion works through Christmas, its 95th day on duty without rest. Ravellan will see that Beacon is now defended, though not how strongly.",
      question: "What should Beacon do in December?",
      options: [
        { id: "quiet", name: "Strengthen Beacon quietly", short: "strengthen Beacon quietly", says: "Two rifle companies and the air-defence battery, moved by night, in place by 20 December. 2nd Battalion stays on duty.", staff: true },
        { id: "rest", name: "Rest 2nd Battalion", short: "rest 2nd Battalion", says: "Stand 2nd Battalion down from 18 to 31 December, so it is fit for January. Beacon keeps only its own garrison of 140 soldiers. Its radar range drops from 30 to 20 nautical miles, because the extra radar crews rest too." },
        { id: "show", name: "Show force openly", short: "show force openly", says: "A frigate and two rifle companies exercise off Beacon in daylight from 19 December. Ravellan will see it within a day, and will know we mean to defend Beacon. Marenna’s government has not approved it." },
      ],
      council: {
        briggs: { prefers: "quiet", line: "Two rifle companies and the air-defence battery on the headland by 20 December, moved at night. That holds Beacon for three weeks against a battalion landed from the sea. It costs 2nd Battalion its Christmas. I can live with that." },
        okafor: { prefers: "rest", line: "2nd Battalion has been on duty 94 days. Past 100, I lose a third of them to sickness and mistakes. Stand them down from 18 to 31 December and they are fit for January. Beacon’s own garrison covers the gap." },
        sato: { prefers: "quiet", line: "The Marennan cabinet votes on 15 January on whether to keep backing us at Beacon. If Ravellan photographs us moving troops in daylight, Ravellan’s government will show those photographs to the Marennan ministers before we have told them anything. Keep it quiet until the vote and I can hold the cabinet’s support." },
        halden: { prefers: "show", line: "A move Ravellan can see is a test I can read. Ravellan will see it within 24 hours, and the loading in Sarn will either stop or speed up. If it stops, the landing craft were for show. If it speeds up, Ravellan means to land. Either answer is worth more than what I have today." },
      },
      reply: {
        quiet: ["briggs", "Understood. Companies move on the night of the 18th. In place by the 20th."],
        rest: ["briggs", "Then Beacon runs on 140 soldiers and 20 miles of radar until the 31st. If Ravellan sails in that window, I need two days to get 2nd Battalion back. That’s the trade, General."],
        show: ["briggs", `We can sail the frigate on the 19th. ${surname("sato")} will need to tell Marenna’s government before they read about it in the press.`],
      },
      ring: { rest: 190, show: 270 },
    },
    lattice: {
      head: "Lattice · radio intercepts",
      ask: `${surname("halden")} will point Lattice’s twelve listening posts at one question this month.`,
      what: WORLD.latticeWhat,
      questions: LATTICE_QUESTIONS,
      cost: "Free. This does not use a personal order.",
    },
  },
};

// The night log after December: dated entries, each one leading into the next.
export function decemberNight(run) {
  const b = run.dec.beacon, l = run.dec.lattice;
  const cover = { quiet: 30, rest: 20, show: 32 }[b];
  const away = "Lattice was not listening to Sarn this month.";
  return {
    title: "Night report",
    sub: "Duty log, 18 December to 1 January",
    beats: [
      {
        at: "beacon", ring: { quiet: 250, rest: 190, show: 270 }[b], dashed: b === "rest",
        cause: `18 December · ${b === "quiet" ? "staff, under your direction" : "your order"}`,
        text: {
          quiet: "Two rifle companies and the air-defence battery dug in on the headland. Beacon’s radar still covers 30 nautical miles. 2nd Battalion is now on its 108th day without rest, and Rear Admiral Okafor reports sickness starting to rise.",
          rest: "2nd Battalion stood down until the 31st and is resting. Beacon held with its own 140 soldiers. Its radar now covers 20 nautical miles, down from 30, so ships between 20 and 30 miles out go unwatched.",
          show: "The frigate and two companies exercised off Beacon in daylight. Radar cover held at 32 nautical miles. Marenna’s defence minister found out from the press, not from us, and has complained to Rear Admiral Sato.",
        }[b],
      },
      {
        at: "harbour",
        cause: `27 December · Lattice, ${l === "boats" ? `${surname("halden")}’s question` : "your question"}`,
        text: {
          boats: "Lattice counted eleven landing craft in Sarn, up from nine. Ravellan is adding about one a day. Because Lattice stayed on Sarn, our warning before an attack is still about two days.",
          who: `Lattice traced the orders for Ravellan’s fishing fleet to its navy headquarters in Sarn, not its fisheries ministry. The fishing boats take orders from Ravellan’s navy. ${away}`,
          when: `Lattice picked up a Ravellan navy signal ordering its ships to be ready at sea by 3 February. It is the first date we have. ${away}`,
        }[l],
        marker: `Answered: ${latticeQ(l).short}`,
      },
      {
        at: "lane", cause: "30 December · Ravellan",
        text: {
          quiet: `Six Ravellan fishing boats came within ${cover} nautical miles of Beacon, close enough to see the new guns, and turned back to Sarn. We should assume Ravellan now knows Beacon has been reinforced.`,
          rest: `Six Ravellan fishing boats moved onto the shipping lane, just inside the ${cover} nautical miles Beacon’s radar still covers. Anything further out, we did not see.`,
          show: "Ravellan answered our exercise. Two of its corvettes now patrol 12 nautical miles off Beacon, day and night.",
        }[b],
      },
    ],
    still: l === "boats" ? WARN_FRESH : WARN_STALE,
    next: `The Marennan cabinet votes on 15 January on whether to keep backing us at Beacon. ${surname("sato")} needs your January orders before then.`,
    go: "Begin January",
  };
}

// January's briefing answers the question Lattice was given in December.
export function januaryBrief(run) {
  const l = run.dec.lattice;
  return {
    title: "Intelligence summary",
    from: `${fullName("halden")}, Intelligence`,
    sections: [
      ["Bottom line", {
        boats: "Eleven landing craft in Sarn, and Ravellan adds one a day. At that pace Ravellan will have enough to carry a battalion and its vehicles by 8 February.",
        who: "Ravellan’s fishing boats are sailing together with the landing craft, and keeping military hours. Real fishermen don’t do that. Lattice traced their orders to Ravellan’s navy: 23 boats in all.",
        when: "Ravellan’s navy has ordered its ships to be ready at sea by 3 February. Loading in Sarn should finish by 31 January.",
      }[l]],
      ["Assessment", {
        boats: "Ravellan is building enough landing craft for an amphibious landing on the Beacon headland. It may still use them only as a threat. I will not give you a day, because I do not have one.",
        who: "We suspect the fishing boats are there to cover an amphibious landing, by crowding the strait so our radar cannot pick the landing craft out among them. We do not yet know where Ravellan would land. Beacon is the obvious place, not the only one.",
        when: "Ships ready at sea on 3 February means a landing could come as early as the 4th. Navies also set dates like this for exercises, and an exercise is a good way to hide a real attack. Plan for the 4th.",
      }[l]],
      ["Watch for", "Troops marching from their barracks down to the quay in Sarn. That is the last step before a landing force sails, and the clearest sign that this is an attack and not a threat."],
    ],
    warning: l === "boats" ? WARN_FRESH : WARN_STALE,
    halden: {
      boats: "General. Eleven landing craft, one more every day, enough for a battalion by the 8th of February. That is what a landing needs. When Ravellan will use them, I can’t give you yet.",
      who: "General. Ravellan’s fishing fleet takes orders from its navy in Sarn: 23 boats. That is not fishing. My view: they are there to hide landing craft from our radar. Where Ravellan would land, I can’t yet tell you.",
      when: "General. We have Ravellan’s date: ships ready at sea by 3 February. If you want my view, plan for a landing on the 4th.",
    }[l],
  };
}

export const JANUARY = {
  turn: 5,
  beacon: {
    head: "Beacon Station",
    lead: "briggs",
    plan: "will bring Beacon’s air-defence battery to full strength, by night, by 20 January.",
    does: "Beacon could hold until reinforcements arrive in the first week of February.",
    cost: "2nd Battalion passes 120 days on duty. Rear Admiral Okafor expects a third of it to be sick or unfit by February.",
    question: "What should Beacon do in January?",
    options: [
      { id: "quiet", name: "Reinforce Beacon quietly", short: "reinforce Beacon quietly", says: "Air-defence battery to full strength, moved by night, by 20 January. 2nd Battalion stays on duty.", staff: true },
      { id: "show", name: "Reinforce Beacon openly", short: "reinforce Beacon openly", says: "A frigate and two rifle companies off Beacon in daylight from 16 January. Ravellan will see that we mean to defend Beacon. Marenna’s government must approve it first." },
      { id: "hold", name: "Hold as we are", short: "hold as we are", says: "No new troops. 2nd Battalion rests from 10 January, so it is fit for February. Beacon’s radar stays at its current range." },
    ],
    council: {
      briggs: { prefers: "quiet", line: "Full air defence on Beacon by 20 January, moved at night. That covers us to the first week of February, and Ravellan never sees us do it." },
      okafor: { prefers: "hold", line: "2nd Battalion passes 120 days this month. Rest them from 10 January, or I cannot promise you a fit battalion in February. Beacon already has its guns." },
      sato: { prefers: "quiet", line: "The Marennan cabinet votes on 15 January on whether to keep backing us. If we do anything in daylight before then, the Marennan ministers will hear about it from Ravellan first, and some of them will vote against us. If we stay quiet until the vote, the cabinet backs us." },
      halden: { prefers: "show", line: "Ravellan’s ships could be ready by 3 February. A frigate off Beacon on the 16th gives Ravellan two weeks in which to call off a landing. A quiet reinforcement, Ravellan cannot see, so it changes nothing in Ravellan’s plans." },
    },
    reply: {
      quiet: ["briggs", "Good. Battery at full strength by the 20th. Ravellan won’t see it happen."],
      show: ["briggs", `Frigate sails on the 16th. That’s the day after the Marennan cabinet votes, General. Talk to ${surname("sato")}.`],
      hold: ["briggs", "We hold. If Ravellan comes in early February, Beacon fights with what it has."],
    },
  },
  host: {
    head: "Marenna",
    staff: ["sato", "will wait for the Marennan cabinet’s vote on 15 January before we do anything in daylight."],
    why: "Beacon stands on Marennan land. We promised Marenna’s government we would ask before any move Ravellan could see. Without a hotline to its ministers, Marenna’s answer reaches us on 22 January.",
    cost: "Nothing, if we stay quiet. Anything we did in daylight before the 22nd would be without Marenna’s approval.",
    clash: "A daylight reinforcement on the 16th needs Marenna’s approval, but Marenna’s answer only reaches us on the 22nd. We never set up a hotline to its ministers.",
    ways: [
      { id: "act", name: "Act on the 16th, tell Marenna after", says: "Fast. But Marenna’s defence minister has said that if we do, Marenna will not send its navy to help us in February." },
      { id: "buy", name: "Trade patrol boats for a fast approval", says: "Give Marenna our two spare patrol boats. In return, the Marennan cabinet approves on the 15th, in time for the 16th. We go without those two boats for the rest of the campaign." },
      { id: "back", name: "Go back to reinforcing Beacon quietly", says: "No clash with Marenna. Beacon is still reinforced, but Ravellan doesn’t see it.", gives: true },
    ],
  },
  sato: "General, a frigate off Beacon on the 16th needs Marenna’s approval. Without a hotline, the Marennan cabinet’s answer reaches us on the 22nd. That is six days too late. I have asked for a hotline twice since October.",
  blocked: "Settle the clash between Beacon and Marenna first. Your other orders are kept.",
};

export function januaryNight(run) {
  const { beacon, way } = run.jan;
  const open = beacon === "show";
  return {
    title: "Night report",
    sub: "Duty log, 10 January to 2 February",
    beats: [
      {
        at: "beacon", ring: beacon === "hold" ? 190 : 270, dashed: beacon === "hold",
        cause: `${open ? "16" : beacon === "hold" ? "10" : "20"} January · ${beacon === "quiet" ? "staff, under your direction" : "your order"}`,
        text: {
          quiet: "Beacon’s air-defence battery reached full strength. Its radar covers 32 nautical miles. 2nd Battalion is on its 128th day without rest.",
          hold: "2nd Battalion stood down to rest and will be fit for February. Beacon kept its own guns, and 20 nautical miles of radar.",
          show: way === "act"
            ? "The frigate and two companies arrived off Beacon in daylight. We told Marenna’s government the next morning."
            : "The frigate and two companies arrived off Beacon in daylight, with Marenna’s approval. Ravellan saw them within hours.",
        }[beacon],
      },
      {
        at: "beacon",
        cause: `${open && way === "buy" ? "15" : "22"} January · Marenna`,
        text: !open
          ? "The Marennan cabinet voted to keep backing us. If Ravellan comes, Marenna’s navy will sail with ours."
          : way === "buy"
            ? "The Marennan cabinet approved, as agreed. Our two spare patrol boats now serve in Marenna’s navy, and Marenna’s navy will sail with ours if Ravellan comes."
            : "Marenna’s defence minister withdrew her support. Marenna’s navy will not sail with ours in February.",
      },
      { at: "lane", cause: "1 February · Ravellan", text: "Ravellan’s ships left Sarn at dawn: four warships and the landing craft. They are heading for Beacon." },
    ],
    still: WARN_NONE,
    next: "This is the showdown. You choose how Beacon meets Ravellan’s ships.",
    go: "Begin February: the showdown",
  };
}

// Marenna's approval makes the joint stand possible: by waiting for the vote, or by trading for it.
export const hasJointAuthority = (run) => run.jan.beacon !== "show" || run.jan.way === "buy";

export function february(run) {
  const joint = hasJointAuthority(run);
  const routes = [
    { id: "quiet", name: "Hold quietly", does: "Beacon’s guns and garrison hold the headland. 2nd Battalion stays in reserve, out of sight.", costs: "Ravellan’s press will say we were too afraid to show ourselves. The Marennan ministers read that press, and it makes their next vote on backing us harder to win.", needs: "Beacon’s defences holding for three days on their own, until 2nd Battalion can reach them.", voice: ["briggs", "The guns are dug in. We can hold for three days without showing our hand."] },
  ];
  if (joint) routes.push({
    id: "joint", name: "Stand with Marenna’s navy", does: "Our frigate and Marenna’s two corvettes block the approach in daylight. 2nd Battalion goes in behind them.",
    costs: "2nd Battalion will be worn out by the end of the month and need most of March to recover.",
    needs: run.jan.way === "buy" ? "Marenna’s navy, which Marenna agreed to send in return for our two patrol boats." : "Marenna’s navy, which the Marennan cabinet agreed to send on 15 January.",
    voice: ["sato", "Marenna’s navy sails with ours on the 4th. Seen together on the water, we are much harder for Ravellan to split apart."],
  });
  return {
    turn: 6,
    halden: "Four warships and the landing craft are holding ten miles off Beacon. They have not landed, and they have not turned back. Whatever Ravellan does next, it will do within two days. How Beacon meets them is your call, General.",
    warning: WARN_NONE,
    routes,
    notOffered: joint ? "" : "Standing with Marenna’s navy is off the table. You reinforced Beacon in January without Marenna’s approval, so Marenna’s defence minister has kept its navy in port.",
  };
}

const DEC_ORDER = { quiet: "Beacon strengthened quietly (staff).", rest: "Rest 2nd Battalion.", show: "Show force openly." };
const JAN_ORDER = (j) => j.beacon === "show"
  ? `Reinforce Beacon openly, and ${j.way === "act" ? "tell Marenna after" : "trade patrol boats for Marenna’s approval"}.`
  : j.beacon === "hold" ? "Hold as we are." : "Reinforce Beacon quietly (staff); wait for the Marennan cabinet’s vote.";

export function debrief(run) {
  const joint = run.feb.route === "joint";
  const open = run.jan.beacon === "show";
  return {
    title: joint ? "Won, at a price" : "Held, quietly",
    line: joint
      ? "Beacon held, and Marenna’s navy stood with ours in public, so Marenna goes into the spring more firmly on our side. The cost: 2nd Battalion is worn out and needs most of March to recover, and some Marennan ministers say we provoked Ravellan."
      : "Beacon held, and we never had to fire. With no shots fired, Ravellan has nothing to call an act of war, so the dispute stays with the diplomats, and 2nd Battalion is still fit to fight if Ravellan tries again in the spring. The cost: Ravellan’s press says we were too afraid to show ourselves, and the Marennan cabinet reads it.",
    rows: [
      ["September", "Strengthened Beacon quietly. Set up Lattice.", "Nothing yet worth reporting.", "Ravellan had already begun planning a landing on the Beacon headland."],
      ["November", "A closer look at Sarn.", "Ravellan was either preparing to attack, or bluffing to frighten Marenna.", "Ravellan had the ships and troops to do both at once: pressure Marenna in public, and prepare a real landing."],
      ["December", `${DEC_ORDER[run.dec.beacon]} Lattice: ${latticeQ(run.dec.lattice).short}.`, "Nine, then eleven landing craft loading in Sarn.", "Ravellan was loading one battalion for a landing on Beacon."],
      ["January", JAN_ORDER(run.jan), "A landing looked more likely than a bluff.",
        open ? "After your frigate appeared on 16 January, Ravellan cancelled its landing order. Its ships would sail without troops." : "Ravellan’s landing plan stayed in place. Nothing we did in January could be seen from Sarn."],
      ["February", joint ? "Stand with Marenna’s navy." : "Hold quietly.", "We had no recent look inside Sarn, so we could not tell whether the landing craft carried troops.",
        "Ravellan’s ships came to probe Beacon’s defences first. They found them ready and turned back ten miles out, without landing."],
    ],
    halden: {
      boats: "We counted Ravellan’s landing craft to the last day, so we always knew how big a force it could send. What we never had was the date. When Ravellan sailed on 1 February, it took us by surprise. Next time, ask when.",
      who: "In December we learned the fishing boats work for Ravellan’s navy. That was worth knowing, but it cost us our watch on Sarn. By February we could not tell whether the landing craft carried troops, so you had to decide how to meet them without knowing if this was a landing or a show of force. I asked who. I should have asked when.",
      when: "We had Ravellan’s date, 3 February, and it held, so 2nd Battalion was ready on time. But our last close look inside Sarn was from December. When Ravellan sailed, we could not tell whether the landing craft carried troops, so you had to choose how to meet them without knowing whether a landing was coming.",
    }[run.dec.lattice],
  };
}

// Debrief-only truth layer. Shown only after the campaign ends, never before.
export const TRUTH = [
  { near: "harbour", dx: -160, dy: -55, text: "Really: a landing on Beacon, planned since September" },
  { near: "beacon", dx: 450, dy: 80, text: "February: they came to probe Beacon’s defences, not to land" },
];
