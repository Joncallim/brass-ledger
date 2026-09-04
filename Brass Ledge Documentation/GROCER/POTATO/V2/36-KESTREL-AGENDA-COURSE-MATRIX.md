---
type: v2-kestrel-agenda-course-contract
status: active
---

# Kestrel Agenda And Course Matrix

Backlink: [[README]]

This is the implementation authority for Kestrel issue/order IDs, intent metadata, player-known prerequisites, exceptional authority and responsible-officer professional ties.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns current assessment/warning/public-case semantics.
- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns intelligence-state coverage.
- [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] owns exact evidence/target IDs and copy.
- [[25-KESTREL-CONSEQUENCE-MATRIX]] owns persistent campaign/source-use state.
- [[26-LATTICE-COLLECTION-MATRIX]] owns Lattice task flow.
- [[24-STAFF-RECOMMENDATION-POLICY]] owns recommendation precedence.
- [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns complete-package interaction.
- [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]] owns adversary observations.

# 1. Metadata vocabulary

`supports`:

- `beacon-security`
- `partner-cooperation`
- `ravellan-understanding`

`crossesBoundary`:

- `civilian-shipping`
- `partner-consultation`
- `reserve-readiness`

`style`:

- `quiet-preparation`
- `visible-deterrence`
- `partner-consultation`
- `neutral`

`costs`:

- `weaker-deterrence`
- `political-friction`
- `reserve-strain`

Tags are discrete reasons/filters, never scores.

# 2. Commander-only courses

Exactly:

- C2 `public-accusation`;
- C4 `request-partner-liaison`;
- C5 `use-attribution`

are `requiresIntervention = true`.

They remain player-legal under prerequisites, never enter staff recommendation candidates and always cost one normal intervention.

Lattice target retargeting is **not** a normal intervention. It changes a zero-token institutional task from the HQ-selected unused target to another unused target.

# 3. Global validation

Every reachable issue/action state must have:

- stable unique IDs;
- one responsible officer where it is an agenda issue;
- explicit player-known prerequisites;
- metadata backed by real mechanics;
- an authored deterministic final tie where needed;
- no hidden-truth tie/input;
- a legal complete all-Delegate package;
- no known redundant/fake course;
- no reliance on array/locale/seed ordering.

# 4. Cycle 1

## `c1-beacon-watch` — Operations

### `ordinary-watch`

- quiet style;
- weaker-deterrence cost;
- exposure stays thin;
- emits weak coverage.

### `reinforce-watch`

- supports Beacon;
- crosses reserve;
- quiet style;
- reserve-strain cost;
- improves exposure, worsens reserve, emits credible coverage.

Professional tie: ordinary > reinforce.

## `c1-partner-consultation` — Political

### `informal-liaison`

- neutral;
- no promise/channel.

### `formal-consultation-agreement`

- supports partner;
- partner-consultation style;
- creates explicit promise + rapid C2/C5 consultation channel.

Professional tie: informal > formal. Partner priority/style may select formal before the tie.

## `c1-lattice-investment` — Intelligence

### `leave-lattice-unprotected-c1`

Maturity becomes unreachable.

### `protect-lattice-c1`

- supports understanding;
- Lattice `0 → 1`.

Professional tie: leave > protect.

# 5. Cycle 2

## `c2-shipping-response` — Operations

### `quiet-escort`

- conditionally supports partner where visible action would breach consultation;
- crosses civilian shipping;
- quiet style;
- weaker-deterrence cost;
- limited delay, reserve preserved, emits withheld denial.

### `visible-patrol-surge`

- supports Beacon;
- crosses reserve and dynamically partner consultation unless coordinated;
- visible style;
- reserve strain + political friction when uncoordinated;
- emits demonstrated denial, credible coverage and one qualifying reserve-deployment event.

### `reroute-and-monitor`

- supports understanding;
- crosses civilian shipping;
- quiet style;
- political-friction + weaker-deterrence costs;
- larger civilian disruption, reserve preserved;
- triggers exactly one C3 #100 auxiliary occurrence:
  - coercion indicator under the exact authorised C2 facts;
  - otherwise ambiguous/unclear.

There is no preparation/integrated reroute result.

Professional tie: quiet > visible > reroute.

## `c2-public-posture` — Political

### `remain-silent`

- quiet style;
- weaker-deterrence cost.

### `joint-non-attributive-warning`

- supports partner;
- partner-consultation style;
- partner must not be withdrawn;
- coordinates C2 visible surge only with active C1 formal channel.

### `public-accusation`

- requires intervention;
- crosses partner consultation;
- visible style;
- political-friction cost;
- always unilateral/partner-damaging;
- breaches active promise;
- emits fracture/discovery;
- does not create or consume the later protected attribution source.

Recommendation tie among staff-applicable courses: silence > joint warning.

Partner priority/style may select joint warning. Visible style never auto-selects accusation.

## `c2-lattice-investment` — Intelligence

Exists only after C1 protection.

### `leave-lattice-unprotected-c2`

Maturity becomes unreachable.

