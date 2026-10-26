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
npm test             # chart, campaign and room checks (Node, no browser)
```

`?seed=KX4P2&difficulty=volatile` plays a given campaign (the title screen also rolls new
ones). `?chapter=dec-orders` opens a chapter directly. `?renderer=canvas` forces the 2D renderer
(handy without a GPU, e.g. headless capture). `?scenario=harrow-sound` draws another sea;
`?chapter=chart` (or key 0) shows any chart on its own with its validator result.

| Key | Does |
| --- | --- |
| Space / Enter / click on a speaker | Finish the running sequence, or continue |
| 1–9 | Jump to a chapter: title, December briefing, December orders, December night, January briefing, January orders, January night, February showdown, debrief |
| 0 | Chart preview for the current scenario |
| N | Roll a new campaign at the same difficulty and start December |
| S · L · O | Staff room, ledger, settings (also the buttons in the top bar; Esc closes) |
| M | Toggle reduced motion (also follows `prefers-reduced-motion`) |

## The scenario: three months, with history

You take command on 1 December, three months into the crisis, and play December,
January and February. September to November happened under your predecessor: the
title screen says so, the month track shows them dotted, and the debrief credits those
orders to your predecessor, not to you.

**What counts as winning** (shown on the title screen and scored in the debrief):
keep Beacon in our hands, keep Marenna on our side (6 of 11 ministers), and bring
2nd Battalion through fit (120 days without rest or fewer). All three is a **success**;
holding Beacon at the cost of one of the others is a **costly success**; losing Beacon is
a **failure**. `outcome()` in `src/story/play.js` computes each fact once, and the
debrief's words are chosen from those facts, so the ending can't contradict the game.

**Stakes, said plainly in the game:**

- 2nd Battalion is *fit* up to 100 days without rest, *tired* to 120, *unfit* beyond, when
  a third of it is sick or injured. The readout at the top shows the word, not just the number.
- Lattice listening to Sarn gives about two days' warning of troops boarding. A known
  sailing date only gives warning while our patrol boats can see the ships leave; trading
  the boats to Marenna takes that away.
- Standing with Marenna's navy stops a landing at sea only with warning or against a
  force without a second wave; meeting a bluff with two navies costs Marenna's patience.

## Campaigns: almost no two plays alike

Every campaign is rolled from a code (`src/story/campaign.js`). The same code and
difficulty always roll the same campaign, so a replay matches; a new code rolls a new
one. What is rolled:

- **Ravellan's hidden plan.** A real landing on Beacon, a bluff meant to make Marenna ask
  us to leave, or a probe that turns into a landing if Beacon looks weak. The sailing
  date and how many landing craft load in December go with it. Twelve or more craft is a
  battalion plus a second wave, which Beacon cannot hold without a fit, warned 2nd
  Battalion.
- **The clues.** Lattice's answers, the fishing fleet's behaviour and the night reports
  follow the hidden plan. On harder settings one clue may be planted to read as a
  landing, and a defector may be lying.
- **Marenna's politics.** How many of the eleven ministers back us, whether the defence
  minister is a hawk or a dove, the vote date, whether a hotline exists, and how support
  drifts each month.
- **The staff's starting state.** How long 2nd Battalion has been on duty, which changes
  what Rear Admiral Okafor argues for, and so on down the staff.
- **Incidents.** A failing radar, a defector, a leak to the press, a collision on the
  shipping lane, a minister's visit. Each lands before the month's orders as a signal
  with its own hard call, a free staff answer and an answer that costs a personal order.

**Difficulty scales the variation in each element** (`DIFFICULTY`):

| | Steady | Shifting | Volatile |
| --- | --- | --- | --- |
| Enemy plans | landing or bluff | landing, bluff or probe | any, and a bluff can turn into a landing if Marenna wavers |
| Sailing date | 3 February | 2–5 February | 1–6 February |
| Landing craft added in December | 1–2 | 2–4 | 2–5 |
| Planted clues | never | 1 in 5 | 2 in 5 |
| Ministers with us at the start | 7–8 of 11 | 6–8 | 5–7, drifting up to ±1 a month |
| Defence minister | firm | firm, hawk or dove | hawk or dove |
| Incidents | one | one a month | one a month, harsher |

With identical choices, 192–200 of every 200 campaigns tell a different story. Following
the staff plan every month loses Beacon in about 7% of Steady campaigns and about a
quarter of Shifting and Volatile ones, so overruling your staff is sometimes right.

## The staff and the hard call

Each officer has one job and one thing they always push for, shown under their name
wherever they speak:

| Officer | Job | Always pushes for |
| --- | --- | --- |
| Major General Halden | Intelligence: finds out what Ravellan means to do | moves that force Ravellan to show its hand |
| Brigadier General Briggs | Operations: makes sure Beacon can stop an attack | more troops and guns on Beacon, out of sight |
| Rear Admiral Okafor | Logistics: keeps our troops and ships fit to fight | rest for 2nd Battalion before it breaks |
| Rear Admiral Sato | Plans and Marenna: keeps Marenna on our side | nothing Ravellan can photograph before the cabinet agrees |

Their recommendations are worked out each month from the campaign's state (`orders()`
in `src/story/copy.js`), so who agrees and who clashes changes from run to run. Every
decision shows **the hard call**: the two strongest opposing views side by side, each
with what that officer is protecting and what happens if you overrule them, plus a line
for anyone holding a third view. "Hear the case" plays it in their own voice. The
readiness bar along the top shows the four things they argue about (2nd Battalion's days
on duty, the cabinet count, Beacon's defences, our warning before an attack), each owned
by one officer.

## Staff room, ledger and settings

Three panels open over any chapter without resetting it (`src/story/rooms.js` works out
what they show; it adds no rules):

- **Staff room.** Each officer's job, what they always push for, the readout they watch,
  what they want this month with what they are protecting and what happens if you
  overrule them, and how often you have taken their advice so far.
- **Ledger.** Every incident answer and month's orders you have committed, with the four
  readouts afterwards; where things stand now; what we know; the campaign code. Choices
  still on the desk are not written in until you send them.
- **Settings.** Text speed (slow, normal, fast, instant), motion, the campaign code with
  copy and replay, a new campaign at any difficulty, and the keys. Text speed and motion
  are remembered in this browser.

## The sequence

Each month runs **briefing → signal (if an incident lands) → orders → night**. Briefings
lead with what changed, how sure we are, and what it means for your orders. An incident
answer goes out when you press "Confirm answer", and the orders panel lists it under
"Already sent". Night reports end with what the month changed, readout by readout. Once
the ships sail, the warning box gives way to what we know about them. Everything
after December follows from what you ordered (`run` in `DeskScene`):

- The December night report narrates your Beacon order, Lattice's answer, the incident's
  result and Ravellan's response, all shaped by the hidden plan.
- January's briefing reads the clue you bought, honest or planted.
- In January, Marenna's slip depends on the campaign: an open move may clash with a slow
  answer (Send stays blocked until you settle it), a hotline may make it easy, or a shaky
  cabinet may need securing even if you stay quiet.
- February offers standing with Marenna's navy only if Marenna agreed to send it. If
  Lattice kept listening to Sarn, Major General Halden can tell you whether the landing
  craft carry troops; otherwise you choose blind.
- The debrief shows what you ordered, what we believed and what was really happening.

Seals are spent and returned by the slips themselves, never more than two a month,
including any spent on the month's incident.

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
- **The story is generated.** `src/story/` holds the placeholders every campaign is
  written against (`world.js`: station, host, rival, harbour, network, reserve), the
  officers (`officers.js`), the generator (`campaign.js`), the incidents
  (`incidents.js`), the rules that move the state (`play.js`, pure and deterministic) and
  every word on screen (`copy.js`). Another campaign on the same placeholders is a new
  `world.js` and its own incidents.
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
- **Balance.** Trading the patrol boats and standing with Marenna's navy is the strongest
  line: full success in roughly 70–85% of Shifting and Volatile campaigns (300 seeds each),
  against 0% for following the staff plan every month (which never rests 2nd Battalion).
  Worth tuning before the human fun gate.
- The scoring thresholds (6 of 11 ministers, 120 days), the patrol boats' role in warning,
  interception needing warning against a second wave, and the 15-point cost of meeting a
  bluff with two navies.
- **All campaign rules** in `src/story/play.js` and `campaign.js` are prototype rules,
  not sim rules: how each order moves 2nd Battalion's days, Beacon's defences and the
  cabinet count; the penalties for daylight moves by minister type; the vote threshold
  (6 of 11); the hotline threshold; the second-wave rule; deterrence (a visible January
  frigate cancels a landing when Beacon is fully reinforced); a bluff turning into a
  landing when the cabinet drops below 5 of 11; and the seven February results.
- The incident pool and every figure in it (the radar's one-in-four failure chance, the
  defector's reliability, the cabinet swings).
- New figures: Sarn about 30 nautical miles from Beacon; Kestrel Strait about 40 wide;
  two days' warning from the troop-loading order; 2nd Battalion about 600 soldiers; the
  air-defence battery about 120; a week for Marenna's answer without a hotline.

## Credits

Fonts: IBM Plex Sans and Newsreader, both SIL Open Font License 1.1, latin subsets from
Google Fonts in `public/fonts`. Portraits are the existing generated officer portraits
from the Figma file (256 × 256 sources; see the imagery notes on Figma page 06).
