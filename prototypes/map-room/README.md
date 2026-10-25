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
```

`?chapter=dec-orders` opens a chapter directly. `?renderer=canvas` forces the 2D renderer
(handy without a GPU, e.g. headless capture).

| Key | Does |
| --- | --- |
| Space / Enter / click on a speaker | Finish the running sequence, or continue |
| 1–9 | Jump to a chapter: title, December briefing, December orders, December night, January briefing, January orders, January night, February showdown, debrief |
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

- `TableScene` draws the world. Everything static (table, paper, coastlines, depth
  contours, hatching, soundings, labels, compass, scale bar, grain) is baked once into one
  Canvas 2D texture. Only live things are game objects: Beacon's coverage ring and radar
  sweep, boats, the harbour sighting, Lattice marker, showdown paths and the debrief's
  truth layer. The camera moves only at night.
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

## Decisions this prototype makes that need sign-off

- The calendar (one month a turn, September to February).
- Ranks and regional backgrounds for the six staff officers.
- "The host government" for the partner, "hotline" for the rapid consultation channel,
  "personal order" for an intervention.
- Debrief truth lines ("your show of force made them test, not attack") are illustrative,
  not sim output.

## Credits

Fonts: IBM Plex Sans and Newsreader, both SIL Open Font License 1.1, latin subsets from
Google Fonts in `public/fonts`. Portraits are the existing generated officer portraits
from the Figma file (256 × 256 sources; see the imagery notes on Figma page 06).
