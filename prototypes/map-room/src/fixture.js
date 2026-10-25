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
  },
  briggs: {
    rank: "Brigadier General", name: "Mara Briggs", post: "Operations", portrait: "briggs",
    from: "American", time: ["since October", "through Q1", "by end of January"],
    doubt: "States the trade-off and her recommendation, then leaves the call to you.",
  },
  okafor: {
    rank: "Rear Admiral", name: "Tunde Okafor", post: "Logistics", portrait: "okafor",
    from: "Nigerian", time: ["since September", "these three months", "before the rains turn"],
    doubt: "Talks in what the troops and ships can stand, never in odds.",
  },
  sato: {
    rank: "Rear Admiral", name: "Mina Sato", post: "Plans and Marenna", portrait: "sato",
    from: "Japanese", time: ["before the fiscal year closes", "in the new year", "by the end of the month"],
    doubt: "Precise about what the Marennan cabinet has and has not agreed to.",
  },
  warden: { rank: "Major General", name: "Ruth Warden", post: "Personnel", portrait: "warden" },
  navarro: { rank: "Brigadier General", name: "Elena Navarro", post: "Force development", portrait: "navarro" },
};
// Names render as their own type: sans, brass, rank a step lighter than the name, so an
// officer reads apart from the words around them. plainName is for labels and aria text.
export const plainName = (id) => `${OFFICERS[id].rank} ${OFFICERS[id].name}`;
const mark = (id, name) => `<span class="officer"><span class="rank">${OFFICERS[id].rank}</span> ${name}</span>`;
export const fullName = (id) => mark(id, OFFICERS[id].name);
export const surname = (id) => mark(id, OFFICERS[id].name.split(" ").pop());

// Map anchors in world pixels (the chart is 1840 × 944, placed at 40, 96).
export const PLACES = {
  beacon: { x: 700, y: 520 },
  harbour: { x: 1340, y: 345 },
  lane: { x: 940, y: 470 },
};

// The world, named. Marenna is the host country; Sarn is Ravellan's main harbour.
export const WORLD = {
  host: "Marenna",
  cabinet: "the Marennan cabinet",
  vote: "15 January",
  harbour: "Sarn",
  lattice: "Lattice, our radio-intercept network",
  latticeWhat: "Twelve listening posts along the Marennan coast, built since September. It answers one question a month and does not use a personal order.",
};

export const TITLE = {
  line: "You command the defence of Beacon Station from September to February. Your staff handle the everyday orders. You step in when it matters.",
  saved: "Saved this morning. Your December orders have not gone out.",
};

// The campaign as the player has played it so far. Every screen after December reads this,
// so what you see follows from what you ordered. Jumping straight to a chapter uses these.
export const DEFAULT_RUN = () => ({
  dec: { beacon: "rest", lattice: "who" },
  jan: { beacon: "show", way: "buy" },
  feb: { route: "joint" },
});

const LATTICE_QUESTIONS = [
  { id: "boats", q: "How many landing craft are loading in Sarn?", short: "landing craft in Sarn", staff: true },
  { id: "who", q: "Who gives orders to their fishing fleet?", short: "who runs the fishing fleet" },
  { id: "when", q: "When do they plan to sail?", short: "their sailing dates" },
];
export const latticeQ = (id) => LATTICE_QUESTIONS.find((x) => x.id === id);

// Beacon's radar coverage in nautical miles for each ring size the map can draw.
export const COVER_NM = { 190: 20, 250: 30, 270: 32 };

