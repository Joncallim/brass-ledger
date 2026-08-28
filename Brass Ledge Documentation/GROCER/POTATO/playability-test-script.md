---
type: game-engine-action
area: playability-validation
status: active
priority: P1
tags:
  - POTATO
  - playability
  - onboarding
---

# Playability Test Script

Backlink: [[POTATO]]

Use this repeatable human test alongside automated browser coverage. It tests
whether presentation helps a commander understand and navigate the real,
authoritative campaign; it does not score a preferred strategic choice.

## Test Conditions

- Use a clean browser profile for the first-run script. Do not open the Field
  Manual before the exercise begins.
- Use the authored **Staff Exercise** with Standard command pressure and
  Standard staff picture. The exercise must be created from the normal campaign
  setup screen, not from an internal test route.
- Record the scenario, browser viewport, whether guided teaching was hidden,
  and the tester's prior Brass Ledger experience.
- The facilitator may clarify a control only after recording where the tester
  became blocked. Never explain an engine rule before the tester acts.

## First-Run Script

1. Ask the tester to start Staff Exercise and complete all four months using
   only the game. They may open the Field Manual and advanced explainability.
2. At each progression stop, record the exact visible blocker and whether the
   tester found its named route to resolution without help.
3. After the terminal report, ask these questions in the tester's own words:
   - What is staff burden, and why can overloading a staff function matter?
   - Why can a forecast be uncertain rather than an exact fact?
   - When can accepting a recorded risk be rational?
   - What does a chief commitment mean, and what can happen if it is broken?
   - What conditions end or win this campaign?
4. Mark each answer **understood**, **partly understood**, or **not
   understood**. Quote the answer; do not infer understanding from a win.

Pass condition: the tester completes the exercise without external
documentation and answers every question at least partly understood, with no
more than one facilitator intervention for navigation. A failed concept routes
to the matching Field Manual or contextual-teaching copy before adding a new
tutorial rule.

## Month-Five Pacing Script

1. Use an active normal campaign at Month 5 with at least four memos visible.
   Start the timer when the Monthly Brief becomes interactive.
2. Ask the tester to state the top decision trade-off before opening advanced
   explainability, then assemble and commit a packet. Stop timing when the
   authoritative resolve request succeeds.
3. Record:
   - Briefing-to-commit elapsed time.
   - Every stable section reopened or reread, and why it was needed.
   - Every backtrack caused by an unclear progression blocker.
   - Whether the tester identified the top trade-off without advanced detail.
4. Repeat the same route with Compact view enabled. Compact view may collapse
   stable reporting, but the tester must still be able to expand it, select
   every memo option, discuss chiefs, acknowledge risk, and commit manually.

Pass condition: Compact view produces fewer unnecessary stable-section reads or
backtracks than Standard view, while preserving the same authoritative packet,
warnings, chief terms, and available controls for identical selections. Do not
set a raw time target until at least three testers establish a baseline; report
the observed times and friction counts instead.

## Reporting Template

| Tester | Scenario / month | Mode | Time | Stable rereads | Unclear backtracks | Trade-off named before advanced detail? | Interventions | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | Standard / Compact | | | | Yes / No | | Pass / Follow-up |

Attach anonymised findings to the relevant GitHub issue. A finding about an
authoritative rule, save, replay, risk acceptance, or chief term is not a UI
copy fix by default; route it to the engine or server owner first.
