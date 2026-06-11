# Brass Ledger — Technical Approach

## 1. Architecture
- Frontend: React + TypeScript + Tailwind.
- Backend: Node.js + TypeScript (NestJS/Fastify), server-authoritative simulation.
- Data: PostgreSQL (state + event log), Redis (queues/cache), WebSocket for turn sync.
- Infra: Docker, CI/CD, environment-based config and feature flags.

## 2. Engineering Principles
1. Deterministic resolution (seeded RNG logged per turn).
2. Event-sourced simulation (every action/outcome replayable).
3. Data-driven balancing (tables/config, not hardcoded constants).
4. Safe iteration (feature flags + migration-safe schemas).

## 3. Key Services
- Turn Engine Service
- Economy/Budget Service
- Tech Tree Service (internal + external + fog-of-war)
- Agent AI Service
- Event Orchestrator
- Diplomacy/Alliance Service
- Telemetry and Analytics Service

## 4. Data Model (Core Entities)
- GameSession, Turn, Player, Portfolio
- ActionOrder, ResolutionStep, EventCard
- InternalTechNode, ExternalTechNode
- NodeDependency, NodeStateHistory
- SubordinateAgent, AgentRelationship
- GeopoliticalState, IndustrySectorState

## 5. Testing & Hardening Strategy
- Unit tests for formulas and unlock rules.
- Property-based tests for resource conservation and bounds.
- Determinism tests (same seed => same replay hash).
- Soak tests with many AI-only campaigns.
- Exploit tests for dominant-loop detection.
- Load tests for concurrent sessions.

## 6. Milestones
1. Vertical slice: one role + one tree + one event family.
2. Alpha: full turn loop + dynamic trees + AI subordinates.
3. Closed beta: multiplayer, telemetry dashboards, balance pipeline.
4. Public beta gate: crash-free, no dominant strategy >55% winrate.
