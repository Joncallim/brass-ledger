---
type: v2-kestrel-terminal-contract
status: active
---

# Kestrel Terminal Matrix

Backlink: [[README]]

This is the implementation authority for Kestrel Cycle-6 route legality, physical resolution, terminal state effects and classification. It uses verified canonical state and the **safe observable crisis family**, never hidden opening posture as a player answer key.

[[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns cross-system timing/authority details.

## Inputs

Terminal resolution may use:

- safe crisis family;
- Beacon exposure/preparation;
- reserve condition;
- HQ assessment/evidence;
- unspent attribution opportunity;
- partner consent / C5 partner authority;
- explicit commitments/concession/liaison history;
- severe-cost history.

## Derived predicates

`controlledExposure = beacon-exposure != open`

`preparedDenial = beacon-preparation == prepared`

`usableWarning = HQ assessment direction == preparation`

Both preparation+weak and preparation+coherent qualify. Generic coercion attribution does not.

`partnerAccess = partner-consent != withdrawn`

`jointAuthority = partnerAccess AND partner-authority in {joint, concession}`

`unspentAttribution = attribution-opportunity == credible`

Safe crisis family:

- #99 `attempt_seizure` → `seizure-underway`
- `threshold_challenge` → `threshold-confrontation`
- `abort_and_pressure` → `pressure-receding`

Prior hidden posture/preparation remains private until debrief.

### Known physical adequacy predicates

These exist to avoid displaying a route that the **player-known current state** makes deterministically unable to do what the route claims.

`quietCleanSeizure = preparedDenial AND controlledExposure AND usableWarning`

`quietCanHoldSeizure = preparedDenial AND (quietCleanSeizure OR reserve-condition == usable)`

The second clause is the authored late-reaction fallback.

`jointCanHoldSeizure = preparedDenial OR controlledExposure`

`emergencyCanHoldSeizure = reserve in {usable, strained} OR (reserve == brittle AND preparedDenial)`

`quietCredibleThreshold = preparedDenial OR controlledExposure`

All are derived only from player-known state.

## Final course IDs

Exactly:

- `quiet-denial`
- `joint-visible-denial`
- `emergency-mobilisation`
- `hold-and-expose`

The displayed legal subset is pruned so it does not include a route already known to be physically futile or strictly worse across the current player-known state.

# Route legality

## Quiet Denial

### `seizure-underway`

Legal only if:

`quietCanHoldSeizure`

A prepared plan that the known current reserve/warning/exposure state cannot execute successfully is not displayed as a fake “quiet solution.”

### `threshold-confrontation`

Always legal.

### `pressure-receding`

Always legal.

## Joint Visible Denial

Base requirements:

- crisis is seizure or threshold;
- `jointAuthority`;
- pre-route reserve != `brittle`.

For seizure additionally require:

`jointCanHoldSeizure`

A visible joint response that the known physical state cannot hold Beacon with is not displayed as a viable denial course.

Additionally omit Joint when a player-known Quiet route already achieves the same physical/political purpose without spending final reserve:

- seizure: if `quietCleanSeizure && partner-consent == cooperative`;
- threshold: if `quietCredibleThreshold && partner-consent == cooperative`.

Never legal for pressure receding.

## Hold And Expose

Base:

- `unspentAttribution`;
- `partnerAccess`.

Against seizure additionally require:

- `preparedDenial`;
- `controlledExposure`.

Against threshold legal when at least one:

- partner consent != cooperative;
- `quietCredibleThreshold` is false.

Against pressure receding legal only when:

- partner consent != cooperative.

Against seizure omit when `quietCleanSeizure && partner-consent == cooperative`; source exposure would buy no terminal benefit over a clean Quiet response.

## Emergency Mobilisation

Emergency is a **fallback**, not a permanent fourth button.

It is considered only for:

`seizure-underway`

Let `quietLegal`, `jointLegal` and `holdLegal` mean the route predicates above for the current state.

Emergency is legal only when:

- `quietLegal == false`;
- `jointLegal == false`;
- and either `emergencyCanHoldSeizure == true` **or** `holdLegal == false`.

Meaning:

- if a known-valid Quiet plan already holds Beacon, Emergency is strictly worse and is pruned;
- if a known-valid Joint plan already holds Beacon, Emergency is strictly worse and is pruned;
- if Emergency itself is known unable to hold Beacon but Hold And Expose can, Emergency is pruned;
- if no better viable course exists, Emergency remains the last-ditch fallback, including a doomed best-effort state caused by earlier campaign failure.

This preserves painful comeback without padding the finale with a known inferior mobilisation button.

# Resolution order

1. derive/prune routes from player-known state;
2. validate selected route;
3. use pre-route state for physical feasibility;
4. derive Beacon held/lost;
5. apply terminal route state/cost effects;
6. derive post-route access/severe cost;
7. derive Pareto vector/classification;
8. persist/replay;
9. only then expose terminal truth debrief.

# Quiet Denial

## Seizure

Route legality guarantees one of two authored hold paths.

### Clean hold

If:

- prepared denial;
- controlled exposure;
- usable warning;

Beacon held with no automatic terminal reserve cost.

### Late reaction

Otherwise legality requires prepared denial + pre-route reserve usable.

Beacon held, then:

- reserve worsens one;
- severe `late-reaction`.

## Threshold

Beacon held.

If `quietCredibleThreshold`:

- no partner movement.

Otherwise:

- partner consent worsens one.

Meaning: restraint is physically safe, but visibly weak/underprepared coalition posture can lose political confidence under sustained pressure.

## Pressure receding

Beacon held; no automatic reserve/partner movement.

This is clean restrained acceptance of de-escalation.

# Joint Visible Denial

Route legality guarantees physical adequacy for seizure.

Physical:

- seizure → Beacon held;
- threshold → Beacon held.

Effects:

- reserve worsens one;
- partner consent improves one when below cooperative and not withdrawn;
- access remains because joint authority required.

This trades final readiness for coalition reassurance / visible denial where that value is actually needed.

# Emergency Mobilisation

Only displayed as seizure fallback under the route rule above.

Physical:

- if `emergencyCanHoldSeizure` → Beacon held;
- otherwise → Beacon lost (this occurs only when no other legal route can hold, leaving a last-ditch best effort).

If Beacon held:

- reserve worsens one;
- severe `emergency-surge`;
- if no joint authority and partner not withdrawn, partner worsens one.

Emergency is never clean Strategic Success.

# Hold And Expose

Selecting it consumes:

`attribution-opportunity: credible → used`

and records severe:

`attribution-source-exposed`

The credible case is source-sensitive; public exposure burns/compromises the protected source. This known cost must be disclosed before selection.

Effects:

- improve partner one step when below cooperative and not withdrawn.

Physical:

- seizure → Beacon held because legality already requires prepared denial + controlled exposure;
- threshold / pressure receding → Beacon held.

# C5 attribution use

C5 public `use-attribution` spends the same source-sensitive opportunity:

- `credible → used`;
- severe `attribution-source-exposed`;
- authored immediate partner/discovery effects.

Later evidence may change HQ belief but never regenerates another credible Kestrel attribution opportunity.

# Severe cost

After route effects, severe cost is true if any authored severe condition applies, including:

- final reserve = brittle;
- consultation promise breached;
- political concession active;
- liaison obligation breached;
- `attribution-source-exposed`;
- `late-reaction`;
- `emergency-surge`;
- authored overreaction;
- other explicit severe commitment history frozen in #101.

## Overreaction

After route pruning:

- Joint Visible against threshold is overreaction only when post-route reserve is brittle OR authority required political concession.

Joint/Emergency are absent for pressure receding.

No numeric score.

# Terminal classification

1. **Operational Defeat** — Beacon lost.
2. **Political Defeat** — Beacon held but final partner access withdrawn.
3. **Costly Success** — Beacon held + access survives + severe cost.
4. **Strategic Success** — Beacon held + access survives + no severe cost.

# Pareto vector

Report post-route:

- Beacon security;
- partner consent/access;
- reserve readiness;
- commitment integrity.

Also report classification/severe flags separately. #107 local dominance considers both so source/emergency/late-reaction costs are not invisible merely because they are not extra global axes.

# Design intent by crisis

## Seizure underway

The final decision exposes only plans that are genuinely capable under known state, plus Emergency as last-ditch fallback when prepared/joint plans are unavailable. Hold And Expose remains a real trade only where source exposure buys political value or preserves reserve relative to the remaining military fallback.

## Threshold confrontation

Player may:

- absorb pressure quietly;
- where it adds coalition value, visibly deny jointly at reserve cost;
- use preserved evidence to improve political position at source cost.

Emergency is absent because no seizure is underway.

## Pressure receding

Player may:

- accept de-escalation quietly;
- if partner position is damaged and evidence remains unspent, expose Ravellan at source cost.

No mobilisation/show-of-force padding.

# Required tests

At minimum prove:

- route legality uses only safe player-known state;
- raw prior posture/preparation never affects route set;
- no displayed seizure Quiet route is known unable to hold Beacon;
- no displayed seizure Joint route is known unable to hold Beacon;
- Emergency pruned whenever legal Quiet or legal Joint already provides known physical denial;
- Emergency pruned when it cannot hold but legal Hold And Expose can;
- Emergency remains available as last-ditch route when no better viable route exists, including a doomed best-effort state;
- threshold/pressure pruning exactly;
- Joint improves degraded partner but spends reserve;
- Hold requires unspent credible attribution, crisis/state predicate and source-exposure severe cost;
- C5 use attribution records same source cost and removes Hold;
- final brittle reserve always severe;
- all four classifications reachable in authored fixtures;
- every displayed legal course is non-dominated under #107 or creates blocking design finding;
- no final course universal;
- terminal truth gated;
- V1 unchanged.

# Rejection conditions

Reject terminal implementation if it displays a route the player-known state makes deterministically futile when another viable route exists, keeps Emergency alongside a known-valid Quiet/Joint response, offers mobilisation after backdown, treats attribution as source-free, permits Hold after C5 use, treats coercion evidence as seizure warning, infers joint authority from sentiment, classifies pre-route state or matches route to hidden opening posture.
