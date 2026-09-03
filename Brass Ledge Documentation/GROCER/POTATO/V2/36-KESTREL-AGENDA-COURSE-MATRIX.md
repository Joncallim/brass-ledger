---
type: v2-kestrel-agenda-course-contract
status: active
---

# Kestrel Agenda And Course Matrix

Backlink: [[README]]

This document is the implementation authority for the **issue IDs, order IDs, standing-intent tags, prerequisites and responsible-chief tie-breaks** consumed by #98/#103. It prevents content implementation from silently redesigning staff behavior.

[[24-STAFF-RECOMMENDATION-POLICY]] owns the recommendation algorithm. This file supplies the Kestrel-authored inputs to that algorithm.

## Metadata vocabulary

Use only the already-authorised Kestrel tags.

### `supports`

- `beacon-security`
- `partner-cooperation`
- `ravellan-understanding`

### `crossesBoundary`

- `civilian-shipping`
- `partner-consultation`
- `reserve-readiness`

A course crosses a boundary only when its **current-state authored effect** actually violates that protected condition. The tag may therefore be derived from known public state for the issue, but never hidden Ravellan truth.

### `style`

- `quiet-preparation`
- `visible-deterrence`
- `partner-consultation`
- `neutral`

### `costs`

- `weaker-deterrence`
- `political-friction`
- `reserve-strain`

These are recommendation/reason tags, not meters. Concrete state transitions remain owned by [[25-KESTREL-CONSEQUENCE-MATRIX]].

## Global content validation

For every reachable issue state:

- exactly one responsible officer exists;
- all legal order IDs are unique/stable;
- required belief/capability/commitment predicates are explicit;
- each reachable final recommendation tie has an authored responsible-chief preference order;
- no preference order reads hidden truth;
- `supports`/boundary/style/cost tags must correspond to real authored consequences or known strategic purpose rather than being added merely to force a recommendation outcome.

## Cycle 1 — `c1-beacon-watch`

Responsible officer: `operations`.

No Defer disposition.

### `ordinary-watch`

- supports: none;
- crossesBoundary: none;
- style: `quiet-preparation`;
- costs: `weaker-deterrence`;
- direct consequences: leave Beacon exposure thin, emit weak coverage observation.

### `reinforce-watch`

- supports: `beacon-security`;
- crossesBoundary: `reserve-readiness`;
- style: `quiet-preparation`;
- costs: `reserve-strain`;
- direct consequences: contain exposure, strain reserve, emit credible coverage.

### Operations tie-break

If standing-direction/commitment logic leaves both courses:

`ordinary-watch > reinforce-watch`

Reason: with only the opening ambiguous picture and no command direction choosing otherwise, Operations preserves the reserve rather than spending it pre-emptively.

Possible concern on `ordinary-watch`: Beacon remains visibly thin.

## Cycle 1 — `c1-partner-consultation`

Responsible officer: `political`.

No Defer disposition.

### `informal-liaison`

- supports: none;
- crossesBoundary: none;
- style: `neutral`;
- costs: none;
- commitment: none.

### `formal-consultation-agreement`

- supports: `partner-cooperation`;
- crossesBoundary: none;
- style: `partner-consultation`;
- costs: none;
- commitment effect: create explicit consultation promise.

The future constraint created by the promise is shown as a known commitment cost; do not mislabel it as one of the three tolerated-cost tags.

### Political tie-break

`formal-consultation-agreement > informal-liaison`

Political's professional baseline is to secure explicit coalition alignment when no higher command direction says otherwise.

Possible concern: the agreement deliberately constrains future unilateral action.

## Cycle 1 — `c1-lattice-investment`

Responsible officer: `intelligence`.

No Defer disposition; “not protecting the investment” is an authored order rather than the special command disposition `defer`.

### `leave-lattice-unprotected-c1`

- supports: none;
- crossesBoundary: none;
- style: `neutral`;
- costs: none;
- consequence: Kestrel Lattice maturity becomes unreachable.

### `protect-lattice-c1`

- supports: `ravellan-understanding`;
- crossesBoundary: none;
- style: `neutral`;
- costs: none;
- consequence: advance Lattice 0→1.

### Intelligence tie-break

