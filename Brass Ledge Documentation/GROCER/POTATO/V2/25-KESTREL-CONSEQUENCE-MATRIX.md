---
type: v2-kestrel-consequence-contract
status: active
---

# Kestrel Consequence Matrix

Backlink: [[README]]

This is the implementation authority for **#101 — concrete Kestrel persistent state, provenance, order consequences and recovery**. It is intentionally not a generic consequence engine.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns the pure-derived current intelligence/public-case basis.
- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns verified-prefix timing.
- [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns complete-package interactions and C5 partner authority/tempo.
- [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]] owns Ravellan-observation emission.
- [[27-KESTREL-TERMINAL-MATRIX]] owns terminal route effects.

# Product rule

Persistent state exists so the player can understand:

> something changed because of my order, headquarters direction, Ravellan, or an external condition, and now I have a different problem.

Do not collapse the records below into a universal score.

# Provenance

Every material transition records one of:

- `player-caused`;
- `player-conditioned`;
- `adversary-caused`;
- `external`.

Truth provenance is replayable. Player-facing causality remains belief-safe until terminal debrief.

# Concrete persistent records

## Beacon exposure

`contained → thin → open`

Opening: `thin`.

- contained — opportunistic move materially harder;
- thin — defensible with warning/preparation but exploitable;
- open — serious exploitable gap.

Improve/worsen one step where authored; clamp endpoints.

## Beacon preparation

`routine | prepared`

Opening: `routine`.

Separate from exposure: exposure is present vulnerability; preparation records whether HQ has done the work required to execute a denial plan.

## Reserve condition

`usable → strained → brittle`

Opening: `usable`.

Worsen/recover one step; clamp endpoints. Brittle is not automatic defeat.

## Partner consent

`cooperative → uneasy → conditional → withdrawn`

Opening: `cooperative`.

Ordinary improvement/deterioration moves one step unless an explicit recovery sets a state/floor. C5 political concession may restore a withdrawn partner to conditional at severe cost.

## Consultation promise

`none | active | honoured | breached`

Opening: `none`.

Only C1 formal consultation creates active. No implicit promise. Honoured/breached are terminal for Kestrel.

## Partner authority

`pending | none | joint | unilateral | concession`

Opening: `pending`.

Resolved by the C5 authority issue. It records permission/coordination, not relationship sentiment.

## Political concession

`none | active`

Opening: `none`.

C5 costly recovery. It may restore access/authority but remains a severe terminal cost.

## Liaison obligation

`none | active | fulfilled | breached`

Opening: `none`.

Created only by commander-only C4 partner-liaison fallback.

## Lattice investment

`0 | 1 | 2 | 3-operational`

Opening: `0`, plus the smallest deterministic missed-schedule state required to prove maturity is unreachable after a missed C1/C2/C3 advance. No catch-up.

## Attribution source use

Persist only irreversible source-use history, never a mutable mirror of #100's current read model.

Use a discriminated record equivalent to:

```ts
{ state: "unspent" }
| {
    state: "used"
    usedAtCycle: 5 | 6
    direction: "preparation" | "coercion"
    supportingEvidenceInstanceIds: string[]
    supportingSourceGroups: string[]
  }
```

Opening: `{ state: "unspent" }`.

The used record freezes:

- when the source was exposed;
- which public claim was made;
- the exact current #100 evidence basis relied on at use time;
- the independent source groups exposed.

All arrays are canonical/deterministic and come from the current verified #100 public-case basis. Later evidence or terminal truth can never rewrite this record.

There is no persisted `none`, `tentative`, `credible` or `expired` attribution-opportunity state.

# Derived current attribution availability

Current availability is a pure read model:

```ts
if (sourceUse.state === "used") {
  return { state: "unavailable", reason: "source-already-used" }
}
return currentHqBelief.publicCaseBasis
```

Therefore availability may currently be:

