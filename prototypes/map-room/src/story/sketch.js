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
  situation: { warningHours: [2, 6] },
  // The causal boundary, a sketch rule (review 8; flagged in README, not signed off): a lift
  // escapes when it has loaded and cleared the beach before the rival reaches the post. The
  // rival makes for the post, not the transports, so a lift that has cleared is not
  // intercepted at sea. A lift still loading when they arrive is caught on the beach; one
  // still on its way in turns back.
  escape: "clears the beach",
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

// The resolver: a timeline for each lift (in hours from the warning), and what the rival's
// arrival at the post catches. Lift k leaves the anchorage, reaches the beach, loads, clears
// the beach and arrives back; the next lift leaves when it is back.
export function resolveWithdrawal(ctx, choice) {
  const F = WITHDRAWAL.fixed, { geo } = ctx;
  const covered = choice.cover === "frigate";
  const unopposed = ctx.warningHours + geo.harbourNm / F.rivalKnots;
  // The frigate buys time only by fighting: it stands between them and the beach, and is hit.
  const arrives = unopposed + (covered ? F.coverHours : 0);
  const transit = geo.homeNm / F.transportKnots;
  const lifts = choice.lift === "two" ? 2 : 1;
  const timeline = [];
  let t = 0, done = 0, caught = null;
  for (let k = 1; k <= lifts; k++) {
    const atBeach = t + transit, loaded = atBeach + F.loadHours, home = loaded + transit;
    const fate = loaded <= arrives ? "cleared" : atBeach <= arrives ? "caught" : "turned back";
    timeline.push({ lift: k, leaves: t, atBeach, loaded, clears: fate === "cleared" ? loaded : null, home: fate === "cleared" ? home : null, fate });
    if (fate !== "cleared") { caught = fate; break; }
    done = k; t = home;
  }
  // The frigate fights if, without it, they would have reached the post before the last lift cleared.
  const lastNeeded = timeline.at(-1).loaded;
  const kept = { garrison: done >= 1, guns: lifts === 2 && done === 2, frigate: !(covered && lastNeeded > unopposed) };
  const grade = !kept.garrison ? "failure" : kept.guns && kept.frigate ? "success" : "costly";
  return { arrives, unopposed, transit, lifts, done, caught: done < lifts, interruption: caught, timeline, kept, grade,
    code: !kept.garrison ? "lost" : done < lifts ? "caught" : lifts === 2 ? "all-out" : "men-out" };
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
  const liftStep = (L) => ({
    // Out to the beach unless they turned back before getting there; back to the anchorage if the lift cleared.
    moves: L.fate === "turned back" ? [] : [{ actor: "transports", path: ["anchorage", "beach"], dur: 1400 }, ...(L.fate === "cleared" ? [{ actor: "transports", path: ["beach", "anchorage"], dur: 1400, delay: 1500 }] : [])],
    // The soldiers are aboard the first lift only once it has loaded and cleared the beach.
    effects: L.lift === 1 && L.fate === "cleared" ? [{ kind: "hide", actor: "garrison", delay: 1400 }] : [],
    labels: L.fate === "turned back" ? [{ at: "contact", text: `Lift ${L.lift} turned back: they reached the post first`, tone: "warn" }] : [], dur: 3000,
  });
  const caughtOnBeach = r.interruption === "caught";
  const steps = [
    { show: ["transports", "rival", ...(choice.cover === "frigate" ? ["cover"] : [])],
      moves: [{ actor: "garrison", path: ["station", "beach"], dur: 1200 }, { actor: "rival", path: ["harbour", "laneOut", "laneMid"], dur: 2400 },
        ...(choice.cover === "frigate" ? [{ actor: "cover", path: ["friendStart", "line"], dur: 1800, facing: "north" }] : [])],
      labels: [{ at: "harbour", text: `${ctx.geo.harbourNm} nm away: at the post in ${r.arrives.toFixed(1)} hours`, tone: "warn" }], dur: 2600 },
    // The frigate fights only if they would otherwise have reached the post while the last lift
    // was still loading: it stands in their way and is hit, while that lift loads.
    ...r.timeline.flatMap((L, i) => (!r.kept.frigate && i === r.timeline.length - 1
      ? [{ effects: [{ kind: "flash", at: "line", count: 5 }], labels: [{ at: "contact", text: `The frigate holds them off for ${WITHDRAWAL.fixed.coverHours} hours, and is hit`, tone: "bad" }], dur: 2200 }, liftStep(L)]
      : [liftStep(L)])),
    { moves: [{ actor: "rival", path: ["laneMid", "approach"], dur: 1800 }],
      effects: caughtOnBeach ? [{ kind: "flash", at: "beach", count: 6, delay: 1200 }] : [],
      labels: [{ at: "contact", text: !r.kept.garrison ? (caughtOnBeach ? "Caught on the beach while loading: the garrison is taken" : "No lift got away: the garrison is taken") : r.caught ? (caughtOnBeach ? "Caught loading the last lift: the guns are lost" : "The last lift turned back: the guns are left") : r.lifts === 2 ? "All out, guns too" : "Soldiers out; the guns left behind", tone: !r.kept.garrison ? "bad" : r.caught || r.lifts === 1 ? "warn" : "ok" }], dur: 2400 },
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
