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
npm test             # chart, campaign, room, consistency, surface, modular and balance checks (Node)
npm run build && npm run test:browser   # the built prototype in Chromium (CI runs both)
npm run balance -- 150      # the balance report, with decision diversity per order slot
npm run rules-review -- 60  # the rules under review against their alternatives (RULES-REVIEW.md)
```

CI runs the map-room job (`.github/workflows/ci.yml`): install, `npm test`, build, and the
browser checks. Root `npm test` still doesn't see this package.

To run a playtest, follow [PLAYTEST.md](PLAYTEST.md). The game keeps a playtest log in the
browser (Settings, then "Playtest log").

`?seed=KX4P2&difficulty=volatile` plays a given campaign in that code's generated theatre
(the title screen also rolls new ones); no seed, or `?seed=KESTREL`, is the authored Kestrel
Strait. `?chapter=dec-orders` opens a chapter directly. `?renderer=canvas` forces the 2D renderer
(handy without a GPU, e.g. headless capture). `?scenario=harrow-sound` draws another sea;
`?chapter=chart` (or key 0) shows any chart on its own with its validator result.

| Key | Does |
| --- | --- |
| Space / Enter / click on a speaker | Finish the running sequence, or continue |
| 1–9 | Jump to a chapter: title, December briefing, December orders, December log, January briefing, January orders, January log, February showdown, debrief |
| 0 | Chart preview for the current scenario |
| N | Roll a new theatre and campaign at the same difficulty and start December |
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
- **The clues.** Lattice's answers, the fishing fleet's behaviour and the monthly logs
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

## Generated theatres (proof of concept)

A new campaign is now also a new theatre: a new strait, a new host country and rival, a
new harbour, station, intercept network and reserve, and a new chart. The code decides
all of it, so replaying a code replays the same theatre and campaign. This is the first
step towards the roguelike war in [ROADMAP.md](ROADMAP.md); it plays the existing
three-month campaign and changes nothing about its rules.

- `src/gen/factions.js` rolls the names. The host and the rival come from two different
  sets of sounds so they don't read as related, and are checked against a list of real
  countries and the authored names. The staff do not change: they are ours and travel
  with the task force.
- `src/gen/mapgen.js` rolls the chart: our station on a headland of the host's (west)
  coast, the rival's harbour in a bay across the strait, a shipping lane down the middle,
  islands, reefs, woods, towns and the chart furniture kept clear of every label. Each
  try is checked with `validateScenario`; a failing try is thrown away and rolled again.
  The copy's "nautical miles across the strait" is measured from the chart.
- The host coast stays on the west because the desk's papers sit on the right of the
  table, over the rival's side. Other orientations wait for a desk that can move its
  papers.
- `src/story/world.js` holds a live `WORLD`. Modules that work something out from the
  names (titles, the glossary, the highlighter, the officers' lines) re-run when
  `setWorld` swaps the theatre, so a new theatre starts without reloading the page.
  This is what makes it work in the hosted preview, which can't take a query string.
- `test/procgen.test.js` checks 200 codes: every chart validates, the same code gives the
  same theatre, the names are distinct, and across 12 theatres no authored name (Kestrel,
  Marenna, Ravellan, Sarn, Beacon, Lattice, 2nd Battalion) leaks into any line the desk can
  show.

## A two-sector war (prototype)

"Start a two-sector war" on the title screen plays two campaigns in a row with one task
force against one rival (`src/story/war.js`; see ROADMAP, phase 2):

- Each sector is a new strait and a new ally, generated from the war's code. The rival
  stays the same, and so do the task force's staff, reserve battalion and intercept network.
- The battalion's days without rest and its casualties carry into the next sector. Under
  500 soldiers it can't hold a second wave. A landing force beaten on a beach is gone:
  the rival starts the next sector with up to three fewer landing craft.
- Every result pays a refit (3 after a failure, 4 after a costly success, 5 after a
  success). Between sectors it buys:
  - rest for the battalion (2);
  - replacing its casualties (2);
  - an extra personal order in the first month (2);
  - a second network team on the harbour, with a fresh count of the landing craft by 27 December whatever the network is asked (1).
  A failure adds no penalty of its own.
- The second sector poses a different problem from the first:
  - a different enemy plan;
  - a second wave if the last landing force had none, or none if it had one;
  - a different defence minister;
  - a hotline if the last ally had none, or none if it had one.
  It never depends on how well the last sector went.
- Each officer remembers something specific from the sector, and says it at the start of
  the next one ("We left the quay at Sarn and paid for it").
- A war has no replays. The second debrief shows both sectors' results.
- `test/war.test.js` checks what carries over, the refit, and that failure adds no penalty.

## The staff and the hard call

Each officer has one job and something they usually argue for. Their advice adapts to the
campaign, so the slips say "advises", never "wants":

| Officer | Job | Usually argues for |
| --- | --- | --- |
| Major General Halden | Intelligence: finds out what Ravellan means to do | moves that force Ravellan to show its hand |
| Brigadier General Briggs | Operations: makes sure Beacon can stop an attack | more troops and guns on Beacon, out of sight |
| Rear Admiral Okafor | Logistics: keeps our troops and ships fit to fight | rest for 2nd Battalion before it breaks |
| Rear Admiral Sato | Plans and Marenna: keeps Marenna on our side | nothing Ravellan can photograph before the cabinet agrees |

Their recommendations are worked out each month from the campaign's state (`orders()`
and `latticeOrders()` in `src/story/copy.js`), so who agrees and who clashes changes from
run to run. A slip's face leads with the decision and its cost, then one line for each
officer who advises otherwise. Opening the slip shows **the hard call**: the two strongest opposing views side by side, each
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

Each month runs **briefing → signal (if an incident lands) → orders → monthly log**. Each month
has two order slips on the left (the station, and what Lattice listens for) and, in
January, Marenna on the right. Changing any staff plan, or answering an incident your own
way, uses one of two personal orders. Each slip's choice is pinned to the chart where it
acts. Briefings
lead with what changed, how sure we are, and what it means for your orders. An incident
answer goes out when you press "Confirm answer", and the orders panel lists it under
"Already sent". Each month's log is a dated duty record built from the campaign's record, and ends with what the month changed, readout by readout. Once
the ships sail, the warning box gives way to what we know about them. Everything
after December follows from what you ordered (`run` in `DeskScene`):

- The December log records your Beacon order, Lattice's answer, the incident's
  result and Ravellan's response, all shaped by the hidden plan.
- January's briefing reads the clue you bought, honest or planted.
- In January, Marenna's slip depends on the campaign: an open move may clash with a slow
  answer (Send stays blocked until you settle it), a hotline may make it easy, or a shaky
  cabinet may need securing even if you stay quiet.
- January's Lattice question decides February's warning. Staying on Sarn's harbour net
  hears the order that puts troops aboard. The fleet net gives the true sailing date, which
  lets Okafor take 20 fatigue off 2nd Battalion, but loses that warning.
- February offers three ways to meet the ships: hold quietly, dig 2nd Battalion in on the
  headland (no warning needed, costs fatigue whatever happens), or stand with Marenna's navy
  if Marenna agreed to send it. Good intelligence narrows the choice without settling it:
  Halden says what he knows and what he doesn't (troops aboard, how many waves).
- The showdown plays out on the chart in five steps, each with a short entry in the report:
  - the rival's ships leave harbour and come down the lane;
  - our forces move (the battalion stands by, digs in on the headland, or the two navies
    form a line);
  - contact (shots across the bows, a landing on the beach, or a second wave round the flank);
  - how it ended (ships home, landing craft lost on the beach, or the rival's flag over the
    station);
  - the cost.
  Pause and "Skip to the end" work at any point. With reduced motion each step shows its
  end state. The chart always ends where the report does.
- The debrief shows what you ordered, what we believed (January's column is the reading
  the staff argued from) and what was really happening, and what each officer will
  remember. The top bar shows the state after February, the same numbers as the debrief.
- **Fatigue** is one point a day on duty without rest, plus more for hard work (an
  engineering job, digging in, a battle, a month at sea). It is not a count of days, and
  every screen calls it fatigue.

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
- **A campaign is a definition, a resolver and words** (`src/story/`, review 6):
  - `definition.js` is the station-defence campaign as data: its roles, objectives, phases,
    calendar, the order slots each phase offers, its incidents' rules, and its constants.
    `FIXED` holds the structure (defence levels, the second-wave threshold, the cabinet's
    majority, the exposure and radar penalties); changing one makes a different game, so
    they are not presented as settings. `TUNING` holds the balance numbers that
    `npm run balance` measures.
  - `play.js` resolves it. `simulate()` records every dated fact and every piece of
    intelligence (claim, source, certainty, whether it was true) as it applies each
    transition. `resolve()` decides February for one case. `outcome()` resolves the true
    case, and `forecast()` resolves every case the evidence leaves open with the same
    function. The forecast is therefore the result, number for number.
  - `chronicle.js` only gathers that record and answers "what did we know at this moment?"
    (`knownAt`, and `evidence`, which strips the hidden truth).
  - `copy.js`, `incidents.js`, `officers.js` and the glossary in `fixture.js` are
    factories of a world. `storyFor(c.world)` builds the words once per world. The
    campaign carries its world (`makeCampaign(seed, difficulty, world)`), so rules and
    words never read shared state. The shared `WORLD` in `world.js` is now only the chart
    on the table, for the scenes and the glossary highlighter.
  - `battle.js` describes a battle as a plan: actors, their moves along named anchors
    (harbour, approach, beach, flank, reserve, dug, line and so on), effects (flash, trench,
    flag, fade) and labels, in steps. `stateAfter(plan, i)` gives the end state a skip or
    reduced motion must leave. `TableScene.playPlan` plays any plan on any chart and knows
    nothing about how a campaign is won or lost.
  - `sketch.js` is a deliberately small second scenario, a garrison withdrawal, to prove
    the interfaces. It has a different objective (bring the soldiers and the guns out), its
    own resolver, its own battle plan, and a decision driven by geography read from the
    chart (`geographyOf`: how far the rival's harbour and our anchorage are). One context
    (`sketchContext`: the chart, its distances, the hours of warning) feeds the
    calculation, the plan and the table. The transports start at the same anchorage the
    distance is measured to (`anchorageOf`, shared with the table), and a lift that is
    caught stays on the beach with whoever was waiting. With six hours' warning, the best
    decision is two lifts under frigate cover on 174 of 200 generated charts, two lifts with
    no cover on 21, and on 5 (and Harrow Sound) the guns can't come out in time. With three
    hours' warning, the same choice gets the garrison out on Kestrel Strait and loses it on
    Harrow Sound, whose anchorage is three times as far. It is not a campaign: one
    decision, invented numbers, no words beyond its labels.
- `TableScene` loads the scenario, bakes the chart once into one Canvas 2D texture, and
  animates only live things: the station's coverage ring and radar sweep, boats, the
  harbour sighting, the intel marker, showdown paths and the debrief's truth layer, all
  placed from the scenario. The camera moves only at night.
- The story names places (`beacon`, `harbour`, `lane`) and battle anchors rather than
  coordinates, so it plays on any sea that provides them.
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

State-aware first, then sharp. Every sentence on screen is built from the campaign's
record (below), never from a fixed date or an inferred number.

**Three registers.**

- **Interface text is literal.** Option names, costs, chips and labels say exactly what
  happens and what it costs: "Beacon to level 2 by 20 December, moved by night. Fatigue
  111 by New Year."
- **Speech is punchier.** Officers talk in short, concrete sentences, and say plainly what
  they don't know: "We have twelve craft at Sarn, which is enough for a second wave. We
  have the numbers, but not the boarding order." Direct orders and decisive verbs, in the
  task force's own restrained voice: no catchphrases.
- **The ledger and logs are a factual record.** Date, source, what happened, what it
  changed. No opinion.

**Each officer has a job.**

| Officer | Speaks to | Sounds like |
| --- | --- | --- |
| Brigadier General Briggs | position and deadlines | "Two rifle companies and the battery on the headland by the 20th, by night." |
| Major General Halden | sources and uncertainty | "8 craft at Sarn. I have the numbers, not the intent." |
| Rear Admiral Okafor | readiness and human cost | "Fatigue 80. They have one more month in them. Not two." |
| Rear Admiral Sato | permissions and political leverage | "5 for, 6 against. Move in daylight and Ravellan's embassy shows the photographs first." |

**Rules applied to every line.**

1. **Rank before every name**, everywhere: "Major General Elias Halden", then
   "Major General Halden". Never a bare surname.
2. **Intelligence is not truth.** Every claim carries its source, date and certainty
   (confirmed, likely, one signal, or a claim we can't check). Briefings separate *What
   we know*, *What we don't know* and *What it means for your orders*. Only the debrief's
   last column says what was really happening.
3. **Numbers are the model's numbers.** A forecast quotes the same fatigue, level and
   cabinet count the rules will use, and the outcome reports the same figures. Fitness
   (fatigue) and strength (soldiers lost) are separate. Cabinet counts always say "N for,
   M against".
4. **Name who.** Never a bare "they" when it could mean two parties.
5. **Every statement carries its so-what**, and no trade-off is advertised that the rules
   don't apply.
6. **Report, don't mind-read.** Officers say what was seen and what it lets Ravellan do.
7. **The player sets intent; the staff execute.** Staff business is reported, not asked.

## Names and terms you can ask about

Every proper noun (places, our units and systems) is set in teal, and every piece of
jargon is underlined with dots on first use. Officer names stay brass. Hovering or
focusing any of them opens a short profile: who or what it is, and why it matters here.
Profiles live in `GLOSSARY` and `OFFICERS` in `src/fixture.js`; `src/gloss.js` finds the
words in any text that reaches the screen, including text that types out. The chart's
own labels (Sarn, Lattice, Marenna, Ravellan, Beacon Station, the title) carry a `term`
in the scenario and open the same profiles.

## Story content

- **Places and people.** Marenna is the host country, its cabinet votes in mid-January, and
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
  rifle companies and the air-defence battery on the headland by 20 December"). The monthly
  logs are dated duty records in which each entry leads into the next.

## Decisions this prototype makes that need sign-off

- The calendar (one month a turn, September to February), and the dates inside it
  (Marenna's vote between 10 and 20 January depending on the campaign, Ravellan sailing between 1 and 6 February; every other date is in `CALENDAR` in `src/story/definition.js`).
- Kestrel Strait's geography: Beacon's headland was widened so the station sits on land.
- **Generated theatres** (all invented for the proof of concept): the name lists and sound
  sets, the theatre's code also seeding the campaign, a new campaign always meaning a new
  theatre, the staff staying the same across theatres, and the host coast always on the west.
- Names: Marenna, Sarn, 2nd Battalion. (Harrow Sound's names are placeholders for testing.) Every figure in the copy (94 days on duty, nine and
  eleven landing craft, 140-strong garrison, 20 or 30 miles of radar, two spare patrol
  boats) is invented dressing; the sim tracks steps, so a content table must map them.
- Ranks and regional backgrounds for the six staff officers.
- "The host government" for the partner, "hotline" for the rapid consultation channel,
  "personal order" for an intervention.
- **Balance targets** (proposed; `test/balance.test.js` guards them, and
  `node scripts/balance.mjs` reports them over every legal plan within two personal orders
  a month):
  - On Shifting, no single fixed plan wins more than 60% of campaigns. Today the best
    one wins about 55%, Volatile’s best about 55%. Steady stays easy on purpose: about 91%
    for its best plan.
  - The best result for a campaign usually needs a different plan: 75–86% of campaigns.
  - About half of Shifting and Volatile campaigns need both January personal orders for
    the best result.
  - At most 20% of Shifting and 30% of Volatile campaigns can't be won outright (today
    about 12% and 13% over 150 seeds).
  - Following the staff plan every month never wins outright (it never rests the battalion).
- **The war** (all proposed): the refit amounts and prices; 500 soldiers as the line for
  under strength; the rival losing one craft in its next sector for every four beaten on a
  beach, up to three; and the second sector reusing the December to February calendar. That
  calendar is a stand-in: a real war needs dates that don't depend on the season.
- **Review 7.** Rules now in play (see [RULES-REVIEW.md](RULES-REVIEW.md) for what they
  changed, and the open question on redeployment):
  - The staff answer to the minister's visit is **no cameras**. Exposing our positions is a
    personal order, explained on the slip.
  - **Exposure lasts until the guns are redeployed.** No order in a campaign is defined as a
    redeployment, so today it lasts the sector. Whether a night move counts needs a decision.
  - **A second wave past the navies meets the normal one-wave ground defence**: level 3
    holds it alone, and level 2 holds it with a fit battalion. Otherwise the station falls.
    The naval route no longer saves the station automatically.
  - **Permission is not support.** Trading the patrol boats buys the host's permission and
    its navy, not its cabinet's votes. The slip, the log, the debrief and Sato's memory all
    say so, and keeping the ally is judged on the cabinet's count.
  - **February's dates come from the record.** Orders go out within the hour of the
    decision, so a dig-in ordered on a boarding report two days ahead happens two days
    before the sailing. The report and the chart play it in that order.
  - **The war's intelligence refit** promises what it delivers: a second team counting the
    landing craft, with a fresh count by 27 December whatever the network is asked. It is
    worded with the task force's own names.
- **Review 6.** Exposure, the staff's camera default and the naval route were measured
  here and decided in review 7 (above). Also proposed here:
  - **The calendar is causal.** Incidents land before the month's orders: in December on
    4 to 8 December, with orders on the 10th; in January on 2 to 6 January, with orders on
    the 7th. Everything an order causes comes after: in December, the companies in place
    on the 20th, the frigate from the 19th, rest from the 11th; in January, the fleet net's
    date on the 9th, the rotation from the 10th, the frigate on the 16th, the battery on the
    20th. The minister asks on 2 January and visits on the 6th. A failing radar left running
    fails, and shows, on 28 January, not on the day of the roll.
  - **One craft threshold.** Twelve or more landing craft carry a second wave; fewer is
    one wave. The old "battalion's worth" wording is gone.
  - **Built and against a landing.** When exposure or a failed radar lowers the level a
    landing meets, every screen says both: "level 2 against a landing (3 built)".
  - **February's forecast lists every open case**, including empty landing forces that are
    a show for the cameras and those that turn back. Where their results differ, both rows
    are shown; where they're the same, they share one row.
  - **Decision diversity** (`npm run balance`) is measured per order slot. Today:
    - December's Lattice question never changes the best result.
    - The December and January station orders have almost no spread.
    - The incident answers and the February route carry most of the variety: 13 to 16
      different best plans, the commonest covering 19 to 25% of campaigns.

    See RULES-REVIEW.md for what this means and its limits.
- **Playtest 5 rules and architecture:**
  - **One record.** `src/story/chronicle.js` builds the campaign's dated events and its
    intelligence (claim, source, certainty, and whether it was true) from the rules.
    Every log, the February decision, the showdown, the debrief, the ledger and the
    officers' memories read from it, so none can claim an event that didn't happen.
  - **The decision's date comes from its source**: the boarding order two days out (which
    can fall in January), the patrol boats at 05:00 on the sailing day, or the radar at
    07:00. January's log ends the day before a January decision.
  - **Exposure costs a level.** Briefing the press openly, or the minister's visit with
    cameras, tells Ravellan where our guns are: Beacon counts one level lower against a
    landing (as a failed radar does). Said where you choose it, in the log, on the top
    bar ("level 2 · exposed") and in February's case table.
  - **Who fought, and what it cost.** The battalion takes the +20 battle fatigue only if it
    fought. Losses are split between the garrison and the battalion, and only the
    battalion's reduce its strength.
  - **A December show of force gives a clue** (likely, not confirmed) from how Ravellan
    reacts.
  - **The cabinet's own drift lands before January's orders**, so the count on the host's
    slip is the count the vote uses. Every change in the count is logged where it
    happens.
  - **Staff business and incidents apply in date order**, and January's incidents come
    before the vote.
  - **The decisive requirement is stated from December**, in full in every briefing, not
    first at the finale. The orders' "Gives" row keeps the one line that bears on the order
    ("level 3 against a landing holds one wave without 2nd Battalion"), so the slips fit.
- **Playtest 4 rules:**
  - **The decision comes when we learn they are moving.** That is when Lattice hears the
    boarding order (two days out), when the patrol boats see the ships leave on a known
    date, or when the radar picks them up that morning. The month's logs end on the last
    day of the month, and the showdown starts at the sailing.
  - **Each February option shows its risk, case by case** (one wave, two waves, no troops),
    from the same requirements that decide the result (`landingCheck` in `play.js`):
    defence level, warning, a fit battalion, a battalion at full strength. Cases already
    ruled out by what we know are not shown. A test checks the table predicts the result
    for every path.
  - **The debrief names the cause.** It lists the requirements that failed (or held), and a
    test checks it never blames anything that didn't fail. The defence level is shown
    everywhere, on the top bar too.
  - **Staff business stays with the staff.** The radar repair and the defector are handled
    by the staff and reported in the month's log. Only command decisions (the press, an
    incident at sea, the ally's minister) come to your desk.
  - **The cracked radar fails in January,** so a lower defence level is known before February.
  - **The showdown labels its own cause** on the chart: the warning as they sail, our
    defence level and fatigue as we move, and the deciding requirement at contact.
- **Balance, playtest 4.** The Shifting guard on campaigns that can't be won outright
  stays at 20%. Today it is about 12% (18 of 150 seeds). `node scripts/diagnose.mjs
  shifting` lists them:
  - In 13 of the 18, the closest plans lose only the ally. They are mostly bluffs that
    start with the cabinet at 46–53: the rival's press takes about 7 support over two
    months, and no order you control reliably wins it back.
  - The other five are landings or probes with two waves, a dovish or firm minister, and a
    cabinet near the line.
  - Whether these campaigns are fair needs players' judgment first. Ways to change them
    are design decisions to sign off, not made here: a coalition order for the ally, a
    softer press, or a cabinet floor.
- **Playtest 3 rules:**
  - A bluff costs the ally's cabinet 3 support a month (scaled by difficulty) from the
    rival's press, so even a campaign with no landing needs orders spent on the ally.
  - The second sector varies as above.
  - Fatigue replaces "days" everywhere.
- **Playtest 2 rules:**
  - The radar repair costs the battalion's engineers 12 days.
  - The January sailing date buys the battalion 20 days' rest but loses the boarding
    warning.
  - Digging the battalion in costs 20 days, plus 20 more after a battle. Doing it against
    an empty landing force costs 10 support points.
  - Meeting an empty force with two navies costs 20 points.
  - Allied ships in a fight move the cabinet by the defence minister's stance: −12 dove,
    −6 firm, +4 hawk.
  - Casualties by result: 60 held, 40 repelled, 80 landed, 140 lost.
  - Trading the patrol boats now buys the approval but no extra goodwill.
  - Shifting's cabinet now starts at 46–66 and Volatile's at 48–66, with drift ±8.
- **All campaign rules** in `src/story/play.js` and `campaign.js` are prototype rules,
  not sim rules: how each order moves 2nd Battalion's days, Beacon's defences and the
  cabinet count; the penalties for daylight moves by minister type; the vote threshold
  (6 of 11); the hotline threshold; the second-wave rule; deterrence (a visible January
  frigate cancels a landing when Beacon is fully reinforced); a bluff turning into a
  landing when the cabinet drops below 5 of 11; and the ten February results.
- The incident pool and every figure in it (the radar's one-in-four failure chance, the
  defector's reliability, the cabinet swings).
- New figures: Sarn about 30 nautical miles from Beacon; Kestrel Strait about 40 wide;
  two days' warning from the troop-loading order; 2nd Battalion about 600 soldiers; the
  air-defence battery about 120; a week for Marenna's answer without a hotline.

## Credits

Fonts: IBM Plex Sans and Newsreader, both SIL Open Font License 1.1, latin subsets from
Google Fonts in `public/fonts`. Portraits are the existing generated officer portraits
from the Figma file (256 × 256 sources; see the imagery notes on Figma page 06).
