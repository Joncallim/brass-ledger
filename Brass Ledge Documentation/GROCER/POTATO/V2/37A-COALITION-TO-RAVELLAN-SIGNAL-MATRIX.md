---
type: v2-coalition-adversary-signal-contract
status: active
---

# Coalition-to-Ravellan Signal Matrix

Backlink: [[README]]

This is the implementation authority for which Kestrel coalition actions create the Ravellan observations consumed by [[22-RAVELLAN-EXECUTABLE-POLICY]]. [[37-RAVELLAN-WORLD-EFFECT-MATRIX]] owns the opposite direction. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns same-cycle command composition.

## Global rules

- Signals come only from explicit public/detectable behavior listed here.
- Unlisted/private actions emit none.
- Missing means unknown, not the opposite value.
- Cycle-N emissions first become usable N+1; replacement/expiry follows #99.
- Derive candidate emissions from the **complete validated command set**, not sequential issue order.
- A legal command set must never produce two different values for the same signal ID at one effective point.
- Where several orders could contribute to the same signal, use the explicit package-level composition below rather than persisting duplicate/conflicting observations.

## Significant reserve-deployment event

Qualifying cycles:

- C2 visible patrol surge;
- C3 forward reserve preparation;
- C4 press visible advantage;
- C5 if either visible Beacon reinforcement or keep reserve forward.

At most one event counts per cycle. The second qualifying deployment cycle creates/refreshes `reserve_exhaustion_signal = suspected`. Later qualifying cycles may refresh it. C1 reinforcement/quiet reinforcement may strain readiness but do not count.

## Cycle 1

- `ordinary-watch` → `beacon_coverage_signal = weak`.
- `reinforce-watch` → `beacon_coverage_signal = credible`; no demonstrated-denial signal.
- `informal-liaison` → none.
- `formal-consultation-agreement` → `coalition_unity_signal = coherent` from its detectably coherent coordination pattern.
- Lattice choice → none.

## Cycle 2

### Shipping

- `quiet-escort` → `visible_denial_signal = withheld`.
- `visible-patrol-surge` → `visible_denial_signal = demonstrated`, `beacon_coverage_signal = credible`, qualifying reserve event.
- `reroute-and-monitor` → `visible_denial_signal = withheld`; its intelligence payoff is HQ evidence under 39, not an adversary-observation bonus.

### Public posture

- `remain-silent` → none.
- `joint-non-attributive-warning` → `coalition_unity_signal = coherent`.
- `public-accusation` → `coalition_unity_signal = fractured`, `ravellan_discovery_signal = suspected`.

For the C2 coordinated visible-surge package, the **single** coherent-unity record comes from the joint warning. The surge does not emit a duplicate unity record.

Lattice choice → none.

## Cycle 3

- `forward-reserve-preparation` → `beacon_coverage_signal = credible` + qualifying reserve event; no demonstrated-denial signal.
- `hold-reserve` → none.
- focused/maintain collection → none; private.
- `reassure-partner` → `coalition_unity_signal = coherent`.
- `routine-contact` → none.
- Lattice choice → none.

C3 reassurance is explicitly detectable so the later coherent-denial adversary branch is reachable through normal play.

## Cycle 4

- `recover-reserve` → `beacon_coverage_signal = weak`.
- `prepare-beacon-quietly` → `beacon_coverage_signal = credible` + `ravellan_discovery_signal = suspected`; no demonstrated-denial signal.
- `press-visible-advantage` → `visible_denial_signal = demonstrated`, `beacon_coverage_signal = credible`, qualifying reserve event.
- Lattice / liaison → none; private.

C3 reassurance + C4 quiet targeted preparation makes #99 GP-1 reachable at C5 without private-state leakage.

## Cycle 5 — package-level emissions

C5 has multiple simultaneous issues, so derive signals from the complete package in the order below. This is **semantic precedence**, not array execution order.

### A. Beacon coverage — emit at most one value

1. If `visible-reinforce-beacon` is selected:
   - emit `beacon_coverage_signal = credible` with source `c5-visible-reinforce`.
   - Emergency consolidation does not overwrite this overt visible reinforcement signal.
