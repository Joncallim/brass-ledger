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
| 1 | `KESTREL` | Shifting | The authored theatre, and everyone's first run |
| 2 | `B6` | Shifting | A real landing with a second wave (13 craft) |
| 3 | `B5` | Shifting | A bluff, with the cabinet already below a majority |
| 4 | `B4` | Volatile | A bluff that turns into a landing if the cabinet wavers |
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
4. Did anything in the story contradict what you saw on the screen? Write down exactly where.
5. Which text did you skip, and which did you read twice?

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
