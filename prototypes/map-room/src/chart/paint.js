// Paints any scenario as an Admiralty-style chart onto a Canvas 2D context, once.
// Layers run in a fixed order (table, sheet, water, land, marks, frame, age); every map
// element a scenario can list in `features` is drawn by one entry in FEATURES below, so a
// new kind of mark is one new function, not an edit to the chart.
import { seeded } from "./random.js";

export const INK = {
  paper: "#F1EBDA", sea: "#EEF4F2", land: "#E2CB93", coast: "#4F4230", ink: "#1B1A18", ink2: "#4D4A44",
  magenta: "#A3326F", brassDeep: "#7A4F0C", relief: "rgba(150,118,70,.35)", sand: "rgba(196,166,104,.55)",
  shallows: ["#DCEBEC", "#C8E0E5", "#B3D3DC", "#9CC5D1"], contour: "rgba(92,140,156,.55)", sounding: "rgba(52,84,98,.85)",
};
const TINT_BANDS = [150, 96, 52, 22];

export function paintChart(x, scenario, geo, { ox, oy, wood, grain }) {
  const ink = { ...INK, ...scenario.inks };
  const at = (p) => ({ x: ox + p.x, y: oy + p.y });
  const P = (pts) => { x.beginPath(); pts.forEach((p, i) => { const q = at(p); i ? x.lineTo(q.x, q.y) : x.moveTo(q.x, q.y); }); };
  const label = (s, lx, ly, { w = 400, c = ink.ink, f = "IBM Plex Sans", st = "", sz = 20, align = "left" } = {}) => {
    x.font = `${st} ${w} ${sz}px ${f}`.trim(); x.fillStyle = c; x.textBaseline = "top"; x.textAlign = align;
    x.fillText(s, ox + lx, oy + ly); x.textAlign = "left";
  };
  const ctx = { x, scenario, geo, ink, at, P, label, ox, oy };
  const { W, H } = geo;

  // table and sheet
  x.fillStyle = x.createPattern(wood, "repeat"); x.fillRect(0, 0, x.canvas.width, x.canvas.height);
  x.save(); x.shadowColor = "rgba(0,0,0,.55)"; x.shadowBlur = 60; x.shadowOffsetY = 26;
  x.fillStyle = ink.paper; x.fillRect(ox, oy, W, H); x.restore();
  x.save(); x.beginPath(); x.rect(ox, oy, W, H); x.clip();
  x.fillStyle = ink.sea; x.fillRect(ox, oy, W, H);

  // water: shallow tints darkest at the shore, depth contours, engraved water-lining
  TINT_BANDS.forEach((off, i) => {
    x.fillStyle = ink.shallows[i];
    for (const l of geo.lands) { P(l.polygon(off)); x.closePath(); x.fill(); }
  });
  x.strokeStyle = ink.contour; x.lineWidth = 1.2;
  for (const off of TINT_BANDS) for (const l of geo.lands) { P(l.coastline(off)); x.stroke(); }
  for (let k = 1; k <= 5; k++) {
    x.strokeStyle = `rgba(60,104,122,${0.32 - k * 0.05})`; x.lineWidth = 0.8;
    for (const l of geo.lands) { P(l.coastline(k * 5)); x.stroke(); }
  }
  const grid = scenario.grid ?? { cols: 230, rows: 236 };
  x.strokeStyle = "rgba(92,120,130,.28)"; x.lineWidth = 1;
  for (let gx = grid.cols; gx < W; gx += grid.cols) { x.beginPath(); x.moveTo(ox + gx, oy); x.lineTo(ox + gx, oy + H); x.stroke(); }
  for (let gy = grid.rows; gy < H; gy += grid.rows) { x.beginPath(); x.moveTo(ox, oy + gy); x.lineTo(ox + W, oy + gy); x.stroke(); }

  // land: fill, inland height contours, sand at the shore, inked coastline, optional wash
  for (const l of geo.lands) {
    P(l.polygon(0)); x.closePath(); x.fillStyle = ink.land; x.fill();
    x.save(); x.clip();
    if (l.kind === "edge" && l.def.relief !== false) {
      x.strokeStyle = ink.relief; x.lineWidth = 1;
      for (const off of [36, 80, 140, 210, 300]) {
        P(l.coastline(-off).map((p, i) => ({ x: p.x - l.waterDir.x * Math.sin(i / 11 + off) * 14, y: p.y - l.waterDir.y * Math.sin(i / 11 + off) * 14 })));
        x.stroke();
      }
    }
    if (l.def.wash) {
      const c = l.coastline(0), dir = l.waterDir ?? { x: 0, y: 0 };
      const mid = c[Math.floor(c.length / 2)];
      const g = x.createLinearGradient(ox + mid.x - dir.x * 360, oy + mid.y - dir.y * 360, ox + mid.x, oy + mid.y);
      g.addColorStop(0, "rgba(140,160,110,.18)"); g.addColorStop(1, "rgba(140,160,110,0)");
      x.fillStyle = g; x.fillRect(ox, oy, W, H);
    }
    x.fillStyle = ink.sand;
    const st = seeded(`sand-${l.id}`), shore = l.coastline(0);
    for (let s = 0; s < (l.kind === "edge" ? 900 : 200); s++) {
      const p = at(shore[Math.floor(st() * shore.length)]);
      x.fillRect(p.x + (st() - 0.5) * 22, p.y + (st() - 0.5) * 8, 1.4, 1.4);
    }
    x.restore();
    P(l.polygon(0)); x.closePath(); x.strokeStyle = ink.coast; x.lineWidth = 2; x.stroke();
  }

  // soundings: depth grows with distance from the nearest coast; none under a mark or label
  const clear = keepClear(scenario);
  const open = (p) => !clear.some(([x0, y0, x1, y1]) => p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1);
  x.font = "italic 15px Newsreader"; x.fillStyle = ink.sounding; x.textBaseline = "alphabetic";
  const sr = seeded(`${scenario.id}-soundings`);
  for (const p of geo.waterPoints(scenario.soundings ?? 64, `${scenario.id}-soundings`, 30, 40, 44).filter(open)) {
    x.fillText(String(Math.round(3 + Math.min(p.d, 300) / 300 * 36 + sr() * 5)), ox + p.x, oy + p.y);
  }
  // wave marks in open water
  x.strokeStyle = "rgba(70,120,140,.28)"; x.lineWidth = 1.1;
  for (const p of geo.waterPoints(scenario.waves ?? 140, `${scenario.id}-waves`, 170, 24).filter(open)) {
    const q = at(p);
    x.beginPath(); x.moveTo(q.x - 8, q.y); x.quadraticCurveTo(q.x - 4, q.y - 4, q.x, q.y); x.quadraticCurveTo(q.x + 4, q.y + 4, q.x + 8, q.y); x.stroke();
  }

  // the scenario's own marks, then its labels
  for (const f of scenario.features) {
    const draw = FEATURES[f.type];
    if (!draw) throw new Error(`Chart feature "${f.type}" has no painter`);
    draw(ctx, f);
  }
  for (const l of scenario.land) if (l.name) label(l.name, l.nameAt[0], l.nameAt[1], { f: "Newsreader", sz: 30, c: "#6B5A3A" });
  for (const t of scenario.labels ?? []) {
    const style = { place: { f: "Newsreader", sz: 30 }, note: { c: ink.ink2 }, feature: { sz: 14, c: ink.magenta, w: 500 } }[t.style ?? "note"];
    label(t.text, t.at[0], t.at[1], style);
  }

  // frame: neatline with alternating degree bars and coordinate labels
  x.strokeStyle = ink.ink; x.lineWidth = 1; x.strokeRect(ox + 12, oy + 12, W - 24, H - 24);
  x.fillStyle = ink.ink;
  for (let i = 1; i < Math.ceil(W / 46); i += 2) { x.fillRect(ox + 12 + i * 46, oy + 6, 46, 6); x.fillRect(ox + 12 + i * 46, oy + H - 12, 46, 6); }
  for (let i = 1; i < Math.ceil(H / 47); i += 2) { x.fillRect(ox + 6, oy + 12 + i * 47, 6, 47); x.fillRect(ox + W - 12, oy + 12 + i * 47, 6, 47); }
  x.strokeRect(ox + 6, oy + 6, W - 12, H - 12);
  (grid.lat ?? []).forEach((s, i) => label(s, 18, grid.rows * (i + 1) - 6, { sz: 12, c: ink.ink2 }));
  (grid.lon ?? []).forEach((s, i) => label(s, grid.cols * (i + 1) + 6, 18, { sz: 12, c: ink.ink2 }));

  // age: fold creases, foxing, edge toning, grain
  for (const [fx, fy, w, h] of [[ox + W / 2, oy, 2, H], [ox, oy + H / 2, W, 2]]) {
    x.fillStyle = "rgba(255,255,255,.35)"; x.fillRect(fx, fy, w, h);
    x.fillStyle = "rgba(90,70,40,.12)"; x.fillRect(fx + (w === 2 ? 2 : 0), fy + (h === 2 ? 2 : 0), w, h);
  }
  const fox = seeded(`${scenario.id}-foxing`);
  for (let i = 0; i < 14; i++) {
    const fx = ox + fox() * W, fy = oy + fox() * H, fr = 10 + fox() * 40;
    const g = x.createRadialGradient(fx, fy, 0, fx, fy, fr);
    g.addColorStop(0, "rgba(150,110,60,.10)"); g.addColorStop(1, "rgba(150,110,60,0)");
    x.fillStyle = g; x.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
  }
  const tone = x.createRadialGradient(ox + W / 2, oy + H / 2, H * 0.45, ox + W / 2, oy + H / 2, W * 0.62);
  tone.addColorStop(0, "rgba(120,90,40,0)"); tone.addColorStop(1, "rgba(120,90,40,.16)");
  x.fillStyle = tone; x.fillRect(ox, oy, W, H);
  x.globalCompositeOperation = "multiply";
  x.fillStyle = x.createPattern(grain, "repeat"); x.fillRect(ox, oy, W, H);
  x.restore();
}