2. Else if `keep-reserve-forward` is selected:
   - emit `beacon_coverage_signal = credible` with source `c5-keep-reserve-forward`.
3. Else if `quiet-reinforce-beacon` **and** `emergency-consolidation` are both selected:
   - emit **no new beacon-coverage signal**. The detectable picture is deliberately mixed; missing means unknown rather than forcing weak/credible.
4. Else if `quiet-reinforce-beacon` is selected:
   - emit `beacon_coverage_signal = credible` with source `c5-quiet-reinforce`.
5. Else if `emergency-consolidation` is selected:
   - emit `beacon_coverage_signal = weak` with source `c5-emergency-consolidation`.
6. Otherwise emit no new beacon-coverage signal.

This package rule supersedes any older per-order C5 coverage emissions.

### B. Visible denial

If `visible-reinforce-beacon`:

- `visible_denial_signal = demonstrated`.

No other C5 order emits a visible-denial value.

### C. Discovery suspicion

Candidates:

- visible Beacon reinforcement;
- public use of attribution.

Emit **one** `ravellan_discovery_signal = suspected`:

- both selected → source `c5-visible-reinforce-plus-attribution`;
- visible only → `c5-visible-reinforce`;
- attribution only → `c5-public-attribution`;
- neither → none.

Visible reinforcement's discovery signal is its mechanical deterrence payoff relative to quiet reinforcement. With coherent unity/credible coverage it can participate in #99's C6 strong-denial exception.

### D. Coalition unity

Exactly one authority course resolves this signal:

- honour consultation with resulting `partner-authority = joint` → `coalition_unity_signal = coherent`;
- political concession → `coalition_unity_signal = coherent`;
- act then inform → `coalition_unity_signal = fractured`;
- honour after prior withdrawal (`partner-authority = none`) → no unity signal.

Military/attribution orders do not emit a second unity record.

### E. Significant reserve deployment

If either visible Beacon reinforcement or keep reserve forward is selected, count exactly **one** qualifying C5 deployment event, regardless whether both are present.

### Individual C5 orders with no additional signal

- `quiet-reinforce-beacon` has no discovery/demonstrated-denial signal;
- `hold-beacon-posture` none;
- `hold-attribution` none;
- quiet/nonvisible actions do not invent a unity signal.

## Cycle 6

No new coalition observation is consumed by another Kestrel Ravellan policy decision; terminal behavior was already selected at C6 start. Final courses still produce authoritative consequences under 39.

## Required playable reachability

### CF-1 / T-1 opportunity chain

C1 ordinary watch → weak coverage; C2 quiet escort → withheld denial; C2 public accusation → fractured unity. C3 policy can therefore see the authored weak/withheld/fractured opportunity.

### GP-1 denial/discovery chain

C3 reassure partner → coherent unity usable C4–C5; C4 quiet Beacon preparation → credible coverage + discovery usable C5. A C5 genuine-preparation decision can therefore match GP-1.

### C6 strong-denial chain

C5 visible Beacon reinforcement → credible coverage + discovery; compatible honour/concession → coherent unity. C6 genuine-preparation terminal policy can therefore take the strong-denial exception. Public attribution is an alternate discovery source when its one-shot opportunity is spent.

## Required tests

Prove at minimum:

- exact signal set for every listed action/package;
- unlisted/private actions emit none;
- missing never becomes opposite;
- coordinated C2 surge has one coherent record, no duplicate;
- C3 reassurance + C4 targeted preparation reaches GP-1;
- every legal C5 beacon/reserve combination produces at most one beacon-coverage value;
- visible/quiet reinforcement are mechanically distinct through C5 discovery signaling;
- C5 discovery sources coalesce to the stable single source;
- authority emits exactly one coherent/fractured/none unity outcome;
- significant reserve deployment counts max once per cycle;
- same complete command set yields identical signals regardless issue-array order;
- no legal package produces contradictory same-ID values;
- V1 remains unchanged.

## Rejection conditions

Reject content if it infers signals from omission, reads private HQ state to decide what Ravellan notices, emits unfrozen signals, persists duplicate/conflicting same-cycle observations, double-counts deployment, or leaves an adversary transition playable only through synthetic test inputs.