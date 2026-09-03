---
type: v2-kestrel-cross-system-contract
status: active
---

# Kestrel Cross-System Composition Contract

Backlink: [[README]]

This document is the final implementation authority for **cross-system interactions** that cannot be specified safely inside one subsystem in isolation. It was added after a hostile composed-system review of the #98–#108 contracts.

It does **not** change #99's Ravellan policy. It resolves how already-authorised recommendation, intelligence, consequence, command-set, terminal and player-projection rules compose.

Where a clause below conflicts with an earlier Kestrel detail in [[23-HQ-BELIEF-AND-EVIDENCE]], [[24-STAFF-RECOMMENDATION-POLICY]], [[25-KESTREL-CONSEQUENCE-MATRIX]], [[26-LATTICE-COLLECTION-MATRIX]], [[27-KESTREL-TERMINAL-MATRIX]], [[36-KESTREL-AGENDA-COURSE-MATRIX]] or [[38-PLAYER-SAFE-PROJECTION-CONTRACT]], **this document controls for the six-cycle prototype**. The older clause remains historical context, not implementation authority.

## 1. Collection can observe facts, never hidden strategic posture

Directed collection exists to inspect a bounded slice of the world. It may not use Ravellan's hidden `posture` enum as a shortcut for deciding what a sensor discovers.

Holding all facts a named collection target is authorised to observe constant while changing hidden Ravellan posture alone must produce the **same collection result**.

This is stricter than merely hiding the posture ID from prose.

### Cycle-3 focused staging collection

The fixed `staging-area-focus` result reads only hidden seizure-preparation state because that target is specifically looking for physical force concentration.

- preparation `developing` or `ready` → `focused-staging-buildup`, implication `preparation`, class `indicator`, with the existing supersession of `combat-elements-dispersed`;
- preparation `none` → `focused-staging-empty`, implication `coercion`, class `indicator`, with the existing supersession of `staging-logistics-anomaly`.

There is no posture-specific `testing` branch. A testing opponent with no physical concentration can legitimately look coercive to this collection method. That is fair uncertainty, not an oracle.

### Lattice `landing-force-staging`

This target reads physical seizure preparation only.

- preparation `developing` or `ready` → `lattice-landing-concentration`, implication `preparation`, class `corroborating`;
- preparation `none` → `lattice-landing-dispersed`, implication `coercion`, class `indicator`.

No hidden-posture branch exists.

### Lattice `auxiliary-tasking`

This target may read only:

- seizure-preparation state; and
- the most recent verified normal Ravellan action in the authorised collection interval.

Result:

- preparation `developing|ready` + most recent action `probe_shipping` → `lattice-auxiliary-integrated`, implication `preparation`, class `indicator`;
- preparation `none` + most recent action `probe_shipping|seed_deception` → `lattice-auxiliary-coercive`, implication `coercion`, class `corroborating`;
- otherwise → `lattice-auxiliary-mixed`, implication `ambiguous`, class `indicator`.

The action/preparation combination represents an observable tasking pattern. The target does not receive the hidden posture label.

### Lattice `political-operational-sync`

This target reads only the two most recent verified normal Ravellan actions available at result time.

- two `prepare_beacon_seizure` actions → `lattice-sync-preparation-sequence`, implication `preparation`, class `corroborating`;
- exactly one `prepare_beacon_seizure` → `lattice-sync-preparation-signal`, implication `preparation`, class `indicator`;
- no `prepare_beacon_seizure` and at least one `probe_shipping|seed_deception` → `lattice-sync-coercive-sequence`, implication `coercion`, class `corroborating`;
- otherwise → `lattice-sync-partial`, implication `ambiguous`, class `indicator`.

No posture condition is legal.

### Partner-liaison result

The liaison uses the same authorised `auxiliary-tasking` facts above, but any directional result is downgraded to `indicator` as already required by #102.

### Required isolation proof

For focused collection, every Lattice target and liaison, add paired tests that alter Ravellan posture while holding the target-authorised preparation/action facts fixed. The result must remain deep-equal.

## 2. Binding commitments are not routine staff defaults

The Cycle-1 `formal-consultation-agreement` creates a genuine future constraint. Absent a standing direction selecting it, Political should not silently bind the commander by default.

Therefore the Cycle-1 Political final tie-break is:

`informal-liaison > formal-consultation-agreement`

Standing-direction precedence still applies first. A `partner-cooperation` main priority or `partner-consultation` default style can therefore make the formal agreement the staff recommendation and allow the commander's philosophy to create the commitment through delegation.

The formal agreement's positive mechanical value is the established consultation channel described in the Cycle-2 coordination rule below; it is not merely a liability.

## 3. Commander-only alternatives

