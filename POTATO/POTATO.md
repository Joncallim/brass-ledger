---
type: source-of-truth
project: Brass Ledger
status: active
created_on: 2026-06-06
tags:
  - POTATO
  - source-of-truth
---

# POTATO

This folder is the source of truth for Brass Ledger. Design, engine, backend, sprite, S1-S5, and development-stage decisions should be recorded here before they are treated as settled.

## Operating Rule

Always consult this database before changing game rules, interface direction, sprite logic, save format, or engine architecture. If implementation and POTATO disagree, POTATO should be updated deliberately or the implementation should be brought back into alignment.

## Core Index

- [[game-engine-review/01-core-game-and-usp]]
- [[game-engine-review/02-engine-and-mechanics-model]]
- [[game-engine-review/03-s1-s5-function-audit]]
- [[game-engine-review/04-current-element-audit]]
- [[game-engine-review/05-browser-design-system]]
- [[game-engine-review/06-recommendations-and-roadmap]]
- [[compiled-engine-roadmap]]
- [[s1-s5-user-interface-model]]
- [[development-stages]]
- [[sprite-design-logic]]
- [[backend-review/review-summary]]

## Current Direction

Brass Ledger should become a compile-able, headless-first game engine with browser, CLI, and future native shells as presentation clients. The browser is no longer the source of truth. The engine is.

## Dataview: Action Records

```dataview
TABLE priority, area, status
FROM "POTATO"
WHERE type = "game-engine-action" OR type = "backend-finding"
SORT priority ASC, severity ASC
```
