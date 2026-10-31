# Map Room roadmap: from one campaign to a war

This is a proposal for the product owner. Signed so far: the player commands a task force
moving through one war, and the war layer's shape described under phase 2 (both
29 October 2026). Everything else past phase 1 is an unsigned gameplay decision. Under the repository's V2 freeze (`AGENTS.md`), none of it goes
into the shipped game until the V2 human fun gate passes. Until then it stays in
`prototypes/map-room`.

## Where we are

- **One campaign type.** It runs over three months (December to February) and holds one
  station against one rival, with the ally's cabinet behind it.
- **Seeded campaigns.** Each code rolls the rival's hidden plan, the ally's politics, the
  staff's starting state and the month's incidents. Difficulty sets how far each of these
  can vary.
- **Phase 1, generated theatres (built, proof of concept).** Each code also rolls the
  sea, the two countries and every place name. The campaign plays the same on any of them.

## Decided: a task force moving through one war

Two shapes were on the table:

| | Task force moving through a war | Dropped into different theatres |
| --- | --- | --- |
| What carries over | Your staff, your units, their fatigue and losses, your standing with allies, your funding | Only your record and unlocks |
| What a win buys | Something you use next campaign: money, troops, a fresh battalion | A score, an unlock |
| What a loss costs | A weaker next campaign, which you play anyway | Nothing, next theatre |
| Fits the staff and ledger | Yes: officers remember what you did to them | Loosely |
| Risk | A bad run can snowball; it needs a floor | Each campaign feels disconnected |

**Decided: the task force** (product owner, 29 October 2026). The game already puts its weight on your staff, your
reserve battalion's fatigue and the ally's trust. Carrying those from campaign to campaign
makes every choice cost something later. A theatre-hopper resets them every time.

The phase 1 generator fits either shape: the staff stay the same across theatres, and only
the sea and the countries change.

## Phase 2: the war layer

Product owner direction, 29 October 2026, after the second playtest:

- **Two campaigns first.** Build a two-campaign war and test it. If it works, test a fixed
  war of four campaigns. A war is not yet rolled at random lengths.
- **Every result pays a refit.** Each campaign ends with a minimum operating and refit
  allocation, whatever the result. A success adds a bonus on top.
- **No extra penalty for failure.** The next sector does not automatically get harder
  after a loss. Losses already carried into the next campaign hurt enough; adding a
  penalty on top risks a death spiral.
- **Carry force condition and funding.** Each unit's days without rest and its casualties
  go into the next campaign, and so does the funding balance.
- **Specific officer memories, not a trust score.** Officers remember what happened
  ("you took Lattice off the quay in January and it cost us"), not just how often you
  overruled them. The debrief already lists these memories (`debrief().leaves`).
- **One war, consistent sides.** The rival and its losses carry across sectors: a landing
  force beaten on a beach is gone in the next sector. The war's factions stay the same.
  Only the sector (the strait, the ally and the places) is new.

**Built (prototype):** the two-sector war, on the title screen. The README lists its
amounts for sign-off.

**The commander's level** (product owner, after the fourth playtest):
- The player decides coalition support, reserves and intelligence. Staff handle execution,
  such as repairs or how a defector is questioned, unless it creates a real command
  decision.
- Monthly preparation turns stay. Dated crisis decisions come when events speed up, as
  February now does.
- The battle should show how positioning, warning and reinforcements led to the result
  before any new controls are added.

**On hold** (product owner, after the third playtest): no more systems or sectors until
one campaign is satisfying to watch, understand and resolve. The visual resolution of
February and the tension of each decision come first. The four-sector test waits until then.

Still to decide or to set in the prototype for sign-off:

- **Length.** A campaign should take under 20 minutes as a baseline.
- **Between campaigns, a redeployment screen.** It would show what the task force carries
  (each unit's days and casualties, the officers' memories, the funding) and the next sector.
  In the two-campaign test the next sector is fixed; later, a choice of two or three.
- **What the refit allocation and success bonus buy.** Candidates: rest for a unit,
  replacing casualties, an extra personal order next campaign, better intelligence at the
  start. The amounts need sign-off.

## Phase 3: a second campaign type

The second type is a different shape of problem on the same desk. Candidates:

- escorting a convoy through a contested lane;
- evacuating a garrison before a deadline;
- a blockade that must not become a war.

Each type is its own skeleton of roles and its own incidents. It reuses the generator, the
staff, the ledger and the redeployment screen. The war layer then mixes types, so no two
wars run the same order.

**Foundations laid (review 6).** The interfaces a second type needs now exist, and none of
them is a general scripting engine:

- **A definition** (`src/story/definition.js`): roles, objectives, phases, a causal
  calendar, order slots, incident rules, and `FIXED` structure kept apart from `TUNING`
  balance.
- **A resolver** that records dated facts and intelligence as it applies each transition,
  and resolves February for any case (`play.js`). Forecasts come from the same resolver.
- **Words built for a world the campaign carries** (`storyFor(c.world)`), not for a shared
  global.
