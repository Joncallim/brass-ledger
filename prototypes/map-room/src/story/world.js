// The placeholders every campaign is written against. A campaign is a skeleton of roles
// (a station we hold, the host country it stands in, a rival across the water, the
// rival's harbour, our intercept network, our reserve) and a world fills those roles
// with names. The story copy only ever says W.host, W.rival and so on, so another world
// gives another campaign on the same skeleton.
export const KESTREL = {
  id: "kestrel", generated: false, code: null, layout: null,
  strait: "Kestrel Strait",
  station: "Beacon Station", stationShort: "Beacon",
  host: "Marenna", hostAdj: "Marennan",
  rival: "Ravellan",
  harbour: "Sarn",
  network: "Lattice",
  reserve: "2nd Battalion",
  // Distances and sizes the copy quotes. Invented for this prototype; see the README.
  harbourNm: 30, straitNm: 40, garrison: 140, battalion: 600, battery: 120, ministers: 11,
};

// The live world. Modules read names from it when they speak, and anything worked out
// once from the names (titles, glossary, the highlighter) registers with onWorld so a new
// theatre can be swapped in while the game runs, with no page reload.
export const WORLD = { ...KESTREL };
const listeners = [];

// Runs `fn` now and again every time the world changes. Modules register in import order,
// so a module always re-binds after the modules it reads from.
export function onWorld(fn) {
  listeners.push(fn);
  fn(WORLD);
}

export function setWorld(world) {
  for (const k of Object.keys(WORLD)) delete WORLD[k];
  Object.assign(WORLD, world);
  for (const fn of listeners) fn(WORLD);
}
