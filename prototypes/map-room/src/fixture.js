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
export const fullName = (id) => `${OFFICERS[id].rank} ${OFFICERS[id].name}`;
export const surname = (id) => `${OFFICERS[id].rank} ${OFFICERS[id].name.split(" ").pop()}`;

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
      staff: `${surname("briggs")} will strengthen Beacon quietly.`,
      why: "Boats are loading. You put Beacon first.",
      cost: "The reserve has been on its feet since October. It gets more tired, and Ravellan will see Beacon is guarded.",
      dissent: ["okafor", "“The reserve has had no rest since September. It will not last the winter.”"],
      options: [
        { id: "quiet", name: "Strengthen Beacon quietly", says: "Staff plan. The reserve gets more tired.", cost: "Free", staff: true },
        { id: "rest", name: "Rest the reserve", says: "The troops recover. Beacon sees less and is easier to hit.", cost: "Uses 1 personal order" },
        { id: "show", name: "Show force openly", says: "Warns Ravellan off. Tires the reserve and needs the host government’s OK.", cost: "Uses 1 personal order" },
      ],
      reply: {
        rest: ["briggs", "Rest the reserve and Beacon takes the hit. That’s the trade, General. You have my recommendation."],
        show: ["briggs", "We can do it. Rear Admiral Sato will tell you what the host government thinks of it."],
        quiet: ["briggs", "Understood. My plan stands."],
      },
    },
    lattice: {
      head: "Lattice listening team",
      ask: `${surname("halden")} will task it with one question this month.`,
      questions: [
        { id: "boats", q: "Are they loading landing boats?", staff: true },
        { id: "who", q: "Who is giving orders to their fishing boats?" },
        { id: "when", q: "What is their timetable?" },
      ],
      cost: "Free. This does not use a personal order.",
    },
  },
  night: {
    title: "Night report",
    sub: "First week of January",
    beats: [
      { at: "beacon", cause: "Your order", text: "The reserve stood down over the holidays. They are fresher. Beacon sees less." },
      { at: "harbour", cause: "Your question", text: `Lattice has found who is directing the fishing fleet. ${surname("halden")} will brief you in the morning.` },
      { at: "lane", cause: "Ravellan", text: "Their coastguard boats are back on the shipping lane." },
    ],
    still: ["Early warning: still yes", "The December sighting of the landing boats still holds."],
    next: `The host government decides this month whether to back us. ${surname("sato")} wants your answer before the end of January.`,
    go: "Begin January",
  },
};

export const JANUARY = {
  turn: 5,
  sato: "General, the host government has not approved a show of force. With no hotline, their answer reaches us in February. That is too late, and I have told them so twice.",
  mine: { head: "Beacon Station · your order", name: "Show force openly.", cost: "Tires the reserve. Needs the host government’s OK this month." },
  theirs: {
    head: "The host government · staff plan",
    name: `${surname("sato")} will wait for their OK.`,
    clash: "Their OK cannot reach us this month. We never set up a hotline.",
    ways: [
      { id: "act", name: "Act now, tell them after", says: "Fast. They will not forgive it quickly.", cost: "Uses 1 personal order" },
      { id: "buy", name: "Buy a quick yes", says: "They agree in time. It will cost us dearly.", cost: "Uses 1 personal order" },
      { id: "back", name: "Go back to strengthening Beacon quietly", says: "No clash. Beacon is guarded without a show.", cost: "Gives your order back", free: true },
    ],
  },
  blocked: "Settle the clash between Beacon and the host government first. Nothing is lost.",
};

export const FEBRUARY = {
  turn: 6,
  halden: "They are at Beacon’s edge and they have not landed. They are testing your nerve, General. Hold it.",
  warning: ["Early warning: none", "Our last sighting is from December. It is too old to act on."],
  routes: [
    { id: "quiet", name: "Hold quietly", does: "Keep Beacon’s defences as they are. Keep the reserve back.", costs: "We look less tough in public.", needs: "Beacon’s defences holding on their own.", voice: ["briggs", "We can hold without showing our hand."] },
    { id: "joint", name: "Stand together openly", does: "Stand with the host government in plain sight. Send in what is left of the reserve.", costs: "The reserve will be worn out.", needs: "The host government’s OK, which you bought in January.", voice: ["sato", "They will remember who stood with them."] },
  ],
};

export const DEBRIEF = {
  title: "Won, at a price",
  line: "Beacon held, and the host government trusts us more. The reserve is worn out, and some will say we overreacted.",
  rows: [
    ["September", "Beacon first, quietly.", "Nothing yet worth reporting.", "They were already planning a landing."],
    ["November", "A closer look at their harbour.", "Signs both ways: attack or bluff.", "The plan went on behind the pressure."],
    ["December", "Rest the reserve.", "Landing boats loading.", "Landing boats were loading."],
    ["January", "Show force openly, and buy a quick yes.", "An attack looked likelier than a bluff.", "Your show of force made them test, not attack."],
    ["February", "Stand together openly.", "No fresh sighting.", "They turned back at the edge."],
  ],
  halden: "We had them cold in December, and by February we were blind. I asked who. I should have asked when.",
};

// Debrief-only truth layer. Shown only after the campaign ends, never before.
export const TRUTH = [
  { x: 1180, y: 290, text: "Really: a landing, planned since September" },
  { x: 1100, y: 560, text: "January: your show of force made them test, not attack" },
];
