---
type: v2-kestrel-consequence-contract
status: active
---

# Kestrel Consequence Matrix

Backlink: [[README]]

This document is the implementation authority for **#101 — persistent exposure / promise / investment prototype**. It freezes only the concrete Kestrel records and transitions needed by the six-cycle experiment. It is not permission to build a generic consequence framework.

## Product purpose

A consequence must let the player understand:

> “This changed because of what I did, what Ravellan did, or what happened externally — and now I have a different problem.”

Persistent state exists to create ownership, recovery and later callbacks. It must not become a collection of abstract meters.

## Provenance

Every consequence transition carries one of:

- `player-caused` — a final coalition order directly created the change;
- `player-conditioned` — an adversary/external event occurred, but prior coalition history changed its severity or available response;
- `adversary-caused` — Ravellan directly created the change;
- `external` — neither side directly caused the event.

Presentation may reveal only belief-safe attribution. Truth provenance remains authoritative/replayable but is not automatically player-visible.

## Concrete Kestrel records

### `beacon-exposure`

States:

`contained → thin → open`

Opening: `thin`.

Exposure is current vulnerability. Improve/worsen one step where authored below and clamp at endpoints.

### `beacon-preparation`

States:

- `routine`
- `prepared`

Opening: `routine`.

Preparation is whether HQ has done the work needed to execute a credible denial plan. It is intentionally separate from current exposure.

### `reserve-condition`

States:

`usable → strained → brittle`

Opening: `usable`.

Worsen/recover one step where authored below; clamp at endpoints. `brittle` is not an automatic loss, but makes brute-force terminal action weak unless prior preparation exists.

### `partner-consent`

States:

`cooperative → uneasy → conditional → withdrawn`

Opening: `cooperative`.

Routine reassurance/consultation can improve `uneasy` or `conditional` one step but cannot repair `withdrawn`.

The **only Kestrel recovery from `withdrawn`** is the explicit Cycle-5 `political-concession`, which restores immediate consent to `conditional` at a severe terminal cost. This is the authored anti-death-spiral political recovery path; it does not erase how the relationship collapsed.

### `consultation-promise`

States:

- `none`
- `active`
- `honoured`
- `breached`

Opening: `none`.

Only the explicit formal-consultation course creates the promise. `honoured`/`breached` are terminal history states for the slice.

### `political-concession`

States:

- `none`
- `active`

Opening: `none`.

The concession can recover immediate partner access, including from `withdrawn`, but always remains a terminal severe cost and constraint.

### `liaison-obligation`

States:

- `none`
- `active`
- `fulfilled`
- `breached`

Opening: `none`.

Created only by the non-Lattice emergency liaison path.

### `lattice-investment`

States:

`0 → 1 → 2 → 3-operational`

Opening: `0`.

Only the scheduled Cycle-1/2/3 protected advances progress it. Missing any scheduled advance permanently prevents maturity during Kestrel.

### `attribution-opportunity`

States:

- `none`
- `tentative`
- `credible`
- `used`
- `expired`

Opening: `none`.

Derived only from legitimate HQ evidence; hidden Ravellan truth alone can never advance it.

## Transition helpers

“Improve one” / “worsen one” means exactly one step on the record above and clamps at the endpoint.

Repeated attempted strain/pressure still records a causal transition/effect even if the state is already clamped, because authoritative history can matter for consequence explanation and Ravellan observation emission.

## Significant visible reserve deployment

For this slice, count only these authored coalition orders as a **significant visible reserve deployment**:

- Cycle-2 `visible-patrol-surge`;
- Cycle-3 `forward-reserve-preparation` when authored as publicly detectable;
- Cycle-4 `press-visible-advantage`;
- Cycle-5 `visible-reinforce-beacon`;
- Cycle-5 `keep-reserve-forward` when the order continues/renews a visibly forward reserve posture.

Cycle-1 reinforced watch and Cycle-2 quiet escort may strain the reserve but do **not** count toward this visible-deployment counter.