export const DECEMBER = {
  turn: 4,
  brief: {
    title: "Intelligence summary",
    from: `${fullName("halden")}, Intelligence`,
    sections: [
      ["Bottom line", "Ravellan is loading landing craft in Sarn, its main harbour. Lattice counted nine on 1 December."],
      ["Assessment", "That is a landing force for one battalion, about 600 troops. I will tell you whether they mean to use it when I see troops on the quay. Not before."],
      ["Watch for", "Their fishing fleet working with the landing craft. Fishermen do not keep military hours."],
    ],
    warning: ["Early warning: yes", "Lattice has eyes on Sarn. A sailing would give us at least two days’ notice."],
  },
  halden: "General. The closer look you ordered in November paid off: nine landing craft in Sarn, loading. Anyone who tells you what Ravellan means by it is guessing. I don’t guess.",
  orders: {
    beacon: {
      head: "Beacon Station",
      lead: "briggs",
      plan: "will move two rifle companies and the air-defence battery onto the Beacon headland by night, in place by 20 December.",
      does: "Beacon can hold about three weeks against a battalion landing.",
      cost: "2nd Battalion works through Christmas, its 95th straight day. Ravellan will see Beacon is guarded.",
      question: "What should Beacon do in December?",
      options: [
        { id: "quiet", name: "Strengthen Beacon quietly", short: "strengthen Beacon quietly", says: "Two rifle companies and the air-defence battery, by night, in place by 20 December. 2nd Battalion stays on duty.", staff: true },
        { id: "rest", name: "Rest 2nd Battalion", short: "rest 2nd Battalion", says: "Stand 2nd Battalion down 18–31 December. Beacon keeps only its own 140-strong garrison. Radar cover drops from 30 to 20 miles." },
        { id: "show", name: "Show force openly", short: "show force openly", says: "A frigate and two companies exercise off Beacon in daylight from 19 December. Ravellan sees it within a day. Marenna has not approved it." },
      ],
      council: {
        briggs: { prefers: "quiet", line: "Two rifle companies and the air-defence battery on the headland by 20 December, moved at night. That holds Beacon for three weeks against a battalion. It costs 2nd Battalion its Christmas. I can live with that." },
        okafor: { prefers: "rest", line: "2nd Battalion has been on duty 94 days. Past 100, I lose a third of them to sickness and mistakes. Stand them down from 18 to 31 December and they are fit for January. Beacon’s own garrison covers the gap." },
        sato: { prefers: "quiet", line: "Anything Ravellan can photograph goes to the Marennan cabinet before we have told them. Keep it quiet until they vote on 15 January and I can hold their support." },
        halden: { prefers: "show", line: "A visible move tells me something. Ravellan will see it within 24 hours, and the loading in Sarn either stops or speeds up. Either answer is worth more than what I have today." },
      },
      reply: {
        quiet: ["briggs", "Understood. Companies move on the night of the 18th. In place by the 20th."],
        rest: ["briggs", "Then Beacon runs on 140 troops and 20 miles of radar until the 31st. If they sail in that window, I have two days to get 2nd Battalion back. That’s the trade, General."],
        show: ["briggs", `We can sail the frigate on the 19th. ${surname("sato")} will need to tell Marenna before the papers do.`],
      },
      ring: { rest: 190, show: 270 },
    },
    lattice: {
      head: "Lattice · radio intercepts",
      ask: `${surname("halden")} will task the twelve listening posts with one question this month.`,
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
  return {
    title: "Night report",
    sub: "Duty log, 18 December to 1 January",
    beats: [
      {
        at: "beacon", ring: { quiet: 250, rest: 190, show: 270 }[b], dashed: b === "rest",
        cause: `18 December · ${b === "quiet" ? "staff, under your direction" : "your order"}`,
        text: {
          quiet: "Two rifle companies and the air-defence battery dug in on the headland. Beacon’s radar still sees 30 miles. 2nd Battalion is now on its 108th day without rest.",
          rest: "2nd Battalion stood down until the 31st. Beacon held on its own 140 troops. Its radar now sees 20 miles, down from 30.",
          show: "The frigate and two companies exercised off Beacon in daylight. Radar cover held at 32 miles. Marenna’s defence minister read about it in the papers.",
        }[b],
      },
      {
        at: "harbour",
        cause: `27 December · Lattice, ${l === "boats" ? `${surname("halden")}’s question` : "your question"}`,
        text: {
          boats: "Lattice counted eleven landing craft in Sarn, up from nine. They are loading about one a day.",
          who: "Lattice traced the fishing fleet’s orders to Ravellan’s navy in Sarn, not its fisheries ministry. Those boats now answer to admirals.",
          when: "Lattice caught a signal setting “readiness at sea” for 3 February. That is their date.",
        }[l],
        marker: `Answered: ${latticeQ(l).short}`,
      },
      {
        at: "lane", cause: "30 December · Ravellan",
        text: {
          quiet: `Six of their fishing boats came within ${cover} miles of Beacon, saw the new guns, and turned back to Sarn.`,
          rest: `Six of their fishing boats moved onto the shipping lane, just inside the ${cover} miles Beacon can still watch.`,
          show: "Ravellan answered our exercise: two corvettes now patrol 12 miles off Beacon, around the clock.",
        }[b],
      },
    ],
    still: l === "boats"
      ? ["Early warning: yes, and fresh", "Lattice watched Sarn on the 27th. A sailing still gives us two days’ notice."]
      : ["Early warning: still yes", "Our 1 December count in Sarn still stands. It is getting old."],
    next: `Marenna’s cabinet votes on 15 January on whether to back us. ${surname("sato")} needs your January orders before then.`,
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
        boats: "Eleven landing craft in Sarn, loading at one a day. At that pace they are ready by 8 February.",
        who: "Ravellan’s navy runs the fishing fleet. 23 boats are on naval call and can screen a landing.",
        when: "Their own signal sets 3 February for “readiness at sea”. Loading should finish by 31 January.",
      }[l]],
      ["Assessment", {
        boats: "This is a landing plan for one battalion. I will not give you the day, because I do not have it.",
        who: "That is a military operation wearing civilian clothes. Whether it ends in a landing or a squeeze, nobody can tell you yet. I won’t pretend to.",
        when: "That is the shape of a landing. Exercises are how you hide one. Plan for 3 February.",
      }[l]],
      ["Watch for", "Troops marching down to the quay at Sarn. That is the last step before they sail."],
    ],
    warning: l === "boats" ? ["Early warning: yes", "Lattice saw Sarn on 27 December. Two days’ notice of a sailing."] : ["Early warning: yes, but ageing", "Our last count in Sarn is from 1 December."],
    halden: {
      boats: "General. Eleven craft, one more every day, ready by the 8th of February. I’ll call it a landing plan. The day they sail, I won’t call.",
      who: "General. Their fishing fleet takes orders from the navy in Sarn: 23 boats. That is not a fishing fleet. What they mean to do with it, I can’t yet tell you.",
      when: "General. We have their date: 3 February, at sea. If you want my view, plan for a landing on the 4th.",
    }[l],
  };
}

