// Balance report: does one fixed plan win regardless of the campaign? Plays every legal
// combination of orders (within two personal orders a month) against many seeds and reports,
// per difficulty, how often the staff plan and the best fixed plans succeed, and how often
// the best plan for a campaign is a different plan. Run: node scripts/balance.mjs [seeds]
import { DIFFICULTY, makeCampaign } from "../src/story/campaign.js";
import { forecast, outcome, simulate, needsApproval } from "../src/story/play.js";
import { latticeOrders, orders } from "../src/story/copy.js";

const SEEDS = Number(process.argv[2] ?? 150);
const STAFF = { dec: { beacon: "quiet", lattice: "boats" }, jan: { beacon: "quiet", lattice: "sarn", way: null } };

// Every fixed plan: the same choices whatever the campaign shows you. An incident answer is
// "staff" or "own" so a plan applies to whichever incident a campaign rolls.
export function* plans() {
  for (const db of ["quiet", "rest", "show"]) for (const dl of ["boats", "who", "when"]) for (const di of ["staff", "own"])
    for (const jb of ["quiet", "hold", "show"]) for (const jl of ["sarn", "when", "who"]) for (const way of [null, "buy", "act"]) for (const ji of ["staff", "own"])
      for (const route of ["quiet", "forward", "joint"]) {
        if (way === "act" && jb !== "show") continue;
        yield { db, dl, di, jb, jl, way, ji, route };
      }
}

const STAFF_ANSWER = { radar: "fix", defector: "hand", leak: "silent", collision: "return", visit: "quiet" };
const OWN_ANSWER = { radar: "run", defector: "talk", leak: "brief", collision: "search", visit: "open" };

// The run a plan gives in one campaign, or null if it breaks the two-orders rule there.
export function runFor(c, p) {
  // Under the previous rules (rules-review.mjs) the staff answer was cameras.
  const swap = c.variant?.visit === "open";
  const staff = swap ? { ...STAFF_ANSWER, visit: "open" } : STAFF_ANSWER, own = swap ? { ...OWN_ANSWER, visit: "quiet" } : OWN_ANSWER;
  const inc = (m, x) => (c.incidents[m] ? (x === "own" ? own : staff)[c.incidents[m]] : null);
  const run = { dec: { beacon: p.db, lattice: p.dl, incident: inc("dec", p.di) }, jan: { beacon: p.jb, lattice: p.jl, way: p.way, incident: inc("jan", p.ji) }, feb: { route: p.route } };
  const decSeals = (p.db !== "quiet") + (p.dl !== "boats") + (c.incidents.dec && p.di === "own" ? 1 : 0);
  const janSeals = (p.jb !== "quiet") + (p.jl !== "sarn") + (p.way ? 1 : 0) + (c.incidents.jan && p.ji === "own" ? 1 : 0);
  // Two personal orders a month, or what the campaign grants (a war's refit can buy a third in December).
  if (decSeals > (c.seals?.dec ?? 2) || janSeals > (c.seals?.jan ?? 2)) return null;
  const s = simulate(c, run);
  if (p.way === "act" && !needsApproval(c, s.janOrders, "show")) return null;
  if (p.jb === "show" && needsApproval(c, s.janOrders, "show") && !p.way) return null; // the send button stays blocked
  if (p.route === "joint" && !s.janEnd.navy) run.feb.route = "quiet"; // not offered: the plan falls back
  return run;
}

const key = (p) => `${p.db}/${p.dl}/${p.di} · ${p.jb}/${p.jl}/${p.way ?? "-"}/${p.ji} · ${p.route}`;
const SCORE = { success: 2, costly: 1, failure: 0 };
// Within a grade, a better result is fewer casualties, fewer days on the battalion and more
// ministers: what the task force carries into its next sector.
const fine = (o) => SCORE[o.grade] * 10000 - o.casualties * 4 - o.daysAfter + Math.round(o.supportAfter) * 3;

