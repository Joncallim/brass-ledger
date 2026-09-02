---
type: v2-ravellan-policy
status: active
---

# Ravellan Executable Policy Matrix

Backlink: [[README]]

This matrix is authoritative for the six-cycle Kestrel Strait prototype only. It is an authored deterministic policy, never a general opponent architecture. Ravellan pursues Beacon control becoming untenable through seizure opportunity, political fracture, exhaustion, or induced costly overreaction—never drama, balance, variety, or rubber-banding.

## State and actions

Posture is exactly `genuine_preparation`, `coercive_feint`, or `testing`. Normal actions are exactly `probe_shipping` (cycles 1–5), `seed_deception` (2–5), `prepare_beacon_seizure` (2–5), and `pause_consolidate` (3–5). Cycle 6 instead chooses `attempt_seizure`, `threshold_challenge`, or `abort_and_pressure`.

Preparation is `none`, `developing`, or `ready`; only `prepare_beacon_seizure` advances `none → developing → ready → ready`. It is hidden from player DTOs.

## Authorised observations

Policy receives only its posture/preparation, V2 identity/seed, and active persisted records—never campaign state, score, intent, private order, HQ belief, secret intelligence, Lattice, or future input.

| Signal | Values | Lifetime |
| --- | --- | --- |
| `beacon_coverage_signal` | `weak`, `credible` | next two decisions |
| `visible_denial_signal` | `withheld`, `demonstrated` | next decision |
| `coalition_unity_signal` | `fractured`, `coherent` | next two decisions |
| `reserve_exhaustion_signal` | `suspected` | next two decisions |
| `ravellan_discovery_signal` | `suspected` | next decision |

Every record has signal ID, value, observed cycle, and source. A cycle-N signal first becomes usable in N+1. Missing means unknown, never the opposite. Only the newest non-expired value of each signal is active; same-effective-point contradictions are invalid.

## Seed and evaluation

Hash V2 ruleset identity, Kestrel scenario identity, seed, and `ravellan-opening`; modulo 3 maps 0 to genuine preparation, 1 to coercive feint, 2 to testing. Seed has no other role. Cycle 1 always selects `probe_shipping` and preserves posture. Cycles 2–5 evaluate the posture table top-to-bottom; skip an illegal preferred action, first matching legal row wins. No utility, roll, or seed tie-break exists.

## Policy rows

### `genuine_preparation`

1. **GP-1:** discovery suspected + credible coverage + coherent unity → prefer `pause_consolidate`, transition `coercive_feint` (skip in cycle 2).
2. **GP-2:** weak coverage → `prepare_beacon_seizure`, remain.
3. **GP-3:** discovery suspected → `seed_deception`, remain.
4. **GP-4:** fractured unity → `probe_shipping`, remain.
5. **GP-5:** otherwise → `prepare_beacon_seizure`, remain.

### `coercive_feint`

1. **CF-1:** weak coverage + withheld visible denial + fractured unity → `prepare_beacon_seizure`, transition `genuine_preparation`. This is the only normal feint-to-preparation transition and overrides reserve exhaustion and ordinary fracture handling.
2. **CF-2:** suspected reserve exhaustion → `probe_shipping`, remain.
3. **CF-3:** fractured unity → `seed_deception`, remain; only if CF-1 failed.
4. **CF-4:** demonstrated denial OR coherent unity → prefer `pause_consolidate`, remain (skip in cycle 2).
5. **CF-5:** otherwise → `probe_shipping`, remain.

Thus weak/fractured/exhausted selects CF-1; fracture with credible Beacon uses CF-3; reserve exhaustion alone never transitions posture; exhaustion with coherent unity uses CF-2 before CF-4. No score resolves conflicts.

### `testing`

1. **T-1:** weak coverage + fractured unity → `prepare_beacon_seizure`, transition `genuine_preparation`.
2. **T-2:** credible coverage + coherent unity → prefer `pause_consolidate`, transition `coercive_feint` (skip in cycle 2).
3. **T-3:** suspected reserve exhaustion → `probe_shipping`, remain.
4. **T-4:** discovery suspected → `seed_deception`, remain.
5. **T-5:** otherwise → `probe_shipping`, remain.

Only T-1, T-2, CF-1, and GP-1 change posture.

## Cycle 6

R6-1: genuine preparation + ready → `attempt_seizure`, except discovery suspected + credible coverage + coherent unity → `threshold_challenge`. R6-2: genuine preparation with non-ready preparation → `threshold_challenge`. R6-3: coercive feint → `threshold_challenge`. R6-4: testing with weak coverage or fractured unity → `threshold_challenge`. R6-5: otherwise testing → `abort_and_pressure`. Cycle 6 has no free preparation step and owns terminal Ravellan behaviour.

## Required proof and limits

#99 tests every legal row, cycle legality, opening determinism/reachability, observation isolation/timing/missing/expiry/replacement, conflicts, preparation, terminal rows, replay, no seed variance after opening, and V1 isolation. It must not add HQ intelligence, Lattice, coalition consequences, UI, generic policy machinery, scoring, adaptation, ML/LLM, factions, or action families.
