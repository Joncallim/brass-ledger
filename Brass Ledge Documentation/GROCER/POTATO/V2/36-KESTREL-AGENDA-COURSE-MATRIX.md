---
type: v2-kestrel-agenda-course-contract
status: active
---

# Kestrel Agenda And Course Matrix

Backlink: [[README]]

This is the implementation authority for Kestrel **issue IDs, order IDs, standing-intent metadata, prerequisites, authority flags and responsible-chief tie-breaks** consumed by #98/#103.

[[24-STAFF-RECOMMENDATION-POLICY]] owns the recommendation algorithm. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns interactions that require complete-command-set composition.

## Metadata vocabulary

### `supports`

Only:

- `beacon-security`
- `partner-cooperation`
- `ravellan-understanding`

A support tag must correspond to a real authored strategic effect. Do not tag “uses information” as “supports understanding” when the action merely spends existing evidence.

### `crossesBoundary`

Only:

- `civilian-shipping`
- `partner-consultation`
- `reserve-readiness`

Boundary crossing may be state-dependent, but only from player-known/public state and commitments.

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

Bounded authority flag. Kestrel uses it only for `request-partner-liaison`.

A course with this flag is never a staff recommendation and cannot execute through Delegate.

## Global validation

For every reachable issue state:

- exactly one responsible officer;
- stable unique issue/order IDs;
- explicit prerequisites/omission rules;
- tags correspond to real mechanics;
- all reachable final recommendation ties have authored preference;
- no preference/tag reads hidden Ravellan truth;
- the composed all-Delegate staff package is legal under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

## Cycle 1 — `c1-beacon-watch`

Owner: `operations`. No Defer.

### `ordinary-watch`