// Boxes [x0, y0, x1, y1] that soundings and wave marks stay out of: chart marks, labels,
// and the live objects' own labels, so numbers never print under words.
const textBox = ([tx, ty], text, size = 20) => {
  const lines = String(text).split("\n");
  return [tx - 8, ty - 8, tx + Math.max(...lines.map((l) => l.length)) * size * 0.56 + 8, ty + lines.length * size * 1.3 + 16];
};
const around = ([cx, cy], r) => [cx - r, cy - r, cx + r, cy + r];
export function keepClear(sc) {
  const boxes = [];
  for (const f of sc.features) {
    if (f.type === "rose") boxes.push(around(f.at, (f.r ?? 76) + 30));
    if (f.type === "cartouche") boxes.push([f.at[0], f.at[1], f.at[0] + (f.width ?? 330), f.at[1] + 104]);
    if (f.type === "scale") boxes.push([f.at[0] - 10, f.at[1] - 10, f.at[0] + (f.length ?? 200) + 10, f.at[1] + 36]);
    if (f.type === "lighthouse" || f.type === "anchorage") boxes.push(around(f.at, 56));
    if (f.type === "zone") boxes.push([f.at[0] - f.rx, f.at[1] - f.ry, f.at[0] + f.rx, f.at[1] + f.ry]);
    if (f.type === "reefs") for (const r of f.at) boxes.push(around(r, 34));
    if (f.label?.text) boxes.push(textBox(f.label.at, f.label.text, 14));
  }
  for (const l of sc.labels ?? []) boxes.push(textBox(l.at, l.text, l.style === "place" ? 30 : 20));
  for (const p of Object.values(sc.places)) boxes.push(around([p.x, p.y], 44));
  const st = sc.station && sc.places[sc.station.place];
  if (st) boxes.push(sc.station.side === "right" ? [st.x + 30, st.y - 44, st.x + 360, st.y + 26] : [st.x - 340, st.y - 44, st.x - 20, st.y + 26]);
  for (const fl of Object.values(sc.fleets ?? {})) if (fl.label) boxes.push(textBox(fl.label.at, fl.label.text));
  if (sc.intel) boxes.push([sc.intel.at[0] - 16, sc.intel.at[1] - 24, sc.intel.at[0] + 420, sc.intel.at[1] + 40]);
  if (sc.base) { const b = sc.places[sc.base.place]; boxes.push([b.x + 10, b.y + 30, b.x + 340, b.y + 104]); }
  return boxes;
}

