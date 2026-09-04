---
type: v2-kestrel-terminal-contract
status: active
---

# Kestrel Terminal Matrix

Backlink: [[README]]

This is the implementation authority for Kestrel Cycle-6 route legality, physical resolution, terminal state effects and classification. It uses verified canonical state and the **safe observable crisis family**, never hidden opening posture as a player answer key.

[[23-HQ-BELIEF-AND-EVIDENCE]] owns HQ assessment versus tactical-warning semantics. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns cross-system timing/authority details.

## Inputs

Terminal resolution may use:

- safe crisis family;
- Beacon exposure/preparation;
- reserve condition;
- HQ **derived tactical-warning state**;
- HQ assessment/evidence only where a separately authorised predicate needs it;
- unspent attribution opportunity;
- partner consent / C5 partner authority;
- explicit commitments/concession/liaison history;
- severe-cost history.

## Derived predicates

`controlledExposure = beacon-exposure != open`

`preparedDenial = beacon-preparation == prepared`

`usableWarning = deriveV2HqBelief(...).warning == usable`

**Do not derive `usableWarning` from `HQ assessment.direction == preparation`.**

A commander can correctly assess preparation without having a timely physical warning signpost. Conversely, a physical warning signpost can be usable even while the wider intent assessment remains conflicted.

`partnerAccess = partner-consent != withdrawn`

`jointAuthority = partnerAccess AND partner-authority in {joint, concession}`

`unspentAttribution = attribution-opportunity == credible`

Safe crisis family:

- #99 `attempt_seizure` → `seizure-underway`
- `threshold_challenge` → `threshold-confrontation`
- `abort_and_pressure` → `pressure-receding`

Prior hidden posture/preparation remains private until debrief.

### Known physical adequacy predicates

`quietCleanSeizure = preparedDenial AND controlledExposure AND usableWarning`

`quietLateReactionPossible = preparedDenial AND reserve-condition == usable AND NOT quietCleanSeizure`

`quietCanHoldSeizure = quietCleanSeizure OR quietLateReactionPossible`

`jointCanHoldSeizure = preparedDenial OR controlledExposure`

`jointBaseSeizure = jointAuthority AND reserve-condition != brittle AND jointCanHoldSeizure`

`emergencyCanHoldSeizure = reserve in {usable, strained} OR (reserve == brittle AND preparedDenial)`

`quietCredibleThreshold = preparedDenial OR controlledExposure`

All are player-known-state derivations.

## Final course IDs

Exactly:

- `quiet-denial`
- `joint-visible-denial`
- `emergency-mobilisation`
- `hold-and-expose`

The displayed subset excludes a route the current player-known state makes physically futile or strictly worse than another available route.

# Route legality

## Quiet Denial

### `seizure-underway`

Base requirement:

`quietCanHoldSeizure`

Additionally, if Quiet would succeed **only through `quietLateReactionPossible`** and `jointBaseSeizure` is true, Quiet is omitted.

Reason: both routes then spend the same one reserve step to hold Beacon, while Joint also improves/preserves coalition position and avoids the `late-reaction` severe flag. There is no remaining player-visible upside to choosing late Quiet.

A clean Quiet route remains available even when Joint is also available and partner is degraded, because then the player has a real trade: preserve reserve versus visibly repair/reassure the coalition.

### `threshold-confrontation`

Always legal.

### `pressure-receding`

Always legal.

## Joint Visible Denial

Base:

- crisis is seizure or threshold;
- `jointAuthority`;
- reserve pre-route != brittle.

For seizure require `jointCanHoldSeizure`.

Prune when a clean/credible Quiet response already supplies the same known result without spending final reserve and the partner is already cooperative:

- seizure: `quietCleanSeizure && partner-consent == cooperative`;
- threshold: `quietCredibleThreshold && partner-consent == cooperative`.

Never legal for pressure receding.

## Hold And Expose

Base:

- `unspentAttribution`;
- `partnerAccess`.

Seizure additionally requires:

- `preparedDenial`;
- `controlledExposure`.

Threshold legal when either:

- partner consent != cooperative;
- `quietCredibleThreshold` false.

Pressure receding legal only when partner consent != cooperative.

Seizure: omit when `quietCleanSeizure && partner-consent == cooperative`; source exposure would buy no terminal advantage.

## Emergency Mobilisation

Emergency is a **fallback**, not a permanent fourth button.

Consider only for seizure.

Let `quietLegal`, `jointLegal`, `holdLegal` be the final predicates above.

Emergency legal only when:

- `quietLegal == false`;
- `jointLegal == false`;
- and either `emergencyCanHoldSeizure == true` or `holdLegal == false`.

Thus:

- known-valid Quiet or Joint prunes Emergency;
- known-failing Emergency is pruned if Hold And Expose can hold;
- when no better viable course exists, Emergency remains the last-ditch fallback, including a doomed best-effort state created by earlier campaign failure.

# Resolution order

1. derive/prune routes from player-known state;
2. validate selected route;
3. use pre-route state for physical feasibility;
4. derive Beacon held/lost;
5. apply route state/cost effects;
6. derive post-route access/severe cost;
7. derive Pareto vector/classification;
8. persist/replay;
9. expose terminal truth only after completion.

