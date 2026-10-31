# Map room: rules review

Review 6 measured four rules from playtest 5 against alternatives. Review 7 agreed a direction,
and the game now plays it. This page records what was decided, what it changed, and one rule
that still needs a definition.

Numbers come from `npm run rules-review` (100 seeds per difficulty, every legal plan: 243,240
plan-campaign runs). The script compares the review 7 rules with the rules before them (kept
only as `PREVIOUS_RULES` in `src/story/play.js`, which the game never sets).

## Decided

| Rule | Before | Now (review 7) |
| --- | --- | --- |
| Fatigue | Battle fatigue only for a battalion that fought | Unchanged |
| Incidents | In date order | Unchanged |
| The minister's visit | The staff answer was cameras, which exposed our guns | The staff answer is **no cameras**. Cameras are a personal order, and the slip says what they cost |
| Exposure | One level lower against a landing, for the rest of the campaign | One level lower **while Ravellan's picture still describes our positions**: until the guns are redeployed. A new month alone doesn't end it. See the open question below |
| Naval breakthrough | A second wave past the navies was always held | It meets the **normal ground defence for one wave**: level 3 against a landing holds it alone, and level 2 holds it if the battalion (already behind the navies) is fit. Otherwise the station falls |

## What it changed

| Rules | Best fixed plan wins (Steady / Shifting / Volatile) | Can't be won outright (Shifting / Volatile) | All plans: average (Steady / Shifting / Volatile) | All plans: station lost (Steady / Shifting / Volatile) |
| --- | --- | --- | --- | --- |
| Review 7 (the game) | 90% / 57% / 52% | 11% / 14% | 1.23 / 0.81 / 0.73 | 11% / 32% / 39% |
| Previous: cameras by default | 89% / 56% / 53% | 11% / 14% | 1.22 / 0.78 / 0.69 | 12% / 34% / 42% |
| Previous: a breakthrough always held | 90% / 57% / 52% | 11% / 14% | 1.23 / 0.83 / 0.75 | 11% / 31% / 37% |
| Previous rules (both) | 89% / 56% / 53% | 11% / 14% | 1.23 / 0.80 / 0.72 | 11% / 33% / 40% |

- **The 20% Shifting guard holds.** Shifting campaigns that can't be won outright stay at 11%
  of 100 seeds; the guard is unchanged.
- **The two changes pull in opposite directions** for a typical player:
  - No cameras by default removes most accidental exposure. Ravellan knows our guns in 31% of
    runs, down from about 43% when the staff used cameras (review 6, 60 seeds). Cameras, now a personal order, cause 36% of the exposures
    that remain.
  - The naval ground check takes away the naval route's free save. Of the 14% of naval stands
    where a second wave slips past, the ground defence now loses the station in 42%.

  Net, on Shifting, a typical plan loses the station slightly less often than before: 32%
  against 33%.
- **What an expert does is unchanged.** Best plans already avoided cameras and the
  unwarned naval stand. The breakthrough is still held by an unfit battalion in 26% of
  cases, but only where the defences are at level 3 against a landing, which holds one wave
  alone under the normal rule.

## Open: what counts as redeployment

Review 7 says redeployment ends exposure, and a new month doesn't. Within a campaign, no order
is defined as a redeployment:

- December's staff plan moves two rifle companies and the air-defence battery onto the
  headland by night.
- January's brings the battery up to full strength.

Either could be read as moving the guns Ravellan saw, or as adding to them. Rather than invent
a rule, the game treats neither as a redeployment, so exposure lasts the sector. Between
sectors of a war the task force does redeploy (a new strait and a new station), and exposure
doesn't carry over.

**Reviewer's recommendation (review 8), pending Jon's decision:** exposure clears only when
the previously exposed guns actually move to new positions. Night is a way to conceal a
move, not enough by itself. Read that way:

- December's staff plan, which brings new guns up by night, would not clear exposure.
- A move of the battery Ravellan saw would, at a cost still to be set.

Nothing in the game implements this yet.

**Needs a decision.** Should a night move of the guns (December's staff plan, or a new
"redeploy the battery" order) end exposure, and at what cost? Until then, the slips and the
glossary say: "until our guns are redeployed. No order in this campaign redeploys them, so it
lasts the sector."

## Also found: decisions that rarely decide

The decision-diversity measure (`npm run balance`) is unchanged by review 7:

- December's Lattice question never changes the best result.
- December's and January's station orders have almost no spread.
- Most of the variety comes from the incident answers and the February route.

The measure scores plans that already know the hidden truth, so it can't value information.
It matches the playtest verdict ("more like choosing an answer than weighing competing plans")
but can't settle it. That is for the uncoached sessions in `PLAYTEST.md`.

## Review 8: what a player who sees only the board would do

`npm run balance` now also scores policies that use only what the player can see, kept
apart from the omniscient measure above. The policies are: follow the staff plan, follow
the majority, follow one officer, and pick the cautious February route from the forecast.
Over 150 seeds, resting the battalion both months (Okafor's advice) wins 100% of Steady,
53% of Shifting and 54% of Volatile campaigns. That matches the best fixed omniscient plan.
Following the staff plan never wins outright. No rule was changed in response. Whether
"always rest" is a strategy players find, and whether it feels like a decision, is for the
sessions in `PLAYTEST.md`.

