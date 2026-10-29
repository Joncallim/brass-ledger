// Generated charts. Every theatre has the same shape of problem: our station on a
// headland of the host's coast, the rival's harbour in a bay across a strait, a shipping
// lane between them. The generator rolls where all of that sits and what surrounds it,
// then checks the result with validateScenario and rolls again until it is sound.
//
// The host coast is always on the west and the rival's on the east: the desk's papers sit
// on the right of the table, over the rival's side, and never over our own station.
import { buildGeometry, validateScenario } from "../chart/geometry.js";
import { seeded } from "../chart/random.js";

const W = 1840, H = 944;
const PX_PER_NM = 20; // the scale bar: 200 px is 10 nautical miles

const span = (r, [a, b]) => a + r() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// The x of a west or east coast at height y, from the built geometry.
function coastAt(land, y) {
  const c = land.coast;
  let best = c[0];
  for (const p of c) if (Math.abs(p.y - y) < Math.abs(best.y - y)) best = p;
  return best.x;
}

function degrees(r, count, step) {
  const base = Math.floor(span(r, [8, 40])), min = Math.floor(r() * 6) * 10;
  return Array.from({ length: count }, (_, i) => {
    const m = min + i * step, d = base + Math.floor(m / 60);
    return `${d}°${String(m % 60).padStart(2, "0")}′`;
  });
}

