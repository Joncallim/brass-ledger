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

- Consolidate all Obsidian notes into [[../GROCER]].
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

Goals:

- Make S1-S5 burden the primary action economy.
- Add S1 recovery debt. Started: `staffMechanics.s1` tracks recovery debt and reserve predictability.
- Add S2 fog-of-war confidence/visibility. Started: `staffMechanics.s2` tracks external estimate confidence, visibility, and deception risk.
- Add S3 visible versus executable posture. Started: `staffMechanics.s3` tracks visible and executable posture separately.
- Add S4 stockpile/lift burn. Started: `staffMechanics.s4` tracks stockpile depth and lift burn.
- Add S5 strategic coherence and doctrine. Started: `staffMechanics.s5` tracks strategic coherence and doctrine alignment.

Exit criteria:

- Every decision option has S1-S5 costs and warnings.
- After-action explains outcomes by S-function. Started: after-action now includes an S1-S5 consequence note.
- No decision can bypass staff capacity.

## Stage 3: Dual Tech Tree And Industry Model

Goals:

- Implement internal capability nodes.
- Implement external industry nodes.
- Implement S2 estimates for external nodes.
- Link S4 constraints to external industry maturity.
- Link S5 plans to internal prerequisites and alliance feasibility.

Exit criteria:

- Tech tree can be simulated from CLI.
- Node changes emit explainability.
- Fog-of-war is deterministic under replay.

## Stage 4: Agent Chiefs And Negotiation

Goals:

- Chiefs maintain agenda memory.
- Chiefs form support/objection coalitions.
- Conversations create commitments and trust effects.
- Player can negotiate staff constraints before commit.

Exit criteria:

- Chief advice is mechanically tied to S1-S5 readouts.
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
