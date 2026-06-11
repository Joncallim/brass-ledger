---
type: game-engine-action
reviewed_on: 2026-06-06
priority: P1
area: roadmap
status: open
tags:
  - game-engine-review
  - roadmap
---

Backlink: [[POTATO]]


# Recommendations And Roadmap

## Immediate

1. Keep the browser in engine-workbench mode until the rules are stable.
2. Rename or document the internal six-directorate model so S1-S5 stays the player-facing structure. Current implementation keeps six internal directorates and exposes S1-S5 through `StaffFunctionReadout`, with Training folded into S3 Operations.
3. Move staff capacities, event weights, and program thresholds into scenario data. Staff capacities and thresholds are now in content data; event weights and program thresholds remain future tuning work.
4. Add explicit explainability entries to `TurnResult`. Implemented for decision packet, staff capacity, state movement, and events.
5. Add tests for every S1-S5 metric boundary and cross-system interaction. Initial S1-S5 readout tests exist; boundary/cross-system tests should deepen during Stage 2 mechanics.

## Next Engine Pass

1. Implement S2 fog-of-war for external industry estimates. Started with external estimate confidence, visibility, and deception risk in `staffMechanics.s2`.
2. Promote capability programs into internal/external tech node structures.
3. Add S1 personnel debt and recovery mechanics. Started with deterministic recovery debt and reserve predictability updates.
4. Add S4 stockpile/lift burn mechanics. Started with deterministic stockpile depth and lift burn updates.
5. Add S5 doctrine/alliance commitments. Started with strategic coherence and doctrine alignment; commitments remain future work.

## Browser Rebuild Gate

Do not rebuild the full interface until these engine contracts exist:

- `staffFunctions` array with S1-S5 labels and current values.
- `explainability` entries with causal references.
- `spriteSpecs` or `assetPrompts` for generated images.
- `availableActions` or `decisionPackets` that are already presentation-ready.
- replay-safe save/import hardening from the backend review.

## Long-Term USP Protection

Every new feature should pass this question:

Does it make deterrence, bureaucracy, legitimacy, or institutional sequencing more playable?

If not, it is probably a distraction from Brass Ledger's strongest identity.
