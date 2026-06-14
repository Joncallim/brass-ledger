---
type: game-engine-action
area: development-plan
status: active
priority: P1
tags:
  - POTATO
  - roadmap
---

# Development Stages

Backlink: [[POTATO]]

## Stage 0: Source Of Truth And Headless Direction

Status: active.

Goals:

- Consolidate all Obsidian notes into [[../GROCER/GROCER]].
- Treat GROCER as the vault source of truth and POTATO as the engine/mechanics domain.
- Keep browser UI reduced to an engine workbench.
- Add compiled CLI route.

Exit criteria:

- `apps/cli` builds and runs.
- GROCER contains architecture, S1-S5, sprite, doctrine, world, and design notes.
- Browser is no longer the main game interface.

## Stage 1: Engine Contract Stabilization

Goals:

- Define `StaffFunctionReadout`. Implemented: shared schema and helper now emit S1-S5 readouts from scenario-owned staff function definitions.
- Emit S1-S5 readouts from scenario/session payloads and turn previews. Implemented: server session payloads, preview/resolve results, and CLI headless summaries expose `staffFunctions`.
- Add explainability entries to every turn result. Implemented: `TurnResult.explainability` now includes decision packet, staff capacity, state movement, and event causal references.
- Canonicalize save validation around replay.
- Move staff capacities and thresholds into content data. Implemented: scenario `staffCapacities` owns directorate capacity, strain, and overload thresholds.

Exit criteria:

- CLI can run a campaign and output S1-S5 consequences. Implemented for headless turn summaries and final session output.
- Tests cover each S1-S5 function. Implemented for readout emission; deeper per-function mechanics remain Stage 2 work.
- Save/replay hardening findings from [[backend-review/review-summary]] are addressed.

## Stage 2: S1-S5 Core Mechanic

Status: complete.

Goals:

- Make S1-S5 burden the primary action economy.
- Add S1 recovery debt. Implemented: `staffMechanics.s1` tracks recovery debt and reserve predictability with natural decay, retention-pressure compounding, and per-turn after-action warnings.
- Add S2 fog-of-war confidence/visibility. Implemented: `staffMechanics.s2` tracks external estimate confidence, visibility class (RUMORED/ESTIMATED/KNOWN), and deception risk including dangerous-precision penalty.
- Add S3 visible versus executable posture. Implemented: `staffMechanics.s3` tracks visible and executable posture separately; credible deterrence is bounded by the minimum of visible, executable, sustainment support, and S2 estimate confidence.
- Add S4 stockpile/lift burn. Implemented: `staffMechanics.s4` tracks stockpile depth, lift burn, and supportable tempo derived from live sustainment state.
- Add S5 strategic coherence and doctrine. Implemented: `staffMechanics.s5` tracks strategic coherence and doctrine alignment; commitment entries (alliance, program, cabinet, doctrine) are created from tags and resolved as fulfilled or broken across turns. High S2 deception risk (>60) now directly penalises S5 coherence via contradiction logic.

Exit criteria:

- Every decision option has S1-S5 costs and warnings. Met: all memo options carry directorate burden arrays that drive S1-S5 mechanic updates; warnings surface through `previewTurn` accepted-risk candidates and after-action headings.
- After-action explains outcomes by S-function. Met: after-action includes S1-S5 consequences note, S1 personnel warning, S3 posture warning, S4 support warning, S5 doctrine-bet, and accepted-risk summary.
- No decision can bypass staff capacity. Met: `previewTurn` exposes accepted-risk candidates for every staff warning; `resolveTurn` requires explicit `acceptedRiskOverrides` to record acknowledged bypasses and surfaces them in after-action output.

Cross-staff interlocks covered:

- S1→S3: after-action warns when deployable units improve but recovery debt worsens.
- S2→S3: low estimate confidence caps credible deterrence.
- S2→S5: deception risk above 60 degrades strategic coherence.
- S3→S4: visible posture exercises increase lift burn.
- S4→S5: programs are blocked by lift-burn saturation.
- S5→S1: reserve-rebuild is blocked by critical recovery debt.

Test coverage: 40 engine tests and 12 server integration tests; all cross-staff interlocks, boundary values, fog-of-war determinism, commitment fulfillment/breaking, and terminal-campaign replay are covered.

## Stage 3: Dual Tech Tree And Industry Model

Status: complete.

Goals:

- Implement internal capability nodes that progress through phases (concept → prototype → fielded) driven by program pushes and staff absorb capacity.
- Implement external industry nodes (shipping-market, electronics-chain, propellant-market) with maturity scores that constrain S4 stockpile depth and S2 collection options.
- Implement S2 estimates for external nodes: each node carries a confidence class (RUMORED/ESTIMATED/KNOWN) derived from collection tags and deception pressure.
- Link S4 constraints to external industry maturity: when electronics-chain or propellant-market degrade, stockpile depth and supportable tempo inherit penalties.
- Link S5 plans to internal prerequisites and alliance feasibility: commitment fulfillment checks should include whether prerequisite programs are fielded before new ones are committed.
- Expose tech-tree and industry state in `TurnResult` so headless CLI can report capability progress and constraint degradation.

What's done:

- `internalTech` nodes computed each turn from program phase (concept/funded = level 0, procured/integrated = level 1, trained/operational = level 2). Populated in `TurnResult` and in session state.
- `externalTech` nodes derived each turn from external constraint severity (≥65 = disrupted level 0, 35–64 = constrained level 1, <35 = reliable level 2). Each node carries an S2 estimate with confidence/visibility/lastVerifiedTurn.
- S2 estimate confidence on external nodes improves with `industrial-watch` (+8) or `collection` (+3) tags and decays with S2 deception risk (×0.06/turn). Under RUMORED visibility with elevated deception risk, estimatedLevel is optimistically biased (adversary manipulation).
- S4 stockpile depth penalty: propellant-market disrupted −6, electronics-chain disrupted −4.
- S4 lift burn penalty: shipping-market disrupted +5.
- "Tech tree and industry" explainability entry in every `TurnResult` with causal refs for all nodes.
- After-action notes for industry level degradation/recovery and program milestone advances.
- CLI per-turn summaries include internalTech levels/progress and externalTech estimated levels/confidence.
- Initial tech/industry state seeded in scenario `initialState`.
- 8 new engine tests covering: node population, visibility classes, confidence gain/decay, S4 industry penalties, explainability coverage, replay determinism.

Exit criteria:

- Tech tree can be simulated from CLI: `apps/cli` headless run emits program phase and external constraint state per turn, plus final session-level tech-tree summary.
- Node changes emit explainability: internal phase transitions and external maturity shifts appear in `TurnResult.explainability`. Met: "Tech tree and industry" entry in every turn result; level-change after-action notes fire when levels shift.
- Fog-of-war is deterministic under replay: external industry estimates with S2 confidence class replay identically under `validateReplaySession`.
- S5 prerequisite link is enforced: program commitments require at least one fielded level-2 internal tech node before fulfillment.
- Scenario-specific industry event connections are traceable: events with `constraintShifts` emit `industry:{constraintId}/delta:{value}` causal refs.

## Stage 4: Agent Chiefs And Negotiation

Status: started.

Goals:

- Chiefs maintain agenda memory. Started: turn resolution and completed chief conversations persist per-chief focus tags, concern tags, prior position, pressure, and notes; future chief advice uses that memory as a bounded bias.
- Chiefs form support/objection coalitions.
- Conversations create commitments and trust effects.
- Player can negotiate staff constraints before commit.

Exit criteria:

- Chief advice is mechanically tied to S1-S5 readouts and persistent chief agenda memory.
- Commitments can be fulfilled or broken in later turns.
- Conversation state remains replayable.

## Stage 5: Content Expansion And Balance

Goals:

- Expand events from 6 to 30-50.
- Add more memo variants.
- Add scenario balancing telemetry.
- Add dominant-strategy detection from CLI batch runs.

Exit criteria:

- 1000 headless campaigns can run without replay drift.
- No simple default policy dominates.
- Multiple win paths are viable.

## Stage 6: Browser Interface Rebuild

Goals:

- Rebuild the browser around [[s1-s5-user-interface-model]].
- Use [[game-engine-review/05-browser-design-system]].
- Keep UI as a client of engine contracts.

Exit criteria:

- Browser consumes `StaffFunctionReadout`, `decisionPackets`, `spriteSpecs`, and `explainability`.
- No browser-only rule logic.

## Stage 7: Packaged Game

Goals:

- Package the compiled engine with a desktop or native shell.
- Support offline saves.
- Support replay export/import.
- Optionally add local image-generation pipeline hooks.

Exit criteria:

- Game can run without a dev server.
- Save/replay is stable.
- Release build has no dependency on Vite dev workflows.
