import Phaser from "phaser";
import { EASE, T, STAGGER, TYPE_RATE, move, reducedMotion, seeded } from "../motion.js";
import { CALENDAR, DEBRIEF, DECEMBER, FEBRUARY, JANUARY, OFFICERS, TITLE, fullName, monthOf, plainName, surname } from "../fixture.js";
import { OX, OY } from "./TableScene.js";

const TRAY = { x: 1640, y: 1000 }; // where slips are dealt from and gathered to
const portrait = (id) => `./portraits/${OFFICERS[id].portrait}.jpg`;
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

export const CHAPTERS = ["title", "dec-brief", "dec-orders", "dec-sent", "dec-night", "jan-clash", "feb-showdown", "debrief"];

// Every word and every control is DOM, so screen readers, focus and text rendering work
// as in the web app. Phaser positions and moves it; it never decides what it says.
export class DeskScene extends Phaser.Scene {
  constructor() {
    super("desk");
  }

  create() {
    this.table = this.scene.get("table");
    this.items = [];
    this.timers = [];
    this.skipFns = [];
    this.input.keyboard.on("keydown", (e) => this.onKey(e));
    window.mapRoom = { go: (c, opts) => this.go(c, opts), chapters: CHAPTERS, reduced: reducedMotion };
    const start = new URLSearchParams(location.search).get("chapter");
    this.go(CHAPTERS.includes(start) ? start : "title");
  }

  // ── plumbing ──────────────────────────────────────────────────────────────
  dom(x, y, html, cls = "") {
    const el = document.createElement("div");
    el.className = `ui ${cls}`;
    el.innerHTML = html;
    const obj = this.add.dom(x, y, el).setOrigin(0, 0);
    this.items.push(obj);
    return obj;
  }

  clear() {
    for (const o of this.items) { this.tweens.killTweensOf(o); o.destroy(); }
    for (const t of this.timers) t.remove(false);
    this.items = []; this.timers = []; this.skipFns = [];
    this.tweens.killAll();
  }

  later(ms, fn) {
    const t = this.time.delayedCall(reducedMotion.on ? 0 : ms, fn);
    this.timers.push(t);
    return t;
  }

  onKey(e) {
    if (e.target?.tagName === "BUTTON") return;
    if (e.key === " " || e.key === "Enter") this.skip();
    if (e.key === "m" || e.key === "M") reducedMotion.on = !reducedMotion.on;
    const n = Number(e.key);
    if (n >= 1 && n <= CHAPTERS.length) this.go(CHAPTERS[n - 1]);
  }

  // Space or a click on the dialogue jumps whatever is running to its end state.
  skip() {
    const fns = this.skipFns;
    this.skipFns = [];
    if (fns.length) {
      for (const f of fns) f();
      return;
    }
    this.next?.();
  }

  // A sequence that has finished on its own no longer needs a skip.
  done(fn) {
    this.skipFns = this.skipFns.filter((f) => f !== fn);
  }