- **Battle plans:** actors, moves along named anchors, effects and labels, played by the
  table with no knowledge of the campaign (`battle.js`, `TableScene.playPlan`).
- **Geography read from the chart** (`geographyOf` in `sketch.js`).

`sketch.js` puts a small, different scenario through those interfaces: the "evacuating a
garrison" candidate, with one decision driven by the chart's distances. It is a proof of
the interfaces, not the second campaign. That still needs its own phases, incidents,
officers' advice, words and human testing, and should wait for the V2 gate and the answer
to question 4.

**What is still fixed in the station-defence campaign.** These are fixed by structure, not
made configurable, and a second type would need its own:

- **Phases:** December and January are preparation months (briefing, an incident,
  orders, the log), and February is one decision. The desk's chapters, the month seals and
  the calendar's dates are written for exactly this shape.
- **Map-independent rules:** the defence levels and thresholds, the second wave at twelve
  craft, the cabinet of eleven with a majority at six, a month on duty costing 31 fatigue,
  the warning sources, and how each February route resolves. None of them reads the chart:
  a generated theatre changes names and geography, not the outcome. Only the sketch has a
  decision geography changes.
- **Roles:** one station, one host, one rival harbour, one network and one reserve. The
  generator fills them with names, but never adds or removes one.

**Still single-type.** The desk screens (orders slips, the host's slip, February's cards)
are written for station defence. A second type needs its own screens, or a desk that reads
the order slots from the definition. That is the next piece of work once a type is chosen.

## Phase 4: meta-progression (deferred)

Unlocks between wars are not planned until the POC shows whether the war loop is worth it.
These are options only, not decisions:

- officers with their own careers;
- doctrines you can choose at the start of a war;
- new campaign types unlocked by winning.

## Assets: replacing the shape-based chart

The chart is currently drawn from shapes: coasts, rectangles for towns, a paper-cut boat.
It reads as a diagram, not a place. The plan:

1. **An art direction sheet first.** A naval chart from the 1950s to 1970s, printed on
   paper: hand-drawn hachures, engraved symbols, real typefaces, with photographed paper
   and wear. One sheet, signed off before any assets are generated.
2. **Generated and drawn assets go through `packages/asset-pipeline`.** It already records
   the provenance the repository needs: the prompt hash, seed, provider, model, licence
   status (prototype-only, approved or rejected) and reviewer.
   `npm run lint:assets` checks the manifest. Nothing reaches the game marked
   prototype-only.
3. **What to replace first:**
   - ship and craft sprites (top-down and in silhouette, by class);
   - the station and harbour icons;
   - a symbol set for coast and terrain (cliffs, beach, marsh, town, woods);
   - paper and wear textures;
   - the compass rose and cartouche.
4. **Generated charts stay generated.** The coastline stays procedural. Assets are
   stamped onto it by rule: cliff symbols where the coast is steep, beaches in bays,
   towns at the heads of bays. This way every sea still looks hand-made.
5. **The portraits** move from prototype-only to approved or replaced, through the same
   licence review.

## Keeping generated text consistent

The playtest showed that generated text can contradict itself. Every new piece keeps the
current rule: one function works out the facts (`outcome()` in `src/story/play.js`), and
the copy only reads them. Tests then run every campaign path against those facts.

Since playtest 5 there is one record for history as well: `chronicle()` in
`src/story/chronicle.js` turns the rules into dated events and intelligence with source and
certainty, and every log, decision, debrief and memory is written from it.
`test/surface.test.js` renders every screen for a broad sample of campaigns and checks
each class of defect: undefined text, boarding claimed without the order, rest claimed
without a rest, forecasts that don't match results, cabinet counts that don't add up or
change without a logged cause, logs out of date order, exposure claimed without its rule,
unfit confused with under strength, and the second sector.

In the war layer, carried-over state gets the same treatment. One function works out
what the task force has and remembers, and the officers quote only that.

## Open questions for the product owner

1. ~~Task force or theatre-hopping?~~ Decided: the task force.
2. ~~Reward shape and the floor?~~ Decided: a minimum refit allocation every time, a bonus
   for success, no extra penalty after failure. The amounts are still open.
3. ~~War length?~~ Decided: two campaigns first, then a fixed four if that works.
4. ~~Which second campaign type comes first?~~ Leaning: **evacuation**, after the
   station-defence playtest. It changes the objective meaningfully. The withdrawal sketch is
   not yet a full campaign: it has no months, staff, incidents or desk screens of its own.
6. ~~What counts as redeployment?~~ Decided in review 9: exposure clears when the exposed
   guns actually change positions; night can conceal a move but doesn't erase what the
   enemy knows. Still open: **the order that moves them, and its cost**.
7. ~~The rest-or-reinforce trade~~ Decided in review 9: keep the current balance for blind
   playtesting, and find out whether players understand and care about the trade
   (RULES-REVIEW.md).
8. ~~The withdrawal sketch's escape rule~~ Accepted in review 9 as a simplified rule: a lift
   escapes if it clears the beach no later than the rival reaches the post, and there is no
   interception at sea.
5. Who reviews generated art, and what licence bar must it meet before it leaves
   prototype-only?
