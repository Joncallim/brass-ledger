---
type: mechanics-translation
area: s1-s5
status: active
priority: P1
tags:
  - POTATO
  - CELERY
  - s1-s5
  - mechanics
---

# S1-S5 Mechanics Translation

Backlink: [[POTATO]]

Doctrine source: [[../CELERY/CELERY]]

## Purpose

This note translates CELERY's staff playbook into POTATO game mechanics. The goal is to make staff doctrine playable without forcing the player to read doctrine.

## Global Translation Rule

Every major decision should produce a staff readout with five questions:

| Function | Player-facing question | Engine expression |
| --- | --- | --- |
| S1 | Can the people endure it? | Recovery debt, reserve predictability, personnel shortfalls, deployable units. |
| S2 | Is the picture reliable enough? | Estimate confidence, visibility, deception risk, warning reliability. |
| S3 | Can it be executed? | Visible posture, executable posture, training load, operations burden. |
| S4 | Can it be supported? | Stockpile depth, lift burn, depot backlog, munitions/fuel/lift sufficiency. |
| S5 | Does it fit the campaign? | Strategic coherence, doctrine alignment, cabinet cover, alliance alignment. |

## Existing Engine Fit

The current code already supports the core model:

- `packages/shared/src/index.ts` defines `StaffFunctionId`, `StaffMechanicsState`, `StaffFunctionDefinition`, `StaffFunctionReadout`, `buildDirectorateBurden`, and `buildStaffFunctionReadouts`.
- `packages/sim/src/index.ts` updates `staffMechanics` during turn resolution.
- `packages/content/src/scenario.ts` defines the scenario's S1-S5 staff functions, staff capacities, chief archetypes, memo burden, tags, and program pushes.

## S1 Personnel

CELERY doctrine: S1 protects force endurance and warns when visible readiness consumes future people.

Current mechanics:

- `staffMechanics.s1.recoveryDebt`
- `staffMechanics.s1.reservePredictability`
- `strategic.forceGeneration.deployableUnits`
- `strategic.forceGeneration.reserveStrain`
- `strategic.forceGeneration.personnelShortfalls`
- people directorate burden

Required player behavior:

- Surge decisions should be attractive in the short term but visibly increase recovery debt.
- Recovery, retention, training discipline, and reserve predictability choices should reduce compounding personnel risk.
- S1 warnings should fire when deployable units improve while recovery debt or reserve strain also worsens.

Mechanic rule of thumb:

`usable_force = deployable_units - recovery_debt_penalty - personnel_shortfall_penalty`

## S2 Intelligence

CELERY doctrine: S2 bounds uncertainty and identifies dangerous assumptions.

Current mechanics:

- `staffMechanics.s2.externalEstimateConfidence`
- `staffMechanics.s2.visibility`
- `staffMechanics.s2.deceptionRisk`
- `strategic.intelligence.confidence`
- `strategic.intelligence.warningReliability`
- `strategic.intelligence.deceptionPressure`
- intelligence directorate burden

Required player behavior:

- S2 actions should not simply raise all numbers. They should improve confidence for specific decision classes: warning, industrial watch, counter-deception, or partner collection.
- The UI should separate `KNOWN`, `ESTIMATED`, and `RUMORED` facts.
- High-confidence but high-deception states should be dangerous, not reassuring.

Mechanic rule of thumb:

`decision_variance = base_variance - estimate_confidence + deception_risk + collection_gap`

## S3 Operations

CELERY doctrine: S3 converts intent into executable activity and synchronizes action across staff lanes.

Current mechanics:

- `staffMechanics.s3.visiblePosture`
- `staffMechanics.s3.executablePosture`
- `strategic.forceGeneration.trainingThroughput`
- `strategic.escalation.incidentLadder`
- operations and training directorate burden

Required player behavior:

- Visible posture should deter only when executable posture, warning reliability, and sustainment are credible enough.
- Exercises should increase visibility and learning while consuming S1 and S4 capacity.
- S3 overload should create shallow rehearsal, hollow readiness, and escalation risk.

Mechanic rule of thumb:

`credible_deterrence = min(visible_posture, executable_posture, sustainment_support, intelligence_confidence)`

## S4 Logistics

