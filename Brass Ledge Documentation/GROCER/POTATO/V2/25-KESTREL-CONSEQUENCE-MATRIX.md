---
type: v2-kestrel-consequence-contract
status: active
---

# Kestrel Consequence Matrix

Backlink: [[README]]

This is the implementation authority for **#101 — concrete Kestrel persistent state, consequence provenance and costly recovery**. It is not a generic consequence engine.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns current derived assessment/warning/public case.
- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns trusted information cuts.
- [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] owns corroboration semantics.
- [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns C2/C5 atomic interactions.
- [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]] owns adversary-observation emission.
- [[27-KESTREL-TERMINAL-MATRIX]] owns terminal route effects.

# 1. Product rule

Persistent state should let the player understand:

> Something changed because of my order, the standing direction I set, Ravellan, or an external condition, and now I have a different problem.

Do not collapse these records into one score.

# 2. Exact persistent state

## Beacon exposure

`contained | thin | open`

Opening: `thin`.

Ordered best→worst: contained, thin, open. Improve/worsen moves one step and clamps.

## Beacon preparation

`routine | prepared`

Opening: `routine`.

Separate from exposure: exposure is current vulnerability; preparation records whether HQ has built an executable denial plan.

## Reserve condition

`usable | strained | brittle`

Opening: `usable`.

Ordered best→worst. Worsen/recover one step and clamp. Brittle is not automatic defeat.

## Partner consent

`cooperative | uneasy | conditional | withdrawn`

Opening: `cooperative`.

Ordered best→worst. Improve/worsen one step and clamp unless an explicit recovery sets a state/floor.

## Consultation promise

`none | active | honoured | breached`

Opening: `none`.

C1 formal consultation creates `active` and means exactly:

> Consult the partner before a major visible military escalation or public attribution.

The rapid consultation channel exists iff the **pre-package** promise state is `active`.

The promise is breached by:

- C2 uncoordinated `visible-patrol-surge`;
- C2 `public-accusation`;
- C4 `press-visible-advantage`;
- C5 `act-then-inform` when the package contains a partner-sensitive action.

The promise is not breached merely by civilian rerouting, quiet preparation, quiet reinforcement, reserve posture or withholding attribution, though those may have other political costs.

`honoured` and `breached` are terminal for Kestrel. A breached promise no longer supplies a rapid channel.

## Partner authority

`pending | none | joint | unilateral | concession`

Opening: `pending`.

Resolved at C5. It records operational permission/coordination, not relationship sentiment.

## Political concession

`none | active`

Opening: `none`.

C5 costly recovery. It may restore access/authority but remains a severe terminal cost.

## Liaison obligation

`none | active | fulfilled | breached`

Opening: `none`.

Created only by commander-only C4 liaison. An `active` obligation at terminal is outstanding, not silently fulfilled or automatically breached.

## Lattice investment

Use the exact discriminated state:

```ts
{ state: "on-track"; protectedThroughCycle: 0 | 1 | 2 }
| { state: "operational" }
| { state: "unreachable"; missedAtCycle: 1 | 2 | 3 }
```

Opening:

```ts
{ state: "on-track", protectedThroughCycle: 0 }
```

Transitions:

- protect C1 from on-track/0 → on-track/1;
- protect C2 from on-track/1 → on-track/2;
- protect C3 from on-track/2 → operational;
- leave the scheduled protection in C1/C2/C3 → unreachable with that exact `missedAtCycle`;
- no catch-up, rewind, partial benefit or further investment issue after unreachable/operational.

#102 later adds task/used-target state under a new persisted prototype format. #101 does not pre-add opaque future task fields.

## Attribution source use

Persist only irreversible use:

```ts
{ state: "unspent" }
| {
    state: "used"
    usedAtCycle: 5 | 6
    direction: "preparation" | "coercion"
    supportingEvidenceInstanceIds: readonly [string, string]
    supportingCorroborationGroupIds: readonly [string, string]
  }
```

Opening: `{ state: "unspent" }`.

The two corroboration-group IDs are distinct and correspond positionally to the two stored evidence IDs.

The used record freezes exactly:

- when the source was exposed;
- which public claim was made;
- the deterministic two-item #100 public-case basis used;
- the independent corroboration groups exposed.

