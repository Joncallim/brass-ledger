# Map room: rules under review

For Jonathan. Four rules came in with playtest 5. Review 6 asked for each to be reviewed
rather than locked in. Nothing below has been changed in the game: every screen and test
still plays the current rules. The alternatives exist only as review variants
(`c.variant` in `src/story/play.js`, which the game never sets). Each needs your decision.

Numbers come from `npm run rules-review` (60 seeds per difficulty, every legal plan: 145,926
plan-campaign runs). Two measures matter, and they say different things:

- **Best plans.** These are what a player who already knows the answer does: the best fixed
  plan's success rate, the share of campaigns that can't be won outright, and how many
  different best plans there are.
- **All plans.** This is closer to a first-time player: the average result over every legal
  plan (success 2, costly 1, failure 0) and the share of plans that lose the station.

| Variant | Best plan wins (Steady / Shifting / Volatile) | Can't be won outright (Shifting / Volatile) | All plans: average (Steady / Shifting / Volatile) | All plans: station lost (Steady / Shifting / Volatile) |
| --- | --- | --- | --- | --- |
| Current rules | 87% / 58% / 55% | 8% / 13% | 1.21 / 0.79 / 0.72 | 14% / 34% / 40% |
| Exposure: no level lost | 88% / 58% / 55% | 8% / 13% | 1.26 / 0.88 / 0.82 | 10% / 26% / 31% |
| Exposure: December's is stale by February | 87% / 58% / 55% | 8% / 13% | 1.22 / 0.81 / 0.75 | 13% / 32% / 37% |
| Visit: the staff answer is no cameras | 88% / 60% / 55% | 8% / 13% | 1.23 / 0.81 / 0.74 | 13% / 32% / 38% |
| Naval: a second wave that slips past must be held | 87% / 58% / 55% | 8% / 13% | 1.20 / 0.76 / 0.68 | 14% / 36% / 43% |

None of the variants moves the Shifting guard on campaigns that can't be won outright (it
stays at 20%; today 8–12% depending on the seeds). None of them changes what an expert does;
all of them change what a newcomer meets.

## 1. Fatigue counts only when the battalion fought

**Recommendation: keep.** A battalion that arrives after the fight hasn't fought, so it
shouldn't pay battle fatigue. February's forecast and the result now come from the same
function, so the cost shown is the cost paid.

## 2. Incidents in date order

**Recommendation: keep.** The order is now causal on every path. Incidents land before the
month's orders, and everything an order causes falls after them. The effects add up
regardless of order, so this changed no result: 48,519 legal runs were compared with the
previous rules, and none differ.

## 3. Exposure costs a level against a landing, permanently

**The rule today.** Two things tell Ravellan where our guns are: briefing the press openly,
and hosting the minister's visit with cameras. Either one means Beacon counts one level lower
against a landing for the rest of the campaign. A failed radar does the same.

**Evidence.**
- Ravellan knows our guns in 43% of runs, and that changes the grade in 16% of those.
- The staff's default answer to the minister's visit (cameras) causes 60% of all exposures.
  The visit comes up in 38% of campaigns.
- Without the penalty, plans lose the station far less often: on Shifting, 26% instead of 34%.
- Best plans are unaffected, because an expert never exposes the station.
- A December exposure also puts Beacon at "level 0 against a landing" if it was then left at
  level 1, which reads oddly.

**Trade-off.** The penalty gives the press and visit choices teeth: Sato's support against
Briggs's defence level. Without it, briefing openly is free support. Permanent, though, it
punishes a December choice in February, after six weeks in which we could have moved the
guns. It is also mostly paid by players who let the staff decide.

**Recommendation.**
1. **Change the staff answer to the visit to "no cameras".** The staff should not spend the
   commander's defence level on politics without being told to.
2. **Keep the penalty, but let a December exposure go stale by February** (the "stale"
   variant). The trade-off stays real in the month it is made.

Together they leave expert play unchanged and bring the newcomer's average up slightly. These
are design decisions, so neither is applied.

## 4. The naval route keeps the station when a second wave slips past

**The rule today.** Standing with the host's navy without warning: the navies meet only the
first wave, and the second lands. The station is then always held, after a battle on the
beach. That holds whatever the defence level, and whether or not the battalion is fit.

**Evidence.**
- When a second wave slips past, the station is kept with an unfit battalion in 53% of cases.
- It is kept with defences under level 2 against a landing in 26%.
- Everywhere else the game says an unfit battalion can't hold a landing.

**Trade-off.** The rule makes the naval route a safe harbour: it can never lose the station.
That keeps the ally's navy valuable, but it contradicts the rule the briefings state. The
forecast and debrief now say it plainly ("Under this campaign's rule, 2nd Battalion holds a
second wave that gets past the navies"). Saying it plainly doesn't make it consistent.

**Recommendation: the "must be held" variant.** A second wave that slips past the navies
needs what one wave needs when the battalion is on hand: level 2 against a landing and a fit
battalion. The cost is small: plans lose the station on Shifting 36% of the time instead of
34%, and best plans don't change. It isn't applied without your decision.

## Also found: two decisions that rarely decide anything

The new decision-diversity measure (`npm run balance`) looks at what each order slot does to
the best result, across campaigns:

- December's Lattice question **never** changes the best result.
- December's and January's station orders have almost no spread: the same option is nearly
  always best.

Most of the variety comes from the incident answers and the February route. This matches
the playtest verdict that the game is "more like choosing an answer than weighing competing
plans".

One caveat: this measure scores plans that already know the hidden truth, so it can't value
information. December's Lattice question may still matter to a player who has to guess. The
uncoached human sessions in `PLAYTEST.md` are the way to find out; the numbers can't.
