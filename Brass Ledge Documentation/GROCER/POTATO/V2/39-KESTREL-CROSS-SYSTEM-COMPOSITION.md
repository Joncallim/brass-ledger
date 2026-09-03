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

Reads seizure-preparation state only:

- `developing|ready` → `focused-staging-buildup`, implication `preparation`, class `indicator`; supersedes `combat-elements-dispersed`;
- `none` → `focused-staging-empty`, implication `coercion`, class `indicator`; supersedes `staging-logistics-anomaly`.

A testing opponent with no concentration can therefore legitimately look coercive to this sensor.

### Lattice `landing-force-staging`

Reads seizure-preparation state only:

- `developing|ready` → `lattice-landing-concentration`, `preparation`, `corroborating`;
- `none` → `lattice-landing-dispersed`, `coercion`, `indicator`.

### Lattice `auxiliary-tasking`

Reads only seizure preparation plus the most recent verified normal Ravellan action in the collection interval:

- preparation `developing|ready` + action `probe_shipping` → `lattice-auxiliary-integrated`, `preparation`, `indicator`;
- preparation `none` + action `probe_shipping|seed_deception` → `lattice-auxiliary-coercive`, `coercion`, `corroborating`;
- otherwise → `lattice-auxiliary-mixed`, `ambiguous`, `indicator`.

### Lattice `political-operational-sync`

Reads only the two most recent verified normal Ravellan actions:

- two `prepare_beacon_seizure` → `lattice-sync-preparation-sequence`, `preparation`, `corroborating`;
- exactly one `prepare_beacon_seizure` → `lattice-sync-preparation-signal`, `preparation`, `indicator`;
- no prepare action and at least one `probe_shipping|seed_deception` → `lattice-sync-coercive-sequence`, `coercion`, `corroborating`;
- otherwise → `lattice-sync-partial`, `ambiguous`, `indicator`.

### Partner liaison

Uses exactly the `auxiliary-tasking` authorised facts above, but any directional result is downgraded to `indicator`.

### Required isolation proof

Focused collection, every Lattice target and liaison require paired tests that change hidden posture while target-authorised facts remain fixed. Result must be deep-equal.

## 2. Binding commitments are not routine universal defaults

C1 `formal-consultation-agreement` creates a real future constraint, so Political's final tie-break is:

`informal-liaison > formal-consultation-agreement`

Standing direction still applies first. `partner-cooperation` priority or `partner-consultation` style can therefore make formal consultation the delegated staff intent.

Formal consultation has two concrete benefits:

1. it establishes the channel required for the C2 coordinated visible-surge package in Section 5;
2. while its promise remains `active`, it is the pre-arranged channel that allows C5 `honour-consultation` to produce **same-cycle** joint authority for a partner-sensitive action. Without that active channel, normal consultation still protects the relationship and can produce joint authority for Cycle 6, but it is too slow for the immediate C5 visible-action window.

Thus the promise is neither pure liability nor a universal free benefit.

## 3. Commander-only alternatives

Kestrel uses one bounded course-authority flag equivalent to `requiresIntervention: true`.

Only `request-partner-liaison` has it.

A `requiresIntervention` course:

- remains a legal player alternative;
- is excluded from staff recommendation candidates regardless of intent/style/cost;
- always consumes one normal intervention;
- can never execute through Delegate.

The liaison obligation is shown explicitly. Do not tag it as tolerated-cost `political-friction`, which could incorrectly turn the one-token fallback into a delegated free action.

## 4. Complete command-set composition is atomic and order-independent

Cross-issue effects derive from the **complete validated final-order set**. Do not sequentially apply issue effects and let agenda/object/array order change the campaign.

Individual causal effect records remain replay-visible even when their net state movement cancels.

Critical invariant:

> **The authoritative all-Delegate staff package must always be a legal complete command set.**

If issue-level recommendations interact, recommendation composition must ensure the combined staff intent is valid before it is presented as the default headquarters plan.

## 5. C2 consultation / escalation coordination

### Coordinated visible surge

If all are true:

- `consultation-promise = active` from C1 formal consultation;
- C2 public posture = `joint-non-attributive-warning`;
- C2 shipping response = `visible-patrol-surge`;

then the surge is coordinated for partner effects:

- no partner-consent worsening from the surge;
- emit coherent-unity observation where detectably joint;
- reserve strain / visible denial / credible coverage still apply.

A joint warning without the established consultation agreement is not blanket operational consent.

### C2 public accusation is unilateral

Kestrel has no jointly-authorised C2 accusation course. Therefore `public-accusation` always:

- worsens partner consent one step;
- emits fractured unity where detectably consequential;
- breaches an active consultation promise;
- may emit Ravellan discovery suspicion as already authored.

Partner sensitivity exists even without the optional promise.

## 6. C5 explicit partner authority and tempo

Add concrete record:

`partner-authority = pending | none | joint | unilateral | concession`

Opening: `pending`.

It is player-known and records how the C5 partner deadline was resolved. It is not a trust meter.

Define pre-command:

