---
type: v2-coalition-adversary-signal-contract
status: active
---

# Coalition-to-Ravellan Signal Matrix

Backlink: [[README]]

This is the implementation authority for **which Kestrel coalition actions create Ravellan observations** consumed by [[22-RAVELLAN-EXECUTABLE-POLICY]]. It complements [[37-RAVELLAN-WORLD-EFFECT-MATRIX]], which covers the opposite direction.

[[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] controls same-cycle command composition and reserve-deployment counting.

## Global rules

- Signals come only from explicit public/detectable coalition behavior listed here.
- Unlisted actions emit no Ravellan observation.
- Missing means unknown, never the opposite value.
- Private standing intent, HQ belief, collection result, Lattice/liaison tasking and deliberation never emit directly.
- Cycle-N signals first become usable at Cycle N+1; replacement/expiry follows #99.
- Candidate emissions are derived from the **complete validated command set**, not sequential issue order.
- If several parts of one complete command set would emit the **same signal ID and same value**, coalesce them into one observation record. Use the stable package source ref defined below where supplied; do not create duplicate active records merely because two authored actions imply the same observation.
- A legal command set must never emit two different values for the same signal ID at the same effective point. Such content is invalid rather than order-resolved.

## Significant reserve-deployment event

Qualifying cycles:

- C2 `visible-patrol-surge`;
- C3 `forward-reserve-preparation`;
- C4 `press-visible-advantage`;
- C5 if either `visible-reinforce-beacon` or `keep-reserve-forward`.

At most one event counts per cycle. When canonical history reaches the **second** qualifying cycle, emit/refresh:

`reserve_exhaustion_signal = suspected`

Later qualifying cycles may refresh it. C1 reinforce/quiet reinforcement may strain readiness but do not count.

## Cycle 1

### `ordinary-watch`

- `beacon_coverage_signal = weak`

### `reinforce-watch`

- `beacon_coverage_signal = credible`

No visible-denial signal; this is stronger coverage, not show-of-force.

### `informal-liaison`

No signal.

### `formal-consultation-agreement`

- `coalition_unity_signal = coherent`

Kestrel authors the resulting coordination pattern as detectably coherent without exposing private agreement content.

### Lattice choice

No signal.

## Cycle 2

### `quiet-escort`

- `visible_denial_signal = withheld`

### `visible-patrol-surge`

- `visible_denial_signal = demonstrated`;
- `beacon_coverage_signal = credible`;
- qualifying reserve-deployment event.

Do **not** emit a separate unity signal from the surge. If the complete package contains the joint-warning/coordinated-surge combination under 39, the one coherent-unity observation is emitted by the joint public posture below. This avoids duplicate same-cycle unity records.

### `reroute-and-monitor`

- `visible_denial_signal = withheld`

Its player intelligence payoff is the separate queued HQ evidence in 39, not a Ravellan-observation bonus.

### `remain-silent`

No signal.

### `joint-non-attributive-warning`

- `coalition_unity_signal = coherent`

This single observation also represents the coordinated visible-surge package when that combination is legal under 39.

### `public-accusation`

- `coalition_unity_signal = fractured`;
- `ravellan_discovery_signal = suspected`

### Lattice choice

No signal.

## Cycle 3

### `forward-reserve-preparation`

- `beacon_coverage_signal = credible`;
- qualifying reserve-deployment event.

No demonstrated-denial signal.

### `hold-reserve`

No signal.

### `focus-staging-collection` / `maintain-current-coverage`

No signal. Collection is private.

### `reassure-partner`

- `coalition_unity_signal = coherent`

Kestrel authors reassurance as a detectably restored joint posture. This makes the later coherent-denial Ravellan branch reachable through normal play.

### `routine-contact`

No signal.

### Lattice choice

No signal.

## Cycle 4

### `recover-reserve`

- `beacon_coverage_signal = weak`

The pullback is detectably thinning immediate coverage.

### `prepare-beacon-quietly`

- `beacon_coverage_signal = credible`;
- `ravellan_discovery_signal = suspected`

This is a targeted detectable countermeasure, not public show-of-force. Ravellan can suspect its activity has been noticed without learning private HQ evidence.

Combined with C3 reassurance, this makes #99 GP-1 reachable at C5 through normal player-created public signals.

### `press-visible-advantage`

- `visible_denial_signal = demonstrated`;
- `beacon_coverage_signal = credible`;
- qualifying reserve-deployment event.

### Lattice / liaison actions

No signal. These are private intelligence activities.

## Cycle 5

Use the complete package and partner-authority semantics from 39.

### `quiet-reinforce-beacon`

- `beacon_coverage_signal = credible`

No discovery or demonstrated-denial signal. Quiet reinforcement is the lower-political-risk physical preparation route.

### `visible-reinforce-beacon`

- `visible_denial_signal = demonstrated`;
- `beacon_coverage_signal = credible`;
- `ravellan_discovery_signal = suspected`;
- qualifying reserve-deployment event.

The additional discovery signal is the **mechanical payoff for being visibly targeted**. With coherent authority it can contribute to #99's Cycle-6 strong-denial exception and make a real prepared seizure become a threshold challenge. Without coherent authority, the signal does not magically create unity and may simply expose unilateral escalation.

This is why visible reinforcement is not a dominated version of quiet reinforcement.

### `hold-beacon-posture`

No signal.

### `keep-reserve-forward`

- `beacon_coverage_signal = credible`;
- qualifying reserve-deployment event.

No partner-sensitive or demonstrated-denial signal.

### `emergency-consolidation`

- `beacon_coverage_signal = weak`

### Partner authority: `honour-consultation`

If resulting authority is `joint`:

- `coalition_unity_signal = coherent`

If authority is `none` after prior partner withdrawal, no coherent signal.

### Partner authority: `political-concession`

- `coalition_unity_signal = coherent`

### Partner authority: `act-then-inform`

- `coalition_unity_signal = fractured`

### `use-attribution`

- `ravellan_discovery_signal = suspected`

If `visible-reinforce-beacon` is also selected, coalesce the two identical discovery candidates into one record with stable source ref:

`c5-visible-reinforce-plus-attribution`

If only visible reinforcement emits discovery, source ref:

`c5-visible-reinforce`

If only attribution emits discovery, source ref:

`c5-public-attribution`

### `hold-attribution`

No signal.

## Cycle 6

No newly emitted coalition observation is consumed by another Kestrel Ravellan policy decision; terminal behavior was already selected at Cycle-6 start.

Final coalition courses still create authoritative terminal consequences under 39 but require no additional #99 observation record in this slice.

## Required playable reachability

### CF-1 / T-1 opportunity chain

A normal history can produce:

- C1 ordinary watch → weak coverage;
- C2 quiet escort → withheld denial;
- C2 public accusation → fractured unity;

so C3 Ravellan policy can see the authored weak/withheld/fractured opportunity.

### GP-1 denial/discovery chain

A normal history can produce:

- C3 reassure partner → coherent unity usable C4–C5;
- C4 quiet Beacon preparation → credible coverage + discovery usable C5;

so a C5 genuine-preparation decision can match GP-1 and transition toward coercion.

### C6 strong-denial chain

A normal history can produce:

- C5 visible Beacon reinforcement → credible coverage + discovery;
- C5 honour consultation through a compatible joint-authority package or political concession → coherent unity;

so C6 genuine-preparation terminal policy can take the strong-denial exception.

C5 public attribution is an alternate discovery source when selected and unspent evidence is deliberately consumed.

## Required tests

At minimum prove:

- exact signal set for every listed action/package;
- unlisted/private actions emit none;
- missing never becomes opposite;
- same-value duplicate candidates coalesce deterministically;
- no legal package emits contradictory same-ID values;
- coordinated C2 surge uses one coherent-unity record rather than duplicates;
- C3 reassurance + C4 targeted preparation makes GP-1 reachable;
- C5 visible reinforcement is mechanically distinct from quiet reinforcement and can participate in the C6 denial exception only with coherent unity;
- C5 visible+attribution discovery coalesces to the stable composite source;
- significant reserve deployment counts max once per cycle;
- same complete command set yields identical signal set regardless issue-array order;
- V1 remains unchanged.

## Rejection conditions

Reject content if it infers signals from omission, reads private HQ state to decide what Ravellan notices, emits unfrozen signals, creates duplicate/contradictory same-cycle observations through issue order, double-counts reserve deployment, or leaves an adversary transition playable only through synthetic test inputs.