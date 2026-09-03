---
type: v2-kestrel-agenda-course-contract
status: active
---

# Kestrel Agenda And Course Matrix

Backlink: [[README]]

This is the implementation authority for Kestrel **issue IDs, order IDs, standing-intent metadata, applicability/authority flags and responsible-chief ties** consumed by #98/#103.

[[24-STAFF-RECOMMENDATION-POLICY]] owns recommendation algorithm. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns complete-package interactions. [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]] owns adversary observations.

## Metadata vocabulary

### `supports`

- `beacon-security`
- `partner-cooperation`
- `ravellan-understanding`

Only when a real authored mechanic supports that objective.

### `crossesBoundary`

- `civilian-shipping`
- `partner-consultation`
- `reserve-readiness`

Dynamic crossing may use player-known state/commitments only.

### `style`

- `quiet-preparation`
- `visible-deterrence`
- `partner-consultation`
- `neutral`

### `costs`

- `weaker-deterrence`
- `political-friction`
- `reserve-strain`

Reason tags, never meters.

### `requiresIntervention`

Used only for `request-partner-liaison`: legal player alternative, excluded from staff recommendation, one normal intervention.

## Global validation

For every reachable state:

- stable unique issue/order IDs;
- one responsible officer;
- explicit prerequisites/omission rules;
- metadata backed by real mechanics;
- authored final recommendation tie;
- no hidden-truth metadata/tie;
- all-Delegate staff package legal under 39.

# Cycle 1

## `c1-beacon-watch`
Owner `operations`.

`ordinary-watch`
- supports none; style quiet; cost weaker deterrence;
- exposure remains thin; weak coverage signal.

`reinforce-watch`
- supports Beacon; crosses reserve; style quiet; cost reserve strain;
- improve exposure, strain reserve, credible coverage.

Tie: `ordinary-watch > reinforce-watch`.

## `c1-partner-consultation`
Owner `political`.

`informal-liaison`
- no support/cost; neutral; no promise/channel.

`formal-consultation-agreement`
- supports partner; style partner consultation;
- creates promise + rapid channel used by C2/C5 composition.

Tie: `informal-liaison > formal-consultation-agreement`.

Partner priority/style may select formal before the tie; binding commitment is not routine Political default.

## `c1-lattice-investment`
Owner `intelligence`.

`leave-lattice-unprotected-c1`
- no support; maturity unreachable.

`protect-lattice-c1`
- supports understanding; Lattice 0→1.

Tie: `leave-lattice-unprotected-c1 > protect-lattice-c1`.

# Cycle 2

## `c2-shipping-response`
Owner `operations`.

`quiet-escort`
- supports partner only where alternative visible surge would violate current consultation; otherwise none;
- crosses civilian shipping; style quiet; cost weaker deterrence;
- limited delay, reserve preserved, withheld denial signal.

`visible-patrol-surge`
- supports Beacon; crosses reserve and dynamically partner consultation unless coordinated;
- style visible; cost reserve strain + political friction when uncoordinated;
- visible denial/credible coverage/reserve strain.

`reroute-and-monitor`
- supports understanding;
- crosses civilian shipping; style quiet; costs political friction + weaker deterrence;
- larger disruption, reserve preserved, bounded auxiliary clue C3–C5.

Tie: `quiet-escort > visible-patrol-surge > reroute-and-monitor`.

## `c2-public-posture`
Owner `political`. Silence is authored order.

`remain-silent`
- supports none; style quiet; cost weaker deterrence.

`joint-non-attributive-warning`
- supports partner; style partner consultation; no direct course cost;
- prerequisite partner not withdrawn;
- can coordinate visible surge only with active C1 formal channel.

`public-accusation`
- supports Beacon only as overt pressure/signaling;
- crosses partner consultation; style visible; cost political friction;
- always worsens partner, breaches active promise, emits fracture/discovery;
- legal as risky course under weak/ambiguous evidence.

Tie: `remain-silent > joint-non-attributive-warning > public-accusation`.

