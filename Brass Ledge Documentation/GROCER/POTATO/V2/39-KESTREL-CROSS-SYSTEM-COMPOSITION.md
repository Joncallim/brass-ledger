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

Formal consultation has a real benefit: it establishes the consultation channel required for the C2 coordination rule below.

## 3. Commander-only alternatives

Kestrel uses one bounded course-authority flag equivalent to `requiresIntervention: true`.

Only `request-partner-liaison` has it.

A `requiresIntervention` course:

- remains a legal player alternative;
- is excluded from staff recommendation candidates regardless of intent/style/cost;
- always consumes one normal intervention;
- can never execute through Delegate.

The liaison obligation is shown explicitly. Do not tag it as the tolerated cost `political-friction`, which could incorrectly turn the one-token fallback into a delegated free action.

## 4. Complete command-set composition is atomic and order-independent

Cross-issue effects derive from the **complete validated final-order set**. Do not sequentially apply issue effects and let agenda/object/array order change the campaign.

Individual causal effect records remain replay-visible even when their net state movement cancels.

A critical invariant follows:

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

Partner sensitivity to unconsulted public accusation exists even when the player never made the optional formal promise.

## 6. C5 explicit partner authority

Add concrete record:

`partner-authority = pending | none | joint | unilateral | concession`

Opening: `pending`.

It is player-known and records how the C5 partner deadline was resolved. It is not a trust meter.

### Honour consultation

Always player-legal.

If `partner-consent != withdrawn`:

- authority → `joint`;
- active consultation promise → `honoured`;
- active liaison obligation → `fulfilled`;
- improve partner one step if below cooperative.

If `partner-consent = withdrawn`:

- authority → `none`;
- active promise → `honoured`;
- active liaison obligation → `fulfilled` where consultation satisfies it;
- do not improve partner;
- do not create joint authority.

This preserves the hard choice to keep one's word while accepting lost access instead of being forced to buy recovery.

### Political concession

Where already legal:

- authority → `concession`;
- `political-concession → active`;
- withdrawn partner → `conditional`;
- an active (not already breached) consultation promise is honoured by the negotiated pre-action agreement;
- active liaison obligation → `fulfilled` where satisfied.

It creates same-cycle authority and remains a severe terminal cost.

### Act then inform

Player-legal only as part of a command set containing at least one partner-sensitive action. Otherwise the complete draft is invalid/ceremonial.

When valid:

- authority → `unilateral`;
- active promise → `breached`;
- active liaison obligation → `breached`;
- worsen partner **one step total for the unilateral C5 package**, not once per sensitive order;
- emit fractured unity where detectably consequential.

### Partner-sensitive C5 actions

Exactly:

- `visible-reinforce-beacon`;
- `use-attribution`.

Authority `joint|concession` coordinates them with no extra partner penalty. Authority `unilateral` uses the one package-level deterioration. Authority `none` is incompatible with them.

`keep-reserve-forward` is not partner-sensitive in Kestrel; do not invent a hidden visibility predicate for it.

## 7. C5 staff-recommendation package composition

Per-issue recommendations cannot be allowed to produce an invalid untouched default command.

Derive C5 staff intent in this order:

1. derive recommendations for non-authority issues (`c5-beacon-posture`, `c5-reserve-decision`, and `c5-attribution` when present) through normal [[24-STAFF-RECOMMENDATION-POLICY]] / [[36-KESTREL-AGENDA-COURSE-MATRIX]] rules;
2. set `staffPackageNeedsPartnerAuthority = true` when the resulting intended package contains `visible-reinforce-beacon` or `use-attribution`;
3. derive the `c5-partner-authority` recommendation using ordinary standing-direction precedence but with these **recommendation-applicability** constraints:
   - `act-then-inform` is a recommendation candidate only when `staffPackageNeedsPartnerAuthority = true`;
   - if partner is withdrawn **and** `staffPackageNeedsPartnerAuthority = true`, `honour-consultation` remains a player-legal alternative but is excluded from staff recommendation candidates because it would produce `partner-authority = none` and make the intended sensitive package illegal;
   - if partner is withdrawn and no staff-sensitive action is intended, `honour-consultation` remains recommendation-applicable, so staff does not force concession merely to recover access;
   - `political-concession` remains candidate only under its existing state prerequisites.
4. validate that the full all-Delegate staff package is legal. Failure is a content/recommendation bug, not something the UI may repair.

These are bounded Kestrel composition rules, not a generic global recommendation optimiser.

A player may still deliberately create a different cross-issue package by intervening. The Command Room then validates the chosen combination under Section 6 and never silently edits another issue.

## 8. C5 ordinal effects aggregate before clamping

For `beacon-exposure` and `reserve-condition`, collect all C5 signed step effects from the complete command set, sum, then clamp **once** from pre-command state.

Use improve `+1`, worsen `-1`.

Example: `quiet-reinforce-beacon` exposure +1 and `emergency-consolidation` exposure -1 → net zero regardless issue order; preparation can still become `prepared` and individual causal effects remain in history.

Apply the same rule to reserve effects from quiet/visible reinforcement, keep-forward and consolidation.

## 9. Ravellan exhaustion observation counts deployment cycles

The second detectable significant reserve-deployment **cycle**, not the second qualifying order object, creates/refreshes `reserve_exhaustion_signal = suspected`.

Qualifying Kestrel cycles/orders:

- C2 `visible-patrol-surge`;
- C3 `forward-reserve-preparation` (explicitly detectable, though not necessarily demonstrative);
- C4 `press-visible-advantage`;
- C5 if either `visible-reinforce-beacon` or `keep-reserve-forward` is selected.

If both C5 qualifiers occur, they count as one C5 deployment event.

C1 reinforced watch and quiet reinforcement may strain readiness but do not count.