CELERY doctrine: S4 tests every plan against support reality.

Current mechanics:

- `staffMechanics.s4.stockpileDepth`
- `staffMechanics.s4.liftBurn`
- `strategic.sustainment.depotBacklog`
- `strategic.sustainment.munitionsSufficiency`
- `strategic.sustainment.fuelSufficiency`
- `strategic.sustainment.liftAvailability`
- external constraints: shipping, electronics, propellant
- sustainment directorate burden

Required player behavior:

- Logistics should be the main limiter on repeated S3 surge strategies.
- Stockpile depth should fall when visible posture, exercise tempo, or fires-heavy programs rise.
- Industrial and commercial constraints should turn S4 from a static score into a future-option system.

Mechanic rule of thumb:

`supportable_tempo = min(lift_availability, fuel_sufficiency, munitions_sufficiency, depot_capacity) - lift_burn`

## S5 Plans

CELERY doctrine: S5 preserves campaign coherence and future options.

Current mechanics:

- `staffMechanics.s5.strategicCoherence`
- `staffMechanics.s5.doctrineAlignment`
- `strategic.domestic.cabinetCover`
- `strategic.alliance.politicalAlignment`
- capability program phase/progress/blockers
- plans directorate burden

Required player behavior:

- S5 should reward repeated, coherent sequencing across posture, alliance messaging, and modernization.
- S5 should punish ad hoc action even when each individual turn looks locally successful.
- Programs should stall if they outrun S1 absorption, S3 training, S4 sustainment, or S2 confidence.

Mechanic rule of thumb:

`campaign_coherence = doctrine_alignment + alliance_alignment + political_cover - contradiction_penalty`

## Cross-Staff Interlocks

| Interlock | Design rule |
| --- | --- |
| S1-S3 | Operational tempo creates personnel debt unless training/recovery choices absorb it. |
| S2-S3 | Operations are more credible when warning and collection support the posture. |
| S3-S4 | Operations consume sustainment; S4 defines the ceiling for repeated tempo. |
| S4-S5 | Logistics reality should shape modernization and alliance promises. |
| S5-S1 | Strategy that ignores people creates delayed legitimacy and retention failure. |
| S2-S5 | Strategic plans should expose assumptions and create branches/sequels. |

## Implementation Backlog

| Priority | Work | Rationale |
| --- | --- | --- |
| P1 | Add accepted-risk fields to decision resolution. | The player should explicitly own the staff warning they override. |
| P1 | Surface known/estimated/rumored facts in memo previews. | S2 doctrine needs UI representation, not just a score. |
| P1 | Add contradiction tags to memo options. | S5 coherence needs traceable causes. |
| P2 | Add recovery-debt decay and retention events by repeated tempo pattern. | S1 consequences should compound over multiple months. |
| P2 | Add supportable-tempo preview derived from S4 constraints. | S4 should bound S3 visibly before commitment. |
| P2 | Add credible-deterrence score using S2/S3/S4 minimums. | Prevents visible posture from being a dominant strategy. |

## International Doctrine Mechanics

Doctrine source: [[../CELERY/international-doctrine-comparison]]
Evidence register: [[../CELERY/doctrine-proof-register]]
Mechanics roadmap: [[doctrine-mechanics-roadmap]]

POTATO should treat international doctrine as a faction-generation substrate. The player-facing staff model can remain S1-S5, while factions alter the weight, visibility, and failure modes of the same command problem.

| Doctrine pattern | POTATO mechanic | Likely faction trait |
| --- | --- | --- |
| NATO common J-structure | Low interoperability friction, clear liaison lanes, optional J6/J7/J8/J9 modules. | Coalition-native headquarters. |
| UK policy-aware joint HQ | Legal/media/policy constraints visible in staff forecasts. | Politically literate but scrutiny-sensitive staff. |
| Dutch function-process hybrid | Lower stovepipe penalty when cross-functional cells are funded; higher coordination load when too many cells run. | Adaptive staff culture. |
| Australian commander-centric planning | Faster decision preview and shorter planning cycles when commander attention is available. | Rapid guidance culture. |
| French operational joint command | Strong deployable HQ and expeditionary planning; budget/finance appears as active staff pressure. | Expeditionary planning culture. |
| Japanese joint staff adaptation | Strong plans/policy, C4, logistics/medical planning, and homeland-defense posture. | Resilient territorial-defense staff. |
| Chinese active-defense/system operations | Centralized political control, mobilization depth, civil-military integration, system attack/defense, and theater command. | Whole-of-state command culture. |