# Quiet Denial

## Seizure

### Clean hold

If `quietCleanSeizure`:

- Beacon held;
- no automatic terminal reserve cost.

### Late reaction

Otherwise route legality guarantees the late-reaction path and no legal Joint route strictly dominates it:

- Beacon held;
- reserve worsens one;
- severe `late-reaction`.

## Threshold

Beacon held.

If `quietCredibleThreshold`, no partner movement.

Otherwise partner worsens one.

## Pressure receding

Beacon held; no automatic reserve/partner movement.

# Joint Visible Denial

Route legality guarantees physical adequacy for seizure.

- Beacon held for seizure/threshold;
- reserve worsens one;
- partner improves one when below cooperative and not withdrawn;
- access remains because joint authority required.

# Emergency Mobilisation

Only displayed as seizure fallback.

If `emergencyCanHoldSeizure`:

- Beacon held;
- reserve worsens one;
- severe `emergency-surge`;
- if no joint authority and partner not withdrawn, partner worsens one.

Otherwise Beacon lost. This known-doomed Emergency appears only when no other legal route can hold, preserving a final best-effort response after accumulated campaign failure.

Emergency is never clean Strategic Success.

# Hold And Expose

- `attribution-opportunity: credible → used`;
- severe `attribution-source-exposed`;
- partner improves one when below cooperative and not withdrawn;
- Beacon held for every state in which route is legal.

The source cost is known before selection.

# C5 attribution use

C5 `use-attribution` spends the same source-sensitive opportunity:

- `credible → used`;
- severe `attribution-source-exposed`;
- authored immediate partner/discovery effects.

Later evidence never regenerates a credible opportunity during Kestrel.

# Severe cost

After route effects, severe cost includes, where present:

- final reserve brittle;
- consultation promise breached;
- political concession active;
- liaison obligation breached;
- `attribution-source-exposed`;
- `late-reaction`;
- `emergency-surge`;
- authored overreaction;
- other frozen severe commitment history.

### Overreaction

Joint Visible against threshold is overreaction only when post-route reserve brittle OR authority required political concession.

No numeric score.

# Terminal classification

1. **Operational Defeat** — Beacon lost.
2. **Political Defeat** — Beacon held but final partner access withdrawn.
3. **Costly Success** — Beacon held + access survives + severe cost.
4. **Strategic Success** — Beacon held + access survives + no severe cost.

# Pareto vector

Post-route:

- Beacon security;
- partner consent/access;
- reserve readiness;
- commitment integrity.

Classification/severe flags are reported separately and considered by #107 local dominance.

# Design intent

## Seizure underway

Only routes with a real known role remain:

- clean Quiet if the prepared plan works **and HQ has actual usable warning**;
- late Quiet when the physical plan exists but warning/positioning is insufficient, only if Joint does not strictly dominate it;
- Joint where authority/physical state make visible coalition denial useful;
- Hold And Expose where burning the source trades against reserve/political state;
- Emergency only as fallback after the better prepared/joint paths are absent.

This makes collection quality matter without turning the final choice into “guess hidden posture.”

## Threshold confrontation

Quiet is baseline restraint; Joint may spend reserve to improve/reassure a degraded coalition; Hold And Expose may spend source for political recovery. Emergency absent.

## Pressure receding

Quiet accepts de-escalation. Hold And Expose may spend source to repair degraded political position. No mobilisation/show-of-force padding.

# Required tests

At minimum prove:

- legality uses only safe player-known state;
- raw prior posture/preparation never affects route set;
- `usableWarning` comes from the separate #100 warning reducer, not assessment direction;
- `preparation + coherent` with warning `none` does **not** qualify as clean Quiet warning;
- `unclear + conflicted` with a valid physical warning-role item **can** have warning `usable`;
- no displayed Quiet/Joint seizure route is known unable to hold Beacon;
- late-reaction Quiet pruned whenever `jointBaseSeizure` makes Joint strictly dominate it;
- clean Quiet remains alongside Joint when degraded partner creates a reserve-vs-politics trade;
- Emergency pruned whenever legal Quiet or legal Joint already provides known denial;
- Emergency pruned when it cannot hold but legal Hold can;
- Emergency remains last-ditch when no better viable route exists;
- threshold/pressure pruning exactly;
- Joint improves degraded partner but spends reserve;
- Hold requires unspent credible attribution + source severe cost;
- C5 use attribution removes Hold and records same source cost;
- final brittle reserve severe;
- all four classifications reachable;
- every displayed course non-dominated under #107 or creates blocker;
- no final course universal;
- terminal truth gated;
- V1 unchanged.

# Rejection conditions

Reject terminal implementation if it displays a route player-known state makes futile when another viable route exists, derives tactical warning from broad preparation assessment, shows late-reaction Quiet beside a strictly superior legal Joint route, keeps Emergency beside known-valid Quiet/Joint, offers mobilisation after backdown, treats attribution as source-free, permits Hold after C5 use, infers joint authority from sentiment, classifies pre-route state or matches route to hidden opening posture.
