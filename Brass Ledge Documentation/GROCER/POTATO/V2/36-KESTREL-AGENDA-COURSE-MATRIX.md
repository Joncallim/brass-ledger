---
type: v2-kestrel-agenda-course-contract
status: active
---

# Kestrel Agenda And Course Matrix

Backlink: [[README]]

This is the implementation authority for Kestrel **issue IDs, order IDs, standing-intent metadata, applicability/authority flags and responsible-chief ties** consumed by #98/#103.

[[24-STAFF-RECOMMENDATION-POLICY]] owns the recommendation algorithm. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns only interactions requiring the complete command package. [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]] owns all adversary-observation emissions.

## Metadata vocabulary

### `supports`

Only:

- `beacon-security`
- `partner-cooperation`
- `ravellan-understanding`

A support tag must correspond to a real authored strategic effect. Spending existing intelligence is not `ravellan-understanding`.

### `crossesBoundary`

Only:

- `civilian-shipping`
- `partner-consultation`
- `reserve-readiness`

Boundary crossing may depend on player-known state/commitments, never hidden Ravellan truth.

### `style`

- `quiet-preparation`
- `visible-deterrence`
- `partner-consultation`
- `neutral`

### `costs`

- `weaker-deterrence`
- `political-friction`
- `reserve-strain`

These are recommendation/reason tags, not meters.

### `requiresIntervention`

Kestrel uses this only for `request-partner-liaison`. Such a course is legal for the player, excluded from staff recommendation, cannot execute through Delegate and consumes one normal intervention.

## Global validation

For every reachable issue state:

- exactly one responsible officer;
- stable unique issue/order IDs;
- explicit prerequisites/omission rules;
- metadata corresponds to real mechanics;
- every final recommendation tie is authored;
- no metadata/tie reads hidden truth;
- the composed all-Delegate staff package is legal under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

# Cycle 1

## `c1-beacon-watch`

Owner: `operations`. No Defer.

### `ordinary-watch`

- supports: none
- crosses: none
- style: `quiet-preparation`
- costs: `weaker-deterrence`
- effect: exposure remains thin; #37A emits weak Beacon coverage.

### `reinforce-watch`

- supports: `beacon-security`
- crosses: `reserve-readiness`
- style: `quiet-preparation`
- costs: `reserve-strain`
- effect: improve exposure; strain reserve; #37A emits credible coverage.

Tie:

`ordinary-watch > reinforce-watch`

Operations preserves reserve absent stronger command direction.

## `c1-partner-consultation`

Owner: `political`. No Defer.

### `informal-liaison`

- supports: none
- style: `neutral`
- costs: none
- creates no promise/channel.

### `formal-consultation-agreement`

- supports: `partner-cooperation`
- style: `partner-consultation`
- costs: none
- creates active consultation promise/channel;
- the channel can coordinate C2 visible surge and, if still active, provide rapid C5 consultation under 39.

Tie:

`informal-liaison > formal-consultation-agreement`

Binding commitment is not Political's universal baseline. Partner priority/style may select formal before this tie.

## `c1-lattice-investment`

Owner: `intelligence`. No Defer.

### `leave-lattice-unprotected-c1`

- supports: none
- style: `neutral`
- costs: none
- makes Kestrel Lattice maturity unreachable.

### `protect-lattice-c1`

- supports: `ravellan-understanding`
- style: `neutral`
- costs: none
- Lattice `0 → 1`.

Tie:

`leave-lattice-unprotected-c1 > protect-lattice-c1`

Understanding priority can select protection first.

# Cycle 2

## `c2-shipping-response`

Owner: `operations`. No Defer.

### `quiet-escort`

- supports: `partner-cooperation` only where the alternative visible surge would violate current partner consultation; otherwise none
- crosses: `civilian-shipping`
- style: `quiet-preparation`
- costs: `weaker-deterrence`
- effect: limited shipping delay; reserve preserved; #37A emits withheld visible denial.

### `visible-patrol-surge`

- supports: `beacon-security`
- crosses: `reserve-readiness`; also `partner-consultation` unless the complete package satisfies the C2 coordinated-surge rule
- style: `visible-deterrence`
- costs: `reserve-strain`; add `political-friction` when uncoordinated
- effect: visible denial / credible coverage / reserve strain; partner penalty only when uncoordinated.

### `reroute-and-monitor`

