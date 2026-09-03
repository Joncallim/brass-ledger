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
- Missing means unknown, not opposite value.
- Cycle-N emissions first become usable N+1; replacement/expiry follows #99.
- Derive candidate emissions from the **complete validated command set**, not sequential issue order.
- A legal package must never produce two different values for one signal ID/effective point.
- Same-value candidates coalesce through the explicit package rules below.
- **Do not emit an observation whose lifetime begins after the final Ravellan decision that could consume it.** Kestrel does not create dead C5 reserve-exhaustion observations merely for symmetry.

## Significant reserve-deployment event

Only qualifying deployments that can affect a later **normal** Ravellan policy decision are counted:

- C2 `visible-patrol-surge`;
- C3 `forward-reserve-preparation`;
- C4 `press-visible-advantage`.

At most one event counts per cycle.

The second qualifying deployment cycle creates/refreshes `reserve_exhaustion_signal = suspected`. A later qualifying C4 event may refresh it when applicable.

C1 reinforcement and quiet actions may strain readiness but do not count.

C5 reserve use still changes the coalition's real reserve condition and may emit the other C5 signals below, but **does not emit `reserve_exhaustion_signal`** because C6 terminal Ravellan policy has no rule that reads it.

## Cycle 1

- `ordinary-watch` → `beacon_coverage_signal = weak`.
- `reinforce-watch` → `beacon_coverage_signal = credible`; no demonstrated denial.
- `informal-liaison` → none.
- `formal-consultation-agreement` → `coalition_unity_signal = coherent` from detectably coherent coordination pattern.
- Lattice choice → none.

## Cycle 2

### Shipping

- `quiet-escort` → `visible_denial_signal = withheld`.
- `visible-patrol-surge` → `visible_denial_signal = demonstrated`, `beacon_coverage_signal = credible`, qualifying reserve event.
- `reroute-and-monitor` → `visible_denial_signal = withheld`; intelligence payoff belongs to HQ evidence, not adversary observation.

### Public posture

- `remain-silent` → none.
- `joint-non-attributive-warning` → `coalition_unity_signal = coherent`.
- `public-accusation` → `coalition_unity_signal = fractured`, `ravellan_discovery_signal = suspected`.

For a coordinated visible-surge package, the single coherent-unity record comes from joint warning. No duplicate unity record.

Lattice choice → none.

## Cycle 3

- `forward-reserve-preparation` → `beacon_coverage_signal = credible` + qualifying reserve event; no demonstrated denial.
- `hold-reserve` → none.
- focused/maintain collection → none; private.
- `reassure-partner` → `coalition_unity_signal = coherent`.
- `routine-contact` → none.
- Lattice choice → none.

C3 reassurance is explicitly detectable so later coherent-denial adversary branches are reachable through normal play.

## Cycle 4

- `recover-reserve` → `beacon_coverage_signal = weak`.
- `prepare-beacon-quietly` → `beacon_coverage_signal = credible` + `ravellan_discovery_signal = suspected`; no demonstrated denial.
- `press-visible-advantage` → `visible_denial_signal = demonstrated`, `beacon_coverage_signal = credible`, qualifying reserve event.
- Lattice / liaison → none; private.

C3 reassurance + C4 quiet targeted preparation makes #99 GP-1 reachable at C5 without private-state leakage.

## Cycle 5 — package-level emissions

C5 has simultaneous issues. Derive signals from the complete package using the semantic rules below. There is no C5 reserve-exhaustion observation.

### A. Beacon coverage — emit at most one value

1. `visible-reinforce-beacon` → `credible`, source `c5-visible-reinforce`; consolidation does not overwrite the overt signal.
2. else `keep-reserve-forward` → `credible`, source `c5-keep-reserve-forward`.
3. else `quiet-reinforce-beacon` + `emergency-consolidation` → **no new coverage signal**; public picture is mixed, missing means unknown.
4. else `quiet-reinforce-beacon` → `credible`, source `c5-quiet-reinforce`.
5. else `emergency-consolidation` → `weak`, source `c5-emergency-consolidation`.
6. otherwise none.

### B. Visible denial

`visible-reinforce-beacon` → `visible_denial_signal = demonstrated`.

No other C5 order emits visible-denial value.

### C. Discovery suspicion

Candidates:

- visible Beacon reinforcement;
- public attribution use.

Emit one `ravellan_discovery_signal = suspected`:

- both → source `c5-visible-reinforce-plus-attribution`;
- visible only → `c5-visible-reinforce`;
- attribution only → `c5-public-attribution`;
- neither → none.

This discovery signal is the mechanical deterrence payoff of visible vs quiet reinforcement and an immediate public-attribution effect.

### D. Coalition unity

Exactly one authority course resolves this signal:

- honour consultation with `partner-authority = joint` → `coalition_unity_signal = coherent`;
- political concession → `coherent`;
- act then inform → `fractured`;
- honour after prior withdrawal (`partner-authority = none`) → no unity signal.

Military/attribution orders do not emit a second unity record.

### Individual C5 orders with no additional signal

- `quiet-reinforce-beacon` has no discovery/demonstrated-denial signal;
- `hold-beacon-posture` none;
- `hold-attribution` none;
- C5 reserve use emits no reserve-exhaustion observation;
- quiet/nonvisible actions do not invent unity.

## Cycle 6

No new coalition observation is consumed by another Kestrel Ravellan decision; terminal behavior has already been selected. Final courses produce coalition consequences under [[27-KESTREL-TERMINAL-MATRIX]], not further Kestrel adversary observations.

## Required playable reachability

### CF-1 / T-1 opportunity chain

C1 ordinary watch → weak; C2 quiet escort → withheld; C2 public accusation → fractured. C3 policy can see weak/withheld/fractured.

### GP-1 denial/discovery chain

C3 reassure partner → coherent usable C4–C5; C4 quiet Beacon preparation → credible + discovery usable C5. C5 genuine preparation can match GP-1.

### C6 strong-denial chain

C5 visible reinforcement → credible + discovery; compatible honour/concession → coherent. C6 genuine-preparation terminal policy can take strong-denial exception. Public attribution is alternate discovery source when its one-shot opportunity is spent.

## Required tests

Prove at minimum:

- exact signal set for every listed action/package;
- unlisted/private actions emit none;
- missing never becomes opposite;
- coordinated C2 surge has one coherent record;
- significant deployment counter only uses C2–C4 and emits exhaustion only where a later normal policy can consume it;
- **C5 never emits reserve-exhaustion signal**;
- C3 reassurance + C4 targeted preparation reaches GP-1;
- every legal C5 beacon/reserve combination produces at most one coverage value;
- visible/quiet reinforcement differ through C5 discovery;
- C5 discovery sources coalesce stably;
- authority emits exactly one coherent/fractured/none unity outcome;
- same complete package → identical signals regardless issue-array order;
- no legal package produces contradictory same-ID values;
- V1 unchanged.

## Rejection conditions

Reject content if it infers signals from omission, reads private HQ state to decide what Ravellan notices, emits unfrozen/dead observations, persists duplicate/conflicting same-cycle observations, double-counts deployment, or leaves a relied-upon adversary transition synthetic-only.