Kestrel has one course that is explicitly legal only as a personal intervention:

`request-partner-liaison`

Add one bounded course-authority field equivalent to:

`requiresIntervention: true`

Exact schema naming is implementation-owned.

Rules:

- a `requiresIntervention` course remains a legal authored alternative;
- it is excluded from the staff-recommendation candidate set regardless of standing intent or tolerated-cost/style tags;
- selecting it consumes exactly one normal intervention token;
- Delegate can never execute it;
- Kestrel uses this flag only for `request-partner-liaison` unless another explicit product decision is made.

This is an authority constraint, not a chief-preference filter.

The liaison obligation is **not** represented as the tolerated-cost tag `political-friction`; show the explicit obligation instead. Otherwise declaring political heat tolerable could incorrectly make a one-token fallback free through delegation.

## 4. Atomic command sets are composed from the complete final-order set

Where two issues interact, derive their coordinated effect from the complete validated command set. Do not apply issue consequences sequentially and allow authored agenda order, object order or array order to change the campaign.

Individual causal effects remain replay-visible, but resulting state must be order-independent.

## 5. Cycle-2 consultation / escalation coordination

### Joint warning plus established consultation

If all are true:

- `consultation-promise = active` from the Cycle-1 formal agreement;
- Cycle-2 public posture is `joint-non-attributive-warning`;
- shipping response is `visible-patrol-surge`;

then the patrol surge is treated as **coordinated with the partner** for Cycle-2 partner effects.

Consequences:

- do not worsen partner consent for the surge;
- emit the already-authored coherent coalition signal where detectably joint;
- still strain reserve and emit visible denial / credible Beacon coverage.

The same joint warning without the established consultation agreement does not automatically authorise the patrol surge; it remains a joint political message, not blanket operational consent.

### Cycle-2 public accusation is unilateral in Kestrel

There is no separate jointly-authorised accusation course in the Cycle-2 matrix.

Therefore `public-accusation` always:

- worsens `partner-consent` one step;
- emits `coalition_unity_signal = fractured` where the public disagreement is detectable;
- if `consultation-promise = active`, transitions it to `breached`;
- may emit `ravellan_discovery_signal = suspected` as already authored.

Do not waive the partner cost merely because no formal promise existed. The partner's opening sensitivity to unconsulted public accusation exists independently of the optional promise.

## 6. Cycle-5 partner authority is explicit state

Add one concrete Kestrel record:

Stable ID: `partner-authority`

States:

- `pending`
- `none`
- `joint`
- `unilateral`
- `concession`

Opening: `pending`.

It is player-known and records how the Cycle-5 partner deadline was resolved. It is not a trust meter.

The Cycle-5 `c5-partner-authority` issue always resolves this record before route availability is derived.

### `honour-consultation`

This course remains legal even if partner consent has already reached `withdrawn`. The player may choose to keep their word without paying a concession merely to avoid an invalid command set.

If `partner-consent != withdrawn`:

- `partner-authority → joint`;
- active consultation promise → `honoured`;
- active liaison obligation → `fulfilled`;
- improve partner consent one step if below cooperative.

If `partner-consent = withdrawn`:

- `partner-authority → none`;
- active consultation promise → `honoured`;
- active liaison obligation → `fulfilled` where the consultation satisfies it;
- do **not** improve partner consent;
- do not create same-cycle joint authority.

This preserves a meaningful hard option: accept political defeat / lost access while maintaining commitment integrity, rather than being forced to buy recovery through concession.

### `political-concession`

Where already legal:

- `partner-authority → concession`;
- `political-concession → active`;
- if partner was withdrawn, restore it to `conditional`;
- active consultation promise is treated as honoured by the negotiated pre-action agreement; an already breached promise remains breached;
- active liaison obligation → `fulfilled` where the concession satisfies the requested consultation.

This provides same-cycle authority but remains a severe terminal cost.

### `act-then-inform`

This course is meaningful only when at least one same-cycle partner-sensitive action is selected. Otherwise the complete command set is invalid rather than persisting a ceremonial unilateral-authority choice.

When valid:

- `partner-authority → unilateral`;
- active consultation promise → `breached`;
- active liaison obligation → `breached`;
- worsen partner consent **one step total for the unilateral Cycle-5 action package**, not one step per partner-sensitive order;
- emit the authored fractured-unity signal where detectably consequential.

### Cycle-5 partner-sensitive actions

For Kestrel these are exactly:

- `visible-reinforce-beacon`;
- `use-attribution`.

With `partner-authority = joint|concession`, they are coordinated and do not add a separate partner-consent penalty.

With `partner-authority = unilateral`, the one package-level deterioration above applies.

With `partner-authority = none`, partner-sensitive actions are not legally compatible with the command set.

