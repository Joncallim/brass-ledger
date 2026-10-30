// A battle as data: who is on the chart, where each moves (along named anchors), what happens
// where (effects) and what the labels say, in steps the report reads in step with. The table
// (TableScene.playPlan) plays any plan on any chart: it knows anchors, actors and effects, and
// nothing about how a campaign is won or lost. Each campaign has its own builder; this file
// holds the station-defence one and the plan's checker.
//
// Anchors every chart provides (resolved by the table from the scenario's geometry):
//   harbour, laneOut, laneMid, approach  the rival's way across
//   station, beach, flank                our post, the beach below it, a beach to one side
//   reserve, dug                         where our reserve waits, and the trench line
//   friendStart, line                    where allied ships start, and their blocking line
//   home                                 our side's rear (used by withdrawals)
export const ANCHORS = ["harbour", "laneOut", "laneMid", "approach", "station", "beach", "flank", "reserve", "dug", "friendStart", "line", "home", "anchorage"];

// Our anchorage on a chart, in sheet units: the scenario's anchorage mark, or a point off our
// coast below the station if the chart has none. The table's "anchorage" anchor and every
// calculation that measures distance to it use this one function.
export function anchorageOf(sc) {
  const post = sc.places[sc.station.place], a = sc.features.find((f) => f.type === "anchorage")?.at;
  return a ? { x: a[0], y: a[1] } : { x: post.x - 80, y: post.y + 340 };
}
export const ACTOR_KINDS = ["escort", "craft", "friend", "unit", "transport"];
export const EFFECTS = ["flash", "trench", "flag", "fade", "show", "hide"];
export const LABEL_PLACES = ["harbour", "station", "contact", "unit"];

// Checks a plan's shape, so a builder that names an anchor or effect the table doesn't know
// fails in a test rather than on screen.
export function checkPlan(plan) {
  const problems = [], ids = new Set(plan.actors.map((a) => a.id));
  for (const a of plan.actors) {
    if (!ACTOR_KINDS.includes(a.kind)) problems.push(`actor ${a.id}: unknown kind ${a.kind}`);
    if (!ANCHORS.includes(a.at)) problems.push(`actor ${a.id}: unknown anchor ${a.at}`);
  }
  plan.steps.forEach((st, i) => {
    for (const m of st.moves ?? []) {
      if (!ids.has(m.actor)) problems.push(`step ${i}: move of unknown actor ${m.actor}`);
      for (const p of m.path) if (!ANCHORS.includes(p)) problems.push(`step ${i}: unknown anchor ${p}`);
    }
    for (const e of st.effects ?? []) {
      if (!EFFECTS.includes(e.kind)) problems.push(`step ${i}: unknown effect ${e.kind}`);
      if (e.at && !ANCHORS.includes(e.at)) problems.push(`step ${i}: unknown anchor ${e.at}`);
      if (e.actor && !ids.has(e.actor)) problems.push(`step ${i}: effect on unknown actor ${e.actor}`);
    }
    for (const l of st.labels ?? []) if (!LABEL_PLACES.includes(l.at)) problems.push(`step ${i}: unknown label place ${l.at}`);
  });
  return problems;
}

// Where each actor is, and whether it shows, after step i: the end state a skip, a jump or
// reduced motion leaves. The table uses this, and the tests check it against the report.
export function stateAfter(plan, i) {
  const st = Object.fromEntries(plan.actors.map((a) => [a.id, { at: a.at, visible: !a.hidden }]));
  const fx = [];
  for (let k = 0; k <= i && k < plan.steps.length; k++) {
    const step = plan.steps[k];
    for (const id of step.show ?? []) st[id].visible = true;
    for (const m of step.moves ?? []) { st[m.actor].at = m.path.at(-1); st[m.actor].visible = true; }
    for (const e of step.effects ?? []) {
      if (e.kind === "fade" || e.kind === "hide") st[e.actor].visible = false;
      else if (e.kind === "show") st[e.actor].visible = true;
      else fx.push({ kind: e.kind, at: e.at });
    }
  }
  return { actors: st, effects: fx };
}

