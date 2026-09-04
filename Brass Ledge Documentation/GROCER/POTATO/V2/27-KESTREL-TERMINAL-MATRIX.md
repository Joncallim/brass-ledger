---
type: v2-kestrel-terminal-contract
status: active
---

# Kestrel Terminal Matrix

Backlink: [[README]]

This is the implementation authority for Kestrel C6 route legality, physical resolution, terminal state effects and classification. It uses verified canonical state and the **safe observable crisis family**, never hidden opening posture as a player answer key.

[[23-HQ-BELIEF-AND-EVIDENCE]] owns assessment/warning/public-case semantics. [[25-KESTREL-CONSEQUENCE-MATRIX]] owns the persisted directional attribution opportunity. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns cross-system timing/authority.

# Inputs

Terminal resolution may use:

- safe crisis family;
- Beacon exposure/preparation;
- reserve condition;
- HQ derived tactical-warning state;
- HQ assessment/evidence only where separately authorised;
- persisted attribution opportunity **state + claim direction**;
- partner consent / C5 partner authority;
- commitments/concession/liaison history;
- severe-cost history.

# Derived predicates

`controlledExposure = beacon-exposure != open`

`preparedDenial = beacon-preparation == prepared`

`usableWarning = deriveV2HqBelief(...).warning == usable`

Do not derive warning from `assessment.direction == preparation`.

A commander may assess preparation without timely physical warning; direct warning may exist while wider assessment remains conflicted.

`partnerAccess = partner-consent != withdrawn`

`jointAuthority = partnerAccess AND partner-authority in {joint, concession}`

Directional attribution predicates:

```text
unspentPreparationCase = attribution-opportunity == { credible, preparation }
unspentCoercionCase    = attribution-opportunity == { credible, coercion }
unspentAttribution     = unspentPreparationCase OR unspentCoercionCase
```

A generic credible state with no direction is invalid before this matrix.

Safe crisis family:

- #99 attempt_seizure → seizure-underway;
- threshold_challenge → threshold-confrontation;
- abort_and_pressure → pressure-receding.

Prior hidden posture/preparation remains private until debrief.

## Known physical adequacy

`quietCleanSeizure = preparedDenial AND controlledExposure AND usableWarning`

`quietLateReactionPossible = preparedDenial AND reserve-condition == usable AND NOT quietCleanSeizure`

`quietCanHoldSeizure = quietCleanSeizure OR quietLateReactionPossible`

`jointCanHoldSeizure = preparedDenial OR controlledExposure`

`jointBaseSeizure = jointAuthority AND reserve-condition != brittle AND jointCanHoldSeizure`

`emergencyCanHoldSeizure = reserve in {usable, strained} OR (reserve == brittle AND preparedDenial)`

`quietCredibleThreshold = preparedDenial OR controlledExposure`

All are player-known-state derivations.

# Final course IDs

Exactly:

- quiet-denial;
- joint-visible-denial;
- emergency-mobilisation;
- hold-and-expose.

Displayed subset excludes routes player-known state makes physically futile or strictly worse.

# Route legality

## Quiet Denial

### Seizure underway

Require `quietCanHoldSeizure`.

If Quiet succeeds only through late reaction and `jointBaseSeizure` is true, omit Quiet: both spend one reserve step to hold Beacon, while Joint also improves/preserves coalition position and avoids late-reaction severe cost.

Clean Quiet remains alongside Joint where a real reserve-vs-politics trade exists.

### Threshold

Always legal.

### Pressure receding

Always legal.

## Joint Visible Denial

Base:

- crisis seizure or threshold;
- jointAuthority;
- reserve pre-route != brittle.

For seizure require `jointCanHoldSeizure`.

Prune when clean/credible Quiet supplies the same known result without final reserve cost and partner already cooperative:

- seizure: quietCleanSeizure + cooperative partner;
- threshold: quietCredibleThreshold + cooperative partner.

Never legal for pressure receding.

## Hold And Expose

Base for every crisis:

- unspent directional attribution case;
- partnerAccess.

### Seizure underway

Additional requirements:

- **claim direction must be preparation** (`unspentPreparationCase`);
- preparedDenial;
- controlledExposure.

A credible **coercion** case is not legal here. The overt seizure has invalidated that claim as the basis for a final political exposure route. The player may still have acted reasonably on the earlier case; terminal truth does not retroactively erase the history, but it cannot make the now-contradicted claim mechanically useful.

Also omit when `quietCleanSeizure && partner-consent == cooperative`; source exposure would buy no terminal advantage.

### Threshold confrontation

Either credible claim direction may be used.

Legal when:

- partner consent != cooperative; or
- quietCredibleThreshold is false.

Safe copy must identify the actual claim:

- preparation case — expose the preparation sequence/physical case;
- coercion case — expose the coercive/deceptive pressure campaign.

### Pressure receding

Either credible claim direction may be used when partner consent != cooperative.

Again, copy/effect provenance must preserve the claim direction.

## Emergency Mobilisation

Emergency is fallback, not a permanent fourth button.

Consider only for seizure.

Let `quietLegal`, `jointLegal`, `holdLegal` be final predicates above.

Emergency legal only when:

- quietLegal false;
- jointLegal false;
- and either emergencyCanHoldSeizure true or holdLegal false.

Thus:

- valid Quiet/Joint prunes Emergency;
- known-failing Emergency is pruned if a legal **preparation-case** Hold route can hold;
- a coercion case does not suppress Emergency during seizure because it cannot create legal Hold;
- when no better viable course exists, Emergency remains last-ditch/best-effort.

