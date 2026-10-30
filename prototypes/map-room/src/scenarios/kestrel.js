// Kestrel Strait: a north–south strait between Marenna (west, the host country) and
// Ravellan (east). Every position is in sheet units on a 1840 × 944 chart.
const laneX = (y) => 940 + Math.sin(y / 160) * 26;

export default {
  id: "kestrel-strait",
  name: "Kestrel Strait", story: true,
  sheet: { width: 1840, height: 944 },
  grid: {
    cols: 230, rows: 236,
    lat: ["36°40′", "36°30′", "36°20′"],
    lon: ["24°10′", "24°20′", "24°30′", "24°40′", "24°50′", "25°00′", "25°10′"],
  },
  soundings: 64,
  waves: 140,

  land: [
    { id: "marenna", kind: "edge", edge: "west", base: 560, amp: 34, seed: "west",
      bumps: [{ at: 520, d: 170, w: 60 }, { at: 760, d: -40, w: 70 }],
      wash: true, name: "MARENNA", nameAt: [60, 880], term: "marenna" },
    { id: "ravellan", kind: "edge", edge: "east", base: 1290, amp: 30, seed: "east",
      bumps: [{ at: 345, d: -70, w: 46 }, { at: 640, d: 50, w: 80 }],
      name: "RAVELLAN", nameAt: [1580, 880], term: "ravellan" },
    { id: "north-isle", kind: "island", at: [880, 250], r: 46, seed: "i1" },
    { id: "south-isle", kind: "island", at: [1020, 780], r: 34, seed: "i2" },
    { id: "skerry", kind: "island", at: [760, 120], r: 22, seed: "i3" },
  ],

  features: [
    { type: "woods", at: [[240, 420, 40], [180, 700, 34], [1660, 620, 36], [1580, 180, 28]] },
    { type: "towns", at: [[1480, 300], [380, 790]] },
    { type: "reefs", at: [[690, 610, 5], [960, 300, 4], [1060, 830, 4], [1170, 540, 3]] },
    { type: "lane", width: 52,
      path: Array.from({ length: 945 / 6 + 1 }, (_, i) => [laneX(i * 6), i * 6]),
      arrows: [{ t: 200 / 944, dir: 1 }, { t: 430 / 944, dir: -1 }, { t: 690 / 944, dir: 1 }],
      label: { text: "Shipping lane", at: [990, 118] } },
    { type: "zone", at: [1340, 345], rx: 130, ry: 85 },
    { type: "lighthouse", at: [900, 236], light: "Fl 5s 12M", facing: "east" },
    { type: "posts", along: "marenna", count: 12, inset: 26, from: 60 / 944, to: 852 / 944,
      label: { text: "Lattice listening posts", at: [330, 240] }, term: "lattice" },
    { type: "anchorage", at: [620, 862], label: "Anchorage" },
    { type: "rose", at: [1740, 140], r: 76, variation: "VAR 3°W (2026)" },
    { type: "scale", at: [1500, 812], length: 200, label: "10 nautical miles" },
    { type: "cartouche", at: [40, 40], width: 330, title: "Kestrel Strait", subtitle: "Soundings in fathoms · reported positions only", term: "kestrel" },
  ],

  labels: [
    { text: "Sarn", at: [1400, 214], style: "place", term: "sarn" },
    { text: "Ravellan’s main harbour", at: [1400, 250], term: "sarn" },
  ],

  // `term` on a label, land, mark or the station links it to a profile in the story's
  // glossary (src/fixture.js), so hovering the chart explains it.
  // Named places the story and camera use. `on` is checked by validateScenario.
  places: {
    beacon: { x: 700, y: 520, on: "land" },
    harbour: { x: 1340, y: 345, on: "water" },
    lane: { x: 940, y: 470, on: "water" },
  },

  // Live (animated) objects and where they sit.
  station: { place: "beacon", name: "Beacon Station", note: "our radar and radio post", side: "left", range: 250, term: "beacon" },
  base: { place: "harbour", craft: 9 },
  intel: { at: [1240, 470], title: "Lattice reports:" },
  fleets: {
    lane: { ships: [[960, 400, 80], [990, 470, 95], [940, 545, 85]],
      label: { text: "Ravellan coastguard boats", at: [1012, 560] } },
    edge: { ships: [[870, 455, 200], [890, 525, 190], [915, 590, 172], [950, 420, 212]],
      label: { text: "Ravellan ships\nat Beacon’s edge", at: [990, 420], tone: "danger" } },
  },
};