- supports: `ravellan-understanding`
- crosses: `civilian-shipping`
- style: `quiet-preparation`
- costs: `political-friction`, `weaker-deterrence`
- effect: larger civilian disruption; reserve preserved; queue the bounded C3–C5 auxiliary-tasking indicator in [[23-HQ-BELIEF-AND-EVIDENCE]].

Tie:

`quiet-escort > visible-patrol-surge > reroute-and-monitor`

The alternatives remain meaningful through deterrence/opponent signaling or information value.

## `c2-public-posture`

Owner: `political`. No Defer; silence is an authored order.

### `remain-silent`

- supports: none
- style: `quiet-preparation`
- costs: `weaker-deterrence`.

### `joint-non-attributive-warning`

- supports: `partner-cooperation`
- style: `partner-consultation`
- costs: none
- prerequisite: partner consent not withdrawn
- can coordinate the visible surge only with an active C1 formal channel.

### `public-accusation`

- supports: `beacon-security` only as overt pressure/signaling
- crosses: `partner-consultation`
- style: `visible-deterrence`
- costs: `political-friction`
- always worsens partner; breaches active promise; #37A emits fractured unity + discovery suspicion
- legal under weak/ambiguous evidence as a deliberately risky course, not an evidentially endorsed one.

Tie:

`joint-non-attributive-warning > remain-silent > public-accusation`

Skip joint when unavailable. Intelligence attaches unsupported-attribution concern to accusation.

## `c2-lattice-investment`

Exists only if C1 protection succeeded. Owner: `intelligence`.

### `leave-lattice-unprotected-c2`

- supports: none
- style: `neutral`
- costs: none
- maturity becomes unreachable.

### `protect-lattice-c2`

- supports: `ravellan-understanding`
- style: `neutral`
- costs: none
- Lattice `1 → 2`.

Tie:

`leave-lattice-unprotected-c2 > protect-lattice-c2`

# Cycle 3

## `c3-reserve-posture`

Owner: `operations`. No Defer.

### `forward-reserve-preparation`

- supports: `beacon-security`
- crosses: `reserve-readiness`
- style: `quiet-preparation`
- costs: `reserve-strain`
- effect: Beacon prepared; reserve strained; #37A emits credible coverage and may contribute to the C2–C4 exhaustion-observation history.

### `hold-reserve`

- supports: none
- style: `quiet-preparation`
- costs: `weaker-deterrence`.

At mandatory `unclear + conflicted` belief:

`forward-reserve-preparation > hold-reserve`

Reserve red line can select hold first. Intelligence dissent: picture remains conflicted.

## `c3-focused-collection`

Owner: `intelligence`. No Defer.

### `maintain-current-coverage`

- supports: `beacon-security`
- style: `quiet-preparation`
- costs: none.

### `focus-staging-collection`

- supports: `ravellan-understanding`
- style: `quiet-preparation`
- costs: `weaker-deterrence`
- effect: worsen Beacon exposure; queue posture-blind staging result for C4.

Tie:

`focus-staging-collection > maintain-current-coverage`

Beacon priority may select coverage first. Operations concern: collection diversion thins Beacon.

## `c3-partner-reassurance`

Owner: `political`.

Issue exists only when partner state/recent action makes reassurance material.

### `routine-contact`

- supports: none
- style: `neutral`
- costs: none.

### `reassure-partner`

- supports: `partner-cooperation`
- style: `partner-consultation`
- costs: none
- effect: eligible partner improvement; #37A emits coherent unity.

Tie:

`reassure-partner > routine-contact`

## `c3-lattice-investment`

Exists only if advances 1–2 succeeded. Owner: `intelligence`.

### `leave-lattice-unprotected-c3`

- supports: none
- style: `neutral`
- costs: none
- maturity fails.

### `protect-lattice-c3`

- supports: `ravellan-understanding`
- style: `neutral`
- costs: none
- Lattice `2 → 3-operational`.

Tie:

`leave-lattice-unprotected-c3 > protect-lattice-c3`

# Cycle 4

## `c4-exploit-lull`

Stable ID retained; player copy describes actual ambiguous pressure-pattern change rather than assuming a literal lull.

Owner: `operations`. No Defer.

### `recover-reserve`

- supports: none
- style: `quiet-preparation`
- costs: `weaker-deterrence`
- effect: improve reserve; worsen Beacon exposure; #37A emits weak coverage.