`leave-lattice-unprotected-c1 > protect-lattice-c1`

Without explicit command priority for understanding Ravellan, staff does not automatically protect a new three-window initiative from immediate competing demands.

If `ravellan-understanding` is the main priority, standing-direction precedence selects `protect-lattice-c1` before this tie-break.

## Cycle 2 — `c2-shipping-response`

Responsible officer: `operations`.

No Defer disposition.

### `quiet-escort`

- supports: `partner-cooperation` only when the alternative visible surge would currently violate partner consultation; otherwise supports none;
- crossesBoundary: `civilian-shipping` because authored delay/disruption remains, though less than reroute;
- style: `quiet-preparation`;
- costs: `weaker-deterrence`;
- direct effect: restrained escort and `visible_denial_signal = withheld`.

### `visible-patrol-surge`

- supports: `beacon-security`;
- crossesBoundary: `reserve-readiness`;
- additionally crosses `partner-consultation` when no known consultation/joint authority covers the visible escalation;
- style: `visible-deterrence`;
- costs: `reserve-strain`; add `political-friction` when partner authority is absent;
- direct effect: visible denial/credible coverage and reserve strain.

### `reroute-and-monitor`

- supports: none;
- crossesBoundary: `civilian-shipping`;
- style: `quiet-preparation`;
- costs: `political-friction`, `weaker-deterrence`;
- direct effect: larger civilian disruption while preserving reserve. The prototype grants no directional intelligence benefit from the “monitor” wording unless [[23-HQ-BELIEF-AND-EVIDENCE]] explicitly adds one later.

### Operations tie-break

If multiple candidates remain after command direction:

`quiet-escort > visible-patrol-surge > reroute-and-monitor`

Reason: under the still-uncertain picture, Operations uses the least escalatory direct protection before a reserve-heavy demonstration or civilian reroute.

Dissent/concerns may make the other courses attractive; this preference is not a hidden score.

## Cycle 2 — `c2-public-posture`

Responsible officer: `political`.

No Defer disposition. Silence is an authored order.

### `remain-silent`

- supports: none;
- crossesBoundary: none;
- style: `quiet-preparation`;
- costs: `weaker-deterrence`.

### `joint-non-attributive-warning`

- supports: `partner-cooperation`;
- crossesBoundary: none;
- style: `partner-consultation`;
- costs: none;
- prerequisite: partner consent is not withdrawn.

### `public-accusation`

- supports: `beacon-security` only as a visible-pressure/signalling course; it does not create physical preparation;
- crossesBoundary: `partner-consultation` when the accusation is unilateral under an active promise/known consultation requirement;
- style: `visible-deterrence`;
- costs: `political-friction`;
- legal with the weak/ambiguous Cycle-2 picture as a risky authored course; no claim is made that the accusation is evidentially justified;
- effect may breach the explicit promise and emit discovery/fracture signals under the consequence matrix.

### Political tie-break

`joint-non-attributive-warning > remain-silent > public-accusation`

If partner consent is withdrawn/unavailable, skip the joint course and use the remaining order.

Intelligence concern on `public-accusation`: current evidence does not support confident attribution.

## Cycle 2 — `c2-lattice-investment`

Issue exists only if Cycle-1 Lattice protection succeeded; otherwise maturity is already unreachable and the issue is omitted.

Responsible officer: `intelligence`.

### `leave-lattice-unprotected-c2`

- supports: none;
- style: `neutral`;
- costs: none;
- consequence: maturity becomes unreachable.

### `protect-lattice-c2`

- supports: `ravellan-understanding`;
- style: `neutral`;
- costs: none;
- consequence: 1→2.

Tie-break:

`leave-lattice-unprotected-c2 > protect-lattice-c2`

Standing `ravellan-understanding` priority may select protection first.

## Cycle 3 — `c3-reserve-posture`

Responsible officer: `operations`.

No Defer disposition.

### `forward-reserve-preparation`

- supports: `beacon-security`;
- crossesBoundary: `reserve-readiness`;
- style: `quiet-preparation` unless the specific authored visibility state makes the movement demonstrative; Kestrel default is quiet;
- costs: `reserve-strain`;
- direct effect: prepare Beacon, strain reserve, possible observable credible coverage.

### `hold-reserve`