export const JANUARY = {
  turn: 5,
  beacon: {
    head: "Beacon Station",
    lead: "briggs",
    plan: "will bring Beacon’s air-defence battery to full strength, by night, by 20 January.",
    does: "Beacon can hold until reinforcements arrive in early February.",
    cost: "2nd Battalion passes 120 days on duty.",
    question: "What should Beacon do in January?",
    options: [
      { id: "quiet", name: "Reinforce Beacon quietly", short: "reinforce Beacon quietly", says: "Air-defence battery to full strength by night, by 20 January. 2nd Battalion stays on duty.", staff: true },
      { id: "show", name: "Reinforce Beacon openly", short: "reinforce Beacon openly", says: "Frigate and two companies in daylight from 16 January. Ravellan sees we mean it. Needs Marenna’s yes first." },
      { id: "hold", name: "Hold as we are", short: "hold as we are", says: "No new troops. 2nd Battalion rests from 10 January. Beacon’s radar stays at its current range." },
    ],
    council: {
      briggs: { prefers: "quiet", line: "Full air defence on Beacon by 20 January, moved at night. That covers us to the first week of February without anyone watching us do it." },
      okafor: { prefers: "hold", line: "2nd Battalion passes 120 days this month. Rest them from 10 January or I cannot promise you them in February. Beacon has its guns already." },
      sato: { prefers: "quiet", line: "The cabinet votes on 15 January. Anything done in daylight before then, they hear from Ravellan first. Quiet keeps their yes." },
      halden: { prefers: "show", line: "Ravellan sails around 3 February. If they see a frigate off Beacon on the 16th, they have two weeks to think again. Quiet tells them nothing." },
    },
    reply: {
      quiet: ["briggs", "Good. Battery at full strength by the 20th. Nobody photographs it."],
      show: ["briggs", `Frigate sails on the 16th. That’s the day after the cabinet votes, General. Talk to ${surname("sato")}.`],
      hold: ["briggs", "We hold. If they come in early February, Beacon fights with what it has."],
    },
  },
  host: {
    head: "Marenna",
    staff: ["sato", "will wait for the cabinet’s vote on 15 January before anything happens in daylight."],
    why: "We promised to consult Marenna. Their answer reaches us on 22 January.",
    cost: "Nothing, if we stay quiet. Their answer is too slow for anything we do in daylight before the 22nd.",
    clash: "A daylight reinforcement on the 16th needs Marenna’s yes. Their answer arrives on the 22nd. We never set up a hotline.",
    ways: [
      { id: "act", name: "Act on the 16th, tell them after", says: "Fast. Marenna’s defence minister has said she will withdraw support for February if we do." },
      { id: "buy", name: "Buy a quick yes", says: "Offer Marenna our two spare patrol boats. The cabinet votes yes on the 15th. We lose those boats for the rest of the campaign." },
      { id: "back", name: "Go back to reinforcing Beacon quietly", says: "No clash. Beacon is guarded without a show.", gives: true },
    ],
  },
  sato: "General, a frigate off Beacon on the 16th needs Marenna’s yes. Without a hotline, their answer reaches us on the 22nd. That is six days late, and I have told them so twice.",
  blocked: "Settle the clash between Beacon and Marenna first. Nothing is lost.",
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
          quiet: "Beacon’s air-defence battery reached full strength. Its radar sees 32 miles. 2nd Battalion is on its 128th day.",
          hold: "2nd Battalion stood down to rest. Beacon kept its own guns and 20 miles of radar.",
          show: way === "act"
            ? "The frigate and two companies arrived off Beacon in daylight. We told Marenna the next morning."
            : "The frigate and two companies arrived off Beacon in daylight, with Marenna’s yes. Ravellan saw it within hours.",
        }[beacon],
      },
      {
        at: "beacon",
        cause: `${open && way === "buy" ? "15" : "22"} January · Marenna`,
        text: !open
          ? "Marenna’s cabinet voted to back us. Its navy will sail with ours if Ravellan comes."
          : way === "buy"
            ? "The cabinet voted yes. Two of our patrol boats now fly Marenna’s flag. Its navy will sail with ours."
            : "Marenna’s defence minister withdrew support. Its navy will not sail with ours in February.",
      },
      { at: "lane", cause: "1 February · Ravellan", text: "Their ships left Sarn at dawn: four warships and the landing craft. They are heading for Beacon." },
    ],
    still: ["Early warning: none", "We saw them sail, but our last look inside Sarn is too old to tell us what is aboard."],
    next: "This is the showdown. You choose how Beacon answers.",
    go: "Begin February: the showdown",
  };
}

