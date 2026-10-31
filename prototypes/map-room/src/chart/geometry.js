// Chart geometry from a scenario definition. Pure: no Phaser, no DOM, so the same code
// draws the chart in the browser and is checked by `npm test` in Node.
//
// Coordinates are sheet units: (0, 0) is the chart's top-left corner and the sheet is
// scenario.sheet.width × height. Two kinds of land cover most sea charts:
//   - "edge" land fills one side of the sheet up to a coastline (straits, gulfs, bays);
//   - "island" land is a closed blob in open water.
import { seeded } from "./random.js";

const STEP = 8;
const WATER_DIR = { west: { x: 1, y: 0 }, east: { x: -1, y: 0 }, north: { x: 0, y: 1 }, south: { x: 0, y: -1 } };

// A coastline running the length of one sheet edge: seeded waves plus named headlands.
// `bumps[].d` pushes the coast that far into the water (negative digs a bay into the land).
function edgeCoast(def, W, H) {
  const r = seeded(def.seed ?? def.id);
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
  const vertical = def.edge === "west" || def.edge === "east";
  const length = vertical ? H : W;
  const toward = def.edge === "west" || def.edge === "north" ? 1 : -1;
  const amp = def.amp ?? 30;
  const pts = [];
  for (let t = 0; t <= length; t += STEP) {
    let across = def.base + Math.sin(t / 140 + ph[0]) * amp + Math.sin(t / 53 + ph[1]) * amp * 0.35 + Math.sin(t / 19 + ph[2]) * amp * 0.12;
    for (const b of def.bumps ?? []) across += toward * b.d * Math.exp(-((t - b.at) ** 2) / (2 * b.w ** 2));
    pts.push(vertical ? { x: across, y: t } : { x: t, y: across });
  }
  return pts;
}

function islandBlob(def, grow = 0) {
  const r = seeded(def.seed ?? def.id);
  const ph = r() * 6.28;
  const [cx, cy] = def.at;
  const aspect = def.aspect ?? 1.3;
  const pts = [];
  for (let a = 0; a < Math.PI * 2; a += 0.2) {
    const k = (def.r + grow) * (1 + 0.22 * Math.sin(a * 3 + ph) + 0.1 * Math.sin(a * 5 + ph * 2));
    pts.push({ x: cx + Math.cos(a) * k * aspect, y: cy + Math.sin(a) * k });
  }
  return pts;
}

function closeEdge(edge, pts, W, H) {
  return {
    west: [{ x: 0, y: 0 }, ...pts, { x: 0, y: H }],
    east: [{ x: W, y: 0 }, ...pts, { x: W, y: H }],
    north: [{ x: 0, y: 0 }, ...pts, { x: W, y: 0 }],
    south: [{ x: 0, y: H }, ...pts, { x: W, y: H }],
  }[edge];
}

export function pointInPolygon(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

export function buildGeometry(scenario) {
  const { width: W, height: H } = scenario.sheet;
  const lands = scenario.land.map((def) => {
    if (def.kind === "island") {
      return {
        id: def.id, def, kind: "island",
        polygon: (off = 0) => islandBlob(def, off * 0.55),
        coastline: (off = 0) => { const p = islandBlob(def, off * 0.55); return [...p, p[0]]; },
      };
    }
    const base = edgeCoast(def, W, H);
    const dir = WATER_DIR[def.edge];
    const shift = (off) => base.map((p) => ({ x: p.x + dir.x * off, y: p.y + dir.y * off }));
    return {
      id: def.id, def, kind: "edge", edge: def.edge, waterDir: dir, coast: base,
      polygon: (off = 0) => closeEdge(def.edge, shift(off), W, H),
      coastline: (off = 0) => shift(off),
    };
  });
  const polys = lands.map((l) => l.polygon(0));
  const coastSamples = lands.flatMap((l) => l.coastline(0));
  const isLand = (x, y) => polys.some((poly) => pointInPolygon({ x, y }, poly));
  const distToCoast = (x, y) => {
    let best = Infinity;
    for (const p of coastSamples) {
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  };
  // Seeded points in open water at least `minDist` from any coast, inside the margin and
  // at least `spacing` apart.
  const waterPoints = (count, seed, minDist = 40, margin = 40, spacing = 0) => {
    const r = seeded(seed);
    const out = [];
    for (let tries = 0; out.length < count && tries < count * 40; tries++) {
      const x = margin + r() * (W - margin * 2), y = margin + r() * (H - margin * 2);
      if (isLand(x, y)) continue;
      const d = distToCoast(x, y);
      if (d >= minDist && out.every((o) => (o.x - x) ** 2 + (o.y - y) ** 2 >= spacing ** 2)) out.push({ x, y, d });
    }
    return out;
  };
  return { W, H, lands, land: (id) => lands.find((l) => l.id === id), isLand, distToCoast, waterPoints };
}

// Checks a scenario against its own geometry. Returns a list of problems; empty means sound.
export function validateScenario(scenario, geo = buildGeometry(scenario)) {
  const problems = [];
  const inSheet = ([x, y]) => x >= 0 && y >= 0 && x <= geo.W && y <= geo.H;
  for (const [key, p] of Object.entries(scenario.places)) {
    if (!inSheet([p.x, p.y])) problems.push(`place "${key}" is off the sheet`);
    if (p.on === "land" && !geo.isLand(p.x, p.y)) problems.push(`place "${key}" should be on land`);
    if (p.on === "water" && geo.isLand(p.x, p.y)) problems.push(`place "${key}" should be in water`);
  }
  for (const [mode, fleet] of Object.entries(scenario.fleets ?? {})) {
    fleet.ships.forEach(([x, y], i) => { if (geo.isLand(x, y)) problems.push(`fleet "${mode}" ship ${i} is on land`); });
  }
  for (const role of ["station", "base"]) {
    const place = scenario[role]?.place;
    if (place && !scenario.places[place]) problems.push(`${role} names unknown place "${place}"`);
  }
  for (const f of scenario.features) {
    if (f.type === "posts" && !geo.land(f.along)) problems.push(`posts run along unknown land "${f.along}"`);
    if (f.type === "lighthouse" && !geo.isLand(...f.at)) problems.push("lighthouse is not on land");
    if (f.type === "anchorage" && geo.isLand(...f.at)) problems.push("anchorage is on land");
    if (f.type === "lane") {
      const wet = f.path.filter(([x, y]) => !geo.isLand(x, y)).length;
      if (wet < f.path.length) problems.push(`shipping lane crosses land at ${f.path.length - wet} points`);
    }
    for (const [x, y] of f.type === "reefs" ? f.at : []) if (geo.isLand(x, y)) problems.push(`reef at ${x},${y} is on land`);
  }
  return problems;
}