Later evidence or terminal truth can never rewrite it.

There is no persisted `none/tentative/credible/expired` opportunity mirror.

# 3. Derived current attribution availability

```ts
if (sourceUse.state === "used") {
  return { state: "unavailable", reason: "source-already-used" }
}
return currentHqBelief.publicCaseBasis
```

C5 attribution issue and C6 Hold And Expose require:

- source unspent;
- current basis `credible-source-sensitive`;
- exact direction and two-item corroborated support;
- any additional package/terminal predicates.

Holding in C5 persists nothing and freezes no case for C6.

Assessment direction or tactical warning alone never creates availability. Hidden truth never creates or chooses the claim.

# 4. Consequence provenance

Do not add a free-form mutable consequence log.

Every authoritative transition resolver returns deterministic **derived consequence facts** alongside its persisted post-state. They are reproducible from trusted ledger entries and canonical content.

Equivalent fact:

```ts
type V2ConsequenceFact = Readonly<{
  cycle: 1|2|3|4|5|6
  ruleId: string
  provenance: "player-caused" | "player-conditioned" | "adversary-caused" | "external"
  sourceOrderIds: readonly string[]
  stateField: string
  beforeRef: string
  afterRef: string
  contributionRef?: string
}>
```

Rules:

- no player-written prose or arbitrary patch;
- canonical rule/order IDs only;
- C5 aggregate contributions remain individually explainable even when net state does not move;
- reveal/debrief may reconstruct facts by replaying the same transition, not by trusting saved client data;
- facts are not another persisted authoritative state unless a later explicit decision proves reconstruction insufficient.

# 5. Ordinal and atomic arithmetic

Ordinary improve/worsen moves one step and clamps.

For C2 partner and C5 reserve/exposure, derive signed contributions from the **complete final-order set**, sum, then clamp once from pre-command state. Never sequentially apply issue-array order.

Retain one derived consequence fact per contribution plus the net result.

# 6. Cycle 1

## Beacon watch

### `reinforce-watch`

- exposure improves one;
- reserve worsens one.

### `ordinary-watch`

No persistent state movement.

## Partner consultation

### `formal-consultation-agreement`

- promise `none → active`;
- partner improves one only if somehow below cooperative;
- establishes rapid channel while promise remains active.

### `informal-liaison`

No promise/channel state.

## Lattice

Use exact investment transitions in section 2.

# 7. Cycle 2 — atomic partner composition

First determine whether visible surge is coordinated:

```text
coordinatedVisibleSurge =
  pre-command consultationPromise == active
  AND package contains joint-non-attributive-warning
  AND package contains visible-patrol-surge
```

Partner signed contributions:

| Course | Contribution |
| --- | ---: |
| `quiet-escort` | 0 |
| coordinated `visible-patrol-surge` | 0 |
| uncoordinated `visible-patrol-surge` | -1 |
| `reroute-and-monitor` | -1 |
| `remain-silent` | 0 |
| `joint-non-attributive-warning` | +1 |
| `public-accusation` | -1 |

Sum and clamp once.

Consequences/examples:

- formal channel + joint warning + visible surge → visible penalty neutralised and joint warning may improve partner one;
- no channel + joint warning + visible surge → +1 and -1 net to zero, while the uncoordinated surge breaches an active promise if one existed;
- reroute + joint warning → net zero but both disruption and reassurance remain causally visible;
- reroute + accusation → two-step deterioration where room exists.

## Shipping physical/reserve effects

### `quiet-escort`

- no reserve movement;
- limited shipping delay is immediate course cost, not a permanent meter.

### `visible-patrol-surge`

- reserve worsens one;
- emits reserve-deployment event and visible denial/coverage under 37A.

### `reroute-and-monitor`

- reserve unchanged;
- larger civilian disruption;
- triggers derived C3 #100 evidence under its own contract.

## Promise effects

- uncoordinated visible surge breaches active promise;
- accusation breaches active promise;
- coordinated visible surge leaves promise active;
- reroute/joint warning/silence/quiet escort do not themselves resolve/breach it.

Public accusation does not create/use the protected attribution source.

## Lattice

Protect/leave exact schedule transition.

# 8. Cycle 3