// Decision diversity, measured on the decisions rather than the seeds. Each campaign has a SET
// of best plans (ties included); every measure counts membership of that set, never just the
// first best plan found, which would make ties look like variety. For each order slot:
//   decisive  share of campaigns where some option of that slot can't reach the best result
//   share     for each option, the share of campaigns where it is in some best plan
//   spread    how evenly those memberships spread over the options (normalised entropy:
//             0 = one option only, 1 = every option equally often)
// and for whole plans: how many different plans are ever best, and the largest share of
// campaigns any one plan is best for (with ties, shares can add up to more than 1).
export const SLOTS_MEASURED = { db: ["quiet", "rest", "show"], dl: ["boats", "who", "when"], di: ["staff", "own"], jb: ["quiet", "hold", "show"], jl: ["sarn", "when", "who"], way: [null, "buy", "act"], ji: ["staff", "own"], route: ["quiet", "forward", "joint"] };
const entropy = (counts) => { const n = counts.reduce((a, b) => a + b, 0), k = counts.length; if (!n || k < 2) return 0; return -counts.filter(Boolean).reduce((h, x) => h + (x / n) * Math.log(x / n), 0) / Math.log(k); };
export function decisionDiversity(bestPlans, keyOf = key) {
  const n = bestPlans.length, slots = {};
  for (const [slot, options] of Object.entries(SLOTS_MEASURED)) {
    let decisive = 0;
    const member = new Map(options.map((o) => [o, 0]));
    for (const best of bestPlans) {
      const used = new Set(best.map((p) => p[slot]));
      if (options.some((o) => !used.has(o))) decisive++;
      for (const o of used) if (member.has(o)) member.set(o, member.get(o) + 1);
    }
    slots[slot] = { decisive: decisive / n, share: Object.fromEntries([...member].map(([o, x]) => [String(o), x / n])), spread: entropy([...member.values()]) };
  }
  const member = new Map();
  for (const best of bestPlans) for (const k of new Set(best.map(keyOf))) member.set(k, (member.get(k) ?? 0) + 1);
  return { slots, distinctBestPlans: member.size, commonestShare: Math.max(...member.values()) / n, planShare: member };
}

export function report(seeds = SEEDS, variant = null) {
  const all = [...plans()];
  const out = {};
  for (const d of Object.keys(DIFFICULTY)) {
    const wins = new Map(all.map((p) => [key(p), 0]));
    let staffWins = 0, bestVaries = 0, seals = 0, fails = 0, binds = 0;
    for (let i = 0; i < seeds; i++) {
      const c = makeCampaign(`B${i}`, d);
      if (variant) c.variant = variant;
      const staffRun = { ...structuredClone(STAFF), dec: { ...STAFF.dec, incident: null }, jan: { ...STAFF.jan, incident: null }, feb: { route: "quiet" } };
      if (outcome(c, staffRun).grade === "success") staffWins++;
      let best = -1, bestKeys = [];
      for (const p of all) {
        const run = runFor(c, p);
        if (!run) continue;
        const o = outcome(c, run), g = o.grade;
        if (g === "success") wins.set(key(p), wins.get(key(p)) + 1);
        const sc = fine(o);
        if (sc > best) { best = sc; bestKeys = [p]; } else if (sc === best) bestKeys.push(p);
      }
      if (best < 20000 - 2000) fails++;
      const cost = (p) => (p.db !== "quiet") + (p.dl !== "boats") + (p.jb !== "quiet") + (p.jl !== "sarn") + (p.way ? 1 : 0)
        + (c.incidents.dec && p.di === "own" ? 1 : 0) + (c.incidents.jan && p.ji === "own" ? 1 : 0);
      const cheapest = Math.min(...bestKeys.map(cost));
      seals += cheapest;
      // A month where every best answer spends both personal orders: the limit binds.
      const janCost = (p) => (p.jb !== "quiet") + (p.jl !== "sarn") + (p.way ? 1 : 0) + (c.incidents.jan && p.ji === "own" ? 1 : 0);
      if (Math.min(...bestKeys.map(janCost)) >= 2) binds++;
      out[d] ??= {};
      (out[d].bestSets ??= []).push(new Set(bestKeys.map(key)));
      (out[d].bestPlans ??= []).push(bestKeys);
    }
    const ranked = [...wins.entries()].sort((a, b) => b[1] - a[1]);
    const diversity = decisionDiversity(out[d].bestPlans);
    const top = ranked[0];
    for (const set of out[d].bestSets) if (!set.has(top[0])) bestVaries++;
    out[d] = {
      seeds, staff: staffWins / seeds, best: { plan: top[0], rate: top[1] / seeds },
      top5: ranked.slice(0, 5).map(([k, v]) => [k, v / seeds]),
      // Campaigns where the most successful fixed plan is not among the best plans for it.
      bestPlanMissesBestOutcome: bestVaries / seeds,
      unwinnable: fails / seeds,
      fewestOrdersForBest: seals / seeds,
      januaryLimitBinds: binds / seeds,
      diversity,
    };
  }
  return out;
}