### `prepare-beacon-quietly`

- supports: `beacon-security`
- crosses: `reserve-readiness`
- style: `quiet-preparation`
- costs: `reserve-strain`
- effect: prepare Beacon; improve exposure; worsen reserve; #37A emits credible coverage + discovery suspicion.

### `press-visible-advantage`

- supports: `beacon-security`
- crosses: `reserve-readiness`; dynamically `partner-consultation` when uncoordinated
- style: `visible-deterrence`
- costs: `reserve-strain`; add political friction where applicable
- effect: overt denial / credible coverage; may contribute to C2–C4 exhaustion-observation history.

Tie:

normal: `prepare-beacon-quietly > recover-reserve > press-visible-advantage`

if reserve brittle: `recover-reserve > prepare-beacon-quietly > press-visible-advantage`

Standing direction precedes professional tie.

## `c4-partner-liaison`

Exists only when Lattice unavailable and fallback relevant. Owner: `intelligence`.

### `do-not-request-liaison`

- supports: none
- style: `neutral`
- costs: none.

### `request-partner-liaison`

- supports: `ravellan-understanding`
- style: `partner-consultation`
- costs: explicit liaison obligation, **not** a tolerated-cost tag
- `requiresIntervention = true`
- effect: obligation + narrower C5 auxiliary evidence.

Staff recommendation is necessarily `do-not-request-liaison`; request is player-only intervention.

Operational Lattice Task Collection remains the separate zero-normal-intervention action owned by [[26-LATTICE-COLLECTION-MATRIX]].

# Cycle 5

## `c5-beacon-posture`

Owner: `operations`.

### `quiet-reinforce-beacon`

- supports: `beacon-security`
- dynamically crosses: `reserve-readiness` where reserve commitment required
- style: `quiet-preparation`
- costs: `reserve-strain` where applicable
- effect: physical preparation/coverage; no overt discovery signal.

### `visible-reinforce-beacon`

- supports: `beacon-security`
- crosses: `reserve-readiness`
- partner-sensitive under 39
- style: `visible-deterrence`
- costs: `reserve-strain`; add political friction when immediate authority unilateral
- effect: physical preparation + demonstrated denial + targeted discovery; real C6 deterrence path distinct from quiet.

### `hold-beacon-posture`

- supports: none
- style: `quiet-preparation`
- costs: `weaker-deterrence`.

Operations tie by HQ belief:

- preparation direction: `quiet-reinforce-beacon > visible-reinforce-beacon > hold-beacon-posture`
- unclear/coercion: `hold-beacon-posture > quiet-reinforce-beacon > visible-reinforce-beacon`

Standing direction applies first.

## `c5-reserve-decision`

Owner: `operations`.

### `keep-reserve-forward`

- supports: `beacon-security`
- crosses: `reserve-readiness`
- style: `quiet-preparation`
- costs: `reserve-strain`
- effect: reserve worsens; Beacon preparation becomes prepared
- **does not emit/refresh `reserve_exhaustion_signal` in C5**; no later normal Ravellan policy consumes it.

### `emergency-consolidation`

- supports: none
- style: `quiet-preparation`
- costs: `weaker-deterrence`
- effect: improve reserve; worsen exposure.

Tie:

- reserve brittle: `emergency-consolidation > keep-reserve-forward`
- otherwise: `keep-reserve-forward > emergency-consolidation`

C5 reserve/exposure effects compose order-independently under 39.

## `c5-attribution`

Exists only while `attribution-opportunity = credible` (unspent). Owner: `political`.

### `hold-attribution`

- supports: none
- style: `quiet-preparation`
- costs: `weaker-deterrence` in the sense of declining immediate public pressure
- preserves credible opportunity and possible C6 Hold And Expose.

### `use-attribution`

- supports: `partner-cooperation` when politically usable
- does **not** support `ravellan-understanding`
- style: `partner-consultation` when immediately coordinated, else `visible-deterrence`
- partner-sensitive under 39
- costs: `political-friction` when unilateral **plus known severe source cost `attribution-source-exposed` whenever public use occurs**
- effect: `credible → used`; immediate public/partner/discovery effects; permanently removes C6 Hold And Expose.

Staff recommendation applicability follows C5 package rules in 39. Player-safe copy must disclose both one-shot loss and protected-source exposure before selection.

