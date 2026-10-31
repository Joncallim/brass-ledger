// The browser checks: the built prototype in Chromium, at the table's size and at smaller
// windows, with and without reduced motion. Builds nothing itself: run `npm run build` first.
// Run: node scripts/browser-check.mjs [--quick]   (CI runs it; exits non-zero on any failure)
//
//   screens    every chapter for many campaigns and paths: nothing scrolls, runs off the table,
//              hides a button, or shows undefined/NaN
//   slips      every order slip opened
//   rooms      staff room, ledger and settings at several points
//   campaigns  whole campaigns played by clicking, checked against the story module
//   showdowns  the end state is the plan's; every label stays on the table and clear of the
//              report, at 1920x1080 and 1728x972 (table) and 1180x712 (compact); pause and skip work
//   keyboard   February chosen with Tab and Enter
//   layout     supported sizes: which layout each window gets, rendered text and control sizes,
//              the compact column
//   zoom       browser zoom on an open page against the 100% page, in device pixels
//   dialogs    the room dialogs' focus contract;
//              radio groups by arrow key; slips, host card and staff room follow the plan
//   sketch     the withdrawal sketch's plan plays on the real chart
import { preview } from "vite";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import * as story from "../src/fixture.js";
import { worldFor } from "../src/gen/factions.js";
import { stateAfter } from "../src/story/battle.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const QUICK = process.argv.includes("--quick");
const failures = [];
const fail = (area, msg) => { failures.push(`${area}: ${msg}`); };
const SEAL = { radar: "run", defector: "talk", leak: "brief", collision: "search", visit: "open" };

const server = await preview({ root: ROOT, preview: { port: 0, strictPort: false }, logLevel: "error" });
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch();

async function page(viewport = { width: 1920, height: 1080 }, query = "chapter=title", deviceScaleFactor = 1) {
  const p = await (await browser.newContext({ viewport, deviceScaleFactor })).newPage();
  // THROTTLE=4 slows the CPU as a slow CI runner would, to find timing assumptions.
  if (process.env.THROTTLE) { const cdp = await p.context().newCDPSession(p); await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.THROTTLE) }); }
  p.errors = [];
  p.on("pageerror", (e) => p.errors.push(e.message));
  await p.goto(`${base}?renderer=canvas&${query}`);
  await p.waitForFunction(() => window.mapRoom);
  await p.evaluate(() => { window.mapRoom.reduced.on = true; });
  return p;
}
const pageErrors = (area, p) => { for (const e of p.errors.slice(0, 3)) fail(area, `page error: ${e}`); };

