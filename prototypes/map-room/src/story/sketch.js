// A second, deliberately small scenario: proof that the campaign interfaces (a definition,
// a resolver, a battle plan the table can play, geography read from the chart) fit something
// other than holding a station. It is NOT a campaign: one decision, no months, no words beyond
// labels, invented numbers, no sign-off. It exists so tests can show that a different
// objective, and geography, can drive a decision and an outcome through the same interfaces.
//
// The situation: the rival will sail for our post; we have some hours' warning, and we are
// getting the garrison and its guns out by sea to our anchorage. How far the rival's harbour
// and our anchorage are from the post (read from the chart) decides what can be done in time.
import { anchorageOf, checkPlan } from "./battle.js";

export const WITHDRAWAL = Object.freeze({
  id: "withdrawal-sketch", title: "Bring the garrison out (sketch)",
  roles: { station: "the post we are leaving", rival: "the country across the water", harbour: "where the rival sails from", anchorage: "where our transports wait" },
  objectives: [
    { id: "garrison", keep: "every soldier off the headland" },
    { id: "guns", keep: "the guns brought out too" },
    { id: "frigate", keep: "the frigate unharmed" },
  ],
  phases: [{ id: "decide", kind: "decide" }],
  slots: { decide: { lift: ["two", "one"], cover: ["none", "frigate"] } },
  // Invented: sketch numbers, not tuned and not for sign-off.
  fixed: { rivalKnots: 12, transportKnots: 15, loadHours: 2, coverHours: 2 },
  // The situation varies like the main campaign's sailing date: how many hours' warning.
  situation: { warningHours: [3, 6] },
});

// Geography, from the chart: distances in nautical miles (the scale bar gives pixels per mile).
export function geographyOf(sc) {
  const scale = sc.features.find((f) => f.type === "scale"), ppn = scale ? scale.length / 10 : 20;
  const post = sc.places[sc.station.place], harbour = sc.places[sc.base.place], anc = anchorageOf(sc);
  return {
    harbourNm: Math.round(Math.hypot(post.x - harbour.x, post.y - harbour.y) / ppn),
    homeNm: Math.round(Math.hypot(post.x - anc.x, post.y - anc.y) / ppn),
  };
}

// The context every part reads: the chart (by id, with its geography) and the warning. The
// calculation, the plan and the table all take this one object.
export const sketchContext = (sc, warningHours = 6) => ({ scenario: sc.id, geo: geographyOf(sc), warningHours });

// The resolver: when the rival arrives, and which lifts are done by then.
export function resolveWithdrawal(ctx, choice) {
  const F = WITHDRAWAL.fixed, { geo } = ctx;
  const covered = choice.cover === "frigate";
  const unopposed = ctx.warningHours + geo.harbourNm / F.rivalKnots;
  // The frigate buys time only by fighting: it stands between them and the beach, and is hit.
  const arrives = unopposed + (covered ? F.coverHours : 0);
  const lift = (2 * geo.homeNm) / F.transportKnots + F.loadHours;
  const lifts = choice.lift === "two" ? 2 : 1;
  // How many lifts finish before they arrive. The soldiers go on the first; the guns on the second.
  const done = Math.min(lifts, Math.floor(arrives / lift));
  const caught = done < lifts;
  const kept = { garrison: done >= 1, guns: lifts === 2 && done === 2, frigate: !(covered && lifts * lift > unopposed) };
  const grade = !kept.garrison ? "failure" : kept.guns && kept.frigate ? "success" : "costly";
  return { arrives, lift, lifts, done, caught, kept, grade, code: !kept.garrison ? "lost" : caught ? "caught" : lifts === 2 ? "all-out" : "men-out" };
}

// How much each kept objective is worth, for "best": soldiers first, then the guns, then the
// frigate. Invented for the sketch.
const VALUE = { garrison: 4, guns: 2, frigate: 1 };
export const CHOICES = WITHDRAWAL.slots.decide.lift.flatMap((lift) => WITHDRAWAL.slots.decide.cover.map((cover) => ({ lift, cover })));
const score = (r) => Object.entries(r.kept).reduce((n, [k, v]) => n + (v ? VALUE[k] : 0), 0);
// The best choices in a context: the decision the geography asks for.
export function bestChoices(ctx) {
  const scored = CHOICES.map((c) => ({ c, r: resolveWithdrawal(ctx, c) }));
  const top = Math.max(...scored.map((x) => score(x.r)));
  return scored.filter((x) => score(x.r) === top).map((x) => `${x.c.lift}/${x.c.cover}`);
}

// The battle plan, on the same anchors and actors as any other, following the resolver's
// timeline: each lift that finishes in time runs anchorage → beach → anchorage; a lift that
// doesn't is caught on the beach, and whoever was waiting there stays there.
export function withdrawalPlan(ctx, choice, labels = {}) {
  const r = resolveWithdrawal(ctx, choice);
  const liftStep = (n) => {
    const made = n <= r.done;
    return {
      moves: [{ actor: "transports", path: ["anchorage", "beach"], dur: 1400 }, ...(made ? [{ actor: "transports", path: ["beach", "anchorage"], dur: 1400, delay: 1500 }] : [])],
      // The soldiers board the first lift only if it gets away.
      effects: n === 1 && made ? [{ kind: "hide", actor: "garrison", delay: 1400 }] : [],
      labels: [], dur: 3000,
    };
  };
  const steps = [
    { show: ["transports", "rival", ...(choice.cover === "frigate" ? ["cover"] : [])],
      moves: [{ actor: "garrison", path: ["station", "beach"], dur: 1200 }, { actor: "rival", path: ["harbour", "laneOut", "laneMid"], dur: 2400 },
        ...(choice.cover === "frigate" ? [{ actor: "cover", path: ["friendStart", "line"], dur: 1800, facing: "north" }] : [])],
      labels: [{ at: "harbour", text: `${ctx.geo.harbourNm} nm away: here in ${r.arrives.toFixed(1)} hours`, tone: "warn" }], dur: 2600 },
    ...Array.from({ length: Math.min(r.lifts, r.done + 1) }, (_, i) => liftStep(i + 1)),
    { moves: [{ actor: "rival", path: ["laneMid", "approach"], dur: 1800 }],
      effects: r.caught ? [{ kind: "flash", at: "beach", count: 6, delay: 1200 }] : [],
      labels: [{ at: "contact", text: !r.kept.garrison ? "Caught on the beach: the garrison is taken" : r.caught ? "Caught on the last lift: the guns are lost" : r.lifts === 2 ? "All out, guns too" : "Soldiers out; the guns left behind", tone: !r.kept.garrison ? "bad" : r.caught || r.lifts === 1 ? "warn" : "ok" }], dur: 2400 },
  ];
  const plan = {
    context: ctx,
    actors: [
      { id: "garrison", kind: "unit", label: labels.garrison ?? "Garrison", at: "station" },
      { id: "transports", kind: "transport", count: 2, at: "anchorage", hidden: true },
      { id: "rival", kind: "escort", count: 4, at: "harbour", hidden: true },
      ...(choice.cover === "frigate" ? [{ id: "cover", kind: "friend", count: 1, at: "friendStart", hidden: true }] : []),
    ],
    steps,
  };
  const problems = checkPlan(plan);
  if (problems.length) throw new Error(`withdrawal plan: ${problems.join("; ")}`);
  return { plan, result: r };
}