When the second significant visible deployment occurs in canonical history, emit `reserve_exhaustion_signal = suspected` for Ravellan at the normal next-cycle timing. Later qualifying deployments may refresh that authored signal; they do not create a numeric exhaustion score.

## Cycle 1

### Ordinary Beacon watch

- no direct persistent-state improvement;
- `beacon-exposure` remains `thin` at opening;
- emit the explicit authored `beacon_coverage_signal = weak` for Ravellan next cycle, per [[21-KESTREL-SIX-CYCLE-CANON]].

This is an observed thin posture, not inference from missing data.

### Reinforce Beacon watch

Player-caused:

- improve `beacon-exposure` one (`thin → contained` at opening);
- worsen `reserve-condition` one;
- emit `beacon_coverage_signal = credible`.

Do not emit `visible_denial_signal = demonstrated`; reinforced watch is detectable coverage, not the canonical public deterrence surge.

### Informal partner liaison

No promise; no automatic partner-state change.

### Formal consultation agreement

Player-caused:

- `consultation-promise: none → active`;
- improve partner one step only if it had somehow already deteriorated below cooperative;
- emit `coalition_unity_signal = coherent` only where the authored consultation is publicly/detectably joint. A private conversation alone does not emit it.

### Protect Lattice 1

`0 → 1`.

If the Cycle-1 advance is not protected, record deterministic missed-schedule state and make Kestrel maturity unreachable.

## Cycle 2 — shipping pressure

### Quiet escort

Player-caused:

- if Cycle-1 reinforced watch already worsened reserve, worsen `reserve-condition` one again; otherwise no persistent reserve step;
- emit `visible_denial_signal = withheld` because the coalition deliberately avoids a demonstrative response;
- visible shipping delay remains as a consequence beat.

This compound rule makes quiet escort cheap from a fresh reserve but costly after the commander already spent readiness on the opening watch.

### Visible patrol surge

Player-caused:

- worsen `reserve-condition` one;
- worsen `partner-consent` one if the surge lacks active/joint consultation authority;
- emit `visible_denial_signal = demonstrated`;
- emit `beacon_coverage_signal = credible` where the patrol covers Beacon approaches;
- count one significant visible reserve deployment and emit exhaustion suspicion if this reaches the second such deployment.

### Reroute and monitor

Player-caused:

- worsen `partner-consent` one if the civilian disruption is not jointly accepted;
- emit `visible_denial_signal = withheld` because the public posture avoids direct contest;
- do not worsen reserve;
- show civilian/shipping disruption as the visible cost.

## Cycle 2 — attribution / politics

### Silence

No persistent transition.

### Joint non-attributive warning

Player-caused:

- improve `partner-consent` one if currently `uneasy` or `conditional`, capped at cooperative;
- cannot repair withdrawn;
- emit `coalition_unity_signal = coherent` where visibly joint;
- do not consume attribution opportunity because no specific accusation is made.

### Public accusation

A specific accusation is legal only according to the authored agenda/belief rules.

If unilateral while `consultation-promise = active`:

- `active → breached`;
- worsen `partner-consent` one;
- emit `coalition_unity_signal = fractured` where the breach becomes detectably consequential.

If jointly authorised, do not breach the promise.

If specific enough to reveal that HQ may have identified Ravellan activity, emit `ravellan_discovery_signal = suspected`.

Choosing to accuse never creates `credible` attribution by itself.

### Protect Lattice 2

Legal only if the scheduled Cycle-1 advance succeeded:

`1 → 2`.

Otherwise maturity remains unreachable.

## Cycle 3

### Forward reserve preparation

Player-caused:

- `beacon-preparation: routine → prepared`;
- worsen `reserve-condition` one;
- emit `beacon_coverage_signal = credible` where publicly/detectably forward;
- count as a significant visible reserve deployment only where that forward movement is visible, refreshing/emitting exhaustion suspicion at the canonical threshold.

It does not automatically emit `visible_denial_signal = demonstrated`; content must distinguish quiet forward positioning from demonstrative action.

### Hold reserve

No direct persistent transition and no inferred adversary observation from silence.

### Focus existing collection

Player-caused:

- queue the fixed `staging-area-focus` result under [[23-HQ-BELIEF-AND-EVIDENCE]] for Cycle 4;
- worsen `beacon-exposure` one because current coverage is diverted to collection.

This is a normal intervention, not Lattice Task Collection.

### Reassure partner

Player-caused:

- improve `partner-consent` one if `uneasy` or `conditional`;
- cannot repair `withdrawn`;
- cannot erase a breached promise;
- may emit `coalition_unity_signal = coherent` where the reassurance becomes visibly joint/coherent.

### Protect Lattice 3

Legal only after scheduled advances 1 and 2:

`2 → 3-operational`.

Otherwise Lattice remains non-operational.

## Cycle 4

### Recover reserve

Player-caused:

- improve `reserve-condition` one;
- worsen `beacon-exposure` one;
- emit `beacon_coverage_signal = weak` if the pullback is detectably thinning Beacon coverage.

This is canonical costly recovery: endurance is bought with immediate security.

### Prepare Beacon quietly

Player-caused:

- `beacon-preparation: routine → prepared`;
- improve `beacon-exposure` one;
- emit `beacon_coverage_signal = credible` where the strengthened coverage is detectable;
- do not emit visible denial by default.

### Press visible advantage

Player-caused:

- worsen `reserve-condition` one;
- emit `visible_denial_signal = demonstrated`;
- emit `beacon_coverage_signal = credible`;
- worsen `partner-consent` one if not covered by consultation/joint authority;
- count significant visible reserve deployment and apply exhaustion-signal threshold.

### Lattice Task Collection

No generic stat transition. Queue exactly one legal target under [[26-LATTICE-COLLECTION-MATRIX]].

### Emergency partner liaison

Player-caused:

- `liaison-obligation: none → active`;
- consumes one normal commander intervention;
- queues the narrower `auxiliary-tasking` result under [[26-LATTICE-COLLECTION-MATRIX]].

No generic intelligence/partner bonus.

## Cycle 5 — Beacon posture

### Quiet reinforce Beacon

Player-caused:

- improve `beacon-exposure` one;
- `beacon-preparation: routine → prepared`;
- worsen `reserve-condition` one if the authored order materially commits reserve forces;
- emit `beacon_coverage_signal = credible` where detectable;
- do not emit visible denial by default.

### Visible reinforce Beacon

Player-caused:

- improve `beacon-exposure` one;
- `beacon-preparation: routine → prepared`;
- worsen `reserve-condition` one;
- emit `visible_denial_signal = demonstrated`;
- emit `beacon_coverage_signal = credible`;
- if not legitimately covered by partner consultation, worsen partner one and breach an active consultation promise where applicable;
- count significant visible reserve deployment and apply exhaustion-signal threshold.

### Hold current Beacon posture

No direct improvement; existing exposure/preparation remain.

## Cycle 5 — partner / commitments

### Honour consultation

If promise is active:

- `consultation-promise: active → honoured`;
- improve partner one if not withdrawn;
- emit `coalition_unity_signal = coherent` where the joint position is detectable.

If no formal promise exists, the authored consultation can still improve `uneasy`/`conditional` one but creates no retrospective promise history.

It cannot repair withdrawn.

### Act then inform

If promise is active:

- `active → breached`;
- worsen partner one;
- emit `coalition_unity_signal = fractured` where detectably consequential.

The associated order buys only its explicit authored operational freedom; there is no generic tempo resource.

### Political concession

Player-caused:

- `political-concession: none → active`;
- if partner is `withdrawn`, set to `conditional`;
- if partner is `conditional`, `uneasy`, or `cooperative`, leave the stronger/current state unchanged rather than degrading it to conditional;
- fulfil `liaison-obligation` only when the authored concession/consultation explicitly satisfies that obligation.

This is the only Kestrel route that can restore immediate partner access from `withdrawn`. The concession remains a severe terminal cost.

## Cycle 5 — reserve

### Keep reserve forward

Player-caused:

- worsen `reserve-condition` one;
- `beacon-preparation: routine → prepared` if not already prepared;
- emit `beacon_coverage_signal = credible` where detectable;
- count/refresh significant visible reserve deployment where this order visibly keeps/renews the forward posture.

### Emergency consolidation

Player-caused:

- improve `reserve-condition` one;
- worsen `beacon-exposure` one;
- emit `beacon_coverage_signal = weak` if the drawdown is detectable.

This remains legal through Cycle 5 and is the canonical reserve anti-death-spiral recovery.

## Cycle 5 — attribution

### Use credible attribution opportunity

Legal only when `attribution-opportunity = credible`.

Player-caused:

- `credible → used`;
- improve partner one if partner is not withdrawn and the attribution is jointly/politically usable;
- emit `ravellan_discovery_signal = suspected`;
- emit `coalition_unity_signal = coherent` where jointly backed.

Any source sacrifice is an explicit authored terminal/debrief cost only if later content specifies it; do not invent an intelligence-resource meter.

## Attribution opportunity derivation

Derive after HQ belief updates from [[23-HQ-BELIEF-AND-EVIDENCE]]:

- no active directional evidence → `none`;
- active directional indicator, but no uncontradicted corroborating evidence → `tentative`;
- at least one active relevant `corroborating` item and no active material opposite-direction evidence → `credible`;
- after use → `used`;
- if the qualifying evidence expires/supersedes before use → recompute to the weaker reachable state or `expired` when a previously credible window closes.

World truth alone cannot advance the opportunity.

## Liaison obligation

Cycle-4 liaison creates `active`.

It becomes `fulfilled` if the player later honours the specific partner consultation/obligation through an authored compatible consultation or concession course.

It becomes `breached` if an explicitly incompatible unilateral course occurs first.

If still `active` at terminal resolution, treat it as an outstanding commitment cost, not an automatic breach.

## Terminal severe-cost flags

[[27-KESTREL-TERMINAL-MATRIX]] treats the campaign as carrying a severe self-cost when one or more of these authoritative histories is true:

- reserve ends `brittle`;
- consultation promise is `breached`;
- political concession is `active`;
- liaison obligation is `breached`;
- immediate partner access survives only through the costly concession/breach history specified by terminal rules;
- the final route creates the authored `overreaction` condition;
- terminal physical denial succeeds only through an explicitly costly fallback caused by earlier warning/exposure failure.

Do not sum these into a player score.

## Recovery invariant

Before Cycle 6, deteriorating dimensions retain the authored painful response where applicable:

- reserve strain/brittleness → emergency consolidation;
- partner deterioration short of withdrawal → reassurance/consultation; withdrawal → Cycle-5 political concession;
- Beacon exposure → reachable quiet/visible preparation/reinforcement;
- missed Lattice → narrower partner liaison counterplay.

Recovery changes the current problem and preserves history; it does not erase mistakes.

## Required #101 tests

At minimum prove:

- every record starts in the canonical opening state;
- every authored transition above is deterministic and provenance-tagged;
- Cycle-1 ordinary/reinforced watch emits exactly weak/credible coverage respectively;
- significant visible reserve deployment count uses only the frozen order list and emits exhaustion suspicion at the second qualifying history point;
- promise is never created implicitly and breach never erases promise history;
- normal reassurance cannot repair withdrawn partner consent;
- political concession is the only Kestrel recovery from withdrawn → conditional and remains a severe cost;
- reserve recovery improves one step while worsening Beacon exposure;
- Lattice cannot catch up after a missed scheduled advance;
- attribution credibility is derived only from HQ evidence, never hidden truth;
- external/adversary-caused events can be player-conditioned without being mislabeled player-caused;
- every reachable non-terminal deteriorating state retains the authored counterplay promised above unless it resulted from an explicit accumulated avoidable chain being tested as the Cycle-6 reckoning;
- V1 campaign state remains unchanged.

## Rejection conditions

Reject #101 if it introduces a universal consequence score, morality/trust meter, generic lifecycle framework, implicit promise, silent recovery from withdrawn consent, unavoidable pre-terminal death spiral, hidden-truth-derived attribution, or UI-owned state transition.