- supports: none;
- style: `quiet-preparation`;
- costs: `weaker-deterrence`;
- consequence: exposure remains thin; emits weak coverage under [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

### `reinforce-watch`

- supports: `beacon-security`;
- crosses: `reserve-readiness`;
- style: `quiet-preparation`;
- costs: `reserve-strain`;
- consequence: improve exposure, strain reserve, emit credible coverage.

Tie:

`ordinary-watch > reinforce-watch`

Opening professional baseline preserves reserve absent stronger standing direction.

## Cycle 1 — `c1-partner-consultation`

Owner: `political`. No Defer.

### `informal-liaison`

- supports: none;
- style: `neutral`;
- costs: none;
- no promise.

### `formal-consultation-agreement`

- supports: `partner-cooperation`;
- style: `partner-consultation`;
- costs: none;
- creates active consultation promise/channel;
- emits coherent coalition observation under 37A;
- channel can coordinate C2 visible surge and, if still active, provide rapid C5 consultation authority under 39.

Tie:

`informal-liaison > formal-consultation-agreement`

Binding commitment is not Political's unconditional baseline. Partner priority/style can select the formal course before the tie.

## Cycle 1 — `c1-lattice-investment`

Owner: `intelligence`. No Defer.

### `leave-lattice-unprotected-c1`

- supports: none;
- style: `neutral`;
- costs: none;
- makes Kestrel Lattice maturity unreachable.

### `protect-lattice-c1`

- supports: `ravellan-understanding`;
- style: `neutral`;
- costs: none;
- Lattice 0→1.

Tie:

`leave-lattice-unprotected-c1 > protect-lattice-c1`

Understanding priority can select protection before tie.

## Cycle 2 — `c2-shipping-response`

Owner: `operations`. No Defer.

### `quiet-escort`

- supports: `partner-cooperation` only where visible surge would currently violate partner consultation; otherwise none;
- crosses: `civilian-shipping` (limited delay/disruption still exists);
- style: `quiet-preparation`;
- costs: `weaker-deterrence`;
- emits withheld visible denial.

### `visible-patrol-surge`

- supports: `beacon-security`;
- crosses: `reserve-readiness`;
- additionally crosses `partner-consultation` unless the complete package satisfies the C2 coordinated-surge rule in 39;
- style: `visible-deterrence`;
- costs: `reserve-strain`; add `political-friction` when uncoordinated;
- emits visible denial/credible coverage and counts a qualifying reserve-deployment cycle.

### `reroute-and-monitor`

- supports: `ravellan-understanding`;
- crosses: `civilian-shipping`;
- style: `quiet-preparation`;
- costs: `political-friction`, `weaker-deterrence`;
- preserves reserve;
- creates the bounded persistent C3 monitoring clue in [[23-HQ-BELIEF-AND-EVIDENCE]] / 39.

Tie:

`quiet-escort > visible-patrol-surge > reroute-and-monitor`

The other courses remain meaningful through physical deterrence/opponent signaling or information value.

## Cycle 2 — `c2-public-posture`

Owner: `political`. No Defer; silence is an authored order.

### `remain-silent`

- supports: none;
- style: `quiet-preparation`;
- costs: `weaker-deterrence`.

### `joint-non-attributive-warning`

- supports: `partner-cooperation`;
- style: `partner-consultation`;
- costs: none;
- prerequisite: partner consent not withdrawn;
- emits coherent unity; with active formal consultation can coordinate the visible surge.

### `public-accusation`

- supports: `beacon-security` only as an overt pressure/signaling course;
- crosses: `partner-consultation` because this Kestrel course is unilateral;
- style: `visible-deterrence`;
- costs: `political-friction`;
- always worsens partner; breaches active promise; emits fractured unity + discovery suspicion;
- legal under weak/ambiguous evidence as a deliberately risky course, not an evidentially endorsed one.

Tie:

`joint-non-attributive-warning > remain-silent > public-accusation`

Skip joint when unavailable. Intelligence concern attaches to accusation because current evidence is weak.

## Cycle 2 — `c2-lattice-investment`

Exists only if C1 protection succeeded. Owner: `intelligence`.

### `leave-lattice-unprotected-c2`

- supports none; neutral; maturity becomes unreachable.

### `protect-lattice-c2`

- supports `ravellan-understanding`; neutral; Lattice 1→2.

Tie:

`leave-lattice-unprotected-c2 > protect-lattice-c2`

## Cycle 3 — `c3-reserve-posture`

Owner: `operations`. No Defer.

### `forward-reserve-preparation`

- supports: `beacon-security`;
- crosses: `reserve-readiness`;
- style: `quiet-preparation`;
- costs: `reserve-strain`;
- prepares Beacon, strains reserve, emits credible coverage and counts qualifying deployment.

### `hold-reserve`

- supports none;
- style `quiet-preparation`;
- costs `weaker-deterrence`.

At mandatory `unclear + conflicted` belief:

`forward-reserve-preparation > hold-reserve`

Reserve red line can select hold before tie. Intelligence dissent: evidence remains conflicted.

## Cycle 3 — `c3-focused-collection`

Owner: `intelligence`. No Defer.

### `maintain-current-coverage`

- supports `beacon-security`;
- style `quiet-preparation`;
- costs none.

### `focus-staging-collection`

- supports `ravellan-understanding`;
- style `quiet-preparation`;
- costs `weaker-deterrence`;
- worsens Beacon exposure and queues posture-blind staging result for C4.

Tie at conflict:

`focus-staging-collection > maintain-current-coverage`

Beacon priority can select coverage first. Operations concern attaches to the collection diversion.

## Cycle 3 — `c3-partner-reassurance`

Owner: `political`.

Issue exists only when partner state/recent action makes reassurance material.

### `routine-contact`

- supports none; neutral; no cost.

### `reassure-partner`

- supports `partner-cooperation`;
- style `partner-consultation`;
- improves eligible partner state and emits coherent unity under 37A.

Tie:

`reassure-partner > routine-contact`

## Cycle 3 — `c3-lattice-investment`

Exists only if advances 1–2 succeeded. Owner: `intelligence`.

### `leave-lattice-unprotected-c3`

- supports none; maturity fails.

### `protect-lattice-c3`

- supports `ravellan-understanding`; Lattice 2→operational.

Tie:

`leave-lattice-unprotected-c3 > protect-lattice-c3`

## Cycle 4 — `c4-exploit-lull`

Stable ID retained; player copy describes the actual ambiguous pressure-pattern change, not a guaranteed lull.

Owner: `operations`. No Defer.

### `recover-reserve`

- supports none;
- style `quiet-preparation`;
- costs `weaker-deterrence`;
- improve reserve, worsen Beacon exposure, emit weak coverage.

### `prepare-beacon-quietly`

- supports `beacon-security`;
- crosses `reserve-readiness`;
- style `quiet-preparation`;
- costs `reserve-strain`;
- prepare Beacon, improve exposure, worsen reserve;
- emit credible coverage + discovery suspicion as targeted detectable countermeasure.

### `press-visible-advantage`

- supports `beacon-security`;
- crosses `reserve-readiness`;
- dynamically crosses `partner-consultation` when uncoordinated;
- style `visible-deterrence`;
- costs `reserve-strain` plus political friction when applicable;
- visible denial/credible coverage and qualifying reserve event.

Normal tie:

`prepare-beacon-quietly > recover-reserve > press-visible-advantage`

If reserve `brittle`:

`recover-reserve > prepare-beacon-quietly > press-visible-advantage`

Standing direction precedes this professional tie.

## Cycle 4 — Lattice / liaison

Operational Lattice Task Collection is the separate zero-normal-intervention action in [[26-LATTICE-COLLECTION-MATRIX]].

If Lattice is unavailable, optional issue:

`c4-partner-liaison`

Owner: `intelligence`.

### `do-not-request-liaison`

- supports none; neutral; no cost.

### `request-partner-liaison`

- supports `ravellan-understanding`;
- style `partner-consultation`;
- costs: no tolerated-cost tag; the explicit liaison obligation is the political cost;
- `requiresIntervention = true`;
- creates liaison obligation and narrower C5 auxiliary evidence.

Tie among staff-recommendable candidates is necessarily `do-not-request-liaison`; request liaison is player-only intervention.

## Cycle 5 — `c5-beacon-posture`

Owner: `operations`.

### `quiet-reinforce-beacon`

- supports `beacon-security`;
- dynamically crosses `reserve-readiness` when reserve commitment required;
- style `quiet-preparation`;
- costs `reserve-strain` where applicable;
- physical preparation/coverage without overt discovery signal.

### `visible-reinforce-beacon`

- supports `beacon-security`;
- crosses `reserve-readiness`;
- partner-sensitive under 39;
- style `visible-deterrence`;
- costs `reserve-strain` plus political friction when immediate authority is unilateral;
- physical preparation plus demonstrated denial + targeted discovery signal, giving it a real deterrence path distinct from quiet reinforcement.

### `hold-beacon-posture`

- supports none;
- style `quiet-preparation`;
- costs `weaker-deterrence`.

Operations tie by HQ belief:

- preparation direction: `quiet-reinforce-beacon > visible-reinforce-beacon > hold-beacon-posture`;
- unclear/coercion: `hold-beacon-posture > quiet-reinforce-beacon > visible-reinforce-beacon`.

Standing direction applies first.

## Cycle 5 — `c5-reserve-decision`

Owner: `operations`.

### `keep-reserve-forward`

- supports `beacon-security`;
- crosses `reserve-readiness`;
- style `quiet-preparation` for Kestrel metadata;
- costs `reserve-strain`;
- counts qualifying deployment, but is not separately partner-sensitive.

### `emergency-consolidation`

- supports none;
- style `quiet-preparation`;
- costs `weaker-deterrence`;
- improve reserve / worsen exposure.

Tie:

- reserve brittle: `emergency-consolidation > keep-reserve-forward`;
- otherwise: `keep-reserve-forward > emergency-consolidation`.

C5 reserve/exposure effects compose order-independently under 39.

## Cycle 5 — `c5-attribution`

Issue exists only while `attribution-opportunity = credible` (unspent).

Owner: `political`.

### `hold-attribution`

- supports none;
- style `quiet-preparation`;
- costs `weaker-deterrence` in the sense of declining immediate public pressure;
- preserves the one-shot opportunity and therefore preserves possible C6 Hold And Expose.

### `use-attribution`

- supports `partner-cooperation` when politically usable;
- **does not support `ravellan-understanding`**; it spends information rather than acquiring it;
- style `partner-consultation` when immediately coordinated, otherwise `visible-deterrence`;
- partner-sensitive under 39;
- costs political friction when unilateral;
- `credible → used`, immediate partner/public/discovery effects;
- permanently removes C6 Hold And Expose for Kestrel.

Staff recommendation applicability follows the C5 package rules in 39. The player-safe choice must state that using attribution spends the final exposure opportunity.

## Cycle 5 — `c5-partner-authority`

Owner: `political`.

Exact authority/tempo/composition semantics are owned by [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

### `honour-consultation`

- supports `partner-cooperation`;
- style `partner-consultation`;
- may cost immediate tempo when no rapid formal consultation channel exists;
- always player-legal; after partner withdrawal it can honour commitments without restoring access.

### `act-then-inform`

- supports `beacon-security` only where the complete package contains a partner-sensitive immediate action;
- crosses `partner-consultation`;
- style `visible-deterrence`;
- costs `political-friction`;
- only legal with at least one partner-sensitive C5 action; buys immediate unilateral tempo and breaches/damages as authored.

### `political-concession`

- supports `partner-cooperation`;
- style `partner-consultation`;
- costs `political-friction`;
- legal under existing deteriorated-partner/obligation prerequisites;
- buys immediate authority/recovery at severe terminal cost.

Do **not** use a simple issue-local tie here. Staff recommendation is package-composed under 39 so the all-Delegate intended headquarters package is always legal and the formal-channel tempo benefit is preserved.

## Cycle 6 — `c6-terminal-response`

One terminal issue exposes only legal final courses from [[27-KESTREL-TERMINAL-MATRIX]].

Responsible officer uses the **safe observable crisis family**, never raw #99 action ID:

- `seizure-underway` → `operations`;
- `threshold-confrontation` → `political`;
- `pressure-receding` → `political`.

### `quiet-denial`

- supports `beacon-security` against seizure and restrained campaign preservation in non-seizure crisis;
- style `quiet-preparation`.

### `joint-visible-denial`

- supports `beacon-security`, `partner-cooperation`;
- style `visible-deterrence`;
- costs `reserve-strain` through terminal route effect.

### `emergency-mobilisation`

- supports `beacon-security`;
- crosses `reserve-readiness`;
- style `visible-deterrence`;
- costs `reserve-strain` and always severe `emergency-surge` when successful.

### `hold-and-expose`

- supports `partner-cooperation`;
- **does not support `ravellan-understanding`**; it uses preserved evidence;
- style `partner-consultation`;
- prerequisite: unspent `attribution-opportunity = credible` + partner access;
- terminal resolver applies partner/attribution effects.

### Terminal staff tie-break

Use only safe crisis family + player-known coalition state.

#### `seizure-underway`

1. clean `quiet-denial` where its known preparation/warning/exposure conditions hold;
2. `joint-visible-denial` when legal and clean Quiet is unavailable;
3. `emergency-mobilisation`;
4. `hold-and-expose`.

#### `threshold-confrontation`

1. `hold-and-expose` when legal;
2. `joint-visible-denial` when legal without a known concession/brittle overreaction concern;
3. `quiet-denial`;
4. `emergency-mobilisation`.

#### `pressure-receding`

1. `hold-and-expose` when legal;
2. `quiet-denial`;
3. `joint-visible-denial`;
4. `emergency-mobilisation`.

These are explainable staff preferences, not outcome scoring.

## Required tests

At minimum prove:

- every issue/order ID is cycle/state-reachable exactly as authored;
- every opening intent answer changes at least one reachable recommendation/reason/downstream delegated consequence across Kestrel;
- standing red line → priority → style → tolerated cost changes recommendations through real tags;
- C1 formal consultation is not universal baseline but partner direction can select it;
- Lattice protection is not automatically delegated absent understanding direction;
- reroute carries real understanding support via persistent monitoring evidence;
- C3 disagreement uses same `unclear + conflicted` belief;
- liaison is `requiresIntervention`, never delegated;
- C5 visible vs quiet reinforcement is mechanically distinct through adversary signaling;
- C5 all-Delegate package is legal under 39 in every reachable state;
- C5 use/hold attribution reflects one-shot final-route trade;
- terminal issue uses safe crisis-family IDs only;
- no course has a support tag without a real downstream mechanic;
- every reachable final tie is deterministic and hidden-truth-safe;
- #107 local course-dominance diagnostic finds no unintentional trap course in canonical Kestrel;
- V1 content/advice remains unchanged.

## Rejection conditions

Reject Kestrel content if it invents new tags/courses to force balance, lets chief preference pre-filter standing direction, restores dominated metadata (e.g. reroute with no information payoff), makes liaison delegable, treats evidence-spending as understanding gain, uses raw hidden terminal IDs for staff advice, resolves ties through array/random order or creates ceremonial issues with no consequential choice.