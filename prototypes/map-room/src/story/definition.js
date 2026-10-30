// The station-defence campaign, as data: its roles, objectives, phases, calendar, the orders
// each phase offers, its incidents and the constants its rules use. The rules that resolve it
// live in play.js and read only from here; every word lives in copy.js. A different campaign
// is a different definition and its own resolver (see src/story/sketch.js for a small one).
//
// Two kinds of number. FIXED values are the structure of this campaign: change one and you
// have a different game, so they are not presented as settings. TUNING values are balance:
// `node scripts/balance.mjs` measures them and test/balance.test.js guards the targets. All
// of both are prototype values awaiting sign-off; packages/sim stays the authority.

// The roles a world fills with names (see world.js). Copy only ever speaks through these.
export const ROLES = {
  station: "the post we hold",
  host: "the country the post stands in, whose cabinet must back us",
  rival: "the country across the water",
  harbour: "the rival's harbour, where any landing sails from",
  network: "our radio-intercept network",
  reserve: "our reserve battalion",
};

// What the player is asked to keep. All three is a success; the station with one of the
// others lost is a costly success; losing the station is a failure.
export const OBJECTIVES = [
  { id: "station", role: "station", keep: "still ours after February" },
  { id: "ally", role: "host", keep: "a majority of the host cabinet for us" },
  { id: "reserve", role: "reserve", keep: "fit (fatigue at or under the unfit line)" },
];

// Two preparation months, then the decision. Each preparation month runs briefing, an
// incident if one lands, orders, then the month's log.
export const PHASES = [
  { id: "dec", kind: "prepare", month: "December" },
  { id: "jan", kind: "prepare", month: "January" },
  { id: "feb", kind: "decide", month: "February" },
];

// The order slots each phase offers, and their legal values. The first value is the staff
// plan. `way` is January's dealing with the host, and only some combinations are legal (see
// legalRun).
export const SLOTS = {
  dec: { beacon: ["quiet", "rest", "show"], lattice: ["boats", "who", "when"] },
  jan: { beacon: ["quiet", "show", "hold"], lattice: ["sarn", "when", "who"], way: [null, "buy", "act"] },
  feb: { route: ["quiet", "forward", "joint"] },
};

// When everything happens. Incidents land before the month's orders go out; everything an
// order causes happens after them, so the record is causally possible whatever you choose.
export const CALENDAR = Object.freeze({
  dec: {
    brief: 1, count: 1, orders: 10,
    // The staff plan's moves: companies go on the night of the 18th and are in place by the
    // 20th; the frigate exercises from the 19th; a rest runs from the day after the orders.
    quiet: 20, quietStart: 18, show: 19, rest: 11,
    reaction: 21, lattice: 27, rival: 30, drift: 31,
  },
  jan: {
    brief: 1, drift: 2, orders: 7,
    visit: 6, // the minister's visit itself; she asks on the visit incident's day
    date: 9, rotation: 10, hold: 10, hotline: 15, show: 16, acted: 17, quiet: 20,
    fishing: 24, radarFails: 28, rival: 30,
    tradeBy: 14, // a patrol-boat trade is settled by the 14th, or at the vote if sooner
  },
});

