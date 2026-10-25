# Map Room prototype (Phaser)

A playable look-and-feel prototype of the V2 command loop, presented as a map table: the
chart of Kestrel Strait is the board, orders are paper slips pinned where they apply,
officers brief you in person, and the brass seals are your two personal orders a month.

It is **isolated on purpose**. It is not an npm workspace, does not import `packages/sim`
or `packages/shared`, and plays one fixed route from `src/fixture.js`. Nothing here is a
rule: the sim's player-safe projection stays the authority for what may be shown or said.
AGENTS.md freezes graphics work until the V2 human gate; this prototype exists at the
product owner's request to explore presentation and should not be wired into `apps/web`
without that decision.

## Run

```bash
cd prototypes/map-room
npm install
npm run dev          # http://localhost:5173
npm test             # chart checks (Node, no browser)
```

`?chapter=dec-orders` opens a chapter directly. `?renderer=canvas` forces the 2D renderer
(handy without a GPU, e.g. headless capture). `?scenario=harrow-sound` draws another sea;
`?chapter=chart` (or key 0) shows any chart on its own with its validator result.

| Key | Does |
| --- | --- |
| Space / Enter / click on a speaker | Finish the running sequence, or continue |
| 1–9 | Jump to a chapter: title, December briefing, December orders, December night, January briefing, January orders, January night, February showdown, debrief |
| 0 | Chart preview for the current scenario |
| M | Toggle reduced motion (also follows `prefers-reduced-motion`) |

## The sequence

Each month runs **briefing → orders → night**, and everything after December follows
from what you ordered (`run` in `DeskScene`, built from `DEFAULT_RUN` when you jump in):

- The December night report narrates your Beacon order and the question Lattice asked.
- January's briefing answers that question.
- January's orders start from staff's plan. A clash with the host government appears
  only if you order an open show of force, and Send stays blocked until you settle it.
- The January night narrates how you settled it.
- February offers "Stand together openly" only if the host government's OK was waited
  for or bought; if you acted without them, the screen says why it is missing.
- The debrief's rows, title and Major General Halden's verdict follow your choices.

Seals are spent and returned by the slips themselves, never more than two a month.
"Change this order" flips a slip to its choices; "Done" folds it back to show the order.

## How it is built

- **Charts are data.** A scenario in `src/scenarios/` describes one sea: its sheet, land
  (coasts along any edge, or islands), chart marks, labels, named places, and where the
  live objects sit (station, enemy base, intel note, fleets). Nothing about a particular
  sea lives in code. `kestrel.js` is the story's sea; `harrow.js` is a deliberately
  different test sea (coasts north and south, lane east–west) that proves the point.
- `src/chart/` turns a scenario into a chart and has no Phaser in it:
  - `geometry.js` builds coastlines and land polygons, answers "is this land?" and "how
    far to the coast?", places seeded points in open water, and `validateScenario`
    checks the sea against itself (places on the right side of the coast, ships and reefs
    in water, the lane clear of land, posts on a real coast).
  - `paint.js` paints any scenario in a fixed layer order (sea tints, contours,
    water-lining, grid, land relief and sand, soundings, wave marks, marks, names, frame,
    age). Each kind of mark is one painter in `FEATURES` (lane, zone, lighthouse,
    anchorage, posts, reefs, woods, towns, rose, scale, cartouche); a new kind is one new
    function. Soundings are deeper the further they are from shore, and stay clear of
    every mark and label.
  - `npm test` runs `test/chart.test.js`: every scenario validates clean, every mark has
    a painter, soundings fall in water, and each sea provides the places the story uses.
  Writing the validator caught two bugs on the old hand-drawn chart: Beacon Station was
  drawn in the water 36 px off its headland, and the anchorage was on land.
- `TableScene` loads the scenario, bakes the chart once into one Canvas 2D texture, and
  animates only live things: the station's coverage ring and radar sweep, boats, the
  harbour sighting, the intel marker, showdown paths and the debrief's truth layer, all
  placed from the scenario. The camera moves only at night.
- The story in `src/fixture.js` names places (`beacon`, `harbour`, `lane`) rather than
  coordinates, so it plays on any sea that provides them; its words are still written
  for Kestrel Strait.
- `DeskScene` runs on top and owns **every word and control as DOM** (`this.add.dom`), so
  text is crisp, selectable, focusable and readable by screen readers. In the real game
  this layer would be React, fed by the existing contracts.
- `motion.js` holds the tokens from the Figma motion spec (page 07, board B1): easing
  names, durations, staggers, the 40 characters a second typewriter, a `move()` helper that
  enforces reduced motion, and a seeded random so replays look identical.
- Ambient motion is capped at two loops: the radar sweep and a 2 px boat drift.
- The stamp is the one loud moment. After it lands, nothing on the map changes until the
  "server" accepts the orders (a 900 ms timer stands in for the receipt here).

## How officers talk

The copy rules live in `src/fixture.js` and are applied to every line:

1. **Rank before every name**, everywhere: "Major General Elias Halden", then
   "Major General Halden". Never a bare surname.
2. **Months, not turns.** One turn is one month, September to February. Officers name time
   the way their background suggests:
   - Major General Halden (British): "since the autumn", "before Christmas".
   - Brigadier General Briggs (American): "since October", "through Q1".
   - Rear Admiral Okafor (Nigerian): "since September", "these three months".
   - Rear Admiral Sato (Japanese): "before the fiscal year closes", "by the end of the month".
3. **Firm, and doubt in character.** Generals state what they have seen as fact and draw a
   hard line around it: "Anyone who tells you what Ravellan means by it is guessing. I
   don't guess." There is no "What we don't know" heading. Briefings use *Bottom line*,
   *Assessment* and *Watch for*.
4. **Plain words.** The median line reads at about grade 3 (Flesch-Kincaid), down from
   about grade 8 in the current Figma copy.

## Story content

- **Places and people.** Marenna is the host country, its cabinet votes on 15 January, and
  Sarn is Ravellan's main harbour. Lattice is our radio-intercept network: twelve
  listening posts along the Marennan coast, drawn on the chart.
- **Ask your staff.** Every order slip lists the officers with a view. Each shows whether they
  back what is on the slip or what they would do instead; clicking one plays their case.
  The choices view shows who backs each option.
- **SMART lines.** Recommendations name a unit or asset, a number, a place and a date ("two
  rifle companies and the air-defence battery on the headland by 20 December"). Night
  reports are dated duty logs in which each entry leads into the next.

## Decisions this prototype makes that need sign-off

- The calendar (one month a turn, September to February), and the dates inside it
  (Marenna's vote on 15 January, Ravellan sailing on 1 February).
- Kestrel Strait's geography: Beacon's headland was widened so the station sits on land.
- Names: Marenna, Sarn, 2nd Battalion. (Harrow Sound's names are placeholders for testing.) Every figure in the copy (94 days on duty, nine and
  eleven landing craft, 140-strong garrison, 20 or 30 miles of radar, two spare patrol
  boats) is invented dressing; the sim tracks steps, so a content table must map them.
- Ranks and regional backgrounds for the six staff officers.
- "The host government" for the partner, "hotline" for the rapid consultation channel,
  "personal order" for an intervention.
- Debrief truth lines ("your show of force made them test, not attack") are illustrative,
  not sim output.

## Credits

Fonts: IBM Plex Sans and Newsreader, both SIL Open Font License 1.1, latin subsets from
Google Fonts in `public/fonts`. Portraits are the existing generated officer portraits
from the Figma file (256 × 256 sources; see the imagery notes on Figma page 06).
