// Player-safe fixture for the map-room prototype. Every line here is sample copy:
// in the game, the sim's player-safe projection decides what may be said. This file
// only fixes *how* it is said: rank before every name, each officer's own way of
// naming time, and doubt voiced in character rather than as a "what we don't know" list.

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
    rank: "Rear Admiral", name: "Mina Sato", post: "Plans and the host government", portrait: "sato",
    from: "Japanese", time: ["before the fiscal year closes", "in the new year", "by the end of the month"],
    doubt: "Precise about what the host government has and has not agreed to.",
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
  { id: "boats", q: "Are they loading landing boats?", staff: true },
  { id: "who", q: "Who is giving orders to their fishing boats?" },
  { id: "when", q: "What is their timetable?" },
];
export const latticeQ = (id) => LATTICE_QUESTIONS.find((x) => x.id === id);

export const DECEMBER = {
  turn: 4,
  brief: {
    title: "Intelligence summary",
    from: `${fullName("halden")}, Intelligence`,
    sections: [
      ["Bottom line", "Ravellan is loading landing boats in its main harbour. It has been building to this since the autumn."],
      ["Assessment", "This is a real landing plan, or the best-staged bluff I have seen. I will tell you which when they put troops on those boats. Not before."],
      ["Watch for", "Their fishing fleet falling in with the landing boats. Fishermen do not keep military hours."],
    ],
    warning: ["Early warning: yes", "We have eyes on the boats. You will have time to react."],
  },
  halden: "General. The closer look you ordered in November paid off: they are loading landing boats. Anyone who tells you what Ravellan means by it is guessing. I don’t guess.",
  orders: {
    beacon: {
      head: "Beacon Station",
      staff: ["briggs", "will strengthen Beacon quietly."],
      why: "Boats are loading. You put Beacon first.",
      cost: "The reserve has been on its feet since October. It gets more tired, and Ravellan will see Beacon is guarded.",
      dissent: ["okafor", "“The reserve has had no rest since September. It will not last the winter.”"],
      options: [
        { id: "quiet", name: "Strengthen Beacon quietly", says: "Staff plan. The reserve gets more tired.", staff: true },
        { id: "rest", name: "Rest the reserve", says: "The troops recover. Beacon sees less and is easier to hit." },
        { id: "show", name: "Show force openly", says: "Warns Ravellan off. Tires the reserve and upsets the host government." },
      ],
      reply: {
        rest: ["briggs", "Rest the reserve and Beacon takes the hit. That’s the trade, General. You have my recommendation."],
        show: ["briggs", `We can do it. ${surname("sato")} will tell you what the host government thinks of it.`],
        quiet: ["briggs", "Understood. My plan stands."],
      },
      ring: { rest: 190, show: 270 },
    },
    lattice: {
      head: "Lattice listening team",
      ask: `${surname("halden")} will task it with one question this month.`,
      questions: LATTICE_QUESTIONS,
      cost: "Free. This does not use a personal order.",
    },
  },
};

// What happened overnight after the December orders. Beats follow the orders given.
export function decemberNight(run) {
  const b = run.dec.beacon, l = run.dec.lattice;
  return {
    title: "Night report",
    sub: "First week of January",
    beats: [
      {
        at: "beacon", ring: { quiet: 250, rest: 190, show: 270 }[b], dashed: b === "rest",
        cause: b === "quiet" ? "Staff, under your direction" : "Your order",
        text: {
          quiet: "Beacon was strengthened quietly. The reserve is more tired, and Ravellan has seen that Beacon is guarded.",
          rest: "The reserve stood down over the holidays. They are fresher. Beacon sees less.",
          show: "Our ships patrolled openly off Beacon. Ravellan saw it. The reserve is more tired, and the host government is uneasy.",
        }[b],
      },
      {
        at: "harbour",
        cause: l === "boats" ? `${surname("halden")}’s question` : "Your question",
        text: {
          boats: "Lattice watched the harbour all week. The landing boats are still loading.",
          who: `Lattice has found who is directing the fishing fleet. ${surname("halden")} will brief you in the morning.`,
          when: `Lattice has pieced together part of their timetable. ${surname("halden")} will brief you in the morning.`,
        }[l],
        marker: `Answered: ${latticeQ(l).q.toLowerCase()}`,
      },
      { at: "lane", cause: "Ravellan", text: "Their coastguard boats are back on the shipping lane." },
    ],
    still: l === "boats"
      ? ["Early warning: yes, and fresh", "Lattice’s new sighting renews it."]
      : ["Early warning: still yes", "The December sighting of the landing boats still holds."],
    next: `The host government decides this month whether to back us. ${surname("sato")} wants your answer before the end of January.`,
    go: "Begin January",
  };
}