// ── screens ──────────────────────────────────────────────────────────────────
async function screens() {
  const p = await page();
  const runs = [
    { dec: { beacon: "quiet", lattice: "boats" }, jan: { beacon: "quiet", lattice: "sarn", way: null }, feb: { route: "quiet" } },
    { dec: { beacon: "rest", lattice: "who" }, jan: { beacon: "show", lattice: "when", way: "buy" }, feb: { route: "joint" } },
    { dec: { beacon: "show", lattice: "when" }, jan: { beacon: "show", lattice: "who", way: "act" }, feb: { route: "forward" } },
    { dec: { beacon: "quiet", lattice: "who" }, jan: { beacon: "hold", lattice: "sarn", way: "buy" }, feb: { route: "forward" } },
  ];
  const chapters = ["dec-brief", "dec-signal", "dec-orders", "dec-night", "jan-brief", "jan-signal", "jan-orders", "jan-night", "feb-showdown", "feb-night", "debrief"];
  let n = 0;
  for (const d of ["steady", "shifting", "volatile"]) for (let i = 0; i < (QUICK ? 1 : 3); i++) for (const run of runs) for (const inc of [0, 1]) for (const ch of chapters) {
    const out = await p.evaluate(({ d, i, run, inc, ch, SEAL }) => {
      window.mapRoom.campaign(`T${i}`, d);
      const c = window.mapRoom.c, pick = (m) => (c.incidents[m] && inc ? SEAL[c.incidents[m]] : null);
      window.mapRoom.setRun(JSON.parse(JSON.stringify({ ...run, dec: { ...run.dec, incident: pick("dec") }, jan: { ...run.jan, incident: pick("jan") } })));
      window.mapRoom.go(ch);
      return new Promise((res) => setTimeout(() => {
        const out = [], stage = document.querySelector("canvas").getBoundingClientRect(), k = 1920 / stage.width;
        for (const s of document.querySelectorAll(".sheet.tall")) if (s.scrollHeight > s.clientHeight + 1) out.push("sheet scrolls");
        for (const e of document.querySelectorAll(".talk, button, .sheet, .slip, .chip")) {
          const rc = e.getBoundingClientRect(); if (!rc.height) continue;
          if ((rc.bottom - stage.top) * k > 1080.5) out.push(`${e.className.split(" ")[0] || e.tagName} runs off the bottom`);
          if ((rc.right - stage.left) * k > 1920.5) out.push(`${e.className.split(" ")[0] || e.tagName} runs off the right`);
        }
        for (const btn of document.querySelectorAll("button")) {
          if (btn.closest("details:not([open])") || getComputedStyle(btn).visibility === "hidden") continue;
          const rc = btn.getBoundingClientRect(); if (!rc.width) continue;
          const top = document.elementFromPoint(rc.left + rc.width / 2, rc.top + rc.height / 2);
          if (top && !btn.contains(top) && !top.closest(".tip")) out.push(`button covered: ${btn.textContent.trim().slice(0, 30)}`);
        }
        // Papers never overlap each other: a covered control is then only a matter of fonts.
        const slips = [...document.querySelectorAll(".slip")].map((e) => e.getBoundingClientRect()).filter((r) => r.height);
        for (let a = 0; a < slips.length; a++) for (let b = a + 1; b < slips.length; b++) {
          const x = Math.min(slips[a].right, slips[b].right) - Math.max(slips[a].left, slips[b].left), y = Math.min(slips[a].bottom, slips[b].bottom) - Math.max(slips[a].top, slips[b].top);
          if (x > 0 && y > 0) out.push(`order slips overlap by ${Math.round(y * k)} px`);
        }
        if (/undefined|NaN|\[object/.test(document.body.innerText)) out.push("undefined/NaN on screen");
        res(out);
      }, ch.endsWith("night") ? 250 : 60));
    }, { d, i, run, inc, ch, SEAL });
    n++;
    for (const x of out) fail("screens", `${ch} [${d} T${i} inc${inc}]: ${x}`);
  }
  pageErrors("screens", p);
  await p.close();
  return `${n} screens`;
}

// ── slips and rooms ──────────────────────────────────────────────────────────
async function slipsAndRooms() {
  const p = await page();
  let slips = 0, rooms = 0;
  for (const d of ["steady", "shifting", "volatile"]) for (let i = 0; i < (QUICK ? 2 : 4); i++) {
    for (const ch of ["dec-orders", "jan-orders"]) for (let k = 0; k < 2; k++) {
      await p.evaluate(({ d, i, ch }) => { window.mapRoom.campaign(`O${i}`, d); window.mapRoom.go(ch); }, { d, i, ch });
      await p.waitForTimeout(60);
      const btns = await p.$$("[data-change]");
      if (!btns[k]) continue;
      await btns[k].click(); await p.waitForTimeout(60);
      const out = await p.evaluate(() => {
        const out = [], stage = document.querySelector("canvas").getBoundingClientRect(), kk = 1920 / stage.width;
        if (!document.querySelector(".slip.open")) out.push("no open slip");
        for (const e of document.querySelectorAll(".slip")) { const rc = e.getBoundingClientRect(); if (rc.height && (rc.bottom - stage.top) * kk > 1080.5) out.push("slip runs off the bottom"); }
        if (/undefined|NaN|\[object/.test(document.body.innerText)) out.push("undefined/NaN on screen");
        return out;
      });
      slips++;
      for (const x of out) fail("slips", `${ch} slip ${k} [${d} O${i}]: ${x}`);
    }
    for (const ch of ["dec-brief", "jan-orders", "debrief"]) for (const room of ["staff", "ledger", "settings"]) {
      const out = await p.evaluate(({ d, i, ch, room }) => {
        window.mapRoom.campaign(`W${i}`, d);
        window.mapRoom.setRun({ dec: { beacon: "rest", lattice: "who", incident: null }, jan: { beacon: "show", lattice: "sarn", way: "buy", incident: null }, feb: { route: "joint" } });
        window.mapRoom.go(ch);
        document.querySelector(`[data-room="${room}"]`).click();
        const el = document.querySelector(".room"), out = [];
        if (!el) return ["did not open"];
        if (el.scrollHeight > el.clientHeight + 1) out.push(`scrolls ${el.scrollHeight - el.clientHeight}px`);
        if (/undefined|NaN|\[object/.test(el.innerText)) out.push("undefined/NaN");
        return out;
      }, { d, i, ch, room });
      rooms++;
      for (const x of out) fail("rooms", `${room} @ ${ch} [${d} W${i}]: ${x}`);
    }
  }
  pageErrors("slips and rooms", p);
  await p.close();
  return `${slips} slips, ${rooms} rooms`;
}

// ── whole campaigns, by clicking ─────────────────────────────────────────────
async function playCampaign(seed, diff, plan) {
  const c = story.makeCampaign(seed, diff, worldFor(seed));
  const inc = (m) => (c.incidents[m] && plan.inc ? SEAL[c.incidents[m]] : null);
  const run = { dec: { beacon: plan.dec.beacon ?? "quiet", lattice: plan.dec.lattice ?? "boats", incident: inc("dec") }, jan: { beacon: plan.jan.beacon ?? "quiet", lattice: plan.jan.lattice ?? "sarn", way: plan.jan.way ?? null, incident: inc("jan") }, feb: { route: plan.feb } };
  if (run.jan.way === "act" && !story.needsApproval(c, story.simulate(c, run).janOrders, "show")) run.jan.way = null;
  if (run.jan.beacon === "show" && story.needsApproval(c, story.simulate(c, run).janOrders, "show") && !run.jan.way) run.jan.way = "buy";
  const F = story.february(c, run);
  if (!F.routes.some((r) => r.id === run.feb.route)) run.feb.route = "quiet";
  const want = story.debrief(c, run);
  const p = await page({ width: 1920, height: 1080 }, `seed=${seed}&difficulty=${diff}`);
  p.setDefaultTimeout(5000);
  const area = `campaign ${seed}/${diff}`, seals = () => p.$$eval(".seals .seal:not(.empty)", (s) => s.length);
  try {
    await p.click("[data-go]"); await p.waitForTimeout(400);
    for (const mo of ["dec", "jan"]) {
      if (mo === "jan") { await p.click("[data-go]"); await p.waitForTimeout(400); }
      await p.click(".sheet [data-go]"); await p.waitForTimeout(400);
      if (c.incidents[mo]) {
        if (!(await p.$(".sheet.signal"))) fail(area, `${mo}: no incident signal`);
        if (inc(mo)) { await p.click(`[data-pick="${inc(mo)}"]`); await p.waitForTimeout(250); }
        await p.click(".sheet.signal [data-go]"); await p.waitForTimeout(400);
      }
      const P = run[mo];
      const openSlip = async (k, id) => {
        const h = await p.evaluateHandle((k) => [...document.querySelectorAll("[data-change]")].find((b) => /radio intercepts/.test(b.closest(".slip").querySelector("h3").textContent) === (k === 1)), k);
        await h.asElement().click(); await p.waitForTimeout(250); await p.click(`[data-opt="${id}"]`); await p.waitForTimeout(250); await p.click("[data-done]"); await p.waitForTimeout(300);
      };
      if (P.beacon !== "quiet") await openSlip(0, P.beacon);
      if (P.lattice !== (mo === "dec" ? "boats" : "sarn")) await openSlip(1, P.lattice);
      if (mo === "jan" && P.way && await p.$(`[data-way="${P.way}"]`)) { await p.click(`[data-way="${P.way}"]`); await p.waitForTimeout(300); }
      if (await p.$eval("button.go", (x) => x.disabled)) fail(area, `${mo}: Send blocked`);
      await p.click("button.go"); await p.waitForTimeout(2900);
    }
    await p.click("[data-go]"); await p.waitForTimeout(700);
    const routes = await p.$$eval("[data-route]", (bs) => bs.map((x) => x.dataset.route));
    if (JSON.stringify(routes) !== JSON.stringify(F.routes.map((r) => r.id))) fail(area, `routes ${routes}, expected ${F.routes.map((r) => r.id)}`);
    await p.click(`[data-route="${run.feb.route}"]`); await p.waitForTimeout(2000);
    await p.waitForFunction(() => document.querySelector("[data-end]")?.style.visibility === "visible", null, { timeout: 20000 });
    await p.click(".sheet [data-go]"); await p.waitForTimeout(1200);
    const title = (await p.$eval(".sheet h2", (e) => e.innerText)).trim();
    if (title !== want.title) fail(area, `debrief "${title}", expected "${want.title}" (played ${JSON.stringify(await p.evaluate(() => window.mapRoom.getRun()))})`);
    const score = await p.$eval(".score", (e) => e.innerText);
    if (!score.includes(want.score[2].text.split(",")[0])) fail(area, `scorecard "${score}" vs "${want.score[2].text}"`);
  } catch (e) { fail(area, `stopped: ${e.message.split("\n")[0]} (${e.message.match(/waiting for (locator\([^)]*\)|[^\n]*)/)?.[1] ?? ""})`); }
  pageErrors(area, p);
  await p.close();
}
async function campaigns() {
  const list = [
    ["KESTREL", "shifting", { dec: {}, jan: {}, feb: "quiet" }],
    ["R2D4", "volatile", { inc: false, dec: { lattice: "who" }, jan: { beacon: "show", way: "act" }, feb: "forward" }],
    ["Q7XK", "shifting", { inc: false, dec: { beacon: "show", lattice: "when" }, jan: { beacon: "show", way: "buy" }, feb: "joint" }],
    ["M11", "steady", { inc: true, dec: {}, jan: {}, feb: "joint" }],
    ["ZED9", "volatile", { inc: false, dec: { beacon: "rest" }, jan: { beacon: "hold", lattice: "when" }, feb: "forward" }],
  ];
  for (const [s, d, plan] of QUICK ? list.slice(0, 2) : list) await playCampaign(s, d, plan);
  return `${QUICK ? 2 : list.length} campaigns`;
}

// ── showdowns: end state, labels, small windows, pause, skip ─────────────────
async function showdowns() {
  let n = 0;
  // The table layout at full size and at its smallest scale; the compact layout below that.
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1728, height: 972 }, { width: 1180, height: 712 }]) {
    const p = await page(viewport);
    const compact = await p.evaluate(() => document.body.classList.contains("compact"));
    const size = `${viewport.width}x${viewport.height}`;
    for (const d of ["shifting", "volatile"]) for (let i = 0; i < (QUICK ? 3 : 8); i++) for (const route of ["quiet", "forward", "joint"]) for (const jl of ["sarn", "when"]) {
      const seed = `U${i}`, c = story.makeCampaign(seed, d);
      const run = { dec: { beacon: "rest", lattice: "boats", incident: null }, jan: { beacon: "quiet", lattice: jl, way: "buy", incident: null }, feb: { route } };
      const plan = story.showdown(c, run).play, end = stateAfter(plan, plan.steps.length - 1);
      const reduced = (i + (jl === "sarn" ? 0 : 1)) % 2 === 1;
      const r = await p.evaluate(async ({ seed, d, run, reduced }) => {
        window.mapRoom.reduced.on = reduced;
        window.mapRoom.campaign(seed, d);
        window.mapRoom.setRun(run);
        window.mapRoom.go("feb-night");
        await new Promise((res) => setTimeout(res, 700));
        // Pause holds the chart still; resume, then skip to the end.
        document.querySelector("[data-pause]")?.click();
        const T = window.mapRoomTable, frozen = JSON.stringify(Object.values(T.sd.actors).map((a) => [Math.round(a.x), Math.round(a.y)]));
        await new Promise((res) => setTimeout(res, 400));
        const still = frozen === JSON.stringify(Object.values(T.sd.actors).map((a) => [Math.round(a.x), Math.round(a.y)]));
        document.querySelector("[data-pause]")?.click();
        document.querySelector("[data-skip]")?.click();
        await new Promise((res) => setTimeout(res, 300));
        const stage = document.querySelector("canvas").getBoundingClientRect(), k = stage.width / 1920;
        const panel = document.querySelector(".showdown").getBoundingClientRect();
        const pg = { x0: (panel.left - stage.left) / k, y0: (panel.top - stage.top) / k, x1: (panel.right - stage.left) / k, y1: (panel.bottom - stage.top) / k };
        const labels = T.sd.tags.filter((t) => t.type === "Text").map((t) => { const b = t.getBounds(); return { text: t.text, x0: b.x, y0: b.y, x1: b.x + b.width, y1: b.y + b.height }; });
        const actors = Object.fromEntries(Object.entries(T.sd.actors).map(([id, a]) => [id, { x: a.x, y: a.y, visible: a.alpha > 0.5 }]));
        const anchors = T.sd.A, endVisible = !!document.querySelector("[data-end]") && document.querySelector("[data-end]").style.visibility === "visible";
        return { pg, labels, actors, anchors, still, endVisible, flag: !!T.sd.flag };
      }, { seed, d, run, reduced });
      n++;
      const area = `showdown ${size} ${d} ${seed} ${route}/${jl}${reduced ? " reduced" : ""}`;
      if (!r.still) fail(area, "the chart kept moving while paused");
      if (!r.endVisible) fail(area, "skip did not reach the end");
      const want = plan.steps.flatMap((s) => s.labels ?? []).map((l) => l.text);
      for (const t of want) if (!r.labels.some((l) => l.text === t)) fail(area, `label missing: ${t}`);
      for (const l of r.labels) {
        if (l.x0 < 40 || l.x1 > 1880 || l.y0 < 96 || l.y1 > 1040) fail(area, `label off the table: ${l.text}`);
        if (compact) continue; // the report is in the column, beside the chart
        const over = Math.max(0, Math.min(l.x1, r.pg.x1) - Math.max(l.x0, r.pg.x0)) * Math.max(0, Math.min(l.y1, r.pg.y1) - Math.max(l.y0, r.pg.y0));
        if (over > 0) fail(area, `the report covers the label "${l.text}"`);
      }
      if (!compact && (r.pg.y1 > 1080.5 || r.pg.x1 > 1920.5)) fail(area, "report off the table");
      for (const [id, s] of Object.entries(end.actors)) {
        const a = r.actors[id], at = r.anchors[s.at];
        if (!a) { fail(area, `actor ${id} missing`); continue; }
        if (a.visible !== s.visible) fail(area, `${id} ${a.visible ? "shown" : "hidden"}, plan says ${s.visible ? "shown" : "hidden"}`);
        if (s.visible && Math.hypot(a.x - at.x, a.y - at.y) > 80) fail(area, `${id} ended away from ${s.at}`);
      }
      if (r.flag !== end.effects.some((e) => e.kind === "flag")) fail(area, "flag does not match the plan");
    }
    // Keyboard: from the February choice, Tab to a route and press Enter.
    await p.evaluate(() => { window.mapRoom.reduced.on = true; window.mapRoom.campaign("KESTREL", "shifting"); window.mapRoom.setRun({ dec: { beacon: "rest", lattice: "boats", incident: null }, jan: { beacon: "quiet", lattice: "sarn", way: null, incident: null }, feb: { route: null } }); window.mapRoom.go("feb-showdown"); });
    await p.waitForTimeout(800);
    let reached = false;
    for (let t = 0; t < 40 && !reached; t++) { await p.keyboard.press("Tab"); reached = await p.evaluate(() => !!document.activeElement?.dataset?.route); }
    if (!reached) fail(`keyboard ${size}`, "no route button reachable by Tab");
    else { await p.keyboard.press("Enter"); await p.waitForTimeout(2500); if (!(await p.$(".showdown"))) fail(`keyboard ${size}`, "Enter on a route did not start the showdown"); }
    pageErrors(`showdowns ${size}`, p);
    await p.close();
  }
  return `${n} showdowns`;
}

