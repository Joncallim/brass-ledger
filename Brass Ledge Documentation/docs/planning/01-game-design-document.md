# Brass Ledger — Game Design Document (GDD)

## 1. Vision
Brass Ledger is a multiplayer browser-based strategic leadership simulator where players run Joint Staff-style portfolios and pursue strategic outcomes under budget, political, alliance, and escalation pressure. Success is not purely warfighting; deterrence, stability, and institutional performance are equally valid win paths.

## 2. Design Pillars
1. Deterrence over destruction.
2. Bureaucracy and people are core gameplay systems.
3. Decisions have delayed and compounding consequences.
4. Subordinates behave like intelligent, agenda-driven actors.
5. Information is uncertain; players must act under ambiguity.

## 3. Roles (Portfolio Model)
- S1 Personnel: recruiting, retention, force quality.
- S2 Intelligence: threat estimation, confidence, counter-deception.
- S3 Operations: readiness posture, deployments, exercise tempo.
- S4 Logistics: sustainment, stockpiles, transport and repair capacity.
- S5 Plans: doctrine, long-horizon capability and alliance strategy.

## 4. Core Turn Loop (Monthly)
1. Briefing: geopolitics, budget, readiness, alliance signals.
2. Deliberation: player plans + subordinate recommendations.
3. Commit: action selection with AP and budget constraints.
4. Resolve: deterministic server simulation + seeded stochastic events.
5. Review: KPI changes with causal explanation.
6. Negotiation: coalition trades, commitments, and influence plays.

## 5. Resources
Primary: Budget Authority, Readiness, Political Capital, Alliance Cohesion, Public Legitimacy, Escalation Pressure.
Secondary/hidden: Bureaucratic Friction, Leak Risk, Adversary Miscalculation Index.

## 6. Dynamic Technology System
### 6.1 Internal Technology Tree
Represents internal institutional capability: doctrine, integration, training maturity, procurement execution, software/C2, and sustainment proficiency.

### 6.2 External Industry Technology Tree
Represents domestic/nearby industrial capacity: manufacturing depth, workforce, supplier resilience, R&D output, surge capacity, sanctions exposure.

### 6.3 Fog-of-War on External Tree
External nodes expose:
- Visibility state: Known / Estimated / Rumored
- Confidence score (0–100)
- Last-verified turn

S2 actions and intelligence investments improve confidence and discovery rates.

### 6.4 Interaction Rules
Internal unlocks require:
1) Internal prerequisites,
2) External industrial feasibility,
3) Geopolitical feasibility.

Result: player choices and world events co-evolve both trees and can create bottlenecks, shortcuts, or strategic dead ends.

## 7. Subordinate AI
Each subordinate has traits (competence, ambition, loyalty, risk tolerance), doctrine bias, relationship graph, and career incentives.

Behavior goals:
- Recommend/oppose plans,
- Push preferred initiatives,
- Form coalitions,
- React to player consistency and outcomes.

## 8. Multiplayer Modes
- Cabinet Co-op (2–5): one nation, split portfolios.
- Competitive Parallel (2–4 nations): diplomacy and strategic signaling.

## 9. Win / Loss Conditions
Win paths: strategic stability, deterrence without major war, modernization under budget, high alliance credibility.
Loss paths: uncontrolled escalation, fiscal collapse, legitimacy collapse, alliance fracture.

## 10. MVP Scope (12-turn campaign)
- One theater,
- 5 portfolios,
- Dynamic dual tech trees,
- 30–50 events,
- Cabinet co-op mode,
- Deterministic replay + telemetry.
