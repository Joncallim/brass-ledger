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
// Chart inks: buff land, blue shallows, Admiralty magenta for navigation marks.
const INK = { paper: "#F1EBDA", sea: "#EEF4F2", land: "#E2CB93", coast: "#4F4230", ink: "#1B1A18", ink2: "#4D4A44", magenta: "#A3326F" };
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
    const x = tex.getContext();
    const P = (pts) => { x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y))); };
    const label = (s, lx, ly, { w = 400, c = INK.ink, f = "IBM Plex Sans", st = "", sz = 20, align = "left" } = {}) => {
      x.font = `${st} ${w} ${sz}px ${f}`.trim(); x.fillStyle = c; x.textBaseline = "top"; x.textAlign = align; x.fillText(s, lx, ly); x.textAlign = "left";
    };
    // table
    x.fillStyle = x.createPattern(this.textures.get("wood").getSourceImage(), "repeat");
    x.fillRect(0, 0, 1920, 1080);
    // the chart sheet, lifted off the table
    x.save(); x.shadowColor = "rgba(0,0,0,.55)"; x.shadowBlur = 60; x.shadowOffsetY = 26;
    x.fillStyle = INK.paper; x.fillRect(OX, OY, MW, MH); x.restore();
    x.save(); x.beginPath(); x.rect(OX, OY, MW, MH); x.clip();
    // open water: the palest sea tone, so land never reads as sea
    x.fillStyle = INK.sea; x.fillRect(OX, OY, MW, MH);

    const westPts = this.coast(560, 34, "west", [{ y: 520, dx: 120, w: 40 }, { y: 760, dx: -40, w: 70 }]);
    const eastPts = this.coast(1290, 30, "east", [{ y: 345, dx: 70, w: 46 }, { y: 640, dx: -50, w: 80 }]);
    const W = westPts.map((p) => ({ x: OX + p.x, y: OY + p.y })), E = eastPts.map((p) => ({ x: OX + p.x, y: OY + p.y }));
    const westLand = (off = 0) => [{ x: OX, y: OY }, ...W.map((p) => ({ x: p.x + off, y: p.y })), { x: OX, y: OY + MH }];
    const eastLand = (off = 0) => [{ x: OX + MW, y: OY }, ...E.map((p) => ({ x: p.x - off, y: p.y })), { x: OX + MW, y: OY + MH }];
    const islands = (grow = 0) => [this.blob(880, 250, 46 + grow, "i1"), this.blob(1020, 780, 34 + grow, "i2"), this.blob(760, 120, 22 + grow, "i3")];

    // shallow water: Admiralty-style blue tints, darkest nearest the shore
    for (const [off, col] of [[150, "#DCEBEC"], [96, "#C8E0E5"], [52, "#B3D3DC"], [22, "#9CC5D1"]]) {
      x.fillStyle = col;
      for (const poly of [westLand(off), eastLand(off), ...islands(off * 0.55)]) { P(poly); x.closePath(); x.fill(); }
    }
    // depth contours on the tint edges
    x.strokeStyle = "rgba(92,140,156,.55)"; x.lineWidth = 1.2;
    for (const off of [22, 52, 96, 150]) {
      P(W.map((p) => ({ x: p.x + off, y: p.y }))); x.stroke();
      P(E.map((p) => ({ x: p.x - off, y: p.y }))); x.stroke();
    }
    // engraved water-lining hugging the coast
    for (let k = 1; k <= 5; k++) {
      x.strokeStyle = `rgba(60,104,122,${0.32 - k * 0.05})`; x.lineWidth = 0.8;
      P(W.map((p) => ({ x: p.x + k * 5, y: p.y }))); x.stroke();
      P(E.map((p) => ({ x: p.x - k * 5, y: p.y }))); x.stroke();
    }
    // graticule
    x.strokeStyle = "rgba(92,120,130,.28)"; x.lineWidth = 1;
    for (let gx = 230; gx < MW; gx += 230) { x.beginPath(); x.moveTo(OX + gx, OY); x.lineTo(OX + gx, OY + MH); x.stroke(); }
    for (let gy = 236; gy < MH; gy += 236) { x.beginPath(); x.moveTo(OX, OY + gy); x.lineTo(OX + MW, OY + gy); x.stroke(); }

    // land: buff, height contours inland, sand stipple at the shore, inked coastline
    const lands = [westLand(), eastLand(), ...islands()];
    for (const [i, poly] of lands.entries()) {
      P(poly); x.closePath(); x.fillStyle = INK.land; x.fill();
      x.save(); x.clip();
      x.strokeStyle = "rgba(150,118,70,.35)"; x.lineWidth = 1;
      if (i === 0) for (const off of [36, 80, 140, 210, 300]) { P(W.map((p) => ({ x: p.x - off - Math.sin(p.y / 90 + off) * 14, y: p.y }))); x.stroke(); }
      if (i === 1) for (const off of [36, 80, 140, 210, 300]) { P(E.map((p) => ({ x: p.x + off + Math.sin(p.y / 90 + off) * 14, y: p.y }))); x.stroke(); }
      x.fillStyle = "rgba(196,166,104,.55)";
      const st = seeded(`sand-${i}`);
      for (let s = 0; s < 900; s++) {
        const src = i === 0 ? W : i === 1 ? E : poly;
        const p = src[Math.floor(st() * src.length)];
        x.fillRect(p.x + (st() - 0.5) * 22, p.y + (st() - 0.5) * 8, 1.4, 1.4);
      }
      x.restore();
      P(poly); x.closePath(); x.strokeStyle = INK.coast; x.lineWidth = 2; x.stroke();
    }
    // a greener lowland wash behind the host coast
    x.save(); P(westLand()); x.closePath(); x.clip();
    const green = x.createLinearGradient(OX + 200, 0, OX + 560, 0);
    green.addColorStop(0, "rgba(140,160,110,.18)"); green.addColorStop(1, "rgba(140,160,110,0)");
    x.fillStyle = green; x.fillRect(OX, OY, 700, MH); x.restore();

    // soundings, in fathoms
    const r = seeded("soundings");
    x.font = "italic 15px Newsreader"; x.fillStyle = "rgba(52,84,98,.85)";
    for (let i = 0; i < 64; i++) {
      const y = 40 + r() * (MH - 80), k = Math.round(y / 8);
      const x0 = westPts[k].x + 40, x1 = eastPts[k].x - 40;
      if (x1 - x0 < 40) continue;
      const sx = x0 + r() * (x1 - x0);
      x.fillText(String(Math.round(4 + Math.sin(((sx - x0) / (x1 - x0)) * Math.PI) * 34 + r() * 6)), OX + sx, OY + y);
    }
    // wave marks in open water, sparse and pale
    const wv = seeded("waves");
    x.strokeStyle = "rgba(70,120,140,.28)"; x.lineWidth = 1.1;
    for (let i = 0; i < 140; i++) {
      const y = 30 + wv() * (MH - 60), k = Math.round(y / 8);
      const x0 = westPts[k].x + 170, x1 = eastPts[k].x - 170;
      if (x1 - x0 < 20) continue;
      const wx = OX + x0 + wv() * (x1 - x0), wy = OY + y;
      x.beginPath(); x.moveTo(wx - 8, wy); x.quadraticCurveTo(wx - 4, wy - 4, wx, wy); x.quadraticCurveTo(wx + 4, wy + 4, wx + 8, wy); x.stroke();
    }
    // woodland and towns on land
    const wd = seeded("woods");
    x.strokeStyle = "rgba(96,118,70,.55)"; x.lineWidth = 1;
    for (const [cx0, cy0, n] of [[240, 420, 40], [180, 700, 34], [1660, 620, 36], [1580, 180, 28]]) {
      for (let i = 0; i < n; i++) {
        const tx = OX + cx0 + (wd() - 0.5) * 150, ty = OY + cy0 + (wd() - 0.5) * 110;
        x.beginPath(); x.arc(tx, ty, 3.5, 0, Math.PI * 2); x.stroke();
        x.beginPath(); x.moveTo(tx, ty + 3.5); x.lineTo(tx, ty + 7); x.stroke();
      }
    }
    x.fillStyle = "rgba(60,48,32,.75)";
    for (const [cx0, cy0] of [[1480, 300], [380, 790]]) {
      for (let i = 0; i < 16; i++) x.fillRect(OX + cx0 + (i % 4) * 9 + wd() * 3, OY + cy0 + Math.floor(i / 4) * 9 + wd() * 3, 6, 6);
    }
    // reefs and rocks
    const rocks = seeded("rocks");
    x.strokeStyle = INK.ink; x.lineWidth = 1.4;
    for (const [rx, ry, n] of [[690, 610, 5], [960, 300, 4], [1060, 830, 4], [1170, 540, 3]]) {
      for (let i = 0; i < n; i++) {
        const px = OX + rx + (rocks() - 0.5) * 50, py = OY + ry + (rocks() - 0.5) * 30;
        x.beginPath(); x.moveTo(px - 4, py); x.lineTo(px + 4, py); x.moveTo(px, py - 4); x.lineTo(px, py + 4); x.stroke();
        x.beginPath(); x.arc(px, py, 1.5, 0, Math.PI * 2); x.fill();
      }
    }
    // shipping lane: a magenta traffic lane with direction arrows
    x.strokeStyle = INK.magenta; x.lineWidth = 2;
    for (const side of [-26, 26]) {
      x.setLineDash([14, 8]); x.beginPath();
      for (let y = 0; y <= MH; y += 6) x.lineTo(OX + 940 + side + Math.sin(y / 160) * 26, OY + y);
      x.stroke();
    }
    x.setLineDash([]); x.fillStyle = INK.magenta;
    for (const [ay, dir] of [[200, 1], [430, -1], [690, 1]]) {
      const ax = OX + 940 + Math.sin(ay / 160) * 26 + dir * -11, py = OY + ay;
      P([{ x: ax, y: py + dir * 14 }, { x: ax - 6, y: py - dir * 6 }, { x: ax + 6, y: py - dir * 6 }]); x.closePath(); x.fill();
    }
    label("Shipping lane", OX + 990, OY + 118, { c: INK.magenta, w: 500 });
    // harbour zone
    x.fillStyle = "rgba(180,38,31,.08)"; x.beginPath(); x.ellipse(OX + PLACES.harbour.x, OY + PLACES.harbour.y, 130, 85, 0, 0, Math.PI * 2); x.fill();
    x.setLineDash([6, 6]); x.strokeStyle = "rgba(126,26,21,.8)"; x.lineWidth = 1.6; x.stroke(); x.setLineDash([]);
    label("Ravellan’s main harbour", OX + 1400, OY + 222, { w: 600 });
    label("where landing boats load", OX + 1400, OY + 248, { c: INK.ink2 });
    // lighthouse on the north island, with its light character
    const lx = OX + 900, ly = OY + 236;
    x.fillStyle = INK.magenta; x.beginPath(); x.moveTo(lx, ly); x.quadraticCurveTo(lx + 30, ly - 22, lx + 40, ly - 6); x.quadraticCurveTo(lx + 22, ly + 4, lx, ly); x.fill();
    x.fillStyle = INK.ink; x.beginPath(); x.arc(lx, ly, 4, 0, Math.PI * 2); x.fill();
    label("Fl 5s 12M", lx - 12, ly + 10, { sz: 13, c: INK.magenta, w: 500, align: "right" });
    // anchorage off the host coast
    this.anchor(x, OX + 470, OY + 860);
    label("Anchorage", OX + 486, OY + 850, { sz: 14, c: INK.magenta });
    // region names
    label("HOST COUNTRY", OX + 60, OY + 880, { f: "Newsreader", sz: 30, c: "#6B5A3A" });
    label("RAVELLAN", OX + 1580, OY + 880, { f: "Newsreader", sz: 30, c: "#6B5A3A" });
    // compass rose, in chart magenta
    this.rose(x, OX + 1740, OY + 140, 76);
    // scale bar
    for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? INK.paper : INK.ink; x.fillRect(OX + 1500 + i * 50, OY + 812, 50, 8); }
    x.strokeStyle = INK.ink; x.lineWidth = 1.5; x.strokeRect(OX + 1500, OY + 812, 200, 8);
    label("0", OX + 1496, OY + 826, { sz: 14, c: INK.ink2 }); label("10 nautical miles", OX + 1600, OY + 826, { sz: 14, c: INK.ink2 });
    // title cartouche
    x.fillStyle = "rgba(241,235,218,.94)"; x.fillRect(OX + 40, OY + 40, 330, 104);
    x.strokeStyle = INK.ink; x.lineWidth = 1.5; x.strokeRect(OX + 40, OY + 40, 330, 104); x.lineWidth = 0.8; x.strokeRect(OX + 46, OY + 46, 318, 92);
    label("Kestrel Strait", OX + 205, OY + 58, { f: "Newsreader", sz: 32, align: "center" });
    label("Soundings in fathoms · reported positions only", OX + 205, OY + 104, { sz: 13, c: INK.ink2, align: "center" });
    // neatline with alternating degree bars
    x.strokeStyle = INK.ink; x.lineWidth = 1; x.strokeRect(OX + 12, OY + 12, MW - 24, MH - 24);
    for (let i = 0; i < Math.ceil(MW / 46); i++) { if (i % 2) { x.fillStyle = INK.ink; x.fillRect(OX + 12 + i * 46, OY + 6, 46, 6); x.fillRect(OX + 12 + i * 46, OY + MH - 12, 46, 6); } }
    for (let i = 0; i < Math.ceil(MH / 47); i++) { if (i % 2) { x.fillStyle = INK.ink; x.fillRect(OX + 6, OY + 12 + i * 47, 6, 47); x.fillRect(OX + MW - 12, OY + 12 + i * 47, 6, 47); } }
    x.strokeRect(OX + 6, OY + 6, MW - 12, MH - 12);
    const lat = ["36°40′", "36°30′", "36°20′"], lon = ["24°10′", "24°20′", "24°30′", "24°40′", "24°50′", "25°00′", "25°10′"];
    lat.forEach((s, i) => label(s, OX + 18, OY + 230 + i * 236, { sz: 12, c: INK.ink2 }));
    lon.forEach((s, i) => label(s, OX + 236 + i * 230, OY + 18, { sz: 12, c: INK.ink2 }));
    // age: fold creases, foxing, edge toning, grain
    for (const [fx, fy, w, h] of [[OX + MW / 2, OY, 2, MH], [OX, OY + MH / 2, MW, 2]]) {
      x.fillStyle = "rgba(255,255,255,.35)"; x.fillRect(fx, fy, w, h);
      x.fillStyle = "rgba(90,70,40,.12)"; x.fillRect(fx + (w === 2 ? 2 : 0), fy + (h === 2 ? 2 : 0), w, h);
    }
    const fox = seeded("foxing");
    for (let i = 0; i < 14; i++) {
      const fx = OX + fox() * MW, fy = OY + fox() * MH, fr = 10 + fox() * 40;
      const g = x.createRadialGradient(fx, fy, 0, fx, fy, fr);
      g.addColorStop(0, "rgba(150,110,60,.10)"); g.addColorStop(1, "rgba(150,110,60,0)");
      x.fillStyle = g; x.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
    }
    const tone = x.createRadialGradient(OX + MW / 2, OY + MH / 2, MH * 0.45, OX + MW / 2, OY + MH / 2, MW * 0.62);
    tone.addColorStop(0, "rgba(120,90,40,0)"); tone.addColorStop(1, "rgba(120,90,40,.16)");
    x.fillStyle = tone; x.fillRect(OX, OY, MW, MH);
    x.globalCompositeOperation = "multiply";
    x.fillStyle = x.createPattern(this.textures.get("grain").getSourceImage(), "repeat");
    x.fillRect(OX, OY, MW, MH);
    x.restore();
    tex.refresh();
    this.add.image(0, 0, "base").setOrigin(0);
  }

  // A full compass rose: degree ring, cardinal star, magnetic variation.
  rose(x, cx, cy, R) {
    x.save();
    x.strokeStyle = INK.magenta; x.fillStyle = INK.magenta; x.lineWidth = 1.2;
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
      const rgt = { x: cx + Math.cos(a + Math.PI / 2) * wdt, y: cy + Math.sin(a + Math.PI / 2) * wdt };
      x.fillStyle = INK.magenta; x.beginPath(); x.moveTo(cx, cy); x.lineTo(l.x, l.y); x.lineTo(tip.x, tip.y); x.closePath(); x.fill();
      x.fillStyle = INK.paper; x.beginPath(); x.moveTo(cx, cy); x.lineTo(rgt.x, rgt.y); x.lineTo(tip.x, tip.y); x.closePath(); x.fill(); x.stroke();
    }
    x.fillStyle = INK.ink; x.font = "600 16px IBM Plex Sans"; x.fillText("N", cx, cy - R - 12);
    x.fillStyle = INK.magenta; x.font = "11px IBM Plex Sans"; x.fillText("VAR 3°W (2026)", cx, cy + R + 14);
    x.restore();
  }

  anchor(x, ax, ay) {
    x.save(); x.strokeStyle = INK.magenta; x.lineWidth = 2;
    x.beginPath(); x.arc(ax, ay - 12, 3, 0, Math.PI * 2); x.moveTo(ax, ay - 9); x.lineTo(ax, ay + 8);
    x.moveTo(ax - 6, ay - 4); x.lineTo(ax + 6, ay - 4); x.moveTo(ax - 9, ay + 2); x.quadraticCurveTo(ax, ay + 14, ax + 9, ay + 2); x.stroke();
    x.restore();
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
    if (mode === "edge") this.boatLabel = this.add.text(OX + 990, OY + 420, "Ravellan ships\nat Beacon’s edge", { ...LABEL, color: "#7E1A15", fontStyle: "600" });
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

  // Only routes that are actually on the table get drawn.
  drawPaths(t = 1, which = ["quiet", "joint"]) {
    const g = this.paths.clear();
    const b = { x: OX + PLACES.beacon.x, y: OY + PLACES.beacon.y };
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
