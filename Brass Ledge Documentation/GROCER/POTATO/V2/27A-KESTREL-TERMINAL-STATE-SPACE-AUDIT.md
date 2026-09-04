---
type: v2-kestrel-terminal-state-space-audit
status: active
---

# Kestrel Terminal State-Space Audit

Backlink: [[README]]

This is the abstract route-totality and pairwise-dominance authority for [[27-KESTREL-TERMINAL-MATRIX]]. [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns the intelligence producer state space; #107 later narrows both audits to fully reachable campaign histories.

# 1. Purpose

The terminal rules must be total and safe even for a player-known state combination that later authored content does not normally reach.

This audit therefore over-approximates the terminal input space rather than relying on a handful of intended finale fixtures.

It proves:

- every abstract safe terminal state has at least one displayed response;
- every displayed response can execute;
- no displayed response is pairwise dominated by another displayed response under the frozen relation;
- route families remain bounded by crisis type;
- public-claim direction never becomes physical readiness.

It does not prove the upstream campaign can reach every abstract combination or that the final choice is enjoyable.

# 2. Enumerated axes

Enumerate the Cartesian product of:

- crisis family: 3
  - `seizure-underway`
  - `threshold-confrontation`
  - `pressure-receding`
- Beacon exposure: 3
  - `contained | thin | open`
- Beacon preparation: 2
  - `routine | prepared`
- reserve: 3
  - `usable | strained | brittle`
- partner consent: 4
  - `cooperative | uneasy | conditional | withdrawn`
- partner authority: 4
  - `none | joint | unilateral | concession`
- tactical warning: 2
  - `none | usable`
- current public case: 3
  - none
  - credible preparation case
  - credible coercion case
- pre-existing severe-cost history: 2
- commitment integrity: 2

Exact abstract count:

`3 × 3 × 2 × 3 × 4 × 4 × 2 × 3 × 2 × 2 = 20,736`

Some combinations are intentionally upstream-inconsistent, such as withdrawn partner with a stale joint-authority enum. Route predicates still fail safely because `jointAuthority` requires current partner access. #107 later enumerates fully reachable composed states.

# 3. Frozen route predicates

The reference model independently reimplements [[27-KESTREL-TERMINAL-MATRIX]]:

```text
controlledExposure = exposure != open
preparedDenial = preparation == prepared
usableWarning = warning == usable
partnerAccess = partner != withdrawn
jointAuthority = partnerAccess && authority in {joint, concession}
currentCredibleCase = sourceUse == unspent && #100 current case credible

quietCleanSeizure = preparedDenial && controlledExposure && usableWarning
quietLateReactionPossible = preparedDenial && reserve == usable && !quietCleanSeizure
quietCanHoldSeizure = quietCleanSeizure || quietLateReactionPossible

jointCanHoldSeizure = preparedDenial || controlledExposure
jointBaseSeizure = jointAuthority && reserve != brittle && jointCanHoldSeizure

emergencyCanHoldSeizure =
  reserve in {usable, strained}
  || (reserve == brittle && preparedDenial)

quietCredibleThreshold = preparedDenial || controlledExposure
```

Claim direction is carried for copy/history and source-use persistence. It is deliberately absent from every physical adequacy predicate.

# 4. Displayed route-set closure

The independent model finds exactly **8** displayed route-set shapes across the 20,736 abstract states:

| Displayed route set | State count |
| --- | ---: |
| Emergency only | 3,840 |
| Joint only | 960 |
| Quiet only | 9,696 |
| Hold + Emergency | 288 |
| Joint + Hold | 192 |
| Quiet + Hold | 4,320 |
| Quiet + Joint | 480 |
| Quiet + Joint + Hold | 960 |

Totals:

- Quiet displayed in 15,456 states;
- Hold displayed in 5,760 states;
- Emergency displayed in 4,128 states;
- Joint displayed in 2,592 states.

No route set contains all four courses. Emergency is never displayed beside a legal Quiet or Joint response.

# 5. Crisis-specific closure

## Seizure underway

Displayed route-set shapes:

- Emergency only — 3,840
- Quiet only — 1,088
- Joint only — 960
- Quiet + Hold — 352
- Hold + Emergency — 288
- Joint + Hold — 192
- Quiet + Joint + Hold — 128
- Quiet + Joint — 64

No seizure state has an empty response set.

## Threshold confrontation

Displayed route-set shapes:

- Quiet only — 4,000
- Quiet + Hold — 1,664
- Quiet + Joint + Hold — 832
- Quiet + Joint — 416

Emergency never appears.

## Pressure receding

Displayed route-set shapes:

- Quiet only — 4,608
- Quiet + Hold — 2,304

Joint and Emergency never appear.

# 6. Pairwise dominance relation

For two displayed routes from the same player-known pre-state, A dominates B only if A is no worse in all of:

- Beacon held/lost;
- partner consent/access ordinal;
- reserve ordinal;
- commitment integrity;
- terminal classification;
- severe-cost set inclusion;

and A is strictly better in at least one.

Source exposure, emergency surge, late reaction, concession, brittle reserve and other severe flags remain non-fungible set members; there is no scalar severity score.

Exact result:

- **0 empty route sets**;
- **0 displayed pairwise-dominated route pairs**.

This does not claim the routes are equally appealing. It proves only that the current display pruning does not knowingly show an option that is worse on every frozen player-known outcome dimension.

# 7. Classification reachability by route

Across the abstract envelope:

| Route | Strategic Success | Costly Success | Political Defeat | Operational Defeat |
| --- | ---: | ---: | ---: | ---: |
| Quiet | 2,736 | 8,496 | 4,224 | 0 |
| Joint | 324 | 2,268 | 0 | 0 |
| Hold | 0 | 5,760 | 0 | 0 |
| Emergency | 0 | 1,536 | 1,440 | 1,152 |

Structural implications:

- Hold is always costly because exposing the source is always severe.
- Emergency is never clean Strategic Success.
- Emergency remains the only displayed response in some deeply degraded seizure states, including best-effort failure states.
- Joint cannot create Political Defeat because current joint authority already requires surviving access.

# 8. Claim-direction invariants

The abstract model duplicates every otherwise-identical credible-case state with preparation and coercion directions.

Required result:

- route physical legality/effects are identical for the two directions;
- safe claim copy and persisted `used.direction` differ;
- source support basis differs where the current #100 case differs;
- any future direction-specific pruning must be justified by complete player-safe dominance, not by treating one claim as physical warning.

Canonical producer analysis in [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] additionally proves that `credible coercion case + seizure underway` is not normally reachable in Kestrel. Generic terminal code remains direction-safe rather than special-casing the unreachable pair.

# 9. Required generated tests

#107 must independently reproduce:

- 20,736 abstract states;
- exactly 8 route-set shapes and counts above;
- route display totals above;
- 0 empty sets;
- 0 displayed dominated pairs;
- no Emergency with Quiet/Joint;
- no Emergency outside seizure;
- no Joint during pressure receding;
- classification counts above;
- claim-direction physical invariance.

Mutation/self-tests must fail when deliberately introducing:

- no fallback in a degraded seizure state;
- Quiet displayed despite known inability to hold;
- late Quiet displayed beside a strictly superior Joint route;
- Emergency displayed beside a legal Quiet or Joint route;
- known-failing Emergency displayed while Hold can already preserve Beacon;
- Joint after pressure recedes;
- source-free Hold;
- Hold after source use;
- warning inferred from assessment direction;
- claim direction used as physical adequacy;
- classification computed from pre-route rather than post-route state;
- hidden Ravellan posture used in route legality.

# 10. Separation from reachable campaign proof

This audit is deliberately abstract and over-complete.

It does not prove:

- all 20,736 states are reachable;
- upstream package/state invariants are correct;
- route text is understandable;
- players value non-fungible severe costs as intended;
- the final choice is fun.

#107 must run a second enumeration over fully reachable replay-valid Kestrel histories and compare the reachable subset to this abstract safety envelope. Human smoke remains the only evidence for experiential quality.
