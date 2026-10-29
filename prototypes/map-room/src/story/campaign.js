// A campaign is rolled once from a seed. The same seed and difficulty always roll the same
// campaign (so a replay matches); a new seed rolls a different one. Difficulty sets how
// far each element is allowed to vary: Ravellan's hidden plan, how honest the clues are,
// Marenna's politics, the staff's starting conditions, and the incidents each month.
//
// Every number here is prototype dressing awaiting sign-off (see the README). None of it
// is a sim rule; packages/sim stays the authority.
import { seeded } from "../chart/random.js";
import { INCIDENTS } from "./incidents.js";

export const DIFFICULTY = {
  steady: {
    name: "Steady",
    line: "Two possible enemy plans, honest intelligence, a firm ally, one incident.",
    plans: ["land", "bluff"], sailDays: [3, 3], deception: 0, planShift: false,
    support: [64, 76], ministers: ["firm"], voteDays: [15, 15], hotline: 0, drift: 0,
    fatigue: [82, 92], incidents: 1, severity: 1, growth: [1, 2],
  },
  shifting: {
    name: "Shifting",
    line: "Three possible enemy plans, a sailing date anywhere in early February, the odd misleading clue, a divided cabinet, an incident every month.",
    plans: ["land", "bluff", "probe"], sailDays: [2, 5], deception: 0.2, planShift: false,
    support: [46, 66], ministers: ["firm", "hawk", "dove"], voteDays: [12, 17], hotline: 0.3, drift: 5,
    fatigue: [78, 100], incidents: 2, severity: 1.25, growth: [2, 4],
  },
  volatile: {
    name: "Volatile",
    line: "Any enemy plan, which can change mid-campaign; clues that may be planted; a cabinet that drifts month to month; harsher incidents.",
    plans: ["land", "bluff", "probe"], sailDays: [1, 6], deception: 0.4, planShift: true,
    support: [48, 66], ministers: ["hawk", "dove"], voteDays: [10, 20], hotline: 0.45, drift: 8,
    fatigue: [72, 106], incidents: 2, severity: 1.5, growth: [2, 5],
  },
};

// The fleet's real job under each plan, and what Lattice would find if asked.
const FLEET_ROLE = { land: "screen", bluff: "swarm", probe: "scout" };

export function makeCampaign(seed, difficulty = "shifting") {
  const D = DIFFICULTY[difficulty] ?? DIFFICULTY.shifting;
  const r = seeded(`campaign:${seed}:${difficulty}`);
  const pick = (list) => list[Math.floor(r() * list.length)];
  const range = ([a, b]) => a + Math.floor(r() * (b - a + 1));
  const swing = (n) => (n ? range([-n, n]) : 0);

  const plan = pick(D.plans);
  const craftDec = range([8, 10]);
  // How many more landing craft load in December; 12 or more is a battalion plus a second wave.
  const craftJan = craftDec + (plan === "bluff" ? range([0, 1]) : range(D.growth));
  // A planted clue: one Lattice answer reads as a real landing whatever the truth.
  const deceive = r() < D.deception ? pick(["who", "when"]) : null;

  // Incidents: one a month at most, never the same one twice, from those that fit the month.
  const months = D.incidents >= 2 ? ["dec", "jan"] : [pick(["dec", "jan"])];
  const incidents = { dec: null, jan: null };
  const used = new Set();
  for (const m of months) {
    const pool = INCIDENTS.filter((x) => x.months.includes(m) && !used.has(x.id));
    const inc = pick(pool);
    used.add(inc.id);
    incidents[m] = inc.id;
  }

  return {
    seed: String(seed), difficulty: difficulty in DIFFICULTY ? difficulty : "shifting", D,
    plan, sailDay: range(D.sailDays), craft: { dec: craftDec, jan: craftJan },
    fleetRole: FLEET_ROLE[plan], deceive,
    support0: range(D.support), minister: pick(D.ministers), voteDay: range(D.voteDays),
    hotline: r() < D.hotline, drift: { dec: swing(D.drift), jan: swing(D.drift) },
    fatigue0: range(D.fatigue), incidents,
    // A coin per incident, rolled now so outcomes never depend on when you look.
    luck: { radar: r(), defector: r(), collision: r() },
  };
}

// A short code the player can read out to replay a campaign.
export const newSeed = () => Math.random().toString(36).slice(2, 7).toUpperCase();
