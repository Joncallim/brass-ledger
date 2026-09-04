---
type: v2-ravellan-world-effect-contract
status: active
---

# Ravellan World-Effect Matrix

Backlink: [[README]]

This document is the implementation authority for how hidden Ravellan decisions from [[22-RAVELLAN-EXECUTABLE-POLICY]] become **bounded world effects and player-observable situation changes** in Kestrel. It belongs to #103 content/world integration and does not change #99 policy.

[[23-HQ-BELIEF-AND-EVIDENCE]] / [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] own HQ intelligence derivation. This file may name the ordinary evidence IDs associated with fixed manifestations, but it does **not** authorise narrative prose or hidden action IDs to become extra analytic evidence.

# Product purpose

Ravellan must feel like an actor whose choices change the situation without turning a hidden action ID into arbitrary drama or an intelligence oracle.

The player sees observable manifestations, not hidden action IDs. The same visible manifestation can be compatible with more than one hidden action.

# World manifestation vs intelligence observation

These are separate paths:

```text
hidden Ravellan decision
→ bounded world manifestation
→ safe situation prose
```

and, only where authorised:

```text
trusted hidden history
→ #100/#102 observation extractor
→ bounded source fact
→ HQ evidence
→ analysis
```

**Never parse situation prose back into evidence.**

The world writer does not decide assessment, warning or public-case strength. The intelligence extractor does not receive arbitrary prose and infer hidden meaning.

# Timing

Cycles 1–5:

1. authoritative `ravellan-decision` selects hidden normal action;
2. action creates the bounded same-cycle manifestation below;
3. safe situation projection may describe only authorised observable facts;
4. ordinary fixed evidence is generated only where [[23-HQ-BELIEF-AND-EVIDENCE]] says it exists;
5. directed evidence requires an explicit observation extractor from [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] or [[26-LATTICE-COLLECTION-MATRIX]];
6. coalition orders later in cycle may create Ravellan observations for N+1 under [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

Cycle 6 uses terminal manifestation below.

# Normal action — `probe_shipping`

## World effect

Visible ambiguous pressure on commercial movement: shadowing, inspections, auxiliary/coastguard interference, close presence below overt attack.

## Safe manifestation

- pressure continues/intensifies;
- Ravellan remains below obvious-war threshold;
- manifestation does not establish whether pressure is the operation or cover for preparation.

## HQ evidence boundary

Only the fixed ordinary evidence from [[23-HQ-BELIEF-AND-EVIDENCE]]:

- C1 `opening-pressure-ambiguous`;
- C2 `shipping-probe-ambiguous`;
- later cycle pressure summaries remain ambiguous unless directed collection observes more.

No automatic directional evidence from action ID.

## Persistent effect

No generic coalition meter. Specific C2 shipping consequences arise from the authored coalition response, not hidden action damage.

# Normal action — `seed_deception`

## World effect

Misleading/internally inconsistent visible pattern through exercises, movement, messaging or tasking.

## Safe manifestation

Player may see contradictory/erratic cues, never the label “deception” before debrief.

## HQ evidence boundary

No automatic directional evidence.

The fixed C3 pair remains:

- `staging-logistics-anomaly` — preparation indicator;
- `combat-elements-dispersed` — coercion indicator.

Important: those are **authored bounded observations**, not a direct decode of `seed_deception` or hidden preparation. `combat-elements-dispersed` means what routine coverage sees, not omniscient global truth.

Directed collection may later supersede/challenge those observations through authorised source-fact extractors.

## Persistent effect

None beyond hidden policy/history. No confusion/deception meter.

# Normal action — `prepare_beacon_seizure`

## World effect

Advance hidden preparation exactly as #99 owns:

`none → developing → ready → ready`.

## Safe manifestation

Ordinary observation does not reveal preparation action. Overt pressure can plateau/thin/continue while important activity occurs outside obvious confrontation.

## HQ evidence boundary

The action itself creates **no automatic preparation evidence or tactical warning**.

Preparation evidence/warning can arise only from explicitly frozen observation paths:

- fixed C3 bounded signposts;
- C3 focused collection result at C4;
- later Lattice Task Collection;
- liaison where authorised;
- another future explicit evidence rule.

Never translate the action to “Intelligence detects preparation.”

## Persistent effect

Only hidden Ravellan preparation/posture history changes here.

# Normal action — `pause_consolidate`

## World effect

Reduce immediate visible pressure and consolidate/wait.

## Safe manifestation

Patrol/harassment eases or pulls farther away. This does not tell the player whether deterrence worked, a feint is ending, preparation moved out of sight, or Ravellan is waiting.

## HQ evidence boundary

Ambiguous only. No automatic coercion or “crisis over” conclusion.

## Persistent effect

No automatic coalition reserve/partner recovery.

# Cycle-specific pressure projection

## C1

#99 forces `probe_shipping`.

Safe situation:

- increased maritime pressure;
- partner asks coalition intent;
- HQ cannot distinguish preparation/coercion/testing.

## C2

C1 shipping pressure persists into the shipping-response issue regardless of new C2 action.

Overlay:

- probe → pressure continues/intensifies;
- deception → pressure continues + contradictory exercise/messaging cues;
- prepare → prior pressure persists while some new activity shifts away from obvious lane;
- pause illegal.

All support the same C2 agenda without pretending the hidden world actions are identical.

## C3

Fixed two-item conflicting evidence appears before command regardless hidden action.

Action may affect **situation wording only**:

- probe → active pressure;
- deception → more contradictory visible pattern;
- prepare → overt pressure steady while elsewhere unclear;
- pause → visible pressure eases.

The situation wording may not add/remove a side of the fixed C3 analytic conflict.

## C4

Action-specific safe manifestation:

- pause → visible lull;
- prepare → obvious shipping pressure thins/plateaus while other activity is harder to read;
- deception → contradictory/erratic posture;
- probe → pressure continues.

All map to exactly one ordinary analytic evidence ID:

`cycle4-pressure-pattern-ambiguous`

The **evidence semantics/summary ref remain generic**: visible pressure pattern changed/continued but does not establish intent.

Action-specific situation prose is allowed for atmosphere/world legibility but is **not** passed to the analytic reducer. A test must prove changing only the safe C4 situation variant leaves ordinary C4 evidence/assessment identical.

## C5

Fixed collision remains: Beacon warning/uncertainty, authority deadline, reserve state, possible legitimate attribution opportunity.

Action changes safe situation overlay only:

- probe → overt pressure high;
- deception → public/operational picture contradictory;
- prepare → overt activity need not rise with hidden preparation;
- pause → visible pressure eases without proving crisis ended.

HQ assessment/warning/public-case basis comes from #100 evidence history, not hidden action label or prose parsing.

# C2 shipping-pressure consequence

Ravellan's C1 probe creates external pressure; coalition C2 response conditions severity.

## Quiet escort

Pressure continues, disruption limited, some delay remains.

## Visible patrol surge

Pressure contested, disruption limited, coalition pays authored reserve/partner/signal costs.

## Reroute and monitor

Ravellan caused pressure; coalition deliberately accepts larger civilian disruption to preserve reserve/create monitoring opportunity. Causal beat should distinguish external cause from player-conditioned severity.

No permanent shipping meter.

# Action-history access for intelligence collection

Raw verified Ravellan action history is **not** general HQ input.

Only target-authorised observation extractors may consume it:

- #100 C2 reroute extractor consumes exactly C2 action + C2 post-decision preparation;
- #102 auxiliary/sync extractors consume only their frozen action/preparation slices.

Those extractors return bounded source facts/evidence. Recommendation/UI never receives raw action history.

# C6 terminal manifestation

## `attempt_seizure`

Overt fact: limited move against Beacon underway. Player may know current attack without learning prior hidden posture/preparation history.

## `threshold_challenge`

Overt high-pressure confrontation without observable prepared seizure force. Prior hidden path remains unknown.

## `abort_and_pressure`

Immediate military confrontation recedes while political/strategic pressure continues. Still yields a terminal command choice, not automatic victory.

# Replay / content proof

Persist/reconstruct enough authoritative world history to prove:

- each hidden decision has only its frozen manifestation;
- same action/cycle/history → same world/safe effect;
- safe projection never includes hidden action ID as explanation pre-debrief;
- ordinary evidence matches [[23-HQ-BELIEF-AND-EVIDENCE]] exactly;
- changing action-specific C4 situation prose variant cannot change generic C4 evidence/assessment;
- C2 shipping issue remains reachable for every legal C2 action because C1 pressure persists;
- hidden prepare action alone creates no automatic assessment/warning/public case;
- no persistent coalition state changes merely because a narrative writer wants extra drama.

# Required #103 tests

At minimum:

- all four normal action projections in legal cycles stay within bounded effect set;
- C1 probe opening exact;
- all C2 actions preserve shipping-response agenda with correct overlay;
- C3 HQ fixed conflict unchanged by hidden action absent directed collection;
- C3 routine disposition evidence is bounded/non-omniscient;
- all C4 action-specific situation variants map to the exact same generic analytic evidence semantics;
- **safe situation prose never becomes an intelligence input**;
- hidden prepare action alone creates no automatic prep evidence/warning;
- terminal current crisis observable while prior hidden history stays gated;
- V1 content unchanged.

# Rejection conditions

Reject #103 if it invents per-action damage/meters, reveals `prepare_beacon_seizure` directly to HQ, lets UI/analysis interpret hidden action IDs, parses narrative situation prose into directional evidence, treats routine C3 observation as global truth, spawns unplanned agenda items for drama, or gives the same action arbitrary effects without an authored cycle/history rule.
