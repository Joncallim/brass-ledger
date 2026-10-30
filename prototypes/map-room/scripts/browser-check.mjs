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
//              report, at 1920x1080, 1280x720 and 1024x640; pause and skip work
//   keyboard   February chosen with Tab and Enter
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
const SEAL = { radar: "run", defector: "talk", leak: "brief", collision: "search", visit: "quiet" };

const server = await preview({ root: ROOT, preview: { port: 0, strictPort: false }, logLevel: "error" });
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch();

async function page(viewport = { width: 1920, height: 1080 }, query = "chapter=title") {
  const p = await browser.newPage({ viewport });
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
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1280, height: 720 }, { width: 1024, height: 640 }]) {
    const p = await page(viewport);
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
        const over = Math.max(0, Math.min(l.x1, r.pg.x1) - Math.max(l.x0, r.pg.x0)) * Math.max(0, Math.min(l.y1, r.pg.y1) - Math.max(l.y0, r.pg.y0));
        if (over > 0) fail(area, `the report covers the label "${l.text}"`);
      }
      if (r.pg.y1 > 1080.5 || r.pg.x1 > 1920.5) fail(area, "report off the table");
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

// ── the sketch, on the real chart ────────────────────────────────────────────
async function sketch() {
  const p = await page();
  const S = await import("../src/story/sketch.js");
  const { SCENARIOS } = await import("../src/scenarios/index.js");
  const geo = S.geographyOf(SCENARIOS["kestrel-strait"]);
  for (const choice of S.CHOICES) {
    const { plan } = S.withdrawalPlan(geo, choice), end = stateAfter(plan, plan.steps.length - 1);
    const r = await p.evaluate(async (plan) => {
      window.mapRoom.reduced.on = true;
      const n = window.mapRoom.playPlan(plan), T = window.mapRoomTable;
      for (let i = 0; i < n; i++) T.showdownStep(i);
      T.showdownJump(n - 1);
      return { actors: Object.fromEntries(Object.entries(T.sd.actors).map(([id, a]) => [id, { x: a.x, y: a.y, visible: a.alpha > 0.5 }])), anchors: T.sd.A };
    }, plan);
    for (const [id, s] of Object.entries(end.actors)) {
      const a = r.actors[id], at = r.anchors[s.at];
      if (a.visible !== s.visible) fail(`sketch ${choice.lift}/${choice.cover}`, `${id} visibility differs from the plan`);
      if (s.visible && Math.hypot(a.x - at.x, a.y - at.y) > 80) fail(`sketch ${choice.lift}/${choice.cover}`, `${id} ended away from ${s.at}`);
    }
  }
  pageErrors("sketch", p);
  await p.close();
  return `${S.CHOICES.length} sketch plans`;
}

try {
  const only = process.argv.find((x) => x.startsWith("--only="))?.slice(7).split(",");
  for (const [name, fn] of [["screens", screens], ["slips and rooms", slipsAndRooms], ["campaigns", campaigns], ["showdowns", showdowns], ["sketch", sketch]]) {
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
