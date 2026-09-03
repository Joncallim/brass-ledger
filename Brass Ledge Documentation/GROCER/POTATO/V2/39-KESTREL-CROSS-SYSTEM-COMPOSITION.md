---
type: v2-kestrel-cross-system-contract
status: active
---

# Kestrel Cross-System Composition Contract

Backlink: [[README]]

This is the final Kestrel authority for mechanics that span more than one otherwise-canonical subsystem. It does **not** change #99's Ravellan policy.

Where a clause here conflicts with [[23-HQ-BELIEF-AND-EVIDENCE]], [[24-STAFF-RECOMMENDATION-POLICY]], [[25-KESTREL-CONSEQUENCE-MATRIX]], [[26-LATTICE-COLLECTION-MATRIX]], [[27-KESTREL-TERMINAL-MATRIX]], [[36-KESTREL-AGENDA-COURSE-MATRIX]] or [[38-PLAYER-SAFE-PROJECTION-CONTRACT]], **this document controls for the six-cycle prototype**.

## 1. Collection observes bounded facts, never hidden strategic posture

A collection target may inspect only the physical/action-history facts explicitly authorised for that target. Ravellan's hidden `posture` enum is never an input to a collection-result selector.

Holding all target-authorised facts constant while changing hidden posture alone must produce an identical result.

### Cycle-3 `staging-area-focus`

Reads seizure preparation only:

- `developing|ready` → `focused-staging-buildup`, `preparation`, `indicator`; supersedes `combat-elements-dispersed`;
- `none` → `focused-staging-empty`, `coercion`, `indicator`; supersedes `staging-logistics-anomaly`.

### Lattice `landing-force-staging`

Reads seizure preparation only:

- `developing|ready` → `lattice-landing-concentration`, `preparation`, `corroborating`;
- `none` → `lattice-landing-dispersed`, `coercion`, `indicator`.

### Lattice `auxiliary-tasking`

Reads seizure preparation plus the most recent verified normal Ravellan action in the collection interval:

- preparation `developing|ready` + `probe_shipping` → `lattice-auxiliary-integrated`, `preparation`, `indicator`;
- preparation `none` + `probe_shipping|seed_deception` → `lattice-auxiliary-coercive`, `coercion`, `corroborating`;
- otherwise → `lattice-auxiliary-mixed`, `ambiguous`, `indicator`.

### Lattice `political-operational-sync`

Reads only the two most recent verified normal Ravellan actions:

- two `prepare_beacon_seizure` → `lattice-sync-preparation-sequence`, `preparation`, `corroborating`;
- exactly one prepare → `lattice-sync-preparation-signal`, `preparation`, `indicator`;
- no prepare + at least one `probe_shipping|seed_deception` → `lattice-sync-coercive-sequence`, `coercion`, `corroborating`;
- otherwise → `lattice-sync-partial`, `ambiguous`, `indicator`.

### Partner liaison

Uses exactly the auxiliary-tasking authorised facts above, with any directional result downgraded to `indicator`.

### Isolation proof

For focused collection, every Lattice target and liaison, changing hidden posture alone while target-authorised facts remain fixed must leave result deep-equal.

## 2. Binding commitments are not routine universal defaults

C1 `formal-consultation-agreement` creates a real future constraint, so Political's final tie-break is:

`informal-liaison > formal-consultation-agreement`

Standing direction applies first; partner priority/style can still make the formal agreement the delegated staff intent.

Formal consultation has two concrete benefits:

1. it establishes the channel required for the C2 coordinated surge rule;
2. while its promise remains active, it is the pre-arranged channel that lets C5 `honour-consultation` authorise a **same-cycle** partner-sensitive action. Without that active channel, consultation can still produce joint authority by C6 but is too slow for the immediate C5 action window.

## 3. Commander-only alternatives

Only `request-partner-liaison` has Kestrel's bounded `requiresIntervention = true` semantics.

