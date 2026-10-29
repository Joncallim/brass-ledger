# Map Room roadmap: from one campaign to a war

This is a proposal for the product owner. One decision is signed: the player commands a
task force moving through one war (decided 29 October 2026). Every other item past phase 1
is an unsigned gameplay decision. Under the repository's V2 freeze (`AGENTS.md`), none of it goes
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

A war is a chain of 3 to 5 campaigns. The task force redeploys after each one to a newly
generated sector.

- **Length.** A campaign should take under 20 minutes as a baseline. A war rolls a few
  shorter campaigns (2 months) and longer ones (4 months) around the usual 3. A whole war
  is about one to one and a half hours.
- **Between campaigns, a redeployment screen.** It shows:
  - the war map, with the sectors and which are held;
  - the task force's state: each unit's strength and fatigue, each officer's trust in you;
  - the funding;
  - one choice of the next sector from two or three generated options. Each option shows its
    difficulty and what it pays.
- **Rewards for a good result** (proposed, needs sign-off):
  - Success: extra funding, plus a choice of one reinforcement (a fresh battalion, a
    second station radar, more patrol boats, a better intercept network).
  - Costly success: funding only.
  - Failure: no reward, and the next sector starts harder (the rival is emboldened).
- **What carries over:**
  - unit fatigue and losses (2nd Battalion ends a campaign at 110 days and starts the next
    one tired);
  - officers' trust, from how often you overruled them;
  - the funding balance;
  - a short history the officers quote ("we did this at Sarn and it cost us").
- **A floor.** Every sector can be won from a bad start: rest and replacement are always
  on offer at a price. A war ends early only if you lose two sectors in a row.
- **Spending.** Funding buys:
  - rest for a unit;
  - a replacement officer;
  - an extra personal order next campaign;
  - better intelligence at the start.

## Phase 3: a second campaign type

The second type is a different shape of problem on the same desk. Candidates:

- escorting a convoy through a contested lane;
- evacuating a garrison before a deadline;
- a blockade that must not become a war.

Each type is its own skeleton of roles and its own incidents. It reuses the generator, the
staff, the ledger and the redeployment screen. The war layer then mixes types, so no two
wars run the same order.

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

In the war layer, carried-over state gets the same treatment. One function works out
what the task force has and remembers, and the officers quote only that.

## Open questions for the product owner

1. ~~Task force or theatre-hopping?~~ Decided: the task force.
2. Are the reward types and sizes right? Is there a floor on bad runs?
3. Should a war have a fixed length (for example 4 campaigns) or end on a victory
   condition?
4. Which second campaign type comes first?
5. Who reviews generated art, and what licence bar must it meet before it leaves
   prototype-only?
