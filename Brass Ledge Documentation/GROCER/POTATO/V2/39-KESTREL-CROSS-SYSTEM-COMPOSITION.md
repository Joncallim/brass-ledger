---
type: v2-kestrel-cross-system-contract
status: active
---

# Kestrel Cross-System Composition Contract

Backlink: [[README]]

This owns only mechanics that require multiple Kestrel issues/subsystems to be evaluated together. Base contracts `23`–`27`, `36`, `37/37A` and `38` own their own subsystems. It does not change #99.

# 1. Intelligence/package boundary

Holding all target-authorised facts fixed while changing hidden Ravellan posture alone leaves evidence, HQ products, recommendations and safe projection unchanged.

Current C5/C6 attribution availability is derived from:

- current verified #100 corroborated public-case basis;
- persisted #101 source-use state.

There is no persisted none/tentative/credible mirror and no synchronisation transition merely to copy a read model.

# 2. Commander-only alternatives

Exactly:

- C2 `public-accusation`;
- C4 `request-partner-liaison`;
- C5 `use-attribution`

are `requiresIntervention = true`.

Each remains player-legal under prerequisites, never recommendation-applicable/Delegate, costs one normal intervention and exposes known cost/authority first.

# 3. Atomic package invariant

All interacting effects derive from the complete validated final-order set. Issue/object/array order cannot alter state.

> The untouched all-Delegate staff package must always be legal.

UI/headless may explain/prevent an incompatible draft but never alter another choice silently. Sim validates authoritatively.

# 4. Exact consultation promise scope

C1 formal agreement creates an active promise:

> Consult the partner before a major visible military escalation or public attribution.

`rapidConsultationChannel = pre-package consultationPromise == active`.

The active promise is breached by:

- C2 uncoordinated visible patrol surge;
- C2 public accusation;
- C4 press visible advantage;
- C5 Act Then Inform with a partner-sensitive action.

Rerouting civilian shipping carries political cost but is not itself within this promise’s narrow scope.

A breached promise supplies no rapid channel.

# 5. C2 complete-package composition

## Coordinated visible surge

```text
coordinatedVisibleSurge =
  pre-command promise active
  AND final orders contain joint-non-attributive-warning
  AND final orders contain visible-patrol-surge
```

Joint warning without the pre-existing channel does not retroactively coordinate the surge.

## Partner signed effects

| Final course | Delta |
| --- | ---: |
| `quiet-escort` | 0 |
| coordinated `visible-patrol-surge` | 0 |
| uncoordinated `visible-patrol-surge` | -1 |
| `reroute-and-monitor` | -1 |
| `remain-silent` | 0 |
| `joint-non-attributive-warning` | +1 |
| `public-accusation` | -1 |

Sum all C2 partner deltas and clamp once from the pre-command partner state.

Retain one derived causal fact per contribution, even if the net state does not move.

Examples:

- active channel + joint warning + visible surge → surge penalty removed; warning may improve partner one;
- no channel + joint warning + visible surge → +1 and -1 net zero;
- reroute + joint warning → net zero but disruption/reassurance both remain visible;
- reroute + accusation → two-step deterioration where room exists.

## Promise effects

- uncoordinated visible surge breaches active promise;
- public accusation breaches active promise;
- coordinated visible surge leaves promise active;
- reroute/joint warning/silence/quiet escort do not resolve it.

## Public accusation

Always unilateral and commander-only. It does not consume later protected source or create a public case.

37A owns its fracture/discovery observations.

# 6. C4 visible escalation

`press-visible-advantage` is an unconsulted major visible escalation in Kestrel:

- partner worsens one;
- active consultation promise breaches;
- no implicit hidden consultation course exists.

This is exact, not “political cost where applicable.”

# 7. C5 authority/tempo primitives

Partner-sensitive C5 actions:

- `visible-reinforce-beacon`;
- player-selected `use-attribution`.

`keep-reserve-forward` is not partner-sensitive.

## Honour Consultation

Always player-legal.

If partner accessible:

- authority → joint for C6;
- active promise → honoured;
- active liaison obligation → fulfilled;
- partner improves one.

If withdrawn:

- authority → none;
- active promise/liaison may still be honoured/fulfilled;
- partner remains withdrawn.

For same-cycle sensitive action, Honour is compatible only when pre-package rapid channel exists and partner is accessible.

## Political Concession

Where legal:

- authority → concession;
- concession → active;
- withdrawn partner → conditional;
- active promise → honoured;
- active liaison → fulfilled;
- immediate sensitive-action authority;
- severe concession.

## Act Then Inform

Player-legal only when package contains a sensitive action.

- authority → unilateral;
- active promise/liaison → breached;
- partner worsens exactly one step total for the unilateral C5 package;
- immediate freedom for sensitive action.

The complete package crosses protected `partner-consultation` only when authority is unilateral. Joint/concession do not cross it.

# 8. Deterministic C5 staff-package composition

C5 advice is composed in two stages.

## Stage A — non-authority intent

1. derive preliminary Beacon recommendation with normal 24/36 logic, treating visible reinforcement as immediate-authority-sensitive;
2. derive reserve recommendation;
3. if current corroborated public case exists and source is unspent, attribution issue appears; staff recommendation is Hold;
4. thus only preliminary visible reinforcement may require immediate authority in the all-Delegate package.

Staff never recommends source use.