// ── names: a generated theatre and a war speak only their own names ──────────
const AUTHORED = ["Kestrel", "Marenna", "Ravellan", "Sarn", "Beacon", "Lattice", "2nd Battalion"];
async function scanNames(p, area, where) {
  const text = await p.evaluate(() => {
    const T = window.mapRoomTable, canvas = [...T.children.list, ...(T.sd?.tags ?? [])].filter((o) => o.type === "Text").map((o) => o.text).join(" | ");
    const attrs = [...document.querySelectorAll("[aria-label],[title]")].map((e) => `${e.getAttribute("aria-label") ?? ""} ${e.getAttribute("title") ?? ""}`).join(" ");
    return `${document.body.innerText} || ${canvas} || ${attrs}`;
  });
  for (const n of AUTHORED) if (text.includes(n)) { const i = text.indexOf(n); fail(area, `${where}: "${n}" in "${text.slice(Math.max(0, i - 50), i + 30).replace(/\s+/g, " ")}"`); }
  return text;
}
async function names() {
  const p = await page({ width: 1920, height: 1080 }, "seed=Q7XK&difficulty=shifting");
  let n = 0;
  for (const ch of ["title", "dec-brief", "dec-signal", "dec-orders", "dec-night", "jan-brief", "jan-signal", "jan-orders", "jan-night", "feb-showdown", "feb-night", "debrief"]) for (const room of [null, "staff", "ledger"]) {
    await p.evaluate(({ ch, room }) => { window.mapRoom.go(ch); if (room) document.querySelector(`[data-room="${room}"]`)?.click(); }, { ch, room });
    await p.waitForTimeout(room ? 60 : 200);
    const text = await scanNames(p, "names Q7XK", `${ch}${room ? `/${room}` : ""}`);
    const w = await p.evaluate(() => window.mapRoom.c.world);
    if (ch === "dec-brief" && !room) for (const k of ["host", "rival", "harbour", "network", "stationShort"]) if (!text.includes(w[k])) fail("names Q7XK", `dec-brief never names the ${k} (${w[k]})`);
    await p.evaluate(() => document.querySelector("[data-close]")?.click());
    n++;
  }
  // A war, through to the redeploy screen between sectors.
  await p.evaluate(() => window.mapRoom.war("WN1", "shifting"));
  await p.waitForTimeout(1500);
  await p.waitForFunction(() => window.mapRoom?.getWar());
  await p.evaluate(() => { window.mapRoom.reduced.on = true; window.mapRoom.go("debrief"); });
  await p.waitForTimeout(800);
  const btn = await p.$("[data-redeploy]");
  if (!btn) fail("names war", "no redeploy button after the first sector");
  else {
    await btn.click(); await p.waitForTimeout(600);
    const text = await scanNames(p, "names war", "redeploy");
    const w = await p.evaluate(() => window.mapRoom.c.world);
    if (!text.includes(w.network)) fail("names war", `the refit list never names the network (${w.network})`);
    n++;
  }
  pageErrors("names", p);
  await p.close();
  return `${n} views`;
}