`rapidConsultationChannel = consultation-promise == active`

An already `honoured`/`breached` promise is history; only the still-active pre-arranged channel qualifies for rapid C5 coordination.

### Honour consultation

Always player-legal.

If `partner-consent != withdrawn`:

- authority → `joint` for Cycle-6/future terminal purposes;
- active consultation promise → `honoured`;
- active liaison obligation → `fulfilled`;
- improve partner one step if below cooperative.

If `partner-consent = withdrawn`:

- authority → `none`;
- active promise → `honoured`;
- active liaison obligation → `fulfilled` where consultation satisfies it;
- do not improve partner or create joint authority.

**Immediate C5 compatibility:**

- if `rapidConsultationChannel = true`, honour consultation is compatible with same-cycle partner-sensitive actions; the established channel produces timely joint authority;
- if `rapidConsultationChannel = false`, honour consultation is **not** compatible with same-cycle partner-sensitive actions. Consent/coordination arrives for the terminal joint-authority state, but too late for the immediate C5 visible-action window.

This is the concrete tempo cost that keeps `act-then-inform` meaningful without adding a tempo meter.

### Political concession

Where already legal:

- authority → `concession`;
- `political-concession → active`;
- withdrawn partner → `conditional`;
- an active (not already breached) consultation promise is honoured by the negotiated pre-action agreement;
- active liaison obligation → `fulfilled` where satisfied;
- provides **immediate** same-cycle authority for partner-sensitive actions.

It buys speed/support at severe terminal cost.

### Act then inform

Player-legal only as part of a command set containing at least one partner-sensitive action. Otherwise the complete draft is invalid/ceremonial.

When valid:

- authority → `unilateral`;
- active promise → `breached`;
- active liaison obligation → `breached`;
- worsen partner one step total for the unilateral C5 package;
- emit fractured unity where detectably consequential;
- provides immediate freedom for the sensitive action.

### Partner-sensitive C5 actions

Exactly:

- `visible-reinforce-beacon`;
- `use-attribution`.

Compatibility:

- `concession` → compatible and coordinated;
- `unilateral` → compatible with the one package-level political deterioration;
- `joint` from `honour-consultation` → compatible in C5 **only if** `rapidConsultationChannel` was true at pre-command state;
- `none` → incompatible.

`keep-reserve-forward` is not partner-sensitive in Kestrel.

## 7. C5 staff-recommendation package composition

Per-issue recommendations cannot produce an invalid untouched default command.

Derive C5 staff intent in this order:

1. derive `c5-beacon-posture` and `c5-reserve-decision` recommendations through normal rules;
2. for `c5-attribution`, treat `use-attribution` as staff-recommendation-applicable only when its existing evidence prerequisite holds **and** the pre-command state has `rapidConsultationChannel = true` with non-withdrawn partner. Otherwise `hold-attribution` remains the professional staff baseline; the player may still construct an immediate unilateral/concession package by intervening;
3. set `staffPackageNeedsImmediatePartnerAuthority = true` if the resulting intended package contains `visible-reinforce-beacon` or `use-attribution`;
4. derive `c5-partner-authority` recommendation through ordinary standing-direction precedence with these recommendation-applicability constraints:
   - `act-then-inform` is candidate only when the staff package needs immediate authority;
   - `honour-consultation` is candidate for an immediate-authority package only when partner is not withdrawn and `rapidConsultationChannel = true`;
   - if the staff package does **not** need immediate authority, honour consultation remains candidate even without a rapid channel and even at withdrawn consent, so staff never forces concession merely to recover access;
   - political concession remains candidate only under its existing state prerequisites;
5. validate the full all-Delegate package. Failure is a content/recommendation defect, never a UI repair task.

These are bounded composition rules, not a global optimiser.

A player may deliberately choose a different cross-issue package. UI/server then validate Section 6 and never silently modify another choice.

## 8. C5 ordinal effects aggregate before clamping

For `beacon-exposure` and `reserve-condition`, collect all C5 signed step effects from the complete command set, sum, then clamp **once** from pre-command state.

Use improve `+1`, worsen `-1`.

Example: quiet reinforcement exposure +1 plus emergency consolidation exposure -1 → net zero regardless issue order; preparation can still become `prepared`, and individual effects remain in history.

Apply the same rule to reserve effects from quiet/visible reinforcement, keep-forward and consolidation.

## 9. Ravellan exhaustion observation counts deployment cycles

The second detectable significant reserve-deployment **cycle**, not order object, creates/refreshes exhaustion suspicion.

Qualifying:

- C2 visible patrol surge;
- C3 forward reserve preparation (detectable, not necessarily demonstrative);
- C4 press visible advantage;
- C5 if either visible reinforce or keep reserve forward is selected.

Both C5 qualifiers together count once. C1 reinforced watch/quiet reinforcement may strain readiness but do not count.

## 10. Terminal warning is preparation-specific

Generic credible attribution cannot count as seizure warning because coercion evidence can also make attribution credible.

`usableWarning = HQ assessment is preparation + weak OR preparation + coherent`

