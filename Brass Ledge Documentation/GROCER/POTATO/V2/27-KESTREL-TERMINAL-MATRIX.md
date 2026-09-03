---
type: v2-kestrel-terminal-contract
status: active
---

# Kestrel Terminal Matrix

Backlink: [[README]]

This is the implementation authority for Kestrel Cycle-6 route legality, physical resolution, terminal state effects and classification. It uses only verified canonical state and the **safe observable crisis family**, never hidden opening posture as a player answer key.

[[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns cross-system timing/authority details.

## Inputs

Terminal resolution may use:

- safe crisis family derived from #99 terminal behavior;
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

Both preparation+weak and preparation+coherent qualify. Generic credible coercion attribution does not.

`partnerAccess = partner-consent != withdrawn`

`jointAuthority = partnerAccess AND partner-authority in {joint, concession}`

`unspentAttribution = attribution-opportunity == credible`

### Safe crisis family

- #99 `attempt_seizure` → `seizure-underway`
- `threshold_challenge` → `threshold-confrontation`
- `abort_and_pressure` → `pressure-receding`

Prior hidden posture/preparation stays private until debrief.

### Quiet adequacy

For route-pruning/known trade-offs:

- `quietCleanSeizure = preparedDenial AND controlledExposure AND usableWarning`
- `quietCredibleThreshold = preparedDenial OR controlledExposure`

These are player-known predicates.

## Final course IDs

Exactly:

- `quiet-denial`
- `joint-visible-denial`
- `emergency-mobilisation`
- `hold-and-expose`

The legal subset depends on known terminal state so the UI does not offer an option that is strictly worse for every outcome already knowable at that point.

## Route legality

### Quiet Denial

- `seizure-underway`: legal only if `preparedDenial`.
- `threshold-confrontation`: always legal.
- `pressure-receding`: always legal.

### Joint Visible Denial

Base requirements:

- crisis is `seizure-underway` OR `threshold-confrontation`;
- `jointAuthority`;
- pre-route reserve != `brittle`.

Additionally omit it when all are true:

- Quiet is already the clean/credible known response for that crisis;
- partner consent is already `cooperative`.

Concretely:

- seizure: if `quietCleanSeizure && partner-consent == cooperative`, Joint is not legal;
- threshold: if `quietCredibleThreshold && partner-consent == cooperative`, Joint is not legal.

Reason: in those player-known states Joint would spend reserve without improving physical or political position.

It is **never legal** for `pressure-receding`.

### Emergency Mobilisation

Legal only for:

`seizure-underway`

It is the brute-force comeback against an actual seizure, not a knowingly irrational response to a visible threshold challenge/backdown.

### Hold And Expose

Base:

- `unspentAttribution`;
- `partnerAccess`.

Against seizure additionally require:

- `preparedDenial`;
- `controlledExposure`.

Against threshold it is legal when at least one is true:

- partner consent != cooperative;
- `quietCredibleThreshold` is false.

Against pressure receding it is legal only when:

- partner consent != cooperative.

Against seizure, omit Hold And Expose when `quietCleanSeizure` AND partner consent is cooperative; Quiet is then a clean player-known answer and public source exposure would buy no terminal benefit.

These applicability rules preserve Hold And Expose when it trades source exposure for political recovery / reduced late-reaction cost, but remove it when it would be pure self-harm.

## Resolution order

1. validate route against the player-known route predicates above;
2. use pre-route state for physical feasibility;
3. derive Beacon held/lost;
4. apply terminal route state/cost effects;
5. derive post-route access/severe cost;
6. derive Pareto vector/classification;
7. persist/replay;
8. only then expose terminal truth debrief.

## Quiet Denial

### Seizure

Clean hold if:

- prepared denial;
- controlled exposure;
- usable warning.

If clean conditions fail but pre-route state has:

- prepared denial;
- reserve `usable`;

then a late reaction still holds Beacon:

- reserve worsens one;
- severe flag `late-reaction`.

Otherwise Beacon lost.

### Threshold confrontation

Beacon held.

If `quietCredibleThreshold`:

- no partner movement.

If neither prepared denial nor controlled exposure:

- partner consent worsens one step.

Meaning: refusing to overreact is still physically safe, but a visibly weak/underprepared coalition can lose political confidence under sustained threshold pressure.

### Pressure receding

Beacon held; no automatic reserve/partner movement.

This is the clean “accept de-escalation / maintain restrained posture” route.

## Joint Visible Denial

Physical:

- seizure → Beacon held if `preparedDenial OR controlledExposure`;
- threshold → Beacon held.

Effects:

- reserve worsens one;
- partner consent improves one step when below cooperative and not withdrawn;
- access remains because joint authority is required.

This makes the route trade force readiness for coalition reassurance/visible denial where that benefit is actually needed.

## Emergency Mobilisation

Only available against seizure.

Physical from pre-route state:

- reserve usable/strained → Beacon held;
- reserve brittle + prepared denial → Beacon held;
- reserve brittle without prepared denial → Beacon lost.

If Beacon held:

- reserve worsens one;
- severe `emergency-surge`;
- if no joint authority and partner not withdrawn, partner worsens one.

This is the last-ditch comeback, never a clean Strategic Success substitute.

## Hold And Expose

Selecting it consumes:

`attribution-opportunity: credible → used`

It also records severe-cost history:

`attribution-source-exposed`

The Kestrel credible attribution opportunity is source-sensitive: making the case publicly burns/protectively compromises that source. This is a concrete cost, not an intelligence-resource meter.

Effects:

- improve partner one step when below cooperative and not withdrawn.

Physical:

- seizure → Beacon held because route legality already requires prepared denial + controlled exposure;
- threshold/pressure receding → Beacon held.

The route therefore exchanges a protected source for political/exposure payoff and is not a free upgrade over Quiet Denial.

## C5 attribution use and source exposure

Public C5 `use-attribution` uses the **same** source-sensitive opportunity:

- credible → used;
- record `attribution-source-exposed` severe-cost history;
- apply its authored immediate partner/discovery effects.

Later evidence may change HQ belief but does not regenerate another credible opportunity in Kestrel.

## Severe cost

After route effects, severe cost is true if any authored severe condition applies, including:

- final reserve = brittle;
- consultation promise breached;
- political concession active;
- liaison obligation breached;
- `attribution-source-exposed`;
- `late-reaction`;
- `emergency-surge`;
- authored overreaction below;
- any other explicit severe commitment history frozen in #101.

### Overreaction

After the route-pruning above:

- Joint Visible against threshold is overreaction only when post-route reserve is brittle OR authority required political concession.

Joint/Emergency are unavailable against pressure receding, so no separate backdown-overreaction trap remains.

No numeric score.

## Terminal classification

1. **Operational Defeat** — Beacon lost.
2. **Political Defeat** — Beacon held but final partner consent/access = withdrawn.
3. **Costly Success** — Beacon held + access survives + severe cost.
4. **Strategic Success** — Beacon held + access survives + no severe cost.

## Pareto vector

Report post-route:

- Beacon security;
- partner consent/access;
- reserve readiness;
- commitment integrity.

Also report terminal classification/severe-cost flags separately. The local-course dominance diagnostic may consider both Pareto relation and classification/severe-cost state; it must not treat a source-compromising route as a free Pareto improvement merely because source integrity is not one of the four main axes.

## Design intent by crisis

### Seizure underway

The game asks whether the campaign built enough physical denial, coalition authority or emergency reserve to survive a real move. Routes that are known-inferior to a clean Quiet response are pruned.

### Threshold confrontation

The choice is between:

- absorb pressure quietly if the coalition looks credible;
- visibly reassure/deny jointly by spending reserve;
- use preserved evidence to recover/strengthen the political position at source cost.

Emergency is not offered because the player can see there is no seizure to emergency-mobilise against.

### Pressure receding

The player may:

- accept de-escalation quietly;
- if the partner position is damaged and credible evidence is still unspent, expose Ravellan at source cost to recover political ground.

The game does not offer obviously self-harming mobilisation/show-of-force buttons after the opponent is visibly backing down.

## Required tests

At minimum:

- route legality uses only safe player-known state;
- raw prior posture/preparation never affects route set;
- Quiet legal rules and threshold partner-cost condition;
- Joint unavailable after pressure receding and pruned when clean Quiet + cooperative partner makes it player-safe dominated;
- Joint improves degraded partner but spends reserve;
- Emergency available only against seizure and follows physical/cost rules;
- Hold requires unspent credible attribution, appropriate crisis/state predicate, and source exposure severe cost;
- C5 use attribution records the same source exposure and removes Hold And Expose;
- no route ending in brittle reserve escapes severe cost;
- all four classifications reachable in fixtures;
- across viable reachable terminal states, each displayed legal course is non-dominated under #107's player-safe relation or triggers a design blocker;
- no final course universal;
- terminal truth gated;
- V1 unchanged.

## Rejection conditions

Reject implementation if it offers Emergency/Joint after a known backdown, exposes a known-inferior visible route when a clean Quiet response and cooperative partner make it strictly worse, treats public attribution as source-free, permits Hold after C5 use, treats coercion evidence as warning, infers joint authority from sentiment, classifies pre-route state, or matches routes to hidden opening posture.