// ── the sketch, on the real chart ────────────────────────────────────────────
async function sketch() {
  const S = await import("../src/story/sketch.js");
  const { SCENARIOS } = await import("../src/scenarios/index.js");
  const { anchorageOf } = await import("../src/story/battle.js");
  let n = 0;
  // Two hours' warning: Kestrel Strait gets the garrison out whatever is chosen; Harrow Sound only
  // with the frigate (the failure case). Three hours on Harrow: the review's one-lift case escapes.
  for (const [id, warning] of [["kestrel-strait", 2], ["harrow-sound", 2], ["harrow-sound", 3], ["kestrel-strait", 6]]) {
    const sc = SCENARIOS[id], ctx = S.sketchContext(sc, warning);
    const p = await page({ width: 1920, height: 1080 }, `scenario=${id}&chapter=chart`);
    for (const choice of S.CHOICES) {
      const { plan, result } = S.withdrawalPlan(ctx, choice), end = stateAfter(plan, plan.steps.length - 1);
      const area = `sketch ${id} ${warning}h ${choice.lift}/${choice.cover} (${result.code})`;
      const r = await p.evaluate(async (plan) => {
        window.mapRoom.reduced.on = true;
        const n = window.mapRoom.playPlan(plan), T = window.mapRoomTable;
        const start = { x: T.sd.actors.transports.x, y: T.sd.actors.transports.y };
        for (let i = 0; i < n; i++) T.showdownStep(i);
        T.showdownJump(n - 1);
        return { scenario: T.sc.id, place: T.sc.places[T.sc.station.place], start, labels: T.sd.tags.filter((t) => t.type === "Text").map((t) => t.text),
          actors: Object.fromEntries(Object.entries(T.sd.actors).map(([k, a]) => [k, { x: a.x, y: a.y, visible: a.alpha > 0.5 }])), anchors: T.sd.A };
      }, plan);
      n++;
      // One context: the chart on the table is the one the distances were measured on, and the
      // transports start at the anchorage those distances were measured to.
      if (r.scenario !== ctx.scenario) fail(area, `chart ${r.scenario}, calculated on ${ctx.scenario}`);
      const off = { x: r.anchors.station.x - r.place.x, y: r.anchors.station.y - r.place.y }, anc = anchorageOf(sc);
      if (Math.hypot(r.start.x - (anc.x + off.x), r.start.y - (anc.y + off.y)) > 2) fail(area, "transports did not start at the calculation's anchorage");
      for (const [k, st] of Object.entries(end.actors)) {
        const a = r.actors[k], at = r.anchors[st.at];
        if (a.visible !== st.visible) fail(area, `${k} ${a.visible ? "shown" : "hidden"}, plan says ${st.visible ? "shown" : "hidden"}`);
        if (st.visible && Math.hypot(a.x - at.x, a.y - at.y) > 80) fail(area, `${k} ended away from ${st.at}`);
      }
      if (!result.kept.garrison && !r.actors.garrison.visible) fail(area, "a failed evacuation removed the garrison");
      const want = plan.steps.flatMap((st) => st.labels ?? []).map((l) => l.text);
      for (const t of want) if (!r.labels.includes(t)) fail(area, `label missing: ${t}`);
    }
    pageErrors(`sketch ${id}`, p);
    await p.close();
  }
  return `${n} sketch plans`;
}