### `protect-lattice-c2`

- supports understanding;
- Lattice `1 → 2`.

Professional tie: leave > protect.

# 6. Cycle 3

## `c3-reserve-posture` — Operations

### `forward-reserve-preparation`

- supports Beacon;
- crosses reserve;
- quiet style;
- reserve-strain cost;
- Beacon becomes prepared;
- reserve worsens;
- emits credible coverage;
- may contribute to C2–C4 exhaustion history.

### `hold-reserve`

- quiet style;
- weaker-deterrence cost.

At the mandatory `unclear / conflicted` assessment, Operations tie: forward > hold. Reserve red line can remove forward before the tie; Intelligence may dissent.

## `c3-focused-collection` — Intelligence

### `maintain-current-coverage`

- supports Beacon;
- quiet style.

### `focus-staging-collection`

- supports understanding;
- quiet style;
- weaker-deterrence cost;
- worsens Beacon exposure;
- queues the posture-blind C4 focused-staging occurrence.

Professional tie: focus > maintain. Beacon priority may select maintain first.

Focused collection is **not** a Lattice target and never marks `landing-force-staging` used.

## `c3-partner-reassurance` — Political

Issue exists only when reassurance is materially relevant.

### `routine-contact`

- neutral;
- no direct improvement.

### `reassure-partner`

- supports partner;
- partner-consultation style;
- improves eligible partner state;
- emits coherent unity.

Professional tie: routine > reassure. Partner priority/style may select reassurance; otherwise it consumes a normal intervention.

## `c3-lattice-investment` — Intelligence

Exists only after advances 1–2.

### `leave-lattice-unprotected-c3`

Maturity fails.

### `protect-lattice-c3`

- supports understanding;
- Lattice `2 → operational`.

Professional tie: leave > protect.

# 7. Cycle 4

## `c4-exploit-lull` — Operations

Stable issue ID. Situation copy describes the actual ambiguous pressure pattern without becoming intelligence evidence.

### `recover-reserve`

- quiet style;
- weaker-deterrence cost;
- improves reserve;
- worsens exposure;
- emits weak coverage.

### `prepare-beacon-quietly`

- supports Beacon;
- crosses reserve;
- quiet style;
- reserve-strain cost;
- prepares/improves Beacon;
- emits credible coverage + discovery suspicion.

### `press-visible-advantage`

- supports Beacon;
- crosses reserve and dynamically consultation;
- visible style;
- reserve strain + political friction where applicable;
- emits demonstrated denial + credible coverage;
- may contribute to C2–C4 exhaustion history.

Professional tie normally: quiet prepare > recover > press. If reserve brittle: recover > quiet prepare > press.

## `c4-partner-liaison` — Intelligence

Appears only when Lattice is unavailable and fallback is relevant.

### `do-not-request-liaison`

Routine staff baseline.

### `request-partner-liaison`

- requires intervention;
- supports understanding;
- partner-consultation style;
- creates liaison obligation;
- queues one C5 auxiliary occurrence:
  - coercion indicator under exact authorised facts;
  - otherwise ambiguous;
- never diagnostic or warning.

No preparation/military-links liaison branch exists.

## Operational Lattice target action

When Lattice is operational, this is a separate zero-normal-intervention institutional action, not an issue requiring approval.

C4:

- HQ preselects one target using [[26-LATTICE-COLLECTION-MATRIX]] default order;
- player may retarget to another unused target at zero token;
- no no-task course;
- selected target persists/replays under #102.

Stable target IDs:

- `landing-force-staging`;
- `auxiliary-tasking`;
- `operational-sequence`.

The former `political-operational-sync` ID is invalid.

All unused targets remain eligible after C3 focused collection. A positive focused result is only an indicator/shorter-lived warning; Lattice landing is diagnostically stronger and can refresh warning through C6.

# 8. Cycle 5

## Operational Lattice target action

If Lattice is operational:

- HQ preselects the first unused target under standing priority;
- player may retarget to another unused target at zero token;
- target must differ from C4 target;
- no no-task or same-target retask;
- C5 task result arrives in the C6 pre-manifestation intelligence cut and cannot inspect R6 action/row.

## `c5-beacon-posture` — Operations

### `quiet-reinforce-beacon`

- supports Beacon;
- dynamically crosses reserve;
- quiet style;
- reserve cost where applicable;
- prepares/improves physical posture;
- no overt discovery.

### `visible-reinforce-beacon`

- supports Beacon;
- crosses reserve;
- partner-sensitive;
- visible style;
- reserve cost + political friction if unilateral;
- physical preparation + demonstrated denial + targeted discovery/C6 deterrence.

### `hold-beacon-posture`

- quiet style;
- weaker-deterrence cost.

### Professional tie from current #100 products

Apply only after standing-direction, commitment and package filters:

1. current warning usable → quiet reinforce > visible reinforce > hold;
2. else current assessment direction preparation → quiet > visible > hold;
3. else → hold > quiet > visible.

Current physical warning may be usable even when wider assessment is conflicted. A preparation estimate without current warning creates preparatory bias but no clean-warning terminal benefit.

