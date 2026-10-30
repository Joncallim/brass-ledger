// Balance report: does one fixed plan win regardless of the campaign? Plays every legal
// combination of orders (within two personal orders a month) against many seeds and reports,
// per difficulty, how often the staff plan and the best fixed plans succeed, and how often
// the best plan for a campaign is a different plan. Run: node scripts/balance.mjs [seeds]
import { DIFFICULTY, makeCampaign } from "../src/story/campaign.js";
import { outcome, simulate, needsApproval } from "../src/story/play.js";

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

const STAFF_ANSWER = { radar: "fix", defector: "hand", leak: "silent", collision: "return", visit: "open" };
const OWN_ANSWER = { radar: "run", defector: "talk", leak: "brief", collision: "search", visit: "quiet" };

// The run a plan gives in one campaign, or null if it breaks the two-orders rule there.
export function runFor(c, p) {
  // Under the review's visit variant the staff answer is no cameras, and cameras cost the order.
  const swap = c.variant?.visit === "quiet";
  const staff = swap ? { ...STAFF_ANSWER, visit: "quiet" } : STAFF_ANSWER, own = swap ? { ...OWN_ANSWER, visit: "open" } : OWN_ANSWER;
  const inc = (m, x) => (c.incidents[m] ? (x === "own" ? own : staff)[c.incidents[m]] : null);
  const run = { dec: { beacon: p.db, lattice: p.dl, incident: inc("dec", p.di) }, jan: { beacon: p.jb, lattice: p.jl, way: p.way, incident: inc("jan", p.ji) }, feb: { route: p.route } };
  const decSeals = (p.db !== "quiet") + (p.dl !== "boats") + (c.incidents.dec && p.di === "own" ? 1 : 0);
  const janSeals = (p.jb !== "quiet") + (p.jl !== "sarn") + (p.way ? 1 : 0) + (c.incidents.jan && p.ji === "own" ? 1 : 0);
  if (decSeals > 2 || janSeals > 2) return null;
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

// Decision diversity, measured on the decisions rather than the seeds. For each order slot:
//   decisive  share of campaigns where some option of that slot can't reach the best result
//   spread    how evenly the best option is spread across campaigns (normalised entropy:
//             0 = the same option is always best, 1 = every option is best equally often)
// and for whole plans: how many different best plans the campaigns ask for, and the share of
// campaigns the single most common best plan covers.
export const SLOTS_MEASURED = { db: ["quiet", "rest", "show"], dl: ["boats", "who", "when"], di: ["staff", "own"], jb: ["quiet", "hold", "show"], jl: ["sarn", "when", "who"], way: [null, "buy", "act"], ji: ["staff", "own"], route: ["quiet", "forward", "joint"] };
const entropy = (counts) => { const n = counts.reduce((a, b) => a + b, 0), k = counts.length; if (!n || k < 2) return 0; return -counts.filter(Boolean).reduce((h, x) => h + (x / n) * Math.log(x / n), 0) / Math.log(k); };
export function decisionDiversity(bestPlans) {
  const slots = {};
  for (const [slot, options] of Object.entries(SLOTS_MEASURED)) {
    let decisive = 0;
    const preferred = new Map(options.map((o) => [o, 0]));
    for (const best of bestPlans) {
      const seen = new Map(options.map((o) => [o, 0]));
      for (const p of best) seen.set(p[slot], seen.get(p[slot]) + 1);
      if ([...seen.values()].some((x) => x === 0)) decisive++;
      const top = [...seen.entries()].sort((a, b) => b[1] - a[1])[0][0];
      preferred.set(top, preferred.get(top) + 1);
    }
    slots[slot] = { decisive: decisive / bestPlans.length, spread: entropy([...preferred.values()]) };
  }
  const modal = new Map();
  for (const best of bestPlans) { const k = best.map(key).sort()[0]; modal.set(k, (modal.get(k) ?? 0) + 1); }
  return { slots, distinctBestPlans: modal.size, commonestShare: Math.max(...modal.values()) / bestPlans.length };
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
    console.log(`  decision diversity: ${v.distinctBestPlans} different best plans; the commonest covers ${(v.commonestShare * 100).toFixed(0)}% of campaigns`);
    console.log(`    slot      decisive  spread`);
    for (const [k, y] of Object.entries(v.slots)) console.log(`    ${k.padEnd(9)} ${(y.decisive * 100).toFixed(0).padStart(6)}%   ${y.spread.toFixed(2)}`);
  }
}