// ── layout, dialogs, radios and the selected plan ─────────────────────────────
// Supported sizes (README): the table layout at a scale of 0.9 or more, the compact layout
// below. Rendered sizes are CSS pixels times the layer's scale. These pages LOAD at each size
// and pixel density (a page that loads already zoomed looks like a denser screen); zooming a
// page that is already open is the `zoom` section below.
const SIZES = [
  { width: 1920, height: 1080, zoom: 1, layout: "table" },
  { width: 1745, height: 982, zoom: 1.1, layout: "table" }, // 1920x1080 at 110%
  { width: 1728, height: 972, zoom: 1, layout: "table" },
  { width: 1700, height: 960, zoom: 1, layout: "compact" },
  { width: 1536, height: 864, zoom: 1.25, layout: "compact" }, // 1920x1080 at 125%
  { width: 1280, height: 720, zoom: 1.5, layout: "compact" }, // 1920x1080 at 150%
  { width: 1180, height: 712, zoom: 1, layout: "compact" },
  { width: 1024, height: 640, zoom: 1, layout: "compact" },
];
const MIN_TEXT = 12.5, MIN_READING = 13.5, MIN_CONTROL = 24;

async function layout() {
  let n = 0;
  const chapters = ["title", "dec-brief", "dec-signal", "dec-orders", "dec-night", "jan-brief", "jan-signal", "jan-orders", "jan-night", "feb-showdown", "feb-night", "debrief"];
  for (const size of SIZES) {
    const tag = `${size.width}x${size.height}@${size.zoom}`;
    const p = await page({ width: size.width, height: size.height }, "chapter=title", size.zoom);
    for (const d of QUICK ? ["volatile"] : ["shifting", "volatile"]) for (const ch of chapters) {
      const r = await p.evaluate(async ({ d, ch }) => {
        window.mapRoom.campaign("Z1", d);
        const c = window.mapRoom.c, seal = { radar: "run", defector: "talk", leak: "brief", collision: "search", visit: "open" };
        window.mapRoom.setRun({ dec: { beacon: "rest", lattice: "who", incident: c.incidents.dec ? seal[c.incidents.dec] : null }, jan: { beacon: "show", lattice: "sarn", way: "buy", incident: c.incidents.jan ? seal[c.incidents.jan] : null }, feb: { route: "joint" } });
        window.mapRoom.go(ch);
        await new Promise((res) => setTimeout(res, ch.endsWith("night") ? 900 : 250));
        const box = document.querySelector("#stage > div"), k = box.getBoundingClientRect().width / box.offsetWidth, out = [];
        const compact = document.body.classList.contains("compact");
        let minText = 99, minReading = 99, minControl = 99;
        const walk = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
        for (let t; (t = walk.nextNode()); ) {
          const s = t.textContent.trim(), el = t.parentElement;
          if (!s || el.closest(".tip, [aria-hidden=true], .fx") || getComputedStyle(el).visibility === "hidden") continue;
          const rg = document.createRange(); rg.selectNodeContents(t); const rc = rg.getBoundingClientRect(); if (!rc.width) continue;
          const px = parseFloat(getComputedStyle(el).fontSize) * k;
          if (px < minText) minText = px;
          if (s.length >= 60 && px < minReading) minReading = px;
          if (px < 12.5) out.push(`text at ${px.toFixed(1)} px: "${s.slice(0, 30)}"`);
        }
        for (const b of box.querySelectorAll("button")) {
          const rc = b.getBoundingClientRect(); if (!rc.width || getComputedStyle(b).visibility === "hidden") continue;
          minControl = Math.min(minControl, rc.width, rc.height);
        }
        if (compact) {
          const col = box.getBoundingClientRect(), cv = document.querySelector("canvas").getBoundingClientRect();
          if (box.scrollWidth > box.clientWidth + 1) out.push(`the column scrolls sideways by ${box.scrollWidth - box.clientWidth} px`);
          if (cv.right > col.left + 1) out.push("the chart runs under the column");
          for (const e of box.querySelectorAll(".ui > *")) { const rc = e.getBoundingClientRect(); if (rc.width && (rc.left < col.left - 1 || rc.right > col.right + 1)) out.push(`${e.className || e.tagName} is wider than the column`); }
          for (const e of box.querySelectorAll(".ui.fx")) if (getComputedStyle(e).display !== "none") out.push("a table-only piece shows in the column");
        }
        if (/undefined|NaN|\[object/.test(document.body.innerText)) out.push("undefined/NaN on screen");
        return { compact, k, minText, minReading, minControl, out };
      }, { d, ch });
      n++;
      const area = `layout ${tag} ${ch} ${d}`;
      if (r.compact !== (size.layout === "compact")) fail(area, `${r.compact ? "compact" : "table"} layout, expected ${size.layout}`);
      if (r.minText < MIN_TEXT) fail(area, `smallest text renders at ${r.minText.toFixed(1)} px (minimum ${MIN_TEXT})`);
      if (r.minReading < MIN_READING) fail(area, `reading text renders at ${r.minReading.toFixed(1)} px (minimum ${MIN_READING})`);
      if (r.minControl < MIN_CONTROL) fail(area, `a control renders ${r.minControl.toFixed(0)} px across (minimum ${MIN_CONTROL})`);
      for (const x of r.out.slice(0, 4)) fail(area, x);
    }
    pageErrors(`layout ${tag}`, p);
    await p.close();
  }
  return `${n} screens at ${SIZES.length} sizes`;
}

// ── zoom ─────────────────────────────────────────────────────────────────────
// Browser zoom on an open page, measured against the page at 100%. Chromium zooms by keeping
// the window's device pixels and raising devicePixelRatio, so the window has fewer CSS pixels;
// the DevTools protocol's device-metrics override drives exactly that on the live page (the
// same resize and resolution events). The size is measured from the rendered text itself:
// the height of a line's box in device pixels.
async function zoom() {
  const p = await page({ width: 1920, height: 1080 }, "chapter=title");
  const cdp = await p.context().newCDPSession(p);
  const set = async (z, screen = 1) => {
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: Math.round(1920 / z), height: Math.round(1080 / z), deviceScaleFactor: z * screen, mobile: false });
    await p.waitForTimeout(300);
  };
  const measure = () => p.evaluate(() => {
    const el = [...document.querySelectorAll(".sheet .body, .sheet p")].find((e) => e.textContent.trim().length > 60);
    const r = document.createRange(); r.selectNodeContents(el.firstChild ?? el);
    const line = [...r.getClientRects()][0];
    return { px: line.height * devicePixelRatio, compact: document.body.classList.contains("compact"), zoom: window.mapRoomView.zoom };
  });
  await p.evaluate(() => { window.mapRoom.campaign("Z1", "shifting"); window.mapRoom.go("dec-brief"); });
  await p.waitForTimeout(300);
  const base = await measure();
  if (base.compact) fail("zoom", "1920x1080 at 100% is not the table layout");
  let n = 0;
  for (const z of [1.1, 1.25, 1.5, 2]) {
    await set(z);
    const m = await measure();
    n++;
    if (!m.compact) fail("zoom", `zoomed to ${z * 100}%: still the table layout, which cancels zoom`);
    if (m.px < base.px * z * 0.95) fail("zoom", `zoomed to ${z * 100}%: a line is ${m.px.toFixed(1)} device px, ${(m.px / base.px).toFixed(2)}x the 100% page`);
  }
  await set(1);
  const back = await measure();
  if (back.compact || Math.abs(back.px - base.px) > 0.5) fail("zoom", `back at 100%: ${back.compact ? "compact" : "table"}, ${back.px.toFixed(1)} px against ${base.px.toFixed(1)}`);
  // Moving to a screen twice as dense is not zoom: same CSS window, the table stays.
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 2, mobile: false });
  await p.waitForTimeout(300);
  const dense = await measure();
  if (dense.compact) fail("zoom", "a denser screen was taken for zoom");
  pageErrors("zoom", p);
  await p.close();
  // The known limit: a page that LOADS at 110% can't be told from a 1745x982 window on a
  // denser screen, so the table layout fits it and the words are no bigger than at 100%.
  const q = await page({ width: 1745, height: 982 }, "chapter=title", 1.1);
  await q.evaluate(() => { window.mapRoom.campaign("Z1", "shifting"); window.mapRoom.go("dec-brief"); });
  await q.waitForTimeout(300);
  const loaded = await q.evaluate(() => ({ compact: document.body.classList.contains("compact") }));
  if (loaded.compact) fail("zoom", "a page loaded at 110% went compact: the README's stated limit is out of date");
  await q.close();
  return `${n + 2} zoom levels against 100%`;
}