// January's briefing answers the question Lattice was given in December.
export function januaryBrief(run) {
  const l = run.dec.lattice;
  const bottom = {
    boats: "The landing boats are still loading. Lattice has watched them every day since Christmas.",
    who: "Their fishing fleet takes its orders from the navy, not from the fishing ministry.",
    when: "Their timetable runs to the end of February: loading first, then an exercise at sea.",
  }[l];
  const assess = {
    boats: "I now judge this a real landing plan. I will not give you the day, because I do not have it.",
    who: "That is a military operation in civilian clothes. Whether it ends in a landing or a squeeze, nobody can tell you yet. I won’t pretend to.",
    when: "That is the shape of a landing. Exercises are how you hide one. I would plan for it.",
  }[l];
  const halden = {
    boats: "General. The boats are still loading and Lattice has them in sight. I’ll call it a landing plan. The date I won’t call.",
    who: "General. We know who gives the fishing fleet its orders: their navy. That is not a fishing fleet. What they mean to do with it, I can’t yet tell you.",
    when: "General. We have part of their calendar. It ends in February, at sea. If you want my view, plan for a landing.",
  }[l];
  return {
    title: "Intelligence summary",
    from: `${fullName("halden")}, Intelligence`,
    sections: [["Bottom line", bottom], ["Assessment", assess], ["Watch for", "Troops moving down to the harbour. That is the last step before they sail."]],
    warning: l === "boats" ? ["Early warning: yes", "Lattice saw the boats this week."] : ["Early warning: yes", "Our December sighting still holds."],
    halden,
  };
}

export const JANUARY = {
  turn: 5,
  beacon: {
    head: "Beacon Station",
    staff: ["briggs", "will keep reinforcing Beacon quietly."],
    why: "Our warning still holds. Beacon comes first.",
    cost: "The reserve is close to worn out.",
    options: [
      { id: "quiet", name: "Reinforce Beacon quietly", says: "Staff plan. Beacon is ready; the reserve nears its limit.", staff: true },
      { id: "show", name: "Reinforce Beacon openly", says: "Ravellan sees we mean it. Needs the host government’s OK this month." },
      { id: "hold", name: "Hold as we are", says: "Saves the reserve. Beacon gets no fresh cover." },
    ],
    reply: {
      quiet: ["briggs", "Good. Quiet it is."],
      show: ["briggs", `Then we need the host government’s OK this month, General. Ask ${surname("sato")}.`],
      hold: ["briggs", "We hold. If they come, Beacon fights with what it has."],
    },
  },
  host: {
    head: "The host government",
    staff: ["sato", "will wait for their OK before anything happens in the open."],
    why: "We promised to consult them. Their answer comes at the end of the month.",
    cost: "Nothing, if we stay quiet. Their OK is too slow for anything we do in the open this month.",
    clash: "Their OK cannot reach us this month. We never set up a hotline.",
    ways: [
      { id: "act", name: "Act now, tell them after", says: "Fast. They will not forgive it quickly, and they will not stand beside us in February." },
      { id: "buy", name: "Buy a quick yes", says: "They agree in time and will stand beside us. It will cost us dearly." },
      { id: "back", name: "Go back to reinforcing Beacon quietly", says: "No clash. Beacon is guarded without a show.", gives: true },
    ],
  },
  sato: "General, the host government has not approved a show of force. With no hotline, their answer reaches us in February. That is too late, and I have told them so twice.",
  blocked: "Settle the clash between Beacon and the host government first. Nothing is lost.",
};