  // Types out text that may contain markup (officer names), filling text nodes in order so
  // the styling is there from the first letter.
  type(el, html, delay = 0) {
    el.innerHTML = html;
    if (reducedMotion.on) return;
    const nodes = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) nodes.push([walk.currentNode, walk.currentNode.nodeValue]);
    const total = nodes.reduce((n, [, s]) => n + s.length, 0);
    const show = (count) => {
      for (const [node, s] of nodes) { node.nodeValue = s.slice(0, Math.max(0, count)); count -= s.length; }
    };
    show(0);
    let i = 0, timer = null;
    const start = this.time.delayedCall(delay, () => {
      timer = this.time.addEvent({ delay: 1000 / TYPE_RATE, loop: true, callback: () => {
        show(++i);
        if (i >= total) { timer.remove(false); this.done(finish); }
      } });
      this.timers.push(timer);
    });
    const finish = () => { start.remove(false); timer?.remove(false); show(total); };
    this.timers.push(start);
    this.skipFns.push(finish);
  }

  // ── shared pieces ─────────────────────────────────────────────────────────
  hud(turn, { seals = 2, used = 0, flipTo = null } = {}) {
    const track = CALENDAR.map((m, i) => `<i class="${i + 1 < turn ? "done" : i + 1 === turn ? "now" : ""}" title="${m}">${m[0]}</i>`).join("");
    const s = seals ? `<div class="seals"><span>Your personal orders this month</span>${
      Array.from({ length: 2 }, (_, i) => `<span class="seal ${i < used ? "empty" : ""}" data-seal="${i}">BL</span>`).join("")}</div>` : "";
    const h = this.dom(40, 12, `<div class="hud"><div class="mark"><svg width="26" height="26" viewBox="0 0 22 22" aria-hidden="true"><rect x="1" y="1" width="20" height="20" rx="3" fill="#C99A3E"/><rect x="5" y="6" width="12" height="2" fill="#141210"/><rect x="5" y="10" width="12" height="2" fill="#141210"/><rect x="5" y="14" width="7" height="2" fill="#141210"/></svg>Brass Ledger</div>
      <div class="month"><b data-month>${monthOf(turn)}</b><span>Kestrel Strait · month ${turn} of 6</span></div><div class="track">${track}</div>${s}</div>`);
    this.hudEl = h.node;
    if (flipTo) this.flipMonth(flipTo);
    return h;
  }

  flipMonth(turn) {
    const b = this.hudEl.querySelector("[data-month]");
    const span = b.nextElementSibling;
    const swap = () => { b.textContent = monthOf(turn); span.textContent = `Kestrel Strait · month ${turn} of 6`; };
    if (reducedMotion.on) return swap();
    b.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], { duration: 200, easing: "ease-in", fill: "forwards" }).onfinish = () => {
      swap();
      b.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 200, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });
    };
  }

  talk(id, line, { x = 80, y = 812, w = 1100, delay = 600 } = {}) {
    const o = OFFICERS[id];
    const t = this.dom(x, y, `<div class="talk" style="width:${w}px" role="group" aria-label="${plainName(id)}">
      <div class="face" style="background-image:url(${portrait(id)})"></div>
      <div><div class="who"><span class="rank">${o.rank}</span> ${o.name}<span class="post">${o.post}</span></div>
      <p class="say" aria-live="polite"></p></div><span class="hint">Click or press Space</span></div>`);
    t.node.addEventListener("click", () => this.skip());
    move(this, t, { alpha: [0, 1], x: [x - 32, x] }, { dur: 420, delay });
    this.type(t.node.querySelector(".say"), line, delay + 200);
    return t;
  }

  warnBlock([lab, body], none = false) {
    return `<div class="warn ${none ? "none" : ""}" role="status"><p class="lab">${lab}</p><p class="body" style="font-size:20px;line-height:28px">${body}</p></div>`;
  }

  // Deal a slip from the tray to its pin. Angle jitter is seeded, so replays match.
  deal(slip, x, y, i, seed) {
    const r = seeded(`${seed}-${i}`);
    const angle = (r() - 0.5) * 3;
    slip.setPosition(TRAY.x, TRAY.y).setScale(0.6).setAlpha(0).setAngle(angle * 4);
    move(this, slip, { x, y, scale: 1, alpha: 1, angle }, { dur: 520, ease: EASE.travel, delay: 200 + i * STAGGER.slip });
    const pin = slip.node.querySelector(".pin");
    if (pin && !reducedMotion.on) pin.animate([{ transform: "scale(0)" }, { transform: "scale(1)" }], { duration: 160, delay: 720 + i * STAGGER.slip, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
  }

  // The brass seal leaves the HUD and lands on the slip it pays for.
  spendSeal(slipObj, used) {
    const socket = this.hudEl.querySelector(`[data-seal="${used - 1}"]`);
    const from = socket.getBoundingClientRect(), stage = this.game.canvas.getBoundingClientRect();
    const k = 1920 / stage.width;
    const sx = (from.left - stage.left) * k, sy = (from.top - stage.top) * k;
    socket.classList.add("empty");
    const seal = this.dom(sx, sy, `<span class="seal" aria-hidden="true">BL</span>`);
    const tx = slipObj.x + slipObj.node.offsetWidth - 30, ty = slipObj.y - 22;
    slipObj.seal = seal;
    move(this, seal, { x: tx, y: ty }, { dur: 480, ease: EASE.arrive, onComplete: () => {
      if (!reducedMotion.on) this.tweens.add({ targets: seal, scale: { from: 1.1, to: 1 }, duration: 120 });
      if (!reducedMotion.on) this.table.cameras.main.shake(60, 0.0008);
    } });
  }

  returnSeal(slipObj, used) {
    const socket = this.hudEl.querySelector(`[data-seal="${used}"]`);
    socket.classList.remove("empty");
    const seal = slipObj.seal;
    slipObj.seal = null;
    if (seal) move(this, seal, { alpha: 0, y: seal.y - 30 }, { dur: 0.8 * 480, ease: EASE.leave });
  }

  stamp(slipObj, delay = 0) {
    const s = this.dom(slipObj.x + 70, slipObj.y + 40, `<div class="stamp">ORDERED</div>`);
    s.setAngle(-8).setAlpha(0);
    if (reducedMotion.on) return s.setAlpha(1);
    s.setScale(1.3).y -= 120;
    this.tweens.add({ targets: s, y: s.y + 120, scale: 1, alpha: 1, duration: 180, ease: EASE.impact, delay,
      onComplete: () => this.table.cameras.main.shake(90, 0.002) });
    return s;
  }

  dispatch(changing, staff, { label = "Send orders", disabled = false, why = "" } = {}) {
    const d = this.dom(1222, 1080, `<div class="dispatch"><dl><dt>You’re changing</dt><dd data-changing>${changing}</dd><dt>Staff will</dt><dd data-staff>${staff}</dd></dl>
      <div style="display:flex;align-items:center;gap:16px"><button class="go" ${disabled ? "disabled" : ""}>${label}</button><p class="why" data-why>${why}</p></div></div>`);
    move(this, d, { y: [1080, 1036 - d.node.offsetHeight], alpha: [0, 1] }, { dur: 420, delay: 1000 });
    return d;
  }

  // ── chapters ──────────────────────────────────────────────────────────────
  go(chapter, opts = {}) {
    this.clear();
    this.table.reset();
    this.next = null;
    this.chapter = chapter;
    this[`ch_${chapter.replace("-", "_")}`](opts);
  }

  ch_title() {
    this.hud(DECEMBER.turn, { seals: 0 });
    this.table.setBoats("lane");
    this.table.showWarning(true, { pulse: false });
    const shade = this.dom(OX, OY, `<div style="width:1500px;height:944px;background:linear-gradient(90deg,rgba(20,18,16,.95) 58%,rgba(20,18,16,0))"></div>`);
    shade.setAlpha(1);
    const t = this.dom(150, 300, `<div class="title"><h1>Brass Ledger</h1><p>${TITLE.line}</p>
      <div style="display:flex;gap:16px;margin-top:44px"><button class="go" data-go>Continue in December</button><button class="ghost">New campaign</button></div>
      <p style="font-size:18px;color:var(--room-muted);margin-top:20px">${TITLE.saved}</p></div>`);
    move(this, t, { alpha: [0, 1], y: [324, 300] }, { dur: T.reveal });
    t.node.querySelector("[data-go]").onclick = () => this.go("dec-brief");
    this.next = () => this.go("dec-brief");
  }

  ch_dec_brief() {
    const D = DECEMBER;
    this.hud(D.turn);
    this.table.cameras.main.fadeIn(reducedMotion.on ? 0 : 600, 20, 18, 16);
    this.table.setBoats("lane");
    this.table.showWarning(true, { delay: 900 });
    const secs = D.brief.sections.map(([l, b], i) => `${i === 1 ? this.warnBlock(D.brief.warning) : ""}<div class="sec"><p class="lab">${l}</p><p class="body">${b}</p></div>`).join("");
    const sheet = this.dom(1236, 128, `<article class="paper sheet" aria-label="${D.brief.title}"><h2>${D.brief.title}</h2><p class="from">December · ${D.brief.from}</p>${secs}</article>`);
    move(this, sheet, { x: [1296, 1236], alpha: [0, 1], angle: [4, 1.2] }, { dur: 600, delay: 1000 });
    this.talk("halden", D.halden, { delay: 700 });
    this.next = () => this.go("dec-orders");
  }

  ch_dec_orders({ preset } = {}) {
    const D = DECEMBER.orders;
    this.state = { beacon: "quiet", lattice: "boats", used: 0, ...preset };
    this.hud(DECEMBER.turn);
    this.table.setBoats("lane");
    this.table.showWarning(true, { pulse: false });
    const q = () => D.lattice.questions.find((x) => x.id === this.state.lattice).q;
    this.table.showLattice(null); // the Lattice slip stands in for the marker while orders are open

    const beacon = this.dom(0, 0, this.beaconFace(), "");
    const lattice = this.dom(0, 0, this.latticeFace(false), "");
    this.deal(beacon, 300, 150, 0, "dec");
    this.deal(lattice, 1290, 530, 1, "dec");
    this.beacon = beacon; this.lattice = lattice;
    const disp = this.dispatch(...this.summary());
    this.disp = disp;

    const wire = () => {
      beacon.node.querySelector("[data-change]")?.addEventListener("click", () => this.flip(beacon, () => this.beaconOptions()));
      beacon.node.querySelector("[data-keep]")?.addEventListener("click", () => {});
      lattice.node.querySelector("[data-ask]")?.addEventListener("click", () => {
        // The slip opens upward so the send panel never covers the choices.
        const h0 = lattice.node.offsetHeight;
        lattice.node.innerHTML = this.latticeFace(true);
        wireLattice();
        move(this, lattice, { y: Math.max(110, lattice.y - (lattice.node.offsetHeight - h0)) }, { dur: T.ui });
      });
    };
    const wireLattice = () => {
      for (const b of lattice.node.querySelectorAll("[data-q]")) b.addEventListener("click", () => {
        this.state.lattice = b.dataset.q;
        lattice.node.innerHTML = this.latticeFace(true);
        wireLattice();
        this.updateSummary();
      });
    };
    this.wireBeacon = wire;
    wire();
    disp.node.querySelector(".go").addEventListener("click", () => this.send([beacon, lattice], () => this.go("dec-night", { state: this.state })));
    if (preset?.beacon && preset.beacon !== "quiet") {
      this.later(900, () => this.flip(beacon, () => this.beaconOptions(), true));
    }
  }

  beaconFace() {
    const D = DECEMBER.orders.beacon;
    return `<article class="paper slip" aria-label="${D.head}"><span class="pin"></span><h3>${D.head}</h3><p class="will">${D.staff}</p>
      <div class="row"><b>Why</b><span>${D.why}</span></div><div class="row"><b>Cost</b><span>${D.cost}</span></div>
      <div class="quote"><span class="av" style="background-image:url(${portrait(D.dissent[0])})"></span><span><span class="attrib">${fullName(D.dissent[0])} objects:</span> ${D.dissent[1]}</span></div>
      <div class="btns"><button class="b on" data-keep>Let staff do it</button><button class="b" data-change>Change this order</button></div></article>`;
  }

  beaconOptions() {
    const D = DECEMBER.orders.beacon;
    const opts = D.options.map((o) => `<button class="opt ${this.state.beacon === o.id ? "sel" : ""}" data-opt="${o.id}" role="radio" aria-checked="${this.state.beacon === o.id}">
      <span class="r"></span><span><b>${o.name}</b><span class="s">${o.says}</span><span class="cost ${o.staff ? "free" : ""}">${o.cost}</span></span></button>`).join("");
    return `<article class="paper slip" style="width:560px" aria-label="${D.head}, your order"><span class="pin"></span><h3>${D.head} · your order</h3>
      <p class="will">What should Beacon do this month?</p><div role="radiogroup">${opts}</div></article>`;
  }

  latticeFace(open) {
    const L = DECEMBER.orders.lattice;
    const cur = L.questions.find((x) => x.id === this.state.lattice);
    const list = open ? `<div role="radiogroup" style="margin-top:6px">${L.questions.map((x) => `<button class="opt ${x.id === this.state.lattice ? "sel" : ""}" data-q="${x.id}" role="radio" aria-checked="${x.id === this.state.lattice}"><span class="r"></span><span><b>${x.q}</b>${x.staff ? `<span class="s">${surname("halden")}’s choice</span>` : ""}</span></button>`).join("")}</div>` : "";
    return `<article class="paper slip" aria-label="${L.head}"><span class="pin"></span><h3>${L.head}</h3><p class="will" style="font-size:22px;line-height:29px">${cur.q}</p>
      <div class="row"><b>Who</b><span>${L.ask}</span></div><div class="row"><b>Cost</b><span>${L.cost}</span></div>
      ${list}${open ? "" : '<div class="btns"><button class="b" data-ask>Ask something else</button></div>'}</article>`;
  }

  flip(slip, face, silent = false) {
    const swap = () => {
      slip.node.innerHTML = face();
      for (const b of slip.node.querySelectorAll("[data-opt]")) b.addEventListener("click", () => this.chooseBeacon(b.dataset.opt));
    };
    if (reducedMotion.on) return swap();
    this.tweens.add({ targets: slip, scaleX: 0, duration: 160, ease: EASE.leave, onComplete: () => {
      swap();
      this.tweens.add({ targets: slip, scaleX: 1, duration: 160, ease: EASE.arrive });
      if (silent) this.paintBeacon();
    } });
  }

  chooseBeacon(id) {
    const before = this.state.beacon;
    if (id === before) return;
    const D = DECEMBER.orders.beacon;
    if (before === "quiet" && id !== "quiet") { this.state.used = 1; this.spendSeal(this.beacon, 1); }
    if (before !== "quiet" && id === "quiet") { this.state.used = 0; this.returnSeal(this.beacon, 0); }
    this.state.beacon = id;
    this.beacon.node.innerHTML = this.beaconOptions();
    for (const b of this.beacon.node.querySelectorAll("[data-opt]")) b.addEventListener("click", () => this.chooseBeacon(b.dataset.opt));
    this.table.tweenRing({ preview: id === "rest" ? 190 : null }, 700);
    this.talkObj?.destroy();
    this.talkObj = this.talk(...D.reply[id], { delay: 0, w: 1000 });
    this.updateSummary();
  }

  paintBeacon() {
    this.beacon.node.innerHTML = this.beaconOptions();
    for (const b of this.beacon.node.querySelectorAll("[data-opt]")) b.addEventListener("click", () => this.chooseBeacon(b.dataset.opt));
    if (this.state.beacon !== "quiet") {
      this.hudEl.querySelector('[data-seal="0"]').classList.add("empty");
      const seal = this.dom(this.beacon.x + 530, this.beacon.y - 22, `<span class="seal" aria-hidden="true">BL</span>`);
      this.beacon.seal = seal;
      this.table.setRing({ preview: this.state.beacon === "rest" ? 190 : null });
    }
    this.updateSummary();
  }

  summary() {
    const D = DECEMBER.orders;
    const opt = D.beacon.options.find((o) => o.id === this.state.beacon);
    const lat = D.lattice.questions.find((x) => x.id === this.state.lattice);
    const mine = [], staff = [];
    (opt.staff ? staff : mine).push(`Beacon: ${opt.name.toLowerCase()}.`);
    (lat.staff ? staff : mine).push(`Lattice: ${lat.q.toLowerCase()}${lat.staff ? "" : " (free)"}`);
    return [mine.join(" ") || "Nothing yet.", staff.join(" ") || "Nothing else this month."];
  }

  updateSummary() {
    const [m, s] = this.summary();
    this.disp.node.querySelector("[data-changing]").textContent = m;
    this.disp.node.querySelector("[data-staff]").textContent = s;
  }

  // Signature move. The stamp lands at once; nothing on the map changes until the server
  // accepts. Here a 900 ms timer stands in for that receipt.
  send(slips, then) {
    const btn = this.disp.node.querySelector(".go");
    btn.disabled = true;
    slips.forEach((s, i) => this.stamp(s, 120 + i * 90));
    this.later(600, () => slips.forEach((s, i) => {
      const extra = s.seal ? [s.seal] : [];
      move(this, [s, ...extra], { x: TRAY.x, y: TRAY.y, scale: 0.5, alpha: 0 }, { dur: 420, ease: EASE.travel, delay: i * 60 });
    }));
    for (const o of this.items.filter((o) => o.node.querySelector?.(".stamp"))) this.later(600, () => move(this, o, { x: TRAY.x, y: TRAY.y, alpha: 0, scale: 0.5 }, { dur: 420, ease: EASE.travel }));
    this.talkObj && this.later(300, () => move(this, this.talkObj, { alpha: 0 }, { dur: T.ui, ease: EASE.leave }));
    this.later(1100, () => {
      this.disp.node.innerHTML = `<div class="dispatch"><p style="font-size:24px;line-height:32px;font-weight:600" aria-live="polite">Sending your orders…</p><p style="color:var(--room-muted);margin-top:6px">Nothing moves on the map until headquarters confirms it has them.</p></div>`;
    });
    this.later(2000, () => { this.disp.node.querySelector("p").textContent = "Headquarters has your orders."; });
    this.later(2600, then);
  }

  ch_dec_sent() {
    this.ch_dec_orders({ preset: { beacon: "rest", lattice: "who", used: 1 } });
    this.later(1700, () => this.send([this.beacon, this.lattice], () => this.go("dec-night", { state: this.state })));
  }

  ch_dec_night({ state = { beacon: "rest", lattice: "who" } } = {}) {
    const N = DECEMBER.night;
    this.hud(DECEMBER.turn, { seals: 0 });
    this.later(800, () => this.flipMonth(DECEMBER.turn + 1));
    this.table.setBoats("none");
    this.table.showWarning(true, { pulse: false });
    this.table.setNight(true);
    const beats = N.beats.map((b, i) => `<div class="beat" data-beat="${i}" style="opacity:0"><b class="n">${i + 1}</b><div><p class="lab" style="color:var(--ink2)">${b.cause}</p><p class="body"></p></div></div>`).join("");
    const sheet = this.dom(70, 128, `<article class="paper sheet" style="width:620px" aria-label="${N.title}"><h2>${N.title}</h2><p class="from">${N.sub}</p>${beats}
      <div data-end style="opacity:0">${this.warnBlock(N.still)}<div class="sec" style="border:0"><p class="lab">Coming up</p><p class="body">${N.next}</p></div>
      <button class="b on" style="height:56px;font-size:20px;margin-top:8px" data-go>${N.go}</button></div></article>`);
    move(this, sheet, { alpha: [0, 1], x: [30, 70] }, { dur: 600, delay: 400 });
    sheet.node.querySelector("[data-go]").onclick = () => this.go("jan-clash");
    const effects = {
      beacon: () => this.table.tweenRing({ r: 190, dashed: true }, 1000),
      harbour: () => this.table.showLattice(`Answered: ${DECEMBER.orders.lattice.questions.find((q) => q.id === state.lattice).q.toLowerCase()}`),
      lane: () => this.table.setBoats("lane"),
    };
    const at = [1200, 3300, 4900];
    const showBeat = (b, i) => {
      const row = sheet.node.querySelector(`[data-beat="${i}"]`);
      row.style.opacity = 1;
      this.type(row.querySelector(".body"), b.text);
      this.table.panTo(b.at, 1.12);
      this.later(900, effects[b.at]);
    };
    N.beats.forEach((b, i) => this.later(at[i], () => showBeat(b, i)));
    const end = () => {
      this.done(skipNight);
      this.table.panTo(null);
      this.table.setNight(false);
      sheet.node.querySelector("[data-end]").style.opacity = 1;
    };
    this.later(6400, end);
    const skipNight = () => {
      for (const t of this.timers) t.remove(false);
      N.beats.forEach((b, i) => {
        const row = sheet.node.querySelector(`[data-beat="${i}"]`);
        row.style.opacity = 1;
        row.querySelector(".body").textContent = b.text;
      });
      this.table.setRing({ r: 190, dashed: true });
      effects.harbour(); effects.lane();
      this.flipMonth(DECEMBER.turn + 1);
      end();
    };
    this.skipFns.push(skipNight);
    this.next = () => this.go("jan-clash");
  }

  ch_jan_clash() {
    const J = JANUARY;
    this.hud(J.turn, { used: 1 });
    this.table.setBoats("lane");
    this.table.showWarning(true, { pulse: false });
    this.table.setRing({ r: 190, dashed: true });
    this.state = { way: null, used: 1 };
    const mine = this.dom(0, 0, `<article class="paper slip" style="width:440px"><span class="pin"></span><h3>${J.mine.head}</h3><p class="will" data-name>${J.mine.name}</p>
      <div class="row"><b>Cost</b><span data-cost>${J.mine.cost}</span></div></article>`);
    this.deal(mine, 170, 150, 0, "jan");
    const seal = this.dom(560, 128, `<span class="seal" aria-hidden="true">BL</span>`);
    seal.setAlpha(0);
    move(this, seal, { alpha: 1 }, { dur: T.ui, delay: 800 });
    mine.seal = seal;
    const ways = J.theirs.ways.map((w) => `<button class="opt" data-way="${w.id}" role="radio" aria-checked="false"><span class="r"></span><span><b>${w.name}</b><span class="s">${w.says}</span><span class="cost ${w.free ? "free" : ""}">${w.cost}</span></span></button>`).join("");
    const theirs = this.dom(0, 0, `<article class="paper slip" style="width:580px"><span class="pin"></span><h3>${J.theirs.head}</h3><p class="will">${J.theirs.name}</p>
      <div class="row"><b>Clash</b><span>${J.theirs.clash}</span></div><p style="font-size:18px;font-weight:600;margin-top:14px">Three ways out. Nothing changes until you pick.</p><div role="radiogroup">${ways}</div></article>`);
    this.deal(theirs, 1040, 140, 1, "jan");
    const thread = this.dom(610, 300, `<div class="thread" style="width:440px"></div>`);
    thread.setAngle(-10).setAlpha(0);
    thread.node.firstChild.style.transformOrigin = "left center";
    this.later(900, () => {
      thread.setAlpha(1);
      if (!reducedMotion.on) thread.node.firstChild.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 600, easing: "cubic-bezier(.16,1,.3,1)" });
      if (!reducedMotion.on) [mine, theirs].forEach((s, i) => this.tweens.add({ targets: s, x: s.x + (i ? 4 : -4), duration: 60, yoyo: true, repeat: 1, delay: 600 }));
    });
    this.talkObj = this.talk("sato", J.sato, { w: 900, delay: 700 });
    this.disp = this.dispatch("Beacon: show force openly.", "Host government: wait for their OK.", { disabled: true, why: J.blocked });
    for (const b of theirs.node.querySelectorAll("[data-way]")) b.addEventListener("click", () => {
      const id = b.dataset.way, before = this.state.way;
      for (const x of theirs.node.querySelectorAll("[data-way]")) { x.classList.toggle("sel", x === b); x.setAttribute("aria-checked", x === b); }
      this.state.way = id;
      const back = id === "back";
      if (back && mine.seal) { this.returnSeal(mine, 0); }
      if (!back && !mine.seal) { const s2 = this.dom(560, 128, `<span class="seal" aria-hidden="true">BL</span>`); mine.seal = s2; this.hudEl.querySelector('[data-seal="0"]').classList.add("empty"); }
      if (!back && before !== null && before !== "back") { /* switching between paid ways keeps the same seal */ }
      if (!back && (before === null || before === "back")) this.spendSeal(theirs, 2);
      if (back && before && before !== "back") this.returnSeal(theirs, 1);
      mine.node.querySelector("[data-name]").textContent = back ? "Strengthen Beacon quietly." : J.mine.name;
      mine.node.querySelector("[data-cost]").textContent = back ? "The reserve gets more tired." : "Tires the reserve. The host government’s answer is settled.";
      move(this, thread, { alpha: 0 }, { dur: T.ui, ease: EASE.leave });
      const go = this.disp.node.querySelector(".go");
      go.disabled = false;
      this.disp.node.querySelector("[data-why]").textContent = "";
      const name = J.theirs.ways.find((w) => w.id === id).name.toLowerCase();
      this.disp.node.querySelector("[data-changing]").textContent = back ? "Nothing." : `Beacon: show force openly. Host government: ${name}.`;
      this.disp.node.querySelector("[data-staff]").textContent = back ? "Strengthen Beacon quietly. Wait for the host government’s OK." : "Nothing else this month.";
    });
    this.disp.node.querySelector(".go").addEventListener("click", () => this.send([mine, theirs], () => this.go("feb-showdown")));
  }

  ch_feb_showdown() {
    const F = FEBRUARY;
    this.hud(F.turn);
    this.table.setBoats("edge");
    this.table.setRing({ r: 250, dashed: false });
    this.later(500, () => this.table.revealPaths());
    const w = this.dom(1250, 120, `<div class="paper sheet" style="width:600px;padding:22px 30px">${this.warnBlock(F.warning, true)}</div>`);
    move(this, w, { alpha: [0, 1], y: [96, 120] }, { dur: T.paper, delay: 300 });
    F.routes.forEach((r, i) => {
      const c = this.dom(1250, 300 + i * 330, `<article class="paper sheet" style="width:600px;padding:26px 30px"><h2 style="font-size:32px">${r.name}</h2><p class="body" style="margin-top:8px">${r.does}</p>
        <div class="row" style="grid-template-columns:100px 1fr"><b>It costs</b><span>${r.costs}</span></div><div class="row" style="grid-template-columns:100px 1fr"><b>It needs</b><span>${r.needs}</span></div>
        <div class="quote"><span class="av" style="background-image:url(${portrait(r.voice[0])})"></span><span><span class="attrib">${fullName(r.voice[0])}:</span> “${r.voice[1]}”</span></div>
        <div class="btns"><button class="b ${i ? "on" : ""}" data-route="${r.id}">Choose: ${r.name.toLowerCase()}</button></div></article>`);
      move(this, c, { alpha: [0, 1], x: [1310, 1250] }, { dur: 520, delay: 900 + i * STAGGER.slip });
      c.node.querySelector("[data-route]").onclick = () => {
        this.stamp(c);
        this.later(1400, () => this.go("debrief"));
      };
    });
    this.talk("halden", F.halden, { w: 1000, delay: 700 });
  }

  ch_debrief() {
    const D = DEBRIEF;
    this.hud(6, { seals: 0 });
    this.table.setBoats("none");
    this.table.revealTruth();
    const rows = D.rows.map((r) => `<div class="dt" style="opacity:0"><b>${r[0]}</b><span>${r[1]}</span><span>${r[2]}</span><span style="color:var(--red-ink)">${r[3]}</span></div>`).join("");
    const s = this.dom(80, 128, `<article class="paper sheet" style="width:1000px"><h2 style="font-size:46px;line-height:52px">${D.title}</h2><p class="body" style="margin-top:8px">${D.line}</p>
      <div class="dt" style="border:0;font-size:16px;font-weight:600;color:var(--ink2);margin-top:14px"><span></span><span>You ordered</span><span>We believed</span><span style="color:var(--red-ink)">What was really happening</span></div>${rows}
      <div class="btns" style="margin-top:22px"><button class="b on" style="height:56px;font-size:20px" data-again>Play again with different instructions</button></div></article>`);
    move(this, s, { alpha: [0, 1] }, { dur: 600 });
    s.node.querySelectorAll(".dt[style*='opacity']").forEach((row, i) => {
      if (reducedMotion.on) { row.style.opacity = 1; return; }
      row.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: 600 + i * STAGGER.line, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });
    });
    s.node.querySelector("[data-again]").onclick = () => this.go("title");
    this.talk("halden", D.halden, { x: 1120, w: 740, delay: 1400 });
  }
}
