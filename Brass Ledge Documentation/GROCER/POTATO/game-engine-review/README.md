---
type: game-engine-review-index
reviewed_on: 2026-06-06
project: Brass Ledger
status: complete
tags:
  - game-engine-review
  - obsidian/database
---

Backlink: [[POTATO]]


# Game Engine And Mechanics Review

This database reviews Brass Ledger as a game engine rather than a finished interface. It defines the core game, the unique selling point, the real-world and popular-game mechanical references, the S1-S5 staff model, the current implementation audit, and the future browser design system.

## Notes

- [[01-core-game-and-usp]]
- [[02-engine-and-mechanics-model]]
- [[03-s1-s5-function-audit]]
- [[04-current-element-audit]]
- [[05-browser-design-system]]
- [[06-recommendations-and-roadmap]]

## Query: Action Items

```dataview
TABLE priority, area, status
FROM "POTATO/game-engine-review"
WHERE type = "game-engine-action"
SORT priority ASC
```
