---
type: v2-kestrel-terminal-contract
status: active
---

# Kestrel Terminal Matrix

Backlink: [[README]]

This is the implementation authority for C6 route legality, physical resolution, terminal state effects and classification. It uses verified player-known state + safe overt crisis family, never hidden opening posture as an answer key.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns final pre-manifestation assessment/warning/public case.
- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns the C6 information cut.
- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns the producer envelope.
- [[25-KESTREL-CONSEQUENCE-MATRIX]] owns persisted campaign/source-use records.
- [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns C5 authority/tempo.

# 1. C6 temporal order

Use exactly:

```text
#99 selects/persists hidden terminal behaviour
→ any C5 Task Collection result resolves from authorised latest-normal/pre-manifestation facts
→ #100 derives final pre-manifestation assessment, current warning and public case
→ current attribution availability derives from public case + source-use state
→ terminal behaviour manifests as safe overt crisis family
→ legal routes derive from overt crisis + player-known campaign state
→ player selects route
→ terminal effects/classification persist and replay
```

The visible crisis never retroactively changes what HQ knew before manifestation. The Intelligence section is labelled:

> **What Intelligence knew immediately before the confrontation became overt.**

R6 action/row is never evidence or warning.

# 2. Legal inputs

Terminal route derivation may read only:

- safe crisis family;
- Beacon exposure/preparation;
- reserve;
- current #100 tactical warning;
- current #100 public-case basis;
- persistent #101 source-use record;
- partner consent/C5 authority;
- commitment/concession/liaison history;
- severe-cost history.

It may not read hidden opening posture, raw #99 policy row/action history, secret preparation history beyond legitimate known state, oracle truth or future outcomes.

# 3. Derived predicates

```text
controlledExposure = beaconExposure != open
preparedDenial = beaconPreparation == prepared
usableWarning = hqBelief.warning.state == usable
partnerAccess = partnerConsent != withdrawn
jointAuthority = partnerAccess AND partnerAuthority in {joint, concession}
```

Current public case:

```text
currentCredibleCase =
  attributionSourceUse.state == unspent
  AND hqBelief.publicCaseBasis.state == credible-source-sensitive
```

When true, retain exact:

- direction;
- ordered `[evidenceInstanceId1, evidenceInstanceId2]`;
- ordered `[corroborationGroupId1, corroborationGroupId2]`.

The two corroboration groups are distinct. There is no persisted credible mirror.

Safe crisis family:

- `attempt_seizure` → `seizure-underway`;
- `threshold_challenge` → `threshold-confrontation`;
- `abort_and_pressure` → `pressure-receding`.

Prior hidden history stays private until debrief.

# 4. Warning currency at C6

Route legality uses the **current warning role**, not the presence of an old preparation report.

Therefore:

- a C4 focused buildup can remain assessment/public-current at C6 while its warning is stale;
- without a C5 Lattice landing refresh, it does not qualify clean Quiet;
- a C5→C6 Lattice landing result can provide current warning;
- preparation assessment alone never qualifies current warning.

The player-safe surface explicitly says warning usable or no current direct warning before route choice.

# 5. Known physical adequacy

```text
quietCleanSeizure =
  preparedDenial
  AND controlledExposure
  AND usableWarning

quietLateReactionPossible =
  preparedDenial
  AND reserve == usable
  AND NOT quietCleanSeizure

quietCanHoldSeizure = quietCleanSeizure OR quietLateReactionPossible

jointCanHoldSeizure = preparedDenial OR controlledExposure

jointBaseSeizure =
  jointAuthority
  AND reserve != brittle
  AND jointCanHoldSeizure

emergencyCanHoldSeizure =
  reserve in {usable, strained}
  OR (reserve == brittle AND preparedDenial)

quietCredibleThreshold = preparedDenial OR controlledExposure
```

All derive from player-known state. Public claim direction never creates physical capability.

# 6. Final course IDs

Exactly:

- `quiet-denial`
- `joint-visible-denial`
- `emergency-mobilisation`
- `hold-and-expose`

Displayed subset excludes player-known futile or strictly dominated routes under the #107 relation.

# 7. Route legality

## Quiet Denial

### Seizure underway

Require `quietCanHoldSeizure`.

If Quiet succeeds only through late reaction and `jointBaseSeizure` is true, omit Quiet: Joint holds the position, avoids late-reaction severe cost and preserves/improves coalition state.

Clean Quiet may remain beside Joint where reserve-versus-politics trade is real.

### Threshold / pressure receding

Always legal.

## Joint Visible Denial

Base:

- crisis is seizure or threshold;
- joint authority;
- reserve not brittle.

For seizure also require `jointCanHoldSeizure`.

Prune when known clean Quiet supplies same result without final reserve cost and partner is already cooperative:

- seizure: `quietCleanSeizure && partnerConsent == cooperative`;
- threshold: `quietCredibleThreshold && partnerConsent == cooperative`.

Never legal for pressure receding.

## Hold And Expose

Base for every crisis:

- current credible case;
- partner access.

Claim direction controls truthful action/copy:

- preparation — expose a substantiated seizure-preparation case;
- coercion — expose a substantiated coercive/deceptive pressure campaign.

Direction does not create preparedness/warning/authority.

### Seizure

Additional:

- prepared denial;
- controlled exposure.

Either direction may be legal because existing physical defense holds Beacon. Omit when `quietCleanSeizure && partnerConsent == cooperative`: source exposure buys no terminal advantage.

Any further direction-specific pruning needs complete #107 player-safe dominance proof, not a hard “wrong claim” rule.

### Threshold

Legal when either:

- partner consent not cooperative; or
- `quietCredibleThreshold` false.

### Pressure receding

Legal only when partner consent not cooperative.

## Emergency Mobilisation

Consider only for seizure.

Let `quietLegal`, `jointLegal`, `holdLegal` be the final predicates above.

Legal only when:

- quietLegal false;
- jointLegal false;
- and either emergency can hold or Hold is not legal.

Thus:

- valid Quiet/Joint prunes Emergency;
- known-failing Emergency is pruned if Hold can preserve Beacon;
- if no better route can hold, Emergency remains last-ditch/best-effort.

# 8. Resolution order

1. derive/prune route set from current safe state;
2. validate route;
3. evaluate physical feasibility from pre-route state;
4. derive Beacon held/lost;
5. apply route state/source-use costs;
6. derive post-route access/severe-cost set;
7. derive Pareto vector/classification;
8. persist/replay terminal transition;
9. expose hidden truth only after completion.

# 9. Route effects

## Quiet Denial

### Clean seizure hold

If `quietCleanSeizure`:

- Beacon held;
- no automatic terminal reserve cost.

### Late seizure reaction

Otherwise legality guarantees late path:

- Beacon held;
- reserve worsens one;
- severe `late-reaction`.

### Threshold

Beacon held.

If `quietCredibleThreshold`, no partner movement; otherwise partner worsens one.

### Pressure receding

Beacon held; no automatic reserve/partner movement.

## Joint Visible Denial

- Beacon held;
- reserve worsens one;
- partner improves one when below cooperative and not withdrawn;
- access survives because joint authority was prerequisite.

## Emergency Mobilisation

If emergency can hold:

- Beacon held;
- reserve worsens one;
- severe `emergency-surge`;
- if no joint authority and partner not withdrawn, partner worsens one.

Otherwise Beacon lost. A known-doomed Emergency appears only where no other displayed route can hold.

Emergency never produces clean Strategic Success.

## Hold And Expose

Persist exact source use:

```ts
{
  state: "used",
  usedAtCycle: 6,
  direction: currentCase.direction,
  supportingEvidenceInstanceIds: currentCase.supportingEvidenceInstanceIds,
  supportingCorroborationGroupIds: currentCase.supportingCorroborationGroupIds,
}
```

Validation requires exactly two evidence IDs, exactly two distinct corroboration-group IDs and one-to-one correspondence with the current #100 basis.

Effects:

- Beacon held wherever route is legal;
- severe `attribution-source-exposed`;
- partner improves one when below cooperative and not withdrawn.

The exact claim/source cost is shown before selection. Terminal truth never rewrites the used basis.

The immediate physical effects are currently the same for preparation/coercion claims. #107 flags the distinction as underpriced if no complete player-safe state gives it meaningful strategic/history value; it does not invent arbitrary bonuses.

# 10. C5 source use/holding

If source was used in C5, C6 Hold is unavailable regardless of later evidence.

Holding in C5 persists nothing. C6 availability is re-derived from the final #100 basis and may appear, disappear or change direction legitimately.

# 11. Severe-cost set

After route effects, include where present:

- final reserve brittle;
- promise breached;
- concession active;
- liaison obligation breached;
- source used/exposed;
- late reaction;
- emergency surge;
- authored overreaction;
- other frozen severe commitment history.

## Overreaction

Joint Visible against threshold is overreaction only when:

- post-route reserve brittle; or
- authority required concession.

No numeric score.

# 12. Terminal classification

1. **Operational Defeat** — Beacon lost.
2. **Political Defeat** — Beacon held but final partner access withdrawn.
3. **Costly Success** — Beacon held + access survives + at least one severe cost.
4. **Strategic Success** — Beacon held + access survives + no severe cost.

# 13. Pareto vector

Post-route dimensions:

- Beacon security;
- partner consent/access;
- reserve readiness;
- commitment integrity.

Classification/severe flags remain separate and participate in #107 local dominance.

# 14. State-space completeness

#107 exhausts every reachable C6 player-known state across:

- crisis family;
- Beacon exposure/preparation;
- reserve;
- **current** warning;
- partner consent/authority;
- commitments/concession/liaison;
- source use;
- current public-case state/direction/two-item basis.

For each:

- route set non-empty;
- every displayed route executes;
- no displayed pair player-safe dominated;
- no route universal;
- claim direction alone never changes physical adequacy;
- Hold uses exact current final pre-manifestation basis.

The architecture envelope says a credible coercion case + attempt seizure is not normal-producer reachable, but generic terminal functions remain type-safe if supplied that algebraically valid state. #107 does not pretend it is a required normal-play fixture.

# 15. Required tests

## Information/source boundary

- hidden posture/history cannot affect route set except through safe state;
- warning uses #100 warning role, not assessment or warning-history existence;
- focused warning can be stale at C6 while assessment/public evidence remains current;
- coherent preparation + warning none does not qualify clean Quiet;
- conflicted assessment + current warning may qualify warning-sensitive predicates;
- current public case comes from final pre-manifestation #100 + unspent source;
- no persisted credible mirror;
- C5 held case may change/disappear at C6;
- C5 used source permanently removes Hold;
- Hold writes exact direction/two evidence IDs/two corroboration groups.

## Physical/pruning

- no displayed Quiet/Joint seizure route known unable to hold;
- late Quiet pruned whenever Joint strictly dominates;
- clean Quiet retained where reserve/politics trade is real;
- Emergency pruned when valid Quiet/Joint exists;
- Emergency pruned when it cannot hold but Hold can;
- Emergency remains best effort where no better route holds;
- threshold/receding pruning exact.

## Attribution

- directionless/one-source case invalid;
- either direction can be physically legal where Hold predicates hold;
- claim copy/used record preserve exact basis;
- direction alone does not change physical result;
- direction-specific pruning requires #107 dominance proof.

## Outcome/replay

- Joint improves degraded partner but spends reserve;
- Hold spends source;
- final brittle reserve severe;
- all four classifications reachable;
- no final course universal;
- terminal transition replay/tamper proof;
- truth gated;
- V1 unchanged.

# 16. Rejection conditions

Reject terminal implementation if it:

- reads a persisted none/tentative/credible mirror;
- derives warning from assessment or stale warning history;
- uses claim direction as physical capability;
- uses a frozen C5 case instead of final C6 basis;
- stores generic source groups rather than exact corroboration groups;
- displays known-futile/dominated routes;
- keeps late Quiet beside strictly superior Joint;
- keeps Emergency beside valid better routes;
- offers mobilisation after pressure recedes;
- treats attribution as source-free or permits it after use;
- infers joint authority from sentiment;
- classifies pre-route state;
- matches routes to hidden opening posture;
- treats R6 action as intelligence;
- lets terminal truth rewrite the claim HQ actually used.
