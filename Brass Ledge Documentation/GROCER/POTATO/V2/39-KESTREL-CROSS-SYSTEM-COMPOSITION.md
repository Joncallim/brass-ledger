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

### Cycle-2 `reroute-and-monitor` observation payoff

Rerouting traffic buys a real observation opportunity at the cost of civilian disruption/political friction. Without this payoff, the course is dominated by quiet escort.

The order queues exactly one **indicator-only** evidence result for the C3 HQ-belief update. It reads only:

- seizure-preparation state immediately after the C2 Ravellan decision; and
- the verified C2 normal Ravellan action.

Result:

- preparation `developing|ready` + C2 action `probe_shipping` → `reroute-auxiliary-integrated`, implication `preparation`, class `indicator`;
- preparation `none` + C2 action `probe_shipping|seed_deception` → `reroute-auxiliary-coercive`, implication `coercion`, class `indicator`;
- otherwise → `reroute-auxiliary-unclear`, implication `ambiguous`, class `indicator`.

Lifecycle:

- observed/usable at C3;
- remains active through C5 unless explicitly superseded by a newer observation of the same auxiliary-tasking question;
- expires before C6 assessment reduction.

This clue **does not replace or remove** either item in the mandatory C3 conflicting bundle, so C3 remains `unclear + conflicted`. Its value is that it can remain as a weak directional clue after the generic conflict expires and can later be corroborated/contradicted by Lattice/liaison evidence.

Same authorised facts + different hidden posture must give the same reroute result.

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

A Lattice auxiliary result explicitly supersedes any older active `reroute-auxiliary-*` or liaison result that answers the same auxiliary-tasking question, while evidence from other named questions remains independent.

### Lattice `political-operational-sync`

Reads only the two most recent verified normal Ravellan actions:

- two `prepare_beacon_seizure` → `lattice-sync-preparation-sequence`, `preparation`, `corroborating`;
- exactly one prepare → `lattice-sync-preparation-signal`, `preparation`, `indicator`;
- no prepare + at least one `probe_shipping|seed_deception` → `lattice-sync-coercive-sequence`, `coercion`, `corroborating`;
- otherwise → `lattice-sync-partial`, `ambiguous`, `indicator`.

### Partner liaison

Uses exactly the auxiliary-tasking authorised facts above, with any directional result downgraded to `indicator`. A newer liaison result supersedes the older reroute clue for the same auxiliary-tasking question.

### Isolation proof

Reroute monitoring, focused collection, every Lattice target and liaison require paired tests that change hidden posture while target-authorised facts remain fixed. Result must be deep-equal.

## 2. Binding commitments are not routine universal defaults

C1 `formal-consultation-agreement` creates a real future constraint, so Political's final tie-break is:

`informal-liaison > formal-consultation-agreement`

Standing direction applies first; partner priority/style can still make the formal agreement the delegated staff intent.

Formal consultation has two concrete benefits:

1. it establishes the channel required for the C2 coordinated surge rule;
2. while its promise remains active, it is the pre-arranged channel that lets C5 `honour-consultation` authorise a **same-cycle** partner-sensitive action. Without that active channel, consultation can still produce joint authority by C6 but is too slow for the immediate C5 action window.

## 3. Commander-only alternatives

Only `request-partner-liaison` has Kestrel's bounded `requiresIntervention = true` semantics.

It remains a legal player alternative but is excluded from staff recommendation candidates, always consumes one normal intervention and can never execute through Delegate.

Its obligation is explicit, not a tolerated-cost tag.

## 4. Atomic complete command-set composition

Cross-issue effects derive from the **complete validated final-order set**. Agenda/object/array order may not change the result.

Individual causal effects remain replay-visible even where net movement cancels.

Critical invariant:

> **The untouched all-Delegate staff package must always be a legal complete command set.**

## 5. C2 consultation / escalation

### Coordinated visible surge

Active C1 consultation promise + C2 joint warning + visible patrol surge means coordinated surge:

- no partner-consent worsening from the surge;
- coherent unity where detectable;
- reserve strain / visible denial / credible coverage still apply.

A joint warning without the pre-arranged channel is not blanket operational consent.

### Public accusation

C2 public accusation is always unilateral:

- worsen partner one step;
- emit fractured unity where public;
- breach active consultation promise;
- may emit discovery suspicion.