## `forward-reserve-preparation`

- Beacon preparation → prepared;
- reserve worsens one.

## `hold-reserve`

No persistent movement.

## `focus-staging-collection`

- exposure worsens one;
- triggers C4 focused #100 occurrence;
- does not change Lattice used-target state or consume `landing-force-staging`.

## `maintain-current-coverage`

No focused occurrence/exposure cost.

## `reassure-partner`

- partner improves one if uneasy/conditional;
- cannot restore withdrawn or erase breached promise.

## Lattice

Protect/leave exact schedule transition.

# 9. Cycle 4

## `recover-reserve`

- reserve improves one;
- exposure worsens one.

## `prepare-beacon-quietly`

- Beacon preparation → prepared;
- exposure improves one;
- reserve worsens one.

## `press-visible-advantage`

- reserve worsens one;
- partner worsens one;
- active consultation promise → breached;
- visible/coverage/discovery signals under 37A.

There is no hidden automatic consultation course in C4. The political cost is exact, not “where applicable.”

## Lattice Task Collection

#101 persists no task result or generic bonus. #102 later owns task authority. The resulting evidence remains derived.

## `request-partner-liaison`

- liaison obligation `none → active`;
- triggers one C5 derived auxiliary occurrence;
- never Delegate.

# 10. Cycle 5 — complete atomic package