// The rooms are modal dialogs: focus goes in and stays in, everything behind is inert and
// shows no glossary card, Escape closes, and focus goes back to the opener.
async function dialogs() {
  let n = 0;
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1180, height: 712 }]) {
    const p = await page(viewport);
    for (const room of ["staff", "ledger", "settings"]) for (const how of ["click", "key"]) {
      await p.evaluate(() => { window.mapRoom.campaign("M1", "volatile"); window.mapRoom.go("jan-orders"); });
      await p.waitForTimeout(250);
      const area = `dialog ${room} by ${how} ${viewport.width}`;
      // The opener: the room's HUD button, or (by key) the first slip's Change button.
      if (how === "click") await p.click(`[data-room="${room}"]`);
      else { await p.focus("[data-change]"); await p.keyboard.press({ staff: "s", ledger: "l", settings: "o" }[room]); }
      await p.waitForTimeout(200);
      const opened = await p.evaluate(() => {
        const panel = document.querySelector("[role=dialog]"), box = document.querySelector("#stage > div");
        if (!panel) return null;
        const behind = [...box.children].filter((x) => !x.contains(panel) && !x.classList.contains("fx") && !x.classList.contains("tip"));
        // Hovering a term behind the room shows nothing over it.
        const term = behind.map((x) => x.querySelector("[data-term]")).find(Boolean);
        term?.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
        const tip = document.getElementById("profile-tip");
        return { inside: panel.contains(document.activeElement), modal: panel.getAttribute("aria-modal"), label: panel.getAttribute("aria-label"),
          allInert: behind.every((x) => x.inert) && document.querySelector("canvas").inert, tipShown: !!tip && getComputedStyle(tip).display !== "none" && tip.offsetParent !== null && !!term };
      });
      if (!opened) { fail(area, "did not open"); continue; }
      if (!opened.inside) fail(area, "focus did not go into the room");
      if (opened.modal !== "true" || !opened.label) fail(area, "not labelled as a modal dialog");
      if (!opened.allInert) fail(area, "something behind the room is not inert");
      if (opened.tipShown) fail(area, "a glossary card from behind the room showed over it");
      for (const key of ["Tab", "Shift+Tab"]) for (let t = 0; t < 40; t++) {
        await p.keyboard.press(key);
        if (!(await p.evaluate(() => document.querySelector("[role=dialog]")?.contains(document.activeElement)))) { fail(area, `${key} left the room`); break; }
      }
      if (room === "settings") {
        // Choosing a setting re-renders the room: still modal, focus on the choice, same opener.
        await p.click('[data-speed="80"]'); await p.waitForTimeout(150);
        const again = await p.evaluate(() => ({ on: document.activeElement?.dataset?.speed, inside: !!document.querySelector("[role=dialog]")?.contains(document.activeElement) }));
        if (again.on !== "80" || !again.inside) fail(area, "focus left the setting just chosen");
        await p.keyboard.press("ArrowRight"); await p.waitForTimeout(150);
        if ((await p.evaluate(() => document.activeElement?.dataset?.speed)) !== "0") fail(area, "arrow key did not move to the next text speed");
        await p.click('[data-speed="40"]'); await p.waitForTimeout(150);
      }
      await p.keyboard.press("Escape"); await p.waitForTimeout(150);
      const closed = await p.evaluate((how) => ({ gone: !document.querySelector("[role=dialog]"), back: how === "click" ? document.activeElement?.dataset?.room : document.activeElement?.hasAttribute?.("data-change") ? "change" : null,
        inert: [...document.querySelectorAll("#stage > div > *")].some((x) => x.inert) || document.querySelector("canvas").inert }), how);
      if (!closed.gone) fail(area, "Escape did not close it");
      if (closed.back !== (how === "click" ? room : "change")) fail(area, "focus did not return to the opener");
      if (closed.inert) fail(area, "the desk stayed inert after closing");
      n++;
    }
    pageErrors(`dialogs ${viewport.width}`, p);
    await p.close();
  }
  return `${n} dialogs`;
}

