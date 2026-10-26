import Phaser from "phaser";
import { EASE, T, move, reducedMotion, seeded } from "../motion.js";
import { TRUTH } from "../fixture.js";
import { buildGeometry, validateScenario } from "../chart/geometry.js";
import { paintChart } from "../chart/paint.js";
import { getScenario } from "../scenarios/index.js";

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

  // Everything about the sea comes from the scenario (`?scenario=<id>`); this scene only
  // knows how to animate a station, a base, fleets and intel on whatever chart it gets.
  create() {
    this.sc = getScenario(new URLSearchParams(location.search).get("scenario"));
    this.geo = buildGeometry(this.sc);
    const { width, height } = this.sc.sheet;
    if (width !== MW || height !== MH) throw new Error(`Scenario sheet must be ${MW} × ${MH} to fit the table`);
    for (const problem of validateScenario(this.sc, this.geo)) console.warn(`[chart ${this.sc.id}] ${problem}`);
    this.rand = seeded(this.sc.id);
    this.makeTextures();
    this.bakeBase();
    this.ring = { r: this.range(), dashed: false, alpha: 1, preview: null };
    this.ringG = this.add.graphics();
    this.ringLabel = this.add.text(0, 0, `How far ${this.sc.station.name.split(" ")[0]} can see`, MUTED);
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
    this.night = this.add.rectangle(OX, OY, MW, MH, 0x0a1424, 1).setOrigin(0).setAlpha(0);
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
    warm.addColorStop(0, "rgba(255,226,170,0.09)"); warm.addColorStop(1, "rgba(255,226,170,0)");
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

    // A patrol vessel with its wake trailing astern (bow to the right).
    const boat = this.textures.createCanvas("boat", 110, 30);
    const b = boat.getContext();
    for (let k = 0; k < 4; k++) {
      b.strokeStyle = `rgba(255,255,255,${0.8 - k * 0.18})`; b.lineWidth = 2 - k * 0.3;
      b.beginPath(); b.moveTo(44 - k * 2, 11); b.lineTo(4 + k * 6, 3 + k); b.moveTo(44 - k * 2, 19); b.lineTo(4 + k * 6, 27 - k); b.stroke();
    }
    b.fillStyle = "rgba(255,255,255,.55)"; b.fillRect(14, 13, 32, 4);
    b.fillStyle = "#2A2523";
    b.beginPath(); b.moveTo(46, 8); b.lineTo(92, 8); b.lineTo(106, 15); b.lineTo(92, 22); b.lineTo(46, 22); b.closePath(); b.fill();
    b.fillStyle = "#7E1A15"; b.fillRect(46, 13, 46, 2);
    b.fillStyle = "#6E655C"; b.fillRect(60, 11, 18, 8); b.fillStyle = "#2A2523"; b.fillRect(68, 9, 3, 3);
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
    paintChart(tex.getContext(), this.sc, this.geo, {
      ox: OX, oy: OY,
      wood: this.textures.get("wood").getSourceImage(),
      grain: this.textures.get("grain").getSourceImage(),
    });
    tex.refresh();
    this.add.image(0, 0, "base").setOrigin(0);
  }

  // Sheet position of a named place, in world coordinates.
  at(place) {
    const p = this.sc.places[place];
    return { x: OX + p.x, y: OY + p.y };
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

  range() {
    return this.sc.station.range ?? 250;
  }

  drawBeacon() {
    const st = this.sc.station, { x, y } = this.at(st.place);
    this.sweep = this.add.image(x, y, "sweep").setAlpha(0.9);
    const g = this.add.graphics();
    g.fillStyle(C.ink, 1).fillRect(x - 15, y - 15, 30, 30);
    g.fillStyle(C.brass, 1).fillRect(x - 7, y - 7, 14, 14);
    g.lineStyle(2, C.ink, 1).lineBetween(x, y - 15, x, y - 40);
    g.fillStyle(C.ink, 1).fillCircle(x, y - 42, 4);
    const lx = st.side === "right" ? x + 40 : x - 330;
    this.add.text(lx, y - 34, st.name, { ...LABEL, fontStyle: "600" });
    this.add.text(lx, y - 8, st.note, MUTED);
    // ambient loop 1 of 2: the radar sweep, 6 s a turn
    if (!reducedMotion.on) this.tweens.add({ targets: this.sweep, angle: 360, duration: 6000, repeat: -1 });
  }

  redrawRing() {
    const g = this.ringG.clear();
    const { x: cx, y: cy } = this.at(this.sc.station.place);
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
    this.sweep.setScale((this.ring.preview || this.ring.r) / 250); // the sweep texture is 250 px
  }

  // ── markers ───────────────────────────────────────────────────────────────
  drawHarbourBoats() {
    const r = seeded("landing-craft-december");
    const h = this.at(this.sc.base.place);
    for (let i = 0; i < this.sc.base.craft; i++) {
      const s = this.add.image(h.x - 74 + (i % 3) * 40 + r() * 6, h.y - 36 + Math.floor(i / 3) * 24 + r() * 4, "landingcraft");
      s.setAngle(-14 + r() * 6);
      this.landingBoats.add(s);
    }
    this.landingBoats.setAlpha(0);
  }

  makeWarning() {
    const h = this.at(this.sc.base.place);
    const c = this.add.container(h.x - 10, h.y + 4);
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
    const [ix, iy] = this.sc.intel.at;
    const c = this.add.container(OX + ix, OY + iy);
    const sq = this.add.rectangle(0, 0, 22, 22, C.brass).setStrokeStyle(2, C.brassDeep);
    const t1 = this.add.text(20, -14, this.sc.intel.title ?? "Intercepts are asking:", { ...LABEL, fontStyle: "600" });
    const t2 = this.add.text(20, 10, "", LABEL);
    c.add([sq, t1, t2]);
    c.q = t2;
    return c.setAlpha(0);
  }

  makeTruth() {
    const c = this.add.container(0, 0);
    const g = this.add.graphics();
    // the route they really planned: from their base towards our station, bowed north
    const from = this.at(this.sc.base.place), to = this.at(this.sc.station.place), pts = [];
    for (let t = 0.08; t <= 0.92; t += 0.02) pts.push({ x: Phaser.Math.Linear(from.x, to.x, t), y: Phaser.Math.Linear(from.y, to.y, t) + Math.sin(t * Math.PI) * -60 });
    this.dashed(g, pts, 5, 9, 3, C.red, 1);
    c.add(g);
    // Anchors come from the story; the words arrive with revealTruth(), from the debrief.
    c.lines = TRUTH.map((tr) => {
      const p = this.at(tr.near);
      const t = this.add.text(p.x + tr.dx, p.y + tr.dy, "", { fontFamily: "Newsreader", fontStyle: "italic", fontSize: "26px", color: "#B4261F" });
      c.add(t);
      return t;
    });
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
    const fleet = this.sc.fleets[mode];
    const r = seeded(`boats-${mode}`);
    (fleet?.ships ?? []).forEach(([x, y, a], i) => {
      const b = this.add.image(OX + x, OY + y, "boat").setAngle(a).setAlpha(0);
      this.boats.push(b);
      move(this, b, { alpha: 1 }, { dur: T.ui, delay: i * 80 });
      // ambient loop 2 of 2: a 2 px drift, seeded so replays match
      if (!reducedMotion.on) this.tweens.add({ targets: b, y: b.y + 2 + r(), duration: 4000 + r() * 600, yoyo: true, repeat: -1, ease: EASE.fade });
    });
    this.boatLabel?.destroy();
    this.boatLabel = null;
    if (fleet?.label) {
      const { text, at: [lx, ly], tone } = fleet.label;
      this.boatLabel = this.add.text(OX + lx, OY + ly, text, tone === "danger" ? { ...LABEL, color: "#7E1A15", fontStyle: "600" } : MUTED);
    }
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
    const p = place ? this.at(place) : { x: 960, y: 540 };
    if (reducedMotion.on) {
      cam.centerOn(p.x, p.y);
      return cam.setZoom(place ? zoom : 1);
    }
    cam.pan(p.x, p.y, 900, EASE.travel, true);
    cam.zoomTo(place ? zoom : 1, 900, EASE.travel, true);
  }

  // Only routes that are actually on the table get drawn.
  drawPaths(t = 1, which = ["quiet", "joint"]) {
    const g = this.paths.clear();
    const b = this.at(this.sc.station.place);
    const quiet = [], joint = [];
    for (let s = 0; s <= 1; s += 0.02) {
      quiet.push({ x: b.x + 20 + s * 150, y: b.y + 20 + Math.sin(s * 1.6) * 120 });
      joint.push({ x: b.x + 20 + s * 190, y: b.y - 20 - Math.sin(s * 1.6) * 110 });
    }
    if (which.includes("quiet")) this.dashed(g, quiet, 12, 9, 4, C.ink, 1, false, t);
    if (which.includes("joint")) {
      g.lineStyle(8, C.brass, 1);
      g.strokePoints(joint.slice(0, Math.max(2, Math.round(joint.length * t))), false);
    }
    if (t >= 1 && !this.pathLabels.length) {
      if (which.includes("quiet")) this.pathLabels.push(this.add.text(b.x + 70, b.y + 150, "Hold quietly", { ...LABEL, fontStyle: "600" }));
      if (which.includes("joint")) this.pathLabels.push(this.add.text(b.x + 120, b.y - 160, "Stand together openly", { ...LABEL, fontStyle: "600", color: "#7A4F0C" }));
    }
  }

  revealPaths(which) {
    const o = { t: 0 };
    if (reducedMotion.on) return this.drawPaths(1, which);
    this.tweens.add({ targets: o, t: 1, duration: 1200, ease: EASE.travel, onUpdate: () => this.drawPaths(o.t, which), onComplete: () => this.drawPaths(1, which) });
  }

  revealTruth(lines = []) {
    const c = this.truth;
    c.lines.forEach((t, i) => t.setText(lines[i] ?? ""));
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
    this.setRing({ r: this.range(), dashed: false, alpha: 1, preview: null });
  }
}