export function januaryNight(run) {
  const { beacon, way } = run.jan;
  const open = beacon === "show";
  return {
    title: "Night report",
    sub: "First week of February",
    beats: [
      {
        at: "beacon", ring: beacon === "hold" ? 190 : 270, dashed: beacon === "hold",
        cause: beacon === "quiet" ? "Staff, under your direction" : "Your order",
        text: {
          quiet: "Beacon was reinforced quietly. Its defences are ready. The reserve is nearly worn out.",
          hold: "Beacon held as it was. The reserve rested. Beacon’s cover is thin.",
          show: way === "act"
            ? "We reinforced Beacon in the open and told the host government afterwards. Ravellan saw it."
            : "We reinforced Beacon in the open, with the host government’s blessing. Ravellan saw it.",
        }[beacon],
      },
      {
        at: "beacon",
        cause: open ? "Your order" : "Staff, under your direction",
        text: !open
          ? "The host government gave its OK at the end of the month. If it comes to it, we stand together."
          : way === "buy"
            ? "The host government said yes in time. They will stand beside us. What we paid for it is on the record."
            : "The host government is angry. They will not stand beside us now.",
      },
      { at: "lane", cause: "Ravellan", text: "Their ships sailed at dawn on the first of February. They are heading for Beacon." },
    ],
    still: ["Early warning: none", "Our last sighting is too old to act on. They are at sea now, in plain view."],
    next: "This is the showdown. You will choose how Beacon answers.",
    go: "Begin February: the showdown",
  };
}

// The host government's OK makes the joint stand possible: by waiting for it, or by buying it.
export const hasJointAuthority = (run) => run.jan.beacon !== "show" || run.jan.way === "buy";

export function february(run) {
  const joint = hasJointAuthority(run);
  const routes = [
    { id: "quiet", name: "Hold quietly", does: "Keep Beacon’s defences as they are. Keep the reserve back.", costs: "We look less tough in public.", needs: "Beacon’s defences holding on their own.", voice: ["briggs", "We can hold without showing our hand."] },
  ];
  if (joint) routes.push({
    id: "joint", name: "Stand together openly", does: "Stand with the host government in plain sight. Send in what is left of the reserve.",
    costs: "The reserve will be worn out.",
    needs: run.jan.way === "buy" ? "The host government’s OK, which you bought in January." : "The host government’s OK, which you waited for in January.",
    voice: ["sato", "They will remember who stood with them."],
  });
  return {
    turn: 6,
    halden: "They are at Beacon’s edge and they have not landed. They are testing your nerve, General. Hold it.",
    warning: ["Early warning: none", "Our last sighting is too old to act on. It still tells us what they want."],
    routes,
    notOffered: joint ? "" : "Standing together is not on the table: you acted without the host government in January, and they will not stand beside us.",
  };
}

const DEC_ORDER = { quiet: "Beacon strengthened quietly (staff).", rest: "Rest the reserve.", show: "Show force openly." };
const JAN_ORDER = (j) => j.beacon === "show"
  ? `Reinforce Beacon openly, and ${j.way === "act" ? "tell the host government after" : "buy a quick yes"}.`
  : j.beacon === "hold" ? "Hold as we are." : "Reinforce Beacon quietly (staff); wait for their OK.";

export function debrief(run) {
  const joint = run.feb.route === "joint";
  return {
    title: joint ? "Won, at a price" : "Held, quietly",
    line: joint
      ? "Beacon held, and the host government trusts us more. The reserve is worn out, and some will say we overreacted."
      : "Beacon held without a shot fired in public. The reserve is still standing. Some will say we looked weak.",
    rows: [
      ["September", "Beacon first, quietly.", "Nothing yet worth reporting.", "They were already planning a landing."],
      ["November", "A closer look at their harbour.", "Signs both ways: attack or bluff.", "The plan went on behind the pressure."],
      ["December", `${DEC_ORDER[run.dec.beacon]} Lattice: ${latticeQ(run.dec.lattice).q.toLowerCase()}`, "Landing boats loading.", "Landing boats were loading."],
      ["January", JAN_ORDER(run.jan), "A landing looked likelier than a bluff.", run.jan.beacon === "show" ? "Your show of force made them test, not attack." : "Your quiet made them think Beacon was soft."],
      ["February", joint ? "Stand together openly." : "Hold quietly.", "No fresh sighting.", "They came to test you, and turned back at the edge."],
    ],
    halden: {
      boats: "We watched their boats to the last day. What we never had was their timetable. Next time, ask when.",
      who: "We had them cold in December, and by February we were blind. I asked who. I should have asked when.",
      when: "We had their calendar and it held. What we lacked was eyes on the boats at the end.",
    }[run.dec.lattice],
  };
}

// Debrief-only truth layer. Shown only after the campaign ends, never before.
export const TRUTH = [
  { x: 1180, y: 290, text: "Really: a landing, planned since September" },
  { x: 1150, y: 600, text: "February: they came to test you, not to land" },
];
