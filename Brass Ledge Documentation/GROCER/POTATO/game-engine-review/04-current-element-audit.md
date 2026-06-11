---
type: game-engine-review-note
reviewed_on: 2026-06-06
area: element-audit
tags:
  - game-engine-review
  - audit
---

Backlink: [[POTATO]]


# Current Element Audit

## Scenario

Current scenario: Brass Ledger, Northern Frontier, 12 max turns, 6-turn micro-campaign. The scenario is coherent and focused: warning deterioration, reserve strain, sustainment limits, and political cover.

### Keep

- Single-theater focus.
- Monthly turn cadence.
- Required decision memos.
- Chiefs as institutional voices.
- External constraints as supply-chain pressure.

### Improve

- Add more event variety before expanding UI.
- Move capacities and thresholds into scenario data.
- Add explicit S1-S5 labels alongside internal directorate ids.

## Decision Memos

There are five memo categories:

- Operational Posture
- Intelligence Focus
- Sustainment Priority
- Alliance and Political Frame
- Force Development

### Audit

These map well to the staff game. The required memos create a strong monthly rhythm. The optional force-development memo gives the player one discretionary long-run lever.

### Improve

- Add explicit cost previews for each S1-S5 function.
- Add delayed consequence hints, not just immediate tradeoffs.
- Add "assumption risk" as a numeric or tagged object.

## Events

Events are currently tag-triggered with min/max turn windows and flags. This is a good design because it connects player behavior to scenario texture while preserving replay determinism.

### Improve

- Add event weights and cooldowns.
- Add more events with soft chains.
- Add event explainability: why this event became eligible.

## Chiefs

Chiefs currently have doctrine bias, temperament, competence, risk tolerance, preferred tags, concern tags, and trust. This is one of the strongest systems.

### Improve

- Add per-chief agenda memory.
- Add coalition behavior among chiefs.
- Add staff promises that chiefs remember across turns.
- Add role-specific warnings tied to S1-S5.

## Capability Programs

Programs currently progress by option pushes, staff burden, training throughput, confidence, and blockers.

### Improve

- Promote programs into the planned dual tech tree.
- Add prerequisites and external feasibility gates.
- Add visible "program truth" versus "program story" if intelligence confidence is low.

## External Constraints

Shipping, electronics, and propellant are excellent first constraints. They make the military problem feel grounded.

### Improve

- Tie each constraint to S4 and S5 presentation.
- Add trend history and forecast confidence.
- Add scenario events that reveal hidden fragility.

## Text Generation

The engine uses structured authored text and deterministic assembly for summaries, chiefs papers, after-action notes, and conversations.

### Keep

- Deterministic text from state and selections.
- Chief-specific voice libraries.
- Conversation stages.

### Improve

- Emit structured text objects with `purpose`, `speaker`, `causeRefs`, and `stateRefs`.
- Add prompt objects for external image generation.
- Keep prose generation separate from state mutation.

## Sprite Generation

The shared package generates SVG advisor portraits from deterministic portrait specs. This is excellent for a headless engine because sprites are reproducible and saveable.

### Improve

- Rename "portrait" output as "spriteSpec" when used by the engine.
- Add full-body or bust-frame variants.
- Add stable prompt text for bitmap generation.
- Store generated asset metadata separately from simulation state if external image generation is introduced.

## Browser UI Removal

The previous React interface has been replaced with a headless engine workbench:

- JSON engine output.
- Scenario contract dump.
- generated advisor sprite previews.
- default text-turn preview and resolution.

This keeps the browser useful for engine inspection without preserving the former game interface.
