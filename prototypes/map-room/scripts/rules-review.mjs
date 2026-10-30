// The measurements behind RULES-REVIEW.md: each rule under review, against its alternatives,
// over the same campaigns and every legal plan. Run: node scripts/rules-review.mjs [seeds]
import { DIFFICULTY, makeCampaign } from "../src/story/campaign.js";
import { effectiveDefence, outcome, simulate } from "../src/story/play.js";
import { plans, report, runFor } from "./balance.mjs";

const SEEDS = Number(process.argv[2] ?? 100);
const VARIANTS = {
  "current rules": null,
  "exposure: no level lost": { exposure: "none" },
  "exposure: December's is stale by February": { exposure: "fades" },
  "visit: staff answer is no cameras": { visit: "quiet" },
  "naval: a second wave that slips past must be held": { naval: "check" },
};

const pct = (x) => `${(x * 100).toFixed(0)}%`;
console.log(`Balance under each variant (${SEEDS} seeds a difficulty; best fixed plan's success, campaigns that can't be won outright, distinct best plans)`);
for (const [name, v] of Object.entries(VARIANTS)) {
  const r = report(SEEDS, v);
  console.log(`  ${name.padEnd(52)} ${Object.entries(r).map(([d, x]) => `${d} ${pct(x.best.rate)} / ${pct(x.unwinnable)} / ${x.diversity.distinctBestPlans}`).join("   ")}`);
}

// What a typical player gets: the average over every legal plan (success 2, costly 1, failure 0),
// and the share of plans that lose the station.
console.log(`\nAverage result over every legal plan (success = 2), and the share of plans that lose the station`);
const G = { success: 2, costly: 1, failure: 0 };
for (const [name, v] of Object.entries(VARIANTS)) {
  const cells = [];
  for (const d of Object.keys(DIFFICULTY)) {
    let sum = 0, lost = 0, n = 0;
    for (let i = 0; i < SEEDS; i++) {
      const c = makeCampaign(`B${i}`, d);
      if (v) c.variant = v;
      for (const p of plans()) { const run = runFor(c, p); if (!run) continue; const o = outcome(c, run); sum += G[o.grade]; lost += o.code === "lost"; n++; }
    }
    cells.push(`${d} ${(sum / n).toFixed(2)} / ${pct(lost / n)}`);
  }
  console.log(`  ${name.padEnd(52)} ${cells.join("   ")}`);
}

// How often each rule decides a result, over every legal plan.
const all = [...plans()];
const tally = { runs: 0, exposed: 0, exposureDecides: 0, staffCameras: 0, visitCampaigns: 0, joint: 0, jointSlip: 0, slipWeak: 0, slipUnfit: 0 };
for (const d of Object.keys(DIFFICULTY)) for (let i = 0; i < SEEDS; i++) {
  const c = makeCampaign(`B${i}`, d);
  if (c.incidents.jan === "visit") tally.visitCampaigns++;
  for (const p of all) {
    const run = runFor(c, p);
    if (!run) continue;
    tally.runs++;
    const o = outcome(c, run), s = o.s;
    if (s.rivalKnows) {
      tally.exposed++;
      if (c.incidents.jan === "visit" && run.jan.incident === "open") tally.staffCameras++;
      const n = outcome({ ...c, variant: { exposure: "none" } }, run);
      if (n.grade !== o.grade) tally.exposureDecides++;
    }
    if (o.route === "joint" && o.boarded) {
      tally.joint++;
      if (o.code === "landed") {
        tally.jointSlip++;
        if (effectiveDefence(s) < 2) tally.slipWeak++;
        if (!o.fit) tally.slipUnfit++;
      }
    }
  }
}
console.log(`\nLegal plan-campaign runs: ${tally.runs}`);
console.log(`Exposure: Ravellan knows our guns in ${pct(tally.exposed / tally.runs)} of runs; it changes the grade in ${pct(tally.exposureDecides / Math.max(1, tally.exposed))} of those.`);
console.log(`  The staff answer to the minister's visit (cameras) is the source in ${pct(tally.staffCameras / Math.max(1, tally.exposed))} of exposed runs; the visit comes up in ${pct(tally.visitCampaigns / (SEEDS * 3))} of campaigns.`);
console.log(`Naval route, with troops aboard: ${tally.joint} runs; a second wave slipped past in ${tally.jointSlip} (${pct(tally.jointSlip / Math.max(1, tally.joint))}).`);
console.log(`  Of those, the station was kept with defences under level 2 against a landing in ${pct(tally.slipWeak / Math.max(1, tally.jointSlip))}, and with an unfit battalion in ${pct(tally.slipUnfit / Math.max(1, tally.jointSlip))}.`);
