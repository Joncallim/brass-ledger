---
type: backend-component
component: simulation
package: packages/sim
role: deterministic turn resolution and replay validation
risk_level: medium
source:
  - packages/sim/src/index.ts
tags:
  - backend-review
  - component/simulation
---

Backlink: [[POTATO]]


# Simulation

The simulation package is the core backend game engine. It owns memo derivation, option validation, state deltas, burden penalties, event selection, program progression, trust updates, outcome scoring, previews, and replay validation.

## Strengths

- Deterministic RNG seed is derived from saved state and input shape.
- Turn resolution rejects wrong turn numbers and ended campaigns.
- Required memo selections are enforced.
- Replay hashes are derived from normalized previous state, input, and next state.

## Main Risks

- Closed: replay validation now reports mismatched input/history lengths instead of throwing: [[../findings/F-005-replay-validation-assumes-history-alignment]].
- Program progression can advance only one phase per turn even if progress exceeds 200; probably acceptable with current content, but worth documenting as an intentional balance rule.
- Several state values are duplicated between `strategic.*` and legacy top-level mirrors (`forceGeneration`, `intel`, etc.), so authoritative writes should keep those mirrors derived rather than client-supplied.

## Source Anchors

- Selection validation: `packages/sim/src/index.ts:100`
- Event eligibility/choice: `packages/sim/src/index.ts:276`
- Turn resolution: `packages/sim/src/index.ts:491`
- Replay hash: `packages/sim/src/index.ts:597`
- Replay validation: `packages/sim/src/index.ts:633`