// Every radio group: labelled, one Tab stop on the chosen option, arrows move and choose.
async function radios() {
  const p = await page();
  let n = 0;
  const groups = await p.evaluate(() => {
    // An incident sheet; every order slip opened; the host card in its clash and its vote.
    const found = [];
    for (const d of ["volatile", "shifting"]) for (let i = 0; i < 12 && found.length < 40; i++) {
      window.mapRoom.campaign(`R${i}`, d);
      if (window.mapRoom.c.incidents.dec) found.push({ seed: `R${i}`, d, ch: "dec-signal", sel: "[data-pick]" });
      if (window.mapRoom.c.incidents.jan) found.push({ seed: `R${i}`, d, ch: "jan-signal", sel: "[data-pick]" });
      found.push({ seed: `R${i}`, d, ch: "dec-orders", sel: "[data-opt]", open: 0 }, { seed: `R${i}`, d, ch: "jan-orders", sel: "[data-opt]", open: 1 });
      found.push({ seed: `R${i}`, d, ch: "jan-orders", sel: "[data-way]", show: true });
    }
    return found;
  });
  for (const g of groups.slice(0, QUICK ? 12 : 40)) {
    const area = `radios ${g.ch} ${g.sel} ${g.d} ${g.seed}`;
    await p.evaluate(({ seed, d, ch, show }) => {
      window.mapRoom.campaign(seed, d);
      if (show) window.mapRoom.setRun({ dec: { beacon: "quiet", lattice: "boats", incident: null }, jan: { beacon: "show", lattice: "sarn", way: null, incident: null }, feb: {} });
      window.mapRoom.go(ch);
    }, g);
    await p.waitForTimeout(250);
    if (g.open !== undefined) { const b = await p.$$("[data-change]"); if (!b[g.open]) continue; await b[g.open].click(); await p.waitForTimeout(100); }
    const r = await p.evaluate(async (sel) => {
      const first = document.querySelector(sel);
      if (!first) return null;
      const group = () => document.querySelector(sel).closest("[role=radiogroup]");
      const state = () => [...group().querySelectorAll("[role=radio]")].map((b) => ({ id: Object.values(b.dataset)[0], on: b.getAttribute("aria-checked") === "true", tab: b.tabIndex, focus: b === document.activeElement }));
      const label = group().getAttribute("aria-label") || group().getAttribute("aria-labelledby");
      const start = state();
      (group().querySelector("[aria-checked=true]") ?? first).focus();
      const press = async (key) => { document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })); await new Promise((r) => setTimeout(r, 60)); return state(); };
      return { label, start, down: await press("ArrowDown"), up: await press("ArrowUp"), end: await press("End"), home: await press("Home"), left: await press("ArrowLeft") };
    }, g.sel);
    if (!r) continue;
    n++;
    if (!r.label) fail(area, "radio group has no label");
    const stops = (st) => st.filter((x) => x.tab === 0).length;
    for (const [k, st] of Object.entries(r)) if (k !== "label" && stops(st) !== 1) fail(area, `${k}: ${stops(st)} Tab stops in the group`);
    if (r.start.find((x) => x.tab === 0) !== r.start.find((x) => x.on)) fail(area, "the Tab stop is not the chosen option");
    const at = (st) => st.findIndex((x) => x.focus), on = (st) => st.findIndex((x) => x.on), len = r.start.length, i0 = on(r.start);
    // A choice can be refused (no personal order left); focus still moves, the chosen option is unchanged.
    if (at(r.down) !== (i0 + 1) % len) fail(area, "ArrowDown did not move to the next option");
    if (on(r.down) !== at(r.down) && on(r.down) !== i0) fail(area, "ArrowDown chose an option it did not move to");
    if (at(r.up) !== i0) fail(area, "ArrowUp did not come back");
    if (at(r.end) !== len - 1 || at(r.home) !== 0) fail(area, "Home and End did not reach the ends");
    if (at(r.left) !== len - 1) fail(area, "ArrowLeft from the first option did not wrap to the last");
  }
  pageErrors("radios", p);
  await p.close();
  return `${n} radio groups`;
}