Baseline partner cost exists without the promise.

## 6. C5 explicit partner authority and tempo

Add player-known record:

`partner-authority = pending | none | joint | unilateral | concession`

Opening `pending`.

Pre-command:

`rapidConsultationChannel = consultation-promise == active`

### Honour consultation

Always player-legal.

Partner not withdrawn:

- authority → joint for C6;
- active promise → honoured;
- active liaison → fulfilled;
- improve partner one step if below cooperative.

Partner withdrawn:

- authority → none;
- honour/fulfil active commitments where applicable;
- no partner recovery or joint authority.

Immediate C5 sensitive actions are compatible with honour only when the rapid channel was active and partner not withdrawn. Otherwise consultation is too slow for the immediate action window even though it can provide C6 joint authority.

### Political concession

Where legal:

- authority → concession;
- concession active;
- withdrawn partner → conditional;
- honour active unbreached promise / fulfil liaison where applicable;
- immediate same-cycle authority;
- severe terminal cost.

### Act then inform

Player-legal only with at least one same-cycle partner-sensitive action.

When valid:

- authority → unilateral;
- active promise/liaison → breached;
- worsen partner one step total for package;
- emit fractured unity;
- immediate freedom for sensitive action.

### Partner-sensitive C5 actions

Exactly visible reinforce and use attribution.

Concession is immediate/coordinated; unilateral is immediate with political damage; joint-from-honour is immediate only with pre-command rapid channel; none is incompatible.

Keep-reserve-forward is not partner-sensitive.

## 7. C5 staff recommendation package must itself be legal

1. derive beacon/reserve recommendations normally;
2. `use-attribution` is staff-recommendation-applicable only if evidence prerequisite holds **and** pre-command rapid channel is active with non-withdrawn partner; otherwise hold attribution is staff baseline;
3. staff package needs immediate authority if intended package contains visible reinforce or use attribution;
4. derive partner authority with act candidate only if immediate authority needed; honour candidate for immediate package only with non-withdrawn + rapid channel; honour remains candidate when no immediate sensitive action is intended, including at withdrawn; concession only under existing prerequisites;
5. validate full all-Delegate package. Failure is a content/recommendation defect, not UI repair.

Players may deliberately construct a different valid package through intervention.

## 8. C5 ordinal effects aggregate before clamping

For Beacon exposure and reserve condition, sum signed C5 effects from complete command set then clamp once from pre-command state. Improve +1; worsen -1.

Quiet reinforce exposure +1 plus emergency consolidation -1 nets zero regardless issue order while preparation may still become prepared and both effects remain in history.

Apply same rule to reserve effects from reinforcement, keep-forward and consolidation.

## 9. Ravellan exhaustion observation counts deployment cycles

The second detectable significant reserve-deployment **cycle**, not order object, creates/refreshes exhaustion suspicion.

Qualifying: C2 visible surge; C3 forward reserve; C4 press visible; C5 either visible reinforce or keep forward. Both C5 qualifiers together count once. C1 reinforce/quiet reinforcement do not count.