`keep-reserve-forward` is not a separate partner-sensitive action in this prototype; do not invent a hidden visibility predicate for it.

## 7. Cycle-5 ordinal state effects are order-independent

For `beacon-exposure` and `reserve-condition`, derive all Cycle-5 authored step effects from the complete command set, sum signed steps, then clamp **once** from the pre-command state.

Use:

- improve = `+1` toward the better state;
- worsen = `-1` toward the worse state.

Preserve individual causal effect records even when net movement is zero.

Example:

`quiet-reinforce-beacon` improves exposure one while `emergency-consolidation` worsens exposure one. Net exposure delta is zero regardless of issue order; Beacon preparation can still become `prepared` and the player has spent scarce command attention to offset the recovery exposure.

Apply the same order-independent aggregation to reserve changes from:

- quiet/visible Beacon reinforcement;
- keep reserve forward;
- emergency consolidation.

This deliberately permits a player to spend multiple scarce interventions to offset one physical trade-off; the opportunity cost is that other Cycle-5 pressures remain delegated.

## 8. Ravellan reserve-exhaustion observation counts one deployment event per cycle

The second detectable significant reserve-deployment **cycle**, not the second qualifying order object, creates/refreshes `reserve_exhaustion_signal = suspected`.

Kestrel qualifying cycles/orders are:

- C2 `visible-patrol-surge`;
- C3 `forward-reserve-preparation` — explicitly detectable in Kestrel, though not necessarily a public show-of-force;
- C4 `press-visible-advantage`;
- C5 if either `visible-reinforce-beacon` or `keep-reserve-forward` is selected.

If both qualifying C5 orders occur, they count as one Cycle-5 deployment event.

Cycle-1 reinforced watch and quiet reinforcement may strain readiness but do not count as one of these significant deployment events.

## 9. Terminal warning is preparation-specific

`usableWarning` must not be inferred from a generic credible attribution opportunity, because corroborating **coercion** evidence can also make attribution credible.

For Kestrel:

`usableWarning = HQ assessment is preparation + weak OR preparation + coherent`

No other evidence state qualifies unless a later explicit product decision adds a specifically preparation-only warning predicate.

This prevents a strong “they are coercing us” assessment from becoming a seizure warning by accident.

## 10. Terminal partner authority uses the explicit Cycle-5 record

For terminal resolution:

`partnerAccess = partner-consent != withdrawn`

`jointAuthority = partnerAccess AND partner-authority in {joint, concession}`

`partner-authority = none|unilateral` does not provide joint authority.

Do not infer full joint military authority from `partner-consent = cooperative` alone. A healthy relationship and an authorised joint action are different things.

## 11. Quiet Denial is also the restrained non-seizure fallback

Quiet Denial keeps its stable ID but has terminal-behaviour-specific legality.

### Against `attempt_seizure`

Legal only when `beacon-preparation = prepared`.

### Against `threshold_challenge` or `abort_and_pressure`

Always legal.

Here it means maintain the current defensive posture / accept de-escalation without manufacturing a larger confrontation. This supplies the previously missing “quietly accept de-escalation” route and prevents an abort history from forcing Emergency Mobilisation merely because Beacon was never prepared.

## 12. Final courses have real terminal state effects

Evaluate physical feasibility using the **pre-route** terminal state, then apply the route's authored terminal costs/effects before final Pareto vector/classification.

### Quiet Denial

Against a seizure:

- clean hold when prepared denial + controlled exposure + usable warning;
- if prepared but warning/exposure is inadequate, a retained `usable` reserve can still save Beacon through a late reaction: worsen reserve one step and set severe-cost flag `late-reaction`;
- otherwise Beacon is lost.

Against threshold/abort:

- no automatic reserve or partner movement.

### Joint Visible Denial

- physical feasibility remains as previously authored, using pre-route reserve/preparation and `jointAuthority`;
- worsen reserve one terminal step;
- partner access is preserved because the route requires joint authority.

### Emergency Mobilisation

- physical feasibility remains based on pre-route reserve: usable/strained succeeds; brittle succeeds only with prepared denial;
- worsen reserve one terminal step;
- always set severe-cost flag `emergency-surge` when Beacon is held;
- if joint authority is absent and partner is not already withdrawn, worsen partner consent one step for the unilateral emergency package.

Emergency Mobilisation is the brute-force comeback route. It may be necessary and successful, but it is never the cleanest Strategic Success merely because reserve happened to start usable.

### Hold And Expose

- requires credible/used attribution and partner access as already authored;
- if the opportunity is still `credible`, mark it `used`;
- improve partner consent one step when below cooperative and not withdrawn;
- against an actual seizure, Beacon is held only with prepared denial + controlled exposure;
- against threshold/abort, Beacon remains held.