// Incidents: the rules part only (when, who, what each answer does). Their words are in
// incidents.js. `command` incidents come to the desk; the others are staff business.
// Effects take (state, campaign, severity) and must not read anything a later date decides.
const n = (x, k) => Math.round(x * k);
export const INCIDENT_RULES = [
  { id: "radar", command: false, months: ["dec", "jan"], day: { dec: 4, jan: 3 }, from: "briggs",
    options: [
      { id: "fix", staff: true, effect: (s) => { s.eng += TUNING.fatigue.engineers; s.notes.push("radar-fixed"); } },
      // Whether it fails is rolled now, but nobody knows until it does (CALENDAR.jan.radarFails).
      { id: "run", seal: true, effect: (s, c, k) => { if (c.luck.radar < (k > 1.3 ? 0.34 : 0.25)) s.radarWillFail = true; s.notes.push("radar-run"); } },
    ] },
  { id: "defector", command: false, months: ["dec", "jan"], day: { dec: 5, jan: 4 }, from: "halden",
    options: [
      { id: "talk", seal: true, effect: (s, c, k) => {
        const planted = c.D.deception > 0 && c.luck.defector < c.D.deception;
        s.knows.claim = { plan: planted ? (c.plan === "bluff" ? "land" : "bluff") : c.plan, planted };
        s.support -= n(4, k);
      } },
      { id: "hand", staff: true, effect: (s, c, k) => { s.support += n(6, k); } },
    ] },
  { id: "leak", command: true, months: ["dec", "jan"], day: { dec: 6, jan: 5 }, from: "sato",
    options: [
      { id: "silent", staff: true, effect: (s, c, k) => { s.support -= n(4, k); } },
      { id: "brief", seal: true, effect: (s, c, k) => { s.support += n(6, k); s.rivalKnows = true; } },
    ] },
  { id: "collision", command: true, months: ["dec", "jan"], day: { dec: 8, jan: 6 }, from: "briggs",
    options: [
      { id: "return", staff: true, effect: (s, c, k) => { s.support -= n(3, k); } },
      { id: "search", seal: true, effect: (s, c, k) => { s.knows.role = c.fleetRole; s.knows.roleSure = true; s.tension += 1; s.support -= n(c.minister === "dove" ? 8 : 4, k); } },
    ] },
  { id: "visit", command: true, months: ["jan"], day: { jan: 2 }, from: "sato",
    options: [
      // The staff answer is no cameras (review 7): exposing our positions is a choice you make.
      { id: "quiet", staff: true, effect: (s, c, k) => { s.support += n(c.minister === "dove" ? 8 : 3, k); } },
      // Cameras on the headland show the rival where our guns are, as a press briefing does.
      { id: "open", seal: true, effect: (s, c, k) => { s.support += n(c.minister === "dove" ? 4 : 8, k); s.rivalKnows = true; } },
    ] },
];
export const incidentRule = (id) => INCIDENT_RULES.find((x) => x.id === id);
export const incidentDay = (id, month) => incidentRule(id).day[month];
// The day an incident's answer takes effect: the visit happens a few days after she asks.
export const effectDay = (id, month) => (id === "visit" ? CALENDAR.jan.visit : incidentDay(id, month));

// The structure of the resolution. Changing these changes what the campaign is.
export const FIXED = Object.freeze({
  // Defence levels: 1 is the garrison alone; each reinforcement adds one; 4 is the most.
  defence: { start: 1, max: 4, holdsAlone: 3, holdsWithReserve: 2, dugInFit: 1, dugInUnfit: 2 },
  // Twelve or more landing craft carry a second wave. Fewer is one wave.
  secondWave: 12,
  // The cabinet: eleven ministers, six for is a majority.
  ministers: 11, majority: 6,
  // Each order moves the station one level; the battalion's month on duty is a fixed cost.
  monthOnDuty: 31,
  // Exposure (the rival knows where our guns are) and a failed radar each count one level
  // against a landing. Proposed in playtest 5; under review (RULES-REVIEW.md).
  exposure: 1, radarFailure: 1,
});

// Balance numbers: tune with scripts/balance.mjs, guarded by test/balance.test.js.
export const TUNING = Object.freeze({
  fatigue: { tired: 100, unfit: 120, battle: 20, dig: 20, joint: 30, dateRest: 20, engineers: 12 },
  cabinet: {
    navyNeeds: 50, hotlineNeeds: 55, bluffTurnsBelow: 40,
    showPenalty: { dove: 20, firm: 12, hawk: 6 }, // a daylight move made without the cabinet
    actPenalty: { dove: 25, firm: 15, hawk: 8 }, // acting first and telling the host after
    bluffPress: 3, bluffShowPress: 5,
    overreaction: 20, dugInForNothing: 10, lostStation: 10,
    navyInAFight: { dove: -12, firm: -6, hawk: 4 },
  },
  // Killed or wounded, by result: the station's garrison, and the battalion if it fought.
  losses: {
    garrison: { held: 40, repelled: 10, landed: 20, lost: 140 },
    battalion: { held: 60, repelled: 40, landed: 60, lost: 120 },
  },
  underStrength: 500,
});

// Whether a run is legal: a January daylight move that needs the host's approval must say how
// it gets it, and the joint stand needs the host's navy.
export function legalWay(beacon, way) {
  if (way === "act") return beacon === "show";
  return true;
}

export const STATION_DEFENCE = Object.freeze({
  id: "station-defence", title: "Hold the station", roles: ROLES, objectives: OBJECTIVES, phases: PHASES,
  slots: SLOTS, calendar: CALENDAR, incidents: INCIDENT_RULES, fixed: FIXED, tuning: TUNING,
});
