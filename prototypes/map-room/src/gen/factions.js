// Generated theatres: a fresh set of names for the campaign's roles (src/story/world.js),
// rolled from the campaign code so a code always gives the same theatre. The staff are
// ours and travel with us; only the sea, the two countries and their places change.
import { KESTREL } from "../story/world.js";
import { seeded } from "../chart/random.js";
import { generateScenario } from "./mapgen.js";

// Two families of sounds, one per side, so the host and the rival don't sound related.
const SOUNDS = {
  host: { start: ["Ma", "Ve", "Ta", "Lo", "Se", "Ca", "Do", "Ri", "Be", "Al"], mid: ["ren", "les", "var", "lin", "dor", "ser", "mir", "ten"], end: ["na", "sa", "ra", "ia", "ina", "ena"] },
  rival: { start: ["Ra", "Ko", "Os", "Dra", "Vy", "Gor", "Ze", "Tor", "Bra", "Ul"], mid: ["vel", "stra", "dun", "mar", "rov", "kel", "zan", "tis"], end: ["an", "en", "ar", "or", "esk", "ane"] },
};
const HARBOURS = ["Vosk", "Tull", "Kerrin", "Dorvath", "Haskel", "Morne", "Grist", "Vell", "Tarsk", "Brannoc", "Ostry", "Kesh", "Varn", "Duskin", "Corran", "Ilsk"];
const STRAITS = ["Osprey", "Merlin", "Plover", "Curlew", "Petrel", "Heron", "Shrike", "Fulmar", "Skua", "Harrier", "Egret", "Dunlin"];
const STATIONS = ["Cairn", "Vigil", "Lantern", "Sentry", "Ember", "Halyard", "Bastion", "Tor", "Gannet"];
const NETWORKS = ["Trellis", "Loom", "Sieve", "Seine", "Mesh", "Warp", "Weft", "Gauze", "Riddle", "Comb"];
const RESERVES = ["1st Battalion", "3rd Battalion", "4th Battalion", "5th Battalion", "7th Battalion"];

// Real countries and words the copy uses, so a rolled name never reads as one of them.
const BLOCK = new Set([
  "oman", "iran", "sudan", "japan", "bhutan", "taiwan", "jordan", "kenya", "ghana", "malta", "latvia", "serbia", "zambia",
  "gambia", "russia", "libya", "nigeria", "albania", "romania", "bolivia", "georgia", "armenia", "india", "china", "samoa",
  "tonga", "cuba", "canada", "panama", "angola", "somalia", "syria", "korea", "estonia", "slovenia", "croatia", "monaco",
  "lesotho", "eritrea", "rwanda", "uganda", "tanzania", "namibia", "liberia", "austria", "bosnia", "macedonia", "kosovo",
  "afghan", "pakistan", "iraq", "yemen", "qatar", "israel", "lebanon", "turkey", "greece", "spain", "france", "italy",
  "beacon", "marenna", "ravellan", "sarn", "lattice", "kestrel", "halden", "briggs", "okafor", "sato", "warden", "navarro",
]);

const pick = (r, list) => list[Math.floor(r() * list.length)];

function word(r, s, mid = 0.5) {
  return pick(r, s.start) + (r() < mid ? pick(r, s.mid) : "") + pick(r, s.end);
}

function country(r, s, avoid) {
  for (let i = 0; i < 50; i++) {
    const w = word(r, s);
    const k = w.toLowerCase();
    // no doubled vowels or stutters ("Ulstraar", "Toror"), which read as typos
    if (/([aeiou])\1|(..)\2/i.test(w)) continue;
    if (w.length >= 6 && w.length <= 9 && !BLOCK.has(k) && ![...BLOCK].some((b) => b.length > 4 && k.includes(b)) && !avoid.some((a) => a.toLowerCase().startsWith(k.slice(0, 3)))) return w;
  }
  throw new Error("no name found");
}

// The host's adjective: every host name ends in "a", so "Marenna" → "Marennan".
const adjective = (name) => `${name}n`;

// `keep` fixes names that must not change: in a war, the rival and the task force's own
// network and reserve stay the same from sector to sector.
export function generateWorld(code, keep = {}) {
  const r = seeded(`world-${code}`);
  const host = country(r, SOUNDS.host, [KESTREL.host, ...(keep.rival ? [keep.rival] : [])]);
  const rival = keep.rival ?? country(r, SOUNDS.rival, [host, KESTREL.rival]);
  const harbour = pick(r, HARBOURS.filter((h) => ![host, rival].some((n) => n.startsWith(h.slice(0, 2)))));
  const station = pick(r, STATIONS);
  const world = {
    ...KESTREL,
    id: `theatre-${code}`, generated: true, code,
    strait: `${pick(r, STRAITS)} Strait`,
    station: `${station} Station`, stationShort: station,
    host, hostAdj: adjective(host), rival, harbour,
    network: pick(r, NETWORKS),
    reserve: pick(r, RESERVES),
    ...keep,
  };
  // The chart is part of the theatre; the copy quotes the crossing it measures.
  world.layout = generateScenario(world);
  world.harbourNm = world.layout.harbourNm;
  return world;
}

// The authored theatre keeps its code; any other code is a generated theatre.
export const worldFor = (code) => (!code || String(code).toUpperCase() === "KESTREL" ? { ...KESTREL } : generateWorld(code));