- supports: none;
- crossesBoundary: none;
- style: `quiet-preparation`;
- costs: `weaker-deterrence`.

### Operations tie-break

At the mandatory `unclear + conflicted` Cycle-3 belief:

`forward-reserve-preparation > hold-reserve`

Operations' professional concern is response time; the standing reserve red line can still select `hold-reserve` before this tie-break.

Mandatory Intelligence dissent on the forward course: evidence remains conflicted and verification has value.

## Cycle 3 — `c3-focused-collection`

Responsible officer: `intelligence`.

No Defer disposition.

### `maintain-current-coverage`

- supports: `beacon-security`;
- style: `quiet-preparation`;
- costs: none;
- consequence: no focused collection; Beacon exposure is not worsened by collection diversion.

### `focus-staging-collection`

- supports: `ravellan-understanding`;
- style: `quiet-preparation`;
- costs: `weaker-deterrence`;
- consequence: worsen Beacon exposure and queue `staging-area-focus` result for Cycle 4.

### Intelligence tie-break

At `unclear + conflicted`:

`focus-staging-collection > maintain-current-coverage`

The Beacon-security main priority can select maintaining coverage before this professional tie-break.

Operations concern on focus: current Beacon coverage is being deliberately thinned for information.

## Cycle 3 — `c3-partner-reassurance`

Responsible officer: `political`.

The issue appears only when partner state or recent action makes reassurance materially relevant; do not create a ceremonial issue when partner is fully cooperative with no new concern.

### `routine-contact`

- supports: none;
- style: `neutral`;
- costs: none.

### `reassure-partner`

- supports: `partner-cooperation`;
- style: `partner-consultation`;
- costs: none;
- consequence: eligible partner improvement/coherent signal under consequence rules.

### Political tie-break

When the issue exists:

`reassure-partner > routine-contact`

## Cycle 3 — `c3-lattice-investment`

Issue exists only if scheduled advances 1 and 2 succeeded.

Responsible officer: `intelligence`.

### `leave-lattice-unprotected-c3`

- supports: none;
- style: `neutral`;
- costs: none;
- consequence: maturity fails.

### `protect-lattice-c3`

- supports: `ravellan-understanding`;
- style: `neutral`;
- costs: none;
- consequence: 2→3-operational.

Tie-break:

`leave-lattice-unprotected-c3 > protect-lattice-c3`

Standing `ravellan-understanding` priority may select protection first.

## Cycle 4 — `c4-exploit-lull`

The stable ID remains for compatibility with the authored slice, but player copy should describe the actual **pressure-pattern change** from [[37-RAVELLAN-WORLD-EFFECT-MATRIX]] rather than assume every history contains a literal lull.

Responsible officer: `operations`.

No Defer disposition.

### `recover-reserve`

- supports: none;
- crossesBoundary: none;
- style: `quiet-preparation`;
- costs: `weaker-deterrence`;
- consequence: improve reserve, worsen Beacon exposure.

### `prepare-beacon-quietly`

- supports: `beacon-security`;
- crossesBoundary: `reserve-readiness`;
- style: `quiet-preparation`;
- costs: `reserve-strain`;
- consequence: prepare Beacon, improve exposure, worsen reserve one step, emit credible coverage where detectable.

### `press-visible-advantage`

- supports: `beacon-security`;
- crossesBoundary: `reserve-readiness`;
- additionally crosses `partner-consultation` when no joint authority covers the action;
- style: `visible-deterrence`;
- costs: `reserve-strain`; add `political-friction` where partner authority is absent;
- consequence: visible denial/credible coverage, reserve strain, possible partner deterioration.

### Operations tie-break

`prepare-beacon-quietly > recover-reserve > press-visible-advantage`

If reserve is already `brittle`, reverse the first two for professional tie-break only:

`recover-reserve > prepare-beacon-quietly > press-visible-advantage`

Standing red line/priority/style still apply before this state-specific professional tie-break.

## Cycle 4 — intelligence opportunity

Lattice Task Collection is not an ordinary issue disposition; it is the separate zero-normal-intervention action owned by [[26-LATTICE-COLLECTION-MATRIX]].

If Lattice is unavailable, expose an optional issue:

`c4-partner-liaison`