Rationale: a joint public warning is a meaningful political action, not routine staff housekeeping. Partner priority or partner-consultation style can select it before the tie; otherwise the commander can spend an intervention to obtain its coordination/partner benefit. Visible-deterrence standing style may select accusation and must expose Intelligence's unsupported-attribution concern.

This preserves command-by-exception and prevents silence from becoming a strictly worse intervention.

## `c2-lattice-investment`
Exists only after successful C1 protection. Owner `intelligence`.

`leave-lattice-unprotected-c2` → maturity unreachable.

`protect-lattice-c2` → supports understanding; Lattice 1→2.

Tie: leave > protect.

# Cycle 3

## `c3-reserve-posture`
Owner `operations`.

`forward-reserve-preparation`
- supports Beacon; crosses reserve; style quiet; cost reserve strain;
- Beacon prepared, reserve strained, credible coverage; may contribute to C2–C4 exhaustion history.

`hold-reserve`
- no support; style quiet; cost weaker deterrence.

At mandatory conflicted belief: `forward-reserve-preparation > hold-reserve`.
Reserve red line can select hold first. Intelligence dissents on uncertainty.

## `c3-focused-collection`
Owner `intelligence`.

`maintain-current-coverage`
- supports Beacon; quiet; no direct cost.

`focus-staging-collection`
- supports understanding; quiet; cost weaker deterrence;
- worsen exposure; queue posture-blind C4 staging evidence.

Tie: `focus-staging-collection > maintain-current-coverage`.
Beacon priority can select coverage first.

## `c3-partner-reassurance`
Owner `political`.

Issue appears only when partner state/recent action makes reassurance materially relevant.

`routine-contact`
- no support; neutral; no direct cost.

`reassure-partner`
- supports partner; style partner consultation;
- improves eligible partner state; coherent unity signal.

Tie: `routine-contact > reassure-partner`.

Rationale: material reassurance/public coalition repair is a commander-level exception unless the standing partner priority/style already tells Political to do it. This prevents a free delegated improvement while keeping the C3 political intervention candidate real.

## `c3-lattice-investment`
Exists only after advances 1–2. Owner `intelligence`.

`leave-lattice-unprotected-c3` → maturity fails.

`protect-lattice-c3` → supports understanding; Lattice 2→operational.

Tie: leave > protect.

# Cycle 4

## `c4-exploit-lull`
Stable ID retained; player copy describes actual ambiguous pressure change. Owner `operations`.

`recover-reserve`
- no support; quiet; cost weaker deterrence;
- improve reserve, worsen exposure, weak coverage.

`prepare-beacon-quietly`
- supports Beacon; crosses reserve; quiet; cost reserve strain;
- prepare/improve Beacon, worsen reserve, credible coverage + discovery suspicion.

`press-visible-advantage`
- supports Beacon; crosses reserve and dynamically consultation;
- visible; reserve strain + political friction where applicable;
- overt denial/credible coverage; may contribute to C2–C4 exhaustion history.

Tie normally: quiet prepare > recover > press.
If reserve brittle: recover > quiet prepare > press.

## `c4-partner-liaison`
Only when Lattice unavailable and fallback relevant. Owner `intelligence`.

`do-not-request-liaison` — no support/cost.

`request-partner-liaison`
- supports understanding; partner-consultation style;
- explicit obligation, no tolerated-cost tag;
- `requiresIntervention = true`;
- narrower C5 auxiliary evidence.

Staff recommendation necessarily do-not-request. Operational Lattice Task Collection is separate zero-normal-intervention action.

# Cycle 5

## `c5-beacon-posture`
Owner `operations`.

`quiet-reinforce-beacon`
- supports Beacon; dynamically crosses reserve; quiet; reserve cost where applicable;
- physical preparation/coverage, no overt discovery.

`visible-reinforce-beacon`
- supports Beacon; crosses reserve; partner-sensitive;
- visible; reserve cost + political friction when unilateral;
- physical preparation + demonstrated denial + targeted discovery/C6 deterrence path.

`hold-beacon-posture`
- no support; quiet; weaker-deterrence cost.

