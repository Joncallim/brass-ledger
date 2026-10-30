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
  // `data` comes from a theatre change (DeskScene.newTheatre) and is passed on to the desk.
  create(data = {}) {
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
    this.scene.launch("desk", data);
  }

  // ── textures ──────────────────────────────────────────────────────────────
  makeTextures() {
    // A theatre change restarts this scene; the old chart's textures go first.
    for (const key of ["grain", "wood", "lamp", "vignette", "hatch", "boat", "friend", "unit", "landingcraft", "sweep", "base"]) if (this.textures.exists(key)) this.textures.remove(key);
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

    // Our ships and the ally's: the same hull in navy grey with a brass band, so the two
    // sides read apart at a glance.
    const fr = this.textures.createCanvas("friend", 110, 30);
    const f = fr.getContext();
    for (let k = 0; k < 3; k++) {
      f.strokeStyle = `rgba(255,255,255,${0.7 - k * 0.2})`; f.lineWidth = 2 - k * 0.4;
      f.beginPath(); f.moveTo(44 - k * 2, 11); f.lineTo(8 + k * 6, 4 + k); f.moveTo(44 - k * 2, 19); f.lineTo(8 + k * 6, 26 - k); f.stroke();
    }
    f.fillStyle = "#3E4F5E";
    f.beginPath(); f.moveTo(46, 8); f.lineTo(92, 8); f.lineTo(106, 15); f.lineTo(92, 22); f.lineTo(46, 22); f.closePath(); f.fill();
    f.fillStyle = "#C99A3E"; f.fillRect(46, 13, 46, 3);
    f.fillStyle = "#8C9AA6"; f.fillRect(60, 11, 18, 8);
    fr.refresh();

    // The battalion as a map symbol: an infantry box (a cross inside a rectangle), in brass.
    const un = this.textures.createCanvas("unit", 52, 36);
    const u = un.getContext();
    u.fillStyle = "#F3E6C4"; u.fillRect(2, 2, 48, 32);
    u.strokeStyle = "#1B1A18"; u.lineWidth = 3; u.strokeRect(2, 2, 48, 32);
    u.beginPath(); u.moveTo(2, 2); u.lineTo(50, 34); u.moveTo(50, 2); u.lineTo(2, 34); u.stroke();
    u.fillStyle = "#C99A3E"; u.fillRect(20, -1, 12, 5);
    un.refresh();

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
      t.home = { x: t.x, y: t.y };
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
    const x = OX + this.sc.intel.at[0];
    move(this, this.lattice, { alpha: 1, x: [x + 40, x] }, { dur: T.paper, delay });
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

  // What the orders on the desk would do, pinned to the place they act on: each slip's current
  // choice puts one note on the chart, so the map shows the plan as it is being made.
  setNotes(list = []) {
    for (const n of this.noteObjs ?? []) n.destroy();
    this.noteObjs = [];
    const OFF = { beacon: [46, 30], harbour: [-560, 60], lane: [46, -70] };
    const INK = { ok: "#1B1A18", warn: "#6B4508", bad: "#7E1A15" };
    const stack = {};
    for (const n of list) {
      const p = this.at(n.at), [dx, dy] = OFF[n.at] ?? [40, 0], k = (stack[n.at] = (stack[n.at] ?? -1) + 1);
      const t = this.add.text(p.x + dx, p.y + dy + k * 38, n.text, {
        fontFamily: "IBM Plex Sans", fontSize: "19px", fontStyle: "600", color: INK[n.tone ?? "ok"],
        backgroundColor: "rgba(246,241,228,0.94)", padding: { x: 10, y: 5 },
      });
      t.setX(Math.min(t.x, OX + MW - 16 - t.width));
      this.noteObjs.push(t);
    }
  }

  // ── the showdown, played on the chart ─────────────────────────────────────
  // February resolves as five steps the report reads in step with: they sail, we move,
  // contact, how it ended, and the cost. Every step has an end state, so skipping, reduced
  // motion and a full play all leave the chart showing what the report says.
  showdownSetup(f) {
    this.showdownClear();
    this.setBoats("none");
    this.boatLabel?.destroy(); this.boatLabel = null;
    this.warning.setAlpha(0); this.landingBoats.setAlpha(0);
    const toSheet = (p) => ({ x: p.x - OX, y: p.y - OY }), land = (p) => this.geo.isLand(p.x - OX, p.y - OY);
    const lane = this.sc.features.find((x) => x.type === "lane")?.path ?? [];
    const laneAt = (y) => OX + (lane.reduce((best, p) => (Math.abs(p[1] - (y - OY)) < Math.abs(best[1] - (y - OY)) ? p : best), lane[0] ?? [toSheet(this.at("lane")).x, 0])[0]);
    const seaward = (p, step = 6) => { const q = { ...p }; for (let i = 0; i < 120 && land(q); i++) q.x += step; return { x: q.x + 20, y: q.y }; };
    const B = this.at(this.sc.station.place), H = this.at(this.sc.base.place);
    const beach = seaward(B), approach = { x: beach.x + 170, y: beach.y };
    const flank = [130, -130, 180, -180].map((dy) => seaward({ x: B.x, y: B.y + dy })).find((p) => !land(p) && p.y > OY + 40 && p.y < OY + MH - 40) ?? beach;
    const route = [H, { x: laneAt(H.y), y: H.y }, { x: laneAt((H.y + B.y) / 2) + 40, y: (H.y + B.y) / 2 }, approach];
    let reserve = { x: B.x - 170, y: B.y + 70 };
    if (!land(reserve)) reserve = { x: B.x - 90, y: B.y + 40 };
    let dug = { x: beach.x - 46, y: beach.y + 24 };
    if (!land(dug)) dug = { x: B.x - 10, y: B.y + 30 };
    const friendStart = seaward({ x: B.x - 60, y: Math.min(OY + MH - 60, B.y + 280) });
    const lineX = approach.x + 70, line = [-80, 0, 80].map((dy) => ({ x: lineX, y: approach.y + dy }));
    const P = this.sd = { f, beach, approach, flank, route, reserve, dug, friendStart, line, H, B, timers: [] };
    // Where the explaining labels go: under the harbour, and above the station's seaward side.
    P.callAt = { harbour: { x: H.x, y: H.y + 112 }, beacon: { x: B.x + 150, y: B.y - 70 }, contact: { x: B.x + 150, y: B.y - 112 } };
    const later = (ms, fn) => P.timers.push(this.time.delayedCall(ms, fn));

    const ship = (key, x, y) => this.add.image(x, y, key).setScale(0.62);
    P.escorts = this.add.container(H.x, H.y, [ship("boat", 18, -26), ship("boat", 18, 26), ship("boat", 46, 0), ship("boat", -14, 0)]);
    const n = Math.min(8, f.craft);
    P.craft = this.add.container(H.x, H.y, Array.from({ length: n }, (_, i) => this.add.image(-60 - (i % 4) * 26, -18 + Math.floor(i / 4) * 30, "landingcraft")));
    P.friends = this.add.container(friendStart.x, friendStart.y, line.map((p, i) => ship("friend", 0, (i - 1) * 34)));
    P.unit = this.add.container(reserve.x, reserve.y, [this.add.image(0, 0, "unit"), this.add.text(-80, 22, f.unitName, { ...MUTED, fontSize: "16px", fontStyle: "600", color: "#1B1A18", align: "center", fixedWidth: 160 })]);
    P.trench = this.add.graphics();
    P.fx = this.add.graphics();
    P.tags = [];
    for (const o of [P.escorts, P.craft, P.friends, P.unit]) o.setAlpha(0);
    P.escorts.rotation = P.craft.rotation = Math.atan2(route[1].y - H.y, route[1].x - H.x);

    const go = (obj, pts, dur, turn = obj !== P.unit) => {
      // Along a polyline, bow first.
      const segs = [], total = pts.slice(1).reduce((s, p, i) => s + Phaser.Math.Distance.BetweenPoints(pts[i], p), 0) || 1;
      const t = { v: 0 };
      this.tweens.add({ targets: t, v: 1, duration: dur, ease: EASE.travel, onUpdate: () => {
        let d = t.v * total;
        for (let i = 1; i < pts.length; i++) {
          const len = Phaser.Math.Distance.BetweenPoints(pts[i - 1], pts[i]);
          if (d <= len || i === pts.length - 1) {
            const k = len ? Math.min(1, d / len) : 1;
            obj.setPosition(pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k, pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k);
            if (turn) obj.rotation = Math.atan2(pts[i].y - pts[i - 1].y, pts[i].x - pts[i - 1].x);
            break;
          }
          d -= len;
        }
      } });
      segs.push(t);
    };
    const place = (obj, p, angleFrom) => { obj.setPosition(p.x, p.y); if (angleFrom) obj.rotation = Math.atan2(p.y - angleFrom.y, p.x - angleFrom.x); };
    const flash = (p, count = 6, dur = 1600) => {
      const r = seeded(`fx-${p.x}-${p.y}`);
      for (let i = 0; i < count; i++) {
        const c = this.add.circle(p.x + (r() - 0.5) * 70, p.y + (r() - 0.5) * 50, 6, i % 2 ? 0xe2702a : C.red).setAlpha(0);
        P.tags.push(c);
        this.tweens.add({ targets: c, alpha: { from: 0.95, to: 0 }, scale: { from: 0.6, to: 2.4 }, duration: 520, delay: (i * dur) / count });
      }
    };
    const trench = () => {
      P.trench.clear().lineStyle(5, C.red, 0.9);
      for (let i = 0; i < 7; i++) P.trench.lineBetween(dug.x - 30 + i * 9, dug.y - 30 + i * 9, dug.x - 22 + i * 9, dug.y - 18 + i * 9);
    };
    const tag = (p, text, color = "#7E1A15") => P.tags.push(this.add.text(p.x, p.y, text, { ...LABEL, fontSize: "18px", fontStyle: "600", color, backgroundColor: "rgba(246,241,228,0.94)", padding: { x: 8, y: 4 } }).setOrigin(0.5));
    const home = [approach, route[2], route[1], H];
    const landed = ["held", "repelled", "landed", "lost"].includes(f.code);
    const turned = !landed;

    // Each step: what plays, and the state it leaves.
    P.steps = [
      { // 1 · they sail
        play: () => { P.escorts.setAlpha(1); P.craft.setAlpha(1); go(P.escorts, route, 2600); later(250, () => go(P.craft, route.map((p) => ({ x: p.x - 10, y: p.y })), 2600)); },
        end: () => { P.escorts.setAlpha(1); P.craft.setAlpha(1); place(P.escorts, approach, route[2]); place(P.craft, { x: approach.x - 10, y: approach.y }, route[2]); },
        dur: 2900,
      },
      { // 2 · we move
        play: () => {
          if (f.route === "joint") { P.friends.setAlpha(1); go(P.friends, [friendStart, { x: lineX, y: friendStart.y }, line[1]], 2000); }
          P.unit.setAlpha(1);
          if (f.route === "forward") { go(P.unit, [reserve, dug], 1600); later(1500, trench); }
        },
        end: () => {
          if (f.route === "joint") { P.friends.setAlpha(1); place(P.friends, line[1]); P.friends.rotation = -Math.PI / 2; }
          P.unit.setAlpha(1); P.unit.rotation = 0;
          if (f.route === "forward") { place(P.unit, dug); trench(); } else place(P.unit, reserve);
        },
        dur: 2200,
      },
      { // 3 · contact
        play: () => {
          if (f.code === "stopped") flash({ x: (line[1].x + approach.x) / 2 + 20, y: approach.y }, 5);
          if (landed) {
            const target = f.code === "landed" ? flank : beach;
            go(P.craft, f.code === "landed" ? [approach, { x: approach.x, y: flank.y }, target] : [approach, target], 1800);
            later(1500, () => flash(f.code === "repelled" ? dug : target, 8));
            if (f.route !== "forward") later(f.warned ? 300 : 1900, () => go(P.unit, [reserve, dug], 900));
            if (f.code === "lost") later(2000, () => { this.sd.flag = this.flag(B); });
          }
        },
        end: () => {
          P.unit.rotation = 0;
          if (landed) {
            place(P.craft, f.code === "landed" ? flank : beach);
            if (f.route !== "forward") place(P.unit, dug);
            if (f.code === "lost" && !P.flag) P.flag = this.flag(B);
          }
        },
        dur: 2600,
      },
      { // 4 · how it ended
        play: () => {
          if (turned) { go(P.escorts, home, 2600); later(200, () => go(P.craft, home.map((p) => ({ x: p.x - 10, y: p.y })), 2600)); }
          else if (f.code === "lost") { go(P.unit, [P.unit, reserve], 1400); go(P.escorts, [approach, { x: approach.x - 60, y: approach.y }], 1400); }
          else { this.tweens.add({ targets: P.craft, alpha: 0, duration: 1400 }); flash(f.code === "landed" ? flank : beach, 4, 900); go(P.escorts, home, 2600); }
        },
        end: () => {
          P.unit.rotation = 0;
          if (turned) { place(P.escorts, H, home[2]); place(P.craft, { x: H.x - 10, y: H.y }, home[2]); }
          else if (f.code === "lost") { place(P.unit, reserve); place(P.escorts, { x: approach.x - 60, y: approach.y }); }
          else { P.craft.setAlpha(0); place(P.escorts, H, home[2]); }
        },
        dur: 2900,
      },
      { // 5 · the cost
        play: () => this.showdownTags(),
        end: () => this.showdownTags(),
        dur: 900,
      },
    ];
    P.tagged = false;
    P.showdownTag = tag;
  }

  // Where the report can sit without covering the action: the first corner of the table
  // whose box keeps clear of every place the showdown uses.
  showdownCorner(w, h) {
    const P = this.sd;
    if (!P) return [56, 108];
    // The battalion's whole path and its labels must stay visible; ships and labels at sea
    // matter too, but less.
    const vital = [P.B, P.beach, P.flank, P.reserve, P.dug, { x: P.reserve.x, y: P.reserve.y - 60 }, { x: P.reserve.x, y: P.reserve.y + 60 }, { x: P.dug.x, y: P.dug.y - 60 }, P.callAt.beacon, P.callAt.contact];
    const other = [P.H, P.approach, ...P.line, P.friendStart, ...P.route, P.callAt.harbour];
    const covered = (pts, [x, y], ww) => pts.filter((p) => p.x > x - 80 && p.x < x + ww + 80 && p.y > y - 70 && p.y < y + h + 70).length;
    for (const ww of [w, 460]) {
      const corners = [[56, 108], [1864 - ww, 1040 - h], [56, 1040 - h], [1864 - ww, 108]];
      const clear = corners.filter((c) => covered(vital, c, ww) === 0);
      if (clear.length) { const best = clear.reduce((a, c) => (covered(other, c, ww) < covered(other, a, ww) ? c : a)); this.sdPanelWidth = ww; return best; }
    }
    this.sdPanelWidth = 460;
    const corners = [[56, 108], [1404, 1040 - h], [56, 1040 - h], [1404, 108]];
    return corners.reduce((a, c) => (covered(vital, c, 460) * 10 + covered(other, c, 460) < covered(vital, a, 460) * 10 + covered(other, a, 460) ? c : a));
  }

  showdownTags() {
    const P = this.sd;
    if (P.tagged) return;
    P.tagged = true;
    const u = P.unit;
    P.showdownTag({ x: u.x, y: u.y - 46 }, P.f.unitTag, P.f.unitTone === "bad" ? "#7E1A15" : "#1B1A18");
  }

  flag(p) {
    const g = this.add.container(p.x, p.y - 30, [this.add.rectangle(0, -10, 30, 20, C.red).setStrokeStyle(2, C.ink), this.add.rectangle(-15, 6, 3, 34, C.ink)]);
    return g;
  }

  // The labels that explain step i: pinned to the harbour, the station or the battalion.
  showdownCallouts(i) {
    const P = this.sd;
    for (const [step, at, text, tone] of P.f.callouts ?? []) {
      if (step !== i || P.called?.has(`${step}-${text}`)) continue;
      (P.called ??= new Set()).add(`${step}-${text}`);
      const where = at === "harbour" ? P.callAt.harbour : at === "unit" ? { x: P.unit.x, y: P.unit.y + 52 } : step === 2 ? P.callAt.contact : P.callAt.beacon;
      P.showdownTag(where, text, tone === "bad" ? "#7E1A15" : tone === "warn" ? "#6B4508" : "#1F4A2E");
    }
  }

  // Play step i; returns its length in ms. With reduced motion it jumps to its end state.
  showdownStep(i) {
    const s = this.sd?.steps[i];
    if (!s) return 0;
    this.showdownCallouts(i);
    if (reducedMotion.on) { s.end(); return 300; }
    s.play();
    return s.dur;
  }

  // Jump to the end of step i (and every step before it), killing what is still moving.
  showdownJump(i) {
    if (!this.sd) return;
    for (const t of this.sd.timers) t.remove(false);
    this.sd.timers = [];
    for (const o of [this.sd.escorts, this.sd.craft, this.sd.friends, this.sd.unit]) this.tweens.killTweensOf(o);
    this.tweens.getTweens().forEach((t) => { if (t.targets?.some?.((x) => x && typeof x.v === "number")) t.stop(); });
    for (let k = 0; k <= i; k++) { this.sd.steps[k].end(); this.showdownCallouts(k); }
  }

  showdownPause(on) {
    if (on) this.tweens.pauseAll(); else this.tweens.resumeAll();
    this.time.paused = on;
  }

  showdownClear() {
    const P = this.sd;
    if (!P) return;
    for (const o of [P.escorts, P.craft, P.friends, P.unit, P.trench, P.fx, P.flag, ...(P.tags ?? [])]) o?.destroy();
    this.sd = null;
    this.time.paused = false;
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
    if (which.includes("forward")) {
      // the battalion's trench line across the headland, facing the sea
      g.lineStyle(5, C.red, 0.85);
      const n = Math.max(2, Math.round(8 * t));
      for (let i = 0; i < n; i++) g.lineBetween(b.x + 26 + i * 4, b.y - 70 + i * 18, b.x + 34 + i * 4, b.y - 60 + i * 18);
    }
    if (which.includes("joint")) {
      g.lineStyle(8, C.brass, 1);
      g.strokePoints(joint.slice(0, Math.max(2, Math.round(joint.length * t))), false);
    }
    if (t >= 1 && !this.pathLabels.length) {
      if (which.includes("quiet")) this.pathLabels.push(this.add.text(b.x + 70, b.y + 150, "Hold quietly", { ...LABEL, fontStyle: "600" }));
      if (which.includes("joint")) this.pathLabels.push(this.add.text(b.x + 120, b.y - 160, "Stand together openly", { ...LABEL, fontStyle: "600", color: "#7A4F0C" }));
      if (which.includes("forward")) this.pathLabels.push(this.add.text(b.x + 70, b.y - 104, "Dig in", { ...LABEL, fontStyle: "600", color: "#7E1A15" }));
    }
  }

  revealPaths(which) {
    const o = { t: 0 };
    if (reducedMotion.on) return this.drawPaths(1, which);
    this.tweens.add({ targets: o, t: 1, duration: 1200, ease: EASE.travel, onUpdate: () => this.drawPaths(o.t, which), onComplete: () => this.drawPaths(1, which) });
  }

  revealTruth(lines = []) {
    const c = this.truth;
    // Keep each line on the sheet, wherever this chart put its anchor.
    c.lines.forEach((t, i) => {
      t.setText(lines[i] ?? "");
      t.setX(Math.max(OX + 16, Math.min(t.home.x, OX + MW - 16 - t.width)));
      t.setY(Math.max(OY + 16, Math.min(t.home.y, OY + MH - 16 - t.height)));
    });
    c.setAlpha(1);
    const draw = () => c.maskG.clear().fillStyle(0xffffff).fillRect(OX, OY, MW * c.reveal.w, MH);
    if (reducedMotion.on) { c.reveal.w = 1; return draw(); }
    this.tweens.add({ targets: c.reveal, w: 1, duration: 1500, ease: EASE.travel, onUpdate: draw });
  }

  reset() {
    this.tweens.killTweensOf([this.warning, this.landingBoats, this.lattice]);
    this.setNotes([]);
    this.showdownClear();
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
