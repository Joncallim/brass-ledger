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
  for or traded for; if you acted without them, the screen says why it is missing.
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
4. **Name who.** Never a bare "they" when it could mean two parties: "the Marennan
   cabinet votes", "Ravellan's ships", "Marenna's defence minister".
5. **Every statement carries its so-what.** Say what a fact means for us: "Lattice was not
   listening to Sarn this month, so our warning before an attack is less reliable", not
   just "our count is getting old".
6. **Report, don't mind-read.** Officers say what was seen and what it lets Ravellan do.
   They never guess at the other side's feelings ("they think Beacon is weak", "they are
   testing your nerve").
7. **Clear beats short.** Use a full sentence where a clipped phrase would need decoding.
   No shorthand or figures of speech: "the press", not "the papers"; "Marenna's approval",
   not "Marenna's yes". Terms like "landing" are explained where they first appear.

## Names and terms you can ask about

Every proper noun (places, our units and systems) is set in teal, and every piece of
jargon is underlined with dots on first use. Officer names stay brass. Hovering or
focusing any of them opens a short profile: who or what it is, and why it matters here.
Profiles live in `GLOSSARY` and `OFFICERS` in `src/fixture.js`; `src/gloss.js` finds the
words in any text that reaches the screen, including text that types out. The chart's
own labels (Sarn, Lattice, Marenna, Ravellan, Beacon Station, the title) carry a `term`
in the scenario and open the same profiles.

## Story content

- **Places and people.** Marenna is the host country, its cabinet votes on 15 January, and
  Sarn is Ravellan's main naval harbour, about 30 nautical miles from Beacon. Lattice is
  our radio-intercept network: twelve listening posts along the Marennan coast, drawn on
  the chart.
- **The two readings.** Ravellan's landing craft could mean an amphibious landing on the
  Beacon headland, or a threat meant to make Marenna ask us to leave. Every briefing keeps
  both in view until Halden sees troops boarding on the quay.
- **Warning before an attack.** While Lattice listens to Sarn, it hears the order to put
  troops aboard about two days before a sailing, which is time to bring 2nd Battalion to
  Beacon. Pointing Lattice at another question makes that warning less reliable, and the
  Lattice slip says so on each choice.
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
- Debrief truth lines (Ravellan cancelling its landing order after the January frigate,
  the February probe) are illustrative, not sim output.
- New figures: Sarn about 30 nautical miles from Beacon; Kestrel Strait about 40 wide;
  two days' warning from the troop-loading order; 2nd Battalion about 600 soldiers; the
  air-defence battery about 120; a week for Marenna's answer without a hotline.

## Credits

Fonts: IBM Plex Sans and Newsreader, both SIL Open Font License 1.1, latin subsets from
Google Fonts in `public/fonts`. Portraits are the existing generated officer portraits
from the Figma file (256 × 256 sources; see the imagery notes on Figma page 06).
