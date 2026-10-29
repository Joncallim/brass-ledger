import Phaser from "phaser";
import { EASE, T, STAGGER, move, prefs, reducedMotion, savePrefs, seeded } from "../motion.js";
import {
  CALENDAR, DEFAULT_CAMPAIGN, DEFAULT_RUN, DIFFICULTY, LATTICE, OFFICERS, ORIENT, TITLE, brief, debrief, february, fullName, host,
  incident, latticeOrders, latticeQ, makeCampaign, monthOf, newSeed, night, orders, outcome, plainName, showdown, simulate, split, status, surname,
} from "../fixture.js";
import { OX, OY } from "./TableScene.js";
import { SCENARIOS, STORY_SCENARIO } from "../scenarios/index.js";
import { validateScenario } from "../chart/geometry.js";
import { glossNode, hasTerm, profileHTML } from "../gloss.js";
import { WORLD, setWorld } from "../story/world.js";
import { worldFor } from "../gen/factions.js";
import { PROGRESS, ledger, staffRoom } from "../story/rooms.js";
import { clearLog, log, rawLog, summary } from "../playlog.js";

const TRAY = { x: 1640, y: 1000 }; // where slips are dealt from and gathered to
const portrait = (id) => `./portraits/${OFFICERS[id].portrait}.jpg`;
// Lower-case only the first letter, so names like Beacon keep their capital.
const lower = (s) => s[0].toLowerCase() + s.slice(1);
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

// Number keys jump to these. The incident signals sit between briefing and orders.
export const CHAPTERS = ["title", "dec-brief", "dec-orders", "dec-night", "jan-brief", "jan-orders", "jan-night", "feb-showdown", "debrief"];
const ALL = [...CHAPTERS, "dec-signal", "jan-signal", "feb-night", "chart"];
const MONTH = { dec: { turn: 4, name: "December" }, jan: { turn: 5, name: "January" } };

// Every word and every control is DOM, so screen readers, focus and text rendering work
// as in the web app. Phaser positions and moves it; it never decides what it says.
export class DeskScene extends Phaser.Scene {
  constructor() {
    super("desk");
  }

  // `data` is set when a new theatre restarted the table (see newTheatre); otherwise the
  // page's query string decides.
  create(data = {}) {
    this.table = this.scene.get("table");
    this.items = [];
    this.timers = [];
    this.skipFns = [];
    const q = new URLSearchParams(location.search);
    this.newCampaign(data.seed ?? q.get("seed") ?? DEFAULT_CAMPAIGN.seed, data.difficulty ?? q.get("difficulty") ?? DEFAULT_CAMPAIGN.difficulty);
    this.input.keyboard.on("keydown", (e) => this.onKey(e));
    this.setupProfiles();
    // Test hooks: jump to a chapter, roll a campaign, or set the choices so far.
    window.mapRoom = {
      go: (c, opts) => this.go(c, opts), chapters: CHAPTERS, reduced: reducedMotion,
      setRun: (r) => (this.run = r), getRun: () => structuredClone(this.run), campaign: (seed, d) => this.newCampaign(seed, d),
      theatre: (seed, d, chapter) => this.newTheatre(seed, d, chapter),
    };
    Object.defineProperty(window.mapRoom, "c", { get: () => this.campaign });
    // Another sea opens on its chart preview: the story is written for Kestrel Strait.
    const start = data.chapter ?? q.get("chapter");
    const storySea = this.table.sc.story || this.table.sc.id === STORY_SCENARIO;
    this.go(ALL.includes(start) ? start : storySea ? "title" : "chart");
  }

  // A campaign is rolled from a seed: same seed and difficulty, same campaign.
  newCampaign(seed, difficulty) {
    this.campaign = makeCampaign(seed, difficulty);
    this.run = DEFAULT_RUN();
    log("campaign", { code: this.campaign.seed, difficulty: this.campaign.difficulty, theatre: WORLD.strait });
  }

  // A new code is a new theatre: new countries, new names, a new chart, and a campaign
  // rolled on them. The world changes in place and both scenes restart on it, so this works
  // where the page can't be reloaded with a new query string (the hosted preview).
  newTheatre(seed, difficulty, chapter = "dec-brief") {
    this.clear();
    setWorld(worldFor(seed));
    const table = this.table;
    this.scene.stop();
    table.scene.restart({ seed, difficulty, chapter });
  }

  // Where things stand at a point in the campaign, given the choices so far.
  at(point) {
    return simulate(this.campaign, this.run)[point];
  }

  // ── names and terms ──────────────────────────────────────────────────────
  // Every glossary word that reaches the DOM is highlighted (a MutationObserver catches
  // slips that re-render themselves), and one shared card shows its profile on hover or focus.
  setupProfiles() {
    const root = this.game.domContainer;
    // A theatre change restarts this scene; the page-level listeners below go on only once
    // and always talk to the desk that is running now.
    this.game.desk = this;
    const el = document.createElement("div");
    el.className = "ui tip";
    el.setAttribute("role", "tooltip");
    el.id = "profile-tip";
    this.tip = this.add.dom(0, 0, el).setOrigin(0, 0).setVisible(false);
    this.tipEl = el;
    this.showTip = (t) => {
      const key = t.dataset.term;
      if (!hasTerm(key)) return;
      el.innerHTML = profileHTML(key);
      root.appendChild(el); // always on top of whatever was added since
      el.style.display = "block"; // measure now; Phaser only applies visibility on its next frame
      this.tip.setVisible(true);
      const stage = this.game.canvas.getBoundingClientRect(), r = t.getBoundingClientRect(), k = 1920 / stage.width;
      const w = el.offsetWidth, h = el.offsetHeight;
      let y = (r.bottom - stage.top) * k + 10;
      if (y + h > 1064) y = (r.top - stage.top) * k - h - 10;
      const x = Math.min(Math.max((r.left - stage.left) * k, 16), 1920 - w - 16);
      this.tip.setPosition(x, Math.max(16, y));
      t.setAttribute("aria-describedby", "profile-tip");
    };
    this.hideTip = () => this.tip.setVisible(false);
    if (this.game.profilesWired) return;
    this.game.profilesWired = true;
    const desk = () => this.game.desk;
    const termOf = (e) => e.target.closest?.("[data-term]");
    root.addEventListener("mouseover", (e) => { const t = termOf(e); if (t) desk().showTip(t); });
    root.addEventListener("mouseout", (e) => { const t = termOf(e); if (t && !t.contains(e.relatedTarget)) desk().hideTip(); });
    root.addEventListener("focusin", (e) => { const t = termOf(e); if (t) desk().showTip(t); else desk().hideTip(); });
    root.addEventListener("focusout", (e) => { if (termOf(e)) desk().hideTip(); });
    new MutationObserver((records) => {
      const tip = desk().tipEl;
      for (const r of records) for (const n of r.addedNodes) if (n.nodeType === 1 && n !== tip && !tip.contains(n)) glossNode(n);
    }).observe(root, { childList: true, subtree: true });
  }