Use [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

## Beacon/reserve signed effects

| Course | Exposure delta | Reserve delta | Other |
| --- | ---: | ---: | --- |
| `quiet-reinforce-beacon` | +1 | -1 when material commitment required | preparation → prepared |
| `visible-reinforce-beacon` | +1 | -1 | preparation → prepared; partner-sensitive |
| `hold-beacon-posture` | 0 | 0 | — |
| `keep-reserve-forward` | 0 | -1 | preparation → prepared |
| `emergency-consolidation` | -1 | +1 | — |

`+1` means improve, `-1` worsen for the relevant ordered state.

Sum reserve/exposure contributions then clamp once. Setting preparation to prepared is idempotent.

## Partner authority

### `honour-consultation`

If partner accessible:

- authority → joint for C6;
- active promise → honoured;
- active liaison obligation → fulfilled;
- partner improves one.

If withdrawn:

- authority → none;
- active promise/liaison may still become honoured/fulfilled;
- partner remains withdrawn.

Same-cycle sensitive action through Honour requires pre-package active rapid channel + accessible partner.

### `political-concession`

Where legal:

- authority → concession;
- concession → active;
- withdrawn partner → conditional;
- active promise → honoured;
- active liaison → fulfilled;
- immediate sensitive authority;
- severe concession.

### `act-then-inform`

Legal only with at least one partner-sensitive action:

- authority → unilateral;
- active promise → breached;
- active liaison → breached;
- partner worsens exactly one step total for the unilateral package;
- immediate sensitive authority.

Partner-sensitive C5 actions:

- `visible-reinforce-beacon`;
- `use-attribution`.

# 11. Cycle 5 attribution

Derive availability after all C5-due evidence and before agenda construction.

## `hold-attribution`

No persistent source-use transition. Current case is not frozen.

## `use-attribution`

Legal only when:

- source unspent;
- current #100 basis is credible-source-sensitive;
- player spends one normal intervention;
- complete package provides immediate authority.

Persist exactly:

```ts
{
  state: "used",
  usedAtCycle: 5,
  direction: currentBasis.direction,
  supportingEvidenceInstanceIds: currentBasis.supportingEvidenceInstanceIds,
  supportingCorroborationGroupIds: currentBasis.supportingCorroborationGroupIds,
}
```

Validate two IDs, two distinct groups and correspondence with the current basis.

Effects:

- severe source exposure;
- improve partner one only where coordinated/politically usable and partner accessible;
- unilateral package uses its one package-level deterioration instead;
- discovery observation under 37A.

Claim copy states preparation or coercion exactly. Later evidence/truth cannot relabel it.

# 12. Cycle 6 attribution handoff

[[27-KESTREL-TERMINAL-MATRIX]] receives current final #100 public case + source-use record + known physical/partner state.

Hold And Expose, where legal, persists the same structure with `usedAtCycle: 6`.

Claim direction controls truthful copy/history only. It never creates warning, preparation, authority or physical adequacy.

# 13. Liaison obligation

C4 liaison creates active.

At C5:

- Honour/Concession can fulfil it;
- Act Then Inform breaches it;
- if still active at terminal, it is outstanding rather than silently resolved.

# 14. Severe-cost history

Before terminal-route effects include where present:

- promise breached;
- concession active;
- liaison breached;
- source used/exposed at C5;
- other explicit authored commitment failure.

Reserve brittleness is evaluated after the terminal route. Terminal-only late reaction, emergency surge and overreaction belong to 27.

No numeric cost score.

# 15. Recovery invariant

Before C6, costly counterplay includes:

- reserve deterioration → C4 recovery / C5 consolidation;
- Beacon weakness → C3/C4/C5 preparation/reinforcement;
- partner deterioration → reassurance, C5 authority choices, concession;
- withdrawal → concession may restore conditional access at severe cost while Honour remains integrity-only;
- missed Lattice → commander-only liaison;
- information weakness → remaining focused/Lattice/liaison routes where temporally useful.

A recovery must change the threatened downstream state and cannot be free.

# 16. Ravellan observations

Do not infer observations here. Exact emissions belong only to [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

Both claim directions may emit discovery because public use exposes protected collection; that does not make their claims identical.

# 17. Replay integration

#101 changes persisted V2 state. Inspect the actual predecessor version, advance exactly once, reject earlier prototype payloads without migration, and preserve V1.

Extend the existing `command-set` authoritative resolver to apply player-caused C1–C5 consequence state and reverse observations atomically from final orders. Do not add a second generic “consequence update” entry for changes wholly determined by the command set.

Any external/system mutation not determined by a command set must use its own narrow replay-verifiable transition. Do not widen `ravellan-decision`.

Trusted replay recomputes:

- state transitions;
- C2/C5 aggregate arithmetic;
- promise/authority/liaison states;
- source-use exact basis;
- Ravellan observations;
- hashes/revisions.

Derived consequence facts are recomputed, not trusted saved payload.

# 18. Required tests

## State schemas

- exact opening state;
- exact Lattice on-track/operational/unreachable transitions;
- impossible progress/missed combinations rejected;
- promise/authority/liaison/source-use discriminated states exact;
- source-use exactly two distinct corroboration groups.

## C1–C4 transitions

- every order above;
- C2 partner signed matrix and clamp-once order independence;
- visible surge coordination and promise breach exact;
- reroute+warning and reroute+accusation examples;
- C4 press always political cost and active-promise breach;
- focused collection never consumes Lattice landing;
- provenance facts deterministic.

## C5

- aggregate reserve/exposure once;
- preparation idempotent;
- partner authority/tempo exact;
- withdrawn+Honour legal;
- Concession costly recovery;
- Act one package-level partner deterioration;
- issue-order invariance.

## Attribution

- no persisted current-case mirror/synchronisation transition;
- availability derives from #100 + source use;
- one-source/directionless case cannot be used;
- Hold freezes no case;
- C5/C6 Use stores exact `usedAtCycle`, direction, two evidence IDs and two distinct corroboration groups;
- used record immutable/unavailable later;
- claim direction never changes physical adequacy;
- client cannot submit basis.

## Replay/recovery/compatibility

- all persistent fields covered by state hashes/replay;
- tampered arithmetic/promise/Lattice/source basis/observation rejected;
- every promised recovery changes threatened state at real cost;
- no dead C5 exhaustion observation;
- V1 unchanged.

# 19. Rejection conditions

Reject #101 if it introduces:

- a mutable persisted public-case mirror;
- a pre-command synchronisation transition solely to copy derived state;
- an unspecified/opaque Lattice missed state;
- an implicit or undefined consultation promise scope;
- non-atomic C2/C5 arithmetic;
- “political cost where applicable” without an executable condition;
- generic trust/morality scores;
- free recovery;
- hidden-truth attribution;
- directionless/one-source used claim;
- generic source groups instead of exact corroboration groups;
- later source regeneration/relabeling;
- claim direction as physical warning;
- liaison through Delegate;
- generic consequence/lifecycle framework before another scenario proves reuse;
- V1 changes.
