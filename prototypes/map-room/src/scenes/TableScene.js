import Phaser from "phaser";
import { EASE, T, move, reducedMotion, seeded } from "../motion.js";
import { PLACES, TRUTH } from "../fixture.js";

// The chart sheet sits on the table at OX, OY and is MW × MH. World = screen until the
// night camera moves, so the desk layer can pin slips by world coordinates.
export const OX = 40, OY = 96, MW = 1840, MH = 944;
const C = {
  table: 0x221a14, paper: 0xeee9dc, land: 0xddd4c0, landEdge: 0x8c826f, contour: 0xc9bfa9,
  ink: 0x1b1a18, ink2: 0x4d4a44, brass: 0xc99a3e, brassDeep: 0x7a4f0c, red: 0xb4261f,
};
const LABEL = { fontFamily: "IBM Plex Sans", fontSize: "20px", color: "#1B1A18" };
const MUTED = { ...LABEL, color: "#4D4A44" };

export class TableScene extends Phaser.Scene {
  constructor() {
    super("table");
  }

  create() {
    this.rand = seeded("kestrel-strait");
    this.makeTextures();
    this.bakeBase();
    this.ring = { r: 250, dashed: false, alpha: 1, preview: null };
    this.ringG = this.add.graphics();
    this.ringLabel = this.add.text(OX + PLACES.beacon.x - 250, OY + PLACES.beacon.y - 290, "How far Beacon can see", MUTED);
    this.drawBeacon();
    this.boats = [];
    this.landingBoats = this.add.container(0, 0);
    this.drawHarbourBoats();
    this.warning = this.makeWarning();
    this.lattice = this.makeLattice();
    this.paths = this.add.graphics();
    this.pathT = { quiet: 0, joint: 0 };
    this.pathLabels = [];
    this.truth = this.makeTruth();
    this.night = this.add.rectangle(OX, OY, MW, MH, 0x0c0d12, 1).setOrigin(0).setAlpha(0);
    this.drawLight();
    this.redrawRing();
    this.scene.launch("desk");
  }

  // ── textures ──────────────────────────────────────────────────────────────
  makeTextures() {
    const grain = this.textures.createCanvas("grain", 256, 256);
    const g = grain.getContext();
    const img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 120 + this.rand() * 80;
      img.data[i] = v; img.data[i + 1] = v * 0.94; img.data[i + 2] = v * 0.82; img.data[i + 3] = 22;
    }
    g.putImageData(img, 0, 0);
    grain.refresh();