## `c5-partner-authority`

Owner: `political`.

Exact authority/tempo/recommendation composition is owned by [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

### `honour-consultation`

- supports: `partner-cooperation`
- style: `partner-consultation`
- costs: immediate tempo when no active rapid formal channel exists
- always player-legal; after withdrawal can preserve commitment integrity without restoring access.

### `act-then-inform`

- supports: `beacon-security` only where complete package contains immediate partner-sensitive action
- crosses: `partner-consultation`
- style: `visible-deterrence`
- costs: `political-friction`
- only legal with at least one sensitive action; buys immediate unilateral tempo; package-level breach/damage under 39.

### `political-concession`

- supports: `partner-cooperation`
- style: `partner-consultation`
- costs: `political-friction` + severe concession history
- legal under authored deteriorated-partner/obligation prerequisites
- buys immediate authority/recovery.

Do not use an issue-local final tie: staff package composition under 39 guarantees legal all-Delegate intent and preserves channel/tempo semantics.

# Cycle 6

## `c6-terminal-response`

One issue exposes **only** routes legal under [[27-KESTREL-TERMINAL-MATRIX]].

Owner uses safe crisis family:

- `seizure-underway` → `operations`
- `threshold-confrontation` → `political`
- `pressure-receding` → `political`

### `quiet-denial`

- supports: `beacon-security` against seizure; restrained campaign preservation in non-seizure crisis
- style: `quiet-preparation`
- costs: none by default; seizure late-reaction cost is state-dependent terminal effect.

### `joint-visible-denial`

- supports: `beacon-security`, `partner-cooperation`
- style: `visible-deterrence`
- costs: `reserve-strain` through terminal route effect
- legal only where 27 says visible/joint response supplies player-safe value.

### `emergency-mobilisation`

- supports: `beacon-security`
- crosses: `reserve-readiness`
- style: `visible-deterrence`
- costs: `reserve-strain`; successful hold always severe `emergency-surge`
- legal only for `seizure-underway` under 27.

### `hold-and-expose`

- supports: `partner-cooperation`
- does **not** support `ravellan-understanding`; it spends evidence
- style: `partner-consultation`
- costs: `weaker-deterrence` against seizure plus severe `attribution-source-exposed`
- requires unspent credible attribution + partner access and any additional player-safe 27 predicate
- consumes the opportunity.

### Responsible-chief tie

Use only currently legal routes after 27 pruning.

For `seizure-underway`, Operations preference:

1. clean `quiet-denial` when its strongest known conditions hold;
2. `joint-visible-denial` when legal and Quiet is not the clean answer;
3. `emergency-mobilisation`;
4. `hold-and-expose` where legal.

For `threshold-confrontation`, Political preference:

1. `hold-and-expose` where legal and useful;
2. `joint-visible-denial` where legal under 27;
3. `quiet-denial`.

For `pressure-receding`, Political preference:

1. `hold-and-expose` where legal/useful under 27;
2. `quiet-denial`.

Never add pruned routes back merely to satisfy a tie list.

# Required #98/#103 metadata tests

At minimum prove:

- every stable issue/order ID appears only in authored cycle/state;
- all 12 opening standing-intent answer choices affect at least one reachable recommendation/reason or downstream delegated consequence;
- at least one real conflict exists between standing-intent fields;
- Lattice protection delegates only when standing direction selects it; liaison never delegates;
- reroute support tag corresponds to its actual persistent clue;
- C3 chief disagreement uses same `unclear + conflicted` belief;
- C5 recommendation changes with HQ/public state but not hidden truth;
- C5 package-composed recommendation leaves all-Delegate package legal;
- keep-reserve-forward has no dead C5 exhaustion-observation effect;
- C5/C6 attribution metadata exposes one-shot + source cost and never claims to create understanding;
- dynamic boundary/authority tags use player-known state only;
- issue omission is deterministic and avoids ceremonial empty work;
- C6 tie list uses only routes legal after 27 player-safe pruning;
- V1 content/advice unchanged.

## Rejection conditions

Reject Kestrel metadata if content invents a new tag/course to force balance, assigns support without real mechanic, lets chief preference pre-filter standing direction, lets liaison Delegate, hides known source/one-shot cost, preserves dead signal metadata, resolves a tie through array/randomness, creates ceremonial agenda work or reads hidden Ravellan truth to choose advice.