  // Invisible hover zones over the chart's own labels, so "Sarn" on the map explains itself
  // too. Only while the camera is at rest; the night pan would leave them behind.
  mapHotspots() {
    const sc = this.table.sc, ctx = (this.measure ??= document.createElement("canvas").getContext("2d"));
    const box = (term, [x, y], text, font, h, width) => {
      if (!hasTerm(term)) return;
      ctx.font = font;
      const w = width ?? Math.max(...String(text).split("\n").map((l) => ctx.measureText(l).width));
      const hot = this.dom(OX + x - 4, OY + y - 4, `<span class="hot" data-term="${term}" aria-hidden="true" style="width:${w + 8}px;height:${h + 8}px"></span>`);
      this.game.domContainer.prepend(hot.node); // beneath every sheet and slip
      this.hot.push(hot);
    };
    this.hot = [];
    for (const l of sc.labels ?? []) if (l.term) box(l.term, l.at, l.text, l.style === "place" ? "30px Newsreader" : "20px IBM Plex Sans", l.style === "place" ? 34 : 24);
    for (const l of sc.land) if (l.term && l.name) box(l.term, l.nameAt, l.name, "30px Newsreader", 34);
    for (const f of sc.features) {
      if (f.term && f.label?.text) box(f.term, f.label.at, f.label.text, "600 14px IBM Plex Sans", 18);
      if (f.term && f.type === "cartouche") box(f.term, [f.at[0] + 4, f.at[1] + 4], f.title, "", 96, (f.width ?? 330) - 8);
    }
    const st = sc.station, p = st && sc.places[st.place];
    if (st?.term && p) box(st.term, [st.side === "right" ? p.x + 40 : p.x - 330, p.y - 34], st.name, "600 20px IBM Plex Sans", 50);
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
    // The side rooms open over any chapter; while one is open, only its keys work.
    const room = { s: "staff", S: "staff", l: "ledger", L: "ledger", o: "settings", O: "settings" }[e.key];
    if (e.key === "Escape" && this.room) return this.closeRoom();
    if (room && this.chapter !== "title" && this.chapter !== "chart") return this.room?.kind === room ? this.closeRoom() : this.openRoom(room);
    if (this.room) return;
    if (e.target?.tagName === "BUTTON") return;
    if (e.key === " " || e.key === "Enter") this.skip();
    if (e.key === "m" || e.key === "M") { reducedMotion.on = !reducedMotion.on; savePrefs(); }
    const n = Number(e.key);
    if (n >= 1 && n <= CHAPTERS.length) this.go(CHAPTERS[n - 1]);
    if (e.key === "n" || e.key === "N") { this.newTheatre(newSeed(), this.campaign.difficulty); }
    if (e.key === "0") this.go("chart");
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
    glossNode(el); // before the text nodes are collected, so highlights type out in place
    el.style.minHeight = `${el.offsetHeight}px`; // reserve the finished height, so boxes don't grow as they type
    if (reducedMotion.on || !prefs.typeRate) {
      if (!reducedMotion.on) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay, fill: "backwards" });
      return;
    }
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
      timer = this.time.addEvent({ delay: 1000 / prefs.typeRate, loop: true, callback: () => {
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
  // The top bar: month, campaign, readiness at a glance, and this month's personal orders.
  // Each readiness value belongs to one officer, named in its profile on hover.
  hud(turn, { seals = 2, used = 0, flipTo = null, state = null } = {}) {
    const tools = state ? `<div class="tools"><button class="tool" data-room="staff" title="Staff room (S)">Staff</button><button class="tool" data-room="ledger" title="Ledger (L)">Ledger</button><button class="tool" data-room="settings" title="Settings (O)">Settings</button></div>` : "";
    const chips = state ? `<div class="chips">${status(this.campaign, state).map((x) => `<span class="chip tone-${x.tone}" data-term="${x.term}" tabindex="0"><i></i><span><small>${x.label}</small>${x.value}</span></span>`).join("")}</div>` : "";
    const track = CALENDAR.map((m, i) => `<i class="${i < 3 ? "before" : i + 1 < turn ? "done" : i + 1 === turn ? "now" : ""}" title="${i < 3 ? `${m}: before you took command` : m}">${m[0]}</i>`).join("");
    const s = seals ? `<div class="seals"><span>${state ? "Personal orders" : "Your personal orders this month"}</span>${
      Array.from({ length: 2 }, (_, i) => `<span class="seal ${i < used ? "empty" : ""}" data-seal="${i}">BL</span>`).join("")}</div>` : "";
    const h = this.dom(40, 12, `<div class="hud ${state ? "compact" : ""}"><div class="mark"><svg width="26" height="26" viewBox="0 0 22 22" aria-hidden="true"><rect x="1" y="1" width="20" height="20" rx="3" fill="#C99A3E"/><rect x="5" y="6" width="12" height="2" fill="#141210"/><rect x="5" y="10" width="12" height="2" fill="#141210"/><rect x="5" y="14" width="7" height="2" fill="#141210"/></svg>Brass Ledger</div>
      <div class="month"><b data-month>${monthOf(turn)}</b><span>${this.where(turn)}</span></div><div class="track">${track}</div>${chips}${tools}${s}</div>`);
    this.hudEl = h.node;
    for (const b of h.node.querySelectorAll("[data-room]")) b.onclick = () => (this.room?.kind === b.dataset.room ? this.closeRoom() : this.openRoom(b.dataset.room));
    if (flipTo) this.flipMonth(flipTo);
    return h;
  }

  where(turn) {
    return `${this.table.sc.name} · month ${Math.max(1, turn - 3)} of 3 · ${this.campaign.D.name}`;
  }

  flipMonth(turn) {
    const b = this.hudEl.querySelector("[data-month]");
    const span = b.nextElementSibling;
    const swap = () => { b.textContent = monthOf(turn); span.textContent = this.where(turn); };
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
      <div><div class="who" data-term="officer:${id}"><span class="rank">${o.rank}</span> ${o.name}<span class="post">${o.post}</span></div>
      <p class="say" aria-live="polite"></p></div><span class="hint">Click or press Space</span></div>`);
    t.node.addEventListener("click", () => this.skip());
    move(this, t, { alpha: [0, 1], x: [x - 32, x] }, { dur: 420, delay });
    this.type(t.node.querySelector(".say"), line, delay + 200);
    t.y = Math.min(y, 1060 - t.node.offsetHeight); // long lines rise from the bottom edge
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
    const d = this.dom(1222, 1080, `<div class="dispatch"><dl data-rows><dt>You’re changing</dt><dd data-changing>${changing}</dd><dt>Staff will</dt><dd data-staff>${staff}</dd></dl>
      <div style="display:flex;align-items:center;gap:16px"><button class="go" ${disabled ? "disabled" : ""}>${label}</button><p class="why" data-why>${why}</p></div></div>`);
    d.setAlpha(0);
    return d;
  }

  // The send panel sits on the bottom edge; whenever its rows change height, it stays there.
  settleDispatch(arrive = false) {
    const d = this.disp, y = 1036 - d.node.offsetHeight;
    if (arrive) move(this, d, { y: [1080, y], alpha: [0, 1] }, { dur: 420, delay: 1000 });
    else if (!this.tweens.isTweening(d)) d.y = y;
  }

  // ── chapters ──────────────────────────────────────────────────────────────
  go(chapter, opts = {}) {
    if (this.chapter) log("screen", { chapter: this.chapter, ms: Date.now() - (this.chapterAt ?? Date.now()) });
    this.chapterAt = Date.now();
    this.clear();
    this.table.reset();
    this.next = null;
    this.talkObj = null;
    this.chapter = chapter;
    this.room = null; // cleared with everything else above
    this.slips = []; this.extraNotes = null; this.talkAt = { w: 1000 };
    this.hideTip();
    if (!chapter.endsWith("night")) this.mapHotspots();
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

  // Chart preview: the sea on its own, with its live objects, for checking any scenario.
  ch_chart() {
    const sc = this.table.sc, problems = validateScenario(sc, this.table.geo);
    this.table.setBoats("lane");
    this.table.showWarning(true, { pulse: false });
    this.table.showLattice("(intel marker)");
    const links = Object.values(SCENARIOS).map((o) => o.id === sc.id ? `<b>${o.name}</b>`
      : `<a href="?scenario=${o.id}&chapter=chart" style="color:var(--brass-deep)">${o.name}</a>`).join(" · ");
    const card = this.dom(OX + 24, OY + 820 - 24, `<div class="paper" style="width:560px;padding:18px 22px">
      <div class="lab">Chart preview · ${esc(sc.name)}</div>
      <p style="margin:4px 0 0">${sc.land.length} land masses, ${sc.features.length} chart marks, ${Object.keys(sc.places).length} places.
      ${problems.length ? `<span style="color:var(--red)">${problems.length} problems: ${problems.map(esc).join("; ")}</span>` : "Validator: no problems."}</p>
      <p class="help" style="margin:8px 0 0">Charts: ${links}. ${sc.story ? "Press 1 for the story." : "The story is written for Kestrel Strait; keys 1–9 still play it on this chart."}</p></div>`);
    move(this, card, { alpha: [0, 1] }, { dur: T.ui });
    card.y = OY + 920 - 24 - card.node.offsetHeight;
  }

  // Title: continue the current campaign, or roll a new one at a chosen difficulty.
  ch_title() {
    this.hud(4, { seals: 0 });
    this.table.setBoats("lane");
    this.table.showWarning(true, { pulse: false });
    this.dom(OX, OY, `<div style="width:1500px;height:944px;background:linear-gradient(90deg,rgba(20,18,16,.95) 58%,rgba(20,18,16,0))"></div>`);
    const c = this.campaign;
    const t = this.dom(150, 150, `<div class="title"><h1>Brass Ledger</h1><p>${TITLE.line}</p>
      <dl class="orient" data-orient>${ORIENT.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
      <p class="campaign-code">Campaign <b>${esc(c.seed)}</b> · ${c.D.name}</p>
      <div data-start style="display:flex;gap:16px;margin-top:32px"><button class="go" data-go>Continue in December</button><button class="ghost" data-new>New campaign</button></div>
      <div data-setup hidden><p class="setup-q">How much should change from one campaign to the next?</p><div class="levels">${Object.entries(DIFFICULTY).map(([id, d]) => `<button class="level ${id === c.difficulty ? "sel" : ""}" data-level="${id}"><b>${d.name}</b><span>${d.line}</span></button>`).join("")}</div>
        <p class="help" style="margin-top:14px">Each new campaign is set in a new theatre: a new strait, new countries and a new chart. A fresh code also rolls the hidden enemy plan, the ally’s politics, your staff’s starting state and the month’s incidents. Replaying a code replays the same theatre and campaign.</p></div>
      <p style="font-size:18px;color:var(--room-muted);margin-top:20px" data-saved>${TITLE.saved}</p></div>`);
    move(this, t, { alpha: [0, 1], y: [174, 150] }, { dur: T.reveal });
    const go = t.node.querySelector("[data-go]");
    go.onclick = () => { this.run = DEFAULT_RUN(); this.go("dec-brief"); };
    t.node.querySelector("[data-new]").onclick = () => {
      t.node.querySelector("[data-start]").style.display = "none";
      t.node.querySelector("[data-orient]").style.display = "none";
      t.node.querySelector("[data-saved]").style.display = "none";
      t.node.querySelector("[data-setup]").hidden = false;
      t.node.querySelector(".level.sel")?.focus({ preventScroll: true });
    };
    for (const b of t.node.querySelectorAll("[data-level]")) b.onclick = () => { this.newTheatre(newSeed(), b.dataset.level); };
    this.focusLater(go, 300);
    this.next = go.onclick;
  }

  // A morning briefing: the sheet on the right, the officer speaking, one way on.
  briefing(turn, data, nextChapter, nextLabel, state) {
    this.hud(turn, { state });
    this.table.cameras.main.fadeIn(reducedMotion.on ? 0 : 600, 20, 18, 16);
    const secs = data.sections.map(([l, b], i) => `${i === 1 ? this.warnBlock(data.warning) : ""}<div class="sec"><p class="lab">${l}</p><p class="body">${b}</p></div>`).join("");
    const sheet = this.dom(1150, 108, `<article class="paper sheet tall" style="width:680px" aria-label="${data.title}"><h2>${data.title}</h2><p class="from">${monthOf(turn)} · ${data.from}</p>${secs}
      <div class="btns" style="margin-top:16px"><button class="b on" data-go>${nextLabel}</button></div></article>`);
    move(this, sheet, { x: [1210, 1150], alpha: [0, 1], angle: [4, 0.8] }, { dur: 600, delay: 1000 });
    this.talk("halden", data.halden, { delay: 700, w: 1030 });
    const go = sheet.node.querySelector("[data-go]");
    go.onclick = () => this.go(nextChapter);
    this.focusLater(go, 1700);
    this.next = () => this.go(nextChapter);
  }

  afterBrief(month) {
    return this.campaign.incidents[month] ? [`${month}-signal`, "A signal has come in"] : [`${month}-orders`, `To your ${MONTH[month].name} orders`];
  }

  ch_dec_brief() {
    this.table.setBoats("lane");
    this.table.showWarning(true, { delay: 900 });
    this.briefing(4, brief(this.campaign, this.run, "dec"), ...this.afterBrief("dec"), this.at("decStart"));
  }

  ch_jan_brief() {
    this.table.setBoats("lane");
    this.table.showWarning(true, { pulse: false });
    this.table.setRing(this.ringAfter("dec"));
    this.table.showLattice(`Answered: ${lower(latticeQ(this.run.dec.lattice).q)}`);
    this.briefing(5, brief(this.campaign, this.run, "jan"), ...this.afterBrief("jan"), this.at("decEnd"));
  }

  // ── the hard call ─────────────────────────────────────────────────────────
  // Every decision shows where the staff stand: the two strongest opposing views side by
  // side, each with what that officer is protecting and what happens if you overrule them.
  debate(council, options, staffId) {
    const sp = split(council, staffId);
    const optName = (id) => options.find((o) => o.id === id)?.name ?? id;
    const side = ([opt, who]) => {
      const lead = who[0], p = council[lead], o = OFFICERS[lead];
      const also = who.slice(1).map((w) => surname(w)).join(" and ");
      return `<div class="side"><div class="side-head"><span class="av" style="background-image:url(${portrait(lead)})"></span><span><span class="vname">${surname(lead)}</span><span class="focus">${o.post}</span></span></div>
        <p class="wants">Advises: <b>${optName(opt)}</b>${also ? `<span class="also">, backed by ${also}</span>` : ""}</p>
        <p class="case"><b>Protecting</b> ${p.because}.</p>
        <details class="more"><summary>If you overrule ${OFFICERS[lead].name.split(" ").pop()}</summary><p class="case risk">${p.risk}</p><button class="b sm" data-voice="${lead}">Hear the case</button></details></div>`;
    };
    // Anyone with a third view still gets a line, so no position is hidden.
    const others = (sp.rest ?? []).map(([opt, who]) => `<p class="other"><span class="av sm" style="background-image:url(${portrait(who[0])})"></span><span>${who.map((w) => surname(w)).join(" and ")} ${who.length > 1 ? "advise" : "advises"} <b>${lower(optName(opt))}</b>: ${council[who[0]].because}.</span><button class="b sm" data-voice="${who[0]}">Hear</button></p>`).join("");
    if (sp.agree) return `<div class="debate agree"><p class="lab">Your staff agree</p>${side(sp.side)}</div>`;
    return `<div class="debate"><p class="lab">The hard call</p><div class="sides">${side(sp.a)}${side(sp.b)}</div>${others}</div>`;
  }

  // A case is heard in the speech box, kept clear of the sheet it was asked from.
  wireVoices(root, council, at = { w: 1000 }) {
    for (const b of root.querySelectorAll("[data-voice]")) b.addEventListener("click", () => {
      log("hear", { who: b.dataset.voice });
      this.drop(this.talkObj);
      this.talkObj = this.talk(b.dataset.voice, council[b.dataset.voice].line, { delay: 0, ...(typeof at === "function" ? at() : at) });
    });
  }

  // ── incident signals ──────────────────────────────────────────────────────
  // An incident lands before the month's orders. Picking an answer that costs a personal
  // order spends it now, so the month's orders start with one fewer.
  signal(month) {
    const c = this.campaign, I = incident(c, this.run, month);
    if (!I) return this.go(`${month}-orders`);
    const { turn, name } = MONTH[month];
    this.hud(turn, { state: this.at(month === "dec" ? "decStart" : "decEnd") });
    this.table.setBoats("lane");
    this.table.showWarning(true, { pulse: false });
    if (month === "jan") this.table.setRing(this.ringAfter("dec"));
    this.dom(OX, OY, `<div style="width:1840px;height:944px;background:rgba(20,18,16,.55)"></div>`);
    const pick = () => this.run[month].incident ?? I.staffId;
    const sheet = this.dom(250, 110, "");
    let spent = false;
    const render = () => {
      sheet.node.innerHTML = `<article class="paper sheet signal" aria-label="${I.title}"><p class="lab">Signal · ${I.date} · from ${surname(I.from)}</p><h2>${I.title}</h2>
        <p class="body" style="margin-top:6px">${I.body}</p>${this.debate(I.council, I.options, I.staffId)}
        <div role="radiogroup" style="margin-top:10px">${I.options.map((o) => `<button class="opt ${pick() === o.id ? "sel" : ""}" data-pick="${o.id}" role="radio" aria-checked="${pick() === o.id}"><span class="r"></span><span><b>${o.name}</b><span class="s">${o.says}</span><span class="cost ${o.staff ? "free" : ""}">${o.staff ? "Staff answer · free" : "Uses 1 personal order"}</span></span></button>`).join("")}</div>
        <div class="btns commit"><button class="b on" data-go>Confirm answer and go to ${name} orders</button><p class="commit-note">Your answer goes out when you continue. You can’t change it afterwards.</p></div></article>`;
      this.wireVoices(sheet.node, I.council, { x: 1176, w: 650 });
      for (const b of sheet.node.querySelectorAll("[data-pick]")) b.onclick = () => {
        const o = I.options.find((x) => x.id === b.dataset.pick);
        if (o.id === pick()) return;
        this.run[month].incident = o.id;
        if (o.seal && !spent) { this.spendSeal(sheet, 1); spent = true; }
        if (!o.seal && spent) { this.returnSeal(sheet, 0); spent = false; }
        render();
        sheet.node.querySelector(`[data-pick="${o.id}"]`)?.focus({ preventScroll: true });
        if (I.reply[o.id]) { this.drop(this.talkObj); this.talkObj = this.talk(...I.reply[o.id], { delay: 0, x: 1176, w: 650 }); }
      };
      const go = sheet.node.querySelector("[data-go]");
      go.onclick = () => this.go(`${month}-orders`);
      this.next = go.onclick;
    };
    this.run[month].incident = I.staffId;
    render();
    move(this, sheet, { alpha: [0, 1], y: [140, 110] }, { dur: T.paper, delay: 300 });
    const agree = split(I.council, I.staffId).agree;
    this.talkObj = this.talk(I.from, `General. ${I.body.split(". ")[0]}. ${agree ? "Your staff agree on what to do; the case is on the sheet." : "Your staff disagree on what to do. Both cases are on the sheet."}`, { x: 1176, w: 650, delay: 900 });
    this.focusLater(sheet.node.querySelector(".opt.sel"), 1400);
  }

  // ── side rooms ────────────────────────────────────────────────────────────
  // Staff room, ledger and settings open over the current chapter without resetting it.
  // They read only what has been committed so far (PROGRESS), never choices in progress.
  openRoom(kind) {
    this.closeRoom(false);
    const progress = PROGRESS[this.chapter] ?? 0;
    const back = this.dom(0, 0, `<div class="room-back"></div>`);
    back.node.onclick = () => this.closeRoom();
    const body = { staff: () => this.staffHTML(progress), ledger: () => this.ledgerHTML(progress), settings: () => this.settingsHTML() }[kind]();
    const title = { staff: "Staff room", ledger: "The ledger", settings: "Settings" }[kind];
    const panel = this.dom(180, 96, `<section class="paper room room-${kind}" role="dialog" aria-label="${title}"><header><h2>${title}</h2><button class="b" data-close>Close <kbd>Esc</kbd></button></header>${body}</section>`);
    this.room = { kind, back, panel, opener: document.activeElement };
    panel.node.querySelector("[data-close]").onclick = () => this.closeRoom();
    this.wireRoom(kind, panel.node);
    move(this, panel, { alpha: [0, 1], y: [116, 96] }, { dur: T.ui });
    panel.node.querySelector("[data-close]").focus({ preventScroll: true });
  }

  closeRoom(refocus = true) {
    if (!this.room) return;
    const { back, panel, opener } = this.room;
    this.room = null;
    this.drop(back); this.drop(panel);
    if (refocus) opener?.focus?.({ preventScroll: true });
  }

  staffHTML(progress) {
    const cards = staffRoom(this.campaign, this.run, progress).map((o) => `<article class="officer-card-full">
      <div class="ofc-face" style="background-image:url(${portrait(o.id)})"></div>
      <p class="ofc-name" data-term="officer:${o.id}"><span class="rank">${o.rank}</span> ${o.name}</p><p class="ofc-post">${o.post} · ${o.from}</p>
      <dl><dt>Job</dt><dd>${o.focus}.</dd><dt>Usually argues for</dt><dd>${o.pushes}.</dd>
      ${o.watching ? `<dt>Watching</dt><dd><span class="chip tone-${o.watching.tone}"><i></i><span><small>${o.watching.label}</small>${o.watching.value}</span></span></dd>` : ""}</dl>
      ${o.now ? `<div class="ofc-now"><p class="lab">Advises for ${o.now.month}</p><p class="wants-big">${o.now.wants}${o.now.staffPlan ? ` <span class="tag">staff plan</span>` : ` <span class="tag differs">against the staff plan</span>`}</p>
        <p class="case"><b>Protecting</b> ${o.now.because}.</p><p class="case risk"><b>If you overrule</b> ${o.now.risk}</p>
        <button class="b sm" data-hear="${o.id}">Hear the case</button></div>` : `<div class="ofc-now"><p class="lab">This month</p><p class="case">No order left to argue over.</p></div>`}
      <p class="ofc-record">${o.record ? `You have taken their advice <b>${o.record.followed} of ${o.record.of}</b> times. Last: ${o.record.last.agreed ? "you agreed on" : "you overruled them on"} ${lower(o.record.last.what)}.` : "No decisions yet on which they gave advice."}</p></article>`).join("");
    return `<p class="room-intro">Your four staff officers. Each argues from one job, so they will disagree. You never have to remember who cares about what: it is all here, and under their name wherever they speak.</p><div class="staff-grid">${cards}</div>`;
  }

  ledgerHTML(progress) {
    const L = ledger(this.campaign, this.run, progress);
    const chips = (list) => `<div class="chips mini">${list.map((x) => `<span class="chip tone-${x.tone}"><i></i><span><small>${x.label}</small>${x.value}</span></span>`).join("")}</div>`;
    const entries = L.entries.length ? L.entries.map((e) => `<li><p class="lab">${e.when}</p><p class="entry-title">${e.title}</p>${e.lines.map((l) => `<p class="entry-line">${l}</p>`).join("")}${e.after ? `<div class="after-row"><span class="after">Afterwards</span>${chips(e.after)}</div>` : ""}</li>`).join("")
      : `<li class="empty"><p class="entry-title">Nothing decided yet.</p><p class="entry-line">Every incident answer and every month’s orders will be written here once you commit them, with where things stood afterwards.</p></li>`;
    return `<div class="ledger-cols"><ol class="ledger-list">${entries}</ol>
      <aside><p class="lab">Where things stand</p>${chips(L.now)}<p class="entry-line">${L.cabinet}</p>
      <p class="lab" style="margin-top:18px">What we know</p>${L.knows.length ? `<ul class="knows">${L.knows.map((k) => `<li>${k}</li>`).join("")}</ul>` : `<p class="entry-line">Only what the December briefing told us. ${WORLD.network}’s answers will be added here.</p>`}
      <p class="lab" style="margin-top:18px">Campaign</p><p class="entry-line">Code <b class="code">${esc(L.code)}</b> · ${L.difficulty}</p></aside></div>`;
  }

  settingsHTML() {
    const speeds = [["Slow", 25], ["Normal", 40], ["Fast", 80], ["Instant", 0]];
    const c = this.campaign;
    return `<div class="settings">
      <div class="set-row"><div><p class="set-name">Text speed</p><p class="set-help">How fast officers’ lines type out. Space or a click always finishes a line at once.</p></div>
        <div class="seg" role="radiogroup" aria-label="Text speed">${speeds.map(([n, v]) => `<button role="radio" aria-checked="${prefs.typeRate === v}" class="${prefs.typeRate === v ? "sel" : ""}" data-speed="${v}">${n}</button>`).join("")}</div></div>
      <div class="set-row"><div><p class="set-name">Motion</p><p class="set-help">Reduced motion drops travel and camera moves and keeps short fades. Key M.</p></div>
        <div class="seg" role="radiogroup" aria-label="Motion"><button role="radio" aria-checked="${!reducedMotion.on}" class="${reducedMotion.on ? "" : "sel"}" data-motion="full">Full</button><button role="radio" aria-checked="${reducedMotion.on}" class="${reducedMotion.on ? "sel" : ""}" data-motion="reduced">Reduced</button></div></div>
      <div class="set-row"><div><p class="set-name">This campaign</p><p class="set-help">The same code and difficulty always replay the same campaign: the same hidden plan, politics and incidents.</p></div>
        <div class="set-actions"><span class="code-box">${esc(c.seed)} · ${c.D.name}</span><button class="b" data-copy>Copy code</button><button class="b" data-replay>Replay from December</button></div></div>
      <div class="set-row"><div><p class="set-name">New campaign</p><p class="set-help">Roll a fresh code: a new theatre and a new campaign. Difficulty sets how far each element can vary.</p></div>
        <div class="set-actions">${Object.entries(DIFFICULTY).map(([id, d]) => `<button class="b" data-level="${id}">${d.name}</button>`).join("")}</div></div>
      <div class="set-row"><div><p class="set-name">Playtest log</p><p class="set-help">Kept in this browser only. Copy it into the playtest sheet after a session.</p></div>
        <div class="set-actions"><button class="b" data-log>Show the log</button><button class="b" data-clearlog>Clear</button></div></div>
      <div class="set-row log" data-logbox hidden>${this.logHTML()}</div>
      <div class="set-row keys"><p class="set-name">Keys</p><dl><dt>Space</dt><dd>Finish the line, or continue</dd><dt>S · L · O</dt><dd>Staff room, ledger, settings</dd><dt>1–9</dt><dd>Jump to a chapter</dd><dt>N</dt><dd>New campaign, same difficulty</dd><dt>M</dt><dd>Reduced motion</dd><dt>Esc</dt><dd>Close this panel</dd></dl></div>
    </div>`;
  }

  // Campaigns played in this browser, one row each, and the raw lines to copy.
  logHTML() {
    const rows = summary().slice(-8).reverse();
    const table = rows.length ? `<table class="logtable"><tr><th>Code</th><th>Minutes</th><th>Orders used Dec · Jan</th><th>Slips opened</th><th>Picks taken back</th><th>Cases heard</th><th>February</th><th>Result</th></tr>${rows.map((r) => `<tr><td>${esc(r.code)} · ${r.difficulty}</td><td>${r.minutes}</td><td>${r.seals.dec} · ${r.seals.jan}</td><td>${r.opened}</td><td>${r.undone}</td><td>${r.heard}</td><td>${r.route ?? "–"}</td><td>${r.grade ? `${r.grade}, ${r.days} days, ${r.casualties} casualties` : "unfinished"}</td></tr>`).join("")}</table>` : `<p class="set-help">Nothing logged yet.</p>`;
    return `${table}<textarea readonly rows="5" aria-label="Raw playtest log">${esc(rawLog())}</textarea>`;
  }

  wireRoom(kind, node) {
    for (const b of node.querySelectorAll("[data-hear]")) b.onclick = () => {
      const month = (PROGRESS[this.chapter] ?? 0) < 2 ? "dec" : "jan";
      const line = orders(this.campaign, this.run, month).council[b.dataset.hear].line;
      this.drop(this.talkObj);
      this.talkObj = this.talk(b.dataset.hear, line, { delay: 0, w: 1000 });
    };
    if (kind !== "settings") return;
    const reopen = () => { this.openRoom("settings"); };
    for (const b of node.querySelectorAll("[data-speed]")) b.onclick = () => { prefs.typeRate = Number(b.dataset.speed); savePrefs(); reopen(); };
    for (const b of node.querySelectorAll("[data-motion]")) b.onclick = () => { reducedMotion.on = b.dataset.motion === "reduced"; savePrefs(); reopen(); };
    node.querySelector("[data-copy]").onclick = (e) => {
      const btn = e.currentTarget, text = `${this.campaign.seed} · ${this.campaign.D.name}`;
      navigator.clipboard?.writeText(text).then(() => { btn.textContent = "Copied"; }, () => { btn.textContent = "Select and copy the code"; });
    };
    node.querySelector("[data-replay]").onclick = () => { this.run = DEFAULT_RUN(); this.go("dec-brief"); };
    node.querySelector("[data-log]").onclick = () => { const box = node.querySelector("[data-logbox]"); box.hidden = !box.hidden; };
    node.querySelector("[data-clearlog]").onclick = () => { clearLog(); node.querySelector("[data-logbox]").innerHTML = this.logHTML(); };
    for (const b of node.querySelectorAll("[data-level]")) b.onclick = () => { this.newTheatre(newSeed(), b.dataset.level); };
  }

  ch_dec_signal() { this.signal("dec"); }
  ch_jan_signal() { this.signal("jan"); }

  // The month's incident answer, already sent, for the top of the orders panel.
  sentLine(month) {
    if (!this.campaign.incidents[month]) return null;
    const I = incident(this.campaign, this.run, month), o = I.options.find((x) => x.id === (this.run[month].incident ?? I.staffId));
    return { sent: true, mine: !o.staff, text: `Signal: ${lower(o.name)}${o.staff ? "" : " (personal order)"}.` };
  }

  // Personal orders already spent on this month's incident.
  sealsOnIncident(month) {
    const id = this.campaign.incidents[month];
    if (!id) return 0;
    const I = incident(this.campaign, this.run, month);
    return I.options.find((o) => o.id === this.run[month].incident)?.seal ? 1 : 0;
  }

  // ── order slips ───────────────────────────────────────────────────────────
  // One slip per issue. Its face leads with the decision and its cost, and one line for each
  // officer who advises otherwise; "Change this order" opens the full hard call and the
  // choices. Seals are spent and returned here, never more than two a month including any
  // spent on the incident. Slips in one column make room for each other while open.
  orderSlip(cfg, { get, set, x, y, i, seed, onPicked, w = 560, column = null }) {
    const o = { cfg, get, set, x, y, column };
    const slip = this.dom(0, 0, "");
    o.slip = slip;
    const opt = () => cfg.options.find((p) => p.id === get());
    const wire = () => {
      slip.node.querySelector("[data-change]")?.addEventListener("click", () => this.openSlip(o, () => { slip.node.innerHTML = choices(); wire(); slip.node.querySelector(".opt.sel")?.focus({ preventScroll: true }); }));
      slip.node.querySelector("[data-staffplan]")?.addEventListener("click", () => pick(cfg.options.find((p) => p.staff).id, true));
      slip.node.querySelector("[data-done]")?.addEventListener("click", () => this.closeSlip(o, () => { slip.node.innerHTML = face(); wire(); slip.node.querySelector("[data-change]")?.focus({ preventScroll: true }); }));
      for (const b of slip.node.querySelectorAll("[data-opt]")) b.addEventListener("click", () => pick(b.dataset.opt));
      this.wireVoices(slip.node, cfg.council, () => this.talkAt);
    };
    const face = () => {
      const p = opt();
      const top = p.staff
        ? `<h3>${cfg.head} · staff plan</h3><p class="will">Your staff ${cfg.plan}</p>
           <div class="row"><b>Costs</b><span>${cfg.cost}</span></div><div class="row"><b>Gives</b><span>${cfg.does}</span></div>`
        : `<h3>${cfg.head} · your order</h3><p class="will">${/[?.]$/.test(p.name) ? p.name : `${p.name}.`}</p><div class="row"><b>Means</b><span>${p.says}</span></div>`;
      return `<article class="paper slip" style="width:${w}px" aria-label="${cfg.head}"><span class="pin"></span>${top}${this.advice(cfg.council, cfg.options, p.id)}
        <div class="btns"><button class="b" data-change>${p.staff ? "Change this order" : "Change again"}</button>${p.staff ? "" : '<button class="b" data-staffplan>Back to the staff plan</button>'}</div></article>`;
    };
    const backers = (id) => Object.entries(cfg.council ?? {}).filter(([, c]) => c.prefers === id).map(([who]) => `<span class="av sm" title="${plainName(who)}" style="background-image:url(${portrait(who)})"></span>`).join("");
    const choices = () => `<article class="paper slip open" style="width:${Math.max(w, 780)}px" aria-label="${cfg.head}, choose an order"><span class="pin"></span><h3>${cfg.head} · your order</h3>
      <p class="will">${cfg.question}</p>${cfg.explain ? `<div class="row"><b>Why</b><span>${cfg.explain}</span></div>` : ""}${this.debate(cfg.council, cfg.options, cfg.staffId)}
      <div role="radiogroup">${cfg.options.map((p) => `<button class="opt ${get() === p.id ? "sel" : ""}" data-opt="${p.id}" role="radio" aria-checked="${get() === p.id}">
      <span class="r"></span><span><b>${p.name}</b><span class="s">${p.says}</span><span class="opt-foot"><span class="cost ${p.staff ? "free" : ""}">${p.staff ? "Staff plan · free" : "Uses 1 personal order"}</span>${backers(p.id) ? `<span class="backed">Advised by ${backers(p.id)}</span>` : ""}</span></span></button>`).join("")}</div>
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
      log("pick", { slip: cfg.head.replace(/<[^>]+>/g, ""), option: id, back: isStaff && !wasStaff });
      set(id);
      slip.node.innerHTML = fromFace ? face() : choices();
      wire();
      if (!fromFace) slip.node.querySelector(`[data-opt="${id}"]`)?.focus({ preventScroll: true });
      if (cfg.reply?.[id]) { this.drop(this.talkObj); this.talkObj = this.talk(...cfg.reply[id], { delay: 0, ...this.talkAt }); }
      onPicked?.(id, before);
      this.refreshNotes();
      this.refreshDispatch();
    };
    o.pick = pick;
    o.mark = () => opt().mark;
    o.render = () => { slip.node.innerHTML = face(); wire(); };
    o.render();
    (this.slips ??= []).push(o);
    if (y + slip.node.offsetHeight > 1064) o.y = y = Math.max(108, 1064 - slip.node.offsetHeight);
    this.deal(slip, x, y, i, seed);
    return o;
  }

  // One line per officer who advises something other than the current choice.
  advice(council, options, current) {
    const name = (id) => { const o = options.find((x) => x.id === id); return o?.short ?? lower(o?.name ?? id); };
    const differ = Object.entries(council ?? {}).filter(([, p]) => p.prefers !== current);
    if (!differ.length) return `<p class="advice agree">Your staff all advise this.</p>`;
    // Two lines at most on the face; the rest are one click away.
    const more = differ.length > 2 ? `<p class="more-advice">${differ.slice(2).map(([w]) => surname(w)).join(" and ")} also ${differ.length > 3 ? "advise" : "advises"} otherwise.</p>` : "";
    return `<div class="advice">${differ.slice(0, 2).map(([who, p]) => `<p><span class="av sm" style="background-image:url(${portrait(who)})"></span><span>${surname(who)} advises <b>${name(p.prefers)}</b>: ${p.because}.</span></p>`).join("")}${more}</div>`;
  }

  // Open a slip to its choices. Others in its column step aside until it closes.
  openSlip(o, swap) {
    log("open", { slip: o.cfg.head.replace(/<[^>]+>/g, "") });
    for (const other of this.slips ?? []) if (other !== o && other.column && other.column === o.column) {
      other.slip.node.style.pointerEvents = "none";
      move(this, other.slip, { alpha: 0 }, { dur: T.ui });
    }
    this.game.domContainer.appendChild(o.slip.node); // above its neighbours
    this.talkAt = { x: 1262, y: 108, w: 602 }; // the open slip spans the middle; speak from the right
    if (o.column) move(this, o.slip, { y: 100 }, { dur: T.ui });
    this.flipTo(o.slip, swap);
  }

  closeSlip(o, swap) {
    this.flipTo(o.slip, swap);
    if (o.column) move(this, o.slip, { y: o.y }, { dur: T.ui });
    this.talkAt = this.talkBase;
    // A reply given while the slip was open stood over the right-hand column; it has been read.
    this.drop(this.talkObj); this.talkObj = null;
    // A seal spent while the slip was open follows it back to its pin.
    if (o.slip.seal) move(this, o.slip.seal, { x: o.slip.x + 560 - 30, y: o.y - 22 }, { dur: T.ui });
    for (const other of this.slips ?? []) if (other !== o && other.column && other.column === o.column) {
      other.slip.node.style.pointerEvents = "";
      move(this, other.slip, { alpha: 1 }, { dur: T.ui });
    }
  }

  // The chart shows what every slip on the desk would do.
  refreshNotes() {
    this.table.setNotes([...(this.slips ?? []).map((o) => o.mark?.()), ...(this.extraNotes?.() ?? [])].filter(Boolean));
  }

  flipTo(slip, swap) {
    if (reducedMotion.on) return swap();
    this.tweens.add({ targets: slip, scaleX: 0, duration: 160, ease: EASE.leave, onComplete: () => {
      swap();
      this.tweens.add({ targets: slip, scaleX: 1, duration: 160, ease: EASE.arrive });
    } });
  }

  // The send panel reads every slip, so "You're changing" and "Staff will" are always true.
  orderPanel(lines, blocked) {
    this.lines = lines;
    this.blocked = blocked;
    this.disp = this.dispatch("", "");
    this.refreshDispatch();
    this.settleDispatch(true);
  }

  refreshDispatch() {
    if (!this.disp) return;
    const all = this.lines();
    const sent = all.filter((l) => l.sent).map((l) => l.text).join(" ");
    const mine = all.filter((l) => l.mine && !l.sent).map((l) => l.text).join(" ");
    const staff = all.filter((l) => !l.mine && !l.sent).map((l) => l.text).join(" ");
    const row = (k, v) => `<dt>${k}</dt><dd>${esc(v)}</dd>`;
    this.disp.node.querySelector("[data-rows]").innerHTML = (sent ? row("Already sent", sent) : "") + row("You’re changing", mine || "Nothing yet.") + row("Staff will", staff || "Nothing else this month.");
    const why = this.blocked?.() || "";
    const go = this.disp.node.querySelector(".go");
    go.disabled = Boolean(why);
    this.disp.node.querySelector("[data-why]").textContent = why;
    this.settleDispatch();
  }

  // Signature move. The stamp lands at once; nothing on the map changes until the server
  // accepts. Here a 900 ms timer stands in for that receipt.
  send(slips, then) {
    log("seals", { month: this.chapter.slice(0, 3), used: this.used });
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

  // Orders sit in two columns: the station and Lattice on the left, Marenna and the send
  // panel on the right. The middle of the chart stays clear, with each choice pinned to it.
  ch_dec_orders() {
    this.run.dec = { beacon: "quiet", lattice: "boats", incident: this.run.dec.incident ?? null };
    this.used = this.sealsOnIncident("dec");
    this.hud(4, { used: this.used, state: this.at("decOrders") });
    this.table.setBoats("lane");
    this.table.showWarning(true, { pulse: false });
    this.talkAt = this.talkBase = { x: 664, y: 108, w: 590 }; // between the columns, clear of the send panel
    const B = orders(this.campaign, this.run, "dec");
    const beacon = this.orderSlip(B, {
      get: () => this.run.dec.beacon, set: (v) => (this.run.dec.beacon = v), x: 40, y: 108, i: 0, seed: "dec", column: "left",
      onPicked: (id) => this.table.tweenRing({ preview: B.ring[id] ?? null }, 700),
    });
    const L = latticeOrders(this.campaign, this.run, "dec");
    const lattice = this.orderSlip(L, { get: () => this.run.dec.lattice, set: (v) => (this.run.dec.lattice = v), x: 40, y: this.below(beacon), i: 1, seed: "dec", column: "left" });
    this.refreshNotes();
    this.orderPanel(() => {
      const b = B.options.find((p) => p.id === this.run.dec.beacon), q = L.options.find((p) => p.id === this.run.dec.lattice);
      return [this.sentLine("dec"), { mine: !b.staff, text: `${WORLD.stationShort}: ${lower(b.name)}.` }, { mine: !q.staff, text: `${WORLD.network}: ${q.short}.` }].filter(Boolean);
    });
    const go = this.disp.node.querySelector(".go");
    go.addEventListener("click", () => this.send([beacon.slip, lattice.slip], () => this.go("dec-night")));
    this.focusLater(beacon.slip.node.querySelector("[data-change]"), 1400);
  }

  // Where the next slip in a column goes: under the last one, but never off the table.
  below(prev, gap = 18) {
    return prev.y + prev.slip.node.offsetHeight + gap;
  }

  ch_jan_orders() {
    this.run.jan = { beacon: "quiet", lattice: "sarn", way: null, incident: this.run.jan.incident ?? null };
    this.used = this.sealsOnIncident("jan");
    this.hud(5, { used: this.used, state: this.at("janOrders") });
    this.table.setBoats("lane");
    this.table.showWarning(true, { pulse: false });
    this.table.setRing(this.ringAfter("dec"));
    this.talkAt = this.talkBase = { x: 664, y: 108, w: 590 };
    const J = orders(this.campaign, this.run, "jan");
    let hostSlip;
    const H = () => host(this.campaign, this.run);
    const clash = () => H().clash && !this.run.jan.way;
    const showThread = () => {
      if (!clash()) return;
      this.drop(this.talkObj);
      this.talkObj = this.talk("sato", H().sato, { ...this.talkAt, delay: 300 });
      if (!reducedMotion.on) [beacon.slip, hostSlip.slip].forEach((s, i) => this.tweens.add({ targets: s, x: s.x + (i ? 4 : -4), duration: 60, yoyo: true, repeat: 1, delay: 300 }));
    };
    const beacon = this.orderSlip(J, {
      get: () => this.run.jan.beacon, set: (v) => (this.run.jan.beacon = v), x: 40, y: 108, i: 0, seed: "jan", column: "left",
      onPicked: (id, before) => {
        // Acting without Marenna only makes sense alongside an open move; undo it otherwise.
        if (before === "show" && id !== "show" && this.run.jan.way === "act") { this.returnSeal(hostSlip.slip, --this.used); this.run.jan.way = null; }
        hostSlip.render(); showThread();
      },
    });
    const L = latticeOrders(this.campaign, this.run, "jan");
    const lattice = this.orderSlip(L, { get: () => this.run.jan.lattice, set: (v) => (this.run.jan.lattice = v), x: 40, y: this.below(beacon), i: 1, seed: "jan", column: "left" });
    hostSlip = this.hostSlip(beacon, () => showThread());
    this.extraNotes = () => {
      const h = H(), w = this.run.jan.way;
      return [w ? [...h.ways, h.secure].find((x) => x.id === w)?.mark : null];
    };
    this.refreshNotes();
    this.orderPanel(() => {
      const b = J.options.find((p) => p.id === this.run.jan.beacon), q = L.options.find((p) => p.id === this.run.jan.lattice), w = this.run.jan.way, h = H();
      const lines = [this.sentLine("jan"), { mine: !b.staff, text: `${WORLD.stationShort}: ${lower(b.name)}.` }, { mine: !q.staff, text: `${WORLD.network}: ${q.short}.` }].filter(Boolean);
      const all = [...h.ways, h.secure];
      lines.push(w ? { mine: true, text: `${h.head}: ${lower(all.find((x) => x.id === w).name)}.` } : { mine: false, text: `${h.head}: wait for the cabinet’s vote.` });
      return lines;
    }, () => (clash() ? H().blocked : ""));
    this.disp.node.querySelector(".go").addEventListener("click", () => this.send([beacon.slip, lattice.slip, hostSlip.slip], () => this.go("jan-night")));
    this.focusLater(beacon.slip.node.querySelector("[data-change]"), 1400);
  }

  // Marenna in January. Three states: an open move that needs an answer in time (a clash
  // with three ways out), a shaky vote you can choose to secure, or nothing to decide.
  hostSlip(beacon, onChange) {
    const slip = this.dom(0, 0, "");
    const opt = (x, w) => `<button class="opt ${w === x.id ? "sel" : ""}" data-way="${x.id}" role="radio" aria-checked="${w === x.id}"><span class="r"></span><span><b>${x.name}</b><span class="s">${x.says}</span><span class="cost ${x.gives || x.staff ? "free" : ""}">${x.gives ? "Returns your personal order" : x.staff ? "Staff plan · free" : "Uses 1 personal order"}</span></span></button>`;
    const render = () => {
      const H = host(this.campaign, this.run), show = this.run.jan.beacon === "show", w = this.run.jan.way;
      let body;
      if (H.clash || (show && w)) body = `<div class="row"><b>Clash</b><span>${H.clashText}</span></div>
        <p style="font-size:18px;font-weight:600;margin-top:14px">${w ? "You settled it:" : "Three ways out. Nothing changes until you pick."}</p>
        <div role="radiogroup">${H.ways.map((x) => opt(x, w)).join("")}</div>`;
      else if (show) body = `<div class="row"><b>Why</b><span>${H.why}</span></div><div class="row"><b>Vote</b><span>${H.vote}</span></div>`;
      else if (H.shaky || w === "buy") body = `<div class="row"><b>Why</b><span>${H.why}</span></div><div class="row warnrow"><b>Vote</b><span>${H.vote}</span></div>
        <div role="radiogroup" style="margin-top:8px">${opt({ id: "wait", name: "Let the vote run", says: `${surname("sato")} keeps lobbying. If the vote fails, ${H.head}’s navy stays in port in February.`, staff: true }, w ?? "wait")}${opt(H.secure, w)}</div>`;
      else body = `<div class="row"><b>Why</b><span>${H.why}</span></div><div class="row"><b>Vote</b><span>${H.vote}</span></div>`;
      slip.node.innerHTML = `<article class="paper slip" style="width:580px" aria-label="${H.head}"><span class="pin"></span><h3>${H.head} · ${w && w !== "back" ? "your order" : "staff plan"}</h3>
        <p class="will">Your staff ${H.staff[1]}</p>${body}</article>`;
      for (const b of slip.node.querySelectorAll("[data-way]")) b.addEventListener("click", () => {
        const id = b.dataset.way === "wait" ? null : b.dataset.way, before = this.run.jan.way;
        if (id === before) return;
        if (id === "back") {
          if (before) this.returnSeal(slip, --this.used);
          this.run.jan.way = null;
          beacon.pick("quiet", true);
          this.refreshNotes();
          return;
        }
        if (!before && id) {
          if (this.used >= 2) return;
          this.spendSeal(slip, ++this.used);
        }
        if (before && !id) this.returnSeal(slip, --this.used);
        this.run.jan.way = id;
        render(); slip.node.querySelector(`[data-way="${id ?? "wait"}"]`)?.focus({ preventScroll: true });
        onChange(); this.refreshNotes(); this.refreshDispatch();
      });
    };
    render();
    this.deal(slip, 1270, 108, 2, "jan");
    return { slip, render };
  }

  // ── nights ────────────────────────────────────────────────────────────────
  night(N, fromTurn, nextChapter, { ravellan = "lane", warning = true, state, flip = true } = {}) {
    this.hud(fromTurn, { seals: 0, state });
    if (flip) this.later(800, () => this.flipMonth(fromTurn + 1));
    this.table.setBoats("none");
    this.table.showWarning(warning, { pulse: false });
    this.table.setNight(true);
    const beats = N.beats.map((b, i) => `<div class="beat" data-beat="${i}" style="opacity:0"><b class="n">${i + 1}</b><div><p class="lab" style="color:var(--ink2)">${b.cause}</p><p class="body"></p></div></div>`).join("");
    const sheet = this.dom(56, 104, `<article class="paper sheet tall night" style="width:800px" aria-label="${N.title}"><h2>${N.title}</h2><p class="from">${N.sub}</p>${beats}
      <div data-end style="opacity:0">${N.changes ? `<div class="delta"><p class="lab">What changed this month</p><ul>${N.changes.map((x) => `<li class="${x.same ? "same" : `tone-${x.tone}`}"><b>${x.label}</b> ${x.same ? `${x.after}, unchanged` : `${x.before} <span aria-label="to">→</span> ${x.after}`}</li>`).join("")}</ul></div>` : ""}${N.still ? this.warnBlock(N.still, !warning) : ""}${N.next ? `<div class="sec" style="border:0"><p class="lab">Coming up</p><p class="body">${N.next}</p></div>` : ""}
      <button class="b on" style="height:56px;font-size:20px;margin-top:8px" data-go>${N.go}</button></div></article>`);
    move(this, sheet, { alpha: [0, 1], x: [24, 56] }, { dur: 600, delay: 400 });
    const go = sheet.node.querySelector("[data-go]");
    go.onclick = () => this.go(nextChapter);
    const effect = (b) => {
      if (b.ring) this.table.tweenRing({ r: b.ring, dashed: b.dashed }, 1000);
      if (b.marker) this.table.showLattice(b.marker);
      if (b.at === "lane") this.table.setBoats(ravellan);
    };
    const at = N.beats.map((_, i) => 1200 + i * 1800);
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
      this.later(950, () => this.mapHotspots());
    };
    this.later(at[at.length - 1] + 1600, end);
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
      if (flip) this.flipMonth(fromTurn + 1);
      end();
    };
    this.skipFns.push(skipNight);
    this.next = () => this.go(nextChapter);
  }

  ch_dec_night() {
    this.night(night(this.campaign, this.run, "dec"), 4, "jan-brief", { state: this.at("decEnd") });
  }

  ch_jan_night() {
    this.table.setRing(this.ringAfter("dec"));
    this.night(night(this.campaign, this.run, "jan"), 5, "feb-showdown", { ravellan: "edge", warning: false, state: this.at("janEnd") });
  }

  // ── the showdown and the debrief ──────────────────────────────────────────
  // February: the routes along the bottom edge, what we know top left, Halden top right. The
  // chart between them shows the routes, so the choice is made looking at the sea.
  ch_feb_showdown() {
    const F = february(this.campaign, this.run);
    this.hud(F.turn, { seals: 0, state: this.at("janEnd") });
    this.table.setBoats("edge");
    this.table.setRing(this.ringAfter("jan"));
    this.later(500, () => this.table.revealPaths(F.routes.map((r) => r.id)));
    const w = this.dom(56, 108, `<div class="paper sheet" style="width:560px;padding:18px 26px">${this.warnBlock(F.warning, true)}</div>`);
    move(this, w, { alpha: [0, 1], y: [84, 108] }, { dur: T.paper, delay: 300 });
    // Cards share the bottom edge, right-aligned, at most 600 wide, so the station stays in view.
    const n = F.routes.length, cw = Math.min(600, Math.floor((1808 - 16 * (n - 1)) / n)), x0 = 1864 - n * cw - (n - 1) * 16;
    let first;
    const cards = F.routes.map((r, i) => {
      const c = this.dom(x0 + i * (cw + 16), 1080, `<article class="paper sheet route" style="width:${cw}px"><h2>${r.name}</h2><p class="body">${r.does}</p>
        <div class="row"><b>Costs</b><span>${r.costs}</span></div><div class="row"><b>Needs</b><span>${r.needs}</span></div>
        <div class="quote"><span class="av" style="background-image:url(${portrait(r.voice[0])})"></span><span><span class="attrib">${surname(r.voice[0])}:</span> “${r.voice[1]}”</span></div>
        <div class="btns"><button class="b on" data-route="${r.id}">Choose: ${lower(r.name)}</button></div></article>`);
      const btn = c.node.querySelector("[data-route]");
      first ??= btn;
      btn.onclick = () => {
        for (const b of this.items.flatMap((o) => [...(o.node?.querySelectorAll?.("[data-route]") ?? [])])) b.disabled = true;
        this.run.feb.route = r.id;
        log("route", { route: r.id });
        this.stamp(c);
        this.later(1400, () => this.go("feb-night"));
      };
      return c;
    });
    // All cards share the tallest card's top edge, so they read as one row.
    const h = Math.max(...cards.map((c) => c.node.offsetHeight));
    cards.forEach((c, i) => { c.node.firstChild.style.minHeight = `${h}px`; move(this, c, { alpha: [0, 1], y: [1080, 1064 - h] }, { dur: 520, delay: 900 + i * STAGGER.slip }); });
    if (F.notOffered) {
      const n = this.dom(56, 108 + w.node.offsetHeight + 14, `<div class="paper sheet" style="width:560px;padding:16px 26px"><p class="lab" style="color:var(--ink2)">Not on the table</p><p class="body" style="font-size:19px;line-height:27px">${F.notOffered}</p></div>`);
      move(this, n, { alpha: [0, 1] }, { dur: T.paper, delay: 1100 });
    }
    this.talk("halden", F.halden, { x: 1180, y: 108, w: 684, delay: 700 });
    this.focusLater(first, 1600);
  }

  // The showdown, hour by hour, then the debrief. The top bar now reads the state after
  // February, the same numbers the debrief gives.
  ch_feb_night() {
    const N = showdown(this.campaign, this.run);
    this.table.setRing(this.ringAfter("jan"));
    this.night(N, 6, "debrief", { ravellan: "edge", warning: false, state: N.after, flip: false });
  }

  ch_debrief() {
    const D = debrief(this.campaign, this.run), O = outcome(this.campaign, this.run);
    log("result", { grade: D.grade, days: O.daysAfter, casualties: O.casualties, ministers: D.score[1].text.split(" ")[0] });
    this.hud(6, { seals: 0, state: D.after });
    this.table.setBoats("none");
    this.table.revealTruth(D.truth);
    const rows = D.rows.map((r) => `<div class="dt" style="opacity:0"><b>${r[0]}</b><span>${r[1]}</span><span>${r[2]}</span><span style="color:var(--red-ink)">${r[3]}</span></div>`).join("");
    const s = this.dom(56, 108, `<article class="paper sheet" style="width:1060px;padding:28px 42px 26px"><p class="lab">Campaign ${esc(this.campaign.seed)} · ${this.campaign.D.name}</p><div class="verdict"><h2 style="font-size:44px;line-height:50px">${D.title}</h2><span class="grade grade-${D.grade}">${D.gradeName}</span></div>
      <ul class="score">${D.score.map((x) => `<li class="${x.ok ? "ok" : "bad"}"><i aria-hidden="true">${x.ok ? "✓" : "✗"}</i><span><b>${x.label}</b>${x.text}</span></li>`).join("")}</ul><p class="body" style="margin-top:8px">${D.line}</p>
      <div class="dt" style="border:0;font-size:16px;font-weight:600;color:var(--ink2);margin-top:12px"><span></span><span>Ordered</span><span>We believed</span><span style="color:var(--red-ink)">What was really happening</span></div>${rows}
      <p class="body" style="margin-top:14px;font-size:19px;line-height:27px"><b>${surname("halden")}:</b> ${D.halden}</p>
      <div class="btns" style="margin-top:18px"><button class="b on" style="height:56px;font-size:20px" data-again>Replay this campaign</button><button class="b" style="height:56px;font-size:20px" data-new>New campaign</button></div></article>`);
    move(this, s, { alpha: [0, 1] }, { dur: 600 });
    s.node.querySelectorAll(".dt[style*='opacity']").forEach((row, i) => {
      if (reducedMotion.on) { row.style.opacity = 1; return; }
      row.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: 600 + i * STAGGER.line, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });
    });
    // What the campaign leaves the task force: what each officer will remember.
    const m = this.dom(1136, 108, `<aside class="paper sheet memories" style="width:728px"><p class="lab">What your staff will remember</p>
      ${D.leaves.map(([who, line]) => `<p class="memory"><span class="av" style="background-image:url(${portrait(who)})"></span><span>${line}</span></p>`).join("")}</aside>`);
    move(this, m, { alpha: [0, 1], x: [1160, 1136] }, { dur: 600, delay: 900 });
    const again = s.node.querySelector("[data-again]");
    again.onclick = () => { this.run = DEFAULT_RUN(); this.go("dec-brief"); };
    s.node.querySelector("[data-new]").onclick = () => { this.newTheatre(newSeed(), this.campaign.difficulty); };
    this.focusLater(again, 1200);
  }
}
