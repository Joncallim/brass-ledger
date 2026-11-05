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

**Review 10 (Jon's preferred option, in play for testing):** in January, while the guns are
exposed, "Reinforce and reposition the guns" is offered as one personal order.

- **Effect:** the normal reinforcement and its normal fatigue, and exposure clears once the
  move is done on 20 January.
- **Not included:** no radar repair, no soldiers restored, no rest, and no extra fatigue
  until playtests show whether the order's cost is enough. Offering a plain "move instead of
  reinforcing" would have been a weak choice, since it would cost an order for the same +1.

Measured with `npm run rules-review` (100 seeds a difficulty, every legal plan; the game
against `variant: { reposition: "off" }`):

| Rules | Station lost, Shifting / Volatile | Average result, Shifting / Volatile |
| --- | --- | --- |
| Review 10 (with the order) | 31% / 38% | 0.82 / 0.74 |
| Review 9 (without) | 32% / 39% | 0.81 / 0.73 |

- **Where it applies:** in runs with the guns exposed at January's orders, moving them loses
  the station in 18%, against 40% for reinforcing quietly.
- **What the omniscient balance doesn't show:** the best fixed plans and the best plans per
  campaign don't change, because best plans never expose the guns. The order is a recovery
  for players who did.
- **The visible-information policies are unchanged.** None of them answers an incident with
  cameras or a briefing.

It needs uncoached playtesting: whether players see it, and whether one order is the right
price.

### Review 10: paired comparison against the best legal alternative

`npm run reposition-compare -- 150` (150 seeds a difficulty). The rule is kept as it is, and
exposure is never added: it comes only from the player's own answers, as in the game.

**How it compares.** A situation is one campaign with the choices made before January's
orders: December's orders, and both incident answers. It counts only when the guns are
exposed at January's orders, the only time the move is offered. From each situation, every
legal way to finish (January's station order, Lattice question and dealing with the host, then
February's route) is played. The best that moves the guns is compared with the best that
doesn't. "Best" knows the hidden truth: it is an upper bound on play, not a player.

| | Steady | Shifting | Volatile |
| --- | --- | --- | --- |
| Exposed situations | 691 | 2,173 | 2,107 |
| Best with the move: station lost | 0% | 3% | 5% |
| Best with the move: success / costly / failure | 30 / 70 / 0% | 22 / 75 / 3% | 21 / 74 / 5% |
| Best legal alternative: station lost | 0% | 0% | 0% |
| Best legal alternative: success / costly / failure | 99 / 1 / 0% | 70 / 30 / 0% | 67 / 33 / 0% |
| The move's best is the better | 0 | 89 (4%) | 117 (6%) |
| The alternative's station order | Hold in all | Hold 1,918, quiet 255 | Hold 1,748, quiet 359 |
| January personal orders: with the move / best alternative | 2.00 / 1.83 | 2.00 / 1.88 | 2.00 / 1.87 |

**A second comparison holds everything else fixed.** It compares the move with the quiet
reinforcement, keeping the same Lattice question and dealing with the host. February is
chosen cautiously from the forecast, as a player who sees only the board would choose it.

| Held fixed, cautious February | Steady | Shifting | Volatile |
| --- | --- | --- | --- |
| Pairs | 1,171 | 3,418 | 3,262 |
| Station lost: reposition / reinforce quietly | 0% / 1% | 3% / 9% | 4% / 13% |
| Success: reposition / reinforce quietly | 26% / 26% | 19% / 18% | 20% / 18% |
| January personal orders: reposition / reinforce quietly | 1.86 / 0.86 | 1.88 / 0.88 | 1.88 / 0.88 |

**What it says:**

- **The move's real competitor is Hold, not the quiet reinforcement.** When exposure came
  from a January answer, that answer already used one of the two orders, so moving the guns
  takes the second and rules out Hold. With hindsight, Hold and the right February route
  never lose the station here, and win outright far more often (67–99%).
- **Against the quiet reinforcement it does what it says.** For one more personal order, it
  cuts station losses by about two-thirds (9% to 3% on Shifting, 13% to 4% on Volatile), with
  about the same rate of outright wins.
- **It is the better choice in 4–6% of exposed situations** on Shifting and Volatile, and in
  none on Steady.

So the order works as a recovery when a player won't rest the battalion. It competes for the
same order as Hold, and with full knowledge Hold is usually better. Whether players see
either of those, without hindsight, is for the playtests.

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
- follow each officer's advice, read again after every choice.

They share the rest of the handling: staff answers to incidents, the month's personal-order
limit, the trade of the boats for a daylight move that needs approval, and the cautious
February route from the forecast.

- Over 150 seeds, resting both months wins 100% of Steady, 53% of Shifting and 54% of
  Volatile campaigns, matching the best fixed omniscient plan.
- Following Okafor gets the same rates with different choices. He rests the battalion
  once: in December (93 of 150 Shifting seeds), or in January with Hold. In this sample
  the grades match rest-both-months seed by seed; the plans never do.
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
  station about twice as often as the staff plan, because Beacon goes without its
  reinforcement.
- **It is not the riskiest policy measured for the station.** Following Halden loses it
  more often: 16% on Shifting and 21% on Volatile. Following Briggs loses it least (0%),
  but nearly always ends with the battalion unfit.
- **The staff plan** almost never loses the station. It ends in costly success, with the
  battalion worn out.

Neither is universally best; they trade the station's safety against the battalion.

**Decided (Jon, review 9):** keep the current balance for blind playtesting. Rest gives more
full successes in the sample, but also more station losses. The sessions should find out
whether players understand that trade and care about it (`PLAYTEST.md`). The balance test that the staff plan never wins outright records a
proposed target. Passing it says nothing about whether the advice is credible or the choice
is interesting.


