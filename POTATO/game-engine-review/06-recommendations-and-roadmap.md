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
2. Rename or document the internal six-directorate model so S1-S5 stays the player-facing structure.
3. Move staff capacities, event weights, and program thresholds into scenario data.
4. Add explicit explainability entries to `TurnResult`.
5. Add tests for every S1-S5 metric boundary and cross-system interaction.

## Next Engine Pass

1. Implement S2 fog-of-war for external industry estimates.
2. Promote capability programs into internal/external tech node structures.
3. Add S1 personnel debt and recovery mechanics.
4. Add S4 stockpile/lift burn mechanics.
5. Add S5 doctrine/alliance commitments.

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
