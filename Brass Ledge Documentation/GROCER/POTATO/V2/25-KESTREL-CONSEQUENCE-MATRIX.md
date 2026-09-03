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

- `player-caused` — the player's final order directly created the change;
- `player-conditioned` — an external/adversary event occurred, but prior player state changed its severity or available response;
- `adversary-caused` — Ravellan directly created the change;
- `external` — neither side directly caused the event.

Presentation may reveal only belief-safe attribution. Truth provenance remains authoritative/replayable but is not automatically player-visible.

## Concrete Kestrel records

Implement the following records as explicit discriminated Kestrel state. Do not abstract them into a universal meter/lifecycle before another scenario independently requires the same semantics.

### Beacon exposure

Stable ID: `beacon-exposure`

Internal states:

`contained → thin → open`

Opening state: `thin`.

Meaning:

- `contained`: current coverage/position makes a quick opportunistic move materially harder;
- `thin`: Beacon can be defended with warning/preparation but remains exploitable;
- `open`: current posture leaves a serious exploitable gap.

Movement is authored only by the transitions below. Clamp at endpoints; never wrap.

### Beacon preparation

Stable ID: `beacon-preparation`

States:

- `routine`
- `prepared`

Opening: `routine`.

This is deliberately separate from exposure. Exposure is current vulnerability; preparation is whether HQ has done the work needed for a credible denial plan.

### Reserve condition

Stable ID: `reserve-condition`

States:

`usable → strained → brittle`

Opening: `usable`.

A worsening transition moves one step right; recovery moves one step left. Clamp at endpoints.

`brittle` is not an automatic loss. It makes later brute-force action costly or insufficient unless other preparation exists.

### Partner consent

Stable ID: `partner-consent`

States:

`cooperative → uneasy → conditional → withdrawn`

Opening: `cooperative`.

Worsening/improvement moves one authored step unless a specific transition below sets a state directly. `withdrawn` cannot be repaired during Kestrel except through no authored route; the no-doomed-seed rule therefore requires content/lab proof that players are not forced there before Cycle 6 without avoidable decisions.

### Consultation promise

Stable ID: `consultation-promise`

States:

- `none`
- `active`
- `honoured`
- `breached`

Opening: `none`.

No implicit promises. Only the formal consultation order creates `active`.

Once `honoured` or `breached`, the record is terminal for the six-cycle slice.

### Political concession

Stable ID: `political-concession`

States:

- `none`
- `active`

Opening: `none`.

This is a costly recovery record. It buys immediate partner support but constrains the terminal political outcome and contributes to costly success.

### Liaison obligation

Stable ID: `liaison-obligation`

States:

- `none`
- `active`
- `fulfilled`
- `breached`

Opening: `none`.

Created only by the non-Lattice emergency partner-liaison path. It is not the same as the opening consultation promise.

### Lattice investment

Stable ID: `lattice-investment`

States:

`0 → 1 → 2 → 3-operational`

Opening: `0`.

Only the authored protected-Lattice order in Cycles 1, 2 and 3 advances it. Missing the required advance in its cycle permanently prevents maturity during this slice; do not allow catch-up investment later.

### Attribution opportunity

Stable ID: `attribution-opportunity`

States:

- `none`
- `tentative`
- `credible`
- `used`
- `expired`

Opening: `none`.

This record derives only from legitimate HQ evidence. World truth alone cannot create it in player/public state.

## Helper transition semantics

Where this matrix says “worsen one” or “improve one”, apply one state step only and clamp at the endpoint.

Repeated transitions remain separate authoritative consequence entries even when the clamped state does not change, because repeated attempted strain/pressure may matter for causal history and Ravellan observation emission.

## Cycle 1 authored transitions

### Reinforce Beacon watch

Player-caused:

- `beacon-exposure`: improve one (`thin → contained` at opening);
- `reserve-condition`: worsen one;
- emit the authored Ravellan-observable `beacon_coverage_signal = credible` for next-cycle use.

