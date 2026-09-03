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

The three collection targets must also be mechanically different questions. They are not three labels for “tell me Ravellan's posture”.

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

Exactly three Lattice target IDs exist.

### `landing-force-staging`

Question:

> Are units required for a Beacon seizure actually concentrating?

This is the best target for confirming **physical preparation**.

### `auxiliary-tasking`

Question:

> Are the vessels pressuring shipping being integrated into a wider military operation or primarily used for coercive pressure?

This is the best target for confirming **coercive tasking** when the pressure remains political/auxiliary.

### `political-operational-sync`

Question:

> Are Ravellan's recent political-pressure and operational actions converging on one timeline?

This target looks for a **temporal pattern across recent Ravellan actions**. It can reveal accumulating preparation that one point-in-time collection target misses, but is less useful when the recent sequence is mixed.

No free-text tasking exists in the prototype.

## Eligibility

A target is eligible when:

- Lattice is operational;
- the current cycle is 4 or 5;
- no unresolved task is already queued for the same cycle;
- the question is still materially unresolved by active HQ evidence;
- the exact target has not already produced a Kestrel result authored as conclusive for the remainder of the slice.

A coherent overall `ravellan-intent` assessment does **not** automatically make all remaining target questions ineligible. A different named question may still matter if its result can create a contradictory/current evidence item or change attribution/final-route availability.

The engine/content validator must determine eligibility from authoritative evidence/state, not from UI wording.

## Collection timing

When the commander tasks a target in Cycle N:

1. the task is persisted as authoritative action/state evidence during Cycle N;
2. no immediate HQ assessment change occurs;
3. the result is derived at the next canonical HQ-belief update in Cycle N+1 from only the specific world/history facts that target is authored to observe;
4. the result creates the authored evidence item below;
5. HQ assessment is recomputed through [[23-HQ-BELIEF-AND-EVIDENCE]].

The result may reflect activity that occurred during the collection interval, including legitimate observable effects of Ravellan's intervening policy action. It must not read future player input.

Replay recomputes/validates the task result against the same authoritative world/policy history; a saved collection result is not trusted merely because it was persisted.

All directional Lattice/liaison results below remain active through terminal resolution unless a later explicit authored result supersedes the same named question.

## Result matrix — `landing-force-staging`

This target observes physical concentration, not political intent.

### Seizure force is materially concentrating

If Ravellan seizure preparation is `developing` or `ready` at resolution:

Evidence ID: `lattice-landing-concentration`

- implication: `preparation`;
- diagnostic class: `corroborating`;
- player-safe summary: landing elements associated with prior seizure exercises are concentrating near embarkation areas.

This result is possible regardless of how Ravellan is publicly describing the pressure. It does not expose the preparation enum.

### No concentration under a coercive-feint posture

If seizure preparation is `none` and current posture is `coercive_feint`:

Evidence ID: `lattice-landing-dispersed`

- implication: `coercion`;
- diagnostic class: `indicator`;
- player-safe summary: the force package required for a rapid Beacon seizure remains dispersed rather than concentrating.

This is deliberately only an indicator: absence of concentration now does not prove Ravellan cannot later exploit an opening.

### Testing / incomplete physical picture

Otherwise:

Evidence ID: `lattice-landing-inconclusive`

- implication: `ambiguous`;
- diagnostic class: `indicator`;
- player-safe summary: readiness activity is elevated in places, but no clear seizure-force concentration can be established.

## Result matrix — `auxiliary-tasking`

This target reads the tasking relationships around the vessels currently creating pressure. It is deliberately asymmetric with landing-force collection.

Use the Ravellan posture and the **most recent normal Ravellan action executed during the collection interval** only to determine which authored observable tasking pattern exists.

### Coercive tasking is coherent

If current posture is `coercive_feint` and the most recent normal Ravellan action is `probe_shipping` or `seed_deception`:

Evidence ID: `lattice-auxiliary-coercive`

- implication: `coercion`;
- diagnostic class: `corroborating`;
- summary: auxiliary shipping pressure is being directed through a coherent coercive/political tasking chain rather than a seizure-force command sequence.

### Auxiliary pressure is integrated with genuine preparation

If current posture is `genuine_preparation` and the most recent normal Ravellan action is `probe_shipping`:

Evidence ID: `lattice-auxiliary-integrated`

- implication: `preparation`;
- diagnostic class: `indicator`;
- summary: the vessels pressuring shipping appear to be receiving tasking consistent with a wider military preparation effort.

It is only an indicator because an auxiliary tasking pattern alone cannot establish that the physical seizure force is ready.

### Deception / quiet preparation / mixed tasking

Otherwise—including `testing`, a most-recent `seed_deception` under genuine preparation, `prepare_beacon_seizure`, or `pause_consolidate` without an observable auxiliary integration pattern—produce:

Evidence ID: `lattice-auxiliary-mixed`

- implication: `ambiguous`;
- diagnostic class: `indicator`;
- summary: tasking crosses auxiliary and military channels, but the pattern does not establish whether the shipping pressure belongs to one operational plan.

This is intentional: a well-chosen target can still return uncertainty.

## Result matrix — `political-operational-sync`

This target examines the **two most recent normal Ravellan actions available in verified policy history at result time**. If fewer than two exist, use the available history and fall through to the weaker/ambiguous cases.

### Repeated preparation sequence

If both of the two most recent normal actions are `prepare_beacon_seizure`:

Evidence ID: `lattice-sync-preparation-sequence`

- implication: `preparation`;
- diagnostic class: `corroborating`;
- summary: recent operational milestones are forming a sustained sequence rather than isolated activity.

### One recent preparation action in a mixed sequence

If exactly one of the two most recent normal actions is `prepare_beacon_seizure`:

