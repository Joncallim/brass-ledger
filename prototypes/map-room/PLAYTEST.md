# Map Room playtest protocol

The point of a session is to measure difficulty, not to guess it. Two runs by one person
can't establish balance. Run this protocol with several people and seeds, and compare it
with the automated report (`node scripts/balance.mjs`).

## Who

- **First-time players:** at least three, who have never seen the prototype.
- **Experienced players:** at least two, who have finished three or more campaigns.
- Nobody coaches during a run. If a tester asks what something means, note the question
  and point them to the profile cards (hover any highlighted name).

## What each tester plays

Give every tester the same seeds, in this order, so results can be compared:

| Run | Code | Difficulty | Why this one |
| --- | --- | --- | --- |
| 1 | `KESTREL` | Shifting | The authored theatre, and everyone's first run. It is a real landing with a second wave (12 craft), so February ends in a fight |
| 2 | `B6` | Shifting | A real landing with a second wave (13 craft) and a hawkish ally |
| 3 | `B13` | Shifting | A bluff, with the cabinet already below a majority (5 of 11) |
| 4 | `B4` | Volatile | A bluff with a dovish ally; it turns into a landing if the cabinet drops below 40 |
| 5 | the tester's own new code | the tester's choice | Free play |

Each code also generates its own theatre, so testers see a different sea for each run.
The table was checked against the campaign generator. If the rules change, check it again.

Include **one deliberately poor run**: before run 3, ask the tester to follow the staff
plan every month and pick "Hold quietly". Then ask the questions under "Recovery" below.

## What to record

Most of this is in the in-game log: Settings, then "Playtest log", then copy the raw lines.

| Measure | Where it comes from |
| --- | --- |
| Time per campaign, and per screen | Log: `screen` lines and the summary's minutes |
| Personal orders used each month | Log: `seals` |
| Options picked and then taken back | Log: `pick` with `back: true` (a sign an option was weighed) |
| Order slips opened, cases heard | Log: `open`, `hear` |
| February choice, result, days, casualties, ministers | Log: `route`, `result` |
| Whether each option was seriously considered | Ask after each month: "Which options did you think about? Which did you rule out at once, and why?" |
| Whether the same plan wins | Compare the testers' orders across seeds; do they repeat one plan and win anyway? |

## Questions after each run

1. What was the hardest call, and what made it hard?
2. Was there a month where both personal orders felt worth spending on more than two things?
3. In February, did you feel you knew the answer, or that you were choosing between costs?
4. Did anything in the story contradict what you saw on the screen, or another screen?
   Write down exactly where, with the date in the game.
5. Which text did you skip, and which did you read twice?
6. Did you change a plan after reading an officer's case or opening a slip? What made you
   change it?
7. What did you give up to get what you chose? Could you say it in one sentence?
8. Watching February play out on the chart: could you follow who moved where, and did the
   chart end where the report said it did?

## Uncoached comprehension check

Run this before the questions above, with first-time players only, on `KESTREL` and one of
`B6` or `B13`. The aim is to find out whether the words alone are understood. Say nothing
about the rules beforehand, and don't explain anything during the run.

1. Ask the tester to think aloud. Record the screen and their voice.
2. Stop them at three points and ask the questions below, without showing anything new:
   - **After the December briefing:** What does Beacon need to hold against one wave? And
     against two? What do we know for certain, and what is only likely?
   - **After the January log:** What changed this month, and why? Who moved the cabinet
     count? Is Beacon's defence level what it says on the headland, or lower, and why?
   - **At the February decision:** When and how did we learn they are moving? What does
     each option cost if they fight, and if they don't?
3. After the debrief, ask: Why did it end the way it did? Was anything you were told
   wrong, and could you have known?
4. Score each answer as **right**, **partly right** or **wrong**, and note the exact words
   the tester used. A wrong answer is a text defect: note which screen should have told
   them, and file it with the sentence that misled them.

Proposed signal: every first-time tester answers the "what does Beacon need" and
"why did it end" questions right without help. Anything they get wrong points at a
sentence to rewrite.

## Recovery (the poor run)

1. After a costly or failed result, did you understand why it happened?
2. Would you want to play the next sector carrying that damage, or start again? Why?
3. Did the result feel like your decision or like bad luck?

The war layer is meant to make recovery interesting rather than just punishing. These
answers decide how hard the next sector should be after a loss.

## Pass and fail

The human fun gate is the product owner's call. These are proposed signals, not thresholds:

- Most testers name a different "hardest call", and on different seeds.
- Experienced players still lose sometimes, and say why without blaming luck.
- No tester wins three seeds in a row with one fixed plan.
- First-time players finish a campaign in under 20 minutes.

**Automated checks don't close this gate.** `npm test`, the browser checks and the balance
report show that the screens agree with the rules and that no fixed plan wins everywhere.
They can't show that the game is understood or fun. That needs the uncoached comprehension
check and the sessions above, with people.

## Review 7: questions for the next sessions

The review played the campaign and found the finale clearer, but "still like solving a table
and watching the answer", and the command structure "oversized for one battalion and a
radar station". These are questions for players, not instructions to add units or content.

Ask after the debrief, without leading:

1. **Solving or deciding.** "When you chose in February, were you working out the right
   answer, or weighing things you cared about?" Note whether they mention the forecast
   table as the answer.
2. **Watching or taking part.** "During the showdown, was there anything you wished you
   could do?" Note whether the animation felt like a consequence or a replay.
3. **Scale.** "Did four senior officers feel right for what you were commanding?" Note any
   word like "overkill", "bureaucracy" or "too many people".
4. **The ally.** "What did the patrol boats buy you?" Right answer: the navy and permission,
   not the cabinet's votes.
5. **Exposure.** "What did briefing the press, or the minister's cameras, cost you, and for
   how long?" Right answer: one level against a landing, for the rest of the sector.

**Status.** No human participant has played the review 6 or review 7 builds. The uncoached
comprehension check and the fun sessions above have not been run. Every result so far comes
from automated checks and from the product owner's own reviews.