- none/null;
- tentative/preparation;
- tentative/coercion;
- tentative/null;
- credible-source-sensitive/preparation;
- credible-source-sensitive/coercion;
- unavailable because the source was already used.

Rules:

- C5 attribution issue exists only when source is unspent and current basis is credible-source-sensitive;
- C6 Hold And Expose can exist only under the same current credible/unspent condition plus terminal predicates;
- an unspent case may strengthen, weaken, disappear or change direction as legitimate evidence changes;
- holding in C5 does not freeze the C5 case for C6;
- using in C5/C6 freezes the actual claim and supporting evidence permanently;
- a strong assessment or tactical warning alone never creates public attribution availability;
- hidden Ravellan truth never creates or chooses a public claim.

This removes an unnecessary pre-command synchronization transition and avoids storing a second mutable truth beside #100.

# Helper semantics

For ordinal records, improve/worsen one moves exactly one step and clamps.

C5 is special: simultaneous Beacon/reserve signed effects are composed from the complete final-order set, summed, then clamped once under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]]. Never sequentially clamp issue effects.

Repeated causal contributions remain separately explainable even when net/clamped state does not move.

# Cycle 1

## `reinforce-watch`

Player-caused:

- Beacon exposure improves one (`thin → contained` opening);
- reserve worsens one.

Ravellan signals come from 37A.

## `ordinary-watch`

No persistent improvement. Opening exposure remains thin.

## `formal-consultation-agreement`

Player-caused:

- consultation promise `none → active`;
- partner improves one only if somehow below cooperative.

Creates the rapid formal channel used in later C2/C5 composition.

## `informal-liaison`

No promise/authority state.

## `protect-lattice-c1`

Lattice `0 → 1`. Missing it marks Kestrel maturity unreachable.

# Cycle 2 — shipping

## `quiet-escort`

No persistent reserve/partner penalty by default. Some delay and weaker visible deterrence are immediate course costs, not universal meters.

## `visible-patrol-surge`

Player-caused:

- reserve worsens one;
- if the complete C2 package is not coordinated, partner worsens one;
- active formal channel + joint warning coordinates it and avoids that partner deterioration.

## `reroute-and-monitor`

Player-caused:

- partner worsens one when disruption is not jointly coordinated/accepted;
- reserve unchanged.

Visible beat: larger civilian disruption. Information payoff is bounded #100 evidence, not an intelligence stat.

# Cycle 2 — public posture

## `remain-silent`

No persistent transition.

## `joint-non-attributive-warning`

Player-caused:

- improve partner one if uneasy/conditional;
- cannot restore withdrawn by itself.

## `public-accusation`

Always unilateral and commander-only.

Player-caused:

- partner worsens one regardless of whether a formal promise exists;
- active consultation promise becomes breached.

It does not manufacture a public case or mark the attribution source used: this is an unsupported accusation made without the later source-sensitive opportunity.

# Cycle 2 — Lattice

Protect on schedule only after C1 protection: `1 → 2`; otherwise maturity becomes unreachable.

# Cycle 3

## `forward-reserve-preparation`

Player-caused:

- Beacon preparation becomes prepared;
- reserve worsens one.

## `hold-reserve`

No persistent movement.

## `focus-staging-collection`

Player-caused:

- Beacon exposure worsens one;
- queues the C4 focused-staging evidence occurrence under #100.

## `maintain-current-coverage`

No focused occurrence and no collection-diversion exposure cost.

## `reassure-partner`

Player-caused:

- improve partner one if uneasy/conditional;
- cannot restore withdrawn;
- cannot erase a breached promise.

## `protect-lattice-c3`

If advances 1–2 succeeded: `2 → 3-operational`; otherwise maturity remains unreachable.

# Cycle 4

## `recover-reserve`

Player-caused:

- reserve improves one;
- Beacon exposure worsens one.

Endurance is bought with immediate security.

## `prepare-beacon-quietly`

Player-caused:

- Beacon preparation becomes prepared;
- Beacon exposure improves one;
- reserve worsens one.

