---
type: v2-kestrel-terminal-contract
status: active
---

# Kestrel Terminal Matrix

Backlink: [[README]]

This is the implementation authority for Kestrel C6 route legality, physical resolution, terminal state effects and classification. It uses verified player-known state plus the safe overt crisis family, never hidden opening posture as an answer key.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns the final pre-manifestation assessment, warning and public-case basis.
- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns the C6 temporal cut and verified history.
- [[25-KESTREL-CONSEQUENCE-MATRIX]] owns persistent source-use and campaign records.
- [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns C5 authority/tempo composition.
- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns the intelligence state-space envelope consumed here.

# C6 temporal order

Use exactly:

```text
#99 selects hidden terminal behaviour
→ any C5 Task Collection result resolves against authorised pre-manifestation facts
→ #100 derives the final pre-manifestation intelligence snapshot
→ current attribution availability derives from that snapshot + source-use state
→ terminal behaviour manifests as the safe overt crisis family
→ legal terminal routes derive from overt crisis + player-known campaign state
→ player selects one route
→ authoritative terminal effects/classification persist and replay
```

The visible crisis does not retroactively alter what HQ knew before manifestation. The Command Room labels the intelligence readout as the **last pre-manifestation picture**.

# Inputs

Terminal route derivation may use only:

- safe crisis family;
- Beacon exposure/preparation;
- reserve condition;
- #100 tactical-warning object;
- #100 current public-case basis, including exact direction/supporting evidence;
- persistent attribution source-use state;
- partner consent / C5 partner authority;
- commitments, concession and liaison history;
- severe-cost history.

It may not use hidden opening posture, raw #99 policy row, secret preparation history beyond facts already represented in legitimate player-known state, oracle truth or future outcomes.

# Derived predicates

```text
controlledExposure = beacon-exposure != open
preparedDenial = beacon-preparation == prepared
usableWarning = hqBelief.warning.state == usable
partnerAccess = partner-consent != withdrawn
jointAuthority = partnerAccess AND partner-authority in {joint, concession}
```

Current attribution case:

```text
currentCredibleCase =
  attribution-source-use.state == unspent
  AND hqBelief.publicCaseBasis.state == credible-source-sensitive
```

When true, retain the entire current basis:

- direction;
- ordered supporting evidence occurrence IDs;
- ordered supporting source groups.

There is no persisted `credible` mirror.

Safe crisis family:

- #99 `attempt_seizure` → `seizure-underway`;
- `threshold_challenge` → `threshold-confrontation`;
- `abort_and_pressure` → `pressure-receding`.

Prior hidden history remains private until debrief.

## Known physical adequacy

```text
quietCleanSeizure = preparedDenial AND controlledExposure AND usableWarning

quietLateReactionPossible =
  preparedDenial
  AND reserve-condition == usable
  AND NOT quietCleanSeizure

quietCanHoldSeizure = quietCleanSeizure OR quietLateReactionPossible

jointCanHoldSeizure = preparedDenial OR controlledExposure

jointBaseSeizure =
  jointAuthority
  AND reserve-condition != brittle
  AND jointCanHoldSeizure

emergencyCanHoldSeizure =
  reserve-condition in {usable, strained}
  OR (reserve-condition == brittle AND preparedDenial)

quietCredibleThreshold = preparedDenial OR controlledExposure
```

All physical predicates derive from player-known state. A public claim direction does not create preparation, warning or force capability.

# Final course IDs

Exactly:

- `quiet-denial`
- `joint-visible-denial`
- `emergency-mobilisation`
- `hold-and-expose`

The displayed subset excludes routes the player-known state makes futile or strictly dominated under the canonical #107 relation.

# Route legality

## Quiet Denial

### Seizure underway

Require `quietCanHoldSeizure`.

If Quiet succeeds only through late reaction and `jointBaseSeizure` is true, omit Quiet: Joint holds the same position, avoids late-reaction severe cost and preserves/improves the coalition.

Clean Quiet may remain beside Joint where the reserve-versus-politics trade is real.

### Threshold confrontation / pressure receding

Always legal.

## Joint Visible Denial

Base:

- crisis is seizure or threshold;
- jointAuthority;
- reserve is not brittle.

For seizure, also require `jointCanHoldSeizure`.

Prune when known credible Quiet supplies the same result without the final reserve cost and the partner is already cooperative:

- seizure: `quietCleanSeizure && partner-consent == cooperative`;
- threshold: `quietCredibleThreshold && partner-consent == cooperative`.

Never legal for pressure receding.

## Hold And Expose

Base for every crisis:

- currentCredibleCase;
- partnerAccess.

The case retains its exact direction:

- preparation — expose a substantiated seizure-preparation sequence/physical preparation case;
- coercion — expose a substantiated coercive/deceptive pressure campaign.

The direction changes truthful copy/history, not physical adequacy.

### Seizure underway

Additional physical requirements:

- preparedDenial;
- controlledExposure.

Either credible direction may be legal because Beacon is held by already-prepared physical defenses, not by the public claim.

Omit when `quietCleanSeizure && partner-consent == cooperative`: source exposure buys no terminal advantage.

Any further direction-specific pruning requires a complete player-safe dominance result from #107, not a hard semantic shortcut.

### Threshold confrontation

Legal when either:

- partner consent is not cooperative; or
- `quietCredibleThreshold` is false.

### Pressure receding

Legal only when partner consent is not cooperative.

## Emergency Mobilisation

Consider only for seizure.

Let `quietLegal`, `jointLegal` and `holdLegal` be the final predicates above.

Emergency is legal only when:

- quietLegal is false;
- jointLegal is false;
- and either emergencyCanHoldSeizure is true or holdLegal is false.

Consequences:

- known-valid Quiet or Joint prunes Emergency;
- known-failing Emergency is pruned if Hold can already preserve Beacon;
- when no better route can hold, Emergency remains the last-ditch/best-effort response.

# Resolution order

1. derive/prune route set from safe current state;
2. validate selected route;
3. use pre-route state for physical feasibility;
4. derive Beacon held/lost;
5. apply route state/source-use costs;
6. derive post-route access and severe-cost set;
7. derive Pareto vector and classification;
8. persist/replay the authoritative terminal transition;
9. expose hidden truth only after completion.

# Route effects

## Quiet Denial

### Seizure — clean hold

If `quietCleanSeizure`:

- Beacon held;
- no automatic terminal reserve cost.

### Seizure — late reaction

Otherwise route legality guarantees the late-reaction path:

- Beacon held;
- reserve worsens one;
- severe `late-reaction`.

### Threshold

Beacon held.

If `quietCredibleThreshold`, no partner movement; otherwise partner worsens one.

### Pressure receding

Beacon held; no automatic reserve/partner movement.

## Joint Visible Denial

- Beacon held for seizure/threshold;
- reserve worsens one;
- partner improves one when below cooperative and not withdrawn;
- access remains because joint authority was required.

## Emergency Mobilisation

Only seizure fallback.

If `emergencyCanHoldSeizure`:

- Beacon held;
- reserve worsens one;
- severe `emergency-surge`;
- if no joint authority and partner is not withdrawn, partner worsens one.

Otherwise Beacon lost. A known-doomed Emergency appears only where no other displayed route can hold.

Emergency is never clean Strategic Success.

## Hold And Expose

Precondition includes a current credible public-case basis and unspent source.

Persist exact source use:

```ts
{
  state: "used",
  usedAtCycle: 6,
  direction: currentCase.direction,
  supportingEvidenceInstanceIds: currentCase.supportingEvidenceInstanceIds,
  supportingSourceGroups: currentCase.supportingSourceGroups,
}
```

Effects:

- Beacon held in every state where route is legal;
- severe `attribution-source-exposed`;
- partner improves one when below cooperative and not withdrawn.

The source cost and exact claim are known before selection. Later terminal truth cannot rewrite the used basis.

The immediate physical/state effects are currently the same for preparation/coercion cases; #107 must flag the distinction as underpriced if no complete player-safe state gives them a meaningful strategic/copy/history difference.

# C5 source use

If source was used in C5, persistent state already contains the exact used basis and C6 currentCredibleCase is false regardless of later evidence.

Holding in C5 persists nothing. C6 availability is re-derived from the final current #100 basis; it may appear, disappear or change direction legitimately.

# Severe-cost set

After route effects, include where present:

- final reserve brittle;
- consultation promise breached;
- political concession active;
- liaison obligation breached;
- attribution source used/exposed;
- late reaction;
- emergency surge;
- authored overreaction;
- other frozen severe commitment history.

## Overreaction

Joint Visible against threshold is overreaction only when:

- post-route reserve is brittle; or
- authority required political concession.

No numeric score.

# Terminal classification

1. **Operational Defeat** — Beacon lost.
2. **Political Defeat** — Beacon held but final partner access withdrawn.
3. **Costly Success** — Beacon held + access survives + at least one severe cost.
4. **Strategic Success** — Beacon held + access survives + no severe cost.

# Pareto vector

Post-route dimensions:

- Beacon security;
- partner consent/access;
- reserve readiness;
- commitment integrity.

Classification and severe flags remain separate and participate in #107 local dominance.

# State-space completeness

#107 must exhaust every reachable C6 safe state across:

- crisis family;
- Beacon exposure/preparation;
- reserve;
- warning;
- partner consent/authority;
- commitments/concession/liaison;
- source use;
- current public-case state/direction/support basis.

For every safe state:

- displayed route set is non-empty;
- every displayed route executes;
- no displayed pair is player-safe dominated;
- no route family is universal;
- claim direction alone never changes physical adequacy;
- current basis/support IDs used by Hold are the exact final pre-manifestation #100 basis.

# Required tests

## Information/source boundary

- hidden Ravellan posture/preparation history cannot affect route set except through legitimate safe state;
- warning comes from #100 warning object, never assessment direction;
- coherent preparation + warning none does not qualify clean Quiet;
- conflicted assessment + physical warning may qualify warning-sensitive predicates;
- current public case is derived from final pre-manifestation #100 snapshot + unspent source;
- no persisted credible mirror is consumed;
- C5 held case may change/disappear by C6;
- C5 used source makes Hold unavailable permanently;
- Hold writes exact direction/support IDs/source groups.

## Physical/pruning

- no displayed Quiet/Joint seizure route is known unable to hold;
- late Quiet pruned whenever Joint strictly dominates it;
- clean Quiet remains where reserve/politics trade is real;
- Emergency pruned whenever legal Quiet/Joint provides known denial;
- Emergency pruned when it cannot hold but Hold can;
- Emergency remains last-ditch when no better route holds;
- pressure/threshold pruning exact.

## Attribution direction/value

- directionless credible case invalid;
- either direction can be physically legal where all Hold predicates hold;
- safe claim copy and used record preserve exact direction/basis;
- direction alone does not change physical result;
- any direction-specific pruning is supported by #107 complete-state dominance;
- C5 source use removes C6 Hold without needing a mirrored opportunity state.

## Outcome/replay

- Joint improves degraded partner but spends reserve;
- Hold spends source and preserves exact basis;
- final brittle reserve severe;
- all four classifications reachable;
- every displayed course non-dominated or creates blocker;
- no final course universal;
- terminal transition replay/tamper proof;
- truth gated;
- V1 unchanged.

# Rejection conditions

Reject terminal implementation if it:

- reads a persisted none/tentative/credible opportunity mirror;
- derives warning from assessment;
- uses public-claim direction as physical capability;
- uses a stale C5 case instead of the final C6 #100 basis;
- fails to persist exact supporting evidence/source groups on use;
- displays known-futile/dominated routes;
- keeps late Quiet beside strictly superior Joint;
- keeps Emergency beside known-valid better routes;
- offers mobilisation after pressure recedes;
- treats attribution as source-free;
- permits Hold after source use;
- infers joint authority from sentiment;
- classifies pre-route state;
- matches routes to hidden opening posture;
- lets terminal truth rewrite the case HQ actually used.