// One painter per feature type. Each gets the shared context and its own definition.
export const FEATURES = {
  // A traffic lane: two dashed magenta edges either side of a centre path, with arrows.
  lane({ x, ink, at, label }, f) {
    const half = (f.width ?? 52) / 2;
    const pts = f.path.map(([px, py]) => ({ x: px, y: py }));
    const normal = (i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
      return { x: -dy / len, y: dx / len };
    };
    x.strokeStyle = ink.magenta; x.lineWidth = 2; x.setLineDash([14, 8]);
    for (const side of [-half, half]) {
      x.beginPath();
      pts.forEach((p, i) => { const n = normal(i), q = at({ x: p.x + n.x * side, y: p.y + n.y * side }); i ? x.lineTo(q.x, q.y) : x.moveTo(q.x, q.y); });
      x.stroke();
    }
    x.setLineDash([]); x.fillStyle = ink.magenta;
    for (const { t, dir } of f.arrows ?? []) {
      const i = Math.round(t * (pts.length - 1)), p = pts[i], n = normal(i);
      // `dir` 1 points along the path as listed, -1 against it; the arrow sits on its own side
      const ahead = { x: n.y * dir, y: -n.x * dir }, side = dir * 11;
      const c = at({ x: p.x + n.x * side, y: p.y + n.y * side });
      x.beginPath(); x.moveTo(c.x + ahead.x * 14, c.y + ahead.y * 14);
      x.lineTo(c.x - ahead.x * 6 + n.x * 6, c.y - ahead.y * 6 + n.y * 6); x.lineTo(c.x - ahead.x * 6 - n.x * 6, c.y - ahead.y * 6 - n.y * 6); x.closePath(); x.fill();
    }
    if (f.label) label(f.label.text, f.label.at[0], f.label.at[1], { c: ink.magenta, w: 500 });
  },

  // A hostile anchorage or base: red wash, dashed edge, optional craft are live objects.
  zone({ x, ink, at }, f) {
    const c = at({ x: f.at[0], y: f.at[1] });
    x.fillStyle = "rgba(180,38,31,.08)"; x.beginPath(); x.ellipse(c.x, c.y, f.rx, f.ry, 0, 0, Math.PI * 2); x.fill();
    x.setLineDash([6, 6]); x.strokeStyle = "rgba(126,26,21,.8)"; x.lineWidth = 1.6; x.stroke(); x.setLineDash([]);
  },

  lighthouse({ x, ink, at, label }, f) {
    const c = at({ x: f.at[0], y: f.at[1] }), d = f.facing === "west" ? -1 : 1;
    x.fillStyle = ink.magenta; x.beginPath(); x.moveTo(c.x, c.y);
    x.quadraticCurveTo(c.x + 30 * d, c.y - 22, c.x + 40 * d, c.y - 6); x.quadraticCurveTo(c.x + 22 * d, c.y + 4, c.x, c.y); x.fill();
    x.fillStyle = ink.ink; x.beginPath(); x.arc(c.x, c.y, 4, 0, Math.PI * 2); x.fill();
    if (f.light) label(f.light, f.at[0] - 12 * d, f.at[1] + 10, { sz: 13, c: ink.magenta, w: 500, align: d > 0 ? "right" : "left" });
  },

  anchorage({ x, ink, at, label }, f) {
    const c = at({ x: f.at[0], y: f.at[1] });
    x.save(); x.strokeStyle = ink.magenta; x.lineWidth = 2;
    x.beginPath(); x.arc(c.x, c.y - 12, 3, 0, Math.PI * 2); x.moveTo(c.x, c.y - 9); x.lineTo(c.x, c.y + 8);
    x.moveTo(c.x - 6, c.y - 4); x.lineTo(c.x + 6, c.y - 4); x.moveTo(c.x - 9, c.y + 2); x.quadraticCurveTo(c.x, c.y + 14, c.x + 9, c.y + 2); x.stroke();
    x.restore();
    if (f.label) label(f.label, f.at[0] + 16, f.at[1] - 10, { sz: 14, c: ink.magenta });
  },

  // Listening posts (or any shore installations) spaced along a named coast, set inland.
  posts({ x, ink, at, geo, label }, f) {
    const land = geo.land(f.along), shore = land.coastline(-(f.inset ?? 26));
    const from = f.from ?? 0.05, to = f.to ?? 0.95;
    x.fillStyle = ink.brassDeep; x.strokeStyle = ink.brassDeep; x.lineWidth = 1.5;
    for (let i = 0; i < f.count; i++) {
      const p = at(shore[Math.round((from + (to - from) * (i / Math.max(1, f.count - 1))) * (shore.length - 1))]);
      x.beginPath(); x.moveTo(p.x, p.y - 9); x.lineTo(p.x - 6, p.y + 5); x.lineTo(p.x + 6, p.y + 5); x.closePath(); x.fill();
      x.beginPath(); x.arc(p.x, p.y - 11, 5, -Math.PI * 0.85, -Math.PI * 0.15); x.stroke();
    }
    if (f.label) label(f.label.text, f.label.at[0], f.label.at[1], { sz: 14, c: ink.brassDeep, w: 600 });
  },

  reefs({ x, ink, at, scenario }, f) {
    const r = seeded(`${scenario.id}-reefs`);
    x.strokeStyle = ink.ink; x.fillStyle = ink.ink; x.lineWidth = 1.4;
    for (const [rx, ry, n = 4] of f.at) for (let i = 0; i < n; i++) {
      const p = at({ x: rx + (r() - 0.5) * 50, y: ry + (r() - 0.5) * 30 });
      x.beginPath(); x.moveTo(p.x - 4, p.y); x.lineTo(p.x + 4, p.y); x.moveTo(p.x, p.y - 4); x.lineTo(p.x, p.y + 4); x.stroke();
      x.beginPath(); x.arc(p.x, p.y, 1.5, 0, Math.PI * 2); x.fill();
    }
  },

  woods({ x, at, scenario }, f) {
    const r = seeded(`${scenario.id}-woods`);
    x.strokeStyle = "rgba(96,118,70,.55)"; x.lineWidth = 1;
    for (const [cx, cy, n = 30] of f.at) for (let i = 0; i < n; i++) {
      const p = at({ x: cx + (r() - 0.5) * 150, y: cy + (r() - 0.5) * 110 });
      x.beginPath(); x.arc(p.x, p.y, 3.5, 0, Math.PI * 2); x.stroke();
      x.beginPath(); x.moveTo(p.x, p.y + 3.5); x.lineTo(p.x, p.y + 7); x.stroke();
    }
  },

  towns({ x, at, scenario }, f) {
    const r = seeded(`${scenario.id}-towns`);
    x.fillStyle = "rgba(60,48,32,.75)";
    for (const [cx, cy, n = 16] of f.at) for (let i = 0; i < n; i++) {
      const p = at({ x: cx + (i % 4) * 9 + r() * 3, y: cy + Math.floor(i / 4) * 9 + r() * 3 });
      x.fillRect(p.x, p.y, 6, 6);
    }
  },

  // A full compass rose: degree ring, cardinal star, magnetic variation.
  rose({ x, ink, at }, f) {
    const { x: cx, y: cy } = at({ x: f.at[0], y: f.at[1] }), R = f.r ?? 76;
    x.save(); x.strokeStyle = ink.magenta; x.fillStyle = ink.magenta; x.lineWidth = 1.2;
    for (const rr of [R, R - 10, R - 30]) { x.beginPath(); x.arc(cx, cy, rr, 0, Math.PI * 2); x.stroke(); }
    for (let d = 0; d < 360; d += 5) {
      const a = (d - 90) * Math.PI / 180, k = d % 30 === 0 ? 10 : d % 10 === 0 ? 7 : 4;
      x.beginPath(); x.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); x.lineTo(cx + Math.cos(a) * (R - k), cy + Math.sin(a) * (R - k)); x.stroke();
    }
    x.font = "500 10px IBM Plex Sans"; x.textAlign = "center"; x.textBaseline = "middle";
    for (let d = 30; d < 360; d += 30) { const a = (d - 90) * Math.PI / 180; x.fillText(String(d), cx + Math.cos(a) * (R - 20), cy + Math.sin(a) * (R - 20)); }
    for (let i = 0; i < 8; i++) {
      const a = (i * 45 - 90) * Math.PI / 180, len = i % 2 ? R * 0.42 : R * 0.7, wdt = i % 2 ? 5 : 8;
      const tip = { x: cx + Math.cos(a) * len, y: cy + Math.sin(a) * len };
      const l = { x: cx + Math.cos(a - Math.PI / 2) * wdt, y: cy + Math.sin(a - Math.PI / 2) * wdt };
      const rg = { x: cx + Math.cos(a + Math.PI / 2) * wdt, y: cy + Math.sin(a + Math.PI / 2) * wdt };
      x.fillStyle = ink.magenta; x.beginPath(); x.moveTo(cx, cy); x.lineTo(l.x, l.y); x.lineTo(tip.x, tip.y); x.closePath(); x.fill();
      x.fillStyle = ink.paper; x.beginPath(); x.moveTo(cx, cy); x.lineTo(rg.x, rg.y); x.lineTo(tip.x, tip.y); x.closePath(); x.fill(); x.stroke();
    }
    x.fillStyle = ink.ink; x.font = "600 16px IBM Plex Sans"; x.fillText("N", cx, cy - R - 12);
    if (f.variation) { x.fillStyle = ink.magenta; x.font = "11px IBM Plex Sans"; x.fillText(f.variation, cx, cy + R + 14); }
    x.restore();
  },

  scale({ x, ink, label, ox, oy }, f) {
    const [sx, sy] = f.at, seg = (f.length ?? 200) / 4;
    for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? ink.paper : ink.ink; x.fillRect(ox + sx + i * seg, oy + sy, seg, 8); }
    x.strokeStyle = ink.ink; x.lineWidth = 1.5; x.strokeRect(ox + sx, oy + sy, seg * 4, 8);
    label("0", sx - 4, sy + 14, { sz: 14, c: ink.ink2 }); label(f.label, sx + seg * 2, sy + 14, { sz: 14, c: ink.ink2 });
  },

  cartouche({ x, ink, label, ox, oy }, f) {
    const [cx, cy] = f.at, w = f.width ?? 330, h = 104;
    x.fillStyle = "rgba(241,235,218,.94)"; x.fillRect(ox + cx, oy + cy, w, h);
    x.strokeStyle = ink.ink; x.lineWidth = 1.5; x.strokeRect(ox + cx, oy + cy, w, h); x.lineWidth = 0.8; x.strokeRect(ox + cx + 6, oy + cy + 6, w - 12, h - 12);
    label(f.title, cx + w / 2, cy + 18, { f: "Newsreader", sz: 32, align: "center" });
    if (f.subtitle) label(f.subtitle, cx + w / 2, cy + 64, { sz: 13, c: ink.ink2, align: "center" });
  },
};