It remains a legal player alternative but:

- is excluded from staff recommendation candidates;
- always consumes one normal intervention;
- can never execute through Delegate.

Its obligation is explicit, not a `political-friction` tolerated-cost tag.

## 4. Atomic complete command-set composition

Cross-issue effects derive from the **complete validated final-order set**. Agenda/object/array application order may not change the result.

Individual causal effects remain replay-visible even where net movement cancels.

Critical invariant:

> **The untouched all-Delegate staff package must always be a legal complete command set.**

## 5. C2 consultation / escalation

### Coordinated visible surge

Active C1 consultation promise + C2 `joint-non-attributive-warning` + `visible-patrol-surge` means the surge is coordinated:

- no partner-consent worsening from the surge;
- coherent-unity observation where detectable;
- reserve strain / visible denial / credible coverage still apply.

A joint warning without the pre-arranged channel is not blanket operational consent.

### Public accusation

C2 `public-accusation` is always unilateral in Kestrel:

- worsen partner one step;
- emit fractured unity where public;
- breach active consultation promise;
- may emit discovery suspicion.

The baseline partner cost exists even if no promise was made.

## 6. C5 explicit partner authority and tempo

Add player-known concrete record:

`partner-authority = pending | none | joint | unilateral | concession`

Opening: `pending`.

Pre-command:

`rapidConsultationChannel = consultation-promise == active`

Only the still-active formal channel provides rapid C5 coordination.

### Honour consultation

Always player-legal.

If partner not withdrawn:

- authority → `joint` for C6;
- active promise → `honoured`;
- active liaison obligation → `fulfilled`;
- improve partner one step if below cooperative.

If partner withdrawn:

- authority → `none`;
- honour/fulfil active commitment where applicable;
- no partner improvement or joint authority.

For immediate C5 partner-sensitive actions:

- compatible only when `rapidConsultationChannel = true` and partner is not withdrawn;
- otherwise consultation is too slow for the current action window even though non-withdrawn consultation can produce joint authority by C6.

### Political concession

Where legal:

- authority → `concession`;
- concession record → active;
- withdrawn partner → conditional;
- honour an active unbreached consultation promise;
- fulfil active liaison obligation where satisfied;
- supplies immediate same-cycle authority;
- remains severe terminal cost.

### Act then inform

Player-legal only with at least one same-cycle partner-sensitive action.

When valid:

- authority → `unilateral`;
- active promise/liaison obligation → `breached`;
- worsen partner one step total for the package;
- emit fractured unity;
- supplies immediate freedom for the sensitive action.

### Partner-sensitive C5 actions

Exactly:

- `visible-reinforce-beacon`;
- `use-attribution`.

Compatibility:

- concession → immediate coordinated;
- unilateral → immediate with package political damage;
- joint from honour → immediate only if rapid channel was active pre-command;
- none → incompatible.

`keep-reserve-forward` is not partner-sensitive in Kestrel.

## 7. C5 staff recommendation package must itself be legal

Derive staff intent:

1. recommend beacon/reserve through normal rules;
2. for C5 attribution, `use-attribution` is staff-recommendation-applicable only when its evidence prerequisite holds **and** pre-command rapid channel is active with non-withdrawn partner. Otherwise `hold-attribution` is staff baseline; player may still construct unilateral/concession use through intervention;
3. `staffPackageNeedsImmediatePartnerAuthority = true` if intended package contains visible reinforce or use attribution;
4. derive partner-authority recommendation with:
   - act-then-inform candidate only if immediate authority is needed;
   - honour candidate for immediate package only with non-withdrawn partner + rapid channel;
   - honour remains candidate when no immediate sensitive action is intended, including at withdrawn consent, so staff never forces recovery;
   - concession only under existing state prerequisites;
5. validate the full all-Delegate package. Failure is a content/recommendation defect, never a UI repair task.

A player may deliberately construct a different valid package through interventions.

