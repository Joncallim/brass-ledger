// "Reinforce and reposition the guns" against the best legal alternative, in the same exposed
// situations, on paired seeds (Jon, review 10). Run: node scripts/reposition-compare.mjs [seeds]
//
// A situation is one campaign (seed and difficulty) with the choices made before January's
// orders: December's station order and Lattice question, the December incident answer and the
// January incident answer. It counts only when Ravellan knows where our guns are at January's
// orders, which is when the order is offered. Exposure is never added: it comes only from the
// player's own answers (briefing the press, cameras at the visit), as in the game.
//
// From each situation, every legal way to finish the campaign (January's station order,
// Lattice question and dealing with the host, then February's route) is played, and the best
// of each kind is compared:
//   with     the best continuation that repositions
//   without  the best continuation that doesn't (the best legal alternative)
// "Best" is the balance report's score (grade, then casualties, fatigue and support), so it
// knows the hidden truth: an upper bound on what a player could do. A second comparison holds
// everything else fixed and picks February cautiously from the forecast, as a player who sees
// only the board would: reposition against the quiet reinforcement, same Lattice question, same
// dealing with the host.
import { DIFFICULTY, makeCampaign } from "../src/story/campaign.js";
import { outcome, simulate } from "../src/story/play.js";
import { cautiousRoute, fine, plans, runFor } from "./balance.mjs";

const SEEDS = Number(process.argv[2] ?? 150);
const ALL = [...plans()];
const janOrders = (c, p) => (p.jb !== "quiet") + (p.jl !== "sarn") + (p.way ? 1 : 0) + (c.incidents.jan && p.ji === "own" ? 1 : 0);
const pct = (x, n) => `${((100 * x) / Math.max(1, n)).toFixed(0)}%`;
const blank = () => ({ n: 0, lost: 0, success: 0, costly: 0, failure: 0, orders: 0 });
const add = (t, c, o, p) => { t.n++; t.lost += o.code === "lost"; t[o.grade]++; t.orders += janOrders(c, p); };

const rows = {};
for (const d of Object.keys(DIFFICULTY)) {
  const R = (rows[d] = { situations: 0, with: blank(), without: blank(), better: 0, worse: 0, same: 0, alt: {}, fixed: { pairs: 0, with: blank(), without: blank() } });
  for (let i = 0; i < SEEDS; i++) {
    const c = makeCampaign(`B${i}`, d);
    const groups = new Map();
    for (const p of ALL) {
      const k = `${p.db}/${p.dl}/${p.di}/${p.ji}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(p);
    }
    for (const list of groups.values()) {
      const p0 = list[0];
      // Without an incident that month, "staff" and "own" are the same situation: count it once.
      if ((!c.incidents.dec && p0.di === "own") || (!c.incidents.jan && p0.ji === "own")) continue;
      const pre = runFor(c, { ...p0, jb: "quiet", jl: "sarn", way: null, route: "quiet" });
      if (!pre || !simulate(c, pre).janOrders.rivalKnows) continue; // not exposed: not offered
      R.situations++;
      let best = { with: null, without: null };
      for (const p of list) {
        const run = runFor(c, p);
        if (!run) continue;
        const o = outcome(c, run), side = p.jb === "reposition" ? "with" : "without", sc = fine(o);
        if (!best[side] || sc > best[side].sc) best[side] = { sc, o, p };
      }
      if (!best.with || !best.without) continue;
      add(R.with, c, best.with.o, best.with.p);
      add(R.without, c, best.without.o, best.without.p);
      R.alt[best.without.p.jb] = (R.alt[best.without.p.jb] ?? 0) + 1;
      if (best.with.sc > best.without.sc) R.better++; else if (best.with.sc < best.without.sc) R.worse++; else R.same++;
      // Held fixed: the quiet reinforcement against the move, same everything else, February
      // chosen cautiously from the forecast each time.
      for (const p of list) {
        if (p.jb !== "reposition" || p.route !== "quiet") continue;
        const a = runFor(c, p), b = runFor(c, { ...p, jb: "quiet" });
        if (!a || !b) continue;
        a.feb.route = cautiousRoute(c, a); b.feb.route = cautiousRoute(c, b);
        R.fixed.pairs++;
        add(R.fixed.with, c, outcome(c, a), p);
        add(R.fixed.without, c, outcome(c, b), { ...p, jb: "quiet" });
      }
    }
  }
}

const line = (t) => `station lost ${pct(t.lost, t.n).padStart(4)} · success ${pct(t.success, t.n).padStart(4)} · costly ${pct(t.costly, t.n).padStart(4)} · failure ${pct(t.failure, t.n).padStart(4)} · January orders ${(t.orders / Math.max(1, t.n)).toFixed(2)}`;
console.log(`Reinforce and reposition against the best legal alternative (${SEEDS} seeds a difficulty)`);
for (const [d, R] of Object.entries(rows)) {
  console.log(`\n${d}: ${R.situations} exposed situations (campaign × choices before January's orders)`);
  console.log(`  best with the move     ${line(R.with)}`);
  console.log(`  best without it        ${line(R.without)}`);
  console.log(`  the move's best is better in ${R.better}, worse in ${R.worse}, the same in ${R.same}. Best alternative's station order: ${Object.entries(R.alt).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  console.log(`  held fixed, cautious February (${R.fixed.pairs} pairs):`);
  console.log(`    reposition           ${line(R.fixed.with)}`);
  console.log(`    reinforce quietly    ${line(R.fixed.without)}`);
}