Exact emissions are frozen in [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

## 10. Attribution is one-shot

`attribution-opportunity = credible` means an **unspent** politically usable attribution opportunity.

C5 use attribution:

- credible → used;
- applies immediate partner/public/discovery effects;
- permanently spends the opportunity for Kestrel.

Later evidence can still change HQ belief but cannot regenerate credible attribution after `used` during this slice.

Therefore Hold And Expose requires **credible, not used**. C5 use removes C6 Hold/Expose. The known action-space cost (“this spends the attribution opportunity”) is player-safe and should be visible.

## 11. Terminal warning is preparation-specific

`usableWarning = HQ assessment preparation + weak OR preparation + coherent`

Generic credible attribution cannot count as seizure warning.

## 12. Terminal joint authority

`partnerAccess = partner-consent != withdrawn`

`jointAuthority = partnerAccess AND partner-authority in {joint, concession}`

By C6, non-withdrawn joint from honour is fully available even if too slow for immediate C5 action. None/unilateral do not create joint authority; sentiment alone is not permission.

## 13. Quiet Denial is the restrained non-seizure fallback

Against seizure, Quiet is legal only if Beacon prepared. Against threshold/pressure-receding it is always legal and means maintain restrained defence / accept de-escalation. Abort never forces Emergency Mobilisation.

## 14. Final courses change authoritative terminal state

Physical feasibility uses pre-route state; route effects then mutate final state before Pareto/classification.

### Quiet Denial

Seizure: prepared + controlled exposure + usable warning → clean hold; otherwise prepared + usable reserve → late reaction holds, reserve worsens one, severe `late-reaction`; otherwise Beacon lost.

Threshold/abort: no automatic reserve/partner movement.

### Joint Visible Denial

Feasibility uses pre-route joint authority/reserve/preparation; worsen reserve one; preserve access because joint authority required.

### Emergency Mobilisation

Pre-route reserve usable/strained succeeds; brittle succeeds only with prepared denial. Worsen reserve one; held Beacon always severe `emergency-surge`; absent joint authority worsen non-withdrawn partner one.

### Hold And Expose

Requires **credible unspent attribution** + partner access; credible → used; improve non-withdrawn partner one if below cooperative; seizure held only with prepared denial + controlled exposure; threshold/abort held.

## 15. Severe cost / Pareto use post-route state

Overreaction: Emergency vs threshold/abort; Joint vs abort; Joint vs threshold when post-route reserve brittle or authority required concession.

All state-based severe-cost predicates from the base consequence contract are evaluated on post-route final state. Add `late-reaction` and `emergency-surge`.

Classification remains Operational Defeat → Political Defeat → Costly Success → Strategic Success. Pareto uses post-route reserve/partner state.

## 16. Safe C6 crisis family

Normal staff/player DTOs use `seizure-underway`, `threshold-confrontation`, `pressure-receding`, derived from the private terminal behavior. Raw #99 action ID/prior hidden history stays private until debrief.

## 17. Recommendation metadata corrections

- C1 Political tie: informal liaison > formal agreement.
- C2 reroute-and-monitor again `supports: ravellan-understanding` because Section 1 now gives it a real persistent observation payoff.
- C4 liaison requires intervention; no tolerated-cost tag.
- C5 use attribution supports partner cooperation when usable, not Ravellan understanding; presentation names one-shot spend.
- C5 authority recommendation follows Sections 6–7.

## 18. UI/headless constraints

Safe agenda may expose cross-issue requirement/conflict refs and known one-shot attribution-spend effect, never hidden truth. UI/headless explain incompatibility, prevent invalid submission and never silently alter another issue. Server/sim remains final authority.

## 19. Laboratory additions

#107 additionally proves:

- posture isolation for reroute/focused/Lattice/liaison results;
- reroute vs quiet escort is mechanically elastic because reroute creates the persistent clue at real civilian/political cost;
- formal consultation not universal baseline but selectable by partner direction;
- active formal channel creates C5 same-cycle consultation advantage;
- liaison never delegates/costs one intervention;
- C2 coordinated/uncoordinated surge and accusation baseline cost;
- all-Delegate C5 package legal every reachable state;
- consultation-vs-tempo compatibility rules;
- withdrawn + honour legal non-recovery choice;
- C5 effects issue-order invariant;
- lab actors, including random-valid, construct **complete legal command sets**; random-valid selects deterministically/uniformly from the bounded complete legal-set enumeration rather than independently sampling issues then repairing;
- two C5 reserve qualifiers count one event;
- hold vs use attribution mechanically elastic because use removes C6 Hold/Expose while giving immediate effect;
- pressure-receding never forces Emergency;
- successful Emergency cannot be clean Strategic Success;
- Hold/Expose has reachable Pareto advantage while Quiet remains useful;
- no final route universal.

## 20. Replay/version integration

New persisted partner authority/coordination/evidence follows [[30-ARCHITECTURE-CONTRACT]]: replay-verifiable transition or pure derivation, tamper rejection, hashes/revisions, prototype version increment when persisted semantics change, no invented migration, V1 isolation. Exact ledger insertion waits for final committed #99 replay implementation.

## Rejection conditions

Reject implementation if it reads hidden posture in collection, restores reroute as a dominated cosmetic trap, permits invalid all-Delegate staff intent, erases consultation-vs-tempo or attribution-timing tradeoffs, lets array order change results, treats partner sentiment as authority, makes liaison free, forces concession after withdrawal/mobilisation after de-escalation, treats coercion evidence as seizure warning, or leaves final-course costs only in prose.