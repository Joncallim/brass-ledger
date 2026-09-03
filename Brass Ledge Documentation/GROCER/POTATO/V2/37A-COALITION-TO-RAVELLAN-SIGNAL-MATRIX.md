---
type: v2-coalition-adversary-signal-contract
status: active
---

# Coalition-to-Ravellan Signal Matrix

Backlink: [[README]]

This document is the implementation authority for **which Kestrel coalition actions create Ravellan observations** consumed by [[22-RAVELLAN-EXECUTABLE-POLICY]]. It complements [[37-RAVELLAN-WORLD-EFFECT-MATRIX]], which covers the opposite direction (Ravellan action → world/player manifestation).

The purpose is to make adversary responsiveness closed, fair and testable. Content/UI may not improvise an extra observation because an action “looks like it should matter”.

[[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] controls same-cycle coordination and the significant-reserve-deployment counter.

## Global rules

- Every signal below is produced from public/detectable coalition behavior only.
- A coalition action does not emit a signal not listed here.
- Missing signal means unknown, never the opposite value.
- `weak`, `withheld`, `fractured`, etc. are emitted only by the explicit authored behavior below; they are not inferred from omission.
- Signals created in Cycle N first become usable by Ravellan at Cycle N+1 under #99.
- Same-signal replacement/expiry follows #99. Content must not emit contradictory values for the same signal at the same effective observation point.
- Private standing intent, HQ belief, collection results, Lattice tasking, liaison tasking and deliberation never become Ravellan observations directly.

## Significant reserve-deployment event

Use [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] exactly:

Qualifying deployment cycles are:

- C2 if `visible-patrol-surge`;
- C3 if `forward-reserve-preparation`;
- C4 if `press-visible-advantage`;
- C5 if either `visible-reinforce-beacon` or `keep-reserve-forward`.

At most one deployment event is counted per cycle. When canonical history reaches the **second** qualifying deployment cycle, emit/refresh:

`reserve_exhaustion_signal = suspected`

Later qualifying cycles may refresh it. There is no numeric exhaustion score.

## Cycle 1

### `ordinary-watch`

Emit:

- `beacon_coverage_signal = weak`

Reason: the opening routine Beacon posture is explicitly detectable as thin.

### `reinforce-watch`

Emit:

- `beacon_coverage_signal = credible`

Do not emit visible denial; this is strengthened coverage, not a public show-of-force.

### `informal-liaison`

No Ravellan observation.

### `formal-consultation-agreement`

Emit:

- `coalition_unity_signal = coherent`

Kestrel authors the formal agreement as operationally observable through the resulting coalition coordination pattern. The exact private content is not exposed; Ravellan only observes that coalition alignment has become visibly coherent.

This signal is one real benefit/cost of formalisation: it may deter some opportunism while also revealing alignment.

### Lattice choice

No Ravellan observation.

## Cycle 2

### `quiet-escort`

Emit:

- `visible_denial_signal = withheld`

The coalition protects traffic without a demonstrative denial posture.

### `visible-patrol-surge`

Emit:

- `visible_denial_signal = demonstrated`;
- `beacon_coverage_signal = credible`;
- qualifying reserve-deployment event.

If the complete command set satisfies the coordinated-surge rule in 39, also emit:

- `coalition_unity_signal = coherent`

If it is uncoordinated, do **not** automatically emit `fractured`; partner deterioration may be privately known without a public rupture. Fracture is emitted only where explicitly public below.

### `reroute-and-monitor`

Emit:

- `visible_denial_signal = withheld`

Do not emit an intelligence/coverage signal merely because the course name contains “monitor”.

### `remain-silent`

No Ravellan observation.

### `joint-non-attributive-warning`

Emit:

- `coalition_unity_signal = coherent`

### `public-accusation`

Emit:

- `coalition_unity_signal = fractured`;
- `ravellan_discovery_signal = suspected`

The accusation is explicitly unilateral in Kestrel under 39. Ravellan can observe both the public coalition fracture and that HQ may have identified Ravellan activity.

### Lattice choice

No Ravellan observation.

## Cycle 3

### `forward-reserve-preparation`

Emit:

- `beacon_coverage_signal = credible`;
- qualifying reserve-deployment event.

Do not emit `visible_denial_signal = demonstrated`; Kestrel's forward preparation is detectable but not necessarily a public show-of-force.

### `hold-reserve`

No Ravellan observation. Do not infer withheld denial from omission.

### `focus-staging-collection`

No Ravellan observation. Collection focus is private.

### `maintain-current-coverage`

No new Ravellan observation.

### `reassure-partner`

Emit:

- `coalition_unity_signal = coherent`

Kestrel authors this reassurance as a detectably restored joint posture. This explicit emission is required so a player-created coherent-coalition history can interact with later Ravellan policy.

### `routine-contact`

No new Ravellan observation.

### Lattice choice

No Ravellan observation.

## Cycle 4

### `recover-reserve`

Emit:

- `beacon_coverage_signal = weak`

The recovery/pullback is detectably thinning immediate Beacon coverage.

### `prepare-beacon-quietly`

Emit:

- `beacon_coverage_signal = credible`;
- `ravellan_discovery_signal = suspected`

This is a **targeted detectable countermeasure** rather than a public demonstration. Ravellan can see that Beacon coverage is being shaped specifically enough to suspect that its activity has been noticed, without learning HQ's private evidence or intent.

Do not emit `visible_denial_signal = demonstrated`.

This signal pair, combined with a still-active coherent-unity observation from C3 reassurance, makes #99 GP-1 (`genuine_preparation → coercive_feint`) reachable at C5 through player-created public behavior rather than synthetic test inputs.

### `press-visible-advantage`

Emit:

- `visible_denial_signal = demonstrated`;
- `beacon_coverage_signal = credible`;
- qualifying reserve-deployment event.

No unity signal is implied unless another explicit coalition action in the complete command set emits it.

### Lattice Task Collection / partner liaison

No Ravellan observation. These intelligence actions are private.

## Cycle 5

Use the complete final-order package and partner authority from [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

### `quiet-reinforce-beacon`

Emit:

- `beacon_coverage_signal = credible`

No visible denial or discovery signal by default; the C4 targeted-preparation path is the authored pre-terminal discovery route.

### `visible-reinforce-beacon`

Emit:

- `visible_denial_signal = demonstrated`;
- `beacon_coverage_signal = credible`;
- qualifying reserve-deployment event.

Unity comes from the authority package below, not from the military order alone.

### `hold-beacon-posture`

No new Ravellan observation.

### `keep-reserve-forward`

Emit:

- `beacon_coverage_signal = credible`;
- qualifying reserve-deployment event.

Do not invent a partner-sensitive or visible-denial signal; 39 intentionally freezes this order as not separately partner-sensitive.

### `emergency-consolidation`

Emit:

- `beacon_coverage_signal = weak`

### Authority package: `honour-consultation`

If resulting `partner-authority = joint`, emit:

- `coalition_unity_signal = coherent`

If partner was already withdrawn and authority resolves to `none`, emit no coherent-unity signal.

### Authority package: `political-concession`

Emit:

- `coalition_unity_signal = coherent`

The support is real/visible even though it was bought at severe political cost.

### Authority package: `act-then-inform`

Emit:

- `coalition_unity_signal = fractured`

### `use-attribution`

Emit:

- `ravellan_discovery_signal = suspected`

If the same authority package is `joint|concession`, the coherent-unity signal is already emitted by that package. If unilateral, the fractured signal is already emitted by `act-then-inform`.

### `hold-attribution`

No new Ravellan observation.

## Cycle 6

No newly emitted coalition observation is consumed by another Kestrel Ravellan policy decision; the adversary terminal behavior has already been selected at Cycle 6 start.

Final coalition courses still create authoritative terminal consequences under 39, but do not need additional #99 observation records for this six-cycle slice.

## Reachability requirements

Content/lab must prove at minimum:

### CF-1 / T-1 opportunity chain

A reachable history can produce:

- C1 ordinary watch → weak coverage;
- C2 quiet escort → withheld visible denial;
- C2 public accusation → fractured unity;

so C3 Ravellan policy can legally observe the authored weak/withheld/fractured opportunity.

### GP-1 denial/discovery chain

A reachable history can produce:

- C3 reassure partner → coherent unity usable C4–C5;
- C4 prepare Beacon quietly → credible coverage + discovery suspicion usable C5;

so a C5 `genuine_preparation` decision can legally match GP-1 and transition toward coercion.

### Terminal denial exception

C5 `use-attribution` plus coherent authority/coverage may create the discovery + credible + coherent observation set consumed by the C6 genuine-preparation terminal exception. The player does not see this policy predicate; they see only their own public actions and the eventual crisis.

## Required tests

At minimum prove:

- exact signal set for every listed course/package;
- unlisted courses emit no Ravellan observation;
- private collection/Lattice/liaison/standing intent/HQ belief never emit directly;
- missing signal never becomes an opposite signal;
- C2 coordinated surge emits coherent while uncoordinated surge does not fabricate fracture;
- C3 reassurance / C4 targeted preparation make GP-1 reachable through normal authored history;
- significant reserve deployment counts max once per cycle;
- same complete command set produces the same observation set regardless issue-array order;
- no contradictory same-signal values are emitted at one effective observation point;
- V1 remains unchanged.

## Rejection conditions

Reject content if it infers an observation from player omission, reads private HQ state to decide what Ravellan notices, emits a signal not frozen here, double-counts same-cycle reserve deployments, or relies on synthetic-only observations for an adversary transition the playable slice claims is reachable.