## 10. Terminal warning is preparation-specific

Generic credible attribution cannot count as seizure warning because coercion evidence can also make attribution credible.

For Kestrel:

`usableWarning = HQ assessment is preparation + weak OR preparation + coherent`

No other state qualifies unless a later explicit product decision introduces a separately authored preparation-only warning.

## 11. Terminal joint authority uses the explicit C5 record

`partnerAccess = partner-consent != withdrawn`

`jointAuthority = partnerAccess AND partner-authority in {joint, concession}`

`none|unilateral` do not create joint authority. Healthy sentiment alone is not operational permission.

## 12. Quiet Denial is the restrained non-seizure fallback

Quiet Denial keeps its stable ID but has behavior-specific legality:

- `attempt_seizure` → legal only with `beacon-preparation = prepared`;
- `threshold_challenge|abort_and_pressure` → always legal.

In a non-seizure crisis it means maintain the restrained defensive posture / accept de-escalation without manufacturing a larger confrontation. A Ravellan abort must never force Emergency Mobilisation merely because Beacon was unprepared.

## 13. Final courses change authoritative terminal state

Evaluate physical feasibility from **pre-route** state, then apply route effects before final Pareto vector/classification.

### Quiet Denial

Against seizure:

- prepared + controlled exposure + usable warning → clean hold;
- otherwise, prepared + reserve `usable` → late reaction still holds Beacon, reserve worsens one, severe flag `late-reaction`;
- otherwise Beacon lost.

Against threshold/abort: no automatic reserve/partner movement.

### Joint Visible Denial

- physical feasibility remains based on pre-route joint authority/reserve/preparation;
- worsen reserve one terminal step;
- preserves access because joint authority is required.

### Emergency Mobilisation

- pre-route reserve `usable|strained` succeeds; `brittle` succeeds only with prepared denial;
- worsen reserve one terminal step;
- if Beacon is held, severe flag `emergency-surge` always applies;
- absent joint authority, worsen non-withdrawn partner one step for the unilateral emergency package.

It is the brute-force comeback route, never a clean Strategic Success simply because reserve began usable.

### Hold And Expose

- requires credible/used attribution and partner access;
- if still `credible`, mark opportunity `used`;
- improve non-withdrawn partner one step if below cooperative;
- against seizure, Beacon held only with prepared denial + controlled exposure;
- against threshold/abort, Beacon held.

This provides a real political/information payoff rather than a prose-equivalent Quiet Denial.

## 14. Terminal severe cost and vector use post-route state

Retain authored overreaction cases, evaluated after route state effects:

- Emergency against threshold/abort → overreaction;
- Joint Visible against abort → overreaction;
- Joint Visible against threshold → overreaction when post-route reserve is brittle or authority required concession.

`severeCost` includes existing history plus `late-reaction` and `emergency-surge`.

Classification remains:

Operational Defeat → Political Defeat → Costly Success → Strategic Success.

Pareto reporting uses post-route reserve/partner state.

## 15. Safe Cycle-6 crisis family

Normal staff/player DTOs consume a safe observable enum, never raw #99 action IDs:

- `attempt_seizure` → `seizure-underway`;
- `threshold_challenge` → `threshold-confrontation`;
- `abort_and_pressure` → `pressure-receding`.

The terminal resolver may internally verify canonical #99 behavior. Prior hidden posture/preparation remains unavailable until debrief.

## 16. Recommendation metadata corrections

- C1 Political final tie: `informal-liaison > formal-consultation-agreement`.
- C4 `request-partner-liaison`: `requiresIntervention = true`; no tolerated-cost tag.
- C5 `use-attribution`: supports `partner-cooperation` when politically usable; it does **not** support `ravellan-understanding`, because it spends already-acquired information rather than acquiring more.
- C5 authority recommendation follows Section 7.

## 17. UI/headless draft constraints

Player-safe agenda may expose authored **safe cross-issue requirement/conflict refs** needed to construct a legal atomic command set.

Command Room/headless must:

- keep choices inspectable;
- explain a conflict/requirement concisely;
- prevent submission of an invalid/incomplete package;
- never silently change another issue to repair legality.

Server/sim is final authority.

## 18. Laboratory additions

#107 must additionally prove:

- collection posture isolation for every target;
- formal consultation is not unconditional baseline but partner-directed intent can select it;
- liaison is never delegated and always consumes one intervention;
- C2 coordinated vs uncoordinated surge differs as authored;
- C2 accusation hurts partner without formal promise;
- all-Delegate C5 staff package is legal in every reachable state;
- C5 partner authority and ordinal effects are invariant to issue-array order;
- withdrawn + honour remains a legal non-recovery choice;
- two qualifying C5 reserve orders count as one deployment observation event;
- no pressure-receding state forces Emergency Mobilisation;
- successful Emergency cannot be clean Strategic Success;
- Hold And Expose has a reachable Pareto advantage while Quiet Denial remains useful where exposure is unavailable;
- no final route becomes universal.

## 19. Replay/version integration

New persisted state (`partner-authority`) and any command-set coordination evidence follow [[30-ARCHITECTURE-CONTRACT]]:

- replay-verifiable transition or pure derived state only;
- trusted recomputation/tamper rejection;
- hash/revision coverage;
- next prototype format version when persisted/replay semantics change;
- no migration invented;
- V1 isolation.

The exact ledger insertion remains conditioned on final committed #99 replay implementation.

## Rejection conditions

Reject downstream implementation if it reads hidden posture in collection, permits an invalid all-Delegate staff package, lets array order change simultaneous results, treats partner sentiment as automatic authority, makes liaison free through delegation, forces concession after withdrawal, forces mobilisation after de-escalation, treats coercion attribution as seizure warning, or leaves final-course costs only in prose.