// The staff. Each officer has one job and one thing they always push for, shown next to
// their name wherever they speak, so the player never has to remember who cares about what.
// Names and ranks are the same in every theatre; what they watch is worded for the world.
import { KESTREL } from "./world.js";

export const OFFICER_NAMES = {
  halden: { rank: "Major General", name: "Elias Halden", post: "Intelligence", portrait: "halden", from: "British" },
  briggs: { rank: "Brigadier General", name: "Mara Briggs", post: "Operations", portrait: "briggs", from: "American" },
  okafor: { rank: "Rear Admiral", name: "Tunde Okafor", post: "Logistics", portrait: "okafor", from: "Nigerian" },
  sato: { rank: "Rear Admiral", name: "Mina Sato", post: "Plans and the ally", portrait: "sato", from: "Japanese" },
  warden: { rank: "Major General", name: "Ruth Warden", post: "Personnel", portrait: "warden" },
  navarro: { rank: "Brigadier General", name: "Elena Navarro", post: "Force development", portrait: "navarro" },
};

// Names render as their own type: sans, brass, rank a step lighter than the name.
export const plainName = (id) => `${OFFICER_NAMES[id].rank} ${OFFICER_NAMES[id].name}`;
const mark = (id, name) => `<span class="officer" data-term="officer:${id}"><span class="rank">${OFFICER_NAMES[id].rank}</span> ${name}</span>`;
export const fullName = (id) => mark(id, OFFICER_NAMES[id].name);
export const surname = (id) => mark(id, OFFICER_NAMES[id].name.split(" ").pop());

const cache = new WeakMap();
// Each officer's profile, worded for a world.
export function officersFor(W = KESTREL) {
  if (cache.has(W)) return cache.get(W);
  const N = OFFICER_NAMES;
  const out = {
    halden: { ...N.halden,
      focus: `What we know about ${W.rival}, from whom, and how sure`,
      pushes: `keeping ${W.network} where the evidence is`,
      role: `Head of intelligence. Runs ${W.network}. Tells you what has been seen or heard, by whom, on which day, and how far he trusts it. He will not call a guess a fact.` },
    briggs: { ...N.briggs,
      focus: `Where our forces are, and by when`,
      pushes: `${W.stationShort}’s defence level, raised where ${W.rival} cannot see`,
      role: `Head of operations. Plans every troop and ship movement, ${W.stationShort}’s defence level and ${W.reserve}’s duty, with dates. She writes the staff plan you start each month with.` },
    okafor: { ...N.okafor,
      focus: "Whether our troops can fight, and what it costs them",
      pushes: `rest for ${W.reserve} before it is unfit`,
      role: `Head of logistics. Keeps the battalion’s fatigue (a point a day on duty, more for hard work) and its strength. Past 120 fatigue the battalion is unfit, and an unfit battalion can’t hold a landing.` },
    sato: { ...N.sato, post: `Plans and ${W.host}`,
      focus: `What ${W.host} has agreed to, and what moves its votes`,
      pushes: `nothing visible before the ${W.hostAdj} cabinet has agreed to it`,
      role: `Head of plans, and our link to ${W.host}’s government. Counts the ${W.hostAdj} cabinet, for and against, and knows exactly what it has and has not agreed to.` },
    warden: { ...N.warden, focus: "Personnel", role: "Head of personnel." },
    navarro: { ...N.navarro, focus: "Force development", role: "Head of force development." },
  };
  cache.set(W, out);
  return out;
}
