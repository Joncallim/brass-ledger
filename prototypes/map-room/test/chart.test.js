// Chart module checks: every scenario must be sound against its own geometry, and every
// mark it lists must have a painter. Run with `npm test`.
import test from "node:test";
import assert from "node:assert/strict";
import { buildGeometry, validateScenario } from "../src/chart/geometry.js";
import { FEATURES } from "../src/chart/paint.js";
import { SCENARIOS, STORY_SCENARIO } from "../src/scenarios/index.js";

// The fixture story pins its slips, camera and live objects to these places.
const STORY_PLACES = ["beacon", "harbour", "lane"];

for (const sc of Object.values(SCENARIOS)) {
  test(`${sc.id}: scenario is sound`, () => {
    assert.deepEqual(validateScenario(sc, buildGeometry(sc)), []);
  });

  test(`${sc.id}: every feature type has a painter`, () => {
    for (const f of sc.features) assert.ok(FEATURES[f.type], `no painter for "${f.type}"`);
  });

  test(`${sc.id}: soundings and wave marks fall in open water`, () => {
    const geo = buildGeometry(sc);
    const pts = [...geo.waterPoints(sc.soundings ?? 64, `${sc.id}-soundings`, 30, 40, 44), ...geo.waterPoints(sc.waves ?? 140, `${sc.id}-waves`, 170, 24)];
    assert.ok(pts.length > 20, "too few water points; is the sea too small?");
    for (const p of pts) assert.equal(geo.isLand(p.x, p.y), false);
  });

  test(`${sc.id}: provides the places the story uses`, () => {
    for (const k of STORY_PLACES) assert.ok(sc.places[k], `missing place "${k}"`);
  });
}

test("geometry is deterministic", () => {
  const a = buildGeometry(SCENARIOS[STORY_SCENARIO]).waterPoints(10, "x");
  const b = buildGeometry(SCENARIOS[STORY_SCENARIO]).waterPoints(10, "x");
  assert.deepEqual(a, b);
});

test("validator catches a misplaced place", () => {
  const sc = SCENARIOS[STORY_SCENARIO];
  const broken = { ...sc, places: { ...sc.places, harbour: { x: 1700, y: 500, on: "water" } } };
  assert.match(validateScenario(broken).join("\n"), /harbour" should be in water/);
});

test("every chart term links to a story profile", async () => {
  const GLOSSARY = (await import("../src/fixture.js")).glossaryFor();
  const sc = SCENARIOS[STORY_SCENARIO];
  const terms = [...(sc.labels ?? []), ...sc.land, ...sc.features, sc.station].map((x) => x?.term).filter(Boolean);
  assert.ok(terms.length >= 5);
  for (const t of terms) assert.ok(GLOSSARY[t], `no profile for "${t}"`);
});