Do not automatically emit `visible_denial_signal = demonstrated`; this order improves/detectably strengthens coverage without being the canonical visible patrol surge.

### Ordinary Beacon watch / Delegate course

No direct persistent improvement.

If Beacon exposure is `thin`, it remains `thin`.

Do not infer Ravellan `weak` coverage merely from missing reinforcement. Missing observations remain unknown. A content order may emit `beacon_coverage_signal = weak` only where its public/detectable posture explicitly warrants it.

### Formal consultation agreement

Player-caused:

- `consultation-promise: none → active`;
- `partner-consent`: improve one if below `cooperative` (normally no state change at opening);
- emit `coalition_unity_signal = coherent` only if the authored public/detectable implementation makes the consultation visible; private consultation alone must not emit it.

### Informal liaison

No promise is created.

### Protect Lattice — advance 1

Player-caused:

`lattice-investment: 0 → 1`.

If the player/authoritative staff course does not protect Lattice during Cycle 1, mark the Kestrel investment as `missed-cycle-1` through explicit content/state evidence or an equivalent deterministic reachability flag; later cycles cannot mature it.

## Cycle 2 shipping transitions

### Quiet escort

Player-caused:

- `reserve-condition`: worsen one only if Cycle-1 reinforcement already consumed the reserve in the immediately preceding window; otherwise no persistent reserve step. This prevents a routine quiet escort from always making the reserve brittle by Cycle 3 while preserving compound strain.
- emit `visible_denial_signal = withheld` because this authored course deliberately restrains visible deterrence while still escorting traffic.

Visible consequence beat: some shipping delay remains.

### Visible patrol surge

Player-caused:

- `reserve-condition`: worsen one;
- `partner-consent`: worsen one if no active consultation promise/visible joint consent covers the surge; otherwise remain;
- emit `visible_denial_signal = demonstrated`;
- emit `beacon_coverage_signal = credible` where the patrol visibly covers Beacon approaches.

If this is the second authored significant visible reserve deployment in campaign history, emit `reserve_exhaustion_signal = suspected` for Ravellan. Determine “second” from canonical ledger/history, not a hidden random roll.

### Reroute and monitor

Player-caused:

- `partner-consent`: worsen one if civilian disruption is not already accepted/jointly coordinated;
- emit `visible_denial_signal = withheld` where the reroute publicly avoids direct contest.

Visible consequence beat: civilian shipping disruption.

Do not worsen reserve condition.

## Cycle 2 attribution transitions

### Silence

No persistent record transition.

### Joint non-attributive warning

Player-caused:

- protect/improve `partner-consent` one step if it is `uneasy` or `conditional`, capped at `cooperative`;
- where publicly joint, emit `coalition_unity_signal = coherent`.

No attribution opportunity is consumed because no accusation is made.

### Public accusation

Player-caused:

If `consultation-promise = active` and the accusation is unilateral:

- `consultation-promise: active → breached`;
- `partner-consent`: worsen one;
- emit `coalition_unity_signal = fractured` where the breach becomes publicly/detectably consequential.

If the accusation is jointly authorised, do not breach the promise.

If the accusation is specific enough to reveal that HQ may have identified Ravellan activity, emit `ravellan_discovery_signal = suspected`.

Do not create `attribution-opportunity = credible` merely because the player chose to accuse.

## Cycle 2 Lattice

Protecting the second advance is legal only if Cycle 1 was protected.

- `1 → 2` if protected on schedule;
- otherwise maturity becomes unreachable for Kestrel.

## Cycle 3 transitions

### Forward reserve preparation

Player-caused:

- `beacon-preparation: routine → prepared`;
- `reserve-condition`: worsen one;
- emit `beacon_coverage_signal = credible` if the movement is authored as detectable;
- if this creates the second significant visible reserve deployment, emit `reserve_exhaustion_signal = suspected`.

It does not automatically emit visible denial unless the specific content order is visibly demonstrative.