## Stage B — authority compatibility and protected boundary

### Preliminary Beacon intent not visible

No immediate sensitive action:

- Act recommendation-inapplicable;
- run normal recommendation over Honour and legal Concession.

### Preliminary Beacon intent visible

Immediate-authority candidates:

- Honour only with rapid channel + accessible partner;
- Concession where legal;
- Act.

Apply protected boundary at complete-package level:

- if partner consultation protected and Honour/Concession supports package, remove Act;
- if Act is the only immediate-authority option, do not claim no clean option while a non-sensitive Beacon package can preserve the boundary; use fallback below;
- other protected boundaries retain direct-course semantics.

Then apply priority → style → tolerated cost → commitment → exact Political tie.

### Non-sensitive Beacon fallback

Use when no immediate-authority course exists or the only one violates protected consultation:

1. visible remains player-legal but recommendation-inapplicable;
2. recompute Beacon over quiet/hold;
3. derive non-sensitive authority course;
4. expose why visible intent could not be executed within authority/boundary.

No hidden repair, score, randomness or array-order tie.

## Final Political tie

After all earlier filters:

- compatible Honour → Honour > Concession > Act;
- Honour absent + partner conditional/withdrawn → Concession > Act;
- Honour absent + partner cooperative/uneasy → Act > Concession.

# 9. Player-modified C5 package

After legal all-Delegate projection, player may intervene within budget.

Changing Beacon to visible or choosing Use may create immediate-authority requirements. UI explains them but never changes authority automatically.

Changing authority to Act/Concession/Honour+rapid may make draft legal.

# 10. Player-selected source use

`use-attribution` is legal only when:

- source unspent;
- current verified #100 public case is credible-source-sensitive;
- basis has exact direction, two evidence IDs and two distinct corroboration-group IDs;
- player spends one intervention;
- complete package supplies immediate authority through Honour+rapid, Concession or Act.

Client submits only the decision to use. It never submits claim/basis.

Sim re-derives current basis from the same verified context and persists:

```ts
{
  state: "used",
  usedAtCycle: 5,
  direction,
  supportingEvidenceInstanceIds: [id1, id2],
  supportingCorroborationGroupIds: [group1, group2],
}
```

Expected revision rejects a case that changed/disappeared after projection.

If consultation is protected, Act+Use remains an explicit player override only; never all-Delegate.

On use:

- source becomes used;
- source exposure severe;
- exact claim/basis frozen;
- immediate political/discovery effects apply;
- C6 Hold And Expose unavailable regardless of later evidence.

# 11. C5 ordinal aggregation

For Beacon exposure/reserve:

- derive signed contributions from complete final orders;
- sum;
- clamp once from pre-command state;
- retain individual causal facts.

# 12. Coalition-to-Ravellan observations

Owned only by 37A. Derive from complete package, coalesce non-contradictorily and create no dead C5 exhaustion signal.

# 13. Safe requirement refs

38 may expose:

- personal intervention required;
- immediate authority required;
- rapid channel satisfies authority;
- package crosses protected consultation;
- current exact public claim/source is one-shot;
- staff used non-sensitive fallback because no compatible authority package preserved boundary.

No hidden truth/predicted outcome.

# 14. Terminal handoff

27 owns C6 routes from:

- final pre-manifestation #100 snapshot;
- persistent source-use state;
- safe crisis/public campaign state.

C5 Hold freezes no case. C6 availability is re-derived. Warning uses its current role-specific state, not historical warning existence.

# 15. Replay/provider context

Every persisted C2/C4/C5 consequence/source mutation follows 30: trusted recomputation, state/hash/revision proof, actual next prototype version and V1 isolation.

Once #98 advice depends on #100/#101/#102, replay constructs agenda from a sim-created verified ledger-prefix context, never untrusted future saved entries.

# 16. Required proofs

- exact three commander-only never recommended;
- C2 partner arithmetic aggregate/clamp once and order-independent;
- active channel/coordination/promise breach exact;
- C4 visible partner/promise cost exact;
- all-Delegate C5 legal in every reachable state;
- attribution issue only for current corroborated case + unspent source;
- non-sensitive package excludes Act;
- visible + rapid channel may Honour;
- visible + no rapid + legal Concession may preserve protected consultation;
- partner protected boundary prevents staff auto-Act when non-sensitive package exists;
- aggressive direction may recommend Act with explicit reason;
- no legal immediate authority → deterministic quiet/hold fallback;
- player visible/Use draft requires explicit authority and is never auto-repaired;
- source-use stores sim-derived exact two-item corroborated basis;
- stale revision rejects changed case;
- C5 Hold persists no case; C6 re-derives;
- withdrawn+Honour legal;
- C5 state/signals issue-order invariant;
- reverse signals deterministic/non-contradictory/dead-free.

# 17. Rejection conditions

Reject if implementation:

- persists/synchronises current public-case availability;
- trusts client claim/basis;
- uses generic source groups instead of corroboration groups;
- lets source Use Delegate;
- obtains all-Delegate legality through hidden/random repair;
- leaves C2 partner arithmetic or C4 political cost ambiguous/order-dependent;
- evaluates protected boundary only on authority sub-issue;
- hides staff Act breach reasons;
- silently alters player draft;
- recreates dead/contradictory observations;
- duplicates terminal rules;
- derives agenda from unverified current/future entries.
