// The staff. Each officer has one job and one thing they always push for, shown next to
// their name wherever they speak, so the player never has to remember who cares about
// what. Their recommendations are worked out each month from the campaign's state
// (src/story/play.js), so who agrees and who clashes changes from run to run.
import { WORLD as W, onWorld } from "./world.js";

export let OFFICERS;

// Names render as their own type: sans, brass, rank a step lighter than the name.
export const plainName = (id) => `${OFFICERS[id].rank} ${OFFICERS[id].name}`;
const mark = (id, name) => `<span class="officer" data-term="officer:${id}"><span class="rank">${OFFICERS[id].rank}</span> ${name}</span>`;
export const fullName = (id) => mark(id, OFFICERS[id].name);
export const surname = (id) => mark(id, OFFICERS[id].name.split(" ").pop());

// Recomputed whenever the theatre changes (see setWorld in src/story/world.js).
onWorld(() => {
  OFFICERS = {
    halden: {
      rank: "Major General", name: "Elias Halden", post: "Intelligence", portrait: "halden", from: "British",
      focus: `What we know about ${W.rival}, from whom, and how sure`,
      pushes: `keeping ${W.network} where the evidence is`,
      role: `Head of intelligence. Runs ${W.network}. Tells you what has been seen or heard, by whom, on which day, and how far he trusts it. He will not call a guess a fact.`,
      time: ["since the autumn", "before Christmas", "in the new year"],
    },
    briggs: {
      rank: "Brigadier General", name: "Mara Briggs", post: "Operations", portrait: "briggs", from: "American",
      focus: `Where our forces are, and by when`,
      pushes: `${W.stationShort}’s defence level, raised where ${W.rival} cannot see`,
      role: `Head of operations. Plans every troop and ship movement, ${W.stationShort}’s defence level and ${W.reserve}’s duty, with dates. She writes the staff plan you start each month with.`,
      time: ["since October", "through Q1", "by end of January"],
    },
    okafor: {
      rank: "Rear Admiral", name: "Tunde Okafor", post: "Logistics", portrait: "okafor", from: "Nigerian",
      focus: "Whether our troops can fight, and what it costs them",
      pushes: `rest for ${W.reserve} before it is unfit`,
      role: `Head of logistics. Keeps the battalion’s fatigue (a point a day on duty, more for hard work) and its strength. Past 120 fatigue the battalion is unfit, and an unfit battalion can’t hold a landing.`,
      time: ["since September", "these three months", "before the rains turn"],
    },
    sato: {
      rank: "Rear Admiral", name: "Mina Sato", post: `Plans and ${W.host}`, portrait: "sato", from: "Japanese",
      focus: `What ${W.host} has agreed to, and what moves its votes`,
      pushes: `nothing visible before the ${W.hostAdj} cabinet has agreed to it`,
      role: `Head of plans, and our link to ${W.host}’s government. Counts the ${W.hostAdj} cabinet, for and against, and knows exactly what it has and has not agreed to.`,
      time: ["before the fiscal year closes", "in the new year", "by the end of the month"],
    },
    warden: { rank: "Major General", name: "Ruth Warden", post: "Personnel", portrait: "warden", focus: "Personnel", role: "Head of personnel." },
    navarro: { rank: "Brigadier General", name: "Elena Navarro", post: "Force development", portrait: "navarro", focus: "Force development", role: "Head of force development." },
  };
});