# Resolution order

1. derive/prune routes from player-known state;
2. validate selected route;
3. use pre-route state for physical feasibility;
4. derive Beacon held/lost;
5. apply route state/cost effects;
6. derive post-route access/severe cost;
7. derive Pareto/classification;
8. persist/replay;
9. expose terminal truth only after completion.

# Quiet Denial effects

## Seizure

### Clean hold

If quietCleanSeizure:

- Beacon held;
- no automatic terminal reserve cost.

### Late reaction

Otherwise route legality guarantees late-reaction path with no legal Joint route strictly dominating it:

- Beacon held;
- reserve worsens one;
- severe late-reaction.

## Threshold

Beacon held.

If quietCredibleThreshold, no partner movement; otherwise partner worsens one.

## Pressure receding

Beacon held; no automatic reserve/partner movement.

# Joint Visible Denial effects

Route legality guarantees physical adequacy for seizure.

- Beacon held for seizure/threshold;
- reserve worsens one;
- partner improves one when below cooperative and not withdrawn;
- access remains because joint authority required.

# Emergency Mobilisation effects

Only seizure fallback.

If emergencyCanHoldSeizure:

- Beacon held;
- reserve worsens one;
- severe emergency-surge;
- if no joint authority and partner not withdrawn, partner worsens one.

Otherwise Beacon lost. Known-doomed Emergency appears only when no other legal route can hold, preserving a best-effort response after accumulated failure.

Emergency is never clean Strategic Success.

# Hold And Expose effects

Precondition includes a specific credible direction.

Persist:

```text
{ credible, direction } → { used, same direction }
```

Effects:

- severe attribution-source-exposed;
- partner improves one when below cooperative and not withdrawn;
- Beacon held in every state where route is legal.

The direction is retained in the terminal causal record/debrief.

The source cost is known before selection.

# C5 attribution use

C5 use spends the same source-sensitive directional opportunity:

- credible(direction) → used(same direction);
- severe source exposure;
- authored immediate partner/discovery effects.

Later evidence never regenerates a credible opportunity during Kestrel.

# Severe cost

After route effects include where present:

- final reserve brittle;
- consultation promise breached;
- political concession active;
- liaison obligation breached;
- attribution-source-exposed;
- late-reaction;
- emergency-surge;
- authored overreaction;
- other frozen severe commitment history.

## Overreaction

Joint Visible against threshold is overreaction only when post-route reserve brittle OR authority required political concession.

No numeric score.

# Terminal classification

1. Operational Defeat — Beacon lost.
2. Political Defeat — Beacon held but final partner access withdrawn.
3. Costly Success — Beacon held + access survives + severe cost.
4. Strategic Success — Beacon held + access survives + no severe cost.

# Pareto vector

Post-route:

- Beacon security;
- partner consent/access;
- reserve readiness;
- commitment integrity.

Classification/severe flags remain separate and are considered by #107 local dominance.

# Design intent

## Seizure

Only routes with a real known role remain:

- clean Quiet if prepared plan works **and HQ has usable warning**;
- late Quiet when plan exists but warning/positioning insufficient, only when Joint does not dominate;
- Joint when authority/physical state make visible coalition denial useful;
- Hold And Expose only when the unspent **preparation** case plus prior physical posture make source expenditure meaningful;
- Emergency only when better prepared/joint/political paths are absent.

This makes information content matter without turning finale into “guess hidden posture.”

## Threshold

Quiet is restraint; Joint may spend reserve to improve/reassure coalition; Hold may spend either a preparation or coercion case for political recovery. Emergency absent.

## Pressure receding

Quiet accepts de-escalation. Hold may spend either still-credible case to repair a degraded political position. No mobilisation padding.

# Required tests

At minimum prove:

- legality uses only safe player-known state;
- raw hidden posture/preparation never affects route set;
- usableWarning comes from #100 warning, not assessment direction;
- preparation coherent + warning none does not qualify for clean Quiet;
- unclear/conflicted + physical warning can have warning usable;
- generic directionless credible attribution cannot enter terminal resolver;
- seizure + credible coercion case does **not** display Hold;
- seizure + credible preparation case may display Hold when physical/partner predicates hold;
- threshold/receding can display Hold for either direction with correct safe claim copy;
- used direction remains unchanged after route;
- no displayed Quiet/Joint seizure route known unable to hold;
- late Quiet pruned when Joint strictly dominates;
- clean Quiet remains where partner trade is real;
- Emergency pruned whenever legal Quiet/Joint already provides denial;
- coercion case does not incorrectly prune Emergency during seizure;
- Emergency pruned when it cannot hold but legal preparation-case Hold can;
- Emergency remains last-ditch when no better viable route exists;
- Joint improves degraded partner but spends reserve;
- C5 Use removes Hold and preserves used direction;
- final brittle reserve severe;
- all four classifications reachable;
- every displayed course non-dominated under #107 or creates blocker;
- no final course universal;
- terminal truth gated;
- V1 unchanged.

# Rejection conditions

Reject terminal implementation if it displays a route player-known state makes futile when another viable route exists, derives warning from assessment, treats a coercion public case as preparation evidence during an overt seizure, loses the claim direction when using/exposing the source, keeps late Quiet beside strictly superior Joint, keeps Emergency beside known-valid better routes, offers mobilisation after backdown, treats attribution as source-free, permits Hold after C5 use, infers joint authority from sentiment, classifies pre-route state or matches routes to hidden opening posture.