Targeted detectability/discovery is owned by 37A.

## `press-visible-advantage`

Player-caused:

- reserve worsens one;
- partner worsens one if uncoordinated under known commitment/public state.

## Lattice Task Collection

No generic persistent bonus. Persist/replay task authority as required by #102; the resulting evidence occurrence remains pure derived readout.

## `request-partner-liaison`

Commander-only:

- liaison obligation `none → active`;
- queues the narrower C5 evidence occurrence.

Never Delegate.

# Cycle 5 — atomic composition

Resolve the complete final-order package under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

## Beacon posture signed effects

### `quiet-reinforce-beacon`

- exposure +1 improvement;
- Beacon preparation becomes prepared;
- reserve -1 when material commitment is required.

### `visible-reinforce-beacon`

- exposure +1;
- Beacon preparation becomes prepared;
- reserve -1.

Partner effect comes from the authority package, not an independent decrement.

### `hold-beacon-posture`

No direct state movement.

## Reserve signed effects

### `keep-reserve-forward`

- reserve -1;
- Beacon preparation becomes prepared if needed.

### `emergency-consolidation`

- reserve +1;
- Beacon exposure -1.

## Aggregation

For exposure/reserve:

- sum all signed C5 deltas from the complete final-order set;
- clamp once from pre-command state;
- preserve individual causal records.

Issue-array order never changes result.

# Cycle 5 — partner authority

## `honour-consultation`

Always player-legal.

Non-withdrawn partner:

- partner authority becomes joint for C6;
- active promise becomes honoured;
- active liaison obligation becomes fulfilled;
- partner improves one.

Withdrawn partner:

- partner authority becomes none;
- applicable promises/obligations may be honoured/fulfilled;
- partner remains withdrawn.

Same-cycle sensitive-action compatibility requires the active rapid formal channel under 39.

## `political-concession`

Where legal:

- authority becomes concession;
- political concession becomes active;
- withdrawn partner becomes conditional;
- active unbreached promise becomes honoured;
- active liaison obligation becomes fulfilled.

Severe terminal cost remains.

## `act-then-inform`

Legal only with at least one same-cycle partner-sensitive action.

- authority becomes unilateral;
- active promise becomes breached;
- active liaison obligation becomes breached;
- partner worsens exactly one step total for the unilateral package.

Partner-sensitive C5 actions are visible Beacon reinforcement and source-sensitive public attribution use.

# Cycle 5 — attribution

Derive current availability after all evidence due at C5 has been incorporated and before agenda construction.

## `hold-attribution`

Legal only when a credible current case makes the issue exist.

No persistent source-use transition. Source remains unspent. The current case is not frozen for C6.

## `use-attribution`

Legal only when:

- source use is unspent;
- current #100 public-case basis is credible-source-sensitive with direction and corroborating support;
- player spends one intervention;
- complete package provides compatible immediate authority.

Persist:

```ts
{
  state: "used",
  usedAtCycle: 5,
  direction: currentBasis.direction,
  supportingEvidenceInstanceIds: currentBasis.supportingEvidenceInstanceIds,
  supportingSourceGroups: currentBasis.supportingSourceGroups,
}
```

Common effects:

- protected source is exposed/compromised as severe cost;
- improve partner one if partner remains accessible and the use is coordinated/politically usable;
- unilateral package owns the one partner deterioration instead;
- 37A owns the discovery observation.

Player-facing copy/causal history states the exact preparation or coercion claim made. Later evidence/terminal truth cannot relabel it.

# Cycle 6 attribution handoff

[[27-KESTREL-TERMINAL-MATRIX]] receives:

- current derived #100 public-case basis;
- persistent source-use state;
- known physical/partner campaign state.

Hold And Expose, where legal, consumes the current case and persists the same used record with `usedAtCycle: 6`.

Claim direction controls truthful copy and debrief history. It does not create warning, preparation, partner authority or physical route adequacy.