Protected reserve boundary may remove reinforcement before this tie. Surface warning/red-line tension rather than silently overriding direction.

## `c5-reserve-decision` — Operations

### `keep-reserve-forward`

- supports Beacon;
- crosses reserve;
- quiet style;
- reserve-strain cost;
- reserve worsens;
- Beacon becomes prepared;
- no dead C5 exhaustion observation.

### `emergency-consolidation`

- quiet style;
- weaker-deterrence cost;
- reserve improves;
- exposure worsens.

Professional tie: brittle → consolidate > keep; otherwise keep > consolidate.

## `c5-attribution` — Political

Issue appears only when:

- #101 source-use state is unspent; and
- current verified #100 public-case basis is `credible-source-sensitive` with direction and exact corroborated support.

There is no persisted credible-opportunity mirror.

Player-safe issue copy states the exact current claim:

- “We can substantiate a seizure-preparation case.”
- “We can substantiate a coercive or deceptive pressure case.”

### `hold-attribution`

- quiet style;
- always staff recommendation because Use is commander-only;
- no source-use mutation;
- does not freeze the C5 case for C6.

### `use-attribution`

- requires intervention;
- partner-sensitive;
- severe source exposure;
- one-shot;
- requires compatible complete-package authority;
- persists used cycle 5 + exact direction and deterministic two-item supporting evidence/corroboration basis;
- removes all later source-use routes.

The client never submits claim direction/evidence basis. Sim derives them from verified #100 context.

## `c5-partner-authority` — Political

Exact package semantics are [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

### `honour-consultation`

- supports partner;
- partner style;
- always player-legal;
- same-cycle sensitive authority requires active rapid C1 channel;
- after withdrawal preserves integrity without restoring access.

### `act-then-inform`

- supports Beacon only when package contains immediate sensitive action;
- crosses consultation;
- visible style;
- political-friction cost;
- legal only with a sensitive action;
- buys unilateral tempo with breach/damage.

### `political-concession`

- supports partner;
- partner style;
- political-friction + severe concession;
- buys immediate coordinated authority/recovery where legal.

Complete package must make all-Delegate legal.

# 9. Cycle 6

## `c6-terminal-response`

Expose only [[27-KESTREL-TERMINAL-MATRIX]] routes.

Owner:

- seizure → Operations;
- threshold/receding → Political.

Course IDs:

- `quiet-denial`;
- `joint-visible-denial`;
- `emergency-mobilisation`;
- `hold-and-expose`.

The C6 warning used by route legality is the **current role-specific #100 warning**, not merely the existence of an older assessment/public-case report.

An unrefreshed C4 focused warning may be stale by C6 while its assessment/public-case evidence remains current. Clean Quiet therefore requires genuinely current warning, not remembered preparation evidence.

Hold And Expose requires current C6 credible case + unspent source + partner/physical predicates, and persists exact current claim/support basis at cycle 6.

Claim direction controls truthful copy/history, not physical adequacy.

Chief tie sees only the already-pruned legal set.

# 10. Required metadata/recommendation tests

Prove:

- stable issue/order/target reachability;
- all 12 opening intent answers affect a reachable recommendation/reason or delegated consequence;
- formal consultation, C2 warning, C3 reassurance and Lattice protection delegate only under standing direction;
- exactly accusation/liaison/attribution-use are commander-only;
- Lattice target action is mandatory when operational, zero normal token and retargetable;
- exact default target order under all three priorities;
- no no-task, same-target or old sequence target ID;
- focused collection never consumes landing target;
- 138/138 focused-positive landing assessment upgrade invariant;
- removed integrated branches never appear;
- C3 disagreement uses same conflicted assessment;
- C5 current warning + conflicted assessment uses warning-sensitive tie;
- preparation assessment + no current warning uses preparatory tie but no clean-warning terminal benefit;
- warning staleness may change C6 route legality without deleting historical assessment/public evidence;
- reserve red line may override professional warning tie only through normal precedence and exposes tension;
- C5 all-Delegate package legal;
- attribution issue appears only from current credible basis + unspent source;
- Hold freezes no C6 case;
- both claim directions render distinct safe copy but recommend Hold;
- Use stores exact sim-derived two-item corroborated basis;
- no subjectless case, dead C5 exhaustion metadata, hidden-state tag or array/random tie;
- C6 tie uses only current pre-manifestation products and pruned routes;
- V1 unchanged.

# 11. Rejection conditions

Reject if:

- support metadata lacks a real mechanic;
- beneficial Political action becomes a universal free baseline;
- commander-only course can Delegate;
- warning is inferred from assessment or stale evidence;
- focused collection removes landing target;
- no-task/repeat/old sequence ID appears;
- visible style auto-accuses or partner intent auto-burns source;
- C5 attribution reads a persisted credible mirror or trusts client basis;
- Hold freezes stale C5 evidence for C6;
- integrated collection branches return;
- tie uses array/randomness;
- ceremonial issue is added;
- advice reads hidden Ravellan truth.