// Change, combine and undo choices on the desk; the slips, the host card and the staff room
// always say what the story module says for the plan as it now stands.
async function selected() {
  const p = await page();
  let n = 0;
  const strip = (t) => String(t ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  for (const d of ["volatile", "shifting"]) for (let i = 0; i < (QUICK ? 2 : 5); i++) for (const month of ["dec", "jan"]) {
    const seed = `P${i}`, c = story.makeCampaign(seed, d);
    await p.evaluate(({ seed, d, month }) => { window.mapRoom.campaign(seed, d); window.mapRoom.go(`${month}-orders`); }, { seed, d, month });
    await p.waitForTimeout(250);
    const opts = month === "dec" ? [["0", "rest"], ["1", "who"], ["0", "show"], ["1", "boats"], ["0", "quiet"]] : [["0", "hold"], ["1", "when"], ["0", "show"], ["1", "who"], ["0", "quiet"], ["1", "sarn"]];
    for (const [slot, id] of opts) {
      const area = `selected ${month} ${d} ${seed} → ${id}`;
      const b = (await p.$$("[data-change]"))[Number(slot)];
      if (!b) continue;
      // A covered button is a failure to report, not a reason to stop the whole run.
      if (!(await b.click({ timeout: 3000 }).then(() => true, () => false))) { fail(area, "Change this order is covered"); continue; }
      await p.waitForTimeout(60);
      const opt = await p.$(`[data-opt="${id}"]`);
      if (opt) await opt.click({ timeout: 3000 }).catch(() => fail(area, `option ${id} is covered`));
      await p.waitForTimeout(60);
      await (await p.$("[data-done]"))?.click(); await p.waitForTimeout(80);
      const run = await p.evaluate(() => window.mapRoom.getRun());
      const seen = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll(".slip")].map((s) => [s.getAttribute("aria-label"), [...s.querySelectorAll(".row")].map((r) => [r.querySelector("b")?.textContent, r.querySelector("span")?.textContent])])));
      const L = story.latticeOrders(c, run, month), O = story.orders(c, run, month), norm = (x) => strip(x).replace(/\s+/g, " ");
      const face = (head, cfg, pickId) => {
        const rows = Object.fromEntries((seen[strip(head)] ?? []).map(([k, v]) => [k, norm(v)])), o = cfg.options.find((x) => x.id === pickId);
        if (!seen[strip(head)]) return fail(area, `no slip for ${strip(head)}`);
        if (o.staff) { if (rows.Costs !== norm(cfg.cost)) fail(area, `${strip(head)} costs "${rows.Costs}", plan says "${norm(cfg.cost)}"`); }
        else if (rows.Means !== norm(o.says)) fail(area, `${strip(head)} means "${rows.Means}", plan says "${norm(o.says)}"`);
      };
      face(O.head, O, run[month].beacon);
      face(L.head, L, run[month].lattice);
      if (month === "jan") {
        const H = story.host(c, run), vote = (seen[strip(H.head)] ?? []).find(([k]) => k === "Vote")?.[1];
        if (vote !== undefined && norm(vote) !== norm(H.vote)) fail(area, `host card vote "${norm(vote)}", plan says "${norm(H.vote)}"`);
      }
      // The staff room answers the current choice.
      await p.keyboard.press("s"); await p.waitForTimeout(120);
      const room = await p.evaluate(() => [...document.querySelectorAll(".officer-card-full .ofc-now")].map((x) => x.innerText));
      const chosen = strip(O.options.find((x) => x.id === run[month].beacon).name).toLowerCase();
      for (const t of room) if (!t.includes("No order left") && !t.toLowerCase().includes(`your current choice: ${chosen}`)) fail(area, `staff room does not answer the current choice (${chosen})`);
      if (run[month].beacon === "rest" && room.some((t) => /photographs/.test(t))) fail(area, "photographs of troops that stood down");
      await p.keyboard.press("Escape"); await p.waitForTimeout(80);
      n++;
    }
  }
  pageErrors("selected", p);
  await p.close();
  return `${n} plan changes`;
}

try {
  const only = process.argv.find((x) => x.startsWith("--only="))?.slice(7).split(",");
  for (const [name, fn] of [["screens", screens], ["slips and rooms", slipsAndRooms], ["campaigns", campaigns], ["showdowns", showdowns], ["names", names], ["sketch", sketch], ["layout", layout], ["zoom", zoom], ["dialogs", dialogs], ["radios", radios], ["selected", selected]]) {
    if (only && !only.some((o) => name.startsWith(o))) continue;
    const t = Date.now(), said = await fn();
    console.log(`${name.padEnd(16)} ${said} (${((Date.now() - t) / 1000).toFixed(0)} s)`);
  }
} finally {
  await browser.close();
  await server.close();
}
const unique = [...new Set(failures)];
if (unique.length) { console.log(`\n${unique.length} failures:\n${unique.slice(0, 60).join("\n")}`); process.exit(1); }
console.log("\nall browser checks passed");
