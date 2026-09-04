---
type: v2-kestrel-terminal-contract
status: active
---

# Kestrel Terminal Matrix

Backlink: [[README]]

This is the implementation authority for Kestrel C6 route legality, physical resolution, terminal state effects and classification. It uses verified canonical state and the safe observable crisis family, never hidden opening posture as a player answer key.

[[23-HQ-BELIEF-AND-EVIDENCE]] owns assessment/warning/public-case semantics. [[25-KESTREL-CONSEQUENCE-MATRIX]] owns persisted directional attribution state. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns cross-system timing/authority.

# Inputs

Terminal resolution may use:

- safe crisis family;
- Beacon exposure/preparation;
- reserve condition;
- HQ tactical-warning state;
- persisted attribution opportunity state + claim direction;
- partner consent / C5 partner authority;
- commitments/concession/liaison history;
- severe-cost history.

# Derived predicates

`controlledExposure = beacon-exposure != open`

`preparedDenial = beacon-preparation == prepared`

`usableWarning = deriveV2HqBelief(...).warning == usable`

Do not derive warning from assessment direction.

`partnerAccess = partner-consent != withdrawn`

`jointAuthority = partnerAccess AND partner-authority in {joint, concession}`

Directional attribution:

```text
unspentAttribution = attribution-opportunity == { credible, preparation|coercion }
```

A generic credible record with no direction is invalid. The direction controls what the player can truthfully expose, **not by itself whether the physical Hold route exists**.

Safe crisis family:

- #99 attempt_seizure → seizure-underway;
- threshold_challenge → threshold-confrontation;
- abort_and_pressure → pressure-receding.

Prior hidden history remains private until debrief.

## Known physical adequacy

`quietCleanSeizure = preparedDenial AND controlledExposure AND usableWarning`

`quietLateReactionPossible = preparedDenial AND reserve-condition == usable AND NOT quietCleanSeizure`

`quietCanHoldSeizure = quietCleanSeizure OR quietLateReactionPossible`

`jointCanHoldSeizure = preparedDenial OR controlledExposure`

`jointBaseSeizure = jointAuthority AND reserve-condition != brittle AND jointCanHoldSeizure`

`emergencyCanHoldSeizure = reserve in {usable, strained} OR (reserve == brittle AND preparedDenial)`

`quietCredibleThreshold = preparedDenial OR controlledExposure`

All derive from player-known state.

# Final course IDs

Exactly:

- quiet-denial;
- joint-visible-denial;
- emergency-mobilisation;
- hold-and-expose.

Displayed subset excludes player-known futile or dominated responses.

# Route legality

## Quiet Denial

### Seizure

Require `quietCanHoldSeizure`.

If Quiet succeeds only through late reaction and `jointBaseSeizure` is true, omit Quiet because Joint provides the same hold while avoiding late-reaction severe cost and improving/preserving coalition position.

Clean Quiet remains alongside Joint where reserve-vs-politics trade is real.

### Threshold / pressure receding

Always legal.

## Joint Visible Denial

Base:

- crisis seizure or threshold;
- jointAuthority;
- reserve != brittle.

For seizure require `jointCanHoldSeizure`.

Prune when clean/credible Quiet supplies the same known result without final reserve cost and partner is already cooperative:

- seizure: quietCleanSeizure + cooperative partner;
- threshold: quietCredibleThreshold + cooperative partner.

Never legal for pressure receding.

## Hold And Expose

Base for every crisis:

- unspent directional attribution case;
- partnerAccess.

The claim direction is preserved and shown in safe copy:

- preparation case — expose the seizure-preparation sequence/physical case;
- coercion case — expose the coercive/deceptive pressure campaign.

### Seizure

Additional physical requirements:

- preparedDenial;
- controlledExposure.

**Either credible claim direction may be legal.** The route's physical viability comes from Beacon state, not from what the intelligence case says.

This does not mean the coercion case proves preparation. It means the commander may choose to hold militarily with already-prepared defenses while exposing the earlier coercive/deceptive campaign for political effect.

Omit when `quietCleanSeizure && partner-consent == cooperative`: source exposure buys no terminal advantage.

Any further claim-direction-specific dominance must be demonstrated by #107 from the complete player-safe state, not hard-coded as a semantic shortcut.

### Threshold

Either direction legal when:

- partner consent != cooperative; or
- quietCredibleThreshold false.

### Pressure receding

Either direction legal when partner consent != cooperative.

## Emergency Mobilisation

Only consider for seizure.

Let final `quietLegal`, `jointLegal`, `holdLegal` use the predicates above.

Emergency legal only when:

- quietLegal false;
- jointLegal false;
- and either emergencyCanHoldSeizure true or holdLegal false.

Thus valid Quiet/Joint prune Emergency; known-failing Emergency is pruned if a legal Hold route can already hold; when no better route can hold, Emergency remains last-ditch/best-effort.

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

If quietCleanSeizure:

- Beacon held;
- no automatic terminal reserve cost.

Otherwise route legality guarantees late-reaction path:

- Beacon held;
- reserve worsens one;
- severe late-reaction.

## Threshold

Beacon held. If quietCredibleThreshold, no partner movement; otherwise partner worsens one.

## Pressure receding

Beacon held; no automatic reserve/partner movement.

# Joint Visible Denial effects

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

Otherwise Beacon lost. Known-doomed Emergency appears only when no other legal route can hold.

Emergency is never clean Strategic Success.

# Hold And Expose effects

Precondition includes a specific credible direction.

Persist:

`{ credible, direction } → { used, same direction }`.

Effects:

- Beacon held in every state where route is legal;
- severe attribution-source-exposed;
- partner improves one when below cooperative and not withdrawn.

The used direction is retained in causal record/debrief. The source cost is known before selection.

The immediate numerical state effects are currently the same for preparation/coercion cases; the **claim and historical meaning are different**. #107/human evidence must flag this if the two uses prove mechanically indistinguishable in every state where both are legal.

# C5 attribution use

C5 Use spends the same directional opportunity:

- credible(direction) → used(same direction);
- severe source exposure;
- authored immediate partner/discovery effects.

Later evidence never regenerates a spent opportunity or rewrites used direction.

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

Only routes with real known role remain:

- clean Quiet if prepared plan works and HQ has usable warning;
- late Quiet when plan exists but warning/positioning insufficient and Joint does not dominate;
- Joint when authority/physical state make visible coalition denial useful;
- Hold And Expose when an unspent **specific** public case plus prior physical posture makes source expenditure politically meaningful;
- Emergency when better prepared/joint/political paths are absent.

The intelligence case does not magically provide physical warning or defenses; those are separate predicates.

## Threshold

Quiet is restraint; Joint may spend reserve for coalition value; Hold may spend either directional case for political recovery. Emergency absent.

## Pressure receding

Quiet accepts de-escalation. Hold may spend either still-credible case to repair degraded political position. No mobilisation padding.

# Required tests

At minimum prove:

- legality uses only safe player-known state;
- raw hidden posture/preparation never affects route set;
- usableWarning from #100 warning, not assessment direction;
- coherent prep + warning none does not qualify clean Quiet;
- conflicted assessment + physical warning can have warning usable;
- generic directionless credible attribution rejected before terminal resolver;
- seizure Hold may be legal for preparation **or coercion** case when physical/partner predicates hold;
- safe copy and used state preserve the actual claim direction;
- preparation/coercion direction alone does not change physical hold capability;
- #107 pairwise dominance determines whether a direction-specific Hold is worth displaying in a concrete player-safe state;
- no displayed Quiet/Joint known unable to hold;
- late Quiet pruned when Joint dominates;
- Emergency pruned whenever legal Quiet/Joint already provides denial;
- Emergency pruned when unable to hold but legal Hold can;
- Emergency remains last-ditch where no better route holds;
- C5 Use removes Hold and preserves used direction;
- final brittle reserve severe;
- all four classifications reachable;
- every displayed course non-dominated under #107 or creates blocker;
- no final course universal;
- terminal truth gated;
- V1 unchanged.

# Rejection conditions

Reject terminal implementation if it displays player-known futile routes when a viable alternative exists, derives warning from assessment, uses claim direction as a substitute for physical preparedness, loses/rewrites the attribution claim direction, keeps a direction-specific Hold that #107 proves player-safe dominated, keeps late Quiet beside strictly superior Joint, keeps Emergency beside known-valid better routes, offers mobilisation after backdown, treats attribution as source-free, permits Hold after C5 Use, infers joint authority from sentiment, classifies pre-route state or matches routes to hidden opening posture.
