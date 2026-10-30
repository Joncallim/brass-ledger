// A second, deliberately small scenario: proof that the campaign interfaces (a definition,
// a resolver, a battle plan the table can play, geography read from the chart) fit something
// other than holding a station. It is NOT a campaign: one decision, no months, no words beyond
// labels, invented numbers, no sign-off. It exists so tests can show that a different
// objective, and geography, can drive a decision through the same interfaces.
//
// The situation: the rival will sail for our post; we have warning, and we are getting the
// garrison and its guns out by sea to our anchorage. How far the rival's harbour and our
// anchorage are from the post (read from the chart) decides what can be done in time.
import { checkPlan } from "./battle.js";

export const WITHDRAWAL = Object.freeze({
  id: "withdrawal-sketch", title: "Bring the garrison out (sketch)",
  roles: { station: "the post we are leaving", rival: "the country across the water", harbour: "where the rival sails from", home: "our anchorage" },
  objectives: [
    { id: "garrison", keep: "every soldier off the headland" },
    { id: "guns", keep: "the guns brought out too" },
    { id: "frigate", keep: "the frigate unharmed" },
  ],
  phases: [{ id: "decide", kind: "decide" }],
  slots: { decide: { lift: ["two", "one"], cover: ["none", "frigate"] } },
  // Invented: sketch numbers, not tuned and not for sign-off.
  fixed: { warningHours: 6, rivalKnots: 12, transportKnots: 15, loadHours: 2, coverHours: 2 },
});

// Geography, from the chart: distances in nautical miles (the scale bar gives pixels per mile).
export function geographyOf(sc) {
  const scale = sc.features.find((f) => f.type === "scale"), ppn = scale ? scale.length / 10 : 20;
  const post = sc.places[sc.station.place], harbour = sc.places[sc.base.place];
  const anc = sc.features.find((f) => f.type === "anchorage")?.at ?? [post.x - 80, post.y + 340];
  return {
    harbourNm: Math.round(Math.hypot(post.x - harbour.x, post.y - harbour.y) / ppn),
    homeNm: Math.round(Math.hypot(post.x - anc[0], post.y - anc[1]) / ppn),
  };
}

// The resolver: when the rival arrives, and whether the lifts are done by then.
export function resolveWithdrawal(geo, choice) {
  const F = WITHDRAWAL.fixed;
  const covered = choice.cover === "frigate";
  const unopposed = F.warningHours + geo.harbourNm / F.rivalKnots;
  // The frigate buys time only by fighting: it stands between them and the beach, and is hit.
  const arrives = unopposed + (covered ? F.coverHours : 0);
  const lift = (2 * geo.homeNm) / F.transportKnots + F.loadHours;
  const lifts = choice.lift === "two" ? 2 : 1;
  const done = lifts * lift;
  const caught = done > arrives;
  const kept = {
    garrison: lift <= arrives, // the soldiers go on the first lift
    guns: lifts === 2 && !caught,
    frigate: !(covered && done > unopposed),
  };
  const grade = !kept.garrison ? "failure" : kept.guns && kept.frigate ? "success" : "costly";
  return { arrives, done, caught, lifts, kept, grade, code: !kept.garrison ? "lost" : caught ? "caught" : lifts === 2 ? "all-out" : "men-out" };
}

// How much each kept objective is worth, for "best": soldiers first, then the guns, then the
// frigate. Invented for the sketch.
const VALUE = { garrison: 4, guns: 2, frigate: 1 };
export const CHOICES = WITHDRAWAL.slots.decide.lift.flatMap((lift) => WITHDRAWAL.slots.decide.cover.map((cover) => ({ lift, cover })));
const score = (r) => Object.entries(r.kept).reduce((n, [k, v]) => n + (v ? VALUE[k] : 0), 0);
// The best choices on a chart: the decision the geography asks for.
export function bestChoices(geo) {
  const scored = CHOICES.map((c) => ({ c, r: resolveWithdrawal(geo, c) }));
  const top = Math.max(...scored.map((x) => score(x.r)));
  return scored.filter((x) => score(x.r) === top).map((x) => `${x.c.lift}/${x.c.cover}`);
}

// The battle plan, on the same anchors and actors as any other: transports run between our
// anchorage and the beach, the garrison walks down and embarks, the rival comes on.
export function withdrawalPlan(geo, choice, labels = {}) {
  const r = resolveWithdrawal(geo, choice);
  const lift = (n) => ({ moves: [{ actor: "transports", path: ["friendStart", "beach"], dur: 1400 }, { actor: "transports", path: ["beach", "friendStart"], dur: 1400, delay: 1500 }],
    effects: n === 1 ? [{ kind: "hide", actor: "garrison", delay: 1400 }] : [], labels: [], dur: 3000 });
  const plan = {
    actors: [
      { id: "garrison", kind: "unit", label: labels.garrison ?? "Garrison", at: "station" },
      { id: "transports", kind: "transport", count: 2, at: "friendStart", hidden: true },
      { id: "rival", kind: "escort", count: 4, at: "harbour", hidden: true },
      ...(choice.cover === "frigate" ? [{ id: "cover", kind: "friend", count: 1, at: "friendStart", hidden: true }] : []),
    ],
    steps: [
      { show: ["transports", "rival", ...(choice.cover === "frigate" ? ["cover"] : [])],
        moves: [{ actor: "garrison", path: ["station", "beach"], dur: 1200 }, { actor: "rival", path: ["harbour", "laneOut", "laneMid"], dur: 2400 },
          ...(choice.cover === "frigate" ? [{ actor: "cover", path: ["friendStart", "line"], dur: 1800, facing: "north" }] : [])],
        labels: [{ at: "harbour", text: `${geo.harbourNm} nm away: here in ${r.arrives.toFixed(1)} hours`, tone: "warn" }], dur: 2600 },
      lift(1),
      ...(r.lifts === 2 ? [lift(2)] : []),
      { moves: [{ actor: "rival", path: ["laneMid", "approach"], dur: 1800 }],
        effects: r.caught ? [{ kind: "flash", at: "beach", count: 6, delay: 1200 }] : [],
        labels: [{ at: "contact", text: r.caught ? "Caught on the last lift" : r.lifts === 2 ? "All out, guns too" : "Soldiers out; the guns left behind", tone: r.caught ? "bad" : r.lifts === 2 ? "ok" : "warn" }], dur: 2400 },
    ],
  };
  const problems = checkPlan(plan);
  if (problems.length) throw new Error(`withdrawal plan: ${problems.join("; ")}`);
  return { plan, result: r };
}