function attempt(world, r, tag) {
  const westBase = span(r, [470, 590]), eastBase = span(r, [1230, 1320]);
  const sy = span(r, [400, 640]);
  // the harbour sits well above or below the station, never straight across
  const above = sy > 520 ? r() < 0.8 : r() < 0.35;
  const hy = above ? span(r, [300, sy - 130]) : span(r, [sy + 130, 700]);
  const host = {
    id: "host", kind: "edge", edge: "west", base: westBase, amp: span(r, [22, 38]), seed: `${tag}-west`,
    bumps: [{ at: sy, d: span(r, [150, 185]), w: span(r, [48, 66]) }, { at: span(r, [80, 860]), d: span(r, [-50, 60]), w: span(r, [60, 110]) }],
    wash: true, name: world.host.toUpperCase(), nameAt: [60, 880], term: "marenna",
  };
  const rival = {
    id: "rival", kind: "edge", edge: "east", base: eastBase, amp: span(r, [22, 34]), seed: `${tag}-east`,
    bumps: [{ at: hy, d: span(r, [-80, -60]), w: span(r, [40, 52]) }, { at: span(r, [80, 860]), d: span(r, [-30, 60]), w: span(r, [60, 110]) }],
    name: world.rival.toUpperCase(), nameAt: [1580, 880], term: "ravellan",
  };
  const coasts = buildGeometry({ sheet: { width: W, height: H }, land: [host, rival] });
  const west = coasts.land("host"), east = coasts.land("rival");
  const station = { x: Math.round(coastAt(west, sy) - 30), y: Math.round(sy) };
  const harbour = { x: Math.round(coastAt(east, hy) - 30), y: Math.round(hy) };
  if (harbour.x > 1380) return null; // its label would run into the compass rose
  const crossing = dist(station, harbour);
  if (crossing < 500 || crossing > 780) return null;

  // The lane runs down the middle of the strait, smoothed so it bends rather than kinks.
  const mid = Array.from({ length: H / 6 + 1 }, (_, i) => (coastAt(west, i * 6) + coastAt(east, i * 6)) / 2);
  const laneX = mid.map((_, i) => {
    const near = mid.slice(Math.max(0, i - 12), i + 13);
    return near.reduce((a, b) => a + b, 0) / near.length;
  });
  const laneAt = (y) => laneX[Math.max(0, Math.min(laneX.length - 1, Math.round(y / 6)))];
  const path = laneX.map((x, i) => [Math.round(x), i * 6]);

  // Where words go: the frame's furniture, the station and harbour labels, the lane's
  // label and the "how far we can see" caption over the radar ring. Marks keep off them.
  const busy = [[40, 40, 400, 180], [1640, 50, 1830, 230], [1480, 780, 1730, 860], [30, 840, 420, 920], [1560, 840, 1830, 920],
    [station.x - 360, station.y - 60, station.x + 30, station.y + 40], [harbour.x - 20, harbour.y - 150, harbour.x + 330, harbour.y + 100],
    [laneAt(118) + 40, 95, laneAt(118) + 200, 140], [station.x - 130, station.y - 300, station.x + 200, station.y - 255]];
  const free = (p, pad = 0) => !busy.some(([x0, y0, x1, y1]) => p.x > x0 - pad && p.x < x1 + pad && p.y > y0 - pad && p.y < y1 + pad);

  // Islands: off the lane, clear of the station and the harbour, apart from each other.
  const islands = [];
  const want = 2 + Math.floor(r() * 3);
  for (let tries = 0; islands.length < want && tries < 200; tries++) {
    const rad = span(r, [18, 46]), y = span(r, [90, 860]);
    const x = span(r, [coastAt(west, y) + 60, coastAt(east, y) - 60]);
    const p = { x, y };
    if (Math.abs(x - laneAt(y)) < rad * 1.6 + 60) continue;
    if (dist(p, station) < 240 || dist(p, harbour) < 200 || !free(p, rad * 1.5 + 20)) continue;
    if (coasts.distToCoast(x, y) < rad * 1.6 + 30 || coasts.isLand(x, y)) continue;
    if (islands.some((o) => dist(p, { x: o.at[0], y: o.at[1] }) < 160)) continue;
    islands.push({ id: `isle-${islands.length}`, kind: "island", at: [Math.round(x), Math.round(y)], r: Math.round(rad), seed: `${tag}-i${islands.length}`, aspect: span(r, [1.1, 1.6]) });
  }
  const land = [host, rival, ...islands];
  const geo = buildGeometry({ sheet: { width: W, height: H }, land });

  // Edge fleet: a loose arc on the water side of the station, bows turned towards it.
  const edge = [];
  for (const [dx, dy] of [[170, -65], [190, 5], [215, 70], [250, -100]]) {
    const x = station.x + dx + span(r, [-12, 12]), y = station.y + dy + span(r, [-10, 10]);
    edge.push([Math.round(x), Math.round(y), Math.round(180 + Math.atan2(y - station.y, x - station.x) * -57 * 0.4 + span(r, [-8, 8]))]);
  }
  const ly = Math.round(span(r, [Math.max(260, sy - 140), Math.min(700, sy + 140)]));
  const lane = [[-70, -8, 80], [0, 20, 95], [75, -12, 85]].map(([dy, dx, a]) => [Math.round(laneAt(ly + dy) + dx), ly + dy, a + Math.round(span(r, [-6, 6]))]);
  const intelY = hy + 125 <= 820 ? hy + 125 : hy - 115;

  // Lighthouse on the island nearest the lane, if there is one; it faces the lane.
  const lit = [...islands].sort((a, b) => Math.abs(a.at[0] - laneAt(a.at[1])) - Math.abs(b.at[0] - laneAt(b.at[1])))[0];
  const marks = (count, inWater, test) => {
    const out = [];
    for (let tries = 0; out.length < count && tries < 400; tries++) {
      const x = span(r, [80, W - 80]), y = span(r, [80, H - 80]);
      if (geo.isLand(x, y) === inWater) continue;
      if (test({ x, y })) out.push({ x: Math.round(x), y: Math.round(y) });
    }
    return out;
  };
  const postsY = sy > 470 ? 240 : 720;
  busy.push([120, postsY - 20, 420, postsY + 30]);
  const woods = marks(4, false, (p) => free(p, 30) && geo.distToCoast(p.x, p.y) > 70).map((p) => [p.x, p.y, Math.round(span(r, [26, 40]))]);
  const towns = marks(2, false, (p) => free(p, 20) && geo.distToCoast(p.x, p.y) > 50 && !woods.some(([x, y]) => Math.hypot(x - p.x, y - p.y) < 90));
  const reefs = marks(4, true, (p) => free(p, 20) && geo.distToCoast(p.x, p.y) > 40 && Math.abs(p.x - laneAt(p.y)) > 70 && dist(p, harbour) > 160 && dist(p, station) > 160)
    .map((p) => [p.x, p.y, 3 + Math.floor(r() * 3)]);
  const anchorY = sy > 470 ? 140 : 860;
  const anchorage = [Math.round(coastAt(geo.land("host"), anchorY) + 70), anchorY];

  const features = [
    { type: "woods", at: woods },
    { type: "towns", at: towns.map((p) => [p.x, p.y]) },
    { type: "reefs", at: reefs },
    { type: "lane", width: 52, path,
      arrows: [{ t: 0.21, dir: 1 }, { t: 0.46, dir: -1 }, { t: 0.73, dir: 1 }],
      label: { text: "Shipping lane", at: [Math.round(laneAt(118) + 50), 118] } },
    { type: "zone", at: [harbour.x, harbour.y], rx: 130, ry: 85 },
    lit && { type: "lighthouse", at: [lit.at[0], lit.at[1]], light: `Fl ${3 + Math.floor(r() * 7)}s ${8 + Math.floor(r() * 7)}M`, facing: lit.at[0] < laneAt(lit.at[1]) ? "east" : "west" },
    { type: "posts", along: "host", count: 12, inset: 26, from: 0.06, to: 0.9,
      label: { text: `${world.network} listening posts`, at: [130, postsY] }, term: "lattice" },
    { type: "anchorage", at: anchorage, label: "Anchorage" },
    { type: "rose", at: [1740, 140], r: 76, variation: `VAR ${1 + Math.floor(r() * 5)}°${r() < 0.5 ? "W" : "E"} (2026)` },
    { type: "scale", at: [1500, 812], length: 200, label: "10 nautical miles" },
    { type: "cartouche", at: [40, 40], width: 330, title: world.strait, subtitle: "Soundings in fathoms · reported positions only", term: "kestrel" },
  ].filter(Boolean);

  const scenario = {
    id: world.id, name: world.strait, story: true, generated: true,
    sheet: { width: W, height: H },
    grid: { cols: 230, rows: 236, lat: degrees(r, 3, 10).reverse(), lon: degrees(r, 7, 10) },
    soundings: 64, waves: 140,
    land, features,
    labels: [
      { text: world.harbour, at: [harbour.x + 60, harbour.y - 131], style: "place", term: "sarn" },
      { text: `${world.rival}’s main harbour`, at: [harbour.x + 60, harbour.y - 95], term: "sarn" },
    ],
    places: {
      beacon: { ...station, on: "land" },
      harbour: { ...harbour, on: "water" },
      lane: { x: Math.round(laneAt(ly)), y: ly, on: "water" },
    },
    station: { place: "beacon", name: world.station, note: "our radar and radio post", side: "left", range: 250, term: "beacon" },
    base: { place: "harbour", craft: 9 },
    intel: { at: [Math.round(laneAt(intelY) + 300), Math.round(intelY)], title: `${world.network} is asking:` },
    fleets: {
      lane: { ships: lane, label: { text: `${world.rival} coastguard boats`, at: [Math.round(laneAt(ly) + 72), ly + 90] } },
      edge: { ships: edge, label: { text: `${world.rival} ships\nat ${world.stationShort}’s edge`, at: [station.x + 290, station.y - 100], tone: "danger" } },
    },
    // Five-mile steps, so the copy quotes a round number.
    harbourNm: Math.max(20, Math.round(crossing / PX_PER_NM / 5) * 5),
  };
  return validateScenario(scenario, geo).length ? null : scenario;
}

// A sound chart for this world. Same world, same chart.
export function generateScenario(world) {
  const r = seeded(`chart-${world.code}`);
  for (let i = 0; i < 60; i++) {
    const sc = attempt(world, r, `${world.code}-${i}`);
    if (sc) return sc;
  }
  throw new Error(`no sound chart for theatre ${world.code}`);
}