## Faction Variable Frame

Future faction definitions should be data-driven and should modify these variables rather than replacing the core S1-S5 readout contract.

```ts
type DoctrineProfile = {
  id: string;
  label: string;
  evidenceRefs: string[];
  interoperabilityBias: number;
  commanderCentrality: number;
  processFlexibility: number;
  politicalIntegration: number;
  mobilizationDepth: number;
  operationalTempoBias: number;
  futurePlanningBias: number;
  logisticsSystemDepth: number;
  informationSystemEmphasis: number;
  optionalStaffModules: Array<"J6" | "J7" | "J8" | "J9" | "STRATCOM" | "MED" | "ENGINEER">;
};
```

## Mechanic Guardrails

- Factions should be fictional composites, not direct country clones.
- Any faction trait derived from real doctrine needs at least one `evidenceRefs` entry linked to CELERY.
- Do not remove S1-S5 from the basic player contract unless the faction interface still answers endurance, uncertainty, execution, support, and coherence.
- Doctrine traits should create tradeoffs, not flat bonuses.
- International doctrine should first change burden routing, preview clarity, event triggers, and staff advice style before changing core victory math.

## Tactical Pattern Translation

Doctrine source: [[../CELERY/tactical-doctrine-patterns]]
Refinement method: [[../CELERY/adversarial-refinement-loop]]

Tactical concepts should enter POTATO as bounded staff mechanics. They should not become a universal bonus table. The player should feel a sharper staff argument: "this could work, but here is the lane that pays for it."

| Tactical pattern | POTATO variable | Positive effect | Counterweight |
| --- | --- | --- | --- |
| Objective | `campaignAimClarity` | Better S5 coherence and chief alignment. | Penalizes broad or contradictory memo selections. |
| Initiative/tempo | `relativeTempo` | Improves deterrence and event control when supported. | Raises S1 recovery debt, S4 burn, and S2 estimate risk. |
| Mass/main effort | `mainEffortFocus` | Improves selected program/posture payoff. | Raises neglected-lane risk and staff dissent. |
| Economy of force | `secondaryRiskAccepted` | Frees capacity for priority decisions. | Creates delayed events in under-resourced lanes. |
| Maneuver | `optionDislocation` | Reduces adversary probe confidence or improves deterrence without pure escalation. | Requires S2 confidence and S4 support. |
| Surprise/deception | `signatureControl` | Delays adversary response or lowers immediate pressure. | Raises coordination friction and public/alliance exposure if revealed. |
| Security | `exposureControl` | Reduces negative surprise and deception events. | Slows tempo and may reduce visible reassurance. |
| Simplicity | `orderClarity` | Lowers S3 execution penalty and training burden. | Limits complex multi-lane payoffs. |
| Culmination | `culminationRisk` | Warns before force/support exhaustion. | If ignored, converts soft debt into hard performance loss. |
| Reserve | `uncommittedCapacity` | Improves response to random events and crisis spikes. | Lowers immediate visible posture or program progress. |
| Combined arms/interdependence | `staffSynchronization` | Multiplies payoff when S1-S5 lanes are balanced. | Brittle if one staff function is overloaded. |

## GAN-Like Review Contract

Before adding a tactical mechanic:

1. Write the generator thesis in CELERY.
2. Add discriminator objections for evidence, exploit risk, and staff ownership.
3. Keep only the refiner's surviving rule.
4. Translate it into one POTATO variable, one positive effect, and one counterweight.
5. Add source links to `evidenceRefs`.

This keeps tactics argumentative, playable, and falsifiable. A lovely little engine of productive disagreement, which is exactly what a staff meeting ought to be when it is doing its job.

## Expansion Boundary

The detailed implementation plan now lives in [[doctrine-mechanics-roadmap]]. This note remains the conceptual bridge between S1-S5 and doctrine mechanics; the roadmap owns data shapes, resolution hooks, slices, and tests.
