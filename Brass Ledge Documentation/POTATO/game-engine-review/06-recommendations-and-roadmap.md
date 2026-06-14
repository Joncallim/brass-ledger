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

The S1-S5 core mechanic and Stage 3 tech/industry model are implemented and covered by engine tests. Stage 4 agent chiefs and negotiation is implemented enough to use, but it needs one hardening pass before the roadmap should move to Stage 5 content and balance.

1. Give chiefs agenda memory across turns. Implemented: each chief now carries persistent focus tags, concern tags, last position, pressure, and notes from turn resolution and completed conversations.
2. Let chiefs form support/objection coalitions around memo options and staff constraints. Implemented: resolved and previewed turns now expose chief coalitions with support, conditional, objection, staff-constraint, and negotiation-lever fields.
3. Let conversations create replayable commitments and trust effects. Implemented: completed chief conversations update trust and create deterministic active commitments unless the commander closes by deferring.
4. Let the player negotiate staff constraints before committing a turn. Implemented: `TurnInput.staffNegotiations` applies bounded relief to a chosen directorate before resolution and charges an explicit political, readiness, or budget cost.
5. Tie chief advice to explicit S1-S5 readout evidence. Next PR: add structured per-chief staff evidence to `ChiefPositionEntry`, show it in conversations and headless/workbench summaries, and test conversation state plus subsequent turn replay.

## Stage 5 Adjustment

Stage 5 should start with balance instrumentation, not raw content volume. The next content PR should first add headless batch telemetry for outcome distribution, staff overload frequency, accepted-risk acknowledgements, staff negotiation use, commitment fulfillment/breach, and selected-option frequency. After that baseline exists, expand events and memo variants against measured gaps instead of adding content blind.

The Stage 5 plan should also add content validation for chief preferred/concern tags against memo option tags. The current content validator catches duplicate chiefs, memos, options, events, and staff-capacity coverage, but tag drift can still silently weaken chief positions and coalition behavior as the content set grows.

## Browser Rebuild Gate

Do not rebuild the full interface until these engine contracts exist:

- `staffFunctions` array with S1-S5 labels and current values. Implemented.
- `explainability` entries with causal references. Implemented.
- `spriteSpecs` or `assetPrompts` for generated images. Advisor SVG payloads are available through CLI output; broader asset prompts remain future work.
- `availableActions` or `decisionPackets` that are already presentation-ready. Memo packets exist; Stage 4 negotiation and coalition contracts are now usable, but chief-position staff evidence should be added before a full browser rebuild.
- replay-safe save/import hardening from the backend review. Implemented.

## Long-Term USP Protection

Every new feature should pass this question:

Does it make deterrence, bureaucracy, legitimacy, or institutional sequencing more playable?

If not, it is probably a distraction from Brass Ledger's strongest identity.
