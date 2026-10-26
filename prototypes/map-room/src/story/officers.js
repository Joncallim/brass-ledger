// The staff. Each officer has one job and one thing they always push for, shown next to
// their name wherever they speak, so the player never has to remember who cares about
// what. Their recommendations are worked out each month from the campaign's state
// (src/story/play.js), so who agrees and who clashes changes from run to run.
import { WORLD as W } from "./world.js";

export const OFFICERS = {
  halden: {
    rank: "Major General", name: "Elias Halden", post: "Intelligence", portrait: "halden", from: "British",
    focus: `Finds out what ${W.rival} means to do`,
    pushes: `moves that force ${W.rival} to show its hand`,
    role: `Head of intelligence. Runs ${W.network} and tells you what ${W.rival} is doing. Reports only what his people have seen or heard. He will trade some risk for a clearer picture.`,
    time: ["since the autumn", "before Christmas", "in the new year"],
  },
  briggs: {
    rank: "Brigadier General", name: "Mara Briggs", post: "Operations", portrait: "briggs", from: "American",
    focus: `Makes sure ${W.stationShort} can stop an attack`,
    pushes: `more troops and guns on ${W.stationShort}, moved where ${W.rival} cannot see`,
    role: `Head of operations. Plans every troop and ship movement, including ${W.stationShort}’s defences and ${W.reserve}’s duty. She writes the staff plan you start each month with.`,
    time: ["since October", "through Q1", "by end of January"],
  },
  okafor: {
    rank: "Rear Admiral", name: "Tunde Okafor", post: "Logistics", portrait: "okafor", from: "Nigerian",
    focus: "Keeps our troops and ships fit to fight",
    pushes: `rest for ${W.reserve} before it breaks`,
    role: `Head of logistics. Tracks supplies, fuel, and how long a unit can stay on duty before sickness and mistakes set in. His rule of thumb: past 100 days without rest, a third of a unit is lost.`,
    time: ["since September", "these three months", "before the rains turn"],
  },
  sato: {
    rank: "Rear Admiral", name: "Mina Sato", post: `Plans and ${W.host}`, portrait: "sato", from: "Japanese",
    focus: `Keeps ${W.host} on our side`,
    pushes: `nothing ${W.rival} can photograph before the ${W.hostAdj} cabinet has agreed to it`,
    role: `Head of plans, and our link to ${W.host}’s government. Counts the ${W.hostAdj} cabinet’s votes and knows exactly what it has and has not agreed to.`,
    time: ["before the fiscal year closes", "in the new year", "by the end of the month"],
  },
  warden: { rank: "Major General", name: "Ruth Warden", post: "Personnel", portrait: "warden", focus: "Personnel", role: "Head of personnel." },
  navarro: { rank: "Brigadier General", name: "Elena Navarro", post: "Force development", portrait: "navarro", focus: "Force development", role: "Head of force development." },
};

// Names render as their own type: sans, brass, rank a step lighter than the name.
export const plainName = (id) => `${OFFICERS[id].rank} ${OFFICERS[id].name}`;
const mark = (id, name) => `<span class="officer" data-term="officer:${id}"><span class="rank">${OFFICERS[id].rank}</span> ${name}</span>`;
export const fullName = (id) => mark(id, OFFICERS[id].name);
export const surname = (id) => mark(id, OFFICERS[id].name.split(" ").pop());