No other state qualifies without a later explicit preparation-only warning decision.

## 11. Terminal joint authority uses explicit C5 authority

`partnerAccess = partner-consent != withdrawn`

`jointAuthority = partnerAccess AND partner-authority in {joint, concession}`

By Cycle 6, a non-withdrawn `joint` result from honour consultation is fully available regardless of whether the C5 channel was rapid enough for an immediate action.

`none|unilateral` do not create joint authority. Healthy sentiment alone is not permission.

## 12. Quiet Denial is the restrained non-seizure fallback

- against `attempt_seizure`: legal only if Beacon is prepared;
- against `threshold_challenge|abort_and_pressure`: always legal.

In non-seizure crises it means maintain restrained defence / accept de-escalation without manufacturing a larger confrontation. A Ravellan abort must never force Emergency Mobilisation.

## 13. Final courses change authoritative terminal state

Evaluate physical feasibility from pre-route state, then apply route effects before final Pareto vector/classification.

### Quiet Denial

Against seizure:

- prepared + controlled exposure + usable warning → clean hold;
- otherwise prepared + reserve `usable` → late reaction holds, reserve worsens one, severe `late-reaction`;
- otherwise Beacon lost.

Against threshold/abort: no automatic reserve/partner movement.

### Joint Visible Denial

- feasibility uses pre-route joint authority/reserve/preparation;
- worsen reserve one terminal step;
- preserves access because joint authority is required.

### Emergency Mobilisation

- pre-route reserve `usable|strained` succeeds; brittle succeeds only with prepared denial;
- worsen reserve one terminal step;
- held Beacon always sets severe `emergency-surge`;
- absent joint authority, worsen non-withdrawn partner one step for the unilateral emergency package.

It is a comeback route, not a clean Strategic Success substitute.

### Hold And Expose

- requires credible/used attribution + partner access;
- credible opportunity → `used`;
- improve non-withdrawn partner one step if below cooperative;
- against seizure, Beacon held only with prepared denial + controlled exposure;
- against threshold/abort, Beacon held.

## 14. Terminal severe cost / Pareto use post-route state

Overreaction after route effects:

- Emergency against threshold/abort;
- Joint Visible against abort;
- Joint Visible against threshold when post-route reserve is brittle or authority required concession.

`severeCost` includes existing history plus `late-reaction` and `emergency-surge`.

Classification remains Operational Defeat → Political Defeat → Costly Success → Strategic Success.

Pareto uses post-route reserve/partner state.

## 15. Safe Cycle-6 crisis family

Normal staff/player DTOs use:

- `attempt_seizure` → `seizure-underway`;
- `threshold_challenge` → `threshold-confrontation`;
- `abort_and_pressure` → `pressure-receding`.

Raw #99 terminal action IDs and prior hidden posture/preparation remain private until debrief.

## 16. Recommendation metadata corrections

- C1 Political final tie: informal liaison > formal agreement.
- C4 liaison: `requiresIntervention = true`, no tolerated-cost tag.
- C5 `use-attribution`: supports partner cooperation when politically usable; not `ravellan-understanding`.
- C5 authority recommendation follows Sections 6–7.

## 17. UI/headless draft constraints

Safe agenda may expose cross-issue requirement/conflict refs, never hidden truth.

UI/headless:

- keep alternatives inspectable;
- explain incompatibility concisely;
- prevent invalid submission;
- never silently alter another issue.

Server/sim remains final authority.

## 18. Laboratory additions

#107 additionally proves:

- collection posture isolation;
- formal consultation not universal baseline but selected by partner direction;
- active formal channel creates reachable C5 same-cycle consultation advantage;
- liaison is never delegated and costs one intervention;
- C2 coordinated/uncoordinated surge and accusation baseline costs;
- all-Delegate C5 package legal in every reachable state;
- without a rapid channel, `honour-consultation + partner-sensitive C5 action` is incompatible while act/concession can buy immediate action;
- with the active formal channel, honour + sensitive action is compatible;
- withdrawn + honour remains a legal non-recovery choice;
- C5 state results are issue-order invariant;
- two C5 reserve qualifiers count one observation event;
- pressure-receding never forces Emergency;
- successful Emergency cannot be clean Strategic Success;
- Hold/Expose has reachable Pareto advantage while Quiet remains useful;
- no final route becomes universal.

## 19. Replay/version integration

New persisted `partner-authority` and coordination evidence follow [[30-ARCHITECTURE-CONTRACT]]: replay-verifiable transition or pure derivation, tamper rejection, hashes/revisions, next prototype version when persisted semantics change, no invented migration, V1 isolation.

Exact ledger insertion waits for final committed #99 replay implementation.

## Rejection conditions

Reject implementation if it reads hidden posture in collection, permits invalid all-Delegate staff intent, erases the consultation-vs-tempo tradeoff, lets array order change results, treats healthy sentiment as authority, makes liaison free, forces concession after withdrawal, forces mobilisation after de-escalation, treats coercion evidence as seizure warning, or leaves final-course costs only in prose.