## 8. C5 ordinal state effects aggregate before clamping

For Beacon exposure and reserve condition, sum all signed C5 step effects from the complete command set, then clamp once from pre-command state.

Improve `+1`; worsen `-1`.

Quiet reinforce exposure +1 plus emergency consolidation exposure -1 therefore nets zero regardless issue order while preparation may still become `prepared` and both causal effects remain recorded.

Apply the same rule to reserve effects from quiet/visible reinforcement, keep-forward and consolidation.

## 9. Ravellan exhaustion observation counts deployment cycles

The second detectable significant reserve-deployment **cycle**, not order object, creates/refreshes exhaustion suspicion.

Qualifying:

- C2 visible patrol surge;
- C3 forward reserve preparation;
- C4 press visible advantage;
- C5 if either visible reinforce or keep reserve forward.

Both C5 qualifiers together count once. C1 reinforce/quiet reinforcement do not count.

Exact signal emissions are frozen in [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

## 10. Attribution is a one-shot strategic opportunity

`attribution-opportunity = credible` means HQ currently has an **unspent** politically usable attribution opportunity.

C5 `use-attribution`:

- `credible → used`;
- applies its existing immediate partner/public/discovery effects;
- permanently spends that opportunity for the remainder of Kestrel.

Once `used`, later evidence can still change HQ belief but does **not** regenerate `attribution-opportunity = credible` during this six-cycle slice.

This is intentionally bounded: the player chooses whether to spend the evidence now for immediate political/deterrent effect or preserve it for the final Hold And Expose course.

Therefore:

- **Hold And Expose requires `attribution-opportunity = credible`, not `used`;**
- using attribution in C5 removes Hold And Expose from the C6 legal route set;
- the known action-space consequence (“this spends the attribution opportunity”) is player-safe and should be visible when considering C5 use.

This makes `hold-attribution` versus `use-attribution` mechanically elastic instead of a fake choice.

## 11. Terminal warning is preparation-specific

Generic credible attribution cannot count as seizure warning because coercion evidence can also make attribution credible.

`usableWarning = HQ assessment is preparation + weak OR preparation + coherent`

No other state qualifies without a later explicit preparation-only warning decision.

## 12. Terminal joint authority

`partnerAccess = partner-consent != withdrawn`

`jointAuthority = partnerAccess AND partner-authority in {joint, concession}`

By C6, a non-withdrawn joint result from honour consultation is fully available even if it was too slow for an immediate C5 sensitive action.

None/unilateral do not create joint authority; healthy sentiment alone is not permission.

## 13. Quiet Denial is the restrained non-seizure fallback

- against actual seizure: legal only if Beacon prepared;
- against threshold challenge or pressure receding: always legal.

In non-seizure crises it means maintain restrained defence / accept de-escalation without manufacturing a larger confrontation. Abort must never force Emergency Mobilisation.

## 14. Final courses change authoritative terminal state

Physical feasibility uses pre-route state; route costs/effects then mutate final state before Pareto/classification.

### Quiet Denial

Against seizure:

- prepared + controlled exposure + usable warning → clean hold;
- otherwise prepared + reserve usable → late reaction holds, reserve worsens one, severe `late-reaction`;
- otherwise Beacon lost.

Against threshold/abort: no automatic reserve/partner movement.

### Joint Visible Denial

- feasibility uses pre-route joint authority/reserve/preparation;
- worsen reserve one terminal step;
- preserve access because joint authority is required.

### Emergency Mobilisation

- pre-route reserve usable/strained succeeds; brittle succeeds only with prepared denial;
- worsen reserve one terminal step;
- held Beacon always sets severe `emergency-surge`;
- absent joint authority, worsen non-withdrawn partner one step.

It is a comeback route, never a clean substitute.

### Hold And Expose

- requires **unspent `attribution-opportunity = credible`** + partner access;
- `credible → used`;
- improve non-withdrawn partner one step if below cooperative;
- against seizure, Beacon held only with prepared denial + controlled exposure;
- against threshold/abort, Beacon held.

Because the opportunity is one-shot, C5 use and C6 Hold/Expose are alternative timings for the same political asset, not cumulative double benefits.

## 15. Severe cost / Pareto use post-route state

Overreaction after route effects:

- Emergency against threshold/abort;
- Joint Visible against abort;
- Joint Visible against threshold when post-route reserve is brittle or authority required concession.

All state-based severe-cost predicates from the base consequence contract are evaluated on **post-route final state** where relevant. In particular, a route that leaves the reserve `brittle` cannot evade the existing brittle-reserve severe cost merely because it began `strained`.

`severeCost` also includes `late-reaction` and `emergency-surge`.

Classification remains Operational Defeat → Political Defeat → Costly Success → Strategic Success.

Pareto uses post-route reserve/partner state.

## 16. Safe Cycle-6 crisis family

Normal staff/player DTOs use:

- `attempt_seizure` → `seizure-underway`;
- `threshold_challenge` → `threshold-confrontation`;
- `abort_and_pressure` → `pressure-receding`.

Raw terminal action IDs and prior hidden history remain private until debrief.

## 17. Recommendation metadata corrections

- C1 Political final tie: informal liaison > formal agreement.
- C4 liaison: requires intervention; no tolerated-cost tag.
- C5 use-attribution: supports partner cooperation when politically usable; not `ravellan-understanding`; presentation must name that it spends the one-shot attribution opportunity.
- C5 authority recommendation follows Sections 6–7.

## 18. UI/headless draft constraints

Safe agenda may expose cross-issue requirement/conflict refs and the known one-shot attribution-spend effect, never hidden truth.

UI/headless keep alternatives inspectable, explain incompatibility, prevent invalid submission and never silently alter another issue. Server/sim remains final authority.

## 19. Laboratory additions

#107 additionally proves:

- collection posture isolation;
- formal consultation not universal baseline but selectable by partner direction;
- active formal channel creates reachable C5 same-cycle consultation advantage;
- liaison never delegates and costs one intervention;
- C2 coordinated/uncoordinated surge and accusation baseline cost;
- all-Delegate C5 package legal in every reachable state;
- without rapid channel, honour + immediate sensitive action incompatible while act/concession can buy tempo;
- with active channel, honour + sensitive action compatible;
- withdrawn + honour remains legal non-recovery choice;
- C5 state results issue-order invariant;
- random-valid and other lab actors choose/construct **complete legal command sets**, not independently sampled issue dispositions that violate cross-issue constraints;
- two C5 reserve qualifiers count one observation event;
- `hold-attribution` and `use-attribution` are mechanically elastic because C5 use removes C6 Hold/Expose while providing immediate effects;
- pressure-receding never forces Emergency;
- successful Emergency cannot be clean Strategic Success;
- Hold/Expose has reachable Pareto advantage while Quiet remains useful;
- no final route becomes universal.

For `random-valid`, enumerate the bounded legal complete command sets for the current agenda through the authoritative validator and select deterministically/uniformly from those sets; do not sample issue choices independently then repair them.

## 20. Replay/version integration

New persisted partner authority/coordination state follows [[30-ARCHITECTURE-CONTRACT]]: replay-verifiable transition or pure derivation, tamper rejection, hashes/revisions, prototype version increment when persisted semantics change, no invented migration, V1 isolation.

Exact ledger insertion waits for final committed #99 replay implementation.

## Rejection conditions

Reject implementation if it reads hidden posture in collection, permits invalid all-Delegate staff intent, erases consultation-vs-tempo tradeoff, makes C5 attribution use strictly free by preserving the same C6 opportunity, lets array order change results, treats partner sentiment as authority, makes liaison free, forces concession after withdrawal, forces mobilisation after de-escalation, treats coercion evidence as seizure warning, or leaves final-course costs only in prose.