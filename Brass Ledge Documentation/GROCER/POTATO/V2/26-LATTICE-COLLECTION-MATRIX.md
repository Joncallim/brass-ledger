---
type: v2-lattice-contract
status: active
---

# Lattice Collection Matrix

Backlink: [[README]]

This document is the implementation authority for **#102 — institutional capability prototype** and the Kestrel Task Collection content it unlocks. It is deliberately one capability, not a technology-tree framework.

## Product purpose

Lattice must feel valuable because it gives the commander a **new way to act**, not because it raises an intelligence score.

The payoff is:

> “I protected this institution for three command windows, and now I can ask a specific question without spending one of my normal personal interventions.”

## Investment schedule

Lattice has exactly three required protected advances:

- Cycle 1: advance one;
- Cycle 2: advance two;
- Cycle 3: advance three.

All three must occur on schedule.

If any scheduled advance is missed, Lattice cannot become operational during the Kestrel slice. There is no catch-up, accelerated investment, partial bonus or refund.

Successful sequence:

`0 → 1 → 2 → 3-operational`

Lattice becomes operational for Cycle 4.

## What operational Lattice unlocks

Operational Lattice adds exactly one new action family:

`task-collection`

Task Collection:

- is available in Cycles 4 and 5 only;
- does not consume one of the two normal commander intervention tokens;
- may target one eligible named unresolved question per cycle;
- creates one authored collection task in the authoritative command ledger/state;
- resolves at the next canonical HQ-belief update;
- enters HQ belief through the ordinary evidence path in [[23-HQ-BELIEF-AND-EVIDENCE]];
- never reveals hidden Ravellan posture/preparation directly;
- never sets a recommendation directly;
- never grants a generic `+intel`, reroll or percentage bonus.

Task Collection is not available in Cycle 6 because the Kestrel slice has no later command window in which its evidence can become useful.

## Named Kestrel targets

Exactly three Lattice target IDs exist:

### `landing-force-staging`

Question:

> Are units required for a Beacon seizure actually concentrating?

### `auxiliary-tasking`

Question:

> Are the vessels pressuring shipping operating as part of a military plan or primarily coercive pressure?

### `political-operational-sync`

Question:

> Are Ravellan political messages and operational activity aligned to a common timeline?

No free-text tasking exists in the prototype.

## Eligibility

A target is eligible when:

- Lattice is operational;
- the current cycle is 4 or 5;
- no unresolved task is already queued for the same cycle;
- the question is still materially unresolved by active HQ evidence;
- the target has not already produced a Kestrel result authored as conclusive for the remainder of the slice.

The engine/content validator must determine eligibility from authoritative evidence/state, not from UI wording.

## Collection timing

When the commander tasks a target in Cycle N:

1. the task is persisted as authoritative action/state evidence during Cycle N;
2. no immediate HQ assessment change occurs;
3. the collection result is derived at the next canonical HQ-belief update in Cycle N+1 from the legitimately observable world conditions for that target;
4. the result creates the authored evidence item below;
5. HQ assessment is recomputed through [[23-HQ-BELIEF-AND-EVIDENCE]].

The result may reflect activity that occurred during the collection interval, including legitimate observable effects of Ravellan's intervening policy action. It must not read future player input.

Replay recomputes/validates the task result against the same authoritative world/policy history; a saved collection result is not trusted merely because it was persisted.

## Result matrix — `landing-force-staging`

The result is based on actual Ravellan preparation/posture conditions observable through this collection target at resolution time, not on the HQ's prior belief.

### Real operational preparation is materially underway

If Ravellan is `genuine_preparation` and seizure preparation is `developing` or `ready`:

Evidence ID: `lattice-landing-concentration`

- implication: `preparation`;
- diagnostic class: `corroborating`;
- player-safe summary: landing elements associated with prior seizure exercises are concentrating near embarkation areas.

This evidence does not state the hidden posture or preparation enum.

### No seizure force concentration

If Ravellan is `coercive_feint` and no hidden seizure preparation is underway:

Evidence ID: `lattice-landing-dispersed`

- implication: `coercion`;
- diagnostic class: `corroborating`;
- player-safe summary: units required for a rapid Beacon seizure remain dispersed rather than concentrating.

### Testing / incomplete picture

If Ravellan is `testing`, or the world state does not satisfy either authored result above:

Evidence ID: `lattice-landing-inconclusive`

- implication: `ambiguous`;
- diagnostic class: `indicator`;
- player-safe summary: readiness activity is elevated in places, but no clear seizure-force concentration can be established.

Do not convert a negative collection result into certainty that Ravellan will not later change posture.

## Result matrix — `auxiliary-tasking`

### Military operational integration detected

If Ravellan is `genuine_preparation` and current world action/history has integrated auxiliary pressure with seizure preparation:

Evidence ID: `lattice-auxiliary-integrated`

- implication: `preparation`;
- diagnostic class: `indicator`;
- summary: auxiliary vessels appear to be receiving tasking consistent with a wider military operation.

### Primarily coercive/political tasking

If Ravellan is `coercive_feint` and no genuine preparation has begun:

Evidence ID: `lattice-auxiliary-coercive`

- implication: `coercion`;
- diagnostic class: `corroborating`;
- summary: the shipping pressure remains tied primarily to coercive/political tasking rather than a seizure sequence.

