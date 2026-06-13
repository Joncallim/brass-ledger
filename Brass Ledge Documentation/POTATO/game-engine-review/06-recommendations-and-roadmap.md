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

The S1-S5 core mechanic and Stage 3 tech/industry model are implemented and covered by engine tests. The next engine pass is Stage 4: agent chiefs and negotiation.

1. Give chiefs agenda memory across turns.
2. Let chiefs form support/objection coalitions around memo options and staff constraints.
3. Let conversations create replayable commitments and trust effects.
4. Let the player negotiate staff constraints before committing a turn.

## Browser Rebuild Gate

Do not rebuild the full interface until these engine contracts exist:

- `staffFunctions` array with S1-S5 labels and current values. Implemented.
- `explainability` entries with causal references. Implemented.
- `spriteSpecs` or `assetPrompts` for generated images. Advisor SVG payloads are available through CLI output; broader asset prompts remain future work.
- `availableActions` or `decisionPackets` that are already presentation-ready. Memo packets exist; Stage 4 negotiation should stabilize the next contract.
- replay-safe save/import hardening from the backend review. Implemented.

## Long-Term USP Protection

Every new feature should pass this question:

Does it make deterrence, bureaucracy, legitimacy, or institutional sequencing more playable?

If not, it is probably a distraction from Brass Ledger's strongest identity.
