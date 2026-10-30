// A war: one task force through two sectors against one rival (ROADMAP, phase 2). The task
// force is the staff, the reserve battalion and the intercept network; they keep their
// names and their condition from sector to sector. Each sector is a new strait and a new
// ally, generated from the war's code. Prototype rules awaiting sign-off.
import { generateWorld } from "../gen/factions.js";
import { FLEET_ROLE, makeCampaign } from "./campaign.js";
import { outcome } from "./play.js";

export const SECTORS = 2;

// Every result pays a minimum refit; a better result pays a bonus on top. A failure costs
// nothing extra: the damage the task force carries is penalty enough.
export const REFIT = { failure: 3, costly: 4, success: 5 };

// What refit money buys before the next sector. Costs in the same units as REFIT.
export const SPEND = [
  { id: "rest", cost: 2, name: "Rest the battalion", says: "Two weeks ashore between sectors: its fatigue goes back to zero." },
  { id: "replace", cost: 2, name: "Replace casualties", says: "Drafts from home bring the battalion back to full strength." },
  { id: "order", cost: 2, name: "An extra personal order in the first month", says: "Three personal orders instead of two in the first month of the next sector." },
  { id: "count", cost: 1, name: "Lattice in place early", says: "The posts are listening before you arrive: the first briefing already has a count of the landing craft." },
];

// Below this many soldiers the battalion is under strength: it can't hold a second wave.
export const FULL_STRENGTH = 600, UNDER_STRENGTH = 500;

export function newWar(code, difficulty) {
  return { code: String(code), difficulty, sector: 1, funding: 0, results: [], carry: null, spent: [] };
}

// Each sector has its own code, so each gets its own sea, ally and campaign.
export const sectorCode = (war, n = war.sector) => `${war.code}-${n}`;

// The sector's world. Sector 1 rolls everything; later sectors keep the rival and the task
// force's own names (its network and reserve).
export function worldForSector(war, n = war.sector) {
  if (n === 1) return generateWorld(sectorCode(war, 1));
  return generateWorld(sectorCode(war, n), war.keep);
}

// The campaign for the current sector, with what the task force carries applied: the
// battalion's days and strength, what the rival lost last time, and anything the refit bought.
export function campaignFor(war) {
  const c = makeCampaign(sectorCode(war), war.difficulty);
  const k = war.carry;
  if (!k) return c;
  vary(c, war.results.at(-1));
  const bought = new Set(war.spent);
  c.fatigue0 = bought.has("rest") ? 0 : k.fatigue;
  c.strength = bought.has("replace") ? FULL_STRENGTH : k.strength;
  c.understrength = c.strength < UNDER_STRENGTH;
  // A landing force beaten on a beach is gone: the rival starts this sector with fewer craft.
  const lost = Math.min(3, Math.floor(k.rivalLost / 4));
  c.craft = { dec: Math.max(6, c.craft.dec - lost), jan: Math.max(6, c.craft.jan - lost) };
  c.seals = { dec: bought.has("order") ? 3 : 2, jan: 2 };
  c.knownCount = bought.has("count");
  c.memories = k.memories;
  c.war = { sector: war.sector, of: SECTORS };
  return c;
}

// A later sector poses a different problem from the one before: a different enemy plan, a
// different size of landing force, and a different ally (another defence minister, and a
// hotline if the last had none, or none if it had one).
function vary(c, last) {
  if (!last) return;
  if (c.plan === last.plan) {
    const others = c.D.plans.filter((p) => p !== last.plan);
    c.plan = others[Math.floor(c.luck.radar * others.length)];
    c.fleetRole = FLEET_ROLE[c.plan];
  }
  const growth = c.plan === "bluff" ? 0 : last.big ? 1 : 4; // two waves if the last had one
  c.craft = { dec: c.craft.dec, jan: c.craft.dec + growth };
  const ministers = c.D.ministers.filter((m) => m !== last.minister);
  if (ministers.length) c.minister = ministers[Math.floor(c.luck.defector * ministers.length)];
  c.hotline = !last.hotline;
}

// After a sector's debrief: record the result, pay the refit, and carry the task force's
// condition and its officers' memories into the next sector.
export function closeSector(war, c, run, memories, world) {
  const o = outcome(c, run);
  const strength = Math.max(0, (c.strength ?? FULL_STRENGTH) - o.losses.battalion);
  war.results.push({ sector: war.sector, strait: world.strait, host: world.host, grade: o.grade, code: o.code, days: o.daysAfter, casualties: o.casualties, rivalLost: o.rivalLost,
    plan: c.plan, big: c.craft.jan >= 12, minister: c.minister, hotline: c.hotline });
  war.funding += REFIT[o.grade];
  war.carry = { fatigue: o.daysAfter, strength, rivalLost: o.rivalLost, memories };
  war.keep = { rival: world.rival, network: world.network, reserve: world.reserve };
  war.spent = [];
  return war;
}

// Spend refit money; returns false if the war can't afford it.
export function toggleSpend(war, id) {
  const item = SPEND.find((x) => x.id === id);
  if (war.spent.includes(id)) { war.spent = war.spent.filter((x) => x !== id); war.funding += item.cost; return true; }
  if (war.funding < item.cost) return false;
  war.spent.push(id); war.funding -= item.cost;
  return true;
}

export function nextSector(war) {
  war.sector += 1;
  return war;
}
