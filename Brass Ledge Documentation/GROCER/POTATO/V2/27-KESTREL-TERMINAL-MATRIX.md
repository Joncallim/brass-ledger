---
type: v2-kestrel-terminal-contract
status: active
---

# Kestrel Terminal Matrix

Backlink: [[README]]

This document is the implementation authority for Kestrel Cycle-6 final-course legality, physical resolution, final state effects and terminal classification. It is aligned with [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]]; 39 still owns cross-system composition details.

The final crisis tests the **campaign the player built**. It is not a secret-posture matching puzzle.

## Inputs

Terminal resolution may use only verified canonical state/history:

- observable Ravellan terminal crisis behavior selected by #99;
- Beacon exposure;
- Beacon preparation;
- reserve condition;
- HQ assessment/evidence;
- attribution opportunity;
- partner consent;
- C5 partner authority;
- consultation promise;
- political concession;
- liaison obligation;
- other explicit severe-cost history flags frozen in [[25-KESTREL-CONSEQUENCE-MATRIX]] / [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

The player-facing route screen consumes the safe crisis family from 39, never raw prior Ravellan posture/preparation.

## Derived predicates

### Controlled exposure

`controlledExposure = beacon-exposure != open`

### Prepared denial

`preparedDenial = beacon-preparation == prepared`

### Usable warning

Preparation-specific only:

`usableWarning = HQ assessment direction == preparation`

Both `preparation + weak` and `preparation + coherent` qualify.

`coercion + coherent` or a generic credible attribution opportunity does **not** qualify as seizure warning.

### Partner access

`partnerAccess = partner-consent != withdrawn`

### Joint authority

`jointAuthority = partnerAccess AND partner-authority in {joint, concession}`

Partner sentiment alone does not create operational authority.

### Unspent attribution

`unspentAttribution = attribution-opportunity == credible`

`used` is not equivalent. C5 use spends the one-shot opportunity and removes Hold And Expose from C6.

## Player-safe crisis family

Project the private #99 terminal behavior to:

- `attempt_seizure` → `seizure-underway`;
- `threshold_challenge` → `threshold-confrontation`;
- `abort_and_pressure` → `pressure-receding`.

Prior hidden posture/preparation remains unavailable until terminal debrief.

## Final course IDs

Exactly four final course IDs exist:

- `quiet-denial`
- `joint-visible-denial`
- `emergency-mobilisation`
- `hold-and-expose`

No fifth “correct answer” route may be invented in content/UI.

## Route legality

### Quiet Denial

Against `seizure-underway`:

- legal only if `preparedDenial`.

Against `threshold-confrontation` or `pressure-receding`:

- always legal.

In non-seizure crises it means maintain the restrained defensive posture / accept de-escalation without manufacturing a larger confrontation.

### Joint Visible Denial

Legal only when:

- `jointAuthority`;
- reserve condition != `brittle`.

The route represents an authorised coalition show of force, not merely a healthy relationship.

### Emergency Mobilisation

Always legal as the authored brute-force recovery course.

Physical success still depends on the pre-route reserve/preparation state below.

### Hold And Expose

Legal only when:

- `unspentAttribution`;
- `partnerAccess`.

Using attribution in C5 removes this route. The opportunity is one-shot.

## Resolution order

For the selected legal route:

1. read **pre-route** state for physical feasibility;
2. determine whether Beacon is held/lost;
3. apply the route's authoritative terminal reserve/partner/attribution effects;
4. derive final partner access / severe-cost flags from **post-route** state/history;
5. derive terminal Pareto vector and classification;
6. persist/replay the complete transition;
7. only after terminal completion expose the truth debrief.

Do not classify from pre-route state and then append costs only in prose.

## Quiet Denial

### Against seizure

Beacon is held cleanly if all:

- `preparedDenial`;
- `controlledExposure`;
- `usableWarning`.

If the clean condition fails but:

- `preparedDenial`;
- pre-route reserve condition = `usable`;

then a late reaction still holds Beacon:

- worsen reserve one terminal step;
- set severe-cost flag `late-reaction`.

Otherwise Beacon is lost.

### Against threshold / pressure receding

Beacon remains held.

No automatic reserve or partner movement.

This is the restrained non-seizure fallback and prevents a Ravellan backdown from forcing an irrational mobilisation.

## Joint Visible Denial

Physical result:

- against seizure: Beacon held if `preparedDenial` OR `controlledExposure`;
- against threshold/pressure receding: Beacon held.

Terminal effects:

- worsen reserve one step;
- preserve partner access because joint authority is required;
- political concession, if it was the authority source, remains an active severe-cost history.

This course can be correct, but it spends force readiness and can be overreaction against a weak/non-seizure crisis.

## Emergency Mobilisation

Physical result uses pre-route state:

- reserve `usable` or `strained` → Beacon held;
- reserve `brittle` + `preparedDenial` → Beacon held;
- reserve `brittle` without prepared denial → Beacon lost.

Terminal effects when Beacon held:

- worsen reserve one step;
- set severe-cost flag `emergency-surge`;
- if no `jointAuthority` and partner is not already withdrawn, worsen partner consent one step.

Emergency Mobilisation is deliberately the costly comeback route. A successful emergency surge is never a clean Strategic Success solely because the reserve began usable.

## Hold And Expose

Selecting it consumes the unspent opportunity:

`attribution-opportunity: credible → used`

Terminal effects:

- improve partner consent one step if below cooperative and not withdrawn.

Physical result:

- against seizure: Beacon held only if `preparedDenial AND controlledExposure`;
- against threshold/pressure receding: Beacon held.

This route is strong when the campaign preserved evidence/political access and weak when a real seizure meets poor physical preparation.

## Severe-cost derivation

`severeCost` is true if any authored severe-cost condition is true after route effects, including:

- post-route reserve condition = `brittle`;
- consultation promise = `breached`;
- political concession = `active`;
- liaison obligation = `breached`;
- unresolved/compromised commitment history already frozen by the consequence contract;
- `late-reaction`;
- `emergency-surge`;
- authored route overreaction below.

### Overreaction

- Emergency Mobilisation against threshold/pressure receding → overreaction;
- Joint Visible Denial against pressure receding → overreaction;
- Joint Visible Denial against threshold → overreaction when post-route reserve is brittle OR authority required political concession.

Do not add a numeric overreaction score.

## Terminal classification

Use this precedence:

1. **Operational Defeat** — Beacon lost.
2. **Political Defeat** — Beacon held but final partner access is lost (`partner-consent = withdrawn`).
3. **Costly Success** — Beacon held + partner access survives + `severeCost`.
4. **Strategic Success** — Beacon held + partner access survives + no severe cost.

Do not compress this to one player score.

## Pareto vector

The headless laboratory separately reports the post-route four-axis vector:

- Beacon security;
- partner consent/access;
- reserve readiness;
- commitment integrity.

Classification is reported alongside the vector; neither becomes a hidden gameplay utility function.

## Route design intent

### Quiet Denial

Rewards prior physical preparation and warning. Also supplies the rational restrained response when the confrontation does not become a seizure.

### Joint Visible Denial

Rewards preserved coalition authority and enough force readiness. It can deter/deny strongly but spends reserve and may be unnecessary escalation.

### Emergency Mobilisation

Preserves comeback viability after earlier mistakes, but at real military/political cost.

### Hold And Expose

Rewards preserving legitimate evidence and partner access; the player must choose whether to spend the same one-shot attribution opportunity in C5 or retain this final route.

No route is intended to dominate across every player-safe terminal state.

## Required tests

At minimum prove:

- route legality uses only player-known/observable state and safe crisis family;
- raw prior Ravellan posture/preparation never controls player route availability;
- Quiet Denial is always available for threshold/pressure-receding and requires prepared denial for seizure;
- Joint requires actual `partner-authority`, not merely cooperative partner consent;
- Emergency physical success/failure follows pre-route reserve/preparation, then applies reserve/partner cost and `emergency-surge`;
- Hold requires `credible` unspent attribution; `used` is rejected;
- C5 attribution use therefore removes C6 Hold And Expose;
- terminal route effects change post-route Pareto state as authored;
- a route ending with brittle reserve receives the brittle severe cost even if it started strained;
- all four classifications are reachable in deterministic fixtures;
- multiple final courses are non-dominated across viable histories;
- no pressure-receding history forces Emergency Mobilisation;
- no one final course is universal across all viable player-safe terminal states;
- terminal truth debrief is gated until completion;
- V1 remains unchanged.

## Rejection conditions

Reject terminal implementation if it matches the player's final course directly to hidden Ravellan opening posture, treats generic coercion evidence as seizure warning, treats partner sentiment as joint authority, permits Hold after the attribution opportunity was spent, leaves final-course costs only in prose, classifies using stale pre-route reserve/partner state, or lacks a restrained non-seizure route.