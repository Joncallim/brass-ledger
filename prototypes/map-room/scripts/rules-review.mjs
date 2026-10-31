// The measurements behind RULES-REVIEW.md: the rules decided in review 7 against the rules
// before them, over the same campaigns and every legal plan. Run: node scripts/rules-review.mjs [seeds]
import { DIFFICULTY, makeCampaign } from "../src/story/campaign.js";
import { PREVIOUS_RULES, effectiveDefence, outcome } from "../src/story/play.js";
import { plans, report, runFor } from "./balance.mjs";

const SEEDS = Number(process.argv[2] ?? 100);
const VARIANTS = {
  "review 7 rules (the game)": null,
  "previous: the staff host the visit with cameras": { visit: PREVIOUS_RULES.visit },
  "previous: a second wave past the navies is always held": { naval: PREVIOUS_RULES.naval },
  "previous rules (both)": PREVIOUS_RULES,
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
      if (o.s.rivalKnows && effectiveDefence({ ...o.s, rivalKnows: false }) >= 3 && o.code === "lost") tally.exposureDecides++;
    }
    if (o.route === "joint" && o.boarded) {
      tally.joint++;
      if (o.big && !o.warned) {
        tally.jointSlip++;
        if (o.code === "lost") tally.slipWeak++;
        if (o.code === "landed" && !o.fit) tally.slipUnfit++;
      }
    }
  }
}
console.log(`\nLegal plan-campaign runs: ${tally.runs}`);
console.log(`Exposure: Ravellan knows our guns in ${pct(tally.exposed / tally.runs)} of runs; in ${pct(tally.exposureDecides / Math.max(1, tally.exposed))} of those the station fell with level 3 or more built.`);
console.log(`  Cameras at the minister's visit (now a personal order) are the source in ${pct(tally.staffCameras / Math.max(1, tally.exposed))} of exposed runs; the visit comes up in ${pct(tally.visitCampaigns / (SEEDS * 3))} of campaigns.`);
console.log(`Naval route, with troops aboard: ${tally.joint} runs; a second wave slipped past in ${tally.jointSlip} (${pct(tally.jointSlip / Math.max(1, tally.joint))}).`);
console.log(`  Of those, the ground defence lost the station in ${pct(tally.slipWeak / Math.max(1, tally.jointSlip))}; it was held by an unfit battalion in ${pct(tally.slipUnfit / Math.max(1, tally.jointSlip))} (only possible at level 3 against a landing).`);