    const wood = this.textures.createCanvas("wood", 512, 512);
    const w = wood.getContext();
    w.fillStyle = "#221A14"; w.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 140; i++) {
      w.strokeStyle = `rgba(${60 + this.rand() * 30},${42 + this.rand() * 20},${28},${0.25 + this.rand() * 0.3})`;
      w.lineWidth = 1 + this.rand() * 2;
      const y = this.rand() * 512;
      w.beginPath(); w.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) w.lineTo(x, y + Math.sin(x / 70 + i) * 4);
      w.stroke();
    }
    wood.refresh();

    const lamp = this.textures.createCanvas("lamp", 1920, 1080);
    const l = lamp.getContext();
    const warm = l.createRadialGradient(760, 300, 80, 760, 420, 1300);
    warm.addColorStop(0, "rgba(255,226,170,0.16)"); warm.addColorStop(1, "rgba(255,226,170,0)");
    l.fillStyle = warm; l.fillRect(0, 0, 1920, 1080);
    lamp.refresh();
    const vig = this.textures.createCanvas("vignette", 1920, 1080);
    const v = vig.getContext();
    const vg = v.createRadialGradient(960, 520, 520, 960, 540, 1250);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.55)");
    v.fillStyle = vg; v.fillRect(0, 0, 1920, 1080);
    vig.refresh();

    const hatch = this.textures.createCanvas("hatch", 24, 24);
    const h = hatch.getContext();
    h.strokeStyle = "rgba(120,108,86,0.22)"; h.lineWidth = 1.2;
    h.beginPath(); h.moveTo(0, 24); h.lineTo(24, 0); h.moveTo(-6, 6); h.lineTo(6, -6); h.moveTo(18, 30); h.lineTo(30, 18); h.stroke();
    hatch.refresh();

    const boat = this.textures.createCanvas("boat", 64, 24);
    const b = boat.getContext();
    b.fillStyle = "#1B1A18";
    b.beginPath(); b.moveTo(4, 6); b.lineTo(46, 6); b.lineTo(60, 12); b.lineTo(46, 18); b.lineTo(4, 18); b.closePath(); b.fill();
    b.fillStyle = "#4D4A44"; b.fillRect(18, 9, 14, 6);
    boat.refresh();

    // landing craft: blunt bow ramp, square stern, drawn small and in ink
    const lc = this.textures.createCanvas("landingcraft", 30, 12);
    const c = lc.getContext();
    c.fillStyle = "#2B2522";
    c.beginPath(); c.moveTo(2, 2); c.lineTo(24, 2); c.lineTo(28, 4); c.lineTo(28, 8); c.lineTo(24, 10); c.lineTo(2, 10); c.closePath(); c.fill();
    c.fillStyle = "#6A5F55"; c.fillRect(5, 4, 15, 4);
    lc.refresh();

    const sweep = this.textures.createCanvas("sweep", 520, 520);
    const s = sweep.getContext();
    for (let a = 0; a < 40; a++) {
      s.fillStyle = `rgba(122,79,12,${0.16 * (1 - a / 40)})`;
      s.beginPath(); s.moveTo(260, 260);
      s.arc(260, 260, 250, -Math.PI / 2 - (a + 1) * 0.012, -Math.PI / 2 - a * 0.012); s.closePath(); s.fill();
    }
    sweep.refresh();
  }

  // ── room and chart: everything static is drawn once with Canvas 2D into one texture ──
  bakeBase() {
    const tex = this.textures.createCanvas("base", 1920, 1080);
    const x = tex.getContext();
    const P = (pts) => { x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y))); };
    // table
    x.fillStyle = x.createPattern(this.textures.get("wood").getSourceImage(), "repeat");
    x.fillRect(0, 0, 1920, 1080);
    // paper sheet with a soft shadow
    x.save(); x.shadowColor = "rgba(0,0,0,.55)"; x.shadowBlur = 60; x.shadowOffsetY = 26;
    x.fillStyle = "#EEE9DC"; x.fillRect(OX, OY, MW, MH); x.restore();
    x.save(); x.beginPath(); x.rect(OX, OY, MW, MH); x.clip();
    const westPts = this.coast(560, 34, "west", [{ y: 520, dx: 120, w: 40 }, { y: 760, dx: -40, w: 70 }]);
    const eastPts = this.coast(1290, 30, "east", [{ y: 345, dx: 70, w: 46 }, { y: 640, dx: -50, w: 80 }]);
    const W = westPts.map((p) => ({ x: OX + p.x, y: OY + p.y })), E = eastPts.map((p) => ({ x: OX + p.x, y: OY + p.y }));
    // graticule
    x.strokeStyle = "rgba(185,174,150,.45)"; x.lineWidth = 1;
    for (let gx = 230; gx < MW; gx += 230) { x.beginPath(); x.moveTo(OX + gx, OY); x.lineTo(OX + gx, OY + MH); x.stroke(); }
    for (let gy = 236; gy < MH; gy += 236) { x.beginPath(); x.moveTo(OX, OY + gy); x.lineTo(OX + MW, OY + gy); x.stroke(); }
    // depth contours
    for (const [off, a] of [[22, 0.9], [48, 0.65], [84, 0.4], [130, 0.22]]) {
      x.strokeStyle = `rgba(201,191,169,${a})`; x.lineWidth = 1.5;
      P(W.map((p) => ({ x: p.x + off, y: p.y }))); x.stroke();
      P(E.map((p) => ({ x: p.x - off, y: p.y }))); x.stroke();
    }
    // land, hatched inside its own outline
    const polys = [[{ x: OX, y: OY }, ...W, { x: OX, y: OY + MH }], [{ x: OX + MW, y: OY }, ...E, { x: OX + MW, y: OY + MH }],
      this.blob(880, 250, 46, "i1"), this.blob(1020, 780, 34, "i2"), this.blob(760, 120, 22, "i3")];
    for (const poly of polys) {
      P(poly); x.closePath(); x.fillStyle = "#DDD4C0"; x.fill();
      x.save(); x.clip();
      x.strokeStyle = "rgba(120,108,86,.20)"; x.lineWidth = 1.2;
      for (let d = -1100; d < 2000; d += 12) { x.beginPath(); x.moveTo(d, 1080); x.lineTo(d + 1080, 0); x.stroke(); }
      x.restore();
      P(poly); x.closePath(); x.strokeStyle = "#8C826F"; x.lineWidth = 2; x.stroke();
    }
    // soundings
    const r = seeded("soundings");
    x.font = "italic 15px Newsreader"; x.fillStyle = "rgba(140,130,111,.85)";
    for (let i = 0; i < 52; i++) {
      const y = 40 + r() * (MH - 80), k = Math.round(y / 8);
      const x0 = westPts[k].x + 70, x1 = eastPts[k].x - 70;
      if (x1 - x0 < 40) continue;
      const sx = x0 + r() * (x1 - x0);
      x.fillText(String(Math.round(8 + Math.sin(((sx - x0) / (x1 - x0)) * Math.PI) * 30 + r() * 6)), OX + sx, OY + y);
    }
    // shipping lane
    x.setLineDash([4, 10]); x.strokeStyle = "rgba(77,74,68,.8)"; x.lineWidth = 2;
    x.beginPath(); for (let y = 0; y <= MH; y += 6) x.lineTo(OX + 940 + Math.sin(y / 160) * 26, OY + y); x.stroke();
    // harbour zone
    x.fillStyle = "rgba(180,38,31,.07)"; x.beginPath(); x.ellipse(OX + PLACES.harbour.x, OY + PLACES.harbour.y, 130, 85, 0, 0, Math.PI * 2); x.fill();
    x.setLineDash([6, 6]); x.strokeStyle = "rgba(77,74,68,.9)"; x.stroke(); x.setLineDash([]);
    // labels
    const label = (s, lx, ly, { w = 400, c = "#1B1A18", f = "IBM Plex Sans", st = "", sz = 20 } = {}) => {
      x.font = `${st} ${w} ${sz}px ${f}`.trim(); x.fillStyle = c; x.textBaseline = "top"; x.fillText(s, lx, ly);
    };
    label("Shipping lane", OX + 968, OY + 118, { c: "#4D4A44" });
    label("Ravellan’s main harbour", OX + 1400, OY + 222, { w: 600 });
    label("where landing boats load", OX + 1400, OY + 248, { c: "#4D4A44" });
    label("Host country", OX + 60, OY + 870, { f: "Newsreader", st: "italic", sz: 36, c: "#6A655B" });
    label("Ravellan", OX + 1560, OY + 870, { f: "Newsreader", st: "italic", sz: 36, c: "#6A655B" });
    // compass rose
    const cx = OX + 1760, cy = OY + 110;
    x.strokeStyle = "#4D4A44"; x.lineWidth = 1.5; x.beginPath(); x.arc(cx, cy, 44, 0, Math.PI * 2); x.stroke();
    x.globalAlpha = 0.6; x.beginPath(); x.arc(cx, cy, 36, 0, Math.PI * 2); x.stroke(); x.globalAlpha = 1;
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2, r0 = i % 8 === 0 ? 30 : 38;
      x.beginPath(); x.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); x.lineTo(cx + Math.cos(a) * 44, cy + Math.sin(a) * 44); x.stroke();
    }
    x.fillStyle = "#1B1A18"; P([{ x: cx, y: cy - 58 }, { x: cx - 9, y: cy }, { x: cx + 9, y: cy }]); x.fill();
    x.fillStyle = "#EEE9DC"; P([{ x: cx, y: cy + 40 }, { x: cx - 9, y: cy }, { x: cx + 9, y: cy }]); x.closePath(); x.fill(); x.strokeStyle = "#1B1A18"; x.stroke();
    label("N", cx - 7, cy - 88, { w: 600 });
    // scale bar
    for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? "#EEE9DC" : "#1B1A18"; x.fillRect(OX + 1500 + i * 50, OY + 820, 50, 8); }
    x.strokeStyle = "#1B1A18"; x.lineWidth = 1.5; x.strokeRect(OX + 1500, OY + 820, 200, 8);
    label("0", OX + 1496, OY + 834, { sz: 14, c: "#4D4A44" }); label("10 nautical miles", OX + 1612, OY + 834, { sz: 14, c: "#4D4A44" });
    // paper grain
    x.globalCompositeOperation = "multiply";
    x.fillStyle = x.createPattern(this.textures.get("grain").getSourceImage(), "repeat");
    x.fillRect(OX, OY, MW, MH);
    x.restore();
    tex.refresh();
    this.add.image(0, 0, "base").setOrigin(0);
  }

  // A coastline as points every 8 px down the sheet: seeded waves plus named headlands.
  coast(baseX, amp, seed, bumps = []) {
    const r = seeded(seed);
    const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
    const pts = [];
    for (let y = 0; y <= MH; y += 8) {
      let x = baseX + Math.sin(y / 140 + ph[0]) * amp + Math.sin(y / 53 + ph[1]) * amp * 0.35 + Math.sin(y / 19 + ph[2]) * amp * 0.12;
      for (const bp of bumps) x += bp.dx * Math.exp(-((y - bp.y) ** 2) / (2 * bp.w ** 2));
      pts.push({ x, y });
    }
    return pts;
  }

  blob(cx, cy, r, seed) {
    const rr = seeded(seed);
    const ph = rr() * 6.28;
    const pts = [];
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      const k = r * (1 + 0.22 * Math.sin(a * 3 + ph) + 0.1 * Math.sin(a * 5 + ph * 2));
      pts.push({ x: OX + cx + Math.cos(a) * k * 1.3, y: OY + cy + Math.sin(a) * k });
    }
    return pts;
  }

  ellipsePts(cx, cy, rx, ry) {
    const pts = [];
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
    return pts;
  }

  // Phaser graphics have no dash; walk the polyline and draw every other segment.
  dashed(g, pts, dash, gap, width, color, alpha = 1, closed = false, upto = 1) {
    g.lineStyle(width, color, alpha);
    const list = closed ? [...pts, pts[0]] : pts;
    let total = 0;
    for (let i = 1; i < list.length; i++) total += Phaser.Math.Distance.BetweenPoints(list[i - 1], list[i]);
    const limit = total * upto;
    let run = 0, on = true, left = dash, walked = 0;
    for (let i = 1; i < list.length && walked < limit; i++) {
      let a = list[i - 1];
      const b = list[i];
      let seg = Phaser.Math.Distance.BetweenPoints(a, b);
      while (seg > 0 && walked < limit) {
        const step = Math.min(seg, left, limit - walked);
        const t = step / seg;
        const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        if (on) g.lineBetween(a.x, a.y, p.x, p.y);
        a = p; seg -= step; left -= step; walked += step; run += step;
        if (left <= 0) { on = !on; left = on ? dash : gap; }
      }
    }
  }

  drawBeacon() {
    const { x, y } = PLACES.beacon;
    this.sweep = this.add.image(OX + x, OY + y, "sweep").setAlpha(0.9);
    const g = this.add.graphics();
    g.fillStyle(C.ink, 1).fillRect(OX + x - 15, OY + y - 15, 30, 30);
    g.fillStyle(C.brass, 1).fillRect(OX + x - 7, OY + y - 7, 14, 14);
    g.lineStyle(2, C.ink, 1).lineBetween(OX + x, OY + y - 15, OX + x, OY + y - 40);
    g.fillStyle(C.ink, 1).fillCircle(OX + x, OY + y - 42, 4);
    this.add.text(OX + x - 330, OY + y - 34, "Beacon Station", { ...LABEL, fontStyle: "600" });
    this.add.text(OX + x - 330, OY + y - 8, "our radar and radio post", MUTED);
    // ambient loop 1 of 2: the radar sweep, 6 s a turn
    if (!reducedMotion.on) this.tweens.add({ targets: this.sweep, angle: 360, duration: 6000, repeat: -1 });
  }

  redrawRing() {
    const g = this.ringG.clear();
    const { x, y } = PLACES.beacon;
    const cx = OX + x, cy = OY + y;
    const draw = (r, dashed, alpha, width) => {
      g.fillStyle(C.brassDeep, 0.05 * alpha).fillCircle(cx, cy, r);
      if (dashed) this.dashed(g, this.ellipsePts(cx, cy, r, r), 12, 9, width, C.brassDeep, alpha, true);
      else g.lineStyle(width, C.brassDeep, alpha).strokeCircle(cx, cy, r);
      g.lineStyle(1.5, C.brassDeep, alpha * 0.8);
      for (let a = 0; a < 360; a += 10) {
        const rad = Phaser.Math.DegToRad(a), k = a % 30 === 0 ? 12 : 6;
        g.lineBetween(cx + Math.cos(rad) * r, cy + Math.sin(rad) * r, cx + Math.cos(rad) * (r - k), cy + Math.sin(rad) * (r - k));
      }
    };
    if (this.ring.preview) draw(this.ring.preview, true, 1, 3);
    draw(this.ring.r, this.ring.dashed, this.ring.preview ? 0.35 : this.ring.alpha, 3);
    this.ringLabel.setPosition(cx - 120, cy - (this.ring.preview || this.ring.r) - 34);
    this.sweep.setScale((this.ring.preview || this.ring.r) / 250);
  }

  // ── markers ───────────────────────────────────────────────────────────────
  drawHarbourBoats() {
    const r = seeded("landing-craft-december");
    for (let i = 0; i < 9; i++) {
      const s = this.add.image(OX + PLACES.harbour.x - 74 + (i % 3) * 40 + r() * 6, OY + PLACES.harbour.y - 36 + Math.floor(i / 3) * 24 + r() * 4, "landingcraft");
      s.setAngle(-14 + r() * 6);
      this.landingBoats.add(s);
    }
    this.landingBoats.setAlpha(0);
  }

  makeWarning() {
    const c = this.add.container(OX + PLACES.harbour.x - 10, OY + PLACES.harbour.y + 4);
    const dot = this.add.circle(0, 0, 15, C.red);
    const halo = this.add.circle(0, 0, 15, C.red, 0).setStrokeStyle(3, C.red, 1);
    const card = this.add.rectangle(30, 34, 300, 60, 0xf6ddd8).setOrigin(0).setStrokeStyle(2, C.red);
    const t1 = this.add.text(44, 42, "Landing boats sighted", { ...LABEL, color: "#7E1A15", fontStyle: "600" });
    const t2 = this.add.text(44, 66, "our early warning", { ...LABEL, color: "#7E1A15", fontSize: "18px" });
    c.add([halo, dot, card, t1, t2]);
    c.halo = halo;
    return c.setAlpha(0);
  }

  makeLattice() {
    const c = this.add.container(OX + 1240, OY + 470);
    const sq = this.add.rectangle(0, 0, 22, 22, C.brass).setStrokeStyle(2, C.brassDeep);
    const t1 = this.add.text(20, -14, "Lattice is asking:", { ...LABEL, fontStyle: "600" });
    const t2 = this.add.text(20, 10, "", LABEL);
    c.add([sq, t1, t2]);
    c.q = t2;
    return c.setAlpha(0);
  }

  makeTruth() {
    const c = this.add.container(0, 0);
    const g = this.add.graphics();
    const pts = [];
    for (let t = 0; t <= 1; t += 0.02) pts.push({ x: OX + Phaser.Math.Linear(1290, 760, t), y: OY + Phaser.Math.Linear(360, 500, t) + Math.sin(t * Math.PI) * -60 });
    this.dashed(g, pts, 5, 9, 3, C.red, 1);
    c.add(g);
    for (const tr of TRUTH) c.add(this.add.text(OX + tr.x, OY + tr.y, tr.text, { fontFamily: "Newsreader", fontStyle: "italic", fontSize: "26px", color: "#B4261F" }));
    const mask = this.make.graphics({ add: false });
    c.setMask(mask.createGeometryMask());
    c.maskG = mask;
    c.reveal = { w: 0 };
    c.setAlpha(0);
    return c;
  }

  drawLight() {
    this.add.image(0, 0, "lamp").setOrigin(0).setBlendMode(Phaser.BlendModes.ADD);
    this.add.image(0, 0, "vignette").setOrigin(0);
  }

  // ── commands used by the desk ─────────────────────────────────────────────
  setBoats(mode) {
    for (const b of this.boats) b.destroy();
    this.boats = [];
    const spots = {
      lane: [[960, 400, 80], [990, 470, 95], [940, 545, 85]],
      edge: [[870, 455, 200], [890, 525, 190], [915, 590, 172], [950, 420, 212]],
      none: [],
    }[mode];
    const r = seeded(`boats-${mode}`);
    spots.forEach(([x, y, a], i) => {
      const b = this.add.image(OX + x, OY + y, "boat").setAngle(a).setAlpha(0);
      this.boats.push(b);
      move(this, b, { alpha: 1 }, { dur: T.ui, delay: i * 80 });
      // ambient loop 2 of 2: a 2 px drift, seeded so replays match
      if (!reducedMotion.on) this.tweens.add({ targets: b, y: b.y + 2 + r(), duration: 4000 + r() * 600, yoyo: true, repeat: -1, ease: EASE.fade });
    });
    this.boatLabel?.destroy();
    if (mode === "lane") this.boatLabel = this.add.text(OX + 1012, OY + 560, "Ravellan coastguard boats", MUTED);
    if (mode === "edge") this.boatLabel = this.add.text(OX + 560, OY + 700, "Ravellan ships at Beacon’s edge", { ...LABEL, color: "#7E1A15", fontStyle: "600" });
  }

  showWarning(on, { pulse = true, delay = 0 } = {}) {
    move(this, [this.warning, this.landingBoats], { alpha: on ? 1 : 0 }, { dur: T.ui, delay });
    if (on && pulse && !reducedMotion.on) {
      this.warning.halo.setScale(1).setStrokeStyle(3, C.red, 1);
      this.tweens.add({ targets: this.warning.halo, scale: 2.6, alpha: { from: 1, to: 0 }, duration: 900, delay: delay + 200, ease: EASE.fade });
    }
  }

  showLattice(text, delay = 0) {
    if (!text) return move(this, this.lattice, { alpha: 0 }, { dur: T.ui });
    this.lattice.q.setText(text);
    move(this, this.lattice, { alpha: 1, x: [OX + 1280, OX + 1240] }, { dur: T.paper, delay });
  }

  tweenRing(props, dur = T.scene) {
    if (reducedMotion.on) {
      Object.assign(this.ring, props);
      return this.redrawRing();
    }
    this.tweens.add({ targets: this.ring, ...props, duration: dur, ease: EASE.travel, onUpdate: () => this.redrawRing() });
  }

  setRing(props) {
    Object.assign(this.ring, props);
    this.redrawRing();
  }

  setNight(on, dur = 800) {
    move(this, this.night, { alpha: on ? 0.45 : 0 }, { dur, ease: EASE.fade });
  }

  panTo(place, zoom = 1.15) {
    const cam = this.cameras.main;
    const p = place ? { x: OX + PLACES[place].x, y: OY + PLACES[place].y } : { x: 960, y: 540 };
    if (reducedMotion.on) {
      cam.centerOn(p.x, p.y);
      return cam.setZoom(place ? zoom : 1);
    }
    cam.pan(p.x, p.y, 900, EASE.travel, true);
    cam.zoomTo(place ? zoom : 1, 900, EASE.travel, true);
  }

  drawPaths(t = 1) {
    const g = this.paths.clear();
    const b = { x: OX + PLACES.beacon.x, y: OY + PLACES.beacon.y };
    const quiet = [], joint = [];
    for (let s = 0; s <= 1; s += 0.02) {
      quiet.push({ x: b.x + 20 + s * 150, y: b.y + 20 + Math.sin(s * 1.6) * 120 });
      joint.push({ x: b.x + 20 + s * 190, y: b.y - 20 - Math.sin(s * 1.6) * 110 });
    }
    this.dashed(g, quiet, 12, 9, 4, C.ink, 1, false, t);
    g.lineStyle(8, C.brass, 1);
    const n = Math.max(2, Math.round(joint.length * t));
    g.strokePoints(joint.slice(0, n), false);
    if (t >= 1 && !this.pathLabels.length) {
      this.pathLabels = [
        this.add.text(b.x + 70, b.y + 150, "Hold quietly", { ...LABEL, fontStyle: "600" }),
        this.add.text(b.x + 120, b.y - 160, "Stand together openly", { ...LABEL, fontStyle: "600", color: "#7A4F0C" }),
      ];
    }
  }

  revealPaths() {
    const o = { t: 0 };
    if (reducedMotion.on) return this.drawPaths(1);
    this.tweens.add({ targets: o, t: 1, duration: 1200, ease: EASE.travel, onUpdate: () => this.drawPaths(o.t), onComplete: () => this.drawPaths(1) });
  }

  revealTruth() {
    const c = this.truth;
    c.setAlpha(1);
    const draw = () => c.maskG.clear().fillStyle(0xffffff).fillRect(OX, OY, MW * c.reveal.w, MH);
    if (reducedMotion.on) { c.reveal.w = 1; return draw(); }
    this.tweens.add({ targets: c.reveal, w: 1, duration: 1500, ease: EASE.travel, onUpdate: draw });
  }

  reset() {
    this.cameras.main.setZoom(1).centerOn(960, 540);
    this.paths.clear();
    for (const l of this.pathLabels) l.destroy();
    this.pathLabels = [];
    this.truth.setAlpha(0);
    this.truth.reveal.w = 0;
    this.truth.maskG.clear();
    this.night.setAlpha(0);
    this.warning.setAlpha(0);
    this.landingBoats.setAlpha(0);
    this.lattice.setAlpha(0);
    this.setRing({ r: 250, dashed: false, alpha: 1, preview: null });
  }
}