Evidence ID: `lattice-sync-preparation-signal`

- implication: `preparation`;
- diagnostic class: `indicator`;
- summary: one recent operational milestone aligns with the pressure campaign, but the wider sequence remains mixed.

### Sustained coercive sequence

If neither of the two most recent actions is `prepare_beacon_seizure`, current posture is `coercive_feint`, and at least one of those actions is `probe_shipping` or `seed_deception`:

Evidence ID: `lattice-sync-coercive-sequence`

- implication: `coercion`;
- diagnostic class: `corroborating`;
- summary: the recent sequence is sustaining political/coercive pressure without corresponding seizure-preparation milestones.

### Mixed / testing sequence

Otherwise:

Evidence ID: `lattice-sync-partial`

- implication: `ambiguous`;
- diagnostic class: `indicator`;
- summary: some activity aligns, but the recent sequence does not establish whether the political and operational tracks share one timetable.

## Target-choice differentiation

The target choice must matter mechanically in at least some reachable histories.

Examples:

- with physical preparation already `developing` but only one recent prepare action, `landing-force-staging` can produce `preparation + coherent` while `political-operational-sync` produces only a preparation indicator;
- under a coercive feint with active shipping/deception pressure, `auxiliary-tasking` or a sustained sync sequence can corroborate coercion while landing-force staging only provides a weaker coercion indicator;
- under mixed/testing histories, a target may return ambiguous evidence while another target can legitimately find a directional pattern.

#107 Decision Elasticity must branch Lattice target choices from identical pre-task states and flag a target that never changes later assessment, attribution opportunity, recommendation, terminal route or outcome relative to the others.

Do not fix a fake target by adding random result variance.

## Result independence and contradictions

Lattice does not delete contradictory prior evidence automatically.

A new targeted result supersedes an older result only when it answers the **same target** and content explicitly records the newer result as replacing the older observation. Evidence from a different question remains independently active until its own lifecycle expires.

Examples:

- `focused-staging-buildup` from Cycle 4 plus a later coercive auxiliary result legitimately creates active evidence in both directions → `unclear + conflicted`;
- landing concentration and a coercive sync result may conflict if Ravellan's world changed or its pressure/deception sequence remains inconsistent; HQ must show the conflict rather than select hidden truth.

Better collection can reveal that the world is genuinely mixed or changing.

## Emergency partner-liaison fallback

If Lattice is not operational in Cycle 4, Kestrel offers one narrower fallback:

`request-partner-liaison`

Rules:

- consumes one normal commander intervention;
- creates `liaison-obligation = active` under [[25-KESTREL-CONSEQUENCE-MATRIX]];
- queues one result for Cycle 5;
- does not unlock a reusable capability;
- answers only `auxiliary-tasking`;
- can never produce `corroborating` evidence.

Resolve the same auxiliary-tasking observable conditions above, but downgrade the result to narrower indicator evidence:

- coercive-tasking condition → `liaison-auxiliary-coercive-links`, implication `coercion`, diagnostic class `indicator`;
- genuine-preparation integrated condition → `liaison-auxiliary-military-links`, implication `preparation`, diagnostic class `indicator`;
- otherwise → `liaison-auxiliary-unclear`, implication `ambiguous`, diagnostic class `indicator`.

The fallback therefore provides useful direction where conditions permit but cannot by itself create `coherent` HQ belief or the same attribution reach as a corroborating Lattice result.

## Interaction with attribution opportunity

Lattice does not directly create `attribution-opportunity`.

After its evidence enters HQ belief, [[25-KESTREL-CONSEQUENCE-MATRIX]] derives whether evidence supports `tentative` or `credible` attribution.

A corroborating Lattice result with no active contradiction can therefore make Cycle-5/terminal `credible` attribution reachable. Indicator-only or conflicted results cannot.

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
- exact world/history inputs the target is authorised to observe or deterministic references sufficient to recompute them;
- resulting evidence ID;
- liaison action/obligation/result where used.

Trusted replay must reject:

- tasking before Lattice maturity;
- catch-up advancement after a missed scheduled cycle;
- two Lattice tasks in one cycle;
- a Cycle-6 task;
- changing the saved target/result to one not produced by the canonical result matrix;
- a liaison result with `corroborating` diagnostic class;
- using a world field/action outside the target's explicitly authorised observation rule;
- any result that directly mutates hidden Ravellan state or sets an HQ assessment without evidence reduction.

## Required #102 tests

At minimum prove:

- exact 1→2→3 on-schedule maturity;
- any missed advance prevents Kestrel maturity;
- operational Lattice changes legal action space in Cycle 4;
- Task Collection costs zero normal intervention tokens;
- only one eligible target can be tasked per cycle;
- every branch in all three target matrices is deterministic and belief-safe;
- target-result functions read only the specific authorised world/action-history facts listed above;
- no result contains hidden posture/preparation IDs in player projection;
- collection result enters the same evidence reduction used by ordinary observations;
- contradictory evidence is preserved unless an exact same-target newer result explicitly supersedes it;
- at least two reachable identical-prestate target-choice branches produce different downstream mechanical effects, proving the three targets are not merely prose variants;
- liaison is available as narrower counterplay without Lattice, consumes one intervention and creates an obligation;
- liaison cannot produce a `corroborating` result;
- Lattice is advantageous but at least one non-Lattice history reaches non-defeat;
- V1 programme/capability systems remain unchanged.

## Rejection conditions

Reject #102 if it becomes a tech tree, adds capability points, grants a generic intelligence modifier, reveals hidden truth, consumes no meaningful prior investment, makes every collection target equivalent, adds random variance to disguise fake choice, eliminates the non-Lattice counterplay path, or generalises to arbitrary collection targets.
