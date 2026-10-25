import Phaser from "phaser";
import { EASE, T, STAGGER, TYPE_RATE, move, reducedMotion, seeded } from "../motion.js";
import {
  CALENDAR, DECEMBER, DEFAULT_RUN, JANUARY, OFFICERS, TITLE, debrief, decemberNight, february, fullName,
  januaryBrief, januaryNight, latticeQ, monthOf, plainName, surname,
} from "../fixture.js";
import { OX, OY } from "./TableScene.js";

const TRAY = { x: 1640, y: 1000 }; // where slips are dealt from and gathered to
const portrait = (id) => `./portraits/${OFFICERS[id].portrait}.jpg`;
// Lower-case only the first letter, so names like Beacon keep their capital.
const lower = (s) => s[0].toLowerCase() + s.slice(1);
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

export const CHAPTERS = ["title", "dec-brief", "dec-orders", "dec-night", "jan-brief", "jan-orders", "jan-night", "feb-showdown", "debrief"];

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
    this.run = DEFAULT_RUN();
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

  // Destroy one DOM object and forget it, so later sweeps never meet a dead node.
  drop(obj) {
    if (!obj) return;
    this.tweens.killTweensOf(obj);
    this.items = this.items.filter((o) => o !== obj);
    obj.destroy();
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
    this.talkObj = null;
    this.chapter = chapter;
    this[`ch_${chapter.replace("-", "_")}`](opts);
  }

  focusLater(el, ms = 1100) {
    if (el) this.later(ms, () => el.focus({ preventScroll: true }));
  }

  // Beacon's coverage after a month's orders, so every later screen shows the same ring.
  ringAfter(month) {
    if (month === "dec") return { r: { quiet: 250, rest: 190, show: 270 }[this.run.dec.beacon], dashed: this.run.dec.beacon === "rest" };
    return { r: this.run.jan.beacon === "hold" ? 190 : 270, dashed: this.run.jan.beacon === "hold" };
  }

  ch_title() {
    this.hud(DECEMBER.turn, { seals: 0 });
    this.table.setBoats("lane");
    this.table.showWarning(true, { pulse: false });
    this.dom(OX, OY, `<div style="width:1500px;height:944px;background:linear-gradient(90deg,rgba(20,18,16,.95) 58%,rgba(20,18,16,0))"></div>`);
    const t = this.dom(150, 300, `<div class="title"><h1>Brass Ledger</h1><p>${TITLE.line}</p>
      <div style="display:flex;gap:16px;margin-top:44px"><button class="go" data-go>Continue in December</button><button class="ghost" disabled title="Not in this prototype">New campaign</button></div>
      <p style="font-size:18px;color:var(--room-muted);margin-top:20px">${TITLE.saved}</p></div>`);
    move(this, t, { alpha: [0, 1], y: [324, 300] }, { dur: T.reveal });
    const go = t.node.querySelector("[data-go]");
    go.onclick = () => { this.run = DEFAULT_RUN(); this.go("dec-brief"); };
    this.focusLater(go, 300);
    this.next = go.onclick;
  }

  // A morning briefing: the sheet on the right, the officer speaking, one way on.
  briefing(turn, data, line, nextChapter, nextLabel) {
    this.hud(turn);
    this.table.cameras.main.fadeIn(reducedMotion.on ? 0 : 600, 20, 18, 16);
    const secs = data.sections.map(([l, b], i) => `${i === 1 ? this.warnBlock(data.warning) : ""}<div class="sec"><p class="lab">${l}</p><p class="body">${b}</p></div>`).join("");
    const sheet = this.dom(1236, 128, `<article class="paper sheet" aria-label="${data.title}"><h2>${data.title}</h2><p class="from">${monthOf(turn)} · ${data.from}</p>${secs}
      <div class="btns" style="margin-top:16px"><button class="b on" data-go>${nextLabel}</button></div></article>`);
    move(this, sheet, { x: [1296, 1236], alpha: [0, 1], angle: [4, 1.2] }, { dur: 600, delay: 1000 });
    this.talk("halden", line, { delay: 700 });
    const go = sheet.node.querySelector("[data-go]");
    go.onclick = () => this.go(nextChapter);
    this.focusLater(go, 1700);
    this.next = () => this.go(nextChapter);
  }

  ch_dec_brief() {
    this.table.setBoats("lane");
    this.table.showWarning(true, { delay: 900 });
    this.briefing(DECEMBER.turn, DECEMBER.brief, DECEMBER.halden, "dec-orders", "To your December orders");
  }

  ch_jan_brief() {
    const B = januaryBrief(this.run);
    this.table.setBoats("lane");
    this.table.showWarning(true, { pulse: false });
    this.table.setRing(this.ringAfter("dec"));
    this.table.showLattice(`Answered: ${lower(latticeQ(this.run.dec.lattice).q)}`);
    this.briefing(JANUARY.turn, B, B.halden, "jan-orders", "To your January orders");
  }

  // ── order slips ───────────────────────────────────────────────────────────
  // One slip per issue. Its face shows staff's plan or your change; "Change this order"
  // flips it to the choices. Spending and returning seals happens here, so the count is
  // always the number of orders you have personally changed (never more than two).
  orderSlip(cfg, { get, set, x, y, i, seed, onPicked }) {
    const o = { cfg, get, set };
    const slip = this.dom(0, 0, "");
    o.slip = slip;
    const opt = () => cfg.options.find((p) => p.id === get());
    const wire = () => {
      slip.node.querySelector("[data-change]")?.addEventListener("click", () => this.flipTo(slip, () => { slip.node.innerHTML = choices(); wire(); slip.node.querySelector(".opt.sel")?.focus(); }));
      slip.node.querySelector("[data-staffplan]")?.addEventListener("click", () => pick(cfg.options.find((p) => p.staff).id, true));
      slip.node.querySelector("[data-done]")?.addEventListener("click", () => this.flipTo(slip, () => { slip.node.innerHTML = face(); wire(); slip.node.querySelector("[data-change]")?.focus(); }));
      for (const b of slip.node.querySelectorAll("[data-opt]")) b.addEventListener("click", () => pick(b.dataset.opt));
    };
    const face = () => {
      const p = opt();
      if (p.staff) return `<article class="paper slip" aria-label="${cfg.head}"><span class="pin"></span><h3>${cfg.head} · staff plan</h3>
        <p class="will">${surname(cfg.staff[0])} ${cfg.staff[1]}</p>
        <div class="row"><b>Why</b><span>${cfg.why}</span></div><div class="row"><b>Cost</b><span>${cfg.cost}</span></div>
        ${cfg.dissent ? `<div class="quote"><span class="av" style="background-image:url(${portrait(cfg.dissent[0])})"></span><span><span class="attrib">${fullName(cfg.dissent[0])} objects:</span> ${cfg.dissent[1]}</span></div>` : ""}
        <div class="btns"><button class="b" data-change>Change this order</button></div></article>`;
      return `<article class="paper slip" aria-label="${cfg.head}, your order"><span class="pin"></span><h3>${cfg.head} · your order</h3>
        <p class="will">${p.name}.</p><div class="row"><b>Cost</b><span>${p.says}</span></div>
        <div class="btns"><button class="b" data-change>Change again</button><button class="b" data-staffplan>Back to the staff plan</button></div></article>`;
    };
    const choices = () => `<article class="paper slip" style="width:560px" aria-label="${cfg.head}, choose an order"><span class="pin"></span><h3>${cfg.head} · your order</h3>
      <p class="will">What should Beacon do this month?</p><div role="radiogroup">${cfg.options.map((p) => `<button class="opt ${get() === p.id ? "sel" : ""}" data-opt="${p.id}" role="radio" aria-checked="${get() === p.id}">
      <span class="r"></span><span><b>${p.name}</b><span class="s">${p.says}</span><span class="cost ${p.staff ? "free" : ""}">${p.staff ? "Free" : "Uses 1 personal order"}</span></span></button>`).join("")}</div>
      <p class="why-note" style="font-size:16px;color:var(--red-ink);margin-top:8px" aria-live="polite"></p>
      <div class="btns"><button class="b on" data-done>Done</button></div></article>`;
    const pick = (id, fromFace = false) => {
      const before = get();
      if (id === before) return;
      const wasStaff = cfg.options.find((p) => p.id === before).staff, isStaff = cfg.options.find((p) => p.id === id).staff;
      if (wasStaff && !isStaff) {
        if (this.used >= 2) {
          const note = slip.node.querySelector(".why-note");
          if (note) note.textContent = "You have used both personal orders this month. Give one back first.";
          return;
        }
        this.spendSeal(slip, ++this.used);
      }
      if (!wasStaff && isStaff) this.returnSeal(slip, --this.used);
      set(id);
      slip.node.innerHTML = fromFace ? face() : choices();
      wire();
      if (!fromFace) slip.node.querySelector(`[data-opt="${id}"]`)?.focus();
      if (cfg.reply?.[id]) { this.drop(this.talkObj); this.talkObj = this.talk(...cfg.reply[id], { delay: 0, w: 1000 }); }
      onPicked?.(id, before);
      this.refreshDispatch();
    };
    o.pick = pick;
    o.render = () => { slip.node.innerHTML = face(); wire(); };
    o.render();
    this.deal(slip, x, y, i, seed);
    return o;
  }

  flipTo(slip, swap) {
    if (reducedMotion.on) return swap();
    this.tweens.add({ targets: slip, scaleX: 0, duration: 160, ease: EASE.leave, onComplete: () => {
      swap();
      this.tweens.add({ targets: slip, scaleX: 1, duration: 160, ease: EASE.arrive });
    } });
  }

  latticeSlip(x, y, i) {
    const L = DECEMBER.orders.lattice;
    const slip = this.dom(0, 0, "");
    let open = false;
    const render = () => {
      const cur = latticeQ(this.run.dec.lattice);
      const list = open ? `<div role="radiogroup" style="margin-top:6px">${L.questions.map((x) => `<button class="opt ${x.id === cur.id ? "sel" : ""}" data-q="${x.id}" role="radio" aria-checked="${x.id === cur.id}"><span class="r"></span><span><b>${x.q}</b>${x.staff ? `<span class="s">${surname("halden")}’s choice</span>` : ""}</span></button>`).join("")}</div>` : "";
      slip.node.innerHTML = `<article class="paper slip" aria-label="${L.head}"><span class="pin"></span><h3>${L.head}${cur.staff ? " · staff plan" : " · your question"}</h3><p class="will" style="font-size:22px;line-height:29px">${cur.q}</p>
        <div class="row"><b>Who</b><span>${L.ask}</span></div><div class="row"><b>Cost</b><span>${L.cost}</span></div>
        ${list}<div class="btns">${open ? '<button class="b on" data-close>Done</button>' : '<button class="b" data-ask>Ask something else</button>'}</div></article>`;
      slip.node.querySelector("[data-ask]")?.addEventListener("click", () => {
        // The slip opens upward so the send panel never covers the choices.
        const h0 = slip.node.offsetHeight;
        open = true; render();
        move(this, slip, { y: Math.max(110, slip.y - (slip.node.offsetHeight - h0)) }, { dur: T.ui });
        slip.node.querySelector(".opt.sel")?.focus();
      });
      slip.node.querySelector("[data-close]")?.addEventListener("click", () => {
        const h0 = slip.node.offsetHeight;
        open = false; render();
        move(this, slip, { y: Math.min(y, slip.y + (h0 - slip.node.offsetHeight)) }, { dur: T.ui });
      });
      for (const b of slip.node.querySelectorAll("[data-q]")) b.addEventListener("click", () => {
        this.run.dec.lattice = b.dataset.q; render(); slip.node.querySelector(`[data-q="${b.dataset.q}"]`)?.focus(); this.refreshDispatch();
      });
    };
    render();
    this.deal(slip, x, y, i, "dec");
    return { slip };
  }

  // The send panel reads every slip, so "You're changing" and "Staff will" are always true.
  orderPanel(lines, blocked) {
    this.lines = lines;
    this.blocked = blocked;
    this.disp = this.dispatch("", "");
    this.refreshDispatch();
  }

  refreshDispatch() {
    if (!this.disp) return;
    const all = this.lines();
    const mine = all.filter((l) => l.mine).map((l) => l.text).join(" ");
    const staff = all.filter((l) => !l.mine).map((l) => l.text).join(" ");
    this.disp.node.querySelector("[data-changing]").textContent = mine || "Nothing yet.";
    this.disp.node.querySelector("[data-staff]").textContent = staff || "Nothing else this month.";
    const why = this.blocked?.() || "";
    const go = this.disp.node.querySelector(".go");
    go.disabled = Boolean(why);
    this.disp.node.querySelector("[data-why]").textContent = why;
  }

  // Signature move. The stamp lands at once; nothing on the map changes until the server
  // accepts. Here a 900 ms timer stands in for that receipt.
  send(slips, then) {
    this.disp.node.querySelector(".go").disabled = true;
    slips.forEach((s, i) => this.stamp(s, 120 + i * 90));
    this.later(600, () => {
      for (const o of this.items.filter((o) => o.node?.querySelector?.(".stamp, .seal") && o !== this.disp && o.y > 80)) {
        move(this, o, { x: TRAY.x, y: TRAY.y, alpha: 0, scale: 0.5 }, { dur: 420, ease: EASE.travel });
      }
      slips.forEach((s, i) => move(this, s, { x: TRAY.x, y: TRAY.y, scale: 0.5, alpha: 0 }, { dur: 420, ease: EASE.travel, delay: i * 60 }));
    });
    if (this.talkObj) this.later(300, () => move(this, this.talkObj, { alpha: 0 }, { dur: T.ui, ease: EASE.leave }));
    this.later(1100, () => {
      this.disp.node.innerHTML = `<div class="dispatch"><p style="font-size:24px;line-height:32px;font-weight:600" aria-live="polite">Sending your orders…</p><p style="color:var(--room-muted);margin-top:6px">Nothing moves on the map until headquarters confirms it has them.</p></div>`;
    });
    this.later(2000, () => { this.disp.node.querySelector("p").textContent = "Headquarters has your orders."; });
    this.later(2600, then);
  }

  ch_dec_orders() {
    this.run.dec = { beacon: "quiet", lattice: "boats" };
    this.used = 0;
    this.hud(DECEMBER.turn);
    this.table.setBoats("lane");
    this.table.showWarning(true, { pulse: false });
    const B = DECEMBER.orders.beacon;
    const beacon = this.orderSlip(B, {
      get: () => this.run.dec.beacon, set: (v) => (this.run.dec.beacon = v), x: 300, y: 150, i: 0, seed: "dec",
      onPicked: (id) => this.table.tweenRing({ preview: B.ring[id] ?? null }, 700),
    });
    const lattice = this.latticeSlip(1290, 530, 1);
    this.orderPanel(() => {
      const b = B.options.find((p) => p.id === this.run.dec.beacon), q = latticeQ(this.run.dec.lattice);
      return [{ mine: !b.staff, text: `Beacon: ${lower(b.name)}.` }, { mine: !q.staff, text: `Lattice: ${lower(q.q)}` }];
    });
    const go = this.disp.node.querySelector(".go");
    go.addEventListener("click", () => this.send([beacon.slip, lattice.slip], () => this.go("dec-night")));
    this.focusLater(beacon.slip.node.querySelector("[data-change]"), 1400);
  }

  ch_jan_orders() {
    this.run.jan = { beacon: "quiet", way: null };
    this.used = 0;
    const J = JANUARY;
    this.hud(J.turn);
    this.table.setBoats("lane");
    this.table.showWarning(true, { pulse: false });
    this.table.setRing(this.ringAfter("dec"));
    const thread = this.dom(610, 300, `<div class="thread" style="width:430px"></div>`);
    thread.setAngle(-6).setAlpha(0);
    thread.node.firstChild.style.transformOrigin = "left center";
    let host;
    const clash = () => this.run.jan.beacon === "show" && !this.run.jan.way;
    const showThread = () => {
      if (clash()) {
        thread.setAlpha(1);
        if (!reducedMotion.on) {
          thread.node.firstChild.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 600, easing: "cubic-bezier(.16,1,.3,1)" });
          [beacon.slip, host.slip].forEach((s, i) => this.tweens.add({ targets: s, x: s.x + (i ? 4 : -4), duration: 60, yoyo: true, repeat: 1, delay: 500 }));
        }
        this.drop(this.talkObj);
        this.talkObj = this.talk("sato", J.sato, { w: 900, delay: 300 });
      } else move(this, thread, { alpha: 0 }, { dur: T.ui, ease: EASE.leave });
    };
    const beacon = this.orderSlip(J.beacon, {
      get: () => this.run.jan.beacon, set: (v) => (this.run.jan.beacon = v), x: 170, y: 150, i: 0, seed: "jan",
      onPicked: (id, before) => {
        // Leaving an open show of force cancels whatever was done about the host government.
        if (before === "show" && this.run.jan.way && this.run.jan.way !== "back") this.returnSeal(host.slip, --this.used);
        if (id !== "show") this.run.jan.way = null;
        host.render(); showThread();
      },
    });
    host = this.hostSlip(beacon, () => showThread());
    this.orderPanel(() => {
      const b = J.beacon.options.find((p) => p.id === this.run.jan.beacon), w = this.run.jan.way;
      const lines = [{ mine: !b.staff, text: `Beacon: ${lower(b.name)}.` }];
      lines.push(w && w !== "back" ? { mine: true, text: `Host government: ${lower(J.host.ways.find((x) => x.id === w).name)}.` } : { mine: false, text: "Host government: wait for their OK." });
      return lines;
    }, () => (clash() ? J.blocked : ""));
    this.disp.node.querySelector(".go").addEventListener("click", () => this.send([beacon.slip, host.slip], () => this.go("jan-night")));
    this.focusLater(beacon.slip.node.querySelector("[data-change]"), 1400);
  }

  hostSlip(beacon, onChange) {
    const H = JANUARY.host;
    const slip = this.dom(0, 0, "");
    const render = () => {
      const show = this.run.jan.beacon === "show", w = this.run.jan.way;
      const ways = show ? `<div class="row"><b>Clash</b><span>${H.clash}</span></div>
        <p style="font-size:18px;font-weight:600;margin-top:14px">${w ? "You settled it:" : "Three ways out. Nothing changes until you pick."}</p>
        <div role="radiogroup">${H.ways.map((x) => `<button class="opt ${w === x.id ? "sel" : ""}" data-way="${x.id}" role="radio" aria-checked="${w === x.id}"><span class="r"></span><span><b>${x.name}</b><span class="s">${x.says}</span><span class="cost ${x.gives ? "free" : ""}">${x.gives ? "Gives your order back" : "Uses 1 personal order"}</span></span></button>`).join("")}</div>`
        : `<div class="row"><b>Why</b><span>${H.why}</span></div><div class="row"><b>Cost</b><span>${H.cost}</span></div>`;
      slip.node.innerHTML = `<article class="paper slip" style="width:580px" aria-label="${H.head}"><span class="pin"></span><h3>${H.head} · ${w && w !== "back" ? "your order" : "staff plan"}</h3>
        <p class="will">${surname(H.staff[0])} ${H.staff[1]}</p>${ways}</article>`;
      for (const b of slip.node.querySelectorAll("[data-way]")) b.addEventListener("click", () => {
        const id = b.dataset.way, before = this.run.jan.way;
        if (id === before) return;
        if (id === "back") {
          if (before) this.returnSeal(slip, --this.used);
          this.run.jan.way = null;
          beacon.pick("quiet", true);
          return;
        }
        if (!before) {
          if (this.used >= 2) return;
          this.spendSeal(slip, ++this.used);
        }
        this.run.jan.way = id;
        render(); slip.node.querySelector(`[data-way="${id}"]`)?.focus();
        onChange(); this.refreshDispatch();
      });
    };
    render();
    this.deal(slip, 1040, 140, 1, "jan");
    return { slip, render };
  }

  // ── nights ────────────────────────────────────────────────────────────────
  night(N, fromTurn, nextChapter, { lattice = null, ravellan = "lane", warning = true } = {}) {
    this.hud(fromTurn, { seals: 0 });
    this.later(800, () => this.flipMonth(fromTurn + 1));
    this.table.setBoats("none");
    this.table.showWarning(warning, { pulse: false });
    this.table.setNight(true);
    const beats = N.beats.map((b, i) => `<div class="beat" data-beat="${i}" style="opacity:0"><b class="n">${i + 1}</b><div><p class="lab" style="color:var(--ink2)">${b.cause}</p><p class="body"></p></div></div>`).join("");
    const sheet = this.dom(70, 128, `<article class="paper sheet" style="width:620px" aria-label="${N.title}"><h2>${N.title}</h2><p class="from">${N.sub}</p>${beats}
      <div data-end style="opacity:0">${this.warnBlock(N.still, !warning)}<div class="sec" style="border:0"><p class="lab">Coming up</p><p class="body">${N.next}</p></div>
      <button class="b on" style="height:56px;font-size:20px;margin-top:8px" data-go>${N.go}</button></div></article>`);
    move(this, sheet, { alpha: [0, 1], x: [30, 70] }, { dur: 600, delay: 400 });
    const go = sheet.node.querySelector("[data-go]");
    go.onclick = () => this.go(nextChapter);
    const effect = (b) => {
      if (b.ring) this.table.tweenRing({ r: b.ring, dashed: b.dashed }, 1000);
      if (b.marker) this.table.showLattice(b.marker);
      if (b.at === "lane") this.table.setBoats(ravellan);
    };
    const at = [1200, 3300, 4900];
    N.beats.forEach((b, i) => this.later(at[i], () => {
      const row = sheet.node.querySelector(`[data-beat="${i}"]`);
      row.style.opacity = 1;
      this.type(row.querySelector(".body"), b.text);
      this.table.panTo(b.at, 1.12);
      this.later(900, () => effect(b));
    }));
    const end = () => {
      this.done(skipNight);
      this.table.panTo(null);
      this.table.setNight(false);
      sheet.node.querySelector("[data-end]").style.opacity = 1;
      go.focus({ preventScroll: true });
    };
    this.later(6400, end);
    const skipNight = () => {
      for (const t of this.timers) t.remove(false);
      N.beats.forEach((b, i) => {
        const row = sheet.node.querySelector(`[data-beat="${i}"]`);
        row.style.opacity = 1;
        row.querySelector(".body").innerHTML = b.text;
        if (b.ring) this.table.setRing({ r: b.ring, dashed: b.dashed });
        if (b.marker) this.table.showLattice(b.marker);
        if (b.at === "lane") this.table.setBoats(ravellan);
      });
      this.flipMonth(fromTurn + 1);
      end();
    };
    this.skipFns.push(skipNight);
    this.next = () => this.go(nextChapter);
  }

  ch_dec_night() {
    this.night(decemberNight(this.run), DECEMBER.turn, "jan-brief");
  }

  ch_jan_night() {
    this.table.setRing(this.ringAfter("dec"));
    this.night(januaryNight(this.run), JANUARY.turn, "feb-showdown", { ravellan: "edge", warning: false });
  }

  // ── the showdown and the debrief ──────────────────────────────────────────
  ch_feb_showdown() {
    const F = february(this.run);
    this.hud(F.turn, { seals: 0 });
    this.table.setBoats("edge");
    this.table.setRing(this.ringAfter("jan"));
    this.later(500, () => this.table.revealPaths(F.routes.map((r) => r.id)));
    const w = this.dom(1250, 120, `<div class="paper sheet" style="width:600px;padding:22px 30px">${this.warnBlock(F.warning, true)}</div>`);
    move(this, w, { alpha: [0, 1], y: [96, 120] }, { dur: T.paper, delay: 300 });
    let first;
    F.routes.forEach((r, i) => {
      const c = this.dom(1250, 300 + i * 330, `<article class="paper sheet" style="width:600px;padding:26px 30px"><h2 style="font-size:32px">${r.name}</h2><p class="body" style="margin-top:8px">${r.does}</p>
        <div class="row" style="grid-template-columns:100px 1fr"><b>It costs</b><span>${r.costs}</span></div><div class="row" style="grid-template-columns:100px 1fr"><b>It needs</b><span>${r.needs}</span></div>
        <div class="quote"><span class="av" style="background-image:url(${portrait(r.voice[0])})"></span><span><span class="attrib">${fullName(r.voice[0])}:</span> “${r.voice[1]}”</span></div>
        <div class="btns"><button class="b on" data-route="${r.id}">Choose: ${lower(r.name)}</button></div></article>`);
      move(this, c, { alpha: [0, 1], x: [1310, 1250] }, { dur: 520, delay: 900 + i * STAGGER.slip });
      const btn = c.node.querySelector("[data-route]");
      first ??= btn;
      btn.onclick = () => {
        for (const b of this.items.flatMap((o) => [...(o.node?.querySelectorAll?.("[data-route]") ?? [])])) b.disabled = true;
        this.run.feb.route = r.id;
        this.stamp(c);
        this.later(1400, () => this.go("debrief"));
      };
    });
    if (F.notOffered) {
      const n = this.dom(1250, 630, `<div class="paper sheet" style="width:600px;padding:22px 30px"><p class="lab" style="color:var(--ink2)">Not on the table</p><p class="body" style="font-size:20px;line-height:28px">${F.notOffered}</p></div>`);
      move(this, n, { alpha: [0, 1] }, { dur: T.paper, delay: 1100 });
    }
    this.talk("halden", F.halden, { w: 1000, delay: 700 });
    this.focusLater(first, 1600);
  }

  ch_debrief() {
    const D = debrief(this.run);
    this.hud(6, { seals: 0 });
    this.table.setBoats("none");
    this.table.revealTruth();
    const rows = D.rows.map((r) => `<div class="dt" style="opacity:0"><b>${r[0]}</b><span>${r[1]}</span><span>${r[2]}</span><span style="color:var(--red-ink)">${r[3]}</span></div>`).join("");
    const s = this.dom(80, 128, `<article class="paper sheet" style="width:1000px"><h2 style="font-size:46px;line-height:52px">${D.title}</h2><p class="body" style="margin-top:8px">${D.line}</p>
      <div class="dt" style="border:0;font-size:16px;font-weight:600;color:var(--ink2);margin-top:14px"><span></span><span>You ordered</span><span>We believed</span><span style="color:var(--red-ink)">What was really happening</span></div>${rows}
      <div class="btns" style="margin-top:22px"><button class="b on" style="height:56px;font-size:20px" data-again>Play December again</button></div></article>`);
    move(this, s, { alpha: [0, 1] }, { dur: 600 });
    s.node.querySelectorAll(".dt[style*='opacity']").forEach((row, i) => {
      if (reducedMotion.on) { row.style.opacity = 1; return; }
      row.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: 600 + i * STAGGER.line, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });
    });
    const again = s.node.querySelector("[data-again]");
    again.onclick = () => this.go("dec-brief");
    this.focusLater(again, 1200);
    this.talk("halden", D.halden, { x: 1120, w: 740, delay: 1400 });
  }
}
