// The story's entry point. The campaign itself is generated (src/story/campaign.js) and
// worded (src/story/copy.js) against the placeholders in src/story/world.js; this file
// gathers what the scenes need and defines the glossary every highlighted word opens.
import { WORLD as W, onWorld } from "./story/world.js";
export { OFFICERS, fullName, plainName, surname } from "./story/officers.js";
export { CALENDAR, monthOf, TITLE, ORIENT, LATTICE, latticeQ, brief, orders, host, incident, night, february, debrief, split, status } from "./story/copy.js";
export { makeCampaign, newSeed, DIFFICULTY } from "./story/campaign.js";
export { simulate, needsApproval } from "./story/play.js";

let B, R, M, MA, S, L, BN;

// The campaign a chapter jump starts from, and the choices assumed up to that point.
export const DEFAULT_CAMPAIGN = { seed: "KESTREL", difficulty: "shifting" };
export const DEFAULT_RUN = () => ({
  dec: { beacon: "rest", lattice: "who", incident: null },
  jan: { beacon: "show", way: "buy", incident: null },
  feb: { route: "joint" },
});

// Every highlighted name or term opens one of these on hover or focus. `match` lists the
// exact words that link to it; `kind` sets the style (a proper noun, or jargon).
export let GLOSSARY;

// Where the debrief's truth lines sit on the chart; the words come from debrief().truth.
export const TRUTH = [{ near: "harbour", dx: -160, dy: -55 }, { near: "beacon", dx: 450, dy: 80 }];

// Recomputed whenever the theatre changes (see setWorld in src/story/world.js).
onWorld(() => {
  B = W.stationShort; R = W.rival; M = W.host; MA = W.hostAdj; S = W.harbour; L = W.network; BN = W.reserve;
  GLOSSARY = {
    beacon: { title: W.station, kind: "name", tag: "Our post", match: [W.station, B],
      body: `Our radar and radio post on a headland on the ${MA} coast. From it we can watch ships in ${W.strait} up to 30 nautical miles away. Its own garrison is ${W.garrison} soldiers. Whoever holds ${B} can watch the whole strait, which is why ${R} wants it.` },
    sarn: { title: S, kind: "name", tag: `${R}’s main naval harbour`, match: [S],
      body: `${R}’s main naval harbour, on the far side of ${W.strait}, about ${W.harbourNm} nautical miles from ${B}. ${R}’s warships and landing craft are based here. If ${R} attacks ${B} from the sea, the attack will sail from ${S}.` },
    lattice: { title: L, kind: "name", tag: "Our radio-intercept network", match: [L],
      body: `Twelve listening posts along the ${MA} coast, built since September and run by Major General Halden’s intelligence staff. They pick up ${R}’s military radio. Each month you point ${L} at one question. While it is listening to ${S}, it gives us our warning before an attack.` },
    marenna: { title: M, kind: "name", tag: "Our ally and host country", match: [MA, M],
      body: `The country ${W.station} stands in. We are there with the permission of ${M}’s government, and we promised to ask before any move ${R} could see. The ${MA} cabinet, its ${W.ministers} senior ministers, votes in January on whether to keep backing us. ${M} has a small navy of two corvettes.` },
    ravellan: { title: R, kind: "name", tag: "The other side", match: [R],
      body: `The country across ${W.strait}. ${R} claims the waters around ${B} and has been building up its forces in ${S} since September. It has not fired a shot.` },
    kestrel: { title: W.strait, kind: "name", tag: "The sea between", match: [W.strait],
      body: `The stretch of sea between ${M} and ${R}, about ${W.straitNm} nautical miles wide. A busy shipping lane runs through the middle of it.` },
    battalion: { title: BN, kind: "name", tag: "Our reserve", match: [BN],
      body: `Our reserve infantry battalion, about ${W.battalion} soldiers, based a day’s move from ${B}. It reinforces ${B} when needed. It has been on duty without rest since the autumn. Rear Admiral Okafor’s rule of thumb: past 100 days, a third of a unit is lost to sickness and mistakes.` },
    craft: { title: "Landing craft", kind: "term", tag: "Ships", match: ["landing craft"],
      body: "Flat-bottomed boats built to carry soldiers and vehicles from the sea straight onto a beach. Nine of them can put one battalion, about 600 soldiers, ashore at once. A country loads them when it is preparing an amphibious landing, or wants others to think it is." },
    landing: { title: "Amphibious landing", kind: "term", tag: "An attack from the sea", match: ["amphibious landing", "landing"],
      body: `Putting soldiers ashore from ships to seize ground. Here, it would mean ${R} landing a battalion on the ${B} headland to take the station. The other possibility is that ${R} only wants us and ${M} to believe a landing is coming, to frighten ${M} into asking us to leave.` },
    warning: { title: "Warning before an attack", kind: "term", tag: "How much notice we would get", match: ["Warning before an attack", "warning before an attack"],
      body: `Before a landing, ${R} has to order its troops aboard the landing craft in ${S}. ${L} hears that order about two days before they sail. Two days is enough to bring ${BN} to ${B}. If ${L} stops listening to ${S}, we can miss that order and get hours of notice instead of days.` },
    frigate: { title: "Frigate", kind: "term", tag: "Ship", match: ["frigate"],
      body: `Our largest warship in ${W.strait}. ${R} can see it from the shore, so using it in daylight is a deliberate signal.` },
    corvette: { title: "Corvettes", kind: "term", tag: "Ships", match: ["corvettes", "corvette"],
      body: `Small warships. ${M}’s navy has two. ${R} has its own patrolling the strait.` },
    battery: { title: "Air-defence battery", kind: "term", tag: "Unit", match: ["air-defence battery"],
      body: `Anti-aircraft guns and their crews, about ${W.battery} soldiers. On ${B} they protect the radar and garrison from air attack, and add radar of their own.` },
    hotline: { title: "Hotline", kind: "term", tag: "Fast channel", match: ["hotline"],
      body: `A direct line to ${M}’s ministers, so they can approve our moves within hours. Some campaigns start with one; without it, every request goes through normal channels and takes about a week.` },
    order: { title: "Personal order", kind: "term", tag: "Your intervention", match: ["personal orders", "personal order"],
      body: "Your staff handle every order unless you step in. Each time you change their plan, you spend one personal order. You have two a month, and changing back returns it. Some incidents also cost one." },
  };
});