// ── playing on what you can see ────────────────────────────────────────────
// The report above is omniscient: each campaign's best plan is found knowing the hidden truth.
// These policies see only what the desk shows: the officers' advice, and in February the
// forecast's open cases. February is chosen cautiously: the route whose worst open case is
// best, then the best average.
const G = { success: 2, costly: 1, failure: 0 };
function cautiousRoute(c, run) {
  const F = forecast(c, run);
  return F.routes.map((rt) => ({ route: rt.route, worst: Math.min(...rt.cases.map((h) => G[h.r.grade])), mean: rt.cases.reduce((n, h) => n + G[h.r.grade], 0) / rt.cases.length }))
    .sort((a, b) => b.worst - a.worst || b.mean - a.mean)[0].route;
}
const majority = (council, staffId) => {
  const n = {};
  for (const p of Object.values(council)) n[p.prefers] = (n[p.prefers] ?? 0) + 1;
  return Object.entries(n).sort((a, b) => b[1] - a[1] || (a[0] === staffId ? -1 : b[0] === staffId ? 1 : 0))[0][0];
};
export const POLICIES = {
  "staff plan": () => ({}),
  "majority of the staff": (c, run, month) => ({ beacon: majority(orders(c, run, month).council, "quiet"), lattice: majority(latticeOrders(c, run, month).council, month === "dec" ? "boats" : "sarn") }),
  "Okafor (rest)": (c, run, month) => ({ beacon: month === "dec" ? "rest" : "hold" }),
  "Halden (intelligence)": (c, run, month) => ({ beacon: orders(c, run, month).council.halden.prefers, lattice: latticeOrders(c, run, month).council.halden.prefers }),
};
export function playPolicy(c, policy) {
  const run = { dec: { beacon: "quiet", lattice: "boats", incident: null }, jan: { beacon: "quiet", lattice: "sarn", way: null, incident: null }, feb: { route: "quiet" } };
  for (const month of ["dec", "jan"]) {
    const want = policy(c, run, month), limit = c.seals?.[month] ?? 2;
    let used = 0;
    for (const slot of ["beacon", "lattice"]) {
      const v = want[slot], staff = slot === "beacon" ? "quiet" : month === "dec" ? "boats" : "sarn";
      if (v && v !== staff && used < limit) { run[month][slot] = v; used++; }
    }
    // A January daylight move that needs the host's answer in time gets it by trading the boats.
    if (month === "jan" && run.jan.beacon === "show" && needsApproval(c, simulate(c, run).janOrders, "show")) {
      if (used < limit) run.jan.way = "buy"; else run.jan.beacon = "quiet";
    }
  }
  run.feb.route = cautiousRoute(c, run);
  return run;
}
export function policyReport(seeds = SEEDS) {
  const out = {};
  for (const d of Object.keys(DIFFICULTY)) {
    out[d] = {};
    for (const [name, policy] of Object.entries(POLICIES)) {
      // The grade, and what was given up: a full success is not the only thing a plan can be for.
      const t = { success: 0, costly: 0, failure: 0, stationLost: 0, allyLost: 0, battalionLost: 0 };
      for (let i = 0; i < seeds; i++) {
        const c = makeCampaign(`B${i}`, d), o = outcome(c, playPolicy(c, policy));
        t[o.grade]++;
        if (!o.kept.beacon) t.stationLost++;
        if (!o.kept.ally) t.allyLost++;
        if (!o.kept.battalion) t.battalionLost++;
      }
      out[d][name] = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v / seeds]));
    }
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = report();
  for (const [d, x] of Object.entries(r)) {
    console.log(`\n${d}  (${x.seeds} seeds)`);
    console.log(`  staff plan every month: ${(x.staff * 100).toFixed(0)}% success`);
    console.log(`  best fixed plan:        ${(x.best.rate * 100).toFixed(0)}% success  [${x.best.plan}]`);
    for (const [k, v] of x.top5.slice(1)) console.log(`                          ${(v * 100).toFixed(0)}%  [${k}]`);
    console.log(`  campaigns where that plan is not a best answer: ${(x.bestPlanMissesBestOutcome * 100).toFixed(0)}%`);
    console.log(`  campaigns with no full success possible:       ${(x.unwinnable * 100).toFixed(0)}%`);
    console.log(`  personal orders the best answer needs, average: ${x.fewestOrdersForBest.toFixed(2)} of 4`);
    console.log(`  campaigns where the best answer needs both January orders: ${(x.januaryLimitBinds * 100).toFixed(0)}%`);
    const v = x.diversity;
    console.log(`  decision diversity (ties counted for every tied plan): ${v.distinctBestPlans} plans are ever best; the commonest is best in ${(v.commonestShare * 100).toFixed(0)}% of campaigns`);
    console.log(`    slot      decisive  spread  in a best plan`);
    for (const [k, y] of Object.entries(v.slots)) console.log(`    ${k.padEnd(9)} ${(y.decisive * 100).toFixed(0).padStart(6)}%   ${y.spread.toFixed(2)}    ${Object.entries(y.share).map(([o, x]) => `${o === "null" ? "none" : o} ${(x * 100).toFixed(0)}%`).join(", ")}`);
  }
  console.log(`\nPlaying on what you can see (officers' advice; February chosen cautiously from the forecast's open cases)`);
  for (const [d, row] of Object.entries(policyReport())) {
    console.log(`  ${d}`);
    for (const [name, t] of Object.entries(row)) console.log(`    ${name.padEnd(24)} success ${(t.success * 100).toFixed(0).padStart(3)}%  costly ${(t.costly * 100).toFixed(0).padStart(3)}%  failure ${(t.failure * 100).toFixed(0).padStart(3)}%   station lost ${(t.stationLost * 100).toFixed(0).padStart(3)}%  ally lost ${(t.allyLost * 100).toFixed(0).padStart(3)}%  battalion unfit ${(t.battalionLost * 100).toFixed(0).padStart(3)}%`);
  }
}