Responsible officer: `intelligence`.

### `do-not-request-liaison`

- supports: none;
- style: `neutral`;
- costs: none.

### `request-partner-liaison`

- supports: `ravellan-understanding`;
- crossesBoundary: none;
- style: `partner-consultation`;
- costs: `political-friction` only in the sense of creating a real obligation; presentation must name the obligation rather than implying a numeric penalty;
- consumes one normal personal intervention when selected as an alternative to the delegated baseline;
- consequence: liaison obligation + narrower Cycle-5 evidence.

### Intelligence tie-break

`do-not-request-liaison > request-partner-liaison`

The expensive obligation-bearing fallback is not silently taken by staff; the commander must personally choose it unless standing/content implementation later explicitly authorises a different baseline through a product decision.

## Cycle 5 — `c5-beacon-posture`

Responsible officer: `operations`.

### `quiet-reinforce-beacon`

- supports: `beacon-security`;
- crossesBoundary: `reserve-readiness` when the known state indicates reserve commitment is required;
- style: `quiet-preparation`;
- costs: `reserve-strain` when that commitment applies.

### `visible-reinforce-beacon`

- supports: `beacon-security`;
- crossesBoundary: `reserve-readiness`;
- additionally crosses `partner-consultation` without known joint authority;
- style: `visible-deterrence`;
- costs: `reserve-strain`; add `political-friction` without partner authority.

### `hold-beacon-posture`

- supports: none;
- style: `quiet-preparation`;
- costs: `weaker-deterrence`.

### Operations tie-break by HQ belief

If assessment direction is `preparation`:

`quiet-reinforce-beacon > visible-reinforce-beacon > hold-beacon-posture`

If assessment is `unclear` or `coercion`:

`hold-beacon-posture > quiet-reinforce-beacon > visible-reinforce-beacon`

This uses HQ belief only, never hidden Ravellan state. Standing direction may override this tie-break.

## Cycle 5 — `c5-partner-authority`

Responsible officer: `political`.

### `honour-consultation`

- supports: `partner-cooperation`;
- style: `partner-consultation`;
- costs: `weaker-deterrence` when waiting reduces military tempo;
- honours active promise/liaison obligation where applicable.

### `act-then-inform`

- supports: `beacon-security` where the associated immediate action requires freedom from partner delay;
- crossesBoundary: `partner-consultation` when an active promise/obligation exists;
- style: `visible-deterrence`;
- costs: `political-friction`;
- may breach promise/obligation.

### `political-concession`

- supports: `partner-cooperation`;
- style: `partner-consultation`;
- costs: `political-friction`;
- legal only when partner consent is `conditional` or `withdrawn`, or an active liaison obligation requires a costly recovery that ordinary consultation can no longer satisfy;
- can restore withdrawn consent to conditional but remains severe terminal cost.

### Political tie-break

If an active promise/obligation can still be honoured:

`honour-consultation > political-concession > act-then-inform`

If partner is withdrawn and concession is legal:

`political-concession > act-then-inform`

If no commitment exists and partner is healthy:

`honour-consultation > act-then-inform`

## Cycle 5 — `c5-reserve-decision`

Responsible officer: `operations`.

### `keep-reserve-forward`

- supports: `beacon-security`;
- crossesBoundary: `reserve-readiness`;
- style: `visible-deterrence` when publicly forward, otherwise `quiet-preparation`;
- costs: `reserve-strain`.

### `emergency-consolidation`

- supports: none;
- style: `quiet-preparation`;
- costs: `weaker-deterrence`;
- consequence: improve reserve and worsen Beacon exposure.

### Operations tie-break

If reserve is `brittle`:

`emergency-consolidation > keep-reserve-forward`

Otherwise:

`keep-reserve-forward > emergency-consolidation`

Standing reserve red line can select consolidation before tie-break; Beacon priority can select keeping forward before tie-break where both remain.

Mandatory Political/Operations conflict should be authored where keeping forward also requires partner-sensitive escalation/commitment handling.

## Cycle 5 — `c5-attribution`

Issue exists only while `attribution-opportunity = credible`.

Responsible officer: `political`.

### `hold-attribution`

- supports: none;
- style: `quiet-preparation`;
- costs: `weaker-deterrence`.

