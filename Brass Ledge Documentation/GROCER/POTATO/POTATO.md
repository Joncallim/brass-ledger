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

POTATO is the game-engine and mechanics domain inside [[../GROCER]]. Design, engine, backend, sprite, S1-S5, and development-stage decisions should be recorded here before they are treated as settled.

## Operating Rule

Always consult this domain before changing game rules, interface direction, sprite logic, save format, or engine architecture. If implementation and POTATO disagree, POTATO should be updated deliberately or the implementation should be brought back into alignment.

## Core Index

- [[../REPOSITORIES|Repository frame]]
- [[game-engine-review/01-core-game-and-usp]]
- [[game-engine-review/02-engine-and-mechanics-model]]
- [[game-engine-review/03-s1-s5-function-audit]]
- [[s1-s5-mechanics-translation]]
- [[game-engine-review/04-current-element-audit]]
- [[game-engine-review/05-browser-design-system]]
- [[game-engine-review/06-recommendations-and-roadmap]]
- [[development-roadmap]]
- [[compiled-engine-roadmap]]
- [[roadmap-epics-and-issues]]
- [[s1-s5-user-interface-model]]
- [[plain-language-contract-follow-up]]
- [[doctrine-mechanics-roadmap]]
- [[detailed-dialogue-and-advisor-styles]]
- [[development-stages]]
- [[sprite-design-logic]]
- [[backend-review/review-summary]]

## Current Direction

Brass Ledger should become a compile-able, headless-first game engine with browser, CLI, and future native shells as presentation clients. The browser is no longer the source of truth. The engine is.

## Knowledge Repository Split

- [[../CELERY/CELERY]] owns military staff doctrine, staff behavior, and the human-readable strategy playbook.
- [[POTATO]] owns mechanics, engine contracts, balancing rules, and implementation-facing decisions.
- [[../CAPSICUM/README]] is framed for design language and visual systems.
- [[../CARROT/README]] is framed for scenario generation algorithms.

International doctrine now lives in [[../CELERY/international-doctrine-comparison]] with source proof in [[../CELERY/doctrine-proof-register]]. POTATO should use that material only as a mechanics substrate for fictional factions, not as direct real-world faction import.

## Dataview: Action Records

```dataview
TABLE priority, area, status
FROM "POTATO"
WHERE type = "game-engine-action" OR type = "backend-finding"
SORT priority ASC, severity ASC
```