### Mixed/unclear tasking

If Ravellan is `testing` or authored state is mixed:

Evidence ID: `lattice-auxiliary-mixed`

- implication: `ambiguous`;
- diagnostic class: `indicator`;
- summary: tasking crosses auxiliary and military channels, but the pattern does not establish a common operational plan.

## Result matrix — `political-operational-sync`

### Common timeline indicators

If Ravellan is `genuine_preparation` and authored political/operational activity is synchronised:

Evidence ID: `lattice-sync-aligned`

- implication: `preparation`;
- diagnostic class: `indicator`;
- summary: political messaging changes are aligning with operational milestones rather than moving independently.

### Political pressure not matched by operational timeline

If Ravellan is `coercive_feint` and no seizure preparation is underway:

Evidence ID: `lattice-sync-decoupled`

- implication: `coercion`;
- diagnostic class: `indicator`;
- summary: the political pressure is not matched by a corresponding military preparation timeline.

### Partial/unclear synchronisation

If Ravellan is `testing` or neither authored condition above applies:

Evidence ID: `lattice-sync-partial`

- implication: `ambiguous`;
- diagnostic class: `indicator`;
- summary: some activity aligns, but not enough to establish whether the political and operational tracks share one timetable.

## Result independence and contradictions

Lattice does not delete contradictory prior evidence automatically.

Examples:

- an earlier coercion indicator plus `lattice-landing-concentration` produces active evidence on both sides unless an authored supersession rule explicitly retires the old item; HQ therefore becomes `unclear + conflicted` rather than magically certain;
- a corroborating result may later be superseded by a legitimately newer observation if Kestrel content explicitly authors that lifecycle.

This is intentional. Better collection can reveal that the world changed after an earlier assessment.

## Emergency partner-liaison fallback

If Lattice is not operational in Cycle 4, Kestrel offers one narrower fallback:

`request-partner-liaison`

Rules:

- consumes one normal commander intervention;
- creates `liaison-obligation = active` under [[25-KESTREL-CONSEQUENCE-MATRIX]];
- queues one result for Cycle 5;
- does not unlock a reusable capability;
- does not provide a choice among all three Lattice targets.

The Kestrel liaison can answer only:

`auxiliary-tasking`

because the partner has useful local access to the shipping/auxiliary pressure but not the same protected fusion/collection reach as Lattice.

### Liaison result matrix

The liaison uses the same world conditions as the Lattice `auxiliary-tasking` target, but its evidence is narrower:

- genuine preparation/integration → `liaison-auxiliary-military-links`, implication `preparation`, diagnostic class `indicator`;
- coercive feint → `liaison-auxiliary-coercive-links`, implication `coercion`, diagnostic class `indicator`;
- testing/mixed → `liaison-auxiliary-unclear`, implication `ambiguous`, diagnostic class `indicator`.

The fallback therefore provides useful information but cannot by itself create the same `coherent` assessment that a Lattice corroborating result can.

## Interaction with attribution opportunity

Lattice does not directly create `attribution-opportunity`.

After its evidence enters HQ belief, [[25-KESTREL-CONSEQUENCE-MATRIX]] derives whether the evidence supports `tentative` or `credible` attribution.

A task that produces corroborating preparation evidence can therefore make Cycle-5 attribution reachable, but only through the shared belief/evidence path.

## Interaction with recommendations

Task Collection never directly changes the recommendation.

The next HQ assessment may change; [[24-STAFF-RECOMMENDATION-POLICY]] then recomputes recommendations from that updated belief.

This separation must be testable.

## Replay and ledger requirements

Persist/replay:

- scheduled Lattice advances;
- missed-advance reachability state where required;
- operational state;
- task target ID and task cycle;
- queued/resolved task state;
- resulting evidence ID;
- liaison action/obligation/result where used.

Trusted replay must reject:

- tasking before Lattice maturity;
- catch-up advancement after a missed scheduled cycle;
- two Lattice tasks in one cycle;
- a Cycle-6 task;
- changing the saved target/result to one not produced by the canonical result matrix;
- a liaison result with `corroborating` diagnostic class;
- any result that directly mutates hidden Ravellan state or sets an HQ assessment without evidence reduction.

## Required #102 tests

At minimum prove:

- exact 1→2→3 on-schedule maturity;
- any missed advance prevents Kestrel maturity;
- operational Lattice changes legal action space in Cycle 4;
- Task Collection costs zero normal intervention tokens;
- only one eligible target can be tasked per cycle;
- each target/result branch is deterministic and belief-safe;
- no result contains hidden posture/preparation IDs in player projection;
- collection result enters the same evidence reduction used by ordinary observations;
- contradictory evidence is preserved unless explicitly superseded;
- liaison is available as narrower counterplay without Lattice, consumes one intervention and creates an obligation;
- liaison cannot produce a `corroborating` result;
- Lattice is advantageous but no test assumes it is mandatory for a viable terminal route;
- V1 programme/capability systems remain unchanged.

## Rejection conditions

Reject #102 if it becomes a tech tree, adds capability points, grants a generic intelligence modifier, reveals hidden truth, consumes no meaningful prior investment, eliminates the non-Lattice counterplay path, or generalises to arbitrary collection targets.
