---
type: game-engine-review-note
reviewed_on: 2026-06-06
area: design-system
tags:
  - game-engine-review
  - design-system
---

Backlink: [[POTATO]]


# Browser Design System

This is the design system for the future browser interface. It is intentionally not implemented as the current UI, because the current request removes the existing game interface and leaves the browser as a headless engine workbench.

## Product Feel

The interface should feel like a serious staff notebook and command brief, not a sci-fi dashboard. It should be dense, legible, restrained, and practical. The player is reading, comparing, and deciding under pressure.

## Core Screens

| Screen | Purpose | Primary user action |
| --- | --- | --- |
| Briefing | Understand the month's strategic situation. | Identify constraints and risks. |
| S1-S5 Staff Board | Compare institutional capacity and warnings. | See what each staff function can absorb. |
| Decision Memos | Select courses of action. | Commit guidance for required/optional memos. |
| Chiefs Paper | Read support, opposition, and conditions. | Adjust before committing. |
| Resolve / After Action | Understand consequences and causal drivers. | Learn and prepare next month. |
| Records | Export, validate, replay, and inspect saves. | Preserve campaign continuity. |

## Information Hierarchy

1. Month and status.
2. Objective risk.
3. S1-S5 capacity.
4. Active memo and choices.
5. Forecast and chief objections.
6. After-action causality.
7. Archive/admin tools.

## Layout Rules

- Use an application shell, not a landing page.
- Use one primary work area with a compact staff/status rail.
- Avoid card grids that make every item feel equally important.
- Use tables for records and ledgers.
- Use expandable detail sections for causal explanations.
- Keep sprite portraits small and functional, never decorative.

## Visual Language

| Token | Recommendation |
| --- | --- |
| Background | Warm off-white or muted dark paper depending on mode. |
| Text | High-contrast neutral, no low-contrast gray-blue wash. |
| Accent | Brass/olive for command, muted red for escalation, green for recovery, blue for intelligence. |
| Radius | 4px to 8px. |
| Borders | Thin, visible, practical. |
| Shadows | Rare; use borders first. |
| Type | System sans for UI, monospace only for logs/data. |
| Motion | Minimal; only state transitions and loading. |

## S1-S5 Presentation

Each staff function should have a consistent block:

- current read
- capacity this month
- burden accepted by selected guidance
- failure mode
- chief warning
- next-month consequence

Recommended labels:

- S1 Personnel: endurance
- S2 Intelligence: confidence
- S3 Operations: posture
- S4 Logistics: support
- S5 Plans: coherence

## Interaction Patterns

- Memos use radio groups for mutually exclusive courses of action.
- Optional memos use toggles plus radio groups.
- S1-S5 staff warnings use compact severity badges.
- Explainability uses "Why changed?" disclosure rows.
- Records use a table with explicit load/export/delete actions.
- Chief conversations use a side sheet only when the player chooses to talk; they should not interrupt the main decision flow.

## Sprite Use

Advisor sprites should serve memory and role recognition:

- show beside chief name and S-function
- keep consistent crop and size
- avoid large portrait galleries in core decision flow
- use generated bitmap variants only after the deterministic sprite spec is stable

## Copy Rules

- Prefer staff language: "burden", "warning", "supportable", "assumption", "constraint".
- Avoid motivational or marketing copy.
- Do not narrate the UI to the player.
- Use concise sentences that support decisions.

## Accessibility Rules

- Keyboard reachable memo selection and commit flow.
- No color-only status.
- Plain-language text alternatives for sprites.
- Tables with real headers.
- Dialogues as side panels with focus management.
