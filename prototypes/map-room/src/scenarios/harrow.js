// Harrow Sound: a test sea, not story content. It exists to prove the chart module draws
// any scenario: coasts on the north and south edges instead of west and east, an
// east–west lane, and the station on a southern headland. Names are placeholders.
const laneY = (x) => 470 + Math.sin(x / 200) * 30;

export default {
  id: "harrow-sound",
  name: "Harrow Sound",
  sheet: { width: 1840, height: 944 },
  grid: {
    cols: 230, rows: 236,
    lat: ["58°20′", "58°10′", "58°00′"],
    lon: ["4°50′W", "4°40′W", "4°30′W", "4°20′W", "4°10′W", "4°00′W", "3°50′W"],
  },
  soundings: 70,
  waves: 160,
  inks: { land: "#DCC79A" },

  land: [
    { id: "vesca", kind: "edge", edge: "north", base: 210, amp: 28, seed: "harrow-north",
      bumps: [{ at: 1300, d: -80, w: 60 }, { at: 520, d: 50, w: 90 }],
      name: "VESCA", nameAt: [420, 40] },
    { id: "orland", kind: "edge", edge: "south", base: 730, amp: 26, seed: "harrow-south",
      bumps: [{ at: 620, d: 160, w: 70 }, { at: 1420, d: -50, w: 110 }],
      wash: true, name: "ORLAND", nameAt: [80, 880] },
    { id: "gull", kind: "island", at: [1520, 600], r: 38, seed: "h1" },
    { id: "tern", kind: "island", at: [420, 620], r: 30, seed: "h2", aspect: 1.6 },
    { id: "holm", kind: "island", at: [1080, 640], r: 20, seed: "h3" },
  ],

  features: [
    { type: "woods", at: [[260, 90, 26], [1640, 80, 30], [300, 860, 34], [1200, 880, 30]] },
    { type: "towns", at: [[1330, 50], [760, 840]] },
    { type: "reefs", at: [[880, 590, 4], [1200, 360, 4], [420, 330, 3], [1700, 470, 3]] },
    { type: "lane", width: 52,
      path: Array.from({ length: 1841 / 6 + 1 }, (_, i) => [i * 6, laneY(i * 6)]),
      arrows: [{ t: 0.2, dir: 1 }, { t: 0.5, dir: -1 }, { t: 0.78, dir: 1 }],
      label: { text: "Shipping lane", at: [80, 400] } },
    { type: "zone", at: [1300, 205], rx: 120, ry: 60 },
    { type: "lighthouse", at: [1500, 590], light: "Fl(2) 10s 9M", facing: "west" },
    { type: "posts", along: "orland", count: 10, inset: 24, from: 0.06, to: 0.94,
      label: { text: "Listening posts", at: [1000, 800] } },
    { type: "anchorage", at: [1660, 560], label: "Anchorage" },
    { type: "rose", at: [1720, 360], r: 70, variation: "VAR 1°W (2026)" },
    { type: "scale", at: [80, 580], length: 200, label: "10 nautical miles" },
    { type: "cartouche", at: [1470, 40], width: 330, title: "Harrow Sound", subtitle: "Test chart · placeholder names" },
  ],

  labels: [
    { text: "Port Vey", at: [960, 236], style: "place" },
    { text: "Vescan naval base", at: [960, 272] },
  ],

  places: {
    beacon: { x: 620, y: 640, on: "land" },
    harbour: { x: 1300, y: 205, on: "water" },
    lane: { x: 900, y: 470, on: "water" },
  },

  station: { place: "beacon", name: "Cape Station", note: "our radar and radio post", side: "right", range: 230 },
  base: { place: "harbour", craft: 6 },
  intel: { at: [1340, 470] },
  fleets: {
    lane: { ships: [[820, 455, 0], [930, 480, 5], [1040, 470, 175]],
      label: { text: "Vescan coastguard boats", at: [940, 500] } },
    edge: { ships: [[500, 430, 330], [600, 405, 0], [700, 415, 20], [790, 450, 40]],
      label: { text: "Vescan ships\nat the station’s edge", at: [820, 360], tone: "danger" } },
  },
};
