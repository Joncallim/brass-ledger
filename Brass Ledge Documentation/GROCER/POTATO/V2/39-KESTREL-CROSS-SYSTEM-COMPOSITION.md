---
type: v2-kestrel-cross-system-contract
status: active
---

# Kestrel Cross-System Composition Contract

Backlink: [[README]]

This document owns **only mechanics that genuinely require more than one Kestrel subsystem/issue to be evaluated together**. The base contracts `23`–`27` and `36` have been normalised to the final semantics; do not use 39 as a patch for ordinary single-subsystem behavior.

It does **not** change #99's Ravellan policy.

## 1. Collection isolation across hidden state

[[23-HQ-BELIEF-AND-EVIDENCE]] and [[26-LATTICE-COLLECTION-MATRIX]] own exact result tables.

Cross-system invariant:

> Holding all facts a named collection rule is authorised to observe constant while changing hidden Ravellan posture alone must produce identical evidence.

Applies to:

- C2 reroute monitoring;
- C3 focused staging collection;
- all three Lattice targets;
- partner liaison.

No collection result may directly set a recommendation or hidden state.

## 2. Commander-only legal alternatives

Kestrel uses one `requiresIntervention` course:

`request-partner-liaison`

It remains a legal player alternative but:

- never enters staff recommendation candidates;
- can never execute through Delegate;
- always consumes one normal intervention;
- creates the explicit liaison obligation rather than hiding its cost in a tolerated-cost tag.

## 3. Atomic command-set invariant

Where issues interact, derive their result from the **complete validated final-order set**.

Do not sequentially mutate cross-issue state and let agenda/object/array order change the campaign.

Critical invariant:

> **The untouched all-Delegate staff package must always be a legal complete command set.**

If issue-level intended actions interact, recommendation composition must construct a legal headquarters package before it is shown as the default.

UI/headless may explain incompatibility and prevent submission of an invalid player-modified draft, but may never silently change another issue to repair it.

## 4. C2 consultation / escalation composition

### Coordinated visible surge

Treat C2 visible patrol surge as coordinated for partner effects only when the complete package contains:

- active C1 consultation promise/channel;
- `joint-non-attributive-warning`;
- `visible-patrol-surge`.

Then:

- no partner-consent worsening from the surge;
- reserve/physical/signal effects still occur;
- coherent public signal comes from the joint warning under [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

Joint warning without the established channel is not blanket operational authority.

### Public accusation

C2 public accusation is always unilateral in Kestrel:

- partner worsens one even if no formal promise existed;
- active consultation promise breaches;
- public fractured/discovery signals follow 37A.

## 5. C5 partner authority / tempo

Concrete record:

`partner-authority = pending | none | joint | unilateral | concession`

Opening: `pending`.

Pre-command:

`rapidConsultationChannel = consultation-promise == active`

Only the still-active C1 formal channel gives fast enough coordination for a same-cycle C5 sensitive action.

### `honour-consultation`

Always player-legal.

If partner not withdrawn:

- authority → `joint` for C6;
- active promise → honoured;
- active liaison obligation → fulfilled;
- partner improves one.

If partner withdrawn:

- authority → `none`;
- honour/fulfil active commitments where applicable;
- no partner recovery or joint authority.

Same-cycle partner-sensitive C5 action is compatible with honour only when `rapidConsultationChannel` is true and partner is not withdrawn. Without the channel, consultation is too slow for the immediate action window even though joint authority can exist by C6.

### `political-concession`

Where legal:

- authority → `concession`;
- concession record active;
- withdrawn partner → conditional;
- active unbreached consultation promise is honoured;
- liaison obligation fulfilled where satisfied;
- immediate same-cycle partner-sensitive authority;
- severe terminal concession cost remains.

### `act-then-inform`

Legal only if the same complete command set contains at least one partner-sensitive action.

When valid:

- authority → `unilateral`;
- active promise/liaison obligation → breached;
- partner worsens **one step total for the unilateral package**, not once per sensitive order;
- immediate freedom for the sensitive action.

Partner-sensitive C5 actions are exactly:

- `visible-reinforce-beacon`;
- `use-attribution`.

`keep-reserve-forward` is deliberately not partner-sensitive in Kestrel.

## 6. C5 staff package composition

Per-issue recommendations are composed in this bounded order:

1. derive Beacon and reserve intended orders through normal recommendation rules;
2. derive attribution intent: `use-attribution` is staff-recommendation-applicable only when legitimate credible evidence exists **and** rapid consultation channel is active with non-withdrawn partner; otherwise Hold is staff baseline (player may still personally construct unilateral/concession use);
3. set `staffPackageNeedsImmediatePartnerAuthority` when intended package contains visible reinforcement or use attribution;
4. derive partner-authority intent:
   - act-then-inform candidate only when immediate authority is needed;
   - honour candidate for an immediate-authority package only when partner non-withdrawn + rapid channel;
   - if no immediate authority is needed, honour remains candidate even without rapid channel and even after withdrawal so staff never forces concession just to make a package legal;
   - concession remains candidate only under its authored public-state prerequisites;
5. validate the complete all-Delegate package.

Failure of Step 5 is a content/recommendation defect, not a UI problem.

This is one Kestrel-specific composition step, not a generic multi-issue optimiser.

## 7. C5 ordinal state aggregation

For `beacon-exposure` and `reserve-condition`:

- derive every C5 signed step effect from the complete final-order set;
- sum them;
- clamp **once** from pre-command state;
- preserve individual causal effect records even if net movement is zero.

Improve = `+1`; worsen = `-1`.

Example: quiet reinforcement exposure +1 plus emergency consolidation exposure -1 → net zero regardless issue ordering while Beacon preparation may still become prepared.

## 8. C5 attribution timing / source cost

`attribution-opportunity = credible` means an **unspent** source-sensitive public attribution opportunity.

C5 `use-attribution`:

- `credible → used`;
- records severe history `attribution-source-exposed`;
- applies immediate partner/discovery effects;
- removes C6 Hold And Expose.

Later evidence may still change HQ belief but cannot regenerate another credible opportunity during Kestrel.

The player-safe action description must state the known consequence that public use spends the final attribution opportunity / exposes the protected source. It must not reveal hidden future branches.

## 9. Coalition→Ravellan observations

Exact per-cycle/package emissions are owned solely by [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

Cross-system requirements:

- derive the signal set from the complete validated package;
- max one non-contradictory value per signal ID/effective point;
- same-value candidates coalesce using stable source refs;
- significant reserve deployment counts max once per cycle;
- legal package must never create contradictory same-ID values.

Do not duplicate/independently infer Ravellan signals in consequence/content/UI code.

## 10. Safe player composition refs

[[38-PLAYER-SAFE-PROJECTION-CONTRACT]] may expose bounded public requirement/conflict refs needed to construct a legal package, e.g.:

- “this visible action needs an authority choice that permits it”;
- “using this attribution spends the final public-attribution opportunity.”

These refs contain no hidden truth or predicted outcome.

## 11. Terminal authority handoff

[[27-KESTREL-TERMINAL-MATRIX]] is now the self-contained authority for:

- safe crisis-family route legality;
- pruning player-safe dominated final routes;
- physical resolution;
- Quiet threshold political cost;
- Joint partner/reserve effect;
- Emergency seizure-only comeback;
- Hold And Expose source exposure / one-shot requirement;
- post-route severe cost / Pareto / classification.

39 does not duplicate those route predicates.

It only supplies the C5 state (`partner-authority`, one-shot attribution history) consumed by 27.

## 12. Lab / E2E composed-system proofs

#107/#108 must prove:

- collection posture isolation;
- liaison never delegates and costs one intervention;
- C2 coordinated/uncoordinated package difference;
- all-Delegate package legal every reachable C5 state;
- with no rapid formal channel, honour + immediate sensitive action is incompatible while act/concession can buy tempo;
- with active channel, honour + sensitive action is compatible;
- withdrawn + honour remains legal without forced concession;
- C5 state is invariant to issue-array order;
- attribution Hold/Use is elastic and source-sensitive;
- coalition→Ravellan signal set is deterministic/non-contradictory/order-independent;
- lab policies enumerate/construct **complete legal command sets**, not issue-wise random choices repaired later.

## 13. Replay/version integration

Any new persisted state/coordination evidence follows [[30-ARCHITECTURE-CONTRACT]]:

- explicit replay-verifiable transition or pure derivation;
- trusted recomputation/tamper rejection;
- hash/revision coverage;
- next prototype format version when persisted/replay semantics change;
- no migration invented;
- V1 isolation.

Exact ledger insertion point remains conditioned on the final **committed** #99 replay implementation; downstream code must inspect it rather than guessing around the still-open #99 work.

## Rejection conditions

Reject implementation if it reads hidden posture in collection, makes liaison free via Delegate, permits an invalid all-Delegate package, erases consultation-vs-tempo or attribution-use-vs-preserve trade-offs, applies C5 state sequentially/order-dependently, emits contradictory adversary observations, silently repairs player drafts or reimplements terminal rules outside 27.