This gives the political/information route a concrete payoff rather than making it a prose-equivalent Quiet Denial when both are legal.

## 13. Terminal overreaction / severe cost uses post-route state

Retain the authored overreaction cases, but evaluate reserve-based conditions after the final course's reserve effect.

- Emergency Mobilisation against threshold/abort is overreaction (and already carries `emergency-surge`);
- Joint Visible Denial against abort is overreaction;
- Joint Visible Denial against threshold is overreaction when its post-route reserve is brittle or authority required political concession.

`severeCost` includes the existing historical flags plus:

- `late-reaction`;
- `emergency-surge`.

Classification remains:

Operational Defeat → Political Defeat → Costly Success → Strategic Success.

Final Pareto reporting uses the **post-route** reserve and partner states.

## 14. Terminal crisis family is a player-safe public enum

Normal player/recommendation DTOs do not receive raw #99 terminal action IDs.

Derive the safe current crisis family:

- `attempt_seizure` → `seizure-underway`;
- `threshold_challenge` → `threshold-confrontation`;
- `abort_and_pressure` → `pressure-receding`.

Cycle-6 staff ownership/tie-break and player copy consume this safe observable crisis family plus known coalition state. The terminal resolver may of course verify the canonical underlying #99 behavior internally.

Prior posture/preparation history remains hidden until terminal debrief.

## 15. Recommendation metadata corrections

### C1 Political baseline

Apply the `informal-liaison > formal-consultation-agreement` tie-break from Section 2.

### C4 liaison

`request-partner-liaison` has `requiresIntervention = true` and no tolerated-cost tag. It can never become a delegated recommendation.

### C5 attribution

`use-attribution` does **not** `support ravellan-understanding`; it uses already-acquired evidence rather than creating understanding. Its direct strategic support tag is `partner-cooperation` when politically usable. Conditional deterrent effects flow through authored Ravellan observations rather than a fabricated recommendation tag.

### C5 partner authority

`honour-consultation` remains legal at withdrawn consent but resolves authority to `none` and cannot restore access. `act-then-inform` carries the cross-issue requirement in Section 6.

## 16. UI/headless command-draft implications

Player-safe agenda projection may expose authored **cross-issue compatibility/requirement refs** needed to build a legal atomic command set. These refs must contain no hidden truth.

The Command Room should:

- keep conflicting/required choices inspectable;
- show a concise conflict/requirement message;
- prevent `Issue Orders` while the draft is structurally incomplete/invalid;
- never silently change another issue to make the draft legal.

Headless policies must likewise construct a complete legal command set. A named policy preference is skipped for the next preference when selecting it would make the current draft impossible to complete legally.

Server/sim remains the final authority and rejects an invalid combination.

## 17. Laboratory additions

#107 must additionally prove:

- posture-only changes cannot alter focused/Lattice/liaison results when target-authorised facts are fixed;
- C1 formal consultation is not the unconditional default, but standing partner direction can select it;
- liaison always consumes one intervention and is never delegated;
- C2 coordinated surge vs uncoordinated surge produces the authored partner difference;
- C2 public accusation damages partner consent even without a formal promise;
- C5 same-cycle partner authority produces the same result regardless issue-array order;
- C5 ordinal reserve/exposure effects are order-independent;
- withdrawn consent + honour consultation remains a legal non-recovery choice and does not force concession;
- two qualifying C5 reserve orders count as one Ravellan deployment-observation event;
- no `pressure-receding` terminal state forces Emergency Mobilisation;
- Emergency Mobilisation cannot produce clean Strategic Success merely by starting with usable reserve;
- Hold And Expose has a reachable Pareto advantage over Quiet Denial through partner improvement, while Quiet Denial remains useful where exposure is unavailable;
- no final course becomes universal after these corrections.

## 18. Replay/version integration

All new persisted state (`partner-authority`) and any new command-set coordination evidence must follow [[30-ARCHITECTURE-CONTRACT]]:

- explicit replay-verifiable transition or pure derived state only;
- trusted recomputation/tamper rejection;
- canonical hashes/revisions;
- next prototype format version when persisted/replay semantics change;
- no migration invented for old prototype payloads;
- V1 isolation.

The exact ledger insertion point remains conditioned on the final committed #99 replay implementation, as already frozen in [[30-ARCHITECTURE-CONTRACT]].

## Rejection conditions

Reject downstream implementation if it reads hidden posture in collection, lets array order change simultaneous results, treats cooperative partner sentiment as automatic joint military authority, makes liaison free through delegation, forces concession merely because partner access was already lost, forces emergency mobilisation after Ravellan backs down, lets generic coercion attribution count as seizure warning, or gives final-course costs only in prose without changing authoritative terminal state.