### `use-attribution`

- supports: `partner-cooperation`, `ravellan-understanding`;
- style: `partner-consultation` when jointly usable, otherwise `visible-deterrence`;
- crossesBoundary: `partner-consultation` if an active known commitment requires consultation and the authored use would be unilateral;
- costs: `political-friction` when unilateral/source-sensitive;
- effect: consumes credible opportunity and emits discovery/coherent signals as authored.

### Political tie-break

If joint/partner-safe use is currently available:

`use-attribution > hold-attribution`

Otherwise:

`hold-attribution > use-attribution`

Intelligence may attach a source/uncertainty concern where authored evidence remains mixed; it does not see hidden truth.

## Cycle 6 — `c6-terminal-response`

One terminal issue exposes only the legal courses from [[27-KESTREL-TERMINAL-MATRIX]].

Responsible officer depends on the **currently observable terminal crisis family**, not prior hidden posture:

- `attempt_seizure` → `operations`;
- `threshold_challenge` → `political`;
- `abort_and_pressure` → `political`.

### `quiet-denial`

- supports: `beacon-security`;
- style: `quiet-preparation`;
- costs: none by default; terminal resolver may derive severe fallback cost from actual campaign state.

### `joint-visible-denial`

- supports: `beacon-security`, `partner-cooperation`;
- style: `visible-deterrence`;
- costs: `reserve-strain` where the known state requires material mobilisation.

### `emergency-mobilisation`

- supports: `beacon-security`;
- crossesBoundary: `reserve-readiness`;
- style: `visible-deterrence`;
- costs: `reserve-strain`;
- always legal under the terminal matrix even where it may fail.

### `hold-and-expose`

- supports: `partner-cooperation`, `ravellan-understanding`;
- style: `partner-consultation`;
- costs: `weaker-deterrence`;
- requires the terminal matrix's credible-exposure/partner-access predicates.

### Terminal responsible-chief tie-break

For observable `attempt_seizure`, Operations preference among legal courses is:

1. `quiet-denial` when `preparedDenial && usableWarning && exposureControlled`;
2. `joint-visible-denial` when joint authority exists and the clean Quiet conditions do not;
3. `emergency-mobilisation`;
4. `hold-and-expose`.

For observable `threshold_challenge`, Political preference is:

1. `hold-and-expose` when legal;
2. `joint-visible-denial` when legal without requiring a political concession/brittle overreaction;
3. `quiet-denial` when legal;
4. `emergency-mobilisation`.

For observable `abort_and_pressure`, Political preference is:

1. `hold-and-expose` when legal;
2. `quiet-denial` when legal;
3. `joint-visible-denial`;
4. `emergency-mobilisation`.

These preferences use observable terminal behavior and known coalition state only. They are staff advice, not the final outcome resolver and not an omniscient score.

## Required content/recommendation tests

At minimum prove:

- every stable issue/order ID above is reachable only in its authored cycle/state;
- standing red line → priority → style → tolerated-cost can deterministically change recommendations using these tags;
- every one of the 12 opening intent answer choices, considered field-by-field, affects at least one reachable recommendation/reason or downstream delegated consequence somewhere in Kestrel;
- Lattice protection is delegated automatically only when standing direction selects it; otherwise Intelligence's tie-break leaves it unprotected unless the commander intervenes;
- `reroute-and-monitor` receives no hidden intelligence-support tag/effect absent explicit evidence content;
- Cycle-3 mandatory chief disagreement uses the same `unclear + conflicted` HQ belief;
- Cycle-5 recommendation changes when HQ belief changes but not when hidden Ravellan truth alone changes;
- all reachable final ties have the authored tie-break above;
- dynamic boundary tags derive only from known current state/commitments, never hidden truth;
- issue omission (e.g. missed Lattice, irrelevant reassurance, non-credible attribution) is deterministic and does not create empty/ceremonial agenda work;
- V1 content/advice remains unchanged.

## Rejection conditions

Reject Kestrel content if a content author invents a new course/tag to force balance, lets chief preference pre-filter standing intent, assigns strategic support without a real downstream mechanic, resolves a tie through array order/randomness, creates ceremonial agenda issues with no consequential choice, or reads hidden Ravellan state to choose staff advice.