// Marenna's yes makes the joint stand possible: by waiting for the vote, or by buying it.
export const hasJointAuthority = (run) => run.jan.beacon !== "show" || run.jan.way === "buy";

export function february(run) {
  const joint = hasJointAuthority(run);
  const routes = [
    { id: "quiet", name: "Hold quietly", does: "Beacon’s guns and garrison hold the headland. The reserve stays in barracks.", costs: "Ravellan’s papers will say we hid.", needs: "Beacon’s defences holding for three days on their own.", voice: ["briggs", "The guns are dug in. We can hold for three days without showing our hand."] },
  ];
  if (joint) routes.push({
    id: "joint", name: "Stand with Marenna’s navy", does: "Our frigate and Marenna’s two corvettes block the approach in daylight. 2nd Battalion goes in behind them.",
    costs: "2nd Battalion will be worn out by the end of the month.",
    needs: run.jan.way === "buy" ? "Marenna’s yes, bought with our two patrol boats." : "Marenna’s yes from the vote on 15 January.",
    voice: ["sato", "Marenna sails with us on the 4th. They will remember who stood beside them."],
  });
  return {
    turn: 6,
    halden: "Four warships and the landing craft, ten miles off Beacon, and they have not landed. They are testing your nerve, General. Hold it.",
    warning: ["Early warning: none", "We saw them sail on 1 February. What is aboard, we cannot see."],
    routes,
    notOffered: joint ? "" : "Standing with Marenna is off the table: you acted without them in January, and their navy is staying in port.",
  };
}

const DEC_ORDER = { quiet: "Beacon strengthened quietly (staff).", rest: "Rest 2nd Battalion.", show: "Show force openly." };
const JAN_ORDER = (j) => j.beacon === "show"
  ? `Reinforce Beacon openly, and ${j.way === "act" ? "tell Marenna after" : "buy Marenna’s yes"}.`
  : j.beacon === "hold" ? "Hold as we are." : "Reinforce Beacon quietly (staff); wait for Marenna’s vote.";

export function debrief(run) {
  const joint = run.feb.route === "joint";
  return {
    title: joint ? "Won, at a price" : "Held, quietly",
    line: joint
      ? "Beacon held, and Marenna trusts us more. 2nd Battalion is worn out, and some will say we overreacted."
      : "Beacon held without a shot fired in public. 2nd Battalion is still standing. Ravellan’s papers say we hid.",
    rows: [
      ["September", "Beacon first, quietly. Lattice started.", "Nothing yet worth reporting.", "They were already planning a landing."],
      ["November", "A closer look at Sarn.", "Signs both ways: attack or bluff.", "The plan went on behind the pressure."],
      ["December", `${DEC_ORDER[run.dec.beacon]} Lattice: ${latticeQ(run.dec.lattice).short}.`, "Nine, then eleven landing craft loading.", "One battalion was loading for Beacon."],
      ["January", JAN_ORDER(run.jan), "A landing looked likelier than a bluff.", run.jan.beacon === "show" ? "Your frigate made them test, not attack." : "Your quiet made them think Beacon was soft."],
      ["February", joint ? "Stand with Marenna’s navy." : "Hold quietly.", "No look inside Sarn since the turn of the year.", "They came to test you, and turned back ten miles out."],
    ],
    halden: {
      boats: "We counted their craft to the last day. What we never had was their date. Next time, ask when.",
      who: "We had their fleet cold in December, and by February we were blind. I asked who. I should have asked when.",
      when: "We had their date and it held. What we lacked was eyes inside Sarn at the end.",
    }[run.dec.lattice],
  };
}

// Debrief-only truth layer. Shown only after the campaign ends, never before.
export const TRUTH = [
  { x: 1180, y: 290, text: "Really: a landing, planned since September" },
  { x: 1150, y: 600, text: "February: they came to test you, not to land" },
];