const ROUTE = ["harbour", "laneOut", "laneMid", "approach"];
const HOME = ["approach", "laneMid", "laneOut", "harbour"];

// The station-defence showdown: they sail, we move, contact, how it ended, the cost. `o` is
// the outcome from play.js; `words` carries every label (copy.js writes them).
export function stationDefencePlan(o, words) {
  // A wave that slipped past the navies comes ashore on the flank.
  const landed = o.battle, at = o.route === "joint" ? "flank" : "beach";
  const actors = [
    { id: "escorts", kind: "escort", count: 4, at: "harbour", hidden: true },
    { id: "craft", kind: "craft", count: Math.min(8, words.craft), at: "harbour", hidden: true },
    ...(o.route === "joint" ? [{ id: "friends", kind: "friend", count: 3, at: "friendStart", hidden: true }] : []),
    { id: "unit", kind: "unit", label: words.unitName, at: "reserve", hidden: true },
  ];
  const lab = (n) => words.callouts.filter((x) => x[0] === n).map(([, place, text, tone]) => ({ at: place, text, tone }));
  const steps = [
    { // 1 · they sail
      show: ["escorts", "craft"],
      moves: [{ actor: "escorts", path: ROUTE, dur: 2600 }, { actor: "craft", path: ROUTE, dur: 2600, delay: 250, offset: { x: -10 } }],
      labels: lab(0), dur: 2900,
    },
    { // 2 · we move
      show: ["unit", ...(o.route === "joint" ? ["friends"] : [])],
      moves: [
        ...(o.route === "joint" ? [{ actor: "friends", path: ["friendStart", "line"], dur: 2000, facing: "north" }] : []),
        ...(o.route === "forward" ? [{ actor: "unit", path: ["reserve", "dug"], dur: 1600 }] : []),
      ],
      effects: o.route === "forward" ? [{ kind: "trench", at: "dug", delay: 1500 }] : [],
      labels: lab(1), dur: 2200,
    },
    { // 3 · contact
      moves: [
        ...(landed ? [{ actor: "craft", path: at === "flank" ? ["approach", "flank"] : ["approach", "beach"], dur: 1800 }] : []),
        // The battalion goes to the trench line: at once on warning, late without it.
        ...(landed && o.route !== "forward" ? [{ actor: "unit", path: ["reserve", "dug"], dur: 900, delay: o.warned ? 300 : 1900 }] : []),
      ],
      effects: [
        ...(o.code === "stopped" ? [{ kind: "flash", at: "line", count: 5 }] : []),
        ...(landed ? [{ kind: "flash", at: o.code === "repelled" ? "dug" : at, count: 8, delay: 1500 }] : []),
        ...(o.code === "lost" ? [{ kind: "flag", at: "station", delay: 2000 }] : []),
      ],
      labels: lab(2), dur: 2600,
    },
    { // 4 · how it ended
      moves: !landed
        ? [{ actor: "escorts", path: HOME, dur: 2600 }, { actor: "craft", path: HOME, dur: 2600, delay: 200, offset: { x: -10 } }]
        : o.code === "lost"
          ? [{ actor: "unit", path: ["dug", "reserve"], dur: 1400 }, { actor: "escorts", path: ["approach", "approach"], dur: 1400, offset: { x: -60 } }]
          : [{ actor: "escorts", path: HOME, dur: 2600 }],
      effects: landed && o.code !== "lost" ? [{ kind: "fade", actor: "craft", dur: 1400 }, { kind: "flash", at, count: 4 }] : [],
      labels: lab(3), dur: 2900,
    },
    { // 5 · the cost
      labels: [{ at: "unit", text: words.unitTag, tone: words.unitTone, above: true }, ...lab(4)], dur: 900,
    },
  ];
  // When our orders go out before they sail (a boarding report two days ahead), our move
  // plays first, as the report reads it.
  if (words.moveFirst) [steps[0], steps[1]] = [steps[1], steps[0]];
  return { actors, steps };
}
