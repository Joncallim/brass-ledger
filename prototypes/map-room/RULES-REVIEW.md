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
| Exposure | One level lower against a landing, for the rest of the campaign | One level lower **while Ravellan's picture still describes our positions**: until the exposed guns change positions (night alone doesn’t count). A new month alone doesn’t end it. See "Redeployment" below |
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

## Redeployment: the rule is decided, the order is not

**Decided (Jon, review 9):** exposure clears only when the exposed guns actually change
positions. Night can conceal a move, but night alone doesn't erase what the enemy knows.

So neither of today's orders clears exposure; both add guns rather than move the ones
Ravellan saw:

- December's staff plan moves two rifle companies and the air-defence battery onto the
  headland by night.
- January's brings the battery up to full strength.

Exposure therefore lasts the sector, as the game already plays it. Between sectors of a war
the task force does redeploy (a new strait and a new station), and exposure doesn't carry
over.

The slips and the glossary now say: "until the guns it saw move to new positions: guns added
by night don't change what it knows. No order in this campaign moves them, so it lasts the
sector."

**Still to design:** an order that moves the exposed guns, and what it costs (time, the
level while they move, fatigue, a personal order). Nothing in the game implements it yet.

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
apart from the omniscient measure above:

- follow the staff plan;
- rest both months (a fixed plan);
- follow the majority;
- follow each officer's actual advice.

Every policy picks the cautious February route from the forecast.

- Over 150 seeds, resting both months wins 100% of Steady, 53% of Shifting and 54% of
  Volatile campaigns, matching the best fixed omniscient plan.
- Following Okafor's actual advice gives the same results. It is conditional, but from the
  staff plan it always calls for rest.
- Following the staff plan never wins outright.

No rule was changed in response. Review 9 below shows what each of these gives up.

## Review 9: resting is a trade, not the answer (needs a design decision)

Full success alone overstates "rest both months". Over 150 seeds:

| Policy (sees only the board) | Full success | Costly | Station lost | Ally lost | Battalion unfit |
| --- | --- | --- | --- | --- | --- |
| Rest both months, Shifting | 53% | 33% | 13% | 47% | 0% |
| Staff plan, Shifting | 0% | 93% | 7% | 45% | 100% |
| Rest both months, Volatile | 54% | 32% | 14% | 46% | 0% |
| Staff plan, Volatile | 0% | 94% | 6% | 41% | 100% |

- **Resting** buys a fit battalion, and with it most full successes. It also loses the
  station about twice as often, because Beacon goes without its December and January
  reinforcement.
- **The staff plan** almost never loses the station. It ends in costly success, with the
  battalion worn out.

Neither is universally best; they trade the station's safety against the battalion.

**Decided (Jon, review 9):** keep the current balance for blind playtesting. Rest gives more
full successes in the sample, but also more station losses. The sessions should find out
whether players understand that trade and care about it (`PLAYTEST.md`). The balance test that the staff plan never wins outright records a
proposed target. Passing it says nothing about whether the advice is credible or the choice
is interesting.


