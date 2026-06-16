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

The S1-S5 core mechanic, Stage 3 tech/industry model, Stage 4 agent chiefs/negotiation layer, and Stage 5 content expansion are all implemented and covered by tests. The active engine pass is Stage 6: browser interface rebuild.

1. Give chiefs agenda memory across turns. Implemented: each chief now carries persistent focus tags, concern tags, last position, pressure, and notes from turn resolution and completed conversations.
2. Let chiefs form support/objection coalitions around memo options and staff constraints. Implemented: resolved and previewed turns now expose chief coalitions with support, conditional, objection, staff-constraint, and negotiation-lever fields.
3. Let conversations create replayable commitments and trust effects. Implemented: completed chief conversations update trust and create deterministic active commitments unless the commander closes by deferring.
4. Let the player negotiate staff constraints before committing a turn. Implemented: `TurnInput.staffNegotiations` applies bounded relief to a chosen directorate before resolution and charges an explicit political, readiness, or budget cost.
5. Tie chief advice to explicit S1-S5 readout evidence. Implemented: `ChiefPositionEntry.staffReadoutEvidence` records the S1-S5 metric and burden rationale, conversations/headless/workbench surfaces expose it, and replay validation covers completed conversations followed by turn resolution.

## Stage 5 Completion Notes

Stage 5 implemented balance instrumentation first, then content. Key findings from 100-campaign batch telemetry: plans overload (39%) is the primary realistic bottleneck; training overload was eliminated by fixing an optional-memo cycling bug in the batch runner; commitment breach rate (61%) is a cycling-policy artifact, not a player-facing balance problem. Content expanded to 32 events (6 arcs) and 5 memos with 4 posture options (including `tempo-hold`, the only zero-training-burden posture). No dominant options. Score distribution well-balanced. See [[development-stages]] Stage 5 section for full telemetry.

## Browser Rebuild Gate

All gate criteria are met. The Stage 6 rebuild can proceed.

- `staffFunctions` array with S1-S5 labels, current values, and `failureMode`. Implemented.
- `explainability` entries with causal references. Implemented.
- Advisor SVG portraits available in the session roster. Bitmap sprite pipeline is a Stage 7+ concern.
- Decision memo packets, chief coalitions, chief positions with S1-S5 readout evidence, negotiation candidates, and accepted-risk candidates are all available from the server API.
- Replay-safe save/import hardening implemented and covered by server integration tests.

See [[stage-6-gui-design]] for the full interface design.

## Long-Term USP Protection

Every new feature should pass this question:

Does it make deterrence, bureaucracy, legitimacy, or institutional sequencing more playable?

If not, it is probably a distraction from Brass Ledger's strongest identity.