If #107 proves a direction-specific Hold route is player-safe dominated in a complete state, #27 may prune that exact state. Do not globally treat one claim direction as a physical capability.

# Liaison obligation

C4 liaison creates active.

It becomes:

- fulfilled through an authored consultation/concession that satisfies it;
- breached through explicitly incompatible unilateral action;
- outstanding rather than automatically breached if still active at terminal.

# Severe-cost history

Before terminal-route effects, severe-cost history includes at minimum:

- consultation promise breached;
- political concession active;
- liaison obligation breached;
- source use/exposure if used at C5;
- other explicit authored commitment failure.

Reserve brittleness is evaluated on post-terminal-route state under 27. Terminal-only severe flags such as late reaction, emergency surge and overreaction are owned by 27/39.

No numeric cost score.

# Recovery invariant

Before C6, promised costly counterplay includes:

- reserve deterioration → C4 recovery / C5 emergency consolidation;
- Beacon weakness → C3/C4/C5 preparation/reinforcement;
- partner deterioration → reassurance, C5 consultation/authority, concession;
- withdrawal → concession may restore conditional access at severe cost while Honour remains integrity-only;
- missed Lattice → commander-only liaison fallback;
- information weakness → remaining focused/Lattice/liaison options when temporally useful.

A recovery option must change the threatened downstream state and must not be free.

# Ravellan observations

Do not infer them here. Exact emissions belong only to [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

Both preparation-case and coercion-case public use may emit `ravellan_discovery_signal = suspected` because the public act reveals protected collection. The signal does not mean both public claims say the same thing.

# Replay / authority

Every persisted mutation is replay-verifiable under [[30-ARCHITECTURE-CONTRACT]].

The source-use state is a genuine irreversible campaign mutation and belongs in the appropriate #101 command/terminal transition. Current public-case availability remains pure #100 readout and creates no synchronization ledger entry.

Any new persisted #101 state/ledger semantics follow the next actual prototype version, with no silent migration and V1 isolation.

# Required #101 tests

## Opening and consequences

- exact opening records;
- every order transition above;
- provenance correctness;
- ordinal clamping and C5 aggregate-once behavior;
- C2 coordinated/uncoordinated surge;
- C2 accusation partner/promise effects without source use;
- reroute cost separated from derived evidence;
- C4 quiet-prep reserve cost;
- liaison commander-only + obligation;
- withdrawn + Honour legal; concession costly recovery.

## Attribution read-model separation

- session persists source-use only, never none/tentative/credible mirror;
- no pre-command attribution synchronization ledger transition;
- current availability derives from #100 basis + source-use state;
- holding at C5 freezes no stale case for C6;
- a C5 case may legitimately disappear/change direction at C6 if held;
- strong assessment or warning alone cannot create availability;
- hidden truth with equal #100 basis leaves availability equal.

## Attribution use

- credible basis requires direction, exact support occurrence IDs and independent source groups;
- C5 Use writes usedAtCycle 5 and the exact basis;
- C6 Hold And Expose writes usedAtCycle 6 and the exact current basis;
- used record is immutable and makes all later availability unavailable;
- source-use/action replay tampering rejected;
- player-safe copy identifies the claim actually used;
- claim direction never substitutes for physical adequacy.

## Recovery/compatibility

- every promised recovery changes threatened state at real cost;
- all persisted records covered by hashes/replay;
- V1 unchanged.

# Rejection conditions

Reject #101 if it introduces:

- a mutable persisted mirror of #100 public-case availability;
- a pre-command synchronization transition solely to copy a derived read model;
- universal meters/trust scores;
- implicit promises;
- sequential C5 clamping or double political penalties;
- free recovery;
- hidden-truth attribution;
- a directionless or unsupported used claim;
- later rewriting/regeneration of source use;
- claim direction as physical warning/preparedness;
- liaison through Delegate;
- V1 state changes;
- a generic lifecycle/plugin framework before another scenario proves reuse.
