---
type: celery-debate-library
area: adversarial-refinement
status: active
tags:
  - CELERY
  - debate
  - doctrine
  - mechanics
---

# Adversarial Debate Library

Backlink: [[CELERY]]

## Purpose

This library records doctrine arguments that have already been through the Generator, Discriminator, Refiner, Integrator loop. Use it as a pattern source when expanding POTATO or building fictional factions.

## Debate: Tempo

Generator: A high-tempo force should dominate because it acts inside the adversary's decision cycle.

Discriminator: Tempo is not magic. MCDP 1 supports tempo as part of maneuver warfare, but sustainment doctrine and tactical doctrine both imply limits. If tempo ignores people, support, uncertainty, and political story, it creates early culmination.

Surviving rule: Tempo is a multiplier only while S1, S2, S3, S4, and S5 can still absorb it.

POTATO translation: `relativeTempo` increases deterrence only when `supportableTempo`, `executablePosture`, and `estimateConfidence` are above threshold. Repeated tempo raises `culminationRisk`.

Evidence: [[doctrine-proof-register#USMC MCDP 1 Maneuver Warfare]], [[doctrine-proof-register#US Army ADP 4-0 Sustainment]]

## Debate: Main Effort

Generator: The player should always focus all staff capacity on one decisive effort.

Discriminator: Main effort is useful, but permanent concentration makes secondary lanes meaningless. Economy of force means accepting risk, not erasing it.

Surviving rule: Main effort improves selected payoff while creating traceable secondary risk.

POTATO translation: `mainEffortFocus` boosts one memo/program lane and writes `secondaryRiskAccepted` entries for neglected staff functions.

Evidence: [[doctrine-proof-register#US Army ADP 3-90 Tactical Fundamentals]], [[doctrine-proof-register#US Joint JP 5-0 Joint Planning]]

## Debate: Deception

Generator: Deception should let the player get more effect for less cost.

Discriminator: Deception needs planning, signatures, timing, and coordination. It can deceive the commander too. It also carries political and alliance risk if exposed.

Surviving rule: Deception trades near-term adversary uncertainty for coordination friction and exposure risk.

POTATO translation: `signatureControl` can reduce adversary response, but `deceptionPlanFriction` increases staff burden and `exposurePenalty` can trigger S5/ally damage.

Evidence: [[doctrine-proof-register#USMC MCDP 1 Maneuver Warfare]], [[doctrine-proof-register#Australia Planning Update]]

## Debate: Sustainment

Generator: Logistics should be a constraint only when the player chooses operations-heavy actions.

Discriminator: Sustainment shapes all freedom of action, not just obvious movement. ADP 4-0 ties sustainment to endurance, reach, and freedom of action.

Surviving rule: Sustainment is a strategic option generator, not just a penalty pool.

POTATO translation: Strong S4 increases future menu breadth, event resilience, and operational reach. Weak S4 caps S3 posture even when readiness looks high.

Evidence: [[doctrine-proof-register#US Army ADP 4-0 Sustainment]], [[doctrine-proof-register#Sustainment Warfighting Function Elements]]

## Debate: Mission Command

Generator: Mission command should reduce planning burden and improve speed.

Discriminator: Decentralized execution depends on clear intent, subordinate competence, trust, and shared understanding. Otherwise it becomes incoherence with a nicer name.

Surviving rule: Mission command compresses planning only when intent clarity and trust are high.

POTATO translation: `planningCompression` lowers S3/S5 burden if `commanderIntentClarity` and chief trust pass threshold; otherwise it increases `handoffFriction`.

Evidence: [[doctrine-proof-register#Australia Planning Update]], [[doctrine-proof-register#Netherlands Chief Of Staff Role]]

## Debate: Coalition Interoperability

Generator: NATO-like factions should simply get alliance bonuses.

Discriminator: Interoperability reduces some friction, but coalition command creates legal, policy, liaison, media, and caveat costs.

Surviving rule: Coalition-native doctrine improves partner synchronization while increasing visible policy and consent constraints.

POTATO translation: Increase alliance execution reliability and reduce liaison burden; add J9/policy and legal/media friction for high-visibility actions.

Evidence: [[doctrine-proof-register#NATO AJP-3 Staff Directorate Baseline]], [[doctrine-proof-register#UK PJHQ Staff Responsibilities]]

## Debate: Whole-Of-State Mobilization

Generator: Whole-of-state mobilization should provide more manpower and industry.

Discriminator: Mobilization also raises political control, public burden, industry distortion, and legitimacy risk. It should change the state relationship, not just add resources.

Surviving rule: Mobilization depth converts civilian capacity into strategic depth at the cost of political rigidity and public burden.

POTATO translation: `mobilizationDepth` improves reserve and industrial conversion but raises `publicBurden`, `politicalControlLoad`, and international concern.

Evidence: [[doctrine-proof-register#China Mobilization And Civil-Military Integration]], [[doctrine-proof-register#US Army ADP 4-0 Sustainment]]

## Debate: System Operations

Generator: System warfare should let a faction disable enemy capability without matching force levels.

Discriminator: System language is easily abused. It must require intelligence, C2, specialist capacity, and vulnerability mapping.

Surviving rule: System operations are powerful against identified dependencies but fragile under poor intelligence and weak C2.

POTATO translation: `systemPressure` requires S2 estimate quality and optional J6/C2 capacity; failures create blowback, mis-targeting, or revealed signatures.

Evidence: [[doctrine-proof-register#China System Operations And Theater Command]], [[doctrine-proof-register#US Army ADP 3-0 Operations]]

## Debate: Simplicity

Generator: Simple plans should always be better because they are easier to execute.

Discriminator: Simplicity improves execution, but some campaigns require multi-lane coordination. The right tradeoff is clarity vs payoff breadth.

Surviving rule: Simplicity reduces handoff friction but caps multi-system upside.

POTATO translation: `orderClarity` lowers execution penalties; `complexityLoad` enables larger multi-lane effects at higher staff risk.

Evidence: [[doctrine-proof-register#US Army ADP 3-90 Tactical Fundamentals]], [[doctrine-proof-register#Netherlands Chief Of Staff Role]]

## Debate: Reserve

Generator: Reserve should be punished because unused capacity means less immediate progress.

Discriminator: Reserve is precisely what lets commanders exploit, recover, and absorb uncertainty. It must be valuable in a game with events and fog.

Surviving rule: Reserve lowers immediate output but increases resilience and opportunity capture.

POTATO translation: `uncommittedCapacity` improves crisis event mitigation, surprise response, and next-turn option quality.

Evidence: [[doctrine-proof-register#US Joint JP 3-0 Joint Campaigns And Operations]], [[doctrine-proof-register#US Joint JP 5-0 Joint Planning]]