### Hold reserve

No direct persistent transition.

Do not infer Ravellan weakness/withheld denial from silence.

### Focus existing collection

Player-caused:

- queue the authored non-Lattice collection result for the next belief update;
- `beacon-exposure`: worsen one because current coverage is deliberately diverted to collection.

This action is not Task Collection and remains part of the normal intervention economy.

### Reassure partner

Player-caused:

- improve `partner-consent` one step if it is `uneasy` or `conditional`;
- cannot repair `withdrawn`;
- cannot erase a `breached` promise.

Where reassurance is visibly joint/coherent, content may emit `coalition_unity_signal = coherent`.

### Protect Lattice — advance 3

Legal only if the first two scheduled advances succeeded.

`2 → 3-operational`.

Otherwise Kestrel Lattice remains non-operational permanently.

## Cycle 4 transitions

### Recover reserve

Player-caused:

- `reserve-condition`: improve one;
- `beacon-exposure`: worsen one;
- if the recovery/pullback is publicly detectable, emit `beacon_coverage_signal = weak`.

This is a canonical costly recovery: it improves endurance by spending immediate security.

### Prepare Beacon quietly

Player-caused:

- `beacon-preparation: routine → prepared`;
- `beacon-exposure`: improve one;
- may emit `beacon_coverage_signal = credible` if authored detection rules say Ravellan can observe the strengthened coverage;
- does not emit `visible_denial_signal = demonstrated` by default.

### Press visible advantage

Player-caused:

- `reserve-condition`: worsen one;
- emit `visible_denial_signal = demonstrated`;
- emit `beacon_coverage_signal = credible`;
- worsen `partner-consent` one step if the visible action is not covered by consultation/joint authority.

If it is the second significant visible reserve deployment, emit `reserve_exhaustion_signal = suspected`.

### Lattice Task Collection

No direct generic stat transition. It queues one target result under [[26-LATTICE-COLLECTION-MATRIX]].

### Emergency partner liaison

Player-caused:

- `liaison-obligation: none → active`;
- consumes one normal commander intervention;
- queues the narrower authored liaison result under [[26-LATTICE-COLLECTION-MATRIX]].

It does not grant a generic partner/intelligence bonus.

## Cycle 5 transitions

### Quiet reinforce Beacon

Player-caused:

- `beacon-exposure`: improve one;
- `beacon-preparation: routine → prepared`;
- `reserve-condition`: worsen one if reserve forces are materially committed;
- may emit `beacon_coverage_signal = credible`;
- does not emit `visible_denial_signal = demonstrated` by default.

### Visible reinforce Beacon

Player-caused:

- `beacon-exposure`: improve one;
- `beacon-preparation: routine → prepared`;
- `reserve-condition`: worsen one;
- emit `visible_denial_signal = demonstrated`;
- emit `beacon_coverage_signal = credible`;
- if not legitimately covered by partner consultation, worsen `partner-consent` one step and breach an active consultation promise as appropriate;
- if this is the second significant visible deployment, emit `reserve_exhaustion_signal = suspected`.

### Hold current Beacon posture

No direct improvement. Existing exposure/preparation remain.

### Honour consultation

If `consultation-promise = active`:

- `active → honoured`;
- improve `partner-consent` one step;
- emit `coalition_unity_signal = coherent` where the resulting joint position is detectable.

If there is no active promise, the order may still improve consent where content authors it, but it must not fabricate a promise history.

### Act then inform

If `consultation-promise = active`:

- `active → breached`;
- worsen `partner-consent` one step;
- emit `coalition_unity_signal = fractured` where detectably consequential.

It buys immediate freedom of action only through the associated authored final course; there is no generic “tempo points” bonus.

### Political concession

Player-caused:

- `political-concession: none → active`;
- set `partner-consent` to at least `conditional` if it was worse than `conditional`; if `uneasy` or `cooperative`, leave the stronger current state unchanged;
- fulfil `liaison-obligation` if the authored concession specifically satisfies that obligation.

