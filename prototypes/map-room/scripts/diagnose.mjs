// Why can't some campaigns be won outright? For every campaign with no full-success plan,
// finds the plans that come closest (fewest of the three objectives lost) and reports which
// objective they lose and the campaign's starting facts. Run: node scripts/diagnose.mjs [difficulty] [seeds]
import { makeCampaign } from "../src/story/campaign.js";
import { outcome } from "../src/story/play.js";
import { plans, runFor } from "./balance.mjs";

const d = process.argv[2] ?? "shifting", seeds = Number(process.argv[3] ?? 150);
const all = [...plans()], rows = [], tally = {};
for (let i = 0; i < seeds; i++) {
  const c = makeCampaign(`B${i}`, d);
  let best = 4, lost = new Set();
  for (const p of all) {
    const run = runFor(c, p);
    if (!run) continue;
    const o = outcome(c, run);
    const missed = Object.entries(o.kept).filter(([, v]) => !v).map(([k]) => k);
    if (missed.length < best) { best = missed.length; lost = new Set([missed.join("+")]); } else if (missed.length === best) lost.add(missed.join("+"));
    if (best === 0) break;
  }
  if (best === 0) continue;
  const why = [...lost].sort().join(" | ");
  tally[why] = (tally[why] ?? 0) + 1;
  rows.push(`B${i}: ${c.plan}${c.craft.jan >= 12 ? " (two waves)" : ""}, cabinet ${c.support0} (${c.minister}${c.hotline ? ", hotline" : ""}), fatigue ${c.fatigue0}, drift ${c.drift.dec}/${c.drift.jan}; closest plans lose: ${why}`);
}
console.log(`${d}: ${rows.length} of ${seeds} campaigns can't be won outright`);
for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) console.log(`  ${v}× closest plans lose ${k}`);
console.log(rows.join("\n"));