Tie by HQ belief:
- preparation → quiet > visible > hold;
- unclear/coercion → hold > quiet > visible.

Standing direction precedes tie.

## `c5-reserve-decision`
Owner `operations`.

`keep-reserve-forward`
- supports Beacon; crosses reserve; quiet; reserve-strain cost;
- reserve worsens; Beacon prepared;
- no C5 reserve-exhaustion observation.

`emergency-consolidation`
- no support; quiet; weaker-deterrence cost;
- reserve improves, exposure worsens.

Tie: brittle → consolidate > keep; otherwise keep > consolidate.
Effects compose order-independently.

## `c5-attribution`
Exists only while opportunity `credible`. Owner `political`.

`hold-attribution`
- no support; quiet; weaker-deterrence as declined immediate public pressure;
- preserves source/opportunity/C6 Hold route.

`use-attribution`
- supports partner when politically usable; does not support understanding;
- partner-sensitive; style partner if coordinated else visible;
- political friction when unilateral + severe known `attribution-source-exposed` whenever used;
- credible→used, immediate effects, removes C6 Hold.

Player-safe copy must disclose one-shot + source cost before selection.

## `c5-partner-authority`
Owner `political`; exact package/recommendation semantics in 39.

`honour-consultation`
- supports partner; partner style;
- always player-legal; immediate tempo cost without active rapid channel;
- after withdrawal may preserve integrity without restoring access.

`act-then-inform`
- supports Beacon only with immediate partner-sensitive package;
- crosses consultation; visible; political friction;
- only legal with sensitive action; buys unilateral tempo with package breach/damage.

`political-concession`
- supports partner; partner style; political friction + severe concession;
- buys immediate authority/recovery under authored prerequisites.

No issue-local final tie; package-composed recommendation in 39 guarantees legal all-Delegate intent.

# Cycle 6

## `c6-terminal-response`
Expose only routes legal under [[27-KESTREL-TERMINAL-MATRIX]].

Owner:
- seizure → operations;
- threshold/pressure receding → political.

`quiet-denial`
- supports Beacon against seizure and restrained preservation otherwise;
- quiet; late-reaction cost only where terminal state requires it.

`joint-visible-denial`
- supports Beacon + partner; visible; terminal reserve cost;
- displayed only where 27 says it adds real value.

`emergency-mobilisation`
- supports Beacon; crosses reserve; visible; reserve + successful emergency-surge cost;
- fallback-only under 27, not a permanent seizure button.

`hold-and-expose`
- supports partner; not understanding;
- partner style; weaker-deterrence against seizure + source severe cost;
- requires unspent evidence/access/physical predicates; consumes opportunity.

Responsible-chief tie considers **only the pruned legal set**. Never reintroduce a removed route to satisfy a fixed preference list.

# Required metadata/recommendation tests

At minimum prove:

- stable issue/order reachability;
- all 12 opening intent answers affect at least one reachable recommendation/reason or delegated consequence;
- real conflicts among standing-intent fields;
- formal consultation, C2 joint warning and C3 reassurance become delegated automatically only when command direction selects them; otherwise routine baseline or personal intervention;
- Lattice protection similarly follows understanding direction or intervention; liaison never delegates;
- reroute support matches actual clue;
- C3 chief disagreement uses same conflicted belief;
- C5 recommendation changes with HQ/public state, not hidden truth;
- C5 package recommendation leaves all-Delegate legal;
- no dead C5 exhaustion metadata;
- attribution metadata exposes one-shot + source cost and never claims new understanding;
- dynamic tags use player-known state only;
- issue omission avoids ceremonial work;
- C6 tie uses only 27-pruned routes;
- V1 unchanged.

## Rejection conditions

Reject metadata if a course/tag is invented to force balance, support lacks real mechanic, beneficial political action is made an unconditional free baseline rather than following command direction, chief preference pre-filters standing intent, liaison delegates, known source cost is hidden, dead signal metadata returns, tie uses array/randomness, ceremonial agenda work is added or advice reads hidden Ravellan truth.