The concession is a terminal cost even when it preserves access.

### Keep reserve forward

Player-caused:

- `reserve-condition`: worsen one;
- `beacon-preparation: routine → prepared` if not already prepared;
- emit `beacon_coverage_signal = credible` where detectable;
- emit `reserve_exhaustion_signal = suspected` when campaign history meets the significant-visible-deployment threshold.

### Emergency consolidation

Player-caused:

- `reserve-condition`: improve one;
- `beacon-exposure`: worsen one;
- emit `beacon_coverage_signal = weak` if the drawdown is detectable.

This remains legal through Cycle 5 and is the canonical anti-death-spiral recovery route.

### Use credible attribution opportunity

Legal only when `attribution-opportunity = credible`.

Player-caused:

- `credible → used`;
- improve `partner-consent` one step if the partner is not `withdrawn` and the attribution is jointly/politically usable;
- emit `ravellan_discovery_signal = suspected`;
- emit `coalition_unity_signal = coherent` where the attribution is jointly backed.

Any source-sacrifice consequence is represented as a terminal/debrief cost only if explicitly authored; do not invent a generic intelligence-resource meter.

## Attribution opportunity derivation

This is belief-safe.

- no legitimate directional evidence: `none`;
- at least one active directional `indicator` relevant to attributable Ravellan activity: `tentative`;
- at least one active relevant `corroborating` item and no active material contradiction: `credible`;
- after use: `used`;
- if required evidence expires/supersedes before use: `expired` or fall back to the authored weaker state as specified by content; do not retain credibility from hidden truth.

World truth alone cannot advance the opportunity.

## Liaison obligation resolution

The Cycle-4 liaison creates `active`.

It becomes `fulfilled` if, before terminal resolution, the player honours the specific consultation requested by the partner through an authored consultation/concession course.

It becomes `breached` if the player takes an explicitly incompatible unilateral course before fulfilment.

If still `active` at terminal resolution, treat it as an outstanding commitment cost, not an automatic breach.

## Terminal-cost flags derived from concrete records

For [[27-KESTREL-TERMINAL-MATRIX]], severe self-cost exists when any of the following is true at terminal evaluation:

- `reserve-condition = brittle`;
- `consultation-promise = breached`;
- `political-concession = active`;
- `liaison-obligation = breached`;
- partner consent is `conditional` because immediate support was preserved only through a concession/breach history;
- the terminal route explicitly constitutes an authored overreaction against a non-seizure Ravellan terminal behaviour.

Do not combine these into a player-facing numeric score.

## Recovery invariant

Before Cycle 6, deteriorating states must retain an authored costly response where the slice promises one:

- reserve strain/brittleness → emergency consolidation;
- partner deterioration → reassurance or political concession while still reachable;
- Beacon exposure → quiet/visible reinforcement or preparation where reachable;
- missing Lattice → partner liaison remains as narrower information counterplay.

Recovery changes the problem; it does not erase history.

## Required #101 tests

At minimum prove:

- every listed record starts in the canonical opening state;
- every authored transition above is deterministic and provenance-tagged;
- promise is never created implicitly;
- breach does not erase the prior promise;
- reserve recovery improves one step while worsening Beacon exposure;
- political concession restores enough support without erasing its terminal cost;
- Lattice cannot catch up after missing a required advance;
- attribution credibility is derived only from HQ evidence, never hidden truth;
- external/adversary-caused beats can be player-conditioned without being mislabeled player-caused;
- no reachable nonterminal Kestrel state before Cycle 6 eliminates all authored recovery/counterplay solely because of one early mistake;
- V1 campaign state remains unchanged.

## Rejection conditions

Reject #101 if it introduces a universal consequence value, morality/trust score, generic lifecycle engine, silent promise, unavoidable pre-terminal death spiral, hidden-truth-derived attribution opportunity, or UI-owned state transition.
